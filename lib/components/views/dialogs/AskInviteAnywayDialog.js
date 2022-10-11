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

var _SettingLevel = require("../../../settings/SettingLevel");

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

/*
Copyright 2019 New Vector Ltd

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
class AskInviteAnywayDialog extends _react.default.Component {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "onInviteClicked", () => {
      this.props.onInviteAnyways();
      this.props.onFinished(true);
    });
    (0, _defineProperty2.default)(this, "onInviteNeverWarnClicked", () => {
      _SettingsStore.default.setValue("promptBeforeInviteUnknownUsers", null, _SettingLevel.SettingLevel.ACCOUNT, false);

      this.props.onInviteAnyways();
      this.props.onFinished(true);
    });
    (0, _defineProperty2.default)(this, "onGiveUpClicked", () => {
      this.props.onGiveUp();
      this.props.onFinished(false);
    });
  }

  render() {
    const errorList = this.props.unknownProfileUsers.map(address => /*#__PURE__*/_react.default.createElement("li", {
      key: address.userId
    }, address.userId, ": ", address.errorText));
    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_RetryInvitesDialog",
      onFinished: this.onGiveUpClicked,
      title: (0, _languageHandler._t)('The following users may not exist'),
      contentId: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("div", {
      id: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Unable to find profiles for the Matrix IDs listed below - " + "would you like to invite them anyway?")), /*#__PURE__*/_react.default.createElement("ul", null, errorList)), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_buttons"
    }, /*#__PURE__*/_react.default.createElement("button", {
      onClick: this.onGiveUpClicked
    }, (0, _languageHandler._t)('Close')), /*#__PURE__*/_react.default.createElement("button", {
      onClick: this.onInviteNeverWarnClicked
    }, (0, _languageHandler._t)('Invite anyway and never warn me again')), /*#__PURE__*/_react.default.createElement("button", {
      onClick: this.onInviteClicked,
      autoFocus: true
    }, (0, _languageHandler._t)('Invite anyway'))));
  }

}

exports.default = AskInviteAnywayDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBc2tJbnZpdGVBbnl3YXlEaWFsb2ciLCJSZWFjdCIsIkNvbXBvbmVudCIsInByb3BzIiwib25JbnZpdGVBbnl3YXlzIiwib25GaW5pc2hlZCIsIlNldHRpbmdzU3RvcmUiLCJzZXRWYWx1ZSIsIlNldHRpbmdMZXZlbCIsIkFDQ09VTlQiLCJvbkdpdmVVcCIsInJlbmRlciIsImVycm9yTGlzdCIsInVua25vd25Qcm9maWxlVXNlcnMiLCJtYXAiLCJhZGRyZXNzIiwidXNlcklkIiwiZXJyb3JUZXh0Iiwib25HaXZlVXBDbGlja2VkIiwiX3QiLCJvbkludml0ZU5ldmVyV2FybkNsaWNrZWQiLCJvbkludml0ZUNsaWNrZWQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL0Fza0ludml0ZUFueXdheURpYWxvZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7IFNldHRpbmdMZXZlbCB9IGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nTGV2ZWxcIjtcbmltcG9ydCBCYXNlRGlhbG9nIGZyb20gXCIuL0Jhc2VEaWFsb2dcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgdW5rbm93blByb2ZpbGVVc2VyczogQXJyYXk8e1xuICAgICAgICB1c2VySWQ6IHN0cmluZztcbiAgICAgICAgZXJyb3JUZXh0OiBzdHJpbmc7XG4gICAgfT47XG4gICAgb25JbnZpdGVBbnl3YXlzOiAoKSA9PiB2b2lkO1xuICAgIG9uR2l2ZVVwOiAoKSA9PiB2b2lkO1xuICAgIG9uRmluaXNoZWQ6IChzdWNjZXNzOiBib29sZWFuKSA9PiB2b2lkO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBc2tJbnZpdGVBbnl3YXlEaWFsb2cgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzPiB7XG4gICAgcHJpdmF0ZSBvbkludml0ZUNsaWNrZWQgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25JbnZpdGVBbnl3YXlzKCk7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh0cnVlKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkludml0ZU5ldmVyV2FybkNsaWNrZWQgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIFNldHRpbmdzU3RvcmUuc2V0VmFsdWUoXCJwcm9tcHRCZWZvcmVJbnZpdGVVbmtub3duVXNlcnNcIiwgbnVsbCwgU2V0dGluZ0xldmVsLkFDQ09VTlQsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkludml0ZUFueXdheXMoKTtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKHRydWUpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uR2l2ZVVwQ2xpY2tlZCA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkdpdmVVcCgpO1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoZmFsc2UpO1xuICAgIH07XG5cbiAgICBwdWJsaWMgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBlcnJvckxpc3QgPSB0aGlzLnByb3BzLnVua25vd25Qcm9maWxlVXNlcnNcbiAgICAgICAgICAgIC5tYXAoYWRkcmVzcyA9PiA8bGkga2V5PXthZGRyZXNzLnVzZXJJZH0+eyBhZGRyZXNzLnVzZXJJZCB9OiB7IGFkZHJlc3MuZXJyb3JUZXh0IH08L2xpPik7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxCYXNlRGlhbG9nIGNsYXNzTmFtZT0nbXhfUmV0cnlJbnZpdGVzRGlhbG9nJ1xuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMub25HaXZlVXBDbGlja2VkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdCgnVGhlIGZvbGxvd2luZyB1c2VycyBtYXkgbm90IGV4aXN0Jyl9XG4gICAgICAgICAgICAgICAgY29udGVudElkPSdteF9EaWFsb2dfY29udGVudCdcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2IGlkPSdteF9EaWFsb2dfY29udGVudCc+XG4gICAgICAgICAgICAgICAgICAgIDxwPnsgX3QoXCJVbmFibGUgdG8gZmluZCBwcm9maWxlcyBmb3IgdGhlIE1hdHJpeCBJRHMgbGlzdGVkIGJlbG93IC0gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJ3b3VsZCB5b3UgbGlrZSB0byBpbnZpdGUgdGhlbSBhbnl3YXk/XCIpIH08L3A+XG4gICAgICAgICAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgZXJyb3JMaXN0IH1cbiAgICAgICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2J1dHRvbnNcIj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLm9uR2l2ZVVwQ2xpY2tlZH0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KCdDbG9zZScpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5vbkludml0ZU5ldmVyV2FybkNsaWNrZWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdCgnSW52aXRlIGFueXdheSBhbmQgbmV2ZXIgd2FybiBtZSBhZ2FpbicpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5vbkludml0ZUNsaWNrZWR9IGF1dG9Gb2N1cz17dHJ1ZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KCdJbnZpdGUgYW55d2F5JykgfVxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQXJCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFtQmUsTUFBTUEscUJBQU4sU0FBb0NDLGNBQUEsQ0FBTUMsU0FBMUMsQ0FBNEQ7RUFBQTtJQUFBO0lBQUEsdURBQzdDLE1BQVk7TUFDbEMsS0FBS0MsS0FBTCxDQUFXQyxlQUFYO01BQ0EsS0FBS0QsS0FBTCxDQUFXRSxVQUFYLENBQXNCLElBQXRCO0lBQ0gsQ0FKc0U7SUFBQSxnRUFNcEMsTUFBWTtNQUMzQ0Msc0JBQUEsQ0FBY0MsUUFBZCxDQUF1QixnQ0FBdkIsRUFBeUQsSUFBekQsRUFBK0RDLDBCQUFBLENBQWFDLE9BQTVFLEVBQXFGLEtBQXJGOztNQUNBLEtBQUtOLEtBQUwsQ0FBV0MsZUFBWDtNQUNBLEtBQUtELEtBQUwsQ0FBV0UsVUFBWCxDQUFzQixJQUF0QjtJQUNILENBVnNFO0lBQUEsdURBWTdDLE1BQVk7TUFDbEMsS0FBS0YsS0FBTCxDQUFXTyxRQUFYO01BQ0EsS0FBS1AsS0FBTCxDQUFXRSxVQUFYLENBQXNCLEtBQXRCO0lBQ0gsQ0Fmc0U7RUFBQTs7RUFpQmhFTSxNQUFNLEdBQUc7SUFDWixNQUFNQyxTQUFTLEdBQUcsS0FBS1QsS0FBTCxDQUFXVSxtQkFBWCxDQUNiQyxHQURhLENBQ1RDLE9BQU8saUJBQUk7TUFBSSxHQUFHLEVBQUVBLE9BQU8sQ0FBQ0M7SUFBakIsR0FBMkJELE9BQU8sQ0FBQ0MsTUFBbkMsUUFBK0NELE9BQU8sQ0FBQ0UsU0FBdkQsQ0FERixDQUFsQjtJQUdBLG9CQUNJLDZCQUFDLG1CQUFEO01BQVksU0FBUyxFQUFDLHVCQUF0QjtNQUNJLFVBQVUsRUFBRSxLQUFLQyxlQURyQjtNQUVJLEtBQUssRUFBRSxJQUFBQyxtQkFBQSxFQUFHLG1DQUFILENBRlg7TUFHSSxTQUFTLEVBQUM7SUFIZCxnQkFLSTtNQUFLLEVBQUUsRUFBQztJQUFSLGdCQUNJLHdDQUFLLElBQUFBLG1CQUFBLEVBQUcsK0RBQ0osdUNBREMsQ0FBTCxDQURKLGVBR0kseUNBQ01QLFNBRE4sQ0FISixDQUxKLGVBYUk7TUFBSyxTQUFTLEVBQUM7SUFBZixnQkFDSTtNQUFRLE9BQU8sRUFBRSxLQUFLTTtJQUF0QixHQUNNLElBQUFDLG1CQUFBLEVBQUcsT0FBSCxDQUROLENBREosZUFJSTtNQUFRLE9BQU8sRUFBRSxLQUFLQztJQUF0QixHQUNNLElBQUFELG1CQUFBLEVBQUcsdUNBQUgsQ0FETixDQUpKLGVBT0k7TUFBUSxPQUFPLEVBQUUsS0FBS0UsZUFBdEI7TUFBdUMsU0FBUyxFQUFFO0lBQWxELEdBQ00sSUFBQUYsbUJBQUEsRUFBRyxlQUFILENBRE4sQ0FQSixDQWJKLENBREo7RUEyQkg7O0FBaERzRSJ9