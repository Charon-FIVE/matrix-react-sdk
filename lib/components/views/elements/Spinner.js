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
Copyright 2015-2021 The Matrix.org Foundation C.I.C.

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
class Spinner extends _react.default.PureComponent {
  render() {
    const {
      w,
      h,
      message
    } = this.props;
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Spinner"
    }, message && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Spinner_Msg"
    }, message), "\xA0"), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Spinner_icon",
      style: {
        width: w,
        height: h
      },
      "aria-label": (0, _languageHandler._t)("Loading..."),
      role: "progressbar"
    }));
  }

}

exports.default = Spinner;
(0, _defineProperty2.default)(Spinner, "defaultProps", {
  w: 32,
  h: 32
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTcGlubmVyIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwicmVuZGVyIiwidyIsImgiLCJtZXNzYWdlIiwicHJvcHMiLCJ3aWR0aCIsImhlaWdodCIsIl90Il0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvU3Bpbm5lci50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LTIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICB3PzogbnVtYmVyO1xuICAgIGg/OiBudW1iZXI7XG4gICAgbWVzc2FnZT86IHN0cmluZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3Bpbm5lciBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SVByb3BzPiB7XG4gICAgcHVibGljIHN0YXRpYyBkZWZhdWx0UHJvcHM6IFBhcnRpYWw8SVByb3BzPiA9IHtcbiAgICAgICAgdzogMzIsXG4gICAgICAgIGg6IDMyLFxuICAgIH07XG5cbiAgICBwdWJsaWMgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCB7IHcsIGgsIG1lc3NhZ2UgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NwaW5uZXJcIj5cbiAgICAgICAgICAgICAgICB7IG1lc3NhZ2UgJiYgPFJlYWN0LkZyYWdtZW50PjxkaXYgY2xhc3NOYW1lPVwibXhfU3Bpbm5lcl9Nc2dcIj57IG1lc3NhZ2UgfTwvZGl2PiZuYnNwOzwvUmVhY3QuRnJhZ21lbnQ+IH1cbiAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1NwaW5uZXJfaWNvblwiXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IHdpZHRoOiB3LCBoZWlnaHQ6IGggfX1cbiAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17X3QoXCJMb2FkaW5nLi4uXCIpfVxuICAgICAgICAgICAgICAgICAgICByb2xlPVwicHJvZ3Jlc3NiYXJcIlxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQWxCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFZZSxNQUFNQSxPQUFOLFNBQXNCQyxjQUFBLENBQU1DLGFBQTVCLENBQWtEO0VBTXREQyxNQUFNLEdBQUc7SUFDWixNQUFNO01BQUVDLENBQUY7TUFBS0MsQ0FBTDtNQUFRQztJQUFSLElBQW9CLEtBQUtDLEtBQS9CO0lBQ0Esb0JBQ0k7TUFBSyxTQUFTLEVBQUM7SUFBZixHQUNNRCxPQUFPLGlCQUFJLDZCQUFDLGNBQUQsQ0FBTyxRQUFQLHFCQUFnQjtNQUFLLFNBQVMsRUFBQztJQUFmLEdBQWtDQSxPQUFsQyxDQUFoQixTQURqQixlQUVJO01BQ0ksU0FBUyxFQUFDLGlCQURkO01BRUksS0FBSyxFQUFFO1FBQUVFLEtBQUssRUFBRUosQ0FBVDtRQUFZSyxNQUFNLEVBQUVKO01BQXBCLENBRlg7TUFHSSxjQUFZLElBQUFLLG1CQUFBLEVBQUcsWUFBSCxDQUhoQjtNQUlJLElBQUksRUFBQztJQUpULEVBRkosQ0FESjtFQVdIOztBQW5CNEQ7Ozs4QkFBNUNWLE8sa0JBQzZCO0VBQzFDSSxDQUFDLEVBQUUsRUFEdUM7RUFFMUNDLENBQUMsRUFBRTtBQUZ1QyxDIn0=