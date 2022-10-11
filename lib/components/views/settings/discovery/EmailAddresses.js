"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.EmailAddress = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../../../languageHandler");

var _MatrixClientPeg = require("../../../../MatrixClientPeg");

var _Modal = _interopRequireDefault(require("../../../../Modal"));

var _AddThreepid = _interopRequireDefault(require("../../../../AddThreepid"));

var _ErrorDialog = _interopRequireDefault(require("../../dialogs/ErrorDialog"));

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
class EmailAddress extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onRevokeClick", e => {
      e.stopPropagation();
      e.preventDefault();
      this.changeBinding({
        bind: false,
        label: "revoke",
        errorTitle: (0, _languageHandler._t)("Unable to revoke sharing for email address")
      });
    });
    (0, _defineProperty2.default)(this, "onShareClick", e => {
      e.stopPropagation();
      e.preventDefault();
      this.changeBinding({
        bind: true,
        label: "share",
        errorTitle: (0, _languageHandler._t)("Unable to share email address")
      });
    });
    (0, _defineProperty2.default)(this, "onContinueClick", async e => {
      e.stopPropagation();
      e.preventDefault();
      this.setState({
        continueDisabled: true
      });

      try {
        await this.state.addTask.checkEmailLinkClicked();
        this.setState({
          addTask: null,
          continueDisabled: false,
          verifying: false
        });
      } catch (err) {
        this.setState({
          continueDisabled: false
        });

        if (err.errcode === 'M_THREEPID_AUTH_FAILED') {
          _Modal.default.createDialog(_ErrorDialog.default, {
            title: (0, _languageHandler._t)("Your email address hasn't been verified yet"),
            description: (0, _languageHandler._t)("Click the link in the email you received to verify " + "and then click continue again.")
          });
        } else {
          _logger.logger.error("Unable to verify email address: " + err);

          _Modal.default.createDialog(_ErrorDialog.default, {
            title: (0, _languageHandler._t)("Unable to verify email address."),
            description: err && err.message ? err.message : (0, _languageHandler._t)("Operation failed")
          });
        }
      }
    });
    const {
      bound
    } = props.email;
    this.state = {
      verifying: false,
      addTask: null,
      continueDisabled: false,
      bound
    };
  } // TODO: [REACT-WARNING] Replace with appropriate lifecycle event
  // eslint-disable-next-line @typescript-eslint/naming-convention, camelcase


  UNSAFE_componentWillReceiveProps(nextProps) {
    const {
      bound
    } = nextProps.email;
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
    } = this.props.email;

    try {
      if (bind) {
        const task = new _AddThreepid.default();
        this.setState({
          verifying: true,
          continueDisabled: true,
          addTask: task
        });
        await task.bindEmailAddress(address);
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
      _logger.logger.error(`Unable to ${label} email address ${address} ${err}`);

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
    } = this.props.email;
    const task = new _AddThreepid.default();
    this.setState({
      verifying: true,
      continueDisabled: true,
      addTask: task
    });

    try {
      await _MatrixClientPeg.MatrixClientPeg.get().deleteThreePid(medium, address);

      if (bind) {
        await task.bindEmailAddress(address);
      } else {
        await task.addEmailAddress(address);
      }

      this.setState({
        continueDisabled: false,
        bound: bind
      });
    } catch (err) {
      _logger.logger.error(`Unable to ${label} email address ${address} ${err}`);

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
    } = this.props.email;
    const {
      verifying,
      bound
    } = this.state;
    let status;

    if (verifying) {
      status = /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Verify the link in your inbox"), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_ExistingEmailAddress_confirmBtn",
        kind: "primary_sm",
        onClick: this.onContinueClick,
        disabled: this.state.continueDisabled
      }, (0, _languageHandler._t)("Complete")));
    } else if (bound) {
      status = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_ExistingEmailAddress_confirmBtn",
        kind: "danger_sm",
        onClick: this.onRevokeClick
      }, (0, _languageHandler._t)("Revoke"));
    } else {
      status = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_ExistingEmailAddress_confirmBtn",
        kind: "primary_sm",
        onClick: this.onShareClick
      }, (0, _languageHandler._t)("Share"));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ExistingEmailAddress"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_ExistingEmailAddress_email"
    }, address), status);
  }

}

exports.EmailAddress = EmailAddress;

class EmailAddresses extends _react.default.Component {
  render() {
    let content;

    if (this.props.emails.length > 0) {
      content = this.props.emails.map(e => {
        return /*#__PURE__*/_react.default.createElement(EmailAddress, {
          email: e,
          key: e.address
        });
      });
    } else {
      content = /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_SettingsTab_subsectionText"
      }, (0, _languageHandler._t)("Discovery options will appear once you have added an email above."));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_EmailAddresses"
    }, content);
  }

}

exports.default = EmailAddresses;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFbWFpbEFkZHJlc3MiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJlIiwic3RvcFByb3BhZ2F0aW9uIiwicHJldmVudERlZmF1bHQiLCJjaGFuZ2VCaW5kaW5nIiwiYmluZCIsImxhYmVsIiwiZXJyb3JUaXRsZSIsIl90Iiwic2V0U3RhdGUiLCJjb250aW51ZURpc2FibGVkIiwic3RhdGUiLCJhZGRUYXNrIiwiY2hlY2tFbWFpbExpbmtDbGlja2VkIiwidmVyaWZ5aW5nIiwiZXJyIiwiZXJyY29kZSIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwiRXJyb3JEaWFsb2ciLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwibG9nZ2VyIiwiZXJyb3IiLCJtZXNzYWdlIiwiYm91bmQiLCJlbWFpbCIsIlVOU0FGRV9jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzIiwibmV4dFByb3BzIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiZG9lc1NlcnZlclN1cHBvcnRTZXBhcmF0ZUFkZEFuZEJpbmQiLCJjaGFuZ2VCaW5kaW5nVGFuZ2xlZEFkZEJpbmQiLCJtZWRpdW0iLCJhZGRyZXNzIiwidGFzayIsIkFkZFRocmVlcGlkIiwiYmluZEVtYWlsQWRkcmVzcyIsInVuYmluZFRocmVlUGlkIiwiZGVsZXRlVGhyZWVQaWQiLCJhZGRFbWFpbEFkZHJlc3MiLCJyZW5kZXIiLCJzdGF0dXMiLCJvbkNvbnRpbnVlQ2xpY2siLCJvblJldm9rZUNsaWNrIiwib25TaGFyZUNsaWNrIiwiRW1haWxBZGRyZXNzZXMiLCJjb250ZW50IiwiZW1haWxzIiwibGVuZ3RoIiwibWFwIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3Mvc2V0dGluZ3MvZGlzY292ZXJ5L0VtYWlsQWRkcmVzc2VzLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IElUaHJlZXBpZCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvdGhyZWVwaWRzXCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5cbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSBcIi4uLy4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uLy4uLy4uL01vZGFsJztcbmltcG9ydCBBZGRUaHJlZXBpZCBmcm9tICcuLi8uLi8uLi8uLi9BZGRUaHJlZXBpZCc7XG5pbXBvcnQgRXJyb3JEaWFsb2cgZnJvbSBcIi4uLy4uL2RpYWxvZ3MvRXJyb3JEaWFsb2dcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi8uLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5cbi8qXG5UT0RPOiBJbXByb3ZlIHRoZSBVWCBmb3IgZXZlcnl0aGluZyBpbiBoZXJlLlxuSXQncyB2ZXJ5IG11Y2ggcGxhY2Vob2xkZXIsIGJ1dCBpdCBnZXRzIHRoZSBqb2IgZG9uZS4gVGhlIG9sZCB3YXkgb2YgaGFuZGxpbmdcbmVtYWlsIGFkZHJlc3NlcyBpbiB1c2VyIHNldHRpbmdzIHdhcyB0byB1c2UgZGlhbG9ncyB0byBjb21tdW5pY2F0ZSBzdGF0ZSwgaG93ZXZlclxuZHVlIHRvIG91ciBkaWFsb2cgc3lzdGVtIG92ZXJyaWRpbmcgZGlhbG9ncyAoY2F1c2luZyB1bm1vdW50cykgdGhpcyBjcmVhdGVzIHByb2JsZW1zXG5mb3IgYSBzYW5lIFVYLiBGb3IgaW5zdGFuY2UsIHRoZSB1c2VyIGNvdWxkIGVhc2lseSBlbmQgdXAgZW50ZXJpbmcgYW4gZW1haWwgYWRkcmVzc1xuYW5kIHJlY2VpdmUgYSBkaWFsb2cgdG8gdmVyaWZ5IHRoZSBhZGRyZXNzLCB3aGljaCB0aGVuIGNhdXNlcyB0aGUgY29tcG9uZW50IGhlcmVcbnRvIGZvcmdldCB3aGF0IGl0IHdhcyBkb2luZyBhbmQgdWx0aW1hdGVseSBmYWlsLiBEaWFsb2dzIGFyZSBzdGlsbCB1c2VkIGluIHNvbWVcbnBsYWNlcyB0byBjb21tdW5pY2F0ZSBlcnJvcnMgLSB0aGVzZSBzaG91bGQgYmUgcmVwbGFjZWQgd2l0aCBpbmxpbmUgdmFsaWRhdGlvbiB3aGVuXG50aGF0IGlzIGF2YWlsYWJsZS5cbiovXG5cbi8qXG5UT0RPOiBSZWR1Y2UgYWxsIHRoZSBjb3B5aW5nIGJldHdlZW4gYWNjb3VudCB2cy4gZGlzY292ZXJ5IGNvbXBvbmVudHMuXG4qL1xuXG5pbnRlcmZhY2UgSUVtYWlsQWRkcmVzc1Byb3BzIHtcbiAgICBlbWFpbDogSVRocmVlcGlkO1xufVxuXG5pbnRlcmZhY2UgSUVtYWlsQWRkcmVzc1N0YXRlIHtcbiAgICB2ZXJpZnlpbmc6IGJvb2xlYW47XG4gICAgYWRkVGFzazogYW55OyAvLyBGSVhNRTogV2hlbiBBZGRUaHJlZXBpZCBpcyBUU2ZpZWRcbiAgICBjb250aW51ZURpc2FibGVkOiBib29sZWFuO1xuICAgIGJvdW5kOiBib29sZWFuO1xufVxuXG5leHBvcnQgY2xhc3MgRW1haWxBZGRyZXNzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElFbWFpbEFkZHJlc3NQcm9wcywgSUVtYWlsQWRkcmVzc1N0YXRlPiB7XG4gICAgY29uc3RydWN0b3IocHJvcHM6IElFbWFpbEFkZHJlc3NQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgY29uc3QgeyBib3VuZCB9ID0gcHJvcHMuZW1haWw7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHZlcmlmeWluZzogZmFsc2UsXG4gICAgICAgICAgICBhZGRUYXNrOiBudWxsLFxuICAgICAgICAgICAgY29udGludWVEaXNhYmxlZDogZmFsc2UsXG4gICAgICAgICAgICBib3VuZCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBbUkVBQ1QtV0FSTklOR10gUmVwbGFjZSB3aXRoIGFwcHJvcHJpYXRlIGxpZmVjeWNsZSBldmVudFxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbmFtaW5nLWNvbnZlbnRpb24sIGNhbWVsY2FzZVxuICAgIHB1YmxpYyBVTlNBRkVfY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHM6IElFbWFpbEFkZHJlc3NQcm9wcyk6IHZvaWQge1xuICAgICAgICBjb25zdCB7IGJvdW5kIH0gPSBuZXh0UHJvcHMuZW1haWw7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBib3VuZCB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGNoYW5nZUJpbmRpbmcoeyBiaW5kLCBsYWJlbCwgZXJyb3JUaXRsZSB9KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGlmICghKGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5kb2VzU2VydmVyU3VwcG9ydFNlcGFyYXRlQWRkQW5kQmluZCgpKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hhbmdlQmluZGluZ1RhbmdsZWRBZGRCaW5kKHsgYmluZCwgbGFiZWwsIGVycm9yVGl0bGUgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB7IG1lZGl1bSwgYWRkcmVzcyB9ID0gdGhpcy5wcm9wcy5lbWFpbDtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKGJpbmQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0YXNrID0gbmV3IEFkZFRocmVlcGlkKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIHZlcmlmeWluZzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVEaXNhYmxlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgYWRkVGFzazogdGFzayxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBhd2FpdCB0YXNrLmJpbmRFbWFpbEFkZHJlc3MoYWRkcmVzcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlRGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkudW5iaW5kVGhyZWVQaWQobWVkaXVtLCBhZGRyZXNzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBib3VuZDogYmluZCB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoYFVuYWJsZSB0byAke2xhYmVsfSBlbWFpbCBhZGRyZXNzICR7YWRkcmVzc30gJHtlcnJ9YCk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICB2ZXJpZnlpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvbnRpbnVlRGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGFkZFRhc2s6IG51bGwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBlcnJvclRpdGxlLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAoKGVyciAmJiBlcnIubWVzc2FnZSkgPyBlcnIubWVzc2FnZSA6IF90KFwiT3BlcmF0aW9uIGZhaWxlZFwiKSksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgY2hhbmdlQmluZGluZ1RhbmdsZWRBZGRCaW5kKHsgYmluZCwgbGFiZWwsIGVycm9yVGl0bGUgfSk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCB7IG1lZGl1bSwgYWRkcmVzcyB9ID0gdGhpcy5wcm9wcy5lbWFpbDtcblxuICAgICAgICBjb25zdCB0YXNrID0gbmV3IEFkZFRocmVlcGlkKCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdmVyaWZ5aW5nOiB0cnVlLFxuICAgICAgICAgICAgY29udGludWVEaXNhYmxlZDogdHJ1ZSxcbiAgICAgICAgICAgIGFkZFRhc2s6IHRhc2ssXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZGVsZXRlVGhyZWVQaWQobWVkaXVtLCBhZGRyZXNzKTtcbiAgICAgICAgICAgIGlmIChiaW5kKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGFzay5iaW5kRW1haWxBZGRyZXNzKGFkZHJlc3MpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0YXNrLmFkZEVtYWlsQWRkcmVzcyhhZGRyZXNzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlRGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGJvdW5kOiBiaW5kLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGBVbmFibGUgdG8gJHtsYWJlbH0gZW1haWwgYWRkcmVzcyAke2FkZHJlc3N9ICR7ZXJyfWApO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgdmVyaWZ5aW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb250aW51ZURpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBhZGRUYXNrOiBudWxsLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogZXJyb3JUaXRsZSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogKChlcnIgJiYgZXJyLm1lc3NhZ2UpID8gZXJyLm1lc3NhZ2UgOiBfdChcIk9wZXJhdGlvbiBmYWlsZWRcIikpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUmV2b2tlQ2xpY2sgPSAoZTogUmVhY3QuTW91c2VFdmVudCk6IHZvaWQgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMuY2hhbmdlQmluZGluZyh7XG4gICAgICAgICAgICBiaW5kOiBmYWxzZSxcbiAgICAgICAgICAgIGxhYmVsOiBcInJldm9rZVwiLFxuICAgICAgICAgICAgZXJyb3JUaXRsZTogX3QoXCJVbmFibGUgdG8gcmV2b2tlIHNoYXJpbmcgZm9yIGVtYWlsIGFkZHJlc3NcIiksXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uU2hhcmVDbGljayA9IChlOiBSZWFjdC5Nb3VzZUV2ZW50KTogdm9pZCA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5jaGFuZ2VCaW5kaW5nKHtcbiAgICAgICAgICAgIGJpbmQ6IHRydWUsXG4gICAgICAgICAgICBsYWJlbDogXCJzaGFyZVwiLFxuICAgICAgICAgICAgZXJyb3JUaXRsZTogX3QoXCJVbmFibGUgdG8gc2hhcmUgZW1haWwgYWRkcmVzc1wiKSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Db250aW51ZUNsaWNrID0gYXN5bmMgKGU6IFJlYWN0Lk1vdXNlRXZlbnQpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjb250aW51ZURpc2FibGVkOiB0cnVlIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zdGF0ZS5hZGRUYXNrLmNoZWNrRW1haWxMaW5rQ2xpY2tlZCgpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgYWRkVGFzazogbnVsbCxcbiAgICAgICAgICAgICAgICBjb250aW51ZURpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB2ZXJpZnlpbmc6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvbnRpbnVlRGlzYWJsZWQ6IGZhbHNlIH0pO1xuICAgICAgICAgICAgaWYgKGVyci5lcnJjb2RlID09PSAnTV9USFJFRVBJRF9BVVRIX0ZBSUxFRCcpIHtcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiWW91ciBlbWFpbCBhZGRyZXNzIGhhc24ndCBiZWVuIHZlcmlmaWVkIHlldFwiKSxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFwiQ2xpY2sgdGhlIGxpbmsgaW4gdGhlIGVtYWlsIHlvdSByZWNlaXZlZCB0byB2ZXJpZnkgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJhbmQgdGhlbiBjbGljayBjb250aW51ZSBhZ2Fpbi5cIiksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIlVuYWJsZSB0byB2ZXJpZnkgZW1haWwgYWRkcmVzczogXCIgKyBlcnIpO1xuICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJVbmFibGUgdG8gdmVyaWZ5IGVtYWlsIGFkZHJlc3MuXCIpLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogKChlcnIgJiYgZXJyLm1lc3NhZ2UpID8gZXJyLm1lc3NhZ2UgOiBfdChcIk9wZXJhdGlvbiBmYWlsZWRcIikpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHB1YmxpYyByZW5kZXIoKTogSlNYLkVsZW1lbnQge1xuICAgICAgICBjb25zdCB7IGFkZHJlc3MgfSA9IHRoaXMucHJvcHMuZW1haWw7XG4gICAgICAgIGNvbnN0IHsgdmVyaWZ5aW5nLCBib3VuZCB9ID0gdGhpcy5zdGF0ZTtcblxuICAgICAgICBsZXQgc3RhdHVzO1xuICAgICAgICBpZiAodmVyaWZ5aW5nKSB7XG4gICAgICAgICAgICBzdGF0dXMgPSA8c3Bhbj5cbiAgICAgICAgICAgICAgICB7IF90KFwiVmVyaWZ5IHRoZSBsaW5rIGluIHlvdXIgaW5ib3hcIikgfVxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0V4aXN0aW5nRW1haWxBZGRyZXNzX2NvbmZpcm1CdG5cIlxuICAgICAgICAgICAgICAgICAgICBraW5kPVwicHJpbWFyeV9zbVwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25Db250aW51ZUNsaWNrfVxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5zdGF0ZS5jb250aW51ZURpc2FibGVkfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIkNvbXBsZXRlXCIpIH1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICA8L3NwYW4+O1xuICAgICAgICB9IGVsc2UgaWYgKGJvdW5kKSB7XG4gICAgICAgICAgICBzdGF0dXMgPSA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0V4aXN0aW5nRW1haWxBZGRyZXNzX2NvbmZpcm1CdG5cIlxuICAgICAgICAgICAgICAgIGtpbmQ9XCJkYW5nZXJfc21cIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25SZXZva2VDbGlja31cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IF90KFwiUmV2b2tlXCIpIH1cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGF0dXMgPSA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0V4aXN0aW5nRW1haWxBZGRyZXNzX2NvbmZpcm1CdG5cIlxuICAgICAgICAgICAgICAgIGtpbmQ9XCJwcmltYXJ5X3NtXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uU2hhcmVDbGlja31cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IF90KFwiU2hhcmVcIikgfVxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0V4aXN0aW5nRW1haWxBZGRyZXNzXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfRXhpc3RpbmdFbWFpbEFkZHJlc3NfZW1haWxcIj57IGFkZHJlc3MgfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICB7IHN0YXR1cyB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBlbWFpbHM6IElUaHJlZXBpZFtdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFbWFpbEFkZHJlc3NlcyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHM+IHtcbiAgICBwdWJsaWMgcmVuZGVyKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgbGV0IGNvbnRlbnQ7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmVtYWlscy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb250ZW50ID0gdGhpcy5wcm9wcy5lbWFpbHMubWFwKChlKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxFbWFpbEFkZHJlc3MgZW1haWw9e2V9IGtleT17ZS5hZGRyZXNzfSAvPjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29udGVudCA9IDxzcGFuIGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0XCI+XG4gICAgICAgICAgICAgICAgeyBfdChcIkRpc2NvdmVyeSBvcHRpb25zIHdpbGwgYXBwZWFyIG9uY2UgeW91IGhhdmUgYWRkZWQgYW4gZW1haWwgYWJvdmUuXCIpIH1cbiAgICAgICAgICAgIDwvc3Bhbj47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FbWFpbEFkZHJlc3Nlc1wiPlxuICAgICAgICAgICAgICAgIHsgY29udGVudCB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBaUJBOztBQUVBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQTFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXdDTyxNQUFNQSxZQUFOLFNBQTJCQyxjQUFBLENBQU1DLFNBQWpDLENBQW1GO0VBQ3RGQyxXQUFXLENBQUNDLEtBQUQsRUFBNEI7SUFDbkMsTUFBTUEsS0FBTjtJQURtQyxxREE0RmRDLENBQUQsSUFBK0I7TUFDbkRBLENBQUMsQ0FBQ0MsZUFBRjtNQUNBRCxDQUFDLENBQUNFLGNBQUY7TUFDQSxLQUFLQyxhQUFMLENBQW1CO1FBQ2ZDLElBQUksRUFBRSxLQURTO1FBRWZDLEtBQUssRUFBRSxRQUZRO1FBR2ZDLFVBQVUsRUFBRSxJQUFBQyxtQkFBQSxFQUFHLDRDQUFIO01BSEcsQ0FBbkI7SUFLSCxDQXBHc0M7SUFBQSxvREFzR2ZQLENBQUQsSUFBK0I7TUFDbERBLENBQUMsQ0FBQ0MsZUFBRjtNQUNBRCxDQUFDLENBQUNFLGNBQUY7TUFDQSxLQUFLQyxhQUFMLENBQW1CO1FBQ2ZDLElBQUksRUFBRSxJQURTO1FBRWZD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