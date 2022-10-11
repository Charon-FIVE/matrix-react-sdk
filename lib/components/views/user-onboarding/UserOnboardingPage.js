"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserOnboardingPage = UserOnboardingPage;
exports.showUserOnboardingPage = showUserOnboardingPage;

var React = _interopRequireWildcard(require("react"));

var _useIsInitialSyncComplete = require("../../../hooks/useIsInitialSyncComplete");

var _useSettings = require("../../../hooks/useSettings");

var _useUserOnboardingContext = require("../../../hooks/useUserOnboardingContext");

var _useUserOnboardingTasks = require("../../../hooks/useUserOnboardingTasks");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _pages = require("../../../utils/pages");

var _AutoHideScrollbar = _interopRequireDefault(require("../../structures/AutoHideScrollbar"));

var _EmbeddedPage = _interopRequireDefault(require("../../structures/EmbeddedPage"));

var _HomePage = _interopRequireDefault(require("../../structures/HomePage"));

var _UserOnboardingHeader = require("./UserOnboardingHeader");

var _UserOnboardingList = require("./UserOnboardingList");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2020-2022 The Matrix.org Foundation C.I.C.

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
// We decided to only show the new user onboarding page to new users
// For now, that means we set the cutoff at 2022-07-01 00:00 UTC
const USER_ONBOARDING_CUTOFF_DATE = new Date(1656633600);

function showUserOnboardingPage(useCase) {
  return useCase !== null || _MatrixClientPeg.MatrixClientPeg.userRegisteredAfter(USER_ONBOARDING_CUTOFF_DATE);
}

const ANIMATION_DURATION = 2800;

function UserOnboardingPage(_ref) {
  let {
    justRegistered = false
  } = _ref;

  const config = _SdkConfig.default.get();

  const pageUrl = (0, _pages.getHomePageUrl)(config);
  const useCase = (0, _useSettings.useSettingValue)("FTUE.useCaseSelection");
  const context = (0, _useUserOnboardingContext.useUserOnboardingContext)();
  const [completedTasks, waitingTasks] = (0, _useUserOnboardingTasks.useUserOnboardingTasks)(context);
  const initialSyncComplete = (0, _useIsInitialSyncComplete.useInitialSyncComplete)();
  const [showList, setShowList] = (0, React.useState)(false);
  (0, React.useEffect)(() => {
    if (initialSyncComplete) {
      let handler = setTimeout(() => {
        handler = null;
        setShowList(true);
      }, ANIMATION_DURATION);
      return () => {
        clearTimeout(handler);
        handler = null;
      };
    } else {
      setShowList(false);
    }
  }, [initialSyncComplete, setShowList]); // Only show new onboarding list to users who registered after a given date or have chosen a use case

  if (!showUserOnboardingPage(useCase)) {
    return /*#__PURE__*/React.createElement(_HomePage.default, {
      justRegistered: justRegistered
    });
  }

  if (pageUrl) {
    return /*#__PURE__*/React.createElement(_EmbeddedPage.default, {
      className: "mx_HomePage",
      url: pageUrl,
      scrollbar: true
    });
  }

  return /*#__PURE__*/React.createElement(_AutoHideScrollbar.default, {
    className: "mx_UserOnboardingPage"
  }, /*#__PURE__*/React.createElement(_UserOnboardingHeader.UserOnboardingHeader, {
    useCase: useCase
  }), showList && /*#__PURE__*/React.createElement(_UserOnboardingList.UserOnboardingList, {
    completedTasks: completedTasks,
    waitingTasks: waitingTasks
  }));
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVU0VSX09OQk9BUkRJTkdfQ1VUT0ZGX0RBVEUiLCJEYXRlIiwic2hvd1VzZXJPbmJvYXJkaW5nUGFnZSIsInVzZUNhc2UiLCJNYXRyaXhDbGllbnRQZWciLCJ1c2VyUmVnaXN0ZXJlZEFmdGVyIiwiQU5JTUFUSU9OX0RVUkFUSU9OIiwiVXNlck9uYm9hcmRpbmdQYWdlIiwianVzdFJlZ2lzdGVyZWQiLCJjb25maWciLCJTZGtDb25maWciLCJnZXQiLCJwYWdlVXJsIiwiZ2V0SG9tZVBhZ2VVcmwiLCJ1c2VTZXR0aW5nVmFsdWUiLCJjb250ZXh0IiwidXNlVXNlck9uYm9hcmRpbmdDb250ZXh0IiwiY29tcGxldGVkVGFza3MiLCJ3YWl0aW5nVGFza3MiLCJ1c2VVc2VyT25ib2FyZGluZ1Rhc2tzIiwiaW5pdGlhbFN5bmNDb21wbGV0ZSIsInVzZUluaXRpYWxTeW5jQ29tcGxldGUiLCJzaG93TGlzdCIsInNldFNob3dMaXN0IiwidXNlU3RhdGUiLCJ1c2VFZmZlY3QiLCJoYW5kbGVyIiwic2V0VGltZW91dCIsImNsZWFyVGltZW91dCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3VzZXItb25ib2FyZGluZy9Vc2VyT25ib2FyZGluZ1BhZ2UudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMC0yMDIyIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCB7IHVzZUluaXRpYWxTeW5jQ29tcGxldGUgfSBmcm9tIFwiLi4vLi4vLi4vaG9va3MvdXNlSXNJbml0aWFsU3luY0NvbXBsZXRlXCI7XG5pbXBvcnQgeyB1c2VTZXR0aW5nVmFsdWUgfSBmcm9tIFwiLi4vLi4vLi4vaG9va3MvdXNlU2V0dGluZ3NcIjtcbmltcG9ydCB7IHVzZVVzZXJPbmJvYXJkaW5nQ29udGV4dCB9IGZyb20gXCIuLi8uLi8uLi9ob29rcy91c2VVc2VyT25ib2FyZGluZ0NvbnRleHRcIjtcbmltcG9ydCB7IHVzZVVzZXJPbmJvYXJkaW5nVGFza3MgfSBmcm9tIFwiLi4vLi4vLi4vaG9va3MvdXNlVXNlck9uYm9hcmRpbmdUYXNrc1wiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSBcIi4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tIFwiLi4vLi4vLi4vU2RrQ29uZmlnXCI7XG5pbXBvcnQgeyBVc2VDYXNlIH0gZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL2VudW1zL1VzZUNhc2VcIjtcbmltcG9ydCB7IGdldEhvbWVQYWdlVXJsIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3BhZ2VzXCI7XG5pbXBvcnQgQXV0b0hpZGVTY3JvbGxiYXIgZnJvbSBcIi4uLy4uL3N0cnVjdHVyZXMvQXV0b0hpZGVTY3JvbGxiYXJcIjtcbmltcG9ydCBFbWJlZGRlZFBhZ2UgZnJvbSBcIi4uLy4uL3N0cnVjdHVyZXMvRW1iZWRkZWRQYWdlXCI7XG5pbXBvcnQgSG9tZVBhZ2UgZnJvbSBcIi4uLy4uL3N0cnVjdHVyZXMvSG9tZVBhZ2VcIjtcbmltcG9ydCB7IFVzZXJPbmJvYXJkaW5nSGVhZGVyIH0gZnJvbSBcIi4vVXNlck9uYm9hcmRpbmdIZWFkZXJcIjtcbmltcG9ydCB7IFVzZXJPbmJvYXJkaW5nTGlzdCB9IGZyb20gXCIuL1VzZXJPbmJvYXJkaW5nTGlzdFwiO1xuXG5pbnRlcmZhY2UgUHJvcHMge1xuICAgIGp1c3RSZWdpc3RlcmVkPzogYm9vbGVhbjtcbn1cblxuLy8gV2UgZGVjaWRlZCB0byBvbmx5IHNob3cgdGhlIG5ldyB1c2VyIG9uYm9hcmRpbmcgcGFnZSB0byBuZXcgdXNlcnNcbi8vIEZvciBub3csIHRoYXQgbWVhbnMgd2Ugc2V0IHRoZSBjdXRvZmYgYXQgMjAyMi0wNy0wMSAwMDowMCBVVENcbmNvbnN0IFVTRVJfT05CT0FSRElOR19DVVRPRkZfREFURSA9IG5ldyBEYXRlKDFfNjU2XzYzM182MDApO1xuZXhwb3J0IGZ1bmN0aW9uIHNob3dVc2VyT25ib2FyZGluZ1BhZ2UodXNlQ2FzZTogVXNlQ2FzZSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB1c2VDYXNlICE9PSBudWxsIHx8IE1hdHJpeENsaWVudFBlZy51c2VyUmVnaXN0ZXJlZEFmdGVyKFVTRVJfT05CT0FSRElOR19DVVRPRkZfREFURSk7XG59XG5cbmNvbnN0IEFOSU1BVElPTl9EVVJBVElPTiA9IDI4MDA7XG5leHBvcnQgZnVuY3Rpb24gVXNlck9uYm9hcmRpbmdQYWdlKHsganVzdFJlZ2lzdGVyZWQgPSBmYWxzZSB9OiBQcm9wcykge1xuICAgIGNvbnN0IGNvbmZpZyA9IFNka0NvbmZpZy5nZXQoKTtcbiAgICBjb25zdCBwYWdlVXJsID0gZ2V0SG9tZVBhZ2VVcmwoY29uZmlnKTtcblxuICAgIGNvbnN0IHVzZUNhc2UgPSB1c2VTZXR0aW5nVmFsdWU8VXNlQ2FzZSB8IG51bGw+KFwiRlRVRS51c2VDYXNlU2VsZWN0aW9uXCIpO1xuICAgIGNvbnN0IGNvbnRleHQgPSB1c2VVc2VyT25ib2FyZGluZ0NvbnRleHQoKTtcbiAgICBjb25zdCBbY29tcGxldGVkVGFza3MsIHdhaXRpbmdUYXNrc10gPSB1c2VVc2VyT25ib2FyZGluZ1Rhc2tzKGNvbnRleHQpO1xuXG4gICAgY29uc3QgaW5pdGlhbFN5bmNDb21wbGV0ZSA9IHVzZUluaXRpYWxTeW5jQ29tcGxldGUoKTtcbiAgICBjb25zdCBbc2hvd0xpc3QsIHNldFNob3dMaXN0XSA9IHVzZVN0YXRlPGJvb2xlYW4+KGZhbHNlKTtcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAoaW5pdGlhbFN5bmNDb21wbGV0ZSkge1xuICAgICAgICAgICAgbGV0IGhhbmRsZXI6IG51bWJlciB8IG51bGwgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBoYW5kbGVyID0gbnVsbDtcbiAgICAgICAgICAgICAgICBzZXRTaG93TGlzdCh0cnVlKTtcbiAgICAgICAgICAgIH0sIEFOSU1BVElPTl9EVVJBVElPTik7XG4gICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChoYW5kbGVyKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVyID0gbnVsbDtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZXRTaG93TGlzdChmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9LCBbaW5pdGlhbFN5bmNDb21wbGV0ZSwgc2V0U2hvd0xpc3RdKTtcblxuICAgIC8vIE9ubHkgc2hvdyBuZXcgb25ib2FyZGluZyBsaXN0IHRvIHVzZXJzIHdobyByZWdpc3RlcmVkIGFmdGVyIGEgZ2l2ZW4gZGF0ZSBvciBoYXZlIGNob3NlbiBhIHVzZSBjYXNlXG4gICAgaWYgKCFzaG93VXNlck9uYm9hcmRpbmdQYWdlKHVzZUNhc2UpKSB7XG4gICAgICAgIHJldHVybiA8SG9tZVBhZ2UganVzdFJlZ2lzdGVyZWQ9e2p1c3RSZWdpc3RlcmVkfSAvPjtcbiAgICB9XG5cbiAgICBpZiAocGFnZVVybCkge1xuICAgICAgICByZXR1cm4gPEVtYmVkZGVkUGFnZSBjbGFzc05hbWU9XCJteF9Ib21lUGFnZVwiIHVybD17cGFnZVVybH0gc2Nyb2xsYmFyPXt0cnVlfSAvPjtcbiAgICB9XG5cbiAgICByZXR1cm4gPEF1dG9IaWRlU2Nyb2xsYmFyIGNsYXNzTmFtZT1cIm14X1VzZXJPbmJvYXJkaW5nUGFnZVwiPlxuICAgICAgICA8VXNlck9uYm9hcmRpbmdIZWFkZXIgdXNlQ2FzZT17dXNlQ2FzZX0gLz5cbiAgICAgICAgeyBzaG93TGlzdCAmJiAoXG4gICAgICAgICAgICA8VXNlck9uYm9hcmRpbmdMaXN0IGNvbXBsZXRlZFRhc2tzPXtjb21wbGV0ZWRUYXNrc30gd2FpdGluZ1Rhc2tzPXt3YWl0aW5nVGFza3N9IC8+XG4gICAgICAgICkgfVxuICAgIDwvQXV0b0hpZGVTY3JvbGxiYXI+O1xufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBZ0JBOztBQUdBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUEvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBdUJBO0FBQ0E7QUFDQSxNQUFNQSwyQkFBMkIsR0FBRyxJQUFJQyxJQUFKLENBQVMsVUFBVCxDQUFwQzs7QUFDTyxTQUFTQyxzQkFBVCxDQUFnQ0MsT0FBaEMsRUFBMkQ7RUFDOUQsT0FBT0EsT0FBTyxLQUFLLElBQVosSUFBb0JDLGdDQUFBLENBQWdCQyxtQkFBaEIsQ0FBb0NMLDJCQUFwQyxDQUEzQjtBQUNIOztBQUVELE1BQU1NLGtCQUFrQixHQUFHLElBQTNCOztBQUNPLFNBQVNDLGtCQUFULE9BQStEO0VBQUEsSUFBbkM7SUFBRUMsY0FBYyxHQUFHO0VBQW5CLENBQW1DOztFQUNsRSxNQUFNQyxNQUFNLEdBQUdDLGtCQUFBLENBQVVDLEdBQVYsRUFBZjs7RUFDQSxNQUFNQyxPQUFPLEdBQUcsSUFBQUMscUJBQUEsRUFBZUosTUFBZixDQUFoQjtFQUVBLE1BQU1OLE9BQU8sR0FBRyxJQUFBVyw0QkFBQSxFQUFnQyx1QkFBaEMsQ0FBaEI7RUFDQSxNQUFNQyxPQUFPLEdBQUcsSUFBQUMsa0RBQUEsR0FBaEI7RUFDQSxNQUFNLENBQUNDLGNBQUQsRUFBaUJDLFlBQWpCLElBQWlDLElBQUFDLDhDQUFBLEVBQXVCSixPQUF2QixDQUF2QztFQUVBLE1BQU1LLG1CQUFtQixHQUFHLElBQUFDLGdEQUFBLEdBQTVCO0VBQ0EsTUFBTSxDQUFDQyxRQUFELEVBQVdDLFdBQVgsSUFBMEIsSUFBQUMsY0FBQSxFQUFrQixLQUFsQixDQUFoQztFQUNBLElBQUFDLGVBQUEsRUFBVSxNQUFNO0lBQ1osSUFBSUwsbUJBQUosRUFBeUI7TUFDckIsSUFBSU0sT0FBc0IsR0FBR0MsVUFBVSxDQUFDLE1BQU07UUFDMUNELE9BQU8sR0FBRyxJQUFWO1FBQ0FILFdBQVcsQ0FBQyxJQUFELENBQVg7TUFDSCxDQUhzQyxFQUdwQ2pCLGtCQUhvQyxDQUF2QztNQUlBLE9BQU8sTUFBTTtRQUNUc0IsWUFBWSxDQUFDRixPQUFELENBQVo7UUFDQUEsT0FBTyxHQUFHLElBQVY7TUFDSCxDQUhEO0lBSUgsQ0FURCxNQVNPO01BQ0hILFdBQVcsQ0FBQyxLQUFELENBQVg7SUFDSDtFQUNKLENBYkQsRUFhRyxDQUFDSCxtQkFBRCxFQUFzQkcsV0FBdEIsQ0FiSCxFQVZrRSxDQXlCbEU7O0VBQ0EsSUFBSSxDQUFDckIsc0JBQXNCLENBQUNDLE9BQUQsQ0FBM0IsRUFBc0M7SUFDbEMsb0JBQU8sb0JBQUMsaUJBQUQ7TUFBVSxjQUFjLEVBQUVLO0lBQTFCLEVBQVA7RUFDSDs7RUFFRCxJQUFJSSxPQUFKLEVBQWE7SUFDVCxvQkFBTyxvQkFBQyxxQkFBRDtNQUFjLFNBQVMsRUFBQyxhQUF4QjtNQUFzQyxHQUFHLEVBQUVBLE9BQTNDO01BQW9ELFNBQVMsRUFBRTtJQUEvRCxFQUFQO0VBQ0g7O0VBRUQsb0JBQU8sb0JBQUMsMEJBQUQ7SUFBbUIsU0FBUyxFQUFDO0VBQTdCLGdCQUNILG9CQUFDLDBDQUFEO0lBQXNCLE9BQU8sRUFBRVQ7RUFBL0IsRUFERyxFQUVEbUIsUUFBUSxpQkFDTixvQkFBQyxzQ0FBRDtJQUFvQixjQUFjLEVBQUVMLGNBQXBDO0lBQW9ELFlBQVksRUFBRUM7RUFBbEUsRUFIRCxDQUFQO0FBTUgifQ==