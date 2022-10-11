"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _languageHandler = require("../../../languageHandler");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _RestoreKeyBackupDialog = _interopRequireDefault(require("./security/RestoreKeyBackupDialog"));

var _QuestionDialog = _interopRequireDefault(require("./QuestionDialog"));

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

var _DialogButtons = _interopRequireDefault(require("../elements/DialogButtons"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

class LogoutDialog extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onExportE2eKeysClicked", () => {
      _Modal.default.createDialogAsync(Promise.resolve().then(() => _interopRequireWildcard(require('../../../async-components/views/dialogs/security/ExportE2eKeysDialog'))), {
        matrixClient: _MatrixClientPeg.MatrixClientPeg.get()
      });
    });
    (0, _defineProperty2.default)(this, "onFinished", confirmed => {
      if (confirmed) {
        _dispatcher.default.dispatch({
          action: 'logout'
        });
      } // close dialog


      this.props.onFinished(confirmed);
    });
    (0, _defineProperty2.default)(this, "onSetRecoveryMethodClick", () => {
      if (this.state.backupInfo) {
        // A key backup exists for this account, but the creating device is not
        // verified, so restore the backup which will give us the keys from it and
        // allow us to trust it (ie. upload keys to it)
        _Modal.default.createDialog(_RestoreKeyBackupDialog.default, null, null,
        /* priority = */
        false,
        /* static = */
        true);
      } else {
        _Modal.default.createDialogAsync(Promise.resolve().then(() => _interopRequireWildcard(require("../../../async-components/views/dialogs/security/CreateKeyBackupDialog"))), null, null,
        /* priority = */
        false,
        /* static = */
        true);
      } // close dialog


      this.props.onFinished(true);
    });
    (0, _defineProperty2.default)(this, "onLogoutConfirm", () => {
      _dispatcher.default.dispatch({
        action: 'logout'
      }); // close dialog


      this.props.onFinished(true);
    });

    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const shouldLoadBackupStatus = cli.isCryptoEnabled() && !cli.getKeyBackupEnabled();
    this.state = {
      shouldLoadBackupStatus: shouldLoadBackupStatus,
      loading: shouldLoadBackupStatus,
      backupInfo: null,
      error: null
    };

    if (shouldLoadBackupStatus) {
      this.loadBackupStatus();
    }
  }

  async loadBackupStatus() {
    try {
      const backupInfo = await _MatrixClientPeg.MatrixClientPeg.get().getKeyBackupVersion();
      this.setState({
        loading: false,
        backupInfo
      });
    } catch (e) {
      _logger.logger.log("Unable to fetch key backup status", e);

      this.setState({
        loading: false,
        error: e
      });
    }
  }

  render() {
    if (this.state.shouldLoadBackupStatus) {
      const description = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Encrypted messages are secured with end-to-end encryption. " + "Only you and the recipient(s) have the keys to read these messages.")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("When you sign out, these keys will be deleted from this device, " + "which means you won't be able to read encrypted messages unless you " + "have the keys for them on your other devices, or backed them up to the " + "server.")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Back up your keys before signing out to avoid losing them.")));

      let dialogContent;

      if (this.state.loading) {
        dialogContent = /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
      } else {
        let setupButtonCaption;

        if (this.state.backupInfo) {
          setupButtonCaption = (0, _languageHandler._t)("Connect this session to Key Backup");
        } else {
          // if there's an error fetching the backup info, we'll just assume there's
          // no backup for the purpose of the button caption
          setupButtonCaption = (0, _languageHandler._t)("Start using Key Backup");
        }

        dialogContent = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_Dialog_content",
          id: "mx_Dialog_content"
        }, description), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
          primaryButton: setupButtonCaption,
          hasCancel: false,
          onPrimaryButtonClick: this.onSetRecoveryMethodClick,
          focus: true
        }, /*#__PURE__*/_react.default.createElement("button", {
          onClick: this.onLogoutConfirm
        }, (0, _languageHandler._t)("I don't want my encrypted messages"))), /*#__PURE__*/_react.default.createElement("details", null, /*#__PURE__*/_react.default.createElement("summary", null, (0, _languageHandler._t)("Advanced")), /*#__PURE__*/_react.default.createElement("p", null, /*#__PURE__*/_react.default.createElement("button", {
          onClick: this.onExportE2eKeysClicked
        }, (0, _languageHandler._t)("Manually export keys")))));
      } // Not quite a standard question dialog as the primary button cancels
      // the action and does something else instead, whilst non-default button
      // confirms the action.


      return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
        title: (0, _languageHandler._t)("You'll lose access to your encrypted messages"),
        contentId: "mx_Dialog_content",
        hasCancel: true,
        onFinished: this.onFinished
      }, dialogContent);
    } else {
      return /*#__PURE__*/_react.default.createElement(_QuestionDialog.default, {
        hasCancelButton: true,
        title: (0, _languageHandler._t)("Sign out"),
        description: (0, _languageHandler._t)("Are you sure you want to sign out?"),
        button: (0, _languageHandler._t)("Sign out"),
        onFinished: this.onFinished
      });
    }
  }

}

exports.default = LogoutDialog;
(0, _defineProperty2.default)(LogoutDialog, "defaultProps", {
  onFinished: function () {}
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMb2dvdXREaWFsb2ciLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJNb2RhbCIsImNyZWF0ZURpYWxvZ0FzeW5jIiwibWF0cml4Q2xpZW50IiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiY29uZmlybWVkIiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJvbkZpbmlzaGVkIiwic3RhdGUiLCJiYWNrdXBJbmZvIiwiY3JlYXRlRGlhbG9nIiwiUmVzdG9yZUtleUJhY2t1cERpYWxvZyIsImNsaSIsInNob3VsZExvYWRCYWNrdXBTdGF0dXMiLCJpc0NyeXB0b0VuYWJsZWQiLCJnZXRLZXlCYWNrdXBFbmFibGVkIiwibG9hZGluZyIsImVycm9yIiwibG9hZEJhY2t1cFN0YXR1cyIsImdldEtleUJhY2t1cFZlcnNpb24iLCJzZXRTdGF0ZSIsImUiLCJsb2dnZXIiLCJsb2ciLCJyZW5kZXIiLCJkZXNjcmlwdGlvbiIsIl90IiwiZGlhbG9nQ29udGVudCIsInNldHVwQnV0dG9uQ2FwdGlvbiIsIm9uU2V0UmVjb3ZlcnlNZXRob2RDbGljayIsIm9uTG9nb3V0Q29uZmlybSIsIm9uRXhwb3J0RTJlS2V5c0NsaWNrZWQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL0xvZ291dERpYWxvZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE4LCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAyMCAtIDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgQ29tcG9uZW50VHlwZSB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IElLZXlCYWNrdXBJbmZvIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NyeXB0by9rZXliYWNrdXBcIjtcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcblxuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uLy4uL01vZGFsJztcbmltcG9ydCBkaXMgZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gJy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgUmVzdG9yZUtleUJhY2t1cERpYWxvZyBmcm9tICcuL3NlY3VyaXR5L1Jlc3RvcmVLZXlCYWNrdXBEaWFsb2cnO1xuaW1wb3J0IFF1ZXN0aW9uRGlhbG9nIGZyb20gXCIuL1F1ZXN0aW9uRGlhbG9nXCI7XG5pbXBvcnQgQmFzZURpYWxvZyBmcm9tIFwiLi9CYXNlRGlhbG9nXCI7XG5pbXBvcnQgU3Bpbm5lciBmcm9tIFwiLi4vZWxlbWVudHMvU3Bpbm5lclwiO1xuaW1wb3J0IERpYWxvZ0J1dHRvbnMgZnJvbSBcIi4uL2VsZW1lbnRzL0RpYWxvZ0J1dHRvbnNcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgb25GaW5pc2hlZDogKHN1Y2Nlc3M6IGJvb2xlYW4pID0+IHZvaWQ7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIHNob3VsZExvYWRCYWNrdXBTdGF0dXM6IGJvb2xlYW47XG4gICAgbG9hZGluZzogYm9vbGVhbjtcbiAgICBiYWNrdXBJbmZvOiBJS2V5QmFja3VwSW5mbztcbiAgICBlcnJvcj86IHN0cmluZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTG9nb3V0RGlhbG9nIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgb25GaW5pc2hlZDogZnVuY3Rpb24oKSB7fSxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3Qgc2hvdWxkTG9hZEJhY2t1cFN0YXR1cyA9IGNsaS5pc0NyeXB0b0VuYWJsZWQoKSAmJiAhY2xpLmdldEtleUJhY2t1cEVuYWJsZWQoKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgc2hvdWxkTG9hZEJhY2t1cFN0YXR1czogc2hvdWxkTG9hZEJhY2t1cFN0YXR1cyxcbiAgICAgICAgICAgIGxvYWRpbmc6IHNob3VsZExvYWRCYWNrdXBTdGF0dXMsXG4gICAgICAgICAgICBiYWNrdXBJbmZvOiBudWxsLFxuICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHNob3VsZExvYWRCYWNrdXBTdGF0dXMpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZEJhY2t1cFN0YXR1cygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBsb2FkQmFja3VwU3RhdHVzKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgYmFja3VwSW5mbyA9IGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRLZXlCYWNrdXBWZXJzaW9uKCk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBiYWNrdXBJbmZvLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGxvZ2dlci5sb2coXCJVbmFibGUgdG8gZmV0Y2gga2V5IGJhY2t1cCBzdGF0dXNcIiwgZSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkV4cG9ydEUyZUtleXNDbGlja2VkID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2dBc3luYyhcbiAgICAgICAgICAgIGltcG9ydChcbiAgICAgICAgICAgICAgICAnLi4vLi4vLi4vYXN5bmMtY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL3NlY3VyaXR5L0V4cG9ydEUyZUtleXNEaWFsb2cnXG4gICAgICAgICAgICApIGFzIHVua25vd24gYXMgUHJvbWlzZTxDb21wb25lbnRUeXBlPHt9Pj4sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbWF0cml4Q2xpZW50OiBNYXRyaXhDbGllbnRQZWcuZ2V0KCksXG4gICAgICAgICAgICB9LFxuICAgICAgICApO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRmluaXNoZWQgPSAoY29uZmlybWVkOiBib29sZWFuKTogdm9pZCA9PiB7XG4gICAgICAgIGlmIChjb25maXJtZWQpIHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7IGFjdGlvbjogJ2xvZ291dCcgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gY2xvc2UgZGlhbG9nXG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChjb25maXJtZWQpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uU2V0UmVjb3ZlcnlNZXRob2RDbGljayA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuYmFja3VwSW5mbykge1xuICAgICAgICAgICAgLy8gQSBrZXkgYmFja3VwIGV4aXN0cyBmb3IgdGhpcyBhY2NvdW50LCBidXQgdGhlIGNyZWF0aW5nIGRldmljZSBpcyBub3RcbiAgICAgICAgICAgIC8vIHZlcmlmaWVkLCBzbyByZXN0b3JlIHRoZSBiYWNrdXAgd2hpY2ggd2lsbCBnaXZlIHVzIHRoZSBrZXlzIGZyb20gaXQgYW5kXG4gICAgICAgICAgICAvLyBhbGxvdyB1cyB0byB0cnVzdCBpdCAoaWUuIHVwbG9hZCBrZXlzIHRvIGl0KVxuICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKFJlc3RvcmVLZXlCYWNrdXBEaWFsb2csIG51bGwsIG51bGwsIC8qIHByaW9yaXR5ID0gKi8gZmFsc2UsIC8qIHN0YXRpYyA9ICovIHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nQXN5bmMoXG4gICAgICAgICAgICAgICAgaW1wb3J0KFxuICAgICAgICAgICAgICAgICAgICBcIi4uLy4uLy4uL2FzeW5jLWNvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9zZWN1cml0eS9DcmVhdGVLZXlCYWNrdXBEaWFsb2dcIlxuICAgICAgICAgICAgICAgICkgYXMgdW5rbm93biBhcyBQcm9taXNlPENvbXBvbmVudFR5cGU8e30+PixcbiAgICAgICAgICAgICAgICBudWxsLCBudWxsLCAvKiBwcmlvcml0eSA9ICovIGZhbHNlLCAvKiBzdGF0aWMgPSAqLyB0cnVlLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNsb3NlIGRpYWxvZ1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQodHJ1ZSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Mb2dvdXRDb25maXJtID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246ICdsb2dvdXQnIH0pO1xuXG4gICAgICAgIC8vIGNsb3NlIGRpYWxvZ1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQodHJ1ZSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2hvdWxkTG9hZEJhY2t1cFN0YXR1cykge1xuICAgICAgICAgICAgY29uc3QgZGVzY3JpcHRpb24gPSA8ZGl2PlxuICAgICAgICAgICAgICAgIDxwPnsgX3QoXG4gICAgICAgICAgICAgICAgICAgIFwiRW5jcnlwdGVkIG1lc3NhZ2VzIGFyZSBzZWN1cmVkIHdpdGggZW5kLXRvLWVuZCBlbmNyeXB0aW9uLiBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiT25seSB5b3UgYW5kIHRoZSByZWNpcGllbnQocykgaGF2ZSB0aGUga2V5cyB0byByZWFkIHRoZXNlIG1lc3NhZ2VzLlwiLFxuICAgICAgICAgICAgICAgICkgfTwvcD5cbiAgICAgICAgICAgICAgICA8cD57IF90KFxuICAgICAgICAgICAgICAgICAgICBcIldoZW4geW91IHNpZ24gb3V0LCB0aGVzZSBrZXlzIHdpbGwgYmUgZGVsZXRlZCBmcm9tIHRoaXMgZGV2aWNlLCBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwid2hpY2ggbWVhbnMgeW91IHdvbid0IGJlIGFibGUgdG8gcmVhZCBlbmNyeXB0ZWQgbWVzc2FnZXMgdW5sZXNzIHlvdSBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiaGF2ZSB0aGUga2V5cyBmb3IgdGhlbSBvbiB5b3VyIG90aGVyIGRldmljZXMsIG9yIGJhY2tlZCB0aGVtIHVwIHRvIHRoZSBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwic2VydmVyLlwiLFxuICAgICAgICAgICAgICAgICkgfTwvcD5cbiAgICAgICAgICAgICAgICA8cD57IF90KFwiQmFjayB1cCB5b3VyIGtleXMgYmVmb3JlIHNpZ25pbmcgb3V0IHRvIGF2b2lkIGxvc2luZyB0aGVtLlwiKSB9PC9wPlxuICAgICAgICAgICAgPC9kaXY+O1xuXG4gICAgICAgICAgICBsZXQgZGlhbG9nQ29udGVudDtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmxvYWRpbmcpIHtcbiAgICAgICAgICAgICAgICBkaWFsb2dDb250ZW50ID0gPFNwaW5uZXIgLz47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxldCBzZXR1cEJ1dHRvbkNhcHRpb247XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuYmFja3VwSW5mbykge1xuICAgICAgICAgICAgICAgICAgICBzZXR1cEJ1dHRvbkNhcHRpb24gPSBfdChcIkNvbm5lY3QgdGhpcyBzZXNzaW9uIHRvIEtleSBCYWNrdXBcIik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgdGhlcmUncyBhbiBlcnJvciBmZXRjaGluZyB0aGUgYmFja3VwIGluZm8sIHdlJ2xsIGp1c3QgYXNzdW1lIHRoZXJlJ3NcbiAgICAgICAgICAgICAgICAgICAgLy8gbm8gYmFja3VwIGZvciB0aGUgcHVycG9zZSBvZiB0aGUgYnV0dG9uIGNhcHRpb25cbiAgICAgICAgICAgICAgICAgICAgc2V0dXBCdXR0b25DYXB0aW9uID0gX3QoXCJTdGFydCB1c2luZyBLZXkgQmFja3VwXCIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGRpYWxvZ0NvbnRlbnQgPSA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19jb250ZW50XCIgaWQ9J214X0RpYWxvZ19jb250ZW50Jz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgZGVzY3JpcHRpb24gfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnMgcHJpbWFyeUJ1dHRvbj17c2V0dXBCdXR0b25DYXB0aW9ufVxuICAgICAgICAgICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLm9uU2V0UmVjb3ZlcnlNZXRob2RDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgIGZvY3VzPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMub25Mb2dvdXRDb25maXJtfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiSSBkb24ndCB3YW50IG15IGVuY3J5cHRlZCBtZXNzYWdlc1wiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPC9EaWFsb2dCdXR0b25zPlxuICAgICAgICAgICAgICAgICAgICA8ZGV0YWlscz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzdW1tYXJ5PnsgX3QoXCJBZHZhbmNlZFwiKSB9PC9zdW1tYXJ5PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+PGJ1dHRvbiBvbkNsaWNrPXt0aGlzLm9uRXhwb3J0RTJlS2V5c0NsaWNrZWR9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJNYW51YWxseSBleHBvcnQga2V5c1wiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj48L3A+XG4gICAgICAgICAgICAgICAgICAgIDwvZGV0YWlscz5cbiAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBOb3QgcXVpdGUgYSBzdGFuZGFyZCBxdWVzdGlvbiBkaWFsb2cgYXMgdGhlIHByaW1hcnkgYnV0dG9uIGNhbmNlbHNcbiAgICAgICAgICAgIC8vIHRoZSBhY3Rpb24gYW5kIGRvZXMgc29tZXRoaW5nIGVsc2UgaW5zdGVhZCwgd2hpbHN0IG5vbi1kZWZhdWx0IGJ1dHRvblxuICAgICAgICAgICAgLy8gY29uZmlybXMgdGhlIGFjdGlvbi5cbiAgICAgICAgICAgIHJldHVybiAoPEJhc2VEaWFsb2dcbiAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJZb3UnbGwgbG9zZSBhY2Nlc3MgdG8geW91ciBlbmNyeXB0ZWQgbWVzc2FnZXNcIil9XG4gICAgICAgICAgICAgICAgY29udGVudElkPSdteF9EaWFsb2dfY29udGVudCdcbiAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e3RydWV9XG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgZGlhbG9nQ29udGVudCB9XG4gICAgICAgICAgICA8L0Jhc2VEaWFsb2c+KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAoPFF1ZXN0aW9uRGlhbG9nXG4gICAgICAgICAgICAgICAgaGFzQ2FuY2VsQnV0dG9uPXt0cnVlfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIlNpZ24gb3V0XCIpfVxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uPXtfdChcbiAgICAgICAgICAgICAgICAgICAgXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gc2lnbiBvdXQ/XCIsXG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICBidXR0b249e190KFwiU2lnbiBvdXRcIil9XG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgLz4pO1xuICAgICAgICB9XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWlCQTs7QUFFQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBYWUsTUFBTUEsWUFBTixTQUEyQkMsY0FBQSxDQUFNQyxTQUFqQyxDQUEyRDtFQUt0RUMsV0FBVyxDQUFDQyxLQUFELEVBQVE7SUFDZixNQUFNQSxLQUFOO0lBRGUsOERBa0NjLE1BQVk7TUFDekNDLGNBQUEsQ0FBTUMsaUJBQU4sOERBRVEsc0VBRlIsS0FJSTtRQUNJQyxZQUFZLEVBQUVDLGdDQUFBLENBQWdCQyxHQUFoQjtNQURsQixDQUpKO0lBUUgsQ0EzQ2tCO0lBQUEsa0RBNkNHQyxTQUFELElBQThCO01BQy9DLElBQUlBLFNBQUosRUFBZTtRQUNYQyxtQkFBQSxDQUFJQyxRQUFKLENBQWE7VUFBRUMsTUFBTSxFQUFFO1FBQVYsQ0FBYjtNQUNILENBSDhDLENBSS9DOzs7TUFDQSxLQUFLVCxLQUFMLENBQVdVLFVBQVgsQ0FBc0JKLFNBQXRCO0lBQ0gsQ0FuRGtCO0lBQUEsZ0VBcURnQixNQUFZO01BQzNDLElBQUksS0FBS0ssS0FBTCxDQUFXQyxVQUFmLEVBQTJCO1FBQ3ZCO1FBQ0E7UUFDQTtRQUNBWCxjQUFBLENBQU1ZLFlBQU4sQ0FBbUJDLCtCQUFuQixFQUEyQyxJQUEzQyxFQUFpRCxJQUFqRDtRQUF1RDtRQUFpQixLQUF4RTtRQUErRTtRQUFlLElBQTlGO01BQ0gsQ0FMRCxNQUtPO1FBQ0hiLGNBQUEsQ0FBTUMsaUJBQU4sOERBRVEsd0VBRlIsS0FJSSxJQUpKLEVBSVUsSUFKVjtRQUlnQjtRQUFpQixLQUpqQztRQUl3QztRQUFlLElBSnZEO01BTUgsQ0FiMEMsQ0FlM0M7OztNQUNBLEtBQUtGLEtBQUwsQ0FBV1UsVUFBWCxDQUFzQixJQUF0QjtJQUNILENBdEVrQjtJQUFB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