"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _warning = require("../../../../../res/img/warning.svg");

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
const MediaProcessingError = _ref => {
  let {
    className,
    children
  } = _ref;
  return /*#__PURE__*/_react.default.createElement("span", {
    className: className
  }, /*#__PURE__*/_react.default.createElement(_warning.Icon, {
    className: "mx_MediaProcessingError_Icon",
    width: "16",
    height: "16"
  }), children);
};

var _default = MediaProcessingError;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNZWRpYVByb2Nlc3NpbmdFcnJvciIsImNsYXNzTmFtZSIsImNoaWxkcmVuIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvbWVzc2FnZXMvc2hhcmVkL01lZGlhUHJvY2Vzc2luZ0Vycm9yLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgeyBJY29uIGFzIFdhcm5pbmdJY29uIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzL2ltZy93YXJuaW5nLnN2Zyc7XG5cbmludGVyZmFjZSBQcm9wcyB7XG4gICAgY2xhc3NOYW1lPzogc3RyaW5nO1xuICAgIGNoaWxkcmVuOiBSZWFjdC5SZWFjdE5vZGU7XG59XG5cbmNvbnN0IE1lZGlhUHJvY2Vzc2luZ0Vycm9yOiBSZWFjdC5GQzxQcm9wcz4gPSAoeyBjbGFzc05hbWUsIGNoaWxkcmVuIH0pID0+IChcbiAgICA8c3BhbiBjbGFzc05hbWU9e2NsYXNzTmFtZX0+XG4gICAgICAgIDxXYXJuaW5nSWNvbiBjbGFzc05hbWU9J214X01lZGlhUHJvY2Vzc2luZ0Vycm9yX0ljb24nIHdpZHRoPVwiMTZcIiBoZWlnaHQ9XCIxNlwiIC8+XG4gICAgICAgIHsgY2hpbGRyZW4gfVxuICAgIDwvc3Bhbj5cbik7XG5cbmV4cG9ydCBkZWZhdWx0IE1lZGlhUHJvY2Vzc2luZ0Vycm9yO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVdBLE1BQU1BLG9CQUFxQyxHQUFHO0VBQUEsSUFBQztJQUFFQyxTQUFGO0lBQWFDO0VBQWIsQ0FBRDtFQUFBLG9CQUMxQztJQUFNLFNBQVMsRUFBRUQ7RUFBakIsZ0JBQ0ksNkJBQUMsYUFBRDtJQUFhLFNBQVMsRUFBQyw4QkFBdkI7SUFBc0QsS0FBSyxFQUFDLElBQTVEO0lBQWlFLE1BQU0sRUFBQztFQUF4RSxFQURKLEVBRU1DLFFBRk4sQ0FEMEM7QUFBQSxDQUE5Qzs7ZUFPZUYsb0IifQ==