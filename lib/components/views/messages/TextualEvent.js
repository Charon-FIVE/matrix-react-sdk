"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _RoomContext = _interopRequireDefault(require("../../../contexts/RoomContext"));

var TextForEvent = _interopRequireWildcard(require("../../../TextForEvent"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2015 - 2021 The Matrix.org Foundation C.I.C.

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
class TextualEvent extends _react.default.Component {
  render() {
    const text = TextForEvent.textForEvent(this.props.mxEvent, true, this.context?.showHiddenEvents);
    if (!text) return null;
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_TextualEvent"
    }, text);
  }

}

exports.default = TextualEvent;
(0, _defineProperty2.default)(TextualEvent, "contextType", _RoomContext.default);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUZXh0dWFsRXZlbnQiLCJSZWFjdCIsIkNvbXBvbmVudCIsInJlbmRlciIsInRleHQiLCJUZXh0Rm9yRXZlbnQiLCJ0ZXh0Rm9yRXZlbnQiLCJwcm9wcyIsIm14RXZlbnQiLCJjb250ZXh0Iiwic2hvd0hpZGRlbkV2ZW50cyIsIlJvb21Db250ZXh0Il0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvbWVzc2FnZXMvVGV4dHVhbEV2ZW50LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUgLSAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgTWF0cml4RXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5cbmltcG9ydCBSb29tQ29udGV4dCBmcm9tIFwiLi4vLi4vLi4vY29udGV4dHMvUm9vbUNvbnRleHRcIjtcbmltcG9ydCAqIGFzIFRleHRGb3JFdmVudCBmcm9tIFwiLi4vLi4vLi4vVGV4dEZvckV2ZW50XCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIG14RXZlbnQ6IE1hdHJpeEV2ZW50O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXh0dWFsRXZlbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzPiB7XG4gICAgc3RhdGljIGNvbnRleHRUeXBlID0gUm9vbUNvbnRleHQ7XG5cbiAgICBwdWJsaWMgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCB0ZXh0ID0gVGV4dEZvckV2ZW50LnRleHRGb3JFdmVudCh0aGlzLnByb3BzLm14RXZlbnQsIHRydWUsIHRoaXMuY29udGV4dD8uc2hvd0hpZGRlbkV2ZW50cyk7XG4gICAgICAgIGlmICghdGV4dCkgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X1RleHR1YWxFdmVudFwiPnsgdGV4dCB9PC9kaXY+O1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBR0E7O0FBQ0E7Ozs7OztBQXBCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFZZSxNQUFNQSxZQUFOLFNBQTJCQyxjQUFBLENBQU1DLFNBQWpDLENBQW1EO0VBR3ZEQyxNQUFNLEdBQUc7SUFDWixNQUFNQyxJQUFJLEdBQUdDLFlBQVksQ0FBQ0MsWUFBYixDQUEwQixLQUFLQyxLQUFMLENBQVdDLE9BQXJDLEVBQThDLElBQTlDLEVBQW9ELEtBQUtDLE9BQUwsRUFBY0MsZ0JBQWxFLENBQWI7SUFDQSxJQUFJLENBQUNOLElBQUwsRUFBVyxPQUFPLElBQVA7SUFDWCxvQkFBTztNQUFLLFNBQVMsRUFBQztJQUFmLEdBQW1DQSxJQUFuQyxDQUFQO0VBQ0g7O0FBUDZEOzs7OEJBQTdDSixZLGlCQUNJVyxvQiJ9