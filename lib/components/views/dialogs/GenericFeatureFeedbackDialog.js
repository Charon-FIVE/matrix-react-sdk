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

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _submitRageshake = require("../../../rageshake/submit-rageshake");

var _StyledCheckbox = _interopRequireDefault(require("../elements/StyledCheckbox"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _InfoDialog = _interopRequireDefault(require("./InfoDialog"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2021 The Matrix.org Foundation C.I.C.

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
const GenericFeatureFeedbackDialog = _ref => {
  let {
    title,
    subheading,
    children,
    rageshakeLabel,
    rageshakeData = {},
    onFinished
  } = _ref;
  const [comment, setComment] = (0, _react.useState)("");
  const [canContact, setCanContact] = (0, _react.useState)(false);

  const sendFeedback = async ok => {
    if (!ok) return onFinished(false);
    (0, _submitRageshake.submitFeedback)(_SdkConfig.default.get().bug_report_endpoint_url, rageshakeLabel, comment, canContact, rageshakeData);
    onFinished(true);

    _Modal.default.createDialog(_InfoDialog.default, {
      title,
      description: (0, _languageHandler._t)("Feedback sent! Thanks, we appreciate it!"),
      button: (0, _languageHandler._t)("Close"),
      hasCloseButton: false,
      fixedWidth: false
    });
  };

  return /*#__PURE__*/_react.default.createElement(_QuestionDialog.default, {
    className: "mx_GenericFeatureFeedbackDialog",
    hasCancelButton: true,
    title: title,
    description: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_GenericFeatureFeedbackDialog_subheading"
    }, subheading, "\xA0", (0, _languageHandler._t)("Your platform and username will be noted to help us use your feedback as much as we can."), "\xA0", children), /*#__PURE__*/_react.default.createElement(_Field.default, {
      id: "feedbackComment",
      label: (0, _languageHandler._t)("Feedback"),
      type: "text",
      autoComplete: "off",
      value: comment,
      element: "textarea",
      onChange: ev => {
        setComment(ev.target.value);
      },
      autoFocus: true
    }), /*#__PURE__*/_react.default.createElement(_StyledCheckbox.default, {
      checked: canContact,
      onChange: e => setCanContact(e.target.checked)
    }, (0, _languageHandler._t)("You may contact me if you have any follow up questions"))),
    button: (0, _languageHandler._t)("Send feedback"),
    buttonDisabled: !comment,
    onFinished: sendFeedback
  });
};

var _default = GenericFeatureFeedbackDialog;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJHZW5lcmljRmVhdHVyZUZlZWRiYWNrRGlhbG9nIiwidGl0bGUiLCJzdWJoZWFkaW5nIiwiY2hpbGRyZW4iLCJyYWdlc2hha2VMYWJlbCIsInJhZ2VzaGFrZURhdGEiLCJvbkZpbmlzaGVkIiwiY29tbWVudCIsInNldENvbW1lbnQiLCJ1c2VTdGF0ZSIsImNhbkNvbnRhY3QiLCJzZXRDYW5Db250YWN0Iiwic2VuZEZlZWRiYWNrIiwib2siLCJzdWJtaXRGZWVkYmFjayIsIlNka0NvbmZpZyIsImdldCIsImJ1Z19yZXBvcnRfZW5kcG9pbnRfdXJsIiwiTW9kYWwiLCJjcmVhdGVEaWFsb2ciLCJJbmZvRGlhbG9nIiwiZGVzY3JpcHRpb24iLCJfdCIsImJ1dHRvbiIsImhhc0Nsb3NlQnV0dG9uIiwiZml4ZWRXaWR0aCIsImV2IiwidGFyZ2V0IiwidmFsdWUiLCJlIiwiY2hlY2tlZCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvR2VuZXJpY0ZlYXR1cmVGZWVkYmFja0RpYWxvZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCBRdWVzdGlvbkRpYWxvZyBmcm9tICcuL1F1ZXN0aW9uRGlhbG9nJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBGaWVsZCBmcm9tIFwiLi4vZWxlbWVudHMvRmllbGRcIjtcbmltcG9ydCBTZGtDb25maWcgZnJvbSBcIi4uLy4uLy4uL1Nka0NvbmZpZ1wiO1xuaW1wb3J0IHsgSURpYWxvZ1Byb3BzIH0gZnJvbSBcIi4vSURpYWxvZ1Byb3BzXCI7XG5pbXBvcnQgeyBzdWJtaXRGZWVkYmFjayB9IGZyb20gXCIuLi8uLi8uLi9yYWdlc2hha2Uvc3VibWl0LXJhZ2VzaGFrZVwiO1xuaW1wb3J0IFN0eWxlZENoZWNrYm94IGZyb20gXCIuLi9lbGVtZW50cy9TdHlsZWRDaGVja2JveFwiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IEluZm9EaWFsb2cgZnJvbSBcIi4vSW5mb0RpYWxvZ1wiO1xuXG5pbnRlcmZhY2UgSVByb3BzIGV4dGVuZHMgSURpYWxvZ1Byb3BzIHtcbiAgICB0aXRsZTogc3RyaW5nO1xuICAgIHN1YmhlYWRpbmc6IHN0cmluZztcbiAgICByYWdlc2hha2VMYWJlbDogc3RyaW5nO1xuICAgIHJhZ2VzaGFrZURhdGE/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xufVxuXG5jb25zdCBHZW5lcmljRmVhdHVyZUZlZWRiYWNrRGlhbG9nOiBSZWFjdC5GQzxJUHJvcHM+ID0gKHtcbiAgICB0aXRsZSxcbiAgICBzdWJoZWFkaW5nLFxuICAgIGNoaWxkcmVuLFxuICAgIHJhZ2VzaGFrZUxhYmVsLFxuICAgIHJhZ2VzaGFrZURhdGEgPSB7fSxcbiAgICBvbkZpbmlzaGVkLFxufSkgPT4ge1xuICAgIGNvbnN0IFtjb21tZW50LCBzZXRDb21tZW50XSA9IHVzZVN0YXRlKFwiXCIpO1xuICAgIGNvbnN0IFtjYW5Db250YWN0LCBzZXRDYW5Db250YWN0XSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICAgIGNvbnN0IHNlbmRGZWVkYmFjayA9IGFzeW5jIChvazogYm9vbGVhbikgPT4ge1xuICAgICAgICBpZiAoIW9rKSByZXR1cm4gb25GaW5pc2hlZChmYWxzZSk7XG5cbiAgICAgICAgc3VibWl0RmVlZGJhY2soU2RrQ29uZmlnLmdldCgpLmJ1Z19yZXBvcnRfZW5kcG9pbnRfdXJsLCByYWdlc2hha2VMYWJlbCwgY29tbWVudCwgY2FuQ29udGFjdCwgcmFnZXNoYWtlRGF0YSk7XG4gICAgICAgIG9uRmluaXNoZWQodHJ1ZSk7XG5cbiAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEluZm9EaWFsb2csIHtcbiAgICAgICAgICAgIHRpdGxlLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFwiRmVlZGJhY2sgc2VudCEgVGhhbmtzLCB3ZSBhcHByZWNpYXRlIGl0IVwiKSxcbiAgICAgICAgICAgIGJ1dHRvbjogX3QoXCJDbG9zZVwiKSxcbiAgICAgICAgICAgIGhhc0Nsb3NlQnV0dG9uOiBmYWxzZSxcbiAgICAgICAgICAgIGZpeGVkV2lkdGg6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuICg8UXVlc3Rpb25EaWFsb2dcbiAgICAgICAgY2xhc3NOYW1lPVwibXhfR2VuZXJpY0ZlYXR1cmVGZWVkYmFja0RpYWxvZ1wiXG4gICAgICAgIGhhc0NhbmNlbEJ1dHRvbj17dHJ1ZX1cbiAgICAgICAgdGl0bGU9e3RpdGxlfVxuICAgICAgICBkZXNjcmlwdGlvbj17PFJlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9HZW5lcmljRmVhdHVyZUZlZWRiYWNrRGlhbG9nX3N1YmhlYWRpbmdcIj5cbiAgICAgICAgICAgICAgICB7IHN1YmhlYWRpbmcgfVxuICAgICAgICAgICAgICAgICZuYnNwO1xuICAgICAgICAgICAgICAgIHsgX3QoXCJZb3VyIHBsYXRmb3JtIGFuZCB1c2VybmFtZSB3aWxsIGJlIG5vdGVkIHRvIGhlbHAgdXMgdXNlIHlvdXIgZmVlZGJhY2sgYXMgbXVjaCBhcyB3ZSBjYW4uXCIpIH1cbiAgICAgICAgICAgICAgICAmbmJzcDtcbiAgICAgICAgICAgICAgICB7IGNoaWxkcmVuIH1cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICBpZD1cImZlZWRiYWNrQ29tbWVudFwiXG4gICAgICAgICAgICAgICAgbGFiZWw9e190KFwiRmVlZGJhY2tcIil9XG4gICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZT1cIm9mZlwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e2NvbW1lbnR9XG4gICAgICAgICAgICAgICAgZWxlbWVudD1cInRleHRhcmVhXCJcbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGV2KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNldENvbW1lbnQoZXYudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIGF1dG9Gb2N1cz17dHJ1ZX1cbiAgICAgICAgICAgIC8+XG5cbiAgICAgICAgICAgIDxTdHlsZWRDaGVja2JveFxuICAgICAgICAgICAgICAgIGNoZWNrZWQ9e2NhbkNvbnRhY3R9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9e2UgPT4gc2V0Q2FuQ29udGFjdCgoZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudCkuY2hlY2tlZCl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyBfdChcIllvdSBtYXkgY29udGFjdCBtZSBpZiB5b3UgaGF2ZSBhbnkgZm9sbG93IHVwIHF1ZXN0aW9uc1wiKSB9XG4gICAgICAgICAgICA8L1N0eWxlZENoZWNrYm94PlxuICAgICAgICA8L1JlYWN0LkZyYWdtZW50Pn1cbiAgICAgICAgYnV0dG9uPXtfdChcIlNlbmQgZmVlZGJhY2tcIil9XG4gICAgICAgIGJ1dHRvbkRpc2FibGVkPXshY29tbWVudH1cbiAgICAgICAgb25GaW5pc2hlZD17c2VuZEZlZWRiYWNrfVxuICAgIC8+KTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEdlbmVyaWNGZWF0dXJlRmVlZGJhY2tEaWFsb2c7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWdCQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXFCQSxNQUFNQSw0QkFBOEMsR0FBRyxRQU9qRDtFQUFBLElBUGtEO0lBQ3BEQyxLQURvRDtJQUVwREMsVUFGb0Q7SUFHcERDLFFBSG9EO0lBSXBEQyxjQUpvRDtJQUtwREMsYUFBYSxHQUFHLEVBTG9DO0lBTXBEQztFQU5vRCxDQU9sRDtFQUNGLE1BQU0sQ0FBQ0MsT0FBRCxFQUFVQyxVQUFWLElBQXdCLElBQUFDLGVBQUEsRUFBUyxFQUFULENBQTlCO0VBQ0EsTUFBTSxDQUFDQyxVQUFELEVBQWFDLGFBQWIsSUFBOEIsSUFBQUYsZUFBQSxFQUFTLEtBQVQsQ0FBcEM7O0VBRUEsTUFBTUcsWUFBWSxHQUFHLE1BQU9DLEVBQVAsSUFBdUI7SUFDeEMsSUFBSSxDQUFDQSxFQUFMLEVBQVMsT0FBT1AsVUFBVSxDQUFDLEtBQUQsQ0FBakI7SUFFVCxJQUFBUSwrQkFBQSxFQUFlQyxrQkFBQSxDQUFVQyxHQUFWLEdBQWdCQyx1QkFBL0IsRUFBd0RiLGNBQXhELEVBQXdFRyxPQUF4RSxFQUFpRkcsVUFBakYsRUFBNkZMLGFBQTdGO0lBQ0FDLFVBQVUsQ0FBQyxJQUFELENBQVY7O0lBRUFZLGNBQUEsQ0FBTUMsWUFBTixDQUFtQkMsbUJBQW5CLEVBQStCO01BQzNCbkIsS0FEMkI7TUFFM0JvQixXQUFXLEVBQUUsSUFBQUMsbUJBQUEsRUFBRywwQ0FBSCxDQUZjO01BRzNCQyxNQUFNLEVBQUUsSUFBQUQsbUJBQUEsRUFBRyxPQUFILENBSG1CO01BSTNCRSxjQUFjLEVBQUUsS0FKVztNQUszQkMsVUFBVSxFQUFFO0lBTGUsQ0FBL0I7RUFPSCxDQWJEOztFQWVBLG9CQUFRLDZCQUFDLHVCQUFEO0lBQ0osU0FBUyxFQUFDLGlDQUROO0lBRUosZUFBZSxFQUFFLElBRmI7SUFHSixLQUFLLEVBQUV4QixLQUhIO0lBSUosV0FBVyxlQUFFLDZCQUFDLGNBQUQsQ0FBTyxRQUFQLHFCQUNUO01BQUssU0FBUyxFQUFDO0lBQWYsR0FDTUMsVUFETixVQUdNLElBQUFvQixtQkFBQSxFQUFHLDBGQUFILENBSE4sVUFLTW5CLFFBTE4sQ0FEUyxlQVNULDZCQUFDLGNBQUQ7TUFDSSxFQUFFLEVBQUMsaUJBRFA7TUFFSSxLQUFLLEVBQUUsSUFBQW1CLG1CQUFBLEVBQUcsVUFBSCxDQUZYO01BR0ksSUFBSSxFQUFDLE1BSFQ7TUFJSSxZQUFZLEVBQUMsS0FKakI7TUFLSSxLQUFLLEVBQUVmLE9BTFg7TUFNSSxPQUFPLEVBQUMsVUFOWjtNQU9JLFFBQVEsRUFBR21CLEVBQUQsSUFBUTtRQUNkbEIsVUFBVSxDQUFDa0IsRUFBRSxDQUFDQyxNQUFILENBQVVDLEtBQVgsQ0FBVjtNQUNILENBVEw7TUFVSSxTQUFTLEVBQUU7SUFWZixFQVRTLGVBc0JULDZCQUFDLHVCQUFEO01BQ0ksT0FBTyxFQUFFbEIsVUFEYjtNQUVJLFFBQVEsRUFBRW1CLENBQUMsSUFBSWxCLGFBQWEsQ0FBRWtCLENBQUMsQ0FBQ0YsTUFBSCxDQUErQkcsT0FBaEM7SUFGaEMsR0FJTSxJQUFBUixtQkFBQSxFQUFHLHdEQUFILENBSk4sQ0F0QlMsQ0FKVDtJQWlDSixNQUFNLEVBQUUsSUFBQUEsbUJBQUEsRUFBRyxlQUFILENBakNKO0lBa0NKLGNBQWMsRUFBRSxDQUFDZixPQWxDYjtJQW1DSixVQUFVLEVBQUVLO0VBbkNSLEVBQVI7QUFxQ0gsQ0EvREQ7O2VBaUVlWiw0QiJ9