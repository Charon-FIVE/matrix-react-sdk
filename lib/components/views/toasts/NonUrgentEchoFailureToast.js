"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _ServerOfflineDialog = _interopRequireDefault(require("../dialogs/ServerOfflineDialog"));

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
class NonUrgentEchoFailureToast extends _react.default.PureComponent {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "openDialog", () => {
      _Modal.default.createDialog(_ServerOfflineDialog.default, {});
    });
  }

  render() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_NonUrgentEchoFailureToast"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_NonUrgentEchoFailureToast_icon"
    }), (0, _languageHandler._t)("Your server isn't responding to some <a>requests</a>.", {}, {
      'a': sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "link_inline",
        onClick: this.openDialog
      }, sub)
    }));
  }

}

exports.default = NonUrgentEchoFailureToast;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOb25VcmdlbnRFY2hvRmFpbHVyZVRvYXN0IiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiTW9kYWwiLCJjcmVhdGVEaWFsb2ciLCJTZXJ2ZXJPZmZsaW5lRGlhbG9nIiwicmVuZGVyIiwiX3QiLCJzdWIiLCJvcGVuRGlhbG9nIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvdG9hc3RzL05vblVyZ2VudEVjaG9GYWlsdXJlVG9hc3QudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbmh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgTW9kYWwgZnJvbSBcIi4uLy4uLy4uL01vZGFsXCI7XG5pbXBvcnQgU2VydmVyT2ZmbGluZURpYWxvZyBmcm9tIFwiLi4vZGlhbG9ncy9TZXJ2ZXJPZmZsaW5lRGlhbG9nXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE5vblVyZ2VudEVjaG9GYWlsdXJlVG9hc3QgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50IHtcbiAgICBwcml2YXRlIG9wZW5EaWFsb2cgPSAoKSA9PiB7XG4gICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhTZXJ2ZXJPZmZsaW5lRGlhbG9nLCB7fSk7XG4gICAgfTtcblxuICAgIHB1YmxpYyByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X05vblVyZ2VudEVjaG9GYWlsdXJlVG9hc3RcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9Ob25VcmdlbnRFY2hvRmFpbHVyZVRvYXN0X2ljb25cIiAvPlxuICAgICAgICAgICAgICAgIHsgX3QoXCJZb3VyIHNlcnZlciBpc24ndCByZXNwb25kaW5nIHRvIHNvbWUgPGE+cmVxdWVzdHM8L2E+LlwiLCB7fSwge1xuICAgICAgICAgICAgICAgICAgICAnYSc6IChzdWIpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9XCJsaW5rX2lubGluZVwiIG9uQ2xpY2s9e3RoaXMub3BlbkRpYWxvZ30+eyBzdWIgfTwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICB9KSB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQXJCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFTZSxNQUFNQSx5QkFBTixTQUF3Q0MsY0FBQSxDQUFNQyxhQUE5QyxDQUE0RDtFQUFBO0lBQUE7SUFBQSxrREFDbEQsTUFBTTtNQUN2QkMsY0FBQSxDQUFNQyxZQUFOLENBQW1CQyw0QkFBbkIsRUFBd0MsRUFBeEM7SUFDSCxDQUhzRTtFQUFBOztFQUtoRUMsTUFBTSxHQUFHO0lBQ1osb0JBQ0k7TUFBSyxTQUFTLEVBQUM7SUFBZixnQkFDSTtNQUFNLFNBQVMsRUFBQztJQUFoQixFQURKLEVBRU0sSUFBQUMsbUJBQUEsRUFBRyx1REFBSCxFQUE0RCxFQUE1RCxFQUFnRTtNQUM5RCxLQUFNQyxHQUFELGlCQUNELDZCQUFDLHlCQUFEO1FBQWtCLElBQUksRUFBQyxhQUF2QjtRQUFxQyxPQUFPLEVBQUUsS0FBS0M7TUFBbkQsR0FBaUVELEdBQWpFO0lBRjBELENBQWhFLENBRk4sQ0FESjtFQVVIOztBQWhCc0UifQ==