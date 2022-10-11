"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TermsAuthEntry = exports.SSOAuthEntry = exports.RecaptchaAuthEntry = exports.PasswordAuthEntry = exports.MsisdnAuthEntry = exports.FallbackAuthEntry = exports.EmailIdentityAuthEntry = exports.DEFAULT_PHASE = void 0;
exports.default = getEntryComponentForLoginType;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classnames = _interopRequireDefault(require("classnames"));

var _interactiveAuth = require("matrix-js-sdk/src/interactive-auth");

var _logger = require("matrix-js-sdk/src/logger");

var _react = _interopRequireWildcard(require("react"));

var _emailPrompt = _interopRequireDefault(require("../../../../res/img/element-icons/email-prompt.svg"));

var _languageHandler = require("../../../languageHandler");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _AuthHeaderModifier = require("../../structures/auth/header/AuthHeaderModifier");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _AccessibleTooltipButton = _interopRequireDefault(require("../elements/AccessibleTooltipButton"));

var _Field = _interopRequireDefault(require("../elements/Field"));

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

var _Tooltip = require("../elements/Tooltip");

var _CaptchaForm = _interopRequireDefault(require("./CaptchaForm"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2016-2021 The Matrix.org Foundation C.I.C.

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

/* This file contains a collection of components which are used by the
 * InteractiveAuth to prompt the user to enter the information needed
 * for an auth stage. (The intention is that they could also be used for other
 * components, such as the registration flow).
 *
 * Call getEntryComponentForLoginType() to get a component suitable for a
 * particular login type. Each component requires the same properties:
 *
 * matrixClient:           A matrix client. May be a different one to the one
 *                         currently being used generally (eg. to register with
 *                         one HS whilst being a guest on another).
 * loginType:              the login type of the auth stage being attempted
 * authSessionId:          session id from the server
 * clientSecret:           The client secret in use for identity server auth sessions
 * stageParams:            params from the server for the stage being attempted
 * errorText:              error message from a previous attempt to authenticate
 * submitAuthDict:         a function which will be called with the new auth dict
 * busy:                   a boolean indicating whether the auth logic is doing something
 *                         the user needs to wait for.
 * inputs:                 Object of inputs provided by the user, as in js-sdk
 *                         interactive-auth
 * stageState:             Stage-specific object used for communicating state information
 *                         to the UI from the state-specific auth logic.
 *                         Defined keys for stages are:
 *                             m.login.email.identity:
 *                              * emailSid: string representing the sid of the active
 *                                          verification session from the identity server,
 *                                          or null if no session is active.
 * fail:                   a function which should be called with an error object if an
 *                         error occurred during the auth stage. This will cause the auth
 *                         session to be failed and the process to go back to the start.
 * setEmailSid:            m.login.email.identity only: a function to be called with the
 *                         email sid after a token is requested.
 * onPhaseChange:          A function which is called when the stage's phase changes. If
 *                         the stage has no phases, call this with DEFAULT_PHASE. Takes
 *                         one argument, the phase, and is always defined/required.
 * continueText:           For stages which have a continue button, the text to use.
 * continueKind:           For stages which have a continue button, the style of button to
 *                         use. For example, 'danger' or 'primary'.
 * onCancel                A function with no arguments which is called by the stage if the
 *                         user knowingly cancelled/dismissed the authentication attempt.
 *
 * Each component may also provide the following functions (beyond the standard React ones):
 *    focus: set the input focus appropriately in the form.
 */
const DEFAULT_PHASE = 0;
exports.DEFAULT_PHASE = DEFAULT_PHASE;

class PasswordAuthEntry extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onSubmit", e => {
      e.preventDefault();
      if (this.props.busy) return;
      this.props.submitAuthDict({
        type: _interactiveAuth.AuthType.Password,
        // TODO: Remove `user` once servers support proper UIA
        // See https://github.com/vector-im/element-web/issues/10312
        user: this.props.matrixClient.credentials.userId,
        identifier: {
          type: "m.id.user",
          user: this.props.matrixClient.credentials.userId
        },
        password: this.state.password
      });
    });
    (0, _defineProperty2.default)(this, "onPasswordFieldChange", ev => {
      // enable the submit button iff the password is non-empty
      this.setState({
        password: ev.target.value
      });
    });
    this.state = {
      password: ""
    };
  }

  componentDidMount() {
    this.props.onPhaseChange(DEFAULT_PHASE);
  }

  render() {
    const passwordBoxClass = (0, _classnames.default)({
      "error": this.props.errorText
    });
    let submitButtonOrSpinner;

    if (this.props.busy) {
      submitButtonOrSpinner = /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
    } else {
      submitButtonOrSpinner = /*#__PURE__*/_react.default.createElement("input", {
        type: "submit",
        className: "mx_Dialog_primary",
        disabled: !this.state.password,
        value: (0, _languageHandler._t)("Continue")
      });
    }

    let errorSection;

    if (this.props.errorText) {
      errorSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "error",
        role: "alert"
      }, this.props.errorText);
    }

    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Confirm your identity by entering your account password below.")), /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.onSubmit,
      className: "mx_InteractiveAuthEntryComponents_passwordSection"
    }, /*#__PURE__*/_react.default.createElement(_Field.default, {
      className: passwordBoxClass,
      type: "password",
      name: "passwordField",
      label: (0, _languageHandler._t)('Password'),
      autoFocus: true,
      value: this.state.password,
      onChange: this.onPasswordFieldChange
    }), errorSection, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_button_row"
    }, submitButtonOrSpinner)));
  }

}
/* eslint-disable camelcase */


exports.PasswordAuthEntry = PasswordAuthEntry;
(0, _defineProperty2.default)(PasswordAuthEntry, "LOGIN_TYPE", _interactiveAuth.AuthType.Password);

/* eslint-enable camelcase */
class RecaptchaAuthEntry extends _react.default.Component {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "onCaptchaResponse", response => {
      this.props.submitAuthDict({
        type: _interactiveAuth.AuthType.Recaptcha,
        response: response
      });
    });
  }

  componentDidMount() {
    this.props.onPhaseChange(DEFAULT_PHASE);
  }

  render() {
    if (this.props.busy) {
      return /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
    }

    let errorText = this.props.errorText;
    let sitePublicKey;

    if (!this.props.stageParams || !this.props.stageParams.public_key) {
      errorText = (0, _languageHandler._t)("Missing captcha public key in homeserver configuration. Please report " + "this to your homeserver administrator.");
    } else {
      sitePublicKey = this.props.stageParams.public_key;
    }

    let errorSection;

    if (errorText) {
      errorSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "error",
        role: "alert"
      }, errorText);
    }

    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_CaptchaForm.default, {
      sitePublicKey: sitePublicKey,
      onCaptchaResponse: this.onCaptchaResponse
    }), errorSection);
  }

}

exports.RecaptchaAuthEntry = RecaptchaAuthEntry;
(0, _defineProperty2.default)(RecaptchaAuthEntry, "LOGIN_TYPE", _interactiveAuth.AuthType.Recaptcha);

class TermsAuthEntry extends _react.default.Component {
  constructor(props) {
    super(props); // example stageParams:
    //
    // {
    //     "policies": {
    //         "privacy_policy": {
    //             "version": "1.0",
    //             "en": {
    //                 "name": "Privacy Policy",
    //                 "url": "https://example.org/privacy-1.0-en.html",
    //             },
    //             "fr": {
    //                 "name": "Politique de confidentialité",
    //                 "url": "https://example.org/privacy-1.0-fr.html",
    //             },
    //         },
    //         "other_policy": { ... },
    //     }
    // }

    (0, _defineProperty2.default)(this, "trySubmit", () => {
      let allChecked = true;

      for (const policy of this.state.policies) {
        const checked = this.state.toggledPolicies[policy.id];
        allChecked = allChecked && checked;
      }

      if (allChecked) {
        this.props.submitAuthDict({
          type: _interactiveAuth.AuthType.Terms
        });
      } else {
        this.setState({
          errorText: (0, _languageHandler._t)("Please review and accept all of the homeserver's policies")
        });
      }
    });
    const allPolicies = this.props.stageParams.policies || {};

    const prefLang = _SettingsStore.default.getValue("language");

    const initToggles = {};
    const pickedPolicies = [];

    for (const policyId of Object.keys(allPolicies)) {
      const policy = allPolicies[policyId]; // Pick a language based on the user's language, falling back to english,
      // and finally to the first language available. If there's still no policy
      // available then the homeserver isn't respecting the spec.

      let langPolicy = policy[prefLang];
      if (!langPolicy) langPolicy = policy["en"];

      if (!langPolicy) {
        // last resort
        const firstLang = Object.keys(policy).find(e => e !== "version");
        langPolicy = policy[firstLang];
      }

      if (!langPolicy) throw new Error("Failed to find a policy to show the user");
      initToggles[policyId] = false;
      pickedPolicies.push({
        id: policyId,
        name: langPolicy.name,
        url: langPolicy.url
      });
    }

    this.state = {
      toggledPolicies: initToggles,
      policies: pickedPolicies
    };
  }

  componentDidMount() {
    this.props.onPhaseChange(DEFAULT_PHASE);
  }

  togglePolicy(policyId) {
    const newToggles = {};

    for (const policy of this.state.policies) {
      let checked = this.state.toggledPolicies[policy.id];
      if (policy.id === policyId) checked = !checked;
      newToggles[policy.id] = checked;
    }

    this.setState({
      "toggledPolicies": newToggles
    });
  }

  render() {
    if (this.props.busy) {
      return /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
    }

    const checkboxes = [];
    let allChecked = true;

    for (const policy of this.state.policies) {
      const checked = this.state.toggledPolicies[policy.id];
      allChecked = allChecked && checked;
      checkboxes.push(
      /*#__PURE__*/
      // XXX: replace with StyledCheckbox
      _react.default.createElement("label", {
        key: "policy_checkbox_" + policy.id,
        className: "mx_InteractiveAuthEntryComponents_termsPolicy"
      }, /*#__PURE__*/_react.default.createElement("input", {
        type: "checkbox",
        onChange: () => this.togglePolicy(policy.id),
        checked: checked
      }), /*#__PURE__*/_react.default.createElement("a", {
        href: policy.url,
        target: "_blank",
        rel: "noreferrer noopener"
      }, policy.name)));
    }

    let errorSection;

    if (this.props.errorText || this.state.errorText) {
      errorSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "error",
        role: "alert"
      }, this.props.errorText || this.state.errorText);
    }

    let submitButton;

    if (this.props.showContinue !== false) {
      // XXX: button classes
      submitButton = /*#__PURE__*/_react.default.createElement("button", {
        className: "mx_InteractiveAuthEntryComponents_termsSubmit mx_GeneralButton",
        onClick: this.trySubmit,
        disabled: !allChecked
      }, (0, _languageHandler._t)("Accept"));
    }

    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Please review and accept the policies of this homeserver:")), checkboxes, errorSection, submitButton);
  }

}

exports.TermsAuthEntry = TermsAuthEntry;
(0, _defineProperty2.default)(TermsAuthEntry, "LOGIN_TYPE", _interactiveAuth.AuthType.Terms);

class EmailIdentityAuthEntry extends _react.default.Component {
  constructor(props) {
    super(props);
    this.state = {
      requested: false,
      requesting: false
    };
  }

  componentDidMount() {
    this.props.onPhaseChange(DEFAULT_PHASE);
  }

  render() {
    let errorSection; // ignore the error when errcode is M_UNAUTHORIZED as we expect that error until the link is clicked.

    if (this.props.errorText && this.props.errorCode !== "M_UNAUTHORIZED") {
      errorSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "error",
        role: "alert"
      }, this.props.errorText);
    } // This component is now only displayed once the token has been requested,
    // so we know the email has been sent. It can also get loaded after the user
    // has clicked the validation link if the server takes a while to propagate
    // the validation internally. If we're in the session spawned from clicking
    // the validation link, we won't know the email address, so if we don't have it,
    // assume that the link has been clicked and the server will realise when we poll.
    // We only have a session ID if the user has clicked the link in their email,
    // so show a loading state instead of "an email has been sent to..." because
    // that's confusing when you've already read that email.


    if (this.props.inputs.emailAddress === undefined || this.props.stageState?.emailSid) {
      if (errorSection) {
        return errorSection;
      }

      return /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
    } else {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_InteractiveAuthEntryComponents_emailWrapper"
      }, /*#__PURE__*/_react.default.createElement(_AuthHeaderModifier.AuthHeaderModifier, {
        title: (0, _languageHandler._t)("Check your email to continue"),
        icon: /*#__PURE__*/_react.default.createElement("img", {
          src: _emailPrompt.default,
          alt: (0, _languageHandler._t)("Unread email icon"),
          width: 16
        }),
        hideServerPicker: true
      }), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("To create your account, open the link in the email we just sent to %(emailAddress)s.", {
        emailAddress: /*#__PURE__*/_react.default.createElement("b", null, this.props.inputs.emailAddress)
      })), this.state.requesting ? /*#__PURE__*/_react.default.createElement("p", {
        className: "secondary"
      }, (0, _languageHandler._t)("Did not receive it? <a>Resend it</a>", {}, {
        a: text => /*#__PURE__*/_react.default.createElement(_react.Fragment, null, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          kind: "link_inline",
          onClick: () => null,
          disabled: true
        }, text, " ", /*#__PURE__*/_react.default.createElement(_Spinner.default, {
          w: 14,
          h: 14
        })))
      })) : /*#__PURE__*/_react.default.createElement("p", {
        className: "secondary"
      }, (0, _languageHandler._t)("Did not receive it? <a>Resend it</a>", {}, {
        a: text => /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
          kind: "link_inline",
          title: this.state.requested ? (0, _languageHandler._t)("Resent!") : (0, _languageHandler._t)("Resend"),
          alignment: _Tooltip.Alignment.Right,
          tooltipClassName: "mx_Tooltip_noMargin",
          onHideTooltip: this.state.requested ? () => this.setState({
            requested: false
          }) : undefined,
          onClick: async () => {
            this.setState({
              requesting: true
            });

            try {
              await this.props.requestEmailToken?.();
            } catch (e) {
              _logger.logger.warn("Email token request failed: ", e);
            } finally {
              this.setState({
                requested: true,
                requesting: false
              });
            }
          }
        }, text)
      })), errorSection);
    }
  }

}

exports.EmailIdentityAuthEntry = EmailIdentityAuthEntry;
(0, _defineProperty2.default)(EmailIdentityAuthEntry, "LOGIN_TYPE", _interactiveAuth.AuthType.Email);

class MsisdnAuthEntry extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "submitUrl", void 0);
    (0, _defineProperty2.default)(this, "sid", void 0);
    (0, _defineProperty2.default)(this, "msisdn", void 0);
    (0, _defineProperty2.default)(this, "onTokenChange", e => {
      this.setState({
        token: e.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onFormSubmit", async e => {
      e.preventDefault();
      if (this.state.token == '') return;
      this.setState({
        errorText: null
      });

      try {
        let result;

        if (this.submitUrl) {
          result = await this.props.matrixClient.submitMsisdnTokenOtherUrl(this.submitUrl, this.sid, this.props.clientSecret, this.state.token);
        } else {
          throw new Error("The registration with MSISDN flow is misconfigured");
        }

        if (result.success) {
          const creds = {
            sid: this.sid,
            client_secret: this.props.clientSecret
          };
          this.props.submitAuthDict({
            type: _interactiveAuth.AuthType.Msisdn,
            // TODO: Remove `threepid_creds` once servers support proper UIA
            // See https://github.com/vector-im/element-web/issues/10312
            // See https://github.com/matrix-org/matrix-doc/issues/2220
            threepid_creds: creds,
            threepidCreds: creds
          });
        } else {
          this.setState({
            errorText: (0, _languageHandler._t)("Token incorrect")
          });
        }
      } catch (e) {
        this.props.fail(e);

        _logger.logger.log("Failed to submit msisdn token");
      }
    });
    this.state = {
      token: '',
      requestingToken: false,
      errorText: ''
    };
  }

  componentDidMount() {
    this.props.onPhaseChange(DEFAULT_PHASE);
    this.setState({
      requestingToken: true
    });
    this.requestMsisdnToken().catch(e => {
      this.props.fail(e);
    }).finally(() => {
      this.setState({
        requestingToken: false
      });
    });
  }
  /*
   * Requests a verification token by SMS.
   */


  requestMsisdnToken() {
    return this.props.matrixClient.requestRegisterMsisdnToken(this.props.inputs.phoneCountry, this.props.inputs.phoneNumber, this.props.clientSecret, 1 // TODO: Multiple send attempts?
    ).then(result => {
      this.submitUrl = result.submit_url;
      this.sid = result.sid;
      this.msisdn = result.msisdn;
    });
  }

  render() {
    if (this.state.requestingToken) {
      return /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
    } else {
      const enableSubmit = Boolean(this.state.token);
      const submitClasses = (0, _classnames.default)({
        mx_InteractiveAuthEntryComponents_msisdnSubmit: true,
        mx_GeneralButton: true
      });
      let errorSection;

      if (this.state.errorText) {
        errorSection = /*#__PURE__*/_react.default.createElement("div", {
          className: "error",
          role: "alert"
        }, this.state.errorText);
      }

      return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("A text message has been sent to %(msisdn)s", {
        msisdn: /*#__PURE__*/_react.default.createElement("i", null, this.msisdn)
      })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Please enter the code it contains:")), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_InteractiveAuthEntryComponents_msisdnWrapper"
      }, /*#__PURE__*/_react.default.createElement("form", {
        onSubmit: this.onFormSubmit
      }, /*#__PURE__*/_react.default.createElement("input", {
        type: "text",
        className: "mx_InteractiveAuthEntryComponents_msisdnEntry",
        value: this.state.token,
        onChange: this.onTokenChange,
        "aria-label": (0, _languageHandler._t)("Code")
      }), /*#__PURE__*/_react.default.createElement("br", null), /*#__PURE__*/_react.default.createElement("input", {
        type: "submit",
        value: (0, _languageHandler._t)("Submit"),
        className: submitClasses,
        disabled: !enableSubmit
      })), errorSection));
    }
  }

}

exports.MsisdnAuthEntry = MsisdnAuthEntry;
(0, _defineProperty2.default)(MsisdnAuthEntry, "LOGIN_TYPE", _interactiveAuth.AuthType.Msisdn);

class SSOAuthEntry extends _react.default.Component {
  // button to start SSO
  // button to confirm SSO completed
  constructor(props) {
    super(props); // We actually send the user through fallback auth so we don't have to
    // deal with a redirect back to us, losing application context.

    (0, _defineProperty2.default)(this, "ssoUrl", void 0);
    (0, _defineProperty2.default)(this, "popupWindow", void 0);
    (0, _defineProperty2.default)(this, "attemptFailed", () => {
      this.setState({
        attemptFailed: true
      });
    });
    (0, _defineProperty2.default)(this, "onReceiveMessage", event => {
      if (event.data === "authDone" && event.origin === this.props.matrixClient.getHomeserverUrl()) {
        if (this.popupWindow) {
          this.popupWindow.close();
          this.popupWindow = null;
        }
      }
    });
    (0, _defineProperty2.default)(this, "onStartAuthClick", () => {
      // Note: We don't use PlatformPeg's startSsoAuth functions because we almost
      // certainly will need to open the thing in a new tab to avoid losing application
      // context.
      this.popupWindow = window.open(this.ssoUrl, "_blank");
      this.setState({
        phase: SSOAuthEntry.PHASE_POSTAUTH
      });
      this.props.onPhaseChange(SSOAuthEntry.PHASE_POSTAUTH);
    });
    (0, _defineProperty2.default)(this, "onConfirmClick", () => {
      this.props.submitAuthDict({});
    });
    this.ssoUrl = props.matrixClient.getFallbackAuthUrl(this.props.loginType, this.props.authSessionId);
    this.popupWindow = null;
    window.addEventListener("message", this.onReceiveMessage);
    this.state = {
      phase: SSOAuthEntry.PHASE_PREAUTH,
      attemptFailed: false
    };
  }

  componentDidMount() {
    this.props.onPhaseChange(SSOAuthEntry.PHASE_PREAUTH);
  }

  componentWillUnmount() {
    window.removeEventListener("message", this.onReceiveMessage);

    if (this.popupWindow) {
      this.popupWindow.close();
      this.popupWindow = null;
    }
  }

  render() {
    let continueButton = null;

    const cancelButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this.props.onCancel,
      kind: this.props.continueKind ? this.props.continueKind + '_outline' : 'primary_outline'
    }, (0, _languageHandler._t)("Cancel"));

    if (this.state.phase === SSOAuthEntry.PHASE_PREAUTH) {
      continueButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.onStartAuthClick,
        kind: this.props.continueKind || 'primary'
      }, this.props.continueText || (0, _languageHandler._t)("Single Sign On"));
    } else {
      continueButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.onConfirmClick,
        kind: this.props.continueKind || 'primary'
      }, this.props.continueText || (0, _languageHandler._t)("Confirm"));
    }

    let errorSection;

    if (this.props.errorText) {
      errorSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "error",
        role: "alert"
      }, this.props.errorText);
    } else if (this.state.attemptFailed) {
      errorSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "error",
        role: "alert"
      }, (0, _languageHandler._t)("Something went wrong in confirming your identity. Cancel and try again."));
    }

    return /*#__PURE__*/_react.default.createElement(_react.Fragment, null, errorSection, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_InteractiveAuthEntryComponents_sso_buttons"
    }, cancelButton, continueButton));
  }

}

exports.SSOAuthEntry = SSOAuthEntry;
(0, _defineProperty2.default)(SSOAuthEntry, "LOGIN_TYPE", _interactiveAuth.AuthType.Sso);
(0, _defineProperty2.default)(SSOAuthEntry, "UNSTABLE_LOGIN_TYPE", _interactiveAuth.AuthType.SsoUnstable);
(0, _defineProperty2.default)(SSOAuthEntry, "PHASE_PREAUTH", 1);
(0, _defineProperty2.default)(SSOAuthEntry, "PHASE_POSTAUTH", 2);

class FallbackAuthEntry extends _react.default.Component {
  constructor(props) {
    super(props); // we have to make the user click a button, as browsers will block
    // the popup if we open it immediately.

    (0, _defineProperty2.default)(this, "popupWindow", void 0);
    (0, _defineProperty2.default)(this, "fallbackButton", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "focus", () => {
      if (this.fallbackButton.current) {
        this.fallbackButton.current.focus();
      }
    });
    (0, _defineProperty2.default)(this, "onShowFallbackClick", e => {
      e.preventDefault();
      e.stopPropagation();
      const url = this.props.matrixClient.getFallbackAuthUrl(this.props.loginType, this.props.authSessionId);
      this.popupWindow = window.open(url, "_blank");
    });
    (0, _defineProperty2.default)(this, "onReceiveMessage", event => {
      if (event.data === "authDone" && event.origin === this.props.matrixClient.getHomeserverUrl()) {
        this.props.submitAuthDict({});
      }
    });
    this.popupWindow = null;
    window.addEventListener("message", this.onReceiveMessage);
  }

  componentDidMount() {
    this.props.onPhaseChange(DEFAULT_PHASE);
  }

  componentWillUnmount() {
    window.removeEventListener("message", this.onReceiveMessage);

    if (this.popupWindow) {
      this.popupWindow.close();
    }
  }

  render() {
    let errorSection;

    if (this.props.errorText) {
      errorSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "error",
        role: "alert"
      }, this.props.errorText);
    }

    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "link",
      inputRef: this.fallbackButton,
      onClick: this.onShowFallbackClick
    }, (0, _languageHandler._t)("Start authentication")), errorSection);
  }

}

exports.FallbackAuthEntry = FallbackAuthEntry;

function getEntryComponentForLoginType(loginType) {
  switch (loginType) {
    case _interactiveAuth.AuthType.Password:
      return PasswordAuthEntry;

    case _interactiveAuth.AuthType.Recaptcha:
      return RecaptchaAuthEntry;

    case _interactiveAuth.AuthType.Email:
      return EmailIdentityAuthEntry;

    case _interactiveAuth.AuthType.Msisdn:
      return MsisdnAuthEntry;

    case _interactiveAuth.AuthType.Terms:
      return TermsAuthEntry;

    case _interactiveAuth.AuthType.Sso:
    case _interactiveAuth.AuthType.SsoUnstable:
      return SSOAuthEntry;

    default:
      return FallbackAuthEntry;
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJERUZBVUxUX1BIQVNFIiwiUGFzc3dvcmRBdXRoRW50cnkiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJlIiwicHJldmVudERlZmF1bHQiLCJidXN5Iiwic3VibWl0QXV0aERpY3QiLCJ0eXBlIiwiQXV0aFR5cGUiLCJQYXNzd29yZCIsInVzZXIiLCJtYXRyaXhDbGllbnQiLCJjcmVkZW50aWFscyIsInVzZXJJZCIsImlkZW50aWZpZXIiLCJwYXNzd29yZCIsInN0YXRlIiwiZXYiLCJzZXRTdGF0ZSIsInRhcmdldCIsInZhbHVlIiwiY29tcG9uZW50RGlkTW91bnQiLCJvblBoYXNlQ2hhbmdlIiwicmVuZGVyIiwicGFzc3dvcmRCb3hDbGFzcyIsImNsYXNzTmFtZXMiLCJlcnJvclRleHQiLCJzdWJtaXRCdXR0b25PclNwaW5uZXIiLCJfdCIsImVycm9yU2VjdGlvbiIsIm9uU3VibWl0Iiwib25QYXNzd29yZEZpZWxkQ2hhbmdlIiwiUmVjYXB0Y2hhQXV0aEVudHJ5IiwicmVzcG9uc2UiLCJSZWNhcHRjaGEiLCJzaXRlUHVibGljS2V5Iiwic3RhZ2VQYXJhbXMiLCJwdWJsaWNfa2V5Iiwib25DYXB0Y2hhUmVzcG9uc2UiLCJUZXJtc0F1dGhFbnRyeSIsImFsbENoZWNrZWQiLCJwb2xpY3kiLCJwb2xpY2llcyIsImNoZWNrZWQiLCJ0b2dnbGVkUG9saWNpZXMiLCJpZCIsIlRlcm1zIiwiYWxsUG9saWNpZXMiLCJwcmVmTGFuZyIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsImluaXRUb2dnbGVzIiwicGlja2VkUG9saWNpZXMiLCJwb2xpY3lJZCIsIk9iamVjdCIsImtleXMiLCJsYW5nUG9saWN5IiwiZmlyc3RMYW5nIiwiZmluZCIsIkVycm9yIiwicHVzaCIsIm5hbWUiLCJ1cmwiLCJ0b2dnbGVQb2xpY3kiLCJuZXdUb2dnbGVzIiwiY2hlY2tib3hlcyIsInN1Ym1pdEJ1dHRvbiIsInNob3dDb250aW51ZSIsInRyeVN1Ym1pdCIsIkVtYWlsSWRlbnRpdHlBdXRoRW50cnkiLCJyZXF1ZXN0ZWQiLCJyZXF1ZXN0aW5nIiwiZXJyb3JDb2RlIiwiaW5wdXRzIiwiZW1haWxBZGRyZXNzIiwidW5kZWZpbmVkIiwic3RhZ2VTdGF0ZSIsImVtYWlsU2lkIiwiRW1haWxQcm9tcHRJY29uIiwiYSIsInRleHQiLCJBbGlnbm1lbnQiLCJSaWdodCIsInJlcXVlc3RFbWFpbFRva2VuIiwibG9nZ2VyIiwid2FybiIsIkVtYWlsIiwiTXNpc2RuQXV0aEVudHJ5IiwidG9rZW4iLCJyZXN1bHQiLCJzdWJtaXRVcmwiLCJzdWJtaXRNc2lzZG5Ub2tlbk90aGVyVXJsIiwic2lkIiwiY2xpZW50U2VjcmV0Iiwic3VjY2VzcyIsImNyZWRzIiwiY2xpZW50X3NlY3JldCIsIk1zaXNkbiIsInRocmVlcGlkX2NyZWRzIiwidGhyZWVwaWRDcmVkcyIsImZhaWwiLCJsb2ciLCJyZXF1ZXN0aW5nVG9rZW4iLCJyZXF1ZXN0TXNpc2RuVG9rZW4iLCJjYXRjaCIsImZpbmFsbHkiLCJyZXF1ZXN0UmVnaXN0ZXJNc2lzZG5Ub2tlbiIsInBob25lQ291bnRyeSIsInBob25lTnVtYmVyIiwidGhlbiIsInN1Ym1pdF91cmwiLCJtc2lzZG4iLCJlbmFibGVTdWJtaXQiLCJCb29sZWFuIiwic3VibWl0Q2xhc3NlcyIsIm14X0ludGVyYWN0aXZlQXV0aEVudHJ5Q29tcG9uZW50c19tc2lzZG5TdWJtaXQiLCJteF9HZW5lcmFsQnV0dG9uIiwib25Gb3JtU3VibWl0Iiwib25Ub2tlbkNoYW5nZSIsIlNTT0F1dGhFbnRyeSIsImF0dGVtcHRGYWlsZWQiLCJldmVudCIsImRhdGEiLCJvcmlnaW4iLCJnZXRIb21lc2VydmVyVXJsIiwicG9wdXBXaW5kb3ciLCJjbG9zZSIsIndpbmRvdyIsIm9wZW4iLCJzc29VcmwiLCJwaGFzZSIsIlBIQVNFX1BPU1RBVVRIIiwiZ2V0RmFsbGJhY2tBdXRoVXJsIiwibG9naW5UeXBlIiwiYXV0aFNlc3Npb25JZCIsImFkZEV2ZW50TGlzdGVuZXIiLCJvblJlY2VpdmVNZXNzYWdlIiwiUEhBU0VfUFJFQVVUSCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImNvbnRpbnVlQnV0dG9uIiwiY2FuY2VsQnV0dG9uIiwib25DYW5jZWwiLCJjb250aW51ZUtpbmQiLCJvblN0YXJ0QXV0aENsaWNrIiwiY29udGludWVUZXh0Iiwib25Db25maXJtQ2xpY2siLCJTc28iLCJTc29VbnN0YWJsZSIsIkZhbGxiYWNrQXV0aEVudHJ5IiwiY3JlYXRlUmVmIiwiZmFsbGJhY2tCdXR0b24iLCJjdXJyZW50IiwiZm9jdXMiLCJzdG9wUHJvcGFnYXRpb24iLCJvblNob3dGYWxsYmFja0NsaWNrIiwiZ2V0RW50cnlDb21wb25lbnRGb3JMb2dpblR5cGUiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9hdXRoL0ludGVyYWN0aXZlQXV0aEVudHJ5Q29tcG9uZW50cy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE2LTIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCB7IE1hdHJpeENsaWVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jbGllbnRcIjtcbmltcG9ydCB7IEF1dGhUeXBlLCBJQXV0aERpY3QsIElJbnB1dHMsIElTdGFnZVN0YXR1cyB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL2ludGVyYWN0aXZlLWF1dGgnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuaW1wb3J0IFJlYWN0LCB7IENoYW5nZUV2ZW50LCBjcmVhdGVSZWYsIEZvcm1FdmVudCwgRnJhZ21lbnQsIE1vdXNlRXZlbnQgfSBmcm9tICdyZWFjdCc7XG5cbmltcG9ydCBFbWFpbFByb21wdEljb24gZnJvbSAnLi4vLi4vLi4vLi4vcmVzL2ltZy9lbGVtZW50LWljb25zL2VtYWlsLXByb21wdC5zdmcnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7IExvY2FsaXNlZFBvbGljeSwgUG9saWNpZXMgfSBmcm9tICcuLi8uLi8uLi9UZXJtcyc7XG5pbXBvcnQgeyBBdXRoSGVhZGVyTW9kaWZpZXIgfSBmcm9tIFwiLi4vLi4vc3RydWN0dXJlcy9hdXRoL2hlYWRlci9BdXRoSGVhZGVyTW9kaWZpZXJcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVUb29sdGlwQnV0dG9uXCI7XG5pbXBvcnQgRmllbGQgZnJvbSAnLi4vZWxlbWVudHMvRmllbGQnO1xuaW1wb3J0IFNwaW5uZXIgZnJvbSBcIi4uL2VsZW1lbnRzL1NwaW5uZXJcIjtcbmltcG9ydCB7IEFsaWdubWVudCB9IGZyb20gXCIuLi9lbGVtZW50cy9Ub29sdGlwXCI7XG5pbXBvcnQgQ2FwdGNoYUZvcm0gZnJvbSBcIi4vQ2FwdGNoYUZvcm1cIjtcblxuLyogVGhpcyBmaWxlIGNvbnRhaW5zIGEgY29sbGVjdGlvbiBvZiBjb21wb25lbnRzIHdoaWNoIGFyZSB1c2VkIGJ5IHRoZVxuICogSW50ZXJhY3RpdmVBdXRoIHRvIHByb21wdCB0aGUgdXNlciB0byBlbnRlciB0aGUgaW5mb3JtYXRpb24gbmVlZGVkXG4gKiBmb3IgYW4gYXV0aCBzdGFnZS4gKFRoZSBpbnRlbnRpb24gaXMgdGhhdCB0aGV5IGNvdWxkIGFsc28gYmUgdXNlZCBmb3Igb3RoZXJcbiAqIGNvbXBvbmVudHMsIHN1Y2ggYXMgdGhlIHJlZ2lzdHJhdGlvbiBmbG93KS5cbiAqXG4gKiBDYWxsIGdldEVudHJ5Q29tcG9uZW50Rm9yTG9naW5UeXBlKCkgdG8gZ2V0IGEgY29tcG9uZW50IHN1aXRhYmxlIGZvciBhXG4gKiBwYXJ0aWN1bGFyIGxvZ2luIHR5cGUuIEVhY2ggY29tcG9uZW50IHJlcXVpcmVzIHRoZSBzYW1lIHByb3BlcnRpZXM6XG4gKlxuICogbWF0cml4Q2xpZW50OiAgICAgICAgICAgQSBtYXRyaXggY2xpZW50LiBNYXkgYmUgYSBkaWZmZXJlbnQgb25lIHRvIHRoZSBvbmVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRseSBiZWluZyB1c2VkIGdlbmVyYWxseSAoZWcuIHRvIHJlZ2lzdGVyIHdpdGhcbiAqICAgICAgICAgICAgICAgICAgICAgICAgIG9uZSBIUyB3aGlsc3QgYmVpbmcgYSBndWVzdCBvbiBhbm90aGVyKS5cbiAqIGxvZ2luVHlwZTogICAgICAgICAgICAgIHRoZSBsb2dpbiB0eXBlIG9mIHRoZSBhdXRoIHN0YWdlIGJlaW5nIGF0dGVtcHRlZFxuICogYXV0aFNlc3Npb25JZDogICAgICAgICAgc2Vzc2lvbiBpZCBmcm9tIHRoZSBzZXJ2ZXJcbiAqIGNsaWVudFNlY3JldDogICAgICAgICAgIFRoZSBjbGllbnQgc2VjcmV0IGluIHVzZSBmb3IgaWRlbnRpdHkgc2VydmVyIGF1dGggc2Vzc2lvbnNcbiAqIHN0YWdlUGFyYW1zOiAgICAgICAgICAgIHBhcmFtcyBmcm9tIHRoZSBzZXJ2ZXIgZm9yIHRoZSBzdGFnZSBiZWluZyBhdHRlbXB0ZWRcbiAqIGVycm9yVGV4dDogICAgICAgICAgICAgIGVycm9yIG1lc3NhZ2UgZnJvbSBhIHByZXZpb3VzIGF0dGVtcHQgdG8gYXV0aGVudGljYXRlXG4gKiBzdWJtaXRBdXRoRGljdDogICAgICAgICBhIGZ1bmN0aW9uIHdoaWNoIHdpbGwgYmUgY2FsbGVkIHdpdGggdGhlIG5ldyBhdXRoIGRpY3RcbiAqIGJ1c3k6ICAgICAgICAgICAgICAgICAgIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIGF1dGggbG9naWMgaXMgZG9pbmcgc29tZXRoaW5nXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgdXNlciBuZWVkcyB0byB3YWl0IGZvci5cbiAqIGlucHV0czogICAgICAgICAgICAgICAgIE9iamVjdCBvZiBpbnB1dHMgcHJvdmlkZWQgYnkgdGhlIHVzZXIsIGFzIGluIGpzLXNka1xuICogICAgICAgICAgICAgICAgICAgICAgICAgaW50ZXJhY3RpdmUtYXV0aFxuICogc3RhZ2VTdGF0ZTogICAgICAgICAgICAgU3RhZ2Utc3BlY2lmaWMgb2JqZWN0IHVzZWQgZm9yIGNvbW11bmljYXRpbmcgc3RhdGUgaW5mb3JtYXRpb25cbiAqICAgICAgICAgICAgICAgICAgICAgICAgIHRvIHRoZSBVSSBmcm9tIHRoZSBzdGF0ZS1zcGVjaWZpYyBhdXRoIGxvZ2ljLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgRGVmaW5lZCBrZXlzIGZvciBzdGFnZXMgYXJlOlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0ubG9naW4uZW1haWwuaWRlbnRpdHk6XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICogZW1haWxTaWQ6IHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHNpZCBvZiB0aGUgYWN0aXZlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZlcmlmaWNhdGlvbiBzZXNzaW9uIGZyb20gdGhlIGlkZW50aXR5IHNlcnZlcixcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3IgbnVsbCBpZiBubyBzZXNzaW9uIGlzIGFjdGl2ZS5cbiAqIGZhaWw6ICAgICAgICAgICAgICAgICAgIGEgZnVuY3Rpb24gd2hpY2ggc2hvdWxkIGJlIGNhbGxlZCB3aXRoIGFuIGVycm9yIG9iamVjdCBpZiBhblxuICogICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3Igb2NjdXJyZWQgZHVyaW5nIHRoZSBhdXRoIHN0YWdlLiBUaGlzIHdpbGwgY2F1c2UgdGhlIGF1dGhcbiAqICAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb24gdG8gYmUgZmFpbGVkIGFuZCB0aGUgcHJvY2VzcyB0byBnbyBiYWNrIHRvIHRoZSBzdGFydC5cbiAqIHNldEVtYWlsU2lkOiAgICAgICAgICAgIG0ubG9naW4uZW1haWwuaWRlbnRpdHkgb25seTogYSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2l0aCB0aGVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgIGVtYWlsIHNpZCBhZnRlciBhIHRva2VuIGlzIHJlcXVlc3RlZC5cbiAqIG9uUGhhc2VDaGFuZ2U6ICAgICAgICAgIEEgZnVuY3Rpb24gd2hpY2ggaXMgY2FsbGVkIHdoZW4gdGhlIHN0YWdlJ3MgcGhhc2UgY2hhbmdlcy4gSWZcbiAqICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSBzdGFnZSBoYXMgbm8gcGhhc2VzLCBjYWxsIHRoaXMgd2l0aCBERUZBVUxUX1BIQVNFLiBUYWtlc1xuICogICAgICAgICAgICAgICAgICAgICAgICAgb25lIGFyZ3VtZW50LCB0aGUgcGhhc2UsIGFuZCBpcyBhbHdheXMgZGVmaW5lZC9yZXF1aXJlZC5cbiAqIGNvbnRpbnVlVGV4dDogICAgICAgICAgIEZvciBzdGFnZXMgd2hpY2ggaGF2ZSBhIGNvbnRpbnVlIGJ1dHRvbiwgdGhlIHRleHQgdG8gdXNlLlxuICogY29udGludWVLaW5kOiAgICAgICAgICAgRm9yIHN0YWdlcyB3aGljaCBoYXZlIGEgY29udGludWUgYnV0dG9uLCB0aGUgc3R5bGUgb2YgYnV0dG9uIHRvXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICB1c2UuIEZvciBleGFtcGxlLCAnZGFuZ2VyJyBvciAncHJpbWFyeScuXG4gKiBvbkNhbmNlbCAgICAgICAgICAgICAgICBBIGZ1bmN0aW9uIHdpdGggbm8gYXJndW1lbnRzIHdoaWNoIGlzIGNhbGxlZCBieSB0aGUgc3RhZ2UgaWYgdGhlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyIGtub3dpbmdseSBjYW5jZWxsZWQvZGlzbWlzc2VkIHRoZSBhdXRoZW50aWNhdGlvbiBhdHRlbXB0LlxuICpcbiAqIEVhY2ggY29tcG9uZW50IG1heSBhbHNvIHByb3ZpZGUgdGhlIGZvbGxvd2luZyBmdW5jdGlvbnMgKGJleW9uZCB0aGUgc3RhbmRhcmQgUmVhY3Qgb25lcyk6XG4gKiAgICBmb2N1czogc2V0IHRoZSBpbnB1dCBmb2N1cyBhcHByb3ByaWF0ZWx5IGluIHRoZSBmb3JtLlxuICovXG5cbmV4cG9ydCBjb25zdCBERUZBVUxUX1BIQVNFID0gMDtcblxuaW50ZXJmYWNlIElBdXRoRW50cnlQcm9wcyB7XG4gICAgbWF0cml4Q2xpZW50OiBNYXRyaXhDbGllbnQ7XG4gICAgbG9naW5UeXBlOiBzdHJpbmc7XG4gICAgYXV0aFNlc3Npb25JZDogc3RyaW5nO1xuICAgIGVycm9yVGV4dD86IHN0cmluZztcbiAgICBlcnJvckNvZGU/OiBzdHJpbmc7XG4gICAgLy8gSXMgdGhlIGF1dGggbG9naWMgY3VycmVudGx5IHdhaXRpbmcgZm9yIHNvbWV0aGluZyB0byBoYXBwZW4/XG4gICAgYnVzeT86IGJvb2xlYW47XG4gICAgb25QaGFzZUNoYW5nZTogKHBoYXNlOiBudW1iZXIpID0+IHZvaWQ7XG4gICAgc3VibWl0QXV0aERpY3Q6IChhdXRoOiBJQXV0aERpY3QpID0+IHZvaWQ7XG4gICAgcmVxdWVzdEVtYWlsVG9rZW4/OiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xufVxuXG5pbnRlcmZhY2UgSVBhc3N3b3JkQXV0aEVudHJ5U3RhdGUge1xuICAgIHBhc3N3b3JkOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBQYXNzd29yZEF1dGhFbnRyeSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJQXV0aEVudHJ5UHJvcHMsIElQYXNzd29yZEF1dGhFbnRyeVN0YXRlPiB7XG4gICAgc3RhdGljIExPR0lOX1RZUEUgPSBBdXRoVHlwZS5QYXNzd29yZDtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgcGFzc3dvcmQ6IFwiXCIsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25QaGFzZUNoYW5nZShERUZBVUxUX1BIQVNFKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uU3VibWl0ID0gKGU6IEZvcm1FdmVudCkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmJ1c3kpIHJldHVybjtcblxuICAgICAgICB0aGlzLnByb3BzLnN1Ym1pdEF1dGhEaWN0KHtcbiAgICAgICAgICAgIHR5cGU6IEF1dGhUeXBlLlBhc3N3b3JkLFxuICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGB1c2VyYCBvbmNlIHNlcnZlcnMgc3VwcG9ydCBwcm9wZXIgVUlBXG4gICAgICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTAzMTJcbiAgICAgICAgICAgIHVzZXI6IHRoaXMucHJvcHMubWF0cml4Q2xpZW50LmNyZWRlbnRpYWxzLnVzZXJJZCxcbiAgICAgICAgICAgIGlkZW50aWZpZXI6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcIm0uaWQudXNlclwiLFxuICAgICAgICAgICAgICAgIHVzZXI6IHRoaXMucHJvcHMubWF0cml4Q2xpZW50LmNyZWRlbnRpYWxzLnVzZXJJZCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXNzd29yZDogdGhpcy5zdGF0ZS5wYXNzd29yZCxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25QYXNzd29yZEZpZWxkQ2hhbmdlID0gKGV2OiBDaGFuZ2VFdmVudDxIVE1MSW5wdXRFbGVtZW50PikgPT4ge1xuICAgICAgICAvLyBlbmFibGUgdGhlIHN1Ym1pdCBidXR0b24gaWZmIHRoZSBwYXNzd29yZCBpcyBub24tZW1wdHlcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwYXNzd29yZDogZXYudGFyZ2V0LnZhbHVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBwYXNzd29yZEJveENsYXNzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICBcImVycm9yXCI6IHRoaXMucHJvcHMuZXJyb3JUZXh0LFxuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgc3VibWl0QnV0dG9uT3JTcGlubmVyO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5idXN5KSB7XG4gICAgICAgICAgICBzdWJtaXRCdXR0b25PclNwaW5uZXIgPSA8U3Bpbm5lciAvPjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1Ym1pdEJ1dHRvbk9yU3Bpbm5lciA9IChcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInN1Ym1pdFwiXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0RpYWxvZ19wcmltYXJ5XCJcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyF0aGlzLnN0YXRlLnBhc3N3b3JkfVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17X3QoXCJDb250aW51ZVwiKX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBlcnJvclNlY3Rpb247XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmVycm9yVGV4dCkge1xuICAgICAgICAgICAgZXJyb3JTZWN0aW9uID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZXJyb3JcIiByb2xlPVwiYWxlcnRcIj5cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLmVycm9yVGV4dCB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPHA+eyBfdChcIkNvbmZpcm0geW91ciBpZGVudGl0eSBieSBlbnRlcmluZyB5b3VyIGFjY291bnQgcGFzc3dvcmQgYmVsb3cuXCIpIH08L3A+XG4gICAgICAgICAgICAgICAgPGZvcm0gb25TdWJtaXQ9e3RoaXMub25TdWJtaXR9IGNsYXNzTmFtZT1cIm14X0ludGVyYWN0aXZlQXV0aEVudHJ5Q29tcG9uZW50c19wYXNzd29yZFNlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3Bhc3N3b3JkQm94Q2xhc3N9XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwicGFzc3dvcmRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZT1cInBhc3N3b3JkRmllbGRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KCdQYXNzd29yZCcpfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0ZvY3VzPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUucGFzc3dvcmR9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblBhc3N3b3JkRmllbGRDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIHsgZXJyb3JTZWN0aW9uIH1cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9idXR0b25fcm93XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN1Ym1pdEJ1dHRvbk9yU3Bpbm5lciB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cblxuLyogZXNsaW50LWRpc2FibGUgY2FtZWxjYXNlICovXG5pbnRlcmZhY2UgSVJlY2FwdGNoYUF1dGhFbnRyeVByb3BzIGV4dGVuZHMgSUF1dGhFbnRyeVByb3BzIHtcbiAgICBzdGFnZVBhcmFtcz86IHtcbiAgICAgICAgcHVibGljX2tleT86IHN0cmluZztcbiAgICB9O1xufVxuLyogZXNsaW50LWVuYWJsZSBjYW1lbGNhc2UgKi9cblxuZXhwb3J0IGNsYXNzIFJlY2FwdGNoYUF1dGhFbnRyeSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUmVjYXB0Y2hhQXV0aEVudHJ5UHJvcHM+IHtcbiAgICBzdGF0aWMgTE9HSU5fVFlQRSA9IEF1dGhUeXBlLlJlY2FwdGNoYTtcblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLnByb3BzLm9uUGhhc2VDaGFuZ2UoREVGQVVMVF9QSEFTRSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkNhcHRjaGFSZXNwb25zZSA9IChyZXNwb25zZTogc3RyaW5nKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMuc3VibWl0QXV0aERpY3Qoe1xuICAgICAgICAgICAgdHlwZTogQXV0aFR5cGUuUmVjYXB0Y2hhLFxuICAgICAgICAgICAgcmVzcG9uc2U6IHJlc3BvbnNlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5idXN5KSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxTcGlubmVyIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGVycm9yVGV4dCA9IHRoaXMucHJvcHMuZXJyb3JUZXh0O1xuXG4gICAgICAgIGxldCBzaXRlUHVibGljS2V5O1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMuc3RhZ2VQYXJhbXMgfHwgIXRoaXMucHJvcHMuc3RhZ2VQYXJhbXMucHVibGljX2tleSkge1xuICAgICAgICAgICAgZXJyb3JUZXh0ID0gX3QoXG4gICAgICAgICAgICAgICAgXCJNaXNzaW5nIGNhcHRjaGEgcHVibGljIGtleSBpbiBob21lc2VydmVyIGNvbmZpZ3VyYXRpb24uIFBsZWFzZSByZXBvcnQgXCIgK1xuICAgICAgICAgICAgICAgIFwidGhpcyB0byB5b3VyIGhvbWVzZXJ2ZXIgYWRtaW5pc3RyYXRvci5cIixcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaXRlUHVibGljS2V5ID0gdGhpcy5wcm9wcy5zdGFnZVBhcmFtcy5wdWJsaWNfa2V5O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGVycm9yU2VjdGlvbjtcbiAgICAgICAgaWYgKGVycm9yVGV4dCkge1xuICAgICAgICAgICAgZXJyb3JTZWN0aW9uID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZXJyb3JcIiByb2xlPVwiYWxlcnRcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBlcnJvclRleHQgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxDYXB0Y2hhRm9ybSBzaXRlUHVibGljS2V5PXtzaXRlUHVibGljS2V5fVxuICAgICAgICAgICAgICAgICAgICBvbkNhcHRjaGFSZXNwb25zZT17dGhpcy5vbkNhcHRjaGFSZXNwb25zZX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIHsgZXJyb3JTZWN0aW9uIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cblxuaW50ZXJmYWNlIElUZXJtc0F1dGhFbnRyeVByb3BzIGV4dGVuZHMgSUF1dGhFbnRyeVByb3BzIHtcbiAgICBzdGFnZVBhcmFtcz86IHtcbiAgICAgICAgcG9saWNpZXM/OiBQb2xpY2llcztcbiAgICB9O1xuICAgIHNob3dDb250aW51ZTogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIExvY2FsaXNlZFBvbGljeVdpdGhJZCBleHRlbmRzIExvY2FsaXNlZFBvbGljeSB7XG4gICAgaWQ6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIElUZXJtc0F1dGhFbnRyeVN0YXRlIHtcbiAgICBwb2xpY2llczogTG9jYWxpc2VkUG9saWN5V2l0aElkW107XG4gICAgdG9nZ2xlZFBvbGljaWVzOiB7XG4gICAgICAgIFtwb2xpY3k6IHN0cmluZ106IGJvb2xlYW47XG4gICAgfTtcbiAgICBlcnJvclRleHQ/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBUZXJtc0F1dGhFbnRyeSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJVGVybXNBdXRoRW50cnlQcm9wcywgSVRlcm1zQXV0aEVudHJ5U3RhdGU+IHtcbiAgICBzdGF0aWMgTE9HSU5fVFlQRSA9IEF1dGhUeXBlLlRlcm1zO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIC8vIGV4YW1wbGUgc3RhZ2VQYXJhbXM6XG4gICAgICAgIC8vXG4gICAgICAgIC8vIHtcbiAgICAgICAgLy8gICAgIFwicG9saWNpZXNcIjoge1xuICAgICAgICAvLyAgICAgICAgIFwicHJpdmFjeV9wb2xpY3lcIjoge1xuICAgICAgICAvLyAgICAgICAgICAgICBcInZlcnNpb25cIjogXCIxLjBcIixcbiAgICAgICAgLy8gICAgICAgICAgICAgXCJlblwiOiB7XG4gICAgICAgIC8vICAgICAgICAgICAgICAgICBcIm5hbWVcIjogXCJQcml2YWN5IFBvbGljeVwiLFxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgXCJ1cmxcIjogXCJodHRwczovL2V4YW1wbGUub3JnL3ByaXZhY3ktMS4wLWVuLmh0bWxcIixcbiAgICAgICAgLy8gICAgICAgICAgICAgfSxcbiAgICAgICAgLy8gICAgICAgICAgICAgXCJmclwiOiB7XG4gICAgICAgIC8vICAgICAgICAgICAgICAgICBcIm5hbWVcIjogXCJQb2xpdGlxdWUgZGUgY29uZmlkZW50aWFsaXTDqVwiLFxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgXCJ1cmxcIjogXCJodHRwczovL2V4YW1wbGUub3JnL3ByaXZhY3ktMS4wLWZyLmh0bWxcIixcbiAgICAgICAgLy8gICAgICAgICAgICAgfSxcbiAgICAgICAgLy8gICAgICAgICB9LFxuICAgICAgICAvLyAgICAgICAgIFwib3RoZXJfcG9saWN5XCI6IHsgLi4uIH0sXG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vIH1cblxuICAgICAgICBjb25zdCBhbGxQb2xpY2llcyA9IHRoaXMucHJvcHMuc3RhZ2VQYXJhbXMucG9saWNpZXMgfHwge307XG4gICAgICAgIGNvbnN0IHByZWZMYW5nID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImxhbmd1YWdlXCIpO1xuICAgICAgICBjb25zdCBpbml0VG9nZ2xlcyA9IHt9O1xuICAgICAgICBjb25zdCBwaWNrZWRQb2xpY2llcyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IHBvbGljeUlkIG9mIE9iamVjdC5rZXlzKGFsbFBvbGljaWVzKSkge1xuICAgICAgICAgICAgY29uc3QgcG9saWN5ID0gYWxsUG9saWNpZXNbcG9saWN5SWRdO1xuXG4gICAgICAgICAgICAvLyBQaWNrIGEgbGFuZ3VhZ2UgYmFzZWQgb24gdGhlIHVzZXIncyBsYW5ndWFnZSwgZmFsbGluZyBiYWNrIHRvIGVuZ2xpc2gsXG4gICAgICAgICAgICAvLyBhbmQgZmluYWxseSB0byB0aGUgZmlyc3QgbGFuZ3VhZ2UgYXZhaWxhYmxlLiBJZiB0aGVyZSdzIHN0aWxsIG5vIHBvbGljeVxuICAgICAgICAgICAgLy8gYXZhaWxhYmxlIHRoZW4gdGhlIGhvbWVzZXJ2ZXIgaXNuJ3QgcmVzcGVjdGluZyB0aGUgc3BlYy5cbiAgICAgICAgICAgIGxldCBsYW5nUG9saWN5ID0gcG9saWN5W3ByZWZMYW5nXTtcbiAgICAgICAgICAgIGlmICghbGFuZ1BvbGljeSkgbGFuZ1BvbGljeSA9IHBvbGljeVtcImVuXCJdO1xuICAgICAgICAgICAgaWYgKCFsYW5nUG9saWN5KSB7XG4gICAgICAgICAgICAgICAgLy8gbGFzdCByZXNvcnRcbiAgICAgICAgICAgICAgICBjb25zdCBmaXJzdExhbmcgPSBPYmplY3Qua2V5cyhwb2xpY3kpLmZpbmQoZSA9PiBlICE9PSBcInZlcnNpb25cIik7XG4gICAgICAgICAgICAgICAgbGFuZ1BvbGljeSA9IHBvbGljeVtmaXJzdExhbmddO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFsYW5nUG9saWN5KSB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gZmluZCBhIHBvbGljeSB0byBzaG93IHRoZSB1c2VyXCIpO1xuXG4gICAgICAgICAgICBpbml0VG9nZ2xlc1twb2xpY3lJZF0gPSBmYWxzZTtcblxuICAgICAgICAgICAgcGlja2VkUG9saWNpZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgaWQ6IHBvbGljeUlkLFxuICAgICAgICAgICAgICAgIG5hbWU6IGxhbmdQb2xpY3kubmFtZSxcbiAgICAgICAgICAgICAgICB1cmw6IGxhbmdQb2xpY3kudXJsLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgdG9nZ2xlZFBvbGljaWVzOiBpbml0VG9nZ2xlcyxcbiAgICAgICAgICAgIHBvbGljaWVzOiBwaWNrZWRQb2xpY2llcyxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vblBoYXNlQ2hhbmdlKERFRkFVTFRfUEhBU0UpO1xuICAgIH1cblxuICAgIHByaXZhdGUgdG9nZ2xlUG9saWN5KHBvbGljeUlkOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgbmV3VG9nZ2xlcyA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IHBvbGljeSBvZiB0aGlzLnN0YXRlLnBvbGljaWVzKSB7XG4gICAgICAgICAgICBsZXQgY2hlY2tlZCA9IHRoaXMuc3RhdGUudG9nZ2xlZFBvbGljaWVzW3BvbGljeS5pZF07XG4gICAgICAgICAgICBpZiAocG9saWN5LmlkID09PSBwb2xpY3lJZCkgY2hlY2tlZCA9ICFjaGVja2VkO1xuXG4gICAgICAgICAgICBuZXdUb2dnbGVzW3BvbGljeS5pZF0gPSBjaGVja2VkO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBcInRvZ2dsZWRQb2xpY2llc1wiOiBuZXdUb2dnbGVzIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgdHJ5U3VibWl0ID0gKCkgPT4ge1xuICAgICAgICBsZXQgYWxsQ2hlY2tlZCA9IHRydWU7XG4gICAgICAgIGZvciAoY29uc3QgcG9saWN5IG9mIHRoaXMuc3RhdGUucG9saWNpZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGNoZWNrZWQgPSB0aGlzLnN0YXRlLnRvZ2dsZWRQb2xpY2llc1twb2xpY3kuaWRdO1xuICAgICAgICAgICAgYWxsQ2hlY2tlZCA9IGFsbENoZWNrZWQgJiYgY2hlY2tlZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChhbGxDaGVja2VkKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLnN1Ym1pdEF1dGhEaWN0KHsgdHlwZTogQXV0aFR5cGUuVGVybXMgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZXJyb3JUZXh0OiBfdChcIlBsZWFzZSByZXZpZXcgYW5kIGFjY2VwdCBhbGwgb2YgdGhlIGhvbWVzZXJ2ZXIncyBwb2xpY2llc1wiKSB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmJ1c3kpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPFNwaW5uZXIgLz5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjaGVja2JveGVzID0gW107XG4gICAgICAgIGxldCBhbGxDaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgZm9yIChjb25zdCBwb2xpY3kgb2YgdGhpcy5zdGF0ZS5wb2xpY2llcykge1xuICAgICAgICAgICAgY29uc3QgY2hlY2tlZCA9IHRoaXMuc3RhdGUudG9nZ2xlZFBvbGljaWVzW3BvbGljeS5pZF07XG4gICAgICAgICAgICBhbGxDaGVja2VkID0gYWxsQ2hlY2tlZCAmJiBjaGVja2VkO1xuXG4gICAgICAgICAgICBjaGVja2JveGVzLnB1c2goXG4gICAgICAgICAgICAgICAgLy8gWFhYOiByZXBsYWNlIHdpdGggU3R5bGVkQ2hlY2tib3hcbiAgICAgICAgICAgICAgICA8bGFiZWwga2V5PXtcInBvbGljeV9jaGVja2JveF9cIiArIHBvbGljeS5pZH0gY2xhc3NOYW1lPVwibXhfSW50ZXJhY3RpdmVBdXRoRW50cnlDb21wb25lbnRzX3Rlcm1zUG9saWN5XCI+XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBvbkNoYW5nZT17KCkgPT4gdGhpcy50b2dnbGVQb2xpY3kocG9saWN5LmlkKX0gY2hlY2tlZD17Y2hlY2tlZH0gLz5cbiAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj17cG9saWN5LnVybH0gdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiPnsgcG9saWN5Lm5hbWUgfTwvYT5cbiAgICAgICAgICAgICAgICA8L2xhYmVsPixcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZXJyb3JTZWN0aW9uO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5lcnJvclRleHQgfHwgdGhpcy5zdGF0ZS5lcnJvclRleHQpIHtcbiAgICAgICAgICAgIGVycm9yU2VjdGlvbiA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImVycm9yXCIgcm9sZT1cImFsZXJ0XCI+XG4gICAgICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy5lcnJvclRleHQgfHwgdGhpcy5zdGF0ZS5lcnJvclRleHQgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBzdWJtaXRCdXR0b247XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnNob3dDb250aW51ZSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIC8vIFhYWDogYnV0dG9uIGNsYXNzZXNcbiAgICAgICAgICAgIHN1Ym1pdEJ1dHRvbiA9IDxidXR0b25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9JbnRlcmFjdGl2ZUF1dGhFbnRyeUNvbXBvbmVudHNfdGVybXNTdWJtaXQgbXhfR2VuZXJhbEJ1dHRvblwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy50cnlTdWJtaXR9XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyFhbGxDaGVja2VkfT57IF90KFwiQWNjZXB0XCIpIH08L2J1dHRvbj47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8cD57IF90KFwiUGxlYXNlIHJldmlldyBhbmQgYWNjZXB0IHRoZSBwb2xpY2llcyBvZiB0aGlzIGhvbWVzZXJ2ZXI6XCIpIH08L3A+XG4gICAgICAgICAgICAgICAgeyBjaGVja2JveGVzIH1cbiAgICAgICAgICAgICAgICB7IGVycm9yU2VjdGlvbiB9XG4gICAgICAgICAgICAgICAgeyBzdWJtaXRCdXR0b24gfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5pbnRlcmZhY2UgSUVtYWlsSWRlbnRpdHlBdXRoRW50cnlQcm9wcyBleHRlbmRzIElBdXRoRW50cnlQcm9wcyB7XG4gICAgaW5wdXRzPzoge1xuICAgICAgICBlbWFpbEFkZHJlc3M/OiBzdHJpbmc7XG4gICAgfTtcbiAgICBzdGFnZVN0YXRlPzoge1xuICAgICAgICBlbWFpbFNpZDogc3RyaW5nO1xuICAgIH07XG59XG5cbmludGVyZmFjZSBJRW1haWxJZGVudGl0eUF1dGhFbnRyeVN0YXRlIHtcbiAgICByZXF1ZXN0ZWQ6IGJvb2xlYW47XG4gICAgcmVxdWVzdGluZzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIEVtYWlsSWRlbnRpdHlBdXRoRW50cnkgZXh0ZW5kc1xuICAgIFJlYWN0LkNvbXBvbmVudDxJRW1haWxJZGVudGl0eUF1dGhFbnRyeVByb3BzLCBJRW1haWxJZGVudGl0eUF1dGhFbnRyeVN0YXRlPiB7XG4gICAgc3RhdGljIExPR0lOX1RZUEUgPSBBdXRoVHlwZS5FbWFpbDtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBJRW1haWxJZGVudGl0eUF1dGhFbnRyeVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgcmVxdWVzdGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHJlcXVlc3Rpbmc6IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLnByb3BzLm9uUGhhc2VDaGFuZ2UoREVGQVVMVF9QSEFTRSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgZXJyb3JTZWN0aW9uO1xuICAgICAgICAvLyBpZ25vcmUgdGhlIGVycm9yIHdoZW4gZXJyY29kZSBpcyBNX1VOQVVUSE9SSVpFRCBhcyB3ZSBleHBlY3QgdGhhdCBlcnJvciB1bnRpbCB0aGUgbGluayBpcyBjbGlja2VkLlxuICAgICAgICBpZiAodGhpcy5wcm9wcy5lcnJvclRleHQgJiYgdGhpcy5wcm9wcy5lcnJvckNvZGUgIT09IFwiTV9VTkFVVEhPUklaRURcIikge1xuICAgICAgICAgICAgZXJyb3JTZWN0aW9uID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZXJyb3JcIiByb2xlPVwiYWxlcnRcIj5cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLmVycm9yVGV4dCB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhpcyBjb21wb25lbnQgaXMgbm93IG9ubHkgZGlzcGxheWVkIG9uY2UgdGhlIHRva2VuIGhhcyBiZWVuIHJlcXVlc3RlZCxcbiAgICAgICAgLy8gc28gd2Uga25vdyB0aGUgZW1haWwgaGFzIGJlZW4gc2VudC4gSXQgY2FuIGFsc28gZ2V0IGxvYWRlZCBhZnRlciB0aGUgdXNlclxuICAgICAgICAvLyBoYXMgY2xpY2tlZCB0aGUgdmFsaWRhdGlvbiBsaW5rIGlmIHRoZSBzZXJ2ZXIgdGFrZXMgYSB3aGlsZSB0byBwcm9wYWdhdGVcbiAgICAgICAgLy8gdGhlIHZhbGlkYXRpb24gaW50ZXJuYWxseS4gSWYgd2UncmUgaW4gdGhlIHNlc3Npb24gc3Bhd25lZCBmcm9tIGNsaWNraW5nXG4gICAgICAgIC8vIHRoZSB2YWxpZGF0aW9uIGxpbmssIHdlIHdvbid0IGtub3cgdGhlIGVtYWlsIGFkZHJlc3MsIHNvIGlmIHdlIGRvbid0IGhhdmUgaXQsXG4gICAgICAgIC8vIGFzc3VtZSB0aGF0IHRoZSBsaW5rIGhhcyBiZWVuIGNsaWNrZWQgYW5kIHRoZSBzZXJ2ZXIgd2lsbCByZWFsaXNlIHdoZW4gd2UgcG9sbC5cbiAgICAgICAgLy8gV2Ugb25seSBoYXZlIGEgc2Vzc2lvbiBJRCBpZiB0aGUgdXNlciBoYXMgY2xpY2tlZCB0aGUgbGluayBpbiB0aGVpciBlbWFpbCxcbiAgICAgICAgLy8gc28gc2hvdyBhIGxvYWRpbmcgc3RhdGUgaW5zdGVhZCBvZiBcImFuIGVtYWlsIGhhcyBiZWVuIHNlbnQgdG8uLi5cIiBiZWNhdXNlXG4gICAgICAgIC8vIHRoYXQncyBjb25mdXNpbmcgd2hlbiB5b3UndmUgYWxyZWFkeSByZWFkIHRoYXQgZW1haWwuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmlucHV0cy5lbWFpbEFkZHJlc3MgPT09IHVuZGVmaW5lZCB8fCB0aGlzLnByb3BzLnN0YWdlU3RhdGU/LmVtYWlsU2lkKSB7XG4gICAgICAgICAgICBpZiAoZXJyb3JTZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yU2VjdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiA8U3Bpbm5lciAvPjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9JbnRlcmFjdGl2ZUF1dGhFbnRyeUNvbXBvbmVudHNfZW1haWxXcmFwcGVyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxBdXRoSGVhZGVyTW9kaWZpZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIkNoZWNrIHlvdXIgZW1haWwgdG8gY29udGludWVcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uPXs8aW1nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjPXtFbWFpbFByb21wdEljb259XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0PXtfdChcIlVucmVhZCBlbWFpbCBpY29uXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoPXsxNn1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+fVxuICAgICAgICAgICAgICAgICAgICAgICAgaGlkZVNlcnZlclBpY2tlcj17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPHA+eyBfdChcIlRvIGNyZWF0ZSB5b3VyIGFjY291bnQsIG9wZW4gdGhlIGxpbmsgaW4gdGhlIGVtYWlsIHdlIGp1c3Qgc2VudCB0byAlKGVtYWlsQWRkcmVzcylzLlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBlbWFpbEFkZHJlc3M6IDxiPnsgdGhpcy5wcm9wcy5pbnB1dHMuZW1haWxBZGRyZXNzIH08L2I+IH0sXG4gICAgICAgICAgICAgICAgICAgICkgfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnN0YXRlLnJlcXVlc3RpbmcgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJzZWNvbmRhcnlcIj57IF90KFwiRGlkIG5vdCByZWNlaXZlIGl0PyA8YT5SZXNlbmQgaXQ8L2E+XCIsIHt9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYTogKHRleHQ6IHN0cmluZykgPT4gPEZyYWdtZW50PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2luZD0nbGlua19pbmxpbmUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPnsgdGV4dCB9IDxTcGlubmVyIHc9ezE0fSBoPXsxNH0gLz48L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9GcmFnbWVudD4sXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSB9PC9wPlxuICAgICAgICAgICAgICAgICAgICApIDogPHAgY2xhc3NOYW1lPVwic2Vjb25kYXJ5XCI+eyBfdChcIkRpZCBub3QgcmVjZWl2ZSBpdD8gPGE+UmVzZW5kIGl0PC9hPlwiLCB7fSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgYTogKHRleHQ6IHN0cmluZykgPT4gPEFjY2Vzc2libGVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2luZD0nbGlua19pbmxpbmUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9e3RoaXMuc3RhdGUucmVxdWVzdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gX3QoXCJSZXNlbnQhXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogX3QoXCJSZXNlbmRcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25tZW50PXtBbGlnbm1lbnQuUmlnaHR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcENsYXNzTmFtZT1cIm14X1Rvb2x0aXBfbm9NYXJnaW5cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uSGlkZVRvb2x0aXA9e3RoaXMuc3RhdGUucmVxdWVzdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gKCkgPT4gdGhpcy5zZXRTdGF0ZSh7IHJlcXVlc3RlZDogZmFsc2UgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17YXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgcmVxdWVzdGluZzogdHJ1ZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucHJvcHMucmVxdWVzdEVtYWlsVG9rZW4/LigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2dnZXIud2FybihcIkVtYWlsIHRva2VuIHJlcXVlc3QgZmFpbGVkOiBcIiwgZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgcmVxdWVzdGVkOiB0cnVlLCByZXF1ZXN0aW5nOiBmYWxzZSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICA+eyB0ZXh0IH08L0FjY2Vzc2libGVUb29sdGlwQnV0dG9uPixcbiAgICAgICAgICAgICAgICAgICAgfSkgfTwvcD4gfVxuICAgICAgICAgICAgICAgICAgICB7IGVycm9yU2VjdGlvbiB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5pbnRlcmZhY2UgSU1zaXNkbkF1dGhFbnRyeVByb3BzIGV4dGVuZHMgSUF1dGhFbnRyeVByb3BzIHtcbiAgICBpbnB1dHM6IHtcbiAgICAgICAgcGhvbmVDb3VudHJ5OiBzdHJpbmc7XG4gICAgICAgIHBob25lTnVtYmVyOiBzdHJpbmc7XG4gICAgfTtcbiAgICBjbGllbnRTZWNyZXQ6IHN0cmluZztcbiAgICBmYWlsOiAoZXJyb3I6IEVycm9yKSA9PiB2b2lkO1xufVxuXG5pbnRlcmZhY2UgSU1zaXNkbkF1dGhFbnRyeVN0YXRlIHtcbiAgICB0b2tlbjogc3RyaW5nO1xuICAgIHJlcXVlc3RpbmdUb2tlbjogYm9vbGVhbjtcbiAgICBlcnJvclRleHQ6IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIE1zaXNkbkF1dGhFbnRyeSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJTXNpc2RuQXV0aEVudHJ5UHJvcHMsIElNc2lzZG5BdXRoRW50cnlTdGF0ZT4ge1xuICAgIHN0YXRpYyBMT0dJTl9UWVBFID0gQXV0aFR5cGUuTXNpc2RuO1xuXG4gICAgcHJpdmF0ZSBzdWJtaXRVcmw6IHN0cmluZztcbiAgICBwcml2YXRlIHNpZDogc3RyaW5nO1xuICAgIHByaXZhdGUgbXNpc2RuOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHRva2VuOiAnJyxcbiAgICAgICAgICAgIHJlcXVlc3RpbmdUb2tlbjogZmFsc2UsXG4gICAgICAgICAgICBlcnJvclRleHQ6ICcnLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLnByb3BzLm9uUGhhc2VDaGFuZ2UoREVGQVVMVF9QSEFTRSk7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHJlcXVlc3RpbmdUb2tlbjogdHJ1ZSB9KTtcbiAgICAgICAgdGhpcy5yZXF1ZXN0TXNpc2RuVG9rZW4oKS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5mYWlsKGUpO1xuICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyByZXF1ZXN0aW5nVG9rZW46IGZhbHNlIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIFJlcXVlc3RzIGEgdmVyaWZpY2F0aW9uIHRva2VuIGJ5IFNNUy5cbiAgICAgKi9cbiAgICBwcml2YXRlIHJlcXVlc3RNc2lzZG5Ub2tlbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMubWF0cml4Q2xpZW50LnJlcXVlc3RSZWdpc3Rlck1zaXNkblRva2VuKFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5pbnB1dHMucGhvbmVDb3VudHJ5LFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5pbnB1dHMucGhvbmVOdW1iZXIsXG4gICAgICAgICAgICB0aGlzLnByb3BzLmNsaWVudFNlY3JldCxcbiAgICAgICAgICAgIDEsIC8vIFRPRE86IE11bHRpcGxlIHNlbmQgYXR0ZW1wdHM/XG4gICAgICAgICkudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnN1Ym1pdFVybCA9IHJlc3VsdC5zdWJtaXRfdXJsO1xuICAgICAgICAgICAgdGhpcy5zaWQgPSByZXN1bHQuc2lkO1xuICAgICAgICAgICAgdGhpcy5tc2lzZG4gPSByZXN1bHQubXNpc2RuO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uVG9rZW5DaGFuZ2UgPSAoZTogQ2hhbmdlRXZlbnQ8SFRNTElucHV0RWxlbWVudD4pID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB0b2tlbjogZS50YXJnZXQudmFsdWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRm9ybVN1Ym1pdCA9IGFzeW5jIChlOiBGb3JtRXZlbnQpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS50b2tlbiA9PSAnJykgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZXJyb3JUZXh0OiBudWxsLFxuICAgICAgICB9KTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IHJlc3VsdDtcbiAgICAgICAgICAgIGlmICh0aGlzLnN1Ym1pdFVybCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGF3YWl0IHRoaXMucHJvcHMubWF0cml4Q2xpZW50LnN1Ym1pdE1zaXNkblRva2VuT3RoZXJVcmwoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3VibWl0VXJsLCB0aGlzLnNpZCwgdGhpcy5wcm9wcy5jbGllbnRTZWNyZXQsIHRoaXMuc3RhdGUudG9rZW4sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIHJlZ2lzdHJhdGlvbiB3aXRoIE1TSVNETiBmbG93IGlzIG1pc2NvbmZpZ3VyZWRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjcmVkcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgc2lkOiB0aGlzLnNpZCxcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50X3NlY3JldDogdGhpcy5wcm9wcy5jbGllbnRTZWNyZXQsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnN1Ym1pdEF1dGhEaWN0KHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogQXV0aFR5cGUuTXNpc2RuLFxuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBSZW1vdmUgYHRocmVlcGlkX2NyZWRzYCBvbmNlIHNlcnZlcnMgc3VwcG9ydCBwcm9wZXIgVUlBXG4gICAgICAgICAgICAgICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xMDMxMlxuICAgICAgICAgICAgICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21hdHJpeC1vcmcvbWF0cml4LWRvYy9pc3N1ZXMvMjIyMFxuICAgICAgICAgICAgICAgICAgICB0aHJlZXBpZF9jcmVkczogY3JlZHMsXG4gICAgICAgICAgICAgICAgICAgIHRocmVlcGlkQ3JlZHM6IGNyZWRzLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JUZXh0OiBfdChcIlRva2VuIGluY29ycmVjdFwiKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5mYWlsKGUpO1xuICAgICAgICAgICAgbG9nZ2VyLmxvZyhcIkZhaWxlZCB0byBzdWJtaXQgbXNpc2RuIHRva2VuXCIpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucmVxdWVzdGluZ1Rva2VuKSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxTcGlubmVyIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZW5hYmxlU3VibWl0ID0gQm9vbGVhbih0aGlzLnN0YXRlLnRva2VuKTtcbiAgICAgICAgICAgIGNvbnN0IHN1Ym1pdENsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgICAgICBteF9JbnRlcmFjdGl2ZUF1dGhFbnRyeUNvbXBvbmVudHNfbXNpc2RuU3VibWl0OiB0cnVlLFxuICAgICAgICAgICAgICAgIG14X0dlbmVyYWxCdXR0b246IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGxldCBlcnJvclNlY3Rpb247XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5lcnJvclRleHQpIHtcbiAgICAgICAgICAgICAgICBlcnJvclNlY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZXJyb3JcIiByb2xlPVwiYWxlcnRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5zdGF0ZS5lcnJvclRleHQgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8cD57IF90KFwiQSB0ZXh0IG1lc3NhZ2UgaGFzIGJlZW4gc2VudCB0byAlKG1zaXNkbilzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IG1zaXNkbjogPGk+eyB0aGlzLm1zaXNkbiB9PC9pPiB9LFxuICAgICAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICA8cD57IF90KFwiUGxlYXNlIGVudGVyIHRoZSBjb2RlIGl0IGNvbnRhaW5zOlwiKSB9PC9wPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0ludGVyYWN0aXZlQXV0aEVudHJ5Q29tcG9uZW50c19tc2lzZG5XcmFwcGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Zm9ybSBvblN1Ym1pdD17dGhpcy5vbkZvcm1TdWJtaXR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0ludGVyYWN0aXZlQXV0aEVudHJ5Q29tcG9uZW50c19tc2lzZG5FbnRyeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnRva2VufVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblRva2VuQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtfdChcIkNvZGVcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInN1Ym1pdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtfdChcIlN1Ym1pdFwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtzdWJtaXRDbGFzc2VzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IWVuYWJsZVN1Ym1pdH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBlcnJvclNlY3Rpb24gfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmludGVyZmFjZSBJU1NPQXV0aEVudHJ5UHJvcHMgZXh0ZW5kcyBJQXV0aEVudHJ5UHJvcHMge1xuICAgIGNvbnRpbnVlVGV4dD86IHN0cmluZztcbiAgICBjb250aW51ZUtpbmQ/OiBzdHJpbmc7XG4gICAgb25DYW5jZWw/OiAoKSA9PiB2b2lkO1xufVxuXG5pbnRlcmZhY2UgSVNTT0F1dGhFbnRyeVN0YXRlIHtcbiAgICBwaGFzZTogbnVtYmVyO1xuICAgIGF0dGVtcHRGYWlsZWQ6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBTU09BdXRoRW50cnkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVNTT0F1dGhFbnRyeVByb3BzLCBJU1NPQXV0aEVudHJ5U3RhdGU+IHtcbiAgICBzdGF0aWMgTE9HSU5fVFlQRSA9IEF1dGhUeXBlLlNzbztcbiAgICBzdGF0aWMgVU5TVEFCTEVfTE9HSU5fVFlQRSA9IEF1dGhUeXBlLlNzb1Vuc3RhYmxlO1xuXG4gICAgc3RhdGljIFBIQVNFX1BSRUFVVEggPSAxOyAvLyBidXR0b24gdG8gc3RhcnQgU1NPXG4gICAgc3RhdGljIFBIQVNFX1BPU1RBVVRIID0gMjsgLy8gYnV0dG9uIHRvIGNvbmZpcm0gU1NPIGNvbXBsZXRlZFxuXG4gICAgcHJpdmF0ZSBzc29Vcmw6IHN0cmluZztcbiAgICBwcml2YXRlIHBvcHVwV2luZG93OiBXaW5kb3c7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgLy8gV2UgYWN0dWFsbHkgc2VuZCB0aGUgdXNlciB0aHJvdWdoIGZhbGxiYWNrIGF1dGggc28gd2UgZG9uJ3QgaGF2ZSB0b1xuICAgICAgICAvLyBkZWFsIHdpdGggYSByZWRpcmVjdCBiYWNrIHRvIHVzLCBsb3NpbmcgYXBwbGljYXRpb24gY29udGV4dC5cbiAgICAgICAgdGhpcy5zc29VcmwgPSBwcm9wcy5tYXRyaXhDbGllbnQuZ2V0RmFsbGJhY2tBdXRoVXJsKFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5sb2dpblR5cGUsXG4gICAgICAgICAgICB0aGlzLnByb3BzLmF1dGhTZXNzaW9uSWQsXG4gICAgICAgICk7XG5cbiAgICAgICAgdGhpcy5wb3B1cFdpbmRvdyA9IG51bGw7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCB0aGlzLm9uUmVjZWl2ZU1lc3NhZ2UpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBwaGFzZTogU1NPQXV0aEVudHJ5LlBIQVNFX1BSRUFVVEgsXG4gICAgICAgICAgICBhdHRlbXB0RmFpbGVkOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vblBoYXNlQ2hhbmdlKFNTT0F1dGhFbnRyeS5QSEFTRV9QUkVBVVRIKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIHRoaXMub25SZWNlaXZlTWVzc2FnZSk7XG4gICAgICAgIGlmICh0aGlzLnBvcHVwV2luZG93KSB7XG4gICAgICAgICAgICB0aGlzLnBvcHVwV2luZG93LmNsb3NlKCk7XG4gICAgICAgICAgICB0aGlzLnBvcHVwV2luZG93ID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBhdHRlbXB0RmFpbGVkID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGF0dGVtcHRGYWlsZWQ6IHRydWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUmVjZWl2ZU1lc3NhZ2UgPSAoZXZlbnQ6IE1lc3NhZ2VFdmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQuZGF0YSA9PT0gXCJhdXRoRG9uZVwiICYmIGV2ZW50Lm9yaWdpbiA9PT0gdGhpcy5wcm9wcy5tYXRyaXhDbGllbnQuZ2V0SG9tZXNlcnZlclVybCgpKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wb3B1cFdpbmRvdykge1xuICAgICAgICAgICAgICAgIHRoaXMucG9wdXBXaW5kb3cuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBvcHVwV2luZG93ID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uU3RhcnRBdXRoQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIC8vIE5vdGU6IFdlIGRvbid0IHVzZSBQbGF0Zm9ybVBlZydzIHN0YXJ0U3NvQXV0aCBmdW5jdGlvbnMgYmVjYXVzZSB3ZSBhbG1vc3RcbiAgICAgICAgLy8gY2VydGFpbmx5IHdpbGwgbmVlZCB0byBvcGVuIHRoZSB0aGluZyBpbiBhIG5ldyB0YWIgdG8gYXZvaWQgbG9zaW5nIGFwcGxpY2F0aW9uXG4gICAgICAgIC8vIGNvbnRleHQuXG5cbiAgICAgICAgdGhpcy5wb3B1cFdpbmRvdyA9IHdpbmRvdy5vcGVuKHRoaXMuc3NvVXJsLCBcIl9ibGFua1wiKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBoYXNlOiBTU09BdXRoRW50cnkuUEhBU0VfUE9TVEFVVEggfSk7XG4gICAgICAgIHRoaXMucHJvcHMub25QaGFzZUNoYW5nZShTU09BdXRoRW50cnkuUEhBU0VfUE9TVEFVVEgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ29uZmlybUNsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLnN1Ym1pdEF1dGhEaWN0KHt9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgY29udGludWVCdXR0b24gPSBudWxsO1xuICAgICAgICBjb25zdCBjYW5jZWxCdXR0b24gPSAoXG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMub25DYW5jZWx9XG4gICAgICAgICAgICAgICAga2luZD17dGhpcy5wcm9wcy5jb250aW51ZUtpbmQgPyAodGhpcy5wcm9wcy5jb250aW51ZUtpbmQgKyAnX291dGxpbmUnKSA6ICdwcmltYXJ5X291dGxpbmUnfVxuICAgICAgICAgICAgPnsgX3QoXCJDYW5jZWxcIikgfTwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgKTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucGhhc2UgPT09IFNTT0F1dGhFbnRyeS5QSEFTRV9QUkVBVVRIKSB7XG4gICAgICAgICAgICBjb250aW51ZUJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uU3RhcnRBdXRoQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIGtpbmQ9e3RoaXMucHJvcHMuY29udGludWVLaW5kIHx8ICdwcmltYXJ5J31cbiAgICAgICAgICAgICAgICA+eyB0aGlzLnByb3BzLmNvbnRpbnVlVGV4dCB8fCBfdChcIlNpbmdsZSBTaWduIE9uXCIpIH08L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29udGludWVCdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkNvbmZpcm1DbGlja31cbiAgICAgICAgICAgICAgICAgICAga2luZD17dGhpcy5wcm9wcy5jb250aW51ZUtpbmQgfHwgJ3ByaW1hcnknfVxuICAgICAgICAgICAgICAgID57IHRoaXMucHJvcHMuY29udGludWVUZXh0IHx8IF90KFwiQ29uZmlybVwiKSB9PC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBlcnJvclNlY3Rpb247XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmVycm9yVGV4dCkge1xuICAgICAgICAgICAgZXJyb3JTZWN0aW9uID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZXJyb3JcIiByb2xlPVwiYWxlcnRcIj5cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLmVycm9yVGV4dCB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuYXR0ZW1wdEZhaWxlZCkge1xuICAgICAgICAgICAgZXJyb3JTZWN0aW9uID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZXJyb3JcIiByb2xlPVwiYWxlcnRcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIlNvbWV0aGluZyB3ZW50IHdyb25nIGluIGNvbmZpcm1pbmcgeW91ciBpZGVudGl0eS4gQ2FuY2VsIGFuZCB0cnkgYWdhaW4uXCIpIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEZyYWdtZW50PlxuICAgICAgICAgICAgICAgIHsgZXJyb3JTZWN0aW9uIH1cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0ludGVyYWN0aXZlQXV0aEVudHJ5Q29tcG9uZW50c19zc29fYnV0dG9uc1wiPlxuICAgICAgICAgICAgICAgICAgICB7IGNhbmNlbEJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgICAgIHsgY29udGludWVCdXR0b24gfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9GcmFnbWVudD5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmV4cG9ydCBjbGFzcyBGYWxsYmFja0F1dGhFbnRyeSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJQXV0aEVudHJ5UHJvcHM+IHtcbiAgICBwcml2YXRlIHBvcHVwV2luZG93OiBXaW5kb3c7XG4gICAgcHJpdmF0ZSBmYWxsYmFja0J1dHRvbiA9IGNyZWF0ZVJlZjxIVE1MQnV0dG9uRWxlbWVudD4oKTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICAvLyB3ZSBoYXZlIHRvIG1ha2UgdGhlIHVzZXIgY2xpY2sgYSBidXR0b24sIGFzIGJyb3dzZXJzIHdpbGwgYmxvY2tcbiAgICAgICAgLy8gdGhlIHBvcHVwIGlmIHdlIG9wZW4gaXQgaW1tZWRpYXRlbHkuXG4gICAgICAgIHRoaXMucG9wdXBXaW5kb3cgPSBudWxsO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgdGhpcy5vblJlY2VpdmVNZXNzYWdlKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vblBoYXNlQ2hhbmdlKERFRkFVTFRfUEhBU0UpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgdGhpcy5vblJlY2VpdmVNZXNzYWdlKTtcbiAgICAgICAgaWYgKHRoaXMucG9wdXBXaW5kb3cpIHtcbiAgICAgICAgICAgIHRoaXMucG9wdXBXaW5kb3cuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBmb2N1cyA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuZmFsbGJhY2tCdXR0b24uY3VycmVudCkge1xuICAgICAgICAgICAgdGhpcy5mYWxsYmFja0J1dHRvbi5jdXJyZW50LmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblNob3dGYWxsYmFja0NsaWNrID0gKGU6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIGNvbnN0IHVybCA9IHRoaXMucHJvcHMubWF0cml4Q2xpZW50LmdldEZhbGxiYWNrQXV0aFVybChcbiAgICAgICAgICAgIHRoaXMucHJvcHMubG9naW5UeXBlLFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5hdXRoU2Vzc2lvbklkLFxuICAgICAgICApO1xuICAgICAgICB0aGlzLnBvcHVwV2luZG93ID0gd2luZG93Lm9wZW4odXJsLCBcIl9ibGFua1wiKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJlY2VpdmVNZXNzYWdlID0gKGV2ZW50OiBNZXNzYWdlRXZlbnQpID0+IHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgZXZlbnQuZGF0YSA9PT0gXCJhdXRoRG9uZVwiICYmXG4gICAgICAgICAgICBldmVudC5vcmlnaW4gPT09IHRoaXMucHJvcHMubWF0cml4Q2xpZW50LmdldEhvbWVzZXJ2ZXJVcmwoKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMuc3VibWl0QXV0aERpY3Qoe30pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IGVycm9yU2VjdGlvbjtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZXJyb3JUZXh0KSB7XG4gICAgICAgICAgICBlcnJvclNlY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJlcnJvclwiIHJvbGU9XCJhbGVydFwiPlxuICAgICAgICAgICAgICAgICAgICB7IHRoaXMucHJvcHMuZXJyb3JUZXh0IH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD0nbGluaycgaW5wdXRSZWY9e3RoaXMuZmFsbGJhY2tCdXR0b259IG9uQ2xpY2s9e3RoaXMub25TaG93RmFsbGJhY2tDbGlja30+e1xuICAgICAgICAgICAgICAgICAgICBfdChcIlN0YXJ0IGF1dGhlbnRpY2F0aW9uXCIpXG4gICAgICAgICAgICAgICAgfTwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICB7IGVycm9yU2VjdGlvbiB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVN0YWdlQ29tcG9uZW50UHJvcHMgZXh0ZW5kcyBJQXV0aEVudHJ5UHJvcHMge1xuICAgIGNsaWVudFNlY3JldD86IHN0cmluZztcbiAgICBzdGFnZVBhcmFtcz86IFJlY29yZDxzdHJpbmcsIGFueT47XG4gICAgaW5wdXRzPzogSUlucHV0cztcbiAgICBzdGFnZVN0YXRlPzogSVN0YWdlU3RhdHVzO1xuICAgIHNob3dDb250aW51ZT86IGJvb2xlYW47XG4gICAgY29udGludWVUZXh0Pzogc3RyaW5nO1xuICAgIGNvbnRpbnVlS2luZD86IHN0cmluZztcbiAgICBmYWlsPyhlOiBFcnJvcik6IHZvaWQ7XG4gICAgc2V0RW1haWxTaWQ/KHNpZDogc3RyaW5nKTogdm9pZDtcbiAgICBvbkNhbmNlbD8oKTogdm9pZDtcbiAgICByZXF1ZXN0RW1haWxUb2tlbj8oKTogUHJvbWlzZTx2b2lkPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJU3RhZ2VDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnRDbGFzczxSZWFjdC5Qcm9wc1dpdGhSZWY8SVN0YWdlQ29tcG9uZW50UHJvcHM+PiB7XG4gICAgYXR0ZW1wdEZhaWxlZD8oKTogdm9pZDtcbiAgICBmb2N1cz8oKTogdm9pZDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0RW50cnlDb21wb25lbnRGb3JMb2dpblR5cGUobG9naW5UeXBlOiBBdXRoVHlwZSk6IElTdGFnZUNvbXBvbmVudCB7XG4gICAgc3dpdGNoIChsb2dpblR5cGUpIHtcbiAgICAgICAgY2FzZSBBdXRoVHlwZS5QYXNzd29yZDpcbiAgICAgICAgICAgIHJldHVybiBQYXNzd29yZEF1dGhFbnRyeTtcbiAgICAgICAgY2FzZSBBdXRoVHlwZS5SZWNhcHRjaGE6XG4gICAgICAgICAgICByZXR1cm4gUmVjYXB0Y2hhQXV0aEVudHJ5O1xuICAgICAgICBjYXNlIEF1dGhUeXBlLkVtYWlsOlxuICAgICAgICAgICAgcmV0dXJuIEVtYWlsSWRlbnRpdHlBdXRoRW50cnk7XG4gICAgICAgIGNhc2UgQXV0aFR5cGUuTXNpc2RuOlxuICAgICAgICAgICAgcmV0dXJuIE1zaXNkbkF1dGhFbnRyeTtcbiAgICAgICAgY2FzZSBBdXRoVHlwZS5UZXJtczpcbiAgICAgICAgICAgIHJldHVybiBUZXJtc0F1dGhFbnRyeTtcbiAgICAgICAgY2FzZSBBdXRoVHlwZS5Tc286XG4gICAgICAgIGNhc2UgQXV0aFR5cGUuU3NvVW5zdGFibGU6XG4gICAgICAgICAgICByZXR1cm4gU1NPQXV0aEVudHJ5O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIEZhbGxiYWNrQXV0aEVudHJ5O1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQW9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFTyxNQUFNQSxhQUFhLEdBQUcsQ0FBdEI7OztBQW1CQSxNQUFNQyxpQkFBTixTQUFnQ0MsY0FBQSxDQUFNQyxTQUF0QyxDQUEwRjtFQUc3RkMsV0FBVyxDQUFDQyxLQUFELEVBQVE7SUFDZixNQUFNQSxLQUFOO0lBRGUsZ0RBWUNDLENBQUQsSUFBa0I7TUFDakNBLENBQUMsQ0FBQ0MsY0FBRjtNQUNBLElBQUksS0FBS0YsS0FBTCxDQUFXRyxJQUFmLEVBQXFCO01BRXJCLEtBQUtILEtBQUwsQ0FBV0ksY0FBWCxDQUEwQjtRQUN0QkMsSUFBSSxFQUFFQyx5QkFBQSxD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