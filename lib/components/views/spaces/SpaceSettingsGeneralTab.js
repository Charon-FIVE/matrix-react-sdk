"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _event = require("matrix-js-sdk/src/@types/event");

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _SpaceBasicSettings = _interopRequireDefault(require("./SpaceBasicSettings"));

var _Avatar = require("../../../Avatar");

var _serialize = require("../../../editor/serialize");

var _leaveBehaviour = require("../../../utils/leave-behaviour");

var _useTopic = require("../../../hooks/room/useTopic");

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
const SpaceSettingsGeneralTab = _ref => {
  let {
    matrixClient: cli,
    space,
    onFinished
  } = _ref;
  const [busy, setBusy] = (0, _react.useState)(false);
  const [error, setError] = (0, _react.useState)("");
  const userId = cli.getUserId();
  const [newAvatar, setNewAvatar] = (0, _react.useState)(null); // undefined means to remove avatar

  const canSetAvatar = space.currentState.maySendStateEvent(_event.EventType.RoomAvatar, userId);
  const avatarChanged = newAvatar !== null;
  const [name, setName] = (0, _react.useState)(space.name);
  const canSetName = space.currentState.maySendStateEvent(_event.EventType.RoomName, userId);
  const nameChanged = name !== space.name;
  const currentTopic = (0, _useTopic.getTopic)(space)?.text;
  const [topic, setTopic] = (0, _react.useState)(currentTopic);
  const canSetTopic = space.currentState.maySendStateEvent(_event.EventType.RoomTopic, userId);
  const topicChanged = topic !== currentTopic;

  const onCancel = () => {
    setNewAvatar(null);
    setName(space.name);
    setTopic(currentTopic);
  };

  const onSave = async () => {
    setBusy(true);
    const promises = [];

    if (avatarChanged) {
      if (newAvatar) {
        promises.push(cli.sendStateEvent(space.roomId, _event.EventType.RoomAvatar, {
          url: await cli.uploadContent(newAvatar)
        }, ""));
      } else {
        promises.push(cli.sendStateEvent(space.roomId, _event.EventType.RoomAvatar, {}, ""));
      }
    }

    if (nameChanged) {
      promises.push(cli.setRoomName(space.roomId, name));
    }

    if (topicChanged) {
      const htmlTopic = (0, _serialize.htmlSerializeFromMdIfNeeded)(topic, {
        forceHTML: false
      });
      promises.push(cli.setRoomTopic(space.roomId, topic, htmlTopic));
    }

    const results = await Promise.allSettled(promises);
    setBusy(false);
    const failures = results.filter(r => r.status === "rejected");

    if (failures.length > 0) {
      _logger.logger.error("Failed to save space settings: ", failures);

      setError((0, _languageHandler._t)("Failed to save space settings."));
    }
  };

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SettingsTab"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SettingsTab_heading"
  }, (0, _languageHandler._t)("General")), /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Edit settings relating to your space.")), error && /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceRoomView_errorText"
  }, error), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SettingsTab_section"
  }, /*#__PURE__*/_react.default.createElement(_SpaceBasicSettings.default, {
    avatarUrl: (0, _Avatar.avatarUrlForRoom)(space, 80, 80, "crop"),
    avatarDisabled: busy || !canSetAvatar,
    setAvatar: setNewAvatar,
    name: name,
    nameDisabled: busy || !canSetName,
    setName: setName,
    topic: topic,
    topicDisabled: busy || !canSetTopic,
    setTopic: setTopic
  }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    onClick: onCancel,
    disabled: busy || !(avatarChanged || nameChanged || topicChanged),
    kind: "link"
  }, (0, _languageHandler._t)("Cancel")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    onClick: onSave,
    disabled: busy,
    kind: "primary"
  }, busy ? (0, _languageHandler._t)("Saving...") : (0, _languageHandler._t)("Save Changes"))), /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_SettingsTab_subheading"
  }, (0, _languageHandler._t)("Leave Space")), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SettingsTab_section mx_SettingsTab_subsectionText"
  }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    kind: "danger",
    onClick: () => {
      (0, _leaveBehaviour.leaveSpace)(space);
    }
  }, (0, _languageHandler._t)("Leave Space"))));
};

var _default = SpaceSettingsGeneralTab;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTcGFjZVNldHRpbmdzR2VuZXJhbFRhYiIsIm1hdHJpeENsaWVudCIsImNsaSIsInNwYWNlIiwib25GaW5pc2hlZCIsImJ1c3kiLCJzZXRCdXN5IiwidXNlU3RhdGUiLCJlcnJvciIsInNldEVycm9yIiwidXNlcklkIiwiZ2V0VXNlcklkIiwibmV3QXZhdGFyIiwic2V0TmV3QXZhdGFyIiwiY2FuU2V0QXZhdGFyIiwiY3VycmVudFN0YXRlIiwibWF5U2VuZFN0YXRlRXZlbnQiLCJFdmVudFR5cGUiLCJSb29tQXZhdGFyIiwiYXZhdGFyQ2hhbmdlZCIsIm5hbWUiLCJzZXROYW1lIiwiY2FuU2V0TmFtZSIsIlJvb21OYW1lIiwibmFtZUNoYW5nZWQiLCJjdXJyZW50VG9waWMiLCJnZXRUb3BpYyIsInRleHQiLCJ0b3BpYyIsInNldFRvcGljIiwiY2FuU2V0VG9waWMiLCJSb29tVG9waWMiLCJ0b3BpY0NoYW5nZWQiLCJvbkNhbmNlbCIsIm9uU2F2ZSIsInByb21pc2VzIiwicHVzaCIsInNlbmRTdGF0ZUV2ZW50Iiwicm9vbUlkIiwidXJsIiwidXBsb2FkQ29udGVudCIsInNldFJvb21OYW1lIiwiaHRtbFRvcGljIiwiaHRtbFNlcmlhbGl6ZUZyb21NZElmTmVlZGVkIiwiZm9yY2VIVE1MIiwic2V0Um9vbVRvcGljIiwicmVzdWx0cyIsIlByb21pc2UiLCJhbGxTZXR0bGVkIiwiZmFpbHVyZXMiLCJmaWx0ZXIiLCJyIiwic3RhdHVzIiwibGVuZ3RoIiwibG9nZ2VyIiwiX3QiLCJhdmF0YXJVcmxGb3JSb29tIiwibGVhdmVTcGFjZSJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NwYWNlcy9TcGFjZVNldHRpbmdzR2VuZXJhbFRhYi50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY2xpZW50XCI7XG5pbXBvcnQgeyBFdmVudFR5cGUgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL2V2ZW50XCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5cbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBTcGFjZUJhc2ljU2V0dGluZ3MgZnJvbSBcIi4vU3BhY2VCYXNpY1NldHRpbmdzXCI7XG5pbXBvcnQgeyBhdmF0YXJVcmxGb3JSb29tIH0gZnJvbSBcIi4uLy4uLy4uL0F2YXRhclwiO1xuaW1wb3J0IHsgSURpYWxvZ1Byb3BzIH0gZnJvbSBcIi4uL2RpYWxvZ3MvSURpYWxvZ1Byb3BzXCI7XG5pbXBvcnQgeyBodG1sU2VyaWFsaXplRnJvbU1kSWZOZWVkZWQgfSBmcm9tIFwiLi4vLi4vLi4vZWRpdG9yL3NlcmlhbGl6ZVwiO1xuaW1wb3J0IHsgbGVhdmVTcGFjZSB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9sZWF2ZS1iZWhhdmlvdXJcIjtcbmltcG9ydCB7IGdldFRvcGljIH0gZnJvbSBcIi4uLy4uLy4uL2hvb2tzL3Jvb20vdXNlVG9waWNcIjtcblxuaW50ZXJmYWNlIElQcm9wcyBleHRlbmRzIElEaWFsb2dQcm9wcyB7XG4gICAgbWF0cml4Q2xpZW50OiBNYXRyaXhDbGllbnQ7XG4gICAgc3BhY2U6IFJvb207XG59XG5cbmNvbnN0IFNwYWNlU2V0dGluZ3NHZW5lcmFsVGFiID0gKHsgbWF0cml4Q2xpZW50OiBjbGksIHNwYWNlLCBvbkZpbmlzaGVkIH06IElQcm9wcykgPT4ge1xuICAgIGNvbnN0IFtidXN5LCBzZXRCdXN5XSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlKFwiXCIpO1xuXG4gICAgY29uc3QgdXNlcklkID0gY2xpLmdldFVzZXJJZCgpO1xuXG4gICAgY29uc3QgW25ld0F2YXRhciwgc2V0TmV3QXZhdGFyXSA9IHVzZVN0YXRlPEZpbGU+KG51bGwpOyAvLyB1bmRlZmluZWQgbWVhbnMgdG8gcmVtb3ZlIGF2YXRhclxuICAgIGNvbnN0IGNhblNldEF2YXRhciA9IHNwYWNlLmN1cnJlbnRTdGF0ZS5tYXlTZW5kU3RhdGVFdmVudChFdmVudFR5cGUuUm9vbUF2YXRhciwgdXNlcklkKTtcbiAgICBjb25zdCBhdmF0YXJDaGFuZ2VkID0gbmV3QXZhdGFyICE9PSBudWxsO1xuXG4gICAgY29uc3QgW25hbWUsIHNldE5hbWVdID0gdXNlU3RhdGU8c3RyaW5nPihzcGFjZS5uYW1lKTtcbiAgICBjb25zdCBjYW5TZXROYW1lID0gc3BhY2UuY3VycmVudFN0YXRlLm1heVNlbmRTdGF0ZUV2ZW50KEV2ZW50VHlwZS5Sb29tTmFtZSwgdXNlcklkKTtcbiAgICBjb25zdCBuYW1lQ2hhbmdlZCA9IG5hbWUgIT09IHNwYWNlLm5hbWU7XG5cbiAgICBjb25zdCBjdXJyZW50VG9waWMgPSBnZXRUb3BpYyhzcGFjZSk/LnRleHQ7XG4gICAgY29uc3QgW3RvcGljLCBzZXRUb3BpY10gPSB1c2VTdGF0ZTxzdHJpbmc+KGN1cnJlbnRUb3BpYyk7XG4gICAgY29uc3QgY2FuU2V0VG9waWMgPSBzcGFjZS5jdXJyZW50U3RhdGUubWF5U2VuZFN0YXRlRXZlbnQoRXZlbnRUeXBlLlJvb21Ub3BpYywgdXNlcklkKTtcbiAgICBjb25zdCB0b3BpY0NoYW5nZWQgPSB0b3BpYyAhPT0gY3VycmVudFRvcGljO1xuXG4gICAgY29uc3Qgb25DYW5jZWwgPSAoKSA9PiB7XG4gICAgICAgIHNldE5ld0F2YXRhcihudWxsKTtcbiAgICAgICAgc2V0TmFtZShzcGFjZS5uYW1lKTtcbiAgICAgICAgc2V0VG9waWMoY3VycmVudFRvcGljKTtcbiAgICB9O1xuXG4gICAgY29uc3Qgb25TYXZlID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBzZXRCdXN5KHRydWUpO1xuICAgICAgICBjb25zdCBwcm9taXNlcyA9IFtdO1xuXG4gICAgICAgIGlmIChhdmF0YXJDaGFuZ2VkKSB7XG4gICAgICAgICAgICBpZiAobmV3QXZhdGFyKSB7XG4gICAgICAgICAgICAgICAgcHJvbWlzZXMucHVzaChjbGkuc2VuZFN0YXRlRXZlbnQoc3BhY2Uucm9vbUlkLCBFdmVudFR5cGUuUm9vbUF2YXRhciwge1xuICAgICAgICAgICAgICAgICAgICB1cmw6IGF3YWl0IGNsaS51cGxvYWRDb250ZW50KG5ld0F2YXRhciksXG4gICAgICAgICAgICAgICAgfSwgXCJcIikpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKGNsaS5zZW5kU3RhdGVFdmVudChzcGFjZS5yb29tSWQsIEV2ZW50VHlwZS5Sb29tQXZhdGFyLCB7fSwgXCJcIikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5hbWVDaGFuZ2VkKSB7XG4gICAgICAgICAgICBwcm9taXNlcy5wdXNoKGNsaS5zZXRSb29tTmFtZShzcGFjZS5yb29tSWQsIG5hbWUpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0b3BpY0NoYW5nZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IGh0bWxUb3BpYyA9IGh0bWxTZXJpYWxpemVGcm9tTWRJZk5lZWRlZCh0b3BpYywgeyBmb3JjZUhUTUw6IGZhbHNlIH0pO1xuICAgICAgICAgICAgcHJvbWlzZXMucHVzaChjbGkuc2V0Um9vbVRvcGljKHNwYWNlLnJvb21JZCwgdG9waWMsIGh0bWxUb3BpYykpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IFByb21pc2UuYWxsU2V0dGxlZChwcm9taXNlcyk7XG4gICAgICAgIHNldEJ1c3koZmFsc2UpO1xuICAgICAgICBjb25zdCBmYWlsdXJlcyA9IHJlc3VsdHMuZmlsdGVyKHIgPT4gci5zdGF0dXMgPT09IFwicmVqZWN0ZWRcIik7XG4gICAgICAgIGlmIChmYWlsdXJlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJGYWlsZWQgdG8gc2F2ZSBzcGFjZSBzZXR0aW5nczogXCIsIGZhaWx1cmVzKTtcbiAgICAgICAgICAgIHNldEVycm9yKF90KFwiRmFpbGVkIHRvIHNhdmUgc3BhY2Ugc2V0dGluZ3MuXCIpKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYlwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX2hlYWRpbmdcIj57IF90KFwiR2VuZXJhbFwiKSB9PC9kaXY+XG5cbiAgICAgICAgPGRpdj57IF90KFwiRWRpdCBzZXR0aW5ncyByZWxhdGluZyB0byB5b3VyIHNwYWNlLlwiKSB9PC9kaXY+XG5cbiAgICAgICAgeyBlcnJvciAmJiA8ZGl2IGNsYXNzTmFtZT1cIm14X1NwYWNlUm9vbVZpZXdfZXJyb3JUZXh0XCI+eyBlcnJvciB9PC9kaXY+IH1cblxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3NlY3Rpb25cIj5cbiAgICAgICAgICAgIDxTcGFjZUJhc2ljU2V0dGluZ3NcbiAgICAgICAgICAgICAgICBhdmF0YXJVcmw9e2F2YXRhclVybEZvclJvb20oc3BhY2UsIDgwLCA4MCwgXCJjcm9wXCIpfVxuICAgICAgICAgICAgICAgIGF2YXRhckRpc2FibGVkPXtidXN5IHx8ICFjYW5TZXRBdmF0YXJ9XG4gICAgICAgICAgICAgICAgc2V0QXZhdGFyPXtzZXROZXdBdmF0YXJ9XG4gICAgICAgICAgICAgICAgbmFtZT17bmFtZX1cbiAgICAgICAgICAgICAgICBuYW1lRGlzYWJsZWQ9e2J1c3kgfHwgIWNhblNldE5hbWV9XG4gICAgICAgICAgICAgICAgc2V0TmFtZT17c2V0TmFtZX1cbiAgICAgICAgICAgICAgICB0b3BpYz17dG9waWN9XG4gICAgICAgICAgICAgICAgdG9waWNEaXNhYmxlZD17YnVzeSB8fCAhY2FuU2V0VG9waWN9XG4gICAgICAgICAgICAgICAgc2V0VG9waWM9e3NldFRvcGljfVxuICAgICAgICAgICAgLz5cblxuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXtvbkNhbmNlbH1cbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17YnVzeSB8fCAhKGF2YXRhckNoYW5nZWQgfHwgbmFtZUNoYW5nZWQgfHwgdG9waWNDaGFuZ2VkKX1cbiAgICAgICAgICAgICAgICBraW5kPVwibGlua1wiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyBfdChcIkNhbmNlbFwiKSB9XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXtvblNhdmV9IGRpc2FibGVkPXtidXN5fSBraW5kPVwicHJpbWFyeVwiPlxuICAgICAgICAgICAgICAgIHsgYnVzeSA/IF90KFwiU2F2aW5nLi4uXCIpIDogX3QoXCJTYXZlIENoYW5nZXNcIikgfVxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nXCI+eyBfdChcIkxlYXZlIFNwYWNlXCIpIH08L3NwYW4+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc2VjdGlvbiBteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dFwiPlxuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICBraW5kPVwiZGFuZ2VyXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxlYXZlU3BhY2Uoc3BhY2UpO1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyBfdChcIkxlYXZlIFNwYWNlXCIpIH1cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgPC9kaXY+O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgU3BhY2VTZXR0aW5nc0dlbmVyYWxUYWI7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWdCQTs7QUFHQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7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