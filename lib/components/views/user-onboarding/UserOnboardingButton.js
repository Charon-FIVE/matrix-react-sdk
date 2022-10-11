"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserOnboardingButton = UserOnboardingButton;

var _classnames = _interopRequireDefault(require("classnames"));

var _react = _interopRequireWildcard(require("react"));

var _actions = require("../../../dispatcher/actions");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _useSettings = require("../../../hooks/useSettings");

var _languageHandler = require("../../../languageHandler");

var _PosthogTrackers = _interopRequireDefault(require("../../../PosthogTrackers"));

var _SettingLevel = require("../../../settings/SettingLevel");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _AccessibleButton = _interopRequireDefault(require("../../views/elements/AccessibleButton"));

var _Heading = _interopRequireDefault(require("../../views/typography/Heading"));

var _UserOnboardingPage = require("./UserOnboardingPage");

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
function UserOnboardingButton(_ref) {
  let {
    selected,
    minimized
  } = _ref;
  const useCase = (0, _useSettings.useSettingValue)("FTUE.useCaseSelection");
  const visible = (0, _useSettings.useSettingValue)("FTUE.userOnboardingButton");

  if (!visible || minimized || !(0, _UserOnboardingPage.showUserOnboardingPage)(useCase)) {
    return null;
  }

  return /*#__PURE__*/_react.default.createElement(UserOnboardingButtonInternal, {
    selected: selected,
    minimized: minimized
  });
}

function UserOnboardingButtonInternal(_ref2) {
  let {
    selected,
    minimized
  } = _ref2;
  const onDismiss = (0, _react.useCallback)(ev => {
    ev.preventDefault();
    ev.stopPropagation();

    _PosthogTrackers.default.trackInteraction("WebRoomListUserOnboardingIgnoreButton", ev);

    _SettingsStore.default.setValue("FTUE.userOnboardingButton", null, _SettingLevel.SettingLevel.ACCOUNT, false);
  }, []);
  const onClick = (0, _react.useCallback)(ev => {
    ev.preventDefault();
    ev.stopPropagation();

    _PosthogTrackers.default.trackInteraction("WebRoomListUserOnboardingButton", ev);

    _dispatcher.default.fire(_actions.Action.ViewHomePage);
  }, []);
  return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    className: (0, _classnames.default)("mx_UserOnboardingButton", {
      "mx_UserOnboardingButton_selected": selected,
      "mx_UserOnboardingButton_minimized": minimized
    }),
    onClick: onClick
  }, !minimized && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UserOnboardingButton_content"
  }, /*#__PURE__*/_react.default.createElement(_Heading.default, {
    size: "h4",
    className: "mx_Heading_h4"
  }, (0, _languageHandler._t)("Welcome")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    className: "mx_UserOnboardingButton_close",
    onClick: onDismiss
  }))));
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVc2VyT25ib2FyZGluZ0J1dHRvbiIsInNlbGVjdGVkIiwibWluaW1pemVkIiwidXNlQ2FzZSIsInVzZVNldHRpbmdWYWx1ZSIsInZpc2libGUiLCJzaG93VXNlck9uYm9hcmRpbmdQYWdlIiwiVXNlck9uYm9hcmRpbmdCdXR0b25JbnRlcm5hbCIsIm9uRGlzbWlzcyIsInVzZUNhbGxiYWNrIiwiZXYiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsIlBvc3Rob2dUcmFja2VycyIsInRyYWNrSW50ZXJhY3Rpb24iLCJTZXR0aW5nc1N0b3JlIiwic2V0VmFsdWUiLCJTZXR0aW5nTGV2ZWwiLCJBQ0NPVU5UIiwib25DbGljayIsImRlZmF1bHREaXNwYXRjaGVyIiwiZmlyZSIsIkFjdGlvbiIsIlZpZXdIb21lUGFnZSIsImNsYXNzTmFtZXMiLCJfdCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3VzZXItb25ib2FyZGluZy9Vc2VyT25ib2FyZGluZ0J1dHRvbi50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIyIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSBcImNsYXNzbmFtZXNcIjtcbmltcG9ydCBSZWFjdCwgeyB1c2VDYWxsYmFjayB9IGZyb20gXCJyZWFjdFwiO1xuXG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQgZGVmYXVsdERpc3BhdGNoZXIgZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHsgdXNlU2V0dGluZ1ZhbHVlIH0gZnJvbSBcIi4uLy4uLy4uL2hvb2tzL3VzZVNldHRpbmdzXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBQb3N0aG9nVHJhY2tlcnMgZnJvbSBcIi4uLy4uLy4uL1Bvc3Rob2dUcmFja2Vyc1wiO1xuaW1wb3J0IHsgVXNlQ2FzZSB9IGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9lbnVtcy9Vc2VDYXNlXCI7XG5pbXBvcnQgeyBTZXR0aW5nTGV2ZWwgfSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ0xldmVsXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24sIHsgQnV0dG9uRXZlbnQgfSBmcm9tIFwiLi4vLi4vdmlld3MvZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IEhlYWRpbmcgZnJvbSBcIi4uLy4uL3ZpZXdzL3R5cG9ncmFwaHkvSGVhZGluZ1wiO1xuaW1wb3J0IHsgc2hvd1VzZXJPbmJvYXJkaW5nUGFnZSB9IGZyb20gXCIuL1VzZXJPbmJvYXJkaW5nUGFnZVwiO1xuXG5pbnRlcmZhY2UgUHJvcHMge1xuICAgIHNlbGVjdGVkOiBib29sZWFuO1xuICAgIG1pbmltaXplZDogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFVzZXJPbmJvYXJkaW5nQnV0dG9uKHsgc2VsZWN0ZWQsIG1pbmltaXplZCB9OiBQcm9wcykge1xuICAgIGNvbnN0IHVzZUNhc2UgPSB1c2VTZXR0aW5nVmFsdWU8VXNlQ2FzZSB8IG51bGw+KFwiRlRVRS51c2VDYXNlU2VsZWN0aW9uXCIpO1xuICAgIGNvbnN0IHZpc2libGUgPSB1c2VTZXR0aW5nVmFsdWU8Ym9vbGVhbj4oXCJGVFVFLnVzZXJPbmJvYXJkaW5nQnV0dG9uXCIpO1xuXG4gICAgaWYgKCF2aXNpYmxlIHx8IG1pbmltaXplZCB8fCAhc2hvd1VzZXJPbmJvYXJkaW5nUGFnZSh1c2VDYXNlKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8VXNlck9uYm9hcmRpbmdCdXR0b25JbnRlcm5hbCBzZWxlY3RlZD17c2VsZWN0ZWR9IG1pbmltaXplZD17bWluaW1pemVkfSAvPlxuICAgICk7XG59XG5cbmZ1bmN0aW9uIFVzZXJPbmJvYXJkaW5nQnV0dG9uSW50ZXJuYWwoeyBzZWxlY3RlZCwgbWluaW1pemVkIH06IFByb3BzKSB7XG4gICAgY29uc3Qgb25EaXNtaXNzID0gdXNlQ2FsbGJhY2soKGV2OiBCdXR0b25FdmVudCkgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICBQb3N0aG9nVHJhY2tlcnMudHJhY2tJbnRlcmFjdGlvbihcIldlYlJvb21MaXN0VXNlck9uYm9hcmRpbmdJZ25vcmVCdXR0b25cIiwgZXYpO1xuICAgICAgICBTZXR0aW5nc1N0b3JlLnNldFZhbHVlKFwiRlRVRS51c2VyT25ib2FyZGluZ0J1dHRvblwiLCBudWxsLCBTZXR0aW5nTGV2ZWwuQUNDT1VOVCwgZmFsc2UpO1xuICAgIH0sIFtdKTtcblxuICAgIGNvbnN0IG9uQ2xpY2sgPSB1c2VDYWxsYmFjaygoZXY6IEJ1dHRvbkV2ZW50KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIFBvc3Rob2dUcmFja2Vycy50cmFja0ludGVyYWN0aW9uKFwiV2ViUm9vbUxpc3RVc2VyT25ib2FyZGluZ0J1dHRvblwiLCBldik7XG4gICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmZpcmUoQWN0aW9uLlZpZXdIb21lUGFnZSk7XG4gICAgfSwgW10pO1xuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X1VzZXJPbmJvYXJkaW5nQnV0dG9uXCIsIHtcbiAgICAgICAgICAgICAgICBcIm14X1VzZXJPbmJvYXJkaW5nQnV0dG9uX3NlbGVjdGVkXCI6IHNlbGVjdGVkLFxuICAgICAgICAgICAgICAgIFwibXhfVXNlck9uYm9hcmRpbmdCdXR0b25fbWluaW1pemVkXCI6IG1pbmltaXplZCxcbiAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgb25DbGljaz17b25DbGlja30+XG4gICAgICAgICAgICB7ICFtaW5pbWl6ZWQgJiYgKFxuICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlck9uYm9hcmRpbmdCdXR0b25fY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEhlYWRpbmcgc2l6ZT1cImg0XCIgY2xhc3NOYW1lPVwibXhfSGVhZGluZ19oNFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJXZWxjb21lXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvSGVhZGluZz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfVXNlck9uYm9hcmRpbmdCdXR0b25fY2xvc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29uRGlzbWlzc31cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgKSB9XG4gICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICApO1xufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQTdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFzQk8sU0FBU0Esb0JBQVQsT0FBOEQ7RUFBQSxJQUFoQztJQUFFQyxRQUFGO0lBQVlDO0VBQVosQ0FBZ0M7RUFDakUsTUFBTUMsT0FBTyxHQUFHLElBQUFDLDRCQUFBLEVBQWdDLHVCQUFoQyxDQUFoQjtFQUNBLE1BQU1DLE9BQU8sR0FBRyxJQUFBRCw0QkFBQSxFQUF5QiwyQkFBekIsQ0FBaEI7O0VBRUEsSUFBSSxDQUFDQyxPQUFELElBQVlILFNBQVosSUFBeUIsQ0FBQyxJQUFBSSwwQ0FBQSxFQUF1QkgsT0FBdkIsQ0FBOUIsRUFBK0Q7SUFDM0QsT0FBTyxJQUFQO0VBQ0g7O0VBRUQsb0JBQ0ksNkJBQUMsNEJBQUQ7SUFBOEIsUUFBUSxFQUFFRixRQUF4QztJQUFrRCxTQUFTLEVBQUVDO0VBQTdELEVBREo7QUFHSDs7QUFFRCxTQUFTSyw0QkFBVCxRQUFzRTtFQUFBLElBQWhDO0lBQUVOLFFBQUY7SUFBWUM7RUFBWixDQUFnQztFQUNsRSxNQUFNTSxTQUFTLEdBQUcsSUFBQUMsa0JBQUEsRUFBYUMsRUFBRCxJQUFxQjtJQUMvQ0EsRUFBRSxDQUFDQyxjQUFIO0lBQ0FELEVBQUUsQ0FBQ0UsZUFBSDs7SUFFQUMsd0JBQUEsQ0FBZ0JDLGdCQUFoQixDQUFpQyx1Q0FBakMsRUFBMEVKLEVBQTFFOztJQUNBSyxzQkFBQSxDQUFjQyxRQUFkLENBQXVCLDJCQUF2QixFQUFvRCxJQUFwRCxFQUEwREMsMEJBQUEsQ0FBYUMsT0FBdkUsRUFBZ0YsS0FBaEY7RUFDSCxDQU5pQixFQU1mLEVBTmUsQ0FBbEI7RUFRQSxNQUFNQyxPQUFPLEdBQUcsSUFBQVYsa0JBQUEsRUFBYUMsRUFBRCxJQUFxQjtJQUM3Q0EsRUFBRSxDQUFDQyxjQUFIO0lBQ0FELEVBQUUsQ0FBQ0UsZUFBSDs7SUFFQUMsd0JBQUEsQ0FBZ0JDLGdCQUFoQixDQUFpQyxpQ0FBakMsRUFBb0VKLEVBQXBFOztJQUNBVSxtQkFBQSxDQUFrQkMsSUFBbEIsQ0FBdUJDLGVBQUEsQ0FBT0MsWUFBOUI7RUFDSCxDQU5lLEVBTWIsRUFOYSxDQUFoQjtFQVFBLG9CQUNJLDZCQUFDLHlCQUFEO0lBQ0ksU0FBUyxFQUFFLElBQUFDLG1CQUFBLEVBQVcseUJBQVgsRUFBc0M7TUFDN0Msb0NBQW9DdkIsUUFEUztNQUU3QyxxQ0FBcUNDO0lBRlEsQ0FBdEMsQ0FEZjtJQUtJLE9BQU8sRUFBRWlCO0VBTGIsR0FNTSxDQUFDakIsU0FBRCxpQkFDRSx5RUFDSTtJQUFLLFNBQVMsRUFBQztFQUFmLGdCQUNJLDZCQUFDLGdCQUFEO0lBQVMsSUFBSSxFQUFDLElBQWQ7SUFBbUIsU0FBUyxFQUFDO0VBQTdCLEdBQ00sSUFBQXVCLG1CQUFBLEVBQUcsU0FBSCxDQUROLENBREosZUFJSSw2QkFBQyx5QkFBRDtJQUNJLFNBQVMsRUFBQywrQkFEZDtJQUVJLE9BQU8sRUFBRWpCO0VBRmIsRUFKSixDQURKLENBUFIsQ0FESjtBQXNCSCJ9