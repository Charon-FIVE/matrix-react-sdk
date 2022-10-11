"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../../languageHandler");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _Field = _interopRequireDefault(require("../elements/Field"));

var _HostingLink = require("../../../utils/HostingLink");

var _OwnProfileStore = require("../../../stores/OwnProfileStore");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _ErrorDialog = _interopRequireDefault(require("../dialogs/ErrorDialog"));

var _Media = require("../../../customisations/Media");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _AvatarSetting = _interopRequireDefault(require("./AvatarSetting"));

var _ExternalLink = _interopRequireDefault(require("../elements/ExternalLink"));

var _UserIdentifier = _interopRequireDefault(require("../../../customisations/UserIdentifier"));

var _BrowserWorkarounds = require("../../../utils/BrowserWorkarounds");

var _PosthogTrackers = _interopRequireDefault(require("../../../PosthogTrackers"));

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
class ProfileSettings extends _react.default.Component {
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
        enableProfileSave: true
      });
    });
    (0, _defineProperty2.default)(this, "cancelProfileChanges", async e => {
      e.stopPropagation();
      e.preventDefault();
      if (!this.state.enableProfileSave) return;
      this.setState({
        enableProfileSave: false,
        displayName: this.state.originalDisplayName,
        avatarUrl: this.state.originalAvatarUrl,
        avatarFile: null
      });
    });
    (0, _defineProperty2.default)(this, "saveProfile", async e => {
      e.stopPropagation();
      e.preventDefault();
      if (!this.state.enableProfileSave) return;
      this.setState({
        enableProfileSave: false
      });

      const client = _MatrixClientPeg.MatrixClientPeg.get();

      const newState = {};
      const displayName = this.state.displayName.trim();

      try {
        if (this.state.originalDisplayName !== this.state.displayName) {
          await client.setDisplayName(displayName);
          newState.originalDisplayName = displayName;
          newState.displayName = displayName;
        }

        if (this.state.avatarFile) {
          _logger.logger.log(`Uploading new avatar, ${this.state.avatarFile.name} of type ${this.state.avatarFile.type},` + ` (${this.state.avatarFile.size}) bytes`);

          const uri = await client.uploadContent(this.state.avatarFile);
          await client.setAvatarUrl(uri);
          newState.avatarUrl = (0, _Media.mediaFromMxc)(uri).getSquareThumbnailHttp(96);
          newState.originalAvatarUrl = newState.avatarUrl;
          newState.avatarFile = null;
        } else if (this.state.originalAvatarUrl !== this.state.avatarUrl) {
          await client.setAvatarUrl(""); // use empty string as Synapse 500s on undefined
        }
      } catch (err) {
        _logger.logger.log("Failed to save profile", err);

        _Modal.default.createDialog(_ErrorDialog.default, {
          title: (0, _languageHandler._t)("Failed to save your profile"),
          description: err && err.message ? err.message : (0, _languageHandler._t)("The operation could not be completed")
        });
      }

      this.setState(newState);
    });
    (0, _defineProperty2.default)(this, "onDisplayNameChanged", e => {
      this.setState({
        displayName: e.target.value,
        enableProfileSave: true
      });
    });
    (0, _defineProperty2.default)(this, "onAvatarChanged", e => {
      if (!e.target.files || !e.target.files.length) {
        this.setState({
          avatarUrl: this.state.originalAvatarUrl,
          avatarFile: null,
          enableProfileSave: false
        });
        return;
      }

      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = ev => {
        this.setState({
          avatarUrl: ev.target.result,
          avatarFile: file,
          enableProfileSave: true
        });
      };

      reader.readAsDataURL(file);
    });

    const _client = _MatrixClientPeg.MatrixClientPeg.get();

    let avatarUrl = _OwnProfileStore.OwnProfileStore.instance.avatarMxc;
    if (avatarUrl) avatarUrl = (0, _Media.mediaFromMxc)(avatarUrl).getSquareThumbnailHttp(96);
    this.state = {
      userId: _client.getUserId(),
      originalDisplayName: _OwnProfileStore.OwnProfileStore.instance.displayName,
      displayName: _OwnProfileStore.OwnProfileStore.instance.displayName,
      originalAvatarUrl: avatarUrl,
      avatarUrl: avatarUrl,
      avatarFile: null,
      enableProfileSave: false
    };
  }

  render() {
    const hostingSignupLink = (0, _HostingLink.getHostingLink)('user-settings');
    let hostingSignup = null;

    if (hostingSignupLink) {
      hostingSignup = /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("<a>Upgrade</a> to your own domain", {}, {
        a: sub => /*#__PURE__*/_react.default.createElement(_ExternalLink.default, {
          href: hostingSignupLink,
          target: "_blank",
          rel: "noreferrer noopener"
        }, sub)
      }));
    }

    const userIdentifier = _UserIdentifier.default.getDisplayUserIdentifier(this.state.userId, {
      withDisplayName: true
    });

    return /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.saveProfile,
      autoComplete: "off",
      noValidate: true,
      className: "mx_ProfileSettings"
    }, /*#__PURE__*/_react.default.createElement("input", {
      type: "file",
      ref: this.avatarUpload,
      className: "mx_ProfileSettings_avatarUpload",
      onClick: ev => {
        (0, _BrowserWorkarounds.chromeFileInputFix)(ev);

        _PosthogTrackers.default.trackInteraction("WebProfileSettingsAvatarUploadButton", ev);
      },
      onChange: this.onAvatarChanged,
      accept: "image/*"
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ProfileSettings_profile"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ProfileSettings_profile_controls"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, _languageHandler._t)("Profile")), /*#__PURE__*/_react.default.createElement(_Field.default, {
      label: (0, _languageHandler._t)("Display Name"),
      type: "text",
      value: this.state.displayName,
      autoComplete: "off",
      onChange: this.onDisplayNameChanged
    }), /*#__PURE__*/_react.default.createElement("p", null, userIdentifier && /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_ProfileSettings_profile_controls_userId"
    }, userIdentifier), hostingSignup)), /*#__PURE__*/_react.default.createElement(_AvatarSetting.default, {
      avatarUrl: this.state.avatarUrl?.toString(),
      avatarName: this.state.displayName || this.state.userId,
      avatarAltText: (0, _languageHandler._t)("Profile picture"),
      uploadAvatar: this.uploadAvatar,
      removeAvatar: this.removeAvatar
    })), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ProfileSettings_buttons"
    }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this.cancelProfileChanges,
      kind: "link",
      disabled: !this.state.enableProfileSave
    }, (0, _languageHandler._t)("Cancel")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this.saveProfile,
      kind: "primary",
      disabled: !this.state.enableProfileSave
    }, (0, _languageHandler._t)("Save"))));
  }

}

exports.default = ProfileSettings;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9maWxlU2V0dGluZ3MiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjcmVhdGVSZWYiLCJhdmF0YXJVcGxvYWQiLCJjdXJyZW50IiwiY2xpY2siLCJ2YWx1ZSIsInNldFN0YXRlIiwiYXZhdGFyVXJsIiwiYXZhdGFyRmlsZSIsImVuYWJsZVByb2ZpbGVTYXZlIiwiZSIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0Iiwic3RhdGUiLCJkaXNwbGF5TmFtZSIsIm9yaWdpbmFsRGlzcGxheU5hbWUiLCJvcmlnaW5hbEF2YXRhclVybCIsImNsaWVudCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsIm5ld1N0YXRlIiwidHJpbSIsInNldERpc3BsYXlOYW1lIiwibG9nZ2VyIiwibG9nIiwibmFtZSIsInR5cGUiLCJzaXplIiwidXJpIiwidXBsb2FkQ29udGVudCIsInNldEF2YXRhclVybCIsIm1lZGlhRnJvbU14YyIsImdldFNxdWFyZVRodW1ibmFpbEh0dHAiLCJlcnIiLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIkVycm9yRGlhbG9nIiwidGl0bGUiLCJfdCIsImRlc2NyaXB0aW9uIiwibWVzc2FnZSIsInRhcmdldCIsImZpbGVzIiwibGVuZ3RoIiwiZmlsZSIsInJlYWRlciIsIkZpbGVSZWFkZXIiLCJvbmxvYWQiLCJldiIsInJlc3VsdCIsInJlYWRBc0RhdGFVUkwiLCJPd25Qcm9maWxlU3RvcmUiLCJpbnN0YW5jZSIsImF2YXRhck14YyIsInVzZXJJZCIsImdldFVzZXJJZCIsInJlbmRlciIsImhvc3RpbmdTaWdudXBMaW5rIiwiZ2V0SG9zdGluZ0xpbmsiLCJob3N0aW5nU2lnbnVwIiwiYSIsInN1YiIsInVzZXJJZGVudGlmaWVyIiwiVXNlcklkZW50aWZpZXJDdXN0b21pc2F0aW9ucyIsImdldERpc3BsYXlVc2VySWRlbnRpZmllciIsIndpdGhEaXNwbGF5TmFtZSIsInNhdmVQcm9maWxlIiwiY2hyb21lRmlsZUlucHV0Rml4IiwiUG9zdGhvZ1RyYWNrZXJzIiwidHJhY2tJbnRlcmFjdGlvbiIsIm9uQXZhdGFyQ2hhbmdlZCIsIm9uRGlzcGxheU5hbWVDaGFuZ2VkIiwidG9TdHJpbmciLCJ1cGxvYWRBdmF0YXIiLCJyZW1vdmVBdmF0YXIiLCJjYW5jZWxQcm9maWxlQ2hhbmdlcyJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL1Byb2ZpbGVTZXR0aW5ncy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IC0gMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBjcmVhdGVSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5cbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSBcIi4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IEZpZWxkIGZyb20gXCIuLi9lbGVtZW50cy9GaWVsZFwiO1xuaW1wb3J0IHsgZ2V0SG9zdGluZ0xpbmsgfSBmcm9tICcuLi8uLi8uLi91dGlscy9Ib3N0aW5nTGluayc7XG5pbXBvcnQgeyBPd25Qcm9maWxlU3RvcmUgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL093blByb2ZpbGVTdG9yZVwiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IEVycm9yRGlhbG9nIGZyb20gXCIuLi9kaWFsb2dzL0Vycm9yRGlhbG9nXCI7XG5pbXBvcnQgeyBtZWRpYUZyb21NeGMgfSBmcm9tIFwiLi4vLi4vLi4vY3VzdG9taXNhdGlvbnMvTWVkaWFcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gJy4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b24nO1xuaW1wb3J0IEF2YXRhclNldHRpbmcgZnJvbSAnLi9BdmF0YXJTZXR0aW5nJztcbmltcG9ydCBFeHRlcm5hbExpbmsgZnJvbSAnLi4vZWxlbWVudHMvRXh0ZXJuYWxMaW5rJztcbmltcG9ydCBVc2VySWRlbnRpZmllckN1c3RvbWlzYXRpb25zIGZyb20gJy4uLy4uLy4uL2N1c3RvbWlzYXRpb25zL1VzZXJJZGVudGlmaWVyJztcbmltcG9ydCB7IGNocm9tZUZpbGVJbnB1dEZpeCB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9Ccm93c2VyV29ya2Fyb3VuZHNcIjtcbmltcG9ydCBQb3N0aG9nVHJhY2tlcnMgZnJvbSAnLi4vLi4vLi4vUG9zdGhvZ1RyYWNrZXJzJztcblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgdXNlcklkPzogc3RyaW5nO1xuICAgIG9yaWdpbmFsRGlzcGxheU5hbWU/OiBzdHJpbmc7XG4gICAgZGlzcGxheU5hbWU/OiBzdHJpbmc7XG4gICAgb3JpZ2luYWxBdmF0YXJVcmw/OiBzdHJpbmc7XG4gICAgYXZhdGFyVXJsPzogc3RyaW5nIHwgQXJyYXlCdWZmZXI7XG4gICAgYXZhdGFyRmlsZT86IEZpbGU7XG4gICAgZW5hYmxlUHJvZmlsZVNhdmU/OiBib29sZWFuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcm9maWxlU2V0dGluZ3MgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8e30sIElTdGF0ZT4ge1xuICAgIHByaXZhdGUgYXZhdGFyVXBsb2FkOiBSZWFjdC5SZWZPYmplY3Q8SFRNTElucHV0RWxlbWVudD4gPSBjcmVhdGVSZWYoKTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiB7fSkge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBsZXQgYXZhdGFyVXJsID0gT3duUHJvZmlsZVN0b3JlLmluc3RhbmNlLmF2YXRhck14YztcbiAgICAgICAgaWYgKGF2YXRhclVybCkgYXZhdGFyVXJsID0gbWVkaWFGcm9tTXhjKGF2YXRhclVybCkuZ2V0U3F1YXJlVGh1bWJuYWlsSHR0cCg5Nik7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICB1c2VySWQ6IGNsaWVudC5nZXRVc2VySWQoKSxcbiAgICAgICAgICAgIG9yaWdpbmFsRGlzcGxheU5hbWU6IE93blByb2ZpbGVTdG9yZS5pbnN0YW5jZS5kaXNwbGF5TmFtZSxcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBPd25Qcm9maWxlU3RvcmUuaW5zdGFuY2UuZGlzcGxheU5hbWUsXG4gICAgICAgICAgICBvcmlnaW5hbEF2YXRhclVybDogYXZhdGFyVXJsLFxuICAgICAgICAgICAgYXZhdGFyVXJsOiBhdmF0YXJVcmwsXG4gICAgICAgICAgICBhdmF0YXJGaWxlOiBudWxsLFxuICAgICAgICAgICAgZW5hYmxlUHJvZmlsZVNhdmU6IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgdXBsb2FkQXZhdGFyID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLmF2YXRhclVwbG9hZC5jdXJyZW50LmNsaWNrKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgcmVtb3ZlQXZhdGFyID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICAvLyBjbGVhciBmaWxlIHVwbG9hZCBmaWVsZCBzbyBzYW1lIGZpbGUgY2FuIGJlIHNlbGVjdGVkXG4gICAgICAgIHRoaXMuYXZhdGFyVXBsb2FkLmN1cnJlbnQudmFsdWUgPSBcIlwiO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGF2YXRhclVybDogbnVsbCxcbiAgICAgICAgICAgIGF2YXRhckZpbGU6IG51bGwsXG4gICAgICAgICAgICBlbmFibGVQcm9maWxlU2F2ZTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgY2FuY2VsUHJvZmlsZUNoYW5nZXMgPSBhc3luYyAoZTogUmVhY3QuTW91c2VFdmVudCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmVuYWJsZVByb2ZpbGVTYXZlKSByZXR1cm47XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZW5hYmxlUHJvZmlsZVNhdmU6IGZhbHNlLFxuICAgICAgICAgICAgZGlzcGxheU5hbWU6IHRoaXMuc3RhdGUub3JpZ2luYWxEaXNwbGF5TmFtZSxcbiAgICAgICAgICAgIGF2YXRhclVybDogdGhpcy5zdGF0ZS5vcmlnaW5hbEF2YXRhclVybCxcbiAgICAgICAgICAgIGF2YXRhckZpbGU6IG51bGwsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHNhdmVQcm9maWxlID0gYXN5bmMgKGU6IFJlYWN0LkZvcm1FdmVudDxIVE1MRm9ybUVsZW1lbnQ+KTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZW5hYmxlUHJvZmlsZVNhdmUpIHJldHVybjtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVuYWJsZVByb2ZpbGVTYXZlOiBmYWxzZSB9KTtcblxuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IG5ld1N0YXRlOiBJU3RhdGUgPSB7fTtcblxuICAgICAgICBjb25zdCBkaXNwbGF5TmFtZSA9IHRoaXMuc3RhdGUuZGlzcGxheU5hbWUudHJpbSgpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUub3JpZ2luYWxEaXNwbGF5TmFtZSAhPT0gdGhpcy5zdGF0ZS5kaXNwbGF5TmFtZSkge1xuICAgICAgICAgICAgICAgIGF3YWl0IGNsaWVudC5zZXREaXNwbGF5TmFtZShkaXNwbGF5TmFtZSk7XG4gICAgICAgICAgICAgICAgbmV3U3RhdGUub3JpZ2luYWxEaXNwbGF5TmFtZSA9IGRpc3BsYXlOYW1lO1xuICAgICAgICAgICAgICAgIG5ld1N0YXRlLmRpc3BsYXlOYW1lID0gZGlzcGxheU5hbWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmF2YXRhckZpbGUpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIubG9nKFxuICAgICAgICAgICAgICAgICAgICBgVXBsb2FkaW5nIG5ldyBhdmF0YXIsICR7dGhpcy5zdGF0ZS5hdmF0YXJGaWxlLm5hbWV9IG9mIHR5cGUgJHt0aGlzLnN0YXRlLmF2YXRhckZpbGUudHlwZX0sYCArXG4gICAgICAgICAgICAgICAgICAgIGAgKCR7dGhpcy5zdGF0ZS5hdmF0YXJGaWxlLnNpemV9KSBieXRlc2ApO1xuICAgICAgICAgICAgICAgIGNvbnN0IHVyaSA9IGF3YWl0IGNsaWVudC51cGxvYWRDb250ZW50KHRoaXMuc3RhdGUuYXZhdGFyRmlsZSk7XG4gICAgICAgICAgICAgICAgYXdhaXQgY2xpZW50LnNldEF2YXRhclVybCh1cmkpO1xuICAgICAgICAgICAgICAgIG5ld1N0YXRlLmF2YXRhclVybCA9IG1lZGlhRnJvbU14Yyh1cmkpLmdldFNxdWFyZVRodW1ibmFpbEh0dHAoOTYpO1xuICAgICAgICAgICAgICAgIG5ld1N0YXRlLm9yaWdpbmFsQXZhdGFyVXJsID0gbmV3U3RhdGUuYXZhdGFyVXJsO1xuICAgICAgICAgICAgICAgIG5ld1N0YXRlLmF2YXRhckZpbGUgPSBudWxsO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLm9yaWdpbmFsQXZhdGFyVXJsICE9PSB0aGlzLnN0YXRlLmF2YXRhclVybCkge1xuICAgICAgICAgICAgICAgIGF3YWl0IGNsaWVudC5zZXRBdmF0YXJVcmwoXCJcIik7IC8vIHVzZSBlbXB0eSBzdHJpbmcgYXMgU3luYXBzZSA1MDBzIG9uIHVuZGVmaW5lZFxuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGxvZ2dlci5sb2coXCJGYWlsZWQgdG8gc2F2ZSBwcm9maWxlXCIsIGVycik7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJGYWlsZWQgdG8gc2F2ZSB5b3VyIHByb2ZpbGVcIiksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICgoZXJyICYmIGVyci5tZXNzYWdlKSA/IGVyci5tZXNzYWdlIDogX3QoXCJUaGUgb3BlcmF0aW9uIGNvdWxkIG5vdCBiZSBjb21wbGV0ZWRcIikpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFN0YXRlKG5ld1N0YXRlKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkRpc3BsYXlOYW1lQ2hhbmdlZCA9IChlOiBSZWFjdC5DaGFuZ2VFdmVudDxIVE1MSW5wdXRFbGVtZW50Pik6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lOiBlLnRhcmdldC52YWx1ZSxcbiAgICAgICAgICAgIGVuYWJsZVByb2ZpbGVTYXZlOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkF2YXRhckNoYW5nZWQgPSAoZTogUmVhY3QuQ2hhbmdlRXZlbnQ8SFRNTElucHV0RWxlbWVudD4pOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKCFlLnRhcmdldC5maWxlcyB8fCAhZS50YXJnZXQuZmlsZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBhdmF0YXJVcmw6IHRoaXMuc3RhdGUub3JpZ2luYWxBdmF0YXJVcmwsXG4gICAgICAgICAgICAgICAgYXZhdGFyRmlsZTogbnVsbCxcbiAgICAgICAgICAgICAgICBlbmFibGVQcm9maWxlU2F2ZTogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZpbGUgPSBlLnRhcmdldC5maWxlc1swXTtcbiAgICAgICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgICAgcmVhZGVyLm9ubG9hZCA9IChldikgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgYXZhdGFyVXJsOiBldi50YXJnZXQucmVzdWx0LFxuICAgICAgICAgICAgICAgIGF2YXRhckZpbGU6IGZpbGUsXG4gICAgICAgICAgICAgICAgZW5hYmxlUHJvZmlsZVNhdmU6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZSk7XG4gICAgfTtcblxuICAgIHB1YmxpYyByZW5kZXIoKTogSlNYLkVsZW1lbnQge1xuICAgICAgICBjb25zdCBob3N0aW5nU2lnbnVwTGluayA9IGdldEhvc3RpbmdMaW5rKCd1c2VyLXNldHRpbmdzJyk7XG4gICAgICAgIGxldCBob3N0aW5nU2lnbnVwID0gbnVsbDtcbiAgICAgICAgaWYgKGhvc3RpbmdTaWdudXBMaW5rKSB7XG4gICAgICAgICAgICBob3N0aW5nU2lnbnVwID0gPHNwYW4+XG4gICAgICAgICAgICAgICAgeyBfdChcbiAgICAgICAgICAgICAgICAgICAgXCI8YT5VcGdyYWRlPC9hPiB0byB5b3VyIG93biBkb21haW5cIiwge30sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGE6IHN1YiA9PiA8RXh0ZXJuYWxMaW5rIGhyZWY9e2hvc3RpbmdTaWdudXBMaW5rfSB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdWIgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9FeHRlcm5hbExpbms+LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICkgfVxuICAgICAgICAgICAgPC9zcGFuPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHVzZXJJZGVudGlmaWVyID0gVXNlcklkZW50aWZpZXJDdXN0b21pc2F0aW9ucy5nZXREaXNwbGF5VXNlcklkZW50aWZpZXIoXG4gICAgICAgICAgICB0aGlzLnN0YXRlLnVzZXJJZCwgeyB3aXRoRGlzcGxheU5hbWU6IHRydWUgfSxcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGZvcm1cbiAgICAgICAgICAgICAgICBvblN1Ym1pdD17dGhpcy5zYXZlUHJvZmlsZX1cbiAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICAgIG5vVmFsaWRhdGU9e3RydWV9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUHJvZmlsZVNldHRpbmdzXCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cImZpbGVcIlxuICAgICAgICAgICAgICAgICAgICByZWY9e3RoaXMuYXZhdGFyVXBsb2FkfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Qcm9maWxlU2V0dGluZ3NfYXZhdGFyVXBsb2FkXCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KGV2KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaHJvbWVGaWxlSW5wdXRGaXgoZXYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgUG9zdGhvZ1RyYWNrZXJzLnRyYWNrSW50ZXJhY3Rpb24oXCJXZWJQcm9maWxlU2V0dGluZ3NBdmF0YXJVcGxvYWRCdXR0b25cIiwgZXYpO1xuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkF2YXRhckNoYW5nZWR9XG4gICAgICAgICAgICAgICAgICAgIGFjY2VwdD1cImltYWdlLypcIlxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Qcm9maWxlU2V0dGluZ3NfcHJvZmlsZVwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Byb2ZpbGVTZXR0aW5nc19wcm9maWxlX2NvbnRyb2xzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nXCI+eyBfdChcIlByb2ZpbGVcIikgfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkRpc3BsYXkgTmFtZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUuZGlzcGxheU5hbWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwib2ZmXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkRpc3BsYXlOYW1lQ2hhbmdlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHVzZXJJZGVudGlmaWVyICYmIDxzcGFuIGNsYXNzTmFtZT1cIm14X1Byb2ZpbGVTZXR0aW5nc19wcm9maWxlX2NvbnRyb2xzX3VzZXJJZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHVzZXJJZGVudGlmaWVyIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+IH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGhvc3RpbmdTaWdudXAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPEF2YXRhclNldHRpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2YXRhclVybD17dGhpcy5zdGF0ZS5hdmF0YXJVcmw/LnRvU3RyaW5nKCl9XG4gICAgICAgICAgICAgICAgICAgICAgICBhdmF0YXJOYW1lPXt0aGlzLnN0YXRlLmRpc3BsYXlOYW1lIHx8IHRoaXMuc3RhdGUudXNlcklkfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXZhdGFyQWx0VGV4dD17X3QoXCJQcm9maWxlIHBpY3R1cmVcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICB1cGxvYWRBdmF0YXI9e3RoaXMudXBsb2FkQXZhdGFyfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlQXZhdGFyPXt0aGlzLnJlbW92ZUF2YXRhcn0gLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Byb2ZpbGVTZXR0aW5nc19idXR0b25zXCI+XG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLmNhbmNlbFByb2ZpbGVDaGFuZ2VzfVxuICAgICAgICAgICAgICAgICAgICAgICAga2luZD1cImxpbmtcIlxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyF0aGlzLnN0YXRlLmVuYWJsZVByb2ZpbGVTYXZlfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiQ2FuY2VsXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5zYXZlUHJvZmlsZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXshdGhpcy5zdGF0ZS5lbmFibGVQcm9maWxlU2F2ZX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIlNhdmVcIikgfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Zvcm0+XG4gICAg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