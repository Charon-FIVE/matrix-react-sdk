"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.PendingActionSpinner = void 0;

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

/*
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
const PendingActionSpinner = _ref => {
  let {
    text
  } = _ref;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_EncryptionInfo_spinner"
  }, /*#__PURE__*/_react.default.createElement(_Spinner.default, null), text);
};

exports.PendingActionSpinner = PendingActionSpinner;

const EncryptionInfo = _ref2 => {
  let {
    waitingForOtherParty,
    waitingForNetwork,
    member,
    onStartVerification,
    isRoomEncrypted,
    inDialog,
    isSelfVerification
  } = _ref2;
  let content;

  if (waitingForOtherParty && isSelfVerification) {
    content = /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("To proceed, please accept the verification request on your other device."));
  } else if (waitingForOtherParty || waitingForNetwork) {
    let text;

    if (waitingForOtherParty) {
      text = (0, _languageHandler._t)("Waiting for %(displayName)s to accept…", {
        displayName: member.displayName || member.name || member.userId
      });
    } else {
      text = (0, _languageHandler._t)("Accepting…");
    }

    content = /*#__PURE__*/_react.default.createElement(PendingActionSpinner, {
      text: text
    });
  } else {
    content = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "primary",
      className: "mx_UserInfo_wideButton mx_UserInfo_startVerification",
      onClick: onStartVerification
    }, (0, _languageHandler._t)("Start Verification"));
  }

  let description;

  if (isRoomEncrypted) {
    description = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Messages in this room are end-to-end encrypted.")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Your messages are secured and only you and the recipient have " + "the unique keys to unlock them.")));
  } else {
    description = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Messages in this room are not end-to-end encrypted.")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("In encrypted rooms, your messages are secured and only you and the recipient have " + "the unique keys to unlock them.")));
  }

  if (inDialog) {
    return content;
  }

  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
    "data-test-id": "encryption-info-description",
    className: "mx_UserInfo_container"
  }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Encryption")), description), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UserInfo_container"
  }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Verify User")), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("For extra security, verify this user by checking a one-time code on both of your devices.")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("To be secure, do this in person or use a trusted way to communicate.")), content)));
};

var _default = EncryptionInfo;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQZW5kaW5nQWN0aW9uU3Bpbm5lciIsInRleHQiLCJFbmNyeXB0aW9uSW5mbyIsIndhaXRpbmdGb3JPdGhlclBhcnR5Iiwid2FpdGluZ0Zvck5ldHdvcmsiLCJtZW1iZXIiLCJvblN0YXJ0VmVyaWZpY2F0aW9uIiwiaXNSb29tRW5jcnlwdGVkIiwiaW5EaWFsb2ciLCJpc1NlbGZWZXJpZmljYXRpb24iLCJjb250ZW50IiwiX3QiLCJkaXNwbGF5TmFtZSIsIm5hbWUiLCJ1c2VySWQiLCJkZXNjcmlwdGlvbiJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3JpZ2h0X3BhbmVsL0VuY3J5cHRpb25JbmZvLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBSb29tTWVtYmVyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tLW1lbWJlclwiO1xuaW1wb3J0IHsgVXNlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvdXNlclwiO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgU3Bpbm5lciBmcm9tIFwiLi4vZWxlbWVudHMvU3Bpbm5lclwiO1xuXG5leHBvcnQgY29uc3QgUGVuZGluZ0FjdGlvblNwaW5uZXIgPSAoeyB0ZXh0IH0pID0+IHtcbiAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9FbmNyeXB0aW9uSW5mb19zcGlubmVyXCI+XG4gICAgICAgIDxTcGlubmVyIC8+XG4gICAgICAgIHsgdGV4dCB9XG4gICAgPC9kaXY+O1xufTtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgd2FpdGluZ0Zvck90aGVyUGFydHk6IGJvb2xlYW47XG4gICAgd2FpdGluZ0Zvck5ldHdvcms6IGJvb2xlYW47XG4gICAgbWVtYmVyOiBSb29tTWVtYmVyIHwgVXNlcjtcbiAgICBvblN0YXJ0VmVyaWZpY2F0aW9uOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xuICAgIGlzUm9vbUVuY3J5cHRlZDogYm9vbGVhbjtcbiAgICBpbkRpYWxvZzogYm9vbGVhbjtcbiAgICBpc1NlbGZWZXJpZmljYXRpb246IGJvb2xlYW47XG59XG5cbmNvbnN0IEVuY3J5cHRpb25JbmZvOiBSZWFjdC5GQzxJUHJvcHM+ID0gKHtcbiAgICB3YWl0aW5nRm9yT3RoZXJQYXJ0eSxcbiAgICB3YWl0aW5nRm9yTmV0d29yayxcbiAgICBtZW1iZXIsXG4gICAgb25TdGFydFZlcmlmaWNhdGlvbixcbiAgICBpc1Jvb21FbmNyeXB0ZWQsXG4gICAgaW5EaWFsb2csXG4gICAgaXNTZWxmVmVyaWZpY2F0aW9uLFxufTogSVByb3BzKSA9PiB7XG4gICAgbGV0IGNvbnRlbnQ6IEpTWC5FbGVtZW50O1xuICAgIGlmICh3YWl0aW5nRm9yT3RoZXJQYXJ0eSAmJiBpc1NlbGZWZXJpZmljYXRpb24pIHtcbiAgICAgICAgY29udGVudCA9IChcbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgeyBfdChcIlRvIHByb2NlZWQsIHBsZWFzZSBhY2NlcHQgdGhlIHZlcmlmaWNhdGlvbiByZXF1ZXN0IG9uIHlvdXIgb3RoZXIgZGV2aWNlLlwiKSB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKHdhaXRpbmdGb3JPdGhlclBhcnR5IHx8IHdhaXRpbmdGb3JOZXR3b3JrKSB7XG4gICAgICAgIGxldCB0ZXh0OiBzdHJpbmc7XG4gICAgICAgIGlmICh3YWl0aW5nRm9yT3RoZXJQYXJ0eSkge1xuICAgICAgICAgICAgdGV4dCA9IF90KFwiV2FpdGluZyBmb3IgJShkaXNwbGF5TmFtZSlzIHRvIGFjY2VwdOKAplwiLCB7XG4gICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IChtZW1iZXIgYXMgVXNlcikuZGlzcGxheU5hbWUgfHwgKG1lbWJlciBhcyBSb29tTWVtYmVyKS5uYW1lIHx8IG1lbWJlci51c2VySWQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRleHQgPSBfdChcIkFjY2VwdGluZ+KAplwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb250ZW50ID0gPFBlbmRpbmdBY3Rpb25TcGlubmVyIHRleHQ9e3RleHR9IC8+O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnRlbnQgPSAoXG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIGtpbmQ9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Vc2VySW5mb193aWRlQnV0dG9uIG14X1VzZXJJbmZvX3N0YXJ0VmVyaWZpY2F0aW9uXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXtvblN0YXJ0VmVyaWZpY2F0aW9ufVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgX3QoXCJTdGFydCBWZXJpZmljYXRpb25cIikgfVxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICApO1xuICAgIH1cblxuICAgIGxldCBkZXNjcmlwdGlvbjogSlNYLkVsZW1lbnQ7XG4gICAgaWYgKGlzUm9vbUVuY3J5cHRlZCkge1xuICAgICAgICBkZXNjcmlwdGlvbiA9IChcbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPHA+eyBfdChcIk1lc3NhZ2VzIGluIHRoaXMgcm9vbSBhcmUgZW5kLXRvLWVuZCBlbmNyeXB0ZWQuXCIpIH08L3A+XG4gICAgICAgICAgICAgICAgPHA+eyBfdChcIllvdXIgbWVzc2FnZXMgYXJlIHNlY3VyZWQgYW5kIG9ubHkgeW91IGFuZCB0aGUgcmVjaXBpZW50IGhhdmUgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcInRoZSB1bmlxdWUga2V5cyB0byB1bmxvY2sgdGhlbS5cIikgfTwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGRlc2NyaXB0aW9uID0gKFxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8cD57IF90KFwiTWVzc2FnZXMgaW4gdGhpcyByb29tIGFyZSBub3QgZW5kLXRvLWVuZCBlbmNyeXB0ZWQuXCIpIH08L3A+XG4gICAgICAgICAgICAgICAgPHA+eyBfdChcIkluIGVuY3J5cHRlZCByb29tcywgeW91ciBtZXNzYWdlcyBhcmUgc2VjdXJlZCBhbmQgb25seSB5b3UgYW5kIHRoZSByZWNpcGllbnQgaGF2ZSBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwidGhlIHVuaXF1ZSBrZXlzIHRvIHVubG9jayB0aGVtLlwiKSB9PC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKGluRGlhbG9nKSB7XG4gICAgICAgIHJldHVybiBjb250ZW50O1xuICAgIH1cblxuICAgIHJldHVybiA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgIDxkaXYgZGF0YS10ZXN0LWlkPSdlbmNyeXB0aW9uLWluZm8tZGVzY3JpcHRpb24nIGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2NvbnRhaW5lclwiPlxuICAgICAgICAgICAgPGgzPnsgX3QoXCJFbmNyeXB0aW9uXCIpIH08L2gzPlxuICAgICAgICAgICAgeyBkZXNjcmlwdGlvbiB9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJJbmZvX2NvbnRhaW5lclwiPlxuICAgICAgICAgICAgPGgzPnsgX3QoXCJWZXJpZnkgVXNlclwiKSB9PC9oMz5cbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPHA+eyBfdChcIkZvciBleHRyYSBzZWN1cml0eSwgdmVyaWZ5IHRoaXMgdXNlciBieSBjaGVja2luZyBhIG9uZS10aW1lIGNvZGUgb24gYm90aCBvZiB5b3VyIGRldmljZXMuXCIpIH08L3A+XG4gICAgICAgICAgICAgICAgPHA+eyBfdChcIlRvIGJlIHNlY3VyZSwgZG8gdGhpcyBpbiBwZXJzb24gb3IgdXNlIGEgdHJ1c3RlZCB3YXkgdG8gY29tbXVuaWNhdGUuXCIpIH08L3A+XG4gICAgICAgICAgICAgICAgeyBjb250ZW50IH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICA8L1JlYWN0LkZyYWdtZW50Pjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEVuY3J5cHRpb25JbmZvO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFnQkE7O0FB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