"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LargeLoader = void 0;

var _react = _interopRequireDefault(require("react"));

var _Spinner = _interopRequireDefault(require("../views/elements/Spinner"));

/*
Copyright 2022 The Matrix.org Foundation C.I.C.

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

/**
 * Loader component that displays a (almost centered) spinner and loading message.
 */
const LargeLoader = _ref => {
  let {
    text
  } = _ref;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_LargeLoader"
  }, /*#__PURE__*/_react.default.createElement(_Spinner.default, {
    w: 45,
    h: 45
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_LargeLoader_text"
  }, text));
};

exports.LargeLoader = LargeLoader;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMYXJnZUxvYWRlciIsInRleHQiXSwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9zdHJ1Y3R1cmVzL0xhcmdlTG9hZGVyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCBTcGlubmVyIGZyb20gXCIuLi92aWV3cy9lbGVtZW50cy9TcGlubmVyXCI7XG5cbmludGVyZmFjZSBMYXJnZUxvYWRlclByb3BzIHtcbiAgICB0ZXh0OiBzdHJpbmc7XG59XG5cbi8qKlxuICogTG9hZGVyIGNvbXBvbmVudCB0aGF0IGRpc3BsYXlzIGEgKGFsbW9zdCBjZW50ZXJlZCkgc3Bpbm5lciBhbmQgbG9hZGluZyBtZXNzYWdlLlxuICovXG5leHBvcnQgY29uc3QgTGFyZ2VMb2FkZXI6IFJlYWN0LkZDPExhcmdlTG9hZGVyUHJvcHM+ID0gKHsgdGV4dCB9KSA9PiB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9MYXJnZUxvYWRlclwiPlxuICAgICAgICAgICAgPFNwaW5uZXIgdz17NDV9IGg9ezQ1fSAvPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9MYXJnZUxvYWRlcl90ZXh0XCI+XG4gICAgICAgICAgICAgICAgeyB0ZXh0IH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICApO1xufTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQWxCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBVUE7QUFDQTtBQUNBO0FBQ08sTUFBTUEsV0FBdUMsR0FBRyxRQUFjO0VBQUEsSUFBYjtJQUFFQztFQUFGLENBQWE7RUFDakUsb0JBQ0k7SUFBSyxTQUFTLEVBQUM7RUFBZixnQkFDSSw2QkFBQyxnQkFBRDtJQUFTLENBQUMsRUFBRSxFQUFaO0lBQWdCLENBQUMsRUFBRTtFQUFuQixFQURKLGVBRUk7SUFBSyxTQUFTLEVBQUM7RUFBZixHQUNNQSxJQUROLENBRkosQ0FESjtBQVFILENBVE0ifQ==