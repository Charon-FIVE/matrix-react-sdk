"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _languageHandler = require("../../../languageHandler");

var _submitRageshake = _interopRequireWildcard(require("../../../rageshake/submit-rageshake"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _QuestionDialog = _interopRequireDefault(require("./QuestionDialog"));

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _Field = _interopRequireDefault(require("../elements/Field"));

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

var _DialogButtons = _interopRequireDefault(require("../elements/DialogButtons"));

var _sentry = require("../../../sentry");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _actions = require("../../../dispatcher/actions");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2017 OpenMarket Ltd
Copyright 2018 New Vector Ltd
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>
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
class BugReportDialog extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "unmounted", void 0);
    (0, _defineProperty2.default)(this, "onCancel", () => {
      this.props.onFinished(false);
    });
    (0, _defineProperty2.default)(this, "onSubmit", () => {
      if ((!this.state.text || !this.state.text.trim()) && (!this.state.issueUrl || !this.state.issueUrl.trim())) {
        this.setState({
          err: (0, _languageHandler._t)("Please tell us what went wrong or, better, create a GitHub issue that describes the problem.")
        });
        return;
      }

      const userText = (this.state.text.length > 0 ? this.state.text + '\n\n' : '') + 'Issue: ' + (this.state.issueUrl.length > 0 ? this.state.issueUrl : 'No issue link given');
      this.setState({
        busy: true,
        progress: null,
        err: null
      });
      this.sendProgressCallback((0, _languageHandler._t)("Preparing to send logs"));
      (0, _submitRageshake.default)(_SdkConfig.default.get().bug_report_endpoint_url, {
        userText,
        sendLogs: true,
        progressCallback: this.sendProgressCallback,
        labels: this.props.label ? [this.props.label] : []
      }).then(() => {
        if (!this.unmounted) {
          this.props.onFinished(false);

          _Modal.default.createDialog(_QuestionDialog.default, {
            title: (0, _languageHandler._t)('Logs sent'),
            description: (0, _languageHandler._t)('Thank you!'),
            hasCancelButton: false
          });
        }
      }, err => {
        if (!this.unmounted) {
          this.setState({
            busy: false,
            progress: null,
            err: (0, _languageHandler._t)("Failed to send logs: ") + `${err.message}`
          });
        }
      });
      (0, _sentry.sendSentryReport)(this.state.text, this.state.issueUrl, this.props.error);
    });
    (0, _defineProperty2.default)(this, "onDownload", async () => {
      this.setState({
        downloadBusy: true
      });
      this.downloadProgressCallback((0, _languageHandler._t)("Preparing to download logs"));

      try {
        await (0, _submitRageshake.downloadBugReport)({
          sendLogs: true,
          progressCallback: this.downloadProgressCallback,
          labels: this.props.label ? [this.props.label] : []
        });
        this.setState({
          downloadBusy: false,
          downloadProgress: null
        });
      } catch (err) {
        if (!this.unmounted) {
          this.setState({
            downloadBusy: false,
            downloadProgress: (0, _languageHandler._t)("Failed to send logs: ") + `${err.message}`
          });
        }
      }
    });
    (0, _defineProperty2.default)(this, "onTextChange", ev => {
      this.setState({
        text: ev.currentTarget.value
      });
    });
    (0, _defineProperty2.default)(this, "onIssueUrlChange", ev => {
      this.setState({
        issueUrl: ev.currentTarget.value
      });
    });
    (0, _defineProperty2.default)(this, "sendProgressCallback", progress => {
      if (this.unmounted) {
        return;
      }

      this.setState({
        progress
      });
    });
    (0, _defineProperty2.default)(this, "downloadProgressCallback", downloadProgress => {
      if (this.unmounted) {
        return;
      }

      this.setState({
        downloadProgress
      });
    });
    this.state = {
      sendLogs: true,
      busy: false,
      err: null,
      issueUrl: "",
      text: props.initialText || "",
      progress: null,
      downloadBusy: false,
      downloadProgress: null
    };
    this.unmounted = false; // Get all of the extra info dumped to the console when someone is about
    // to send debug logs. Since this is a fire and forget action, we do
    // this when the bug report dialog is opened instead of when we submit
    // logs because we have no signal to know when all of the various
    // components have finished logging. Someone could potentially send logs
    // before we fully dump everything but it's probably unlikely.

    _dispatcher.default.dispatch({
      action: _actions.Action.DumpDebugLogs
    });
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  render() {
    let error = null;

    if (this.state.err) {
      error = /*#__PURE__*/_react.default.createElement("div", {
        className: "error"
      }, this.state.err);
    }

    let progress = null;

    if (this.state.busy) {
      progress = /*#__PURE__*/_react.default.createElement("div", {
        className: "progress"
      }, /*#__PURE__*/_react.default.createElement(_Spinner.default, null), this.state.progress, " ...");
    }

    let warning;

    if (window.Modernizr && Object.values(window.Modernizr).some(support => support === false)) {
      warning = /*#__PURE__*/_react.default.createElement("p", null, /*#__PURE__*/_react.default.createElement("b", null, (0, _languageHandler._t)("Reminder: Your browser is unsupported, so your experience may be unpredictable.")));
    }

    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_BugReportDialog",
      onFinished: this.onCancel,
      title: (0, _languageHandler._t)('Submit debug logs'),
      contentId: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_content",
      id: "mx_Dialog_content"
    }, warning, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Debug logs contain application usage data including your " + "username, the IDs or aliases of the rooms you " + "have visited, which UI elements you last interacted with, " + "and the usernames of other users. They do not contain messages.")), /*#__PURE__*/_react.default.createElement("p", null, /*#__PURE__*/_react.default.createElement("b", null, (0, _languageHandler._t)("Before submitting logs, you must <a>create a GitHub issue</a> to describe your problem.", {}, {
      a: sub => /*#__PURE__*/_react.default.createElement("a", {
        target: "_blank",
        href: "https://github.com/vector-im/element-web/issues/new/choose"
      }, sub)
    }))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_BugReportDialog_download"
    }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this.onDownload,
      kind: "link",
      disabled: this.state.downloadBusy
    }, (0, _languageHandler._t)("Download logs")), this.state.downloadProgress && /*#__PURE__*/_react.default.createElement("span", null, this.state.downloadProgress, " ...")), /*#__PURE__*/_react.default.createElement(_Field.default, {
      type: "text",
      className: "mx_BugReportDialog_field_input",
      label: (0, _languageHandler._t)("GitHub issue"),
      onChange: this.onIssueUrlChange,
      value: this.state.issueUrl,
      placeholder: "https://github.com/vector-im/element-web/issues/..."
    }), /*#__PURE__*/_react.default.createElement(_Field.default, {
      className: "mx_BugReportDialog_field_input",
      element: "textarea",
      label: (0, _languageHandler._t)("Notes"),
      rows: 5,
      onChange: this.onTextChange,
      value: this.state.text,
      placeholder: (0, _languageHandler._t)("If there is additional context that would help in " + "analysing the issue, such as what you were doing at " + "the time, room IDs, user IDs, etc., " + "please include those things here.")
    }), progress, error), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: (0, _languageHandler._t)("Send logs"),
      onPrimaryButtonClick: this.onSubmit,
      focus: true,
      onCancel: this.onCancel,
      disabled: this.state.busy
    }));
  }

}

exports.default = BugReportDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCdWdSZXBvcnREaWFsb2ciLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJvbkZpbmlzaGVkIiwic3RhdGUiLCJ0ZXh0IiwidHJpbSIsImlzc3VlVXJsIiwic2V0U3RhdGUiLCJlcnIiLCJfdCIsInVzZXJUZXh0IiwibGVuZ3RoIiwiYnVzeSIsInByb2dyZXNzIiwic2VuZFByb2dyZXNzQ2FsbGJhY2siLCJzZW5kQnVnUmVwb3J0IiwiU2RrQ29uZmlnIiwiZ2V0IiwiYnVnX3JlcG9ydF9lbmRwb2ludF91cmwiLCJzZW5kTG9ncyIsInByb2dyZXNzQ2FsbGJhY2siLCJsYWJlbHMiLCJsYWJlbCIsInRoZW4iLCJ1bm1vdW50ZWQiLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIlF1ZXN0aW9uRGlhbG9nIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsImhhc0NhbmNlbEJ1dHRvbiIsIm1lc3NhZ2UiLCJzZW5kU2VudHJ5UmVwb3J0IiwiZXJyb3IiLCJkb3dubG9hZEJ1c3kiLCJkb3dubG9hZFByb2dyZXNzQ2FsbGJhY2siLCJkb3dubG9hZEJ1Z1JlcG9ydCIsImRvd25sb2FkUHJvZ3Jlc3MiLCJldiIsImN1cnJlbnRUYXJnZXQiLCJ2YWx1ZSIsImluaXRpYWxUZXh0IiwiZGVmYXVsdERpc3BhdGNoZXIiLCJkaXNwYXRjaCIsImFjdGlvbiIsIkFjdGlvbiIsIkR1bXBEZWJ1Z0xvZ3MiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInJlbmRlciIsIndhcm5pbmciLCJ3aW5kb3ciLCJNb2Rlcm5penIiLCJPYmplY3QiLCJ2YWx1ZXMiLCJzb21lIiwic3VwcG9ydCIsIm9uQ2FuY2VsIiwiYSIsInN1YiIsIm9uRG93bmxvYWQiLCJvbklzc3VlVXJsQ2hhbmdlIiwib25UZXh0Q2hhbmdlIiwib25TdWJtaXQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL0J1Z1JlcG9ydERpYWxvZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE3IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTkgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmltcG9ydCBTZGtDb25maWcgZnJvbSAnLi4vLi4vLi4vU2RrQ29uZmlnJztcbmltcG9ydCBNb2RhbCBmcm9tICcuLi8uLi8uLi9Nb2RhbCc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgc2VuZEJ1Z1JlcG9ydCwgeyBkb3dubG9hZEJ1Z1JlcG9ydCB9IGZyb20gJy4uLy4uLy4uL3JhZ2VzaGFrZS9zdWJtaXQtcmFnZXNoYWtlJztcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgUXVlc3Rpb25EaWFsb2cgZnJvbSBcIi4vUXVlc3Rpb25EaWFsb2dcIjtcbmltcG9ydCBCYXNlRGlhbG9nIGZyb20gXCIuL0Jhc2VEaWFsb2dcIjtcbmltcG9ydCBGaWVsZCBmcm9tICcuLi9lbGVtZW50cy9GaWVsZCc7XG5pbXBvcnQgU3Bpbm5lciBmcm9tIFwiLi4vZWxlbWVudHMvU3Bpbm5lclwiO1xuaW1wb3J0IERpYWxvZ0J1dHRvbnMgZnJvbSBcIi4uL2VsZW1lbnRzL0RpYWxvZ0J1dHRvbnNcIjtcbmltcG9ydCB7IHNlbmRTZW50cnlSZXBvcnQgfSBmcm9tIFwiLi4vLi4vLi4vc2VudHJ5XCI7XG5pbXBvcnQgZGVmYXVsdERpc3BhdGNoZXIgZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9ucyc7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIG9uRmluaXNoZWQ6IChzdWNjZXNzOiBib29sZWFuKSA9PiB2b2lkO1xuICAgIGluaXRpYWxUZXh0Pzogc3RyaW5nO1xuICAgIGxhYmVsPzogc3RyaW5nO1xuICAgIGVycm9yPzogRXJyb3I7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIHNlbmRMb2dzOiBib29sZWFuO1xuICAgIGJ1c3k6IGJvb2xlYW47XG4gICAgZXJyOiBzdHJpbmc7XG4gICAgaXNzdWVVcmw6IHN0cmluZztcbiAgICB0ZXh0OiBzdHJpbmc7XG4gICAgcHJvZ3Jlc3M6IHN0cmluZztcbiAgICBkb3dubG9hZEJ1c3k6IGJvb2xlYW47XG4gICAgZG93bmxvYWRQcm9ncmVzczogc3RyaW5nO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCdWdSZXBvcnREaWFsb2cgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIHVubW91bnRlZDogYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHNlbmRMb2dzOiB0cnVlLFxuICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICBlcnI6IG51bGwsXG4gICAgICAgICAgICBpc3N1ZVVybDogXCJcIixcbiAgICAgICAgICAgIHRleHQ6IHByb3BzLmluaXRpYWxUZXh0IHx8IFwiXCIsXG4gICAgICAgICAgICBwcm9ncmVzczogbnVsbCxcbiAgICAgICAgICAgIGRvd25sb2FkQnVzeTogZmFsc2UsXG4gICAgICAgICAgICBkb3dubG9hZFByb2dyZXNzOiBudWxsLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnVubW91bnRlZCA9IGZhbHNlO1xuXG4gICAgICAgIC8vIEdldCBhbGwgb2YgdGhlIGV4dHJhIGluZm8gZHVtcGVkIHRvIHRoZSBjb25zb2xlIHdoZW4gc29tZW9uZSBpcyBhYm91dFxuICAgICAgICAvLyB0byBzZW5kIGRlYnVnIGxvZ3MuIFNpbmNlIHRoaXMgaXMgYSBmaXJlIGFuZCBmb3JnZXQgYWN0aW9uLCB3ZSBkb1xuICAgICAgICAvLyB0aGlzIHdoZW4gdGhlIGJ1ZyByZXBvcnQgZGlhbG9nIGlzIG9wZW5lZCBpbnN0ZWFkIG9mIHdoZW4gd2Ugc3VibWl0XG4gICAgICAgIC8vIGxvZ3MgYmVjYXVzZSB3ZSBoYXZlIG5vIHNpZ25hbCB0byBrbm93IHdoZW4gYWxsIG9mIHRoZSB2YXJpb3VzXG4gICAgICAgIC8vIGNvbXBvbmVudHMgaGF2ZSBmaW5pc2hlZCBsb2dnaW5nLiBTb21lb25lIGNvdWxkIHBvdGVudGlhbGx5IHNlbmQgbG9nc1xuICAgICAgICAvLyBiZWZvcmUgd2UgZnVsbHkgZHVtcCBldmVyeXRoaW5nIGJ1dCBpdCdzIHByb2JhYmx5IHVubGlrZWx5LlxuICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5EdW1wRGVidWdMb2dzLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIHRoaXMudW5tb3VudGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQ2FuY2VsID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoZmFsc2UpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uU3VibWl0ID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBpZiAoKCF0aGlzLnN0YXRlLnRleHQgfHwgIXRoaXMuc3RhdGUudGV4dC50cmltKCkpICYmICghdGhpcy5zdGF0ZS5pc3N1ZVVybCB8fCAhdGhpcy5zdGF0ZS5pc3N1ZVVybC50cmltKCkpKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBlcnI6IF90KFwiUGxlYXNlIHRlbGwgdXMgd2hhdCB3ZW50IHdyb25nIG9yLCBiZXR0ZXIsIGNyZWF0ZSBhIEdpdEh1YiBpc3N1ZSB0aGF0IGRlc2NyaWJlcyB0aGUgcHJvYmxlbS5cIiksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHVzZXJUZXh0ID1cbiAgICAgICAgICAgICh0aGlzLnN0YXRlLnRleHQubGVuZ3RoID4gMCA/IHRoaXMuc3RhdGUudGV4dCArICdcXG5cXG4nOiAnJykgKyAnSXNzdWU6ICcgK1xuICAgICAgICAgICAgKHRoaXMuc3RhdGUuaXNzdWVVcmwubGVuZ3RoID4gMCA/IHRoaXMuc3RhdGUuaXNzdWVVcmwgOiAnTm8gaXNzdWUgbGluayBnaXZlbicpO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBidXN5OiB0cnVlLCBwcm9ncmVzczogbnVsbCwgZXJyOiBudWxsIH0pO1xuICAgICAgICB0aGlzLnNlbmRQcm9ncmVzc0NhbGxiYWNrKF90KFwiUHJlcGFyaW5nIHRvIHNlbmQgbG9nc1wiKSk7XG5cbiAgICAgICAgc2VuZEJ1Z1JlcG9ydChTZGtDb25maWcuZ2V0KCkuYnVnX3JlcG9ydF9lbmRwb2ludF91cmwsIHtcbiAgICAgICAgICAgIHVzZXJUZXh0LFxuICAgICAgICAgICAgc2VuZExvZ3M6IHRydWUsXG4gICAgICAgICAgICBwcm9ncmVzc0NhbGxiYWNrOiB0aGlzLnNlbmRQcm9ncmVzc0NhbGxiYWNrLFxuICAgICAgICAgICAgbGFiZWxzOiB0aGlzLnByb3BzLmxhYmVsID8gW3RoaXMucHJvcHMubGFiZWxdIDogW10sXG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnVubW91bnRlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChmYWxzZSk7XG4gICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKFF1ZXN0aW9uRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnTG9ncyBzZW50JyksXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdCgnVGhhbmsgeW91IScpLFxuICAgICAgICAgICAgICAgICAgICBoYXNDYW5jZWxCdXR0b246IGZhbHNlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMudW5tb3VudGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzczogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgZXJyOiBfdChcIkZhaWxlZCB0byBzZW5kIGxvZ3M6IFwiKSArIGAke2Vyci5tZXNzYWdlfWAsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNlbmRTZW50cnlSZXBvcnQodGhpcy5zdGF0ZS50ZXh0LCB0aGlzLnN0YXRlLmlzc3VlVXJsLCB0aGlzLnByb3BzLmVycm9yKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkRvd25sb2FkID0gYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgZG93bmxvYWRCdXN5OiB0cnVlIH0pO1xuICAgICAgICB0aGlzLmRvd25sb2FkUHJvZ3Jlc3NDYWxsYmFjayhfdChcIlByZXBhcmluZyB0byBkb3dubG9hZCBsb2dzXCIpKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgZG93bmxvYWRCdWdSZXBvcnQoe1xuICAgICAgICAgICAgICAgIHNlbmRMb2dzOiB0cnVlLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzQ2FsbGJhY2s6IHRoaXMuZG93bmxvYWRQcm9ncmVzc0NhbGxiYWNrLFxuICAgICAgICAgICAgICAgIGxhYmVsczogdGhpcy5wcm9wcy5sYWJlbCA/IFt0aGlzLnByb3BzLmxhYmVsXSA6IFtdLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGRvd25sb2FkQnVzeTogZmFsc2UsXG4gICAgICAgICAgICAgICAgZG93bmxvYWRQcm9ncmVzczogbnVsbCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy51bm1vdW50ZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgZG93bmxvYWRCdXN5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZG93bmxvYWRQcm9ncmVzczogX3QoXCJGYWlsZWQgdG8gc2VuZCBsb2dzOiBcIikgKyBgJHtlcnIubWVzc2FnZX1gLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25UZXh0Q2hhbmdlID0gKGV2OiBSZWFjdC5Gb3JtRXZlbnQ8SFRNTFRleHRBcmVhRWxlbWVudD4pOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHRleHQ6IGV2LmN1cnJlbnRUYXJnZXQudmFsdWUgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Jc3N1ZVVybENoYW5nZSA9IChldjogUmVhY3QuRm9ybUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBpc3N1ZVVybDogZXYuY3VycmVudFRhcmdldC52YWx1ZSB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBzZW5kUHJvZ3Jlc3NDYWxsYmFjayA9IChwcm9ncmVzczogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwcm9ncmVzcyB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBkb3dubG9hZFByb2dyZXNzQ2FsbGJhY2sgPSAoZG93bmxvYWRQcm9ncmVzczogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBkb3dubG9hZFByb2dyZXNzIH0pO1xuICAgIH07XG5cbiAgICBwdWJsaWMgcmVuZGVyKCkge1xuICAgICAgICBsZXQgZXJyb3IgPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5lcnIpIHtcbiAgICAgICAgICAgIGVycm9yID0gPGRpdiBjbGFzc05hbWU9XCJlcnJvclwiPlxuICAgICAgICAgICAgICAgIHsgdGhpcy5zdGF0ZS5lcnIgfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHByb2dyZXNzID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuYnVzeSkge1xuICAgICAgICAgICAgcHJvZ3Jlc3MgPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwcm9ncmVzc1wiPlxuICAgICAgICAgICAgICAgICAgICA8U3Bpbm5lciAvPlxuICAgICAgICAgICAgICAgICAgICB7IHRoaXMuc3RhdGUucHJvZ3Jlc3MgfSAuLi5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgd2FybmluZztcbiAgICAgICAgaWYgKHdpbmRvdy5Nb2Rlcm5penIgJiYgT2JqZWN0LnZhbHVlcyh3aW5kb3cuTW9kZXJuaXpyKS5zb21lKHN1cHBvcnQgPT4gc3VwcG9ydCA9PT0gZmFsc2UpKSB7XG4gICAgICAgICAgICB3YXJuaW5nID0gPHA+PGI+XG4gICAgICAgICAgICAgICAgeyBfdChcIlJlbWluZGVyOiBZb3VyIGJyb3dzZXIgaXMgdW5zdXBwb3J0ZWQsIHNvIHlvdXIgZXhwZXJpZW5jZSBtYXkgYmUgdW5wcmVkaWN0YWJsZS5cIikgfVxuICAgICAgICAgICAgPC9iPjwvcD47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEJhc2VEaWFsb2dcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9CdWdSZXBvcnREaWFsb2dcIlxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMub25DYW5jZWx9XG4gICAgICAgICAgICAgICAgdGl0bGU9e190KCdTdWJtaXQgZGVidWcgbG9ncycpfVxuICAgICAgICAgICAgICAgIGNvbnRlbnRJZD0nbXhfRGlhbG9nX2NvbnRlbnQnXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfY29udGVudFwiIGlkPSdteF9EaWFsb2dfY29udGVudCc+XG4gICAgICAgICAgICAgICAgICAgIHsgd2FybmluZyB9XG4gICAgICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkRlYnVnIGxvZ3MgY29udGFpbiBhcHBsaWNhdGlvbiB1c2FnZSBkYXRhIGluY2x1ZGluZyB5b3VyIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInVzZXJuYW1lLCB0aGUgSURzIG9yIGFsaWFzZXMgb2YgdGhlIHJvb21zIHlvdSBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJoYXZlIHZpc2l0ZWQsIHdoaWNoIFVJIGVsZW1lbnRzIHlvdSBsYXN0IGludGVyYWN0ZWQgd2l0aCwgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYW5kIHRoZSB1c2VybmFtZXMgb2Ygb3RoZXIgdXNlcnMuIFRoZXkgZG8gbm90IGNvbnRhaW4gbWVzc2FnZXMuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICA8cD48Yj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJCZWZvcmUgc3VibWl0dGluZyBsb2dzLCB5b3UgbXVzdCA8YT5jcmVhdGUgYSBHaXRIdWIgaXNzdWU8L2E+IHRvIGRlc2NyaWJlIHlvdXIgcHJvYmxlbS5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGE6IChzdWIpID0+IDxhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ9XCJfYmxhbmtcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzL25ldy9jaG9vc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN1YiB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYT4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICkgfVxuICAgICAgICAgICAgICAgICAgICA8L2I+PC9wPlxuXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQnVnUmVwb3J0RGlhbG9nX2Rvd25sb2FkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXt0aGlzLm9uRG93bmxvYWR9IGtpbmQ9XCJsaW5rXCIgZGlzYWJsZWQ9e3RoaXMuc3RhdGUuZG93bmxvYWRCdXN5fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiRG93bmxvYWQgbG9nc1wiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHRoaXMuc3RhdGUuZG93bmxvYWRQcm9ncmVzcyAmJiA8c3Bhbj57IHRoaXMuc3RhdGUuZG93bmxvYWRQcm9ncmVzcyB9IC4uLjwvc3Bhbj4gfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0J1Z1JlcG9ydERpYWxvZ19maWVsZF9pbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJHaXRIdWIgaXNzdWVcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbklzc3VlVXJsQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUuaXNzdWVVcmx9XG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cImh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLy4uLlwiXG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQnVnUmVwb3J0RGlhbG9nX2ZpZWxkX2lucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ9XCJ0ZXh0YXJlYVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJOb3Rlc1wiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJvd3M9ezV9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblRleHRDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS50ZXh0fVxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e190KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiSWYgdGhlcmUgaXMgYWRkaXRpb25hbCBjb250ZXh0IHRoYXQgd291bGQgaGVscCBpbiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhbmFseXNpbmcgdGhlIGlzc3VlLCBzdWNoIGFzIHdoYXQgeW91IHdlcmUgZG9pbmcgYXQgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidGhlIHRpbWUsIHJvb20gSURzLCB1c2VyIElEcywgZXRjLiwgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGxlYXNlIGluY2x1ZGUgdGhvc2UgdGhpbmdzIGhlcmUuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICB7IHByb2dyZXNzIH1cbiAgICAgICAgICAgICAgICAgICAgeyBlcnJvciB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnMgcHJpbWFyeUJ1dHRvbj17X3QoXCJTZW5kIGxvZ3NcIil9XG4gICAgICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLm9uU3VibWl0fVxuICAgICAgICAgICAgICAgICAgICBmb2N1cz17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgb25DYW5jZWw9e3RoaXMub25DYW5jZWx9XG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLmJ1c3l9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBbUJBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBb0NlLE1BQU1BLGVBQU4sU0FBOEJDLGNBQUEsQ0FBTUMsU0FBcEMsQ0FBOEQ7RUFHekVDLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0lBQ2YsTUFBTUEsS0FBTjtJQURlO0lBQUEsZ0RBNkJBLE1BQVk7TUFDM0Is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