"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _languageHandler = require("../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _Validation = _interopRequireDefault(require("../elements/Validation"));

var _Field = _interopRequireDefault(require("../elements/Field"));

var _CountryDropdown = _interopRequireDefault(require("./CountryDropdown"));

var _EmailField = _interopRequireDefault(require("./EmailField"));

/*
Copyright 2015, 2016, 2017, 2019 The Matrix.org Foundation C.I.C.

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
// For validating phone numbers without country codes
const PHONE_NUMBER_REGEX = /^[0-9()\-\s]*$/;
var LoginField;
/*
 * A pure UI component which displays a username/password form.
 * The email/username/phone fields are fully-controlled, the password field is not.
 */

(function (LoginField) {
  LoginField["Email"] = "login_field_email";
  LoginField["MatrixId"] = "login_field_mxid";
  LoginField["Phone"] = "login_field_phone";
  LoginField["Password"] = "login_field_phone";
})(LoginField || (LoginField = {}));

class PasswordLogin extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onForgotPasswordClick", ev => {
      ev.preventDefault();
      ev.stopPropagation();
      this.props.onForgotPasswordClick();
    });
    (0, _defineProperty2.default)(this, "onSubmitForm", async ev => {
      ev.preventDefault();
      const allFieldsValid = await this.verifyFieldsBeforeSubmit();

      if (!allFieldsValid) {
        return;
      }

      let username = ''; // XXX: Synapse breaks if you send null here:

      let phoneCountry = null;
      let phoneNumber = null;

      switch (this.state.loginType) {
        case LoginField.Email:
        case LoginField.MatrixId:
          username = this.props.username;
          break;

        case LoginField.Phone:
          phoneCountry = this.props.phoneCountry;
          phoneNumber = this.props.phoneNumber;
          break;
      }

      this.props.onSubmit(username, phoneCountry, phoneNumber, this.state.password);
    });
    (0, _defineProperty2.default)(this, "onUsernameChanged", ev => {
      this.props.onUsernameChanged(ev.target.value);
    });
    (0, _defineProperty2.default)(this, "onUsernameBlur", ev => {
      this.props.onUsernameBlur(ev.target.value);
    });
    (0, _defineProperty2.default)(this, "onLoginTypeChange", ev => {
      const loginType = ev.target.value;
      this.setState({
        loginType
      });
      this.props.onUsernameChanged(""); // Reset because email and username use the same state
    });
    (0, _defineProperty2.default)(this, "onPhoneCountryChanged", country => {
      this.props.onPhoneCountryChanged(country.iso2);
    });
    (0, _defineProperty2.default)(this, "onPhoneNumberChanged", ev => {
      this.props.onPhoneNumberChanged(ev.target.value);
    });
    (0, _defineProperty2.default)(this, "onPasswordChanged", ev => {
      this.setState({
        password: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "validateUsernameRules", (0, _Validation.default)({
      rules: [{
        key: "required",

        test(_ref) {
          let {
            value,
            allowEmpty
          } = _ref;
          return allowEmpty || !!value;
        },

        invalid: () => (0, _languageHandler._t)("Enter username")
      }]
    }));
    (0, _defineProperty2.default)(this, "onUsernameValidate", async fieldState => {
      const result = await this.validateUsernameRules(fieldState);
      this.markFieldValid(LoginField.MatrixId, result.valid);
      return result;
    });
    (0, _defineProperty2.default)(this, "onEmailValidate", result => {
      this.markFieldValid(LoginField.Email, result.valid);
    });
    (0, _defineProperty2.default)(this, "validatePhoneNumberRules", (0, _Validation.default)({
      rules: [{
        key: "required",

        test(_ref2) {
          let {
            value,
            allowEmpty
          } = _ref2;
          return allowEmpty || !!value;
        },

        invalid: () => (0, _languageHandler._t)("Enter phone number")
      }, {
        key: "number",
        test: _ref3 => {
          let {
            value
          } = _ref3;
          return !value || PHONE_NUMBER_REGEX.test(value);
        },
        invalid: () => (0, _languageHandler._t)("That phone number doesn't look quite right, please check and try again")
      }]
    }));
    (0, _defineProperty2.default)(this, "onPhoneNumberValidate", async fieldState => {
      const result = await this.validatePhoneNumberRules(fieldState);
      this.markFieldValid(LoginField.Password, result.valid);
      return result;
    });
    (0, _defineProperty2.default)(this, "validatePasswordRules", (0, _Validation.default)({
      rules: [{
        key: "required",

        test(_ref4) {
          let {
            value,
            allowEmpty
          } = _ref4;
          return allowEmpty || !!value;
        },

        invalid: () => (0, _languageHandler._t)("Enter password")
      }]
    }));
    (0, _defineProperty2.default)(this, "onPasswordValidate", async fieldState => {
      const result = await this.validatePasswordRules(fieldState);
      this.markFieldValid(LoginField.Password, result.valid);
      return result;
    });
    this.state = {
      // Field error codes by field ID
      fieldValid: {},
      loginType: LoginField.MatrixId,
      password: ""
    };
  }

  async verifyFieldsBeforeSubmit() {
    // Blur the active element if any, so we first run its blur validation,
    // which is less strict than the pass we're about to do below for all fields.
    const activeElement = document.activeElement;

    if (activeElement) {
      activeElement.blur();
    }

    const fieldIDsInDisplayOrder = [this.state.loginType, LoginField.Password]; // Run all fields with stricter validation that no longer allows empty
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

  markFieldValid(fieldID, valid) {
    const {
      fieldValid
    } = this.state;
    fieldValid[fieldID] = valid;
    this.setState({
      fieldValid
    });
  }

  renderLoginField(loginType, autoFocus) {
    const classes = {
      error: false
    };

    switch (loginType) {
      case LoginField.Email:
        classes.error = this.props.loginIncorrect && !this.props.username;
        return /*#__PURE__*/_react.default.createElement(_EmailField.default, {
          id: "mx_LoginForm_email",
          className: (0, _classnames.default)(classes),
          name: "username" // make it a little easier for browser's remember-password
          ,
          autoComplete: "email",
          type: "email",
          key: "email_input",
          placeholder: "joe@example.com",
          value: this.props.username,
          onChange: this.onUsernameChanged,
          onBlur: this.onUsernameBlur,
          disabled: this.props.busy,
          autoFocus: autoFocus,
          onValidate: this.onEmailValidate,
          fieldRef: field => this[LoginField.Email] = field
        });

      case LoginField.MatrixId:
        classes.error = this.props.loginIncorrect && !this.props.username;
        return /*#__PURE__*/_react.default.createElement(_Field.default, {
          id: "mx_LoginForm_username",
          className: (0, _classnames.default)(classes),
          name: "username" // make it a little easier for browser's remember-password
          ,
          autoComplete: "username",
          key: "username_input",
          type: "text",
          label: (0, _languageHandler._t)("Username"),
          placeholder: (0, _languageHandler._t)("Username").toLocaleLowerCase(),
          value: this.props.username,
          onChange: this.onUsernameChanged,
          onBlur: this.onUsernameBlur,
          disabled: this.props.busy,
          autoFocus: autoFocus,
          onValidate: this.onUsernameValidate,
          ref: field => this[LoginField.MatrixId] = field
        });

      case LoginField.Phone:
        {
          classes.error = this.props.loginIncorrect && !this.props.phoneNumber;

          const phoneCountry = /*#__PURE__*/_react.default.createElement(_CountryDropdown.default, {
            value: this.props.phoneCountry,
            isSmall: true,
            showPrefix: true,
            onOptionChange: this.onPhoneCountryChanged
          });

          return /*#__PURE__*/_react.default.createElement(_Field.default, {
            id: "mx_LoginForm_phone",
            className: (0, _classnames.default)(classes),
            name: "phoneNumber",
            autoComplete: "tel-national",
            key: "phone_input",
            type: "text",
            label: (0, _languageHandler._t)("Phone"),
            value: this.props.phoneNumber,
            prefixComponent: phoneCountry,
            onChange: this.onPhoneNumberChanged,
            disabled: this.props.busy,
            autoFocus: autoFocus,
            onValidate: this.onPhoneNumberValidate,
            ref: field => this[LoginField.Password] = field
          });
        }
    }
  }

  isLoginEmpty() {
    switch (this.state.loginType) {
      case LoginField.Email:
      case LoginField.MatrixId:
        return !this.props.username;

      case LoginField.Phone:
        return !this.props.phoneCountry || !this.props.phoneNumber;
    }
  }

  render() {
    let forgotPasswordJsx;

    if (this.props.onForgotPasswordClick) {
      forgotPasswordJsx = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_Login_forgot",
        disabled: this.props.busy,
        kind: "link",
        onClick: this.onForgotPasswordClick
      }, (0, _languageHandler._t)("Forgot password?"));
    }

    const pwFieldClass = (0, _classnames.default)({
      error: this.props.loginIncorrect && !this.isLoginEmpty() // only error password if error isn't top field

    }); // If login is empty, autoFocus login, otherwise autoFocus password.
    // this is for when auto server discovery remounts us when the user tries to tab from username to password

    const autoFocusPassword = !this.isLoginEmpty();
    const loginField = this.renderLoginField(this.state.loginType, !autoFocusPassword);
    let loginType;

    if (!_SdkConfig.default.get().disable_3pid_login) {
      loginType = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Login_type_container"
      }, /*#__PURE__*/_react.default.createElement("label", {
        className: "mx_Login_type_label"
      }, (0, _languageHandler._t)('Sign in with')), /*#__PURE__*/_react.default.createElement(_Field.default, {
        element: "select",
        value: this.state.loginType,
        onChange: this.onLoginTypeChange,
        disabled: this.props.busy
      }, /*#__PURE__*/_react.default.createElement("option", {
        key: LoginField.MatrixId,
        value: LoginField.MatrixId
      }, (0, _languageHandler._t)('Username')), /*#__PURE__*/_react.default.createElement("option", {
        key: LoginField.Email,
        value: LoginField.Email
      }, (0, _languageHandler._t)('Email address')), /*#__PURE__*/_react.default.createElement("option", {
        key: LoginField.Password,
        value: LoginField.Password
      }, (0, _languageHandler._t)('Phone'))));
    }

    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.onSubmitForm
    }, loginType, loginField, /*#__PURE__*/_react.default.createElement(_Field.default, {
      id: "mx_LoginForm_password",
      className: pwFieldClass,
      autoComplete: "current-password",
      type: "password",
      name: "password",
      label: (0, _languageHandler._t)('Password'),
      value: this.state.password,
      onChange: this.onPasswordChanged,
      disabled: this.props.busy,
      autoFocus: autoFocusPassword,
      onValidate: this.onPasswordValidate,
      ref: field => this[LoginField.Password] = field
    }), forgotPasswordJsx, !this.props.busy && /*#__PURE__*/_react.default.createElement("input", {
      className: "mx_Login_submit",
      type: "submit",
      value: (0, _languageHandler._t)('Sign in'),
      disabled: this.props.disableSubmit
    })));
  }

}

exports.default = PasswordLogin;
(0, _defineProperty2.default)(PasswordLogin, "defaultProps", {
  onUsernameChanged: function () {},
  onUsernameBlur: function () {},
  onPhoneCountryChanged: function () {},
  onPhoneNumberChanged: function () {},
  loginIncorrect: false,
  disableSubmit: false
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQSE9ORV9OVU1CRVJfUkVHRVgiLCJMb2dpbkZpZWxkIiwiUGFzc3dvcmRMb2dpbiIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJldiIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwib25Gb3Jnb3RQYXNzd29yZENsaWNrIiwiYWxsRmllbGRzVmFsaWQiLCJ2ZXJpZnlGaWVsZHNCZWZvcmVTdWJtaXQiLCJ1c2VybmFtZSIsInBob25lQ291bnRyeSIsInBob25lTnVtYmVyIiwic3RhdGUiLCJsb2dpblR5cGUiLCJFbWFpbCIsIk1hdHJpeElkIiwiUGhvbmUiLCJvblN1Ym1pdCIsInBhc3N3b3JkIiwib25Vc2VybmFtZUNoYW5nZWQiLCJ0YXJnZXQiLCJ2YWx1ZSIsIm9uVXNlcm5hbWVCbHVyIiwic2V0U3RhdGUiLCJjb3VudHJ5Iiwib25QaG9uZUNvdW50cnlDaGFuZ2VkIiwiaXNvMiIsIm9uUGhvbmVOdW1iZXJDaGFuZ2VkIiwid2l0aFZhbGlkYXRpb24iLCJydWxlcyIsImtleSIsInRlc3QiLCJhbGxvd0VtcHR5IiwiaW52YWxpZCIsIl90IiwiZmllbGRTdGF0ZSIsInJlc3VsdCIsInZhbGlkYXRlVXNlcm5hbWVSdWxlcyIsIm1hcmtGaWVsZFZhbGlkIiwidmFsaWQiLCJ2YWxpZGF0ZVBob25lTnVtYmVyUnVsZXMiLCJQYXNzd29yZCIsInZhbGlkYXRlUGFzc3dvcmRSdWxlcyIsImZpZWxkVmFsaWQiLCJhY3RpdmVFbGVtZW50IiwiZG9jdW1lbnQiLCJibHVyIiwiZmllbGRJRHNJbkRpc3BsYXlPcmRlciIsImZpZWxkSUQiLCJmaWVsZCIsInZhbGlkYXRlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJpbnZhbGlkRmllbGQiLCJmaW5kRmlyc3RJbnZhbGlkRmllbGQiLCJmb2N1cyIsImZvY3VzZWQiLCJrZXlzIiwiT2JqZWN0IiwiaSIsImxlbmd0aCIsImZpZWxkSURzIiwicmVuZGVyTG9naW5GaWVsZCIsImF1dG9Gb2N1cyIsImNsYXNzZXMiLCJlcnJvciIsImxvZ2luSW5jb3JyZWN0IiwiY2xhc3NOYW1lcyIsImJ1c3kiLCJvbkVtYWlsVmFsaWRhdGUiLCJ0b0xvY2FsZUxvd2VyQ2FzZSIsIm9uVXNlcm5hbWVWYWxpZGF0ZSIsIm9uUGhvbmVOdW1iZXJWYWxpZGF0ZSIsImlzTG9naW5FbXB0eSIsInJlbmRlciIsImZvcmdvdFBhc3N3b3JkSnN4IiwicHdGaWVsZENsYXNzIiwiYXV0b0ZvY3VzUGFzc3dvcmQiLCJsb2dpbkZpZWxkIiwiU2RrQ29uZmlnIiwiZ2V0IiwiZGlzYWJsZV8zcGlkX2xvZ2luIiwib25Mb2dpblR5cGVDaGFuZ2UiLCJvblN1Ym1pdEZvcm0iLCJvblBhc3N3b3JkQ2hhbmdlZCIsIm9uUGFzc3dvcmRWYWxpZGF0ZSIsImRpc2FibGVTdWJtaXQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9hdXRoL1Bhc3N3b3JkTG9naW4udHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiwgMjAxNywgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcblxuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tICcuLi8uLi8uLi9TZGtDb25maWcnO1xuaW1wb3J0IHsgVmFsaWRhdGVkU2VydmVyQ29uZmlnIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvVmFsaWRhdGVkU2VydmVyQ29uZmlnJztcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgd2l0aFZhbGlkYXRpb24sIHsgSVZhbGlkYXRpb25SZXN1bHQgfSBmcm9tIFwiLi4vZWxlbWVudHMvVmFsaWRhdGlvblwiO1xuaW1wb3J0IEZpZWxkIGZyb20gXCIuLi9lbGVtZW50cy9GaWVsZFwiO1xuaW1wb3J0IENvdW50cnlEcm9wZG93biBmcm9tIFwiLi9Db3VudHJ5RHJvcGRvd25cIjtcbmltcG9ydCBFbWFpbEZpZWxkIGZyb20gXCIuL0VtYWlsRmllbGRcIjtcblxuLy8gRm9yIHZhbGlkYXRpbmcgcGhvbmUgbnVtYmVycyB3aXRob3V0IGNvdW50cnkgY29kZXNcbmNvbnN0IFBIT05FX05VTUJFUl9SRUdFWCA9IC9eWzAtOSgpXFwtXFxzXSokLztcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgdXNlcm5hbWU6IHN0cmluZzsgLy8gYWxzbyB1c2VkIGZvciBlbWFpbCBhZGRyZXNzXG4gICAgcGhvbmVDb3VudHJ5OiBzdHJpbmc7XG4gICAgcGhvbmVOdW1iZXI6IHN0cmluZztcblxuICAgIHNlcnZlckNvbmZpZzogVmFsaWRhdGVkU2VydmVyQ29uZmlnO1xuICAgIGxvZ2luSW5jb3JyZWN0PzogYm9vbGVhbjtcbiAgICBkaXNhYmxlU3VibWl0PzogYm9vbGVhbjtcbiAgICBidXN5PzogYm9vbGVhbjtcblxuICAgIG9uU3VibWl0KHVzZXJuYW1lOiBzdHJpbmcsIHBob25lQ291bnRyeTogdm9pZCwgcGhvbmVOdW1iZXI6IHZvaWQsIHBhc3N3b3JkOiBzdHJpbmcpOiB2b2lkO1xuICAgIG9uU3VibWl0KHVzZXJuYW1lOiB2b2lkLCBwaG9uZUNvdW50cnk6IHN0cmluZywgcGhvbmVOdW1iZXI6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZyk6IHZvaWQ7XG4gICAgb25Vc2VybmFtZUNoYW5nZWQ/KHVzZXJuYW1lOiBzdHJpbmcpOiB2b2lkO1xuICAgIG9uVXNlcm5hbWVCbHVyPyh1c2VybmFtZTogc3RyaW5nKTogdm9pZDtcbiAgICBvblBob25lQ291bnRyeUNoYW5nZWQ/KHBob25lQ291bnRyeTogc3RyaW5nKTogdm9pZDtcbiAgICBvblBob25lTnVtYmVyQ2hhbmdlZD8ocGhvbmVOdW1iZXI6IHN0cmluZyk6IHZvaWQ7XG4gICAgb25Gb3Jnb3RQYXNzd29yZENsaWNrPygpOiB2b2lkO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBmaWVsZFZhbGlkOiBQYXJ0aWFsPFJlY29yZDxMb2dpbkZpZWxkLCBib29sZWFuPj47XG4gICAgbG9naW5UeXBlOiBMb2dpbkZpZWxkLkVtYWlsIHwgTG9naW5GaWVsZC5NYXRyaXhJZCB8IExvZ2luRmllbGQuUGhvbmU7XG4gICAgcGFzc3dvcmQ6IFwiXCI7XG59XG5cbmVudW0gTG9naW5GaWVsZCB7XG4gICAgRW1haWwgPSBcImxvZ2luX2ZpZWxkX2VtYWlsXCIsXG4gICAgTWF0cml4SWQgPSBcImxvZ2luX2ZpZWxkX214aWRcIixcbiAgICBQaG9uZSA9IFwibG9naW5fZmllbGRfcGhvbmVcIixcbiAgICBQYXNzd29yZCA9IFwibG9naW5fZmllbGRfcGhvbmVcIixcbn1cblxuLypcbiAqIEEgcHVyZSBVSSBjb21wb25lbnQgd2hpY2ggZGlzcGxheXMgYSB1c2VybmFtZS9wYXNzd29yZCBmb3JtLlxuICogVGhlIGVtYWlsL3VzZXJuYW1lL3Bob25lIGZpZWxkcyBhcmUgZnVsbHktY29udHJvbGxlZCwgdGhlIHBhc3N3b3JkIGZpZWxkIGlzIG5vdC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFzc3dvcmRMb2dpbiBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICBvblVzZXJuYW1lQ2hhbmdlZDogZnVuY3Rpb24oKSB7fSxcbiAgICAgICAgb25Vc2VybmFtZUJsdXI6IGZ1bmN0aW9uKCkge30sXG4gICAgICAgIG9uUGhvbmVDb3VudHJ5Q2hhbmdlZDogZnVuY3Rpb24oKSB7fSxcbiAgICAgICAgb25QaG9uZU51bWJlckNoYW5nZWQ6IGZ1bmN0aW9uKCkge30sXG4gICAgICAgIGxvZ2luSW5jb3JyZWN0OiBmYWxzZSxcbiAgICAgICAgZGlzYWJsZVN1Ym1pdDogZmFsc2UsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIC8vIEZpZWxkIGVycm9yIGNvZGVzIGJ5IGZpZWxkIElEXG4gICAgICAgICAgICBmaWVsZFZhbGlkOiB7fSxcbiAgICAgICAgICAgIGxvZ2luVHlwZTogTG9naW5GaWVsZC5NYXRyaXhJZCxcbiAgICAgICAgICAgIHBhc3N3b3JkOiBcIlwiLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgb25Gb3Jnb3RQYXNzd29yZENsaWNrID0gZXYgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZvcmdvdFBhc3N3b3JkQ2xpY2soKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblN1Ym1pdEZvcm0gPSBhc3luYyBldiA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgY29uc3QgYWxsRmllbGRzVmFsaWQgPSBhd2FpdCB0aGlzLnZlcmlmeUZpZWxkc0JlZm9yZVN1Ym1pdCgpO1xuICAgICAgICBpZiAoIWFsbEZpZWxkc1ZhbGlkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdXNlcm5hbWUgPSAnJzsgLy8gWFhYOiBTeW5hcHNlIGJyZWFrcyBpZiB5b3Ugc2VuZCBudWxsIGhlcmU6XG4gICAgICAgIGxldCBwaG9uZUNvdW50cnkgPSBudWxsO1xuICAgICAgICBsZXQgcGhvbmVOdW1iZXIgPSBudWxsO1xuXG4gICAgICAgIHN3aXRjaCAodGhpcy5zdGF0ZS5sb2dpblR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgTG9naW5GaWVsZC5FbWFpbDpcbiAgICAgICAgICAgIGNhc2UgTG9naW5GaWVsZC5NYXRyaXhJZDpcbiAgICAgICAgICAgICAgICB1c2VybmFtZSA9IHRoaXMucHJvcHMudXNlcm5hbWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIExvZ2luRmllbGQuUGhvbmU6XG4gICAgICAgICAgICAgICAgcGhvbmVDb3VudHJ5ID0gdGhpcy5wcm9wcy5waG9uZUNvdW50cnk7XG4gICAgICAgICAgICAgICAgcGhvbmVOdW1iZXIgPSB0aGlzLnByb3BzLnBob25lTnVtYmVyO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wcm9wcy5vblN1Ym1pdCh1c2VybmFtZSwgcGhvbmVDb3VudHJ5LCBwaG9uZU51bWJlciwgdGhpcy5zdGF0ZS5wYXNzd29yZCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Vc2VybmFtZUNoYW5nZWQgPSBldiA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25Vc2VybmFtZUNoYW5nZWQoZXYudGFyZ2V0LnZhbHVlKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblVzZXJuYW1lQmx1ciA9IGV2ID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vblVzZXJuYW1lQmx1cihldi50YXJnZXQudmFsdWUpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uTG9naW5UeXBlQ2hhbmdlID0gZXYgPT4ge1xuICAgICAgICBjb25zdCBsb2dpblR5cGUgPSBldi50YXJnZXQudmFsdWU7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBsb2dpblR5cGUgfSk7XG4gICAgICAgIHRoaXMucHJvcHMub25Vc2VybmFtZUNoYW5nZWQoXCJcIik7IC8vIFJlc2V0IGJlY2F1c2UgZW1haWwgYW5kIHVzZXJuYW1lIHVzZSB0aGUgc2FtZSBzdGF0ZVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUGhvbmVDb3VudHJ5Q2hhbmdlZCA9IGNvdW50cnkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uUGhvbmVDb3VudHJ5Q2hhbmdlZChjb3VudHJ5LmlzbzIpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUGhvbmVOdW1iZXJDaGFuZ2VkID0gZXYgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uUGhvbmVOdW1iZXJDaGFuZ2VkKGV2LnRhcmdldC52YWx1ZSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25QYXNzd29yZENoYW5nZWQgPSBldiA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwYXNzd29yZDogZXYudGFyZ2V0LnZhbHVlIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGFzeW5jIHZlcmlmeUZpZWxkc0JlZm9yZVN1Ym1pdCgpIHtcbiAgICAgICAgLy8gQmx1ciB0aGUgYWN0aXZlIGVsZW1lbnQgaWYgYW55LCBzbyB3ZSBmaXJzdCBydW4gaXRzIGJsdXIgdmFsaWRhdGlvbixcbiAgICAgICAgLy8gd2hpY2ggaXMgbGVzcyBzdHJpY3QgdGhhbiB0aGUgcGFzcyB3ZSdyZSBhYm91dCB0byBkbyBiZWxvdyBmb3IgYWxsIGZpZWxkcy5cbiAgICAgICAgY29uc3QgYWN0aXZlRWxlbWVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIGlmIChhY3RpdmVFbGVtZW50KSB7XG4gICAgICAgICAgICBhY3RpdmVFbGVtZW50LmJsdXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZpZWxkSURzSW5EaXNwbGF5T3JkZXIgPSBbXG4gICAgICAgICAgICB0aGlzLnN0YXRlLmxvZ2luVHlwZSxcbiAgICAgICAgICAgIExvZ2luRmllbGQuUGFzc3dvcmQsXG4gICAgICAgIF07XG5cbiAgICAgICAgLy8gUnVuIGFsbCBmaWVsZHMgd2l0aCBzdHJpY3RlciB2YWxpZGF0aW9uIHRoYXQgbm8gbG9uZ2VyIGFsbG93cyBlbXB0eVxuICAgICAgICAvLyB2YWx1ZXMgZm9yIHJlcXVpcmVkIGZpZWxkcy5cbiAgICAgICAgZm9yIChjb25zdCBmaWVsZElEIG9mIGZpZWxkSURzSW5EaXNwbGF5T3JkZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpZWxkID0gdGhpc1tmaWVsZElEXTtcbiAgICAgICAgICAgIGlmICghZmllbGQpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFdlIG11c3Qgd2FpdCBmb3IgdGhlc2UgdmFsaWRhdGlvbnMgdG8gZmluaXNoIGJlZm9yZSBxdWV1ZWluZ1xuICAgICAgICAgICAgLy8gdXAgdGhlIHNldFN0YXRlIGJlbG93IHNvIG91ciBzZXRTdGF0ZSBnb2VzIGluIHRoZSBxdWV1ZSBhZnRlclxuICAgICAgICAgICAgLy8gYWxsIHRoZSBzZXRTdGF0ZXMgZnJvbSB0aGVzZSB2YWxpZGF0ZSBjYWxscyAodGhhdCdzIGhvdyB3ZVxuICAgICAgICAgICAgLy8ga25vdyB0aGV5J3ZlIGZpbmlzaGVkKS5cbiAgICAgICAgICAgIGF3YWl0IGZpZWxkLnZhbGlkYXRlKHsgYWxsb3dFbXB0eTogZmFsc2UgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBWYWxpZGF0aW9uIGFuZCBzdGF0ZSB1cGRhdGVzIGFyZSBhc3luYywgc28gd2UgbmVlZCB0byB3YWl0IGZvciB0aGVtIHRvIGNvbXBsZXRlXG4gICAgICAgIC8vIGZpcnN0LiBRdWV1ZSBhIGBzZXRTdGF0ZWAgY2FsbGJhY2sgYW5kIHdhaXQgZm9yIGl0IHRvIHJlc29sdmUuXG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlPHZvaWQ+KHJlc29sdmUgPT4gdGhpcy5zZXRTdGF0ZSh7fSwgcmVzb2x2ZSkpO1xuXG4gICAgICAgIGlmICh0aGlzLmFsbEZpZWxkc1ZhbGlkKCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaW52YWxpZEZpZWxkID0gdGhpcy5maW5kRmlyc3RJbnZhbGlkRmllbGQoZmllbGRJRHNJbkRpc3BsYXlPcmRlcik7XG5cbiAgICAgICAgaWYgKCFpbnZhbGlkRmllbGQpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRm9jdXMgdGhlIGZpcnN0IGludmFsaWQgZmllbGQgYW5kIHNob3cgZmVlZGJhY2sgaW4gdGhlIHN0cmljdGVyIG1vZGVcbiAgICAgICAgLy8gdGhhdCBubyBsb25nZXIgYWxsb3dzIGVtcHR5IHZhbHVlcyBmb3IgcmVxdWlyZWQgZmllbGRzLlxuICAgICAgICBpbnZhbGlkRmllbGQuZm9jdXMoKTtcbiAgICAgICAgaW52YWxpZEZpZWxkLnZhbGlkYXRlKHsgYWxsb3dFbXB0eTogZmFsc2UsIGZvY3VzZWQ6IHRydWUgfSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFsbEZpZWxkc1ZhbGlkKCkge1xuICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXModGhpcy5zdGF0ZS5maWVsZFZhbGlkKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZmllbGRWYWxpZFtrZXlzW2ldXSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGZpbmRGaXJzdEludmFsaWRGaWVsZChmaWVsZElEczogTG9naW5GaWVsZFtdKSB7XG4gICAgICAgIGZvciAoY29uc3QgZmllbGRJRCBvZiBmaWVsZElEcykge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmZpZWxkVmFsaWRbZmllbGRJRF0gJiYgdGhpc1tmaWVsZElEXSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzW2ZpZWxkSURdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHByaXZhdGUgbWFya0ZpZWxkVmFsaWQoZmllbGRJRDogTG9naW5GaWVsZCwgdmFsaWQ6IGJvb2xlYW4pIHtcbiAgICAgICAgY29uc3QgeyBmaWVsZFZhbGlkIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgICBmaWVsZFZhbGlkW2ZpZWxkSURdID0gdmFsaWQ7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZmllbGRWYWxpZCxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB2YWxpZGF0ZVVzZXJuYW1lUnVsZXMgPSB3aXRoVmFsaWRhdGlvbih7XG4gICAgICAgIHJ1bGVzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiBcInJlcXVpcmVkXCIsXG4gICAgICAgICAgICAgICAgdGVzdCh7IHZhbHVlLCBhbGxvd0VtcHR5IH0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFsbG93RW1wdHkgfHwgISF2YWx1ZTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGludmFsaWQ6ICgpID0+IF90KFwiRW50ZXIgdXNlcm5hbWVcIiksXG4gICAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgIH0pO1xuXG4gICAgcHJpdmF0ZSBvblVzZXJuYW1lVmFsaWRhdGUgPSBhc3luYyAoZmllbGRTdGF0ZSkgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLnZhbGlkYXRlVXNlcm5hbWVSdWxlcyhmaWVsZFN0YXRlKTtcbiAgICAgICAgdGhpcy5tYXJrRmllbGRWYWxpZChMb2dpbkZpZWxkLk1hdHJpeElkLCByZXN1bHQudmFsaWQpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRW1haWxWYWxpZGF0ZSA9IChyZXN1bHQ6IElWYWxpZGF0aW9uUmVzdWx0KSA9PiB7XG4gICAgICAgIHRoaXMubWFya0ZpZWxkVmFsaWQoTG9naW5GaWVsZC5FbWFpbCwgcmVzdWx0LnZhbGlkKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSB2YWxpZGF0ZVBob25lTnVtYmVyUnVsZXMgPSB3aXRoVmFsaWRhdGlvbih7XG4gICAgICAgIHJ1bGVzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiBcInJlcXVpcmVkXCIsXG4gICAgICAgICAgICAgICAgdGVzdCh7IHZhbHVlLCBhbGxvd0VtcHR5IH0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFsbG93RW1wdHkgfHwgISF2YWx1ZTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGludmFsaWQ6ICgpID0+IF90KFwiRW50ZXIgcGhvbmUgbnVtYmVyXCIpLFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIGtleTogXCJudW1iZXJcIixcbiAgICAgICAgICAgICAgICB0ZXN0OiAoeyB2YWx1ZSB9KSA9PiAhdmFsdWUgfHwgUEhPTkVfTlVNQkVSX1JFR0VYLnRlc3QodmFsdWUpLFxuICAgICAgICAgICAgICAgIGludmFsaWQ6ICgpID0+IF90KFwiVGhhdCBwaG9uZSBudW1iZXIgZG9lc24ndCBsb29rIHF1aXRlIHJpZ2h0LCBwbGVhc2UgY2hlY2sgYW5kIHRyeSBhZ2FpblwiKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgfSk7XG5cbiAgICBwcml2YXRlIG9uUGhvbmVOdW1iZXJWYWxpZGF0ZSA9IGFzeW5jIChmaWVsZFN0YXRlKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMudmFsaWRhdGVQaG9uZU51bWJlclJ1bGVzKGZpZWxkU3RhdGUpO1xuICAgICAgICB0aGlzLm1hcmtGaWVsZFZhbGlkKExvZ2luRmllbGQuUGFzc3dvcmQsIHJlc3VsdC52YWxpZCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIHByaXZhdGUgdmFsaWRhdGVQYXNzd29yZFJ1bGVzID0gd2l0aFZhbGlkYXRpb24oe1xuICAgICAgICBydWxlczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogXCJyZXF1aXJlZFwiLFxuICAgICAgICAgICAgICAgIHRlc3QoeyB2YWx1ZSwgYWxsb3dFbXB0eSB9KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhbGxvd0VtcHR5IHx8ICEhdmFsdWU7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpbnZhbGlkOiAoKSA9PiBfdChcIkVudGVyIHBhc3N3b3JkXCIpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICB9KTtcblxuICAgIHByaXZhdGUgb25QYXNzd29yZFZhbGlkYXRlID0gYXN5bmMgKGZpZWxkU3RhdGUpID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy52YWxpZGF0ZVBhc3N3b3JkUnVsZXMoZmllbGRTdGF0ZSk7XG4gICAgICAgIHRoaXMubWFya0ZpZWxkVmFsaWQoTG9naW5GaWVsZC5QYXNzd29yZCwgcmVzdWx0LnZhbGlkKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSByZW5kZXJMb2dpbkZpZWxkKGxvZ2luVHlwZTogSVN0YXRlW1wibG9naW5UeXBlXCJdLCBhdXRvRm9jdXM6IGJvb2xlYW4pIHtcbiAgICAgICAgY29uc3QgY2xhc3NlcyA9IHtcbiAgICAgICAgICAgIGVycm9yOiBmYWxzZSxcbiAgICAgICAgfTtcblxuICAgICAgICBzd2l0Y2ggKGxvZ2luVHlwZSkge1xuICAgICAgICAgICAgY2FzZSBMb2dpbkZpZWxkLkVtYWlsOlxuICAgICAgICAgICAgICAgIGNsYXNzZXMuZXJyb3IgPSB0aGlzLnByb3BzLmxvZ2luSW5jb3JyZWN0ICYmICF0aGlzLnByb3BzLnVzZXJuYW1lO1xuICAgICAgICAgICAgICAgIHJldHVybiA8RW1haWxGaWVsZFxuICAgICAgICAgICAgICAgICAgICBpZD1cIm14X0xvZ2luRm9ybV9lbWFpbFwiXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhjbGFzc2VzKX1cbiAgICAgICAgICAgICAgICAgICAgbmFtZT1cInVzZXJuYW1lXCIgLy8gbWFrZSBpdCBhIGxpdHRsZSBlYXNpZXIgZm9yIGJyb3dzZXIncyByZW1lbWJlci1wYXNzd29yZFxuICAgICAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJlbWFpbFwiXG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJlbWFpbFwiXG4gICAgICAgICAgICAgICAgICAgIGtleT1cImVtYWlsX2lucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJqb2VAZXhhbXBsZS5jb21cIlxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5wcm9wcy51c2VybmFtZX1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25Vc2VybmFtZUNoYW5nZWR9XG4gICAgICAgICAgICAgICAgICAgIG9uQmx1cj17dGhpcy5vblVzZXJuYW1lQmx1cn1cbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMucHJvcHMuYnVzeX1cbiAgICAgICAgICAgICAgICAgICAgYXV0b0ZvY3VzPXthdXRvRm9jdXN9XG4gICAgICAgICAgICAgICAgICAgIG9uVmFsaWRhdGU9e3RoaXMub25FbWFpbFZhbGlkYXRlfVxuICAgICAgICAgICAgICAgICAgICBmaWVsZFJlZj17ZmllbGQgPT4gdGhpc1tMb2dpbkZpZWxkLkVtYWlsXSA9IGZpZWxkfVxuICAgICAgICAgICAgICAgIC8+O1xuICAgICAgICAgICAgY2FzZSBMb2dpbkZpZWxkLk1hdHJpeElkOlxuICAgICAgICAgICAgICAgIGNsYXNzZXMuZXJyb3IgPSB0aGlzLnByb3BzLmxvZ2luSW5jb3JyZWN0ICYmICF0aGlzLnByb3BzLnVzZXJuYW1lO1xuICAgICAgICAgICAgICAgIHJldHVybiA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgaWQ9XCJteF9Mb2dpbkZvcm1fdXNlcm5hbWVcIlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZXMoY2xhc3Nlcyl9XG4gICAgICAgICAgICAgICAgICAgIG5hbWU9XCJ1c2VybmFtZVwiIC8vIG1ha2UgaXQgYSBsaXR0bGUgZWFzaWVyIGZvciBicm93c2VyJ3MgcmVtZW1iZXItcGFzc3dvcmRcbiAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwidXNlcm5hbWVcIlxuICAgICAgICAgICAgICAgICAgICBrZXk9XCJ1c2VybmFtZV9pbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiVXNlcm5hbWVcIil9XG4gICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtfdChcIlVzZXJuYW1lXCIpLnRvTG9jYWxlTG93ZXJDYXNlKCl9XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnByb3BzLnVzZXJuYW1lfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblVzZXJuYW1lQ2hhbmdlZH1cbiAgICAgICAgICAgICAgICAgICAgb25CbHVyPXt0aGlzLm9uVXNlcm5hbWVCbHVyfVxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5wcm9wcy5idXN5fVxuICAgICAgICAgICAgICAgICAgICBhdXRvRm9jdXM9e2F1dG9Gb2N1c31cbiAgICAgICAgICAgICAgICAgICAgb25WYWxpZGF0ZT17dGhpcy5vblVzZXJuYW1lVmFsaWRhdGV9XG4gICAgICAgICAgICAgICAgICAgIHJlZj17ZmllbGQgPT4gdGhpc1tMb2dpbkZpZWxkLk1hdHJpeElkXSA9IGZpZWxkfVxuICAgICAgICAgICAgICAgIC8+O1xuICAgICAgICAgICAgY2FzZSBMb2dpbkZpZWxkLlBob25lOiB7XG4gICAgICAgICAgICAgICAgY2xhc3Nlcy5lcnJvciA9IHRoaXMucHJvcHMubG9naW5JbmNvcnJlY3QgJiYgIXRoaXMucHJvcHMucGhvbmVOdW1iZXI7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBwaG9uZUNvdW50cnkgPSA8Q291bnRyeURyb3Bkb3duXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnByb3BzLnBob25lQ291bnRyeX1cbiAgICAgICAgICAgICAgICAgICAgaXNTbWFsbD17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgc2hvd1ByZWZpeD17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgb25PcHRpb25DaGFuZ2U9e3RoaXMub25QaG9uZUNvdW50cnlDaGFuZ2VkfVxuICAgICAgICAgICAgICAgIC8+O1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIDxGaWVsZFxuICAgICAgICAgICAgICAgICAgICBpZD1cIm14X0xvZ2luRm9ybV9waG9uZVwiXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhjbGFzc2VzKX1cbiAgICAgICAgICAgICAgICAgICAgbmFtZT1cInBob25lTnVtYmVyXCJcbiAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwidGVsLW5hdGlvbmFsXCJcbiAgICAgICAgICAgICAgICAgICAga2V5PVwicGhvbmVfaW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIlBob25lXCIpfVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5wcm9wcy5waG9uZU51bWJlcn1cbiAgICAgICAgICAgICAgICAgICAgcHJlZml4Q29tcG9uZW50PXtwaG9uZUNvdW50cnl9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uUGhvbmVOdW1iZXJDaGFuZ2VkfVxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5wcm9wcy5idXN5fVxuICAgICAgICAgICAgICAgICAgICBhdXRvRm9jdXM9e2F1dG9Gb2N1c31cbiAgICAgICAgICAgICAgICAgICAgb25WYWxpZGF0ZT17dGhpcy5vblBob25lTnVtYmVyVmFsaWRhdGV9XG4gICAgICAgICAgICAgICAgICAgIHJlZj17ZmllbGQgPT4gdGhpc1tMb2dpbkZpZWxkLlBhc3N3b3JkXSA9IGZpZWxkfVxuICAgICAgICAgICAgICAgIC8+O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc0xvZ2luRW1wdHkoKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5zdGF0ZS5sb2dpblR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgTG9naW5GaWVsZC5FbWFpbDpcbiAgICAgICAgICAgIGNhc2UgTG9naW5GaWVsZC5NYXRyaXhJZDpcbiAgICAgICAgICAgICAgICByZXR1cm4gIXRoaXMucHJvcHMudXNlcm5hbWU7XG4gICAgICAgICAgICBjYXNlIExvZ2luRmllbGQuUGhvbmU6XG4gICAgICAgICAgICAgICAgcmV0dXJuICF0aGlzLnByb3BzLnBob25lQ291bnRyeSB8fCAhdGhpcy5wcm9wcy5waG9uZU51bWJlcjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IGZvcmdvdFBhc3N3b3JkSnN4O1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uRm9yZ290UGFzc3dvcmRDbGljaykge1xuICAgICAgICAgICAgZm9yZ290UGFzc3dvcmRKc3ggPSA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0xvZ2luX2ZvcmdvdFwiXG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMucHJvcHMuYnVzeX1cbiAgICAgICAgICAgICAgICBraW5kPVwibGlua1wiXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkZvcmdvdFBhc3N3b3JkQ2xpY2t9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyBfdChcIkZvcmdvdCBwYXNzd29yZD9cIikgfVxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHB3RmllbGRDbGFzcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgZXJyb3I6IHRoaXMucHJvcHMubG9naW5JbmNvcnJlY3QgJiYgIXRoaXMuaXNMb2dpbkVtcHR5KCksIC8vIG9ubHkgZXJyb3IgcGFzc3dvcmQgaWYgZXJyb3IgaXNuJ3QgdG9wIGZpZWxkXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIElmIGxvZ2luIGlzIGVtcHR5LCBhdXRvRm9jdXMgbG9naW4sIG90aGVyd2lzZSBhdXRvRm9jdXMgcGFzc3dvcmQuXG4gICAgICAgIC8vIHRoaXMgaXMgZm9yIHdoZW4gYXV0byBzZXJ2ZXIgZGlzY292ZXJ5IHJlbW91bnRzIHVzIHdoZW4gdGhlIHVzZXIgdHJpZXMgdG8gdGFiIGZyb20gdXNlcm5hbWUgdG8gcGFzc3dvcmRcbiAgICAgICAgY29uc3QgYXV0b0ZvY3VzUGFzc3dvcmQgPSAhdGhpcy5pc0xvZ2luRW1wdHkoKTtcbiAgICAgICAgY29uc3QgbG9naW5GaWVsZCA9IHRoaXMucmVuZGVyTG9naW5GaWVsZCh0aGlzLnN0YXRlLmxvZ2luVHlwZSwgIWF1dG9Gb2N1c1Bhc3N3b3JkKTtcblxuICAgICAgICBsZXQgbG9naW5UeXBlO1xuICAgICAgICBpZiAoIVNka0NvbmZpZy5nZXQoKS5kaXNhYmxlXzNwaWRfbG9naW4pIHtcbiAgICAgICAgICAgIGxvZ2luVHlwZSA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0xvZ2luX3R5cGVfY29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJteF9Mb2dpbl90eXBlX2xhYmVsXCI+eyBfdCgnU2lnbiBpbiB3aXRoJykgfTwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudD1cInNlbGVjdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5sb2dpblR5cGV9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkxvZ2luVHlwZUNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnByb3BzLmJ1c3l9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24ga2V5PXtMb2dpbkZpZWxkLk1hdHJpeElkfSB2YWx1ZT17TG9naW5GaWVsZC5NYXRyaXhJZH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdCgnVXNlcm5hbWUnKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk9e0xvZ2luRmllbGQuRW1haWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e0xvZ2luRmllbGQuRW1haWx9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdCgnRW1haWwgYWRkcmVzcycpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiBrZXk9e0xvZ2luRmllbGQuUGFzc3dvcmR9IHZhbHVlPXtMb2dpbkZpZWxkLlBhc3N3b3JkfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KCdQaG9uZScpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICA8L0ZpZWxkPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxmb3JtIG9uU3VibWl0PXt0aGlzLm9uU3VibWl0Rm9ybX0+XG4gICAgICAgICAgICAgICAgICAgIHsgbG9naW5UeXBlIH1cbiAgICAgICAgICAgICAgICAgICAgeyBsb2dpbkZpZWxkIH1cbiAgICAgICAgICAgICAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICBpZD1cIm14X0xvZ2luRm9ybV9wYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3B3RmllbGRDbGFzc31cbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cImN1cnJlbnQtcGFzc3dvcmRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoJ1Bhc3N3b3JkJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5wYXNzd29yZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uUGFzc3dvcmRDaGFuZ2VkfVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMucHJvcHMuYnVzeX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Gb2N1cz17YXV0b0ZvY3VzUGFzc3dvcmR9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblZhbGlkYXRlPXt0aGlzLm9uUGFzc3dvcmRWYWxpZGF0ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZj17ZmllbGQgPT4gdGhpc1tMb2dpbkZpZWxkLlBhc3N3b3JkXSA9IGZpZWxkfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICB7IGZvcmdvdFBhc3N3b3JkSnN4IH1cbiAgICAgICAgICAgICAgICAgICAgeyAhdGhpcy5wcm9wcy5idXN5ICYmIDxpbnB1dCBjbGFzc05hbWU9XCJteF9Mb2dpbl9zdWJtaXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInN1Ym1pdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17X3QoJ1NpZ24gaW4nKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnByb3BzLmRpc2FibGVTdWJtaXR9XG4gICAgICAgICAgICAgICAgICAgIC8+IH1cbiAgICAgICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUVBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQTFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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