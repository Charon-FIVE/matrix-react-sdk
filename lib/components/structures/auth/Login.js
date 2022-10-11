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

var _languageHandler = require("../../../languageHandler");

var _Login = _interopRequireDefault(require("../../../Login"));

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _ErrorUtils = require("../../../utils/ErrorUtils");

var _AutoDiscoveryUtils = _interopRequireDefault(require("../../../utils/AutoDiscoveryUtils"));

var _AuthPage = _interopRequireDefault(require("../../views/auth/AuthPage"));

var _PlatformPeg = _interopRequireDefault(require("../../../PlatformPeg"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _UIFeature = require("../../../settings/UIFeature");

var _PasswordLogin = _interopRequireDefault(require("../../views/auth/PasswordLogin"));

var _InlineSpinner = _interopRequireDefault(require("../../views/elements/InlineSpinner"));

var _Spinner = _interopRequireDefault(require("../../views/elements/Spinner"));

var _SSOButtons = _interopRequireDefault(require("../../views/elements/SSOButtons"));

var _ServerPicker = _interopRequireDefault(require("../../views/elements/ServerPicker"));

var _AuthBody = _interopRequireDefault(require("../../views/auth/AuthBody"));

var _AuthHeader = _interopRequireDefault(require("../../views/auth/AuthHeader"));

var _AccessibleButton = _interopRequireDefault(require("../../views/elements/AccessibleButton"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

// These are used in several places, and come from the js-sdk's autodiscovery
// stuff. We define them here so that they'll be picked up by i18n.
(0, _languageHandler._td)("Invalid homeserver discovery response");
(0, _languageHandler._td)("Failed to get autodiscovery configuration from server");
(0, _languageHandler._td)("Invalid base_url for m.homeserver");
(0, _languageHandler._td)("Homeserver URL does not appear to be a valid Matrix homeserver");
(0, _languageHandler._td)("Invalid identity server discovery response");
(0, _languageHandler._td)("Invalid base_url for m.identity_server");
(0, _languageHandler._td)("Identity server URL does not appear to be a valid identity server");
(0, _languageHandler._td)("General failure");

/*
 * A wire component which glues together login UI components and Login logic
 */
class LoginComponent extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "unmounted", false);
    (0, _defineProperty2.default)(this, "loginLogic", void 0);
    (0, _defineProperty2.default)(this, "stepRendererMap", void 0);
    (0, _defineProperty2.default)(this, "isBusy", () => this.state.busy || this.props.busy);
    (0, _defineProperty2.default)(this, "onPasswordLogin", async (username, phoneCountry, phoneNumber, password) => {
      if (!this.state.serverIsAlive) {
        this.setState({
          busy: true
        }); // Do a quick liveliness check on the URLs

        let aliveAgain = true;

        try {
          await _AutoDiscoveryUtils.default.validateServerConfigWithStaticUrls(this.props.serverConfig.hsUrl, this.props.serverConfig.isUrl);
          this.setState({
            serverIsAlive: true,
            errorText: ""
          });
        } catch (e) {
          const componentState = _AutoDiscoveryUtils.default.authComponentStateForError(e);

          this.setState(_objectSpread({
            busy: false,
            busyLoggingIn: false
          }, componentState));
          aliveAgain = !componentState.serverErrorIsFatal;
        } // Prevent people from submitting their password when something isn't right.


        if (!aliveAgain) {
          return;
        }
      }

      this.setState({
        busy: true,
        busyLoggingIn: true,
        errorText: null,
        loginIncorrect: false
      });
      this.loginLogic.loginViaPassword(username, phoneCountry, phoneNumber, password).then(data => {
        this.setState({
          serverIsAlive: true
        }); // it must be, we logged in.

        this.props.onLoggedIn(data, password);
      }, error => {
        if (this.unmounted) {
          return;
        }

        let errorText; // Some error strings only apply for logging in

        const usingEmail = username.indexOf("@") > 0;

        if (error.httpStatus === 400 && usingEmail) {
          errorText = (0, _languageHandler._t)('This homeserver does not support login using email address.');
        } else if (error.errcode === 'M_RESOURCE_LIMIT_EXCEEDED') {
          const errorTop = (0, _ErrorUtils.messageForResourceLimitError)(error.data.limit_type, error.data.admin_contact, {
            'monthly_active_user': (0, _languageHandler._td)("This homeserver has hit its Monthly Active User limit."),
            'hs_blocked': (0, _languageHandler._td)("This homeserver has been blocked by its administrator."),
            '': (0, _languageHandler._td)("This homeserver has exceeded one of its resource limits.")
          });
          const errorDetail = (0, _ErrorUtils.messageForResourceLimitError)(error.data.limit_type, error.data.admin_contact, {
            '': (0, _languageHandler._td)("Please <a>contact your service administrator</a> to continue using this service.")
          });
          errorText = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null, errorTop), /*#__PURE__*/_react.default.createElement("div", {
            className: "mx_Login_smallError"
          }, errorDetail));
        } else if (error.httpStatus === 401 || error.httpStatus === 403) {
          if (error.errcode === 'M_USER_DEACTIVATED') {
            errorText = (0, _languageHandler._t)('This account has been deactivated.');
          } else if (_SdkConfig.default.get("disable_custom_urls")) {
            errorText = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)('Incorrect username and/or password.')), /*#__PURE__*/_react.default.createElement("div", {
              className: "mx_Login_smallError"
            }, (0, _languageHandler._t)('Please note you are logging into the %(hs)s server, not matrix.org.', {
              hs: this.props.serverConfig.hsName
            })));
          } else {
            errorText = (0, _languageHandler._t)('Incorrect username and/or password.');
          }
        } else {
          // other errors, not specific to doing a password login
          errorText = this.errorTextFromError(error);
        }

        this.setState({
          busy: false,
          busyLoggingIn: false,
          errorText: errorText,
          // 401 would be the sensible status code for 'incorrect password'
          // but the login API gives a 403 https://matrix.org/jira/browse/SYN-744
          // mentions this (although the bug is for UI auth which is not this)
          // We treat both as an incorrect password
          loginIncorrect: error.httpStatus === 401 || error.httpStatus === 403
        });
      });
    });
    (0, _defineProperty2.default)(this, "onUsernameChanged", username => {
      this.setState({
        username: username
      });
    });
    (0, _defineProperty2.default)(this, "onUsernameBlur", async username => {
      const doWellknownLookup = username[0] === "@";
      this.setState({
        username: username,
        busy: doWellknownLookup,
        errorText: null,
        canTryLogin: true
      });

      if (doWellknownLookup) {
        const serverName = username.split(':').slice(1).join(':');

        try {
          const result = await _AutoDiscoveryUtils.default.validateServerName(serverName);
          this.props.onServerConfigChange(result); // We'd like to rely on new props coming in via `onServerConfigChange`
          // so that we know the servers have definitely updated before clearing
          // the busy state. In the case of a full MXID that resolves to the same
          // HS as Element's default HS though, there may not be any server change.
          // To avoid this trap, we clear busy here. For cases where the server
          // actually has changed, `initLoginLogic` will be called and manages
          // busy state for its own liveness check.

          this.setState({
            busy: false
          });
        } catch (e) {
          _logger.logger.error("Problem parsing URL or unhandled error doing .well-known discovery:", e);

          let message = (0, _languageHandler._t)("Failed to perform homeserver discovery");

          if (e.translatedMessage) {
            message = e.translatedMessage;
          }

          let errorText = message;
          let discoveryState = {};

          if (_AutoDiscoveryUtils.default.isLivelinessError(e)) {
            errorText = this.state.errorText;
            discoveryState = _AutoDiscoveryUtils.default.authComponentStateForError(e);
          }

          this.setState(_objectSpread({
            busy: false,
            errorText
          }, discoveryState));
        }
      }
    });
    (0, _defineProperty2.default)(this, "onPhoneCountryChanged", phoneCountry => {
      this.setState({
        phoneCountry: phoneCountry
      });
    });
    (0, _defineProperty2.default)(this, "onPhoneNumberChanged", phoneNumber => {
      this.setState({
        phoneNumber: phoneNumber
      });
    });
    (0, _defineProperty2.default)(this, "onRegisterClick", ev => {
      ev.preventDefault();
      ev.stopPropagation();
      this.props.onRegisterClick();
    });
    (0, _defineProperty2.default)(this, "onTryRegisterClick", ev => {
      const hasPasswordFlow = this.state.flows?.find(flow => flow.type === "m.login.password");
      const ssoFlow = this.state.flows?.find(flow => flow.type === "m.login.sso" || flow.type === "m.login.cas"); // If has no password flow but an SSO flow guess that the user wants to register with SSO.
      // TODO: instead hide the Register button if registration is disabled by checking with the server,
      // has no specific errCode currently and uses M_FORBIDDEN.

      if (ssoFlow && !hasPasswordFlow) {
        ev.preventDefault();
        ev.stopPropagation();
        const ssoKind = ssoFlow.type === 'm.login.sso' ? 'sso' : 'cas';

        _PlatformPeg.default.get().startSingleSignOn(this.loginLogic.createTemporaryClient(), ssoKind, this.props.fragmentAfterLogin);
      } else {
        // Don't intercept - just go through to the register page
        this.onRegisterClick(ev);
      }
    });
    (0, _defineProperty2.default)(this, "isSupportedFlow", flow => {
      // technically the flow can have multiple steps, but no one does this
      // for login and loginLogic doesn't support it so we can ignore it.
      if (!this.stepRendererMap[flow.type]) {
        _logger.logger.log("Skipping flow", flow, "due to unsupported login type", flow.type);

        return false;
      }

      return true;
    });
    (0, _defineProperty2.default)(this, "renderPasswordStep", () => {
      return /*#__PURE__*/_react.default.createElement(_PasswordLogin.default, {
        onSubmit: this.onPasswordLogin,
        username: this.state.username,
        phoneCountry: this.state.phoneCountry,
        phoneNumber: this.state.phoneNumber,
        onUsernameChanged: this.onUsernameChanged,
        onUsernameBlur: this.onUsernameBlur,
        onPhoneCountryChanged: this.onPhoneCountryChanged,
        onPhoneNumberChanged: this.onPhoneNumberChanged,
        onForgotPasswordClick: this.props.onForgotPasswordClick,
        loginIncorrect: this.state.loginIncorrect,
        serverConfig: this.props.serverConfig,
        disableSubmit: this.isBusy(),
        busy: this.props.isSyncing || this.state.busyLoggingIn
      });
    });
    (0, _defineProperty2.default)(this, "renderSsoStep", loginType => {
      const flow = this.state.flows.find(flow => flow.type === "m.login." + loginType);
      return /*#__PURE__*/_react.default.createElement(_SSOButtons.default, {
        matrixClient: this.loginLogic.createTemporaryClient(),
        flow: flow,
        loginType: loginType,
        fragmentAfterLogin: this.props.fragmentAfterLogin,
        primary: !this.state.flows.find(flow => flow.type === "m.login.password")
      });
    });
    this.state = {
      busy: false,
      busyLoggingIn: null,
      errorText: null,
      loginIncorrect: false,
      canTryLogin: true,
      flows: null,
      username: props.defaultUsername ? props.defaultUsername : '',
      phoneCountry: null,
      phoneNumber: "",
      serverIsAlive: true,
      serverErrorIsFatal: false,
      serverDeadError: ""
    }; // map from login step type to a function which will render a control
    // letting you do that login type

    this.stepRendererMap = {
      'm.login.password': this.renderPasswordStep,
      // CAS and SSO are the same thing, modulo the url we link to
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'm.login.cas': () => this.renderSsoStep("cas"),
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'm.login.sso': () => this.renderSsoStep("sso")
    };
  } // TODO: [REACT-WARNING] Replace with appropriate lifecycle event
  // eslint-disable-next-line


  UNSAFE_componentWillMount() {
    this.initLoginLogic(this.props.serverConfig);
  }

  componentWillUnmount() {
    this.unmounted = true;
  } // TODO: [REACT-WARNING] Replace with appropriate lifecycle event
  // eslint-disable-next-line


  UNSAFE_componentWillReceiveProps(newProps) {
    if (newProps.serverConfig.hsUrl === this.props.serverConfig.hsUrl && newProps.serverConfig.isUrl === this.props.serverConfig.isUrl) return; // Ensure that we end up actually logging in to the right place

    this.initLoginLogic(newProps.serverConfig);
  }

  async initLoginLogic(_ref) {
    let {
      hsUrl,
      isUrl
    } = _ref;
    let isDefaultServer = false;

    if (this.props.serverConfig.isDefault && hsUrl === this.props.serverConfig.hsUrl && isUrl === this.props.serverConfig.isUrl) {
      isDefaultServer = true;
    }

    const fallbackHsUrl = isDefaultServer ? this.props.fallbackHsUrl : null;
    const loginLogic = new _Login.default(hsUrl, isUrl, fallbackHsUrl, {
      defaultDeviceDisplayName: this.props.defaultDeviceDisplayName
    });
    this.loginLogic = loginLogic;
    this.setState({
      busy: true,
      loginIncorrect: false
    }); // Do a quick liveliness check on the URLs

    try {
      const {
        warning
      } = await _AutoDiscoveryUtils.default.validateServerConfigWithStaticUrls(hsUrl, isUrl);

      if (warning) {
        this.setState(_objectSpread(_objectSpread({}, _AutoDiscoveryUtils.default.authComponentStateForError(warning)), {}, {
          errorText: ""
        }));
      } else {
        this.setState({
          serverIsAlive: true,
          errorText: ""
        });
      }
    } catch (e) {
      this.setState(_objectSpread({
        busy: false
      }, _AutoDiscoveryUtils.default.authComponentStateForError(e)));
    }

    loginLogic.getFlows().then(flows => {
      // look for a flow where we understand all of the steps.
      const supportedFlows = flows.filter(this.isSupportedFlow);

      if (supportedFlows.length > 0) {
        this.setState({
          flows: supportedFlows
        });
        return;
      } // we got to the end of the list without finding a suitable flow.


      this.setState({
        errorText: (0, _languageHandler._t)("This homeserver doesn't offer any login flows which are supported by this client.")
      });
    }, err => {
      this.setState({
        errorText: this.errorTextFromError(err),
        loginIncorrect: false,
        canTryLogin: false
      });
    }).finally(() => {
      this.setState({
        busy: false
      });
    });
  }

  errorTextFromError(err) {
    let errCode = err.errcode;

    if (!errCode && err.httpStatus) {
      errCode = "HTTP " + err.httpStatus;
    }

    let errorText = (0, _languageHandler._t)("There was a problem communicating with the homeserver, " + "please try again later.") + (errCode ? " (" + errCode + ")" : "");

    if (err["cors"] === 'rejected') {
      // browser-request specific error field
      if (window.location.protocol === 'https:' && (this.props.serverConfig.hsUrl.startsWith("http:") || !this.props.serverConfig.hsUrl.startsWith("http"))) {
        errorText = /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Can't connect to homeserver via HTTP when an HTTPS URL is in your browser bar. " + "Either use HTTPS or <a>enable unsafe scripts</a>.", {}, {
          'a': sub => {
            return /*#__PURE__*/_react.default.createElement("a", {
              target: "_blank",
              rel: "noreferrer noopener",
              href: "https://www.google.com/search?&q=enable%20unsafe%20scripts"
            }, sub);
          }
        }));
      } else {
        errorText = /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Can't connect to homeserver - please check your connectivity, ensure your " + "<a>homeserver's SSL certificate</a> is trusted, and that a browser extension " + "is not blocking requests.", {}, {
          'a': sub => /*#__PURE__*/_react.default.createElement("a", {
            target: "_blank",
            rel: "noreferrer noopener",
            href: this.props.serverConfig.hsUrl
          }, sub)
        }));
      }
    }

    return errorText;
  }

  renderLoginComponentForFlows() {
    if (!this.state.flows) return null; // this is the ideal order we want to show the flows in

    const order = ["m.login.password", "m.login.sso"];
    const flows = order.map(type => this.state.flows.find(flow => flow.type === type)).filter(Boolean);
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, flows.map(flow => {
      const stepRenderer = this.stepRendererMap[flow.type];
      return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, {
        key: flow.type
      }, stepRenderer());
    }));
  }

  render() {
    const loader = this.isBusy() && !this.state.busyLoggingIn ? /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Login_loader"
    }, /*#__PURE__*/_react.default.createElement(_Spinner.default, null)) : null;
    const errorText = this.state.errorText;
    let errorTextSection;

    if (errorText) {
      errorTextSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Login_error"
      }, errorText);
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

    let footer;

    if (this.props.isSyncing || this.state.busyLoggingIn) {
      footer = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_AuthBody_paddedFooter"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_AuthBody_paddedFooter_title"
      }, /*#__PURE__*/_react.default.createElement(_InlineSpinner.default, {
        w: 20,
        h: 20
      }), this.props.isSyncing ? (0, _languageHandler._t)("Syncing...") : (0, _languageHandler._t)("Signing In...")), this.props.isSyncing && /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_AuthBody_paddedFooter_subtitle"
      }, (0, _languageHandler._t)("If you've joined lots of rooms, this might take a while")));
    } else if (_SettingsStore.default.getValue(_UIFeature.UIFeature.Registration)) {
      footer = /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_AuthBody_changeFlow"
      }, (0, _languageHandler._t)("New? <a>Create account</a>", {}, {
        a: sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          kind: "link_inline",
          onClick: this.onTryRegisterClick
        }, sub)
      }));
    }

    return /*#__PURE__*/_react.default.createElement(_AuthPage.default, null, /*#__PURE__*/_react.default.createElement(_AuthHeader.default, {
      disableLanguageSelector: this.props.isSyncing || this.state.busyLoggingIn
    }), /*#__PURE__*/_react.default.createElement(_AuthBody.default, null, /*#__PURE__*/_react.default.createElement("h1", null, (0, _languageHandler._t)('Sign in'), loader), errorTextSection, serverDeadSection, /*#__PURE__*/_react.default.createElement(_ServerPicker.default, {
      serverConfig: this.props.serverConfig,
      onServerConfigChange: this.props.onServerConfigChange
    }), this.renderLoginComponentForFlows(), footer));
  }

}

exports.default = LoginComponent;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfdGQiLCJMb2dpbkNvbXBvbmVudCIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJzdGF0ZSIsImJ1c3kiLCJ1c2VybmFtZSIsInBob25lQ291bnRyeSIsInBob25lTnVtYmVyIiwicGFzc3dvcmQiLCJzZXJ2ZXJJc0FsaXZlIiwic2V0U3RhdGUiLCJhbGl2ZUFnYWluIiwiQXV0b0Rpc2NvdmVyeVV0aWxzIiwidmFsaWRhdGVTZXJ2ZXJDb25maWdXaXRoU3RhdGljVXJscyIsInNlcnZlckNvbmZpZyIsImhzVXJsIiwiaXNVcmwiLCJlcnJvclRleHQiLCJlIiwiY29tcG9uZW50U3RhdGUiLCJhdXRoQ29tcG9uZW50U3RhdGVGb3JFcnJvciIsImJ1c3lMb2dnaW5nSW4iLCJzZXJ2ZXJFcnJvcklzRmF0YWwiLCJsb2dpbkluY29ycmVjdCIsImxvZ2luTG9naWMiLCJsb2dpblZpYVBhc3N3b3JkIiwidGhlbiIsImRhdGEiLCJvbkxvZ2dlZEluIiwiZXJyb3IiLCJ1bm1vdW50ZWQiLCJ1c2luZ0VtYWlsIiwiaW5kZXhPZiIsImh0dHBTdGF0dXMiLCJfdCIsImVycmNvZGUiLCJlcnJvclRvcCIsIm1lc3NhZ2VGb3JSZXNvdXJjZUxpbWl0RXJyb3IiLCJsaW1pdF90eXBlIiwiYWRtaW5fY29udGFjdCIsImVycm9yRGV0YWlsIiwiU2RrQ29uZmlnIiwiZ2V0IiwiaHMiLCJoc05hbWUiLCJlcnJvclRleHRGcm9tRXJyb3IiLCJkb1dlbGxrbm93bkxvb2t1cCIsImNhblRyeUxvZ2luIiwic2VydmVyTmFtZSIsInNwbGl0Iiwic2xpY2UiLCJqb2luIiwicmVzdWx0IiwidmFsaWRhdGVTZXJ2ZXJOYW1lIiwib25TZXJ2ZXJDb25maWdDaGFuZ2UiLCJsb2dnZXIiLCJtZXNzYWdlIiwidHJhbnNsYXRlZE1lc3NhZ2UiLCJkaXNjb3ZlcnlTdGF0ZSIsImlzTGl2ZWxpbmVzc0Vycm9yIiwiZXYiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsIm9uUmVnaXN0ZXJDbGljayIsImhhc1Bhc3N3b3JkRmxvdyIsImZsb3dzIiwiZmluZCIsImZsb3ciLCJ0eXBlIiwic3NvRmxvdyIsInNzb0tpbmQiLCJQbGF0Zm9ybVBlZyIsInN0YXJ0U2luZ2xlU2lnbk9uIiwiY3JlYXRlVGVtcG9yYXJ5Q2xpZW50IiwiZnJhZ21lbnRBZnRlckxvZ2luIiwic3RlcFJlbmRlcmVyTWFwIiwibG9nIiwib25QYXNzd29yZExvZ2luIiwib25Vc2VybmFtZUNoYW5nZWQiLCJvblVzZXJuYW1lQmx1ciIsIm9uUGhvbmVDb3VudHJ5Q2hhbmdlZCIsIm9uUGhvbmVOdW1iZXJDaGFuZ2VkIiwib25Gb3Jnb3RQYXNzd29yZENsaWNrIiwiaXNCdXN5IiwiaXNTeW5jaW5nIiwibG9naW5UeXBlIiwiZGVmYXVsdFVzZXJuYW1lIiwic2VydmVyRGVhZEVycm9yIiwicmVuZGVyUGFzc3dvcmRTdGVwIiwicmVuZGVyU3NvU3RlcCIsIlVOU0FGRV9jb21wb25lbnRXaWxsTW91bnQiLCJpbml0TG9naW5Mb2dpYyIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwiVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJuZXdQcm9wcyIsImlzRGVmYXVsdFNlcnZlciIsImlzRGVmYXVsdCIsImZhbGxiYWNrSHNVcmwiLCJMb2dpbiIsImRlZmF1bHREZXZpY2VEaXNwbGF5TmFtZSIsIndhcm5pbmciLCJnZXRGbG93cyIsInN1cHBvcnRlZEZsb3dzIiwiZmlsdGVyIiwiaXNTdXBwb3J0ZWRGbG93IiwibGVuZ3RoIiwiZXJyIiwiZmluYWxseSIsImVyckNvZGUiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsInByb3RvY29sIiwic3RhcnRzV2l0aCIsInN1YiIsInJlbmRlckxvZ2luQ29tcG9uZW50Rm9yRmxvd3MiLCJvcmRlciIsIm1hcCIsIkJvb2xlYW4iLCJzdGVwUmVuZGVyZXIiLCJyZW5kZXIiLCJsb2FkZXIiLCJlcnJvclRleHRTZWN0aW9uIiwic2VydmVyRGVhZFNlY3Rpb24iLCJjbGFzc2VzIiwiY2xhc3NOYW1lcyIsImZvb3RlciIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsIlVJRmVhdHVyZSIsIlJlZ2lzdHJhdGlvbiIsImEiLCJvblRyeVJlZ2lzdGVyQ2xpY2siXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy9zdHJ1Y3R1cmVzL2F1dGgvTG9naW4udHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNS0yMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IFJlYWN0Tm9kZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IE1hdHJpeEVycm9yIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2h0dHAtYXBpXCI7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tIFwiY2xhc3NuYW1lc1wiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuXG5pbXBvcnQgeyBfdCwgX3RkIH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBMb2dpbiwgeyBJU1NPRmxvdywgTG9naW5GbG93IH0gZnJvbSAnLi4vLi4vLi4vTG9naW4nO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tICcuLi8uLi8uLi9TZGtDb25maWcnO1xuaW1wb3J0IHsgbWVzc2FnZUZvclJlc291cmNlTGltaXRFcnJvciB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL0Vycm9yVXRpbHMnO1xuaW1wb3J0IEF1dG9EaXNjb3ZlcnlVdGlscyBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvQXV0b0Rpc2NvdmVyeVV0aWxzXCI7XG5pbXBvcnQgQXV0aFBhZ2UgZnJvbSBcIi4uLy4uL3ZpZXdzL2F1dGgvQXV0aFBhZ2VcIjtcbmltcG9ydCBQbGF0Zm9ybVBlZyBmcm9tICcuLi8uLi8uLi9QbGF0Zm9ybVBlZyc7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHsgVUlGZWF0dXJlIH0gZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1VJRmVhdHVyZVwiO1xuaW1wb3J0IHsgSU1hdHJpeENsaWVudENyZWRzIH0gZnJvbSBcIi4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IFBhc3N3b3JkTG9naW4gZnJvbSBcIi4uLy4uL3ZpZXdzL2F1dGgvUGFzc3dvcmRMb2dpblwiO1xuaW1wb3J0IElubGluZVNwaW5uZXIgZnJvbSBcIi4uLy4uL3ZpZXdzL2VsZW1lbnRzL0lubGluZVNwaW5uZXJcIjtcbmltcG9ydCBTcGlubmVyIGZyb20gXCIuLi8uLi92aWV3cy9lbGVtZW50cy9TcGlubmVyXCI7XG5pbXBvcnQgU1NPQnV0dG9ucyBmcm9tIFwiLi4vLi4vdmlld3MvZWxlbWVudHMvU1NPQnV0dG9uc1wiO1xuaW1wb3J0IFNlcnZlclBpY2tlciBmcm9tIFwiLi4vLi4vdmlld3MvZWxlbWVudHMvU2VydmVyUGlja2VyXCI7XG5pbXBvcnQgQXV0aEJvZHkgZnJvbSBcIi4uLy4uL3ZpZXdzL2F1dGgvQXV0aEJvZHlcIjtcbmltcG9ydCBBdXRoSGVhZGVyIGZyb20gXCIuLi8uLi92aWV3cy9hdXRoL0F1dGhIZWFkZXJcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gJy4uLy4uL3ZpZXdzL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b24nO1xuaW1wb3J0IHsgVmFsaWRhdGVkU2VydmVyQ29uZmlnIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvVmFsaWRhdGVkU2VydmVyQ29uZmlnJztcblxuLy8gVGhlc2UgYXJlIHVzZWQgaW4gc2V2ZXJhbCBwbGFjZXMsIGFuZCBjb21lIGZyb20gdGhlIGpzLXNkaydzIGF1dG9kaXNjb3Zlcnlcbi8vIHN0dWZmLiBXZSBkZWZpbmUgdGhlbSBoZXJlIHNvIHRoYXQgdGhleSdsbCBiZSBwaWNrZWQgdXAgYnkgaTE4bi5cbl90ZChcIkludmFsaWQgaG9tZXNlcnZlciBkaXNjb3ZlcnkgcmVzcG9uc2VcIik7XG5fdGQoXCJGYWlsZWQgdG8gZ2V0IGF1dG9kaXNjb3ZlcnkgY29uZmlndXJhdGlvbiBmcm9tIHNlcnZlclwiKTtcbl90ZChcIkludmFsaWQgYmFzZV91cmwgZm9yIG0uaG9tZXNlcnZlclwiKTtcbl90ZChcIkhvbWVzZXJ2ZXIgVVJMIGRvZXMgbm90IGFwcGVhciB0byBiZSBhIHZhbGlkIE1hdHJpeCBob21lc2VydmVyXCIpO1xuX3RkKFwiSW52YWxpZCBpZGVudGl0eSBzZXJ2ZXIgZGlzY292ZXJ5IHJlc3BvbnNlXCIpO1xuX3RkKFwiSW52YWxpZCBiYXNlX3VybCBmb3IgbS5pZGVudGl0eV9zZXJ2ZXJcIik7XG5fdGQoXCJJZGVudGl0eSBzZXJ2ZXIgVVJMIGRvZXMgbm90IGFwcGVhciB0byBiZSBhIHZhbGlkIGlkZW50aXR5IHNlcnZlclwiKTtcbl90ZChcIkdlbmVyYWwgZmFpbHVyZVwiKTtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgc2VydmVyQ29uZmlnOiBWYWxpZGF0ZWRTZXJ2ZXJDb25maWc7XG4gICAgLy8gSWYgdHJ1ZSwgdGhlIGNvbXBvbmVudCB3aWxsIGNvbnNpZGVyIGl0c2VsZiBidXN5LlxuICAgIGJ1c3k/OiBib29sZWFuO1xuICAgIGlzU3luY2luZz86IGJvb2xlYW47XG4gICAgLy8gU2Vjb25kYXJ5IEhTIHdoaWNoIHdlIHRyeSB0byBsb2cgaW50byBpZiB0aGUgdXNlciBpcyB1c2luZ1xuICAgIC8vIHRoZSBkZWZhdWx0IEhTIGJ1dCBsb2dpbiBmYWlscy4gVXNlZnVsIGZvciBtaWdyYXRpbmcgdG8gYVxuICAgIC8vIGRpZmZlcmVudCBob21lc2VydmVyIHdpdGhvdXQgY29uZnVzaW5nIHVzZXJzLlxuICAgIGZhbGxiYWNrSHNVcmw/OiBzdHJpbmc7XG4gICAgZGVmYXVsdERldmljZURpc3BsYXlOYW1lPzogc3RyaW5nO1xuICAgIGZyYWdtZW50QWZ0ZXJMb2dpbj86IHN0cmluZztcbiAgICBkZWZhdWx0VXNlcm5hbWU/OiBzdHJpbmc7XG5cbiAgICAvLyBDYWxsZWQgd2hlbiB0aGUgdXNlciBoYXMgbG9nZ2VkIGluLiBQYXJhbXM6XG4gICAgLy8gLSBUaGUgb2JqZWN0IHJldHVybmVkIGJ5IHRoZSBsb2dpbiBBUElcbiAgICAvLyAtIFRoZSB1c2VyJ3MgcGFzc3dvcmQsIGlmIGFwcGxpY2FibGUsIChtYXkgYmUgY2FjaGVkIGluIG1lbW9yeSBmb3IgYVxuICAgIC8vICAgc2hvcnQgdGltZSBzbyB0aGUgdXNlciBpcyBub3QgcmVxdWlyZWQgdG8gcmUtZW50ZXIgdGhlaXIgcGFzc3dvcmRcbiAgICAvLyAgIGZvciBvcGVyYXRpb25zIGxpa2UgdXBsb2FkaW5nIGNyb3NzLXNpZ25pbmcga2V5cykuXG4gICAgb25Mb2dnZWRJbihkYXRhOiBJTWF0cml4Q2xpZW50Q3JlZHMsIHBhc3N3b3JkOiBzdHJpbmcpOiB2b2lkO1xuXG4gICAgLy8gbG9naW4gc2hvdWxkbid0IGtub3cgb3IgY2FyZSBob3cgcmVnaXN0cmF0aW9uLCBwYXNzd29yZCByZWNvdmVyeSwgZXRjIGlzIGRvbmUuXG4gICAgb25SZWdpc3RlckNsaWNrKCk6IHZvaWQ7XG4gICAgb25Gb3Jnb3RQYXNzd29yZENsaWNrPygpOiB2b2lkO1xuICAgIG9uU2VydmVyQ29uZmlnQ2hhbmdlKGNvbmZpZzogVmFsaWRhdGVkU2VydmVyQ29uZmlnKTogdm9pZDtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgYnVzeTogYm9vbGVhbjtcbiAgICBidXN5TG9nZ2luZ0luPzogYm9vbGVhbjtcbiAgICBlcnJvclRleHQ/OiBSZWFjdE5vZGU7XG4gICAgbG9naW5JbmNvcnJlY3Q6IGJvb2xlYW47XG4gICAgLy8gY2FuIHdlIGF0dGVtcHQgdG8gbG9nIGluIG9yIGFyZSB0aGVyZSB2YWxpZGF0aW9uIGVycm9ycz9cbiAgICBjYW5UcnlMb2dpbjogYm9vbGVhbjtcblxuICAgIGZsb3dzPzogTG9naW5GbG93W107XG5cbiAgICAvLyB1c2VkIGZvciBwcmVzZXJ2aW5nIGZvcm0gdmFsdWVzIHdoZW4gY2hhbmdpbmcgaG9tZXNlcnZlclxuICAgIHVzZXJuYW1lOiBzdHJpbmc7XG4gICAgcGhvbmVDb3VudHJ5Pzogc3RyaW5nO1xuICAgIHBob25lTnVtYmVyOiBzdHJpbmc7XG5cbiAgICAvLyBXZSBwZXJmb3JtIGxpdmVsaW5lc3MgY2hlY2tzIGxhdGVyLCBidXQgZm9yIG5vdyBzdXBwcmVzcyB0aGUgZXJyb3JzLlxuICAgIC8vIFdlIGFsc28gdHJhY2sgdGhlIHNlcnZlciBkZWFkIGVycm9ycyBpbmRlcGVuZGVudGx5IG9mIHRoZSByZWd1bGFyIGVycm9ycyBzb1xuICAgIC8vIHRoYXQgd2UgY2FuIHJlbmRlciBpdCBkaWZmZXJlbnRseSwgYW5kIG92ZXJyaWRlIGFueSBvdGhlciBlcnJvciB0aGUgdXNlciBtYXlcbiAgICAvLyBiZSBzZWVpbmcuXG4gICAgc2VydmVySXNBbGl2ZTogYm9vbGVhbjtcbiAgICBzZXJ2ZXJFcnJvcklzRmF0YWw6IGJvb2xlYW47XG4gICAgc2VydmVyRGVhZEVycm9yPzogUmVhY3ROb2RlO1xufVxuXG4vKlxuICogQSB3aXJlIGNvbXBvbmVudCB3aGljaCBnbHVlcyB0b2dldGhlciBsb2dpbiBVSSBjb21wb25lbnRzIGFuZCBMb2dpbiBsb2dpY1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMb2dpbkNvbXBvbmVudCBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIHVubW91bnRlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgbG9naW5Mb2dpYzogTG9naW47XG5cbiAgICBwcml2YXRlIHJlYWRvbmx5IHN0ZXBSZW5kZXJlck1hcDogUmVjb3JkPHN0cmluZywgKCkgPT4gUmVhY3ROb2RlPjtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICBidXN5TG9nZ2luZ0luOiBudWxsLFxuICAgICAgICAgICAgZXJyb3JUZXh0OiBudWxsLFxuICAgICAgICAgICAgbG9naW5JbmNvcnJlY3Q6IGZhbHNlLFxuICAgICAgICAgICAgY2FuVHJ5TG9naW46IHRydWUsXG5cbiAgICAgICAgICAgIGZsb3dzOiBudWxsLFxuXG4gICAgICAgICAgICB1c2VybmFtZTogcHJvcHMuZGVmYXVsdFVzZXJuYW1lPyBwcm9wcy5kZWZhdWx0VXNlcm5hbWU6ICcnLFxuICAgICAgICAgICAgcGhvbmVDb3VudHJ5OiBudWxsLFxuICAgICAgICAgICAgcGhvbmVOdW1iZXI6IFwiXCIsXG5cbiAgICAgICAgICAgIHNlcnZlcklzQWxpdmU6IHRydWUsXG4gICAgICAgICAgICBzZXJ2ZXJFcnJvcklzRmF0YWw6IGZhbHNlLFxuICAgICAgICAgICAgc2VydmVyRGVhZEVycm9yOiBcIlwiLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIG1hcCBmcm9tIGxvZ2luIHN0ZXAgdHlwZSB0byBhIGZ1bmN0aW9uIHdoaWNoIHdpbGwgcmVuZGVyIGEgY29udHJvbFxuICAgICAgICAvLyBsZXR0aW5nIHlvdSBkbyB0aGF0IGxvZ2luIHR5cGVcbiAgICAgICAgdGhpcy5zdGVwUmVuZGVyZXJNYXAgPSB7XG4gICAgICAgICAgICAnbS5sb2dpbi5wYXNzd29yZCc6IHRoaXMucmVuZGVyUGFzc3dvcmRTdGVwLFxuXG4gICAgICAgICAgICAvLyBDQVMgYW5kIFNTTyBhcmUgdGhlIHNhbWUgdGhpbmcsIG1vZHVsbyB0aGUgdXJsIHdlIGxpbmsgdG9cbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbmFtaW5nLWNvbnZlbnRpb25cbiAgICAgICAgICAgICdtLmxvZ2luLmNhcyc6ICgpID0+IHRoaXMucmVuZGVyU3NvU3RlcChcImNhc1wiKSxcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbmFtaW5nLWNvbnZlbnRpb25cbiAgICAgICAgICAgICdtLmxvZ2luLnNzbyc6ICgpID0+IHRoaXMucmVuZGVyU3NvU3RlcChcInNzb1wiKSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBbUkVBQ1QtV0FSTklOR10gUmVwbGFjZSB3aXRoIGFwcHJvcHJpYXRlIGxpZmVjeWNsZSBldmVudFxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuICAgIFVOU0FGRV9jb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgICAgIHRoaXMuaW5pdExvZ2luTG9naWModGhpcy5wcm9wcy5zZXJ2ZXJDb25maWcpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICB0aGlzLnVubW91bnRlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gVE9ETzogW1JFQUNULVdBUk5JTkddIFJlcGxhY2Ugd2l0aCBhcHByb3ByaWF0ZSBsaWZlY3ljbGUgZXZlbnRcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmVcbiAgICBVTlNBRkVfY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXdQcm9wcykge1xuICAgICAgICBpZiAobmV3UHJvcHMuc2VydmVyQ29uZmlnLmhzVXJsID09PSB0aGlzLnByb3BzLnNlcnZlckNvbmZpZy5oc1VybCAmJlxuICAgICAgICAgICAgbmV3UHJvcHMuc2VydmVyQ29uZmlnLmlzVXJsID09PSB0aGlzLnByb3BzLnNlcnZlckNvbmZpZy5pc1VybCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIEVuc3VyZSB0aGF0IHdlIGVuZCB1cCBhY3R1YWxseSBsb2dnaW5nIGluIHRvIHRoZSByaWdodCBwbGFjZVxuICAgICAgICB0aGlzLmluaXRMb2dpbkxvZ2ljKG5ld1Byb3BzLnNlcnZlckNvbmZpZyk7XG4gICAgfVxuXG4gICAgaXNCdXN5ID0gKCkgPT4gdGhpcy5zdGF0ZS5idXN5IHx8IHRoaXMucHJvcHMuYnVzeTtcblxuICAgIG9uUGFzc3dvcmRMb2dpbiA9IGFzeW5jICh1c2VybmFtZSwgcGhvbmVDb3VudHJ5LCBwaG9uZU51bWJlciwgcGFzc3dvcmQpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnNlcnZlcklzQWxpdmUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBidXN5OiB0cnVlIH0pO1xuICAgICAgICAgICAgLy8gRG8gYSBxdWljayBsaXZlbGluZXNzIGNoZWNrIG9uIHRoZSBVUkxzXG4gICAgICAgICAgICBsZXQgYWxpdmVBZ2FpbiA9IHRydWU7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IEF1dG9EaXNjb3ZlcnlVdGlscy52YWxpZGF0ZVNlcnZlckNvbmZpZ1dpdGhTdGF0aWNVcmxzKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnNlcnZlckNvbmZpZy5oc1VybCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5zZXJ2ZXJDb25maWcuaXNVcmwsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2VydmVySXNBbGl2ZTogdHJ1ZSwgZXJyb3JUZXh0OiBcIlwiIH0pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudFN0YXRlID0gQXV0b0Rpc2NvdmVyeVV0aWxzLmF1dGhDb21wb25lbnRTdGF0ZUZvckVycm9yKGUpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgYnVzeUxvZ2dpbmdJbjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIC4uLmNvbXBvbmVudFN0YXRlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGFsaXZlQWdhaW4gPSAhY29tcG9uZW50U3RhdGUuc2VydmVyRXJyb3JJc0ZhdGFsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBQcmV2ZW50IHBlb3BsZSBmcm9tIHN1Ym1pdHRpbmcgdGhlaXIgcGFzc3dvcmQgd2hlbiBzb21ldGhpbmcgaXNuJ3QgcmlnaHQuXG4gICAgICAgICAgICBpZiAoIWFsaXZlQWdhaW4pIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGJ1c3k6IHRydWUsXG4gICAgICAgICAgICBidXN5TG9nZ2luZ0luOiB0cnVlLFxuICAgICAgICAgICAgZXJyb3JUZXh0OiBudWxsLFxuICAgICAgICAgICAgbG9naW5JbmNvcnJlY3Q6IGZhbHNlLFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmxvZ2luTG9naWMubG9naW5WaWFQYXNzd29yZChcbiAgICAgICAgICAgIHVzZXJuYW1lLCBwaG9uZUNvdW50cnksIHBob25lTnVtYmVyLCBwYXNzd29yZCxcbiAgICAgICAgKS50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2VydmVySXNBbGl2ZTogdHJ1ZSB9KTsgLy8gaXQgbXVzdCBiZSwgd2UgbG9nZ2VkIGluLlxuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkxvZ2dlZEluKGRhdGEsIHBhc3N3b3JkKTtcbiAgICAgICAgfSwgKGVycm9yKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgZXJyb3JUZXh0O1xuXG4gICAgICAgICAgICAvLyBTb21lIGVycm9yIHN0cmluZ3Mgb25seSBhcHBseSBmb3IgbG9nZ2luZyBpblxuICAgICAgICAgICAgY29uc3QgdXNpbmdFbWFpbCA9IHVzZXJuYW1lLmluZGV4T2YoXCJAXCIpID4gMDtcbiAgICAgICAgICAgIGlmIChlcnJvci5odHRwU3RhdHVzID09PSA0MDAgJiYgdXNpbmdFbWFpbCkge1xuICAgICAgICAgICAgICAgIGVycm9yVGV4dCA9IF90KCdUaGlzIGhvbWVzZXJ2ZXIgZG9lcyBub3Qgc3VwcG9ydCBsb2dpbiB1c2luZyBlbWFpbCBhZGRyZXNzLicpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5lcnJjb2RlID09PSAnTV9SRVNPVVJDRV9MSU1JVF9FWENFRURFRCcpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvclRvcCA9IG1lc3NhZ2VGb3JSZXNvdXJjZUxpbWl0RXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIGVycm9yLmRhdGEubGltaXRfdHlwZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IuZGF0YS5hZG1pbl9jb250YWN0LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnbW9udGhseV9hY3RpdmVfdXNlcic6IF90ZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlRoaXMgaG9tZXNlcnZlciBoYXMgaGl0IGl0cyBNb250aGx5IEFjdGl2ZSBVc2VyIGxpbWl0LlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdoc19ibG9ja2VkJzogX3RkKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiVGhpcyBob21lc2VydmVyIGhhcyBiZWVuIGJsb2NrZWQgYnkgaXRzIGFkbWluaXN0cmF0b3IuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgJyc6IF90ZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlRoaXMgaG9tZXNlcnZlciBoYXMgZXhjZWVkZWQgb25lIG9mIGl0cyByZXNvdXJjZSBsaW1pdHMuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JEZXRhaWwgPSBtZXNzYWdlRm9yUmVzb3VyY2VMaW1pdEVycm9yKFxuICAgICAgICAgICAgICAgICAgICBlcnJvci5kYXRhLmxpbWl0X3R5cGUsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yLmRhdGEuYWRtaW5fY29udGFjdCxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgJyc6IF90ZChcIlBsZWFzZSA8YT5jb250YWN0IHlvdXIgc2VydmljZSBhZG1pbmlzdHJhdG9yPC9hPiB0byBjb250aW51ZSB1c2luZyB0aGlzIHNlcnZpY2UuXCIpLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgZXJyb3JUZXh0ID0gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj57IGVycm9yVG9wIH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTG9naW5fc21hbGxFcnJvclwiPnsgZXJyb3JEZXRhaWwgfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5odHRwU3RhdHVzID09PSA0MDEgfHwgZXJyb3IuaHR0cFN0YXR1cyA9PT0gNDAzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLmVycmNvZGUgPT09ICdNX1VTRVJfREVBQ1RJVkFURUQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yVGV4dCA9IF90KCdUaGlzIGFjY291bnQgaGFzIGJlZW4gZGVhY3RpdmF0ZWQuJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChTZGtDb25maWcuZ2V0KFwiZGlzYWJsZV9jdXN0b21fdXJsc1wiKSkge1xuICAgICAgICAgICAgICAgICAgICBlcnJvclRleHQgPSAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+eyBfdCgnSW5jb3JyZWN0IHVzZXJuYW1lIGFuZC9vciBwYXNzd29yZC4nKSB9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Mb2dpbl9zbWFsbEVycm9yXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUGxlYXNlIG5vdGUgeW91IGFyZSBsb2dnaW5nIGludG8gdGhlICUoaHMpcyBzZXJ2ZXIsIG5vdCBtYXRyaXgub3JnLicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGhzOiB0aGlzLnByb3BzLnNlcnZlckNvbmZpZy5oc05hbWUgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlcnJvclRleHQgPSBfdCgnSW5jb3JyZWN0IHVzZXJuYW1lIGFuZC9vciBwYXNzd29yZC4nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIG90aGVyIGVycm9ycywgbm90IHNwZWNpZmljIHRvIGRvaW5nIGEgcGFzc3dvcmQgbG9naW5cbiAgICAgICAgICAgICAgICBlcnJvclRleHQgPSB0aGlzLmVycm9yVGV4dEZyb21FcnJvcihlcnJvcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGJ1c3lMb2dnaW5nSW46IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yVGV4dDogZXJyb3JUZXh0LFxuICAgICAgICAgICAgICAgIC8vIDQwMSB3b3VsZCBiZSB0aGUgc2Vuc2libGUgc3RhdHVzIGNvZGUgZm9yICdpbmNvcnJlY3QgcGFzc3dvcmQnXG4gICAgICAgICAgICAgICAgLy8gYnV0IHRoZSBsb2dpbiBBUEkgZ2l2ZXMgYSA0MDMgaHR0cHM6Ly9tYXRyaXgub3JnL2ppcmEvYnJvd3NlL1NZTi03NDRcbiAgICAgICAgICAgICAgICAvLyBtZW50aW9ucyB0aGlzIChhbHRob3VnaCB0aGUgYnVnIGlzIGZvciBVSSBhdXRoIHdoaWNoIGlzIG5vdCB0aGlzKVxuICAgICAgICAgICAgICAgIC8vIFdlIHRyZWF0IGJvdGggYXMgYW4gaW5jb3JyZWN0IHBhc3N3b3JkXG4gICAgICAgICAgICAgICAgbG9naW5JbmNvcnJlY3Q6IGVycm9yLmh0dHBTdGF0dXMgPT09IDQwMSB8fCBlcnJvci5odHRwU3RhdHVzID09PSA0MDMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIG9uVXNlcm5hbWVDaGFuZ2VkID0gdXNlcm5hbWUgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgdXNlcm5hbWU6IHVzZXJuYW1lIH0pO1xuICAgIH07XG5cbiAgICBvblVzZXJuYW1lQmx1ciA9IGFzeW5jIHVzZXJuYW1lID0+IHtcbiAgICAgICAgY29uc3QgZG9XZWxsa25vd25Mb29rdXAgPSB1c2VybmFtZVswXSA9PT0gXCJAXCI7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdXNlcm5hbWU6IHVzZXJuYW1lLFxuICAgICAgICAgICAgYnVzeTogZG9XZWxsa25vd25Mb29rdXAsXG4gICAgICAgICAgICBlcnJvclRleHQ6IG51bGwsXG4gICAgICAgICAgICBjYW5UcnlMb2dpbjogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChkb1dlbGxrbm93bkxvb2t1cCkge1xuICAgICAgICAgICAgY29uc3Qgc2VydmVyTmFtZSA9IHVzZXJuYW1lLnNwbGl0KCc6Jykuc2xpY2UoMSkuam9pbignOicpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBBdXRvRGlzY292ZXJ5VXRpbHMudmFsaWRhdGVTZXJ2ZXJOYW1lKHNlcnZlck5hbWUpO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25TZXJ2ZXJDb25maWdDaGFuZ2UocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAvLyBXZSdkIGxpa2UgdG8gcmVseSBvbiBuZXcgcHJvcHMgY29taW5nIGluIHZpYSBgb25TZXJ2ZXJDb25maWdDaGFuZ2VgXG4gICAgICAgICAgICAgICAgLy8gc28gdGhhdCB3ZSBrbm93IHRoZSBzZXJ2ZXJzIGhhdmUgZGVmaW5pdGVseSB1cGRhdGVkIGJlZm9yZSBjbGVhcmluZ1xuICAgICAgICAgICAgICAgIC8vIHRoZSBidXN5IHN0YXRlLiBJbiB0aGUgY2FzZSBvZiBhIGZ1bGwgTVhJRCB0aGF0IHJlc29sdmVzIHRvIHRoZSBzYW1lXG4gICAgICAgICAgICAgICAgLy8gSFMgYXMgRWxlbWVudCdzIGRlZmF1bHQgSFMgdGhvdWdoLCB0aGVyZSBtYXkgbm90IGJlIGFueSBzZXJ2ZXIgY2hhbmdlLlxuICAgICAgICAgICAgICAgIC8vIFRvIGF2b2lkIHRoaXMgdHJhcCwgd2UgY2xlYXIgYnVzeSBoZXJlLiBGb3IgY2FzZXMgd2hlcmUgdGhlIHNlcnZlclxuICAgICAgICAgICAgICAgIC8vIGFjdHVhbGx5IGhhcyBjaGFuZ2VkLCBgaW5pdExvZ2luTG9naWNgIHdpbGwgYmUgY2FsbGVkIGFuZCBtYW5hZ2VzXG4gICAgICAgICAgICAgICAgLy8gYnVzeSBzdGF0ZSBmb3IgaXRzIG93biBsaXZlbmVzcyBjaGVjay5cbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiUHJvYmxlbSBwYXJzaW5nIFVSTCBvciB1bmhhbmRsZWQgZXJyb3IgZG9pbmcgLndlbGwta25vd24gZGlzY292ZXJ5OlwiLCBlKTtcblxuICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlID0gX3QoXCJGYWlsZWQgdG8gcGVyZm9ybSBob21lc2VydmVyIGRpc2NvdmVyeVwiKTtcbiAgICAgICAgICAgICAgICBpZiAoZS50cmFuc2xhdGVkTWVzc2FnZSkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlID0gZS50cmFuc2xhdGVkTWVzc2FnZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgZXJyb3JUZXh0OiBSZWFjdE5vZGUgPSBtZXNzYWdlO1xuICAgICAgICAgICAgICAgIGxldCBkaXNjb3ZlcnlTdGF0ZSA9IHt9O1xuICAgICAgICAgICAgICAgIGlmIChBdXRvRGlzY292ZXJ5VXRpbHMuaXNMaXZlbGluZXNzRXJyb3IoZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUZXh0ID0gdGhpcy5zdGF0ZS5lcnJvclRleHQ7XG4gICAgICAgICAgICAgICAgICAgIGRpc2NvdmVyeVN0YXRlID0gQXV0b0Rpc2NvdmVyeVV0aWxzLmF1dGhDb21wb25lbnRTdGF0ZUZvckVycm9yKGUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUZXh0LFxuICAgICAgICAgICAgICAgICAgICAuLi5kaXNjb3ZlcnlTdGF0ZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBvblBob25lQ291bnRyeUNoYW5nZWQgPSBwaG9uZUNvdW50cnkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgcGhvbmVDb3VudHJ5OiBwaG9uZUNvdW50cnkgfSk7XG4gICAgfTtcblxuICAgIG9uUGhvbmVOdW1iZXJDaGFuZ2VkID0gcGhvbmVOdW1iZXIgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHBob25lTnVtYmVyOiBwaG9uZU51bWJlcixcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIG9uUmVnaXN0ZXJDbGljayA9IGV2ID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXMucHJvcHMub25SZWdpc3RlckNsaWNrKCk7XG4gICAgfTtcblxuICAgIG9uVHJ5UmVnaXN0ZXJDbGljayA9IGV2ID0+IHtcbiAgICAgICAgY29uc3QgaGFzUGFzc3dvcmRGbG93ID0gdGhpcy5zdGF0ZS5mbG93cz8uZmluZChmbG93ID0+IGZsb3cudHlwZSA9PT0gXCJtLmxvZ2luLnBhc3N3b3JkXCIpO1xuICAgICAgICBjb25zdCBzc29GbG93ID0gdGhpcy5zdGF0ZS5mbG93cz8uZmluZChmbG93ID0+IGZsb3cudHlwZSA9PT0gXCJtLmxvZ2luLnNzb1wiIHx8IGZsb3cudHlwZSA9PT0gXCJtLmxvZ2luLmNhc1wiKTtcbiAgICAgICAgLy8gSWYgaGFzIG5vIHBhc3N3b3JkIGZsb3cgYnV0IGFuIFNTTyBmbG93IGd1ZXNzIHRoYXQgdGhlIHVzZXIgd2FudHMgdG8gcmVnaXN0ZXIgd2l0aCBTU08uXG4gICAgICAgIC8vIFRPRE86IGluc3RlYWQgaGlkZSB0aGUgUmVnaXN0ZXIgYnV0dG9uIGlmIHJlZ2lzdHJhdGlvbiBpcyBkaXNhYmxlZCBieSBjaGVja2luZyB3aXRoIHRoZSBzZXJ2ZXIsXG4gICAgICAgIC8vIGhhcyBubyBzcGVjaWZpYyBlcnJDb2RlIGN1cnJlbnRseSBhbmQgdXNlcyBNX0ZPUkJJRERFTi5cbiAgICAgICAgaWYgKHNzb0Zsb3cgJiYgIWhhc1Bhc3N3b3JkRmxvdykge1xuICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgY29uc3Qgc3NvS2luZCA9IHNzb0Zsb3cudHlwZSA9PT0gJ20ubG9naW4uc3NvJyA/ICdzc28nIDogJ2Nhcyc7XG4gICAgICAgICAgICBQbGF0Zm9ybVBlZy5nZXQoKS5zdGFydFNpbmdsZVNpZ25Pbih0aGlzLmxvZ2luTG9naWMuY3JlYXRlVGVtcG9yYXJ5Q2xpZW50KCksIHNzb0tpbmQsXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5mcmFnbWVudEFmdGVyTG9naW4pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gRG9uJ3QgaW50ZXJjZXB0IC0ganVzdCBnbyB0aHJvdWdoIHRvIHRoZSByZWdpc3RlciBwYWdlXG4gICAgICAgICAgICB0aGlzLm9uUmVnaXN0ZXJDbGljayhldik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBhc3luYyBpbml0TG9naW5Mb2dpYyh7IGhzVXJsLCBpc1VybCB9OiBWYWxpZGF0ZWRTZXJ2ZXJDb25maWcpIHtcbiAgICAgICAgbGV0IGlzRGVmYXVsdFNlcnZlciA9IGZhbHNlO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5zZXJ2ZXJDb25maWcuaXNEZWZhdWx0XG4gICAgICAgICAgICAmJiBoc1VybCA9PT0gdGhpcy5wcm9wcy5zZXJ2ZXJDb25maWcuaHNVcmxcbiAgICAgICAgICAgICYmIGlzVXJsID09PSB0aGlzLnByb3BzLnNlcnZlckNvbmZpZy5pc1VybCkge1xuICAgICAgICAgICAgaXNEZWZhdWx0U2VydmVyID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZhbGxiYWNrSHNVcmwgPSBpc0RlZmF1bHRTZXJ2ZXIgPyB0aGlzLnByb3BzLmZhbGxiYWNrSHNVcmwgOiBudWxsO1xuXG4gICAgICAgIGNvbnN0IGxvZ2luTG9naWMgPSBuZXcgTG9naW4oaHNVcmwsIGlzVXJsLCBmYWxsYmFja0hzVXJsLCB7XG4gICAgICAgICAgICBkZWZhdWx0RGV2aWNlRGlzcGxheU5hbWU6IHRoaXMucHJvcHMuZGVmYXVsdERldmljZURpc3BsYXlOYW1lLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5sb2dpbkxvZ2ljID0gbG9naW5Mb2dpYztcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGJ1c3k6IHRydWUsXG4gICAgICAgICAgICBsb2dpbkluY29ycmVjdDogZmFsc2UsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIERvIGEgcXVpY2sgbGl2ZWxpbmVzcyBjaGVjayBvbiB0aGUgVVJMc1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyB3YXJuaW5nIH0gPVxuICAgICAgICAgICAgICAgIGF3YWl0IEF1dG9EaXNjb3ZlcnlVdGlscy52YWxpZGF0ZVNlcnZlckNvbmZpZ1dpdGhTdGF0aWNVcmxzKGhzVXJsLCBpc1VybCk7XG4gICAgICAgICAgICBpZiAod2FybmluZykge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAuLi5BdXRvRGlzY292ZXJ5VXRpbHMuYXV0aENvbXBvbmVudFN0YXRlRm9yRXJyb3Iod2FybmluZyksXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVGV4dDogXCJcIixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZlcklzQWxpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGVycm9yVGV4dDogXCJcIixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICAgICAgLi4uQXV0b0Rpc2NvdmVyeVV0aWxzLmF1dGhDb21wb25lbnRTdGF0ZUZvckVycm9yKGUpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBsb2dpbkxvZ2ljLmdldEZsb3dzKCkudGhlbigoZmxvd3MpID0+IHtcbiAgICAgICAgICAgIC8vIGxvb2sgZm9yIGEgZmxvdyB3aGVyZSB3ZSB1bmRlcnN0YW5kIGFsbCBvZiB0aGUgc3RlcHMuXG4gICAgICAgICAgICBjb25zdCBzdXBwb3J0ZWRGbG93cyA9IGZsb3dzLmZpbHRlcih0aGlzLmlzU3VwcG9ydGVkRmxvdyk7XG5cbiAgICAgICAgICAgIGlmIChzdXBwb3J0ZWRGbG93cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGZsb3dzOiBzdXBwb3J0ZWRGbG93cyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHdlIGdvdCB0byB0aGUgZW5kIG9mIHRoZSBsaXN0IHdpdGhvdXQgZmluZGluZyBhIHN1aXRhYmxlIGZsb3cuXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBlcnJvclRleHQ6IF90KFwiVGhpcyBob21lc2VydmVyIGRvZXNuJ3Qgb2ZmZXIgYW55IGxvZ2luIGZsb3dzIHdoaWNoIGFyZSBzdXBwb3J0ZWQgYnkgdGhpcyBjbGllbnQuXCIpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGVycm9yVGV4dDogdGhpcy5lcnJvclRleHRGcm9tRXJyb3IoZXJyKSxcbiAgICAgICAgICAgICAgICBsb2dpbkluY29ycmVjdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgY2FuVHJ5TG9naW46IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1N1cHBvcnRlZEZsb3cgPSAoZmxvdzogTG9naW5GbG93KTogYm9vbGVhbiA9PiB7XG4gICAgICAgIC8vIHRlY2huaWNhbGx5IHRoZSBmbG93IGNhbiBoYXZlIG11bHRpcGxlIHN0ZXBzLCBidXQgbm8gb25lIGRvZXMgdGhpc1xuICAgICAgICAvLyBmb3IgbG9naW4gYW5kIGxvZ2luTG9naWMgZG9lc24ndCBzdXBwb3J0IGl0IHNvIHdlIGNhbiBpZ25vcmUgaXQuXG4gICAgICAgIGlmICghdGhpcy5zdGVwUmVuZGVyZXJNYXBbZmxvdy50eXBlXSkge1xuICAgICAgICAgICAgbG9nZ2VyLmxvZyhcIlNraXBwaW5nIGZsb3dcIiwgZmxvdywgXCJkdWUgdG8gdW5zdXBwb3J0ZWQgbG9naW4gdHlwZVwiLCBmbG93LnR5cGUpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGVycm9yVGV4dEZyb21FcnJvcihlcnI6IE1hdHJpeEVycm9yKTogUmVhY3ROb2RlIHtcbiAgICAgICAgbGV0IGVyckNvZGUgPSBlcnIuZXJyY29kZTtcbiAgICAgICAgaWYgKCFlcnJDb2RlICYmIGVyci5odHRwU3RhdHVzKSB7XG4gICAgICAgICAgICBlcnJDb2RlID0gXCJIVFRQIFwiICsgZXJyLmh0dHBTdGF0dXM7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZXJyb3JUZXh0OiBSZWFjdE5vZGUgPSBfdChcIlRoZXJlIHdhcyBhIHByb2JsZW0gY29tbXVuaWNhdGluZyB3aXRoIHRoZSBob21lc2VydmVyLCBcIiArXG4gICAgICAgICAgICBcInBsZWFzZSB0cnkgYWdhaW4gbGF0ZXIuXCIpICsgKGVyckNvZGUgPyBcIiAoXCIgKyBlcnJDb2RlICsgXCIpXCIgOiBcIlwiKTtcblxuICAgICAgICBpZiAoZXJyW1wiY29yc1wiXSA9PT0gJ3JlamVjdGVkJykgeyAvLyBicm93c2VyLXJlcXVlc3Qgc3BlY2lmaWMgZXJyb3IgZmllbGRcbiAgICAgICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgPT09ICdodHRwczonICYmXG4gICAgICAgICAgICAgICAgKHRoaXMucHJvcHMuc2VydmVyQ29uZmlnLmhzVXJsLnN0YXJ0c1dpdGgoXCJodHRwOlwiKSB8fFxuICAgICAgICAgICAgICAgICAhdGhpcy5wcm9wcy5zZXJ2ZXJDb25maWcuaHNVcmwuc3RhcnRzV2l0aChcImh0dHBcIikpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBlcnJvclRleHQgPSA8c3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIkNhbid0IGNvbm5lY3QgdG8gaG9tZXNlcnZlciB2aWEgSFRUUCB3aGVuIGFuIEhUVFBTIFVSTCBpcyBpbiB5b3VyIGJyb3dzZXIgYmFyLiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcIkVpdGhlciB1c2UgSFRUUFMgb3IgPGE+ZW5hYmxlIHVuc2FmZSBzY3JpcHRzPC9hPi5cIiwge30sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdhJzogKHN1YikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiA8YVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ9XCJfYmxhbmtcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaHJlZj1cImh0dHBzOi8vd3d3Lmdvb2dsZS5jb20vc2VhcmNoPyZxPWVuYWJsZSUyMHVuc2FmZSUyMHNjcmlwdHNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzdWIgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYT47XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9KSB9XG4gICAgICAgICAgICAgICAgPC9zcGFuPjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZXJyb3JUZXh0ID0gPHNwYW4+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJDYW4ndCBjb25uZWN0IHRvIGhvbWVzZXJ2ZXIgLSBwbGVhc2UgY2hlY2sgeW91ciBjb25uZWN0aXZpdHksIGVuc3VyZSB5b3VyIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiPGE+aG9tZXNlcnZlcidzIFNTTCBjZXJ0aWZpY2F0ZTwvYT4gaXMgdHJ1c3RlZCwgYW5kIHRoYXQgYSBicm93c2VyIGV4dGVuc2lvbiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcImlzIG5vdCBibG9ja2luZyByZXF1ZXN0cy5cIiwge30sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdhJzogKHN1YikgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCIgaHJlZj17dGhpcy5wcm9wcy5zZXJ2ZXJDb25maWcuaHNVcmx9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN1YiB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9hPixcbiAgICAgICAgICAgICAgICAgICAgfSkgfVxuICAgICAgICAgICAgICAgIDwvc3Bhbj47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZXJyb3JUZXh0O1xuICAgIH1cblxuICAgIHJlbmRlckxvZ2luQ29tcG9uZW50Rm9yRmxvd3MoKSB7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5mbG93cykgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgLy8gdGhpcyBpcyB0aGUgaWRlYWwgb3JkZXIgd2Ugd2FudCB0byBzaG93IHRoZSBmbG93cyBpblxuICAgICAgICBjb25zdCBvcmRlciA9IFtcbiAgICAgICAgICAgIFwibS5sb2dpbi5wYXNzd29yZFwiLFxuICAgICAgICAgICAgXCJtLmxvZ2luLnNzb1wiLFxuICAgICAgICBdO1xuXG4gICAgICAgIGNvbnN0IGZsb3dzID0gb3JkZXIubWFwKHR5cGUgPT4gdGhpcy5zdGF0ZS5mbG93cy5maW5kKGZsb3cgPT4gZmxvdy50eXBlID09PSB0eXBlKSkuZmlsdGVyKEJvb2xlYW4pO1xuICAgICAgICByZXR1cm4gPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgeyBmbG93cy5tYXAoZmxvdyA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RlcFJlbmRlcmVyID0gdGhpcy5zdGVwUmVuZGVyZXJNYXBbZmxvdy50eXBlXTtcbiAgICAgICAgICAgICAgICByZXR1cm4gPFJlYWN0LkZyYWdtZW50IGtleT17Zmxvdy50eXBlfT57IHN0ZXBSZW5kZXJlcigpIH08L1JlYWN0LkZyYWdtZW50PjtcbiAgICAgICAgICAgIH0pIH1cbiAgICAgICAgPC9SZWFjdC5GcmFnbWVudD47XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJQYXNzd29yZFN0ZXAgPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8UGFzc3dvcmRMb2dpblxuICAgICAgICAgICAgICAgIG9uU3VibWl0PXt0aGlzLm9uUGFzc3dvcmRMb2dpbn1cbiAgICAgICAgICAgICAgICB1c2VybmFtZT17dGhpcy5zdGF0ZS51c2VybmFtZX1cbiAgICAgICAgICAgICAgICBwaG9uZUNvdW50cnk9e3RoaXMuc3RhdGUucGhvbmVDb3VudHJ5fVxuICAgICAgICAgICAgICAgIHBob25lTnVtYmVyPXt0aGlzLnN0YXRlLnBob25lTnVtYmVyfVxuICAgICAgICAgICAgICAgIG9uVXNlcm5hbWVDaGFuZ2VkPXt0aGlzLm9uVXNlcm5hbWVDaGFuZ2VkfVxuICAgICAgICAgICAgICAgIG9uVXNlcm5hbWVCbHVyPXt0aGlzLm9uVXNlcm5hbWVCbHVyfVxuICAgICAgICAgICAgICAgIG9uUGhvbmVDb3VudHJ5Q2hhbmdlZD17dGhpcy5vblBob25lQ291bnRyeUNoYW5nZWR9XG4gICAgICAgICAgICAgICAgb25QaG9uZU51bWJlckNoYW5nZWQ9e3RoaXMub25QaG9uZU51bWJlckNoYW5nZWR9XG4gICAgICAgICAgICAgICAgb25Gb3Jnb3RQYXNzd29yZENsaWNrPXt0aGlzLnByb3BzLm9uRm9yZ290UGFzc3dvcmRDbGlja31cbiAgICAgICAgICAgICAgICBsb2dpbkluY29ycmVjdD17dGhpcy5zdGF0ZS5sb2dpbkluY29ycmVjdH1cbiAgICAgICAgICAgICAgICBzZXJ2ZXJDb25maWc9e3RoaXMucHJvcHMuc2VydmVyQ29uZmlnfVxuICAgICAgICAgICAgICAgIGRpc2FibGVTdWJtaXQ9e3RoaXMuaXNCdXN5KCl9XG4gICAgICAgICAgICAgICAgYnVzeT17dGhpcy5wcm9wcy5pc1N5bmNpbmcgfHwgdGhpcy5zdGF0ZS5idXN5TG9nZ2luZ0lufVxuICAgICAgICAgICAgLz5cbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSByZW5kZXJTc29TdGVwID0gbG9naW5UeXBlID0+IHtcbiAgICAgICAgY29uc3QgZmxvdyA9IHRoaXMuc3RhdGUuZmxvd3MuZmluZChmbG93ID0+IGZsb3cudHlwZSA9PT0gXCJtLmxvZ2luLlwiICsgbG9naW5UeXBlKSBhcyBJU1NPRmxvdztcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPFNTT0J1dHRvbnNcbiAgICAgICAgICAgICAgICBtYXRyaXhDbGllbnQ9e3RoaXMubG9naW5Mb2dpYy5jcmVhdGVUZW1wb3JhcnlDbGllbnQoKX1cbiAgICAgICAgICAgICAgICBmbG93PXtmbG93fVxuICAgICAgICAgICAgICAgIGxvZ2luVHlwZT17bG9naW5UeXBlfVxuICAgICAgICAgICAgICAgIGZyYWdtZW50QWZ0ZXJMb2dpbj17dGhpcy5wcm9wcy5mcmFnbWVudEFmdGVyTG9naW59XG4gICAgICAgICAgICAgICAgcHJpbWFyeT17IXRoaXMuc3RhdGUuZmxvd3MuZmluZChmbG93ID0+IGZsb3cudHlwZSA9PT0gXCJtLmxvZ2luLnBhc3N3b3JkXCIpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBsb2FkZXIgPSB0aGlzLmlzQnVzeSgpICYmICF0aGlzLnN0YXRlLmJ1c3lMb2dnaW5nSW4gP1xuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Mb2dpbl9sb2FkZXJcIj48U3Bpbm5lciAvPjwvZGl2PiA6IG51bGw7XG5cbiAgICAgICAgY29uc3QgZXJyb3JUZXh0ID0gdGhpcy5zdGF0ZS5lcnJvclRleHQ7XG5cbiAgICAgICAgbGV0IGVycm9yVGV4dFNlY3Rpb247XG4gICAgICAgIGlmIChlcnJvclRleHQpIHtcbiAgICAgICAgICAgIGVycm9yVGV4dFNlY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Mb2dpbl9lcnJvclwiPlxuICAgICAgICAgICAgICAgICAgICB7IGVycm9yVGV4dCB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHNlcnZlckRlYWRTZWN0aW9uO1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuc2VydmVySXNBbGl2ZSkge1xuICAgICAgICAgICAgY29uc3QgY2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgICAgIFwibXhfTG9naW5fZXJyb3JcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBcIm14X0xvZ2luX3NlcnZlckVycm9yXCI6IHRydWUsXG4gICAgICAgICAgICAgICAgXCJteF9Mb2dpbl9zZXJ2ZXJFcnJvck5vbkZhdGFsXCI6ICF0aGlzLnN0YXRlLnNlcnZlckVycm9ySXNGYXRhbCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc2VydmVyRGVhZFNlY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzZXN9PlxuICAgICAgICAgICAgICAgICAgICB7IHRoaXMuc3RhdGUuc2VydmVyRGVhZEVycm9yIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZm9vdGVyO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5pc1N5bmNpbmcgfHwgdGhpcy5zdGF0ZS5idXN5TG9nZ2luZ0luKSB7XG4gICAgICAgICAgICBmb290ZXIgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X0F1dGhCb2R5X3BhZGRlZEZvb3RlclwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQXV0aEJvZHlfcGFkZGVkRm9vdGVyX3RpdGxlXCI+XG4gICAgICAgICAgICAgICAgICAgIDxJbmxpbmVTcGlubmVyIHc9ezIwfSBoPXsyMH0gLz5cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLmlzU3luY2luZyA/IF90KFwiU3luY2luZy4uLlwiKSA6IF90KFwiU2lnbmluZyBJbi4uLlwiKSB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLmlzU3luY2luZyAmJiA8ZGl2IGNsYXNzTmFtZT1cIm14X0F1dGhCb2R5X3BhZGRlZEZvb3Rlcl9zdWJ0aXRsZVwiPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiSWYgeW91J3ZlIGpvaW5lZCBsb3RzIG9mIHJvb21zLCB0aGlzIG1pZ2h0IHRha2UgYSB3aGlsZVwiKSB9XG4gICAgICAgICAgICAgICAgPC9kaXY+IH1cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfSBlbHNlIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFVJRmVhdHVyZS5SZWdpc3RyYXRpb24pKSB7XG4gICAgICAgICAgICBmb290ZXIgPSAoXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfQXV0aEJvZHlfY2hhbmdlRmxvd1wiPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiTmV3PyA8YT5DcmVhdGUgYWNjb3VudDwvYT5cIiwge30sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGE6IHN1YiA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9J2xpbmtfaW5saW5lJyBvbkNsaWNrPXt0aGlzLm9uVHJ5UmVnaXN0ZXJDbGlja30+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3ViIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgICAgICAgICB9KSB9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QXV0aFBhZ2U+XG4gICAgICAgICAgICAgICAgPEF1dGhIZWFkZXIgZGlzYWJsZUxhbmd1YWdlU2VsZWN0b3I9e3RoaXMucHJvcHMuaXNTeW5jaW5nIHx8IHRoaXMuc3RhdGUuYnVzeUxvZ2dpbmdJbn0gLz5cbiAgICAgICAgICAgICAgICA8QXV0aEJvZHk+XG4gICAgICAgICAgICAgICAgICAgIDxoMT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoJ1NpZ24gaW4nKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGxvYWRlciB9XG4gICAgICAgICAgICAgICAgICAgIDwvaDE+XG4gICAgICAgICAgICAgICAgICAgIHsgZXJyb3JUZXh0U2VjdGlvbiB9XG4gICAgICAgICAgICAgICAgICAgIHsgc2VydmVyRGVhZFNlY3Rpb24gfVxuICAgICAgICAgICAgICAgICAgICA8U2VydmVyUGlja2VyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXJ2ZXJDb25maWc9e3RoaXMucHJvcHMuc2VydmVyQ29uZmlnfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25TZXJ2ZXJDb25maWdDaGFuZ2U9e3RoaXMucHJvcHMub25TZXJ2ZXJDb25maWdDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIHsgdGhpcy5yZW5kZXJMb2dpbkNvbXBvbmVudEZvckZsb3dzKCkgfVxuICAgICAgICAgICAgICAgICAgICB7IGZvb3RlciB9XG4gICAgICAgICAgICAgICAgPC9BdXRoQm9keT5cbiAgICAgICAgICAgIDwvQXV0aFBhZ2U+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFFQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBR0E7QUFDQTtBQUNBLElBQUFBLG9CQUFBLEVBQUksdUNBQUo7QUFDQSxJQUFBQSxvQkFBQSxFQUFJLHVEQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSxtQ0FBSjtBQUNBLElBQUFBLG9CQUFBLEVBQUksZ0VBQUo7QUFDQSxJQUFBQSxvQkFBQSxFQUFJLDRDQUFKO0FBQ0EsSUFBQUEsb0JBQUEsRUFBSSx3Q0FBSjtBQUNBLElBQUFBLG9CQUFBLEVBQUksbUVBQUo7QUFDQSxJQUFBQSxvQkFBQSxFQUFJLGlCQUFKOztBQW9EQTtBQUNBO0FBQ0E7QUFDZSxNQUFNQyxjQUFOLFNBQTZCQyxjQUFBLENBQU1DLGFBQW5DLENBQWlFO0VBTTVFQyxXQUFXLENBQUNDLEtBQUQsRUFBUTtJQUNmLE1BQU1BLEtBQU47SUFEZSxpREFMQyxLQUtEO0lBQUE7SUFBQTtJQUFBLDhDQXNEVixNQUFNLEtBQUtDLEtBQUwsQ0FBV0MsSUFBWCxJQUFtQixLQUFLRixLQUFMLENBQVdFLElBdEQxQjtJQUFBLHVEQXdERCxPQUFPQyxRQUFQLEVBQWlCQyxZQUFqQixFQUErQkMsV0FBL0IsRUFBNENDLFFBQTVDLEtBQXlEO01BQ3ZFLElBQUksQ0FBQyxLQUFLTCxLQUFMLENBQVdNLGFBQWhCLEVBQStCO1FBQzNCLEtBQUtDLFFBQUwsQ0FBYztVQUFFTixJQUFJLEVBQUU7UUFBUixDQUFkLEVBRDJCLENBRTNCOztRQUNBLElBQUlPLFVBQVUsR0FBRyxJQUFqQjs7UUFDQSxJQUFJO1VBQ0EsTUFBTUMsMkJBQUEsQ0FBbUJDLGtDQUFuQixDQUNGLEtBQUtYLEtBQUwsQ0FBV1ksWUFBWCxDQUF3QkMsS0FEdEIsRUFFRixLQUFLYixLQUFMLENBQVdZLFlBQVgsQ0FBd0JFLEtBRnRCLENBQU47VUFJQSxLQUFLTixRQUFMLENBQWM7WUFBRUQsYUFBYSxFQUFFLElBQWpCO1lBQXVCUSxTQUFTLEVBQUU7VUFBbEMsQ0FBZDtRQUNILENBTkQsQ0FNRSxPQUFPQyxDQUFQLEVBQVU7VUFDUixNQUFNQyxjQUFjLEdBQUdQLDJCQUFBLENBQW1CUSwwQkFBbkIsQ0FBOENGLENBQTlDLENBQXZCOztVQUNBLEtBQUtSLFFBQUw7WUFDSU4sSUFBSSxFQUFFLEtBRFY7WUFFSWlCLGFBQWEsRUFBRTtVQUZuQixHQUdPRixjQUhQO1VBS0FSLFVBQVUsR0FBRyxDQUFDUSxjQUFjLENBQUNHLGtCQUE3QjtRQUNILENBbEIwQixDQW9CM0I7OztRQUNBLElBQUksQ0FBQ1gsVUFBTCxFQUFpQjtVQUNiO1FBQ0g7TUFDSjs7TUFFRCxLQUFLRCxRQUFMLENBQWM7UUFDVk4sSUFBSSxFQUFFLElBREk7UUFFVmlCLGFBQWEsRUFBRSxJQUZMO1FBR1ZKLFNBQVMsRUFBRSxJQUhEO1FBSVZNLGNBQWMsRUFBRTtNQUpOLENBQWQ7TUFPQSxLQUFLQyxVQUFMLENBQWdCQyxnQkFBaEIsQ0FDSXBCLFFBREosRUFDY0MsWUFEZCxFQUM0QkMsV0FENUIsRUFDeUNDLFFBRHpDLEVBRUVrQixJQUZGLENBRVFDLElBQUQsSUFBVTtRQUNiLEtBQUtqQixRQUFMLENBQWM7VUFBRUQsYUFBYSxFQUFFO1FBQWpCLENBQWQsRUFEYSxDQUMyQjs7UUFDeEMsS0FBS1AsS0FBTCxDQUFXMEIsVUFBWCxDQUFzQkQsSUFBdEIsRUFBNEJuQixRQUE1QjtNQUNILENBTEQsRUFLSXFCLEtBQUQsSUFBVztRQUNWLElBQUksS0FBS0MsU0FBVCxFQUFvQjtVQUNoQjtRQUNIOztRQUNELElBQUliLFNBQUosQ0FKVSxDQU1WOztRQUNBLE1BQU1jLFVBQVUsR0FBRzFCLFFBQVEsQ0FBQzJCLE9BQVQsQ0FBaUIsR0FBakIsSUFBd0IsQ0FBM0M7O1FBQ0EsSUFBSUgsS0FBSyxDQUFDSSxVQUFOLEtBQXFCLEdBQXJCLElBQTRCRixVQUFoQyxFQUE0QztVQUN4Q2QsU0FBUyxHQUFHLElBQUFpQixtQkFBQSxFQUFHLDZEQUFILENBQVo7UUFDSCxDQUZELE1BRU8sSUFBSUwsS0FBSyxDQUFDTSxPQUFOLEtBQWtCLDJCQUF0QixFQUFtRDtVQUN0RCxNQUFNQyxRQUFRLEdBQUcsSUFBQUMsd0NBQUEsRUFDYlIsS0FBSyxDQUFDRixJQUFOLENBQVdXLFVBREUsRUFFYlQsS0FBSyxDQUFDRixJQUFOLENBQVdZLGFBRkUsRUFHYjtZQUNJLHVCQUF1QixJQUFBMUMsb0JBQUEsRUFDbkIsd0RBRG1CLENBRDNCO1lBSUksY0FBYyxJQUFBQSxvQkFBQSxFQUNWLHdEQURVLENBSmxCO1lBT0ksSUFBSSxJQUFBQSxvQkFBQSxFQUNBLDBEQURBO1VBUFIsQ0FIYSxDQUFqQjtVQWVBLE1BQU0yQyxXQUFXLEdBQUcsSUFBQUgsd0NBQUEsRUFDaEJSLEtBQUssQ0FBQ0YsSUFBTixDQUFXVyxVQURLLEVBRWhCVCxLQUFLLENBQUNGLElBQU4sQ0FBV1ksYUFGSyxFQUdoQjtZQUNJLElBQUksSUFBQTFDLG9CQUFBLEVBQUksa0ZBQUo7VUFEUixDQUhnQixDQUFwQjtVQU9Bb0IsU0FBUyxnQkFDTCx1REFDSSwwQ0FBT21CLFFBQVAsQ0FESixlQUVJO1lBQUssU0FBUyxFQUFDO1VBQWYsR0FBdUNJLFdBQXZDLENBRkosQ0FESjtRQU1ILENBN0JNLE1BNkJBLElBQUlYLEtBQUssQ0FBQ0ksVUFBTixLQUFxQixHQUFyQixJQUE0QkosS0FBSyxDQUFDSSxVQUFOLEtBQXFCLEdBQXJELEVBQTBEO1VBQzdELElBQUlKLEtBQUssQ0FBQ00sT0FBTixLQUFrQixvQkFBdEIsRUFBNEM7WUFDeENsQixTQUFTLEdBQUcsSUFBQWlCLG1CQUFBLEVBQUcsb0NBQUgsQ0FBWjtVQUNILENBRkQsTUFFTyxJQUFJTyxrQkFBQSxDQUFVQyxHQUFWLENBQWMscUJBQWQsQ0FBSixFQUEwQztZQUM3Q3pCLFNBQVMsZ0JBQ0wsdURBQ0ksMENBQU8sSUFBQWlCLG1CQUFBLEVBQUcscUNBQUgsQ0FBUCxDQURKLGVBRUk7Y0FBSyxTQUFTLEVBQUM7WUFBZixHQUNNLElBQUFBLG1CQUFBLEVBQ0UscUVBREYsRUFFRTtjQUFFUyxFQUFFLEVBQUUsS0FBS3pDLEtBQUwsQ0FBV1ksWUFBWCxDQUF3QjhCO1lBQTlCLENBRkYsQ0FETixDQUZKLENBREo7VUFXSCxDQVpNLE1BWUE7WUFDSDNCLFNBQVMsR0FBRyxJQUFBaUIsbUJBQUEsRUFBRyxxQ0FBSCxDQUFaO1VBQ0g7UUFDSixDQWxCTSxNQWtCQTtVQUNIO1VBQ0FqQixTQUFTLEdBQUcsS0FBSzRCLGtCQUFMLENBQXdCaEIsS0FBeEIsQ0FBWjtRQUNIOztRQUVELEtBQUtuQixRQUFMLENBQWM7VUFDVk4sSUFBSSxFQUFFLEtBREk7VUFFVmlCLGFBQWEsRUFBRSxLQUZMO1VBR1ZKLFNBQVMsRUFBRUEsU0FIRDtVQUlWO1VBQ0E7VUFDQTtVQUNBO1VBQ0FNLGNBQWMsRUFBRU0sS0FBSyxDQUFDSSxVQUFOLEtBQXFCLEdBQXJCLElBQTRCSixLQUFLLENBQUNJLFVBQU4sS0FBcUI7UUFSdkQsQ0FBZDtNQVVILENBN0VEO0lBOEVILENBeEtrQjtJQUFBLHlEQTBLQzVCLFFBQVEsSUFBSTtNQUM1QixLQUFLSyxRQUFMLENBQWM7UUFBRUwsUUFBUSxFQUFFQTtNQUFaLENBQWQ7SUFDSCxDQTVLa0I7SUFBQSxzREE4S0YsTUFBTUEsUUFBTixJQUFrQjtNQUMvQixNQUFNeUMsaUJBQWlCLEdBQUd6QyxRQUFRLENBQUMsQ0FBRCxDQUFSLEtBQWdCLEdBQTFDO01BQ0EsS0FBS0ssUUFBTCxDQUFjO1FBQ1ZMLFFBQVEsRUFBRUEsUUFEQTtRQUVWRCxJQUFJLEVBQUUwQyxpQkFGSTtRQUdWN0IsU0FBUyxFQUFFLElBSEQ7UUFJVjhCLFdBQVcsRUFBRTtNQUpILENBQWQ7O01BTUEsSUFBSUQsaUJBQUosRUFBdUI7UUFDbkIsTUFBTUUsVUFBVSxHQUFHM0MsUUFBUSxDQUFDNEMsS0FBVCxDQUFlLEdBQWYsRUFBb0JDLEtBQXBCLENBQTBCLENBQTFCLEVBQTZCQyxJQUE3QixDQUFrQyxHQUFsQyxDQUFuQjs7UUFDQSxJQUFJO1VBQ0EsTUFBTUMsTUFBTSxHQUFHLE1BQU14QywyQkFBQSxDQUFtQnlDLGtCQUFuQixDQUFzQ0wsVUFBdEMsQ0FBckI7VUFDQSxLQUFLOUMsS0FBTCxDQUFXb0Qsb0JBQVgsQ0FBZ0NGLE1BQWhDLEVBRkEsQ0FHQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFDQSxLQUFLMUMsUUFBTCxDQUFjO1lBQ1ZOLElBQUksRUFBRTtVQURJLENBQWQ7UUFHSCxDQWJELENBYUUsT0FBT2MsQ0FBUCxFQUFVO1VBQ1JxQyxjQUFBLENBQU8xQixLQUFQLENBQWEscUVBQWIsRUFBb0ZYLENBQXBGOztVQUVBLElBQUlzQyxPQUFPLEdBQUcsSUFBQXRCLG1CQUFBLEVBQUcsd0NBQUgsQ0FBZDs7VUFDQSxJQUFJaEIsQ0FBQyxDQUFDdUMsaUJBQU4sRUFBeUI7WUFDckJELE9BQU8sR0FBR3RDLENBQUMsQ0FBQ3VDLGlCQUFaO1VBQ0g7O1VBRUQsSUFBSXhDLFNBQW9CLEdBQUd1QyxPQUEzQjtVQUNBLElBQUlFLGNBQWMsR0FBRyxFQUFyQjs7VUFDQSxJQUFJOUMsMkJBQUEsQ0FBbUIrQyxpQkFBbkIsQ0FBcUN6QyxDQUFyQyxDQUFKLEVBQTZDO1lBQ3pDRCxTQUFTLEdBQUcsS0FBS2QsS0FBTCxDQUFXYyxTQUF2QjtZQUNBeUMsY0FBYyxHQUFHOUMsMkJBQUEsQ0FBbUJRLDBCQUFuQixDQUE4Q0YsQ0FBOUMsQ0FBakI7VUFDSDs7VUFFRCxLQUFLUixRQUFMO1lBQ0lOLElBQUksRUFBRSxLQURWO1lBRUlhO1VBRkosR0FHT3lDLGNBSFA7UUFLSDtNQUNKO0lBQ0osQ0EzTmtCO0lBQUEsNkRBNk5LcEQsWUFBWSxJQUFJO01BQ3BDLEtBQUtJLFFBQUwsQ0FBYztRQUFFSixZQUFZLEVBQUVBO01BQWhCLENBQWQ7SUFDSCxDQS9Oa0I7SUFBQSw0REFpT0lDLFdBQVcsSUFBSTtNQUNsQyxLQUFLRyxRQUFMLENBQWM7UUFDVkgsV0FBVyxFQUFFQTtNQURILENBQWQ7SUFHSCxDQXJPa0I7SUFBQSx1REF1T0RxRCxFQUFFLElBQUk7TUFDcEJBLEVBQUUsQ0FBQ0MsY0FBSDtNQUNBRCxFQUFFLENBQUNFLGVBQUg7TUFDQSxLQUFLNUQsS0FBTCxDQUFXNkQsZUFBWDtJQUNILENBM09rQjtJQUFBLDBEQTZPRUgsRUFBRSxJQUFJO01BQ3ZCLE1BQU1JLGVBQWUsR0FBRyxLQUFLN0QsS0FBTCxDQUFXOEQsS0FBWCxFQUFrQkMsSUFBbEIsQ0FBdUJDLElBQUksSUFBSUEsSUFBSSxDQUFDQyxJQUFMLEtBQWMsa0JBQTdDLENBQXhCO01BQ0EsTUFBTUMsT0FBTyxHQUFHLEtBQUtsRSxLQUFMLENBQVc4RCxLQUFYLEVBQWtCQyxJQUFsQixDQUF1QkMsSUFBSSxJQUFJQSxJQUFJLENBQUNDLElBQUwsS0FBYyxhQUFkLElBQStCRCxJQUFJLENBQUNDLElBQUwsS0FBYyxhQUE1RSxDQUFoQixDQUZ1QixDQUd2QjtNQUNBO01BQ0E7O01BQ0EsSUFBSUMsT0FBTyxJQUFJLENBQUNMLGVBQWhCLEVBQWlDO1FBQzdCSixFQUFFLENBQUNDLGNBQUg7UUFDQUQsRUFBRSxDQUFDRSxlQUFIO1FBQ0EsTUFBTVEsT0FBTyxHQUFHRCxPQUFPLENBQUNELElBQVIsS0FBaUIsYUFBakIsR0FBaUMsS0FBakMsR0FBeUMsS0FBekQ7O1FBQ0FHLG9CQUFBLENBQVk3QixHQUFaLEdBQWtCOEIsaUJBQWxCLENBQW9DLEtBQUtoRCxVQUFMLENBQWdCaUQscUJBQWhCLEVBQXBDLEVBQTZFSCxPQUE3RSxFQUNJLEtBQUtwRSxLQUFMLENBQVd3RSxrQkFEZjtNQUVILENBTkQsTUFNTztRQUNIO1FBQ0EsS0FBS1gsZUFBTCxDQUFxQkgsRUFBckI7TUFDSDtJQUNKLENBN1BrQjtJQUFBLHVEQXFVUU8sSUFBRCxJQUE4QjtNQUNwRDtNQUNBO01BQ0EsSUFBSSxDQUFDLEtBQUtRLGVBQUwsQ0FBcUJSLElBQUksQ0FBQ0MsSUFBMUIsQ0FBTCxFQUFzQztRQUNsQ2IsY0FBQSxDQUFPcUIsR0FBUCxDQUFXLGVBQVgsRUFBNEJULElBQTVCLEVBQWtDLCtCQUFsQyxFQUFtRUEsSUFBSSxDQUFDQyxJQUF4RTs7UUFDQSxPQUFPLEtBQVA7TUFDSDs7TUFDRCxPQUFPLElBQVA7SUFDSCxDQTdVa0I7SUFBQSwwREFnWlUsTUFBTTtNQUMvQixvQkFDSSw2QkFBQyxzQkFBRDtRQUNJLFFBQVEsRUFBRSxLQUFLUyxlQURuQjtRQUVJLFFBQVEsRUFBRSxLQUFLMUUsS0FBTCxDQUFXRSxRQUZ6QjtRQUdJLFlBQVksRUFBRSxLQUFLRixLQUFMLENBQVdHLFlBSDdCO1FBSUksV0FBVyxFQUFFLEtBQUtILEtBQUwsQ0FBV0ksV0FKNUI7UUFLSSxpQkFBaUIsRUFBRSxLQUFLdUUsaUJBTDVCO1FBTUksY0FBYyxFQUFFLEtBQUtDLGNBTnpCO1FBT0kscUJBQXFCLEVBQUUsS0FBS0MscUJBUGhDO1FBUUksb0JBQW9CLEVBQUUsS0FBS0Msb0JBUi9CO1FBU0kscUJBQXFCLEVBQUUsS0FBSy9FLEtBQUwsQ0FBV2dGLHFCQVR0QztRQVVJLGNBQWMsRUFBRSxLQUFLL0UsS0FBTCxDQUFXb0IsY0FWL0I7UUFXSSxZQUFZLEVBQUUsS0FBS3JCLEtBQUwsQ0FBV1ksWUFYN0I7UUFZSSxhQUFhLEVBQUUsS0FBS3FFLE1BQUwsRUFabkI7UUFhSSxJQUFJLEVBQUUsS0FBS2pGLEtBQUwsQ0FBV2tGLFNBQVgsSUFBd0IsS0FBS2pGLEtBQUwsQ0FBV2tCO01BYjdDLEVBREo7SUFpQkgsQ0FsYWtCO0lBQUEscURBb2FLZ0UsU0FBUyxJQUFJO01BQ2pDLE1BQU1sQixJQUFJLEdBQUcsS0FBS2hFLEtBQUwsQ0FBVzhELEtBQVgsQ0FBaUJDLElBQWpCLENBQXNCQyxJQUFJLElBQUlBLElBQUksQ0FBQ0MsSUFBTCxLQUFjLGFBQWFpQixTQUF6RCxDQUFiO01BRUEsb0JBQ0ksNkJBQUMsbUJBQUQ7UUFDSSxZQUFZLEVBQUUsS0FBSzdELFVBQUwsQ0FBZ0JpRCxxQkFBaEIsRUFEbEI7UUFFSSxJQUFJLEVBQUVOLElBRlY7UUFHSSxTQUFTLEVBQUVrQixTQUhmO1FBSUksa0JBQWtCLEVBQUUsS0FBS25GLEtBQUwsQ0FBV3dFLGtCQUpuQztRQUtJLE9BQU8sRUFBRSxDQUFDLEtBQUt2RSxLQUFMLENBQVc4RCxLQUFYLENBQWlCQyxJQUFqQixDQUFzQkMsSUFBSSxJQUFJQSxJQUFJLENBQUNDLElBQUwsS0FBYyxrQkFBNUM7TUFMZCxFQURKO0lBU0gsQ0FoYmtCO0lBR2YsS0FBS2pFLEtBQUwsR0FBYTtNQUNUQyxJQUFJLEVBQUUsS0FERztNQUVUaUIsYUFBYSxFQUFFLElBRk47TUFHVEosU0FBUyxFQUFFLElBSEY7TUFJVE0sY0FBYyxFQUFFLEtBSlA7TUFLVHdCLFdBQVcsRUFBRSxJQUxKO01BT1RrQixLQUFLLEVBQUUsSUFQRTtNQVNUNUQsUUFBUSxFQUFFSCxLQUFLLENBQUNvRixlQUFOLEdBQXVCcEYsS0FBSyxDQUFDb0YsZUFBN0IsR0FBOEMsRUFUL0M7TUFVVGhGLFlBQVksRUFBRSxJQVZMO01BV1RDLFdBQVcsRUFBRSxFQVhKO01BYVRFLGFBQWEsRUFBRSxJQWJOO01BY1RhLGtCQUFrQixFQUFFLEtBZFg7TUFlVGlFLGVBQWUsRUFBRTtJQWZSLENBQWIsQ0FIZSxDQXFCZjtJQUNBOztJQUNBLEtBQUtaLGVBQUwsR0FBdUI7TUFDbkIsb0JBQW9CLEtBQUthLGtCQUROO01BR25CO01BQ0E7TUFDQSxlQUFlLE1BQU0sS0FBS0MsYUFBTCxDQUFtQixLQUFuQixDQUxGO01BTW5CO01BQ0EsZUFBZSxNQUFNLEtBQUtBLGFBQUwsQ0FBbUIsS0FBbkI7SUFQRixDQUF2QjtFQVNILENBdEMyRSxDQXdDNUU7RUFDQTs7O0VBQ0FDLHlCQUF5QixHQUFHO0lBQ3hCLEtBQUtDLGNBQUwsQ0FBb0IsS0FBS3pGLEtBQUwsQ0FBV1ksWUFBL0I7RUFDSDs7RUFFRDhFLG9CQUFvQixHQUFHO0lBQ25CLEtBQUs5RCxTQUFMLEdBQWlCLElBQWpCO0VBQ0gsQ0FoRDJFLENBa0Q1RTtFQUNBOzs7RUFDQStELGdDQUFnQyxDQUFDQyxRQUFELEVBQVc7SUFDdkMsSUFBSUEsUUFBUSxDQUFDaEYsWUFBVCxDQUFzQkMsS0FBdEIsS0FBZ0MsS0FBS2IsS0FBTCxDQUFXWSxZQUFYLENBQXdCQyxLQUF4RCxJQUNBK0UsUUFBUSxDQUFDaEYsWUFBVCxDQUFzQkUsS0FBdEIsS0FBZ0MsS0FBS2QsS0FBTCxDQUFXWSxZQUFYLENBQXdCRSxLQUQ1RCxFQUNtRSxPQUY1QixDQUl2Qzs7SUFDQSxLQUFLMkUsY0FBTCxDQUFvQkcsUUFBUSxDQUFDaEYsWUFBN0I7RUFDSDs7RUEyTTJCLE1BQWQ2RSxjQUFjLE9BQTBDO0lBQUEsSUFBekM7TUFBRTVFLEtBQUY7TUFBU0M7SUFBVCxDQUF5QztJQUNsRSxJQUFJK0UsZUFBZSxHQUFHLEtBQXRCOztJQUNBLElBQUksS0FBSzdGLEtBQUwsQ0FBV1ksWUFBWCxDQUF3QmtGLFNBQXhCLElBQ0dqRixLQUFLLEtBQUssS0FBS2IsS0FBTCxDQUFXWSxZQUFYLENBQXdCQyxLQURyQyxJQUVHQyxLQUFLLEtBQUssS0FBS2QsS0FBTCxDQUFXWSxZQUFYLENBQXdCRSxLQUZ6QyxFQUVnRDtNQUM1QytFLGVBQWUsR0FBRyxJQUFsQjtJQUNIOztJQUVELE1BQU1FLGFBQWEsR0FBR0YsZUFBZSxHQUFHLEtBQUs3RixLQUFMLENBQVcrRixhQUFkLEdBQThCLElBQW5FO0lBRUEsTUFBTXpFLFVBQVUsR0FBRyxJQUFJMEUsY0FBSixDQUFVbkYsS0FBVixFQUFpQkMsS0FBakIsRUFBd0JpRixhQUF4QixFQUF1QztNQUN0REUsd0JBQXdCLEVBQUUsS0FBS2pHLEtBQUwsQ0FBV2lHO0lBRGlCLENBQXZDLENBQW5CO0lBR0EsS0FBSzNFLFVBQUwsR0FBa0JBLFVBQWxCO0lBRUEsS0FBS2QsUUFBTCxDQUFjO01BQ1ZOLElBQUksRUFBRSxJQURJO01BRVZtQixjQUFjLEVBQUU7SUFGTixDQUFkLEVBZmtFLENBb0JsRTs7SUFDQSxJQUFJO01BQ0EsTUFBTTtRQUFFNkU7TUFBRixJQUNGLE1BQU14RiwyQkFBQSxDQUFtQkMsa0NBQW5CLENBQXNERSxLQUF0RCxFQUE2REMsS0FBN0QsQ0FEVjs7TUFFQSxJQUFJb0YsT0FBSixFQUFhO1FBQ1QsS0FBSzFGLFFBQUwsaUNBQ09FLDJCQUFBLENBQW1CUSwwQkFBbkIsQ0FBOENnRixPQUE5QyxDQURQO1VBRUluRixTQUFTLEVBQUU7UUFGZjtNQUlILENBTEQsTUFLTztRQUNILEtBQUtQLFFBQUwsQ0FBYztVQUNWRCxhQUFhLEVBQUUsSUFETDtVQUVWUSxTQUFTLEVBQUU7UUFGRCxDQUFkO01BSUg7SUFDSixDQWRELENBY0UsT0FBT0MsQ0FBUCxFQUFVO01BQ1IsS0FBS1IsUUFBTDtRQUNJTixJQUFJLEVBQUU7TUFEVixHQUVPUSwyQkFBQSxDQUFtQlEsMEJBQW5CLENBQThDRixDQUE5QyxDQUZQO0lBSUg7O0lBRURNLFVBQVUsQ0FBQzZFLFFBQVgsR0FBc0IzRSxJQUF0QixDQUE0QnVDLEtBQUQsSUFBVztNQUNsQztNQUNBLE1BQU1xQyxjQUFjLEdBQUdyQyxLQUFLLENBQUNzQyxNQUFOLENBQWEsS0FBS0MsZUFBbEIsQ0FBdkI7O01BRUEsSUFBSUYsY0FBYyxDQUFDRyxNQUFmLEdBQXdCLENBQTVCLEVBQStCO1FBQzNCLEtBQUsvRixRQUFMLENBQWM7VUFDVnVELEtBQUssRUFBRXFDO1FBREcsQ0FBZDtRQUdBO01BQ0gsQ0FUaUMsQ0FXbEM7OztNQUNBLEtBQUs1RixRQUFMLENBQWM7UUFDVk8sU0FBUyxFQUFFLElBQUFpQixtQkFBQSxFQUFHLG1GQUFIO01BREQsQ0FBZDtJQUdILENBZkQsRUFlSXdFLEdBQUQsSUFBUztNQUNSLEtBQUtoRyxRQUFMLENBQWM7UUFDVk8sU0FBUyxFQUFFLEtBQUs0QixrQkFBTCxDQUF3QjZELEdBQXhCLENBREQ7UUFFVm5GLGNBQWMsRUFBRSxLQUZOO1FBR1Z3QixXQUFXLEVBQUU7TUFISCxDQUFkO0lBS0gsQ0FyQkQsRUFxQkc0RCxPQXJCSCxDQXFCVyxNQUFNO01BQ2IsS0FBS2pHLFFBQUwsQ0FBYztRQUNWTixJQUFJLEVBQUU7TUFESSxDQUFkO0lBR0gsQ0F6QkQ7RUEwQkg7O0VBWU95QyxrQkFBa0IsQ0FBQzZELEdBQUQsRUFBOEI7SUFDcEQsSUFBSUUsT0FBTyxHQUFHRixHQUFHLENBQUN2RSxPQUFsQjs7SUFDQSxJQUFJLENBQUN5RSxPQUFELElBQVlGLEdBQUcsQ0FBQ3pFLFVBQXBCLEVBQWdDO01BQzVCMkUsT0FBTyxHQUFHLFVBQVVGLEdBQUcsQ0FBQ3pFLFVBQXhCO0lBQ0g7O0lBRUQsSUFBSWhCLFNBQW9CLEdBQUcsSUFBQWlCLG1CQUFBLEVBQUcsNERBQzFCLHlCQUR1QixLQUNPMEUsT0FBTyxHQUFHLE9BQU9BLE9BQVAsR0FBaUIsR0FBcEIsR0FBMEIsRUFEeEMsQ0FBM0I7O0lBR0EsSUFBSUYsR0FBRyxDQUFDLE1BQUQsQ0FBSCxLQUFnQixVQUFwQixFQUFnQztNQUFFO01BQzlCLElBQUlHLE1BQU0sQ0FBQ0MsUUFBUCxDQUFnQkMsUUFBaEIsS0FBNkIsUUFBN0IsS0FDQyxLQUFLN0csS0FBTCxDQUFXWSxZQUFYLENBQXdCQyxLQUF4QixDQUE4QmlHLFVBQTlCLENBQXlDLE9BQXpDLEtBQ0EsQ0FBQyxLQUFLOUcsS0FBTCxDQUFXWSxZQUFYLENBQXdCQyxLQUF4QixDQUE4QmlHLFVBQTlCLENBQXlDLE1BQXpDLENBRkYsQ0FBSixFQUdFO1FBQ0UvRixTQUFTLGdCQUFHLDJDQUNOLElBQUFpQixtQkFBQSxFQUFHLG9GQUNELG1EQURGLEVBQ3VELEVBRHZELEVBRUY7VUFDSSxLQUFNK0UsR0FBRCxJQUFTO1lBQ1Ysb0JBQU87Y0FDSCxNQUFNLEVBQUMsUUFESjtjQUVILEdBQUcsRUFBQyxxQkFGRDtjQUdILElBQUksRUFBQztZQUhGLEdBS0RBLEdBTEMsQ0FBUDtVQU9IO1FBVEwsQ0FGRSxDQURNLENBQVo7TUFlSCxDQW5CRCxNQW1CTztRQUNIaEcsU0FBUyxnQkFBRywyQ0FDTixJQUFBaUIsbUJBQUEsRUFBRywrRUFDRCwrRUFEQyxHQUVELDJCQUZGLEVBRStCLEVBRi9CLEVBR0Y7VUFDSSxLQUFNK0UsR0FBRCxpQkFDRDtZQUFHLE1BQU0sRUFBQyxRQUFWO1lBQW1CLEdBQUcsRUFBQyxxQkFBdkI7WUFBNkMsSUFBSSxFQUFFLEtBQUsvRyxLQUFMLENBQVdZLFlBQVgsQ0FBd0JDO1VBQTNFLEdBQ01rRyxHQUROO1FBRlIsQ0FIRSxDQURNLENBQVo7TUFXSDtJQUNKOztJQUVELE9BQU9oRyxTQUFQO0VBQ0g7O0VBRURpRyw0QkFBNEIsR0FBRztJQUMzQixJQUFJLENBQUMsS0FBSy9HLEtBQUwsQ0FBVzhELEtBQWhCLEVBQXVCLE9BQU8sSUFBUCxDQURJLENBRzNCOztJQUNBLE1BQU1rRCxLQUFLLEdBQUcsQ0FDVixrQkFEVSxFQUVWLGFBRlUsQ0FBZDtJQUtBLE1BQU1sRCxLQUFLLEdBQUdrRCxLQUFLLENBQUNDLEdBQU4sQ0FBVWhELElBQUksSUFBSSxLQUFLakUsS0FBTCxDQUFXOEQsS0FBWCxDQUFpQkMsSUFBakIsQ0FBc0JDLElBQUksSUFBSUEsSUFBSSxDQUFDQyxJQUFMLEtBQWNBLElBQTVDLENBQWxCLEVBQXFFbUMsTUFBckUsQ0FBNEVjLE9BQTVFLENBQWQ7SUFDQSxvQkFBTyw2QkFBQyxjQUFELENBQU8sUUFBUCxRQUNEcEQsS0FBSyxDQUFDbUQsR0FBTixDQUFVakQsSUFBSSxJQUFJO01BQ2hCLE1BQU1tRCxZQUFZLEdBQUcsS0FBSzNDLGVBQUwsQ0FBcUJSLElBQUksQ0FBQ0MsSUFBMUIsQ0FBckI7TUFDQSxvQkFBTyw2QkFBQyxjQUFELENBQU8sUUFBUDtRQUFnQixHQUFHLEVBQUVELElBQUksQ0FBQ0M7TUFBMUIsR0FBa0NrRCxZQUFZLEVBQTlDLENBQVA7SUFDSCxDQUhDLENBREMsQ0FBUDtFQU1IOztFQW9DREMsTUFBTSxHQUFHO0lBQ0wsTUFBTUMsTUFBTSxHQUFHLEtBQUtyQyxNQUFMLE1BQWlCLENBQUMsS0FBS2hGLEtBQUwsQ0FBV2tCLGFBQTdCLGdCQUNYO01BQUssU0FBUyxFQUFDO0lBQWYsZ0JBQWlDLDZCQUFDLGdCQUFELE9BQWpDLENBRFcsR0FDMEMsSUFEekQ7SUFHQSxNQUFNSixTQUFTLEdBQUcsS0FBS2QsS0FBTCxDQUFXYyxTQUE3QjtJQUVBLElBQUl3RyxnQkFBSjs7SUFDQSxJQUFJeEcsU0FBSixFQUFlO01BQ1h3RyxnQkFBZ0IsZ0JBQ1o7UUFBSyxTQUFTLEVBQUM7TUFBZixHQUNNeEcsU0FETixDQURKO0lBS0g7O0lBRUQsSUFBSXlHLGlCQUFKOztJQUNBLElBQUksQ0FBQyxLQUFLdkgsS0FBTCxDQUFXTSxhQUFoQixFQUErQjtNQUMzQixNQUFNa0gsT0FBTyxHQUFHLElBQUFDLG1CQUFBLEVBQVc7UUFDdkIsa0JBQWtCLElBREs7UUFFdkIsd0JBQXdCLElBRkQ7UUFHdkIsZ0NBQWdDLENBQUMsS0FBS3pILEtBQUwsQ0FBV21CO01BSHJCLENBQVgsQ0FBaEI7TUFLQW9HLGlCQUFpQixnQkFDYjtRQUFLLFNBQVMsRUFBRUM7TUFBaEIsR0FDTSxLQUFLeEgsS0FBTCxDQUFXb0YsZUFEakIsQ0FESjtJQUtIOztJQUVELElBQUlzQyxNQUFKOztJQUNBLElBQUksS0FBSzNILEtBQUwsQ0FBV2tGLFNBQVgsSUFBd0IsS0FBS2pGLEtBQUwsQ0FBV2tCLGFBQXZDLEVBQXNEO01BQ2xEd0csTUFBTSxnQkFBRztRQUFLLFNBQVMsRUFBQztNQUFmLGdCQUNMO1FBQUssU0FBUyxFQUFDO01BQWYsZ0JBQ0ksNkJBQUMsc0JBQUQ7UUFBZSxDQUFDLEVBQUUsRUFBbEI7UUFBc0IsQ0FBQyxFQUFFO01BQXpCLEVBREosRUFFTSxLQUFLM0gsS0FBTCxDQUFXa0YsU0FBWCxHQUF1QixJQUFBbEQsbUJBQUEsRUFBRyxZQUFILENBQXZCLEdBQTBDLElBQUFBLG1CQUFBLEVBQUcsZUFBSCxDQUZoRCxDQURLLEVBS0gsS0FBS2hDLEtBQUwsQ0FBV2tGLFNBQVgsaUJBQXdCO1FBQUssU0FBUyxFQUFDO01BQWYsR0FDcEIsSUFBQWxELG1CQUFBLEVBQUcseURBQUgsQ0FEb0IsQ0FMckIsQ0FBVDtJQVNILENBVkQsTUFVTyxJQUFJNEYsc0JBQUEsQ0FBY0MsUUFBZCxDQUF1QkMsb0JBQUEsQ0FBVUMsWUFBakMsQ0FBSixFQUFvRDtNQUN2REosTUFBTSxnQkFDRjtRQUFNLFNBQVMsRUFBQztNQUFoQixHQUNNLElBQUEzRixtQkFBQSxFQUFHLDRCQUFILEVBQWlDLEVBQWpDLEVBQXFDO1FBQ25DZ0csQ0FBQyxFQUFFakIsR0FBRyxpQkFDRiw2QkFBQyx5QkFBRDtVQUFrQixJQUFJLEVBQUMsYUFBdkI7VUFBcUMsT0FBTyxFQUFFLEtBQUtrQjtRQUFuRCxHQUNNbEIsR0FETjtNQUYrQixDQUFyQyxDQUROLENBREo7SUFVSDs7SUFFRCxvQkFDSSw2QkFBQyxpQkFBRCxxQkFDSSw2QkFBQyxtQkFBRDtNQUFZLHVCQUF1QixFQUFFLEtBQUsvRyxLQUFMLENBQVdrRixTQUFYLElBQXdCLEtBQUtqRixLQUFMLENBQVdrQjtJQUF4RSxFQURKLGVBRUksNkJBQUMsaUJBQUQscUJBQ0kseUNBQ00sSUFBQWEsbUJBQUEsRUFBRyxTQUFILENBRE4sRUFFTXNGLE1BRk4sQ0FESixFQUtNQyxnQkFMTixFQU1NQyxpQkFOTixlQU9JLDZCQUFDLHFCQUFEO01BQ0ksWUFBWSxFQUFFLEtBQUt4SCxLQUFMLENBQVdZLFlBRDdCO01BRUksb0JBQW9CLEVBQUUsS0FBS1osS0FBTCxDQUFXb0Q7SUFGckMsRUFQSixFQVdNLEtBQUs0RCw0QkFBTCxFQVhOLEVBWU1XLE1BWk4sQ0FGSixDQURKO0VBbUJIOztBQWhnQjJFIn0=