"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _crypto = require("matrix-js-sdk/src/crypto");

var _QRCode = require("matrix-js-sdk/src/crypto/verification/QRCode");

var _VerificationRequest = require("matrix-js-sdk/src/crypto/verification/request/VerificationRequest");

var _SAS = require("matrix-js-sdk/src/crypto/verification/SAS");

var _logger = require("matrix-js-sdk/src/logger");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _VerificationQRCode = _interopRequireDefault(require("../elements/crypto/VerificationQRCode"));

var _languageHandler = require("../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _E2EIcon = _interopRequireWildcard(require("../rooms/E2EIcon"));

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _VerificationShowSas = _interopRequireDefault(require("../verification/VerificationShowSas"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
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
class VerificationPanel extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "hasVerifier", void 0);
    (0, _defineProperty2.default)(this, "onReciprocateYesClick", () => {
      this.setState({
        reciprocateButtonClicked: true
      });
      this.state.reciprocateQREvent.confirm();
    });
    (0, _defineProperty2.default)(this, "onReciprocateNoClick", () => {
      this.setState({
        reciprocateButtonClicked: true
      });
      this.state.reciprocateQREvent.cancel();
    });
    (0, _defineProperty2.default)(this, "startSAS", async () => {
      this.setState({
        emojiButtonClicked: true
      });
      const verifier = this.props.request.beginKeyVerification(_crypto.verificationMethods.SAS);

      try {
        await verifier.verify();
      } catch (err) {
        _logger.logger.error(err);
      }
    });
    (0, _defineProperty2.default)(this, "onSasMatchesClick", () => {
      this.state.sasEvent.confirm();
    });
    (0, _defineProperty2.default)(this, "onSasMismatchesClick", () => {
      this.state.sasEvent.mismatch();
    });
    (0, _defineProperty2.default)(this, "updateVerifierState", () => {
      const {
        request
      } = this.props;
      const sasEvent = request.verifier.sasEvent;
      const reciprocateQREvent = request.verifier.reciprocateQREvent;
      request.verifier.off(_SAS.SasEvent.ShowSas, this.updateVerifierState);
      request.verifier.off(_QRCode.QrCodeEvent.ShowReciprocateQr, this.updateVerifierState);
      this.setState({
        sasEvent,
        reciprocateQREvent
      });
    });
    (0, _defineProperty2.default)(this, "onRequestChange", async () => {
      const {
        request
      } = this.props;
      const hadVerifier = this.hasVerifier;
      this.hasVerifier = !!request.verifier;

      if (!hadVerifier && this.hasVerifier) {
        request.verifier.on(_SAS.SasEvent.ShowSas, this.updateVerifierState);
        request.verifier.on(_QRCode.QrCodeEvent.ShowReciprocateQr, this.updateVerifierState);

        try {
          // on the requester side, this is also awaited in startSAS,
          // but that's ok as verify should return the same promise.
          await request.verifier.verify();
        } catch (err) {
          _logger.logger.error("error verify", err);
        }
      }
    });
    this.state = {};
    this.hasVerifier = false;
  }

  renderQRPhase() {
    const {
      member,
      request
    } = this.props;
    const showSAS = request.otherPartySupportsMethod(_crypto.verificationMethods.SAS);
    const showQR = request.otherPartySupportsMethod(_QRCode.SCAN_QR_CODE_METHOD);

    const brand = _SdkConfig.default.get().brand;

    const noCommonMethodError = !showSAS && !showQR ? /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("The device you are trying to verify doesn't support scanning a " + "QR code or emoji verification, which is what %(brand)s supports. Try " + "with a different client.", {
      brand
    })) : null;

    if (this.props.layout === 'dialog') {
      // HACK: This is a terrible idea.
      let qrBlockDialog;
      let sasBlockDialog;

      if (showQR) {
        qrBlockDialog = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_VerificationPanel_QRPhase_startOption"
        }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Scan this unique code")), /*#__PURE__*/_react.default.createElement(_VerificationQRCode.default, {
          qrCodeData: request.qrCodeData
        }));
      }

      if (showSAS) {
        sasBlockDialog = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_VerificationPanel_QRPhase_startOption"
        }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Compare unique emoji")), /*#__PURE__*/_react.default.createElement("span", {
          className: "mx_VerificationPanel_QRPhase_helpText"
        }, (0, _languageHandler._t)("Compare a unique set of emoji if you don't have a camera on either device")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          disabled: this.state.emojiButtonClicked,
          onClick: this.startSAS,
          kind: "primary"
        }, (0, _languageHandler._t)("Start")));
      }

      const or = qrBlockDialog && sasBlockDialog ? /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_VerificationPanel_QRPhase_betweenText"
      }, (0, _languageHandler._t)("or")) : null;
      return /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Verify this device by completing one of the following:"), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_VerificationPanel_QRPhase_startOptions"
      }, qrBlockDialog, or, sasBlockDialog, noCommonMethodError));
    }

    let qrBlock;

    if (showQR) {
      qrBlock = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_UserInfo_container"
      }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Verify by scanning")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Ask %(displayName)s to scan your code:", {
        displayName: member.displayName || member.name || member.userId
      })), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_VerificationPanel_qrCode"
      }, /*#__PURE__*/_react.default.createElement(_VerificationQRCode.default, {
        qrCodeData: request.qrCodeData
      })));
    }

    let sasBlock;

    if (showSAS) {
      const disabled = this.state.emojiButtonClicked;
      const sasLabel = showQR ? (0, _languageHandler._t)("If you can't scan the code above, verify by comparing unique emoji.") : (0, _languageHandler._t)("Verify by comparing unique emoji."); // Note: mx_VerificationPanel_verifyByEmojiButton is for the end-to-end tests

      sasBlock = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_UserInfo_container"
      }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Verify by emoji")), /*#__PURE__*/_react.default.createElement("p", null, sasLabel), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        disabled: disabled,
        kind: "primary",
        className: "mx_UserInfo_wideButton mx_VerificationPanel_verifyByEmojiButton",
        onClick: this.startSAS
      }, (0, _languageHandler._t)("Verify by emoji")));
    }

    const noCommonMethodBlock = noCommonMethodError ? /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UserInfo_container"
    }, noCommonMethodError) : null; // TODO: add way to open camera to scan a QR code

    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, qrBlock, sasBlock, noCommonMethodBlock);
  }

  getDevice() {
    const deviceId = this.props.request && this.props.request.channel.deviceId;
    return _MatrixClientPeg.MatrixClientPeg.get().getStoredDevice(_MatrixClientPeg.MatrixClientPeg.get().getUserId(), deviceId);
  }

  renderQRReciprocatePhase() {
    const {
      member,
      request
    } = this.props;
    const description = request.isSelfVerification ? (0, _languageHandler._t)("Almost there! Is your other device showing the same shield?") : (0, _languageHandler._t)("Almost there! Is %(displayName)s showing the same shield?", {
      displayName: member.displayName || member.name || member.userId
    });
    let body;

    if (this.state.reciprocateQREvent) {
      // Element Web doesn't support scanning yet, so assume here we're the client being scanned.
      body = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("p", null, description), /*#__PURE__*/_react.default.createElement(_E2EIcon.default, {
        isUser: true,
        status: _E2EIcon.E2EState.Verified,
        size: 128,
        hideTooltip: true
      }), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_VerificationPanel_reciprocateButtons"
      }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "danger",
        disabled: this.state.reciprocateButtonClicked,
        onClick: this.onReciprocateNoClick
      }, (0, _languageHandler._t)("No")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "primary",
        disabled: this.state.reciprocateButtonClicked,
        onClick: this.onReciprocateYesClick
      }, (0, _languageHandler._t)("Yes"))));
    } else {
      body = /*#__PURE__*/_react.default.createElement("p", null, /*#__PURE__*/_react.default.createElement(_Spinner.default, null));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UserInfo_container mx_VerificationPanel_reciprocate_section"
    }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Verify by scanning")), body);
  }

  renderVerifiedPhase() {
    const {
      member,
      request
    } = this.props;
    let text;

    if (!request.isSelfVerification) {
      if (this.props.isRoomEncrypted) {
        text = (0, _languageHandler._t)("Verify all users in a room to ensure it's secure.");
      } else {
        text = (0, _languageHandler._t)("In encrypted rooms, verify all users to ensure it's secure.");
      }
    }

    let description;

    if (request.isSelfVerification) {
      const device = this.getDevice();

      if (!device) {
        // This can happen if the device is logged out while we're still showing verification
        // UI for it.
        _logger.logger.warn("Verified device we don't know about: " + this.props.request.channel.deviceId);

        description = (0, _languageHandler._t)("You've successfully verified your device!");
      } else {
        description = (0, _languageHandler._t)("You've successfully verified %(deviceName)s (%(deviceId)s)!", {
          deviceName: device ? device.getDisplayName() : '',
          deviceId: this.props.request.channel.deviceId
        });
      }
    } else {
      description = (0, _languageHandler._t)("You've successfully verified %(displayName)s!", {
        displayName: member.displayName || member.name || member.userId
      });
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UserInfo_container mx_VerificationPanel_verified_section"
    }, /*#__PURE__*/_react.default.createElement("p", null, description), /*#__PURE__*/_react.default.createElement(_E2EIcon.default, {
      isUser: true,
      status: _E2EIcon.E2EState.Verified,
      size: 128,
      hideTooltip: true
    }), text ? /*#__PURE__*/_react.default.createElement("p", null, text) : null, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "primary",
      className: "mx_UserInfo_wideButton",
      onClick: this.props.onClose
    }, (0, _languageHandler._t)("Got it")));
  }

  renderCancelledPhase() {
    const {
      member,
      request
    } = this.props;
    let startAgainInstruction;

    if (request.isSelfVerification) {
      startAgainInstruction = (0, _languageHandler._t)("Start verification again from the notification.");
    } else {
      startAgainInstruction = (0, _languageHandler._t)("Start verification again from their profile.");
    }

    let text;

    if (request.cancellationCode === "m.timeout") {
      text = (0, _languageHandler._t)("Verification timed out.") + ` ${startAgainInstruction}`;
    } else if (request.cancellingUserId === request.otherUserId) {
      if (request.isSelfVerification) {
        text = (0, _languageHandler._t)("You cancelled verification on your other device.");
      } else {
        text = (0, _languageHandler._t)("%(displayName)s cancelled verification.", {
          displayName: member.displayName || member.name || member.userId
        });
      }

      text = `${text} ${startAgainInstruction}`;
    } else {
      text = (0, _languageHandler._t)("You cancelled verification.") + ` ${startAgainInstruction}`;
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UserInfo_container"
    }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Verification cancelled")), /*#__PURE__*/_react.default.createElement("p", null, text), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "primary",
      className: "mx_UserInfo_wideButton",
      onClick: this.props.onClose
    }, (0, _languageHandler._t)("Got it")));
  }

  render() {
    const {
      member,
      phase,
      request
    } = this.props;
    const displayName = member.displayName || member.name || member.userId;

    switch (phase) {
      case _VerificationRequest.Phase.Ready:
        return this.renderQRPhase();

      case _VerificationRequest.Phase.Started:
        switch (request.chosenMethod) {
          case _crypto.verificationMethods.RECIPROCATE_QR_CODE:
            return this.renderQRReciprocatePhase();

          case _crypto.verificationMethods.SAS:
            {
              const emojis = this.state.sasEvent ? /*#__PURE__*/_react.default.createElement(_VerificationShowSas.default, {
                displayName: displayName,
                device: this.getDevice(),
                sas: this.state.sasEvent.sas,
                onCancel: this.onSasMismatchesClick,
                onDone: this.onSasMatchesClick,
                inDialog: this.props.inDialog,
                isSelf: request.isSelfVerification
              }) : /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
              return /*#__PURE__*/_react.default.createElement("div", {
                className: "mx_UserInfo_container"
              }, emojis);
            }

          default:
            return null;
        }

      case _VerificationRequest.Phase.Done:
        return this.renderVerifiedPhase();

      case _VerificationRequest.Phase.Cancelled:
        return this.renderCancelledPhase();
    }

    _logger.logger.error("VerificationPanel unhandled phase:", phase);

    return null;
  }

  componentDidMount() {
    const {
      request
    } = this.props;
    request.on(_VerificationRequest.VerificationRequestEvent.Change, this.onRequestChange);

    if (request.verifier) {
      const sasEvent = request.verifier.sasEvent;
      const reciprocateQREvent = request.verifier.reciprocateQREvent;
      this.setState({
        sasEvent,
        reciprocateQREvent
      });
    }

    this.onRequestChange();
  }

  componentWillUnmount() {
    const {
      request
    } = this.props;

    if (request.verifier) {
      request.verifier.off(_SAS.SasEvent.ShowSas, this.updateVerifierState);
      request.verifier.off(_QRCode.QrCodeEvent.ShowReciprocateQr, this.updateVerifierState);
    }

    request.off(_VerificationRequest.VerificationRequestEvent.Change, this.onRequestChange);
  }

}

exports.default = VerificationPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWZXJpZmljYXRpb25QYW5lbCIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJzZXRTdGF0ZSIsInJlY2lwcm9jYXRlQnV0dG9uQ2xpY2tlZCIsInN0YXRlIiwicmVjaXByb2NhdGVRUkV2ZW50IiwiY29uZmlybSIsImNhbmNlbCIsImVtb2ppQnV0dG9uQ2xpY2tlZCIsInZlcmlmaWVyIiwicmVxdWVzdCIsImJlZ2luS2V5VmVyaWZpY2F0aW9uIiwidmVyaWZpY2F0aW9uTWV0aG9kcyIsIlNBUyIsInZlcmlmeSIsImVyciIsImxvZ2dlciIsImVycm9yIiwic2FzRXZlbnQiLCJtaXNtYXRjaCIsIm9mZiIsIlNhc0V2ZW50IiwiU2hvd1NhcyIsInVwZGF0ZVZlcmlmaWVyU3RhdGUiLCJRckNvZGVFdmVudCIsIlNob3dSZWNpcHJvY2F0ZVFyIiwiaGFkVmVyaWZpZXIiLCJoYXNWZXJpZmllciIsIm9uIiwicmVuZGVyUVJQaGFzZSIsIm1lbWJlciIsInNob3dTQVMiLCJvdGhlclBhcnR5U3VwcG9ydHNNZXRob2QiLCJzaG93UVIiLCJTQ0FOX1FSX0NPREVfTUVUSE9EIiwiYnJhbmQiLCJTZGtDb25maWciLCJnZXQiLCJub0NvbW1vbk1ldGhvZEVycm9yIiwiX3QiLCJsYXlvdXQiLCJxckJsb2NrRGlhbG9nIiwic2FzQmxvY2tEaWFsb2ciLCJxckNvZGVEYXRhIiwic3RhcnRTQVMiLCJvciIsInFyQmxvY2siLCJkaXNwbGF5TmFtZSIsIm5hbWUiLCJ1c2VySWQiLCJzYXNCbG9jayIsImRpc2FibGVkIiwic2FzTGFiZWwiLCJub0NvbW1vbk1ldGhvZEJsb2NrIiwiZ2V0RGV2aWNlIiwiZGV2aWNlSWQiLCJjaGFubmVsIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0U3RvcmVkRGV2aWNlIiwiZ2V0VXNlcklkIiwicmVuZGVyUVJSZWNpcHJvY2F0ZVBoYXNlIiwiZGVzY3JpcHRpb24iLCJpc1NlbGZWZXJpZmljYXRpb24iLCJib2R5IiwiRTJFU3RhdGUiLCJWZXJpZmllZCIsIm9uUmVjaXByb2NhdGVOb0NsaWNrIiwib25SZWNpcHJvY2F0ZVllc0NsaWNrIiwicmVuZGVyVmVyaWZpZWRQaGFzZSIsInRleHQiLCJpc1Jvb21FbmNyeXB0ZWQiLCJkZXZpY2UiLCJ3YXJuIiwiZGV2aWNlTmFtZSIsImdldERpc3BsYXlOYW1lIiwib25DbG9zZSIsInJlbmRlckNhbmNlbGxlZFBoYXNlIiwic3RhcnRBZ2Fpbkluc3RydWN0aW9uIiwiY2FuY2VsbGF0aW9uQ29kZSIsImNhbmNlbGxpbmdVc2VySWQiLCJvdGhlclVzZXJJZCIsInJlbmRlciIsInBoYXNlIiwiUGhhc2UiLCJSZWFkeSIsIlN0YXJ0ZWQiLCJjaG9zZW5NZXRob2QiLCJSRUNJUFJPQ0FURV9RUl9DT0RFIiwiZW1vamlzIiwic2FzIiwib25TYXNNaXNtYXRjaGVzQ2xpY2siLCJvblNhc01hdGNoZXNDbGljayIsImluRGlhbG9nIiwiRG9uZSIsIkNhbmNlbGxlZCIsImNvbXBvbmVudERpZE1vdW50IiwiVmVyaWZpY2F0aW9uUmVxdWVzdEV2ZW50IiwiQ2hhbmdlIiwib25SZXF1ZXN0Q2hhbmdlIiwiY29tcG9uZW50V2lsbFVubW91bnQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9yaWdodF9wYW5lbC9WZXJpZmljYXRpb25QYW5lbC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5LCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgdmVyaWZpY2F0aW9uTWV0aG9kcyB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL2NyeXB0byc7XG5pbXBvcnQgeyBRckNvZGVFdmVudCwgUmVjaXByb2NhdGVRUkNvZGUsIFNDQU5fUVJfQ09ERV9NRVRIT0QgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY3J5cHRvL3ZlcmlmaWNhdGlvbi9RUkNvZGVcIjtcbmltcG9ydCB7XG4gICAgUGhhc2UsXG4gICAgVmVyaWZpY2F0aW9uUmVxdWVzdCxcbiAgICBWZXJpZmljYXRpb25SZXF1ZXN0RXZlbnQsXG59IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jcnlwdG8vdmVyaWZpY2F0aW9uL3JlcXVlc3QvVmVyaWZpY2F0aW9uUmVxdWVzdFwiO1xuaW1wb3J0IHsgUm9vbU1lbWJlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbS1tZW1iZXJcIjtcbmltcG9ydCB7IFVzZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3VzZXJcIjtcbmltcG9ydCB7IFNBUywgU2FzRXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY3J5cHRvL3ZlcmlmaWNhdGlvbi9TQVNcIjtcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcblxuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSBcIi4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IFZlcmlmaWNhdGlvblFSQ29kZSBmcm9tIFwiLi4vZWxlbWVudHMvY3J5cHRvL1ZlcmlmaWNhdGlvblFSQ29kZVwiO1xuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuLi8uLi8uLi9TZGtDb25maWdcIjtcbmltcG9ydCBFMkVJY29uLCB7IEUyRVN0YXRlIH0gZnJvbSBcIi4uL3Jvb21zL0UyRUljb25cIjtcbmltcG9ydCBTcGlubmVyIGZyb20gXCIuLi9lbGVtZW50cy9TcGlubmVyXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IFZlcmlmaWNhdGlvblNob3dTYXMgZnJvbSBcIi4uL3ZlcmlmaWNhdGlvbi9WZXJpZmljYXRpb25TaG93U2FzXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIGxheW91dDogc3RyaW5nO1xuICAgIHJlcXVlc3Q6IFZlcmlmaWNhdGlvblJlcXVlc3Q7XG4gICAgbWVtYmVyOiBSb29tTWVtYmVyIHwgVXNlcjtcbiAgICBwaGFzZTogUGhhc2U7XG4gICAgb25DbG9zZTogKCkgPT4gdm9pZDtcbiAgICBpc1Jvb21FbmNyeXB0ZWQ6IGJvb2xlYW47XG4gICAgaW5EaWFsb2c6IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIHNhc0V2ZW50PzogU0FTW1wic2FzRXZlbnRcIl07XG4gICAgZW1vamlCdXR0b25DbGlja2VkPzogYm9vbGVhbjtcbiAgICByZWNpcHJvY2F0ZUJ1dHRvbkNsaWNrZWQ/OiBib29sZWFuO1xuICAgIHJlY2lwcm9jYXRlUVJFdmVudD86IFJlY2lwcm9jYXRlUVJDb2RlW1wicmVjaXByb2NhdGVRUkV2ZW50XCJdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWZXJpZmljYXRpb25QYW5lbCBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIGhhc1ZlcmlmaWVyOiBib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7fTtcbiAgICAgICAgdGhpcy5oYXNWZXJpZmllciA9IGZhbHNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyUVJQaGFzZSgpIHtcbiAgICAgICAgY29uc3QgeyBtZW1iZXIsIHJlcXVlc3QgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGNvbnN0IHNob3dTQVM6IGJvb2xlYW4gPSByZXF1ZXN0Lm90aGVyUGFydHlTdXBwb3J0c01ldGhvZCh2ZXJpZmljYXRpb25NZXRob2RzLlNBUyk7XG4gICAgICAgIGNvbnN0IHNob3dRUjogYm9vbGVhbiA9IHJlcXVlc3Qub3RoZXJQYXJ0eVN1cHBvcnRzTWV0aG9kKFNDQU5fUVJfQ09ERV9NRVRIT0QpO1xuICAgICAgICBjb25zdCBicmFuZCA9IFNka0NvbmZpZy5nZXQoKS5icmFuZDtcblxuICAgICAgICBjb25zdCBub0NvbW1vbk1ldGhvZEVycm9yOiBKU1guRWxlbWVudCA9ICFzaG93U0FTICYmICFzaG93UVIgP1xuICAgICAgICAgICAgPHA+eyBfdChcbiAgICAgICAgICAgICAgICBcIlRoZSBkZXZpY2UgeW91IGFyZSB0cnlpbmcgdG8gdmVyaWZ5IGRvZXNuJ3Qgc3VwcG9ydCBzY2FubmluZyBhIFwiICtcbiAgICAgICAgICAgICAgICBcIlFSIGNvZGUgb3IgZW1vamkgdmVyaWZpY2F0aW9uLCB3aGljaCBpcyB3aGF0ICUoYnJhbmQpcyBzdXBwb3J0cy4gVHJ5IFwiICtcbiAgICAgICAgICAgICAgICBcIndpdGggYSBkaWZmZXJlbnQgY2xpZW50LlwiLFxuICAgICAgICAgICAgICAgIHsgYnJhbmQgfSxcbiAgICAgICAgICAgICkgfTwvcD4gOlxuICAgICAgICAgICAgbnVsbDtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5sYXlvdXQgPT09ICdkaWFsb2cnKSB7XG4gICAgICAgICAgICAvLyBIQUNLOiBUaGlzIGlzIGEgdGVycmlibGUgaWRlYS5cbiAgICAgICAgICAgIGxldCBxckJsb2NrRGlhbG9nOiBKU1guRWxlbWVudDtcbiAgICAgICAgICAgIGxldCBzYXNCbG9ja0RpYWxvZzogSlNYLkVsZW1lbnQ7XG4gICAgICAgICAgICBpZiAoc2hvd1FSKSB7XG4gICAgICAgICAgICAgICAgcXJCbG9ja0RpYWxvZyA9XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9WZXJpZmljYXRpb25QYW5lbF9RUlBoYXNlX3N0YXJ0T3B0aW9uJz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPnsgX3QoXCJTY2FuIHRoaXMgdW5pcXVlIGNvZGVcIikgfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxWZXJpZmljYXRpb25RUkNvZGUgcXJDb2RlRGF0YT17cmVxdWVzdC5xckNvZGVEYXRhfSAvPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2hvd1NBUykge1xuICAgICAgICAgICAgICAgIHNhc0Jsb2NrRGlhbG9nID0gPGRpdiBjbGFzc05hbWU9J214X1ZlcmlmaWNhdGlvblBhbmVsX1FSUGhhc2Vfc3RhcnRPcHRpb24nPlxuICAgICAgICAgICAgICAgICAgICA8cD57IF90KFwiQ29tcGFyZSB1bmlxdWUgZW1vamlcIikgfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdteF9WZXJpZmljYXRpb25QYW5lbF9RUlBoYXNlX2hlbHBUZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJDb21wYXJlIGEgdW5pcXVlIHNldCBvZiBlbW9qaSBpZiB5b3UgZG9uJ3QgaGF2ZSBhIGNhbWVyYSBvbiBlaXRoZXIgZGV2aWNlXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBkaXNhYmxlZD17dGhpcy5zdGF0ZS5lbW9qaUJ1dHRvbkNsaWNrZWR9IG9uQ2xpY2s9e3RoaXMuc3RhcnRTQVN9IGtpbmQ9J3ByaW1hcnknPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIlN0YXJ0XCIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG9yID0gcXJCbG9ja0RpYWxvZyAmJiBzYXNCbG9ja0RpYWxvZyA/XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1ZlcmlmaWNhdGlvblBhbmVsX1FSUGhhc2VfYmV0d2VlblRleHQnPnsgX3QoXCJvclwiKSB9PC9kaXY+IDogbnVsbDtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIlZlcmlmeSB0aGlzIGRldmljZSBieSBjb21wbGV0aW5nIG9uZSBvZiB0aGUgZm9sbG93aW5nOlwiKSB9XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9WZXJpZmljYXRpb25QYW5lbF9RUlBoYXNlX3N0YXJ0T3B0aW9ucyc+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHFyQmxvY2tEaWFsb2cgfVxuICAgICAgICAgICAgICAgICAgICAgICAgeyBvciB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHNhc0Jsb2NrRGlhbG9nIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbm9Db21tb25NZXRob2RFcnJvciB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBxckJsb2NrOiBKU1guRWxlbWVudDtcbiAgICAgICAgaWYgKHNob3dRUikge1xuICAgICAgICAgICAgcXJCbG9jayA9IDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlckluZm9fY29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgPGgzPnsgX3QoXCJWZXJpZnkgYnkgc2Nhbm5pbmdcIikgfTwvaDM+XG4gICAgICAgICAgICAgICAgPHA+eyBfdChcIkFzayAlKGRpc3BsYXlOYW1lKXMgdG8gc2NhbiB5b3VyIGNvZGU6XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IChtZW1iZXIgYXMgVXNlcikuZGlzcGxheU5hbWUgfHwgKG1lbWJlciBhcyBSb29tTWVtYmVyKS5uYW1lIHx8IG1lbWJlci51c2VySWQsXG4gICAgICAgICAgICAgICAgfSkgfTwvcD5cblxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVmVyaWZpY2F0aW9uUGFuZWxfcXJDb2RlXCI+XG4gICAgICAgICAgICAgICAgICAgIDxWZXJpZmljYXRpb25RUkNvZGUgcXJDb2RlRGF0YT17cmVxdWVzdC5xckNvZGVEYXRhfSAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHNhc0Jsb2NrOiBKU1guRWxlbWVudDtcbiAgICAgICAgaWYgKHNob3dTQVMpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpc2FibGVkID0gdGhpcy5zdGF0ZS5lbW9qaUJ1dHRvbkNsaWNrZWQ7XG4gICAgICAgICAgICBjb25zdCBzYXNMYWJlbCA9IHNob3dRUiA/XG4gICAgICAgICAgICAgICAgX3QoXCJJZiB5b3UgY2FuJ3Qgc2NhbiB0aGUgY29kZSBhYm92ZSwgdmVyaWZ5IGJ5IGNvbXBhcmluZyB1bmlxdWUgZW1vamkuXCIpIDpcbiAgICAgICAgICAgICAgICBfdChcIlZlcmlmeSBieSBjb21wYXJpbmcgdW5pcXVlIGVtb2ppLlwiKTtcblxuICAgICAgICAgICAgLy8gTm90ZTogbXhfVmVyaWZpY2F0aW9uUGFuZWxfdmVyaWZ5QnlFbW9qaUJ1dHRvbiBpcyBmb3IgdGhlIGVuZC10by1lbmQgdGVzdHNcbiAgICAgICAgICAgIHNhc0Jsb2NrID0gPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19jb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICA8aDM+eyBfdChcIlZlcmlmeSBieSBlbW9qaVwiKSB9PC9oMz5cbiAgICAgICAgICAgICAgICA8cD57IHNhc0xhYmVsIH08L3A+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2Rpc2FibGVkfVxuICAgICAgICAgICAgICAgICAgICBraW5kPVwicHJpbWFyeVwiXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX3dpZGVCdXR0b24gbXhfVmVyaWZpY2F0aW9uUGFuZWxfdmVyaWZ5QnlFbW9qaUJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuc3RhcnRTQVN9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiVmVyaWZ5IGJ5IGVtb2ppXCIpIH1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBub0NvbW1vbk1ldGhvZEJsb2NrID0gbm9Db21tb25NZXRob2RFcnJvciA/XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2NvbnRhaW5lclwiPnsgbm9Db21tb25NZXRob2RFcnJvciB9PC9kaXY+IDpcbiAgICAgICAgICAgIG51bGw7XG5cbiAgICAgICAgLy8gVE9ETzogYWRkIHdheSB0byBvcGVuIGNhbWVyYSB0byBzY2FuIGEgUVIgY29kZVxuICAgICAgICByZXR1cm4gPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgeyBxckJsb2NrIH1cbiAgICAgICAgICAgIHsgc2FzQmxvY2sgfVxuICAgICAgICAgICAgeyBub0NvbW1vbk1ldGhvZEJsb2NrIH1cbiAgICAgICAgPC9SZWFjdC5GcmFnbWVudD47XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblJlY2lwcm9jYXRlWWVzQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyByZWNpcHJvY2F0ZUJ1dHRvbkNsaWNrZWQ6IHRydWUgfSk7XG4gICAgICAgIHRoaXMuc3RhdGUucmVjaXByb2NhdGVRUkV2ZW50LmNvbmZpcm0oKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJlY2lwcm9jYXRlTm9DbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHJlY2lwcm9jYXRlQnV0dG9uQ2xpY2tlZDogdHJ1ZSB9KTtcbiAgICAgICAgdGhpcy5zdGF0ZS5yZWNpcHJvY2F0ZVFSRXZlbnQuY2FuY2VsKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgZ2V0RGV2aWNlKCkge1xuICAgICAgICBjb25zdCBkZXZpY2VJZCA9IHRoaXMucHJvcHMucmVxdWVzdCAmJiB0aGlzLnByb3BzLnJlcXVlc3QuY2hhbm5lbC5kZXZpY2VJZDtcbiAgICAgICAgcmV0dXJuIE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRTdG9yZWREZXZpY2UoTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpLCBkZXZpY2VJZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJRUlJlY2lwcm9jYXRlUGhhc2UoKSB7XG4gICAgICAgIGNvbnN0IHsgbWVtYmVyLCByZXF1ZXN0IH0gPSB0aGlzLnByb3BzO1xuICAgICAgICBjb25zdCBkZXNjcmlwdGlvbiA9IHJlcXVlc3QuaXNTZWxmVmVyaWZpY2F0aW9uID9cbiAgICAgICAgICAgIF90KFwiQWxtb3N0IHRoZXJlISBJcyB5b3VyIG90aGVyIGRldmljZSBzaG93aW5nIHRoZSBzYW1lIHNoaWVsZD9cIikgOlxuICAgICAgICAgICAgX3QoXCJBbG1vc3QgdGhlcmUhIElzICUoZGlzcGxheU5hbWUpcyBzaG93aW5nIHRoZSBzYW1lIHNoaWVsZD9cIiwge1xuICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lOiAobWVtYmVyIGFzIFVzZXIpLmRpc3BsYXlOYW1lIHx8IChtZW1iZXIgYXMgUm9vbU1lbWJlcikubmFtZSB8fCBtZW1iZXIudXNlcklkLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIGxldCBib2R5OiBKU1guRWxlbWVudDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucmVjaXByb2NhdGVRUkV2ZW50KSB7XG4gICAgICAgICAgICAvLyBFbGVtZW50IFdlYiBkb2Vzbid0IHN1cHBvcnQgc2Nhbm5pbmcgeWV0LCBzbyBhc3N1bWUgaGVyZSB3ZSdyZSB0aGUgY2xpZW50IGJlaW5nIHNjYW5uZWQuXG4gICAgICAgICAgICBib2R5ID0gPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgICAgIDxwPnsgZGVzY3JpcHRpb24gfTwvcD5cbiAgICAgICAgICAgICAgICA8RTJFSWNvbiBpc1VzZXI9e3RydWV9IHN0YXR1cz17RTJFU3RhdGUuVmVyaWZpZWR9IHNpemU9ezEyOH0gaGlkZVRvb2x0aXA9e3RydWV9IC8+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9WZXJpZmljYXRpb25QYW5lbF9yZWNpcHJvY2F0ZUJ1dHRvbnNcIj5cbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJkYW5nZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUucmVjaXByb2NhdGVCdXR0b25DbGlja2VkfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblJlY2lwcm9jYXRlTm9DbGlja31cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIk5vXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAga2luZD1cInByaW1hcnlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUucmVjaXByb2NhdGVCdXR0b25DbGlja2VkfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblJlY2lwcm9jYXRlWWVzQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJZZXNcIikgfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50PjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJvZHkgPSA8cD48U3Bpbm5lciAvPjwvcD47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlckluZm9fY29udGFpbmVyIG14X1ZlcmlmaWNhdGlvblBhbmVsX3JlY2lwcm9jYXRlX3NlY3Rpb25cIj5cbiAgICAgICAgICAgIDxoMz57IF90KFwiVmVyaWZ5IGJ5IHNjYW5uaW5nXCIpIH08L2gzPlxuICAgICAgICAgICAgeyBib2R5IH1cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyVmVyaWZpZWRQaGFzZSgpIHtcbiAgICAgICAgY29uc3QgeyBtZW1iZXIsIHJlcXVlc3QgfSA9IHRoaXMucHJvcHM7XG5cbiAgICAgICAgbGV0IHRleHQ6IHN0cmluZztcbiAgICAgICAgaWYgKCFyZXF1ZXN0LmlzU2VsZlZlcmlmaWNhdGlvbikge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuaXNSb29tRW5jcnlwdGVkKSB7XG4gICAgICAgICAgICAgICAgdGV4dCA9IF90KFwiVmVyaWZ5IGFsbCB1c2VycyBpbiBhIHJvb20gdG8gZW5zdXJlIGl0J3Mgc2VjdXJlLlwiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGV4dCA9IF90KFwiSW4gZW5jcnlwdGVkIHJvb21zLCB2ZXJpZnkgYWxsIHVzZXJzIHRvIGVuc3VyZSBpdCdzIHNlY3VyZS5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZGVzY3JpcHRpb246IHN0cmluZztcbiAgICAgICAgaWYgKHJlcXVlc3QuaXNTZWxmVmVyaWZpY2F0aW9uKSB7XG4gICAgICAgICAgICBjb25zdCBkZXZpY2UgPSB0aGlzLmdldERldmljZSgpO1xuICAgICAgICAgICAgaWYgKCFkZXZpY2UpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIGNhbiBoYXBwZW4gaWYgdGhlIGRldmljZSBpcyBsb2dnZWQgb3V0IHdoaWxlIHdlJ3JlIHN0aWxsIHNob3dpbmcgdmVyaWZpY2F0aW9uXG4gICAgICAgICAgICAgICAgLy8gVUkgZm9yIGl0LlxuICAgICAgICAgICAgICAgIGxvZ2dlci53YXJuKFwiVmVyaWZpZWQgZGV2aWNlIHdlIGRvbid0IGtub3cgYWJvdXQ6IFwiICsgdGhpcy5wcm9wcy5yZXF1ZXN0LmNoYW5uZWwuZGV2aWNlSWQpO1xuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gX3QoXCJZb3UndmUgc3VjY2Vzc2Z1bGx5IHZlcmlmaWVkIHlvdXIgZGV2aWNlIVwiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb24gPSBfdChcIllvdSd2ZSBzdWNjZXNzZnVsbHkgdmVyaWZpZWQgJShkZXZpY2VOYW1lKXMgKCUoZGV2aWNlSWQpcykhXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgZGV2aWNlTmFtZTogZGV2aWNlID8gZGV2aWNlLmdldERpc3BsYXlOYW1lKCkgOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgZGV2aWNlSWQ6IHRoaXMucHJvcHMucmVxdWVzdC5jaGFubmVsLmRldmljZUlkLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVzY3JpcHRpb24gPSBfdChcIllvdSd2ZSBzdWNjZXNzZnVsbHkgdmVyaWZpZWQgJShkaXNwbGF5TmFtZSlzIVwiLCB7XG4gICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IChtZW1iZXIgYXMgVXNlcikuZGlzcGxheU5hbWUgfHwgKG1lbWJlciBhcyBSb29tTWVtYmVyKS5uYW1lIHx8IG1lbWJlci51c2VySWQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2NvbnRhaW5lciBteF9WZXJpZmljYXRpb25QYW5lbF92ZXJpZmllZF9zZWN0aW9uXCI+XG4gICAgICAgICAgICAgICAgPHA+eyBkZXNjcmlwdGlvbiB9PC9wPlxuICAgICAgICAgICAgICAgIDxFMkVJY29uIGlzVXNlcj17dHJ1ZX0gc3RhdHVzPXtFMkVTdGF0ZS5WZXJpZmllZH0gc2l6ZT17MTI4fSBoaWRlVG9vbHRpcD17dHJ1ZX0gLz5cbiAgICAgICAgICAgICAgICB7IHRleHQgPyA8cD57IHRleHQgfTwvcD4gOiBudWxsIH1cbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwicHJpbWFyeVwiIGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX3dpZGVCdXR0b25cIiBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQ2xvc2V9PlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiR290IGl0XCIpIH1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlckNhbmNlbGxlZFBoYXNlKCkge1xuICAgICAgICBjb25zdCB7IG1lbWJlciwgcmVxdWVzdCB9ID0gdGhpcy5wcm9wcztcblxuICAgICAgICBsZXQgc3RhcnRBZ2Fpbkluc3RydWN0aW9uOiBzdHJpbmc7XG4gICAgICAgIGlmIChyZXF1ZXN0LmlzU2VsZlZlcmlmaWNhdGlvbikge1xuICAgICAgICAgICAgc3RhcnRBZ2Fpbkluc3RydWN0aW9uID0gX3QoXCJTdGFydCB2ZXJpZmljYXRpb24gYWdhaW4gZnJvbSB0aGUgbm90aWZpY2F0aW9uLlwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXJ0QWdhaW5JbnN0cnVjdGlvbiA9IF90KFwiU3RhcnQgdmVyaWZpY2F0aW9uIGFnYWluIGZyb20gdGhlaXIgcHJvZmlsZS5cIik7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdGV4dDogc3RyaW5nO1xuICAgICAgICBpZiAocmVxdWVzdC5jYW5jZWxsYXRpb25Db2RlID09PSBcIm0udGltZW91dFwiKSB7XG4gICAgICAgICAgICB0ZXh0ID0gX3QoXCJWZXJpZmljYXRpb24gdGltZWQgb3V0LlwiKSArIGAgJHtzdGFydEFnYWluSW5zdHJ1Y3Rpb259YDtcbiAgICAgICAgfSBlbHNlIGlmIChyZXF1ZXN0LmNhbmNlbGxpbmdVc2VySWQgPT09IHJlcXVlc3Qub3RoZXJVc2VySWQpIHtcbiAgICAgICAgICAgIGlmIChyZXF1ZXN0LmlzU2VsZlZlcmlmaWNhdGlvbikge1xuICAgICAgICAgICAgICAgIHRleHQgPSBfdChcIllvdSBjYW5jZWxsZWQgdmVyaWZpY2F0aW9uIG9uIHlvdXIgb3RoZXIgZGV2aWNlLlwiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGV4dCA9IF90KFwiJShkaXNwbGF5TmFtZSlzIGNhbmNlbGxlZCB2ZXJpZmljYXRpb24uXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IChtZW1iZXIgYXMgVXNlcikuZGlzcGxheU5hbWUgfHwgKG1lbWJlciBhcyBSb29tTWVtYmVyKS5uYW1lIHx8IG1lbWJlci51c2VySWQsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0ZXh0ID0gYCR7dGV4dH0gJHtzdGFydEFnYWluSW5zdHJ1Y3Rpb259YDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRleHQgPSBfdChcIllvdSBjYW5jZWxsZWQgdmVyaWZpY2F0aW9uLlwiKSArIGAgJHtzdGFydEFnYWluSW5zdHJ1Y3Rpb259YDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2NvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgIDxoMz57IF90KFwiVmVyaWZpY2F0aW9uIGNhbmNlbGxlZFwiKSB9PC9oMz5cbiAgICAgICAgICAgICAgICA8cD57IHRleHQgfTwvcD5cblxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9XCJwcmltYXJ5XCIgY2xhc3NOYW1lPVwibXhfVXNlckluZm9fd2lkZUJ1dHRvblwiIG9uQ2xpY2s9e3RoaXMucHJvcHMub25DbG9zZX0+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJHb3QgaXRcIikgfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHsgbWVtYmVyLCBwaGFzZSwgcmVxdWVzdCB9ID0gdGhpcy5wcm9wcztcblxuICAgICAgICBjb25zdCBkaXNwbGF5TmFtZSA9IChtZW1iZXIgYXMgVXNlcikuZGlzcGxheU5hbWUgfHwgKG1lbWJlciBhcyBSb29tTWVtYmVyKS5uYW1lIHx8IG1lbWJlci51c2VySWQ7XG5cbiAgICAgICAgc3dpdGNoIChwaGFzZSkge1xuICAgICAgICAgICAgY2FzZSBQaGFzZS5SZWFkeTpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZW5kZXJRUlBoYXNlKCk7XG4gICAgICAgICAgICBjYXNlIFBoYXNlLlN0YXJ0ZWQ6XG4gICAgICAgICAgICAgICAgc3dpdGNoIChyZXF1ZXN0LmNob3Nlbk1ldGhvZCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIHZlcmlmaWNhdGlvbk1ldGhvZHMuUkVDSVBST0NBVEVfUVJfQ09ERTpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnJlbmRlclFSUmVjaXByb2NhdGVQaGFzZSgpO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIHZlcmlmaWNhdGlvbk1ldGhvZHMuU0FTOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlbW9qaXMgPSB0aGlzLnN0YXRlLnNhc0V2ZW50ID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8VmVyaWZpY2F0aW9uU2hvd1Nhc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZT17ZGlzcGxheU5hbWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRldmljZT17dGhpcy5nZXREZXZpY2UoKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2FzPXt0aGlzLnN0YXRlLnNhc0V2ZW50LnNhc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DYW5jZWw9e3RoaXMub25TYXNNaXNtYXRjaGVzQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uRG9uZT17dGhpcy5vblNhc01hdGNoZXNDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5EaWFsb2c9e3RoaXMucHJvcHMuaW5EaWFsb2d9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzU2VsZj17cmVxdWVzdC5pc1NlbGZWZXJpZmljYXRpb259XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz4gOiA8U3Bpbm5lciAvPjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2NvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgZW1vamlzIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBQaGFzZS5Eb25lOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnJlbmRlclZlcmlmaWVkUGhhc2UoKTtcbiAgICAgICAgICAgIGNhc2UgUGhhc2UuQ2FuY2VsbGVkOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnJlbmRlckNhbmNlbGxlZFBoYXNlKCk7XG4gICAgICAgIH1cbiAgICAgICAgbG9nZ2VyLmVycm9yKFwiVmVyaWZpY2F0aW9uUGFuZWwgdW5oYW5kbGVkIHBoYXNlOlwiLCBwaGFzZSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhcnRTQVMgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlbW9qaUJ1dHRvbkNsaWNrZWQ6IHRydWUgfSk7XG4gICAgICAgIGNvbnN0IHZlcmlmaWVyID0gdGhpcy5wcm9wcy5yZXF1ZXN0LmJlZ2luS2V5VmVyaWZpY2F0aW9uKHZlcmlmaWNhdGlvbk1ldGhvZHMuU0FTKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHZlcmlmaWVyLnZlcmlmeSgpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnIpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25TYXNNYXRjaGVzQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc3RhdGUuc2FzRXZlbnQuY29uZmlybSgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uU2FzTWlzbWF0Y2hlc0NsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnN0YXRlLnNhc0V2ZW50Lm1pc21hdGNoKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgdXBkYXRlVmVyaWZpZXJTdGF0ZSA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgeyByZXF1ZXN0IH0gPSB0aGlzLnByb3BzO1xuICAgICAgICBjb25zdCBzYXNFdmVudCA9IChyZXF1ZXN0LnZlcmlmaWVyIGFzIFNBUykuc2FzRXZlbnQ7XG4gICAgICAgIGNvbnN0IHJlY2lwcm9jYXRlUVJFdmVudCA9IChyZXF1ZXN0LnZlcmlmaWVyIGFzIFJlY2lwcm9jYXRlUVJDb2RlKS5yZWNpcHJvY2F0ZVFSRXZlbnQ7XG4gICAgICAgIHJlcXVlc3QudmVyaWZpZXIub2ZmKFNhc0V2ZW50LlNob3dTYXMsIHRoaXMudXBkYXRlVmVyaWZpZXJTdGF0ZSk7XG4gICAgICAgIHJlcXVlc3QudmVyaWZpZXIub2ZmKFFyQ29kZUV2ZW50LlNob3dSZWNpcHJvY2F0ZVFyLCB0aGlzLnVwZGF0ZVZlcmlmaWVyU3RhdGUpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2FzRXZlbnQsIHJlY2lwcm9jYXRlUVJFdmVudCB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJlcXVlc3RDaGFuZ2UgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHsgcmVxdWVzdCB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgY29uc3QgaGFkVmVyaWZpZXIgPSB0aGlzLmhhc1ZlcmlmaWVyO1xuICAgICAgICB0aGlzLmhhc1ZlcmlmaWVyID0gISFyZXF1ZXN0LnZlcmlmaWVyO1xuICAgICAgICBpZiAoIWhhZFZlcmlmaWVyICYmIHRoaXMuaGFzVmVyaWZpZXIpIHtcbiAgICAgICAgICAgIHJlcXVlc3QudmVyaWZpZXIub24oU2FzRXZlbnQuU2hvd1NhcywgdGhpcy51cGRhdGVWZXJpZmllclN0YXRlKTtcbiAgICAgICAgICAgIHJlcXVlc3QudmVyaWZpZXIub24oUXJDb2RlRXZlbnQuU2hvd1JlY2lwcm9jYXRlUXIsIHRoaXMudXBkYXRlVmVyaWZpZXJTdGF0ZSk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIG9uIHRoZSByZXF1ZXN0ZXIgc2lkZSwgdGhpcyBpcyBhbHNvIGF3YWl0ZWQgaW4gc3RhcnRTQVMsXG4gICAgICAgICAgICAgICAgLy8gYnV0IHRoYXQncyBvayBhcyB2ZXJpZnkgc2hvdWxkIHJldHVybiB0aGUgc2FtZSBwcm9taXNlLlxuICAgICAgICAgICAgICAgIGF3YWl0IHJlcXVlc3QudmVyaWZpZXIudmVyaWZ5KCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJlcnJvciB2ZXJpZnlcIiwgZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwdWJsaWMgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIGNvbnN0IHsgcmVxdWVzdCB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgcmVxdWVzdC5vbihWZXJpZmljYXRpb25SZXF1ZXN0RXZlbnQuQ2hhbmdlLCB0aGlzLm9uUmVxdWVzdENoYW5nZSk7XG4gICAgICAgIGlmIChyZXF1ZXN0LnZlcmlmaWVyKSB7XG4gICAgICAgICAgICBjb25zdCBzYXNFdmVudCA9IChyZXF1ZXN0LnZlcmlmaWVyIGFzIFNBUykuc2FzRXZlbnQ7XG4gICAgICAgICAgICBjb25zdCByZWNpcHJvY2F0ZVFSRXZlbnQgPSAocmVxdWVzdC52ZXJpZmllciBhcyBSZWNpcHJvY2F0ZVFSQ29kZSkucmVjaXByb2NhdGVRUkV2ZW50O1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNhc0V2ZW50LCByZWNpcHJvY2F0ZVFSRXZlbnQgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vblJlcXVlc3RDaGFuZ2UoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGNvbnN0IHsgcmVxdWVzdCB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgaWYgKHJlcXVlc3QudmVyaWZpZXIpIHtcbiAgICAgICAgICAgIHJlcXVlc3QudmVyaWZpZXIub2ZmKFNhc0V2ZW50LlNob3dTYXMsIHRoaXMudXBkYXRlVmVyaWZpZXJTdGF0ZSk7XG4gICAgICAgICAgICByZXF1ZXN0LnZlcmlmaWVyLm9mZihRckNvZGVFdmVudC5TaG93UmVjaXByb2NhdGVRciwgdGhpcy51cGRhdGVWZXJpZmllclN0YXRlKTtcbiAgICAgICAgfVxuICAgICAgICByZXF1ZXN0Lm9mZihWZXJpZmljYXRpb25SZXF1ZXN0RXZlbnQuQ2hhbmdlLCB0aGlzLm9uUmVxdWVzdENoYW5nZSk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFPQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXlDZSxNQUFNQSxpQkFBTixTQUFnQ0MsY0FBQSxDQUFNQyxhQUF0QyxDQUFvRTtFQUcvRUMsV0FBVyxDQUFDQyxLQUFELEVBQWdCO0lBQ3ZCLE1BQU1BLEtBQU47SUFEdUI7SUFBQSw2REEwR0ssTUFBTTtNQUNsQyxLQUFLQyxRQUFMLENBQWM7UUFB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