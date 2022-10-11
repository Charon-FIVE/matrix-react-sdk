"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _client = require("matrix-js-sdk/src/client");

var _classnames = _interopRequireDefault(require("classnames"));

var _sync = require("matrix-js-sdk/src/sync");

var _roomState = require("matrix-js-sdk/src/models/room-state");

var _Keyboard = require("../../Keyboard");

var _PageTypes = _interopRequireDefault(require("../../PageTypes"));

var _MediaDeviceHandler = _interopRequireDefault(require("../../MediaDeviceHandler"));

var _FontManager = require("../../utils/FontManager");

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _SettingsStore = _interopRequireDefault(require("../../settings/SettingsStore"));

var _SettingLevel = require("../../settings/SettingLevel");

var _ResizeHandle = _interopRequireDefault(require("../views/elements/ResizeHandle"));

var _resizer = require("../../resizer");

var _MatrixClientContext = _interopRequireDefault(require("../../contexts/MatrixClientContext"));

var _PlatformPeg = _interopRequireDefault(require("../../PlatformPeg"));

var _models = require("../../stores/room-list/models");

var _ServerLimitToast = require("../../toasts/ServerLimitToast");

var _actions = require("../../dispatcher/actions");

var _LeftPanel = _interopRequireDefault(require("./LeftPanel"));

var _PipContainer = _interopRequireDefault(require("../views/voip/PipContainer"));

var _RoomListStore = _interopRequireDefault(require("../../stores/room-list/RoomListStore"));

var _NonUrgentToastContainer = _interopRequireDefault(require("./NonUrgentToastContainer"));

var _Modal = _interopRequireDefault(require("../../Modal"));

var _HostSignupContainer = _interopRequireDefault(require("../views/host_signup/HostSignupContainer"));

var _KeyBindingsManager = require("../../KeyBindingsManager");

var _SpacePanel = _interopRequireDefault(require("../views/spaces/SpacePanel"));

var _LegacyCallHandler = _interopRequireWildcard(require("../../LegacyCallHandler"));

var _AudioFeedArrayForLegacyCall = _interopRequireDefault(require("../views/voip/AudioFeedArrayForLegacyCall"));

var _OwnProfileStore = require("../../stores/OwnProfileStore");

var _AsyncStore = require("../../stores/AsyncStore");

var _RoomView = _interopRequireDefault(require("./RoomView"));

var _ToastContainer = _interopRequireDefault(require("./ToastContainer"));

var _UserView = _interopRequireDefault(require("./UserView"));

var _BackdropPanel = _interopRequireDefault(require("./BackdropPanel"));

var _Media = require("../../customisations/Media");

var _UserTab = require("../views/dialogs/UserTab");

var _RightPanelStore = _interopRequireDefault(require("../../stores/right-panel/RightPanelStore"));

var _RoomContext = require("../../contexts/RoomContext");

var _KeyboardShortcuts = require("../../accessibility/KeyboardShortcuts");

var _LegacyGroupView = _interopRequireDefault(require("./LegacyGroupView"));

var _LeftPanelLiveShareWarning = _interopRequireDefault(require("../views/beacon/LeftPanelLiveShareWarning"));

var _UserOnboardingPage = require("../views/user-onboarding/UserOnboardingPage");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2015 - 2022 The Matrix.org Foundation C.I.C.

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
// We need to fetch each pinned message individually (if we don't already have it)
// so each pinned message may trigger a request. Limit the number per room for sanity.
// NB. this is just for server notices rather than pinned messages in general.
const MAX_PINNED_NOTICES_PER_ROOM = 2; // Used to find the closest inputable thing. Because of how our composer works,
// your caret might be within a paragraph/font/div/whatever within the
// contenteditable rather than directly in something inputable.

function getInputableElement(el) {
  return el.closest("input, textarea, select, [contenteditable=true]");
}

/**
 * This is what our MatrixChat shows when we are logged in. The precise view is
 * determined by the page_type property.
 *
 * Currently, it's very tightly coupled with MatrixChat. We should try to do
 * something about that.
 *
 * Components mounted below us can access the matrix client via the react context.
 */
class LoggedInView extends _react.default.Component {
  constructor(props, context) {
    super(props, context);
    (0, _defineProperty2.default)(this, "_matrixClient", void 0);
    (0, _defineProperty2.default)(this, "_roomView", void 0);
    (0, _defineProperty2.default)(this, "_resizeContainer", void 0);
    (0, _defineProperty2.default)(this, "resizeHandler", void 0);
    (0, _defineProperty2.default)(this, "layoutWatcherRef", void 0);
    (0, _defineProperty2.default)(this, "compactLayoutWatcherRef", void 0);
    (0, _defineProperty2.default)(this, "backgroundImageWatcherRef", void 0);
    (0, _defineProperty2.default)(this, "resizer", void 0);
    (0, _defineProperty2.default)(this, "onCallState", () => {
      const activeCalls = _LegacyCallHandler.default.instance.getAllActiveCalls();

      if (activeCalls === this.state.activeCalls) return;
      this.setState({
        activeCalls
      });
    });
    (0, _defineProperty2.default)(this, "refreshBackgroundImage", async () => {
      let backgroundImage = _SettingsStore.default.getValue("RoomList.backgroundImage");

      if (backgroundImage) {
        // convert to http before going much further
        backgroundImage = (0, _Media.mediaFromMxc)(backgroundImage).srcHttp;
      } else {
        backgroundImage = _OwnProfileStore.OwnProfileStore.instance.getHttpAvatarUrl();
      }

      this.setState({
        backgroundImage
      });
    });
    (0, _defineProperty2.default)(this, "canResetTimelineInRoom", roomId => {
      if (!this._roomView.current) {
        return true;
      }

      return this._roomView.current.canResetTimeline();
    });
    (0, _defineProperty2.default)(this, "onAccountData", event => {
      if (event.getType() === "m.ignored_user_list") {
        _dispatcher.default.dispatch({
          action: "ignore_state_changed"
        });
      }
    });
    (0, _defineProperty2.default)(this, "onCompactLayoutChanged", () => {
      this.setState({
        useCompactLayout: _SettingsStore.default.getValue("useCompactLayout")
      });
    });
    (0, _defineProperty2.default)(this, "onSync", (syncState, oldSyncState, data) => {
      const oldErrCode = this.state.syncErrorData?.error?.errcode;
      const newErrCode = data && data.error && data.error.errcode;
      if (syncState === oldSyncState && oldErrCode === newErrCode) return;
      this.setState({
        syncErrorData: syncState === _sync.SyncState.Error ? data : null
      });

      if (oldSyncState === _sync.SyncState.Prepared && syncState === _sync.SyncState.Syncing) {
        this.updateServerNoticeEvents();
      } else {
        this.calculateServerLimitToast(this.state.syncErrorData, this.state.usageLimitEventContent);
      }
    });
    (0, _defineProperty2.default)(this, "onRoomStateEvents", ev => {
      const serverNoticeList = _RoomListStore.default.instance.orderedLists[_models.DefaultTagID.ServerNotice];

      if (serverNoticeList?.some(r => r.roomId === ev.getRoomId())) {
        this.updateServerNoticeEvents();
      }
    });
    (0, _defineProperty2.default)(this, "onUsageLimitDismissed", () => {
      this.setState({
        usageLimitDismissed: true
      });
    });
    (0, _defineProperty2.default)(this, "updateServerNoticeEvents", async () => {
      const serverNoticeList = _RoomListStore.default.instance.orderedLists[_models.DefaultTagID.ServerNotice];
      if (!serverNoticeList) return [];
      const events = [];
      let pinnedEventTs = 0;

      for (const room of serverNoticeList) {
        const pinStateEvent = room.currentState.getStateEvents("m.room.pinned_events", "");
        if (!pinStateEvent || !pinStateEvent.getContent().pinned) continue;
        pinnedEventTs = pinStateEvent.getTs();
        const pinnedEventIds = pinStateEvent.getContent().pinned.slice(0, MAX_PINNED_NOTICES_PER_ROOM);

        for (const eventId of pinnedEventIds) {
          const timeline = await this._matrixClient.getEventTimeline(room.getUnfilteredTimelineSet(), eventId);
          const event = timeline.getEvents().find(ev => ev.getId() === eventId);
          if (event) events.push(event);
        }
      }

      if (pinnedEventTs && this.state.usageLimitEventTs > pinnedEventTs) {
        // We've processed a newer event than this one, so ignore it.
        return;
      }

      const usageLimitEvent = events.find(e => {
        return e && e.getType() === 'm.room.message' && e.getContent()['server_notice_type'] === 'm.server_notice.usage_limit_reached';
      });
      const usageLimitEventContent = usageLimitEvent && usageLimitEvent.getContent();
      this.calculateServerLimitToast(this.state.syncErrorData, usageLimitEventContent);
      this.setState({
        usageLimitEventContent,
        usageLimitEventTs: pinnedEventTs,
        // This is a fresh toast, we can show toasts again
        usageLimitDismissed: false
      });
    });
    (0, _defineProperty2.default)(this, "onPaste", ev => {
      const element = ev.target;
      const inputableElement = getInputableElement(element);
      if (inputableElement === document.activeElement) return; // nothing to do

      if (inputableElement?.focus) {
        inputableElement.focus();
      } else {
        const inThread = !!document.activeElement.closest(".mx_ThreadView"); // refocusing during a paste event will make the paste end up in the newly focused element,
        // so dispatch synchronously before paste happens

        _dispatcher.default.dispatch({
          action: _actions.Action.FocusSendMessageComposer,
          context: inThread ? _RoomContext.TimelineRenderingType.Thread : _RoomContext.TimelineRenderingType.Room
        }, true);
      }
    });
    (0, _defineProperty2.default)(this, "onReactKeyDown", ev => {
      // events caught while bubbling up on the root element
      // of this component, so something must be focused.
      this.onKeyDown(ev);
    });
    (0, _defineProperty2.default)(this, "onNativeKeyDown", ev => {
      // only pass this if there is no focused element.
      // if there is, onKeyDown will be called by the
      // react keydown handler that respects the react bubbling order.
      if (ev.target === document.body) {
        this.onKeyDown(ev);
      }
    });
    (0, _defineProperty2.default)(this, "onKeyDown", ev => {
      let handled = false;
      const roomAction = (0, _KeyBindingsManager.getKeyBindingsManager)().getRoomAction(ev);

      switch (roomAction) {
        case _KeyboardShortcuts.KeyBindingAction.ScrollUp:
        case _KeyboardShortcuts.KeyBindingAction.ScrollDown:
        case _KeyboardShortcuts.KeyBindingAction.JumpToFirstMessage:
        case _KeyboardShortcuts.KeyBindingAction.JumpToLatestMessage:
          // pass the event down to the scroll panel
          this.onScrollKeyPressed(ev);
          handled = true;
          break;

        case _KeyboardShortcuts.KeyBindingAction.SearchInRoom:
          _dispatcher.default.dispatch({
            action: 'focus_search'
          });

          handled = true;
          break;
      }

      if (handled) {
        ev.stopPropagation();
        ev.preventDefault();
        return;
      }

      const navAction = (0, _KeyBindingsManager.getKeyBindingsManager)().getNavigationAction(ev);

      switch (navAction) {
        case _KeyboardShortcuts.KeyBindingAction.FilterRooms:
          _dispatcher.default.dispatch({
            action: 'focus_room_filter'
          });

          handled = true;
          break;

        case _KeyboardShortcuts.KeyBindingAction.ToggleUserMenu:
          _dispatcher.default.fire(_actions.Action.ToggleUserMenu);

          handled = true;
          break;

        case _KeyboardShortcuts.KeyBindingAction.ShowKeyboardSettings:
          _dispatcher.default.dispatch({
            action: _actions.Action.ViewUserSettings,
            initialTabId: _UserTab.UserTab.Keyboard
          });

          handled = true;
          break;

        case _KeyboardShortcuts.KeyBindingAction.GoToHome:
          _dispatcher.default.dispatch({
            action: _actions.Action.ViewHomePage
          });

          _Modal.default.closeCurrentModal("homeKeyboardShortcut");

          handled = true;
          break;

        case _KeyboardShortcuts.KeyBindingAction.ToggleSpacePanel:
          _dispatcher.default.fire(_actions.Action.ToggleSpacePanel);

          handled = true;
          break;

        case _KeyboardShortcuts.KeyBindingAction.ToggleRoomSidePanel:
          if (this.props.page_type === "room_view") {
            _RightPanelStore.default.instance.togglePanel(null);

            handled = true;
          }

          break;

        case _KeyboardShortcuts.KeyBindingAction.SelectPrevRoom:
          _dispatcher.default.dispatch({
            action: _actions.Action.ViewRoomDelta,
            delta: -1,
            unread: false
          });

          handled = true;
          break;

        case _KeyboardShortcuts.KeyBindingAction.SelectNextRoom:
          _dispatcher.default.dispatch({
            action: _actions.Action.ViewRoomDelta,
            delta: 1,
            unread: false
          });

          handled = true;
          break;

        case _KeyboardShortcuts.KeyBindingAction.SelectPrevUnreadRoom:
          _dispatcher.default.dispatch({
            action: _actions.Action.ViewRoomDelta,
            delta: -1,
            unread: true
          });

          break;

        case _KeyboardShortcuts.KeyBindingAction.SelectNextUnreadRoom:
          _dispatcher.default.dispatch({
            action: _actions.Action.ViewRoomDelta,
            delta: 1,
            unread: true
          });

          break;

        case _KeyboardShortcuts.KeyBindingAction.PreviousVisitedRoomOrSpace:
          _PlatformPeg.default.get().navigateForwardBack(true);

          handled = true;
          break;

        case _KeyboardShortcuts.KeyBindingAction.NextVisitedRoomOrSpace:
          _PlatformPeg.default.get().navigateForwardBack(false);

          handled = true;
          break;
      } // Handle labs actions here, as they apply within the same scope


      if (!handled) {
        const labsAction = (0, _KeyBindingsManager.getKeyBindingsManager)().getLabsAction(ev);

        switch (labsAction) {
          case _KeyboardShortcuts.KeyBindingAction.ToggleHiddenEventVisibility:
            {
              const hiddenEventVisibility = _SettingsStore.default.getValueAt(_SettingLevel.SettingLevel.DEVICE, 'showHiddenEventsInTimeline', undefined, false);

              _SettingsStore.default.setValue('showHiddenEventsInTimeline', undefined, _SettingLevel.SettingLevel.DEVICE, !hiddenEventVisibility);

              handled = true;
              break;
            }
        }
      }

      if (!handled && _PlatformPeg.default.get().overrideBrowserShortcuts() && ev.code.startsWith("Digit") && ev.code !== "Digit0" && // this is the shortcut for reset zoom, don't override it
      (0, _Keyboard.isOnlyCtrlOrCmdKeyEvent)(ev)) {
        _dispatcher.default.dispatch({
          action: _actions.Action.SwitchSpace,
          num: ev.code.slice(5) // Cut off the first 5 characters - "Digit"

        });

        handled = true;
      }

      if (handled) {
        ev.stopPropagation();
        ev.preventDefault();
        return;
      }

      const isModifier = ev.key === _Keyboard.Key.ALT || ev.key === _Keyboard.Key.CONTROL || ev.key === _Keyboard.Key.META || ev.key === _Keyboard.Key.SHIFT;

      if (!isModifier && !ev.ctrlKey && !ev.metaKey) {
        // The above condition is crafted to _allow_ characters with Shift
        // already pressed (but not the Shift key down itself).
        const isClickShortcut = ev.target !== document.body && (ev.key === _Keyboard.Key.SPACE || ev.key === _Keyboard.Key.ENTER); // We explicitly allow alt to be held due to it being a common accent modifier.
        // XXX: Forwarding Dead keys in this way does not work as intended but better to at least
        // move focus to the composer so the user can re-type the dead key correctly.

        const isPrintable = ev.key.length === 1 || ev.key === "Dead"; // If the user is entering a printable character outside of an input field
        // redirect it to the composer for them.

        if (!isClickShortcut && isPrintable && !getInputableElement(ev.target)) {
          const inThread = !!document.activeElement.closest(".mx_ThreadView"); // synchronous dispatch so we focus before key generates input

          _dispatcher.default.dispatch({
            action: _actions.Action.FocusSendMessageComposer,
            context: inThread ? _RoomContext.TimelineRenderingType.Thread : _RoomContext.TimelineRenderingType.Room
          }, true);

          ev.stopPropagation(); // we should *not* preventDefault() here as that would prevent typing in the now-focused composer
        }
      }
    });
    (0, _defineProperty2.default)(this, "onScrollKeyPressed", ev => {
      if (this._roomView.current) {
        this._roomView.current.handleScrollKey(ev);
      }
    });
    this.state = {
      syncErrorData: undefined,
      // use compact timeline view
      useCompactLayout: _SettingsStore.default.getValue('useCompactLayout'),
      usageLimitDismissed: false,
      activeCalls: _LegacyCallHandler.default.instance.getAllActiveCalls()
    }; // stash the MatrixClient in case we log out before we are unmounted

    this._matrixClient = this.props.matrixClient;

    _MediaDeviceHandler.default.loadDevices();

    (0, _FontManager.fixupColorFonts)();
    this._roomView = /*#__PURE__*/_react.default.createRef();
    this._resizeContainer = /*#__PURE__*/_react.default.createRef();
    this.resizeHandler = /*#__PURE__*/_react.default.createRef();
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onNativeKeyDown, false);

    _LegacyCallHandler.default.instance.addListener(_LegacyCallHandler.LegacyCallHandlerEvent.CallState, this.onCallState);

    this.updateServerNoticeEvents();

    this._matrixClient.on(_client.ClientEvent.AccountData, this.onAccountData);

    this._matrixClient.on(_client.ClientEvent.Sync, this.onSync); // Call `onSync` with the current state as well


    this.onSync(this._matrixClient.getSyncState(), null, this._matrixClient.getSyncStateData());

    this._matrixClient.on(_roomState.RoomStateEvent.Events, this.onRoomStateEvents);

    this.layoutWatcherRef = _SettingsStore.default.watchSetting("layout", null, this.onCompactLayoutChanged);
    this.compactLayoutWatcherRef = _SettingsStore.default.watchSetting("useCompactLayout", null, this.onCompactLayoutChanged);
    this.backgroundImageWatcherRef = _SettingsStore.default.watchSetting("RoomList.backgroundImage", null, this.refreshBackgroundImage);
    this.resizer = this.createResizer();
    this.resizer.attach();

    _OwnProfileStore.OwnProfileStore.instance.on(_AsyncStore.UPDATE_EVENT, this.refreshBackgroundImage);

    this.loadResizerPreferences();
    this.refreshBackgroundImage();
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onNativeKeyDown, false);

    _LegacyCallHandler.default.instance.removeListener(_LegacyCallHandler.LegacyCallHandlerEvent.CallState, this.onCallState);

    this._matrixClient.removeListener(_client.ClientEvent.AccountData, this.onAccountData);

    this._matrixClient.removeListener(_client.ClientEvent.Sync, this.onSync);

    this._matrixClient.removeListener(_roomState.RoomStateEvent.Events, this.onRoomStateEvents);

    _OwnProfileStore.OwnProfileStore.instance.off(_AsyncStore.UPDATE_EVENT, this.refreshBackgroundImage);

    _SettingsStore.default.unwatchSetting(this.layoutWatcherRef);

    _SettingsStore.default.unwatchSetting(this.compactLayoutWatcherRef);

    _SettingsStore.default.unwatchSetting(this.backgroundImageWatcherRef);

    this.resizer.detach();
  }

  createResizer() {
    let panelSize;
    let panelCollapsed;
    const collapseConfig = {
      // TODO decrease this once Spaces launches as it'll no longer need to include the 56px Community Panel
      toggleSize: 206 - 50,
      onCollapsed: collapsed => {
        panelCollapsed = collapsed;

        if (collapsed) {
          _dispatcher.default.dispatch({
            action: "hide_left_panel"
          });

          window.localStorage.setItem("mx_lhs_size", '0');
        } else {
          _dispatcher.default.dispatch({
            action: "show_left_panel"
          });
        }
      },
      onResized: size => {
        panelSize = size;
        this.props.resizeNotifier.notifyLeftHandleResized();
      },
      onResizeStart: () => {
        this.props.resizeNotifier.startResizing();
      },
      onResizeStop: () => {
        if (!panelCollapsed) window.localStorage.setItem("mx_lhs_size", '' + panelSize);
        this.props.resizeNotifier.stopResizing();
      },
      isItemCollapsed: domNode => {
        return domNode.classList.contains("mx_LeftPanel_minimized");
      },
      handler: this.resizeHandler.current
    };
    const resizer = new _resizer.Resizer(this._resizeContainer.current, _resizer.CollapseDistributor, collapseConfig);
    resizer.setClassNames({
      handle: "mx_ResizeHandle",
      vertical: "mx_ResizeHandle_vertical",
      reverse: "mx_ResizeHandle_reverse"
    });
    return resizer;
  }

  loadResizerPreferences() {
    let lhsSize = parseInt(window.localStorage.getItem("mx_lhs_size"), 10);

    if (isNaN(lhsSize)) {
      lhsSize = 350;
    }

    this.resizer.forHandleWithId('lp-resizer').resize(lhsSize);
  }

  calculateServerLimitToast(syncError, usageLimitEventContent) {
    const error = syncError && syncError.error && syncError.error.errcode === "M_RESOURCE_LIMIT_EXCEEDED";

    if (error) {
      usageLimitEventContent = syncError.error.data;
    } // usageLimitDismissed is true when the user has explicitly hidden the toast
    // and it will be reset to false if a *new* usage alert comes in.


    if (usageLimitEventContent && this.state.usageLimitDismissed) {
      (0, _ServerLimitToast.showToast)(usageLimitEventContent.limit_type, this.onUsageLimitDismissed, usageLimitEventContent.admin_contact, error);
    } else {
      (0, _ServerLimitToast.hideToast)();
    }
  }

  render() {
    let pageElement;

    switch (this.props.page_type) {
      case _PageTypes.default.RoomView:
        pageElement = /*#__PURE__*/_react.default.createElement(_RoomView.default, {
          ref: this._roomView,
          onRegistered: this.props.onRegistered,
          threepidInvite: this.props.threepidInvite,
          oobData: this.props.roomOobData,
          key: this.props.currentRoomId || 'roomview',
          resizeNotifier: this.props.resizeNotifier,
          justCreatedOpts: this.props.roomJustCreatedOpts,
          forceTimeline: this.props.forceTimeline
        });
        break;

      case _PageTypes.default.HomePage:
        pageElement = /*#__PURE__*/_react.default.createElement(_UserOnboardingPage.UserOnboardingPage, {
          justRegistered: this.props.justRegistered
        });
        break;

      case _PageTypes.default.UserView:
        pageElement = /*#__PURE__*/_react.default.createElement(_UserView.default, {
          userId: this.props.currentUserId,
          resizeNotifier: this.props.resizeNotifier
        });
        break;

      case _PageTypes.default.LegacyGroupView:
        pageElement = /*#__PURE__*/_react.default.createElement(_LegacyGroupView.default, {
          groupId: this.props.currentGroupId
        });
        break;
    }

    const wrapperClasses = (0, _classnames.default)({
      'mx_MatrixChat_wrapper': true,
      'mx_MatrixChat_useCompactLayout': this.state.useCompactLayout
    });
    const bodyClasses = (0, _classnames.default)({
      'mx_MatrixChat': true,
      'mx_MatrixChat--with-avatar': this.state.backgroundImage
    });
    const audioFeedArraysForCalls = this.state.activeCalls.map(call => {
      return /*#__PURE__*/_react.default.createElement(_AudioFeedArrayForLegacyCall.default, {
        call: call,
        key: call.callId
      });
    });
    return /*#__PURE__*/_react.default.createElement(_MatrixClientContext.default.Provider, {
      value: this._matrixClient
    }, /*#__PURE__*/_react.default.createElement("div", {
      onPaste: this.onPaste,
      onKeyDown: this.onReactKeyDown,
      className: wrapperClasses,
      "aria-hidden": this.props.hideToSRUsers
    }, /*#__PURE__*/_react.default.createElement(_ToastContainer.default, null), /*#__PURE__*/_react.default.createElement("div", {
      className: bodyClasses
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_LeftPanel_outerWrapper"
    }, /*#__PURE__*/_react.default.createElement(_LeftPanelLiveShareWarning.default, {
      isMinimized: this.props.collapseLhs || false
    }), /*#__PURE__*/_react.default.createElement("nav", {
      className: "mx_LeftPanel_wrapper"
    }, /*#__PURE__*/_react.default.createElement(_BackdropPanel.default, {
      blurMultiplier: 0.5,
      backgroundImage: this.state.backgroundImage
    }), /*#__PURE__*/_react.default.createElement(_SpacePanel.default, null), /*#__PURE__*/_react.default.createElement(_BackdropPanel.default, {
      backgroundImage: this.state.backgroundImage
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_LeftPanel_wrapper--user",
      ref: this._resizeContainer,
      "data-collapsed": this.props.collapseLhs ? true : undefined
    }, /*#__PURE__*/_react.default.createElement(_LeftPanel.default, {
      pageType: this.props.page_type,
      isMinimized: this.props.collapseLhs || false,
      resizeNotifier: this.props.resizeNotifier
    })))), /*#__PURE__*/_react.default.createElement(_ResizeHandle.default, {
      passRef: this.resizeHandler,
      id: "lp-resizer"
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomView_wrapper"
    }, pageElement))), /*#__PURE__*/_react.default.createElement(_PipContainer.default, null), /*#__PURE__*/_react.default.createElement(_NonUrgentToastContainer.default, null), /*#__PURE__*/_react.default.createElement(_HostSignupContainer.default, null), audioFeedArraysForCalls);
  }

}

(0, _defineProperty2.default)(LoggedInView, "displayName", 'LoggedInView');
var _default = LoggedInView;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNQVhfUElOTkVEX05PVElDRVNfUEVSX1JPT00iLCJnZXRJbnB1dGFibGVFbGVtZW50IiwiZWwiLCJjbG9zZXN0IiwiTG9nZ2VkSW5WaWV3IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY29udGV4dCIsImFjdGl2ZUNhbGxzIiwiTGVnYWN5Q2FsbEhhbmRsZXIiLCJpbnN0YW5jZSIsImdldEFsbEFjdGl2ZUNhbGxzIiwic3RhdGUiLCJzZXRTdGF0ZSIsImJhY2tncm91bmRJbWFnZSIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsIm1lZGlhRnJvbU14YyIsInNyY0h0dHAiLCJPd25Qcm9maWxlU3RvcmUiLCJnZXRIdHRwQXZhdGFyVXJsIiwicm9vbUlkIiwiX3Jvb21WaWV3IiwiY3VycmVudCIsImNhblJlc2V0VGltZWxpbmUiLCJldmVudCIsImdldFR5cGUiLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsInVzZUNvbXBhY3RMYXlvdXQiLCJzeW5jU3RhdGUiLCJvbGRTeW5jU3RhdGUiLCJkYXRhIiwib2xkRXJyQ29kZSIsInN5bmNFcnJvckRhdGEiLCJlcnJvciIsImVycmNvZGUiLCJuZXdFcnJDb2RlIiwiU3luY1N0YXRlIiwiRXJyb3IiLCJQcmVwYXJlZCIsIlN5bmNpbmciLCJ1cGRhdGVTZXJ2ZXJOb3RpY2VFdmVudHMiLCJjYWxjdWxhdGVTZXJ2ZXJMaW1pdFRvYXN0IiwidXNhZ2VMaW1pdEV2ZW50Q29udGVudCIsImV2Iiwic2VydmVyTm90aWNlTGlzdCIsIlJvb21MaXN0U3RvcmUiLCJvcmRlcmVkTGlzdHMiLCJEZWZhdWx0VGFnSUQiLCJTZXJ2ZXJOb3RpY2UiLCJzb21lIiwiciIsImdldFJvb21JZCIsInVzYWdlTGltaXREaXNtaXNzZWQiLCJldmVudHMiLCJwaW5uZWRFdmVudFRzIiwicm9vbSIsInBpblN0YXRlRXZlbnQiLCJjdXJyZW50U3RhdGUiLCJnZXRTdGF0ZUV2ZW50cyIsImdldENvbnRlbnQiLCJwaW5uZWQiLCJnZXRUcyIsInBpbm5lZEV2ZW50SWRzIiwic2xpY2UiLCJldmVudElkIiwidGltZWxpbmUiLCJfbWF0cml4Q2xpZW50IiwiZ2V0RXZlbnRUaW1lbGluZSIsImdldFVuZmlsdGVyZWRUaW1lbGluZVNldCIsImdldEV2ZW50cyIsImZpbmQiLCJnZXRJZCIsInB1c2giLCJ1c2FnZUxpbWl0RXZlbnRUcyIsInVzYWdlTGltaXRFdmVudCIsImUiLCJlbGVtZW50IiwidGFyZ2V0IiwiaW5wdXRhYmxlRWxlbWVudCIsImRvY3VtZW50IiwiYWN0aXZlRWxlbWVudCIsImZvY3VzIiwiaW5UaHJlYWQiLCJBY3Rpb24iLCJGb2N1c1NlbmRNZXNzYWdlQ29tcG9zZXIiLCJUaW1lbGluZVJlbmRlcmluZ1R5cGUiLCJUaHJlYWQiLCJSb29tIiwib25LZXlEb3duIiwiYm9keSIsImhhbmRsZWQiLCJyb29tQWN0aW9uIiwiZ2V0S2V5QmluZGluZ3NNYW5hZ2VyIiwiZ2V0Um9vbUFjdGlvbiIsIktleUJpbmRpbmdBY3Rpb24iLCJTY3JvbGxVcCIsIlNjcm9sbERvd24iLCJKdW1wVG9GaXJzdE1lc3NhZ2UiLCJKdW1wVG9MYXRlc3RNZXNzYWdlIiwib25TY3JvbGxLZXlQcmVzc2VkIiwiU2VhcmNoSW5Sb29tIiwic3RvcFByb3BhZ2F0aW9uIiwicHJldmVudERlZmF1bHQiLCJuYXZBY3Rpb24iLCJnZXROYXZpZ2F0aW9uQWN0aW9uIiwiRmlsdGVyUm9vbXMiLCJUb2dnbGVVc2VyTWVudSIsImZpcmUiLCJTaG93S2V5Ym9hcmRTZXR0aW5ncyIsIlZpZXdVc2VyU2V0dGluZ3MiLCJpbml0aWFsVGFiSWQiLCJVc2VyVGFiIiwiS2V5Ym9hcmQiLCJHb1RvSG9tZSIsIlZpZXdIb21lUGFnZSIsIk1vZGFsIiwiY2xvc2VDdXJyZW50TW9kYWwiLCJUb2dnbGVTcGFjZVBhbmVsIiwiVG9nZ2xlUm9vbVNpZGVQYW5lbCIsInBhZ2VfdHlwZSIsIlJpZ2h0UGFuZWxTdG9yZSIsInRvZ2dsZVBhbmVsIiwiU2VsZWN0UHJldlJvb20iLCJWaWV3Um9vbURlbHRhIiwiZGVsdGEiLCJ1bnJlYWQiLCJTZWxlY3ROZXh0Um9vbSIsIlNlbGVjdFByZXZVbnJlYWRSb29tIiwiU2VsZWN0TmV4dFVucmVhZFJvb20iLCJQcmV2aW91c1Zpc2l0ZWRSb29tT3JTcGFjZSIsIlBsYXRmb3JtUGVnIiwiZ2V0IiwibmF2aWdhdGVGb3J3YXJkQmFjayIsIk5leHRWaXNpdGVkUm9vbU9yU3BhY2UiLCJsYWJzQWN0aW9uIiwiZ2V0TGFic0FjdGlvbiIsIlRvZ2dsZUhpZGRlbkV2ZW50VmlzaWJpbGl0eSIsImhpZGRlbkV2ZW50VmlzaWJpbGl0eSIsImdldFZhbHVlQXQiLCJTZXR0aW5nTGV2ZWwiLCJERVZJQ0UiLCJ1bmRlZmluZWQiLCJzZXRWYWx1ZSIsIm92ZXJyaWRlQnJvd3NlclNob3J0Y3V0cyIsImNvZGUiLCJzdGFydHNXaXRoIiwiaXNPbmx5Q3RybE9yQ21kS2V5RXZlbnQiLCJTd2l0Y2hTcGFjZSIsIm51bSIsImlzTW9kaWZpZXIiLCJrZXkiLCJLZXkiLCJBTFQiLCJDT05UUk9MIiwiTUVUQSIsIlNISUZUIiwiY3RybEtleSIsIm1ldGFLZXkiLCJpc0NsaWNrU2hvcnRjdXQiLCJTUEFDRSIsIkVOVEVSIiwiaXNQcmludGFibGUiLCJsZW5ndGgiLCJoYW5kbGVTY3JvbGxLZXkiLCJtYXRyaXhDbGllbnQiLCJNZWRpYURldmljZUhhbmRsZXIiLCJsb2FkRGV2aWNlcyIsImZpeHVwQ29sb3JGb250cyIsImNyZWF0ZVJlZiIsIl9yZXNpemVDb250YWluZXIiLCJyZXNpemVIYW5kbGVyIiwiY29tcG9uZW50RGlkTW91bnQiLCJhZGRFdmVudExpc3RlbmVyIiwib25OYXRpdmVLZXlEb3duIiwiYWRkTGlzdGVuZXIiLCJMZWdhY3lDYWxsSGFuZGxlckV2ZW50IiwiQ2FsbFN0YXRlIiwib25DYWxsU3RhdGUiLCJvbiIsIkNsaWVudEV2ZW50IiwiQWNjb3VudERhdGEiLCJvbkFjY291bnREYXRhIiwiU3luYyIsIm9uU3luYyIsImdldFN5bmNTdGF0ZSIsImdldFN5bmNTdGF0ZURhdGEiLCJSb29tU3RhdGVFdmVudCIsIkV2ZW50cyIsIm9uUm9vbVN0YXRlRXZlbnRzIiwibGF5b3V0V2F0Y2hlclJlZiIsIndhdGNoU2V0dGluZyIsIm9uQ29tcGFjdExheW91dENoYW5nZWQiLCJjb21wYWN0TGF5b3V0V2F0Y2hlclJlZiIsImJhY2tncm91bmRJbWFnZVdhdGNoZXJSZWYiLCJyZWZyZXNoQmFja2dyb3VuZEltYWdlIiwicmVzaXplciIsImNyZWF0ZVJlc2l6ZXIiLCJhdHRhY2giLCJVUERBVEVfRVZFTlQiLCJsb2FkUmVzaXplclByZWZlcmVuY2VzIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwicmVtb3ZlTGlzdGVuZXIiLCJvZmYiLCJ1bndhdGNoU2V0dGluZyIsImRldGFjaCIsInBhbmVsU2l6ZSIsInBhbmVsQ29sbGFwc2VkIiwiY29sbGFwc2VDb25maWciLCJ0b2dnbGVTaXplIiwib25Db2xsYXBzZWQiLCJjb2xsYXBzZWQiLCJ3aW5kb3ciLCJsb2NhbFN0b3JhZ2UiLCJzZXRJdGVtIiwib25SZXNpemVkIiwic2l6ZSIsInJlc2l6ZU5vdGlmaWVyIiwibm90aWZ5TGVmdEhhbmRsZVJlc2l6ZWQiLCJvblJlc2l6ZVN0YXJ0Iiwic3RhcnRSZXNpemluZyIsIm9uUmVzaXplU3RvcCIsInN0b3BSZXNpemluZyIsImlzSXRlbUNvbGxhcHNlZCIsImRvbU5vZGUiLCJjbGFzc0xpc3QiLCJjb250YWlucyIsImhhbmRsZXIiLCJSZXNpemVyIiwiQ29sbGFwc2VEaXN0cmlidXRvciIsInNldENsYXNzTmFtZXMiLCJoYW5kbGUiLCJ2ZXJ0aWNhbCIsInJldmVyc2UiLCJsaHNTaXplIiwicGFyc2VJbnQiLCJnZXRJdGVtIiwiaXNOYU4iLCJmb3JIYW5kbGVXaXRoSWQiLCJyZXNpemUiLCJzeW5jRXJyb3IiLCJzaG93U2VydmVyTGltaXRUb2FzdCIsImxpbWl0X3R5cGUiLCJvblVzYWdlTGltaXREaXNtaXNzZWQiLCJhZG1pbl9jb250YWN0IiwiaGlkZVNlcnZlckxpbWl0VG9hc3QiLCJyZW5kZXIiLCJwYWdlRWxlbWVudCIsIlBhZ2VUeXBlcyIsIlJvb21WaWV3Iiwib25SZWdpc3RlcmVkIiwidGhyZWVwaWRJbnZpdGUiLCJyb29tT29iRGF0YSIsImN1cnJlbnRSb29tSWQiLCJyb29tSnVzdENyZWF0ZWRPcHRzIiwiZm9yY2VUaW1lbGluZSIsIkhvbWVQYWdlIiwianVzdFJlZ2lzdGVyZWQiLCJVc2VyVmlldyIsImN1cnJlbnRVc2VySWQiLCJMZWdhY3lHcm91cFZpZXciLCJjdXJyZW50R3JvdXBJZCIsIndyYXBwZXJDbGFzc2VzIiwiY2xhc3NOYW1lcyIsImJvZHlDbGFzc2VzIiwiYXVkaW9GZWVkQXJyYXlzRm9yQ2FsbHMiLCJtYXAiLCJjYWxsIiwiY2FsbElkIiwib25QYXN0ZSIsIm9uUmVhY3RLZXlEb3duIiwiaGlkZVRvU1JVc2VycyIsImNvbGxhcHNlTGhzIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvc3RydWN0dXJlcy9Mb2dnZWRJblZpZXcudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSAtIDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgQ2xpcGJvYXJkRXZlbnQgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBDbGllbnRFdmVudCwgTWF0cml4Q2xpZW50IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvY2xpZW50JztcbmltcG9ydCB7IE1hdHJpeEV2ZW50IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50JztcbmltcG9ydCB7IE1hdHJpeENhbGwgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy93ZWJydGMvY2FsbCc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCB7IElTeW5jU3RhdGVEYXRhLCBTeW5jU3RhdGUgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9zeW5jJztcbmltcG9ydCB7IElVc2FnZUxpbWl0IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL3BhcnRpYWxzJztcbmltcG9ydCB7IFJvb21TdGF0ZUV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tLXN0YXRlXCI7XG5cbmltcG9ydCB7IGlzT25seUN0cmxPckNtZEtleUV2ZW50LCBLZXkgfSBmcm9tICcuLi8uLi9LZXlib2FyZCc7XG5pbXBvcnQgUGFnZVR5cGVzIGZyb20gJy4uLy4uL1BhZ2VUeXBlcyc7XG5pbXBvcnQgTWVkaWFEZXZpY2VIYW5kbGVyIGZyb20gJy4uLy4uL01lZGlhRGV2aWNlSGFuZGxlcic7XG5pbXBvcnQgeyBmaXh1cENvbG9yRm9udHMgfSBmcm9tICcuLi8uLi91dGlscy9Gb250TWFuYWdlcic7XG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgeyBJTWF0cml4Q2xpZW50Q3JlZHMgfSBmcm9tICcuLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7IFNldHRpbmdMZXZlbCB9IGZyb20gXCIuLi8uLi9zZXR0aW5ncy9TZXR0aW5nTGV2ZWxcIjtcbmltcG9ydCBSZXNpemVIYW5kbGUgZnJvbSAnLi4vdmlld3MvZWxlbWVudHMvUmVzaXplSGFuZGxlJztcbmltcG9ydCB7IENvbGxhcHNlRGlzdHJpYnV0b3IsIFJlc2l6ZXIgfSBmcm9tICcuLi8uLi9yZXNpemVyJztcbmltcG9ydCBNYXRyaXhDbGllbnRDb250ZXh0IGZyb20gXCIuLi8uLi9jb250ZXh0cy9NYXRyaXhDbGllbnRDb250ZXh0XCI7XG5pbXBvcnQgUmVzaXplTm90aWZpZXIgZnJvbSBcIi4uLy4uL3V0aWxzL1Jlc2l6ZU5vdGlmaWVyXCI7XG5pbXBvcnQgUGxhdGZvcm1QZWcgZnJvbSBcIi4uLy4uL1BsYXRmb3JtUGVnXCI7XG5pbXBvcnQgeyBEZWZhdWx0VGFnSUQgfSBmcm9tIFwiLi4vLi4vc3RvcmVzL3Jvb20tbGlzdC9tb2RlbHNcIjtcbmltcG9ydCB7IGhpZGVUb2FzdCBhcyBoaWRlU2VydmVyTGltaXRUb2FzdCwgc2hvd1RvYXN0IGFzIHNob3dTZXJ2ZXJMaW1pdFRvYXN0IH0gZnJvbSBcIi4uLy4uL3RvYXN0cy9TZXJ2ZXJMaW1pdFRvYXN0XCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQgTGVmdFBhbmVsIGZyb20gXCIuL0xlZnRQYW5lbFwiO1xuaW1wb3J0IFBpcENvbnRhaW5lciBmcm9tICcuLi92aWV3cy92b2lwL1BpcENvbnRhaW5lcic7XG5pbXBvcnQgeyBWaWV3Um9vbURlbHRhUGF5bG9hZCB9IGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzL1ZpZXdSb29tRGVsdGFQYXlsb2FkXCI7XG5pbXBvcnQgUm9vbUxpc3RTdG9yZSBmcm9tIFwiLi4vLi4vc3RvcmVzL3Jvb20tbGlzdC9Sb29tTGlzdFN0b3JlXCI7XG5pbXBvcnQgTm9uVXJnZW50VG9hc3RDb250YWluZXIgZnJvbSBcIi4vTm9uVXJnZW50VG9hc3RDb250YWluZXJcIjtcbmltcG9ydCB7IElPT0JEYXRhLCBJVGhyZWVwaWRJbnZpdGUgfSBmcm9tIFwiLi4vLi4vc3RvcmVzL1RocmVlcGlkSW52aXRlU3RvcmVcIjtcbmltcG9ydCBNb2RhbCBmcm9tIFwiLi4vLi4vTW9kYWxcIjtcbmltcG9ydCB7IElDb2xsYXBzZUNvbmZpZyB9IGZyb20gXCIuLi8uLi9yZXNpemVyL2Rpc3RyaWJ1dG9ycy9jb2xsYXBzZVwiO1xuaW1wb3J0IEhvc3RTaWdudXBDb250YWluZXIgZnJvbSAnLi4vdmlld3MvaG9zdF9zaWdudXAvSG9zdFNpZ251cENvbnRhaW5lcic7XG5pbXBvcnQgeyBnZXRLZXlCaW5kaW5nc01hbmFnZXIgfSBmcm9tICcuLi8uLi9LZXlCaW5kaW5nc01hbmFnZXInO1xuaW1wb3J0IHsgSU9wdHMgfSBmcm9tIFwiLi4vLi4vY3JlYXRlUm9vbVwiO1xuaW1wb3J0IFNwYWNlUGFuZWwgZnJvbSBcIi4uL3ZpZXdzL3NwYWNlcy9TcGFjZVBhbmVsXCI7XG5pbXBvcnQgTGVnYWN5Q2FsbEhhbmRsZXIsIHsgTGVnYWN5Q2FsbEhhbmRsZXJFdmVudCB9IGZyb20gJy4uLy4uL0xlZ2FjeUNhbGxIYW5kbGVyJztcbmltcG9ydCBBdWRpb0ZlZWRBcnJheUZvckxlZ2FjeUNhbGwgZnJvbSAnLi4vdmlld3Mvdm9pcC9BdWRpb0ZlZWRBcnJheUZvckxlZ2FjeUNhbGwnO1xuaW1wb3J0IHsgT3duUHJvZmlsZVN0b3JlIH0gZnJvbSAnLi4vLi4vc3RvcmVzL093blByb2ZpbGVTdG9yZSc7XG5pbXBvcnQgeyBVUERBVEVfRVZFTlQgfSBmcm9tIFwiLi4vLi4vc3RvcmVzL0FzeW5jU3RvcmVcIjtcbmltcG9ydCBSb29tVmlldyBmcm9tICcuL1Jvb21WaWV3JztcbmltcG9ydCB0eXBlIHsgUm9vbVZpZXcgYXMgUm9vbVZpZXdUeXBlIH0gZnJvbSAnLi9Sb29tVmlldyc7XG5pbXBvcnQgVG9hc3RDb250YWluZXIgZnJvbSAnLi9Ub2FzdENvbnRhaW5lcic7XG5pbXBvcnQgVXNlclZpZXcgZnJvbSBcIi4vVXNlclZpZXdcIjtcbmltcG9ydCBCYWNrZHJvcFBhbmVsIGZyb20gXCIuL0JhY2tkcm9wUGFuZWxcIjtcbmltcG9ydCB7IG1lZGlhRnJvbU14YyB9IGZyb20gXCIuLi8uLi9jdXN0b21pc2F0aW9ucy9NZWRpYVwiO1xuaW1wb3J0IHsgVXNlclRhYiB9IGZyb20gXCIuLi92aWV3cy9kaWFsb2dzL1VzZXJUYWJcIjtcbmltcG9ydCB7IE9wZW5Ub1RhYlBheWxvYWQgfSBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9PcGVuVG9UYWJQYXlsb2FkXCI7XG5pbXBvcnQgUmlnaHRQYW5lbFN0b3JlIGZyb20gJy4uLy4uL3N0b3Jlcy9yaWdodC1wYW5lbC9SaWdodFBhbmVsU3RvcmUnO1xuaW1wb3J0IHsgVGltZWxpbmVSZW5kZXJpbmdUeXBlIH0gZnJvbSBcIi4uLy4uL2NvbnRleHRzL1Jvb21Db250ZXh0XCI7XG5pbXBvcnQgeyBLZXlCaW5kaW5nQWN0aW9uIH0gZnJvbSBcIi4uLy4uL2FjY2Vzc2liaWxpdHkvS2V5Ym9hcmRTaG9ydGN1dHNcIjtcbmltcG9ydCB7IFN3aXRjaFNwYWNlUGF5bG9hZCB9IGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzL1N3aXRjaFNwYWNlUGF5bG9hZFwiO1xuaW1wb3J0IExlZ2FjeUdyb3VwVmlldyBmcm9tIFwiLi9MZWdhY3lHcm91cFZpZXdcIjtcbmltcG9ydCB7IElDb25maWdPcHRpb25zIH0gZnJvbSBcIi4uLy4uL0lDb25maWdPcHRpb25zXCI7XG5pbXBvcnQgTGVmdFBhbmVsTGl2ZVNoYXJlV2FybmluZyBmcm9tICcuLi92aWV3cy9iZWFjb24vTGVmdFBhbmVsTGl2ZVNoYXJlV2FybmluZyc7XG5pbXBvcnQgeyBVc2VyT25ib2FyZGluZ1BhZ2UgfSBmcm9tICcuLi92aWV3cy91c2VyLW9uYm9hcmRpbmcvVXNlck9uYm9hcmRpbmdQYWdlJztcblxuLy8gV2UgbmVlZCB0byBmZXRjaCBlYWNoIHBpbm5lZCBtZXNzYWdlIGluZGl2aWR1YWxseSAoaWYgd2UgZG9uJ3QgYWxyZWFkeSBoYXZlIGl0KVxuLy8gc28gZWFjaCBwaW5uZWQgbWVzc2FnZSBtYXkgdHJpZ2dlciBhIHJlcXVlc3QuIExpbWl0IHRoZSBudW1iZXIgcGVyIHJvb20gZm9yIHNhbml0eS5cbi8vIE5CLiB0aGlzIGlzIGp1c3QgZm9yIHNlcnZlciBub3RpY2VzIHJhdGhlciB0aGFuIHBpbm5lZCBtZXNzYWdlcyBpbiBnZW5lcmFsLlxuY29uc3QgTUFYX1BJTk5FRF9OT1RJQ0VTX1BFUl9ST09NID0gMjtcblxuLy8gVXNlZCB0byBmaW5kIHRoZSBjbG9zZXN0IGlucHV0YWJsZSB0aGluZy4gQmVjYXVzZSBvZiBob3cgb3VyIGNvbXBvc2VyIHdvcmtzLFxuLy8geW91ciBjYXJldCBtaWdodCBiZSB3aXRoaW4gYSBwYXJhZ3JhcGgvZm9udC9kaXYvd2hhdGV2ZXIgd2l0aGluIHRoZVxuLy8gY29udGVudGVkaXRhYmxlIHJhdGhlciB0aGFuIGRpcmVjdGx5IGluIHNvbWV0aGluZyBpbnB1dGFibGUuXG5mdW5jdGlvbiBnZXRJbnB1dGFibGVFbGVtZW50KGVsOiBIVE1MRWxlbWVudCk6IEhUTUxFbGVtZW50IHwgbnVsbCB7XG4gICAgcmV0dXJuIGVsLmNsb3Nlc3QoXCJpbnB1dCwgdGV4dGFyZWEsIHNlbGVjdCwgW2NvbnRlbnRlZGl0YWJsZT10cnVlXVwiKTtcbn1cblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgbWF0cml4Q2xpZW50OiBNYXRyaXhDbGllbnQ7XG4gICAgLy8gQ2FsbGVkIHdpdGggdGhlIGNyZWRlbnRpYWxzIG9mIGEgcmVnaXN0ZXJlZCB1c2VyIChpZiB0aGV5IHdlcmUgYSBST1UgdGhhdFxuICAgIC8vIHRyYW5zaXRpb25lZCB0byBQV0xVKVxuICAgIG9uUmVnaXN0ZXJlZDogKGNyZWRlbnRpYWxzOiBJTWF0cml4Q2xpZW50Q3JlZHMpID0+IFByb21pc2U8TWF0cml4Q2xpZW50PjtcbiAgICBoaWRlVG9TUlVzZXJzOiBib29sZWFuO1xuICAgIHJlc2l6ZU5vdGlmaWVyOiBSZXNpemVOb3RpZmllcjtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgcGFnZV90eXBlPzogc3RyaW5nO1xuICAgIGF1dG9Kb2luPzogYm9vbGVhbjtcbiAgICB0aHJlZXBpZEludml0ZT86IElUaHJlZXBpZEludml0ZTtcbiAgICByb29tT29iRGF0YT86IElPT0JEYXRhO1xuICAgIGN1cnJlbnRSb29tSWQ6IHN0cmluZztcbiAgICBjb2xsYXBzZUxoczogYm9vbGVhbjtcbiAgICBjb25maWc6IElDb25maWdPcHRpb25zO1xuICAgIGN1cnJlbnRVc2VySWQ/OiBzdHJpbmc7XG4gICAganVzdFJlZ2lzdGVyZWQ/OiBib29sZWFuO1xuICAgIHJvb21KdXN0Q3JlYXRlZE9wdHM/OiBJT3B0cztcbiAgICBmb3JjZVRpbWVsaW5lPzogYm9vbGVhbjsgLy8gc2VlIHByb3BzIG9uIE1hdHJpeENoYXRcblxuICAgIGN1cnJlbnRHcm91cElkPzogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBzeW5jRXJyb3JEYXRhPzogSVN5bmNTdGF0ZURhdGE7XG4gICAgdXNhZ2VMaW1pdERpc21pc3NlZDogYm9vbGVhbjtcbiAgICB1c2FnZUxpbWl0RXZlbnRDb250ZW50PzogSVVzYWdlTGltaXQ7XG4gICAgdXNhZ2VMaW1pdEV2ZW50VHM/OiBudW1iZXI7XG4gICAgdXNlQ29tcGFjdExheW91dDogYm9vbGVhbjtcbiAgICBhY3RpdmVDYWxsczogQXJyYXk8TWF0cml4Q2FsbD47XG4gICAgYmFja2dyb3VuZEltYWdlPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIFRoaXMgaXMgd2hhdCBvdXIgTWF0cml4Q2hhdCBzaG93cyB3aGVuIHdlIGFyZSBsb2dnZWQgaW4uIFRoZSBwcmVjaXNlIHZpZXcgaXNcbiAqIGRldGVybWluZWQgYnkgdGhlIHBhZ2VfdHlwZSBwcm9wZXJ0eS5cbiAqXG4gKiBDdXJyZW50bHksIGl0J3MgdmVyeSB0aWdodGx5IGNvdXBsZWQgd2l0aCBNYXRyaXhDaGF0LiBXZSBzaG91bGQgdHJ5IHRvIGRvXG4gKiBzb21ldGhpbmcgYWJvdXQgdGhhdC5cbiAqXG4gKiBDb21wb25lbnRzIG1vdW50ZWQgYmVsb3cgdXMgY2FuIGFjY2VzcyB0aGUgbWF0cml4IGNsaWVudCB2aWEgdGhlIHJlYWN0IGNvbnRleHQuXG4gKi9cbmNsYXNzIExvZ2dlZEluVmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHN0YXRpYyBkaXNwbGF5TmFtZSA9ICdMb2dnZWRJblZpZXcnO1xuXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IF9tYXRyaXhDbGllbnQ6IE1hdHJpeENsaWVudDtcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgX3Jvb21WaWV3OiBSZWFjdC5SZWZPYmplY3Q8Um9vbVZpZXdUeXBlPjtcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgX3Jlc2l6ZUNvbnRhaW5lcjogUmVhY3QuUmVmT2JqZWN0PEhUTUxEaXZFbGVtZW50PjtcbiAgICBwcm90ZWN0ZWQgcmVhZG9ubHkgcmVzaXplSGFuZGxlcjogUmVhY3QuUmVmT2JqZWN0PEhUTUxEaXZFbGVtZW50PjtcbiAgICBwcm90ZWN0ZWQgbGF5b3V0V2F0Y2hlclJlZjogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBjb21wYWN0TGF5b3V0V2F0Y2hlclJlZjogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBiYWNrZ3JvdW5kSW1hZ2VXYXRjaGVyUmVmOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIHJlc2l6ZXI6IFJlc2l6ZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcywgY29udGV4dCkge1xuICAgICAgICBzdXBlcihwcm9wcywgY29udGV4dCk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHN5bmNFcnJvckRhdGE6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIC8vIHVzZSBjb21wYWN0IHRpbWVsaW5lIHZpZXdcbiAgICAgICAgICAgIHVzZUNvbXBhY3RMYXlvdXQ6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoJ3VzZUNvbXBhY3RMYXlvdXQnKSxcbiAgICAgICAgICAgIHVzYWdlTGltaXREaXNtaXNzZWQ6IGZhbHNlLFxuICAgICAgICAgICAgYWN0aXZlQ2FsbHM6IExlZ2FjeUNhbGxIYW5kbGVyLmluc3RhbmNlLmdldEFsbEFjdGl2ZUNhbGxzKCksXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gc3Rhc2ggdGhlIE1hdHJpeENsaWVudCBpbiBjYXNlIHdlIGxvZyBvdXQgYmVmb3JlIHdlIGFyZSB1bm1vdW50ZWRcbiAgICAgICAgdGhpcy5fbWF0cml4Q2xpZW50ID0gdGhpcy5wcm9wcy5tYXRyaXhDbGllbnQ7XG5cbiAgICAgICAgTWVkaWFEZXZpY2VIYW5kbGVyLmxvYWREZXZpY2VzKCk7XG5cbiAgICAgICAgZml4dXBDb2xvckZvbnRzKCk7XG5cbiAgICAgICAgdGhpcy5fcm9vbVZpZXcgPSBSZWFjdC5jcmVhdGVSZWYoKTtcbiAgICAgICAgdGhpcy5fcmVzaXplQ29udGFpbmVyID0gUmVhY3QuY3JlYXRlUmVmKCk7XG4gICAgICAgIHRoaXMucmVzaXplSGFuZGxlciA9IFJlYWN0LmNyZWF0ZVJlZigpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5vbk5hdGl2ZUtleURvd24sIGZhbHNlKTtcbiAgICAgICAgTGVnYWN5Q2FsbEhhbmRsZXIuaW5zdGFuY2UuYWRkTGlzdGVuZXIoTGVnYWN5Q2FsbEhhbmRsZXJFdmVudC5DYWxsU3RhdGUsIHRoaXMub25DYWxsU3RhdGUpO1xuXG4gICAgICAgIHRoaXMudXBkYXRlU2VydmVyTm90aWNlRXZlbnRzKCk7XG5cbiAgICAgICAgdGhpcy5fbWF0cml4Q2xpZW50Lm9uKENsaWVudEV2ZW50LkFjY291bnREYXRhLCB0aGlzLm9uQWNjb3VudERhdGEpO1xuICAgICAgICB0aGlzLl9tYXRyaXhDbGllbnQub24oQ2xpZW50RXZlbnQuU3luYywgdGhpcy5vblN5bmMpO1xuICAgICAgICAvLyBDYWxsIGBvblN5bmNgIHdpdGggdGhlIGN1cnJlbnQgc3RhdGUgYXMgd2VsbFxuICAgICAgICB0aGlzLm9uU3luYyhcbiAgICAgICAgICAgIHRoaXMuX21hdHJpeENsaWVudC5nZXRTeW5jU3RhdGUoKSxcbiAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICB0aGlzLl9tYXRyaXhDbGllbnQuZ2V0U3luY1N0YXRlRGF0YSgpLFxuICAgICAgICApO1xuICAgICAgICB0aGlzLl9tYXRyaXhDbGllbnQub24oUm9vbVN0YXRlRXZlbnQuRXZlbnRzLCB0aGlzLm9uUm9vbVN0YXRlRXZlbnRzKTtcblxuICAgICAgICB0aGlzLmxheW91dFdhdGNoZXJSZWYgPSBTZXR0aW5nc1N0b3JlLndhdGNoU2V0dGluZyhcImxheW91dFwiLCBudWxsLCB0aGlzLm9uQ29tcGFjdExheW91dENoYW5nZWQpO1xuICAgICAgICB0aGlzLmNvbXBhY3RMYXlvdXRXYXRjaGVyUmVmID0gU2V0dGluZ3NTdG9yZS53YXRjaFNldHRpbmcoXG4gICAgICAgICAgICBcInVzZUNvbXBhY3RMYXlvdXRcIiwgbnVsbCwgdGhpcy5vbkNvbXBhY3RMYXlvdXRDaGFuZ2VkLFxuICAgICAgICApO1xuICAgICAgICB0aGlzLmJhY2tncm91bmRJbWFnZVdhdGNoZXJSZWYgPSBTZXR0aW5nc1N0b3JlLndhdGNoU2V0dGluZyhcbiAgICAgICAgICAgIFwiUm9vbUxpc3QuYmFja2dyb3VuZEltYWdlXCIsIG51bGwsIHRoaXMucmVmcmVzaEJhY2tncm91bmRJbWFnZSxcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLnJlc2l6ZXIgPSB0aGlzLmNyZWF0ZVJlc2l6ZXIoKTtcbiAgICAgICAgdGhpcy5yZXNpemVyLmF0dGFjaCgpO1xuXG4gICAgICAgIE93blByb2ZpbGVTdG9yZS5pbnN0YW5jZS5vbihVUERBVEVfRVZFTlQsIHRoaXMucmVmcmVzaEJhY2tncm91bmRJbWFnZSk7XG4gICAgICAgIHRoaXMubG9hZFJlc2l6ZXJQcmVmZXJlbmNlcygpO1xuICAgICAgICB0aGlzLnJlZnJlc2hCYWNrZ3JvdW5kSW1hZ2UoKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMub25OYXRpdmVLZXlEb3duLCBmYWxzZSk7XG4gICAgICAgIExlZ2FjeUNhbGxIYW5kbGVyLmluc3RhbmNlLnJlbW92ZUxpc3RlbmVyKExlZ2FjeUNhbGxIYW5kbGVyRXZlbnQuQ2FsbFN0YXRlLCB0aGlzLm9uQ2FsbFN0YXRlKTtcbiAgICAgICAgdGhpcy5fbWF0cml4Q2xpZW50LnJlbW92ZUxpc3RlbmVyKENsaWVudEV2ZW50LkFjY291bnREYXRhLCB0aGlzLm9uQWNjb3VudERhdGEpO1xuICAgICAgICB0aGlzLl9tYXRyaXhDbGllbnQucmVtb3ZlTGlzdGVuZXIoQ2xpZW50RXZlbnQuU3luYywgdGhpcy5vblN5bmMpO1xuICAgICAgICB0aGlzLl9tYXRyaXhDbGllbnQucmVtb3ZlTGlzdGVuZXIoUm9vbVN0YXRlRXZlbnQuRXZlbnRzLCB0aGlzLm9uUm9vbVN0YXRlRXZlbnRzKTtcbiAgICAgICAgT3duUHJvZmlsZVN0b3JlLmluc3RhbmNlLm9mZihVUERBVEVfRVZFTlQsIHRoaXMucmVmcmVzaEJhY2tncm91bmRJbWFnZSk7XG4gICAgICAgIFNldHRpbmdzU3RvcmUudW53YXRjaFNldHRpbmcodGhpcy5sYXlvdXRXYXRjaGVyUmVmKTtcbiAgICAgICAgU2V0dGluZ3NTdG9yZS51bndhdGNoU2V0dGluZyh0aGlzLmNvbXBhY3RMYXlvdXRXYXRjaGVyUmVmKTtcbiAgICAgICAgU2V0dGluZ3NTdG9yZS51bndhdGNoU2V0dGluZyh0aGlzLmJhY2tncm91bmRJbWFnZVdhdGNoZXJSZWYpO1xuICAgICAgICB0aGlzLnJlc2l6ZXIuZGV0YWNoKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkNhbGxTdGF0ZSA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgY29uc3QgYWN0aXZlQ2FsbHMgPSBMZWdhY3lDYWxsSGFuZGxlci5pbnN0YW5jZS5nZXRBbGxBY3RpdmVDYWxscygpO1xuICAgICAgICBpZiAoYWN0aXZlQ2FsbHMgPT09IHRoaXMuc3RhdGUuYWN0aXZlQ2FsbHMpIHJldHVybjtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGFjdGl2ZUNhbGxzIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHJlZnJlc2hCYWNrZ3JvdW5kSW1hZ2UgPSBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgIGxldCBiYWNrZ3JvdW5kSW1hZ2UgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiUm9vbUxpc3QuYmFja2dyb3VuZEltYWdlXCIpO1xuICAgICAgICBpZiAoYmFja2dyb3VuZEltYWdlKSB7XG4gICAgICAgICAgICAvLyBjb252ZXJ0IHRvIGh0dHAgYmVmb3JlIGdvaW5nIG11Y2ggZnVydGhlclxuICAgICAgICAgICAgYmFja2dyb3VuZEltYWdlID0gbWVkaWFGcm9tTXhjKGJhY2tncm91bmRJbWFnZSkuc3JjSHR0cDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJhY2tncm91bmRJbWFnZSA9IE93blByb2ZpbGVTdG9yZS5pbnN0YW5jZS5nZXRIdHRwQXZhdGFyVXJsKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGJhY2tncm91bmRJbWFnZSB9KTtcbiAgICB9O1xuXG4gICAgcHVibGljIGNhblJlc2V0VGltZWxpbmVJblJvb20gPSAocm9vbUlkOiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9yb29tVmlldy5jdXJyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fcm9vbVZpZXcuY3VycmVudC5jYW5SZXNldFRpbWVsaW5lKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgY3JlYXRlUmVzaXplcigpIHtcbiAgICAgICAgbGV0IHBhbmVsU2l6ZTtcbiAgICAgICAgbGV0IHBhbmVsQ29sbGFwc2VkO1xuICAgICAgICBjb25zdCBjb2xsYXBzZUNvbmZpZzogSUNvbGxhcHNlQ29uZmlnID0ge1xuICAgICAgICAgICAgLy8gVE9ETyBkZWNyZWFzZSB0aGlzIG9uY2UgU3BhY2VzIGxhdW5jaGVzIGFzIGl0J2xsIG5vIGxvbmdlciBuZWVkIHRvIGluY2x1ZGUgdGhlIDU2cHggQ29tbXVuaXR5IFBhbmVsXG4gICAgICAgICAgICB0b2dnbGVTaXplOiAyMDYgLSA1MCxcbiAgICAgICAgICAgIG9uQ29sbGFwc2VkOiAoY29sbGFwc2VkKSA9PiB7XG4gICAgICAgICAgICAgICAgcGFuZWxDb2xsYXBzZWQgPSBjb2xsYXBzZWQ7XG4gICAgICAgICAgICAgICAgaWYgKGNvbGxhcHNlZCkge1xuICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246IFwiaGlkZV9sZWZ0X3BhbmVsXCIgfSk7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIm14X2xoc19zaXplXCIsICcwJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiBcInNob3dfbGVmdF9wYW5lbFwiIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBvblJlc2l6ZWQ6IChzaXplKSA9PiB7XG4gICAgICAgICAgICAgICAgcGFuZWxTaXplID0gc2l6ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyLm5vdGlmeUxlZnRIYW5kbGVSZXNpemVkKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgb25SZXNpemVTdGFydDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMucmVzaXplTm90aWZpZXIuc3RhcnRSZXNpemluZygpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG9uUmVzaXplU3RvcDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghcGFuZWxDb2xsYXBzZWQpIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIm14X2xoc19zaXplXCIsICcnICsgcGFuZWxTaXplKTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyLnN0b3BSZXNpemluZygpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGlzSXRlbUNvbGxhcHNlZDogZG9tTm9kZSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvbU5vZGUuY2xhc3NMaXN0LmNvbnRhaW5zKFwibXhfTGVmdFBhbmVsX21pbmltaXplZFwiKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBoYW5kbGVyOiB0aGlzLnJlc2l6ZUhhbmRsZXIuY3VycmVudCxcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgcmVzaXplciA9IG5ldyBSZXNpemVyKHRoaXMuX3Jlc2l6ZUNvbnRhaW5lci5jdXJyZW50LCBDb2xsYXBzZURpc3RyaWJ1dG9yLCBjb2xsYXBzZUNvbmZpZyk7XG4gICAgICAgIHJlc2l6ZXIuc2V0Q2xhc3NOYW1lcyh7XG4gICAgICAgICAgICBoYW5kbGU6IFwibXhfUmVzaXplSGFuZGxlXCIsXG4gICAgICAgICAgICB2ZXJ0aWNhbDogXCJteF9SZXNpemVIYW5kbGVfdmVydGljYWxcIixcbiAgICAgICAgICAgIHJldmVyc2U6IFwibXhfUmVzaXplSGFuZGxlX3JldmVyc2VcIixcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXNpemVyO1xuICAgIH1cblxuICAgIHByaXZhdGUgbG9hZFJlc2l6ZXJQcmVmZXJlbmNlcygpIHtcbiAgICAgICAgbGV0IGxoc1NpemUgPSBwYXJzZUludCh3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJteF9saHNfc2l6ZVwiKSwgMTApO1xuICAgICAgICBpZiAoaXNOYU4obGhzU2l6ZSkpIHtcbiAgICAgICAgICAgIGxoc1NpemUgPSAzNTA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZXNpemVyLmZvckhhbmRsZVdpdGhJZCgnbHAtcmVzaXplcicpLnJlc2l6ZShsaHNTaXplKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQWNjb3VudERhdGEgPSAoZXZlbnQ6IE1hdHJpeEV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC5nZXRUeXBlKCkgPT09IFwibS5pZ25vcmVkX3VzZXJfbGlzdFwiKSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246IFwiaWdub3JlX3N0YXRlX2NoYW5nZWRcIiB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ29tcGFjdExheW91dENoYW5nZWQgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdXNlQ29tcGFjdExheW91dDogU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInVzZUNvbXBhY3RMYXlvdXRcIiksXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uU3luYyA9IChzeW5jU3RhdGU6IFN5bmNTdGF0ZSwgb2xkU3luY1N0YXRlPzogU3luY1N0YXRlLCBkYXRhPzogSVN5bmNTdGF0ZURhdGEpOiB2b2lkID0+IHtcbiAgICAgICAgY29uc3Qgb2xkRXJyQ29kZSA9IHRoaXMuc3RhdGUuc3luY0Vycm9yRGF0YT8uZXJyb3I/LmVycmNvZGU7XG4gICAgICAgIGNvbnN0IG5ld0VyckNvZGUgPSBkYXRhICYmIGRhdGEuZXJyb3IgJiYgZGF0YS5lcnJvci5lcnJjb2RlO1xuICAgICAgICBpZiAoc3luY1N0YXRlID09PSBvbGRTeW5jU3RhdGUgJiYgb2xkRXJyQ29kZSA9PT0gbmV3RXJyQ29kZSkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc3luY0Vycm9yRGF0YTogc3luY1N0YXRlID09PSBTeW5jU3RhdGUuRXJyb3IgPyBkYXRhIDogbnVsbCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKG9sZFN5bmNTdGF0ZSA9PT0gU3luY1N0YXRlLlByZXBhcmVkICYmIHN5bmNTdGF0ZSA9PT0gU3luY1N0YXRlLlN5bmNpbmcpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU2VydmVyTm90aWNlRXZlbnRzKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNhbGN1bGF0ZVNlcnZlckxpbWl0VG9hc3QodGhpcy5zdGF0ZS5zeW5jRXJyb3JEYXRhLCB0aGlzLnN0YXRlLnVzYWdlTGltaXRFdmVudENvbnRlbnQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Sb29tU3RhdGVFdmVudHMgPSAoZXY6IE1hdHJpeEV2ZW50KTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IHNlcnZlck5vdGljZUxpc3QgPSBSb29tTGlzdFN0b3JlLmluc3RhbmNlLm9yZGVyZWRMaXN0c1tEZWZhdWx0VGFnSUQuU2VydmVyTm90aWNlXTtcbiAgICAgICAgaWYgKHNlcnZlck5vdGljZUxpc3Q/LnNvbWUociA9PiByLnJvb21JZCA9PT0gZXYuZ2V0Um9vbUlkKCkpKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVNlcnZlck5vdGljZUV2ZW50cygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Vc2FnZUxpbWl0RGlzbWlzc2VkID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHVzYWdlTGltaXREaXNtaXNzZWQ6IHRydWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGNhbGN1bGF0ZVNlcnZlckxpbWl0VG9hc3Qoc3luY0Vycm9yOiBJU3RhdGVbXCJzeW5jRXJyb3JEYXRhXCJdLCB1c2FnZUxpbWl0RXZlbnRDb250ZW50PzogSVVzYWdlTGltaXQpIHtcbiAgICAgICAgY29uc3QgZXJyb3IgPSBzeW5jRXJyb3IgJiYgc3luY0Vycm9yLmVycm9yICYmIHN5bmNFcnJvci5lcnJvci5lcnJjb2RlID09PSBcIk1fUkVTT1VSQ0VfTElNSVRfRVhDRUVERURcIjtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICB1c2FnZUxpbWl0RXZlbnRDb250ZW50ID0gc3luY0Vycm9yLmVycm9yLmRhdGEgYXMgSVVzYWdlTGltaXQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB1c2FnZUxpbWl0RGlzbWlzc2VkIGlzIHRydWUgd2hlbiB0aGUgdXNlciBoYXMgZXhwbGljaXRseSBoaWRkZW4gdGhlIHRvYXN0XG4gICAgICAgIC8vIGFuZCBpdCB3aWxsIGJlIHJlc2V0IHRvIGZhbHNlIGlmIGEgKm5ldyogdXNhZ2UgYWxlcnQgY29tZXMgaW4uXG4gICAgICAgIGlmICh1c2FnZUxpbWl0RXZlbnRDb250ZW50ICYmIHRoaXMuc3RhdGUudXNhZ2VMaW1pdERpc21pc3NlZCkge1xuICAgICAgICAgICAgc2hvd1NlcnZlckxpbWl0VG9hc3QoXG4gICAgICAgICAgICAgICAgdXNhZ2VMaW1pdEV2ZW50Q29udGVudC5saW1pdF90eXBlLFxuICAgICAgICAgICAgICAgIHRoaXMub25Vc2FnZUxpbWl0RGlzbWlzc2VkLFxuICAgICAgICAgICAgICAgIHVzYWdlTGltaXRFdmVudENvbnRlbnQuYWRtaW5fY29udGFjdCxcbiAgICAgICAgICAgICAgICBlcnJvcixcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoaWRlU2VydmVyTGltaXRUb2FzdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB1cGRhdGVTZXJ2ZXJOb3RpY2VFdmVudHMgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHNlcnZlck5vdGljZUxpc3QgPSBSb29tTGlzdFN0b3JlLmluc3RhbmNlLm9yZGVyZWRMaXN0c1tEZWZhdWx0VGFnSUQuU2VydmVyTm90aWNlXTtcbiAgICAgICAgaWYgKCFzZXJ2ZXJOb3RpY2VMaXN0KSByZXR1cm4gW107XG5cbiAgICAgICAgY29uc3QgZXZlbnRzID0gW107XG4gICAgICAgIGxldCBwaW5uZWRFdmVudFRzID0gMDtcbiAgICAgICAgZm9yIChjb25zdCByb29tIG9mIHNlcnZlck5vdGljZUxpc3QpIHtcbiAgICAgICAgICAgIGNvbnN0IHBpblN0YXRlRXZlbnQgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhcIm0ucm9vbS5waW5uZWRfZXZlbnRzXCIsIFwiXCIpO1xuXG4gICAgICAgICAgICBpZiAoIXBpblN0YXRlRXZlbnQgfHwgIXBpblN0YXRlRXZlbnQuZ2V0Q29udGVudCgpLnBpbm5lZCkgY29udGludWU7XG4gICAgICAgICAgICBwaW5uZWRFdmVudFRzID0gcGluU3RhdGVFdmVudC5nZXRUcygpO1xuXG4gICAgICAgICAgICBjb25zdCBwaW5uZWRFdmVudElkcyA9IHBpblN0YXRlRXZlbnQuZ2V0Q29udGVudCgpLnBpbm5lZC5zbGljZSgwLCBNQVhfUElOTkVEX05PVElDRVNfUEVSX1JPT00pO1xuICAgICAgICAgICAgZm9yIChjb25zdCBldmVudElkIG9mIHBpbm5lZEV2ZW50SWRzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGltZWxpbmUgPSBhd2FpdCB0aGlzLl9tYXRyaXhDbGllbnQuZ2V0RXZlbnRUaW1lbGluZShyb29tLmdldFVuZmlsdGVyZWRUaW1lbGluZVNldCgpLCBldmVudElkKTtcbiAgICAgICAgICAgICAgICBjb25zdCBldmVudCA9IHRpbWVsaW5lLmdldEV2ZW50cygpLmZpbmQoZXYgPT4gZXYuZ2V0SWQoKSA9PT0gZXZlbnRJZCk7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50KSBldmVudHMucHVzaChldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGlubmVkRXZlbnRUcyAmJiB0aGlzLnN0YXRlLnVzYWdlTGltaXRFdmVudFRzID4gcGlubmVkRXZlbnRUcykge1xuICAgICAgICAgICAgLy8gV2UndmUgcHJvY2Vzc2VkIGEgbmV3ZXIgZXZlbnQgdGhhbiB0aGlzIG9uZSwgc28gaWdub3JlIGl0LlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdXNhZ2VMaW1pdEV2ZW50ID0gZXZlbnRzLmZpbmQoKGUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgZSAmJiBlLmdldFR5cGUoKSA9PT0gJ20ucm9vbS5tZXNzYWdlJyAmJlxuICAgICAgICAgICAgICAgIGUuZ2V0Q29udGVudCgpWydzZXJ2ZXJfbm90aWNlX3R5cGUnXSA9PT0gJ20uc2VydmVyX25vdGljZS51c2FnZV9saW1pdF9yZWFjaGVkJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IHVzYWdlTGltaXRFdmVudENvbnRlbnQgPSB1c2FnZUxpbWl0RXZlbnQgJiYgdXNhZ2VMaW1pdEV2ZW50LmdldENvbnRlbnQoKTtcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVTZXJ2ZXJMaW1pdFRvYXN0KHRoaXMuc3RhdGUuc3luY0Vycm9yRGF0YSwgdXNhZ2VMaW1pdEV2ZW50Q29udGVudCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdXNhZ2VMaW1pdEV2ZW50Q29udGVudCxcbiAgICAgICAgICAgIHVzYWdlTGltaXRFdmVudFRzOiBwaW5uZWRFdmVudFRzLFxuICAgICAgICAgICAgLy8gVGhpcyBpcyBhIGZyZXNoIHRvYXN0LCB3ZSBjYW4gc2hvdyB0b2FzdHMgYWdhaW5cbiAgICAgICAgICAgIHVzYWdlTGltaXREaXNtaXNzZWQ6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblBhc3RlID0gKGV2OiBDbGlwYm9hcmRFdmVudCkgPT4ge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gZXYudGFyZ2V0IGFzIEhUTUxFbGVtZW50O1xuICAgICAgICBjb25zdCBpbnB1dGFibGVFbGVtZW50ID0gZ2V0SW5wdXRhYmxlRWxlbWVudChlbGVtZW50KTtcbiAgICAgICAgaWYgKGlucHV0YWJsZUVsZW1lbnQgPT09IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpIHJldHVybjsgLy8gbm90aGluZyB0byBkb1xuXG4gICAgICAgIGlmIChpbnB1dGFibGVFbGVtZW50Py5mb2N1cykge1xuICAgICAgICAgICAgaW5wdXRhYmxlRWxlbWVudC5mb2N1cygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgaW5UaHJlYWQgPSAhIWRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuY2xvc2VzdChcIi5teF9UaHJlYWRWaWV3XCIpO1xuICAgICAgICAgICAgLy8gcmVmb2N1c2luZyBkdXJpbmcgYSBwYXN0ZSBldmVudCB3aWxsIG1ha2UgdGhlIHBhc3RlIGVuZCB1cCBpbiB0aGUgbmV3bHkgZm9jdXNlZCBlbGVtZW50LFxuICAgICAgICAgICAgLy8gc28gZGlzcGF0Y2ggc3luY2hyb25vdXNseSBiZWZvcmUgcGFzdGUgaGFwcGVuc1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5Gb2N1c1NlbmRNZXNzYWdlQ29tcG9zZXIsXG4gICAgICAgICAgICAgICAgY29udGV4dDogaW5UaHJlYWQgPyBUaW1lbGluZVJlbmRlcmluZ1R5cGUuVGhyZWFkIDogVGltZWxpbmVSZW5kZXJpbmdUeXBlLlJvb20sXG4gICAgICAgICAgICB9LCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKlxuICAgIFNPTUUgSEFDS0VSWSBCRUxPVzpcbiAgICBSZWFjdCBvcHRpbWl6ZXMgZXZlbnQgaGFuZGxlcnMsIGJ5IGFsd2F5cyBhdHRhY2hpbmcgb25seSAxIGhhbmRsZXIgdG8gdGhlIGRvY3VtZW50IGZvciBhIGdpdmVuIHR5cGUuXG4gICAgSXQgdGhlbiBpbnRlcm5hbGx5IGRldGVybWluZXMgdGhlIG9yZGVyIGluIHdoaWNoIFJlYWN0IGV2ZW50IGhhbmRsZXJzIHNob3VsZCBiZSBjYWxsZWQsXG4gICAgZW11bGF0aW5nIHRoZSBjYXB0dXJlIGFuZCBidWJibGluZyBwaGFzZXMgdGhlIERPTSBhbHNvIGhhcy5cblxuICAgIEJ1dCwgYXMgdGhlIG5hdGl2ZSBoYW5kbGVyIGZvciBSZWFjdCBpcyBhbHdheXMgYXR0YWNoZWQgb24gdGhlIGRvY3VtZW50LFxuICAgIGl0IHdpbGwgYWx3YXlzIHJ1biBsYXN0IGZvciBidWJibGluZyAoZmlyc3QgZm9yIGNhcHR1cmluZykgaGFuZGxlcnMsXG4gICAgYW5kIHRodXMgUmVhY3QgYmFzaWNhbGx5IGhhcyBpdHMgb3duIGV2ZW50IHBoYXNlcywgYW5kIHdpbGwgYWx3YXlzIHJ1blxuICAgIGFmdGVyIChiZWZvcmUgZm9yIGNhcHR1cmluZykgYW55IG5hdGl2ZSBvdGhlciBldmVudCBoYW5kbGVycyAoYXMgdGhleSB0ZW5kIHRvIGJlIGF0dGFjaGVkIGxhc3QpLlxuXG4gICAgU28gaWRlYWxseSBvbmUgd291bGRuJ3QgbWl4IFJlYWN0IGFuZCBuYXRpdmUgZXZlbnQgaGFuZGxlcnMgdG8gaGF2ZSBidWJibGluZyB3b3JraW5nIGFzIGV4cGVjdGVkLFxuICAgIGJ1dCB3ZSBkbyBuZWVkIGEgbmF0aXZlIGV2ZW50IGhhbmRsZXIgaGVyZSBvbiB0aGUgZG9jdW1lbnQsXG4gICAgdG8gZ2V0IGtleWRvd24gZXZlbnRzIHdoZW4gdGhlcmUgaXMgbm8gZm9jdXNlZCBlbGVtZW50ICh0YXJnZXQ9Ym9keSkuXG5cbiAgICBXZSBhbHNvIGRvIG5lZWQgYnViYmxpbmcgaGVyZSB0byBnaXZlIGNoaWxkIGNvbXBvbmVudHMgYSBjaGFuY2UgdG8gY2FsbCBgc3RvcFByb3BhZ2F0aW9uKClgLFxuICAgIGZvciBrZXlkb3duIGV2ZW50cyBpdCBjYW4gaGFuZGxlIGl0c2VsZiwgYW5kIHNob3VsZG4ndCBiZSByZWRpcmVjdGVkIHRvIHRoZSBjb21wb3Nlci5cblxuICAgIFNvIHdlIGxpc3RlbiB3aXRoIFJlYWN0IG9uIHRoaXMgY29tcG9uZW50IHRvIGdldCBhbnkgZXZlbnRzIG9uIGZvY3VzZWQgZWxlbWVudHMsIGFuZCBnZXQgYnViYmxpbmcgd29ya2luZyBhcyBleHBlY3RlZC5cbiAgICBXZSBhbHNvIGxpc3RlbiB3aXRoIGEgbmF0aXZlIGxpc3RlbmVyIG9uIHRoZSBkb2N1bWVudCB0byBnZXQga2V5ZG93biBldmVudHMgd2hlbiBubyBlbGVtZW50IGlzIGZvY3VzZWQuXG4gICAgQnViYmxpbmcgaXMgaXJyZWxldmFudCBoZXJlIGFzIHRoZSB0YXJnZXQgaXMgdGhlIGJvZHkgZWxlbWVudC5cbiAgICAqL1xuICAgIHByaXZhdGUgb25SZWFjdEtleURvd24gPSAoZXYpID0+IHtcbiAgICAgICAgLy8gZXZlbnRzIGNhdWdodCB3aGlsZSBidWJibGluZyB1cCBvbiB0aGUgcm9vdCBlbGVtZW50XG4gICAgICAgIC8vIG9mIHRoaXMgY29tcG9uZW50LCBzbyBzb21ldGhpbmcgbXVzdCBiZSBmb2N1c2VkLlxuICAgICAgICB0aGlzLm9uS2V5RG93bihldik7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25OYXRpdmVLZXlEb3duID0gKGV2KSA9PiB7XG4gICAgICAgIC8vIG9ubHkgcGFzcyB0aGlzIGlmIHRoZXJlIGlzIG5vIGZvY3VzZWQgZWxlbWVudC5cbiAgICAgICAgLy8gaWYgdGhlcmUgaXMsIG9uS2V5RG93biB3aWxsIGJlIGNhbGxlZCBieSB0aGVcbiAgICAgICAgLy8gcmVhY3Qga2V5ZG93biBoYW5kbGVyIHRoYXQgcmVzcGVjdHMgdGhlIHJlYWN0IGJ1YmJsaW5nIG9yZGVyLlxuICAgICAgICBpZiAoZXYudGFyZ2V0ID09PSBkb2N1bWVudC5ib2R5KSB7XG4gICAgICAgICAgICB0aGlzLm9uS2V5RG93bihldik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbktleURvd24gPSAoZXYpID0+IHtcbiAgICAgICAgbGV0IGhhbmRsZWQgPSBmYWxzZTtcblxuICAgICAgICBjb25zdCByb29tQWN0aW9uID0gZ2V0S2V5QmluZGluZ3NNYW5hZ2VyKCkuZ2V0Um9vbUFjdGlvbihldik7XG4gICAgICAgIHN3aXRjaCAocm9vbUFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSBLZXlCaW5kaW5nQWN0aW9uLlNjcm9sbFVwOlxuICAgICAgICAgICAgY2FzZSBLZXlCaW5kaW5nQWN0aW9uLlNjcm9sbERvd246XG4gICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uSnVtcFRvRmlyc3RNZXNzYWdlOlxuICAgICAgICAgICAgY2FzZSBLZXlCaW5kaW5nQWN0aW9uLkp1bXBUb0xhdGVzdE1lc3NhZ2U6XG4gICAgICAgICAgICAgICAgLy8gcGFzcyB0aGUgZXZlbnQgZG93biB0byB0aGUgc2Nyb2xsIHBhbmVsXG4gICAgICAgICAgICAgICAgdGhpcy5vblNjcm9sbEtleVByZXNzZWQoZXYpO1xuICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBLZXlCaW5kaW5nQWN0aW9uLlNlYXJjaEluUm9vbTpcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdmb2N1c19zZWFyY2gnLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChoYW5kbGVkKSB7XG4gICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBuYXZBY3Rpb24gPSBnZXRLZXlCaW5kaW5nc01hbmFnZXIoKS5nZXROYXZpZ2F0aW9uQWN0aW9uKGV2KTtcbiAgICAgICAgc3dpdGNoIChuYXZBY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5GaWx0ZXJSb29tczpcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdmb2N1c19yb29tX2ZpbHRlcicsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uVG9nZ2xlVXNlck1lbnU6XG4gICAgICAgICAgICAgICAgZGlzLmZpcmUoQWN0aW9uLlRvZ2dsZVVzZXJNZW51KTtcbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5TaG93S2V5Ym9hcmRTZXR0aW5nczpcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2g8T3BlblRvVGFiUGF5bG9hZD4oe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5WaWV3VXNlclNldHRpbmdzLFxuICAgICAgICAgICAgICAgICAgICBpbml0aWFsVGFiSWQ6IFVzZXJUYWIuS2V5Ym9hcmQsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uR29Ub0hvbWU6XG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld0hvbWVQYWdlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIE1vZGFsLmNsb3NlQ3VycmVudE1vZGFsKFwiaG9tZUtleWJvYXJkU2hvcnRjdXRcIik7XG4gICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uVG9nZ2xlU3BhY2VQYW5lbDpcbiAgICAgICAgICAgICAgICBkaXMuZmlyZShBY3Rpb24uVG9nZ2xlU3BhY2VQYW5lbCk7XG4gICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uVG9nZ2xlUm9vbVNpZGVQYW5lbDpcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5wYWdlX3R5cGUgPT09IFwicm9vbV92aWV3XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgUmlnaHRQYW5lbFN0b3JlLmluc3RhbmNlLnRvZ2dsZVBhbmVsKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uU2VsZWN0UHJldlJvb206XG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoPFZpZXdSb29tRGVsdGFQYXlsb2FkPih7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlZpZXdSb29tRGVsdGEsXG4gICAgICAgICAgICAgICAgICAgIGRlbHRhOiAtMSxcbiAgICAgICAgICAgICAgICAgICAgdW5yZWFkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5TZWxlY3ROZXh0Um9vbTpcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2g8Vmlld1Jvb21EZWx0YVBheWxvYWQ+KHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1Jvb21EZWx0YSxcbiAgICAgICAgICAgICAgICAgICAgZGVsdGE6IDEsXG4gICAgICAgICAgICAgICAgICAgIHVucmVhZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uU2VsZWN0UHJldlVucmVhZFJvb206XG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoPFZpZXdSb29tRGVsdGFQYXlsb2FkPih7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlZpZXdSb29tRGVsdGEsXG4gICAgICAgICAgICAgICAgICAgIGRlbHRhOiAtMSxcbiAgICAgICAgICAgICAgICAgICAgdW5yZWFkOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBLZXlCaW5kaW5nQWN0aW9uLlNlbGVjdE5leHRVbnJlYWRSb29tOlxuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaDxWaWV3Um9vbURlbHRhUGF5bG9hZD4oe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5WaWV3Um9vbURlbHRhLFxuICAgICAgICAgICAgICAgICAgICBkZWx0YTogMSxcbiAgICAgICAgICAgICAgICAgICAgdW5yZWFkOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBLZXlCaW5kaW5nQWN0aW9uLlByZXZpb3VzVmlzaXRlZFJvb21PclNwYWNlOlxuICAgICAgICAgICAgICAgIFBsYXRmb3JtUGVnLmdldCgpLm5hdmlnYXRlRm9yd2FyZEJhY2sodHJ1ZSk7XG4gICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uTmV4dFZpc2l0ZWRSb29tT3JTcGFjZTpcbiAgICAgICAgICAgICAgICBQbGF0Zm9ybVBlZy5nZXQoKS5uYXZpZ2F0ZUZvcndhcmRCYWNrKGZhbHNlKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEhhbmRsZSBsYWJzIGFjdGlvbnMgaGVyZSwgYXMgdGhleSBhcHBseSB3aXRoaW4gdGhlIHNhbWUgc2NvcGVcbiAgICAgICAgaWYgKCFoYW5kbGVkKSB7XG4gICAgICAgICAgICBjb25zdCBsYWJzQWN0aW9uID0gZ2V0S2V5QmluZGluZ3NNYW5hZ2VyKCkuZ2V0TGFic0FjdGlvbihldik7XG4gICAgICAgICAgICBzd2l0Y2ggKGxhYnNBY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uVG9nZ2xlSGlkZGVuRXZlbnRWaXNpYmlsaXR5OiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhpZGRlbkV2ZW50VmlzaWJpbGl0eSA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWVBdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFNldHRpbmdMZXZlbC5ERVZJQ0UsXG4gICAgICAgICAgICAgICAgICAgICAgICAnc2hvd0hpZGRlbkV2ZW50c0luVGltZWxpbmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIFNldHRpbmdzU3RvcmUuc2V0VmFsdWUoXG4gICAgICAgICAgICAgICAgICAgICAgICAnc2hvd0hpZGRlbkV2ZW50c0luVGltZWxpbmUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgU2V0dGluZ0xldmVsLkRFVklDRSxcbiAgICAgICAgICAgICAgICAgICAgICAgICFoaWRkZW5FdmVudFZpc2liaWxpdHksXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXG4gICAgICAgICAgICAhaGFuZGxlZCAmJlxuICAgICAgICAgICAgUGxhdGZvcm1QZWcuZ2V0KCkub3ZlcnJpZGVCcm93c2VyU2hvcnRjdXRzKCkgJiZcbiAgICAgICAgICAgIGV2LmNvZGUuc3RhcnRzV2l0aChcIkRpZ2l0XCIpICYmXG4gICAgICAgICAgICBldi5jb2RlICE9PSBcIkRpZ2l0MFwiICYmIC8vIHRoaXMgaXMgdGhlIHNob3J0Y3V0IGZvciByZXNldCB6b29tLCBkb24ndCBvdmVycmlkZSBpdFxuICAgICAgICAgICAgaXNPbmx5Q3RybE9yQ21kS2V5RXZlbnQoZXYpXG4gICAgICAgICkge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoPFN3aXRjaFNwYWNlUGF5bG9hZD4oe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlN3aXRjaFNwYWNlLFxuICAgICAgICAgICAgICAgIG51bTogZXYuY29kZS5zbGljZSg1KSwgLy8gQ3V0IG9mZiB0aGUgZmlyc3QgNSBjaGFyYWN0ZXJzIC0gXCJEaWdpdFwiXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGhhbmRsZWQpIHtcbiAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlzTW9kaWZpZXIgPSBldi5rZXkgPT09IEtleS5BTFQgfHwgZXYua2V5ID09PSBLZXkuQ09OVFJPTCB8fCBldi5rZXkgPT09IEtleS5NRVRBIHx8IGV2LmtleSA9PT0gS2V5LlNISUZUO1xuICAgICAgICBpZiAoIWlzTW9kaWZpZXIgJiYgIWV2LmN0cmxLZXkgJiYgIWV2Lm1ldGFLZXkpIHtcbiAgICAgICAgICAgIC8vIFRoZSBhYm92ZSBjb25kaXRpb24gaXMgY3JhZnRlZCB0byBfYWxsb3dfIGNoYXJhY3RlcnMgd2l0aCBTaGlmdFxuICAgICAgICAgICAgLy8gYWxyZWFkeSBwcmVzc2VkIChidXQgbm90IHRoZSBTaGlmdCBrZXkgZG93biBpdHNlbGYpLlxuICAgICAgICAgICAgY29uc3QgaXNDbGlja1Nob3J0Y3V0ID0gZXYudGFyZ2V0ICE9PSBkb2N1bWVudC5ib2R5ICYmXG4gICAgICAgICAgICAgICAgKGV2LmtleSA9PT0gS2V5LlNQQUNFIHx8IGV2LmtleSA9PT0gS2V5LkVOVEVSKTtcblxuICAgICAgICAgICAgLy8gV2UgZXhwbGljaXRseSBhbGxvdyBhbHQgdG8gYmUgaGVsZCBkdWUgdG8gaXQgYmVpbmcgYSBjb21tb24gYWNjZW50IG1vZGlmaWVyLlxuICAgICAgICAgICAgLy8gWFhYOiBGb3J3YXJkaW5nIERlYWQga2V5cyBpbiB0aGlzIHdheSBkb2VzIG5vdCB3b3JrIGFzIGludGVuZGVkIGJ1dCBiZXR0ZXIgdG8gYXQgbGVhc3RcbiAgICAgICAgICAgIC8vIG1vdmUgZm9jdXMgdG8gdGhlIGNvbXBvc2VyIHNvIHRoZSB1c2VyIGNhbiByZS10eXBlIHRoZSBkZWFkIGtleSBjb3JyZWN0bHkuXG4gICAgICAgICAgICBjb25zdCBpc1ByaW50YWJsZSA9IGV2LmtleS5sZW5ndGggPT09IDEgfHwgZXYua2V5ID09PSBcIkRlYWRcIjtcblxuICAgICAgICAgICAgLy8gSWYgdGhlIHVzZXIgaXMgZW50ZXJpbmcgYSBwcmludGFibGUgY2hhcmFjdGVyIG91dHNpZGUgb2YgYW4gaW5wdXQgZmllbGRcbiAgICAgICAgICAgIC8vIHJlZGlyZWN0IGl0IHRvIHRoZSBjb21wb3NlciBmb3IgdGhlbS5cbiAgICAgICAgICAgIGlmICghaXNDbGlja1Nob3J0Y3V0ICYmIGlzUHJpbnRhYmxlICYmICFnZXRJbnB1dGFibGVFbGVtZW50KGV2LnRhcmdldCBhcyBIVE1MRWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpblRocmVhZCA9ICEhZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5jbG9zZXN0KFwiLm14X1RocmVhZFZpZXdcIik7XG4gICAgICAgICAgICAgICAgLy8gc3luY2hyb25vdXMgZGlzcGF0Y2ggc28gd2UgZm9jdXMgYmVmb3JlIGtleSBnZW5lcmF0ZXMgaW5wdXRcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5Gb2N1c1NlbmRNZXNzYWdlQ29tcG9zZXIsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IGluVGhyZWFkID8gVGltZWxpbmVSZW5kZXJpbmdUeXBlLlRocmVhZCA6IFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5Sb29tLFxuICAgICAgICAgICAgICAgIH0sIHRydWUpO1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIC8vIHdlIHNob3VsZCAqbm90KiBwcmV2ZW50RGVmYXVsdCgpIGhlcmUgYXMgdGhhdCB3b3VsZCBwcmV2ZW50IHR5cGluZyBpbiB0aGUgbm93LWZvY3VzZWQgY29tcG9zZXJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBkaXNwYXRjaCBhIHBhZ2UtdXAvcGFnZS1kb3duL2V0YyB0byB0aGUgYXBwcm9wcmlhdGUgY29tcG9uZW50XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2IFRoZSBrZXkgZXZlbnRcbiAgICAgKi9cbiAgICBwcml2YXRlIG9uU2Nyb2xsS2V5UHJlc3NlZCA9IChldikgPT4ge1xuICAgICAgICBpZiAodGhpcy5fcm9vbVZpZXcuY3VycmVudCkge1xuICAgICAgICAgICAgdGhpcy5fcm9vbVZpZXcuY3VycmVudC5oYW5kbGVTY3JvbGxLZXkoZXYpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IHBhZ2VFbGVtZW50O1xuXG4gICAgICAgIHN3aXRjaCAodGhpcy5wcm9wcy5wYWdlX3R5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgUGFnZVR5cGVzLlJvb21WaWV3OlxuICAgICAgICAgICAgICAgIHBhZ2VFbGVtZW50ID0gPFJvb21WaWV3XG4gICAgICAgICAgICAgICAgICAgIHJlZj17dGhpcy5fcm9vbVZpZXd9XG4gICAgICAgICAgICAgICAgICAgIG9uUmVnaXN0ZXJlZD17dGhpcy5wcm9wcy5vblJlZ2lzdGVyZWR9XG4gICAgICAgICAgICAgICAgICAgIHRocmVlcGlkSW52aXRlPXt0aGlzLnByb3BzLnRocmVlcGlkSW52aXRlfVxuICAgICAgICAgICAgICAgICAgICBvb2JEYXRhPXt0aGlzLnByb3BzLnJvb21Pb2JEYXRhfVxuICAgICAgICAgICAgICAgICAgICBrZXk9e3RoaXMucHJvcHMuY3VycmVudFJvb21JZCB8fCAncm9vbXZpZXcnfVxuICAgICAgICAgICAgICAgICAgICByZXNpemVOb3RpZmllcj17dGhpcy5wcm9wcy5yZXNpemVOb3RpZmllcn1cbiAgICAgICAgICAgICAgICAgICAganVzdENyZWF0ZWRPcHRzPXt0aGlzLnByb3BzLnJvb21KdXN0Q3JlYXRlZE9wdHN9XG4gICAgICAgICAgICAgICAgICAgIGZvcmNlVGltZWxpbmU9e3RoaXMucHJvcHMuZm9yY2VUaW1lbGluZX1cbiAgICAgICAgICAgICAgICAvPjtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBQYWdlVHlwZXMuSG9tZVBhZ2U6XG4gICAgICAgICAgICAgICAgcGFnZUVsZW1lbnQgPSA8VXNlck9uYm9hcmRpbmdQYWdlIGp1c3RSZWdpc3RlcmVkPXt0aGlzLnByb3BzLmp1c3RSZWdpc3RlcmVkfSAvPjtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBQYWdlVHlwZXMuVXNlclZpZXc6XG4gICAgICAgICAgICAgICAgcGFnZUVsZW1lbnQgPSA8VXNlclZpZXcgdXNlcklkPXt0aGlzLnByb3BzLmN1cnJlbnRVc2VySWR9IHJlc2l6ZU5vdGlmaWVyPXt0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyfSAvPjtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBQYWdlVHlwZXMuTGVnYWN5R3JvdXBWaWV3OlxuICAgICAgICAgICAgICAgIHBhZ2VFbGVtZW50ID0gPExlZ2FjeUdyb3VwVmlldyBncm91cElkPXt0aGlzLnByb3BzLmN1cnJlbnRHcm91cElkfSAvPjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHdyYXBwZXJDbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICAnbXhfTWF0cml4Q2hhdF93cmFwcGVyJzogdHJ1ZSxcbiAgICAgICAgICAgICdteF9NYXRyaXhDaGF0X3VzZUNvbXBhY3RMYXlvdXQnOiB0aGlzLnN0YXRlLnVzZUNvbXBhY3RMYXlvdXQsXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBib2R5Q2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgJ214X01hdHJpeENoYXQnOiB0cnVlLFxuICAgICAgICAgICAgJ214X01hdHJpeENoYXQtLXdpdGgtYXZhdGFyJzogdGhpcy5zdGF0ZS5iYWNrZ3JvdW5kSW1hZ2UsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGF1ZGlvRmVlZEFycmF5c0ZvckNhbGxzID0gdGhpcy5zdGF0ZS5hY3RpdmVDYWxscy5tYXAoKGNhbGwpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPEF1ZGlvRmVlZEFycmF5Rm9yTGVnYWN5Q2FsbCBjYWxsPXtjYWxsfSBrZXk9e2NhbGwuY2FsbElkfSAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxNYXRyaXhDbGllbnRDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXt0aGlzLl9tYXRyaXhDbGllbnR9PlxuICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgb25QYXN0ZT17dGhpcy5vblBhc3RlfVxuICAgICAgICAgICAgICAgICAgICBvbktleURvd249e3RoaXMub25SZWFjdEtleURvd259XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17d3JhcHBlckNsYXNzZXN9XG4gICAgICAgICAgICAgICAgICAgIGFyaWEtaGlkZGVuPXt0aGlzLnByb3BzLmhpZGVUb1NSVXNlcnN9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8VG9hc3RDb250YWluZXIgLz5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2JvZHlDbGFzc2VzfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9MZWZ0UGFuZWxfb3V0ZXJXcmFwcGVyJz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8TGVmdFBhbmVsTGl2ZVNoYXJlV2FybmluZyBpc01pbmltaXplZD17dGhpcy5wcm9wcy5jb2xsYXBzZUxocyB8fCBmYWxzZX0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmF2IGNsYXNzTmFtZT0nbXhfTGVmdFBhbmVsX3dyYXBwZXInPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QmFja2Ryb3BQYW5lbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmx1ck11bHRpcGxpZXI9ezAuNX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRJbWFnZT17dGhpcy5zdGF0ZS5iYWNrZ3JvdW5kSW1hZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxTcGFjZVBhbmVsIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxCYWNrZHJvcFBhbmVsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kSW1hZ2U9e3RoaXMuc3RhdGUuYmFja2dyb3VuZEltYWdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9MZWZ0UGFuZWxfd3JhcHBlci0tdXNlclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWY9e3RoaXMuX3Jlc2l6ZUNvbnRhaW5lcn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEtY29sbGFwc2VkPXt0aGlzLnByb3BzLmNvbGxhcHNlTGhzID8gdHJ1ZSA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPExlZnRQYW5lbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VUeXBlPXt0aGlzLnByb3BzLnBhZ2VfdHlwZSBhcyBQYWdlVHlwZXN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNNaW5pbWl6ZWQ9e3RoaXMucHJvcHMuY29sbGFwc2VMaHMgfHwgZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzaXplTm90aWZpZXI9e3RoaXMucHJvcHMucmVzaXplTm90aWZpZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L25hdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPFJlc2l6ZUhhbmRsZSBwYXNzUmVmPXt0aGlzLnJlc2l6ZUhhbmRsZXJ9IGlkPVwibHAtcmVzaXplclwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21WaWV3X3dyYXBwZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHBhZ2VFbGVtZW50IH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8UGlwQ29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPE5vblVyZ2VudFRvYXN0Q29udGFpbmVyIC8+XG4gICAgICAgICAgICAgICAgPEhvc3RTaWdudXBDb250YWluZXIgLz5cbiAgICAgICAgICAgICAgICB7IGF1ZGlvRmVlZEFycmF5c0ZvckNhbGxzIH1cbiAgICAgICAgICAgIDwvTWF0cml4Q2xpZW50Q29udGV4dC5Qcm92aWRlcj5cbiAgICAgICAgKTtcbiAgICB9XG59XG5c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