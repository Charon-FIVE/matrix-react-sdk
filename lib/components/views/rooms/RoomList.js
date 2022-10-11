"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.TAG_ORDER = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _event = require("matrix-js-sdk/src/@types/event");

var _react = _interopRequireWildcard(require("react"));

var _RovingTabIndex = require("../../../accessibility/RovingTabIndex");

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _UIComponents = require("../../../customisations/helpers/UIComponents");

var _actions = require("../../../dispatcher/actions");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _useEventEmitter = require("../../../hooks/useEventEmitter");

var _languageHandler = require("../../../languageHandler");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _PosthogTrackers = _interopRequireDefault(require("../../../PosthogTrackers"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _UIFeature = require("../../../settings/UIFeature");

var _RoomNotificationStateStore = require("../../../stores/notifications/RoomNotificationStateStore");

var _models = require("../../../stores/room-list/models");

var _RoomListStore = _interopRequireWildcard(require("../../../stores/room-list/RoomListStore"));

var _RoomViewStore = require("../../../stores/RoomViewStore");

var _spaces = require("../../../stores/spaces");

var _SpaceStore = _interopRequireDefault(require("../../../stores/spaces/SpaceStore"));

var _arrays = require("../../../utils/arrays");

var _objects = require("../../../utils/objects");

var _space = require("../../../utils/space");

var _ContextMenu = require("../../structures/ContextMenu");

var _RoomAvatar = _interopRequireDefault(require("../avatars/RoomAvatar"));

var _BetaCard = require("../beta/BetaCard");

var _IconizedContextMenu = _interopRequireWildcard(require("../context_menus/IconizedContextMenu"));

var _AccessibleTooltipButton = _interopRequireDefault(require("../elements/AccessibleTooltipButton"));

var _ExtraTile = _interopRequireDefault(require("./ExtraTile"));

var _RoomSublist = _interopRequireDefault(require("./RoomSublist"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2015-2018, 2020, 2021 The Matrix.org Foundation C.I.C.

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
const TAG_ORDER = [_models.DefaultTagID.Invite, _models.DefaultTagID.SavedItems, _models.DefaultTagID.Favourite, _models.DefaultTagID.DM, _models.DefaultTagID.Untagged, _models.DefaultTagID.LowPriority, _models.DefaultTagID.ServerNotice, _models.DefaultTagID.Suggested, _models.DefaultTagID.Archived];
exports.TAG_ORDER = TAG_ORDER;
const ALWAYS_VISIBLE_TAGS = [_models.DefaultTagID.DM, _models.DefaultTagID.Untagged];

const auxButtonContextMenuPosition = handle => {
  const rect = handle.current.getBoundingClientRect();
  return {
    chevronFace: _ContextMenu.ChevronFace.None,
    left: rect.left - 7,
    top: rect.top + rect.height
  };
};

const DmAuxButton = _ref => {
  let {
    tabIndex,
    dispatcher = _dispatcher.default
  } = _ref;
  const [menuDisplayed, handle, openMenu, closeMenu] = (0, _ContextMenu.useContextMenu)();
  const activeSpace = (0, _useEventEmitter.useEventEmitterState)(_SpaceStore.default.instance, _spaces.UPDATE_SELECTED_SPACE, () => {
    return _SpaceStore.default.instance.activeSpaceRoom;
  });
  const showCreateRooms = (0, _UIComponents.shouldShowComponent)(_UIFeature.UIComponent.CreateRooms);
  const showInviteUsers = (0, _UIComponents.shouldShowComponent)(_UIFeature.UIComponent.InviteUsers);

  if (activeSpace && (showCreateRooms || showInviteUsers)) {
    let contextMenu;

    if (menuDisplayed) {
      const canInvite = (0, _space.shouldShowSpaceInvite)(activeSpace);
      contextMenu = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.default, (0, _extends2.default)({}, auxButtonContextMenuPosition(handle), {
        onFinished: closeMenu,
        compact: true
      }), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, {
        first: true
      }, showCreateRooms && /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        label: (0, _languageHandler._t)("Start new chat"),
        iconClassName: "mx_RoomList_iconStartChat",
        onClick: e => {
          e.preventDefault();
          e.stopPropagation();
          closeMenu();

          _dispatcher.default.dispatch({
            action: "view_create_chat"
          });

          _PosthogTrackers.default.trackInteraction("WebRoomListRoomsSublistPlusMenuCreateChatItem", e);
        }
      }), showInviteUsers && /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
        label: (0, _languageHandler._t)("Invite to space"),
        iconClassName: "mx_RoomList_iconInvite",
        onClick: e => {
          e.preventDefault();
          e.stopPropagation();
          closeMenu();
          (0, _space.showSpaceInvite)(activeSpace);
        },
        disabled: !canInvite,
        tooltip: canInvite ? undefined : (0, _languageHandler._t)("You do not have permissions to invite people to this space")
      })));
    }

    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_ContextMenu.ContextMenuTooltipButton, {
      tabIndex: tabIndex,
      onClick: openMenu,
      className: "mx_RoomSublist_auxButton",
      tooltipClassName: "mx_RoomSublist_addRoomTooltip",
      "aria-label": (0, _languageHandler._t)("Add people"),
      title: (0, _languageHandler._t)("Add people"),
      isExpanded: menuDisplayed,
      inputRef: handle
    }), contextMenu);
  } else if (!activeSpace && showCreateRooms) {
    return /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
      tabIndex: tabIndex,
      onClick: e => {
        dispatcher.dispatch({
          action: 'view_create_chat'
        });

        _PosthogTrackers.default.trackInteraction("WebRoomListRoomsSublistPlusMenuCreateChatItem", e);
      },
      className: "mx_RoomSublist_auxButton",
      tooltipClassName: "mx_RoomSublist_addRoomTooltip",
      "aria-label": (0, _languageHandler._t)("Start chat"),
      title: (0, _languageHandler._t)("Start chat")
    });
  }

  return null;
};

const UntaggedAuxButton = _ref2 => {
  let {
    tabIndex
  } = _ref2;
  const [menuDisplayed, handle, openMenu, closeMenu] = (0, _ContextMenu.useContextMenu)();
  const activeSpace = (0, _useEventEmitter.useEventEmitterState)(_SpaceStore.default.instance, _spaces.UPDATE_SELECTED_SPACE, () => {
    return _SpaceStore.default.instance.activeSpaceRoom;
  });
  const showCreateRoom = (0, _UIComponents.shouldShowComponent)(_UIFeature.UIComponent.CreateRooms);
  let contextMenuContent;

  if (menuDisplayed && activeSpace) {
    const canAddRooms = activeSpace.currentState.maySendStateEvent(_event.EventType.SpaceChild, _MatrixClientPeg.MatrixClientPeg.get().getUserId());
    contextMenuContent = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, {
      first: true
    }, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
      label: (0, _languageHandler._t)("Explore rooms"),
      iconClassName: "mx_RoomList_iconExplore",
      onClick: e => {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();

        _dispatcher.default.dispatch({
          action: _actions.Action.ViewRoom,
          room_id: activeSpace.roomId,
          metricsTrigger: undefined // other

        });

        _PosthogTrackers.default.trackInteraction("WebRoomListRoomsSublistPlusMenuExploreRoomsItem", e);
      }
    }), showCreateRoom ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
      label: (0, _languageHandler._t)("New room"),
      iconClassName: "mx_RoomList_iconNewRoom",
      onClick: e => {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
        (0, _space.showCreateNewRoom)(activeSpace);

        _PosthogTrackers.default.trackInteraction("WebRoomListRoomsSublistPlusMenuCreateRoomItem", e);
      },
      disabled: !canAddRooms,
      tooltip: canAddRooms ? undefined : (0, _languageHandler._t)("You do not have permissions to create new rooms in this space")
    }), _SettingsStore.default.getValue("feature_video_rooms") && /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
      label: (0, _languageHandler._t)("New video room"),
      iconClassName: "mx_RoomList_iconNewVideoRoom",
      onClick: e => {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
        (0, _space.showCreateNewRoom)(activeSpace, _event.RoomType.ElementVideo);
      },
      disabled: !canAddRooms,
      tooltip: canAddRooms ? undefined : (0, _languageHandler._t)("You do not have permissions to create new rooms in this space")
    }, /*#__PURE__*/_react.default.createElement(_BetaCard.BetaPill, null)), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
      label: (0, _languageHandler._t)("Add existing room"),
      iconClassName: "mx_RoomList_iconAddExistingRoom",
      onClick: e => {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
        (0, _space.showAddExistingRooms)(activeSpace);
      },
      disabled: !canAddRooms,
      tooltip: canAddRooms ? undefined : (0, _languageHandler._t)("You do not have permissions to add rooms to this space")
    })) : null);
  } else if (menuDisplayed) {
    contextMenuContent = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, {
      first: true
    }, showCreateRoom && /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
      label: (0, _languageHandler._t)("New room"),
      iconClassName: "mx_RoomList_iconNewRoom",
      onClick: e => {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();

        _dispatcher.default.dispatch({
          action: "view_create_room"
        });

        _PosthogTrackers.default.trackInteraction("WebRoomListRoomsSublistPlusMenuCreateRoomItem", e);
      }
    }), _SettingsStore.default.getValue("feature_video_rooms") && /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
      label: (0, _languageHandler._t)("New video room"),
      iconClassName: "mx_RoomList_iconNewVideoRoom",
      onClick: e => {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();

        _dispatcher.default.dispatch({
          action: "view_create_room",
          type: _event.RoomType.ElementVideo
        });
      }
    }, /*#__PURE__*/_react.default.createElement(_BetaCard.BetaPill, null))), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOption, {
      label: (0, _languageHandler._t)("Explore public rooms"),
      iconClassName: "mx_RoomList_iconExplore",
      onClick: e => {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();

        _PosthogTrackers.default.trackInteraction("WebRoomListRoomsSublistPlusMenuExploreRoomsItem", e);

        _dispatcher.default.fire(_actions.Action.ViewRoomDirectory);
      }
    }));
  }

  let contextMenu;

  if (menuDisplayed) {
    contextMenu = /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.default, (0, _extends2.default)({}, auxButtonContextMenuPosition(handle), {
      onFinished: closeMenu,
      compact: true
    }), contextMenuContent);
  }

  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_ContextMenu.ContextMenuTooltipButton, {
    tabIndex: tabIndex,
    onClick: openMenu,
    className: "mx_RoomSublist_auxButton",
    tooltipClassName: "mx_RoomSublist_addRoomTooltip",
    "aria-label": (0, _languageHandler._t)("Add room"),
    title: (0, _languageHandler._t)("Add room"),
    isExpanded: menuDisplayed,
    inputRef: handle
  }), contextMenu);
};

const TAG_AESTHETICS = {
  [_models.DefaultTagID.Invite]: {
    sectionLabel: (0, _languageHandler._td)("Invites"),
    isInvite: true,
    defaultHidden: false
  },
  [_models.DefaultTagID.Favourite]: {
    sectionLabel: (0, _languageHandler._td)("Favourites"),
    isInvite: false,
    defaultHidden: false
  },
  [_models.DefaultTagID.SavedItems]: {
    sectionLabel: (0, _languageHandler._td)("Saved Items"),
    isInvite: false,
    defaultHidden: false
  },
  [_models.DefaultTagID.DM]: {
    sectionLabel: (0, _languageHandler._td)("People"),
    isInvite: false,
    defaultHidden: false,
    AuxButtonComponent: DmAuxButton
  },
  [_models.DefaultTagID.Untagged]: {
    sectionLabel: (0, _languageHandler._td)("Rooms"),
    isInvite: false,
    defaultHidden: false,
    AuxButtonComponent: UntaggedAuxButton
  },
  [_models.DefaultTagID.LowPriority]: {
    sectionLabel: (0, _languageHandler._td)("Low priority"),
    isInvite: false,
    defaultHidden: false
  },
  [_models.DefaultTagID.ServerNotice]: {
    sectionLabel: (0, _languageHandler._td)("System Alerts"),
    isInvite: false,
    defaultHidden: false
  },
  // TODO: Replace with archived view: https://github.com/vector-im/element-web/issues/14038
  [_models.DefaultTagID.Archived]: {
    sectionLabel: (0, _languageHandler._td)("Historical"),
    isInvite: false,
    defaultHidden: true
  },
  [_models.DefaultTagID.Suggested]: {
    sectionLabel: (0, _languageHandler._td)("Suggested Rooms"),
    isInvite: false,
    defaultHidden: false
  }
};

class RoomList extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "roomStoreToken", void 0);
    (0, _defineProperty2.default)(this, "treeRef", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "favouriteMessageWatcher", void 0);
    (0, _defineProperty2.default)(this, "context", void 0);
    (0, _defineProperty2.default)(this, "onRoomViewStoreUpdate", () => {
      this.setState({
        currentRoomId: _RoomViewStore.RoomViewStore.instance.getRoomId()
      });
    });
    (0, _defineProperty2.default)(this, "onAction", payload => {
      if (payload.action === _actions.Action.ViewRoomDelta) {
        const viewRoomDeltaPayload = payload;

        const currentRoomId = _RoomViewStore.RoomViewStore.instance.getRoomId();

        const room = this.getRoomDelta(currentRoomId, viewRoomDeltaPayload.delta, viewRoomDeltaPayload.unread);

        if (room) {
          _dispatcher.default.dispatch({
            action: _actions.Action.ViewRoom,
            room_id: room.roomId,
            show_room_tile: true,
            // to make sure the room gets scrolled into view
            metricsTrigger: "WebKeyboardShortcut",
            metricsViaKeyboard: true
          });
        }
      } else if (payload.action === _actions.Action.PstnSupportUpdated) {
        this.updateLists();
      }
    });
    (0, _defineProperty2.default)(this, "getRoomDelta", function (roomId, delta) {
      let unread = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      const lists = _RoomListStore.default.instance.orderedLists;
      const rooms = [];
      TAG_ORDER.forEach(t => {
        let listRooms = lists[t];

        if (unread) {
          // filter to only notification rooms (and our current active room so we can index properly)
          listRooms = listRooms.filter(r => {
            const state = _RoomNotificationStateStore.RoomNotificationStateStore.instance.getRoomState(r);

            return state.room.roomId === roomId || state.isUnread;
          });
        }

        rooms.push(...listRooms);
      });
      const currentIndex = rooms.findIndex(r => r.roomId === roomId); // use slice to account for looping around the start

      const [room] = rooms.slice((currentIndex + delta) % rooms.length);
      return room;
    });
    (0, _defineProperty2.default)(this, "updateSuggestedRooms", suggestedRooms => {
      this.setState({
        suggestedRooms
      });
    });
    (0, _defineProperty2.default)(this, "updateLists", () => {
      const newLists = _RoomListStore.default.instance.orderedLists;
      const previousListIds = Object.keys(this.state.sublists);
      const newListIds = Object.keys(newLists);
      let doUpdate = (0, _arrays.arrayHasDiff)(previousListIds, newListIds);

      if (!doUpdate) {
        // so we didn't have the visible sublists change, but did the contents of those
        // sublists change significantly enough to break the sticky headers? Probably, so
        // let's check the length of each.
        for (const tagId of newListIds) {
          const oldRooms = this.state.sublists[tagId];
          const newRooms = newLists[tagId];

          if (oldRooms.length !== newRooms.length) {
            doUpdate = true;
            break;
          }
        }
      }

      if (doUpdate) {
        // We have to break our reference to the room list store if we want to be able to
        // diff the object for changes, so do that.
        // @ts-ignore - ITagMap is ts-ignored so this will have to be too
        const newSublists = (0, _objects.objectWithOnly)(newLists, newListIds);
        const sublists = (0, _objects.objectShallowClone)(newSublists, (k, v) => (0, _arrays.arrayFastClone)(v));
        this.setState({
          sublists
        }, () => {
          this.props.onResize();
        });
      }
    });
    this.state = {
      sublists: {},
      suggestedRooms: _SpaceStore.default.instance.suggestedRooms,
      feature_favourite_messages: _SettingsStore.default.getValue("feature_favourite_messages")
    };
  }

  componentDidMount() {
    var _this = this;

    this.dispatcherRef = _dispatcher.default.register(this.onAction);
    this.roomStoreToken = _RoomViewStore.RoomViewStore.instance.addListener(this.onRoomViewStoreUpdate);

    _SpaceStore.default.instance.on(_spaces.UPDATE_SUGGESTED_ROOMS, this.updateSuggestedRooms);

    _RoomListStore.default.instance.on(_RoomListStore.LISTS_UPDATE_EVENT, this.updateLists);

    this.favouriteMessageWatcher = _SettingsStore.default.watchSetting("feature_favourite_messages", null, function () {
      for (var _len = arguments.length, _ref3 = new Array(_len), _key = 0; _key < _len; _key++) {
        _ref3[_key] = arguments[_key];
      }

      let [,,, value] = _ref3;

      _this.setState({
        feature_favourite_messages: value
      });
    });
    this.updateLists(); // trigger the first update
  }

  componentWillUnmount() {
    _SpaceStore.default.instance.off(_spaces.UPDATE_SUGGESTED_ROOMS, this.updateSuggestedRooms);

    _RoomListStore.default.instance.off(_RoomListStore.LISTS_UPDATE_EVENT, this.updateLists);

    _SettingsStore.default.unwatchSetting(this.favouriteMessageWatcher);

    _dispatcher.default.unregister(this.dispatcherRef);

    if (this.roomStoreToken) this.roomStoreToken.remove();
  }

  renderSuggestedRooms() {
    return this.state.suggestedRooms.map(room => {
      const name = room.name || room.canonical_alias || room.aliases?.[0] || (0, _languageHandler._t)("Empty room");

      const avatar = /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
        oobData: {
          name,
          avatarUrl: room.avatar_url
        },
        width: 32,
        height: 32,
        resizeMethod: "crop"
      });

      const viewRoom = ev => {
        _dispatcher.default.dispatch({
          action: _actions.Action.ViewRoom,
          room_alias: room.canonical_alias || room.aliases?.[0],
          room_id: room.room_id,
          via_servers: room.viaServers,
          oob_data: {
            avatarUrl: room.avatar_url,
            name
          },
          metricsTrigger: "RoomList",
          metricsViaKeyboard: ev.type !== "click"
        });
      };

      return /*#__PURE__*/_react.default.createElement(_ExtraTile.default, {
        isMinimized: this.props.isMinimized,
        isSelected: this.state.currentRoomId === room.room_id,
        displayName: name,
        avatar: avatar,
        onClick: viewRoom,
        key: `suggestedRoomTile_${room.room_id}`
      });
    });
  }

  renderFavoriteMessagesList() {
    const avatar = /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
      oobData: {
        name: "Favourites"
      },
      width: 32,
      height: 32,
      resizeMethod: "crop"
    });

    return [/*#__PURE__*/_react.default.createElement(_ExtraTile.default, {
      isMinimized: this.props.isMinimized,
      isSelected: false,
      displayName: "Favourite Messages",
      avatar: avatar,
      onClick: () => "",
      key: "favMessagesTile_key"
    })];
  }

  renderSublists() {
    // show a skeleton UI if the user is in no rooms and they are not filtering and have no suggested rooms
    const showSkeleton = !this.state.suggestedRooms?.length && Object.values(_RoomListStore.default.instance.orderedLists).every(list => !list?.length);
    return TAG_ORDER.map(orderedTagId => {
      let extraTiles = null;

      if (orderedTagId === _models.DefaultTagID.Suggested) {
        extraTiles = this.renderSuggestedRooms();
      } else if (this.state.feature_favourite_messages && orderedTagId === _models.DefaultTagID.SavedItems) {
        extraTiles = this.renderFavoriteMessagesList();
      }

      const aesthetics = TAG_AESTHETICS[orderedTagId];
      if (!aesthetics) throw new Error(`Tag ${orderedTagId} does not have aesthetics`);
      let alwaysVisible = ALWAYS_VISIBLE_TAGS.includes(orderedTagId);

      if (this.props.activeSpace === _spaces.MetaSpace.Favourites && orderedTagId !== _models.DefaultTagID.Favourite || this.props.activeSpace === _spaces.MetaSpace.People && orderedTagId !== _models.DefaultTagID.DM || this.props.activeSpace === _spaces.MetaSpace.Orphans && orderedTagId === _models.DefaultTagID.DM || !(0, _spaces.isMetaSpace)(this.props.activeSpace) && orderedTagId === _models.DefaultTagID.DM && !_SettingsStore.default.getValue("Spaces.showPeopleInSpace", this.props.activeSpace)) {
        alwaysVisible = false;
      }

      let forceExpanded = false;

      if (this.props.activeSpace === _spaces.MetaSpace.Favourites && orderedTagId === _models.DefaultTagID.Favourite || this.props.activeSpace === _spaces.MetaSpace.People && orderedTagId === _models.DefaultTagID.DM) {
        forceExpanded = true;
      } // The cost of mounting/unmounting this component offsets the cost
      // of keeping it in the DOM and hiding it when it is not required


      return /*#__PURE__*/_react.default.createElement(_RoomSublist.default, {
        key: `sublist-${orderedTagId}`,
        tagId: orderedTagId,
        forRooms: true,
        startAsHidden: aesthetics.defaultHidden,
        label: aesthetics.sectionLabelRaw ? aesthetics.sectionLabelRaw : (0, _languageHandler._t)(aesthetics.sectionLabel),
        AuxButtonComponent: aesthetics.AuxButtonComponent,
        isMinimized: this.props.isMinimized,
        showSkeleton: showSkeleton,
        extraTiles: extraTiles,
        resizeNotifier: this.props.resizeNotifier,
        alwaysVisible: alwaysVisible,
        onListCollapse: this.props.onListCollapse,
        forceExpanded: forceExpanded
      });
    });
  }

  focus() {
    // focus the first focusable element in this aria treeview widget
    const treeItems = this.treeRef.current?.querySelectorAll('[role="treeitem"]');
    if (!treeItems) return;
    [...treeItems].find(e => e.offsetParent !== null)?.focus();
  }

  render() {
    const sublists = this.renderSublists();
    return /*#__PURE__*/_react.default.createElement(_RovingTabIndex.RovingTabIndexProvider, {
      handleHomeEnd: true,
      handleUpDown: true,
      onKeyDown: this.props.onKeyDown
    }, _ref4 => {
      let {
        onKeyDownHandler
      } = _ref4;
      return /*#__PURE__*/_react.default.createElement("div", {
        onFocus: this.props.onFocus,
        onBlur: this.props.onBlur,
        onKeyDown: onKeyDownHandler,
        className: "mx_RoomList",
        role: "tree",
        "aria-label": (0, _languageHandler._t)("Rooms"),
        ref: this.treeRef
      }, sublists);
    });
  }

}

exports.default = RoomList;
(0, _defineProperty2.default)(RoomList, "contextType", _MatrixClientContext.default);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUQUdfT1JERVIiLCJEZWZhdWx0VGFnSUQiLCJJbnZpdGUiLCJTYXZlZEl0ZW1zIiwiRmF2b3VyaXRlIiwiRE0iLCJVbnRhZ2dlZCIsIkxvd1ByaW9yaXR5IiwiU2VydmVyTm90aWNlIiwiU3VnZ2VzdGVkIiwiQXJjaGl2ZWQiLCJBTFdBWVNfVklTSUJMRV9UQUdTIiwiYXV4QnV0dG9uQ29udGV4dE1lbnVQb3NpdGlvbiIsImhhbmRsZSIsInJlY3QiLCJjdXJyZW50IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiY2hldnJvbkZhY2UiLCJDaGV2cm9uRmFjZSIsIk5vbmUiLCJsZWZ0IiwidG9wIiwiaGVpZ2h0IiwiRG1BdXhCdXR0b24iLCJ0YWJJbmRleCIsImRpc3BhdGNoZXIiLCJkZWZhdWx0RGlzcGF0Y2hlciIsIm1lbnVEaXNwbGF5ZWQiLCJvcGVuTWVudSIsImNsb3NlTWVudSIsInVzZUNvbnRleHRNZW51IiwiYWN0aXZlU3BhY2UiLCJ1c2VFdmVudEVtaXR0ZXJTdGF0ZSIsIlNwYWNlU3RvcmUiLCJpbnN0YW5jZSIsIlVQREFURV9TRUxFQ1RFRF9TUEFDRSIsImFjdGl2ZVNwYWNlUm9vbSIsInNob3dDcmVhdGVSb29tcyIsInNob3VsZFNob3dDb21wb25lbnQiLCJVSUNvbXBvbmVudCIsIkNyZWF0ZVJvb21zIiwic2hvd0ludml0ZVVzZXJzIiwiSW52aXRlVXNlcnMiLCJjb250ZXh0TWVudSIsImNhbkludml0ZSIsInNob3VsZFNob3dTcGFjZUludml0ZSIsIl90IiwiZSIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJQb3N0aG9nVHJhY2tlcnMiLCJ0cmFja0ludGVyYWN0aW9uIiwic2hvd1NwYWNlSW52aXRlIiwidW5kZWZpbmVkIiwiVW50YWdnZWRBdXhCdXR0b24iLCJzaG93Q3JlYXRlUm9vbSIsImNvbnRleHRNZW51Q29udGVudCIsImNhbkFkZFJvb21zIiwiY3VycmVudFN0YXRlIiwibWF5U2VuZFN0YXRlRXZlbnQiLCJFdmVudFR5cGUiLCJTcGFjZUNoaWxkIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiZ2V0VXNlcklkIiwiQWN0aW9uIiwiVmlld1Jvb20iLCJyb29tX2lkIiwicm9vbUlkIiwibWV0cmljc1RyaWdnZXIiLCJzaG93Q3JlYXRlTmV3Um9vbSIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsIlJvb21UeXBlIiwiRWxlbWVudFZpZGVvIiwic2hvd0FkZEV4aXN0aW5nUm9vbXMiLCJ0eXBlIiwiZmlyZSIsIlZpZXdSb29tRGlyZWN0b3J5IiwiVEFHX0FFU1RIRVRJQ1MiLCJzZWN0aW9uTGFiZWwiLCJfdGQiLCJpc0ludml0ZSIsImRlZmF1bHRIaWRkZW4iLCJBdXhCdXR0b25Db21wb25lbnQiLCJSb29tTGlzdCIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjcmVhdGVSZWYiLCJzZXRTdGF0ZSIsImN1cnJlbnRSb29tSWQiLCJSb29tVmlld1N0b3JlIiwiZ2V0Um9vbUlkIiwicGF5bG9hZCIsIlZpZXdSb29tRGVsdGEiLCJ2aWV3Um9vbURlbHRhUGF5bG9hZCIsInJvb20iLCJnZXRSb29tRGVsdGEiLCJkZWx0YSIsInVucmVhZCIsInNob3dfcm9vbV90aWxlIiwibWV0cmljc1ZpYUtleWJvYXJkIiwiUHN0blN1cHBvcnRVcGRhdGVkIiwidXBkYXRlTGlzdHMiLCJsaXN0cyIsIlJvb21MaXN0U3RvcmUiLCJvcmRlcmVkTGlzdHMiLCJyb29tcyIsImZvckVhY2giLCJ0IiwibGlzdFJvb21zIiwiZmlsdGVyIiwiciIsInN0YXRlIiwiUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUiLCJnZXRSb29tU3RhdGUiLCJpc1VucmVhZCIsInB1c2giLCJjdXJyZW50SW5kZXgiLCJmaW5kSW5kZXgiLCJzbGljZSIsImxlbmd0aCIsInN1Z2dlc3RlZFJvb21zIiwibmV3TGlzdHMiLCJwcmV2aW91c0xpc3RJZHMiLCJPYmplY3QiLCJrZXlzIiwic3VibGlzdHMiLCJuZXdMaXN0SWRzIiwiZG9VcGRhdGUiLCJhcnJheUhhc0RpZmYiLCJ0YWdJZCIsIm9sZFJvb21zIiwibmV3Um9vbXMiLCJuZXdTdWJsaXN0cyIsIm9iamVjdFdpdGhPbmx5Iiwib2JqZWN0U2hhbGxvd0Nsb25lIiwiayIsInYiLCJhcnJheUZhc3RDbG9uZSIsIm9uUmVzaXplIiwiZmVhdHVyZV9mYXZvdXJpdGVfbWVzc2FnZXMiLCJjb21wb25lbnREaWRNb3VudCIsImRpc3BhdGNoZXJSZWYiLCJyZWdpc3RlciIsIm9uQWN0aW9uIiwicm9vbVN0b3JlVG9rZW4iLCJhZGRMaXN0ZW5lciIsIm9uUm9vbVZpZXdTdG9yZVVwZGF0ZSIsIm9uIiwiVVBEQVRFX1NVR0dFU1RFRF9ST09NUyIsInVwZGF0ZVN1Z2dlc3RlZFJvb21zIiwiTElTVFNfVVBEQVRFX0VWRU5UIiwiZmF2b3VyaXRlTWVzc2FnZVdhdGNoZXIiLCJ3YXRjaFNldHRpbmciLCJ2YWx1ZSIsImNvbXBvbmVudFdpbGxVbm1vdW50Iiwib2ZmIiwidW53YXRjaFNldHRpbmciLCJ1bnJlZ2lzdGVyIiwicmVtb3ZlIiwicmVuZGVyU3VnZ2VzdGVkUm9vbXMiLCJtYXAiLCJuYW1lIiwiY2Fub25pY2FsX2FsaWFzIiwiYWxpYXNlcyIsImF2YXRhciIsImF2YXRhclVybCIsImF2YXRhcl91cmwiLCJ2aWV3Um9vbSIsImV2Iiwicm9vbV9hbGlhcyIsInZpYV9zZXJ2ZXJzIiwidmlhU2VydmVycyIsIm9vYl9kYXRhIiwiaXNNaW5pbWl6ZWQiLCJyZW5kZXJGYXZvcml0ZU1lc3NhZ2VzTGlzdCIsInJlbmRlclN1Ymxpc3RzIiwic2hvd1NrZWxldG9uIiwidmFsdWVzIiwiZXZlcnkiLCJsaXN0Iiwib3JkZXJlZFRhZ0lkIiwiZXh0cmFUaWxlcyIsImFlc3RoZXRpY3MiLCJFcnJvciIsImFsd2F5c1Zpc2libGUiLCJpbmNsdWRlcyIsIk1ldGFTcGFjZSIsIkZhdm91cml0ZXMiLCJQZW9wbGUiLCJPcnBoYW5zIiwiaXNNZXRhU3BhY2UiLCJmb3JjZUV4cGFuZGVkIiwic2VjdGlvbkxhYmVsUmF3IiwicmVzaXplTm90aWZpZXIiLCJvbkxpc3RDb2xsYXBzZSIsImZvY3VzIiwidHJlZUl0ZW1zIiwidHJlZVJlZiIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJmaW5kIiwib2Zmc2V0UGFyZW50IiwicmVuZGVyIiwib25LZXlEb3duIiwib25LZXlEb3duSGFuZGxlciIsIm9uRm9jdXMiLCJvbkJsdXIiLCJNYXRyaXhDbGllbnRDb250ZXh0Il0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3Mvcm9vbXMvUm9vbUxpc3QudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNS0yMDE4LCAyMDIwLCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0ICogYXMgZmJFbWl0dGVyIGZyb20gXCJmYmVtaXR0ZXJcIjtcbmltcG9ydCB7IEV2ZW50VHlwZSwgUm9vbVR5cGUgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL2V2ZW50XCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQgUmVhY3QsIHsgQ29tcG9uZW50VHlwZSwgY3JlYXRlUmVmLCBSZWFjdENvbXBvbmVudEVsZW1lbnQsIFJlZk9iamVjdCB9IGZyb20gXCJyZWFjdFwiO1xuXG5pbXBvcnQgeyBJU3RhdGUgYXMgSVJvdmluZ1RhYkluZGV4U3RhdGUsIFJvdmluZ1RhYkluZGV4UHJvdmlkZXIgfSBmcm9tIFwiLi4vLi4vLi4vYWNjZXNzaWJpbGl0eS9Sb3ZpbmdUYWJJbmRleFwiO1xuaW1wb3J0IE1hdHJpeENsaWVudENvbnRleHQgZnJvbSBcIi4uLy4uLy4uL2NvbnRleHRzL01hdHJpeENsaWVudENvbnRleHRcIjtcbmltcG9ydCB7IHNob3VsZFNob3dDb21wb25lbnQgfSBmcm9tIFwiLi4vLi4vLi4vY3VzdG9taXNhdGlvbnMvaGVscGVycy9VSUNvbXBvbmVudHNcIjtcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcbmltcG9ydCBkZWZhdWx0RGlzcGF0Y2hlciBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgeyBBY3Rpb25QYXlsb2FkIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHNcIjtcbmltcG9ydCB7IFZpZXdSb29tRGVsdGFQYXlsb2FkIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvVmlld1Jvb21EZWx0YVBheWxvYWRcIjtcbmltcG9ydCB7IFZpZXdSb29tUGF5bG9hZCB9IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzL1ZpZXdSb29tUGF5bG9hZFwiO1xuaW1wb3J0IHsgdXNlRXZlbnRFbWl0dGVyU3RhdGUgfSBmcm9tIFwiLi4vLi4vLi4vaG9va3MvdXNlRXZlbnRFbWl0dGVyXCI7XG5pbXBvcnQgeyBfdCwgX3RkIH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSBcIi4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IFBvc3Rob2dUcmFja2VycyBmcm9tIFwiLi4vLi4vLi4vUG9zdGhvZ1RyYWNrZXJzXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHsgVUlDb21wb25lbnQgfSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvVUlGZWF0dXJlXCI7XG5pbXBvcnQgeyBSb29tTm90aWZpY2F0aW9uU3RhdGVTdG9yZSB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvbm90aWZpY2F0aW9ucy9Sb29tTm90aWZpY2F0aW9uU3RhdGVTdG9yZVwiO1xuaW1wb3J0IHsgSVRhZ01hcCB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvcm9vbS1saXN0L2FsZ29yaXRobXMvbW9kZWxzXCI7XG5pbXBvcnQgeyBEZWZhdWx0VGFnSUQsIFRhZ0lEIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9yb29tLWxpc3QvbW9kZWxzXCI7XG5pbXBvcnQgUm9vbUxpc3RTdG9yZSwgeyBMSVNUU19VUERBVEVfRVZFTlQgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL3Jvb20tbGlzdC9Sb29tTGlzdFN0b3JlXCI7XG5pbXBvcnQgeyBSb29tVmlld1N0b3JlIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9Sb29tVmlld1N0b3JlXCI7XG5pbXBvcnQge1xuICAgIGlzTWV0YVNwYWNlLFxuICAgIElTdWdnZXN0ZWRSb29tLFxuICAgIE1ldGFTcGFjZSxcbiAgICBTcGFjZUtleSxcbiAgICBVUERBVEVfU0VMRUNURURfU1BBQ0UsXG4gICAgVVBEQVRFX1NVR0dFU1RFRF9ST09NUyxcbn0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9zcGFjZXNcIjtcbmltcG9ydCBTcGFjZVN0b3JlIGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvc3BhY2VzL1NwYWNlU3RvcmVcIjtcbmltcG9ydCB7IGFycmF5RmFzdENsb25lLCBhcnJheUhhc0RpZmYgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvYXJyYXlzXCI7XG5pbXBvcnQgeyBvYmplY3RTaGFsbG93Q2xvbmUsIG9iamVjdFdpdGhPbmx5IH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL29iamVjdHNcIjtcbmltcG9ydCBSZXNpemVOb3RpZmllciBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvUmVzaXplTm90aWZpZXJcIjtcbmltcG9ydCB7IHNob3VsZFNob3dTcGFjZUludml0ZSwgc2hvd0FkZEV4aXN0aW5nUm9vbXMsIHNob3dDcmVhdGVOZXdSb29tLCBzaG93U3BhY2VJbnZpdGUgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvc3BhY2VcIjtcbmltcG9ydCB7IENoZXZyb25GYWNlLCBDb250ZXh0TWVudVRvb2x0aXBCdXR0b24sIHVzZUNvbnRleHRNZW51IH0gZnJvbSBcIi4uLy4uL3N0cnVjdHVyZXMvQ29udGV4dE1lbnVcIjtcbmltcG9ydCBSb29tQXZhdGFyIGZyb20gXCIuLi9hdmF0YXJzL1Jvb21BdmF0YXJcIjtcbmltcG9ydCB7IEJldGFQaWxsIH0gZnJvbSBcIi4uL2JldGEvQmV0YUNhcmRcIjtcbmltcG9ydCBJY29uaXplZENvbnRleHRNZW51LCB7XG4gICAgSWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbixcbiAgICBJY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdCxcbn0gZnJvbSBcIi4uL2NvbnRleHRfbWVudXMvSWNvbml6ZWRDb250ZXh0TWVudVwiO1xuaW1wb3J0IEFjY2Vzc2libGVUb29sdGlwQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblwiO1xuaW1wb3J0IEV4dHJhVGlsZSBmcm9tIFwiLi9FeHRyYVRpbGVcIjtcbmltcG9ydCBSb29tU3VibGlzdCwgeyBJQXV4QnV0dG9uUHJvcHMgfSBmcm9tIFwiLi9Sb29tU3VibGlzdFwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBvbktleURvd246IChldjogUmVhY3QuS2V5Ym9hcmRFdmVudCwgc3RhdGU6IElSb3ZpbmdUYWJJbmRleFN0YXRlKSA9PiB2b2lkO1xuICAgIG9uRm9jdXM6IChldjogUmVhY3QuRm9jdXNFdmVudCkgPT4gdm9pZDtcbiAgICBvbkJsdXI6IChldjogUmVhY3QuRm9jdXNFdmVudCkgPT4gdm9pZDtcbiAgICBvblJlc2l6ZTogKCkgPT4gdm9pZDtcbiAgICBvbkxpc3RDb2xsYXBzZT86IChpc0V4cGFuZGVkOiBib29sZWFuKSA9PiB2b2lkO1xuICAgIHJlc2l6ZU5vdGlmaWVyOiBSZXNpemVOb3RpZmllcjtcbiAgICBpc01pbmltaXplZDogYm9vbGVhbjtcbiAgICBhY3RpdmVTcGFjZTogU3BhY2VLZXk7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIHN1Ymxpc3RzOiBJVGFnTWFwO1xuICAgIGN1cnJlbnRSb29tSWQ/OiBzdHJpbmc7XG4gICAgc3VnZ2VzdGVkUm9vbXM6IElTdWdnZXN0ZWRSb29tW107XG4gICAgZmVhdHVyZV9mYXZvdXJpdGVfbWVzc2FnZXM6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjb25zdCBUQUdfT1JERVI6IFRhZ0lEW10gPSBbXG4gICAgRGVmYXVsdFRhZ0lELkludml0ZSxcbiAgICBEZWZhdWx0VGFnSUQuU2F2ZWRJdGVtcyxcbiAgICBEZWZhdWx0VGFnSUQuRmF2b3VyaXRlLFxuICAgIERlZmF1bHRUYWdJRC5ETSxcbiAgICBEZWZhdWx0VGFnSUQuVW50YWdnZWQsXG4gICAgRGVmYXVsdFRhZ0lELkxvd1ByaW9yaXR5LFxuICAgIERlZmF1bHRUYWdJRC5TZXJ2ZXJOb3RpY2UsXG4gICAgRGVmYXVsdFRhZ0lELlN1Z2dlc3RlZCxcbiAgICBEZWZhdWx0VGFnSUQuQXJjaGl2ZWQsXG5dO1xuY29uc3QgQUxXQVlTX1ZJU0lCTEVfVEFHUzogVGFnSURbXSA9IFtcbiAgICBEZWZhdWx0VGFnSUQuRE0sXG4gICAgRGVmYXVsdFRhZ0lELlVudGFnZ2VkLFxuXTtcblxuaW50ZXJmYWNlIElUYWdBZXN0aGV0aWNzIHtcbiAgICBzZWN0aW9uTGFiZWw6IHN0cmluZztcbiAgICBzZWN0aW9uTGFiZWxSYXc/OiBzdHJpbmc7XG4gICAgQXV4QnV0dG9uQ29tcG9uZW50PzogQ29tcG9uZW50VHlwZTxJQXV4QnV0dG9uUHJvcHM+O1xuICAgIGlzSW52aXRlOiBib29sZWFuO1xuICAgIGRlZmF1bHRIaWRkZW46IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBJVGFnQWVzdGhldGljc01hcCB7XG4gICAgLy8gQHRzLWlnbm9yZSAtIFRTIHdhbnRzIHRoaXMgdG8gYmUgYSBzdHJpbmcgYnV0IHdlIGtub3cgYmV0dGVyXG4gICAgW3RhZ0lkOiBUYWdJRF06IElUYWdBZXN0aGV0aWNzO1xufVxuXG5jb25zdCBhdXhCdXR0b25Db250ZXh0TWVudVBvc2l0aW9uID0gKGhhbmRsZTogUmVmT2JqZWN0PEhUTUxEaXZFbGVtZW50PikgPT4ge1xuICAgIGNvbnN0IHJlY3QgPSBoYW5kbGUuY3VycmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBjaGV2cm9uRmFjZTogQ2hldnJvbkZhY2UuTm9uZSxcbiAgICAgICAgbGVmdDogcmVjdC5sZWZ0IC0gNyxcbiAgICAgICAgdG9wOiByZWN0LnRvcCArIHJlY3QuaGVpZ2h0LFxuICAgIH07XG59O1xuXG5jb25zdCBEbUF1eEJ1dHRvbiA9ICh7IHRhYkluZGV4LCBkaXNwYXRjaGVyID0gZGVmYXVsdERpc3BhdGNoZXIgfTogSUF1eEJ1dHRvblByb3BzKSA9PiB7XG4gICAgY29uc3QgW21lbnVEaXNwbGF5ZWQsIGhhbmRsZSwgb3Blbk1lbnUsIGNsb3NlTWVudV0gPSB1c2VDb250ZXh0TWVudTxIVE1MRGl2RWxlbWVudD4oKTtcbiAgICBjb25zdCBhY3RpdmVTcGFjZTogUm9vbSA9IHVzZUV2ZW50RW1pdHRlclN0YXRlKFNwYWNlU3RvcmUuaW5zdGFuY2UsIFVQREFURV9TRUxFQ1RFRF9TUEFDRSwgKCkgPT4ge1xuICAgICAgICByZXR1cm4gU3BhY2VTdG9yZS5pbnN0YW5jZS5hY3RpdmVTcGFjZVJvb207XG4gICAgfSk7XG5cbiAgICBjb25zdCBzaG93Q3JlYXRlUm9vbXMgPSBzaG91bGRTaG93Q29tcG9uZW50KFVJQ29tcG9uZW50LkNyZWF0ZVJvb21zKTtcbiAgICBjb25zdCBzaG93SW52aXRlVXNlcnMgPSBzaG91bGRTaG93Q29tcG9uZW50KFVJQ29tcG9uZW50Lkludml0ZVVzZXJzKTtcblxuICAgIGlmIChhY3RpdmVTcGFjZSAmJiAoc2hvd0NyZWF0ZVJvb21zIHx8IHNob3dJbnZpdGVVc2VycykpIHtcbiAgICAgICAgbGV0IGNvbnRleHRNZW51OiBKU1guRWxlbWVudDtcbiAgICAgICAgaWYgKG1lbnVEaXNwbGF5ZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IGNhbkludml0ZSA9IHNob3VsZFNob3dTcGFjZUludml0ZShhY3RpdmVTcGFjZSk7XG5cbiAgICAgICAgICAgIGNvbnRleHRNZW51ID0gPEljb25pemVkQ29udGV4dE1lbnUgey4uLmF1eEJ1dHRvbkNvbnRleHRNZW51UG9zaXRpb24oaGFuZGxlKX0gb25GaW5pc2hlZD17Y2xvc2VNZW51fSBjb21wYWN0PlxuICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdCBmaXJzdD5cbiAgICAgICAgICAgICAgICAgICAgeyBzaG93Q3JlYXRlUm9vbXMgJiYgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIlN0YXJ0IG5ldyBjaGF0XCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1Jvb21MaXN0X2ljb25TdGFydENoYXRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZU1lbnUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci5kaXNwYXRjaCh7IGFjdGlvbjogXCJ2aWV3X2NyZWF0ZV9jaGF0XCIgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgUG9zdGhvZ1RyYWNrZXJzLnRyYWNrSW50ZXJhY3Rpb24oXCJXZWJSb29tTGlzdFJvb21zU3VibGlzdFBsdXNNZW51Q3JlYXRlQ2hhdEl0ZW1cIiwgZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAvPiB9XG4gICAgICAgICAgICAgICAgICAgIHsgc2hvd0ludml0ZVVzZXJzICYmIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJJbnZpdGUgdG8gc3BhY2VcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfUm9vbUxpc3RfaWNvbkludml0ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlTWVudSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dTcGFjZUludml0ZShhY3RpdmVTcGFjZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyFjYW5JbnZpdGV9XG4gICAgICAgICAgICAgICAgICAgICAgICB0b29sdGlwPXtjYW5JbnZpdGUgPyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IF90KFwiWW91IGRvIG5vdCBoYXZlIHBlcm1pc3Npb25zIHRvIGludml0ZSBwZW9wbGUgdG8gdGhpcyBzcGFjZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgLz4gfVxuICAgICAgICAgICAgICAgIDwvSWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3Q+XG4gICAgICAgICAgICA8L0ljb25pemVkQ29udGV4dE1lbnU+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDw+XG4gICAgICAgICAgICA8Q29udGV4dE1lbnVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICAgICAgdGFiSW5kZXg9e3RhYkluZGV4fVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29wZW5NZW51fVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21TdWJsaXN0X2F1eEJ1dHRvblwiXG4gICAgICAgICAgICAgICAgdG9vbHRpcENsYXNzTmFtZT1cIm14X1Jvb21TdWJsaXN0X2FkZFJvb21Ub29sdGlwXCJcbiAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtfdChcIkFkZCBwZW9wbGVcIil9XG4gICAgICAgICAgICAgICAgdGl0bGU9e190KFwiQWRkIHBlb3BsZVwiKX1cbiAgICAgICAgICAgICAgICBpc0V4cGFuZGVkPXttZW51RGlzcGxheWVkfVxuICAgICAgICAgICAgICAgIGlucHV0UmVmPXtoYW5kbGV9XG4gICAgICAgICAgICAvPlxuXG4gICAgICAgICAgICB7IGNvbnRleHRNZW51IH1cbiAgICAgICAgPC8+O1xuICAgIH0gZWxzZSBpZiAoIWFjdGl2ZVNwYWNlICYmIHNob3dDcmVhdGVSb29tcykge1xuICAgICAgICByZXR1cm4gPEFjY2Vzc2libGVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICB0YWJJbmRleD17dGFiSW5kZXh9XG4gICAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGRpc3BhdGNoZXIuZGlzcGF0Y2goeyBhY3Rpb246ICd2aWV3X2NyZWF0ZV9jaGF0JyB9KTtcbiAgICAgICAgICAgICAgICBQb3N0aG9nVHJhY2tlcnMudHJhY2tJbnRlcmFjdGlvbihcIldlYlJvb21MaXN0Um9vbXNTdWJsaXN0UGx1c01lbnVDcmVhdGVDaGF0SXRlbVwiLCBlKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tU3VibGlzdF9hdXhCdXR0b25cIlxuICAgICAgICAgICAgdG9vbHRpcENsYXNzTmFtZT1cIm14X1Jvb21TdWJsaXN0X2FkZFJvb21Ub29sdGlwXCJcbiAgICAgICAgICAgIGFyaWEtbGFiZWw9e190KFwiU3RhcnQgY2hhdFwiKX1cbiAgICAgICAgICAgIHRpdGxlPXtfdChcIlN0YXJ0IGNoYXRcIil9XG4gICAgICAgIC8+O1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xufTtcblxuY29uc3QgVW50YWdnZWRBdXhCdXR0b24gPSAoeyB0YWJJbmRleCB9OiBJQXV4QnV0dG9uUHJvcHMpID0+IHtcbiAgICBjb25zdCBbbWVudURpc3BsYXllZCwgaGFuZGxlLCBvcGVuTWVudSwgY2xvc2VNZW51XSA9IHVzZUNvbnRleHRNZW51PEhUTUxEaXZFbGVtZW50PigpO1xuICAgIGNvbnN0IGFjdGl2ZVNwYWNlID0gdXNlRXZlbnRFbWl0dGVyU3RhdGU8Um9vbT4oU3BhY2VTdG9yZS5pbnN0YW5jZSwgVVBEQVRFX1NFTEVDVEVEX1NQQUNFLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiBTcGFjZVN0b3JlLmluc3RhbmNlLmFjdGl2ZVNwYWNlUm9vbTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHNob3dDcmVhdGVSb29tID0gc2hvdWxkU2hvd0NvbXBvbmVudChVSUNvbXBvbmVudC5DcmVhdGVSb29tcyk7XG5cbiAgICBsZXQgY29udGV4dE1lbnVDb250ZW50OiBKU1guRWxlbWVudDtcbiAgICBpZiAobWVudURpc3BsYXllZCAmJiBhY3RpdmVTcGFjZSkge1xuICAgICAgICBjb25zdCBjYW5BZGRSb29tcyA9IGFjdGl2ZVNwYWNlLmN1cnJlbnRTdGF0ZS5tYXlTZW5kU3RhdGVFdmVudChFdmVudFR5cGUuU3BhY2VDaGlsZCxcbiAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVc2VySWQoKSk7XG5cbiAgICAgICAgY29udGV4dE1lbnVDb250ZW50ID0gPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0IGZpcnN0PlxuICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJFeHBsb3JlIHJvb21zXCIpfVxuICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Sb29tTGlzdF9pY29uRXhwbG9yZVwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17KGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICBjbG9zZU1lbnUoKTtcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZGlzcGF0Y2g8Vmlld1Jvb21QYXlsb2FkPih7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5WaWV3Um9vbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb21faWQ6IGFjdGl2ZVNwYWNlLnJvb21JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldHJpY3NUcmlnZ2VyOiB1bmRlZmluZWQsIC8vIG90aGVyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBQb3N0aG9nVHJhY2tlcnMudHJhY2tJbnRlcmFjdGlvbihcIldlYlJvb21MaXN0Um9vbXNTdWJsaXN0UGx1c01lbnVFeHBsb3JlUm9vbXNJdGVtXCIsIGUpO1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHNob3dDcmVhdGVSb29tXG4gICAgICAgICAgICAgICAgICAgID8gKDw+XG4gICAgICAgICAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIk5ldyByb29tXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Sb29tTGlzdF9pY29uTmV3Um9vbVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZU1lbnUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvd0NyZWF0ZU5ld1Jvb20oYWN0aXZlU3BhY2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBQb3N0aG9nVHJhY2tlcnMudHJhY2tJbnRlcmFjdGlvbihcIldlYlJvb21MaXN0Um9vbXNTdWJsaXN0UGx1c01lbnVDcmVhdGVSb29tSXRlbVwiLCBlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXshY2FuQWRkUm9vbXN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcD17Y2FuQWRkUm9vbXMgPyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBfdChcIllvdSBkbyBub3QgaGF2ZSBwZXJtaXNzaW9ucyB0byBjcmVhdGUgbmV3IHJvb21zIGluIHRoaXMgc3BhY2VcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV92aWRlb19yb29tc1wiKSAmJiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiTmV3IHZpZGVvIHJvb21cIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Sb29tTGlzdF9pY29uTmV3VmlkZW9Sb29tXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbG9zZU1lbnUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dDcmVhdGVOZXdSb29tKGFjdGl2ZVNwYWNlLCBSb29tVHlwZS5FbGVtZW50VmlkZW8pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IWNhbkFkZFJvb21zfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b29sdGlwPXtjYW5BZGRSb29tcyA/IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBfdChcIllvdSBkbyBub3QgaGF2ZSBwZXJtaXNzaW9ucyB0byBjcmVhdGUgbmV3IHJvb21zIGluIHRoaXMgc3BhY2VcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QmV0YVBpbGwgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0ljb25pemVkQ29udGV4dE1lbnVPcHRpb24+XG4gICAgICAgICAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDxJY29uaXplZENvbnRleHRNZW51T3B0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiQWRkIGV4aXN0aW5nIHJvb21cIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1Jvb21MaXN0X2ljb25BZGRFeGlzdGluZ1Jvb21cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VNZW51KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dBZGRFeGlzdGluZ1Jvb21zKGFjdGl2ZVNwYWNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXshY2FuQWRkUm9vbXN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcD17Y2FuQWRkUm9vbXMgPyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBfdChcIllvdSBkbyBub3QgaGF2ZSBwZXJtaXNzaW9ucyB0byBhZGQgcm9vbXMgdG8gdGhpcyBzcGFjZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvPilcbiAgICAgICAgICAgICAgICAgICAgOiBudWxsXG4gICAgICAgICAgICB9XG4gICAgICAgIDwvSWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3Q+O1xuICAgIH0gZWxzZSBpZiAobWVudURpc3BsYXllZCkge1xuICAgICAgICBjb250ZXh0TWVudUNvbnRlbnQgPSA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3QgZmlyc3Q+XG4gICAgICAgICAgICB7IHNob3dDcmVhdGVSb29tICYmIDw+XG4gICAgICAgICAgICAgICAgPEljb25pemVkQ29udGV4dE1lbnVPcHRpb25cbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiTmV3IHJvb21cIil9XG4gICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Sb29tTGlzdF9pY29uTmV3Um9vbVwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VNZW51KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci5kaXNwYXRjaCh7IGFjdGlvbjogXCJ2aWV3X2NyZWF0ZV9yb29tXCIgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBQb3N0aG9nVHJhY2tlcnMudHJhY2tJbnRlcmFjdGlvbihcIldlYlJvb21MaXN0Um9vbXNTdWJsaXN0UGx1c01lbnVDcmVhdGVSb29tSXRlbVwiLCBlKTtcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIHsgU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImZlYXR1cmVfdmlkZW9fcm9vbXNcIikgJiYgKFxuICAgICAgICAgICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiTmV3IHZpZGVvIHJvb21cIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lPVwibXhfUm9vbUxpc3RfaWNvbk5ld1ZpZGVvUm9vbVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsb3NlTWVudSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcInZpZXdfY3JlYXRlX3Jvb21cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogUm9vbVR5cGUuRWxlbWVudFZpZGVvLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEJldGFQaWxsIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvSWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbj5cbiAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgIDwvPiB9XG4gICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvblxuICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkV4cGxvcmUgcHVibGljIHJvb21zXCIpfVxuICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU9XCJteF9Sb29tTGlzdF9pY29uRXhwbG9yZVwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17KGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICBjbG9zZU1lbnUoKTtcbiAgICAgICAgICAgICAgICAgICAgUG9zdGhvZ1RyYWNrZXJzLnRyYWNrSW50ZXJhY3Rpb24oXCJXZWJSb29tTGlzdFJvb21zU3VibGlzdFBsdXNNZW51RXhwbG9yZVJvb21zSXRlbVwiLCBlKTtcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZmlyZShBY3Rpb24uVmlld1Jvb21EaXJlY3RvcnkpO1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICA8L0ljb25pemVkQ29udGV4dE1lbnVPcHRpb25MaXN0PjtcbiAgICB9XG5cbiAgICBsZXQgY29udGV4dE1lbnU6IEpTWC5FbGVtZW50O1xuICAgIGlmIChtZW51RGlzcGxheWVkKSB7XG4gICAgICAgIGNvbnRleHRNZW51ID0gPEljb25pemVkQ29udGV4dE1lbnUgey4uLmF1eEJ1dHRvbkNvbnRleHRNZW51UG9zaXRpb24oaGFuZGxlKX0gb25GaW5pc2hlZD17Y2xvc2VNZW51fSBjb21wYWN0PlxuICAgICAgICAgICAgeyBjb250ZXh0TWVudUNvbnRlbnQgfVxuICAgICAgICA8L0ljb25pemVkQ29udGV4dE1lbnU+O1xuICAgIH1cblxuICAgIHJldHVybiA8PlxuICAgICAgICA8Q29udGV4dE1lbnVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICB0YWJJbmRleD17dGFiSW5kZXh9XG4gICAgICAgICAgICBvbkNsaWNrPXtvcGVuTWVudX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21TdWJsaXN0X2F1eEJ1dHRvblwiXG4gICAgICAgICAgICB0b29sdGlwQ2xhc3NOYW1lPVwibXhfUm9vbVN1Ymxpc3RfYWRkUm9vbVRvb2x0aXBcIlxuICAgICAgICAgICAgYXJpYS1sYWJlbD17X3QoXCJBZGQgcm9vbVwiKX1cbiAgICAgICAgICAgIHRpdGxlPXtfdChcIkFkZCByb29tXCIpfVxuICAgICAgICAgICAgaXNFeHBhbmRlZD17bWVudURpc3BsYXllZH1cbiAgICAgICAgICAgIGlucHV0UmVmPXtoYW5kbGV9XG4gICAgICAgIC8+XG5cbiAgICAgICAgeyBjb250ZXh0TWVudSB9XG4gICAgPC8+O1xufTtcblxuY29uc3QgVEFHX0FFU1RIRVRJQ1M6IElUYWdBZXN0aGV0aWNzTWFwID0ge1xuICAgIFtEZWZhdWx0VGFnSUQuSW52aXRlXToge1xuICAgICAgICBzZWN0aW9uTGFiZWw6IF90ZChcIkludml0ZXNcIiksXG4gICAgICAgIGlzSW52aXRlOiB0cnVlLFxuICAgICAgICBkZWZhdWx0SGlkZGVuOiBmYWxzZSxcbiAgICB9LFxuICAgIFtEZWZhdWx0VGFnSUQuRmF2b3VyaXRlXToge1xuICAgICAgICBzZWN0aW9uTGFiZWw6IF90ZChcIkZhdm91cml0ZXNcIiksXG4gICAgICAgIGlzSW52aXRlOiBmYWxzZSxcbiAgICAgICAgZGVmYXVsdEhpZGRlbjogZmFsc2UsXG4gICAgfSxcbiAgICBbRGVmYXVsdFRhZ0lELlNhdmVkSXRlbXNdOiB7XG4gICAgICAgIHNlY3Rpb25MYWJlbDogX3RkKFwiU2F2ZWQgSXRlbXNcIiksXG4gICAgICAgIGlzSW52aXRlOiBmYWxzZSxcbiAgICAgICAgZGVmYXVsdEhpZGRlbjogZmFsc2UsXG4gICAgfSxcbiAgICBbRGVmYXVsdFRhZ0lELkRNXToge1xuICAgICAgICBzZWN0aW9uTGFiZWw6IF90ZChcIlBlb3BsZVwiKSxcbiAgICAgICAgaXNJbnZpdGU6IGZhbHNlLFxuICAgICAgICBkZWZhdWx0SGlkZGVuOiBmYWxzZSxcbiAgICAgICAgQXV4QnV0dG9uQ29tcG9uZW50OiBEbUF1eEJ1dHRvbixcbiAgICB9LFxuICAgIFtEZWZhdWx0VGFnSUQuVW50YWdnZWRdOiB7XG4gICAgICAgIHNlY3Rpb25MYWJlbDogX3RkKFwiUm9vbXNcIiksXG4gICAgICAgIGlzSW52aXRlOiBmYWxzZSxcbiAgICAgICAgZGVmYXVsdEhpZGRlbjogZmFsc2UsXG4gICAgICAgIEF1eEJ1dHRvbkNvbXBvbmVudDogVW50YWdnZWRBdXhCdXR0b24sXG4gICAgfSxcbiAgICBbRGVmYXVsdFRhZ0lELkxvd1ByaW9yaXR5XToge1xuICAgICAgICBzZWN0aW9uTGFiZWw6IF90ZChcIkxvdyBwcmlvcml0eVwiKSxcbiAgICAgICAgaXNJbnZpdGU6IGZhbHNlLFxuICAgICAgICBkZWZhdWx0SGlkZGVuOiBmYWxzZSxcbiAgICB9LFxuICAgIFtEZWZhdWx0VGFnSUQuU2VydmVyTm90aWNlXToge1xuICAgICAgICBzZWN0aW9uTGFiZWw6IF90ZChcIlN5c3RlbSBBbGVydHNcIiksXG4gICAgICAgIGlzSW52aXRlOiBmYWxzZSxcbiAgICAgICAgZGVmYXVsdEhpZGRlbjogZmFsc2UsXG4gICAgfSxcblxuICAgIC8vIFRPRE86IFJlcGxhY2Ugd2l0aCBhcmNoaXZlZCB2aWV3OiBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDAzOFxuICAgIFtEZWZhdWx0VGFnSUQuQXJjaGl2ZWRdOiB7XG4gICAgICAgIHNlY3Rpb25MYWJlbDogX3RkKFwiSGlzdG9yaWNhbFwiKSxcbiAgICAgICAgaXNJbnZpdGU6IGZhbHNlLFxuICAgICAgICBkZWZhdWx0SGlkZGVuOiB0cnVlLFxuICAgIH0sXG5cbiAgICBbRGVmYXVsdFRhZ0lELlN1Z2dlc3RlZF06IHtcbiAgICAgICAgc2VjdGlvbkxhYmVsOiBfdGQoXCJTdWdnZXN0ZWQgUm9vbXNcIiksXG4gICAgICAgIGlzSW52aXRlOiBmYWxzZSxcbiAgICAgICAgZGVmYXVsdEhpZGRlbjogZmFsc2UsXG4gICAgfSxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJvb21MaXN0IGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHByaXZhdGUgZGlzcGF0Y2hlclJlZjtcbiAgICBwcml2YXRlIHJvb21TdG9yZVRva2VuOiBmYkVtaXR0ZXIuRXZlbnRTdWJzY3JpcHRpb247XG4gICAgcHJpdmF0ZSB0cmVlUmVmID0gY3JlYXRlUmVmPEhUTUxEaXZFbGVtZW50PigpO1xuICAgIHByaXZhdGUgZmF2b3VyaXRlTWVzc2FnZVdhdGNoZXI6IHN0cmluZztcblxuICAgIHN0YXRpYyBjb250ZXh0VHlwZSA9IE1hdHJpeENsaWVudENvbnRleHQ7XG4gICAgcHVibGljIGNvbnRleHQhOiBSZWFjdC5Db250ZXh0VHlwZTx0eXBlb2YgTWF0cml4Q2xpZW50Q29udGV4dD47XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgc3VibGlzdHM6IHt9LFxuICAgICAgICAgICAgc3VnZ2VzdGVkUm9vbXM6IFNwYWNlU3RvcmUuaW5zdGFuY2Uuc3VnZ2VzdGVkUm9vbXMsXG4gICAgICAgICAgICBmZWF0dXJlX2Zhdm91cml0ZV9tZXNzYWdlczogU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImZlYXR1cmVfZmF2b3VyaXRlX21lc3NhZ2VzXCIpLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyUmVmID0gZGVmYXVsdERpc3BhdGNoZXIucmVnaXN0ZXIodGhpcy5vbkFjdGlvbik7XG4gICAgICAgIHRoaXMucm9vbVN0b3JlVG9rZW4gPSBSb29tVmlld1N0b3JlLmluc3RhbmNlLmFkZExpc3RlbmVyKHRoaXMub25Sb29tVmlld1N0b3JlVXBkYXRlKTtcbiAgICAgICAgU3BhY2VTdG9yZS5pbnN0YW5jZS5vbihVUERBVEVfU1VHR0VTVEVEX1JPT01TLCB0aGlzLnVwZGF0ZVN1Z2dlc3RlZFJvb21zKTtcbiAgICAgICAgUm9vbUxpc3RTdG9yZS5pbnN0YW5jZS5vbihMSVNUU19VUERBVEVfRVZFTlQsIHRoaXMudXBkYXRlTGlzdHMpO1xuICAgICAgICB0aGlzLmZhdm91cml0ZU1lc3NhZ2VXYXRjaGVyID1cbiAgICAgICAgICAgIFNldHRpbmdzU3RvcmUud2F0Y2hTZXR0aW5nKFwiZmVhdHVyZV9mYXZvdXJpdGVfbWVzc2FnZXNcIiwgbnVsbCwgKC4uLlssLCwgdmFsdWVdKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGZlYXR1cmVfZmF2b3VyaXRlX21lc3NhZ2VzOiB2YWx1ZSB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB0aGlzLnVwZGF0ZUxpc3RzKCk7IC8vIHRyaWdnZXIgdGhlIGZpcnN0IHVwZGF0ZVxuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgU3BhY2VTdG9yZS5pbnN0YW5jZS5vZmYoVVBEQVRFX1NVR0dFU1RFRF9ST09NUywgdGhpcy51cGRhdGVTdWdnZXN0ZWRSb29tcyk7XG4gICAgICAgIFJvb21MaXN0U3RvcmUuaW5zdGFuY2Uub2ZmKExJU1RTX1VQREFURV9FVkVOVCwgdGhpcy51cGRhdGVMaXN0cyk7XG4gICAgICAgIFNldHRpbmdzU3RvcmUudW53YXRjaFNldHRpbmcodGhpcy5mYXZvdXJpdGVNZXNzYWdlV2F0Y2hlcik7XG4gICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLnVucmVnaXN0ZXIodGhpcy5kaXNwYXRjaGVyUmVmKTtcbiAgICAgICAgaWYgKHRoaXMucm9vbVN0b3JlVG9rZW4pIHRoaXMucm9vbVN0b3JlVG9rZW4ucmVtb3ZlKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblJvb21WaWV3U3RvcmVVcGRhdGUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgY3VycmVudFJvb21JZDogUm9vbVZpZXdTdG9yZS5pbnN0YW5jZS5nZXRSb29tSWQoKSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25BY3Rpb24gPSAocGF5bG9hZDogQWN0aW9uUGF5bG9hZCkgPT4ge1xuICAgICAgICBpZiAocGF5bG9hZC5hY3Rpb24gPT09IEFjdGlvbi5WaWV3Um9vbURlbHRhKSB7XG4gICAgICAgICAgICBjb25zdCB2aWV3Um9vbURlbHRhUGF5bG9hZCA9IHBheWxvYWQgYXMgVmlld1Jvb21EZWx0YVBheWxvYWQ7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50Um9vbUlkID0gUm9vbVZpZXdTdG9yZS5pbnN0YW5jZS5nZXRSb29tSWQoKTtcbiAgICAgICAgICAgIGNvbnN0IHJvb20gPSB0aGlzLmdldFJvb21EZWx0YShjdXJyZW50Um9vbUlkLCB2aWV3Um9vbURlbHRhUGF5bG9hZC5kZWx0YSwgdmlld1Jvb21EZWx0YVBheWxvYWQudW5yZWFkKTtcbiAgICAgICAgICAgIGlmIChyb29tKSB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZGlzcGF0Y2g8Vmlld1Jvb21QYXlsb2FkPih7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlZpZXdSb29tLFxuICAgICAgICAgICAgICAgICAgICByb29tX2lkOiByb29tLnJvb21JZCxcbiAgICAgICAgICAgICAgICAgICAgc2hvd19yb29tX3RpbGU6IHRydWUsIC8vIHRvIG1ha2Ugc3VyZSB0aGUgcm9vbSBnZXRzIHNjcm9sbGVkIGludG8gdmlld1xuICAgICAgICAgICAgICAgICAgICBtZXRyaWNzVHJpZ2dlcjogXCJXZWJLZXlib2FyZFNob3J0Y3V0XCIsXG4gICAgICAgICAgICAgICAgICAgIG1ldHJpY3NWaWFLZXlib2FyZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChwYXlsb2FkLmFjdGlvbiA9PT0gQWN0aW9uLlBzdG5TdXBwb3J0VXBkYXRlZCkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVMaXN0cygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgZ2V0Um9vbURlbHRhID0gKHJvb21JZDogc3RyaW5nLCBkZWx0YTogbnVtYmVyLCB1bnJlYWQgPSBmYWxzZSkgPT4ge1xuICAgICAgICBjb25zdCBsaXN0cyA9IFJvb21MaXN0U3RvcmUuaW5zdGFuY2Uub3JkZXJlZExpc3RzO1xuICAgICAgICBjb25zdCByb29tczogUm9vbVtdID0gW107XG4gICAgICAgIFRBR19PUkRFUi5mb3JFYWNoKHQgPT4ge1xuICAgICAgICAgICAgbGV0IGxpc3RSb29tcyA9IGxpc3RzW3RdO1xuXG4gICAgICAgICAgICBpZiAodW5yZWFkKSB7XG4gICAgICAgICAgICAgICAgLy8gZmlsdGVyIHRvIG9ubHkgbm90aWZpY2F0aW9uIHJvb21zIChhbmQgb3VyIGN1cnJlbnQgYWN0aXZlIHJvb20gc28gd2UgY2FuIGluZGV4IHByb3Blcmx5KVxuICAgICAgICAgICAgICAgIGxpc3RSb29tcyA9IGxpc3RSb29tcy5maWx0ZXIociA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRlID0gUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUuaW5zdGFuY2UuZ2V0Um9vbVN0YXRlKHIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RhdGUucm9vbS5yb29tSWQgPT09IHJvb21JZCB8fCBzdGF0ZS5pc1VucmVhZDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcm9vbXMucHVzaCguLi5saXN0Um9vbXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBjdXJyZW50SW5kZXggPSByb29tcy5maW5kSW5kZXgociA9PiByLnJvb21JZCA9PT0gcm9vbUlkKTtcbiAgICAgICAgLy8gdXNlIHNsaWNlIHRvIGFjY291bnQgZm9yIGxvb3BpbmcgYXJvdW5kIHRoZSBzdGFydFxuICAgICAgICBjb25zdCBbcm9vbV0gPSByb29tcy5zbGljZSgoY3VycmVudEluZGV4ICsgZGVsdGEpICUgcm9vbXMubGVuZ3RoKTtcbiAgICAgICAgcmV0dXJuIHJvb207XG4gICAgfTtcblxuICAgIHByaXZhdGUgdXBkYXRlU3VnZ2VzdGVkUm9vbXMgPSAoc3VnZ2VzdGVkUm9vbXM6IElTdWdnZXN0ZWRSb29tW10pID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHN1Z2dlc3RlZFJvb21zIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHVwZGF0ZUxpc3RzID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBuZXdMaXN0cyA9IFJvb21MaXN0U3RvcmUuaW5zdGFuY2Uub3JkZXJlZExpc3RzO1xuICAgICAgICBjb25zdCBwcmV2aW91c0xpc3RJZHMgPSBPYmplY3Qua2V5cyh0aGlzLnN0YXRlLnN1Ymxpc3RzKTtcbiAgICAgICAgY29uc3QgbmV3TGlzdElkcyA9IE9iamVjdC5rZXlzKG5ld0xpc3RzKTtcblxuICAgICAgICBsZXQgZG9VcGRhdGUgPSBhcnJheUhhc0RpZmYocHJldmlvdXNMaXN0SWRzLCBuZXdMaXN0SWRzKTtcbiAgICAgICAgaWYgKCFkb1VwZGF0ZSkge1xuICAgICAgICAgICAgLy8gc28gd2UgZGlkbid0IGhhdmUgdGhlIHZpc2libGUgc3VibGlzdHMgY2hhbmdlLCBidXQgZGlkIHRoZSBjb250ZW50cyBvZiB0aG9zZVxuICAgICAgICAgICAgLy8gc3VibGlzdHMgY2hhbmdlIHNpZ25pZmljYW50bHkgZW5vdWdoIHRvIGJyZWFrIHRoZSBzdGlja3kgaGVhZGVycz8gUHJvYmFibHksIHNvXG4gICAgICAgICAgICAvLyBsZXQncyBjaGVjayB0aGUgbGVuZ3RoIG9mIGVhY2guXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHRhZ0lkIG9mIG5ld0xpc3RJZHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvbGRSb29tcyA9IHRoaXMuc3RhdGUuc3VibGlzdHNbdGFnSWRdO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1Jvb21zID0gbmV3TGlzdHNbdGFnSWRdO1xuICAgICAgICAgICAgICAgIGlmIChvbGRSb29tcy5sZW5ndGggIT09IG5ld1Jvb21zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBkb1VwZGF0ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkb1VwZGF0ZSkge1xuICAgICAgICAgICAgLy8gV2UgaGF2ZSB0byBicmVhayBvdXIgcmVmZXJlbmNlIHRvIHRoZSByb29tIGxpc3Qgc3RvcmUgaWYgd2Ugd2FudCB0byBiZSBhYmxlIHRvXG4gICAgICAgICAgICAvLyBkaWZmIHRoZSBvYmplY3QgZm9yIGNoYW5nZXMsIHNvIGRvIHRoYXQuXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlIC0gSVRhZ01hcCBpcyB0cy1pZ25vcmVkIHNvIHRoaXMgd2lsbCBoYXZlIHRvIGJlIHRvb1xuICAgICAgICAgICAgY29uc3QgbmV3U3VibGlzdHMgPSBvYmplY3RXaXRoT25seShuZXdMaXN0cywgbmV3TGlzdElkcyk7XG4gICAgICAgICAgICBjb25zdCBzdWJsaXN0cyA9IG9iamVjdFNoYWxsb3dDbG9uZShuZXdTdWJsaXN0cywgKGssIHYpID0+IGFycmF5RmFzdENsb25lKHYpKTtcblxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHN1Ymxpc3RzIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uUmVzaXplKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIHJlbmRlclN1Z2dlc3RlZFJvb21zKCk6IFJlYWN0Q29tcG9uZW50RWxlbWVudDx0eXBlb2YgRXh0cmFUaWxlPltdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuc3VnZ2VzdGVkUm9vbXMubWFwKHJvb20gPT4ge1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IHJvb20ubmFtZSB8fCByb29tLmNhbm9uaWNhbF9hbGlhcyB8fCByb29tLmFsaWFzZXM/LlswXSB8fCBfdChcIkVtcHR5IHJvb21cIik7XG4gICAgICAgICAgICBjb25zdCBhdmF0YXIgPSAoXG4gICAgICAgICAgICAgICAgPFJvb21BdmF0YXJcbiAgICAgICAgICAgICAgICAgICAgb29iRGF0YT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2YXRhclVybDogcm9vbS5hdmF0YXJfdXJsLFxuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICB3aWR0aD17MzJ9XG4gICAgICAgICAgICAgICAgICAgIGhlaWdodD17MzJ9XG4gICAgICAgICAgICAgICAgICAgIHJlc2l6ZU1ldGhvZD1cImNyb3BcIlxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc3Qgdmlld1Jvb20gPSAoZXYpID0+IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci5kaXNwYXRjaDxWaWV3Um9vbVBheWxvYWQ+KHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1Jvb20sXG4gICAgICAgICAgICAgICAgICAgIHJvb21fYWxpYXM6IHJvb20uY2Fub25pY2FsX2FsaWFzIHx8IHJvb20uYWxpYXNlcz8uWzBdLFxuICAgICAgICAgICAgICAgICAgICByb29tX2lkOiByb29tLnJvb21faWQsXG4gICAgICAgICAgICAgICAgICAgIHZpYV9zZXJ2ZXJzOiByb29tLnZpYVNlcnZlcnMsXG4gICAgICAgICAgICAgICAgICAgIG9vYl9kYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhdmF0YXJVcmw6IHJvb20uYXZhdGFyX3VybCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG1ldHJpY3NUcmlnZ2VyOiBcIlJvb21MaXN0XCIsXG4gICAgICAgICAgICAgICAgICAgIG1ldHJpY3NWaWFLZXlib2FyZDogZXYudHlwZSAhPT0gXCJjbGlja1wiLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPEV4dHJhVGlsZVxuICAgICAgICAgICAgICAgICAgICBpc01pbmltaXplZD17dGhpcy5wcm9wcy5pc01pbmltaXplZH1cbiAgICAgICAgICAgICAgICAgICAgaXNTZWxlY3RlZD17dGhpcy5zdGF0ZS5jdXJyZW50Um9vbUlkID09PSByb29tLnJvb21faWR9XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXlOYW1lPXtuYW1lfVxuICAgICAgICAgICAgICAgICAgICBhdmF0YXI9e2F2YXRhcn1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dmlld1Jvb219XG4gICAgICAgICAgICAgICAgICAgIGtleT17YHN1Z2dlc3RlZFJvb21UaWxlXyR7cm9vbS5yb29tX2lkfWB9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwcml2YXRlIHJlbmRlckZhdm9yaXRlTWVzc2FnZXNMaXN0KCk6IFJlYWN0Q29tcG9uZW50RWxlbWVudDx0eXBlb2YgRXh0cmFUaWxlPltdIHtcbiAgICAgICAgY29uc3QgYXZhdGFyID0gKFxuICAgICAgICAgICAgPFJvb21BdmF0YXJcbiAgICAgICAgICAgICAgICBvb2JEYXRhPXt7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IFwiRmF2b3VyaXRlc1wiLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgd2lkdGg9ezMyfVxuICAgICAgICAgICAgICAgIGhlaWdodD17MzJ9XG4gICAgICAgICAgICAgICAgcmVzaXplTWV0aG9kPVwiY3JvcFwiXG4gICAgICAgICAgICAvPik7XG5cbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIDxFeHRyYVRpbGVcbiAgICAgICAgICAgICAgICBpc01pbmltaXplZD17dGhpcy5wcm9wcy5pc01pbmltaXplZH1cbiAgICAgICAgICAgICAgICBpc1NlbGVjdGVkPXtmYWxzZX1cbiAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZT1cIkZhdm91cml0ZSBNZXNzYWdlc1wiXG4gICAgICAgICAgICAgICAgYXZhdGFyPXthdmF0YXJ9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gXCJcIn1cbiAgICAgICAgICAgICAgICBrZXk9XCJmYXZNZXNzYWdlc1RpbGVfa2V5XCJcbiAgICAgICAgICAgIC8+LFxuICAgICAgICBdO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyU3VibGlzdHMoKTogUmVhY3QuUmVhY3RFbGVtZW50W10ge1xuICAgICAgICAvLyBzaG93IGEgc2tlbGV0b24gVUkgaWYgdGhlIHVzZXIgaXMgaW4gbm8gcm9vbXMgYW5kIHRoZXkgYXJlIG5vdCBmaWx0ZXJpbmcgYW5kIGhhdmUgbm8gc3VnZ2VzdGVkIHJvb21zXG4gICAgICAgIGNvbnN0IHNob3dTa2VsZXRvbiA9ICF0aGlzLnN0YXRlLnN1Z2dlc3RlZFJvb21zPy5sZW5ndGggJiZcbiAgICAgICAgICAgIE9iamVjdC52YWx1ZXMoUm9vbUxpc3RTdG9yZS5pbnN0YW5jZS5vcmRlcmVkTGlzdHMpLmV2ZXJ5KGxpc3QgPT4gIWxpc3Q/Lmxlbmd0aCk7XG5cbiAgICAgICAgcmV0dXJuIFRBR19PUkRFUlxuICAgICAgICAgICAgLm1hcChvcmRlcmVkVGFnSWQgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBleHRyYVRpbGVzID0gbnVsbDtcbiAgICAgICAgICAgICAgICBpZiAob3JkZXJlZFRhZ0lkID09PSBEZWZhdWx0VGFnSUQuU3VnZ2VzdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4dHJhVGlsZXMgPSB0aGlzLnJlbmRlclN1Z2dlc3RlZFJvb21zKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnN0YXRlLmZlYXR1cmVfZmF2b3VyaXRlX21lc3NhZ2VzICYmIG9yZGVyZWRUYWdJZCA9PT0gRGVmYXVsdFRhZ0lELlNhdmVkSXRlbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgZXh0cmFUaWxlcyA9IHRoaXMucmVuZGVyRmF2b3JpdGVNZXNzYWdlc0xpc3QoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBhZXN0aGV0aWNzID0gVEFHX0FFU1RIRVRJQ1Nbb3JkZXJlZFRhZ0lkXTtcbiAgICAgICAgICAgICAgICBpZiAoIWFlc3RoZXRpY3MpIHRocm93IG5ldyBFcnJvcihgVGFnICR7b3JkZXJlZFRhZ0lkfSBkb2VzIG5vdCBoYXZlIGFlc3RoZXRpY3NgKTtcblxuICAgICAgICAgICAgICAgIGxldCBhbHdheXNWaXNpYmxlID0gQUxXQVlTX1ZJU0lCTEVfVEFHUy5pbmNsdWRlcyhvcmRlcmVkVGFnSWQpO1xuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgKHRoaXMucHJvcHMuYWN0aXZlU3BhY2UgPT09IE1ldGFTcGFjZS5GYXZvdXJpdGVzICYmIG9yZGVyZWRUYWdJZCAhPT0gRGVmYXVsdFRhZ0lELkZhdm91cml0ZSkgfHxcbiAgICAgICAgICAgICAgICAgICAgKHRoaXMucHJvcHMuYWN0aXZlU3BhY2UgPT09IE1ldGFTcGFjZS5QZW9wbGUgJiYgb3JkZXJlZFRhZ0lkICE9PSBEZWZhdWx0VGFnSUQuRE0pIHx8XG4gICAgICAgICAgICAgICAgICAgICh0aGlzLnByb3BzLmFjdGl2ZVNwYWNlID09PSBNZXRhU3BhY2UuT3JwaGFucyAmJiBvcmRlcmVkVGFnSWQgPT09IERlZmF1bHRUYWdJRC5ETSkgfHxcbiAgICAgICAgICAgICAgICAgICAgKFxuICAgICAgICAgICAgICAgICAgICAgICAgIWlzTWV0YVNwYWNlKHRoaXMucHJvcHMuYWN0aXZlU3BhY2UpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBvcmRlcmVkVGFnSWQgPT09IERlZmF1bHRUYWdJRC5ETSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJTcGFjZXMuc2hvd1Blb3BsZUluU3BhY2VcIiwgdGhpcy5wcm9wcy5hY3RpdmVTcGFjZSlcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBhbHdheXNWaXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IGZvcmNlRXhwYW5kZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgICh0aGlzLnByb3BzLmFjdGl2ZVNwYWNlID09PSBNZXRhU3BhY2UuRmF2b3VyaXRlcyAmJiBvcmRlcmVkVGFnSWQgPT09IERlZmF1bHRUYWdJRC5GYXZvdXJpdGUpIHx8XG4gICAgICAgICAgICAgICAgICAgICh0aGlzLnByb3BzLmFjdGl2ZVNwYWNlID09PSBNZXRhU3BhY2UuUGVvcGxlICYmIG9yZGVyZWRUYWdJZCA9PT0gRGVmYXVsdFRhZ0lELkRNKVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBmb3JjZUV4cGFuZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gVGhlIGNvc3Qgb2YgbW91bnRpbmcvdW5tb3VudGluZyB0aGlzIGNvbXBvbmVudCBvZmZzZXRzIHRoZSBjb3N0XG4gICAgICAgICAgICAgICAgLy8gb2Yga2VlcGluZyBpdCBpbiB0aGUgRE9NIGFuZCBoaWRpbmcgaXQgd2hlbiBpdCBpcyBub3QgcmVxdWlyZWRcbiAgICAgICAgICAgICAgICByZXR1cm4gPFJvb21TdWJsaXN0XG4gICAgICAgICAgICAgICAgICAgIGtleT17YHN1Ymxpc3QtJHtvcmRlcmVkVGFnSWR9YH1cbiAgICAgICAgICAgICAgICAgICAgdGFnSWQ9e29yZGVyZWRUYWdJZH1cbiAgICAgICAgICAgICAgICAgICAgZm9yUm9vbXM9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0QXNIaWRkZW49e2Flc3RoZXRpY3MuZGVmYXVsdEhpZGRlbn1cbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9e2Flc3RoZXRpY3Muc2VjdGlvbkxhYmVsUmF3ID8gYWVzdGhldGljcy5zZWN0aW9uTGFiZWxSYXcgOiBfdChhZXN0aGV0aWNzLnNlY3Rpb25MYWJlbCl9XG4gICAgICAgICAgICAgICAgICAgIEF1eEJ1dHRvbkNvbXBvbmVudD17YWVzdGhldGljcy5BdXhCdXR0b25Db21wb25lbnR9XG4gICAgICAgICAgICAgICAgICAgIGlzTWluaW1pemVkPXt0aGlzLnByb3BzLmlzTWluaW1pemVkfVxuICAgICAgICAgICAgICAgICAgICBzaG93U2tlbGV0b249e3Nob3dTa2VsZXRvbn1cbiAgICAgICAgICAgICAgICAgICAgZXh0cmFUaWxlcz17ZXh0cmFUaWxlc31cbiAgICAgICAgICAgICAgICAgICAgcmVzaXplTm90aWZpZXI9e3RoaXMucHJvcHMucmVzaXplTm90aWZpZXJ9XG4gICAgICAgICAgICAgICAgICAgIGFsd2F5c1Zpc2libGU9e2Fsd2F5c1Zpc2libGV9XG4gICAgICAgICAgICAgICAgICAgIG9uTGlzdENvbGxhcHNlPXt0aGlzLnByb3BzLm9uTGlzdENvbGxhcHNlfVxuICAgICAgICAgICAgICAgICAgICBmb3JjZUV4cGFuZGVkPXtmb3JjZUV4cGFuZGVkfVxuICAgICAgICAgICAgICAgIC8+O1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGZvY3VzKCk6IHZvaWQge1xuICAgICAgICAvLyBmb2N1cyB0aGUgZmlyc3QgZm9jdXNhYmxlIGVsZW1lbnQgaW4gdGhpcyBhcmlhIHRyZWV2aWV3IHdpZGdldFxuICAgICAgICBjb25zdCB0cmVlSXRlbXMgPSB0aGlzLnRyZWVSZWYuY3VycmVudD8ucXVlcnlTZWxlY3RvckFsbDxIVE1MRWxlbWVudD4oJ1tyb2xlPVwidHJlZWl0ZW1cIl0nKTtcbiAgICAgICAgaWYgKCF0cmVlSXRlbXMpIHJldHVybjtcbiAgICAgICAgWy4uLnRyZWVJdGVtc10uZmluZChlID0+IGUub2Zmc2V0UGFyZW50ICE9PSBudWxsKT8uZm9jdXMoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBzdWJsaXN0cyA9IHRoaXMucmVuZGVyU3VibGlzdHMoKTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxSb3ZpbmdUYWJJbmRleFByb3ZpZGVyIGhhbmRsZUhvbWVFbmQgaGFuZGxlVXBEb3duIG9uS2V5RG93bj17dGhpcy5wcm9wcy5vbktleURvd259PlxuICAgICAgICAgICAgICAgIHsgKHsgb25LZXlEb3duSGFuZGxlciB9KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRm9jdXM9e3RoaXMucHJvcHMub25Gb2N1c31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQmx1cj17dGhpcy5wcm9wcy5vbkJsdXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbktleURvd249e29uS2V5RG93bkhhbmRsZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tTGlzdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlPVwidHJlZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtfdChcIlJvb21zXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLnRyZWVSZWZ9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3VibGlzdHMgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApIH1cbiAgICAgICAgICAgIDwvUm92aW5nVGFiSW5kZXhQcm92aWRlcj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFpQkE7O0FBRUE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBSUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBUUE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBSUE7O0FBQ0E7O0FBQ0E7Ozs7OztBQTlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFvRU8sTUFBTUEsU0FBa0IsR0FBRyxDQUM5QkMsb0JBQUEsQ0FBYUMsTUFEaUIsRUFFOUJELG9CQUFBLENBQWFFLFVBRmlCLEVBRzlCRixvQkFBQSxDQUFhRyxTQUhpQixFQUk5Qkgsb0JBQUEsQ0FBYUksRUFKaUIsRUFLOUJKLG9CQUFBLENBQWFLLFFBTGlCLEVBTTlCTCxvQkFBQSxDQUFhTSxXQU5pQixFQU85Qk4sb0JBQUEsQ0FBYU8sWUFQaUIsRUFROUJQLG9CQUFBLENBQWFRLFNBUmlCLEVBUzlCUixvQkFBQSxDQUFhUyxRQVRpQixDQUEzQjs7QUFXUCxNQUFNQyxtQkFBNEIsR0FBRyxDQUNqQ1Ysb0JBQUEsQ0FBYUksRUFEb0IsRUFFakNKLG9CQUFBLENBQWFLLFFBRm9CLENBQXJDOztBQWtCQSxNQUFNTSw0QkFBNEIsR0FBSUMsTUFBRCxJQUF1QztFQUN4RSxNQUFNQyxJQUFJLEdBQUdELE1BQU0sQ0FBQ0UsT0FBUCxDQUFlQyxxQkFBZixFQUFiO0VBQ0EsT0FBTztJQUNIQyxXQUFXLEVBQUVDLHdCQUFB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