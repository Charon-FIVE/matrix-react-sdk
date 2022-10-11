"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserOnboardingTask = UserOnboardingTask;

var _classnames = _interopRequireDefault(require("classnames"));

var React = _interopRequireWildcard(require("react"));

var _AccessibleButton = _interopRequireDefault(require("../../views/elements/AccessibleButton"));

var _Heading = _interopRequireDefault(require("../../views/typography/Heading"));

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
function UserOnboardingTask(_ref) {
  let {
    task,
    completed = false
  } = _ref;
  const title = typeof task.title === "function" ? task.title() : task.title;
  const description = typeof task.description === "function" ? task.description() : task.description;
  return /*#__PURE__*/React.createElement("li", {
    className: (0, _classnames.default)("mx_UserOnboardingTask", {
      "mx_UserOnboardingTask_completed": completed
    })
  }, /*#__PURE__*/React.createElement("div", {
    className: "mx_UserOnboardingTask_number",
    role: "checkbox",
    "aria-disabled": "true",
    "aria-checked": completed,
    "aria-labelledby": `mx_UserOnboardingTask_${task.id}`
  }), /*#__PURE__*/React.createElement("div", {
    id: `mx_UserOnboardingTask_${task.id}`,
    className: "mx_UserOnboardingTask_content"
  }, /*#__PURE__*/React.createElement(_Heading.default, {
    size: "h4",
    className: "mx_UserOnboardingTask_title"
  }, title), /*#__PURE__*/React.createElement("div", {
    className: "mx_UserOnboardingTask_description"
  }, description)), task.action && (!task.action.hideOnComplete || !completed) && /*#__PURE__*/React.createElement(_AccessibleButton.default, {
    element: "a",
    className: "mx_UserOnboardingTask_action",
    kind: "primary_outline",
    href: task.action.href,
    target: "_blank",
    onClick: task.action.onClick
  }, task.action.label));
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVc2VyT25ib2FyZGluZ1Rhc2siLCJ0YXNrIiwiY29tcGxldGVkIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsImNsYXNzTmFtZXMiLCJpZCIsImFjdGlvbiIsImhpZGVPbkNvbXBsZXRlIiwiaHJlZiIsIm9uQ2xpY2siLCJsYWJlbCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3VzZXItb25ib2FyZGluZy9Vc2VyT25ib2FyZGluZ1Rhc2sudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IHsgVXNlck9uYm9hcmRpbmdUYXNrIGFzIFRhc2sgfSBmcm9tIFwiLi4vLi4vLi4vaG9va3MvdXNlVXNlck9uYm9hcmRpbmdUYXNrc1wiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uLy4uL3ZpZXdzL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBIZWFkaW5nIGZyb20gXCIuLi8uLi92aWV3cy90eXBvZ3JhcGh5L0hlYWRpbmdcIjtcblxuaW50ZXJmYWNlIFByb3BzIHtcbiAgICB0YXNrOiBUYXNrO1xuICAgIGNvbXBsZXRlZD86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBVc2VyT25ib2FyZGluZ1Rhc2soeyB0YXNrLCBjb21wbGV0ZWQgPSBmYWxzZSB9OiBQcm9wcykge1xuICAgIGNvbnN0IHRpdGxlID0gdHlwZW9mIHRhc2sudGl0bGUgPT09IFwiZnVuY3Rpb25cIiA/IHRhc2sudGl0bGUoKSA6IHRhc2sudGl0bGU7XG4gICAgY29uc3QgZGVzY3JpcHRpb24gPSB0eXBlb2YgdGFzay5kZXNjcmlwdGlvbiA9PT0gXCJmdW5jdGlvblwiID8gdGFzay5kZXNjcmlwdGlvbigpIDogdGFzay5kZXNjcmlwdGlvbjtcblxuICAgIHJldHVybiAoXG4gICAgICAgIDxsaSBjbGFzc05hbWU9e2NsYXNzTmFtZXMoXCJteF9Vc2VyT25ib2FyZGluZ1Rhc2tcIiwge1xuICAgICAgICAgICAgXCJteF9Vc2VyT25ib2FyZGluZ1Rhc2tfY29tcGxldGVkXCI6IGNvbXBsZXRlZCxcbiAgICAgICAgfSl9PlxuICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1VzZXJPbmJvYXJkaW5nVGFza19udW1iZXJcIlxuICAgICAgICAgICAgICAgIHJvbGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICAgICAgYXJpYS1kaXNhYmxlZD1cInRydWVcIlxuICAgICAgICAgICAgICAgIGFyaWEtY2hlY2tlZD17Y29tcGxldGVkfVxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWxsZWRieT17YG14X1VzZXJPbmJvYXJkaW5nVGFza18ke3Rhc2suaWR9YH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgaWQ9e2BteF9Vc2VyT25ib2FyZGluZ1Rhc2tfJHt0YXNrLmlkfWB9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfVXNlck9uYm9hcmRpbmdUYXNrX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICA8SGVhZGluZyBzaXplPVwiaDRcIiBjbGFzc05hbWU9XCJteF9Vc2VyT25ib2FyZGluZ1Rhc2tfdGl0bGVcIj5cbiAgICAgICAgICAgICAgICAgICAgeyB0aXRsZSB9XG4gICAgICAgICAgICAgICAgPC9IZWFkaW5nPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlck9uYm9hcmRpbmdUYXNrX2Rlc2NyaXB0aW9uXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgZGVzY3JpcHRpb24gfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICB7IHRhc2suYWN0aW9uICYmICghdGFzay5hY3Rpb24uaGlkZU9uQ29tcGxldGUgfHwgIWNvbXBsZXRlZCkgJiYgKFxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ9XCJhXCJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfVXNlck9uYm9hcmRpbmdUYXNrX2FjdGlvblwiXG4gICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJwcmltYXJ5X291dGxpbmVcIlxuICAgICAgICAgICAgICAgICAgICBocmVmPXt0YXNrLmFjdGlvbi5ocmVmfVxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQ9XCJfYmxhbmtcIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0YXNrLmFjdGlvbi5vbkNsaWNrfT5cbiAgICAgICAgICAgICAgICAgICAgeyB0YXNrLmFjdGlvbi5sYWJlbCB9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgKSB9XG4gICAgICAgIDwvbGk+XG4gICAgKTtcbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUdBOztBQUNBOzs7Ozs7QUFyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBY08sU0FBU0Esa0JBQVQsT0FBZ0U7RUFBQSxJQUFwQztJQUFFQyxJQUFGO0lBQVFDLFNBQVMsR0FBRztFQUFwQixDQUFvQztFQUNuRSxNQUFNQyxLQUFLLEdBQUcsT0FBT0YsSUFBSSxDQUFDRSxLQUFaLEtBQXNCLFVBQXRCLEdBQW1DRixJQUFJLENBQUNFLEtBQUwsRUFBbkMsR0FBa0RGLElBQUksQ0FBQ0UsS0FBckU7RUFDQSxNQUFNQyxXQUFXLEdBQUcsT0FBT0gsSUFBSSxDQUFDRyxXQUFaLEtBQTRCLFVBQTVCLEdBQXlDSCxJQUFJLENBQUNHLFdBQUwsRUFBekMsR0FBOERILElBQUksQ0FBQ0csV0FBdkY7RUFFQSxvQkFDSTtJQUFJLFNBQVMsRUFBRSxJQUFBQyxtQkFBQSxFQUFXLHVCQUFYLEVBQW9DO01BQy9DLG1DQUFtQ0g7SUFEWSxDQUFwQztFQUFmLGdCQUdJO0lBQ0ksU0FBUyxFQUFDLDhCQURkO0lBRUksSUFBSSxFQUFDLFVBRlQ7SUFHSSxpQkFBYyxNQUhsQjtJQUlJLGdCQUFjQSxTQUpsQjtJQUtJLG1CQUFrQix5QkFBd0JELElBQUksQ0FBQ0ssRUFBRztFQUx0RCxFQUhKLGVBVUk7SUFDSSxFQUFFLEVBQUcseUJBQXdCTCxJQUFJLENBQUNLLEVBQUcsRUFEekM7SUFFSSxTQUFTLEVBQUM7RUFGZCxnQkFHSSxvQkFBQyxnQkFBRDtJQUFTLElBQUksRUFBQyxJQUFkO0lBQW1CLFNBQVMsRUFBQztFQUE3QixHQUNNSCxLQUROLENBSEosZUFNSTtJQUFLLFNBQVMsRUFBQztFQUFmLEdBQ01DLFdBRE4sQ0FOSixDQVZKLEVBb0JNSCxJQUFJLENBQUNNLE1BQUwsS0FBZ0IsQ0FBQ04sSUFBSSxDQUFDTSxNQUFMLENBQVlDLGNBQWIsSUFBK0IsQ0FBQ04sU0FBaEQsa0JBQ0Usb0JBQUMseUJBQUQ7SUFDSSxPQUFPLEVBQUMsR0FEWjtJQUVJLFNBQVMsRUFBQyw4QkFGZDtJQUdJLElBQUksRUFBQyxpQkFIVDtJQUlJLElBQUksRUFBRUQsSUFBSSxDQUFDTSxNQUFMLENBQVlFLElBSnRCO0lBS0ksTUFBTSxFQUFDLFFBTFg7SUFNSSxPQUFPLEVBQUVSLElBQUksQ0FBQ00sTUFBTCxDQUFZRztFQU56QixHQU9NVCxJQUFJLENBQUNNLE1BQUwsQ0FBWUksS0FQbEIsQ0FyQlIsQ0FESjtBQWtDSCJ9