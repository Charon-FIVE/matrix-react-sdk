"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _MatrixClientPeg = require("../../../../MatrixClientPeg");

var _languageHandler = require("../../../../languageHandler");

var _Modal = _interopRequireDefault(require("../../../../Modal"));

var _InteractiveAuthEntryComponents = require("../../auth/InteractiveAuthEntryComponents");

var _DialogButtons = _interopRequireDefault(require("../../elements/DialogButtons"));

var _BaseDialog = _interopRequireDefault(require("../BaseDialog"));

var _Spinner = _interopRequireDefault(require("../../elements/Spinner"));

var _InteractiveAuthDialog = _interopRequireDefault(require("../InteractiveAuthDialog"));

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

/*
 * Walks the user through the process of creating a cross-signing keys. In most
 * cases, only a spinner is shown, but for more complex auth like SSO, the user
 * may need to complete some steps to proceed.
 */
class CreateCrossSigningDialog extends _react.default.PureComponent {
  constructor(props) {
    super(props);
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
      } else if (this.props.tokenLogin) {
        // We are hoping the grace period is active
        await makeRequest({});
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
    (0, _defineProperty2.default)(this, "bootstrapCrossSigning", async () => {
      this.setState({
        error: null
      });

      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      try {
        await cli.bootstrapCrossSigning({
          authUploadDeviceSigningKeys: this.doBootstrapUIAuth
        });
        this.props.onFinished(true);
      } catch (e) {
        if (this.props.tokenLogin) {
          // ignore any failures, we are relying on grace period here
          this.props.onFinished(false);
          return;
        }

        this.setState({
          error: e
        });

        _logger.logger.error("Error bootstrapping cross-signing", e);
      }
    });
    (0, _defineProperty2.default)(this, "onCancel", () => {
      this.props.onFinished(false);
    });
    this.state = {
      error: null,
      // Does the server offer a UI auth flow with just m.login.password
      // for /keys/device_signing/upload?
      // If we have an account password in memory, let's simplify and
      // assume it means password auth is also supported for device
      // signing key upload as well. This avoids hitting the server to
      // test auth flows, which may be slow under high load.
      canUploadKeysWithPasswordOnly: props.accountPassword ? true : null,
      accountPassword: props.accountPassword || ""
    };

    if (!this.state.accountPassword) {
      this.queryKeyUploadAuth();
    }
  }

  componentDidMount() {
    this.bootstrapCrossSigning();
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

  render() {
    let content;

    if (this.state.error) {
      content = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Unable to set up keys")), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Dialog_buttons"
      }, /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
        primaryButton: (0, _languageHandler._t)('Retry'),
        onPrimaryButtonClick: this.bootstrapCrossSigning,
        onCancel: this.onCancel
      })));
    } else {
      content = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement(_Spinner.default, null));
    }

    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_CreateCrossSigningDialog",
      onFinished: this.props.onFinished,
      title: (0, _languageHandler._t)("Setting up keys"),
      hasCancel: false,
      fixedWidth: false
    }, /*#__PURE__*/_react.default.createElement("div", null, content));
  }

}

exports.default = CreateCrossSigningDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDcmVhdGVDcm9zc1NpZ25pbmdEaWFsb2ciLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwibWFrZVJlcXVlc3QiLCJzdGF0ZSIsImNhblVwbG9hZEtleXNXaXRoUGFzc3dvcmRPbmx5IiwiYWNjb3VudFBhc3N3b3JkIiwidHlwZSIsImlkZW50aWZpZXIiLCJ1c2VyIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiZ2V0VXNlcklkIiwicGFzc3dvcmQiLCJ0b2tlbkxvZ2luIiwiZGlhbG9nQWVzdGhldGljcyIsIlNTT0F1dGhFbnRyeSIsIlBIQVNFX1BSRUFVVEgiLCJ0aXRsZSIsIl90IiwiYm9keSIsImNvbnRpbnVlVGV4dCIsImNvbnRpbnVlS2luZCIsIlBIQVNFX1BPU1RBVVRIIiwiZmluaXNoZWQiLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIkludGVyYWN0aXZlQXV0aERpYWxvZyIsIm1hdHJpeENsaWVudCIsImFlc3RoZXRpY3NGb3JTdGFnZVBoYXNlcyIsIkxPR0lOX1RZUEUiLCJVTlNUQUJMRV9MT0dJTl9UWVBFIiwiY29uZmlybWVkIiwiRXJyb3IiLCJzZXRTdGF0ZSIsImVycm9yIiwiY2xpIiwiYm9vdHN0cmFwQ3Jvc3NTaWduaW5nIiwiYXV0aFVwbG9hZERldmljZVNpZ25pbmdLZXlzIiwiZG9Cb290c3RyYXBVSUF1dGgiLCJvbkZpbmlzaGVkIiwiZSIsImxvZ2dlciIsInF1ZXJ5S2V5VXBsb2FkQXV0aCIsImNvbXBvbmVudERpZE1vdW50IiwidXBsb2FkRGV2aWNlU2lnbmluZ0tleXMiLCJsb2ciLCJkYXRhIiwiZmxvd3MiLCJzb21lIiwiZiIsInN0YWdlcyIsImxlbmd0aCIsInJlbmRlciIsImNvbnRlbnQiLCJvbkNhbmNlbCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3Mvc2VjdXJpdHkvQ3JlYXRlQ3Jvc3NTaWduaW5nRGlhbG9nLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTgsIDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5LCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IENyb3NzU2lnbmluZ0tleXMgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9jbGllbnQnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuXG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tICcuLi8uLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uLy4uLy4uL01vZGFsJztcbmltcG9ydCB7IFNTT0F1dGhFbnRyeSB9IGZyb20gJy4uLy4uL2F1dGgvSW50ZXJhY3RpdmVBdXRoRW50cnlDb21wb25lbnRzJztcbmltcG9ydCBEaWFsb2dCdXR0b25zIGZyb20gJy4uLy4uL2VsZW1lbnRzL0RpYWxvZ0J1dHRvbnMnO1xuaW1wb3J0IEJhc2VEaWFsb2cgZnJvbSAnLi4vQmFzZURpYWxvZyc7XG5pbXBvcnQgU3Bpbm5lciBmcm9tICcuLi8uLi9lbGVtZW50cy9TcGlubmVyJztcbmltcG9ydCBJbnRlcmFjdGl2ZUF1dGhEaWFsb2cgZnJvbSAnLi4vSW50ZXJhY3RpdmVBdXRoRGlhbG9nJztcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgYWNjb3VudFBhc3N3b3JkPzogc3RyaW5nO1xuICAgIHRva2VuTG9naW4/OiBib29sZWFuO1xuICAgIG9uRmluaXNoZWQ/OiAoc3VjY2VzczogYm9vbGVhbikgPT4gdm9pZDtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgZXJyb3I6IEVycm9yIHwgbnVsbDtcbiAgICBjYW5VcGxvYWRLZXlzV2l0aFBhc3N3b3JkT25seT86IGJvb2xlYW47XG4gICAgYWNjb3VudFBhc3N3b3JkOiBzdHJpbmc7XG59XG5cbi8qXG4gKiBXYWxrcyB0aGUgdXNlciB0aHJvdWdoIHRoZSBwcm9jZXNzIG9mIGNyZWF0aW5nIGEgY3Jvc3Mtc2lnbmluZyBrZXlzLiBJbiBtb3N0XG4gKiBjYXNlcywgb25seSBhIHNwaW5uZXIgaXMgc2hvd24sIGJ1dCBmb3IgbW9yZSBjb21wbGV4IGF1dGggbGlrZSBTU08sIHRoZSB1c2VyXG4gKiBtYXkgbmVlZCB0byBjb21wbGV0ZSBzb21lIHN0ZXBzIHRvIHByb2NlZWQuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENyZWF0ZUNyb3NzU2lnbmluZ0RpYWxvZyBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICAvLyBEb2VzIHRoZSBzZXJ2ZXIgb2ZmZXIgYSBVSSBhdXRoIGZsb3cgd2l0aCBqdXN0IG0ubG9naW4ucGFzc3dvcmRcbiAgICAgICAgICAgIC8vIGZvciAva2V5cy9kZXZpY2Vfc2lnbmluZy91cGxvYWQ/XG4gICAgICAgICAgICAvLyBJZiB3ZSBoYXZlIGFuIGFjY291bnQgcGFzc3dvcmQgaW4gbWVtb3J5LCBsZXQncyBzaW1wbGlmeSBhbmRcbiAgICAgICAgICAgIC8vIGFzc3VtZSBpdCBtZWFucyBwYXNzd29yZCBhdXRoIGlzIGFsc28gc3VwcG9ydGVkIGZvciBkZXZpY2VcbiAgICAgICAgICAgIC8vIHNpZ25pbmcga2V5IHVwbG9hZCBhcyB3ZWxsLiBUaGlzIGF2b2lkcyBoaXR0aW5nIHRoZSBzZXJ2ZXIgdG9cbiAgICAgICAgICAgIC8vIHRlc3QgYXV0aCBmbG93cywgd2hpY2ggbWF5IGJlIHNsb3cgdW5kZXIgaGlnaCBsb2FkLlxuICAgICAgICAgICAgY2FuVXBsb2FkS2V5c1dpdGhQYXNzd29yZE9ubHk6IHByb3BzLmFjY291bnRQYXNzd29yZCA/IHRydWUgOiBudWxsLFxuICAgICAgICAgICAgYWNjb3VudFBhc3N3b3JkOiBwcm9wcy5hY2NvdW50UGFzc3dvcmQgfHwgXCJcIixcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuYWNjb3VudFBhc3N3b3JkKSB7XG4gICAgICAgICAgICB0aGlzLnF1ZXJ5S2V5VXBsb2FkQXV0aCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgICAgICB0aGlzLmJvb3RzdHJhcENyb3NzU2lnbmluZygpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcXVlcnlLZXlVcGxvYWRBdXRoKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLnVwbG9hZERldmljZVNpZ25pbmdLZXlzKG51bGwsIHt9IGFzIENyb3NzU2lnbmluZ0tleXMpO1xuICAgICAgICAgICAgLy8gV2Ugc2hvdWxkIG5ldmVyIGdldCBoZXJlOiB0aGUgc2VydmVyIHNob3VsZCBhbHdheXMgcmVxdWlyZVxuICAgICAgICAgICAgLy8gVUkgYXV0aCB0byB1cGxvYWQgZGV2aWNlIHNpZ25pbmcga2V5cy4gSWYgd2UgZG8sIHdlIHVwbG9hZFxuICAgICAgICAgICAgLy8gbm8ga2V5cyB3aGljaCB3b3VsZCBiZSBhIG5vLW9wLlxuICAgICAgICAgICAgbG9nZ2VyLmxvZyhcInVwbG9hZERldmljZVNpZ25pbmdLZXlzIHVuZXhwZWN0ZWRseSBzdWNjZWVkZWQgd2l0aG91dCBVSSBhdXRoIVwiKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGlmICghZXJyb3IuZGF0YSB8fCAhZXJyb3IuZGF0YS5mbG93cykge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5sb2coXCJ1cGxvYWREZXZpY2VTaWduaW5nS2V5cyBhZHZlcnRpc2VkIG5vIGZsb3dzIVwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBjYW5VcGxvYWRLZXlzV2l0aFBhc3N3b3JkT25seSA9IGVycm9yLmRhdGEuZmxvd3Muc29tZShmID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZi5zdGFnZXMubGVuZ3RoID09PSAxICYmIGYuc3RhZ2VzWzBdID09PSAnbS5sb2dpbi5wYXNzd29yZCc7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGNhblVwbG9hZEtleXNXaXRoUGFzc3dvcmRPbmx5LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGRvQm9vdHN0cmFwVUlBdXRoID0gYXN5bmMgKG1ha2VSZXF1ZXN0OiAoYXV0aERhdGE6IGFueSkgPT4gUHJvbWlzZTx7fT4pOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuY2FuVXBsb2FkS2V5c1dpdGhQYXNzd29yZE9ubHkgJiYgdGhpcy5zdGF0ZS5hY2NvdW50UGFzc3dvcmQpIHtcbiAgICAgICAgICAgIGF3YWl0IG1ha2VSZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnbS5sb2dpbi5wYXNzd29yZCcsXG4gICAgICAgICAgICAgICAgaWRlbnRpZmllcjoge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbS5pZC51c2VyJyxcbiAgICAgICAgICAgICAgICAgICAgdXNlcjogTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgLy8gVE9ETzogUmVtb3ZlIGB1c2VyYCBvbmNlIHNlcnZlcnMgc3VwcG9ydCBwcm9wZXIgVUlBXG4gICAgICAgICAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRyaXgtb3JnL3N5bmFwc2UvaXNzdWVzLzU2NjVcbiAgICAgICAgICAgICAgICB1c2VyOiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VXNlcklkKCksXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQ6IHRoaXMuc3RhdGUuYWNjb3VudFBhc3N3b3JkLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy50b2tlbkxvZ2luKSB7XG4gICAgICAgICAgICAvLyBXZSBhcmUgaG9waW5nIHRoZSBncmFjZSBwZXJpb2QgaXMgYWN0aXZlXG4gICAgICAgICAgICBhd2FpdCBtYWtlUmVxdWVzdCh7fSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBkaWFsb2dBZXN0aGV0aWNzID0ge1xuICAgICAgICAgICAgICAgIFtTU09BdXRoRW50cnkuUEhBU0VfUFJFQVVUSF06IHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiVXNlIFNpbmdsZSBTaWduIE9uIHRvIGNvbnRpbnVlXCIpLFxuICAgICAgICAgICAgICAgICAgICBib2R5OiBfdChcIlRvIGNvbnRpbnVlLCB1c2UgU2luZ2xlIFNpZ24gT24gdG8gcHJvdmUgeW91ciBpZGVudGl0eS5cIiksXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlVGV4dDogX3QoXCJTaW5nbGUgU2lnbiBPblwiKSxcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVLaW5kOiBcInByaW1hcnlcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIFtTU09BdXRoRW50cnkuUEhBU0VfUE9TVEFVVEhdOiB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkNvbmZpcm0gZW5jcnlwdGlvbiBzZXR1cFwiKSxcbiAgICAgICAgICAgICAgICAgICAgYm9keTogX3QoXCJDbGljayB0aGUgYnV0dG9uIGJlbG93IHRvIGNvbmZpcm0gc2V0dGluZyB1cCBlbmNyeXB0aW9uLlwiKSxcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVUZXh0OiBfdChcIkNvbmZpcm1cIiksXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlS2luZDogXCJwcmltYXJ5XCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IHsgZmluaXNoZWQgfSA9IE1vZGFsLmNyZWF0ZURpYWxvZyhJbnRlcmFjdGl2ZUF1dGhEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJTZXR0aW5nIHVwIGtleXNcIiksXG4gICAgICAgICAgICAgICAgbWF0cml4Q2xpZW50OiBNYXRyaXhDbGllbnRQZWcuZ2V0KCksXG4gICAgICAgICAgICAgICAgbWFrZVJlcXVlc3QsXG4gICAgICAgICAgICAgICAgYWVzdGhldGljc0ZvclN0YWdlUGhhc2VzOiB7XG4gICAgICAgICAgICAgICAgICAgIFtTU09BdXRoRW50cnkuTE9HSU5fVFlQRV06IGRpYWxvZ0Flc3RoZXRpY3MsXG4gICAgICAgICAgICAgICAgICAgIFtTU09BdXRoRW50cnkuVU5TVEFCTEVfTE9HSU5fVFlQRV06IGRpYWxvZ0Flc3RoZXRpY3MsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgW2NvbmZpcm1lZF0gPSBhd2FpdCBmaW5pc2hlZDtcbiAgICAgICAgICAgIGlmICghY29uZmlybWVkKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ3Jvc3Mtc2lnbmluZyBrZXkgdXBsb2FkIGF1dGggY2FuY2VsZWRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBib290c3RyYXBDcm9zc1NpZ25pbmcgPSBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgY2xpLmJvb3RzdHJhcENyb3NzU2lnbmluZyh7XG4gICAgICAgICAgICAgICAgYXV0aFVwbG9hZERldmljZVNpZ25pbmdLZXlzOiB0aGlzLmRvQm9vdHN0cmFwVUlBdXRoLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQodHJ1ZSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnRva2VuTG9naW4pIHtcbiAgICAgICAgICAgICAgICAvLyBpZ25vcmUgYW55IGZhaWx1cmVzLCB3ZSBhcmUgcmVseWluZyBvbiBncmFjZSBwZXJpb2QgaGVyZVxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChmYWxzZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZXJyb3I6IGUgfSk7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJFcnJvciBib290c3RyYXBwaW5nIGNyb3NzLXNpZ25pbmdcIiwgZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNhbmNlbCA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKGZhbHNlKTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgY29udGVudDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnRlbnQgPSA8ZGl2PlxuICAgICAgICAgICAgICAgIDxwPnsgX3QoXCJVbmFibGUgdG8gc2V0IHVwIGtleXNcIikgfTwvcD5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19idXR0b25zXCI+XG4gICAgICAgICAgICAgICAgICAgIDxEaWFsb2dCdXR0b25zIHByaW1hcnlCdXR0b249e190KCdSZXRyeScpfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMuYm9vdHN0cmFwQ3Jvc3NTaWduaW5nfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DYW5jZWw9e3RoaXMub25DYW5jZWx9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb250ZW50ID0gPGRpdj5cbiAgICAgICAgICAgICAgICA8U3Bpbm5lciAvPlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxCYXNlRGlhbG9nIGNsYXNzTmFtZT1cIm14X0NyZWF0ZUNyb3NzU2lnbmluZ0RpYWxvZ1wiXG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIlNldHRpbmcgdXAga2V5c1wiKX1cbiAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e2ZhbHNlfVxuICAgICAgICAgICAgICAgIGZpeGVkV2lkdGg9e2ZhbHNlfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIHsgY29udGVudCB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L0Jhc2VEaWFsb2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWlCQTs7QUFFQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUE1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBMkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDZSxNQUFNQSx3QkFBTixTQUF1Q0MsY0FBQSxDQUFNQyxhQUE3QyxDQUEyRTtFQUN0RkMsV0FBVyxDQUFDQyxLQUFELEVBQWdCO0lBQ3ZCLE1BQU1BLEtBQU47SUFEdUIseURBNkNDLE1BQU9DLFdBQVAsSUFBc0U7TUFDOUYsSUFBSSxLQUFLQyxLQUFMLENBQVdDLDZCQUFYLElBQTRDLEtBQUtELEtBQUwsQ0FBV0UsZUFBM0QsRUFBNEU7UUFDeEUsTUFBTUgsV0FBVyxDQUFDO1VBQ2RJLElBQUksRUFBRSxrQkFEUTtVQUVkQyxVQUFVLEVBQUU7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