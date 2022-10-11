"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

/*
Copyright 2017 New Vector Ltd.

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
class InlineSpinner extends _react.default.PureComponent {
  render() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_InlineSpinner"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_InlineSpinner_icon mx_Spinner_icon",
      style: {
        width: this.props.w,
        height: this.props.h
      },
      "aria-label": (0, _languageHandler._t)("Loading...")
    }, this.props.children));
  }

}

exports.default = InlineSpinner;
(0, _defineProperty2.default)(InlineSpinner, "defaultProps", {
  w: 16,
  h: 16
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbmxpbmVTcGlubmVyIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwicmVuZGVyIiwid2lkdGgiLCJwcm9wcyIsInciLCJoZWlnaHQiLCJoIiwiX3QiLCJjaGlsZHJlbiJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0lubGluZVNwaW5uZXIudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNyBOZXcgVmVjdG9yIEx0ZC5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICB3PzogbnVtYmVyO1xuICAgIGg/OiBudW1iZXI7XG4gICAgY2hpbGRyZW4/OiBSZWFjdC5SZWFjdE5vZGU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElubGluZVNwaW5uZXIgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcz4ge1xuICAgIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgICAgIHc6IDE2LFxuICAgICAgICBoOiAxNixcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9JbmxpbmVTcGlubmVyXCI+XG4gICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9JbmxpbmVTcGlubmVyX2ljb24gbXhfU3Bpbm5lcl9pY29uXCJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgd2lkdGg6IHRoaXMucHJvcHMudywgaGVpZ2h0OiB0aGlzLnByb3BzLmggfX1cbiAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17X3QoXCJMb2FkaW5nLi4uXCIpfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLmNoaWxkcmVuIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVllLE1BQU1BLGFBQU4sU0FBNEJDLGNBQUEsQ0FBTUMsYUFBbEMsQ0FBd0Q7RUFNbkVDLE1BQU0sR0FBRztJQUNMLG9CQUNJO01BQUssU0FBUyxFQUFDO0lBQWYsZ0JBQ0k7TUFDSSxTQUFTLEVBQUMsdUNBRGQ7TUFFSSxLQUFLLEVBQUU7UUFBRUMsS0FBSyxFQUFFLEtBQUtDLEtBQUwsQ0FBV0MsQ0FBcEI7UUFBdUJDLE1BQU0sRUFBRSxLQUFLRixLQUFMLENBQVdHO01BQTFDLENBRlg7TUFHSSxjQUFZLElBQUFDLG1CQUFBLEVBQUcsWUFBSDtJQUhoQixHQUtNLEtBQUtKLEtBQUwsQ0FBV0ssUUFMakIsQ0FESixDQURKO0VBV0g7O0FBbEJrRTs7OzhCQUFsRFYsYSxrQkFDSztFQUNsQk0sQ0FBQyxFQUFFLEVBRGU7RUFFbEJFLENBQUMsRUFBRTtBQUZlLEMifQ==