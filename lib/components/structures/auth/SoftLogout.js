"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../../languageHandler");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var Lifecycle = _interopRequireWildcard(require("../../../Lifecycle"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _Login = require("../../../Login");

var _AuthPage = _interopRequireDefault(require("../../views/auth/AuthPage"));

var _BasePlatform = require("../../../BasePlatform");

var _SSOButtons = _interopRequireDefault(require("../../views/elements/SSOButtons"));

var _ConfirmWipeDeviceDialog = _interopRequireDefault(require("../../views/dialogs/ConfirmWipeDeviceDialog"));

var _Field = _interopRequireDefault(require("../../views/elements/Field"));

var _AccessibleButton = _interopRequireDefault(require("../../views/elements/AccessibleButton"));

var _Spinner = _interopRequireDefault(require("../../views/elements/Spinner"));

var _AuthHeader = _interopRequireDefault(require("../../views/auth/AuthHeader"));

var _AuthBody = _interopRequireDefault(require("../../views/auth/AuthBody"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2019-2022 The Matrix.org Foundation C.I.C.

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
var LoginView;

(function (LoginView) {
  LoginView[LoginView["Loading"] = 0] = "Loading";
  LoginView[LoginView["Password"] = 1] = "Password";
  LoginView[LoginView["CAS"] = 2] = "CAS";
  LoginView[LoginView["SSO"] = 3] = "SSO";
  LoginView[LoginView["PasswordWithSocialSignOn"] = 4] = "PasswordWithSocialSignOn";
  LoginView[LoginView["Unsupported"] = 5] = "Unsupported";
})(LoginView || (LoginView = {}));

const STATIC_FLOWS_TO_VIEWS = {
  "m.login.password": LoginView.Password,
  "m.login.cas": LoginView.CAS,
  "m.login.sso": LoginView.SSO
};

class SoftLogout extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onClearAll", () => {
      _Modal.default.createDialog(_ConfirmWipeDeviceDialog.default, {
        onFinished: wipeData => {
          if (!wipeData) return;

          _logger.logger.log("Clearing data from soft-logged-out session");

          Lifecycle.logout();
        }
      });
    });
    (0, _defineProperty2.default)(this, "onPasswordChange", ev => {
      this.setState({
        password: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onForgotPassword", () => {
      _dispatcher.default.dispatch({
        action: 'start_password_recovery'
      });
    });
    (0, _defineProperty2.default)(this, "onPasswordLogin", async ev => {
      ev.preventDefault();
      ev.stopPropagation();
      this.setState({
        busy: true
      });

      const hsUrl = _MatrixClientPeg.MatrixClientPeg.get().getHomeserverUrl();

      const isUrl = _MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl();

      const loginType = "m.login.password";
      const loginParams = {
        identifier: {
          type: "m.id.user",
          user: _MatrixClientPeg.MatrixClientPeg.get().getUserId()
        },
        password: this.state.password,
        device_id: _MatrixClientPeg.MatrixClientPeg.get().getDeviceId()
      };
      let credentials = null;

      try {
        credentials = await (0, _Login.sendLoginRequest)(hsUrl, isUrl, loginType, loginParams);
      } catch (e) {
        let errorText = (0, _languageHandler._t)("Failed to re-authenticate due to a homeserver problem");

        if (e.errcode === "M_FORBIDDEN" && (e.httpStatus === 401 || e.httpStatus === 403)) {
          errorText = (0, _languageHandler._t)("Incorrect password");
        }

        this.setState({
          busy: false,
          errorText: errorText
        });
        return;
      }

      Lifecycle.hydrateSession(credentials).catch(e => {
        _logger.logger.error(e);

        this.setState({
          busy: false,
          errorText: (0, _languageHandler._t)("Failed to re-authenticate")
        });
      });
    });
    this.state = {
      loginView: LoginView.Loading,
      keyBackupNeeded: true,
      // assume we do while we figure it out (see componentDidMount)
      busy: false,
      password: "",
      errorText: "",
      flows: []
    };
  }

  componentDidMount() {
    // We've ended up here when we don't need to - navigate to login
    if (!Lifecycle.isSoftLogout()) {
      _dispatcher.default.dispatch({
        action: "start_login"
      });

      return;
    }

    this.initLogin();

    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    if (cli.isCryptoEnabled()) {
      cli.countSessionsNeedingBackup().then(remaining => {
        this.setState({
          keyBackupNeeded: remaining > 0
        });
      });
    }
  }

  async initLogin() {
    const queryParams = this.props.realQueryParams;
    const hasAllParams = queryParams && queryParams['loginToken'];

    if (hasAllParams) {
      this.setState({
        loginView: LoginView.Loading
      });
      this.trySsoLogin();
      return;
    } // Note: we don't use the existing Login class because it is heavily flow-based. We don't
    // care about login flows here, unless it is the single flow we support.


    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const flows = (await client.loginFlows()).flows;
    const loginViews = flows.map(f => STATIC_FLOWS_TO_VIEWS[f.type]);
    const isSocialSignOn = loginViews.includes(LoginView.Password) && loginViews.includes(LoginView.SSO);
    const firstView = loginViews.filter(f => !!f)[0] || LoginView.Unsupported;
    const chosenView = isSocialSignOn ? LoginView.PasswordWithSocialSignOn : firstView;
    this.setState({
      flows,
      loginView: chosenView
    });
  }

  async trySsoLogin() {
    this.setState({
      busy: true
    });
    const hsUrl = localStorage.getItem(_BasePlatform.SSO_HOMESERVER_URL_KEY);

    const isUrl = localStorage.getItem(_BasePlatform.SSO_ID_SERVER_URL_KEY) || _MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl();

    const loginType = "m.login.token";
    const loginParams = {
      token: this.props.realQueryParams['loginToken'],
      device_id: _MatrixClientPeg.MatrixClientPeg.get().getDeviceId()
    };
    let credentials = null;

    try {
      credentials = await (0, _Login.sendLoginRequest)(hsUrl, isUrl, loginType, loginParams);
    } catch (e) {
      _logger.logger.error(e);

      this.setState({
        busy: false,
        loginView: LoginView.Unsupported
      });
      return;
    }

    Lifecycle.hydrateSession(credentials).then(() => {
      if (this.props.onTokenLoginCompleted) this.props.onTokenLoginCompleted();
    }).catch(e => {
      _logger.logger.error(e);

      this.setState({
        busy: false,
        loginView: LoginView.Unsupported
      });
    });
  }

  renderPasswordForm(introText) {
    let error = null;

    if (this.state.errorText) {
      error = /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_Login_error"
      }, this.state.errorText);
    }

    return /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.onPasswordLogin
    }, introText ? /*#__PURE__*/_react.default.createElement("p", null, introText) : null, error, /*#__PURE__*/_react.default.createElement(_Field.default, {
      type: "password",
      label: (0, _languageHandler._t)("Password"),
      onChange: this.onPasswordChange,
      value: this.state.password,
      disabled: this.state.busy
    }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this.onPasswordLogin,
      kind: "primary",
      type: "submit",
      disabled: this.state.busy
    }, (0, _languageHandler._t)("Sign In")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this.onForgotPassword,
      kind: "link"
    }, (0, _languageHandler._t)("Forgotten your password?")));
  }

  renderSsoForm(introText) {
    const loginType = this.state.loginView === LoginView.CAS ? "cas" : "sso";
    const flow = this.state.flows.find(flow => flow.type === "m.login." + loginType);
    return /*#__PURE__*/_react.default.createElement("div", null, introText ? /*#__PURE__*/_react.default.createElement("p", null, introText) : null, /*#__PURE__*/_react.default.createElement(_SSOButtons.default, {
      matrixClient: _MatrixClientPeg.MatrixClientPeg.get(),
      flow: flow,
      loginType: loginType,
      fragmentAfterLogin: this.props.fragmentAfterLogin,
      primary: !this.state.flows.find(flow => flow.type === "m.login.password")
    }));
  }

  renderSignInSection() {
    if (this.state.loginView === LoginView.Loading) {
      return /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
    }

    let introText = null; // null is translated to something area specific in this function

    if (this.state.keyBackupNeeded) {
      introText = (0, _languageHandler._t)("Regain access to your account and recover encryption keys stored in this session. " + "Without them, you won't be able to read all of your secure messages in any session.");
    }

    if (this.state.loginView === LoginView.Password) {
      if (!introText) {
        introText = (0, _languageHandler._t)("Enter your password to sign in and regain access to your account.");
      } // else we already have a message and should use it (key backup warning)


      return this.renderPasswordForm(introText);
    }

    if (this.state.loginView === LoginView.SSO || this.state.loginView === LoginView.CAS) {
      if (!introText) {
        introText = (0, _languageHandler._t)("Sign in and regain access to your account.");
      } // else we already have a message and should use it (key backup warning)


      return this.renderSsoForm(introText);
    }

    if (this.state.loginView === LoginView.PasswordWithSocialSignOn) {
      if (!introText) {
        introText = (0, _languageHandler._t)("Sign in and regain access to your account.");
      } // We render both forms with no intro/error to ensure the layout looks reasonably
      // okay enough.
      //
      // Note: "mx_AuthBody_centered" text taken from registration page.


      return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("p", null, introText), this.renderSsoForm(null), /*#__PURE__*/_react.default.createElement("h2", {
        className: "mx_AuthBody_centered"
      }, (0, _languageHandler._t)("%(ssoButtons)s Or %(usernamePassword)s", {
        ssoButtons: "",
        usernamePassword: ""
      }).trim()), this.renderPasswordForm(null));
    } // Default: assume unsupported/error


    return /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("You cannot sign in to your account. Please contact your " + "homeserver admin for more information."));
  }

  render() {
    return /*#__PURE__*/_react.default.createElement(_AuthPage.default, null, /*#__PURE__*/_react.default.createElement(_AuthHeader.default, null), /*#__PURE__*/_react.default.createElement(_AuthBody.default, null, /*#__PURE__*/_react.default.createElement("h1", null, (0, _languageHandler._t)("You're signed out")), /*#__PURE__*/_react.default.createElement("h2", null, (0, _languageHandler._t)("Sign in")), /*#__PURE__*/_react.default.createElement("div", null, this.renderSignInSection()), /*#__PURE__*/_react.default.createElement("h2", null, (0, _languageHandler._t)("Clear personal data")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Warning: Your personal data (including encryption keys) is still stored " + "in this session. Clear it if you're finished using this session, or want to sign " + "in to another account.")), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this.onClearAll,
      kind: "danger"
    }, (0, _languageHandler._t)("Clear all data")))));
  }

}

exports.default = SoftLogout;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMb2dpblZpZXciLCJTVEFUSUNfRkxPV1NfVE9fVklFV1MiLCJQYXNzd29yZCIsIkNBUyIsIlNTTyIsIlNvZnRMb2dvdXQiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIkNvbmZpcm1XaXBlRGV2aWNlRGlhbG9nIiwib25GaW5pc2hlZCIsIndpcGVEYXRhIiwibG9nZ2VyIiwibG9nIiwiTGlmZWN5Y2xlIiwibG9nb3V0IiwiZXYiLCJzZXRTdGF0ZSIsInBhc3N3b3JkIiwidGFyZ2V0IiwidmFsdWUiLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwiYnVzeSIsImhzVXJsIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiZ2V0SG9tZXNlcnZlclVybCIsImlzVXJsIiwiZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwiLCJsb2dpblR5cGUiLCJsb2dpblBhcmFtcyIsImlkZW50aWZpZXIiLCJ0eXBlIiwidXNlciIsImdldFVzZXJJZCIsInN0YXRlIiwiZGV2aWNlX2lkIiwiZ2V0RGV2aWNlSWQiLCJjcmVkZW50aWFscyIsInNlbmRMb2dpblJlcXVlc3QiLCJlIiwiZXJyb3JUZXh0IiwiX3QiLCJlcnJjb2RlIiwiaHR0cFN0YXR1cyIsImh5ZHJhdGVTZXNzaW9uIiwiY2F0Y2giLCJlcnJvciIsImxvZ2luVmlldyIsIkxvYWRpbmciLCJrZXlCYWNrdXBOZWVkZWQiLCJmbG93cyIsImNvbXBvbmVudERpZE1vdW50IiwiaXNTb2Z0TG9nb3V0IiwiaW5pdExvZ2luIiwiY2xpIiwiaXNDcnlwdG9FbmFibGVkIiwiY291bnRTZXNzaW9uc05lZWRpbmdCYWNrdXAiLCJ0aGVuIiwicmVtYWluaW5nIiwicXVlcnlQYXJhbXMiLCJyZWFsUXVlcnlQYXJhbXMiLCJoYXNBbGxQYXJhbXMiLCJ0cnlTc29Mb2dpbiIsImNsaWVudCIsImxvZ2luRmxvd3MiLCJsb2dpblZpZXdzIiwibWFwIiwiZiIsImlzU29jaWFsU2lnbk9uIiwiaW5jbHVkZXMiLCJmaXJzdFZpZXciLCJmaWx0ZXIiLCJVbnN1cHBvcnRlZCIsImNob3NlblZpZXciLCJQYXNzd29yZFdpdGhTb2NpYWxTaWduT24iLCJsb2NhbFN0b3JhZ2UiLCJnZXRJdGVtIiwiU1NPX0hPTUVTRVJWRVJfVVJMX0tFWSIsIlNTT19JRF9TRVJWRVJfVVJMX0tFWSIsInRva2VuIiwib25Ub2tlbkxvZ2luQ29tcGxldGVkIiwicmVuZGVyUGFzc3dvcmRGb3JtIiwiaW50cm9UZXh0Iiwib25QYXNzd29yZExvZ2luIiwib25QYXNzd29yZENoYW5nZSIsIm9uRm9yZ290UGFzc3dvcmQiLCJyZW5kZXJTc29Gb3JtIiwiZmxvdyIsImZpbmQiLCJmcmFnbWVudEFmdGVyTG9naW4iLCJyZW5kZXJTaWduSW5TZWN0aW9uIiwic3NvQnV0dG9ucyIsInVzZXJuYW1lUGFzc3dvcmQiLCJ0cmltIiwicmVuZGVyIiwib25DbGVhckFsbCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvYXV0aC9Tb2Z0TG9nb3V0LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTktMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5pbXBvcnQgeyBPcHRpb25hbCB9IGZyb20gXCJtYXRyaXgtZXZlbnRzLXNka1wiO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgKiBhcyBMaWZlY3ljbGUgZnJvbSAnLi4vLi4vLi4vTGlmZWN5Y2xlJztcbmltcG9ydCBNb2RhbCBmcm9tICcuLi8uLi8uLi9Nb2RhbCc7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tIFwiLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgeyBJU1NPRmxvdywgTG9naW5GbG93LCBzZW5kTG9naW5SZXF1ZXN0IH0gZnJvbSBcIi4uLy4uLy4uL0xvZ2luXCI7XG5pbXBvcnQgQXV0aFBhZ2UgZnJvbSBcIi4uLy4uL3ZpZXdzL2F1dGgvQXV0aFBhZ2VcIjtcbmltcG9ydCB7IFNTT19IT01FU0VSVkVSX1VSTF9LRVksIFNTT19JRF9TRVJWRVJfVVJMX0tFWSB9IGZyb20gXCIuLi8uLi8uLi9CYXNlUGxhdGZvcm1cIjtcbmltcG9ydCBTU09CdXR0b25zIGZyb20gXCIuLi8uLi92aWV3cy9lbGVtZW50cy9TU09CdXR0b25zXCI7XG5pbXBvcnQgQ29uZmlybVdpcGVEZXZpY2VEaWFsb2cgZnJvbSAnLi4vLi4vdmlld3MvZGlhbG9ncy9Db25maXJtV2lwZURldmljZURpYWxvZyc7XG5pbXBvcnQgRmllbGQgZnJvbSAnLi4vLi4vdmlld3MvZWxlbWVudHMvRmllbGQnO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSAnLi4vLi4vdmlld3MvZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvbic7XG5pbXBvcnQgU3Bpbm5lciBmcm9tIFwiLi4vLi4vdmlld3MvZWxlbWVudHMvU3Bpbm5lclwiO1xuaW1wb3J0IEF1dGhIZWFkZXIgZnJvbSBcIi4uLy4uL3ZpZXdzL2F1dGgvQXV0aEhlYWRlclwiO1xuaW1wb3J0IEF1dGhCb2R5IGZyb20gXCIuLi8uLi92aWV3cy9hdXRoL0F1dGhCb2R5XCI7XG5cbmVudW0gTG9naW5WaWV3IHtcbiAgICBMb2FkaW5nLFxuICAgIFBhc3N3b3JkLFxuICAgIENBUywgLy8gU1NPLCBidXQgb2xkXG4gICAgU1NPLFxuICAgIFBhc3N3b3JkV2l0aFNvY2lhbFNpZ25PbixcbiAgICBVbnN1cHBvcnRlZCxcbn1cblxuY29uc3QgU1RBVElDX0ZMT1dTX1RPX1ZJRVdTID0ge1xuICAgIFwibS5sb2dpbi5wYXNzd29yZFwiOiBMb2dpblZpZXcuUGFzc3dvcmQsXG4gICAgXCJtLmxvZ2luLmNhc1wiOiBMb2dpblZpZXcuQ0FTLFxuICAgIFwibS5sb2dpbi5zc29cIjogTG9naW5WaWV3LlNTTyxcbn07XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIC8vIFF1ZXJ5IHBhcmFtZXRlcnMgZnJvbSBNYXRyaXhDaGF0XG4gICAgcmVhbFF1ZXJ5UGFyYW1zOiB7XG4gICAgICAgIGxvZ2luVG9rZW4/OiBzdHJpbmc7XG4gICAgfTtcbiAgICBmcmFnbWVudEFmdGVyTG9naW4/OiBzdHJpbmc7XG5cbiAgICAvLyBDYWxsZWQgd2hlbiB0aGUgU1NPIGxvZ2luIGNvbXBsZXRlc1xuICAgIG9uVG9rZW5Mb2dpbkNvbXBsZXRlZDogKCkgPT4gdm9pZDtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgbG9naW5WaWV3OiBMb2dpblZpZXc7XG4gICAga2V5QmFja3VwTmVlZGVkOiBib29sZWFuO1xuICAgIGJ1c3k6IGJvb2xlYW47XG4gICAgcGFzc3dvcmQ6IHN0cmluZztcbiAgICBlcnJvclRleHQ6IHN0cmluZztcbiAgICBmbG93czogTG9naW5GbG93W107XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNvZnRMb2dvdXQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwdWJsaWMgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGxvZ2luVmlldzogTG9naW5WaWV3LkxvYWRpbmcsXG4gICAgICAgICAgICBrZXlCYWNrdXBOZWVkZWQ6IHRydWUsIC8vIGFzc3VtZSB3ZSBkbyB3aGlsZSB3ZSBmaWd1cmUgaXQgb3V0IChzZWUgY29tcG9uZW50RGlkTW91bnQpXG4gICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgICAgIHBhc3N3b3JkOiBcIlwiLFxuICAgICAgICAgICAgZXJyb3JUZXh0OiBcIlwiLFxuICAgICAgICAgICAgZmxvd3M6IFtdLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICAgICAgLy8gV2UndmUgZW5kZWQgdXAgaGVyZSB3aGVuIHdlIGRvbid0IG5lZWQgdG8gLSBuYXZpZ2F0ZSB0byBsb2dpblxuICAgICAgICBpZiAoIUxpZmVjeWNsZS5pc1NvZnRMb2dvdXQoKSkge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiBcInN0YXJ0X2xvZ2luXCIgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmluaXRMb2dpbigpO1xuXG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgaWYgKGNsaS5pc0NyeXB0b0VuYWJsZWQoKSkge1xuICAgICAgICAgICAgY2xpLmNvdW50U2Vzc2lvbnNOZWVkaW5nQmFja3VwKCkudGhlbihyZW1haW5pbmcgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBrZXlCYWNrdXBOZWVkZWQ6IHJlbWFpbmluZyA+IDAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25DbGVhckFsbCA9ICgpID0+IHtcbiAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKENvbmZpcm1XaXBlRGV2aWNlRGlhbG9nLCB7XG4gICAgICAgICAgICBvbkZpbmlzaGVkOiAod2lwZURhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXdpcGVEYXRhKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICBsb2dnZXIubG9nKFwiQ2xlYXJpbmcgZGF0YSBmcm9tIHNvZnQtbG9nZ2VkLW91dCBzZXNzaW9uXCIpO1xuICAgICAgICAgICAgICAgIExpZmVjeWNsZS5sb2dvdXQoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGFzeW5jIGluaXRMb2dpbigpIHtcbiAgICAgICAgY29uc3QgcXVlcnlQYXJhbXMgPSB0aGlzLnByb3BzLnJlYWxRdWVyeVBhcmFtcztcbiAgICAgICAgY29uc3QgaGFzQWxsUGFyYW1zID0gcXVlcnlQYXJhbXMgJiYgcXVlcnlQYXJhbXNbJ2xvZ2luVG9rZW4nXTtcbiAgICAgICAgaWYgKGhhc0FsbFBhcmFtcykge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxvZ2luVmlldzogTG9naW5WaWV3LkxvYWRpbmcgfSk7XG4gICAgICAgICAgICB0aGlzLnRyeVNzb0xvZ2luKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb3RlOiB3ZSBkb24ndCB1c2UgdGhlIGV4aXN0aW5nIExvZ2luIGNsYXNzIGJlY2F1c2UgaXQgaXMgaGVhdmlseSBmbG93LWJhc2VkLiBXZSBkb24ndFxuICAgICAgICAvLyBjYXJlIGFib3V0IGxvZ2luIGZsb3dzIGhlcmUsIHVubGVzcyBpdCBpcyB0aGUgc2luZ2xlIGZsb3cgd2Ugc3VwcG9ydC5cbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCBmbG93cyA9IChhd2FpdCBjbGllbnQubG9naW5GbG93cygpKS5mbG93cztcbiAgICAgICAgY29uc3QgbG9naW5WaWV3cyA9IGZsb3dzLm1hcChmID0+IFNUQVRJQ19GTE9XU19UT19WSUVXU1tmLnR5cGVdKTtcblxuICAgICAgICBjb25zdCBpc1NvY2lhbFNpZ25PbiA9IGxvZ2luVmlld3MuaW5jbHVkZXMoTG9naW5WaWV3LlBhc3N3b3JkKSAmJiBsb2dpblZpZXdzLmluY2x1ZGVzKExvZ2luVmlldy5TU08pO1xuICAgICAgICBjb25zdCBmaXJzdFZpZXcgPSBsb2dpblZpZXdzLmZpbHRlcihmID0+ICEhZilbMF0gfHwgTG9naW5WaWV3LlVuc3VwcG9ydGVkO1xuICAgICAgICBjb25zdCBjaG9zZW5WaWV3ID0gaXNTb2NpYWxTaWduT24gPyBMb2dpblZpZXcuUGFzc3dvcmRXaXRoU29jaWFsU2lnbk9uIDogZmlyc3RWaWV3O1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgZmxvd3MsIGxvZ2luVmlldzogY2hvc2VuVmlldyB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUGFzc3dvcmRDaGFuZ2UgPSAoZXYpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBhc3N3b3JkOiBldi50YXJnZXQudmFsdWUgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Gb3Jnb3RQYXNzd29yZCA9ICgpID0+IHtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiAnc3RhcnRfcGFzc3dvcmRfcmVjb3ZlcnknIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUGFzc3dvcmRMb2dpbiA9IGFzeW5jIChldikgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgYnVzeTogdHJ1ZSB9KTtcblxuICAgICAgICBjb25zdCBoc1VybCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRIb21lc2VydmVyVXJsKCk7XG4gICAgICAgIGNvbnN0IGlzVXJsID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldElkZW50aXR5U2VydmVyVXJsKCk7XG4gICAgICAgIGNvbnN0IGxvZ2luVHlwZSA9IFwibS5sb2dpbi5wYXNzd29yZFwiO1xuICAgICAgICBjb25zdCBsb2dpblBhcmFtcyA9IHtcbiAgICAgICAgICAgIGlkZW50aWZpZXI6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcIm0uaWQudXNlclwiLFxuICAgICAgICAgICAgICAgIHVzZXI6IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVc2VySWQoKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXNzd29yZDogdGhpcy5zdGF0ZS5wYXNzd29yZCxcbiAgICAgICAgICAgIGRldmljZV9pZDogTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldERldmljZUlkKCksXG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGNyZWRlbnRpYWxzID0gbnVsbDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNyZWRlbnRpYWxzID0gYXdhaXQgc2VuZExvZ2luUmVxdWVzdChoc1VybCwgaXNVcmwsIGxvZ2luVHlwZSwgbG9naW5QYXJhbXMpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBsZXQgZXJyb3JUZXh0ID0gX3QoXCJGYWlsZWQgdG8gcmUtYXV0aGVudGljYXRlIGR1ZSB0byBhIGhvbWVzZXJ2ZXIgcHJvYmxlbVwiKTtcbiAgICAgICAgICAgIGlmIChlLmVycmNvZGUgPT09IFwiTV9GT1JCSURERU5cIiAmJiAoZS5odHRwU3RhdHVzID09PSA0MDEgfHwgZS5odHRwU3RhdHVzID09PSA0MDMpKSB7XG4gICAgICAgICAgICAgICAgZXJyb3JUZXh0ID0gX3QoXCJJbmNvcnJlY3QgcGFzc3dvcmRcIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yVGV4dDogZXJyb3JUZXh0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBMaWZlY3ljbGUuaHlkcmF0ZVNlc3Npb24oY3JlZGVudGlhbHMpLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgYnVzeTogZmFsc2UsIGVycm9yVGV4dDogX3QoXCJGYWlsZWQgdG8gcmUtYXV0aGVudGljYXRlXCIpIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBhc3luYyB0cnlTc29Mb2dpbigpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGJ1c3k6IHRydWUgfSk7XG5cbiAgICAgICAgY29uc3QgaHNVcmwgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShTU09fSE9NRVNFUlZFUl9VUkxfS0VZKTtcbiAgICAgICAgY29uc3QgaXNVcmwgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShTU09fSURfU0VSVkVSX1VSTF9LRVkpIHx8IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRJZGVudGl0eVNlcnZlclVybCgpO1xuICAgICAgICBjb25zdCBsb2dpblR5cGUgPSBcIm0ubG9naW4udG9rZW5cIjtcbiAgICAgICAgY29uc3QgbG9naW5QYXJhbXMgPSB7XG4gICAgICAgICAgICB0b2tlbjogdGhpcy5wcm9wcy5yZWFsUXVlcnlQYXJhbXNbJ2xvZ2luVG9rZW4nXSxcbiAgICAgICAgICAgIGRldmljZV9pZDogTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldERldmljZUlkKCksXG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGNyZWRlbnRpYWxzID0gbnVsbDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNyZWRlbnRpYWxzID0gYXdhaXQgc2VuZExvZ2luUmVxdWVzdChoc1VybCwgaXNVcmwsIGxvZ2luVHlwZSwgbG9naW5QYXJhbXMpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgYnVzeTogZmFsc2UsIGxvZ2luVmlldzogTG9naW5WaWV3LlVuc3VwcG9ydGVkIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgTGlmZWN5Y2xlLmh5ZHJhdGVTZXNzaW9uKGNyZWRlbnRpYWxzKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm9uVG9rZW5Mb2dpbkNvbXBsZXRlZCkgdGhpcy5wcm9wcy5vblRva2VuTG9naW5Db21wbGV0ZWQoKTtcbiAgICAgICAgfSkuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBidXN5OiBmYWxzZSwgbG9naW5WaWV3OiBMb2dpblZpZXcuVW5zdXBwb3J0ZWQgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyUGFzc3dvcmRGb3JtKGludHJvVGV4dDogT3B0aW9uYWw8c3RyaW5nPik6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgbGV0IGVycm9yOiBKU1guRWxlbWVudCA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmVycm9yVGV4dCkge1xuICAgICAgICAgICAgZXJyb3IgPSA8c3BhbiBjbGFzc05hbWU9J214X0xvZ2luX2Vycm9yJz57IHRoaXMuc3RhdGUuZXJyb3JUZXh0IH08L3NwYW4+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxmb3JtIG9uU3VibWl0PXt0aGlzLm9uUGFzc3dvcmRMb2dpbn0+XG4gICAgICAgICAgICAgICAgeyBpbnRyb1RleHQgPyA8cD57IGludHJvVGV4dCB9PC9wPiA6IG51bGwgfVxuICAgICAgICAgICAgICAgIHsgZXJyb3IgfVxuICAgICAgICAgICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgICAgICAgICB0eXBlPVwicGFzc3dvcmRcIlxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJQYXNzd29yZFwiKX1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25QYXNzd29yZENoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUucGFzc3dvcmR9XG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLmJ1c3l9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uUGFzc3dvcmRMb2dpbn1cbiAgICAgICAgICAgICAgICAgICAga2luZD1cInByaW1hcnlcIlxuICAgICAgICAgICAgICAgICAgICB0eXBlPVwic3VibWl0XCJcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUuYnVzeX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJTaWduIEluXCIpIH1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17dGhpcy5vbkZvcmdvdFBhc3N3b3JkfSBraW5kPVwibGlua1wiPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiRm9yZ290dGVuIHlvdXIgcGFzc3dvcmQ/XCIpIH1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJTc29Gb3JtKGludHJvVGV4dDogT3B0aW9uYWw8c3RyaW5nPik6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgY29uc3QgbG9naW5UeXBlID0gdGhpcy5zdGF0ZS5sb2dpblZpZXcgPT09IExvZ2luVmlldy5DQVMgPyBcImNhc1wiIDogXCJzc29cIjtcbiAgICAgICAgY29uc3QgZmxvdyA9IHRoaXMuc3RhdGUuZmxvd3MuZmluZChmbG93ID0+IGZsb3cudHlwZSA9PT0gXCJtLmxvZ2luLlwiICsgbG9naW5UeXBlKSBhcyBJU1NPRmxvdztcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICB7IGludHJvVGV4dCA/IDxwPnsgaW50cm9UZXh0IH08L3A+IDogbnVsbCB9XG4gICAgICAgICAgICAgICAgPFNTT0J1dHRvbnNcbiAgICAgICAgICAgICAgICAgICAgbWF0cml4Q2xpZW50PXtNYXRyaXhDbGllbnRQZWcuZ2V0KCl9XG4gICAgICAgICAgICAgICAgICAgIGZsb3c9e2Zsb3d9XG4gICAgICAgICAgICAgICAgICAgIGxvZ2luVHlwZT17bG9naW5UeXBlfVxuICAgICAgICAgICAgICAgICAgICBmcmFnbWVudEFmdGVyTG9naW49e3RoaXMucHJvcHMuZnJhZ21lbnRBZnRlckxvZ2lufVxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5PXshdGhpcy5zdGF0ZS5mbG93cy5maW5kKGZsb3cgPT4gZmxvdy50eXBlID09PSBcIm0ubG9naW4ucGFzc3dvcmRcIil9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyU2lnbkluU2VjdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUubG9naW5WaWV3ID09PSBMb2dpblZpZXcuTG9hZGluZykge1xuICAgICAgICAgICAgcmV0dXJuIDxTcGlubmVyIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGludHJvVGV4dCA9IG51bGw7IC8vIG51bGwgaXMgdHJhbnNsYXRlZCB0byBzb21ldGhpbmcgYXJlYSBzcGVjaWZpYyBpbiB0aGlzIGZ1bmN0aW9uXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmtleUJhY2t1cE5lZWRlZCkge1xuICAgICAgICAgICAgaW50cm9UZXh0ID0gX3QoXG4gICAgICAgICAgICAgICAgXCJSZWdhaW4gYWNjZXNzIHRvIHlvdXIgYWNjb3VudCBhbmQgcmVjb3ZlciBlbmNyeXB0aW9uIGtleXMgc3RvcmVkIGluIHRoaXMgc2Vzc2lvbi4gXCIgK1xuICAgICAgICAgICAgICAgIFwiV2l0aG91dCB0aGVtLCB5b3Ugd29uJ3QgYmUgYWJsZSB0byByZWFkIGFsbCBvZiB5b3VyIHNlY3VyZSBtZXNzYWdlcyBpbiBhbnkgc2Vzc2lvbi5cIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5sb2dpblZpZXcgPT09IExvZ2luVmlldy5QYXNzd29yZCkge1xuICAgICAgICAgICAgaWYgKCFpbnRyb1RleHQpIHtcbiAgICAgICAgICAgICAgICBpbnRyb1RleHQgPSBfdChcIkVudGVyIHlvdXIgcGFzc3dvcmQgdG8gc2lnbiBpbiBhbmQgcmVnYWluIGFjY2VzcyB0byB5b3VyIGFjY291bnQuXCIpO1xuICAgICAgICAgICAgfSAvLyBlbHNlIHdlIGFscmVhZHkgaGF2ZSBhIG1lc3NhZ2UgYW5kIHNob3VsZCB1c2UgaXQgKGtleSBiYWNrdXAgd2FybmluZylcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVuZGVyUGFzc3dvcmRGb3JtKGludHJvVGV4dCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5sb2dpblZpZXcgPT09IExvZ2luVmlldy5TU08gfHwgdGhpcy5zdGF0ZS5sb2dpblZpZXcgPT09IExvZ2luVmlldy5DQVMpIHtcbiAgICAgICAgICAgIGlmICghaW50cm9UZXh0KSB7XG4gICAgICAgICAgICAgICAgaW50cm9UZXh0ID0gX3QoXCJTaWduIGluIGFuZCByZWdhaW4gYWNjZXNzIHRvIHlvdXIgYWNjb3VudC5cIik7XG4gICAgICAgICAgICB9IC8vIGVsc2Ugd2UgYWxyZWFkeSBoYXZlIGEgbWVzc2FnZSBhbmQgc2hvdWxkIHVzZSBpdCAoa2V5IGJhY2t1cCB3YXJuaW5nKVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZW5kZXJTc29Gb3JtKGludHJvVGV4dCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5sb2dpblZpZXcgPT09IExvZ2luVmlldy5QYXNzd29yZFdpdGhTb2NpYWxTaWduT24pIHtcbiAgICAgICAgICAgIGlmICghaW50cm9UZXh0KSB7XG4gICAgICAgICAgICAgICAgaW50cm9UZXh0ID0gX3QoXCJTaWduIGluIGFuZCByZWdhaW4gYWNjZXNzIHRvIHlvdXIgYWNjb3VudC5cIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFdlIHJlbmRlciBib3RoIGZvcm1zIHdpdGggbm8gaW50cm8vZXJyb3IgdG8gZW5zdXJlIHRoZSBsYXlvdXQgbG9va3MgcmVhc29uYWJseVxuICAgICAgICAgICAgLy8gb2theSBlbm91Z2guXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gTm90ZTogXCJteF9BdXRoQm9keV9jZW50ZXJlZFwiIHRleHQgdGFrZW4gZnJvbSByZWdpc3RyYXRpb24gcGFnZS5cbiAgICAgICAgICAgIHJldHVybiA8PlxuICAgICAgICAgICAgICAgIDxwPnsgaW50cm9UZXh0IH08L3A+XG4gICAgICAgICAgICAgICAgeyB0aGlzLnJlbmRlclNzb0Zvcm0obnVsbCkgfVxuICAgICAgICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJteF9BdXRoQm9keV9jZW50ZXJlZFwiPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCIlKHNzb0J1dHRvbnMpcyBPciAlKHVzZXJuYW1lUGFzc3dvcmQpc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNzb0J1dHRvbnM6IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXNlcm5hbWVQYXNzd29yZDogXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICkudHJpbSgpIH1cbiAgICAgICAgICAgICAgICA8L2gyPlxuICAgICAgICAgICAgICAgIHsgdGhpcy5yZW5kZXJQYXNzd29yZEZvcm0obnVsbCkgfVxuICAgICAgICAgICAgPC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGVmYXVsdDogYXNzdW1lIHVuc3VwcG9ydGVkL2Vycm9yXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICB7IF90KFxuICAgICAgICAgICAgICAgICAgICBcIllvdSBjYW5ub3Qgc2lnbiBpbiB0byB5b3VyIGFjY291bnQuIFBsZWFzZSBjb250YWN0IHlvdXIgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcImhvbWVzZXJ2ZXIgYWRtaW4gZm9yIG1vcmUgaW5mb3JtYXRpb24uXCIsXG4gICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICA8L3A+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxBdXRoUGFnZT5cbiAgICAgICAgICAgICAgICA8QXV0aEhlYWRlciAvPlxuICAgICAgICAgICAgICAgIDxBdXRoQm9keT5cbiAgICAgICAgICAgICAgICAgICAgPGgxPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIllvdSdyZSBzaWduZWQgb3V0XCIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9oMT5cblxuICAgICAgICAgICAgICAgICAgICA8aDI+eyBfdChcIlNpZ24gaW5cIikgfTwvaDI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHRoaXMucmVuZGVyU2lnbkluU2VjdGlvbigpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICAgICAgPGgyPnsgX3QoXCJDbGVhciBwZXJzb25hbCBkYXRhXCIpIH08L2gyPlxuICAgICAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJXYXJuaW5nOiBZb3VyIHBlcnNvbmFsIGRhdGEgKGluY2x1ZGluZyBlbmNyeXB0aW9uIGtleXMpIGlzIHN0aWxsIHN0b3JlZCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpbiB0aGlzIHNlc3Npb24uIENsZWFyIGl0IGlmIHlvdSdyZSBmaW5pc2hlZCB1c2luZyB0aGlzIHNlc3Npb24sIG9yIHdhbnQgdG8gc2lnbiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpbiB0byBhbm90aGVyIGFjY291bnQuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17dGhpcy5vbkNsZWFyQWxsfSBraW5kPVwiZGFuZ2VyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkNsZWFyIGFsbCBkYXRhXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9BdXRoQm9keT5cbiAgICAgICAgICAgIDwvQXV0aFBhZ2U+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQXNCS0EsUzs7V0FBQUEsUztFQUFBQSxTLENBQUFBLFM7RUFBQUEsUyxDQUFBQSxTO0VBQUFBLFMsQ0FBQUEsUztFQUFBQSxTLENBQUFBLFM7RUFBQUEsUyxDQUFBQSxTO0VBQUFBLFMsQ0FBQUEsUztHQUFBQSxTLEtBQUFBLFM7O0FBU0wsTUFBTUMscUJBQXFCLEdBQUc7RUFDMUIsb0JBQW9CRCxTQUFTLENBQUNFLFFBREo7RUFFMUIsZUFBZUYsU0FBUyxDQUFDRyxHQUZDO0VBRzFCLGVBQWVILFNBQVMsQ0FBQ0k7QUFIQyxDQUE5Qjs7QUEwQmUsTUFBTUMsVUFBTixTQUF5QkMsY0FBQSxDQUFNQyxTQUEvQixDQUF5RDtFQUM3REMsV0FBVyxDQUFDQyxLQUFELEVBQWdCO0lBQzlCLE1BQU1BLEtBQU47SUFEOEIsa0RBOEJiLE1BQU07TUFDdkJDLGNBQUEsQ0FBTUMsWUFBTixDQUFtQkMsZ0NBQW5CLEVBQTRDO1FBQ3hDQyxVQUFVLEVBQUdDLFFBQUQsSUFBYztVQUN0QixJQUFJLENBQUNBLFFBQUwsRUFBZTs7VUFFZkMsY0FBQSxDQUFPQyxHQUFQLENBQVcsNENBQVg7O1VBQ0FDLFNBQVMsQ0FBQ0MsTUFBVjtRQUNIO01BTnVDLENBQTVDO0lBUUgsQ0F2Q2lDO0lBQUEsd0RBOEROQyxFQUFELElB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