"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.PhoneNumber = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../../../languageHandler");

var _MatrixClientPeg = require("../../../../MatrixClientPeg");

var _Modal = _interopRequireDefault(require("../../../../Modal"));

var _AddThreepid = _interopRequireDefault(require("../../../../AddThreepid"));

var _ErrorDialog = _interopRequireDefault(require("../../dialogs/ErrorDialog"));

var _Field = _interopRequireDefault(require("../../elements/Field"));

var _AccessibleButton = _interopRequireDefault(require("../../elements/AccessibleButton"));

/*
Copyright 2019 New Vector Ltd
Copyright 2019 The Matrix.org Foundation C.I.C.

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
class PhoneNumber extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onRevokeClick", e => {
      e.stopPropagation();
      e.preventDefault();
      this.changeBinding({
        bind: false,
        label: "revoke",
        errorTitle: (0, _languageHandler._t)("Unable to revoke sharing for phone number")
      });
    });
    (0, _defineProperty2.default)(this, "onShareClick", e => {
      e.stopPropagation();
      e.preventDefault();
      this.changeBinding({
        bind: true,
        label: "share",
        errorTitle: (0, _languageHandler._t)("Unable to share phone number")
      });
    });
    (0, _defineProperty2.default)(this, "onVerificationCodeChange", e => {
      this.setState({
        verificationCode: e.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onContinueClick", async e => {
      e.stopPropagation();
      e.preventDefault();
      this.setState({
        continueDisabled: true
      });
      const token = this.state.verificationCode;

      try {
        await this.state.addTask.haveMsisdnToken(token);
        this.setState({
          addTask: null,
          continueDisabled: false,
          verifying: false,
          verifyError: null,
          verificationCode: ""
        });
      } catch (err) {
        this.setState({
          continueDisabled: false
        });

        if (err.errcode !== 'M_THREEPID_AUTH_FAILED') {
          _logger.logger.error("Unable to verify phone number: " + err);

          _Modal.default.createDialog(_ErrorDialog.default, {
            title: (0, _languageHandler._t)("Unable to verify phone number."),
            description: err && err.message ? err.message : (0, _languageHandler._t)("Operation failed")
          });
        } else {
          this.setState({
            verifyError: (0, _languageHandler._t)("Incorrect verification code")
          });
        }
      }
    });
    const {
      bound
    } = props.msisdn;
    this.state = {
      verifying: false,
      verificationCode: "",
      addTask: null,
      continueDisabled: false,
      bound,
      verifyError: null
    };
  } // TODO: [REACT-WARNING] Replace with appropriate lifecycle event
  // eslint-disable-next-line @typescript-eslint/naming-convention, camelcase


  UNSAFE_componentWillReceiveProps(nextProps) {
    const {
      bound
    } = nextProps.msisdn;
    this.setState({
      bound
    });
  }

  async changeBinding(_ref) {
    let {
      bind,
      label,
      errorTitle
    } = _ref;

    if (!(await _MatrixClientPeg.MatrixClientPeg.get().doesServerSupportSeparateAddAndBind())) {
      return this.changeBindingTangledAddBind({
        bind,
        label,
        errorTitle
      });
    }

    const {
      medium,
      address
    } = this.props.msisdn;

    try {
      if (bind) {
        const task = new _AddThreepid.default();
        this.setState({
          verifying: true,
          continueDisabled: true,
          addTask: task
        }); // XXX: Sydent will accept a number without country code if you add
        // a leading plus sign to a number in E.164 format (which the 3PID
        // address is), but this goes against the spec.
        // See https://github.com/matrix-org/matrix-doc/issues/2222

        await task.bindMsisdn(null, `+${address}`);
        this.setState({
          continueDisabled: false
        });
      } else {
        await _MatrixClientPeg.MatrixClientPeg.get().unbindThreePid(medium, address);
      }

      this.setState({
        bound: bind
      });
    } catch (err) {
      _logger.logger.error(`Unable to ${label} phone number ${address} ${err}`);

      this.setState({
        verifying: false,
        continueDisabled: false,
        addTask: null
      });

      _Modal.default.createDialog(_ErrorDialog.default, {
        title: errorTitle,
        description: err && err.message ? err.message : (0, _languageHandler._t)("Operation failed")
      });
    }
  }

  async changeBindingTangledAddBind(_ref2) {
    let {
      bind,
      label,
      errorTitle
    } = _ref2;
    const {
      medium,
      address
    } = this.props.msisdn;
    const task = new _AddThreepid.default();
    this.setState({
      verifying: true,
      continueDisabled: true,
      addTask: task
    });

    try {
      await _MatrixClientPeg.MatrixClientPeg.get().deleteThreePid(medium, address); // XXX: Sydent will accept a number without country code if you add
      // a leading plus sign to a number in E.164 format (which the 3PID
      // address is), but this goes against the spec.
      // See https://github.com/matrix-org/matrix-doc/issues/2222

      if (bind) {
        await task.bindMsisdn(null, `+${address}`);
      } else {
        await task.addMsisdn(null, `+${address}`);
      }

      this.setState({
        continueDisabled: false,
        bound: bind
      });
    } catch (err) {
      _logger.logger.error(`Unable to ${label} phone number ${address} ${err}`);

      this.setState({
        verifying: false,
        continueDisabled: false,
        addTask: null
      });

      _Modal.default.createDialog(_ErrorDialog.default, {
        title: errorTitle,
        description: err && err.message ? err.message : (0, _languageHandler._t)("Operation failed")
      });
    }
  }

  render() {
    const {
      address
    } = this.props.msisdn;
    const {
      verifying,
      bound
    } = this.state;
    let status;

    if (verifying) {
      status = /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_ExistingPhoneNumber_verification"
      }, /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Please enter verification code sent via text."), /*#__PURE__*/_react.default.createElement("br", null), this.state.verifyError), /*#__PURE__*/_react.default.createElement("form", {
        onSubmit: this.onContinueClick,
        autoComplete: "off",
        noValidate: true
      }, /*#__PURE__*/_react.default.createElement(_Field.default, {
        type: "text",
        label: (0, _languageHandler._t)("Verification code"),
        autoComplete: "off",
        disabled: this.state.continueDisabled,
        value: this.state.verificationCode,
        onChange: this.onVerificationCodeChange
      })));
    } else if (bound) {
      status = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_ExistingPhoneNumber_confirmBtn",
        kind: "danger_sm",
        onClick: this.onRevokeClick
      }, (0, _languageHandler._t)("Revoke"));
    } else {
      status = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_ExistingPhoneNumber_confirmBtn",
        kind: "primary_sm",
        onClick: this.onShareClick
      }, (0, _languageHandler._t)("Share"));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ExistingPhoneNumber"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_ExistingPhoneNumber_address"
    }, "+", address), status);
  }

}

exports.PhoneNumber = PhoneNumber;

class PhoneNumbers extends _react.default.Component {
  render() {
    let content;

    if (this.props.msisdns.length > 0) {
      content = this.props.msisdns.map(e => {
        return /*#__PURE__*/_react.default.createElement(PhoneNumber, {
          msisdn: e,
          key: e.address
        });
      });
    } else {
      content = /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_SettingsTab_subsectionText"
      }, (0, _languageHandler._t)("Discovery options will appear once you have added a phone number above."));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_PhoneNumbers"
    }, content);
  }

}

exports.default = PhoneNumbers;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQaG9uZU51bWJlciIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImUiLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsImNoYW5nZUJpbmRpbmciLCJiaW5kIiwibGFiZWwiLCJlcnJvclRpdGxlIiwiX3QiLCJzZXRTdGF0ZSIsInZlcmlmaWNhdGlvbkNvZGUiLCJ0YXJnZXQiLCJ2YWx1ZSIsImNvbnRpbnVlRGlzYWJsZWQiLCJ0b2tlbiIsInN0YXRlIiwiYWRkVGFzayIsImhhdmVNc2lzZG5Ub2tlbiIsInZlcmlmeWluZyIsInZlcmlmeUVycm9yIiwiZXJyIiwiZXJyY29kZSIsImxvZ2dlciIsImVycm9yIiwiTW9kYWwiLCJjcmVhdGVEaWFsb2ciLCJFcnJvckRpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJtZXNzYWdlIiwiYm91bmQiLCJtc2lzZG4iLCJVTlNBRkVfY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyIsIm5leHRQcm9wcyIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImRvZXNTZXJ2ZXJTdXBwb3J0U2VwYXJhdGVBZGRBbmRCaW5kIiwiY2hhbmdlQmluZGluZ1RhbmdsZWRBZGRCaW5kIiwibWVkaXVtIiwiYWRkcmVzcyIsInRhc2siLCJBZGRUaHJlZXBpZCIsImJpbmRNc2lzZG4iLCJ1bmJpbmRUaHJlZVBpZCIsImRlbGV0ZVRocmVlUGlkIiwiYWRkTXNpc2RuIiwicmVuZGVyIiwic3RhdHVzIiwib25Db250aW51ZUNsaWNrIiwib25WZXJpZmljYXRpb25Db2RlQ2hhbmdlIiwib25SZXZva2VDbGljayIsIm9uU2hhcmVDbGljayIsIlBob25lTnVtYmVycyIsImNvbnRlbnQiLCJtc2lzZG5zIiwibGVuZ3RoIiwibWFwIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3Mvc2V0dGluZ3MvZGlzY292ZXJ5L1Bob25lTnVtYmVycy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBJVGhyZWVwaWQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL3RocmVlcGlkc1wiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gXCIuLi8uLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCBNb2RhbCBmcm9tICcuLi8uLi8uLi8uLi9Nb2RhbCc7XG5pbXBvcnQgQWRkVGhyZWVwaWQgZnJvbSAnLi4vLi4vLi4vLi4vQWRkVGhyZWVwaWQnO1xuaW1wb3J0IEVycm9yRGlhbG9nIGZyb20gXCIuLi8uLi9kaWFsb2dzL0Vycm9yRGlhbG9nXCI7XG5pbXBvcnQgRmllbGQgZnJvbSBcIi4uLy4uL2VsZW1lbnRzL0ZpZWxkXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuXG4vKlxuVE9ETzogSW1wcm92ZSB0aGUgVVggZm9yIGV2ZXJ5dGhpbmcgaW4gaGVyZS5cblRoaXMgaXMgYSBjb3B5L3Bhc3RlIG9mIEVtYWlsQWRkcmVzc2VzLCBtb3N0bHkuXG4gKi9cblxuLy8gVE9ETzogQ29tYmluZSBFbWFpbEFkZHJlc3NlcyBhbmQgUGhvbmVOdW1iZXJzIHRvIGJlIDNwaWQgYWdub3N0aWNcblxuaW50ZXJmYWNlIElQaG9uZU51bWJlclByb3BzIHtcbiAgICBtc2lzZG46IElUaHJlZXBpZDtcbn1cblxuaW50ZXJmYWNlIElQaG9uZU51bWJlclN0YXRlIHtcbiAgICB2ZXJpZnlpbmc6IGJvb2xlYW47XG4gICAgdmVyaWZpY2F0aW9uQ29kZTogc3RyaW5nO1xuICAgIGFkZFRhc2s6IGFueTsgLy8gRklYTUU6IFdoZW4gQWRkVGhyZWVwaWQgaXMgVFNmaWVkXG4gICAgY29udGludWVEaXNhYmxlZDogYm9vbGVhbjtcbiAgICBib3VuZDogYm9vbGVhbjtcbiAgICB2ZXJpZnlFcnJvcjogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgUGhvbmVOdW1iZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVBob25lTnVtYmVyUHJvcHMsIElQaG9uZU51bWJlclN0YXRlPiB7XG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQaG9uZU51bWJlclByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICBjb25zdCB7IGJvdW5kIH0gPSBwcm9wcy5tc2lzZG47XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHZlcmlmeWluZzogZmFsc2UsXG4gICAgICAgICAgICB2ZXJpZmljYXRpb25Db2RlOiBcIlwiLFxuICAgICAgICAgICAgYWRkVGFzazogbnVsbCxcbiAgICAgICAgICAgIGNvbnRpbnVlRGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgYm91bmQsXG4gICAgICAgICAgICB2ZXJpZnlFcnJvcjogbnVsbCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBbUkVBQ1QtV0FSTklOR10gUmVwbGFjZSB3aXRoIGFwcHJvcHJpYXRlIGxpZmVjeWNsZSBldmVudFxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbmFtaW5nLWNvbnZlbnRpb24sIGNhbWVsY2FzZVxuICAgIHB1YmxpYyBVTlNBRkVfY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHM6IElQaG9uZU51bWJlclByb3BzKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHsgYm91bmQgfSA9IG5leHRQcm9wcy5tc2lzZG47XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBib3VuZCB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGNoYW5nZUJpbmRpbmcoeyBiaW5kLCBsYWJlbCwgZXJyb3JUaXRsZSB9KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGlmICghKGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5kb2VzU2VydmVyU3VwcG9ydFNlcGFyYXRlQWRkQW5kQmluZCgpKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hhbmdlQmluZGluZ1RhbmdsZWRBZGRCaW5kKHsgYmluZCwgbGFiZWwsIGVycm9yVGl0bGUgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB7IG1lZGl1bSwgYWRkcmVzcyB9ID0gdGhpcy5wcm9wcy5tc2lzZG47XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChiaW5kKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGFzayA9IG5ldyBBZGRUaHJlZXBpZCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICB2ZXJpZnlpbmc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlRGlzYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGFkZFRhc2s6IHRhc2ssXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgLy8gWFhYOiBTeWRlbnQgd2lsbCBhY2NlcHQgYSBudW1iZXIgd2l0aG91dCBjb3VudHJ5IGNvZGUgaWYgeW91IGFkZFxuICAgICAgICAgICAgICAgIC8vIGEgbGVhZGluZyBwbHVzIHNpZ24gdG8gYSBudW1iZXIgaW4gRS4xNjQgZm9ybWF0ICh3aGljaCB0aGUgM1BJRFxuICAgICAgICAgICAgICAgIC8vIGFkZHJlc3MgaXMpLCBidXQgdGhpcyBnb2VzIGFnYWluc3QgdGhlIHNwZWMuXG4gICAgICAgICAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRyaXgtb3JnL21hdHJpeC1kb2MvaXNzdWVzLzIyMjJcbiAgICAgICAgICAgICAgICBhd2FpdCB0YXNrLmJpbmRNc2lzZG4obnVsbCwgYCske2FkZHJlc3N9YCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlRGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkudW5iaW5kVGhyZWVQaWQobWVkaXVtLCBhZGRyZXNzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBib3VuZDogYmluZCB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoYFVuYWJsZSB0byAke2xhYmVsfSBwaG9uZSBudW1iZXIgJHthZGRyZXNzfSAke2Vycn1gKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHZlcmlmeWluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29udGludWVEaXNhYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgYWRkVGFzazogbnVsbCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IGVycm9yVGl0bGUsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICgoZXJyICYmIGVyci5tZXNzYWdlKSA/IGVyci5tZXNzYWdlIDogX3QoXCJPcGVyYXRpb24gZmFpbGVkXCIpKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBjaGFuZ2VCaW5kaW5nVGFuZ2xlZEFkZEJpbmQoeyBiaW5kLCBsYWJlbCwgZXJyb3JUaXRsZSB9KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IHsgbWVkaXVtLCBhZGRyZXNzIH0gPSB0aGlzLnByb3BzLm1zaXNkbjtcblxuICAgICAgICBjb25zdCB0YXNrID0gbmV3IEFkZFRocmVlcGlkKCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdmVyaWZ5aW5nOiB0cnVlLFxuICAgICAgICAgICAgY29udGludWVEaXNhYmxlZDogdHJ1ZSxcbiAgICAgICAgICAgIGFkZFRhc2s6IHRhc2ssXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZGVsZXRlVGhyZWVQaWQobWVkaXVtLCBhZGRyZXNzKTtcbiAgICAgICAgICAgIC8vIFhYWDogU3lkZW50IHdpbGwgYWNjZXB0IGEgbnVtYmVyIHdpdGhvdXQgY291bnRyeSBjb2RlIGlmIHlvdSBhZGRcbiAgICAgICAgICAgIC8vIGEgbGVhZGluZyBwbHVzIHNpZ24gdG8gYSBudW1iZXIgaW4gRS4xNjQgZm9ybWF0ICh3aGljaCB0aGUgM1BJRFxuICAgICAgICAgICAgLy8gYWRkcmVzcyBpcyksIGJ1dCB0aGlzIGdvZXMgYWdhaW5zdCB0aGUgc3BlYy5cbiAgICAgICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWF0cml4LW9yZy9tYXRyaXgtZG9jL2lzc3Vlcy8yMjIyXG4gICAgICAgICAgICBpZiAoYmluZCkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRhc2suYmluZE1zaXNkbihudWxsLCBgKyR7YWRkcmVzc31gKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGFzay5hZGRNc2lzZG4obnVsbCwgYCske2FkZHJlc3N9YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBjb250aW51ZURpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBib3VuZDogYmluZCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihgVW5hYmxlIHRvICR7bGFiZWx9IHBob25lIG51bWJlciAke2FkZHJlc3N9ICR7ZXJyfWApO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgdmVyaWZ5aW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb250aW51ZURpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBhZGRUYXNrOiBudWxsLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogZXJyb3JUaXRsZSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogKChlcnIgJiYgZXJyLm1lc3NhZ2UpID8gZXJyLm1lc3NhZ2UgOiBfdChcIk9wZXJhdGlvbiBmYWlsZWRcIikpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUmV2b2tlQ2xpY2sgPSAoZTogUmVhY3QuTW91c2VFdmVudCk6IHZvaWQgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuY2hhbmdlQmluZGluZyh7XG4gICAgICAgICAgICBiaW5kOiBmYWxzZSxcbiAgICAgICAgICAgIGxhYmVsOiBcInJldm9rZVwiLFxuICAgICAgICAgICAgZXJyb3JUaXRsZTogX3QoXCJVbmFibGUgdG8gcmV2b2tlIHNoYXJpbmcgZm9yIHBob25lIG51bWJlclwiKSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25TaGFyZUNsaWNrID0gKGU6IFJlYWN0Lk1vdXNlRXZlbnQpOiB2b2lkID0+IHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLmNoYW5nZUJpbmRpbmcoe1xuICAgICAgICAgICAgYmluZDogdHJ1ZSxcbiAgICAgICAgICAgIGxhYmVsOiBcInNoYXJlXCIsXG4gICAgICAgICAgICBlcnJvclRpdGxlOiBfdChcIlVuYWJsZSB0byBzaGFyZSBwaG9uZSBudW1iZXJcIiksXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVmVyaWZpY2F0aW9uQ29kZUNoYW5nZSA9IChlOiBSZWFjdC5DaGFuZ2VFdmVudDxIVE1MSW5wdXRFbGVtZW50Pik6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHZlcmlmaWNhdGlvbkNvZGU6IGUudGFyZ2V0LnZhbHVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNvbnRpbnVlQ2xpY2sgPSBhc3luYyAoZTogUmVhY3QuTW91c2VFdmVudCB8IFJlYWN0LkZvcm1FdmVudCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvbnRpbnVlRGlzYWJsZWQ6IHRydWUgfSk7XG4gICAgICAgIGNvbnN0IHRva2VuID0gdGhpcy5zdGF0ZS52ZXJpZmljYXRpb25Db2RlO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zdGF0ZS5hZGRUYXNrLmhhdmVNc2lzZG5Ub2tlbih0b2tlbik7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBhZGRUYXNrOiBudWxsLFxuICAgICAgICAgICAgICAgIGNvbnRpbnVlRGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZlcmlmeWluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgdmVyaWZ5RXJyb3I6IG51bGwsXG4gICAgICAgICAgICAgICAgdmVyaWZpY2F0aW9uQ29kZTogXCJcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjb250aW51ZURpc2FibGVkOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIGlmIChlcnIuZXJyY29kZSAhPT0gJ01fVEhSRUVQSURfQVVUSF9GQUlMRUQnKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiVW5hYmxlIHRvIHZlcmlmeSBwaG9uZSBudW1iZXI6IFwiICsgZXJyKTtcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiVW5hYmxlIHRvIHZlcmlmeSBwaG9uZSBudW1iZXIuXCIpLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogKChlcnIgJiYgZXJyLm1lc3NhZ2UpID8gZXJyLm1lc3NhZ2UgOiBfdChcIk9wZXJhdGlvbiBmYWlsZWRcIikpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgdmVyaWZ5RXJyb3I6IF90KFwiSW5jb3JyZWN0IHZlcmlmaWNhdGlvbiBjb2RlXCIpIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHB1YmxpYyByZW5kZXIoKTogSlNYLkVsZW1lbnQge1xuICAgICAgICBjb25zdCB7IGFkZHJlc3MgfSA9IHRoaXMucHJvcHMubXNpc2RuO1xuICAgICAgICBjb25zdCB7IHZlcmlmeWluZywgYm91bmQgfSA9IHRoaXMuc3RhdGU7XG5cbiAgICAgICAgbGV0IHN0YXR1cztcbiAgICAgICAgaWYgKHZlcmlmeWluZykge1xuICAgICAgICAgICAgc3RhdHVzID0gPHNwYW4gY2xhc3NOYW1lPVwibXhfRXhpc3RpbmdQaG9uZU51bWJlcl92ZXJpZmljYXRpb25cIj5cbiAgICAgICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIlBsZWFzZSBlbnRlciB2ZXJpZmljYXRpb24gY29kZSBzZW50IHZpYSB0ZXh0LlwiKSB9XG4gICAgICAgICAgICAgICAgICAgIDxiciAvPlxuICAgICAgICAgICAgICAgICAgICB7IHRoaXMuc3RhdGUudmVyaWZ5RXJyb3IgfVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8Zm9ybSBvblN1Ym1pdD17dGhpcy5vbkNvbnRpbnVlQ2xpY2t9IGF1dG9Db21wbGV0ZT1cIm9mZlwiIG5vVmFsaWRhdGU9e3RydWV9PlxuICAgICAgICAgICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIlZlcmlmaWNhdGlvbiBjb2RlXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwib2ZmXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLmNvbnRpbnVlRGlzYWJsZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS52ZXJpZmljYXRpb25Db2RlfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25WZXJpZmljYXRpb25Db2RlQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgIDwvc3Bhbj47XG4gICAgICAgIH0gZWxzZSBpZiAoYm91bmQpIHtcbiAgICAgICAgICAgIHN0YXR1cyA9IDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfRXhpc3RpbmdQaG9uZU51bWJlcl9jb25maXJtQnRuXCJcbiAgICAgICAgICAgICAgICBraW5kPVwiZGFuZ2VyX3NtXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uUmV2b2tlQ2xpY2t9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyBfdChcIlJldm9rZVwiKSB9XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdHVzID0gPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9FeGlzdGluZ1Bob25lTnVtYmVyX2NvbmZpcm1CdG5cIlxuICAgICAgICAgICAgICAgIGtpbmQ9XCJwcmltYXJ5X3NtXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uU2hhcmVDbGlja31cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IF90KFwiU2hhcmVcIikgfVxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0V4aXN0aW5nUGhvbmVOdW1iZXJcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9FeGlzdGluZ1Bob25lTnVtYmVyX2FkZHJlc3NcIj4reyBhZGRyZXNzIH08L3NwYW4+XG4gICAgICAgICAgICAgICAgeyBzdGF0dXMgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBtc2lzZG5zOiBJVGhyZWVwaWRbXTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGhvbmVOdW1iZXJzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcz4ge1xuICAgIHB1YmxpYyByZW5kZXIoKTogSlNYLkVsZW1lbnQge1xuICAgICAgICBsZXQgY29udGVudDtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMubXNpc2Rucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb250ZW50ID0gdGhpcy5wcm9wcy5tc2lzZG5zLm1hcCgoZSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiA8UGhvbmVOdW1iZXIgbXNpc2RuPXtlfSBrZXk9e2UuYWRkcmVzc30gLz47XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRlbnQgPSA8c3BhbiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9zdWJzZWN0aW9uVGV4dFwiPlxuICAgICAgICAgICAgICAgIHsgX3QoXCJEaXNjb3Zlcnkgb3B0aW9ucyB3aWxsIGFwcGVhciBvbmNlIHlvdSBoYXZlIGFkZGVkIGEgcGhvbmUgbnVtYmVyIGFib3ZlLlwiKSB9XG4gICAgICAgICAgICA8L3NwYW4+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUGhvbmVOdW1iZXJzXCI+XG4gICAgICAgICAgICAgICAgeyBjb250ZW50IH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFpQkE7O0FBRUE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBa0NPLE1BQU1BLFdBQU4sU0FBMEJDLGNBQUEsQ0FBTUMsU0FBaEMsQ0FBZ0Y7RUFDbkZDLFdBQVcsQ0FBQ0MsS0FBRCxFQUEyQjtJQUNsQyxNQUFNQSxLQUFOO0lBRGtDLHFEQXNHYkMsQ0FBRCxJQUErQjtNQUNuREEsQ0FBQyxDQUFDQyxlQUFGO01BQ0FELENBQUMsQ0FBQ0UsY0FBRjtNQUNBLEtBQUtDLGFBQUwsQ0FBbUI7UUFDZkMsSUFBSSxFQUFFLEtBRFM7UUFFZkMsS0FBSyxFQUFFLFFBRlE7UUFHZkMsVUFBVSxFQUFFLElBQUFDLG1CQUFBLEVBQUcsMkNBQUg7TUFIRyxDQUFuQjtJQUtILENBOUdxQztJQUFBLG9EQWdIZFAsQ0FBRCxJQUErQjtNQUNsREEsQ0FBQyxDQUFDQyxlQUFGO01BQ0FELENBQUMsQ0FBQ0UsY0FBRjtNQUNBLEtBQUtDLGFBQUwsQ0FBbUI7UUFDZkMsSUFBSSxFQUFFLElBRFM7UUFFZkMsS0FBSyxFQUFFLE9BRlE7UUFHZkMsVUFBVSxFQUFFLElBQUFDLG1CQUFBLEVBQUcsOEJBQUg7TUFIRyxDQUFuQjtJQUtILENBeEhxQztJQUFBLGdFQTBIRlAsQ0FBRCxJQUFrRDtNQUNqRixLQUFLUSxRQUFMLENBQWM7UUFDVkMsZ0JBQWdCLEVBQUVU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