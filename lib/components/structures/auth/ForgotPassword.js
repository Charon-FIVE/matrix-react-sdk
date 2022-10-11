"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _logger = require("matrix-js-sdk/src/logger");

var _matrix = require("matrix-js-sdk/src/matrix");

var _languageHandler = require("../../../languageHandler");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _PasswordReset = _interopRequireDefault(require("../../../PasswordReset"));

var _AutoDiscoveryUtils = _interopRequireDefault(require("../../../utils/AutoDiscoveryUtils"));

var _AuthPage = _interopRequireDefault(require("../../views/auth/AuthPage"));

var _ServerPicker = _interopRequireDefault(require("../../views/elements/ServerPicker"));

var _EmailField = _interopRequireDefault(require("../../views/auth/EmailField"));

var _PassphraseField = _interopRequireDefault(require("../../views/auth/PassphraseField"));

var _RegistrationForm = require("../../views/auth/RegistrationForm");

var _InlineSpinner = _interopRequireDefault(require("../../views/elements/InlineSpinner"));

var _Spinner = _interopRequireDefault(require("../../views/elements/Spinner"));

var _QuestionDialog = _interopRequireDefault(require("../../views/dialogs/QuestionDialog"));

var _ErrorDialog = _interopRequireDefault(require("../../views/dialogs/ErrorDialog"));

var _AuthHeader = _interopRequireDefault(require("../../views/auth/AuthHeader"));

var _AuthBody = _interopRequireDefault(require("../../views/auth/AuthBody"));

var _PassphraseConfirmField = _interopRequireDefault(require("../../views/auth/PassphraseConfirmField"));

var _AccessibleButton = _interopRequireDefault(require("../../views/elements/AccessibleButton"));

var _StyledCheckbox = _interopRequireDefault(require("../../views/elements/StyledCheckbox"));

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2017, 2018, 2019 New Vector Ltd
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
var Phase;

(function (Phase) {
  Phase[Phase["Forgot"] = 1] = "Forgot";
  Phase[Phase["SendingEmail"] = 2] = "SendingEmail";
  Phase[Phase["EmailSent"] = 3] = "EmailSent";
  Phase[Phase["Done"] = 4] = "Done";
})(Phase || (Phase = {}));

var ForgotPasswordField;

(function (ForgotPasswordField) {
  ForgotPasswordField["Email"] = "field_email";
  ForgotPasswordField["Password"] = "field_password";
  ForgotPasswordField["PasswordConfirm"] = "field_password_confirm";
})(ForgotPasswordField || (ForgotPasswordField = {}));

class ForgotPassword extends _react.default.Component {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "reset", void 0);
    (0, _defineProperty2.default)(this, "state", {
      phase: Phase.Forgot,
      email: "",
      password: "",
      password2: "",
      errorText: null,
      // We perform liveliness checks later, but for now suppress the errors.
      // We also track the server dead errors independently of the regular errors so
      // that we can render it differently, and override any other error the user may
      // be seeing.
      serverIsAlive: true,
      serverErrorIsFatal: false,
      serverDeadError: "",
      serverSupportsControlOfDevicesLogout: false,
      logoutDevices: false
    });
    (0, _defineProperty2.default)(this, "onVerify", async ev => {
      ev.preventDefault();

      if (!this.reset) {
        _logger.logger.error("onVerify called before submitPasswordReset!");

        return;
      }

      if (this.state.currentHttpRequest) return;

      try {
        await this.handleHttpRequest(this.reset.checkEmailLinkClicked());
        this.setState({
          phase: Phase.Done
        });
      } catch (err) {
        this.showErrorDialog(err.message);
      }
    });
    (0, _defineProperty2.default)(this, "onSubmitForm", async ev => {
      ev.preventDefault();
      if (this.state.currentHttpRequest) return; // refresh the server errors, just in case the server came back online

      await this.handleHttpRequest(this.checkServerLiveliness(this.props.serverConfig));
      const allFieldsValid = await this.verifyFieldsBeforeSubmit();

      if (!allFieldsValid) {
        return;
      }

      if (this.state.logoutDevices) {
        const {
          finished
        } = _Modal.default.createDialog(_QuestionDialog.default, {
          title: (0, _languageHandler._t)('Warning!'),
          description: /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, !this.state.serverSupportsControlOfDevicesLogout ? (0, _languageHandler._t)("Resetting your password on this homeserver will cause all of your devices to be " + "signed out. This will delete the message encryption keys stored on them, " + "making encrypted chat history unreadable.") : (0, _languageHandler._t)("Signing out your devices will delete the message encryption keys stored on them, " + "making encrypted chat history unreadable.")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("If you want to retain access to your chat history in encrypted rooms, set up Key Backup " + "or export your message keys from one of your other devices before proceeding."))),
          button: (0, _languageHandler._t)('Continue')
        });

        const [confirmed] = await finished;
        if (!confirmed) return;
      }

      this.submitPasswordReset(this.state.email, this.state.password, this.state.logoutDevices);
    });
    (0, _defineProperty2.default)(this, "onInputChanged", (stateKey, ev) => {
      let value = ev.currentTarget.value;
      if (stateKey === "email") value = value.trim();
      this.setState({
        [stateKey]: value
      });
    });
    (0, _defineProperty2.default)(this, "onLoginClick", ev => {
      ev.preventDefault();
      ev.stopPropagation();
      this.props.onLoginClick();
    });
  }

  componentDidMount() {
    this.reset = null;
    this.checkServerLiveliness(this.props.serverConfig);
    this.checkServerCapabilities(this.props.serverConfig);
  } // TODO: [REACT-WARNING] Replace with appropriate lifecycle event
  // eslint-disable-next-line


  UNSAFE_componentWillReceiveProps(newProps) {
    if (newProps.serverConfig.hsUrl === this.props.serverConfig.hsUrl && newProps.serverConfig.isUrl === this.props.serverConfig.isUrl) return; // Do a liveliness check on the new URLs

    this.checkServerLiveliness(newProps.serverConfig); // Do capabilities check on new URLs

    this.checkServerCapabilities(newProps.serverConfig);
  }

  async checkServerLiveliness(serverConfig) {
    try {
      await _AutoDiscoveryUtils.default.validateServerConfigWithStaticUrls(serverConfig.hsUrl, serverConfig.isUrl);
      this.setState({
        serverIsAlive: true
      });
    } catch (e) {
      this.setState(_AutoDiscoveryUtils.default.authComponentStateForError(e, "forgot_password"));
    }
  }

  async checkServerCapabilities(serverConfig) {
    const tempClient = (0, _matrix.createClient)({
      baseUrl: serverConfig.hsUrl
    });
    const serverSupportsControlOfDevicesLogout = await tempClient.doesServerSupportLogoutDevices();
    this.setState({
      logoutDevices: !serverSupportsControlOfDevicesLogout,
      serverSupportsControlOfDevicesLogout
    });
  }

  submitPasswordReset(email, password) {
    let logoutDevices = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    this.setState({
      phase: Phase.SendingEmail
    });
    this.reset = new _PasswordReset.default(this.props.serverConfig.hsUrl, this.props.serverConfig.isUrl);
    this.reset.resetPassword(email, password, logoutDevices).then(() => {
      this.setState({
        phase: Phase.EmailSent
      });
    }, err => {
      this.showErrorDialog((0, _languageHandler._t)('Failed to send email') + ": " + err.message);
      this.setState({
        phase: Phase.Forgot
      });
    });
  }

  async verifyFieldsBeforeSubmit() {
    const fieldIdsInDisplayOrder = [ForgotPasswordField.Email, ForgotPasswordField.Password, ForgotPasswordField.PasswordConfirm];
    const invalidFields = [];

    for (const fieldId of fieldIdsInDisplayOrder) {
      const valid = await this[fieldId].validate({
        allowEmpty: false
      });

      if (!valid) {
        invalidFields.push(this[fieldId]);
      }
    }

    if (invalidFields.length === 0) {
      return true;
    } // Focus on the first invalid field, then re-validate,
    // which will result in the error tooltip being displayed for that field.


    invalidFields[0].focus();
    invalidFields[0].validate({
      allowEmpty: false,
      focused: true
    });
    return false;
  }

  showErrorDialog(description, title) {
    _Modal.default.createDialog(_ErrorDialog.default, {
      title,
      description
    });
  }

  handleHttpRequest(request) {
    this.setState({
      currentHttpRequest: request
    });
    return request.finally(() => {
      this.setState({
        currentHttpRequest: undefined
      });
    });
  }

  renderForgot() {
    let errorText = null;
    const err = this.state.errorText;

    if (err) {
      errorText = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Login_error"
      }, err);
    }

    let serverDeadSection;

    if (!this.state.serverIsAlive) {
      const classes = (0, _classnames.default)({
        "mx_Login_error": true,
        "mx_Login_serverError": true,
        "mx_Login_serverErrorNonFatal": !this.state.serverErrorIsFatal
      });
      serverDeadSection = /*#__PURE__*/_react.default.createElement("div", {
        className: classes
      }, this.state.serverDeadError);
    }

    return /*#__PURE__*/_react.default.createElement("div", null, errorText, serverDeadSection, /*#__PURE__*/_react.default.createElement(_ServerPicker.default, {
      serverConfig: this.props.serverConfig,
      onServerConfigChange: this.props.onServerConfigChange
    }), /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.onSubmitForm
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AuthBody_fieldRow"
    }, /*#__PURE__*/_react.default.createElement(_EmailField.default, {
      name: "reset_email" // define a name so browser's password autofill gets less confused
      ,
      labelRequired: (0, _languageHandler._td)('The email address linked to your account must be entered.'),
      labelInvalid: (0, _languageHandler._td)("The email address doesn't appear to be valid."),
      value: this.state.email,
      fieldRef: field => this[ForgotPasswordField.Email] = field,
      autoFocus: true,
      onChange: this.onInputChanged.bind(this, "email")
    })), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AuthBody_fieldRow"
    }, /*#__PURE__*/_react.default.createElement(_PassphraseField.default, {
      name: "reset_password",
      type: "password",
      label: (0, _languageHandler._td)('New Password'),
      value: this.state.password,
      minScore: _RegistrationForm.PASSWORD_MIN_SCORE,
      fieldRef: field => this[ForgotPasswordField.Password] = field,
      onChange: this.onInputChanged.bind(this, "password"),
      autoComplete: "new-password"
    }), /*#__PURE__*/_react.default.createElement(_PassphraseConfirmField.default, {
      name: "reset_password_confirm",
      label: (0, _languageHandler._td)('Confirm'),
      labelRequired: (0, _languageHandler._td)("A new password must be entered."),
      labelInvalid: (0, _languageHandler._td)("New passwords must match each other."),
      value: this.state.password2,
      password: this.state.password,
      fieldRef: field => this[ForgotPasswordField.PasswordConfirm] = field,
      onChange: this.onInputChanged.bind(this, "password2"),
      autoComplete: "new-password"
    })), this.state.serverSupportsControlOfDevicesLogout ? /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AuthBody_fieldRow"
    }, /*#__PURE__*/_react.default.createElement(_StyledCheckbox.default, {
      onChange: () => this.setState({
        logoutDevices: !this.state.logoutDevices
      }),
      checked: this.state.logoutDevices
    }, (0, _languageHandler._t)("Sign out all devices"))) : null, /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)('A verification email will be sent to your inbox to confirm ' + 'setting your new password.')), /*#__PURE__*/_react.default.createElement("input", {
      className: "mx_Login_submit",
      type: "submit",
      value: (0, _languageHandler._t)('Send Reset Email')
    })), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "link",
      className: "mx_AuthBody_changeFlow",
      onClick: this.onLoginClick
    }, (0, _languageHandler._t)('Sign in instead')));
  }

  renderSendingEmail() {
    return /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
  }

  renderEmailSent() {
    return /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("An email has been sent to %(emailAddress)s. Once you've followed the " + "link it contains, click below.", {
      emailAddress: this.state.email
    }), /*#__PURE__*/_react.default.createElement("br", null), /*#__PURE__*/_react.default.createElement("input", {
      className: "mx_Login_submit",
      type: "button",
      onClick: this.onVerify,
      value: (0, _languageHandler._t)('I have verified my email address')
    }), this.state.currentHttpRequest && /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Login_spinner"
    }, /*#__PURE__*/_react.default.createElement(_InlineSpinner.default, {
      w: 64,
      h: 64
    })));
  }

  renderDone() {
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Your password has been reset.")), this.state.logoutDevices ? /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("You have been logged out of all devices and will no longer receive " + "push notifications. To re-enable notifications, sign in again on each " + "device.")) : null, /*#__PURE__*/_react.default.createElement("input", {
      className: "mx_Login_submit",
      type: "button",
      onClick: this.props.onComplete,
      value: (0, _languageHandler._t)('Return to login screen')
    }));
  }

  render() {
    let resetPasswordJsx;

    switch (this.state.phase) {
      case Phase.Forgot:
        resetPasswordJsx = this.renderForgot();
        break;

      case Phase.SendingEmail:
        resetPasswordJsx = this.renderSendingEmail();
        break;

      case Phase.EmailSent:
        resetPasswordJsx = this.renderEmailSent();
        break;

      case Phase.Done:
        resetPasswordJsx = this.renderDone();
        break;

      default:
        resetPasswordJsx = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_Login_spinner"
        }, /*#__PURE__*/_react.default.createElement(_InlineSpinner.default, {
          w: 64,
          h: 64
        }));
    }

    return /*#__PURE__*/_react.default.createElement(_AuthPage.default, null, /*#__PURE__*/_react.default.createElement(_AuthHeader.default, null), /*#__PURE__*/_react.default.createElement(_AuthBody.default, null, /*#__PURE__*/_react.default.createElement("h1", null, " ", (0, _languageHandler._t)('Set a new password'), " "), resetPasswordJsx));
  }

}

exports.default = ForgotPassword;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGFzZSIsIkZvcmdvdFBhc3N3b3JkRmllbGQiLCJGb3Jnb3RQYXNzd29yZCIsIlJlYWN0IiwiQ29tcG9uZW50IiwicGhhc2UiLCJGb3Jnb3QiLCJlbWFpbCIsInBhc3N3b3JkIiwicGFzc3dvcmQyIiwiZXJyb3JUZXh0Iiwic2VydmVySXNBbGl2ZSIsInNlcnZlckVycm9ySXNGYXRhbCIsInNlcnZlckRlYWRFcnJvciIsInNlcnZlclN1cHBvcnRzQ29udHJvbE9mRGV2aWNlc0xvZ291dCIsImxvZ291dERldmljZXMiLCJldiIsInByZXZlbnREZWZhdWx0IiwicmVzZXQiLCJsb2dnZXIiLCJlcnJvciIsInN0YXRlIiwiY3VycmVudEh0dHBSZXF1ZXN0IiwiaGFuZGxlSHR0cFJlcXVlc3QiLCJjaGVja0VtYWlsTGlua0NsaWNrZWQiLCJzZXRTdGF0ZSIsIkRvbmUiLCJlcnIiLCJzaG93RXJyb3JEaWFsb2ciLCJtZXNzYWdlIiwiY2hlY2tTZXJ2ZXJMaXZlbGluZXNzIiwicHJvcHMiLCJzZXJ2ZXJDb25maWciLCJhbGxGaWVsZHNWYWxpZCIsInZlcmlmeUZpZWxkc0JlZm9yZVN1Ym1pdCIsImZpbmlzaGVkIiwiTW9kYWwiLCJjcmVhdGVEaWFsb2ciLCJRdWVzdGlvbkRpYWxvZyIsInRpdGxlIiwiX3QiLCJkZXNjcmlwdGlvbiIsImJ1dHRvbiIsImNvbmZpcm1lZCIsInN1Ym1pdFBhc3N3b3JkUmVzZXQiLCJzdGF0ZUtleSIsInZhbHVlIiwiY3VycmVudFRhcmdldCIsInRyaW0iLCJzdG9wUHJvcGFnYXRpb24iLCJvbkxvZ2luQ2xpY2siLCJjb21wb25lbnREaWRNb3VudCIsImNoZWNrU2VydmVyQ2FwYWJpbGl0aWVzIiwiVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJuZXdQcm9wcyIsImhzVXJsIiwiaXNVcmwiLCJBdXRvRGlzY292ZXJ5VXRpbHMiLCJ2YWxpZGF0ZVNlcnZlckNvbmZpZ1dpdGhTdGF0aWNVcmxzIiwiZSIsImF1dGhDb21wb25lbnRTdGF0ZUZvckVycm9yIiwidGVtcENsaWVudCIsImNyZWF0ZUNsaWVudCIsImJhc2VVcmwiLCJkb2VzU2VydmVyU3VwcG9ydExvZ291dERldmljZXMiLCJTZW5kaW5nRW1haWwiLCJQYXNzd29yZFJlc2V0IiwicmVzZXRQYXNzd29yZCIsInRoZW4iLCJFbWFpbFNlbnQiLCJmaWVsZElkc0luRGlzcGxheU9yZGVyIiwiRW1haWwiLCJQYXNzd29yZCIsIlBhc3N3b3JkQ29uZmlybSIsImludmFsaWRGaWVsZHMiLCJmaWVsZElkIiwidmFsaWQiLCJ2YWxpZGF0ZSIsImFsbG93RW1wdHkiLCJwdXNoIiwibGVuZ3RoIiwiZm9jdXMiLCJmb2N1c2VkIiwiRXJyb3JEaWFsb2ciLCJyZXF1ZXN0IiwiZmluYWxseSIsInVuZGVmaW5lZCIsInJlbmRlckZvcmdvdCIsInNlcnZlckRlYWRTZWN0aW9uIiwiY2xhc3NlcyIsImNsYXNzTmFtZXMiLCJvblNlcnZlckNvbmZpZ0NoYW5nZSIsIm9uU3VibWl0Rm9ybSIsIl90ZCIsImZpZWxkIiwib25JbnB1dENoYW5nZWQiLCJiaW5kIiwiUEFTU1dPUkRfTUlOX1NDT1JFIiwicmVuZGVyU2VuZGluZ0VtYWlsIiwicmVuZGVyRW1haWxTZW50IiwiZW1haWxBZGRyZXNzIiwib25WZXJpZnkiLCJyZW5kZXJEb25lIiwib25Db21wbGV0ZSIsInJlbmRlciIsInJlc2V0UGFzc3dvcmRKc3giXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy9zdHJ1Y3R1cmVzL2F1dGgvRm9yZ290UGFzc3dvcmQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTcsIDIwMTgsIDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuaW1wb3J0IHsgY3JlYXRlQ2xpZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21hdHJpeFwiO1xuXG5pbXBvcnQgeyBfdCwgX3RkIH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBNb2RhbCBmcm9tIFwiLi4vLi4vLi4vTW9kYWxcIjtcbmltcG9ydCBQYXNzd29yZFJlc2V0IGZyb20gXCIuLi8uLi8uLi9QYXNzd29yZFJlc2V0XCI7XG5pbXBvcnQgQXV0b0Rpc2NvdmVyeVV0aWxzIGZyb20gXCIuLi8uLi8uLi91dGlscy9BdXRvRGlzY292ZXJ5VXRpbHNcIjtcbmltcG9ydCBBdXRoUGFnZSBmcm9tIFwiLi4vLi4vdmlld3MvYXV0aC9BdXRoUGFnZVwiO1xuaW1wb3J0IFNlcnZlclBpY2tlciBmcm9tIFwiLi4vLi4vdmlld3MvZWxlbWVudHMvU2VydmVyUGlja2VyXCI7XG5pbXBvcnQgRW1haWxGaWVsZCBmcm9tIFwiLi4vLi4vdmlld3MvYXV0aC9FbWFpbEZpZWxkXCI7XG5pbXBvcnQgUGFzc3BocmFzZUZpZWxkIGZyb20gJy4uLy4uL3ZpZXdzL2F1dGgvUGFzc3BocmFzZUZpZWxkJztcbmltcG9ydCB7IFBBU1NXT1JEX01JTl9TQ09SRSB9IGZyb20gJy4uLy4uL3ZpZXdzL2F1dGgvUmVnaXN0cmF0aW9uRm9ybSc7XG5pbXBvcnQgSW5saW5lU3Bpbm5lciBmcm9tICcuLi8uLi92aWV3cy9lbGVtZW50cy9JbmxpbmVTcGlubmVyJztcbmltcG9ydCBTcGlubmVyIGZyb20gXCIuLi8uLi92aWV3cy9lbGVtZW50cy9TcGlubmVyXCI7XG5pbXBvcnQgUXVlc3Rpb25EaWFsb2cgZnJvbSBcIi4uLy4uL3ZpZXdzL2RpYWxvZ3MvUXVlc3Rpb25EaWFsb2dcIjtcbmltcG9ydCBFcnJvckRpYWxvZyBmcm9tIFwiLi4vLi4vdmlld3MvZGlhbG9ncy9FcnJvckRpYWxvZ1wiO1xuaW1wb3J0IEF1dGhIZWFkZXIgZnJvbSBcIi4uLy4uL3ZpZXdzL2F1dGgvQXV0aEhlYWRlclwiO1xuaW1wb3J0IEF1dGhCb2R5IGZyb20gXCIuLi8uLi92aWV3cy9hdXRoL0F1dGhCb2R5XCI7XG5pbXBvcnQgUGFzc3BocmFzZUNvbmZpcm1GaWVsZCBmcm9tIFwiLi4vLi4vdmlld3MvYXV0aC9QYXNzcGhyYXNlQ29uZmlybUZpZWxkXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tICcuLi8uLi92aWV3cy9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uJztcbmltcG9ydCBTdHlsZWRDaGVja2JveCBmcm9tICcuLi8uLi92aWV3cy9lbGVtZW50cy9TdHlsZWRDaGVja2JveCc7XG5pbXBvcnQgeyBWYWxpZGF0ZWRTZXJ2ZXJDb25maWcgfSBmcm9tICcuLi8uLi8uLi91dGlscy9WYWxpZGF0ZWRTZXJ2ZXJDb25maWcnO1xuXG5lbnVtIFBoYXNlIHtcbiAgICAvLyBTaG93IHRoZSBmb3Jnb3QgcGFzc3dvcmQgaW5wdXRzXG4gICAgRm9yZ290ID0gMSxcbiAgICAvLyBFbWFpbCBpcyBpbiB0aGUgcHJvY2VzcyBvZiBiZWluZyBzZW50XG4gICAgU2VuZGluZ0VtYWlsID0gMixcbiAgICAvLyBFbWFpbCBoYXMgYmVlbiBzZW50XG4gICAgRW1haWxTZW50ID0gMyxcbiAgICAvLyBVc2VyIGhhcyBjbGlja2VkIHRoZSBsaW5rIGluIGVtYWlsIGFuZCBjb21wbGV0ZWQgcmVzZXRcbiAgICBEb25lID0gNCxcbn1cblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgc2VydmVyQ29uZmlnOiBWYWxpZGF0ZWRTZXJ2ZXJDb25maWc7XG4gICAgb25TZXJ2ZXJDb25maWdDaGFuZ2U6IChzZXJ2ZXJDb25maWc6IFZhbGlkYXRlZFNlcnZlckNvbmZpZykgPT4gdm9pZDtcbiAgICBvbkxvZ2luQ2xpY2s/OiAoKSA9PiB2b2lkO1xuICAgIG9uQ29tcGxldGU6ICgpID0+IHZvaWQ7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIHBoYXNlOiBQaGFzZTtcbiAgICBlbWFpbDogc3RyaW5nO1xuICAgIHBhc3N3b3JkOiBzdHJpbmc7XG4gICAgcGFzc3dvcmQyOiBzdHJpbmc7XG4gICAgZXJyb3JUZXh0OiBzdHJpbmc7XG5cbiAgICAvLyBXZSBwZXJmb3JtIGxpdmVsaW5lc3MgY2hlY2tzIGxhdGVyLCBidXQgZm9yIG5vdyBzdXBwcmVzcyB0aGUgZXJyb3JzLlxuICAgIC8vIFdlIGFsc28gdHJhY2sgdGhlIHNlcnZlciBkZWFkIGVycm9ycyBpbmRlcGVuZGVudGx5IG9mIHRoZSByZWd1bGFyIGVycm9ycyBzb1xuICAgIC8vIHRoYXQgd2UgY2FuIHJlbmRlciBpdCBkaWZmZXJlbnRseSwgYW5kIG92ZXJyaWRlIGFueSBvdGhlciBlcnJvciB0aGUgdXNlciBtYXlcbiAgICAvLyBiZSBzZWVpbmcuXG4gICAgc2VydmVySXNBbGl2ZTogYm9vbGVhbjtcbiAgICBzZXJ2ZXJFcnJvcklzRmF0YWw6IGJvb2xlYW47XG4gICAgc2VydmVyRGVhZEVycm9yOiBzdHJpbmc7XG5cbiAgICBjdXJyZW50SHR0cFJlcXVlc3Q/OiBQcm9taXNlPGFueT47XG5cbiAgICBzZXJ2ZXJTdXBwb3J0c0NvbnRyb2xPZkRldmljZXNMb2dvdXQ6IGJvb2xlYW47XG4gICAgbG9nb3V0RGV2aWNlczogYm9vbGVhbjtcbn1cblxuZW51bSBGb3Jnb3RQYXNzd29yZEZpZWxkIHtcbiAgICBFbWFpbCA9ICdmaWVsZF9lbWFpbCcsXG4gICAgUGFzc3dvcmQgPSAnZmllbGRfcGFzc3dvcmQnLFxuICAgIFBhc3N3b3JkQ29uZmlybSA9ICdmaWVsZF9wYXNzd29yZF9jb25maXJtJyxcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRm9yZ290UGFzc3dvcmQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIHJlc2V0OiBQYXNzd29yZFJlc2V0O1xuXG4gICAgc3RhdGU6IElTdGF0ZSA9IHtcbiAgICAgICAgcGhhc2U6IFBoYXNlLkZvcmdvdCxcbiAgICAgICAgZW1haWw6IFwiXCIsXG4gICAgICAgIHBhc3N3b3JkOiBcIlwiLFxuICAgICAgICBwYXNzd29yZDI6IFwiXCIsXG4gICAgICAgIGVycm9yVGV4dDogbnVsbCxcblxuICAgICAgICAvLyBXZSBwZXJmb3JtIGxpdmVsaW5lc3MgY2hlY2tzIGxhdGVyLCBidXQgZm9yIG5vdyBzdXBwcmVzcyB0aGUgZXJyb3JzLlxuICAgICAgICAvLyBXZSBhbHNvIHRyYWNrIHRoZSBzZXJ2ZXIgZGVhZCBlcnJvcnMgaW5kZXBlbmRlbnRseSBvZiB0aGUgcmVndWxhciBlcnJvcnMgc29cbiAgICAgICAgLy8gdGhhdCB3ZSBjYW4gcmVuZGVyIGl0IGRpZmZlcmVudGx5LCBhbmQgb3ZlcnJpZGUgYW55IG90aGVyIGVycm9yIHRoZSB1c2VyIG1heVxuICAgICAgICAvLyBiZSBzZWVpbmcuXG4gICAgICAgIHNlcnZlcklzQWxpdmU6IHRydWUsXG4gICAgICAgIHNlcnZlckVycm9ySXNGYXRhbDogZmFsc2UsXG4gICAgICAgIHNlcnZlckRlYWRFcnJvcjogXCJcIixcbiAgICAgICAgc2VydmVyU3VwcG9ydHNDb250cm9sT2ZEZXZpY2VzTG9nb3V0OiBmYWxzZSxcbiAgICAgICAgbG9nb3V0RGV2aWNlczogZmFsc2UsXG4gICAgfTtcblxuICAgIHB1YmxpYyBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5yZXNldCA9IG51bGw7XG4gICAgICAgIHRoaXMuY2hlY2tTZXJ2ZXJMaXZlbGluZXNzKHRoaXMucHJvcHMuc2VydmVyQ29uZmlnKTtcbiAgICAgICAgdGhpcy5jaGVja1NlcnZlckNhcGFiaWxpdGllcyh0aGlzLnByb3BzLnNlcnZlckNvbmZpZyk7XG4gICAgfVxuXG4gICAgLy8gVE9ETzogW1JFQUNULVdBUk5JTkddIFJlcGxhY2Ugd2l0aCBhcHByb3ByaWF0ZSBsaWZlY3ljbGUgZXZlbnRcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmVcbiAgICBwdWJsaWMgVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV3UHJvcHM6IElQcm9wcyk6IHZvaWQge1xuICAgICAgICBpZiAobmV3UHJvcHMuc2VydmVyQ29uZmlnLmhzVXJsID09PSB0aGlzLnByb3BzLnNlcnZlckNvbmZpZy5oc1VybCAmJlxuICAgICAgICAgICAgbmV3UHJvcHMuc2VydmVyQ29uZmlnLmlzVXJsID09PSB0aGlzLnByb3BzLnNlcnZlckNvbmZpZy5pc1VybCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIERvIGEgbGl2ZWxpbmVzcyBjaGVjayBvbiB0aGUgbmV3IFVSTHNcbiAgICAgICAgdGhpcy5jaGVja1NlcnZlckxpdmVsaW5lc3MobmV3UHJvcHMuc2VydmVyQ29uZmlnKTtcblxuICAgICAgICAvLyBEbyBjYXBhYmlsaXRpZXMgY2hlY2sgb24gbmV3IFVSTHNcbiAgICAgICAgdGhpcy5jaGVja1NlcnZlckNhcGFiaWxpdGllcyhuZXdQcm9wcy5zZXJ2ZXJDb25maWcpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgY2hlY2tTZXJ2ZXJMaXZlbGluZXNzKHNlcnZlckNvbmZpZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgQXV0b0Rpc2NvdmVyeVV0aWxzLnZhbGlkYXRlU2VydmVyQ29uZmlnV2l0aFN0YXRpY1VybHMoXG4gICAgICAgICAgICAgICAgc2VydmVyQ29uZmlnLmhzVXJsLFxuICAgICAgICAgICAgICAgIHNlcnZlckNvbmZpZy5pc1VybCxcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHNlcnZlcklzQWxpdmU6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShBdXRvRGlzY292ZXJ5VXRpbHMuYXV0aENvbXBvbmVudFN0YXRlRm9yRXJyb3IoZSwgXCJmb3Jnb3RfcGFzc3dvcmRcIikgYXMgSVN0YXRlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgY2hlY2tTZXJ2ZXJDYXBhYmlsaXRpZXMoc2VydmVyQ29uZmlnOiBWYWxpZGF0ZWRTZXJ2ZXJDb25maWcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3QgdGVtcENsaWVudCA9IGNyZWF0ZUNsaWVudCh7XG4gICAgICAgICAgICBiYXNlVXJsOiBzZXJ2ZXJDb25maWcuaHNVcmwsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHNlcnZlclN1cHBvcnRzQ29udHJvbE9mRGV2aWNlc0xvZ291dCA9IGF3YWl0IHRlbXBDbGllbnQuZG9lc1NlcnZlclN1cHBvcnRMb2dvdXREZXZpY2VzKCk7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBsb2dvdXREZXZpY2VzOiAhc2VydmVyU3VwcG9ydHNDb250cm9sT2ZEZXZpY2VzTG9nb3V0LFxuICAgICAgICAgICAgc2VydmVyU3VwcG9ydHNDb250cm9sT2ZEZXZpY2VzTG9nb3V0LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3VibWl0UGFzc3dvcmRSZXNldChlbWFpbDogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nLCBsb2dvdXREZXZpY2VzID0gdHJ1ZSk6IHZvaWQge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHBoYXNlOiBQaGFzZS5TZW5kaW5nRW1haWwsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnJlc2V0ID0gbmV3IFBhc3N3b3JkUmVzZXQodGhpcy5wcm9wcy5zZXJ2ZXJDb25maWcuaHNVcmwsIHRoaXMucHJvcHMuc2VydmVyQ29uZmlnLmlzVXJsKTtcbiAgICAgICAgdGhpcy5yZXNldC5yZXNldFBhc3N3b3JkKGVtYWlsLCBwYXNzd29yZCwgbG9nb3V0RGV2aWNlcykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBwaGFzZTogUGhhc2UuRW1haWxTZW50LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2hvd0Vycm9yRGlhbG9nKF90KCdGYWlsZWQgdG8gc2VuZCBlbWFpbCcpICsgXCI6IFwiICsgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgcGhhc2U6IFBoYXNlLkZvcmdvdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uVmVyaWZ5ID0gYXN5bmMgKGV2OiBSZWFjdC5Nb3VzZUV2ZW50KTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmICghdGhpcy5yZXNldCkge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwib25WZXJpZnkgY2FsbGVkIGJlZm9yZSBzdWJtaXRQYXNzd29yZFJlc2V0IVwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5jdXJyZW50SHR0cFJlcXVlc3QpIHJldHVybjtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVIdHRwUmVxdWVzdCh0aGlzLnJlc2V0LmNoZWNrRW1haWxMaW5rQ2xpY2tlZCgpKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwaGFzZTogUGhhc2UuRG9uZSB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dFcnJvckRpYWxvZyhlcnIubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblN1Ym1pdEZvcm0gPSBhc3luYyAoZXY6IFJlYWN0LkZvcm1FdmVudCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5jdXJyZW50SHR0cFJlcXVlc3QpIHJldHVybjtcblxuICAgICAgICAvLyByZWZyZXNoIHRoZSBzZXJ2ZXIgZXJyb3JzLCBqdXN0IGluIGNhc2UgdGhlIHNlcnZlciBjYW1lIGJhY2sgb25saW5lXG4gICAgICAgIGF3YWl0IHRoaXMuaGFuZGxlSHR0cFJlcXVlc3QodGhpcy5jaGVja1NlcnZlckxpdmVsaW5lc3ModGhpcy5wcm9wcy5zZXJ2ZXJDb25maWcpKTtcblxuICAgICAgICBjb25zdCBhbGxGaWVsZHNWYWxpZCA9IGF3YWl0IHRoaXMudmVyaWZ5RmllbGRzQmVmb3JlU3VibWl0KCk7XG4gICAgICAgIGlmICghYWxsRmllbGRzVmFsaWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmxvZ291dERldmljZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgZmluaXNoZWQgfSA9IE1vZGFsLmNyZWF0ZURpYWxvZzxbYm9vbGVhbl0+KFF1ZXN0aW9uRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KCdXYXJuaW5nIScpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+eyAhdGhpcy5zdGF0ZS5zZXJ2ZXJTdXBwb3J0c0NvbnRyb2xPZkRldmljZXNMb2dvdXQgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlJlc2V0dGluZyB5b3VyIHBhc3N3b3JkIG9uIHRoaXMgaG9tZXNlcnZlciB3aWxsIGNhdXNlIGFsbCBvZiB5b3VyIGRldmljZXMgdG8gYmUgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInNpZ25lZCBvdXQuIFRoaXMgd2lsbCBkZWxldGUgdGhlIG1lc3NhZ2UgZW5jcnlwdGlvbiBrZXlzIHN0b3JlZCBvbiB0aGVtLCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWFraW5nIGVuY3J5cHRlZCBjaGF0IGhpc3RvcnkgdW5yZWFkYWJsZS5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJTaWduaW5nIG91dCB5b3VyIGRldmljZXMgd2lsbCBkZWxldGUgdGhlIG1lc3NhZ2UgZW5jcnlwdGlvbiBrZXlzIHN0b3JlZCBvbiB0aGVtLCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWFraW5nIGVuY3J5cHRlZCBjaGF0IGhpc3RvcnkgdW5yZWFkYWJsZS5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICAgICB9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+eyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIklmIHlvdSB3YW50IHRvIHJldGFpbiBhY2Nlc3MgdG8geW91ciBjaGF0IGhpc3RvcnkgaW4gZW5jcnlwdGVkIHJvb21zLCBzZXQgdXAgS2V5IEJhY2t1cCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJvciBleHBvcnQgeW91ciBtZXNzYWdlIGtleXMgZnJvbSBvbmUgb2YgeW91ciBvdGhlciBkZXZpY2VzIGJlZm9yZSBwcm9jZWVkaW5nLlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgKSB9PC9wPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj4sXG4gICAgICAgICAgICAgICAgYnV0dG9uOiBfdCgnQ29udGludWUnKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgW2NvbmZpcm1lZF0gPSBhd2FpdCBmaW5pc2hlZDtcblxuICAgICAgICAgICAgaWYgKCFjb25maXJtZWQpIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc3VibWl0UGFzc3dvcmRSZXNldCh0aGlzLnN0YXRlLmVtYWlsLCB0aGlzLnN0YXRlLnBhc3N3b3JkLCB0aGlzLnN0YXRlLmxvZ291dERldmljZXMpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGFzeW5jIHZlcmlmeUZpZWxkc0JlZm9yZVN1Ym1pdCgpIHtcbiAgICAgICAgY29uc3QgZmllbGRJZHNJbkRpc3BsYXlPcmRlciA9IFtcbiAgICAgICAgICAgIEZvcmdvdFBhc3N3b3JkRmllbGQuRW1haWwsXG4gICAgICAgICAgICBGb3Jnb3RQYXNzd29yZEZpZWxkLlBhc3N3b3JkLFxuICAgICAgICAgICAgRm9yZ290UGFzc3dvcmRGaWVsZC5QYXNzd29yZENvbmZpcm0sXG4gICAgICAgIF07XG5cbiAgICAgICAgY29uc3QgaW52YWxpZEZpZWxkcyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IGZpZWxkSWQgb2YgZmllbGRJZHNJbkRpc3BsYXlPcmRlcikge1xuICAgICAgICAgICAgY29uc3QgdmFsaWQgPSBhd2FpdCB0aGlzW2ZpZWxkSWRdLnZhbGlkYXRlKHsgYWxsb3dFbXB0eTogZmFsc2UgfSk7XG4gICAgICAgICAgICBpZiAoIXZhbGlkKSB7XG4gICAgICAgICAgICAgICAgaW52YWxpZEZpZWxkcy5wdXNoKHRoaXNbZmllbGRJZF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGludmFsaWRGaWVsZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZvY3VzIG9uIHRoZSBmaXJzdCBpbnZhbGlkIGZpZWxkLCB0aGVuIHJlLXZhbGlkYXRlLFxuICAgICAgICAvLyB3aGljaCB3aWxsIHJlc3VsdCBpbiB0aGUgZXJyb3IgdG9vbHRpcCBiZWluZyBkaXNwbGF5ZWQgZm9yIHRoYXQgZmllbGQuXG4gICAgICAgIGludmFsaWRGaWVsZHNbMF0uZm9jdXMoKTtcbiAgICAgICAgaW52YWxpZEZpZWxkc1swXS52YWxpZGF0ZSh7IGFsbG93RW1wdHk6IGZhbHNlLCBmb2N1c2VkOiB0cnVlIH0pO1xuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uSW5wdXRDaGFuZ2VkID0gKHN0YXRlS2V5OiBzdHJpbmcsIGV2OiBSZWFjdC5Gb3JtRXZlbnQ8SFRNTElucHV0RWxlbWVudD4pID0+IHtcbiAgICAgICAgbGV0IHZhbHVlID0gZXYuY3VycmVudFRhcmdldC52YWx1ZTtcbiAgICAgICAgaWYgKHN0YXRlS2V5ID09PSBcImVtYWlsXCIpIHZhbHVlID0gdmFsdWUudHJpbSgpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIFtzdGF0ZUtleV06IHZhbHVlLFxuICAgICAgICB9IGFzIGFueSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Mb2dpbkNsaWNrID0gKGV2OiBSZWFjdC5Nb3VzZUV2ZW50KTogdm9pZCA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB0aGlzLnByb3BzLm9uTG9naW5DbGljaygpO1xuICAgIH07XG5cbiAgICBwdWJsaWMgc2hvd0Vycm9yRGlhbG9nKGRlc2NyaXB0aW9uOiBzdHJpbmcsIHRpdGxlPzogc3RyaW5nKSB7XG4gICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgdGl0bGUsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBoYW5kbGVIdHRwUmVxdWVzdDxUID0gdW5rbm93bj4ocmVxdWVzdDogUHJvbWlzZTxUPik6IFByb21pc2U8VD4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGN1cnJlbnRIdHRwUmVxdWVzdDogcmVxdWVzdCxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXF1ZXN0LmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgY3VycmVudEh0dHBSZXF1ZXN0OiB1bmRlZmluZWQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmVuZGVyRm9yZ290KCkge1xuICAgICAgICBsZXQgZXJyb3JUZXh0ID0gbnVsbDtcbiAgICAgICAgY29uc3QgZXJyID0gdGhpcy5zdGF0ZS5lcnJvclRleHQ7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIGVycm9yVGV4dCA9IDxkaXYgY2xhc3NOYW1lPVwibXhfTG9naW5fZXJyb3JcIj57IGVyciB9PC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHNlcnZlckRlYWRTZWN0aW9uO1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuc2VydmVySXNBbGl2ZSkge1xuICAgICAgICAgICAgY29uc3QgY2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgICAgIFwibXhfTG9naW5fZXJyb3JcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBcIm14X0xvZ2luX3NlcnZlckVycm9yXCI6IHRydWUsXG4gICAgICAgICAgICAgICAgXCJteF9Mb2dpbl9zZXJ2ZXJFcnJvck5vbkZhdGFsXCI6ICF0aGlzLnN0YXRlLnNlcnZlckVycm9ySXNGYXRhbCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc2VydmVyRGVhZFNlY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzZXN9PlxuICAgICAgICAgICAgICAgICAgICB7IHRoaXMuc3RhdGUuc2VydmVyRGVhZEVycm9yIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gPGRpdj5cbiAgICAgICAgICAgIHsgZXJyb3JUZXh0IH1cbiAgICAgICAgICAgIHsgc2VydmVyRGVhZFNlY3Rpb24gfVxuICAgICAgICAgICAgPFNlcnZlclBpY2tlclxuICAgICAgICAgICAgICAgIHNlcnZlckNvbmZpZz17dGhpcy5wcm9wcy5zZXJ2ZXJDb25maWd9XG4gICAgICAgICAgICAgICAgb25TZXJ2ZXJDb25maWdDaGFuZ2U9e3RoaXMucHJvcHMub25TZXJ2ZXJDb25maWdDaGFuZ2V9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPGZvcm0gb25TdWJtaXQ9e3RoaXMub25TdWJtaXRGb3JtfT5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0F1dGhCb2R5X2ZpZWxkUm93XCI+XG4gICAgICAgICAgICAgICAgICAgIDxFbWFpbEZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lPVwicmVzZXRfZW1haWxcIiAvLyBkZWZpbmUgYSBuYW1lIHNvIGJyb3dzZXIncyBwYXNzd29yZCBhdXRvZmlsbCBnZXRzIGxlc3MgY29uZnVzZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsUmVxdWlyZWQ9e190ZCgnVGhlIGVtYWlsIGFkZHJlc3MgbGlua2VkIHRvIHlvdXIgYWNjb3VudCBtdXN0IGJlIGVudGVyZWQuJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbEludmFsaWQ9e190ZChcIlRoZSBlbWFpbCBhZGRyZXNzIGRvZXNuJ3QgYXBwZWFyIHRvIGJlIHZhbGlkLlwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLmVtYWlsfVxuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRSZWY9e2ZpZWxkID0+IHRoaXNbRm9yZ290UGFzc3dvcmRGaWVsZC5FbWFpbF0gPSBmaWVsZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Gb2N1cz17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uSW5wdXRDaGFuZ2VkLmJpbmQodGhpcywgXCJlbWFpbFwiKX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0F1dGhCb2R5X2ZpZWxkUm93XCI+XG4gICAgICAgICAgICAgICAgICAgIDxQYXNzcGhyYXNlRmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU9XCJyZXNldF9wYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwicGFzc3dvcmRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190ZCgnTmV3IFBhc3N3b3JkJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5wYXNzd29yZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG1pblNjb3JlPXtQQVNTV09SRF9NSU5fU0NPUkV9XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZFJlZj17ZmllbGQgPT4gdGhpc1tGb3Jnb3RQYXNzd29yZEZpZWxkLlBhc3N3b3JkXSA9IGZpZWxkfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25JbnB1dENoYW5nZWQuYmluZCh0aGlzLCBcInBhc3N3b3JkXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwibmV3LXBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPFBhc3NwaHJhc2VDb25maXJtRmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU9XCJyZXNldF9wYXNzd29yZF9jb25maXJtXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdGQoJ0NvbmZpcm0nKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsUmVxdWlyZWQ9e190ZChcIkEgbmV3IHBhc3N3b3JkIG11c3QgYmUgZW50ZXJlZC5cIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbEludmFsaWQ9e190ZChcIk5ldyBwYXNzd29yZHMgbXVzdCBtYXRjaCBlYWNoIG90aGVyLlwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnBhc3N3b3JkMn1cbiAgICAgICAgICAgICAgICAgICAgICAgIHBhc3N3b3JkPXt0aGlzLnN0YXRlLnBhc3N3b3JkfVxuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRSZWY9e2ZpZWxkID0+IHRoaXNbRm9yZ290UGFzc3dvcmRGaWVsZC5QYXNzd29yZENvbmZpcm1dID0gZmllbGR9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbklucHV0Q2hhbmdlZC5iaW5kKHRoaXMsIFwicGFzc3dvcmQyXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwibmV3LXBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICB7IHRoaXMuc3RhdGUuc2VydmVyU3VwcG9ydHNDb250cm9sT2ZEZXZpY2VzTG9nb3V0ID9cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9BdXRoQm9keV9maWVsZFJvd1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPFN0eWxlZENoZWNrYm94IG9uQ2hhbmdlPXsoKSA9PiB0aGlzLnNldFN0YXRlKHsgbG9nb3V0RGV2aWNlczogIXRoaXMuc3RhdGUubG9nb3V0RGV2aWNlcyB9KX0gY2hlY2tlZD17dGhpcy5zdGF0ZS5sb2dvdXREZXZpY2VzfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiU2lnbiBvdXQgYWxsIGRldmljZXNcIikgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9TdHlsZWRDaGVja2JveD5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+IDogbnVsbFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICA8c3Bhbj57IF90KFxuICAgICAgICAgICAgICAgICAgICAnQSB2ZXJpZmljYXRpb24gZW1haWwgd2lsbCBiZSBzZW50IHRvIHlvdXIgaW5ib3ggdG8gY29uZmlybSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ3NldHRpbmcgeW91ciBuZXcgcGFzc3dvcmQuJyxcbiAgICAgICAgICAgICAgICApIH08L3NwYW4+XG4gICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0xvZ2luX3N1Ym1pdFwiXG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJzdWJtaXRcIlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17X3QoJ1NlbmQgUmVzZXQgRW1haWwnKX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD0nbGluaycgY2xhc3NOYW1lPVwibXhfQXV0aEJvZHlfY2hhbmdlRmxvd1wiIG9uQ2xpY2s9e3RoaXMub25Mb2dpbkNsaWNrfT5cbiAgICAgICAgICAgICAgICB7IF90KCdTaWduIGluIGluc3RlYWQnKSB9XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgIDwvZGl2PjtcbiAgICB9XG5cbiAgICByZW5kZXJTZW5kaW5nRW1haWwoKSB7XG4gICAgICAgIHJldHVybiA8U3Bpbm5lciAvPjtcbiAgICB9XG5cbiAgICByZW5kZXJFbWFpbFNlbnQoKSB7XG4gICAgICAgIHJldHVybiA8ZGl2PlxuICAgICAgICAgICAgeyBfdChcIkFuIGVtYWlsIGhhcyBiZWVuIHNlbnQgdG8gJShlbWFpbEFkZHJlc3Mpcy4gT25jZSB5b3UndmUgZm9sbG93ZWQgdGhlIFwiICtcbiAgICAgICAgICAgICAgICBcImxpbmsgaXQgY29udGFpbnMsIGNsaWNrIGJlbG93LlwiLCB7IGVtYWlsQWRkcmVzczogdGhpcy5zdGF0ZS5lbWFpbCB9KSB9XG4gICAgICAgICAgICA8YnIgLz5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0xvZ2luX3N1Ym1pdFwiXG4gICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblZlcmlmeX1cbiAgICAgICAgICAgICAgICB2YWx1ZT17X3QoJ0kgaGF2ZSB2ZXJpZmllZCBteSBlbWFpbCBhZGRyZXNzJyl9IC8+XG4gICAgICAgICAgICB7IHRoaXMuc3RhdGUuY3VycmVudEh0dHBSZXF1ZXN0ICYmIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0xvZ2luX3NwaW5uZXJcIj48SW5saW5lU3Bpbm5lciB3PXs2NH0gaD17NjR9IC8+PC9kaXY+KVxuICAgICAgICAgICAgfVxuICAgICAgICA8L2Rpdj47XG4gICAgfVxuXG4gICAgcmVuZGVyRG9uZSgpIHtcbiAgICAgICAgcmV0dXJuIDxkaXY+XG4gICAgICAgICAgICA8cD57IF90KFwiWW91ciBwYXNzd29yZCBoYXMgYmVlbiByZXNldC5cIikgfTwvcD5cbiAgICAgICAgICAgIHsgdGhpcy5zdGF0ZS5sb2dvdXREZXZpY2VzID9cbiAgICAgICAgICAgICAgICA8cD57IF90KFxuICAgICAgICAgICAgICAgICAgICBcIllvdSBoYXZlIGJlZW4gbG9nZ2VkIG91dCBvZiBhbGwgZGV2aWNlcyBhbmQgd2lsbCBubyBsb25nZXIgcmVjZWl2ZSBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwicHVzaCBub3RpZmljYXRpb25zLiBUbyByZS1lbmFibGUgbm90aWZpY2F0aW9ucywgc2lnbiBpbiBhZ2FpbiBvbiBlYWNoIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJkZXZpY2UuXCIsXG4gICAgICAgICAgICAgICAgKSB9PC9wPlxuICAgICAgICAgICAgICAgIDogbnVsbFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTG9naW5fc3VibWl0XCJcbiAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQ29tcGxldGV9XG4gICAgICAgICAgICAgICAgdmFsdWU9e190KCdSZXR1cm4gdG8gbG9naW4gc2NyZWVuJyl9IC8+XG4gICAgICAgIDwvZGl2PjtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCByZXNldFBhc3N3b3JkSnN4O1xuICAgICAgICBzd2l0Y2ggKHRoaXMuc3RhdGUucGhhc2UpIHtcbiAgICAgICAgICAgIGNhc2UgUGhhc2UuRm9yZ290OlxuICAgICAgICAgICAgICAgIHJlc2V0UGFzc3dvcmRKc3ggPSB0aGlzLnJlbmRlckZvcmdvdCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQaGFzZS5TZW5kaW5nRW1haWw6XG4gICAgICAgICAgICAgICAgcmVzZXRQYXNzd29yZEpzeCA9IHRoaXMucmVuZGVyU2VuZGluZ0VtYWlsKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFBoYXNlLkVtYWlsU2VudDpcbiAgICAgICAgICAgICAgICByZXNldFBhc3N3b3JkSnN4ID0gdGhpcy5yZW5kZXJFbWFpbFNlbnQoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUGhhc2UuRG9uZTpcbiAgICAgICAgICAgICAgICByZXNldFBhc3N3b3JkSnN4ID0gdGhpcy5yZW5kZXJEb25lKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJlc2V0UGFzc3dvcmRKc3ggPSA8ZGl2IGNsYXNzTmFtZT1cIm14X0xvZ2luX3NwaW5uZXJcIj48SW5saW5lU3Bpbm5lciB3PXs2NH0gaD17NjR9IC8+PC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxBdXRoUGFnZT5cbiAgICAgICAgICAgICAgICA8QXV0aEhlYWRlciAvPlxuICAgICAgICAgICAgICAgIDxBdXRoQm9keT5cbiAgICAgICAgICAgICAgICAgICAgPGgxPiB7IF90KCdTZXQgYSBuZXcgcGFzc3dvcmQnKSB9IDwvaDE+XG4gICAgICAgICAgICAgICAgICAgIHsgcmVzZXRQYXNzd29yZEpzeCB9XG4gICAgICAgICAgICAgICAgPC9BdXRoQm9keT5cbiAgICAgICAgICAgIDwvQXV0aFBhZ2U+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0s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