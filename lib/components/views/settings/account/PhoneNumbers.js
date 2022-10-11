"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.ExistingPhoneNumber = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _threepids = require("matrix-js-sdk/src/@types/threepids");

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../../../languageHandler");

var _MatrixClientPeg = require("../../../../MatrixClientPeg");

var _Field = _interopRequireDefault(require("../../elements/Field"));

var _AccessibleButton = _interopRequireDefault(require("../../elements/AccessibleButton"));

var _AddThreepid = _interopRequireDefault(require("../../../../AddThreepid"));

var _CountryDropdown = _interopRequireDefault(require("../../auth/CountryDropdown"));

var _Modal = _interopRequireDefault(require("../../../../Modal"));

var _ErrorDialog = _interopRequireDefault(require("../../dialogs/ErrorDialog"));

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
class ExistingPhoneNumber extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onRemove", e => {
      e.stopPropagation();
      e.preventDefault();
      this.setState({
        verifyRemove: true
      });
    });
    (0, _defineProperty2.default)(this, "onDontRemove", e => {
      e.stopPropagation();
      e.preventDefault();
      this.setState({
        verifyRemove: false
      });
    });
    (0, _defineProperty2.default)(this, "onActuallyRemove", e => {
      e.stopPropagation();
      e.preventDefault();

      _MatrixClientPeg.MatrixClientPeg.get().deleteThreePid(this.props.msisdn.medium, this.props.msisdn.address).then(() => {
        return this.props.onRemoved(this.props.msisdn);
      }).catch(err => {
        _logger.logger.error("Unable to remove contact information: " + err);

        _Modal.default.createDialog(_ErrorDialog.default, {
          title: (0, _languageHandler._t)("Unable to remove contact information"),
          description: err && err.message ? err.message : (0, _languageHandler._t)("Operation failed")
        });
      });
    });
    this.state = {
      verifyRemove: false
    };
  }

  render() {
    if (this.state.verifyRemove) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_ExistingPhoneNumber"
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_ExistingPhoneNumber_promptText"
      }, (0, _languageHandler._t)("Remove %(phone)s?", {
        phone: this.props.msisdn.address
      })), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.onActuallyRemove,
        kind: "danger_sm",
        className: "mx_ExistingPhoneNumber_confirmBtn"
      }, (0, _languageHandler._t)("Remove")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.onDontRemove,
        kind: "link_sm",
        className: "mx_ExistingPhoneNumber_confirmBtn"
      }, (0, _languageHandler._t)("Cancel")));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ExistingPhoneNumber"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_ExistingPhoneNumber_address"
    }, "+", this.props.msisdn.address), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this.onRemove,
      kind: "danger_sm"
    }, (0, _languageHandler._t)("Remove")));
  }

}

exports.ExistingPhoneNumber = ExistingPhoneNumber;

class PhoneNumbers extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onRemoved", address => {
      const msisdns = this.props.msisdns.filter(e => e !== address);
      this.props.onMsisdnsChange(msisdns);
    });
    (0, _defineProperty2.default)(this, "onChangeNewPhoneNumber", e => {
      this.setState({
        newPhoneNumber: e.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onChangeNewPhoneNumberCode", e => {
      this.setState({
        newPhoneNumberCode: e.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onAddClick", e => {
      e.stopPropagation();
      e.preventDefault();
      if (!this.state.newPhoneNumber) return;
      const phoneNumber = this.state.newPhoneNumber;
      const phoneCountry = this.state.phoneCountry;
      const task = new _AddThreepid.default();
      this.setState({
        verifying: true,
        continueDisabled: true,
        addTask: task
      });
      task.addMsisdn(phoneCountry, phoneNumber).then(response => {
        this.setState({
          continueDisabled: false,
          verifyMsisdn: response.msisdn
        });
      }).catch(err => {
        _logger.logger.error("Unable to add phone number " + phoneNumber + " " + err);

        this.setState({
          verifying: false,
          continueDisabled: false,
          addTask: null
        });

        _Modal.default.createDialog(_ErrorDialog.default, {
          title: (0, _languageHandler._t)("Error"),
          description: err && err.message ? err.message : (0, _languageHandler._t)("Operation failed")
        });
      });
    });
    (0, _defineProperty2.default)(this, "onContinueClick", e => {
      e.stopPropagation();
      e.preventDefault();
      this.setState({
        continueDisabled: true
      });
      const token = this.state.newPhoneNumberCode;
      const address = this.state.verifyMsisdn;
      this.state.addTask.haveMsisdnToken(token).then(_ref => {
        let [finished] = _ref;
        let newPhoneNumber = this.state.newPhoneNumber;

        if (finished) {
          const msisdns = [...this.props.msisdns, {
            address,
            medium: _threepids.ThreepidMedium.Phone
          }];
          this.props.onMsisdnsChange(msisdns);
          newPhoneNumber = "";
        }

        this.setState({
          addTask: null,
          continueDisabled: false,
          verifying: false,
          verifyMsisdn: "",
          verifyError: null,
          newPhoneNumber,
          newPhoneNumberCode: ""
        });
      }).catch(err => {
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
      });
    });
    (0, _defineProperty2.default)(this, "onCountryChanged", country => {
      this.setState({
        phoneCountry: country.iso2
      });
    });
    this.state = {
      verifying: false,
      verifyError: null,
      verifyMsisdn: "",
      addTask: null,
      continueDisabled: false,
      phoneCountry: "",
      newPhoneNumber: "",
      newPhoneNumberCode: ""
    };
  }

  render() {
    const existingPhoneElements = this.props.msisdns.map(p => {
      return /*#__PURE__*/_react.default.createElement(ExistingPhoneNumber, {
        msisdn: p,
        onRemoved: this.onRemoved,
        key: p.address
      });
    });

    let addVerifySection = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this.onAddClick,
      kind: "primary"
    }, (0, _languageHandler._t)("Add"));

    if (this.state.verifying) {
      const msisdn = this.state.verifyMsisdn;
      addVerifySection = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("A text message has been sent to +%(msisdn)s. " + "Please enter the verification code it contains.", {
        msisdn: msisdn
      }), /*#__PURE__*/_react.default.createElement("br", null), this.state.verifyError), /*#__PURE__*/_react.default.createElement("form", {
        onSubmit: this.onContinueClick,
        autoComplete: "off",
        noValidate: true
      }, /*#__PURE__*/_react.default.createElement(_Field.default, {
        type: "text",
        label: (0, _languageHandler._t)("Verification code"),
        autoComplete: "off",
        disabled: this.state.continueDisabled,
        value: this.state.newPhoneNumberCode,
        onChange: this.onChangeNewPhoneNumberCode
      }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.onContinueClick,
        kind: "primary",
        disabled: this.state.continueDisabled || this.state.newPhoneNumberCode.length === 0
      }, (0, _languageHandler._t)("Continue"))));
    }

    const phoneCountry = /*#__PURE__*/_react.default.createElement(_CountryDropdown.default, {
      onOptionChange: this.onCountryChanged,
      className: "mx_PhoneNumbers_country",
      value: this.state.phoneCountry,
      disabled: this.state.verifying,
      isSmall: true,
      showPrefix: true
    });

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_PhoneNumbers"
    }, existingPhoneElements, /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.onAddClick,
      autoComplete: "off",
      noValidate: true,
      className: "mx_PhoneNumbers_new"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_PhoneNumbers_input"
    }, /*#__PURE__*/_react.default.createElement(_Field.default, {
      type: "text",
      label: (0, _languageHandler._t)("Phone Number"),
      autoComplete: "off",
      disabled: this.state.verifying,
      prefixComponent: phoneCountry,
      value: this.state.newPhoneNumber,
      onChange: this.onChangeNewPhoneNumber
    }))), addVerifySection);
  }

}

exports.default = PhoneNumbers;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFeGlzdGluZ1Bob25lTnVtYmVyIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiZSIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0Iiwic2V0U3RhdGUiLCJ2ZXJpZnlSZW1vdmUiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJkZWxldGVUaHJlZVBpZCIsIm1zaXNkbiIsIm1lZGl1bSIsImFkZHJlc3MiLCJ0aGVuIiwib25SZW1vdmVkIiwiY2F0Y2giLCJlcnIiLCJsb2dnZXIiLCJlcnJvciIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwiRXJyb3JEaWFsb2ciLCJ0aXRsZSIsIl90IiwiZGVzY3JpcHRpb24iLCJtZXNzYWdlIiwic3RhdGUiLCJyZW5kZXIiLCJwaG9uZSIsIm9uQWN0dWFsbHlSZW1vdmUiLCJvbkRvbnRSZW1vdmUiLCJvblJlbW92ZSIsIlBob25lTnVtYmVycyIsIm1zaXNkbnMiLCJmaWx0ZXIiLCJvbk1zaXNkbnNDaGFuZ2UiLCJuZXdQaG9uZU51bWJlciIsInRhcmdldCIsInZhbHVlIiwibmV3UGhvbmVOdW1iZXJDb2RlIiwicGhvbmVOdW1iZXIiLCJwaG9uZUNvdW50cnkiLCJ0YXNrIiwiQWRkVGhyZWVwaWQiLCJ2ZXJpZnlpbmciLCJjb250aW51ZURpc2FibGVkIiwiYWRkVGFzayIsImFkZE1zaXNkbiIsInJlc3BvbnNlIiwidmVyaWZ5TXNpc2RuIiwidG9rZW4iLCJoYXZlTXNpc2RuVG9rZW4iLCJmaW5pc2hlZCIsIlRocmVlcGlkTWVkaXVtIiwiUGhvbmUiLCJ2ZXJpZnlFcnJvciIsImVycmNvZGUiLCJjb3VudHJ5IiwiaXNvMiIsImV4aXN0aW5nUGhvbmVFbGVtZW50cyIsIm1hcCIsInAiLCJhZGRWZXJpZnlTZWN0aW9uIiwib25BZGRDbGljayIsIm9uQ29udGludWVDbGljayIsIm9uQ2hhbmdlTmV3UGhvbmVOdW1iZXJDb2RlIiwibGVuZ3RoIiwib25Db3VudHJ5Q2hhbmdlZCIsIm9uQ2hhbmdlTmV3UGhvbmVOdW1iZXIiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9zZXR0aW5ncy9hY2NvdW50L1Bob25lTnVtYmVycy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBJVGhyZWVwaWQsIFRocmVlcGlkTWVkaXVtIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy90aHJlZXBpZHNcIjtcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcblxuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tIFwiLi4vLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgRmllbGQgZnJvbSBcIi4uLy4uL2VsZW1lbnRzL0ZpZWxkXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IEFkZFRocmVlcGlkIGZyb20gXCIuLi8uLi8uLi8uLi9BZGRUaHJlZXBpZFwiO1xuaW1wb3J0IENvdW50cnlEcm9wZG93biBmcm9tIFwiLi4vLi4vYXV0aC9Db3VudHJ5RHJvcGRvd25cIjtcbmltcG9ydCBNb2RhbCBmcm9tICcuLi8uLi8uLi8uLi9Nb2RhbCc7XG5pbXBvcnQgRXJyb3JEaWFsb2cgZnJvbSBcIi4uLy4uL2RpYWxvZ3MvRXJyb3JEaWFsb2dcIjtcbmltcG9ydCB7IFBob25lTnVtYmVyQ291bnRyeURlZmluaXRpb24gfSBmcm9tIFwiLi4vLi4vLi4vLi4vcGhvbmVudW1iZXJcIjtcblxuLypcblRPRE86IEltcHJvdmUgdGhlIFVYIGZvciBldmVyeXRoaW5nIGluIGhlcmUuXG5UaGlzIGlzIGEgY29weS9wYXN0ZSBvZiBFbWFpbEFkZHJlc3NlcywgbW9zdGx5LlxuICovXG5cbi8vIFRPRE86IENvbWJpbmUgRW1haWxBZGRyZXNzZXMgYW5kIFBob25lTnVtYmVycyB0byBiZSAzcGlkIGFnbm9zdGljXG5cbmludGVyZmFjZSBJRXhpc3RpbmdQaG9uZU51bWJlclByb3BzIHtcbiAgICBtc2lzZG46IElUaHJlZXBpZDtcbiAgICBvblJlbW92ZWQ6IChwaG9uZU51bWJlcjogSVRocmVlcGlkKSA9PiB2b2lkO1xufVxuXG5pbnRlcmZhY2UgSUV4aXN0aW5nUGhvbmVOdW1iZXJTdGF0ZSB7XG4gICAgdmVyaWZ5UmVtb3ZlOiBib29sZWFuO1xufVxuXG5leHBvcnQgY2xhc3MgRXhpc3RpbmdQaG9uZU51bWJlciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJRXhpc3RpbmdQaG9uZU51bWJlclByb3BzLCBJRXhpc3RpbmdQaG9uZU51bWJlclN0YXRlPiB7XG4gICAgY29uc3RydWN0b3IocHJvcHM6IElFeGlzdGluZ1Bob25lTnVtYmVyUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICB2ZXJpZnlSZW1vdmU6IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgb25SZW1vdmUgPSAoZTogUmVhY3QuTW91c2VFdmVudCk6IHZvaWQgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHZlcmlmeVJlbW92ZTogdHJ1ZSB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkRvbnRSZW1vdmUgPSAoZTogUmVhY3QuTW91c2VFdmVudCk6IHZvaWQgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHZlcmlmeVJlbW92ZTogZmFsc2UgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25BY3R1YWxseVJlbW92ZSA9IChlOiBSZWFjdC5Nb3VzZUV2ZW50KTogdm9pZCA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZGVsZXRlVGhyZWVQaWQodGhpcy5wcm9wcy5tc2lzZG4ubWVkaXVtLCB0aGlzLnByb3BzLm1zaXNkbi5hZGRyZXNzKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByb3BzLm9uUmVtb3ZlZCh0aGlzLnByb3BzLm1zaXNkbik7XG4gICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIlVuYWJsZSB0byByZW1vdmUgY29udGFjdCBpbmZvcm1hdGlvbjogXCIgKyBlcnIpO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiVW5hYmxlIHRvIHJlbW92ZSBjb250YWN0IGluZm9ybWF0aW9uXCIpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAoKGVyciAmJiBlcnIubWVzc2FnZSkgPyBlcnIubWVzc2FnZSA6IF90KFwiT3BlcmF0aW9uIGZhaWxlZFwiKSksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHB1YmxpYyByZW5kZXIoKTogSlNYLkVsZW1lbnQge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS52ZXJpZnlSZW1vdmUpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FeGlzdGluZ1Bob25lTnVtYmVyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0V4aXN0aW5nUGhvbmVOdW1iZXJfcHJvbXB0VGV4dFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIlJlbW92ZSAlKHBob25lKXM/XCIsIHsgcGhvbmU6IHRoaXMucHJvcHMubXNpc2RuLmFkZHJlc3MgfSkgfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQWN0dWFsbHlSZW1vdmV9XG4gICAgICAgICAgICAgICAgICAgICAgICBraW5kPVwiZGFuZ2VyX3NtXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0V4aXN0aW5nUGhvbmVOdW1iZXJfY29uZmlybUJ0blwiXG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJSZW1vdmVcIikgfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uRG9udFJlbW92ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJsaW5rX3NtXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0V4aXN0aW5nUGhvbmVOdW1iZXJfY29uZmlybUJ0blwiXG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJDYW5jZWxcIikgfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRXhpc3RpbmdQaG9uZU51bWJlclwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0V4aXN0aW5nUGhvbmVOdW1iZXJfYWRkcmVzc1wiPit7IHRoaXMucHJvcHMubXNpc2RuLmFkZHJlc3MgfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXt0aGlzLm9uUmVtb3ZlfSBraW5kPVwiZGFuZ2VyX3NtXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJSZW1vdmVcIikgfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgbXNpc2RuczogSVRocmVlcGlkW107XG4gICAgb25Nc2lzZG5zQ2hhbmdlOiAocGhvbmVOdW1iZXJzOiBQYXJ0aWFsPElUaHJlZXBpZD5bXSkgPT4gdm9pZDtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgdmVyaWZ5aW5nOiBib29sZWFuO1xuICAgIHZlcmlmeUVycm9yOiBzdHJpbmc7XG4gICAgdmVyaWZ5TXNpc2RuOiBzdHJpbmc7XG4gICAgYWRkVGFzazogYW55OyAvLyBGSVhNRTogV2hlbiBBZGRUaHJlZXBpZCBpcyBUU2ZpZWRcbiAgICBjb250aW51ZURpc2FibGVkOiBib29sZWFuO1xuICAgIHBob25lQ291bnRyeTogc3RyaW5nO1xuICAgIG5ld1Bob25lTnVtYmVyOiBzdHJpbmc7XG4gICAgbmV3UGhvbmVOdW1iZXJDb2RlOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBob25lTnVtYmVycyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBJUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICB2ZXJpZnlpbmc6IGZhbHNlLFxuICAgICAgICAgICAgdmVyaWZ5RXJyb3I6IG51bGwsXG4gICAgICAgICAgICB2ZXJpZnlNc2lzZG46IFwiXCIsXG4gICAgICAgICAgICBhZGRUYXNrOiBudWxsLFxuICAgICAgICAgICAgY29udGludWVEaXNhYmxlZDogZmFsc2UsXG4gICAgICAgICAgICBwaG9uZUNvdW50cnk6IFwiXCIsXG4gICAgICAgICAgICBuZXdQaG9uZU51bWJlcjogXCJcIixcbiAgICAgICAgICAgIG5ld1Bob25lTnVtYmVyQ29kZTogXCJcIixcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUmVtb3ZlZCA9IChhZGRyZXNzOiBJVGhyZWVwaWQpOiB2b2lkID0+IHtcbiAgICAgICAgY29uc3QgbXNpc2RucyA9IHRoaXMucHJvcHMubXNpc2Rucy5maWx0ZXIoKGUpID0+IGUgIT09IGFkZHJlc3MpO1xuICAgICAgICB0aGlzLnByb3BzLm9uTXNpc2Ruc0NoYW5nZShtc2lzZG5zKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNoYW5nZU5ld1Bob25lTnVtYmVyID0gKGU6IFJlYWN0LkNoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbmV3UGhvbmVOdW1iZXI6IGUudGFyZ2V0LnZhbHVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNoYW5nZU5ld1Bob25lTnVtYmVyQ29kZSA9IChlOiBSZWFjdC5DaGFuZ2VFdmVudDxIVE1MSW5wdXRFbGVtZW50Pik6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIG5ld1Bob25lTnVtYmVyQ29kZTogZS50YXJnZXQudmFsdWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQWRkQ2xpY2sgPSAoZTogUmVhY3QuTW91c2VFdmVudCB8IFJlYWN0LkZvcm1FdmVudCk6IHZvaWQgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLm5ld1Bob25lTnVtYmVyKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgcGhvbmVOdW1iZXIgPSB0aGlzLnN0YXRlLm5ld1Bob25lTnVtYmVyO1xuICAgICAgICBjb25zdCBwaG9uZUNvdW50cnkgPSB0aGlzLnN0YXRlLnBob25lQ291bnRyeTtcblxuICAgICAgICBjb25zdCB0YXNrID0gbmV3IEFkZFRocmVlcGlkKCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyB2ZXJpZnlpbmc6IHRydWUsIGNvbnRpbnVlRGlzYWJsZWQ6IHRydWUsIGFkZFRhc2s6IHRhc2sgfSk7XG5cbiAgICAgICAgdGFzay5hZGRNc2lzZG4ocGhvbmVDb3VudHJ5LCBwaG9uZU51bWJlcikudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjb250aW51ZURpc2FibGVkOiBmYWxzZSwgdmVyaWZ5TXNpc2RuOiByZXNwb25zZS5tc2lzZG4gfSk7XG4gICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIlVuYWJsZSB0byBhZGQgcGhvbmUgbnVtYmVyIFwiICsgcGhvbmVOdW1iZXIgKyBcIiBcIiArIGVycik7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgdmVyaWZ5aW5nOiBmYWxzZSwgY29udGludWVEaXNhYmxlZDogZmFsc2UsIGFkZFRhc2s6IG51bGwgfSk7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJFcnJvclwiKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogKChlcnIgJiYgZXJyLm1lc3NhZ2UpID8gZXJyLm1lc3NhZ2UgOiBfdChcIk9wZXJhdGlvbiBmYWlsZWRcIikpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ29udGludWVDbGljayA9IChlOiBSZWFjdC5Nb3VzZUV2ZW50IHwgUmVhY3QuRm9ybUV2ZW50KTogdm9pZCA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgY29udGludWVEaXNhYmxlZDogdHJ1ZSB9KTtcbiAgICAgICAgY29uc3QgdG9rZW4gPSB0aGlzLnN0YXRlLm5ld1Bob25lTnVtYmVyQ29kZTtcbiAgICAgICAgY29uc3QgYWRkcmVzcyA9IHRoaXMuc3RhdGUudmVyaWZ5TXNpc2RuO1xuICAgICAgICB0aGlzLnN0YXRlLmFkZFRhc2suaGF2ZU1zaXNkblRva2VuKHRva2VuKS50aGVuKChbZmluaXNoZWRdKSA9PiB7XG4gICAgICAgICAgICBsZXQgbmV3UGhvbmVOdW1iZXIgPSB0aGlzLnN0YXRlLm5ld1Bob25lTnVtYmVyO1xuICAgICAgICAgICAgaWYgKGZpbmlzaGVkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbXNpc2RucyA9IFtcbiAgICAgICAgICAgICAgICAgICAgLi4udGhpcy5wcm9wcy5tc2lzZG5zLFxuICAgICAgICAgICAgICAgICAgICB7IGFkZHJlc3MsIG1lZGl1bTogVGhyZWVwaWRNZWRpdW0uUGhvbmUgfSxcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25Nc2lzZG5zQ2hhbmdlKG1zaXNkbnMpO1xuICAgICAgICAgICAgICAgIG5ld1Bob25lTnVtYmVyID0gXCJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGFkZFRhc2s6IG51bGwsXG4gICAgICAgICAgICAgICAgY29udGludWVEaXNhYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdmVyaWZ5aW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB2ZXJpZnlNc2lzZG46IFwiXCIsXG4gICAgICAgICAgICAgICAgdmVyaWZ5RXJyb3I6IG51bGwsXG4gICAgICAgICAgICAgICAgbmV3UGhvbmVOdW1iZXIsXG4gICAgICAgICAgICAgICAgbmV3UGhvbmVOdW1iZXJDb2RlOiBcIlwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjb250aW51ZURpc2FibGVkOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIGlmIChlcnIuZXJyY29kZSAhPT0gJ01fVEhSRUVQSURfQVVUSF9GQUlMRUQnKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiVW5hYmxlIHRvIHZlcmlmeSBwaG9uZSBudW1iZXI6IFwiICsgZXJyKTtcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiVW5hYmxlIHRvIHZlcmlmeSBwaG9uZSBudW1iZXIuXCIpLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogKChlcnIgJiYgZXJyLm1lc3NhZ2UpID8gZXJyLm1lc3NhZ2UgOiBfdChcIk9wZXJhdGlvbiBmYWlsZWRcIikpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgdmVyaWZ5RXJyb3I6IF90KFwiSW5jb3JyZWN0IHZlcmlmaWNhdGlvbiBjb2RlXCIpIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNvdW50cnlDaGFuZ2VkID0gKGNvdW50cnk6IFBob25lTnVtYmVyQ291bnRyeURlZmluaXRpb24pOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBob25lQ291bnRyeTogY291bnRyeS5pc28yIH0pO1xuICAgIH07XG5cbiAgICBwdWJsaWMgcmVuZGVyKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgY29uc3QgZXhpc3RpbmdQaG9uZUVsZW1lbnRzID0gdGhpcy5wcm9wcy5tc2lzZG5zLm1hcCgocCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIDxFeGlzdGluZ1Bob25lTnVtYmVyIG1zaXNkbj17cH0gb25SZW1vdmVkPXt0aGlzLm9uUmVtb3ZlZH0ga2V5PXtwLmFkZHJlc3N9IC8+O1xuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgYWRkVmVyaWZ5U2VjdGlvbiA9IChcbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e3RoaXMub25BZGRDbGlja30ga2luZD1cInByaW1hcnlcIj5cbiAgICAgICAgICAgICAgICB7IF90KFwiQWRkXCIpIH1cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgKTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUudmVyaWZ5aW5nKSB7XG4gICAgICAgICAgICBjb25zdCBtc2lzZG4gPSB0aGlzLnN0YXRlLnZlcmlmeU1zaXNkbjtcbiAgICAgICAgICAgIGFkZFZlcmlmeVNlY3Rpb24gPSAoXG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJBIHRleHQgbWVzc2FnZSBoYXMgYmVlbiBzZW50IHRvICslKG1zaXNkbilzLiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJQbGVhc2UgZW50ZXIgdGhlIHZlcmlmaWNhdGlvbiBjb2RlIGl0IGNvbnRhaW5zLlwiLCB7IG1zaXNkbjogbXNpc2RuIH0pIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDxiciAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnN0YXRlLnZlcmlmeUVycm9yIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxmb3JtIG9uU3VibWl0PXt0aGlzLm9uQ29udGludWVDbGlja30gYXV0b0NvbXBsZXRlPVwib2ZmXCIgbm9WYWxpZGF0ZT17dHJ1ZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiVmVyaWZpY2F0aW9uIGNvZGVcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwib2ZmXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5zdGF0ZS5jb250aW51ZURpc2FibGVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLm5ld1Bob25lTnVtYmVyQ29kZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkNoYW5nZU5ld1Bob25lTnVtYmVyQ29kZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25Db250aW51ZUNsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5zdGF0ZS5jb250aW51ZURpc2FibGVkIHx8IHRoaXMuc3RhdGUubmV3UGhvbmVOdW1iZXJDb2RlLmxlbmd0aCA9PT0gMH1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiQ29udGludWVcIikgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcGhvbmVDb3VudHJ5ID0gPENvdW50cnlEcm9wZG93biBvbk9wdGlvbkNoYW5nZT17dGhpcy5vbkNvdW50cnlDaGFuZ2VkfVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUGhvbmVOdW1iZXJzX2NvdW50cnlcIlxuICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUucGhvbmVDb3VudHJ5fVxuICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUudmVyaWZ5aW5nfVxuICAgICAgICAgICAgaXNTbWFsbD17dHJ1ZX1cbiAgICAgICAgICAgIHNob3dQcmVmaXg9e3RydWV9XG4gICAgICAgIC8+O1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Bob25lTnVtYmVyc1wiPlxuICAgICAgICAgICAgICAgIHsgZXhpc3RpbmdQaG9uZUVsZW1lbnRzIH1cbiAgICAgICAgICAgICAgICA8Zm9ybSBvblN1Ym1pdD17dGhpcy5vbkFkZENsaWNrfSBhdXRvQ29tcGxldGU9XCJvZmZcIiBub1ZhbGlkYXRlPXt0cnVlfSBjbGFzc05hbWU9XCJteF9QaG9uZU51bWJlcnNfbmV3XCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUGhvbmVOdW1iZXJzX2lucHV0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiUGhvbmUgTnVtYmVyXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cIm9mZlwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUudmVyaWZ5aW5nfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZWZpeENvbXBvbmVudD17cGhvbmVDb3VudHJ5fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLm5ld1Bob25lTnVtYmVyfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uQ2hhbmdlTmV3UGhvbmVOdW1iZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICAgICAgICAgeyBhZGRWZXJpZnlTZWN0aW9uIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFpQkE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBZ0NPLE1BQU1BLG1CQUFOLFNBQWtDQyxjQUFBLENBQU1DLFNBQXhDLENBQXdHO0VBQzNHQyxXQUFXLENBQUNDLEtBQUQsRUFBbUM7SUFDMUMsTUFBTUEsS0FBTjtJQUQwQyxnREFRMUJDLENBQUQsSUFBK0I7TUFDOUNBLENBQUMsQ0FBQ0MsZUFBRjtNQUNBRCxDQUFDLENBQUNFLGNBQUY7TUFFQSxLQUFLQyxRQUFMLENBQWM7UUFBRUMsWUFBWSxFQUFFO01BQWhCLENBQWQ7SUFDSCxDQWI2QztJQUFBLG9EQWV0QkosQ0FBRCxJQUErQjtNQUNsREEsQ0FBQyxDQUFDQyxlQUFGO01BQ0FELENBQUMsQ0FBQ0UsY0FBRjtNQUVBLEtBQUtDLFFBQUwsQ0FBYztRQUFFQyxZQUFZLEVBQUU7TUFBaEIsQ0FBZDtJQUNILENBcEI2QztJQUFBLHdEQXNCbEJKLENBQUQsSUFBK0I7TUFDdERBLENBQUMsQ0FBQ0MsZUFBRjtNQUNBRCxDQUFDLENBQUNFLGNBQUY7O01BRUFHLGdDQUFBLENBQWdCQyxHQUFoQixHQUFzQkMsY0FBdEIsQ0FBcUMsS0FBS1IsS0FBTCxDQUFXUyxNQUFYLENBQWtCQyxNQUF2RCxFQUErRCxLQUFLVixLQUFMLENBQVdTLE1BQVgsQ0FBa0JFLE9BQWpGLEVBQTBGQyxJQUExRixDQUErRixNQUFNO1FBQ2pHLE9BQU8sS0FBS1osS0FBTCxDQUFXYSxTQUFYLENBQXFCLEtBQUtiLEtBQUwsQ0FBV1Ms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