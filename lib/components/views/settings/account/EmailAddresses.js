"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.ExistingEmailAddress = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _threepids = require("matrix-js-sdk/src/@types/threepids");

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../../../languageHandler");

var _MatrixClientPeg = require("../../../../MatrixClientPeg");

var _Field = _interopRequireDefault(require("../../elements/Field"));

var _AccessibleButton = _interopRequireDefault(require("../../elements/AccessibleButton"));

var Email = _interopRequireWildcard(require("../../../../email"));

var _AddThreepid = _interopRequireDefault(require("../../../../AddThreepid"));

var _Modal = _interopRequireDefault(require("../../../../Modal"));

var _ErrorDialog = _interopRequireDefault(require("../../dialogs/ErrorDialog"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
class ExistingEmailAddress extends _react.default.Component {
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

      _MatrixClientPeg.MatrixClientPeg.get().deleteThreePid(this.props.email.medium, this.props.email.address).then(() => {
        return this.props.onRemoved(this.props.email);
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
        className: "mx_ExistingEmailAddress"
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_ExistingEmailAddress_promptText"
      }, (0, _languageHandler._t)("Remove %(email)s?", {
        email: this.props.email.address
      })), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.onActuallyRemove,
        kind: "danger_sm",
        className: "mx_ExistingEmailAddress_confirmBtn"
      }, (0, _languageHandler._t)("Remove")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.onDontRemove,
        kind: "link_sm",
        className: "mx_ExistingEmailAddress_confirmBtn"
      }, (0, _languageHandler._t)("Cancel")));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ExistingEmailAddress"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_ExistingEmailAddress_email"
    }, this.props.email.address), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this.onRemove,
      kind: "danger_sm"
    }, (0, _languageHandler._t)("Remove")));
  }

}

exports.ExistingEmailAddress = ExistingEmailAddress;

class EmailAddresses extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onRemoved", address => {
      const emails = this.props.emails.filter(e => e !== address);
      this.props.onEmailsChange(emails);
    });
    (0, _defineProperty2.default)(this, "onChangeNewEmailAddress", e => {
      this.setState({
        newEmailAddress: e.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onAddClick", e => {
      e.stopPropagation();
      e.preventDefault();
      if (!this.state.newEmailAddress) return;
      const email = this.state.newEmailAddress; // TODO: Inline field validation

      if (!Email.looksValid(email)) {
        _Modal.default.createDialog(_ErrorDialog.default, {
          title: (0, _languageHandler._t)("Invalid Email Address"),
          description: (0, _languageHandler._t)("This doesn't appear to be a valid email address")
        });

        return;
      }

      const task = new _AddThreepid.default();
      this.setState({
        verifying: true,
        continueDisabled: true,
        addTask: task
      });
      task.addEmailAddress(email).then(() => {
        this.setState({
          continueDisabled: false
        });
      }).catch(err => {
        _logger.logger.error("Unable to add email address " + email + " " + err);

        this.setState({
          verifying: false,
          continueDisabled: false,
          addTask: null
        });

        _Modal.default.createDialog(_ErrorDialog.default, {
          title: (0, _languageHandler._t)("Unable to add email address"),
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
      this.state.addTask.checkEmailLinkClicked().then(_ref => {
        let [finished] = _ref;
        let newEmailAddress = this.state.newEmailAddress;

        if (finished) {
          const email = this.state.newEmailAddress;
          const emails = [...this.props.emails, {
            address: email,
            medium: _threepids.ThreepidMedium.Email
          }];
          this.props.onEmailsChange(emails);
          newEmailAddress = "";
        }

        this.setState({
          addTask: null,
          continueDisabled: false,
          verifying: false,
          newEmailAddress
        });
      }).catch(err => {
        this.setState({
          continueDisabled: false
        });

        if (err.errcode === 'M_THREEPID_AUTH_FAILED') {
          _Modal.default.createDialog(_ErrorDialog.default, {
            title: (0, _languageHandler._t)("Your email address hasn't been verified yet"),
            description: (0, _languageHandler._t)("Click the link in the email you received to verify " + "and then click continue again.")
          });
        } else {
          _logger.logger.error("Unable to verify email address: ", err);

          _Modal.default.createDialog(_ErrorDialog.default, {
            title: (0, _languageHandler._t)("Unable to verify email address."),
            description: err && err.message ? err.message : (0, _languageHandler._t)("Operation failed")
          });
        }
      });
    });
    this.state = {
      verifying: false,
      addTask: null,
      continueDisabled: false,
      newEmailAddress: ""
    };
  }

  render() {
    const existingEmailElements = this.props.emails.map(e => {
      return /*#__PURE__*/_react.default.createElement(ExistingEmailAddress, {
        email: e,
        onRemoved: this.onRemoved,
        key: e.address
      });
    });

    let addButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this.onAddClick,
      kind: "primary"
    }, (0, _languageHandler._t)("Add"));

    if (this.state.verifying) {
      addButton = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("We've sent you an email to verify your address. Please follow the instructions there and then click the button below.")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.onContinueClick,
        kind: "primary",
        disabled: this.state.continueDisabled
      }, (0, _languageHandler._t)("Continue")));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_EmailAddresses"
    }, existingEmailElements, /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.onAddClick,
      autoComplete: "off",
      noValidate: true,
      className: "mx_EmailAddresses_new"
    }, /*#__PURE__*/_react.default.createElement(_Field.default, {
      type: "text",
      label: (0, _languageHandler._t)("Email Address"),
      autoComplete: "off",
      disabled: this.state.verifying,
      value: this.state.newEmailAddress,
      onChange: this.onChangeNewEmailAddress
    }), addButton));
  }

}

exports.default = EmailAddresses;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFeGlzdGluZ0VtYWlsQWRkcmVzcyIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImUiLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsInNldFN0YXRlIiwidmVyaWZ5UmVtb3ZlIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiZGVsZXRlVGhyZWVQaWQiLCJlbWFpbCIsIm1lZGl1bSIsImFkZHJlc3MiLCJ0aGVuIiwib25SZW1vdmVkIiwiY2F0Y2giLCJlcnIiLCJsb2dnZXIiLCJlcnJvciIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwiRXJyb3JEaWFsb2ciLCJ0aXRsZSIsIl90IiwiZGVzY3JpcHRpb24iLCJtZXNzYWdlIiwic3RhdGUiLCJyZW5kZXIiLCJvbkFjdHVhbGx5UmVtb3ZlIiwib25Eb250UmVtb3ZlIiwib25SZW1vdmUiLCJFbWFpbEFkZHJlc3NlcyIsImVtYWlscyIsImZpbHRlciIsIm9uRW1haWxzQ2hhbmdlIiwibmV3RW1haWxBZGRyZXNzIiwidGFyZ2V0IiwidmFsdWUiLCJFbWFpbCIsImxvb2tzVmFsaWQiLCJ0YXNrIiwiQWRkVGhyZWVwaWQiLCJ2ZXJpZnlpbmciLCJjb250aW51ZURpc2FibGVkIiwiYWRkVGFzayIsImFkZEVtYWlsQWRkcmVzcyIsImNoZWNrRW1haWxMaW5rQ2xpY2tlZCIsImZpbmlzaGVkIiwiVGhyZWVwaWRNZWRpdW0iLCJlcnJjb2RlIiwiZXhpc3RpbmdFbWFpbEVsZW1lbnRzIiwibWFwIiwiYWRkQnV0dG9uIiwib25BZGRDbGljayIsIm9uQ29udGludWVDbGljayIsIm9uQ2hhbmdlTmV3RW1haWxBZGRyZXNzIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3Mvc2V0dGluZ3MvYWNjb3VudC9FbWFpbEFkZHJlc3Nlcy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBJVGhyZWVwaWQsIFRocmVlcGlkTWVkaXVtIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy90aHJlZXBpZHNcIjtcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcblxuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tIFwiLi4vLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgRmllbGQgZnJvbSBcIi4uLy4uL2VsZW1lbnRzL0ZpZWxkXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0ICogYXMgRW1haWwgZnJvbSBcIi4uLy4uLy4uLy4uL2VtYWlsXCI7XG5pbXBvcnQgQWRkVGhyZWVwaWQgZnJvbSBcIi4uLy4uLy4uLy4uL0FkZFRocmVlcGlkXCI7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vLi4vLi4vTW9kYWwnO1xuaW1wb3J0IEVycm9yRGlhbG9nIGZyb20gXCIuLi8uLi9kaWFsb2dzL0Vycm9yRGlhbG9nXCI7XG5cbi8qXG5UT0RPOiBJbXByb3ZlIHRoZSBVWCBmb3IgZXZlcnl0aGluZyBpbiBoZXJlLlxuSXQncyB2ZXJ5IG11Y2ggcGxhY2Vob2xkZXIsIGJ1dCBpdCBnZXRzIHRoZSBqb2IgZG9uZS4gVGhlIG9sZCB3YXkgb2YgaGFuZGxpbmdcbmVtYWlsIGFkZHJlc3NlcyBpbiB1c2VyIHNldHRpbmdzIHdhcyB0byB1c2UgZGlhbG9ncyB0byBjb21tdW5pY2F0ZSBzdGF0ZSwgaG93ZXZlclxuZHVlIHRvIG91ciBkaWFsb2cgc3lzdGVtIG92ZXJyaWRpbmcgZGlhbG9ncyAoY2F1c2luZyB1bm1vdW50cykgdGhpcyBjcmVhdGVzIHByb2JsZW1zXG5mb3IgYSBzYW5lIFVYLiBGb3IgaW5zdGFuY2UsIHRoZSB1c2VyIGNvdWxkIGVhc2lseSBlbmQgdXAgZW50ZXJpbmcgYW4gZW1haWwgYWRkcmVzc1xuYW5kIHJlY2VpdmUgYSBkaWFsb2cgdG8gdmVyaWZ5IHRoZSBhZGRyZXNzLCB3aGljaCB0aGVuIGNhdXNlcyB0aGUgY29tcG9uZW50IGhlcmVcbnRvIGZvcmdldCB3aGF0IGl0IHdhcyBkb2luZyBhbmQgdWx0aW1hdGVseSBmYWlsLiBEaWFsb2dzIGFyZSBzdGlsbCB1c2VkIGluIHNvbWVcbnBsYWNlcyB0byBjb21tdW5pY2F0ZSBlcnJvcnMgLSB0aGVzZSBzaG91bGQgYmUgcmVwbGFjZWQgd2l0aCBpbmxpbmUgdmFsaWRhdGlvbiB3aGVuXG50aGF0IGlzIGF2YWlsYWJsZS5cbiAqL1xuXG5pbnRlcmZhY2UgSUV4aXN0aW5nRW1haWxBZGRyZXNzUHJvcHMge1xuICAgIGVtYWlsOiBJVGhyZWVwaWQ7XG4gICAgb25SZW1vdmVkOiAoZW1haWxzOiBJVGhyZWVwaWQpID0+IHZvaWQ7XG59XG5cbmludGVyZmFjZSBJRXhpc3RpbmdFbWFpbEFkZHJlc3NTdGF0ZSB7XG4gICAgdmVyaWZ5UmVtb3ZlOiBib29sZWFuO1xufVxuXG5leHBvcnQgY2xhc3MgRXhpc3RpbmdFbWFpbEFkZHJlc3MgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SUV4aXN0aW5nRW1haWxBZGRyZXNzUHJvcHMsIElFeGlzdGluZ0VtYWlsQWRkcmVzc1N0YXRlPiB7XG4gICAgY29uc3RydWN0b3IocHJvcHM6IElFeGlzdGluZ0VtYWlsQWRkcmVzc1Byb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgdmVyaWZ5UmVtb3ZlOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUmVtb3ZlID0gKGU6IFJlYWN0Lk1vdXNlRXZlbnQpOiB2b2lkID0+IHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyB2ZXJpZnlSZW1vdmU6IHRydWUgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Eb250UmVtb3ZlID0gKGU6IFJlYWN0Lk1vdXNlRXZlbnQpOiB2b2lkID0+IHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyB2ZXJpZnlSZW1vdmU6IGZhbHNlIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQWN0dWFsbHlSZW1vdmUgPSAoZTogUmVhY3QuTW91c2VFdmVudCk6IHZvaWQgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLmRlbGV0ZVRocmVlUGlkKHRoaXMucHJvcHMuZW1haWwubWVkaXVtLCB0aGlzLnByb3BzLmVtYWlsLmFkZHJlc3MpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMub25SZW1vdmVkKHRoaXMucHJvcHMuZW1haWwpO1xuICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJVbmFibGUgdG8gcmVtb3ZlIGNvbnRhY3QgaW5mb3JtYXRpb246IFwiICsgZXJyKTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIlVuYWJsZSB0byByZW1vdmUgY29udGFjdCBpbmZvcm1hdGlvblwiKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogKChlcnIgJiYgZXJyLm1lc3NhZ2UpID8gZXJyLm1lc3NhZ2UgOiBfdChcIk9wZXJhdGlvbiBmYWlsZWRcIikpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwdWJsaWMgcmVuZGVyKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUudmVyaWZ5UmVtb3ZlKSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRXhpc3RpbmdFbWFpbEFkZHJlc3NcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfRXhpc3RpbmdFbWFpbEFkZHJlc3NfcHJvbXB0VGV4dFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIlJlbW92ZSAlKGVtYWlsKXM/XCIsIHsgZW1haWw6IHRoaXMucHJvcHMuZW1haWwuYWRkcmVzcyB9KSB9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25BY3R1YWxseVJlbW92ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJkYW5nZXJfc21cIlxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfRXhpc3RpbmdFbWFpbEFkZHJlc3NfY29uZmlybUJ0blwiXG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJSZW1vdmVcIikgfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uRG9udFJlbW92ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJsaW5rX3NtXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0V4aXN0aW5nRW1haWxBZGRyZXNzX2NvbmZpcm1CdG5cIlxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiQ2FuY2VsXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0V4aXN0aW5nRW1haWxBZGRyZXNzXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfRXhpc3RpbmdFbWFpbEFkZHJlc3NfZW1haWxcIj57IHRoaXMucHJvcHMuZW1haWwuYWRkcmVzcyB9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e3RoaXMub25SZW1vdmV9IGtpbmQ9XCJkYW5nZXJfc21cIj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIlJlbW92ZVwiKSB9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBlbWFpbHM6IElUaHJlZXBpZFtdO1xuICAgIG9uRW1haWxzQ2hhbmdlOiAoZW1haWxzOiBQYXJ0aWFsPElUaHJlZXBpZD5bXSkgPT4gdm9pZDtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgdmVyaWZ5aW5nOiBib29sZWFuO1xuICAgIGFkZFRhc2s6IGFueTsgLy8gRklYTUU6IFdoZW4gQWRkVGhyZWVwaWQgaXMgVFNmaWVkXG4gICAgY29udGludWVEaXNhYmxlZDogYm9vbGVhbjtcbiAgICBuZXdFbWFpbEFkZHJlc3M6IHN0cmluZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRW1haWxBZGRyZXNzZXMgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgdmVyaWZ5aW5nOiBmYWxzZSxcbiAgICAgICAgICAgIGFkZFRhc2s6IG51bGwsXG4gICAgICAgICAgICBjb250aW51ZURpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgIG5ld0VtYWlsQWRkcmVzczogXCJcIixcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUmVtb3ZlZCA9IChhZGRyZXNzKTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IGVtYWlscyA9IHRoaXMucHJvcHMuZW1haWxzLmZpbHRlcigoZSkgPT4gZSAhPT0gYWRkcmVzcyk7XG4gICAgICAgIHRoaXMucHJvcHMub25FbWFpbHNDaGFuZ2UoZW1haWxzKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNoYW5nZU5ld0VtYWlsQWRkcmVzcyA9IChlOiBSZWFjdC5DaGFuZ2VFdmVudDxIVE1MSW5wdXRFbGVtZW50Pik6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIG5ld0VtYWlsQWRkcmVzczogZS50YXJnZXQudmFsdWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQWRkQ2xpY2sgPSAoZTogUmVhY3QuRm9ybUV2ZW50KTogdm9pZCA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUubmV3RW1haWxBZGRyZXNzKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgZW1haWwgPSB0aGlzLnN0YXRlLm5ld0VtYWlsQWRkcmVzcztcblxuICAgICAgICAvLyBUT0RPOiBJbmxpbmUgZmllbGQgdmFsaWRhdGlvblxuICAgICAgICBpZiAoIUVtYWlsLmxvb2tzVmFsaWQoZW1haWwpKSB7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJJbnZhbGlkIEVtYWlsIEFkZHJlc3NcIiksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFwiVGhpcyBkb2Vzbid0IGFwcGVhciB0byBiZSBhIHZhbGlkIGVtYWlsIGFkZHJlc3NcIiksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRhc2sgPSBuZXcgQWRkVGhyZWVwaWQoKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHZlcmlmeWluZzogdHJ1ZSwgY29udGludWVEaXNhYmxlZDogdHJ1ZSwgYWRkVGFzazogdGFzayB9KTtcblxuICAgICAgICB0YXNrLmFkZEVtYWlsQWRkcmVzcyhlbWFpbCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY29udGludWVEaXNhYmxlZDogZmFsc2UgfSk7XG4gICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIlVuYWJsZSB0byBhZGQgZW1haWwgYWRkcmVzcyBcIiArIGVtYWlsICsgXCIgXCIgKyBlcnIpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHZlcmlmeWluZzogZmFsc2UsIGNvbnRpbnVlRGlzYWJsZWQ6IGZhbHNlLCBhZGRUYXNrOiBudWxsIH0pO1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiVW5hYmxlIHRvIGFkZCBlbWFpbCBhZGRyZXNzXCIpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAoKGVyciAmJiBlcnIubWVzc2FnZSkgPyBlcnIubWVzc2FnZSA6IF90KFwiT3BlcmF0aW9uIGZhaWxlZFwiKSksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Db250aW51ZUNsaWNrID0gKGU6IFJlYWN0Lk1vdXNlRXZlbnQpOiB2b2lkID0+IHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjb250aW51ZURpc2FibGVkOiB0cnVlIH0pO1xuICAgICAgICB0aGlzLnN0YXRlLmFkZFRhc2suY2hlY2tFbWFpbExpbmtDbGlja2VkKCkudGhlbigoW2ZpbmlzaGVkXSkgPT4ge1xuICAgICAgICAgICAgbGV0IG5ld0VtYWlsQWRkcmVzcyA9IHRoaXMuc3RhdGUubmV3RW1haWxBZGRyZXNzO1xuICAgICAgICAgICAgaWYgKGZpbmlzaGVkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZW1haWwgPSB0aGlzLnN0YXRlLm5ld0VtYWlsQWRkcmVzcztcbiAgICAgICAgICAgICAgICBjb25zdCBlbWFpbHMgPSBbXG4gICAgICAgICAgICAgICAgICAgIC4uLnRoaXMucHJvcHMuZW1haWxzLFxuICAgICAgICAgICAgICAgICAgICB7IGFkZHJlc3M6IGVtYWlsLCBtZWRpdW06IFRocmVlcGlkTWVkaXVtLkVtYWlsIH0sXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uRW1haWxzQ2hhbmdlKGVtYWlscyk7XG4gICAgICAgICAgICAgICAgbmV3RW1haWxBZGRyZXNzID0gXCJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGFkZFRhc2s6IG51bGwsXG4gICAgICAgICAgICAgICAgY29udGludWVEaXNhYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgdmVyaWZ5aW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBuZXdFbWFpbEFkZHJlc3MsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvbnRpbnVlRGlzYWJsZWQ6IGZhbHNlIH0pO1xuICAgICAgICAgICAgaWYgKGVyci5lcnJjb2RlID09PSAnTV9USFJFRVBJRF9BVVRIX0ZBSUxFRCcpIHtcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiWW91ciBlbWFpbCBhZGRyZXNzIGhhc24ndCBiZWVuIHZlcmlmaWVkIHlldFwiKSxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFwiQ2xpY2sgdGhlIGxpbmsgaW4gdGhlIGVtYWlsIHlvdSByZWNlaXZlZCB0byB2ZXJpZnkgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJhbmQgdGhlbiBjbGljayBjb250aW51ZSBhZ2Fpbi5cIiksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIlVuYWJsZSB0byB2ZXJpZnkgZW1haWwgYWRkcmVzczogXCIsIGVycik7XG4gICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIlVuYWJsZSB0byB2ZXJpZnkgZW1haWwgYWRkcmVzcy5cIiksXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAoKGVyciAmJiBlcnIubWVzc2FnZSkgPyBlcnIubWVzc2FnZSA6IF90KFwiT3BlcmF0aW9uIGZhaWxlZFwiKSksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwdWJsaWMgcmVuZGVyKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgY29uc3QgZXhpc3RpbmdFbWFpbEVsZW1lbnRzID0gdGhpcy5wcm9wcy5lbWFpbHMubWFwKChlKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gPEV4aXN0aW5nRW1haWxBZGRyZXNzIGVtYWlsPXtlfSBvblJlbW92ZWQ9e3RoaXMub25SZW1vdmVkfSBrZXk9e2UuYWRkcmVzc30gLz47XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBhZGRCdXR0b24gPSAoXG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXt0aGlzLm9uQWRkQ2xpY2t9IGtpbmQ9XCJwcmltYXJ5XCI+XG4gICAgICAgICAgICAgICAgeyBfdChcIkFkZFwiKSB9XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICk7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnZlcmlmeWluZykge1xuICAgICAgICAgICAgYWRkQnV0dG9uID0gKFxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+eyBfdChcIldlJ3ZlIHNlbnQgeW91IGFuIGVtYWlsIHRvIHZlcmlmeSB5b3VyIGFkZHJlc3MuIFBsZWFzZSBmb2xsb3cgdGhlIGluc3RydWN0aW9ucyB0aGVyZSBhbmQgdGhlbiBjbGljayB0aGUgYnV0dG9uIGJlbG93LlwiKSB9PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQ29udGludWVDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLmNvbnRpbnVlRGlzYWJsZWR9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJDb250aW51ZVwiKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FbWFpbEFkZHJlc3Nlc1wiPlxuICAgICAgICAgICAgICAgIHsgZXhpc3RpbmdFbWFpbEVsZW1lbnRzIH1cbiAgICAgICAgICAgICAgICA8Zm9ybVxuICAgICAgICAgICAgICAgICAgICBvblN1Ym1pdD17dGhpcy5vbkFkZENsaWNrfVxuICAgICAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICAgICAgICBub1ZhbGlkYXRlPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9FbWFpbEFkZHJlc3Nlc19uZXdcIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJFbWFpbCBBZGRyZXNzXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwib2ZmXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLnZlcmlmeWluZ31cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLm5ld0VtYWlsQWRkcmVzc31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uQ2hhbmdlTmV3RW1haWxBZGRyZXNzfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICB7IGFkZEJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBb0NPLE1BQU1BLG9CQUFOLFNBQW1DQyxjQUFBLENBQU1DLFNBQXpDLENBQTJHO0VBQzlHQyxXQUFXLENBQUNDLEtBQUQsRUFBb0M7SUFDM0MsTUFBTUEsS0FBTjtJQUQyQyxnREFRM0JDLENBQUQsSUFBK0I7TUFDOUNBLENBQUMsQ0FBQ0MsZUFBRjtNQUNBRCxDQUFDLENBQUNFLGNBQUY7TUFFQSxL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