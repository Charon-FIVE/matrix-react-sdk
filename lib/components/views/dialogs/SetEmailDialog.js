"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var Email = _interopRequireWildcard(require("../../../email"));

var _AddThreepid = _interopRequireDefault(require("../../../AddThreepid"));

var _languageHandler = require("../../../languageHandler");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

var _ErrorDialog = _interopRequireDefault(require("./ErrorDialog"));

var _QuestionDialog = _interopRequireDefault(require("./QuestionDialog"));

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _EditableText = _interopRequireDefault(require("../elements/EditableText"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2017 Vector Creations Ltd
Copyright 2018 New Vector Ltd

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
 * Prompt the user to set an email address.
 *
 * On success, `onFinished(true)` is called.
 */
class SetEmailDialog extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "addThreepid", void 0);
    (0, _defineProperty2.default)(this, "onEmailAddressChanged", value => {
      this.setState({
        emailAddress: value
      });
    });
    (0, _defineProperty2.default)(this, "onSubmit", () => {
      const emailAddress = this.state.emailAddress;

      if (!Email.looksValid(emailAddress)) {
        _Modal.default.createDialog(_ErrorDialog.default, {
          title: (0, _languageHandler._t)("Invalid Email Address"),
          description: (0, _languageHandler._t)("This doesn't appear to be a valid email address")
        });

        return;
      }

      this.addThreepid = new _AddThreepid.default();
      this.addThreepid.addEmailAddress(emailAddress).then(() => {
        _Modal.default.createDialog(_QuestionDialog.default, {
          title: (0, _languageHandler._t)("Verification Pending"),
          description: (0, _languageHandler._t)("Please check your email and click on the link it contains. Once this " + "is done, click continue."),
          button: (0, _languageHandler._t)('Continue'),
          onFinished: this.onEmailDialogFinished
        });
      }, err => {
        this.setState({
          emailBusy: false
        });

        _logger.logger.error("Unable to add email address " + emailAddress + " " + err);

        _Modal.default.createDialog(_ErrorDialog.default, {
          title: (0, _languageHandler._t)("Unable to add email address"),
          description: err && err.message ? err.message : (0, _languageHandler._t)("Operation failed")
        });
      });
      this.setState({
        emailBusy: true
      });
    });
    (0, _defineProperty2.default)(this, "onCancelled", () => {
      this.props.onFinished(false);
    });
    (0, _defineProperty2.default)(this, "onEmailDialogFinished", ok => {
      if (ok) {
        this.verifyEmailAddress();
      } else {
        this.setState({
          emailBusy: false
        });
      }
    });
    this.state = {
      emailAddress: '',
      emailBusy: false
    };
  }

  verifyEmailAddress() {
    this.addThreepid.checkEmailLinkClicked().then(() => {
      this.props.onFinished(true);
    }, err => {
      this.setState({
        emailBusy: false
      });

      if (err.errcode == 'M_THREEPID_AUTH_FAILED') {
        const message = (0, _languageHandler._t)("Unable to verify email address.") + " " + (0, _languageHandler._t)("Please check your email and click on the link it contains. Once this is done, click continue.");

        _Modal.default.createDialog(_QuestionDialog.default, {
          title: (0, _languageHandler._t)("Verification Pending"),
          description: message,
          button: (0, _languageHandler._t)('Continue'),
          onFinished: this.onEmailDialogFinished
        });
      } else {
        _logger.logger.error("Unable to verify email address: " + err);

        _Modal.default.createDialog(_ErrorDialog.default, {
          title: (0, _languageHandler._t)("Unable to verify email address."),
          description: err && err.message ? err.message : (0, _languageHandler._t)("Operation failed")
        });
      }
    });
  }

  render() {
    const emailInput = this.state.emailBusy ? /*#__PURE__*/_react.default.createElement(_Spinner.default, null) : /*#__PURE__*/_react.default.createElement(_EditableText.default, {
      initialValue: this.state.emailAddress,
      className: "mx_SetEmailDialog_email_input",
      placeholder: (0, _languageHandler._t)("Email address"),
      placeholderClassName: "mx_SetEmailDialog_email_input_placeholder",
      blurToCancel: false,
      onValueChanged: this.onEmailAddressChanged
    });
    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_SetEmailDialog",
      onFinished: this.onCancelled,
      title: this.props.title,
      contentId: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("p", {
      id: "mx_Dialog_content"
    }, (0, _languageHandler._t)('This will allow you to reset your password and receive notifications.')), emailInput), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_buttons"
    }, /*#__PURE__*/_react.default.createElement("input", {
      className: "mx_Dialog_primary",
      type: "submit",
      value: (0, _languageHandler._t)("Continue"),
      onClick: this.onSubmit
    }), /*#__PURE__*/_react.default.createElement("input", {
      type: "submit",
      value: (0, _languageHandler._t)("Skip"),
      onClick: this.onCancelled
    })));
  }

}

exports.default = SetEmailDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTZXRFbWFpbERpYWxvZyIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInZhbHVlIiwic2V0U3RhdGUiLCJlbWFpbEFkZHJlc3MiLCJzdGF0ZSIsIkVtYWlsIiwibG9va3NWYWxpZCIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwiRXJyb3JEaWFsb2ciLCJ0aXRsZSIsIl90IiwiZGVzY3JpcHRpb24iLCJhZGRUaHJlZXBpZCIsIkFkZFRocmVlcGlkIiwiYWRkRW1haWxBZGRyZXNzIiwidGhlbiIsIlF1ZXN0aW9uRGlhbG9nIiwiYnV0dG9uIiwib25GaW5pc2hlZCIsIm9uRW1haWxEaWFsb2dGaW5pc2hlZCIsImVyciIsImVtYWlsQnVzeSIsImxvZ2dlciIsImVycm9yIiwibWVzc2FnZSIsIm9rIiwidmVyaWZ5RW1haWxBZGRyZXNzIiwiY2hlY2tFbWFpbExpbmtDbGlja2VkIiwiZXJyY29kZSIsInJlbmRlciIsImVtYWlsSW5wdXQiLCJvbkVtYWlsQWRkcmVzc0NoYW5nZWQiLCJvbkNhbmNlbGxlZCIsIm9uU3VibWl0Il0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9TZXRFbWFpbERpYWxvZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE3IFZlY3RvciBDcmVhdGlvbnMgTHRkXG5Db3B5cmlnaHQgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5cbmltcG9ydCAqIGFzIEVtYWlsIGZyb20gJy4uLy4uLy4uL2VtYWlsJztcbmltcG9ydCBBZGRUaHJlZXBpZCBmcm9tICcuLi8uLi8uLi9BZGRUaHJlZXBpZCc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vLi4vTW9kYWwnO1xuaW1wb3J0IFNwaW5uZXIgZnJvbSBcIi4uL2VsZW1lbnRzL1NwaW5uZXJcIjtcbmltcG9ydCBFcnJvckRpYWxvZyBmcm9tIFwiLi9FcnJvckRpYWxvZ1wiO1xuaW1wb3J0IFF1ZXN0aW9uRGlhbG9nIGZyb20gXCIuL1F1ZXN0aW9uRGlhbG9nXCI7XG5pbXBvcnQgQmFzZURpYWxvZyBmcm9tIFwiLi9CYXNlRGlhbG9nXCI7XG5pbXBvcnQgRWRpdGFibGVUZXh0IGZyb20gXCIuLi9lbGVtZW50cy9FZGl0YWJsZVRleHRcIjtcbmltcG9ydCB7IElEaWFsb2dQcm9wcyB9IGZyb20gXCIuL0lEaWFsb2dQcm9wc1wiO1xuXG5pbnRlcmZhY2UgSVByb3BzIGV4dGVuZHMgSURpYWxvZ1Byb3BzIHtcbiAgICB0aXRsZTogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBlbWFpbEFkZHJlc3M6IHN0cmluZztcbiAgICBlbWFpbEJ1c3k6IGJvb2xlYW47XG59XG5cbi8qXG4gKiBQcm9tcHQgdGhlIHVzZXIgdG8gc2V0IGFuIGVtYWlsIGFkZHJlc3MuXG4gKlxuICogT24gc3VjY2VzcywgYG9uRmluaXNoZWQodHJ1ZSlgIGlzIGNhbGxlZC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2V0RW1haWxEaWFsb2cgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIGFkZFRocmVlcGlkOiBBZGRUaHJlZXBpZDtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBJUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBlbWFpbEFkZHJlc3M6ICcnLFxuICAgICAgICAgICAgZW1haWxCdXN5OiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRW1haWxBZGRyZXNzQ2hhbmdlZCA9ICh2YWx1ZTogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZW1haWxBZGRyZXNzOiB2YWx1ZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25TdWJtaXQgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IGVtYWlsQWRkcmVzcyA9IHRoaXMuc3RhdGUuZW1haWxBZGRyZXNzO1xuICAgICAgICBpZiAoIUVtYWlsLmxvb2tzVmFsaWQoZW1haWxBZGRyZXNzKSkge1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiSW52YWxpZCBFbWFpbCBBZGRyZXNzXCIpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcIlRoaXMgZG9lc24ndCBhcHBlYXIgdG8gYmUgYSB2YWxpZCBlbWFpbCBhZGRyZXNzXCIpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hZGRUaHJlZXBpZCA9IG5ldyBBZGRUaHJlZXBpZCgpO1xuICAgICAgICB0aGlzLmFkZFRocmVlcGlkLmFkZEVtYWlsQWRkcmVzcyhlbWFpbEFkZHJlc3MpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKFF1ZXN0aW9uRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiVmVyaWZpY2F0aW9uIFBlbmRpbmdcIiksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFxuICAgICAgICAgICAgICAgICAgICBcIlBsZWFzZSBjaGVjayB5b3VyIGVtYWlsIGFuZCBjbGljayBvbiB0aGUgbGluayBpdCBjb250YWlucy4gT25jZSB0aGlzIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJpcyBkb25lLCBjbGljayBjb250aW51ZS5cIixcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIGJ1dHRvbjogX3QoJ0NvbnRpbnVlJyksXG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZDogdGhpcy5vbkVtYWlsRGlhbG9nRmluaXNoZWQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVtYWlsQnVzeTogZmFsc2UgfSk7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJVbmFibGUgdG8gYWRkIGVtYWlsIGFkZHJlc3MgXCIgKyBlbWFpbEFkZHJlc3MgKyBcIiBcIiArIGVycik7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJVbmFibGUgdG8gYWRkIGVtYWlsIGFkZHJlc3NcIiksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICgoZXJyICYmIGVyci5tZXNzYWdlKSA/IGVyci5tZXNzYWdlIDogX3QoXCJPcGVyYXRpb24gZmFpbGVkXCIpKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVtYWlsQnVzeTogdHJ1ZSB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNhbmNlbGxlZCA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKGZhbHNlKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkVtYWlsRGlhbG9nRmluaXNoZWQgPSAob2s6IGJvb2xlYW4pOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKG9rKSB7XG4gICAgICAgICAgICB0aGlzLnZlcmlmeUVtYWlsQWRkcmVzcygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVtYWlsQnVzeTogZmFsc2UgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSB2ZXJpZnlFbWFpbEFkZHJlc3MoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuYWRkVGhyZWVwaWQuY2hlY2tFbWFpbExpbmtDbGlja2VkKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQodHJ1ZSk7XG4gICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlbWFpbEJ1c3k6IGZhbHNlIH0pO1xuICAgICAgICAgICAgaWYgKGVyci5lcnJjb2RlID09ICdNX1RIUkVFUElEX0FVVEhfRkFJTEVEJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBfdChcIlVuYWJsZSB0byB2ZXJpZnkgZW1haWwgYWRkcmVzcy5cIikgKyBcIiBcIiArXG4gICAgICAgICAgICAgICAgICAgIF90KFwiUGxlYXNlIGNoZWNrIHlvdXIgZW1haWwgYW5kIGNsaWNrIG9uIHRoZSBsaW5rIGl0IGNvbnRhaW5zLiBPbmNlIHRoaXMgaXMgZG9uZSwgY2xpY2sgY29udGludWUuXCIpO1xuICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJWZXJpZmljYXRpb24gUGVuZGluZ1wiKSxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IG1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbjogX3QoJ0NvbnRpbnVlJyksXG4gICAgICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ6IHRoaXMub25FbWFpbERpYWxvZ0ZpbmlzaGVkLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJVbmFibGUgdG8gdmVyaWZ5IGVtYWlsIGFkZHJlc3M6IFwiICsgZXJyKTtcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiVW5hYmxlIHRvIHZlcmlmeSBlbWFpbCBhZGRyZXNzLlwiKSxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICgoZXJyICYmIGVyci5tZXNzYWdlKSA/IGVyci5tZXNzYWdlIDogX3QoXCJPcGVyYXRpb24gZmFpbGVkXCIpKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlcigpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIGNvbnN0IGVtYWlsSW5wdXQgPSB0aGlzLnN0YXRlLmVtYWlsQnVzeSA/IDxTcGlubmVyIC8+IDogPEVkaXRhYmxlVGV4dFxuICAgICAgICAgICAgaW5pdGlhbFZhbHVlPXt0aGlzLnN0YXRlLmVtYWlsQWRkcmVzc31cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1NldEVtYWlsRGlhbG9nX2VtYWlsX2lucHV0XCJcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtfdChcIkVtYWlsIGFkZHJlc3NcIil9XG4gICAgICAgICAgICBwbGFjZWhvbGRlckNsYXNzTmFtZT1cIm14X1NldEVtYWlsRGlhbG9nX2VtYWlsX2lucHV0X3BsYWNlaG9sZGVyXCJcbiAgICAgICAgICAgIGJsdXJUb0NhbmNlbD17ZmFsc2V9XG4gICAgICAgICAgICBvblZhbHVlQ2hhbmdlZD17dGhpcy5vbkVtYWlsQWRkcmVzc0NoYW5nZWR9IC8+O1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QmFzZURpYWxvZyBjbGFzc05hbWU9XCJteF9TZXRFbWFpbERpYWxvZ1wiXG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5vbkNhbmNlbGxlZH1cbiAgICAgICAgICAgICAgICB0aXRsZT17dGhpcy5wcm9wcy50aXRsZX1cbiAgICAgICAgICAgICAgICBjb250ZW50SWQ9J214X0RpYWxvZ19jb250ZW50J1xuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgPHAgaWQ9J214X0RpYWxvZ19jb250ZW50Jz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoJ1RoaXMgd2lsbCBhbGxvdyB5b3UgdG8gcmVzZXQgeW91ciBwYXNzd29yZCBhbmQgcmVjZWl2ZSBub3RpZmljYXRpb25zLicpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICB7IGVtYWlsSW5wdXQgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2J1dHRvbnNcIj5cbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19wcmltYXJ5XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJzdWJtaXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e190KFwiQ29udGludWVcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uU3VibWl0fVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJzdWJtaXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e190KFwiU2tpcFwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25DYW5jZWxsZWR9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L0Jhc2VEaWFsb2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQXlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ2UsTUFBTUEsY0FBTixTQUE2QkMsY0FBQSxDQUFNQyxTQUFuQyxDQUE2RDtFQUd4RUMsV0FBVyxDQUFDQyxLQUFELEVBQWdCO0lBQ3ZCLE1BQU1BLEtBQU47SUFEdUI7SUFBQSw2REFTTUMsS0FBRCxJQUF5QjtNQUNyRCxLQUFLQyxRQUFMLENBQWM7UUFDVkMsWUFBWSxFQUFFRjtNQURKLENBQWQ7SUFHSCxDQWIwQjtJQUFBLGdEQWVSLE1BQVk7TUFDM0IsTUFBTUUsWUFBWSxHQUFHLEtBQUtDLEtBQUws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