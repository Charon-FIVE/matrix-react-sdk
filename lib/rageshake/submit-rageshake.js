"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = sendBugReport;
exports.downloadBugReport = downloadBugReport;
exports.submitFeedback = submitFeedback;

var _pako = _interopRequireDefault(require("pako"));

var _tarJs = _interopRequireDefault(require("tar-js"));

var _logger = require("matrix-js-sdk/src/logger");

var _MatrixClientPeg = require("../MatrixClientPeg");

var _PlatformPeg = _interopRequireDefault(require("../PlatformPeg"));

var _languageHandler = require("../languageHandler");

var rageshake = _interopRequireWildcard(require("./rageshake"));

var _SettingsStore = _interopRequireDefault(require("../settings/SettingsStore"));

var _SdkConfig = _interopRequireDefault(require("../SdkConfig"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
async function collectBugReport() {
  let opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  let gzipLogs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

  const progressCallback = opts.progressCallback || (() => {});

  progressCallback((0, _languageHandler._t)("Collecting app version information"));
  let version = "UNKNOWN";

  try {
    version = await _PlatformPeg.default.get().getAppVersion();
  } catch (err) {} // PlatformPeg already logs this.


  let userAgent = "UNKNOWN";

  if (window.navigator && window.navigator.userAgent) {
    userAgent = window.navigator.userAgent;
  }

  let installedPWA = "UNKNOWN";

  try {
    // Known to work at least for desktop Chrome
    installedPWA = String(window.matchMedia('(display-mode: standalone)').matches);
  } catch (e) {}

  let touchInput = "UNKNOWN";

  try {
    // MDN claims broad support across browsers
    touchInput = String(window.matchMedia('(pointer: coarse)').matches);
  } catch (e) {}

  const client = _MatrixClientPeg.MatrixClientPeg.get();

  _logger.logger.log("Sending bug report.");

  const body = new FormData();
  body.append('text', opts.userText || "User did not supply any additional text.");
  body.append('app', opts.customApp || 'element-web');
  body.append('version', version);
  body.append('user_agent', userAgent);
  body.append('installed_pwa', installedPWA);
  body.append('touch_input', touchInput);

  if (opts.customFields) {
    for (const key in opts.customFields) {
      body.append(key, opts.customFields[key]);
    }
  }

  if (client) {
    body.append('user_id', client.credentials.userId);
    body.append('device_id', client.deviceId);

    if (client.isCryptoEnabled()) {
      const keys = [`ed25519:${client.getDeviceEd25519Key()}`];

      if (client.getDeviceCurve25519Key) {
        keys.push(`curve25519:${client.getDeviceCurve25519Key()}`);
      }

      body.append('device_keys', keys.join(', '));
      body.append('cross_signing_key', client.getCrossSigningId()); // add cross-signing status information

      const crossSigning = client.crypto.crossSigningInfo;
      const secretStorage = client.crypto.secretStorage;
      body.append("cross_signing_ready", String(await client.isCrossSigningReady()));
      body.append("cross_signing_supported_by_hs", String(await client.doesServerSupportUnstableFeature("org.matrix.e2e_cross_signing")));
      body.append("cross_signing_key", crossSigning.getId());
      body.append("cross_signing_privkey_in_secret_storage", String(!!(await crossSigning.isStoredInSecretStorage(secretStorage))));
      const pkCache = client.getCrossSigningCacheCallbacks();
      body.append("cross_signing_master_privkey_cached", String(!!(pkCache && (await pkCache.getCrossSigningKeyCache("master")))));
      body.append("cross_signing_self_signing_privkey_cached", String(!!(pkCache && (await pkCache.getCrossSigningKeyCache("self_signing")))));
      body.append("cross_signing_user_signing_privkey_cached", String(!!(pkCache && (await pkCache.getCrossSigningKeyCache("user_signing")))));
      body.append("secret_storage_ready", String(await client.isSecretStorageReady()));
      body.append("secret_storage_key_in_account", String(!!(await secretStorage.hasKey())));
      body.append("session_backup_key_in_secret_storage", String(!!(await client.isKeyBackupKeyStored())));
      const sessionBackupKeyFromCache = await client.crypto.getSessionBackupPrivateKey();
      body.append("session_backup_key_cached", String(!!sessionBackupKeyFromCache));
      body.append("session_backup_key_well_formed", String(sessionBackupKeyFromCache instanceof Uint8Array));
    }
  }

  if (opts.labels) {
    for (const label of opts.labels) {
      body.append('label', label);
    }
  } // add labs options


  const enabledLabs = _SettingsStore.default.getFeatureSettingNames().filter(f => _SettingsStore.default.getValue(f));

  if (enabledLabs.length) {
    body.append('enabled_labs', enabledLabs.join(', '));
  } // if low bandwidth mode is enabled, say so over rageshake, it causes many issues


  if (_SettingsStore.default.getValue("lowBandwidth")) {
    body.append("lowBandwidth", "enabled");
  } // add storage persistence/quota information


  if (navigator.storage && navigator.storage.persisted) {
    try {
      body.append("storageManager_persisted", String(await navigator.storage.persisted()));
    } catch (e) {}
  } else if (document.hasStorageAccess) {
    // Safari
    try {
      body.append("storageManager_persisted", String(await document.hasStorageAccess()));
    } catch (e) {}
  }

  if (navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      body.append("storageManager_quota", String(estimate.quota));
      body.append("storageManager_usage", String(estimate.usage));

      if (estimate.usageDetails) {
        Object.keys(estimate.usageDetails).forEach(k => {
          body.append(`storageManager_usage_${k}`, String(estimate.usageDetails[k]));
        });
      }
    } catch (e) {}
  }

  if (window.Modernizr) {
    const missingFeatures = Object.keys(window.Modernizr).filter(key => window.Modernizr[key] === false);

    if (missingFeatures.length > 0) {
      body.append("modernizr_missing_features", missingFeatures.join(", "));
    }
  }

  body.append("mx_local_settings", localStorage.getItem('mx_local_settings'));

  if (opts.sendLogs) {
    progressCallback((0, _languageHandler._t)("Collecting logs"));
    const logs = await rageshake.getLogsForReport();

    for (const entry of logs) {
      // encode as UTF-8
      let buf = new TextEncoder().encode(entry.lines); // compress

      if (gzipLogs) {
        buf = _pako.default.gzip(buf);
      }

      body.append('compressed-log', new Blob([buf]), entry.id);
    }
  }

  return body;
}
/**
 * Send a bug report.
 *
 * @param {string} bugReportEndpoint HTTP url to send the report to
 *
 * @param {object} opts optional dictionary of options
 *
 * @param {string} opts.userText Any additional user input.
 *
 * @param {boolean} opts.sendLogs True to send logs
 *
 * @param {function(string)} opts.progressCallback Callback to call with progress updates
 *
 * @return {Promise<string>} URL returned by the rageshake server
 */


async function sendBugReport(bugReportEndpoint) {
  let opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (!bugReportEndpoint) {
    throw new Error("No bug report endpoint has been set.");
  }

  const progressCallback = opts.progressCallback || (() => {});

  const body = await collectBugReport(opts);
  progressCallback((0, _languageHandler._t)("Uploading logs"));
  return submitReport(bugReportEndpoint, body, progressCallback);
}
/**
 * Downloads the files from a bug report. This is the same as sendBugReport,
 * but instead causes the browser to download the files locally.
 *
 * @param {object} opts optional dictionary of options
 *
 * @param {string} opts.userText Any additional user input.
 *
 * @param {boolean} opts.sendLogs True to send logs
 *
 * @param {function(string)} opts.progressCallback Callback to call with progress updates
 *
 * @return {Promise} Resolved when the bug report is downloaded (or started).
 */


async function downloadBugReport() {
  let opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  const progressCallback = opts.progressCallback || (() => {});

  const body = await collectBugReport(opts, false);
  progressCallback((0, _languageHandler._t)("Downloading logs"));
  let metadata = "";
  const tape = new _tarJs.default();
  let i = 0;

  for (const [key, value] of body.entries()) {
    if (key === 'compressed-log') {
      await new Promise(resolve => {
        const reader = new FileReader();
        reader.addEventListener('loadend', ev => {
          tape.append(`log-${i++}.log`, new TextDecoder().decode(ev.target.result));
          resolve();
        });
        reader.readAsArrayBuffer(value);
      });
    } else {
      metadata += `${key} = ${value}\n`;
    }
  }

  tape.append('issue.txt', metadata); // We have to create a new anchor to download if we want a filename. Otherwise we could
  // just use window.open.

  const dl = document.createElement('a');
  dl.href = `data:application/octet-stream;base64,${btoa(uint8ToString(tape.out))}`;
  dl.download = 'rageshake.tar';
  document.body.appendChild(dl);
  dl.click();
  document.body.removeChild(dl);
} // Source: https://github.com/beatgammit/tar-js/blob/master/examples/main.js


function uint8ToString(buf) {
  let out = '';

  for (let i = 0; i < buf.length; i += 1) {
    out += String.fromCharCode(buf[i]);
  }

  return out;
}

async function submitFeedback(endpoint, label, comment) {
  let canContact = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  let extraData = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  let version = "UNKNOWN";

  try {
    version = await _PlatformPeg.default.get().getAppVersion();
  } catch (err) {} // PlatformPeg already logs this.


  const body = new FormData();
  body.append("label", label);
  body.append("text", comment);
  body.append("can_contact", canContact ? "yes" : "no");
  body.append("app", "element-web");
  body.append("version", version);
  body.append("platform", _PlatformPeg.default.get().getHumanReadableName());
  body.append("user_id", _MatrixClientPeg.MatrixClientPeg.get()?.getUserId());

  for (const k in extraData) {
    body.append(k, JSON.stringify(extraData[k]));
  }

  await submitReport(_SdkConfig.default.get().bug_report_endpoint_url, body, () => {});
}

function submitReport(endpoint, body, progressCallback) {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.open("POST", endpoint);
    req.responseType = "json";
    req.timeout = 5 * 60 * 1000;

    req.onreadystatechange = function () {
      if (req.readyState === XMLHttpRequest.LOADING) {
        progressCallback((0, _languageHandler._t)("Waiting for response from server"));
      } else if (req.readyState === XMLHttpRequest.DONE) {
        // on done
        if (req.status < 200 || req.status >= 400) {
          reject(new Error(`HTTP ${req.status}`));
          return;
        }

        resolve(req.response.report_url || "");
      }
    };

    req.send(body);
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb2xsZWN0QnVnUmVwb3J0Iiwib3B0cyIsImd6aXBMb2dzIiwicHJvZ3Jlc3NDYWxsYmFjayIsIl90IiwidmVyc2lvbiIsIlBsYXRmb3JtUGVnIiwiZ2V0IiwiZ2V0QXBwVmVyc2lvbiIsImVyciIsInVzZXJBZ2VudCIsIndpbmRvdyIsIm5hdmlnYXRvciIsImluc3RhbGxlZFBXQSIsIlN0cmluZyIsIm1hdGNoTWVkaWEiLCJtYXRjaGVzIiwiZSIsInRvdWNoSW5wdXQiLCJjbGllbnQiLCJNYXRyaXhDbGllbnRQZWciLCJsb2dnZXIiLCJsb2ciLCJib2R5IiwiRm9ybURhdGEiLCJhcHBlbmQiLCJ1c2VyVGV4dCIsImN1c3RvbUFwcCIsImN1c3RvbUZpZWxkcyIsImtleSIsImNyZWRlbnRpYWxzIiwidXNlcklkIiwiZGV2aWNlSWQiLCJpc0NyeXB0b0VuYWJsZWQiLCJrZXlzIiwiZ2V0RGV2aWNlRWQyNTUxOUtleSIsImdldERldmljZUN1cnZlMjU1MTlLZXkiLCJwdXNoIiwiam9pbiIsImdldENyb3NzU2lnbmluZ0lkIiwiY3Jvc3NTaWduaW5nIiwiY3J5cHRvIiwiY3Jvc3NTaWduaW5nSW5mbyIsInNlY3JldFN0b3JhZ2UiLCJpc0Nyb3NzU2lnbmluZ1JlYWR5IiwiZG9lc1NlcnZlclN1cHBvcnRVbnN0YWJsZUZlYXR1cmUiLCJnZXRJZCIsImlzU3RvcmVkSW5TZWNyZXRTdG9yYWdlIiwicGtDYWNoZSIsImdldENyb3NzU2lnbmluZ0NhY2hlQ2FsbGJhY2tzIiwiZ2V0Q3Jvc3NTaWduaW5nS2V5Q2FjaGUiLCJpc1NlY3JldFN0b3JhZ2VSZWFkeSIsImhhc0tleSIsImlzS2V5QmFja3VwS2V5U3RvcmVkIiwic2Vzc2lvbkJhY2t1cEtleUZyb21DYWNoZSIsImdldFNlc3Npb25CYWNrdXBQcml2YXRlS2V5IiwiVWludDhBcnJheSIsImxhYmVscyIsImxhYmVsIiwiZW5hYmxlZExhYnMiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0RmVhdHVyZVNldHRpbmdOYW1lcyIsImZpbHRlciIsImYiLCJnZXRWYWx1ZSIsImxlbmd0aCIsInN0b3JhZ2UiLCJwZXJzaXN0ZWQiLCJkb2N1bWVudCIsImhhc1N0b3JhZ2VBY2Nlc3MiLCJlc3RpbWF0ZSIsInF1b3RhIiwidXNhZ2UiLCJ1c2FnZURldGFpbHMiLCJPYmplY3QiLCJmb3JFYWNoIiwiayIsIk1vZGVybml6ciIsIm1pc3NpbmdGZWF0dXJlcyIsImxvY2FsU3RvcmFnZSIsImdldEl0ZW0iLCJzZW5kTG9ncyIsImxvZ3MiLCJyYWdlc2hha2UiLCJnZXRMb2dzRm9yUmVwb3J0IiwiZW50cnkiLCJidWYiLCJUZXh0RW5jb2RlciIsImVuY29kZSIsImxpbmVzIiwicGFrbyIsImd6aXAiLCJCbG9iIiwiaWQiLCJzZW5kQnVnUmVwb3J0IiwiYnVnUmVwb3J0RW5kcG9pbnQiLCJFcnJvciIsInN1Ym1pdFJlcG9ydCIsImRvd25sb2FkQnVnUmVwb3J0IiwibWV0YWRhdGEiLCJ0YXBlIiwiVGFyIiwiaSIsInZhbHVlIiwiZW50cmllcyIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVhZGVyIiwiRmlsZVJlYWRlciIsImFkZEV2ZW50TGlzdGVuZXIiLCJldiIsIlRleHREZWNvZGVyIiwiZGVjb2RlIiwidGFyZ2V0IiwicmVzdWx0IiwicmVhZEFzQXJyYXlCdWZmZXIiLCJkbCIsImNyZWF0ZUVsZW1lbnQiLCJocmVmIiwiYnRvYSIsInVpbnQ4VG9TdHJpbmciLCJvdXQiLCJkb3dubG9hZCIsImFwcGVuZENoaWxkIiwiY2xpY2siLCJyZW1vdmVDaGlsZCIsImZyb21DaGFyQ29kZSIsInN1Ym1pdEZlZWRiYWNrIiwiZW5kcG9pbnQiLCJjb21tZW50IiwiY2FuQ29udGFjdCIsImV4dHJhRGF0YSIsImdldEh1bWFuUmVhZGFibGVOYW1lIiwiZ2V0VXNlcklkIiwiSlNPTiIsInN0cmluZ2lmeSIsIlNka0NvbmZpZyIsImJ1Z19yZXBvcnRfZW5kcG9pbnRfdXJsIiwicmVqZWN0IiwicmVxIiwiWE1MSHR0cFJlcXVlc3QiLCJvcGVuIiwicmVzcG9uc2VUeXBlIiwidGltZW91dCIsIm9ucmVhZHlzdGF0ZWNoYW5nZSIsInJlYWR5U3RhdGUiLCJMT0FESU5HIiwiRE9ORSIsInN0YXR1cyIsInJlc3BvbnNlIiwicmVwb3J0X3VybCIsInNlbmQiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvcmFnZXNoYWtlL3N1Ym1pdC1yYWdlc2hha2UudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE3IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgcGFrbyBmcm9tICdwYWtvJztcbmltcG9ydCBUYXIgZnJvbSBcInRhci1qc1wiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuXG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tICcuLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IFBsYXRmb3JtUGVnIGZyb20gJy4uL1BsYXRmb3JtUGVnJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCAqIGFzIHJhZ2VzaGFrZSBmcm9tICcuL3JhZ2VzaGFrZSc7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tIFwiLi4vU2RrQ29uZmlnXCI7XG5cbmludGVyZmFjZSBJT3B0cyB7XG4gICAgbGFiZWxzPzogc3RyaW5nW107XG4gICAgdXNlclRleHQ/OiBzdHJpbmc7XG4gICAgc2VuZExvZ3M/OiBib29sZWFuO1xuICAgIHByb2dyZXNzQ2FsbGJhY2s/OiAoczogc3RyaW5nKSA9PiB2b2lkO1xuICAgIGN1c3RvbUFwcD86IHN0cmluZztcbiAgICBjdXN0b21GaWVsZHM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xufVxuXG5hc3luYyBmdW5jdGlvbiBjb2xsZWN0QnVnUmVwb3J0KG9wdHM6IElPcHRzID0ge30sIGd6aXBMb2dzID0gdHJ1ZSkge1xuICAgIGNvbnN0IHByb2dyZXNzQ2FsbGJhY2sgPSBvcHRzLnByb2dyZXNzQ2FsbGJhY2sgfHwgKCgpID0+IHt9KTtcblxuICAgIHByb2dyZXNzQ2FsbGJhY2soX3QoXCJDb2xsZWN0aW5nIGFwcCB2ZXJzaW9uIGluZm9ybWF0aW9uXCIpKTtcbiAgICBsZXQgdmVyc2lvbiA9IFwiVU5LTk9XTlwiO1xuICAgIHRyeSB7XG4gICAgICAgIHZlcnNpb24gPSBhd2FpdCBQbGF0Zm9ybVBlZy5nZXQoKS5nZXRBcHBWZXJzaW9uKCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7fSAvLyBQbGF0Zm9ybVBlZyBhbHJlYWR5IGxvZ3MgdGhpcy5cblxuICAgIGxldCB1c2VyQWdlbnQgPSBcIlVOS05PV05cIjtcbiAgICBpZiAod2luZG93Lm5hdmlnYXRvciAmJiB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudCkge1xuICAgICAgICB1c2VyQWdlbnQgPSB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgICB9XG5cbiAgICBsZXQgaW5zdGFsbGVkUFdBID0gXCJVTktOT1dOXCI7XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gS25vd24gdG8gd29yayBhdCBsZWFzdCBmb3IgZGVza3RvcCBDaHJvbWVcbiAgICAgICAgaW5zdGFsbGVkUFdBID0gU3RyaW5nKHdpbmRvdy5tYXRjaE1lZGlhKCcoZGlzcGxheS1tb2RlOiBzdGFuZGFsb25lKScpLm1hdGNoZXMpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG5cbiAgICBsZXQgdG91Y2hJbnB1dCA9IFwiVU5LTk9XTlwiO1xuICAgIHRyeSB7XG4gICAgICAgIC8vIE1ETiBjbGFpbXMgYnJvYWQgc3VwcG9ydCBhY3Jvc3MgYnJvd3NlcnNcbiAgICAgICAgdG91Y2hJbnB1dCA9IFN0cmluZyh3aW5kb3cubWF0Y2hNZWRpYSgnKHBvaW50ZXI6IGNvYXJzZSknKS5tYXRjaGVzKTtcbiAgICB9IGNhdGNoIChlKSB7IH1cblxuICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcblxuICAgIGxvZ2dlci5sb2coXCJTZW5kaW5nIGJ1ZyByZXBvcnQuXCIpO1xuXG4gICAgY29uc3QgYm9keSA9IG5ldyBGb3JtRGF0YSgpO1xuICAgIGJvZHkuYXBwZW5kKCd0ZXh0Jywgb3B0cy51c2VyVGV4dCB8fCBcIlVzZXIgZGlkIG5vdCBzdXBwbHkgYW55IGFkZGl0aW9uYWwgdGV4dC5cIik7XG4gICAgYm9keS5hcHBlbmQoJ2FwcCcsIG9wdHMuY3VzdG9tQXBwIHx8ICdlbGVtZW50LXdlYicpO1xuICAgIGJvZHkuYXBwZW5kKCd2ZXJzaW9uJywgdmVyc2lvbik7XG4gICAgYm9keS5hcHBlbmQoJ3VzZXJfYWdlbnQnLCB1c2VyQWdlbnQpO1xuICAgIGJvZHkuYXBwZW5kKCdpbnN0YWxsZWRfcHdhJywgaW5zdGFsbGVkUFdBKTtcbiAgICBib2R5LmFwcGVuZCgndG91Y2hfaW5wdXQnLCB0b3VjaElucHV0KTtcblxuICAgIGlmIChvcHRzLmN1c3RvbUZpZWxkcykge1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBvcHRzLmN1c3RvbUZpZWxkcykge1xuICAgICAgICAgICAgYm9keS5hcHBlbmQoa2V5LCBvcHRzLmN1c3RvbUZpZWxkc1trZXldKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjbGllbnQpIHtcbiAgICAgICAgYm9keS5hcHBlbmQoJ3VzZXJfaWQnLCBjbGllbnQuY3JlZGVudGlhbHMudXNlcklkKTtcbiAgICAgICAgYm9keS5hcHBlbmQoJ2RldmljZV9pZCcsIGNsaWVudC5kZXZpY2VJZCk7XG5cbiAgICAgICAgaWYgKGNsaWVudC5pc0NyeXB0b0VuYWJsZWQoKSkge1xuICAgICAgICAgICAgY29uc3Qga2V5cyA9IFtgZWQyNTUxOToke2NsaWVudC5nZXREZXZpY2VFZDI1NTE5S2V5KCl9YF07XG4gICAgICAgICAgICBpZiAoY2xpZW50LmdldERldmljZUN1cnZlMjU1MTlLZXkpIHtcbiAgICAgICAgICAgICAgICBrZXlzLnB1c2goYGN1cnZlMjU1MTk6JHtjbGllbnQuZ2V0RGV2aWNlQ3VydmUyNTUxOUtleSgpfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYm9keS5hcHBlbmQoJ2RldmljZV9rZXlzJywga2V5cy5qb2luKCcsICcpKTtcbiAgICAgICAgICAgIGJvZHkuYXBwZW5kKCdjcm9zc19zaWduaW5nX2tleScsIGNsaWVudC5nZXRDcm9zc1NpZ25pbmdJZCgpKTtcblxuICAgICAgICAgICAgLy8gYWRkIGNyb3NzLXNpZ25pbmcgc3RhdHVzIGluZm9ybWF0aW9uXG4gICAgICAgICAgICBjb25zdCBjcm9zc1NpZ25pbmcgPSBjbGllbnQuY3J5cHRvLmNyb3NzU2lnbmluZ0luZm87XG4gICAgICAgICAgICBjb25zdCBzZWNyZXRTdG9yYWdlID0gY2xpZW50LmNyeXB0by5zZWNyZXRTdG9yYWdlO1xuXG4gICAgICAgICAgICBib2R5LmFwcGVuZChcImNyb3NzX3NpZ25pbmdfcmVhZHlcIiwgU3RyaW5nKGF3YWl0IGNsaWVudC5pc0Nyb3NzU2lnbmluZ1JlYWR5KCkpKTtcbiAgICAgICAgICAgIGJvZHkuYXBwZW5kKFwiY3Jvc3Nfc2lnbmluZ19zdXBwb3J0ZWRfYnlfaHNcIixcbiAgICAgICAgICAgICAgICBTdHJpbmcoYXdhaXQgY2xpZW50LmRvZXNTZXJ2ZXJTdXBwb3J0VW5zdGFibGVGZWF0dXJlKFwib3JnLm1hdHJpeC5lMmVfY3Jvc3Nfc2lnbmluZ1wiKSkpO1xuICAgICAgICAgICAgYm9keS5hcHBlbmQoXCJjcm9zc19zaWduaW5nX2tleVwiLCBjcm9zc1NpZ25pbmcuZ2V0SWQoKSk7XG4gICAgICAgICAgICBib2R5LmFwcGVuZChcImNyb3NzX3NpZ25pbmdfcHJpdmtleV9pbl9zZWNyZXRfc3RvcmFnZVwiLFxuICAgICAgICAgICAgICAgIFN0cmluZyghIShhd2FpdCBjcm9zc1NpZ25pbmcuaXNTdG9yZWRJblNlY3JldFN0b3JhZ2Uoc2VjcmV0U3RvcmFnZSkpKSk7XG5cbiAgICAgICAgICAgIGNvbnN0IHBrQ2FjaGUgPSBjbGllbnQuZ2V0Q3Jvc3NTaWduaW5nQ2FjaGVDYWxsYmFja3MoKTtcbiAgICAgICAgICAgIGJvZHkuYXBwZW5kKFwiY3Jvc3Nfc2lnbmluZ19tYXN0ZXJfcHJpdmtleV9jYWNoZWRcIixcbiAgICAgICAgICAgICAgICBTdHJpbmcoISEocGtDYWNoZSAmJiAoYXdhaXQgcGtDYWNoZS5nZXRDcm9zc1NpZ25pbmdLZXlDYWNoZShcIm1hc3RlclwiKSkpKSk7XG4gICAgICAgICAgICBib2R5LmFwcGVuZChcImNyb3NzX3NpZ25pbmdfc2VsZl9zaWduaW5nX3ByaXZrZXlfY2FjaGVkXCIsXG4gICAgICAgICAgICAgICAgU3RyaW5nKCEhKHBrQ2FjaGUgJiYgKGF3YWl0IHBrQ2FjaGUuZ2V0Q3Jvc3NTaWduaW5nS2V5Q2FjaGUoXCJzZWxmX3NpZ25pbmdcIikpKSkpO1xuICAgICAgICAgICAgYm9keS5hcHBlbmQoXCJjcm9zc19zaWduaW5nX3VzZXJfc2lnbmluZ19wcml2a2V5X2NhY2hlZFwiLFxuICAgICAgICAgICAgICAgIFN0cmluZyghIShwa0NhY2hlICYmIChhd2FpdCBwa0NhY2hlLmdldENyb3NzU2lnbmluZ0tleUNhY2hlKFwidXNlcl9zaWduaW5nXCIpKSkpKTtcblxuICAgICAgICAgICAgYm9keS5hcHBlbmQoXCJzZWNyZXRfc3RvcmFnZV9yZWFkeVwiLCBTdHJpbmcoYXdhaXQgY2xpZW50LmlzU2VjcmV0U3RvcmFnZVJlYWR5KCkpKTtcbiAgICAgICAgICAgIGJvZHkuYXBwZW5kKFwic2VjcmV0X3N0b3JhZ2Vfa2V5X2luX2FjY291bnRcIiwgU3RyaW5nKCEhKGF3YWl0IHNlY3JldFN0b3JhZ2UuaGFzS2V5KCkpKSk7XG5cbiAgICAgICAgICAgIGJvZHkuYXBwZW5kKFwic2Vzc2lvbl9iYWNrdXBfa2V5X2luX3NlY3JldF9zdG9yYWdlXCIsIFN0cmluZyghIShhd2FpdCBjbGllbnQuaXNLZXlCYWNrdXBLZXlTdG9yZWQoKSkpKTtcbiAgICAgICAgICAgIGNvbnN0IHNlc3Npb25CYWNrdXBLZXlGcm9tQ2FjaGUgPSBhd2FpdCBjbGllbnQuY3J5cHRvLmdldFNlc3Npb25CYWNrdXBQcml2YXRlS2V5KCk7XG4gICAgICAgICAgICBib2R5LmFwcGVuZChcInNlc3Npb25fYmFja3VwX2tleV9jYWNoZWRcIiwgU3RyaW5nKCEhc2Vzc2lvbkJhY2t1cEtleUZyb21DYWNoZSkpO1xuICAgICAgICAgICAgYm9keS5hcHBlbmQoXCJzZXNzaW9uX2JhY2t1cF9rZXlfd2VsbF9mb3JtZWRcIiwgU3RyaW5nKHNlc3Npb25CYWNrdXBLZXlGcm9tQ2FjaGUgaW5zdGFuY2VvZiBVaW50OEFycmF5KSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAob3B0cy5sYWJlbHMpIHtcbiAgICAgICAgZm9yIChjb25zdCBsYWJlbCBvZiBvcHRzLmxhYmVscykge1xuICAgICAgICAgICAgYm9keS5hcHBlbmQoJ2xhYmVsJywgbGFiZWwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gYWRkIGxhYnMgb3B0aW9uc1xuICAgIGNvbnN0IGVuYWJsZWRMYWJzID0gU2V0dGluZ3NTdG9yZS5nZXRGZWF0dXJlU2V0dGluZ05hbWVzKCkuZmlsdGVyKGYgPT4gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShmKSk7XG4gICAgaWYgKGVuYWJsZWRMYWJzLmxlbmd0aCkge1xuICAgICAgICBib2R5LmFwcGVuZCgnZW5hYmxlZF9sYWJzJywgZW5hYmxlZExhYnMuam9pbignLCAnKSk7XG4gICAgfVxuICAgIC8vIGlmIGxvdyBiYW5kd2lkdGggbW9kZSBpcyBlbmFibGVkLCBzYXkgc28gb3ZlciByYWdlc2hha2UsIGl0IGNhdXNlcyBtYW55IGlzc3Vlc1xuICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwibG93QmFuZHdpZHRoXCIpKSB7XG4gICAgICAgIGJvZHkuYXBwZW5kKFwibG93QmFuZHdpZHRoXCIsIFwiZW5hYmxlZFwiKTtcbiAgICB9XG5cbiAgICAvLyBhZGQgc3RvcmFnZSBwZXJzaXN0ZW5jZS9xdW90YSBpbmZvcm1hdGlvblxuICAgIGlmIChuYXZpZ2F0b3Iuc3RvcmFnZSAmJiBuYXZpZ2F0b3Iuc3RvcmFnZS5wZXJzaXN0ZWQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGJvZHkuYXBwZW5kKFwic3RvcmFnZU1hbmFnZXJfcGVyc2lzdGVkXCIsIFN0cmluZyhhd2FpdCBuYXZpZ2F0b3Iuc3RvcmFnZS5wZXJzaXN0ZWQoKSkpO1xuICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQuaGFzU3RvcmFnZUFjY2VzcykgeyAvLyBTYWZhcmlcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGJvZHkuYXBwZW5kKFwic3RvcmFnZU1hbmFnZXJfcGVyc2lzdGVkXCIsIFN0cmluZyhhd2FpdCBkb2N1bWVudC5oYXNTdG9yYWdlQWNjZXNzKCkpKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICB9XG4gICAgaWYgKG5hdmlnYXRvci5zdG9yYWdlICYmIG5hdmlnYXRvci5zdG9yYWdlLmVzdGltYXRlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBlc3RpbWF0ZSA9IGF3YWl0IG5hdmlnYXRvci5zdG9yYWdlLmVzdGltYXRlKCk7XG4gICAgICAgICAgICBib2R5LmFwcGVuZChcInN0b3JhZ2VNYW5hZ2VyX3F1b3RhXCIsIFN0cmluZyhlc3RpbWF0ZS5xdW90YSkpO1xuICAgICAgICAgICAgYm9keS5hcHBlbmQoXCJzdG9yYWdlTWFuYWdlcl91c2FnZVwiLCBTdHJpbmcoZXN0aW1hdGUudXNhZ2UpKTtcbiAgICAgICAgICAgIGlmIChlc3RpbWF0ZS51c2FnZURldGFpbHMpIHtcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhlc3RpbWF0ZS51c2FnZURldGFpbHMpLmZvckVhY2goayA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGJvZHkuYXBwZW5kKGBzdG9yYWdlTWFuYWdlcl91c2FnZV8ke2t9YCwgU3RyaW5nKGVzdGltYXRlLnVzYWdlRGV0YWlsc1trXSkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgIH1cblxuICAgIGlmICh3aW5kb3cuTW9kZXJuaXpyKSB7XG4gICAgICAgIGNvbnN0IG1pc3NpbmdGZWF0dXJlcyA9IE9iamVjdC5rZXlzKHdpbmRvdy5Nb2Rlcm5penIpLmZpbHRlcihrZXkgPT4gd2luZG93Lk1vZGVybml6cltrZXldID09PSBmYWxzZSk7XG4gICAgICAgIGlmIChtaXNzaW5nRmVhdHVyZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgYm9keS5hcHBlbmQoXCJtb2Rlcm5penJfbWlzc2luZ19mZWF0dXJlc1wiLCBtaXNzaW5nRmVhdHVyZXMuam9pbihcIiwgXCIpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGJvZHkuYXBwZW5kKFwibXhfbG9jYWxfc2V0dGluZ3NcIiwgbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ214X2xvY2FsX3NldHRpbmdzJykpO1xuXG4gICAgaWYgKG9wdHMuc2VuZExvZ3MpIHtcbiAgICAgICAgcHJvZ3Jlc3NDYWxsYmFjayhfdChcIkNvbGxlY3RpbmcgbG9nc1wiKSk7XG4gICAgICAgIGNvbnN0IGxvZ3MgPSBhd2FpdCByYWdlc2hha2UuZ2V0TG9nc0ZvclJlcG9ydCgpO1xuICAgICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGxvZ3MpIHtcbiAgICAgICAgICAgIC8vIGVuY29kZSBhcyBVVEYtOFxuICAgICAgICAgICAgbGV0IGJ1ZiA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZShlbnRyeS5saW5lcyk7XG5cbiAgICAgICAgICAgIC8vIGNvbXByZXNzXG4gICAgICAgICAgICBpZiAoZ3ppcExvZ3MpIHtcbiAgICAgICAgICAgICAgICBidWYgPSBwYWtvLmd6aXAoYnVmKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYm9keS5hcHBlbmQoJ2NvbXByZXNzZWQtbG9nJywgbmV3IEJsb2IoW2J1Zl0pLCBlbnRyeS5pZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYm9keTtcbn1cblxuLyoqXG4gKiBTZW5kIGEgYnVnIHJlcG9ydC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYnVnUmVwb3J0RW5kcG9pbnQgSFRUUCB1cmwgdG8gc2VuZCB0aGUgcmVwb3J0IHRvXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IG9wdHMgb3B0aW9uYWwgZGljdGlvbmFyeSBvZiBvcHRpb25zXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG9wdHMudXNlclRleHQgQW55IGFkZGl0aW9uYWwgdXNlciBpbnB1dC5cbiAqXG4gKiBAcGFyYW0ge2Jvb2xlYW59IG9wdHMuc2VuZExvZ3MgVHJ1ZSB0byBzZW5kIGxvZ3NcbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKHN0cmluZyl9IG9wdHMucHJvZ3Jlc3NDYWxsYmFjayBDYWxsYmFjayB0byBjYWxsIHdpdGggcHJvZ3Jlc3MgdXBkYXRlc1xuICpcbiAqIEByZXR1cm4ge1Byb21pc2U8c3RyaW5nPn0gVVJMIHJldHVybmVkIGJ5IHRoZSByYWdlc2hha2Ugc2VydmVyXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIHNlbmRCdWdSZXBvcnQoYnVnUmVwb3J0RW5kcG9pbnQ6IHN0cmluZywgb3B0czogSU9wdHMgPSB7fSk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgaWYgKCFidWdSZXBvcnRFbmRwb2ludCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBidWcgcmVwb3J0IGVuZHBvaW50IGhhcyBiZWVuIHNldC5cIik7XG4gICAgfVxuXG4gICAgY29uc3QgcHJvZ3Jlc3NDYWxsYmFjayA9IG9wdHMucHJvZ3Jlc3NDYWxsYmFjayB8fCAoKCkgPT4ge30pO1xuICAgIGNvbnN0IGJvZHkgPSBhd2FpdCBjb2xsZWN0QnVnUmVwb3J0KG9wdHMpO1xuXG4gICAgcHJvZ3Jlc3NDYWxsYmFjayhfdChcIlVwbG9hZGluZyBsb2dzXCIpKTtcbiAgICByZXR1cm4gc3VibWl0UmVwb3J0KGJ1Z1JlcG9ydEVuZHBvaW50LCBib2R5LCBwcm9ncmVzc0NhbGxiYWNrKTtcbn1cblxuLyoqXG4gKiBEb3dubG9hZHMgdGhlIGZpbGVzIGZyb20gYSBidWcgcmVwb3J0LiBUaGlzIGlzIHRoZSBzYW1lIGFzIHNlbmRCdWdSZXBvcnQsXG4gKiBidXQgaW5zdGVhZCBjYXVzZXMgdGhlIGJyb3dzZXIgdG8gZG93bmxvYWQgdGhlIGZpbGVzIGxvY2FsbHkuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IG9wdHMgb3B0aW9uYWwgZGljdGlvbmFyeSBvZiBvcHRpb25zXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG9wdHMudXNlclRleHQgQW55IGFkZGl0aW9uYWwgdXNlciBpbnB1dC5cbiAqXG4gKiBAcGFyYW0ge2Jvb2xlYW59IG9wdHMuc2VuZExvZ3MgVHJ1ZSB0byBzZW5kIGxvZ3NcbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKHN0cmluZyl9IG9wdHMucHJvZ3Jlc3NDYWxsYmFjayBDYWxsYmFjayB0byBjYWxsIHdpdGggcHJvZ3Jlc3MgdXBkYXRlc1xuICpcbiAqIEByZXR1cm4ge1Byb21pc2V9IFJlc29sdmVkIHdoZW4gdGhlIGJ1ZyByZXBvcnQgaXMgZG93bmxvYWRlZCAob3Igc3RhcnRlZCkuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkb3dubG9hZEJ1Z1JlcG9ydChvcHRzOiBJT3B0cyA9IHt9KSB7XG4gICAgY29uc3QgcHJvZ3Jlc3NDYWxsYmFjayA9IG9wdHMucHJvZ3Jlc3NDYWxsYmFjayB8fCAoKCkgPT4ge30pO1xuICAgIGNvbnN0IGJvZHkgPSBhd2FpdCBjb2xsZWN0QnVnUmVwb3J0KG9wdHMsIGZhbHNlKTtcblxuICAgIHByb2dyZXNzQ2FsbGJhY2soX3QoXCJEb3dubG9hZGluZyBsb2dzXCIpKTtcbiAgICBsZXQgbWV0YWRhdGEgPSBcIlwiO1xuICAgIGNvbnN0IHRhcGUgPSBuZXcgVGFyKCk7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIGJvZHkuZW50cmllcygpKSB7XG4gICAgICAgIGlmIChrZXkgPT09ICdjb21wcmVzc2VkLWxvZycpIHtcbiAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICAgICAgICAgIHJlYWRlci5hZGRFdmVudExpc3RlbmVyKCdsb2FkZW5kJywgZXYgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0YXBlLmFwcGVuZChgbG9nLSR7aSsrfS5sb2dgLCBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUoZXYudGFyZ2V0LnJlc3VsdCBhcyBBcnJheUJ1ZmZlcikpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKHZhbHVlIGFzIEJsb2IpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWV0YWRhdGEgKz0gYCR7a2V5fSA9ICR7dmFsdWV9XFxuYDtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0YXBlLmFwcGVuZCgnaXNzdWUudHh0JywgbWV0YWRhdGEpO1xuXG4gICAgLy8gV2UgaGF2ZSB0byBjcmVhdGUgYSBuZXcgYW5jaG9yIHRvIGRvd25sb2FkIGlmIHdlIHdhbnQgYSBmaWxlbmFtZS4gT3RoZXJ3aXNlIHdlIGNvdWxkXG4gICAgLy8ganVzdCB1c2Ugd2luZG93Lm9wZW4uXG4gICAgY29uc3QgZGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgZGwuaHJlZiA9IGBkYXRhOmFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbTtiYXNlNjQsJHtidG9hKHVpbnQ4VG9TdHJpbmcodGFwZS5vdXQpKX1gO1xuICAgIGRsLmRvd25sb2FkID0gJ3JhZ2VzaGFrZS50YXInO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZGwpO1xuICAgIGRsLmNsaWNrKCk7XG4gICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChkbCk7XG59XG5cbi8vIFNvdXJjZTogaHR0cHM6Ly9naXRodWIuY29tL2JlYXRnYW1taXQvdGFyLWpzL2Jsb2IvbWFzdGVyL2V4YW1wbGVzL21haW4uanNcbmZ1bmN0aW9uIHVpbnQ4VG9TdHJpbmcoYnVmOiBCdWZmZXIpIHtcbiAgICBsZXQgb3V0ID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBidWYubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgb3V0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN1Ym1pdEZlZWRiYWNrKFxuICAgIGVuZHBvaW50OiBzdHJpbmcsXG4gICAgbGFiZWw6IHN0cmluZyxcbiAgICBjb21tZW50OiBzdHJpbmcsXG4gICAgY2FuQ29udGFjdCA9IGZhbHNlLFxuICAgIGV4dHJhRGF0YTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9LFxuKSB7XG4gICAgbGV0IHZlcnNpb24gPSBcIlVOS05PV05cIjtcbiAgICB0cnkge1xuICAgICAgICB2ZXJzaW9uID0gYXdhaXQgUGxhdGZvcm1QZWcuZ2V0KCkuZ2V0QXBwVmVyc2lvbigpO1xuICAgIH0gY2F0Y2ggKGVycikge30gLy8gUGxhdGZvcm1QZWcgYWxyZWFkeSBsb2dzIHRoaXMuXG5cbiAgICBjb25zdCBib2R5ID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgYm9keS5hcHBlbmQoXCJsYWJlbFwiLCBsYWJlbCk7XG4gICAgYm9keS5hcHBlbmQoXCJ0ZXh0XCIsIGNvbW1lbnQpO1xuICAgIGJvZHkuYXBwZW5kKFwiY2FuX2NvbnRhY3RcIiwgY2FuQ29udGFjdCA/IFwieWVzXCIgOiBcIm5vXCIpO1xuXG4gICAgYm9keS5hcHBlbmQoXCJhcHBcIiwgXCJlbGVtZW50LXdlYlwiKTtcbiAgICBib2R5LmFwcGVuZChcInZlcnNpb25cIiwgdmVyc2lvbik7XG4gICAgYm9keS5hcHBlbmQoXCJwbGF0Zm9ybVwiLCBQbGF0Zm9ybVBlZy5nZXQoKS5nZXRIdW1hblJlYWRhYmxlTmFtZSgpKTtcbiAgICBib2R5LmFwcGVuZChcInVzZXJfaWRcIiwgTWF0cml4Q2xpZW50UGVnLmdldCgpPy5nZXRVc2VySWQoKSk7XG5cbiAgICBmb3IgKGNvbnN0IGsgaW4gZXh0cmFEYXRhKSB7XG4gICAgICAgIGJvZHkuYXBwZW5kKGssIEpTT04uc3RyaW5naWZ5KGV4dHJhRGF0YVtrXSkpO1xuICAgIH1cblxuICAgIGF3YWl0IHN1Ym1pdFJlcG9ydChTZGtDb25maWcuZ2V0KCkuYnVnX3JlcG9ydF9lbmRwb2ludF91cmwsIGJvZHksICgpID0+IHt9KTtcbn1cblxuZnVuY3Rpb24gc3VibWl0UmVwb3J0KGVuZHBvaW50OiBzdHJpbmcsIGJvZHk6IEZvcm1EYXRhLCBwcm9ncmVzc0NhbGxiYWNrOiAoc3RyOiBzdHJpbmcpID0+IHZvaWQpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxzdHJpbmc+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3QgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgIHJlcS5vcGVuKFwiUE9TVFwiLCBlbmRwb2ludCk7XG4gICAgICAgIHJlcS5yZXNwb25zZVR5cGUgPSBcImpzb25cIjtcbiAgICAgICAgcmVxLnRpbWVvdXQgPSA1ICogNjAgKiAxMDAwO1xuICAgICAgICByZXEub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAocmVxLnJlYWR5U3RhdGUgPT09IFhNTEh0dHBSZXF1ZXN0LkxPQURJTkcpIHtcbiAgICAgICAgICAgICAgICBwcm9ncmVzc0NhbGxiYWNrKF90KFwiV2FpdGluZyBmb3IgcmVzcG9uc2UgZnJvbSBzZXJ2ZXJcIikpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChyZXEucmVhZHlTdGF0ZSA9PT0gWE1MSHR0cFJlcXVlc3QuRE9ORSkge1xuICAgICAgICAgICAgICAgIC8vIG9uIGRvbmVcbiAgICAgICAgICAgICAgICBpZiAocmVxLnN0YXR1cyA8IDIwMCB8fCByZXEuc3RhdHVzID49IDQwMCkge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBIVFRQICR7cmVxLnN0YXR1c31gKSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXEucmVzcG9uc2UucmVwb3J0X3VybCB8fCBcIlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmVxLnNlbmQoYm9keSk7XG4gICAgfSk7XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBa0JBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUEzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXNCQSxlQUFlQSxnQkFBZixHQUFtRTtFQUFBLElBQW5DQyxJQUFtQyx1RUFBckIsRUFBcUI7RUFBQSxJQUFqQkMsUUFBaUIsdUVBQU4sSUFBTTs7RUFDL0QsTUFBTUMsZ0JBQWdCLEdBQUdGLElBQUksQ0FBQ0UsZ0JBQUwsS0FBMEIsTUFBTSxDQUFFLENBQWxDLENBQXpCOztFQUVBQSxnQkFBZ0IsQ0FBQyxJQUFBQyxtQkFBQSxFQUFHLG9DQUFILENBQUQsQ0FBaEI7RUFDQSxJQUFJQyxPQUFPLEdBQUcsU0FBZDs7RUFDQSxJQUFJO0lBQ0FBLE9BQU8sR0FBRyxNQUFNQyxvQkFBQSxDQUFZQyxHQUFaLEdBQWtCQyxhQUFsQixFQUFoQjtFQUNILENBRkQsQ0FFRSxPQUFPQyxHQUFQLEVBQVksQ0FBRSxDQVArQyxDQU85Qzs7O0VBRWpCLElBQUlDLFNBQVMsR0FBRyxTQUFoQjs7RUFDQSxJQUFJQyxNQUFNLENBQUNDLFNBQVAsSUFBb0JELE1BQU0sQ0FBQ0MsU0FBUCxDQUFpQkYsU0FBekMsRUFBb0Q7SUFDaERBLFNBQVMsR0FBR0MsTUFBTSxDQUFDQyxTQUFQLENBQWlCRixTQUE3QjtFQUNIOztFQUVELElBQUlHLFlBQVksR0FBRyxTQUFuQjs7RUFDQSxJQUFJO0lBQ0E7SUFDQUEsWUFBWSxHQUFHQyxNQUFNLENBQUNILE1BQU0sQ0FBQ0ksVUFBUCxDQUFrQiw0QkFBbEIsRUFBZ0RDLE9BQWpELENBQXJCO0VBQ0gsQ0FIRCxDQUdFLE9BQU9DLENBQVAsRUFB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