"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _actions = require("../../../dispatcher/actions");

var _SettingLevel = require("../../../settings/SettingLevel");

var _SettingsFlag = _interopRequireDefault(require("../elements/SettingsFlag"));

var _SettingsFieldset = _interopRequireDefault(require("../settings/SettingsFieldset"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

/*
Copyright 2016 OpenMarket Ltd
Copyright 2017 Travis Ralston
Copyright 2018, 2019 New Vector Ltd
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
class UrlPreviewSettings extends _react.default.Component {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "onClickUserSettings", e => {
      e.preventDefault();
      e.stopPropagation();

      _dispatcher.default.fire(_actions.Action.ViewUserSettings);
    });
  }

  render() {
    const roomId = this.props.room.roomId;

    const isEncrypted = _MatrixClientPeg.MatrixClientPeg.get().isRoomEncrypted(roomId);

    let previewsForAccount = null;
    let previewsForRoom = null;

    if (!isEncrypted) {
      // Only show account setting state and room state setting state in non-e2ee rooms where they apply
      const accountEnabled = _SettingsStore.default.getValueAt(_SettingLevel.SettingLevel.ACCOUNT, "urlPreviewsEnabled");

      if (accountEnabled) {
        previewsForAccount = (0, _languageHandler._t)("You have <a>enabled</a> URL previews by default.", {}, {
          'a': sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
            kind: "link_inline",
            onClick: this.onClickUserSettings
          }, sub)
        });
      } else {
        previewsForAccount = (0, _languageHandler._t)("You have <a>disabled</a> URL previews by default.", {}, {
          'a': sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
            kind: "link_inline",
            onClick: this.onClickUserSettings
          }, sub)
        });
      }

      if (_SettingsStore.default.canSetValue("urlPreviewsEnabled", roomId, _SettingLevel.SettingLevel.ROOM)) {
        previewsForRoom = /*#__PURE__*/_react.default.createElement("label", null, /*#__PURE__*/_react.default.createElement(_SettingsFlag.default, {
          name: "urlPreviewsEnabled",
          level: _SettingLevel.SettingLevel.ROOM,
          roomId: roomId,
          isExplicit: true
        }));
      } else {
        let str = (0, _languageHandler._td)("URL previews are enabled by default for participants in this room.");

        if (!_SettingsStore.default.getValueAt(_SettingLevel.SettingLevel.ROOM, "urlPreviewsEnabled", roomId,
        /*explicit=*/
        true)) {
          str = (0, _languageHandler._td)("URL previews are disabled by default for participants in this room.");
        }

        previewsForRoom = /*#__PURE__*/_react.default.createElement("label", null, (0, _languageHandler._t)(str));
      }
    } else {
      previewsForAccount = (0, _languageHandler._t)("In encrypted rooms, like this one, URL previews are disabled by default to ensure that your " + "homeserver (where the previews are generated) cannot gather information about links you see in " + "this room.");
    }

    const previewsForRoomAccount =
    /*#__PURE__*/
    // in an e2ee room we use a special key to enforce per-room opt-in
    _react.default.createElement(_SettingsFlag.default, {
      name: isEncrypted ? 'urlPreviewsEnabled_e2ee' : 'urlPreviewsEnabled',
      level: _SettingLevel.SettingLevel.ROOM_ACCOUNT,
      roomId: roomId
    });

    const description = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)('When someone puts a URL in their message, a URL preview can be shown to give more ' + 'information about that link such as the title, description, and an image from the website.')), /*#__PURE__*/_react.default.createElement("p", null, previewsForAccount));

    return /*#__PURE__*/_react.default.createElement(_SettingsFieldset.default, {
      legend: (0, _languageHandler._t)("URL Previews"),
      description: description
    }, previewsForRoom, /*#__PURE__*/_react.default.createElement("label", null, previewsForRoomAccount));
  }

}

exports.default = UrlPreviewSettings;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVcmxQcmV2aWV3U2V0dGluZ3MiLCJSZWFjdCIsIkNvbXBvbmVudCIsImUiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsImRpcyIsImZpcmUiLCJBY3Rpb24iLCJWaWV3VXNlclNldHRpbmdzIiwicmVuZGVyIiwicm9vbUlkIiwicHJvcHMiLCJyb29tIiwiaXNFbmNyeXB0ZWQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJpc1Jvb21FbmNyeXB0ZWQiLCJwcmV2aWV3c0ZvckFjY291bnQiLCJwcmV2aWV3c0ZvclJvb20iLCJhY2NvdW50RW5hYmxlZCIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZUF0IiwiU2V0dGluZ0xldmVsIiwiQUNDT1VOVCIsIl90Iiwic3ViIiwib25DbGlja1VzZXJTZXR0aW5ncyIsImNhblNldFZhbHVlIiwiUk9PTSIsInN0ciIsIl90ZCIsInByZXZpZXdzRm9yUm9vbUFjY291bnQiLCJST09NX0FDQ09VTlQiLCJkZXNjcmlwdGlvbiJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21fc2V0dGluZ3MvVXJsUHJldmlld1NldHRpbmdzLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE3IFRyYXZpcyBSYWxzdG9uXG5Db3B5cmlnaHQgMjAxOCwgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuXG5pbXBvcnQgeyBfdCwgX3RkIH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgZGlzIGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gXCIuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcbmltcG9ydCB7IFNldHRpbmdMZXZlbCB9IGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nTGV2ZWxcIjtcbmltcG9ydCBTZXR0aW5nc0ZsYWcgZnJvbSBcIi4uL2VsZW1lbnRzL1NldHRpbmdzRmxhZ1wiO1xuaW1wb3J0IFNldHRpbmdzRmllbGRzZXQgZnJvbSAnLi4vc2V0dGluZ3MvU2V0dGluZ3NGaWVsZHNldCc7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tICcuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uJztcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgcm9vbTogUm9vbTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVXJsUHJldmlld1NldHRpbmdzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcz4ge1xuICAgIHByaXZhdGUgb25DbGlja1VzZXJTZXR0aW5ncyA9IChlOiBSZWFjdC5Nb3VzZUV2ZW50KTogdm9pZCA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZGlzLmZpcmUoQWN0aW9uLlZpZXdVc2VyU2V0dGluZ3MpO1xuICAgIH07XG5cbiAgICBwdWJsaWMgcmVuZGVyKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgY29uc3Qgcm9vbUlkID0gdGhpcy5wcm9wcy5yb29tLnJvb21JZDtcbiAgICAgICAgY29uc3QgaXNFbmNyeXB0ZWQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuaXNSb29tRW5jcnlwdGVkKHJvb21JZCk7XG5cbiAgICAgICAgbGV0IHByZXZpZXdzRm9yQWNjb3VudCA9IG51bGw7XG4gICAgICAgIGxldCBwcmV2aWV3c0ZvclJvb20gPSBudWxsO1xuXG4gICAgICAgIGlmICghaXNFbmNyeXB0ZWQpIHtcbiAgICAgICAgICAgIC8vIE9ubHkgc2hvdyBhY2NvdW50IHNldHRpbmcgc3RhdGUgYW5kIHJvb20gc3RhdGUgc2V0dGluZyBzdGF0ZSBpbiBub24tZTJlZSByb29tcyB3aGVyZSB0aGV5IGFwcGx5XG4gICAgICAgICAgICBjb25zdCBhY2NvdW50RW5hYmxlZCA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWVBdChTZXR0aW5nTGV2ZWwuQUNDT1VOVCwgXCJ1cmxQcmV2aWV3c0VuYWJsZWRcIik7XG4gICAgICAgICAgICBpZiAoYWNjb3VudEVuYWJsZWQpIHtcbiAgICAgICAgICAgICAgICBwcmV2aWV3c0ZvckFjY291bnQgPSAoXG4gICAgICAgICAgICAgICAgICAgIF90KFwiWW91IGhhdmUgPGE+ZW5hYmxlZDwvYT4gVVJMIHByZXZpZXdzIGJ5IGRlZmF1bHQuXCIsIHt9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnYSc6IChzdWIpID0+IDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2luZD0nbGlua19pbmxpbmUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkNsaWNrVXNlclNldHRpbmdzfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN1YiB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHByZXZpZXdzRm9yQWNjb3VudCA9IChcbiAgICAgICAgICAgICAgICAgICAgX3QoXCJZb3UgaGF2ZSA8YT5kaXNhYmxlZDwvYT4gVVJMIHByZXZpZXdzIGJ5IGRlZmF1bHQuXCIsIHt9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnYSc6IChzdWIpID0+IDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2luZD0nbGlua19pbmxpbmUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkNsaWNrVXNlclNldHRpbmdzfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN1YiB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmNhblNldFZhbHVlKFwidXJsUHJldmlld3NFbmFibGVkXCIsIHJvb21JZCwgU2V0dGluZ0xldmVsLlJPT00pKSB7XG4gICAgICAgICAgICAgICAgcHJldmlld3NGb3JSb29tID0gKFxuICAgICAgICAgICAgICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICA8U2V0dGluZ3NGbGFnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZT1cInVybFByZXZpZXdzRW5hYmxlZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV2ZWw9e1NldHRpbmdMZXZlbC5ST09NfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb21JZD17cm9vbUlkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRXhwbGljaXQ9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBzdHIgPSBfdGQoXCJVUkwgcHJldmlld3MgYXJlIGVuYWJsZWQgYnkgZGVmYXVsdCBmb3IgcGFydGljaXBhbnRzIGluIHRoaXMgcm9vbS5cIik7XG4gICAgICAgICAgICAgICAgaWYgKCFTZXR0aW5nc1N0b3JlLmdldFZhbHVlQXQoU2V0dGluZ0xldmVsLlJPT00sIFwidXJsUHJldmlld3NFbmFibGVkXCIsIHJvb21JZCwgLypleHBsaWNpdD0qL3RydWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0ciA9IF90ZChcIlVSTCBwcmV2aWV3cyBhcmUgZGlzYWJsZWQgYnkgZGVmYXVsdCBmb3IgcGFydGljaXBhbnRzIGluIHRoaXMgcm9vbS5cIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHByZXZpZXdzRm9yUm9vbSA9ICg8bGFiZWw+eyBfdChzdHIpIH08L2xhYmVsPik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwcmV2aWV3c0ZvckFjY291bnQgPSAoXG4gICAgICAgICAgICAgICAgX3QoXCJJbiBlbmNyeXB0ZWQgcm9vbXMsIGxpa2UgdGhpcyBvbmUsIFVSTCBwcmV2aWV3cyBhcmUgZGlzYWJsZWQgYnkgZGVmYXVsdCB0byBlbnN1cmUgdGhhdCB5b3VyIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJob21lc2VydmVyICh3aGVyZSB0aGUgcHJldmlld3MgYXJlIGdlbmVyYXRlZCkgY2Fubm90IGdhdGhlciBpbmZvcm1hdGlvbiBhYm91dCBsaW5rcyB5b3Ugc2VlIGluIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJ0aGlzIHJvb20uXCIpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcHJldmlld3NGb3JSb29tQWNjb3VudCA9ICggLy8gaW4gYW4gZTJlZSByb29tIHdlIHVzZSBhIHNwZWNpYWwga2V5IHRvIGVuZm9yY2UgcGVyLXJvb20gb3B0LWluXG4gICAgICAgICAgICA8U2V0dGluZ3NGbGFnIG5hbWU9e2lzRW5jcnlwdGVkID8gJ3VybFByZXZpZXdzRW5hYmxlZF9lMmVlJyA6ICd1cmxQcmV2aWV3c0VuYWJsZWQnfVxuICAgICAgICAgICAgICAgIGxldmVsPXtTZXR0aW5nTGV2ZWwuUk9PTV9BQ0NPVU5UfVxuICAgICAgICAgICAgICAgIHJvb21JZD17cm9vbUlkfSAvPlxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gPD5cbiAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgIHsgX3QoJ1doZW4gc29tZW9uZSBwdXRzIGEgVVJMIGluIHRoZWlyIG1lc3NhZ2UsIGEgVVJMIHByZXZpZXcgY2FuIGJlIHNob3duIHRvIGdpdmUgbW9yZSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdpbmZvcm1hdGlvbiBhYm91dCB0aGF0IGxpbmsgc3VjaCBhcyB0aGUgdGl0bGUsIGRlc2NyaXB0aW9uLCBhbmQgYW4gaW1hZ2UgZnJvbSB0aGUgd2Vic2l0ZS4nKSB9XG4gICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICA8cD57IHByZXZpZXdzRm9yQWNjb3VudCB9PC9wPlxuICAgICAgICA8Lz47XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxTZXR0aW5nc0ZpZWxkc2V0IGxlZ2VuZD17X3QoXCJVUkwgUHJldmlld3NcIil9IGRlc2NyaXB0aW9uPXtkZXNjcmlwdGlvbn0+XG4gICAgICAgICAgICAgICAgeyBwcmV2aWV3c0ZvclJvb20gfVxuICAgICAgICAgICAgICAgIDxsYWJlbD57IHByZXZpZXdzRm9yUm9vbUFjY291bnQgfTwvbGFiZWw+XG4gICAgICAgICAgICA8L1NldHRpbmdzRmllbGRzZXQ+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQW1CQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUE5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBbUJlLE1BQU1BLGtCQUFOLFNBQWlDQyxjQUFBLENBQU1DLFNBQXZDLENBQXlEO0VBQUE7SUFBQTtJQUFBLDJEQUNyQ0MsQ0FBRCxJQUErQjtNQUN6REEsQ0FBQyxDQUFDQyxjQUFGO01BQ0FELENBQUMsQ0FBQ0UsZUFBRjs7TUFDQUMsbUJBQUEsQ0FBSUMsSUFBSixDQUFTQyxlQUFBLENBQU9DLGdCQUFoQjtJQUNILENBTG1FO0VBQUE7O0VBTzdEQyxNQUFNLEdBQWdCO0lBQ3pCLE1BQU1DLE1BQU0sR0FBRyxLQUFLQyxLQUFMLENBQVdDLElBQVgsQ0FBZ0JGLE1BQS9COztJQUNBLE1BQU1HLFdBQVcsR0FBR0MsZ0NBQUEsQ0FBZ0JDLEdBQWhCLEdB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