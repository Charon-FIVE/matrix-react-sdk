"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _languageHandler = require("../../../languageHandler");

var _Field = _interopRequireDefault(require("../elements/Field"));

var _RovingTabIndex = require("../../../accessibility/RovingTabIndex");

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
const JumpToDatePicker = _ref => {
  let {
    ts,
    onDatePicked
  } = _ref;
  const date = new Date(ts);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const dateDefaultValue = `${year}-${month}-${day}`;
  const [dateValue, setDateValue] = (0, _react.useState)(dateDefaultValue);
  const [onFocus, isActive, ref] = (0, _RovingTabIndex.useRovingTabIndex)();

  const onDateValueInput = ev => setDateValue(ev.target.value);

  const onJumpToDateSubmit = ev => {
    ev.preventDefault();
    onDatePicked(dateValue);
  };

  return /*#__PURE__*/_react.default.createElement("form", {
    className: "mx_JumpToDatePicker_form",
    onSubmit: onJumpToDateSubmit
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_JumpToDatePicker_label"
  }, (0, _languageHandler._t)("Jump to date")), /*#__PURE__*/_react.default.createElement(_Field.default, {
    element: "input",
    type: "date",
    onInput: onDateValueInput,
    value: dateValue,
    className: "mx_JumpToDatePicker_datePicker",
    label: (0, _languageHandler._t)("Pick a date to jump to"),
    onFocus: onFocus,
    inputRef: ref,
    tabIndex: isActive ? 0 : -1
  }), /*#__PURE__*/_react.default.createElement(_RovingTabIndex.RovingAccessibleButton, {
    element: "button",
    type: "submit",
    kind: "primary",
    className: "mx_JumpToDatePicker_submitButton",
    onClick: onJumpToDateSubmit
  }, (0, _languageHandler._t)("Go")));
};

var _default = JumpToDatePicker;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJKdW1wVG9EYXRlUGlja2VyIiwidHMiLCJvbkRhdGVQaWNrZWQiLCJkYXRlIiwiRGF0ZSIsInllYXIiLCJnZXRGdWxsWWVhciIsIm1vbnRoIiwiZ2V0TW9udGgiLCJwYWRTdGFydCIsImRheSIsImdldERhdGUiLCJkYXRlRGVmYXVsdFZhbHVlIiwiZGF0ZVZhbHVlIiwic2V0RGF0ZVZhbHVlIiwidXNlU3RhdGUiLCJvbkZvY3VzIiwiaXNBY3RpdmUiLCJyZWYiLCJ1c2VSb3ZpbmdUYWJJbmRleCIsIm9uRGF0ZVZhbHVlSW5wdXQiLCJldiIsInRhcmdldCIsInZhbHVlIiwib25KdW1wVG9EYXRlU3VibWl0IiwicHJldmVudERlZmF1bHQiLCJfdCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL0p1bXBUb0RhdGVQaWNrZXIudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSwgRm9ybUV2ZW50IH0gZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgRmllbGQgZnJvbSBcIi4uL2VsZW1lbnRzL0ZpZWxkXCI7XG5pbXBvcnQgeyBSb3ZpbmdBY2Nlc3NpYmxlQnV0dG9uLCB1c2VSb3ZpbmdUYWJJbmRleCB9IGZyb20gXCIuLi8uLi8uLi9hY2Nlc3NpYmlsaXR5L1JvdmluZ1RhYkluZGV4XCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHRzOiBudW1iZXI7XG4gICAgb25EYXRlUGlja2VkPzogKGRhdGVTdHJpbmc6IHN0cmluZykgPT4gdm9pZDtcbn1cblxuY29uc3QgSnVtcFRvRGF0ZVBpY2tlcjogUmVhY3QuRkM8SVByb3BzPiA9ICh7IHRzLCBvbkRhdGVQaWNrZWQgfTogSVByb3BzKSA9PiB7XG4gICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKHRzKTtcbiAgICBjb25zdCB5ZWFyID0gZGF0ZS5nZXRGdWxsWWVhcigpO1xuICAgIGNvbnN0IG1vbnRoID0gYCR7ZGF0ZS5nZXRNb250aCgpICsgMX1gLnBhZFN0YXJ0KDIsIFwiMFwiKTtcbiAgICBjb25zdCBkYXkgPSBgJHtkYXRlLmdldERhdGUoKX1gLnBhZFN0YXJ0KDIsIFwiMFwiKTtcbiAgICBjb25zdCBkYXRlRGVmYXVsdFZhbHVlID0gYCR7eWVhcn0tJHttb250aH0tJHtkYXl9YDtcblxuICAgIGNvbnN0IFtkYXRlVmFsdWUsIHNldERhdGVWYWx1ZV0gPSB1c2VTdGF0ZShkYXRlRGVmYXVsdFZhbHVlKTtcbiAgICBjb25zdCBbb25Gb2N1cywgaXNBY3RpdmUsIHJlZl0gPSB1c2VSb3ZpbmdUYWJJbmRleDxIVE1MSW5wdXRFbGVtZW50PigpO1xuXG4gICAgY29uc3Qgb25EYXRlVmFsdWVJbnB1dCA9IChldjogUmVhY3QuQ2hhbmdlRXZlbnQ8SFRNTElucHV0RWxlbWVudD4pID0+IHNldERhdGVWYWx1ZShldi50YXJnZXQudmFsdWUpO1xuICAgIGNvbnN0IG9uSnVtcFRvRGF0ZVN1Ym1pdCA9IChldjogRm9ybUV2ZW50KTogdm9pZCA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIG9uRGF0ZVBpY2tlZChkYXRlVmFsdWUpO1xuICAgIH07XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8Zm9ybVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfSnVtcFRvRGF0ZVBpY2tlcl9mb3JtXCJcbiAgICAgICAgICAgIG9uU3VibWl0PXtvbkp1bXBUb0RhdGVTdWJtaXR9XG4gICAgICAgID5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0p1bXBUb0RhdGVQaWNrZXJfbGFiZWxcIj57IF90KFwiSnVtcCB0byBkYXRlXCIpIH08L3NwYW4+XG4gICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICBlbGVtZW50PVwiaW5wdXRcIlxuICAgICAgICAgICAgICAgIHR5cGU9XCJkYXRlXCJcbiAgICAgICAgICAgICAgICBvbklucHV0PXtvbkRhdGVWYWx1ZUlucHV0fVxuICAgICAgICAgICAgICAgIHZhbHVlPXtkYXRlVmFsdWV9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfSnVtcFRvRGF0ZVBpY2tlcl9kYXRlUGlja2VyXCJcbiAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJQaWNrIGEgZGF0ZSB0byBqdW1wIHRvXCIpfVxuICAgICAgICAgICAgICAgIG9uRm9jdXM9e29uRm9jdXN9XG4gICAgICAgICAgICAgICAgaW5wdXRSZWY9e3JlZn1cbiAgICAgICAgICAgICAgICB0YWJJbmRleD17aXNBY3RpdmUgPyAwIDogLTF9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPFJvdmluZ0FjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICBlbGVtZW50PVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICB0eXBlPVwic3VibWl0XCJcbiAgICAgICAgICAgICAgICBraW5kPVwicHJpbWFyeVwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfSnVtcFRvRGF0ZVBpY2tlcl9zdWJtaXRCdXR0b25cIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29uSnVtcFRvRGF0ZVN1Ym1pdH1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IF90KFwiR29cIikgfVxuICAgICAgICAgICAgPC9Sb3ZpbmdBY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICA8L2Zvcm0+XG4gICAgKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEp1bXBUb0RhdGVQaWNrZXI7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWdCQTs7QUFFQTs7QUFDQTs7QUFDQTs7Ozs7O0FBcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWFBLE1BQU1BLGdCQUFrQyxHQUFHLFFBQWtDO0VBQUEsSUFBakM7SUFBRUMsRUFBRjtJQUFNQztFQUFOLENBQWlDO0VBQ3pFLE1BQU1DLElBQUksR0FBRyxJQUFJQyxJQUFKLENBQVNILEVBQVQsQ0FBYjtFQUNBLE1BQU1JLElBQUksR0FBR0YsSUFBSSxDQUFDRyxXQUFMLEVBQWI7RUFDQSxNQUFNQyxLQUFLLEdBQUksR0FBRUosSUFBSSxDQUFDSyxRQUFMLEtBQWtCLENBQUUsRUFBdkIsQ0FBeUJDLFFBQXpCLENBQWtDLENBQWxDLEVBQXFDLEdBQXJDLENBQWQ7RUFDQSxNQUFNQyxHQUFHLEdBQUksR0FBRVAsSUFBSSxDQUFDUSxPQUFMLEVBQWUsRUFBbEIsQ0FBb0JGLFFBQXBCLENBQTZCLENBQTdCLEVBQWdDLEdBQWhDLENBQVo7RUFDQSxNQUFNRyxnQkFBZ0IsR0FBSSxHQUFFUCxJQUFLLElBQUdFLEtBQU0sSUFBR0csR0FBSSxFQUFqRDtFQUVBLE1BQU0sQ0FBQ0csU0FBRCxFQUFZQyxZQUFaLElBQTRCLElBQUFDLGVBQUEsRUFBU0gsZ0JBQVQsQ0FBbEM7RUFDQSxNQUFNLENBQUNJLE9BQUQsRUFBVUMsUUFBVixFQUFvQkMsR0FBcEIsSUFBMkIsSUFBQUMsaUNBQUEsR0FBakM7O0VBRUEsTUFBTUMsZ0JBQWdCLEdBQUlDLEVBQUQsSUFBNkNQLFlBQVksQ0FBQ08sRUFBRSxDQUFDQyxNQUFILENBQVVDLEtBQVgsQ0FBbEY7O0VBQ0EsTUFBTUMsa0JBQWtCLEdBQUlILEVBQUQsSUFBeUI7SUFDaERBLEVBQUUsQ0FBQ0ksY0FBSDtJQUNBdkIsWUFBWSxDQUFDVyxTQUFELENBQVo7RUFDSCxDQUhEOztFQUtBLG9CQUNJO0lBQ0ksU0FBUyxFQUFDLDBCQURkO0lBRUksUUFBUSxFQUFFVztFQUZkLGdCQUlJO0lBQU0sU0FBUyxFQUFDO0VBQWhCLEdBQThDLElBQUFFLG1CQUFBLEVBQUcsY0FBSCxDQUE5QyxDQUpKLGVBS0ksNkJBQUMsY0FBRDtJQUNJLE9BQU8sRUFBQyxPQURaO0lBRUksSUFBSSxFQUFDLE1BRlQ7SUFHSSxPQUFPLEVBQUVOLGdCQUhiO0lBSUksS0FBSyxFQUFFUCxTQUpYO0lBS0ksU0FBUyxFQUFDLGdDQUxkO0lBTUksS0FBSyxFQUFFLElBQUFhLG1CQUFBLEVBQUcsd0JBQUgsQ0FOWDtJQU9JLE9BQU8sRUFBRVYsT0FQYjtJQVFJLFFBQVEsRUFBRUUsR0FSZDtJQVNJLFFBQVEsRUFBRUQsUUFBUSxHQUFHLENBQUgsR0FBTyxDQUFDO0VBVDlCLEVBTEosZUFnQkksNkJBQUMsc0NBQUQ7SUFDSSxPQUFPLEVBQUMsUUFEWjtJQUVJLElBQUksRUFBQyxRQUZUO0lBR0ksSUFBSSxFQUFDLFNBSFQ7SUFJSSxTQUFTLEVBQUMsa0NBSmQ7SUFLSSxPQUFPLEVBQUVPO0VBTGIsR0FPTSxJQUFBRSxtQkFBQSxFQUFHLElBQUgsQ0FQTixDQWhCSixDQURKO0FBNEJILENBNUNEOztlQThDZTFCLGdCIn0=