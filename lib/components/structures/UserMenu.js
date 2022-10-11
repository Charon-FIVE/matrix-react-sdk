"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _MatrixClientPeg = require("../../MatrixClientPeg");

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _actions = require("../../dispatcher/actions");

var _languageHandler = require("../../languageHandler");

var _ContextMenu = require("./ContextMenu");

var _UserTab = require("../views/dialogs/UserTab");

var _FeedbackDialog = _interopRequireDefault(require("../views/dialogs/FeedbackDialog"));

var _Modal = _interopRequireDefault(require("../../Modal"));

var _LogoutDialog = _interopRequireDefault(require("../views/dialogs/LogoutDialog"));

var _SettingsStore = _interopRequireDefault(require("../../settings/SettingsStore"));

var _theme = require("../../theme");

var _RovingTabIndex = require("../../accessibility/RovingTabIndex");

var _AccessibleButton = _interopRequireDefault(require("../views/elements/AccessibleButton"));

var _SdkConfig = _interopRequireDefault(require("../../SdkConfig"));

var _pages = require("../../utils/pages");

var _OwnProfileStore = require("../../stores/OwnProfileStore");

var _AsyncStore = require("../../stores/AsyncStore");

var _BaseAvatar = _interopRequireDefault(require("../views/avatars/BaseAvatar"));

var _SettingLevel = require("../../settings/SettingLevel");

var _IconizedContextMenu = _interopRequireWildcard(require("../views/context_menus/IconizedContextMenu"));

var _UIFeature = require("../../settings/UIFeature");

var _HostSignupAction = _interopRequireDefault(require("./HostSignupAction"));

var _SpaceStore = _interopRequireDefault(require("../../stores/spaces/SpaceStore"));

var _spaces = require("../../stores/spaces");

var _UserIdentifier = _interopRequireDefault(require("../../customisations/UserIdentifier"));

var _PosthogTrackers = _interopRequireDefault(require("../../PosthogTrackers"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2020, 2021 The Matrix.org Foundation C.I.C.

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
const toRightOf = rect => {
  return {
    left: rect.width + rect.left + 8,
    top: rect.top,
    chevronFace: _ContextMenu.ChevronFace.None
  };
};

const below = rect => {
  return {
    left: rect.left,
    top: rect.top + rect.height,
    chevronFace: _ContextMenu.ChevronFace.None
  };
};

class UserMenu extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "themeWatcherRef", void 0);
    (0, _defineProperty2.default)(this, "dndWatcherRef", void 0);
    (0, _defineProperty2.default)(this, "buttonRef", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "onProfileUpdate", async () => {
      // the store triggered an update, so force a layout update. We don't
      // have any state to store here for that to magically happen.
      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "onSelectedSpaceUpdate", async () => {
      this.setState({
        selectedSpace: _SpaceStore.default.instance.activeSpaceRoom
      });
    });
    (0, _defineProperty2.default)(this, "onThemeChanged", () => {
      this.setState({
        isDarkTheme: this.isUserOnDarkTheme(),
        isHighContrast: this.isUserOnHighContrastTheme()
      });
    });
    (0, _defineProperty2.default)(this, "onAction", payload => {
      switch (payload.action) {
        case _actions.Action.ToggleUserMenu:
          if (this.state.contextMenuPosition) {
            this.setState({
              contextMenuPosition: null
            });
          } else {
            if (this.buttonRef.current) this.buttonRef.current.click();
          }

          break;
      }
    });
    (0, _defineProperty2.default)(this, "onOpenMenuClick", ev => {
      ev.preventDefault();
      ev.stopPropagation();
      this.setState({
        contextMenuPosition: ev.currentTarget.getBoundingClientRect()
      });
    });
    (0, _defineProperty2.default)(this, "onContextMenu", ev => {
      ev.preventDefault();
      ev.stopPropagation();
      this.setState({
        contextMenuPosition: {
          left: ev.clientX,
          top: ev.clientY,
          width: 20,
          height: 0
        }
      });
    });
    (0, _defineProperty2.default)(this, "onCloseMenu", () => {
      this.setState({
        contextMenuPosition: null
      });
    });
    (0, _defineProperty2.default)(this, "onSwitchThemeClick", ev => {
      ev.preventDefault();
      ev.stopPropagation();

      _PosthogTrackers.default.trackInteraction("WebUserMenuThemeToggleButton", ev); // Disable system theme matching if the user hits this button


      _SettingsStore.default.setValue("use_system_theme", null, _SettingLevel.SettingLevel.DEVICE, false);

      let newTheme = this.state.isDarkTheme ? "light" : "dark";

      if (this.state.isHighContrast) {
        const hcTheme = (0, _theme.findHighContrastTheme)(newTheme);

        if (hcTheme) {
          newTheme = hcTheme;
        }
      }

      _SettingsStore.default.setValue("theme", null, _SettingLevel.SettingLevel.DEVICE, newTheme); // set at same level as Appearance tab

    });
    (0, _defineProperty2.default)(this, "onSettingsOpen", (ev, tabId) => {
      ev.preventDefault();
      ev.stopPropagation();
      const payload = {
        action: _actions.Action.ViewUserSettings,
        initialTabId: tabId
      };

      _dispatcher.default.dispatch(payload);

      this.setState({
        contextMenuPosition: null
      }); // also close the menu
    });
    (0, _defineProperty2.default)(this, "onProvideFeedback", ev => {
      ev.preventDefault();
      ev.stopPropagation();

      _Modal.default.createDialog(_FeedbackDialog.default);

      this.setState({
        contextMenuPosition: null
      }); // also close the menu
    });
    (0, _defineProperty2.default)(this, "onSignOutClick", async ev => {
      ev.preventDefault();
      ev.stopPropagation();

      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      if (!cli || !cli.isCryptoEnabled() || !(await cli.exportRoomKeys())?.length) {
        // log out without user prompt if they have no local megolm sessions
        _dispatcher.default.dispatch({
          action: 'logout'
        });
      } else {
        _Modal.default.createDialog(_LogoutDialog.default);
      }

      this.setState({
        contextMenuPosition: null
      }); // also close the menu
    });
    (0, _defineProperty2.default)(this, "onSignInClick", () => {
      _dispatcher.default.dispatch({
        action: 'start_login'
      });

      this.setState({
        contextMenuPosition: null
      }); // also close the menu
    });
    (0, _defineProperty2.default)(this, "onRegisterClick", () => {
      _dispatcher.default.dispatch({
        action: 'start_registration'
      });

      this.setState({
        contextMenuPosition: null
      }); // also close the menu
    });
    (0, _defineProperty2.default)(this, "onHomeClick", ev => {
      ev.preventDefault();
      ev.stopPropagation();

      _dispatcher.default.dispatch({
        action: _actions.Action.ViewHomePage
      });

      this.setState({
        contextMenuPosition: null
      }); // also close the menu
    });
    (0, _defineProperty2.default)(this, "renderContextMenu", () => {
      if (!this.state.contextMenuPosition) return null;
      let topSection;

      const hostSignupConfig = _SdkConfig.default.getObject("host_signup");

      if (_MatrixClientPeg.MatrixClientPeg.get().isGuest()) {
        topSection = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_UserMenu_contextMenu_header mx_UserMenu_contextMenu_guestPrompts"
        }, (0, _languageHandler._t)("Got an account? <a>Sign in</a>", {}, {
          a: sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
            kind: "link_inline",
            onClick: this.onSignInClick
          }, sub)
        }), (0, _languageHandler._t)("New here? <a>Create an account</a>", {}, {
          a: sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
            kind: "link_inline",
            onClick: this.onRegisterClick
          }, sub)
        }));
      } else if (hostSignupConfig?.get("url")) {
        // If hostSignup.domains is set to a non-empty array, only show
        // dialog if the user is on the domain or a subdomain.
        const hostSignupDomains = hostSignupConfig.get("domains") || [];

        const mxDomain = _MatrixClientPeg.MatrixClientPeg.get().getDomain();

        const validDomains = hostSignupDomains.filter(d => d === mxDomain || mxDomain.endsWith(`.${d}`));

        if (!hostSignupConfig.get("domains") || validDomains.length > 0) {
          topSection = /*#__PURE__*/_react.default.createElement(_HostSignupAction.default, {
            onClick: this.onCloseMenu
          });
        }
      }

      let homeButton = null;

      if (this.hasHomePage) {
        homeButton = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
          iconClassName: "mx_UserMenu_iconHome",
          label: (0, _languageHandler._t)("Home"),
          onClick: this.onHomeClick
        });
      }

      let feedbackButton;

      if (_SettingsStore.default.getValue(_UIFeature.UIFeature.Feedback)) {
        feedbackButton = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
          iconClassName: "mx_UserMenu_iconMessage",
          label: (0, _languageHandler._t)("Feedback"),
          onClick: this.onProvideFeedback
        });
      }

      let primaryOptionList = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, null, homeButton, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        iconClassName: "mx_UserMenu_iconBell",
        label: (0, _languageHandler._t)("Notifications"),
        onClick: e => this.onSettingsOpen(e, _UserTab.UserTab.Notifications)
      }), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        iconClassName: "mx_UserMenu_iconLock",
        label: (0, _languageHandler._t)("Security & Privacy"),
        onClick: e => this.onSettingsOpen(e, _UserTab.UserTab.Security)
      }), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        iconClassName: "mx_UserMenu_iconSettings",
        label: (0, _languageHandler._t)("All settings"),
        onClick: e => this.onSettingsOpen(e, null)
      }), feedbackButton, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        className: "mx_IconizedContextMenu_option_red",
        iconClassName: "mx_UserMenu_iconSignOut",
        label: (0, _languageHandler._t)("Sign out"),
        onClick: this.onSignOutClick
      }));

      if (_MatrixClientPeg.MatrixClientPeg.get().isGuest()) {
        primaryOptionList = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, null, homeButton, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
          iconClassName: "mx_UserMenu_iconSettings",
          label: (0, _languageHandler._t)("Settings"),
          onClick: e => this.onSettingsOpen(e, null)
        }), feedbackButton);
      }

      const position = this.props.isPanelCollapsed ? toRightOf(this.state.contextMenuPosition) : below(this.state.contextMenuPosition);
      return /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.default, (0, _extends2.default)({}, position, {
        onFinished: this.onCloseMenu,
        className: "mx_UserMenu_contextMenu"
      }), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_UserMenu_contextMenu_header"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_UserMenu_contextMenu_name"
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_UserMenu_contextMenu_displayName"
      }, _OwnProfileStore.OwnProfileStore.instance.displayName), /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_UserMenu_contextMenu_userId"
      }, _UserIdentifier.default.getDisplayUserIdentifier(_MatrixClientPeg.MatrixClientPeg.get().getUserId(), {
        withDisplayName: true
      }))), /*#__PURE__*/_react.default.createElement(_RovingTabIndex.RovingAccessibleTooltipButton, {
        className: "mx_UserMenu_contextMenu_themeButton",
        onClick: this.onSwitchThemeClick,
        title: this.state.isDarkTheme ? (0, _languageHandler._t)("Switch to light mode") : (0, _languageHandler._t)("Switch to dark mode")
      }, /*#__PURE__*/_react.default.createElement("img", {
        src: require("../../../res/img/element-icons/roomlist/dark-light-mode.svg").default,
        alt: (0, _languageHandler._t)("Switch theme"),
        width: 16
      }))), topSection, primaryOptionList);
    });
    this.state = {
      contextMenuPosition: null,
      isDarkTheme: this.isUserOnDarkTheme(),
      isHighContrast: this.isUserOnHighContrastTheme(),
      selectedSpace: _SpaceStore.default.instance.activeSpaceRoom
    };

    _OwnProfileStore.OwnProfileStore.instance.on(_AsyncStore.UPDATE_EVENT, this.onProfileUpdate);

    _SpaceStore.default.instance.on(_spaces.UPDATE_SELECTED_SPACE, this.onSelectedSpaceUpdate);
  }

  get hasHomePage() {
    return !!(0, _pages.getHomePageUrl)(_SdkConfig.default.get());
  }

  componentDidMount() {
    this.dispatcherRef = _dispatcher.default.register(this.onAction);
    this.themeWatcherRef = _SettingsStore.default.watchSetting("theme", null, this.onThemeChanged);
  }

  componentWillUnmount() {
    if (this.themeWatcherRef) _SettingsStore.default.unwatchSetting(this.themeWatcherRef);
    if (this.dndWatcherRef) _SettingsStore.default.unwatchSetting(this.dndWatcherRef);
    if (this.dispatcherRef) _dispatcher.default.unregister(this.dispatcherRef);

    _OwnProfileStore.OwnProfileStore.instance.off(_AsyncStore.UPDATE_EVENT, this.onProfileUpdate);

    _SpaceStore.default.instance.off(_spaces.UPDATE_SELECTED_SPACE, this.onSelectedSpaceUpdate);
  }

  isUserOnDarkTheme() {
    if (_SettingsStore.default.getValue("use_system_theme")) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } else {
      const theme = _SettingsStore.default.getValue("theme");

      if (theme.startsWith("custom-")) {
        return (0, _theme.getCustomTheme)(theme.substring("custom-".length)).is_dark;
      }

      return theme === "dark";
    }
  }

  isUserOnHighContrastTheme() {
    if (_SettingsStore.default.getValue("use_system_theme")) {
      return window.matchMedia("(prefers-contrast: more)").matches;
    } else {
      const theme = _SettingsStore.default.getValue("theme");

      if (theme.startsWith("custom-")) {
        return false;
      }

      return (0, _theme.isHighContrastTheme)(theme);
    }
  }

  render() {
    const avatarSize = 32; // should match border-radius of the avatar

    const userId = _MatrixClientPeg.MatrixClientPeg.get().getUserId();

    const displayName = _OwnProfileStore.OwnProfileStore.instance.displayName || userId;

    const avatarUrl = _OwnProfileStore.OwnProfileStore.instance.getHttpAvatarUrl(avatarSize);

    let name;

    if (!this.props.isPanelCollapsed) {
      name = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_UserMenu_name"
      }, displayName);
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UserMenu"
    }, /*#__PURE__*/_react.default.createElement(_ContextMenu.ContextMenuButton, {
      onClick: this.onOpenMenuClick,
      inputRef: this.buttonRef,
      label: (0, _languageHandler._t)("User menu"),
      isExpanded: !!this.state.contextMenuPosition,
      onContextMenu: this.onContextMenu
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UserMenu_userAvatar"
    }, /*#__PURE__*/_react.default.createElement(_BaseAvatar.default, {
      idName: userId,
      name: displayName,
      url: avatarUrl,
      width: avatarSize,
      height: avatarSize,
      resizeMethod: "crop",
      className: "mx_UserMenu_userAvatar_BaseAvatar"
    })), name, this.renderContextMenu()), this.props.children);
  }

}

exports.default = UserMenu;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ0b1JpZ2h0T2YiLCJyZWN0IiwibGVmdCIsIndpZHRoIiwidG9wIiwiY2hldnJvbkZhY2UiLCJDaGV2cm9uRmFjZSIsIk5vbmUiLCJiZWxvdyIsImhlaWdodCIsIlVzZXJNZW51IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY3JlYXRlUmVmIiwiZm9yY2VVcGRhdGUiLCJzZXRTdGF0ZSIsInNlbGVjdGVkU3BhY2UiLCJTcGFjZVN0b3JlIiwiaW5zdGFuY2UiLCJhY3RpdmVTcGFjZVJvb20iLCJpc0RhcmtUaGVtZSIsImlzVXNlck9uRGFya1RoZW1lIiwiaXNIaWdoQ29udHJhc3QiLCJpc1VzZXJPbkhpZ2hDb250cmFzdFRoZW1lIiwicGF5bG9hZCIsImFjdGlvbiIsIkFjdGlvbiIsIlRvZ2dsZVVzZXJNZW51Iiwic3RhdGUiLCJjb250ZXh0TWVudVBvc2l0aW9uIiwiYnV0dG9uUmVmIiwiY3VycmVudCIsImNsaWNrIiwiZXYiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsImN1cnJlbnRUYXJnZXQiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJjbGllbnRYIiwiY2xpZW50WSIsIlBvc3Rob2dUcmFja2VycyIsInRyYWNrSW50ZXJhY3Rpb24iLCJTZXR0aW5nc1N0b3JlIiwic2V0VmFsdWUiLCJTZXR0aW5nTGV2ZWwiLCJERVZJQ0UiLCJuZXdUaGVtZSIsImhjVGhlbWUiLCJmaW5kSGlnaENvbnRyYXN0VGhlbWUiLCJ0YWJJZCIsIlZpZXdVc2VyU2V0dGluZ3MiLCJpbml0aWFsVGFiSWQiLCJkZWZhdWx0RGlzcGF0Y2hlciIsImRpc3BhdGNoIiwiTW9kYWwiLCJjcmVhdGVEaWFsb2ciLCJGZWVkYmFja0RpYWxvZyIsImNsaSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImlzQ3J5cHRvRW5hYmxlZCIsImV4cG9ydFJvb21LZXlzIiwibGVuZ3RoIiwiTG9nb3V0RGlhbG9nIiwiVmlld0hvbWVQYWdlIiwidG9wU2VjdGlvbiIsImhvc3RTaWdudXBDb25maWciLCJTZGtDb25maWciLCJnZXRPYmplY3QiLCJpc0d1ZXN0IiwiX3QiLCJhIiwic3ViIiwib25TaWduSW5DbGljayIsIm9uUmVnaXN0ZXJDbGljayIsImhvc3RTaWdudXBEb21haW5zIiwibXhEb21haW4iLCJnZXREb21haW4iLCJ2YWxpZERvbWFpbnMiLCJmaWx0ZXIiLCJkIiwiZW5kc1dpdGgiLCJvbkNsb3NlTWVudSIsImhvbWVCdXR0b24iLCJoYXNIb21lUGFnZSIsIm9uSG9tZUNsaWNrIiwiZmVlZGJhY2tCdXR0b24iLCJnZXRWYWx1ZSIsIlVJRmVhdHVyZSIsIkZlZWRiYWNrIiwib25Qcm92aWRlRmVlZGJhY2siLCJwcmltYXJ5T3B0aW9uTGlzdCIsImUiLCJvblNldHRpbmdzT3BlbiIsIlVzZXJUYWIiLCJOb3RpZmljYXRpb25zIiwiU2VjdXJpdHkiLCJvblNpZ25PdXRDbGljayIsInBvc2l0aW9uIiwiaXNQYW5lbENvbGxhcHNlZCIsIk93blByb2ZpbGVTdG9yZSIsImRpc3BsYXlOYW1lIiwiVXNlcklkZW50aWZpZXJDdXN0b21pc2F0aW9ucyIsImdldERpc3BsYXlVc2VySWRlbnRpZmllciIsImdldFVzZXJJZCIsIndpdGhEaXNwbGF5TmFtZSIsIm9uU3dpdGNoVGhlbWVDbGljayIsInJlcXVpcmUiLCJkZWZhdWx0Iiwib24iLCJVUERBVEVfRVZFTlQiLCJvblByb2ZpbGVVcGRhdGUiLCJVUERBVEVfU0VMRUNURURfU1BBQ0UiLCJvblNlbGVjdGVkU3BhY2VVcGRhdGUiLCJnZXRIb21lUGFnZVVybCIsImNvbXBvbmVudERpZE1vdW50IiwiZGlzcGF0Y2hlclJlZiIsInJlZ2lzdGVyIiwib25BY3Rpb24iLCJ0aGVtZVdhdGNoZXJSZWYiLCJ3YXRjaFNldHRpbmciLCJvblRoZW1lQ2hhbmdlZCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwidW53YXRjaFNldHRpbmciLCJkbmRXYXRjaGVyUmVmIiwidW5yZWdpc3RlciIsIm9mZiIsIndpbmRvdyIsIm1hdGNoTWVkaWEiLCJtYXRjaGVzIiwidGhlbWUiLCJzdGFydHNXaXRoIiwiZ2V0Q3VzdG9tVGhlbWUiLCJzdWJzdHJpbmciLCJpc19kYXJrIiwiaXNIaWdoQ29udHJhc3RUaGVtZSIsInJlbmRlciIsImF2YXRhclNpemUiLCJ1c2VySWQiLCJhdmF0YXJVcmwiLCJnZXRIdHRwQXZhdGFyVXJsIiwibmFtZSIsIm9uT3Blbk1lbnVDbGljayIsIm9uQ29udGV4dE1lbnUiLCJyZW5kZXJDb250ZXh0TWVudSIsImNoaWxkcmVuIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvc3RydWN0dXJlcy9Vc2VyTWVudS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwLCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IGNyZWF0ZVJlZiB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuXG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tIFwiLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgZGVmYXVsdERpc3BhdGNoZXIgZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHsgQWN0aW9uUGF5bG9hZCB9IGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzXCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7IENoZXZyb25GYWNlLCBDb250ZXh0TWVudUJ1dHRvbiB9IGZyb20gXCIuL0NvbnRleHRNZW51XCI7XG5pbXBvcnQgeyBVc2VyVGFiIH0gZnJvbSBcIi4uL3ZpZXdzL2RpYWxvZ3MvVXNlclRhYlwiO1xuaW1wb3J0IHsgT3BlblRvVGFiUGF5bG9hZCB9IGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzL09wZW5Ub1RhYlBheWxvYWRcIjtcbmltcG9ydCBGZWVkYmFja0RpYWxvZyBmcm9tIFwiLi4vdmlld3MvZGlhbG9ncy9GZWVkYmFja0RpYWxvZ1wiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IExvZ291dERpYWxvZyBmcm9tIFwiLi4vdmlld3MvZGlhbG9ncy9Mb2dvdXREaWFsb2dcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgeyBmaW5kSGlnaENvbnRyYXN0VGhlbWUsIGdldEN1c3RvbVRoZW1lLCBpc0hpZ2hDb250cmFzdFRoZW1lIH0gZnJvbSBcIi4uLy4uL3RoZW1lXCI7XG5pbXBvcnQge1xuICAgIFJvdmluZ0FjY2Vzc2libGVUb29sdGlwQnV0dG9uLFxufSBmcm9tIFwiLi4vLi4vYWNjZXNzaWJpbGl0eS9Sb3ZpbmdUYWJJbmRleFwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24sIHsgQnV0dG9uRXZlbnQgfSBmcm9tIFwiLi4vdmlld3MvZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tIFwiLi4vLi4vU2RrQ29uZmlnXCI7XG5pbXBvcnQgeyBnZXRIb21lUGFnZVVybCB9IGZyb20gXCIuLi8uLi91dGlscy9wYWdlc1wiO1xuaW1wb3J0IHsgT3duUHJvZmlsZVN0b3JlIH0gZnJvbSBcIi4uLy4uL3N0b3Jlcy9Pd25Qcm9maWxlU3RvcmVcIjtcbmltcG9ydCB7IFVQREFURV9FVkVOVCB9IGZyb20gXCIuLi8uLi9zdG9yZXMvQXN5bmNTdG9yZVwiO1xuaW1wb3J0IEJhc2VBdmF0YXIgZnJvbSAnLi4vdmlld3MvYXZhdGFycy9CYXNlQXZhdGFyJztcbmltcG9ydCB7IFNldHRpbmdMZXZlbCB9IGZyb20gXCIuLi8uLi9zZXR0aW5ncy9TZXR0aW5nTGV2ZWxcIjtcbmltcG9ydCBJY29uaXplZENvbnRleHRNZW51LCB7XG4gICAgSWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbixcbiAgICBJY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdCxcbn0gZnJvbSBcIi4uL3ZpZXdzL2NvbnRleHRfbWVudXMvSWNvbml6ZWRDb250ZXh0TWVudVwiO1xuaW1wb3J0IHsgVUlGZWF0dXJlIH0gZnJvbSBcIi4uLy4uL3NldHRpbmdzL1VJRmVhdHVyZVwiO1xuaW1wb3J0IEhvc3RTaWdudXBBY3Rpb24gZnJvbSBcIi4vSG9zdFNpZ251cEFjdGlvblwiO1xuaW1wb3J0IFNwYWNlU3RvcmUgZnJvbSBcIi4uLy4uL3N0b3Jlcy9zcGFjZXMvU3BhY2VTdG9yZVwiO1xuaW1wb3J0IHsgVVBEQVRFX1NFTEVDVEVEX1NQQUNFIH0gZnJvbSBcIi4uLy4uL3N0b3Jlcy9zcGFjZXNcIjtcbmltcG9ydCBVc2VySWRlbnRpZmllckN1c3RvbWlzYXRpb25zIGZyb20gXCIuLi8uLi9jdXN0b21pc2F0aW9ucy9Vc2VySWRlbnRpZmllclwiO1xuaW1wb3J0IFBvc3Rob2dUcmFja2VycyBmcm9tIFwiLi4vLi4vUG9zdGhvZ1RyYWNrZXJzXCI7XG5pbXBvcnQgeyBWaWV3SG9tZVBhZ2VQYXlsb2FkIH0gZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvVmlld0hvbWVQYWdlUGF5bG9hZFwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBpc1BhbmVsQ29sbGFwc2VkOiBib29sZWFuO1xufVxuXG50eXBlIFBhcnRpYWxET01SZWN0ID0gUGljazxET01SZWN0LCBcIndpZHRoXCIgfCBcImxlZnRcIiB8IFwidG9wXCIgfCBcImhlaWdodFwiPjtcblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgY29udGV4dE1lbnVQb3NpdGlvbjogUGFydGlhbERPTVJlY3Q7XG4gICAgaXNEYXJrVGhlbWU6IGJvb2xlYW47XG4gICAgaXNIaWdoQ29udHJhc3Q6IGJvb2xlYW47XG4gICAgc2VsZWN0ZWRTcGFjZT86IFJvb207XG59XG5cbmNvbnN0IHRvUmlnaHRPZiA9IChyZWN0OiBQYXJ0aWFsRE9NUmVjdCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6IHJlY3Qud2lkdGggKyByZWN0LmxlZnQgKyA4LFxuICAgICAgICB0b3A6IHJlY3QudG9wLFxuICAgICAgICBjaGV2cm9uRmFjZTogQ2hldnJvbkZhY2UuTm9uZSxcbiAgICB9O1xufTtcblxuY29uc3QgYmVsb3cgPSAocmVjdDogUGFydGlhbERPTVJlY3QpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiByZWN0LmxlZnQsXG4gICAgICAgIHRvcDogcmVjdC50b3AgKyByZWN0LmhlaWdodCxcbiAgICAgICAgY2hldnJvbkZhY2U6IENoZXZyb25GYWNlLk5vbmUsXG4gICAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFVzZXJNZW51IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSBkaXNwYXRjaGVyUmVmOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSB0aGVtZVdhdGNoZXJSZWY6IHN0cmluZztcbiAgICBwcml2YXRlIHJlYWRvbmx5IGRuZFdhdGNoZXJSZWY6IHN0cmluZztcbiAgICBwcml2YXRlIGJ1dHRvblJlZjogUmVhY3QuUmVmT2JqZWN0PEhUTUxCdXR0b25FbGVtZW50PiA9IGNyZWF0ZVJlZigpO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGNvbnRleHRNZW51UG9zaXRpb246IG51bGwsXG4gICAgICAgICAgICBpc0RhcmtUaGVtZTogdGhpcy5pc1VzZXJPbkRhcmtUaGVtZSgpLFxuICAgICAgICAgICAgaXNIaWdoQ29udHJhc3Q6IHRoaXMuaXNVc2VyT25IaWdoQ29udHJhc3RUaGVtZSgpLFxuICAgICAgICAgICAgc2VsZWN0ZWRTcGFjZTogU3BhY2VTdG9yZS5pbnN0YW5jZS5hY3RpdmVTcGFjZVJvb20sXG4gICAgICAgIH07XG5cbiAgICAgICAgT3duUHJvZmlsZVN0b3JlLmluc3RhbmNlLm9uKFVQREFURV9FVkVOVCwgdGhpcy5vblByb2ZpbGVVcGRhdGUpO1xuICAgICAgICBTcGFjZVN0b3JlLmluc3RhbmNlLm9uKFVQREFURV9TRUxFQ1RFRF9TUEFDRSwgdGhpcy5vblNlbGVjdGVkU3BhY2VVcGRhdGUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0IGhhc0hvbWVQYWdlKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISFnZXRIb21lUGFnZVVybChTZGtDb25maWcuZ2V0KCkpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyUmVmID0gZGVmYXVsdERpc3BhdGNoZXIucmVnaXN0ZXIodGhpcy5vbkFjdGlvbik7XG4gICAgICAgIHRoaXMudGhlbWVXYXRjaGVyUmVmID0gU2V0dGluZ3NTdG9yZS53YXRjaFNldHRpbmcoXCJ0aGVtZVwiLCBudWxsLCB0aGlzLm9uVGhlbWVDaGFuZ2VkKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGlmICh0aGlzLnRoZW1lV2F0Y2hlclJlZikgU2V0dGluZ3NTdG9yZS51bndhdGNoU2V0dGluZyh0aGlzLnRoZW1lV2F0Y2hlclJlZik7XG4gICAgICAgIGlmICh0aGlzLmRuZFdhdGNoZXJSZWYpIFNldHRpbmdzU3RvcmUudW53YXRjaFNldHRpbmcodGhpcy5kbmRXYXRjaGVyUmVmKTtcbiAgICAgICAgaWYgKHRoaXMuZGlzcGF0Y2hlclJlZikgZGVmYXVsdERpc3BhdGNoZXIudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoZXJSZWYpO1xuICAgICAgICBPd25Qcm9maWxlU3RvcmUuaW5zdGFuY2Uub2ZmKFVQREFURV9FVkVOVCwgdGhpcy5vblByb2ZpbGVVcGRhdGUpO1xuICAgICAgICBTcGFjZVN0b3JlLmluc3RhbmNlLm9mZihVUERBVEVfU0VMRUNURURfU1BBQ0UsIHRoaXMub25TZWxlY3RlZFNwYWNlVXBkYXRlKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzVXNlck9uRGFya1RoZW1lKCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInVzZV9zeXN0ZW1fdGhlbWVcIikpIHtcbiAgICAgICAgICAgIHJldHVybiB3aW5kb3cubWF0Y2hNZWRpYShcIihwcmVmZXJzLWNvbG9yLXNjaGVtZTogZGFyaylcIikubWF0Y2hlcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHRoZW1lID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInRoZW1lXCIpO1xuICAgICAgICAgICAgaWYgKHRoZW1lLnN0YXJ0c1dpdGgoXCJjdXN0b20tXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdldEN1c3RvbVRoZW1lKHRoZW1lLnN1YnN0cmluZyhcImN1c3RvbS1cIi5sZW5ndGgpKS5pc19kYXJrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoZW1lID09PSBcImRhcmtcIjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgaXNVc2VyT25IaWdoQ29udHJhc3RUaGVtZSgpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJ1c2Vfc3lzdGVtX3RoZW1lXCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gd2luZG93Lm1hdGNoTWVkaWEoXCIocHJlZmVycy1jb250cmFzdDogbW9yZSlcIikubWF0Y2hlcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHRoZW1lID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInRoZW1lXCIpO1xuICAgICAgICAgICAgaWYgKHRoZW1lLnN0YXJ0c1dpdGgoXCJjdXN0b20tXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGlzSGlnaENvbnRyYXN0VGhlbWUodGhlbWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblByb2ZpbGVVcGRhdGUgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIC8vIHRoZSBzdG9yZSB0cmlnZ2VyZWQgYW4gdXBkYXRlLCBzbyBmb3JjZSBhIGxheW91dCB1cGRhdGUuIFdlIGRvbid0XG4gICAgICAgIC8vIGhhdmUgYW55IHN0YXRlIHRvIHN0b3JlIGhlcmUgZm9yIHRoYXQgdG8gbWFnaWNhbGx5IGhhcHBlbi5cbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uU2VsZWN0ZWRTcGFjZVVwZGF0ZSA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzZWxlY3RlZFNwYWNlOiBTcGFjZVN0b3JlLmluc3RhbmNlLmFjdGl2ZVNwYWNlUm9vbSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25UaGVtZUNoYW5nZWQgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaXNEYXJrVGhlbWU6IHRoaXMuaXNVc2VyT25EYXJrVGhlbWUoKSxcbiAgICAgICAgICAgICAgICBpc0hpZ2hDb250cmFzdDogdGhpcy5pc1VzZXJPbkhpZ2hDb250cmFzdFRoZW1lKCksXG4gICAgICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkFjdGlvbiA9IChwYXlsb2FkOiBBY3Rpb25QYXlsb2FkKSA9PiB7XG4gICAgICAgIHN3aXRjaCAocGF5bG9hZC5hY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLlRvZ2dsZVVzZXJNZW51OlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmNvbnRleHRNZW51UG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvbnRleHRNZW51UG9zaXRpb246IG51bGwgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuYnV0dG9uUmVmLmN1cnJlbnQpIHRoaXMuYnV0dG9uUmVmLmN1cnJlbnQuY2xpY2soKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbk9wZW5NZW51Q2xpY2sgPSAoZXY6IFJlYWN0Lk1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjb250ZXh0TWVudVBvc2l0aW9uOiBldi5jdXJyZW50VGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ29udGV4dE1lbnUgPSAoZXY6IFJlYWN0Lk1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgY29udGV4dE1lbnVQb3NpdGlvbjoge1xuICAgICAgICAgICAgICAgIGxlZnQ6IGV2LmNsaWVudFgsXG4gICAgICAgICAgICAgICAgdG9wOiBldi5jbGllbnRZLFxuICAgICAgICAgICAgICAgIHdpZHRoOiAyMCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDAsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNsb3NlTWVudSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvbnRleHRNZW51UG9zaXRpb246IG51bGwgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Td2l0Y2hUaGVtZUNsaWNrID0gKGV2OiBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIFBvc3Rob2dUcmFja2Vycy50cmFja0ludGVyYWN0aW9uKFwiV2ViVXNlck1lbnVUaGVtZVRvZ2dsZUJ1dHRvblwiLCBldik7XG5cbiAgICAgICAgLy8gRGlzYWJsZSBzeXN0ZW0gdGhlbWUgbWF0Y2hpbmcgaWYgdGhlIHVzZXIgaGl0cyB0aGlzIGJ1dHRvblxuICAgICAgICBTZXR0aW5nc1N0b3JlLnNldFZhbHVlKFwidXNlX3N5c3RlbV90aGVtZVwiLCBudWxsLCBTZXR0aW5nTGV2ZWwuREVWSUNFLCBmYWxzZSk7XG5cbiAgICAgICAgbGV0IG5ld1RoZW1lID0gdGhpcy5zdGF0ZS5pc0RhcmtUaGVtZSA/IFwibGlnaHRcIiA6IFwiZGFya1wiO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5pc0hpZ2hDb250cmFzdCkge1xuICAgICAgICAgICAgY29uc3QgaGNUaGVtZSA9IGZpbmRIaWdoQ29udHJhc3RUaGVtZShuZXdUaGVtZSk7XG4gICAgICAgICAgICBpZiAoaGNUaGVtZSkge1xuICAgICAgICAgICAgICAgIG5ld1RoZW1lID0gaGNUaGVtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBTZXR0aW5nc1N0b3JlLnNldFZhbHVlKFwidGhlbWVcIiwgbnVsbCwgU2V0dGluZ0xldmVsLkRFVklDRSwgbmV3VGhlbWUpOyAvLyBzZXQgYXQgc2FtZSBsZXZlbCBhcyBBcHBlYXJhbmNlIHRhYlxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uU2V0dGluZ3NPcGVuID0gKGV2OiBCdXR0b25FdmVudCwgdGFiSWQ6IHN0cmluZykgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICBjb25zdCBwYXlsb2FkOiBPcGVuVG9UYWJQYXlsb2FkID0geyBhY3Rpb246IEFjdGlvbi5WaWV3VXNlclNldHRpbmdzLCBpbml0aWFsVGFiSWQ6IHRhYklkIH07XG4gICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoKHBheWxvYWQpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgY29udGV4dE1lbnVQb3NpdGlvbjogbnVsbCB9KTsgLy8gYWxzbyBjbG9zZSB0aGUgbWVudVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUHJvdmlkZUZlZWRiYWNrID0gKGV2OiBCdXR0b25FdmVudCkgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRmVlZGJhY2tEaWFsb2cpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgY29udGV4dE1lbnVQb3NpdGlvbjogbnVsbCB9KTsgLy8gYWxzbyBjbG9zZSB0aGUgbWVudVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uU2lnbk91dENsaWNrID0gYXN5bmMgKGV2OiBCdXR0b25FdmVudCkgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGlmICghY2xpIHx8ICFjbGkuaXNDcnlwdG9FbmFibGVkKCkgfHwgIShhd2FpdCBjbGkuZXhwb3J0Um9vbUtleXMoKSk/Lmxlbmd0aCkge1xuICAgICAgICAgICAgLy8gbG9nIG91dCB3aXRob3V0IHVzZXIgcHJvbXB0IGlmIHRoZXkgaGF2ZSBubyBsb2NhbCBtZWdvbG0gc2Vzc2lvbnNcbiAgICAgICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoKHsgYWN0aW9uOiAnbG9nb3V0JyB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhMb2dvdXREaWFsb2cpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvbnRleHRNZW51UG9zaXRpb246IG51bGwgfSk7IC8vIGFsc28gY2xvc2UgdGhlIG1lbnVcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblNpZ25JbkNsaWNrID0gKCkgPT4ge1xuICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci5kaXNwYXRjaCh7IGFjdGlvbjogJ3N0YXJ0X2xvZ2luJyB9KTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvbnRleHRNZW51UG9zaXRpb246IG51bGwgfSk7IC8vIGFsc28gY2xvc2UgdGhlIG1lbnVcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJlZ2lzdGVyQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoKHsgYWN0aW9uOiAnc3RhcnRfcmVnaXN0cmF0aW9uJyB9KTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvbnRleHRNZW51UG9zaXRpb246IG51bGwgfSk7IC8vIGFsc28gY2xvc2UgdGhlIG1lbnVcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkhvbWVDbGljayA9IChldjogQnV0dG9uRXZlbnQpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZGlzcGF0Y2g8Vmlld0hvbWVQYWdlUGF5bG9hZD4oeyBhY3Rpb246IEFjdGlvbi5WaWV3SG9tZVBhZ2UgfSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjb250ZXh0TWVudVBvc2l0aW9uOiBudWxsIH0pOyAvLyBhbHNvIGNsb3NlIHRoZSBtZW51XG4gICAgfTtcblxuICAgIHByaXZhdGUgcmVuZGVyQ29udGV4dE1lbnUgPSAoKTogUmVhY3QuUmVhY3ROb2RlID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmNvbnRleHRNZW51UG9zaXRpb24pIHJldHVybiBudWxsO1xuXG4gICAgICAgIGxldCB0b3BTZWN0aW9uO1xuICAgICAgICBjb25zdCBob3N0U2lnbnVwQ29uZmlnID0gU2RrQ29uZmlnLmdldE9iamVjdChcImhvc3Rfc2lnbnVwXCIpO1xuICAgICAgICBpZiAoTWF0cml4Q2xpZW50UGVnLmdldCgpLmlzR3Vlc3QoKSkge1xuICAgICAgICAgICAgdG9wU2VjdGlvbiA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJNZW51X2NvbnRleHRNZW51X2hlYWRlciBteF9Vc2VyTWVudV9jb250ZXh0TWVudV9ndWVzdFByb21wdHNcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIkdvdCBhbiBhY2NvdW50PyA8YT5TaWduIGluPC9hPlwiLCB7fSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgYTogc3ViID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwibGlua19pbmxpbmVcIiBvbkNsaWNrPXt0aGlzLm9uU2lnbkluQ2xpY2t9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHN1YiB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgfSkgfVxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiTmV3IGhlcmU/IDxhPkNyZWF0ZSBhbiBhY2NvdW50PC9hPlwiLCB7fSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgYTogc3ViID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwibGlua19pbmxpbmVcIiBvbkNsaWNrPXt0aGlzLm9uUmVnaXN0ZXJDbGlja30+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3ViIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICB9KSB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKGhvc3RTaWdudXBDb25maWc/LmdldChcInVybFwiKSkge1xuICAgICAgICAgICAgLy8gSWYgaG9zdFNpZ251cC5kb21haW5zIGlzIHNldCB0byBhIG5vbi1lbXB0eSBhcnJheSwgb25seSBzaG93XG4gICAgICAgICAgICAvLyBkaWFsb2cgaWYgdGhlIHVzZXIgaXMgb24gdGhlIGRvbWFpbiBvciBhIHN1YmRvbWFpbi5cbiAgICAgICAgICAgIGNvbnN0IGhvc3RTaWdudXBEb21haW5zID0gaG9zdFNpZ251cENvbmZpZy5nZXQoXCJkb21haW5zXCIpIHx8IFtdO1xuICAgICAgICAgICAgY29uc3QgbXhEb21haW4gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0RG9tYWluKCk7XG4gICAgICAgICAgICBjb25zdCB2YWxpZERvbWFpbnMgPSBob3N0U2lnbnVwRG9tYWlucy5maWx0ZXIoZCA9PiAoZCA9PT0gbXhEb21haW4gfHwgbXhEb21haW4uZW5kc1dpdGgoYC4ke2R9YCkpKTtcbiAgICAgICAgICAgIGlmICghaG9zdFNpZ251cENvbmZpZy5nZXQoXCJkb21haW5zXCIpIHx8IHZhbGlkRG9tYWlucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdG9wU2VjdGlvbiA9IDxIb3N0U2lnbnVwQWN0aW9uIG9uQ2xpY2s9e3RoaXMub25DbG9zZU1lbnV9IC8+O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGhvbWVCdXR0b24gPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5oYXNIb21lUGFnZSkge1xuICAgICAgICAgICAgaG9tZUJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfVXNlck1lbnVfaWNvbkhvbWVcIlxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJIb21lXCIpfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uSG9tZUNsaWNrfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGZlZWRiYWNrQnV0dG9uO1xuICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShVSUZlYXR1cmUuRmVlZGJhY2spKSB7XG4gICAgICAgICAgICBmZWVkYmFja0J1dHRvbiA9IDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uXG4gICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1VzZXJNZW51X2ljb25NZXNzYWdlXCJcbiAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJGZWVkYmFja1wiKX1cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uUHJvdmlkZUZlZWRiYWNrfVxuICAgICAgICAgICAgLz47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcHJpbWFyeU9wdGlvbkxpc3QgPSAoXG4gICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3Q+XG4gICAgICAgICAgICAgICAgeyBob21lQnV0dG9uIH1cbiAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfVXNlck1lbnVfaWNvbkJlbGxcIlxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJOb3RpZmljYXRpb25zXCIpfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4gdGhpcy5vblNldHRpbmdzT3BlbihlLCBVc2VyVGFiLk5vdGlmaWNhdGlvbnMpfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1VzZXJNZW51X2ljb25Mb2NrXCJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiU2VjdXJpdHkgJiBQcml2YWN5XCIpfVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4gdGhpcy5vblNldHRpbmdzT3BlbihlLCBVc2VyVGFiLlNlY3VyaXR5KX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uXG4gICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Vc2VyTWVudV9pY29uU2V0dGluZ3NcIlxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJBbGwgc2V0dGluZ3NcIil9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB0aGlzLm9uU2V0dGluZ3NPcGVuKGUsIG51bGwpfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgeyBmZWVkYmFja0J1dHRvbiB9XG4gICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfSWNvbml6ZWRDb250ZXh0TWVudV9vcHRpb25fcmVkXCJcbiAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1VzZXJNZW51X2ljb25TaWduT3V0XCJcbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiU2lnbiBvdXRcIil9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25TaWduT3V0Q2xpY2t9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvSWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3Q+XG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKE1hdHJpeENsaWVudFBlZy5nZXQoKS5pc0d1ZXN0KCkpIHtcbiAgICAgICAgICAgIHByaW1hcnlPcHRpb25MaXN0ID0gKFxuICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdD5cbiAgICAgICAgICAgICAgICAgICAgeyBob21lQnV0dG9uIH1cbiAgICAgICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Vc2VyTWVudV9pY29uU2V0dGluZ3NcIlxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiU2V0dGluZ3NcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4gdGhpcy5vblNldHRpbmdzT3BlbihlLCBudWxsKX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgeyBmZWVkYmFja0J1dHRvbiB9XG4gICAgICAgICAgICAgICAgPC9JY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdD5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMucHJvcHMuaXNQYW5lbENvbGxhcHNlZFxuICAgICAgICAgICAgPyB0b1JpZ2h0T2YodGhpcy5zdGF0ZS5jb250ZXh0TWVudVBvc2l0aW9uKVxuICAgICAgICAgICAgOiBiZWxvdyh0aGlzLnN0YXRlLmNvbnRleHRNZW51UG9zaXRpb24pO1xuXG4gICAgICAgIHJldHVybiA8SWNvbml6ZWRDb250ZXh0TWVudVxuICAgICAgICAgICAgey4uLnBvc2l0aW9ufVxuICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5vbkNsb3NlTWVudX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1VzZXJNZW51X2NvbnRleHRNZW51XCJcbiAgICAgICAgPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VyTWVudV9jb250ZXh0TWVudV9oZWFkZXJcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VzZXJNZW51X2NvbnRleHRNZW51X25hbWVcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfVXNlck1lbnVfY29udGV4dE1lbnVfZGlzcGxheU5hbWVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgT3duUHJvZmlsZVN0b3JlLmluc3RhbmNlLmRpc3BsYXlOYW1lIH1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9Vc2VyTWVudV9jb250ZXh0TWVudV91c2VySWRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgVXNlcklkZW50aWZpZXJDdXN0b21pc2F0aW9ucy5nZXREaXNwbGF5VXNlcklkZW50aWZpZXIoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpLCB7IHdpdGhEaXNwbGF5TmFtZTogdHJ1ZSB9KSB9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgIDxSb3ZpbmdBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Vc2VyTWVudV9jb250ZXh0TWVudV90aGVtZUJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25Td2l0Y2hUaGVtZUNsaWNrfVxuICAgICAgICAgICAgICAgICAgICB0aXRsZT17dGhpcy5zdGF0ZS5pc0RhcmtUaGVtZSA/IF90KFwiU3dpdGNoIHRvIGxpZ2h0IG1vZGVcIikgOiBfdChcIlN3aXRjaCB0byBkYXJrIG1vZGVcIil9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8aW1nXG4gICAgICAgICAgICAgICAgICAgICAgICBzcmM9e3JlcXVpcmUoXCIuLi8uLi8uLi9yZXMvaW1nL2VsZW1lbnQtaWNvbnMvcm9vbWxpc3QvZGFyay1saWdodC1tb2RlLnN2Z1wiKS5kZWZhdWx0fVxuICAgICAgICAgICAgICAgICAgICAgICAgYWx0PXtfdChcIlN3aXRjaCB0aGVtZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoPXsxNn1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L1JvdmluZ0FjY2Vzc2libGVUb29sdGlwQnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICB7IHRvcFNlY3Rpb24gfVxuICAgICAgICAgICAgeyBwcmltYXJ5T3B0aW9uTGlzdCB9XG4gICAgICAgIDwvSWNvbml6ZWRDb250ZXh0TWVudT47XG4gICAgfTtcblxuICAgIHB1YmxpYyByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGF2YXRhclNpemUgPSAzMjsgLy8gc2hvdWxkIG1hdGNoIGJvcmRlci1yYWRpdXMgb2YgdGhlIGF2YXRhclxuXG4gICAgICAgIGNvbnN0IHVzZXJJZCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVc2VySWQoKTtcbiAgICAgICAgY29uc3QgZGlzcGxheU5hbWUgPSBPd25Qcm9maWxlU3RvcmUuaW5zdGFuY2UuZGlzcGxheU5hbWUgfHwgdXNlcklkO1xuICAgICAgICBjb25zdCBhdmF0YXJVcmwgPSBPd25Qcm9maWxlU3RvcmUuaW5zdGFuY2UuZ2V0SHR0cEF2YXRhclVybChhdmF0YXJTaXplKTtcblxuICAgICAgICBsZXQgbmFtZTogSlNYLkVsZW1lbnQ7XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5pc1BhbmVsQ29sbGFwc2VkKSB7XG4gICAgICAgICAgICBuYW1lID0gPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VyTWVudV9uYW1lXCI+XG4gICAgICAgICAgICAgICAgeyBkaXNwbGF5TmFtZSB9XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VyTWVudVwiPlxuICAgICAgICAgICAgPENvbnRleHRNZW51QnV0dG9uXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbk9wZW5NZW51Q2xpY2t9XG4gICAgICAgICAgICAgICAgaW5wdXRSZWY9e3RoaXMuYnV0dG9uUmVmfVxuICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIlVzZXIgbWVudVwiKX1cbiAgICAgICAgICAgICAgICBpc0V4cGFuZGVkPXshIXRoaXMuc3RhdGUuY29udGV4dE1lbnVQb3NpdGlvbn1cbiAgICAgICAgICAgICAgICBvbkNvbnRleHRNZW51PXt0aGlzLm9uQ29udGV4dE1lbnV9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VyTWVudV91c2VyQXZhdGFyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxCYXNlQXZhdGFyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZE5hbWU9e3VzZXJJZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU9e2Rpc3BsYXlOYW1lfVxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsPXthdmF0YXJVcmx9XG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aD17YXZhdGFyU2l6ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodD17YXZhdGFyU2l6ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc2l6ZU1ldGhvZD1cImNyb3BcIlxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfVXNlck1lbnVfdXNlckF2YXRhcl9CYXNlQXZhdGFyXCJcbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICB7IG5hbWUgfVxuXG4gICAgICAgICAgICAgICAgeyB0aGlzLnJlbmRlckNvbnRleHRNZW51KCkgfVxuICAgICAgICAgICAgPC9Db250ZXh0TWVudUJ1dHRvbj5cblxuICAgICAgICAgICAgeyB0aGlzLnByb3BzLmNoaWxkcmVuIH1cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFHQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFD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