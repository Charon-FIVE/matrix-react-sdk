"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _matrix = require("matrix-js-sdk/src/matrix");

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../../languageHandler");

var _ErrorUtils = require("../../../utils/ErrorUtils");

var _AutoDiscoveryUtils = _interopRequireDefault(require("../../../utils/AutoDiscoveryUtils"));

var Lifecycle = _interopRequireWildcard(require("../../../Lifecycle"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _AuthPage = _interopRequireDefault(require("../../views/auth/AuthPage"));

var _Login = _interopRequireDefault(require("../../../Login"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _SSOButtons = _interopRequireDefault(require("../../views/elements/SSOButtons"));

var _ServerPicker = _interopRequireDefault(require("../../views/elements/ServerPicker"));

var _RegistrationForm = _interopRequireDefault(require("../../views/auth/RegistrationForm"));

var _AccessibleButton = _interopRequireDefault(require("../../views/elements/AccessibleButton"));

var _AuthBody = _interopRequireDefault(require("../../views/auth/AuthBody"));

var _AuthHeader = _interopRequireDefault(require("../../views/auth/AuthHeader"));

var _InteractiveAuth = _interopRequireDefault(require("../InteractiveAuth"));

var _Spinner = _interopRequireDefault(require("../../views/elements/Spinner"));

var _AuthHeaderDisplay = require("./header/AuthHeaderDisplay");

var _AuthHeaderProvider = require("./header/AuthHeaderProvider");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

const debuglog = function () {
  if (_SettingsStore.default.getValue("debug_registration")) {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _logger.logger.log.call(console, "Registration debuglog:", ...args);
  }
};

class Registration extends _react.default.Component {
  // `replaceClient` tracks latest serverConfig to spot when it changes under the async method which fetches flows
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "loginLogic", void 0);
    (0, _defineProperty2.default)(this, "latestServerConfig", void 0);
    (0, _defineProperty2.default)(this, "unloadCallback", event => {
      if (this.state.doingUIAuth) {
        event.preventDefault();
        event.returnValue = "";
        return "";
      }
    });
    (0, _defineProperty2.default)(this, "onFormSubmit", async formVals => {
      this.setState({
        errorText: "",
        busy: true,
        formVals,
        doingUIAuth: true
      });
    });
    (0, _defineProperty2.default)(this, "requestEmailToken", (emailAddress, clientSecret, sendAttempt, sessionId) => {
      return this.state.matrixClient.requestRegisterEmailToken(emailAddress, clientSecret, sendAttempt, this.props.makeRegistrationUrl({
        client_secret: clientSecret,
        hs_url: this.state.matrixClient.getHomeserverUrl(),
        is_url: this.state.matrixClient.getIdentityServerUrl(),
        session_id: sessionId
      }));
    });
    (0, _defineProperty2.default)(this, "onUIAuthFinished", async (success, response) => {
      debuglog("Registration: ui authentication finished: ", {
        success,
        response
      });

      if (!success) {
        let errorText = response.message || response.toString(); // can we give a better error message?

        if (response.errcode === 'M_RESOURCE_LIMIT_EXCEEDED') {
          const errorTop = (0, _ErrorUtils.messageForResourceLimitError)(response.data.limit_type, response.data.admin_contact, {
            'monthly_active_user': (0, _languageHandler._td)("This homeserver has hit its Monthly Active User limit."),
            'hs_blocked': (0, _languageHandler._td)("This homeserver has been blocked by its administrator."),
            '': (0, _languageHandler._td)("This homeserver has exceeded one of its resource limits.")
          });
          const errorDetail = (0, _ErrorUtils.messageForResourceLimitError)(response.data.limit_type, response.data.admin_contact, {
            '': (0, _languageHandler._td)("Please <a>contact your service administrator</a> to continue using this service.")
          });
          errorText = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, errorTop), /*#__PURE__*/_react.default.createElement("p", null, errorDetail));
        } else if (response.required_stages && response.required_stages.includes(_matrix.AuthType.Msisdn)) {
          let msisdnAvailable = false;

          for (const flow of response.available_flows) {
            msisdnAvailable = msisdnAvailable || flow.stages.includes(_matrix.AuthType.Msisdn);
          }

          if (!msisdnAvailable) {
            errorText = (0, _languageHandler._t)('This server does not support authentication with a phone number.');
          }
        } else if (response.errcode === "M_USER_IN_USE") {
          errorText = (0, _languageHandler._t)("Someone already has that username, please try another.");
        } else if (response.errcode === "M_THREEPID_IN_USE") {
          errorText = (0, _languageHandler._t)("That e-mail address is already in use.");
        }

        this.setState({
          busy: false,
          doingUIAuth: false,
          errorText
        });
        return;
      }

      _MatrixClientPeg.MatrixClientPeg.setJustRegisteredUserId(response.user_id);

      const newState = {
        doingUIAuth: false,
        registeredUsername: response.user_id,
        differentLoggedInUserId: null,
        completedNoSignin: false,
        // we're still busy until we get unmounted: don't show the registration form again
        busy: true
      }; // The user came in through an email validation link. To avoid overwriting
      // their session, check to make sure the session isn't someone else, and
      // isn't a guest user since we'll usually have set a guest user session before
      // starting the registration process. This isn't perfect since it's possible
      // the user had a separate guest session they didn't actually mean to replace.

      const [sessionOwner, sessionIsGuest] = await Lifecycle.getStoredSessionOwner();

      if (sessionOwner && !sessionIsGuest && sessionOwner !== response.user_id) {
        _logger.logger.log(`Found a session for ${sessionOwner} but ${response.user_id} has just registered.`);

        newState.differentLoggedInUserId = sessionOwner;
      } // if we don't have an email at all, only one client can be involved in this flow, and we can directly log in.
      //
      // if we've got an email, it needs to be verified. in that case, two clients can be involved in this flow, the
      // original client starting the process and the client that submitted the verification token. After the token
      // has been submitted, it can not be used again.
      //
      // we can distinguish them based on whether the client has form values saved (if so, it's the one that started
      // the registration), or whether it doesn't have any form values saved (in which case it's the client that
      // verified the email address)
      //
      // as the client that started registration may be gone by the time we've verified the email, and only the client
      // that verified the email is guaranteed to exist, we'll always do the login in that client.


      const hasEmail = Boolean(this.state.formVals.email);
      const hasAccessToken = Boolean(response.access_token);
      debuglog("Registration: ui auth finished:", {
        hasEmail,
        hasAccessToken
      }); // don’t log in if we found a session for a different user

      if (!hasEmail && hasAccessToken && !newState.differentLoggedInUserId) {
        // we'll only try logging in if we either have no email to verify at all or we're the client that verified
        // the email, not the client that started the registration flow
        await this.props.onLoggedIn({
          userId: response.user_id,
          deviceId: response.device_id,
          homeserverUrl: this.state.matrixClient.getHomeserverUrl(),
          identityServerUrl: this.state.matrixClient.getIdentityServerUrl(),
          accessToken: response.access_token
        }, this.state.formVals.password);
        this.setupPushers();
      } else {
        newState.busy = false;
        newState.completedNoSignin = true;
      }

      this.setState(newState);
    });
    (0, _defineProperty2.default)(this, "onLoginClick", ev => {
      ev.preventDefault();
      ev.stopPropagation();
      this.props.onLoginClick();
    });
    (0, _defineProperty2.default)(this, "onGoToFormClicked", ev => {
      ev.preventDefault();
      ev.stopPropagation();
      this.replaceClient(this.props.serverConfig);
      this.setState({
        busy: false,
        doingUIAuth: false
      });
    });
    (0, _defineProperty2.default)(this, "makeRegisterRequest", auth => {
      const registerParams = {
        username: this.state.formVals.username,
        password: this.state.formVals.password,
        initial_device_display_name: this.props.defaultDeviceDisplayName,
        auth: undefined,
        // we still want to avoid the race conditions involved with multiple clients handling registration, but
        // we'll handle these after we've received the access_token in onUIAuthFinished
        inhibit_login: undefined
      };
      if (auth) registerParams.auth = auth;
      debuglog("Registration: sending registration request:", auth);
      return this.state.matrixClient.registerRequest(registerParams);
    });
    (0, _defineProperty2.default)(this, "onLoginClickWithCheck", async ev => {
      ev.preventDefault();
      const sessionLoaded = await Lifecycle.loadSession({
        ignoreGuest: true
      });

      if (!sessionLoaded) {
        // ok fine, there's still no session: really go to the login page
        this.props.onLoginClick();
      }

      return sessionLoaded;
    });
    this.state = {
      busy: false,
      errorText: null,
      formVals: {
        email: this.props.email
      },
      doingUIAuth: Boolean(this.props.sessionId),
      flows: null,
      completedNoSignin: false,
      serverIsAlive: true,
      serverErrorIsFatal: false,
      serverDeadError: ""
    };
    const {
      hsUrl,
      isUrl
    } = this.props.serverConfig;
    this.loginLogic = new _Login.default(hsUrl, isUrl, null, {
      defaultDeviceDisplayName: "Element login check" // We shouldn't ever be used

    });
  }

  componentDidMount() {
    this.replaceClient(this.props.serverConfig); //triggers a confirmation dialog for data loss before page unloads/refreshes

    window.addEventListener("beforeunload", this.unloadCallback);
  }

  componentWillUnmount() {
    window.removeEventListener("beforeunload", this.unloadCallback);
  }

  // TODO: [REACT-WARNING] Replace with appropriate lifecycle event
  // eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(newProps) {
    if (newProps.serverConfig.hsUrl === this.props.serverConfig.hsUrl && newProps.serverConfig.isUrl === this.props.serverConfig.isUrl) return;
    this.replaceClient(newProps.serverConfig);
  }

  async replaceClient(serverConfig) {
    this.latestServerConfig = serverConfig;
    const {
      hsUrl,
      isUrl
    } = serverConfig;
    this.setState({
      errorText: null,
      serverDeadError: null,
      serverErrorIsFatal: false,
      // busy while we do live-ness check (we need to avoid trying to render
      // the UI auth component while we don't have a matrix client)
      busy: true
    }); // Do a liveliness check on the URLs

    try {
      await _AutoDiscoveryUtils.default.validateServerConfigWithStaticUrls(hsUrl, isUrl);
      if (serverConfig !== this.latestServerConfig) return; // discard, serverConfig changed from under us

      this.setState({
        serverIsAlive: true,
        serverErrorIsFatal: false
      });
    } catch (e) {
      if (serverConfig !== this.latestServerConfig) return; // discard, serverConfig changed from under us

      this.setState(_objectSpread({
        busy: false
      }, _AutoDiscoveryUtils.default.authComponentStateForError(e, "register")));

      if (this.state.serverErrorIsFatal) {
        return; // Server is dead - do not continue.
      }
    }

    const cli = (0, _matrix.createClient)({
      baseUrl: hsUrl,
      idBaseUrl: isUrl
    });
    this.loginLogic.setHomeserverUrl(hsUrl);
    this.loginLogic.setIdentityServerUrl(isUrl);
    let ssoFlow;

    try {
      const loginFlows = await this.loginLogic.getFlows();
      if (serverConfig !== this.latestServerConfig) return; // discard, serverConfig changed from under us

      ssoFlow = loginFlows.find(f => f.type === "m.login.sso" || f.type === "m.login.cas");
    } catch (e) {
      if (serverConfig !== this.latestServerConfig) return; // discard, serverConfig changed from under us

      _logger.logger.error("Failed to get login flows to check for SSO support", e);
    }

    this.setState({
      matrixClient: cli,
      ssoFlow,
      busy: false
    });

    try {
      // We do the first registration request ourselves to discover whether we need to
      // do SSO instead. If we've already started the UI Auth process though, we don't
      // need to.
      if (!this.state.doingUIAuth) {
        await this.makeRegisterRequest(null);
        if (serverConfig !== this.latestServerConfig) return; // discard, serverConfig changed from under us
        // This should never succeed since we specified no auth object.

        _logger.logger.log("Expecting 401 from register request but got success!");
      }
    } catch (e) {
      if (serverConfig !== this.latestServerConfig) return; // discard, serverConfig changed from under us

      if (e.httpStatus === 401) {
        this.setState({
          flows: e.data.flows
        });
      } else if (e.httpStatus === 403 || e.errcode === "M_FORBIDDEN") {
        // Check for 403 or M_FORBIDDEN, Synapse used to send 403 M_UNKNOWN but now sends 403 M_FORBIDDEN.
        // At this point registration is pretty much disabled, but before we do that let's
        // quickly check to see if the server supports SSO instead. If it does, we'll send
        // the user off to the login page to figure their account out.
        if (ssoFlow) {
          // Redirect to login page - server probably expects SSO only
          _dispatcher.default.dispatch({
            action: 'start_login'
          });
        } else {
          this.setState({
            serverErrorIsFatal: true,
            // fatal because user cannot continue on this server
            errorText: (0, _languageHandler._t)("Registration has been disabled on this homeserver."),
            // add empty flows array to get rid of spinner
            flows: []
          });
        }
      } else {
        _logger.logger.log("Unable to query for supported registration methods.", e);

        this.setState({
          errorText: (0, _languageHandler._t)("Unable to query for supported registration methods."),
          // add empty flows array to get rid of spinner
          flows: []
        });
      }
    }
  }

  setupPushers() {
    if (!this.props.brand) {
      return Promise.resolve();
    }

    const matrixClient = _MatrixClientPeg.MatrixClientPeg.get();

    return matrixClient.getPushers().then(resp => {
      const pushers = resp.pushers;

      for (let i = 0; i < pushers.length; ++i) {
        if (pushers[i].kind === 'email') {
          const emailPusher = pushers[i];
          emailPusher.data = {
            brand: this.props.brand
          };
          matrixClient.setPusher(emailPusher).then(() => {
            _logger.logger.log("Set email branding to " + this.props.brand);
          }, error => {
            _logger.logger.error("Couldn't set email branding: " + error);
          });
        }
      }
    }, error => {
      _logger.logger.error("Couldn't get pushers: " + error);
    });
  }

  getUIAuthInputs() {
    return {
      emailAddress: this.state.formVals.email,
      phoneCountry: this.state.formVals.phoneCountry,
      phoneNumber: this.state.formVals.phoneNumber
    };
  } // Links to the login page shown after registration is completed are routed through this
  // which checks the user hasn't already logged in somewhere else (perhaps we should do
  // this more generally?)


  renderRegisterComponent() {
    if (this.state.matrixClient && this.state.doingUIAuth) {
      return /*#__PURE__*/_react.default.createElement(_InteractiveAuth.default, {
        matrixClient: this.state.matrixClient,
        makeRequest: this.makeRegisterRequest,
        onAuthFinished: this.onUIAuthFinished,
        inputs: this.getUIAuthInputs(),
        requestEmailToken: this.requestEmailToken,
        sessionId: this.props.sessionId,
        clientSecret: this.props.clientSecret,
        emailSid: this.props.idSid,
        poll: true
      });
    } else if (!this.state.matrixClient && !this.state.busy) {
      return null;
    } else if (this.state.busy || !this.state.flows) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_AuthBody_spinner"
      }, /*#__PURE__*/_react.default.createElement(_Spinner.default, null));
    } else if (this.state.flows.length) {
      let ssoSection;

      if (this.state.ssoFlow) {
        let continueWithSection;
        const providers = this.state.ssoFlow.identity_providers || []; // when there is only a single (or 0) providers we show a wide button with `Continue with X` text

        if (providers.length > 1) {
          // i18n: ssoButtons is a placeholder to help translators understand context
          continueWithSection = /*#__PURE__*/_react.default.createElement("h2", {
            className: "mx_AuthBody_centered"
          }, (0, _languageHandler._t)("Continue with %(ssoButtons)s", {
            ssoButtons: ""
          }).trim());
        } // i18n: ssoButtons & usernamePassword are placeholders to help translators understand context


        ssoSection = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, continueWithSection, /*#__PURE__*/_react.default.createElement(_SSOButtons.default, {
          matrixClient: this.loginLogic.createTemporaryClient(),
          flow: this.state.ssoFlow,
          loginType: this.state.ssoFlow.type === "m.login.sso" ? "sso" : "cas",
          fragmentAfterLogin: this.props.fragmentAfterLogin
        }), /*#__PURE__*/_react.default.createElement("h2", {
          className: "mx_AuthBody_centered"
        }, (0, _languageHandler._t)("%(ssoButtons)s Or %(usernamePassword)s", {
          ssoButtons: "",
          usernamePassword: ""
        }).trim()));
      }

      return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, ssoSection, /*#__PURE__*/_react.default.createElement(_RegistrationForm.default, {
        defaultUsername: this.state.formVals.username,
        defaultEmail: this.state.formVals.email,
        defaultPhoneCountry: this.state.formVals.phoneCountry,
        defaultPhoneNumber: this.state.formVals.phoneNumber,
        defaultPassword: this.state.formVals.password,
        onRegisterClick: this.onFormSubmit,
        flows: this.state.flows,
        serverConfig: this.props.serverConfig,
        canSubmit: !this.state.serverErrorIsFatal,
        matrixClient: this.state.matrixClient
      }));
    }
  }

  render() {
    let errorText;
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

    const signIn = /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_AuthBody_changeFlow"
    }, (0, _languageHandler._t)("Already have an account? <a>Sign in here</a>", {}, {
      a: sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "link_inline",
        onClick: this.onLoginClick
      }, sub)
    })); // Only show the 'go back' button if you're not looking at the form


    let goBack;

    if (this.state.doingUIAuth) {
      goBack = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "link",
        className: "mx_AuthBody_changeFlow",
        onClick: this.onGoToFormClicked
      }, (0, _languageHandler._t)('Go back'));
    }

    let body;

    if (this.state.completedNoSignin) {
      let regDoneText;

      if (this.state.differentLoggedInUserId) {
        regDoneText = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Your new account (%(newAccountId)s) is registered, but you're already " + "logged into a different account (%(loggedInUserId)s).", {
          newAccountId: this.state.registeredUsername,
          loggedInUserId: this.state.differentLoggedInUserId
        })), /*#__PURE__*/_react.default.createElement("p", null, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          kind: "link_inline",
          onClick: async event => {
            const sessionLoaded = await this.onLoginClickWithCheck(event);

            if (sessionLoaded) {
              _dispatcher.default.dispatch({
                action: "view_welcome_page"
              });
            }
          }
        }, (0, _languageHandler._t)("Continue with previous account"))));
      } else {
        // regardless of whether we're the client that started the registration or not, we should
        // try our credentials anyway
        regDoneText = /*#__PURE__*/_react.default.createElement("h2", null, (0, _languageHandler._t)("<a>Log in</a> to your new account.", {}, {
          a: sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
            kind: "link_inline",
            onClick: async event => {
              const sessionLoaded = await this.onLoginClickWithCheck(event);

              if (sessionLoaded) {
                _dispatcher.default.dispatch({
                  action: "view_home_page"
                });
              }
            }
          }, sub)
        }));
      }

      body = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("h1", null, (0, _languageHandler._t)("Registration Successful")), regDoneText);
    } else {
      body = /*#__PURE__*/_react.default.createElement(_react.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Register_mainContent"
      }, /*#__PURE__*/_react.default.createElement(_AuthHeaderDisplay.AuthHeaderDisplay, {
        title: (0, _languageHandler._t)('Create account'),
        serverPicker: /*#__PURE__*/_react.default.createElement(_ServerPicker.default, {
          title: (0, _languageHandler._t)("Host account on"),
          dialogTitle: (0, _languageHandler._t)("Decide where your account is hosted"),
          serverConfig: this.props.serverConfig,
          onServerConfigChange: this.state.doingUIAuth ? undefined : this.props.onServerConfigChange
        })
      }, errorText, serverDeadSection), this.renderRegisterComponent()), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Register_footerActions"
      }, goBack, signIn));
    }

    return /*#__PURE__*/_react.default.createElement(_AuthPage.default, null, /*#__PURE__*/_react.default.createElement(_AuthHeader.default, null), /*#__PURE__*/_react.default.createElement(_AuthHeaderProvider.AuthHeaderProvider, null, /*#__PURE__*/_react.default.createElement(_AuthBody.default, {
      flex: true
    }, body)));
  }

}

exports.default = Registration;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkZWJ1Z2xvZyIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsImFyZ3MiLCJsb2dnZXIiLCJsb2ciLCJjYWxsIiwiY29uc29sZSIsIlJlZ2lzdHJhdGlvbiIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImV2ZW50Iiwic3RhdGUiLCJkb2luZ1VJQXV0aCIsInByZXZlbnREZWZhdWx0IiwicmV0dXJuVmFsdWUiLCJmb3JtVmFscyIsInNldFN0YXRlIiwiZXJyb3JUZXh0IiwiYnVzeSIsImVtYWlsQWRkcmVzcyIsImNsaWVudFNlY3JldCIsInNlbmRBdHRlbXB0Iiwic2Vzc2lvbklkIiwibWF0cml4Q2xpZW50IiwicmVxdWVzdFJlZ2lzdGVyRW1haWxUb2tlbiIsIm1ha2VSZWdpc3RyYXRpb25VcmwiLCJjbGllbnRfc2VjcmV0IiwiaHNfdXJsIiwiZ2V0SG9tZXNlcnZlclVybCIsImlzX3VybCIsImdldElkZW50aXR5U2VydmVyVXJsIiwic2Vzc2lvbl9pZCIsInN1Y2Nlc3MiLCJyZXNwb25zZSIsIm1lc3NhZ2UiLCJ0b1N0cmluZyIsImVycmNvZGUiLCJlcnJvclRvcCIsIm1lc3NhZ2VGb3JSZXNvdXJjZUxpbWl0RXJyb3IiLCJkYXRhIiwibGltaXRfdHlwZSIsImFkbWluX2NvbnRhY3QiLCJfdGQiLCJlcnJvckRldGFpbCIsInJlcXVpcmVkX3N0YWdlcyIsImluY2x1ZGVzIiwiQXV0aFR5cGUiLCJNc2lzZG4iLCJtc2lzZG5BdmFpbGFibGUiLCJmbG93IiwiYXZhaWxhYmxlX2Zsb3dzIiwic3RhZ2VzIiwiX3QiLCJNYXRyaXhDbGllbnRQZWciLCJzZXRKdXN0UmVnaXN0ZXJlZFVzZXJJZCIsInVzZXJfaWQiLCJuZXdTdGF0ZSIsInJlZ2lzdGVyZWRVc2VybmFtZSIsImRpZmZlcmVudExvZ2dlZEluVXNlcklkIiwiY29tcGxldGVkTm9TaWduaW4iLCJzZXNzaW9uT3duZXIiLCJzZXNzaW9uSXNHdWVzdCIsIkxpZmVjeWNsZSIsImdldFN0b3JlZFNlc3Npb25Pd25lciIsImhhc0VtYWlsIiwiQm9vbGVhbiIsImVtYWlsIiwiaGFzQWNjZXNzVG9rZW4iLCJhY2Nlc3NfdG9rZW4iLCJvbkxvZ2dlZEluIiwidXNlcklkIiwiZGV2aWNlSWQiLCJkZXZpY2VfaWQiLCJob21lc2VydmVyVXJsIiwiaWRlbnRpdHlTZXJ2ZXJVcmwiLCJhY2Nlc3NUb2tlbiIsInBhc3N3b3JkIiwic2V0dXBQdXNoZXJzIiwiZXYiLCJzdG9wUHJvcGFnYXRpb24iLCJvbkxvZ2luQ2xpY2siLCJyZXBsYWNlQ2xpZW50Iiwic2VydmVyQ29uZmlnIiwiYXV0aCIsInJlZ2lzdGVyUGFyYW1zIiwidXNlcm5hbWUiLCJpbml0aWFsX2RldmljZV9kaXNwbGF5X25hbWUiLCJkZWZhdWx0RGV2aWNlRGlzcGxheU5hbWUiLCJ1bmRlZmluZWQiLCJpbmhpYml0X2xvZ2luIiwicmVnaXN0ZXJSZXF1ZXN0Iiwic2Vzc2lvbkxvYWRlZCIsImxvYWRTZXNzaW9uIiwiaWdub3JlR3Vlc3QiLCJmbG93cyIsInNlcnZlcklzQWxpdmUiLCJzZXJ2ZXJFcnJvcklzRmF0YWwiLCJzZXJ2ZXJEZWFkRXJyb3IiLCJoc1VybCIsImlzVXJsIiwibG9naW5Mb2dpYyIsIkxvZ2luIiwiY29tcG9uZW50RGlkTW91bnQiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwidW5sb2FkQ2FsbGJhY2siLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJVTlNBRkVfY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyIsIm5ld1Byb3BzIiwibGF0ZXN0U2VydmVyQ29uZmlnIiwiQXV0b0Rpc2NvdmVyeVV0aWxzIiwidmFsaWRhdGVTZXJ2ZXJDb25maWdXaXRoU3RhdGljVXJscyIsImUiLCJhdXRoQ29tcG9uZW50U3RhdGVGb3JFcnJvciIsImNsaSIsImNyZWF0ZUNsaWVudCIsImJhc2VVcmwiLCJpZEJhc2VVcmwiLCJzZXRIb21lc2VydmVyVXJsIiwic2V0SWRlbnRpdHlTZXJ2ZXJVcmwiLCJzc29GbG93IiwibG9naW5GbG93cyIsImdldEZsb3dzIiwiZmluZCIsImYiLCJ0eXBlIiwiZXJyb3IiLCJtYWtlUmVnaXN0ZXJSZXF1ZXN0IiwiaHR0cFN0YXR1cyIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwiYnJhbmQiLCJQcm9taXNlIiwicmVzb2x2ZSIsImdldCIsImdldFB1c2hlcnMiLCJ0aGVuIiwicmVzcCIsInB1c2hlcnMiLCJpIiwibGVuZ3RoIiwia2luZCIsImVtYWlsUHVzaGVyIiwic2V0UHVzaGVyIiwiZ2V0VUlBdXRoSW5wdXRzIiwicGhvbmVDb3VudHJ5IiwicGhvbmVOdW1iZXIiLCJyZW5kZXJSZWdpc3RlckNvbXBvbmVudCIsIm9uVUlBdXRoRmluaXNoZWQiLCJyZXF1ZXN0RW1haWxUb2tlbiIsImlkU2lkIiwic3NvU2VjdGlvbiIsImNvbnRpbnVlV2l0aFNlY3Rpb24iLCJwcm92aWRlcnMiLCJpZGVudGl0eV9wcm92aWRlcnMiLCJzc29CdXR0b25zIiwidHJpbSIsImNyZWF0ZVRlbXBvcmFyeUNsaWVudCIsImZyYWdtZW50QWZ0ZXJMb2dpbiIsInVzZXJuYW1lUGFzc3dvcmQiLCJvbkZvcm1TdWJtaXQiLCJyZW5kZXIiLCJlcnIiLCJzZXJ2ZXJEZWFkU2VjdGlvbiIsImNsYXNzZXMiLCJjbGFzc05hbWVzIiwic2lnbkluIiwiYSIsInN1YiIsImdvQmFjayIsIm9uR29Ub0Zvcm1DbGlja2VkIiwiYm9keSIsInJlZ0RvbmVUZXh0IiwibmV3QWNjb3VudElkIiwibG9nZ2VkSW5Vc2VySWQiLCJvbkxvZ2luQ2xpY2tXaXRoQ2hlY2siLCJvblNlcnZlckNvbmZpZ0NoYW5nZSJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvYXV0aC9SZWdpc3RyYXRpb24udHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNS0yMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgQXV0aFR5cGUsIGNyZWF0ZUNsaWVudCB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL21hdHJpeCc7XG5pbXBvcnQgUmVhY3QsIHsgRnJhZ21lbnQsIFJlYWN0Tm9kZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IE1hdHJpeENsaWVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jbGllbnRcIjtcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5cbmltcG9ydCB7IF90LCBfdGQgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHsgbWVzc2FnZUZvclJlc291cmNlTGltaXRFcnJvciB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL0Vycm9yVXRpbHMnO1xuaW1wb3J0IEF1dG9EaXNjb3ZlcnlVdGlscyBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvQXV0b0Rpc2NvdmVyeVV0aWxzXCI7XG5pbXBvcnQgKiBhcyBMaWZlY3ljbGUgZnJvbSAnLi4vLi4vLi4vTGlmZWN5Y2xlJztcbmltcG9ydCB7IElNYXRyaXhDbGllbnRDcmVkcywgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSBcIi4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IEF1dGhQYWdlIGZyb20gXCIuLi8uLi92aWV3cy9hdXRoL0F1dGhQYWdlXCI7XG5pbXBvcnQgTG9naW4sIHsgSVNTT0Zsb3cgfSBmcm9tIFwiLi4vLi4vLi4vTG9naW5cIjtcbmltcG9ydCBkaXMgZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IFNTT0J1dHRvbnMgZnJvbSBcIi4uLy4uL3ZpZXdzL2VsZW1lbnRzL1NTT0J1dHRvbnNcIjtcbmltcG9ydCBTZXJ2ZXJQaWNrZXIgZnJvbSAnLi4vLi4vdmlld3MvZWxlbWVudHMvU2VydmVyUGlja2VyJztcbmltcG9ydCBSZWdpc3RyYXRpb25Gb3JtIGZyb20gJy4uLy4uL3ZpZXdzL2F1dGgvUmVnaXN0cmF0aW9uRm9ybSc7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tICcuLi8uLi92aWV3cy9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uJztcbmltcG9ydCBBdXRoQm9keSBmcm9tIFwiLi4vLi4vdmlld3MvYXV0aC9BdXRoQm9keVwiO1xuaW1wb3J0IEF1dGhIZWFkZXIgZnJvbSBcIi4uLy4uL3ZpZXdzL2F1dGgvQXV0aEhlYWRlclwiO1xuaW1wb3J0IEludGVyYWN0aXZlQXV0aCwgeyBJbnRlcmFjdGl2ZUF1dGhDYWxsYmFjayB9IGZyb20gXCIuLi9JbnRlcmFjdGl2ZUF1dGhcIjtcbmltcG9ydCBTcGlubmVyIGZyb20gXCIuLi8uLi92aWV3cy9lbGVtZW50cy9TcGlubmVyXCI7XG5pbXBvcnQgeyBBdXRoSGVhZGVyRGlzcGxheSB9IGZyb20gJy4vaGVhZGVyL0F1dGhIZWFkZXJEaXNwbGF5JztcbmltcG9ydCB7IEF1dGhIZWFkZXJQcm92aWRlciB9IGZyb20gJy4vaGVhZGVyL0F1dGhIZWFkZXJQcm92aWRlcic7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tICcuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlJztcbmltcG9ydCB7IFZhbGlkYXRlZFNlcnZlckNvbmZpZyB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL1ZhbGlkYXRlZFNlcnZlckNvbmZpZyc7XG5cbmNvbnN0IGRlYnVnbG9nID0gKC4uLmFyZ3M6IGFueVtdKSA9PiB7XG4gICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJkZWJ1Z19yZWdpc3RyYXRpb25cIikpIHtcbiAgICAgICAgbG9nZ2VyLmxvZy5jYWxsKGNvbnNvbGUsIFwiUmVnaXN0cmF0aW9uIGRlYnVnbG9nOlwiLCAuLi5hcmdzKTtcbiAgICB9XG59O1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBzZXJ2ZXJDb25maWc6IFZhbGlkYXRlZFNlcnZlckNvbmZpZztcbiAgICBkZWZhdWx0RGV2aWNlRGlzcGxheU5hbWU6IHN0cmluZztcbiAgICBlbWFpbD86IHN0cmluZztcbiAgICBicmFuZD86IHN0cmluZztcbiAgICBjbGllbnRTZWNyZXQ/OiBzdHJpbmc7XG4gICAgc2Vzc2lvbklkPzogc3RyaW5nO1xuICAgIGlkU2lkPzogc3RyaW5nO1xuICAgIGZyYWdtZW50QWZ0ZXJMb2dpbj86IHN0cmluZztcblxuICAgIC8vIENhbGxlZCB3aGVuIHRoZSB1c2VyIGhhcyBsb2dnZWQgaW4uIFBhcmFtczpcbiAgICAvLyAtIG9iamVjdCB3aXRoIHVzZXJJZCwgZGV2aWNlSWQsIGhvbWVzZXJ2ZXJVcmwsIGlkZW50aXR5U2VydmVyVXJsLCBhY2Nlc3NUb2tlblxuICAgIC8vIC0gVGhlIHVzZXIncyBwYXNzd29yZCwgaWYgYXZhaWxhYmxlIGFuZCBhcHBsaWNhYmxlIChtYXkgYmUgY2FjaGVkIGluIG1lbW9yeVxuICAgIC8vICAgZm9yIGEgc2hvcnQgdGltZSBzbyB0aGUgdXNlciBpcyBub3QgcmVxdWlyZWQgdG8gcmUtZW50ZXIgdGhlaXIgcGFzc3dvcmRcbiAgICAvLyAgIGZvciBvcGVyYXRpb25zIGxpa2UgdXBsb2FkaW5nIGNyb3NzLXNpZ25pbmcga2V5cykuXG4gICAgb25Mb2dnZWRJbihwYXJhbXM6IElNYXRyaXhDbGllbnRDcmVkcywgcGFzc3dvcmQ6IHN0cmluZyk6IHZvaWQ7XG4gICAgbWFrZVJlZ2lzdHJhdGlvblVybChwYXJhbXM6IHtcbiAgICAgICAgLyogZXNsaW50LWRpc2FibGUgY2FtZWxjYXNlICovXG4gICAgICAgIGNsaWVudF9zZWNyZXQ6IHN0cmluZztcbiAgICAgICAgaHNfdXJsOiBzdHJpbmc7XG4gICAgICAgIGlzX3VybD86IHN0cmluZztcbiAgICAgICAgc2Vzc2lvbl9pZDogc3RyaW5nO1xuICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIGNhbWVsY2FzZSAqL1xuICAgIH0pOiBzdHJpbmc7XG4gICAgLy8gcmVnaXN0cmF0aW9uIHNob3VsZG4ndCBrbm93IG9yIGNhcmUgaG93IGxvZ2luIGlzIGRvbmUuXG4gICAgb25Mb2dpbkNsaWNrKCk6IHZvaWQ7XG4gICAgb25TZXJ2ZXJDb25maWdDaGFuZ2UoY29uZmlnOiBWYWxpZGF0ZWRTZXJ2ZXJDb25maWcpOiB2b2lkO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBidXN5OiBib29sZWFuO1xuICAgIGVycm9yVGV4dD86IFJlYWN0Tm9kZTtcbiAgICAvLyB0cnVlIGlmIHdlJ3JlIHdhaXRpbmcgZm9yIHRoZSB1c2VyIHRvIGNvbXBsZXRlXG4gICAgLy8gV2UgcmVtZW1iZXIgdGhlIHZhbHVlcyBlbnRlcmVkIGJ5IHRoZSB1c2VyIGJlY2F1c2VcbiAgICAvLyB0aGUgcmVnaXN0cmF0aW9uIGZvcm0gd2lsbCBiZSB1bm1vdW50ZWQgZHVyaW5nIHRoZVxuICAgIC8vIGNvdXJzZSBvZiByZWdpc3RyYXRpb24sIGJ1dCBpZiB0aGVyZSdzIGFuIGVycm9yIHdlXG4gICAgLy8gd2FudCB0byBicmluZyBiYWNrIHRoZSByZWdpc3RyYXRpb24gZm9ybSB3aXRoIHRoZVxuICAgIC8vIHZhbHVlcyB0aGUgdXNlciBlbnRlcmVkIHN0aWxsIGluIGl0LiBXZSBjYW4ga2VlcFxuICAgIC8vIHRoZW0gaW4gdGhpcyBjb21wb25lbnQncyBzdGF0ZSBzaW5jZSB0aGlzIGNvbXBvbmVudFxuICAgIC8vIHBlcnNpc3QgZm9yIHRoZSBkdXJhdGlvbiBvZiB0aGUgcmVnaXN0cmF0aW9uIHByb2Nlc3MuXG4gICAgZm9ybVZhbHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG4gICAgLy8gdXNlci1pbnRlcmFjdGl2ZSBhdXRoXG4gICAgLy8gSWYgd2UndmUgYmVlbiBnaXZlbiBhIHNlc3Npb24gSUQsIHdlJ3JlIHJlc3VtaW5nXG4gICAgLy8gc3RyYWlnaHQgYmFjayBpbnRvIFVJIGF1dGhcbiAgICBkb2luZ1VJQXV0aDogYm9vbGVhbjtcbiAgICAvLyBJZiBzZXQsIHdlJ3ZlIHJlZ2lzdGVyZWQgYnV0IGFyZSBub3QgZ29pbmcgdG8gbG9nXG4gICAgLy8gdGhlIHVzZXIgaW4gdG8gdGhlaXIgbmV3IGFjY291bnQgYXV0b21hdGljYWxseS5cbiAgICBjb21wbGV0ZWROb1NpZ25pbjogYm9vbGVhbjtcbiAgICBmbG93czoge1xuICAgICAgICBzdGFnZXM6IHN0cmluZ1tdO1xuICAgIH1bXTtcbiAgICAvLyBXZSBwZXJmb3JtIGxpdmVsaW5lc3MgY2hlY2tzIGxhdGVyLCBidXQgZm9yIG5vdyBzdXBwcmVzcyB0aGUgZXJyb3JzLlxuICAgIC8vIFdlIGFsc28gdHJhY2sgdGhlIHNlcnZlciBkZWFkIGVycm9ycyBpbmRlcGVuZGVudGx5IG9mIHRoZSByZWd1bGFyIGVycm9ycyBzb1xuICAgIC8vIHRoYXQgd2UgY2FuIHJlbmRlciBpdCBkaWZmZXJlbnRseSwgYW5kIG92ZXJyaWRlIGFueSBvdGhlciBlcnJvciB0aGUgdXNlciBtYXlcbiAgICAvLyBiZSBzZWVpbmcuXG4gICAgc2VydmVySXNBbGl2ZTogYm9vbGVhbjtcbiAgICBzZXJ2ZXJFcnJvcklzRmF0YWw6IGJvb2xlYW47XG4gICAgc2VydmVyRGVhZEVycm9yPzogUmVhY3ROb2RlO1xuXG4gICAgLy8gT3VyIG1hdHJpeCBjbGllbnQgLSBwYXJ0IG9mIHN0YXRlIGJlY2F1c2Ugd2UgY2FuJ3QgcmVuZGVyIHRoZSBVSSBhdXRoXG4gICAgLy8gY29tcG9uZW50IHdpdGhvdXQgaXQuXG4gICAgbWF0cml4Q2xpZW50PzogTWF0cml4Q2xpZW50O1xuICAgIC8vIFRoZSB1c2VyIElEIHdlJ3ZlIGp1c3QgcmVnaXN0ZXJlZFxuICAgIHJlZ2lzdGVyZWRVc2VybmFtZT86IHN0cmluZztcbiAgICAvLyBpZiBhIGRpZmZlcmVudCB1c2VyIElEIHRvIHRoZSBvbmUgd2UganVzdCByZWdpc3RlcmVkIGlzIGxvZ2dlZCBpbixcbiAgICAvLyB0aGlzIGlzIHRoZSB1c2VyIElEIHRoYXQncyBsb2dnZWQgaW4uXG4gICAgZGlmZmVyZW50TG9nZ2VkSW5Vc2VySWQ/OiBzdHJpbmc7XG4gICAgLy8gdGhlIFNTTyBmbG93IGRlZmluaXRpb24sIHRoaXMgaXMgZmV0Y2hlZCBmcm9tIC9sb2dpbiBhcyB0aGF0J3MgdGhlIG9ubHlcbiAgICAvLyBwbGFjZSBpdCBpcyBleHBvc2VkLlxuICAgIHNzb0Zsb3c/OiBJU1NPRmxvdztcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVnaXN0cmF0aW9uIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSByZWFkb25seSBsb2dpbkxvZ2ljOiBMb2dpbjtcbiAgICAvLyBgcmVwbGFjZUNsaWVudGAgdHJhY2tzIGxhdGVzdCBzZXJ2ZXJDb25maWcgdG8gc3BvdCB3aGVuIGl0IGNoYW5nZXMgdW5kZXIgdGhlIGFzeW5jIG1ldGhvZCB3aGljaCBmZXRjaGVzIGZsb3dzXG4gICAgcHJpdmF0ZSBsYXRlc3RTZXJ2ZXJDb25maWc6IFZhbGlkYXRlZFNlcnZlckNvbmZpZztcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICBlcnJvclRleHQ6IG51bGwsXG4gICAgICAgICAgICBmb3JtVmFsczoge1xuICAgICAgICAgICAgICAgIGVtYWlsOiB0aGlzLnByb3BzLmVtYWlsLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRvaW5nVUlBdXRoOiBCb29sZWFuKHRoaXMucHJvcHMuc2Vzc2lvbklkKSxcbiAgICAgICAgICAgIGZsb3dzOiBudWxsLFxuICAgICAgICAgICAgY29tcGxldGVkTm9TaWduaW46IGZhbHNlLFxuICAgICAgICAgICAgc2VydmVySXNBbGl2ZTogdHJ1ZSxcbiAgICAgICAgICAgIHNlcnZlckVycm9ySXNGYXRhbDogZmFsc2UsXG4gICAgICAgICAgICBzZXJ2ZXJEZWFkRXJyb3I6IFwiXCIsXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgeyBoc1VybCwgaXNVcmwgfSA9IHRoaXMucHJvcHMuc2VydmVyQ29uZmlnO1xuICAgICAgICB0aGlzLmxvZ2luTG9naWMgPSBuZXcgTG9naW4oaHNVcmwsIGlzVXJsLCBudWxsLCB7XG4gICAgICAgICAgICBkZWZhdWx0RGV2aWNlRGlzcGxheU5hbWU6IFwiRWxlbWVudCBsb2dpbiBjaGVja1wiLCAvLyBXZSBzaG91bGRuJ3QgZXZlciBiZSB1c2VkXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLnJlcGxhY2VDbGllbnQodGhpcy5wcm9wcy5zZXJ2ZXJDb25maWcpO1xuICAgICAgICAvL3RyaWdnZXJzIGEgY29uZmlybWF0aW9uIGRpYWxvZyBmb3IgZGF0YSBsb3NzIGJlZm9yZSBwYWdlIHVubG9hZHMvcmVmcmVzaGVzXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiYmVmb3JldW5sb2FkXCIsIHRoaXMudW5sb2FkQ2FsbGJhY2spO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImJlZm9yZXVubG9hZFwiLCB0aGlzLnVubG9hZENhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHVubG9hZENhbGxiYWNrID0gKGV2ZW50OiBCZWZvcmVVbmxvYWRFdmVudCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5kb2luZ1VJQXV0aCkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGV2ZW50LnJldHVyblZhbHVlID0gXCJcIjtcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyBUT0RPOiBbUkVBQ1QtV0FSTklOR10gUmVwbGFjZSB3aXRoIGFwcHJvcHJpYXRlIGxpZmVjeWNsZSBldmVudFxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuICAgIFVOU0FGRV9jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5ld1Byb3BzKSB7XG4gICAgICAgIGlmIChuZXdQcm9wcy5zZXJ2ZXJDb25maWcuaHNVcmwgPT09IHRoaXMucHJvcHMuc2VydmVyQ29uZmlnLmhzVXJsICYmXG4gICAgICAgICAgICBuZXdQcm9wcy5zZXJ2ZXJDb25maWcuaXNVcmwgPT09IHRoaXMucHJvcHMuc2VydmVyQ29uZmlnLmlzVXJsKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5yZXBsYWNlQ2xpZW50KG5ld1Byb3BzLnNlcnZlckNvbmZpZyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyByZXBsYWNlQ2xpZW50KHNlcnZlckNvbmZpZzogVmFsaWRhdGVkU2VydmVyQ29uZmlnKSB7XG4gICAgICAgIHRoaXMubGF0ZXN0U2VydmVyQ29uZmlnID0gc2VydmVyQ29uZmlnO1xuICAgICAgICBjb25zdCB7IGhzVXJsLCBpc1VybCB9ID0gc2VydmVyQ29uZmlnO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZXJyb3JUZXh0OiBudWxsLFxuICAgICAgICAgICAgc2VydmVyRGVhZEVycm9yOiBudWxsLFxuICAgICAgICAgICAgc2VydmVyRXJyb3JJc0ZhdGFsOiBmYWxzZSxcbiAgICAgICAgICAgIC8vIGJ1c3kgd2hpbGUgd2UgZG8gbGl2ZS1uZXNzIGNoZWNrICh3ZSBuZWVkIHRvIGF2b2lkIHRyeWluZyB0byByZW5kZXJcbiAgICAgICAgICAgIC8vIHRoZSBVSSBhdXRoIGNvbXBvbmVudCB3aGlsZSB3ZSBkb24ndCBoYXZlIGEgbWF0cml4IGNsaWVudClcbiAgICAgICAgICAgIGJ1c3k6IHRydWUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIERvIGEgbGl2ZWxpbmVzcyBjaGVjayBvbiB0aGUgVVJMc1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgQXV0b0Rpc2NvdmVyeVV0aWxzLnZhbGlkYXRlU2VydmVyQ29uZmlnV2l0aFN0YXRpY1VybHMoaHNVcmwsIGlzVXJsKTtcbiAgICAgICAgICAgIGlmIChzZXJ2ZXJDb25maWcgIT09IHRoaXMubGF0ZXN0U2VydmVyQ29uZmlnKSByZXR1cm47IC8vIGRpc2NhcmQsIHNlcnZlckNvbmZpZyBjaGFuZ2VkIGZyb20gdW5kZXIgdXNcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHNlcnZlcklzQWxpdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgc2VydmVyRXJyb3JJc0ZhdGFsOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoc2VydmVyQ29uZmlnICE9PSB0aGlzLmxhdGVzdFNlcnZlckNvbmZpZykgcmV0dXJuOyAvLyBkaXNjYXJkLCBzZXJ2ZXJDb25maWcgY2hhbmdlZCBmcm9tIHVuZGVyIHVzXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAuLi5BdXRvRGlzY292ZXJ5VXRpbHMuYXV0aENvbXBvbmVudFN0YXRlRm9yRXJyb3IoZSwgXCJyZWdpc3RlclwiKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2VydmVyRXJyb3JJc0ZhdGFsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuOyAvLyBTZXJ2ZXIgaXMgZGVhZCAtIGRvIG5vdCBjb250aW51ZS5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNsaSA9IGNyZWF0ZUNsaWVudCh7XG4gICAgICAgICAgICBiYXNlVXJsOiBoc1VybCxcbiAgICAgICAgICAgIGlkQmFzZVVybDogaXNVcmwsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMubG9naW5Mb2dpYy5zZXRIb21lc2VydmVyVXJsKGhzVXJsKTtcbiAgICAgICAgdGhpcy5sb2dpbkxvZ2ljLnNldElkZW50aXR5U2VydmVyVXJsKGlzVXJsKTtcblxuICAgICAgICBsZXQgc3NvRmxvdzogSVNTT0Zsb3c7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBsb2dpbkZsb3dzID0gYXdhaXQgdGhpcy5sb2dpbkxvZ2ljLmdldEZsb3dzKCk7XG4gICAgICAgICAgICBpZiAoc2VydmVyQ29uZmlnICE9PSB0aGlzLmxhdGVzdFNlcnZlckNvbmZpZykgcmV0dXJuOyAvLyBkaXNjYXJkLCBzZXJ2ZXJDb25maWcgY2hhbmdlZCBmcm9tIHVuZGVyIHVzXG4gICAgICAgICAgICBzc29GbG93ID0gbG9naW5GbG93cy5maW5kKGYgPT4gZi50eXBlID09PSBcIm0ubG9naW4uc3NvXCIgfHwgZi50eXBlID09PSBcIm0ubG9naW4uY2FzXCIpIGFzIElTU09GbG93O1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoc2VydmVyQ29uZmlnICE9PSB0aGlzLmxhdGVzdFNlcnZlckNvbmZpZykgcmV0dXJuOyAvLyBkaXNjYXJkLCBzZXJ2ZXJDb25maWcgY2hhbmdlZCBmcm9tIHVuZGVyIHVzXG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJGYWlsZWQgdG8gZ2V0IGxvZ2luIGZsb3dzIHRvIGNoZWNrIGZvciBTU08gc3VwcG9ydFwiLCBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbWF0cml4Q2xpZW50OiBjbGksXG4gICAgICAgICAgICBzc29GbG93LFxuICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXZSBkbyB0aGUgZmlyc3QgcmVnaXN0cmF0aW9uIHJlcXVlc3Qgb3Vyc2VsdmVzIHRvIGRpc2NvdmVyIHdoZXRoZXIgd2UgbmVlZCB0b1xuICAgICAgICAgICAgLy8gZG8gU1NPIGluc3RlYWQuIElmIHdlJ3ZlIGFscmVhZHkgc3RhcnRlZCB0aGUgVUkgQXV0aCBwcm9jZXNzIHRob3VnaCwgd2UgZG9uJ3RcbiAgICAgICAgICAgIC8vIG5lZWQgdG8uXG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZG9pbmdVSUF1dGgpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLm1ha2VSZWdpc3RlclJlcXVlc3QobnVsbCk7XG4gICAgICAgICAgICAgICAgaWYgKHNlcnZlckNvbmZpZyAhPT0gdGhpcy5sYXRlc3RTZXJ2ZXJDb25maWcpIHJldHVybjsgLy8gZGlzY2FyZCwgc2VydmVyQ29uZmlnIGNoYW5nZWQgZnJvbSB1bmRlciB1c1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgc2hvdWxkIG5ldmVyIHN1Y2NlZWQgc2luY2Ugd2Ugc3BlY2lmaWVkIG5vIGF1dGggb2JqZWN0LlxuICAgICAgICAgICAgICAgIGxvZ2dlci5sb2coXCJFeHBlY3RpbmcgNDAxIGZyb20gcmVnaXN0ZXIgcmVxdWVzdCBidXQgZ290IHN1Y2Nlc3MhXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoc2VydmVyQ29uZmlnICE9PSB0aGlzLmxhdGVzdFNlcnZlckNvbmZpZykgcmV0dXJuOyAvLyBkaXNjYXJkLCBzZXJ2ZXJDb25maWcgY2hhbmdlZCBmcm9tIHVuZGVyIHVzXG4gICAgICAgICAgICBpZiAoZS5odHRwU3RhdHVzID09PSA0MDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgZmxvd3M6IGUuZGF0YS5mbG93cyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZS5odHRwU3RhdHVzID09PSA0MDMgfHwgZS5lcnJjb2RlID09PSBcIk1fRk9SQklEREVOXCIpIHtcbiAgICAgICAgICAgICAgICAvLyBDaGVjayBmb3IgNDAzIG9yIE1fRk9SQklEREVOLCBTeW5hcHNlIHVzZWQgdG8gc2VuZCA0MDMgTV9VTktOT1dOIGJ1dCBub3cgc2VuZHMgNDAzIE1fRk9SQklEREVOLlxuICAgICAgICAgICAgICAgIC8vIEF0IHRoaXMgcG9pbnQgcmVnaXN0cmF0aW9uIGlzIHByZXR0eSBtdWNoIGRpc2FibGVkLCBidXQgYmVmb3JlIHdlIGRvIHRoYXQgbGV0J3NcbiAgICAgICAgICAgICAgICAvLyBxdWlja2x5IGNoZWNrIHRvIHNlZSBpZiB0aGUgc2VydmVyIHN1cHBvcnRzIFNTTyBpbnN0ZWFkLiBJZiBpdCBkb2VzLCB3ZSdsbCBzZW5kXG4gICAgICAgICAgICAgICAgLy8gdGhlIHVzZXIgb2ZmIHRvIHRoZSBsb2dpbiBwYWdlIHRvIGZpZ3VyZSB0aGVpciBhY2NvdW50IG91dC5cbiAgICAgICAgICAgICAgICBpZiAoc3NvRmxvdykge1xuICAgICAgICAgICAgICAgICAgICAvLyBSZWRpcmVjdCB0byBsb2dpbiBwYWdlIC0gc2VydmVyIHByb2JhYmx5IGV4cGVjdHMgU1NPIG9ubHlcbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiAnc3RhcnRfbG9naW4nIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VydmVyRXJyb3JJc0ZhdGFsOiB0cnVlLCAvLyBmYXRhbCBiZWNhdXNlIHVzZXIgY2Fubm90IGNvbnRpbnVlIG9uIHRoaXMgc2VydmVyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvclRleHQ6IF90KFwiUmVnaXN0cmF0aW9uIGhhcyBiZWVuIGRpc2FibGVkIG9uIHRoaXMgaG9tZXNlcnZlci5cIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGQgZW1wdHkgZmxvd3MgYXJyYXkgdG8gZ2V0IHJpZCBvZiBzcGlubmVyXG4gICAgICAgICAgICAgICAgICAgICAgICBmbG93czogW10sXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmxvZyhcIlVuYWJsZSB0byBxdWVyeSBmb3Igc3VwcG9ydGVkIHJlZ2lzdHJhdGlvbiBtZXRob2RzLlwiLCBlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUZXh0OiBfdChcIlVuYWJsZSB0byBxdWVyeSBmb3Igc3VwcG9ydGVkIHJlZ2lzdHJhdGlvbiBtZXRob2RzLlwiKSxcbiAgICAgICAgICAgICAgICAgICAgLy8gYWRkIGVtcHR5IGZsb3dzIGFycmF5IHRvIGdldCByaWQgb2Ygc3Bpbm5lclxuICAgICAgICAgICAgICAgICAgICBmbG93czogW10sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRm9ybVN1Ym1pdCA9IGFzeW5jIChmb3JtVmFsczogUmVjb3JkPHN0cmluZywgc3RyaW5nPik6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGVycm9yVGV4dDogXCJcIixcbiAgICAgICAgICAgIGJ1c3k6IHRydWUsXG4gICAgICAgICAgICBmb3JtVmFscyxcbiAgICAgICAgICAgIGRvaW5nVUlBdXRoOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSByZXF1ZXN0RW1haWxUb2tlbiA9IChlbWFpbEFkZHJlc3MsIGNsaWVudFNlY3JldCwgc2VuZEF0dGVtcHQsIHNlc3Npb25JZCkgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5tYXRyaXhDbGllbnQucmVxdWVzdFJlZ2lzdGVyRW1haWxUb2tlbihcbiAgICAgICAgICAgIGVtYWlsQWRkcmVzcyxcbiAgICAgICAgICAgIGNsaWVudFNlY3JldCxcbiAgICAgICAgICAgIHNlbmRBdHRlbXB0LFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5tYWtlUmVnaXN0cmF0aW9uVXJsKHtcbiAgICAgICAgICAgICAgICBjbGllbnRfc2VjcmV0OiBjbGllbnRTZWNyZXQsXG4gICAgICAgICAgICAgICAgaHNfdXJsOiB0aGlzLnN0YXRlLm1hdHJpeENsaWVudC5nZXRIb21lc2VydmVyVXJsKCksXG4gICAgICAgICAgICAgICAgaXNfdXJsOiB0aGlzLnN0YXRlLm1hdHJpeENsaWVudC5nZXRJZGVudGl0eVNlcnZlclVybCgpLFxuICAgICAgICAgICAgICAgIHNlc3Npb25faWQ6IHNlc3Npb25JZCxcbiAgICAgICAgICAgIH0pLFxuICAgICAgICApO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVUlBdXRoRmluaXNoZWQ6IEludGVyYWN0aXZlQXV0aENhbGxiYWNrID0gYXN5bmMgKHN1Y2Nlc3MsIHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGRlYnVnbG9nKFwiUmVnaXN0cmF0aW9uOiB1aSBhdXRoZW50aWNhdGlvbiBmaW5pc2hlZDogXCIsIHsgc3VjY2VzcywgcmVzcG9uc2UgfSk7XG4gICAgICAgIGlmICghc3VjY2Vzcykge1xuICAgICAgICAgICAgbGV0IGVycm9yVGV4dDogUmVhY3ROb2RlID0gcmVzcG9uc2UubWVzc2FnZSB8fCByZXNwb25zZS50b1N0cmluZygpO1xuICAgICAgICAgICAgLy8gY2FuIHdlIGdpdmUgYSBiZXR0ZXIgZXJyb3IgbWVzc2FnZT9cbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5lcnJjb2RlID09PSAnTV9SRVNPVVJDRV9MSU1JVF9FWENFRURFRCcpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvclRvcCA9IG1lc3NhZ2VGb3JSZXNvdXJjZUxpbWl0RXJyb3IoXG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLmRhdGEubGltaXRfdHlwZSxcbiAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UuZGF0YS5hZG1pbl9jb250YWN0LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnbW9udGhseV9hY3RpdmVfdXNlcic6IF90ZChcIlRoaXMgaG9tZXNlcnZlciBoYXMgaGl0IGl0cyBNb250aGx5IEFjdGl2ZSBVc2VyIGxpbWl0LlwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdoc19ibG9ja2VkJzogX3RkKFwiVGhpcyBob21lc2VydmVyIGhhcyBiZWVuIGJsb2NrZWQgYnkgaXRzIGFkbWluaXN0cmF0b3IuXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJyc6IF90ZChcIlRoaXMgaG9tZXNlcnZlciBoYXMgZXhjZWVkZWQgb25lIG9mIGl0cyByZXNvdXJjZSBsaW1pdHMuXCIpLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgY29uc3QgZXJyb3JEZXRhaWwgPSBtZXNzYWdlRm9yUmVzb3VyY2VMaW1pdEVycm9yKFxuICAgICAgICAgICAgICAgICAgICByZXNwb25zZS5kYXRhLmxpbWl0X3R5cGUsXG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLmRhdGEuYWRtaW5fY29udGFjdCxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgJyc6IF90ZChcIlBsZWFzZSA8YT5jb250YWN0IHlvdXIgc2VydmljZSBhZG1pbmlzdHJhdG9yPC9hPiB0byBjb250aW51ZSB1c2luZyB0aGlzIHNlcnZpY2UuXCIpLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgZXJyb3JUZXh0ID0gPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPHA+eyBlcnJvclRvcCB9PC9wPlxuICAgICAgICAgICAgICAgICAgICA8cD57IGVycm9yRGV0YWlsIH08L3A+XG4gICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgfSBlbHNlIGlmIChyZXNwb25zZS5yZXF1aXJlZF9zdGFnZXMgJiYgcmVzcG9uc2UucmVxdWlyZWRfc3RhZ2VzLmluY2x1ZGVzKEF1dGhUeXBlLk1zaXNkbikpIHtcbiAgICAgICAgICAgICAgICBsZXQgbXNpc2RuQXZhaWxhYmxlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBmbG93IG9mIHJlc3BvbnNlLmF2YWlsYWJsZV9mbG93cykge1xuICAgICAgICAgICAgICAgICAgICBtc2lzZG5BdmFpbGFibGUgPSBtc2lzZG5BdmFpbGFibGUgfHwgZmxvdy5zdGFnZXMuaW5jbHVkZXMoQXV0aFR5cGUuTXNpc2RuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFtc2lzZG5BdmFpbGFibGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUZXh0ID0gX3QoJ1RoaXMgc2VydmVyIGRvZXMgbm90IHN1cHBvcnQgYXV0aGVudGljYXRpb24gd2l0aCBhIHBob25lIG51bWJlci4nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLmVycmNvZGUgPT09IFwiTV9VU0VSX0lOX1VTRVwiKSB7XG4gICAgICAgICAgICAgICAgZXJyb3JUZXh0ID0gX3QoXCJTb21lb25lIGFscmVhZHkgaGFzIHRoYXQgdXNlcm5hbWUsIHBsZWFzZSB0cnkgYW5vdGhlci5cIik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLmVycmNvZGUgPT09IFwiTV9USFJFRVBJRF9JTl9VU0VcIikge1xuICAgICAgICAgICAgICAgIGVycm9yVGV4dCA9IF90KFwiVGhhdCBlLW1haWwgYWRkcmVzcyBpcyBhbHJlYWR5IGluIHVzZS5cIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRvaW5nVUlBdXRoOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvclRleHQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5zZXRKdXN0UmVnaXN0ZXJlZFVzZXJJZChyZXNwb25zZS51c2VyX2lkKTtcblxuICAgICAgICBjb25zdCBuZXdTdGF0ZSA9IHtcbiAgICAgICAgICAgIGRvaW5nVUlBdXRoOiBmYWxzZSxcbiAgICAgICAgICAgIHJlZ2lzdGVyZWRVc2VybmFtZTogcmVzcG9uc2UudXNlcl9pZCxcbiAgICAgICAgICAgIGRpZmZlcmVudExvZ2dlZEluVXNlcklkOiBudWxsLFxuICAgICAgICAgICAgY29tcGxldGVkTm9TaWduaW46IGZhbHNlLFxuICAgICAgICAgICAgLy8gd2UncmUgc3RpbGwgYnVzeSB1bnRpbCB3ZSBnZXQgdW5tb3VudGVkOiBkb24ndCBzaG93IHRoZSByZWdpc3RyYXRpb24gZm9ybSBhZ2FpblxuICAgICAgICAgICAgYnVzeTogdHJ1ZSxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBUaGUgdXNlciBjYW1lIGluIHRocm91Z2ggYW4gZW1haWwgdmFsaWRhdGlvbiBsaW5rLiBUbyBhdm9pZCBvdmVyd3JpdGluZ1xuICAgICAgICAvLyB0aGVpciBzZXNzaW9uLCBjaGVjayB0byBtYWtlIHN1cmUgdGhlIHNlc3Npb24gaXNuJ3Qgc29tZW9uZSBlbHNlLCBhbmRcbiAgICAgICAgLy8gaXNuJ3QgYSBndWVzdCB1c2VyIHNpbmNlIHdlJ2xsIHVzdWFsbHkgaGF2ZSBzZXQgYSBndWVzdCB1c2VyIHNlc3Npb24gYmVmb3JlXG4gICAgICAgIC8vIHN0YXJ0aW5nIHRoZSByZWdpc3RyYXRpb24gcHJvY2Vzcy4gVGhpcyBpc24ndCBwZXJmZWN0IHNpbmNlIGl0J3MgcG9zc2libGVcbiAgICAgICAgLy8gdGhlIHVzZXIgaGFkIGEgc2VwYXJhdGUgZ3Vlc3Qgc2Vzc2lvbiB0aGV5IGRpZG4ndCBhY3R1YWxseSBtZWFuIHRvIHJlcGxhY2UuXG4gICAgICAgIGNvbnN0IFtzZXNzaW9uT3duZXIsIHNlc3Npb25Jc0d1ZXN0XSA9IGF3YWl0IExpZmVjeWNsZS5nZXRTdG9yZWRTZXNzaW9uT3duZXIoKTtcbiAgICAgICAgaWYgKHNlc3Npb25Pd25lciAmJiAhc2Vzc2lvbklzR3Vlc3QgJiYgc2Vzc2lvbk93bmVyICE9PSByZXNwb25zZS51c2VyX2lkKSB7XG4gICAgICAgICAgICBsb2dnZXIubG9nKFxuICAgICAgICAgICAgICAgIGBGb3VuZCBhIHNlc3Npb24gZm9yICR7c2Vzc2lvbk93bmVyfSBidXQgJHtyZXNwb25zZS51c2VyX2lkfSBoYXMganVzdCByZWdpc3RlcmVkLmAsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgbmV3U3RhdGUuZGlmZmVyZW50TG9nZ2VkSW5Vc2VySWQgPSBzZXNzaW9uT3duZXI7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiB3ZSBkb24ndCBoYXZlIGFuIGVtYWlsIGF0IGFsbCwgb25seSBvbmUgY2xpZW50IGNhbiBiZSBpbnZvbHZlZCBpbiB0aGlzIGZsb3csIGFuZCB3ZSBjYW4gZGlyZWN0bHkgbG9nIGluLlxuICAgICAgICAvL1xuICAgICAgICAvLyBpZiB3ZSd2ZSBnb3QgYW4gZW1haWwsIGl0IG5lZWRzIHRvIGJlIHZlcmlmaWVkLiBpbiB0aGF0IGNhc2UsIHR3byBjbGllbnRzIGNhbiBiZSBpbnZvbHZlZCBpbiB0aGlzIGZsb3csIHRoZVxuICAgICAgICAvLyBvcmlnaW5hbCBjbGllbnQgc3RhcnRpbmcgdGhlIHByb2Nlc3MgYW5kIHRoZSBjbGllbnQgdGhhdCBzdWJtaXR0ZWQgdGhlIHZlcmlmaWNhdGlvbiB0b2tlbi4gQWZ0ZXIgdGhlIHRva2VuXG4gICAgICAgIC8vIGhhcyBiZWVuIHN1Ym1pdHRlZCwgaXQgY2FuIG5vdCBiZSB1c2VkIGFnYWluLlxuICAgICAgICAvL1xuICAgICAgICAvLyB3ZSBjYW4gZGlzdGluZ3Vpc2ggdGhlbSBiYXNlZCBvbiB3aGV0aGVyIHRoZSBjbGllbnQgaGFzIGZvcm0gdmFsdWVzIHNhdmVkIChpZiBzbywgaXQncyB0aGUgb25lIHRoYXQgc3RhcnRlZFxuICAgICAgICAvLyB0aGUgcmVnaXN0cmF0aW9uKSwgb3Igd2hldGhlciBpdCBkb2Vzbid0IGhhdmUgYW55IGZvcm0gdmFsdWVzIHNhdmVkIChpbiB3aGljaCBjYXNlIGl0J3MgdGhlIGNsaWVudCB0aGF0XG4gICAgICAgIC8vIHZlcmlmaWVkIHRoZSBlbWFpbCBhZGRyZXNzKVxuICAgICAgICAvL1xuICAgICAgICAvLyBhcyB0aGUgY2xpZW50IHRoYXQgc3RhcnRlZCByZWdpc3RyYXRpb24gbWF5IGJlIGdvbmUgYnkgdGhlIHRpbWUgd2UndmUgdmVyaWZpZWQgdGhlIGVtYWlsLCBhbmQgb25seSB0aGUgY2xpZW50XG4gICAgICAgIC8vIHRoYXQgdmVyaWZpZWQgdGhlIGVtYWlsIGlzIGd1YXJhbnRlZWQgdG8gZXhpc3QsIHdlJ2xsIGFsd2F5cyBkbyB0aGUgbG9naW4gaW4gdGhhdCBjbGllbnQuXG4gICAgICAgIGNvbnN0IGhhc0VtYWlsID0gQm9vbGVhbih0aGlzLnN0YXRlLmZvcm1WYWxzLmVtYWlsKTtcbiAgICAgICAgY29uc3QgaGFzQWNjZXNzVG9rZW4gPSBCb29sZWFuKHJlc3BvbnNlLmFjY2Vzc190b2tlbik7XG4gICAgICAgIGRlYnVnbG9nKFwiUmVnaXN0cmF0aW9uOiB1aSBhdXRoIGZpbmlzaGVkOlwiLCB7IGhhc0VtYWlsLCBoYXNBY2Nlc3NUb2tlbiB9KTtcbiAgICAgICAgLy8gZG9u4oCZdCBsb2cgaW4gaWYgd2UgZm91bmQgYSBzZXNzaW9uIGZvciBhIGRpZmZlcmVudCB1c2VyXG4gICAgICAgIGlmICghaGFzRW1haWwgJiYgaGFzQWNjZXNzVG9rZW4gJiYgIW5ld1N0YXRlLmRpZmZlcmVudExvZ2dlZEluVXNlcklkKSB7XG4gICAgICAgICAgICAvLyB3ZSdsbCBvbmx5IHRyeSBsb2dnaW5nIGluIGlmIHdlIGVpdGhlciBoYXZlIG5vIGVtYWlsIHRvIHZlcmlmeSBhdCBhbGwgb3Igd2UncmUgdGhlIGNsaWVudCB0aGF0IHZlcmlmaWVkXG4gICAgICAgICAgICAvLyB0aGUgZW1haWwsIG5vdCB0aGUgY2xpZW50IHRoYXQgc3RhcnRlZCB0aGUgcmVnaXN0cmF0aW9uIGZsb3dcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucHJvcHMub25Mb2dnZWRJbih7XG4gICAgICAgICAgICAgICAgdXNlcklkOiByZXNwb25zZS51c2VyX2lkLFxuICAgICAgICAgICAgICAgIGRldmljZUlkOiByZXNwb25zZS5kZXZpY2VfaWQsXG4gICAgICAgICAgICAgICAgaG9tZXNlcnZlclVybDogdGhpcy5zdGF0ZS5tYXRyaXhDbGllbnQuZ2V0SG9tZXNlcnZlclVybCgpLFxuICAgICAgICAgICAgICAgIGlkZW50aXR5U2VydmVyVXJsOiB0aGlzLnN0YXRlLm1hdHJpeENsaWVudC5nZXRJZGVudGl0eVNlcnZlclVybCgpLFxuICAgICAgICAgICAgICAgIGFjY2Vzc1Rva2VuOiByZXNwb25zZS5hY2Nlc3NfdG9rZW4sXG4gICAgICAgICAgICB9LCB0aGlzLnN0YXRlLmZvcm1WYWxzLnBhc3N3b3JkKTtcblxuICAgICAgICAgICAgdGhpcy5zZXR1cFB1c2hlcnMoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5ld1N0YXRlLmJ1c3kgPSBmYWxzZTtcbiAgICAgICAgICAgIG5ld1N0YXRlLmNvbXBsZXRlZE5vU2lnbmluID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUobmV3U3RhdGUpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHNldHVwUHVzaGVycygpIHtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLmJyYW5kKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWF0cml4Q2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICByZXR1cm4gbWF0cml4Q2xpZW50LmdldFB1c2hlcnMoKS50aGVuKChyZXNwKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwdXNoZXJzID0gcmVzcC5wdXNoZXJzO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwdXNoZXJzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHB1c2hlcnNbaV0ua2luZCA9PT0gJ2VtYWlsJykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbWFpbFB1c2hlciA9IHB1c2hlcnNbaV07XG4gICAgICAgICAgICAgICAgICAgIGVtYWlsUHVzaGVyLmRhdGEgPSB7IGJyYW5kOiB0aGlzLnByb3BzLmJyYW5kIH07XG4gICAgICAgICAgICAgICAgICAgIG1hdHJpeENsaWVudC5zZXRQdXNoZXIoZW1haWxQdXNoZXIpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmxvZyhcIlNldCBlbWFpbCBicmFuZGluZyB0byBcIiArIHRoaXMucHJvcHMuYnJhbmQpO1xuICAgICAgICAgICAgICAgICAgICB9LCAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkNvdWxkbid0IHNldCBlbWFpbCBicmFuZGluZzogXCIgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgKGVycm9yKSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJDb3VsZG4ndCBnZXQgcHVzaGVyczogXCIgKyBlcnJvcik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25Mb2dpbkNsaWNrID0gZXYgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkxvZ2luQ2xpY2soKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkdvVG9Gb3JtQ2xpY2tlZCA9IGV2ID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXMucmVwbGFjZUNsaWVudCh0aGlzLnByb3BzLnNlcnZlckNvbmZpZyk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICBkb2luZ1VJQXV0aDogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG1ha2VSZWdpc3RlclJlcXVlc3QgPSBhdXRoID0+IHtcbiAgICAgICAgY29uc3QgcmVnaXN0ZXJQYXJhbXMgPSB7XG4gICAgICAgICAgICB1c2VybmFtZTogdGhpcy5zdGF0ZS5mb3JtVmFscy51c2VybmFtZSxcbiAgICAgICAgICAgIHBhc3N3b3JkOiB0aGlzLnN0YXRlLmZvcm1WYWxzLnBhc3N3b3JkLFxuICAgICAgICAgICAgaW5pdGlhbF9kZXZpY2VfZGlzcGxheV9uYW1lOiB0aGlzLnByb3BzLmRlZmF1bHREZXZpY2VEaXNwbGF5TmFtZSxcbiAgICAgICAgICAgIGF1dGg6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIC8vIHdlIHN0aWxsIHdhbnQgdG8gYXZvaWQgdGhlIHJhY2UgY29uZGl0aW9ucyBpbnZvbHZlZCB3aXRoIG11bHRpcGxlIGNsaWVudHMgaGFuZGxpbmcgcmVnaXN0cmF0aW9uLCBidXRcbiAgICAgICAgICAgIC8vIHdlJ2xsIGhhbmRsZSB0aGVzZSBhZnRlciB3ZSd2ZSByZWNlaXZlZCB0aGUgYWNjZXNzX3Rva2VuIGluIG9uVUlBdXRoRmluaXNoZWRcbiAgICAgICAgICAgIGluaGliaXRfbG9naW46IHVuZGVmaW5lZCxcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKGF1dGgpIHJlZ2lzdGVyUGFyYW1zLmF1dGggPSBhdXRoO1xuICAgICAgICBkZWJ1Z2xvZyhcIlJlZ2lzdHJhdGlvbjogc2VuZGluZyByZWdpc3RyYXRpb24gcmVxdWVzdDpcIiwgYXV0aCk7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLm1hdHJpeENsaWVudC5yZWdpc3RlclJlcXVlc3QocmVnaXN0ZXJQYXJhbXMpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGdldFVJQXV0aElucHV0cygpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVtYWlsQWRkcmVzczogdGhpcy5zdGF0ZS5mb3JtVmFscy5lbWFpbCxcbiAgICAgICAgICAgIHBob25lQ291bnRyeTogdGhpcy5zdGF0ZS5mb3JtVmFscy5waG9uZUNvdW50cnksXG4gICAgICAgICAgICBwaG9uZU51bWJlcjogdGhpcy5zdGF0ZS5mb3JtVmFscy5waG9uZU51bWJlcixcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBMaW5rcyB0byB0aGUgbG9naW4gcGFnZSBzaG93biBhZnRlciByZWdpc3RyYXRpb24gaXMgY29tcGxldGVkIGFyZSByb3V0ZWQgdGhyb3VnaCB0aGlzXG4gICAgLy8gd2hpY2ggY2hlY2tzIHRoZSB1c2VyIGhhc24ndCBhbHJlYWR5IGxvZ2dlZCBpbiBzb21ld2hlcmUgZWxzZSAocGVyaGFwcyB3ZSBzaG91bGQgZG9cbiAgICAvLyB0aGlzIG1vcmUgZ2VuZXJhbGx5PylcbiAgICBwcml2YXRlIG9uTG9naW5DbGlja1dpdGhDaGVjayA9IGFzeW5jIGV2ID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBjb25zdCBzZXNzaW9uTG9hZGVkID0gYXdhaXQgTGlmZWN5Y2xlLmxvYWRTZXNzaW9uKHsgaWdub3JlR3Vlc3Q6IHRydWUgfSk7XG4gICAgICAgIGlmICghc2Vzc2lvbkxvYWRlZCkge1xuICAgICAgICAgICAgLy8gb2sgZmluZSwgdGhlcmUncyBzdGlsbCBubyBzZXNzaW9uOiByZWFsbHkgZ28gdG8gdGhlIGxvZ2luIHBhZ2VcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25Mb2dpbkNsaWNrKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2Vzc2lvbkxvYWRlZDtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSByZW5kZXJSZWdpc3RlckNvbXBvbmVudCgpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUubWF0cml4Q2xpZW50ICYmIHRoaXMuc3RhdGUuZG9pbmdVSUF1dGgpIHtcbiAgICAgICAgICAgIHJldHVybiA8SW50ZXJhY3RpdmVBdXRoXG4gICAgICAgICAgICAgICAgbWF0cml4Q2xpZW50PXt0aGlzLnN0YXRlLm1hdHJpeENsaWVudH1cbiAgICAgICAgICAgICAgICBtYWtlUmVxdWVzdD17dGhpcy5tYWtlUmVnaXN0ZXJSZXF1ZXN0fVxuICAgICAgICAgICAgICAgIG9uQXV0aEZpbmlzaGVkPXt0aGlzLm9uVUlBdXRoRmluaXNoZWR9XG4gICAgICAgICAgICAgICAgaW5wdXRzPXt0aGlzLmdldFVJQXV0aElucHV0cygpfVxuICAgICAgICAgICAgICAgIHJlcXVlc3RFbWFpbFRva2VuPXt0aGlzLnJlcXVlc3RFbWFpbFRva2VufVxuICAgICAgICAgICAgICAgIHNlc3Npb25JZD17dGhpcy5wcm9wcy5zZXNzaW9uSWR9XG4gICAgICAgICAgICAgICAgY2xpZW50U2VjcmV0PXt0aGlzLnByb3BzLmNsaWVudFNlY3JldH1cbiAgICAgICAgICAgICAgICBlbWFpbFNpZD17dGhpcy5wcm9wcy5pZFNpZH1cbiAgICAgICAgICAgICAgICBwb2xsPXt0cnVlfVxuICAgICAgICAgICAgLz47XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuc3RhdGUubWF0cml4Q2xpZW50ICYmICF0aGlzLnN0YXRlLmJ1c3kpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuYnVzeSB8fCAhdGhpcy5zdGF0ZS5mbG93cykge1xuICAgICAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfQXV0aEJvZHlfc3Bpbm5lclwiPlxuICAgICAgICAgICAgICAgIDxTcGlubmVyIC8+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5mbG93cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGxldCBzc29TZWN0aW9uO1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuc3NvRmxvdykge1xuICAgICAgICAgICAgICAgIGxldCBjb250aW51ZVdpdGhTZWN0aW9uO1xuICAgICAgICAgICAgICAgIGNvbnN0IHByb3ZpZGVycyA9IHRoaXMuc3RhdGUuc3NvRmxvdy5pZGVudGl0eV9wcm92aWRlcnMgfHwgW107XG4gICAgICAgICAgICAgICAgLy8gd2hlbiB0aGVyZSBpcyBvbmx5IGEgc2luZ2xlIChvciAwKSBwcm92aWRlcnMgd2Ugc2hvdyBhIHdpZGUgYnV0dG9uIHdpdGggYENvbnRpbnVlIHdpdGggWGAgdGV4dFxuICAgICAgICAgICAgICAgIGlmIChwcm92aWRlcnMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBpMThuOiBzc29CdXR0b25zIGlzIGEgcGxhY2Vob2xkZXIgdG8gaGVscCB0cmFuc2xhdG9ycyB1bmRlcnN0YW5kIGNvbnRleHRcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVXaXRoU2VjdGlvbiA9IDxoMiBjbGFzc05hbWU9XCJteF9BdXRoQm9keV9jZW50ZXJlZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkNvbnRpbnVlIHdpdGggJShzc29CdXR0b25zKXNcIiwgeyBzc29CdXR0b25zOiBcIlwiIH0pLnRyaW0oKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvaDI+O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIGkxOG46IHNzb0J1dHRvbnMgJiB1c2VybmFtZVBhc3N3b3JkIGFyZSBwbGFjZWhvbGRlcnMgdG8gaGVscCB0cmFuc2xhdG9ycyB1bmRlcnN0YW5kIGNvbnRleHRcbiAgICAgICAgICAgICAgICBzc29TZWN0aW9uID0gPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgICAgICAgICB7IGNvbnRpbnVlV2l0aFNlY3Rpb24gfVxuICAgICAgICAgICAgICAgICAgICA8U1NPQnV0dG9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgbWF0cml4Q2xpZW50PXt0aGlzLmxvZ2luTG9naWMuY3JlYXRlVGVtcG9yYXJ5Q2xpZW50KCl9XG4gICAgICAgICAgICAgICAgICAgICAgICBmbG93PXt0aGlzLnN0YXRlLnNzb0Zsb3d9XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dpblR5cGU9e3RoaXMuc3RhdGUuc3NvRmxvdy50eXBlID09PSBcIm0ubG9naW4uc3NvXCIgPyBcInNzb1wiIDogXCJjYXNcIn1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYWdtZW50QWZ0ZXJMb2dpbj17dGhpcy5wcm9wcy5mcmFnbWVudEFmdGVyTG9naW59XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJteF9BdXRoQm9keV9jZW50ZXJlZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiUoc3NvQnV0dG9ucylzIE9yICUodXNlcm5hbWVQYXNzd29yZClzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzc29CdXR0b25zOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VybmFtZVBhc3N3b3JkOiBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICApLnRyaW0oKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvaDI+XG4gICAgICAgICAgICAgICAgPC9SZWFjdC5GcmFnbWVudD47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgeyBzc29TZWN0aW9uIH1cbiAgICAgICAgICAgICAgICA8UmVnaXN0cmF0aW9uRm9ybVxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0VXNlcm5hbWU9e3RoaXMuc3RhdGUuZm9ybVZhbHMudXNlcm5hbWV9XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHRFbWFpbD17dGhpcy5zdGF0ZS5mb3JtVmFscy5lbWFpbH1cbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdFBob25lQ291bnRyeT17dGhpcy5zdGF0ZS5mb3JtVmFscy5waG9uZUNvdW50cnl9XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHRQaG9uZU51bWJlcj17dGhpcy5zdGF0ZS5mb3JtVmFscy5waG9uZU51bWJlcn1cbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdFBhc3N3b3JkPXt0aGlzLnN0YXRlLmZvcm1WYWxzLnBhc3N3b3JkfVxuICAgICAgICAgICAgICAgICAgICBvblJlZ2lzdGVyQ2xpY2s9e3RoaXMub25Gb3JtU3VibWl0fVxuICAgICAgICAgICAgICAgICAgICBmbG93cz17dGhpcy5zdGF0ZS5mbG93c31cbiAgICAgICAgICAgICAgICAgICAgc2VydmVyQ29uZmlnPXt0aGlzLnByb3BzLnNlcnZlckNvbmZpZ31cbiAgICAgICAgICAgICAgICAgICAgY2FuU3VibWl0PXshdGhpcy5zdGF0ZS5zZXJ2ZXJFcnJvcklzRmF0YWx9XG4gICAgICAgICAgICAgICAgICAgIG1hdHJpeENsaWVudD17dGhpcy5zdGF0ZS5tYXRyaXhDbGllbnR9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgZXJyb3JUZXh0O1xuICAgICAgICBjb25zdCBlcnIgPSB0aGlzLnN0YXRlLmVycm9yVGV4dDtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgZXJyb3JUZXh0ID0gPGRpdiBjbGFzc05hbWU9XCJteF9Mb2dpbl9lcnJvclwiPnsgZXJyIH08L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc2VydmVyRGVhZFNlY3Rpb247XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5zZXJ2ZXJJc0FsaXZlKSB7XG4gICAgICAgICAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICAgICAgXCJteF9Mb2dpbl9lcnJvclwiOiB0cnVlLFxuICAgICAgICAgICAgICAgIFwibXhfTG9naW5fc2VydmVyRXJyb3JcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBcIm14X0xvZ2luX3NlcnZlckVycm9yTm9uRmF0YWxcIjogIXRoaXMuc3RhdGUuc2VydmVyRXJyb3JJc0ZhdGFsLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzZXJ2ZXJEZWFkU2VjdGlvbiA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3Nlc30+XG4gICAgICAgICAgICAgICAgICAgIHsgdGhpcy5zdGF0ZS5zZXJ2ZXJEZWFkRXJyb3IgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNpZ25JbiA9IDxzcGFuIGNsYXNzTmFtZT1cIm14X0F1dGhCb2R5X2NoYW5nZUZsb3dcIj5cbiAgICAgICAgICAgIHsgX3QoXCJBbHJlYWR5IGhhdmUgYW4gYWNjb3VudD8gPGE+U2lnbiBpbiBoZXJlPC9hPlwiLCB7fSwge1xuICAgICAgICAgICAgICAgIGE6IHN1YiA9PiA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPSdsaW5rX2lubGluZScgb25DbGljaz17dGhpcy5vbkxvZ2luQ2xpY2t9Pnsgc3ViIH08L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgfSkgfVxuICAgICAgICA8L3NwYW4+O1xuXG4gICAgICAgIC8vIE9ubHkgc2hvdyB0aGUgJ2dvIGJhY2snIGJ1dHRvbiBpZiB5b3UncmUgbm90IGxvb2tpbmcgYXQgdGhlIGZvcm1cbiAgICAgICAgbGV0IGdvQmFjaztcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZG9pbmdVSUF1dGgpIHtcbiAgICAgICAgICAgIGdvQmFjayA9IDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAga2luZD0nbGluaydcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9BdXRoQm9keV9jaGFuZ2VGbG93XCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uR29Ub0Zvcm1DbGlja2VkfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgX3QoJ0dvIGJhY2snKSB9XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGJvZHk7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmNvbXBsZXRlZE5vU2lnbmluKSB7XG4gICAgICAgICAgICBsZXQgcmVnRG9uZVRleHQ7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5kaWZmZXJlbnRMb2dnZWRJblVzZXJJZCkge1xuICAgICAgICAgICAgICAgIHJlZ0RvbmVUZXh0ID0gPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPHA+eyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiWW91ciBuZXcgYWNjb3VudCAoJShuZXdBY2NvdW50SWQpcykgaXMgcmVnaXN0ZXJlZCwgYnV0IHlvdSdyZSBhbHJlYWR5IFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibG9nZ2VkIGludG8gYSBkaWZmZXJlbnQgYWNjb3VudCAoJShsb2dnZWRJblVzZXJJZClzKS5cIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0FjY291bnRJZDogdGhpcy5zdGF0ZS5yZWdpc3RlcmVkVXNlcm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VkSW5Vc2VySWQ6IHRoaXMuc3RhdGUuZGlmZmVyZW50TG9nZ2VkSW5Vc2VySWQsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICApIH08L3A+XG4gICAgICAgICAgICAgICAgICAgIDxwPjxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBraW5kPVwibGlua19pbmxpbmVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17YXN5bmMgZXZlbnQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlc3Npb25Mb2FkZWQgPSBhd2FpdCB0aGlzLm9uTG9naW5DbGlja1dpdGhDaGVjayhldmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlc3Npb25Mb2FkZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiBcInZpZXdfd2VsY29tZV9wYWdlXCIgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkNvbnRpbnVlIHdpdGggcHJldmlvdXMgYWNjb3VudFwiKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj48L3A+XG4gICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyByZWdhcmRsZXNzIG9mIHdoZXRoZXIgd2UncmUgdGhlIGNsaWVudCB0aGF0IHN0YXJ0ZWQgdGhlIHJlZ2lzdHJhdGlvbiBvciBub3QsIHdlIHNob3VsZFxuICAgICAgICAgICAgICAgIC8vIHRyeSBvdXIgY3JlZGVudGlhbHMgYW55d2F5XG4gICAgICAgICAgICAgICAgcmVnRG9uZVRleHQgPSA8aDI+eyBfdChcbiAgICAgICAgICAgICAgICAgICAgXCI8YT5Mb2cgaW48L2E+IHRvIHlvdXIgbmV3IGFjY291bnQuXCIsIHt9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhOiAoc3ViKSA9PiA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJsaW5rX2lubGluZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17YXN5bmMgZXZlbnQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZXNzaW9uTG9hZGVkID0gYXdhaXQgdGhpcy5vbkxvZ2luQ2xpY2tXaXRoQ2hlY2soZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2Vzc2lvbkxvYWRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiBcInZpZXdfaG9tZV9wYWdlXCIgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgPnsgc3ViIH08L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICkgfTwvaDI+O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYm9keSA9IDxkaXY+XG4gICAgICAgICAgICAgICAgPGgxPnsgX3QoXCJSZWdpc3RyYXRpb24gU3VjY2Vzc2Z1bFwiKSB9PC9oMT5cbiAgICAgICAgICAgICAgICB7IHJlZ0RvbmVUZXh0IH1cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJvZHkgPSA8RnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9SZWdpc3Rlcl9tYWluQ29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgICA8QXV0aEhlYWRlckRpc3BsYXlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXtfdCgnQ3JlYXRlIGFjY291bnQnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZlclBpY2tlcj17PFNlcnZlclBpY2tlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIkhvc3QgYWNjb3VudCBvblwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWFsb2dUaXRsZT17X3QoXCJEZWNpZGUgd2hlcmUgeW91ciBhY2NvdW50IGlzIGhvc3RlZFwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXJ2ZXJDb25maWc9e3RoaXMucHJvcHMuc2VydmVyQ29uZmlnfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uU2VydmVyQ29uZmlnQ2hhbmdlPXt0aGlzLnN0YXRlLmRvaW5nVUlBdXRoID8gdW5kZWZpbmVkIDogdGhpcy5wcm9wcy5vblNlcnZlckNvbmZpZ0NoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+fVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGVycm9yVGV4dCB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHNlcnZlckRlYWRTZWN0aW9uIH1cbiAgICAgICAgICAgICAgICAgICAgPC9BdXRoSGVhZGVyRGlzcGxheT5cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnJlbmRlclJlZ2lzdGVyQ29tcG9uZW50KCkgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUmVnaXN0ZXJfZm9vdGVyQWN0aW9uc1wiPlxuICAgICAgICAgICAgICAgICAgICB7IGdvQmFjayB9XG4gICAgICAgICAgICAgICAgICAgIHsgc2lnbkluIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvRnJhZ21lbnQ+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxBdXRoUGFnZT5cbiAgICAgICAgICAgICAgICA8QXV0aEhlYWRlciAvPlxuICAgICAgICAgICAgICAgIDxBdXRoSGVhZGVyUHJvdmlkZXI+XG4gICAgICAgICAgICAgICAgICAgIDxBdXRoQm9keSBmbGV4PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBib2R5IH1cbiAgICAgICAgICAgICAgICAgICAgPC9BdXRoQm9keT5cbiAgICAgICAgICAgICAgICA8L0F1dGhIZWFkZXJQcm92aWRlcj5cbiAgICAgICAgICAgIDwvQXV0aFBhZ2U+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7OztBQUdBLE1BQU1BLFFBQVEsR0FBRyxZQUFvQjtFQUNqQyxJQUFJQyxzQkFBQSxDQUFjQyxRQUFkLENBQXVCLG9CQUF2QixDQUFKLEVBQWtEO0lBQUEsa0NBRGpDQyxJQUNpQztNQURqQ0EsSUFDaUM7SUFBQTs7SUFDOUNDLGNBQUEsQ0FBT0MsR0FBUCxDQUFXQyxJQUFYLENBQWdCQyxPQUFoQixFQUF5Qix3QkFBekIsRUFBbUQsR0FBR0osSUFBdEQ7RUFDSDtBQUNKLENBSkQ7O0FBOEVlLE1BQU1LLFlBQU4sU0FBMkJDLGNBQUEsQ0FBTUMsU0FBakMsQ0FBMkQ7RUFFdEU7RUFHQUMsV0FBVyxDQUFDQyxLQUFELEVBQVE7SUFDZixNQUFNQSxLQUFOO0lBRGU7SUFBQTtJQUFBLHNEQWlDT0MsS0FBRCxJQUE4QjtNQUNuRCxJQUFJLEtBQUtDLEtBQUwsQ0FBV0MsV0FBZixFQUE0QjtRQUN4QkYsS0FBSyxDQUFDRyxjQUFOO1FBQ0FILEtBQUssQ0FBQ0ksV0FBTixHQUFvQixFQUFwQjtRQUNBLE9BQU8sRUFBUDtNQUNIO0lBQ0osQ0F2Q2tCO0lBQUEsb0RBb0pJLE1BQU9DLFFBQVAsSUFBMkQ7TUFDOUUsS0FBS0MsUUFBTCxDQUFjO1FBQ1ZDLFNBQVMsRUFBRSxFQUREO1FBRVZDLElBQUksRUFBRSxJQUZJO1FBR1ZILFFBSFU7UUFJVkgsV0FBVyxFQUFFO01BSkgsQ0FBZDtJQU1ILENBM0prQjtJQUFBLHlEQTZKUyxDQUFDTyxZQUFELEVBQWVDLFlBQWYsRUFBNkJDLFdBQTdCLEVBQTBDQyxTQUExQyxLQUF3RDtNQUNoRixPQUFPLEtBQUtYLEtBQUwsQ0FBV1ksWUFBWCxDQUF3QkMseUJBQXhCLENBQ0hMLFlBREcsRUFFSEMsWUFGRyxFQUdIQyxXQUhHLEVBSUgsS0FBS1osS0FBTCxDQUFXZ0IsbUJBQVgsQ0FBK0I7UUFDM0JDLGFBQWEsRUFBRU4sWUFEWTtRQUUzQk8sTUFBTSxFQUFFLEtBQUtoQixLQUFMLENBQVdZLFlBQVgsQ0FBd0JLLGdCQUF4QixFQUZtQjtRQUczQkMsTUFBTSxFQUFFLEtBQUtsQixLQUFMLENBQVdZLFlBQVgsQ0FBd0JPLG9CQUF4QixFQUhtQjtRQUkzQkMsVUFBVSxFQUFFVDtNQUplLENBQS9CLENBSkcsQ0FBUDtJQVdILENBektrQjtJQUFBLHdEQTJLaUMsT0FBT1UsT0FBUCxFQUFnQkMsUUFBaEIsS0FBNkI7TUFDN0VwQyxRQUFRLENBQUMsNENBQUQsRUFBK0M7UUFBRW1DLE9BQUY7UUFBV0M7TUFBWCxDQUEvQyxDQUFSOztNQUNBLElBQUksQ0FBQ0QsT0FBTCxFQUFjO1FBQ1YsSUFBSWYsU0FBb0IsR0FBR2dCLFFBQVEsQ0FBQ0MsT0FBVCxJQUFvQkQsUUFBUSxDQUFDRSxRQUFULEVBQS9DLENBRFUsQ0FFVjs7UUFDQSxJQUFJRixRQUFRLENBQUNHLE9BQVQsS0FBcUIsMkJBQXpCLEVBQXNEO1VBQ2xELE1BQU1DLFFBQVEsR0FBRyxJQUFBQyx3Q0FBQSxFQUNiTCxRQUFRLENBQUNNLElBQVQsQ0FBY0MsVUFERCxFQUViUCxRQUFRLENBQUNNLElBQVQsQ0FBY0UsYUFGRCxFQUdiO1lBQ0ksdUJBQXVCLElBQUFDLG9CQUFBLEVBQUksd0RBQUosQ0FEM0I7WUFFSSxjQUFjLElBQUFBLG9CQUFBLEVBQUksd0RBQUosQ0FGbEI7WUFHSSxJQUFJLElBQUFBLG9CQUFBLEVBQUksMERBQUo7VUFIUixDQUhhLENBQWpCO1VBU0EsTUFBTUMsV0FBVyxHQUFHLElBQUFMLHdDQUFBLEVBQ2hCTCxRQUFRLENBQUNNLElBQVQsQ0FBY0MsVUFERSxFQUVoQlAsUUFBUSxDQUFDTSxJQUFULENBQWNFLGFBRkUsRUFHaEI7WUFDSSxJQUFJLElBQUFDLG9CQUFBLEVBQUksa0ZBQUo7VUFEUixDQUhnQixDQUFwQjtVQU9BekIsU0FBUyxnQkFBRyx1REFDUix3Q0FBS29CLFFBQUwsQ0FEUSxlQUVSLHdDQUFLTSxXQUFMLENBRlEsQ0FBWjtRQUlILENBckJELE1BcUJPLElBQUlWLFFBQVEsQ0FBQ1csZUFBVCxJQUE0QlgsUUFBUSxDQUFDVyxlQUFULENBQXlCQyxRQUF6QixDQUFrQ0MsZ0JBQUEsQ0FBU0MsTUFBM0MsQ0FBaEMsRUFBb0Y7VUFDdkYsSUFBSUMsZUFBZSxHQUFHLEtBQXRCOztVQUNBLEtBQUssTUFBTUMsSUFBWCxJQUFtQmhCLFFBQVEsQ0FBQ2lCLGVBQTVCLEVBQTZDO1lBQ3pDRixlQUFlLEdBQUdBLGVBQWUsSUFBSUMsSUFBSSxDQUFDRSxNQUFMLENBQVlOLFFBQVosQ0FBcUJDLGdCQUFBLENBQVNDLE1BQTlCLENBQXJDO1VBQ0g7O1VBQ0QsSUFBSSxDQUFDQyxlQUFMLEVBQXNCO1lBQ2xCL0IsU0FBUyxHQUFHLElBQUFtQyxtQkFBQSxFQUFHLGtFQUFILENBQVo7VUFDSDtRQUNKLENBUk0sTUFRQSxJQUFJbkIsUUFBUSxDQUFDRyxPQUFULEtBQXFCLGVBQXpCLEVBQTBDO1VBQzdDbkIsU0FBUyxHQUFHLElBQUFtQyxtQkFBQSxFQUFHLHdEQUFILENBQVo7UUFDSCxDQUZNLE1BRUEsSUFBSW5CLFFBQVEsQ0FBQ0csT0FBVCxLQUFxQixtQkFBekIsRUFBOEM7VUFDakRuQixTQUFTLEdBQUcsSUFBQW1DLG1CQUFBLEVBQUcsd0NBQUgsQ0FBWjtRQUNIOztRQUVELEtBQUtwQyxRQUFMLENBQWM7VUFDVkUsSUFBSSxFQUFFLEtBREk7VUFFVk4sV0FBVyxFQUFFLEtBRkg7VUFHVks7UUFIVSxDQUFkO1FBS0E7TUFDSDs7TUFFRG9DLGdDQUFBLENBQWdCQyx1QkFBaEIsQ0FBd0NyQixRQUFRLENBQUNzQixPQUFqRDs7TUFFQSxNQUFNQyxRQUFRLEdBQUc7UUFDYjVDLFdBQVcsRUFBRSxLQURBO1FBRWI2QyxrQkFBa0IsRUFBRXhCLFFBQVEsQ0FBQ3NCLE9BRmhCO1FBR2JHLHVCQUF1QixFQUFFLElBSFo7UUFJYkMsaUJBQWlCLEVBQUUsS0FKTjtRQUtiO1FBQ0F6QyxJQUFJLEVBQUU7TUFOTyxDQUFqQixDQWxENkUsQ0EyRDdFO01BQ0E7TUFDQTtNQUNBO01BQ0E7O01BQ0EsTUFBTSxDQUFDMEMsWUFBRCxFQUFlQyxjQUFmLElBQWlDLE1BQU1DLFNBQVMsQ0FBQ0MscUJBQVYsRUFBN0M7O01BQ0EsSUFBSUgsWUFBWSxJQUFJLENBQUNDLGNBQWpCLElBQW1DRCxZQUFZLEtBQUszQixRQUFRLENBQUNzQixPQUFqRSxFQUEwRTtRQUN0RXRELGNBQUEsQ0FBT0MsR0FBUCxDQUNLLHVCQUFzQjBELFlBQWEsUUFBTzNCLFFBQVEsQ0FBQ3NCLE9BQVEsdUJBRGhFOztRQUdBQyxRQUFRLENBQUNFLHVCQUFULEdBQW1DRSxZQUFuQztNQUNILENBdEU0RSxDQXdFN0U7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBOzs7TUFDQSxNQUFNSSxRQUFRLEdBQUdDLE9BQU8sQ0FBQyxLQUFLdEQsS0FBTCxDQUFXSSxRQUFYLENBQW9CbUQsS0FBckIsQ0FBeEI7TUFDQSxNQUFNQyxjQUFjLEdBQUdGLE9BQU8sQ0FBQ2hDLFFBQVEsQ0FBQ21DLFlBQVYsQ0FBOUI7TUFDQXZFLFFBQVEsQ0FBQyxpQ0FBRCxFQUFvQztRQUFFbUUsUUFBRjtRQUFZRztNQUFaLENBQXBDLENBQVIsQ0F0RjZFLENBdUY3RTs7TUFDQSxJQUFJLENBQUNILFFBQUQsSUFBYUcsY0FBYixJQUErQixDQUFDWCxRQUFRLENBQUNFLHVCQUE3QyxFQUFzRTtRQUNsRTtRQUNBO1FBQ0EsTUFBTSxLQUFLakQsS0FBTCxDQUFXNEQsVUFBWCxDQUFzQjtVQUN4QkMsTUFBTSxFQUFFckMsUUFBUSxDQUFDc0IsT0FETztVQUV4QmdCLFFBQVEsRUFBRXRDLFFBQVEsQ0FBQ3VDLFNBRks7VUFHeEJDLGFBQWEsRUFBRSxLQUFLOUQsS0FBTCxDQUFXWSxZQUFYLENBQXdCSyxnQkFBeEIsRUFIUztVQUl4QjhDLGlCQUFpQixFQUFFLEtBQUsvRCxLQUFMLENBQVdZLFlBQVgsQ0FBd0JPLG9CQUF4QixFQUpLO1VBS3hCNkMsV0FBVyxFQUFFMUMsUUFBUSxDQUFDbUM7UUFMRSxDQUF0QixFQU1ILEtBQUt6RCxLQUFMLENBQVdJLFFBQVgsQ0FBb0I2RCxRQU5qQixDQUFOO1FBUUEsS0FBS0MsWUFBTDtNQUNILENBWkQsTUFZTztRQUNIckIsUUFBUSxDQUFDdEMsSUFBVCxHQUFnQixLQUFoQjtRQUNBc0MsUUFBUSxDQUFDRyxpQkFBVCxHQUE2QixJQUE3QjtNQUNIOztNQUVELEtBQUszQyxRQUFMLENBQWN3QyxRQUFkO0lBQ0gsQ0FyUmtCO0lBQUEsb0RBOFNJc0IsRUFBRSxJQUFJO01BQ3pCQSxFQUFFLENBQUNqRSxjQUFIO01BQ0FpRSxFQUFFLENBQUNDLGVBQUg7TUFDQSxLQUFLdEUsS0FBTCxDQUFXdUUsWUFBWDtJQUNILENBbFRrQjtJQUFBLHlEQW9UU0YsRUFBRSxJQUFJO01BQzlCQSxFQUFFLENBQUNqRSxjQUFIO01BQ0FpRSxFQUFFLENBQUNDLGVBQUg7TUFDQSxLQUFLRSxhQUFMLENBQW1CLEtBQUt4RSxLQUFMLENBQVd5RSxZQUE5QjtNQUNBLEtBQUtsRSxRQUFMLENBQWM7UUFDVkUsSUFBSSxFQUFFLEtBREk7UUFFVk4sV0FBVyxFQUFFO01BRkgsQ0FBZDtJQUlILENBNVRrQjtJQUFBLDJEQThUV3VFLElBQUksSUFBSTtNQUNsQyxNQUFNQyxjQUFjLEdBQUc7UUFDbkJDLFFBQVEsRUFBRSxLQUFLMUUsS0FBTCxDQUFXSSxRQUFYLENBQW9Cc0UsUUFEWDtRQUVuQlQsUUFBUSxFQUFFLEtBQUtqRSxLQUFMLENBQVdJLFFBQVgsQ0FBb0I2RCxRQUZYO1FBR25CVSwyQkFBMkIsRUFBRSxLQUFLN0UsS0FBTCxDQUFXOEUsd0JBSHJCO1FBSW5CSixJQUFJLEVBQUVLLFNBSmE7UUFLbkI7UUFDQTtRQUNBQyxhQUFhLEVBQUVEO01BUEksQ0FBdkI7TUFTQSxJQUFJTCxJQUFKLEVBQVVDLGNBQWMsQ0FBQ0QsSUFBZixHQUFzQkEsSUFBdEI7TUFDVnRGLFFBQVEsQ0FBQyw2Q0FBRCxFQUFnRHNGLElBQWhELENBQVI7TUFDQSxPQUFPLEtBQUt4RSxLQUFMLENBQVdZLFlBQVgsQ0FBd0JtRSxlQUF4QixDQUF3Q04sY0FBeEMsQ0FBUDtJQUNILENBM1VrQjtJQUFBLDZEQXdWYSxNQUFNTixFQUFOLElBQVk7TUFDeENBLEVBQUUsQ0FBQ2pFLGNBQUg7TUFFQSxNQUFNOEUsYUFBYSxHQUFHLE1BQU03QixTQUFTLENBQUM4QixXQUFWLENBQXNCO1FBQUVDLFdBQVcsRUFBRTtNQUFmLENBQXRCLENBQTVCOztNQUNBLElBQUksQ0FBQ0YsYUFBTCxFQUFvQjtRQUNoQjtRQUNBLEtBQUtsRixLQUFMLENBQVd1RSxZQUFYO01BQ0g7O01BRUQsT0FBT1csYUFBUDtJQUNILENBbFdrQjtJQUdmLEtBQUtoRixLQUFMLEdBQWE7TUFDVE8sSUFBSSxFQUFFLEtBREc7TUFFVEQsU0FBUyxFQUFFLElBRkY7TUFHVEYsUUFBUSxFQUFFO1FBQ05tRCxLQUFLLEVBQUUsS0FBS3pELEtBQUwsQ0FBV3lEO01BRFosQ0FIRDtNQU1UdEQsV0FBVyxFQUFFcUQsT0FBTyxDQUFDLEtBQUt4RCxLQUFMLENBQVdhLFNBQVosQ0FOWDtNQU9Ud0UsS0FBSyxFQUFFLElBUEU7TUFRVG5DLGlCQUFpQixFQUFFLEtBUlY7TUFTVG9DLGFBQWEsRUFBRSxJQVROO01BVVRDLGtCQUFrQixFQUFFLEtBVlg7TUFXVEMsZUFBZSxFQUFFO0lBWFIsQ0FBYjtJQWNBLE1BQU07TUFBRUMsS0FBRjtNQUFTQztJQUFULElBQW1CLEtBQUsxRixLQUFMLENBQVd5RSxZQUFwQztJQUNBLEtBQUtrQixVQUFMLEdBQWtCLElBQUlDLGNBQUosQ0FBVUgsS0FBVixFQUFpQkMsS0FBakIsRUFBd0IsSUFBeEIsRUFBOEI7TUFDNUNaLHdCQUF3QixFQUFFLHFCQURrQixDQUNLOztJQURMLENBQTlCLENBQWxCO0VBR0g7O0VBRURlLGlCQUFpQixHQUFHO0lBQ2hCLEtBQUtyQixhQUFMLENBQW1CLEtBQUt4RSxLQUFMLENBQVd5RSxZQUE5QixFQURnQixDQUVoQjs7SUFDQXFCLE1BQU0sQ0FBQ0MsZ0JBQVAsQ0FBd0IsY0FBeEIsRUFBd0MsS0FBS0MsY0FBN0M7RUFDSDs7RUFFREMsb0JBQW9CLEdBQUc7SUFDbkJILE1BQU0sQ0FBQ0ksbUJBQVAsQ0FBMkIsY0FBM0IsRUFBMkMsS0FBS0YsY0FBaEQ7RUFDSDs7RUFTRDtFQUNBO0VBQ0FHLGdDQUFnQyxDQUFDQyxRQUFELEVBQVc7SUFDdkMsSUFBSUEsUUFBUSxDQUFDM0IsWUFBVCxDQUFzQmdCLEtBQXRCLEtBQWdDLEtBQUt6RixLQUFMLENBQVd5RSxZQUFYLENBQXdCZ0IsS0FBeEQsSUFDQVcsUUFBUSxDQUFDM0IsWUFBVCxDQUFzQmlCLEtBQXRCLEtBQWdDLEtBQUsxRixLQUFMLENBQVd5RSxZQUFYLENBQXdCaUIsS0FENUQsRUFDbUU7SUFFbkUsS0FBS2xCLGFBQUwsQ0FBbUI0QixRQUFRLENBQUMzQixZQUE1QjtFQUNIOztFQUUwQixNQUFiRCxhQUFhLENBQUNDLFlBQUQsRUFBc0M7SUFDN0QsS0FBSzRCLGtCQUFMLEdBQTBCNUIsWUFBMUI7SUFDQSxNQUFNO01BQUVnQixLQUFGO01BQVNDO0lBQVQsSUFBbUJqQixZQUF6QjtJQUVBLEtBQUtsRSxRQUFMLENBQWM7TUFDVkMsU0FBUyxFQUFFLElBREQ7TUFFVmdGLGVBQWUsRUFBRSxJQUZQO01BR1ZELGtCQUFrQixFQUFFLEtBSFY7TUFJVjtNQUNBO01BQ0E5RSxJQUFJLEVBQUU7SUFOSSxDQUFkLEVBSjZELENBYTdEOztJQUNBLElBQUk7TUFDQSxNQUFNNkYsMkJBQUEsQ0FBbUJDLGtDQUFuQixDQUFzRGQsS0FBdEQsRUFBNkRDLEtBQTdELENBQU47TUFDQSxJQUFJakIsWUFBWSxLQUFLLEtBQUs0QixrQkFBMUIsRUFBOEMsT0FGOUMsQ0FFc0Q7O01BQ3RELEtBQUs5RixRQUFMLENBQWM7UUFDVitFLGFBQWEsRUFBRSxJQURMO1FBRVZDLGtCQUFrQixFQUFFO01BRlYsQ0FBZDtJQUlILENBUEQsQ0FPRSxPQUFPaUIsQ0FBUCxFQUFVO01BQ1IsSUFBSS9CLFlBQVksS0FBSyxLQUFLNEIsa0JBQTFCLEVBQThDLE9BRHRDLENBQzhDOztNQUN0RCxLQUFLOUYsUUFBTDtRQUNJRSxJQUFJLEVBQUU7TUFEVixHQUVPNkYsMkJBQUEsQ0FBbUJHLDBCQUFuQixDQUE4Q0QsQ0FBOUMsRUFBaUQsVUFBakQsQ0FGUDs7TUFJQSxJQUFJLEtBQUt0RyxLQUFMLENBQVdxRixrQkFBZixFQUFtQztRQUMvQixPQUQrQixDQUN2QjtNQUNYO0lBQ0o7O0lBRUQsTUFBTW1CLEdBQUcsR0FBRyxJQUFBQyxvQkFBQSxFQUFhO01BQ3JCQyxPQUFPLEVBQUVuQixLQURZO01BRXJCb0IsU0FBUyxFQUFFbkI7SUFGVSxDQUFiLENBQVo7SUFLQSxLQUFLQyxVQUFMLENBQWdCbUIsZ0JBQWhCLENBQWlDckIsS0FBakM7SUFDQSxLQUFLRSxVQUFMLENBQWdCb0Isb0JBQWhCLENBQXFDckIsS0FBckM7SUFFQSxJQUFJc0IsT0FBSjs7SUFDQSxJQUFJO01BQ0EsTUFBTUMsVUFBVSxHQUFHLE1BQU0sS0FBS3RCLFVBQUwsQ0FBZ0J1QixRQUFoQixFQUF6QjtNQUNBLElBQUl6QyxZQUFZLEtBQUssS0FBSzRCLGtCQUExQixFQUE4QyxPQUY5QyxDQUVzRDs7TUFDdERXLE9BQU8sR0FBR0MsVUFBVSxDQUFDRSxJQUFYLENBQWdCQyxDQUFDLElBQUlBLENBQUMsQ0FBQ0MsSUFBRixLQUFXLGFBQVgsSUFBNEJELENBQUMsQ0FBQ0MsSUFBRixLQUFXLGFBQTVELENBQVY7SUFDSCxDQUpELENBSUUsT0FBT2IsQ0FBUCxFQUFVO01BQ1IsSUFBSS9CLFlBQVksS0FBSyxLQUFLNEIsa0JBQTFCLEVBQThDLE9BRHRDLENBQzhDOztNQUN0RDdHLGNBQUEsQ0FBTzhILEtBQVAsQ0FBYSxvREFBYixFQUFtRWQsQ0FBbkU7SUFDSDs7SUFFRCxLQUFLakcsUUFBTCxDQUFjO01BQ1ZPLFlBQVksRUFBRTRGLEdBREo7TUFFVk0sT0FGVTtNQUdWdkcsSUFBSSxFQUFFO0lBSEksQ0FBZDs7SUFNQSxJQUFJO01BQ0E7TUFDQTtNQUNBO01BQ0EsSUFBSSxDQUFDLEtBQUtQLEtBQUwsQ0FBV0MsV0FBaEIsRUFBNkI7UUFDekIsTUFBTSxLQUFLb0gsbUJBQUwsQ0FBeUIsSUFBekIsQ0FBTjtRQUNBLElBQUk5QyxZQUFZLEtBQUssS0FBSzRCLGtCQUExQixFQUE4QyxPQUZyQixDQUU2QjtRQUN0RDs7UUFDQTdHLGNBQUEsQ0FBT0MsR0FBUCxDQUFXLHNEQUFYO01BQ0g7SUFDSixDQVZELENBVUUsT0FBTytHLENBQVAsRUFBVTtNQUNSLElBQUkvQixZQUFZLEtBQUssS0FBSzRCLGtCQUExQixFQUE4QyxPQUR0QyxDQUM4Qzs7TUFDdEQsSUFBSUcsQ0FBQyxDQUFDZ0IsVUFBRixLQUFpQixHQUFyQixFQUEwQjtRQUN0QixLQUFLakgsUUFBTCxDQUFjO1VBQ1Y4RSxLQUFLLEVBQUVtQixDQUFDLENBQUMxRSxJQUFGLENBQU91RDtRQURKLENBQWQ7TUFHSCxDQUpELE1BSU8sSUFBSW1CLENBQUMsQ0FBQ2dCLFVBQUYsS0FBaUIsR0FBakIsSUFBd0JoQixDQUFDLENBQUM3RSxPQUFGLEtBQWMsYUFBMUMsRUFBeUQ7UUFDNUQ7UUFDQTtRQUNBO1FBQ0E7UUFDQSxJQUFJcUYsT0FBSixFQUFhO1VBQ1Q7VUFDQVMsbUJBQUEsQ0FBSUMsUUFBSixDQUFhO1lBQUVDLE1BQU0sRUFBRTtVQUFWLENBQWI7UUFDSCxDQUhELE1BR087VUFDSCxLQUFLcEgsUUFBTCxDQUFjO1lBQ1ZnRixrQkFBa0IsRUFBRSxJQURWO1lBQ2dCO1lBQzFCL0UsU0FBUyxFQUFFLElBQUFtQyxtQkFBQSxFQUFHLG9EQUFILENBRkQ7WUFHVjtZQUNBMEMsS0FBSyxFQUFFO1VBSkcsQ0FBZDtRQU1IO01BQ0osQ0FoQk0sTUFnQkE7UUFDSDdGLGNBQUEsQ0FBT0MsR0FBUCxDQUFXLHFEQUFYLEVBQWtFK0csQ0FBbEU7O1FBQ0EsS0FBS2pHLFFBQUwsQ0FBYztVQUNWQyxTQUFTLEVBQUUsSUFBQW1DLG1CQUFBLEVBQUcscURBQUgsQ0FERDtVQUVWO1VBQ0EwQyxLQUFLLEVBQUU7UUFIRyxDQUFkO01BS0g7SUFDSjtFQUNKOztFQXFJT2pCLFlBQVksR0FBRztJQUNuQixJQUFJLENBQUMsS0FBS3BFLEtBQUwsQ0FBVzRILEtBQWhCLEVBQXVCO01BQ25CLE9BQU9DLE9BQU8sQ0FBQ0MsT0FBUixFQUFQO0lBQ0g7O0lBQ0QsTUFBTWhILFlBQVksR0FBRzhCLGdDQUFBLENBQWdCbUYsR0FBaEIsRUFBckI7O0lBQ0EsT0FBT2pILFlBQVksQ0FBQ2tILFVBQWIsR0FBMEJDLElBQTFCLENBQWdDQyxJQUFELElBQVU7TUFDNUMsTUFBTUMsT0FBTyxHQUFHRCxJQUFJLENBQUNDLE9BQXJCOztNQUNBLEtBQUssSUFBSUMsQ0FBQyxHQUFHLENBQWIsRUFBZ0JBLENBQUMsR0FBR0QsT0FBTyxDQUFDRSxNQUE1QixFQUFvQyxFQUFFRCxDQUF0QyxFQUF5QztRQUNyQyxJQUFJRCxPQUFPLENBQUNDLENBQUQsQ0FBUCxDQUFXRSxJQUFYLEtBQW9CLE9BQXhCLEVBQWlDO1VBQzdCLE1BQU1DLFdBQVcsR0FBR0osT0FBTyxDQUFDQyxDQUFELENBQTNCO1VBQ0FHLFdBQVcsQ0FBQ3pHLElBQVosR0FBbUI7WUFBRThGLEtBQUssRUFBRSxLQUFLNUgsS0FBTCxDQUFXNEg7VUFBcEIsQ0FBbkI7VUFDQTlHLFlBQVksQ0FBQzBILFNBQWIsQ0FBdUJELFdBQXZCLEVBQW9DTixJQUFwQyxDQUF5QyxNQUFNO1lBQzNDekksY0FBQSxDQUFPQyxHQUFQLENBQVcsMkJBQTJCLEtBQUtPLEtBQUwsQ0FBVzRILEtBQWpEO1VBQ0gsQ0FGRCxFQUVJTixLQUFELElBQVc7WUFDVjlILGNBQUEsQ0FBTzhILEtBQVAsQ0FBYSxrQ0FBa0NBLEtBQS9DO1VBQ0gsQ0FKRDtRQUtIO01BQ0o7SUFDSixDQWJNLEVBYUhBLEtBQUQsSUFBVztNQUNWOUgsY0FBQSxDQUFPOEgsS0FBUCxDQUFhLDJCQUEyQkEsS0FBeEM7SUFDSCxDQWZNLENBQVA7RUFnQkg7O0VBaUNPbUIsZUFBZSxHQUFHO0lBQ3RCLE9BQU87TUFDSC9ILFlBQVksRUFBRSxLQUFLUixLQUFMLENBQVdJLFFBQVgsQ0FBb0JtRCxLQUQvQjtNQUVIaUYsWUFBWSxFQUFFLEtBQUt4SSxLQUFMLENBQVdJLFFBQVgsQ0FBb0JvSSxZQUYvQjtNQUdIQyxXQUFXLEVBQUUsS0FBS3pJLEtBQUwsQ0FBV0ksUUFBWCxDQUFvQnFJO0lBSDlCLENBQVA7RUFLSCxDQXhWcUUsQ0EwVnRFO0VBQ0E7RUFDQTs7O0VBYVFDLHVCQUF1QixHQUFHO0lBQzlCLElBQUksS0FBSzFJLEtBQUwsQ0FBV1ksWUFBWCxJQUEyQixLQUFLWixLQUFMLENBQVdDLFdBQTFDLEVBQXVEO01BQ25ELG9CQUFPLDZCQUFDLHdCQUFEO1FBQ0gsWUFBWSxFQUFFLEtBQUtELEtBQUwsQ0FBV1ksWUFEdEI7UUFFSCxXQUFXLEVBQUUsS0FBS3lHLG1CQUZmO1FBR0gsY0FBYyxFQUFFLEtBQUtzQixnQkFIbEI7UUFJSCxNQUFNLEVBQUUsS0FBS0osZUFBTCxFQUpMO1FBS0gsaUJBQWlCLEVBQUUsS0FBS0ssaUJBTHJCO1FBTUgsU0FBUyxFQUFFLEtBQUs5SSxLQUFMLENBQVdhLFNBTm5CO1FBT0gsWUFBWSxFQUFFLEtBQUtiLEtBQUwsQ0FBV1csWUFQdEI7UUFRSCxRQUFRLEVBQUUsS0FBS1gsS0FBTCxDQUFXK0ksS0FSbEI7UUFTSCxJQUFJLEVBQUU7TUFUSCxFQUFQO0lBV0gsQ0FaRCxNQVlPLElBQUksQ0FBQyxLQUFLN0ksS0FBTCxDQUFXWSxZQUFaLElBQTRCLENBQUMsS0FBS1osS0FBTCxDQUFXTyxJQUE1QyxFQUFrRDtNQUNyRCxPQUFPLElBQVA7SUFDSCxDQUZNLE1BRUEsSUFBSSxLQUFLUCxLQUFMLENBQVdPLElBQVgsSUFBbUIsQ0FBQyxLQUFLUCxLQUFMLENBQVdtRixLQUFuQyxFQUEwQztNQUM3QyxvQkFBTztRQUFLLFNBQVMsRUFBQztNQUFmLGdCQUNILDZCQUFDLGdCQUFELE9BREcsQ0FBUDtJQUdILENBSk0sTUFJQSxJQUFJLEtBQUtuRixLQUFMLENBQVdtRixLQUFYLENBQWlCZ0QsTUFBckIsRUFBNkI7TUFDaEMsSUFBSVcsVUFBSjs7TUFDQSxJQUFJLEtBQUs5SSxLQUFMLENBQVc4RyxPQUFmLEVBQXdCO1FBQ3BCLElBQUlpQyxtQkFBSjtRQUNBLE1BQU1DLFNBQVMsR0FBRyxLQUFLaEosS0FBTCxDQUFXOEcsT0FBWCxDQUFtQm1DLGtCQUFuQixJQUF5QyxFQUEzRCxDQUZvQixDQUdwQjs7UUFDQSxJQUFJRCxTQUFTLENBQUNiLE1BQVYsR0FBbUIsQ0FBdkIsRUFBMEI7VUFDdEI7VUFDQVksbUJBQW1CLGdCQUFHO1lBQUksU0FBUyxFQUFDO1VBQWQsR0FDaEIsSUFBQXRHLG1CQUFBLEVBQUcsOEJBQUgsRUFBbUM7WUFBRXlHLFVBQVUsRUFBRTtVQUFkLENBQW5DLEVBQXVEQyxJQUF2RCxFQURnQixDQUF0QjtRQUdILENBVG1CLENBV3BCOzs7UUFDQUwsVUFBVSxnQkFBRyw2QkFBQyxjQUFELENBQU8sUUFBUCxRQUNQQyxtQkFETyxlQUVULDZCQUFDLG1CQUFEO1VBQ0ksWUFBWSxFQUFFLEtBQUt0RCxVQUFMLENBQWdCMkQscUJBQWhCLEVBRGxCO1VBRUksSUFBSSxFQUFFLEtBQUtwSixLQUFMLENBQVc4RyxPQUZyQjtVQUdJLFNBQVMsRUFBRSxLQUFLOUcsS0FBTCxDQUFXOEcsT0FBWCxDQUFtQkssSUFBbkIsS0FBNEIsYUFBNUIsR0FBNEMsS0FBNUMsR0FBb0QsS0FIbkU7VUFJSSxrQkFBa0IsRUFBRSxLQUFLckgsS0FBTCxDQUFXdUo7UUFKbkMsRUFGUyxlQVFUO1VBQUksU0FBUyxFQUFDO1FBQWQsR0FDTSxJQUFBNUcsbUJBQUEsRUFDRSx3Q0FERixFQUVFO1VBQ0l5RyxVQUFVLEVBQUUsRUFEaEI7VUFFSUksZ0JBQWdCLEVBQUU7UUFGdEIsQ0FGRixFQU1BSCxJQU5BLEVBRE4sQ0FSUyxDQUFiO01Ba0JIOztNQUVELG9CQUFPLDZCQUFDLGNBQUQsQ0FBTyxRQUFQLFFBQ0RMLFVBREMsZUFFSCw2QkFBQyx5QkFBRDtRQUNJLGVBQWUsRUFBRSxLQUFLOUksS0FBTCxDQUFXSSxRQUFYLENBQW9Cc0UsUUFEekM7UUFFSSxZQUFZLEVBQUUsS0FBSzFFLEtBQUwsQ0FBV0ksUUFBWCxDQUFvQm1ELEtBRnRDO1FBR0ksbUJBQW1CLEVBQUUsS0FBS3ZELEtBQUwsQ0FBV0ksUUFBWCxDQUFvQm9JLFlBSDdDO1FBSUksa0JBQWtCLEVBQUUsS0FBS3hJLEtBQUwsQ0FBV0ksUUFBWCxDQUFvQnFJLFdBSjVDO1FBS0ksZUFBZSxFQUFFLEtBQUt6SSxLQUFMLENBQVdJLFFBQVgsQ0FBb0I2RCxRQUx6QztRQU1JLGVBQWUsRUFBRSxLQUFLc0YsWUFOMUI7UUFPSSxLQUFLLEVBQUUsS0FBS3ZKLEtBQUwsQ0FBV21GLEtBUHRCO1FBUUksWUFBWSxFQUFFLEtBQUtyRixLQUFMLENBQVd5RSxZQVI3QjtRQVNJLFNBQVMsRUFBRSxDQUFDLEtBQUt2RSxLQUFMLENBQVdxRixrQkFUM0I7UUFVSSxZQUFZLEVBQUUsS0FBS3JGLEtBQUwsQ0FBV1k7TUFWN0IsRUFGRyxDQUFQO0lBZUg7RUFDSjs7RUFFRDRJLE1BQU0sR0FBRztJQUNMLElBQUlsSixTQUFKO0lBQ0EsTUFBTW1KLEdBQUcsR0FBRyxLQUFLekosS0FBTCxDQUFXTSxTQUF2Qjs7SUFDQSxJQUFJbUosR0FBSixFQUFTO01BQ0xuSixTQUFTLGdCQUFHO1FBQUssU0FBUyxFQUFDO01BQWYsR0FBa0NtSixHQUFsQyxDQUFaO0lBQ0g7O0lBRUQsSUFBSUMsaUJBQUo7O0lBQ0EsSUFBSSxDQUFDLEtBQUsxSixLQUFMLENBQVdvRixhQUFoQixFQUErQjtNQUMzQixNQUFNdUUsT0FBTyxHQUFHLElBQUFDLG1CQUFBLEVBQVc7UUFDdkIsa0JBQWtCLElBREs7UUFFdkIsd0JBQXdCLElBRkQ7UUFHdkIsZ0NBQWdDLENBQUMsS0FBSzVKLEtBQUwsQ0FBV3FGO01BSHJCLENBQVgsQ0FBaEI7TUFLQXFFLGlCQUFpQixnQkFDYjtRQUFLLFNBQVMsRUFBRUM7TUFBaEIsR0FDTSxLQUFLM0osS0FBTCxDQUFXc0YsZUFEakIsQ0FESjtJQUtIOztJQUVELE1BQU11RSxNQUFNLGdCQUFHO01BQU0sU0FBUyxFQUFDO0lBQWhCLEdBQ1QsSUFBQXBILG1CQUFBLEVBQUcsOENBQUgsRUFBbUQsRUFBbkQsRUFBdUQ7TUFDckRxSCxDQUFDLEVBQUVDLEdBQUcsaUJBQUksNkJBQUMseUJBQUQ7UUFBa0IsSUFBSSxFQUFDLGFBQXZCO1FBQXFDLE9BQU8sRUFBRSxLQUFLMUY7TUFBbkQsR0FBbUUwRixHQUFuRTtJQUQyQyxDQUF2RCxDQURTLENBQWYsQ0FyQkssQ0EyQkw7OztJQUNBLElBQUlDLE1BQUo7O0lBQ0EsSUFBSSxLQUFLaEssS0FBTCxDQUFXQyxXQUFmLEVBQTRCO01BQ3hCK0osTUFBTSxnQkFBRyw2QkFBQyx5QkFBRDtRQUNMLElBQUksRUFBQyxNQURBO1FBRUwsU0FBUyxFQUFDLHdCQUZMO1FBR0wsT0FBTyxFQUFFLEtBQUtDO01BSFQsR0FLSCxJQUFBeEgsbUJBQUEsRUFBRyxTQUFILENBTEcsQ0FBVDtJQU9IOztJQUVELElBQUl5SCxJQUFKOztJQUNBLElBQUksS0FBS2xLLEtBQUwsQ0FBV2dELGlCQUFmLEVBQWtDO01BQzlCLElBQUltSCxXQUFKOztNQUNBLElBQUksS0FBS25LLEtBQUwsQ0FBVytDLHVCQUFmLEVBQXdDO1FBQ3BDb0gsV0FBVyxnQkFBRyx1REFDVix3Q0FBSyxJQUFBMUgsbUJBQUEsRUFDRCwyRUFDQSx1REFGQyxFQUV3RDtVQUNyRDJILFlBQVksRUFBRSxLQUFLcEssS0FBTCxDQUFXOEMsa0JBRDRCO1VBRXJEdUgsY0FBYyxFQUFFLEtBQUtySyxLQUFMLENBQVcrQztRQUYwQixDQUZ4RCxDQUFMLENBRFUsZUFRVixxREFBRyw2QkFBQyx5QkFBRDtVQUNDLElBQUksRUFBQyxhQUROO1VBRUMsT0FBTyxFQUFFLE1BQU1oRCxLQUFOLElBQWU7WUFDcEIsTUFBTWlGLGFBQWEsR0FBRyxNQUFNLEtBQUtzRixxQkFBTCxDQUEyQnZLLEtBQTNCLENBQTVCOztZQUNBLElBQUlpRixhQUFKLEVBQW1CO2NBQ2Z1QyxtQkFBQSxDQUFJQyxRQUFKLENBQWE7Z0JBQUVDLE1BQU0sRUFBRTtjQUFWLENBQWI7WUFDSDtVQUNKO1FBUEYsR0FTRyxJQUFBaEYsbUJBQUEsRUFBRyxnQ0FBSCxDQVRILENBQUgsQ0FSVSxDQUFkO01Bb0JILENBckJELE1BcUJPO1FBQ0g7UUFDQTtRQUNBMEgsV0FBVyxnQkFBRyx5Q0FBTSxJQUFBMUgsbUJBQUEsRUFDaEIsb0NBRGdCLEVBQ3NCLEVBRHRCLEVBRWhCO1VBQ0lxSCxDQUFDLEVBQUdDLEdBQUQsaUJBQVMsNkJBQUMseUJBQUQ7WUFDUixJQUFJLEVBQUMsYUFERztZQUVSLE9BQU8sRUFBRSxNQUFNaEssS0FBTixJQUFlO2NBQ3BCLE1BQU1pRixhQUFhLEdBQUcsTUFBTSxLQUFLc0YscUJBQUwsQ0FBMkJ2SyxLQUEzQixDQUE1Qjs7Y0FDQSxJQUFJaUYsYUFBSixFQUFtQjtnQkFDZnVDLG1CQUFBLENBQUlDLFFBQUosQ0FBYTtrQkFBRUMsTUFBTSxFQUFFO2dCQUFWLENBQWI7Y0FDSDtZQUNKO1VBUE8sR0FRVHNDLEdBUlM7UUFEaEIsQ0FGZ0IsQ0FBTixDQUFkO01BY0g7O01BQ0RHLElBQUksZ0JBQUcsdURBQ0gseUNBQU0sSUFBQXpILG1CQUFBLEVBQUcseUJBQUgsQ0FBTixDQURHLEVBRUQwSCxXQUZDLENBQVA7SUFJSCxDQTdDRCxNQTZDTztNQUNIRCxJQUFJLGdCQUFHLDZCQUFDLGVBQUQscUJBQ0g7UUFBSyxTQUFTLEVBQUM7TUFBZixnQkFDSSw2QkFBQyxvQ0FBRDtRQUNJLEtBQUssRUFBRSxJQUFBekgsbUJBQUEsRUFBRyxnQkFBSCxDQURYO1FBRUksWUFBWSxlQUFFLDZCQUFDLHFCQUFEO1VBQ1YsS0FBSyxFQUFFLElBQUFBLG1CQUFBLEVBQUcsaUJBQUgsQ0FERztVQUVWLFdBQVcsRUFBRSxJQUFBQSxtQkFBQSxFQUFHLHFDQUFILENBRkg7VUFHVixZQUFZLEVBQUUsS0FBSzNDLEtBQUwsQ0FBV3lFLFlBSGY7VUFJVixvQkFBb0IsRUFBRSxLQUFLdkUsS0FBTCxDQUFXQyxXQUFYLEdBQXlCNEUsU0FBekIsR0FBcUMsS0FBSy9FLEtBQUwsQ0FBV3lLO1FBSjVEO01BRmxCLEdBU01qSyxTQVROLEVBVU1vSixpQkFWTixDQURKLEVBYU0sS0FBS2hCLHVCQUFMLEVBYk4sQ0FERyxlQWdCSDtRQUFLLFNBQVMsRUFBQztNQUFmLEdBQ01zQixNQUROLEVBRU1ILE1BRk4sQ0FoQkcsQ0FBUDtJQXFCSDs7SUFFRCxvQkFDSSw2QkFBQyxpQkFBRCxxQkFDSSw2QkFBQyxtQkFBRCxPQURKLGVBRUksNkJBQUMsc0NBQUQscUJBQ0ksNkJBQUMsaUJBQUQ7TUFBVSxJQUFJO0lBQWQsR0FDTUssSUFETixDQURKLENBRkosQ0FESjtFQVVIOztBQXZpQnFFIn0=