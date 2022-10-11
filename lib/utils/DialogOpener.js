"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DialogOpener = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classnames = _interopRequireDefault(require("classnames"));

var _dispatcher = _interopRequireDefault(require("../dispatcher/dispatcher"));

var _Modal = _interopRequireDefault(require("../Modal"));

var _RoomSettingsDialog = _interopRequireDefault(require("../components/views/dialogs/RoomSettingsDialog"));

var _RoomViewStore = require("../stores/RoomViewStore");

var _ForwardDialog = _interopRequireDefault(require("../components/views/dialogs/ForwardDialog"));

var _MatrixClientPeg = require("../MatrixClientPeg");

var _actions = require("../dispatcher/actions");

var _ReportEventDialog = _interopRequireDefault(require("../components/views/dialogs/ReportEventDialog"));

var _SpacePreferencesDialog = _interopRequireDefault(require("../components/views/dialogs/SpacePreferencesDialog"));

var _SpaceSettingsDialog = _interopRequireDefault(require("../components/views/dialogs/SpaceSettingsDialog"));

var _InviteDialog = _interopRequireDefault(require("../components/views/dialogs/InviteDialog"));

var _AddExistingToSpaceDialog = _interopRequireDefault(require("../components/views/dialogs/AddExistingToSpaceDialog"));

var _PosthogTrackers = _interopRequireDefault(require("../PosthogTrackers"));

var _space = require("./space");

/*
Copyright 2022 The Matrix.org Foundation C.I.C.

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

/**
 * Auxiliary class to listen for dialog opening over the dispatcher and
 * open the required dialogs. Not all dialogs run through here, but the
 * ones which cause import cycles are good candidates.
 */
class DialogOpener {
  constructor() {
    (0, _defineProperty2.default)(this, "isRegistered", false);
    (0, _defineProperty2.default)(this, "onDispatch", payload => {
      switch (payload.action) {
        case 'open_room_settings':
          _Modal.default.createDialog(_RoomSettingsDialog.default, {
            roomId: payload.room_id || _RoomViewStore.RoomViewStore.instance.getRoomId(),
            initialTabId: payload.initial_tab_id
          },
          /*className=*/
          null,
          /*isPriority=*/
          false,
          /*isStatic=*/
          true);

          break;

        case _actions.Action.OpenForwardDialog:
          _Modal.default.createDialog(_ForwardDialog.default, {
            matrixClient: _MatrixClientPeg.MatrixClientPeg.get(),
            event: payload.event,
            permalinkCreator: payload.permalinkCreator
          });

          break;

        case _actions.Action.OpenReportEventDialog:
          _Modal.default.createDialog(_ReportEventDialog.default, {
            mxEvent: payload.event
          }, 'mx_Dialog_reportEvent');

          break;

        case _actions.Action.OpenSpacePreferences:
          _Modal.default.createDialog(_SpacePreferencesDialog.default, {
            initialTabId: payload.initalTabId,
            space: payload.space
          }, null, false, true);

          break;

        case _actions.Action.OpenSpaceSettings:
          _Modal.default.createDialog(_SpaceSettingsDialog.default, {
            matrixClient: payload.space.client,
            space: payload.space
          },
          /*className=*/
          null,
          /*isPriority=*/
          false,
          /*isStatic=*/
          true);

          break;

        case _actions.Action.OpenInviteDialog:
          _Modal.default.createDialog(_InviteDialog.default, {
            kind: payload.kind,
            call: payload.call,
            roomId: payload.roomId
          }, (0, _classnames.default)("mx_InviteDialog_flexWrapper", payload.className), false, true).finished.then(results => {
            payload.onFinishedCallback?.(results);
          });

          break;

        case _actions.Action.OpenAddToExistingSpaceDialog:
          {
            const space = payload.space;

            _Modal.default.createDialog(_AddExistingToSpaceDialog.default, {
              onCreateRoomClick: ev => {
                (0, _space.showCreateNewRoom)(space);

                _PosthogTrackers.default.trackInteraction("WebAddExistingToSpaceDialogCreateRoomButton", ev);
              },
              onAddSubspaceClick: () => (0, _space.showAddExistingSubspace)(space),
              space,
              onFinished: added => {
                if (added && _RoomViewStore.RoomViewStore.instance.getRoomId() === space.roomId) {
                  _dispatcher.default.fire(_actions.Action.UpdateSpaceHierarchy);
                }
              }
            }, "mx_AddExistingToSpaceDialog_wrapper");

            break;
          }
      }
    });
  } // We could do this in the constructor, but then we wouldn't have
  // a function to call from Lifecycle to capture the class.


  prepare() {
    if (this.isRegistered) return;

    _dispatcher.default.register(this.onDispatch);

    this.isRegistered = true;
  }

}

exports.DialogOpener = DialogOpener;
(0, _defineProperty2.default)(DialogOpener, "instance", new DialogOpener());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaWFsb2dPcGVuZXIiLCJjb25zdHJ1Y3RvciIsInBheWxvYWQiLCJhY3Rpb24iLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIlJvb21TZXR0aW5nc0RpYWxvZyIsInJvb21JZCIsInJvb21faWQiLCJSb29tVmlld1N0b3JlIiwiaW5zdGFuY2UiLCJnZXRSb29tSWQiLCJpbml0aWFsVGFiSWQiLCJpbml0aWFsX3RhYl9pZCIsIkFjdGlvbiIsIk9wZW5Gb3J3YXJkRGlhbG9nIiwiRm9yd2FyZERpYWxvZyIsIm1hdHJpeENsaWVudCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImV2ZW50IiwicGVybWFsaW5rQ3JlYXRvciIsIk9wZW5SZXBvcnRFdmVudERpYWxvZyIsIlJlcG9ydEV2ZW50RGlhbG9nIiwibXhFdmVudCIsIk9wZW5TcGFjZVByZWZlcmVuY2VzIiwiU3BhY2VQcmVmZXJlbmNlc0RpYWxvZyIsImluaXRhbFRhYklkIiwic3BhY2UiLCJPcGVuU3BhY2VTZXR0aW5ncyIsIlNwYWNlU2V0dGluZ3NEaWFsb2ciLCJjbGllbnQiLCJPcGVuSW52aXRlRGlhbG9nIiwiSW52aXRlRGlhbG9nIiwia2luZCIsImNhbGwiLCJjbGFzc25hbWVzIiwiY2xhc3NOYW1lIiwiZmluaXNoZWQiLCJ0aGVuIiwicmVzdWx0cyIsIm9uRmluaXNoZWRDYWxsYmFjayIsIk9wZW5BZGRUb0V4aXN0aW5nU3BhY2VEaWFsb2ciLCJBZGRFeGlzdGluZ1RvU3BhY2VEaWFsb2ciLCJvbkNyZWF0ZVJvb21DbGljayIsImV2Iiwic2hvd0NyZWF0ZU5ld1Jvb20iLCJQb3N0aG9nVHJhY2tlcnMiLCJ0cmFja0ludGVyYWN0aW9uIiwib25BZGRTdWJzcGFjZUNsaWNrIiwic2hvd0FkZEV4aXN0aW5nU3Vic3BhY2UiLCJvbkZpbmlzaGVkIiwiYWRkZWQiLCJkZWZhdWx0RGlzcGF0Y2hlciIsImZpcmUiLCJVcGRhdGVTcGFjZUhpZXJhcmNoeSIsInByZXBhcmUiLCJpc1JlZ2lzdGVyZWQiLCJyZWdpc3RlciIsIm9uRGlzcGF0Y2giXSwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvRGlhbG9nT3BlbmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBjbGFzc25hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5cbmltcG9ydCBkZWZhdWx0RGlzcGF0Y2hlciBmcm9tIFwiLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgeyBBY3Rpb25QYXlsb2FkIH0gZnJvbSBcIi4uL2Rpc3BhdGNoZXIvcGF5bG9hZHNcIjtcbmltcG9ydCBNb2RhbCBmcm9tIFwiLi4vTW9kYWxcIjtcbmltcG9ydCBSb29tU2V0dGluZ3NEaWFsb2cgZnJvbSBcIi4uL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9Sb29tU2V0dGluZ3NEaWFsb2dcIjtcbmltcG9ydCB7IFJvb21WaWV3U3RvcmUgfSBmcm9tIFwiLi4vc3RvcmVzL1Jvb21WaWV3U3RvcmVcIjtcbmltcG9ydCBGb3J3YXJkRGlhbG9nIGZyb20gXCIuLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvRm9yd2FyZERpYWxvZ1wiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSBcIi4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IFJlcG9ydEV2ZW50RGlhbG9nIGZyb20gXCIuLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvUmVwb3J0RXZlbnREaWFsb2dcIjtcbmltcG9ydCBTcGFjZVByZWZlcmVuY2VzRGlhbG9nIGZyb20gXCIuLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvU3BhY2VQcmVmZXJlbmNlc0RpYWxvZ1wiO1xuaW1wb3J0IFNwYWNlU2V0dGluZ3NEaWFsb2cgZnJvbSBcIi4uL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9TcGFjZVNldHRpbmdzRGlhbG9nXCI7XG5pbXBvcnQgSW52aXRlRGlhbG9nIGZyb20gXCIuLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvSW52aXRlRGlhbG9nXCI7XG5pbXBvcnQgQWRkRXhpc3RpbmdUb1NwYWNlRGlhbG9nIGZyb20gXCIuLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvQWRkRXhpc3RpbmdUb1NwYWNlRGlhbG9nXCI7XG5pbXBvcnQgeyBCdXR0b25FdmVudCB9IGZyb20gXCIuLi9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBQb3N0aG9nVHJhY2tlcnMgZnJvbSBcIi4uL1Bvc3Rob2dUcmFja2Vyc1wiO1xuaW1wb3J0IHsgc2hvd0FkZEV4aXN0aW5nU3Vic3BhY2UsIHNob3dDcmVhdGVOZXdSb29tIH0gZnJvbSBcIi4vc3BhY2VcIjtcblxuLyoqXG4gKiBBdXhpbGlhcnkgY2xhc3MgdG8gbGlzdGVuIGZvciBkaWFsb2cgb3BlbmluZyBvdmVyIHRoZSBkaXNwYXRjaGVyIGFuZFxuICogb3BlbiB0aGUgcmVxdWlyZWQgZGlhbG9ncy4gTm90IGFsbCBkaWFsb2dzIHJ1biB0aHJvdWdoIGhlcmUsIGJ1dCB0aGVcbiAqIG9uZXMgd2hpY2ggY2F1c2UgaW1wb3J0IGN5Y2xlcyBhcmUgZ29vZCBjYW5kaWRhdGVzLlxuICovXG5leHBvcnQgY2xhc3MgRGlhbG9nT3BlbmVyIHtcbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IGluc3RhbmNlID0gbmV3IERpYWxvZ09wZW5lcigpO1xuXG4gICAgcHJpdmF0ZSBpc1JlZ2lzdGVyZWQgPSBmYWxzZTtcblxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoKSB7XG4gICAgfVxuXG4gICAgLy8gV2UgY291bGQgZG8gdGhpcyBpbiB0aGUgY29uc3RydWN0b3IsIGJ1dCB0aGVuIHdlIHdvdWxkbid0IGhhdmVcbiAgICAvLyBhIGZ1bmN0aW9uIHRvIGNhbGwgZnJvbSBMaWZlY3ljbGUgdG8gY2FwdHVyZSB0aGUgY2xhc3MuXG4gICAgcHVibGljIHByZXBhcmUoKSB7XG4gICAgICAgIGlmICh0aGlzLmlzUmVnaXN0ZXJlZCkgcmV0dXJuO1xuICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci5yZWdpc3Rlcih0aGlzLm9uRGlzcGF0Y2gpO1xuICAgICAgICB0aGlzLmlzUmVnaXN0ZXJlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkRpc3BhdGNoID0gKHBheWxvYWQ6IEFjdGlvblBheWxvYWQpID0+IHtcbiAgICAgICAgc3dpdGNoIChwYXlsb2FkLmFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSAnb3Blbl9yb29tX3NldHRpbmdzJzpcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coUm9vbVNldHRpbmdzRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgIHJvb21JZDogcGF5bG9hZC5yb29tX2lkIHx8IFJvb21WaWV3U3RvcmUuaW5zdGFuY2UuZ2V0Um9vbUlkKCksXG4gICAgICAgICAgICAgICAgICAgIGluaXRpYWxUYWJJZDogcGF5bG9hZC5pbml0aWFsX3RhYl9pZCxcbiAgICAgICAgICAgICAgICB9LCAvKmNsYXNzTmFtZT0qL251bGwsIC8qaXNQcmlvcml0eT0qL2ZhbHNlLCAvKmlzU3RhdGljPSovdHJ1ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5PcGVuRm9yd2FyZERpYWxvZzpcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRm9yd2FyZERpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICBtYXRyaXhDbGllbnQ6IE1hdHJpeENsaWVudFBlZy5nZXQoKSxcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IHBheWxvYWQuZXZlbnQsXG4gICAgICAgICAgICAgICAgICAgIHBlcm1hbGlua0NyZWF0b3I6IHBheWxvYWQucGVybWFsaW5rQ3JlYXRvcixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLk9wZW5SZXBvcnRFdmVudERpYWxvZzpcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coUmVwb3J0RXZlbnREaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgbXhFdmVudDogcGF5bG9hZC5ldmVudCxcbiAgICAgICAgICAgICAgICB9LCAnbXhfRGlhbG9nX3JlcG9ydEV2ZW50Jyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5PcGVuU3BhY2VQcmVmZXJlbmNlczpcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coU3BhY2VQcmVmZXJlbmNlc0RpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICBpbml0aWFsVGFiSWQ6IHBheWxvYWQuaW5pdGFsVGFiSWQsXG4gICAgICAgICAgICAgICAgICAgIHNwYWNlOiBwYXlsb2FkLnNwYWNlLFxuICAgICAgICAgICAgICAgIH0sIG51bGwsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLk9wZW5TcGFjZVNldHRpbmdzOlxuICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhTcGFjZVNldHRpbmdzRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgIG1hdHJpeENsaWVudDogcGF5bG9hZC5zcGFjZS5jbGllbnQsXG4gICAgICAgICAgICAgICAgICAgIHNwYWNlOiBwYXlsb2FkLnNwYWNlLFxuICAgICAgICAgICAgICAgIH0sIC8qY2xhc3NOYW1lPSovbnVsbCwgLyppc1ByaW9yaXR5PSovZmFsc2UsIC8qaXNTdGF0aWM9Ki90cnVlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLk9wZW5JbnZpdGVEaWFsb2c6XG4gICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEludml0ZURpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICBraW5kOiBwYXlsb2FkLmtpbmQsXG4gICAgICAgICAgICAgICAgICAgIGNhbGw6IHBheWxvYWQuY2FsbCxcbiAgICAgICAgICAgICAgICAgICAgcm9vbUlkOiBwYXlsb2FkLnJvb21JZCxcbiAgICAgICAgICAgICAgICB9LCBjbGFzc25hbWVzKFwibXhfSW52aXRlRGlhbG9nX2ZsZXhXcmFwcGVyXCIsIHBheWxvYWQuY2xhc3NOYW1lKSwgZmFsc2UsIHRydWUpLmZpbmlzaGVkXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKChyZXN1bHRzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXlsb2FkLm9uRmluaXNoZWRDYWxsYmFjaz8uKHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLk9wZW5BZGRUb0V4aXN0aW5nU3BhY2VEaWFsb2c6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBzcGFjZSA9IHBheWxvYWQuc3BhY2U7XG4gICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKFxuICAgICAgICAgICAgICAgICAgICBBZGRFeGlzdGluZ1RvU3BhY2VEaWFsb2csXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ3JlYXRlUm9vbUNsaWNrOiAoZXY6IEJ1dHRvbkV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd0NyZWF0ZU5ld1Jvb20oc3BhY2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFBvc3Rob2dUcmFja2Vycy50cmFja0ludGVyYWN0aW9uKFwiV2ViQWRkRXhpc3RpbmdUb1NwYWNlRGlhbG9nQ3JlYXRlUm9vbUJ1dHRvblwiLCBldik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgb25BZGRTdWJzcGFjZUNsaWNrOiAoKSA9PiBzaG93QWRkRXhpc3RpbmdTdWJzcGFjZShzcGFjZSksXG4gICAgICAgICAgICAgICAgICAgICAgICBzcGFjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ6IChhZGRlZDogYm9vbGVhbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhZGRlZCAmJiBSb29tVmlld1N0b3JlLmluc3RhbmNlLmdldFJvb21JZCgpID09PSBzcGFjZS5yb29tSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZmlyZShBY3Rpb24uVXBkYXRlU3BhY2VIaWVyYXJjaHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIFwibXhfQWRkRXhpc3RpbmdUb1NwYWNlRGlhbG9nX3dyYXBwZXJcIixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPLE1BQU1BLFlBQU4sQ0FBbUI7RUFLZEMsV0FBVyxHQUFHO0lBQUEsb0RBRkMsS0FFRDtJQUFBLGtEQVdBQyxPQUFELElBQTRCO01BQzdDLFFBQVFBLE9BQU8sQ0FBQ0MsTUFBaEI7UUFDSSxLQUFLLG9CQUFMO1VBQ0lDLGNBQUEsQ0FBTUMsWUFBTixDQUFtQkMsMkJBQW5CLEVBQXVDO1lBQ25DQyxNQUFNLEVBQUVMLE9BQU8sQ0FBQ00sT0FBUixJQUFtQkMsNEJBQUEsQ0FBY0MsUUFBZCxDQUF1QkMsU0FBdkIsRUFEUTtZQUVuQ0MsWUFBWSxFQUFFVixPQUFPLENBQUNXO1VBRmEsQ0FBdkM7VUFHRztVQUFjLElBSGpCO1VBR3VCO1VBQWUsS0FIdEM7VUFHNkM7VUFBYSxJQUgxRDs7VUFJQTs7UUFDSixLQUFLQyxlQUFBLENBQU9DLGlCQUFaO1VBQ0lYLGNBQUEsQ0FBTUMsWUFBTixDQUFtQlcsc0JBQW5CLEVBQWtDO1lBQzlCQyxZQUFZLEVBQUVDLGdDQUFBLENBQWdCQyxHQUFoQixFQURnQjtZQUU5QkMsS0FBSyxFQUFFbEIsT0FBTyxD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