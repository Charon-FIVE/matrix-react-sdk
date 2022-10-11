"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _languageHandler = require("../../../languageHandler");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _Field = _interopRequireDefault(require("../elements/Field"));

var _Media = require("../../../customisations/Media");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _AvatarSetting = _interopRequireDefault(require("../settings/AvatarSetting"));

var _serialize = require("../../../editor/serialize");

var _BrowserWorkarounds = require("../../../utils/BrowserWorkarounds");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

// TODO: Merge with ProfileSettings?
class RoomProfileSettings extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "avatarUpload", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "uploadAvatar", () => {
      this.avatarUpload.current.click();
    });
    (0, _defineProperty2.default)(this, "removeAvatar", () => {
      // clear file upload field so same file can be selected
      this.avatarUpload.current.value = "";
      this.setState({
        avatarUrl: null,
        avatarFile: null,
        profileFieldsTouched: _objectSpread(_objectSpread({}, this.state.profileFieldsTouched), {}, {
          avatar: true
        })
      });
    });
    (0, _defineProperty2.default)(this, "isSaveEnabled", () => {
      return Boolean(Object.values(this.state.profileFieldsTouched).length);
    });
    (0, _defineProperty2.default)(this, "cancelProfileChanges", async e => {
      e.stopPropagation();
      e.preventDefault();
      if (!this.isSaveEnabled()) return;
      this.setState({
        profileFieldsTouched: {},
        displayName: this.state.originalDisplayName,
        topic: this.state.originalTopic,
        avatarUrl: this.state.originalAvatarUrl,
        avatarFile: null
      });
    });
    (0, _defineProperty2.default)(this, "saveProfile", async e => {
      e.stopPropagation();
      e.preventDefault();
      if (!this.isSaveEnabled()) return;
      this.setState({
        profileFieldsTouched: {}
      });

      const client = _MatrixClientPeg.MatrixClientPeg.get();

      const newState = {}; // TODO: What do we do about errors?

      const displayName = this.state.displayName.trim();

      if (this.state.originalDisplayName !== this.state.displayName) {
        await client.setRoomName(this.props.roomId, displayName);
        newState.originalDisplayName = displayName;
        newState.displayName = displayName;
      }

      if (this.state.avatarFile) {
        const uri = await client.uploadContent(this.state.avatarFile);
        await client.sendStateEvent(this.props.roomId, 'm.room.avatar', {
          url: uri
        }, '');
        newState.avatarUrl = (0, _Media.mediaFromMxc)(uri).getSquareThumbnailHttp(96);
        newState.originalAvatarUrl = newState.avatarUrl;
        newState.avatarFile = null;
      } else if (this.state.originalAvatarUrl !== this.state.avatarUrl) {
        await client.sendStateEvent(this.props.roomId, 'm.room.avatar', {}, '');
      }

      if (this.state.originalTopic !== this.state.topic) {
        const html = (0, _serialize.htmlSerializeFromMdIfNeeded)(this.state.topic, {
          forceHTML: false
        });
        await client.setRoomTopic(this.props.roomId, this.state.topic, html);
        newState.originalTopic = this.state.topic;
      }

      this.setState(newState);
    });
    (0, _defineProperty2.default)(this, "onDisplayNameChanged", e => {
      this.setState({
        displayName: e.target.value
      });

      if (this.state.originalDisplayName === e.target.value) {
        this.setState({
          profileFieldsTouched: _objectSpread(_objectSpread({}, this.state.profileFieldsTouched), {}, {
            name: false
          })
        });
      } else {
        this.setState({
          profileFieldsTouched: _objectSpread(_objectSpread({}, this.state.profileFieldsTouched), {}, {
            name: true
          })
        });
      }
    });
    (0, _defineProperty2.default)(this, "onTopicChanged", e => {
      this.setState({
        topic: e.target.value
      });

      if (this.state.originalTopic === e.target.value) {
        this.setState({
          profileFieldsTouched: _objectSpread(_objectSpread({}, this.state.profileFieldsTouched), {}, {
            topic: false
          })
        });
      } else {
        this.setState({
          profileFieldsTouched: _objectSpread(_objectSpread({}, this.state.profileFieldsTouched), {}, {
            topic: true
          })
        });
      }
    });
    (0, _defineProperty2.default)(this, "onAvatarChanged", e => {
      if (!e.target.files || !e.target.files.length) {
        this.setState({
          avatarUrl: this.state.originalAvatarUrl,
          avatarFile: null,
          profileFieldsTouched: _objectSpread(_objectSpread({}, this.state.profileFieldsTouched), {}, {
            avatar: false
          })
        });
        return;
      }

      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = ev => {
        this.setState({
          avatarUrl: String(ev.target.result),
          avatarFile: file,
          profileFieldsTouched: _objectSpread(_objectSpread({}, this.state.profileFieldsTouched), {}, {
            avatar: true
          })
        });
      };

      reader.readAsDataURL(file);
    });

    const _client = _MatrixClientPeg.MatrixClientPeg.get();

    const room = _client.getRoom(props.roomId);

    if (!room) throw new Error(`Expected a room for ID: ${props.roomId}`);
    const avatarEvent = room.currentState.getStateEvents("m.room.avatar", "");
    let avatarUrl = avatarEvent && avatarEvent.getContent() ? avatarEvent.getContent()["url"] : null;
    if (avatarUrl) avatarUrl = (0, _Media.mediaFromMxc)(avatarUrl).getSquareThumbnailHttp(96);
    const topicEvent = room.currentState.getStateEvents("m.room.topic", "");
    const topic = topicEvent && topicEvent.getContent() ? topicEvent.getContent()['topic'] : '';
    const nameEvent = room.currentState.getStateEvents('m.room.name', '');
    const name = nameEvent && nameEvent.getContent() ? nameEvent.getContent()['name'] : '';
    this.state = {
      originalDisplayName: name,
      displayName: name,
      originalAvatarUrl: avatarUrl,
      avatarUrl: avatarUrl,
      avatarFile: null,
      originalTopic: topic,
      topic: topic,
      profileFieldsTouched: {},
      canSetName: room.currentState.maySendStateEvent('m.room.name', _client.getUserId()),
      canSetTopic: room.currentState.maySendStateEvent('m.room.topic', _client.getUserId()),
      canSetAvatar: room.currentState.maySendStateEvent('m.room.avatar', _client.getUserId())
    };
  }

  render() {
    let profileSettingsButtons;

    if (this.state.canSetName || this.state.canSetTopic || this.state.canSetAvatar) {
      profileSettingsButtons = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_ProfileSettings_buttons"
      }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.cancelProfileChanges,
        kind: "link",
        disabled: !this.isSaveEnabled()
      }, (0, _languageHandler._t)("Cancel")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.saveProfile,
        kind: "primary",
        disabled: !this.isSaveEnabled()
      }, (0, _languageHandler._t)("Save")));
    }

    return /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.saveProfile,
      autoComplete: "off",
      noValidate: true,
      className: "mx_ProfileSettings"
    }, /*#__PURE__*/_react.default.createElement("input", {
      type: "file",
      ref: this.avatarUpload,
      className: "mx_ProfileSettings_avatarUpload",
      onClick: _BrowserWorkarounds.chromeFileInputFix,
      onChange: this.onAvatarChanged,
      accept: "image/*"
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ProfileSettings_profile"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ProfileSettings_profile_controls"
    }, /*#__PURE__*/_react.default.createElement(_Field.default, {
      label: (0, _languageHandler._t)("Room Name"),
      type: "text",
      value: this.state.displayName,
      autoComplete: "off",
      onChange: this.onDisplayNameChanged,
      disabled: !this.state.canSetName
    }), /*#__PURE__*/_react.default.createElement(_Field.default, {
      className: (0, _classnames.default)("mx_ProfileSettings_profile_controls_topic", "mx_ProfileSettings_profile_controls_topic--room"),
      id: "profileTopic" // See: NewRoomIntro.tsx
      ,
      label: (0, _languageHandler._t)("Room Topic"),
      disabled: !this.state.canSetTopic,
      type: "text",
      value: this.state.topic,
      autoComplete: "off",
      onChange: this.onTopicChanged,
      element: "textarea"
    })), /*#__PURE__*/_react.default.createElement(_AvatarSetting.default, {
      avatarUrl: this.state.avatarUrl,
      avatarName: this.state.displayName || this.props.roomId,
      avatarAltText: (0, _languageHandler._t)("Room avatar"),
      uploadAvatar: this.state.canSetAvatar ? this.uploadAvatar : undefined,
      removeAvatar: this.state.canSetAvatar ? this.removeAvatar : undefined
    })), profileSettingsButtons);
  }

}

exports.default = RoomProfileSettings;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSb29tUHJvZmlsZVNldHRpbmdzIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY3JlYXRlUmVmIiwiYXZhdGFyVXBsb2FkIiwiY3VycmVudCIsImNsaWNrIiwidmFsdWUiLCJzZXRTdGF0ZSIsImF2YXRhclVybCIsImF2YXRhckZpbGUiLCJwcm9maWxlRmllbGRzVG91Y2hlZCIsInN0YXRlIiwiYXZhdGFyIiwiQm9vbGVhbiIsIk9iamVjdCIsInZhbHVlcyIsImxlbmd0aCIsImUiLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsImlzU2F2ZUVuYWJsZWQiLCJkaXNwbGF5TmFtZSIsIm9yaWdpbmFsRGlzcGxheU5hbWUiLCJ0b3BpYyIsIm9yaWdpbmFsVG9waWMiLCJvcmlnaW5hbEF2YXRhclVybCIsImNsaWVudCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsIm5ld1N0YXRlIiwidHJpbSIsInNldFJvb21OYW1lIiwicm9vbUlkIiwidXJpIiwidXBsb2FkQ29udGVudCIsInNlbmRTdGF0ZUV2ZW50IiwidXJsIiwibWVkaWFGcm9tTXhjIiwiZ2V0U3F1YXJlVGh1bWJuYWlsSHR0cCIsImh0bWwiLCJodG1sU2VyaWFsaXplRnJvbU1kSWZOZWVkZWQiLCJmb3JjZUhUTUwiLCJzZXRSb29tVG9waWMiLCJ0YXJnZXQiLCJuYW1lIiwiZmlsZXMiLCJmaWxlIiwicmVhZGVyIiwiRmlsZVJlYWRlciIsIm9ubG9hZCIsImV2IiwiU3RyaW5nIiwicmVzdWx0IiwicmVhZEFzRGF0YVVSTCIsInJvb20iLCJnZXRSb29tIiwiRXJyb3IiLCJhdmF0YXJFdmVudCIsImN1cnJlbnRTdGF0ZSIsImdldFN0YXRlRXZlbnRzIiwiZ2V0Q29udGVudCIsInRvcGljRXZlbnQiLCJuYW1lRXZlbnQiLCJjYW5TZXROYW1lIiwibWF5U2VuZFN0YXRlRXZlbnQiLCJnZXRVc2VySWQiLCJjYW5TZXRUb3BpYyIsImNhblNldEF2YXRhciIsInJlbmRlciIsInByb2ZpbGVTZXR0aW5nc0J1dHRvbnMiLCJjYW5jZWxQcm9maWxlQ2hhbmdlcyIsIl90Iiwic2F2ZVByb2ZpbGUiLCJjaHJvbWVGaWxlSW5wdXRGaXgiLCJvbkF2YXRhckNoYW5nZWQiLCJvbkRpc3BsYXlOYW1lQ2hhbmdlZCIsImNsYXNzTmFtZXMiLCJvblRvcGljQ2hhbmdlZCIsInVwbG9hZEF2YXRhciIsInVuZGVmaW5lZCIsInJlbW92ZUF2YXRhciJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21fc2V0dGluZ3MvUm9vbVByb2ZpbGVTZXR0aW5ncy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IGNyZWF0ZVJlZiB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5cbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSBcIi4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IEZpZWxkIGZyb20gXCIuLi9lbGVtZW50cy9GaWVsZFwiO1xuaW1wb3J0IHsgbWVkaWFGcm9tTXhjIH0gZnJvbSBcIi4uLy4uLy4uL2N1c3RvbWlzYXRpb25zL01lZGlhXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IEF2YXRhclNldHRpbmcgZnJvbSBcIi4uL3NldHRpbmdzL0F2YXRhclNldHRpbmdcIjtcbmltcG9ydCB7IGh0bWxTZXJpYWxpemVGcm9tTWRJZk5lZWRlZCB9IGZyb20gJy4uLy4uLy4uL2VkaXRvci9zZXJpYWxpemUnO1xuaW1wb3J0IHsgY2hyb21lRmlsZUlucHV0Rml4IH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL0Jyb3dzZXJXb3JrYXJvdW5kc1wiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICByb29tSWQ6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgb3JpZ2luYWxEaXNwbGF5TmFtZTogc3RyaW5nO1xuICAgIGRpc3BsYXlOYW1lOiBzdHJpbmc7XG4gICAgb3JpZ2luYWxBdmF0YXJVcmw6IHN0cmluZztcbiAgICBhdmF0YXJVcmw6IHN0cmluZztcbiAgICBhdmF0YXJGaWxlOiBGaWxlO1xuICAgIG9yaWdpbmFsVG9waWM6IHN0cmluZztcbiAgICB0b3BpYzogc3RyaW5nO1xuICAgIHByb2ZpbGVGaWVsZHNUb3VjaGVkOiBSZWNvcmQ8c3RyaW5nLCBib29sZWFuPjtcbiAgICBjYW5TZXROYW1lOiBib29sZWFuO1xuICAgIGNhblNldFRvcGljOiBib29sZWFuO1xuICAgIGNhblNldEF2YXRhcjogYm9vbGVhbjtcbn1cblxuLy8gVE9ETzogTWVyZ2Ugd2l0aCBQcm9maWxlU2V0dGluZ3M/XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSb29tUHJvZmlsZVNldHRpbmdzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSBhdmF0YXJVcGxvYWQgPSBjcmVhdGVSZWY8SFRNTElucHV0RWxlbWVudD4oKTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBJUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3Qgcm9vbSA9IGNsaWVudC5nZXRSb29tKHByb3BzLnJvb21JZCk7XG4gICAgICAgIGlmICghcm9vbSkgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBhIHJvb20gZm9yIElEOiAke3Byb3BzLnJvb21JZH1gKTtcblxuICAgICAgICBjb25zdCBhdmF0YXJFdmVudCA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKFwibS5yb29tLmF2YXRhclwiLCBcIlwiKTtcbiAgICAgICAgbGV0IGF2YXRhclVybCA9IGF2YXRhckV2ZW50ICYmIGF2YXRhckV2ZW50LmdldENvbnRlbnQoKSA/IGF2YXRhckV2ZW50LmdldENvbnRlbnQoKVtcInVybFwiXSA6IG51bGw7XG4gICAgICAgIGlmIChhdmF0YXJVcmwpIGF2YXRhclVybCA9IG1lZGlhRnJvbU14YyhhdmF0YXJVcmwpLmdldFNxdWFyZVRodW1ibmFpbEh0dHAoOTYpO1xuXG4gICAgICAgIGNvbnN0IHRvcGljRXZlbnQgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhcIm0ucm9vbS50b3BpY1wiLCBcIlwiKTtcbiAgICAgICAgY29uc3QgdG9waWMgPSB0b3BpY0V2ZW50ICYmIHRvcGljRXZlbnQuZ2V0Q29udGVudCgpID8gdG9waWNFdmVudC5nZXRDb250ZW50KClbJ3RvcGljJ10gOiAnJztcblxuICAgICAgICBjb25zdCBuYW1lRXZlbnQgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cygnbS5yb29tLm5hbWUnLCAnJyk7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBuYW1lRXZlbnQgJiYgbmFtZUV2ZW50LmdldENvbnRlbnQoKSA/IG5hbWVFdmVudC5nZXRDb250ZW50KClbJ25hbWUnXSA6ICcnO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBvcmlnaW5hbERpc3BsYXlOYW1lOiBuYW1lLFxuICAgICAgICAgICAgZGlzcGxheU5hbWU6IG5hbWUsXG4gICAgICAgICAgICBvcmlnaW5hbEF2YXRhclVybDogYXZhdGFyVXJsLFxuICAgICAgICAgICAgYXZhdGFyVXJsOiBhdmF0YXJVcmwsXG4gICAgICAgICAgICBhdmF0YXJGaWxlOiBudWxsLFxuICAgICAgICAgICAgb3JpZ2luYWxUb3BpYzogdG9waWMsXG4gICAgICAgICAgICB0b3BpYzogdG9waWMsXG4gICAgICAgICAgICBwcm9maWxlRmllbGRzVG91Y2hlZDoge30sXG4gICAgICAgICAgICBjYW5TZXROYW1lOiByb29tLmN1cnJlbnRTdGF0ZS5tYXlTZW5kU3RhdGVFdmVudCgnbS5yb29tLm5hbWUnLCBjbGllbnQuZ2V0VXNlcklkKCkpLFxuICAgICAgICAgICAgY2FuU2V0VG9waWM6IHJvb20uY3VycmVudFN0YXRlLm1heVNlbmRTdGF0ZUV2ZW50KCdtLnJvb20udG9waWMnLCBjbGllbnQuZ2V0VXNlcklkKCkpLFxuICAgICAgICAgICAgY2FuU2V0QXZhdGFyOiByb29tLmN1cnJlbnRTdGF0ZS5tYXlTZW5kU3RhdGVFdmVudCgnbS5yb29tLmF2YXRhcicsIGNsaWVudC5nZXRVc2VySWQoKSksXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB1cGxvYWRBdmF0YXIgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuYXZhdGFyVXBsb2FkLmN1cnJlbnQuY2xpY2soKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSByZW1vdmVBdmF0YXIgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIC8vIGNsZWFyIGZpbGUgdXBsb2FkIGZpZWxkIHNvIHNhbWUgZmlsZSBjYW4gYmUgc2VsZWN0ZWRcbiAgICAgICAgdGhpcy5hdmF0YXJVcGxvYWQuY3VycmVudC52YWx1ZSA9IFwiXCI7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYXZhdGFyVXJsOiBudWxsLFxuICAgICAgICAgICAgYXZhdGFyRmlsZTogbnVsbCxcbiAgICAgICAgICAgIHByb2ZpbGVGaWVsZHNUb3VjaGVkOiB7XG4gICAgICAgICAgICAgICAgLi4udGhpcy5zdGF0ZS5wcm9maWxlRmllbGRzVG91Y2hlZCxcbiAgICAgICAgICAgICAgICBhdmF0YXI6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBpc1NhdmVFbmFibGVkID0gKCkgPT4ge1xuICAgICAgICByZXR1cm4gQm9vbGVhbihPYmplY3QudmFsdWVzKHRoaXMuc3RhdGUucHJvZmlsZUZpZWxkc1RvdWNoZWQpLmxlbmd0aCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgY2FuY2VsUHJvZmlsZUNoYW5nZXMgPSBhc3luYyAoZTogUmVhY3QuTW91c2VFdmVudCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLmlzU2F2ZUVuYWJsZWQoKSkgcmV0dXJuO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHByb2ZpbGVGaWVsZHNUb3VjaGVkOiB7fSxcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiB0aGlzLnN0YXRlLm9yaWdpbmFsRGlzcGxheU5hbWUsXG4gICAgICAgICAgICB0b3BpYzogdGhpcy5zdGF0ZS5vcmlnaW5hbFRvcGljLFxuICAgICAgICAgICAgYXZhdGFyVXJsOiB0aGlzLnN0YXRlLm9yaWdpbmFsQXZhdGFyVXJsLFxuICAgICAgICAgICAgYXZhdGFyRmlsZTogbnVsbCxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgc2F2ZVByb2ZpbGUgPSBhc3luYyAoZTogUmVhY3QuRm9ybUV2ZW50KTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBpZiAoIXRoaXMuaXNTYXZlRW5hYmxlZCgpKSByZXR1cm47XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwcm9maWxlRmllbGRzVG91Y2hlZDoge30gfSk7XG5cbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCBuZXdTdGF0ZTogUGFydGlhbDxJU3RhdGU+ID0ge307XG5cbiAgICAgICAgLy8gVE9ETzogV2hhdCBkbyB3ZSBkbyBhYm91dCBlcnJvcnM/XG4gICAgICAgIGNvbnN0IGRpc3BsYXlOYW1lID0gdGhpcy5zdGF0ZS5kaXNwbGF5TmFtZS50cmltKCk7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLm9yaWdpbmFsRGlzcGxheU5hbWUgIT09IHRoaXMuc3RhdGUuZGlzcGxheU5hbWUpIHtcbiAgICAgICAgICAgIGF3YWl0IGNsaWVudC5zZXRSb29tTmFtZSh0aGlzLnByb3BzLnJvb21JZCwgZGlzcGxheU5hbWUpO1xuICAgICAgICAgICAgbmV3U3RhdGUub3JpZ2luYWxEaXNwbGF5TmFtZSA9IGRpc3BsYXlOYW1lO1xuICAgICAgICAgICAgbmV3U3RhdGUuZGlzcGxheU5hbWUgPSBkaXNwbGF5TmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmF2YXRhckZpbGUpIHtcbiAgICAgICAgICAgIGNvbnN0IHVyaSA9IGF3YWl0IGNsaWVudC51cGxvYWRDb250ZW50KHRoaXMuc3RhdGUuYXZhdGFyRmlsZSk7XG4gICAgICAgICAgICBhd2FpdCBjbGllbnQuc2VuZFN0YXRlRXZlbnQodGhpcy5wcm9wcy5yb29tSWQsICdtLnJvb20uYXZhdGFyJywgeyB1cmw6IHVyaSB9LCAnJyk7XG4gICAgICAgICAgICBuZXdTdGF0ZS5hdmF0YXJVcmwgPSBtZWRpYUZyb21NeGModXJpKS5nZXRTcXVhcmVUaHVtYm5haWxIdHRwKDk2KTtcbiAgICAgICAgICAgIG5ld1N0YXRlLm9yaWdpbmFsQXZhdGFyVXJsID0gbmV3U3RhdGUuYXZhdGFyVXJsO1xuICAgICAgICAgICAgbmV3U3RhdGUuYXZhdGFyRmlsZSA9IG51bGw7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5vcmlnaW5hbEF2YXRhclVybCAhPT0gdGhpcy5zdGF0ZS5hdmF0YXJVcmwpIHtcbiAgICAgICAgICAgIGF3YWl0IGNsaWVudC5zZW5kU3RhdGVFdmVudCh0aGlzLnByb3BzLnJvb21JZCwgJ20ucm9vbS5hdmF0YXInLCB7fSwgJycpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUub3JpZ2luYWxUb3BpYyAhPT0gdGhpcy5zdGF0ZS50b3BpYykge1xuICAgICAgICAgICAgY29uc3QgaHRtbCA9IGh0bWxTZXJpYWxpemVGcm9tTWRJZk5lZWRlZCh0aGlzLnN0YXRlLnRvcGljLCB7IGZvcmNlSFRNTDogZmFsc2UgfSk7XG4gICAgICAgICAgICBhd2FpdCBjbGllbnQuc2V0Um9vbVRvcGljKHRoaXMucHJvcHMucm9vbUlkLCB0aGlzLnN0YXRlLnRvcGljLCBodG1sKTtcbiAgICAgICAgICAgIG5ld1N0YXRlLm9yaWdpbmFsVG9waWMgPSB0aGlzLnN0YXRlLnRvcGljO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZShuZXdTdGF0ZSBhcyBJU3RhdGUpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRGlzcGxheU5hbWVDaGFuZ2VkID0gKGU6IFJlYWN0LkNoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBkaXNwbGF5TmFtZTogZS50YXJnZXQudmFsdWUgfSk7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLm9yaWdpbmFsRGlzcGxheU5hbWUgPT09IGUudGFyZ2V0LnZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBwcm9maWxlRmllbGRzVG91Y2hlZDoge1xuICAgICAgICAgICAgICAgICAgICAuLi50aGlzLnN0YXRlLnByb2ZpbGVGaWVsZHNUb3VjaGVkLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBwcm9maWxlRmllbGRzVG91Y2hlZDoge1xuICAgICAgICAgICAgICAgICAgICAuLi50aGlzLnN0YXRlLnByb2ZpbGVGaWVsZHNUb3VjaGVkLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVG9waWNDaGFuZ2VkID0gKGU6IFJlYWN0LkNoYW5nZUV2ZW50PEhUTUxUZXh0QXJlYUVsZW1lbnQ+KTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyB0b3BpYzogZS50YXJnZXQudmFsdWUgfSk7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLm9yaWdpbmFsVG9waWMgPT09IGUudGFyZ2V0LnZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBwcm9maWxlRmllbGRzVG91Y2hlZDoge1xuICAgICAgICAgICAgICAgICAgICAuLi50aGlzLnN0YXRlLnByb2ZpbGVGaWVsZHNUb3VjaGVkLFxuICAgICAgICAgICAgICAgICAgICB0b3BpYzogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgcHJvZmlsZUZpZWxkc1RvdWNoZWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgLi4udGhpcy5zdGF0ZS5wcm9maWxlRmllbGRzVG91Y2hlZCxcbiAgICAgICAgICAgICAgICAgICAgdG9waWM6IHRydWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25BdmF0YXJDaGFuZ2VkID0gKGU6IFJlYWN0LkNoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KTogdm9pZCA9PiB7XG4gICAgICAgIGlmICghZS50YXJnZXQuZmlsZXMgfHwgIWUudGFyZ2V0LmZpbGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgYXZhdGFyVXJsOiB0aGlzLnN0YXRlLm9yaWdpbmFsQXZhdGFyVXJsLFxuICAgICAgICAgICAgICAgIGF2YXRhckZpbGU6IG51bGwsXG4gICAgICAgICAgICAgICAgcHJvZmlsZUZpZWxkc1RvdWNoZWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgLi4udGhpcy5zdGF0ZS5wcm9maWxlRmllbGRzVG91Y2hlZCxcbiAgICAgICAgICAgICAgICAgICAgYXZhdGFyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBmaWxlID0gZS50YXJnZXQuZmlsZXNbMF07XG4gICAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgIHJlYWRlci5vbmxvYWQgPSAoZXYpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGF2YXRhclVybDogU3RyaW5nKGV2LnRhcmdldC5yZXN1bHQpLFxuICAgICAgICAgICAgICAgIGF2YXRhckZpbGU6IGZpbGUsXG4gICAgICAgICAgICAgICAgcHJvZmlsZUZpZWxkc1RvdWNoZWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgLi4udGhpcy5zdGF0ZS5wcm9maWxlRmllbGRzVG91Y2hlZCxcbiAgICAgICAgICAgICAgICAgICAgYXZhdGFyOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZSk7XG4gICAgfTtcblxuICAgIHB1YmxpYyByZW5kZXIoKTogSlNYLkVsZW1lbnQge1xuICAgICAgICBsZXQgcHJvZmlsZVNldHRpbmdzQnV0dG9ucztcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5jYW5TZXROYW1lIHx8XG4gICAgICAgICAgICB0aGlzLnN0YXRlLmNhblNldFRvcGljIHx8XG4gICAgICAgICAgICB0aGlzLnN0YXRlLmNhblNldEF2YXRhclxuICAgICAgICApIHtcbiAgICAgICAgICAgIHByb2ZpbGVTZXR0aW5nc0J1dHRvbnMgPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Qcm9maWxlU2V0dGluZ3NfYnV0dG9uc1wiPlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5jYW5jZWxQcm9maWxlQ2hhbmdlc31cbiAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJsaW5rXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXshdGhpcy5pc1NhdmVFbmFibGVkKCl9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJDYW5jZWxcIikgfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLnNhdmVQcm9maWxlfVxuICAgICAgICAgICAgICAgICAgICAgICAga2luZD1cInByaW1hcnlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyF0aGlzLmlzU2F2ZUVuYWJsZWQoKX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIlNhdmVcIikgfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxmb3JtXG4gICAgICAgICAgICAgICAgb25TdWJtaXQ9e3RoaXMuc2F2ZVByb2ZpbGV9XG4gICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwib2ZmXCJcbiAgICAgICAgICAgICAgICBub1ZhbGlkYXRlPXt0cnVlfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Byb2ZpbGVTZXR0aW5nc1wiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJmaWxlXCJcbiAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLmF2YXRhclVwbG9hZH1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUHJvZmlsZVNldHRpbmdzX2F2YXRhclVwbG9hZFwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e2Nocm9tZUZpbGVJbnB1dEZpeH1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25BdmF0YXJDaGFuZ2VkfVxuICAgICAgICAgICAgICAgICAgICBhY2NlcHQ9XCJpbWFnZS8qXCJcbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUHJvZmlsZVNldHRpbmdzX3Byb2ZpbGVcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Qcm9maWxlU2V0dGluZ3NfcHJvZmlsZV9jb250cm9sc1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiUm9vbSBOYW1lXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5kaXNwbGF5TmFtZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uRGlzcGxheU5hbWVDaGFuZ2VkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXshdGhpcy5zdGF0ZS5jYW5TZXROYW1lfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJteF9Qcm9maWxlU2V0dGluZ3NfcHJvZmlsZV9jb250cm9sc190b3BpY1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm14X1Byb2ZpbGVTZXR0aW5nc19wcm9maWxlX2NvbnRyb2xzX3RvcGljLS1yb29tXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZD1cInByb2ZpbGVUb3BpY1wiIC8vIFNlZTogTmV3Um9vbUludHJvLnRzeFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIlJvb20gVG9waWNcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyF0aGlzLnN0YXRlLmNhblNldFRvcGljfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS50b3BpY31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uVG9waWNDaGFuZ2VkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ9XCJ0ZXh0YXJlYVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPEF2YXRhclNldHRpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2YXRhclVybD17dGhpcy5zdGF0ZS5hdmF0YXJVcmx9XG4gICAgICAgICAgICAgICAgICAgICAgICBhdmF0YXJOYW1lPXt0aGlzLnN0YXRlLmRpc3BsYXlOYW1lIHx8IHRoaXMucHJvcHMucm9vbUlkfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXZhdGFyQWx0VGV4dD17X3QoXCJSb29tIGF2YXRhclwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHVwbG9hZEF2YXRhcj17dGhpcy5zdGF0ZS5jYW5TZXRBdmF0YXIgPyB0aGlzLnVwbG9hZEF2YXRhciA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZUF2YXRhcj17dGhpcy5zdGF0ZS5jYW5TZXRBdmF0YXIgPyB0aGlzLnJlbW92ZUF2YXRhciA6IHVuZGVmaW5lZH0gLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICB7IHByb2ZpbGVTZXR0aW5nc0J1dHRvbnMgfVxuICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7QUFvQkE7QUFDZSxNQUFNQSxtQkFBTixTQUFrQ0MsY0FBQSxDQUFNQyxTQUF4QyxDQUFrRTtFQUc3RUMsV0FBVyxDQUFDQyxLQUFELEVBQWdCO0lBQ3ZCLE1BQU1BLEtBQU47SUFEdUIsaUVBRkosSUFBQUMsZ0JBQUEsR0FFSTtJQUFBLG9EQWdDSixNQUFZO01BQy9CLEtBQUtDLFlBQUwsQ0FBa0JDLE9BQWxCLENBQTBCQyxLQUExQjtJQUNILENBbEMwQjtJQUFBLG9EQW9DSixNQUFZO01BQy9CO01BQ0EsS0FBS0YsWUFBTCxDQUFrQkMsT0FBbEIsQ0FBMEJFLEtBQTFCLEdBQWtDLEVBQWxDO01BQ0EsS0FBS0MsUUFBTCxDQUFjO1FBQ1ZDLFNBQVMsRUFBRSxJQUREO1FBRVZDLFVBQVUsRUFBRSxJQUZGO1FBR1ZDLG9CQUFvQixrQ0FDYixLQUFLQyxLQUFMLENBQVdELG9CQURFO1VBRWhCRSxNQUFNLEVBQUU7UUFGUTtNQUhWLENBQWQ7SUFRSCxDQS9DMEI7SUFBQSxxREFpREgsTUFBTTtNQUMxQixPQUFPQyxPQUFPLENBQUNDLE1BQU0sQ0FBQ0MsTUFBUCxDQUFjLEtBQUtKLEtBQUwsQ0FBV0Qsb0JBQXpCLEVBQStDTSxNQUFoRCxDQUFkO0lBQ0gsQ0FuRDBCO0lBQUEsNERBcURJLE1BQU9DLENBQVAsSUFBOEM7TUFDekVBLENBQUMsQ0FBQ0MsZUFBRjtNQUNBRCxDQUFDLENBQUNFLGNB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