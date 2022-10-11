"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _serviceTypes = require("matrix-js-sdk/src/service-types");

var _logger = require("matrix-js-sdk/src/logger");

var languageHandler = _interopRequireWildcard(require("../../../../../languageHandler"));

var _ProfileSettings = _interopRequireDefault(require("../../ProfileSettings"));

var _SettingsStore = _interopRequireDefault(require("../../../../../settings/SettingsStore"));

var _LanguageDropdown = _interopRequireDefault(require("../../../elements/LanguageDropdown"));

var _SpellCheckSettings = _interopRequireDefault(require("../../SpellCheckSettings"));

var _AccessibleButton = _interopRequireDefault(require("../../../elements/AccessibleButton"));

var _DeactivateAccountDialog = _interopRequireDefault(require("../../../dialogs/DeactivateAccountDialog"));

var _PlatformPeg = _interopRequireDefault(require("../../../../../PlatformPeg"));

var _MatrixClientPeg = require("../../../../../MatrixClientPeg");

var _Modal = _interopRequireDefault(require("../../../../../Modal"));

var _dispatcher = _interopRequireDefault(require("../../../../../dispatcher/dispatcher"));

var _Terms = require("../../../../../Terms");

var _IdentityAuthClient = _interopRequireDefault(require("../../../../../IdentityAuthClient"));

var _UrlUtils = require("../../../../../utils/UrlUtils");

var _boundThreepids = require("../../../../../boundThreepids");

var _Spinner = _interopRequireDefault(require("../../../elements/Spinner"));

var _SettingLevel = require("../../../../../settings/SettingLevel");

var _UIFeature = require("../../../../../settings/UIFeature");

var _ErrorDialog = _interopRequireDefault(require("../../../dialogs/ErrorDialog"));

var _PhoneNumbers = _interopRequireDefault(require("../../account/PhoneNumbers"));

var _EmailAddresses = _interopRequireDefault(require("../../account/EmailAddresses"));

var _EmailAddresses2 = _interopRequireDefault(require("../../discovery/EmailAddresses"));

var _PhoneNumbers2 = _interopRequireDefault(require("../../discovery/PhoneNumbers"));

var _ChangePassword = _interopRequireDefault(require("../../ChangePassword"));

var _InlineTermsAgreement = _interopRequireDefault(require("../../../terms/InlineTermsAgreement"));

var _SetIdServer = _interopRequireDefault(require("../../SetIdServer"));

var _SetIntegrationManager = _interopRequireDefault(require("../../SetIntegrationManager"));

var _ToggleSwitch = _interopRequireDefault(require("../../../elements/ToggleSwitch"));

var _Keyboard = require("../../../../../Keyboard");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

class GeneralUserSettingsTab extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "onAction", payload => {
      if (payload.action === 'id_server_changed') {
        this.setState({
          haveIdServer: Boolean(_MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl())
        });
        this.getThreepidState();
      }
    });
    (0, _defineProperty2.default)(this, "onEmailsChange", emails => {
      this.setState({
        emails
      });
    });
    (0, _defineProperty2.default)(this, "onMsisdnsChange", msisdns => {
      this.setState({
        msisdns
      });
    });
    (0, _defineProperty2.default)(this, "onLanguageChange", newLanguage => {
      if (this.state.language === newLanguage) return;

      _SettingsStore.default.setValue("language", null, _SettingLevel.SettingLevel.DEVICE, newLanguage);

      this.setState({
        language: newLanguage
      });

      const platform = _PlatformPeg.default.get();

      if (platform) {
        platform.setLanguage([newLanguage]);
        platform.reload();
      }
    });
    (0, _defineProperty2.default)(this, "onSpellCheckLanguagesChange", languages => {
      this.setState({
        spellCheckLanguages: languages
      });
      _PlatformPeg.default.get()?.setSpellCheckLanguages(languages);
    });
    (0, _defineProperty2.default)(this, "onSpellCheckEnabledChange", spellCheckEnabled => {
      this.setState({
        spellCheckEnabled
      });
      _PlatformPeg.default.get()?.setSpellCheckEnabled(spellCheckEnabled);
    });
    (0, _defineProperty2.default)(this, "onPasswordChangeError", err => {
      // TODO: Figure out a design that doesn't involve replacing the current dialog
      let errMsg = err.error || err.message || "";

      if (err.httpStatus === 403) {
        errMsg = (0, languageHandler._t)("Failed to change password. Is your password correct?");
      } else if (!errMsg) {
        errMsg += ` (HTTP status ${err.httpStatus})`;
      }

      _logger.logger.error("Failed to change password: " + errMsg);

      _Modal.default.createDialog(_ErrorDialog.default, {
        title: (0, languageHandler._t)("Error"),
        description: errMsg
      });
    });
    (0, _defineProperty2.default)(this, "onPasswordChanged", _ref => {
      let {
        didLogoutOutOtherDevices
      } = _ref;
      let description = (0, languageHandler._t)("Your password was successfully changed.");

      if (didLogoutOutOtherDevices) {
        description += " " + (0, languageHandler._t)("You will not receive push notifications on other devices until you sign back in to them.");
      } // TODO: Figure out a design that doesn't involve replacing the current dialog


      _Modal.default.createDialog(_ErrorDialog.default, {
        title: (0, languageHandler._t)("Success"),
        description
      });
    });
    (0, _defineProperty2.default)(this, "onDeactivateClicked", () => {
      _Modal.default.createDialog(_DeactivateAccountDialog.default, {
        onFinished: success => {
          if (success) this.props.closeSettingsFn();
        }
      });
    });
    this.state = {
      language: languageHandler.getCurrentLanguage(),
      spellCheckEnabled: false,
      spellCheckLanguages: [],
      haveIdServer: Boolean(_MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl()),
      serverSupportsSeparateAddAndBind: null,
      idServerHasUnsignedTerms: false,
      requiredPolicyInfo: {
        // This object is passed along to a component for handling
        hasTerms: false,
        policiesAndServices: null,
        // From the startTermsFlow callback
        agreedUrls: null,
        // From the startTermsFlow callback
        resolve: null // Promise resolve function for startTermsFlow callback

      },
      emails: [],
      msisdns: [],
      loading3pids: true,
      // whether or not the emails and msisdns have been loaded
      canChangePassword: false,
      idServerName: null
    };
    this.dispatcherRef = _dispatcher.default.register(this.onAction);
  } // TODO: [REACT-WARNING] Move this to constructor
  // eslint-disable-next-line @typescript-eslint/naming-convention, camelcase


  async UNSAFE_componentWillMount() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const serverSupportsSeparateAddAndBind = await cli.doesServerSupportSeparateAddAndBind();
    const capabilities = await cli.getCapabilities(); // this is cached

    const changePasswordCap = capabilities['m.change_password']; // You can change your password so long as the capability isn't explicitly disabled. The implicit
    // behaviour is you can change your password when the capability is missing or has not-false as
    // the enabled flag value.

    const canChangePassword = !changePasswordCap || changePasswordCap['enabled'] !== false;
    this.setState({
      serverSupportsSeparateAddAndBind,
      canChangePassword
    });
    this.getThreepidState();
  }

  async componentDidMount() {
    const plat = _PlatformPeg.default.get();

    const [spellCheckEnabled, spellCheckLanguages] = await Promise.all([plat.getSpellCheckEnabled(), plat.getSpellCheckLanguages()]);

    if (spellCheckLanguages) {
      this.setState({
        spellCheckEnabled,
        spellCheckLanguages
      });
    }
  }

  componentWillUnmount() {
    _dispatcher.default.unregister(this.dispatcherRef);
  }

  async getThreepidState() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get(); // Check to see if terms need accepting


    this.checkTerms(); // Need to get 3PIDs generally for Account section and possibly also for
    // Discovery (assuming we have an IS and terms are agreed).

    let threepids = [];

    try {
      threepids = await (0, _boundThreepids.getThreepidsWithBindStatus)(cli);
    } catch (e) {
      const idServerUrl = _MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl();

      _logger.logger.warn(`Unable to reach identity server at ${idServerUrl} to check ` + `for 3PIDs bindings in Settings`);

      _logger.logger.warn(e);
    }

    this.setState({
      emails: threepids.filter(a => a.medium === 'email'),
      msisdns: threepids.filter(a => a.medium === 'msisdn'),
      loading3pids: false
    });
  }

  async checkTerms() {
    if (!this.state.haveIdServer) {
      this.setState({
        idServerHasUnsignedTerms: false
      });
      return;
    } // By starting the terms flow we get the logic for checking which terms the user has signed
    // for free. So we might as well use that for our own purposes.


    const idServerUrl = _MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl();

    const authClient = new _IdentityAuthClient.default();

    try {
      const idAccessToken = await authClient.getAccessToken({
        check: false
      });
      await (0, _Terms.startTermsFlow)([new _Terms.Service(_serviceTypes.SERVICE_TYPES.IS, idServerUrl, idAccessToken)], (policiesAndServices, agreedUrls, extraClassNames) => {
        return new Promise((resolve, reject) => {
          this.setState({
            idServerName: (0, _UrlUtils.abbreviateUrl)(idServerUrl),
            requiredPolicyInfo: {
              hasTerms: true,
              policiesAndServices,
              agreedUrls,
              resolve
            }
          });
        });
      }); // User accepted all terms

      this.setState({
        requiredPolicyInfo: _objectSpread(_objectSpread({}, this.state.requiredPolicyInfo), {}, {
          // set first so we can override
          hasTerms: false
        })
      });
    } catch (e) {
      _logger.logger.warn(`Unable to reach identity server at ${idServerUrl} to check ` + `for terms in Settings`);

      _logger.logger.warn(e);
    }
  }

  renderProfileSection() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement(_ProfileSettings.default, null));
  }

  renderAccountSection() {
    let passwordChangeForm = /*#__PURE__*/_react.default.createElement(_ChangePassword.default, {
      className: "mx_GeneralUserSettingsTab_changePassword",
      rowClassName: "",
      buttonKind: "primary",
      onError: this.onPasswordChangeError,
      onFinished: this.onPasswordChanged
    });

    let threepidSection = null; // For older homeservers without separate 3PID add and bind methods (MSC2290),
    // we use a combo add with bind option API which requires an identity server to
    // validate 3PID ownership even if we're just adding to the homeserver only.
    // For newer homeservers with separate 3PID add and bind methods (MSC2290),
    // there is no such concern, so we can always show the HS account 3PIDs.

    if (_SettingsStore.default.getValue(_UIFeature.UIFeature.ThirdPartyID) && (this.state.haveIdServer || this.state.serverSupportsSeparateAddAndBind === true)) {
      const emails = this.state.loading3pids ? /*#__PURE__*/_react.default.createElement(_Spinner.default, null) : /*#__PURE__*/_react.default.createElement(_EmailAddresses.default, {
        emails: this.state.emails,
        onEmailsChange: this.onEmailsChange
      });
      const msisdns = this.state.loading3pids ? /*#__PURE__*/_react.default.createElement(_Spinner.default, null) : /*#__PURE__*/_react.default.createElement(_PhoneNumbers.default, {
        msisdns: this.state.msisdns,
        onMsisdnsChange: this.onMsisdnsChange
      });
      threepidSection = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_SettingsTab_subheading"
      }, (0, languageHandler._t)("Email addresses")), emails, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_SettingsTab_subheading"
      }, (0, languageHandler._t)("Phone numbers")), msisdns);
    } else if (this.state.serverSupportsSeparateAddAndBind === null) {
      threepidSection = /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
    }

    let passwordChangeText = (0, languageHandler._t)("Set a new account password...");

    if (!this.state.canChangePassword) {
      // Just don't show anything if you can't do anything.
      passwordChangeText = null;
      passwordChangeForm = null;
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section mx_GeneralUserSettingsTab_accountSection"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, languageHandler._t)("Account")), /*#__PURE__*/_react.default.createElement("p", {
      className: "mx_SettingsTab_subsectionText"
    }, passwordChangeText), passwordChangeForm, threepidSection);
  }

  renderLanguageSection() {
    // TODO: Convert to new-styled Field
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, languageHandler._t)("Language and region")), /*#__PURE__*/_react.default.createElement(_LanguageDropdown.default, {
      className: "mx_GeneralUserSettingsTab_languageInput",
      onOptionChange: this.onLanguageChange,
      value: this.state.language
    }));
  }

  renderSpellCheckSection() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section mx_SettingsTab_section_spellcheck"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, languageHandler._t)("Spell check"), /*#__PURE__*/_react.default.createElement(_ToggleSwitch.default, {
      checked: this.state.spellCheckEnabled,
      onChange: this.onSpellCheckEnabledChange
    })), this.state.spellCheckEnabled && !_Keyboard.IS_MAC && /*#__PURE__*/_react.default.createElement(_SpellCheckSettings.default, {
      languages: this.state.spellCheckLanguages,
      onLanguagesChange: this.onSpellCheckLanguagesChange
    }));
  }

  renderDiscoverySection() {
    if (this.state.requiredPolicyInfo.hasTerms) {
      const intro = /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_SettingsTab_subsectionText"
      }, (0, languageHandler._t)("Agree to the identity server (%(serverName)s) Terms of Service to " + "allow yourself to be discoverable by email address or phone number.", {
        serverName: this.state.idServerName
      }));

      return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_InlineTermsAgreement.default, {
        policiesAndServicePairs: this.state.requiredPolicyInfo.policiesAndServices,
        agreedUrls: this.state.requiredPolicyInfo.agreedUrls,
        onFinished: this.state.requiredPolicyInfo.resolve,
        introElement: intro
      }), /*#__PURE__*/_react.default.createElement(_SetIdServer.default, {
        missingTerms: true
      }));
    }

    const emails = this.state.loading3pids ? /*#__PURE__*/_react.default.createElement(_Spinner.default, null) : /*#__PURE__*/_react.default.createElement(_EmailAddresses2.default, {
      emails: this.state.emails
    });
    const msisdns = this.state.loading3pids ? /*#__PURE__*/_react.default.createElement(_Spinner.default, null) : /*#__PURE__*/_react.default.createElement(_PhoneNumbers2.default, {
      msisdns: this.state.msisdns
    });
    const threepidSection = this.state.haveIdServer ? /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_GeneralUserSettingsTab_discovery"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, languageHandler._t)("Email addresses")), emails, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, languageHandler._t)("Phone numbers")), msisdns) : null;
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, threepidSection, /*#__PURE__*/_react.default.createElement(_SetIdServer.default, {
      missingTerms: false
    }));
  }

  renderManagementSection() {
    // TODO: Improve warning text for account deactivation
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subheading"
    }, (0, languageHandler._t)("Account management")), /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_SettingsTab_subsectionText"
    }, (0, languageHandler._t)("Deactivating your account is a permanent action — be careful!")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this.onDeactivateClicked,
      kind: "danger"
    }, (0, languageHandler._t)("Deactivate Account")));
  }

  renderIntegrationManagerSection() {
    if (!_SettingsStore.default.getValue(_UIFeature.UIFeature.Widgets)) return null;
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, /*#__PURE__*/_react.default.createElement(_SetIntegrationManager.default, null));
  }

  render() {
    const plaf = _PlatformPeg.default.get();

    const supportsMultiLanguageSpellCheck = plaf.supportsSpellCheckSettings();
    const discoWarning = this.state.requiredPolicyInfo.hasTerms ? /*#__PURE__*/_react.default.createElement("img", {
      className: "mx_GeneralUserSettingsTab_warningIcon",
      src: require("../../../../../../res/img/feather-customised/warning-triangle.svg").default,
      width: "18",
      height: "18",
      alt: (0, languageHandler._t)("Warning")
    }) : null;
    let accountManagementSection;

    if (_SettingsStore.default.getValue(_UIFeature.UIFeature.Deactivate)) {
      accountManagementSection = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_heading"
      }, (0, languageHandler._t)("Deactivate account")), this.renderManagementSection());
    }

    let discoverySection;

    if (_SettingsStore.default.getValue(_UIFeature.UIFeature.IdentityServer)) {
      discoverySection = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SettingsTab_heading"
      }, discoWarning, " ", (0, languageHandler._t)("Discovery")), this.renderDiscoverySection());
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_heading"
    }, (0, languageHandler._t)("General")), this.renderProfileSection(), this.renderAccountSection(), this.renderLanguageSection(), supportsMultiLanguageSpellCheck ? this.renderSpellCheckSection() : null, discoverySection, this.renderIntegrationManagerSection()
    /* Has its own title */
    , accountManagementSection);
  }

}

exports.default = GeneralUserSettingsTab;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJHZW5lcmFsVXNlclNldHRpbmdzVGFiIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwicGF5bG9hZCIsImFjdGlvbiIsInNldFN0YXRlIiwiaGF2ZUlkU2VydmVyIiwiQm9vbGVhbiIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImdldElkZW50aXR5U2VydmVyVXJsIiwiZ2V0VGhyZWVwaWRTdGF0ZSIsImVtYWlscyIsIm1zaXNkbnMiLCJuZXdMYW5ndWFnZSIsInN0YXRlIiwibGFuZ3VhZ2UiLCJTZXR0aW5nc1N0b3JlIiwic2V0VmFsdWUiLCJTZXR0aW5nTGV2ZWwiLCJERVZJQ0UiLCJwbGF0Zm9ybSIsIlBsYXRmb3JtUGVnIiwic2V0TGFuZ3VhZ2UiLCJyZWxvYWQiLCJsYW5ndWFnZXMiLCJzcGVsbENoZWNrTGFuZ3VhZ2VzIiwic2V0U3BlbGxDaGVja0xhbmd1YWdlcyIsInNwZWxsQ2hlY2tFbmFibGVkIiwic2V0U3BlbGxDaGVja0VuYWJsZWQiLCJlcnIiLCJlcnJNc2ciLCJlcnJvciIsIm1lc3NhZ2UiLCJodHRwU3RhdHVzIiwiX3QiLCJsb2dnZXIiLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIkVycm9yRGlhbG9nIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsImRpZExvZ291dE91dE90aGVyRGV2aWNlcyIsIkRlYWN0aXZhdGVBY2NvdW50RGlhbG9nIiwib25GaW5pc2hlZCIsInN1Y2Nlc3MiLCJjbG9zZVNldHRpbmdzRm4iLCJsYW5ndWFnZUhhbmRsZXIiLCJnZXRDdXJyZW50TGFuZ3VhZ2UiLCJzZXJ2ZXJTdXBwb3J0c1NlcGFyYXRlQWRkQW5kQmluZCIsImlkU2VydmVySGFzVW5zaWduZWRUZXJtcyIsInJlcXVpcmVkUG9saWN5SW5mbyIsImhhc1Rlcm1zIiwicG9saWNpZXNBbmRTZXJ2aWNlcyIsImFncmVlZFVybHMiLCJyZXNvbHZlIiwibG9hZGluZzNwaWRzIiwiY2FuQ2hhbmdlUGFzc3dvcmQiLCJpZFNlcnZlck5hbWUiLCJkaXNwYXRjaGVyUmVmIiwiZGlzIiwicmVnaXN0ZXIiLCJvbkFjdGlvbiIsIlVOU0FGRV9jb21wb25lbnRXaWxsTW91bnQiLCJjbGkiLCJkb2VzU2VydmVyU3VwcG9ydFNlcGFyYXRlQWRkQW5kQmluZCIsImNhcGFiaWxpdGllcyIsImdldENhcGFiaWxpdGllcyIsImNoYW5nZVBhc3N3b3JkQ2FwIiwiY29tcG9uZW50RGlkTW91bnQiLCJwbGF0IiwiUHJvbWlzZSIsImFsbCIsImdldFNwZWxsQ2hlY2tFbmFibGVkIiwiZ2V0U3BlbGxDaGVja0xhbmd1YWdlcyIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwidW5yZWdpc3RlciIsImNoZWNrVGVybXMiLCJ0aHJlZXBpZHMiLCJnZXRUaHJlZXBpZHNXaXRoQmluZFN0YXR1cyIsImUiLCJpZFNlcnZlclVybCIsIndhcm4iLCJmaWx0ZXIiLCJhIiwibWVkaXVtIiwiYXV0aENsaWVudCIsIklkZW50aXR5QXV0aENsaWVudCIsImlkQWNjZXNzVG9rZW4iLCJnZXRBY2Nlc3NUb2tlbiIsImNoZWNrIiwic3RhcnRUZXJtc0Zsb3ciLCJTZXJ2aWNlIiwiU0VSVklDRV9UWVBFUyIsIklTIiwiZXh0cmFDbGFzc05hbWVzIiwicmVqZWN0IiwiYWJicmV2aWF0ZVVybCIsInJlbmRlclByb2ZpbGVTZWN0aW9uIiwicmVuZGVyQWNjb3VudFNlY3Rpb24iLCJwYXNzd29yZENoYW5nZUZvcm0iLCJvblBhc3N3b3JkQ2hhbmdlRXJyb3IiLCJvblBhc3N3b3JkQ2hhbmdlZCIsInRocmVlcGlkU2VjdGlvbiIsImdldFZhbHVlIiwiVUlGZWF0dXJlIiwiVGhpcmRQYXJ0eUlEIiwib25FbWFpbHNDaGFuZ2UiLCJvbk1zaXNkbnNDaGFuZ2UiLCJwYXNzd29yZENoYW5nZVRleHQiLCJyZW5kZXJMYW5ndWFnZVNlY3Rpb24iLCJvbkxhbmd1YWdlQ2hhbmdlIiwicmVuZGVyU3BlbGxDaGVja1NlY3Rpb24iLCJvblNwZWxsQ2hlY2tFbmFibGVkQ2hhbmdlIiwiSVNfTUFDIiwib25TcGVsbENoZWNrTGFuZ3VhZ2VzQ2hhbmdlIiwicmVuZGVyRGlzY292ZXJ5U2VjdGlvbiIsImludHJvIiwic2VydmVyTmFtZSIsInJlbmRlck1hbmFnZW1lbnRTZWN0aW9uIiwib25EZWFjdGl2YXRlQ2xpY2tlZCIsInJlbmRlckludGVncmF0aW9uTWFuYWdlclNlY3Rpb24iLCJXaWRnZXRzIiwicmVuZGVyIiwicGxhZiIsInN1cHBvcnRzTXVsdGlMYW5ndWFnZVNwZWxsQ2hlY2siLCJzdXBwb3J0c1NwZWxsQ2hlY2tTZXR0aW5ncyIsImRpc2NvV2FybmluZyIsInJlcXVpcmUiLCJkZWZhdWx0IiwiYWNjb3VudE1hbmFnZW1lbnRTZWN0aW9uIiwiRGVhY3RpdmF0ZSIsImRpc2NvdmVyeVNlY3Rpb24iLCJJZGVudGl0eVNlcnZlciJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL3RhYnMvdXNlci9HZW5lcmFsVXNlclNldHRpbmdzVGFiLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5Db3B5cmlnaHQgMjAxOSBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgU0VSVklDRV9UWVBFUyB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9zZXJ2aWNlLXR5cGVzXCI7XG5pbXBvcnQgeyBJVGhyZWVwaWQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL3RocmVlcGlkc1wiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBQcm9maWxlU2V0dGluZ3MgZnJvbSBcIi4uLy4uL1Byb2ZpbGVTZXR0aW5nc1wiO1xuaW1wb3J0ICogYXMgbGFuZ3VhZ2VIYW5kbGVyIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgTGFuZ3VhZ2VEcm9wZG93biBmcm9tIFwiLi4vLi4vLi4vZWxlbWVudHMvTGFuZ3VhZ2VEcm9wZG93blwiO1xuaW1wb3J0IFNwZWxsQ2hlY2tTZXR0aW5ncyBmcm9tIFwiLi4vLi4vU3BlbGxDaGVja1NldHRpbmdzXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vLi4vLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IERlYWN0aXZhdGVBY2NvdW50RGlhbG9nIGZyb20gXCIuLi8uLi8uLi9kaWFsb2dzL0RlYWN0aXZhdGVBY2NvdW50RGlhbG9nXCI7XG5pbXBvcnQgUGxhdGZvcm1QZWcgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL1BsYXRmb3JtUGVnXCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgTW9kYWwgZnJvbSBcIi4uLy4uLy4uLy4uLy4uL01vZGFsXCI7XG5pbXBvcnQgZGlzIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCB7IFBvbGljaWVzLCBTZXJ2aWNlLCBzdGFydFRlcm1zRmxvdyB9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9UZXJtc1wiO1xuaW1wb3J0IElkZW50aXR5QXV0aENsaWVudCBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vSWRlbnRpdHlBdXRoQ2xpZW50XCI7XG5pbXBvcnQgeyBhYmJyZXZpYXRlVXJsIH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL3V0aWxzL1VybFV0aWxzXCI7XG5pbXBvcnQgeyBnZXRUaHJlZXBpZHNXaXRoQmluZFN0YXR1cyB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL2JvdW5kVGhyZWVwaWRzJztcbmltcG9ydCBTcGlubmVyIGZyb20gXCIuLi8uLi8uLi9lbGVtZW50cy9TcGlubmVyXCI7XG5pbXBvcnQgeyBTZXR0aW5nTGV2ZWwgfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ0xldmVsXCI7XG5pbXBvcnQgeyBVSUZlYXR1cmUgfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vc2V0dGluZ3MvVUlGZWF0dXJlXCI7XG5pbXBvcnQgeyBBY3Rpb25QYXlsb2FkIH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHNcIjtcbmltcG9ydCBFcnJvckRpYWxvZyBmcm9tIFwiLi4vLi4vLi4vZGlhbG9ncy9FcnJvckRpYWxvZ1wiO1xuaW1wb3J0IEFjY291bnRQaG9uZU51bWJlcnMgZnJvbSBcIi4uLy4uL2FjY291bnQvUGhvbmVOdW1iZXJzXCI7XG5pbXBvcnQgQWNjb3VudEVtYWlsQWRkcmVzc2VzIGZyb20gXCIuLi8uLi9hY2NvdW50L0VtYWlsQWRkcmVzc2VzXCI7XG5pbXBvcnQgRGlzY292ZXJ5RW1haWxBZGRyZXNzZXMgZnJvbSBcIi4uLy4uL2Rpc2NvdmVyeS9FbWFpbEFkZHJlc3Nlc1wiO1xuaW1wb3J0IERpc2NvdmVyeVBob25lTnVtYmVycyBmcm9tIFwiLi4vLi4vZGlzY292ZXJ5L1Bob25lTnVtYmVyc1wiO1xuaW1wb3J0IENoYW5nZVBhc3N3b3JkIGZyb20gXCIuLi8uLi9DaGFuZ2VQYXNzd29yZFwiO1xuaW1wb3J0IElubGluZVRlcm1zQWdyZWVtZW50IGZyb20gXCIuLi8uLi8uLi90ZXJtcy9JbmxpbmVUZXJtc0FncmVlbWVudFwiO1xuaW1wb3J0IFNldElkU2VydmVyIGZyb20gXCIuLi8uLi9TZXRJZFNlcnZlclwiO1xuaW1wb3J0IFNldEludGVncmF0aW9uTWFuYWdlciBmcm9tIFwiLi4vLi4vU2V0SW50ZWdyYXRpb25NYW5hZ2VyXCI7XG5pbXBvcnQgVG9nZ2xlU3dpdGNoIGZyb20gXCIuLi8uLi8uLi9lbGVtZW50cy9Ub2dnbGVTd2l0Y2hcIjtcbmltcG9ydCB7IElTX01BQyB9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9LZXlib2FyZFwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBjbG9zZVNldHRpbmdzRm46ICgpID0+IHZvaWQ7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGxhbmd1YWdlOiBzdHJpbmc7XG4gICAgc3BlbGxDaGVja0VuYWJsZWQ6IGJvb2xlYW47XG4gICAgc3BlbGxDaGVja0xhbmd1YWdlczogc3RyaW5nW107XG4gICAgaGF2ZUlkU2VydmVyOiBib29sZWFuO1xuICAgIHNlcnZlclN1cHBvcnRzU2VwYXJhdGVBZGRBbmRCaW5kOiBib29sZWFuO1xuICAgIGlkU2VydmVySGFzVW5zaWduZWRUZXJtczogYm9vbGVhbjtcbiAgICByZXF1aXJlZFBvbGljeUluZm86IHsgICAgICAgLy8gVGhpcyBvYmplY3QgaXMgcGFzc2VkIGFsb25nIHRvIGEgY29tcG9uZW50IGZvciBoYW5kbGluZ1xuICAgICAgICBoYXNUZXJtczogYm9vbGVhbjtcbiAgICAgICAgcG9saWNpZXNBbmRTZXJ2aWNlczoge1xuICAgICAgICAgICAgc2VydmljZTogU2VydmljZTtcbiAgICAgICAgICAgIHBvbGljaWVzOiBQb2xpY2llcztcbiAgICAgICAgfVtdOyAvLyBGcm9tIHRoZSBzdGFydFRlcm1zRmxvdyBjYWxsYmFja1xuICAgICAgICBhZ3JlZWRVcmxzOiBzdHJpbmdbXTsgLy8gRnJvbSB0aGUgc3RhcnRUZXJtc0Zsb3cgY2FsbGJhY2tcbiAgICAgICAgcmVzb2x2ZTogKHZhbHVlczogc3RyaW5nW10pID0+IHZvaWQ7IC8vIFByb21pc2UgcmVzb2x2ZSBmdW5jdGlvbiBmb3Igc3RhcnRUZXJtc0Zsb3cgY2FsbGJhY2tcbiAgICB9O1xuICAgIGVtYWlsczogSVRocmVlcGlkW107XG4gICAgbXNpc2RuczogSVRocmVlcGlkW107XG4gICAgbG9hZGluZzNwaWRzOiBib29sZWFuOyAvLyB3aGV0aGVyIG9yIG5vdCB0aGUgZW1haWxzIGFuZCBtc2lzZG5zIGhhdmUgYmVlbiBsb2FkZWRcbiAgICBjYW5DaGFuZ2VQYXNzd29yZDogYm9vbGVhbjtcbiAgICBpZFNlcnZlck5hbWU6IHN0cmluZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2VuZXJhbFVzZXJTZXR0aW5nc1RhYiBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgZGlzcGF0Y2hlclJlZjogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGxhbmd1YWdlOiBsYW5ndWFnZUhhbmRsZXIuZ2V0Q3VycmVudExhbmd1YWdlKCksXG4gICAgICAgICAgICBzcGVsbENoZWNrRW5hYmxlZDogZmFsc2UsXG4gICAgICAgICAgICBzcGVsbENoZWNrTGFuZ3VhZ2VzOiBbXSxcbiAgICAgICAgICAgIGhhdmVJZFNlcnZlcjogQm9vbGVhbihNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwoKSksXG4gICAgICAgICAgICBzZXJ2ZXJTdXBwb3J0c1NlcGFyYXRlQWRkQW5kQmluZDogbnVsbCxcbiAgICAgICAgICAgIGlkU2VydmVySGFzVW5zaWduZWRUZXJtczogZmFsc2UsXG4gICAgICAgICAgICByZXF1aXJlZFBvbGljeUluZm86IHsgICAgICAgLy8gVGhpcyBvYmplY3QgaXMgcGFzc2VkIGFsb25nIHRvIGEgY29tcG9uZW50IGZvciBoYW5kbGluZ1xuICAgICAgICAgICAgICAgIGhhc1Rlcm1zOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBwb2xpY2llc0FuZFNlcnZpY2VzOiBudWxsLCAvLyBGcm9tIHRoZSBzdGFydFRlcm1zRmxvdyBjYWxsYmFja1xuICAgICAgICAgICAgICAgIGFncmVlZFVybHM6IG51bGwsICAgICAgICAgIC8vIEZyb20gdGhlIHN0YXJ0VGVybXNGbG93IGNhbGxiYWNrXG4gICAgICAgICAgICAgICAgcmVzb2x2ZTogbnVsbCwgICAgICAgICAgICAgLy8gUHJvbWlzZSByZXNvbHZlIGZ1bmN0aW9uIGZvciBzdGFydFRlcm1zRmxvdyBjYWxsYmFja1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVtYWlsczogW10sXG4gICAgICAgICAgICBtc2lzZG5zOiBbXSxcbiAgICAgICAgICAgIGxvYWRpbmczcGlkczogdHJ1ZSwgLy8gd2hldGhlciBvciBub3QgdGhlIGVtYWlscyBhbmQgbXNpc2RucyBoYXZlIGJlZW4gbG9hZGVkXG4gICAgICAgICAgICBjYW5DaGFuZ2VQYXNzd29yZDogZmFsc2UsXG4gICAgICAgICAgICBpZFNlcnZlck5hbWU6IG51bGwsXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyUmVmID0gZGlzLnJlZ2lzdGVyKHRoaXMub25BY3Rpb24pO1xuICAgIH1cblxuICAgIC8vIFRPRE86IFtSRUFDVC1XQVJOSU5HXSBNb3ZlIHRoaXMgdG8gY29uc3RydWN0b3JcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uLCBjYW1lbGNhc2VcbiAgICBwdWJsaWMgYXN5bmMgVU5TQUZFX2NvbXBvbmVudFdpbGxNb3VudCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuXG4gICAgICAgIGNvbnN0IHNlcnZlclN1cHBvcnRzU2VwYXJhdGVBZGRBbmRCaW5kID0gYXdhaXQgY2xpLmRvZXNTZXJ2ZXJTdXBwb3J0U2VwYXJhdGVBZGRBbmRCaW5kKCk7XG5cbiAgICAgICAgY29uc3QgY2FwYWJpbGl0aWVzID0gYXdhaXQgY2xpLmdldENhcGFiaWxpdGllcygpOyAvLyB0aGlzIGlzIGNhY2hlZFxuICAgICAgICBjb25zdCBjaGFuZ2VQYXNzd29yZENhcCA9IGNhcGFiaWxpdGllc1snbS5jaGFuZ2VfcGFzc3dvcmQnXTtcblxuICAgICAgICAvLyBZb3UgY2FuIGNoYW5nZSB5b3VyIHBhc3N3b3JkIHNvIGxvbmcgYXMgdGhlIGNhcGFiaWxpdHkgaXNuJ3QgZXhwbGljaXRseSBkaXNhYmxlZC4gVGhlIGltcGxpY2l0XG4gICAgICAgIC8vIGJlaGF2aW91ciBpcyB5b3UgY2FuIGNoYW5nZSB5b3VyIHBhc3N3b3JkIHdoZW4gdGhlIGNhcGFiaWxpdHkgaXMgbWlzc2luZyBvciBoYXMgbm90LWZhbHNlIGFzXG4gICAgICAgIC8vIHRoZSBlbmFibGVkIGZsYWcgdmFsdWUuXG4gICAgICAgIGNvbnN0IGNhbkNoYW5nZVBhc3N3b3JkID0gIWNoYW5nZVBhc3N3b3JkQ2FwIHx8IGNoYW5nZVBhc3N3b3JkQ2FwWydlbmFibGVkJ10gIT09IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzZXJ2ZXJTdXBwb3J0c1NlcGFyYXRlQWRkQW5kQmluZCwgY2FuQ2hhbmdlUGFzc3dvcmQgfSk7XG5cbiAgICAgICAgdGhpcy5nZXRUaHJlZXBpZFN0YXRlKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGNvbXBvbmVudERpZE1vdW50KCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBwbGF0ID0gUGxhdGZvcm1QZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IFtzcGVsbENoZWNrRW5hYmxlZCwgc3BlbGxDaGVja0xhbmd1YWdlc10gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgICAgICBwbGF0LmdldFNwZWxsQ2hlY2tFbmFibGVkKCksXG4gICAgICAgICAgICBwbGF0LmdldFNwZWxsQ2hlY2tMYW5ndWFnZXMoKSxcbiAgICAgICAgXSk7XG5cbiAgICAgICAgaWYgKHNwZWxsQ2hlY2tMYW5ndWFnZXMpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHNwZWxsQ2hlY2tFbmFibGVkLFxuICAgICAgICAgICAgICAgIHNwZWxsQ2hlY2tMYW5ndWFnZXMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICAgICAgZGlzLnVucmVnaXN0ZXIodGhpcy5kaXNwYXRjaGVyUmVmKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQWN0aW9uID0gKHBheWxvYWQ6IEFjdGlvblBheWxvYWQpOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKHBheWxvYWQuYWN0aW9uID09PSAnaWRfc2VydmVyX2NoYW5nZWQnKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgaGF2ZUlkU2VydmVyOiBCb29sZWFuKE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRJZGVudGl0eVNlcnZlclVybCgpKSB9KTtcbiAgICAgICAgICAgIHRoaXMuZ2V0VGhyZWVwaWRTdGF0ZSgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25FbWFpbHNDaGFuZ2UgPSAoZW1haWxzOiBJVGhyZWVwaWRbXSk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgZW1haWxzIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uTXNpc2Ruc0NoYW5nZSA9IChtc2lzZG5zOiBJVGhyZWVwaWRbXSk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgbXNpc2RucyB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBhc3luYyBnZXRUaHJlZXBpZFN0YXRlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG5cbiAgICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHRlcm1zIG5lZWQgYWNjZXB0aW5nXG4gICAgICAgIHRoaXMuY2hlY2tUZXJtcygpO1xuXG4gICAgICAgIC8vIE5lZWQgdG8gZ2V0IDNQSURzIGdlbmVyYWxseSBmb3IgQWNjb3VudCBzZWN0aW9uIGFuZCBwb3NzaWJseSBhbHNvIGZvclxuICAgICAgICAvLyBEaXNjb3ZlcnkgKGFzc3VtaW5nIHdlIGhhdmUgYW4gSVMgYW5kIHRlcm1zIGFyZSBhZ3JlZWQpLlxuICAgICAgICBsZXQgdGhyZWVwaWRzID0gW107XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aHJlZXBpZHMgPSBhd2FpdCBnZXRUaHJlZXBpZHNXaXRoQmluZFN0YXR1cyhjbGkpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zdCBpZFNlcnZlclVybCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRJZGVudGl0eVNlcnZlclVybCgpO1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oXG4gICAgICAgICAgICAgICAgYFVuYWJsZSB0byByZWFjaCBpZGVudGl0eSBzZXJ2ZXIgYXQgJHtpZFNlcnZlclVybH0gdG8gY2hlY2sgYCArXG4gICAgICAgICAgICAgICAgYGZvciAzUElEcyBiaW5kaW5ncyBpbiBTZXR0aW5nc2AsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBlbWFpbHM6IHRocmVlcGlkcy5maWx0ZXIoKGEpID0+IGEubWVkaXVtID09PSAnZW1haWwnKSxcbiAgICAgICAgICAgIG1zaXNkbnM6IHRocmVlcGlkcy5maWx0ZXIoKGEpID0+IGEubWVkaXVtID09PSAnbXNpc2RuJyksXG4gICAgICAgICAgICBsb2FkaW5nM3BpZHM6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGNoZWNrVGVybXMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5oYXZlSWRTZXJ2ZXIpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBpZFNlcnZlckhhc1Vuc2lnbmVkVGVybXM6IGZhbHNlIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQnkgc3RhcnRpbmcgdGhlIHRlcm1zIGZsb3cgd2UgZ2V0IHRoZSBsb2dpYyBmb3IgY2hlY2tpbmcgd2hpY2ggdGVybXMgdGhlIHVzZXIgaGFzIHNpZ25lZFxuICAgICAgICAvLyBmb3IgZnJlZS4gU28gd2UgbWlnaHQgYXMgd2VsbCB1c2UgdGhhdCBmb3Igb3VyIG93biBwdXJwb3Nlcy5cbiAgICAgICAgY29uc3QgaWRTZXJ2ZXJVcmwgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwoKTtcbiAgICAgICAgY29uc3QgYXV0aENsaWVudCA9IG5ldyBJZGVudGl0eUF1dGhDbGllbnQoKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGlkQWNjZXNzVG9rZW4gPSBhd2FpdCBhdXRoQ2xpZW50LmdldEFjY2Vzc1Rva2VuKHsgY2hlY2s6IGZhbHNlIH0pO1xuICAgICAgICAgICAgYXdhaXQgc3RhcnRUZXJtc0Zsb3coW25ldyBTZXJ2aWNlKFxuICAgICAgICAgICAgICAgIFNFUlZJQ0VfVFlQRVMuSVMsXG4gICAgICAgICAgICAgICAgaWRTZXJ2ZXJVcmwsXG4gICAgICAgICAgICAgICAgaWRBY2Nlc3NUb2tlbixcbiAgICAgICAgICAgICldLCAocG9saWNpZXNBbmRTZXJ2aWNlcywgYWdyZWVkVXJscywgZXh0cmFDbGFzc05hbWVzKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZFNlcnZlck5hbWU6IGFiYnJldmlhdGVVcmwoaWRTZXJ2ZXJVcmwpLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWRQb2xpY3lJbmZvOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFzVGVybXM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9saWNpZXNBbmRTZXJ2aWNlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhZ3JlZWRVcmxzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gVXNlciBhY2NlcHRlZCBhbGwgdGVybXNcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHJlcXVpcmVkUG9saWN5SW5mbzoge1xuICAgICAgICAgICAgICAgICAgICAuLi50aGlzLnN0YXRlLnJlcXVpcmVkUG9saWN5SW5mbywgLy8gc2V0IGZpcnN0IHNvIHdlIGNhbiBvdmVycmlkZVxuICAgICAgICAgICAgICAgICAgICBoYXNUZXJtczogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBsb2dnZXIud2FybihcbiAgICAgICAgICAgICAgICBgVW5hYmxlIHRvIHJlYWNoIGlkZW50aXR5IHNlcnZlciBhdCAke2lkU2VydmVyVXJsfSB0byBjaGVjayBgICtcbiAgICAgICAgICAgICAgICBgZm9yIHRlcm1zIGluIFNldHRpbmdzYCxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBsb2dnZXIud2FybihlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25MYW5ndWFnZUNoYW5nZSA9IChuZXdMYW5ndWFnZTogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmxhbmd1YWdlID09PSBuZXdMYW5ndWFnZSkgcmV0dXJuO1xuXG4gICAgICAgIFNldHRpbmdzU3RvcmUuc2V0VmFsdWUoXCJsYW5ndWFnZVwiLCBudWxsLCBTZXR0aW5nTGV2ZWwuREVWSUNFLCBuZXdMYW5ndWFnZSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBsYW5ndWFnZTogbmV3TGFuZ3VhZ2UgfSk7XG4gICAgICAgIGNvbnN0IHBsYXRmb3JtID0gUGxhdGZvcm1QZWcuZ2V0KCk7XG4gICAgICAgIGlmIChwbGF0Zm9ybSkge1xuICAgICAgICAgICAgcGxhdGZvcm0uc2V0TGFuZ3VhZ2UoW25ld0xhbmd1YWdlXSk7XG4gICAgICAgICAgICBwbGF0Zm9ybS5yZWxvYWQoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uU3BlbGxDaGVja0xhbmd1YWdlc0NoYW5nZSA9IChsYW5ndWFnZXM6IHN0cmluZ1tdKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzcGVsbENoZWNrTGFuZ3VhZ2VzOiBsYW5ndWFnZXMgfSk7XG4gICAgICAgIFBsYXRmb3JtUGVnLmdldCgpPy5zZXRTcGVsbENoZWNrTGFuZ3VhZ2VzKGxhbmd1YWdlcyk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25TcGVsbENoZWNrRW5hYmxlZENoYW5nZSA9IChzcGVsbENoZWNrRW5hYmxlZDogYm9vbGVhbik6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgc3BlbGxDaGVja0VuYWJsZWQgfSk7XG4gICAgICAgIFBsYXRmb3JtUGVnLmdldCgpPy5zZXRTcGVsbENoZWNrRW5hYmxlZChzcGVsbENoZWNrRW5hYmxlZCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25QYXNzd29yZENoYW5nZUVycm9yID0gKGVycik6IHZvaWQgPT4ge1xuICAgICAgICAvLyBUT0RPOiBGaWd1cmUgb3V0IGEgZGVzaWduIHRoYXQgZG9lc24ndCBpbnZvbHZlIHJlcGxhY2luZyB0aGUgY3VycmVudCBkaWFsb2dcbiAgICAgICAgbGV0IGVyck1zZyA9IGVyci5lcnJvciB8fCBlcnIubWVzc2FnZSB8fCBcIlwiO1xuICAgICAgICBpZiAoZXJyLmh0dHBTdGF0dXMgPT09IDQwMykge1xuICAgICAgICAgICAgZXJyTXNnID0gX3QoXCJGYWlsZWQgdG8gY2hhbmdlIHBhc3N3b3JkLiBJcyB5b3VyIHBhc3N3b3JkIGNvcnJlY3Q/XCIpO1xuICAgICAgICB9IGVsc2UgaWYgKCFlcnJNc2cpIHtcbiAgICAgICAgICAgIGVyck1zZyArPSBgIChIVFRQIHN0YXR1cyAke2Vyci5odHRwU3RhdHVzfSlgO1xuICAgICAgICB9XG4gICAgICAgIGxvZ2dlci5lcnJvcihcIkZhaWxlZCB0byBjaGFuZ2UgcGFzc3dvcmQ6IFwiICsgZXJyTXNnKTtcbiAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICB0aXRsZTogX3QoXCJFcnJvclwiKSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBlcnJNc2csXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUGFzc3dvcmRDaGFuZ2VkID0gKHsgZGlkTG9nb3V0T3V0T3RoZXJEZXZpY2VzIH06IHsgZGlkTG9nb3V0T3V0T3RoZXJEZXZpY2VzOiBib29sZWFuIH0pOiB2b2lkID0+IHtcbiAgICAgICAgbGV0IGRlc2NyaXB0aW9uID0gX3QoXCJZb3VyIHBhc3N3b3JkIHdhcyBzdWNjZXNzZnVsbHkgY2hhbmdlZC5cIik7XG4gICAgICAgIGlmIChkaWRMb2dvdXRPdXRPdGhlckRldmljZXMpIHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uICs9IFwiIFwiICsgX3QoXG4gICAgICAgICAgICAgICAgXCJZb3Ugd2lsbCBub3QgcmVjZWl2ZSBwdXNoIG5vdGlmaWNhdGlvbnMgb24gb3RoZXIgZGV2aWNlcyB1bnRpbCB5b3Ugc2lnbiBiYWNrIGluIHRvIHRoZW0uXCIsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRPRE86IEZpZ3VyZSBvdXQgYSBkZXNpZ24gdGhhdCBkb2Vzbid0IGludm9sdmUgcmVwbGFjaW5nIHRoZSBjdXJyZW50IGRpYWxvZ1xuICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgIHRpdGxlOiBfdChcIlN1Y2Nlc3NcIiksXG4gICAgICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25EZWFjdGl2YXRlQ2xpY2tlZCA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKERlYWN0aXZhdGVBY2NvdW50RGlhbG9nLCB7XG4gICAgICAgICAgICBvbkZpbmlzaGVkOiAoc3VjY2VzcykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChzdWNjZXNzKSB0aGlzLnByb3BzLmNsb3NlU2V0dGluZ3NGbigpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgcmVuZGVyUHJvZmlsZVNlY3Rpb24oKTogSlNYLkVsZW1lbnQge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zZWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgPFByb2ZpbGVTZXR0aW5ncyAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJBY2NvdW50U2VjdGlvbigpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIGxldCBwYXNzd29yZENoYW5nZUZvcm0gPSAoXG4gICAgICAgICAgICA8Q2hhbmdlUGFzc3dvcmRcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9HZW5lcmFsVXNlclNldHRpbmdzVGFiX2NoYW5nZVBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICByb3dDbGFzc05hbWU9XCJcIlxuICAgICAgICAgICAgICAgIGJ1dHRvbktpbmQ9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgICAgICBvbkVycm9yPXt0aGlzLm9uUGFzc3dvcmRDaGFuZ2VFcnJvcn1cbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLm9uUGFzc3dvcmRDaGFuZ2VkfSAvPlxuICAgICAgICApO1xuXG4gICAgICAgIGxldCB0aHJlZXBpZFNlY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIC8vIEZvciBvbGRlciBob21lc2VydmVycyB3aXRob3V0IHNlcGFyYXRlIDNQSUQgYWRkIGFuZCBiaW5kIG1ldGhvZHMgKE1TQzIyOTApLFxuICAgICAgICAvLyB3ZSB1c2UgYSBjb21ibyBhZGQgd2l0aCBiaW5kIG9wdGlvbiBBUEkgd2hpY2ggcmVxdWlyZXMgYW4gaWRlbnRpdHkgc2VydmVyIHRvXG4gICAgICAgIC8vIHZhbGlkYXRlIDNQSUQgb3duZXJzaGlwIGV2ZW4gaWYgd2UncmUganVzdCBhZGRpbmcgdG8gdGhlIGhvbWVzZXJ2ZXIgb25seS5cbiAgICAgICAgLy8gRm9yIG5ld2VyIGhvbWVzZXJ2ZXJzIHdpdGggc2VwYXJhdGUgM1BJRCBhZGQgYW5kIGJpbmQgbWV0aG9kcyAoTVNDMjI5MCksXG4gICAgICAgIC8vIHRoZXJlIGlzIG5vIHN1Y2ggY29uY2Vybiwgc28gd2UgY2FuIGFsd2F5cyBzaG93IHRoZSBIUyBhY2NvdW50IDNQSURzLlxuICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShVSUZlYXR1cmUuVGhpcmRQYXJ0eUlEKSAmJlxuICAgICAgICAgICAgKHRoaXMuc3RhdGUuaGF2ZUlkU2VydmVyIHx8IHRoaXMuc3RhdGUuc2VydmVyU3VwcG9ydHNTZXBhcmF0ZUFkZEFuZEJpbmQgPT09IHRydWUpXG4gICAgICAgICkge1xuICAgICAgICAgICAgY29uc3QgZW1haWxzID0gdGhpcy5zdGF0ZS5sb2FkaW5nM3BpZHNcbiAgICAgICAgICAgICAgICA/IDxTcGlubmVyIC8+XG4gICAgICAgICAgICAgICAgOiA8QWNjb3VudEVtYWlsQWRkcmVzc2VzXG4gICAgICAgICAgICAgICAgICAgIGVtYWlscz17dGhpcy5zdGF0ZS5lbWFpbHN9XG4gICAgICAgICAgICAgICAgICAgIG9uRW1haWxzQ2hhbmdlPXt0aGlzLm9uRW1haWxzQ2hhbmdlfVxuICAgICAgICAgICAgICAgIC8+O1xuICAgICAgICAgICAgY29uc3QgbXNpc2RucyA9IHRoaXMuc3RhdGUubG9hZGluZzNwaWRzXG4gICAgICAgICAgICAgICAgPyA8U3Bpbm5lciAvPlxuICAgICAgICAgICAgICAgIDogPEFjY291bnRQaG9uZU51bWJlcnNcbiAgICAgICAgICAgICAgICAgICAgbXNpc2Rucz17dGhpcy5zdGF0ZS5tc2lzZG5zfVxuICAgICAgICAgICAgICAgICAgICBvbk1zaXNkbnNDaGFuZ2U9e3RoaXMub25Nc2lzZG5zQ2hhbmdlfVxuICAgICAgICAgICAgICAgIC8+O1xuICAgICAgICAgICAgdGhyZWVwaWRTZWN0aW9uID0gPGRpdj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nXCI+eyBfdChcIkVtYWlsIGFkZHJlc3Nlc1wiKSB9PC9zcGFuPlxuICAgICAgICAgICAgICAgIHsgZW1haWxzIH1cblxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3N1YmhlYWRpbmdcIj57IF90KFwiUGhvbmUgbnVtYmVyc1wiKSB9PC9zcGFuPlxuICAgICAgICAgICAgICAgIHsgbXNpc2RucyB9XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5zZXJ2ZXJTdXBwb3J0c1NlcGFyYXRlQWRkQW5kQmluZCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyZWVwaWRTZWN0aW9uID0gPFNwaW5uZXIgLz47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcGFzc3dvcmRDaGFuZ2VUZXh0ID0gX3QoXCJTZXQgYSBuZXcgYWNjb3VudCBwYXNzd29yZC4uLlwiKTtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmNhbkNoYW5nZVBhc3N3b3JkKSB7XG4gICAgICAgICAgICAvLyBKdXN0IGRvbid0IHNob3cgYW55dGhpbmcgaWYgeW91IGNhbid0IGRvIGFueXRoaW5nLlxuICAgICAgICAgICAgcGFzc3dvcmRDaGFuZ2VUZXh0ID0gbnVsbDtcbiAgICAgICAgICAgIHBhc3N3b3JkQ2hhbmdlRm9ybSA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zZWN0aW9uIG14X0dlbmVyYWxVc2VyU2V0dGluZ3NUYWJfYWNjb3VudFNlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nXCI+eyBfdChcIkFjY291bnRcIikgfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dFwiPlxuICAgICAgICAgICAgICAgICAgICB7IHBhc3N3b3JkQ2hhbmdlVGV4dCB9XG4gICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgIHsgcGFzc3dvcmRDaGFuZ2VGb3JtIH1cbiAgICAgICAgICAgICAgICB7IHRocmVlcGlkU2VjdGlvbiB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlckxhbmd1YWdlU2VjdGlvbigpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIC8vIFRPRE86IENvbnZlcnQgdG8gbmV3LXN0eWxlZCBGaWVsZFxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zZWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc3ViaGVhZGluZ1wiPnsgX3QoXCJMYW5ndWFnZSBhbmQgcmVnaW9uXCIpIH08L3NwYW4+XG4gICAgICAgICAgICAgICAgPExhbmd1YWdlRHJvcGRvd25cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfR2VuZXJhbFVzZXJTZXR0aW5nc1RhYl9sYW5ndWFnZUlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgb25PcHRpb25DaGFuZ2U9e3RoaXMub25MYW5ndWFnZUNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUubGFuZ3VhZ2V9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyU3BlbGxDaGVja1NlY3Rpb24oKTogSlNYLkVsZW1lbnQge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zZWN0aW9uIG14X1NldHRpbmdzVGFiX3NlY3Rpb25fc3BlbGxjaGVja1wiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3N1YmhlYWRpbmdcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIlNwZWxsIGNoZWNrXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgPFRvZ2dsZVN3aXRjaFxuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tlZD17dGhpcy5zdGF0ZS5zcGVsbENoZWNrRW5hYmxlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uU3BlbGxDaGVja0VuYWJsZWRDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIHsgKHRoaXMuc3RhdGUuc3BlbGxDaGVja0VuYWJsZWQgJiYgIUlTX01BQykgJiYgPFNwZWxsQ2hlY2tTZXR0aW5nc1xuICAgICAgICAgICAgICAgICAgICBsYW5ndWFnZXM9e3RoaXMuc3RhdGUuc3BlbGxDaGVja0xhbmd1YWdlc31cbiAgICAgICAgICAgICAgICAgICAgb25MYW5ndWFnZXNDaGFuZ2U9e3RoaXMub25TcGVsbENoZWNrTGFuZ3VhZ2VzQ2hhbmdlfVxuICAgICAgICAgICAgICAgIC8+IH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyRGlzY292ZXJ5U2VjdGlvbigpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnJlcXVpcmVkUG9saWN5SW5mby5oYXNUZXJtcykge1xuICAgICAgICAgICAgY29uc3QgaW50cm8gPSA8c3BhbiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dFwiPlxuICAgICAgICAgICAgICAgIHsgX3QoXG4gICAgICAgICAgICAgICAgICAgIFwiQWdyZWUgdG8gdGhlIGlkZW50aXR5IHNlcnZlciAoJShzZXJ2ZXJOYW1lKXMpIFRlcm1zIG9mIFNlcnZpY2UgdG8gXCIgK1xuICAgICAgICAgICAgICAgICAgICBcImFsbG93IHlvdXJzZWxmIHRvIGJlIGRpc2NvdmVyYWJsZSBieSBlbWFpbCBhZGRyZXNzIG9yIHBob25lIG51bWJlci5cIixcbiAgICAgICAgICAgICAgICAgICAgeyBzZXJ2ZXJOYW1lOiB0aGlzLnN0YXRlLmlkU2VydmVyTmFtZSB9LFxuICAgICAgICAgICAgICAgICkgfVxuICAgICAgICAgICAgPC9zcGFuPjtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPElubGluZVRlcm1zQWdyZWVtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICBwb2xpY2llc0FuZFNlcnZpY2VQYWlycz17dGhpcy5zdGF0ZS5yZXF1aXJlZFBvbGljeUluZm8ucG9saWNpZXNBbmRTZXJ2aWNlc31cbiAgICAgICAgICAgICAgICAgICAgICAgIGFncmVlZFVybHM9e3RoaXMuc3RhdGUucmVxdWlyZWRQb2xpY3lJbmZvLmFncmVlZFVybHN9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLnN0YXRlLnJlcXVpcmVkUG9saWN5SW5mby5yZXNvbHZlfVxuICAgICAgICAgICAgICAgICAgICAgICAgaW50cm9FbGVtZW50PXtpbnRyb31cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgeyAvKiBoYXMgaXRzIG93biBoZWFkaW5nIGFzIGl0IGluY2x1ZGVzIHRoZSBjdXJyZW50IGlkZW50aXR5IHNlcnZlciAqLyB9XG4gICAgICAgICAgICAgICAgICAgIDxTZXRJZFNlcnZlciBtaXNzaW5nVGVybXM9e3RydWV9IC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZW1haWxzID0gdGhpcy5zdGF0ZS5sb2FkaW5nM3BpZHMgPyA8U3Bpbm5lciAvPiA6IDxEaXNjb3ZlcnlFbWFpbEFkZHJlc3NlcyBlbWFpbHM9e3RoaXMuc3RhdGUuZW1haWxzfSAvPjtcbiAgICAgICAgY29uc3QgbXNpc2RucyA9IHRoaXMuc3RhdGUubG9hZGluZzNwaWRzID8gPFNwaW5uZXIgLz4gOiA8RGlzY292ZXJ5UGhvbmVOdW1iZXJzIG1zaXNkbnM9e3RoaXMuc3RhdGUubXNpc2Ruc30gLz47XG5cbiAgICAgICAgY29uc3QgdGhyZWVwaWRTZWN0aW9uID0gdGhpcy5zdGF0ZS5oYXZlSWRTZXJ2ZXIgPyA8ZGl2IGNsYXNzTmFtZT0nbXhfR2VuZXJhbFVzZXJTZXR0aW5nc1RhYl9kaXNjb3ZlcnknPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc3ViaGVhZGluZ1wiPnsgX3QoXCJFbWFpbCBhZGRyZXNzZXNcIikgfTwvc3Bhbj5cbiAgICAgICAgICAgIHsgZW1haWxzIH1cblxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc3ViaGVhZGluZ1wiPnsgX3QoXCJQaG9uZSBudW1iZXJzXCIpIH08L3NwYW4+XG4gICAgICAgICAgICB7IG1zaXNkbnMgfVxuICAgICAgICA8L2Rpdj4gOiBudWxsO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3NlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICB7IHRocmVlcGlkU2VjdGlvbiB9XG4gICAgICAgICAgICAgICAgeyAvKiBoYXMgaXRzIG93biBoZWFkaW5nIGFzIGl0IGluY2x1ZGVzIHRoZSBjdXJyZW50IGlkZW50aXR5IHNlcnZlciAqLyB9XG4gICAgICAgICAgICAgICAgPFNldElkU2VydmVyIG1pc3NpbmdUZXJtcz17ZmFsc2V9IC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlck1hbmFnZW1lbnRTZWN0aW9uKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgLy8gVE9ETzogSW1wcm92ZSB3YXJuaW5nIHRleHQgZm9yIGFjY291bnQgZGVhY3RpdmF0aW9uXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3NlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zdWJoZWFkaW5nXCI+eyBfdChcIkFjY291bnQgbWFuYWdlbWVudFwiKSB9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0XCI+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJEZWFjdGl2YXRpbmcgeW91ciBhY2NvdW50IGlzIGEgcGVybWFuZW50IGFjdGlvbiDigJQgYmUgY2FyZWZ1bCFcIikgfVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXt0aGlzLm9uRGVhY3RpdmF0ZUNsaWNrZWR9IGtpbmQ9XCJkYW5nZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIkRlYWN0aXZhdGUgQWNjb3VudFwiKSB9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJJbnRlZ3JhdGlvbk1hbmFnZXJTZWN0aW9uKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgaWYgKCFTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFVJRmVhdHVyZS5XaWRnZXRzKSkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfc2VjdGlvblwiPlxuICAgICAgICAgICAgICAgIHsgLyogaGFzIGl0cyBvd24gaGVhZGluZyBhcyBpdCBpbmNsdWRlcyB0aGUgY3VycmVudCBpbnRlZ3JhdGlvbiBtYW5hZ2VyICovIH1cbiAgICAgICAgICAgICAgICA8U2V0SW50ZWdyYXRpb25NYW5hZ2VyIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVuZGVyKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgY29uc3QgcGxhZiA9IFBsYXRmb3JtUGVnLmdldCgpO1xuICAgICAgICBjb25zdCBzdXBwb3J0c011bHRpTGFuZ3VhZ2VTcGVsbENoZWNrID0gcGxhZi5zdXBwb3J0c1NwZWxsQ2hlY2tTZXR0aW5ncygpO1xuXG4gICAgICAgIGNvbnN0IGRpc2NvV2FybmluZyA9IHRoaXMuc3RhdGUucmVxdWlyZWRQb2xpY3lJbmZvLmhhc1Rlcm1zXG4gICAgICAgICAgICA/IDxpbWdcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9J214X0dlbmVyYWxVc2VyU2V0dGluZ3NUYWJfd2FybmluZ0ljb24nXG4gICAgICAgICAgICAgICAgc3JjPXtyZXF1aXJlKFwiLi4vLi4vLi4vLi4vLi4vLi4vcmVzL2ltZy9mZWF0aGVyLWN1c3RvbWlzZWQvd2FybmluZy10cmlhbmdsZS5zdmdcIikuZGVmYXVsdH1cbiAgICAgICAgICAgICAgICB3aWR0aD1cIjE4XCJcbiAgICAgICAgICAgICAgICBoZWlnaHQ9XCIxOFwiXG4gICAgICAgICAgICAgICAgYWx0PXtfdChcIldhcm5pbmdcIil9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgOiBudWxsO1xuXG4gICAgICAgIGxldCBhY2NvdW50TWFuYWdlbWVudFNlY3Rpb247XG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFVJRmVhdHVyZS5EZWFjdGl2YXRlKSkge1xuICAgICAgICAgICAgYWNjb3VudE1hbmFnZW1lbnRTZWN0aW9uID0gPD5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX2hlYWRpbmdcIj57IF90KFwiRGVhY3RpdmF0ZSBhY2NvdW50XCIpIH08L2Rpdj5cbiAgICAgICAgICAgICAgICB7IHRoaXMucmVuZGVyTWFuYWdlbWVudFNlY3Rpb24oKSB9XG4gICAgICAgICAgICA8Lz47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZGlzY292ZXJ5U2VjdGlvbjtcbiAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoVUlGZWF0dXJlLklkZW50aXR5U2VydmVyKSkge1xuICAgICAgICAgICAgZGlzY292ZXJ5U2VjdGlvbiA9IDw+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9oZWFkaW5nXCI+eyBkaXNjb1dhcm5pbmcgfSB7IF90KFwiRGlzY292ZXJ5XCIpIH08L2Rpdj5cbiAgICAgICAgICAgICAgICB7IHRoaXMucmVuZGVyRGlzY292ZXJ5U2VjdGlvbigpIH1cbiAgICAgICAgICAgIDwvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9oZWFkaW5nXCI+eyBfdChcIkdlbmVyYWxcIikgfTwvZGl2PlxuICAgICAgICAgICAgICAgIHsgdGhpcy5yZW5kZXJQcm9maWxlU2VjdGlvbigpIH1cbiAgICAgICAgICAgICAgICB7IHRoaXMucmVuZGVyQWNjb3VudFNlY3Rpb24oKSB9XG4gICAgICAgICAgICAgICAgeyB0aGlzLnJlbmRlckxhbmd1YWdlU2VjdGlvbigpIH1cbiAgICAgICAgICAgICAgICB7IHN1cHBvcnRzTXVsdGlMYW5ndWFnZVNwZWxsQ2hlY2sgPyB0aGlzLnJlbmRlclNwZWxsQ2hlY2tTZWN0aW9uKCkgOiBudWxsIH1cbiAgICAgICAgICAgICAgICB7IGRpc2NvdmVyeVNlY3Rpb24gfVxuICAgICAgICAgICAgICAgIHsgdGhpcy5yZW5kZXJJbnRlZ3JhdGlvbk1hbmFnZXJTZWN0aW9uKCkgLyogSGFzIGl0cyBvd24gdGl0bGUgKi8gfVxuICAgICAgICAgICAgICAgIHsgYWNjb3VudE1hbmFnZW1lbnRTZWN0aW9uIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFrQkE7O0FBQ0E7O0FBRUE7O0FBRUE7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7QUE2QmUsTUFBTUEsc0JBQU4sU0FBcUNDLGNBQUEsQ0FBTUMsU0FBM0MsQ0FBcUU7RUFHaEZDLFdBQVcsQ0FBQ0MsS0FBRCxFQUFnQjtJQUN2QixNQUFNQSxLQUFOO0lBRHVCO0lBQUEsZ0RBaUVQQyxPQUFELElBQWtDO01BQ2pELElBQUlBLE9BQU8sQ0FBQ0MsTUFBUixLQUFtQixtQkFBdkIsRUFBNEM7UUFDeEMsS0FBS0MsUUFBTCxDQUFjO1VBQUVDLFlBQVksRUFBRUMsT0FBTyxDQUFDQyxnQ0FBQSxDQUFnQkMsR0FBaEIsR0FBc0JDLG9CQUF0QixFQUFEO1FBQXZCLENBQWQ7UUFDQSxLQUFLQyxnQkFBTDtNQUNIO0lBQ0osQ0F0RTBCO0lBQUEsc0RBd0VEQyxNQUFELElBQStCO01BQ3BELEtBQUtQLFFBQUwsQ0FBYztRQUFFTztNQUFGLENBQWQ7SUFDSCxDQTFFMEI7SUFBQSx1REE0RUFDLE9BQUQsSUFBZ0M7TUFDdEQsS0FB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