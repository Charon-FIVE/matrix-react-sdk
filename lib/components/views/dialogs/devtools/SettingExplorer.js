"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../../../languageHandler");

var _BaseTool = _interopRequireWildcard(require("./BaseTool"));

var _AccessibleButton = _interopRequireDefault(require("../../elements/AccessibleButton"));

var _SettingsStore = _interopRequireWildcard(require("../../../../settings/SettingsStore"));

var _Settings = require("../../../../settings/Settings");

var _Field = _interopRequireDefault(require("../../elements/Field"));

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
const SettingExplorer = _ref => {
  let {
    onBack
  } = _ref;
  const [setting, setSetting] = (0, _react.useState)(null);
  const [editing, setEditing] = (0, _react.useState)(false);

  if (setting && editing) {
    const onBack = () => {
      setEditing(false);
    };

    return /*#__PURE__*/_react.default.createElement(EditSetting, {
      setting: setting,
      onBack: onBack
    });
  } else if (setting) {
    const onBack = () => {
      setSetting(null);
    };

    const onEdit = async () => {
      setEditing(true);
    };

    return /*#__PURE__*/_react.default.createElement(ViewSetting, {
      setting: setting,
      onBack: onBack,
      onEdit: onEdit
    });
  } else {
    const onView = setting => {
      setSetting(setting);
    };

    const onEdit = setting => {
      setSetting(setting);
      setEditing(true);
    };

    return /*#__PURE__*/_react.default.createElement(SettingsList, {
      onBack: onBack,
      onView: onView,
      onEdit: onEdit
    });
  }
};

var _default = SettingExplorer;
exports.default = _default;

const CanEditLevelField = _ref2 => {
  let {
    setting,
    roomId,
    level
  } = _ref2;

  const canEdit = _SettingsStore.default.canSetValue(setting, roomId, level);

  const className = canEdit ? "mx_DevTools_SettingsExplorer_mutable" : "mx_DevTools_SettingsExplorer_immutable";
  return /*#__PURE__*/_react.default.createElement("td", {
    className: className
  }, /*#__PURE__*/_react.default.createElement("code", null, canEdit.toString()));
};

function renderExplicitSettingValues(setting, roomId) {
  const vals = {};

  for (const level of _SettingsStore.LEVEL_ORDER) {
    try {
      vals[level] = _SettingsStore.default.getValueAt(level, setting, roomId, true, true);

      if (vals[level] === undefined) {
        vals[level] = null;
      }
    } catch (e) {
      _logger.logger.warn(e);
    }
  }

  return JSON.stringify(vals, null, 4);
}

const EditSetting = _ref3 => {
  let {
    setting,
    onBack
  } = _ref3;
  const context = (0, _react.useContext)(_BaseTool.DevtoolsContext);
  const [explicitValue, setExplicitValue] = (0, _react.useState)(renderExplicitSettingValues(setting, null));
  const [explicitRoomValue, setExplicitRoomValue] = (0, _react.useState)(renderExplicitSettingValues(setting, context.room.roomId));

  const onSave = async () => {
    try {
      const parsedExplicit = JSON.parse(explicitValue);
      const parsedExplicitRoom = JSON.parse(explicitRoomValue);

      for (const level of Object.keys(parsedExplicit)) {
        _logger.logger.log(`[Devtools] Setting value of ${setting} at ${level} from user input`);

        try {
          const val = parsedExplicit[level];
          await _SettingsStore.default.setValue(setting, null, level, val);
        } catch (e) {
          _logger.logger.warn(e);
        }
      }

      const roomId = context.room.roomId;

      for (const level of Object.keys(parsedExplicit)) {
        _logger.logger.log(`[Devtools] Setting value of ${setting} at ${level} in ${roomId} from user input`);

        try {
          const val = parsedExplicitRoom[level];
          await _SettingsStore.default.setValue(setting, roomId, level, val);
        } catch (e) {
          _logger.logger.warn(e);
        }
      }

      onBack();
    } catch (e) {
      return (0, _languageHandler._t)("Failed to save settings.") + ` (${e.message})`;
    }
  };

  return /*#__PURE__*/_react.default.createElement(_BaseTool.default, {
    onBack: onBack,
    actionLabel: (0, _languageHandler._t)("Save setting values"),
    onAction: onSave
  }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Setting:"), " ", /*#__PURE__*/_react.default.createElement("code", null, setting)), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_DevTools_SettingsExplorer_warning"
  }, /*#__PURE__*/_react.default.createElement("b", null, (0, _languageHandler._t)("Caution:")), " ", (0, _languageHandler._t)("This UI does NOT check the types of the values. Use at your own risk.")), /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Setting definition:"), /*#__PURE__*/_react.default.createElement("pre", null, /*#__PURE__*/_react.default.createElement("code", null, JSON.stringify(_Settings.SETTINGS[setting], null, 4)))), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("table", null, /*#__PURE__*/_react.default.createElement("thead", null, /*#__PURE__*/_react.default.createElement("tr", null, /*#__PURE__*/_react.default.createElement("th", null, (0, _languageHandler._t)("Level")), /*#__PURE__*/_react.default.createElement("th", null, (0, _languageHandler._t)("Settable at global")), /*#__PURE__*/_react.default.createElement("th", null, (0, _languageHandler._t)("Settable at room")))), /*#__PURE__*/_react.default.createElement("tbody", null, _SettingsStore.LEVEL_ORDER.map(lvl => /*#__PURE__*/_react.default.createElement("tr", {
    key: lvl
  }, /*#__PURE__*/_react.default.createElement("td", null, /*#__PURE__*/_react.default.createElement("code", null, lvl)), /*#__PURE__*/_react.default.createElement(CanEditLevelField, {
    setting: setting,
    level: lvl
  }), /*#__PURE__*/_react.default.createElement(CanEditLevelField, {
    setting: setting,
    roomId: context.room.roomId,
    level: lvl
  })))))), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_Field.default, {
    id: "valExpl",
    label: (0, _languageHandler._t)("Values at explicit levels"),
    type: "text",
    className: "mx_DevTools_textarea",
    element: "textarea",
    autoComplete: "off",
    value: explicitValue,
    onChange: e => setExplicitValue(e.target.value)
  })), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_Field.default, {
    id: "valExpl",
    label: (0, _languageHandler._t)("Values at explicit levels in this room"),
    type: "text",
    className: "mx_DevTools_textarea",
    element: "textarea",
    autoComplete: "off",
    value: explicitRoomValue,
    onChange: e => setExplicitRoomValue(e.target.value)
  })));
};

const ViewSetting = _ref4 => {
  let {
    setting,
    onEdit,
    onBack
  } = _ref4;
  const context = (0, _react.useContext)(_BaseTool.DevtoolsContext);
  return /*#__PURE__*/_react.default.createElement(_BaseTool.default, {
    onBack: onBack,
    actionLabel: (0, _languageHandler._t)("Edit values"),
    onAction: onEdit
  }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Setting:"), " ", /*#__PURE__*/_react.default.createElement("code", null, setting)), /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Setting definition:"), /*#__PURE__*/_react.default.createElement("pre", null, /*#__PURE__*/_react.default.createElement("code", null, JSON.stringify(_Settings.SETTINGS[setting], null, 4)))), /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Value:"), "\xA0", /*#__PURE__*/_react.default.createElement("code", null, renderSettingValue(_SettingsStore.default.getValue(setting)))), /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Value in this room:"), "\xA0", /*#__PURE__*/_react.default.createElement("code", null, renderSettingValue(_SettingsStore.default.getValue(setting, context.room.roomId)))), /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Values at explicit levels:"), /*#__PURE__*/_react.default.createElement("pre", null, /*#__PURE__*/_react.default.createElement("code", null, renderExplicitSettingValues(setting, null)))), /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Values at explicit levels in this room:"), /*#__PURE__*/_react.default.createElement("pre", null, /*#__PURE__*/_react.default.createElement("code", null, renderExplicitSettingValues(setting, context.room.roomId)))));
};

function renderSettingValue(val) {
  // Note: we don't .toString() a string because we want JSON.stringify to inject quotes for us
  const toStringTypes = ["boolean", "number"];

  if (toStringTypes.includes(typeof val)) {
    return val.toString();
  } else {
    return JSON.stringify(val);
  }
}

const SettingsList = _ref5 => {
  let {
    onBack,
    onView,
    onEdit
  } = _ref5;
  const context = (0, _react.useContext)(_BaseTool.DevtoolsContext);
  const [query, setQuery] = (0, _react.useState)("");
  const allSettings = (0, _react.useMemo)(() => {
    let allSettings = Object.keys(_Settings.SETTINGS);

    if (query) {
      const lcQuery = query.toLowerCase();
      allSettings = allSettings.filter(setting => setting.toLowerCase().includes(lcQuery));
    }

    return allSettings;
  }, [query]);
  return /*#__PURE__*/_react.default.createElement(_BaseTool.default, {
    onBack: onBack,
    className: "mx_DevTools_SettingsExplorer"
  }, /*#__PURE__*/_react.default.createElement(_Field.default, {
    label: (0, _languageHandler._t)("Filter results"),
    autoFocus: true,
    size: 64,
    type: "text",
    autoComplete: "off",
    value: query,
    onChange: ev => setQuery(ev.target.value),
    className: "mx_TextInputDialog_input mx_DevTools_RoomStateExplorer_query"
  }), /*#__PURE__*/_react.default.createElement("table", null, /*#__PURE__*/_react.default.createElement("thead", null, /*#__PURE__*/_react.default.createElement("tr", null, /*#__PURE__*/_react.default.createElement("th", null, (0, _languageHandler._t)("Setting ID")), /*#__PURE__*/_react.default.createElement("th", null, (0, _languageHandler._t)("Value")), /*#__PURE__*/_react.default.createElement("th", null, (0, _languageHandler._t)("Value in this room")))), /*#__PURE__*/_react.default.createElement("tbody", null, allSettings.map(i => /*#__PURE__*/_react.default.createElement("tr", {
    key: i
  }, /*#__PURE__*/_react.default.createElement("td", null, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    kind: "link_inline",
    className: "mx_DevTools_SettingsExplorer_setting",
    onClick: () => onView(i)
  }, /*#__PURE__*/_react.default.createElement("code", null, i)), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    alt: (0, _languageHandler._t)("Edit setting"),
    onClick: () => onEdit(i),
    className: "mx_DevTools_SettingsExplorer_edit"
  }, "\u270F")), /*#__PURE__*/_react.default.createElement("td", null, /*#__PURE__*/_react.default.createElement("code", null, renderSettingValue(_SettingsStore.default.getValue(i)))), /*#__PURE__*/_react.default.createElement("td", null, /*#__PURE__*/_react.default.createElement("code", null, renderSettingValue(_SettingsStore.default.getValue(i, context.room.roomId)))))))));
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTZXR0aW5nRXhwbG9yZXIiLCJvbkJhY2siLCJzZXR0aW5nIiwic2V0U2V0dGluZyIsInVzZVN0YXRlIiwiZWRpdGluZyIsInNldEVkaXRpbmciLCJvbkVkaXQiLCJvblZpZXciLCJDYW5FZGl0TGV2ZWxGaWVsZCIsInJvb21JZCIsImxldmVsIiwiY2FuRWRpdCIsIlNldHRpbmdzU3RvcmUiLCJjYW5TZXRWYWx1ZSIsImNsYXNzTmFtZSIsInRvU3RyaW5nIiwicmVuZGVyRXhwbGljaXRTZXR0aW5nVmFsdWVzIiwidmFscyIsIkxFVkVMX09SREVSIiwiZ2V0VmFsdWVBdCIsInVuZGVmaW5lZCIsImUiLCJsb2dnZXIiLCJ3YXJuIiwiSlNPTiIsInN0cmluZ2lmeSIsIkVkaXRTZXR0aW5nIiwiY29udGV4dCIsInVzZUNvbnRleHQiLCJEZXZ0b29sc0NvbnRleHQiLCJleHBsaWNpdFZhbHVlIiwic2V0RXhwbGljaXRWYWx1ZSIsImV4cGxpY2l0Um9vbVZhbHVlIiwic2V0RXhwbGljaXRSb29tVmFsdWUiLCJyb29tIiwib25TYXZlIiwicGFyc2VkRXhwbGljaXQiLCJwYXJzZSIsInBhcnNlZEV4cGxpY2l0Um9vbSIsIk9iamVjdCIsImtleXMiLCJsb2ciLCJ2YWwiLCJzZXRWYWx1ZSIsIl90IiwibWVzc2FnZSIsIlNFVFRJTkdTIiwibWFwIiwibHZsIiwidGFyZ2V0IiwidmFsdWUiLCJWaWV3U2V0dGluZyIsInJlbmRlclNldHRpbmdWYWx1ZSIsImdldFZhbHVlIiwidG9TdHJpbmdUeXBlcyIsImluY2x1ZGVzIiwiU2V0dGluZ3NMaXN0IiwicXVlcnkiLCJzZXRRdWVyeSIsImFsbFNldHRpbmdzIiwidXNlTWVtbyIsImxjUXVlcnkiLCJ0b0xvd2VyQ2FzZSIsImZpbHRlciIsImV2IiwiaSJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvZGV2dG9vbHMvU2V0dGluZ0V4cGxvcmVyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjIgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5Db3B5cmlnaHQgMjAxOC0yMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IHVzZUNvbnRleHQsIHVzZU1lbW8sIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5cbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IEJhc2VUb29sLCB7IERldnRvb2xzQ29udGV4dCwgSURldnRvb2xzUHJvcHMgfSBmcm9tIFwiLi9CYXNlVG9vbFwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uLy4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlLCB7IExFVkVMX09SREVSIH0gZnJvbSBcIi4uLy4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7IFNldHRpbmdMZXZlbCB9IGZyb20gXCIuLi8uLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nTGV2ZWxcIjtcbmltcG9ydCB7IFNFVFRJTkdTIH0gZnJvbSBcIi4uLy4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzXCI7XG5pbXBvcnQgRmllbGQgZnJvbSBcIi4uLy4uL2VsZW1lbnRzL0ZpZWxkXCI7XG5cbmNvbnN0IFNldHRpbmdFeHBsb3JlciA9ICh7IG9uQmFjayB9OiBJRGV2dG9vbHNQcm9wcykgPT4ge1xuICAgIGNvbnN0IFtzZXR0aW5nLCBzZXRTZXR0aW5nXSA9IHVzZVN0YXRlPHN0cmluZz4obnVsbCk7XG4gICAgY29uc3QgW2VkaXRpbmcsIHNldEVkaXRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuXG4gICAgaWYgKHNldHRpbmcgJiYgZWRpdGluZykge1xuICAgICAgICBjb25zdCBvbkJhY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICBzZXRFZGl0aW5nKGZhbHNlKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIDxFZGl0U2V0dGluZyBzZXR0aW5nPXtzZXR0aW5nfSBvbkJhY2s9e29uQmFja30gLz47XG4gICAgfSBlbHNlIGlmIChzZXR0aW5nKSB7XG4gICAgICAgIGNvbnN0IG9uQmFjayA9ICgpID0+IHtcbiAgICAgICAgICAgIHNldFNldHRpbmcobnVsbCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IG9uRWRpdCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIHNldEVkaXRpbmcodHJ1ZSk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiA8Vmlld1NldHRpbmcgc2V0dGluZz17c2V0dGluZ30gb25CYWNrPXtvbkJhY2t9IG9uRWRpdD17b25FZGl0fSAvPjtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBvblZpZXcgPSAoc2V0dGluZzogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBzZXRTZXR0aW5nKHNldHRpbmcpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBvbkVkaXQgPSAoc2V0dGluZzogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBzZXRTZXR0aW5nKHNldHRpbmcpO1xuICAgICAgICAgICAgc2V0RWRpdGluZyh0cnVlKTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIDxTZXR0aW5nc0xpc3Qgb25CYWNrPXtvbkJhY2t9IG9uVmlldz17b25WaWV3fSBvbkVkaXQ9e29uRWRpdH0gLz47XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgU2V0dGluZ0V4cGxvcmVyO1xuXG5pbnRlcmZhY2UgSUNhbkVkaXRMZXZlbEZpZWxkUHJvcHMge1xuICAgIHNldHRpbmc6IHN0cmluZztcbiAgICBsZXZlbDogU2V0dGluZ0xldmVsO1xuICAgIHJvb21JZD86IHN0cmluZztcbn1cblxuY29uc3QgQ2FuRWRpdExldmVsRmllbGQgPSAoeyBzZXR0aW5nLCByb29tSWQsIGxldmVsIH06IElDYW5FZGl0TGV2ZWxGaWVsZFByb3BzKSA9PiB7XG4gICAgY29uc3QgY2FuRWRpdCA9IFNldHRpbmdzU3RvcmUuY2FuU2V0VmFsdWUoc2V0dGluZywgcm9vbUlkLCBsZXZlbCk7XG4gICAgY29uc3QgY2xhc3NOYW1lID0gY2FuRWRpdCA/IFwibXhfRGV2VG9vbHNfU2V0dGluZ3NFeHBsb3Jlcl9tdXRhYmxlXCIgOiBcIm14X0RldlRvb2xzX1NldHRpbmdzRXhwbG9yZXJfaW1tdXRhYmxlXCI7XG4gICAgcmV0dXJuIDx0ZCBjbGFzc05hbWU9e2NsYXNzTmFtZX0+PGNvZGU+eyBjYW5FZGl0LnRvU3RyaW5nKCkgfTwvY29kZT48L3RkPjtcbn07XG5cbmZ1bmN0aW9uIHJlbmRlckV4cGxpY2l0U2V0dGluZ1ZhbHVlcyhzZXR0aW5nOiBzdHJpbmcsIHJvb21JZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCB2YWxzID0ge307XG4gICAgZm9yIChjb25zdCBsZXZlbCBvZiBMRVZFTF9PUkRFUikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdmFsc1tsZXZlbF0gPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlQXQobGV2ZWwsIHNldHRpbmcsIHJvb21JZCwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgICAgICBpZiAodmFsc1tsZXZlbF0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHZhbHNbbGV2ZWxdID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbHMsIG51bGwsIDQpO1xufVxuXG5pbnRlcmZhY2UgSUVkaXRTZXR0aW5nUHJvcHMgZXh0ZW5kcyBQaWNrPElEZXZ0b29sc1Byb3BzLCBcIm9uQmFja1wiPiB7XG4gICAgc2V0dGluZzogc3RyaW5nO1xufVxuXG5jb25zdCBFZGl0U2V0dGluZyA9ICh7IHNldHRpbmcsIG9uQmFjayB9OiBJRWRpdFNldHRpbmdQcm9wcykgPT4ge1xuICAgIGNvbnN0IGNvbnRleHQgPSB1c2VDb250ZXh0KERldnRvb2xzQ29udGV4dCk7XG4gICAgY29uc3QgW2V4cGxpY2l0VmFsdWUsIHNldEV4cGxpY2l0VmFsdWVdID0gdXNlU3RhdGUocmVuZGVyRXhwbGljaXRTZXR0aW5nVmFsdWVzKHNldHRpbmcsIG51bGwpKTtcbiAgICBjb25zdCBbZXhwbGljaXRSb29tVmFsdWUsIHNldEV4cGxpY2l0Um9vbVZhbHVlXSA9XG4gICAgICAgIHVzZVN0YXRlKHJlbmRlckV4cGxpY2l0U2V0dGluZ1ZhbHVlcyhzZXR0aW5nLCBjb250ZXh0LnJvb20ucm9vbUlkKSk7XG5cbiAgICBjb25zdCBvblNhdmUgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBwYXJzZWRFeHBsaWNpdCA9IEpTT04ucGFyc2UoZXhwbGljaXRWYWx1ZSk7XG4gICAgICAgICAgICBjb25zdCBwYXJzZWRFeHBsaWNpdFJvb20gPSBKU09OLnBhcnNlKGV4cGxpY2l0Um9vbVZhbHVlKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgbGV2ZWwgb2YgT2JqZWN0LmtleXMocGFyc2VkRXhwbGljaXQpKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmxvZyhgW0RldnRvb2xzXSBTZXR0aW5nIHZhbHVlIG9mICR7c2V0dGluZ30gYXQgJHtsZXZlbH0gZnJvbSB1c2VyIGlucHV0YCk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsID0gcGFyc2VkRXhwbGljaXRbbGV2ZWxdO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBTZXR0aW5nc1N0b3JlLnNldFZhbHVlKHNldHRpbmcsIG51bGwsIGxldmVsIGFzIFNldHRpbmdMZXZlbCwgdmFsKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci53YXJuKGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgcm9vbUlkID0gY29udGV4dC5yb29tLnJvb21JZDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgbGV2ZWwgb2YgT2JqZWN0LmtleXMocGFyc2VkRXhwbGljaXQpKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmxvZyhgW0RldnRvb2xzXSBTZXR0aW5nIHZhbHVlIG9mICR7c2V0dGluZ30gYXQgJHtsZXZlbH0gaW4gJHtyb29tSWR9IGZyb20gdXNlciBpbnB1dGApO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbCA9IHBhcnNlZEV4cGxpY2l0Um9vbVtsZXZlbF07XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IFNldHRpbmdzU3RvcmUuc2V0VmFsdWUoc2V0dGluZywgcm9vbUlkLCBsZXZlbCBhcyBTZXR0aW5nTGV2ZWwsIHZhbCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIud2FybihlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvbkJhY2soKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmV0dXJuIF90KFwiRmFpbGVkIHRvIHNhdmUgc2V0dGluZ3MuXCIpICsgYCAoJHtlLm1lc3NhZ2V9KWA7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIDxCYXNlVG9vbCBvbkJhY2s9e29uQmFja30gYWN0aW9uTGFiZWw9e190KFwiU2F2ZSBzZXR0aW5nIHZhbHVlc1wiKX0gb25BY3Rpb249e29uU2F2ZX0+XG4gICAgICAgIDxoMz57IF90KFwiU2V0dGluZzpcIikgfSA8Y29kZT57IHNldHRpbmcgfTwvY29kZT48L2gzPlxuXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGV2VG9vbHNfU2V0dGluZ3NFeHBsb3Jlcl93YXJuaW5nXCI+XG4gICAgICAgICAgICA8Yj57IF90KFwiQ2F1dGlvbjpcIikgfTwvYj4geyBfdChcIlRoaXMgVUkgZG9lcyBOT1QgY2hlY2sgdGhlIHR5cGVzIG9mIHRoZSB2YWx1ZXMuIFVzZSBhdCB5b3VyIG93biByaXNrLlwiKSB9XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgICB7IF90KFwiU2V0dGluZyBkZWZpbml0aW9uOlwiKSB9XG4gICAgICAgICAgICA8cHJlPjxjb2RlPnsgSlNPTi5zdHJpbmdpZnkoU0VUVElOR1Nbc2V0dGluZ10sIG51bGwsIDQpIH08L2NvZGU+PC9wcmU+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8dGFibGU+XG4gICAgICAgICAgICAgICAgPHRoZWFkPlxuICAgICAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGg+eyBfdChcIkxldmVsXCIpIH08L3RoPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoPnsgX3QoXCJTZXR0YWJsZSBhdCBnbG9iYWxcIikgfTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGg+eyBfdChcIlNldHRhYmxlIGF0IHJvb21cIikgfTwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgPC90aGVhZD5cbiAgICAgICAgICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgICAgICAgICAgIHsgTEVWRUxfT1JERVIubWFwKGx2bCA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8dHIga2V5PXtsdmx9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD48Y29kZT57IGx2bCB9PC9jb2RlPjwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPENhbkVkaXRMZXZlbEZpZWxkIHNldHRpbmc9e3NldHRpbmd9IGxldmVsPXtsdmx9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPENhbkVkaXRMZXZlbEZpZWxkIHNldHRpbmc9e3NldHRpbmd9IHJvb21JZD17Y29udGV4dC5yb29tLnJvb21JZH0gbGV2ZWw9e2x2bH0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICAgICkpIH1cbiAgICAgICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgICAgIGlkPVwidmFsRXhwbFwiXG4gICAgICAgICAgICAgICAgbGFiZWw9e190KFwiVmFsdWVzIGF0IGV4cGxpY2l0IGxldmVsc1wiKX1cbiAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfRGV2VG9vbHNfdGV4dGFyZWFcIlxuICAgICAgICAgICAgICAgIGVsZW1lbnQ9XCJ0ZXh0YXJlYVwiXG4gICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwib2ZmXCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17ZXhwbGljaXRWYWx1ZX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17ZSA9PiBzZXRFeHBsaWNpdFZhbHVlKGUudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICBpZD1cInZhbEV4cGxcIlxuICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIlZhbHVlcyBhdCBleHBsaWNpdCBsZXZlbHMgaW4gdGhpcyByb29tXCIpfVxuICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9EZXZUb29sc190ZXh0YXJlYVwiXG4gICAgICAgICAgICAgICAgZWxlbWVudD1cInRleHRhcmVhXCJcbiAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtleHBsaWNpdFJvb21WYWx1ZX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17ZSA9PiBzZXRFeHBsaWNpdFJvb21WYWx1ZShlLnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICA8L0Jhc2VUb29sPjtcbn07XG5cbmludGVyZmFjZSBJVmlld1NldHRpbmdQcm9wcyBleHRlbmRzIFBpY2s8SURldnRvb2xzUHJvcHMsIFwib25CYWNrXCI+IHtcbiAgICBzZXR0aW5nOiBzdHJpbmc7XG4gICAgb25FZGl0KCk6IFByb21pc2U8dm9pZD47XG59XG5cbmNvbnN0IFZpZXdTZXR0aW5nID0gKHsgc2V0dGluZywgb25FZGl0LCBvbkJhY2sgfTogSVZpZXdTZXR0aW5nUHJvcHMpID0+IHtcbiAgICBjb25zdCBjb250ZXh0ID0gdXNlQ29udGV4dChEZXZ0b29sc0NvbnRleHQpO1xuXG4gICAgcmV0dXJuIDxCYXNlVG9vbCBvbkJhY2s9e29uQmFja30gYWN0aW9uTGFiZWw9e190KFwiRWRpdCB2YWx1ZXNcIil9IG9uQWN0aW9uPXtvbkVkaXR9PlxuICAgICAgICA8aDM+eyBfdChcIlNldHRpbmc6XCIpIH0gPGNvZGU+eyBzZXR0aW5nIH08L2NvZGU+PC9oMz5cblxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgeyBfdChcIlNldHRpbmcgZGVmaW5pdGlvbjpcIikgfVxuICAgICAgICAgICAgPHByZT48Y29kZT57IEpTT04uc3RyaW5naWZ5KFNFVFRJTkdTW3NldHRpbmddLCBudWxsLCA0KSB9PC9jb2RlPjwvcHJlPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgeyBfdChcIlZhbHVlOlwiKSB9Jm5ic3A7XG4gICAgICAgICAgICA8Y29kZT57IHJlbmRlclNldHRpbmdWYWx1ZShTZXR0aW5nc1N0b3JlLmdldFZhbHVlKHNldHRpbmcpKSB9PC9jb2RlPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgeyBfdChcIlZhbHVlIGluIHRoaXMgcm9vbTpcIikgfSZuYnNwO1xuICAgICAgICAgICAgPGNvZGU+eyByZW5kZXJTZXR0aW5nVmFsdWUoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShzZXR0aW5nLCBjb250ZXh0LnJvb20ucm9vbUlkKSkgfTwvY29kZT5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIHsgX3QoXCJWYWx1ZXMgYXQgZXhwbGljaXQgbGV2ZWxzOlwiKSB9XG4gICAgICAgICAgICA8cHJlPjxjb2RlPnsgcmVuZGVyRXhwbGljaXRTZXR0aW5nVmFsdWVzKHNldHRpbmcsIG51bGwpIH08L2NvZGU+PC9wcmU+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgICB7IF90KFwiVmFsdWVzIGF0IGV4cGxpY2l0IGxldmVscyBpbiB0aGlzIHJvb206XCIpIH1cbiAgICAgICAgICAgIDxwcmU+PGNvZGU+eyByZW5kZXJFeHBsaWNpdFNldHRpbmdWYWx1ZXMoc2V0dGluZywgY29udGV4dC5yb29tLnJvb21JZCkgfTwvY29kZT48L3ByZT5cbiAgICAgICAgPC9kaXY+XG4gICAgPC9CYXNlVG9vbD47XG59O1xuXG5mdW5jdGlvbiByZW5kZXJTZXR0aW5nVmFsdWUodmFsOiBhbnkpOiBzdHJpbmcge1xuICAgIC8vIE5vdGU6IHdlIGRvbid0IC50b1N0cmluZygpIGEgc3RyaW5nIGJlY2F1c2Ugd2Ugd2FudCBKU09OLnN0cmluZ2lmeSB0byBpbmplY3QgcXVvdGVzIGZvciB1c1xuICAgIGNvbnN0IHRvU3RyaW5nVHlwZXMgPSBbXCJib29sZWFuXCIsIFwibnVtYmVyXCJdO1xuICAgIGlmICh0b1N0cmluZ1R5cGVzLmluY2x1ZGVzKHR5cGVvZih2YWwpKSkge1xuICAgICAgICByZXR1cm4gdmFsLnRvU3RyaW5nKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHZhbCk7XG4gICAgfVxufVxuXG5pbnRlcmZhY2UgSVNldHRpbmdzTGlzdFByb3BzIGV4dGVuZHMgUGljazxJRGV2dG9vbHNQcm9wcywgXCJvbkJhY2tcIj4ge1xuICAgIG9uVmlldyhzZXR0aW5nOiBzdHJpbmcpOiB2b2lkO1xuICAgIG9uRWRpdChzZXR0aW5nOiBzdHJpbmcpOiB2b2lkO1xufVxuXG5jb25zdCBTZXR0aW5nc0xpc3QgPSAoeyBvbkJhY2ssIG9uVmlldywgb25FZGl0IH06IElTZXR0aW5nc0xpc3RQcm9wcykgPT4ge1xuICAgIGNvbnN0IGNvbnRleHQgPSB1c2VDb250ZXh0KERldnRvb2xzQ29udGV4dCk7XG4gICAgY29uc3QgW3F1ZXJ5LCBzZXRRdWVyeV0gPSB1c2VTdGF0ZShcIlwiKTtcblxuICAgIGNvbnN0IGFsbFNldHRpbmdzID0gdXNlTWVtbygoKSA9PiB7XG4gICAgICAgIGxldCBhbGxTZXR0aW5ncyA9IE9iamVjdC5rZXlzKFNFVFRJTkdTKTtcbiAgICAgICAgaWYgKHF1ZXJ5KSB7XG4gICAgICAgICAgICBjb25zdCBsY1F1ZXJ5ID0gcXVlcnkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgIGFsbFNldHRpbmdzID0gYWxsU2V0dGluZ3MuZmlsdGVyKHNldHRpbmcgPT4gc2V0dGluZy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGxjUXVlcnkpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYWxsU2V0dGluZ3M7XG4gICAgfSwgW3F1ZXJ5XSk7XG5cbiAgICByZXR1cm4gPEJhc2VUb29sIG9uQmFjaz17b25CYWNrfSBjbGFzc05hbWU9XCJteF9EZXZUb29sc19TZXR0aW5nc0V4cGxvcmVyXCI+XG4gICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgbGFiZWw9e190KFwiRmlsdGVyIHJlc3VsdHNcIil9XG4gICAgICAgICAgICBhdXRvRm9jdXM9e3RydWV9XG4gICAgICAgICAgICBzaXplPXs2NH1cbiAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cIm9mZlwiXG4gICAgICAgICAgICB2YWx1ZT17cXVlcnl9XG4gICAgICAgICAgICBvbkNoYW5nZT17ZXYgPT4gc2V0UXVlcnkoZXYudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1RleHRJbnB1dERpYWxvZ19pbnB1dCBteF9EZXZUb29sc19Sb29tU3RhdGVFeHBsb3Jlcl9xdWVyeVwiXG4gICAgICAgIC8+XG4gICAgICAgIDx0YWJsZT5cbiAgICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0aD57IF90KFwiU2V0dGluZyBJRFwiKSB9PC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoPnsgX3QoXCJWYWx1ZVwiKSB9PC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoPnsgX3QoXCJWYWx1ZSBpbiB0aGlzIHJvb21cIikgfTwvdGg+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgIDwvdGhlYWQ+XG4gICAgICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgICAgICAgeyBhbGxTZXR0aW5ncy5tYXAoaSA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDx0ciBrZXk9e2l9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJsaW5rX2lubGluZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0RldlRvb2xzX1NldHRpbmdzRXhwbG9yZXJfc2V0dGluZ1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG9uVmlldyhpKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxjb2RlPnsgaSB9PC9jb2RlPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbHQ9e190KFwiRWRpdCBzZXR0aW5nXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBvbkVkaXQoaSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0RldlRvb2xzX1NldHRpbmdzRXhwbG9yZXJfZWRpdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDinI9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxjb2RlPnsgcmVuZGVyU2V0dGluZ1ZhbHVlKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoaSkpIH08L2NvZGU+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxjb2RlPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHJlbmRlclNldHRpbmdWYWx1ZShTZXR0aW5nc1N0b3JlLmdldFZhbHVlKGksIGNvbnRleHQucm9vbS5yb29tSWQpKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9jb2RlPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICApKSB9XG4gICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICA8L3RhYmxlPlxuICAgIDwvQmFzZVRvb2w+O1xufTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOzs7Ozs7QUExQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFhQSxNQUFNQSxlQUFlLEdBQUcsUUFBZ0M7RUFB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