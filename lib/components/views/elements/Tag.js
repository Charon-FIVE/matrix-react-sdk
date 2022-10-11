"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Tag = void 0;

var _react = _interopRequireDefault(require("react"));

var _AccessibleButton = _interopRequireDefault(require("./AccessibleButton"));

var _cancelRounded = require("../../../../res/img/element-icons/cancel-rounded.svg");

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
const Tag = _ref => {
  let {
    icon,
    label,
    onDeleteClick,
    disabled = false
  } = _ref;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_Tag"
  }, icon?.(), label, onDeleteClick && /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    className: "mx_Tag_delete",
    onClick: onDeleteClick,
    disabled: disabled
  }, /*#__PURE__*/_react.default.createElement(_cancelRounded.Icon, null)));
};

exports.Tag = Tag;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUYWciLCJpY29uIiwibGFiZWwiLCJvbkRlbGV0ZUNsaWNrIiwiZGlzYWJsZWQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9UYWcudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4vQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IHsgSWNvbiBhcyBDYW5jZWxSb3VuZGVkIH0gZnJvbSBcIi4uLy4uLy4uLy4uL3Jlcy9pbWcvZWxlbWVudC1pY29ucy9jYW5jZWwtcm91bmRlZC5zdmdcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgaWNvbj86ICgpID0+IEpTWC5FbGVtZW50O1xuICAgIGxhYmVsOiBzdHJpbmc7XG4gICAgb25EZWxldGVDbGljaz86ICgpID0+IHZvaWQ7XG4gICAgZGlzYWJsZWQ/OiBib29sZWFuO1xufVxuXG5leHBvcnQgY29uc3QgVGFnID0gKHtcbiAgICBpY29uLFxuICAgIGxhYmVsLFxuICAgIG9uRGVsZXRlQ2xpY2ssXG4gICAgZGlzYWJsZWQgPSBmYWxzZSxcbn06IElQcm9wcykgPT4ge1xuICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT0nbXhfVGFnJz5cbiAgICAgICAgeyBpY29uPy4oKSB9XG4gICAgICAgIHsgbGFiZWwgfVxuICAgICAgICB7IG9uRGVsZXRlQ2xpY2sgJiYgKFxuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPVwibXhfVGFnX2RlbGV0ZVwiIG9uQ2xpY2s9e29uRGVsZXRlQ2xpY2t9IGRpc2FibGVkPXtkaXNhYmxlZH0+XG4gICAgICAgICAgICAgICAgPENhbmNlbFJvdW5kZWQgLz5cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgKSB9XG4gICAgPC9kaXY+O1xufTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOztBQW5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFjTyxNQUFNQSxHQUFHLEdBQUcsUUFLTDtFQUFBLElBTE07SUFDaEJDLElBRGdCO0lBRWhCQyxLQUZnQjtJQUdoQkMsYUFIZ0I7SUFJaEJDLFFBQVEsR0FBRztFQUpLLENBS047RUFDVixvQkFBTztJQUFLLFNBQVMsRUFBQztFQUFmLEdBQ0RILElBQUksSUFESCxFQUVEQyxLQUZDLEVBR0RDLGFBQWEsaUJBQ1gsNkJBQUMseUJBQUQ7SUFBa0IsU0FBUyxFQUFDLGVBQTVCO0lBQTRDLE9BQU8sRUFBRUEsYUFBckQ7SUFBb0UsUUFBUSxFQUFFQztFQUE5RSxnQkFDSSw2QkFBQyxtQkFBRCxPQURKLENBSkQsQ0FBUDtBQVNILENBZk0ifQ==