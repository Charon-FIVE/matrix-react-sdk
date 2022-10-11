"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _QuestionDialog = _interopRequireDefault(require("./QuestionDialog"));

var _languageHandler = require("../../../languageHandler");

var _Field = _interopRequireDefault(require("../elements/Field"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _BugReportDialog = _interopRequireDefault(require("./BugReportDialog"));

var _InfoDialog = _interopRequireDefault(require("./InfoDialog"));

var _submitRageshake = require("../../../rageshake/submit-rageshake");

var _useStateToggle = require("../../../hooks/useStateToggle");

var _StyledCheckbox = _interopRequireDefault(require("../elements/StyledCheckbox"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
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
const existingIssuesUrl = "https://github.com/vector-im/element-web/issues" + "?q=is%3Aopen+is%3Aissue+sort%3Areactions-%2B1-desc";
const newIssueUrl = "https://github.com/vector-im/element-web/issues/new/choose";

const FeedbackDialog = props => {
  const feedbackRef = (0, _react.useRef)();
  const [comment, setComment] = (0, _react.useState)("");
  const [canContact, toggleCanContact] = (0, _useStateToggle.useStateToggle)(false);
  (0, _react.useEffect)(() => {
    // autofocus doesn't work on textareas
    feedbackRef.current?.focus();
  }, []);

  const onDebugLogsLinkClick = () => {
    props.onFinished();

    _Modal.default.createDialog(_BugReportDialog.default, {});
  };

  const rageshakeUrl = _SdkConfig.default.get().bug_report_endpoint_url;

  const hasFeedback = !!rageshakeUrl;

  const onFinished = sendFeedback => {
    if (hasFeedback && sendFeedback) {
      if (rageshakeUrl) {
        const label = props.feature ? `${props.feature}-feedback` : "feedback";
        (0, _submitRageshake.submitFeedback)(rageshakeUrl, label, comment, canContact);
      }

      _Modal.default.createDialog(_InfoDialog.default, {
        title: (0, _languageHandler._t)('Feedback sent'),
        description: (0, _languageHandler._t)('Thank you!')
      });
    }

    props.onFinished();
  };

  let feedbackSection;

  if (rageshakeUrl) {
    feedbackSection = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_FeedbackDialog_section mx_FeedbackDialog_rateApp"
    }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Comment")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Your platform and username will be noted to help us use your feedback as much as we can.")), /*#__PURE__*/_react.default.createElement(_Field.default, {
      id: "feedbackComment",
      label: (0, _languageHandler._t)("Feedback"),
      type: "text",
      autoComplete: "off",
      value: comment,
      element: "textarea",
      onChange: ev => {
        setComment(ev.target.value);
      },
      ref: feedbackRef
    }), /*#__PURE__*/_react.default.createElement(_StyledCheckbox.default, {
      checked: canContact,
      onChange: toggleCanContact
    }, (0, _languageHandler._t)("You may contact me if you want to follow up or to let me test out upcoming ideas")));
  }

  let bugReports = null;

  if (rageshakeUrl) {
    bugReports = /*#__PURE__*/_react.default.createElement("p", {
      className: "mx_FeedbackDialog_section_microcopy"
    }, (0, _languageHandler._t)("PRO TIP: If you start a bug, please submit <debugLogsLink>debug logs</debugLogsLink> " + "to help us track down the problem.", {}, {
      debugLogsLink: sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "link_inline",
        onClick: onDebugLogsLinkClick
      }, sub)
    }));
  }

  return /*#__PURE__*/_react.default.createElement(_QuestionDialog.default, {
    className: "mx_FeedbackDialog",
    hasCancelButton: !!hasFeedback,
    title: (0, _languageHandler._t)("Feedback"),
    description: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_FeedbackDialog_section mx_FeedbackDialog_reportBug"
    }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Report a bug")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Please view <existingIssuesLink>existing bugs on Github</existingIssuesLink> first. " + "No match? <newIssueLink>Start a new one</newIssueLink>.", {}, {
      existingIssuesLink: sub => {
        return /*#__PURE__*/_react.default.createElement("a", {
          target: "_blank",
          rel: "noreferrer noopener",
          href: existingIssuesUrl
        }, sub);
      },
      newIssueLink: sub => {
        return /*#__PURE__*/_react.default.createElement("a", {
          target: "_blank",
          rel: "noreferrer noopener",
          href: newIssueUrl
        }, sub);
      }
    })), bugReports), feedbackSection),
    button: hasFeedback ? (0, _languageHandler._t)("Send feedback") : (0, _languageHandler._t)("Go back"),
    buttonDisabled: hasFeedback && !comment,
    onFinished: onFinished
  });
};

var _default = FeedbackDialog;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJleGlzdGluZ0lzc3Vlc1VybCIsIm5ld0lzc3VlVXJsIiwiRmVlZGJhY2tEaWFsb2ciLCJwcm9wcyIsImZlZWRiYWNrUmVmIiwidXNlUmVmIiwiY29tbWVudCIsInNldENvbW1lbnQiLCJ1c2VTdGF0ZSIsImNhbkNvbnRhY3QiLCJ0b2dnbGVDYW5Db250YWN0IiwidXNlU3RhdGVUb2dnbGUiLCJ1c2VFZmZlY3QiLCJjdXJyZW50IiwiZm9jdXMiLCJvbkRlYnVnTG9nc0xpbmtDbGljayIsIm9uRmluaXNoZWQiLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIkJ1Z1JlcG9ydERpYWxvZyIsInJhZ2VzaGFrZVVybCIsIlNka0NvbmZpZyIsImdldCIsImJ1Z19yZXBvcnRfZW5kcG9pbnRfdXJsIiwiaGFzRmVlZGJhY2siLCJzZW5kRmVlZGJhY2siLCJsYWJlbCIsImZlYXR1cmUiLCJzdWJtaXRGZWVkYmFjayIsIkluZm9EaWFsb2ciLCJ0aXRsZSIsIl90IiwiZGVzY3JpcHRpb24iLCJmZWVkYmFja1NlY3Rpb24iLCJldiIsInRhcmdldCIsInZhbHVlIiwiYnVnUmVwb3J0cyIsImRlYnVnTG9nc0xpbmsiLCJzdWIiLCJleGlzdGluZ0lzc3Vlc0xpbmsiLCJuZXdJc3N1ZUxpbmsiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL0ZlZWRiYWNrRGlhbG9nLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTggTmV3IFZlY3RvciBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgUXVlc3Rpb25EaWFsb2cgZnJvbSAnLi9RdWVzdGlvbkRpYWxvZyc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgRmllbGQgZnJvbSBcIi4uL2VsZW1lbnRzL0ZpZWxkXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tIFwiLi4vLi4vLi4vU2RrQ29uZmlnXCI7XG5pbXBvcnQgTW9kYWwgZnJvbSBcIi4uLy4uLy4uL01vZGFsXCI7XG5pbXBvcnQgQnVnUmVwb3J0RGlhbG9nIGZyb20gXCIuL0J1Z1JlcG9ydERpYWxvZ1wiO1xuaW1wb3J0IEluZm9EaWFsb2cgZnJvbSBcIi4vSW5mb0RpYWxvZ1wiO1xuaW1wb3J0IHsgSURpYWxvZ1Byb3BzIH0gZnJvbSBcIi4vSURpYWxvZ1Byb3BzXCI7XG5pbXBvcnQgeyBzdWJtaXRGZWVkYmFjayB9IGZyb20gXCIuLi8uLi8uLi9yYWdlc2hha2Uvc3VibWl0LXJhZ2VzaGFrZVwiO1xuaW1wb3J0IHsgdXNlU3RhdGVUb2dnbGUgfSBmcm9tIFwiLi4vLi4vLi4vaG9va3MvdXNlU3RhdGVUb2dnbGVcIjtcbmltcG9ydCBTdHlsZWRDaGVja2JveCBmcm9tIFwiLi4vZWxlbWVudHMvU3R5bGVkQ2hlY2tib3hcIjtcblxuY29uc3QgZXhpc3RpbmdJc3N1ZXNVcmwgPSBcImh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzXCIgK1xuICAgIFwiP3E9aXMlM0FvcGVuK2lzJTNBaXNzdWUrc29ydCUzQXJlYWN0aW9ucy0lMkIxLWRlc2NcIjtcbmNvbnN0IG5ld0lzc3VlVXJsID0gXCJodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy9uZXcvY2hvb3NlXCI7XG5cbmludGVyZmFjZSBJUHJvcHMgZXh0ZW5kcyBJRGlhbG9nUHJvcHMge1xuICAgIGZlYXR1cmU/OiBzdHJpbmc7XG59XG5cbmNvbnN0IEZlZWRiYWNrRGlhbG9nOiBSZWFjdC5GQzxJUHJvcHM+ID0gKHByb3BzOiBJUHJvcHMpID0+IHtcbiAgICBjb25zdCBmZWVkYmFja1JlZiA9IHVzZVJlZjxGaWVsZD4oKTtcbiAgICBjb25zdCBbY29tbWVudCwgc2V0Q29tbWVudF0gPSB1c2VTdGF0ZTxzdHJpbmc+KFwiXCIpO1xuICAgIGNvbnN0IFtjYW5Db250YWN0LCB0b2dnbGVDYW5Db250YWN0XSA9IHVzZVN0YXRlVG9nZ2xlKGZhbHNlKTtcblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIC8vIGF1dG9mb2N1cyBkb2Vzbid0IHdvcmsgb24gdGV4dGFyZWFzXG4gICAgICAgIGZlZWRiYWNrUmVmLmN1cnJlbnQ/LmZvY3VzKCk7XG4gICAgfSwgW10pO1xuXG4gICAgY29uc3Qgb25EZWJ1Z0xvZ3NMaW5rQ2xpY2sgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHByb3BzLm9uRmluaXNoZWQoKTtcbiAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEJ1Z1JlcG9ydERpYWxvZywge30pO1xuICAgIH07XG5cbiAgICBjb25zdCByYWdlc2hha2VVcmwgPSBTZGtDb25maWcuZ2V0KCkuYnVnX3JlcG9ydF9lbmRwb2ludF91cmw7XG4gICAgY29uc3QgaGFzRmVlZGJhY2sgPSAhIXJhZ2VzaGFrZVVybDtcbiAgICBjb25zdCBvbkZpbmlzaGVkID0gKHNlbmRGZWVkYmFjazogYm9vbGVhbik6IHZvaWQgPT4ge1xuICAgICAgICBpZiAoaGFzRmVlZGJhY2sgJiYgc2VuZEZlZWRiYWNrKSB7XG4gICAgICAgICAgICBpZiAocmFnZXNoYWtlVXJsKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGFiZWwgPSBwcm9wcy5mZWF0dXJlID8gYCR7cHJvcHMuZmVhdHVyZX0tZmVlZGJhY2tgIDogXCJmZWVkYmFja1wiO1xuICAgICAgICAgICAgICAgIHN1Ym1pdEZlZWRiYWNrKHJhZ2VzaGFrZVVybCwgbGFiZWwsIGNvbW1lbnQsIGNhbkNvbnRhY3QpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coSW5mb0RpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnRmVlZGJhY2sgc2VudCcpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdCgnVGhhbmsgeW91IScpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcHJvcHMub25GaW5pc2hlZCgpO1xuICAgIH07XG5cbiAgICBsZXQgZmVlZGJhY2tTZWN0aW9uO1xuICAgIGlmIChyYWdlc2hha2VVcmwpIHtcbiAgICAgICAgZmVlZGJhY2tTZWN0aW9uID0gPGRpdiBjbGFzc05hbWU9XCJteF9GZWVkYmFja0RpYWxvZ19zZWN0aW9uIG14X0ZlZWRiYWNrRGlhbG9nX3JhdGVBcHBcIj5cbiAgICAgICAgICAgIDxoMz57IF90KFwiQ29tbWVudFwiKSB9PC9oMz5cblxuICAgICAgICAgICAgPHA+eyBfdChcIllvdXIgcGxhdGZvcm0gYW5kIHVzZXJuYW1lIHdpbGwgYmUgbm90ZWQgdG8gaGVscCB1cyB1c2UgeW91ciBmZWVkYmFjayBhcyBtdWNoIGFzIHdlIGNhbi5cIikgfTwvcD5cblxuICAgICAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICAgICAgaWQ9XCJmZWVkYmFja0NvbW1lbnRcIlxuICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkZlZWRiYWNrXCIpfVxuICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJvZmZcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtjb21tZW50fVxuICAgICAgICAgICAgICAgIGVsZW1lbnQ9XCJ0ZXh0YXJlYVwiXG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhldikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzZXRDb21tZW50KGV2LnRhcmdldC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICByZWY9e2ZlZWRiYWNrUmVmfVxuICAgICAgICAgICAgLz5cblxuICAgICAgICAgICAgPFN0eWxlZENoZWNrYm94XG4gICAgICAgICAgICAgICAgY2hlY2tlZD17Y2FuQ29udGFjdH1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17dG9nZ2xlQ2FuQ29udGFjdH1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IF90KFwiWW91IG1heSBjb250YWN0IG1lIGlmIHlvdSB3YW50IHRvIGZvbGxvdyB1cCBvciB0byBsZXQgbWUgdGVzdCBvdXQgdXBjb21pbmcgaWRlYXNcIikgfVxuICAgICAgICAgICAgPC9TdHlsZWRDaGVja2JveD5cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cblxuICAgIGxldCBidWdSZXBvcnRzID0gbnVsbDtcbiAgICBpZiAocmFnZXNoYWtlVXJsKSB7XG4gICAgICAgIGJ1Z1JlcG9ydHMgPSAoXG4gICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJteF9GZWVkYmFja0RpYWxvZ19zZWN0aW9uX21pY3JvY29weVwiPntcbiAgICAgICAgICAgICAgICBfdChcIlBSTyBUSVA6IElmIHlvdSBzdGFydCBhIGJ1ZywgcGxlYXNlIHN1Ym1pdCA8ZGVidWdMb2dzTGluaz5kZWJ1ZyBsb2dzPC9kZWJ1Z0xvZ3NMaW5rPiBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwidG8gaGVscCB1cyB0cmFjayBkb3duIHRoZSBwcm9ibGVtLlwiLCB7fSwge1xuICAgICAgICAgICAgICAgICAgICBkZWJ1Z0xvZ3NMaW5rOiBzdWIgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD1cImxpbmtfaW5saW5lXCIgb25DbGljaz17b25EZWJ1Z0xvZ3NMaW5rQ2xpY2t9Pnsgc3ViIH08L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH08L3A+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuICg8UXVlc3Rpb25EaWFsb2dcbiAgICAgICAgY2xhc3NOYW1lPVwibXhfRmVlZGJhY2tEaWFsb2dcIlxuICAgICAgICBoYXNDYW5jZWxCdXR0b249eyEhaGFzRmVlZGJhY2t9XG4gICAgICAgIHRpdGxlPXtfdChcIkZlZWRiYWNrXCIpfVxuICAgICAgICBkZXNjcmlwdGlvbj17PFJlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9GZWVkYmFja0RpYWxvZ19zZWN0aW9uIG14X0ZlZWRiYWNrRGlhbG9nX3JlcG9ydEJ1Z1wiPlxuICAgICAgICAgICAgICAgIDxoMz57IF90KFwiUmVwb3J0IGEgYnVnXCIpIH08L2gzPlxuICAgICAgICAgICAgICAgIDxwPntcbiAgICAgICAgICAgICAgICAgICAgX3QoXCJQbGVhc2UgdmlldyA8ZXhpc3RpbmdJc3N1ZXNMaW5rPmV4aXN0aW5nIGJ1Z3Mgb24gR2l0aHViPC9leGlzdGluZ0lzc3Vlc0xpbms+IGZpcnN0LiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcIk5vIG1hdGNoPyA8bmV3SXNzdWVMaW5rPlN0YXJ0IGEgbmV3IG9uZTwvbmV3SXNzdWVMaW5rPi5cIiwge30sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nSXNzdWVzTGluazogKHN1YikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiA8YSB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCIgaHJlZj17ZXhpc3RpbmdJc3N1ZXNVcmx9Pnsgc3ViIH08L2E+O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0lzc3VlTGluazogKHN1YikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiA8YSB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCIgaHJlZj17bmV3SXNzdWVVcmx9Pnsgc3ViIH08L2E+O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9PC9wPlxuICAgICAgICAgICAgICAgIHsgYnVnUmVwb3J0cyB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIHsgZmVlZGJhY2tTZWN0aW9uIH1cbiAgICAgICAgPC9SZWFjdC5GcmFnbWVudD59XG4gICAgICAgIGJ1dHRvbj17aGFzRmVlZGJhY2sgPyBfdChcIlNlbmQgZmVlZGJhY2tcIikgOiBfdChcIkdvIGJhY2tcIil9XG4gICAgICAgIGJ1dHRvbkRpc2FibGVkPXtoYXNGZWVkYmFjayAmJiAhY29tbWVudH1cbiAgICAgICAgb25GaW5pc2hlZD17b25GaW5pc2hlZH1cbiAgICAvPik7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBGZWVkYmFja0RpYWxvZztcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JB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