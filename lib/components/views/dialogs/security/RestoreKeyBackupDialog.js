"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _client = require("matrix-js-sdk/src/client");

var _logger = require("matrix-js-sdk/src/logger");

var _MatrixClientPeg = require("../../../../MatrixClientPeg");

var _languageHandler = require("../../../../languageHandler");

var _SecurityManager = require("../../../../SecurityManager");

var _Spinner = _interopRequireDefault(require("../../elements/Spinner"));

var _DialogButtons = _interopRequireDefault(require("../../elements/DialogButtons"));

var _AccessibleButton = _interopRequireDefault(require("../../elements/AccessibleButton"));

var _BaseDialog = _interopRequireDefault(require("../BaseDialog"));

/*
Copyright 2018, 2019 New Vector Ltd
Copyright 2020 The Matrix.org Foundation C.I.C.

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
var RestoreType;

(function (RestoreType) {
  RestoreType["Passphrase"] = "passphrase";
  RestoreType["RecoveryKey"] = "recovery_key";
  RestoreType["SecretStorage"] = "secret_storage";
})(RestoreType || (RestoreType = {}));

var ProgressState;

(function (ProgressState) {
  ProgressState["PreFetch"] = "prefetch";
  ProgressState["Fetch"] = "fetch";
  ProgressState["LoadKeys"] = "load_keys";
})(ProgressState || (ProgressState = {}));

/*
 * Dialog for restoring e2e keys from a backup and the user's recovery key
 */
class RestoreKeyBackupDialog extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onCancel", () => {
      this.props.onFinished(false);
    });
    (0, _defineProperty2.default)(this, "onDone", () => {
      this.props.onFinished(true);
    });
    (0, _defineProperty2.default)(this, "onUseRecoveryKeyClick", () => {
      this.setState({
        forceRecoveryKey: true
      });
    });
    (0, _defineProperty2.default)(this, "progressCallback", data => {
      this.setState({
        progress: data
      });
    });
    (0, _defineProperty2.default)(this, "onResetRecoveryClick", () => {
      this.props.onFinished(false);
      (0, _SecurityManager.accessSecretStorage)(async () => {},
      /* forceReset = */
      true);
    });
    (0, _defineProperty2.default)(this, "onRecoveryKeyChange", e => {
      this.setState({
        recoveryKey: e.target.value,
        recoveryKeyValid: _MatrixClientPeg.MatrixClientPeg.get().isValidRecoveryKey(e.target.value)
      });
    });
    (0, _defineProperty2.default)(this, "onPassPhraseNext", async () => {
      this.setState({
        loading: true,
        restoreError: null,
        restoreType: RestoreType.Passphrase
      });

      try {
        // We do still restore the key backup: we must ensure that the key backup key
        // is the right one and restoring it is currently the only way we can do this.
        const recoverInfo = await _MatrixClientPeg.MatrixClientPeg.get().restoreKeyBackupWithPassword(this.state.passPhrase, undefined, undefined, this.state.backupInfo, {
          progressCallback: this.progressCallback
        });

        if (this.props.keyCallback) {
          const key = await _MatrixClientPeg.MatrixClientPeg.get().keyBackupKeyFromPassword(this.state.passPhrase, this.state.backupInfo);
          this.props.keyCallback(key);
        }

        if (!this.props.showSummary) {
          this.props.onFinished(true);
          return;
        }

        this.setState({
          loading: false,
          recoverInfo
        });
      } catch (e) {
        _logger.logger.log("Error restoring backup", e);

        this.setState({
          loading: false,
          restoreError: e
        });
      }
    });
    (0, _defineProperty2.default)(this, "onRecoveryKeyNext", async () => {
      if (!this.state.recoveryKeyValid) return;
      this.setState({
        loading: true,
        restoreError: null,
        restoreType: RestoreType.RecoveryKey
      });

      try {
        const recoverInfo = await _MatrixClientPeg.MatrixClientPeg.get().restoreKeyBackupWithRecoveryKey(this.state.recoveryKey, undefined, undefined, this.state.backupInfo, {
          progressCallback: this.progressCallback
        });

        if (this.props.keyCallback) {
          const key = _MatrixClientPeg.MatrixClientPeg.get().keyBackupKeyFromRecoveryKey(this.state.recoveryKey);

          this.props.keyCallback(key);
        }

        if (!this.props.showSummary) {
          this.props.onFinished(true);
          return;
        }

        this.setState({
          loading: false,
          recoverInfo
        });
      } catch (e) {
        _logger.logger.log("Error restoring backup", e);

        this.setState({
          loading: false,
          restoreError: e
        });
      }
    });
    (0, _defineProperty2.default)(this, "onPassPhraseChange", e => {
      this.setState({
        passPhrase: e.target.value
      });
    });
    this.state = {
      backupInfo: null,
      backupKeyStored: null,
      loading: false,
      loadError: null,
      restoreError: null,
      recoveryKey: "",
      recoverInfo: null,
      recoveryKeyValid: false,
      forceRecoveryKey: false,
      passPhrase: '',
      restoreType: null,
      progress: {
        stage: ProgressState.PreFetch
      }
    };
  }

  componentDidMount() {
    this.loadBackupStatus();
  }

  async restoreWithSecretStorage() {
    this.setState({
      loading: true,
      restoreError: null,
      restoreType: RestoreType.SecretStorage
    });

    try {
      // `accessSecretStorage` may prompt for storage access as needed.
      await (0, _SecurityManager.accessSecretStorage)(async () => {
        await _MatrixClientPeg.MatrixClientPeg.get().restoreKeyBackupWithSecretStorage(this.state.backupInfo, undefined, undefined, {
          progressCallback: this.progressCallback
        });
      });
      this.setState({
        loading: false
      });
    } catch (e) {
      _logger.logger.log("Error restoring backup", e);

      this.setState({
        restoreError: e,
        loading: false
      });
    }
  }

  async restoreWithCachedKey(backupInfo) {
    if (!backupInfo) return false;

    try {
      const recoverInfo = await _MatrixClientPeg.MatrixClientPeg.get().restoreKeyBackupWithCache(undefined,
      /* targetRoomId */
      undefined,
      /* targetSessionId */
      backupInfo, {
        progressCallback: this.progressCallback
      });
      this.setState({
        recoverInfo
      });
      return true;
    } catch (e) {
      _logger.logger.log("restoreWithCachedKey failed:", e);

      return false;
    }
  }

  async loadBackupStatus() {
    this.setState({
      loading: true,
      loadError: null
    });

    try {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const backupInfo = await cli.getKeyBackupVersion();
      const has4S = await cli.hasSecretStorageKey();
      const backupKeyStored = has4S && (await cli.isKeyBackupKeyStored());
      this.setState({
        backupInfo,
        backupKeyStored
      });
      const gotCache = await this.restoreWithCachedKey(backupInfo);

      if (gotCache) {
        _logger.logger.log("RestoreKeyBackupDialog: found cached backup key");

        this.setState({
          loading: false
        });
        return;
      } // If the backup key is stored, we can proceed directly to restore.


      if (backupKeyStored) {
        return this.restoreWithSecretStorage();
      }

      this.setState({
        loadError: null,
        loading: false
      });
    } catch (e) {
      _logger.logger.log("Error loading backup status", e);

      this.setState({
        loadError: e,
        loading: false
      });
    }
  }

  render() {
    const backupHasPassphrase = this.state.backupInfo && this.state.backupInfo.auth_data && this.state.backupInfo.auth_data.private_key_salt && this.state.backupInfo.auth_data.private_key_iterations;
    let content;
    let title;

    if (this.state.loading) {
      title = (0, _languageHandler._t)("Restoring keys from backup");
      let details;

      if (this.state.progress.stage === ProgressState.Fetch) {
        details = (0, _languageHandler._t)("Fetching keys from server...");
      } else if (this.state.progress.stage === ProgressState.LoadKeys) {
        const {
          total,
          successes,
          failures
        } = this.state.progress;
        details = (0, _languageHandler._t)("%(completed)s of %(total)s keys restored", {
          total,
          completed: successes + failures
        });
      } else if (this.state.progress.stage === ProgressState.PreFetch) {
        details = (0, _languageHandler._t)("Fetching keys from server...");
      }

      content = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null, details), /*#__PURE__*/_react.default.createElement(_Spinner.default, null));
    } else if (this.state.loadError) {
      title = (0, _languageHandler._t)("Error");
      content = (0, _languageHandler._t)("Unable to load backup status");
    } else if (this.state.restoreError) {
      if (this.state.restoreError.errcode === _client.MatrixClient.RESTORE_BACKUP_ERROR_BAD_KEY) {
        if (this.state.restoreType === RestoreType.RecoveryKey) {
          title = (0, _languageHandler._t)("Security Key mismatch");
          content = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Backup could not be decrypted with this Security Key: " + "please verify that you entered the correct Security Key.")));
        } else {
          title = (0, _languageHandler._t)("Incorrect Security Phrase");
          content = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Backup could not be decrypted with this Security Phrase: " + "please verify that you entered the correct Security Phrase.")));
        }
      } else {
        title = (0, _languageHandler._t)("Error");
        content = (0, _languageHandler._t)("Unable to restore backup");
      }
    } else if (this.state.backupInfo === null) {
      title = (0, _languageHandler._t)("Error");
      content = (0, _languageHandler._t)("No backup found!");
    } else if (this.state.recoverInfo) {
      title = (0, _languageHandler._t)("Keys restored");
      let failedToDecrypt;

      if (this.state.recoverInfo.total > this.state.recoverInfo.imported) {
        failedToDecrypt = /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Failed to decrypt %(failedCount)s sessions!", {
          failedCount: this.state.recoverInfo.total - this.state.recoverInfo.imported
        }));
      }

      content = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Successfully restored %(sessionCount)s keys", {
        sessionCount: this.state.recoverInfo.imported
      })), failedToDecrypt, /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
        primaryButton: (0, _languageHandler._t)('OK'),
        onPrimaryButtonClick: this.onDone,
        hasCancel: false,
        focus: true
      }));
    } else if (backupHasPassphrase && !this.state.forceRecoveryKey) {
      title = (0, _languageHandler._t)("Enter Security Phrase");
      content = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("<b>Warning</b>: you should only set up key backup " + "from a trusted computer.", {}, {
        b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
      })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Access your secure message history and set up secure " + "messaging by entering your Security Phrase.")), /*#__PURE__*/_react.default.createElement("form", {
        className: "mx_RestoreKeyBackupDialog_primaryContainer"
      }, /*#__PURE__*/_react.default.createElement("input", {
        type: "password",
        className: "mx_RestoreKeyBackupDialog_passPhraseInput",
        onChange: this.onPassPhraseChange,
        value: this.state.passPhrase,
        autoFocus: true
      }), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
        primaryButton: (0, _languageHandler._t)('Next'),
        onPrimaryButtonClick: this.onPassPhraseNext,
        primaryIsSubmit: true,
        hasCancel: true,
        onCancel: this.onCancel,
        focus: false
      })), (0, _languageHandler._t)("If you've forgotten your Security Phrase you can " + "<button1>use your Security Key</button1> or " + "<button2>set up new recovery options</button2>", {}, {
        button1: s => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          kind: "link_inline",
          onClick: this.onUseRecoveryKeyClick
        }, s),
        button2: s => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          kind: "link_inline",
          onClick: this.onResetRecoveryClick
        }, s)
      }));
    } else {
      title = (0, _languageHandler._t)("Enter Security Key");
      let keyStatus;

      if (this.state.recoveryKey.length === 0) {
        keyStatus = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_RestoreKeyBackupDialog_keyStatus"
        });
      } else if (this.state.recoveryKeyValid) {
        keyStatus = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_RestoreKeyBackupDialog_keyStatus"
        }, "\uD83D\uDC4D ", (0, _languageHandler._t)("This looks like a valid Security Key!"));
      } else {
        keyStatus = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_RestoreKeyBackupDialog_keyStatus"
        }, "\uD83D\uDC4E ", (0, _languageHandler._t)("Not a valid Security Key"));
      }

      content = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("<b>Warning</b>: You should only set up key backup " + "from a trusted computer.", {}, {
        b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
      })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Access your secure message history and set up secure " + "messaging by entering your Security Key.")), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_RestoreKeyBackupDialog_primaryContainer"
      }, /*#__PURE__*/_react.default.createElement("input", {
        className: "mx_RestoreKeyBackupDialog_recoveryKeyInput",
        onChange: this.onRecoveryKeyChange,
        value: this.state.recoveryKey,
        autoFocus: true
      }), keyStatus, /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
        primaryButton: (0, _languageHandler._t)('Next'),
        onPrimaryButtonClick: this.onRecoveryKeyNext,
        hasCancel: true,
        onCancel: this.onCancel,
        focus: false,
        primaryDisabled: !this.state.recoveryKeyValid
      })), (0, _languageHandler._t)("If you've forgotten your Security Key you can " + "<button>set up new recovery options</button>", {}, {
        button: s => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          kind: "link_inline",
          onClick: this.onResetRecoveryClick
        }, s)
      }));
    }

    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_RestoreKeyBackupDialog",
      onFinished: this.props.onFinished,
      title: title
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RestoreKeyBackupDialog_content"
    }, content));
  }

}

exports.default = RestoreKeyBackupDialog;
(0, _defineProperty2.default)(RestoreKeyBackupDialog, "defaultProps", {
  showSummary: true
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZXN0b3JlVHlwZSIsIlByb2dyZXNzU3RhdGUiLCJSZXN0b3JlS2V5QmFja3VwRGlhbG9nIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsIm9uRmluaXNoZWQiLCJzZXRTdGF0ZSIsImZvcmNlUmVjb3ZlcnlLZXkiLCJkYXRhIiwicHJvZ3Jlc3MiLCJhY2Nlc3NTZWNyZXRTdG9yYWdlIiwiZSIsInJlY292ZXJ5S2V5IiwidGFyZ2V0IiwidmFsdWUiLCJyZWNvdmVyeUtleVZhbGlkIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiaXNWYWxpZFJlY292ZXJ5S2V5IiwibG9hZGluZyIsInJlc3RvcmVFcnJvciIsInJlc3RvcmVUeXBlIiwiUGFzc3BocmFzZSIsInJlY292ZXJJbmZvIiwicmVzdG9yZUtleUJhY2t1cFdpdGhQYXNzd29yZCIsInN0YXRlIiwicGFzc1BocmFzZSIsInVuZGVmaW5lZCIsImJhY2t1cEluZm8iLCJwcm9ncmVzc0NhbGxiYWNrIiwia2V5Q2FsbGJhY2siLCJrZXkiLCJrZXlCYWNrdXBLZXlGcm9tUGFzc3dvcmQiLCJzaG93U3VtbWFyeSIsImxvZ2dlciIsImxvZyIsIlJlY292ZXJ5S2V5IiwicmVzdG9yZUtleUJhY2t1cFdpdGhSZWNvdmVyeUtleSIsImtleUJhY2t1cEtleUZyb21SZWNvdmVyeUtleSIsImJhY2t1cEtleVN0b3JlZCIsImxvYWRFcnJvciIsInN0YWdlIiwiUHJlRmV0Y2giLCJjb21wb25lbnREaWRNb3VudCIsImxvYWRCYWNrdXBTdGF0dXMiLCJyZXN0b3JlV2l0aFNlY3JldFN0b3JhZ2UiLCJTZWNyZXRTdG9yYWdlIiwicmVzdG9yZUtleUJhY2t1cFdpdGhTZWNyZXRTdG9yYWdlIiwicmVzdG9yZVdpdGhDYWNoZWRLZXkiLCJyZXN0b3JlS2V5QmFja3VwV2l0aENhY2hlIiwiY2xpIiwiZ2V0S2V5QmFja3VwVmVyc2lvbiIsImhhczRTIiwiaGFzU2VjcmV0U3RvcmFnZUtleSIsImlzS2V5QmFja3VwS2V5U3RvcmVkIiwiZ290Q2FjaGUiLCJyZW5kZXIiLCJiYWNrdXBIYXNQYXNzcGhyYXNlIiwiYXV0aF9kYXRhIiwicHJpdmF0ZV9rZXlfc2FsdCIsInByaXZhdGVfa2V5X2l0ZXJhdGlvbnMiLCJjb250ZW50IiwidGl0bGUiLCJfdCIsImRldGFpbHMiLCJGZXRjaCIsIkxvYWRLZXlzIiwidG90YWwiLCJzdWNjZXNzZXMiLCJmYWlsdXJlcyIsImNvbXBsZXRlZCIsImVycmNvZGUiLCJNYXRyaXhDbGllbnQiLCJSRVNUT1JFX0JBQ0tVUF9FUlJPUl9CQURfS0VZIiwiZmFpbGVkVG9EZWNyeXB0IiwiaW1wb3J0ZWQiLCJmYWlsZWRDb3VudCIsInNlc3Npb25Db3VudCIsIm9uRG9uZSIsImIiLCJzdWIiLCJvblBhc3NQaHJhc2VDaGFuZ2UiLCJvblBhc3NQaHJhc2VOZXh0Iiwib25DYW5jZWwiLCJidXR0b24xIiwicyIsIm9uVXNlUmVjb3ZlcnlLZXlDbGljayIsImJ1dHRvbjIiLCJvblJlc2V0UmVjb3ZlcnlDbGljayIsImtleVN0YXR1cyIsImxlbmd0aCIsIm9uUmVjb3ZlcnlLZXlDaGFuZ2UiLCJvblJlY292ZXJ5S2V5TmV4dCIsImJ1dHRvbiJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3Mvc2VjdXJpdHkvUmVzdG9yZUtleUJhY2t1cERpYWxvZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE4LCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnQgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9jbGllbnQnO1xuaW1wb3J0IHsgSUtleUJhY2t1cEluZm8sIElLZXlCYWNrdXBSZXN0b3JlUmVzdWx0IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NyeXB0by9rZXliYWNrdXBcIjtcbmltcG9ydCB7IElTZWNyZXRTdG9yYWdlS2V5SW5mbyB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jcnlwdG8vYXBpXCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5cbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gJy4uLy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgeyBhY2Nlc3NTZWNyZXRTdG9yYWdlIH0gZnJvbSAnLi4vLi4vLi4vLi4vU2VjdXJpdHlNYW5hZ2VyJztcbmltcG9ydCB7IElEaWFsb2dQcm9wcyB9IGZyb20gXCIuLi9JRGlhbG9nUHJvcHNcIjtcbmltcG9ydCBTcGlubmVyIGZyb20gJy4uLy4uL2VsZW1lbnRzL1NwaW5uZXInO1xuaW1wb3J0IERpYWxvZ0J1dHRvbnMgZnJvbSBcIi4uLy4uL2VsZW1lbnRzL0RpYWxvZ0J1dHRvbnNcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi8uLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgQmFzZURpYWxvZyBmcm9tIFwiLi4vQmFzZURpYWxvZ1wiO1xuXG5lbnVtIFJlc3RvcmVUeXBlIHtcbiAgICBQYXNzcGhyYXNlID0gXCJwYXNzcGhyYXNlXCIsXG4gICAgUmVjb3ZlcnlLZXkgPSBcInJlY292ZXJ5X2tleVwiLFxuICAgIFNlY3JldFN0b3JhZ2UgPSBcInNlY3JldF9zdG9yYWdlXCJcbn1cblxuZW51bSBQcm9ncmVzc1N0YXRlIHtcbiAgICBQcmVGZXRjaCA9IFwicHJlZmV0Y2hcIixcbiAgICBGZXRjaCA9IFwiZmV0Y2hcIixcbiAgICBMb2FkS2V5cyA9IFwibG9hZF9rZXlzXCIsXG5cbn1cblxuaW50ZXJmYWNlIElQcm9wcyBleHRlbmRzIElEaWFsb2dQcm9wcyB7XG4gICAgLy8gaWYgZmFsc2UsIHdpbGwgY2xvc2UgdGhlIGRpYWxvZyBhcyBzb29uIGFzIHRoZSByZXN0b3JlIGNvbXBsZXRlcyBzdWNjZXNzZnVsbHlcbiAgICAvLyBkZWZhdWx0OiB0cnVlXG4gICAgc2hvd1N1bW1hcnk/OiBib29sZWFuO1xuICAgIC8vIElmIHNwZWNpZmllZCwgZ2F0aGVyIHRoZSBrZXkgZnJvbSB0aGUgdXNlciBidXQgdGhlbiBjYWxsIHRoZSBmdW5jdGlvbiB3aXRoIHRoZSBiYWNrdXBcbiAgICAvLyBrZXkgcmF0aGVyIHRoYW4gYWN0dWFsbHkgKG5lY2Vzc2FyaWx5KSByZXN0b3JpbmcgdGhlIGJhY2t1cC5cbiAgICBrZXlDYWxsYmFjaz86IChrZXk6IFVpbnQ4QXJyYXkpID0+IHZvaWQ7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGJhY2t1cEluZm86IElLZXlCYWNrdXBJbmZvO1xuICAgIGJhY2t1cEtleVN0b3JlZDogUmVjb3JkPHN0cmluZywgSVNlY3JldFN0b3JhZ2VLZXlJbmZvPjtcbiAgICBsb2FkaW5nOiBib29sZWFuO1xuICAgIGxvYWRFcnJvcjogc3RyaW5nO1xuICAgIHJlc3RvcmVFcnJvcjoge1xuICAgICAgICBlcnJjb2RlOiBzdHJpbmc7XG4gICAgfTtcbiAgICByZWNvdmVyeUtleTogc3RyaW5nO1xuICAgIHJlY292ZXJJbmZvOiBJS2V5QmFja3VwUmVzdG9yZVJlc3VsdDtcbiAgICByZWNvdmVyeUtleVZhbGlkOiBib29sZWFuO1xuICAgIGZvcmNlUmVjb3ZlcnlLZXk6IGJvb2xlYW47XG4gICAgcGFzc1BocmFzZTogc3RyaW5nO1xuICAgIHJlc3RvcmVUeXBlOiBSZXN0b3JlVHlwZTtcbiAgICBwcm9ncmVzczoge1xuICAgICAgICBzdGFnZTogUHJvZ3Jlc3NTdGF0ZTtcbiAgICAgICAgdG90YWw/OiBudW1iZXI7XG4gICAgICAgIHN1Y2Nlc3Nlcz86IG51bWJlcjtcbiAgICAgICAgZmFpbHVyZXM/OiBudW1iZXI7XG4gICAgfTtcbn1cblxuLypcbiAqIERpYWxvZyBmb3IgcmVzdG9yaW5nIGUyZSBrZXlzIGZyb20gYSBiYWNrdXAgYW5kIHRoZSB1c2VyJ3MgcmVjb3Zlcnkga2V5XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc3RvcmVLZXlCYWNrdXBEaWFsb2cgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgc2hvd1N1bW1hcnk6IHRydWUsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGJhY2t1cEluZm86IG51bGwsXG4gICAgICAgICAgICBiYWNrdXBLZXlTdG9yZWQ6IG51bGwsXG4gICAgICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIGxvYWRFcnJvcjogbnVsbCxcbiAgICAgICAgICAgIHJlc3RvcmVFcnJvcjogbnVsbCxcbiAgICAgICAgICAgIHJlY292ZXJ5S2V5OiBcIlwiLFxuICAgICAgICAgICAgcmVjb3ZlckluZm86IG51bGwsXG4gICAgICAgICAgICByZWNvdmVyeUtleVZhbGlkOiBmYWxzZSxcbiAgICAgICAgICAgIGZvcmNlUmVjb3ZlcnlLZXk6IGZhbHNlLFxuICAgICAgICAgICAgcGFzc1BocmFzZTogJycsXG4gICAgICAgICAgICByZXN0b3JlVHlwZTogbnVsbCxcbiAgICAgICAgICAgIHByb2dyZXNzOiB7IHN0YWdlOiBQcm9ncmVzc1N0YXRlLlByZUZldGNoIH0sXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgICAgICB0aGlzLmxvYWRCYWNrdXBTdGF0dXMoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQ2FuY2VsID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoZmFsc2UpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRG9uZSA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKHRydWUpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVXNlUmVjb3ZlcnlLZXlDbGljayA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBmb3JjZVJlY292ZXJ5S2V5OiB0cnVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBwcm9ncmVzc0NhbGxiYWNrID0gKGRhdGEpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwcm9ncmVzczogZGF0YSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SZXNldFJlY292ZXJ5Q2xpY2sgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChmYWxzZSk7XG4gICAgICAgIGFjY2Vzc1NlY3JldFN0b3JhZ2UoYXN5bmMgKCkgPT4ge30sIC8qIGZvcmNlUmVzZXQgPSAqLyB0cnVlKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJlY292ZXJ5S2V5Q2hhbmdlID0gKGUpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICByZWNvdmVyeUtleTogZS50YXJnZXQudmFsdWUsXG4gICAgICAgICAgICByZWNvdmVyeUtleVZhbGlkOiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuaXNWYWxpZFJlY292ZXJ5S2V5KGUudGFyZ2V0LnZhbHVlKSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25QYXNzUGhyYXNlTmV4dCA9IGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBsb2FkaW5nOiB0cnVlLFxuICAgICAgICAgICAgcmVzdG9yZUVycm9yOiBudWxsLFxuICAgICAgICAgICAgcmVzdG9yZVR5cGU6IFJlc3RvcmVUeXBlLlBhc3NwaHJhc2UsXG4gICAgICAgIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2UgZG8gc3RpbGwgcmVzdG9yZSB0aGUga2V5IGJhY2t1cDogd2UgbXVzdCBlbnN1cmUgdGhhdCB0aGUga2V5IGJhY2t1cCBrZXlcbiAgICAgICAgICAgIC8vIGlzIHRoZSByaWdodCBvbmUgYW5kIHJlc3RvcmluZyBpdCBpcyBjdXJyZW50bHkgdGhlIG9ubHkgd2F5IHdlIGNhbiBkbyB0aGlzLlxuICAgICAgICAgICAgY29uc3QgcmVjb3ZlckluZm8gPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkucmVzdG9yZUtleUJhY2t1cFdpdGhQYXNzd29yZChcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLnBhc3NQaHJhc2UsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB0aGlzLnN0YXRlLmJhY2t1cEluZm8sXG4gICAgICAgICAgICAgICAgeyBwcm9ncmVzc0NhbGxiYWNrOiB0aGlzLnByb2dyZXNzQ2FsbGJhY2sgfSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5rZXlDYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5rZXlCYWNrdXBLZXlGcm9tUGFzc3dvcmQoXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUucGFzc1BocmFzZSwgdGhpcy5zdGF0ZS5iYWNrdXBJbmZvLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5rZXlDYWxsYmFjayhrZXkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXRoaXMucHJvcHMuc2hvd1N1bW1hcnkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQodHJ1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgcmVjb3ZlckluZm8sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgbG9nZ2VyLmxvZyhcIkVycm9yIHJlc3RvcmluZyBiYWNrdXBcIiwgZSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICByZXN0b3JlRXJyb3I6IGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUmVjb3ZlcnlLZXlOZXh0ID0gYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUucmVjb3ZlcnlLZXlWYWxpZCkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbG9hZGluZzogdHJ1ZSxcbiAgICAgICAgICAgIHJlc3RvcmVFcnJvcjogbnVsbCxcbiAgICAgICAgICAgIHJlc3RvcmVUeXBlOiBSZXN0b3JlVHlwZS5SZWNvdmVyeUtleSxcbiAgICAgICAgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZWNvdmVySW5mbyA9IGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5yZXN0b3JlS2V5QmFja3VwV2l0aFJlY292ZXJ5S2V5KFxuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUucmVjb3ZlcnlLZXksIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB0aGlzLnN0YXRlLmJhY2t1cEluZm8sXG4gICAgICAgICAgICAgICAgeyBwcm9ncmVzc0NhbGxiYWNrOiB0aGlzLnByb2dyZXNzQ2FsbGJhY2sgfSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5rZXlDYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGtleSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5rZXlCYWNrdXBLZXlGcm9tUmVjb3ZlcnlLZXkodGhpcy5zdGF0ZS5yZWNvdmVyeUtleSk7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5rZXlDYWxsYmFjayhrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF0aGlzLnByb3BzLnNob3dTdW1tYXJ5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKHRydWUpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHJlY292ZXJJbmZvLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGxvZ2dlci5sb2coXCJFcnJvciByZXN0b3JpbmcgYmFja3VwXCIsIGUpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgcmVzdG9yZUVycm9yOiBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblBhc3NQaHJhc2VDaGFuZ2UgPSAoZSk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHBhc3NQaHJhc2U6IGUudGFyZ2V0LnZhbHVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBhc3luYyByZXN0b3JlV2l0aFNlY3JldFN0b3JhZ2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbG9hZGluZzogdHJ1ZSxcbiAgICAgICAgICAgIHJlc3RvcmVFcnJvcjogbnVsbCxcbiAgICAgICAgICAgIHJlc3RvcmVUeXBlOiBSZXN0b3JlVHlwZS5TZWNyZXRTdG9yYWdlLFxuICAgICAgICB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIGBhY2Nlc3NTZWNyZXRTdG9yYWdlYCBtYXkgcHJvbXB0IGZvciBzdG9yYWdlIGFjY2VzcyBhcyBuZWVkZWQuXG4gICAgICAgICAgICBhd2FpdCBhY2Nlc3NTZWNyZXRTdG9yYWdlKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkucmVzdG9yZUtleUJhY2t1cFdpdGhTZWNyZXRTdG9yYWdlKFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLmJhY2t1cEluZm8sIHVuZGVmaW5lZCwgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICB7IHByb2dyZXNzQ2FsbGJhY2s6IHRoaXMucHJvZ3Jlc3NDYWxsYmFjayB9LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGxvZ2dlci5sb2coXCJFcnJvciByZXN0b3JpbmcgYmFja3VwXCIsIGUpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgcmVzdG9yZUVycm9yOiBlLFxuICAgICAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHJlc3RvcmVXaXRoQ2FjaGVkS2V5KGJhY2t1cEluZm8pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgaWYgKCFiYWNrdXBJbmZvKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCByZWNvdmVySW5mbyA9IGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5yZXN0b3JlS2V5QmFja3VwV2l0aENhY2hlKFxuICAgICAgICAgICAgICAgIHVuZGVmaW5lZCwgLyogdGFyZ2V0Um9vbUlkICovXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkLCAvKiB0YXJnZXRTZXNzaW9uSWQgKi9cbiAgICAgICAgICAgICAgICBiYWNrdXBJbmZvLFxuICAgICAgICAgICAgICAgIHsgcHJvZ3Jlc3NDYWxsYmFjazogdGhpcy5wcm9ncmVzc0NhbGxiYWNrIH0sXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgcmVjb3ZlckluZm8sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBsb2dnZXIubG9nKFwicmVzdG9yZVdpdGhDYWNoZWRLZXkgZmFpbGVkOlwiLCBlKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgbG9hZEJhY2t1cFN0YXR1cygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBsb2FkaW5nOiB0cnVlLFxuICAgICAgICAgICAgbG9hZEVycm9yOiBudWxsLFxuICAgICAgICB9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgICAgIGNvbnN0IGJhY2t1cEluZm8gPSBhd2FpdCBjbGkuZ2V0S2V5QmFja3VwVmVyc2lvbigpO1xuICAgICAgICAgICAgY29uc3QgaGFzNFMgPSBhd2FpdCBjbGkuaGFzU2VjcmV0U3RvcmFnZUtleSgpO1xuICAgICAgICAgICAgY29uc3QgYmFja3VwS2V5U3RvcmVkID0gaGFzNFMgJiYgKGF3YWl0IGNsaS5pc0tleUJhY2t1cEtleVN0b3JlZCgpKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGJhY2t1cEluZm8sXG4gICAgICAgICAgICAgICAgYmFja3VwS2V5U3RvcmVkLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGdvdENhY2hlID0gYXdhaXQgdGhpcy5yZXN0b3JlV2l0aENhY2hlZEtleShiYWNrdXBJbmZvKTtcbiAgICAgICAgICAgIGlmIChnb3RDYWNoZSkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5sb2coXCJSZXN0b3JlS2V5QmFja3VwRGlhbG9nOiBmb3VuZCBjYWNoZWQgYmFja3VwIGtleVwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJZiB0aGUgYmFja3VwIGtleSBpcyBzdG9yZWQsIHdlIGNhbiBwcm9jZWVkIGRpcmVjdGx5IHRvIHJlc3RvcmUuXG4gICAgICAgICAgICBpZiAoYmFja3VwS2V5U3RvcmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVzdG9yZVdpdGhTZWNyZXRTdG9yYWdlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGxvYWRFcnJvcjogbnVsbCxcbiAgICAgICAgICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBsb2dnZXIubG9nKFwiRXJyb3IgbG9hZGluZyBiYWNrdXAgc3RhdHVzXCIsIGUpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgbG9hZEVycm9yOiBlLFxuICAgICAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgcmVuZGVyKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgY29uc3QgYmFja3VwSGFzUGFzc3BocmFzZSA9IChcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuYmFja3VwSW5mbyAmJlxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5iYWNrdXBJbmZvLmF1dGhfZGF0YSAmJlxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5iYWNrdXBJbmZvLmF1dGhfZGF0YS5wcml2YXRlX2tleV9zYWx0ICYmXG4gICAgICAgICAgICB0aGlzLnN0YXRlLmJhY2t1cEluZm8uYXV0aF9kYXRhLnByaXZhdGVfa2V5X2l0ZXJhdGlvbnNcbiAgICAgICAgKTtcblxuICAgICAgICBsZXQgY29udGVudDtcbiAgICAgICAgbGV0IHRpdGxlO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5sb2FkaW5nKSB7XG4gICAgICAgICAgICB0aXRsZSA9IF90KFwiUmVzdG9yaW5nIGtleXMgZnJvbSBiYWNrdXBcIik7XG4gICAgICAgICAgICBsZXQgZGV0YWlscztcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnByb2dyZXNzLnN0YWdlID09PSBQcm9ncmVzc1N0YXRlLkZldGNoKSB7XG4gICAgICAgICAgICAgICAgZGV0YWlscyA9IF90KFwiRmV0Y2hpbmcga2V5cyBmcm9tIHNlcnZlci4uLlwiKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5wcm9ncmVzcy5zdGFnZSA9PT0gUHJvZ3Jlc3NTdGF0ZS5Mb2FkS2V5cykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgdG90YWwsIHN1Y2Nlc3NlcywgZmFpbHVyZXMgfSA9IHRoaXMuc3RhdGUucHJvZ3Jlc3M7XG4gICAgICAgICAgICAgICAgZGV0YWlscyA9IF90KFwiJShjb21wbGV0ZWQpcyBvZiAlKHRvdGFsKXMga2V5cyByZXN0b3JlZFwiLCB7IHRvdGFsLCBjb21wbGV0ZWQ6IHN1Y2Nlc3NlcyArIGZhaWx1cmVzIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnByb2dyZXNzLnN0YWdlID09PSBQcm9ncmVzc1N0YXRlLlByZUZldGNoKSB7XG4gICAgICAgICAgICAgICAgZGV0YWlscyA9IF90KFwiRmV0Y2hpbmcga2V5cyBmcm9tIHNlcnZlci4uLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnRlbnQgPSA8ZGl2PlxuICAgICAgICAgICAgICAgIDxkaXY+eyBkZXRhaWxzIH08L2Rpdj5cbiAgICAgICAgICAgICAgICA8U3Bpbm5lciAvPlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUubG9hZEVycm9yKSB7XG4gICAgICAgICAgICB0aXRsZSA9IF90KFwiRXJyb3JcIik7XG4gICAgICAgICAgICBjb250ZW50ID0gX3QoXCJVbmFibGUgdG8gbG9hZCBiYWNrdXAgc3RhdHVzXCIpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUucmVzdG9yZUVycm9yKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5yZXN0b3JlRXJyb3IuZXJyY29kZSA9PT0gTWF0cml4Q2xpZW50LlJFU1RPUkVfQkFDS1VQX0VSUk9SX0JBRF9LRVkpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5yZXN0b3JlVHlwZSA9PT0gUmVzdG9yZVR5cGUuUmVjb3ZlcnlLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGUgPSBfdChcIlNlY3VyaXR5IEtleSBtaXNtYXRjaFwiKTtcbiAgICAgICAgICAgICAgICAgICAgY29udGVudCA9IDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cD57IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQmFja3VwIGNvdWxkIG5vdCBiZSBkZWNyeXB0ZWQgd2l0aCB0aGlzIFNlY3VyaXR5IEtleTogXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGxlYXNlIHZlcmlmeSB0aGF0IHlvdSBlbnRlcmVkIHRoZSBjb3JyZWN0IFNlY3VyaXR5IEtleS5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICkgfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlID0gX3QoXCJJbmNvcnJlY3QgU2VjdXJpdHkgUGhyYXNlXCIpO1xuICAgICAgICAgICAgICAgICAgICBjb250ZW50ID0gPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPnsgX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJCYWNrdXAgY291bGQgbm90IGJlIGRlY3J5cHRlZCB3aXRoIHRoaXMgU2VjdXJpdHkgUGhyYXNlOiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwbGVhc2UgdmVyaWZ5IHRoYXQgeW91IGVudGVyZWQgdGhlIGNvcnJlY3QgU2VjdXJpdHkgUGhyYXNlLlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgKSB9PC9wPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aXRsZSA9IF90KFwiRXJyb3JcIik7XG4gICAgICAgICAgICAgICAgY29udGVudCA9IF90KFwiVW5hYmxlIHRvIHJlc3RvcmUgYmFja3VwXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuYmFja3VwSW5mbyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGl0bGUgPSBfdChcIkVycm9yXCIpO1xuICAgICAgICAgICAgY29udGVudCA9IF90KFwiTm8gYmFja3VwIGZvdW5kIVwiKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLnJlY292ZXJJbmZvKSB7XG4gICAgICAgICAgICB0aXRsZSA9IF90KFwiS2V5cyByZXN0b3JlZFwiKTtcbiAgICAgICAgICAgIGxldCBmYWlsZWRUb0RlY3J5cHQ7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5yZWNvdmVySW5mby50b3RhbCA+IHRoaXMuc3RhdGUucmVjb3ZlckluZm8uaW1wb3J0ZWQpIHtcbiAgICAgICAgICAgICAgICBmYWlsZWRUb0RlY3J5cHQgPSA8cD57IF90KFxuICAgICAgICAgICAgICAgICAgICBcIkZhaWxlZCB0byBkZWNyeXB0ICUoZmFpbGVkQ291bnQpcyBzZXNzaW9ucyFcIixcbiAgICAgICAgICAgICAgICAgICAgeyBmYWlsZWRDb3VudDogdGhpcy5zdGF0ZS5yZWNvdmVySW5mby50b3RhbCAtIHRoaXMuc3RhdGUucmVjb3ZlckluZm8uaW1wb3J0ZWQgfSxcbiAgICAgICAgICAgICAgICApIH08L3A+O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29udGVudCA9IDxkaXY+XG4gICAgICAgICAgICAgICAgPHA+eyBfdChcIlN1Y2Nlc3NmdWxseSByZXN0b3JlZCAlKHNlc3Npb25Db3VudClzIGtleXNcIiwgeyBzZXNzaW9uQ291bnQ6IHRoaXMuc3RhdGUucmVjb3ZlckluZm8uaW1wb3J0ZWQgfSkgfTwvcD5cbiAgICAgICAgICAgICAgICB7IGZhaWxlZFRvRGVjcnlwdCB9XG4gICAgICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnMgcHJpbWFyeUJ1dHRvbj17X3QoJ09LJyl9XG4gICAgICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLm9uRG9uZX1cbiAgICAgICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgZm9jdXM9e3RydWV9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfSBlbHNlIGlmIChiYWNrdXBIYXNQYXNzcGhyYXNlICYmICF0aGlzLnN0YXRlLmZvcmNlUmVjb3ZlcnlLZXkpIHtcbiAgICAgICAgICAgIHRpdGxlID0gX3QoXCJFbnRlciBTZWN1cml0eSBQaHJhc2VcIik7XG4gICAgICAgICAgICBjb250ZW50ID0gPGRpdj5cbiAgICAgICAgICAgICAgICA8cD57IF90KFxuICAgICAgICAgICAgICAgICAgICBcIjxiPldhcm5pbmc8L2I+OiB5b3Ugc2hvdWxkIG9ubHkgc2V0IHVwIGtleSBiYWNrdXAgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcImZyb20gYSB0cnVzdGVkIGNvbXB1dGVyLlwiLCB7fSxcbiAgICAgICAgICAgICAgICAgICAgeyBiOiBzdWIgPT4gPGI+eyBzdWIgfTwvYj4gfSxcbiAgICAgICAgICAgICAgICApIH08L3A+XG4gICAgICAgICAgICAgICAgPHA+eyBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJBY2Nlc3MgeW91ciBzZWN1cmUgbWVzc2FnZSBoaXN0b3J5IGFuZCBzZXQgdXAgc2VjdXJlIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJtZXNzYWdpbmcgYnkgZW50ZXJpbmcgeW91ciBTZWN1cml0eSBQaHJhc2UuXCIsXG4gICAgICAgICAgICAgICAgKSB9PC9wPlxuXG4gICAgICAgICAgICAgICAgPGZvcm0gY2xhc3NOYW1lPVwibXhfUmVzdG9yZUtleUJhY2t1cERpYWxvZ19wcmltYXJ5Q29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicGFzc3dvcmRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUmVzdG9yZUtleUJhY2t1cERpYWxvZ19wYXNzUGhyYXNlSW5wdXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25QYXNzUGhyYXNlQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUucGFzc1BocmFzZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Gb2N1cz17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnlCdXR0b249e190KCdOZXh0Jyl9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5vblBhc3NQaHJhc2VOZXh0fVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUlzU3VibWl0PXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DYW5jZWw9e3RoaXMub25DYW5jZWx9XG4gICAgICAgICAgICAgICAgICAgICAgICBmb2N1cz17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgICAgIHsgX3QoXG4gICAgICAgICAgICAgICAgICAgIFwiSWYgeW91J3ZlIGZvcmdvdHRlbiB5b3VyIFNlY3VyaXR5IFBocmFzZSB5b3UgY2FuIFwiK1xuICAgICAgICAgICAgICAgICAgICBcIjxidXR0b24xPnVzZSB5b3VyIFNlY3VyaXR5IEtleTwvYnV0dG9uMT4gb3IgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcIjxidXR0b24yPnNldCB1cCBuZXcgcmVjb3Zlcnkgb3B0aW9uczwvYnV0dG9uMj5cIixcbiAgICAgICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1dHRvbjE6IHMgPT4gPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBraW5kPVwibGlua19pbmxpbmVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25Vc2VSZWNvdmVyeUtleUNsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgcyB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgICAgICAgICAgICAgYnV0dG9uMjogcyA9PiA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJsaW5rX2lubGluZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblJlc2V0UmVjb3ZlcnlDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHMgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPixcbiAgICAgICAgICAgICAgICAgICAgfSkgfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGl0bGUgPSBfdChcIkVudGVyIFNlY3VyaXR5IEtleVwiKTtcblxuICAgICAgICAgICAgbGV0IGtleVN0YXR1cztcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnJlY292ZXJ5S2V5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGtleVN0YXR1cyA9IDxkaXYgY2xhc3NOYW1lPVwibXhfUmVzdG9yZUtleUJhY2t1cERpYWxvZ19rZXlTdGF0dXNcIiAvPjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5yZWNvdmVyeUtleVZhbGlkKSB7XG4gICAgICAgICAgICAgICAga2V5U3RhdHVzID0gPGRpdiBjbGFzc05hbWU9XCJteF9SZXN0b3JlS2V5QmFja3VwRGlhbG9nX2tleVN0YXR1c1wiPlxuICAgICAgICAgICAgICAgICAgICB7IFwiXFx1RDgzRFxcdURDNEQgXCIgfXsgX3QoXCJUaGlzIGxvb2tzIGxpa2UgYSB2YWxpZCBTZWN1cml0eSBLZXkhXCIpIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGtleVN0YXR1cyA9IDxkaXYgY2xhc3NOYW1lPVwibXhfUmVzdG9yZUtleUJhY2t1cERpYWxvZ19rZXlTdGF0dXNcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBcIlxcdUQ4M0RcXHVEQzRFIFwiIH17IF90KFwiTm90IGEgdmFsaWQgU2VjdXJpdHkgS2V5XCIpIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnRlbnQgPSA8ZGl2PlxuICAgICAgICAgICAgICAgIDxwPnsgX3QoXG4gICAgICAgICAgICAgICAgICAgIFwiPGI+V2FybmluZzwvYj46IFlvdSBzaG91bGQgb25seSBzZXQgdXAga2V5IGJhY2t1cCBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiZnJvbSBhIHRydXN0ZWQgY29tcHV0ZXIuXCIsIHt9LFxuICAgICAgICAgICAgICAgICAgICB7IGI6IHN1YiA9PiA8Yj57IHN1YiB9PC9iPiB9LFxuICAgICAgICAgICAgICAgICkgfTwvcD5cbiAgICAgICAgICAgICAgICA8cD57IF90KFxuICAgICAgICAgICAgICAgICAgICBcIkFjY2VzcyB5b3VyIHNlY3VyZSBtZXNzYWdlIGhpc3RvcnkgYW5kIHNldCB1cCBzZWN1cmUgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcIm1lc3NhZ2luZyBieSBlbnRlcmluZyB5b3VyIFNlY3VyaXR5IEtleS5cIixcbiAgICAgICAgICAgICAgICApIH08L3A+XG5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jlc3RvcmVLZXlCYWNrdXBEaWFsb2dfcHJpbWFyeUNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgICAgICA8aW5wdXQgY2xhc3NOYW1lPVwibXhfUmVzdG9yZUtleUJhY2t1cERpYWxvZ19yZWNvdmVyeUtleUlucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uUmVjb3ZlcnlLZXlDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5yZWNvdmVyeUtleX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Gb2N1cz17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgeyBrZXlTdGF0dXMgfVxuICAgICAgICAgICAgICAgICAgICA8RGlhbG9nQnV0dG9ucyBwcmltYXJ5QnV0dG9uPXtfdCgnTmV4dCcpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMub25SZWNvdmVyeUtleU5leHR9XG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5vbkNhbmNlbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvY3VzPXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnlEaXNhYmxlZD17IXRoaXMuc3RhdGUucmVjb3ZlcnlLZXlWYWxpZH1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICB7IF90KFxuICAgICAgICAgICAgICAgICAgICBcIklmIHlvdSd2ZSBmb3Jnb3R0ZW4geW91ciBTZWN1cml0eSBLZXkgeW91IGNhbiBcIitcbiAgICAgICAgICAgICAgICAgICAgXCI8YnV0dG9uPnNldCB1cCBuZXcgcmVjb3Zlcnkgb3B0aW9uczwvYnV0dG9uPlwiLFxuICAgICAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnV0dG9uOiBzID0+IDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2luZD1cImxpbmtfaW5saW5lXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uUmVzZXRSZWNvdmVyeUNsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgcyB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICkgfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxCYXNlRGlhbG9nIGNsYXNzTmFtZT0nbXhfUmVzdG9yZUtleUJhY2t1cERpYWxvZydcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9XG4gICAgICAgICAgICAgICAgdGl0bGU9e3RpdGxlfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9SZXN0b3JlS2V5QmFja3VwRGlhbG9nX2NvbnRlbnQnPlxuICAgICAgICAgICAgICAgICAgICB7IGNvbnRlbnQgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9CYXNlRGlhbG9nPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFpQkE7O0FBQ0E7O0FBR0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBaUJLQSxXOztXQUFBQSxXO0VBQUFBLFc7RUFBQUEsVztFQUFBQSxXO0dBQUFBLFcsS0FBQUEsVzs7SUFNQUMsYTs7V0FBQUEsYTtFQUFBQSxhO0VBQUFBLGE7RUFBQUEsYTtHQUFBQSxhLEtBQUFBLGE7O0FBc0NMO0FBQ0E7QUFDQTtBQUNlLE1BQU1DLHNCQUFOLFNBQXFDQyxjQUFBLENBQU1DLGFBQTNDLENBQXlFO0VBS3BGQyxXQUFXLENBQUNDLEtBQUQsRUFBUTtJQUNmLE1BQU1BLEtBQU47SUFEZSxnREFzQkEsTUFBWTtNQUMzQixLQUFLQSxLQUFMLENBQVdDLFVBQVgsQ0FBc0IsS0FBdEI7SUFDSCxDQXhCa0I7SUFBQSw4Q0EwQkYsTUFBWTtNQUN6QixLQUFLRCxLQUFMLENBQVdDLFVBQVgsQ0FBc0IsSUFBdEI7SUFDSCxDQTVCa0I7SUFBQSw2REE4QmEsTUFBWTtNQUN4QyxLQUFLQyxRQUFMLENBQWM7UUFDVkMsZ0JBQWdCLEVB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