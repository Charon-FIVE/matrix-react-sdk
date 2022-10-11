"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _lodash = require("lodash");

var _classnames = _interopRequireDefault(require("classnames"));

var _react = _interopRequireDefault(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _MatrixClientPeg = require("../../../../MatrixClientPeg");

var _Field = _interopRequireDefault(require("../../elements/Field"));

var _AccessibleButton = _interopRequireDefault(require("../../elements/AccessibleButton"));

var _languageHandler = require("../../../../languageHandler");

var _SecurityManager = require("../../../../SecurityManager");

var _Modal = _interopRequireDefault(require("../../../../Modal"));

var _InteractiveAuthDialog = _interopRequireDefault(require("../InteractiveAuthDialog"));

var _DialogButtons = _interopRequireDefault(require("../../elements/DialogButtons"));

var _BaseDialog = _interopRequireDefault(require("../BaseDialog"));

var _BrowserWorkarounds = require("../../../../utils/BrowserWorkarounds");

/*
Copyright 2018-2021 The Matrix.org Foundation C.I.C.

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
// Maximum acceptable size of a key file. It's 59 characters including the spaces we encode,
// so this should be plenty and allow for people putting extra whitespace in the file because
// maybe that's a thing people would do?
const KEY_FILE_MAX_SIZE = 128; // Don't shout at the user that their key is invalid every time they type a key: wait a short time

const VALIDATION_THROTTLE_MS = 200;

/*
 * Access Secure Secret Storage by requesting the user's passphrase.
 */
class AccessSecretStorageDialog extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "fileUpload", /*#__PURE__*/_react.default.createRef());
    (0, _defineProperty2.default)(this, "onCancel", () => {
      if (this.state.resetting) {
        this.setState({
          resetting: false
        });
      }

      this.props.onFinished(false);
    });
    (0, _defineProperty2.default)(this, "onUseRecoveryKeyClick", () => {
      this.setState({
        forceRecoveryKey: true
      });
    });
    (0, _defineProperty2.default)(this, "validateRecoveryKeyOnChange", (0, _lodash.debounce)(async () => {
      await this.validateRecoveryKey();
    }, VALIDATION_THROTTLE_MS));
    (0, _defineProperty2.default)(this, "onRecoveryKeyChange", ev => {
      this.setState({
        recoveryKey: ev.target.value,
        recoveryKeyFileError: null
      }); // also clear the file upload control so that the user can upload the same file
      // the did before (otherwise the onchange wouldn't fire)

      if (this.fileUpload.current) this.fileUpload.current.value = null; // We don't use Field's validation here because a) we want it in a separate place rather
      // than in a tooltip and b) we want it to display feedback based on the uploaded file
      // as well as the text box. Ideally we would refactor Field's validation logic so we could
      // re-use some of it.

      this.validateRecoveryKeyOnChange();
    });
    (0, _defineProperty2.default)(this, "onRecoveryKeyFileChange", async ev => {
      if (ev.target.files.length === 0) return;
      const f = ev.target.files[0];

      if (f.size > KEY_FILE_MAX_SIZE) {
        this.setState({
          recoveryKeyFileError: true,
          recoveryKeyCorrect: false,
          recoveryKeyValid: false
        });
      } else {
        const contents = await f.text(); // test it's within the base58 alphabet. We could be more strict here, eg. require the
        // right number of characters, but it's really just to make sure that what we're reading is
        // text because we'll put it in the text field.

        if (/^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz\s]+$/.test(contents)) {
          this.setState({
            recoveryKeyFileError: null,
            recoveryKey: contents.trim()
          });
          await this.validateRecoveryKey();
        } else {
          this.setState({
            recoveryKeyFileError: true,
            recoveryKeyCorrect: false,
            recoveryKeyValid: false,
            recoveryKey: ''
          });
        }
      }
    });
    (0, _defineProperty2.default)(this, "onRecoveryKeyFileUploadClick", () => {
      this.fileUpload.current.click();
    });
    (0, _defineProperty2.default)(this, "onPassPhraseNext", async ev => {
      ev.preventDefault();
      if (this.state.passPhrase.length <= 0) return;
      this.setState({
        keyMatches: null
      });
      const input = {
        passphrase: this.state.passPhrase
      };
      const keyMatches = await this.props.checkPrivateKey(input);

      if (keyMatches) {
        this.props.onFinished(input);
      } else {
        this.setState({
          keyMatches
        });
      }
    });
    (0, _defineProperty2.default)(this, "onRecoveryKeyNext", async ev => {
      ev.preventDefault();
      if (!this.state.recoveryKeyValid) return;
      this.setState({
        keyMatches: null
      });
      const input = {
        recoveryKey: this.state.recoveryKey
      };
      const keyMatches = await this.props.checkPrivateKey(input);

      if (keyMatches) {
        this.props.onFinished(input);
      } else {
        this.setState({
          keyMatches
        });
      }
    });
    (0, _defineProperty2.default)(this, "onPassPhraseChange", ev => {
      this.setState({
        passPhrase: ev.target.value,
        keyMatches: null
      });
    });
    (0, _defineProperty2.default)(this, "onResetAllClick", ev => {
      ev.preventDefault();
      this.setState({
        resetting: true
      });
    });
    (0, _defineProperty2.default)(this, "onConfirmResetAllClick", async () => {
      // Hide ourselves so the user can interact with the reset dialogs.
      // We don't conclude the promise chain (onFinished) yet to avoid confusing
      // any upstream code flows.
      //
      // Note: this will unmount us, so don't call `setState` or anything in the
      // rest of this function.
      _Modal.default.toggleCurrentDialogVisibility();

      try {
        // Force reset secret storage (which resets the key backup)
        await (0, _SecurityManager.accessSecretStorage)(async () => {
          // Now reset cross-signing so everything Just Works™ again.
          const cli = _MatrixClientPeg.MatrixClientPeg.get();

          await cli.bootstrapCrossSigning({
            authUploadDeviceSigningKeys: async makeRequest => {
              const {
                finished
              } = _Modal.default.createDialog(_InteractiveAuthDialog.default, {
                title: (0, _languageHandler._t)("Setting up keys"),
                matrixClient: cli,
                makeRequest
              });

              const [confirmed] = await finished;

              if (!confirmed) {
                throw new Error("Cross-signing key upload auth canceled");
              }
            },
            setupNewCrossSigning: true
          }); // Now we can indicate that the user is done pressing buttons, finally.
          // Upstream flows will detect the new secret storage, key backup, etc and use it.

          this.props.onFinished(true);
        }, true);
      } catch (e) {
        _logger.logger.error(e);

        this.props.onFinished(false);
      }
    });
    this.state = {
      recoveryKey: "",
      recoveryKeyValid: null,
      recoveryKeyCorrect: null,
      recoveryKeyFileError: null,
      forceRecoveryKey: false,
      passPhrase: '',
      keyMatches: null,
      resetting: false
    };
  }

  async validateRecoveryKey() {
    if (this.state.recoveryKey === '') {
      this.setState({
        recoveryKeyValid: null,
        recoveryKeyCorrect: null
      });
      return;
    }

    try {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const decodedKey = cli.keyBackupKeyFromRecoveryKey(this.state.recoveryKey);
      const correct = await cli.checkSecretStorageKey(decodedKey, this.props.keyInfo);
      this.setState({
        recoveryKeyValid: true,
        recoveryKeyCorrect: correct
      });
    } catch (e) {
      this.setState({
        recoveryKeyValid: false,
        recoveryKeyCorrect: false
      });
    }
  }

  getKeyValidationText() {
    if (this.state.recoveryKeyFileError) {
      return (0, _languageHandler._t)("Wrong file type");
    } else if (this.state.recoveryKeyCorrect) {
      return (0, _languageHandler._t)("Looks good!");
    } else if (this.state.recoveryKeyValid) {
      return (0, _languageHandler._t)("Wrong Security Key");
    } else if (this.state.recoveryKeyValid === null) {
      return '';
    } else {
      return (0, _languageHandler._t)("Invalid Security Key");
    }
  }

  render() {
    const hasPassphrase = this.props.keyInfo && this.props.keyInfo.passphrase && this.props.keyInfo.passphrase.salt && this.props.keyInfo.passphrase.iterations;

    const resetButton = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AccessSecretStorageDialog_reset"
    }, (0, _languageHandler._t)("Forgotten or lost all recovery methods? <a>Reset all</a>", null, {
      a: sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "link_inline",
        onClick: this.onResetAllClick,
        className: "mx_AccessSecretStorageDialog_reset_link"
      }, sub)
    }));

    let content;
    let title;
    let titleClass;

    if (this.state.resetting) {
      title = (0, _languageHandler._t)("Reset everything");
      titleClass = ['mx_AccessSecretStorageDialog_titleWithIcon mx_AccessSecretStorageDialog_resetBadge'];
      content = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Only do this if you have no other device to complete verification with.")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("If you reset everything, you will restart with no trusted sessions, no trusted users, and " + "might not be able to see past messages.")), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
        primaryButton: (0, _languageHandler._t)('Reset'),
        onPrimaryButtonClick: this.onConfirmResetAllClick,
        hasCancel: true,
        onCancel: this.onCancel,
        focus: false,
        primaryButtonClass: "danger"
      }));
    } else if (hasPassphrase && !this.state.forceRecoveryKey) {
      title = (0, _languageHandler._t)("Security Phrase");
      titleClass = ['mx_AccessSecretStorageDialog_titleWithIcon mx_AccessSecretStorageDialog_securePhraseTitle'];
      let keyStatus;

      if (this.state.keyMatches === false) {
        keyStatus = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_AccessSecretStorageDialog_keyStatus"
        }, "\uD83D\uDC4E ", (0, _languageHandler._t)("Unable to access secret storage. " + "Please verify that you entered the correct Security Phrase."));
      } else {
        keyStatus = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_AccessSecretStorageDialog_keyStatus"
        });
      }

      content = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Enter your Security Phrase or <button>use your Security Key</button> to continue.", {}, {
        button: s => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          kind: "link_inline",
          onClick: this.onUseRecoveryKeyClick
        }, s)
      })), /*#__PURE__*/_react.default.createElement("form", {
        className: "mx_AccessSecretStorageDialog_primaryContainer",
        onSubmit: this.onPassPhraseNext
      }, /*#__PURE__*/_react.default.createElement(_Field.default, {
        id: "mx_passPhraseInput",
        className: "mx_AccessSecretStorageDialog_passPhraseInput",
        type: "password",
        label: (0, _languageHandler._t)("Security Phrase"),
        value: this.state.passPhrase,
        onChange: this.onPassPhraseChange,
        autoFocus: true,
        autoComplete: "new-password"
      }), keyStatus, /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
        primaryButton: (0, _languageHandler._t)('Continue'),
        onPrimaryButtonClick: this.onPassPhraseNext,
        hasCancel: true,
        onCancel: this.onCancel,
        focus: false,
        primaryDisabled: this.state.passPhrase.length === 0,
        additive: resetButton
      })));
    } else {
      title = (0, _languageHandler._t)("Security Key");
      titleClass = ['mx_AccessSecretStorageDialog_titleWithIcon mx_AccessSecretStorageDialog_secureBackupTitle'];
      const feedbackClasses = (0, _classnames.default)({
        'mx_AccessSecretStorageDialog_recoveryKeyFeedback': true,
        'mx_AccessSecretStorageDialog_recoveryKeyFeedback--valid': this.state.recoveryKeyCorrect === true,
        'mx_AccessSecretStorageDialog_recoveryKeyFeedback--invalid': this.state.recoveryKeyCorrect === false
      });

      const recoveryKeyFeedback = /*#__PURE__*/_react.default.createElement("div", {
        className: feedbackClasses
      }, this.getKeyValidationText());

      content = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Use your Security Key to continue.")), /*#__PURE__*/_react.default.createElement("form", {
        className: "mx_AccessSecretStorageDialog_primaryContainer",
        onSubmit: this.onRecoveryKeyNext,
        spellCheck: false,
        autoComplete: "off"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_AccessSecretStorageDialog_recoveryKeyEntry"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_AccessSecretStorageDialog_recoveryKeyEntry_textInput"
      }, /*#__PURE__*/_react.default.createElement(_Field.default, {
        type: "password",
        id: "mx_securityKey",
        label: (0, _languageHandler._t)('Security Key'),
        value: this.state.recoveryKey,
        onChange: this.onRecoveryKeyChange,
        forceValidity: this.state.recoveryKeyCorrect,
        autoComplete: "off"
      })), /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_AccessSecretStorageDialog_recoveryKeyEntry_entryControlSeparatorText"
      }, (0, _languageHandler._t)("or")), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("input", {
        type: "file",
        className: "mx_AccessSecretStorageDialog_recoveryKeyEntry_fileInput",
        ref: this.fileUpload,
        onClick: _BrowserWorkarounds.chromeFileInputFix,
        onChange: this.onRecoveryKeyFileChange
      }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "primary",
        onClick: this.onRecoveryKeyFileUploadClick
      }, (0, _languageHandler._t)("Upload")))), recoveryKeyFeedback, /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
        primaryButton: (0, _languageHandler._t)('Continue'),
        onPrimaryButtonClick: this.onRecoveryKeyNext,
        hasCancel: true,
        cancelButton: (0, _languageHandler._t)("Go Back"),
        cancelButtonClass: "danger",
        onCancel: this.onCancel,
        focus: false,
        primaryDisabled: !this.state.recoveryKeyValid,
        additive: resetButton
      })));
    }

    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_AccessSecretStorageDialog",
      onFinished: this.props.onFinished,
      title: title,
      titleClass: titleClass
    }, /*#__PURE__*/_react.default.createElement("div", null, content));
  }

}

exports.default = AccessSecretStorageDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJLRVlfRklMRV9NQVhfU0laRSIsIlZBTElEQVRJT05fVEhST1RUTEVfTVMiLCJBY2Nlc3NTZWNyZXRTdG9yYWdlRGlhbG9nIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImNyZWF0ZVJlZiIsInN0YXRlIiwicmVzZXR0aW5nIiwic2V0U3RhdGUiLCJvbkZpbmlzaGVkIiwiZm9yY2VSZWNvdmVyeUtleSIsImRlYm91bmNlIiwidmFsaWRhdGVSZWNvdmVyeUtleSIsImV2IiwicmVjb3ZlcnlLZXkiLCJ0YXJnZXQiLCJ2YWx1ZSIsInJlY292ZXJ5S2V5RmlsZUVycm9yIiwiZmlsZVVwbG9hZCIsImN1cnJlbnQiLCJ2YWxpZGF0ZVJlY292ZXJ5S2V5T25DaGFuZ2UiLCJmaWxlcyIsImxlbmd0aCIsImYiLCJzaXplIiwicmVjb3ZlcnlLZXlDb3JyZWN0IiwicmVjb3ZlcnlLZXlWYWxpZCIsImNvbnRlbnRzIiwidGV4dCIsInRlc3QiLCJ0cmltIiwiY2xpY2siLCJwcmV2ZW50RGVmYXVsdCIsInBhc3NQaHJhc2UiLCJrZXlNYXRjaGVzIiwiaW5wdXQiLCJwYXNzcGhyYXNlIiwiY2hlY2tQcml2YXRlS2V5IiwiTW9kYWwiLCJ0b2dnbGVDdXJyZW50RGlhbG9nVmlzaWJpbGl0eSIsImFjY2Vzc1NlY3JldFN0b3JhZ2UiLCJjbGkiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJib290c3RyYXBDcm9zc1NpZ25pbmciLCJhdXRoVXBsb2FkRGV2aWNlU2lnbmluZ0tleXMiLCJtYWtlUmVxdWVzdCIsImZpbmlzaGVkIiwiY3JlYXRlRGlhbG9nIiwiSW50ZXJhY3RpdmVBdXRoRGlhbG9nIiwidGl0bGUiLCJfdCIsIm1hdHJpeENsaWVudCIsImNvbmZpcm1lZCIsIkVycm9yIiwic2V0dXBOZXdDcm9zc1NpZ25pbmciLCJlIiwibG9nZ2VyIiwiZXJyb3IiLCJkZWNvZGVkS2V5Iiwia2V5QmFja3VwS2V5RnJvbVJlY292ZXJ5S2V5IiwiY29ycmVjdCIsImNoZWNrU2VjcmV0U3RvcmFnZUtleSIsImtleUluZm8iLCJnZXRLZXlWYWxpZGF0aW9uVGV4dCIsInJlbmRlciIsImhhc1Bhc3NwaHJhc2UiLCJzYWx0IiwiaXRlcmF0aW9ucyIsInJlc2V0QnV0dG9uIiwiYSIsInN1YiIsIm9uUmVzZXRBbGxDbGljayIsImNvbnRlbnQiLCJ0aXRsZUNsYXNzIiwib25Db25maXJtUmVzZXRBbGxDbGljayIsIm9uQ2FuY2VsIiwia2V5U3RhdHVzIiwiYnV0dG9uIiwicyIsIm9uVXNlUmVjb3ZlcnlLZXlDbGljayIsIm9uUGFzc1BocmFzZU5leHQiLCJvblBhc3NQaHJhc2VDaGFuZ2UiLCJmZWVkYmFja0NsYXNzZXMiLCJjbGFzc05hbWVzIiwicmVjb3ZlcnlLZXlGZWVkYmFjayIsIm9uUmVjb3ZlcnlLZXlOZXh0Iiwib25SZWNvdmVyeUtleUNoYW5nZSIsImNocm9tZUZpbGVJbnB1dEZpeCIsIm9uUmVjb3ZlcnlLZXlGaWxlQ2hhbmdlIiwib25SZWNvdmVyeUtleUZpbGVVcGxvYWRDbGljayJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3Mvc2VjdXJpdHkvQWNjZXNzU2VjcmV0U3RvcmFnZURpYWxvZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE4LTIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgeyBkZWJvdW5jZSB9IGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IFJlYWN0LCB7IENoYW5nZUV2ZW50LCBGb3JtRXZlbnQgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBJU2VjcmV0U3RvcmFnZUtleUluZm8gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY3J5cHRvL2FwaVwiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuXG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tICcuLi8uLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IEZpZWxkIGZyb20gJy4uLy4uL2VsZW1lbnRzL0ZpZWxkJztcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gJy4uLy4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b24nO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHsgSURpYWxvZ1Byb3BzIH0gZnJvbSBcIi4uL0lEaWFsb2dQcm9wc1wiO1xuaW1wb3J0IHsgYWNjZXNzU2VjcmV0U3RvcmFnZSB9IGZyb20gXCIuLi8uLi8uLi8uLi9TZWN1cml0eU1hbmFnZXJcIjtcbmltcG9ydCBNb2RhbCBmcm9tIFwiLi4vLi4vLi4vLi4vTW9kYWxcIjtcbmltcG9ydCBJbnRlcmFjdGl2ZUF1dGhEaWFsb2cgZnJvbSBcIi4uL0ludGVyYWN0aXZlQXV0aERpYWxvZ1wiO1xuaW1wb3J0IERpYWxvZ0J1dHRvbnMgZnJvbSBcIi4uLy4uL2VsZW1lbnRzL0RpYWxvZ0J1dHRvbnNcIjtcbmltcG9ydCBCYXNlRGlhbG9nIGZyb20gXCIuLi9CYXNlRGlhbG9nXCI7XG5pbXBvcnQgeyBjaHJvbWVGaWxlSW5wdXRGaXggfSBmcm9tIFwiLi4vLi4vLi4vLi4vdXRpbHMvQnJvd3Nlcldvcmthcm91bmRzXCI7XG5cbi8vIE1heGltdW0gYWNjZXB0YWJsZSBzaXplIG9mIGEga2V5IGZpbGUuIEl0J3MgNTkgY2hhcmFjdGVycyBpbmNsdWRpbmcgdGhlIHNwYWNlcyB3ZSBlbmNvZGUsXG4vLyBzbyB0aGlzIHNob3VsZCBiZSBwbGVudHkgYW5kIGFsbG93IGZvciBwZW9wbGUgcHV0dGluZyBleHRyYSB3aGl0ZXNwYWNlIGluIHRoZSBmaWxlIGJlY2F1c2Vcbi8vIG1heWJlIHRoYXQncyBhIHRoaW5nIHBlb3BsZSB3b3VsZCBkbz9cbmNvbnN0IEtFWV9GSUxFX01BWF9TSVpFID0gMTI4O1xuXG4vLyBEb24ndCBzaG91dCBhdCB0aGUgdXNlciB0aGF0IHRoZWlyIGtleSBpcyBpbnZhbGlkIGV2ZXJ5IHRpbWUgdGhleSB0eXBlIGEga2V5OiB3YWl0IGEgc2hvcnQgdGltZVxuY29uc3QgVkFMSURBVElPTl9USFJPVFRMRV9NUyA9IDIwMDtcblxuaW50ZXJmYWNlIElQcm9wcyBleHRlbmRzIElEaWFsb2dQcm9wcyB7XG4gICAga2V5SW5mbzogSVNlY3JldFN0b3JhZ2VLZXlJbmZvO1xuICAgIGNoZWNrUHJpdmF0ZUtleTogKGs6IHtwYXNzcGhyYXNlPzogc3RyaW5nLCByZWNvdmVyeUtleT86IHN0cmluZ30pID0+IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIHJlY292ZXJ5S2V5OiBzdHJpbmc7XG4gICAgcmVjb3ZlcnlLZXlWYWxpZDogYm9vbGVhbiB8IG51bGw7XG4gICAgcmVjb3ZlcnlLZXlDb3JyZWN0OiBib29sZWFuIHwgbnVsbDtcbiAgICByZWNvdmVyeUtleUZpbGVFcnJvcjogYm9vbGVhbiB8IG51bGw7XG4gICAgZm9yY2VSZWNvdmVyeUtleTogYm9vbGVhbjtcbiAgICBwYXNzUGhyYXNlOiBzdHJpbmc7XG4gICAga2V5TWF0Y2hlczogYm9vbGVhbiB8IG51bGw7XG4gICAgcmVzZXR0aW5nOiBib29sZWFuO1xufVxuXG4vKlxuICogQWNjZXNzIFNlY3VyZSBTZWNyZXQgU3RvcmFnZSBieSByZXF1ZXN0aW5nIHRoZSB1c2VyJ3MgcGFzc3BocmFzZS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWNjZXNzU2VjcmV0U3RvcmFnZURpYWxvZyBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIGZpbGVVcGxvYWQgPSBSZWFjdC5jcmVhdGVSZWY8SFRNTElucHV0RWxlbWVudD4oKTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgcmVjb3ZlcnlLZXk6IFwiXCIsXG4gICAgICAgICAgICByZWNvdmVyeUtleVZhbGlkOiBudWxsLFxuICAgICAgICAgICAgcmVjb3ZlcnlLZXlDb3JyZWN0OiBudWxsLFxuICAgICAgICAgICAgcmVjb3ZlcnlLZXlGaWxlRXJyb3I6IG51bGwsXG4gICAgICAgICAgICBmb3JjZVJlY292ZXJ5S2V5OiBmYWxzZSxcbiAgICAgICAgICAgIHBhc3NQaHJhc2U6ICcnLFxuICAgICAgICAgICAga2V5TWF0Y2hlczogbnVsbCxcbiAgICAgICAgICAgIHJlc2V0dGluZzogZmFsc2UsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkNhbmNlbCA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucmVzZXR0aW5nKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgcmVzZXR0aW5nOiBmYWxzZSB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoZmFsc2UpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVXNlUmVjb3ZlcnlLZXlDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBmb3JjZVJlY292ZXJ5S2V5OiB0cnVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSB2YWxpZGF0ZVJlY292ZXJ5S2V5T25DaGFuZ2UgPSBkZWJvdW5jZShhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IHRoaXMudmFsaWRhdGVSZWNvdmVyeUtleSgpO1xuICAgIH0sIFZBTElEQVRJT05fVEhST1RUTEVfTVMpO1xuXG4gICAgcHJpdmF0ZSBhc3luYyB2YWxpZGF0ZVJlY292ZXJ5S2V5KCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5yZWNvdmVyeUtleSA9PT0gJycpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHJlY292ZXJ5S2V5VmFsaWQ6IG51bGwsXG4gICAgICAgICAgICAgICAgcmVjb3ZlcnlLZXlDb3JyZWN0OiBudWxsLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICAgICAgY29uc3QgZGVjb2RlZEtleSA9IGNsaS5rZXlCYWNrdXBLZXlGcm9tUmVjb3ZlcnlLZXkodGhpcy5zdGF0ZS5yZWNvdmVyeUtleSk7XG4gICAgICAgICAgICBjb25zdCBjb3JyZWN0ID0gYXdhaXQgY2xpLmNoZWNrU2VjcmV0U3RvcmFnZUtleShcbiAgICAgICAgICAgICAgICBkZWNvZGVkS2V5LCB0aGlzLnByb3BzLmtleUluZm8sXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgcmVjb3ZlcnlLZXlWYWxpZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICByZWNvdmVyeUtleUNvcnJlY3Q6IGNvcnJlY3QsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgcmVjb3ZlcnlLZXlWYWxpZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgcmVjb3ZlcnlLZXlDb3JyZWN0OiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblJlY292ZXJ5S2V5Q2hhbmdlID0gKGV2OiBDaGFuZ2VFdmVudDxIVE1MSW5wdXRFbGVtZW50PikgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHJlY292ZXJ5S2V5OiBldi50YXJnZXQudmFsdWUsXG4gICAgICAgICAgICByZWNvdmVyeUtleUZpbGVFcnJvcjogbnVsbCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gYWxzbyBjbGVhciB0aGUgZmlsZSB1cGxvYWQgY29udHJvbCBzbyB0aGF0IHRoZSB1c2VyIGNhbiB1cGxvYWQgdGhlIHNhbWUgZmlsZVxuICAgICAgICAvLyB0aGUgZGlkIGJlZm9yZSAob3RoZXJ3aXNlIHRoZSBvbmNoYW5nZSB3b3VsZG4ndCBmaXJlKVxuICAgICAgICBpZiAodGhpcy5maWxlVXBsb2FkLmN1cnJlbnQpIHRoaXMuZmlsZVVwbG9hZC5jdXJyZW50LnZhbHVlID0gbnVsbDtcblxuICAgICAgICAvLyBXZSBkb24ndCB1c2UgRmllbGQncyB2YWxpZGF0aW9uIGhlcmUgYmVjYXVzZSBhKSB3ZSB3YW50IGl0IGluIGEgc2VwYXJhdGUgcGxhY2UgcmF0aGVyXG4gICAgICAgIC8vIHRoYW4gaW4gYSB0b29sdGlwIGFuZCBiKSB3ZSB3YW50IGl0IHRvIGRpc3BsYXkgZmVlZGJhY2sgYmFzZWQgb24gdGhlIHVwbG9hZGVkIGZpbGVcbiAgICAgICAgLy8gYXMgd2VsbCBhcyB0aGUgdGV4dCBib3guIElkZWFsbHkgd2Ugd291bGQgcmVmYWN0b3IgRmllbGQncyB2YWxpZGF0aW9uIGxvZ2ljIHNvIHdlIGNvdWxkXG4gICAgICAgIC8vIHJlLXVzZSBzb21lIG9mIGl0LlxuICAgICAgICB0aGlzLnZhbGlkYXRlUmVjb3ZlcnlLZXlPbkNoYW5nZSgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUmVjb3ZlcnlLZXlGaWxlQ2hhbmdlID0gYXN5bmMgKGV2OiBDaGFuZ2VFdmVudDxIVE1MSW5wdXRFbGVtZW50PikgPT4ge1xuICAgICAgICBpZiAoZXYudGFyZ2V0LmZpbGVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGYgPSBldi50YXJnZXQuZmlsZXNbMF07XG5cbiAgICAgICAgaWYgKGYuc2l6ZSA+IEtFWV9GSUxFX01BWF9TSVpFKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICByZWNvdmVyeUtleUZpbGVFcnJvcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICByZWNvdmVyeUtleUNvcnJlY3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHJlY292ZXJ5S2V5VmFsaWQ6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50cyA9IGF3YWl0IGYudGV4dCgpO1xuICAgICAgICAgICAgLy8gdGVzdCBpdCdzIHdpdGhpbiB0aGUgYmFzZTU4IGFscGhhYmV0LiBXZSBjb3VsZCBiZSBtb3JlIHN0cmljdCBoZXJlLCBlZy4gcmVxdWlyZSB0aGVcbiAgICAgICAgICAgIC8vIHJpZ2h0IG51bWJlciBvZiBjaGFyYWN0ZXJzLCBidXQgaXQncyByZWFsbHkganVzdCB0byBtYWtlIHN1cmUgdGhhdCB3aGF0IHdlJ3JlIHJlYWRpbmcgaXNcbiAgICAgICAgICAgIC8vIHRleHQgYmVjYXVzZSB3ZSdsbCBwdXQgaXQgaW4gdGhlIHRleHQgZmllbGQuXG4gICAgICAgICAgICBpZiAoL15bMTIzNDU2Nzg5QUJDREVGR0hKS0xNTlBRUlNUVVZXWFlaYWJjZGVmZ2hpamttbm9wcXJzdHV2d3h5elxcc10rJC8udGVzdChjb250ZW50cykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgcmVjb3ZlcnlLZXlGaWxlRXJyb3I6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHJlY292ZXJ5S2V5OiBjb250ZW50cy50cmltKCksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy52YWxpZGF0ZVJlY292ZXJ5S2V5KCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICByZWNvdmVyeUtleUZpbGVFcnJvcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgcmVjb3ZlcnlLZXlDb3JyZWN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgcmVjb3ZlcnlLZXlWYWxpZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHJlY292ZXJ5S2V5OiAnJyxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUmVjb3ZlcnlLZXlGaWxlVXBsb2FkQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuZmlsZVVwbG9hZC5jdXJyZW50LmNsaWNrKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25QYXNzUGhyYXNlTmV4dCA9IGFzeW5jIChldjogRm9ybUV2ZW50PEhUTUxGb3JtRWxlbWVudD4gfCBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucGFzc1BocmFzZS5sZW5ndGggPD0gMCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBrZXlNYXRjaGVzOiBudWxsIH0pO1xuICAgICAgICBjb25zdCBpbnB1dCA9IHsgcGFzc3BocmFzZTogdGhpcy5zdGF0ZS5wYXNzUGhyYXNlIH07XG4gICAgICAgIGNvbnN0IGtleU1hdGNoZXMgPSBhd2FpdCB0aGlzLnByb3BzLmNoZWNrUHJpdmF0ZUtleShpbnB1dCk7XG4gICAgICAgIGlmIChrZXlNYXRjaGVzKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoaW5wdXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGtleU1hdGNoZXMgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJlY292ZXJ5S2V5TmV4dCA9IGFzeW5jIChldjogRm9ybUV2ZW50PEhUTUxGb3JtRWxlbWVudD4gfCBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnJlY292ZXJ5S2V5VmFsaWQpIHJldHVybjtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHsga2V5TWF0Y2hlczogbnVsbCB9KTtcbiAgICAgICAgY29uc3QgaW5wdXQgPSB7IHJlY292ZXJ5S2V5OiB0aGlzLnN0YXRlLnJlY292ZXJ5S2V5IH07XG4gICAgICAgIGNvbnN0IGtleU1hdGNoZXMgPSBhd2FpdCB0aGlzLnByb3BzLmNoZWNrUHJpdmF0ZUtleShpbnB1dCk7XG4gICAgICAgIGlmIChrZXlNYXRjaGVzKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoaW5wdXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGtleU1hdGNoZXMgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblBhc3NQaHJhc2VDaGFuZ2UgPSAoZXY6IENoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcGFzc1BocmFzZTogZXYudGFyZ2V0LnZhbHVlLFxuICAgICAgICAgICAga2V5TWF0Y2hlczogbnVsbCxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SZXNldEFsbENsaWNrID0gKGV2OiBSZWFjdC5Nb3VzZUV2ZW50PEhUTUxBbmNob3JFbGVtZW50PikgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgcmVzZXR0aW5nOiB0cnVlIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ29uZmlybVJlc2V0QWxsQ2xpY2sgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIC8vIEhpZGUgb3Vyc2VsdmVzIHNvIHRoZSB1c2VyIGNhbiBpbnRlcmFjdCB3aXRoIHRoZSByZXNldCBkaWFsb2dzLlxuICAgICAgICAvLyBXZSBkb24ndCBjb25jbHVkZSB0aGUgcHJvbWlzZSBjaGFpbiAob25GaW5pc2hlZCkgeWV0IHRvIGF2b2lkIGNvbmZ1c2luZ1xuICAgICAgICAvLyBhbnkgdXBzdHJlYW0gY29kZSBmbG93cy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gTm90ZTogdGhpcyB3aWxsIHVubW91bnQgdXMsIHNvIGRvbid0IGNhbGwgYHNldFN0YXRlYCBvciBhbnl0aGluZyBpbiB0aGVcbiAgICAgICAgLy8gcmVzdCBvZiB0aGlzIGZ1bmN0aW9uLlxuICAgICAgICBNb2RhbC50b2dnbGVDdXJyZW50RGlhbG9nVmlzaWJpbGl0eSgpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBGb3JjZSByZXNldCBzZWNyZXQgc3RvcmFnZSAod2hpY2ggcmVzZXRzIHRoZSBrZXkgYmFja3VwKVxuICAgICAgICAgICAgYXdhaXQgYWNjZXNzU2VjcmV0U3RvcmFnZShhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gTm93IHJlc2V0IGNyb3NzLXNpZ25pbmcgc28gZXZlcnl0aGluZyBKdXN0IFdvcmtz4oSiIGFnYWluLlxuICAgICAgICAgICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgICAgICAgICBhd2FpdCBjbGkuYm9vdHN0cmFwQ3Jvc3NTaWduaW5nKHtcbiAgICAgICAgICAgICAgICAgICAgYXV0aFVwbG9hZERldmljZVNpZ25pbmdLZXlzOiBhc3luYyAobWFrZVJlcXVlc3QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgZmluaXNoZWQgfSA9IE1vZGFsLmNyZWF0ZURpYWxvZyhJbnRlcmFjdGl2ZUF1dGhEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJTZXR0aW5nIHVwIGtleXNcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF0cml4Q2xpZW50OiBjbGksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFrZVJlcXVlc3QsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IFtjb25maXJtZWRdID0gYXdhaXQgZmluaXNoZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbmZpcm1lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNyb3NzLXNpZ25pbmcga2V5IHVwbG9hZCBhdXRoIGNhbmNlbGVkXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBzZXR1cE5ld0Nyb3NzU2lnbmluZzogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIE5vdyB3ZSBjYW4gaW5kaWNhdGUgdGhhdCB0aGUgdXNlciBpcyBkb25lIHByZXNzaW5nIGJ1dHRvbnMsIGZpbmFsbHkuXG4gICAgICAgICAgICAgICAgLy8gVXBzdHJlYW0gZmxvd3Mgd2lsbCBkZXRlY3QgdGhlIG5ldyBzZWNyZXQgc3RvcmFnZSwga2V5IGJhY2t1cCwgZXRjIGFuZCB1c2UgaXQuXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKHRydWUpO1xuICAgICAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlKTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBnZXRLZXlWYWxpZGF0aW9uVGV4dCgpOiBzdHJpbmcge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5yZWNvdmVyeUtleUZpbGVFcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIF90KFwiV3JvbmcgZmlsZSB0eXBlXCIpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUucmVjb3ZlcnlLZXlDb3JyZWN0KSB7XG4gICAgICAgICAgICByZXR1cm4gX3QoXCJMb29rcyBnb29kIVwiKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnJlY292ZXJ5S2V5VmFsaWQpIHtcbiAgICAgICAgICAgIHJldHVybiBfdChcIldyb25nIFNlY3VyaXR5IEtleVwiKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnJlY292ZXJ5S2V5VmFsaWQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBfdChcIkludmFsaWQgU2VjdXJpdHkgS2V5XCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBoYXNQYXNzcGhyYXNlID0gKFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5rZXlJbmZvICYmXG4gICAgICAgICAgICB0aGlzLnByb3BzLmtleUluZm8ucGFzc3BocmFzZSAmJlxuICAgICAgICAgICAgdGhpcy5wcm9wcy5rZXlJbmZvLnBhc3NwaHJhc2Uuc2FsdCAmJlxuICAgICAgICAgICAgdGhpcy5wcm9wcy5rZXlJbmZvLnBhc3NwaHJhc2UuaXRlcmF0aW9uc1xuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IHJlc2V0QnV0dG9uID0gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9BY2Nlc3NTZWNyZXRTdG9yYWdlRGlhbG9nX3Jlc2V0XCI+XG4gICAgICAgICAgICAgICAgeyBfdChcIkZvcmdvdHRlbiBvciBsb3N0IGFsbCByZWNvdmVyeSBtZXRob2RzPyA8YT5SZXNldCBhbGw8L2E+XCIsIG51bGwsIHtcbiAgICAgICAgICAgICAgICAgICAgYTogKHN1YikgPT4gPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJsaW5rX2lubGluZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uUmVzZXRBbGxDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0FjY2Vzc1NlY3JldFN0b3JhZ2VEaWFsb2dfcmVzZXRfbGlua1wiPnsgc3ViIH08L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgICAgIH0pIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuXG4gICAgICAgIGxldCBjb250ZW50O1xuICAgICAgICBsZXQgdGl0bGU7XG4gICAgICAgIGxldCB0aXRsZUNsYXNzO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5yZXNldHRpbmcpIHtcbiAgICAgICAgICAgIHRpdGxlID0gX3QoXCJSZXNldCBldmVyeXRoaW5nXCIpO1xuICAgICAgICAgICAgdGl0bGVDbGFzcyA9IFsnbXhfQWNjZXNzU2VjcmV0U3RvcmFnZURpYWxvZ190aXRsZVdpdGhJY29uIG14X0FjY2Vzc1NlY3JldFN0b3JhZ2VEaWFsb2dfcmVzZXRCYWRnZSddO1xuICAgICAgICAgICAgY29udGVudCA9IDxkaXY+XG4gICAgICAgICAgICAgICAgPHA+eyBfdChcIk9ubHkgZG8gdGhpcyBpZiB5b3UgaGF2ZSBubyBvdGhlciBkZXZpY2UgdG8gY29tcGxldGUgdmVyaWZpY2F0aW9uIHdpdGguXCIpIH08L3A+XG4gICAgICAgICAgICAgICAgPHA+eyBfdChcIklmIHlvdSByZXNldCBldmVyeXRoaW5nLCB5b3Ugd2lsbCByZXN0YXJ0IHdpdGggbm8gdHJ1c3RlZCBzZXNzaW9ucywgbm8gdHJ1c3RlZCB1c2VycywgYW5kIFwiXG4gICAgICAgICAgICAgICAgICAgICsgXCJtaWdodCBub3QgYmUgYWJsZSB0byBzZWUgcGFzdCBtZXNzYWdlcy5cIikgfTwvcD5cbiAgICAgICAgICAgICAgICA8RGlhbG9nQnV0dG9uc1xuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5QnV0dG9uPXtfdCgnUmVzZXQnKX1cbiAgICAgICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMub25Db25maXJtUmVzZXRBbGxDbGlja31cbiAgICAgICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5vbkNhbmNlbH1cbiAgICAgICAgICAgICAgICAgICAgZm9jdXM9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5QnV0dG9uQ2xhc3M9XCJkYW5nZXJcIlxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH0gZWxzZSBpZiAoaGFzUGFzc3BocmFzZSAmJiAhdGhpcy5zdGF0ZS5mb3JjZVJlY292ZXJ5S2V5KSB7XG4gICAgICAgICAgICB0aXRsZSA9IF90KFwiU2VjdXJpdHkgUGhyYXNlXCIpO1xuICAgICAgICAgICAgdGl0bGVDbGFzcyA9IFsnbXhfQWNjZXNzU2VjcmV0U3RvcmFnZURpYWxvZ190aXRsZVdpdGhJY29uIG14X0FjY2Vzc1NlY3JldFN0b3JhZ2VEaWFsb2dfc2VjdXJlUGhyYXNlVGl0bGUnXTtcblxuICAgICAgICAgICAgbGV0IGtleVN0YXR1cztcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmtleU1hdGNoZXMgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAga2V5U3RhdHVzID0gPGRpdiBjbGFzc05hbWU9XCJteF9BY2Nlc3NTZWNyZXRTdG9yYWdlRGlhbG9nX2tleVN0YXR1c1wiPlxuICAgICAgICAgICAgICAgICAgICB7IFwiXFx1RDgzRFxcdURDNEUgXCIgfXsgX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIlVuYWJsZSB0byBhY2Nlc3Mgc2VjcmV0IHN0b3JhZ2UuIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiUGxlYXNlIHZlcmlmeSB0aGF0IHlvdSBlbnRlcmVkIHRoZSBjb3JyZWN0IFNlY3VyaXR5IFBocmFzZS5cIixcbiAgICAgICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBrZXlTdGF0dXMgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X0FjY2Vzc1NlY3JldFN0b3JhZ2VEaWFsb2dfa2V5U3RhdHVzXCIgLz47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnRlbnQgPSA8ZGl2PlxuICAgICAgICAgICAgICAgIDxwPnsgX3QoXG4gICAgICAgICAgICAgICAgICAgIFwiRW50ZXIgeW91ciBTZWN1cml0eSBQaHJhc2Ugb3IgPGJ1dHRvbj51c2UgeW91ciBTZWN1cml0eSBLZXk8L2J1dHRvbj4gdG8gY29udGludWUuXCIsIHt9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidXR0b246IHMgPT4gPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBraW5kPVwibGlua19pbmxpbmVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25Vc2VSZWNvdmVyeUtleUNsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgcyB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICkgfTwvcD5cblxuICAgICAgICAgICAgICAgIDxmb3JtIGNsYXNzTmFtZT1cIm14X0FjY2Vzc1NlY3JldFN0b3JhZ2VEaWFsb2dfcHJpbWFyeUNvbnRhaW5lclwiIG9uU3VibWl0PXt0aGlzLm9uUGFzc1BocmFzZU5leHR9PlxuICAgICAgICAgICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkPVwibXhfcGFzc1BocmFzZUlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0FjY2Vzc1NlY3JldFN0b3JhZ2VEaWFsb2dfcGFzc1BocmFzZUlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJTZWN1cml0eSBQaHJhc2VcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5wYXNzUGhyYXNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25QYXNzUGhyYXNlQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0ZvY3VzPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwibmV3LXBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgeyBrZXlTdGF0dXMgfVxuICAgICAgICAgICAgICAgICAgICA8RGlhbG9nQnV0dG9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUJ1dHRvbj17X3QoJ0NvbnRpbnVlJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5vblBhc3NQaHJhc2VOZXh0fVxuICAgICAgICAgICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DYW5jZWw9e3RoaXMub25DYW5jZWx9XG4gICAgICAgICAgICAgICAgICAgICAgICBmb2N1cz17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5RGlzYWJsZWQ9e3RoaXMuc3RhdGUucGFzc1BocmFzZS5sZW5ndGggPT09IDB9XG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRpdGl2ZT17cmVzZXRCdXR0b259XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGl0bGUgPSBfdChcIlNlY3VyaXR5IEtleVwiKTtcbiAgICAgICAgICAgIHRpdGxlQ2xhc3MgPSBbJ214X0FjY2Vzc1NlY3JldFN0b3JhZ2VEaWFsb2dfdGl0bGVXaXRoSWNvbiBteF9BY2Nlc3NTZWNyZXRTdG9yYWdlRGlhbG9nX3NlY3VyZUJhY2t1cFRpdGxlJ107XG5cbiAgICAgICAgICAgIGNvbnN0IGZlZWRiYWNrQ2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgICAgICdteF9BY2Nlc3NTZWNyZXRTdG9yYWdlRGlhbG9nX3JlY292ZXJ5S2V5RmVlZGJhY2snOiB0cnVlLFxuICAgICAgICAgICAgICAgICdteF9BY2Nlc3NTZWNyZXRTdG9yYWdlRGlhbG9nX3JlY292ZXJ5S2V5RmVlZGJhY2stLXZhbGlkJzogdGhpcy5zdGF0ZS5yZWNvdmVyeUtleUNvcnJlY3QgPT09IHRydWUsXG4gICAgICAgICAgICAgICAgJ214X0FjY2Vzc1NlY3JldFN0b3JhZ2VEaWFsb2dfcmVjb3ZlcnlLZXlGZWVkYmFjay0taW52YWxpZCc6IHRoaXMuc3RhdGUucmVjb3ZlcnlLZXlDb3JyZWN0ID09PSBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgcmVjb3ZlcnlLZXlGZWVkYmFjayA9IDxkaXYgY2xhc3NOYW1lPXtmZWVkYmFja0NsYXNzZXN9PlxuICAgICAgICAgICAgICAgIHsgdGhpcy5nZXRLZXlWYWxpZGF0aW9uVGV4dCgpIH1cbiAgICAgICAgICAgIDwvZGl2PjtcblxuICAgICAgICAgICAgY29udGVudCA9IDxkaXY+XG4gICAgICAgICAgICAgICAgPHA+eyBfdChcIlVzZSB5b3VyIFNlY3VyaXR5IEtleSB0byBjb250aW51ZS5cIikgfTwvcD5cblxuICAgICAgICAgICAgICAgIDxmb3JtXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0FjY2Vzc1NlY3JldFN0b3JhZ2VEaWFsb2dfcHJpbWFyeUNvbnRhaW5lclwiXG4gICAgICAgICAgICAgICAgICAgIG9uU3VibWl0PXt0aGlzLm9uUmVjb3ZlcnlLZXlOZXh0fVxuICAgICAgICAgICAgICAgICAgICBzcGVsbENoZWNrPXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwib2ZmXCJcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQWNjZXNzU2VjcmV0U3RvcmFnZURpYWxvZ19yZWNvdmVyeUtleUVudHJ5XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0FjY2Vzc1NlY3JldFN0b3JhZ2VEaWFsb2dfcmVjb3ZlcnlLZXlFbnRyeV90ZXh0SW5wdXRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ9XCJteF9zZWN1cml0eUtleVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdCgnU2VjdXJpdHkgS2V5Jyl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnJlY292ZXJ5S2V5fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblJlY292ZXJ5S2V5Q2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3JjZVZhbGlkaXR5PXt0aGlzLnN0YXRlLnJlY292ZXJ5S2V5Q29ycmVjdH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwib2ZmXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9BY2Nlc3NTZWNyZXRTdG9yYWdlRGlhbG9nX3JlY292ZXJ5S2V5RW50cnlfZW50cnlDb250cm9sU2VwYXJhdG9yVGV4dFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJvclwiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiZmlsZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0FjY2Vzc1NlY3JldFN0b3JhZ2VEaWFsb2dfcmVjb3ZlcnlLZXlFbnRyeV9maWxlSW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWY9e3RoaXMuZmlsZVVwbG9hZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17Y2hyb21lRmlsZUlucHV0Rml4fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblJlY292ZXJ5S2V5RmlsZUNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9XCJwcmltYXJ5XCIgb25DbGljaz17dGhpcy5vblJlY292ZXJ5S2V5RmlsZVVwbG9hZENsaWNrfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIlVwbG9hZFwiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICB7IHJlY292ZXJ5S2V5RmVlZGJhY2sgfVxuICAgICAgICAgICAgICAgICAgICA8RGlhbG9nQnV0dG9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUJ1dHRvbj17X3QoJ0NvbnRpbnVlJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5vblJlY292ZXJ5S2V5TmV4dH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbmNlbEJ1dHRvbj17X3QoXCJHbyBCYWNrXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2FuY2VsQnV0dG9uQ2xhc3M9J2RhbmdlcidcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2FuY2VsPXt0aGlzLm9uQ2FuY2VsfVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXM9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeURpc2FibGVkPXshdGhpcy5zdGF0ZS5yZWNvdmVyeUtleVZhbGlkfVxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkaXRpdmU9e3Jlc2V0QnV0dG9ufVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QmFzZURpYWxvZyBjbGFzc05hbWU9J214X0FjY2Vzc1NlY3JldFN0b3JhZ2VEaWFsb2cnXG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXt0aXRsZX1cbiAgICAgICAgICAgICAgICB0aXRsZUNsYXNzPXt0aXRsZUNsYXNzfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIHsgY29udGVudCB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L0Jhc2VEaWFsb2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBb0JBO0FBQ0E7QUFDQTtBQUNBLE1BQU1BLGlCQUFpQixHQUFHLEdBQTFCLEMsQ0FFQTs7QUFDQSxNQUFNQyxzQkFBc0IsR0FBRyxHQUEvQjs7QUFrQkE7QUFDQTtBQUNBO0FB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