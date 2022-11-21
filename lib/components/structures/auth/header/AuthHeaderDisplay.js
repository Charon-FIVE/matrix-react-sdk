"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AuthHeaderDisplay = AuthHeaderDisplay;

var _react = _interopRequireWildcard(require("react"));

var _AuthHeaderContext = require("./AuthHeaderContext");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
function AuthHeaderDisplay(_ref) {
  let {
    title,
    icon,
    serverPicker,
    children
  } = _ref;
  const context = (0, _react.useContext)(_AuthHeaderContext.AuthHeaderContext);

  if (!context) {
    return null;
  }

  const current = context.state.length ? context.state[0] : null;
  return /*#__PURE__*/_react.default.createElement(_react.Fragment, null, current?.icon ?? icon, /*#__PURE__*/_react.default.createElement("h1", null, current?.title ?? title), children, current?.hideServerPicker !== true && serverPicker);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBdXRoSGVhZGVyRGlzcGxheSIsInRpdGxlIiwiaWNvbiIsInNlcnZlclBpY2tlciIsImNoaWxkcmVuIiwiY29udGV4dCIsInVzZUNvbnRleHQiLCJBdXRoSGVhZGVyQ29udGV4dCIsImN1cnJlbnQiLCJzdGF0ZSIsImxlbmd0aCIsImhpZGVTZXJ2ZXJQaWNrZXIiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy9zdHJ1Y3R1cmVzL2F1dGgvaGVhZGVyL0F1dGhIZWFkZXJEaXNwbGF5LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgRnJhZ21lbnQsIFByb3BzV2l0aENoaWxkcmVuLCBSZWFjdE5vZGUsIHVzZUNvbnRleHQgfSBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IHsgQXV0aEhlYWRlckNvbnRleHQgfSBmcm9tIFwiLi9BdXRoSGVhZGVyQ29udGV4dFwiO1xuXG5pbnRlcmZhY2UgUHJvcHMge1xuICAgIHRpdGxlOiBSZWFjdE5vZGU7XG4gICAgaWNvbj86IFJlYWN0Tm9kZTtcbiAgICBzZXJ2ZXJQaWNrZXI6IFJlYWN0Tm9kZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEF1dGhIZWFkZXJEaXNwbGF5KHsgdGl0bGUsIGljb24sIHNlcnZlclBpY2tlciwgY2hpbGRyZW4gfTogUHJvcHNXaXRoQ2hpbGRyZW48UHJvcHM+KSB7XG4gICAgY29uc3QgY29udGV4dCA9IHVzZUNvbnRleHQoQXV0aEhlYWRlckNvbnRleHQpO1xuICAgIGlmICghY29udGV4dCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgY3VycmVudCA9IGNvbnRleHQuc3RhdGUubGVuZ3RoID8gY29udGV4dC5zdGF0ZVswXSA6IG51bGw7XG4gICAgcmV0dXJuIChcbiAgICAgICAgPEZyYWdtZW50PlxuICAgICAgICAgICAgeyBjdXJyZW50Py5pY29uID8/IGljb24gfVxuICAgICAgICAgICAgPGgxPnsgY3VycmVudD8udGl0bGUgPz8gdGl0bGUgfTwvaDE+XG4gICAgICAgICAgICB7IGNoaWxkcmVuIH1cbiAgICAgICAgICAgIHsgY3VycmVudD8uaGlkZVNlcnZlclBpY2tlciAhPT0gdHJ1ZSAmJiBzZXJ2ZXJQaWNrZXIgfVxuICAgICAgICA8L0ZyYWdtZW50PlxuICAgICk7XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFnQkE7O0FBRUE7Ozs7OztBQWxCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFZTyxTQUFTQSxpQkFBVCxPQUE4RjtFQUFBLElBQW5FO0lBQUVDLEtBQUY7SUFBU0MsSUFBVDtJQUFlQyxZQUFmO0lBQTZCQztFQUE3QixDQUFtRTtFQUNqRyxNQUFNQyxPQUFPLEdBQUcsSUFBQUMsaUJBQUEsRUFBV0Msb0NBQVgsQ0FBaEI7O0VBQ0EsSUFBSSxDQUFDRixPQUFMLEVBQWM7SUFDVixPQUFPLElBQVA7RUFDSDs7RUFDRCxNQUFNRyxPQUFPLEdBQUdILE9BQU8sQ0FBQ0ksS0FBUixDQUFjQyxNQUFkLEdBQXVCTCxPQUFPLENBQUNJLEtBQVIsQ0FBYyxDQUFkLENBQXZCLEdBQTBDLElBQTFEO0VBQ0Esb0JBQ0ksNkJBQUMsZUFBRCxRQUNNRCxPQUFPLEVBQUVOLElBQVQsSUFBaUJBLElBRHZCLGVBRUkseUNBQU1NLE9BQU8sRUFBRVAsS0FBVCxJQUFrQkEsS0FBeEIsQ0FGSixFQUdNRyxRQUhOLEVBSU1JLE9BQU8sRUFBRUcsZ0JBQVQsS0FBOEIsSUFBOUIsSUFBc0NSLFlBSjVDLENBREo7QUFRSCJ9