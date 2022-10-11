"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useWidgets = exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _useIsEncrypted = require("../../../hooks/useIsEncrypted");

var _BaseCard = _interopRequireWildcard(require("./BaseCard"));

var _languageHandler = require("../../../languageHandler");

var _RoomAvatar = _interopRequireDefault(require("../avatars/RoomAvatar"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _RightPanelStorePhases = require("../../../stores/right-panel/RightPanelStorePhases");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _ShareDialog = _interopRequireDefault(require("../dialogs/ShareDialog"));

var _useEventEmitter = require("../../../hooks/useEventEmitter");

var _WidgetUtils = _interopRequireDefault(require("../../../utils/WidgetUtils"));

var _IntegrationManagers = require("../../../integrations/IntegrationManagers");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _TextWithTooltip = _interopRequireDefault(require("../elements/TextWithTooltip"));

var _WidgetAvatar = _interopRequireDefault(require("../avatars/WidgetAvatar"));

var _AccessibleTooltipButton = _interopRequireDefault(require("../elements/AccessibleTooltipButton"));

var _WidgetStore = _interopRequireDefault(require("../../../stores/WidgetStore"));

var _ShieldUtils = require("../../../utils/ShieldUtils");

var _RoomContext = _interopRequireDefault(require("../../../contexts/RoomContext"));

var _UIFeature = require("../../../settings/UIFeature");

var _ContextMenu = require("../../structures/ContextMenu");

var _WidgetContextMenu = _interopRequireDefault(require("../context_menus/WidgetContextMenu"));

var _useRoomMembers = require("../../../hooks/useRoomMembers");

var _useSettings = require("../../../hooks/useSettings");

var _PinnedMessagesCard = require("./PinnedMessagesCard");

var _WidgetLayoutStore = require("../../../stores/widgets/WidgetLayoutStore");

var _RoomName = _interopRequireDefault(require("../elements/RoomName"));

var _UIStore = _interopRequireDefault(require("../../../stores/UIStore"));

var _ExportDialog = _interopRequireDefault(require("../dialogs/ExportDialog"));

var _RightPanelStore = _interopRequireDefault(require("../../../stores/right-panel/RightPanelStore"));

var _PosthogTrackers = _interopRequireDefault(require("../../../PosthogTrackers"));

var _UIComponents = require("../../../customisations/helpers/UIComponents");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2020 The Matrix.org Foundation C.I.C.

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
const Button = _ref => {
  let {
    children,
    className,
    onClick
  } = _ref;
  return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    className: (0, _classnames.default)("mx_BaseCard_Button mx_RoomSummaryCard_Button", className),
    onClick: onClick
  }, children);
};

const useWidgets = room => {
  const [apps, setApps] = (0, _react.useState)(_WidgetStore.default.instance.getApps(room.roomId));
  const updateApps = (0, _react.useCallback)(() => {
    // Copy the array so that we always trigger a re-render, as some updates mutate the array of apps/settings
    setApps([..._WidgetStore.default.instance.getApps(room.roomId)]);
  }, [room]);
  (0, _react.useEffect)(updateApps, [room, updateApps]);
  (0, _useEventEmitter.useEventEmitter)(_WidgetStore.default.instance, room.roomId, updateApps);
  (0, _useEventEmitter.useEventEmitter)(_WidgetLayoutStore.WidgetLayoutStore.instance, _WidgetLayoutStore.WidgetLayoutStore.emissionForRoom(room), updateApps);
  return apps;
};

exports.useWidgets = useWidgets;

const AppRow = _ref2 => {
  let {
    app,
    room
  } = _ref2;

  const name = _WidgetUtils.default.getWidgetName(app);

  const dataTitle = _WidgetUtils.default.getWidgetDataTitle(app);

  const subtitle = dataTitle && " - " + dataTitle;
  const [canModifyWidget, setCanModifyWidget] = (0, _react.useState)();
  (0, _react.useEffect)(() => {
    setCanModifyWidget(_WidgetUtils.default.canUserModifyWidgets(room.roomId));
  }, [room.roomId]);

  const onOpenWidgetClick = () => {
    _RightPanelStore.default.instance.pushCard({
      phase: _RightPanelStorePhases.RightPanelPhases.Widget,
      state: {
        widgetId: app.id
      }
    });
  };

  const isPinned = _WidgetLayoutStore.WidgetLayoutStore.instance.isInContainer(room, app, _WidgetLayoutStore.Container.Top);

  const togglePin = isPinned ? () => {
    _WidgetLayoutStore.WidgetLayoutStore.instance.moveToContainer(room, app, _WidgetLayoutStore.Container.Right);
  } : () => {
    _WidgetLayoutStore.WidgetLayoutStore.instance.moveToContainer(room, app, _WidgetLayoutStore.Container.Top);
  };
  const [menuDisplayed, handle, openMenu, closeMenu] = (0, _ContextMenu.useContextMenu)();
  let contextMenu;

  if (menuDisplayed) {
    const rect = handle.current.getBoundingClientRect();
    contextMenu = /*#__PURE__*/_react.default.createElement(_WidgetContextMenu.default, {
      chevronFace: _ContextMenu.ChevronFace.None,
      right: _UIStore.default.instance.windowWidth - rect.right,
      bottom: _UIStore.default.instance.windowHeight - rect.top,
      onFinished: closeMenu,
      app: app
    });
  }

  const cannotPin = !isPinned && !_WidgetLayoutStore.WidgetLayoutStore.instance.canAddToContainer(room, _WidgetLayoutStore.Container.Top);
  let pinTitle;

  if (cannotPin) {
    pinTitle = (0, _languageHandler._t)("You can only pin up to %(count)s widgets", {
      count: _WidgetLayoutStore.MAX_PINNED
    });
  } else {
    pinTitle = isPinned ? (0, _languageHandler._t)("Unpin") : (0, _languageHandler._t)("Pin");
  }

  const isMaximised = _WidgetLayoutStore.WidgetLayoutStore.instance.isInContainer(room, app, _WidgetLayoutStore.Container.Center);

  const toggleMaximised = isMaximised ? () => {
    _WidgetLayoutStore.WidgetLayoutStore.instance.moveToContainer(room, app, _WidgetLayoutStore.Container.Right);
  } : () => {
    _WidgetLayoutStore.WidgetLayoutStore.instance.moveToContainer(room, app, _WidgetLayoutStore.Container.Center);
  };
  const maximiseTitle = isMaximised ? (0, _languageHandler._t)("Close") : (0, _languageHandler._t)("Maximise");
  let openTitle = "";

  if (isPinned) {
    openTitle = (0, _languageHandler._t)("Unpin this widget to view it in this panel");
  } else if (isMaximised) {
    openTitle = (0, _languageHandler._t)("Close this widget to view it in this panel");
  }

  const classes = (0, _classnames.default)("mx_BaseCard_Button mx_RoomSummaryCard_Button", {
    mx_RoomSummaryCard_Button_pinned: isPinned,
    mx_RoomSummaryCard_Button_maximised: isMaximised
  });
  return /*#__PURE__*/_react.default.createElement("div", {
    className: classes,
    ref: handle
  }, /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
    className: "mx_RoomSummaryCard_icon_app",
    onClick: onOpenWidgetClick // only show a tooltip if the widget is pinned
    ,
    title: openTitle,
    forceHide: !(isPinned || isMaximised),
    disabled: isPinned || isMaximised
  }, /*#__PURE__*/_react.default.createElement(_WidgetAvatar.default, {
    app: app
  }), /*#__PURE__*/_react.default.createElement("span", null, name), subtitle), canModifyWidget && /*#__PURE__*/_react.default.createElement(_ContextMenu.ContextMenuTooltipButton, {
    className: "mx_RoomSummaryCard_app_options",
    isExpanded: menuDisplayed,
    onClick: openMenu,
    title: (0, _languageHandler._t)("Options")
  }), /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
    className: "mx_RoomSummaryCard_app_pinToggle",
    onClick: togglePin,
    title: pinTitle,
    disabled: cannotPin
  }), /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
    className: "mx_RoomSummaryCard_app_maximiseToggle",
    onClick: toggleMaximised,
    title: maximiseTitle
  }), contextMenu);
};

const AppsSection = _ref3 => {
  let {
    room
  } = _ref3;
  const apps = useWidgets(room);

  const onManageIntegrations = () => {
    const managers = _IntegrationManagers.IntegrationManagers.sharedInstance();

    if (!managers.hasManager()) {
      managers.openNoManagerDialog();
    } else {
      // noinspection JSIgnoredPromiseFromCall
      managers.getPrimaryManager().open(room);
    }
  };

  let copyLayoutBtn = null;

  if (apps.length > 0 && _WidgetLayoutStore.WidgetLayoutStore.instance.canCopyLayoutToRoom(room)) {
    copyLayoutBtn = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "link",
      onClick: () => _WidgetLayoutStore.WidgetLayoutStore.instance.copyLayoutToRoom(room)
    }, (0, _languageHandler._t)("Set my room layout for everyone"));
  }

  return /*#__PURE__*/_react.default.createElement(_BaseCard.Group, {
    className: "mx_RoomSummaryCard_appsGroup",
    title: (0, _languageHandler._t)("Widgets")
  }, apps.map(app => /*#__PURE__*/_react.default.createElement(AppRow, {
    key: app.id,
    app: app,
    room: room
  })), copyLayoutBtn, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    kind: "link",
    onClick: onManageIntegrations
  }, apps.length > 0 ? (0, _languageHandler._t)("Edit widgets, bridges & bots") : (0, _languageHandler._t)("Add widgets, bridges & bots")));
};

const onRoomMembersClick = ev => {
  _RightPanelStore.default.instance.pushCard({
    phase: _RightPanelStorePhases.RightPanelPhases.RoomMemberList
  }, true);

  _PosthogTrackers.default.trackInteraction("WebRightPanelRoomInfoPeopleButton", ev);
};

const onRoomFilesClick = () => {
  _RightPanelStore.default.instance.pushCard({
    phase: _RightPanelStorePhases.RightPanelPhases.FilePanel
  }, true);
};

const onRoomPinsClick = () => {
  _RightPanelStore.default.instance.pushCard({
    phase: _RightPanelStorePhases.RightPanelPhases.PinnedMessages
  }, true);
};

const onRoomSettingsClick = ev => {
  _dispatcher.default.dispatch({
    action: "open_room_settings"
  });

  _PosthogTrackers.default.trackInteraction("WebRightPanelRoomInfoSettingsButton", ev);
};

const RoomSummaryCard = _ref4 => {
  let {
    room,
    onClose
  } = _ref4;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);

  const onShareRoomClick = () => {
    _Modal.default.createDialog(_ShareDialog.default, {
      target: room
    });
  };

  const onRoomExportClick = async () => {
    _Modal.default.createDialog(_ExportDialog.default, {
      room
    });
  };

  const isRoomEncrypted = (0, _useIsEncrypted.useIsEncrypted)(cli, room);
  const roomContext = (0, _react.useContext)(_RoomContext.default);
  const e2eStatus = roomContext.e2eStatus;
  const isVideoRoom = (0, _useSettings.useFeatureEnabled)("feature_video_rooms") && room.isElementVideoRoom();
  const alias = room.getCanonicalAlias() || room.getAltAliases()[0] || "";

  const header = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_RoomSummaryCard_avatar",
    role: "presentation"
  }, /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
    room: room,
    height: 54,
    width: 54,
    viewAvatarOnClick: true
  }), /*#__PURE__*/_react.default.createElement(_TextWithTooltip.default, {
    tooltip: isRoomEncrypted ? (0, _languageHandler._t)("Encrypted") : (0, _languageHandler._t)("Not encrypted"),
    class: (0, _classnames.default)("mx_RoomSummaryCard_e2ee", {
      mx_RoomSummaryCard_e2ee_normal: isRoomEncrypted,
      mx_RoomSummaryCard_e2ee_warning: isRoomEncrypted && e2eStatus === _ShieldUtils.E2EStatus.Warning,
      mx_RoomSummaryCard_e2ee_verified: isRoomEncrypted && e2eStatus === _ShieldUtils.E2EStatus.Verified
    })
  })), /*#__PURE__*/_react.default.createElement(_RoomName.default, {
    room: room
  }, name => /*#__PURE__*/_react.default.createElement("h2", {
    title: name
  }, name)), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_RoomSummaryCard_alias",
    title: alias
  }, alias));

  const memberCount = (0, _useRoomMembers.useRoomMemberCount)(room);
  const pinningEnabled = (0, _useSettings.useFeatureEnabled)("feature_pinning");
  const pinCount = (0, _PinnedMessagesCard.usePinnedEvents)(pinningEnabled && room)?.length;
  return /*#__PURE__*/_react.default.createElement(_BaseCard.default, {
    header: header,
    className: "mx_RoomSummaryCard",
    onClose: onClose
  }, /*#__PURE__*/_react.default.createElement(_BaseCard.Group, {
    title: (0, _languageHandler._t)("About"),
    className: "mx_RoomSummaryCard_aboutGroup"
  }, /*#__PURE__*/_react.default.createElement(Button, {
    className: "mx_RoomSummaryCard_icon_people",
    onClick: onRoomMembersClick
  }, (0, _languageHandler._t)("People"), /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_BaseCard_Button_sublabel"
  }, memberCount)), !isVideoRoom && /*#__PURE__*/_react.default.createElement(Button, {
    className: "mx_RoomSummaryCard_icon_files",
    onClick: onRoomFilesClick
  }, (0, _languageHandler._t)("Files")), pinningEnabled && !isVideoRoom && /*#__PURE__*/_react.default.createElement(Button, {
    className: "mx_RoomSummaryCard_icon_pins",
    onClick: onRoomPinsClick
  }, (0, _languageHandler._t)("Pinned"), pinCount > 0 && /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_BaseCard_Button_sublabel"
  }, pinCount)), !isVideoRoom && /*#__PURE__*/_react.default.createElement(Button, {
    className: "mx_RoomSummaryCard_icon_export",
    onClick: onRoomExportClick
  }, (0, _languageHandler._t)("Export chat")), /*#__PURE__*/_react.default.createElement(Button, {
    className: "mx_RoomSummaryCard_icon_share",
    onClick: onShareRoomClick
  }, (0, _languageHandler._t)("Share room")), /*#__PURE__*/_react.default.createElement(Button, {
    className: "mx_RoomSummaryCard_icon_settings",
    onClick: onRoomSettingsClick
  }, (0, _languageHandler._t)("Room settings"))), _SettingsStore.default.getValue(_UIFeature.UIFeature.Widgets) && !isVideoRoom && (0, _UIComponents.shouldShowComponent)(_UIFeature.UIComponent.AddIntegrations) && /*#__PURE__*/_react.default.createElement(AppsSection, {
    room: room
  }));
};

var _default = RoomSummaryCard;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCdXR0b24iLCJjaGlsZHJlbiIsImNsYXNzTmFtZSIsIm9uQ2xpY2siLCJjbGFzc05hbWVzIiwidXNlV2lkZ2V0cyIsInJvb20iLCJhcHBzIiwic2V0QXBwcyIsInVzZVN0YXRlIiwiV2lkZ2V0U3RvcmUiLCJpbnN0YW5jZSIsImdldEFwcHMiLCJyb29tSWQiLCJ1cGRhdGVBcHBzIiwidXNlQ2FsbGJhY2siLCJ1c2VFZmZlY3QiLCJ1c2VFdmVudEVtaXR0ZXIiLCJXaWRnZXRMYXlvdXRTdG9yZSIsImVtaXNzaW9uRm9yUm9vbSIsIkFwcFJvdyIsImFwcCIsIm5hbWUiLCJXaWRnZXRVdGlscyIsImdldFdpZGdldE5hbWUiLCJkYXRhVGl0bGUiLCJnZXRXaWRnZXREYXRhVGl0bGUiLCJzdWJ0aXRsZSIsImNhbk1vZGlmeVdpZGdldCIsInNldENhbk1vZGlmeVdpZGdldCIsImNhblVzZXJNb2RpZnlXaWRnZXRzIiwib25PcGVuV2lkZ2V0Q2xpY2siLCJSaWdodFBhbmVsU3RvcmUiLCJwdXNoQ2FyZCIsInBoYXNlIiwiUmlnaHRQYW5lbFBoYXNlcyIsIldpZGdldCIsInN0YXRlIiwid2lkZ2V0SWQiLCJpZCIsImlzUGlubmVkIiwiaXNJbkNvbnRhaW5lciIsIkNvbnRhaW5lciIsIlRvcCIsInRvZ2dsZVBpbiIsIm1vdmVUb0NvbnRhaW5lciIsIlJpZ2h0IiwibWVudURpc3BsYXllZCIsImhhbmRsZSIsIm9wZW5NZW51IiwiY2xvc2VNZW51IiwidXNlQ29udGV4dE1lbnUiLCJjb250ZXh0TWVudSIsInJlY3QiLCJjdXJyZW50IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiQ2hldnJvbkZhY2UiLCJOb25lIiwiVUlTdG9yZSIsIndpbmRvd1dpZHRoIiwicmlnaHQiLCJ3aW5kb3dIZWlnaHQiLCJ0b3AiLCJjYW5ub3RQaW4iLCJjYW5BZGRUb0NvbnRhaW5lciIsInBpblRpdGxlIiwiX3QiLCJjb3VudCIsIk1BWF9QSU5ORUQiLCJpc01heGltaXNlZCIsIkNlbnRlciIsInRvZ2dsZU1heGltaXNlZCIsIm1heGltaXNlVGl0bGUiLCJvcGVuVGl0bGUiLCJjbGFzc2VzIiwibXhfUm9vbVN1bW1hcnlDYXJkX0J1dHRvbl9waW5uZWQiLCJteF9Sb29tU3VtbWFyeUNhcmRfQnV0dG9uX21heGltaXNlZCIsIkFwcHNTZWN0aW9uIiwib25NYW5hZ2VJbnRlZ3JhdGlvbnMiLCJtYW5hZ2VycyIsIkludGVncmF0aW9uTWFuYWdlcnMiLCJzaGFyZWRJbnN0YW5jZSIsImhhc01hbmFnZXIiLCJvcGVuTm9NYW5hZ2VyRGlhbG9nIiwiZ2V0UHJpbWFyeU1hbmFnZXIiLCJvcGVuIiwiY29weUxheW91dEJ0biIsImxlbmd0aCIsImNhbkNvcHlMYXlvdXRUb1Jvb20iLCJjb3B5TGF5b3V0VG9Sb29tIiwibWFwIiwib25Sb29tTWVtYmVyc0NsaWNrIiwiZXYiLCJSb29tTWVtYmVyTGlzdCIsIlBvc3Rob2dUcmFja2VycyIsInRyYWNrSW50ZXJhY3Rpb24iLCJvblJvb21GaWxlc0NsaWNrIiwiRmlsZVBhbmVsIiwib25Sb29tUGluc0NsaWNrIiwiUGlubmVkTWVzc2FnZXMiLCJvblJvb21TZXR0aW5nc0NsaWNrIiwiZGVmYXVsdERpc3BhdGNoZXIiLCJkaXNwYXRjaCIsImFjdGlvbiIsIlJvb21TdW1tYXJ5Q2FyZCIsIm9uQ2xvc2UiLCJjbGkiLCJ1c2VDb250ZXh0IiwiTWF0cml4Q2xpZW50Q29udGV4dCIsIm9uU2hhcmVSb29tQ2xpY2siLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIlNoYXJlRGlhbG9nIiwidGFyZ2V0Iiwib25Sb29tRXhwb3J0Q2xpY2siLCJFeHBvcnREaWFsb2ciLCJpc1Jvb21FbmNyeXB0ZWQiLCJ1c2VJc0VuY3J5cHRlZCIsInJvb21Db250ZXh0IiwiUm9vbUNvbnRleHQiLCJlMmVTdGF0dXMiLCJpc1ZpZGVvUm9vbSIsInVzZUZlYXR1cmVFbmFibGVkIiwiaXNFbGVtZW50VmlkZW9Sb29tIiwiYWxpYXMiLCJnZXRDYW5vbmljYWxBbGlhcyIsImdldEFsdEFsaWFzZXMiLCJoZWFkZXIiLCJteF9Sb29tU3VtbWFyeUNhcmRfZTJlZV9ub3JtYWwiLCJteF9Sb29tU3VtbWFyeUNhcmRfZTJlZV93YXJuaW5nIiwiRTJFU3RhdHVzIiwiV2FybmluZyIsIm14X1Jvb21TdW1tYXJ5Q2FyZF9lMmVlX3ZlcmlmaWVkIiwiVmVyaWZpZWQiLCJtZW1iZXJDb3VudCIsInVzZVJvb21NZW1iZXJDb3VudCIsInBpbm5pbmdFbmFibGVkIiwicGluQ291bnQiLCJ1c2VQaW5uZWRFdmVudHMiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJVSUZlYXR1cmUiLCJXaWRnZXRzIiwic2hvdWxkU2hvd0NvbXBvbmVudCIsIlVJQ29tcG9uZW50IiwiQWRkSW50ZWdyYXRpb25zIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvcmlnaHRfcGFuZWwvUm9vbVN1bW1hcnlDYXJkLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlQ2FsbGJhY2ssIHVzZUNvbnRleHQsIHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5cbmltcG9ydCBNYXRyaXhDbGllbnRDb250ZXh0IGZyb20gXCIuLi8uLi8uLi9jb250ZXh0cy9NYXRyaXhDbGllbnRDb250ZXh0XCI7XG5pbXBvcnQgeyB1c2VJc0VuY3J5cHRlZCB9IGZyb20gJy4uLy4uLy4uL2hvb2tzL3VzZUlzRW5jcnlwdGVkJztcbmltcG9ydCBCYXNlQ2FyZCwgeyBHcm91cCB9IGZyb20gXCIuL0Jhc2VDYXJkXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgUm9vbUF2YXRhciBmcm9tIFwiLi4vYXZhdGFycy9Sb29tQXZhdGFyXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiwgeyBCdXR0b25FdmVudCB9IGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgZGVmYXVsdERpc3BhdGNoZXIgZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHsgUmlnaHRQYW5lbFBoYXNlcyB9IGZyb20gJy4uLy4uLy4uL3N0b3Jlcy9yaWdodC1wYW5lbC9SaWdodFBhbmVsU3RvcmVQaGFzZXMnO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IFNoYXJlRGlhbG9nIGZyb20gJy4uL2RpYWxvZ3MvU2hhcmVEaWFsb2cnO1xuaW1wb3J0IHsgdXNlRXZlbnRFbWl0dGVyIH0gZnJvbSBcIi4uLy4uLy4uL2hvb2tzL3VzZUV2ZW50RW1pdHRlclwiO1xuaW1wb3J0IFdpZGdldFV0aWxzIGZyb20gXCIuLi8uLi8uLi91dGlscy9XaWRnZXRVdGlsc1wiO1xuaW1wb3J0IHsgSW50ZWdyYXRpb25NYW5hZ2VycyB9IGZyb20gXCIuLi8uLi8uLi9pbnRlZ3JhdGlvbnMvSW50ZWdyYXRpb25NYW5hZ2Vyc1wiO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCBUZXh0V2l0aFRvb2x0aXAgZnJvbSBcIi4uL2VsZW1lbnRzL1RleHRXaXRoVG9vbHRpcFwiO1xuaW1wb3J0IFdpZGdldEF2YXRhciBmcm9tIFwiLi4vYXZhdGFycy9XaWRnZXRBdmF0YXJcIjtcbmltcG9ydCBBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cIjtcbmltcG9ydCBXaWRnZXRTdG9yZSwgeyBJQXBwIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9XaWRnZXRTdG9yZVwiO1xuaW1wb3J0IHsgRTJFU3RhdHVzIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL1NoaWVsZFV0aWxzXCI7XG5pbXBvcnQgUm9vbUNvbnRleHQgZnJvbSBcIi4uLy4uLy4uL2NvbnRleHRzL1Jvb21Db250ZXh0XCI7XG5pbXBvcnQgeyBVSUNvbXBvbmVudCwgVUlGZWF0dXJlIH0gZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1VJRmVhdHVyZVwiO1xuaW1wb3J0IHsgQ2hldnJvbkZhY2UsIENvbnRleHRNZW51VG9vbHRpcEJ1dHRvbiwgdXNlQ29udGV4dE1lbnUgfSBmcm9tIFwiLi4vLi4vc3RydWN0dXJlcy9Db250ZXh0TWVudVwiO1xuaW1wb3J0IFdpZGdldENvbnRleHRNZW51IGZyb20gXCIuLi9jb250ZXh0X21lbnVzL1dpZGdldENvbnRleHRNZW51XCI7XG5pbXBvcnQgeyB1c2VSb29tTWVtYmVyQ291bnQgfSBmcm9tIFwiLi4vLi4vLi4vaG9va3MvdXNlUm9vbU1lbWJlcnNcIjtcbmltcG9ydCB7IHVzZUZlYXR1cmVFbmFibGVkIH0gZnJvbSBcIi4uLy4uLy4uL2hvb2tzL3VzZVNldHRpbmdzXCI7XG5pbXBvcnQgeyB1c2VQaW5uZWRFdmVudHMgfSBmcm9tIFwiLi9QaW5uZWRNZXNzYWdlc0NhcmRcIjtcbmltcG9ydCB7IENvbnRhaW5lciwgTUFYX1BJTk5FRCwgV2lkZ2V0TGF5b3V0U3RvcmUgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL3dpZGdldHMvV2lkZ2V0TGF5b3V0U3RvcmVcIjtcbmltcG9ydCBSb29tTmFtZSBmcm9tIFwiLi4vZWxlbWVudHMvUm9vbU5hbWVcIjtcbmltcG9ydCBVSVN0b3JlIGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvVUlTdG9yZVwiO1xuaW1wb3J0IEV4cG9ydERpYWxvZyBmcm9tIFwiLi4vZGlhbG9ncy9FeHBvcnREaWFsb2dcIjtcbmltcG9ydCBSaWdodFBhbmVsU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9yaWdodC1wYW5lbC9SaWdodFBhbmVsU3RvcmVcIjtcbmltcG9ydCBQb3N0aG9nVHJhY2tlcnMgZnJvbSBcIi4uLy4uLy4uL1Bvc3Rob2dUcmFja2Vyc1wiO1xuaW1wb3J0IHsgc2hvdWxkU2hvd0NvbXBvbmVudCB9IGZyb20gXCIuLi8uLi8uLi9jdXN0b21pc2F0aW9ucy9oZWxwZXJzL1VJQ29tcG9uZW50c1wiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICByb29tOiBSb29tO1xuICAgIG9uQ2xvc2UoKTogdm9pZDtcbn1cblxuaW50ZXJmYWNlIElBcHBzU2VjdGlvblByb3BzIHtcbiAgICByb29tOiBSb29tO1xufVxuXG5pbnRlcmZhY2UgSUJ1dHRvblByb3BzIHtcbiAgICBjbGFzc05hbWU6IHN0cmluZztcbiAgICBvbkNsaWNrKGV2OiBCdXR0b25FdmVudCk6IHZvaWQ7XG59XG5cbmNvbnN0IEJ1dHRvbjogUmVhY3QuRkM8SUJ1dHRvblByb3BzPiA9ICh7IGNoaWxkcmVuLCBjbGFzc05hbWUsIG9uQ2xpY2sgfSkgPT4ge1xuICAgIHJldHVybiA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZXMoXCJteF9CYXNlQ2FyZF9CdXR0b24gbXhfUm9vbVN1bW1hcnlDYXJkX0J1dHRvblwiLCBjbGFzc05hbWUpfVxuICAgICAgICBvbkNsaWNrPXtvbkNsaWNrfVxuICAgID5cbiAgICAgICAgeyBjaGlsZHJlbiB9XG4gICAgPC9BY2Nlc3NpYmxlQnV0dG9uPjtcbn07XG5cbmV4cG9ydCBjb25zdCB1c2VXaWRnZXRzID0gKHJvb206IFJvb20pID0+IHtcbiAgICBjb25zdCBbYXBwcywgc2V0QXBwc10gPSB1c2VTdGF0ZTxJQXBwW10+KFdpZGdldFN0b3JlLmluc3RhbmNlLmdldEFwcHMocm9vbS5yb29tSWQpKTtcblxuICAgIGNvbnN0IHVwZGF0ZUFwcHMgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIC8vIENvcHkgdGhlIGFycmF5IHNvIHRoYXQgd2UgYWx3YXlzIHRyaWdnZXIgYSByZS1yZW5kZXIsIGFzIHNvbWUgdXBkYXRlcyBtdXRhdGUgdGhlIGFycmF5IG9mIGFwcHMvc2V0dGluZ3NcbiAgICAgICAgc2V0QXBwcyhbLi4uV2lkZ2V0U3RvcmUuaW5zdGFuY2UuZ2V0QXBwcyhyb29tLnJvb21JZCldKTtcbiAgICB9LCBbcm9vbV0pO1xuXG4gICAgdXNlRWZmZWN0KHVwZGF0ZUFwcHMsIFtyb29tLCB1cGRhdGVBcHBzXSk7XG4gICAgdXNlRXZlbnRFbWl0dGVyKFdpZGdldFN0b3JlLmluc3RhbmNlLCByb29tLnJvb21JZCwgdXBkYXRlQXBwcyk7XG4gICAgdXNlRXZlbnRFbWl0dGVyKFdpZGdldExheW91dFN0b3JlLmluc3RhbmNlLCBXaWRnZXRMYXlvdXRTdG9yZS5lbWlzc2lvbkZvclJvb20ocm9vbSksIHVwZGF0ZUFwcHMpO1xuXG4gICAgcmV0dXJuIGFwcHM7XG59O1xuXG5pbnRlcmZhY2UgSUFwcFJvd1Byb3BzIHtcbiAgICBhcHA6IElBcHA7XG4gICAgcm9vbTogUm9vbTtcbn1cblxuY29uc3QgQXBwUm93OiBSZWFjdC5GQzxJQXBwUm93UHJvcHM+ID0gKHsgYXBwLCByb29tIH0pID0+IHtcbiAgICBjb25zdCBuYW1lID0gV2lkZ2V0VXRpbHMuZ2V0V2lkZ2V0TmFtZShhcHApO1xuICAgIGNvbnN0IGRhdGFUaXRsZSA9IFdpZGdldFV0aWxzLmdldFdpZGdldERhdGFUaXRsZShhcHApO1xuICAgIGNvbnN0IHN1YnRpdGxlID0gZGF0YVRpdGxlICYmIFwiIC0gXCIgKyBkYXRhVGl0bGU7XG4gICAgY29uc3QgW2Nhbk1vZGlmeVdpZGdldCwgc2V0Q2FuTW9kaWZ5V2lkZ2V0XSA9IHVzZVN0YXRlPGJvb2xlYW4+KCk7XG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBzZXRDYW5Nb2RpZnlXaWRnZXQoV2lkZ2V0VXRpbHMuY2FuVXNlck1vZGlmeVdpZGdldHMocm9vbS5yb29tSWQpKTtcbiAgICB9LCBbcm9vbS5yb29tSWRdKTtcblxuICAgIGNvbnN0IG9uT3BlbldpZGdldENsaWNrID0gKCkgPT4ge1xuICAgICAgICBSaWdodFBhbmVsU3RvcmUuaW5zdGFuY2UucHVzaENhcmQoe1xuICAgICAgICAgICAgcGhhc2U6IFJpZ2h0UGFuZWxQaGFzZXMuV2lkZ2V0LFxuICAgICAgICAgICAgc3RhdGU6IHsgd2lkZ2V0SWQ6IGFwcC5pZCB9LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgY29uc3QgaXNQaW5uZWQgPSBXaWRnZXRMYXlvdXRTdG9yZS5pbnN0YW5jZS5pc0luQ29udGFpbmVyKHJvb20sIGFwcCwgQ29udGFpbmVyLlRvcCk7XG4gICAgY29uc3QgdG9nZ2xlUGluID0gaXNQaW5uZWRcbiAgICAgICAgPyAoKSA9PiB7IFdpZGdldExheW91dFN0b3JlLmluc3RhbmNlLm1vdmVUb0NvbnRhaW5lcihyb29tLCBhcHAsIENvbnRhaW5lci5SaWdodCk7IH1cbiAgICAgICAgOiAoKSA9PiB7IFdpZGdldExheW91dFN0b3JlLmluc3RhbmNlLm1vdmVUb0NvbnRhaW5lcihyb29tLCBhcHAsIENvbnRhaW5lci5Ub3ApOyB9O1xuXG4gICAgY29uc3QgW21lbnVEaXNwbGF5ZWQsIGhhbmRsZSwgb3Blbk1lbnUsIGNsb3NlTWVudV0gPSB1c2VDb250ZXh0TWVudTxIVE1MRGl2RWxlbWVudD4oKTtcbiAgICBsZXQgY29udGV4dE1lbnU7XG4gICAgaWYgKG1lbnVEaXNwbGF5ZWQpIHtcbiAgICAgICAgY29uc3QgcmVjdCA9IGhhbmRsZS5jdXJyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjb250ZXh0TWVudSA9IDxXaWRnZXRDb250ZXh0TWVudVxuICAgICAgICAgICAgY2hldnJvbkZhY2U9e0NoZXZyb25GYWNlLk5vbmV9XG4gICAgICAgICAgICByaWdodD17VUlTdG9yZS5pbnN0YW5jZS53aW5kb3dXaWR0aCAtIHJlY3QucmlnaHR9XG4gICAgICAgICAgICBib3R0b209e1VJU3RvcmUuaW5zdGFuY2Uud2luZG93SGVpZ2h0IC0gcmVjdC50b3B9XG4gICAgICAgICAgICBvbkZpbmlzaGVkPXtjbG9zZU1lbnV9XG4gICAgICAgICAgICBhcHA9e2FwcH1cbiAgICAgICAgLz47XG4gICAgfVxuXG4gICAgY29uc3QgY2Fubm90UGluID0gIWlzUGlubmVkICYmICFXaWRnZXRMYXlvdXRTdG9yZS5pbnN0YW5jZS5jYW5BZGRUb0NvbnRhaW5lcihyb29tLCBDb250YWluZXIuVG9wKTtcblxuICAgIGxldCBwaW5UaXRsZTogc3RyaW5nO1xuICAgIGlmIChjYW5ub3RQaW4pIHtcbiAgICAgICAgcGluVGl0bGUgPSBfdChcIllvdSBjYW4gb25seSBwaW4gdXAgdG8gJShjb3VudClzIHdpZGdldHNcIiwgeyBjb3VudDogTUFYX1BJTk5FRCB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBwaW5UaXRsZSA9IGlzUGlubmVkID8gX3QoXCJVbnBpblwiKSA6IF90KFwiUGluXCIpO1xuICAgIH1cblxuICAgIGNvbnN0IGlzTWF4aW1pc2VkID0gV2lkZ2V0TGF5b3V0U3RvcmUuaW5zdGFuY2UuaXNJbkNvbnRhaW5lcihyb29tLCBhcHAsIENvbnRhaW5lci5DZW50ZXIpO1xuICAgIGNvbnN0IHRvZ2dsZU1heGltaXNlZCA9IGlzTWF4aW1pc2VkXG4gICAgICAgID8gKCkgPT4geyBXaWRnZXRMYXlvdXRTdG9yZS5pbnN0YW5jZS5tb3ZlVG9Db250YWluZXIocm9vbSwgYXBwLCBDb250YWluZXIuUmlnaHQpOyB9XG4gICAgICAgIDogKCkgPT4geyBXaWRnZXRMYXlvdXRTdG9yZS5pbnN0YW5jZS5tb3ZlVG9Db250YWluZXIocm9vbSwgYXBwLCBDb250YWluZXIuQ2VudGVyKTsgfTtcblxuICAgIGNvbnN0IG1heGltaXNlVGl0bGUgPSBpc01heGltaXNlZCA/IF90KFwiQ2xvc2VcIikgOiBfdChcIk1heGltaXNlXCIpO1xuXG4gICAgbGV0IG9wZW5UaXRsZSA9IFwiXCI7XG4gICAgaWYgKGlzUGlubmVkKSB7XG4gICAgICAgIG9wZW5UaXRsZSA9IF90KFwiVW5waW4gdGhpcyB3aWRnZXQgdG8gdmlldyBpdCBpbiB0aGlzIHBhbmVsXCIpO1xuICAgIH0gZWxzZSBpZiAoaXNNYXhpbWlzZWQpIHtcbiAgICAgICAgb3BlblRpdGxlID1fdChcIkNsb3NlIHRoaXMgd2lkZ2V0IHRvIHZpZXcgaXQgaW4gdGhpcyBwYW5lbFwiKTtcbiAgICB9XG5cbiAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyhcIm14X0Jhc2VDYXJkX0J1dHRvbiBteF9Sb29tU3VtbWFyeUNhcmRfQnV0dG9uXCIsIHtcbiAgICAgICAgbXhfUm9vbVN1bW1hcnlDYXJkX0J1dHRvbl9waW5uZWQ6IGlzUGlubmVkLFxuICAgICAgICBteF9Sb29tU3VtbWFyeUNhcmRfQnV0dG9uX21heGltaXNlZDogaXNNYXhpbWlzZWQsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9e2NsYXNzZXN9IHJlZj17aGFuZGxlfT5cbiAgICAgICAgPEFjY2Vzc2libGVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tU3VtbWFyeUNhcmRfaWNvbl9hcHBcIlxuICAgICAgICAgICAgb25DbGljaz17b25PcGVuV2lkZ2V0Q2xpY2t9XG4gICAgICAgICAgICAvLyBvbmx5IHNob3cgYSB0b29sdGlwIGlmIHRoZSB3aWRnZXQgaXMgcGlubmVkXG4gICAgICAgICAgICB0aXRsZT17b3BlblRpdGxlfVxuICAgICAgICAgICAgZm9yY2VIaWRlPXshKGlzUGlubmVkIHx8IGlzTWF4aW1pc2VkKX1cbiAgICAgICAgICAgIGRpc2FibGVkPXtpc1Bpbm5lZCB8fCBpc01heGltaXNlZH1cbiAgICAgICAgPlxuICAgICAgICAgICAgPFdpZGdldEF2YXRhciBhcHA9e2FwcH0gLz5cbiAgICAgICAgICAgIDxzcGFuPnsgbmFtZSB9PC9zcGFuPlxuICAgICAgICAgICAgeyBzdWJ0aXRsZSB9XG4gICAgICAgIDwvQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24+XG5cbiAgICAgICAgeyBjYW5Nb2RpZnlXaWRnZXQgJiYgPENvbnRleHRNZW51VG9vbHRpcEJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUm9vbVN1bW1hcnlDYXJkX2FwcF9vcHRpb25zXCJcbiAgICAgICAgICAgIGlzRXhwYW5kZWQ9e21lbnVEaXNwbGF5ZWR9XG4gICAgICAgICAgICBvbkNsaWNrPXtvcGVuTWVudX1cbiAgICAgICAgICAgIHRpdGxlPXtfdChcIk9wdGlvbnNcIil9XG4gICAgICAgIC8+IH1cblxuICAgICAgICA8QWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21TdW1tYXJ5Q2FyZF9hcHBfcGluVG9nZ2xlXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9e3RvZ2dsZVBpbn1cbiAgICAgICAgICAgIHRpdGxlPXtwaW5UaXRsZX1cbiAgICAgICAgICAgIGRpc2FibGVkPXtjYW5ub3RQaW59XG4gICAgICAgIC8+XG4gICAgICAgIDxBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUm9vbVN1bW1hcnlDYXJkX2FwcF9tYXhpbWlzZVRvZ2dsZVwiXG4gICAgICAgICAgICBvbkNsaWNrPXt0b2dnbGVNYXhpbWlzZWR9XG4gICAgICAgICAgICB0aXRsZT17bWF4aW1pc2VUaXRsZX1cbiAgICAgICAgLz5cblxuICAgICAgICB7IGNvbnRleHRNZW51IH1cbiAgICA8L2Rpdj47XG59O1xuXG5jb25zdCBBcHBzU2VjdGlvbjogUmVhY3QuRkM8SUFwcHNTZWN0aW9uUHJvcHM+ID0gKHsgcm9vbSB9KSA9PiB7XG4gICAgY29uc3QgYXBwcyA9IHVzZVdpZGdldHMocm9vbSk7XG5cbiAgICBjb25zdCBvbk1hbmFnZUludGVncmF0aW9ucyA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgbWFuYWdlcnMgPSBJbnRlZ3JhdGlvbk1hbmFnZXJzLnNoYXJlZEluc3RhbmNlKCk7XG4gICAgICAgIGlmICghbWFuYWdlcnMuaGFzTWFuYWdlcigpKSB7XG4gICAgICAgICAgICBtYW5hZ2Vycy5vcGVuTm9NYW5hZ2VyRGlhbG9nKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBub2luc3BlY3Rpb24gSlNJZ25vcmVkUHJvbWlzZUZyb21DYWxsXG4gICAgICAgICAgICBtYW5hZ2Vycy5nZXRQcmltYXJ5TWFuYWdlcigpLm9wZW4ocm9vbSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgbGV0IGNvcHlMYXlvdXRCdG4gPSBudWxsO1xuICAgIGlmIChhcHBzLmxlbmd0aCA+IDAgJiYgV2lkZ2V0TGF5b3V0U3RvcmUuaW5zdGFuY2UuY2FuQ29weUxheW91dFRvUm9vbShyb29tKSkge1xuICAgICAgICBjb3B5TGF5b3V0QnRuID0gKFxuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD1cImxpbmtcIiBvbkNsaWNrPXsoKSA9PiBXaWRnZXRMYXlvdXRTdG9yZS5pbnN0YW5jZS5jb3B5TGF5b3V0VG9Sb29tKHJvb20pfT5cbiAgICAgICAgICAgICAgICB7IF90KFwiU2V0IG15IHJvb20gbGF5b3V0IGZvciBldmVyeW9uZVwiKSB9XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIDxHcm91cCBjbGFzc05hbWU9XCJteF9Sb29tU3VtbWFyeUNhcmRfYXBwc0dyb3VwXCIgdGl0bGU9e190KFwiV2lkZ2V0c1wiKX0+XG4gICAgICAgIHsgYXBwcy5tYXAoYXBwID0+IDxBcHBSb3cga2V5PXthcHAuaWR9IGFwcD17YXBwfSByb29tPXtyb29tfSAvPikgfVxuICAgICAgICB7IGNvcHlMYXlvdXRCdG4gfVxuICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwibGlua1wiIG9uQ2xpY2s9e29uTWFuYWdlSW50ZWdyYXRpb25zfT5cbiAgICAgICAgICAgIHsgYXBwcy5sZW5ndGggPiAwID8gX3QoXCJFZGl0IHdpZGdldHMsIGJyaWRnZXMgJiBib3RzXCIpIDogX3QoXCJBZGQgd2lkZ2V0cywgYnJpZGdlcyAmIGJvdHNcIikgfVxuICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgPC9Hcm91cD47XG59O1xuXG5jb25zdCBvblJvb21NZW1iZXJzQ2xpY2sgPSAoZXY6IEJ1dHRvbkV2ZW50KSA9PiB7XG4gICAgUmlnaHRQYW5lbFN0b3JlLmluc3RhbmNlLnB1c2hDYXJkKHsgcGhhc2U6IFJpZ2h0UGFuZWxQaGFzZXMuUm9vbU1lbWJlckxpc3QgfSwgdHJ1ZSk7XG4gICAgUG9zdGhvZ1RyYWNrZXJzLnRyYWNrSW50ZXJhY3Rpb24oXCJXZWJSaWdodFBhbmVsUm9vbUluZm9QZW9wbGVCdXR0b25cIiwgZXYpO1xufTtcblxuY29uc3Qgb25Sb29tRmlsZXNDbGljayA9ICgpID0+IHtcbiAgICBSaWdodFBhbmVsU3RvcmUuaW5zdGFuY2UucHVzaENhcmQoeyBwaGFzZTogUmlnaHRQYW5lbFBoYXNlcy5GaWxlUGFuZWwgfSwgdHJ1ZSk7XG59O1xuXG5jb25zdCBvblJvb21QaW5zQ2xpY2sgPSAoKSA9PiB7XG4gICAgUmlnaHRQYW5lbFN0b3JlLmluc3RhbmNlLnB1c2hDYXJkKHsgcGhhc2U6IFJpZ2h0UGFuZWxQaGFzZXMuUGlubmVkTWVzc2FnZXMgfSwgdHJ1ZSk7XG59O1xuXG5jb25zdCBvblJvb21TZXR0aW5nc0NsaWNrID0gKGV2OiBCdXR0b25FdmVudCkgPT4ge1xuICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoKHsgYWN0aW9uOiBcIm9wZW5fcm9vbV9zZXR0aW5nc1wiIH0pO1xuICAgIFBvc3Rob2dUcmFja2Vycy50cmFja0ludGVyYWN0aW9uKFwiV2ViUmlnaHRQYW5lbFJvb21JbmZvU2V0dGluZ3NCdXR0b25cIiwgZXYpO1xufTtcblxuY29uc3QgUm9vbVN1bW1hcnlDYXJkOiBSZWFjdC5GQzxJUHJvcHM+ID0gKHsgcm9vbSwgb25DbG9zZSB9KSA9PiB7XG4gICAgY29uc3QgY2xpID0gdXNlQ29udGV4dChNYXRyaXhDbGllbnRDb250ZXh0KTtcblxuICAgIGNvbnN0IG9uU2hhcmVSb29tQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhTaGFyZURpYWxvZywge1xuICAgICAgICAgICAgdGFyZ2V0OiByb29tLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgY29uc3Qgb25Sb29tRXhwb3J0Q2xpY2sgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhFeHBvcnREaWFsb2csIHtcbiAgICAgICAgICAgIHJvb20sXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjb25zdCBpc1Jvb21FbmNyeXB0ZWQgPSB1c2VJc0VuY3J5cHRlZChjbGksIHJvb20pO1xuICAgIGNvbnN0IHJvb21Db250ZXh0ID0gdXNlQ29udGV4dChSb29tQ29udGV4dCk7XG4gICAgY29uc3QgZTJlU3RhdHVzID0gcm9vbUNvbnRleHQuZTJlU3RhdHVzO1xuICAgIGNvbnN0IGlzVmlkZW9Sb29tID0gdXNlRmVhdHVyZUVuYWJsZWQoXCJmZWF0dXJlX3ZpZGVvX3Jvb21zXCIpICYmIHJvb20uaXNFbGVtZW50VmlkZW9Sb29tKCk7XG5cbiAgICBjb25zdCBhbGlhcyA9IHJvb20uZ2V0Q2Fub25pY2FsQWxpYXMoKSB8fCByb29tLmdldEFsdEFsaWFzZXMoKVswXSB8fCBcIlwiO1xuICAgIGNvbnN0IGhlYWRlciA9IDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tU3VtbWFyeUNhcmRfYXZhdGFyXCIgcm9sZT1cInByZXNlbnRhdGlvblwiPlxuICAgICAgICAgICAgPFJvb21BdmF0YXIgcm9vbT17cm9vbX0gaGVpZ2h0PXs1NH0gd2lkdGg9ezU0fSB2aWV3QXZhdGFyT25DbGljayAvPlxuICAgICAgICAgICAgPFRleHRXaXRoVG9vbHRpcFxuICAgICAgICAgICAgICAgIHRvb2x0aXA9e2lzUm9vbUVuY3J5cHRlZCA/IF90KFwiRW5jcnlwdGVkXCIpIDogX3QoXCJOb3QgZW5jcnlwdGVkXCIpfVxuICAgICAgICAgICAgICAgIGNsYXNzPXtjbGFzc05hbWVzKFwibXhfUm9vbVN1bW1hcnlDYXJkX2UyZWVcIiwge1xuICAgICAgICAgICAgICAgICAgICBteF9Sb29tU3VtbWFyeUNhcmRfZTJlZV9ub3JtYWw6IGlzUm9vbUVuY3J5cHRlZCxcbiAgICAgICAgICAgICAgICAgICAgbXhfUm9vbVN1bW1hcnlDYXJkX2UyZWVfd2FybmluZzogaXNSb29tRW5jcnlwdGVkICYmIGUyZVN0YXR1cyA9PT0gRTJFU3RhdHVzLldhcm5pbmcsXG4gICAgICAgICAgICAgICAgICAgIG14X1Jvb21TdW1tYXJ5Q2FyZF9lMmVlX3ZlcmlmaWVkOiBpc1Jvb21FbmNyeXB0ZWQgJiYgZTJlU3RhdHVzID09PSBFMkVTdGF0dXMuVmVyaWZpZWQsXG4gICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8Um9vbU5hbWUgcm9vbT17cm9vbX0+XG4gICAgICAgICAgICB7IG5hbWUgPT4gKFxuICAgICAgICAgICAgICAgIDxoMiB0aXRsZT17bmFtZX0+XG4gICAgICAgICAgICAgICAgICAgIHsgbmFtZSB9XG4gICAgICAgICAgICAgICAgPC9oMj5cbiAgICAgICAgICAgICkgfVxuICAgICAgICA8L1Jvb21OYW1lPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21TdW1tYXJ5Q2FyZF9hbGlhc1wiIHRpdGxlPXthbGlhc30+XG4gICAgICAgICAgICB7IGFsaWFzIH1cbiAgICAgICAgPC9kaXY+XG4gICAgPC9SZWFjdC5GcmFnbWVudD47XG5cbiAgICBjb25zdCBtZW1iZXJDb3VudCA9IHVzZVJvb21NZW1iZXJDb3VudChyb29tKTtcbiAgICBjb25zdCBwaW5uaW5nRW5hYmxlZCA9IHVzZUZlYXR1cmVFbmFibGVkKFwiZmVhdHVyZV9waW5uaW5nXCIpO1xuICAgIGNvbnN0IHBpbkNvdW50ID0gdXNlUGlubmVkRXZlbnRzKHBpbm5pbmdFbmFibGVkICYmIHJvb20pPy5sZW5ndGg7XG5cbiAgICByZXR1cm4gPEJhc2VDYXJkIGhlYWRlcj17aGVhZGVyfSBjbGFzc05hbWU9XCJteF9Sb29tU3VtbWFyeUNhcmRcIiBvbkNsb3NlPXtvbkNsb3NlfT5cbiAgICAgICAgPEdyb3VwIHRpdGxlPXtfdChcIkFib3V0XCIpfSBjbGFzc05hbWU9XCJteF9Sb29tU3VtbWFyeUNhcmRfYWJvdXRHcm91cFwiPlxuICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJteF9Sb29tU3VtbWFyeUNhcmRfaWNvbl9wZW9wbGVcIiBvbkNsaWNrPXtvblJvb21NZW1iZXJzQ2xpY2t9PlxuICAgICAgICAgICAgICAgIHsgX3QoXCJQZW9wbGVcIikgfVxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0Jhc2VDYXJkX0J1dHRvbl9zdWJsYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICB7IG1lbWJlckNvdW50IH1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgIHsgIWlzVmlkZW9Sb29tICYmIDxCdXR0b24gY2xhc3NOYW1lPVwibXhfUm9vbVN1bW1hcnlDYXJkX2ljb25fZmlsZXNcIiBvbkNsaWNrPXtvblJvb21GaWxlc0NsaWNrfT5cbiAgICAgICAgICAgICAgICB7IF90KFwiRmlsZXNcIikgfVxuICAgICAgICAgICAgPC9CdXR0b24+IH1cbiAgICAgICAgICAgIHsgcGlubmluZ0VuYWJsZWQgJiYgIWlzVmlkZW9Sb29tICYmXG4gICAgICAgICAgICAgICAgPEJ1dHRvbiBjbGFzc05hbWU9XCJteF9Sb29tU3VtbWFyeUNhcmRfaWNvbl9waW5zXCIgb25DbGljaz17b25Sb29tUGluc0NsaWNrfT5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIlBpbm5lZFwiKSB9XG4gICAgICAgICAgICAgICAgICAgIHsgcGluQ291bnQgPiAwICYmIDxzcGFuIGNsYXNzTmFtZT1cIm14X0Jhc2VDYXJkX0J1dHRvbl9zdWJsYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBwaW5Db3VudCB9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj4gfVxuICAgICAgICAgICAgICAgIDwvQnV0dG9uPiB9XG4gICAgICAgICAgICB7ICFpc1ZpZGVvUm9vbSAmJiA8QnV0dG9uIGNsYXNzTmFtZT1cIm14X1Jvb21TdW1tYXJ5Q2FyZF9pY29uX2V4cG9ydFwiIG9uQ2xpY2s9e29uUm9vbUV4cG9ydENsaWNrfT5cbiAgICAgICAgICAgICAgICB7IF90KFwiRXhwb3J0IGNoYXRcIikgfVxuICAgICAgICAgICAgPC9CdXR0b24+IH1cbiAgICAgICAgICAgIDxCdXR0b24gY2xhc3NOYW1lPVwibXhfUm9vbVN1bW1hcnlDYXJkX2ljb25fc2hhcmVcIiBvbkNsaWNrPXtvblNoYXJlUm9vbUNsaWNrfT5cbiAgICAgICAgICAgICAgICB7IF90KFwiU2hhcmUgcm9vbVwiKSB9XG4gICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgIDxCdXR0b24gY2xhc3NOYW1lPVwibXhfUm9vbVN1bW1hcnlDYXJkX2ljb25fc2V0dGluZ3NcIiBvbkNsaWNrPXtvblJvb21TZXR0aW5nc0NsaWNrfT5cbiAgICAgICAgICAgICAgICB7IF90KFwiUm9vbSBzZXR0aW5nc1wiKSB9XG4gICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPC9Hcm91cD5cblxuICAgICAgICB7XG4gICAgICAgICAgICBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFVJRmVhdHVyZS5XaWRnZXRzKVxuICAgICAgICAgICAgJiYgIWlzVmlkZW9Sb29tXG4gICAgICAgICAgICAmJiBzaG91bGRTaG93Q29tcG9uZW50KFVJQ29tcG9uZW50LkFkZEludGVncmF0aW9ucylcbiAgICAgICAgICAgICYmIDxBcHBzU2VjdGlvbiByb29tPXtyb29tfSAvPlxuICAgICAgICB9XG4gICAgPC9CYXNlQ2FyZD47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBSb29tU3VtbWFyeUNhcmQ7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXNEQSxNQUFNQSxNQUE4QixHQUFHLFFBQXNDO0VBQUEsSUFB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