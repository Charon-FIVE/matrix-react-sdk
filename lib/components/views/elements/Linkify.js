"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Linkify = Linkify;

var _react = _interopRequireWildcard(require("react"));

var _HtmlUtils = require("../../../HtmlUtils");

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
function Linkify(_ref) {
  let {
    as = "div",
    children,
    onClick
  } = _ref;
  const ref = (0, _react.useRef)();
  (0, _react.useLayoutEffect)(() => {
    (0, _HtmlUtils.linkifyElement)(ref.current);
  }, [children]);
  return /*#__PURE__*/_react.default.createElement(as, {
    children,
    ref,
    onClick
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMaW5raWZ5IiwiYXMiLCJjaGlsZHJlbiIsIm9uQ2xpY2siLCJyZWYiLCJ1c2VSZWYiLCJ1c2VMYXlvdXRFZmZlY3QiLCJsaW5raWZ5RWxlbWVudCIsImN1cnJlbnQiLCJSZWFjdCIsImNyZWF0ZUVsZW1lbnQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9MaW5raWZ5LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlTGF5b3V0RWZmZWN0LCB1c2VSZWYgfSBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IHsgbGlua2lmeUVsZW1lbnQgfSBmcm9tIFwiLi4vLi4vLi4vSHRtbFV0aWxzXCI7XG5cbmludGVyZmFjZSBQcm9wcyB7XG4gICAgYXM/OiBzdHJpbmc7XG4gICAgY2hpbGRyZW46IFJlYWN0LlJlYWN0Tm9kZTtcbiAgICBvbkNsaWNrPzogKGV2OiBNb3VzZUV2ZW50KSA9PiB2b2lkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gTGlua2lmeSh7XG4gICAgYXMgPSBcImRpdlwiLFxuICAgIGNoaWxkcmVuLFxuICAgIG9uQ2xpY2ssXG59OiBQcm9wcyk6IEpTWC5FbGVtZW50IHtcbiAgICBjb25zdCByZWYgPSB1c2VSZWYoKTtcblxuICAgIHVzZUxheW91dEVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGxpbmtpZnlFbGVtZW50KHJlZi5jdXJyZW50KTtcbiAgICB9LCBbY2hpbGRyZW5dKTtcblxuICAgIHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KGFzLCB7XG4gICAgICAgIGNoaWxkcmVuLFxuICAgICAgICByZWYsXG4gICAgICAgIG9uQ2xpY2ssXG4gICAgfSk7XG59XG5cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQWdCQTs7QUFFQTs7Ozs7O0FBbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVlPLFNBQVNBLE9BQVQsT0FJZ0I7RUFBQSxJQUpDO0lBQ3BCQyxFQUFFLEdBQUcsS0FEZTtJQUVwQkMsUUFGb0I7SUFHcEJDO0VBSG9CLENBSUQ7RUFDbkIsTUFBTUMsR0FBRyxHQUFHLElBQUFDLGFBQUEsR0FBWjtFQUVBLElBQUFDLHNCQUFBLEVBQWdCLE1BQU07SUFDbEIsSUFBQUMseUJBQUEsRUFBZUgsR0FBRyxDQUFDSSxPQUFuQjtFQUNILENBRkQsRUFFRyxDQUFDTixRQUFELENBRkg7RUFJQSxvQkFBT08sY0FBQSxDQUFNQyxhQUFOLENBQW9CVCxFQUFwQixFQUF3QjtJQUMzQkMsUUFEMkI7SUFFM0JFLEdBRjJCO0lBRzNCRDtFQUgyQixDQUF4QixDQUFQO0FBS0gifQ==