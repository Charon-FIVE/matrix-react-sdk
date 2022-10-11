"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _fileSaver = _interopRequireDefault(require("file-saver"));

var _logger = require("matrix-js-sdk/src/logger");

var _crypto = require("matrix-js-sdk/src/crypto");

var _MatrixClientPeg = require("../../../../MatrixClientPeg");

var _languageHandler = require("../../../../languageHandler");

var _Modal = _interopRequireDefault(require("../../../../Modal"));

var _SecurityManager = require("../../../../SecurityManager");

var _strings = require("../../../../utils/strings");

var _InteractiveAuthEntryComponents = require("../../../../components/views/auth/InteractiveAuthEntryComponents");

var _PassphraseField = _interopRequireDefault(require("../../../../components/views/auth/PassphraseField"));

var _StyledRadioButton = _interopRequireDefault(require("../../../../components/views/elements/StyledRadioButton"));

var _AccessibleButton = _interopRequireDefault(require("../../../../components/views/elements/AccessibleButton"));

var _DialogButtons = _interopRequireDefault(require("../../../../components/views/elements/DialogButtons"));

var _InlineSpinner = _interopRequireDefault(require("../../../../components/views/elements/InlineSpinner"));

var _RestoreKeyBackupDialog = _interopRequireDefault(require("../../../../components/views/dialogs/security/RestoreKeyBackupDialog"));

var _WellKnownUtils = require("../../../../utils/WellKnownUtils");

var _Security = _interopRequireDefault(require("../../../../customisations/Security"));

var _Field = _interopRequireDefault(require("../../../../components/views/elements/Field"));

var _BaseDialog = _interopRequireDefault(require("../../../../components/views/dialogs/BaseDialog"));

var _Spinner = _interopRequireDefault(require("../../../../components/views/elements/Spinner"));

var _InteractiveAuthDialog = _interopRequireDefault(require("../../../../components/views/dialogs/InteractiveAuthDialog"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2018, 2019 New Vector Ltd
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.

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
// I made a mistake while converting this and it has to be fixed!
var Phase;

(function (Phase) {
  Phase["Loading"] = "loading";
  Phase["LoadError"] = "load_error";
  Phase["ChooseKeyPassphrase"] = "choose_key_passphrase";
  Phase["Migrate"] = "migrate";
  Phase["Passphrase"] = "passphrase";
  Phase["PassphraseConfirm"] = "passphrase_confirm";
  Phase["ShowKey"] = "show_key";
  Phase["Storing"] = "storing";
  Phase["ConfirmSkip"] = "confirm_skip";
})(Phase || (Phase = {}));

const PASSWORD_MIN_SCORE = 4; // So secure, many characters, much complex, wow, etc, etc.

/*
 * Walks the user through the process of creating a passphrase to guard Secure
 * Secret Storage in account data.
 */
class CreateSecretStorageDialog extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "recoveryKey", void 0);
    (0, _defineProperty2.default)(this, "backupKey", void 0);
    (0, _defineProperty2.default)(this, "recoveryKeyNode", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "passphraseField", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "onKeyBackupStatusChange", () => {
      if (this.state.phase === Phase.Migrate) this.fetchBackupInfo();
    });
    (0, _defineProperty2.default)(this, "onKeyPassphraseChange", e => {
      this.setState({
        passPhraseKeySelected: e.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onChooseKeyPassphraseFormSubmit", async () => {
      if (this.state.passPhraseKeySelected === _WellKnownUtils.SecureBackupSetupMethod.Key) {
        this.recoveryKey = await _MatrixClientPeg.MatrixClientPeg.get().createRecoveryKeyFromPassphrase();
        this.setState({
          copied: false,
          downloaded: false,
          setPassphrase: false,
          phase: Phase.ShowKey
        });
      } else {
        this.setState({
          copied: false,
          downloaded: false,
          phase: Phase.Passphrase
        });
      }
    });
    (0, _defineProperty2.default)(this, "onMigrateFormSubmit", e => {
      e.preventDefault();

      if (this.state.backupSigStatus.usable) {
        this.bootstrapSecretStorage();
      } else {
        this.restoreBackup();
      }
    });
    (0, _defineProperty2.default)(this, "onCopyClick", () => {
      const successful = (0, _strings.copyNode)(this.recoveryKeyNode.current);

      if (successful) {
        this.setState({
          copied: true
        });
      }
    });
    (0, _defineProperty2.default)(this, "onDownloadClick", () => {
      const blob = new Blob([this.recoveryKey.encodedPrivateKey], {
        type: 'text/plain;charset=us-ascii'
      });

      _fileSaver.default.saveAs(blob, 'security-key.txt');

      this.setState({
        downloaded: true
      });
    });
    (0, _defineProperty2.default)(this, "doBootstrapUIAuth", async makeRequest => {
      if (this.state.canUploadKeysWithPasswordOnly && this.state.accountPassword) {
        await makeRequest({
          type: 'm.login.password',
          identifier: {
            type: 'm.id.user',
            user: _MatrixClientPeg.MatrixClientPeg.get().getUserId()
          },
          // TODO: Remove `user` once servers support proper UIA
          // See https://github.com/matrix-org/synapse/issues/5665
          user: _MatrixClientPeg.MatrixClientPeg.get().getUserId(),
          password: this.state.accountPassword
        });
      } else {
        const dialogAesthetics = {
          [_InteractiveAuthEntryComponents.SSOAuthEntry.PHASE_PREAUTH]: {
            title: (0, _languageHandler._t)("Use Single Sign On to continue"),
            body: (0, _languageHandler._t)("To continue, use Single Sign On to prove your identity."),
            continueText: (0, _languageHandler._t)("Single Sign On"),
            continueKind: "primary"
          },
          [_InteractiveAuthEntryComponents.SSOAuthEntry.PHASE_POSTAUTH]: {
            title: (0, _languageHandler._t)("Confirm encryption setup"),
            body: (0, _languageHandler._t)("Click the button below to confirm setting up encryption."),
            continueText: (0, _languageHandler._t)("Confirm"),
            continueKind: "primary"
          }
        };

        const {
          finished
        } = _Modal.default.createDialog(_InteractiveAuthDialog.default, {
          title: (0, _languageHandler._t)("Setting up keys"),
          matrixClient: _MatrixClientPeg.MatrixClientPeg.get(),
          makeRequest,
          aestheticsForStagePhases: {
            [_InteractiveAuthEntryComponents.SSOAuthEntry.LOGIN_TYPE]: dialogAesthetics,
            [_InteractiveAuthEntryComponents.SSOAuthEntry.UNSTABLE_LOGIN_TYPE]: dialogAesthetics
          }
        });

        const [confirmed] = await finished;

        if (!confirmed) {
          throw new Error("Cross-signing key upload auth canceled");
        }
      }
    });
    (0, _defineProperty2.default)(this, "bootstrapSecretStorage", async () => {
      this.setState({
        phase: Phase.Storing,
        error: null
      });

      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const {
        forceReset
      } = this.props;

      try {
        if (forceReset) {
          _logger.logger.log("Forcing secret storage reset");

          await cli.bootstrapSecretStorage({
            createSecretStorageKey: async () => this.recoveryKey,
            setupNewKeyBackup: true,
            setupNewSecretStorage: true
          });
        } else {
          // For password authentication users after 2020-09, this cross-signing
          // step will be a no-op since it is now setup during registration or login
          // when needed. We should keep this here to cover other cases such as:
          //   * Users with existing sessions prior to 2020-09 changes
          //   * SSO authentication users which require interactive auth to upload
          //     keys (and also happen to skip all post-authentication flows at the
          //     moment via token login)
          await cli.bootstrapCrossSigning({
            authUploadDeviceSigningKeys: this.doBootstrapUIAuth
          });
          await cli.bootstrapSecretStorage({
            createSecretStorageKey: async () => this.recoveryKey,
            keyBackupInfo: this.state.backupInfo,
            setupNewKeyBackup: !this.state.backupInfo,
            getKeyBackupPassphrase: async () => {
              // We may already have the backup key if we earlier went
              // through the restore backup path, so pass it along
              // rather than prompting again.
              if (this.backupKey) {
                return this.backupKey;
              }

              return (0, _SecurityManager.promptForBackupPassphrase)();
            }
          });
        }

        this.props.onFinished(true);
      } catch (e) {
        if (this.state.canUploadKeysWithPasswordOnly && e.httpStatus === 401 && e.data.flows) {
          this.setState({
            accountPassword: '',
            accountPasswordCorrect: false,
            phase: Phase.Migrate
          });
        } else {
          this.setState({
            error: e
          });
        }

        _logger.logger.error("Error bootstrapping secret storage", e);
      }
    });
    (0, _defineProperty2.default)(this, "onCancel", () => {
      this.props.onFinished(false);
    });
    (0, _defineProperty2.default)(this, "restoreBackup", async () => {
      // It's possible we'll need the backup key later on for bootstrapping,
      // so let's stash it here, rather than prompting for it twice.
      const keyCallback = k => this.backupKey = k;

      const {
        finished
      } = _Modal.default.createDialog(_RestoreKeyBackupDialog.default, {
        showSummary: false,
        keyCallback
      }, null,
      /* priority = */
      false,
      /* static = */
      false);

      await finished;
      const {
        backupSigStatus
      } = await this.fetchBackupInfo();

      if (backupSigStatus.usable && this.state.canUploadKeysWithPasswordOnly && this.state.accountPassword) {
        this.bootstrapSecretStorage();
      }
    });
    (0, _defineProperty2.default)(this, "onLoadRetryClick", () => {
      this.setState({
        phase: Phase.Loading
      });
      this.fetchBackupInfo();
    });
    (0, _defineProperty2.default)(this, "onShowKeyContinueClick", () => {
      this.bootstrapSecretStorage();
    });
    (0, _defineProperty2.default)(this, "onCancelClick", () => {
      this.setState({
        phase: Phase.ConfirmSkip
      });
    });
    (0, _defineProperty2.default)(this, "onGoBackClick", () => {
      this.setState({
        phase: Phase.ChooseKeyPassphrase
      });
    });
    (0, _defineProperty2.default)(this, "onPassPhraseNextClick", async e => {
      e.preventDefault();
      if (!this.passphraseField.current) return; // unmounting

      await this.passphraseField.current.validate({
        allowEmpty: false
      });

      if (!this.passphraseField.current.state.valid) {
        this.passphraseField.current.focus();
        this.passphraseField.current.validate({
          allowEmpty: false,
          focused: true
        });
        return;
      }

      this.setState({
        phase: Phase.PassphraseConfirm
      });
    });
    (0, _defineProperty2.default)(this, "onPassPhraseConfirmNextClick", async e => {
      e.preventDefault();
      if (this.state.passPhrase !== this.state.passPhraseConfirm) return;
      this.recoveryKey = await _MatrixClientPeg.MatrixClientPeg.get().createRecoveryKeyFromPassphrase(this.state.passPhrase);
      this.setState({
        copied: false,
        downloaded: false,
        setPassphrase: true,
        phase: Phase.ShowKey
      });
    });
    (0, _defineProperty2.default)(this, "onSetAgainClick", () => {
      this.setState({
        passPhrase: '',
        passPhraseValid: false,
        passPhraseConfirm: '',
        phase: Phase.Passphrase
      });
    });
    (0, _defineProperty2.default)(this, "onPassPhraseValidate", result => {
      this.setState({
        passPhraseValid: result.valid
      });
    });
    (0, _defineProperty2.default)(this, "onPassPhraseChange", e => {
      this.setState({
        passPhrase: e.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onPassPhraseConfirmChange", e => {
      this.setState({
        passPhraseConfirm: e.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onAccountPasswordChange", e => {
      this.setState({
        accountPassword: e.target.value
      });
    });
    let passPhraseKeySelected;
    const setupMethods = (0, _WellKnownUtils.getSecureBackupSetupMethods)();

    if (setupMethods.includes(_WellKnownUtils.SecureBackupSetupMethod.Key)) {
      passPhraseKeySelected = _WellKnownUtils.SecureBackupSetupMethod.Key;
    } else {
      passPhraseKeySelected = _WellKnownUtils.SecureBackupSetupMethod.Passphrase;
    }

    const accountPassword = props.accountPassword || "";
    let canUploadKeysWithPasswordOnly = null;

    if (accountPassword) {
      // If we have an account password in memory, let's simplify and
      // assume it means password auth is also supported for device
      // signing key upload as well. This avoids hitting the server to
      // test auth flows, which may be slow under high load.
      canUploadKeysWithPasswordOnly = true;
    } else {
      this.queryKeyUploadAuth();
    }

    this.state = {
      phase: Phase.Loading,
      passPhrase: '',
      passPhraseValid: false,
      passPhraseConfirm: '',
      copied: false,
      downloaded: false,
      setPassphrase: false,
      backupInfo: null,
      backupSigStatus: null,
      // does the server offer a UI auth flow with just m.login.password
      // for /keys/device_signing/upload?
      accountPasswordCorrect: null,
      canSkip: !(0, _WellKnownUtils.isSecureBackupRequired)(),
      canUploadKeysWithPasswordOnly,
      passPhraseKeySelected,
      accountPassword
    };

    _MatrixClientPeg.MatrixClientPeg.get().on(_crypto.CryptoEvent.KeyBackupStatus, this.onKeyBackupStatusChange);

    this.getInitialPhase();
  }

  componentWillUnmount() {
    _MatrixClientPeg.MatrixClientPeg.get().removeListener(_crypto.CryptoEvent.KeyBackupStatus, this.onKeyBackupStatusChange);
  }

  getInitialPhase() {
    const keyFromCustomisations = _Security.default.createSecretStorageKey?.();

    if (keyFromCustomisations) {
      _logger.logger.log("Created key via customisations, jumping to bootstrap step");

      this.recoveryKey = {
        privateKey: keyFromCustomisations
      };
      this.bootstrapSecretStorage();
      return;
    }

    this.fetchBackupInfo();
  }

  async fetchBackupInfo() {
    try {
      const backupInfo = await _MatrixClientPeg.MatrixClientPeg.get().getKeyBackupVersion();
      const backupSigStatus = // we may not have started crypto yet, in which case we definitely don't trust the backup
      _MatrixClientPeg.MatrixClientPeg.get().isCryptoEnabled() && (await _MatrixClientPeg.MatrixClientPeg.get().isKeyBackupTrusted(backupInfo));
      const {
        forceReset
      } = this.props;
      const phase = backupInfo && !forceReset ? Phase.Migrate : Phase.ChooseKeyPassphrase;
      this.setState({
        phase,
        backupInfo,
        backupSigStatus
      });
      return {
        backupInfo,
        backupSigStatus
      };
    } catch (e) {
      this.setState({
        phase: Phase.LoadError
      });
    }
  }

  async queryKeyUploadAuth() {
    try {
      await _MatrixClientPeg.MatrixClientPeg.get().uploadDeviceSigningKeys(null, {}); // We should never get here: the server should always require
      // UI auth to upload device signing keys. If we do, we upload
      // no keys which would be a no-op.

      _logger.logger.log("uploadDeviceSigningKeys unexpectedly succeeded without UI auth!");
    } catch (error) {
      if (!error.data || !error.data.flows) {
        _logger.logger.log("uploadDeviceSigningKeys advertised no flows!");

        return;
      }

      const canUploadKeysWithPasswordOnly = error.data.flows.some(f => {
        return f.stages.length === 1 && f.stages[0] === 'm.login.password';
      });
      this.setState({
        canUploadKeysWithPasswordOnly
      });
    }
  }

  renderOptionKey() {
    return /*#__PURE__*/_react.default.createElement(_StyledRadioButton.default, {
      key: _WellKnownUtils.SecureBackupSetupMethod.Key,
      value: _WellKnownUtils.SecureBackupSetupMethod.Key,
      name: "keyPassphrase",
      checked: this.state.passPhraseKeySelected === _WellKnownUtils.SecureBackupSetupMethod.Key,
      onChange: this.onKeyPassphraseChange,
      outlined: true
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateSecretStorageDialog_optionTitle"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_CreateSecretStorageDialog_optionIcon mx_CreateSecretStorageDialog_optionIcon_secureBackup"
    }), (0, _languageHandler._t)("Generate a Security Key")), /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("We'll generate a Security Key for you to store somewhere safe, like a password manager or a safe.")));
  }

  renderOptionPassphrase() {
    return /*#__PURE__*/_react.default.createElement(_StyledRadioButton.default, {
      key: _WellKnownUtils.SecureBackupSetupMethod.Passphrase,
      value: _WellKnownUtils.SecureBackupSetupMethod.Passphrase,
      name: "keyPassphrase",
      checked: this.state.passPhraseKeySelected === _WellKnownUtils.SecureBackupSetupMethod.Passphrase,
      onChange: this.onKeyPassphraseChange,
      outlined: true
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateSecretStorageDialog_optionTitle"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_CreateSecretStorageDialog_optionIcon mx_CreateSecretStorageDialog_optionIcon_securePhrase"
    }), (0, _languageHandler._t)("Enter a Security Phrase")), /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Use a secret phrase only you know, and optionally save a Security Key to use for backup.")));
  }

  renderPhaseChooseKeyPassphrase() {
    const setupMethods = (0, _WellKnownUtils.getSecureBackupSetupMethods)();
    const optionKey = setupMethods.includes(_WellKnownUtils.SecureBackupSetupMethod.Key) ? this.renderOptionKey() : null;
    const optionPassphrase = setupMethods.includes(_WellKnownUtils.SecureBackupSetupMethod.Passphrase) ? this.renderOptionPassphrase() : null;
    return /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.onChooseKeyPassphraseFormSubmit
    }, /*#__PURE__*/_react.default.createElement("p", {
      className: "mx_CreateSecretStorageDialog_centeredBody"
    }, (0, _languageHandler._t)("Safeguard against losing access to encrypted messages & data by " + "backing up encryption keys on your server.")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateSecretStorageDialog_primaryContainer",
      role: "radiogroup"
    }, optionKey, optionPassphrase), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: (0, _languageHandler._t)("Continue"),
      onPrimaryButtonClick: this.onChooseKeyPassphraseFormSubmit,
      onCancel: this.onCancelClick,
      hasCancel: this.state.canSkip
    }));
  }

  renderPhaseMigrate() {
    // TODO: This is a temporary screen so people who have the labs flag turned on and
    // click the button are aware they're making a change to their account.
    // Once we're confident enough in this (and it's supported enough) we can do
    // it automatically.
    // https://github.com/vector-im/element-web/issues/11696
    let authPrompt;
    let nextCaption = (0, _languageHandler._t)("Next");

    if (this.state.canUploadKeysWithPasswordOnly) {
      authPrompt = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Enter your account password to confirm the upgrade:")), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_Field.default, {
        type: "password",
        label: (0, _languageHandler._t)("Password"),
        value: this.state.accountPassword,
        onChange: this.onAccountPasswordChange,
        forceValidity: this.state.accountPasswordCorrect === false ? false : null,
        autoFocus: true
      })));
    } else if (!this.state.backupSigStatus.usable) {
      authPrompt = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Restore your key backup to upgrade your encryption")));
      nextCaption = (0, _languageHandler._t)("Restore");
    } else {
      authPrompt = /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("You'll need to authenticate with the server to confirm the upgrade."));
    }

    return /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.onMigrateFormSubmit
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Upgrade this session to allow it to verify other sessions, " + "granting them access to encrypted messages and marking them " + "as trusted for other users.")), /*#__PURE__*/_react.default.createElement("div", null, authPrompt), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: nextCaption,
      onPrimaryButtonClick: this.onMigrateFormSubmit,
      hasCancel: false,
      primaryDisabled: this.state.canUploadKeysWithPasswordOnly && !this.state.accountPassword
    }, /*#__PURE__*/_react.default.createElement("button", {
      type: "button",
      className: "danger",
      onClick: this.onCancelClick
    }, (0, _languageHandler._t)('Skip'))));
  }

  renderPhasePassPhrase() {
    return /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.onPassPhraseNextClick
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Enter a security phrase only you know, as it's used to safeguard your data. " + "To be secure, you shouldn't re-use your account password.")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateSecretStorageDialog_passPhraseContainer"
    }, /*#__PURE__*/_react.default.createElement(_PassphraseField.default, {
      className: "mx_CreateSecretStorageDialog_passPhraseField",
      onChange: this.onPassPhraseChange,
      minScore: PASSWORD_MIN_SCORE,
      value: this.state.passPhrase,
      onValidate: this.onPassPhraseValidate,
      fieldRef: this.passphraseField,
      autoFocus: true,
      label: (0, _languageHandler._td)("Enter a Security Phrase"),
      labelEnterPassword: (0, _languageHandler._td)("Enter a Security Phrase"),
      labelStrongPassword: (0, _languageHandler._td)("Great! This Security Phrase looks strong enough."),
      labelAllowedButUnsafe: (0, _languageHandler._td)("Great! This Security Phrase looks strong enough.")
    })), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: (0, _languageHandler._t)('Continue'),
      onPrimaryButtonClick: this.onPassPhraseNextClick,
      hasCancel: false,
      disabled: !this.state.passPhraseValid
    }, /*#__PURE__*/_react.default.createElement("button", {
      type: "button",
      onClick: this.onCancelClick,
      className: "danger"
    }, (0, _languageHandler._t)("Cancel"))));
  }

  renderPhasePassPhraseConfirm() {
    let matchText;
    let changeText;

    if (this.state.passPhraseConfirm === this.state.passPhrase) {
      matchText = (0, _languageHandler._t)("That matches!");
      changeText = (0, _languageHandler._t)("Use a different passphrase?");
    } else if (!this.state.passPhrase.startsWith(this.state.passPhraseConfirm)) {
      // only tell them they're wrong if they've actually gone wrong.
      // Security conscious readers will note that if you left element-web unattended
      // on this screen, this would make it easy for a malicious person to guess
      // your passphrase one letter at a time, but they could get this faster by
      // just opening the browser's developer tools and reading it.
      // Note that not having typed anything at all will not hit this clause and
      // fall through so empty box === no hint.
      matchText = (0, _languageHandler._t)("That doesn't match.");
      changeText = (0, _languageHandler._t)("Go back to set it again.");
    }

    let passPhraseMatch = null;

    if (matchText) {
      passPhraseMatch = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null, matchText), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "link",
        onClick: this.onSetAgainClick
      }, changeText));
    }

    return /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.onPassPhraseConfirmNextClick
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Enter your Security Phrase a second time to confirm it.")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateSecretStorageDialog_passPhraseContainer"
    }, /*#__PURE__*/_react.default.createElement(_Field.default, {
      type: "password",
      onChange: this.onPassPhraseConfirmChange,
      value: this.state.passPhraseConfirm,
      className: "mx_CreateSecretStorageDialog_passPhraseField",
      label: (0, _languageHandler._t)("Confirm your Security Phrase"),
      autoFocus: true,
      autoComplete: "new-password"
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateSecretStorageDialog_passPhraseMatch"
    }, passPhraseMatch)), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: (0, _languageHandler._t)('Continue'),
      onPrimaryButtonClick: this.onPassPhraseConfirmNextClick,
      hasCancel: false,
      disabled: this.state.passPhrase !== this.state.passPhraseConfirm
    }, /*#__PURE__*/_react.default.createElement("button", {
      type: "button",
      onClick: this.onCancelClick,
      className: "danger"
    }, (0, _languageHandler._t)("Skip"))));
  }

  renderPhaseShowKey() {
    let continueButton;

    if (this.state.phase === Phase.ShowKey) {
      continueButton = /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
        primaryButton: (0, _languageHandler._t)("Continue"),
        disabled: !this.state.downloaded && !this.state.copied && !this.state.setPassphrase,
        onPrimaryButtonClick: this.onShowKeyContinueClick,
        hasCancel: false
      });
    } else {
      continueButton = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_CreateSecretStorageDialog_continueSpinner"
      }, /*#__PURE__*/_react.default.createElement(_InlineSpinner.default, null));
    }

    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Store your Security Key somewhere safe, like a password manager or a safe, " + "as it's used to safeguard your encrypted data.")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateSecretStorageDialog_primaryContainer mx_CreateSecretStorageDialog_recoveryKeyPrimarycontainer"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateSecretStorageDialog_recoveryKeyContainer"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateSecretStorageDialog_recoveryKey"
    }, /*#__PURE__*/_react.default.createElement("code", {
      ref: this.recoveryKeyNode
    }, this.recoveryKey.encodedPrivateKey)), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateSecretStorageDialog_recoveryKeyButtons"
    }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "primary",
      className: "mx_Dialog_primary",
      onClick: this.onDownloadClick,
      disabled: this.state.phase === Phase.Storing
    }, (0, _languageHandler._t)("Download")), /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("or")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "primary",
      className: "mx_Dialog_primary mx_CreateSecretStorageDialog_recoveryKeyButtons_copyBtn",
      onClick: this.onCopyClick,
      disabled: this.state.phase === Phase.Storing
    }, this.state.copied ? (0, _languageHandler._t)("Copied!") : (0, _languageHandler._t)("Copy"))))), continueButton);
  }

  renderBusyPhase() {
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_Spinner.default, null));
  }

  renderPhaseLoadError() {
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Unable to query secret storage status")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_buttons"
    }, /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: (0, _languageHandler._t)('Retry'),
      onPrimaryButtonClick: this.onLoadRetryClick,
      hasCancel: this.state.canSkip,
      onCancel: this.onCancel
    })));
  }

  renderPhaseSkipConfirm() {
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("If you cancel now, you may lose encrypted messages & data if you lose access to your logins.")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("You can also set up Secure Backup & manage your keys in Settings.")), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: (0, _languageHandler._t)('Go back'),
      onPrimaryButtonClick: this.onGoBackClick,
      hasCancel: false
    }, /*#__PURE__*/_react.default.createElement("button", {
      type: "button",
      className: "danger",
      onClick: this.onCancel
    }, (0, _languageHandler._t)('Cancel'))));
  }

  titleForPhase(phase) {
    switch (phase) {
      case Phase.ChooseKeyPassphrase:
        return (0, _languageHandler._t)('Set up Secure Backup');

      case Phase.Migrate:
        return (0, _languageHandler._t)('Upgrade your encryption');

      case Phase.Passphrase:
        return (0, _languageHandler._t)('Set a Security Phrase');

      case Phase.PassphraseConfirm:
        return (0, _languageHandler._t)('Confirm Security Phrase');

      case Phase.ConfirmSkip:
        return (0, _languageHandler._t)('Are you sure?');

      case Phase.ShowKey:
        return (0, _languageHandler._t)('Save your Security Key');

      case Phase.Storing:
        return (0, _languageHandler._t)('Setting up keys');

      default:
        return '';
    }
  }

  render() {
    let content;

    if (this.state.error) {
      content = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Unable to set up secret storage")), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Dialog_buttons"
      }, /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
        primaryButton: (0, _languageHandler._t)('Retry'),
        onPrimaryButtonClick: this.bootstrapSecretStorage,
        hasCancel: this.state.canSkip,
        onCancel: this.onCancel
      })));
    } else {
      switch (this.state.phase) {
        case Phase.Loading:
          content = this.renderBusyPhase();
          break;

        case Phase.LoadError:
          content = this.renderPhaseLoadError();
          break;

        case Phase.ChooseKeyPassphrase:
          content = this.renderPhaseChooseKeyPassphrase();
          break;

        case Phase.Migrate:
          content = this.renderPhaseMigrate();
          break;

        case Phase.Passphrase:
          content = this.renderPhasePassPhrase();
          break;

        case Phase.PassphraseConfirm:
          content = this.renderPhasePassPhraseConfirm();
          break;

        case Phase.ShowKey:
          content = this.renderPhaseShowKey();
          break;

        case Phase.Storing:
          content = this.renderBusyPhase();
          break;

        case Phase.ConfirmSkip:
          content = this.renderPhaseSkipConfirm();
          break;
      }
    }

    let titleClass = null;

    switch (this.state.phase) {
      case Phase.Passphrase:
      case Phase.PassphraseConfirm:
        titleClass = ['mx_CreateSecretStorageDialog_titleWithIcon', 'mx_CreateSecretStorageDialog_securePhraseTitle'];
        break;

      case Phase.ShowKey:
        titleClass = ['mx_CreateSecretStorageDialog_titleWithIcon', 'mx_CreateSecretStorageDialog_secureBackupTitle'];
        break;

      case Phase.ChooseKeyPassphrase:
        titleClass = 'mx_CreateSecretStorageDialog_centeredTitle';
        break;
    }

    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_CreateSecretStorageDialog",
      onFinished: this.props.onFinished,
      title: this.titleForPhase(this.state.phase),
      titleClass: titleClass,
      hasCancel: this.props.hasCancel && [Phase.Passphrase].includes(this.state.phase),
      fixedWidth: false
    }, /*#__PURE__*/_react.default.createElement("div", null, content));
  }

}

exports.default = CreateSecretStorageDialog;
(0, _defineProperty2.default)(CreateSecretStorageDialog, "defaultProps", {
  hasCancel: true,
  forceReset: false
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGFzZSIsIlBBU1NXT1JEX01JTl9TQ09SRSIsIkNyZWF0ZVNlY3JldFN0b3JhZ2VEaWFsb2ciLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY3JlYXRlUmVmIiwic3RhdGUiLCJwaGFzZSIsIk1pZ3JhdGUiLCJmZXRjaEJhY2t1cEluZm8iLCJlIiwic2V0U3RhdGUiLCJwYXNzUGhyYXNlS2V5U2VsZWN0ZWQiLCJ0YXJnZXQiLCJ2YWx1ZSIsIlNlY3VyZUJhY2t1cFNldHVwTWV0aG9kIiwiS2V5IiwicmVjb3ZlcnlLZXkiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJjcmVhdGVSZWNvdmVyeUtleUZyb21QYXNzcGhyYXNlIiwiY29waWVkIiwiZG93bmxvYWRlZCIsInNldFBhc3NwaHJhc2UiLCJTaG93S2V5IiwiUGFzc3BocmFzZSIsInByZXZlbnREZWZhdWx0IiwiYmFja3VwU2lnU3RhdHVzIiwidXNhYmxlIiwiYm9vdHN0cmFwU2VjcmV0U3RvcmFnZSIsInJlc3RvcmVCYWNrdXAiLCJzdWNjZXNzZnVsIiwiY29weU5vZGUiLCJyZWNvdmVyeUtleU5vZGUiLCJjdXJyZW50IiwiYmxvYiIsIkJsb2IiLCJlbmNvZGVkUHJpdmF0ZUtleSIsInR5cGUiLCJGaWxlU2F2ZXIiLCJzYXZlQXMiLCJtYWtlUmVxdWVzdCIsImNhblVwbG9hZEtleXNXaXRoUGFzc3dvcmRPbmx5IiwiYWNjb3VudFBhc3N3b3JkIiwiaWRlbnRpZmllciIsInVzZXIiLCJnZXRVc2VySWQiLCJwYXNzd29yZCIsImRpYWxvZ0Flc3RoZXRpY3MiLCJTU09BdXRoRW50cnkiLCJQSEFTRV9QUkVBVVRIIiwidGl0bGUiLCJfdCIsImJvZHkiLCJjb250aW51ZVRleHQiLCJjb250aW51ZUtpbmQiLCJQSEFTRV9QT1NUQVVUSCIsImZpbmlzaGVkIiwiTW9kYWwiLCJjcmVhdGVEaWFsb2ciLCJJbnRlcmFjdGl2ZUF1dGhEaWFsb2ciLCJtYXRyaXhDbGllbnQiLCJhZXN0aGV0aWNzRm9yU3RhZ2VQaGFzZXMiLCJMT0dJTl9UWVBFIiwiVU5TVEFCTEVfTE9HSU5fVFlQRSIsImNvbmZpcm1lZCIsIkVycm9yIiwiU3RvcmluZyIsImVycm9yIiwiY2xpIiwiZm9yY2VSZXNldCIsImxvZ2dlciIsImxvZyIsImNyZWF0ZVNlY3JldFN0b3JhZ2VLZXkiLCJzZXR1cE5ld0tleUJhY2t1cCIsInNldHVwTmV3U2VjcmV0U3RvcmFnZSIsImJvb3RzdHJhcENyb3NzU2lnbmluZyIsImF1dGhVcGxvYWREZXZpY2VTaWduaW5nS2V5cyIsImRvQm9vdHN0cmFwVUlBdXRoIiwia2V5QmFja3VwSW5mbyIsImJhY2t1cEluZm8iLCJnZXRLZXlCYWNrdXBQYXNzcGhyYXNlIiwiYmFja3VwS2V5IiwicHJvbXB0Rm9yQmFja3VwUGFzc3BocmFzZSIsIm9uRmluaXNoZWQiLCJodHRwU3RhdHVzIiwiZGF0YSIsImZsb3dzIiwiYWNjb3VudFBhc3N3b3JkQ29ycmVjdCIsImtleUNhbGxiYWNrIiwiayIsIlJlc3RvcmVLZXlCYWNrdXBEaWFsb2ciLCJzaG93U3VtbWFyeSIsIkxvYWRpbmciLCJDb25maXJtU2tpcCIsIkNob29zZUtleVBhc3NwaHJhc2UiLCJwYXNzcGhyYXNlRmllbGQiLCJ2YWxpZGF0ZSIsImFsbG93RW1wdHkiLCJ2YWxpZCIsImZvY3VzIiwiZm9jdXNlZCIsIlBhc3NwaHJhc2VDb25maXJtIiwicGFzc1BocmFzZSIsInBhc3NQaHJhc2VDb25maXJtIiwicGFzc1BocmFzZVZhbGlkIiwicmVzdWx0Iiwic2V0dXBNZXRob2RzIiwiZ2V0U2VjdXJlQmFja3VwU2V0dXBNZXRob2RzIiwiaW5jbHVkZXMiLCJxdWVyeUtleVVwbG9hZEF1dGgiLCJjYW5Ta2lwIiwiaXNTZWN1cmVCYWNrdXBSZXF1aXJlZCIsIm9uIiwiQ3J5cHRvRXZlbnQiLCJLZXlCYWNrdXBTdGF0dXMiLCJvbktleUJhY2t1cFN0YXR1c0NoYW5nZSIsImdldEluaXRpYWxQaGFzZSIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVtb3ZlTGlzdGVuZXIiLCJrZXlGcm9tQ3VzdG9taXNhdGlvbnMiLCJTZWN1cml0eUN1c3RvbWlzYXRpb25zIiwicHJpdmF0ZUtleSIsImdldEtleUJhY2t1cFZlcnNpb24iLCJpc0NyeXB0b0VuYWJsZWQiLCJpc0tleUJhY2t1cFRydXN0ZWQiLCJMb2FkRXJyb3IiLCJ1cGxvYWREZXZpY2VTaWduaW5nS2V5cyIsInNvbWUiLCJmIiwic3RhZ2VzIiwibGVuZ3RoIiwicmVuZGVyT3B0aW9uS2V5Iiwib25LZXlQYXNzcGhyYXNlQ2hhbmdlIiwicmVuZGVyT3B0aW9uUGFzc3BocmFzZSIsInJlbmRlclBoYXNlQ2hvb3NlS2V5UGFzc3BocmFzZSIsIm9wdGlvbktleSIsIm9wdGlvblBhc3NwaHJhc2UiLCJvbkNob29zZUtleVBhc3NwaHJhc2VGb3JtU3VibWl0Iiwib25DYW5jZWxDbGljayIsInJlbmRlclBoYXNlTWlncmF0ZSIsImF1dGhQcm9tcHQiLCJuZXh0Q2FwdGlvbiIsIm9uQWNjb3VudFBhc3N3b3JkQ2hhbmdlIiwib25NaWdyYXRlRm9ybVN1Ym1pdCIsInJlbmRlclBoYXNlUGFzc1BocmFzZSIsIm9uUGFzc1BocmFzZU5leHRDbGljayIsIm9uUGFzc1BocmFzZUNoYW5nZSIsIm9uUGFzc1BocmFzZVZhbGlkYXRlIiwiX3RkIiwicmVuZGVyUGhhc2VQYXNzUGhyYXNlQ29uZmlybSIsIm1hdGNoVGV4dCIsImNoYW5nZVRleHQiLCJzdGFydHNXaXRoIiwicGFzc1BocmFzZU1hdGNoIiwib25TZXRBZ2FpbkNsaWNrIiwib25QYXNzUGhyYXNlQ29uZmlybU5leHRDbGljayIsIm9uUGFzc1BocmFzZUNvbmZpcm1DaGFuZ2UiLCJyZW5kZXJQaGFzZVNob3dLZXkiLCJjb250aW51ZUJ1dHRvbiIsIm9uU2hvd0tleUNvbnRpbnVlQ2xpY2siLCJvbkRvd25sb2FkQ2xpY2siLCJvbkNvcHlDbGljayIsInJlbmRlckJ1c3lQaGFzZSIsInJlbmRlclBoYXNlTG9hZEVycm9yIiwib25Mb2FkUmV0cnlDbGljayIsIm9uQ2FuY2VsIiwicmVuZGVyUGhhc2VTa2lwQ29uZmlybSIsIm9uR29CYWNrQ2xpY2siLCJ0aXRsZUZvclBoYXNlIiwicmVuZGVyIiwiY29udGVudCIsInRpdGxlQ2xhc3MiLCJoYXNDYW5jZWwiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvYXN5bmMtY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL3NlY3VyaXR5L0NyZWF0ZVNlY3JldFN0b3JhZ2VEaWFsb2cudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOCwgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgY3JlYXRlUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IEZpbGVTYXZlciBmcm9tICdmaWxlLXNhdmVyJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcbmltcG9ydCB7IElLZXlCYWNrdXBJbmZvIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NyeXB0by9rZXliYWNrdXBcIjtcbmltcG9ydCB7IFRydXN0SW5mbyB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jcnlwdG8vYmFja3VwXCI7XG5pbXBvcnQgeyBDcm9zc1NpZ25pbmdLZXlzIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21hdHJpeFwiO1xuaW1wb3J0IHsgSVJlY292ZXJ5S2V5IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NyeXB0by9hcGlcIjtcbmltcG9ydCB7IENyeXB0b0V2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NyeXB0b1wiO1xuXG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tICcuLi8uLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IHsgX3QsIF90ZCB9IGZyb20gJy4uLy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vLi4vLi4vTW9kYWwnO1xuaW1wb3J0IHsgcHJvbXB0Rm9yQmFja3VwUGFzc3BocmFzZSB9IGZyb20gJy4uLy4uLy4uLy4uL1NlY3VyaXR5TWFuYWdlcic7XG5pbXBvcnQgeyBjb3B5Tm9kZSB9IGZyb20gXCIuLi8uLi8uLi8uLi91dGlscy9zdHJpbmdzXCI7XG5pbXBvcnQgeyBTU09BdXRoRW50cnkgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tcG9uZW50cy92aWV3cy9hdXRoL0ludGVyYWN0aXZlQXV0aEVudHJ5Q29tcG9uZW50c1wiO1xuaW1wb3J0IFBhc3NwaHJhc2VGaWVsZCBmcm9tIFwiLi4vLi4vLi4vLi4vY29tcG9uZW50cy92aWV3cy9hdXRoL1Bhc3NwaHJhc2VGaWVsZFwiO1xuaW1wb3J0IFN0eWxlZFJhZGlvQnV0dG9uIGZyb20gJy4uLy4uLy4uLy4uL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvU3R5bGVkUmFkaW9CdXR0b24nO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IERpYWxvZ0J1dHRvbnMgZnJvbSBcIi4uLy4uLy4uLy4uL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvRGlhbG9nQnV0dG9uc1wiO1xuaW1wb3J0IElubGluZVNwaW5uZXIgZnJvbSBcIi4uLy4uLy4uLy4uL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvSW5saW5lU3Bpbm5lclwiO1xuaW1wb3J0IFJlc3RvcmVLZXlCYWNrdXBEaWFsb2cgZnJvbSBcIi4uLy4uLy4uLy4uL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9zZWN1cml0eS9SZXN0b3JlS2V5QmFja3VwRGlhbG9nXCI7XG5pbXBvcnQge1xuICAgIGdldFNlY3VyZUJhY2t1cFNldHVwTWV0aG9kcyxcbiAgICBpc1NlY3VyZUJhY2t1cFJlcXVpcmVkLFxuICAgIFNlY3VyZUJhY2t1cFNldHVwTWV0aG9kLFxufSBmcm9tICcuLi8uLi8uLi8uLi91dGlscy9XZWxsS25vd25VdGlscyc7XG5pbXBvcnQgU2VjdXJpdHlDdXN0b21pc2F0aW9ucyBmcm9tIFwiLi4vLi4vLi4vLi4vY3VzdG9taXNhdGlvbnMvU2VjdXJpdHlcIjtcbmltcG9ydCB7IElEaWFsb2dQcm9wcyB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvSURpYWxvZ1Byb3BzXCI7XG5pbXBvcnQgRmllbGQgZnJvbSBcIi4uLy4uLy4uLy4uL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvRmllbGRcIjtcbmltcG9ydCBCYXNlRGlhbG9nIGZyb20gXCIuLi8uLi8uLi8uLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvQmFzZURpYWxvZ1wiO1xuaW1wb3J0IFNwaW5uZXIgZnJvbSBcIi4uLy4uLy4uLy4uL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvU3Bpbm5lclwiO1xuaW1wb3J0IEludGVyYWN0aXZlQXV0aERpYWxvZyBmcm9tIFwiLi4vLi4vLi4vLi4vY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL0ludGVyYWN0aXZlQXV0aERpYWxvZ1wiO1xuaW1wb3J0IHsgSVZhbGlkYXRpb25SZXN1bHQgfSBmcm9tIFwiLi4vLi4vLi4vLi4vY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9WYWxpZGF0aW9uXCI7XG5cbi8vIEkgbWFkZSBhIG1pc3Rha2Ugd2hpbGUgY29udmVydGluZyB0aGlzIGFuZCBpdCBoYXMgdG8gYmUgZml4ZWQhXG5lbnVtIFBoYXNlIHtcbiAgICBMb2FkaW5nID0gXCJsb2FkaW5nXCIsXG4gICAgTG9hZEVycm9yID0gXCJsb2FkX2Vycm9yXCIsXG4gICAgQ2hvb3NlS2V5UGFzc3BocmFzZSA9IFwiY2hvb3NlX2tleV9wYXNzcGhyYXNlXCIsXG4gICAgTWlncmF0ZSA9IFwibWlncmF0ZVwiLFxuICAgIFBhc3NwaHJhc2UgPSBcInBhc3NwaHJhc2VcIixcbiAgICBQYXNzcGhyYXNlQ29uZmlybSA9IFwicGFzc3BocmFzZV9jb25maXJtXCIsXG4gICAgU2hvd0tleSA9IFwic2hvd19rZXlcIixcbiAgICBTdG9yaW5nID0gXCJzdG9yaW5nXCIsXG4gICAgQ29uZmlybVNraXAgPSBcImNvbmZpcm1fc2tpcFwiLFxufVxuXG5jb25zdCBQQVNTV09SRF9NSU5fU0NPUkUgPSA0OyAvLyBTbyBzZWN1cmUsIG1hbnkgY2hhcmFjdGVycywgbXVjaCBjb21wbGV4LCB3b3csIGV0YywgZXRjLlxuXG5pbnRlcmZhY2UgSVByb3BzIGV4dGVuZHMgSURpYWxvZ1Byb3BzIHtcbiAgICBoYXNDYW5jZWw6IGJvb2xlYW47XG4gICAgYWNjb3VudFBhc3N3b3JkOiBzdHJpbmc7XG4gICAgZm9yY2VSZXNldDogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgcGhhc2U6IFBoYXNlO1xuICAgIHBhc3NQaHJhc2U6IHN0cmluZztcbiAgICBwYXNzUGhyYXNlVmFsaWQ6IGJvb2xlYW47XG4gICAgcGFzc1BocmFzZUNvbmZpcm06IHN0cmluZztcbiAgICBjb3BpZWQ6IGJvb2xlYW47XG4gICAgZG93bmxvYWRlZDogYm9vbGVhbjtcbiAgICBzZXRQYXNzcGhyYXNlOiBib29sZWFuO1xuICAgIGJhY2t1cEluZm86IElLZXlCYWNrdXBJbmZvO1xuICAgIGJhY2t1cFNpZ1N0YXR1czogVHJ1c3RJbmZvO1xuICAgIC8vIGRvZXMgdGhlIHNlcnZlciBvZmZlciBhIFVJIGF1dGggZmxvdyB3aXRoIGp1c3QgbS5sb2dpbi5wYXNzd29yZFxuICAgIC8vIGZvciAva2V5cy9kZXZpY2Vfc2lnbmluZy91cGxvYWQ/XG4gICAgY2FuVXBsb2FkS2V5c1dpdGhQYXNzd29yZE9ubHk6IGJvb2xlYW47XG4gICAgYWNjb3VudFBhc3N3b3JkOiBzdHJpbmc7XG4gICAgYWNjb3VudFBhc3N3b3JkQ29ycmVjdDogYm9vbGVhbjtcbiAgICBjYW5Ta2lwOiBib29sZWFuO1xuICAgIHBhc3NQaHJhc2VLZXlTZWxlY3RlZDogc3RyaW5nO1xuICAgIGVycm9yPzogc3RyaW5nO1xufVxuXG4vKlxuICogV2Fsa3MgdGhlIHVzZXIgdGhyb3VnaCB0aGUgcHJvY2VzcyBvZiBjcmVhdGluZyBhIHBhc3NwaHJhc2UgdG8gZ3VhcmQgU2VjdXJlXG4gKiBTZWNyZXQgU3RvcmFnZSBpbiBhY2NvdW50IGRhdGEuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENyZWF0ZVNlY3JldFN0b3JhZ2VEaWFsb2cgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHVibGljIHN0YXRpYyBkZWZhdWx0UHJvcHM6IFBhcnRpYWw8SVByb3BzPiA9IHtcbiAgICAgICAgaGFzQ2FuY2VsOiB0cnVlLFxuICAgICAgICBmb3JjZVJlc2V0OiBmYWxzZSxcbiAgICB9O1xuICAgIHByaXZhdGUgcmVjb3ZlcnlLZXk6IElSZWNvdmVyeUtleTtcbiAgICBwcml2YXRlIGJhY2t1cEtleTogVWludDhBcnJheTtcbiAgICBwcml2YXRlIHJlY292ZXJ5S2V5Tm9kZSA9IGNyZWF0ZVJlZjxIVE1MRWxlbWVudD4oKTtcbiAgICBwcml2YXRlIHBhc3NwaHJhc2VGaWVsZCA9IGNyZWF0ZVJlZjxGaWVsZD4oKTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBJUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIGxldCBwYXNzUGhyYXNlS2V5U2VsZWN0ZWQ7XG4gICAgICAgIGNvbnN0IHNldHVwTWV0aG9kcyA9IGdldFNlY3VyZUJhY2t1cFNldHVwTWV0aG9kcygpO1xuICAgICAgICBpZiAoc2V0dXBNZXRob2RzLmluY2x1ZGVzKFNlY3VyZUJhY2t1cFNldHVwTWV0aG9kLktleSkpIHtcbiAgICAgICAgICAgIHBhc3NQaHJhc2VLZXlTZWxlY3RlZCA9IFNlY3VyZUJhY2t1cFNldHVwTWV0aG9kLktleTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhc3NQaHJhc2VLZXlTZWxlY3RlZCA9IFNlY3VyZUJhY2t1cFNldHVwTWV0aG9kLlBhc3NwaHJhc2U7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhY2NvdW50UGFzc3dvcmQgPSBwcm9wcy5hY2NvdW50UGFzc3dvcmQgfHwgXCJcIjtcbiAgICAgICAgbGV0IGNhblVwbG9hZEtleXNXaXRoUGFzc3dvcmRPbmx5ID0gbnVsbDtcbiAgICAgICAgaWYgKGFjY291bnRQYXNzd29yZCkge1xuICAgICAgICAgICAgLy8gSWYgd2UgaGF2ZSBhbiBhY2NvdW50IHBhc3N3b3JkIGluIG1lbW9yeSwgbGV0J3Mgc2ltcGxpZnkgYW5kXG4gICAgICAgICAgICAvLyBhc3N1bWUgaXQgbWVhbnMgcGFzc3dvcmQgYXV0aCBpcyBhbHNvIHN1cHBvcnRlZCBmb3IgZGV2aWNlXG4gICAgICAgICAgICAvLyBzaWduaW5nIGtleSB1cGxvYWQgYXMgd2VsbC4gVGhpcyBhdm9pZHMgaGl0dGluZyB0aGUgc2VydmVyIHRvXG4gICAgICAgICAgICAvLyB0ZXN0IGF1dGggZmxvd3MsIHdoaWNoIG1heSBiZSBzbG93IHVuZGVyIGhpZ2ggbG9hZC5cbiAgICAgICAgICAgIGNhblVwbG9hZEtleXNXaXRoUGFzc3dvcmRPbmx5ID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucXVlcnlLZXlVcGxvYWRBdXRoKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgcGhhc2U6IFBoYXNlLkxvYWRpbmcsXG4gICAgICAgICAgICBwYXNzUGhyYXNlOiAnJyxcbiAgICAgICAgICAgIHBhc3NQaHJhc2VWYWxpZDogZmFsc2UsXG4gICAgICAgICAgICBwYXNzUGhyYXNlQ29uZmlybTogJycsXG4gICAgICAgICAgICBjb3BpZWQ6IGZhbHNlLFxuICAgICAgICAgICAgZG93bmxvYWRlZDogZmFsc2UsXG4gICAgICAgICAgICBzZXRQYXNzcGhyYXNlOiBmYWxzZSxcbiAgICAgICAgICAgIGJhY2t1cEluZm86IG51bGwsXG4gICAgICAgICAgICBiYWNrdXBTaWdTdGF0dXM6IG51bGwsXG4gICAgICAgICAgICAvLyBkb2VzIHRoZSBzZXJ2ZXIgb2ZmZXIgYSBVSSBhdXRoIGZsb3cgd2l0aCBqdXN0IG0ubG9naW4ucGFzc3dvcmRcbiAgICAgICAgICAgIC8vIGZvciAva2V5cy9kZXZpY2Vfc2lnbmluZy91cGxvYWQ/XG4gICAgICAgICAgICBhY2NvdW50UGFzc3dvcmRDb3JyZWN0OiBudWxsLFxuICAgICAgICAgICAgY2FuU2tpcDogIWlzU2VjdXJlQmFja3VwUmVxdWlyZWQoKSxcbiAgICAgICAgICAgIGNhblVwbG9hZEtleXNXaXRoUGFzc3dvcmRPbmx5LFxuICAgICAgICAgICAgcGFzc1BocmFzZUtleVNlbGVjdGVkLFxuICAgICAgICAgICAgYWNjb3VudFBhc3N3b3JkLFxuICAgICAgICB9O1xuXG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5vbihDcnlwdG9FdmVudC5LZXlCYWNrdXBTdGF0dXMsIHRoaXMub25LZXlCYWNrdXBTdGF0dXNDaGFuZ2UpO1xuXG4gICAgICAgIHRoaXMuZ2V0SW5pdGlhbFBoYXNlKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkucmVtb3ZlTGlzdGVuZXIoQ3J5cHRvRXZlbnQuS2V5QmFja3VwU3RhdHVzLCB0aGlzLm9uS2V5QmFja3VwU3RhdHVzQ2hhbmdlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldEluaXRpYWxQaGFzZSgpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qga2V5RnJvbUN1c3RvbWlzYXRpb25zID0gU2VjdXJpdHlDdXN0b21pc2F0aW9ucy5jcmVhdGVTZWNyZXRTdG9yYWdlS2V5Py4oKTtcbiAgICAgICAgaWYgKGtleUZyb21DdXN0b21pc2F0aW9ucykge1xuICAgICAgICAgICAgbG9nZ2VyLmxvZyhcIkNyZWF0ZWQga2V5IHZpYSBjdXN0b21pc2F0aW9ucywganVtcGluZyB0byBib290c3RyYXAgc3RlcFwiKTtcbiAgICAgICAgICAgIHRoaXMucmVjb3ZlcnlLZXkgPSB7XG4gICAgICAgICAgICAgICAgcHJpdmF0ZUtleToga2V5RnJvbUN1c3RvbWlzYXRpb25zLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuYm9vdHN0cmFwU2VjcmV0U3RvcmFnZSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5mZXRjaEJhY2t1cEluZm8oKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGZldGNoQmFja3VwSW5mbygpOiBQcm9taXNlPHsgYmFja3VwSW5mbzogSUtleUJhY2t1cEluZm8sIGJhY2t1cFNpZ1N0YXR1czogVHJ1c3RJbmZvIH0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGJhY2t1cEluZm8gPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0S2V5QmFja3VwVmVyc2lvbigpO1xuICAgICAgICAgICAgY29uc3QgYmFja3VwU2lnU3RhdHVzID0gKFxuICAgICAgICAgICAgICAgIC8vIHdlIG1heSBub3QgaGF2ZSBzdGFydGVkIGNyeXB0byB5ZXQsIGluIHdoaWNoIGNhc2Ugd2UgZGVmaW5pdGVseSBkb24ndCB0cnVzdCB0aGUgYmFja3VwXG4gICAgICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLmlzQ3J5cHRvRW5hYmxlZCgpICYmIChhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuaXNLZXlCYWNrdXBUcnVzdGVkKGJhY2t1cEluZm8pKVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgY29uc3QgeyBmb3JjZVJlc2V0IH0gPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgY29uc3QgcGhhc2UgPSAoYmFja3VwSW5mbyAmJiAhZm9yY2VSZXNldCkgPyBQaGFzZS5NaWdyYXRlIDogUGhhc2UuQ2hvb3NlS2V5UGFzc3BocmFzZTtcblxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgcGhhc2UsXG4gICAgICAgICAgICAgICAgYmFja3VwSW5mbyxcbiAgICAgICAgICAgICAgICBiYWNrdXBTaWdTdGF0dXMsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBiYWNrdXBJbmZvLFxuICAgICAgICAgICAgICAgIGJhY2t1cFNpZ1N0YXR1cyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwaGFzZTogUGhhc2UuTG9hZEVycm9yIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBxdWVyeUtleVVwbG9hZEF1dGgoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkudXBsb2FkRGV2aWNlU2lnbmluZ0tleXMobnVsbCwge30gYXMgQ3Jvc3NTaWduaW5nS2V5cyk7XG4gICAgICAgICAgICAvLyBXZSBzaG91bGQgbmV2ZXIgZ2V0IGhlcmU6IHRoZSBzZXJ2ZXIgc2hvdWxkIGFsd2F5cyByZXF1aXJlXG4gICAgICAgICAgICAvLyBVSSBhdXRoIHRvIHVwbG9hZCBkZXZpY2Ugc2lnbmluZyBrZXlzLiBJZiB3ZSBkbywgd2UgdXBsb2FkXG4gICAgICAgICAgICAvLyBubyBrZXlzIHdoaWNoIHdvdWxkIGJlIGEgbm8tb3AuXG4gICAgICAgICAgICBsb2dnZXIubG9nKFwidXBsb2FkRGV2aWNlU2lnbmluZ0tleXMgdW5leHBlY3RlZGx5IHN1Y2NlZWRlZCB3aXRob3V0IFVJIGF1dGghXCIpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgaWYgKCFlcnJvci5kYXRhIHx8ICFlcnJvci5kYXRhLmZsb3dzKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmxvZyhcInVwbG9hZERldmljZVNpZ25pbmdLZXlzIGFkdmVydGlzZWQgbm8gZmxvd3MhXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGNhblVwbG9hZEtleXNXaXRoUGFzc3dvcmRPbmx5ID0gZXJyb3IuZGF0YS5mbG93cy5zb21lKGYgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBmLnN0YWdlcy5sZW5ndGggPT09IDEgJiYgZi5zdGFnZXNbMF0gPT09ICdtLmxvZ2luLnBhc3N3b3JkJztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgY2FuVXBsb2FkS2V5c1dpdGhQYXNzd29yZE9ubHksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25LZXlCYWNrdXBTdGF0dXNDaGFuZ2UgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnBoYXNlID09PSBQaGFzZS5NaWdyYXRlKSB0aGlzLmZldGNoQmFja3VwSW5mbygpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uS2V5UGFzc3BocmFzZUNoYW5nZSA9IChlOiBSZWFjdC5DaGFuZ2VFdmVudDxIVE1MSW5wdXRFbGVtZW50Pik6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHBhc3NQaHJhc2VLZXlTZWxlY3RlZDogZS50YXJnZXQudmFsdWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ2hvb3NlS2V5UGFzc3BocmFzZUZvcm1TdWJtaXQgPSBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnBhc3NQaHJhc2VLZXlTZWxlY3RlZCA9PT0gU2VjdXJlQmFja3VwU2V0dXBNZXRob2QuS2V5KSB7XG4gICAgICAgICAgICB0aGlzLnJlY292ZXJ5S2V5ID1cbiAgICAgICAgICAgICAgICBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuY3JlYXRlUmVjb3ZlcnlLZXlGcm9tUGFzc3BocmFzZSgpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgY29waWVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBkb3dubG9hZGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBzZXRQYXNzcGhyYXNlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBwaGFzZTogUGhhc2UuU2hvd0tleSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgY29waWVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBkb3dubG9hZGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBwaGFzZTogUGhhc2UuUGFzc3BocmFzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25NaWdyYXRlRm9ybVN1Ym1pdCA9IChlOiBSZWFjdC5Gb3JtRXZlbnQpOiB2b2lkID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5iYWNrdXBTaWdTdGF0dXMudXNhYmxlKSB7XG4gICAgICAgICAgICB0aGlzLmJvb3RzdHJhcFNlY3JldFN0b3JhZ2UoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVzdG9yZUJhY2t1cCgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Db3B5Q2xpY2sgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IHN1Y2Nlc3NmdWwgPSBjb3B5Tm9kZSh0aGlzLnJlY292ZXJ5S2V5Tm9kZS5jdXJyZW50KTtcbiAgICAgICAgaWYgKHN1Y2Nlc3NmdWwpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGNvcGllZDogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Eb3dubG9hZENsaWNrID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW3RoaXMucmVjb3ZlcnlLZXkuZW5jb2RlZFByaXZhdGVLZXldLCB7XG4gICAgICAgICAgICB0eXBlOiAndGV4dC9wbGFpbjtjaGFyc2V0PXVzLWFzY2lpJyxcbiAgICAgICAgfSk7XG4gICAgICAgIEZpbGVTYXZlci5zYXZlQXMoYmxvYiwgJ3NlY3VyaXR5LWtleS50eHQnKTtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGRvd25sb2FkZWQ6IHRydWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGRvQm9vdHN0cmFwVUlBdXRoID0gYXN5bmMgKG1ha2VSZXF1ZXN0OiAoYXV0aERhdGE6IGFueSkgPT4gUHJvbWlzZTx7fT4pOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuY2FuVXBsb2FkS2V5c1dpdGhQYXNzd29yZE9ubHkgJiYgdGhpcy5zdGF0ZS5hY2NvdW50UGFzc3dvcmQpIHtcbiAgICAgICAgICAgIGF3YWl0IG1ha2VSZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnbS5sb2dpbi5wYXNzd29yZCcsXG4gICAgICAgICAgICAgICAgaWRlbnRpZmllcjoge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbS5pZC51c2VyJyxcbiAgICAgICAgICAgICAgICAgICAgdXNlcjogTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGB1c2VyYCBvbmNlIHNlcnZlcnMgc3VwcG9ydCBwcm9wZXIgVUlBXG4gICAgICAgICAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRyaXgtb3JnL3N5bmFwc2UvaXNzdWVzLzU2NjVcbiAgICAgICAgICAgICAgICB1c2VyOiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VXNlcklkKCksXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQ6IHRoaXMuc3RhdGUuYWNjb3VudFBhc3N3b3JkLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBkaWFsb2dBZXN0aGV0aWNzID0ge1xuICAgICAgICAgICAgICAgIFtTU09BdXRoRW50cnkuUEhBU0VfUFJFQVVUSF06IHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiVXNlIFNpbmdsZSBTaWduIE9uIHRvIGNvbnRpbnVlXCIpLFxuICAgICAgICAgICAgICAgICAgICBib2R5OiBfdChcIlRvIGNvbnRpbnVlLCB1c2UgU2luZ2xlIFNpZ24gT24gdG8gcHJvdmUgeW91ciBpZGVudGl0eS5cIiksXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlVGV4dDogX3QoXCJTaW5nbGUgU2lnbiBPblwiKSxcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVLaW5kOiBcInByaW1hcnlcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFtTU09BdXRoRW50cnkuUEhBU0VfUE9TVEFVVEhdOiB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkNvbmZpcm0gZW5jcnlwdGlvbiBzZXR1cFwiKSxcbiAgICAgICAgICAgICAgICAgICAgYm9keTogX3QoXCJDbGljayB0aGUgYnV0dG9uIGJlbG93IHRvIGNvbmZpcm0gc2V0dGluZyB1cCBlbmNyeXB0aW9uLlwiKSxcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVUZXh0OiBfdChcIkNvbmZpcm1cIiksXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlS2luZDogXCJwcmltYXJ5XCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHsgZmluaXNoZWQgfSA9IE1vZGFsLmNyZWF0ZURpYWxvZyhJbnRlcmFjdGl2ZUF1dGhEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJTZXR0aW5nIHVwIGtleXNcIiksXG4gICAgICAgICAgICAgICAgbWF0cml4Q2xpZW50OiBNYXRyaXhDbGllbnRQZWcuZ2V0KCksXG4gICAgICAgICAgICAgICAgbWFrZVJlcXVlc3QsXG4gICAgICAgICAgICAgICAgYWVzdGhldGljc0ZvclN0YWdlUGhhc2VzOiB7XG4gICAgICAgICAgICAgICAgICAgIFtTU09BdXRoRW50cnkuTE9HSU5fVFlQRV06IGRpYWxvZ0Flc3RoZXRpY3MsXG4gICAgICAgICAgICAgICAgICAgIFtTU09BdXRoRW50cnkuVU5TVEFCTEVfTE9HSU5fVFlQRV06IGRpYWxvZ0Flc3RoZXRpY3MsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgW2NvbmZpcm1lZF0gPSBhd2FpdCBmaW5pc2hlZDtcbiAgICAgICAgICAgIGlmICghY29uZmlybWVkKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ3Jvc3Mtc2lnbmluZyBrZXkgdXBsb2FkIGF1dGggY2FuY2VsZWRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBib290c3RyYXBTZWNyZXRTdG9yYWdlID0gYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHBoYXNlOiBQaGFzZS5TdG9yaW5nLFxuICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcblxuICAgICAgICBjb25zdCB7IGZvcmNlUmVzZXQgfSA9IHRoaXMucHJvcHM7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChmb3JjZVJlc2V0KSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmxvZyhcIkZvcmNpbmcgc2VjcmV0IHN0b3JhZ2UgcmVzZXRcIik7XG4gICAgICAgICAgICAgICAgYXdhaXQgY2xpLmJvb3RzdHJhcFNlY3JldFN0b3JhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICBjcmVhdGVTZWNyZXRTdG9yYWdlS2V5OiBhc3luYyAoKSA9PiB0aGlzLnJlY292ZXJ5S2V5LFxuICAgICAgICAgICAgICAgICAgICBzZXR1cE5ld0tleUJhY2t1cDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgc2V0dXBOZXdTZWNyZXRTdG9yYWdlOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBGb3IgcGFzc3dvcmQgYXV0aGVudGljYXRpb24gdXNlcnMgYWZ0ZXIgMjAyMC0wOSwgdGhpcyBjcm9zcy1zaWduaW5nXG4gICAgICAgICAgICAgICAgLy8gc3RlcCB3aWxsIGJlIGEgbm8tb3Agc2luY2UgaXQgaXMgbm93IHNldHVwIGR1cmluZyByZWdpc3RyYXRpb24gb3IgbG9naW5cbiAgICAgICAgICAgICAgICAvLyB3aGVuIG5lZWRlZC4gV2Ugc2hvdWxkIGtlZXAgdGhpcyBoZXJlIHRvIGNvdmVyIG90aGVyIGNhc2VzIHN1Y2ggYXM6XG4gICAgICAgICAgICAgICAgLy8gICAqIFVzZXJzIHdpdGggZXhpc3Rpbmcgc2Vzc2lvbnMgcHJpb3IgdG8gMjAyMC0wOSBjaGFuZ2VzXG4gICAgICAgICAgICAgICAgLy8gICAqIFNTTyBhdXRoZW50aWNhdGlvbiB1c2VycyB3aGljaCByZXF1aXJlIGludGVyYWN0aXZlIGF1dGggdG8gdXBsb2FkXG4gICAgICAgICAgICAgICAgLy8gICAgIGtleXMgKGFuZCBhbHNvIGhhcHBlbiB0byBza2lwIGFsbCBwb3N0LWF1dGhlbnRpY2F0aW9uIGZsb3dzIGF0IHRoZVxuICAgICAgICAgICAgICAgIC8vICAgICBtb21lbnQgdmlhIHRva2VuIGxvZ2luKVxuICAgICAgICAgICAgICAgIGF3YWl0IGNsaS5ib290c3RyYXBDcm9zc1NpZ25pbmcoe1xuICAgICAgICAgICAgICAgICAgICBhdXRoVXBsb2FkRGV2aWNlU2lnbmluZ0tleXM6IHRoaXMuZG9Cb290c3RyYXBVSUF1dGgsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYXdhaXQgY2xpLmJvb3RzdHJhcFNlY3JldFN0b3JhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICBjcmVhdGVTZWNyZXRTdG9yYWdlS2V5OiBhc3luYyAoKSA9PiB0aGlzLnJlY292ZXJ5S2V5LFxuICAgICAgICAgICAgICAgICAgICBrZXlCYWNrdXBJbmZvOiB0aGlzLnN0YXRlLmJhY2t1cEluZm8sXG4gICAgICAgICAgICAgICAgICAgIHNldHVwTmV3S2V5QmFja3VwOiAhdGhpcy5zdGF0ZS5iYWNrdXBJbmZvLFxuICAgICAgICAgICAgICAgICAgICBnZXRLZXlCYWNrdXBQYXNzcGhyYXNlOiBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBtYXkgYWxyZWFkeSBoYXZlIHRoZSBiYWNrdXAga2V5IGlmIHdlIGVhcmxpZXIgd2VudFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhyb3VnaCB0aGUgcmVzdG9yZSBiYWNrdXAgcGF0aCwgc28gcGFzcyBpdCBhbG9uZ1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmF0aGVyIHRoYW4gcHJvbXB0aW5nIGFnYWluLlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuYmFja3VwS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYmFja3VwS2V5O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByb21wdEZvckJhY2t1cFBhc3NwaHJhc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh0cnVlKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuY2FuVXBsb2FkS2V5c1dpdGhQYXNzd29yZE9ubHkgJiYgZS5odHRwU3RhdHVzID09PSA0MDEgJiYgZS5kYXRhLmZsb3dzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGFjY291bnRQYXNzd29yZDogJycsXG4gICAgICAgICAgICAgICAgICAgIGFjY291bnRQYXNzd29yZENvcnJlY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBwaGFzZTogUGhhc2UuTWlncmF0ZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVycm9yOiBlIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiRXJyb3IgYm9vdHN0cmFwcGluZyBzZWNyZXQgc3RvcmFnZVwiLCBlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ2FuY2VsID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoZmFsc2UpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHJlc3RvcmVCYWNrdXAgPSBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgIC8vIEl0J3MgcG9zc2libGUgd2UnbGwgbmVlZCB0aGUgYmFja3VwIGtleSBsYXRlciBvbiBmb3IgYm9vdHN0cmFwcGluZyxcbiAgICAgICAgLy8gc28gbGV0J3Mgc3Rhc2ggaXQgaGVyZSwgcmF0aGVyIHRoYW4gcHJvbXB0aW5nIGZvciBpdCB0d2ljZS5cbiAgICAgICAgY29uc3Qga2V5Q2FsbGJhY2sgPSBrID0+IHRoaXMuYmFja3VwS2V5ID0gaztcblxuICAgICAgICBjb25zdCB7IGZpbmlzaGVkIH0gPSBNb2RhbC5jcmVhdGVEaWFsb2coUmVzdG9yZUtleUJhY2t1cERpYWxvZywge1xuICAgICAgICAgICAgc2hvd1N1bW1hcnk6IGZhbHNlLFxuICAgICAgICAgICAga2V5Q2FsbGJhY2ssXG4gICAgICAgIH0sIG51bGwsIC8qIHByaW9yaXR5ID0gKi8gZmFsc2UsIC8qIHN0YXRpYyA9ICovIGZhbHNlKTtcblxuICAgICAgICBhd2FpdCBmaW5pc2hlZDtcbiAgICAgICAgY29uc3QgeyBiYWNrdXBTaWdTdGF0dXMgfSA9IGF3YWl0IHRoaXMuZmV0Y2hCYWNrdXBJbmZvKCk7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIGJhY2t1cFNpZ1N0YXR1cy51c2FibGUgJiZcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuY2FuVXBsb2FkS2V5c1dpdGhQYXNzd29yZE9ubHkgJiZcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuYWNjb3VudFBhc3N3b3JkXG4gICAgICAgICkge1xuICAgICAgICAgICAgdGhpcy5ib290c3RyYXBTZWNyZXRTdG9yYWdlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkxvYWRSZXRyeUNsaWNrID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgcGhhc2U6IFBoYXNlLkxvYWRpbmcgfSk7XG4gICAgICAgIHRoaXMuZmV0Y2hCYWNrdXBJbmZvKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25TaG93S2V5Q29udGludWVDbGljayA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5ib290c3RyYXBTZWNyZXRTdG9yYWdlKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25DYW5jZWxDbGljayA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBoYXNlOiBQaGFzZS5Db25maXJtU2tpcCB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkdvQmFja0NsaWNrID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgcGhhc2U6IFBoYXNlLkNob29zZUtleVBhc3NwaHJhc2UgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25QYXNzUGhyYXNlTmV4dENsaWNrID0gYXN5bmMgKGU6IFJlYWN0LkZvcm1FdmVudCkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmICghdGhpcy5wYXNzcGhyYXNlRmllbGQuY3VycmVudCkgcmV0dXJuOyAvLyB1bm1vdW50aW5nXG5cbiAgICAgICAgYXdhaXQgdGhpcy5wYXNzcGhyYXNlRmllbGQuY3VycmVudC52YWxpZGF0ZSh7IGFsbG93RW1wdHk6IGZhbHNlIH0pO1xuICAgICAgICBpZiAoIXRoaXMucGFzc3BocmFzZUZpZWxkLmN1cnJlbnQuc3RhdGUudmFsaWQpIHtcbiAgICAgICAgICAgIHRoaXMucGFzc3BocmFzZUZpZWxkLmN1cnJlbnQuZm9jdXMoKTtcbiAgICAgICAgICAgIHRoaXMucGFzc3BocmFzZUZpZWxkLmN1cnJlbnQudmFsaWRhdGUoeyBhbGxvd0VtcHR5OiBmYWxzZSwgZm9jdXNlZDogdHJ1ZSB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwaGFzZTogUGhhc2UuUGFzc3BocmFzZUNvbmZpcm0gfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25QYXNzUGhyYXNlQ29uZmlybU5leHRDbGljayA9IGFzeW5jIChlOiBSZWFjdC5Gb3JtRXZlbnQpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnBhc3NQaHJhc2UgIT09IHRoaXMuc3RhdGUucGFzc1BocmFzZUNvbmZpcm0pIHJldHVybjtcblxuICAgICAgICB0aGlzLnJlY292ZXJ5S2V5ID1cbiAgICAgICAgICAgIGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5jcmVhdGVSZWNvdmVyeUtleUZyb21QYXNzcGhyYXNlKHRoaXMuc3RhdGUucGFzc1BocmFzZSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgY29waWVkOiBmYWxzZSxcbiAgICAgICAgICAgIGRvd25sb2FkZWQ6IGZhbHNlLFxuICAgICAgICAgICAgc2V0UGFzc3BocmFzZTogdHJ1ZSxcbiAgICAgICAgICAgIHBoYXNlOiBQaGFzZS5TaG93S2V5LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblNldEFnYWluQ2xpY2sgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcGFzc1BocmFzZTogJycsXG4gICAgICAgICAgICBwYXNzUGhyYXNlVmFsaWQ6IGZhbHNlLFxuICAgICAgICAgICAgcGFzc1BocmFzZUNvbmZpcm06ICcnLFxuICAgICAgICAgICAgcGhhc2U6IFBoYXNlLlBhc3NwaHJhc2UsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUGFzc1BocmFzZVZhbGlkYXRlID0gKHJlc3VsdDogSVZhbGlkYXRpb25SZXN1bHQpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwYXNzUGhyYXNlVmFsaWQ6IHJlc3VsdC52YWxpZCxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25QYXNzUGhyYXNlQ2hhbmdlID0gKGU6IFJlYWN0LkNoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcGFzc1BocmFzZTogZS50YXJnZXQudmFsdWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUGFzc1BocmFzZUNvbmZpcm1DaGFuZ2UgPSAoZTogUmVhY3QuQ2hhbmdlRXZlbnQ8SFRNTElucHV0RWxlbWVudD4pOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwYXNzUGhyYXNlQ29uZmlybTogZS50YXJnZXQudmFsdWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQWNjb3VudFBhc3N3b3JkQ2hhbmdlID0gKGU6IFJlYWN0LkNoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYWNjb3VudFBhc3N3b3JkOiBlLnRhcmdldC52YWx1ZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgcmVuZGVyT3B0aW9uS2V5KCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxTdHlsZWRSYWRpb0J1dHRvblxuICAgICAgICAgICAgICAgIGtleT17U2VjdXJlQmFja3VwU2V0dXBNZXRob2QuS2V5fVxuICAgICAgICAgICAgICAgIHZhbHVlPXtTZWN1cmVCYWNrdXBTZXR1cE1ldGhvZC5LZXl9XG4gICAgICAgICAgICAgICAgbmFtZT1cImtleVBhc3NwaHJhc2VcIlxuICAgICAgICAgICAgICAgIGNoZWNrZWQ9e3RoaXMuc3RhdGUucGFzc1BocmFzZUtleVNlbGVjdGVkID09PSBTZWN1cmVCYWNrdXBTZXR1cE1ldGhvZC5LZXl9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25LZXlQYXNzcGhyYXNlQ2hhbmdlfVxuICAgICAgICAgICAgICAgIG91dGxpbmVkXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DcmVhdGVTZWNyZXRTdG9yYWdlRGlhbG9nX29wdGlvblRpdGxlXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0NyZWF0ZVNlY3JldFN0b3JhZ2VEaWFsb2dfb3B0aW9uSWNvbiBteF9DcmVhdGVTZWNyZXRTdG9yYWdlRGlhbG9nX29wdGlvbkljb25fc2VjdXJlQmFja3VwXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIkdlbmVyYXRlIGEgU2VjdXJpdHkgS2V5XCIpIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PnsgX3QoXCJXZSdsbCBnZW5lcmF0ZSBhIFNlY3VyaXR5IEtleSBmb3IgeW91IHRvIHN0b3JlIHNvbWV3aGVyZSBzYWZlLCBsaWtlIGEgcGFzc3dvcmQgbWFuYWdlciBvciBhIHNhZmUuXCIpIH08L2Rpdj5cbiAgICAgICAgICAgIDwvU3R5bGVkUmFkaW9CdXR0b24+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJPcHRpb25QYXNzcGhyYXNlKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxTdHlsZWRSYWRpb0J1dHRvblxuICAgICAgICAgICAgICAgIGtleT17U2VjdXJlQmFja3VwU2V0dXBNZXRob2QuUGFzc3BocmFzZX1cbiAgICAgICAgICAgICAgICB2YWx1ZT17U2VjdXJlQmFja3VwU2V0dXBNZXRob2QuUGFzc3BocmFzZX1cbiAgICAgICAgICAgICAgICBuYW1lPVwia2V5UGFzc3BocmFzZVwiXG4gICAgICAgICAgICAgICAgY2hlY2tlZD17dGhpcy5zdGF0ZS5wYXNzUGhyYXNlS2V5U2VsZWN0ZWQgPT09IFNlY3VyZUJhY2t1cFNldHVwTWV0aG9kLlBhc3NwaHJhc2V9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25LZXlQYXNzcGhyYXNlQ2hhbmdlfVxuICAgICAgICAgICAgICAgIG91dGxpbmVkXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DcmVhdGVTZWNyZXRTdG9yYWdlRGlhbG9nX29wdGlvblRpdGxlXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0NyZWF0ZVNlY3JldFN0b3JhZ2VEaWFsb2dfb3B0aW9uSWNvbiBteF9DcmVhdGVTZWNyZXRTdG9yYWdlRGlhbG9nX29wdGlvbkljb25fc2VjdXJlUGhyYXNlXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIkVudGVyIGEgU2VjdXJpdHkgUGhyYXNlXCIpIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PnsgX3QoXCJVc2UgYSBzZWNyZXQgcGhyYXNlIG9ubHkgeW91IGtub3csIGFuZCBvcHRpb25hbGx5IHNhdmUgYSBTZWN1cml0eSBLZXkgdG8gdXNlIGZvciBiYWNrdXAuXCIpIH08L2Rpdj5cbiAgICAgICAgICAgIDwvU3R5bGVkUmFkaW9CdXR0b24+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJQaGFzZUNob29zZUtleVBhc3NwaHJhc2UoKTogSlNYLkVsZW1lbnQge1xuICAgICAgICBjb25zdCBzZXR1cE1ldGhvZHMgPSBnZXRTZWN1cmVCYWNrdXBTZXR1cE1ldGhvZHMoKTtcbiAgICAgICAgY29uc3Qgb3B0aW9uS2V5ID0gc2V0dXBNZXRob2RzLmluY2x1ZGVzKFNlY3VyZUJhY2t1cFNldHVwTWV0aG9kLktleSkgPyB0aGlzLnJlbmRlck9wdGlvbktleSgpIDogbnVsbDtcbiAgICAgICAgY29uc3Qgb3B0aW9uUGFzc3BocmFzZSA9IHNldHVwTWV0aG9kcy5pbmNsdWRlcyhTZWN1cmVCYWNrdXBTZXR1cE1ldGhvZC5QYXNzcGhyYXNlKVxuICAgICAgICAgICAgPyB0aGlzLnJlbmRlck9wdGlvblBhc3NwaHJhc2UoKVxuICAgICAgICAgICAgOiBudWxsO1xuXG4gICAgICAgIHJldHVybiA8Zm9ybSBvblN1Ym1pdD17dGhpcy5vbkNob29zZUtleVBhc3NwaHJhc2VGb3JtU3VibWl0fT5cbiAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cIm14X0NyZWF0ZVNlY3JldFN0b3JhZ2VEaWFsb2dfY2VudGVyZWRCb2R5XCI+eyBfdChcbiAgICAgICAgICAgICAgICBcIlNhZmVndWFyZCBhZ2FpbnN0IGxvc2luZyBhY2Nlc3MgdG8gZW5jcnlwdGVkIG1lc3NhZ2VzICYgZGF0YSBieSBcIiArXG4gICAgICAgICAgICAgICAgXCJiYWNraW5nIHVwIGVuY3J5cHRpb24ga2V5cyBvbiB5b3VyIHNlcnZlci5cIixcbiAgICAgICAgICAgICkgfTwvcD5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQ3JlYXRlU2VjcmV0U3RvcmFnZURpYWxvZ19wcmltYXJ5Q29udGFpbmVyXCIgcm9sZT1cInJhZGlvZ3JvdXBcIj5cbiAgICAgICAgICAgICAgICB7IG9wdGlvbktleSB9XG4gICAgICAgICAgICAgICAgeyBvcHRpb25QYXNzcGhyYXNlIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnNcbiAgICAgICAgICAgICAgICBwcmltYXJ5QnV0dG9uPXtfdChcIkNvbnRpbnVlXCIpfVxuICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLm9uQ2hvb3NlS2V5UGFzc3BocmFzZUZvcm1TdWJtaXR9XG4gICAgICAgICAgICAgICAgb25DYW5jZWw9e3RoaXMub25DYW5jZWxDbGlja31cbiAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e3RoaXMuc3RhdGUuY2FuU2tpcH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgIDwvZm9ybT47XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJQaGFzZU1pZ3JhdGUoKTogSlNYLkVsZW1lbnQge1xuICAgICAgICAvLyBUT0RPOiBUaGlzIGlzIGEgdGVtcG9yYXJ5IHNjcmVlbiBzbyBwZW9wbGUgd2hvIGhhdmUgdGhlIGxhYnMgZmxhZyB0dXJuZWQgb24gYW5kXG4gICAgICAgIC8vIGNsaWNrIHRoZSBidXR0b24gYXJlIGF3YXJlIHRoZXkncmUgbWFraW5nIGEgY2hhbmdlIHRvIHRoZWlyIGFjY291bnQuXG4gICAgICAgIC8vIE9uY2Ugd2UncmUgY29uZmlkZW50IGVub3VnaCBpbiB0aGlzIChhbmQgaXQncyBzdXBwb3J0ZWQgZW5vdWdoKSB3ZSBjYW4gZG9cbiAgICAgICAgLy8gaXQgYXV0b21hdGljYWxseS5cbiAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTE2OTZcblxuICAgICAgICBsZXQgYXV0aFByb21wdDtcbiAgICAgICAgbGV0IG5leHRDYXB0aW9uID0gX3QoXCJOZXh0XCIpO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5jYW5VcGxvYWRLZXlzV2l0aFBhc3N3b3JkT25seSkge1xuICAgICAgICAgICAgYXV0aFByb21wdCA9IDxkaXY+XG4gICAgICAgICAgICAgICAgPGRpdj57IF90KFwiRW50ZXIgeW91ciBhY2NvdW50IHBhc3N3b3JkIHRvIGNvbmZpcm0gdGhlIHVwZ3JhZGU6XCIpIH08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PjxGaWVsZFxuICAgICAgICAgICAgICAgICAgICB0eXBlPVwicGFzc3dvcmRcIlxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJQYXNzd29yZFwiKX1cbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUuYWNjb3VudFBhc3N3b3JkfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkFjY291bnRQYXNzd29yZENoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgZm9yY2VWYWxpZGl0eT17dGhpcy5zdGF0ZS5hY2NvdW50UGFzc3dvcmRDb3JyZWN0ID09PSBmYWxzZSA/IGZhbHNlIDogbnVsbH1cbiAgICAgICAgICAgICAgICAgICAgYXV0b0ZvY3VzPXt0cnVlfVxuICAgICAgICAgICAgICAgIC8+PC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuc3RhdGUuYmFja3VwU2lnU3RhdHVzLnVzYWJsZSkge1xuICAgICAgICAgICAgYXV0aFByb21wdCA9IDxkaXY+XG4gICAgICAgICAgICAgICAgPGRpdj57IF90KFwiUmVzdG9yZSB5b3VyIGtleSBiYWNrdXAgdG8gdXBncmFkZSB5b3VyIGVuY3J5cHRpb25cIikgfTwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgbmV4dENhcHRpb24gPSBfdChcIlJlc3RvcmVcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhdXRoUHJvbXB0ID0gPHA+XG4gICAgICAgICAgICAgICAgeyBfdChcIllvdSdsbCBuZWVkIHRvIGF1dGhlbnRpY2F0ZSB3aXRoIHRoZSBzZXJ2ZXIgdG8gY29uZmlybSB0aGUgdXBncmFkZS5cIikgfVxuICAgICAgICAgICAgPC9wPjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiA8Zm9ybSBvblN1Ym1pdD17dGhpcy5vbk1pZ3JhdGVGb3JtU3VibWl0fT5cbiAgICAgICAgICAgIDxwPnsgX3QoXG4gICAgICAgICAgICAgICAgXCJVcGdyYWRlIHRoaXMgc2Vzc2lvbiB0byBhbGxvdyBpdCB0byB2ZXJpZnkgb3RoZXIgc2Vzc2lvbnMsIFwiICtcbiAgICAgICAgICAgICAgICBcImdyYW50aW5nIHRoZW0gYWNjZXNzIHRvIGVuY3J5cHRlZCBtZXNzYWdlcyBhbmQgbWFya2luZyB0aGVtIFwiICtcbiAgICAgICAgICAgICAgICBcImFzIHRydXN0ZWQgZm9yIG90aGVyIHVzZXJzLlwiLFxuICAgICAgICAgICAgKSB9PC9wPlxuICAgICAgICAgICAgPGRpdj57IGF1dGhQcm9tcHQgfTwvZGl2PlxuICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnNcbiAgICAgICAgICAgICAgICBwcmltYXJ5QnV0dG9uPXtuZXh0Q2FwdGlvbn1cbiAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5vbk1pZ3JhdGVGb3JtU3VibWl0fVxuICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17ZmFsc2V9XG4gICAgICAgICAgICAgICAgcHJpbWFyeURpc2FibGVkPXt0aGlzLnN0YXRlLmNhblVwbG9hZEtleXNXaXRoUGFzc3dvcmRPbmx5ICYmICF0aGlzLnN0YXRlLmFjY291bnRQYXNzd29yZH1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJkYW5nZXJcIiBvbkNsaWNrPXt0aGlzLm9uQ2FuY2VsQ2xpY2t9PlxuICAgICAgICAgICAgICAgICAgICB7IF90KCdTa2lwJykgfVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9EaWFsb2dCdXR0b25zPlxuICAgICAgICA8L2Zvcm0+O1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyUGhhc2VQYXNzUGhyYXNlKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIDxmb3JtIG9uU3VibWl0PXt0aGlzLm9uUGFzc1BocmFzZU5leHRDbGlja30+XG4gICAgICAgICAgICA8cD57IF90KFxuICAgICAgICAgICAgICAgIFwiRW50ZXIgYSBzZWN1cml0eSBwaHJhc2Ugb25seSB5b3Uga25vdywgYXMgaXQncyB1c2VkIHRvIHNhZmVndWFyZCB5b3VyIGRhdGEuIFwiICtcbiAgICAgICAgICAgICAgICBcIlRvIGJlIHNlY3VyZSwgeW91IHNob3VsZG4ndCByZS11c2UgeW91ciBhY2NvdW50IHBhc3N3b3JkLlwiLFxuICAgICAgICAgICAgKSB9PC9wPlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NyZWF0ZVNlY3JldFN0b3JhZ2VEaWFsb2dfcGFzc1BocmFzZUNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgIDxQYXNzcGhyYXNlRmllbGRcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQ3JlYXRlU2VjcmV0U3RvcmFnZURpYWxvZ19wYXNzUGhyYXNlRmllbGRcIlxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblBhc3NQaHJhc2VDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgIG1pblNjb3JlPXtQQVNTV09SRF9NSU5fU0NPUkV9XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnBhc3NQaHJhc2V9XG4gICAgICAgICAgICAgICAgICAgIG9uVmFsaWRhdGU9e3RoaXMub25QYXNzUGhyYXNlVmFsaWRhdGV9XG4gICAgICAgICAgICAgICAgICAgIGZpZWxkUmVmPXt0aGlzLnBhc3NwaHJhc2VGaWVsZH1cbiAgICAgICAgICAgICAgICAgICAgYXV0b0ZvY3VzPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3RkKFwiRW50ZXIgYSBTZWN1cml0eSBQaHJhc2VcIil9XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsRW50ZXJQYXNzd29yZD17X3RkKFwiRW50ZXIgYSBTZWN1cml0eSBQaHJhc2VcIil9XG4gICAgICAgICAgICAgICAgICAgIGxhYmVsU3Ryb25nUGFzc3dvcmQ9e190ZChcIkdyZWF0ISBUaGlzIFNlY3VyaXR5IFBocmFzZSBsb29rcyBzdHJvbmcgZW5vdWdoLlwiKX1cbiAgICAgICAgICAgICAgICAgICAgbGFiZWxBbGxvd2VkQnV0VW5zYWZlPXtfdGQoXCJHcmVhdCEgVGhpcyBTZWN1cml0eSBQaHJhc2UgbG9va3Mgc3Ryb25nIGVub3VnaC5cIil9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8RGlhbG9nQnV0dG9uc1xuICAgICAgICAgICAgICAgIHByaW1hcnlCdXR0b249e190KCdDb250aW51ZScpfVxuICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLm9uUGFzc1BocmFzZU5leHRDbGlja31cbiAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e2ZhbHNlfVxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXshdGhpcy5zdGF0ZS5wYXNzUGhyYXNlVmFsaWR9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkNhbmNlbENsaWNrfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJkYW5nZXJcIlxuICAgICAgICAgICAgICAgID57IF90KFwiQ2FuY2VsXCIpIH08L2J1dHRvbj5cbiAgICAgICAgICAgIDwvRGlhbG9nQnV0dG9ucz5cbiAgICAgICAgPC9mb3JtPjtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlclBoYXNlUGFzc1BocmFzZUNvbmZpcm0oKTogSlNYLkVsZW1lbnQge1xuICAgICAgICBsZXQgbWF0Y2hUZXh0O1xuICAgICAgICBsZXQgY2hhbmdlVGV4dDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucGFzc1BocmFzZUNvbmZpcm0gPT09IHRoaXMuc3RhdGUucGFzc1BocmFzZSkge1xuICAgICAgICAgICAgbWF0Y2hUZXh0ID0gX3QoXCJUaGF0IG1hdGNoZXMhXCIpO1xuICAgICAgICAgICAgY2hhbmdlVGV4dCA9IF90KFwiVXNlIGEgZGlmZmVyZW50IHBhc3NwaHJhc2U/XCIpO1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLnN0YXRlLnBhc3NQaHJhc2Uuc3RhcnRzV2l0aCh0aGlzLnN0YXRlLnBhc3NQaHJhc2VDb25maXJtKSkge1xuICAgICAgICAgICAgLy8gb25seSB0ZWxsIHRoZW0gdGhleSdyZSB3cm9uZyBpZiB0aGV5J3ZlIGFjdHVhbGx5IGdvbmUgd3JvbmcuXG4gICAgICAgICAgICAvLyBTZWN1cml0eSBjb25zY2lvdXMgcmVhZGVycyB3aWxsIG5vdGUgdGhhdCBpZiB5b3UgbGVmdCBlbGVtZW50LXdlYiB1bmF0dGVuZGVkXG4gICAgICAgICAgICAvLyBvbiB0aGlzIHNjcmVlbiwgdGhpcyB3b3VsZCBtYWtlIGl0IGVhc3kgZm9yIGEgbWFsaWNpb3VzIHBlcnNvbiB0byBndWVzc1xuICAgICAgICAgICAgLy8geW91ciBwYXNzcGhyYXNlIG9uZSBsZXR0ZXIgYXQgYSB0aW1lLCBidXQgdGhleSBjb3VsZCBnZXQgdGhpcyBmYXN0ZXIgYnlcbiAgICAgICAgICAgIC8vIGp1c3Qgb3BlbmluZyB0aGUgYnJvd3NlcidzIGRldmVsb3BlciB0b29scyBhbmQgcmVhZGluZyBpdC5cbiAgICAgICAgICAgIC8vIE5vdGUgdGhhdCBub3QgaGF2aW5nIHR5cGVkIGFueXRoaW5nIGF0IGFsbCB3aWxsIG5vdCBoaXQgdGhpcyBjbGF1c2UgYW5kXG4gICAgICAgICAgICAvLyBmYWxsIHRocm91Z2ggc28gZW1wdHkgYm94ID09PSBubyBoaW50LlxuICAgICAgICAgICAgbWF0Y2hUZXh0ID0gX3QoXCJUaGF0IGRvZXNuJ3QgbWF0Y2guXCIpO1xuICAgICAgICAgICAgY2hhbmdlVGV4dCA9IF90KFwiR28gYmFjayB0byBzZXQgaXQgYWdhaW4uXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHBhc3NQaHJhc2VNYXRjaCA9IG51bGw7XG4gICAgICAgIGlmIChtYXRjaFRleHQpIHtcbiAgICAgICAgICAgIHBhc3NQaHJhc2VNYXRjaCA9IDxkaXY+XG4gICAgICAgICAgICAgICAgPGRpdj57IG1hdGNoVGV4dCB9PC9kaXY+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD1cImxpbmtcIiBvbkNsaWNrPXt0aGlzLm9uU2V0QWdhaW5DbGlja30+XG4gICAgICAgICAgICAgICAgICAgIHsgY2hhbmdlVGV4dCB9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiA8Zm9ybSBvblN1Ym1pdD17dGhpcy5vblBhc3NQaHJhc2VDb25maXJtTmV4dENsaWNrfT5cbiAgICAgICAgICAgIDxwPnsgX3QoXG4gICAgICAgICAgICAgICAgXCJFbnRlciB5b3VyIFNlY3VyaXR5IFBocmFzZSBhIHNlY29uZCB0aW1lIHRvIGNvbmZpcm0gaXQuXCIsXG4gICAgICAgICAgICApIH08L3A+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NyZWF0ZVNlY3JldFN0b3JhZ2VEaWFsb2dfcGFzc1BocmFzZUNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgICAgICAgICB0eXBlPVwicGFzc3dvcmRcIlxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblBhc3NQaHJhc2VDb25maXJtQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5wYXNzUGhyYXNlQ29uZmlybX1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQ3JlYXRlU2VjcmV0U3RvcmFnZURpYWxvZ19wYXNzUGhyYXNlRmllbGRcIlxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJDb25maXJtIHlvdXIgU2VjdXJpdHkgUGhyYXNlXCIpfVxuICAgICAgICAgICAgICAgICAgICBhdXRvRm9jdXM9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cIm5ldy1wYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NyZWF0ZVNlY3JldFN0b3JhZ2VEaWFsb2dfcGFzc1BocmFzZU1hdGNoXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgcGFzc1BocmFzZU1hdGNoIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnNcbiAgICAgICAgICAgICAgICBwcmltYXJ5QnV0dG9uPXtfdCgnQ29udGludWUnKX1cbiAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5vblBhc3NQaHJhc2VDb25maXJtTmV4dENsaWNrfVxuICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17ZmFsc2V9XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUucGFzc1BocmFzZSAhPT0gdGhpcy5zdGF0ZS5wYXNzUGhyYXNlQ29uZmlybX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQ2FuY2VsQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImRhbmdlclwiXG4gICAgICAgICAgICAgICAgPnsgX3QoXCJTa2lwXCIpIH08L2J1dHRvbj5cbiAgICAgICAgICAgIDwvRGlhbG9nQnV0dG9ucz5cbiAgICAgICAgPC9mb3JtPjtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlclBoYXNlU2hvd0tleSgpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIGxldCBjb250aW51ZUJ1dHRvbjtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucGhhc2UgPT09IFBoYXNlLlNob3dLZXkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlQnV0dG9uID0gPERpYWxvZ0J1dHRvbnMgcHJpbWFyeUJ1dHRvbj17X3QoXCJDb250aW51ZVwiKX1cbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17IXRoaXMuc3RhdGUuZG93bmxvYWRlZCAmJiAhdGhpcy5zdGF0ZS5jb3BpZWQgJiYgIXRoaXMuc3RhdGUuc2V0UGFzc3BocmFzZX1cbiAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5vblNob3dLZXlDb250aW51ZUNsaWNrfVxuICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17ZmFsc2V9XG4gICAgICAgICAgICAvPjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRpbnVlQnV0dG9uID0gPGRpdiBjbGFzc05hbWU9XCJteF9DcmVhdGVTZWNyZXRTdG9yYWdlRGlhbG9nX2NvbnRpbnVlU3Bpbm5lclwiPlxuICAgICAgICAgICAgICAgIDxJbmxpbmVTcGlubmVyIC8+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gPGRpdj5cbiAgICAgICAgICAgIDxwPnsgX3QoXG4gICAgICAgICAgICAgICAgXCJTdG9yZSB5b3VyIFNlY3VyaXR5IEtleSBzb21ld2hlcmUgc2FmZSwgbGlrZSBhIHBhc3N3b3JkIG1hbmFnZXIgb3IgYSBzYWZlLCBcIiArXG4gICAgICAgICAgICAgICAgXCJhcyBpdCdzIHVzZWQgdG8gc2FmZWd1YXJkIHlvdXIgZW5jcnlwdGVkIGRhdGEuXCIsXG4gICAgICAgICAgICApIH08L3A+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NyZWF0ZVNlY3JldFN0b3JhZ2VEaWFsb2dfcHJpbWFyeUNvbnRhaW5lciBteF9DcmVhdGVTZWNyZXRTdG9yYWdlRGlhbG9nX3JlY292ZXJ5S2V5UHJpbWFyeWNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQ3JlYXRlU2VjcmV0U3RvcmFnZURpYWxvZ19yZWNvdmVyeUtleUNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NyZWF0ZVNlY3JldFN0b3JhZ2VEaWFsb2dfcmVjb3ZlcnlLZXlcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxjb2RlIHJlZj17dGhpcy5yZWNvdmVyeUtleU5vZGV9PnsgdGhpcy5yZWNvdmVyeUtleS5lbmNvZGVkUHJpdmF0ZUtleSB9PC9jb2RlPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DcmVhdGVTZWNyZXRTdG9yYWdlRGlhbG9nX3JlY292ZXJ5S2V5QnV0dG9uc1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD0ncHJpbWFyeSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9EaWFsb2dfcHJpbWFyeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkRvd25sb2FkQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUucGhhc2UgPT09IFBoYXNlLlN0b3Jpbmd9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkRvd25sb2FkXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPnsgX3QoXCJvclwiKSB9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBraW5kPSdwcmltYXJ5J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0RpYWxvZ19wcmltYXJ5IG14X0NyZWF0ZVNlY3JldFN0b3JhZ2VEaWFsb2dfcmVjb3ZlcnlLZXlCdXR0b25zX2NvcHlCdG5cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25Db3B5Q2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUucGhhc2UgPT09IFBoYXNlLlN0b3Jpbmd9XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnN0YXRlLmNvcGllZCA/IF90KFwiQ29waWVkIVwiKSA6IF90KFwiQ29weVwiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICB7IGNvbnRpbnVlQnV0dG9uIH1cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyQnVzeVBoYXNlKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIDxkaXY+XG4gICAgICAgICAgICA8U3Bpbm5lciAvPlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJQaGFzZUxvYWRFcnJvcigpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIHJldHVybiA8ZGl2PlxuICAgICAgICAgICAgPHA+eyBfdChcIlVuYWJsZSB0byBxdWVyeSBzZWNyZXQgc3RvcmFnZSBzdGF0dXNcIikgfTwvcD5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2J1dHRvbnNcIj5cbiAgICAgICAgICAgICAgICA8RGlhbG9nQnV0dG9ucyBwcmltYXJ5QnV0dG9uPXtfdCgnUmV0cnknKX1cbiAgICAgICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMub25Mb2FkUmV0cnlDbGlja31cbiAgICAgICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXt0aGlzLnN0YXRlLmNhblNraXB9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2FuY2VsPXt0aGlzLm9uQ2FuY2VsfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyUGhhc2VTa2lwQ29uZmlybSgpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIHJldHVybiA8ZGl2PlxuICAgICAgICAgICAgPHA+eyBfdChcbiAgICAgICAgICAgICAgICBcIklmIHlvdSBjYW5jZWwgbm93LCB5b3UgbWF5IGxvc2UgZW5jcnlwdGVkIG1lc3NhZ2VzICYgZGF0YSBpZiB5b3UgbG9zZSBhY2Nlc3MgdG8geW91ciBsb2dpbnMuXCIsXG4gICAgICAgICAgICApIH08L3A+XG4gICAgICAgICAgICA8cD57IF90KFxuICAgICAgICAgICAgICAgIFwiWW91IGNhbiBhbHNvIHNldCB1cCBTZWN1cmUgQmFja3VwICYgbWFuYWdlIHlvdXIga2V5cyBpbiBTZXR0aW5ncy5cIixcbiAgICAgICAgICAgICkgfTwvcD5cbiAgICAgICAgICAgIDxEaWFsb2dCdXR0b25zIHByaW1hcnlCdXR0b249e190KCdHbyBiYWNrJyl9XG4gICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMub25Hb0JhY2tDbGlja31cbiAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e2ZhbHNlfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImRhbmdlclwiIG9uQ2xpY2s9e3RoaXMub25DYW5jZWx9PnsgX3QoJ0NhbmNlbCcpIH08L2J1dHRvbj5cbiAgICAgICAgICAgIDwvRGlhbG9nQnV0dG9ucz5cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cblxuICAgIHByaXZhdGUgdGl0bGVGb3JQaGFzZShwaGFzZTogUGhhc2UpOiBzdHJpbmcge1xuICAgICAgICBzd2l0Y2ggKHBoYXNlKSB7XG4gICAgICAgICAgICBjYXNlIFBoYXNlLkNob29zZUtleVBhc3NwaHJhc2U6XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90KCdTZXQgdXAgU2VjdXJlIEJhY2t1cCcpO1xuICAgICAgICAgICAgY2FzZSBQaGFzZS5NaWdyYXRlOlxuICAgICAgICAgICAgICAgIHJldHVybiBfdCgnVXBncmFkZSB5b3VyIGVuY3J5cHRpb24nKTtcbiAgICAgICAgICAgIGNhc2UgUGhhc2UuUGFzc3BocmFzZTpcbiAgICAgICAgICAgICAgICByZXR1cm4gX3QoJ1NldCBhIFNlY3VyaXR5IFBocmFzZScpO1xuICAgICAgICAgICAgY2FzZSBQaGFzZS5QYXNzcGhyYXNlQ29uZmlybTpcbiAgICAgICAgICAgICAgICByZXR1cm4gX3QoJ0NvbmZpcm0gU2VjdXJpdHkgUGhyYXNlJyk7XG4gICAgICAgICAgICBjYXNlIFBoYXNlLkNvbmZpcm1Ta2lwOlxuICAgICAgICAgICAgICAgIHJldHVybiBfdCgnQXJlIHlvdSBzdXJlPycpO1xuICAgICAgICAgICAgY2FzZSBQaGFzZS5TaG93S2V5OlxuICAgICAgICAgICAgICAgIHJldHVybiBfdCgnU2F2ZSB5b3VyIFNlY3VyaXR5IEtleScpO1xuICAgICAgICAgICAgY2FzZSBQaGFzZS5TdG9yaW5nOlxuICAgICAgICAgICAgICAgIHJldHVybiBfdCgnU2V0dGluZyB1cCBrZXlzJyk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIoKTogSlNYLkVsZW1lbnQge1xuICAgICAgICBsZXQgY29udGVudDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnRlbnQgPSA8ZGl2PlxuICAgICAgICAgICAgICAgIDxwPnsgX3QoXCJVbmFibGUgdG8gc2V0IHVwIHNlY3JldCBzdG9yYWdlXCIpIH08L3A+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfYnV0dG9uc1wiPlxuICAgICAgICAgICAgICAgICAgICA8RGlhbG9nQnV0dG9ucyBwcmltYXJ5QnV0dG9uPXtfdCgnUmV0cnknKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLmJvb3RzdHJhcFNlY3JldFN0b3JhZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e3RoaXMuc3RhdGUuY2FuU2tpcH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2FuY2VsPXt0aGlzLm9uQ2FuY2VsfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3dpdGNoICh0aGlzLnN0YXRlLnBoYXNlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBQaGFzZS5Mb2FkaW5nOlxuICAgICAgICAgICAgICAgICAgICBjb250ZW50ID0gdGhpcy5yZW5kZXJCdXN5UGhhc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBQaGFzZS5Mb2FkRXJyb3I6XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSB0aGlzLnJlbmRlclBoYXNlTG9hZEVycm9yKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUGhhc2UuQ2hvb3NlS2V5UGFzc3BocmFzZTpcbiAgICAgICAgICAgICAgICAgICAgY29udGVudCA9IHRoaXMucmVuZGVyUGhhc2VDaG9vc2VLZXlQYXNzcGhyYXNlKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUGhhc2UuTWlncmF0ZTpcbiAgICAgICAgICAgICAgICAgICAgY29udGVudCA9IHRoaXMucmVuZGVyUGhhc2VNaWdyYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUGhhc2UuUGFzc3BocmFzZTpcbiAgICAgICAgICAgICAgICAgICAgY29udGVudCA9IHRoaXMucmVuZGVyUGhhc2VQYXNzUGhyYXNlKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUGhhc2UuUGFzc3BocmFzZUNvbmZpcm06XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSB0aGlzLnJlbmRlclBoYXNlUGFzc1BocmFzZUNvbmZpcm0oKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBQaGFzZS5TaG93S2V5OlxuICAgICAgICAgICAgICAgICAgICBjb250ZW50ID0gdGhpcy5yZW5kZXJQaGFzZVNob3dLZXkoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBQaGFzZS5TdG9yaW5nOlxuICAgICAgICAgICAgICAgICAgICBjb250ZW50ID0gdGhpcy5yZW5kZXJCdXN5UGhhc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBQaGFzZS5Db25maXJtU2tpcDpcbiAgICAgICAgICAgICAgICAgICAgY29udGVudCA9IHRoaXMucmVuZGVyUGhhc2VTa2lwQ29uZmlybSgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB0aXRsZUNsYXNzID0gbnVsbDtcbiAgICAgICAgc3dpdGNoICh0aGlzLnN0YXRlLnBoYXNlKSB7XG4gICAgICAgICAgICBjYXNlIFBoYXNlLlBhc3NwaHJhc2U6XG4gICAgICAgICAgICBjYXNlIFBoYXNlLlBhc3NwaHJhc2VDb25maXJtOlxuICAgICAgICAgICAgICAgIHRpdGxlQ2xhc3MgPSBbXG4gICAgICAgICAgICAgICAgICAgICdteF9DcmVhdGVTZWNyZXRTdG9yYWdlRGlhbG9nX3RpdGxlV2l0aEljb24nLFxuICAgICAgICAgICAgICAgICAgICAnbXhfQ3JlYXRlU2VjcmV0U3RvcmFnZURpYWxvZ19zZWN1cmVQaHJhc2VUaXRsZScsXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUGhhc2UuU2hvd0tleTpcbiAgICAgICAgICAgICAgICB0aXRsZUNsYXNzID0gW1xuICAgICAgICAgICAgICAgICAgICAnbXhfQ3JlYXRlU2VjcmV0U3RvcmFnZURpYWxvZ190aXRsZVdpdGhJY29uJyxcbiAgICAgICAgICAgICAgICAgICAgJ214X0NyZWF0ZVNlY3JldFN0b3JhZ2VEaWFsb2dfc2VjdXJlQmFja3VwVGl0bGUnLFxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFBoYXNlLkNob29zZUtleVBhc3NwaHJhc2U6XG4gICAgICAgICAgICAgICAgdGl0bGVDbGFzcyA9ICdteF9DcmVhdGVTZWNyZXRTdG9yYWdlRGlhbG9nX2NlbnRlcmVkVGl0bGUnO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxCYXNlRGlhbG9nIGNsYXNzTmFtZT0nbXhfQ3JlYXRlU2VjcmV0U3RvcmFnZURpYWxvZydcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9XG4gICAgICAgICAgICAgICAgdGl0bGU9e3RoaXMudGl0bGVGb3JQaGFzZSh0aGlzLnN0YXRlLnBoYXNlKX1cbiAgICAgICAgICAgICAgICB0aXRsZUNsYXNzPXt0aXRsZUNsYXNzfVxuICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17dGhpcy5wcm9wcy5oYXNDYW5jZWwgJiYgW1BoYXNlLlBhc3NwaHJhc2VdLmluY2x1ZGVzKHRoaXMuc3RhdGUucGhhc2UpfVxuICAgICAgICAgICAgICAgIGZpeGVkV2lkdGg9e2ZhbHNlfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIHsgY29udGVudCB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L0Jhc2VEaWFsb2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFLQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFLQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBb0NBO0lBQ0tBLEs7O1dBQUFBLEs7RUFBQUEsSztFQUFBQSxLO0VBQUFBLEs7RUFBQUEsSztFQUFBQSxLO0VBQUFBLEs7RUFBQUEsSztFQUFBQSxLO0VBQUFBLEs7R0FBQUEsSyxLQUFBQSxLOztBQVlMLE1BQU1DLGtCQUFrQixHQUFHLENBQTNCLEMsQ0FBOEI7O0FBNEI5QjtBQUNBO0FBQ0E7QUFDQTtBQUNlLE1BQU1DLHlCQUFOLFNBQXdDQyxjQUFBLENBQU1DLGFBQTlDLENBQTRFO0VBVXZGQyxXQUFXLENBQUNDLEtBQUQsRUFBZ0I7SUFDdkIsTUFBTUEsS0FBTjtJQUR1QjtJQUFBO0lBQUEsb0VBSEQs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