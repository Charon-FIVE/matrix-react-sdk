"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _languageHandler = require("../../../languageHandler");

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _Event = require("./devtools/Event");

var _ServersInRoom = _interopRequireDefault(require("./devtools/ServersInRoom"));

var _VerificationExplorer = _interopRequireDefault(require("./devtools/VerificationExplorer"));

var _SettingExplorer = _interopRequireDefault(require("./devtools/SettingExplorer"));

var _RoomState = require("./devtools/RoomState");

var _BaseTool = _interopRequireWildcard(require("./devtools/BaseTool"));

var _WidgetExplorer = _interopRequireDefault(require("./devtools/WidgetExplorer"));

var _AccountData = require("./devtools/AccountData");

var _SettingsFlag = _interopRequireDefault(require("../elements/SettingsFlag"));

var _SettingLevel = require("../../../settings/SettingLevel");

var _ServerInfo = _interopRequireDefault(require("./devtools/ServerInfo"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2022 Michael Telatynski <7t3chguy@gmail.com>
Copyright 2018-2021 The Matrix.org Foundation C.I.C.

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
var Category;

(function (Category) {
  Category[Category["Room"] = 0] = "Room";
  Category[Category["Other"] = 1] = "Other";
})(Category || (Category = {}));

const categoryLabels = {
  [Category.Room]: (0, _languageHandler._td)("Room"),
  [Category.Other]: (0, _languageHandler._td)("Other")
};
const Tools = {
  [Category.Room]: [[(0, _languageHandler._td)("Send custom timeline event"), _Event.TimelineEventEditor], [(0, _languageHandler._td)("Explore room state"), _RoomState.RoomStateExplorer], [(0, _languageHandler._td)("Explore room account data"), _AccountData.RoomAccountDataExplorer], [(0, _languageHandler._td)("View servers in room"), _ServersInRoom.default], [(0, _languageHandler._td)("Verification explorer"), _VerificationExplorer.default], [(0, _languageHandler._td)("Active Widgets"), _WidgetExplorer.default]],
  [Category.Other]: [[(0, _languageHandler._td)("Explore account data"), _AccountData.AccountDataExplorer], [(0, _languageHandler._td)("Settings explorer"), _SettingExplorer.default], [(0, _languageHandler._td)("Server info"), _ServerInfo.default]]
};

const DevtoolsDialog = _ref => {
  let {
    roomId,
    onFinished
  } = _ref;
  const [tool, setTool] = (0, _react.useState)(null);
  let body;
  let onBack;

  if (tool) {
    onBack = () => {
      setTool(null);
    };

    const Tool = tool[1];
    body = /*#__PURE__*/_react.default.createElement(Tool, {
      onBack: onBack,
      setTool: (label, tool) => setTool([label, tool])
    });
  } else {
    const onBack = () => {
      onFinished(false);
    };

    body = /*#__PURE__*/_react.default.createElement(_BaseTool.default, {
      onBack: onBack
    }, Object.entries(Tools).map(_ref2 => {
      let [category, tools] = _ref2;
      return /*#__PURE__*/_react.default.createElement("div", {
        key: category
      }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)(categoryLabels[category])), tools.map(_ref3 => {
        let [label, tool] = _ref3;

        const onClick = () => {
          setTool([label, tool]);
        };

        return /*#__PURE__*/_react.default.createElement("button", {
          className: "mx_DevTools_button",
          key: label,
          onClick: onClick
        }, (0, _languageHandler._t)(label));
      }));
    }), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Options")), /*#__PURE__*/_react.default.createElement(_SettingsFlag.default, {
      name: "developerMode",
      level: _SettingLevel.SettingLevel.ACCOUNT
    }), /*#__PURE__*/_react.default.createElement(_SettingsFlag.default, {
      name: "showHiddenEventsInTimeline",
      level: _SettingLevel.SettingLevel.DEVICE
    }), /*#__PURE__*/_react.default.createElement(_SettingsFlag.default, {
      name: "enableWidgetScreenshots",
      level: _SettingLevel.SettingLevel.ACCOUNT
    })));
  }

  const label = tool ? tool[0] : (0, _languageHandler._t)("Toolbox");
  return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
    className: "mx_QuestionDialog",
    onFinished: onFinished,
    title: (0, _languageHandler._t)("Developer Tools")
  }, /*#__PURE__*/_react.default.createElement(_MatrixClientContext.default.Consumer, null, cli => /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_DevTools_label_left"
  }, label), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_DevTools_label_right"
  }, (0, _languageHandler._t)("Room ID: %(roomId)s", {
    roomId
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_DevTools_label_bottom"
  }), /*#__PURE__*/_react.default.createElement(_BaseTool.DevtoolsContext.Provider, {
    value: {
      room: cli.getRoom(roomId)
    }
  }, body))));
};

var _default = DevtoolsDialog;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDYXRlZ29yeSIsImNhdGVnb3J5TGFiZWxzIiwiUm9vbSIsIl90ZCIsIk90aGVyIiwiVG9vbHMiLCJUaW1lbGluZUV2ZW50RWRpdG9yIiwiUm9vbVN0YXRlRXhwbG9yZXIiLCJSb29tQWNjb3VudERhdGFFeHBsb3JlciIsIlNlcnZlcnNJblJvb20iLCJWZXJpZmljYXRpb25FeHBsb3JlciIsIldpZGdldEV4cGxvcmVyIiwiQWNjb3VudERhdGFFeHBsb3JlciIsIlNldHRpbmdFeHBsb3JlciIsIlNlcnZlckluZm8iLCJEZXZ0b29sc0RpYWxvZyIsInJvb21JZCIsIm9uRmluaXNoZWQiLCJ0b29sIiwic2V0VG9vbCIsInVzZVN0YXRlIiwiYm9keSIsIm9uQmFjayIsIlRvb2wiLCJsYWJlbCIsIk9iamVjdCIsImVudHJpZXMiLCJtYXAiLCJjYXRlZ29yeSIsInRvb2xzIiwiX3QiLCJvbkNsaWNrIiwiU2V0dGluZ0xldmVsIiwiQUNDT1VOVCIsIkRFVklDRSIsImNsaSIsInJvb20iLCJnZXRSb29tIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9EZXZ0b29sc0RpYWxvZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIyIE1pY2hhZWwgVGVsYXR5bnNraSA8N3QzY2hndXlAZ21haWwuY29tPlxuQ29weXJpZ2h0IDIwMTgtMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0IHsgX3QsIF90ZCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tIFwiLi4vLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuaW1wb3J0IEJhc2VEaWFsb2cgZnJvbSBcIi4vQmFzZURpYWxvZ1wiO1xuaW1wb3J0IHsgVGltZWxpbmVFdmVudEVkaXRvciB9IGZyb20gXCIuL2RldnRvb2xzL0V2ZW50XCI7XG5pbXBvcnQgU2VydmVyc0luUm9vbSBmcm9tIFwiLi9kZXZ0b29scy9TZXJ2ZXJzSW5Sb29tXCI7XG5pbXBvcnQgVmVyaWZpY2F0aW9uRXhwbG9yZXIgZnJvbSBcIi4vZGV2dG9vbHMvVmVyaWZpY2F0aW9uRXhwbG9yZXJcIjtcbmltcG9ydCBTZXR0aW5nRXhwbG9yZXIgZnJvbSBcIi4vZGV2dG9vbHMvU2V0dGluZ0V4cGxvcmVyXCI7XG5pbXBvcnQgeyBSb29tU3RhdGVFeHBsb3JlciB9IGZyb20gXCIuL2RldnRvb2xzL1Jvb21TdGF0ZVwiO1xuaW1wb3J0IEJhc2VUb29sLCB7IERldnRvb2xzQ29udGV4dCwgSURldnRvb2xzUHJvcHMgfSBmcm9tIFwiLi9kZXZ0b29scy9CYXNlVG9vbFwiO1xuaW1wb3J0IFdpZGdldEV4cGxvcmVyIGZyb20gJy4vZGV2dG9vbHMvV2lkZ2V0RXhwbG9yZXInO1xuaW1wb3J0IHsgQWNjb3VudERhdGFFeHBsb3JlciwgUm9vbUFjY291bnREYXRhRXhwbG9yZXIgfSBmcm9tIFwiLi9kZXZ0b29scy9BY2NvdW50RGF0YVwiO1xuaW1wb3J0IFNldHRpbmdzRmxhZyBmcm9tIFwiLi4vZWxlbWVudHMvU2V0dGluZ3NGbGFnXCI7XG5pbXBvcnQgeyBTZXR0aW5nTGV2ZWwgfSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ0xldmVsXCI7XG5pbXBvcnQgU2VydmVySW5mbyBmcm9tICcuL2RldnRvb2xzL1NlcnZlckluZm8nO1xuXG5lbnVtIENhdGVnb3J5IHtcbiAgICBSb29tLFxuICAgIE90aGVyLFxufVxuXG5jb25zdCBjYXRlZ29yeUxhYmVsczogUmVjb3JkPENhdGVnb3J5LCBzdHJpbmc+ID0ge1xuICAgIFtDYXRlZ29yeS5Sb29tXTogX3RkKFwiUm9vbVwiKSxcbiAgICBbQ2F0ZWdvcnkuT3RoZXJdOiBfdGQoXCJPdGhlclwiKSxcbn07XG5cbmV4cG9ydCB0eXBlIFRvb2wgPSBSZWFjdC5GQzxJRGV2dG9vbHNQcm9wcz47XG5jb25zdCBUb29sczogUmVjb3JkPENhdGVnb3J5LCBbbGFiZWw6IHN0cmluZywgdG9vbDogVG9vbF1bXT4gPSB7XG4gICAgW0NhdGVnb3J5LlJvb21dOiBbXG4gICAgICAgIFtfdGQoXCJTZW5kIGN1c3RvbSB0aW1lbGluZSBldmVudFwiKSwgVGltZWxpbmVFdmVudEVkaXRvcl0sXG4gICAgICAgIFtfdGQoXCJFeHBsb3JlIHJvb20gc3RhdGVcIiksIFJvb21TdGF0ZUV4cGxvcmVyXSxcbiAgICAgICAgW190ZChcIkV4cGxvcmUgcm9vbSBhY2NvdW50IGRhdGFcIiksIFJvb21BY2NvdW50RGF0YUV4cGxvcmVyXSxcbiAgICAgICAgW190ZChcIlZpZXcgc2VydmVycyBpbiByb29tXCIpLCBTZXJ2ZXJzSW5Sb29tXSxcbiAgICAgICAgW190ZChcIlZlcmlmaWNhdGlvbiBleHBsb3JlclwiKSwgVmVyaWZpY2F0aW9uRXhwbG9yZXJdLFxuICAgICAgICBbX3RkKFwiQWN0aXZlIFdpZGdldHNcIiksIFdpZGdldEV4cGxvcmVyXSxcbiAgICBdLFxuICAgIFtDYXRlZ29yeS5PdGhlcl06IFtcbiAgICAgICAgW190ZChcIkV4cGxvcmUgYWNjb3VudCBkYXRhXCIpLCBBY2NvdW50RGF0YUV4cGxvcmVyXSxcbiAgICAgICAgW190ZChcIlNldHRpbmdzIGV4cGxvcmVyXCIpLCBTZXR0aW5nRXhwbG9yZXJdLFxuICAgICAgICBbX3RkKFwiU2VydmVyIGluZm9cIiksIFNlcnZlckluZm9dLFxuICAgIF0sXG59O1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICByb29tSWQ6IHN0cmluZztcbiAgICBvbkZpbmlzaGVkKGZpbmlzaGVkOiBib29sZWFuKTogdm9pZDtcbn1cblxudHlwZSBUb29sSW5mbyA9IFtsYWJlbDogc3RyaW5nLCB0b29sOiBUb29sXTtcblxuY29uc3QgRGV2dG9vbHNEaWFsb2c6IFJlYWN0LkZDPElQcm9wcz4gPSAoeyByb29tSWQsIG9uRmluaXNoZWQgfSkgPT4ge1xuICAgIGNvbnN0IFt0b29sLCBzZXRUb29sXSA9IHVzZVN0YXRlPFRvb2xJbmZvPihudWxsKTtcblxuICAgIGxldCBib2R5OiBKU1guRWxlbWVudDtcbiAgICBsZXQgb25CYWNrOiAoKSA9PiB2b2lkO1xuXG4gICAgaWYgKHRvb2wpIHtcbiAgICAgICAgb25CYWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgc2V0VG9vbChudWxsKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBUb29sID0gdG9vbFsxXTtcbiAgICAgICAgYm9keSA9IDxUb29sIG9uQmFjaz17b25CYWNrfSBzZXRUb29sPXsobGFiZWwsIHRvb2wpID0+IHNldFRvb2woW2xhYmVsLCB0b29sXSl9IC8+O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IG9uQmFjayA9ICgpID0+IHtcbiAgICAgICAgICAgIG9uRmluaXNoZWQoZmFsc2UpO1xuICAgICAgICB9O1xuICAgICAgICBib2R5ID0gPEJhc2VUb29sIG9uQmFjaz17b25CYWNrfT5cbiAgICAgICAgICAgIHsgT2JqZWN0LmVudHJpZXMoVG9vbHMpLm1hcCgoW2NhdGVnb3J5LCB0b29sc10pID0+IChcbiAgICAgICAgICAgICAgICA8ZGl2IGtleT17Y2F0ZWdvcnl9PlxuICAgICAgICAgICAgICAgICAgICA8aDM+eyBfdChjYXRlZ29yeUxhYmVsc1tjYXRlZ29yeV0pIH08L2gzPlxuICAgICAgICAgICAgICAgICAgICB7IHRvb2xzLm1hcCgoW2xhYmVsLCB0b29sXSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb25DbGljayA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUb29sKFtsYWJlbCwgdG9vbF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiA8YnV0dG9uIGNsYXNzTmFtZT1cIm14X0RldlRvb2xzX2J1dHRvblwiIGtleT17bGFiZWx9IG9uQ2xpY2s9e29uQ2xpY2t9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QobGFiZWwpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPjtcbiAgICAgICAgICAgICAgICAgICAgfSkgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKSkgfVxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8aDM+eyBfdChcIk9wdGlvbnNcIikgfTwvaDM+XG4gICAgICAgICAgICAgICAgPFNldHRpbmdzRmxhZyBuYW1lPVwiZGV2ZWxvcGVyTW9kZVwiIGxldmVsPXtTZXR0aW5nTGV2ZWwuQUNDT1VOVH0gLz5cbiAgICAgICAgICAgICAgICA8U2V0dGluZ3NGbGFnIG5hbWU9XCJzaG93SGlkZGVuRXZlbnRzSW5UaW1lbGluZVwiIGxldmVsPXtTZXR0aW5nTGV2ZWwuREVWSUNFfSAvPlxuICAgICAgICAgICAgICAgIDxTZXR0aW5nc0ZsYWcgbmFtZT1cImVuYWJsZVdpZGdldFNjcmVlbnNob3RzXCIgbGV2ZWw9e1NldHRpbmdMZXZlbC5BQ0NPVU5UfSAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvQmFzZVRvb2w+O1xuICAgIH1cblxuICAgIGNvbnN0IGxhYmVsID0gdG9vbCA/IHRvb2xbMF0gOiBfdChcIlRvb2xib3hcIik7XG4gICAgcmV0dXJuIChcbiAgICAgICAgPEJhc2VEaWFsb2cgY2xhc3NOYW1lPVwibXhfUXVlc3Rpb25EaWFsb2dcIiBvbkZpbmlzaGVkPXtvbkZpbmlzaGVkfSB0aXRsZT17X3QoXCJEZXZlbG9wZXIgVG9vbHNcIil9PlxuICAgICAgICAgICAgPE1hdHJpeENsaWVudENvbnRleHQuQ29uc3VtZXI+XG4gICAgICAgICAgICAgICAgeyAoY2xpKSA9PiA8PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RldlRvb2xzX2xhYmVsX2xlZnRcIj57IGxhYmVsIH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EZXZUb29sc19sYWJlbF9yaWdodFwiPnsgX3QoXCJSb29tIElEOiAlKHJvb21JZClzXCIsIHsgcm9vbUlkIH0pIH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EZXZUb29sc19sYWJlbF9ib3R0b21cIiAvPlxuICAgICAgICAgICAgICAgICAgICA8RGV2dG9vbHNDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXt7IHJvb206IGNsaS5nZXRSb29tKHJvb21JZCkgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGJvZHkgfVxuICAgICAgICAgICAgICAgICAgICA8L0RldnRvb2xzQ29udGV4dC5Qcm92aWRlcj5cbiAgICAgICAgICAgICAgICA8Lz4gfVxuICAgICAgICAgICAgPC9NYXRyaXhDbGllbnRDb250ZXh0LkNvbnN1bWVyPlxuICAgICAgICA8L0Jhc2VEaWFsb2c+XG4gICAgKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IERldnRvb2xzRGlhbG9nO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFpQkE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQWhDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQW1CS0EsUTs7V0FBQUEsUTtFQUFBQSxRLENBQUFBLFE7RUFBQUEsUSxDQUFBQSxRO0dBQUFBLFEsS0FBQUEsUTs7QUFLTCxNQUFNQyxjQUF3QyxHQUFHO0VBQzdDLENBQUNELFFBQVEsQ0FBQ0UsSUFBVixHQUFpQixJQUFBQyxvQkFBQSxFQUFJLE1BQUosQ0FENEI7RUFFN0MsQ0FBQ0gsUUFBUSxDQUFDSSxLQUFWLEdBQWtCLElBQUFELG9CQUFBLEVBQUksT0FBSjtBQUYyQixDQUFqRDtBQU1BLE1BQU1FLEtBQXNELEdBQUc7RUFDM0QsQ0FBQ0wsUUFBUSxDQUFDRSxJQUFWLEdBQWlCLENBQ2IsQ0FBQyxJQUFBQyxvQkFBQSxFQUFJLDRCQUFKLENBQUQsRUFBb0NHLDBCQUFwQyxDQURhLEVBRWIsQ0FBQyxJQUFBSCxvQkFBQSxFQUFJLG9CQUFKLENBQUQsRUFBNEJJLDRCQUE1QixDQUZhLEVBR2IsQ0FBQyxJQUFBSixvQkFBQSxFQUFJLDJCQUFKLENBQUQsRUFBbUNLLG9DQUFuQyxDQUhhLEVBSWIsQ0FBQyxJQUFBTCxvQkFBQSxFQUFJLHNCQUFKLENBQUQsRUFBOEJNLHNCQUE5QixDQUphLEVBS2IsQ0FBQyxJQUFBTixvQkFBQSxFQUFJLHVCQUFKLENBQUQsRUFBK0JPLDZCQUEvQixDQUxhLEVBTWIs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