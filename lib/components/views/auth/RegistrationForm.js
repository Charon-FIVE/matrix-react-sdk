"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.PASSWORD_MIN_SCORE = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var Email = _interopRequireWildcard(require("../../../email"));

var _phonenumber = require("../../../phonenumber");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _languageHandler = require("../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _Registration = require("../../../Registration");

var _Validation = _interopRequireDefault(require("../elements/Validation"));

var _EmailField = _interopRequireDefault(require("./EmailField"));

var _PassphraseField = _interopRequireDefault(require("./PassphraseField"));

var _Field = _interopRequireDefault(require("../elements/Field"));

var _RegistrationEmailPromptDialog = _interopRequireDefault(require("../dialogs/RegistrationEmailPromptDialog"));

var _CountryDropdown = _interopRequireDefault(require("./CountryDropdown"));

var _PassphraseConfirmField = _interopRequireDefault(require("./PassphraseConfirmField"));

var _PosthogAnalytics = require("../../../PosthogAnalytics");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>
Copyright 2015, 2016, 2017, 2018, 2019, 2020 The Matrix.org Foundation C.I.C.

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
var RegistrationField;

(function (RegistrationField) {
  RegistrationField["Email"] = "field_email";
  RegistrationField["PhoneNumber"] = "field_phone_number";
  RegistrationField["Username"] = "field_username";
  RegistrationField["Password"] = "field_password";
  RegistrationField["PasswordConfirm"] = "field_password_confirm";
})(RegistrationField || (RegistrationField = {}));

var UsernameAvailableStatus;

(function (UsernameAvailableStatus) {
  UsernameAvailableStatus[UsernameAvailableStatus["Unknown"] = 0] = "Unknown";
  UsernameAvailableStatus[UsernameAvailableStatus["Available"] = 1] = "Available";
  UsernameAvailableStatus[UsernameAvailableStatus["Unavailable"] = 2] = "Unavailable";
  UsernameAvailableStatus[UsernameAvailableStatus["Error"] = 3] = "Error";
})(UsernameAvailableStatus || (UsernameAvailableStatus = {}));

const PASSWORD_MIN_SCORE = 3; // safely unguessable: moderate protection from offline slow-hash scenario.

exports.PASSWORD_MIN_SCORE = PASSWORD_MIN_SCORE;

/*
 * A pure UI component which displays a registration form.
 */
class RegistrationForm extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onSubmit", async ev => {
      ev.preventDefault();
      ev.persist();
      if (!this.props.canSubmit) return;
      const allFieldsValid = await this.verifyFieldsBeforeSubmit();

      if (!allFieldsValid) {
        return;
      }

      if (this.state.email === '') {
        if (this.showEmail()) {
          _Modal.default.createDialog(_RegistrationEmailPromptDialog.default, {
            onFinished: async (confirmed, email) => {
              if (confirmed) {
                this.setState({
                  email
                }, () => {
                  this.doSubmit(ev);
                });
              }
            }
          });
        } else {
          // user can't set an e-mail so don't prompt them to
          this.doSubmit(ev);
          return;
        }
      } else {
        this.doSubmit(ev);
      }
    });
    (0, _defineProperty2.default)(this, "onEmailChange", ev => {
      this.setState({
        email: ev.target.value.trim()
      });
    });
    (0, _defineProperty2.default)(this, "onEmailValidate", result => {
      this.markFieldValid(RegistrationField.Email, result.valid);
    });
    (0, _defineProperty2.default)(this, "validateEmailRules", (0, _Validation.default)({
      description: () => (0, _languageHandler._t)("Use an email address to recover your account"),
      hideDescriptionIfValid: true,
      rules: [{
        key: "required",

        test(_ref) {
          let {
            value,
            allowEmpty
          } = _ref;
          return allowEmpty || !this.authStepIsRequired('m.login.email.identity') || !!value;
        },

        invalid: () => (0, _languageHandler._t)("Enter email address (required on this homeserver)")
      }, {
        key: "email",
        test: _ref2 => {
          let {
            value
          } = _ref2;
          return !value || Email.looksValid(value);
        },
        invalid: () => (0, _languageHandler._t)("Doesn't look like a valid email address")
      }]
    }));
    (0, _defineProperty2.default)(this, "onPasswordChange", ev => {
      this.setState({
        password: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onPasswordValidate", result => {
      this.markFieldValid(RegistrationField.Password, result.valid);
    });
    (0, _defineProperty2.default)(this, "onPasswordConfirmChange", ev => {
      this.setState({
        passwordConfirm: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onPasswordConfirmValidate", result => {
      this.markFieldValid(RegistrationField.PasswordConfirm, result.valid);
    });
    (0, _defineProperty2.default)(this, "onPhoneCountryChange", newVal => {
      this.setState({
        phoneCountry: newVal.iso2
      });
    });
    (0, _defineProperty2.default)(this, "onPhoneNumberChange", ev => {
      this.setState({
        phoneNumber: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onPhoneNumberValidate", async fieldState => {
      const result = await this.validatePhoneNumberRules(fieldState);
      this.markFieldValid(RegistrationField.PhoneNumber, result.valid);
      return result;
    });
    (0, _defineProperty2.default)(this, "validatePhoneNumberRules", (0, _Validation.default)({
      description: () => (0, _languageHandler._t)("Other users can invite you to rooms using your contact details"),
      hideDescriptionIfValid: true,
      rules: [{
        key: "required",

        test(_ref3) {
          let {
            value,
            allowEmpty
          } = _ref3;
          return allowEmpty || !this.authStepIsRequired('m.login.msisdn') || !!value;
        },

        invalid: () => (0, _languageHandler._t)("Enter phone number (required on this homeserver)")
      }, {
        key: "email",
        test: _ref4 => {
          let {
            value
          } = _ref4;
          return !value || (0, _phonenumber.looksValid)(value);
        },
        invalid: () => (0, _languageHandler._t)("That phone number doesn't look quite right, please check and try again")
      }]
    }));
    (0, _defineProperty2.default)(this, "onUsernameChange", ev => {
      this.setState({
        username: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onUsernameValidate", async fieldState => {
      const result = await this.validateUsernameRules(fieldState);
      this.markFieldValid(RegistrationField.Username, result.valid);
      return result;
    });
    (0, _defineProperty2.default)(this, "validateUsernameRules", (0, _Validation.default)({
      description: (_, results) => {
        // omit the description if the only failing result is the `available` one as it makes no sense for it.
        if (results.every(_ref5 => {
          let {
            key,
            valid
          } = _ref5;
          return key === "available" || valid;
        })) return;
        return (0, _languageHandler._t)("Use lowercase letters, numbers, dashes and underscores only");
      },
      hideDescriptionIfValid: true,

      async deriveData(_ref6) {
        let {
          value
        } = _ref6;

        if (!value) {
          return UsernameAvailableStatus.Unknown;
        }

        try {
          const available = await this.props.matrixClient.isUsernameAvailable(value);
          return available ? UsernameAvailableStatus.Available : UsernameAvailableStatus.Unavailable;
        } catch (err) {
          return UsernameAvailableStatus.Error;
        }
      },

      rules: [{
        key: "required",
        test: _ref7 => {
          let {
            value,
            allowEmpty
          } = _ref7;
          return allowEmpty || !!value;
        },
        invalid: () => (0, _languageHandler._t)("Enter username")
      }, {
        key: "safeLocalpart",
        test: _ref8 => {
          let {
            value
          } = _ref8;
          return !value || _Registration.SAFE_LOCALPART_REGEX.test(value);
        },
        invalid: () => (0, _languageHandler._t)("Some characters not allowed")
      }, {
        key: "available",
        final: true,
        test: async (_ref9, usernameAvailable) => {
          let {
            value
          } = _ref9;

          if (!value) {
            return true;
          }

          return usernameAvailable === UsernameAvailableStatus.Available;
        },
        invalid: usernameAvailable => usernameAvailable === UsernameAvailableStatus.Error ? (0, _languageHandler._t)("Unable to check if username has been taken. Try again later.") : (0, _languageHandler._t)("Someone already has that username. Try another or if it is you, sign in below.")
      }]
    }));
    this.state = {
      fieldValid: {},
      phoneCountry: this.props.defaultPhoneCountry,
      username: this.props.defaultUsername || "",
      email: this.props.defaultEmail || "",
      phoneNumber: this.props.defaultPhoneNumber || "",
      password: this.props.defaultPassword || "",
      passwordConfirm: this.props.defaultPassword || "",
      passwordComplexity: null
    };
  }

  doSubmit(ev) {
    _PosthogAnalytics.PosthogAnalytics.instance.setAuthenticationType("Password");

    const email = this.state.email.trim();
    const promise = this.props.onRegisterClick({
      username: this.state.username.trim(),
      password: this.state.password.trim(),
      email: email,
      phoneCountry: this.state.phoneCountry,
      phoneNumber: this.state.phoneNumber
    });

    if (promise) {
      ev.target.disabled = true;
      promise.finally(function () {
        ev.target.disabled = false;
      });
    }
  }

  async verifyFieldsBeforeSubmit() {
    // Blur the active element if any, so we first run its blur validation,
    // which is less strict than the pass we're about to do below for all fields.
    const activeElement = document.activeElement;

    if (activeElement) {
      activeElement.blur();
    }

    const fieldIDsInDisplayOrder = [RegistrationField.Username, RegistrationField.Password, RegistrationField.PasswordConfirm, RegistrationField.Email, RegistrationField.PhoneNumber]; // Run all fields with stricter validation that no longer allows empty
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
  /**
   * @returns {boolean} true if all fields were valid last time they were validated.
   */


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

  markFieldValid(fieldID, valid) {
    const {
      fieldValid
    } = this.state;
    fieldValid[fieldID] = valid;
    this.setState({
      fieldValid
    });
  }

  /**
   * A step is required if all flows include that step.
   *
   * @param {string} step A stage name to check
   * @returns {boolean} Whether it is required
   */
  authStepIsRequired(step) {
    return this.props.flows.every(flow => {
      return flow.stages.includes(step);
    });
  }
  /**
   * A step is used if any flows include that step.
   *
   * @param {string} step A stage name to check
   * @returns {boolean} Whether it is used
   */


  authStepIsUsed(step) {
    return this.props.flows.some(flow => {
      return flow.stages.includes(step);
    });
  }

  showEmail() {
    if (!this.authStepIsUsed('m.login.email.identity')) {
      return false;
    }

    return true;
  }

  showPhoneNumber() {
    const threePidLogin = !_SdkConfig.default.get().disable_3pid_login;

    if (!threePidLogin || !this.authStepIsUsed('m.login.msisdn')) {
      return false;
    }

    return true;
  }

  renderEmail() {
    if (!this.showEmail()) {
      return null;
    }

    const emailLabel = this.authStepIsRequired('m.login.email.identity') ? (0, _languageHandler._td)("Email") : (0, _languageHandler._td)("Email (optional)");
    return /*#__PURE__*/_react.default.createElement(_EmailField.default, {
      fieldRef: field => this[RegistrationField.Email] = field,
      label: emailLabel,
      value: this.state.email,
      validationRules: this.validateEmailRules.bind(this),
      onChange: this.onEmailChange,
      onValidate: this.onEmailValidate
    });
  }

  renderPassword() {
    return /*#__PURE__*/_react.default.createElement(_PassphraseField.default, {
      id: "mx_RegistrationForm_password",
      fieldRef: field => this[RegistrationField.Password] = field,
      minScore: PASSWORD_MIN_SCORE,
      value: this.state.password,
      onChange: this.onPasswordChange,
      onValidate: this.onPasswordValidate
    });
  }

  renderPasswordConfirm() {
    return /*#__PURE__*/_react.default.createElement(_PassphraseConfirmField.default, {
      id: "mx_RegistrationForm_passwordConfirm",
      fieldRef: field => this[RegistrationField.PasswordConfirm] = field,
      autoComplete: "new-password",
      value: this.state.passwordConfirm,
      password: this.state.password,
      onChange: this.onPasswordConfirmChange,
      onValidate: this.onPasswordConfirmValidate
    });
  }

  renderPhoneNumber() {
    if (!this.showPhoneNumber()) {
      return null;
    }

    const phoneLabel = this.authStepIsRequired('m.login.msisdn') ? (0, _languageHandler._t)("Phone") : (0, _languageHandler._t)("Phone (optional)");

    const phoneCountry = /*#__PURE__*/_react.default.createElement(_CountryDropdown.default, {
      value: this.state.phoneCountry,
      isSmall: true,
      showPrefix: true,
      onOptionChange: this.onPhoneCountryChange
    });

    return /*#__PURE__*/_react.default.createElement(_Field.default, {
      ref: field => this[RegistrationField.PhoneNumber] = field,
      type: "text",
      label: phoneLabel,
      value: this.state.phoneNumber,
      prefixComponent: phoneCountry,
      onChange: this.onPhoneNumberChange,
      onValidate: this.onPhoneNumberValidate
    });
  }

  renderUsername() {
    return /*#__PURE__*/_react.default.createElement(_Field.default, {
      id: "mx_RegistrationForm_username",
      ref: field => this[RegistrationField.Username] = field,
      type: "text",
      autoFocus: true,
      label: (0, _languageHandler._t)("Username"),
      placeholder: (0, _languageHandler._t)("Username").toLocaleLowerCase(),
      value: this.state.username,
      onChange: this.onUsernameChange,
      onValidate: this.onUsernameValidate
    });
  }

  render() {
    const registerButton = /*#__PURE__*/_react.default.createElement("input", {
      className: "mx_Login_submit",
      type: "submit",
      value: (0, _languageHandler._t)("Register"),
      disabled: !this.props.canSubmit
    });

    let emailHelperText = null;

    if (this.showEmail()) {
      if (this.showPhoneNumber()) {
        emailHelperText = /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Add an email to be able to reset your password."), " ", (0, _languageHandler._t)("Use email or phone to optionally be discoverable by existing contacts."));
      } else {
        emailHelperText = /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Add an email to be able to reset your password."), " ", (0, _languageHandler._t)("Use email to optionally be discoverable by existing contacts."));
      }
    }

    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.onSubmit
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AuthBody_fieldRow"
    }, this.renderUsername()), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AuthBody_fieldRow"
    }, this.renderPassword(), this.renderPasswordConfirm()), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AuthBody_fieldRow"
    }, this.renderEmail(), this.renderPhoneNumber()), emailHelperText, registerButton));
  }

}

exports.default = RegistrationForm;
(0, _defineProperty2.default)(RegistrationForm, "defaultProps", {
  onValidationChange: _logger.logger.error,
  canSubmit: true
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWdpc3RyYXRpb25GaWVsZCIsIlVzZXJuYW1lQXZhaWxhYmxlU3RhdHVzIiwiUEFTU1dPUkRfTUlOX1NDT1JFIiwiUmVnaXN0cmF0aW9uRm9ybSIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJldiIsInByZXZlbnREZWZhdWx0IiwicGVyc2lzdCIsImNhblN1Ym1pdCIsImFsbEZpZWxkc1ZhbGlkIiwidmVyaWZ5RmllbGRzQmVmb3JlU3VibWl0Iiwic3RhdGUiLCJlbWFpbCIsInNob3dFbWFpbCIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwiUmVnaXN0cmF0aW9uRW1haWxQcm9tcHREaWFsb2ciLCJvbkZpbmlzaGVkIiwiY29uZmlybWVkIiwic2V0U3RhdGUiLCJkb1N1Ym1pdCIsInRhcmdldCIsInZhbHVlIiwidHJpbSIsInJlc3VsdCIsIm1hcmtGaWVsZFZhbGlkIiwiRW1haWwiLCJ2YWxpZCIsIndpdGhWYWxpZGF0aW9uIiwiZGVzY3JpcHRpb24iLCJfdCIsImhpZGVEZXNjcmlwdGlvbklmVmFsaWQiLCJydWxlcyIsImtleSIsInRlc3QiLCJhbGxvd0VtcHR5IiwiYXV0aFN0ZXBJc1JlcXVpcmVkIiwiaW52YWxpZCIsImxvb2tzVmFsaWQiLCJwYXNzd29yZCIsIlBhc3N3b3JkIiwicGFzc3dvcmRDb25maXJtIiwiUGFzc3dvcmRDb25maXJtIiwibmV3VmFsIiwicGhvbmVDb3VudHJ5IiwiaXNvMiIsInBob25lTnVtYmVyIiwiZmllbGRTdGF0ZSIsInZhbGlkYXRlUGhvbmVOdW1iZXJSdWxlcyIsIlBob25lTnVtYmVyIiwicGhvbmVOdW1iZXJMb29rc1ZhbGlkIiwidXNlcm5hbWUiLCJ2YWxpZGF0ZVVzZXJuYW1lUnVsZXMiLCJVc2VybmFtZSIsIl8iLCJyZXN1bHRzIiwiZXZlcnkiLCJkZXJpdmVEYXRhIiwiVW5rbm93biIsImF2YWlsYWJsZSIsIm1hdHJpeENsaWVudCIsImlzVXNlcm5hbWVBdmFpbGFibGUiLCJBdmFpbGFibGUiLCJVbmF2YWlsYWJsZSIsImVyciIsIkVycm9yIiwiU0FGRV9MT0NBTFBBUlRfUkVHRVgiLCJmaW5hbCIsInVzZXJuYW1lQXZhaWxhYmxlIiwiZmllbGRWYWxpZCIsImRlZmF1bHRQaG9uZUNvdW50cnkiLCJkZWZhdWx0VXNlcm5hbWUiLCJkZWZhdWx0RW1haWwiLCJkZWZhdWx0UGhvbmVOdW1iZXIiLCJkZWZhdWx0UGFzc3dvcmQiLCJwYXNzd29yZENvbXBsZXhpdHkiLCJQb3N0aG9nQW5hbHl0aWNzIiwiaW5zdGFuY2UiLCJzZXRBdXRoZW50aWNhdGlvblR5cGUiLCJwcm9taXNlIiwib25SZWdpc3RlckNsaWNrIiwiZGlzYWJsZWQiLCJmaW5hbGx5IiwiYWN0aXZlRWxlbWVudCIsImRvY3VtZW50IiwiYmx1ciIsImZpZWxkSURzSW5EaXNwbGF5T3JkZXIiLCJmaWVsZElEIiwiZmllbGQiLCJ2YWxpZGF0ZSIsIlByb21pc2UiLCJyZXNvbHZlIiwiaW52YWxpZEZpZWxkIiwiZmluZEZpcnN0SW52YWxpZEZpZWxkIiwiZm9jdXMiLCJmb2N1c2VkIiwia2V5cyIsIk9iamVjdCIsImkiLCJsZW5ndGgiLCJmaWVsZElEcyIsInN0ZXAiLCJmbG93cyIsImZsb3ciLCJzdGFnZXMiLCJpbmNsdWRlcyIsImF1dGhTdGVwSXNVc2VkIiwic29tZSIsInNob3dQaG9uZU51bWJlciIsInRocmVlUGlkTG9naW4iLCJTZGtDb25maWciLCJnZXQiLCJkaXNhYmxlXzNwaWRfbG9naW4iLCJyZW5kZXJFbWFpbCIsImVtYWlsTGFiZWwiLCJfdGQiLCJ2YWxpZGF0ZUVtYWlsUnVsZXMiLCJiaW5kIiwib25FbWFpbENoYW5nZSIsIm9uRW1haWxWYWxpZGF0ZSIsInJlbmRlclBhc3N3b3JkIiwib25QYXNzd29yZENoYW5nZSIsIm9uUGFzc3dvcmRWYWxpZGF0ZSIsInJlbmRlclBhc3N3b3JkQ29uZmlybSIsIm9uUGFzc3dvcmRDb25maXJtQ2hhbmdlIiwib25QYXNzd29yZENvbmZpcm1WYWxpZGF0ZSIsInJlbmRlclBob25lTnVtYmVyIiwicGhvbmVMYWJlbCIsIm9uUGhvbmVDb3VudHJ5Q2hhbmdlIiwib25QaG9uZU51bWJlckNoYW5nZSIsIm9uUGhvbmVOdW1iZXJWYWxpZGF0ZSIsInJlbmRlclVzZXJuYW1lIiwidG9Mb2NhbGVMb3dlckNhc2UiLCJvblVzZXJuYW1lQ2hhbmdlIiwib25Vc2VybmFtZVZhbGlkYXRlIiwicmVuZGVyIiwicmVnaXN0ZXJCdXR0b24iLCJlbWFpbEhlbHBlclRleHQiLCJvblN1Ym1pdCIsIm9uVmFsaWRhdGlvbkNoYW5nZSIsImxvZ2dlciIsImVycm9yIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvYXV0aC9SZWdpc3RyYXRpb25Gb3JtLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5Db3B5cmlnaHQgMjAxNSwgMjAxNiwgMjAxNywgMjAxOCwgMjAxOSwgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnQgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9jbGllbnQnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuXG5pbXBvcnQgKiBhcyBFbWFpbCBmcm9tICcuLi8uLi8uLi9lbWFpbCc7XG5pbXBvcnQgeyBsb29rc1ZhbGlkIGFzIHBob25lTnVtYmVyTG9va3NWYWxpZCB9IGZyb20gJy4uLy4uLy4uL3Bob25lbnVtYmVyJztcbmltcG9ydCBNb2RhbCBmcm9tICcuLi8uLi8uLi9Nb2RhbCc7XG5pbXBvcnQgeyBfdCwgX3RkIH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBTZGtDb25maWcgZnJvbSAnLi4vLi4vLi4vU2RrQ29uZmlnJztcbmltcG9ydCB7IFNBRkVfTE9DQUxQQVJUX1JFR0VYIH0gZnJvbSAnLi4vLi4vLi4vUmVnaXN0cmF0aW9uJztcbmltcG9ydCB3aXRoVmFsaWRhdGlvbiwgeyBJVmFsaWRhdGlvblJlc3VsdCB9IGZyb20gJy4uL2VsZW1lbnRzL1ZhbGlkYXRpb24nO1xuaW1wb3J0IHsgVmFsaWRhdGVkU2VydmVyQ29uZmlnIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvVmFsaWRhdGVkU2VydmVyQ29uZmlnJztcbmltcG9ydCBFbWFpbEZpZWxkIGZyb20gXCIuL0VtYWlsRmllbGRcIjtcbmltcG9ydCBQYXNzcGhyYXNlRmllbGQgZnJvbSBcIi4vUGFzc3BocmFzZUZpZWxkXCI7XG5pbXBvcnQgRmllbGQgZnJvbSAnLi4vZWxlbWVudHMvRmllbGQnO1xuaW1wb3J0IFJlZ2lzdHJhdGlvbkVtYWlsUHJvbXB0RGlhbG9nIGZyb20gJy4uL2RpYWxvZ3MvUmVnaXN0cmF0aW9uRW1haWxQcm9tcHREaWFsb2cnO1xuaW1wb3J0IENvdW50cnlEcm9wZG93biBmcm9tIFwiLi9Db3VudHJ5RHJvcGRvd25cIjtcbmltcG9ydCBQYXNzcGhyYXNlQ29uZmlybUZpZWxkIGZyb20gXCIuL1Bhc3NwaHJhc2VDb25maXJtRmllbGRcIjtcbmltcG9ydCB7IFBvc3Rob2dBbmFseXRpY3MgfSBmcm9tICcuLi8uLi8uLi9Qb3N0aG9nQW5hbHl0aWNzJztcblxuZW51bSBSZWdpc3RyYXRpb25GaWVsZCB7XG4gICAgRW1haWwgPSBcImZpZWxkX2VtYWlsXCIsXG4gICAgUGhvbmVOdW1iZXIgPSBcImZpZWxkX3Bob25lX251bWJlclwiLFxuICAgIFVzZXJuYW1lID0gXCJmaWVsZF91c2VybmFtZVwiLFxuICAgIFBhc3N3b3JkID0gXCJmaWVsZF9wYXNzd29yZFwiLFxuICAgIFBhc3N3b3JkQ29uZmlybSA9IFwiZmllbGRfcGFzc3dvcmRfY29uZmlybVwiLFxufVxuXG5lbnVtIFVzZXJuYW1lQXZhaWxhYmxlU3RhdHVzIHtcbiAgICBVbmtub3duLFxuICAgIEF2YWlsYWJsZSxcbiAgICBVbmF2YWlsYWJsZSxcbiAgICBFcnJvcixcbn1cblxuZXhwb3J0IGNvbnN0IFBBU1NXT1JEX01JTl9TQ09SRSA9IDM7IC8vIHNhZmVseSB1bmd1ZXNzYWJsZTogbW9kZXJhdGUgcHJvdGVjdGlvbiBmcm9tIG9mZmxpbmUgc2xvdy1oYXNoIHNjZW5hcmlvLlxuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICAvLyBWYWx1ZXMgcHJlLWZpbGxlZCBpbiB0aGUgaW5wdXQgYm94ZXMgd2hlbiB0aGUgY29tcG9uZW50IGxvYWRzXG4gICAgZGVmYXVsdEVtYWlsPzogc3RyaW5nO1xuICAgIGRlZmF1bHRQaG9uZUNvdW50cnk/OiBzdHJpbmc7XG4gICAgZGVmYXVsdFBob25lTnVtYmVyPzogc3RyaW5nO1xuICAgIGRlZmF1bHRVc2VybmFtZT86IHN0cmluZztcbiAgICBkZWZhdWx0UGFzc3dvcmQ/OiBzdHJpbmc7XG4gICAgZmxvd3M6IHtcbiAgICAgICAgc3RhZ2VzOiBzdHJpbmdbXTtcbiAgICB9W107XG4gICAgc2VydmVyQ29uZmlnOiBWYWxpZGF0ZWRTZXJ2ZXJDb25maWc7XG4gICAgY2FuU3VibWl0PzogYm9vbGVhbjtcbiAgICBtYXRyaXhDbGllbnQ6IE1hdHJpeENsaWVudDtcblxuICAgIG9uUmVnaXN0ZXJDbGljayhwYXJhbXM6IHtcbiAgICAgICAgdXNlcm5hbWU6IHN0cmluZztcbiAgICAgICAgcGFzc3dvcmQ6IHN0cmluZztcbiAgICAgICAgZW1haWw/OiBzdHJpbmc7XG4gICAgICAgIHBob25lQ291bnRyeT86IHN0cmluZztcbiAgICAgICAgcGhvbmVOdW1iZXI/OiBzdHJpbmc7XG4gICAgfSk6IFByb21pc2U8dm9pZD47XG4gICAgb25FZGl0U2VydmVyRGV0YWlsc0NsaWNrPygpOiB2b2lkO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICAvLyBGaWVsZCBlcnJvciBjb2RlcyBieSBmaWVsZCBJRFxuICAgIGZpZWxkVmFsaWQ6IFBhcnRpYWw8UmVjb3JkPFJlZ2lzdHJhdGlvbkZpZWxkLCBib29sZWFuPj47XG4gICAgLy8gVGhlIElTTzIgY291bnRyeSBjb2RlIHNlbGVjdGVkIGluIHRoZSBwaG9uZSBudW1iZXIgZW50cnlcbiAgICBwaG9uZUNvdW50cnk6IHN0cmluZztcbiAgICB1c2VybmFtZTogc3RyaW5nO1xuICAgIGVtYWlsOiBzdHJpbmc7XG4gICAgcGhvbmVOdW1iZXI6IHN0cmluZztcbiAgICBwYXNzd29yZDogc3RyaW5nO1xuICAgIHBhc3N3b3JkQ29uZmlybTogc3RyaW5nO1xuICAgIHBhc3N3b3JkQ29tcGxleGl0eT86IG51bWJlcjtcbn1cblxuLypcbiAqIEEgcHVyZSBVSSBjb21wb25lbnQgd2hpY2ggZGlzcGxheXMgYSByZWdpc3RyYXRpb24gZm9ybS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVnaXN0cmF0aW9uRm9ybSBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICBvblZhbGlkYXRpb25DaGFuZ2U6IGxvZ2dlci5lcnJvcixcbiAgICAgICAgY2FuU3VibWl0OiB0cnVlLFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGZpZWxkVmFsaWQ6IHt9LFxuICAgICAgICAgICAgcGhvbmVDb3VudHJ5OiB0aGlzLnByb3BzLmRlZmF1bHRQaG9uZUNvdW50cnksXG4gICAgICAgICAgICB1c2VybmFtZTogdGhpcy5wcm9wcy5kZWZhdWx0VXNlcm5hbWUgfHwgXCJcIixcbiAgICAgICAgICAgIGVtYWlsOiB0aGlzLnByb3BzLmRlZmF1bHRFbWFpbCB8fCBcIlwiLFxuICAgICAgICAgICAgcGhvbmVOdW1iZXI6IHRoaXMucHJvcHMuZGVmYXVsdFBob25lTnVtYmVyIHx8IFwiXCIsXG4gICAgICAgICAgICBwYXNzd29yZDogdGhpcy5wcm9wcy5kZWZhdWx0UGFzc3dvcmQgfHwgXCJcIixcbiAgICAgICAgICAgIHBhc3N3b3JkQ29uZmlybTogdGhpcy5wcm9wcy5kZWZhdWx0UGFzc3dvcmQgfHwgXCJcIixcbiAgICAgICAgICAgIHBhc3N3b3JkQ29tcGxleGl0eTogbnVsbCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uU3VibWl0ID0gYXN5bmMgZXYgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldi5wZXJzaXN0KCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLmNhblN1Ym1pdCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGFsbEZpZWxkc1ZhbGlkID0gYXdhaXQgdGhpcy52ZXJpZnlGaWVsZHNCZWZvcmVTdWJtaXQoKTtcbiAgICAgICAgaWYgKCFhbGxGaWVsZHNWYWxpZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZW1haWwgPT09ICcnKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zaG93RW1haWwoKSkge1xuICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhSZWdpc3RyYXRpb25FbWFpbFByb21wdERpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkOiBhc3luYyAoY29uZmlybWVkOiBib29sZWFuLCBlbWFpbD86IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbmZpcm1lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWFpbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZG9TdWJtaXQoZXYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyB1c2VyIGNhbid0IHNldCBhbiBlLW1haWwgc28gZG9uJ3QgcHJvbXB0IHRoZW0gdG9cbiAgICAgICAgICAgICAgICB0aGlzLmRvU3VibWl0KGV2KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRvU3VibWl0KGV2KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIGRvU3VibWl0KGV2KSB7XG4gICAgICAgIFBvc3Rob2dBbmFseXRpY3MuaW5zdGFuY2Uuc2V0QXV0aGVudGljYXRpb25UeXBlKFwiUGFzc3dvcmRcIik7XG5cbiAgICAgICAgY29uc3QgZW1haWwgPSB0aGlzLnN0YXRlLmVtYWlsLnRyaW0oKTtcblxuICAgICAgICBjb25zdCBwcm9taXNlID0gdGhpcy5wcm9wcy5vblJlZ2lzdGVyQ2xpY2soe1xuICAgICAgICAgICAgdXNlcm5hbWU6IHRoaXMuc3RhdGUudXNlcm5hbWUudHJpbSgpLFxuICAgICAgICAgICAgcGFzc3dvcmQ6IHRoaXMuc3RhdGUucGFzc3dvcmQudHJpbSgpLFxuICAgICAgICAgICAgZW1haWw6IGVtYWlsLFxuICAgICAgICAgICAgcGhvbmVDb3VudHJ5OiB0aGlzLnN0YXRlLnBob25lQ291bnRyeSxcbiAgICAgICAgICAgIHBob25lTnVtYmVyOiB0aGlzLnN0YXRlLnBob25lTnVtYmVyLFxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAocHJvbWlzZSkge1xuICAgICAgICAgICAgZXYudGFyZ2V0LmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHByb21pc2UuZmluYWxseShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBldi50YXJnZXQuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyB2ZXJpZnlGaWVsZHNCZWZvcmVTdWJtaXQoKSB7XG4gICAgICAgIC8vIEJsdXIgdGhlIGFjdGl2ZSBlbGVtZW50IGlmIGFueSwgc28gd2UgZmlyc3QgcnVuIGl0cyBibHVyIHZhbGlkYXRpb24sXG4gICAgICAgIC8vIHdoaWNoIGlzIGxlc3Mgc3RyaWN0IHRoYW4gdGhlIHBhc3Mgd2UncmUgYWJvdXQgdG8gZG8gYmVsb3cgZm9yIGFsbCBmaWVsZHMuXG4gICAgICAgIGNvbnN0IGFjdGl2ZUVsZW1lbnQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50IGFzIEhUTUxFbGVtZW50O1xuICAgICAgICBpZiAoYWN0aXZlRWxlbWVudCkge1xuICAgICAgICAgICAgYWN0aXZlRWxlbWVudC5ibHVyKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBmaWVsZElEc0luRGlzcGxheU9yZGVyID0gW1xuICAgICAgICAgICAgUmVnaXN0cmF0aW9uRmllbGQuVXNlcm5hbWUsXG4gICAgICAgICAgICBSZWdpc3RyYXRpb25GaWVsZC5QYXNzd29yZCxcbiAgICAgICAgICAgIFJlZ2lzdHJhdGlvbkZpZWxkLlBhc3N3b3JkQ29uZmlybSxcbiAgICAgICAgICAgIFJlZ2lzdHJhdGlvbkZpZWxkLkVtYWlsLFxuICAgICAgICAgICAgUmVnaXN0cmF0aW9uRmllbGQuUGhvbmVOdW1iZXIsXG4gICAgICAgIF07XG5cbiAgICAgICAgLy8gUnVuIGFsbCBmaWVsZHMgd2l0aCBzdHJpY3RlciB2YWxpZGF0aW9uIHRoYXQgbm8gbG9uZ2VyIGFsbG93cyBlbXB0eVxuICAgICAgICAvLyB2YWx1ZXMgZm9yIHJlcXVpcmVkIGZpZWxkcy5cbiAgICAgICAgZm9yIChjb25zdCBmaWVsZElEIG9mIGZpZWxkSURzSW5EaXNwbGF5T3JkZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpZWxkID0gdGhpc1tmaWVsZElEXTtcbiAgICAgICAgICAgIGlmICghZmllbGQpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFdlIG11c3Qgd2FpdCBmb3IgdGhlc2UgdmFsaWRhdGlvbnMgdG8gZmluaXNoIGJlZm9yZSBxdWV1ZWluZ1xuICAgICAgICAgICAgLy8gdXAgdGhlIHNldFN0YXRlIGJlbG93IHNvIG91ciBzZXRTdGF0ZSBnb2VzIGluIHRoZSBxdWV1ZSBhZnRlclxuICAgICAgICAgICAgLy8gYWxsIHRoZSBzZXRTdGF0ZXMgZnJvbSB0aGVzZSB2YWxpZGF0ZSBjYWxscyAodGhhdCdzIGhvdyB3ZVxuICAgICAgICAgICAgLy8ga25vdyB0aGV5J3ZlIGZpbmlzaGVkKS5cbiAgICAgICAgICAgIGF3YWl0IGZpZWxkLnZhbGlkYXRlKHsgYWxsb3dFbXB0eTogZmFsc2UgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBWYWxpZGF0aW9uIGFuZCBzdGF0ZSB1cGRhdGVzIGFyZSBhc3luYywgc28gd2UgbmVlZCB0byB3YWl0IGZvciB0aGVtIHRvIGNvbXBsZXRlXG4gICAgICAgIC8vIGZpcnN0LiBRdWV1ZSBhIGBzZXRTdGF0ZWAgY2FsbGJhY2sgYW5kIHdhaXQgZm9yIGl0IHRvIHJlc29sdmUuXG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlPHZvaWQ+KHJlc29sdmUgPT4gdGhpcy5zZXRTdGF0ZSh7fSwgcmVzb2x2ZSkpO1xuXG4gICAgICAgIGlmICh0aGlzLmFsbEZpZWxkc1ZhbGlkKCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaW52YWxpZEZpZWxkID0gdGhpcy5maW5kRmlyc3RJbnZhbGlkRmllbGQoZmllbGRJRHNJbkRpc3BsYXlPcmRlcik7XG5cbiAgICAgICAgaWYgKCFpbnZhbGlkRmllbGQpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRm9jdXMgdGhlIGZpcnN0IGludmFsaWQgZmllbGQgYW5kIHNob3cgZmVlZGJhY2sgaW4gdGhlIHN0cmljdGVyIG1vZGVcbiAgICAgICAgLy8gdGhhdCBubyBsb25nZXIgYWxsb3dzIGVtcHR5IHZhbHVlcyBmb3IgcmVxdWlyZWQgZmllbGRzLlxuICAgICAgICBpbnZhbGlkRmllbGQuZm9jdXMoKTtcbiAgICAgICAgaW52YWxpZEZpZWxkLnZhbGlkYXRlKHsgYWxsb3dFbXB0eTogZmFsc2UsIGZvY3VzZWQ6IHRydWUgfSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiBhbGwgZmllbGRzIHdlcmUgdmFsaWQgbGFzdCB0aW1lIHRoZXkgd2VyZSB2YWxpZGF0ZWQuXG4gICAgICovXG4gICAgcHJpdmF0ZSBhbGxGaWVsZHNWYWxpZCgpIHtcbiAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuc3RhdGUuZmllbGRWYWxpZCk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmZpZWxkVmFsaWRba2V5c1tpXV0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmaW5kRmlyc3RJbnZhbGlkRmllbGQoZmllbGRJRHM6IFJlZ2lzdHJhdGlvbkZpZWxkW10pIHtcbiAgICAgICAgZm9yIChjb25zdCBmaWVsZElEIG9mIGZpZWxkSURzKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZmllbGRWYWxpZFtmaWVsZElEXSAmJiB0aGlzW2ZpZWxkSURdKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNbZmllbGRJRF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBtYXJrRmllbGRWYWxpZChmaWVsZElEOiBSZWdpc3RyYXRpb25GaWVsZCwgdmFsaWQ6IGJvb2xlYW4pIHtcbiAgICAgICAgY29uc3QgeyBmaWVsZFZhbGlkIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgICBmaWVsZFZhbGlkW2ZpZWxkSURdID0gdmFsaWQ7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZmllbGRWYWxpZCxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkVtYWlsQ2hhbmdlID0gZXYgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGVtYWlsOiBldi50YXJnZXQudmFsdWUudHJpbSgpLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkVtYWlsVmFsaWRhdGUgPSAocmVzdWx0OiBJVmFsaWRhdGlvblJlc3VsdCkgPT4ge1xuICAgICAgICB0aGlzLm1hcmtGaWVsZFZhbGlkKFJlZ2lzdHJhdGlvbkZpZWxkLkVtYWlsLCByZXN1bHQudmFsaWQpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHZhbGlkYXRlRW1haWxSdWxlcyA9IHdpdGhWYWxpZGF0aW9uKHtcbiAgICAgICAgZGVzY3JpcHRpb246ICgpID0+IF90KFwiVXNlIGFuIGVtYWlsIGFkZHJlc3MgdG8gcmVjb3ZlciB5b3VyIGFjY291bnRcIiksXG4gICAgICAgIGhpZGVEZXNjcmlwdGlvbklmVmFsaWQ6IHRydWUsXG4gICAgICAgIHJ1bGVzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiBcInJlcXVpcmVkXCIsXG4gICAgICAgICAgICAgICAgdGVzdCh0aGlzOiBSZWdpc3RyYXRpb25Gb3JtLCB7IHZhbHVlLCBhbGxvd0VtcHR5IH0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFsbG93RW1wdHkgfHwgIXRoaXMuYXV0aFN0ZXBJc1JlcXVpcmVkKCdtLmxvZ2luLmVtYWlsLmlkZW50aXR5JykgfHwgISF2YWx1ZTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGludmFsaWQ6ICgpID0+IF90KFwiRW50ZXIgZW1haWwgYWRkcmVzcyAocmVxdWlyZWQgb24gdGhpcyBob21lc2VydmVyKVwiKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiBcImVtYWlsXCIsXG4gICAgICAgICAgICAgICAgdGVzdDogKHsgdmFsdWUgfSkgPT4gIXZhbHVlIHx8IEVtYWlsLmxvb2tzVmFsaWQodmFsdWUpLFxuICAgICAgICAgICAgICAgIGludmFsaWQ6ICgpID0+IF90KFwiRG9lc24ndCBsb29rIGxpa2UgYSB2YWxpZCBlbWFpbCBhZGRyZXNzXCIpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICB9KTtcblxuICAgIHByaXZhdGUgb25QYXNzd29yZENoYW5nZSA9IGV2ID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwYXNzd29yZDogZXYudGFyZ2V0LnZhbHVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblBhc3N3b3JkVmFsaWRhdGUgPSByZXN1bHQgPT4ge1xuICAgICAgICB0aGlzLm1hcmtGaWVsZFZhbGlkKFJlZ2lzdHJhdGlvbkZpZWxkLlBhc3N3b3JkLCByZXN1bHQudmFsaWQpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUGFzc3dvcmRDb25maXJtQ2hhbmdlID0gZXYgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHBhc3N3b3JkQ29uZmlybTogZXYudGFyZ2V0LnZhbHVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblBhc3N3b3JkQ29uZmlybVZhbGlkYXRlID0gKHJlc3VsdDogSVZhbGlkYXRpb25SZXN1bHQpID0+IHtcbiAgICAgICAgdGhpcy5tYXJrRmllbGRWYWxpZChSZWdpc3RyYXRpb25GaWVsZC5QYXNzd29yZENvbmZpcm0sIHJlc3VsdC52YWxpZCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25QaG9uZUNvdW50cnlDaGFuZ2UgPSBuZXdWYWwgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHBob25lQ291bnRyeTogbmV3VmFsLmlzbzIsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUGhvbmVOdW1iZXJDaGFuZ2UgPSBldiA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcGhvbmVOdW1iZXI6IGV2LnRhcmdldC52YWx1ZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25QaG9uZU51bWJlclZhbGlkYXRlID0gYXN5bmMgZmllbGRTdGF0ZSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMudmFsaWRhdGVQaG9uZU51bWJlclJ1bGVzKGZpZWxkU3RhdGUpO1xuICAgICAgICB0aGlzLm1hcmtGaWVsZFZhbGlkKFJlZ2lzdHJhdGlvbkZpZWxkLlBob25lTnVtYmVyLCByZXN1bHQudmFsaWQpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICBwcml2YXRlIHZhbGlkYXRlUGhvbmVOdW1iZXJSdWxlcyA9IHdpdGhWYWxpZGF0aW9uKHtcbiAgICAgICAgZGVzY3JpcHRpb246ICgpID0+IF90KFwiT3RoZXIgdXNlcnMgY2FuIGludml0ZSB5b3UgdG8gcm9vbXMgdXNpbmcgeW91ciBjb250YWN0IGRldGFpbHNcIiksXG4gICAgICAgIGhpZGVEZXNjcmlwdGlvbklmVmFsaWQ6IHRydWUsXG4gICAgICAgIHJ1bGVzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiBcInJlcXVpcmVkXCIsXG4gICAgICAgICAgICAgICAgdGVzdCh0aGlzOiBSZWdpc3RyYXRpb25Gb3JtLCB7IHZhbHVlLCBhbGxvd0VtcHR5IH0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFsbG93RW1wdHkgfHwgIXRoaXMuYXV0aFN0ZXBJc1JlcXVpcmVkKCdtLmxvZ2luLm1zaXNkbicpIHx8ICEhdmFsdWU7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpbnZhbGlkOiAoKSA9PiBfdChcIkVudGVyIHBob25lIG51bWJlciAocmVxdWlyZWQgb24gdGhpcyBob21lc2VydmVyKVwiKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiBcImVtYWlsXCIsXG4gICAgICAgICAgICAgICAgdGVzdDogKHsgdmFsdWUgfSkgPT4gIXZhbHVlIHx8IHBob25lTnVtYmVyTG9va3NWYWxpZCh2YWx1ZSksXG4gICAgICAgICAgICAgICAgaW52YWxpZDogKCkgPT4gX3QoXCJUaGF0IHBob25lIG51bWJlciBkb2Vzbid0IGxvb2sgcXVpdGUgcmlnaHQsIHBsZWFzZSBjaGVjayBhbmQgdHJ5IGFnYWluXCIpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICB9KTtcblxuICAgIHByaXZhdGUgb25Vc2VybmFtZUNoYW5nZSA9IGV2ID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB1c2VybmFtZTogZXYudGFyZ2V0LnZhbHVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblVzZXJuYW1lVmFsaWRhdGUgPSBhc3luYyBmaWVsZFN0YXRlID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy52YWxpZGF0ZVVzZXJuYW1lUnVsZXMoZmllbGRTdGF0ZSk7XG4gICAgICAgIHRoaXMubWFya0ZpZWxkVmFsaWQoUmVnaXN0cmF0aW9uRmllbGQuVXNlcm5hbWUsIHJlc3VsdC52YWxpZCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIHByaXZhdGUgdmFsaWRhdGVVc2VybmFtZVJ1bGVzID0gd2l0aFZhbGlkYXRpb248dGhpcywgVXNlcm5hbWVBdmFpbGFibGVTdGF0dXM+KHtcbiAgICAgICAgZGVzY3JpcHRpb246IChfLCByZXN1bHRzKSA9PiB7XG4gICAgICAgICAgICAvLyBvbWl0IHRoZSBkZXNjcmlwdGlvbiBpZiB0aGUgb25seSBmYWlsaW5nIHJlc3VsdCBpcyB0aGUgYGF2YWlsYWJsZWAgb25lIGFzIGl0IG1ha2VzIG5vIHNlbnNlIGZvciBpdC5cbiAgICAgICAgICAgIGlmIChyZXN1bHRzLmV2ZXJ5KCh7IGtleSwgdmFsaWQgfSkgPT4ga2V5ID09PSBcImF2YWlsYWJsZVwiIHx8IHZhbGlkKSkgcmV0dXJuO1xuICAgICAgICAgICAgcmV0dXJuIF90KFwiVXNlIGxvd2VyY2FzZSBsZXR0ZXJzLCBudW1iZXJzLCBkYXNoZXMgYW5kIHVuZGVyc2NvcmVzIG9ubHlcIik7XG4gICAgICAgIH0sXG4gICAgICAgIGhpZGVEZXNjcmlwdGlvbklmVmFsaWQ6IHRydWUsXG4gICAgICAgIGFzeW5jIGRlcml2ZURhdGEodGhpczogUmVnaXN0cmF0aW9uRm9ybSwgeyB2YWx1ZSB9KSB7XG4gICAgICAgICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFVzZXJuYW1lQXZhaWxhYmxlU3RhdHVzLlVua25vd247XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXZhaWxhYmxlID0gYXdhaXQgdGhpcy5wcm9wcy5tYXRyaXhDbGllbnQuaXNVc2VybmFtZUF2YWlsYWJsZSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF2YWlsYWJsZSA/IFVzZXJuYW1lQXZhaWxhYmxlU3RhdHVzLkF2YWlsYWJsZSA6IFVzZXJuYW1lQXZhaWxhYmxlU3RhdHVzLlVuYXZhaWxhYmxlO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFVzZXJuYW1lQXZhaWxhYmxlU3RhdHVzLkVycm9yO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBydWxlczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogXCJyZXF1aXJlZFwiLFxuICAgICAgICAgICAgICAgIHRlc3Q6ICh7IHZhbHVlLCBhbGxvd0VtcHR5IH0pID0+IGFsbG93RW1wdHkgfHwgISF2YWx1ZSxcbiAgICAgICAgICAgICAgICBpbnZhbGlkOiAoKSA9PiBfdChcIkVudGVyIHVzZXJuYW1lXCIpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwic2FmZUxvY2FscGFydFwiLFxuICAgICAgICAgICAgICAgIHRlc3Q6ICh7IHZhbHVlIH0pID0+ICF2YWx1ZSB8fCBTQUZFX0xPQ0FMUEFSVF9SRUdFWC50ZXN0KHZhbHVlKSxcbiAgICAgICAgICAgICAgICBpbnZhbGlkOiAoKSA9PiBfdChcIlNvbWUgY2hhcmFjdGVycyBub3QgYWxsb3dlZFwiKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiBcImF2YWlsYWJsZVwiLFxuICAgICAgICAgICAgICAgIGZpbmFsOiB0cnVlLFxuICAgICAgICAgICAgICAgIHRlc3Q6IGFzeW5jICh7IHZhbHVlIH0sIHVzZXJuYW1lQXZhaWxhYmxlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVzZXJuYW1lQXZhaWxhYmxlID09PSBVc2VybmFtZUF2YWlsYWJsZVN0YXR1cy5BdmFpbGFibGU7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpbnZhbGlkOiAodXNlcm5hbWVBdmFpbGFibGUpID0+IHVzZXJuYW1lQXZhaWxhYmxlID09PSBVc2VybmFtZUF2YWlsYWJsZVN0YXR1cy5FcnJvclxuICAgICAgICAgICAgICAgICAgICA/IF90KFwiVW5hYmxlIHRvIGNoZWNrIGlmIHVzZXJuYW1lIGhhcyBiZWVuIHRha2VuLiBUcnkgYWdhaW4gbGF0ZXIuXCIpXG4gICAgICAgICAgICAgICAgICAgIDogX3QoXCJTb21lb25lIGFscmVhZHkgaGFzIHRoYXQgdXNlcm5hbWUuIFRyeSBhbm90aGVyIG9yIGlmIGl0IGlzIHlvdSwgc2lnbiBpbiBiZWxvdy5cIiksXG4gICAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogQSBzdGVwIGlzIHJlcXVpcmVkIGlmIGFsbCBmbG93cyBpbmNsdWRlIHRoYXQgc3RlcC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdGVwIEEgc3RhZ2UgbmFtZSB0byBjaGVja1xuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBXaGV0aGVyIGl0IGlzIHJlcXVpcmVkXG4gICAgICovXG4gICAgcHJpdmF0ZSBhdXRoU3RlcElzUmVxdWlyZWQoc3RlcDogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLmZsb3dzLmV2ZXJ5KChmbG93KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZmxvdy5zdGFnZXMuaW5jbHVkZXMoc3RlcCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEEgc3RlcCBpcyB1c2VkIGlmIGFueSBmbG93cyBpbmNsdWRlIHRoYXQgc3RlcC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdGVwIEEgc3RhZ2UgbmFtZSB0byBjaGVja1xuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBXaGV0aGVyIGl0IGlzIHVzZWRcbiAgICAgKi9cbiAgICBwcml2YXRlIGF1dGhTdGVwSXNVc2VkKHN0ZXA6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5mbG93cy5zb21lKChmbG93KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZmxvdy5zdGFnZXMuaW5jbHVkZXMoc3RlcCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2hvd0VtYWlsKCkge1xuICAgICAgICBpZiAoIXRoaXMuYXV0aFN0ZXBJc1VzZWQoJ20ubG9naW4uZW1haWwuaWRlbnRpdHknKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2hvd1Bob25lTnVtYmVyKCkge1xuICAgICAgICBjb25zdCB0aHJlZVBpZExvZ2luID0gIVNka0NvbmZpZy5nZXQoKS5kaXNhYmxlXzNwaWRfbG9naW47XG4gICAgICAgIGlmICghdGhyZWVQaWRMb2dpbiB8fCAhdGhpcy5hdXRoU3RlcElzVXNlZCgnbS5sb2dpbi5tc2lzZG4nKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyRW1haWwoKSB7XG4gICAgICAgIGlmICghdGhpcy5zaG93RW1haWwoKSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZW1haWxMYWJlbCA9IHRoaXMuYXV0aFN0ZXBJc1JlcXVpcmVkKCdtLmxvZ2luLmVtYWlsLmlkZW50aXR5JykgP1xuICAgICAgICAgICAgX3RkKFwiRW1haWxcIikgOlxuICAgICAgICAgICAgX3RkKFwiRW1haWwgKG9wdGlvbmFsKVwiKTtcbiAgICAgICAgcmV0dXJuIDxFbWFpbEZpZWxkXG4gICAgICAgICAgICBmaWVsZFJlZj17ZmllbGQgPT4gdGhpc1tSZWdpc3RyYXRpb25GaWVsZC5FbWFpbF0gPSBmaWVsZH1cbiAgICAgICAgICAgIGxhYmVsPXtlbWFpbExhYmVsfVxuICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUuZW1haWx9XG4gICAgICAgICAgICB2YWxpZGF0aW9uUnVsZXM9e3RoaXMudmFsaWRhdGVFbWFpbFJ1bGVzLmJpbmQodGhpcyl9XG4gICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkVtYWlsQ2hhbmdlfVxuICAgICAgICAgICAgb25WYWxpZGF0ZT17dGhpcy5vbkVtYWlsVmFsaWRhdGV9XG4gICAgICAgIC8+O1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyUGFzc3dvcmQoKSB7XG4gICAgICAgIHJldHVybiA8UGFzc3BocmFzZUZpZWxkXG4gICAgICAgICAgICBpZD1cIm14X1JlZ2lzdHJhdGlvbkZvcm1fcGFzc3dvcmRcIlxuICAgICAgICAgICAgZmllbGRSZWY9e2ZpZWxkID0+IHRoaXNbUmVnaXN0cmF0aW9uRmllbGQuUGFzc3dvcmRdID0gZmllbGR9XG4gICAgICAgICAgICBtaW5TY29yZT17UEFTU1dPUkRfTUlOX1NDT1JFfVxuICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUucGFzc3dvcmR9XG4gICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblBhc3N3b3JkQ2hhbmdlfVxuICAgICAgICAgICAgb25WYWxpZGF0ZT17dGhpcy5vblBhc3N3b3JkVmFsaWRhdGV9XG4gICAgICAgIC8+O1xuICAgIH1cblxuICAgIHJlbmRlclBhc3N3b3JkQ29uZmlybSgpIHtcbiAgICAgICAgcmV0dXJuIDxQYXNzcGhyYXNlQ29uZmlybUZpZWxkXG4gICAgICAgICAgICBpZD1cIm14X1JlZ2lzdHJhdGlvbkZvcm1fcGFzc3dvcmRDb25maXJtXCJcbiAgICAgICAgICAgIGZpZWxkUmVmPXtmaWVsZCA9PiB0aGlzW1JlZ2lzdHJhdGlvbkZpZWxkLlBhc3N3b3JkQ29uZmlybV0gPSBmaWVsZH1cbiAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cIm5ldy1wYXNzd29yZFwiXG4gICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5wYXNzd29yZENvbmZpcm19XG4gICAgICAgICAgICBwYXNzd29yZD17dGhpcy5zdGF0ZS5wYXNzd29yZH1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uUGFzc3dvcmRDb25maXJtQ2hhbmdlfVxuICAgICAgICAgICAgb25WYWxpZGF0ZT17dGhpcy5vblBhc3N3b3JkQ29uZmlybVZhbGlkYXRlfVxuICAgICAgICAvPjtcbiAgICB9XG5cbiAgICByZW5kZXJQaG9uZU51bWJlcigpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNob3dQaG9uZU51bWJlcigpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwaG9uZUxhYmVsID0gdGhpcy5hdXRoU3RlcElzUmVxdWlyZWQoJ20ubG9naW4ubXNpc2RuJykgP1xuICAgICAgICAgICAgX3QoXCJQaG9uZVwiKSA6XG4gICAgICAgICAgICBfdChcIlBob25lIChvcHRpb25hbClcIik7XG4gICAgICAgIGNvbnN0IHBob25lQ291bnRyeSA9IDxDb3VudHJ5RHJvcGRvd25cbiAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnBob25lQ291bnRyeX1cbiAgICAgICAgICAgIGlzU21hbGw9e3RydWV9XG4gICAgICAgICAgICBzaG93UHJlZml4PXt0cnVlfVxuICAgICAgICAgICAgb25PcHRpb25DaGFuZ2U9e3RoaXMub25QaG9uZUNvdW50cnlDaGFuZ2V9XG4gICAgICAgIC8+O1xuICAgICAgICByZXR1cm4gPEZpZWxkXG4gICAgICAgICAgICByZWY9e2ZpZWxkID0+IHRoaXNbUmVnaXN0cmF0aW9uRmllbGQuUGhvbmVOdW1iZXJdID0gZmllbGR9XG4gICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICBsYWJlbD17cGhvbmVMYWJlbH1cbiAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnBob25lTnVtYmVyfVxuICAgICAgICAgICAgcHJlZml4Q29tcG9uZW50PXtwaG9uZUNvdW50cnl9XG4gICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblBob25lTnVtYmVyQ2hhbmdlfVxuICAgICAgICAgICAgb25WYWxpZGF0ZT17dGhpcy5vblBob25lTnVtYmVyVmFsaWRhdGV9XG4gICAgICAgIC8+O1xuICAgIH1cblxuICAgIHJlbmRlclVzZXJuYW1lKCkge1xuICAgICAgICByZXR1cm4gPEZpZWxkXG4gICAgICAgICAgICBpZD1cIm14X1JlZ2lzdHJhdGlvbkZvcm1fdXNlcm5hbWVcIlxuICAgICAgICAgICAgcmVmPXtmaWVsZCA9PiB0aGlzW1JlZ2lzdHJhdGlvbkZpZWxkLlVzZXJuYW1lXSA9IGZpZWxkfVxuICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgYXV0b0ZvY3VzPXt0cnVlfVxuICAgICAgICAgICAgbGFiZWw9e190KFwiVXNlcm5hbWVcIil9XG4gICAgICAgICAgICBwbGFjZWhvbGRlcj17X3QoXCJVc2VybmFtZVwiKS50b0xvY2FsZUxvd2VyQ2FzZSgpfVxuICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUudXNlcm5hbWV9XG4gICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblVzZXJuYW1lQ2hhbmdlfVxuICAgICAgICAgICAgb25WYWxpZGF0ZT17dGhpcy5vblVzZXJuYW1lVmFsaWRhdGV9XG4gICAgICAgIC8+O1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgcmVnaXN0ZXJCdXR0b24gPSAoXG4gICAgICAgICAgICA8aW5wdXQgY2xhc3NOYW1lPVwibXhfTG9naW5fc3VibWl0XCIgdHlwZT1cInN1Ym1pdFwiIHZhbHVlPXtfdChcIlJlZ2lzdGVyXCIpfSBkaXNhYmxlZD17IXRoaXMucHJvcHMuY2FuU3VibWl0fSAvPlxuICAgICAgICApO1xuXG4gICAgICAgIGxldCBlbWFpbEhlbHBlclRleHQgPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5zaG93RW1haWwoKSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2hvd1Bob25lTnVtYmVyKCkpIHtcbiAgICAgICAgICAgICAgICBlbWFpbEhlbHBlclRleHQgPSA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdChcIkFkZCBhbiBlbWFpbCB0byBiZSBhYmxlIHRvIHJlc2V0IHlvdXIgcGFzc3dvcmQuXCIpXG4gICAgICAgICAgICAgICAgICAgIH0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgX3QoXCJVc2UgZW1haWwgb3IgcGhvbmUgdG8gb3B0aW9uYWxseSBiZSBkaXNjb3ZlcmFibGUgYnkgZXhpc3RpbmcgY29udGFjdHMuXCIpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVtYWlsSGVscGVyVGV4dCA9IDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90KFwiQWRkIGFuIGVtYWlsIHRvIGJlIGFibGUgdG8gcmVzZXQgeW91ciBwYXNzd29yZC5cIilcbiAgICAgICAgICAgICAgICAgICAgfSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdChcIlVzZSBlbWFpbCB0byBvcHRpb25hbGx5IGJlIGRpc2NvdmVyYWJsZSBieSBleGlzdGluZyBjb250YWN0cy5cIilcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxmb3JtIG9uU3VibWl0PXt0aGlzLm9uU3VibWl0fT5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9BdXRoQm9keV9maWVsZFJvd1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnJlbmRlclVzZXJuYW1lKCkgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9BdXRoQm9keV9maWVsZFJvd1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnJlbmRlclBhc3N3b3JkKCkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnJlbmRlclBhc3N3b3JkQ29uZmlybSgpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQXV0aEJvZHlfZmllbGRSb3dcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5yZW5kZXJFbWFpbCgpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5yZW5kZXJQaG9uZU51bWJlcigpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIHsgZW1haWxIZWxwZXJUZXh0IH1cbiAgICAgICAgICAgICAgICAgICAgeyByZWdpc3RlckJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWlCQTs7QUFFQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBc0JLQSxpQjs7V0FBQUEsaUI7RUFBQUEsaUI7RUFBQUEsaUI7RUFBQUEsaUI7RUFBQUEsaUI7RUFBQUEsaUI7R0FBQUEsaUIsS0FBQUEsaUI7O0lBUUFDLHVCOztXQUFBQSx1QjtFQUFBQSx1QixDQUFBQSx1QjtFQUFBQSx1QixDQUFBQSx1QjtFQUFBQSx1QixDQUFBQSx1QjtFQUFBQSx1QixDQUFBQSx1QjtHQUFBQSx1QixLQUFBQSx1Qjs7QUFPRSxNQUFNQyxrQkFBa0IsR0FBRyxDQUEzQixDLENBQThCOzs7O0FBdUNyQztBQUNBO0FBQ0E7QUFDZSxNQUFNQyxnQkFBTixTQUErQkMsY0FBQSxDQUFNQyxhQUFyQyxDQUFtRTtFQU05RUMsV0FBVyxDQUFDQyxLQUFELEVBQVE7SUFDZixNQUFNQSxLQUFOO0lBRGUsZ0RBZUEsTUFBTUMsRUFBTixJQUFZO01BQzNCQSxFQUFFLENBQUNDLGNBQUg7TUFDQUQsRUFBRSxDQUFDRSxPQUFIO01BRUEsSUFBSSxDQUFDLEtBQUtILEtBQUwsQ0FBV0ksU0FBaEIsRUFBMkI7TUFFM0IsTUFBTUMsY0FBYyxHQUFHLE1BQU0sS0FBS0Msd0JBQUwsRUFBN0I7O01BQ0EsSUFBSSxDQUFDRCxj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