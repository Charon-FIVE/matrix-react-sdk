"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _Field = _interopRequireDefault(require("../elements/Field"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

var _Validation = _interopRequireDefault(require("../elements/Validation"));

var _languageHandler = require("../../../languageHandler");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _PassphraseField = _interopRequireDefault(require("../auth/PassphraseField"));

var _RegistrationForm = require("../auth/RegistrationForm");

var _SetEmailDialog = _interopRequireDefault(require("../dialogs/SetEmailDialog"));

var _QuestionDialog = _interopRequireDefault(require("../dialogs/QuestionDialog"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const FIELD_OLD_PASSWORD = 'field_old_password';
const FIELD_NEW_PASSWORD = 'field_new_password';
const FIELD_NEW_PASSWORD_CONFIRM = 'field_new_password_confirm';
var Phase;

(function (Phase) {
  Phase["Edit"] = "edit";
  Phase["Uploading"] = "uploading";
  Phase["Error"] = "error";
})(Phase || (Phase = {}));

class ChangePassword extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onExportE2eKeysClicked", () => {
      _Modal.default.createDialogAsync(Promise.resolve().then(() => _interopRequireWildcard(require('../../../async-components/views/dialogs/security/ExportE2eKeysDialog'))), {
        matrixClient: _MatrixClientPeg.MatrixClientPeg.get()
      });
    });
    (0, _defineProperty2.default)(this, "onChangeOldPassword", ev => {
      this.setState({
        oldPassword: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onOldPasswordValidate", async fieldState => {
      const result = await this.validateOldPasswordRules(fieldState);
      this.markFieldValid(FIELD_OLD_PASSWORD, result.valid);
      return result;
    });
    (0, _defineProperty2.default)(this, "validateOldPasswordRules", (0, _Validation.default)({
      rules: [{
        key: "required",
        test: _ref => {
          let {
            value,
            allowEmpty
          } = _ref;
          return allowEmpty || !!value;
        },
        invalid: () => (0, _languageHandler._t)("Passwords can't be empty")
      }]
    }));
    (0, _defineProperty2.default)(this, "onChangeNewPassword", ev => {
      this.setState({
        newPassword: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onNewPasswordValidate", result => {
      this.markFieldValid(FIELD_NEW_PASSWORD, result.valid);
    });
    (0, _defineProperty2.default)(this, "onChangeNewPasswordConfirm", ev => {
      this.setState({
        newPasswordConfirm: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onNewPasswordConfirmValidate", async fieldState => {
      const result = await this.validatePasswordConfirmRules(fieldState);
      this.markFieldValid(FIELD_NEW_PASSWORD_CONFIRM, result.valid);
      return result;
    });
    (0, _defineProperty2.default)(this, "validatePasswordConfirmRules", (0, _Validation.default)({
      rules: [{
        key: "required",
        test: _ref2 => {
          let {
            value,
            allowEmpty
          } = _ref2;
          return allowEmpty || !!value;
        },
        invalid: () => (0, _languageHandler._t)("Confirm password")
      }, {
        key: "match",

        test(_ref3) {
          let {
            value
          } = _ref3;
          return !value || value === this.state.newPassword;
        },

        invalid: () => (0, _languageHandler._t)("Passwords don't match")
      }]
    }));
    (0, _defineProperty2.default)(this, "onClickChange", async ev => {
      ev.preventDefault();
      const allFieldsValid = await this.verifyFieldsBeforeSubmit();

      if (!allFieldsValid) {
        return;
      }

      const oldPassword = this.state.oldPassword;
      const newPassword = this.state.newPassword;
      const confirmPassword = this.state.newPasswordConfirm;
      const err = this.checkPassword(oldPassword, newPassword, confirmPassword);

      if (err) {
        this.props.onError(err);
      } else {
        return this.onChangePassword(oldPassword, newPassword);
      }
    });
    this.state = {
      fieldValid: {},
      phase: Phase.Edit,
      oldPassword: "",
      newPassword: "",
      newPasswordConfirm: ""
    };
  }

  async onChangePassword(oldPassword, newPassword) {
    const cli = _MatrixClientPeg.MatrixClientPeg.get(); // if the server supports it then don't sign user out of all devices


    const serverSupportsControlOfDevicesLogout = await cli.doesServerSupportLogoutDevices();
    const userHasOtherDevices = (await cli.getDevices()).devices.length > 1;

    if (userHasOtherDevices && !serverSupportsControlOfDevicesLogout && this.props.confirm) {
      // warn about logging out all devices
      const {
        finished
      } = _Modal.default.createDialog(_QuestionDialog.default, {
        title: (0, _languageHandler._t)("Warning!"),
        description: /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)('Changing your password on this homeserver will cause all of your other devices to be ' + 'signed out. This will delete the message encryption keys stored on them, and may make ' + 'encrypted chat history unreadable.')), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)('If you want to retain access to your chat history in encrypted rooms you should first ' + 'export your room keys and re-import them afterwards.')), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)('You can also ask your homeserver admin to upgrade the server to change this behaviour.'))),
        button: (0, _languageHandler._t)("Continue"),
        extraButtons: [/*#__PURE__*/_react.default.createElement("button", {
          key: "exportRoomKeys",
          className: "mx_Dialog_primary",
          onClick: this.onExportE2eKeysClicked
        }, (0, _languageHandler._t)('Export E2E room keys'))]
      });

      const [confirmed] = await finished;
      if (!confirmed) return;
    }

    this.changePassword(cli, oldPassword, newPassword, serverSupportsControlOfDevicesLogout, userHasOtherDevices);
  }

  changePassword(cli, oldPassword, newPassword, serverSupportsControlOfDevicesLogout, userHasOtherDevices) {
    const authDict = {
      type: 'm.login.password',
      identifier: {
        type: 'm.id.user',
        user: cli.credentials.userId
      },
      // TODO: Remove `user` once servers support proper UIA
      // See https://github.com/matrix-org/synapse/issues/5665
      user: cli.credentials.userId,
      password: oldPassword
    };
    this.setState({
      phase: Phase.Uploading
    });
    const logoutDevices = serverSupportsControlOfDevicesLogout ? false : undefined; // undefined or true mean all devices signed out

    const didLogoutOutOtherDevices = !serverSupportsControlOfDevicesLogout && userHasOtherDevices;
    cli.setPassword(authDict, newPassword, logoutDevices).then(() => {
      if (this.props.shouldAskForEmail) {
        return this.optionallySetEmail().then(confirmed => {
          this.props.onFinished({
            didSetEmail: confirmed,
            didLogoutOutOtherDevices
          });
        });
      } else {
        this.props.onFinished({
          didLogoutOutOtherDevices
        });
      }
    }, err => {
      this.props.onError(err);
    }).finally(() => {
      this.setState({
        phase: Phase.Edit,
        oldPassword: "",
        newPassword: "",
        newPasswordConfirm: ""
      });
    });
  }

  checkPassword(oldPass, newPass, confirmPass) {
    if (newPass !== confirmPass) {
      return {
        error: (0, _languageHandler._t)("New passwords don't match")
      };
    } else if (!newPass || newPass.length === 0) {
      return {
        error: (0, _languageHandler._t)("Passwords can't be empty")
      };
    }
  }

  optionallySetEmail() {
    // Ask for an email otherwise the user has no way to reset their password
    const modal = _Modal.default.createDialog(_SetEmailDialog.default, {
      title: (0, _languageHandler._t)('Do you want to set an email address?')
    });

    return modal.finished.then(_ref4 => {
      let [confirmed] = _ref4;
      return confirmed;
    });
  }

  markFieldValid(fieldID, valid) {
    const {
      fieldValid
    } = this.state;
    fieldValid[fieldID] = valid;
    this.setState({
      fieldValid
    });
  }

  async verifyFieldsBeforeSubmit() {
    // Blur the active element if any, so we first run its blur validation,
    // which is less strict than the pass we're about to do below for all fields.
    const activeElement = document.activeElement;

    if (activeElement) {
      activeElement.blur();
    }

    const fieldIDsInDisplayOrder = [FIELD_OLD_PASSWORD, FIELD_NEW_PASSWORD, FIELD_NEW_PASSWORD_CONFIRM]; // Run all fields with stricter validation that no longer allows empty
    // values for required fields.

    for (const fieldID of fieldIDsInDisplayOrder) {
      const field = this[fieldID];

      if (!field) {
        continue;
      } // We must wait for these validations to finish before queueing
      // up the setState below so our setState goes in the queue after
      // all the setStates from these validate calls (that's how we
      // know they've finished).


      await field.validate({
        allowEmpty: false
      });
    } // Validation and state updates are async, so we need to wait for them to complete
    // first. Queue a `setState` callback and wait for it to resolve.


    await new Promise(resolve => this.setState({}, resolve));

    if (this.allFieldsValid()) {
      return true;
    }

    const invalidField = this.findFirstInvalidField(fieldIDsInDisplayOrder);

    if (!invalidField) {
      return true;
    } // Focus the first invalid field and show feedback in the stricter mode
    // that no longer allows empty values for required fields.


    invalidField.focus();
    invalidField.validate({
      allowEmpty: false,
      focused: true
    });
    return false;
  }

  allFieldsValid() {
    const keys = Object.keys(this.state.fieldValid);

    for (let i = 0; i < keys.length; ++i) {
      if (!this.state.fieldValid[keys[i]]) {
        return false;
      }
    }

    return true;
  }

  findFirstInvalidField(fieldIDs) {
    for (const fieldID of fieldIDs) {
      if (!this.state.fieldValid[fieldID] && this[fieldID]) {
        return this[fieldID];
      }
    }

    return null;
  }

  render() {
    const rowClassName = this.props.rowClassName;
    const buttonClassName = this.props.buttonClassName;

    switch (this.state.phase) {
      case Phase.Edit:
        return /*#__PURE__*/_react.default.createElement("form", {
          className: this.props.className,
          onSubmit: this.onClickChange
        }, /*#__PURE__*/_react.default.createElement("div", {
          className: rowClassName
        }, /*#__PURE__*/_react.default.createElement(_Field.default, {
          ref: field => this[FIELD_OLD_PASSWORD] = field,
          type: "password",
          label: (0, _languageHandler._t)('Current password'),
          value: this.state.oldPassword,
          onChange: this.onChangeOldPassword,
          onValidate: this.onOldPasswordValidate
        })), /*#__PURE__*/_react.default.createElement("div", {
          className: rowClassName
        }, /*#__PURE__*/_react.default.createElement(_PassphraseField.default, {
          fieldRef: field => this[FIELD_NEW_PASSWORD] = field,
          type: "password",
          label: (0, _languageHandler._td)("New Password"),
          minScore: _RegistrationForm.PASSWORD_MIN_SCORE,
          value: this.state.newPassword,
          autoFocus: this.props.autoFocusNewPasswordInput,
          onChange: this.onChangeNewPassword,
          onValidate: this.onNewPasswordValidate,
          autoComplete: "new-password"
        })), /*#__PURE__*/_react.default.createElement("div", {
          className: rowClassName
        }, /*#__PURE__*/_react.default.createElement(_Field.default, {
          ref: field => this[FIELD_NEW_PASSWORD_CONFIRM] = field,
          type: "password",
          label: (0, _languageHandler._t)("Confirm password"),
          value: this.state.newPasswordConfirm,
          onChange: this.onChangeNewPasswordConfirm,
          onValidate: this.onNewPasswordConfirmValidate,
          autoComplete: "new-password"
        })), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          className: buttonClassName,
          kind: this.props.buttonKind,
          onClick: this.onClickChange
        }, this.props.buttonLabel || (0, _languageHandler._t)('Change Password')));

      case Phase.Uploading:
        return /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_Dialog_content"
        }, /*#__PURE__*/_react.default.createElement(_Spinner.default, null));
    }
  }

}

exports.default = ChangePassword;
(0, _defineProperty2.default)(ChangePassword, "defaultProps", {
  onFinished() {},

  onError() {},

  confirm: true
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGSUVMRF9PTERfUEFTU1dPUkQiLCJGSUVMRF9ORVdfUEFTU1dPUkQiLCJGSUVMRF9ORVdfUEFTU1dPUkRfQ09ORklSTSIsIlBoYXNlIiwiQ2hhbmdlUGFzc3dvcmQiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJNb2RhbCIsImNyZWF0ZURpYWxvZ0FzeW5jIiwibWF0cml4Q2xpZW50IiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiZXYiLCJzZXRTdGF0ZSIsIm9sZFBhc3N3b3JkIiwidGFyZ2V0IiwidmFsdWUiLCJmaWVsZFN0YXRlIiwicmVzdWx0IiwidmFsaWRhdGVPbGRQYXNzd29yZFJ1bGVzIiwibWFya0ZpZWxkVmFsaWQiLCJ2YWxpZCIsIndpdGhWYWxpZGF0aW9uIiwicnVsZXMiLCJrZXkiLCJ0ZXN0IiwiYWxsb3dFbXB0eSIsImludmFsaWQiLCJfdCIsIm5ld1Bhc3N3b3JkIiwibmV3UGFzc3dvcmRDb25maXJtIiwidmFsaWRhdGVQYXNzd29yZENvbmZpcm1SdWxlcyIsInN0YXRlIiwicHJldmVudERlZmF1bHQiLCJhbGxGaWVsZHNWYWxpZCIsInZlcmlmeUZpZWxkc0JlZm9yZVN1Ym1pdCIsImNvbmZpcm1QYXNzd29yZCIsImVyciIsImNoZWNrUGFzc3dvcmQiLCJvbkVycm9yIiwib25DaGFuZ2VQYXNzd29yZCIsImZpZWxkVmFsaWQiLCJwaGFzZSIsIkVkaXQiLCJjbGkiLCJzZXJ2ZXJTdXBwb3J0c0NvbnRyb2xPZkRldmljZXNMb2dvdXQiLCJkb2VzU2VydmVyU3VwcG9ydExvZ291dERldmljZXMiLCJ1c2VySGFzT3RoZXJEZXZpY2VzIiwiZ2V0RGV2aWNlcyIsImRldmljZXMiLCJsZW5ndGgiLCJjb25maXJtIiwiZmluaXNoZWQiLCJjcmVhdGVEaWFsb2ciLCJRdWVzdGlvbkRpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJidXR0b24iLCJleHRyYUJ1dHRvbnMiLCJvbkV4cG9ydEUyZUtleXNDbGlja2VkIiwiY29uZmlybWVkIiwiY2hhbmdlUGFzc3dvcmQiLCJhdXRoRGljdCIsInR5cGUiLCJpZGVudGlmaWVyIiwidXNlciIsImNyZWRlbnRpYWxzIiwidXNlcklkIiwicGFzc3dvcmQiLCJVcGxvYWRpbmciLCJsb2dvdXREZXZpY2VzIiwidW5kZWZpbmVkIiwiZGlkTG9nb3V0T3V0T3RoZXJEZXZpY2VzIiwic2V0UGFzc3dvcmQiLCJ0aGVuIiwic2hvdWxkQXNrRm9yRW1haWwiLCJvcHRpb25hbGx5U2V0RW1haWwiLCJvbkZpbmlzaGVkIiwiZGlkU2V0RW1haWwiLCJmaW5hbGx5Iiwib2xkUGFzcyIsIm5ld1Bhc3MiLCJjb25maXJtUGFzcyIsImVycm9yIiwibW9kYWwiLCJTZXRFbWFpbERpYWxvZyIsImZpZWxkSUQiLCJhY3RpdmVFbGVtZW50IiwiZG9jdW1lbnQiLCJibHVyIiwiZmllbGRJRHNJbkRpc3BsYXlPcmRlciIsImZpZWxkIiwidmFsaWRhdGUiLCJQcm9taXNlIiwicmVzb2x2ZSIsImludmFsaWRGaWVsZCIsImZpbmRGaXJzdEludmFsaWRGaWVsZCIsImZvY3VzIiwiZm9jdXNlZCIsImtleXMiLCJPYmplY3QiLCJpIiwiZmllbGRJRHMiLCJyZW5kZXIiLCJyb3dDbGFzc05hbWUiLCJidXR0b25DbGFzc05hbWUiLCJjbGFzc05hbWUiLCJvbkNsaWNrQ2hhbmdlIiwib25DaGFuZ2VPbGRQYXNzd29yZCIsIm9uT2xkUGFzc3dvcmRWYWxpZGF0ZSIsIl90ZCIsIlBBU1NXT1JEX01JTl9TQ09SRSIsImF1dG9Gb2N1c05ld1Bhc3N3b3JkSW5wdXQiLCJvbkNoYW5nZU5ld1Bhc3N3b3JkIiwib25OZXdQYXNzd29yZFZhbGlkYXRlIiwib25DaGFuZ2VOZXdQYXNzd29yZENvbmZpcm0iLCJvbk5ld1Bhc3N3b3JkQ29uZmlybVZhbGlkYXRlIiwiYnV0dG9uS2luZCIsImJ1dHRvbkxhYmVsIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3Mvc2V0dGluZ3MvQ2hhbmdlUGFzc3dvcmQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTgtMjAxOSBOZXcgVmVjdG9yIEx0ZFxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBDb21wb25lbnRUeXBlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NsaWVudFwiO1xuXG5pbXBvcnQgRmllbGQgZnJvbSBcIi4uL2VsZW1lbnRzL0ZpZWxkXCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tIFwiLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tICcuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uJztcbmltcG9ydCBTcGlubmVyIGZyb20gJy4uL2VsZW1lbnRzL1NwaW5uZXInO1xuaW1wb3J0IHdpdGhWYWxpZGF0aW9uLCB7IElGaWVsZFN0YXRlLCBJVmFsaWRhdGlvblJlc3VsdCB9IGZyb20gJy4uL2VsZW1lbnRzL1ZhbGlkYXRpb24nO1xuaW1wb3J0IHsgX3QsIF90ZCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgTW9kYWwgZnJvbSBcIi4uLy4uLy4uL01vZGFsXCI7XG5pbXBvcnQgUGFzc3BocmFzZUZpZWxkIGZyb20gXCIuLi9hdXRoL1Bhc3NwaHJhc2VGaWVsZFwiO1xuaW1wb3J0IHsgUEFTU1dPUkRfTUlOX1NDT1JFIH0gZnJvbSAnLi4vYXV0aC9SZWdpc3RyYXRpb25Gb3JtJztcbmltcG9ydCBTZXRFbWFpbERpYWxvZyBmcm9tIFwiLi4vZGlhbG9ncy9TZXRFbWFpbERpYWxvZ1wiO1xuaW1wb3J0IFF1ZXN0aW9uRGlhbG9nIGZyb20gXCIuLi9kaWFsb2dzL1F1ZXN0aW9uRGlhbG9nXCI7XG5cbmNvbnN0IEZJRUxEX09MRF9QQVNTV09SRCA9ICdmaWVsZF9vbGRfcGFzc3dvcmQnO1xuY29uc3QgRklFTERfTkVXX1BBU1NXT1JEID0gJ2ZpZWxkX25ld19wYXNzd29yZCc7XG5jb25zdCBGSUVMRF9ORVdfUEFTU1dPUkRfQ09ORklSTSA9ICdmaWVsZF9uZXdfcGFzc3dvcmRfY29uZmlybSc7XG5cbmVudW0gUGhhc2Uge1xuICAgIEVkaXQgPSBcImVkaXRcIixcbiAgICBVcGxvYWRpbmcgPSBcInVwbG9hZGluZ1wiLFxuICAgIEVycm9yID0gXCJlcnJvclwiLFxufVxuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBvbkZpbmlzaGVkPzogKG91dGNvbWU6IHtcbiAgICAgICAgZGlkU2V0RW1haWw/OiBib29sZWFuO1xuICAgICAgICAvKiogV2FzIG9uZSBvciBtb3JlIG90aGVyIGRldmljZXMgbG9nZ2VkIG91dCB3aGlsc3QgY2hhbmdpbmcgdGhlIHBhc3N3b3JkICovXG4gICAgICAgIGRpZExvZ291dE91dE90aGVyRGV2aWNlczogYm9vbGVhbjtcbiAgICB9KSA9PiB2b2lkO1xuICAgIG9uRXJyb3I/OiAoZXJyb3I6IHtlcnJvcjogc3RyaW5nfSkgPT4gdm9pZDtcbiAgICByb3dDbGFzc05hbWU/OiBzdHJpbmc7XG4gICAgYnV0dG9uQ2xhc3NOYW1lPzogc3RyaW5nO1xuICAgIGJ1dHRvbktpbmQ/OiBzdHJpbmc7XG4gICAgYnV0dG9uTGFiZWw/OiBzdHJpbmc7XG4gICAgY29uZmlybT86IGJvb2xlYW47XG4gICAgLy8gV2hldGhlciB0byBhdXRvRm9jdXMgdGhlIG5ldyBwYXNzd29yZCBpbnB1dFxuICAgIGF1dG9Gb2N1c05ld1Bhc3N3b3JkSW5wdXQ/OiBib29sZWFuO1xuICAgIGNsYXNzTmFtZT86IHN0cmluZztcbiAgICBzaG91bGRBc2tGb3JFbWFpbD86IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGZpZWxkVmFsaWQ6IHt9O1xuICAgIHBoYXNlOiBQaGFzZTtcbiAgICBvbGRQYXNzd29yZDogc3RyaW5nO1xuICAgIG5ld1Bhc3N3b3JkOiBzdHJpbmc7XG4gICAgbmV3UGFzc3dvcmRDb25maXJtOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENoYW5nZVBhc3N3b3JkIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHVibGljIHN0YXRpYyBkZWZhdWx0UHJvcHM6IFBhcnRpYWw8SVByb3BzPiA9IHtcbiAgICAgICAgb25GaW5pc2hlZCgpIHt9LFxuICAgICAgICBvbkVycm9yKCkge30sXG5cbiAgICAgICAgY29uZmlybTogdHJ1ZSxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGZpZWxkVmFsaWQ6IHt9LFxuICAgICAgICAgICAgcGhhc2U6IFBoYXNlLkVkaXQsXG4gICAgICAgICAgICBvbGRQYXNzd29yZDogXCJcIixcbiAgICAgICAgICAgIG5ld1Bhc3N3b3JkOiBcIlwiLFxuICAgICAgICAgICAgbmV3UGFzc3dvcmRDb25maXJtOiBcIlwiLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgb25DaGFuZ2VQYXNzd29yZChvbGRQYXNzd29yZDogc3RyaW5nLCBuZXdQYXNzd29yZDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcblxuICAgICAgICAvLyBpZiB0aGUgc2VydmVyIHN1cHBvcnRzIGl0IHRoZW4gZG9uJ3Qgc2lnbiB1c2VyIG91dCBvZiBhbGwgZGV2aWNlc1xuICAgICAgICBjb25zdCBzZXJ2ZXJTdXBwb3J0c0NvbnRyb2xPZkRldmljZXNMb2dvdXQgPSBhd2FpdCBjbGkuZG9lc1NlcnZlclN1cHBvcnRMb2dvdXREZXZpY2VzKCk7XG4gICAgICAgIGNvbnN0IHVzZXJIYXNPdGhlckRldmljZXMgPSAoYXdhaXQgY2xpLmdldERldmljZXMoKSkuZGV2aWNlcy5sZW5ndGggPiAxO1xuXG4gICAgICAgIGlmICh1c2VySGFzT3RoZXJEZXZpY2VzICYmICFzZXJ2ZXJTdXBwb3J0c0NvbnRyb2xPZkRldmljZXNMb2dvdXQgJiYgdGhpcy5wcm9wcy5jb25maXJtKSB7XG4gICAgICAgICAgICAvLyB3YXJuIGFib3V0IGxvZ2dpbmcgb3V0IGFsbCBkZXZpY2VzXG4gICAgICAgICAgICBjb25zdCB7IGZpbmlzaGVkIH0gPSBNb2RhbC5jcmVhdGVEaWFsb2c8W2Jvb2xlYW5dPihRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIldhcm5pbmchXCIpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+eyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQ2hhbmdpbmcgeW91ciBwYXNzd29yZCBvbiB0aGlzIGhvbWVzZXJ2ZXIgd2lsbCBjYXVzZSBhbGwgb2YgeW91ciBvdGhlciBkZXZpY2VzIHRvIGJlICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzaWduZWQgb3V0LiBUaGlzIHdpbGwgZGVsZXRlIHRoZSBtZXNzYWdlIGVuY3J5cHRpb24ga2V5cyBzdG9yZWQgb24gdGhlbSwgYW5kIG1heSBtYWtlICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdlbmNyeXB0ZWQgY2hhdCBoaXN0b3J5IHVucmVhZGFibGUuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICkgfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPnsgX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0lmIHlvdSB3YW50IHRvIHJldGFpbiBhY2Nlc3MgdG8geW91ciBjaGF0IGhpc3RvcnkgaW4gZW5jcnlwdGVkIHJvb21zIHlvdSBzaG91bGQgZmlyc3QgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2V4cG9ydCB5b3VyIHJvb20ga2V5cyBhbmQgcmUtaW1wb3J0IHRoZW0gYWZ0ZXJ3YXJkcy4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgKSB9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+eyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnWW91IGNhbiBhbHNvIGFzayB5b3VyIGhvbWVzZXJ2ZXIgYWRtaW4gdG8gdXBncmFkZSB0aGUgc2VydmVyIHRvIGNoYW5nZSB0aGlzIGJlaGF2aW91ci4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgKSB9PC9wPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj4sXG4gICAgICAgICAgICAgICAgYnV0dG9uOiBfdChcIkNvbnRpbnVlXCIpLFxuICAgICAgICAgICAgICAgIGV4dHJhQnV0dG9uczogW1xuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk9XCJleHBvcnRSb29tS2V5c1wiXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9EaWFsb2dfcHJpbWFyeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uRXhwb3J0RTJlS2V5c0NsaWNrZWR9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoJ0V4cG9ydCBFMkUgcm9vbSBrZXlzJykgfVxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj4sXG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBbY29uZmlybWVkXSA9IGF3YWl0IGZpbmlzaGVkO1xuICAgICAgICAgICAgaWYgKCFjb25maXJtZWQpIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2hhbmdlUGFzc3dvcmQoY2xpLCBvbGRQYXNzd29yZCwgbmV3UGFzc3dvcmQsIHNlcnZlclN1cHBvcnRzQ29udHJvbE9mRGV2aWNlc0xvZ291dCwgdXNlckhhc090aGVyRGV2aWNlcyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjaGFuZ2VQYXNzd29yZChcbiAgICAgICAgY2xpOiBNYXRyaXhDbGllbnQsXG4gICAgICAgIG9sZFBhc3N3b3JkOiBzdHJpbmcsXG4gICAgICAgIG5ld1Bhc3N3b3JkOiBzdHJpbmcsXG4gICAgICAgIHNlcnZlclN1cHBvcnRzQ29udHJvbE9mRGV2aWNlc0xvZ291dDogYm9vbGVhbixcbiAgICAgICAgdXNlckhhc090aGVyRGV2aWNlczogYm9vbGVhbixcbiAgICApOiB2b2lkIHtcbiAgICAgICAgY29uc3QgYXV0aERpY3QgPSB7XG4gICAgICAgICAgICB0eXBlOiAnbS5sb2dpbi5wYXNzd29yZCcsXG4gICAgICAgICAgICBpZGVudGlmaWVyOiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ20uaWQudXNlcicsXG4gICAgICAgICAgICAgICAgdXNlcjogY2xpLmNyZWRlbnRpYWxzLnVzZXJJZCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyBUT0RPOiBSZW1vdmUgYHVzZXJgIG9uY2Ugc2VydmVycyBzdXBwb3J0IHByb3BlciBVSUFcbiAgICAgICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWF0cml4LW9yZy9zeW5hcHNlL2lzc3Vlcy81NjY1XG4gICAgICAgICAgICB1c2VyOiBjbGkuY3JlZGVudGlhbHMudXNlcklkLFxuICAgICAgICAgICAgcGFzc3dvcmQ6IG9sZFBhc3N3b3JkLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcGhhc2U6IFBoYXNlLlVwbG9hZGluZyxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgbG9nb3V0RGV2aWNlcyA9IHNlcnZlclN1cHBvcnRzQ29udHJvbE9mRGV2aWNlc0xvZ291dCA/IGZhbHNlIDogdW5kZWZpbmVkO1xuXG4gICAgICAgIC8vIHVuZGVmaW5lZCBvciB0cnVlIG1lYW4gYWxsIGRldmljZXMgc2lnbmVkIG91dFxuICAgICAgICBjb25zdCBkaWRMb2dvdXRPdXRPdGhlckRldmljZXMgPSAhc2VydmVyU3VwcG9ydHNDb250cm9sT2ZEZXZpY2VzTG9nb3V0ICYmIHVzZXJIYXNPdGhlckRldmljZXM7XG5cbiAgICAgICAgY2xpLnNldFBhc3N3b3JkKGF1dGhEaWN0LCBuZXdQYXNzd29yZCwgbG9nb3V0RGV2aWNlcykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5zaG91bGRBc2tGb3JFbWFpbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbmFsbHlTZXRFbWFpbCgpLnRoZW4oKGNvbmZpcm1lZCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlkU2V0RW1haWw6IGNvbmZpcm1lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpZExvZ291dE91dE90aGVyRGV2aWNlcyxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh7IGRpZExvZ291dE91dE90aGVyRGV2aWNlcyB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkVycm9yKGVycik7XG4gICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgcGhhc2U6IFBoYXNlLkVkaXQsXG4gICAgICAgICAgICAgICAgb2xkUGFzc3dvcmQ6IFwiXCIsXG4gICAgICAgICAgICAgICAgbmV3UGFzc3dvcmQ6IFwiXCIsXG4gICAgICAgICAgICAgICAgbmV3UGFzc3dvcmRDb25maXJtOiBcIlwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2hlY2tQYXNzd29yZChvbGRQYXNzOiBzdHJpbmcsIG5ld1Bhc3M6IHN0cmluZywgY29uZmlybVBhc3M6IHN0cmluZyk6IHtlcnJvcjogc3RyaW5nfSB7XG4gICAgICAgIGlmIChuZXdQYXNzICE9PSBjb25maXJtUGFzcykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvcjogX3QoXCJOZXcgcGFzc3dvcmRzIGRvbid0IG1hdGNoXCIpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmICghbmV3UGFzcyB8fCBuZXdQYXNzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlcnJvcjogX3QoXCJQYXNzd29yZHMgY2FuJ3QgYmUgZW1wdHlcIiksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvcHRpb25hbGx5U2V0RW1haWwoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIC8vIEFzayBmb3IgYW4gZW1haWwgb3RoZXJ3aXNlIHRoZSB1c2VyIGhhcyBubyB3YXkgdG8gcmVzZXQgdGhlaXIgcGFzc3dvcmRcbiAgICAgICAgY29uc3QgbW9kYWwgPSBNb2RhbC5jcmVhdGVEaWFsb2coU2V0RW1haWxEaWFsb2csIHtcbiAgICAgICAgICAgIHRpdGxlOiBfdCgnRG8geW91IHdhbnQgdG8gc2V0IGFuIGVtYWlsIGFkZHJlc3M/JyksXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbW9kYWwuZmluaXNoZWQudGhlbigoW2NvbmZpcm1lZF0pID0+IGNvbmZpcm1lZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkV4cG9ydEUyZUtleXNDbGlja2VkID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2dBc3luYyhcbiAgICAgICAgICAgIGltcG9ydChcbiAgICAgICAgICAgICAgICAnLi4vLi4vLi4vYXN5bmMtY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL3NlY3VyaXR5L0V4cG9ydEUyZUtleXNEaWFsb2cnXG4gICAgICAgICAgICApIGFzIHVua25vd24gYXMgUHJvbWlzZTxDb21wb25lbnRUeXBlPHt9Pj4sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbWF0cml4Q2xpZW50OiBNYXRyaXhDbGllbnRQZWcuZ2V0KCksXG4gICAgICAgICAgICB9LFxuICAgICAgICApO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG1hcmtGaWVsZFZhbGlkKGZpZWxkSUQ6IHN0cmluZywgdmFsaWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgeyBmaWVsZFZhbGlkIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgICBmaWVsZFZhbGlkW2ZpZWxkSURdID0gdmFsaWQ7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZmllbGRWYWxpZCxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkNoYW5nZU9sZFBhc3N3b3JkID0gKGV2OiBSZWFjdC5DaGFuZ2VFdmVudDxIVE1MSW5wdXRFbGVtZW50Pik6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIG9sZFBhc3N3b3JkOiBldi50YXJnZXQudmFsdWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uT2xkUGFzc3dvcmRWYWxpZGF0ZSA9IGFzeW5jIChmaWVsZFN0YXRlOiBJRmllbGRTdGF0ZSk6IFByb21pc2U8SVZhbGlkYXRpb25SZXN1bHQ+ID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy52YWxpZGF0ZU9sZFBhc3N3b3JkUnVsZXMoZmllbGRTdGF0ZSk7XG4gICAgICAgIHRoaXMubWFya0ZpZWxkVmFsaWQoRklFTERfT0xEX1BBU1NXT1JELCByZXN1bHQudmFsaWQpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICBwcml2YXRlIHZhbGlkYXRlT2xkUGFzc3dvcmRSdWxlcyA9IHdpdGhWYWxpZGF0aW9uKHtcbiAgICAgICAgcnVsZXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwicmVxdWlyZWRcIixcbiAgICAgICAgICAgICAgICB0ZXN0OiAoeyB2YWx1ZSwgYWxsb3dFbXB0eSB9KSA9PiBhbGxvd0VtcHR5IHx8ICEhdmFsdWUsXG4gICAgICAgICAgICAgICAgaW52YWxpZDogKCkgPT4gX3QoXCJQYXNzd29yZHMgY2FuJ3QgYmUgZW1wdHlcIiksXG4gICAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgIH0pO1xuXG4gICAgcHJpdmF0ZSBvbkNoYW5nZU5ld1Bhc3N3b3JkID0gKGV2OiBSZWFjdC5DaGFuZ2VFdmVudDxIVE1MSW5wdXRFbGVtZW50Pik6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIG5ld1Bhc3N3b3JkOiBldi50YXJnZXQudmFsdWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uTmV3UGFzc3dvcmRWYWxpZGF0ZSA9IChyZXN1bHQ6IElWYWxpZGF0aW9uUmVzdWx0KTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMubWFya0ZpZWxkVmFsaWQoRklFTERfTkVXX1BBU1NXT1JELCByZXN1bHQudmFsaWQpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ2hhbmdlTmV3UGFzc3dvcmRDb25maXJtID0gKGV2OiBSZWFjdC5DaGFuZ2VFdmVudDxIVE1MSW5wdXRFbGVtZW50Pik6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIG5ld1Bhc3N3b3JkQ29uZmlybTogZXYudGFyZ2V0LnZhbHVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbk5ld1Bhc3N3b3JkQ29uZmlybVZhbGlkYXRlID0gYXN5bmMgKGZpZWxkU3RhdGU6IElGaWVsZFN0YXRlKTogUHJvbWlzZTxJVmFsaWRhdGlvblJlc3VsdD4gPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnZhbGlkYXRlUGFzc3dvcmRDb25maXJtUnVsZXMoZmllbGRTdGF0ZSk7XG4gICAgICAgIHRoaXMubWFya0ZpZWxkVmFsaWQoRklFTERfTkVXX1BBU1NXT1JEX0NPTkZJUk0sIHJlc3VsdC52YWxpZCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIHByaXZhdGUgdmFsaWRhdGVQYXNzd29yZENvbmZpcm1SdWxlcyA9IHdpdGhWYWxpZGF0aW9uPHRoaXM+KHtcbiAgICAgICAgcnVsZXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwicmVxdWlyZWRcIixcbiAgICAgICAgICAgICAgICB0ZXN0OiAoeyB2YWx1ZSwgYWxsb3dFbXB0eSB9KSA9PiBhbGxvd0VtcHR5IHx8ICEhdmFsdWUsXG4gICAgICAgICAgICAgICAgaW52YWxpZDogKCkgPT4gX3QoXCJDb25maXJtIHBhc3N3b3JkXCIpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwibWF0Y2hcIixcbiAgICAgICAgICAgICAgICB0ZXN0KHsgdmFsdWUgfSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gIXZhbHVlIHx8IHZhbHVlID09PSB0aGlzLnN0YXRlLm5ld1Bhc3N3b3JkO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaW52YWxpZDogKCkgPT4gX3QoXCJQYXNzd29yZHMgZG9uJ3QgbWF0Y2hcIiksXG4gICAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgIH0pO1xuXG4gICAgcHJpdmF0ZSBvbkNsaWNrQ2hhbmdlID0gYXN5bmMgKGV2OiBSZWFjdC5Nb3VzZUV2ZW50IHwgUmVhY3QuRm9ybUV2ZW50KTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgY29uc3QgYWxsRmllbGRzVmFsaWQgPSBhd2FpdCB0aGlzLnZlcmlmeUZpZWxkc0JlZm9yZVN1Ym1pdCgpO1xuICAgICAgICBpZiAoIWFsbEZpZWxkc1ZhbGlkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBvbGRQYXNzd29yZCA9IHRoaXMuc3RhdGUub2xkUGFzc3dvcmQ7XG4gICAgICAgIGNvbnN0IG5ld1Bhc3N3b3JkID0gdGhpcy5zdGF0ZS5uZXdQYXNzd29yZDtcbiAgICAgICAgY29uc3QgY29uZmlybVBhc3N3b3JkID0gdGhpcy5zdGF0ZS5uZXdQYXNzd29yZENvbmZpcm07XG4gICAgICAgIGNvbnN0IGVyciA9IHRoaXMuY2hlY2tQYXNzd29yZChcbiAgICAgICAgICAgIG9sZFBhc3N3b3JkLCBuZXdQYXNzd29yZCwgY29uZmlybVBhc3N3b3JkLFxuICAgICAgICApO1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uRXJyb3IoZXJyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm9uQ2hhbmdlUGFzc3dvcmQob2xkUGFzc3dvcmQsIG5ld1Bhc3N3b3JkKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIGFzeW5jIHZlcmlmeUZpZWxkc0JlZm9yZVN1Ym1pdCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgLy8gQmx1ciB0aGUgYWN0aXZlIGVsZW1lbnQgaWYgYW55LCBzbyB3ZSBmaXJzdCBydW4gaXRzIGJsdXIgdmFsaWRhdGlvbixcbiAgICAgICAgLy8gd2hpY2ggaXMgbGVzcyBzdHJpY3QgdGhhbiB0aGUgcGFzcyB3ZSdyZSBhYm91dCB0byBkbyBiZWxvdyBmb3IgYWxsIGZpZWxkcy5cbiAgICAgICAgY29uc3QgYWN0aXZlRWxlbWVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIGlmIChhY3RpdmVFbGVtZW50KSB7XG4gICAgICAgICAgICBhY3RpdmVFbGVtZW50LmJsdXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZpZWxkSURzSW5EaXNwbGF5T3JkZXIgPSBbXG4gICAgICAgICAgICBGSUVMRF9PTERfUEFTU1dPUkQsXG4gICAgICAgICAgICBGSUVMRF9ORVdfUEFTU1dPUkQsXG4gICAgICAgICAgICBGSUVMRF9ORVdfUEFTU1dPUkRfQ09ORklSTSxcbiAgICAgICAgXTtcblxuICAgICAgICAvLyBSdW4gYWxsIGZpZWxkcyB3aXRoIHN0cmljdGVyIHZhbGlkYXRpb24gdGhhdCBubyBsb25nZXIgYWxsb3dzIGVtcHR5XG4gICAgICAgIC8vIHZhbHVlcyBmb3IgcmVxdWlyZWQgZmllbGRzLlxuICAgICAgICBmb3IgKGNvbnN0IGZpZWxkSUQgb2YgZmllbGRJRHNJbkRpc3BsYXlPcmRlcikge1xuICAgICAgICAgICAgY29uc3QgZmllbGQgPSB0aGlzW2ZpZWxkSURdO1xuICAgICAgICAgICAgaWYgKCFmaWVsZCkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gV2UgbXVzdCB3YWl0IGZvciB0aGVzZSB2YWxpZGF0aW9ucyB0byBmaW5pc2ggYmVmb3JlIHF1ZXVlaW5nXG4gICAgICAgICAgICAvLyB1cCB0aGUgc2V0U3RhdGUgYmVsb3cgc28gb3VyIHNldFN0YXRlIGdvZXMgaW4gdGhlIHF1ZXVlIGFmdGVyXG4gICAgICAgICAgICAvLyBhbGwgdGhlIHNldFN0YXRlcyBmcm9tIHRoZXNlIHZhbGlkYXRlIGNhbGxzICh0aGF0J3MgaG93IHdlXG4gICAgICAgICAgICAvLyBrbm93IHRoZXkndmUgZmluaXNoZWQpLlxuICAgICAgICAgICAgYXdhaXQgZmllbGQudmFsaWRhdGUoeyBhbGxvd0VtcHR5OiBmYWxzZSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFZhbGlkYXRpb24gYW5kIHN0YXRlIHVwZGF0ZXMgYXJlIGFzeW5jLCBzbyB3ZSBuZWVkIHRvIHdhaXQgZm9yIHRoZW0gdG8gY29tcGxldGVcbiAgICAgICAgLy8gZmlyc3QuIFF1ZXVlIGEgYHNldFN0YXRlYCBjYWxsYmFjayBhbmQgd2FpdCBmb3IgaXQgdG8gcmVzb2x2ZS5cbiAgICAgICAgYXdhaXQgbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHRoaXMuc2V0U3RhdGUoe30sIHJlc29sdmUpKTtcblxuICAgICAgICBpZiAodGhpcy5hbGxGaWVsZHNWYWxpZCgpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGludmFsaWRGaWVsZCA9IHRoaXMuZmluZEZpcnN0SW52YWxpZEZpZWxkKGZpZWxkSURzSW5EaXNwbGF5T3JkZXIpO1xuXG4gICAgICAgIGlmICghaW52YWxpZEZpZWxkKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZvY3VzIHRoZSBmaXJzdCBpbnZhbGlkIGZpZWxkIGFuZCBzaG93IGZlZWRiYWNrIGluIHRoZSBzdHJpY3RlciBtb2RlXG4gICAgICAgIC8vIHRoYXQgbm8gbG9uZ2VyIGFsbG93cyBlbXB0eSB2YWx1ZXMgZm9yIHJlcXVpcmVkIGZpZWxkcy5cbiAgICAgICAgaW52YWxpZEZpZWxkLmZvY3VzKCk7XG4gICAgICAgIGludmFsaWRGaWVsZC52YWxpZGF0ZSh7IGFsbG93RW1wdHk6IGZhbHNlLCBmb2N1c2VkOiB0cnVlIH0pO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhbGxGaWVsZHNWYWxpZCgpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuc3RhdGUuZmllbGRWYWxpZCk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmZpZWxkVmFsaWRba2V5c1tpXV0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmaW5kRmlyc3RJbnZhbGlkRmllbGQoZmllbGRJRHM6IHN0cmluZ1tdKTogRmllbGQge1xuICAgICAgICBmb3IgKGNvbnN0IGZpZWxkSUQgb2YgZmllbGRJRHMpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5zdGF0ZS5maWVsZFZhbGlkW2ZpZWxkSURdICYmIHRoaXNbZmllbGRJRF0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpc1tmaWVsZElEXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVuZGVyKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgY29uc3Qgcm93Q2xhc3NOYW1lID0gdGhpcy5wcm9wcy5yb3dDbGFzc05hbWU7XG4gICAgICAgIGNvbnN0IGJ1dHRvbkNsYXNzTmFtZSA9IHRoaXMucHJvcHMuYnV0dG9uQ2xhc3NOYW1lO1xuXG4gICAgICAgIHN3aXRjaCAodGhpcy5zdGF0ZS5waGFzZSkge1xuICAgICAgICAgICAgY2FzZSBQaGFzZS5FZGl0OlxuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxmb3JtIGNsYXNzTmFtZT17dGhpcy5wcm9wcy5jbGFzc05hbWV9IG9uU3VibWl0PXt0aGlzLm9uQ2xpY2tDaGFuZ2V9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e3Jvd0NsYXNzTmFtZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZj17ZmllbGQgPT4gdGhpc1tGSUVMRF9PTERfUEFTU1dPUkRdID0gZmllbGR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdCgnQ3VycmVudCBwYXNzd29yZCcpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5vbGRQYXNzd29yZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25DaGFuZ2VPbGRQYXNzd29yZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25WYWxpZGF0ZT17dGhpcy5vbk9sZFBhc3N3b3JkVmFsaWRhdGV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e3Jvd0NsYXNzTmFtZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPFBhc3NwaHJhc2VGaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWVsZFJlZj17ZmllbGQgPT4gdGhpc1tGSUVMRF9ORVdfUEFTU1dPUkRdID0gZmllbGR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdGQoXCJOZXcgUGFzc3dvcmRcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pblNjb3JlPXtQQVNTV09SRF9NSU5fU0NPUkV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLm5ld1Bhc3N3b3JkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvRm9jdXM9e3RoaXMucHJvcHMuYXV0b0ZvY3VzTmV3UGFzc3dvcmRJbnB1dH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25DaGFuZ2VOZXdQYXNzd29yZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25WYWxpZGF0ZT17dGhpcy5vbk5ld1Bhc3N3b3JkVmFsaWRhdGV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cIm5ldy1wYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e3Jvd0NsYXNzTmFtZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZj17ZmllbGQgPT4gdGhpc1tGSUVMRF9ORVdfUEFTU1dPUkRfQ09ORklSTV0gPSBmaWVsZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiQ29uZmlybSBwYXNzd29yZFwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUubmV3UGFzc3dvcmRDb25maXJtfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkNoYW5nZU5ld1Bhc3N3b3JkQ29uZmlybX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25WYWxpZGF0ZT17dGhpcy5vbk5ld1Bhc3N3b3JkQ29uZmlybVZhbGlkYXRlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJuZXctcGFzc3dvcmRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT17YnV0dG9uQ2xhc3NOYW1lfSBraW5kPXt0aGlzLnByb3BzLmJ1dHRvbktpbmR9IG9uQ2xpY2s9e3RoaXMub25DbGlja0NoYW5nZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLmJ1dHRvbkxhYmVsIHx8IF90KCdDaGFuZ2UgUGFzc3dvcmQnKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgY2FzZSBQaGFzZS5VcGxvYWRpbmc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPFNwaW5uZXIgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFpQkE7O0FBR0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQUVBLE1BQU1BLGtCQUFrQixHQUFHLG9CQUEzQjtBQUNBLE1BQU1DLGtCQUFrQixHQUFHLG9CQUEzQjtBQUNBLE1BQU1DLDBCQUEwQixHQUFHLDRCQUFuQztJQUVLQyxLOztXQUFBQSxLO0VBQUFBLEs7RUFBQUEsSztFQUFBQSxLO0dBQUFBLEssS0FBQUEsSzs7QUFnQ1UsTUFBTUMsY0FBTixTQUE2QkMsY0FBQSxDQUFNQyxTQUFuQyxDQUE2RDtFQVF4RUMsV0FBVyxDQUFDQyxLQUFELEVBQWdCO0lBQ3ZCLE1BQU1BLEtBQU47SUFEdUIsOERBZ0lNLE1BQVk7TUFDekNDLGNBQUEsQ0FBTUMsaUJBQU4sOERBRVEsc0VBRlIsS0FJSTtRQUNJQyxZQUFZLEVBQUVDLGdDQUFBLENBQWdCQyxHQUFoQjtNQURsQixDQUpKO0lBUUgsQ0F6STBCO0lBQUEsMkRBbUpJQyxFQUFELElBQW1EO01BQzdFLEtBQUtDLFFBQUwsQ0FBYztRQUNWQyxXQUFXLEVBQUVGLEVBQUUsQ0FBQ0csTUFBSCxDQUFVQztNQURiLENBQWQ7SUFHSCxDQXZKMEI7SUFBQSw2REF5SkssTUFBT0MsVUFBUCxJQUErRDtNQUMzRixNQUFNQyxNQUFNLEdBQUcsTUFBTSxLQUFLQyx3QkFBTCxDQUE4QkYsVUFBOUIsQ0FBckI7TUFDQSxLQUFLRyxjQUFM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