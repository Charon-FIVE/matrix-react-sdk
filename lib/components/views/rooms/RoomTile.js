"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.contextMenuBelow = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _room = require("matrix-js-sdk/src/models/room");

var _classnames = _interopRequireDefault(require("classnames"));

var _RovingTabIndex = require("../../../accessibility/RovingTabIndex");

var _AccessibleButton = _interopRequireDefault(require("../../views/elements/AccessibleButton"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _actions = require("../../../dispatcher/actions");

var _languageHandler = require("../../../languageHandler");

var _ContextMenu = require("../../structures/ContextMenu");

var _models = require("../../../stores/room-list/models");

var _MessagePreviewStore = require("../../../stores/room-list/MessagePreviewStore");

var _DecoratedRoomAvatar = _interopRequireDefault(require("../avatars/DecoratedRoomAvatar"));

var _RoomNotifs = require("../../../RoomNotifs");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _RoomNotificationContextMenu = require("../context_menus/RoomNotificationContextMenu");

var _NotificationBadge = _interopRequireDefault(require("./NotificationBadge"));

var _RoomNotificationStateStore = require("../../../stores/notifications/RoomNotificationStateStore");

var _NotificationState = require("../../../stores/notifications/NotificationState");

var _AccessibleTooltipButton = _interopRequireDefault(require("../elements/AccessibleTooltipButton"));

var _EchoChamber = require("../../../stores/local-echo/EchoChamber");

var _RoomEchoChamber = require("../../../stores/local-echo/RoomEchoChamber");

var _GenericEchoChamber = require("../../../stores/local-echo/GenericEchoChamber");

var _PosthogTrackers = _interopRequireDefault(require("../../../PosthogTrackers"));

var _KeyboardShortcuts = require("../../../accessibility/KeyboardShortcuts");

var _KeyBindingsManager = require("../../../KeyBindingsManager");

var _RoomViewStore = require("../../../stores/RoomViewStore");

var _RoomTileCallSummary = require("./RoomTileCallSummary");

var _RoomGeneralContextMenu = require("../context_menus/RoomGeneralContextMenu");

var _CallStore = require("../../../stores/CallStore");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2018 Michael Telatynski <7t3chguy@gmail.com>
Copyright 2015-2017, 2019-2021 The Matrix.org Foundation C.I.C.

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
const messagePreviewId = roomId => `mx_RoomTile_messagePreview_${roomId}`;

const contextMenuBelow = elementRect => {
  // align the context menu's icons with the icon which opened the context menu
  const left = elementRect.left + window.scrollX - 9;
  const top = elementRect.bottom + window.scrollY + 17;
  const chevronFace = _ContextMenu.ChevronFace.None;
  return {
    left,
    top,
    chevronFace
  };
};

exports.contextMenuBelow = contextMenuBelow;

class RoomTile extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "roomTileRef", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "notificationState", void 0);
    (0, _defineProperty2.default)(this, "roomProps", void 0);
    (0, _defineProperty2.default)(this, "onRoomNameUpdate", room => {
      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "onNotificationUpdate", () => {
      this.forceUpdate(); // notification state changed - update
    });
    (0, _defineProperty2.default)(this, "onRoomPropertyUpdate", property => {
      if (property === _RoomEchoChamber.CachedRoomKey.NotificationVolume) this.onNotificationUpdate(); // else ignore - not important for this tile
    });
    (0, _defineProperty2.default)(this, "onAction", payload => {
      if (payload.action === _actions.Action.ViewRoom && payload.room_id === this.props.room.roomId && payload.show_room_tile) {
        setImmediate(() => {
          this.scrollIntoView();
        });
      }
    });
    (0, _defineProperty2.default)(this, "onRoomPreviewChanged", room => {
      if (this.props.room && room.roomId === this.props.room.roomId) {
        this.generatePreview();
      }
    });
    (0, _defineProperty2.default)(this, "onCallChanged", (call, roomId) => {
      if (roomId === this.props.room?.roomId) this.setState({
        call
      });
    });
    (0, _defineProperty2.default)(this, "scrollIntoView", () => {
      if (!this.roomTileRef.current) return;
      this.roomTileRef.current.scrollIntoView({
        block: "nearest",
        behavior: "auto"
      });
    });
    (0, _defineProperty2.default)(this, "onTileClick", async ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getAccessibilityAction(ev);

      _dispatcher.default.dispatch({
        action: _actions.Action.ViewRoom,
        show_room_tile: true,
        // make sure the room is visible in the list
        room_id: this.props.room.roomId,
        clear_search: [_KeyboardShortcuts.KeyBindingAction.Enter, _KeyboardShortcuts.KeyBindingAction.Space].includes(action),
        metricsTrigger: "RoomList",
        metricsViaKeyboard: ev.type !== "click"
      });
    });
    (0, _defineProperty2.default)(this, "onActiveRoomUpdate", isActive => {
      this.setState({
        selected: isActive
      });
    });
    (0, _defineProperty2.default)(this, "onNotificationsMenuOpenClick", ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const target = ev.target;
      this.setState({
        notificationsMenuPosition: target.getBoundingClientRect()
      });

      _PosthogTrackers.default.trackInteraction("WebRoomListRoomTileNotificationsMenu", ev);
    });
    (0, _defineProperty2.default)(this, "onCloseNotificationsMenu", () => {
      this.setState({
        notificationsMenuPosition: null
      });
    });
    (0, _defineProperty2.default)(this, "onGeneralMenuOpenClick", ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const target = ev.target;
      this.setState({
        generalMenuPosition: target.getBoundingClientRect()
      });
    });
    (0, _defineProperty2.default)(this, "onContextMenu", ev => {
      // If we don't have a context menu to show, ignore the action.
      if (!this.showContextMenu) return;
      ev.preventDefault();
      ev.stopPropagation();
      this.setState({
        generalMenuPosition: {
          left: ev.clientX,
          bottom: ev.clientY
        }
      });
    });
    (0, _defineProperty2.default)(this, "onCloseGeneralMenu", () => {
      this.setState({
        generalMenuPosition: null
      });
    });
    this.state = {
      selected: _RoomViewStore.RoomViewStore.instance.getRoomId() === this.props.room.roomId,
      notificationsMenuPosition: null,
      generalMenuPosition: null,
      call: _CallStore.CallStore.instance.get(this.props.room.roomId),
      // generatePreview() will return nothing if the user has previews disabled
      messagePreview: ""
    };
    this.generatePreview();
    this.notificationState = _RoomNotificationStateStore.RoomNotificationStateStore.instance.getRoomState(this.props.room);
    this.roomProps = _EchoChamber.EchoChamber.forRoom(this.props.room);
  }

  get showContextMenu() {
    return this.props.tag !== _models.DefaultTagID.Invite;
  }

  get showMessagePreview() {
    return !this.props.isMinimized && this.props.showMessagePreview;
  }

  componentDidUpdate(prevProps, prevState) {
    const showMessageChanged = prevProps.showMessagePreview !== this.props.showMessagePreview;
    const minimizedChanged = prevProps.isMinimized !== this.props.isMinimized;

    if (showMessageChanged || minimizedChanged) {
      this.generatePreview();
    }

    if (prevProps.room?.roomId !== this.props.room?.roomId) {
      _MessagePreviewStore.MessagePreviewStore.instance.off(_MessagePreviewStore.MessagePreviewStore.getPreviewChangedEventName(prevProps.room), this.onRoomPreviewChanged);

      _MessagePreviewStore.MessagePreviewStore.instance.on(_MessagePreviewStore.MessagePreviewStore.getPreviewChangedEventName(this.props.room), this.onRoomPreviewChanged);

      prevProps.room?.off(_room.RoomEvent.Name, this.onRoomNameUpdate);
      this.props.room?.on(_room.RoomEvent.Name, this.onRoomNameUpdate);
    }
  }

  componentDidMount() {
    // when we're first rendered (or our sublist is expanded) make sure we are visible if we're active
    if (this.state.selected) {
      this.scrollIntoView();
    }

    _RoomViewStore.RoomViewStore.instance.addRoomListener(this.props.room.roomId, this.onActiveRoomUpdate);

    this.dispatcherRef = _dispatcher.default.register(this.onAction);

    _MessagePreviewStore.MessagePreviewStore.instance.on(_MessagePreviewStore.MessagePreviewStore.getPreviewChangedEventName(this.props.room), this.onRoomPreviewChanged);

    this.notificationState.on(_NotificationState.NotificationStateEvents.Update, this.onNotificationUpdate);
    this.roomProps.on(_GenericEchoChamber.PROPERTY_UPDATED, this.onRoomPropertyUpdate);
    this.props.room.on(_room.RoomEvent.Name, this.onRoomNameUpdate);

    _CallStore.CallStore.instance.on(_CallStore.CallStoreEvent.Call, this.onCallChanged); // Recalculate the call for this room, since it could've changed between
    // construction and mounting


    this.setState({
      call: _CallStore.CallStore.instance.get(this.props.room.roomId)
    });
  }

  componentWillUnmount() {
    _RoomViewStore.RoomViewStore.instance.removeRoomListener(this.props.room.roomId, this.onActiveRoomUpdate);

    _MessagePreviewStore.MessagePreviewStore.instance.off(_MessagePreviewStore.MessagePreviewStore.getPreviewChangedEventName(this.props.room), this.onRoomPreviewChanged);

    this.props.room.off(_room.RoomEvent.Name, this.onRoomNameUpdate);

    _dispatcher.default.unregister(this.dispatcherRef);

    this.notificationState.off(_NotificationState.NotificationStateEvents.Update, this.onNotificationUpdate);
    this.roomProps.off(_GenericEchoChamber.PROPERTY_UPDATED, this.onRoomPropertyUpdate);

    _CallStore.CallStore.instance.off(_CallStore.CallStoreEvent.Call, this.onCallChanged);
  }

  async generatePreview() {
    if (!this.showMessagePreview) {
      return null;
    }

    const messagePreview = await _MessagePreviewStore.MessagePreviewStore.instance.getPreviewForRoom(this.props.room, this.props.tag);
    this.setState({
      messagePreview
    });
  }

  renderNotificationsMenu(isActive) {
    if (_MatrixClientPeg.MatrixClientPeg.get().isGuest() || this.props.tag === _models.DefaultTagID.Archived || !this.showContextMenu || this.props.isMinimized) {
      // the menu makes no sense in these cases so do not show one
      return null;
    }

    const state = this.roomProps.notificationVolume;
    const classes = (0, _classnames.default)("mx_RoomTile_notificationsButton", {
      // Show bell icon for the default case too.
      mx_RoomNotificationContextMenu_iconBell: state === _RoomNotifs.RoomNotifState.AllMessages,
      mx_RoomNotificationContextMenu_iconBellDot: state === _RoomNotifs.RoomNotifState.AllMessagesLoud,
      mx_RoomNotificationContextMenu_iconBellMentions: state === _RoomNotifs.RoomNotifState.MentionsOnly,
      mx_RoomNotificationContextMenu_iconBellCrossed: state === _RoomNotifs.RoomNotifState.Mute,
      // Only show the icon by default if the room is overridden to muted.
      // TODO: [FTUE Notifications] Probably need to detect global mute state
      mx_RoomTile_notificationsButton_show: state === _RoomNotifs.RoomNotifState.Mute
    });
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_ContextMenu.ContextMenuTooltipButton, {
      className: classes,
      onClick: this.onNotificationsMenuOpenClick,
      title: (0, _languageHandler._t)("Notification options"),
      isExpanded: !!this.state.notificationsMenuPosition,
      tabIndex: isActive ? 0 : -1
    }), this.state.notificationsMenuPosition && /*#__PURE__*/_react.default.createElement(_RoomNotificationContextMenu.RoomNotificationContextMenu, (0, _extends2.default)({}, contextMenuBelow(this.state.notificationsMenuPosition), {
      onFinished: this.onCloseNotificationsMenu,
      room: this.props.room
    })));
  }

  renderGeneralMenu() {
    if (!this.showContextMenu) return null; // no menu to show

    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_ContextMenu.ContextMenuTooltipButton, {
      className: "mx_RoomTile_menuButton",
      onClick: this.onGeneralMenuOpenClick,
      title: (0, _languageHandler._t)("Room options"),
      isExpanded: !!this.state.generalMenuPosition
    }), this.state.generalMenuPosition && /*#__PURE__*/_react.default.createElement(_RoomGeneralContextMenu.RoomGeneralContextMenu, (0, _extends2.default)({}, contextMenuBelow(this.state.generalMenuPosition), {
      onFinished: this.onCloseGeneralMenu,
      room: this.props.room,
      onPostFavoriteClick: ev => _PosthogTrackers.default.trackInteraction("WebRoomListRoomTileContextMenuFavouriteToggle", ev),
      onPostInviteClick: ev => _PosthogTrackers.default.trackInteraction("WebRoomListRoomTileContextMenuInviteItem", ev),
      onPostSettingsClick: ev => _PosthogTrackers.default.trackInteraction("WebRoomListRoomTileContextMenuSettingsItem", ev),
      onPostLeaveClick: ev => _PosthogTrackers.default.trackInteraction("WebRoomListRoomTileContextMenuLeaveItem", ev)
    })));
  }

  render() {
    const classes = (0, _classnames.default)({
      'mx_RoomTile': true,
      'mx_RoomTile_selected': this.state.selected,
      'mx_RoomTile_hasMenuOpen': !!(this.state.generalMenuPosition || this.state.notificationsMenuPosition),
      'mx_RoomTile_minimized': this.props.isMinimized
    });
    let name = this.props.room.name;
    if (typeof name !== 'string') name = '';
    name = name.replace(":", ":\u200b"); // add a zero-width space to allow linewrapping after the colon

    let badge;

    if (!this.props.isMinimized && this.notificationState) {
      // aria-hidden because we summarise the unread count/highlight status in a manual aria-label below
      badge = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_RoomTile_badgeContainer",
        "aria-hidden": "true"
      }, /*#__PURE__*/_react.default.createElement(_NotificationBadge.default, {
        notification: this.notificationState,
        forceCount: false,
        roomId: this.props.room.roomId
      }));
    }

    let subtitle;

    if (this.state.call) {
      subtitle = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_RoomTile_subtitle"
      }, /*#__PURE__*/_react.default.createElement(_RoomTileCallSummary.RoomTileCallSummary, {
        call: this.state.call
      }));
    } else if (this.showMessagePreview && this.state.messagePreview) {
      subtitle = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_RoomTile_subtitle",
        id: messagePreviewId(this.props.room.roomId),
        title: this.state.messagePreview
      }, this.state.messagePreview);
    }

    const titleClasses = (0, _classnames.default)({
      "mx_RoomTile_title": true,
      "mx_RoomTile_titleWithSubtitle": !!subtitle,
      "mx_RoomTile_titleHasUnreadEvents": this.notificationState.isUnread
    });
    const titleContainer = this.props.isMinimized ? null : /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomTile_titleContainer"
    }, /*#__PURE__*/_react.default.createElement("div", {
      title: name,
      className: titleClasses,
      tabIndex: -1
    }, /*#__PURE__*/_react.default.createElement("span", {
      dir: "auto"
    }, name)), subtitle);
    let ariaLabel = name; // The following labels are written in such a fashion to increase screen reader efficiency (speed).

    if (this.props.tag === _models.DefaultTagID.Invite) {// append nothing
    } else if (this.notificationState.hasMentions) {
      ariaLabel += " " + (0, _languageHandler._t)("%(count)s unread messages including mentions.", {
        count: this.notificationState.count
      });
    } else if (this.notificationState.hasUnreadCount) {
      ariaLabel += " " + (0, _languageHandler._t)("%(count)s unread messages.", {
        count: this.notificationState.count
      });
    } else if (this.notificationState.isUnread) {
      ariaLabel += " " + (0, _languageHandler._t)("Unread messages.");
    }

    let ariaDescribedBy;

    if (this.showMessagePreview) {
      ariaDescribedBy = messagePreviewId(this.props.room.roomId);
    }

    const props = {};
    let Button = _AccessibleButton.default;

    if (this.props.isMinimized) {
      Button = _AccessibleTooltipButton.default;
      props.title = name; // force the tooltip to hide whilst we are showing the context menu

      props.forceHide = !!this.state.generalMenuPosition;
    }

    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_RovingTabIndex.RovingTabIndexWrapper, {
      inputRef: this.roomTileRef
    }, _ref => {
      let {
        onFocus,
        isActive,
        ref
      } = _ref;
      return /*#__PURE__*/_react.default.createElement(Button, (0, _extends2.default)({}, props, {
        onFocus: onFocus,
        tabIndex: isActive ? 0 : -1,
        inputRef: ref,
        className: classes,
        onClick: this.onTileClick,
        onContextMenu: this.onContextMenu,
        role: "treeitem",
        "aria-label": ariaLabel,
        "aria-selected": this.state.selected,
        "aria-describedby": ariaDescribedBy
      }), /*#__PURE__*/_react.default.createElement(_DecoratedRoomAvatar.default, {
        room: this.props.room,
        avatarSize: 32,
        displayBadge: this.props.isMinimized,
        tooltipProps: {
          tabIndex: isActive ? 0 : -1
        }
      }), titleContainer, badge, this.renderGeneralMenu(), this.renderNotificationsMenu(isActive));
    }));
  }

}

exports.default = RoomTile;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtZXNzYWdlUHJldmlld0lkIiwicm9vbUlkIiwiY29udGV4dE1lbnVCZWxvdyIsImVsZW1lbnRSZWN0IiwibGVmdCIsIndpbmRvdyIsInNjcm9sbFgiLCJ0b3AiLCJib3R0b20iLCJzY3JvbGxZIiwiY2hldnJvbkZhY2UiLCJDaGV2cm9uRmFjZSIsIk5vbmUiLCJSb29tVGlsZSIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjcmVhdGVSZWYiLCJyb29tIiwiZm9yY2VVcGRhdGUiLCJwcm9wZXJ0eSIsIkNhY2hlZFJvb21LZXkiLCJOb3RpZmljYXRpb25Wb2x1bWUiLCJvbk5vdGlmaWNhdGlvblVwZGF0ZSIsInBheWxvYWQiLCJhY3Rpb24iLCJBY3Rpb24iLCJWaWV3Um9vbSIsInJvb21faWQiLCJzaG93X3Jvb21fdGlsZSIsInNldEltbWVkaWF0ZSIsInNjcm9sbEludG9WaWV3IiwiZ2VuZXJhdGVQcmV2aWV3IiwiY2FsbCIsInNldFN0YXRlIiwicm9vbVRpbGVSZWYiLCJjdXJyZW50IiwiYmxvY2siLCJiZWhhdmlvciIsImV2IiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJnZXRLZXlCaW5kaW5nc01hbmFnZXIiLCJnZXRBY2Nlc3NpYmlsaXR5QWN0aW9uIiwiZGVmYXVsdERpc3BhdGNoZXIiLCJkaXNwYXRjaCIsImNsZWFyX3NlYXJjaCIsIktleUJpbmRpbmdBY3Rpb24iLCJFbnRlciIsIlNwYWNlIiwiaW5jbHVkZXMiLCJtZXRyaWNzVHJpZ2dlciIsIm1ldHJpY3NWaWFLZXlib2FyZCIsInR5cGUiLCJpc0FjdGl2ZSIsInNlbGVjdGVkIiwidGFyZ2V0Iiwibm90aWZpY2F0aW9uc01lbnVQb3NpdGlvbiIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsIlBvc3Rob2dUcmFja2VycyIsInRyYWNrSW50ZXJhY3Rpb24iLCJnZW5lcmFsTWVudVBvc2l0aW9uIiwic2hvd0NvbnRleHRNZW51IiwiY2xpZW50WCIsImNsaWVudFkiLCJzdGF0ZSIsIlJvb21WaWV3U3RvcmUiLCJpbnN0YW5jZSIsImdldFJvb21JZCIsIkNhbGxTdG9yZSIsImdldCIsIm1lc3NhZ2VQcmV2aWV3Iiwibm90aWZpY2F0aW9uU3RhdGUiLCJSb29tTm90aWZpY2F0aW9uU3RhdGVTdG9yZSIsImdldFJvb21TdGF0ZSIsInJvb21Qcm9wcyIsIkVjaG9DaGFtYmVyIiwiZm9yUm9vbSIsInRhZyIsIkRlZmF1bHRUYWdJRCIsIkludml0ZSIsInNob3dNZXNzYWdlUHJldmlldyIsImlzTWluaW1pemVkIiwiY29tcG9uZW50RGlkVXBkYXRlIiwicHJldlByb3BzIiwicHJldlN0YXRlIiwic2hvd01lc3NhZ2VDaGFuZ2VkIiwibWluaW1pemVkQ2hhbmdlZCIsIk1lc3NhZ2VQcmV2aWV3U3RvcmUiLCJvZmYiLCJnZXRQcmV2aWV3Q2hhbmdlZEV2ZW50TmFtZSIsIm9uUm9vbVByZXZpZXdDaGFuZ2VkIiwib24iLCJSb29tRXZlbnQiLCJOYW1lIiwib25Sb29tTmFtZVVwZGF0ZSIsImNvbXBvbmVudERpZE1vdW50IiwiYWRkUm9vbUxpc3RlbmVyIiwib25BY3RpdmVSb29tVXBkYXRlIiwiZGlzcGF0Y2hlclJlZiIsInJlZ2lzdGVyIiwib25BY3Rpb24iLCJOb3RpZmljYXRpb25TdGF0ZUV2ZW50cyIsIlVwZGF0ZSIsIlBST1BFUlRZX1VQREFURUQiLCJvblJvb21Qcm9wZXJ0eVVwZGF0ZSIsIkNhbGxTdG9yZUV2ZW50IiwiQ2FsbCIsIm9uQ2FsbENoYW5nZWQiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInJlbW92ZVJvb21MaXN0ZW5lciIsInVucmVnaXN0ZXIiLCJnZXRQcmV2aWV3Rm9yUm9vbSIsInJlbmRlck5vdGlmaWNhdGlvbnNNZW51IiwiTWF0cml4Q2xpZW50UGVnIiwiaXNHdWVzdCIsIkFyY2hpdmVkIiwibm90aWZpY2F0aW9uVm9sdW1lIiwiY2xhc3NlcyIsImNsYXNzTmFtZXMiLCJteF9Sb29tTm90aWZpY2F0aW9uQ29udGV4dE1lbnVfaWNvbkJlbGwiLCJSb29tTm90aWZTdGF0ZSIsIkFsbE1lc3NhZ2VzIiwibXhfUm9vbU5vdGlmaWNhdGlvbkNvbnRleHRNZW51X2ljb25CZWxsRG90IiwiQWxsTWVzc2FnZXNMb3VkIiwibXhfUm9vbU5vdGlmaWNhdGlvbkNvbnRleHRNZW51X2ljb25CZWxsTWVudGlvbnMiLCJNZW50aW9uc09ubHkiLCJteF9Sb29tTm90aWZpY2F0aW9uQ29udGV4dE1lbnVfaWNvbkJlbGxDcm9zc2VkIiwiTXV0ZSIsIm14X1Jvb21UaWxlX25vdGlmaWNhdGlvbnNCdXR0b25fc2hvdyIsIm9uTm90aWZpY2F0aW9uc01lbnVPcGVuQ2xpY2siLCJfdCIsIm9uQ2xvc2VOb3RpZmljYXRpb25zTWVudSIsInJlbmRlckdlbmVyYWxNZW51Iiwib25HZW5lcmFsTWVudU9wZW5DbGljayIsIm9uQ2xvc2VHZW5lcmFsTWVudSIsInJlbmRlciIsIm5hbWUiLCJyZXBsYWNlIiwiYmFkZ2UiLCJzdWJ0aXRsZSIsInRpdGxlQ2xhc3NlcyIsImlzVW5yZWFkIiwidGl0bGVDb250YWluZXIiLCJhcmlhTGFiZWwiLCJoYXNNZW50aW9ucyIsImNvdW50IiwiaGFzVW5yZWFkQ291bnQiLCJhcmlhRGVzY3JpYmVkQnkiLCJCdXR0b24iLCJBY2Nlc3NpYmxlQnV0dG9uIiwiQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24iLCJ0aXRsZSIsImZvcmNlSGlkZSIsIm9uRm9jdXMiLCJyZWYiLCJvblRpbGVDbGljayIsIm9uQ29udGV4dE1lbnUiLCJ0YWJJbmRleCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL1Jvb21UaWxlLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTggTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5Db3B5cmlnaHQgMjAxNS0yMDE3LCAyMDE5LTIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgY3JlYXRlUmVmIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBSb29tLCBSb29tRXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5cbmltcG9ydCB0eXBlIHsgQ2FsbCB9IGZyb20gXCIuLi8uLi8uLi9tb2RlbHMvQ2FsbFwiO1xuaW1wb3J0IHsgUm92aW5nVGFiSW5kZXhXcmFwcGVyIH0gZnJvbSBcIi4uLy4uLy4uL2FjY2Vzc2liaWxpdHkvUm92aW5nVGFiSW5kZXhcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uLCB7IEJ1dHRvbkV2ZW50IH0gZnJvbSBcIi4uLy4uL3ZpZXdzL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBkZWZhdWx0RGlzcGF0Y2hlciBmcm9tICcuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgeyBDaGV2cm9uRmFjZSwgQ29udGV4dE1lbnVUb29sdGlwQnV0dG9uIH0gZnJvbSBcIi4uLy4uL3N0cnVjdHVyZXMvQ29udGV4dE1lbnVcIjtcbmltcG9ydCB7IERlZmF1bHRUYWdJRCwgVGFnSUQgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL3Jvb20tbGlzdC9tb2RlbHNcIjtcbmltcG9ydCB7IE1lc3NhZ2VQcmV2aWV3U3RvcmUgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL3Jvb20tbGlzdC9NZXNzYWdlUHJldmlld1N0b3JlXCI7XG5pbXBvcnQgRGVjb3JhdGVkUm9vbUF2YXRhciBmcm9tIFwiLi4vYXZhdGFycy9EZWNvcmF0ZWRSb29tQXZhdGFyXCI7XG5pbXBvcnQgeyBSb29tTm90aWZTdGF0ZSB9IGZyb20gXCIuLi8uLi8uLi9Sb29tTm90aWZzXCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tIFwiLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgeyBSb29tTm90aWZpY2F0aW9uQ29udGV4dE1lbnUgfSBmcm9tIFwiLi4vY29udGV4dF9tZW51cy9Sb29tTm90aWZpY2F0aW9uQ29udGV4dE1lbnVcIjtcbmltcG9ydCBOb3RpZmljYXRpb25CYWRnZSBmcm9tIFwiLi9Ob3RpZmljYXRpb25CYWRnZVwiO1xuaW1wb3J0IHsgQWN0aW9uUGF5bG9hZCB9IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzXCI7XG5pbXBvcnQgeyBSb29tTm90aWZpY2F0aW9uU3RhdGVTdG9yZSB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvbm90aWZpY2F0aW9ucy9Sb29tTm90aWZpY2F0aW9uU3RhdGVTdG9yZVwiO1xuaW1wb3J0IHsgTm90aWZpY2F0aW9uU3RhdGUsIE5vdGlmaWNhdGlvblN0YXRlRXZlbnRzIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9ub3RpZmljYXRpb25zL05vdGlmaWNhdGlvblN0YXRlXCI7XG5pbXBvcnQgQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVUb29sdGlwQnV0dG9uXCI7XG5pbXBvcnQgeyBFY2hvQ2hhbWJlciB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvbG9jYWwtZWNoby9FY2hvQ2hhbWJlclwiO1xuaW1wb3J0IHsgQ2FjaGVkUm9vbUtleSwgUm9vbUVjaG9DaGFtYmVyIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9sb2NhbC1lY2hvL1Jvb21FY2hvQ2hhbWJlclwiO1xuaW1wb3J0IHsgUFJPUEVSVFlfVVBEQVRFRCB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvbG9jYWwtZWNoby9HZW5lcmljRWNob0NoYW1iZXJcIjtcbmltcG9ydCBQb3N0aG9nVHJhY2tlcnMgZnJvbSBcIi4uLy4uLy4uL1Bvc3Rob2dUcmFja2Vyc1wiO1xuaW1wb3J0IHsgVmlld1Jvb21QYXlsb2FkIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvVmlld1Jvb21QYXlsb2FkXCI7XG5pbXBvcnQgeyBLZXlCaW5kaW5nQWN0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL2FjY2Vzc2liaWxpdHkvS2V5Ym9hcmRTaG9ydGN1dHNcIjtcbmltcG9ydCB7IGdldEtleUJpbmRpbmdzTWFuYWdlciB9IGZyb20gXCIuLi8uLi8uLi9LZXlCaW5kaW5nc01hbmFnZXJcIjtcbmltcG9ydCB7IFJvb21WaWV3U3RvcmUgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL1Jvb21WaWV3U3RvcmVcIjtcbmltcG9ydCB7IFJvb21UaWxlQ2FsbFN1bW1hcnkgfSBmcm9tIFwiLi9Sb29tVGlsZUNhbGxTdW1tYXJ5XCI7XG5pbXBvcnQgeyBSb29tR2VuZXJhbENvbnRleHRNZW51IH0gZnJvbSBcIi4uL2NvbnRleHRfbWVudXMvUm9vbUdlbmVyYWxDb250ZXh0TWVudVwiO1xuaW1wb3J0IHsgQ2FsbFN0b3JlLCBDYWxsU3RvcmVFdmVudCB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvQ2FsbFN0b3JlXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHJvb206IFJvb207XG4gICAgc2hvd01lc3NhZ2VQcmV2aWV3OiBib29sZWFuO1xuICAgIGlzTWluaW1pemVkOiBib29sZWFuO1xuICAgIHRhZzogVGFnSUQ7XG59XG5cbnR5cGUgUGFydGlhbERPTVJlY3QgPSBQaWNrPERPTVJlY3QsIFwibGVmdFwiIHwgXCJib3R0b21cIj47XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIHNlbGVjdGVkOiBib29sZWFuO1xuICAgIG5vdGlmaWNhdGlvbnNNZW51UG9zaXRpb246IFBhcnRpYWxET01SZWN0O1xuICAgIGdlbmVyYWxNZW51UG9zaXRpb246IFBhcnRpYWxET01SZWN0O1xuICAgIGNhbGw6IENhbGwgfCBudWxsO1xuICAgIG1lc3NhZ2VQcmV2aWV3Pzogc3RyaW5nO1xufVxuXG5jb25zdCBtZXNzYWdlUHJldmlld0lkID0gKHJvb21JZDogc3RyaW5nKSA9PiBgbXhfUm9vbVRpbGVfbWVzc2FnZVByZXZpZXdfJHtyb29tSWR9YDtcblxuZXhwb3J0IGNvbnN0IGNvbnRleHRNZW51QmVsb3cgPSAoZWxlbWVudFJlY3Q6IFBhcnRpYWxET01SZWN0KSA9PiB7XG4gICAgLy8gYWxpZ24gdGhlIGNvbnRleHQgbWVudSdzIGljb25zIHdpdGggdGhlIGljb24gd2hpY2ggb3BlbmVkIHRoZSBjb250ZXh0IG1lbnVcbiAgICBjb25zdCBsZWZ0ID0gZWxlbWVudFJlY3QubGVmdCArIHdpbmRvdy5zY3JvbGxYIC0gOTtcbiAgICBjb25zdCB0b3AgPSBlbGVtZW50UmVjdC5ib3R0b20gKyB3aW5kb3cuc2Nyb2xsWSArIDE3O1xuICAgIGNvbnN0IGNoZXZyb25GYWNlID0gQ2hldnJvbkZhY2UuTm9uZTtcbiAgICByZXR1cm4geyBsZWZ0LCB0b3AsIGNoZXZyb25GYWNlIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSb29tVGlsZSBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIGRpc3BhdGNoZXJSZWY6IHN0cmluZztcbiAgICBwcml2YXRlIHJvb21UaWxlUmVmID0gY3JlYXRlUmVmPEhUTUxEaXZFbGVtZW50PigpO1xuICAgIHByaXZhdGUgbm90aWZpY2F0aW9uU3RhdGU6IE5vdGlmaWNhdGlvblN0YXRlO1xuICAgIHByaXZhdGUgcm9vbVByb3BzOiBSb29tRWNob0NoYW1iZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgc2VsZWN0ZWQ6IFJvb21WaWV3U3RvcmUuaW5zdGFuY2UuZ2V0Um9vbUlkKCkgPT09IHRoaXMucHJvcHMucm9vbS5yb29tSWQsXG4gICAgICAgICAgICBub3RpZmljYXRpb25zTWVudVBvc2l0aW9uOiBudWxsLFxuICAgICAgICAgICAgZ2VuZXJhbE1lbnVQb3NpdGlvbjogbnVsbCxcbiAgICAgICAgICAgIGNhbGw6IENhbGxTdG9yZS5pbnN0YW5jZS5nZXQodGhpcy5wcm9wcy5yb29tLnJvb21JZCksXG4gICAgICAgICAgICAvLyBnZW5lcmF0ZVByZXZpZXcoKSB3aWxsIHJldHVybiBub3RoaW5nIGlmIHRoZSB1c2VyIGhhcyBwcmV2aWV3cyBkaXNhYmxlZFxuICAgICAgICAgICAgbWVzc2FnZVByZXZpZXc6IFwiXCIsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZ2VuZXJhdGVQcmV2aWV3KCk7XG5cbiAgICAgICAgdGhpcy5ub3RpZmljYXRpb25TdGF0ZSA9IFJvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlLmluc3RhbmNlLmdldFJvb21TdGF0ZSh0aGlzLnByb3BzLnJvb20pO1xuICAgICAgICB0aGlzLnJvb21Qcm9wcyA9IEVjaG9DaGFtYmVyLmZvclJvb20odGhpcy5wcm9wcy5yb29tKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUm9vbU5hbWVVcGRhdGUgPSAocm9vbTogUm9vbSkgPT4ge1xuICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Ob3RpZmljYXRpb25VcGRhdGUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTsgLy8gbm90aWZpY2F0aW9uIHN0YXRlIGNoYW5nZWQgLSB1cGRhdGVcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJvb21Qcm9wZXJ0eVVwZGF0ZSA9IChwcm9wZXJ0eTogQ2FjaGVkUm9vbUtleSkgPT4ge1xuICAgICAgICBpZiAocHJvcGVydHkgPT09IENhY2hlZFJvb21LZXkuTm90aWZpY2F0aW9uVm9sdW1lKSB0aGlzLm9uTm90aWZpY2F0aW9uVXBkYXRlKCk7XG4gICAgICAgIC8vIGVsc2UgaWdub3JlIC0gbm90IGltcG9ydGFudCBmb3IgdGhpcyB0aWxlXG4gICAgfTtcblxuICAgIHByaXZhdGUgZ2V0IHNob3dDb250ZXh0TWVudSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMudGFnICE9PSBEZWZhdWx0VGFnSUQuSW52aXRlO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0IHNob3dNZXNzYWdlUHJldmlldygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICF0aGlzLnByb3BzLmlzTWluaW1pemVkICYmIHRoaXMucHJvcHMuc2hvd01lc3NhZ2VQcmV2aWV3O1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzOiBSZWFkb25seTxJUHJvcHM+LCBwcmV2U3RhdGU6IFJlYWRvbmx5PElTdGF0ZT4pIHtcbiAgICAgICAgY29uc3Qgc2hvd01lc3NhZ2VDaGFuZ2VkID0gcHJldlByb3BzLnNob3dNZXNzYWdlUHJldmlldyAhPT0gdGhpcy5wcm9wcy5zaG93TWVzc2FnZVByZXZpZXc7XG4gICAgICAgIGNvbnN0IG1pbmltaXplZENoYW5nZWQgPSBwcmV2UHJvcHMuaXNNaW5pbWl6ZWQgIT09IHRoaXMucHJvcHMuaXNNaW5pbWl6ZWQ7XG4gICAgICAgIGlmIChzaG93TWVzc2FnZUNoYW5nZWQgfHwgbWluaW1pemVkQ2hhbmdlZCkge1xuICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZVByZXZpZXcoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJldlByb3BzLnJvb20/LnJvb21JZCAhPT0gdGhpcy5wcm9wcy5yb29tPy5yb29tSWQpIHtcbiAgICAgICAgICAgIE1lc3NhZ2VQcmV2aWV3U3RvcmUuaW5zdGFuY2Uub2ZmKFxuICAgICAgICAgICAgICAgIE1lc3NhZ2VQcmV2aWV3U3RvcmUuZ2V0UHJldmlld0NoYW5nZWRFdmVudE5hbWUocHJldlByb3BzLnJvb20pLFxuICAgICAgICAgICAgICAgIHRoaXMub25Sb29tUHJldmlld0NoYW5nZWQsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgTWVzc2FnZVByZXZpZXdTdG9yZS5pbnN0YW5jZS5vbihcbiAgICAgICAgICAgICAgICBNZXNzYWdlUHJldmlld1N0b3JlLmdldFByZXZpZXdDaGFuZ2VkRXZlbnROYW1lKHRoaXMucHJvcHMucm9vbSksXG4gICAgICAgICAgICAgICAgdGhpcy5vblJvb21QcmV2aWV3Q2hhbmdlZCxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBwcmV2UHJvcHMucm9vbT8ub2ZmKFJvb21FdmVudC5OYW1lLCB0aGlzLm9uUm9vbU5hbWVVcGRhdGUpO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5yb29tPy5vbihSb29tRXZlbnQuTmFtZSwgdGhpcy5vblJvb21OYW1lVXBkYXRlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgLy8gd2hlbiB3ZSdyZSBmaXJzdCByZW5kZXJlZCAob3Igb3VyIHN1Ymxpc3QgaXMgZXhwYW5kZWQpIG1ha2Ugc3VyZSB3ZSBhcmUgdmlzaWJsZSBpZiB3ZSdyZSBhY3RpdmVcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsSW50b1ZpZXcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIFJvb21WaWV3U3RvcmUuaW5zdGFuY2UuYWRkUm9vbUxpc3RlbmVyKHRoaXMucHJvcHMucm9vbS5yb29tSWQsIHRoaXMub25BY3RpdmVSb29tVXBkYXRlKTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyUmVmID0gZGVmYXVsdERpc3BhdGNoZXIucmVnaXN0ZXIodGhpcy5vbkFjdGlvbik7XG4gICAgICAgIE1lc3NhZ2VQcmV2aWV3U3RvcmUuaW5zdGFuY2Uub24oXG4gICAgICAgICAgICBNZXNzYWdlUHJldmlld1N0b3JlLmdldFByZXZpZXdDaGFuZ2VkRXZlbnROYW1lKHRoaXMucHJvcHMucm9vbSksXG4gICAgICAgICAgICB0aGlzLm9uUm9vbVByZXZpZXdDaGFuZ2VkLFxuICAgICAgICApO1xuICAgICAgICB0aGlzLm5vdGlmaWNhdGlvblN0YXRlLm9uKE5vdGlmaWNhdGlvblN0YXRlRXZlbnRzLlVwZGF0ZSwgdGhpcy5vbk5vdGlmaWNhdGlvblVwZGF0ZSk7XG4gICAgICAgIHRoaXMucm9vbVByb3BzLm9uKFBST1BFUlRZX1VQREFURUQsIHRoaXMub25Sb29tUHJvcGVydHlVcGRhdGUpO1xuICAgICAgICB0aGlzLnByb3BzLnJvb20ub24oUm9vbUV2ZW50Lk5hbWUsIHRoaXMub25Sb29tTmFtZVVwZGF0ZSk7XG4gICAgICAgIENhbGxTdG9yZS5pbnN0YW5jZS5vbihDYWxsU3RvcmVFdmVudC5DYWxsLCB0aGlzLm9uQ2FsbENoYW5nZWQpO1xuXG4gICAgICAgIC8vIFJlY2FsY3VsYXRlIHRoZSBjYWxsIGZvciB0aGlzIHJvb20sIHNpbmNlIGl0IGNvdWxkJ3ZlIGNoYW5nZWQgYmV0d2VlblxuICAgICAgICAvLyBjb25zdHJ1Y3Rpb24gYW5kIG1vdW50aW5nXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjYWxsOiBDYWxsU3RvcmUuaW5zdGFuY2UuZ2V0KHRoaXMucHJvcHMucm9vbS5yb29tSWQpIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgUm9vbVZpZXdTdG9yZS5pbnN0YW5jZS5yZW1vdmVSb29tTGlzdGVuZXIodGhpcy5wcm9wcy5yb29tLnJvb21JZCwgdGhpcy5vbkFjdGl2ZVJvb21VcGRhdGUpO1xuICAgICAgICBNZXNzYWdlUHJldmlld1N0b3JlLmluc3RhbmNlLm9mZihcbiAgICAgICAgICAgIE1lc3NhZ2VQcmV2aWV3U3RvcmUuZ2V0UHJldmlld0NoYW5nZWRFdmVudE5hbWUodGhpcy5wcm9wcy5yb29tKSxcbiAgICAgICAgICAgIHRoaXMub25Sb29tUHJldmlld0NoYW5nZWQsXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMucHJvcHMucm9vbS5vZmYoUm9vbUV2ZW50Lk5hbWUsIHRoaXMub25Sb29tTmFtZVVwZGF0ZSk7XG4gICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLnVucmVnaXN0ZXIodGhpcy5kaXNwYXRjaGVyUmVmKTtcbiAgICAgICAgdGhpcy5ub3RpZmljYXRpb25TdGF0ZS5vZmYoTm90aWZpY2F0aW9uU3RhdGVFdmVudHMuVXBkYXRlLCB0aGlzLm9uTm90aWZpY2F0aW9uVXBkYXRlKTtcbiAgICAgICAgdGhpcy5yb29tUHJvcHMub2ZmKFBST1BFUlRZX1VQREFURUQsIHRoaXMub25Sb29tUHJvcGVydHlVcGRhdGUpO1xuICAgICAgICBDYWxsU3RvcmUuaW5zdGFuY2Uub2ZmKENhbGxTdG9yZUV2ZW50LkNhbGwsIHRoaXMub25DYWxsQ2hhbmdlZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkFjdGlvbiA9IChwYXlsb2FkOiBBY3Rpb25QYXlsb2FkKSA9PiB7XG4gICAgICAgIGlmIChwYXlsb2FkLmFjdGlvbiA9PT0gQWN0aW9uLlZpZXdSb29tICYmXG4gICAgICAgICAgICBwYXlsb2FkLnJvb21faWQgPT09IHRoaXMucHJvcHMucm9vbS5yb29tSWQgJiZcbiAgICAgICAgICAgIHBheWxvYWQuc2hvd19yb29tX3RpbGVcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBzZXRJbW1lZGlhdGUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsSW50b1ZpZXcoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Sb29tUHJldmlld0NoYW5nZWQgPSAocm9vbTogUm9vbSkgPT4ge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5yb29tICYmIHJvb20ucm9vbUlkID09PSB0aGlzLnByb3BzLnJvb20ucm9vbUlkKSB7XG4gICAgICAgICAgICB0aGlzLmdlbmVyYXRlUHJldmlldygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25DYWxsQ2hhbmdlZCA9IChjYWxsOiBDYWxsLCByb29tSWQ6IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAocm9vbUlkID09PSB0aGlzLnByb3BzLnJvb20/LnJvb21JZCkgdGhpcy5zZXRTdGF0ZSh7IGNhbGwgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgYXN5bmMgZ2VuZXJhdGVQcmV2aWV3KCkge1xuICAgICAgICBpZiAoIXRoaXMuc2hvd01lc3NhZ2VQcmV2aWV3KSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG1lc3NhZ2VQcmV2aWV3ID0gYXdhaXQgTWVzc2FnZVByZXZpZXdTdG9yZS5pbnN0YW5jZS5nZXRQcmV2aWV3Rm9yUm9vbSh0aGlzLnByb3BzLnJvb20sIHRoaXMucHJvcHMudGFnKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG1lc3NhZ2VQcmV2aWV3IH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2Nyb2xsSW50b1ZpZXcgPSAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5yb29tVGlsZVJlZi5jdXJyZW50KSByZXR1cm47XG4gICAgICAgIHRoaXMucm9vbVRpbGVSZWYuY3VycmVudC5zY3JvbGxJbnRvVmlldyh7XG4gICAgICAgICAgICBibG9jazogXCJuZWFyZXN0XCIsXG4gICAgICAgICAgICBiZWhhdmlvcjogXCJhdXRvXCIsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVGlsZUNsaWNrID0gYXN5bmMgKGV2OiBSZWFjdC5LZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIGNvbnN0IGFjdGlvbiA9IGdldEtleUJpbmRpbmdzTWFuYWdlcigpLmdldEFjY2Vzc2liaWxpdHlBY3Rpb24oZXYpO1xuXG4gICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoPFZpZXdSb29tUGF5bG9hZD4oe1xuICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1Jvb20sXG4gICAgICAgICAgICBzaG93X3Jvb21fdGlsZTogdHJ1ZSwgLy8gbWFrZSBzdXJlIHRoZSByb29tIGlzIHZpc2libGUgaW4gdGhlIGxpc3RcbiAgICAgICAgICAgIHJvb21faWQ6IHRoaXMucHJvcHMucm9vbS5yb29tSWQsXG4gICAgICAgICAgICBjbGVhcl9zZWFyY2g6IFtLZXlCaW5kaW5nQWN0aW9uLkVudGVyLCBLZXlCaW5kaW5nQWN0aW9uLlNwYWNlXS5pbmNsdWRlcyhhY3Rpb24pLFxuICAgICAgICAgICAgbWV0cmljc1RyaWdnZXI6IFwiUm9vbUxpc3RcIixcbiAgICAgICAgICAgIG1ldHJpY3NWaWFLZXlib2FyZDogZXYudHlwZSAhPT0gXCJjbGlja1wiLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkFjdGl2ZVJvb21VcGRhdGUgPSAoaXNBY3RpdmU6IGJvb2xlYW4pID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNlbGVjdGVkOiBpc0FjdGl2ZSB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbk5vdGlmaWNhdGlvbnNNZW51T3BlbkNsaWNrID0gKGV2OiBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBldi50YXJnZXQgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBub3RpZmljYXRpb25zTWVudVBvc2l0aW9uOiB0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkgfSk7XG5cbiAgICAgICAgUG9zdGhvZ1RyYWNrZXJzLnRyYWNrSW50ZXJhY3Rpb24oXCJXZWJSb29tTGlzdFJvb21UaWxlTm90aWZpY2F0aW9uc01lbnVcIiwgZXYpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ2xvc2VOb3RpZmljYXRpb25zTWVudSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG5vdGlmaWNhdGlvbnNNZW51UG9zaXRpb246IG51bGwgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25HZW5lcmFsTWVudU9wZW5DbGljayA9IChldjogUmVhY3QuTW91c2VFdmVudCkgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZXYudGFyZ2V0IGFzIEhUTUxCdXR0b25FbGVtZW50O1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgZ2VuZXJhbE1lbnVQb3NpdGlvbjogdGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ29udGV4dE1lbnUgPSAoZXY6IFJlYWN0Lk1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSBhIGNvbnRleHQgbWVudSB0byBzaG93LCBpZ25vcmUgdGhlIGFjdGlvbi5cbiAgICAgICAgaWYgKCF0aGlzLnNob3dDb250ZXh0TWVudSkgcmV0dXJuO1xuXG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGdlbmVyYWxNZW51UG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICBsZWZ0OiBldi5jbGllbnRYLFxuICAgICAgICAgICAgICAgIGJvdHRvbTogZXYuY2xpZW50WSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ2xvc2VHZW5lcmFsTWVudSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGdlbmVyYWxNZW51UG9zaXRpb246IG51bGwgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgcmVuZGVyTm90aWZpY2F0aW9uc01lbnUoaXNBY3RpdmU6IGJvb2xlYW4pOiBSZWFjdC5SZWFjdEVsZW1lbnQge1xuICAgICAgICBpZiAoTWF0cml4Q2xpZW50UGVnLmdldCgpLmlzR3Vlc3QoKSB8fCB0aGlzLnByb3BzLnRhZyA9PT0gRGVmYXVsdFRhZ0lELkFyY2hpdmVkIHx8XG4gICAgICAgICAgICAhdGhpcy5zaG93Q29udGV4dE1lbnUgfHwgdGhpcy5wcm9wcy5pc01pbmltaXplZFxuICAgICAgICApIHtcbiAgICAgICAgICAgIC8vIHRoZSBtZW51IG1ha2VzIG5vIHNlbnNlIGluIHRoZXNlIGNhc2VzIHNvIGRvIG5vdCBzaG93IG9uZVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzdGF0ZSA9IHRoaXMucm9vbVByb3BzLm5vdGlmaWNhdGlvblZvbHVtZTtcblxuICAgICAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyhcIm14X1Jvb21UaWxlX25vdGlmaWNhdGlvbnNCdXR0b25cIiwge1xuICAgICAgICAgICAgLy8gU2hvdyBiZWxsIGljb24gZm9yIHRoZSBkZWZhdWx0IGNhc2UgdG9vLlxuICAgICAgICAgICAgbXhfUm9vbU5vdGlmaWNhdGlvbkNvbnRleHRNZW51X2ljb25CZWxsOiBzdGF0ZSA9PT0gUm9vbU5vdGlmU3RhdGUuQWxsTWVzc2FnZXMsXG4gICAgICAgICAgICBteF9Sb29tTm90aWZpY2F0aW9uQ29udGV4dE1lbnVfaWNvbkJlbGxEb3Q6IHN0YXRlID09PSBSb29tTm90aWZTdGF0ZS5BbGxNZXNzYWdlc0xvdWQsXG4gICAgICAgICAgICBteF9Sb29tTm90aWZpY2F0aW9uQ29udGV4dE1lbnVfaWNvbkJlbGxNZW50aW9uczogc3RhdGUgPT09IFJvb21Ob3RpZlN0YXRlLk1lbnRpb25zT25seSxcbiAgICAgICAgICAgIG14X1Jvb21Ob3RpZmljYXRpb25Db250ZXh0TWVudV9pY29uQmVsbENyb3NzZWQ6IHN0YXRlID09PSBSb29tTm90aWZTdGF0ZS5NdXRlLFxuXG4gICAgICAgICAgICAvLyBPbmx5IHNob3cgdGhlIGljb24gYnkgZGVmYXVsdCBpZiB0aGUgcm9vbSBpcyBvdmVycmlkZGVuIHRvIG11dGVkLlxuICAgICAgICAgICAgLy8gVE9ETzogW0ZUVUUgTm90aWZpY2F0aW9uc10gUHJvYmFibHkgbmVlZCB0byBkZXRlY3QgZ2xvYmFsIG11dGUgc3RhdGVcbiAgICAgICAgICAgIG14X1Jvb21UaWxlX25vdGlmaWNhdGlvbnNCdXR0b25fc2hvdzogc3RhdGUgPT09IFJvb21Ob3RpZlN0YXRlLk11dGUsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgPENvbnRleHRNZW51VG9vbHRpcEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzZXN9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25Ob3RpZmljYXRpb25zTWVudU9wZW5DbGlja31cbiAgICAgICAgICAgICAgICAgICAgdGl0bGU9e190KFwiTm90aWZpY2F0aW9uIG9wdGlvbnNcIil9XG4gICAgICAgICAgICAgICAgICAgIGlzRXhwYW5kZWQ9eyEhdGhpcy5zdGF0ZS5ub3RpZmljYXRpb25zTWVudVBvc2l0aW9ufVxuICAgICAgICAgICAgICAgICAgICB0YWJJbmRleD17aXNBY3RpdmUgPyAwIDogLTF9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICB7IHRoaXMuc3RhdGUubm90aWZpY2F0aW9uc01lbnVQb3NpdGlvbiAmJiAoXG4gICAgICAgICAgICAgICAgICAgIDxSb29tTm90aWZpY2F0aW9uQ29udGV4dE1lbnVcbiAgICAgICAgICAgICAgICAgICAgICAgIHsuLi5jb250ZXh0TWVudUJlbG93KHRoaXMuc3RhdGUubm90aWZpY2F0aW9uc01lbnVQb3NpdGlvbil9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLm9uQ2xvc2VOb3RpZmljYXRpb25zTWVudX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb209e3RoaXMucHJvcHMucm9vbX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJHZW5lcmFsTWVudSgpOiBSZWFjdC5SZWFjdEVsZW1lbnQge1xuICAgICAgICBpZiAoIXRoaXMuc2hvd0NvbnRleHRNZW51KSByZXR1cm4gbnVsbDsgLy8gbm8gbWVudSB0byBzaG93XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgPENvbnRleHRNZW51VG9vbHRpcEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tVGlsZV9tZW51QnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkdlbmVyYWxNZW51T3BlbkNsaWNrfVxuICAgICAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJSb29tIG9wdGlvbnNcIil9XG4gICAgICAgICAgICAgICAgICAgIGlzRXhwYW5kZWQ9eyEhdGhpcy5zdGF0ZS5nZW5lcmFsTWVudVBvc2l0aW9ufVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgeyB0aGlzLnN0YXRlLmdlbmVyYWxNZW51UG9zaXRpb24gJiYgKFxuICAgICAgICAgICAgICAgICAgICA8Um9vbUdlbmVyYWxDb250ZXh0TWVudVxuICAgICAgICAgICAgICAgICAgICAgICAgey4uLmNvbnRleHRNZW51QmVsb3codGhpcy5zdGF0ZS5nZW5lcmFsTWVudVBvc2l0aW9uKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMub25DbG9zZUdlbmVyYWxNZW51fVxuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbT17dGhpcy5wcm9wcy5yb29tfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25Qb3N0RmF2b3JpdGVDbGljaz17KGV2OiBCdXR0b25FdmVudCkgPT4gUG9zdGhvZ1RyYWNrZXJzLnRyYWNrSW50ZXJhY3Rpb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJXZWJSb29tTGlzdFJvb21UaWxlQ29udGV4dE1lbnVGYXZvdXJpdGVUb2dnbGVcIiwgZXYsXG4gICAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25Qb3N0SW52aXRlQ2xpY2s9eyhldjogQnV0dG9uRXZlbnQpID0+IFBvc3Rob2dUcmFja2Vycy50cmFja0ludGVyYWN0aW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiV2ViUm9vbUxpc3RSb29tVGlsZUNvbnRleHRNZW51SW52aXRlSXRlbVwiLCBldixcbiAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblBvc3RTZXR0aW5nc0NsaWNrPXsoZXY6IEJ1dHRvbkV2ZW50KSA9PiBQb3N0aG9nVHJhY2tlcnMudHJhY2tJbnRlcmFjdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIldlYlJvb21MaXN0Um9vbVRpbGVDb250ZXh0TWVudVNldHRpbmdzSXRlbVwiLCBldixcbiAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblBvc3RMZWF2ZUNsaWNrPXsoZXY6IEJ1dHRvbkV2ZW50KSA9PiBQb3N0aG9nVHJhY2tlcnMudHJhY2tJbnRlcmFjdGlvbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIldlYlJvb21MaXN0Um9vbVRpbGVDb250ZXh0TWVudUxlYXZlSXRlbVwiLCBldixcbiAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIoKTogUmVhY3QuUmVhY3RFbGVtZW50IHtcbiAgICAgICAgY29uc3QgY2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgJ214X1Jvb21UaWxlJzogdHJ1ZSxcbiAgICAgICAgICAgICdteF9Sb29tVGlsZV9zZWxlY3RlZCc6IHRoaXMuc3RhdGUuc2VsZWN0ZWQsXG4gICAgICAgICAgICAnbXhfUm9vbVRpbGVfaGFzTWVudU9wZW4nOiAhISh0aGlzLnN0YXRlLmdlbmVyYWxNZW51UG9zaXRpb24gfHwgdGhpcy5zdGF0ZS5ub3RpZmljYXRpb25zTWVudVBvc2l0aW9uKSxcbiAgICAgICAgICAgICdteF9Sb29tVGlsZV9taW5pbWl6ZWQnOiB0aGlzLnByb3BzLmlzTWluaW1pemVkLFxuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgbmFtZSA9IHRoaXMucHJvcHMucm9vbS5uYW1lO1xuICAgICAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSBuYW1lID0gJyc7XG4gICAgICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoXCI6XCIsIFwiOlxcdTIwMGJcIik7IC8vIGFkZCBhIHplcm8td2lkdGggc3BhY2UgdG8gYWxsb3cgbGluZXdyYXBwaW5nIGFmdGVyIHRoZSBjb2xvblxuXG4gICAgICAgIGxldCBiYWRnZTogUmVhY3QuUmVhY3ROb2RlO1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMuaXNNaW5pbWl6ZWQgJiYgdGhpcy5ub3RpZmljYXRpb25TdGF0ZSkge1xuICAgICAgICAgICAgLy8gYXJpYS1oaWRkZW4gYmVjYXVzZSB3ZSBzdW1tYXJpc2UgdGhlIHVucmVhZCBjb3VudC9oaWdobGlnaHQgc3RhdHVzIGluIGEgbWFudWFsIGFyaWEtbGFiZWwgYmVsb3dcbiAgICAgICAgICAgIGJhZGdlID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbVRpbGVfYmFkZ2VDb250YWluZXJcIiBhcmlhLWhpZGRlbj1cInRydWVcIj5cbiAgICAgICAgICAgICAgICAgICAgPE5vdGlmaWNhdGlvbkJhZGdlXG4gICAgICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb249e3RoaXMubm90aWZpY2F0aW9uU3RhdGV9XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JjZUNvdW50PXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb21JZD17dGhpcy5wcm9wcy5yb29tLnJvb21JZH1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc3VidGl0bGU7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmNhbGwpIHtcbiAgICAgICAgICAgIHN1YnRpdGxlID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbVRpbGVfc3VidGl0bGVcIj5cbiAgICAgICAgICAgICAgICAgICAgPFJvb21UaWxlQ2FsbFN1bW1hcnkgY2FsbD17dGhpcy5zdGF0ZS5jYWxsfSAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnNob3dNZXNzYWdlUHJldmlldyAmJiB0aGlzLnN0YXRlLm1lc3NhZ2VQcmV2aWV3KSB7XG4gICAgICAgICAgICBzdWJ0aXRsZSA9IChcbiAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21UaWxlX3N1YnRpdGxlXCJcbiAgICAgICAgICAgICAgICAgICAgaWQ9e21lc3NhZ2VQcmV2aWV3SWQodGhpcy5wcm9wcy5yb29tLnJvb21JZCl9XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlPXt0aGlzLnN0YXRlLm1lc3NhZ2VQcmV2aWV3fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnN0YXRlLm1lc3NhZ2VQcmV2aWV3IH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0aXRsZUNsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgIFwibXhfUm9vbVRpbGVfdGl0bGVcIjogdHJ1ZSxcbiAgICAgICAgICAgIFwibXhfUm9vbVRpbGVfdGl0bGVXaXRoU3VidGl0bGVcIjogISFzdWJ0aXRsZSxcbiAgICAgICAgICAgIFwibXhfUm9vbVRpbGVfdGl0bGVIYXNVbnJlYWRFdmVudHNcIjogdGhpcy5ub3RpZmljYXRpb25TdGF0ZS5pc1VucmVhZCxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgdGl0bGVDb250YWluZXIgPSB0aGlzLnByb3BzLmlzTWluaW1pemVkID8gbnVsbCA6IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbVRpbGVfdGl0bGVDb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IHRpdGxlPXtuYW1lfSBjbGFzc05hbWU9e3RpdGxlQ2xhc3Nlc30gdGFiSW5kZXg9ey0xfT5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gZGlyPVwiYXV0b1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBuYW1lIH1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIHsgc3VidGl0bGUgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG5cbiAgICAgICAgbGV0IGFyaWFMYWJlbCA9IG5hbWU7XG4gICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgbGFiZWxzIGFyZSB3cml0dGVuIGluIHN1Y2ggYSBmYXNoaW9uIHRvIGluY3JlYXNlIHNjcmVlbiByZWFkZXIgZWZmaWNpZW5jeSAoc3BlZWQpLlxuICAgICAgICBpZiAodGhpcy5wcm9wcy50YWcgPT09IERlZmF1bHRUYWdJRC5JbnZpdGUpIHtcbiAgICAgICAgICAgIC8vIGFwcGVuZCBub3RoaW5nXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5ub3RpZmljYXRpb25TdGF0ZS5oYXNNZW50aW9ucykge1xuICAgICAgICAgICAgYXJpYUxhYmVsICs9IFwiIFwiICsgX3QoXCIlKGNvdW50KXMgdW5yZWFkIG1lc3NhZ2VzIGluY2x1ZGluZyBtZW50aW9ucy5cIiwge1xuICAgICAgICAgICAgICAgIGNvdW50OiB0aGlzLm5vdGlmaWNhdGlvblN0YXRlLmNvdW50LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5ub3RpZmljYXRpb25TdGF0ZS5oYXNVbnJlYWRDb3VudCkge1xuICAgICAgICAgICAgYXJpYUxhYmVsICs9IFwiIFwiICsgX3QoXCIlKGNvdW50KXMgdW5yZWFkIG1lc3NhZ2VzLlwiLCB7XG4gICAgICAgICAgICAgICAgY291bnQ6IHRoaXMubm90aWZpY2F0aW9uU3RhdGUuY291bnQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm5vdGlmaWNhdGlvblN0YXRlLmlzVW5yZWFkKSB7XG4gICAgICAgICAgICBhcmlhTGFiZWwgKz0gXCIgXCIgKyBfdChcIlVucmVhZCBtZXNzYWdlcy5cIik7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYXJpYURlc2NyaWJlZEJ5OiBzdHJpbmc7XG4gICAgICAgIGlmICh0aGlzLnNob3dNZXNzYWdlUHJldmlldykge1xuICAgICAgICAgICAgYXJpYURlc2NyaWJlZEJ5ID0gbWVzc2FnZVByZXZpZXdJZCh0aGlzLnByb3BzLnJvb20ucm9vbUlkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHByb3BzOiBQYXJ0aWFsPFJlYWN0LkNvbXBvbmVudFByb3BzPHR5cGVvZiBBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbj4+ID0ge307XG4gICAgICAgIGxldCBCdXR0b246IFJlYWN0LkNvbXBvbmVudFR5cGU8UmVhY3QuQ29tcG9uZW50UHJvcHM8dHlwZW9mIEFjY2Vzc2libGVCdXR0b24+PiA9IEFjY2Vzc2libGVCdXR0b247XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmlzTWluaW1pemVkKSB7XG4gICAgICAgICAgICBCdXR0b24gPSBBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbjtcbiAgICAgICAgICAgIHByb3BzLnRpdGxlID0gbmFtZTtcbiAgICAgICAgICAgIC8vIGZvcmNlIHRoZSB0b29sdGlwIHRvIGhpZGUgd2hpbHN0IHdlIGFyZSBzaG93aW5nIHRoZSBjb250ZXh0IG1lbnVcbiAgICAgICAgICAgIHByb3BzLmZvcmNlSGlkZSA9ICEhdGhpcy5zdGF0ZS5nZW5lcmFsTWVudVBvc2l0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICA8Um92aW5nVGFiSW5kZXhXcmFwcGVyIGlucHV0UmVmPXt0aGlzLnJvb21UaWxlUmVmfT5cbiAgICAgICAgICAgICAgICAgICAgeyAoeyBvbkZvY3VzLCBpc0FjdGl2ZSwgcmVmIH0pID0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgey4uLnByb3BzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uRm9jdXM9e29uRm9jdXN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFiSW5kZXg9e2lzQWN0aXZlID8gMCA6IC0xfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0UmVmPXtyZWZ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc2VzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25UaWxlQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Db250ZXh0TWVudT17dGhpcy5vbkNvbnRleHRNZW51fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU9XCJ0cmVlaXRlbVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17YXJpYUxhYmVsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtc2VsZWN0ZWQ9e3RoaXMuc3RhdGUuc2VsZWN0ZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1kZXNjcmliZWRieT17YXJpYURlc2NyaWJlZEJ5fVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxEZWNvcmF0ZWRSb29tQXZhdGFyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvb209e3RoaXMucHJvcHMucm9vbX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZhdGFyU2l6ZT17MzJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlCYWRnZT17dGhpcy5wcm9wcy5pc01pbmltaXplZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcFByb3BzPXt7IHRhYkluZGV4OiBpc0FjdGl2ZSA/IDAgOiAtMSB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB0aXRsZUNvbnRhaW5lciB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBiYWRnZSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnJlbmRlckdlbmVyYWxNZW51KCkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5yZW5kZXJOb3RpZmljYXRpb25zTWVudShpc0FjdGl2ZSkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICA8L1JvdmluZ1RhYkluZGV4V3JhcHBlcj5cbiAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUdBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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