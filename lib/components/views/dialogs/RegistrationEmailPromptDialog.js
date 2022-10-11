"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

var _languageHandler = require("../../../languageHandler");

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _DialogButtons = _interopRequireDefault(require("../elements/DialogButtons"));

var _EmailField = _interopRequireDefault(require("../auth/EmailField"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2020 The Matrix.org Foundation C.I.C.

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
const RegistrationEmailPromptDialog = _ref => {
  let {
    onFinished
  } = _ref;
  const [email, setEmail] = (0, React.useState)("");
  const fieldRef = (0, React.useRef)();

  const onSubmit = async e => {
    e.preventDefault();

    if (email) {
      const valid = await fieldRef.current.validate({});

      if (!valid) {
        fieldRef.current.focus();
        fieldRef.current.validate({
          focused: true
        });
        return;
      }
    }

    onFinished(true, email);
  };

  return /*#__PURE__*/React.createElement(_BaseDialog.default, {
    title: (0, _languageHandler._t)("Continuing without email"),
    className: "mx_RegistrationEmailPromptDialog",
    contentId: "mx_RegistrationEmailPromptDialog",
    onFinished: () => onFinished(false),
    fixedWidth: false
  }, /*#__PURE__*/React.createElement("div", {
    className: "mx_Dialog_content",
    id: "mx_RegistrationEmailPromptDialog"
  }, /*#__PURE__*/React.createElement("p", null, (0, _languageHandler._t)("Just a heads up, if you don't add an email and forget your password, you could " + "<b>permanently lose access to your account</b>.", {}, {
    b: sub => /*#__PURE__*/React.createElement("b", null, sub)
  })), /*#__PURE__*/React.createElement("form", {
    onSubmit: onSubmit
  }, /*#__PURE__*/React.createElement(_EmailField.default, {
    fieldRef: fieldRef,
    autoFocus: true,
    label: (0, _languageHandler._td)("Email (optional)"),
    value: email,
    onChange: ev => {
      const target = ev.target;
      setEmail(target.value);
    }
  }))), /*#__PURE__*/React.createElement(_DialogButtons.default, {
    primaryButton: (0, _languageHandler._t)("Continue"),
    onPrimaryButtonClick: onSubmit,
    hasCancel: false
  }));
};

var _default = RegistrationEmailPromptDialog;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWdpc3RyYXRpb25FbWFpbFByb21wdERpYWxvZyIsIm9uRmluaXNoZWQiLCJlbWFpbCIsInNldEVtYWlsIiwidXNlU3RhdGUiLCJmaWVsZFJlZiIsInVzZVJlZiIsIm9uU3VibWl0IiwiZSIsInByZXZlbnREZWZhdWx0IiwidmFsaWQiLCJjdXJyZW50IiwidmFsaWRhdGUiLCJmb2N1cyIsImZvY3VzZWQiLCJfdCIsImIiLCJzdWIiLCJfdGQiLCJldiIsInRhcmdldCIsInZhbHVlIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9SZWdpc3RyYXRpb25FbWFpbFByb21wdERpYWxvZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCB7IF90LCBfdGQgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHsgSURpYWxvZ1Byb3BzIH0gZnJvbSBcIi4vSURpYWxvZ1Byb3BzXCI7XG5pbXBvcnQgRmllbGQgZnJvbSBcIi4uL2VsZW1lbnRzL0ZpZWxkXCI7XG5pbXBvcnQgQmFzZURpYWxvZyBmcm9tIFwiLi9CYXNlRGlhbG9nXCI7XG5pbXBvcnQgRGlhbG9nQnV0dG9ucyBmcm9tIFwiLi4vZWxlbWVudHMvRGlhbG9nQnV0dG9uc1wiO1xuaW1wb3J0IEVtYWlsRmllbGQgZnJvbSBcIi4uL2F1dGgvRW1haWxGaWVsZFwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIGV4dGVuZHMgSURpYWxvZ1Byb3BzIHtcbiAgICBvbkZpbmlzaGVkKGNvbnRpbnVlZDogYm9vbGVhbiwgZW1haWw/OiBzdHJpbmcpOiB2b2lkO1xufVxuXG5jb25zdCBSZWdpc3RyYXRpb25FbWFpbFByb21wdERpYWxvZzogUmVhY3QuRkM8SVByb3BzPiA9ICh7IG9uRmluaXNoZWQgfSkgPT4ge1xuICAgIGNvbnN0IFtlbWFpbCwgc2V0RW1haWxdID0gdXNlU3RhdGUoXCJcIik7XG4gICAgY29uc3QgZmllbGRSZWYgPSB1c2VSZWY8RmllbGQ+KCk7XG5cbiAgICBjb25zdCBvblN1Ym1pdCA9IGFzeW5jIChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaWYgKGVtYWlsKSB7XG4gICAgICAgICAgICBjb25zdCB2YWxpZCA9IGF3YWl0IGZpZWxkUmVmLmN1cnJlbnQudmFsaWRhdGUoe30pO1xuXG4gICAgICAgICAgICBpZiAoIXZhbGlkKSB7XG4gICAgICAgICAgICAgICAgZmllbGRSZWYuY3VycmVudC5mb2N1cygpO1xuICAgICAgICAgICAgICAgIGZpZWxkUmVmLmN1cnJlbnQudmFsaWRhdGUoeyBmb2N1c2VkOiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIG9uRmluaXNoZWQodHJ1ZSwgZW1haWwpO1xuICAgIH07XG5cbiAgICByZXR1cm4gPEJhc2VEaWFsb2dcbiAgICAgICAgdGl0bGU9e190KFwiQ29udGludWluZyB3aXRob3V0IGVtYWlsXCIpfVxuICAgICAgICBjbGFzc05hbWU9XCJteF9SZWdpc3RyYXRpb25FbWFpbFByb21wdERpYWxvZ1wiXG4gICAgICAgIGNvbnRlbnRJZD1cIm14X1JlZ2lzdHJhdGlvbkVtYWlsUHJvbXB0RGlhbG9nXCJcbiAgICAgICAgb25GaW5pc2hlZD17KCkgPT4gb25GaW5pc2hlZChmYWxzZSl9XG4gICAgICAgIGZpeGVkV2lkdGg9e2ZhbHNlfVxuICAgID5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfY29udGVudFwiIGlkPVwibXhfUmVnaXN0cmF0aW9uRW1haWxQcm9tcHREaWFsb2dcIj5cbiAgICAgICAgICAgIDxwPnsgX3QoXCJKdXN0IGEgaGVhZHMgdXAsIGlmIHlvdSBkb24ndCBhZGQgYW4gZW1haWwgYW5kIGZvcmdldCB5b3VyIHBhc3N3b3JkLCB5b3UgY291bGQgXCIgK1xuICAgICAgICAgICAgICAgIFwiPGI+cGVybWFuZW50bHkgbG9zZSBhY2Nlc3MgdG8geW91ciBhY2NvdW50PC9iPi5cIiwge30sIHtcbiAgICAgICAgICAgICAgICBiOiBzdWIgPT4gPGI+eyBzdWIgfTwvYj4sXG4gICAgICAgICAgICB9KSB9PC9wPlxuICAgICAgICAgICAgPGZvcm0gb25TdWJtaXQ9e29uU3VibWl0fT5cbiAgICAgICAgICAgICAgICA8RW1haWxGaWVsZFxuICAgICAgICAgICAgICAgICAgICBmaWVsZFJlZj17ZmllbGRSZWZ9XG4gICAgICAgICAgICAgICAgICAgIGF1dG9Gb2N1cz17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190ZChcIkVtYWlsIChvcHRpb25hbClcIil9XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXtlbWFpbH1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e2V2ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGV2LnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0RW1haWwodGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPERpYWxvZ0J1dHRvbnNcbiAgICAgICAgICAgIHByaW1hcnlCdXR0b249e190KFwiQ29udGludWVcIil9XG4gICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17b25TdWJtaXR9XG4gICAgICAgICAgICBoYXNDYW5jZWw9e2ZhbHNlfVxuICAgICAgICAvPlxuICAgIDwvQmFzZURpYWxvZz47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBSZWdpc3RyYXRpb25FbWFpbFByb21wdERpYWxvZztcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUdBOztBQUdBOztBQUNBOztBQUNBOzs7Ozs7QUF4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBZ0JBLE1BQU1BLDZCQUErQyxHQUFHLFFBQW9CO0VBQUEsSUFBbkI7SUFBRUM7RUFBRixDQUFtQjtFQUN4RSxNQUFNLENBQUNDLEtBQUQsRUFBUUMsUUFBUixJQUFvQixJQUFBQyxjQUFBLEVBQVMsRUFBVCxDQUExQjtFQUNBLE1BQU1DLFFBQVEsR0FBRyxJQUFBQyxZQUFBLEdBQWpCOztFQUVBLE1BQU1DLFFBQVEsR0FBRyxNQUFPQyxDQUFQLElBQWE7SUFDMUJBLENBQUMsQ0FBQ0MsY0FBRjs7SUFDQSxJQUFJUCxLQUFKLEVBQVc7TUFDUCxNQUFNUSxLQUFLLEdBQUcsTUFBTUwsUUFBUSxDQUFDTSxPQUFULENBQWlCQyxRQUFqQixDQUEwQixFQUExQixDQUFwQjs7TUFFQSxJQUFJLENBQUNGLEtBQUwsRUFBWTtRQUNSTCxRQUFRLENBQUNNLE9BQVQsQ0FBaUJFLEtBQWpCO1FBQ0FSLFFBQVEsQ0FBQ00sT0FBVCxDQUFpQkMsUUFBakIsQ0FBMEI7VUFBRUUsT0FBTyxFQUFFO1FBQVgsQ0FBMUI7UUFDQTtNQUNIO0lBQ0o7O0lBRURiLFVBQVUsQ0FBQyxJQUFELEVBQU9DLEtBQVAsQ0FBVjtFQUNILENBYkQ7O0VBZUEsb0JBQU8sb0JBQUMsbUJBQUQ7SUFDSCxLQUFLLEVBQUUsSUFBQWEsbUJBQUEsRUFBRywwQkFBSCxDQURKO0lBRUgsU0FBUyxFQUFDLGtDQUZQO0lBR0gsU0FBUyxFQUFDLGtDQUhQO0lBSUgsVUFBVSxFQUFFLE1BQU1kLFVBQVUsQ0FBQyxLQUFELENBSnpCO0lBS0gsVUFBVSxFQUFFO0VBTFQsZ0JBT0g7SUFBSyxTQUFTLEVBQUMsbUJBQWY7SUFBbUMsRUFBRSxFQUFDO0VBQXRDLGdCQUNJLCtCQUFLLElBQUFjLG1CQUFBLEVBQUcsb0ZBQ0osaURBREMsRUFDa0QsRUFEbEQsRUFDc0Q7SUFDdkRDLENBQUMsRUFBRUMsR0FBRyxpQkFBSSwrQkFBS0EsR0FBTDtFQUQ2QyxDQUR0RCxDQUFMLENBREosZUFLSTtJQUFNLFFBQVEsRUFBRVY7RUFBaEIsZ0JBQ0ksb0JBQUMsbUJBQUQ7SUFDSSxRQUFRLEVBQUVGLFFBRGQ7SUFFSSxTQUFTLEVBQUUsSUFGZjtJQUdJLEtBQUssRUFBRSxJQUFBYSxvQkFBQSxFQUFJLGtCQUFKLENBSFg7SUFJSSxLQUFLLEVBQUVoQixLQUpYO0lBS0ksUUFBUSxFQUFFaUIsRUFBRSxJQUFJO01BQ1osTUFBTUMsTUFBTSxHQUFHRCxFQUFFLENBQUNDLE1BQWxCO01BQ0FqQixRQUFRLENBQUNpQixNQUFNLENBQUNDLEtBQVIsQ0FBUjtJQUNIO0VBUkwsRUFESixDQUxKLENBUEcsZUF5Qkgsb0JBQUMsc0JBQUQ7SUFDSSxhQUFhLEVBQUUsSUFBQU4sbUJBQUEsRUFBRyxVQUFILENBRG5CO0lBRUksb0JBQW9CLEVBQUVSLFFBRjFCO0lBR0ksU0FBUyxFQUFFO0VBSGYsRUF6QkcsQ0FBUDtBQStCSCxDQWxERDs7ZUFvRGVQLDZCIn0=