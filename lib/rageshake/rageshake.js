"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IndexedDBLogStore = exports.ConsoleLogger = void 0;
exports.cleanup = cleanup;
exports.flush = flush;
exports.getLogsForReport = getLogsForReport;
exports.init = init;
exports.tryInitStorage = tryInitStorage;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _logger = require("matrix-js-sdk/src/logger");

var _randomstring = require("matrix-js-sdk/src/randomstring");

var _JSON = require("../utils/JSON");

/*
Copyright 2017 OpenMarket Ltd
Copyright 2018 New Vector Ltd
Copyright 2019 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
// This module contains all the code needed to log the console, persist it to
// disk and submit bug reports. Rationale is as follows:
//  - Monkey-patching the console is preferable to having a log library because
//    we can catch logs by other libraries more easily, without having to all
//    depend on the same log framework / pass the logger around.
//  - We use IndexedDB to persists logs because it has generous disk space
//    limits compared to local storage. IndexedDB does not work in incognito
//    mode, in which case this module will not be able to write logs to disk.
//    However, the logs will still be stored in-memory, so can still be
//    submitted in a bug report should the user wish to: we can also store more
//    logs in-memory than in local storage, which does work in incognito mode.
//    We also need to handle the case where there are 2+ tabs. Each JS runtime
//    generates a random string which serves as the "ID" for that tab/session.
//    These IDs are stored along with the log lines.
//  - Bug reports are sent as a POST over HTTPS: it purposefully does not use
//    Matrix as bug reports may be made when Matrix is not responsive (which may
//    be the cause of the bug). We send the most recent N MB of UTF-8 log data,
//    starting with the most recent, which we know because the "ID"s are
//    actually timestamps. We then purge the remaining logs. We also do this
//    purge on startup to prevent logs from accumulating.
// the frequency with which we flush to indexeddb
const FLUSH_RATE_MS = 30 * 1000; // the length of log data we keep in indexeddb (and include in the reports)

const MAX_LOG_SIZE = 1024 * 1024 * 5; // 5 MB

// A class which monkey-patches the global console and stores log lines.
class ConsoleLogger {
  constructor() {
    (0, _defineProperty2.default)(this, "logs", "");
    (0, _defineProperty2.default)(this, "originalFunctions", {});
  }

  monkeyPatch(consoleObj) {
    var _this = this;

    // Monkey-patch console logging
    const consoleFunctionsToLevels = {
      log: "I",
      info: "I",
      warn: "W",
      error: "E"
    };
    Object.keys(consoleFunctionsToLevels).forEach(fnName => {
      const level = consoleFunctionsToLevels[fnName];
      const originalFn = consoleObj[fnName].bind(consoleObj);
      this.originalFunctions[fnName] = originalFn;

      consoleObj[fnName] = function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        _this.log(level, ...args);

        originalFn(...args);
      };
    });
  }

  bypassRageshake(fnName) {
    for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    this.originalFunctions[fnName](...args);
  }

  log(level) {
    for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      args[_key3 - 1] = arguments[_key3];
    }

    // We don't know what locale the user may be running so use ISO strings
    const ts = new Date().toISOString(); // Convert objects and errors to helpful things

    args = args.map(arg => {
      if (arg instanceof DOMException) {
        return arg.message + ` (${arg.name} | ${arg.code})`;
      } else if (arg instanceof Error) {
        return arg.message + (arg.stack ? `\n${arg.stack}` : '');
      } else if (typeof arg === 'object') {
        return JSON.stringify(arg, (0, _JSON.getCircularReplacer)());
      } else {
        return arg;
      }
    }); // Some browsers support string formatting which we're not doing here
    // so the lines are a little more ugly but easy to implement / quick to
    // run.
    // Example line:
    // 2017-01-18T11:23:53.214Z W Failed to set badge count

    let line = `${ts} ${level} ${args.join(' ')}\n`; // Do some cleanup

    line = line.replace(/token=[a-zA-Z0-9-]+/gm, 'token=xxxxx'); // Using + really is the quickest way in JS
    // http://jsperf.com/concat-vs-plus-vs-join

    this.logs += line;
  }
  /**
   * Retrieve log lines to flush to disk.
   * @param {boolean} keepLogs True to not delete logs after flushing.
   * @return {string} \n delimited log lines to flush.
   */


  flush(keepLogs) {
    // The ConsoleLogger doesn't care how these end up on disk, it just
    // flushes them to the caller.
    if (keepLogs) {
      return this.logs;
    }

    const logsToFlush = this.logs;
    this.logs = "";
    return logsToFlush;
  }

} // A class which stores log lines in an IndexedDB instance.


exports.ConsoleLogger = ConsoleLogger;

class IndexedDBLogStore {
  constructor(indexedDB, logger) {
    this.indexedDB = indexedDB;
    this.logger = logger;
    (0, _defineProperty2.default)(this, "id", void 0);
    (0, _defineProperty2.default)(this, "index", 0);
    (0, _defineProperty2.default)(this, "db", null);
    (0, _defineProperty2.default)(this, "flushPromise", null);
    (0, _defineProperty2.default)(this, "flushAgainPromise", null);
    this.id = "instance-" + (0, _randomstring.randomString)(16);
  }
  /**
   * @return {Promise} Resolves when the store is ready.
   */


  connect() {
    const req = this.indexedDB.open("logs");
    return new Promise((resolve, reject) => {
      req.onsuccess = event => {
        // @ts-ignore
        this.db = event.target.result; // Periodically flush logs to local storage / indexeddb

        setInterval(this.flush.bind(this), FLUSH_RATE_MS);
        resolve();
      };

      req.onerror = event => {
        const err = // @ts-ignore
        "Failed to open log database: " + event.target.error.name;

        _logger.logger.error(err);

        reject(new Error(err));
      }; // First time: Setup the object store


      req.onupgradeneeded = event => {
        // @ts-ignore
        const db = event.target.result;
        const logObjStore = db.createObjectStore("logs", {
          keyPath: ["id", "index"]
        }); // Keys in the database look like: [ "instance-148938490", 0 ]
        // Later on we need to query everything based on an instance id.
        // In order to do this, we need to set up indexes "id".

        logObjStore.createIndex("id", "id", {
          unique: false
        });
        logObjStore.add(this.generateLogEntry(new Date() + " ::: Log database was created."));
        const lastModifiedStore = db.createObjectStore("logslastmod", {
          keyPath: "id"
        });
        lastModifiedStore.add(this.generateLastModifiedTime());
      };
    });
  }
  /**
   * Flush logs to disk.
   *
   * There are guards to protect against race conditions in order to ensure
   * that all previous flushes have completed before the most recent flush.
   * Consider without guards:
   *  - A calls flush() periodically.
   *  - B calls flush() and wants to send logs immediately afterwards.
   *  - If B doesn't wait for A's flush to complete, B will be missing the
   *    contents of A's flush.
   * To protect against this, we set 'flushPromise' when a flush is ongoing.
   * Subsequent calls to flush() during this period will chain another flush,
   * then keep returning that same chained flush.
   *
   * This guarantees that we will always eventually do a flush when flush() is
   * called.
   *
   * @return {Promise} Resolved when the logs have been flushed.
   */


  flush() {
    // check if a flush() operation is ongoing
    if (this.flushPromise) {
      if (this.flushAgainPromise) {
        // this is the 3rd+ time we've called flush() : return the same promise.
        return this.flushAgainPromise;
      } // queue up a flush to occur immediately after the pending one completes.


      this.flushAgainPromise = this.flushPromise.then(() => {
        return this.flush();
      }).then(() => {
        this.flushAgainPromise = null;
      });
      return this.flushAgainPromise;
    } // there is no flush promise or there was but it has finished, so do
    // a brand new one, destroying the chain which may have been built up.


    this.flushPromise = new Promise((resolve, reject) => {
      if (!this.db) {
        // not connected yet or user rejected access for us to r/w to the db.
        reject(new Error("No connected database"));
        return;
      }

      const lines = this.logger.flush();

      if (lines.length === 0) {
        resolve();
        return;
      }

      const txn = this.db.transaction(["logs", "logslastmod"], "readwrite");
      const objStore = txn.objectStore("logs");

      txn.oncomplete = event => {
        resolve();
      };

      txn.onerror = event => {
        _logger.logger.error("Failed to flush logs : ", event);

        reject(new Error("Failed to write logs: " + event.target.errorCode));
      };

      objStore.add(this.generateLogEntry(lines));
      const lastModStore = txn.objectStore("logslastmod");
      lastModStore.put(this.generateLastModifiedTime());
    }).then(() => {
      this.flushPromise = null;
    });
    return this.flushPromise;
  }
  /**
   * Consume the most recent logs and return them. Older logs which are not
   * returned are deleted at the same time, so this can be called at startup
   * to do house-keeping to keep the logs from growing too large.
   *
   * @return {Promise<Object[]>} Resolves to an array of objects. The array is
   * sorted in time (oldest first) based on when the log file was created (the
   * log ID). The objects have said log ID in an "id" field and "lines" which
   * is a big string with all the new-line delimited logs.
   */


  async consume() {
    const db = this.db; // Returns: a string representing the concatenated logs for this ID.
    // Stops adding log fragments when the size exceeds maxSize

    function fetchLogs(id, maxSize) {
      const objectStore = db.transaction("logs", "readonly").objectStore("logs");
      return new Promise((resolve, reject) => {
        const query = objectStore.index("id").openCursor(IDBKeyRange.only(id), 'prev');
        let lines = '';

        query.onerror = event => {
          reject(new Error("Query failed: " + event.target.errorCode));
        };

        query.onsuccess = event => {
          const cursor = event.target.result;

          if (!cursor) {
            resolve(lines);
            return; // end of results
          }

          lines = cursor.value.lines + lines;

          if (lines.length >= maxSize) {
            resolve(lines);
          } else {
            cursor.continue();
          }
        };
      });
    } // Returns: A sorted array of log IDs. (newest first)


    function fetchLogIds() {
      // To gather all the log IDs, query for all records in logslastmod.
      const o = db.transaction("logslastmod", "readonly").objectStore("logslastmod");
      return selectQuery(o, undefined, cursor => {
        return {
          id: cursor.value.id,
          ts: cursor.value.ts
        };
      }).then(res => {
        // Sort IDs by timestamp (newest first)
        return res.sort((a, b) => {
          return b.ts - a.ts;
        }).map(a => a.id);
      });
    }

    function deleteLogs(id) {
      return new Promise((resolve, reject) => {
        const txn = db.transaction(["logs", "logslastmod"], "readwrite");
        const o = txn.objectStore("logs"); // only load the key path, not the data which may be huge

        const query = o.index("id").openKeyCursor(IDBKeyRange.only(id));

        query.onsuccess = event => {
          const cursor = event.target.result;

          if (!cursor) {
            return;
          }

          o.delete(cursor.primaryKey);
          cursor.continue();
        };

        txn.oncomplete = () => {
          resolve();
        };

        txn.onerror = event => {
          reject(new Error("Failed to delete logs for " + `'${id}' : ${event.target.errorCode}`));
        }; // delete last modified entries


        const lastModStore = txn.objectStore("logslastmod");
        lastModStore.delete(id);
      });
    }

    const allLogIds = await fetchLogIds();
    let removeLogIds = [];
    const logs = [];
    let size = 0;

    for (let i = 0; i < allLogIds.length; i++) {
      const lines = await fetchLogs(allLogIds[i], MAX_LOG_SIZE - size); // always add the log file: fetchLogs will truncate once the maxSize we give it is
      // exceeded, so we'll go over the max but only by one fragment's worth.

      logs.push({
        lines: lines,
        id: allLogIds[i]
      });
      size += lines.length; // If fetchLogs truncated we'll now be at or over the size limit,
      // in which case we should stop and remove the rest of the log files.

      if (size >= MAX_LOG_SIZE) {
        // the remaining log IDs should be removed. If we go out of
        // bounds this is just []
        removeLogIds = allLogIds.slice(i + 1);
        break;
      }
    }

    if (removeLogIds.length > 0) {
      _logger.logger.log("Removing logs: ", removeLogIds); // Don't await this because it's non-fatal if we can't clean up
      // logs.


      Promise.all(removeLogIds.map(id => deleteLogs(id))).then(() => {
        _logger.logger.log(`Removed ${removeLogIds.length} old logs.`);
      }, err => {
        _logger.logger.error(err);
      });
    }

    return logs;
  }

  generateLogEntry(lines) {
    return {
      id: this.id,
      lines: lines,
      index: this.index++
    };
  }

  generateLastModifiedTime() {
    return {
      id: this.id,
      ts: Date.now()
    };
  }

}
/**
 * Helper method to collect results from a Cursor and promiseify it.
 * @param {ObjectStore|Index} store The store to perform openCursor on.
 * @param {IDBKeyRange=} keyRange Optional key range to apply on the cursor.
 * @param {Function} resultMapper A function which is repeatedly called with a
 * Cursor.
 * Return the data you want to keep.
 * @return {Promise<T[]>} Resolves to an array of whatever you returned from
 * resultMapper.
 */


exports.IndexedDBLogStore = IndexedDBLogStore;

function selectQuery(store, keyRange, resultMapper) {
  const query = store.openCursor(keyRange);
  return new Promise((resolve, reject) => {
    const results = [];

    query.onerror = event => {
      // @ts-ignore
      reject(new Error("Query failed: " + event.target.errorCode));
    }; // collect results


    query.onsuccess = event => {
      // @ts-ignore
      const cursor = event.target.result;

      if (!cursor) {
        resolve(results);
        return; // end of results
      }

      results.push(resultMapper(cursor));
      cursor.continue();
    };
  });
}
/**
 * Configure rage shaking support for sending bug reports.
 * Modifies globals.
 * @param {boolean} setUpPersistence When true (default), the persistence will
 * be set up immediately for the logs.
 * @return {Promise} Resolves when set up.
 */


function init() {
  let setUpPersistence = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

  if (global.mx_rage_initPromise) {
    return global.mx_rage_initPromise;
  }

  global.mx_rage_logger = new ConsoleLogger();
  global.mx_rage_logger.monkeyPatch(window.console);

  if (setUpPersistence) {
    return tryInitStorage();
  }

  global.mx_rage_initPromise = Promise.resolve();
  return global.mx_rage_initPromise;
}
/**
 * Try to start up the rageshake storage for logs. If not possible (client unsupported)
 * then this no-ops.
 * @return {Promise} Resolves when complete.
 */


function tryInitStorage() {
  if (global.mx_rage_initStoragePromise) {
    return global.mx_rage_initStoragePromise;
  }

  _logger.logger.log("Configuring rageshake persistence..."); // just *accessing* indexedDB throws an exception in firefox with
  // indexeddb disabled.


  let indexedDB;

  try {
    indexedDB = window.indexedDB;
  } catch (e) {}

  if (indexedDB) {
    global.mx_rage_store = new IndexedDBLogStore(indexedDB, global.mx_rage_logger);
    global.mx_rage_initStoragePromise = global.mx_rage_store.connect();
    return global.mx_rage_initStoragePromise;
  }

  global.mx_rage_initStoragePromise = Promise.resolve();
  return global.mx_rage_initStoragePromise;
}

function flush() {
  if (!global.mx_rage_store) {
    return;
  }

  global.mx_rage_store.flush();
}
/**
 * Clean up old logs.
 * @return {Promise} Resolves if cleaned logs.
 */


async function cleanup() {
  if (!global.mx_rage_store) {
    return;
  }

  await global.mx_rage_store.consume();
}
/**
 * Get a recent snapshot of the logs, ready for attaching to a bug report
 *
 * @return {Array<{lines: string, id, string}>}  list of log data
 */


async function getLogsForReport() {
  if (!global.mx_rage_logger) {
    throw new Error("No console logger, did you forget to call init()?");
  } // If in incognito mode, store is null, but we still want bug report
  // sending to work going off the in-memory console logs.


  if (global.mx_rage_store) {
    // flush most recent logs
    await global.mx_rage_store.flush();
    return global.mx_rage_store.consume();
  } else {
    return [{
      lines: global.mx_rage_logger.flush(true),
      id: "-"
    }];
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGTFVTSF9SQVRFX01TIiwiTUFYX0xPR19TSVpFIiwiQ29uc29sZUxvZ2dlciIsIm1vbmtleVBhdGNoIiwiY29uc29sZU9iaiIsImNvbnNvbGVGdW5jdGlvbnNUb0xldmVscyIsImxvZyIsImluZm8iLCJ3YXJuIiwiZXJyb3IiLCJPYmplY3QiLCJrZXlzIiwiZm9yRWFjaCIsImZuTmFtZSIsImxldmVsIiwib3JpZ2luYWxGbiIsImJpbmQiLCJvcmlnaW5hbEZ1bmN0aW9ucyIsImFyZ3MiLCJieXBhc3NSYWdlc2hha2UiLCJ0cyIsIkRhdGUiLCJ0b0lTT1N0cmluZyIsIm1hcCIsImFyZyIsIkRPTUV4Y2VwdGlvbiIsIm1lc3NhZ2UiLCJuYW1lIiwiY29kZSIsIkVycm9yIiwic3RhY2siLCJKU09OIiwic3RyaW5naWZ5IiwiZ2V0Q2lyY3VsYXJSZXBsYWNlciIsImxpbmUiLCJqb2luIiwicmVwbGFjZSIsImxvZ3MiLCJmbHVzaCIsImtlZXBMb2dzIiwibG9nc1RvRmx1c2giLCJJbmRleGVkREJMb2dTdG9yZSIsImNvbnN0cnVjdG9yIiwiaW5kZXhlZERCIiwibG9nZ2VyIiwiaWQiLCJyYW5kb21TdHJpbmciLCJjb25uZWN0IiwicmVxIiwib3BlbiIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0Iiwib25zdWNjZXNzIiwiZXZlbnQiLCJkYiIsInRhcmdldCIsInJlc3VsdCIsInNldEludGVydmFsIiwib25lcnJvciIsImVyciIsIm9udXBncmFkZW5lZWRlZCIsImxvZ09ialN0b3JlIiwiY3JlYXRlT2JqZWN0U3RvcmUiLCJrZXlQYXRoIiwiY3JlYXRlSW5kZXgiLCJ1bmlxdWUiLCJhZGQiLCJnZW5lcmF0ZUxvZ0VudHJ5IiwibGFzdE1vZGlmaWVkU3RvcmUiLCJnZW5lcmF0ZUxhc3RNb2RpZmllZFRpbWUiLCJmbHVzaFByb21pc2UiLCJmbHVzaEFnYWluUHJvbWlzZSIsInRoZW4iLCJsaW5lcyIsImxlbmd0aCIsInR4biIsInRyYW5zYWN0aW9uIiwib2JqU3RvcmUiLCJvYmplY3RTdG9yZSIsIm9uY29tcGxldGUiLCJlcnJvckNvZGUiLCJsYXN0TW9kU3RvcmUiLCJwdXQiLCJjb25zdW1lIiwiZmV0Y2hMb2dzIiwibWF4U2l6ZSIsInF1ZXJ5IiwiaW5kZXgiLCJvcGVuQ3Vyc29yIiwiSURCS2V5UmFuZ2UiLCJvbmx5IiwiY3Vyc29yIiwidmFsdWUiLCJjb250aW51ZSIsImZldGNoTG9nSWRzIiwibyIsInNlbGVjdFF1ZXJ5IiwidW5kZWZpbmVkIiwicmVzIiwic29ydCIsImEiLCJiIiwiZGVsZXRlTG9ncyIsIm9wZW5LZXlDdXJzb3IiLCJkZWxldGUiLCJwcmltYXJ5S2V5IiwiYWxsTG9nSWRzIiwicmVtb3ZlTG9nSWRzIiwic2l6ZSIsImkiLCJwdXNoIiwic2xpY2UiLCJhbGwiLCJub3ciLCJzdG9yZSIsImtleVJhbmdlIiwicmVzdWx0TWFwcGVyIiwicmVzdWx0cyIsImluaXQiLCJzZXRVcFBlcnNpc3RlbmNlIiwiZ2xvYmFsIiwibXhfcmFnZV9pbml0UHJvbWlzZSIsIm14X3JhZ2VfbG9nZ2VyIiwid2luZG93IiwiY29uc29sZSIsInRyeUluaXRTdG9yYWdlIiwibXhfcmFnZV9pbml0U3RvcmFnZVByb21pc2UiLCJlIiwibXhfcmFnZV9zdG9yZSIsImNsZWFudXAiLCJnZXRMb2dzRm9yUmVwb3J0Il0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL3JhZ2VzaGFrZS9yYWdlc2hha2UudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE3IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG4vLyBUaGlzIG1vZHVsZSBjb250YWlucyBhbGwgdGhlIGNvZGUgbmVlZGVkIHRvIGxvZyB0aGUgY29uc29sZSwgcGVyc2lzdCBpdCB0b1xuLy8gZGlzayBhbmQgc3VibWl0IGJ1ZyByZXBvcnRzLiBSYXRpb25hbGUgaXMgYXMgZm9sbG93czpcbi8vICAtIE1vbmtleS1wYXRjaGluZyB0aGUgY29uc29sZSBpcyBwcmVmZXJhYmxlIHRvIGhhdmluZyBhIGxvZyBsaWJyYXJ5IGJlY2F1c2Vcbi8vICAgIHdlIGNhbiBjYXRjaCBsb2dzIGJ5IG90aGVyIGxpYnJhcmllcyBtb3JlIGVhc2lseSwgd2l0aG91dCBoYXZpbmcgdG8gYWxsXG4vLyAgICBkZXBlbmQgb24gdGhlIHNhbWUgbG9nIGZyYW1ld29yayAvIHBhc3MgdGhlIGxvZ2dlciBhcm91bmQuXG4vLyAgLSBXZSB1c2UgSW5kZXhlZERCIHRvIHBlcnNpc3RzIGxvZ3MgYmVjYXVzZSBpdCBoYXMgZ2VuZXJvdXMgZGlzayBzcGFjZVxuLy8gICAgbGltaXRzIGNvbXBhcmVkIHRvIGxvY2FsIHN0b3JhZ2UuIEluZGV4ZWREQiBkb2VzIG5vdCB3b3JrIGluIGluY29nbml0b1xuLy8gICAgbW9kZSwgaW4gd2hpY2ggY2FzZSB0aGlzIG1vZHVsZSB3aWxsIG5vdCBiZSBhYmxlIHRvIHdyaXRlIGxvZ3MgdG8gZGlzay5cbi8vICAgIEhvd2V2ZXIsIHRoZSBsb2dzIHdpbGwgc3RpbGwgYmUgc3RvcmVkIGluLW1lbW9yeSwgc28gY2FuIHN0aWxsIGJlXG4vLyAgICBzdWJtaXR0ZWQgaW4gYSBidWcgcmVwb3J0IHNob3VsZCB0aGUgdXNlciB3aXNoIHRvOiB3ZSBjYW4gYWxzbyBzdG9yZSBtb3JlXG4vLyAgICBsb2dzIGluLW1lbW9yeSB0aGFuIGluIGxvY2FsIHN0b3JhZ2UsIHdoaWNoIGRvZXMgd29yayBpbiBpbmNvZ25pdG8gbW9kZS5cbi8vICAgIFdlIGFsc28gbmVlZCB0byBoYW5kbGUgdGhlIGNhc2Ugd2hlcmUgdGhlcmUgYXJlIDIrIHRhYnMuIEVhY2ggSlMgcnVudGltZVxuLy8gICAgZ2VuZXJhdGVzIGEgcmFuZG9tIHN0cmluZyB3aGljaCBzZXJ2ZXMgYXMgdGhlIFwiSURcIiBmb3IgdGhhdCB0YWIvc2Vzc2lvbi5cbi8vICAgIFRoZXNlIElEcyBhcmUgc3RvcmVkIGFsb25nIHdpdGggdGhlIGxvZyBsaW5lcy5cbi8vICAtIEJ1ZyByZXBvcnRzIGFyZSBzZW50IGFzIGEgUE9TVCBvdmVyIEhUVFBTOiBpdCBwdXJwb3NlZnVsbHkgZG9lcyBub3QgdXNlXG4vLyAgICBNYXRyaXggYXMgYnVnIHJlcG9ydHMgbWF5IGJlIG1hZGUgd2hlbiBNYXRyaXggaXMgbm90IHJlc3BvbnNpdmUgKHdoaWNoIG1heVxuLy8gICAgYmUgdGhlIGNhdXNlIG9mIHRoZSBidWcpLiBXZSBzZW5kIHRoZSBtb3N0IHJlY2VudCBOIE1CIG9mIFVURi04IGxvZyBkYXRhLFxuLy8gICAgc3RhcnRpbmcgd2l0aCB0aGUgbW9zdCByZWNlbnQsIHdoaWNoIHdlIGtub3cgYmVjYXVzZSB0aGUgXCJJRFwicyBhcmVcbi8vICAgIGFjdHVhbGx5IHRpbWVzdGFtcHMuIFdlIHRoZW4gcHVyZ2UgdGhlIHJlbWFpbmluZyBsb2dzLiBXZSBhbHNvIGRvIHRoaXNcbi8vICAgIHB1cmdlIG9uIHN0YXJ0dXAgdG8gcHJldmVudCBsb2dzIGZyb20gYWNjdW11bGF0aW5nLlxuXG4vLyB0aGUgZnJlcXVlbmN5IHdpdGggd2hpY2ggd2UgZmx1c2ggdG8gaW5kZXhlZGRiXG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5pbXBvcnQgeyByYW5kb21TdHJpbmcgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvcmFuZG9tc3RyaW5nXCI7XG5cbmltcG9ydCB7IGdldENpcmN1bGFyUmVwbGFjZXIgfSBmcm9tIFwiLi4vdXRpbHMvSlNPTlwiO1xuXG5jb25zdCBGTFVTSF9SQVRFX01TID0gMzAgKiAxMDAwO1xuXG4vLyB0aGUgbGVuZ3RoIG9mIGxvZyBkYXRhIHdlIGtlZXAgaW4gaW5kZXhlZGRiIChhbmQgaW5jbHVkZSBpbiB0aGUgcmVwb3J0cylcbmNvbnN0IE1BWF9MT0dfU0laRSA9IDEwMjQgKiAxMDI0ICogNTsgLy8gNSBNQlxuXG50eXBlIExvZ0Z1bmN0aW9uID0gKC4uLmFyZ3M6IChFcnJvciB8IERPTUV4Y2VwdGlvbiB8IG9iamVjdCB8IHN0cmluZylbXSkgPT4gdm9pZDtcbnR5cGUgTG9nRnVuY3Rpb25OYW1lID0gXCJsb2dcIiB8IFwiaW5mb1wiIHwgXCJ3YXJuXCIgfCBcImVycm9yXCI7XG5cbi8vIEEgY2xhc3Mgd2hpY2ggbW9ua2V5LXBhdGNoZXMgdGhlIGdsb2JhbCBjb25zb2xlIGFuZCBzdG9yZXMgbG9nIGxpbmVzLlxuZXhwb3J0IGNsYXNzIENvbnNvbGVMb2dnZXIge1xuICAgIHByaXZhdGUgbG9ncyA9IFwiXCI7XG4gICAgcHJpdmF0ZSBvcmlnaW5hbEZ1bmN0aW9uczoge1trZXkgaW4gTG9nRnVuY3Rpb25OYW1lXT86IExvZ0Z1bmN0aW9ufSA9IHt9O1xuXG4gICAgcHVibGljIG1vbmtleVBhdGNoKGNvbnNvbGVPYmo6IENvbnNvbGUpOiB2b2lkIHtcbiAgICAgICAgLy8gTW9ua2V5LXBhdGNoIGNvbnNvbGUgbG9nZ2luZ1xuICAgICAgICBjb25zdCBjb25zb2xlRnVuY3Rpb25zVG9MZXZlbHMgPSB7XG4gICAgICAgICAgICBsb2c6IFwiSVwiLFxuICAgICAgICAgICAgaW5mbzogXCJJXCIsXG4gICAgICAgICAgICB3YXJuOiBcIldcIixcbiAgICAgICAgICAgIGVycm9yOiBcIkVcIixcbiAgICAgICAgfTtcbiAgICAgICAgT2JqZWN0LmtleXMoY29uc29sZUZ1bmN0aW9uc1RvTGV2ZWxzKS5mb3JFYWNoKChmbk5hbWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGxldmVsID0gY29uc29sZUZ1bmN0aW9uc1RvTGV2ZWxzW2ZuTmFtZV07XG4gICAgICAgICAgICBjb25zdCBvcmlnaW5hbEZuID0gY29uc29sZU9ialtmbk5hbWVdLmJpbmQoY29uc29sZU9iaik7XG4gICAgICAgICAgICB0aGlzLm9yaWdpbmFsRnVuY3Rpb25zW2ZuTmFtZV0gPSBvcmlnaW5hbEZuO1xuICAgICAgICAgICAgY29uc29sZU9ialtmbk5hbWVdID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZyhsZXZlbCwgLi4uYXJncyk7XG4gICAgICAgICAgICAgICAgb3JpZ2luYWxGbiguLi5hcmdzKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBieXBhc3NSYWdlc2hha2UoXG4gICAgICAgIGZuTmFtZTogTG9nRnVuY3Rpb25OYW1lLFxuICAgICAgICAuLi5hcmdzOiAoRXJyb3IgfCBET01FeGNlcHRpb24gfCBvYmplY3QgfCBzdHJpbmcpW11cbiAgICApOiB2b2lkIHtcbiAgICAgICAgdGhpcy5vcmlnaW5hbEZ1bmN0aW9uc1tmbk5hbWVdKC4uLmFyZ3MpO1xuICAgIH1cblxuICAgIHB1YmxpYyBsb2cobGV2ZWw6IHN0cmluZywgLi4uYXJnczogKEVycm9yIHwgRE9NRXhjZXB0aW9uIHwgb2JqZWN0IHwgc3RyaW5nKVtdKTogdm9pZCB7XG4gICAgICAgIC8vIFdlIGRvbid0IGtub3cgd2hhdCBsb2NhbGUgdGhlIHVzZXIgbWF5IGJlIHJ1bm5pbmcgc28gdXNlIElTTyBzdHJpbmdzXG4gICAgICAgIGNvbnN0IHRzID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuXG4gICAgICAgIC8vIENvbnZlcnQgb2JqZWN0cyBhbmQgZXJyb3JzIHRvIGhlbHBmdWwgdGhpbmdzXG4gICAgICAgIGFyZ3MgPSBhcmdzLm1hcCgoYXJnKSA9PiB7XG4gICAgICAgICAgICBpZiAoYXJnIGluc3RhbmNlb2YgRE9NRXhjZXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFyZy5tZXNzYWdlICsgYCAoJHthcmcubmFtZX0gfCAke2FyZy5jb2RlfSlgO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhcmcgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBhcmcubWVzc2FnZSArIChhcmcuc3RhY2sgPyBgXFxuJHthcmcuc3RhY2t9YCA6ICcnKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIChhcmcpID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhcmcsIGdldENpcmN1bGFyUmVwbGFjZXIoKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBhcmc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFNvbWUgYnJvd3NlcnMgc3VwcG9ydCBzdHJpbmcgZm9ybWF0dGluZyB3aGljaCB3ZSdyZSBub3QgZG9pbmcgaGVyZVxuICAgICAgICAvLyBzbyB0aGUgbGluZXMgYXJlIGEgbGl0dGxlIG1vcmUgdWdseSBidXQgZWFzeSB0byBpbXBsZW1lbnQgLyBxdWljayB0b1xuICAgICAgICAvLyBydW4uXG4gICAgICAgIC8vIEV4YW1wbGUgbGluZTpcbiAgICAgICAgLy8gMjAxNy0wMS0xOFQxMToyMzo1My4yMTRaIFcgRmFpbGVkIHRvIHNldCBiYWRnZSBjb3VudFxuICAgICAgICBsZXQgbGluZSA9IGAke3RzfSAke2xldmVsfSAke2FyZ3Muam9pbignICcpfVxcbmA7XG4gICAgICAgIC8vIERvIHNvbWUgY2xlYW51cFxuICAgICAgICBsaW5lID0gbGluZS5yZXBsYWNlKC90b2tlbj1bYS16QS1aMC05LV0rL2dtLCAndG9rZW49eHh4eHgnKTtcbiAgICAgICAgLy8gVXNpbmcgKyByZWFsbHkgaXMgdGhlIHF1aWNrZXN0IHdheSBpbiBKU1xuICAgICAgICAvLyBodHRwOi8vanNwZXJmLmNvbS9jb25jYXQtdnMtcGx1cy12cy1qb2luXG4gICAgICAgIHRoaXMubG9ncyArPSBsaW5lO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHJpZXZlIGxvZyBsaW5lcyB0byBmbHVzaCB0byBkaXNrLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0ga2VlcExvZ3MgVHJ1ZSB0byBub3QgZGVsZXRlIGxvZ3MgYWZ0ZXIgZmx1c2hpbmcuXG4gICAgICogQHJldHVybiB7c3RyaW5nfSBcXG4gZGVsaW1pdGVkIGxvZyBsaW5lcyB0byBmbHVzaC5cbiAgICAgKi9cbiAgICBwdWJsaWMgZmx1c2goa2VlcExvZ3M/OiBib29sZWFuKTogc3RyaW5nIHtcbiAgICAgICAgLy8gVGhlIENvbnNvbGVMb2dnZXIgZG9lc24ndCBjYXJlIGhvdyB0aGVzZSBlbmQgdXAgb24gZGlzaywgaXQganVzdFxuICAgICAgICAvLyBmbHVzaGVzIHRoZW0gdG8gdGhlIGNhbGxlci5cbiAgICAgICAgaWYgKGtlZXBMb2dzKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5sb2dzO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGxvZ3NUb0ZsdXNoID0gdGhpcy5sb2dzO1xuICAgICAgICB0aGlzLmxvZ3MgPSBcIlwiO1xuICAgICAgICByZXR1cm4gbG9nc1RvRmx1c2g7XG4gICAgfVxufVxuXG4vLyBBIGNsYXNzIHdoaWNoIHN0b3JlcyBsb2cgbGluZXMgaW4gYW4gSW5kZXhlZERCIGluc3RhbmNlLlxuZXhwb3J0IGNsYXNzIEluZGV4ZWREQkxvZ1N0b3JlIHtcbiAgICBwcml2YXRlIGlkOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBpbmRleCA9IDA7XG4gICAgcHJpdmF0ZSBkYiA9IG51bGw7XG4gICAgcHJpdmF0ZSBmbHVzaFByb21pc2UgPSBudWxsO1xuICAgIHByaXZhdGUgZmx1c2hBZ2FpblByb21pc2UgPSBudWxsO1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgaW5kZXhlZERCOiBJREJGYWN0b3J5LFxuICAgICAgICBwcml2YXRlIGxvZ2dlcjogQ29uc29sZUxvZ2dlcixcbiAgICApIHtcbiAgICAgICAgdGhpcy5pZCA9IFwiaW5zdGFuY2UtXCIgKyByYW5kb21TdHJpbmcoMTYpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEByZXR1cm4ge1Byb21pc2V9IFJlc29sdmVzIHdoZW4gdGhlIHN0b3JlIGlzIHJlYWR5LlxuICAgICAqL1xuICAgIHB1YmxpYyBjb25uZWN0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCByZXEgPSB0aGlzLmluZGV4ZWREQi5vcGVuKFwibG9nc1wiKTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHJlcS5vbnN1Y2Nlc3MgPSAoZXZlbnQ6IEV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgIHRoaXMuZGIgPSBldmVudC50YXJnZXQucmVzdWx0O1xuICAgICAgICAgICAgICAgIC8vIFBlcmlvZGljYWxseSBmbHVzaCBsb2dzIHRvIGxvY2FsIHN0b3JhZ2UgLyBpbmRleGVkZGJcbiAgICAgICAgICAgICAgICBzZXRJbnRlcnZhbCh0aGlzLmZsdXNoLmJpbmQodGhpcyksIEZMVVNIX1JBVEVfTVMpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJlcS5vbmVycm9yID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyID0gKFxuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgICAgIFwiRmFpbGVkIHRvIG9wZW4gbG9nIGRhdGFiYXNlOiBcIiArIGV2ZW50LnRhcmdldC5lcnJvci5uYW1lXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGVycikpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gRmlyc3QgdGltZTogU2V0dXAgdGhlIG9iamVjdCBzdG9yZVxuICAgICAgICAgICAgcmVxLm9udXBncmFkZW5lZWRlZCA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICBjb25zdCBkYiA9IGV2ZW50LnRhcmdldC5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9nT2JqU3RvcmUgPSBkYi5jcmVhdGVPYmplY3RTdG9yZShcImxvZ3NcIiwge1xuICAgICAgICAgICAgICAgICAgICBrZXlQYXRoOiBbXCJpZFwiLCBcImluZGV4XCJdLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vIEtleXMgaW4gdGhlIGRhdGFiYXNlIGxvb2sgbGlrZTogWyBcImluc3RhbmNlLTE0ODkzODQ5MFwiLCAwIF1cbiAgICAgICAgICAgICAgICAvLyBMYXRlciBvbiB3ZSBuZWVkIHRvIHF1ZXJ5IGV2ZXJ5dGhpbmcgYmFzZWQgb24gYW4gaW5zdGFuY2UgaWQuXG4gICAgICAgICAgICAgICAgLy8gSW4gb3JkZXIgdG8gZG8gdGhpcywgd2UgbmVlZCB0byBzZXQgdXAgaW5kZXhlcyBcImlkXCIuXG4gICAgICAgICAgICAgICAgbG9nT2JqU3RvcmUuY3JlYXRlSW5kZXgoXCJpZFwiLCBcImlkXCIsIHsgdW5pcXVlOiBmYWxzZSB9KTtcblxuICAgICAgICAgICAgICAgIGxvZ09ialN0b3JlLmFkZChcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZUxvZ0VudHJ5KFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IERhdGUoKSArIFwiIDo6OiBMb2cgZGF0YWJhc2Ugd2FzIGNyZWF0ZWQuXCIsXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGxhc3RNb2RpZmllZFN0b3JlID0gZGIuY3JlYXRlT2JqZWN0U3RvcmUoXCJsb2dzbGFzdG1vZFwiLCB7XG4gICAgICAgICAgICAgICAgICAgIGtleVBhdGg6IFwiaWRcIixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBsYXN0TW9kaWZpZWRTdG9yZS5hZGQodGhpcy5nZW5lcmF0ZUxhc3RNb2RpZmllZFRpbWUoKSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGbHVzaCBsb2dzIHRvIGRpc2suXG4gICAgICpcbiAgICAgKiBUaGVyZSBhcmUgZ3VhcmRzIHRvIHByb3RlY3QgYWdhaW5zdCByYWNlIGNvbmRpdGlvbnMgaW4gb3JkZXIgdG8gZW5zdXJlXG4gICAgICogdGhhdCBhbGwgcHJldmlvdXMgZmx1c2hlcyBoYXZlIGNvbXBsZXRlZCBiZWZvcmUgdGhlIG1vc3QgcmVjZW50IGZsdXNoLlxuICAgICAqIENvbnNpZGVyIHdpdGhvdXQgZ3VhcmRzOlxuICAgICAqICAtIEEgY2FsbHMgZmx1c2goKSBwZXJpb2RpY2FsbHkuXG4gICAgICogIC0gQiBjYWxscyBmbHVzaCgpIGFuZCB3YW50cyB0byBzZW5kIGxvZ3MgaW1tZWRpYXRlbHkgYWZ0ZXJ3YXJkcy5cbiAgICAgKiAgLSBJZiBCIGRvZXNuJ3Qgd2FpdCBmb3IgQSdzIGZsdXNoIHRvIGNvbXBsZXRlLCBCIHdpbGwgYmUgbWlzc2luZyB0aGVcbiAgICAgKiAgICBjb250ZW50cyBvZiBBJ3MgZmx1c2guXG4gICAgICogVG8gcHJvdGVjdCBhZ2FpbnN0IHRoaXMsIHdlIHNldCAnZmx1c2hQcm9taXNlJyB3aGVuIGEgZmx1c2ggaXMgb25nb2luZy5cbiAgICAgKiBTdWJzZXF1ZW50IGNhbGxzIHRvIGZsdXNoKCkgZHVyaW5nIHRoaXMgcGVyaW9kIHdpbGwgY2hhaW4gYW5vdGhlciBmbHVzaCxcbiAgICAgKiB0aGVuIGtlZXAgcmV0dXJuaW5nIHRoYXQgc2FtZSBjaGFpbmVkIGZsdXNoLlxuICAgICAqXG4gICAgICogVGhpcyBndWFyYW50ZWVzIHRoYXQgd2Ugd2lsbCBhbHdheXMgZXZlbnR1YWxseSBkbyBhIGZsdXNoIHdoZW4gZmx1c2goKSBpc1xuICAgICAqIGNhbGxlZC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1Byb21pc2V9IFJlc29sdmVkIHdoZW4gdGhlIGxvZ3MgaGF2ZSBiZWVuIGZsdXNoZWQuXG4gICAgICovXG4gICAgcHVibGljIGZsdXNoKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICAvLyBjaGVjayBpZiBhIGZsdXNoKCkgb3BlcmF0aW9uIGlzIG9uZ29pbmdcbiAgICAgICAgaWYgKHRoaXMuZmx1c2hQcm9taXNlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5mbHVzaEFnYWluUHJvbWlzZSkge1xuICAgICAgICAgICAgICAgIC8vIHRoaXMgaXMgdGhlIDNyZCsgdGltZSB3ZSd2ZSBjYWxsZWQgZmx1c2goKSA6IHJldHVybiB0aGUgc2FtZSBwcm9taXNlLlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZsdXNoQWdhaW5Qcm9taXNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gcXVldWUgdXAgYSBmbHVzaCB0byBvY2N1ciBpbW1lZGlhdGVseSBhZnRlciB0aGUgcGVuZGluZyBvbmUgY29tcGxldGVzLlxuICAgICAgICAgICAgdGhpcy5mbHVzaEFnYWluUHJvbWlzZSA9IHRoaXMuZmx1c2hQcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmZsdXNoKCk7XG4gICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmZsdXNoQWdhaW5Qcm9taXNlID0gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmx1c2hBZ2FpblByb21pc2U7XG4gICAgICAgIH1cbiAgICAgICAgLy8gdGhlcmUgaXMgbm8gZmx1c2ggcHJvbWlzZSBvciB0aGVyZSB3YXMgYnV0IGl0IGhhcyBmaW5pc2hlZCwgc28gZG9cbiAgICAgICAgLy8gYSBicmFuZCBuZXcgb25lLCBkZXN0cm95aW5nIHRoZSBjaGFpbiB3aGljaCBtYXkgaGF2ZSBiZWVuIGJ1aWx0IHVwLlxuICAgICAgICB0aGlzLmZsdXNoUHJvbWlzZSA9IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5kYikge1xuICAgICAgICAgICAgICAgIC8vIG5vdCBjb25uZWN0ZWQgeWV0IG9yIHVzZXIgcmVqZWN0ZWQgYWNjZXNzIGZvciB1cyB0byByL3cgdG8gdGhlIGRiLlxuICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJObyBjb25uZWN0ZWQgZGF0YWJhc2VcIikpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGxpbmVzID0gdGhpcy5sb2dnZXIuZmx1c2goKTtcbiAgICAgICAgICAgIGlmIChsaW5lcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgdHhuID0gdGhpcy5kYi50cmFuc2FjdGlvbihbXCJsb2dzXCIsIFwibG9nc2xhc3Rtb2RcIl0sIFwicmVhZHdyaXRlXCIpO1xuICAgICAgICAgICAgY29uc3Qgb2JqU3RvcmUgPSB0eG4ub2JqZWN0U3RvcmUoXCJsb2dzXCIpO1xuICAgICAgICAgICAgdHhuLm9uY29tcGxldGUgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdHhuLm9uZXJyb3IgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIFwiRmFpbGVkIHRvIGZsdXNoIGxvZ3MgOiBcIiwgZXZlbnQsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByZWplY3QoXG4gICAgICAgICAgICAgICAgICAgIG5ldyBFcnJvcihcIkZhaWxlZCB0byB3cml0ZSBsb2dzOiBcIiArIGV2ZW50LnRhcmdldC5lcnJvckNvZGUpLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgb2JqU3RvcmUuYWRkKHRoaXMuZ2VuZXJhdGVMb2dFbnRyeShsaW5lcykpO1xuICAgICAgICAgICAgY29uc3QgbGFzdE1vZFN0b3JlID0gdHhuLm9iamVjdFN0b3JlKFwibG9nc2xhc3Rtb2RcIik7XG4gICAgICAgICAgICBsYXN0TW9kU3RvcmUucHV0KHRoaXMuZ2VuZXJhdGVMYXN0TW9kaWZpZWRUaW1lKCkpO1xuICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZmx1c2hQcm9taXNlID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0aGlzLmZsdXNoUHJvbWlzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb25zdW1lIHRoZSBtb3N0IHJlY2VudCBsb2dzIGFuZCByZXR1cm4gdGhlbS4gT2xkZXIgbG9ncyB3aGljaCBhcmUgbm90XG4gICAgICogcmV0dXJuZWQgYXJlIGRlbGV0ZWQgYXQgdGhlIHNhbWUgdGltZSwgc28gdGhpcyBjYW4gYmUgY2FsbGVkIGF0IHN0YXJ0dXBcbiAgICAgKiB0byBkbyBob3VzZS1rZWVwaW5nIHRvIGtlZXAgdGhlIGxvZ3MgZnJvbSBncm93aW5nIHRvbyBsYXJnZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1Byb21pc2U8T2JqZWN0W10+fSBSZXNvbHZlcyB0byBhbiBhcnJheSBvZiBvYmplY3RzLiBUaGUgYXJyYXkgaXNcbiAgICAgKiBzb3J0ZWQgaW4gdGltZSAob2xkZXN0IGZpcnN0KSBiYXNlZCBvbiB3aGVuIHRoZSBsb2cgZmlsZSB3YXMgY3JlYXRlZCAodGhlXG4gICAgICogbG9nIElEKS4gVGhlIG9iamVjdHMgaGF2ZSBzYWlkIGxvZyBJRCBpbiBhbiBcImlkXCIgZmllbGQgYW5kIFwibGluZXNcIiB3aGljaFxuICAgICAqIGlzIGEgYmlnIHN0cmluZyB3aXRoIGFsbCB0aGUgbmV3LWxpbmUgZGVsaW1pdGVkIGxvZ3MuXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIGNvbnN1bWUoKTogUHJvbWlzZTx7bGluZXM6IHN0cmluZywgaWQ6IHN0cmluZ31bXT4ge1xuICAgICAgICBjb25zdCBkYiA9IHRoaXMuZGI7XG5cbiAgICAgICAgLy8gUmV0dXJuczogYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBjb25jYXRlbmF0ZWQgbG9ncyBmb3IgdGhpcyBJRC5cbiAgICAgICAgLy8gU3RvcHMgYWRkaW5nIGxvZyBmcmFnbWVudHMgd2hlbiB0aGUgc2l6ZSBleGNlZWRzIG1heFNpemVcbiAgICAgICAgZnVuY3Rpb24gZmV0Y2hMb2dzKGlkOiBzdHJpbmcsIG1heFNpemU6IG51bWJlcik6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgICAgICAgICBjb25zdCBvYmplY3RTdG9yZSA9IGRiLnRyYW5zYWN0aW9uKFwibG9nc1wiLCBcInJlYWRvbmx5XCIpLm9iamVjdFN0b3JlKFwibG9nc1wiKTtcblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBxdWVyeSA9IG9iamVjdFN0b3JlLmluZGV4KFwiaWRcIikub3BlbkN1cnNvcihJREJLZXlSYW5nZS5vbmx5KGlkKSwgJ3ByZXYnKTtcbiAgICAgICAgICAgICAgICBsZXQgbGluZXMgPSAnJztcbiAgICAgICAgICAgICAgICBxdWVyeS5vbmVycm9yID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJRdWVyeSBmYWlsZWQ6IFwiICsgZXZlbnQudGFyZ2V0LmVycm9yQ29kZSkpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcXVlcnkub25zdWNjZXNzID0gKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGN1cnNvciA9IGV2ZW50LnRhcmdldC5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY3Vyc29yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGxpbmVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjsgLy8gZW5kIG9mIHJlc3VsdHNcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsaW5lcyA9IGN1cnNvci52YWx1ZS5saW5lcyArIGxpbmVzO1xuICAgICAgICAgICAgICAgICAgICBpZiAobGluZXMubGVuZ3RoID49IG1heFNpemUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUobGluZXMpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yLmNvbnRpbnVlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXR1cm5zOiBBIHNvcnRlZCBhcnJheSBvZiBsb2cgSURzLiAobmV3ZXN0IGZpcnN0KVxuICAgICAgICBmdW5jdGlvbiBmZXRjaExvZ0lkcygpOiBQcm9taXNlPHN0cmluZ1tdPiB7XG4gICAgICAgICAgICAvLyBUbyBnYXRoZXIgYWxsIHRoZSBsb2cgSURzLCBxdWVyeSBmb3IgYWxsIHJlY29yZHMgaW4gbG9nc2xhc3Rtb2QuXG4gICAgICAgICAgICBjb25zdCBvID0gZGIudHJhbnNhY3Rpb24oXCJsb2dzbGFzdG1vZFwiLCBcInJlYWRvbmx5XCIpLm9iamVjdFN0b3JlKFxuICAgICAgICAgICAgICAgIFwibG9nc2xhc3Rtb2RcIixcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0UXVlcnkobywgdW5kZWZpbmVkLCAoY3Vyc29yKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGN1cnNvci52YWx1ZS5pZCxcbiAgICAgICAgICAgICAgICAgICAgdHM6IGN1cnNvci52YWx1ZS50cyxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gU29ydCBJRHMgYnkgdGltZXN0YW1wIChuZXdlc3QgZmlyc3QpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBiLnRzIC0gYS50cztcbiAgICAgICAgICAgICAgICB9KS5tYXAoKGEpID0+IGEuaWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBkZWxldGVMb2dzKGlkOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdHhuID0gZGIudHJhbnNhY3Rpb24oXG4gICAgICAgICAgICAgICAgICAgIFtcImxvZ3NcIiwgXCJsb2dzbGFzdG1vZFwiXSwgXCJyZWFkd3JpdGVcIixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGNvbnN0IG8gPSB0eG4ub2JqZWN0U3RvcmUoXCJsb2dzXCIpO1xuICAgICAgICAgICAgICAgIC8vIG9ubHkgbG9hZCB0aGUga2V5IHBhdGgsIG5vdCB0aGUgZGF0YSB3aGljaCBtYXkgYmUgaHVnZVxuICAgICAgICAgICAgICAgIGNvbnN0IHF1ZXJ5ID0gby5pbmRleChcImlkXCIpLm9wZW5LZXlDdXJzb3IoSURCS2V5UmFuZ2Uub25seShpZCkpO1xuICAgICAgICAgICAgICAgIHF1ZXJ5Lm9uc3VjY2VzcyA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjdXJzb3IgPSBldmVudC50YXJnZXQucmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWN1cnNvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG8uZGVsZXRlKGN1cnNvci5wcmltYXJ5S2V5KTtcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yLmNvbnRpbnVlKCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0eG4ub25jb21wbGV0ZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdHhuLm9uZXJyb3IgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiRmFpbGVkIHRvIGRlbGV0ZSBsb2dzIGZvciBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYCcke2lkfScgOiAke2V2ZW50LnRhcmdldC5lcnJvckNvZGV9YCxcbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAvLyBkZWxldGUgbGFzdCBtb2RpZmllZCBlbnRyaWVzXG4gICAgICAgICAgICAgICAgY29uc3QgbGFzdE1vZFN0b3JlID0gdHhuLm9iamVjdFN0b3JlKFwibG9nc2xhc3Rtb2RcIik7XG4gICAgICAgICAgICAgICAgbGFzdE1vZFN0b3JlLmRlbGV0ZShpZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGFsbExvZ0lkcyA9IGF3YWl0IGZldGNoTG9nSWRzKCk7XG4gICAgICAgIGxldCByZW1vdmVMb2dJZHMgPSBbXTtcbiAgICAgICAgY29uc3QgbG9ncyA9IFtdO1xuICAgICAgICBsZXQgc2l6ZSA9IDA7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWxsTG9nSWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBsaW5lcyA9IGF3YWl0IGZldGNoTG9ncyhhbGxMb2dJZHNbaV0sIE1BWF9MT0dfU0laRSAtIHNpemUpO1xuXG4gICAgICAgICAgICAvLyBhbHdheXMgYWRkIHRoZSBsb2cgZmlsZTogZmV0Y2hMb2dzIHdpbGwgdHJ1bmNhdGUgb25jZSB0aGUgbWF4U2l6ZSB3ZSBnaXZlIGl0IGlzXG4gICAgICAgICAgICAvLyBleGNlZWRlZCwgc28gd2UnbGwgZ28gb3ZlciB0aGUgbWF4IGJ1dCBvbmx5IGJ5IG9uZSBmcmFnbWVudCdzIHdvcnRoLlxuICAgICAgICAgICAgbG9ncy5wdXNoKHtcbiAgICAgICAgICAgICAgICBsaW5lczogbGluZXMsXG4gICAgICAgICAgICAgICAgaWQ6IGFsbExvZ0lkc1tpXSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc2l6ZSArPSBsaW5lcy5sZW5ndGg7XG5cbiAgICAgICAgICAgIC8vIElmIGZldGNoTG9ncyB0cnVuY2F0ZWQgd2UnbGwgbm93IGJlIGF0IG9yIG92ZXIgdGhlIHNpemUgbGltaXQsXG4gICAgICAgICAgICAvLyBpbiB3aGljaCBjYXNlIHdlIHNob3VsZCBzdG9wIGFuZCByZW1vdmUgdGhlIHJlc3Qgb2YgdGhlIGxvZyBmaWxlcy5cbiAgICAgICAgICAgIGlmIChzaXplID49IE1BWF9MT0dfU0laRSkge1xuICAgICAgICAgICAgICAgIC8vIHRoZSByZW1haW5pbmcgbG9nIElEcyBzaG91bGQgYmUgcmVtb3ZlZC4gSWYgd2UgZ28gb3V0IG9mXG4gICAgICAgICAgICAgICAgLy8gYm91bmRzIHRoaXMgaXMganVzdCBbXVxuICAgICAgICAgICAgICAgIHJlbW92ZUxvZ0lkcyA9IGFsbExvZ0lkcy5zbGljZShpICsgMSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlbW92ZUxvZ0lkcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBsb2dnZXIubG9nKFwiUmVtb3ZpbmcgbG9nczogXCIsIHJlbW92ZUxvZ0lkcyk7XG4gICAgICAgICAgICAvLyBEb24ndCBhd2FpdCB0aGlzIGJlY2F1c2UgaXQncyBub24tZmF0YWwgaWYgd2UgY2FuJ3QgY2xlYW4gdXBcbiAgICAgICAgICAgIC8vIGxvZ3MuXG4gICAgICAgICAgICBQcm9taXNlLmFsbChyZW1vdmVMb2dJZHMubWFwKChpZCkgPT4gZGVsZXRlTG9ncyhpZCkpKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBsb2dnZXIubG9nKGBSZW1vdmVkICR7cmVtb3ZlTG9nSWRzLmxlbmd0aH0gb2xkIGxvZ3MuYCk7XG4gICAgICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbG9ncztcbiAgICB9XG5cbiAgICBwcml2YXRlIGdlbmVyYXRlTG9nRW50cnkobGluZXM6IHN0cmluZyk6IHtpZDogc3RyaW5nLCBsaW5lczogc3RyaW5nLCBpbmRleDogbnVtYmVyfSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpZDogdGhpcy5pZCxcbiAgICAgICAgICAgIGxpbmVzOiBsaW5lcyxcbiAgICAgICAgICAgIGluZGV4OiB0aGlzLmluZGV4KyssXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZUxhc3RNb2RpZmllZFRpbWUoKToge2lkOiBzdHJpbmcsIHRzOiBudW1iZXJ9IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlkOiB0aGlzLmlkLFxuICAgICAgICAgICAgdHM6IERhdGUubm93KCksXG4gICAgICAgIH07XG4gICAgfVxufVxuXG4vKipcbiAqIEhlbHBlciBtZXRob2QgdG8gY29sbGVjdCByZXN1bHRzIGZyb20gYSBDdXJzb3IgYW5kIHByb21pc2VpZnkgaXQuXG4gKiBAcGFyYW0ge09iamVjdFN0b3JlfEluZGV4fSBzdG9yZSBUaGUgc3RvcmUgdG8gcGVyZm9ybSBvcGVuQ3Vyc29yIG9uLlxuICogQHBhcmFtIHtJREJLZXlSYW5nZT19IGtleVJhbmdlIE9wdGlvbmFsIGtleSByYW5nZSB0byBhcHBseSBvbiB0aGUgY3Vyc29yLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVzdWx0TWFwcGVyIEEgZnVuY3Rpb24gd2hpY2ggaXMgcmVwZWF0ZWRseSBjYWxsZWQgd2l0aCBhXG4gKiBDdXJzb3IuXG4gKiBSZXR1cm4gdGhlIGRhdGEgeW91IHdhbnQgdG8ga2VlcC5cbiAqIEByZXR1cm4ge1Byb21pc2U8VFtdPn0gUmVzb2x2ZXMgdG8gYW4gYXJyYXkgb2Ygd2hhdGV2ZXIgeW91IHJldHVybmVkIGZyb21cbiAqIHJlc3VsdE1hcHBlci5cbiAqL1xuZnVuY3Rpb24gc2VsZWN0UXVlcnk8VD4oXG4gICAgc3RvcmU6IElEQkluZGV4LCBrZXlSYW5nZTogSURCS2V5UmFuZ2UsIHJlc3VsdE1hcHBlcjogKGN1cnNvcjogSURCQ3Vyc29yV2l0aFZhbHVlKSA9PiBULFxuKTogUHJvbWlzZTxUW10+IHtcbiAgICBjb25zdCBxdWVyeSA9IHN0b3JlLm9wZW5DdXJzb3Ioa2V5UmFuZ2UpO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBbXTtcbiAgICAgICAgcXVlcnkub25lcnJvciA9IChldmVudCkgPT4ge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIlF1ZXJ5IGZhaWxlZDogXCIgKyBldmVudC50YXJnZXQuZXJyb3JDb2RlKSk7XG4gICAgICAgIH07XG4gICAgICAgIC8vIGNvbGxlY3QgcmVzdWx0c1xuICAgICAgICBxdWVyeS5vbnN1Y2Nlc3MgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGNvbnN0IGN1cnNvciA9IGV2ZW50LnRhcmdldC5yZXN1bHQ7XG4gICAgICAgICAgICBpZiAoIWN1cnNvcikge1xuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuOyAvLyBlbmQgb2YgcmVzdWx0c1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHJlc3VsdE1hcHBlcihjdXJzb3IpKTtcbiAgICAgICAgICAgIGN1cnNvci5jb250aW51ZSgpO1xuICAgICAgICB9O1xuICAgIH0pO1xufVxuXG4vKipcbiAqIENvbmZpZ3VyZSByYWdlIHNoYWtpbmcgc3VwcG9ydCBmb3Igc2VuZGluZyBidWcgcmVwb3J0cy5cbiAqIE1vZGlmaWVzIGdsb2JhbHMuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHNldFVwUGVyc2lzdGVuY2UgV2hlbiB0cnVlIChkZWZhdWx0KSwgdGhlIHBlcnNpc3RlbmNlIHdpbGxcbiAqIGJlIHNldCB1cCBpbW1lZGlhdGVseSBmb3IgdGhlIGxvZ3MuXG4gKiBAcmV0dXJuIHtQcm9taXNlfSBSZXNvbHZlcyB3aGVuIHNldCB1cC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluaXQoc2V0VXBQZXJzaXN0ZW5jZSA9IHRydWUpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoZ2xvYmFsLm14X3JhZ2VfaW5pdFByb21pc2UpIHtcbiAgICAgICAgcmV0dXJuIGdsb2JhbC5teF9yYWdlX2luaXRQcm9taXNlO1xuICAgIH1cbiAgICBnbG9iYWwubXhfcmFnZV9sb2dnZXIgPSBuZXcgQ29uc29sZUxvZ2dlcigpO1xuICAgIGdsb2JhbC5teF9yYWdlX2xvZ2dlci5tb25rZXlQYXRjaCh3aW5kb3cuY29uc29sZSk7XG5cbiAgICBpZiAoc2V0VXBQZXJzaXN0ZW5jZSkge1xuICAgICAgICByZXR1cm4gdHJ5SW5pdFN0b3JhZ2UoKTtcbiAgICB9XG5cbiAgICBnbG9iYWwubXhfcmFnZV9pbml0UHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIHJldHVybiBnbG9iYWwubXhfcmFnZV9pbml0UHJvbWlzZTtcbn1cblxuLyoqXG4gKiBUcnkgdG8gc3RhcnQgdXAgdGhlIHJhZ2VzaGFrZSBzdG9yYWdlIGZvciBsb2dzLiBJZiBub3QgcG9zc2libGUgKGNsaWVudCB1bnN1cHBvcnRlZClcbiAqIHRoZW4gdGhpcyBuby1vcHMuXG4gKiBAcmV0dXJuIHtQcm9taXNlfSBSZXNvbHZlcyB3aGVuIGNvbXBsZXRlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJ5SW5pdFN0b3JhZ2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGdsb2JhbC5teF9yYWdlX2luaXRTdG9yYWdlUHJvbWlzZSkge1xuICAgICAgICByZXR1cm4gZ2xvYmFsLm14X3JhZ2VfaW5pdFN0b3JhZ2VQcm9taXNlO1xuICAgIH1cblxuICAgIGxvZ2dlci5sb2coXCJDb25maWd1cmluZyByYWdlc2hha2UgcGVyc2lzdGVuY2UuLi5cIik7XG5cbiAgICAvLyBqdXN0ICphY2Nlc3NpbmcqIGluZGV4ZWREQiB0aHJvd3MgYW4gZXhjZXB0aW9uIGluIGZpcmVmb3ggd2l0aFxuICAgIC8vIGluZGV4ZWRkYiBkaXNhYmxlZC5cbiAgICBsZXQgaW5kZXhlZERCO1xuICAgIHRyeSB7XG4gICAgICAgIGluZGV4ZWREQiA9IHdpbmRvdy5pbmRleGVkREI7XG4gICAgfSBjYXRjaCAoZSkge31cblxuICAgIGlmIChpbmRleGVkREIpIHtcbiAgICAgICAgZ2xvYmFsLm14X3JhZ2Vfc3RvcmUgPSBuZXcgSW5kZXhlZERCTG9nU3RvcmUoaW5kZXhlZERCLCBnbG9iYWwubXhfcmFnZV9sb2dnZXIpO1xuICAgICAgICBnbG9iYWwubXhfcmFnZV9pbml0U3RvcmFnZVByb21pc2UgPSBnbG9iYWwubXhfcmFnZV9zdG9yZS5jb25uZWN0KCk7XG4gICAgICAgIHJldHVybiBnbG9iYWwubXhfcmFnZV9pbml0U3RvcmFnZVByb21pc2U7XG4gICAgfVxuICAgIGdsb2JhbC5teF9yYWdlX2luaXRTdG9yYWdlUHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIHJldHVybiBnbG9iYWwubXhfcmFnZV9pbml0U3RvcmFnZVByb21pc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmbHVzaCgpIHtcbiAgICBpZiAoIWdsb2JhbC5teF9yYWdlX3N0b3JlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZ2xvYmFsLm14X3JhZ2Vfc3RvcmUuZmx1c2goKTtcbn1cblxuLyoqXG4gKiBDbGVhbiB1cCBvbGQgbG9ncy5cbiAqIEByZXR1cm4ge1Byb21pc2V9IFJlc29sdmVzIGlmIGNsZWFuZWQgbG9ncy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFudXAoKSB7XG4gICAgaWYgKCFnbG9iYWwubXhfcmFnZV9zdG9yZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGF3YWl0IGdsb2JhbC5teF9yYWdlX3N0b3JlLmNvbnN1bWUoKTtcbn1cblxuLyoqXG4gKiBHZXQgYSByZWNlbnQgc25hcHNob3Qgb2YgdGhlIGxvZ3MsIHJlYWR5IGZvciBhdHRhY2hpbmcgdG8gYSBidWcgcmVwb3J0XG4gKlxuICogQHJldHVybiB7QXJyYXk8e2xpbmVzOiBzdHJpbmcsIGlkLCBzdHJpbmd9Pn0gIGxpc3Qgb2YgbG9nIGRhdGFcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldExvZ3NGb3JSZXBvcnQoKSB7XG4gICAgaWYgKCFnbG9iYWwubXhfcmFnZV9sb2dnZXIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgXCJObyBjb25zb2xlIGxvZ2dlciwgZGlkIHlvdSBmb3JnZXQgdG8gY2FsbCBpbml0KCk/XCIsXG4gICAgICAgICk7XG4gICAgfVxuICAgIC8vIElmIGluIGluY29nbml0byBtb2RlLCBzdG9yZSBpcyBudWxsLCBidXQgd2Ugc3RpbGwgd2FudCBidWcgcmVwb3J0XG4gICAgLy8gc2VuZGluZyB0byB3b3JrIGdvaW5nIG9mZiB0aGUgaW4tbWVtb3J5IGNvbnNvbGUgbG9ncy5cbiAgICBpZiAoZ2xvYmFsLm14X3JhZ2Vfc3RvcmUpIHtcbiAgICAgICAgLy8gZmx1c2ggbW9zdCByZWNlbnQgbG9nc1xuICAgICAgICBhd2FpdCBnbG9iYWwubXhfcmFnZV9zdG9yZS5mbHVzaCgpO1xuICAgICAgICByZXR1cm4gZ2xvYmFsLm14X3JhZ2Vfc3RvcmUuY29uc3VtZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgbGluZXM6IGdsb2JhbC5teF9yYWdlX2xvZ2dlci5mbHVzaCh0cnVlKSxcbiAgICAgICAgICAgIGlkOiBcIi1cIixcbiAgICAgICAgfV07XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBd0NBOztBQUNBOztBQUVBOztBQTNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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