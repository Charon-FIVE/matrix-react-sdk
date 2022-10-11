"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserOnboardingHeader = UserOnboardingHeader;

var React = _interopRequireWildcard(require("react"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _languageHandler = require("../../../languageHandler");

var _PosthogTrackers = _interopRequireDefault(require("../../../PosthogTrackers"));

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _UseCase = require("../../../settings/enums/UseCase");

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
const onClickSendDm = ev => {
  _PosthogTrackers.default.trackInteraction("WebUserOnboardingHeaderSendDm", ev);

  _dispatcher.default.dispatch({
    action: 'view_create_chat'
  });
};

function UserOnboardingHeader(_ref) {
  let {
    useCase
  } = _ref;
  let title;
  let description;
  let image;
  let actionLabel;

  switch (useCase) {
    case _UseCase.UseCase.PersonalMessaging:
      title = (0, _languageHandler._t)("Secure messaging for friends and family");
      description = (0, _languageHandler._t)("With free end-to-end encrypted messaging, and unlimited voice and video calls, " + "%(brand)s is a great way to stay in touch.", {
        brand: _SdkConfig.default.get("brand")
      });
      image = require("../../../../res/img/user-onboarding/PersonalMessaging.png");
      actionLabel = (0, _languageHandler._t)("Start your first chat");
      break;

    case _UseCase.UseCase.WorkMessaging:
      title = (0, _languageHandler._t)("Secure messaging for work");
      description = (0, _languageHandler._t)("With free end-to-end encrypted messaging, and unlimited voice and video calls," + " %(brand)s is a great way to stay in touch.", {
        brand: _SdkConfig.default.get("brand")
      });
      image = require("../../../../res/img/user-onboarding/WorkMessaging.png");
      actionLabel = (0, _languageHandler._t)("Find your co-workers");
      break;

    case _UseCase.UseCase.CommunityMessaging:
      title = (0, _languageHandler._t)("Community ownership");
      description = (0, _languageHandler._t)("Keep ownership and control of community discussion.\n" + "Scale to support millions, with powerful moderation and interoperability.");
      image = require("../../../../res/img/user-onboarding/CommunityMessaging.png");
      actionLabel = (0, _languageHandler._t)("Find your people");
      break;

    default:
      title = (0, _languageHandler._t)("Welcome to %(brand)s", {
        brand: _SdkConfig.default.get("brand")
      });
      description = (0, _languageHandler._t)("With free end-to-end encrypted messaging, and unlimited voice and video calls," + " %(brand)s is a great way to stay in touch.", {
        brand: _SdkConfig.default.get("brand")
      });
      image = require("../../../../res/img/user-onboarding/PersonalMessaging.png");
      actionLabel = (0, _languageHandler._t)("Start your first chat");
      break;
  }

  return /*#__PURE__*/React.createElement("div", {
    className: "mx_UserOnboardingHeader"
  }, /*#__PURE__*/React.createElement("div", {
    className: "mx_UserOnboardingHeader_content"
  }, /*#__PURE__*/React.createElement(_Heading.default, {
    size: "h1"
  }, title, /*#__PURE__*/React.createElement("span", {
    className: "mx_UserOnboardingHeader_dot"
  }, ".")), /*#__PURE__*/React.createElement("p", null, description), /*#__PURE__*/React.createElement(_AccessibleButton.default, {
    onClick: onClickSendDm,
    kind: "primary"
  }, actionLabel)), /*#__PURE__*/React.createElement("img", {
    className: "mx_UserOnboardingHeader_image",
    src: image,
    alt: ""
  }));
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvbkNsaWNrU2VuZERtIiwiZXYiLCJQb3N0aG9nVHJhY2tlcnMiLCJ0cmFja0ludGVyYWN0aW9uIiwiZGVmYXVsdERpc3BhdGNoZXIiLCJkaXNwYXRjaCIsImFjdGlvbiIsIlVzZXJPbmJvYXJkaW5nSGVhZGVyIiwidXNlQ2FzZSIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJpbWFnZSIsImFjdGlvbkxhYmVsIiwiVXNlQ2FzZSIsIlBlcnNvbmFsTWVzc2FnaW5nIiwiX3QiLCJicmFuZCIsIlNka0NvbmZpZyIsImdldCIsInJlcXVpcmUiLCJXb3JrTWVzc2FnaW5nIiwiQ29tbXVuaXR5TWVzc2FnaW5nIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvdXNlci1vbmJvYXJkaW5nL1VzZXJPbmJvYXJkaW5nSGVhZGVyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IGRlZmF1bHREaXNwYXRjaGVyIGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IFBvc3Rob2dUcmFja2VycyBmcm9tIFwiLi4vLi4vLi4vUG9zdGhvZ1RyYWNrZXJzXCI7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuLi8uLi8uLi9TZGtDb25maWdcIjtcbmltcG9ydCB7IFVzZUNhc2UgfSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvZW51bXMvVXNlQ2FzZVwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24sIHsgQnV0dG9uRXZlbnQgfSBmcm9tIFwiLi4vLi4vdmlld3MvZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IEhlYWRpbmcgZnJvbSBcIi4uLy4uL3ZpZXdzL3R5cG9ncmFwaHkvSGVhZGluZ1wiO1xuXG5jb25zdCBvbkNsaWNrU2VuZERtID0gKGV2OiBCdXR0b25FdmVudCkgPT4ge1xuICAgIFBvc3Rob2dUcmFja2Vycy50cmFja0ludGVyYWN0aW9uKFwiV2ViVXNlck9uYm9hcmRpbmdIZWFkZXJTZW5kRG1cIiwgZXYpO1xuICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoKHsgYWN0aW9uOiAndmlld19jcmVhdGVfY2hhdCcgfSk7XG59O1xuXG5pbnRlcmZhY2UgUHJvcHMge1xuICAgIHVzZUNhc2U6IFVzZUNhc2U7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBVc2VyT25ib2FyZGluZ0hlYWRlcih7IHVzZUNhc2UgfTogUHJvcHMpIHtcbiAgICBsZXQgdGl0bGU6IHN0cmluZztcbiAgICBsZXQgZGVzY3JpcHRpb246IHN0cmluZztcbiAgICBsZXQgaW1hZ2U7XG4gICAgbGV0IGFjdGlvbkxhYmVsOiBzdHJpbmc7XG5cbiAgICBzd2l0Y2ggKHVzZUNhc2UpIHtcbiAgICAgICAgY2FzZSBVc2VDYXNlLlBlcnNvbmFsTWVzc2FnaW5nOlxuICAgICAgICAgICAgdGl0bGUgPSBfdChcIlNlY3VyZSBtZXNzYWdpbmcgZm9yIGZyaWVuZHMgYW5kIGZhbWlseVwiKTtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gX3QoXCJXaXRoIGZyZWUgZW5kLXRvLWVuZCBlbmNyeXB0ZWQgbWVzc2FnaW5nLCBhbmQgdW5saW1pdGVkIHZvaWNlIGFuZCB2aWRlbyBjYWxscywgXCIgK1xuICAgICAgICAgICAgICAgIFwiJShicmFuZClzIGlzIGEgZ3JlYXQgd2F5IHRvIHN0YXkgaW4gdG91Y2guXCIsIHtcbiAgICAgICAgICAgICAgICBicmFuZDogU2RrQ29uZmlnLmdldChcImJyYW5kXCIpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpbWFnZSA9IHJlcXVpcmUoXCIuLi8uLi8uLi8uLi9yZXMvaW1nL3VzZXItb25ib2FyZGluZy9QZXJzb25hbE1lc3NhZ2luZy5wbmdcIik7XG4gICAgICAgICAgICBhY3Rpb25MYWJlbCA9IF90KFwiU3RhcnQgeW91ciBmaXJzdCBjaGF0XCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgVXNlQ2FzZS5Xb3JrTWVzc2FnaW5nOlxuICAgICAgICAgICAgdGl0bGUgPSBfdChcIlNlY3VyZSBtZXNzYWdpbmcgZm9yIHdvcmtcIik7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbiA9IF90KFwiV2l0aCBmcmVlIGVuZC10by1lbmQgZW5jcnlwdGVkIG1lc3NhZ2luZywgYW5kIHVubGltaXRlZCB2b2ljZSBhbmQgdmlkZW8gY2FsbHMsXCIgK1xuICAgICAgICAgICAgICAgIFwiICUoYnJhbmQpcyBpcyBhIGdyZWF0IHdheSB0byBzdGF5IGluIHRvdWNoLlwiLCB7XG4gICAgICAgICAgICAgICAgYnJhbmQ6IFNka0NvbmZpZy5nZXQoXCJicmFuZFwiKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaW1hZ2UgPSByZXF1aXJlKFwiLi4vLi4vLi4vLi4vcmVzL2ltZy91c2VyLW9uYm9hcmRpbmcvV29ya01lc3NhZ2luZy5wbmdcIik7XG4gICAgICAgICAgICBhY3Rpb25MYWJlbCA9IF90KFwiRmluZCB5b3VyIGNvLXdvcmtlcnNcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBVc2VDYXNlLkNvbW11bml0eU1lc3NhZ2luZzpcbiAgICAgICAgICAgIHRpdGxlID0gX3QoXCJDb21tdW5pdHkgb3duZXJzaGlwXCIpO1xuICAgICAgICAgICAgZGVzY3JpcHRpb24gPSBfdChcIktlZXAgb3duZXJzaGlwIGFuZCBjb250cm9sIG9mIGNvbW11bml0eSBkaXNjdXNzaW9uLlxcblwiICtcbiAgICAgICAgICAgICAgICBcIlNjYWxlIHRvIHN1cHBvcnQgbWlsbGlvbnMsIHdpdGggcG93ZXJmdWwgbW9kZXJhdGlvbiBhbmQgaW50ZXJvcGVyYWJpbGl0eS5cIik7XG4gICAgICAgICAgICBpbWFnZSA9IHJlcXVpcmUoXCIuLi8uLi8uLi8uLi9yZXMvaW1nL3VzZXItb25ib2FyZGluZy9Db21tdW5pdHlNZXNzYWdpbmcucG5nXCIpO1xuICAgICAgICAgICAgYWN0aW9uTGFiZWwgPSBfdChcIkZpbmQgeW91ciBwZW9wbGVcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRpdGxlID0gX3QoXCJXZWxjb21lIHRvICUoYnJhbmQpc1wiLCB7XG4gICAgICAgICAgICAgICAgYnJhbmQ6IFNka0NvbmZpZy5nZXQoXCJicmFuZFwiKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZGVzY3JpcHRpb24gPSBfdChcIldpdGggZnJlZSBlbmQtdG8tZW5kIGVuY3J5cHRlZCBtZXNzYWdpbmcsIGFuZCB1bmxpbWl0ZWQgdm9pY2UgYW5kIHZpZGVvIGNhbGxzLFwiICtcbiAgICAgICAgICAgICAgICBcIiAlKGJyYW5kKXMgaXMgYSBncmVhdCB3YXkgdG8gc3RheSBpbiB0b3VjaC5cIiwge1xuICAgICAgICAgICAgICAgIGJyYW5kOiBTZGtDb25maWcuZ2V0KFwiYnJhbmRcIiksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGltYWdlID0gcmVxdWlyZShcIi4uLy4uLy4uLy4uL3Jlcy9pbWcvdXNlci1vbmJvYXJkaW5nL1BlcnNvbmFsTWVzc2FnaW5nLnBuZ1wiKTtcbiAgICAgICAgICAgIGFjdGlvbkxhYmVsID0gX3QoXCJTdGFydCB5b3VyIGZpcnN0IGNoYXRcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJPbmJvYXJkaW5nSGVhZGVyXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJPbmJvYXJkaW5nSGVhZGVyX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICA8SGVhZGluZyBzaXplPVwiaDFcIj5cbiAgICAgICAgICAgICAgICAgICAgeyB0aXRsZSB9XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1VzZXJPbmJvYXJkaW5nSGVhZGVyX2RvdFwiPi48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9IZWFkaW5nPlxuICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgICB7IGRlc2NyaXB0aW9uIH1cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17b25DbGlja1NlbmREbX0ga2luZD1cInByaW1hcnlcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBhY3Rpb25MYWJlbCB9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8aW1nIGNsYXNzTmFtZT1cIm14X1VzZXJPbmJvYXJkaW5nSGVhZGVyX2ltYWdlXCIgc3JjPXtpbWFnZX0gYWx0PVwiXCIgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgKTtcbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUF4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBWUEsTUFBTUEsYUFBYSxHQUFJQyxFQUFELElBQXFCO0VBQ3ZDQyx3QkFBQSxDQUFnQkMsZ0JBQWhCLENBQWlDLCtCQUFqQyxFQUFrRUYsRUFBbEU7O0VBQ0FHLG1CQUFBLENBQWtCQyxRQUFsQixDQUEyQjtJQUFFQyxNQUFNLEVBQUU7RUFBVixDQUEzQjtBQUNILENBSEQ7O0FBU08sU0FBU0Msb0JBQVQsT0FBa0Q7RUFBQSxJQUFwQjtJQUFFQztFQUFGLENBQW9CO0VBQ3JELElBQUlDLEtBQUo7RUFDQSxJQUFJQyxXQUFKO0VBQ0EsSUFBSUMsS0FBSjtFQUNBLElBQUlDLFdBQUo7O0VBRUEsUUFBUUosT0FBUjtJQUNJLEtBQUtLLGdCQUFBLENBQVFDLGlCQUFiO01BQ0lMLEtBQUssR0FBRyxJQUFBTSxtQkFBQSxFQUFHLHlDQUFILENBQVI7TUFDQUwsV0FBVyxHQUFHLElBQUFLLG1CQUFBLEVBQUcsb0ZBQ2IsNENBRFUsRUFDb0M7UUFDOUNDLEtBQUssRUFBRUMsa0JBQUEsQ0FBVUMsR0FBVixDQUFjLE9BQWQ7TUFEdUMsQ0FEcEMsQ0FBZDtNQUlBUCxLQUFLLEdBQUdRLE9BQU8sQ0FBQywyREFBRCxDQUFmO01BQ0FQLFdBQVcsR0FBRyxJQUFBRyxtQkFBQSxFQUFHLHVCQUFILENBQWQ7TUFDQTs7SUFDSixLQUFLRixnQkFBQSxDQUFRTyxhQUFiO01BQ0lYLEtBQUssR0FBRyxJQUFBTSxtQkFBQSxFQUFHLDJCQUFILENBQVI7TUFDQUwsV0FBVyxHQUFHLElBQUFLLG1CQUFBLEVBQUcsbUZBQ2IsNkNBRFUsRUFDcUM7UUFDL0NDLEtBQUssRUFBRUMsa0JBQUEsQ0FBVUMsR0FBVixDQUFjLE9BQWQ7TUFEd0MsQ0FEckMsQ0FBZDtNQUlBUCxLQUFLLEdBQUdRLE9BQU8sQ0FBQyx1REFBRCxDQUFmO01BQ0FQLFdBQVcsR0FBRyxJQUFBRyxtQkFBQSxFQUFHLHNCQUFILENBQWQ7TUFDQTs7SUFDSixLQUFLRixnQkFBQSxDQUFRUSxrQkFBYjtNQUNJWixLQUFLLEdBQUcsSUFBQU0sbUJBQUEsRUFBRyxxQkFBSCxDQUFSO01BQ0FMLFdBQVcsR0FBRyxJQUFBSyxtQkFBQSxFQUFHLDBEQUNiLDJFQURVLENBQWQ7TUFFQUosS0FBSyxHQUFHUSxPQUFPLENBQUMsNERBQUQsQ0FBZjtNQUNBUCxXQUFXLEdBQUcsSUFBQUcsbUJBQUEsRUFBRyxrQkFBSCxDQUFkO01BQ0E7O0lBQ0o7TUFDSU4sS0FBSyxHQUFHLElBQUFNLG1CQUFBLEVBQUcsc0JBQUgsRUFBMkI7UUFDL0JDLEtBQUssRUFBRUMsa0JBQUEsQ0FBVUMsR0FBVixDQUFjLE9BQWQ7TUFEd0IsQ0FBM0IsQ0FBUjtNQUdBUixXQUFXLEdBQUcsSUFBQUssbUJBQUEsRUFBRyxtRkFDYiw2Q0FEVSxFQUNxQztRQUMvQ0MsS0FBSyxFQUFFQyxrQkFBQSxDQUFVQyxHQUFWLENBQWMsT0FBZDtNQUR3QyxDQURyQyxDQUFkO01BSUFQLEtBQUssR0FBR1EsT0FBTyxDQUFDLDJEQUFELENBQWY7TUFDQVAsV0FBVyxHQUFHLElBQUFHLG1CQUFBLEVBQUcsdUJBQUgsQ0FBZDtNQUNBO0VBcENSOztFQXVDQSxvQkFDSTtJQUFLLFNBQVMsRUFBQztFQUFmLGdCQUNJO0lBQUssU0FBUyxFQUFDO0VBQWYsZ0JBQ0ksb0JBQUMsZ0JBQUQ7SUFBUyxJQUFJLEVBQUM7RUFBZCxHQUNNTixLQUROLGVBRUk7SUFBTSxTQUFTLEVBQUM7RUFBaEIsT0FGSixDQURKLGVBS0ksK0JBQ01DLFdBRE4sQ0FMSixlQVFJLG9CQUFDLHlCQUFEO0lBQWtCLE9BQU8sRUFBRVYsYUFBM0I7SUFBMEMsSUFBSSxFQUFDO0VBQS9DLEdBQ01ZLFdBRE4sQ0FSSixDQURKLGVBYUk7SUFBSyxTQUFTLEVBQUMsK0JBQWY7SUFBK0MsR0FBRyxFQUFFRCxLQUFwRDtJQUEyRCxHQUFHLEVBQUM7RUFBL0QsRUFiSixDQURKO0FBaUJIIn0=