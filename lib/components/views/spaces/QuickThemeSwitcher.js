"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _languageHandler = require("../../../languageHandler");

var _actions = require("../../../dispatcher/actions");

var _theme = require("../../../theme");

var _Dropdown = _interopRequireDefault(require("../elements/Dropdown"));

var _ThemeChoicePanel = _interopRequireDefault(require("../settings/ThemeChoicePanel"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _SettingLevel = require("../../../settings/SettingLevel");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _PosthogTrackers = _interopRequireDefault(require("../../../PosthogTrackers"));

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
const MATCH_SYSTEM_THEME_ID = 'MATCH_SYSTEM_THEME_ID';

const QuickThemeSwitcher = _ref => {
  let {
    requestClose
  } = _ref;
  const orderedThemes = (0, _react.useMemo)(_theme.getOrderedThemes, []);

  const themeState = _ThemeChoicePanel.default.calculateThemeState();

  const nonHighContrast = (0, _theme.findNonHighContrastTheme)(themeState.theme);
  const theme = nonHighContrast ? nonHighContrast : themeState.theme;
  const {
    useSystemTheme
  } = themeState;
  const themeOptions = [{
    id: MATCH_SYSTEM_THEME_ID,
    name: (0, _languageHandler._t)("Match system")
  }, ...orderedThemes];
  const selectedTheme = useSystemTheme ? MATCH_SYSTEM_THEME_ID : theme;

  const onOptionChange = async newTheme => {
    _PosthogTrackers.default.trackInteraction("WebQuickSettingsThemeDropdown");

    try {
      if (newTheme === MATCH_SYSTEM_THEME_ID) {
        await _SettingsStore.default.setValue("use_system_theme", null, _SettingLevel.SettingLevel.DEVICE, true);
      } else {
        // The settings watcher doesn't fire until the echo comes back from the
        // server, so to make the theme change immediately we need to manually
        // do the dispatch now
        // XXX: The local echoed value appears to be unreliable, in particular
        // when settings custom themes(!) so adding forceTheme to override
        // the value from settings.
        _dispatcher.default.dispatch({
          action: _actions.Action.RecheckTheme,
          forceTheme: newTheme
        });

        await Promise.all([_SettingsStore.default.setValue("theme", null, _SettingLevel.SettingLevel.DEVICE, newTheme), _SettingsStore.default.setValue("use_system_theme", null, _SettingLevel.SettingLevel.DEVICE, false)]);
      }
    } catch (_error) {
      _dispatcher.default.dispatch({
        action: _actions.Action.RecheckTheme
      });
    }

    requestClose();
  };

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_QuickThemeSwitcher"
  }, /*#__PURE__*/_react.default.createElement("h4", {
    className: "mx_QuickThemeSwitcher_heading"
  }, (0, _languageHandler._t)("Theme")), /*#__PURE__*/_react.default.createElement(_Dropdown.default, {
    id: "mx_QuickSettingsButton_themePickerDropdown",
    onOptionChange: onOptionChange,
    value: selectedTheme,
    label: (0, _languageHandler._t)("Space selection")
  }, themeOptions.map(theme => /*#__PURE__*/_react.default.createElement("div", {
    key: theme.id
  }, theme.name))));
};

var _default = QuickThemeSwitcher;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNQVRDSF9TWVNURU1fVEhFTUVfSUQiLCJRdWlja1RoZW1lU3dpdGNoZXIiLCJyZXF1ZXN0Q2xvc2UiLCJvcmRlcmVkVGhlbWVzIiwidXNlTWVtbyIsImdldE9yZGVyZWRUaGVtZXMiLCJ0aGVtZVN0YXRlIiwiVGhlbWVDaG9pY2VQYW5lbCIsImNhbGN1bGF0ZVRoZW1lU3RhdGUiLCJub25IaWdoQ29udHJhc3QiLCJmaW5kTm9uSGlnaENvbnRyYXN0VGhlbWUiLCJ0aGVtZSIsInVzZVN5c3RlbVRoZW1lIiwidGhlbWVPcHRpb25zIiwiaWQiLCJuYW1lIiwiX3QiLCJzZWxlY3RlZFRoZW1lIiwib25PcHRpb25DaGFuZ2UiLCJuZXdUaGVtZSIsIlBvc3Rob2dUcmFja2VycyIsInRyYWNrSW50ZXJhY3Rpb24iLCJTZXR0aW5nc1N0b3JlIiwic2V0VmFsdWUiLCJTZXR0aW5nTGV2ZWwiLCJERVZJQ0UiLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsIkFjdGlvbiIsIlJlY2hlY2tUaGVtZSIsImZvcmNlVGhlbWUiLCJQcm9taXNlIiwiYWxsIiwiX2Vycm9yIiwibWFwIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3Mvc3BhY2VzL1F1aWNrVGhlbWVTd2l0Y2hlci50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIyIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IHVzZU1lbW8gfSBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQgeyBmaW5kTm9uSGlnaENvbnRyYXN0VGhlbWUsIGdldE9yZGVyZWRUaGVtZXMgfSBmcm9tIFwiLi4vLi4vLi4vdGhlbWVcIjtcbmltcG9ydCBEcm9wZG93biBmcm9tIFwiLi4vZWxlbWVudHMvRHJvcGRvd25cIjtcbmltcG9ydCBUaGVtZUNob2ljZVBhbmVsIGZyb20gXCIuLi9zZXR0aW5ncy9UaGVtZUNob2ljZVBhbmVsXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHsgU2V0dGluZ0xldmVsIH0gZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdMZXZlbFwiO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgeyBSZWNoZWNrVGhlbWVQYXlsb2FkIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvUmVjaGVja1RoZW1lUGF5bG9hZFwiO1xuaW1wb3J0IFBvc3Rob2dUcmFja2VycyBmcm9tIFwiLi4vLi4vLi4vUG9zdGhvZ1RyYWNrZXJzXCI7XG5cbnR5cGUgUHJvcHMgPSB7XG4gICAgcmVxdWVzdENsb3NlOiAoKSA9PiB2b2lkO1xufTtcblxuY29uc3QgTUFUQ0hfU1lTVEVNX1RIRU1FX0lEID0gJ01BVENIX1NZU1RFTV9USEVNRV9JRCc7XG5cbmNvbnN0IFF1aWNrVGhlbWVTd2l0Y2hlcjogUmVhY3QuRkM8UHJvcHM+ID0gKHsgcmVxdWVzdENsb3NlIH0pID0+IHtcbiAgICBjb25zdCBvcmRlcmVkVGhlbWVzID0gdXNlTWVtbyhnZXRPcmRlcmVkVGhlbWVzLCBbXSk7XG5cbiAgICBjb25zdCB0aGVtZVN0YXRlID0gVGhlbWVDaG9pY2VQYW5lbC5jYWxjdWxhdGVUaGVtZVN0YXRlKCk7XG4gICAgY29uc3Qgbm9uSGlnaENvbnRyYXN0ID0gZmluZE5vbkhpZ2hDb250cmFzdFRoZW1lKHRoZW1lU3RhdGUudGhlbWUpO1xuICAgIGNvbnN0IHRoZW1lID0gbm9uSGlnaENvbnRyYXN0ID8gbm9uSGlnaENvbnRyYXN0IDogdGhlbWVTdGF0ZS50aGVtZTtcbiAgICBjb25zdCB7IHVzZVN5c3RlbVRoZW1lIH0gPSB0aGVtZVN0YXRlO1xuXG4gICAgY29uc3QgdGhlbWVPcHRpb25zID0gW3tcbiAgICAgICAgaWQ6IE1BVENIX1NZU1RFTV9USEVNRV9JRCxcbiAgICAgICAgbmFtZTogX3QoXCJNYXRjaCBzeXN0ZW1cIiksXG4gICAgfSwgLi4ub3JkZXJlZFRoZW1lc107XG5cbiAgICBjb25zdCBzZWxlY3RlZFRoZW1lID0gdXNlU3lzdGVtVGhlbWUgPyBNQVRDSF9TWVNURU1fVEhFTUVfSUQgOiB0aGVtZTtcblxuICAgIGNvbnN0IG9uT3B0aW9uQ2hhbmdlID0gYXN5bmMgKG5ld1RoZW1lOiBzdHJpbmcpID0+IHtcbiAgICAgICAgUG9zdGhvZ1RyYWNrZXJzLnRyYWNrSW50ZXJhY3Rpb24oXCJXZWJRdWlja1NldHRpbmdzVGhlbWVEcm9wZG93blwiKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKG5ld1RoZW1lID09PSBNQVRDSF9TWVNURU1fVEhFTUVfSUQpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBTZXR0aW5nc1N0b3JlLnNldFZhbHVlKFwidXNlX3N5c3RlbV90aGVtZVwiLCBudWxsLCBTZXR0aW5nTGV2ZWwuREVWSUNFLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gVGhlIHNldHRpbmdzIHdhdGNoZXIgZG9lc24ndCBmaXJlIHVudGlsIHRoZSBlY2hvIGNvbWVzIGJhY2sgZnJvbSB0aGVcbiAgICAgICAgICAgICAgICAvLyBzZXJ2ZXIsIHNvIHRvIG1ha2UgdGhlIHRoZW1lIGNoYW5nZSBpbW1lZGlhdGVseSB3ZSBuZWVkIHRvIG1hbnVhbGx5XG4gICAgICAgICAgICAgICAgLy8gZG8gdGhlIGRpc3BhdGNoIG5vd1xuICAgICAgICAgICAgICAgIC8vIFhYWDogVGhlIGxvY2FsIGVjaG9lZCB2YWx1ZSBhcHBlYXJzIHRvIGJlIHVucmVsaWFibGUsIGluIHBhcnRpY3VsYXJcbiAgICAgICAgICAgICAgICAvLyB3aGVuIHNldHRpbmdzIGN1c3RvbSB0aGVtZXMoISkgc28gYWRkaW5nIGZvcmNlVGhlbWUgdG8gb3ZlcnJpZGVcbiAgICAgICAgICAgICAgICAvLyB0aGUgdmFsdWUgZnJvbSBzZXR0aW5ncy5cbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2g8UmVjaGVja1RoZW1lUGF5bG9hZD4oeyBhY3Rpb246IEFjdGlvbi5SZWNoZWNrVGhlbWUsIGZvcmNlVGhlbWU6IG5ld1RoZW1lIH0pO1xuICAgICAgICAgICAgICAgIGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZShcInRoZW1lXCIsIG51bGwsIFNldHRpbmdMZXZlbC5ERVZJQ0UsIG5ld1RoZW1lKSxcbiAgICAgICAgICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZShcInVzZV9zeXN0ZW1fdGhlbWVcIiwgbnVsbCwgU2V0dGluZ0xldmVsLkRFVklDRSwgZmFsc2UpLFxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChfZXJyb3IpIHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaDxSZWNoZWNrVGhlbWVQYXlsb2FkPih7IGFjdGlvbjogQWN0aW9uLlJlY2hlY2tUaGVtZSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlcXVlc3RDbG9zZSgpO1xuICAgIH07XG5cbiAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9RdWlja1RoZW1lU3dpdGNoZXJcIj5cbiAgICAgICAgPGg0IGNsYXNzTmFtZT1cIm14X1F1aWNrVGhlbWVTd2l0Y2hlcl9oZWFkaW5nXCI+eyBfdChcIlRoZW1lXCIpIH08L2g0PlxuICAgICAgICA8RHJvcGRvd25cbiAgICAgICAgICAgIGlkPVwibXhfUXVpY2tTZXR0aW5nc0J1dHRvbl90aGVtZVBpY2tlckRyb3Bkb3duXCJcbiAgICAgICAgICAgIG9uT3B0aW9uQ2hhbmdlPXtvbk9wdGlvbkNoYW5nZX1cbiAgICAgICAgICAgIHZhbHVlPXtzZWxlY3RlZFRoZW1lfVxuICAgICAgICAgICAgbGFiZWw9e190KFwiU3BhY2Ugc2VsZWN0aW9uXCIpfVxuICAgICAgICA+XG4gICAgICAgICAgICB7IHRoZW1lT3B0aW9ucy5tYXAoKHRoZW1lKSA9PiAoXG4gICAgICAgICAgICAgICAgPGRpdiBrZXk9e3RoZW1lLmlkfT5cbiAgICAgICAgICAgICAgICAgICAgeyB0aGVtZS5uYW1lIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICkpIH1cbiAgICAgICAgPC9Ecm9wZG93bj5cbiAgICA8L2Rpdj47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBRdWlja1RoZW1lU3dpdGNoZXI7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWdCQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7Ozs7O0FBM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQW1CQSxNQUFNQSxxQkFBcUIsR0FBRyx1QkFBOUI7O0FBRUEsTUFBTUMsa0JBQW1DLEdBQUcsUUFBc0I7RUFBQSxJQUFyQjtJQUFFQztFQUFGLENBQXFCO0VBQzlELE1BQU1DLGFBQWEsR0FBRyxJQUFBQyxjQUFBLEVBQVFDLHVCQUFSLEVBQTBCLEVBQTFCLENBQXRCOztFQUVBLE1BQU1DLFVBQVUsR0FBR0MseUJBQUEsQ0FBaUJDLG1CQUFqQixFQUFuQjs7RUFDQSxNQUFNQyxlQUFlLEdBQUcsSUFBQUMsK0JBQUEsRUFBeUJKLFVBQVUsQ0FBQ0ssS0FBcEMsQ0FBeEI7RUFDQSxNQUFNQSxLQUFLLEdBQUdGLGVBQWUsR0FBR0EsZUFBSCxHQUFxQkgsVUFBVSxDQUFDSyxLQUE3RDtFQUNBLE1BQU07SUFBRUM7RUFBRixJQUFxQk4sVUFBM0I7RUFFQSxNQUFNTyxZQUFZLEdBQUcsQ0FBQztJQUNsQkMsRUFBRSxFQUFFZCxxQkFEYztJQUVsQmUsSUFBSSxFQUFFLElBQUFDLG1CQUFBLEVBQUcsY0FBSDtFQUZZLENBQUQsRUFHbEIsR0FBR2IsYUFIZSxDQUFyQjtFQUtBLE1BQU1jLGFBQWEsR0FBR0wsY0FBYyxHQUFHWixxQkFBSCxHQUEyQlcsS0FBL0Q7O0VBRUEsTUFBTU8sY0FBYyxHQUFHLE1BQU9DLFFBQVAsSUFBNEI7SUFDL0NDLHdCQUFBLENBQWdCQyxnQkFBaEIsQ0FBaUMsK0JBQWpDOztJQUVBLElBQUk7TUFDQSxJQUFJRixRQUFRLEtBQUtuQixxQkFBakIsRUFBd0M7UUFDcEMsTUFBTXNCLHNCQUFBLENBQWNDLFFBQWQsQ0FBdUIsa0JBQXZCLEVBQTJDLElBQTNDLEVBQWlEQywwQkFBQSxDQUFhQyxNQUE5RCxFQUFzRSxJQUF0RSxDQUFOO01BQ0gsQ0FGRCxNQUVPO1FBQ0g7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0FDLG1CQUFBLENBQUlDLFFBQUosQ0FBa0M7VUFBRUMsTUFBTSxFQUFFQyxlQUFBLENBQU9DLFlBQWpCO1VBQStCQyxVQUFVLEVBQUVaO1FBQTNDLENBQWxDOztRQUNBLE1BQU1hLE9BQU8sQ0FBQ0MsR0FBUixDQUFZLENBQ2RYLHNCQUFBLENBQWNDLFFBQWQsQ0FBdUIsT0FBdkIsRUFBZ0MsSUFBaEMsRUFBc0NDLDBCQUFBLENBQWFDLE1BQW5ELEVBQTJETixRQUEzRCxDQURjLEVBRWRHLHNCQUFBLENBQWNDLFFBQWQsQ0FBdUIsa0JBQXZCLEVBQTJDLElBQTNDLEVBQWlEQywwQkFBQSxDQUFhQyxNQUE5RCxFQUFzRSxLQUF0RSxDQUZjLENBQVosQ0FBTjtNQUlIO0lBQ0osQ0FoQkQsQ0FnQkUsT0FBT1MsTUFBUCxFQUFlO01BQ2JSLG1CQUFBLENBQUlDLFFBQUosQ0FBa0M7UUFBRUMsTUFBTSxFQUFFQyxlQUFBLENBQU9DO01BQWpCLENBQWxDO0lBQ0g7O0lBRUQ1QixZQUFZO0VBQ2YsQ0F4QkQ7O0VBMEJBLG9CQUFPO0lBQUssU0FBUyxFQUFDO0VBQWYsZ0JBQ0g7SUFBSSxTQUFTLEVBQUM7RUFBZCxHQUFnRCxJQUFBYyxtQkFBQSxFQUFHLE9BQUgsQ0FBaEQsQ0FERyxlQUVILDZCQUFDLGlCQUFEO0lBQ0ksRUFBRSxFQUFDLDRDQURQO0lBRUksY0FBYyxFQUFFRSxjQUZwQjtJQUdJLEtBQUssRUFBRUQsYUFIWDtJQUlJLEtBQUssRUFBRSxJQUFBRCxtQkFBQSxFQUFHLGlCQUFIO0VBSlgsR0FNTUgsWUFBWSxDQUFDc0IsR0FBYixDQUFrQnhCLEtBQUQsaUJBQ2Y7SUFBSyxHQUFHLEVBQUVBLEtBQUssQ0FBQ0c7RUFBaEIsR0FDTUgsS0FBSyxDQUFDSSxJQURaLENBREYsQ0FOTixDQUZHLENBQVA7QUFlSCxDQXhERDs7ZUEwRGVkLGtCIn0=