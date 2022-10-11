"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _crypto = require("matrix-js-sdk/src/crypto");

var _logger = require("matrix-js-sdk/src/logger");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _languageHandler = require("../../../languageHandler");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _WellKnownUtils = require("../../../utils/WellKnownUtils");

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _QuestionDialog = _interopRequireDefault(require("../dialogs/QuestionDialog"));

var _RestoreKeyBackupDialog = _interopRequireDefault(require("../dialogs/security/RestoreKeyBackupDialog"));

var _SecurityManager = require("../../../SecurityManager");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

class SecureBackupPanel extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "unmounted", false);
    (0, _defineProperty2.default)(this, "onKeyBackupSessionsRemaining", sessionsRemaining => {
      this.setState({
        sessionsRemaining
      });
    });
    (0, _defineProperty2.default)(this, "onKeyBackupStatus", () => {
      // This just loads the current backup status rather than forcing
      // a re-check otherwise we risk causing infinite loops
      this.loadBackupStatus();
    });
    (0, _defineProperty2.default)(this, "startNewBackup", () => {
      _Modal.default.createDialogAsync(Promise.resolve().then(() => _interopRequireWildcard(require('../../../async-components/views/dialogs/security/CreateKeyBackupDialog'))), {
        onFinished: () => {
          this.loadBackupStatus();
        }
      }, null,
      /* priority = */
      false,
      /* static = */
      true);
    });
    (0, _defineProperty2.default)(this, "deleteBackup", () => {
      _Modal.default.createDialog(_QuestionDialog.default, {
        title: (0, _languageHandler._t)('Delete Backup'),
        description: (0, _languageHandler._t)("Are you sure? You will lose your encrypted messages if your " + "keys are not backed up properly."),
        button: (0, _languageHandler._t)('Delete Backup'),
        danger: true,
        onFinished: proceed => {
          if (!proceed) return;
          this.setState({
            loading: true
          });

          _MatrixClientPeg.MatrixClientPeg.get().deleteKeyBackupVersion(this.state.backupInfo.version).then(() => {
            this.loadBackupStatus();
          });
        }
      });
    });
    (0, _defineProperty2.default)(this, "restoreBackup", async () => {
      _Modal.default.createDialog(_RestoreKeyBackupDialog.default, null, null,
      /* priority = */
      false,
      /* static = */
      true);
    });
    (0, _defineProperty2.default)(this, "resetSecretStorage", async () => {
      this.setState({
        error: null
      });

      try {
        await (0, _SecurityManager.accessSecretStorage)(async () => {},
        /* forceReset = */
        true);
      } catch (e) {
        _logger.logger.error("Error resetting secret storage", e);

        if (this.unmounted) return;
        this.setState({
          error: e
        });
      }

      if (this.unmounted) return;
      this.loadBackupStatus();
    });
    this.state = {
      loading: true,
      error: null,
      backupKeyStored: null,
      backupKeyCached: null,
      backupKeyWellFormed: null,
      secretStorageKeyInAccount: null,
      secretStorageReady: null,
      backupInfo: null,
      backupSigStatus: null,
      sessionsRemaining: 0
    };
  }

  componentDidMount() {
    this.checkKeyBackupStatus();

    _MatrixClientPeg.MatrixClientPeg.get().on(_crypto.CryptoEvent.KeyBackupStatus, this.onKeyBackupStatus);

    _MatrixClientPeg.MatrixClientPeg.get().on(_crypto.CryptoEvent.KeyBackupSessionsRemaining, this.onKeyBackupSessionsRemaining);
  }

  componentWillUnmount() {
    this.unmounted = true;

    if (_MatrixClientPeg.MatrixClientPeg.get()) {
      _MatrixClientPeg.MatrixClientPeg.get().removeListener(_crypto.CryptoEvent.KeyBackupStatus, this.onKeyBackupStatus);

      _MatrixClientPeg.MatrixClientPeg.get().removeListener(_crypto.CryptoEvent.KeyBackupSessionsRemaining, this.onKeyBackupSessionsRemaining);
    }
  }

  async checkKeyBackupStatus() {
    this.getUpdatedDiagnostics();

    try {
      const {
        backupInfo,
        trustInfo
      } = await _MatrixClientPeg.MatrixClientPeg.get().checkKeyBackup();
      this.setState({
        loading: false,
        error: null,
        backupInfo,
        backupSigStatus: trustInfo
      });
    } catch (e) {
      _logger.logger.log("Unable to fetch check backup status", e);

      if (this.unmounted) return;
      this.setState({
        loading: false,
        error: e,
        backupInfo: null,
        backupSigStatus: null
      });
    }
  }

  async loadBackupStatus() {
    this.setState({
      loading: true
    });
    this.getUpdatedDiagnostics();

    try {
      const backupInfo = await _MatrixClientPeg.MatrixClientPeg.get().getKeyBackupVersion();
      const backupSigStatus = await _MatrixClientPeg.MatrixClientPeg.get().isKeyBackupTrusted(backupInfo);
      if (this.unmounted) return;
      this.setState({
        loading: false,
        error: null,
        backupInfo,
        backupSigStatus
      });
    } catch (e) {
      _logger.logger.log("Unable to fetch key backup status", e);

      if (this.unmounted) return;
      this.setState({
        loading: false,
        error: e,
        backupInfo: null,
        backupSigStatus: null
      });
    }
  }

  async getUpdatedDiagnostics() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const secretStorage = cli.crypto.secretStorage;
    const backupKeyStored = !!(await cli.isKeyBackupKeyStored());
    const backupKeyFromCache = await cli.crypto.getSessionBackupPrivateKey();
    const backupKeyCached = !!backupKeyFromCache;
    const backupKeyWellFormed = backupKeyFromCache instanceof Uint8Array;
    const secretStorageKeyInAccount = await secretStorage.hasKey();
    const secretStorageReady = await cli.isSecretStorageReady();
    if (this.unmounted) return;
    this.setState({
      backupKeyStored,
      backupKeyCached,
      backupKeyWellFormed,
      secretStorageKeyInAccount,
      secretStorageReady
    });
  }

  render() {
    const {
      loading,
      error,
      backupKeyStored,
      backupKeyCached,
      backupKeyWellFormed,
      secretStorageKeyInAccount,
      secretStorageReady,
      backupInfo,
      backupSigStatus,
      sessionsRemaining
    } = this.state;
    let statusDescription;
    let extraDetailsTableRows;
    let extraDetails;
    const actions = [];

    if (error) {
      statusDescription = /*#__PURE__*/_react.default.createElement("div", {
        className: "error"
      }, (0, _languageHandler._t)("Unable to load key backup status"));
    } else if (loading) {
      statusDescription = /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
    } else if (backupInfo) {
      let restoreButtonCaption = (0, _languageHandler._t)("Restore from Backup");

      if (_MatrixClientPeg.MatrixClientPeg.get().getKeyBackupEnabled()) {
        statusDescription = /*#__PURE__*/_react.default.createElement("p", null, "\u2705 ", (0, _languageHandler._t)("This session is backing up your keys. "));
      } else {
        statusDescription = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("This session is <b>not backing up your keys</b>, " + "but you do have an existing backup you can restore from " + "and add to going forward.", {}, {
          b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
        })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Connect this session to key backup before signing out to avoid " + "losing any keys that may only be on this session.")));
        restoreButtonCaption = (0, _languageHandler._t)("Connect this session to Key Backup");
      }

      let uploadStatus;

      if (!_MatrixClientPeg.MatrixClientPeg.get().getKeyBackupEnabled()) {
        // No upload status to show when backup disabled.
        uploadStatus = "";
      } else if (sessionsRemaining > 0) {
        uploadStatus = /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Backing up %(sessionsRemaining)s keys...", {
          sessionsRemaining
        }), " ", /*#__PURE__*/_react.default.createElement("br", null));
      } else {
        uploadStatus = /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("All keys backed up"), " ", /*#__PURE__*/_react.default.createElement("br", null));
      }

      let backupSigStatuses = backupSigStatus.sigs.map((sig, i) => {
        const deviceName = sig.device ? sig.device.getDisplayName() || sig.device.deviceId : null;

        const validity = sub => /*#__PURE__*/_react.default.createElement("span", {
          className: sig.valid ? 'mx_SecureBackupPanel_sigValid' : 'mx_SecureBackupPanel_sigInvalid'
        }, sub);

        const verify = sub => /*#__PURE__*/_react.default.createElement("span", {
          className: sig.device && sig.deviceTrust.isVerified() ? 'mx_SecureBackupPanel_deviceVerified' : 'mx_SecureBackupPanel_deviceNotVerified'
        }, sub);

        const device = sub => /*#__PURE__*/_react.default.createElement("span", {
          className: "mx_SecureBackupPanel_deviceName"
        }, deviceName);

        const fromThisDevice = sig.device && sig.device.getFingerprint() === _MatrixClientPeg.MatrixClientPeg.get().getDeviceEd25519Key();

        const fromThisUser = sig.crossSigningId && sig.deviceId === _MatrixClientPeg.MatrixClientPeg.get().getCrossSigningId();

        let sigStatus;

        if (sig.valid && fromThisUser) {
          sigStatus = (0, _languageHandler._t)("Backup has a <validity>valid</validity> signature from this user", {}, {
            validity
          });
        } else if (!sig.valid && fromThisUser) {
          sigStatus = (0, _languageHandler._t)("Backup has a <validity>invalid</validity> signature from this user", {}, {
            validity
          });
        } else if (sig.crossSigningId) {
          sigStatus = (0, _languageHandler._t)("Backup has a signature from <verify>unknown</verify> user with ID %(deviceId)s", {
            deviceId: sig.deviceId
          }, {
            verify
          });
        } else if (!sig.device) {
          sigStatus = (0, _languageHandler._t)("Backup has a signature from <verify>unknown</verify> session with ID %(deviceId)s", {
            deviceId: sig.deviceId
          }, {
            verify
          });
        } else if (sig.valid && fromThisDevice) {
          sigStatus = (0, _languageHandler._t)("Backup has a <validity>valid</validity> signature from this session", {}, {
            validity
          });
        } else if (!sig.valid && fromThisDevice) {
          // it can happen...
          sigStatus = (0, _languageHandler._t)("Backup has an <validity>invalid</validity> signature from this session", {}, {
            validity
          });
        } else if (sig.valid && sig.deviceTrust.isVerified()) {
          sigStatus = (0, _languageHandler._t)("Backup has a <validity>valid</validity> signature from " + "<verify>verified</verify> session <device></device>", {}, {
            validity,
            verify,
            device
          });
        } else if (sig.valid && !sig.deviceTrust.isVerified()) {
          sigStatus = (0, _languageHandler._t)("Backup has a <validity>valid</validity> signature from " + "<verify>unverified</verify> session <device></device>", {}, {
            validity,
            verify,
            device
          });
        } else if (!sig.valid && sig.deviceTrust.isVerified()) {
          sigStatus = (0, _languageHandler._t)("Backup has an <validity>invalid</validity> signature from " + "<verify>verified</verify> session <device></device>", {}, {
            validity,
            verify,
            device
          });
        } else if (!sig.valid && !sig.deviceTrust.isVerified()) {
          sigStatus = (0, _languageHandler._t)("Backup has an <validity>invalid</validity> signature from " + "<verify>unverified</verify> session <device></device>", {}, {
            validity,
            verify,
            device
          });
        }

        return /*#__PURE__*/_react.default.createElement("div", {
          key: i
        }, sigStatus);
      });

      if (backupSigStatus.sigs.length === 0) {
        backupSigStatuses = (0, _languageHandler._t)("Backup is not signed by any of your sessions");
      }

      let trustedLocally;

      if (backupSigStatus.trusted_locally) {
        trustedLocally = (0, _languageHandler._t)("This backup is trusted because it has been restored on this session");
      }

      extraDetailsTableRows = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("tr", null, /*#__PURE__*/_react.default.createElement("td", null, (0, _languageHandler._t)("Backup version:")), /*#__PURE__*/_react.default.createElement("td", null, backupInfo.version)), /*#__PURE__*/_react.default.createElement("tr", null, /*#__PURE__*/_react.default.createElement("td", null, (0, _languageHandler._t)("Algorithm:")), /*#__PURE__*/_react.default.createElement("td", null, backupInfo.algorithm)));
      extraDetails = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, uploadStatus, /*#__PURE__*/_react.default.createElement("div", null, backupSigStatuses), /*#__PURE__*/_react.default.createElement("div", null, trustedLocally));
      actions.push( /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        key: "restore",
        kind: "primary",
        onClick: this.restoreBackup
      }, restoreButtonCaption));

      if (!(0, _WellKnownUtils.isSecureBackupRequired)()) {
        actions.push( /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          key: "delete",
          kind: "danger",
          onClick: this.deleteBackup
        }, (0, _languageHandler._t)("Delete Backup")));
      }
    } else {
      statusDescription = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Your keys are <b>not being backed up from this session</b>.", {}, {
        b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
      })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Back up your keys before signing out to avoid losing them.")));
      actions.push( /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        key: "setup",
        kind: "primary",
        onClick: this.startNewBackup
      }, (0, _languageHandler._t)("Set up")));
    }

    if (secretStorageKeyInAccount) {
      actions.push( /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        key: "reset",
        kind: "danger",
        onClick: this.resetSecretStorage
      }, (0, _languageHandler._t)("Reset")));
    }

    let backupKeyWellFormedText = "";

    if (backupKeyCached) {
      backupKeyWellFormedText = ", ";

      if (backupKeyWellFormed) {
        backupKeyWellFormedText += (0, _languageHandler._t)("well formed");
      } else {
        backupKeyWellFormedText += (0, _languageHandler._t)("unexpected type");
      }
    }

    let actionRow;

    if (actions.length) {
      actionRow = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SecureBackupPanel_buttonRow"
      }, actions);
    }

    return /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Back up your encryption keys with your account data in case you " + "lose access to your sessions. Your keys will be secured with a " + "unique Security Key.")), statusDescription, /*#__PURE__*/_react.default.createElement("details", null, /*#__PURE__*/_react.default.createElement("summary", null, (0, _languageHandler._t)("Advanced")), /*#__PURE__*/_react.default.createElement("table", {
      className: "mx_SecureBackupPanel_statusList"
    }, /*#__PURE__*/_react.default.createElement("tbody", null, /*#__PURE__*/_react.default.createElement("tr", null, /*#__PURE__*/_react.default.createElement("td", null, (0, _languageHandler._t)("Backup key stored:")), /*#__PURE__*/_react.default.createElement("td", null, backupKeyStored === true ? (0, _languageHandler._t)("in secret storage") : (0, _languageHandler._t)("not stored"))), /*#__PURE__*/_react.default.createElement("tr", null, /*#__PURE__*/_react.default.createElement("td", null, (0, _languageHandler._t)("Backup key cached:")), /*#__PURE__*/_react.default.createElement("td", null, backupKeyCached ? (0, _languageHandler._t)("cached locally") : (0, _languageHandler._t)("not found locally"), backupKeyWellFormedText)), /*#__PURE__*/_react.default.createElement("tr", null, /*#__PURE__*/_react.default.createElement("td", null, (0, _languageHandler._t)("Secret storage public key:")), /*#__PURE__*/_react.default.createElement("td", null, secretStorageKeyInAccount ? (0, _languageHandler._t)("in account data") : (0, _languageHandler._t)("not found"))), /*#__PURE__*/_react.default.createElement("tr", null, /*#__PURE__*/_react.default.createElement("td", null, (0, _languageHandler._t)("Secret storage:")), /*#__PURE__*/_react.default.createElement("td", null, secretStorageReady ? (0, _languageHandler._t)("ready") : (0, _languageHandler._t)("not ready"))), extraDetailsTableRows)), extraDetails), actionRow);
  }

}

exports.default = SecureBackupPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTZWN1cmVCYWNrdXBQYW5lbCIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJzZXNzaW9uc1JlbWFpbmluZyIsInNldFN0YXRlIiwibG9hZEJhY2t1cFN0YXR1cyIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nQXN5bmMiLCJvbkZpbmlzaGVkIiwiY3JlYXRlRGlhbG9nIiwiUXVlc3Rpb25EaWFsb2ciLCJ0aXRsZSIsIl90IiwiZGVzY3JpcHRpb24iLCJidXR0b24iLCJkYW5nZXIiLCJwcm9jZWVkIiwibG9hZGluZyIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImRlbGV0ZUtleUJhY2t1cFZlcnNpb24iLCJzdGF0ZSIsImJhY2t1cEluZm8iLCJ2ZXJzaW9uIiwidGhlbiIsIlJlc3RvcmVLZXlCYWNrdXBEaWFsb2ciLCJlcnJvciIsImFjY2Vzc1NlY3JldFN0b3JhZ2UiLCJlIiwibG9nZ2VyIiwidW5tb3VudGVkIiwiYmFja3VwS2V5U3RvcmVkIiwiYmFja3VwS2V5Q2FjaGVkIiwiYmFja3VwS2V5V2VsbEZvcm1lZCIsInNlY3JldFN0b3JhZ2VLZXlJbkFjY291bnQiLCJzZWNyZXRTdG9yYWdlUmVhZHkiLCJiYWNrdXBTaWdTdGF0dXMiLCJjb21wb25lbnREaWRNb3VudCIsImNoZWNrS2V5QmFja3VwU3RhdHVzIiwib24iLCJDcnlwdG9FdmVudCIsIktleUJhY2t1cFN0YXR1cyIsIm9uS2V5QmFja3VwU3RhdHVzIiwiS2V5QmFja3VwU2Vzc2lvbnNSZW1haW5pbmciLCJvbktleUJhY2t1cFNlc3Npb25zUmVtYWluaW5nIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJyZW1vdmVMaXN0ZW5lciIsImdldFVwZGF0ZWREaWFnbm9zdGljcyIsInRydXN0SW5mbyIsImNoZWNrS2V5QmFja3VwIiwibG9nIiwiZ2V0S2V5QmFja3VwVmVyc2lvbiIsImlzS2V5QmFja3VwVHJ1c3RlZCIsImNsaSIsInNlY3JldFN0b3JhZ2UiLCJjcnlwdG8iLCJpc0tleUJhY2t1cEtleVN0b3JlZCIsImJhY2t1cEtleUZyb21DYWNoZSIsImdldFNlc3Npb25CYWNrdXBQcml2YXRlS2V5IiwiVWludDhBcnJheSIsImhhc0tleSIsImlzU2VjcmV0U3RvcmFnZVJlYWR5IiwicmVuZGVyIiwic3RhdHVzRGVzY3JpcHRpb24iLCJleHRyYURldGFpbHNUYWJsZVJvd3MiLCJleHRyYURldGFpbHMiLCJhY3Rpb25zIiwicmVzdG9yZUJ1dHRvbkNhcHRpb24iLCJnZXRLZXlCYWNrdXBFbmFibGVkIiwiYiIsInN1YiIsInVwbG9hZFN0YXR1cyIsImJhY2t1cFNpZ1N0YXR1c2VzIiwic2lncyIsIm1hcCIsInNpZyIsImkiLCJkZXZpY2VOYW1lIiwiZGV2aWNlIiwiZ2V0RGlzcGxheU5hbWUiLCJkZXZpY2VJZCIsInZhbGlkaXR5IiwidmFsaWQiLCJ2ZXJpZnkiLCJkZXZpY2VUcnVzdCIsImlzVmVyaWZpZWQiLCJmcm9tVGhpc0RldmljZSIsImdldEZpbmdlcnByaW50IiwiZ2V0RGV2aWNlRWQyNTUxOUtleSIsImZyb21UaGlzVXNlciIsImNyb3NzU2lnbmluZ0lkIiwiZ2V0Q3Jvc3NTaWduaW5nSWQiLCJzaWdTdGF0dXMiLCJsZW5ndGgiLCJ0cnVzdGVkTG9jYWxseSIsInRydXN0ZWRfbG9jYWxseSIsImFsZ29yaXRobSIsInB1c2giLCJyZXN0b3JlQmFja3VwIiwiaXNTZWN1cmVCYWNrdXBSZXF1aXJlZCIsImRlbGV0ZUJhY2t1cCIsInN0YXJ0TmV3QmFja3VwIiwicmVzZXRTZWNyZXRTdG9yYWdlIiwiYmFja3VwS2V5V2VsbEZvcm1lZFRleHQiLCJhY3Rpb25Sb3ciXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9zZXR0aW5ncy9TZWN1cmVCYWNrdXBQYW5lbC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE4IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSwgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBDb21wb25lbnRUeXBlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgSUtleUJhY2t1cEluZm8gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY3J5cHRvL2tleWJhY2t1cFwiO1xuaW1wb3J0IHsgVHJ1c3RJbmZvIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NyeXB0by9iYWNrdXBcIjtcbmltcG9ydCB7IENyeXB0b0V2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NyeXB0b1wiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuXG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tICcuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uLy4uL01vZGFsJztcbmltcG9ydCB7IGlzU2VjdXJlQmFja3VwUmVxdWlyZWQgfSBmcm9tICcuLi8uLi8uLi91dGlscy9XZWxsS25vd25VdGlscyc7XG5pbXBvcnQgU3Bpbm5lciBmcm9tICcuLi9lbGVtZW50cy9TcGlubmVyJztcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gJy4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b24nO1xuaW1wb3J0IFF1ZXN0aW9uRGlhbG9nIGZyb20gJy4uL2RpYWxvZ3MvUXVlc3Rpb25EaWFsb2cnO1xuaW1wb3J0IFJlc3RvcmVLZXlCYWNrdXBEaWFsb2cgZnJvbSAnLi4vZGlhbG9ncy9zZWN1cml0eS9SZXN0b3JlS2V5QmFja3VwRGlhbG9nJztcbmltcG9ydCB7IGFjY2Vzc1NlY3JldFN0b3JhZ2UgfSBmcm9tICcuLi8uLi8uLi9TZWN1cml0eU1hbmFnZXInO1xuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBsb2FkaW5nOiBib29sZWFuO1xuICAgIGVycm9yOiBudWxsO1xuICAgIGJhY2t1cEtleVN0b3JlZDogYm9vbGVhbjtcbiAgICBiYWNrdXBLZXlDYWNoZWQ6IGJvb2xlYW47XG4gICAgYmFja3VwS2V5V2VsbEZvcm1lZDogYm9vbGVhbjtcbiAgICBzZWNyZXRTdG9yYWdlS2V5SW5BY2NvdW50OiBib29sZWFuO1xuICAgIHNlY3JldFN0b3JhZ2VSZWFkeTogYm9vbGVhbjtcbiAgICBiYWNrdXBJbmZvOiBJS2V5QmFja3VwSW5mbztcbiAgICBiYWNrdXBTaWdTdGF0dXM6IFRydXN0SW5mbztcbiAgICBzZXNzaW9uc1JlbWFpbmluZzogbnVtYmVyO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZWN1cmVCYWNrdXBQYW5lbCBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8e30sIElTdGF0ZT4ge1xuICAgIHByaXZhdGUgdW5tb3VudGVkID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczoge30pIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBsb2FkaW5nOiB0cnVlLFxuICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICBiYWNrdXBLZXlTdG9yZWQ6IG51bGwsXG4gICAgICAgICAgICBiYWNrdXBLZXlDYWNoZWQ6IG51bGwsXG4gICAgICAgICAgICBiYWNrdXBLZXlXZWxsRm9ybWVkOiBudWxsLFxuICAgICAgICAgICAgc2VjcmV0U3RvcmFnZUtleUluQWNjb3VudDogbnVsbCxcbiAgICAgICAgICAgIHNlY3JldFN0b3JhZ2VSZWFkeTogbnVsbCxcbiAgICAgICAgICAgIGJhY2t1cEluZm86IG51bGwsXG4gICAgICAgICAgICBiYWNrdXBTaWdTdGF0dXM6IG51bGwsXG4gICAgICAgICAgICBzZXNzaW9uc1JlbWFpbmluZzogMCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY2hlY2tLZXlCYWNrdXBTdGF0dXMoKTtcblxuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkub24oQ3J5cHRvRXZlbnQuS2V5QmFja3VwU3RhdHVzLCB0aGlzLm9uS2V5QmFja3VwU3RhdHVzKTtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLm9uKFxuICAgICAgICAgICAgQ3J5cHRvRXZlbnQuS2V5QmFja3VwU2Vzc2lvbnNSZW1haW5pbmcsXG4gICAgICAgICAgICB0aGlzLm9uS2V5QmFja3VwU2Vzc2lvbnNSZW1haW5pbmcsXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgICAgICB0aGlzLnVubW91bnRlZCA9IHRydWU7XG5cbiAgICAgICAgaWYgKE1hdHJpeENsaWVudFBlZy5nZXQoKSkge1xuICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnJlbW92ZUxpc3RlbmVyKENyeXB0b0V2ZW50LktleUJhY2t1cFN0YXR1cywgdGhpcy5vbktleUJhY2t1cFN0YXR1cyk7XG4gICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkucmVtb3ZlTGlzdGVuZXIoXG4gICAgICAgICAgICAgICAgQ3J5cHRvRXZlbnQuS2V5QmFja3VwU2Vzc2lvbnNSZW1haW5pbmcsXG4gICAgICAgICAgICAgICAgdGhpcy5vbktleUJhY2t1cFNlc3Npb25zUmVtYWluaW5nLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25LZXlCYWNrdXBTZXNzaW9uc1JlbWFpbmluZyA9IChzZXNzaW9uc1JlbWFpbmluZzogbnVtYmVyKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2Vzc2lvbnNSZW1haW5pbmcsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uS2V5QmFja3VwU3RhdHVzID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICAvLyBUaGlzIGp1c3QgbG9hZHMgdGhlIGN1cnJlbnQgYmFja3VwIHN0YXR1cyByYXRoZXIgdGhhbiBmb3JjaW5nXG4gICAgICAgIC8vIGEgcmUtY2hlY2sgb3RoZXJ3aXNlIHdlIHJpc2sgY2F1c2luZyBpbmZpbml0ZSBsb29wc1xuICAgICAgICB0aGlzLmxvYWRCYWNrdXBTdGF0dXMoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBhc3luYyBjaGVja0tleUJhY2t1cFN0YXR1cygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdGhpcy5nZXRVcGRhdGVkRGlhZ25vc3RpY3MoKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHsgYmFja3VwSW5mbywgdHJ1c3RJbmZvIH0gPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuY2hlY2tLZXlCYWNrdXAoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICAgICAgICAgIGJhY2t1cEluZm8sXG4gICAgICAgICAgICAgICAgYmFja3VwU2lnU3RhdHVzOiB0cnVzdEluZm8sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgbG9nZ2VyLmxvZyhcIlVuYWJsZSB0byBmZXRjaCBjaGVjayBiYWNrdXAgc3RhdHVzXCIsIGUpO1xuICAgICAgICAgICAgaWYgKHRoaXMudW5tb3VudGVkKSByZXR1cm47XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZSxcbiAgICAgICAgICAgICAgICBiYWNrdXBJbmZvOiBudWxsLFxuICAgICAgICAgICAgICAgIGJhY2t1cFNpZ1N0YXR1czogbnVsbCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBsb2FkQmFja3VwU3RhdHVzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgbG9hZGluZzogdHJ1ZSB9KTtcbiAgICAgICAgdGhpcy5nZXRVcGRhdGVkRGlhZ25vc3RpY3MoKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGJhY2t1cEluZm8gPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0S2V5QmFja3VwVmVyc2lvbigpO1xuICAgICAgICAgICAgY29uc3QgYmFja3VwU2lnU3RhdHVzID0gYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLmlzS2V5QmFja3VwVHJ1c3RlZChiYWNrdXBJbmZvKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICAgICAgYmFja3VwSW5mbyxcbiAgICAgICAgICAgICAgICBiYWNrdXBTaWdTdGF0dXMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgbG9nZ2VyLmxvZyhcIlVuYWJsZSB0byBmZXRjaCBrZXkgYmFja3VwIHN0YXR1c1wiLCBlKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkgcmV0dXJuO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgbG9hZGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3I6IGUsXG4gICAgICAgICAgICAgICAgYmFja3VwSW5mbzogbnVsbCxcbiAgICAgICAgICAgICAgICBiYWNrdXBTaWdTdGF0dXM6IG51bGwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgZ2V0VXBkYXRlZERpYWdub3N0aWNzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHNlY3JldFN0b3JhZ2UgPSBjbGkuY3J5cHRvLnNlY3JldFN0b3JhZ2U7XG5cbiAgICAgICAgY29uc3QgYmFja3VwS2V5U3RvcmVkID0gISEoYXdhaXQgY2xpLmlzS2V5QmFja3VwS2V5U3RvcmVkKCkpO1xuICAgICAgICBjb25zdCBiYWNrdXBLZXlGcm9tQ2FjaGUgPSBhd2FpdCBjbGkuY3J5cHRvLmdldFNlc3Npb25CYWNrdXBQcml2YXRlS2V5KCk7XG4gICAgICAgIGNvbnN0IGJhY2t1cEtleUNhY2hlZCA9ICEhKGJhY2t1cEtleUZyb21DYWNoZSk7XG4gICAgICAgIGNvbnN0IGJhY2t1cEtleVdlbGxGb3JtZWQgPSBiYWNrdXBLZXlGcm9tQ2FjaGUgaW5zdGFuY2VvZiBVaW50OEFycmF5O1xuICAgICAgICBjb25zdCBzZWNyZXRTdG9yYWdlS2V5SW5BY2NvdW50ID0gYXdhaXQgc2VjcmV0U3RvcmFnZS5oYXNLZXkoKTtcbiAgICAgICAgY29uc3Qgc2VjcmV0U3RvcmFnZVJlYWR5ID0gYXdhaXQgY2xpLmlzU2VjcmV0U3RvcmFnZVJlYWR5KCk7XG5cbiAgICAgICAgaWYgKHRoaXMudW5tb3VudGVkKSByZXR1cm47XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYmFja3VwS2V5U3RvcmVkLFxuICAgICAgICAgICAgYmFja3VwS2V5Q2FjaGVkLFxuICAgICAgICAgICAgYmFja3VwS2V5V2VsbEZvcm1lZCxcbiAgICAgICAgICAgIHNlY3JldFN0b3JhZ2VLZXlJbkFjY291bnQsXG4gICAgICAgICAgICBzZWNyZXRTdG9yYWdlUmVhZHksXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhcnROZXdCYWNrdXAgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZ0FzeW5jKFxuICAgICAgICAgICAgaW1wb3J0KFxuICAgICAgICAgICAgICAgICcuLi8uLi8uLi9hc3luYy1jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3Mvc2VjdXJpdHkvQ3JlYXRlS2V5QmFja3VwRGlhbG9nJ1xuICAgICAgICAgICAgKSBhcyB1bmtub3duIGFzIFByb21pc2U8Q29tcG9uZW50VHlwZTx7fT4+LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkQmFja3VwU3RhdHVzKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sIG51bGwsIC8qIHByaW9yaXR5ID0gKi8gZmFsc2UsIC8qIHN0YXRpYyA9ICovIHRydWUsXG4gICAgICAgICk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgZGVsZXRlQmFja3VwID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coUXVlc3Rpb25EaWFsb2csIHtcbiAgICAgICAgICAgIHRpdGxlOiBfdCgnRGVsZXRlIEJhY2t1cCcpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFxuICAgICAgICAgICAgICAgIFwiQXJlIHlvdSBzdXJlPyBZb3Ugd2lsbCBsb3NlIHlvdXIgZW5jcnlwdGVkIG1lc3NhZ2VzIGlmIHlvdXIgXCIgK1xuICAgICAgICAgICAgICAgIFwia2V5cyBhcmUgbm90IGJhY2tlZCB1cCBwcm9wZXJseS5cIixcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBidXR0b246IF90KCdEZWxldGUgQmFja3VwJyksXG4gICAgICAgICAgICBkYW5nZXI6IHRydWUsXG4gICAgICAgICAgICBvbkZpbmlzaGVkOiAocHJvY2VlZCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghcHJvY2VlZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBsb2FkaW5nOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5kZWxldGVLZXlCYWNrdXBWZXJzaW9uKHRoaXMuc3RhdGUuYmFja3VwSW5mby52ZXJzaW9uKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkQmFja3VwU3RhdHVzKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSByZXN0b3JlQmFja3VwID0gYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coUmVzdG9yZUtleUJhY2t1cERpYWxvZywgbnVsbCwgbnVsbCwgLyogcHJpb3JpdHkgPSAqLyBmYWxzZSwgLyogc3RhdGljID0gKi8gdHJ1ZSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgcmVzZXRTZWNyZXRTdG9yYWdlID0gYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgZXJyb3I6IG51bGwgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBhY2Nlc3NTZWNyZXRTdG9yYWdlKGFzeW5jICgpID0+IHsgfSwgLyogZm9yY2VSZXNldCA9ICovIHRydWUpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJFcnJvciByZXNldHRpbmcgc2VjcmV0IHN0b3JhZ2VcIiwgZSk7XG4gICAgICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlcnJvcjogZSB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5sb2FkQmFja3VwU3RhdHVzKCk7XG4gICAgfTtcblxuICAgIHB1YmxpYyByZW5kZXIoKTogSlNYLkVsZW1lbnQge1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICBsb2FkaW5nLFxuICAgICAgICAgICAgZXJyb3IsXG4gICAgICAgICAgICBiYWNrdXBLZXlTdG9yZWQsXG4gICAgICAgICAgICBiYWNrdXBLZXlDYWNoZWQsXG4gICAgICAgICAgICBiYWNrdXBLZXlXZWxsRm9ybWVkLFxuICAgICAgICAgICAgc2VjcmV0U3RvcmFnZUtleUluQWNjb3VudCxcbiAgICAgICAgICAgIHNlY3JldFN0b3JhZ2VSZWFkeSxcbiAgICAgICAgICAgIGJhY2t1cEluZm8sXG4gICAgICAgICAgICBiYWNrdXBTaWdTdGF0dXMsXG4gICAgICAgICAgICBzZXNzaW9uc1JlbWFpbmluZyxcbiAgICAgICAgfSA9IHRoaXMuc3RhdGU7XG5cbiAgICAgICAgbGV0IHN0YXR1c0Rlc2NyaXB0aW9uO1xuICAgICAgICBsZXQgZXh0cmFEZXRhaWxzVGFibGVSb3dzO1xuICAgICAgICBsZXQgZXh0cmFEZXRhaWxzO1xuICAgICAgICBjb25zdCBhY3Rpb25zID0gW107XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgc3RhdHVzRGVzY3JpcHRpb24gPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJlcnJvclwiPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiVW5hYmxlIHRvIGxvYWQga2V5IGJhY2t1cCBzdGF0dXNcIikgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmIChsb2FkaW5nKSB7XG4gICAgICAgICAgICBzdGF0dXNEZXNjcmlwdGlvbiA9IDxTcGlubmVyIC8+O1xuICAgICAgICB9IGVsc2UgaWYgKGJhY2t1cEluZm8pIHtcbiAgICAgICAgICAgIGxldCByZXN0b3JlQnV0dG9uQ2FwdGlvbiA9IF90KFwiUmVzdG9yZSBmcm9tIEJhY2t1cFwiKTtcblxuICAgICAgICAgICAgaWYgKE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRLZXlCYWNrdXBFbmFibGVkKCkpIHtcbiAgICAgICAgICAgICAgICBzdGF0dXNEZXNjcmlwdGlvbiA9IDxwPuKchSB7IF90KFwiVGhpcyBzZXNzaW9uIGlzIGJhY2tpbmcgdXAgeW91ciBrZXlzLiBcIikgfTwvcD47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHN0YXR1c0Rlc2NyaXB0aW9uID0gPD5cbiAgICAgICAgICAgICAgICAgICAgPHA+eyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiVGhpcyBzZXNzaW9uIGlzIDxiPm5vdCBiYWNraW5nIHVwIHlvdXIga2V5czwvYj4sIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYnV0IHlvdSBkbyBoYXZlIGFuIGV4aXN0aW5nIGJhY2t1cCB5b3UgY2FuIHJlc3RvcmUgZnJvbSBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcImFuZCBhZGQgdG8gZ29pbmcgZm9yd2FyZC5cIiwge30sXG4gICAgICAgICAgICAgICAgICAgICAgICB7IGI6IHN1YiA9PiA8Yj57IHN1YiB9PC9iPiB9LFxuICAgICAgICAgICAgICAgICAgICApIH08L3A+XG4gICAgICAgICAgICAgICAgICAgIDxwPnsgX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIkNvbm5lY3QgdGhpcyBzZXNzaW9uIHRvIGtleSBiYWNrdXAgYmVmb3JlIHNpZ25pbmcgb3V0IHRvIGF2b2lkIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibG9zaW5nIGFueSBrZXlzIHRoYXQgbWF5IG9ubHkgYmUgb24gdGhpcyBzZXNzaW9uLlwiLFxuICAgICAgICAgICAgICAgICAgICApIH08L3A+XG4gICAgICAgICAgICAgICAgPC8+O1xuICAgICAgICAgICAgICAgIHJlc3RvcmVCdXR0b25DYXB0aW9uID0gX3QoXCJDb25uZWN0IHRoaXMgc2Vzc2lvbiB0byBLZXkgQmFja3VwXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgdXBsb2FkU3RhdHVzO1xuICAgICAgICAgICAgaWYgKCFNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0S2V5QmFja3VwRW5hYmxlZCgpKSB7XG4gICAgICAgICAgICAgICAgLy8gTm8gdXBsb2FkIHN0YXR1cyB0byBzaG93IHdoZW4gYmFja3VwIGRpc2FibGVkLlxuICAgICAgICAgICAgICAgIHVwbG9hZFN0YXR1cyA9IFwiXCI7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNlc3Npb25zUmVtYWluaW5nID4gMCkge1xuICAgICAgICAgICAgICAgIHVwbG9hZFN0YXR1cyA9IDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJCYWNraW5nIHVwICUoc2Vzc2lvbnNSZW1haW5pbmcpcyBrZXlzLi4uXCIsIHsgc2Vzc2lvbnNSZW1haW5pbmcgfSkgfSA8YnIgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHVwbG9hZFN0YXR1cyA9IDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJBbGwga2V5cyBiYWNrZWQgdXBcIikgfSA8YnIgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBiYWNrdXBTaWdTdGF0dXNlczogUmVhY3QuUmVhY3ROb2RlID0gYmFja3VwU2lnU3RhdHVzLnNpZ3MubWFwKChzaWcsIGkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBkZXZpY2VOYW1lID0gc2lnLmRldmljZSA/IChzaWcuZGV2aWNlLmdldERpc3BsYXlOYW1lKCkgfHwgc2lnLmRldmljZS5kZXZpY2VJZCkgOiBudWxsO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbGlkaXR5ID0gc3ViID0+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17c2lnLnZhbGlkID8gJ214X1NlY3VyZUJhY2t1cFBhbmVsX3NpZ1ZhbGlkJyA6ICdteF9TZWN1cmVCYWNrdXBQYW5lbF9zaWdJbnZhbGlkJ30+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN1YiB9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj47XG4gICAgICAgICAgICAgICAgY29uc3QgdmVyaWZ5ID0gc3ViID0+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17c2lnLmRldmljZSAmJiBzaWcuZGV2aWNlVHJ1c3QuaXNWZXJpZmllZCgpID8gJ214X1NlY3VyZUJhY2t1cFBhbmVsX2RldmljZVZlcmlmaWVkJyA6ICdteF9TZWN1cmVCYWNrdXBQYW5lbF9kZXZpY2VOb3RWZXJpZmllZCd9PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdWIgfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+O1xuICAgICAgICAgICAgICAgIGNvbnN0IGRldmljZSA9IHN1YiA9PiA8c3BhbiBjbGFzc05hbWU9XCJteF9TZWN1cmVCYWNrdXBQYW5lbF9kZXZpY2VOYW1lXCI+eyBkZXZpY2VOYW1lIH08L3NwYW4+O1xuICAgICAgICAgICAgICAgIGNvbnN0IGZyb21UaGlzRGV2aWNlID0gKFxuICAgICAgICAgICAgICAgICAgICBzaWcuZGV2aWNlICYmXG4gICAgICAgICAgICAgICAgICAgIHNpZy5kZXZpY2UuZ2V0RmluZ2VycHJpbnQoKSA9PT0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldERldmljZUVkMjU1MTlLZXkoKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgY29uc3QgZnJvbVRoaXNVc2VyID0gKFxuICAgICAgICAgICAgICAgICAgICBzaWcuY3Jvc3NTaWduaW5nSWQgJiZcbiAgICAgICAgICAgICAgICAgICAgc2lnLmRldmljZUlkID09PSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Q3Jvc3NTaWduaW5nSWQoKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgbGV0IHNpZ1N0YXR1cztcbiAgICAgICAgICAgICAgICBpZiAoc2lnLnZhbGlkICYmIGZyb21UaGlzVXNlcikge1xuICAgICAgICAgICAgICAgICAgICBzaWdTdGF0dXMgPSBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiQmFja3VwIGhhcyBhIDx2YWxpZGl0eT52YWxpZDwvdmFsaWRpdHk+IHNpZ25hdHVyZSBmcm9tIHRoaXMgdXNlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAge30sIHsgdmFsaWRpdHkgfSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFzaWcudmFsaWQgJiYgZnJvbVRoaXNVc2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIHNpZ1N0YXR1cyA9IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJCYWNrdXAgaGFzIGEgPHZhbGlkaXR5PmludmFsaWQ8L3ZhbGlkaXR5PiBzaWduYXR1cmUgZnJvbSB0aGlzIHVzZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHt9LCB7IHZhbGlkaXR5IH0sXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzaWcuY3Jvc3NTaWduaW5nSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2lnU3RhdHVzID0gX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIkJhY2t1cCBoYXMgYSBzaWduYXR1cmUgZnJvbSA8dmVyaWZ5PnVua25vd248L3ZlcmlmeT4gdXNlciB3aXRoIElEICUoZGV2aWNlSWQpc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBkZXZpY2VJZDogc2lnLmRldmljZUlkIH0sIHsgdmVyaWZ5IH0sXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghc2lnLmRldmljZSkge1xuICAgICAgICAgICAgICAgICAgICBzaWdTdGF0dXMgPSBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiQmFja3VwIGhhcyBhIHNpZ25hdHVyZSBmcm9tIDx2ZXJpZnk+dW5rbm93bjwvdmVyaWZ5PiBzZXNzaW9uIHdpdGggSUQgJShkZXZpY2VJZClzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IGRldmljZUlkOiBzaWcuZGV2aWNlSWQgfSwgeyB2ZXJpZnkgfSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNpZy52YWxpZCAmJiBmcm9tVGhpc0RldmljZSkge1xuICAgICAgICAgICAgICAgICAgICBzaWdTdGF0dXMgPSBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiQmFja3VwIGhhcyBhIDx2YWxpZGl0eT52YWxpZDwvdmFsaWRpdHk+IHNpZ25hdHVyZSBmcm9tIHRoaXMgc2Vzc2lvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAge30sIHsgdmFsaWRpdHkgfSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFzaWcudmFsaWQgJiYgZnJvbVRoaXNEZXZpY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaXQgY2FuIGhhcHBlbi4uLlxuICAgICAgICAgICAgICAgICAgICBzaWdTdGF0dXMgPSBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiQmFja3VwIGhhcyBhbiA8dmFsaWRpdHk+aW52YWxpZDwvdmFsaWRpdHk+IHNpZ25hdHVyZSBmcm9tIHRoaXMgc2Vzc2lvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAge30sIHsgdmFsaWRpdHkgfSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHNpZy52YWxpZCAmJiBzaWcuZGV2aWNlVHJ1c3QuaXNWZXJpZmllZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNpZ1N0YXR1cyA9IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJCYWNrdXAgaGFzIGEgPHZhbGlkaXR5PnZhbGlkPC92YWxpZGl0eT4gc2lnbmF0dXJlIGZyb20gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCI8dmVyaWZ5PnZlcmlmaWVkPC92ZXJpZnk+IHNlc3Npb24gPGRldmljZT48L2RldmljZT5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHt9LCB7IHZhbGlkaXR5LCB2ZXJpZnksIGRldmljZSB9LFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2lnLnZhbGlkICYmICFzaWcuZGV2aWNlVHJ1c3QuaXNWZXJpZmllZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNpZ1N0YXR1cyA9IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJCYWNrdXAgaGFzIGEgPHZhbGlkaXR5PnZhbGlkPC92YWxpZGl0eT4gc2lnbmF0dXJlIGZyb20gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCI8dmVyaWZ5PnVudmVyaWZpZWQ8L3ZlcmlmeT4gc2Vzc2lvbiA8ZGV2aWNlPjwvZGV2aWNlPlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAge30sIHsgdmFsaWRpdHksIHZlcmlmeSwgZGV2aWNlIH0sXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghc2lnLnZhbGlkICYmIHNpZy5kZXZpY2VUcnVzdC5pc1ZlcmlmaWVkKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgc2lnU3RhdHVzID0gX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIkJhY2t1cCBoYXMgYW4gPHZhbGlkaXR5PmludmFsaWQ8L3ZhbGlkaXR5PiBzaWduYXR1cmUgZnJvbSBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcIjx2ZXJpZnk+dmVyaWZpZWQ8L3ZlcmlmeT4gc2Vzc2lvbiA8ZGV2aWNlPjwvZGV2aWNlPlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAge30sIHsgdmFsaWRpdHksIHZlcmlmeSwgZGV2aWNlIH0sXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghc2lnLnZhbGlkICYmICFzaWcuZGV2aWNlVHJ1c3QuaXNWZXJpZmllZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNpZ1N0YXR1cyA9IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJCYWNrdXAgaGFzIGFuIDx2YWxpZGl0eT5pbnZhbGlkPC92YWxpZGl0eT4gc2lnbmF0dXJlIGZyb20gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCI8dmVyaWZ5PnVudmVyaWZpZWQ8L3ZlcmlmeT4gc2Vzc2lvbiA8ZGV2aWNlPjwvZGV2aWNlPlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAge30sIHsgdmFsaWRpdHksIHZlcmlmeSwgZGV2aWNlIH0sXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIDxkaXYga2V5PXtpfT5cbiAgICAgICAgICAgICAgICAgICAgeyBzaWdTdGF0dXMgfVxuICAgICAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGJhY2t1cFNpZ1N0YXR1cy5zaWdzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGJhY2t1cFNpZ1N0YXR1c2VzID0gX3QoXCJCYWNrdXAgaXMgbm90IHNpZ25lZCBieSBhbnkgb2YgeW91ciBzZXNzaW9uc1wiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IHRydXN0ZWRMb2NhbGx5O1xuICAgICAgICAgICAgaWYgKGJhY2t1cFNpZ1N0YXR1cy50cnVzdGVkX2xvY2FsbHkpIHtcbiAgICAgICAgICAgICAgICB0cnVzdGVkTG9jYWxseSA9IF90KFwiVGhpcyBiYWNrdXAgaXMgdHJ1c3RlZCBiZWNhdXNlIGl0IGhhcyBiZWVuIHJlc3RvcmVkIG9uIHRoaXMgc2Vzc2lvblwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZXh0cmFEZXRhaWxzVGFibGVSb3dzID0gPD5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD57IF90KFwiQmFja3VwIHZlcnNpb246XCIpIH08L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQ+eyBiYWNrdXBJbmZvLnZlcnNpb24gfTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8dHI+XG4gICAgICAgICAgICAgICAgICAgIDx0ZD57IF90KFwiQWxnb3JpdGhtOlwiKSB9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPHRkPnsgYmFja3VwSW5mby5hbGdvcml0aG0gfTwvdGQ+XG4gICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgIDwvPjtcblxuICAgICAgICAgICAgZXh0cmFEZXRhaWxzID0gPD5cbiAgICAgICAgICAgICAgICB7IHVwbG9hZFN0YXR1cyB9XG4gICAgICAgICAgICAgICAgPGRpdj57IGJhY2t1cFNpZ1N0YXR1c2VzIH08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PnsgdHJ1c3RlZExvY2FsbHkgfTwvZGl2PlxuICAgICAgICAgICAgPC8+O1xuXG4gICAgICAgICAgICBhY3Rpb25zLnB1c2goXG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2V5PVwicmVzdG9yZVwiIGtpbmQ9XCJwcmltYXJ5XCIgb25DbGljaz17dGhpcy5yZXN0b3JlQmFja3VwfT5cbiAgICAgICAgICAgICAgICAgICAgeyByZXN0b3JlQnV0dG9uQ2FwdGlvbiB9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPixcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGlmICghaXNTZWN1cmVCYWNrdXBSZXF1aXJlZCgpKSB7XG4gICAgICAgICAgICAgICAgYWN0aW9ucy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBrZXk9XCJkZWxldGVcIiBraW5kPVwiZGFuZ2VyXCIgb25DbGljaz17dGhpcy5kZWxldGVCYWNrdXB9PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkRlbGV0ZSBCYWNrdXBcIikgfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGF0dXNEZXNjcmlwdGlvbiA9IDw+XG4gICAgICAgICAgICAgICAgPHA+eyBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJZb3VyIGtleXMgYXJlIDxiPm5vdCBiZWluZyBiYWNrZWQgdXAgZnJvbSB0aGlzIHNlc3Npb248L2I+LlwiLCB7fSxcbiAgICAgICAgICAgICAgICAgICAgeyBiOiBzdWIgPT4gPGI+eyBzdWIgfTwvYj4gfSxcbiAgICAgICAgICAgICAgICApIH08L3A+XG4gICAgICAgICAgICAgICAgPHA+eyBfdChcIkJhY2sgdXAgeW91ciBrZXlzIGJlZm9yZSBzaWduaW5nIG91dCB0byBhdm9pZCBsb3NpbmcgdGhlbS5cIikgfTwvcD5cbiAgICAgICAgICAgIDwvPjtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaChcbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBrZXk9XCJzZXR1cFwiIGtpbmQ9XCJwcmltYXJ5XCIgb25DbGljaz17dGhpcy5zdGFydE5ld0JhY2t1cH0+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJTZXQgdXBcIikgfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4sXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlY3JldFN0b3JhZ2VLZXlJbkFjY291bnQpIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaChcbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBrZXk9XCJyZXNldFwiIGtpbmQ9XCJkYW5nZXJcIiBvbkNsaWNrPXt0aGlzLnJlc2V0U2VjcmV0U3RvcmFnZX0+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJSZXNldFwiKSB9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPixcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYmFja3VwS2V5V2VsbEZvcm1lZFRleHQgPSBcIlwiO1xuICAgICAgICBpZiAoYmFja3VwS2V5Q2FjaGVkKSB7XG4gICAgICAgICAgICBiYWNrdXBLZXlXZWxsRm9ybWVkVGV4dCA9IFwiLCBcIjtcbiAgICAgICAgICAgIGlmIChiYWNrdXBLZXlXZWxsRm9ybWVkKSB7XG4gICAgICAgICAgICAgICAgYmFja3VwS2V5V2VsbEZvcm1lZFRleHQgKz0gX3QoXCJ3ZWxsIGZvcm1lZFwiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYmFja3VwS2V5V2VsbEZvcm1lZFRleHQgKz0gX3QoXCJ1bmV4cGVjdGVkIHR5cGVcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYWN0aW9uUm93O1xuICAgICAgICBpZiAoYWN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGFjdGlvblJvdyA9IDxkaXYgY2xhc3NOYW1lPVwibXhfU2VjdXJlQmFja3VwUGFuZWxfYnV0dG9uUm93XCI+XG4gICAgICAgICAgICAgICAgeyBhY3Rpb25zIH1cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxwPnsgX3QoXG4gICAgICAgICAgICAgICAgICAgIFwiQmFjayB1cCB5b3VyIGVuY3J5cHRpb24ga2V5cyB3aXRoIHlvdXIgYWNjb3VudCBkYXRhIGluIGNhc2UgeW91IFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJsb3NlIGFjY2VzcyB0byB5b3VyIHNlc3Npb25zLiBZb3VyIGtleXMgd2lsbCBiZSBzZWN1cmVkIHdpdGggYSBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwidW5pcXVlIFNlY3VyaXR5IEtleS5cIixcbiAgICAgICAgICAgICAgICApIH08L3A+XG4gICAgICAgICAgICAgICAgeyBzdGF0dXNEZXNjcmlwdGlvbiB9XG4gICAgICAgICAgICAgICAgPGRldGFpbHM+XG4gICAgICAgICAgICAgICAgICAgIDxzdW1tYXJ5PnsgX3QoXCJBZHZhbmNlZFwiKSB9PC9zdW1tYXJ5PlxuICAgICAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3NOYW1lPVwibXhfU2VjdXJlQmFja3VwUGFuZWxfc3RhdHVzTGlzdFwiPjx0Ym9keT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0cj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQ+eyBfdChcIkJhY2t1cCBrZXkgc3RvcmVkOlwiKSB9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQ+e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrdXBLZXlTdG9yZWQgPT09IHRydWUgPyBfdChcImluIHNlY3JldCBzdG9yYWdlXCIpIDogX3QoXCJub3Qgc3RvcmVkXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD57IF90KFwiQmFja3VwIGtleSBjYWNoZWQ6XCIpIH08L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBiYWNrdXBLZXlDYWNoZWQgPyBfdChcImNhY2hlZCBsb2NhbGx5XCIpIDogX3QoXCJub3QgZm91bmQgbG9jYWxseVwiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgYmFja3VwS2V5V2VsbEZvcm1lZFRleHQgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD57IF90KFwiU2VjcmV0IHN0b3JhZ2UgcHVibGljIGtleTpcIikgfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkPnsgc2VjcmV0U3RvcmFnZUtleUluQWNjb3VudCA/IF90KFwiaW4gYWNjb3VudCBkYXRhXCIpIDogX3QoXCJub3QgZm91bmRcIikgfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD57IF90KFwiU2VjcmV0IHN0b3JhZ2U6XCIpIH08L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD57IHNlY3JldFN0b3JhZ2VSZWFkeSA/IF90KFwicmVhZHlcIikgOiBfdChcIm5vdCByZWFkeVwiKSB9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGV4dHJhRGV0YWlsc1RhYmxlUm93cyB9XG4gICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+PC90YWJsZT5cbiAgICAgICAgICAgICAgICAgICAgeyBleHRyYURldGFpbHMgfVxuICAgICAgICAgICAgICAgIDwvZGV0YWlscz5cbiAgICAgICAgICAgICAgICB7IGFjdGlvblJvdyB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBaUJBOztBQUdBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFlZSxNQUFNQSxpQkFBTixTQUFnQ0MsY0FBQSxDQUFNQyxhQUF0QyxDQUFnRTtFQUczRUMsV0FBVyxDQUFDQyxLQUFELEVBQVk7SUFDbkIsTUFBTUEsS0FBTjtJQURtQixpREFGSCxLQUVHO0lBQUEsb0VBdUNpQkMsaUJBQUQsSUFBcUM7TUFDeEUsS0FBS0MsUUFBTCxDQUFjO1FBQ1ZEO01BRFUsQ0FBZDtJQUdILENBM0NzQjtJQUFBLHlEQTZDSyxNQUFZO01BQ3BDO01BQ0E7TUFDQSxLQUFLRSxnQkFBTDtJQUNILENBakRzQjtJQUFBLHNEQXVIRSxNQUFZO01BQ2pDQyxjQUFBLENBQU1DLGlCQUFOLDhEQUVRLHdFQUZSLEtBSUk7UUFDSUMsVUFBVSxFQUFFLE1BQU07VUFDZCxLQUFLSCxnQkFBTDtRQUNIO01BSEwsQ0FKSixFQVFPLElBUlA7TUFRYTtNQUFpQixLQVI5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