"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.SpaceSettingsTab = void 0;

var _react = _interopRequireWildcard(require("react"));

var _languageHandler = require("../../../languageHandler");

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _useDispatcher = require("../../../hooks/useDispatcher");

var _TabbedView = _interopRequireWildcard(require("../../structures/TabbedView"));

var _SpaceSettingsGeneralTab = _interopRequireDefault(require("../spaces/SpaceSettingsGeneralTab"));

var _SpaceSettingsVisibilityTab = _interopRequireDefault(require("../spaces/SpaceSettingsVisibilityTab"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _UIFeature = require("../../../settings/UIFeature");

var _AdvancedRoomSettingsTab = _interopRequireDefault(require("../settings/tabs/room/AdvancedRoomSettingsTab"));

var _RolesRoomSettingsTab = _interopRequireDefault(require("../settings/tabs/room/RolesRoomSettingsTab"));

var _actions = require("../../../dispatcher/actions");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2021 The Matrix.org Foundation C.I.C.

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
let SpaceSettingsTab;
exports.SpaceSettingsTab = SpaceSettingsTab;

(function (SpaceSettingsTab) {
  SpaceSettingsTab["General"] = "SPACE_GENERAL_TAB";
  SpaceSettingsTab["Visibility"] = "SPACE_VISIBILITY_TAB";
  SpaceSettingsTab["Roles"] = "SPACE_ROLES_TAB";
  SpaceSettingsTab["Advanced"] = "SPACE_ADVANCED_TAB";
})(SpaceSettingsTab || (exports.SpaceSettingsTab = SpaceSettingsTab = {}));

const SpaceSettingsDialog = _ref => {
  let {
    matrixClient: cli,
    space,
    onFinished
  } = _ref;
  (0, _useDispatcher.useDispatcher)(_dispatcher.default, payload => {
    if (payload.action === _actions.Action.AfterLeaveRoom && payload.room_id === space.roomId) {
      onFinished(false);
    }
  });
  const tabs = (0, _react.useMemo)(() => {
    return [new _TabbedView.Tab(SpaceSettingsTab.General, (0, _languageHandler._td)("General"), "mx_SpaceSettingsDialog_generalIcon", /*#__PURE__*/_react.default.createElement(_SpaceSettingsGeneralTab.default, {
      matrixClient: cli,
      space: space,
      onFinished: onFinished
    })), new _TabbedView.Tab(SpaceSettingsTab.Visibility, (0, _languageHandler._td)("Visibility"), "mx_SpaceSettingsDialog_visibilityIcon", /*#__PURE__*/_react.default.createElement(_SpaceSettingsVisibilityTab.default, {
      matrixClient: cli,
      space: space,
      closeSettingsFn: onFinished
    })), new _TabbedView.Tab(SpaceSettingsTab.Roles, (0, _languageHandler._td)("Roles & Permissions"), "mx_RoomSettingsDialog_rolesIcon", /*#__PURE__*/_react.default.createElement(_RolesRoomSettingsTab.default, {
      roomId: space.roomId
    })), _SettingsStore.default.getValue(_UIFeature.UIFeature.AdvancedSettings) ? new _TabbedView.Tab(SpaceSettingsTab.Advanced, (0, _languageHandler._td)("Advanced"), "mx_RoomSettingsDialog_warningIcon", /*#__PURE__*/_react.default.createElement(_AdvancedRoomSettingsTab.default, {
      roomId: space.roomId,
      closeSettingsFn: onFinished
    })) : null].filter(Boolean);
  }, [cli, space, onFinished]);
  return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
    title: (0, _languageHandler._t)("Space settings"),
    className: "mx_SpaceSettingsDialog",
    contentId: "mx_SpaceSettingsDialog",
    onFinished: onFinished,
    fixedWidth: false
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceSettingsDialog_content",
    id: "mx_SpaceSettingsDialog",
    title: (0, _languageHandler._t)("Settings - %(spaceName)s", {
      spaceName: space.name
    })
  }, /*#__PURE__*/_react.default.createElement(_TabbedView.default, {
    tabs: tabs
  })));
};

var _default = SpaceSettingsDialog;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTcGFjZVNldHRpbmdzVGFiIiwiU3BhY2VTZXR0aW5nc0RpYWxvZyIsIm1hdHJpeENsaWVudCIsImNsaSIsInNwYWNlIiwib25GaW5pc2hlZCIsInVzZURpc3BhdGNoZXIiLCJkZWZhdWx0RGlzcGF0Y2hlciIsInBheWxvYWQiLCJhY3Rpb24iLCJBY3Rpb24iLCJBZnRlckxlYXZlUm9vbSIsInJvb21faWQiLCJyb29tSWQiLCJ0YWJzIiwidXNlTWVtbyIsIlRhYiIsIkdlbmVyYWwiLCJfdGQiLCJWaXNpYmlsaXR5IiwiUm9sZXMiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJVSUZlYXR1cmUiLCJBZHZhbmNlZFNldHRpbmdzIiwiQWR2YW5jZWQiLCJmaWx0ZXIiLCJCb29sZWFuIiwiX3QiLCJzcGFjZU5hbWUiLCJuYW1lIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9TcGFjZVNldHRpbmdzRGlhbG9nLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlTWVtbyB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCB7IE1hdHJpeENsaWVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jbGllbnRcIjtcblxuaW1wb3J0IHsgX3QsIF90ZCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgeyBJRGlhbG9nUHJvcHMgfSBmcm9tIFwiLi9JRGlhbG9nUHJvcHNcIjtcbmltcG9ydCBCYXNlRGlhbG9nIGZyb20gXCIuL0Jhc2VEaWFsb2dcIjtcbmltcG9ydCBkZWZhdWx0RGlzcGF0Y2hlciBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgeyB1c2VEaXNwYXRjaGVyIH0gZnJvbSBcIi4uLy4uLy4uL2hvb2tzL3VzZURpc3BhdGNoZXJcIjtcbmltcG9ydCBUYWJiZWRWaWV3LCB7IFRhYiB9IGZyb20gXCIuLi8uLi9zdHJ1Y3R1cmVzL1RhYmJlZFZpZXdcIjtcbmltcG9ydCBTcGFjZVNldHRpbmdzR2VuZXJhbFRhYiBmcm9tICcuLi9zcGFjZXMvU3BhY2VTZXR0aW5nc0dlbmVyYWxUYWInO1xuaW1wb3J0IFNwYWNlU2V0dGluZ3NWaXNpYmlsaXR5VGFiIGZyb20gXCIuLi9zcGFjZXMvU3BhY2VTZXR0aW5nc1Zpc2liaWxpdHlUYWJcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgeyBVSUZlYXR1cmUgfSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvVUlGZWF0dXJlXCI7XG5pbXBvcnQgQWR2YW5jZWRSb29tU2V0dGluZ3NUYWIgZnJvbSBcIi4uL3NldHRpbmdzL3RhYnMvcm9vbS9BZHZhbmNlZFJvb21TZXR0aW5nc1RhYlwiO1xuaW1wb3J0IFJvbGVzUm9vbVNldHRpbmdzVGFiIGZyb20gXCIuLi9zZXR0aW5ncy90YWJzL3Jvb20vUm9sZXNSb29tU2V0dGluZ3NUYWJcIjtcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9ucyc7XG5cbmV4cG9ydCBlbnVtIFNwYWNlU2V0dGluZ3NUYWIge1xuICAgIEdlbmVyYWwgPSBcIlNQQUNFX0dFTkVSQUxfVEFCXCIsXG4gICAgVmlzaWJpbGl0eSA9IFwiU1BBQ0VfVklTSUJJTElUWV9UQUJcIixcbiAgICBSb2xlcyA9IFwiU1BBQ0VfUk9MRVNfVEFCXCIsXG4gICAgQWR2YW5jZWQgPSBcIlNQQUNFX0FEVkFOQ0VEX1RBQlwiLFxufVxuXG5pbnRlcmZhY2UgSVByb3BzIGV4dGVuZHMgSURpYWxvZ1Byb3BzIHtcbiAgICBtYXRyaXhDbGllbnQ6IE1hdHJpeENsaWVudDtcbiAgICBzcGFjZTogUm9vbTtcbn1cblxuY29uc3QgU3BhY2VTZXR0aW5nc0RpYWxvZzogUmVhY3QuRkM8SVByb3BzPiA9ICh7IG1hdHJpeENsaWVudDogY2xpLCBzcGFjZSwgb25GaW5pc2hlZCB9KSA9PiB7XG4gICAgdXNlRGlzcGF0Y2hlcihkZWZhdWx0RGlzcGF0Y2hlciwgKHBheWxvYWQpID0+IHtcbiAgICAgICAgaWYgKHBheWxvYWQuYWN0aW9uID09PSBBY3Rpb24uQWZ0ZXJMZWF2ZVJvb20gJiYgcGF5bG9hZC5yb29tX2lkID09PSBzcGFjZS5yb29tSWQpIHtcbiAgICAgICAgICAgIG9uRmluaXNoZWQoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCB0YWJzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBuZXcgVGFiKFxuICAgICAgICAgICAgICAgIFNwYWNlU2V0dGluZ3NUYWIuR2VuZXJhbCxcbiAgICAgICAgICAgICAgICBfdGQoXCJHZW5lcmFsXCIpLFxuICAgICAgICAgICAgICAgIFwibXhfU3BhY2VTZXR0aW5nc0RpYWxvZ19nZW5lcmFsSWNvblwiLFxuICAgICAgICAgICAgICAgIDxTcGFjZVNldHRpbmdzR2VuZXJhbFRhYiBtYXRyaXhDbGllbnQ9e2NsaX0gc3BhY2U9e3NwYWNlfSBvbkZpbmlzaGVkPXtvbkZpbmlzaGVkfSAvPixcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBuZXcgVGFiKFxuICAgICAgICAgICAgICAgIFNwYWNlU2V0dGluZ3NUYWIuVmlzaWJpbGl0eSxcbiAgICAgICAgICAgICAgICBfdGQoXCJWaXNpYmlsaXR5XCIpLFxuICAgICAgICAgICAgICAgIFwibXhfU3BhY2VTZXR0aW5nc0RpYWxvZ192aXNpYmlsaXR5SWNvblwiLFxuICAgICAgICAgICAgICAgIDxTcGFjZVNldHRpbmdzVmlzaWJpbGl0eVRhYiBtYXRyaXhDbGllbnQ9e2NsaX0gc3BhY2U9e3NwYWNlfSBjbG9zZVNldHRpbmdzRm49e29uRmluaXNoZWR9IC8+LFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIG5ldyBUYWIoXG4gICAgICAgICAgICAgICAgU3BhY2VTZXR0aW5nc1RhYi5Sb2xlcyxcbiAgICAgICAgICAgICAgICBfdGQoXCJSb2xlcyAmIFBlcm1pc3Npb25zXCIpLFxuICAgICAgICAgICAgICAgIFwibXhfUm9vbVNldHRpbmdzRGlhbG9nX3JvbGVzSWNvblwiLFxuICAgICAgICAgICAgICAgIDxSb2xlc1Jvb21TZXR0aW5nc1RhYiByb29tSWQ9e3NwYWNlLnJvb21JZH0gLz4sXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShVSUZlYXR1cmUuQWR2YW5jZWRTZXR0aW5ncylcbiAgICAgICAgICAgICAgICA/IG5ldyBUYWIoXG4gICAgICAgICAgICAgICAgICAgIFNwYWNlU2V0dGluZ3NUYWIuQWR2YW5jZWQsXG4gICAgICAgICAgICAgICAgICAgIF90ZChcIkFkdmFuY2VkXCIpLFxuICAgICAgICAgICAgICAgICAgICBcIm14X1Jvb21TZXR0aW5nc0RpYWxvZ193YXJuaW5nSWNvblwiLFxuICAgICAgICAgICAgICAgICAgICA8QWR2YW5jZWRSb29tU2V0dGluZ3NUYWIgcm9vbUlkPXtzcGFjZS5yb29tSWR9IGNsb3NlU2V0dGluZ3NGbj17b25GaW5pc2hlZH0gLz4sXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIDogbnVsbCxcbiAgICAgICAgXS5maWx0ZXIoQm9vbGVhbik7XG4gICAgfSwgW2NsaSwgc3BhY2UsIG9uRmluaXNoZWRdKTtcblxuICAgIHJldHVybiA8QmFzZURpYWxvZ1xuICAgICAgICB0aXRsZT17X3QoXCJTcGFjZSBzZXR0aW5nc1wiKX1cbiAgICAgICAgY2xhc3NOYW1lPVwibXhfU3BhY2VTZXR0aW5nc0RpYWxvZ1wiXG4gICAgICAgIGNvbnRlbnRJZD1cIm14X1NwYWNlU2V0dGluZ3NEaWFsb2dcIlxuICAgICAgICBvbkZpbmlzaGVkPXtvbkZpbmlzaGVkfVxuICAgICAgICBmaXhlZFdpZHRoPXtmYWxzZX1cbiAgICA+XG4gICAgICAgIDxkaXZcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1NwYWNlU2V0dGluZ3NEaWFsb2dfY29udGVudFwiXG4gICAgICAgICAgICBpZD1cIm14X1NwYWNlU2V0dGluZ3NEaWFsb2dcIlxuICAgICAgICAgICAgdGl0bGU9e190KFwiU2V0dGluZ3MgLSAlKHNwYWNlTmFtZSlzXCIsIHsgc3BhY2VOYW1lOiBzcGFjZS5uYW1lIH0pfVxuICAgICAgICA+XG4gICAgICAgICAgICA8VGFiYmVkVmlldyB0YWJzPXt0YWJzfSAvPlxuICAgICAgICA8L2Rpdj5cbiAgICA8L0Jhc2VEaWFsb2c+O1xufTtcblxu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