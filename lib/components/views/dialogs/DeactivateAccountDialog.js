"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _languageHandler = require("../../../languageHandler");

var _InteractiveAuth = _interopRequireWildcard(require("../../structures/InteractiveAuth"));

var _InteractiveAuthEntryComponents = require("../auth/InteractiveAuthEntryComponents");

var _StyledCheckbox = _interopRequireDefault(require("../elements/StyledCheckbox"));

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _actions = require("../../../dispatcher/actions");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2016 OpenMarket Ltd
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
class DeactivateAccountDialog extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onStagePhaseChange", (stage, phase) => {
      const dialogAesthetics = {
        [_InteractiveAuthEntryComponents.SSOAuthEntry.PHASE_PREAUTH]: {
          body: (0, _languageHandler._t)("Confirm your account deactivation by using Single Sign On to prove your identity."),
          continueText: (0, _languageHandler._t)("Single Sign On"),
          continueKind: "danger"
        },
        [_InteractiveAuthEntryComponents.SSOAuthEntry.PHASE_POSTAUTH]: {
          body: (0, _languageHandler._t)("Are you sure you want to deactivate your account? This is irreversible."),
          continueText: (0, _languageHandler._t)("Confirm account deactivation"),
          continueKind: "danger"
        }
      }; // This is the same as aestheticsForStagePhases in InteractiveAuthDialog minus the `title`

      const DEACTIVATE_AESTHETICS = {
        [_InteractiveAuthEntryComponents.SSOAuthEntry.LOGIN_TYPE]: dialogAesthetics,
        [_InteractiveAuthEntryComponents.SSOAuthEntry.UNSTABLE_LOGIN_TYPE]: dialogAesthetics,
        [_InteractiveAuthEntryComponents.PasswordAuthEntry.LOGIN_TYPE]: {
          [_InteractiveAuthEntryComponents.DEFAULT_PHASE]: {
            body: (0, _languageHandler._t)("To continue, please enter your account password:")
          }
        }
      };
      const aesthetics = DEACTIVATE_AESTHETICS[stage];
      let bodyText = null;
      let continueText = null;
      let continueKind = null;

      if (aesthetics) {
        const phaseAesthetics = aesthetics[phase];
        if (phaseAesthetics && phaseAesthetics.body) bodyText = phaseAesthetics.body;
        if (phaseAesthetics && phaseAesthetics.continueText) continueText = phaseAesthetics.continueText;
        if (phaseAesthetics && phaseAesthetics.continueKind) continueKind = phaseAesthetics.continueKind;
      }

      this.setState({
        bodyText,
        continueText,
        continueKind
      });
    });
    (0, _defineProperty2.default)(this, "onUIAuthFinished", (success, result) => {
      if (success) return; // great! makeRequest() will be called too.

      if (result === _InteractiveAuth.ERROR_USER_CANCELLED) {
        this.onCancel();
        return;
      }

      _logger.logger.error("Error during UI Auth:", {
        result
      });

      this.setState({
        errStr: (0, _languageHandler._t)("There was a problem communicating with the server. Please try again.")
      });
    });
    (0, _defineProperty2.default)(this, "onUIAuthComplete", auth => {
      // XXX: this should be returning a promise to maintain the state inside the state machine correct
      // but given that a deactivation is followed by a local logout and all object instances being thrown away
      // this isn't done.
      _MatrixClientPeg.MatrixClientPeg.get().deactivateAccount(auth, this.state.shouldErase).then(r => {
        // Deactivation worked - logout & close this dialog
        _dispatcher.default.fire(_actions.Action.TriggerLogout);

        this.props.onFinished(true);
      }).catch(e => {
        _logger.logger.error(e);

        this.setState({
          errStr: (0, _languageHandler._t)("There was a problem communicating with the server. Please try again.")
        });
      });
    });
    (0, _defineProperty2.default)(this, "onEraseFieldChange", ev => {
      this.setState({
        shouldErase: ev.currentTarget.checked,
        // Disable the auth form because we're going to have to reinitialize the auth
        // information. We do this because we can't modify the parameters in the UIA
        // session, and the user will have selected something which changes the request.
        // Therefore, we throw away the last auth session and try a new one.
        authEnabled: false
      }); // As mentioned above, set up for auth again to get updated UIA session info

      this.initAuth(
      /* shouldErase= */
      ev.currentTarget.checked);
    });
    this.state = {
      shouldErase: false,
      errStr: null,
      authData: null,
      // for UIA
      authEnabled: true,
      // see usages for information
      // A few strings that are passed to InteractiveAuth for design or are displayed
      // next to the InteractiveAuth component.
      bodyText: null,
      continueText: null,
      continueKind: null
    };
    this.initAuth(
    /* shouldErase= */
    false);
  }

  onCancel() {
    this.props.onFinished(false);
  }

  initAuth(shouldErase) {
    _MatrixClientPeg.MatrixClientPeg.get().deactivateAccount(null, shouldErase).then(r => {
      // If we got here, oops. The server didn't require any auth.
      // Our application lifecycle will catch the error and do the logout bits.
      // We'll try to log something in an vain attempt to record what happened (storage
      // is also obliterated on logout).
      _logger.logger.warn("User's account got deactivated without confirmation: Server had no auth");

      this.setState({
        errStr: (0, _languageHandler._t)("Server did not require any authentication")
      });
    }).catch(e => {
      if (e && e.httpStatus === 401 && e.data) {
        // Valid UIA response
        this.setState({
          authData: e.data,
          authEnabled: true
        });
      } else {
        this.setState({
          errStr: (0, _languageHandler._t)("Server did not return valid authentication information.")
        });
      }
    });
  }

  render() {
    let error = null;

    if (this.state.errStr) {
      error = /*#__PURE__*/_react.default.createElement("div", {
        className: "error"
      }, this.state.errStr);
    }

    let auth = /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Loading..."));

    if (this.state.authData && this.state.authEnabled) {
      auth = /*#__PURE__*/_react.default.createElement("div", null, this.state.bodyText, /*#__PURE__*/_react.default.createElement(_InteractiveAuth.default, {
        matrixClient: _MatrixClientPeg.MatrixClientPeg.get(),
        authData: this.state.authData // XXX: onUIAuthComplete breaches the expected method contract, it gets away with it because it
        // knows the entire app is about to die as a result of the account deactivation.
        ,
        makeRequest: this.onUIAuthComplete,
        onAuthFinished: this.onUIAuthFinished,
        onStagePhaseChange: this.onStagePhaseChange,
        continueText: this.state.continueText,
        continueKind: this.state.continueKind
      }));
    } // this is on purpose not a <form /> to prevent Enter triggering submission, to further prevent accidents


    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_DeactivateAccountDialog",
      onFinished: this.props.onFinished,
      titleClass: "danger",
      title: (0, _languageHandler._t)("Deactivate Account"),
      screenName: "DeactivateAccount"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Confirm that you would like to deactivate your account. If you proceed:")), /*#__PURE__*/_react.default.createElement("ul", null, /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("You will not be able to reactivate your account")), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("You will no longer be able to log in")), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("No one will be able to reuse your username (MXID), including you: this username will remain unavailable")), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("You will leave all rooms and DMs that you are in")), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("You will be removed from the identity server: your friends will no longer be able to find you with your email or phone number"))), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Your old messages will still be visible to people who received them, just like emails you sent in the past. Would you like to hide your sent messages from people who join rooms in the future?")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_DeactivateAccountDialog_input_section"
    }, /*#__PURE__*/_react.default.createElement("p", null, /*#__PURE__*/_react.default.createElement(_StyledCheckbox.default, {
      checked: this.state.shouldErase,
      onChange: this.onEraseFieldChange
    }, (0, _languageHandler._t)("Hide my messages from new joiners"))), error, auth)));
  }

}

exports.default = DeactivateAccountDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZWFjdGl2YXRlQWNjb3VudERpYWxvZyIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInN0YWdlIiwicGhhc2UiLCJkaWFsb2dBZXN0aGV0aWNzIiwiU1NPQXV0aEVudHJ5IiwiUEhBU0VfUFJFQVVUSCIsImJvZHkiLCJfdCIsImNvbnRpbnVlVGV4dCIsImNvbnRpbnVlS2luZCIsIlBIQVNFX1BPU1RBVVRIIiwiREVBQ1RJVkFURV9BRVNUSEVUSUNTIiwiTE9HSU5fVFlQRSIsIlVOU1RBQkxFX0xPR0lOX1RZUEUiLCJQYXNzd29yZEF1dGhFbnRyeSIsIkRFRkFVTFRfUEhBU0UiLCJhZXN0aGV0aWNzIiwiYm9keVRleHQiLCJwaGFzZUFlc3RoZXRpY3MiLCJzZXRTdGF0ZSIsInN1Y2Nlc3MiLCJyZXN1bHQiLCJFUlJPUl9VU0VSX0NBTkNFTExFRCIsIm9uQ2FuY2VsIiwibG9nZ2VyIiwiZXJyb3IiLCJlcnJTdHIiLCJhdXRoIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiZGVhY3RpdmF0ZUFjY291bnQiLCJzdGF0ZSIsInNob3VsZEVyYXNlIiwidGhlbiIsInIiLCJkZWZhdWx0RGlzcGF0Y2hlciIsImZpcmUiLCJBY3Rpb24iLCJUcmlnZ2VyTG9nb3V0Iiwib25GaW5pc2hlZCIsImNhdGNoIiwiZSIsImV2IiwiY3VycmVudFRhcmdldCIsImNoZWNrZWQiLCJhdXRoRW5hYmxlZCIsImluaXRBdXRoIiwiYXV0aERhdGEiLCJ3YXJuIiwiaHR0cFN0YXR1cyIsImRhdGEiLCJyZW5kZXIiLCJvblVJQXV0aENvbXBsZXRlIiwib25VSUF1dGhGaW5pc2hlZCIsIm9uU3RhZ2VQaGFzZUNoYW5nZSIsIm9uRXJhc2VGaWVsZENoYW5nZSJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvRGVhY3RpdmF0ZUFjY291bnREaWFsb2cudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQXV0aFR5cGUsIElBdXRoRGF0YSB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL2ludGVyYWN0aXZlLWF1dGgnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuXG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tICcuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IEludGVyYWN0aXZlQXV0aCwgeyBFUlJPUl9VU0VSX0NBTkNFTExFRCwgSW50ZXJhY3RpdmVBdXRoQ2FsbGJhY2sgfSBmcm9tIFwiLi4vLi4vc3RydWN0dXJlcy9JbnRlcmFjdGl2ZUF1dGhcIjtcbmltcG9ydCB7IERFRkFVTFRfUEhBU0UsIFBhc3N3b3JkQXV0aEVudHJ5LCBTU09BdXRoRW50cnkgfSBmcm9tIFwiLi4vYXV0aC9JbnRlcmFjdGl2ZUF1dGhFbnRyeUNvbXBvbmVudHNcIjtcbmltcG9ydCBTdHlsZWRDaGVja2JveCBmcm9tIFwiLi4vZWxlbWVudHMvU3R5bGVkQ2hlY2tib3hcIjtcbmltcG9ydCBCYXNlRGlhbG9nIGZyb20gXCIuL0Jhc2VEaWFsb2dcIjtcbmltcG9ydCBkZWZhdWx0RGlzcGF0Y2hlciBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIG9uRmluaXNoZWQ6IChzdWNjZXNzOiBib29sZWFuKSA9PiB2b2lkO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBzaG91bGRFcmFzZTogYm9vbGVhbjtcbiAgICBlcnJTdHI6IHN0cmluZztcbiAgICBhdXRoRGF0YTogYW55OyAvLyBmb3IgVUlBXG4gICAgYXV0aEVuYWJsZWQ6IGJvb2xlYW47IC8vIHNlZSB1c2FnZXMgZm9yIGluZm9ybWF0aW9uXG5cbiAgICAvLyBBIGZldyBzdHJpbmdzIHRoYXQgYXJlIHBhc3NlZCB0byBJbnRlcmFjdGl2ZUF1dGggZm9yIGRlc2lnbiBvciBhcmUgZGlzcGxheWVkXG4gICAgLy8gbmV4dCB0byB0aGUgSW50ZXJhY3RpdmVBdXRoIGNvbXBvbmVudC5cbiAgICBib2R5VGV4dDogc3RyaW5nO1xuICAgIGNvbnRpbnVlVGV4dDogc3RyaW5nO1xuICAgIGNvbnRpbnVlS2luZDogc3RyaW5nO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEZWFjdGl2YXRlQWNjb3VudERpYWxvZyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgc2hvdWxkRXJhc2U6IGZhbHNlLFxuICAgICAgICAgICAgZXJyU3RyOiBudWxsLFxuICAgICAgICAgICAgYXV0aERhdGE6IG51bGwsIC8vIGZvciBVSUFcbiAgICAgICAgICAgIGF1dGhFbmFibGVkOiB0cnVlLCAvLyBzZWUgdXNhZ2VzIGZvciBpbmZvcm1hdGlvblxuXG4gICAgICAgICAgICAvLyBBIGZldyBzdHJpbmdzIHRoYXQgYXJlIHBhc3NlZCB0byBJbnRlcmFjdGl2ZUF1dGggZm9yIGRlc2lnbiBvciBhcmUgZGlzcGxheWVkXG4gICAgICAgICAgICAvLyBuZXh0IHRvIHRoZSBJbnRlcmFjdGl2ZUF1dGggY29tcG9uZW50LlxuICAgICAgICAgICAgYm9keVRleHQ6IG51bGwsXG4gICAgICAgICAgICBjb250aW51ZVRleHQ6IG51bGwsXG4gICAgICAgICAgICBjb250aW51ZUtpbmQ6IG51bGwsXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5pbml0QXV0aCgvKiBzaG91bGRFcmFzZT0gKi9mYWxzZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblN0YWdlUGhhc2VDaGFuZ2UgPSAoc3RhZ2U6IEF1dGhUeXBlLCBwaGFzZTogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IGRpYWxvZ0Flc3RoZXRpY3MgPSB7XG4gICAgICAgICAgICBbU1NPQXV0aEVudHJ5LlBIQVNFX1BSRUFVVEhdOiB7XG4gICAgICAgICAgICAgICAgYm9keTogX3QoXCJDb25maXJtIHlvdXIgYWNjb3VudCBkZWFjdGl2YXRpb24gYnkgdXNpbmcgU2luZ2xlIFNpZ24gT24gdG8gcHJvdmUgeW91ciBpZGVudGl0eS5cIiksXG4gICAgICAgICAgICAgICAgY29udGludWVUZXh0OiBfdChcIlNpbmdsZSBTaWduIE9uXCIpLFxuICAgICAgICAgICAgICAgIGNvbnRpbnVlS2luZDogXCJkYW5nZXJcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBbU1NPQXV0aEVudHJ5LlBIQVNFX1BPU1RBVVRIXToge1xuICAgICAgICAgICAgICAgIGJvZHk6IF90KFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGRlYWN0aXZhdGUgeW91ciBhY2NvdW50PyBUaGlzIGlzIGlycmV2ZXJzaWJsZS5cIiksXG4gICAgICAgICAgICAgICAgY29udGludWVUZXh0OiBfdChcIkNvbmZpcm0gYWNjb3VudCBkZWFjdGl2YXRpb25cIiksXG4gICAgICAgICAgICAgICAgY29udGludWVLaW5kOiBcImRhbmdlclwiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBUaGlzIGlzIHRoZSBzYW1lIGFzIGFlc3RoZXRpY3NGb3JTdGFnZVBoYXNlcyBpbiBJbnRlcmFjdGl2ZUF1dGhEaWFsb2cgbWludXMgdGhlIGB0aXRsZWBcbiAgICAgICAgY29uc3QgREVBQ1RJVkFURV9BRVNUSEVUSUNTID0ge1xuICAgICAgICAgICAgW1NTT0F1dGhFbnRyeS5MT0dJTl9UWVBFXTogZGlhbG9nQWVzdGhldGljcyxcbiAgICAgICAgICAgIFtTU09BdXRoRW50cnkuVU5TVEFCTEVfTE9HSU5fVFlQRV06IGRpYWxvZ0Flc3RoZXRpY3MsXG4gICAgICAgICAgICBbUGFzc3dvcmRBdXRoRW50cnkuTE9HSU5fVFlQRV06IHtcbiAgICAgICAgICAgICAgICBbREVGQVVMVF9QSEFTRV06IHtcbiAgICAgICAgICAgICAgICAgICAgYm9keTogX3QoXCJUbyBjb250aW51ZSwgcGxlYXNlIGVudGVyIHlvdXIgYWNjb3VudCBwYXNzd29yZDpcIiksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgYWVzdGhldGljcyA9IERFQUNUSVZBVEVfQUVTVEhFVElDU1tzdGFnZV07XG4gICAgICAgIGxldCBib2R5VGV4dCA9IG51bGw7XG4gICAgICAgIGxldCBjb250aW51ZVRleHQgPSBudWxsO1xuICAgICAgICBsZXQgY29udGludWVLaW5kID0gbnVsbDtcbiAgICAgICAgaWYgKGFlc3RoZXRpY3MpIHtcbiAgICAgICAgICAgIGNvbnN0IHBoYXNlQWVzdGhldGljcyA9IGFlc3RoZXRpY3NbcGhhc2VdO1xuICAgICAgICAgICAgaWYgKHBoYXNlQWVzdGhldGljcyAmJiBwaGFzZUFlc3RoZXRpY3MuYm9keSkgYm9keVRleHQgPSBwaGFzZUFlc3RoZXRpY3MuYm9keTtcbiAgICAgICAgICAgIGlmIChwaGFzZUFlc3RoZXRpY3MgJiYgcGhhc2VBZXN0aGV0aWNzLmNvbnRpbnVlVGV4dCkgY29udGludWVUZXh0ID0gcGhhc2VBZXN0aGV0aWNzLmNvbnRpbnVlVGV4dDtcbiAgICAgICAgICAgIGlmIChwaGFzZUFlc3RoZXRpY3MgJiYgcGhhc2VBZXN0aGV0aWNzLmNvbnRpbnVlS2luZCkgY29udGludWVLaW5kID0gcGhhc2VBZXN0aGV0aWNzLmNvbnRpbnVlS2luZDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgYm9keVRleHQsIGNvbnRpbnVlVGV4dCwgY29udGludWVLaW5kIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVUlBdXRoRmluaXNoZWQ6IEludGVyYWN0aXZlQXV0aENhbGxiYWNrID0gKHN1Y2Nlc3MsIHJlc3VsdCkgPT4ge1xuICAgICAgICBpZiAoc3VjY2VzcykgcmV0dXJuOyAvLyBncmVhdCEgbWFrZVJlcXVlc3QoKSB3aWxsIGJlIGNhbGxlZCB0b28uXG5cbiAgICAgICAgaWYgKHJlc3VsdCA9PT0gRVJST1JfVVNFUl9DQU5DRUxMRUQpIHtcbiAgICAgICAgICAgIHRoaXMub25DYW5jZWwoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvZ2dlci5lcnJvcihcIkVycm9yIGR1cmluZyBVSSBBdXRoOlwiLCB7IHJlc3VsdCB9KTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVyclN0cjogX3QoXCJUaGVyZSB3YXMgYSBwcm9ibGVtIGNvbW11bmljYXRpbmcgd2l0aCB0aGUgc2VydmVyLiBQbGVhc2UgdHJ5IGFnYWluLlwiKSB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblVJQXV0aENvbXBsZXRlID0gKGF1dGg6IElBdXRoRGF0YSk6IHZvaWQgPT4ge1xuICAgICAgICAvLyBYWFg6IHRoaXMgc2hvdWxkIGJlIHJldHVybmluZyBhIHByb21pc2UgdG8gbWFpbnRhaW4gdGhlIHN0YXRlIGluc2lkZSB0aGUgc3RhdGUgbWFjaGluZSBjb3JyZWN0XG4gICAgICAgIC8vIGJ1dCBnaXZlbiB0aGF0IGEgZGVhY3RpdmF0aW9uIGlzIGZvbGxvd2VkIGJ5IGEgbG9jYWwgbG9nb3V0IGFuZCBhbGwgb2JqZWN0IGluc3RhbmNlcyBiZWluZyB0aHJvd24gYXdheVxuICAgICAgICAvLyB0aGlzIGlzbid0IGRvbmUuXG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5kZWFjdGl2YXRlQWNjb3VudChhdXRoLCB0aGlzLnN0YXRlLnNob3VsZEVyYXNlKS50aGVuKHIgPT4ge1xuICAgICAgICAgICAgLy8gRGVhY3RpdmF0aW9uIHdvcmtlZCAtIGxvZ291dCAmIGNsb3NlIHRoaXMgZGlhbG9nXG4gICAgICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci5maXJlKEFjdGlvbi5UcmlnZ2VyTG9nb3V0KTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh0cnVlKTtcbiAgICAgICAgfSkuY2F0Y2goZSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZXJyU3RyOiBfdChcIlRoZXJlIHdhcyBhIHByb2JsZW0gY29tbXVuaWNhdGluZyB3aXRoIHRoZSBzZXJ2ZXIuIFBsZWFzZSB0cnkgYWdhaW4uXCIpIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkVyYXNlRmllbGRDaGFuZ2UgPSAoZXY6IFJlYWN0LkZvcm1FdmVudDxIVE1MSW5wdXRFbGVtZW50Pik6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHNob3VsZEVyYXNlOiBldi5jdXJyZW50VGFyZ2V0LmNoZWNrZWQsXG5cbiAgICAgICAgICAgIC8vIERpc2FibGUgdGhlIGF1dGggZm9ybSBiZWNhdXNlIHdlJ3JlIGdvaW5nIHRvIGhhdmUgdG8gcmVpbml0aWFsaXplIHRoZSBhdXRoXG4gICAgICAgICAgICAvLyBpbmZvcm1hdGlvbi4gV2UgZG8gdGhpcyBiZWNhdXNlIHdlIGNhbid0IG1vZGlmeSB0aGUgcGFyYW1ldGVycyBpbiB0aGUgVUlBXG4gICAgICAgICAgICAvLyBzZXNzaW9uLCBhbmQgdGhlIHVzZXIgd2lsbCBoYXZlIHNlbGVjdGVkIHNvbWV0aGluZyB3aGljaCBjaGFuZ2VzIHRoZSByZXF1ZXN0LlxuICAgICAgICAgICAgLy8gVGhlcmVmb3JlLCB3ZSB0aHJvdyBhd2F5IHRoZSBsYXN0IGF1dGggc2Vzc2lvbiBhbmQgdHJ5IGEgbmV3IG9uZS5cbiAgICAgICAgICAgIGF1dGhFbmFibGVkOiBmYWxzZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQXMgbWVudGlvbmVkIGFib3ZlLCBzZXQgdXAgZm9yIGF1dGggYWdhaW4gdG8gZ2V0IHVwZGF0ZWQgVUlBIHNlc3Npb24gaW5mb1xuICAgICAgICB0aGlzLmluaXRBdXRoKC8qIHNob3VsZEVyYXNlPSAqL2V2LmN1cnJlbnRUYXJnZXQuY2hlY2tlZCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25DYW5jZWwoKTogdm9pZCB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChmYWxzZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpbml0QXV0aChzaG91bGRFcmFzZTogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZGVhY3RpdmF0ZUFjY291bnQobnVsbCwgc2hvdWxkRXJhc2UpLnRoZW4ociA9PiB7XG4gICAgICAgICAgICAvLyBJZiB3ZSBnb3QgaGVyZSwgb29wcy4gVGhlIHNlcnZlciBkaWRuJ3QgcmVxdWlyZSBhbnkgYXV0aC5cbiAgICAgICAgICAgIC8vIE91ciBhcHBsaWNhdGlvbiBsaWZlY3ljbGUgd2lsbCBjYXRjaCB0aGUgZXJyb3IgYW5kIGRvIHRoZSBsb2dvdXQgYml0cy5cbiAgICAgICAgICAgIC8vIFdlJ2xsIHRyeSB0byBsb2cgc29tZXRoaW5nIGluIGFuIHZhaW4gYXR0ZW1wdCB0byByZWNvcmQgd2hhdCBoYXBwZW5lZCAoc3RvcmFnZVxuICAgICAgICAgICAgLy8gaXMgYWxzbyBvYmxpdGVyYXRlZCBvbiBsb2dvdXQpLlxuICAgICAgICAgICAgbG9nZ2VyLndhcm4oXCJVc2VyJ3MgYWNjb3VudCBnb3QgZGVhY3RpdmF0ZWQgd2l0aG91dCBjb25maXJtYXRpb246IFNlcnZlciBoYWQgbm8gYXV0aFwiKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlcnJTdHI6IF90KFwiU2VydmVyIGRpZCBub3QgcmVxdWlyZSBhbnkgYXV0aGVudGljYXRpb25cIikgfSk7XG4gICAgICAgIH0pLmNhdGNoKGUgPT4ge1xuICAgICAgICAgICAgaWYgKGUgJiYgZS5odHRwU3RhdHVzID09PSA0MDEgJiYgZS5kYXRhKSB7XG4gICAgICAgICAgICAgICAgLy8gVmFsaWQgVUlBIHJlc3BvbnNlXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGF1dGhEYXRhOiBlLmRhdGEsIGF1dGhFbmFibGVkOiB0cnVlIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgZXJyU3RyOiBfdChcIlNlcnZlciBkaWQgbm90IHJldHVybiB2YWxpZCBhdXRoZW50aWNhdGlvbiBpbmZvcm1hdGlvbi5cIikgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIoKSB7XG4gICAgICAgIGxldCBlcnJvciA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmVyclN0cikge1xuICAgICAgICAgICAgZXJyb3IgPSA8ZGl2IGNsYXNzTmFtZT1cImVycm9yXCI+XG4gICAgICAgICAgICAgICAgeyB0aGlzLnN0YXRlLmVyclN0ciB9XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYXV0aCA9IDxkaXY+eyBfdChcIkxvYWRpbmcuLi5cIikgfTwvZGl2PjtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuYXV0aERhdGEgJiYgdGhpcy5zdGF0ZS5hdXRoRW5hYmxlZCkge1xuICAgICAgICAgICAgYXV0aCA9IChcbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICB7IHRoaXMuc3RhdGUuYm9keVRleHQgfVxuICAgICAgICAgICAgICAgICAgICA8SW50ZXJhY3RpdmVBdXRoXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXRyaXhDbGllbnQ9e01hdHJpeENsaWVudFBlZy5nZXQoKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dGhEYXRhPXt0aGlzLnN0YXRlLmF1dGhEYXRhfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gWFhYOiBvblVJQXV0aENvbXBsZXRlIGJyZWFjaGVzIHRoZSBleHBlY3RlZCBtZXRob2QgY29udHJhY3QsIGl0IGdldHMgYXdheSB3aXRoIGl0IGJlY2F1c2UgaXRcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGtub3dzIHRoZSBlbnRpcmUgYXBwIGlzIGFib3V0IHRvIGRpZSBhcyBhIHJlc3VsdCBvZiB0aGUgYWNjb3VudCBkZWFjdGl2YXRpb24uXG4gICAgICAgICAgICAgICAgICAgICAgICBtYWtlUmVxdWVzdD17dGhpcy5vblVJQXV0aENvbXBsZXRlIGFzIGFueX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQXV0aEZpbmlzaGVkPXt0aGlzLm9uVUlBdXRoRmluaXNoZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblN0YWdlUGhhc2VDaGFuZ2U9e3RoaXMub25TdGFnZVBoYXNlQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWVUZXh0PXt0aGlzLnN0YXRlLmNvbnRpbnVlVGV4dH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlS2luZD17dGhpcy5zdGF0ZS5jb250aW51ZUtpbmR9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdGhpcyBpcyBvbiBwdXJwb3NlIG5vdCBhIDxmb3JtIC8+IHRvIHByZXZlbnQgRW50ZXIgdHJpZ2dlcmluZyBzdWJtaXNzaW9uLCB0byBmdXJ0aGVyIHByZXZlbnQgYWNjaWRlbnRzXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QmFzZURpYWxvZ1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0RlYWN0aXZhdGVBY2NvdW50RGlhbG9nXCJcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9XG4gICAgICAgICAgICAgICAgdGl0bGVDbGFzcz1cImRhbmdlclwiXG4gICAgICAgICAgICAgICAgdGl0bGU9e190KFwiRGVhY3RpdmF0ZSBBY2NvdW50XCIpfVxuICAgICAgICAgICAgICAgIHNjcmVlbk5hbWU9XCJEZWFjdGl2YXRlQWNjb3VudFwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgICA8cD57IF90KFwiQ29uZmlybSB0aGF0IHlvdSB3b3VsZCBsaWtlIHRvIGRlYWN0aXZhdGUgeW91ciBhY2NvdW50LiBJZiB5b3UgcHJvY2VlZDpcIikgfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGxpPnsgX3QoXCJZb3Ugd2lsbCBub3QgYmUgYWJsZSB0byByZWFjdGl2YXRlIHlvdXIgYWNjb3VudFwiKSB9PC9saT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaT57IF90KFwiWW91IHdpbGwgbm8gbG9uZ2VyIGJlIGFibGUgdG8gbG9nIGluXCIpIH08L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGxpPnsgX3QoXCJObyBvbmUgd2lsbCBiZSBhYmxlIHRvIHJldXNlIHlvdXIgdXNlcm5hbWUgKE1YSUQpLCBpbmNsdWRpbmcgeW91OiB0aGlzIHVzZXJuYW1lIHdpbGwgcmVtYWluIHVuYXZhaWxhYmxlXCIpIH08L2xpPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGxpPnsgX3QoXCJZb3Ugd2lsbCBsZWF2ZSBhbGwgcm9vbXMgYW5kIERNcyB0aGF0IHlvdSBhcmUgaW5cIikgfTwvbGk+XG4gICAgICAgICAgICAgICAgICAgICAgICA8bGk+eyBfdChcIllvdSB3aWxsIGJlIHJlbW92ZWQgZnJvbSB0aGUgaWRlbnRpdHkgc2VydmVyOiB5b3VyIGZyaWVuZHMgd2lsbCBubyBsb25nZXIgYmUgYWJsZSB0byBmaW5kIHlvdSB3aXRoIHlvdXIgZW1haWwgb3IgcGhvbmUgbnVtYmVyXCIpIH08L2xpPlxuICAgICAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICAgICAgICA8cD57IF90KFwiWW91ciBvbGQgbWVzc2FnZXMgd2lsbCBzdGlsbCBiZSB2aXNpYmxlIHRvIHBlb3BsZSB3aG8gcmVjZWl2ZWQgdGhlbSwganVzdCBsaWtlIGVtYWlscyB5b3Ugc2VudCBpbiB0aGUgcGFzdC4gV291bGQgeW91IGxpa2UgdG8gaGlkZSB5b3VyIHNlbnQgbWVzc2FnZXMgZnJvbSBwZW9wbGUgd2hvIGpvaW4gcm9vbXMgaW4gdGhlIGZ1dHVyZT9cIikgfTwvcD5cblxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RlYWN0aXZhdGVBY2NvdW50RGlhbG9nX2lucHV0X3NlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxTdHlsZWRDaGVja2JveFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja2VkPXt0aGlzLnN0YXRlLnNob3VsZEVyYXNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkVyYXNlRmllbGRDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiSGlkZSBteSBtZXNzYWdlcyBmcm9tIG5ldyBqb2luZXJzXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1N0eWxlZENoZWNrYm94PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBlcnJvciB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGF1dGggfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBaUJBOztBQUVBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUE1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFnQ2UsTUFBTUEsdUJBQU4sU0FBc0NDLGNBQUEsQ0FBTUMsU0FBNUMsQ0FBc0U7RUFD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