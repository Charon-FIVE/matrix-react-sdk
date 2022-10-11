"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _logger = require("matrix-js-sdk/src/logger");

var _actionCreators = require("./actionCreators");

var _Modal = _interopRequireDefault(require("../Modal"));

var Rooms = _interopRequireWildcard(require("../Rooms"));

var _languageHandler = require("../languageHandler");

var _RoomListStore = _interopRequireDefault(require("../stores/room-list/RoomListStore"));

var _models = require("../stores/room-list/algorithms/models");

var _models2 = require("../stores/room-list/models");

var _ErrorDialog = _interopRequireDefault(require("../components/views/dialogs/ErrorDialog"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2018 New Vector Ltd
Copyright 2020 The Matrix.org Foundation C.I.C.

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
class RoomListActions {
  /**
   * Creates an action thunk that will do an asynchronous request to
   * tag room.
   *
   * @param {MatrixClient} matrixClient the matrix client to set the
   *                                    account data on.
   * @param {Room} room the room to tag.
   * @param {string} oldTag the tag to remove (unless oldTag ==== newTag)
   * @param {string} newTag the tag with which to tag the room.
   * @param {?number} oldIndex the previous position of the room in the
   *                           list of rooms.
   * @param {?number} newIndex the new position of the room in the list
   *                           of rooms.
   * @returns {AsyncActionPayload} an async action payload
   * @see asyncAction
   */
  static tagRoom(matrixClient, room, oldTag, newTag, oldIndex, newIndex) {
    let metaData = null; // Is the tag ordered manually?

    const store = _RoomListStore.default.instance;

    if (newTag && store.getTagSorting(newTag) === _models.SortAlgorithm.Manual) {
      const newList = [...store.orderedLists[newTag]];
      newList.sort((a, b) => a.tags[newTag].order - b.tags[newTag].order); // If the room was moved "down" (increasing index) in the same list we
      // need to use the orders of the tiles with indices shifted by +1

      const offset = newTag === oldTag && oldIndex < newIndex ? 1 : 0;
      const indexBefore = offset + newIndex - 1;
      const indexAfter = offset + newIndex;
      const prevOrder = indexBefore <= 0 ? 0 : newList[indexBefore].tags[newTag].order;
      const nextOrder = indexAfter >= newList.length ? 1 : newList[indexAfter].tags[newTag].order;
      metaData = {
        order: (prevOrder + nextOrder) / 2.0
      };
    }

    return (0, _actionCreators.asyncAction)('RoomListActions.tagRoom', () => {
      const promises = [];
      const roomId = room.roomId; // Evil hack to get DMs behaving

      if (oldTag === undefined && newTag === _models2.DefaultTagID.DM || oldTag === _models2.DefaultTagID.DM && newTag === undefined) {
        return Rooms.guessAndSetDMRoom(room, newTag === _models2.DefaultTagID.DM).catch(err => {
          _logger.logger.error("Failed to set DM tag " + err);

          _Modal.default.createDialog(_ErrorDialog.default, {
            title: (0, _languageHandler._t)('Failed to set direct message tag'),
            description: err && err.message ? err.message : (0, _languageHandler._t)('Operation failed')
          });
        });
      }

      const hasChangedSubLists = oldTag !== newTag; // More evilness: We will still be dealing with moving to favourites/low prio,
      // but we avoid ever doing a request with TAG_DM.
      //
      // if we moved lists, remove the old tag

      if (oldTag && oldTag !== _models2.DefaultTagID.DM && hasChangedSubLists) {
        const promiseToDelete = matrixClient.deleteRoomTag(roomId, oldTag).catch(function (err) {
          _logger.logger.error("Failed to remove tag " + oldTag + " from room: " + err);

          _Modal.default.createDialog(_ErrorDialog.default, {
            title: (0, _languageHandler._t)('Failed to remove tag %(tagName)s from room', {
              tagName: oldTag
            }),
            description: err && err.message ? err.message : (0, _languageHandler._t)('Operation failed')
          });
        });
        promises.push(promiseToDelete);
      } // if we moved lists or the ordering changed, add the new tag


      if (newTag && newTag !== _models2.DefaultTagID.DM && (hasChangedSubLists || metaData)) {
        // metaData is the body of the PUT to set the tag, so it must
        // at least be an empty object.
        metaData = metaData || {};
        const promiseToAdd = matrixClient.setRoomTag(roomId, newTag, metaData).catch(function (err) {
          _logger.logger.error("Failed to add tag " + newTag + " to room: " + err);

          _Modal.default.createDialog(_ErrorDialog.default, {
            title: (0, _languageHandler._t)('Failed to add tag %(tagName)s to room', {
              tagName: newTag
            }),
            description: err && err.message ? err.message : (0, _languageHandler._t)('Operation failed')
          });

          throw err;
        });
        promises.push(promiseToAdd);
      }

      return Promise.all(promises);
    }, () => {
      // For an optimistic update
      return {
        room,
        oldTag,
        newTag,
        metaData
      };
    });
  }

}

exports.default = RoomListActions;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSb29tTGlzdEFjdGlvbnMiLCJ0YWdSb29tIiwibWF0cml4Q2xpZW50Iiwicm9vbSIsIm9sZFRhZyIsIm5ld1RhZyIsIm9sZEluZGV4IiwibmV3SW5kZXgiLCJtZXRhRGF0YSIsInN0b3JlIiwiUm9vbUxpc3RTdG9yZSIsImluc3RhbmNlIiwiZ2V0VGFnU29ydGluZyIsIlNvcnRBbGdvcml0aG0iLCJNYW51YWwiLCJuZXdMaXN0Iiwib3JkZXJlZExpc3RzIiwic29ydCIsImEiLCJiIiwidGFncyIsIm9yZGVyIiwib2Zmc2V0IiwiaW5kZXhCZWZvcmUiLCJpbmRleEFmdGVyIiwicHJldk9yZGVyIiwibmV4dE9yZGVyIiwibGVuZ3RoIiwiYXN5bmNBY3Rpb24iLCJwcm9taXNlcyIsInJvb21JZCIsInVuZGVmaW5lZCIsIkRlZmF1bHRUYWdJRCIsIkRNIiwiUm9vbXMiLCJndWVzc0FuZFNldERNUm9vbSIsImNhdGNoIiwiZXJyIiwibG9nZ2VyIiwiZXJyb3IiLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIkVycm9yRGlhbG9nIiwidGl0bGUiLCJfdCIsImRlc2NyaXB0aW9uIiwibWVzc2FnZSIsImhhc0NoYW5nZWRTdWJMaXN0cyIsInByb21pc2VUb0RlbGV0ZSIsImRlbGV0ZVJvb21UYWciLCJ0YWdOYW1lIiwicHVzaCIsInByb21pc2VUb0FkZCIsInNldFJvb21UYWciLCJQcm9taXNlIiwiYWxsIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FjdGlvbnMvUm9vbUxpc3RBY3Rpb25zLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgeyBNYXRyaXhDbGllbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY2xpZW50XCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5cbmltcG9ydCB7IGFzeW5jQWN0aW9uIH0gZnJvbSAnLi9hY3Rpb25DcmVhdG9ycyc7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vTW9kYWwnO1xuaW1wb3J0ICogYXMgUm9vbXMgZnJvbSAnLi4vUm9vbXMnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHsgQXN5bmNBY3Rpb25QYXlsb2FkIH0gZnJvbSBcIi4uL2Rpc3BhdGNoZXIvcGF5bG9hZHNcIjtcbmltcG9ydCBSb29tTGlzdFN0b3JlIGZyb20gXCIuLi9zdG9yZXMvcm9vbS1saXN0L1Jvb21MaXN0U3RvcmVcIjtcbmltcG9ydCB7IFNvcnRBbGdvcml0aG0gfSBmcm9tIFwiLi4vc3RvcmVzL3Jvb20tbGlzdC9hbGdvcml0aG1zL21vZGVsc1wiO1xuaW1wb3J0IHsgRGVmYXVsdFRhZ0lEIH0gZnJvbSBcIi4uL3N0b3Jlcy9yb29tLWxpc3QvbW9kZWxzXCI7XG5pbXBvcnQgRXJyb3JEaWFsb2cgZnJvbSAnLi4vY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL0Vycm9yRGlhbG9nJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUm9vbUxpc3RBY3Rpb25zIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIGFjdGlvbiB0aHVuayB0aGF0IHdpbGwgZG8gYW4gYXN5bmNocm9ub3VzIHJlcXVlc3QgdG9cbiAgICAgKiB0YWcgcm9vbS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7TWF0cml4Q2xpZW50fSBtYXRyaXhDbGllbnQgdGhlIG1hdHJpeCBjbGllbnQgdG8gc2V0IHRoZVxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWNjb3VudCBkYXRhIG9uLlxuICAgICAqIEBwYXJhbSB7Um9vbX0gcm9vbSB0aGUgcm9vbSB0byB0YWcuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG9sZFRhZyB0aGUgdGFnIHRvIHJlbW92ZSAodW5sZXNzIG9sZFRhZyA9PT09IG5ld1RhZylcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmV3VGFnIHRoZSB0YWcgd2l0aCB3aGljaCB0byB0YWcgdGhlIHJvb20uXG4gICAgICogQHBhcmFtIHs/bnVtYmVyfSBvbGRJbmRleCB0aGUgcHJldmlvdXMgcG9zaXRpb24gb2YgdGhlIHJvb20gaW4gdGhlXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICBsaXN0IG9mIHJvb21zLlxuICAgICAqIEBwYXJhbSB7P251bWJlcn0gbmV3SW5kZXggdGhlIG5ldyBwb3NpdGlvbiBvZiB0aGUgcm9vbSBpbiB0aGUgbGlzdFxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgb2Ygcm9vbXMuXG4gICAgICogQHJldHVybnMge0FzeW5jQWN0aW9uUGF5bG9hZH0gYW4gYXN5bmMgYWN0aW9uIHBheWxvYWRcbiAgICAgKiBAc2VlIGFzeW5jQWN0aW9uXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyB0YWdSb29tKFxuICAgICAgICBtYXRyaXhDbGllbnQ6IE1hdHJpeENsaWVudCwgcm9vbTogUm9vbSxcbiAgICAgICAgb2xkVGFnOiBzdHJpbmcsIG5ld1RhZzogc3RyaW5nLFxuICAgICAgICBvbGRJbmRleDogbnVtYmVyIHwgbnVsbCwgbmV3SW5kZXg6IG51bWJlciB8IG51bGwsXG4gICAgKTogQXN5bmNBY3Rpb25QYXlsb2FkIHtcbiAgICAgICAgbGV0IG1ldGFEYXRhID0gbnVsbDtcblxuICAgICAgICAvLyBJcyB0aGUgdGFnIG9yZGVyZWQgbWFudWFsbHk/XG4gICAgICAgIGNvbnN0IHN0b3JlID0gUm9vbUxpc3RTdG9yZS5pbnN0YW5jZTtcbiAgICAgICAgaWYgKG5ld1RhZyAmJiBzdG9yZS5nZXRUYWdTb3J0aW5nKG5ld1RhZykgPT09IFNvcnRBbGdvcml0aG0uTWFudWFsKSB7XG4gICAgICAgICAgICBjb25zdCBuZXdMaXN0ID0gWy4uLnN0b3JlLm9yZGVyZWRMaXN0c1tuZXdUYWddXTtcblxuICAgICAgICAgICAgbmV3TGlzdC5zb3J0KChhLCBiKSA9PiBhLnRhZ3NbbmV3VGFnXS5vcmRlciAtIGIudGFnc1tuZXdUYWddLm9yZGVyKTtcblxuICAgICAgICAgICAgLy8gSWYgdGhlIHJvb20gd2FzIG1vdmVkIFwiZG93blwiIChpbmNyZWFzaW5nIGluZGV4KSBpbiB0aGUgc2FtZSBsaXN0IHdlXG4gICAgICAgICAgICAvLyBuZWVkIHRvIHVzZSB0aGUgb3JkZXJzIG9mIHRoZSB0aWxlcyB3aXRoIGluZGljZXMgc2hpZnRlZCBieSArMVxuICAgICAgICAgICAgY29uc3Qgb2Zmc2V0ID0gKFxuICAgICAgICAgICAgICAgIG5ld1RhZyA9PT0gb2xkVGFnICYmIG9sZEluZGV4IDwgbmV3SW5kZXhcbiAgICAgICAgICAgICkgPyAxIDogMDtcblxuICAgICAgICAgICAgY29uc3QgaW5kZXhCZWZvcmUgPSBvZmZzZXQgKyBuZXdJbmRleCAtIDE7XG4gICAgICAgICAgICBjb25zdCBpbmRleEFmdGVyID0gb2Zmc2V0ICsgbmV3SW5kZXg7XG5cbiAgICAgICAgICAgIGNvbnN0IHByZXZPcmRlciA9IGluZGV4QmVmb3JlIDw9IDAgP1xuICAgICAgICAgICAgICAgIDAgOiBuZXdMaXN0W2luZGV4QmVmb3JlXS50YWdzW25ld1RhZ10ub3JkZXI7XG4gICAgICAgICAgICBjb25zdCBuZXh0T3JkZXIgPSBpbmRleEFmdGVyID49IG5ld0xpc3QubGVuZ3RoID9cbiAgICAgICAgICAgICAgICAxIDogbmV3TGlzdFtpbmRleEFmdGVyXS50YWdzW25ld1RhZ10ub3JkZXI7XG5cbiAgICAgICAgICAgIG1ldGFEYXRhID0ge1xuICAgICAgICAgICAgICAgIG9yZGVyOiAocHJldk9yZGVyICsgbmV4dE9yZGVyKSAvIDIuMCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXN5bmNBY3Rpb24oJ1Jvb21MaXN0QWN0aW9ucy50YWdSb29tJywgKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcHJvbWlzZXMgPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IHJvb21JZCA9IHJvb20ucm9vbUlkO1xuXG4gICAgICAgICAgICAvLyBFdmlsIGhhY2sgdG8gZ2V0IERNcyBiZWhhdmluZ1xuICAgICAgICAgICAgaWYgKChvbGRUYWcgPT09IHVuZGVmaW5lZCAmJiBuZXdUYWcgPT09IERlZmF1bHRUYWdJRC5ETSkgfHxcbiAgICAgICAgICAgICAgICAob2xkVGFnID09PSBEZWZhdWx0VGFnSUQuRE0gJiYgbmV3VGFnID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gUm9vbXMuZ3Vlc3NBbmRTZXRETVJvb20oXG4gICAgICAgICAgICAgICAgICAgIHJvb20sIG5ld1RhZyA9PT0gRGVmYXVsdFRhZ0lELkRNLFxuICAgICAgICAgICAgICAgICkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJGYWlsZWQgdG8gc2V0IERNIHRhZyBcIiArIGVycik7XG4gICAgICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KCdGYWlsZWQgdG8gc2V0IGRpcmVjdCBtZXNzYWdlIHRhZycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICgoZXJyICYmIGVyci5tZXNzYWdlKSA/IGVyci5tZXNzYWdlIDogX3QoJ09wZXJhdGlvbiBmYWlsZWQnKSksXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBoYXNDaGFuZ2VkU3ViTGlzdHMgPSBvbGRUYWcgIT09IG5ld1RhZztcblxuICAgICAgICAgICAgLy8gTW9yZSBldmlsbmVzczogV2Ugd2lsbCBzdGlsbCBiZSBkZWFsaW5nIHdpdGggbW92aW5nIHRvIGZhdm91cml0ZXMvbG93IHByaW8sXG4gICAgICAgICAgICAvLyBidXQgd2UgYXZvaWQgZXZlciBkb2luZyBhIHJlcXVlc3Qgd2l0aCBUQUdfRE0uXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gaWYgd2UgbW92ZWQgbGlzdHMsIHJlbW92ZSB0aGUgb2xkIHRhZ1xuICAgICAgICAgICAgaWYgKG9sZFRhZyAmJiBvbGRUYWcgIT09IERlZmF1bHRUYWdJRC5ETSAmJlxuICAgICAgICAgICAgICAgIGhhc0NoYW5nZWRTdWJMaXN0c1xuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJvbWlzZVRvRGVsZXRlID0gbWF0cml4Q2xpZW50LmRlbGV0ZVJvb21UYWcoXG4gICAgICAgICAgICAgICAgICAgIHJvb21JZCwgb2xkVGFnLFxuICAgICAgICAgICAgICAgICkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkZhaWxlZCB0byByZW1vdmUgdGFnIFwiICsgb2xkVGFnICsgXCIgZnJvbSByb29tOiBcIiArIGVycik7XG4gICAgICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KCdGYWlsZWQgdG8gcmVtb3ZlIHRhZyAlKHRhZ05hbWUpcyBmcm9tIHJvb20nLCB7IHRhZ05hbWU6IG9sZFRhZyB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAoKGVyciAmJiBlcnIubWVzc2FnZSkgPyBlcnIubWVzc2FnZSA6IF90KCdPcGVyYXRpb24gZmFpbGVkJykpLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHByb21pc2VzLnB1c2gocHJvbWlzZVRvRGVsZXRlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gaWYgd2UgbW92ZWQgbGlzdHMgb3IgdGhlIG9yZGVyaW5nIGNoYW5nZWQsIGFkZCB0aGUgbmV3IHRhZ1xuICAgICAgICAgICAgaWYgKG5ld1RhZyAmJiBuZXdUYWcgIT09IERlZmF1bHRUYWdJRC5ETSAmJlxuICAgICAgICAgICAgICAgIChoYXNDaGFuZ2VkU3ViTGlzdHMgfHwgbWV0YURhdGEpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAvLyBtZXRhRGF0YSBpcyB0aGUgYm9keSBvZiB0aGUgUFVUIHRvIHNldCB0aGUgdGFnLCBzbyBpdCBtdXN0XG4gICAgICAgICAgICAgICAgLy8gYXQgbGVhc3QgYmUgYW4gZW1wdHkgb2JqZWN0LlxuICAgICAgICAgICAgICAgIG1ldGFEYXRhID0gbWV0YURhdGEgfHwge307XG5cbiAgICAgICAgICAgICAgICBjb25zdCBwcm9taXNlVG9BZGQgPSBtYXRyaXhDbGllbnQuc2V0Um9vbVRhZyhyb29tSWQsIG5ld1RhZywgbWV0YURhdGEpLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJGYWlsZWQgdG8gYWRkIHRhZyBcIiArIG5ld1RhZyArIFwiIHRvIHJvb206IFwiICsgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0ZhaWxlZCB0byBhZGQgdGFnICUodGFnTmFtZSlzIHRvIHJvb20nLCB7IHRhZ05hbWU6IG5ld1RhZyB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAoKGVyciAmJiBlcnIubWVzc2FnZSkgPyBlcnIubWVzc2FnZSA6IF90KCdPcGVyYXRpb24gZmFpbGVkJykpLFxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKHByb21pc2VUb0FkZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcyk7XG4gICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgIC8vIEZvciBhbiBvcHRpbWlzdGljIHVwZGF0ZVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICByb29tLCBvbGRUYWcsIG5ld1RhZywgbWV0YURhdGEsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQW1CQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7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