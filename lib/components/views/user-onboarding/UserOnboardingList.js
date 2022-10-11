"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserOnboardingList = UserOnboardingList;

var React = _interopRequireWildcard(require("react"));

var _languageHandler = require("../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _ProgressBar = _interopRequireDefault(require("../../views/elements/ProgressBar"));

var _Heading = _interopRequireDefault(require("../../views/typography/Heading"));

var _UserOnboardingFeedback = require("./UserOnboardingFeedback");

var _UserOnboardingTask = require("./UserOnboardingTask");

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
function UserOnboardingList(_ref) {
  let {
    completedTasks,
    waitingTasks
  } = _ref;
  const completed = completedTasks.length;
  const waiting = waitingTasks.length;
  const total = completed + waiting;
  const tasks = (0, React.useMemo)(() => [...completedTasks.map(it => [it, true]), ...waitingTasks.map(it => [it, false])], [completedTasks, waitingTasks]);
  return /*#__PURE__*/React.createElement("div", {
    className: "mx_UserOnboardingList"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mx_UserOnboardingList_header"
  }, /*#__PURE__*/React.createElement(_Heading.default, {
    size: "h3",
    className: "mx_UserOnboardingList_title"
  }, waiting > 0 ? (0, _languageHandler._t)("Only %(count)s steps to go", {
    count: waiting
  }) : (0, _languageHandler._t)("You did it!")), /*#__PURE__*/React.createElement("div", {
    className: "mx_UserOnboardingList_hint"
  }, (0, _languageHandler._t)("Complete these to get the most out of %(brand)s", {
    brand: _SdkConfig.default.get("brand")
  }))), /*#__PURE__*/React.createElement("div", {
    className: "mx_UserOnboardingList_progress"
  }, /*#__PURE__*/React.createElement(_ProgressBar.default, {
    value: completed,
    max: total,
    animated: true
  }), waiting === 0 && /*#__PURE__*/React.createElement(_UserOnboardingFeedback.UserOnboardingFeedback, null)), /*#__PURE__*/React.createElement("ol", {
    className: "mx_UserOnboardingList_list"
  }, tasks.map(_ref2 => {
    let [task, completed] = _ref2;
    return /*#__PURE__*/React.createElement(_UserOnboardingTask.UserOnboardingTask, {
      key: task.id,
      completed: completed,
      task: task
    });
  })));
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVc2VyT25ib2FyZGluZ0xpc3QiLCJjb21wbGV0ZWRUYXNrcyIsIndhaXRpbmdUYXNrcyIsImNvbXBsZXRlZCIsImxlbmd0aCIsIndhaXRpbmciLCJ0b3RhbCIsInRhc2tzIiwidXNlTWVtbyIsIm1hcCIsIml0IiwiX3QiLCJjb3VudCIsImJyYW5kIiwiU2RrQ29uZmlnIiwiZ2V0IiwidGFzayIsImlkIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvdXNlci1vbmJvYXJkaW5nL1VzZXJPbmJvYXJkaW5nTGlzdC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIyIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyB1c2VNZW1vIH0gZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCB7IFVzZXJPbmJvYXJkaW5nVGFzayBhcyBUYXNrIH0gZnJvbSBcIi4uLy4uLy4uL2hvb2tzL3VzZVVzZXJPbmJvYXJkaW5nVGFza3NcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tIFwiLi4vLi4vLi4vU2RrQ29uZmlnXCI7XG5pbXBvcnQgUHJvZ3Jlc3NCYXIgZnJvbSBcIi4uLy4uL3ZpZXdzL2VsZW1lbnRzL1Byb2dyZXNzQmFyXCI7XG5pbXBvcnQgSGVhZGluZyBmcm9tIFwiLi4vLi4vdmlld3MvdHlwb2dyYXBoeS9IZWFkaW5nXCI7XG5pbXBvcnQgeyBVc2VyT25ib2FyZGluZ0ZlZWRiYWNrIH0gZnJvbSBcIi4vVXNlck9uYm9hcmRpbmdGZWVkYmFja1wiO1xuaW1wb3J0IHsgVXNlck9uYm9hcmRpbmdUYXNrIH0gZnJvbSBcIi4vVXNlck9uYm9hcmRpbmdUYXNrXCI7XG5cbmludGVyZmFjZSBQcm9wcyB7XG4gICAgY29tcGxldGVkVGFza3M6IFRhc2tbXTtcbiAgICB3YWl0aW5nVGFza3M6IFRhc2tbXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFVzZXJPbmJvYXJkaW5nTGlzdCh7IGNvbXBsZXRlZFRhc2tzLCB3YWl0aW5nVGFza3MgfTogUHJvcHMpIHtcbiAgICBjb25zdCBjb21wbGV0ZWQgPSBjb21wbGV0ZWRUYXNrcy5sZW5ndGg7XG4gICAgY29uc3Qgd2FpdGluZyA9IHdhaXRpbmdUYXNrcy5sZW5ndGg7XG4gICAgY29uc3QgdG90YWwgPSBjb21wbGV0ZWQgKyB3YWl0aW5nO1xuXG4gICAgY29uc3QgdGFza3MgPSB1c2VNZW1vKCgpID0+IFtcbiAgICAgICAgLi4uY29tcGxldGVkVGFza3MubWFwKChpdCk6IFtUYXNrLCBib29sZWFuXSA9PiBbaXQsIHRydWVdKSxcbiAgICAgICAgLi4ud2FpdGluZ1Rhc2tzLm1hcCgoaXQpOiBbVGFzaywgYm9vbGVhbl0gPT4gW2l0LCBmYWxzZV0pLFxuICAgIF0sIFtjb21wbGV0ZWRUYXNrcywgd2FpdGluZ1Rhc2tzXSk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJPbmJvYXJkaW5nTGlzdFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VyT25ib2FyZGluZ0xpc3RfaGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgPEhlYWRpbmcgc2l6ZT1cImgzXCIgY2xhc3NOYW1lPVwibXhfVXNlck9uYm9hcmRpbmdMaXN0X3RpdGxlXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgd2FpdGluZyA+IDAgPyBfdChcIk9ubHkgJShjb3VudClzIHN0ZXBzIHRvIGdvXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50OiB3YWl0aW5nLFxuICAgICAgICAgICAgICAgICAgICB9KSA6IF90KFwiWW91IGRpZCBpdCFcIikgfVxuICAgICAgICAgICAgICAgIDwvSGVhZGluZz5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJPbmJvYXJkaW5nTGlzdF9oaW50XCI+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJDb21wbGV0ZSB0aGVzZSB0byBnZXQgdGhlIG1vc3Qgb3V0IG9mICUoYnJhbmQpc1wiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmFuZDogU2RrQ29uZmlnLmdldChcImJyYW5kXCIpLFxuICAgICAgICAgICAgICAgICAgICB9KSB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlck9uYm9hcmRpbmdMaXN0X3Byb2dyZXNzXCI+XG4gICAgICAgICAgICAgICAgPFByb2dyZXNzQmFyIHZhbHVlPXtjb21wbGV0ZWR9IG1heD17dG90YWx9IGFuaW1hdGVkIC8+XG4gICAgICAgICAgICAgICAgeyB3YWl0aW5nID09PSAwICYmIChcbiAgICAgICAgICAgICAgICAgICAgPFVzZXJPbmJvYXJkaW5nRmVlZGJhY2sgLz5cbiAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPG9sIGNsYXNzTmFtZT1cIm14X1VzZXJPbmJvYXJkaW5nTGlzdF9saXN0XCI+XG4gICAgICAgICAgICAgICAgeyB0YXNrcy5tYXAoKFt0YXNrLCBjb21wbGV0ZWRdKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDxVc2VyT25ib2FyZGluZ1Rhc2sga2V5PXt0YXNrLmlkfSBjb21wbGV0ZWQ9e2NvbXBsZXRlZH0gdGFzaz17dGFza30gLz5cbiAgICAgICAgICAgICAgICApKSB9XG4gICAgICAgICAgICA8L29sPlxuICAgICAgICA8L2Rpdj5cbiAgICApO1xufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFnQkE7O0FBSUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQXpCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFrQk8sU0FBU0Esa0JBQVQsT0FBcUU7RUFBQSxJQUF6QztJQUFFQyxjQUFGO0lBQWtCQztFQUFsQixDQUF5QztFQUN4RSxNQUFNQyxTQUFTLEdBQUdGLGNBQWMsQ0FBQ0csTUFBakM7RUFDQSxNQUFNQyxPQUFPLEdBQUdILFlBQVksQ0FBQ0UsTUFBN0I7RUFDQSxNQUFNRSxLQUFLLEdBQUdILFNBQVMsR0FBR0UsT0FBMUI7RUFFQSxNQUFNRSxLQUFLLEdBQUcsSUFBQUMsYUFBQSxFQUFRLE1BQU0sQ0FDeEIsR0FBR1AsY0FBYyxDQUFDUSxHQUFmLENBQW9CQyxFQUFELElBQXlCLENBQUNBLEVBQUQsRUFBSyxJQUFMLENBQTVDLENBRHFCLEVBRXhCLEdBQUdSLFlBQVksQ0FBQ08sR0FBYixDQUFrQkMsRUFBRCxJQUF5QixDQUFDQSxFQUFELEVBQUssS0FBTCxDQUExQyxDQUZxQixDQUFkLEVBR1gsQ0FBQ1QsY0FBRCxFQUFpQkMsWUFBakIsQ0FIVyxDQUFkO0VBS0Esb0JBQ0k7SUFBSyxTQUFTLEVBQUM7RUFBZixnQkFDSTtJQUFLLFNBQVMsRUFBQztFQUFmLGdCQUNJLG9CQUFDLGdCQUFEO0lBQVMsSUFBSSxFQUFDLElBQWQ7SUFBbUIsU0FBUyxFQUFDO0VBQTdCLEdBQ01HLE9BQU8sR0FBRyxDQUFWLEdBQWMsSUFBQU0sbUJBQUEsRUFBRyw0QkFBSCxFQUFpQztJQUM3Q0MsS0FBSyxFQUFFUDtFQURzQyxDQUFqQyxDQUFkLEdBRUcsSUFBQU0sbUJBQUEsRUFBRyxhQUFILENBSFQsQ0FESixlQU1JO0lBQUssU0FBUyxFQUFDO0VBQWYsR0FDTSxJQUFBQSxtQkFBQSxFQUFHLGlEQUFILEVBQXNEO0lBQ3BERSxLQUFLLEVBQUVDLGtCQUFBLENBQVVDLEdBQVYsQ0FBYyxPQUFkO0VBRDZDLENBQXRELENBRE4sQ0FOSixDQURKLGVBYUk7SUFBSyxTQUFTLEVBQUM7RUFBZixnQkFDSSxvQkFBQyxvQkFBRDtJQUFhLEtBQUssRUFBRVosU0FBcEI7SUFBK0IsR0FBRyxFQUFFRyxLQUFwQztJQUEyQyxRQUFRO0VBQW5ELEVBREosRUFFTUQsT0FBTyxLQUFLLENBQVosaUJBQ0Usb0JBQUMsOENBQUQsT0FIUixDQWJKLGVBbUJJO0lBQUksU0FBUyxFQUFDO0VBQWQsR0FDTUUsS0FBSyxDQUFDRSxHQUFOLENBQVU7SUFBQSxJQUFDLENBQUNPLElBQUQsRUFBT2IsU0FBUCxDQUFEO0lBQUEsb0JBQ1Isb0JBQUMsc0NBQUQ7TUFBb0IsR0FBRyxFQUFFYSxJQUFJLENBQUNDLEVBQTlCO01BQWtDLFNBQVMsRUFBRWQsU0FBN0M7TUFBd0QsSUFBSSxFQUFFYTtJQUE5RCxFQURRO0VBQUEsQ0FBVixDQUROLENBbkJKLENBREo7QUEyQkgifQ==