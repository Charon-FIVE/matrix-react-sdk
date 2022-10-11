"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireWildcard(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _IconizedContextMenu = _interopRequireWildcard(require("./IconizedContextMenu"));

var _languageHandler = require("../../../languageHandler");

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _models = require("../../../stores/room-list/models");

var _RoomListStore = _interopRequireWildcard(require("../../../stores/room-list/RoomListStore"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _RoomListActions = _interopRequireDefault(require("../../../actions/RoomListActions"));

var _EchoChamber = require("../../../stores/local-echo/EchoChamber");

var _RoomNotifs = require("../../../RoomNotifs");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _ExportDialog = _interopRequireDefault(require("../dialogs/ExportDialog"));

var _useSettings = require("../../../hooks/useSettings");

var _PinnedMessagesCard = require("../right_panel/PinnedMessagesCard");

var _RoomViewStore = require("../../../stores/RoomViewStore");

var _RightPanelStorePhases = require("../../../stores/right-panel/RightPanelStorePhases");

var _RoomSettingsDialog = require("../dialogs/RoomSettingsDialog");

var _useEventEmitter = require("../../../hooks/useEventEmitter");

var _RightPanelStore = _interopRequireDefault(require("../../../stores/right-panel/RightPanelStore"));

var _DMRoomMap = _interopRequireDefault(require("../../../utils/DMRoomMap"));

var _actions = require("../../../dispatcher/actions");

var _PosthogTrackers = _interopRequireDefault(require("../../../PosthogTrackers"));

var _KeyBindingsManager = require("../../../KeyBindingsManager");

var _KeyboardShortcuts = require("../../../accessibility/KeyboardShortcuts");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _DevtoolsDialog = _interopRequireDefault(require("../dialogs/DevtoolsDialog"));

const _excluded = ["room", "onFinished"];

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const RoomContextMenu = _ref => {
  let {
    room,
    onFinished
  } = _ref,
      props = (0, _objectWithoutProperties2.default)(_ref, _excluded);
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const roomTags = (0, _useEventEmitter.useEventEmitterState)(_RoomListStore.default.instance, _RoomListStore.LISTS_UPDATE_EVENT, () => _RoomListStore.default.instance.getTagsForRoom(room));
  let leaveOption;

  if (roomTags.includes(_models.DefaultTagID.Archived)) {
    const onForgetRoomClick = ev => {
      ev.preventDefault();
      ev.stopPropagation();

      _dispatcher.default.dispatch({
        action: "forget_room",
        room_id: room.roomId
      });

      onFinished();
    };

    leaveOption = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
      iconClassName: "mx_RoomTile_iconSignOut",
      label: (0, _languageHandler._t)("Forget"),
      className: "mx_IconizedContextMenu_option_red",
      onClick: onForgetRoomClick
    });
  } else {
    const onLeaveRoomClick = ev => {
      ev.preventDefault();
      ev.stopPropagation();

      _dispatcher.default.dispatch({
        action: "leave_room",
        room_id: room.roomId
      });

      onFinished();

      _PosthogTrackers.default.trackInteraction("WebRoomHeaderContextMenuLeaveItem", ev);
    };

    leaveOption = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
      onClick: onLeaveRoomClick,
      label: (0, _languageHandler._t)("Leave"),
      className: "mx_IconizedContextMenu_option_red",
      iconClassName: "mx_RoomTile_iconSignOut"
    });
  }

  const isDm = _DMRoomMap.default.shared().getUserIdForRoomId(room.roomId);

  const isVideoRoom = (0, _useSettings.useFeatureEnabled)("feature_video_rooms") && room.isElementVideoRoom();
  let inviteOption;

  if (room.canInvite(cli.getUserId()) && !isDm) {
    const onInviteClick = ev => {
      ev.preventDefault();
      ev.stopPropagation();

      _dispatcher.default.dispatch({
        action: "view_invite",
        roomId: room.roomId
      });

      onFinished();

      _PosthogTrackers.default.trackInteraction("WebRoomHeaderContextMenuInviteItem", ev);
    };

    inviteOption = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
      onClick: onInviteClick,
      label: (0, _languageHandler._t)("Invite"),
      iconClassName: "mx_RoomTile_iconInvite"
    });
  }

  let favouriteOption;
  let lowPriorityOption;
  let notificationOption;

  if (room.getMyMembership() === "join") {
    const isFavorite = roomTags.includes(_models.DefaultTagID.Favourite);
    favouriteOption = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuCheckbox, {
      onClick: e => {
        onTagRoom(e, _models.DefaultTagID.Favourite);

        _PosthogTrackers.default.trackInteraction("WebRoomHeaderContextMenuFavouriteToggle", e);
      },
      active: isFavorite,
      label: isFavorite ? (0, _languageHandler._t)("Favourited") : (0, _languageHandler._t)("Favourite"),
      iconClassName: "mx_RoomTile_iconStar"
    });
    const isLowPriority = roomTags.includes(_models.DefaultTagID.LowPriority);
    lowPriorityOption = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuCheckbox, {
      onClick: e => onTagRoom(e, _models.DefaultTagID.LowPriority),
      active: isLowPriority,
      label: (0, _languageHandler._t)("Low priority"),
      iconClassName: "mx_RoomTile_iconArrowDown"
    });

    const echoChamber = _EchoChamber.EchoChamber.forRoom(room);

    let notificationLabel;
    let iconClassName;

    switch (echoChamber.notificationVolume) {
      case _RoomNotifs.RoomNotifState.AllMessages:
        notificationLabel = (0, _languageHandler._t)("Default");
        iconClassName = "mx_RoomTile_iconNotificationsDefault";
        break;

      case _RoomNotifs.RoomNotifState.AllMessagesLoud:
        notificationLabel = (0, _languageHandler._t)("All messages");
        iconClassName = "mx_RoomTile_iconNotificationsAllMessages";
        break;

      case _RoomNotifs.RoomNotifState.MentionsOnly:
        notificationLabel = (0, _languageHandler._t)("Mentions only");
        iconClassName = "mx_RoomTile_iconNotificationsMentionsKeywords";
        break;

      case _RoomNotifs.RoomNotifState.Mute:
        notificationLabel = (0, _languageHandler._t)("Mute");
        iconClassName = "mx_RoomTile_iconNotificationsNone";
        break;
    }

    notificationOption = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
      onClick: ev => {
        ev.preventDefault();
        ev.stopPropagation();

        _dispatcher.default.dispatch({
          action: "open_room_settings",
          room_id: room.roomId,
          initial_tab_id: _RoomSettingsDialog.ROOM_NOTIFICATIONS_TAB
        });

        onFinished();

        _PosthogTrackers.default.trackInteraction("WebRoomHeaderContextMenuNotificationsItem", ev);
      },
      label: (0, _languageHandler._t)("Notifications"),
      iconClassName: iconClassName
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_IconizedContextMenu_sublabel"
    }, notificationLabel));
  }

  let peopleOption;
  let copyLinkOption;

  if (!isDm) {
    peopleOption = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
      onClick: ev => {
        ev.preventDefault();
        ev.stopPropagation();
        ensureViewingRoom(ev);

        _RightPanelStore.default.instance.pushCard({
          phase: _RightPanelStorePhases.RightPanelPhases.RoomMemberList
        }, false);

        onFinished();

        _PosthogTrackers.default.trackInteraction("WebRoomHeaderContextMenuPeopleItem", ev);
      },
      label: (0, _languageHandler._t)("People"),
      iconClassName: "mx_RoomTile_iconPeople"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_IconizedContextMenu_sublabel"
    }, room.getJoinedMemberCount()));
    copyLinkOption = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
      onClick: ev => {
        ev.preventDefault();
        ev.stopPropagation();

        _dispatcher.default.dispatch({
          action: "copy_room",
          room_id: room.roomId
        });

        onFinished();
      },
      label: (0, _languageHandler._t)("Copy room link"),
      iconClassName: "mx_RoomTile_iconCopyLink"
    });
  }

  let filesOption;

  if (!isVideoRoom) {
    filesOption = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
      onClick: ev => {
        ev.preventDefault();
        ev.stopPropagation();
        ensureViewingRoom(ev);

        _RightPanelStore.default.instance.pushCard({
          phase: _RightPanelStorePhases.RightPanelPhases.FilePanel
        }, false);

        onFinished();
      },
      label: (0, _languageHandler._t)("Files"),
      iconClassName: "mx_RoomTile_iconFiles"
    });
  }

  const pinningEnabled = (0, _useSettings.useFeatureEnabled)("feature_pinning");
  const pinCount = (0, _PinnedMessagesCard.usePinnedEvents)(pinningEnabled && room)?.length;
  let pinsOption;

  if (pinningEnabled && !isVideoRoom) {
    pinsOption = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
      onClick: ev => {
        ev.preventDefault();
        ev.stopPropagation();
        ensureViewingRoom(ev);

        _RightPanelStore.default.instance.pushCard({
          phase: _RightPanelStorePhases.RightPanelPhases.PinnedMessages
        }, false);

        onFinished();
      },
      label: (0, _languageHandler._t)("Pinned"),
      iconClassName: "mx_RoomTile_iconPins"
    }, pinCount > 0 && /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_IconizedContextMenu_sublabel"
    }, pinCount));
  }

  let widgetsOption;

  if (!isVideoRoom) {
    widgetsOption = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
      onClick: ev => {
        ev.preventDefault();
        ev.stopPropagation();
        ensureViewingRoom(ev);

        _RightPanelStore.default.instance.setCard({
          phase: _RightPanelStorePhases.RightPanelPhases.RoomSummary
        }, false);

        onFinished();
      },
      label: (0, _languageHandler._t)("Widgets"),
      iconClassName: "mx_RoomTile_iconWidgets"
    });
  }

  let exportChatOption;

  if (!isVideoRoom) {
    exportChatOption = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
      onClick: ev => {
        ev.preventDefault();
        ev.stopPropagation();

        _Modal.default.createDialog(_ExportDialog.default, {
          room
        });

        onFinished();
      },
      label: (0, _languageHandler._t)("Export chat"),
      iconClassName: "mx_RoomTile_iconExport"
    });
  }

  const onTagRoom = (ev, tagId) => {
    ev.preventDefault();
    ev.stopPropagation();

    if (tagId === _models.DefaultTagID.Favourite || tagId === _models.DefaultTagID.LowPriority) {
      const inverseTag = tagId === _models.DefaultTagID.Favourite ? _models.DefaultTagID.LowPriority : _models.DefaultTagID.Favourite;

      const isApplied = _RoomListStore.default.instance.getTagsForRoom(room).includes(tagId);

      const removeTag = isApplied ? tagId : inverseTag;
      const addTag = isApplied ? null : tagId;

      _dispatcher.default.dispatch(_RoomListActions.default.tagRoom(cli, room, removeTag, addTag, undefined, 0));
    } else {
      _logger.logger.warn(`Unexpected tag ${tagId} applied to ${room.roomId}`);
    }

    const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getAccessibilityAction(ev);

    switch (action) {
      case _KeyboardShortcuts.KeyBindingAction.Enter:
        // Implements https://www.w3.org/TR/wai-aria-practices/#keyboard-interaction-12
        onFinished();
        break;
    }
  };

  const ensureViewingRoom = ev => {
    if (_RoomViewStore.RoomViewStore.instance.getRoomId() === room.roomId) return;

    _dispatcher.default.dispatch({
      action: _actions.Action.ViewRoom,
      room_id: room.roomId,
      metricsTrigger: "RoomList",
      metricsViaKeyboard: ev.type !== "click"
    }, true);
  };

  return /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.default, (0, _extends2.default)({}, props, {
    onFinished: onFinished,
    className: "mx_RoomTile_contextMenu",
    compact: true
  }), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, null, inviteOption, notificationOption, favouriteOption, peopleOption, filesOption, pinsOption, widgetsOption, lowPriorityOption, copyLinkOption, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
    onClick: ev => {
      ev.preventDefault();
      ev.stopPropagation();

      _dispatcher.default.dispatch({
        action: "open_room_settings",
        room_id: room.roomId
      });

      onFinished();

      _PosthogTrackers.default.trackInteraction("WebRoomHeaderContextMenuSettingsItem", ev);
    },
    label: (0, _languageHandler._t)("Settings"),
    iconClassName: "mx_RoomTile_iconSettings"
  }), exportChatOption, _SettingsStore.default.getValue("developerMode") && /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
    onClick: ev => {
      ev.preventDefault();
      ev.stopPropagation();

      _Modal.default.createDialog(_DevtoolsDialog.default, {
        roomId: _RoomViewStore.RoomViewStore.instance.getRoomId()
      }, "mx_DevtoolsDialog_wrapper");

      onFinished();
    },
    label: (0, _languageHandler._t)("Developer tools"),
    iconClassName: "mx_RoomTile_iconDeveloperTools"
  }), leaveOption));
};

var _default = RoomContextMenu;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSb29tQ29udGV4dE1lbnUiLCJyb29tIiwib25GaW5pc2hlZCIsInByb3BzIiwiY2xpIiwidXNlQ29udGV4dCIsIk1hdHJpeENsaWVudENvbnRleHQiLCJyb29tVGFncyIsInVzZUV2ZW50RW1pdHRlclN0YXRlIiwiUm9vbUxpc3RTdG9yZSIsImluc3RhbmNlIiwiTElTVFNfVVBEQVRFX0VWRU5UIiwiZ2V0VGFnc0ZvclJvb20iLCJsZWF2ZU9wdGlvbiIsImluY2x1ZGVzIiwiRGVmYXVsdFRhZ0lEIiwiQXJjaGl2ZWQiLCJvbkZvcmdldFJvb21DbGljayIsImV2IiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsInJvb21faWQiLCJyb29tSWQiLCJfdCIsIm9uTGVhdmVSb29tQ2xpY2siLCJQb3N0aG9nVHJhY2tlcnMiLCJ0cmFja0ludGVyYWN0aW9uIiwiaXNEbSIsIkRNUm9vbU1hcCIsInNoYXJlZCIsImdldFVzZXJJZEZvclJvb21JZCIsImlzVmlkZW9Sb29tIiwidXNlRmVhdHVyZUVuYWJsZWQiLCJpc0VsZW1lbnRWaWRlb1Jvb20iLCJpbnZpdGVPcHRpb24iLCJjYW5JbnZpdGUiLCJnZXRVc2VySWQiLCJvbkludml0ZUNsaWNrIiwiZmF2b3VyaXRlT3B0aW9uIiwibG93UHJpb3JpdHlPcHRpb24iLCJub3RpZmljYXRpb25PcHRpb24iLCJnZXRNeU1lbWJlcnNoaXAiLCJpc0Zhdm9yaXRlIiwiRmF2b3VyaXRlIiwiZSIsIm9uVGFnUm9vbSIsImlzTG93UHJpb3JpdHkiLCJMb3dQcmlvcml0eSIsImVjaG9DaGFtYmVyIiwiRWNob0NoYW1iZXIiLCJmb3JSb29tIiwibm90aWZpY2F0aW9uTGFiZWwiLCJpY29uQ2xhc3NOYW1lIiwibm90aWZpY2F0aW9uVm9sdW1lIiwiUm9vbU5vdGlmU3RhdGUiLCJBbGxNZXNzYWdlcyIsIkFsbE1lc3NhZ2VzTG91ZCIsIk1lbnRpb25zT25seSIsIk11dGUiLCJpbml0aWFsX3RhYl9pZCIsIlJPT01fTk9USUZJQ0FUSU9OU19UQUIiLCJwZW9wbGVPcHRpb24iLCJjb3B5TGlua09wdGlvbiIsImVuc3VyZVZpZXdpbmdSb29tIiwiUmlnaHRQYW5lbFN0b3JlIiwicHVzaENhcmQiLCJwaGFzZSIsIlJpZ2h0UGFuZWxQaGFzZXMiLCJSb29tTWVtYmVyTGlzdCIsImdldEpvaW5lZE1lbWJlckNvdW50IiwiZmlsZXNPcHRpb24iLCJGaWxlUGFuZWwiLCJwaW5uaW5nRW5hYmxlZCIsInBpbkNvdW50IiwidXNlUGlubmVkRXZlbnRzIiwibGVuZ3RoIiwicGluc09wdGlvbiIsIlBpbm5lZE1lc3NhZ2VzIiwid2lkZ2V0c09wdGlvbiIsInNldENhcmQiLCJSb29tU3VtbWFyeSIsImV4cG9ydENoYXRPcHRpb24iLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIkV4cG9ydERpYWxvZyIsInRhZ0lkIiwiaW52ZXJzZVRhZyIsImlzQXBwbGllZCIsInJlbW92ZVRhZyIsImFkZFRhZyIsIlJvb21MaXN0QWN0aW9ucyIsInRhZ1Jvb20iLCJ1bmRlZmluZWQiLCJsb2dnZXIiLCJ3YXJuIiwiZ2V0S2V5QmluZGluZ3NNYW5hZ2VyIiwiZ2V0QWNjZXNzaWJpbGl0eUFjdGlvbiIsIktleUJpbmRpbmdBY3Rpb24iLCJFbnRlciIsIlJvb21WaWV3U3RvcmUiLCJnZXRSb29tSWQiLCJBY3Rpb24iLCJWaWV3Um9vbSIsIm1ldHJpY3NUcmlnZ2VyIiwibWV0cmljc1ZpYUtleWJvYXJkIiwidHlwZSIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsIkRldnRvb2xzRGlhbG9nIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvY29udGV4dF9tZW51cy9Sb29tQ29udGV4dE1lbnUudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyB1c2VDb250ZXh0IH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5cbmltcG9ydCB7IElQcm9wcyBhcyBJQ29udGV4dE1lbnVQcm9wcyB9IGZyb20gXCIuLi8uLi9zdHJ1Y3R1cmVzL0NvbnRleHRNZW51XCI7XG5pbXBvcnQgSWNvbml6ZWRDb250ZXh0TWVudSwge1xuICAgIEljb25pemVkQ29udGV4dE1lbnVDaGVja2JveCxcbiAgICBJY29uaXplZENvbnRleHRNZW51T3B0aW9uLFxuICAgIEljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0LFxufSBmcm9tIFwiLi9JY29uaXplZENvbnRleHRNZW51XCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBNYXRyaXhDbGllbnRDb250ZXh0IGZyb20gXCIuLi8uLi8uLi9jb250ZXh0cy9NYXRyaXhDbGllbnRDb250ZXh0XCI7XG5pbXBvcnQgeyBCdXR0b25FdmVudCB9IGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgeyBEZWZhdWx0VGFnSUQsIFRhZ0lEIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9yb29tLWxpc3QvbW9kZWxzXCI7XG5pbXBvcnQgUm9vbUxpc3RTdG9yZSwgeyBMSVNUU19VUERBVEVfRVZFTlQgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL3Jvb20tbGlzdC9Sb29tTGlzdFN0b3JlXCI7XG5pbXBvcnQgZGlzIGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCBSb29tTGlzdEFjdGlvbnMgZnJvbSBcIi4uLy4uLy4uL2FjdGlvbnMvUm9vbUxpc3RBY3Rpb25zXCI7XG5pbXBvcnQgeyBFY2hvQ2hhbWJlciB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvbG9jYWwtZWNoby9FY2hvQ2hhbWJlclwiO1xuaW1wb3J0IHsgUm9vbU5vdGlmU3RhdGUgfSBmcm9tIFwiLi4vLi4vLi4vUm9vbU5vdGlmc1wiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IEV4cG9ydERpYWxvZyBmcm9tIFwiLi4vZGlhbG9ncy9FeHBvcnREaWFsb2dcIjtcbmltcG9ydCB7IHVzZUZlYXR1cmVFbmFibGVkIH0gZnJvbSBcIi4uLy4uLy4uL2hvb2tzL3VzZVNldHRpbmdzXCI7XG5pbXBvcnQgeyB1c2VQaW5uZWRFdmVudHMgfSBmcm9tIFwiLi4vcmlnaHRfcGFuZWwvUGlubmVkTWVzc2FnZXNDYXJkXCI7XG5pbXBvcnQgeyBSb29tVmlld1N0b3JlIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9Sb29tVmlld1N0b3JlXCI7XG5pbXBvcnQgeyBSaWdodFBhbmVsUGhhc2VzIH0gZnJvbSAnLi4vLi4vLi4vc3RvcmVzL3JpZ2h0LXBhbmVsL1JpZ2h0UGFuZWxTdG9yZVBoYXNlcyc7XG5pbXBvcnQgeyBST09NX05PVElGSUNBVElPTlNfVEFCIH0gZnJvbSBcIi4uL2RpYWxvZ3MvUm9vbVNldHRpbmdzRGlhbG9nXCI7XG5pbXBvcnQgeyB1c2VFdmVudEVtaXR0ZXJTdGF0ZSB9IGZyb20gXCIuLi8uLi8uLi9ob29rcy91c2VFdmVudEVtaXR0ZXJcIjtcbmltcG9ydCBSaWdodFBhbmVsU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9yaWdodC1wYW5lbC9SaWdodFBhbmVsU3RvcmVcIjtcbmltcG9ydCBETVJvb21NYXAgZnJvbSBcIi4uLy4uLy4uL3V0aWxzL0RNUm9vbU1hcFwiO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IFBvc3Rob2dUcmFja2VycyBmcm9tIFwiLi4vLi4vLi4vUG9zdGhvZ1RyYWNrZXJzXCI7XG5pbXBvcnQgeyBWaWV3Um9vbVBheWxvYWQgfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9WaWV3Um9vbVBheWxvYWRcIjtcbmltcG9ydCB7IGdldEtleUJpbmRpbmdzTWFuYWdlciB9IGZyb20gXCIuLi8uLi8uLi9LZXlCaW5kaW5nc01hbmFnZXJcIjtcbmltcG9ydCB7IEtleUJpbmRpbmdBY3Rpb24gfSBmcm9tIFwiLi4vLi4vLi4vYWNjZXNzaWJpbGl0eS9LZXlib2FyZFNob3J0Y3V0c1wiO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCBEZXZ0b29sc0RpYWxvZyBmcm9tIFwiLi4vZGlhbG9ncy9EZXZ0b29sc0RpYWxvZ1wiO1xuXG5pbnRlcmZhY2UgSVByb3BzIGV4dGVuZHMgSUNvbnRleHRNZW51UHJvcHMge1xuICAgIHJvb206IFJvb207XG59XG5cbmNvbnN0IFJvb21Db250ZXh0TWVudSA9ICh7IHJvb20sIG9uRmluaXNoZWQsIC4uLnByb3BzIH06IElQcm9wcykgPT4ge1xuICAgIGNvbnN0IGNsaSA9IHVzZUNvbnRleHQoTWF0cml4Q2xpZW50Q29udGV4dCk7XG4gICAgY29uc3Qgcm9vbVRhZ3MgPSB1c2VFdmVudEVtaXR0ZXJTdGF0ZShcbiAgICAgICAgUm9vbUxpc3RTdG9yZS5pbnN0YW5jZSxcbiAgICAgICAgTElTVFNfVVBEQVRFX0VWRU5ULFxuICAgICAgICAoKSA9PiBSb29tTGlzdFN0b3JlLmluc3RhbmNlLmdldFRhZ3NGb3JSb29tKHJvb20pLFxuICAgICk7XG5cbiAgICBsZXQgbGVhdmVPcHRpb246IEpTWC5FbGVtZW50O1xuICAgIGlmIChyb29tVGFncy5pbmNsdWRlcyhEZWZhdWx0VGFnSUQuQXJjaGl2ZWQpKSB7XG4gICAgICAgIGNvbnN0IG9uRm9yZ2V0Um9vbUNsaWNrID0gKGV2OiBCdXR0b25FdmVudCkgPT4ge1xuICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogXCJmb3JnZXRfcm9vbVwiLFxuICAgICAgICAgICAgICAgIHJvb21faWQ6IHJvb20ucm9vbUlkLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBvbkZpbmlzaGVkKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbGVhdmVPcHRpb24gPSA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1Jvb21UaWxlX2ljb25TaWduT3V0XCJcbiAgICAgICAgICAgIGxhYmVsPXtfdChcIkZvcmdldFwiKX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0ljb25pemVkQ29udGV4dE1lbnVfb3B0aW9uX3JlZFwiXG4gICAgICAgICAgICBvbkNsaWNrPXtvbkZvcmdldFJvb21DbGlja31cbiAgICAgICAgLz47XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgb25MZWF2ZVJvb21DbGljayA9IChldjogQnV0dG9uRXZlbnQpID0+IHtcbiAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246IFwibGVhdmVfcm9vbVwiLFxuICAgICAgICAgICAgICAgIHJvb21faWQ6IHJvb20ucm9vbUlkLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBvbkZpbmlzaGVkKCk7XG5cbiAgICAgICAgICAgIFBvc3Rob2dUcmFja2Vycy50cmFja0ludGVyYWN0aW9uKFwiV2ViUm9vbUhlYWRlckNvbnRleHRNZW51TGVhdmVJdGVtXCIsIGV2KTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZWF2ZU9wdGlvbiA9IDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uXG4gICAgICAgICAgICBvbkNsaWNrPXtvbkxlYXZlUm9vbUNsaWNrfVxuICAgICAgICAgICAgbGFiZWw9e190KFwiTGVhdmVcIil9XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF9JY29uaXplZENvbnRleHRNZW51X29wdGlvbl9yZWRcIlxuICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1Jvb21UaWxlX2ljb25TaWduT3V0XCJcbiAgICAgICAgLz47XG4gICAgfVxuXG4gICAgY29uc3QgaXNEbSA9IERNUm9vbU1hcC5zaGFyZWQoKS5nZXRVc2VySWRGb3JSb29tSWQocm9vbS5yb29tSWQpO1xuICAgIGNvbnN0IGlzVmlkZW9Sb29tID0gdXNlRmVhdHVyZUVuYWJsZWQoXCJmZWF0dXJlX3ZpZGVvX3Jvb21zXCIpICYmIHJvb20uaXNFbGVtZW50VmlkZW9Sb29tKCk7XG5cbiAgICBsZXQgaW52aXRlT3B0aW9uOiBKU1guRWxlbWVudDtcbiAgICBpZiAocm9vbS5jYW5JbnZpdGUoY2xpLmdldFVzZXJJZCgpKSAmJiAhaXNEbSkge1xuICAgICAgICBjb25zdCBvbkludml0ZUNsaWNrID0gKGV2OiBCdXR0b25FdmVudCkgPT4ge1xuICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogXCJ2aWV3X2ludml0ZVwiLFxuICAgICAgICAgICAgICAgIHJvb21JZDogcm9vbS5yb29tSWQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG9uRmluaXNoZWQoKTtcblxuICAgICAgICAgICAgUG9zdGhvZ1RyYWNrZXJzLnRyYWNrSW50ZXJhY3Rpb24oXCJXZWJSb29tSGVhZGVyQ29udGV4dE1lbnVJbnZpdGVJdGVtXCIsIGV2KTtcbiAgICAgICAgfTtcblxuICAgICAgICBpbnZpdGVPcHRpb24gPSA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgb25DbGljaz17b25JbnZpdGVDbGlja31cbiAgICAgICAgICAgIGxhYmVsPXtfdChcIkludml0ZVwiKX1cbiAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Sb29tVGlsZV9pY29uSW52aXRlXCJcbiAgICAgICAgLz47XG4gICAgfVxuXG4gICAgbGV0IGZhdm91cml0ZU9wdGlvbjogSlNYLkVsZW1lbnQ7XG4gICAgbGV0IGxvd1ByaW9yaXR5T3B0aW9uOiBKU1guRWxlbWVudDtcbiAgICBsZXQgbm90aWZpY2F0aW9uT3B0aW9uOiBKU1guRWxlbWVudDtcbiAgICBpZiAocm9vbS5nZXRNeU1lbWJlcnNoaXAoKSA9PT0gXCJqb2luXCIpIHtcbiAgICAgICAgY29uc3QgaXNGYXZvcml0ZSA9IHJvb21UYWdzLmluY2x1ZGVzKERlZmF1bHRUYWdJRC5GYXZvdXJpdGUpO1xuICAgICAgICBmYXZvdXJpdGVPcHRpb24gPSA8SWNvbml6ZWRDb250ZXh0TWVudUNoZWNrYm94XG4gICAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgIG9uVGFnUm9vbShlLCBEZWZhdWx0VGFnSUQuRmF2b3VyaXRlKTtcbiAgICAgICAgICAgICAgICBQb3N0aG9nVHJhY2tlcnMudHJhY2tJbnRlcmFjdGlvbihcIldlYlJvb21IZWFkZXJDb250ZXh0TWVudUZhdm91cml0ZVRvZ2dsZVwiLCBlKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBhY3RpdmU9e2lzRmF2b3JpdGV9XG4gICAgICAgICAgICBsYWJlbD17aXNGYXZvcml0ZSA/IF90KFwiRmF2b3VyaXRlZFwiKSA6IF90KFwiRmF2b3VyaXRlXCIpfVxuICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1Jvb21UaWxlX2ljb25TdGFyXCJcbiAgICAgICAgLz47XG5cbiAgICAgICAgY29uc3QgaXNMb3dQcmlvcml0eSA9IHJvb21UYWdzLmluY2x1ZGVzKERlZmF1bHRUYWdJRC5Mb3dQcmlvcml0eSk7XG4gICAgICAgIGxvd1ByaW9yaXR5T3B0aW9uID0gPEljb25pemVkQ29udGV4dE1lbnVDaGVja2JveFxuICAgICAgICAgICAgb25DbGljaz17KGUpID0+IG9uVGFnUm9vbShlLCBEZWZhdWx0VGFnSUQuTG93UHJpb3JpdHkpfVxuICAgICAgICAgICAgYWN0aXZlPXtpc0xvd1ByaW9yaXR5fVxuICAgICAgICAgICAgbGFiZWw9e190KFwiTG93IHByaW9yaXR5XCIpfVxuICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1Jvb21UaWxlX2ljb25BcnJvd0Rvd25cIlxuICAgICAgICAvPjtcblxuICAgICAgICBjb25zdCBlY2hvQ2hhbWJlciA9IEVjaG9DaGFtYmVyLmZvclJvb20ocm9vbSk7XG4gICAgICAgIGxldCBub3RpZmljYXRpb25MYWJlbDogc3RyaW5nO1xuICAgICAgICBsZXQgaWNvbkNsYXNzTmFtZTogc3RyaW5nO1xuICAgICAgICBzd2l0Y2ggKGVjaG9DaGFtYmVyLm5vdGlmaWNhdGlvblZvbHVtZSkge1xuICAgICAgICAgICAgY2FzZSBSb29tTm90aWZTdGF0ZS5BbGxNZXNzYWdlczpcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25MYWJlbCA9IF90KFwiRGVmYXVsdFwiKTtcbiAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lID0gXCJteF9Sb29tVGlsZV9pY29uTm90aWZpY2F0aW9uc0RlZmF1bHRcIjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUm9vbU5vdGlmU3RhdGUuQWxsTWVzc2FnZXNMb3VkOlxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbkxhYmVsID0gX3QoXCJBbGwgbWVzc2FnZXNcIik7XG4gICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZSA9IFwibXhfUm9vbVRpbGVfaWNvbk5vdGlmaWNhdGlvbnNBbGxNZXNzYWdlc1wiO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBSb29tTm90aWZTdGF0ZS5NZW50aW9uc09ubHk6XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uTGFiZWwgPSBfdChcIk1lbnRpb25zIG9ubHlcIik7XG4gICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZSA9IFwibXhfUm9vbVRpbGVfaWNvbk5vdGlmaWNhdGlvbnNNZW50aW9uc0tleXdvcmRzXCI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFJvb21Ob3RpZlN0YXRlLk11dGU6XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uTGFiZWwgPSBfdChcIk11dGVcIik7XG4gICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZSA9IFwibXhfUm9vbVRpbGVfaWNvbk5vdGlmaWNhdGlvbnNOb25lXCI7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBub3RpZmljYXRpb25PcHRpb24gPSA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgb25DbGljaz17KGV2OiBCdXR0b25FdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IFwib3Blbl9yb29tX3NldHRpbmdzXCIsXG4gICAgICAgICAgICAgICAgICAgIHJvb21faWQ6IHJvb20ucm9vbUlkLFxuICAgICAgICAgICAgICAgICAgICBpbml0aWFsX3RhYl9pZDogUk9PTV9OT1RJRklDQVRJT05TX1RBQixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkKCk7XG5cbiAgICAgICAgICAgICAgICBQb3N0aG9nVHJhY2tlcnMudHJhY2tJbnRlcmFjdGlvbihcIldlYlJvb21IZWFkZXJDb250ZXh0TWVudU5vdGlmaWNhdGlvbnNJdGVtXCIsIGV2KTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBsYWJlbD17X3QoXCJOb3RpZmljYXRpb25zXCIpfVxuICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT17aWNvbkNsYXNzTmFtZX1cbiAgICAgICAgPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfSWNvbml6ZWRDb250ZXh0TWVudV9zdWJsYWJlbFwiPlxuICAgICAgICAgICAgICAgIHsgbm90aWZpY2F0aW9uTGFiZWwgfVxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICA8L0ljb25pemVkQ29udGV4dE1lbnVPcHRpb24+O1xuICAgIH1cblxuICAgIGxldCBwZW9wbGVPcHRpb246IEpTWC5FbGVtZW50O1xuICAgIGxldCBjb3B5TGlua09wdGlvbjogSlNYLkVsZW1lbnQ7XG4gICAgaWYgKCFpc0RtKSB7XG4gICAgICAgIHBlb3BsZU9wdGlvbiA9IDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uXG4gICAgICAgICAgICBvbkNsaWNrPXsoZXY6IEJ1dHRvbkV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICAgICAgICAgIGVuc3VyZVZpZXdpbmdSb29tKGV2KTtcbiAgICAgICAgICAgICAgICBSaWdodFBhbmVsU3RvcmUuaW5zdGFuY2UucHVzaENhcmQoeyBwaGFzZTogUmlnaHRQYW5lbFBoYXNlcy5Sb29tTWVtYmVyTGlzdCB9LCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZCgpO1xuICAgICAgICAgICAgICAgIFBvc3Rob2dUcmFja2Vycy50cmFja0ludGVyYWN0aW9uKFwiV2ViUm9vbUhlYWRlckNvbnRleHRNZW51UGVvcGxlSXRlbVwiLCBldik7XG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgbGFiZWw9e190KFwiUGVvcGxlXCIpfVxuICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1Jvb21UaWxlX2ljb25QZW9wbGVcIlxuICAgICAgICA+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9JY29uaXplZENvbnRleHRNZW51X3N1YmxhYmVsXCI+XG4gICAgICAgICAgICAgICAgeyByb29tLmdldEpvaW5lZE1lbWJlckNvdW50KCkgfVxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICA8L0ljb25pemVkQ29udGV4dE1lbnVPcHRpb24+O1xuXG4gICAgICAgIGNvcHlMaW5rT3B0aW9uID0gPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgIG9uQ2xpY2s9eyhldjogQnV0dG9uRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcImNvcHlfcm9vbVwiLFxuICAgICAgICAgICAgICAgICAgICByb29tX2lkOiByb29tLnJvb21JZCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkKCk7XG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgbGFiZWw9e190KFwiQ29weSByb29tIGxpbmtcIil9XG4gICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfUm9vbVRpbGVfaWNvbkNvcHlMaW5rXCJcbiAgICAgICAgLz47XG4gICAgfVxuXG4gICAgbGV0IGZpbGVzT3B0aW9uOiBKU1guRWxlbWVudDtcbiAgICBpZiAoIWlzVmlkZW9Sb29tKSB7XG4gICAgICAgIGZpbGVzT3B0aW9uID0gPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgIG9uQ2xpY2s9eyhldjogQnV0dG9uRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgICAgICAgICAgZW5zdXJlVmlld2luZ1Jvb20oZXYpO1xuICAgICAgICAgICAgICAgIFJpZ2h0UGFuZWxTdG9yZS5pbnN0YW5jZS5wdXNoQ2FyZCh7IHBoYXNlOiBSaWdodFBhbmVsUGhhc2VzLkZpbGVQYW5lbCB9LCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZCgpO1xuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIGxhYmVsPXtfdChcIkZpbGVzXCIpfVxuICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1Jvb21UaWxlX2ljb25GaWxlc1wiXG4gICAgICAgIC8+O1xuICAgIH1cblxuICAgIGNvbnN0IHBpbm5pbmdFbmFibGVkID0gdXNlRmVhdHVyZUVuYWJsZWQoXCJmZWF0dXJlX3Bpbm5pbmdcIik7XG4gICAgY29uc3QgcGluQ291bnQgPSB1c2VQaW5uZWRFdmVudHMocGlubmluZ0VuYWJsZWQgJiYgcm9vbSk/Lmxlbmd0aDtcblxuICAgIGxldCBwaW5zT3B0aW9uOiBKU1guRWxlbWVudDtcbiAgICBpZiAocGlubmluZ0VuYWJsZWQgJiYgIWlzVmlkZW9Sb29tKSB7XG4gICAgICAgIHBpbnNPcHRpb24gPSA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgb25DbGljaz17KGV2OiBCdXR0b25FdmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgICAgICAgICBlbnN1cmVWaWV3aW5nUm9vbShldik7XG4gICAgICAgICAgICAgICAgUmlnaHRQYW5lbFN0b3JlLmluc3RhbmNlLnB1c2hDYXJkKHsgcGhhc2U6IFJpZ2h0UGFuZWxQaGFzZXMuUGlubmVkTWVzc2FnZXMgfSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQoKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBsYWJlbD17X3QoXCJQaW5uZWRcIil9XG4gICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfUm9vbVRpbGVfaWNvblBpbnNcIlxuICAgICAgICA+XG4gICAgICAgICAgICB7IHBpbkNvdW50ID4gMCAmJiA8c3BhbiBjbGFzc05hbWU9XCJteF9JY29uaXplZENvbnRleHRNZW51X3N1YmxhYmVsXCI+XG4gICAgICAgICAgICAgICAgeyBwaW5Db3VudCB9XG4gICAgICAgICAgICA8L3NwYW4+IH1cbiAgICAgICAgPC9JY29uaXplZENvbnRleHRNZW51T3B0aW9uPjtcbiAgICB9XG5cbiAgICBsZXQgd2lkZ2V0c09wdGlvbjogSlNYLkVsZW1lbnQ7XG4gICAgaWYgKCFpc1ZpZGVvUm9vbSkge1xuICAgICAgICB3aWRnZXRzT3B0aW9uID0gPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgIG9uQ2xpY2s9eyhldjogQnV0dG9uRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgICAgICAgICAgZW5zdXJlVmlld2luZ1Jvb20oZXYpO1xuICAgICAgICAgICAgICAgIFJpZ2h0UGFuZWxTdG9yZS5pbnN0YW5jZS5zZXRDYXJkKHsgcGhhc2U6IFJpZ2h0UGFuZWxQaGFzZXMuUm9vbVN1bW1hcnkgfSwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQoKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBsYWJlbD17X3QoXCJXaWRnZXRzXCIpfVxuICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1Jvb21UaWxlX2ljb25XaWRnZXRzXCJcbiAgICAgICAgLz47XG4gICAgfVxuXG4gICAgbGV0IGV4cG9ydENoYXRPcHRpb246IEpTWC5FbGVtZW50O1xuICAgIGlmICghaXNWaWRlb1Jvb20pIHtcbiAgICAgICAgZXhwb3J0Q2hhdE9wdGlvbiA9IDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uXG4gICAgICAgICAgICBvbkNsaWNrPXsoZXY6IEJ1dHRvbkV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhFeHBvcnREaWFsb2csIHsgcm9vbSB9KTtcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkKCk7XG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgbGFiZWw9e190KFwiRXhwb3J0IGNoYXRcIil9XG4gICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfUm9vbVRpbGVfaWNvbkV4cG9ydFwiXG4gICAgICAgIC8+O1xuICAgIH1cblxuICAgIGNvbnN0IG9uVGFnUm9vbSA9IChldjogQnV0dG9uRXZlbnQsIHRhZ0lkOiBUYWdJRCkgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICBpZiAodGFnSWQgPT09IERlZmF1bHRUYWdJRC5GYXZvdXJpdGUgfHwgdGFnSWQgPT09IERlZmF1bHRUYWdJRC5Mb3dQcmlvcml0eSkge1xuICAgICAgICAgICAgY29uc3QgaW52ZXJzZVRhZyA9IHRhZ0lkID09PSBEZWZhdWx0VGFnSUQuRmF2b3VyaXRlID8gRGVmYXVsdFRhZ0lELkxvd1ByaW9yaXR5IDogRGVmYXVsdFRhZ0lELkZhdm91cml0ZTtcbiAgICAgICAgICAgIGNvbnN0IGlzQXBwbGllZCA9IFJvb21MaXN0U3RvcmUuaW5zdGFuY2UuZ2V0VGFnc0ZvclJvb20ocm9vbSkuaW5jbHVkZXModGFnSWQpO1xuICAgICAgICAgICAgY29uc3QgcmVtb3ZlVGFnID0gaXNBcHBsaWVkID8gdGFnSWQgOiBpbnZlcnNlVGFnO1xuICAgICAgICAgICAgY29uc3QgYWRkVGFnID0gaXNBcHBsaWVkID8gbnVsbCA6IHRhZ0lkO1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKFJvb21MaXN0QWN0aW9ucy50YWdSb29tKGNsaSwgcm9vbSwgcmVtb3ZlVGFnLCBhZGRUYWcsIHVuZGVmaW5lZCwgMCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oYFVuZXhwZWN0ZWQgdGFnICR7dGFnSWR9IGFwcGxpZWQgdG8gJHtyb29tLnJvb21JZH1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGFjdGlvbiA9IGdldEtleUJpbmRpbmdzTWFuYWdlcigpLmdldEFjY2Vzc2liaWxpdHlBY3Rpb24oZXYgYXMgUmVhY3QuS2V5Ym9hcmRFdmVudCk7XG4gICAgICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uRW50ZXI6XG4gICAgICAgICAgICAgICAgLy8gSW1wbGVtZW50cyBodHRwczovL3d3dy53My5vcmcvVFIvd2FpLWFyaWEtcHJhY3RpY2VzLyNrZXlib2FyZC1pbnRlcmFjdGlvbi0xMlxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBlbnN1cmVWaWV3aW5nUm9vbSA9IChldjogQnV0dG9uRXZlbnQpID0+IHtcbiAgICAgICAgaWYgKFJvb21WaWV3U3RvcmUuaW5zdGFuY2UuZ2V0Um9vbUlkKCkgPT09IHJvb20ucm9vbUlkKSByZXR1cm47XG4gICAgICAgIGRpcy5kaXNwYXRjaDxWaWV3Um9vbVBheWxvYWQ+KHtcbiAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlZpZXdSb29tLFxuICAgICAgICAgICAgcm9vbV9pZDogcm9vbS5yb29tSWQsXG4gICAgICAgICAgICBtZXRyaWNzVHJpZ2dlcjogXCJSb29tTGlzdFwiLFxuICAgICAgICAgICAgbWV0cmljc1ZpYUtleWJvYXJkOiBldi50eXBlICE9PSBcImNsaWNrXCIsXG4gICAgICAgIH0sIHRydWUpO1xuICAgIH07XG5cbiAgICByZXR1cm4gPEljb25pemVkQ29udGV4dE1lbnUgey4uLnByb3BzfSBvbkZpbmlzaGVkPXtvbkZpbmlzaGVkfSBjbGFzc05hbWU9XCJteF9Sb29tVGlsZV9jb250ZXh0TWVudVwiIGNvbXBhY3Q+XG4gICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdD5cbiAgICAgICAgICAgIHsgaW52aXRlT3B0aW9uIH1cbiAgICAgICAgICAgIHsgbm90aWZpY2F0aW9uT3B0aW9uIH1cbiAgICAgICAgICAgIHsgZmF2b3VyaXRlT3B0aW9uIH1cbiAgICAgICAgICAgIHsgcGVvcGxlT3B0aW9uIH1cbiAgICAgICAgICAgIHsgZmlsZXNPcHRpb24gfVxuICAgICAgICAgICAgeyBwaW5zT3B0aW9uIH1cbiAgICAgICAgICAgIHsgd2lkZ2V0c09wdGlvbiB9XG4gICAgICAgICAgICB7IGxvd1ByaW9yaXR5T3B0aW9uIH1cbiAgICAgICAgICAgIHsgY29weUxpbmtPcHRpb24gfVxuXG4gICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhldjogQnV0dG9uRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogXCJvcGVuX3Jvb21fc2V0dGluZ3NcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb21faWQ6IHJvb20ucm9vbUlkLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgb25GaW5pc2hlZCgpO1xuICAgICAgICAgICAgICAgICAgICBQb3N0aG9nVHJhY2tlcnMudHJhY2tJbnRlcmFjdGlvbihcIldlYlJvb21IZWFkZXJDb250ZXh0TWVudVNldHRpbmdzSXRlbVwiLCBldik7XG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJTZXR0aW5nc1wiKX1cbiAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfUm9vbVRpbGVfaWNvblNldHRpbmdzXCJcbiAgICAgICAgICAgIC8+XG5cbiAgICAgICAgICAgIHsgZXhwb3J0Q2hhdE9wdGlvbiB9XG5cbiAgICAgICAgICAgIHsgU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImRldmVsb3Blck1vZGVcIikgJiYgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZXY6IEJ1dHRvbkV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhEZXZ0b29sc0RpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbUlkOiBSb29tVmlld1N0b3JlLmluc3RhbmNlLmdldFJvb21JZCgpLFxuICAgICAgICAgICAgICAgICAgICB9LCBcIm14X0RldnRvb2xzRGlhbG9nX3dyYXBwZXJcIik7XG4gICAgICAgICAgICAgICAgICAgIG9uRmluaXNoZWQoKTtcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkRldmVsb3BlciB0b29sc1wiKX1cbiAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfUm9vbVRpbGVfaWNvbkRldmVsb3BlclRvb2xzXCJcbiAgICAgICAgICAgIC8+IH1cblxuICAgICAgICAgICAgeyBsZWF2ZU9wdGlvbiB9XG4gICAgICAgIDwvSWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3Q+XG4gICAgPC9JY29uaXplZENvbnRleHRNZW51Pjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFJvb21Db250ZXh0TWVudTtcblxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUdBOztBQUtBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7OztBQU1BLE1BQU1BLGVBQWUsR0FBRyxRQUE0QztFQUFBLElBQTNDO0lBQUVDLElBQUY7SUFBUUM7RUFBUixDQUEyQztF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