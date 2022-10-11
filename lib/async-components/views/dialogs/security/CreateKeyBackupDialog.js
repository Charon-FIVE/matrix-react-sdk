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

var _MatrixClientPeg = require("../../../../MatrixClientPeg");

var _languageHandler = require("../../../../languageHandler");

var _SecurityManager = require("../../../../SecurityManager");

var _AccessibleButton = _interopRequireDefault(require("../../../../components/views/elements/AccessibleButton"));

var _strings = require("../../../../utils/strings");

var _PassphraseField = _interopRequireDefault(require("../../../../components/views/auth/PassphraseField"));

var _Spinner = _interopRequireDefault(require("../../../../components/views/elements/Spinner"));

var _BaseDialog = _interopRequireDefault(require("../../../../components/views/dialogs/BaseDialog"));

var _DialogButtons = _interopRequireDefault(require("../../../../components/views/elements/DialogButtons"));

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
var Phase;

(function (Phase) {
  Phase["Passphrase"] = "passphrase";
  Phase["PassphraseConfirm"] = "passphrase_confirm";
  Phase["ShowKey"] = "show_key";
  Phase["KeepItSafe"] = "keep_it_safe";
  Phase["BackingUp"] = "backing_up";
  Phase["Done"] = "done";
  Phase["OptOutConfirm"] = "opt_out_confirm";
})(Phase || (Phase = {}));

const PASSWORD_MIN_SCORE = 4; // So secure, many characters, much complex, wow, etc, etc.

/*
 * Walks the user through the process of creating an e2e key backup
 * on the server.
 */
class CreateKeyBackupDialog extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "keyBackupInfo", void 0);
    (0, _defineProperty2.default)(this, "recoveryKeyNode", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "passphraseField", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "onCopyClick", () => {
      const successful = (0, _strings.copyNode)(this.recoveryKeyNode.current);

      if (successful) {
        this.setState({
          copied: true,
          phase: Phase.KeepItSafe
        });
      }
    });
    (0, _defineProperty2.default)(this, "onDownloadClick", () => {
      const blob = new Blob([this.keyBackupInfo.recovery_key], {
        type: 'text/plain;charset=us-ascii'
      });

      _fileSaver.default.saveAs(blob, 'security-key.txt');

      this.setState({
        downloaded: true,
        phase: Phase.KeepItSafe
      });
    });
    (0, _defineProperty2.default)(this, "createBackup", async () => {
      const {
        secureSecretStorage
      } = this.state;
      this.setState({
        phase: Phase.BackingUp,
        error: null
      });
      let info;

      try {
        if (secureSecretStorage) {
          await (0, _SecurityManager.accessSecretStorage)(async () => {
            info = await _MatrixClientPeg.MatrixClientPeg.get().prepareKeyBackupVersion(null
            /* random key */
            , {
              secureSecretStorage: true
            });
            info = await _MatrixClientPeg.MatrixClientPeg.get().createKeyBackupVersion(info);
          });
        } else {
          info = await _MatrixClientPeg.MatrixClientPeg.get().createKeyBackupVersion(this.keyBackupInfo);
        }

        await _MatrixClientPeg.MatrixClientPeg.get().scheduleAllGroupSessionsForBackup();
        this.setState({
          phase: Phase.Done
        });
      } catch (e) {
        _logger.logger.error("Error creating key backup", e); // TODO: If creating a version succeeds, but backup fails, should we
        // delete the version, disable backup, or do nothing?  If we just
        // disable without deleting, we'll enable on next app reload since
        // it is trusted.


        if (info) {
          _MatrixClientPeg.MatrixClientPeg.get().deleteKeyBackupVersion(info.version);
        }

        this.setState({
          error: e
        });
      }
    });
    (0, _defineProperty2.default)(this, "onCancel", () => {
      this.props.onFinished(false);
    });
    (0, _defineProperty2.default)(this, "onDone", () => {
      this.props.onFinished(true);
    });
    (0, _defineProperty2.default)(this, "onSetUpClick", () => {
      this.setState({
        phase: Phase.Passphrase
      });
    });
    (0, _defineProperty2.default)(this, "onSkipPassPhraseClick", async () => {
      this.keyBackupInfo = await _MatrixClientPeg.MatrixClientPeg.get().prepareKeyBackupVersion();
      this.setState({
        copied: false,
        downloaded: false,
        phase: Phase.ShowKey
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
      this.keyBackupInfo = await _MatrixClientPeg.MatrixClientPeg.get().prepareKeyBackupVersion(this.state.passPhrase);
      this.setState({
        copied: false,
        downloaded: false,
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
    (0, _defineProperty2.default)(this, "onKeepItSafeBackClick", () => {
      this.setState({
        phase: Phase.ShowKey
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
    this.state = {
      secureSecretStorage: null,
      phase: Phase.Passphrase,
      passPhrase: '',
      passPhraseValid: false,
      passPhraseConfirm: '',
      copied: false,
      downloaded: false
    };
  }

  async componentDidMount() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const secureSecretStorage = await cli.doesServerSupportUnstableFeature("org.matrix.e2e_cross_signing");
    this.setState({
      secureSecretStorage
    }); // If we're using secret storage, skip ahead to the backing up step, as
    // `accessSecretStorage` will handle passphrases as needed.

    if (secureSecretStorage) {
      this.setState({
        phase: Phase.BackingUp
      });
      this.createBackup();
    }
  }

  renderPhasePassPhrase() {
    return /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.onPassPhraseNextClick
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("<b>Warning</b>: You should only set up key backup from a trusted computer.", {}, {
      b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
    })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("We'll store an encrypted copy of your keys on our server. " + "Secure your backup with a Security Phrase.")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("For maximum security, this should be different from your account password.")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateKeyBackupDialog_primaryContainer"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateKeyBackupDialog_passPhraseContainer"
    }, /*#__PURE__*/_react.default.createElement(_PassphraseField.default, {
      className: "mx_CreateKeyBackupDialog_passPhraseInput",
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
    }))), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: (0, _languageHandler._t)('Next'),
      onPrimaryButtonClick: this.onPassPhraseNextClick,
      hasCancel: false,
      disabled: !this.state.passPhraseValid
    }), /*#__PURE__*/_react.default.createElement("details", null, /*#__PURE__*/_react.default.createElement("summary", null, (0, _languageHandler._t)("Advanced")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "primary",
      onClick: this.onSkipPassPhraseClick
    }, (0, _languageHandler._t)("Set up with a Security Key"))));
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
      passPhraseMatch = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_CreateKeyBackupDialog_passPhraseMatch"
      }, /*#__PURE__*/_react.default.createElement("div", null, matchText), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "link",
        onClick: this.onSetAgainClick
      }, changeText));
    }

    return /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.onPassPhraseConfirmNextClick
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Enter your Security Phrase a second time to confirm it.")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateKeyBackupDialog_primaryContainer"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateKeyBackupDialog_passPhraseContainer"
    }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("input", {
      type: "password",
      onChange: this.onPassPhraseConfirmChange,
      value: this.state.passPhraseConfirm,
      className: "mx_CreateKeyBackupDialog_passPhraseInput",
      placeholder: (0, _languageHandler._t)("Repeat your Security Phrase..."),
      autoFocus: true
    })), passPhraseMatch)), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: (0, _languageHandler._t)('Next'),
      onPrimaryButtonClick: this.onPassPhraseConfirmNextClick,
      hasCancel: false,
      disabled: this.state.passPhrase !== this.state.passPhraseConfirm
    }));
  }

  renderPhaseShowKey() {
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Your Security Key is a safety net - you can use it to restore " + "access to your encrypted messages if you forget your Security Phrase.")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Keep a copy of it somewhere secure, like a password manager or even a safe.")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateKeyBackupDialog_primaryContainer"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateKeyBackupDialog_recoveryKeyHeader"
    }, (0, _languageHandler._t)("Your Security Key")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateKeyBackupDialog_recoveryKeyContainer"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateKeyBackupDialog_recoveryKey"
    }, /*#__PURE__*/_react.default.createElement("code", {
      ref: this.recoveryKeyNode
    }, this.keyBackupInfo.recovery_key)), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateKeyBackupDialog_recoveryKeyButtons"
    }, /*#__PURE__*/_react.default.createElement("button", {
      className: "mx_Dialog_primary",
      onClick: this.onCopyClick
    }, (0, _languageHandler._t)("Copy")), /*#__PURE__*/_react.default.createElement("button", {
      className: "mx_Dialog_primary",
      onClick: this.onDownloadClick
    }, (0, _languageHandler._t)("Download"))))));
  }

  renderPhaseKeepItSafe() {
    let introText;

    if (this.state.copied) {
      introText = (0, _languageHandler._t)("Your Security Key has been <b>copied to your clipboard</b>, paste it to:", {}, {
        b: s => /*#__PURE__*/_react.default.createElement("b", null, s)
      });
    } else if (this.state.downloaded) {
      introText = (0, _languageHandler._t)("Your Security Key is in your <b>Downloads</b> folder.", {}, {
        b: s => /*#__PURE__*/_react.default.createElement("b", null, s)
      });
    }

    return /*#__PURE__*/_react.default.createElement("div", null, introText, /*#__PURE__*/_react.default.createElement("ul", null, /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("<b>Print it</b> and store it somewhere safe", {}, {
      b: s => /*#__PURE__*/_react.default.createElement("b", null, s)
    })), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("<b>Save it</b> on a USB key or backup drive", {}, {
      b: s => /*#__PURE__*/_react.default.createElement("b", null, s)
    })), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("<b>Copy it</b> to your personal cloud storage", {}, {
      b: s => /*#__PURE__*/_react.default.createElement("b", null, s)
    }))), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: (0, _languageHandler._t)("Continue"),
      onPrimaryButtonClick: this.createBackup,
      hasCancel: false
    }, /*#__PURE__*/_react.default.createElement("button", {
      onClick: this.onKeepItSafeBackClick
    }, (0, _languageHandler._t)("Back"))));
  }

  renderBusyPhase() {
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_Spinner.default, null));
  }

  renderPhaseDone() {
    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Your keys are being backed up (the first backup could take a few minutes).")), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: (0, _languageHandler._t)('OK'),
      onPrimaryButtonClick: this.onDone,
      hasCancel: false
    }));
  }

  renderPhaseOptOutConfirm() {
    return /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Without setting up Secure Message Recovery, you won't be able to restore your " + "encrypted message history if you log out or use another session."), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: (0, _languageHandler._t)('Set up Secure Message Recovery'),
      onPrimaryButtonClick: this.onSetUpClick,
      hasCancel: false
    }, /*#__PURE__*/_react.default.createElement("button", {
      onClick: this.onCancel
    }, "I understand, continue without")));
  }

  titleForPhase(phase) {
    switch (phase) {
      case Phase.Passphrase:
        return (0, _languageHandler._t)('Secure your backup with a Security Phrase');

      case Phase.PassphraseConfirm:
        return (0, _languageHandler._t)('Confirm your Security Phrase');

      case Phase.OptOutConfirm:
        return (0, _languageHandler._t)('Warning!');

      case Phase.ShowKey:
      case Phase.KeepItSafe:
        return (0, _languageHandler._t)('Make a copy of your Security Key');

      case Phase.BackingUp:
        return (0, _languageHandler._t)('Starting backup...');

      case Phase.Done:
        return (0, _languageHandler._t)('Success!');

      default:
        return (0, _languageHandler._t)("Create key backup");
    }
  }

  render() {
    let content;

    if (this.state.error) {
      content = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Unable to create key backup")), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
        primaryButton: (0, _languageHandler._t)('Retry'),
        onPrimaryButtonClick: this.createBackup,
        hasCancel: true,
        onCancel: this.onCancel
      }));
    } else {
      switch (this.state.phase) {
        case Phase.Passphrase:
          content = this.renderPhasePassPhrase();
          break;

        case Phase.PassphraseConfirm:
          content = this.renderPhasePassPhraseConfirm();
          break;

        case Phase.ShowKey:
          content = this.renderPhaseShowKey();
          break;

        case Phase.KeepItSafe:
          content = this.renderPhaseKeepItSafe();
          break;

        case Phase.BackingUp:
          content = this.renderBusyPhase();
          break;

        case Phase.Done:
          content = this.renderPhaseDone();
          break;

        case Phase.OptOutConfirm:
          content = this.renderPhaseOptOutConfirm();
          break;
      }
    }

    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_CreateKeyBackupDialog",
      onFinished: this.props.onFinished,
      title: this.titleForPhase(this.state.phase),
      hasCancel: [Phase.Passphrase, Phase.Done].includes(this.state.phase)
    }, /*#__PURE__*/_react.default.createElement("div", null, content));
  }

}

exports.default = CreateKeyBackupDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaGFzZSIsIlBBU1NXT1JEX01JTl9TQ09SRSIsIkNyZWF0ZUtleUJhY2t1cERpYWxvZyIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjcmVhdGVSZWYiLCJzdWNjZXNzZnVsIiwiY29weU5vZGUiLCJyZWNvdmVyeUtleU5vZGUiLCJjdXJyZW50Iiwic2V0U3RhdGUiLCJjb3BpZWQiLCJwaGFzZSIsIktlZXBJdFNhZmUiLCJibG9iIiwiQmxvYiIsImtleUJhY2t1cEluZm8iLCJyZWNvdmVyeV9rZXkiLCJ0eXBlIiwiRmlsZVNhdmVyIiwic2F2ZUFzIiwiZG93bmxvYWRlZCIsInNlY3VyZVNlY3JldFN0b3JhZ2UiLCJzdGF0ZSIsIkJhY2tpbmdVcCIsImVycm9yIiwiaW5mbyIsImFjY2Vzc1NlY3JldFN0b3JhZ2UiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJwcmVwYXJlS2V5QmFja3VwVmVyc2lvbiIsImNyZWF0ZUtleUJhY2t1cFZlcnNpb24iLCJzY2hlZHVsZUFsbEdyb3VwU2Vzc2lvbnNGb3JCYWNrdXAiLCJEb25lIiwiZSIsImxvZ2dlciIsImRlbGV0ZUtleUJhY2t1cFZlcnNpb24iLCJ2ZXJzaW9uIiwib25GaW5pc2hlZCIsIlBhc3NwaHJhc2UiLCJTaG93S2V5IiwicHJldmVudERlZmF1bHQiLCJwYXNzcGhyYXNlRmllbGQiLCJ2YWxpZGF0ZSIsImFsbG93RW1wdHkiLCJ2YWxpZCIsImZvY3VzIiwiZm9jdXNlZCIsIlBhc3NwaHJhc2VDb25maXJtIiwicGFzc1BocmFzZSIsInBhc3NQaHJhc2VDb25maXJtIiwicGFzc1BocmFzZVZhbGlkIiwicmVzdWx0IiwidGFyZ2V0IiwidmFsdWUiLCJjb21wb25lbnREaWRNb3VudCIsImNsaSIsImRvZXNTZXJ2ZXJTdXBwb3J0VW5zdGFibGVGZWF0dXJlIiwiY3JlYXRlQmFja3VwIiwicmVuZGVyUGhhc2VQYXNzUGhyYXNlIiwib25QYXNzUGhyYXNlTmV4dENsaWNrIiwiX3QiLCJiIiwic3ViIiwib25QYXNzUGhyYXNlQ2hhbmdlIiwib25QYXNzUGhyYXNlVmFsaWRhdGUiLCJfdGQiLCJvblNraXBQYXNzUGhyYXNlQ2xpY2siLCJyZW5kZXJQaGFzZVBhc3NQaHJhc2VDb25maXJtIiwibWF0Y2hUZXh0IiwiY2hhbmdlVGV4dCIsInN0YXJ0c1dpdGgiLCJwYXNzUGhyYXNlTWF0Y2giLCJvblNldEFnYWluQ2xpY2siLCJvblBhc3NQaHJhc2VDb25maXJtTmV4dENsaWNrIiwib25QYXNzUGhyYXNlQ29uZmlybUNoYW5nZSIsInJlbmRlclBoYXNlU2hvd0tleSIsIm9uQ29weUNsaWNrIiwib25Eb3dubG9hZENsaWNrIiwicmVuZGVyUGhhc2VLZWVwSXRTYWZlIiwiaW50cm9UZXh0IiwicyIsIm9uS2VlcEl0U2FmZUJhY2tDbGljayIsInJlbmRlckJ1c3lQaGFzZSIsInJlbmRlclBoYXNlRG9uZSIsIm9uRG9uZSIsInJlbmRlclBoYXNlT3B0T3V0Q29uZmlybSIsIm9uU2V0VXBDbGljayIsIm9uQ2FuY2VsIiwidGl0bGVGb3JQaGFzZSIsIk9wdE91dENvbmZpcm0iLCJyZW5kZXIiLCJjb250ZW50IiwiaW5jbHVkZXMiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvYXN5bmMtY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL3NlY3VyaXR5L0NyZWF0ZUtleUJhY2t1cERpYWxvZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE4LCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSwgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBjcmVhdGVSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgRmlsZVNhdmVyIGZyb20gJ2ZpbGUtc2F2ZXInO1xuaW1wb3J0IHsgSVByZXBhcmVkS2V5QmFja3VwVmVyc2lvbiB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jcnlwdG8vYmFja3VwXCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5cbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gJy4uLy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgeyBfdCwgX3RkIH0gZnJvbSAnLi4vLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7IGFjY2Vzc1NlY3JldFN0b3JhZ2UgfSBmcm9tICcuLi8uLi8uLi8uLi9TZWN1cml0eU1hbmFnZXInO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IHsgY29weU5vZGUgfSBmcm9tIFwiLi4vLi4vLi4vLi4vdXRpbHMvc3RyaW5nc1wiO1xuaW1wb3J0IFBhc3NwaHJhc2VGaWVsZCBmcm9tIFwiLi4vLi4vLi4vLi4vY29tcG9uZW50cy92aWV3cy9hdXRoL1Bhc3NwaHJhc2VGaWVsZFwiO1xuaW1wb3J0IHsgSURpYWxvZ1Byb3BzIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9JRGlhbG9nUHJvcHNcIjtcbmltcG9ydCBGaWVsZCBmcm9tIFwiLi4vLi4vLi4vLi4vY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9GaWVsZFwiO1xuaW1wb3J0IFNwaW5uZXIgZnJvbSBcIi4uLy4uLy4uLy4uL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvU3Bpbm5lclwiO1xuaW1wb3J0IEJhc2VEaWFsb2cgZnJvbSBcIi4uLy4uLy4uLy4uL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9CYXNlRGlhbG9nXCI7XG5pbXBvcnQgRGlhbG9nQnV0dG9ucyBmcm9tIFwiLi4vLi4vLi4vLi4vY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9EaWFsb2dCdXR0b25zXCI7XG5pbXBvcnQgeyBJVmFsaWRhdGlvblJlc3VsdCB9IGZyb20gXCIuLi8uLi8uLi8uLi9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL1ZhbGlkYXRpb25cIjtcblxuZW51bSBQaGFzZSB7XG4gICAgUGFzc3BocmFzZSA9IFwicGFzc3BocmFzZVwiLFxuICAgIFBhc3NwaHJhc2VDb25maXJtID0gXCJwYXNzcGhyYXNlX2NvbmZpcm1cIixcbiAgICBTaG93S2V5ID0gXCJzaG93X2tleVwiLFxuICAgIEtlZXBJdFNhZmUgPSBcImtlZXBfaXRfc2FmZVwiLFxuICAgIEJhY2tpbmdVcCA9IFwiYmFja2luZ191cFwiLFxuICAgIERvbmUgPSBcImRvbmVcIixcbiAgICBPcHRPdXRDb25maXJtID0gXCJvcHRfb3V0X2NvbmZpcm1cIixcbn1cblxuY29uc3QgUEFTU1dPUkRfTUlOX1NDT1JFID0gNDsgLy8gU28gc2VjdXJlLCBtYW55IGNoYXJhY3RlcnMsIG11Y2ggY29tcGxleCwgd293LCBldGMsIGV0Yy5cblxuaW50ZXJmYWNlIElQcm9wcyBleHRlbmRzIElEaWFsb2dQcm9wcyB7fVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBzZWN1cmVTZWNyZXRTdG9yYWdlOiBib29sZWFuO1xuICAgIHBoYXNlOiBQaGFzZTtcbiAgICBwYXNzUGhyYXNlOiBzdHJpbmc7XG4gICAgcGFzc1BocmFzZVZhbGlkOiBib29sZWFuO1xuICAgIHBhc3NQaHJhc2VDb25maXJtOiBzdHJpbmc7XG4gICAgY29waWVkOiBib29sZWFuO1xuICAgIGRvd25sb2FkZWQ6IGJvb2xlYW47XG4gICAgZXJyb3I/OiBzdHJpbmc7XG59XG5cbi8qXG4gKiBXYWxrcyB0aGUgdXNlciB0aHJvdWdoIHRoZSBwcm9jZXNzIG9mIGNyZWF0aW5nIGFuIGUyZSBrZXkgYmFja3VwXG4gKiBvbiB0aGUgc2VydmVyLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDcmVhdGVLZXlCYWNrdXBEaWFsb2cgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSBrZXlCYWNrdXBJbmZvOiBQaWNrPElQcmVwYXJlZEtleUJhY2t1cFZlcnNpb24sIFwicmVjb3Zlcnlfa2V5XCIgfCBcImFsZ29yaXRobVwiIHwgXCJhdXRoX2RhdGFcIj47XG4gICAgcHJpdmF0ZSByZWNvdmVyeUtleU5vZGUgPSBjcmVhdGVSZWY8SFRNTEVsZW1lbnQ+KCk7XG4gICAgcHJpdmF0ZSBwYXNzcGhyYXNlRmllbGQgPSBjcmVhdGVSZWY8RmllbGQ+KCk7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgc2VjdXJlU2VjcmV0U3RvcmFnZTogbnVsbCxcbiAgICAgICAgICAgIHBoYXNlOiBQaGFzZS5QYXNzcGhyYXNlLFxuICAgICAgICAgICAgcGFzc1BocmFzZTogJycsXG4gICAgICAgICAgICBwYXNzUGhyYXNlVmFsaWQ6IGZhbHNlLFxuICAgICAgICAgICAgcGFzc1BocmFzZUNvbmZpcm06ICcnLFxuICAgICAgICAgICAgY29waWVkOiBmYWxzZSxcbiAgICAgICAgICAgIGRvd25sb2FkZWQ6IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBjb21wb25lbnREaWRNb3VudCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCBzZWN1cmVTZWNyZXRTdG9yYWdlID0gYXdhaXQgY2xpLmRvZXNTZXJ2ZXJTdXBwb3J0VW5zdGFibGVGZWF0dXJlKFwib3JnLm1hdHJpeC5lMmVfY3Jvc3Nfc2lnbmluZ1wiKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNlY3VyZVNlY3JldFN0b3JhZ2UgfSk7XG5cbiAgICAgICAgLy8gSWYgd2UncmUgdXNpbmcgc2VjcmV0IHN0b3JhZ2UsIHNraXAgYWhlYWQgdG8gdGhlIGJhY2tpbmcgdXAgc3RlcCwgYXNcbiAgICAgICAgLy8gYGFjY2Vzc1NlY3JldFN0b3JhZ2VgIHdpbGwgaGFuZGxlIHBhc3NwaHJhc2VzIGFzIG5lZWRlZC5cbiAgICAgICAgaWYgKHNlY3VyZVNlY3JldFN0b3JhZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwaGFzZTogUGhhc2UuQmFja2luZ1VwIH0pO1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVCYWNrdXAoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25Db3B5Q2xpY2sgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IHN1Y2Nlc3NmdWwgPSBjb3B5Tm9kZSh0aGlzLnJlY292ZXJ5S2V5Tm9kZS5jdXJyZW50KTtcbiAgICAgICAgaWYgKHN1Y2Nlc3NmdWwpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGNvcGllZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBwaGFzZTogUGhhc2UuS2VlcEl0U2FmZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Eb3dubG9hZENsaWNrID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW3RoaXMua2V5QmFja3VwSW5mby5yZWNvdmVyeV9rZXldLCB7XG4gICAgICAgICAgICB0eXBlOiAndGV4dC9wbGFpbjtjaGFyc2V0PXVzLWFzY2lpJyxcbiAgICAgICAgfSk7XG4gICAgICAgIEZpbGVTYXZlci5zYXZlQXMoYmxvYiwgJ3NlY3VyaXR5LWtleS50eHQnKTtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGRvd25sb2FkZWQ6IHRydWUsXG4gICAgICAgICAgICBwaGFzZTogUGhhc2UuS2VlcEl0U2FmZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgY3JlYXRlQmFja3VwID0gYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICBjb25zdCB7IHNlY3VyZVNlY3JldFN0b3JhZ2UgfSA9IHRoaXMuc3RhdGU7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcGhhc2U6IFBoYXNlLkJhY2tpbmdVcCxcbiAgICAgICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICB9KTtcbiAgICAgICAgbGV0IGluZm87XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoc2VjdXJlU2VjcmV0U3RvcmFnZSkge1xuICAgICAgICAgICAgICAgIGF3YWl0IGFjY2Vzc1NlY3JldFN0b3JhZ2UoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpbmZvID0gYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLnByZXBhcmVLZXlCYWNrdXBWZXJzaW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCAvKiByYW5kb20ga2V5ICovLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzZWN1cmVTZWNyZXRTdG9yYWdlOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGluZm8gPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuY3JlYXRlS2V5QmFja3VwVmVyc2lvbihpbmZvKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaW5mbyA9IGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5jcmVhdGVLZXlCYWNrdXBWZXJzaW9uKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleUJhY2t1cEluZm8sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5zY2hlZHVsZUFsbEdyb3VwU2Vzc2lvbnNGb3JCYWNrdXAoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHBoYXNlOiBQaGFzZS5Eb25lLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkVycm9yIGNyZWF0aW5nIGtleSBiYWNrdXBcIiwgZSk7XG4gICAgICAgICAgICAvLyBUT0RPOiBJZiBjcmVhdGluZyBhIHZlcnNpb24gc3VjY2VlZHMsIGJ1dCBiYWNrdXAgZmFpbHMsIHNob3VsZCB3ZVxuICAgICAgICAgICAgLy8gZGVsZXRlIHRoZSB2ZXJzaW9uLCBkaXNhYmxlIGJhY2t1cCwgb3IgZG8gbm90aGluZz8gIElmIHdlIGp1c3RcbiAgICAgICAgICAgIC8vIGRpc2FibGUgd2l0aG91dCBkZWxldGluZywgd2UnbGwgZW5hYmxlIG9uIG5leHQgYXBwIHJlbG9hZCBzaW5jZVxuICAgICAgICAgICAgLy8gaXQgaXMgdHJ1c3RlZC5cbiAgICAgICAgICAgIGlmIChpbmZvKSB7XG4gICAgICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLmRlbGV0ZUtleUJhY2t1cFZlcnNpb24oaW5mby52ZXJzaW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGVycm9yOiBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNhbmNlbCA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKGZhbHNlKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkRvbmUgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh0cnVlKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblNldFVwQ2xpY2sgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwaGFzZTogUGhhc2UuUGFzc3BocmFzZSB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblNraXBQYXNzUGhyYXNlQ2xpY2sgPSBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgIHRoaXMua2V5QmFja3VwSW5mbyA9IGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5wcmVwYXJlS2V5QmFja3VwVmVyc2lvbigpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGNvcGllZDogZmFsc2UsXG4gICAgICAgICAgICBkb3dubG9hZGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHBoYXNlOiBQaGFzZS5TaG93S2V5LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblBhc3NQaHJhc2VOZXh0Q2xpY2sgPSBhc3luYyAoZTogUmVhY3QuRm9ybUV2ZW50KTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKCF0aGlzLnBhc3NwaHJhc2VGaWVsZC5jdXJyZW50KSByZXR1cm47IC8vIHVubW91bnRpbmdcblxuICAgICAgICBhd2FpdCB0aGlzLnBhc3NwaHJhc2VGaWVsZC5jdXJyZW50LnZhbGlkYXRlKHsgYWxsb3dFbXB0eTogZmFsc2UgfSk7XG4gICAgICAgIGlmICghdGhpcy5wYXNzcGhyYXNlRmllbGQuY3VycmVudC5zdGF0ZS52YWxpZCkge1xuICAgICAgICAgICAgdGhpcy5wYXNzcGhyYXNlRmllbGQuY3VycmVudC5mb2N1cygpO1xuICAgICAgICAgICAgdGhpcy5wYXNzcGhyYXNlRmllbGQuY3VycmVudC52YWxpZGF0ZSh7IGFsbG93RW1wdHk6IGZhbHNlLCBmb2N1c2VkOiB0cnVlIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBoYXNlOiBQaGFzZS5QYXNzcGhyYXNlQ29uZmlybSB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblBhc3NQaHJhc2VDb25maXJtTmV4dENsaWNrID0gYXN5bmMgKGU6IFJlYWN0LkZvcm1FdmVudCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucGFzc1BocmFzZSAhPT0gdGhpcy5zdGF0ZS5wYXNzUGhyYXNlQ29uZmlybSkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMua2V5QmFja3VwSW5mbyA9IGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5wcmVwYXJlS2V5QmFja3VwVmVyc2lvbih0aGlzLnN0YXRlLnBhc3NQaHJhc2UpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGNvcGllZDogZmFsc2UsXG4gICAgICAgICAgICBkb3dubG9hZGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHBoYXNlOiBQaGFzZS5TaG93S2V5LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblNldEFnYWluQ2xpY2sgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcGFzc1BocmFzZTogJycsXG4gICAgICAgICAgICBwYXNzUGhyYXNlVmFsaWQ6IGZhbHNlLFxuICAgICAgICAgICAgcGFzc1BocmFzZUNvbmZpcm06ICcnLFxuICAgICAgICAgICAgcGhhc2U6IFBoYXNlLlBhc3NwaHJhc2UsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uS2VlcEl0U2FmZUJhY2tDbGljayA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwaGFzZTogUGhhc2UuU2hvd0tleSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25QYXNzUGhyYXNlVmFsaWRhdGUgPSAocmVzdWx0OiBJVmFsaWRhdGlvblJlc3VsdCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHBhc3NQaHJhc2VWYWxpZDogcmVzdWx0LnZhbGlkLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblBhc3NQaHJhc2VDaGFuZ2UgPSAoZTogUmVhY3QuQ2hhbmdlRXZlbnQ8SFRNTElucHV0RWxlbWVudD4pOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwYXNzUGhyYXNlOiBlLnRhcmdldC52YWx1ZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25QYXNzUGhyYXNlQ29uZmlybUNoYW5nZSA9IChlOiBSZWFjdC5DaGFuZ2VFdmVudDxIVE1MSW5wdXRFbGVtZW50Pik6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHBhc3NQaHJhc2VDb25maXJtOiBlLnRhcmdldC52YWx1ZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgcmVuZGVyUGhhc2VQYXNzUGhyYXNlKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIDxmb3JtIG9uU3VibWl0PXt0aGlzLm9uUGFzc1BocmFzZU5leHRDbGlja30+XG4gICAgICAgICAgICA8cD57IF90KFxuICAgICAgICAgICAgICAgIFwiPGI+V2FybmluZzwvYj46IFlvdSBzaG91bGQgb25seSBzZXQgdXAga2V5IGJhY2t1cCBmcm9tIGEgdHJ1c3RlZCBjb21wdXRlci5cIiwge30sXG4gICAgICAgICAgICAgICAgeyBiOiBzdWIgPT4gPGI+eyBzdWIgfTwvYj4gfSxcbiAgICAgICAgICAgICkgfTwvcD5cbiAgICAgICAgICAgIDxwPnsgX3QoXG4gICAgICAgICAgICAgICAgXCJXZSdsbCBzdG9yZSBhbiBlbmNyeXB0ZWQgY29weSBvZiB5b3VyIGtleXMgb24gb3VyIHNlcnZlci4gXCIgK1xuICAgICAgICAgICAgICAgIFwiU2VjdXJlIHlvdXIgYmFja3VwIHdpdGggYSBTZWN1cml0eSBQaHJhc2UuXCIsXG4gICAgICAgICAgICApIH08L3A+XG4gICAgICAgICAgICA8cD57IF90KFwiRm9yIG1heGltdW0gc2VjdXJpdHksIHRoaXMgc2hvdWxkIGJlIGRpZmZlcmVudCBmcm9tIHlvdXIgYWNjb3VudCBwYXNzd29yZC5cIikgfTwvcD5cblxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DcmVhdGVLZXlCYWNrdXBEaWFsb2dfcHJpbWFyeUNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQ3JlYXRlS2V5QmFja3VwRGlhbG9nX3Bhc3NQaHJhc2VDb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPFBhc3NwaHJhc2VGaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQ3JlYXRlS2V5QmFja3VwRGlhbG9nX3Bhc3NQaHJhc2VJbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblBhc3NQaHJhc2VDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICBtaW5TY29yZT17UEFTU1dPUkRfTUlOX1NDT1JFfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUucGFzc1BocmFzZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uVmFsaWRhdGU9e3RoaXMub25QYXNzUGhyYXNlVmFsaWRhdGV9XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZFJlZj17dGhpcy5wYXNzcGhyYXNlRmllbGR9XG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRvRm9jdXM9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3RkKFwiRW50ZXIgYSBTZWN1cml0eSBQaHJhc2VcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbEVudGVyUGFzc3dvcmQ9e190ZChcIkVudGVyIGEgU2VjdXJpdHkgUGhyYXNlXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxTdHJvbmdQYXNzd29yZD17X3RkKFwiR3JlYXQhIFRoaXMgU2VjdXJpdHkgUGhyYXNlIGxvb2tzIHN0cm9uZyBlbm91Z2guXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWxBbGxvd2VkQnV0VW5zYWZlPXtfdGQoXCJHcmVhdCEgVGhpcyBTZWN1cml0eSBQaHJhc2UgbG9va3Mgc3Ryb25nIGVub3VnaC5cIil9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnNcbiAgICAgICAgICAgICAgICBwcmltYXJ5QnV0dG9uPXtfdCgnTmV4dCcpfVxuICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLm9uUGFzc1BocmFzZU5leHRDbGlja31cbiAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e2ZhbHNlfVxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXshdGhpcy5zdGF0ZS5wYXNzUGhyYXNlVmFsaWR9XG4gICAgICAgICAgICAvPlxuXG4gICAgICAgICAgICA8ZGV0YWlscz5cbiAgICAgICAgICAgICAgICA8c3VtbWFyeT57IF90KFwiQWR2YW5jZWRcIikgfTwvc3VtbWFyeT5cbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPSdwcmltYXJ5JyBvbkNsaWNrPXt0aGlzLm9uU2tpcFBhc3NQaHJhc2VDbGlja30+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJTZXQgdXAgd2l0aCBhIFNlY3VyaXR5IEtleVwiKSB9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgPC9kZXRhaWxzPlxuICAgICAgICA8L2Zvcm0+O1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyUGhhc2VQYXNzUGhyYXNlQ29uZmlybSgpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIGxldCBtYXRjaFRleHQ7XG4gICAgICAgIGxldCBjaGFuZ2VUZXh0O1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5wYXNzUGhyYXNlQ29uZmlybSA9PT0gdGhpcy5zdGF0ZS5wYXNzUGhyYXNlKSB7XG4gICAgICAgICAgICBtYXRjaFRleHQgPSBfdChcIlRoYXQgbWF0Y2hlcyFcIik7XG4gICAgICAgICAgICBjaGFuZ2VUZXh0ID0gX3QoXCJVc2UgYSBkaWZmZXJlbnQgcGFzc3BocmFzZT9cIik7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuc3RhdGUucGFzc1BocmFzZS5zdGFydHNXaXRoKHRoaXMuc3RhdGUucGFzc1BocmFzZUNvbmZpcm0pKSB7XG4gICAgICAgICAgICAvLyBvbmx5IHRlbGwgdGhlbSB0aGV5J3JlIHdyb25nIGlmIHRoZXkndmUgYWN0dWFsbHkgZ29uZSB3cm9uZy5cbiAgICAgICAgICAgIC8vIFNlY3VyaXR5IGNvbnNjaW91cyByZWFkZXJzIHdpbGwgbm90ZSB0aGF0IGlmIHlvdSBsZWZ0IGVsZW1lbnQtd2ViIHVuYXR0ZW5kZWRcbiAgICAgICAgICAgIC8vIG9uIHRoaXMgc2NyZWVuLCB0aGlzIHdvdWxkIG1ha2UgaXQgZWFzeSBmb3IgYSBtYWxpY2lvdXMgcGVyc29uIHRvIGd1ZXNzXG4gICAgICAgICAgICAvLyB5b3VyIHBhc3NwaHJhc2Ugb25lIGxldHRlciBhdCBhIHRpbWUsIGJ1dCB0aGV5IGNvdWxkIGdldCB0aGlzIGZhc3RlciBieVxuICAgICAgICAgICAgLy8ganVzdCBvcGVuaW5nIHRoZSBicm93c2VyJ3MgZGV2ZWxvcGVyIHRvb2xzIGFuZCByZWFkaW5nIGl0LlxuICAgICAgICAgICAgLy8gTm90ZSB0aGF0IG5vdCBoYXZpbmcgdHlwZWQgYW55dGhpbmcgYXQgYWxsIHdpbGwgbm90IGhpdCB0aGlzIGNsYXVzZSBhbmRcbiAgICAgICAgICAgIC8vIGZhbGwgdGhyb3VnaCBzbyBlbXB0eSBib3ggPT09IG5vIGhpbnQuXG4gICAgICAgICAgICBtYXRjaFRleHQgPSBfdChcIlRoYXQgZG9lc24ndCBtYXRjaC5cIik7XG4gICAgICAgICAgICBjaGFuZ2VUZXh0ID0gX3QoXCJHbyBiYWNrIHRvIHNldCBpdCBhZ2Fpbi5cIik7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcGFzc1BocmFzZU1hdGNoID0gbnVsbDtcbiAgICAgICAgaWYgKG1hdGNoVGV4dCkge1xuICAgICAgICAgICAgcGFzc1BocmFzZU1hdGNoID0gPGRpdiBjbGFzc05hbWU9XCJteF9DcmVhdGVLZXlCYWNrdXBEaWFsb2dfcGFzc1BocmFzZU1hdGNoXCI+XG4gICAgICAgICAgICAgICAgPGRpdj57IG1hdGNoVGV4dCB9PC9kaXY+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD1cImxpbmtcIiBvbkNsaWNrPXt0aGlzLm9uU2V0QWdhaW5DbGlja30+XG4gICAgICAgICAgICAgICAgICAgIHsgY2hhbmdlVGV4dCB9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiA8Zm9ybSBvblN1Ym1pdD17dGhpcy5vblBhc3NQaHJhc2VDb25maXJtTmV4dENsaWNrfT5cbiAgICAgICAgICAgIDxwPnsgX3QoXG4gICAgICAgICAgICAgICAgXCJFbnRlciB5b3VyIFNlY3VyaXR5IFBocmFzZSBhIHNlY29uZCB0aW1lIHRvIGNvbmZpcm0gaXQuXCIsXG4gICAgICAgICAgICApIH08L3A+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NyZWF0ZUtleUJhY2t1cERpYWxvZ19wcmltYXJ5Q29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DcmVhdGVLZXlCYWNrdXBEaWFsb2dfcGFzc1BocmFzZUNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25QYXNzUGhyYXNlQ29uZmlybUNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5wYXNzUGhyYXNlQ29uZmlybX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9DcmVhdGVLZXlCYWNrdXBEaWFsb2dfcGFzc1BocmFzZUlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17X3QoXCJSZXBlYXQgeW91ciBTZWN1cml0eSBQaHJhc2UuLi5cIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0ZvY3VzPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIHsgcGFzc1BocmFzZU1hdGNoIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnNcbiAgICAgICAgICAgICAgICBwcmltYXJ5QnV0dG9uPXtfdCgnTmV4dCcpfVxuICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLm9uUGFzc1BocmFzZUNvbmZpcm1OZXh0Q2xpY2t9XG4gICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXtmYWxzZX1cbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5zdGF0ZS5wYXNzUGhyYXNlICE9PSB0aGlzLnN0YXRlLnBhc3NQaHJhc2VDb25maXJtfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgPC9mb3JtPjtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlclBoYXNlU2hvd0tleSgpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIHJldHVybiA8ZGl2PlxuICAgICAgICAgICAgPHA+eyBfdChcbiAgICAgICAgICAgICAgICBcIllvdXIgU2VjdXJpdHkgS2V5IGlzIGEgc2FmZXR5IG5ldCAtIHlvdSBjYW4gdXNlIGl0IHRvIHJlc3RvcmUgXCIgK1xuICAgICAgICAgICAgICAgIFwiYWNjZXNzIHRvIHlvdXIgZW5jcnlwdGVkIG1lc3NhZ2VzIGlmIHlvdSBmb3JnZXQgeW91ciBTZWN1cml0eSBQaHJhc2UuXCIsXG4gICAgICAgICAgICApIH08L3A+XG4gICAgICAgICAgICA8cD57IF90KFxuICAgICAgICAgICAgICAgIFwiS2VlcCBhIGNvcHkgb2YgaXQgc29tZXdoZXJlIHNlY3VyZSwgbGlrZSBhIHBhc3N3b3JkIG1hbmFnZXIgb3IgZXZlbiBhIHNhZmUuXCIsXG4gICAgICAgICAgICApIH08L3A+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NyZWF0ZUtleUJhY2t1cERpYWxvZ19wcmltYXJ5Q29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DcmVhdGVLZXlCYWNrdXBEaWFsb2dfcmVjb3ZlcnlLZXlIZWFkZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIllvdXIgU2VjdXJpdHkgS2V5XCIpIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NyZWF0ZUtleUJhY2t1cERpYWxvZ19yZWNvdmVyeUtleUNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NyZWF0ZUtleUJhY2t1cERpYWxvZ19yZWNvdmVyeUtleVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGNvZGUgcmVmPXt0aGlzLnJlY292ZXJ5S2V5Tm9kZX0+eyB0aGlzLmtleUJhY2t1cEluZm8ucmVjb3Zlcnlfa2V5IH08L2NvZGU+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NyZWF0ZUtleUJhY2t1cERpYWxvZ19yZWNvdmVyeUtleUJ1dHRvbnNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwibXhfRGlhbG9nX3ByaW1hcnlcIiBvbkNsaWNrPXt0aGlzLm9uQ29weUNsaWNrfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiQ29weVwiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwibXhfRGlhbG9nX3ByaW1hcnlcIiBvbkNsaWNrPXt0aGlzLm9uRG93bmxvYWRDbGlja30+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkRvd25sb2FkXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJQaGFzZUtlZXBJdFNhZmUoKTogSlNYLkVsZW1lbnQge1xuICAgICAgICBsZXQgaW50cm9UZXh0O1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5jb3BpZWQpIHtcbiAgICAgICAgICAgIGludHJvVGV4dCA9IF90KFxuICAgICAgICAgICAgICAgIFwiWW91ciBTZWN1cml0eSBLZXkgaGFzIGJlZW4gPGI+Y29waWVkIHRvIHlvdXIgY2xpcGJvYXJkPC9iPiwgcGFzdGUgaXQgdG86XCIsXG4gICAgICAgICAgICAgICAge30sIHsgYjogcyA9PiA8Yj57IHMgfTwvYj4gfSxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5kb3dubG9hZGVkKSB7XG4gICAgICAgICAgICBpbnRyb1RleHQgPSBfdChcbiAgICAgICAgICAgICAgICBcIllvdXIgU2VjdXJpdHkgS2V5IGlzIGluIHlvdXIgPGI+RG93bmxvYWRzPC9iPiBmb2xkZXIuXCIsXG4gICAgICAgICAgICAgICAge30sIHsgYjogcyA9PiA8Yj57IHMgfTwvYj4gfSxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDxkaXY+XG4gICAgICAgICAgICB7IGludHJvVGV4dCB9XG4gICAgICAgICAgICA8dWw+XG4gICAgICAgICAgICAgICAgPGxpPnsgX3QoXCI8Yj5QcmludCBpdDwvYj4gYW5kIHN0b3JlIGl0IHNvbWV3aGVyZSBzYWZlXCIsIHt9LCB7IGI6IHMgPT4gPGI+eyBzIH08L2I+IH0pIH08L2xpPlxuICAgICAgICAgICAgICAgIDxsaT57IF90KFwiPGI+U2F2ZSBpdDwvYj4gb24gYSBVU0Iga2V5IG9yIGJhY2t1cCBkcml2ZVwiLCB7fSwgeyBiOiBzID0+IDxiPnsgcyB9PC9iPiB9KSB9PC9saT5cbiAgICAgICAgICAgICAgICA8bGk+eyBfdChcIjxiPkNvcHkgaXQ8L2I+IHRvIHlvdXIgcGVyc29uYWwgY2xvdWQgc3RvcmFnZVwiLCB7fSwgeyBiOiBzID0+IDxiPnsgcyB9PC9iPiB9KSB9PC9saT5cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICA8RGlhbG9nQnV0dG9ucyBwcmltYXJ5QnV0dG9uPXtfdChcIkNvbnRpbnVlXCIpfVxuICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLmNyZWF0ZUJhY2t1cH1cbiAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e2ZhbHNlfT5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMub25LZWVwSXRTYWZlQmFja0NsaWNrfT57IF90KFwiQmFja1wiKSB9PC9idXR0b24+XG4gICAgICAgICAgICA8L0RpYWxvZ0J1dHRvbnM+XG4gICAgICAgIDwvZGl2PjtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlckJ1c3lQaGFzZSgpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIHJldHVybiA8ZGl2PlxuICAgICAgICAgICAgPFNwaW5uZXIgLz5cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyUGhhc2VEb25lKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIDxkaXY+XG4gICAgICAgICAgICA8cD57IF90KFxuICAgICAgICAgICAgICAgIFwiWW91ciBrZXlzIGFyZSBiZWluZyBiYWNrZWQgdXAgKHRoZSBmaXJzdCBiYWNrdXAgY291bGQgdGFrZSBhIGZldyBtaW51dGVzKS5cIixcbiAgICAgICAgICAgICkgfTwvcD5cbiAgICAgICAgICAgIDxEaWFsb2dCdXR0b25zIHByaW1hcnlCdXR0b249e190KCdPSycpfVxuICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLm9uRG9uZX1cbiAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e2ZhbHNlfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyUGhhc2VPcHRPdXRDb25maXJtKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgcmV0dXJuIDxkaXY+XG4gICAgICAgICAgICB7IF90KFxuICAgICAgICAgICAgICAgIFwiV2l0aG91dCBzZXR0aW5nIHVwIFNlY3VyZSBNZXNzYWdlIFJlY292ZXJ5LCB5b3Ugd29uJ3QgYmUgYWJsZSB0byByZXN0b3JlIHlvdXIgXCIgK1xuICAgICAgICAgICAgICAgIFwiZW5jcnlwdGVkIG1lc3NhZ2UgaGlzdG9yeSBpZiB5b3UgbG9nIG91dCBvciB1c2UgYW5vdGhlciBzZXNzaW9uLlwiLFxuICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICA8RGlhbG9nQnV0dG9ucyBwcmltYXJ5QnV0dG9uPXtfdCgnU2V0IHVwIFNlY3VyZSBNZXNzYWdlIFJlY292ZXJ5Jyl9XG4gICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMub25TZXRVcENsaWNrfVxuICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17ZmFsc2V9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLm9uQ2FuY2VsfT5JIHVuZGVyc3RhbmQsIGNvbnRpbnVlIHdpdGhvdXQ8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvRGlhbG9nQnV0dG9ucz5cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cblxuICAgIHByaXZhdGUgdGl0bGVGb3JQaGFzZShwaGFzZTogUGhhc2UpOiBzdHJpbmcge1xuICAgICAgICBzd2l0Y2ggKHBoYXNlKSB7XG4gICAgICAgICAgICBjYXNlIFBoYXNlLlBhc3NwaHJhc2U6XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90KCdTZWN1cmUgeW91ciBiYWNrdXAgd2l0aCBhIFNlY3VyaXR5IFBocmFzZScpO1xuICAgICAgICAgICAgY2FzZSBQaGFzZS5QYXNzcGhyYXNlQ29uZmlybTpcbiAgICAgICAgICAgICAgICByZXR1cm4gX3QoJ0NvbmZpcm0geW91ciBTZWN1cml0eSBQaHJhc2UnKTtcbiAgICAgICAgICAgIGNhc2UgUGhhc2UuT3B0T3V0Q29uZmlybTpcbiAgICAgICAgICAgICAgICByZXR1cm4gX3QoJ1dhcm5pbmchJyk7XG4gICAgICAgICAgICBjYXNlIFBoYXNlLlNob3dLZXk6XG4gICAgICAgICAgICBjYXNlIFBoYXNlLktlZXBJdFNhZmU6XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90KCdNYWtlIGEgY29weSBvZiB5b3VyIFNlY3VyaXR5IEtleScpO1xuICAgICAgICAgICAgY2FzZSBQaGFzZS5CYWNraW5nVXA6XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90KCdTdGFydGluZyBiYWNrdXAuLi4nKTtcbiAgICAgICAgICAgIGNhc2UgUGhhc2UuRG9uZTpcbiAgICAgICAgICAgICAgICByZXR1cm4gX3QoJ1N1Y2Nlc3MhJyk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBfdChcIkNyZWF0ZSBrZXkgYmFja3VwXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlcigpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIGxldCBjb250ZW50O1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5lcnJvcikge1xuICAgICAgICAgICAgY29udGVudCA9IDxkaXY+XG4gICAgICAgICAgICAgICAgPHA+eyBfdChcIlVuYWJsZSB0byBjcmVhdGUga2V5IGJhY2t1cFwiKSB9PC9wPlxuICAgICAgICAgICAgICAgIDxEaWFsb2dCdXR0b25zXG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlCdXR0b249e190KCdSZXRyeScpfVxuICAgICAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5jcmVhdGVCYWNrdXB9XG4gICAgICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgb25DYW5jZWw9e3RoaXMub25DYW5jZWx9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy5zdGF0ZS5waGFzZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgUGhhc2UuUGFzc3BocmFzZTpcbiAgICAgICAgICAgICAgICAgICAgY29udGVudCA9IHRoaXMucmVuZGVyUGhhc2VQYXNzUGhyYXNlKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUGhhc2UuUGFzc3BocmFzZUNvbmZpcm06XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSB0aGlzLnJlbmRlclBoYXNlUGFzc1BocmFzZUNvbmZpcm0oKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBQaGFzZS5TaG93S2V5OlxuICAgICAgICAgICAgICAgICAgICBjb250ZW50ID0gdGhpcy5yZW5kZXJQaGFzZVNob3dLZXkoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBQaGFzZS5LZWVwSXRTYWZlOlxuICAgICAgICAgICAgICAgICAgICBjb250ZW50ID0gdGhpcy5yZW5kZXJQaGFzZUtlZXBJdFNhZmUoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBQaGFzZS5CYWNraW5nVXA6XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSB0aGlzLnJlbmRlckJ1c3lQaGFzZSgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFBoYXNlLkRvbmU6XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSB0aGlzLnJlbmRlclBoYXNlRG9uZSgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFBoYXNlLk9wdE91dENvbmZpcm06XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQgPSB0aGlzLnJlbmRlclBoYXNlT3B0T3V0Q29uZmlybSgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QmFzZURpYWxvZyBjbGFzc05hbWU9J214X0NyZWF0ZUtleUJhY2t1cERpYWxvZydcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9XG4gICAgICAgICAgICAgICAgdGl0bGU9e3RoaXMudGl0bGVGb3JQaGFzZSh0aGlzLnN0YXRlLnBoYXNlKX1cbiAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e1tQaGFzZS5QYXNzcGhyYXNlLCBQaGFzZS5Eb25lXS5pbmNsdWRlcyh0aGlzLnN0YXRlLnBoYXNlKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICB7IGNvbnRlbnQgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9CYXNlRGlhbG9nPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFpQkE7O0FBQ0E7O0FBRUE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBR0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQWhDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQW9CS0EsSzs7V0FBQUEsSztFQUFBQSxLO0VBQUFBLEs7RUFBQUEsSztFQUFBQSxLO0VBQUFBLEs7RUFBQUEsSztFQUFBQSxLO0dBQUFBLEssS0FBQUEsSzs7QUFVTCxNQUFNQyxrQkFBa0IsR0FBRyxDQUEzQixDLENBQThCOztBQWU5QjtB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