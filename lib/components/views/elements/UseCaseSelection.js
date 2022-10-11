"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UseCaseSelection = UseCaseSelection;

var _classnames = _interopRequireDefault(require("classnames"));

var _react = _interopRequireWildcard(require("react"));

var _languageHandler = require("../../../languageHandler");

var _UseCase = require("../../../settings/enums/UseCase");

var _SplashPage = _interopRequireDefault(require("../../structures/SplashPage"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _UseCaseSelectionButton = require("./UseCaseSelectionButton");

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
const TIMEOUT = 1500;

function UseCaseSelection(_ref) {
  let {
    onFinished
  } = _ref;
  const [selection, setSelected] = (0, _react.useState)(null); // Call onFinished 1.5s after `selection` becomes truthy, to give time for the animation to run

  (0, _react.useEffect)(() => {
    if (selection) {
      let handler = setTimeout(() => {
        handler = null;
        onFinished(selection);
      }, TIMEOUT);
      return () => {
        clearTimeout(handler);
        handler = null;
      };
    }
  }, [selection, onFinished]);
  return /*#__PURE__*/_react.default.createElement(_SplashPage.default, {
    className: (0, _classnames.default)("mx_UseCaseSelection", {
      "mx_UseCaseSelection_selected": selection !== null
    })
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UseCaseSelection_title mx_UseCaseSelection_slideIn"
  }, /*#__PURE__*/_react.default.createElement("h1", null, (0, _languageHandler._t)("You're in"))), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UseCaseSelection_info mx_UseCaseSelection_slideInDelayed"
  }, /*#__PURE__*/_react.default.createElement("h2", null, (0, _languageHandler._t)("Who will you chat to the most?")), /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("We'll help you get connected."))), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UseCaseSelection_options mx_UseCaseSelection_slideInDelayed"
  }, /*#__PURE__*/_react.default.createElement(_UseCaseSelectionButton.UseCaseSelectionButton, {
    useCase: _UseCase.UseCase.PersonalMessaging,
    selected: selection === _UseCase.UseCase.PersonalMessaging,
    onClick: setSelected
  }), /*#__PURE__*/_react.default.createElement(_UseCaseSelectionButton.UseCaseSelectionButton, {
    useCase: _UseCase.UseCase.WorkMessaging,
    selected: selection === _UseCase.UseCase.WorkMessaging,
    onClick: setSelected
  }), /*#__PURE__*/_react.default.createElement(_UseCaseSelectionButton.UseCaseSelectionButton, {
    useCase: _UseCase.UseCase.CommunityMessaging,
    selected: selection === _UseCase.UseCase.CommunityMessaging,
    onClick: setSelected
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UseCaseSelection_skip mx_UseCaseSelection_slideInDelayed"
  }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    kind: "link",
    onClick: async () => setSelected(_UseCase.UseCase.Skip)
  }, (0, _languageHandler._t)("Skip"))));
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUSU1FT1VUIiwiVXNlQ2FzZVNlbGVjdGlvbiIsIm9uRmluaXNoZWQiLCJzZWxlY3Rpb24iLCJzZXRTZWxlY3RlZCIsInVzZVN0YXRlIiwidXNlRWZmZWN0IiwiaGFuZGxlciIsInNldFRpbWVvdXQiLCJjbGVhclRpbWVvdXQiLCJjbGFzc05hbWVzIiwiX3QiLCJVc2VDYXNlIiwiUGVyc29uYWxNZXNzYWdpbmciLCJXb3JrTWVzc2FnaW5nIiwiQ29tbXVuaXR5TWVzc2FnaW5nIiwiU2tpcCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL1VzZUNhc2VTZWxlY3Rpb24udHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5pbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgeyBVc2VDYXNlIH0gZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL2VudW1zL1VzZUNhc2VcIjtcbmltcG9ydCBTcGxhc2hQYWdlIGZyb20gXCIuLi8uLi9zdHJ1Y3R1cmVzL1NwbGFzaFBhZ2VcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgeyBVc2VDYXNlU2VsZWN0aW9uQnV0dG9uIH0gZnJvbSBcIi4vVXNlQ2FzZVNlbGVjdGlvbkJ1dHRvblwiO1xuXG5pbnRlcmZhY2UgUHJvcHMge1xuICAgIG9uRmluaXNoZWQ6ICh1c2VDYXNlOiBVc2VDYXNlKSA9PiB2b2lkO1xufVxuXG5jb25zdCBUSU1FT1VUID0gMTUwMDtcblxuZXhwb3J0IGZ1bmN0aW9uIFVzZUNhc2VTZWxlY3Rpb24oeyBvbkZpbmlzaGVkIH06IFByb3BzKSB7XG4gICAgY29uc3QgW3NlbGVjdGlvbiwgc2V0U2VsZWN0ZWRdID0gdXNlU3RhdGU8VXNlQ2FzZSB8IG51bGw+KG51bGwpO1xuXG4gICAgLy8gQ2FsbCBvbkZpbmlzaGVkIDEuNXMgYWZ0ZXIgYHNlbGVjdGlvbmAgYmVjb21lcyB0cnV0aHksIHRvIGdpdmUgdGltZSBmb3IgdGhlIGFuaW1hdGlvbiB0byBydW5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAoc2VsZWN0aW9uKSB7XG4gICAgICAgICAgICBsZXQgaGFuZGxlcjogbnVtYmVyIHwgbnVsbCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGhhbmRsZXIgPSBudWxsO1xuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQoc2VsZWN0aW9uKTtcbiAgICAgICAgICAgIH0sIFRJTUVPVVQpO1xuICAgICAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoaGFuZGxlcik7XG4gICAgICAgICAgICAgICAgaGFuZGxlciA9IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfSwgW3NlbGVjdGlvbiwgb25GaW5pc2hlZF0pO1xuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPFNwbGFzaFBhZ2UgY2xhc3NOYW1lPXtjbGFzc05hbWVzKFxuICAgICAgICAgICAgXCJteF9Vc2VDYXNlU2VsZWN0aW9uXCIsIHtcbiAgICAgICAgICAgICAgICBcIm14X1VzZUNhc2VTZWxlY3Rpb25fc2VsZWN0ZWRcIjogc2VsZWN0aW9uICE9PSBudWxsLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgKX0+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZUNhc2VTZWxlY3Rpb25fdGl0bGUgbXhfVXNlQ2FzZVNlbGVjdGlvbl9zbGlkZUluXCI+XG4gICAgICAgICAgICAgICAgPGgxPnsgX3QoXCJZb3UncmUgaW5cIikgfTwvaDE+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlQ2FzZVNlbGVjdGlvbl9pbmZvIG14X1VzZUNhc2VTZWxlY3Rpb25fc2xpZGVJbkRlbGF5ZWRcIj5cbiAgICAgICAgICAgICAgICA8aDI+eyBfdChcIldobyB3aWxsIHlvdSBjaGF0IHRvIHRoZSBtb3N0P1wiKSB9PC9oMj5cbiAgICAgICAgICAgICAgICA8aDM+eyBfdChcIldlJ2xsIGhlbHAgeW91IGdldCBjb25uZWN0ZWQuXCIpIH08L2gzPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZUNhc2VTZWxlY3Rpb25fb3B0aW9ucyBteF9Vc2VDYXNlU2VsZWN0aW9uX3NsaWRlSW5EZWxheWVkXCI+XG4gICAgICAgICAgICAgICAgPFVzZUNhc2VTZWxlY3Rpb25CdXR0b25cbiAgICAgICAgICAgICAgICAgICAgdXNlQ2FzZT17VXNlQ2FzZS5QZXJzb25hbE1lc3NhZ2luZ31cbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQ9e3NlbGVjdGlvbiA9PT0gVXNlQ2FzZS5QZXJzb25hbE1lc3NhZ2luZ31cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17c2V0U2VsZWN0ZWR9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8VXNlQ2FzZVNlbGVjdGlvbkJ1dHRvblxuICAgICAgICAgICAgICAgICAgICB1c2VDYXNlPXtVc2VDYXNlLldvcmtNZXNzYWdpbmd9XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkPXtzZWxlY3Rpb24gPT09IFVzZUNhc2UuV29ya01lc3NhZ2luZ31cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17c2V0U2VsZWN0ZWR9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8VXNlQ2FzZVNlbGVjdGlvbkJ1dHRvblxuICAgICAgICAgICAgICAgICAgICB1c2VDYXNlPXtVc2VDYXNlLkNvbW11bml0eU1lc3NhZ2luZ31cbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQ9e3NlbGVjdGlvbiA9PT0gVXNlQ2FzZS5Db21tdW5pdHlNZXNzYWdpbmd9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3NldFNlbGVjdGVkfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlQ2FzZVNlbGVjdGlvbl9za2lwIG14X1VzZUNhc2VTZWxlY3Rpb25fc2xpZGVJbkRlbGF5ZWRcIj5cbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwibGlua1wiIG9uQ2xpY2s9e2FzeW5jICgpID0+IHNldFNlbGVjdGVkKFVzZUNhc2UuU2tpcCl9PlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiU2tpcFwiKSB9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvU3BsYXNoUGFnZT5cbiAgICApO1xufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQXZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFlQSxNQUFNQSxPQUFPLEdBQUcsSUFBaEI7O0FBRU8sU0FBU0MsZ0JBQVQsT0FBaUQ7RUFBQSxJQUF2QjtJQUFFQztFQUFGLENBQXVCO0VBQ3BELE1BQU0sQ0FBQ0MsU0FBRCxFQUFZQyxXQUFaLElBQTJCLElBQUFDLGVBQUEsRUFBeUIsSUFBekIsQ0FBakMsQ0FEb0QsQ0FHcEQ7O0VBQ0EsSUFBQUMsZ0JBQUEsRUFBVSxNQUFNO0lBQ1osSUFBSUgsU0FBSixFQUFlO01BQ1gsSUFBSUksT0FBc0IsR0FBR0MsVUFBVSxDQUFDLE1BQU07UUFDMUNELE9BQU8sR0FBRyxJQUFWO1FBQ0FMLFVBQVUsQ0FBQ0MsU0FBRCxDQUFWO01BQ0gsQ0FIc0MsRUFHcENILE9BSG9DLENBQXZDO01BSUEsT0FBTyxNQUFNO1FBQ1RTLFlBQVksQ0FBQ0YsT0FBRCxDQUFaO1FBQ0FBLE9BQU8sR0FBRyxJQUFWO01BQ0gsQ0FIRDtJQUlIO0VBQ0osQ0FYRCxFQVdHLENBQUNKLFNBQUQsRUFBWUQsVUFBWixDQVhIO0VBYUEsb0JBQ0ksNkJBQUMsbUJBQUQ7SUFBWSxTQUFTLEVBQUUsSUFBQVEsbUJBQUEsRUFDbkIscUJBRG1CLEVBQ0k7TUFDbkIsZ0NBQWdDUCxTQUFTLEtBQUs7SUFEM0IsQ0FESjtFQUF2QixnQkFLSTtJQUFLLFNBQVMsRUFBQztFQUFmLGdCQUNJLHlDQUFNLElBQUFRLG1CQUFBLEVBQUcsV0FBSCxDQUFOLENBREosQ0FMSixlQVFJO0lBQUssU0FBUyxFQUFDO0VBQWYsZ0JBQ0kseUNBQU0sSUFBQUEsbUJBQUEsRUFBRyxnQ0FBSCxDQUFOLENBREosZUFFSSx5Q0FBTSxJQUFBQSxtQkFBQSxFQUFHLCtCQUFILENBQU4sQ0FGSixDQVJKLGVBWUk7SUFBSyxTQUFTLEVBQUM7RUFBZixnQkFDSSw2QkFBQyw4Q0FBRDtJQUNJLE9BQU8sRUFBRUMsZ0JBQUEsQ0FBUUMsaUJBRHJCO0lBRUksUUFBUSxFQUFFVixTQUFTLEtBQUtTLGdCQUFBLENBQVFDLGlCQUZwQztJQUdJLE9BQU8sRUFBRVQ7RUFIYixFQURKLGVBTUksNkJBQUMsOENBQUQ7SUFDSSxPQUFPLEVBQUVRLGdCQUFBLENBQVFFLGFBRHJCO0lBRUksUUFBUSxFQUFFWCxTQUFTLEtBQUtTLGdCQUFBLENBQVFFLGFBRnBDO0lBR0ksT0FBTyxFQUFFVjtFQUhiLEVBTkosZUFXSSw2QkFBQyw4Q0FBRDtJQUNJLE9BQU8sRUFBRVEsZ0JBQUEsQ0FBUUcsa0JBRHJCO0lBRUksUUFBUSxFQUFFWixTQUFTLEtBQUtTLGdCQUFBLENBQVFHLGtCQUZwQztJQUdJLE9BQU8sRUFBRVg7RUFIYixFQVhKLENBWkosZUE2Qkk7SUFBSyxTQUFTLEVBQUM7RUFBZixnQkFDSSw2QkFBQyx5QkFBRDtJQUFrQixJQUFJLEVBQUMsTUFBdkI7SUFBOEIsT0FBTyxFQUFFLFlBQVlBLFdBQVcsQ0FBQ1EsZ0JBQUEsQ0FBUUksSUFBVDtFQUE5RCxHQUNNLElBQUFMLG1CQUFBLEVBQUcsTUFBSCxDQUROLENBREosQ0E3QkosQ0FESjtBQXFDSCJ9