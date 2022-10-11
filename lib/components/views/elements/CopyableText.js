"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _languageHandler = require("../../../languageHandler");

var _strings = require("../../../utils/strings");

var _AccessibleTooltipButton = _interopRequireDefault(require("./AccessibleTooltipButton"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2019-2022 The Matrix.org Foundation C.I.C.
Copyright 2022 Šimon Brandner <simon.bra.ag@gmail.com>

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
const CopyableText = _ref => {
  let {
    children,
    getTextToCopy,
    border = true,
    className
  } = _ref;
  const [tooltip, setTooltip] = (0, _react.useState)(undefined);

  const onCopyClickInternal = async e => {
    e.preventDefault();
    const successful = await (0, _strings.copyPlaintext)(getTextToCopy());
    setTooltip(successful ? (0, _languageHandler._t)('Copied!') : (0, _languageHandler._t)('Failed to copy'));
  };

  const onHideTooltip = () => {
    if (tooltip) {
      setTooltip(undefined);
    }
  };

  const combinedClassName = (0, _classnames.default)("mx_CopyableText", className, {
    mx_CopyableText_border: border
  });
  return /*#__PURE__*/_react.default.createElement("div", {
    className: combinedClassName
  }, children, /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
    title: tooltip ?? (0, _languageHandler._t)("Copy"),
    onClick: onCopyClickInternal,
    className: "mx_CopyableText_copyButton",
    onHideTooltip: onHideTooltip
  }));
};

var _default = CopyableText;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb3B5YWJsZVRleHQiLCJjaGlsZHJlbiIsImdldFRleHRUb0NvcHkiLCJib3JkZXIiLCJjbGFzc05hbWUiLCJ0b29sdGlwIiwic2V0VG9vbHRpcCIsInVzZVN0YXRlIiwidW5kZWZpbmVkIiwib25Db3B5Q2xpY2tJbnRlcm5hbCIsImUiLCJwcmV2ZW50RGVmYXVsdCIsInN1Y2Nlc3NmdWwiLCJjb3B5UGxhaW50ZXh0IiwiX3QiLCJvbkhpZGVUb29sdGlwIiwiY29tYmluZWRDbGFzc05hbWUiLCJjbGFzc05hbWVzIiwibXhfQ29weWFibGVUZXh0X2JvcmRlciJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0NvcHlhYmxlVGV4dC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5LTIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cbkNvcHlyaWdodCAyMDIyIMWgaW1vbiBCcmFuZG5lciA8c2ltb24uYnJhLmFnQGdtYWlsLmNvbT5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5cbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IHsgY29weVBsYWludGV4dCB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9zdHJpbmdzXCI7XG5pbXBvcnQgeyBCdXR0b25FdmVudCB9IGZyb20gXCIuL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbiBmcm9tIFwiLi9BY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBjaGlsZHJlbj86IFJlYWN0LlJlYWN0Tm9kZTtcbiAgICBnZXRUZXh0VG9Db3B5OiAoKSA9PiBzdHJpbmc7XG4gICAgYm9yZGVyPzogYm9vbGVhbjtcbiAgICBjbGFzc05hbWU/OiBzdHJpbmc7XG59XG5cbmNvbnN0IENvcHlhYmxlVGV4dDogUmVhY3QuRkM8SVByb3BzPiA9ICh7IGNoaWxkcmVuLCBnZXRUZXh0VG9Db3B5LCBib3JkZXI9dHJ1ZSwgY2xhc3NOYW1lIH0pID0+IHtcbiAgICBjb25zdCBbdG9vbHRpcCwgc2V0VG9vbHRpcF0gPSB1c2VTdGF0ZTxzdHJpbmcgfCB1bmRlZmluZWQ+KHVuZGVmaW5lZCk7XG5cbiAgICBjb25zdCBvbkNvcHlDbGlja0ludGVybmFsID0gYXN5bmMgKGU6IEJ1dHRvbkV2ZW50KSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY29uc3Qgc3VjY2Vzc2Z1bCA9IGF3YWl0IGNvcHlQbGFpbnRleHQoZ2V0VGV4dFRvQ29weSgpKTtcbiAgICAgICAgc2V0VG9vbHRpcChzdWNjZXNzZnVsID8gX3QoJ0NvcGllZCEnKSA6IF90KCdGYWlsZWQgdG8gY29weScpKTtcbiAgICB9O1xuXG4gICAgY29uc3Qgb25IaWRlVG9vbHRpcCA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRvb2x0aXApIHtcbiAgICAgICAgICAgIHNldFRvb2x0aXAodW5kZWZpbmVkKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBjb21iaW5lZENsYXNzTmFtZSA9IGNsYXNzTmFtZXMoXCJteF9Db3B5YWJsZVRleHRcIiwgY2xhc3NOYW1lLCB7XG4gICAgICAgIG14X0NvcHlhYmxlVGV4dF9ib3JkZXI6IGJvcmRlcixcbiAgICB9KTtcblxuICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT17Y29tYmluZWRDbGFzc05hbWV9PlxuICAgICAgICB7IGNoaWxkcmVuIH1cbiAgICAgICAgPEFjY2Vzc2libGVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICB0aXRsZT17dG9vbHRpcCA/PyBfdChcIkNvcHlcIil9XG4gICAgICAgICAgICBvbkNsaWNrPXtvbkNvcHlDbGlja0ludGVybmFsfVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQ29weWFibGVUZXh0X2NvcHlCdXR0b25cIlxuICAgICAgICAgICAgb25IaWRlVG9vbHRpcD17b25IaWRlVG9vbHRpcH1cbiAgICAgICAgLz5cbiAgICA8L2Rpdj47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBDb3B5YWJsZVRleHQ7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFFQTs7Ozs7O0FBdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBaUJBLE1BQU1BLFlBQThCLEdBQUcsUUFBeUQ7RUFBQSxJQUF4RDtJQUFFQyxRQUFGO0lBQVlDLGFBQVo7SUFBMkJDLE1BQU0sR0FBQyxJQUFsQztJQUF3Q0M7RUFBeEMsQ0FBd0Q7RUFDNUYsTUFBTSxDQUFDQyxPQUFELEVBQVVDLFVBQVYsSUFBd0IsSUFBQUMsZUFBQSxFQUE2QkMsU0FBN0IsQ0FBOUI7O0VBRUEsTUFBTUMsbUJBQW1CLEdBQUcsTUFBT0MsQ0FBUCxJQUEwQjtJQUNsREEsQ0FBQyxDQUFDQyxjQUFGO0lBQ0EsTUFBTUMsVUFBVSxHQUFHLE1BQU0sSUFBQUMsc0JBQUEsRUFBY1gsYUFBYSxFQUEzQixDQUF6QjtJQUNBSSxVQUFVLENBQUNNLFVBQVUsR0FBRyxJQUFBRSxtQkFBQSxFQUFHLFNBQUgsQ0FBSCxHQUFtQixJQUFBQSxtQkFBQSxFQUFHLGdCQUFILENBQTlCLENBQVY7RUFDSCxDQUpEOztFQU1BLE1BQU1DLGFBQWEsR0FBRyxNQUFNO0lBQ3hCLElBQUlWLE9BQUosRUFBYTtNQUNUQyxVQUFVLENBQUNFLFNBQUQsQ0FBVjtJQUNIO0VBQ0osQ0FKRDs7RUFNQSxNQUFNUSxpQkFBaUIsR0FBRyxJQUFBQyxtQkFBQSxFQUFXLGlCQUFYLEVBQThCYixTQUE5QixFQUF5QztJQUMvRGMsc0JBQXNCLEVBQUVmO0VBRHVDLENBQXpDLENBQTFCO0VBSUEsb0JBQU87SUFBSyxTQUFTLEVBQUVhO0VBQWhCLEdBQ0RmLFFBREMsZUFFSCw2QkFBQyxnQ0FBRDtJQUNJLEtBQUssRUFBRUksT0FBTyxJQUFJLElBQUFTLG1CQUFBLEVBQUcsTUFBSCxDQUR0QjtJQUVJLE9BQU8sRUFBRUwsbUJBRmI7SUFHSSxTQUFTLEVBQUMsNEJBSGQ7SUFJSSxhQUFhLEVBQUVNO0VBSm5CLEVBRkcsQ0FBUDtBQVNILENBNUJEOztlQThCZWYsWSJ9