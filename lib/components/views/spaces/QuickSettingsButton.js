"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _languageHandler = require("../../../languageHandler");

var _AccessibleTooltipButton = _interopRequireDefault(require("../elements/AccessibleTooltipButton"));

var _ContextMenu = _interopRequireWildcard(require("../../structures/ContextMenu"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _StyledCheckbox = _interopRequireDefault(require("../elements/StyledCheckbox"));

var _spaces = require("../../../stores/spaces");

var _useSettings = require("../../../hooks/useSettings");

var _SidebarUserSettingsTab = require("../settings/tabs/user/SidebarUserSettingsTab");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _actions = require("../../../dispatcher/actions");

var _UserTab = require("../dialogs/UserTab");

var _QuickThemeSwitcher = _interopRequireDefault(require("./QuickThemeSwitcher"));

var _pinUpright = require("../../../../res/img/element-icons/room/pin-upright.svg");

var _ellipsis = require("../../../../res/img/element-icons/room/ellipsis.svg");

var _members = require("../../../../res/img/element-icons/room/members.svg");

var _favorite = require("../../../../res/img/element-icons/roomlist/favorite.svg");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _DevtoolsDialog = _interopRequireDefault(require("../dialogs/DevtoolsDialog"));

var _RoomViewStore = require("../../../stores/RoomViewStore");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2021 The Matrix.org Foundation C.I.C.

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
const QuickSettingsButton = _ref => {
  let {
    isPanelCollapsed = false
  } = _ref;
  const [menuDisplayed, handle, openMenu, closeMenu] = (0, _ContextMenu.useContextMenu)();
  const {
    [_spaces.MetaSpace.Favourites]: favouritesEnabled,
    [_spaces.MetaSpace.People]: peopleEnabled
  } = (0, _useSettings.useSettingValue)("Spaces.enabledMetaSpaces");
  let contextMenu;

  if (menuDisplayed) {
    contextMenu = /*#__PURE__*/_react.default.createElement(_ContextMenu.default, (0, _extends2.default)({}, (0, _ContextMenu.alwaysAboveRightOf)(handle.current.getBoundingClientRect(), _ContextMenu.ChevronFace.None, 16), {
      wrapperClassName: "mx_QuickSettingsButton_ContextMenuWrapper",
      onFinished: closeMenu,
      managed: false,
      focusLock: true
    }), /*#__PURE__*/_react.default.createElement("h2", null, (0, _languageHandler._t)("Quick settings")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: () => {
        closeMenu();

        _dispatcher.default.dispatch({
          action: _actions.Action.ViewUserSettings
        });
      },
      kind: "primary_outline"
    }, (0, _languageHandler._t)("All settings")), _SettingsStore.default.getValue("developerMode") && /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: () => {
        closeMenu();

        _Modal.default.createDialog(_DevtoolsDialog.default, {
          roomId: _RoomViewStore.RoomViewStore.instance.getRoomId()
        }, "mx_DevtoolsDialog_wrapper");
      },
      kind: "danger_outline"
    }, (0, _languageHandler._t)("Developer tools")), /*#__PURE__*/_react.default.createElement("h4", {
      className: "mx_QuickSettingsButton_pinToSidebarHeading"
    }, /*#__PURE__*/_react.default.createElement(_pinUpright.Icon, {
      className: "mx_QuickSettingsButton_icon"
    }), (0, _languageHandler._t)("Pin to sidebar")), /*#__PURE__*/_react.default.createElement(_StyledCheckbox.default, {
      className: "mx_QuickSettingsButton_favouritesCheckbox",
      checked: !!favouritesEnabled,
      onChange: (0, _SidebarUserSettingsTab.onMetaSpaceChangeFactory)(_spaces.MetaSpace.Favourites, "WebQuickSettingsPinToSidebarCheckbox")
    }, /*#__PURE__*/_react.default.createElement(_favorite.Icon, {
      className: "mx_QuickSettingsButton_icon"
    }), (0, _languageHandler._t)("Favourites")), /*#__PURE__*/_react.default.createElement(_StyledCheckbox.default, {
      className: "mx_QuickSettingsButton_peopleCheckbox",
      checked: !!peopleEnabled,
      onChange: (0, _SidebarUserSettingsTab.onMetaSpaceChangeFactory)(_spaces.MetaSpace.People, "WebQuickSettingsPinToSidebarCheckbox")
    }, /*#__PURE__*/_react.default.createElement(_members.Icon, {
      className: "mx_QuickSettingsButton_icon"
    }), (0, _languageHandler._t)("People")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_QuickSettingsButton_moreOptionsButton",
      onClick: () => {
        closeMenu();

        _dispatcher.default.dispatch({
          action: _actions.Action.ViewUserSettings,
          initialTabId: _UserTab.UserTab.Sidebar
        });
      }
    }, /*#__PURE__*/_react.default.createElement(_ellipsis.Icon, {
      className: "mx_QuickSettingsButton_icon"
    }), (0, _languageHandler._t)("More options")), /*#__PURE__*/_react.default.createElement(_QuickThemeSwitcher.default, {
      requestClose: closeMenu
    }));
  }

  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
    className: (0, _classnames.default)("mx_QuickSettingsButton", {
      expanded: !isPanelCollapsed
    }),
    onClick: openMenu,
    title: (0, _languageHandler._t)("Quick settings"),
    inputRef: handle,
    forceHide: !isPanelCollapsed
  }, !isPanelCollapsed ? (0, _languageHandler._t)("Settings") : null), contextMenu);
};

var _default = QuickSettingsButton;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJRdWlja1NldHRpbmdzQnV0dG9uIiwiaXNQYW5lbENvbGxhcHNlZCIsIm1lbnVEaXNwbGF5ZWQiLCJoYW5kbGUiLCJvcGVuTWVudSIsImNsb3NlTWVudSIsInVzZUNvbnRleHRNZW51IiwiTWV0YVNwYWNlIiwiRmF2b3VyaXRlcyIsImZhdm91cml0ZXNFbmFibGVkIiwiUGVvcGxlIiwicGVvcGxlRW5hYmxlZCIsInVzZVNldHRpbmdWYWx1ZSIsImNvbnRleHRNZW51IiwiYWx3YXlzQWJvdmVSaWdodE9mIiwiY3VycmVudCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsIkNoZXZyb25GYWNlIiwiTm9uZSIsIl90IiwiZGVmYXVsdERpc3BhdGNoZXIiLCJkaXNwYXRjaCIsImFjdGlvbiIsIkFjdGlvbiIsIlZpZXdVc2VyU2V0dGluZ3MiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIkRldnRvb2xzRGlhbG9nIiwicm9vbUlkIiwiUm9vbVZpZXdTdG9yZSIsImluc3RhbmNlIiwiZ2V0Um9vbUlkIiwib25NZXRhU3BhY2VDaGFuZ2VGYWN0b3J5IiwiaW5pdGlhbFRhYklkIiwiVXNlclRhYiIsIlNpZGViYXIiLCJjbGFzc05hbWVzIiwiZXhwYW5kZWQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9zcGFjZXMvUXVpY2tTZXR0aW5nc0J1dHRvbi50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSBcImNsYXNzbmFtZXNcIjtcblxuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVUb29sdGlwQnV0dG9uXCI7XG5pbXBvcnQgQ29udGV4dE1lbnUsIHsgYWx3YXlzQWJvdmVSaWdodE9mLCBDaGV2cm9uRmFjZSwgdXNlQ29udGV4dE1lbnUgfSBmcm9tIFwiLi4vLi4vc3RydWN0dXJlcy9Db250ZXh0TWVudVwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBTdHlsZWRDaGVja2JveCBmcm9tIFwiLi4vZWxlbWVudHMvU3R5bGVkQ2hlY2tib3hcIjtcbmltcG9ydCB7IE1ldGFTcGFjZSB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvc3BhY2VzXCI7XG5pbXBvcnQgeyB1c2VTZXR0aW5nVmFsdWUgfSBmcm9tIFwiLi4vLi4vLi4vaG9va3MvdXNlU2V0dGluZ3NcIjtcbmltcG9ydCB7IG9uTWV0YVNwYWNlQ2hhbmdlRmFjdG9yeSB9IGZyb20gXCIuLi9zZXR0aW5ncy90YWJzL3VzZXIvU2lkZWJhclVzZXJTZXR0aW5nc1RhYlwiO1xuaW1wb3J0IGRlZmF1bHREaXNwYXRjaGVyIGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcbmltcG9ydCB7IFVzZXJUYWIgfSBmcm9tIFwiLi4vZGlhbG9ncy9Vc2VyVGFiXCI7XG5pbXBvcnQgUXVpY2tUaGVtZVN3aXRjaGVyIGZyb20gXCIuL1F1aWNrVGhlbWVTd2l0Y2hlclwiO1xuaW1wb3J0IHsgSWNvbiBhcyBQaW5VcHJpZ2h0SWNvbiB9IGZyb20gJy4uLy4uLy4uLy4uL3Jlcy9pbWcvZWxlbWVudC1pY29ucy9yb29tL3Bpbi11cHJpZ2h0LnN2Zyc7XG5pbXBvcnQgeyBJY29uIGFzIEVsbGlwc2lzSWNvbiB9IGZyb20gJy4uLy4uLy4uLy4uL3Jlcy9pbWcvZWxlbWVudC1pY29ucy9yb29tL2VsbGlwc2lzLnN2Zyc7XG5pbXBvcnQgeyBJY29uIGFzIE1lbWJlcnNJY29uIH0gZnJvbSAnLi4vLi4vLi4vLi4vcmVzL2ltZy9lbGVtZW50LWljb25zL3Jvb20vbWVtYmVycy5zdmcnO1xuaW1wb3J0IHsgSWNvbiBhcyBGYXZvcml0ZUljb24gfSBmcm9tICcuLi8uLi8uLi8uLi9yZXMvaW1nL2VsZW1lbnQtaWNvbnMvcm9vbWxpc3QvZmF2b3JpdGUuc3ZnJztcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgTW9kYWwgZnJvbSBcIi4uLy4uLy4uL01vZGFsXCI7XG5pbXBvcnQgRGV2dG9vbHNEaWFsb2cgZnJvbSBcIi4uL2RpYWxvZ3MvRGV2dG9vbHNEaWFsb2dcIjtcbmltcG9ydCB7IFJvb21WaWV3U3RvcmUgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL1Jvb21WaWV3U3RvcmVcIjtcblxuY29uc3QgUXVpY2tTZXR0aW5nc0J1dHRvbiA9ICh7IGlzUGFuZWxDb2xsYXBzZWQgPSBmYWxzZSB9KSA9PiB7XG4gICAgY29uc3QgW21lbnVEaXNwbGF5ZWQsIGhhbmRsZSwgb3Blbk1lbnUsIGNsb3NlTWVudV0gPSB1c2VDb250ZXh0TWVudTxIVE1MRGl2RWxlbWVudD4oKTtcblxuICAgIGNvbnN0IHtcbiAgICAgICAgW01ldGFTcGFjZS5GYXZvdXJpdGVzXTogZmF2b3VyaXRlc0VuYWJsZWQsXG4gICAgICAgIFtNZXRhU3BhY2UuUGVvcGxlXTogcGVvcGxlRW5hYmxlZCxcbiAgICB9ID0gdXNlU2V0dGluZ1ZhbHVlPFJlY29yZDxNZXRhU3BhY2UsIGJvb2xlYW4+PihcIlNwYWNlcy5lbmFibGVkTWV0YVNwYWNlc1wiKTtcblxuICAgIGxldCBjb250ZXh0TWVudTogSlNYLkVsZW1lbnQ7XG4gICAgaWYgKG1lbnVEaXNwbGF5ZWQpIHtcbiAgICAgICAgY29udGV4dE1lbnUgPSA8Q29udGV4dE1lbnVcbiAgICAgICAgICAgIHsuLi5hbHdheXNBYm92ZVJpZ2h0T2YoaGFuZGxlLmN1cnJlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksIENoZXZyb25GYWNlLk5vbmUsIDE2KX1cbiAgICAgICAgICAgIHdyYXBwZXJDbGFzc05hbWU9XCJteF9RdWlja1NldHRpbmdzQnV0dG9uX0NvbnRleHRNZW51V3JhcHBlclwiXG4gICAgICAgICAgICBvbkZpbmlzaGVkPXtjbG9zZU1lbnV9XG4gICAgICAgICAgICBtYW5hZ2VkPXtmYWxzZX1cbiAgICAgICAgICAgIGZvY3VzTG9jaz17dHJ1ZX1cbiAgICAgICAgPlxuICAgICAgICAgICAgPGgyPnsgX3QoXCJRdWljayBzZXR0aW5nc1wiKSB9PC9oMj5cblxuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNsb3NlTWVudSgpO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci5kaXNwYXRjaCh7IGFjdGlvbjogQWN0aW9uLlZpZXdVc2VyU2V0dGluZ3MgfSk7XG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBraW5kPVwicHJpbWFyeV9vdXRsaW5lXCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IF90KFwiQWxsIHNldHRpbmdzXCIpIH1cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cblxuICAgICAgICAgICAgeyBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZGV2ZWxvcGVyTW9kZVwiKSAmJiAoXG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VNZW51KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRGV2dG9vbHNEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb29tSWQ6IFJvb21WaWV3U3RvcmUuaW5zdGFuY2UuZ2V0Um9vbUlkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBcIm14X0RldnRvb2xzRGlhbG9nX3dyYXBwZXJcIik7XG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJkYW5nZXJfb3V0bGluZVwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiRGV2ZWxvcGVyIHRvb2xzXCIpIH1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICApIH1cblxuICAgICAgICAgICAgPGg0IGNsYXNzTmFtZT1cIm14X1F1aWNrU2V0dGluZ3NCdXR0b25fcGluVG9TaWRlYmFySGVhZGluZ1wiPlxuICAgICAgICAgICAgICAgIDxQaW5VcHJpZ2h0SWNvbiBjbGFzc05hbWU9XCJteF9RdWlja1NldHRpbmdzQnV0dG9uX2ljb25cIiAvPlxuICAgICAgICAgICAgICAgIHsgX3QoXCJQaW4gdG8gc2lkZWJhclwiKSB9XG4gICAgICAgICAgICA8L2g0PlxuXG4gICAgICAgICAgICA8U3R5bGVkQ2hlY2tib3hcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9RdWlja1NldHRpbmdzQnV0dG9uX2Zhdm91cml0ZXNDaGVja2JveFwiXG4gICAgICAgICAgICAgICAgY2hlY2tlZD17ISFmYXZvdXJpdGVzRW5hYmxlZH1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17b25NZXRhU3BhY2VDaGFuZ2VGYWN0b3J5KE1ldGFTcGFjZS5GYXZvdXJpdGVzLCBcIldlYlF1aWNrU2V0dGluZ3NQaW5Ub1NpZGViYXJDaGVja2JveFwiKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8RmF2b3JpdGVJY29uIGNsYXNzTmFtZT1cIm14X1F1aWNrU2V0dGluZ3NCdXR0b25faWNvblwiIC8+XG4gICAgICAgICAgICAgICAgeyBfdChcIkZhdm91cml0ZXNcIikgfVxuICAgICAgICAgICAgPC9TdHlsZWRDaGVja2JveD5cbiAgICAgICAgICAgIDxTdHlsZWRDaGVja2JveFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1F1aWNrU2V0dGluZ3NCdXR0b25fcGVvcGxlQ2hlY2tib3hcIlxuICAgICAgICAgICAgICAgIGNoZWNrZWQ9eyEhcGVvcGxlRW5hYmxlZH1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17b25NZXRhU3BhY2VDaGFuZ2VGYWN0b3J5KE1ldGFTcGFjZS5QZW9wbGUsIFwiV2ViUXVpY2tTZXR0aW5nc1BpblRvU2lkZWJhckNoZWNrYm94XCIpfVxuICAgICAgICAgICAgPlxuXG4gICAgICAgICAgICAgICAgPE1lbWJlcnNJY29uIGNsYXNzTmFtZT1cIm14X1F1aWNrU2V0dGluZ3NCdXR0b25faWNvblwiIC8+XG4gICAgICAgICAgICAgICAgeyBfdChcIlBlb3BsZVwiKSB9XG4gICAgICAgICAgICA8L1N0eWxlZENoZWNrYm94PlxuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9RdWlja1NldHRpbmdzQnV0dG9uX21vcmVPcHRpb25zQnV0dG9uXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNsb3NlTWVudSgpO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5WaWV3VXNlclNldHRpbmdzLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbFRhYklkOiBVc2VyVGFiLlNpZGViYXIsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPEVsbGlwc2lzSWNvbiBjbGFzc05hbWU9XCJteF9RdWlja1NldHRpbmdzQnV0dG9uX2ljb25cIiAvPlxuICAgICAgICAgICAgICAgIHsgX3QoXCJNb3JlIG9wdGlvbnNcIikgfVxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuXG4gICAgICAgICAgICA8UXVpY2tUaGVtZVN3aXRjaGVyIHJlcXVlc3RDbG9zZT17Y2xvc2VNZW51fSAvPlxuICAgICAgICA8L0NvbnRleHRNZW51PjtcbiAgICB9XG5cbiAgICByZXR1cm4gPD5cbiAgICAgICAgPEFjY2Vzc2libGVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZXMoXCJteF9RdWlja1NldHRpbmdzQnV0dG9uXCIsIHsgZXhwYW5kZWQ6ICFpc1BhbmVsQ29sbGFwc2VkIH0pfVxuICAgICAgICAgICAgb25DbGljaz17b3Blbk1lbnV9XG4gICAgICAgICAgICB0aXRsZT17X3QoXCJRdWljayBzZXR0aW5nc1wiKX1cbiAgICAgICAgICAgIGlucHV0UmVmPXtoYW5kbGV9XG4gICAgICAgICAgICBmb3JjZUhpZGU9eyFpc1BhbmVsQ29sbGFwc2VkfVxuICAgICAgICA+XG4gICAgICAgICAgICB7ICFpc1BhbmVsQ29sbGFwc2VkID8gX3QoXCJTZXR0aW5nc1wiKSA6IG51bGwgfVxuICAgICAgICA8L0FjY2Vzc2libGVUb29sdGlwQnV0dG9uPlxuXG4gICAgICAgIHsgY29udGV4dE1lbnUgfVxuICAgIDwvPjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFF1aWNrU2V0dGluZ3NCdXR0b247XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUF0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBMEJBLE1BQU1BLG1CQUFtQixHQUFHLFFBQWtDO0VBQUEsSUFBakM7SUFBRUMsZ0JBQWdCLEdBQUc7RUFBckIsQ0FBaUM7RUFDMUQsTUFBTSxDQUFDQyxhQUFELEVBQWdCQyxNQUFoQixFQUF3QkMsUUFBeEIsRUFBa0NDLFNBQWxDLElBQStDLElBQUFDLDJCQUFBLEdBQXJEO0VBRUEsTUFBTTtJQUNGLENBQUNDLGlCQUFBLENBQVVDLFVBQVgsR0FBd0JDLGlCQUR0QjtJQUVGLENBQUNGLGlCQUFBLENBQVVHLE1BQVgsR0FBb0JDO0VBRmxCLElBR0YsSUFBQUMsNEJBQUEsRUFBNEMsMEJBQTVDLENBSEo7RUFLQSxJQUFJQyxXQUFKOztFQUNBLElBQUlYLGFBQUosRUFBbUI7SUFD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