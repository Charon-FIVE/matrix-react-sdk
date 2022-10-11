"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../../../../languageHandler");

var _MatrixClientPeg = require("../../../../../MatrixClientPeg");

var _AccessibleButton = _interopRequireDefault(require("../../../elements/AccessibleButton"));

var _Notifier = _interopRequireDefault(require("../../../../../Notifier"));

var _SettingsStore = _interopRequireDefault(require("../../../../../settings/SettingsStore"));

var _SettingLevel = require("../../../../../settings/SettingLevel");

var _EchoChamber = require("../../../../../stores/local-echo/EchoChamber");

var _MatrixClientContext = _interopRequireDefault(require("../../../../../contexts/MatrixClientContext"));

var _StyledRadioGroup = _interopRequireDefault(require("../../../elements/StyledRadioGroup"));

var _RoomNotifs = require("../../../../../RoomNotifs");

var _dispatcher = _interopRequireDefault(require("../../../../../dispatcher/dispatcher"));

var _actions = require("../../../../../dispatcher/actions");

var _UserTab = require("../../../dialogs/UserTab");

var _BrowserWorkarounds = require("../../../../../utils/BrowserWorkarounds");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2019 - 2021 The Matrix.org Foundation C.I.C.

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
class NotificationsSettingsTab extends _react.default.Component {
  constructor(props, context) {
    super(props, context);
    (0, _defineProperty2.default)(this, "roomProps", void 0);
    (0, _defineProperty2.default)(this, "soundUpload", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "context", void 0);
    (0, _defineProperty2.default)(this, "triggerUploader", async e => {
      e.stopPropagation();
      e.preventDefault();
      this.soundUpload.current.click();
    });
    (0, _defineProperty2.default)(this, "onSoundUploadChanged", e => {
      if (!e.target.files || !e.target.files.length) {
        this.setState({
          uploadedFile: null
        });
        return;
      }

      const file = e.target.files[0];
      this.setState({
        uploadedFile: file
      });
    });
    (0, _defineProperty2.default)(this, "onClickSaveSound", async e => {
      e.stopPropagation();
      e.preventDefault();

      try {
        await this.saveSound();
      } catch (ex) {
        _logger.logger.error(`Unable to save notification sound for ${this.props.roomId}`);

        _logger.logger.error(ex);
      }
    });
    (0, _defineProperty2.default)(this, "clearSound", e => {
      e.stopPropagation();
      e.preventDefault();

      _SettingsStore.default.setValue("notificationSound", this.props.roomId, _SettingLevel.SettingLevel.ROOM_ACCOUNT, null);

      this.setState({
        currentSound: "default"
      });
    });
    (0, _defineProperty2.default)(this, "onRoomNotificationChange", value => {
      this.roomProps.notificationVolume = value;
      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "onOpenSettingsClick", () => {
      this.props.closeSettingsFn();

      _dispatcher.default.dispatch({
        action: _actions.Action.ViewUserSettings,
        initialTabId: _UserTab.UserTab.Notifications
      });
    });
    this.roomProps = _EchoChamber.EchoChamber.forRoom(context.getRoom(this.props.roomId));
    this.state = {
      currentSound: "default",
      uploadedFile: null
    };
  } // TODO: [REACT-WARNING] Replace component with real class, use constructor for refs
  // eslint-disable-next-line @typescript-eslint/naming-convention, camelcase


  UNSAFE_componentWillMount() {
    const soundData = _Notifier.default.getSoundForRoom(this.props.roomId);

    if (!soundData) {
      return;
    }

    this.setState({
      currentSound: soundData.name || soundData.url
    });
  }

  async saveSound() {
    if (!this.state.uploadedFile) {
      return;
    }

    let type = this.state.uploadedFile.type;

    if (type === "video/ogg") {
      // XXX: I've observed browsers allowing users to pick a audio/ogg files,
      // and then calling it a video/ogg. This is a lame hack, but man browsers
      // suck at detecting mimetypes.
      type = "audio/ogg";
    }

    const url = await _MatrixClientPeg.MatrixClientPeg.get().uploadContent(this.state.uploadedFile, {
      type
    });
    await _SettingsStore.default.setValue("notificationSound", this.props.roomId, _SettingLevel.SettingLevel.ROOM_ACCOUNT, {
      name: this.state.uploadedFile.name,
      type: type,
      size: this.state.uploadedFile.size,
      url
    });
    this.setState({
      uploadedFile: null,
      currentSound: this.state.uploadedFile.name
    });
  }

  render() {
    let currentUploadedFile = null;

    if (this.state.uploadedFile) {
      currentUploadedFile = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Uploaded sound"), ": ", /*#__PURE__*/_react.default.createElement("code", null, this.state.uploadedFile.name)));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_heading"
    }, (0, _languageHandler._t)("Notifications")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section mx_NotificationSettingsTab_notificationsSection"
    }, /*#__PURE__*/_react.default.createElement(_StyledRadioGroup.default, {
      name: "roomNotificationSetting",
      definitions: [{
        value: _RoomNotifs.RoomNotifState.AllMessages,
        className: "mx_NotificationSettingsTab_defaultEntry",
        label: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, (0, _languageHandler._t)("Default"), /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_NotificationSettingsTab_microCopy"
        }, (0, _languageHandler._t)("Get notifications as set up in your <a>settings</a>", {}, {
          a: sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
            kind: "link_inline",
            onClick: this.onOpenSettingsClick
          }, sub)
        })))
      }, {
        value: _RoomNotifs.RoomNotifState.AllMessagesLoud,
        className: "mx_NotificationSettingsTab_allMessagesEntry",
        label: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, (0, _languageHandler._t)("All messages"), /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_NotificationSettingsTab_microCopy"
        }, (0, _languageHandler._t)("Get notified for every message")))
      }, {
        value: _RoomNotifs.RoomNotifState.MentionsOnly,
        className: "mx_NotificationSettingsTab_mentionsKeywordsEntry",
        label: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, (0, _languageHandler._t)("@mentions & keywords"), /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_NotificationSettingsTab_microCopy"
        }, (0, _languageHandler._t)("Get notified only with mentions and keywords " + "as set up in your <a>settings</a>", {}, {
          a: sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
            kind: "link_inline",
            onClick: this.onOpenSettingsClick
          }, sub)
        })))
      }, {
        value: _RoomNotifs.RoomNotifState.Mute,
        className: "mx_NotificationSettingsTab_noneEntry",
        label: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, (0, _languageHandler._t)("Off"), /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_NotificationSettingsTab_microCopy"
        }, (0, _languageHandler._t)("You won't get any notifications")))
      }],
      onChange: this.onRoomNotificationChange,
      value: this.roomProps.notificationVolume
    })), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section mx_SettingsTab_subsectionText"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Sounds")), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_subsectionText"
    }, /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Notification sound"), ": ", /*#__PURE__*/_react.default.createElement("code", null, this.state.currentSound))), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_NotificationSound_resetSound",
      disabled: this.state.currentSound == "default",
      onClick: this.clearSound,
      kind: "primary"
    }, (0, _languageHandler._t)("Reset"))), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Set a new custom sound")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsFlag"
    }, /*#__PURE__*/_react.default.createElement("form", {
      autoComplete: "off",
      noValidate: true
    }, /*#__PURE__*/_react.default.createElement("input", {
      ref: this.soundUpload,
      className: "mx_NotificationSound_soundUpload",
      type: "file",
      onClick: _BrowserWorkarounds.chromeFileInputFix,
      onChange: this.onSoundUploadChanged,
      accept: "audio/*"
    })), currentUploadedFile), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_NotificationSound_browse",
      onClick: this.triggerUploader,
      kind: "primary"
    }, (0, _languageHandler._t)("Browse")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_NotificationSound_save",
      disabled: this.state.uploadedFile == null,
      onClick: this.onClickSaveSound,
      kind: "primary"
    }, (0, _languageHandler._t)("Save")), /*#__PURE__*/_react.default.createElement("br", null))));
  }

}

exports.default = NotificationsSettingsTab;
(0, _defineProperty2.default)(NotificationsSettingsTab, "contextType", _MatrixClientContext.default);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOb3RpZmljYXRpb25zU2V0dGluZ3NUYWIiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjb250ZXh0IiwiY3JlYXRlUmVmIiwiZSIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0Iiwic291bmRVcGxvYWQiLCJjdXJyZW50IiwiY2xpY2siLCJ0YXJnZXQiLCJmaWxlcyIsImxlbmd0aCIsInNldFN0YXRlIiwidXBsb2FkZWRGaWxlIiwiZmlsZSIsInNhdmVTb3VuZCIsImV4IiwibG9nZ2VyIiwiZXJyb3IiLCJyb29tSWQiLCJTZXR0aW5nc1N0b3JlIiwic2V0VmFsdWUiLCJTZXR0aW5nTGV2ZWwiLCJST09NX0FDQ09VTlQiLCJjdXJyZW50U291bmQiLCJ2YWx1ZSIsInJvb21Qcm9wcyIsIm5vdGlmaWNhdGlvblZvbHVtZSIsImZvcmNlVXBkYXRlIiwiY2xvc2VTZXR0aW5nc0ZuIiwiZGVmYXVsdERpc3BhdGNoZXIiLCJkaXNwYXRjaCIsImFjdGlvbiIsIkFjdGlvbiIsIlZpZXdVc2VyU2V0dGluZ3MiLCJpbml0aWFsVGFiSWQiLCJVc2VyVGFiIiwiTm90aWZpY2F0aW9ucyIsIkVjaG9DaGFtYmVyIiwiZm9yUm9vbSIsImdldFJvb20iLCJzdGF0ZSIsIlVOU0FGRV9jb21wb25lbnRXaWxsTW91bnQiLCJzb3VuZERhdGEiLCJOb3RpZmllciIsImdldFNvdW5kRm9yUm9vbSIsIm5hbWUiLCJ1cmwiLCJ0eXBlIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwidXBsb2FkQ29udGVudCIsInNpemUiLCJyZW5kZXIiLCJjdXJyZW50VXBsb2FkZWRGaWxlIiwiX3QiLCJSb29tTm90aWZTdGF0ZSIsIkFsbE1lc3NhZ2VzIiwiY2xhc3NOYW1lIiwibGFiZWwiLCJhIiwic3ViIiwib25PcGVuU2V0dGluZ3NDbGljayIsIkFsbE1lc3NhZ2VzTG91ZCIsIk1lbnRpb25zT25seSIsIk11dGUiLCJvblJvb21Ob3RpZmljYXRpb25DaGFuZ2UiLCJjbGVhclNvdW5kIiwiY2hyb21lRmlsZUlucHV0Rml4Iiwib25Tb3VuZFVwbG9hZENoYW5nZWQiLCJ0cmlnZ2VyVXBsb2FkZXIiLCJvbkNsaWNrU2F2ZVNvdW5kIiwiTWF0cml4Q2xpZW50Q29udGV4dCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL3RhYnMvcm9vbS9Ob3RpZmljYXRpb25TZXR0aW5nc1RhYi50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IC0gMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBjcmVhdGVSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5cbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uLy4uLy4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBOb3RpZmllciBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vTm90aWZpZXJcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gJy4uLy4uLy4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmUnO1xuaW1wb3J0IHsgU2V0dGluZ0xldmVsIH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdMZXZlbFwiO1xuaW1wb3J0IHsgUm9vbUVjaG9DaGFtYmVyIH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL3N0b3Jlcy9sb2NhbC1lY2hvL1Jvb21FY2hvQ2hhbWJlclwiO1xuaW1wb3J0IHsgRWNob0NoYW1iZXIgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zdG9yZXMvbG9jYWwtZWNoby9FY2hvQ2hhbWJlcic7XG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuaW1wb3J0IFN0eWxlZFJhZGlvR3JvdXAgZnJvbSBcIi4uLy4uLy4uL2VsZW1lbnRzL1N0eWxlZFJhZGlvR3JvdXBcIjtcbmltcG9ydCB7IFJvb21Ob3RpZlN0YXRlIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vUm9vbU5vdGlmcyc7XG5pbXBvcnQgZGVmYXVsdERpc3BhdGNoZXIgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IHsgVXNlclRhYiB9IGZyb20gXCIuLi8uLi8uLi9kaWFsb2dzL1VzZXJUYWJcIjtcbmltcG9ydCB7IGNocm9tZUZpbGVJbnB1dEZpeCB9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi91dGlscy9Ccm93c2VyV29ya2Fyb3VuZHNcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgcm9vbUlkOiBzdHJpbmc7XG4gICAgY2xvc2VTZXR0aW5nc0ZuKCk6IHZvaWQ7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGN1cnJlbnRTb3VuZDogc3RyaW5nO1xuICAgIHVwbG9hZGVkRmlsZTogRmlsZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTm90aWZpY2F0aW9uc1NldHRpbmdzVGFiIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSByZWFkb25seSByb29tUHJvcHM6IFJvb21FY2hvQ2hhbWJlcjtcbiAgICBwcml2YXRlIHNvdW5kVXBsb2FkID0gY3JlYXRlUmVmPEhUTUxJbnB1dEVsZW1lbnQ+KCk7XG5cbiAgICBzdGF0aWMgY29udGV4dFR5cGUgPSBNYXRyaXhDbGllbnRDb250ZXh0O1xuICAgIHB1YmxpYyBjb250ZXh0ITogUmVhY3QuQ29udGV4dFR5cGU8dHlwZW9mIE1hdHJpeENsaWVudENvbnRleHQ+O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcywgY29udGV4dDogUmVhY3QuQ29udGV4dFR5cGU8dHlwZW9mIE1hdHJpeENsaWVudENvbnRleHQ+KSB7XG4gICAgICAgIHN1cGVyKHByb3BzLCBjb250ZXh0KTtcblxuICAgICAgICB0aGlzLnJvb21Qcm9wcyA9IEVjaG9DaGFtYmVyLmZvclJvb20oY29udGV4dC5nZXRSb29tKHRoaXMucHJvcHMucm9vbUlkKSk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGN1cnJlbnRTb3VuZDogXCJkZWZhdWx0XCIsXG4gICAgICAgICAgICB1cGxvYWRlZEZpbGU6IG51bGwsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gVE9ETzogW1JFQUNULVdBUk5JTkddIFJlcGxhY2UgY29tcG9uZW50IHdpdGggcmVhbCBjbGFzcywgdXNlIGNvbnN0cnVjdG9yIGZvciByZWZzXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uYW1pbmctY29udmVudGlvbiwgY2FtZWxjYXNlXG4gICAgcHVibGljIFVOU0FGRV9jb21wb25lbnRXaWxsTW91bnQoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHNvdW5kRGF0YSA9IE5vdGlmaWVyLmdldFNvdW5kRm9yUm9vbSh0aGlzLnByb3BzLnJvb21JZCk7XG4gICAgICAgIGlmICghc291bmREYXRhKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGN1cnJlbnRTb3VuZDogc291bmREYXRhLm5hbWUgfHwgc291bmREYXRhLnVybCB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHRyaWdnZXJVcGxvYWRlciA9IGFzeW5jIChlOiBSZWFjdC5Nb3VzZUV2ZW50KTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICB0aGlzLnNvdW5kVXBsb2FkLmN1cnJlbnQuY2xpY2soKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblNvdW5kVXBsb2FkQ2hhbmdlZCA9IChlOiBSZWFjdC5DaGFuZ2VFdmVudDxIVE1MSW5wdXRFbGVtZW50Pik6IHZvaWQgPT4ge1xuICAgICAgICBpZiAoIWUudGFyZ2V0LmZpbGVzIHx8ICFlLnRhcmdldC5maWxlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHVwbG9hZGVkRmlsZTogbnVsbCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZmlsZSA9IGUudGFyZ2V0LmZpbGVzWzBdO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHVwbG9hZGVkRmlsZTogZmlsZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25DbGlja1NhdmVTb3VuZCA9IGFzeW5jIChlOiBSZWFjdC5Nb3VzZUV2ZW50KTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zYXZlU291bmQoKTtcbiAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgICAgICBgVW5hYmxlIHRvIHNhdmUgbm90aWZpY2F0aW9uIHNvdW5kIGZvciAke3RoaXMucHJvcHMucm9vbUlkfWAsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGV4KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIGFzeW5jIHNhdmVTb3VuZCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnVwbG9hZGVkRmlsZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHR5cGUgPSB0aGlzLnN0YXRlLnVwbG9hZGVkRmlsZS50eXBlO1xuICAgICAgICBpZiAodHlwZSA9PT0gXCJ2aWRlby9vZ2dcIikge1xuICAgICAgICAgICAgLy8gWFhYOiBJJ3ZlIG9ic2VydmVkIGJyb3dzZXJzIGFsbG93aW5nIHVzZXJzIHRvIHBpY2sgYSBhdWRpby9vZ2cgZmlsZXMsXG4gICAgICAgICAgICAvLyBhbmQgdGhlbiBjYWxsaW5nIGl0IGEgdmlkZW8vb2dnLiBUaGlzIGlzIGEgbGFtZSBoYWNrLCBidXQgbWFuIGJyb3dzZXJzXG4gICAgICAgICAgICAvLyBzdWNrIGF0IGRldGVjdGluZyBtaW1ldHlwZXMuXG4gICAgICAgICAgICB0eXBlID0gXCJhdWRpby9vZ2dcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHVybCA9IGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS51cGxvYWRDb250ZW50KFxuICAgICAgICAgICAgdGhpcy5zdGF0ZS51cGxvYWRlZEZpbGUsIHtcbiAgICAgICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgKTtcblxuICAgICAgICBhd2FpdCBTZXR0aW5nc1N0b3JlLnNldFZhbHVlKFxuICAgICAgICAgICAgXCJub3RpZmljYXRpb25Tb3VuZFwiLFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5yb29tSWQsXG4gICAgICAgICAgICBTZXR0aW5nTGV2ZWwuUk9PTV9BQ0NPVU5ULFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuc3RhdGUudXBsb2FkZWRGaWxlLm5hbWUsXG4gICAgICAgICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICAgICAgICBzaXplOiB0aGlzLnN0YXRlLnVwbG9hZGVkRmlsZS5zaXplLFxuICAgICAgICAgICAgICAgIHVybCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB1cGxvYWRlZEZpbGU6IG51bGwsXG4gICAgICAgICAgICBjdXJyZW50U291bmQ6IHRoaXMuc3RhdGUudXBsb2FkZWRGaWxlLm5hbWUsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2xlYXJTb3VuZCA9IChlOiBSZWFjdC5Nb3VzZUV2ZW50KTogdm9pZCA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZShcbiAgICAgICAgICAgIFwibm90aWZpY2F0aW9uU291bmRcIixcbiAgICAgICAgICAgIHRoaXMucHJvcHMucm9vbUlkLFxuICAgICAgICAgICAgU2V0dGluZ0xldmVsLlJPT01fQUNDT1VOVCxcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBjdXJyZW50U291bmQ6IFwiZGVmYXVsdFwiLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJvb21Ob3RpZmljYXRpb25DaGFuZ2UgPSAodmFsdWU6IFJvb21Ob3RpZlN0YXRlKSA9PiB7XG4gICAgICAgIHRoaXMucm9vbVByb3BzLm5vdGlmaWNhdGlvblZvbHVtZSA9IHZhbHVlO1xuICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25PcGVuU2V0dGluZ3NDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5jbG9zZVNldHRpbmdzRm4oKTtcbiAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1VzZXJTZXR0aW5ncyxcbiAgICAgICAgICAgIGluaXRpYWxUYWJJZDogVXNlclRhYi5Ob3RpZmljYXRpb25zLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHVibGljIHJlbmRlcigpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIGxldCBjdXJyZW50VXBsb2FkZWRGaWxlID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUudXBsb2FkZWRGaWxlKSB7XG4gICAgICAgICAgICBjdXJyZW50VXBsb2FkZWRGaWxlID0gKFxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPnsgX3QoXCJVcGxvYWRlZCBzb3VuZFwiKSB9OiA8Y29kZT57IHRoaXMuc3RhdGUudXBsb2FkZWRGaWxlLm5hbWUgfTwvY29kZT48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX2hlYWRpbmdcIj57IF90KFwiTm90aWZpY2F0aW9uc1wiKSB9PC9kaXY+XG5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3NlY3Rpb24gbXhfTm90aWZpY2F0aW9uU2V0dGluZ3NUYWJfbm90aWZpY2F0aW9uc1NlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgPFN0eWxlZFJhZGlvR3JvdXBcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU9XCJyb29tTm90aWZpY2F0aW9uU2V0dGluZ1wiXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZpbml0aW9ucz17W1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFJvb21Ob3RpZlN0YXRlLkFsbE1lc3NhZ2VzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwibXhfTm90aWZpY2F0aW9uU2V0dGluZ3NUYWJfZGVmYXVsdEVudHJ5XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiA8PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkRlZmF1bHRcIikgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Ob3RpZmljYXRpb25TZXR0aW5nc1RhYl9taWNyb0NvcHlcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiR2V0IG5vdGlmaWNhdGlvbnMgYXMgc2V0IHVwIGluIHlvdXIgPGE+c2V0dGluZ3M8L2E+XCIsIHt9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGE6IHN1YiA9PiA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2luZD1cImxpbmtfaW5saW5lXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25PcGVuU2V0dGluZ3NDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdWIgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Lz4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogUm9vbU5vdGlmU3RhdGUuQWxsTWVzc2FnZXNMb3VkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwibXhfTm90aWZpY2F0aW9uU2V0dGluZ3NUYWJfYWxsTWVzc2FnZXNFbnRyeVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogPD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJBbGwgbWVzc2FnZXNcIikgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Ob3RpZmljYXRpb25TZXR0aW5nc1RhYl9taWNyb0NvcHlcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiR2V0IG5vdGlmaWVkIGZvciBldmVyeSBtZXNzYWdlXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Lz4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogUm9vbU5vdGlmU3RhdGUuTWVudGlvbnNPbmx5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwibXhfTm90aWZpY2F0aW9uU2V0dGluZ3NUYWJfbWVudGlvbnNLZXl3b3Jkc0VudHJ5XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiA8PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkBtZW50aW9ucyAmIGtleXdvcmRzXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTm90aWZpY2F0aW9uU2V0dGluZ3NUYWJfbWljcm9Db3B5XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkdldCBub3RpZmllZCBvbmx5IHdpdGggbWVudGlvbnMgYW5kIGtleXdvcmRzIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhcyBzZXQgdXAgaW4geW91ciA8YT5zZXR0aW5nczwvYT5cIiwge30sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYTogc3ViID0+IDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBraW5kPVwibGlua19pbmxpbmVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbk9wZW5TZXR0aW5nc0NsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN1YiB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvPixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBSb29tTm90aWZTdGF0ZS5NdXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwibXhfTm90aWZpY2F0aW9uU2V0dGluZ3NUYWJfbm9uZUVudHJ5XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiA8PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIk9mZlwiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X05vdGlmaWNhdGlvblNldHRpbmdzVGFiX21pY3JvQ29weVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJZb3Ugd29uJ3QgZ2V0IGFueSBub3RpZmljYXRpb25zXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Lz4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF19XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblJvb21Ob3RpZmljYXRpb25DaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5yb29tUHJvcHMubm90aWZpY2F0aW9uVm9sdW1lfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3NlY3Rpb24gbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3N1YmhlYWRpbmcnPnsgX3QoXCJTb3VuZHNcIikgfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57IF90KFwiTm90aWZpY2F0aW9uIHNvdW5kXCIpIH06IDxjb2RlPnsgdGhpcy5zdGF0ZS5jdXJyZW50U291bmQgfTwvY29kZT48L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X05vdGlmaWNhdGlvblNvdW5kX3Jlc2V0U291bmRcIiBkaXNhYmxlZD17dGhpcy5zdGF0ZS5jdXJyZW50U291bmQgPT0gXCJkZWZhdWx0XCJ9IG9uQ2xpY2s9e3RoaXMuY2xlYXJTb3VuZH0ga2luZD1cInByaW1hcnlcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiUmVzZXRcIikgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxoMz57IF90KFwiU2V0IGEgbmV3IGN1c3RvbSBzb3VuZFwiKSB9PC9oMz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NGbGFnXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGZvcm0gYXV0b0NvbXBsZXRlPVwib2ZmXCIgbm9WYWxpZGF0ZT17dHJ1ZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLnNvdW5kVXBsb2FkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTm90aWZpY2F0aW9uU291bmRfc291bmRVcGxvYWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImZpbGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17Y2hyb21lRmlsZUlucHV0Rml4fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25Tb3VuZFVwbG9hZENoYW5nZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY2NlcHQ9XCJhdWRpby8qXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Zvcm0+XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGN1cnJlbnRVcGxvYWRlZEZpbGUgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X05vdGlmaWNhdGlvblNvdW5kX2Jyb3dzZVwiIG9uQ2xpY2s9e3RoaXMudHJpZ2dlclVwbG9hZGVyfSBraW5kPVwicHJpbWFyeVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJCcm93c2VcIikgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuXG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9Ob3RpZmljYXRpb25Tb3VuZF9zYXZlXCIgZGlzYWJsZWQ9e3RoaXMuc3RhdGUudXBsb2FkZWRGaWxlID09IG51bGx9IG9uQ2xpY2s9e3RoaXMub25DbGlja1NhdmVTb3VuZH0ga2luZD1cInByaW1hcnlcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiU2F2ZVwiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8YnIgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBK0JlLE1BQU1BLHdCQUFOLFNBQXVDQyxjQUFBLENBQU1DLFNBQTdDLENBQXVFO0VBT2xGQyxXQUFXLENBQUNDLEtBQUQsRUFBZ0JDLE9BQWhCLEVBQXdFO0lBQy9FLE1BQU1ELEtBQU4sRUFBYUMsT0FBYjtJQUQrRTtJQUFBLGdFQUw3RCxJQUFBQyxnQkFBQSxHQUs2RDtJQUFBO0lBQUEsdURBcUJ6RCxNQUFPQyxDQUFQLElBQThDO01BQ3BFQSxDQUFDLENBQUNDLGVBQUY7TUFDQUQsQ0FBQyxDQUFDRSxjQUFGO01BRUEsS0FBS0MsV0FBTCxDQUFpQkMsT0FBakIsQ0FBeUJDLEtBQXpCO0lBQ0gsQ0ExQmtGO0lBQUEsNERBNEJuREwsQ0FBRCxJQUFrRDtNQUM3RSxJQUFJLENBQUNBLENBQUMsQ0FBQ00sTUFBRixDQUFTQyxLQUFWLElBQW1CLENBQUNQLENBQUMsQ0FBQ00sTUFBRixDQUFTQyxLQUFULENBQWVDLE1BQXZDLEVBQStDO1FBQzNDLEtBQUtDLFFBQUwsQ0FBYztVQUNWQyxZQUFZLEVBQUU7UUFESixDQUFkO1FBR0E7TUFDSDs7TUFFRCxNQUFNQyxJQUFJLEdBQUdYLENBQUMsQ0FBQ00sTUFBRixDQUFTQyxLQUFULENBQWUsQ0FBZixDQUFiO01BQ0EsS0FBS0UsUUFBTCxDQUFjO1FBQ1ZDLFlBQVksRUFBRUM7TUFESixDQUFkO0lBR0gsQ0F4Q2tGO0lBQUEsd0RBMEN4RCxNQUFPWCxDQUFQLElBQThDO01BQ3JFQSxDQUFDLENBQUNDLGVBQUY7TUFDQUQsQ0FBQyxDQUFDRSxjQUFGOztNQUVBLElBQUk7UUFDQSxNQUFNLEtBQUtVLFNBQUwsRUFBTjtNQUNILENBRkQsQ0FFRSxPQUFPQyxFQUFQLEVBQVc7UUFDVEMsY0FBQSxDQUFPQyxLQUFQLENBQ0sseUNBQXdDLEtBQUtsQixLQUFMLENBQVdtQixNQUFPLEVBRC9EOztRQUdBRixjQUFBLENBQU9DLEtBQVAsQ0FBYUYsRUFBYjtNQUNIO0lBQ0osQ0F0RGtGO0lBQUEsa0RBNkY3RGIsQ0FBRCxJQUErQjtNQUNoREEsQ0FBQyxDQUFDQyxlQUFGO01BQ0FELENBQUMsQ0FBQ0UsY0FBRjs7TUFDQWUsc0JBQUEsQ0FBY0MsUUFBZCxDQUNJLG1CQURKLEVBRUksS0FBS3JCLEtBQUwsQ0FBV21CLE1BRmYsRUFHSUcsMEJBQUEsQ0FBYUMsWUFIakIsRUFJSSxJQUpKOztNQU9BLEtBQUtYLFFBQUwsQ0FBYztRQUNWWSxZQUFZLEVBQUU7TUFESixDQUFkO0lBR0gsQ0ExR2tGO0lBQUEsZ0VBNEcvQ0MsS0FBRCxJQUEyQjtNQUMxRCxLQUFLQyxTQUFMLENBQWVDLGtCQUFmLEdBQW9DRixLQUFwQztNQUNBLEtBQUtHLFdBQUw7SUFDSCxDQS9Ha0Y7SUFBQSwyREFpSHJELE1BQU07TUFDaEMsS0FBSzVCLEtBQUwsQ0FBVzZCLGVBQVg7O01BQ0FDLG1CQUFBLENBQWtCQyxRQUFsQixDQUEyQjtRQUN2QkMsTUFBTSxFQUFFQyxlQUFBLENBQU9DLGdCQURRO1FBRXZCQyxZQUFZLEVBQUVDLGdCQUFBLENBQVFDO01BRkMsQ0FBM0I7SUFJSCxDQXZIa0Y7SUFHL0UsS0FBS1gsU0FBTCxHQUFpQlksd0JBQUEsQ0FBWUMsT0FBWixDQUFvQnRDLE9BQU8sQ0FBQ3VDLE9BQVIsQ0FBZ0IsS0FBS3hDLEtBQUwsQ0FBV21CLE1BQTNCLENBQXBCLENBQWpCO0lBRUEsS0FBS3NCLEtBQUwsR0FBYTtNQUNUakIsWUFBWSxFQUFFLFNBREw7TUFFVFgsWUFBWSxFQUFFO0lBRkwsQ0FBYjtFQUlILENBaEJpRixDQWtCbEY7RUFDQTs7O0VBQ082Qix5QkFBeUIsR0FBUztJQUNyQyxNQUFNQyxTQUFTLEdBQUdDLGlCQUFBLENBQVNDLGVBQVQsQ0FBeUIsS0FBSzdDLEtBQUwsQ0FBV21CLE1BQXBDLENBQWxCOztJQUNBLElBQUksQ0FBQ3dCLFNBQUwsRUFBZ0I7TUFDWjtJQUNIOztJQUNELEtBQUsvQixRQUFMLENBQWM7TUFBRVksWUFBWSxFQUFFbUIsU0FBUyxDQUFDRyxJQUFWLElBQWtCSCxTQUFTLENBQUNJO0lBQTVDLENBQWQ7RUFDSDs7RUFxQ3NCLE1BQVRoQyxTQUFTLEdBQWtCO0lBQ3JDLElBQUksQ0FBQyxLQUFLMEIsS0FBTCxDQUFXNUIsWUFBaEIsRUFBOEI7TUFDMUI7SUFDSDs7SUFFRCxJQUFJbUMsSUFBSSxHQUFHLEtBQUtQLEtBQUwsQ0FBVzVCLFlBQVgsQ0FBd0JtQyxJQUFuQzs7SUFDQSxJQUFJQSxJQUFJLEtBQUssV0FBYixFQUEwQjtNQUN0QjtNQUNBO01BQ0E7TUFDQUEsSUFBSSxHQUFHLFdBQVA7SUFDSDs7SUFFRCxNQUFNRCxHQUFHLEdBQUcsTUFBTUUsZ0NBQUEsQ0FBZ0JDLEdBQWhCLEdBQXNCQyxhQUF0QixDQUNkLEtBQUtWLEtBQUwsQ0FBVzVCLFlBREcsRUFDVztNQUNyQm1DO0lBRHFCLENBRFgsQ0FBbEI7SUFNQSxNQUFNNUIsc0JBQUEsQ0FBY0MsUUFBZCxDQUNGLG1CQURFLEVBRUYsS0FBS3JCLEtBQUwsQ0FBV21CLE1BRlQsRUFHRkcsMEJBQUEsQ0FBYUMsWUFIWCxFQUlGO01BQ0l1QixJQUFJLEVBQUUsS0FBS0wsS0FBTCxDQUFXNUIsWUFBWCxDQUF3QmlDLElBRGxDO01BRUlFLElBQUksRUFBRUEsSUFGVjtNQUdJSSxJQUFJLEVBQUUsS0FBS1gsS0FBTCxDQUFXNUIsWUFBWCxDQUF3QnVDLElBSGxDO01BSUlMO0lBSkosQ0FKRSxDQUFOO0lBWUEsS0FBS25DLFFBQUwsQ0FBYztNQUNWQyxZQUFZLEVBQUUsSUFESjtNQUVWVyxZQUFZLEVBQUUsS0FBS2lCLEtBQUwsQ0FBVzVCLFlBQVgsQ0FBd0JpQztJQUY1QixDQUFkO0VBSUg7O0VBOEJNTyxNQUFNLEdBQWdCO0lBQ3pCLElBQUlDLG1CQUFtQixHQUFHLElBQTFCOztJQUNBLElBQUksS0FBS2IsS0FBTCxDQUFXNUIsWUFBZixFQUE2QjtNQUN6QnlDLG1CQUFtQixnQkFDZix1REFDSSwyQ0FBUSxJQUFBQyxtQkFBQSxFQUFHLGdCQUFILENBQVIscUJBQWdDLDJDQUFRLEtBQUtkLEtBQUwsQ0FBVzVCLFlBQVgsQ0FBd0JpQyxJQUFoQyxDQUFoQyxDQURKLENBREo7SUFLSDs7SUFFRCxvQkFDSTtNQUFLLFNBQVMsRUFBQztJQUFmLGdCQUNJO01BQUssU0FBUyxFQUFDO0lBQWYsR0FBMEMsSUFBQVMsbUJBQUEsRUFBRyxlQUFILENBQTFDLENBREosZUFHSTtNQUFLLFNBQVMsRUFBQztJQUFmLGdCQUNJLDZCQUFDLHlCQUFEO01BQ0ksSUFBSSxFQUFDLHlCQURUO01BRUksV0FBVyxFQUFFLENBQ1Q7UUFDSTlCLEtBQUssRUFBRStCLDBCQUFBLENBQWVDLFdBRDFCO1FBRUlDLFNBQVMsRUFBRSx5Q0FGZjtRQUdJQyxLQUFLLGVBQUUsNERBQ0QsSUFBQUosbUJBQUEsRUFBRyxTQUFILENBREMsZUFFSDtVQUFLLFNBQVMsRUFBQztRQUFmLEdBQ00sSUFBQUEsbUJBQUEsRUFBRyxxREFBSCxFQUEwRCxFQUExRCxFQUE4RDtVQUM1REssQ0FBQyxFQUFFQyxHQUFHLGlCQUFJLDZCQUFDLHlCQUFEO1lBQ04sSUFBSSxFQUFDLGFBREM7WUFFTixPQUFPLEVBQUUsS0FBS0M7VUFGUixHQUlKRCxHQUpJO1FBRGtELENBQTlELENBRE4sQ0FGRztNQUhYLENBRFMsRUFpQk47UUFDQ3BDLEtBQUssRUFBRStCLDBCQUFBLENBQWVPLGVBRHZCO1FBRUNMLFNBQVMsRUFBRSw2Q0FGWjtRQUdDQyxLQUFLLGVBQUUsNERBQ0QsSUFBQUosbUJBQUEsRUFBRyxjQUFILENBREMsZUFFSDtVQUFLLFNBQVMsRUFBQztRQUFmLEdBQ00sSUFBQUEsbUJBQUEsRUFBRyxnQ0FBSCxDQUROLENBRkc7TUFIUixDQWpCTSxFQTBCTjtRQUNDOUIsS0FBSyxFQUFFK0IsMEJBQUEsQ0FBZVEsWUFEdkI7UUFFQ04sU0FBUyxFQUFFLGtEQUZaO1FBR0NDLEtBQUssZUFBRSw0REFDRCxJQUFBSixtQkFBQSxFQUFHLHNCQUFILENBREMsZUFFSDtVQUFLLFNBQVMsRUFBQztRQUFmLEdBQ00sSUFBQUEsbUJBQUEsRUFBRyxrREFDRCxtQ0FERixFQUN1QyxFQUR2QyxFQUMyQztVQUN6Q0ssQ0FBQyxFQUFFQyxHQUFHLGlCQUFJLDZCQUFDLHlCQUFEO1lBQ04sSUFBSSxFQUFDLGFBREM7WUFFTixPQUFPLEVBQUUsS0FBS0M7VUFGUixHQUlKRCxHQUpJO1FBRCtCLENBRDNDLENBRE4sQ0FGRztNQUhSLENBMUJNLEVBMkNOO1FBQ0NwQyxLQUFLLEVBQUUrQiwwQkFBQSxDQUFlUyxJQUR2QjtRQUVDUCxTQUFTLEVBQUUsc0NBRlo7UUFHQ0MsS0FBSyxlQUFFLDREQUNELElBQUFKLG1CQUFBLEVBQUcsS0FBSCxDQURDLGVBRUg7VUFBSyxTQUFTLEVBQUM7UUFBZixHQUNNLElBQUFBLG1CQUFBLEVBQUcsaUNBQUgsQ0FETixDQUZHO01BSFIsQ0EzQ00sQ0FGakI7TUF3REksUUFBUSxFQUFFLEtBQUtXLHdCQXhEbkI7TUF5REksS0FBSyxFQUFFLEtBQUt4QyxTQUFMLENBQWVDO0lBekQxQixFQURKLENBSEosZUFpRUk7TUFBSyxTQUFTLEVBQUM7SUFBZixnQkFDSTtNQUFNLFNBQVMsRUFBQztJQUFoQixHQUE4QyxJQUFBNEIsbUJBQUEsRUFBRyxRQUFILENBQTlDLENBREosZUFFSSx1REFDSTtNQUFLLFNBQVMsRUFBQztJQUFmLGdCQUNJLDJDQUFRLElBQUFBLG1CQUFBLEVBQUcsb0JBQUgsQ0FBUixxQkFBb0MsMkNBQVEsS0FBS2QsS0FBTCxDQUFXakIsWUFBbkIsQ0FBcEMsQ0FESixDQURKLGVBSUksNkJBQUMseUJBQUQ7TUFBa0IsU0FBUyxFQUFDLGlDQUE1QjtNQUE4RCxRQUFRLEVBQUUsS0FBS2lCLEtBQUwsQ0FBV2pCLFlBQVgsSUFBMkIsU0FBbkc7TUFBOEcsT0FBTyxFQUFFLEtBQUsyQyxVQUE1SDtNQUF3SSxJQUFJLEVBQUM7SUFBN0ksR0FDTSxJQUFBWixtQkFBQSxFQUFHLE9BQUgsQ0FETixDQUpKLENBRkosZUFVSSx1REFDSSx5Q0FBTSxJQUFBQSxtQkFBQSxFQUFHLHdCQUFILENBQU4sQ0FESixlQUVJO01BQUssU0FBUyxFQUFDO0lBQWYsZ0JBQ0k7TUFBTSxZQUFZLEVBQUMsS0FBbkI7TUFBeUIsVUFBVSxFQUFFO0lBQXJDLGdCQUNJO01BQ0ksR0FBRyxFQUFFLEtBQUtqRCxXQURkO01BRUksU0FBUyxFQUFDLGtDQUZkO01BR0ksSUFBSSxFQUFDLE1BSFQ7TUFJSSxPQUFPLEVBQUU4RCxzQ0FKYjtNQUtJLFFBQVEsRUFBRSxLQUFLQyxvQkFMbkI7TUFNSSxNQUFNLEVBQUM7SUFOWCxFQURKLENBREosRUFZTWYsbUJBWk4sQ0FGSixlQWlCSSw2QkFBQyx5QkFBRDtNQUFrQixTQUFTLEVBQUMsNkJBQTVCO01BQTBELE9BQU8sRUFBRSxLQUFLZ0IsZUFBeEU7TUFBeUYsSUFBSSxFQUFDO0lBQTlGLEdBQ00sSUFBQWYsbUJBQUEsRUFBRyxRQUFILENBRE4sQ0FqQkosZUFxQkksNkJBQUMseUJBQUQ7TUFBa0IsU0FBUyxFQUFDLDJCQUE1QjtNQUF3RCxRQUFRLEVBQUUsS0FBS2QsS0FBTCxDQUFXNUIsWUFBWCxJQUEyQixJQUE3RjtNQUFtRyxPQUFPLEVBQUUsS0FBSzBELGdCQUFqSDtNQUFtSSxJQUFJLEVBQUM7SUFBeEksR0FDTSxJQUFBaEIsbUJBQUEsRUFBRyxNQUFILENBRE4sQ0FyQkosZUF3Qkksd0NBeEJKLENBVkosQ0FqRUosQ0FESjtFQXlHSDs7QUFuUGlGOzs7OEJBQWpFM0Qsd0IsaUJBSUk0RSw0QiJ9