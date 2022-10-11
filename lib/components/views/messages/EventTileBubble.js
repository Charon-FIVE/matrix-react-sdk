"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

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
const EventTileBubble = /*#__PURE__*/(0, _react.forwardRef)((_ref, ref) => {
  let {
    className,
    title,
    timestamp,
    subtitle,
    children
  } = _ref;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _classnames.default)("mx_EventTileBubble", className),
    ref: ref
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_EventTileBubble_title"
  }, title), subtitle && /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_EventTileBubble_subtitle"
  }, subtitle), children, timestamp);
});
var _default = EventTileBubble;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFdmVudFRpbGVCdWJibGUiLCJmb3J3YXJkUmVmIiwicmVmIiwiY2xhc3NOYW1lIiwidGl0bGUiLCJ0aW1lc3RhbXAiLCJzdWJ0aXRsZSIsImNoaWxkcmVuIiwiY2xhc3NOYW1lcyJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL0V2ZW50VGlsZUJ1YmJsZS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IGZvcndhcmRSZWYsIFJlYWN0Tm9kZSwgUmVhY3RDaGlsZHJlbiB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSBcImNsYXNzbmFtZXNcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgY2xhc3NOYW1lOiBzdHJpbmc7XG4gICAgdGl0bGU6IHN0cmluZztcbiAgICB0aW1lc3RhbXA/OiBKU1guRWxlbWVudDtcbiAgICBzdWJ0aXRsZT86IFJlYWN0Tm9kZTtcbiAgICBjaGlsZHJlbj86IFJlYWN0Q2hpbGRyZW47XG59XG5cbmNvbnN0IEV2ZW50VGlsZUJ1YmJsZSA9IGZvcndhcmRSZWY8SFRNTERpdkVsZW1lbnQsIElQcm9wcz4oKHtcbiAgICBjbGFzc05hbWUsXG4gICAgdGl0bGUsXG4gICAgdGltZXN0YW1wLFxuICAgIHN1YnRpdGxlLFxuICAgIGNoaWxkcmVuLFxufSwgcmVmKSA9PiB7XG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPXtjbGFzc05hbWVzKFwibXhfRXZlbnRUaWxlQnViYmxlXCIsIGNsYXNzTmFtZSl9IHJlZj17cmVmfT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FdmVudFRpbGVCdWJibGVfdGl0bGVcIj57IHRpdGxlIH08L2Rpdj5cbiAgICAgICAgeyBzdWJ0aXRsZSAmJiA8ZGl2IGNsYXNzTmFtZT1cIm14X0V2ZW50VGlsZUJ1YmJsZV9zdWJ0aXRsZVwiPnsgc3VidGl0bGUgfTwvZGl2PiB9XG4gICAgICAgIHsgY2hpbGRyZW4gfVxuICAgICAgICB7IHRpbWVzdGFtcCB9XG4gICAgPC9kaXY+O1xufSk7XG5cbmV4cG9ydCBkZWZhdWx0IEV2ZW50VGlsZUJ1YmJsZTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUNBOzs7Ozs7QUFqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBYUEsTUFBTUEsZUFBZSxnQkFBRyxJQUFBQyxpQkFBQSxFQUFtQyxPQU14REMsR0FOd0QsS0FNaEQ7RUFBQSxJQU5pRDtJQUN4REMsU0FEd0Q7SUFFeERDLEtBRndEO0lBR3hEQyxTQUh3RDtJQUl4REMsUUFKd0Q7SUFLeERDO0VBTHdELENBTWpEO0VBQ1Asb0JBQU87SUFBSyxTQUFTLEVBQUUsSUFBQUMsbUJBQUEsRUFBVyxvQkFBWCxFQUFpQ0wsU0FBakMsQ0FBaEI7SUFBNkQsR0FBRyxFQUFFRDtFQUFsRSxnQkFDSDtJQUFLLFNBQVMsRUFBQztFQUFmLEdBQTRDRSxLQUE1QyxDQURHLEVBRURFLFFBQVEsaUJBQUk7SUFBSyxTQUFTLEVBQUM7RUFBZixHQUErQ0EsUUFBL0MsQ0FGWCxFQUdEQyxRQUhDLEVBSURGLFNBSkMsQ0FBUDtBQU1ILENBYnVCLENBQXhCO2VBZWVMLGUifQ==