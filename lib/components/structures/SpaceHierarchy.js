"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useRoomHierarchy = exports.showRoom = exports.joinRoom = exports.default = exports.HierarchyLevel = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _room = require("matrix-js-sdk/src/models/room");

var _roomHierarchy = require("matrix-js-sdk/src/room-hierarchy");

var _event = require("matrix-js-sdk/src/@types/event");

var _classnames = _interopRequireDefault(require("classnames"));

var _lodash = require("lodash");

var _partials = require("matrix-js-sdk/src/@types/partials");

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _languageHandler = require("../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("../views/elements/AccessibleButton"));

var _Spinner = _interopRequireDefault(require("../views/elements/Spinner"));

var _SearchBox = _interopRequireDefault(require("./SearchBox"));

var _RoomAvatar = _interopRequireDefault(require("../views/avatars/RoomAvatar"));

var _StyledCheckbox = _interopRequireDefault(require("../views/elements/StyledCheckbox"));

var _BaseAvatar = _interopRequireDefault(require("../views/avatars/BaseAvatar"));

var _Media = require("../../customisations/Media");

var _InfoTooltip = _interopRequireDefault(require("../views/elements/InfoTooltip"));

var _TextWithTooltip = _interopRequireDefault(require("../views/elements/TextWithTooltip"));

var _useStateToggle = require("../../hooks/useStateToggle");

var _SpaceStore = require("../../stores/spaces/SpaceStore");

var _AccessibleTooltipButton = _interopRequireDefault(require("../views/elements/AccessibleTooltipButton"));

var _HtmlUtils = require("../../HtmlUtils");

var _useDispatcher = require("../../hooks/useDispatcher");

var _actions = require("../../dispatcher/actions");

var _RovingTabIndex = require("../../accessibility/RovingTabIndex");

var _RoomDirectory = require("./RoomDirectory");

var _MatrixClientContext = _interopRequireDefault(require("../../contexts/MatrixClientContext"));

var _useEventEmitter = require("../../hooks/useEventEmitter");

var _RoomUpgrade = require("../../utils/RoomUpgrade");

var _RoomViewStore = require("../../stores/RoomViewStore");

var _KeyboardShortcuts = require("../../accessibility/KeyboardShortcuts");

var _KeyBindingsManager = require("../../KeyBindingsManager");

var _Tooltip = require("../views/elements/Tooltip");

var _useTopic = require("../../hooks/room/useTopic");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

const Tile = _ref => {
  let {
    room,
    suggested,
    selected,
    hasPermissions,
    onToggleClick,
    onViewRoomClick,
    onJoinRoomClick,
    numChildRooms,
    children
  } = _ref;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const [joinedRoom, setJoinedRoom] = (0, _react.useState)(() => {
    const cliRoom = cli.getRoom(room.room_id);
    return cliRoom?.getMyMembership() === "join" ? cliRoom : null;
  });
  const joinedRoomName = (0, _useEventEmitter.useTypedEventEmitterState)(joinedRoom, _room.RoomEvent.Name, room => room?.name);
  const name = joinedRoomName || room.name || room.canonical_alias || room.aliases?.[0] || (room.room_type === _event.RoomType.Space ? (0, _languageHandler._t)("Unnamed Space") : (0, _languageHandler._t)("Unnamed Room"));
  const [showChildren, toggleShowChildren] = (0, _useStateToggle.useStateToggle)(true);
  const [onFocus, isActive, ref] = (0, _RovingTabIndex.useRovingTabIndex)();
  const [busy, setBusy] = (0, _react.useState)(false);

  const onPreviewClick = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    onViewRoomClick();
  };

  const onJoinClick = async ev => {
    setBusy(true);
    ev.preventDefault();
    ev.stopPropagation();
    onJoinRoomClick().then(() => (0, _RoomUpgrade.awaitRoomDownSync)(cli, room.room_id)).then(setJoinedRoom).finally(() => {
      setBusy(false);
    });
  };

  let button;

  if (busy) {
    button = /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
      disabled: true,
      onClick: onJoinClick,
      kind: "primary_outline",
      onFocus: onFocus,
      tabIndex: isActive ? 0 : -1,
      title: (0, _languageHandler._t)("Joining")
    }, /*#__PURE__*/_react.default.createElement(_Spinner.default, {
      w: 24,
      h: 24
    }));
  } else if (joinedRoom) {
    button = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: onPreviewClick,
      kind: "primary_outline",
      onFocus: onFocus,
      tabIndex: isActive ? 0 : -1
    }, (0, _languageHandler._t)("View"));
  } else {
    button = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: onJoinClick,
      kind: "primary",
      onFocus: onFocus,
      tabIndex: isActive ? 0 : -1
    }, (0, _languageHandler._t)("Join"));
  }

  let checkbox;

  if (onToggleClick) {
    if (hasPermissions) {
      checkbox = /*#__PURE__*/_react.default.createElement(_StyledCheckbox.default, {
        checked: !!selected,
        onChange: onToggleClick,
        tabIndex: isActive ? 0 : -1
      });
    } else {
      checkbox = /*#__PURE__*/_react.default.createElement(_TextWithTooltip.default, {
        tooltip: (0, _languageHandler._t)("You don't have permission"),
        onClick: ev => {
          ev.stopPropagation();
        }
      }, /*#__PURE__*/_react.default.createElement(_StyledCheckbox.default, {
        disabled: true,
        tabIndex: isActive ? 0 : -1
      }));
    }
  }

  let avatar;

  if (joinedRoom) {
    avatar = /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
      room: joinedRoom,
      width: 20,
      height: 20
    });
  } else {
    avatar = /*#__PURE__*/_react.default.createElement(_BaseAvatar.default, {
      name: name,
      idName: room.room_id,
      url: room.avatar_url ? (0, _Media.mediaFromMxc)(room.avatar_url).getSquareThumbnailHttp(20) : null,
      width: 20,
      height: 20
    });
  }

  let description = (0, _languageHandler._t)("%(count)s members", {
    count: room.num_joined_members
  });

  if (numChildRooms !== undefined) {
    description += " · " + (0, _languageHandler._t)("%(count)s rooms", {
      count: numChildRooms
    });
  }

  let topic;

  if (joinedRoom) {
    const topicObj = (0, _useTopic.getTopic)(joinedRoom);
    topic = (0, _HtmlUtils.topicToHtml)(topicObj?.text, topicObj?.html);
  } else {
    topic = room.topic;
  }

  let joinedSection;

  if (joinedRoom) {
    joinedSection = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SpaceHierarchy_roomTile_joined"
    }, (0, _languageHandler._t)("Joined"));
  }

  let suggestedSection;

  if (suggested && (!joinedRoom || hasPermissions)) {
    suggestedSection = /*#__PURE__*/_react.default.createElement(_InfoTooltip.default, {
      tooltip: (0, _languageHandler._t)("This room is suggested as a good one to join")
    }, (0, _languageHandler._t)("Suggested"));
  }

  const content = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceHierarchy_roomTile_item"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceHierarchy_roomTile_avatar"
  }, avatar), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceHierarchy_roomTile_name"
  }, name, joinedSection, suggestedSection), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceHierarchy_roomTile_info",
    ref: e => e && (0, _HtmlUtils.linkifyElement)(e),
    onClick: ev => {
      // prevent clicks on links from bubbling up to the room tile
      if (ev.target.tagName === "A") {
        ev.stopPropagation();
      }
    }
  }, description, topic && " · ", topic)), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceHierarchy_actions"
  }, button, checkbox));

  let childToggle;
  let childSection;
  let onKeyDown;

  if (children) {
    // the chevron is purposefully a div rather than a button as it should be ignored for a11y
    childToggle = /*#__PURE__*/_react.default.createElement("div", {
      className: (0, _classnames.default)("mx_SpaceHierarchy_subspace_toggle", {
        mx_SpaceHierarchy_subspace_toggle_shown: showChildren
      }),
      onClick: ev => {
        ev.stopPropagation();
        toggleShowChildren();
      }
    });

    if (showChildren) {
      const onChildrenKeyDown = e => {
        const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getAccessibilityAction(e);

        switch (action) {
          case _KeyboardShortcuts.KeyBindingAction.ArrowLeft:
            e.preventDefault();
            e.stopPropagation();
            ref.current?.focus();
            break;
        }
      };

      childSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpaceHierarchy_subspace_children",
        onKeyDown: onChildrenKeyDown,
        role: "group"
      }, children);
    }

    onKeyDown = e => {
      let handled = false;
      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getAccessibilityAction(e);

      switch (action) {
        case _KeyboardShortcuts.KeyBindingAction.ArrowLeft:
          if (showChildren) {
            handled = true;
            toggleShowChildren();
          }

          break;

        case _KeyboardShortcuts.KeyBindingAction.ArrowRight:
          handled = true;

          if (showChildren) {
            const childSection = ref.current?.nextElementSibling;
            childSection?.querySelector(".mx_SpaceHierarchy_roomTile")?.focus();
          } else {
            toggleShowChildren();
          }

          break;
      }

      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
  }

  return /*#__PURE__*/_react.default.createElement("li", {
    className: "mx_SpaceHierarchy_roomTileWrapper",
    role: "treeitem",
    "aria-expanded": children ? showChildren : undefined
  }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    className: (0, _classnames.default)("mx_SpaceHierarchy_roomTile", {
      mx_SpaceHierarchy_subspace: room.room_type === _event.RoomType.Space,
      mx_SpaceHierarchy_joining: busy
    }),
    onClick: hasPermissions && onToggleClick ? onToggleClick : onPreviewClick,
    onKeyDown: onKeyDown,
    inputRef: ref,
    onFocus: onFocus,
    tabIndex: isActive ? 0 : -1
  }, content, childToggle), childSection);
};

const showRoom = (cli, hierarchy, roomId, roomType) => {
  const room = hierarchy.roomMap.get(roomId); // Don't let the user view a room they won't be able to either peek or join:
  // fail earlier so they don't have to click back to the directory.

  if (cli.isGuest()) {
    if (!room.world_readable && !room.guest_can_join) {
      _dispatcher.default.dispatch({
        action: "require_registration"
      });

      return;
    }
  }

  const roomAlias = (0, _RoomDirectory.getDisplayAliasForRoom)(room) || undefined;

  _dispatcher.default.dispatch({
    action: _actions.Action.ViewRoom,
    should_peek: true,
    room_alias: roomAlias,
    room_id: room.room_id,
    via_servers: Array.from(hierarchy.viaMap.get(roomId) || []),
    oob_data: {
      avatarUrl: room.avatar_url,
      // XXX: This logic is duplicated from the JS SDK which would normally decide what the name is.
      name: room.name || roomAlias || (0, _languageHandler._t)("Unnamed room"),
      roomType
    },
    metricsTrigger: "RoomDirectory"
  });
};

exports.showRoom = showRoom;

const joinRoom = (cli, hierarchy, roomId) => {
  // Don't let the user view a room they won't be able to either peek or join:
  // fail earlier so they don't have to click back to the directory.
  if (cli.isGuest()) {
    _dispatcher.default.dispatch({
      action: "require_registration"
    });

    return;
  }

  const prom = cli.joinRoom(roomId, {
    viaServers: Array.from(hierarchy.viaMap.get(roomId) || [])
  });
  prom.then(() => {
    _dispatcher.default.dispatch({
      action: _actions.Action.JoinRoomReady,
      roomId,
      metricsTrigger: "SpaceHierarchy"
    });
  }, err => {
    _RoomViewStore.RoomViewStore.instance.showJoinRoomError(err, roomId);
  });
  return prom;
};

exports.joinRoom = joinRoom;

const toLocalRoom = (cli, room) => {
  const history = cli.getRoomUpgradeHistory(room.room_id, true);
  const cliRoom = history[history.length - 1];

  if (cliRoom) {
    return _objectSpread(_objectSpread({}, room), {}, {
      room_id: cliRoom.roomId,
      room_type: cliRoom.getType(),
      name: cliRoom.name,
      topic: cliRoom.currentState.getStateEvents(_event.EventType.RoomTopic, "")?.getContent().topic,
      avatar_url: cliRoom.getMxcAvatarUrl(),
      canonical_alias: cliRoom.getCanonicalAlias(),
      aliases: cliRoom.getAltAliases(),
      world_readable: cliRoom.currentState.getStateEvents(_event.EventType.RoomHistoryVisibility, "")?.getContent().history_visibility === _partials.HistoryVisibility.WorldReadable,
      guest_can_join: cliRoom.currentState.getStateEvents(_event.EventType.RoomGuestAccess, "")?.getContent().guest_access === _partials.GuestAccess.CanJoin,
      num_joined_members: cliRoom.getJoinedMemberCount()
    });
  }

  return room;
};

const HierarchyLevel = _ref2 => {
  let {
    root,
    roomSet,
    hierarchy,
    parents,
    selectedMap,
    onViewRoomClick,
    onJoinRoomClick,
    onToggleClick
  } = _ref2;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const space = cli.getRoom(root.room_id);
  const hasPermissions = space?.currentState.maySendStateEvent(_event.EventType.SpaceChild, cli.getUserId());
  const sortedChildren = (0, _lodash.sortBy)(root.children_state, ev => {
    return (0, _SpaceStore.getChildOrder)(ev.content.order, ev.origin_server_ts, ev.state_key);
  });
  const [subspaces, childRooms] = sortedChildren.reduce((result, ev) => {
    const room = hierarchy.roomMap.get(ev.state_key);

    if (room && roomSet.has(room)) {
      result[room.room_type === _event.RoomType.Space ? 0 : 1].push(toLocalRoom(cli, room));
    }

    return result;
  }, [[], []]);
  const newParents = new Set(parents).add(root.room_id);
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, (0, _lodash.uniqBy)(childRooms, "room_id").map(room => /*#__PURE__*/_react.default.createElement(Tile, {
    key: room.room_id,
    room: room,
    suggested: hierarchy.isSuggested(root.room_id, room.room_id),
    selected: selectedMap?.get(root.room_id)?.has(room.room_id),
    onViewRoomClick: () => onViewRoomClick(room.room_id, room.room_type),
    onJoinRoomClick: () => onJoinRoomClick(room.room_id),
    hasPermissions: hasPermissions,
    onToggleClick: onToggleClick ? () => onToggleClick(root.room_id, room.room_id) : undefined
  })), subspaces.filter(room => !newParents.has(room.room_id)).map(space => /*#__PURE__*/_react.default.createElement(Tile, {
    key: space.room_id,
    room: space,
    numChildRooms: space.children_state.filter(ev => {
      const room = hierarchy.roomMap.get(ev.state_key);
      return room && roomSet.has(room) && !room.room_type;
    }).length,
    suggested: hierarchy.isSuggested(root.room_id, space.room_id),
    selected: selectedMap?.get(root.room_id)?.has(space.room_id),
    onViewRoomClick: () => onViewRoomClick(space.room_id, _event.RoomType.Space),
    onJoinRoomClick: () => onJoinRoomClick(space.room_id),
    hasPermissions: hasPermissions,
    onToggleClick: onToggleClick ? () => onToggleClick(root.room_id, space.room_id) : undefined
  }, /*#__PURE__*/_react.default.createElement(HierarchyLevel, {
    root: space,
    roomSet: roomSet,
    hierarchy: hierarchy,
    parents: newParents,
    selectedMap: selectedMap,
    onViewRoomClick: onViewRoomClick,
    onJoinRoomClick: onJoinRoomClick,
    onToggleClick: onToggleClick
  }))));
};

exports.HierarchyLevel = HierarchyLevel;
const INITIAL_PAGE_SIZE = 20;

const useRoomHierarchy = space => {
  const [rooms, setRooms] = (0, _react.useState)([]);
  const [roomHierarchy, setHierarchy] = (0, _react.useState)();
  const [error, setError] = (0, _react.useState)();
  const resetHierarchy = (0, _react.useCallback)(() => {
    setError(undefined);
    const hierarchy = new _roomHierarchy.RoomHierarchy(space, INITIAL_PAGE_SIZE);
    hierarchy.load().then(() => {
      if (space !== hierarchy.root) return; // discard stale results

      setRooms(hierarchy.rooms);
    }, setError);
    setHierarchy(hierarchy);
  }, [space]);
  (0, _react.useEffect)(resetHierarchy, [resetHierarchy]);
  (0, _useDispatcher.useDispatcher)(_dispatcher.default, payload => {
    if (payload.action === _actions.Action.UpdateSpaceHierarchy) {
      setRooms([]); // TODO

      resetHierarchy();
    }
  });
  const loadMore = (0, _react.useCallback)(async pageSize => {
    if (roomHierarchy.loading || !roomHierarchy.canLoadMore || roomHierarchy.noSupport || error) return;
    await roomHierarchy.load(pageSize).catch(setError);
    setRooms(roomHierarchy.rooms);
  }, [error, roomHierarchy]); // Only return the hierarchy if it is for the space requested

  let hierarchy = roomHierarchy;

  if (hierarchy?.root !== space) {
    hierarchy = undefined;
  }

  return {
    loading: hierarchy?.loading ?? true,
    rooms,
    hierarchy,
    loadMore,
    error
  };
};

exports.useRoomHierarchy = useRoomHierarchy;

const useIntersectionObserver = callback => {
  const handleObserver = entries => {
    const target = entries[0];

    if (target.isIntersecting) {
      callback();
    }
  };

  const observerRef = (0, _react.useRef)();
  return element => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    } else if (element) {
      observerRef.current = new IntersectionObserver(handleObserver, {
        root: element.parentElement,
        rootMargin: "0px 0px 600px 0px"
      });
    }

    if (observerRef.current && element) {
      observerRef.current.observe(element);
    }
  };
};

const ManageButtons = _ref3 => {
  let {
    hierarchy,
    selected,
    setSelected,
    setError
  } = _ref3;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const [removing, setRemoving] = (0, _react.useState)(false);
  const [saving, setSaving] = (0, _react.useState)(false);
  const selectedRelations = Array.from(selected.keys()).flatMap(parentId => {
    return [...selected.get(parentId).values()].map(childId => [parentId, childId]);
  });
  const selectionAllSuggested = selectedRelations.every(_ref4 => {
    let [parentId, childId] = _ref4;
    return hierarchy.isSuggested(parentId, childId);
  });
  const disabled = !selectedRelations.length || removing || saving;
  let Button = _AccessibleButton.default;
  let props = {};

  if (!selectedRelations.length) {
    Button = _AccessibleTooltipButton.default;
    props = {
      tooltip: (0, _languageHandler._t)("Select a room below first"),
      alignment: _Tooltip.Alignment.Top
    };
  }

  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(Button, (0, _extends2.default)({}, props, {
    onClick: async () => {
      setRemoving(true);

      try {
        const userId = cli.getUserId();

        for (const [parentId, childId] of selectedRelations) {
          await cli.sendStateEvent(parentId, _event.EventType.SpaceChild, {}, childId); // remove the child->parent relation too, if we have permission to.

          const childRoom = cli.getRoom(childId);
          const parentRelation = childRoom?.currentState.getStateEvents(_event.EventType.SpaceParent, parentId);

          if (childRoom?.currentState.maySendStateEvent(_event.EventType.SpaceParent, userId) && Array.isArray(parentRelation?.getContent().via)) {
            await cli.sendStateEvent(childId, _event.EventType.SpaceParent, {}, parentId);
          }

          hierarchy.removeRelation(parentId, childId);
        }
      } catch (e) {
        setError((0, _languageHandler._t)("Failed to remove some rooms. Try again later"));
      }

      setRemoving(false);
      setSelected(new Map());
    },
    kind: "danger_outline",
    disabled: disabled
  }), removing ? (0, _languageHandler._t)("Removing...") : (0, _languageHandler._t)("Remove")), /*#__PURE__*/_react.default.createElement(Button, (0, _extends2.default)({}, props, {
    onClick: async () => {
      setSaving(true);

      try {
        for (const [parentId, childId] of selectedRelations) {
          const suggested = !selectionAllSuggested;
          const existingContent = hierarchy.getRelation(parentId, childId)?.content;
          if (!existingContent || existingContent.suggested === suggested) continue;

          const content = _objectSpread(_objectSpread({}, existingContent), {}, {
            suggested: !selectionAllSuggested
          });

          await cli.sendStateEvent(parentId, _event.EventType.SpaceChild, content, childId); // mutate the local state to save us having to refetch the world

          existingContent.suggested = content.suggested;
        }
      } catch (e) {
        setError("Failed to update some suggestions. Try again later");
      }

      setSaving(false);
      setSelected(new Map());
    },
    kind: "primary_outline",
    disabled: disabled
  }), saving ? (0, _languageHandler._t)("Saving...") : selectionAllSuggested ? (0, _languageHandler._t)("Mark as not suggested") : (0, _languageHandler._t)("Mark as suggested")));
};

const SpaceHierarchy = _ref5 => {
  let {
    space,
    initialText = "",
    showRoom,
    additionalButtons
  } = _ref5;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const [query, setQuery] = (0, _react.useState)(initialText);
  const [selected, setSelected] = (0, _react.useState)(new Map()); // Map<parentId, Set<childId>>

  const {
    loading,
    rooms,
    hierarchy,
    loadMore,
    error: hierarchyError
  } = useRoomHierarchy(space);
  const filteredRoomSet = (0, _react.useMemo)(() => {
    if (!rooms?.length) return new Set();
    const lcQuery = query.toLowerCase().trim();
    if (!lcQuery) return new Set(rooms);
    const directMatches = rooms.filter(r => {
      return r.name?.toLowerCase().includes(lcQuery) || r.topic?.toLowerCase().includes(lcQuery);
    }); // Walk back up the tree to find all parents of the direct matches to show their place in the hierarchy

    const visited = new Set();
    const queue = [...directMatches.map(r => r.room_id)];

    while (queue.length) {
      const roomId = queue.pop();
      visited.add(roomId);
      hierarchy.backRefs.get(roomId)?.forEach(parentId => {
        if (!visited.has(parentId)) {
          queue.push(parentId);
        }
      });
    }

    return new Set(rooms.filter(r => visited.has(r.room_id)));
  }, [rooms, hierarchy, query]);
  const [error, setError] = (0, _react.useState)("");
  let errorText = error;

  if (!error && hierarchyError) {
    errorText = (0, _languageHandler._t)("Failed to load list of rooms.");
  }

  const loaderRef = useIntersectionObserver(loadMore);

  if (!loading && hierarchy.noSupport) {
    return /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Your server does not support showing space hierarchies."));
  }

  const onKeyDown = (ev, state) => {
    const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getAccessibilityAction(ev);

    if (action === _KeyboardShortcuts.KeyBindingAction.ArrowDown && ev.currentTarget.classList.contains("mx_SpaceHierarchy_search")) {
      state.refs[0]?.current?.focus();
    }
  };

  const onToggleClick = (parentId, childId) => {
    setError("");

    if (!selected.has(parentId)) {
      setSelected(new Map(selected.set(parentId, new Set([childId]))));
      return;
    }

    const parentSet = selected.get(parentId);

    if (!parentSet.has(childId)) {
      setSelected(new Map(selected.set(parentId, new Set([...parentSet, childId]))));
      return;
    }

    parentSet.delete(childId);
    setSelected(new Map(selected.set(parentId, new Set(parentSet))));
  };

  return /*#__PURE__*/_react.default.createElement(_RovingTabIndex.RovingTabIndexProvider, {
    onKeyDown: onKeyDown,
    handleHomeEnd: true,
    handleUpDown: true
  }, _ref6 => {
    let {
      onKeyDownHandler
    } = _ref6;
    let content;

    if (loading && !rooms?.length) {
      content = /*#__PURE__*/_react.default.createElement(_Spinner.default, null);
    } else {
      const hasPermissions = space?.getMyMembership() === "join" && space.currentState.maySendStateEvent(_event.EventType.SpaceChild, cli.getUserId());
      let results;

      if (filteredRoomSet.size) {
        results = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(HierarchyLevel, {
          root: hierarchy.roomMap.get(space.roomId),
          roomSet: filteredRoomSet,
          hierarchy: hierarchy,
          parents: new Set(),
          selectedMap: selected,
          onToggleClick: hasPermissions ? onToggleClick : undefined,
          onViewRoomClick: (roomId, roomType) => showRoom(cli, hierarchy, roomId, roomType),
          onJoinRoomClick: roomId => joinRoom(cli, hierarchy, roomId)
        }));
      } else if (!hierarchy.canLoadMore) {
        results = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_SpaceHierarchy_noResults"
        }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("No results found")), /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("You may want to try a different search or check for typos.")));
      }

      let loader;

      if (hierarchy.canLoadMore) {
        loader = /*#__PURE__*/_react.default.createElement("div", {
          ref: loaderRef
        }, /*#__PURE__*/_react.default.createElement(_Spinner.default, null));
      }

      content = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpaceHierarchy_listHeader"
      }, /*#__PURE__*/_react.default.createElement("h4", {
        className: "mx_SpaceHierarchy_listHeader_header"
      }, query.trim() ? (0, _languageHandler._t)("Results") : (0, _languageHandler._t)("Rooms and spaces")), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpaceHierarchy_listHeader_buttons"
      }, additionalButtons, hasPermissions && /*#__PURE__*/_react.default.createElement(ManageButtons, {
        hierarchy: hierarchy,
        selected: selected,
        setSelected: setSelected,
        setError: setError
      }))), errorText && /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpaceHierarchy_error"
      }, errorText), /*#__PURE__*/_react.default.createElement("ul", {
        className: "mx_SpaceHierarchy_list",
        onKeyDown: onKeyDownHandler,
        role: "tree",
        "aria-label": (0, _languageHandler._t)("Space")
      }, results), loader);
    }

    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_SearchBox.default, {
      className: "mx_SpaceHierarchy_search mx_textinput_icon mx_textinput_search",
      placeholder: (0, _languageHandler._t)("Search names and descriptions"),
      onSearch: setQuery,
      autoFocus: true,
      initialValue: initialText,
      onKeyDown: onKeyDownHandler
    }), content);
  });
};

var _default = SpaceHierarchy;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUaWxlIiwicm9vbSIsInN1Z2dlc3RlZCIsInNlbGVjdGVkIiwiaGFzUGVybWlzc2lvbnMiLCJvblRvZ2dsZUNsaWNrIiwib25WaWV3Um9vbUNsaWNrIiwib25Kb2luUm9vbUNsaWNrIiwibnVtQ2hpbGRSb29tcyIsImNoaWxkcmVuIiwiY2xpIiwidXNlQ29udGV4dCIsIk1hdHJpeENsaWVudENvbnRleHQiLCJqb2luZWRSb29tIiwic2V0Sm9pbmVkUm9vbSIsInVzZVN0YXRlIiwiY2xpUm9vbSIsImdldFJvb20iLCJyb29tX2lkIiwiZ2V0TXlNZW1iZXJzaGlwIiwiam9pbmVkUm9vbU5hbWUiLCJ1c2VUeXBlZEV2ZW50RW1pdHRlclN0YXRlIiwiUm9vbUV2ZW50IiwiTmFtZSIsIm5hbWUiLCJjYW5vbmljYWxfYWxpYXMiLCJhbGlhc2VzIiwicm9vbV90eXBlIiwiUm9vbVR5cGUiLCJTcGFjZSIsIl90Iiwic2hvd0NoaWxkcmVuIiwidG9nZ2xlU2hvd0NoaWxkcmVuIiwidXNlU3RhdGVUb2dnbGUiLCJvbkZvY3VzIiwiaXNBY3RpdmUiLCJyZWYiLCJ1c2VSb3ZpbmdUYWJJbmRleCIsImJ1c3kiLCJzZXRCdXN5Iiwib25QcmV2aWV3Q2xpY2siLCJldiIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwib25Kb2luQ2xpY2siLCJ0aGVuIiwiYXdhaXRSb29tRG93blN5bmMiLCJmaW5hbGx5IiwiYnV0dG9uIiwiY2hlY2tib3giLCJhdmF0YXIiLCJhdmF0YXJfdXJsIiwibWVkaWFGcm9tTXhjIiwiZ2V0U3F1YXJlVGh1bWJuYWlsSHR0cCIsImRlc2NyaXB0aW9uIiwiY291bnQiLCJudW1fam9pbmVkX21lbWJlcnMiLCJ1bmRlZmluZWQiLCJ0b3BpYyIsInRvcGljT2JqIiwiZ2V0VG9waWMiLCJ0b3BpY1RvSHRtbCIsInRleHQiLCJodG1sIiwiam9pbmVkU2VjdGlvbiIsInN1Z2dlc3RlZFNlY3Rpb24iLCJjb250ZW50IiwiZSIsImxpbmtpZnlFbGVtZW50IiwidGFyZ2V0IiwidGFnTmFtZSIsImNoaWxkVG9nZ2xlIiwiY2hpbGRTZWN0aW9uIiwib25LZXlEb3duIiwiY2xhc3NOYW1lcyIsIm14X1NwYWNlSGllcmFyY2h5X3N1YnNwYWNlX3RvZ2dsZV9zaG93biIsIm9uQ2hpbGRyZW5LZXlEb3duIiwiYWN0aW9uIiwiZ2V0S2V5QmluZGluZ3NNYW5hZ2VyIiwiZ2V0QWNjZXNzaWJpbGl0eUFjdGlvbiIsIktleUJpbmRpbmdBY3Rpb24iLCJBcnJvd0xlZnQiLCJjdXJyZW50IiwiZm9jdXMiLCJoYW5kbGVkIiwiQXJyb3dSaWdodCIsIm5leHRFbGVtZW50U2libGluZyIsInF1ZXJ5U2VsZWN0b3IiLCJteF9TcGFjZUhpZXJhcmNoeV9zdWJzcGFjZSIsIm14X1NwYWNlSGllcmFyY2h5X2pvaW5pbmciLCJzaG93Um9vbSIsImhpZXJhcmNoeSIsInJvb21JZCIsInJvb21UeXBlIiwicm9vbU1hcCIsImdldCIsImlzR3Vlc3QiLCJ3b3JsZF9yZWFkYWJsZSIsImd1ZXN0X2Nhbl9qb2luIiwiZGVmYXVsdERpc3BhdGNoZXIiLCJkaXNwYXRjaCIsInJvb21BbGlhcyIsImdldERpc3BsYXlBbGlhc0ZvclJvb20iLCJBY3Rpb24iLCJWaWV3Um9vbSIsInNob3VsZF9wZWVrIiwicm9vbV9hbGlhcyIsInZpYV9zZXJ2ZXJzIiwiQXJyYXkiLCJmcm9tIiwidmlhTWFwIiwib29iX2RhdGEiLCJhdmF0YXJVcmwiLCJtZXRyaWNzVHJpZ2dlciIsImpvaW5Sb29tIiwicHJvbSIsInZpYVNlcnZlcnMiLCJKb2luUm9vbVJlYWR5IiwiZXJyIiwiUm9vbVZpZXdTdG9yZSIsImluc3RhbmNlIiwic2hvd0pvaW5Sb29tRXJyb3IiLCJ0b0xvY2FsUm9vbSIsImhpc3RvcnkiLCJnZXRSb29tVXBncmFkZUhpc3RvcnkiLCJsZW5ndGgiLCJnZXRUeXBlIiwiY3VycmVudFN0YXRlIiwiZ2V0U3RhdGVFdmVudHMiLCJFdmVudFR5cGUiLCJSb29tVG9waWMiLCJnZXRDb250ZW50IiwiZ2V0TXhjQXZhdGFyVXJsIiwiZ2V0Q2Fub25pY2FsQWxpYXMiLCJnZXRBbHRBbGlhc2VzIiwiUm9vbUhpc3RvcnlWaXNpYmlsaXR5IiwiaGlzdG9yeV92aXNpYmlsaXR5IiwiSGlzdG9yeVZpc2liaWxpdHkiLCJXb3JsZFJlYWRhYmxlIiwiUm9vbUd1ZXN0QWNjZXNzIiwiZ3Vlc3RfYWNjZXNzIiwiR3Vlc3RBY2Nlc3MiLCJDYW5Kb2luIiwiZ2V0Sm9pbmVkTWVtYmVyQ291bnQiLCJIaWVyYXJjaHlMZXZlbCIsInJvb3QiLCJyb29tU2V0IiwicGFyZW50cyIsInNlbGVjdGVkTWFwIiwic3BhY2UiLCJtYXlTZW5kU3RhdGVFdmVudCIsIlNwYWNlQ2hpbGQiLCJnZXRVc2VySWQiLCJzb3J0ZWRDaGlsZHJlbiIsInNvcnRCeSIsImNoaWxkcmVuX3N0YXRlIiwiZ2V0Q2hpbGRPcmRlciIsIm9yZGVyIiwib3JpZ2luX3NlcnZlcl90cyIsInN0YXRlX2tleSIsInN1YnNwYWNlcyIsImNoaWxkUm9vbXMiLCJyZWR1Y2UiLCJyZXN1bHQiLCJoYXMiLCJwdXNoIiwibmV3UGFyZW50cyIsIlNldCIsImFkZCIsInVuaXFCeSIsIm1hcCIsImlzU3VnZ2VzdGVkIiwiZmlsdGVyIiwiSU5JVElBTF9QQUdFX1NJWkUiLCJ1c2VSb29tSGllcmFyY2h5Iiwicm9vbXMiLCJzZXRSb29tcyIsInJvb21IaWVyYXJjaHkiLCJzZXRIaWVyYXJjaHkiLCJlcnJvciIsInNldEVycm9yIiwicmVzZXRIaWVyYXJjaHkiLCJ1c2VDYWxsYmFjayIsIlJvb21IaWVyYXJjaHkiLCJsb2FkIiwidXNlRWZmZWN0IiwidXNlRGlzcGF0Y2hlciIsInBheWxvYWQiLCJVcGRhdGVTcGFjZUhpZXJhcmNoeSIsImxvYWRNb3JlIiwicGFnZVNpemUiLCJsb2FkaW5nIiwiY2FuTG9hZE1vcmUiLCJub1N1cHBvcnQiLCJjYXRjaCIsInVzZUludGVyc2VjdGlvbk9ic2VydmVyIiwiY2FsbGJhY2siLCJoYW5kbGVPYnNlcnZlciIsImVudHJpZXMiLCJpc0ludGVyc2VjdGluZyIsIm9ic2VydmVyUmVmIiwidXNlUmVmIiwiZWxlbWVudCIsImRpc2Nvbm5lY3QiLCJJbnRlcnNlY3Rpb25PYnNlcnZlciIsInBhcmVudEVsZW1lbnQiLCJyb290TWFyZ2luIiwib2JzZXJ2ZSIsIk1hbmFnZUJ1dHRvbnMiLCJzZXRTZWxlY3RlZCIsInJlbW92aW5nIiwic2V0UmVtb3ZpbmciLCJzYXZpbmciLCJzZXRTYXZpbmciLCJzZWxlY3RlZFJlbGF0aW9ucyIsImtleXMiLCJmbGF0TWFwIiwicGFyZW50SWQiLCJ2YWx1ZXMiLCJjaGlsZElkIiwic2VsZWN0aW9uQWxsU3VnZ2VzdGVkIiwiZXZlcnkiLCJkaXNhYmxlZCIsIkJ1dHRvbiIsIkFjY2Vzc2libGVCdXR0b24iLCJwcm9wcyIsIkFjY2Vzc2libGVUb29sdGlwQnV0dG9uIiwidG9vbHRpcCIsImFsaWdubWVudCIsIkFsaWdubWVudCIsIlRvcCIsInVzZXJJZCIsInNlbmRTdGF0ZUV2ZW50IiwiY2hpbGRSb29tIiwicGFyZW50UmVsYXRpb24iLCJTcGFjZVBhcmVudCIsImlzQXJyYXkiLCJ2aWEiLCJyZW1vdmVSZWxhdGlvbiIsIk1hcCIsImV4aXN0aW5nQ29udGVudCIsImdldFJlbGF0aW9uIiwiU3BhY2VIaWVyYXJjaHkiLCJpbml0aWFsVGV4dCIsImFkZGl0aW9uYWxCdXR0b25zIiwicXVlcnkiLCJzZXRRdWVyeSIsImhpZXJhcmNoeUVycm9yIiwiZmlsdGVyZWRSb29tU2V0IiwidXNlTWVtbyIsImxjUXVlcnkiLCJ0b0xvd2VyQ2FzZSIsInRyaW0iLCJkaXJlY3RNYXRjaGVzIiwiciIsImluY2x1ZGVzIiwidmlzaXRlZCIsInF1ZXVlIiwicG9wIiwiYmFja1JlZnMiLCJmb3JFYWNoIiwiZXJyb3JUZXh0IiwibG9hZGVyUmVmIiwic3RhdGUiLCJBcnJvd0Rvd24iLCJjdXJyZW50VGFyZ2V0IiwiY2xhc3NMaXN0IiwiY29udGFpbnMiLCJyZWZzIiwic2V0IiwicGFyZW50U2V0IiwiZGVsZXRlIiwib25LZXlEb3duSGFuZGxlciIsInJlc3VsdHMiLCJzaXplIiwibG9hZGVyIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvc3RydWN0dXJlcy9TcGFjZUhpZXJhcmNoeS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7XG4gICAgRGlzcGF0Y2gsXG4gICAgS2V5Ym9hcmRFdmVudCxcbiAgICBLZXlib2FyZEV2ZW50SGFuZGxlcixcbiAgICBSZWFjdEVsZW1lbnQsXG4gICAgUmVhY3ROb2RlLFxuICAgIFNldFN0YXRlQWN0aW9uLFxuICAgIHVzZUNhbGxiYWNrLFxuICAgIHVzZUNvbnRleHQsXG4gICAgdXNlRWZmZWN0LFxuICAgIHVzZU1lbW8sXG4gICAgdXNlUmVmLFxuICAgIHVzZVN0YXRlLFxufSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IFJvb20sIFJvb21FdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuaW1wb3J0IHsgUm9vbUhpZXJhcmNoeSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9yb29tLWhpZXJhcmNoeVwiO1xuaW1wb3J0IHsgRXZlbnRUeXBlLCBSb29tVHlwZSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvZXZlbnRcIjtcbmltcG9ydCB7IElIaWVyYXJjaHlSZWxhdGlvbiwgSUhpZXJhcmNoeVJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL3NwYWNlc1wiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21hdHJpeFwiO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSBcImNsYXNzbmFtZXNcIjtcbmltcG9ydCB7IHNvcnRCeSwgdW5pcUJ5IH0gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHsgR3Vlc3RBY2Nlc3MsIEhpc3RvcnlWaXNpYmlsaXR5IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9wYXJ0aWFsc1wiO1xuXG5pbXBvcnQgZGVmYXVsdERpc3BhdGNoZXIgZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiwgeyBCdXR0b25FdmVudCB9IGZyb20gXCIuLi92aWV3cy9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgU3Bpbm5lciBmcm9tIFwiLi4vdmlld3MvZWxlbWVudHMvU3Bpbm5lclwiO1xuaW1wb3J0IFNlYXJjaEJveCBmcm9tIFwiLi9TZWFyY2hCb3hcIjtcbmltcG9ydCBSb29tQXZhdGFyIGZyb20gXCIuLi92aWV3cy9hdmF0YXJzL1Jvb21BdmF0YXJcIjtcbmltcG9ydCBTdHlsZWRDaGVja2JveCBmcm9tIFwiLi4vdmlld3MvZWxlbWVudHMvU3R5bGVkQ2hlY2tib3hcIjtcbmltcG9ydCBCYXNlQXZhdGFyIGZyb20gXCIuLi92aWV3cy9hdmF0YXJzL0Jhc2VBdmF0YXJcIjtcbmltcG9ydCB7IG1lZGlhRnJvbU14YyB9IGZyb20gXCIuLi8uLi9jdXN0b21pc2F0aW9ucy9NZWRpYVwiO1xuaW1wb3J0IEluZm9Ub29sdGlwIGZyb20gXCIuLi92aWV3cy9lbGVtZW50cy9JbmZvVG9vbHRpcFwiO1xuaW1wb3J0IFRleHRXaXRoVG9vbHRpcCBmcm9tIFwiLi4vdmlld3MvZWxlbWVudHMvVGV4dFdpdGhUb29sdGlwXCI7XG5pbXBvcnQgeyB1c2VTdGF0ZVRvZ2dsZSB9IGZyb20gXCIuLi8uLi9ob29rcy91c2VTdGF0ZVRvZ2dsZVwiO1xuaW1wb3J0IHsgZ2V0Q2hpbGRPcmRlciB9IGZyb20gXCIuLi8uLi9zdG9yZXMvc3BhY2VzL1NwYWNlU3RvcmVcIjtcbmltcG9ydCBBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbiBmcm9tIFwiLi4vdmlld3MvZWxlbWVudHMvQWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cIjtcbmltcG9ydCB7IGxpbmtpZnlFbGVtZW50LCB0b3BpY1RvSHRtbCB9IGZyb20gXCIuLi8uLi9IdG1sVXRpbHNcIjtcbmltcG9ydCB7IHVzZURpc3BhdGNoZXIgfSBmcm9tIFwiLi4vLi4vaG9va3MvdXNlRGlzcGF0Y2hlclwiO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IHsgSVN0YXRlLCBSb3ZpbmdUYWJJbmRleFByb3ZpZGVyLCB1c2VSb3ZpbmdUYWJJbmRleCB9IGZyb20gXCIuLi8uLi9hY2Nlc3NpYmlsaXR5L1JvdmluZ1RhYkluZGV4XCI7XG5pbXBvcnQgeyBnZXREaXNwbGF5QWxpYXNGb3JSb29tIH0gZnJvbSBcIi4vUm9vbURpcmVjdG9yeVwiO1xuaW1wb3J0IE1hdHJpeENsaWVudENvbnRleHQgZnJvbSBcIi4uLy4uL2NvbnRleHRzL01hdHJpeENsaWVudENvbnRleHRcIjtcbmltcG9ydCB7IHVzZVR5cGVkRXZlbnRFbWl0dGVyU3RhdGUgfSBmcm9tIFwiLi4vLi4vaG9va3MvdXNlRXZlbnRFbWl0dGVyXCI7XG5pbXBvcnQgeyBJT09CRGF0YSB9IGZyb20gXCIuLi8uLi9zdG9yZXMvVGhyZWVwaWRJbnZpdGVTdG9yZVwiO1xuaW1wb3J0IHsgYXdhaXRSb29tRG93blN5bmMgfSBmcm9tIFwiLi4vLi4vdXRpbHMvUm9vbVVwZ3JhZGVcIjtcbmltcG9ydCB7IFJvb21WaWV3U3RvcmUgfSBmcm9tIFwiLi4vLi4vc3RvcmVzL1Jvb21WaWV3U3RvcmVcIjtcbmltcG9ydCB7IFZpZXdSb29tUGF5bG9hZCB9IGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzL1ZpZXdSb29tUGF5bG9hZFwiO1xuaW1wb3J0IHsgSm9pblJvb21SZWFkeVBheWxvYWQgfSBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9Kb2luUm9vbVJlYWR5UGF5bG9hZFwiO1xuaW1wb3J0IHsgS2V5QmluZGluZ0FjdGlvbiB9IGZyb20gXCIuLi8uLi9hY2Nlc3NpYmlsaXR5L0tleWJvYXJkU2hvcnRjdXRzXCI7XG5pbXBvcnQgeyBnZXRLZXlCaW5kaW5nc01hbmFnZXIgfSBmcm9tIFwiLi4vLi4vS2V5QmluZGluZ3NNYW5hZ2VyXCI7XG5pbXBvcnQgeyBBbGlnbm1lbnQgfSBmcm9tIFwiLi4vdmlld3MvZWxlbWVudHMvVG9vbHRpcFwiO1xuaW1wb3J0IHsgZ2V0VG9waWMgfSBmcm9tIFwiLi4vLi4vaG9va3Mvcm9vbS91c2VUb3BpY1wiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBzcGFjZTogUm9vbTtcbiAgICBpbml0aWFsVGV4dD86IHN0cmluZztcbiAgICBhZGRpdGlvbmFsQnV0dG9ucz86IFJlYWN0Tm9kZTtcbiAgICBzaG93Um9vbShjbGk6IE1hdHJpeENsaWVudCwgaGllcmFyY2h5OiBSb29tSGllcmFyY2h5LCByb29tSWQ6IHN0cmluZywgcm9vbVR5cGU/OiBSb29tVHlwZSk6IHZvaWQ7XG59XG5cbmludGVyZmFjZSBJVGlsZVByb3BzIHtcbiAgICByb29tOiBJSGllcmFyY2h5Um9vbTtcbiAgICBzdWdnZXN0ZWQ/OiBib29sZWFuO1xuICAgIHNlbGVjdGVkPzogYm9vbGVhbjtcbiAgICBudW1DaGlsZFJvb21zPzogbnVtYmVyO1xuICAgIGhhc1Blcm1pc3Npb25zPzogYm9vbGVhbjtcbiAgICBvblZpZXdSb29tQ2xpY2soKTogdm9pZDtcbiAgICBvbkpvaW5Sb29tQ2xpY2soKTogUHJvbWlzZTx1bmtub3duPjtcbiAgICBvblRvZ2dsZUNsaWNrPygpOiB2b2lkO1xufVxuXG5jb25zdCBUaWxlOiBSZWFjdC5GQzxJVGlsZVByb3BzPiA9ICh7XG4gICAgcm9vbSxcbiAgICBzdWdnZXN0ZWQsXG4gICAgc2VsZWN0ZWQsXG4gICAgaGFzUGVybWlzc2lvbnMsXG4gICAgb25Ub2dnbGVDbGljayxcbiAgICBvblZpZXdSb29tQ2xpY2ssXG4gICAgb25Kb2luUm9vbUNsaWNrLFxuICAgIG51bUNoaWxkUm9vbXMsXG4gICAgY2hpbGRyZW4sXG59KSA9PiB7XG4gICAgY29uc3QgY2xpID0gdXNlQ29udGV4dChNYXRyaXhDbGllbnRDb250ZXh0KTtcbiAgICBjb25zdCBbam9pbmVkUm9vbSwgc2V0Sm9pbmVkUm9vbV0gPSB1c2VTdGF0ZTxSb29tPigoKSA9PiB7XG4gICAgICAgIGNvbnN0IGNsaVJvb20gPSBjbGkuZ2V0Um9vbShyb29tLnJvb21faWQpO1xuICAgICAgICByZXR1cm4gY2xpUm9vbT8uZ2V0TXlNZW1iZXJzaGlwKCkgPT09IFwiam9pblwiID8gY2xpUm9vbSA6IG51bGw7XG4gICAgfSk7XG4gICAgY29uc3Qgam9pbmVkUm9vbU5hbWUgPSB1c2VUeXBlZEV2ZW50RW1pdHRlclN0YXRlKGpvaW5lZFJvb20sIFJvb21FdmVudC5OYW1lLCByb29tID0+IHJvb20/Lm5hbWUpO1xuICAgIGNvbnN0IG5hbWUgPSBqb2luZWRSb29tTmFtZSB8fCByb29tLm5hbWUgfHwgcm9vbS5jYW5vbmljYWxfYWxpYXMgfHwgcm9vbS5hbGlhc2VzPy5bMF1cbiAgICAgICAgfHwgKHJvb20ucm9vbV90eXBlID09PSBSb29tVHlwZS5TcGFjZSA/IF90KFwiVW5uYW1lZCBTcGFjZVwiKSA6IF90KFwiVW5uYW1lZCBSb29tXCIpKTtcblxuICAgIGNvbnN0IFtzaG93Q2hpbGRyZW4sIHRvZ2dsZVNob3dDaGlsZHJlbl0gPSB1c2VTdGF0ZVRvZ2dsZSh0cnVlKTtcbiAgICBjb25zdCBbb25Gb2N1cywgaXNBY3RpdmUsIHJlZl0gPSB1c2VSb3ZpbmdUYWJJbmRleCgpO1xuICAgIGNvbnN0IFtidXN5LCBzZXRCdXN5XSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICAgIGNvbnN0IG9uUHJldmlld0NsaWNrID0gKGV2OiBCdXR0b25FdmVudCkgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgb25WaWV3Um9vbUNsaWNrKCk7XG4gICAgfTtcbiAgICBjb25zdCBvbkpvaW5DbGljayA9IGFzeW5jIChldjogQnV0dG9uRXZlbnQpID0+IHtcbiAgICAgICAgc2V0QnVzeSh0cnVlKTtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIG9uSm9pblJvb21DbGljaygpLnRoZW4oKCkgPT4gYXdhaXRSb29tRG93blN5bmMoY2xpLCByb29tLnJvb21faWQpKS50aGVuKHNldEpvaW5lZFJvb20pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgc2V0QnVzeShmYWxzZSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBsZXQgYnV0dG9uOiBSZWFjdEVsZW1lbnQ7XG4gICAgaWYgKGJ1c3kpIHtcbiAgICAgICAgYnV0dG9uID0gPEFjY2Vzc2libGVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICBkaXNhYmxlZD17dHJ1ZX1cbiAgICAgICAgICAgIG9uQ2xpY2s9e29uSm9pbkNsaWNrfVxuICAgICAgICAgICAga2luZD1cInByaW1hcnlfb3V0bGluZVwiXG4gICAgICAgICAgICBvbkZvY3VzPXtvbkZvY3VzfVxuICAgICAgICAgICAgdGFiSW5kZXg9e2lzQWN0aXZlID8gMCA6IC0xfVxuICAgICAgICAgICAgdGl0bGU9e190KFwiSm9pbmluZ1wiKX1cbiAgICAgICAgPlxuICAgICAgICAgICAgPFNwaW5uZXIgdz17MjR9IGg9ezI0fSAvPlxuICAgICAgICA8L0FjY2Vzc2libGVUb29sdGlwQnV0dG9uPjtcbiAgICB9IGVsc2UgaWYgKGpvaW5lZFJvb20pIHtcbiAgICAgICAgYnV0dG9uID0gPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgIG9uQ2xpY2s9e29uUHJldmlld0NsaWNrfVxuICAgICAgICAgICAga2luZD1cInByaW1hcnlfb3V0bGluZVwiXG4gICAgICAgICAgICBvbkZvY3VzPXtvbkZvY3VzfVxuICAgICAgICAgICAgdGFiSW5kZXg9e2lzQWN0aXZlID8gMCA6IC0xfVxuICAgICAgICA+XG4gICAgICAgICAgICB7IF90KFwiVmlld1wiKSB9XG4gICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj47XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYnV0dG9uID0gPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgIG9uQ2xpY2s9e29uSm9pbkNsaWNrfVxuICAgICAgICAgICAga2luZD1cInByaW1hcnlcIlxuICAgICAgICAgICAgb25Gb2N1cz17b25Gb2N1c31cbiAgICAgICAgICAgIHRhYkluZGV4PXtpc0FjdGl2ZSA/IDAgOiAtMX1cbiAgICAgICAgPlxuICAgICAgICAgICAgeyBfdChcIkpvaW5cIikgfVxuICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+O1xuICAgIH1cblxuICAgIGxldCBjaGVja2JveDogUmVhY3RFbGVtZW50IHwgdW5kZWZpbmVkO1xuICAgIGlmIChvblRvZ2dsZUNsaWNrKSB7XG4gICAgICAgIGlmIChoYXNQZXJtaXNzaW9ucykge1xuICAgICAgICAgICAgY2hlY2tib3ggPSA8U3R5bGVkQ2hlY2tib3ggY2hlY2tlZD17ISFzZWxlY3RlZH0gb25DaGFuZ2U9e29uVG9nZ2xlQ2xpY2t9IHRhYkluZGV4PXtpc0FjdGl2ZSA/IDAgOiAtMX0gLz47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjaGVja2JveCA9IDxUZXh0V2l0aFRvb2x0aXBcbiAgICAgICAgICAgICAgICB0b29sdGlwPXtfdChcIllvdSBkb24ndCBoYXZlIHBlcm1pc3Npb25cIil9XG4gICAgICAgICAgICAgICAgb25DbGljaz17ZXYgPT4geyBldi5zdG9wUHJvcGFnYXRpb24oKTsgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8U3R5bGVkQ2hlY2tib3ggZGlzYWJsZWQ9e3RydWV9IHRhYkluZGV4PXtpc0FjdGl2ZSA/IDAgOiAtMX0gLz5cbiAgICAgICAgICAgIDwvVGV4dFdpdGhUb29sdGlwPjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGxldCBhdmF0YXI6IFJlYWN0RWxlbWVudDtcbiAgICBpZiAoam9pbmVkUm9vbSkge1xuICAgICAgICBhdmF0YXIgPSA8Um9vbUF2YXRhciByb29tPXtqb2luZWRSb29tfSB3aWR0aD17MjB9IGhlaWdodD17MjB9IC8+O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGF2YXRhciA9IDxCYXNlQXZhdGFyXG4gICAgICAgICAgICBuYW1lPXtuYW1lfVxuICAgICAgICAgICAgaWROYW1lPXtyb29tLnJvb21faWR9XG4gICAgICAgICAgICB1cmw9e3Jvb20uYXZhdGFyX3VybCA/IG1lZGlhRnJvbU14Yyhyb29tLmF2YXRhcl91cmwpLmdldFNxdWFyZVRodW1ibmFpbEh0dHAoMjApIDogbnVsbH1cbiAgICAgICAgICAgIHdpZHRoPXsyMH1cbiAgICAgICAgICAgIGhlaWdodD17MjB9XG4gICAgICAgIC8+O1xuICAgIH1cblxuICAgIGxldCBkZXNjcmlwdGlvbiA9IF90KFwiJShjb3VudClzIG1lbWJlcnNcIiwgeyBjb3VudDogcm9vbS5udW1fam9pbmVkX21lbWJlcnMgfSk7XG4gICAgaWYgKG51bUNoaWxkUm9vbXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBkZXNjcmlwdGlvbiArPSBcIiDCtyBcIiArIF90KFwiJShjb3VudClzIHJvb21zXCIsIHsgY291bnQ6IG51bUNoaWxkUm9vbXMgfSk7XG4gICAgfVxuXG4gICAgbGV0IHRvcGljOiBSZWFjdE5vZGUgfCBzdHJpbmcgfCBudWxsO1xuICAgIGlmIChqb2luZWRSb29tKSB7XG4gICAgICAgIGNvbnN0IHRvcGljT2JqID0gZ2V0VG9waWMoam9pbmVkUm9vbSk7XG4gICAgICAgIHRvcGljID0gdG9waWNUb0h0bWwodG9waWNPYmo/LnRleHQsIHRvcGljT2JqPy5odG1sKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0b3BpYyA9IHJvb20udG9waWM7XG4gICAgfVxuXG4gICAgbGV0IGpvaW5lZFNlY3Rpb246IFJlYWN0RWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgICBpZiAoam9pbmVkUm9vbSkge1xuICAgICAgICBqb2luZWRTZWN0aW9uID0gPGRpdiBjbGFzc05hbWU9XCJteF9TcGFjZUhpZXJhcmNoeV9yb29tVGlsZV9qb2luZWRcIj5cbiAgICAgICAgICAgIHsgX3QoXCJKb2luZWRcIikgfVxuICAgICAgICA8L2Rpdj47XG4gICAgfVxuXG4gICAgbGV0IHN1Z2dlc3RlZFNlY3Rpb246IFJlYWN0RWxlbWVudCB8IHVuZGVmaW5lZDtcbiAgICBpZiAoc3VnZ2VzdGVkICYmICgham9pbmVkUm9vbSB8fCBoYXNQZXJtaXNzaW9ucykpIHtcbiAgICAgICAgc3VnZ2VzdGVkU2VjdGlvbiA9IDxJbmZvVG9vbHRpcCB0b29sdGlwPXtfdChcIlRoaXMgcm9vbSBpcyBzdWdnZXN0ZWQgYXMgYSBnb29kIG9uZSB0byBqb2luXCIpfT5cbiAgICAgICAgICAgIHsgX3QoXCJTdWdnZXN0ZWRcIikgfVxuICAgICAgICA8L0luZm9Ub29sdGlwPjtcbiAgICB9XG5cbiAgICBjb25zdCBjb250ZW50ID0gPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NwYWNlSGllcmFyY2h5X3Jvb21UaWxlX2l0ZW1cIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VIaWVyYXJjaHlfcm9vbVRpbGVfYXZhdGFyXCI+XG4gICAgICAgICAgICAgICAgeyBhdmF0YXIgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NwYWNlSGllcmFyY2h5X3Jvb21UaWxlX25hbWVcIj5cbiAgICAgICAgICAgICAgICB7IG5hbWUgfVxuICAgICAgICAgICAgICAgIHsgam9pbmVkU2VjdGlvbiB9XG4gICAgICAgICAgICAgICAgeyBzdWdnZXN0ZWRTZWN0aW9uIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1NwYWNlSGllcmFyY2h5X3Jvb21UaWxlX2luZm9cIlxuICAgICAgICAgICAgICAgIHJlZj17ZSA9PiBlICYmIGxpbmtpZnlFbGVtZW50KGUpfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e2V2ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gcHJldmVudCBjbGlja3Mgb24gbGlua3MgZnJvbSBidWJibGluZyB1cCB0byB0aGUgcm9vbSB0aWxlXG4gICAgICAgICAgICAgICAgICAgIGlmICgoZXYudGFyZ2V0IGFzIEhUTUxFbGVtZW50KS50YWdOYW1lID09PSBcIkFcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgZGVzY3JpcHRpb24gfVxuICAgICAgICAgICAgICAgIHsgdG9waWMgJiYgXCIgwrcgXCIgfVxuICAgICAgICAgICAgICAgIHsgdG9waWMgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NwYWNlSGllcmFyY2h5X2FjdGlvbnNcIj5cbiAgICAgICAgICAgIHsgYnV0dG9uIH1cbiAgICAgICAgICAgIHsgY2hlY2tib3ggfVxuICAgICAgICA8L2Rpdj5cbiAgICA8L1JlYWN0LkZyYWdtZW50PjtcblxuICAgIGxldCBjaGlsZFRvZ2dsZTogSlNYLkVsZW1lbnQ7XG4gICAgbGV0IGNoaWxkU2VjdGlvbjogSlNYLkVsZW1lbnQ7XG4gICAgbGV0IG9uS2V5RG93bjogS2V5Ym9hcmRFdmVudEhhbmRsZXI7XG4gICAgaWYgKGNoaWxkcmVuKSB7XG4gICAgICAgIC8vIHRoZSBjaGV2cm9uIGlzIHB1cnBvc2VmdWxseSBhIGRpdiByYXRoZXIgdGhhbiBhIGJ1dHRvbiBhcyBpdCBzaG91bGQgYmUgaWdub3JlZCBmb3IgYTExeVxuICAgICAgICBjaGlsZFRvZ2dsZSA9IDxkaXZcbiAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X1NwYWNlSGllcmFyY2h5X3N1YnNwYWNlX3RvZ2dsZVwiLCB7XG4gICAgICAgICAgICAgICAgbXhfU3BhY2VIaWVyYXJjaHlfc3Vic3BhY2VfdG9nZ2xlX3Nob3duOiBzaG93Q2hpbGRyZW4sXG4gICAgICAgICAgICB9KX1cbiAgICAgICAgICAgIG9uQ2xpY2s9e2V2ID0+IHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICB0b2dnbGVTaG93Q2hpbGRyZW4oKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgIC8+O1xuXG4gICAgICAgIGlmIChzaG93Q2hpbGRyZW4pIHtcbiAgICAgICAgICAgIGNvbnN0IG9uQ2hpbGRyZW5LZXlEb3duID0gKGUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBhY3Rpb24gPSBnZXRLZXlCaW5kaW5nc01hbmFnZXIoKS5nZXRBY2Nlc3NpYmlsaXR5QWN0aW9uKGUpO1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5BcnJvd0xlZnQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVmLmN1cnJlbnQ/LmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjaGlsZFNlY3Rpb24gPSA8ZGl2XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfU3BhY2VIaWVyYXJjaHlfc3Vic3BhY2VfY2hpbGRyZW5cIlxuICAgICAgICAgICAgICAgIG9uS2V5RG93bj17b25DaGlsZHJlbktleURvd259XG4gICAgICAgICAgICAgICAgcm9sZT1cImdyb3VwXCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IGNoaWxkcmVuIH1cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuXG4gICAgICAgIG9uS2V5RG93biA9IChlKSA9PiB7XG4gICAgICAgICAgICBsZXQgaGFuZGxlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICBjb25zdCBhY3Rpb24gPSBnZXRLZXlCaW5kaW5nc01hbmFnZXIoKS5nZXRBY2Nlc3NpYmlsaXR5QWN0aW9uKGUpO1xuICAgICAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uQXJyb3dMZWZ0OlxuICAgICAgICAgICAgICAgICAgICBpZiAoc2hvd0NoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvZ2dsZVNob3dDaGlsZHJlbigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY2FzZSBLZXlCaW5kaW5nQWN0aW9uLkFycm93UmlnaHQ6XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2hvd0NoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZFNlY3Rpb24gPSByZWYuY3VycmVudD8ubmV4dEVsZW1lbnRTaWJsaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRTZWN0aW9uPy5xdWVyeVNlbGVjdG9yPEhUTUxEaXZFbGVtZW50PihcIi5teF9TcGFjZUhpZXJhcmNoeV9yb29tVGlsZVwiKT8uZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvZ2dsZVNob3dDaGlsZHJlbigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaGFuZGxlZCkge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiA8bGlcbiAgICAgICAgY2xhc3NOYW1lPVwibXhfU3BhY2VIaWVyYXJjaHlfcm9vbVRpbGVXcmFwcGVyXCJcbiAgICAgICAgcm9sZT1cInRyZWVpdGVtXCJcbiAgICAgICAgYXJpYS1leHBhbmRlZD17Y2hpbGRyZW4gPyBzaG93Q2hpbGRyZW4gOiB1bmRlZmluZWR9XG4gICAgPlxuICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWVzKFwibXhfU3BhY2VIaWVyYXJjaHlfcm9vbVRpbGVcIiwge1xuICAgICAgICAgICAgICAgIG14X1NwYWNlSGllcmFyY2h5X3N1YnNwYWNlOiByb29tLnJvb21fdHlwZSA9PT0gUm9vbVR5cGUuU3BhY2UsXG4gICAgICAgICAgICAgICAgbXhfU3BhY2VIaWVyYXJjaHlfam9pbmluZzogYnVzeSxcbiAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgb25DbGljaz17KGhhc1Blcm1pc3Npb25zICYmIG9uVG9nZ2xlQ2xpY2spID8gb25Ub2dnbGVDbGljayA6IG9uUHJldmlld0NsaWNrfVxuICAgICAgICAgICAgb25LZXlEb3duPXtvbktleURvd259XG4gICAgICAgICAgICBpbnB1dFJlZj17cmVmfVxuICAgICAgICAgICAgb25Gb2N1cz17b25Gb2N1c31cbiAgICAgICAgICAgIHRhYkluZGV4PXtpc0FjdGl2ZSA/IDAgOiAtMX1cbiAgICAgICAgPlxuICAgICAgICAgICAgeyBjb250ZW50IH1cbiAgICAgICAgICAgIHsgY2hpbGRUb2dnbGUgfVxuICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgIHsgY2hpbGRTZWN0aW9uIH1cbiAgICA8L2xpPjtcbn07XG5cbmV4cG9ydCBjb25zdCBzaG93Um9vbSA9IChjbGk6IE1hdHJpeENsaWVudCwgaGllcmFyY2h5OiBSb29tSGllcmFyY2h5LCByb29tSWQ6IHN0cmluZywgcm9vbVR5cGU/OiBSb29tVHlwZSk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IHJvb20gPSBoaWVyYXJjaHkucm9vbU1hcC5nZXQocm9vbUlkKTtcblxuICAgIC8vIERvbid0IGxldCB0aGUgdXNlciB2aWV3IGEgcm9vbSB0aGV5IHdvbid0IGJlIGFibGUgdG8gZWl0aGVyIHBlZWsgb3Igam9pbjpcbiAgICAvLyBmYWlsIGVhcmxpZXIgc28gdGhleSBkb24ndCBoYXZlIHRvIGNsaWNrIGJhY2sgdG8gdGhlIGRpcmVjdG9yeS5cbiAgICBpZiAoY2xpLmlzR3Vlc3QoKSkge1xuICAgICAgICBpZiAoIXJvb20ud29ybGRfcmVhZGFibGUgJiYgIXJvb20uZ3Vlc3RfY2FuX2pvaW4pIHtcbiAgICAgICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoKHsgYWN0aW9uOiBcInJlcXVpcmVfcmVnaXN0cmF0aW9uXCIgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCByb29tQWxpYXMgPSBnZXREaXNwbGF5QWxpYXNGb3JSb29tKHJvb20pIHx8IHVuZGVmaW5lZDtcbiAgICBkZWZhdWx0RGlzcGF0Y2hlci5kaXNwYXRjaDxWaWV3Um9vbVBheWxvYWQ+KHtcbiAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1Jvb20sXG4gICAgICAgIHNob3VsZF9wZWVrOiB0cnVlLFxuICAgICAgICByb29tX2FsaWFzOiByb29tQWxpYXMsXG4gICAgICAgIHJvb21faWQ6IHJvb20ucm9vbV9pZCxcbiAgICAgICAgdmlhX3NlcnZlcnM6IEFycmF5LmZyb20oaGllcmFyY2h5LnZpYU1hcC5nZXQocm9vbUlkKSB8fCBbXSksXG4gICAgICAgIG9vYl9kYXRhOiB7XG4gICAgICAgICAgICBhdmF0YXJVcmw6IHJvb20uYXZhdGFyX3VybCxcbiAgICAgICAgICAgIC8vIFhYWDogVGhpcyBsb2dpYyBpcyBkdXBsaWNhdGVkIGZyb20gdGhlIEpTIFNESyB3aGljaCB3b3VsZCBub3JtYWxseSBkZWNpZGUgd2hhdCB0aGUgbmFtZSBpcy5cbiAgICAgICAgICAgIG5hbWU6IHJvb20ubmFtZSB8fCByb29tQWxpYXMgfHwgX3QoXCJVbm5hbWVkIHJvb21cIiksXG4gICAgICAgICAgICByb29tVHlwZSxcbiAgICAgICAgfSBhcyBJT09CRGF0YSxcbiAgICAgICAgbWV0cmljc1RyaWdnZXI6IFwiUm9vbURpcmVjdG9yeVwiLFxuICAgIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGpvaW5Sb29tID0gKGNsaTogTWF0cml4Q2xpZW50LCBoaWVyYXJjaHk6IFJvb21IaWVyYXJjaHksIHJvb21JZDogc3RyaW5nKTogUHJvbWlzZTx1bmtub3duPiA9PiB7XG4gICAgLy8gRG9uJ3QgbGV0IHRoZSB1c2VyIHZpZXcgYSByb29tIHRoZXkgd29uJ3QgYmUgYWJsZSB0byBlaXRoZXIgcGVlayBvciBqb2luOlxuICAgIC8vIGZhaWwgZWFybGllciBzbyB0aGV5IGRvbid0IGhhdmUgdG8gY2xpY2sgYmFjayB0byB0aGUgZGlyZWN0b3J5LlxuICAgIGlmIChjbGkuaXNHdWVzdCgpKSB7XG4gICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoKHsgYWN0aW9uOiBcInJlcXVpcmVfcmVnaXN0cmF0aW9uXCIgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwcm9tID0gY2xpLmpvaW5Sb29tKHJvb21JZCwge1xuICAgICAgICB2aWFTZXJ2ZXJzOiBBcnJheS5mcm9tKGhpZXJhcmNoeS52aWFNYXAuZ2V0KHJvb21JZCkgfHwgW10pLFxuICAgIH0pO1xuXG4gICAgcHJvbS50aGVuKCgpID0+IHtcbiAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZGlzcGF0Y2g8Sm9pblJvb21SZWFkeVBheWxvYWQ+KHtcbiAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLkpvaW5Sb29tUmVhZHksXG4gICAgICAgICAgICByb29tSWQsXG4gICAgICAgICAgICBtZXRyaWNzVHJpZ2dlcjogXCJTcGFjZUhpZXJhcmNoeVwiLFxuICAgICAgICB9KTtcbiAgICB9LCBlcnIgPT4ge1xuICAgICAgICBSb29tVmlld1N0b3JlLmluc3RhbmNlLnNob3dKb2luUm9vbUVycm9yKGVyciwgcm9vbUlkKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBwcm9tO1xufTtcblxuaW50ZXJmYWNlIElIaWVyYXJjaHlMZXZlbFByb3BzIHtcbiAgICByb290OiBJSGllcmFyY2h5Um9vbTtcbiAgICByb29tU2V0OiBTZXQ8SUhpZXJhcmNoeVJvb20+O1xuICAgIGhpZXJhcmNoeTogUm9vbUhpZXJhcmNoeTtcbiAgICBwYXJlbnRzOiBTZXQ8c3RyaW5nPjtcbiAgICBzZWxlY3RlZE1hcD86IE1hcDxzdHJpbmcsIFNldDxzdHJpbmc+PjtcbiAgICBvblZpZXdSb29tQ2xpY2socm9vbUlkOiBzdHJpbmcsIHJvb21UeXBlPzogUm9vbVR5cGUpOiB2b2lkO1xuICAgIG9uSm9pblJvb21DbGljayhyb29tSWQ6IHN0cmluZyk6IFByb21pc2U8dW5rbm93bj47XG4gICAgb25Ub2dnbGVDbGljaz8ocGFyZW50SWQ6IHN0cmluZywgY2hpbGRJZDogc3RyaW5nKTogdm9pZDtcbn1cblxuY29uc3QgdG9Mb2NhbFJvb20gPSAoY2xpOiBNYXRyaXhDbGllbnQsIHJvb206IElIaWVyYXJjaHlSb29tKTogSUhpZXJhcmNoeVJvb20gPT4ge1xuICAgIGNvbnN0IGhpc3RvcnkgPSBjbGkuZ2V0Um9vbVVwZ3JhZGVIaXN0b3J5KHJvb20ucm9vbV9pZCwgdHJ1ZSk7XG4gICAgY29uc3QgY2xpUm9vbSA9IGhpc3RvcnlbaGlzdG9yeS5sZW5ndGggLSAxXTtcbiAgICBpZiAoY2xpUm9vbSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLi4ucm9vbSxcbiAgICAgICAgICAgIHJvb21faWQ6IGNsaVJvb20ucm9vbUlkLFxuICAgICAgICAgICAgcm9vbV90eXBlOiBjbGlSb29tLmdldFR5cGUoKSxcbiAgICAgICAgICAgIG5hbWU6IGNsaVJvb20ubmFtZSxcbiAgICAgICAgICAgIHRvcGljOiBjbGlSb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhFdmVudFR5cGUuUm9vbVRvcGljLCBcIlwiKT8uZ2V0Q29udGVudCgpLnRvcGljLFxuICAgICAgICAgICAgYXZhdGFyX3VybDogY2xpUm9vbS5nZXRNeGNBdmF0YXJVcmwoKSxcbiAgICAgICAgICAgIGNhbm9uaWNhbF9hbGlhczogY2xpUm9vbS5nZXRDYW5vbmljYWxBbGlhcygpLFxuICAgICAgICAgICAgYWxpYXNlczogY2xpUm9vbS5nZXRBbHRBbGlhc2VzKCksXG4gICAgICAgICAgICB3b3JsZF9yZWFkYWJsZTogY2xpUm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoRXZlbnRUeXBlLlJvb21IaXN0b3J5VmlzaWJpbGl0eSwgXCJcIik/LmdldENvbnRlbnQoKVxuICAgICAgICAgICAgICAgIC5oaXN0b3J5X3Zpc2liaWxpdHkgPT09IEhpc3RvcnlWaXNpYmlsaXR5LldvcmxkUmVhZGFibGUsXG4gICAgICAgICAgICBndWVzdF9jYW5fam9pbjogY2xpUm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoRXZlbnRUeXBlLlJvb21HdWVzdEFjY2VzcywgXCJcIik/LmdldENvbnRlbnQoKVxuICAgICAgICAgICAgICAgIC5ndWVzdF9hY2Nlc3MgPT09IEd1ZXN0QWNjZXNzLkNhbkpvaW4sXG4gICAgICAgICAgICBudW1fam9pbmVkX21lbWJlcnM6IGNsaVJvb20uZ2V0Sm9pbmVkTWVtYmVyQ291bnQoKSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gcm9vbTtcbn07XG5cbmV4cG9ydCBjb25zdCBIaWVyYXJjaHlMZXZlbCA9ICh7XG4gICAgcm9vdCxcbiAgICByb29tU2V0LFxuICAgIGhpZXJhcmNoeSxcbiAgICBwYXJlbnRzLFxuICAgIHNlbGVjdGVkTWFwLFxuICAgIG9uVmlld1Jvb21DbGljayxcbiAgICBvbkpvaW5Sb29tQ2xpY2ssXG4gICAgb25Ub2dnbGVDbGljayxcbn06IElIaWVyYXJjaHlMZXZlbFByb3BzKSA9PiB7XG4gICAgY29uc3QgY2xpID0gdXNlQ29udGV4dChNYXRyaXhDbGllbnRDb250ZXh0KTtcbiAgICBjb25zdCBzcGFjZSA9IGNsaS5nZXRSb29tKHJvb3Qucm9vbV9pZCk7XG4gICAgY29uc3QgaGFzUGVybWlzc2lvbnMgPSBzcGFjZT8uY3VycmVudFN0YXRlLm1heVNlbmRTdGF0ZUV2ZW50KEV2ZW50VHlwZS5TcGFjZUNoaWxkLCBjbGkuZ2V0VXNlcklkKCkpO1xuXG4gICAgY29uc3Qgc29ydGVkQ2hpbGRyZW4gPSBzb3J0Qnkocm9vdC5jaGlsZHJlbl9zdGF0ZSwgZXYgPT4ge1xuICAgICAgICByZXR1cm4gZ2V0Q2hpbGRPcmRlcihldi5jb250ZW50Lm9yZGVyLCBldi5vcmlnaW5fc2VydmVyX3RzLCBldi5zdGF0ZV9rZXkpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgW3N1YnNwYWNlcywgY2hpbGRSb29tc10gPSBzb3J0ZWRDaGlsZHJlbi5yZWR1Y2UoKHJlc3VsdCwgZXY6IElIaWVyYXJjaHlSZWxhdGlvbikgPT4ge1xuICAgICAgICBjb25zdCByb29tID0gaGllcmFyY2h5LnJvb21NYXAuZ2V0KGV2LnN0YXRlX2tleSk7XG4gICAgICAgIGlmIChyb29tICYmIHJvb21TZXQuaGFzKHJvb20pKSB7XG4gICAgICAgICAgICByZXN1bHRbcm9vbS5yb29tX3R5cGUgPT09IFJvb21UeXBlLlNwYWNlID8gMCA6IDFdLnB1c2godG9Mb2NhbFJvb20oY2xpLCByb29tKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCBbW10gYXMgSUhpZXJhcmNoeVJvb21bXSwgW10gYXMgSUhpZXJhcmNoeVJvb21bXV0pO1xuXG4gICAgY29uc3QgbmV3UGFyZW50cyA9IG5ldyBTZXQocGFyZW50cykuYWRkKHJvb3Qucm9vbV9pZCk7XG4gICAgcmV0dXJuIDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAge1xuICAgICAgICAgICAgdW5pcUJ5KGNoaWxkUm9vbXMsIFwicm9vbV9pZFwiKS5tYXAocm9vbSA9PiAoXG4gICAgICAgICAgICAgICAgPFRpbGVcbiAgICAgICAgICAgICAgICAgICAga2V5PXtyb29tLnJvb21faWR9XG4gICAgICAgICAgICAgICAgICAgIHJvb209e3Jvb219XG4gICAgICAgICAgICAgICAgICAgIHN1Z2dlc3RlZD17aGllcmFyY2h5LmlzU3VnZ2VzdGVkKHJvb3Qucm9vbV9pZCwgcm9vbS5yb29tX2lkKX1cbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQ9e3NlbGVjdGVkTWFwPy5nZXQocm9vdC5yb29tX2lkKT8uaGFzKHJvb20ucm9vbV9pZCl9XG4gICAgICAgICAgICAgICAgICAgIG9uVmlld1Jvb21DbGljaz17KCkgPT4gb25WaWV3Um9vbUNsaWNrKHJvb20ucm9vbV9pZCwgcm9vbS5yb29tX3R5cGUgYXMgUm9vbVR5cGUpfVxuICAgICAgICAgICAgICAgICAgICBvbkpvaW5Sb29tQ2xpY2s9eygpID0+IG9uSm9pblJvb21DbGljayhyb29tLnJvb21faWQpfVxuICAgICAgICAgICAgICAgICAgICBoYXNQZXJtaXNzaW9ucz17aGFzUGVybWlzc2lvbnN9XG4gICAgICAgICAgICAgICAgICAgIG9uVG9nZ2xlQ2xpY2s9e29uVG9nZ2xlQ2xpY2sgPyAoKSA9PiBvblRvZ2dsZUNsaWNrKHJvb3Qucm9vbV9pZCwgcm9vbS5yb29tX2lkKSA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKSlcbiAgICAgICAgfVxuXG4gICAgICAgIHtcbiAgICAgICAgICAgIHN1YnNwYWNlcy5maWx0ZXIocm9vbSA9PiAhbmV3UGFyZW50cy5oYXMocm9vbS5yb29tX2lkKSkubWFwKHNwYWNlID0+IChcbiAgICAgICAgICAgICAgICA8VGlsZVxuICAgICAgICAgICAgICAgICAgICBrZXk9e3NwYWNlLnJvb21faWR9XG4gICAgICAgICAgICAgICAgICAgIHJvb209e3NwYWNlfVxuICAgICAgICAgICAgICAgICAgICBudW1DaGlsZFJvb21zPXtzcGFjZS5jaGlsZHJlbl9zdGF0ZS5maWx0ZXIoZXYgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm9vbSA9IGhpZXJhcmNoeS5yb29tTWFwLmdldChldi5zdGF0ZV9rZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJvb20gJiYgcm9vbVNldC5oYXMocm9vbSkgJiYgIXJvb20ucm9vbV90eXBlO1xuICAgICAgICAgICAgICAgICAgICB9KS5sZW5ndGh9XG4gICAgICAgICAgICAgICAgICAgIHN1Z2dlc3RlZD17aGllcmFyY2h5LmlzU3VnZ2VzdGVkKHJvb3Qucm9vbV9pZCwgc3BhY2Uucm9vbV9pZCl9XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkPXtzZWxlY3RlZE1hcD8uZ2V0KHJvb3Qucm9vbV9pZCk/LmhhcyhzcGFjZS5yb29tX2lkKX1cbiAgICAgICAgICAgICAgICAgICAgb25WaWV3Um9vbUNsaWNrPXsoKSA9PiBvblZpZXdSb29tQ2xpY2soc3BhY2Uucm9vbV9pZCwgUm9vbVR5cGUuU3BhY2UpfVxuICAgICAgICAgICAgICAgICAgICBvbkpvaW5Sb29tQ2xpY2s9eygpID0+IG9uSm9pblJvb21DbGljayhzcGFjZS5yb29tX2lkKX1cbiAgICAgICAgICAgICAgICAgICAgaGFzUGVybWlzc2lvbnM9e2hhc1Blcm1pc3Npb25zfVxuICAgICAgICAgICAgICAgICAgICBvblRvZ2dsZUNsaWNrPXtvblRvZ2dsZUNsaWNrID8gKCkgPT4gb25Ub2dnbGVDbGljayhyb290LnJvb21faWQsIHNwYWNlLnJvb21faWQpIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPEhpZXJhcmNoeUxldmVsXG4gICAgICAgICAgICAgICAgICAgICAgICByb290PXtzcGFjZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb21TZXQ9e3Jvb21TZXR9XG4gICAgICAgICAgICAgICAgICAgICAgICBoaWVyYXJjaHk9e2hpZXJhcmNoeX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudHM9e25ld1BhcmVudHN9XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZE1hcD17c2VsZWN0ZWRNYXB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblZpZXdSb29tQ2xpY2s9e29uVmlld1Jvb21DbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uSm9pblJvb21DbGljaz17b25Kb2luUm9vbUNsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVDbGljaz17b25Ub2dnbGVDbGlja31cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L1RpbGU+XG4gICAgICAgICAgICApKVxuICAgICAgICB9XG4gICAgPC9SZWFjdC5GcmFnbWVudD47XG59O1xuXG5jb25zdCBJTklUSUFMX1BBR0VfU0laRSA9IDIwO1xuXG5leHBvcnQgY29uc3QgdXNlUm9vbUhpZXJhcmNoeSA9IChzcGFjZTogUm9vbSk6IHtcbiAgICBsb2FkaW5nOiBib29sZWFuO1xuICAgIHJvb21zPzogSUhpZXJhcmNoeVJvb21bXTtcbiAgICBoaWVyYXJjaHk6IFJvb21IaWVyYXJjaHk7XG4gICAgZXJyb3I6IEVycm9yO1xuICAgIGxvYWRNb3JlKHBhZ2VTaXplPzogbnVtYmVyKTogUHJvbWlzZTx2b2lkPjtcbn0gPT4ge1xuICAgIGNvbnN0IFtyb29tcywgc2V0Um9vbXNdID0gdXNlU3RhdGU8SUhpZXJhcmNoeVJvb21bXT4oW10pO1xuICAgIGNvbnN0IFtyb29tSGllcmFyY2h5LCBzZXRIaWVyYXJjaHldID0gdXNlU3RhdGU8Um9vbUhpZXJhcmNoeT4oKTtcbiAgICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlPEVycm9yIHwgdW5kZWZpbmVkPigpO1xuXG4gICAgY29uc3QgcmVzZXRIaWVyYXJjaHkgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldEVycm9yKHVuZGVmaW5lZCk7XG4gICAgICAgIGNvbnN0IGhpZXJhcmNoeSA9IG5ldyBSb29tSGllcmFyY2h5KHNwYWNlLCBJTklUSUFMX1BBR0VfU0laRSk7XG4gICAgICAgIGhpZXJhcmNoeS5sb2FkKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBpZiAoc3BhY2UgIT09IGhpZXJhcmNoeS5yb290KSByZXR1cm47IC8vIGRpc2NhcmQgc3RhbGUgcmVzdWx0c1xuICAgICAgICAgICAgc2V0Um9vbXMoaGllcmFyY2h5LnJvb21zKTtcbiAgICAgICAgfSwgc2V0RXJyb3IpO1xuICAgICAgICBzZXRIaWVyYXJjaHkoaGllcmFyY2h5KTtcbiAgICB9LCBbc3BhY2VdKTtcbiAgICB1c2VFZmZlY3QocmVzZXRIaWVyYXJjaHksIFtyZXNldEhpZXJhcmNoeV0pO1xuXG4gICAgdXNlRGlzcGF0Y2hlcihkZWZhdWx0RGlzcGF0Y2hlciwgKHBheWxvYWQgPT4ge1xuICAgICAgICBpZiAocGF5bG9hZC5hY3Rpb24gPT09IEFjdGlvbi5VcGRhdGVTcGFjZUhpZXJhcmNoeSkge1xuICAgICAgICAgICAgc2V0Um9vbXMoW10pOyAvLyBUT0RPXG4gICAgICAgICAgICByZXNldEhpZXJhcmNoeSgpO1xuICAgICAgICB9XG4gICAgfSkpO1xuXG4gICAgY29uc3QgbG9hZE1vcmUgPSB1c2VDYWxsYmFjayhhc3luYyAocGFnZVNpemU/OiBudW1iZXIpID0+IHtcbiAgICAgICAgaWYgKHJvb21IaWVyYXJjaHkubG9hZGluZyB8fCAhcm9vbUhpZXJhcmNoeS5jYW5Mb2FkTW9yZSB8fCByb29tSGllcmFyY2h5Lm5vU3VwcG9ydCB8fCBlcnJvcikgcmV0dXJuO1xuICAgICAgICBhd2FpdCByb29tSGllcmFyY2h5LmxvYWQocGFnZVNpemUpLmNhdGNoKHNldEVycm9yKTtcbiAgICAgICAgc2V0Um9vbXMocm9vbUhpZXJhcmNoeS5yb29tcyk7XG4gICAgfSwgW2Vycm9yLCByb29tSGllcmFyY2h5XSk7XG5cbiAgICAvLyBPbmx5IHJldHVybiB0aGUgaGllcmFyY2h5IGlmIGl0IGlzIGZvciB0aGUgc3BhY2UgcmVxdWVzdGVkXG4gICAgbGV0IGhpZXJhcmNoeSA9IHJvb21IaWVyYXJjaHk7XG4gICAgaWYgKGhpZXJhcmNoeT8ucm9vdCAhPT0gc3BhY2UpIHtcbiAgICAgICAgaGllcmFyY2h5ID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGxvYWRpbmc6IGhpZXJhcmNoeT8ubG9hZGluZyA/PyB0cnVlLFxuICAgICAgICByb29tcyxcbiAgICAgICAgaGllcmFyY2h5LFxuICAgICAgICBsb2FkTW9yZSxcbiAgICAgICAgZXJyb3IsXG4gICAgfTtcbn07XG5cbmNvbnN0IHVzZUludGVyc2VjdGlvbk9ic2VydmVyID0gKGNhbGxiYWNrOiAoKSA9PiB2b2lkKSA9PiB7XG4gICAgY29uc3QgaGFuZGxlT2JzZXJ2ZXIgPSAoZW50cmllczogSW50ZXJzZWN0aW9uT2JzZXJ2ZXJFbnRyeVtdKSA9PiB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGVudHJpZXNbMF07XG4gICAgICAgIGlmICh0YXJnZXQuaXNJbnRlcnNlY3RpbmcpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3Qgb2JzZXJ2ZXJSZWYgPSB1c2VSZWY8SW50ZXJzZWN0aW9uT2JzZXJ2ZXI+KCk7XG4gICAgcmV0dXJuIChlbGVtZW50OiBIVE1MRGl2RWxlbWVudCkgPT4ge1xuICAgICAgICBpZiAob2JzZXJ2ZXJSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgb2JzZXJ2ZXJSZWYuY3VycmVudC5kaXNjb25uZWN0KCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZWxlbWVudCkge1xuICAgICAgICAgICAgb2JzZXJ2ZXJSZWYuY3VycmVudCA9IG5ldyBJbnRlcnNlY3Rpb25PYnNlcnZlcihoYW5kbGVPYnNlcnZlciwge1xuICAgICAgICAgICAgICAgIHJvb3Q6IGVsZW1lbnQucGFyZW50RWxlbWVudCxcbiAgICAgICAgICAgICAgICByb290TWFyZ2luOiBcIjBweCAwcHggNjAwcHggMHB4XCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvYnNlcnZlclJlZi5jdXJyZW50ICYmIGVsZW1lbnQpIHtcbiAgICAgICAgICAgIG9ic2VydmVyUmVmLmN1cnJlbnQub2JzZXJ2ZShlbGVtZW50KTtcbiAgICAgICAgfVxuICAgIH07XG59O1xuXG5pbnRlcmZhY2UgSU1hbmFnZUJ1dHRvbnNQcm9wcyB7XG4gICAgaGllcmFyY2h5OiBSb29tSGllcmFyY2h5O1xuICAgIHNlbGVjdGVkOiBNYXA8c3RyaW5nLCBTZXQ8c3RyaW5nPj47XG4gICAgc2V0U2VsZWN0ZWQ6IERpc3BhdGNoPFNldFN0YXRlQWN0aW9uPE1hcDxzdHJpbmcsIFNldDxzdHJpbmc+Pj4+O1xuICAgIHNldEVycm9yOiBEaXNwYXRjaDxTZXRTdGF0ZUFjdGlvbjxzdHJpbmc+Pjtcbn1cblxuY29uc3QgTWFuYWdlQnV0dG9ucyA9ICh7IGhpZXJhcmNoeSwgc2VsZWN0ZWQsIHNldFNlbGVjdGVkLCBzZXRFcnJvciB9OiBJTWFuYWdlQnV0dG9uc1Byb3BzKSA9PiB7XG4gICAgY29uc3QgY2xpID0gdXNlQ29udGV4dChNYXRyaXhDbGllbnRDb250ZXh0KTtcblxuICAgIGNvbnN0IFtyZW1vdmluZywgc2V0UmVtb3ZpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFtzYXZpbmcsIHNldFNhdmluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG5cbiAgICBjb25zdCBzZWxlY3RlZFJlbGF0aW9ucyA9IEFycmF5LmZyb20oc2VsZWN0ZWQua2V5cygpKS5mbGF0TWFwKHBhcmVudElkID0+IHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIC4uLnNlbGVjdGVkLmdldChwYXJlbnRJZCkudmFsdWVzKCksXG4gICAgICAgIF0ubWFwKGNoaWxkSWQgPT4gW3BhcmVudElkLCBjaGlsZElkXSk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBzZWxlY3Rpb25BbGxTdWdnZXN0ZWQgPSBzZWxlY3RlZFJlbGF0aW9ucy5ldmVyeSgoW3BhcmVudElkLCBjaGlsZElkXSkgPT4ge1xuICAgICAgICByZXR1cm4gaGllcmFyY2h5LmlzU3VnZ2VzdGVkKHBhcmVudElkLCBjaGlsZElkKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGRpc2FibGVkID0gIXNlbGVjdGVkUmVsYXRpb25zLmxlbmd0aCB8fCByZW1vdmluZyB8fCBzYXZpbmc7XG5cbiAgICBsZXQgQnV0dG9uOiBSZWFjdC5Db21wb25lbnRUeXBlPFJlYWN0LkNvbXBvbmVudFByb3BzPHR5cGVvZiBBY2Nlc3NpYmxlQnV0dG9uPj4gPSBBY2Nlc3NpYmxlQnV0dG9uO1xuICAgIGxldCBwcm9wcyA9IHt9O1xuICAgIGlmICghc2VsZWN0ZWRSZWxhdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgIEJ1dHRvbiA9IEFjY2Vzc2libGVUb29sdGlwQnV0dG9uO1xuICAgICAgICBwcm9wcyA9IHtcbiAgICAgICAgICAgIHRvb2x0aXA6IF90KFwiU2VsZWN0IGEgcm9vbSBiZWxvdyBmaXJzdFwiKSxcbiAgICAgICAgICAgIGFsaWdubWVudDogQWxpZ25tZW50LlRvcCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gPD5cbiAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgey4uLnByb3BzfVxuICAgICAgICAgICAgb25DbGljaz17YXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHNldFJlbW92aW5nKHRydWUpO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJJZCA9IGNsaS5nZXRVc2VySWQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBbcGFyZW50SWQsIGNoaWxkSWRdIG9mIHNlbGVjdGVkUmVsYXRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBjbGkuc2VuZFN0YXRlRXZlbnQocGFyZW50SWQsIEV2ZW50VHlwZS5TcGFjZUNoaWxkLCB7fSwgY2hpbGRJZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlbW92ZSB0aGUgY2hpbGQtPnBhcmVudCByZWxhdGlvbiB0b28sIGlmIHdlIGhhdmUgcGVybWlzc2lvbiB0by5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkUm9vbSA9IGNsaS5nZXRSb29tKGNoaWxkSWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFyZW50UmVsYXRpb24gPSBjaGlsZFJvb20/LmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhFdmVudFR5cGUuU3BhY2VQYXJlbnQsIHBhcmVudElkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZFJvb20/LmN1cnJlbnRTdGF0ZS5tYXlTZW5kU3RhdGVFdmVudChFdmVudFR5cGUuU3BhY2VQYXJlbnQsIHVzZXJJZCkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBBcnJheS5pc0FycmF5KHBhcmVudFJlbGF0aW9uPy5nZXRDb250ZW50KCkudmlhKVxuICAgICAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgY2xpLnNlbmRTdGF0ZUV2ZW50KGNoaWxkSWQsIEV2ZW50VHlwZS5TcGFjZVBhcmVudCwge30sIHBhcmVudElkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgaGllcmFyY2h5LnJlbW92ZVJlbGF0aW9uKHBhcmVudElkLCBjaGlsZElkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0RXJyb3IoX3QoXCJGYWlsZWQgdG8gcmVtb3ZlIHNvbWUgcm9vbXMuIFRyeSBhZ2FpbiBsYXRlclwiKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNldFJlbW92aW5nKGZhbHNlKTtcbiAgICAgICAgICAgICAgICBzZXRTZWxlY3RlZChuZXcgTWFwKCkpO1xuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIGtpbmQ9XCJkYW5nZXJfb3V0bGluZVwiXG4gICAgICAgICAgICBkaXNhYmxlZD17ZGlzYWJsZWR9XG4gICAgICAgID5cbiAgICAgICAgICAgIHsgcmVtb3ZpbmcgPyBfdChcIlJlbW92aW5nLi4uXCIpIDogX3QoXCJSZW1vdmVcIikgfVxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgey4uLnByb3BzfVxuICAgICAgICAgICAgb25DbGljaz17YXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIHNldFNhdmluZyh0cnVlKTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IFtwYXJlbnRJZCwgY2hpbGRJZF0gb2Ygc2VsZWN0ZWRSZWxhdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN1Z2dlc3RlZCA9ICFzZWxlY3Rpb25BbGxTdWdnZXN0ZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZ0NvbnRlbnQgPSBoaWVyYXJjaHkuZ2V0UmVsYXRpb24ocGFyZW50SWQsIGNoaWxkSWQpPy5jb250ZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFleGlzdGluZ0NvbnRlbnQgfHwgZXhpc3RpbmdDb250ZW50LnN1Z2dlc3RlZCA9PT0gc3VnZ2VzdGVkKSBjb250aW51ZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29udGVudCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5leGlzdGluZ0NvbnRlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VnZ2VzdGVkOiAhc2VsZWN0aW9uQWxsU3VnZ2VzdGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgY2xpLnNlbmRTdGF0ZUV2ZW50KHBhcmVudElkLCBFdmVudFR5cGUuU3BhY2VDaGlsZCwgY29udGVudCwgY2hpbGRJZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG11dGF0ZSB0aGUgbG9jYWwgc3RhdGUgdG8gc2F2ZSB1cyBoYXZpbmcgdG8gcmVmZXRjaCB0aGUgd29ybGRcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nQ29udGVudC5zdWdnZXN0ZWQgPSBjb250ZW50LnN1Z2dlc3RlZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0RXJyb3IoXCJGYWlsZWQgdG8gdXBkYXRlIHNvbWUgc3VnZ2VzdGlvbnMuIFRyeSBhZ2FpbiBsYXRlclwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2V0U2F2aW5nKGZhbHNlKTtcbiAgICAgICAgICAgICAgICBzZXRTZWxlY3RlZChuZXcgTWFwKCkpO1xuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIGtpbmQ9XCJwcmltYXJ5X291dGxpbmVcIlxuICAgICAgICAgICAgZGlzYWJsZWQ9e2Rpc2FibGVkfVxuICAgICAgICA+XG4gICAgICAgICAgICB7IHNhdmluZ1xuICAgICAgICAgICAgICAgID8gX3QoXCJTYXZpbmcuLi5cIilcbiAgICAgICAgICAgICAgICA6IChzZWxlY3Rpb25BbGxTdWdnZXN0ZWQgPyBfdChcIk1hcmsgYXMgbm90IHN1Z2dlc3RlZFwiKSA6IF90KFwiTWFyayBhcyBzdWdnZXN0ZWRcIikpXG4gICAgICAgICAgICB9XG4gICAgICAgIDwvQnV0dG9uPlxuICAgIDwvPjtcbn07XG5cbmNvbnN0IFNwYWNlSGllcmFyY2h5ID0gKHtcbiAgICBzcGFjZSxcbiAgICBpbml0aWFsVGV4dCA9IFwiXCIsXG4gICAgc2hvd1Jvb20sXG4gICAgYWRkaXRpb25hbEJ1dHRvbnMsXG59OiBJUHJvcHMpID0+IHtcbiAgICBjb25zdCBjbGkgPSB1c2VDb250ZXh0KE1hdHJpeENsaWVudENvbnRleHQpO1xuICAgIGNvbnN0IFtxdWVyeSwgc2V0UXVlcnldID0gdXNlU3RhdGUoaW5pdGlhbFRleHQpO1xuXG4gICAgY29uc3QgW3NlbGVjdGVkLCBzZXRTZWxlY3RlZF0gPSB1c2VTdGF0ZShuZXcgTWFwPHN0cmluZywgU2V0PHN0cmluZz4+KCkpOyAvLyBNYXA8cGFyZW50SWQsIFNldDxjaGlsZElkPj5cblxuICAgIGNvbnN0IHsgbG9hZGluZywgcm9vbXMsIGhpZXJhcmNoeSwgbG9hZE1vcmUsIGVycm9yOiBoaWVyYXJjaHlFcnJvciB9ID0gdXNlUm9vbUhpZXJhcmNoeShzcGFjZSk7XG5cbiAgICBjb25zdCBmaWx0ZXJlZFJvb21TZXQgPSB1c2VNZW1vPFNldDxJSGllcmFyY2h5Um9vbT4+KCgpID0+IHtcbiAgICAgICAgaWYgKCFyb29tcz8ubGVuZ3RoKSByZXR1cm4gbmV3IFNldCgpO1xuICAgICAgICBjb25zdCBsY1F1ZXJ5ID0gcXVlcnkudG9Mb3dlckNhc2UoKS50cmltKCk7XG4gICAgICAgIGlmICghbGNRdWVyeSkgcmV0dXJuIG5ldyBTZXQocm9vbXMpO1xuXG4gICAgICAgIGNvbnN0IGRpcmVjdE1hdGNoZXMgPSByb29tcy5maWx0ZXIociA9PiB7XG4gICAgICAgICAgICByZXR1cm4gci5uYW1lPy50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGxjUXVlcnkpIHx8IHIudG9waWM/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMobGNRdWVyeSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFdhbGsgYmFjayB1cCB0aGUgdHJlZSB0byBmaW5kIGFsbCBwYXJlbnRzIG9mIHRoZSBkaXJlY3QgbWF0Y2hlcyB0byBzaG93IHRoZWlyIHBsYWNlIGluIHRoZSBoaWVyYXJjaHlcbiAgICAgICAgY29uc3QgdmlzaXRlZCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICBjb25zdCBxdWV1ZSA9IFsuLi5kaXJlY3RNYXRjaGVzLm1hcChyID0+IHIucm9vbV9pZCldO1xuICAgICAgICB3aGlsZSAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCByb29tSWQgPSBxdWV1ZS5wb3AoKTtcbiAgICAgICAgICAgIHZpc2l0ZWQuYWRkKHJvb21JZCk7XG4gICAgICAgICAgICBoaWVyYXJjaHkuYmFja1JlZnMuZ2V0KHJvb21JZCk/LmZvckVhY2gocGFyZW50SWQgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghdmlzaXRlZC5oYXMocGFyZW50SWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXVlLnB1c2gocGFyZW50SWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBTZXQocm9vbXMuZmlsdGVyKHIgPT4gdmlzaXRlZC5oYXMoci5yb29tX2lkKSkpO1xuICAgIH0sIFtyb29tcywgaGllcmFyY2h5LCBxdWVyeV0pO1xuXG4gICAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZShcIlwiKTtcbiAgICBsZXQgZXJyb3JUZXh0ID0gZXJyb3I7XG4gICAgaWYgKCFlcnJvciAmJiBoaWVyYXJjaHlFcnJvcikge1xuICAgICAgICBlcnJvclRleHQgPSBfdChcIkZhaWxlZCB0byBsb2FkIGxpc3Qgb2Ygcm9vbXMuXCIpO1xuICAgIH1cblxuICAgIGNvbnN0IGxvYWRlclJlZiA9IHVzZUludGVyc2VjdGlvbk9ic2VydmVyKGxvYWRNb3JlKTtcblxuICAgIGlmICghbG9hZGluZyAmJiBoaWVyYXJjaHkubm9TdXBwb3J0KSB7XG4gICAgICAgIHJldHVybiA8cD57IF90KFwiWW91ciBzZXJ2ZXIgZG9lcyBub3Qgc3VwcG9ydCBzaG93aW5nIHNwYWNlIGhpZXJhcmNoaWVzLlwiKSB9PC9wPjtcbiAgICB9XG5cbiAgICBjb25zdCBvbktleURvd24gPSAoZXY6IEtleWJvYXJkRXZlbnQsIHN0YXRlOiBJU3RhdGUpOiB2b2lkID0+IHtcbiAgICAgICAgY29uc3QgYWN0aW9uID0gZ2V0S2V5QmluZGluZ3NNYW5hZ2VyKCkuZ2V0QWNjZXNzaWJpbGl0eUFjdGlvbihldik7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIGFjdGlvbiA9PT0gS2V5QmluZGluZ0FjdGlvbi5BcnJvd0Rvd24gJiZcbiAgICAgICAgICAgIGV2LmN1cnJlbnRUYXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKFwibXhfU3BhY2VIaWVyYXJjaHlfc2VhcmNoXCIpXG4gICAgICAgICkge1xuICAgICAgICAgICAgc3RhdGUucmVmc1swXT8uY3VycmVudD8uZm9jdXMoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBvblRvZ2dsZUNsaWNrID0gKHBhcmVudElkOiBzdHJpbmcsIGNoaWxkSWQ6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgICAgICBzZXRFcnJvcihcIlwiKTtcbiAgICAgICAgaWYgKCFzZWxlY3RlZC5oYXMocGFyZW50SWQpKSB7XG4gICAgICAgICAgICBzZXRTZWxlY3RlZChuZXcgTWFwKHNlbGVjdGVkLnNldChwYXJlbnRJZCwgbmV3IFNldChbY2hpbGRJZF0pKSkpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcGFyZW50U2V0ID0gc2VsZWN0ZWQuZ2V0KHBhcmVudElkKTtcbiAgICAgICAgaWYgKCFwYXJlbnRTZXQuaGFzKGNoaWxkSWQpKSB7XG4gICAgICAgICAgICBzZXRTZWxlY3RlZChuZXcgTWFwKHNlbGVjdGVkLnNldChwYXJlbnRJZCwgbmV3IFNldChbLi4ucGFyZW50U2V0LCBjaGlsZElkXSkpKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBwYXJlbnRTZXQuZGVsZXRlKGNoaWxkSWQpO1xuICAgICAgICBzZXRTZWxlY3RlZChuZXcgTWFwKHNlbGVjdGVkLnNldChwYXJlbnRJZCwgbmV3IFNldChwYXJlbnRTZXQpKSkpO1xuICAgIH07XG5cbiAgICByZXR1cm4gPFJvdmluZ1RhYkluZGV4UHJvdmlkZXIgb25LZXlEb3duPXtvbktleURvd259IGhhbmRsZUhvbWVFbmQgaGFuZGxlVXBEb3duPlxuICAgICAgICB7ICh7IG9uS2V5RG93bkhhbmRsZXIgfSkgPT4ge1xuICAgICAgICAgICAgbGV0IGNvbnRlbnQ6IEpTWC5FbGVtZW50O1xuICAgICAgICAgICAgaWYgKGxvYWRpbmcgJiYgIXJvb21zPy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjb250ZW50ID0gPFNwaW5uZXIgLz47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGhhc1Blcm1pc3Npb25zID0gc3BhY2U/LmdldE15TWVtYmVyc2hpcCgpID09PSBcImpvaW5cIiAmJlxuICAgICAgICAgICAgICAgICAgICBzcGFjZS5jdXJyZW50U3RhdGUubWF5U2VuZFN0YXRlRXZlbnQoRXZlbnRUeXBlLlNwYWNlQ2hpbGQsIGNsaS5nZXRVc2VySWQoKSk7XG5cbiAgICAgICAgICAgICAgICBsZXQgcmVzdWx0czogSlNYLkVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgaWYgKGZpbHRlcmVkUm9vbVNldC5zaXplKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSA8PlxuICAgICAgICAgICAgICAgICAgICAgICAgPEhpZXJhcmNoeUxldmVsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdD17aGllcmFyY2h5LnJvb21NYXAuZ2V0KHNwYWNlLnJvb21JZCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbVNldD17ZmlsdGVyZWRSb29tU2V0fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpZXJhcmNoeT17aGllcmFyY2h5fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudHM9e25ldyBTZXQoKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZE1hcD17c2VsZWN0ZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVDbGljaz17aGFzUGVybWlzc2lvbnMgPyBvblRvZ2dsZUNsaWNrIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uVmlld1Jvb21DbGljaz17KHJvb21JZCwgcm9vbVR5cGUpID0+IHNob3dSb29tKGNsaSwgaGllcmFyY2h5LCByb29tSWQsIHJvb21UeXBlKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkpvaW5Sb29tQ2xpY2s9eyhyb29tSWQpID0+IGpvaW5Sb29tKGNsaSwgaGllcmFyY2h5LCByb29tSWQpfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC8+O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIWhpZXJhcmNoeS5jYW5Mb2FkTW9yZSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzID0gPGRpdiBjbGFzc05hbWU9XCJteF9TcGFjZUhpZXJhcmNoeV9ub1Jlc3VsdHNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxoMz57IF90KFwiTm8gcmVzdWx0cyBmb3VuZFwiKSB9PC9oMz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+eyBfdChcIllvdSBtYXkgd2FudCB0byB0cnkgYSBkaWZmZXJlbnQgc2VhcmNoIG9yIGNoZWNrIGZvciB0eXBvcy5cIikgfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IGxvYWRlcjogSlNYLkVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgaWYgKGhpZXJhcmNoeS5jYW5Mb2FkTW9yZSkge1xuICAgICAgICAgICAgICAgICAgICBsb2FkZXIgPSA8ZGl2IHJlZj17bG9hZGVyUmVmfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxTcGlubmVyIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb250ZW50ID0gPD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TcGFjZUhpZXJhcmNoeV9saXN0SGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aDQgY2xhc3NOYW1lPVwibXhfU3BhY2VIaWVyYXJjaHlfbGlzdEhlYWRlcl9oZWFkZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHF1ZXJ5LnRyaW0oKSA/IF90KFwiUmVzdWx0c1wiKSA6IF90KFwiUm9vbXMgYW5kIHNwYWNlc1wiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2g0PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TcGFjZUhpZXJhcmNoeV9saXN0SGVhZGVyX2J1dHRvbnNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGFkZGl0aW9uYWxCdXR0b25zIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGhhc1Blcm1pc3Npb25zICYmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPE1hbmFnZUJ1dHRvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhpZXJhcmNoeT17aGllcmFyY2h5fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQ9e3NlbGVjdGVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0U2VsZWN0ZWQ9e3NldFNlbGVjdGVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0RXJyb3I9e3NldEVycm9yfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICB7IGVycm9yVGV4dCAmJiA8ZGl2IGNsYXNzTmFtZT1cIm14X1NwYWNlSGllcmFyY2h5X2Vycm9yXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGVycm9yVGV4dCB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PiB9XG4gICAgICAgICAgICAgICAgICAgIDx1bFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfU3BhY2VIaWVyYXJjaHlfbGlzdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbktleURvd249e29uS2V5RG93bkhhbmRsZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICByb2xlPVwidHJlZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPXtfdChcIlNwYWNlXCIpfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHJlc3VsdHMgfVxuICAgICAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICAgICAgICB7IGxvYWRlciB9XG4gICAgICAgICAgICAgICAgPC8+O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gPD5cbiAgICAgICAgICAgICAgICA8U2VhcmNoQm94XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1NwYWNlSGllcmFyY2h5X3NlYXJjaCBteF90ZXh0aW5wdXRfaWNvbiBteF90ZXh0aW5wdXRfc2VhcmNoXCJcbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e190KFwiU2VhcmNoIG5hbWVzIGFuZCBkZXNjcmlwdGlvbnNcIil9XG4gICAgICAgICAgICAgICAgICAgIG9uU2VhcmNoPXtzZXRRdWVyeX1cbiAgICAgICAgICAgICAgICAgICAgYXV0b0ZvY3VzPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICBpbml0aWFsVmFsdWU9e2luaXRpYWxUZXh0fVxuICAgICAgICAgICAgICAgICAgICBvbktleURvd249e29uS2V5RG93bkhhbmRsZXJ9XG4gICAgICAgICAgICAgICAgLz5cblxuICAgICAgICAgICAgICAgIHsgY29udGVudCB9XG4gICAgICAgICAgICA8Lz47XG4gICAgICAgIH0gfVxuICAgIDwvUm92aW5nVGFiSW5kZXhQcm92aWRlcj47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBTcGFjZUhpZXJhcmNoeTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFjQTs7QUFDQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7OztBQW9CQSxNQUFNQSxJQUEwQixHQUFHLFFBVTdCO0VBQUEsSUFWOEI7SUFDaENDLElBRGdDO0lBRWhDQyxTQUZnQztJQUdoQ0MsUUFIZ0M7SUFJaENDLGNBSmdDO0lBS2hDQyxhQUxnQztJQU1oQ0MsZUFOZ0M7SUFPaENDLGVBUGdDO0lBUWhDQyxhQVJnQztJQVNoQ0M7RUFUZ0MsQ0FVOUI7RUFDRixNQUFNQyxHQUFHLEdBQUcsSUFBQUMsaUJBQUEsRUFBV0MsNEJBQVgsQ0FBWjtFQUNBLE1BQU0sQ0FBQ0MsVUFBRCxFQUFhQyxhQUFiLElBQThCLElBQUFDLGVBQUEsRUFBZSxNQUFNO0lBQ3JELE1BQU1DLE9BQU8sR0FBR04sR0FBRyxDQUFDTyxPQUFKLENBQVloQixJQUFJLENBQUNpQixPQUFqQixDQUFoQjtJQUNBLE9BQU9GLE9BQU8sRUFBRUcsZUFBVCxPQUErQixNQUEvQixHQUF3Q0gsT0FBeEMsR0FBa0QsSUFBekQ7RUFDSCxDQUhtQyxDQUFwQztFQUlBLE1BQU1JLGNBQWMsR0FBRyxJQUFBQywwQ0FBQSxFQUEwQlIsVUFBMUIsRUFBc0NTLGVBQUEsQ0FBVUMsSUFBaEQsRUFBc0R0QixJQUFJLElBQUlBLElBQUksRUFBRXVCLElBQXBFLENBQXZCO0VBQ0EsTUFBTUEsSUFBSSxHQUFHSixjQUFjLElBQUluQixJQUFJLENBQUN1QixJQUF2QixJQUErQnZCLElBQUksQ0FBQ3dCLGVBQXBDLElBQXVEeEIsSUFBSSxDQUFDeUIsT0FBTCxHQUFlLENBQWYsQ0FBdkQsS0FDTHpCLElBQUksQ0FBQzBCLFNBQUwsS0FBbUJDLGVBQUEsQ0FBU0MsS0FBNUIsR0FBb0MsSUFBQUMsbUJBQUEsRUFBRyxlQUFILENBQXBDLEdBQTBELElBQUFBLG1CQUFBLEVBQUcsY0FBSCxDQURyRCxDQUFiO0VBR0EsTUFBTSxDQUFDQyxZQUFELEVBQWVDLGtCQUFmLElBQXFDLElBQUFDLDhCQUFBLEVBQWUsSUFBZixDQUEzQztFQUNBLE1BQU0sQ0FBQ0MsT0FBRCxFQUFVQyxRQUFWLEVBQW9CQyxHQUFwQixJQUEyQixJQUFBQyxpQ0FBQSxHQUFqQztFQUNBLE1BQU0sQ0FBQ0MsSUFBRCxFQUFPQyxPQUFQLElBQWtCLElBQUF4QixlQUFBLEVBQVMsS0FBVCxDQUF4Qjs7RUFFQSxNQUFNeUIsY0FBYyxHQUFJQyxFQUFELElBQXFCO0lBQ3hDQSxFQUFFLENBQUNDLGNBQUg7SUFDQUQsRUFBRSxDQUFDRSxlQUFIO0lBQ0FyQyxlQUFlO0VBQ2xCLENBSkQ7O0VBS0EsTUFBTXNDLFdBQVcsR0FBRyxNQUFPSCxFQUFQLElBQTJCO0lBQzNDRixPQUFPLENBQUMsSUFBRCxDQUFQO0lBQ0FFLEVBQUUsQ0FBQ0MsY0FBSDtJQUNBRCxFQUFFLENBQUNFLGVBQUg7SUFDQXBDLGVBQWUsR0FBR3NDLElBQWxCLENBQXVCLE1BQU0sSUFBQUMsOEJBQUEsRUFBa0JwQyxHQUFsQixFQUF1QlQsSUFBSSxDQUFDaUIsT0FBNUIsQ0FBN0IsRUFBbUUyQixJQUFuRSxDQUF3RS9CLGFBQXhFLEVBQXVGaUMsT0FBdkYsQ0FBK0YsTUFBTTtNQUNqR1IsT0FBTyxDQUFDLEtBQUQsQ0FBUDtJQUNILENBRkQ7RUFHSCxDQVBEOztFQVNBLElBQUlTLE1BQUo7O0VBQ0EsSUFBSVYsSUFBSixFQUFVO0lBQ05VLE1BQU0sZ0JBQUcsNkJBQUMsZ0NBQUQ7TUFDTCxRQUFRLEVBQUUsSUFETDtNQUVMLE9BQU8sRUFBRUosV0FGSjtNQUdMLElBQUksRUFBQyxpQkFIQTtNQUlMLE9BQU8sRUFBRVYsT0FKSjtNQUtMLFFBQVEsRUFBRUMsUUFBUSxHQUFHLENBQUgsR0FBTyxDQUFDLENBTHJCO01BTUwsS0FBSyxFQUFFLElBQUFMLG1CQUFBLEVBQUcsU0FBSDtJQU5GLGdCQVFMLDZCQUFDLGdCQUFEO01BQVMsQ0FBQyxFQUFFLEVBQVo7TUFBZ0IsQ0FBQyxFQUFFO0lBQW5CLEVBUkssQ0FBVDtFQVVILENBWEQsTUFXTyxJQUFJakIsVUFBSixFQUFnQjtJQUNuQm1DLE1BQU0sZ0JBQUcsNkJBQUMseUJBQUQ7TUFDTCxPQUFPLEVBQUVSLGNBREo7TUFFTCxJQUFJLEVBQUMsaUJBRkE7TUFHTCxPQUFPLEVBQUVOLE9BSEo7TUFJTCxRQUFRLEVBQUVDLFFBQVEsR0FBRyxDQUFILEdBQU8sQ0FBQztJQUpyQixHQU1ILElBQUFMLG1CQUFBLEVBQUcsTUFBSCxDQU5HLENBQVQ7RUFRSCxDQVRNLE1BU0E7SUFDSGtCLE1BQU0sZ0JBQUcsNkJBQUMseUJBQUQ7TUFDTCxPQUFPLEVBQUVKLFdBREo7TUFFTCxJQUFJLEVBQUMsU0FGQTtNQUdMLE9BQU8sRUFBRVYsT0FISjtNQUlMLFFBQVEsRUFBRUMsUUFBUSxHQUFHLENBQUgsR0FBTyxDQUFDO0lBSnJCLEdBTUgsSUFBQUwsbUJBQUEsRUFBRyxNQUFILENBTkcsQ0FBVDtFQVFIOztFQUVELElBQUltQixRQUFKOztFQUNBLElBQUk1QyxhQUFKLEVBQW1CO0lBQ2YsSUFBSUQsY0FBSixFQUFvQjtNQUNoQjZDLFFBQVEsZ0JBQUcsNkJBQUMsdUJBQUQ7UUFBZ0IsT0FBTyxFQUFFLENBQUMsQ0FBQzlDLFFBQTNCO1FBQXFDLFFBQVEsRUFBRUUsYUFBL0M7UUFBOEQsUUFBUSxFQUFFOEIsUUFBUSxHQUFHLENBQUgsR0FBTyxDQUFDO01BQXhGLEVBQVg7SUFDSCxDQUZELE1BRU87TUFDSGMsUUFBUSxnQkFBRyw2QkFBQyx3QkFBRDtRQUNQLE9BQU8sRUFBRSxJQUFBbkIsbUJBQUEsRUFBRywyQkFBSCxDQURGO1FBRVAsT0FBTyxFQUFFVyxFQUFFLElBQUk7VUFBRUEsRUFBRSxDQUFDRSxlQUFIO1FBQXVCO01BRmpDLGdCQUlQLDZCQUFDLHVCQUFEO1FBQWdCLFFBQVEsRUFBRSxJQUExQjtRQUFnQyxRQUFRLEVBQUVSLFFBQVEsR0FBRyxDQUFILEdBQU8sQ0FBQztNQUExRCxFQUpPLENBQVg7SUFNSDtFQUNKOztFQUVELElBQUllLE1BQUo7O0VBQ0EsSUFBSXJDLFVBQUosRUFBZ0I7SUFDWnFDLE1BQU0sZ0JBQUcsNkJBQUMsbUJBQUQ7TUFBWSxJQUFJLEVBQUVyQyxVQUFsQjtNQUE4QixLQUFLLEVBQUUsRUFBckM7TUFBeUMsTUFBTSxFQUFFO0lBQWpELEVBQVQ7RUFDSCxDQUZELE1BRU87SUFDSHFDLE1BQU0sZ0JBQUcsNkJBQUMsbUJBQUQ7TUFDTCxJQUFJLEVBQUUxQixJQUREO01BRUwsTUFBTSxFQUFFdkIsSUFBSSxDQUFDaUIsT0FGUjtNQUdMLEdBQUcsRUFBRWpCLElBQUksQ0FBQ2tELFVBQUwsR0FBa0IsSUFBQUMsbUJBQUEsRUFBYW5ELElBQUksQ0FBQ2tELFVBQWxCLEVBQThCRSxzQkFBOUIsQ0FBcUQsRUFBckQsQ0FBbEIsR0FBNkUsSUFIN0U7TUFJTCxLQUFLLEVBQUUsRUFKRjtNQUtMLE1BQU0sRUFBRTtJQUxILEVBQVQ7RUFPSDs7RUFFRCxJQUFJQyxXQUFXLEdBQUcsSUFBQXhCLG1CQUFBLEVBQUcsbUJBQUgsRUFBd0I7SUFBRXlCLEtBQUssRUFBRXRELElBQUksQ0FBQ3VEO0VBQWQsQ0FBeEIsQ0FBbEI7O0VBQ0EsSUFBSWhELGFBQWEsS0FBS2lELFNBQXRCLEVBQWlDO0lBQzdCSCxXQUFXLElBQUksUUFBUSxJQUFBeEIsbUJBQUEsRUFBRyxpQkFBSCxFQUFzQjtNQUFFeUIsS0FBSyxFQUFFL0M7SUFBVCxDQUF0QixDQUF2QjtFQUNIOztFQUVELElBQUlrRCxLQUFKOztFQUNBLElBQUk3QyxVQUFKLEVBQWdCO0lBQ1osTUFBTThDLFFBQVEsR0FBRyxJQUFBQyxrQkFBQSxFQUFTL0MsVUFBVCxDQUFqQjtJQUNBNkMsS0FBSyxHQUFHLElBQUFHLHNCQUFBLEVBQVlGLFFBQVEsRUFBRUcsSUFBdEIsRUFBNEJILFFBQVEsRUFBRUksSUFBdEMsQ0FBUjtFQUNILENBSEQsTUFHTztJQUNITCxLQUFLLEdBQUd6RCxJQUFJLENBQUN5RCxLQUFiO0VBQ0g7O0VBRUQsSUFBSU0sYUFBSjs7RUFDQSxJQUFJbkQsVUFBSixFQUFnQjtJQUNabUQsYUFBYSxnQkFBRztNQUFLLFNBQVMsRUFBQztJQUFmLEdBQ1YsSUFBQWxDLG1CQUFBLEVBQUcsUUFBSCxDQURVLENBQWhCO0VBR0g7O0VBRUQsSUFBSW1DLGdCQUFKOztFQUNBLElBQUkvRCxTQUFTLEtBQUssQ0FBQ1csVUFBRCxJQUFlVCxjQUFwQixDQUFiLEVBQWtEO0lBQzlDNkQsZ0JBQWdCLGdCQUFHLDZCQUFDLG9CQUFEO01BQWEsT0FBTyxFQUFFLElBQUFuQyxtQkFBQSxFQUFHLDhDQUFIO0lBQXRCLEdBQ2IsSUFBQUEsbUJBQUEsRUFBRyxXQUFILENBRGEsQ0FBbkI7RUFHSDs7RUFFRCxNQUFNb0MsT0FBTyxnQkFBRyw2QkFBQyxjQUFELENBQU8sUUFBUCxxQkFDWjtJQUFLLFNBQVMsRUFBQztFQUFmLGdCQUNJO0lBQUssU0FBUyxFQUFDO0VBQWYsR0FDTWhCLE1BRE4sQ0FESixlQUlJO0lBQUssU0FBUyxFQUFDO0VBQWYsR0FDTTFCLElBRE4sRUFFTXdDLGFBRk4sRUFHTUMsZ0JBSE4sQ0FKSixlQVNJO0lBQ0ksU0FBUyxFQUFDLGlDQURkO0lBRUksR0FBRyxFQUFFRSxDQUFDLElBQUlBLENBQUMsSUFBSSxJQUFBQyx5QkFBQSxFQUFlRCxDQUFmLENBRm5CO0lBR0ksT0FBTyxFQUFFMUIsRUFBRSxJQUFJO01BQ1g7TUFDQSxJQUFLQSxFQUFFLENBQUM0QixNQUFKLENBQTJCQyxPQUEzQixLQUF1QyxHQUEzQyxFQUFnRDtRQUM1QzdCLEVBQUUsQ0FBQ0UsZUFBSDtNQUNIO0lBQ0o7RUFSTCxHQVVNVyxXQVZOLEVBV01JLEtBQUssSUFBSSxLQVhmLEVBWU1BLEtBWk4sQ0FUSixDQURZLGVBeUJaO0lBQUssU0FBUyxFQUFDO0VBQWYsR0FDTVYsTUFETixFQUVNQyxRQUZOLENBekJZLENBQWhCOztFQStCQSxJQUFJc0IsV0FBSjtFQUNBLElBQUlDLFlBQUo7RUFDQSxJQUFJQyxTQUFKOztFQUNBLElBQUloRSxRQUFKLEVBQWM7SUFDVjtJQUNBOEQsV0FBVyxnQkFBRztNQUNWLFNBQVMsRUFBRSxJQUFBRyxtQkFBQSxFQUFXLG1DQUFYLEVBQWdEO1FBQ3ZEQyx1Q0FBdUMsRUFBRTVDO01BRGMsQ0FBaEQsQ0FERDtNQUlWLE9BQU8sRUFBRVUsRUFBRSxJQUFJO1FBQ1hBLEVBQUUsQ0FBQ0UsZUFBSDtRQUNBWCxrQkFBa0I7TUFDckI7SUFQUyxFQUFkOztJQVVBLElBQUlELFlBQUosRUFBa0I7TUFDZCxNQUFNNkMsaUJBQWlCLEdBQUlULENBQUQsSUFBTztRQUM3QixNQUFNVSxNQUFNLEdBQUcsSUFBQUMseUNBQUEsSUFBd0JDLHNCQUF4QixDQUErQ1osQ0FBL0MsQ0FBZjs7UUFDQSxRQUFRVSxNQUFSO1VBQ0ksS0FBS0csbUNBQUEsQ0FBaUJDLFNBQXRCO1lBQ0lkLENBQUMsQ0FBQ3pCLGNBQUY7WUFDQXlCLENBQUMsQ0FBQ3hCLGVBQUY7WUFDQVAsR0FBRyxDQUFDOEMsT0FBSixFQUFhQyxLQUFiO1lBQ0E7UUFMUjtNQU9ILENBVEQ7O01BV0FYLFlBQVksZ0JBQUc7UUFDWCxTQUFTLEVBQUMscUNBREM7UUFFWCxTQUFTLEVBQUVJLGlCQUZBO1FBR1gsSUFBSSxFQUFDO01BSE0sR0FLVG5FLFFBTFMsQ0FBZjtJQU9IOztJQUVEZ0UsU0FBUyxHQUFJTixDQUFELElBQU87TUFDZixJQUFJaUIsT0FBTyxHQUFHLEtBQWQ7TUFFQSxNQUFNUCxNQUFNLEdBQUcsSUFBQUMseUNBQUEsSUFBd0JDLHNCQUF4QixDQUErQ1osQ0FBL0MsQ0FBZjs7TUFDQSxRQUFRVSxNQUFSO1FBQ0ksS0FBS0csbUNBQUEsQ0FBaUJDLFNBQXRCO1VBQ0ksSUFBSWxELFlBQUosRUFBa0I7WUFDZHFELE9BQU8sR0FBRyxJQUFWO1lBQ0FwRCxrQkFBa0I7VUFDckI7O1VBQ0Q7O1FBRUosS0FBS2dELG1DQUFBLENBQWlCSyxVQUF0QjtVQUNJRCxPQUFPLEdBQUcsSUFBVjs7VUFDQSxJQUFJckQsWUFBSixFQUFrQjtZQUNkLE1BQU15QyxZQUFZLEdBQUdwQyxHQUFHLENBQUM4QyxPQUFKLEVBQWFJLGtCQUFsQztZQUNBZCxZQUFZLEVBQUVlLGFBQWQsQ0FBNEMsNkJBQTVDLEdBQTRFSixLQUE1RTtVQUNILENBSEQsTUFHTztZQUNIbkQsa0JBQWtCO1VBQ3JCOztVQUNEO01BaEJSOztNQW1CQSxJQUFJb0QsT0FBSixFQUFhO1FBQ1RqQixDQUFDLENBQUN6QixjQUFGO1FBQ0F5QixDQUFDLENBQUN4QixlQUFGO01BQ0g7SUFDSixDQTNCRDtFQTRCSDs7RUFFRCxvQkFBTztJQUNILFNBQVMsRUFBQyxtQ0FEUDtJQUVILElBQUksRUFBQyxVQUZGO0lBR0gsaUJBQWVsQyxRQUFRLEdBQUdzQixZQUFILEdBQWtCMEI7RUFIdEMsZ0JBS0gsNkJBQUMseUJBQUQ7SUFDSSxTQUFTLEVBQUUsSUFBQWlCLG1CQUFBLEVBQVcsNEJBQVgsRUFBeUM7TUFDaERjLDBCQUEwQixFQUFFdkYsSUFBSSxDQUFDMEIsU0FBTCxLQUFtQkMsZUFBQSxDQUFTQyxLQURSO01BRWhENEQseUJBQXlCLEVBQUVuRDtJQUZxQixDQUF6QyxDQURmO0lBS0ksT0FBTyxFQUFHbEMsY0FBYyxJQUFJQyxhQUFuQixHQUFvQ0EsYUFBcEMsR0FBb0RtQyxjQUxqRTtJQU1JLFNBQVMsRUFBRWlDLFNBTmY7SUFPSSxRQUFRLEVBQUVyQyxHQVBkO0lBUUksT0FBTyxFQUFFRixPQVJiO0lBU0ksUUFBUSxFQUFFQyxRQUFRLEdBQUcsQ0FBSCxHQUFPLENBQUM7RUFUOUIsR0FXTStCLE9BWE4sRUFZTUssV0FaTixDQUxHLEVBbUJEQyxZQW5CQyxDQUFQO0FBcUJILENBbFBEOztBQW9QTyxNQUFNa0IsUUFBUSxHQUFHLENBQUNoRixHQUFELEVBQW9CaUYsU0FBcEIsRUFBOENDLE1BQTlDLEVBQThEQyxRQUE5RCxLQUE0RjtFQUNoSCxNQUFNNUYsSUFBSSxHQUFHMEYsU0FBUyxDQUFDRyxPQUFWLENBQWtCQyxHQUFsQixDQUFzQkgsTUFBdEIsQ0FBYixDQURnSCxDQUdoSDtFQUNBOztFQUNBLElBQUlsRixHQUFHLENBQUNzRixPQUFKLEVBQUosRUFBbUI7SUFDZixJQUFJLENBQUMvRixJQUFJLENBQUNnRyxjQUFOLElBQXdCLENBQUNoRyxJQUFJLENBQUNpRyxjQUFsQyxFQUFrRDtNQUM5Q0MsbUJBQUEsQ0FBa0JDLFFBQWxCLENBQTJCO1FBQUV2QixNQUFNLEVBQUU7TUFBVixDQUEzQjs7TUFDQTtJQUNIO0VBQ0o7O0VBRUQsTUFBTXdCLFNBQVMsR0FBRyxJQUFBQyxxQ0FBQSxFQUF1QnJHLElBQXZCLEtBQWdDd0QsU0FBbEQ7O0VBQ0EwQyxtQkFBQSxDQUFrQkMsUUFBbEIsQ0FBNEM7SUFDeEN2QixNQUFNLEVBQUUwQixlQUFBLENBQU9DLFFBRHlCO0lBRXhDQyxXQUFXLEVBQUUsSUFGMkI7SUFHeENDLFVBQVUsRUFBRUwsU0FINEI7SUFJeENuRixPQUFPLEVBQUVqQixJQUFJLENBQUNpQixPQUowQjtJQUt4Q3lGLFdBQVcsRUFBRUMsS0FBSyxDQUFDQyxJQUFOLENBQVdsQixTQUFTLENBQUNtQixNQUFWLENBQWlCZixHQUFqQixDQUFxQkgsTUFBckIsS0FBZ0MsRUFBM0MsQ0FMMkI7SUFNeENtQixRQUFRLEVBQUU7TUFDTkMsU0FBUyxFQUFFL0csSUFBSSxDQUFDa0QsVUFEVjtNQUVOO01BQ0EzQixJQUFJLEVBQUV2QixJQUFJLENBQUN1QixJQUFMLElBQWE2RSxTQUFiLElBQTBCLElBQUF2RSxtQkFBQSxFQUFHLGNBQUgsQ0FIMUI7TUFJTitEO0lBSk0sQ0FOOEI7SUFZeENvQixjQUFjLEVBQUU7RUFad0IsQ0FBNUM7QUFjSCxDQTNCTTs7OztBQTZCQSxNQUFNQyxRQUFRLEdBQUcsQ0FBQ3hHLEdBQUQsRUFBb0JpRixTQUFwQixFQUE4Q0MsTUFBOUMsS0FBbUY7RUFDdkc7RUFDQTtFQUNBLElBQUlsRixHQUFHLENBQUNzRixPQUFKLEVBQUosRUFBbUI7SUFDZkcsbUJBQUEsQ0FBa0JDLFFBQWxCLENBQTJCO01BQUV2QixNQUFNLEVBQUU7SUFBVixDQUEzQjs7SUFDQTtFQUNIOztFQUVELE1BQU1zQyxJQUFJLEdBQUd6RyxHQUFHLENBQUN3RyxRQUFKLENBQWF0QixNQUFiLEVBQXFCO0lBQzlCd0IsVUFBVSxFQUFFUixLQUFLLENBQUNDLElBQU4sQ0FBV2xCLFNBQVMsQ0FBQ21CLE1BQVYsQ0FBaUJmLEdBQWpCLENBQXFCSCxNQUFyQixLQUFnQyxFQUEzQztFQURrQixDQUFyQixDQUFiO0VBSUF1QixJQUFJLENBQUN0RSxJQUFMLENBQVUsTUFBTTtJQUNac0QsbUJBQUEsQ0FBa0JDLFFBQWxCLENBQWlEO01BQzdDdkIsTUFBTSxFQUFFMEIsZUFBQSxDQUFPYyxhQUQ4QjtNQUU3Q3pCLE1BRjZDO01BRzdDcUIsY0FBYyxFQUFFO0lBSDZCLENBQWpEO0VBS0gsQ0FORCxFQU1HSyxHQUFHLElBQUk7SUFDTkMsNEJBQUEsQ0FBY0MsUUFBZCxDQUF1QkMsaUJBQXZCLENBQXlDSCxHQUF6QyxFQUE4QzFCLE1BQTlDO0VBQ0gsQ0FSRDtFQVVBLE9BQU91QixJQUFQO0FBQ0gsQ0F2Qk07Ozs7QUFvQ1AsTUFBTU8sV0FBVyxHQUFHLENBQUNoSCxHQUFELEVBQW9CVCxJQUFwQixLQUE2RDtFQUM3RSxNQUFNMEgsT0FBTyxHQUFHakgsR0FBRyxDQUFDa0gscUJBQUosQ0FBMEIzSCxJQUFJLENBQUNpQixPQUEvQixFQUF3QyxJQUF4QyxDQUFoQjtFQUNBLE1BQU1GLE9BQU8sR0FBRzJHLE9BQU8sQ0FBQ0EsT0FBTyxDQUFDRSxNQUFSLEdBQWlCLENBQWxCLENBQXZCOztFQUNBLElBQUk3RyxPQUFKLEVBQWE7SUFDVCx1Q0FDT2YsSUFEUDtNQUVJaUIsT0FBTyxFQUFFRixPQUFPLENBQUM0RSxNQUZyQjtNQUdJakUsU0FBUyxFQUFFWCxPQUFPLENBQUM4RyxPQUFSLEVBSGY7TUFJSXRHLElBQUksRUFBRVIsT0FBTyxDQUFDUSxJQUpsQjtNQUtJa0MsS0FBSyxFQUFFMUMsT0FBTyxDQUFDK0csWUFBUixDQUFxQkMsY0FBckIsQ0FBb0NDLGdCQUFBLENBQVVDLFNBQTlDLEVBQXlELEVBQXpELEdBQThEQyxVQUE5RCxHQUEyRXpFLEtBTHRGO01BTUlQLFVBQVUsRUFBRW5DLE9BQU8sQ0FBQ29ILGVBQVIsRUFOaEI7TUFPSTNHLGVBQWUsRUFBRVQsT0FBTyxDQUFDcUgsaUJBQVIsRUFQckI7TUFRSTNHLE9BQU8sRUFBRVYsT0FBTyxDQUFDc0gsYUFBUixFQVJiO01BU0lyQyxjQUFjLEVBQUVqRixPQUFPLENBQUMrRyxZQUFSLENBQXFCQyxjQUFyQixDQUFvQ0MsZ0JBQUEsQ0FBVU0scUJBQTlDLEVBQXFFLEVBQXJFLEdBQTBFSixVQUExRSxHQUNYSyxrQkFEVyxLQUNZQywyQkFBQSxDQUFrQkMsYUFWbEQ7TUFXSXhDLGNBQWMsRUFBRWxGLE9BQU8sQ0FBQytHLFlBQVIsQ0FBcUJDLGNBQXJCLENBQW9DQyxnQkFBQSxDQUFVVSxlQUE5QyxFQUErRCxFQUEvRCxHQUFvRVIsVUFBcEUsR0FDWFMsWUFEVyxLQUNNQyxxQkFBQSxDQUFZQyxPQVp0QztNQWFJdEYsa0JBQWtCLEVBQUV4QyxPQUFPLENBQUMrSCxvQkFBUjtJQWJ4QjtFQWVIOztFQUVELE9BQU85SSxJQUFQO0FBQ0gsQ0F0QkQ7O0FBd0JPLE1BQU0rSSxjQUFjLEdBQUcsU0FTRjtFQUFBLElBVEc7SUFDM0JDLElBRDJCO0lBRTNCQyxPQUYyQjtJQUczQnZELFNBSDJCO0lBSTNCd0QsT0FKMkI7SUFLM0JDLFdBTDJCO0lBTTNCOUksZUFOMkI7SUFPM0JDLGVBUDJCO0lBUTNCRjtFQVIyQixDQVNIO0VBQ3hCLE1BQU1LLEdBQUcsR0FBRyxJQUFBQyxpQkFBQSxFQUFXQyw0QkFBWCxDQUFaO0VBQ0EsTUFBTXlJLEtBQUssR0FBRzNJLEdBQUcsQ0FBQ08sT0FBSixDQUFZZ0ksSUFBSSxDQUFDL0gsT0FBakIsQ0FBZDtFQUNBLE1BQU1kLGNBQWMsR0FBR2lKLEtBQUssRUFBRXRCLFlBQVAsQ0FBb0J1QixpQkFBcEIsQ0FBc0NyQixnQkFBQSxDQUFVc0IsVUFBaEQsRUFBNEQ3SSxHQUFHLENBQUM4SSxTQUFKLEVBQTVELENBQXZCO0VBRUEsTUFBTUMsY0FBYyxHQUFHLElBQUFDLGNBQUEsRUFBT1QsSUFBSSxDQUFDVSxjQUFaLEVBQTRCbEgsRUFBRSxJQUFJO0lBQ3JELE9BQU8sSUFBQW1ILHlCQUFBLEVBQWNuSCxFQUFFLENBQUN5QixPQUFILENBQVcyRixLQUF6QixFQUFnQ3BILEVBQUUsQ0FBQ3FILGdCQUFuQyxFQUFxRHJILEVBQUUsQ0FBQ3NILFNBQXhELENBQVA7RUFDSCxDQUZzQixDQUF2QjtFQUlBLE1BQU0sQ0FBQ0MsU0FBRCxFQUFZQyxVQUFaLElBQTBCUixjQUFjLENBQUNTLE1BQWYsQ0FBc0IsQ0FBQ0MsTUFBRCxFQUFTMUgsRUFBVCxLQUFvQztJQUN0RixNQUFNeEMsSUFBSSxHQUFHMEYsU0FBUyxDQUFDRyxPQUFWLENBQWtCQyxHQUFsQixDQUFzQnRELEVBQUUsQ0FBQ3NILFNBQXpCLENBQWI7O0lBQ0EsSUFBSTlKLElBQUksSUFBSWlKLE9BQU8sQ0FBQ2tCLEdBQVIsQ0FBWW5LLElBQVosQ0FBWixFQUErQjtNQUMzQmtLLE1BQU0sQ0FBQ2xLLElBQUksQ0FBQzBCLFNBQUwsS0FBbUJDLGVBQUEsQ0FBU0MsS0FBNUIsR0FBb0MsQ0FBcEMsR0FBd0MsQ0FBekMsQ0FBTixDQUFrRHdJLElBQWxELENBQXVEM0MsV0FBVyxDQUFDaEgsR0FBRCxFQUFNVCxJQUFOLENBQWxFO0lBQ0g7O0lBQ0QsT0FBT2tLLE1BQVA7RUFDSCxDQU4rQixFQU03QixDQUFDLEVBQUQsRUFBeUIsRUFBekIsQ0FONkIsQ0FBaEM7RUFRQSxNQUFNRyxVQUFVLEdBQUcsSUFBSUMsR0FBSixDQUFRcEIsT0FBUixFQUFpQnFCLEdBQWpCLENBQXFCdkIsSUFBSSxDQUFDL0gsT0FBMUIsQ0FBbkI7RUFDQSxvQkFBTyw2QkFBQyxjQUFELENBQU8sUUFBUCxRQUVDLElBQUF1SixjQUFBLEVBQU9SLFVBQVAsRUFBbUIsU0FBbkIsRUFBOEJTLEdBQTlCLENBQWtDekssSUFBSSxpQkFDbEMsNkJBQUMsSUFBRDtJQUNJLEdBQUcsRUFBRUEsSUFBSSxDQUFDaUIsT0FEZDtJQUVJLElBQUksRUFBRWpCLElBRlY7SUFHSSxTQUFTLEVBQUUwRixTQUFTLENBQUNnRixXQUFWLENBQXNCMUIsSUFBSSxDQUFDL0gsT0FBM0IsRUFBb0NqQixJQUFJLENBQUNpQixPQUF6QyxDQUhmO0lBSUksUUFBUSxFQUFFa0ksV0FBVyxFQUFFckQsR0FBYixDQUFpQmtELElBQUksQ0FBQy9ILE9BQXRCLEdBQWdDa0osR0FBaEMsQ0FBb0NuSyxJQUFJLENBQUNpQixPQUF6QyxDQUpkO0lBS0ksZUFBZSxFQUFFLE1BQU1aLGVBQWUsQ0FBQ0wsSUFBSSxDQUFDaUIsT0FBTixFQUFlakIsSUFBSSxDQUFDMEIsU0FBcEIsQ0FMMUM7SUFNSSxlQUFlLEVBQUUsTUFBTXBCLGVBQWUsQ0FBQ04sSUFBSSxDQUFDaUIsT0FBTixDQU4xQztJQU9JLGNBQWMsRUFBRWQsY0FQcEI7SUFRSSxhQUFhLEVBQUVDLGFBQWEsR0FBRyxNQUFNQSxhQUFhLENBQUM0SSxJQUFJLENBQUMvSCxPQUFOLEVBQWVqQixJQUFJLENBQUNpQixPQUFwQixDQUF0QixHQUFxRHVDO0VBUnJGLEVBREosQ0FGRCxFQWlCQ3VHLFNBQVMsQ0FBQ1ksTUFBVixDQUFpQjNLLElBQUksSUFBSSxDQUFDcUssVUFBVSxDQUFDRixHQUFYLENBQWVuSyxJQUFJLENBQUNpQixPQUFwQixDQUExQixFQUF3RHdKLEdBQXhELENBQTREckIsS0FBSyxpQkFDN0QsNkJBQUMsSUFBRDtJQUNJLEdBQUcsRUFBRUEsS0FBSyxDQUFDbkksT0FEZjtJQUVJLElBQUksRUFBRW1JLEtBRlY7SUFHSSxhQUFhLEVBQUVBLEtBQUssQ0FBQ00sY0FBTixDQUFxQmlCLE1BQXJCLENBQTRCbkksRUFBRSxJQUFJO01BQzdDLE1BQU14QyxJQUFJLEdBQUcwRixTQUFTLENBQUNHLE9BQVYsQ0FBa0JDLEdBQWxCLENBQXNCdEQsRUFBRSxDQUFDc0gsU0FBekIsQ0FBYjtNQUNBLE9BQU85SixJQUFJLElBQUlpSixPQUFPLENBQUNrQixHQUFSLENBQVluSyxJQUFaLENBQVIsSUFBNkIsQ0FBQ0EsSUFBSSxDQUFDMEIsU0FBMUM7SUFDSCxDQUhjLEVBR1prRyxNQU5QO0lBT0ksU0FBUyxFQUFFbEMsU0FBUyxDQUFDZ0YsV0FBVixDQUFzQjFCLElBQUksQ0FBQy9ILE9BQTNCLEVBQW9DbUksS0FBSyxDQUFDbkksT0FBMUMsQ0FQZjtJQVFJLFFBQVEsRUFBRWtJLFdBQVcsRUFBRXJELEdBQWIsQ0FBaUJrRCxJQUFJLENBQUMvSCxPQUF0QixHQUFnQ2tKLEdBQWhDLENBQW9DZixLQUFLLENBQUNuSSxPQUExQyxDQVJkO0lBU0ksZUFBZSxFQUFFLE1BQU1aLGVBQWUsQ0FBQytJLEtBQUssQ0FBQ25JLE9BQVAsRUFBZ0JVLGVBQUEsQ0FBU0MsS0FBekIsQ0FUMUM7SUFVSSxlQUFlLEVBQUUsTUFBTXRCLGVBQWUsQ0FBQzhJLEtBQUssQ0FBQ25JLE9BQVAsQ0FWMUM7SUFXSSxjQUFjLEVBQUVkLGNBWHBCO0lBWUksYUFBYSxFQUFFQyxhQUFhLEdBQUcsTUFBTUEsYUFBYSxDQUFDNEksSUFBSSxDQUFDL0gsT0FBTixFQUFlbUksS0FBSyxDQUFDbkksT0FBckIsQ0FBdEIsR0FBc0R1QztFQVp0RixnQkFjSSw2QkFBQyxjQUFEO0lBQ0ksSUFBSSxFQUFFNEYsS0FEVjtJQUVJLE9BQU8sRUFBRUgsT0FGYjtJQUdJLFNBQVMsRUFBRXZELFNBSGY7SUFJSSxPQUFPLEVBQUUyRSxVQUpiO0lBS0ksV0FBVyxFQUFFbEIsV0FMakI7SUFNSSxlQUFlLEVBQUU5SSxlQU5yQjtJQU9JLGVBQWUsRUFBRUMsZUFQckI7SUFRSSxhQUFhLEVBQUVGO0VBUm5CLEVBZEosQ0FESixDQWpCRCxDQUFQO0FBOENILENBekVNOzs7QUEyRVAsTUFBTXdLLGlCQUFpQixHQUFHLEVBQTFCOztBQUVPLE1BQU1DLGdCQUFnQixHQUFJekIsS0FBRCxJQU0zQjtFQUNELE1BQU0sQ0FBQzBCLEtBQUQsRUFBUUMsUUFBUixJQUFvQixJQUFBakssZUFBQSxFQUEyQixFQUEzQixDQUExQjtFQUNBLE1BQU0sQ0FBQ2tLLGFBQUQsRUFBZ0JDLFlBQWhCLElBQWdDLElBQUFuSyxlQUFBLEdBQXRDO0VBQ0EsTUFBTSxDQUFDb0ssS0FBRCxFQUFRQyxRQUFSLElBQW9CLElBQUFySyxlQUFBLEdBQTFCO0VBRUEsTUFBTXNLLGNBQWMsR0FBRyxJQUFBQyxrQkFBQSxFQUFZLE1BQU07SUFDckNGLFFBQVEsQ0FBQzNILFNBQUQsQ0FBUjtJQUNBLE1BQU1rQyxTQUFTLEdBQUcsSUFBSTRGLDRCQUFKLENBQWtCbEMsS0FBbEIsRUFBeUJ3QixpQkFBekIsQ0FBbEI7SUFDQWxGLFNBQVMsQ0FBQzZGLElBQVYsR0FBaUIzSSxJQUFqQixDQUFzQixNQUFNO01BQ3hCLElBQUl3RyxLQUFLLEtBQUsxRCxTQUFTLENBQUNzRCxJQUF4QixFQUE4QixPQUROLENBQ2M7O01BQ3RDK0IsUUFBUSxDQUFDckYsU0FBUyxDQUFDb0YsS0FBWCxDQUFSO0lBQ0gsQ0FIRCxFQUdHSyxRQUhIO0lBSUFGLFlBQVksQ0FBQ3ZGLFNBQUQsQ0FBWjtFQUNILENBUnNCLEVBUXBCLENBQUMwRCxLQUFELENBUm9CLENBQXZCO0VBU0EsSUFBQW9DLGdCQUFBLEVBQVVKLGNBQVYsRUFBMEIsQ0FBQ0EsY0FBRCxDQUExQjtFQUVBLElBQUFLLDRCQUFBLEVBQWN2RixtQkFBZCxFQUFrQ3dGLE9BQU8sSUFBSTtJQUN6QyxJQUFJQSxPQUFPLENBQUM5RyxNQUFSLEtBQW1CMEIsZUFBQSxDQUFPcUYsb0JBQTlCLEVBQW9EO01BQ2hEWixRQUFRLENBQUMsRUFBRCxDQUFSLENBRGdELENBQ2xDOztNQUNkSyxjQUFjO0lBQ2pCO0VBQ0osQ0FMRDtFQU9BLE1BQU1RLFFBQVEsR0FBRyxJQUFBUCxrQkFBQSxFQUFZLE1BQU9RLFFBQVAsSUFBNkI7SUFDdEQsSUFBSWIsYUFBYSxDQUFDYyxPQUFkLElBQXlCLENBQUNkLGFBQWEsQ0FBQ2UsV0FBeEMsSUFBdURmLGFBQWEsQ0FBQ2dCLFNBQXJFLElBQWtGZCxLQUF0RixFQUE2RjtJQUM3RixNQUFNRixhQUFhLENBQUNPLElBQWQsQ0FBbUJNLFFBQW5CLEVBQTZCSSxLQUE3QixDQUFtQ2QsUUFBbkMsQ0FBTjtJQUNBSixRQUFRLENBQUNDLGFBQWEsQ0FBQ0YsS0FBZixDQUFSO0VBQ0gsQ0FKZ0IsRUFJZCxDQUFDSSxLQUFELEVBQVFGLGFBQVIsQ0FKYyxDQUFqQixDQXZCQyxDQTZCRDs7RUFDQSxJQUFJdEYsU0FBUyxHQUFHc0YsYUFBaEI7O0VBQ0EsSUFBSXRGLFNBQVMsRUFBRXNELElBQVgsS0FBb0JJLEtBQXhCLEVBQStCO0lBQzNCMUQsU0FBUyxHQUFHbEMsU0FBWjtFQUNIOztFQUVELE9BQU87SUFDSHNJLE9BQU8sRUFBRXBHLFNBQVMsRUFBRW9HLE9BQVgsSUFBc0IsSUFENUI7SUFFSGhCLEtBRkc7SUFHSHBGLFNBSEc7SUFJSGtHLFFBSkc7SUFLSFY7RUFMRyxDQUFQO0FBT0gsQ0FoRE07Ozs7QUFrRFAsTUFBTWdCLHVCQUF1QixHQUFJQyxRQUFELElBQTBCO0VBQ3RELE1BQU1DLGNBQWMsR0FBSUMsT0FBRCxJQUEwQztJQUM3RCxNQUFNakksTUFBTSxHQUFHaUksT0FBTyxDQUFDLENBQUQsQ0FBdEI7O0lBQ0EsSUFBSWpJLE1BQU0sQ0FBQ2tJLGNBQVgsRUFBMkI7TUFDdkJILFFBQVE7SUFDWDtFQUNKLENBTEQ7O0VBT0EsTUFBTUksV0FBVyxHQUFHLElBQUFDLGFBQUEsR0FBcEI7RUFDQSxPQUFRQyxPQUFELElBQTZCO0lBQ2hDLElBQUlGLFdBQVcsQ0FBQ3RILE9BQWhCLEVBQXlCO01BQ3JCc0gsV0FBVyxDQUFDdEgsT0FBWixDQUFvQnlILFVBQXBCO0lBQ0gsQ0FGRCxNQUVPLElBQUlELE9BQUosRUFBYTtNQUNoQkYsV0FBVyxDQUFDdEgsT0FBWixHQUFzQixJQUFJMEgsb0JBQUosQ0FBeUJQLGNBQXpCLEVBQXlDO1FBQzNEcEQsSUFBSSxFQUFFeUQsT0FBTyxDQUFDRyxhQUQ2QztRQUUzREMsVUFBVSxFQUFFO01BRitDLENBQXpDLENBQXRCO0lBSUg7O0lBRUQsSUFBSU4sV0FBVyxDQUFDdEgsT0FBWixJQUF1QndILE9BQTNCLEVBQW9DO01BQ2hDRixXQUFXLENBQUN0SCxPQUFaLENBQW9CNkgsT0FBcEIsQ0FBNEJMLE9BQTVCO0lBQ0g7RUFDSixDQWJEO0FBY0gsQ0F2QkQ7O0FBZ0NBLE1BQU1NLGFBQWEsR0FBRyxTQUF5RTtFQUFBLElBQXhFO0lBQUVySCxTQUFGO0lBQWF4RixRQUFiO0lBQXVCOE0sV0FBdkI7SUFBb0M3QjtFQUFwQyxDQUF3RTtFQUMzRixNQUFNMUssR0FBRyxHQUFHLElBQUFDLGlCQUFBLEVBQVdDLDRCQUFYLENBQVo7RUFFQSxNQUFNLENBQUNzTSxRQUFELEVBQVdDLFdBQVgsSUFBMEIsSUFBQXBNLGVBQUEsRUFBUyxLQUFULENBQWhDO0VBQ0EsTUFBTSxDQUFDcU0sTUFBRCxFQUFTQyxTQUFULElBQXNCLElBQUF0TSxlQUFBLEVBQVMsS0FBVCxDQUE1QjtFQUVBLE1BQU11TSxpQkFBaUIsR0FBRzFHLEtBQUssQ0FBQ0MsSUFBTixDQUFXMUcsUUFBUSxDQUFDb04sSUFBVCxFQUFYLEVBQTRCQyxPQUE1QixDQUFvQ0MsUUFBUSxJQUFJO0lBQ3RFLE9BQU8sQ0FDSCxHQUFHdE4sUUFBUSxDQUFDNEYsR0FBVCxDQUFhMEgsUUFBYixFQUF1QkMsTUFBdkIsRUFEQSxFQUVMaEQsR0FGSyxDQUVEaUQsT0FBTyxJQUFJLENBQUNGLFFBQUQsRUFBV0UsT0FBWCxDQUZWLENBQVA7RUFHSCxDQUp5QixDQUExQjtFQU1BLE1BQU1DLHFCQUFxQixHQUFHTixpQkFBaUIsQ0FBQ08sS0FBbEIsQ0FBd0IsU0FBeUI7SUFBQSxJQUF4QixDQUFDSixRQUFELEVBQVdFLE9BQVgsQ0FBd0I7SUFDM0UsT0FBT2hJLFNBQVMsQ0FBQ2dGLFdBQVYsQ0FBc0I4QyxRQUF0QixFQUFnQ0UsT0FBaEMsQ0FBUDtFQUNILENBRjZCLENBQTlCO0VBSUEsTUFBTUcsUUFBUSxHQUFHLENBQUNSLGlCQUFpQixDQUFDekYsTUFBbkIsSUFBNkJxRixRQUE3QixJQUF5Q0UsTUFBMUQ7RUFFQSxJQUFJVyxNQUEwRSxHQUFHQyx5QkFBakY7RUFDQSxJQUFJQyxLQUFLLEdBQUcsRUFBWjs7RUFDQSxJQUFJLENBQUNYLGlCQUFpQixDQUFDekYsTUFBdkIsRUFBK0I7SUFDM0JrRyxNQUFNLEdBQUdHLGdDQUFUO0lBQ0FELEtBQUssR0FBRztNQUNKRSxPQUFPLEVBQUUsSUFBQXJNLG1CQUFBLEVBQUcsMkJBQUgsQ0FETDtNQUVKc00sU0FBUyxFQUFFQyxrQkFBQSxDQUFVQztJQUZqQixDQUFSO0VBSUg7O0VBRUQsb0JBQU8seUVBQ0gsNkJBQUMsTUFBRCw2QkFDUUwsS0FEUjtJQUVJLE9BQU8sRUFBRSxZQUFZO01BQ2pCZCxXQUFXLENBQUMsSUFBRCxDQUFYOztNQUNBLElBQUk7UUFDQSxNQUFNb0IsTUFBTSxHQUFHN04sR0FBRyxDQUFDOEksU0FBSixFQUFmOztRQUNBLEtBQUssTUFBTSxDQUFDaUUsUUFBRCxFQUFXRSxPQUFYLENBQVgsSUFBa0NMLGlCQUFsQyxFQUFxRDtVQUNqRCxNQUFNNU0sR0FBRyxDQUFDOE4sY0FBSixDQUFtQmYsUUFBbkIsRUFBNkJ4RixnQkFBQSxDQUFVc0IsVUFBdkMsRUFBbUQsRUFBbkQsRUFBdURvRSxPQUF2RCxDQUFOLENBRGlELENBR2pEOztVQUNBLE1BQU1jLFNBQVMsR0FBRy9OLEdBQUcsQ0FBQ08sT0FBSixDQUFZME0sT0FBWixDQUFsQjtVQUNBLE1BQU1lLGNBQWMsR0FBR0QsU0FBUyxFQUFFMUcsWUFBWCxDQUF3QkMsY0FBeEIsQ0FBdUNDLGdCQUFBLENBQVUwRyxXQUFqRCxFQUE4RGxCLFFBQTlELENBQXZCOztVQUNBLElBQUlnQixTQUFTLEVBQUUxRyxZQUFYLENBQXdCdUIsaUJBQXhCLENBQTBDckIsZ0JBQUEsQ0FBVTBHLFdBQXBELEVBQWlFSixNQUFqRSxLQUNBM0gsS0FBSyxDQUFDZ0ksT0FBTixDQUFjRixjQUFjLEVBQUV2RyxVQUFoQixHQUE2QjBHLEdBQTNDLENBREosRUFFRTtZQUNFLE1BQU1uTyxHQUFHLENBQUM4TixjQUFKLENBQW1CYixPQUFuQixFQUE0QjFGLGdCQUFBLENBQVUwRyxXQUF0QyxFQUFtRCxFQUFuRCxFQUF1RGxCLFFBQXZELENBQU47VUFDSDs7VUFFRDlILFNBQVMsQ0FBQ21KLGNBQVYsQ0FBeUJyQixRQUF6QixFQUFtQ0UsT0FBbkM7UUFDSDtNQUNKLENBaEJELENBZ0JFLE9BQU94SixDQUFQLEVBQVU7UUFDUmlILFFBQVEsQ0FBQyxJQUFBdEosbUJBQUEsRUFBRyw4Q0FBSCxDQUFELENBQVI7TUFDSDs7TUFDRHFMLFdBQVcsQ0FBQyxLQUFELENBQVg7TUFDQUYsV0FBVyxDQUFDLElBQUk4QixHQUFKLEVBQUQsQ0FBWDtJQUNILENBekJMO0lBMEJJLElBQUksRUFBQyxnQkExQlQ7SUEyQkksUUFBUSxFQUFFakI7RUEzQmQsSUE2Qk1aLFFBQVEsR0FBRyxJQUFBcEwsbUJBQUEsRUFBRyxhQUFILENBQUgsR0FBdUIsSUFBQUEsbUJBQUEsRUFBRyxRQUFILENBN0JyQyxDQURHLGVBZ0NILDZCQUFDLE1BQUQsNkJBQ1FtTSxLQURSO0lBRUksT0FBTyxFQUFFLFlBQVk7TUFDakJaLFNBQVMsQ0FBQyxJQUFELENBQVQ7O01BQ0EsSUFBSTtRQUNBLEtBQUssTUFBTSxDQUFDSSxRQUFELEVBQVdFLE9BQVgsQ0FBWCxJQUFrQ0wsaUJBQWxDLEVBQXFEO1VBQ2pELE1BQU1wTixTQUFTLEdBQUcsQ0FBQzBOLHFCQUFuQjtVQUNBLE1BQU1vQixlQUFlLEdBQUdySixTQUFTLENBQUNzSixXQUFWLENBQXNCeEIsUUFBdEIsRUFBZ0NFLE9BQWhDLEdBQTBDekosT0FBbEU7VUFDQSxJQUFJLENBQUM4SyxlQUFELElBQW9CQSxlQUFlLENBQUM5TyxTQUFoQixLQUE4QkEsU0FBdEQsRUFBaUU7O1VBRWpFLE1BQU1nRSxPQUFPLG1DQUNOOEssZUFETTtZQUVUOU8sU0FBUyxFQUFFLENBQUMwTjtVQUZILEVBQWI7O1VBS0EsTUFBTWxOLEdBQUcsQ0FBQzhOLGNBQUosQ0FBbUJmLFFBQW5CLEVBQTZCeEYsZ0JBQUEsQ0FBVXNCLFVBQXZDLEVBQW1EckYsT0FBbkQsRUFBNER5SixPQUE1RCxDQUFOLENBVmlELENBWWpEOztVQUNBcUIsZUFBZSxDQUFDOU8sU0FBaEIsR0FBNEJnRSxPQUFPLENBQUNoRSxTQUFwQztRQUNIO01BQ0osQ0FoQkQsQ0FnQkUsT0FBT2lFLENBQVAsRUFBVTtRQUNSaUgsUUFBUSxDQUFDLG9EQUFELENBQVI7TUFDSDs7TUFDRGlDLFNBQVMsQ0FBQyxLQUFELENBQVQ7TUFDQUosV0FBVyxDQUFDLElBQUk4QixHQUFKLEVBQUQsQ0FBWDtJQUNILENBekJMO0lBMEJJLElBQUksRUFBQyxpQkExQlQ7SUEyQkksUUFBUSxFQUFFakI7RUEzQmQsSUE2Qk1WLE1BQU0sR0FDRixJQUFBdEwsbUJBQUEsRUFBRyxXQUFILENBREUsR0FFRDhMLHFCQUFxQixHQUFHLElBQUE5TCxtQkFBQSxFQUFHLHVCQUFILENBQUgsR0FBaUMsSUFBQUEsbUJBQUEsRUFBRyxtQkFBSCxDQS9CakUsQ0FoQ0csQ0FBUDtBQW1FSCxDQS9GRDs7QUFpR0EsTUFBTW9OLGNBQWMsR0FBRyxTQUtUO0VBQUEsSUFMVTtJQUNwQjdGLEtBRG9CO0lBRXBCOEYsV0FBVyxHQUFHLEVBRk07SUFHcEJ6SixRQUhvQjtJQUlwQjBKO0VBSm9CLENBS1Y7RUFDVixNQUFNMU8sR0FBRyxHQUFHLElBQUFDLGlCQUFBLEVBQVdDLDRCQUFYLENBQVo7RUFDQSxNQUFNLENBQUN5TyxLQUFELEVBQVFDLFFBQVIsSUFBb0IsSUFBQXZPLGVBQUEsRUFBU29PLFdBQVQsQ0FBMUI7RUFFQSxNQUFNLENBQUNoUCxRQUFELEVBQVc4TSxXQUFYLElBQTBCLElBQUFsTSxlQUFBLEVBQVMsSUFBSWdPLEdBQUosRUFBVCxDQUFoQyxDQUpVLENBSWdFOztFQUUxRSxNQUFNO0lBQUVoRCxPQUFGO0lBQVdoQixLQUFYO0lBQWtCcEYsU0FBbEI7SUFBNkJrRyxRQUE3QjtJQUF1Q1YsS0FBSyxFQUFFb0U7RUFBOUMsSUFBaUV6RSxnQkFBZ0IsQ0FBQ3pCLEtBQUQsQ0FBdkY7RUFFQSxNQUFNbUcsZUFBZSxHQUFHLElBQUFDLGNBQUEsRUFBNkIsTUFBTTtJQUN2RCxJQUFJLENBQUMxRSxLQUFLLEVBQUVsRCxNQUFaLEVBQW9CLE9BQU8sSUFBSTBDLEdBQUosRUFBUDtJQUNwQixNQUFNbUYsT0FBTyxHQUFHTCxLQUFLLENBQUNNLFdBQU4sR0FBb0JDLElBQXBCLEVBQWhCO0lBQ0EsSUFBSSxDQUFDRixPQUFMLEVBQWMsT0FBTyxJQUFJbkYsR0FBSixDQUFRUSxLQUFSLENBQVA7SUFFZCxNQUFNOEUsYUFBYSxHQUFHOUUsS0FBSyxDQUFDSCxNQUFOLENBQWFrRixDQUFDLElBQUk7TUFDcEMsT0FBT0EsQ0FBQyxDQUFDdE8sSUFBRixFQUFRbU8sV0FBUixHQUFzQkksUUFBdEIsQ0FBK0JMLE9BQS9CLEtBQTJDSSxDQUFDLENBQUNwTSxLQUFGLEVBQVNpTSxXQUFULEdBQXVCSSxRQUF2QixDQUFnQ0wsT0FBaEMsQ0FBbEQ7SUFDSCxDQUZxQixDQUF0QixDQUx1RCxDQVN2RDs7SUFDQSxNQUFNTSxPQUFPLEdBQUcsSUFBSXpGLEdBQUosRUFBaEI7SUFDQSxNQUFNMEYsS0FBSyxHQUFHLENBQUMsR0FBR0osYUFBYSxDQUFDbkYsR0FBZCxDQUFrQm9GLENBQUMsSUFBSUEsQ0FBQyxDQUFDNU8sT0FBekIsQ0FBSixDQUFkOztJQUNBLE9BQU8rTyxLQUFLLENBQUNwSSxNQUFiLEVBQXFCO01BQ2pCLE1BQU1qQyxNQUFNLEdBQUdxSyxLQUFLLENBQUNDLEdBQU4sRUFBZjtNQUNBRixPQUFPLENBQUN4RixHQUFSLENBQVk1RSxNQUFaO01BQ0FELFNBQVMsQ0FBQ3dLLFFBQVYsQ0FBbUJwSyxHQUFuQixDQUF1QkgsTUFBdkIsR0FBZ0N3SyxPQUFoQyxDQUF3QzNDLFFBQVEsSUFBSTtRQUNoRCxJQUFJLENBQUN1QyxPQUFPLENBQUM1RixHQUFSLENBQVlxRCxRQUFaLENBQUwsRUFBNEI7VUFDeEJ3QyxLQUFLLENBQUM1RixJQUFOLENBQVdvRCxRQUFYO1FBQ0g7TUFDSixDQUpEO0lBS0g7O0lBRUQsT0FBTyxJQUFJbEQsR0FBSixDQUFRUSxLQUFLLENBQUNILE1BQU4sQ0FBYWtGLENBQUMsSUFBSUUsT0FBTyxDQUFDNUYsR0FBUixDQUFZMEYsQ0FBQyxDQUFDNU8sT0FBZCxDQUFsQixDQUFSLENBQVA7RUFDSCxDQXZCdUIsRUF1QnJCLENBQUM2SixLQUFELEVBQVFwRixTQUFSLEVBQW1CMEosS0FBbkIsQ0F2QnFCLENBQXhCO0VBeUJBLE1BQU0sQ0FBQ2xFLEtBQUQsRUFBUUMsUUFBUixJQUFvQixJQUFBckssZUFBQSxFQUFTLEVBQVQsQ0FBMUI7RUFDQSxJQUFJc1AsU0FBUyxHQUFHbEYsS0FBaEI7O0VBQ0EsSUFBSSxDQUFDQSxLQUFELElBQVVvRSxjQUFkLEVBQThCO0lBQzFCYyxTQUFTLEdBQUcsSUFBQXZPLG1CQUFBLEVBQUcsK0JBQUgsQ0FBWjtFQUNIOztFQUVELE1BQU13TyxTQUFTLEdBQUduRSx1QkFBdUIsQ0FBQ04sUUFBRCxDQUF6Qzs7RUFFQSxJQUFJLENBQUNFLE9BQUQsSUFBWXBHLFNBQVMsQ0FBQ3NHLFNBQTFCLEVBQXFDO0lBQ2pDLG9CQUFPLHdDQUFLLElBQUFuSyxtQkFBQSxFQUFHLHlEQUFILENBQUwsQ0FBUDtFQUNIOztFQUVELE1BQU0yQyxTQUFTLEdBQUcsQ0FBQ2hDLEVBQUQsRUFBb0I4TixLQUFwQixLQUE0QztJQUMxRCxNQUFNMUwsTUFBTSxHQUFHLElBQUFDLHlDQUFBLElBQXdCQyxzQkFBeEIsQ0FBK0N0QyxFQUEvQyxDQUFmOztJQUNBLElBQ0lvQyxNQUFNLEtBQUtHLG1DQUFBLENBQWlCd0wsU0FBNUIsSUFDQS9OLEVBQUUsQ0FBQ2dPLGFBQUgsQ0FBaUJDLFNBQWpCLENBQTJCQyxRQUEzQixDQUFvQywwQkFBcEMsQ0FGSixFQUdFO01BQ0VKLEtBQUssQ0FBQ0ssSUFBTixDQUFXLENBQVgsR0FBZTFMLE9BQWYsRUFBd0JDLEtBQXhCO0lBQ0g7RUFDSixDQVJEOztFQVVBLE1BQU05RSxhQUFhLEdBQUcsQ0FBQ29OLFFBQUQsRUFBbUJFLE9BQW5CLEtBQTZDO0lBQy9EdkMsUUFBUSxDQUFDLEVBQUQsQ0FBUjs7SUFDQSxJQUFJLENBQUNqTCxRQUFRLENBQUNpSyxHQUFULENBQWFxRCxRQUFiLENBQUwsRUFBNkI7TUFDekJSLFdBQVcsQ0FBQyxJQUFJOEIsR0FBSixDQUFRNU8sUUFBUSxDQUFDMFEsR0FBVCxDQUFhcEQsUUFBYixFQUF1QixJQUFJbEQsR0FBSixDQUFRLENBQUNvRCxPQUFELENBQVIsQ0FBdkIsQ0FBUixDQUFELENBQVg7TUFDQTtJQUNIOztJQUVELE1BQU1tRCxTQUFTLEdBQUczUSxRQUFRLENBQUM0RixHQUFULENBQWEwSCxRQUFiLENBQWxCOztJQUNBLElBQUksQ0FBQ3FELFNBQVMsQ0FBQzFHLEdBQVYsQ0FBY3VELE9BQWQsQ0FBTCxFQUE2QjtNQUN6QlYsV0FBVyxDQUFDLElBQUk4QixHQUFKLENBQVE1TyxRQUFRLENBQUMwUSxHQUFULENBQWFwRCxRQUFiLEVBQXVCLElBQUlsRCxHQUFKLENBQVEsQ0FBQyxHQUFHdUcsU0FBSixFQUFlbkQsT0FBZixDQUFSLENBQXZCLENBQVIsQ0FBRCxDQUFYO01BQ0E7SUFDSDs7SUFFRG1ELFNBQVMsQ0FBQ0MsTUFBVixDQUFpQnBELE9BQWpCO0lBQ0FWLFdBQVcsQ0FBQyxJQUFJOEIsR0FBSixDQUFRNU8sUUFBUSxDQUFDMFEsR0FBVCxDQUFhcEQsUUFBYixFQUF1QixJQUFJbEQsR0FBSixDQUFRdUcsU0FBUixDQUF2QixDQUFSLENBQUQsQ0FBWDtFQUNILENBZkQ7O0VBaUJBLG9CQUFPLDZCQUFDLHNDQUFEO0lBQXdCLFNBQVMsRUFBRXJNLFNBQW5DO0lBQThDLGFBQWEsTUFBM0Q7SUFBNEQsWUFBWTtFQUF4RSxHQUNELFNBQTBCO0lBQUEsSUFBekI7TUFBRXVNO0lBQUYsQ0FBeUI7SUFDeEIsSUFBSTlNLE9BQUo7O0lBQ0EsSUFBSTZILE9BQU8sSUFBSSxDQUFDaEIsS0FBSyxFQUFFbEQsTUFBdkIsRUFBK0I7TUFDM0IzRCxPQUFPLGdCQUFHLDZCQUFDLGdCQUFELE9BQVY7SUFDSCxDQUZELE1BRU87TUFDSCxNQUFNOUQsY0FBYyxHQUFHaUosS0FBSyxFQUFFbEksZUFBUCxPQUE2QixNQUE3QixJQUNuQmtJLEtBQUssQ0FBQ3RCLFlBQU4sQ0FBbUJ1QixpQkFBbkIsQ0FBcUNyQixnQkFBQSxDQUFVc0IsVUFBL0MsRUFBMkQ3SSxHQUFHLENBQUM4SSxTQUFKLEVBQTNELENBREo7TUFHQSxJQUFJeUgsT0FBSjs7TUFDQSxJQUFJekIsZUFBZSxDQUFDMEIsSUFBcEIsRUFBMEI7UUFDdEJELE9BQU8sZ0JBQUcseUVBQ04sNkJBQUMsY0FBRDtVQUNJLElBQUksRUFBRXRMLFNBQVMsQ0FBQ0csT0FBVixDQUFrQkMsR0FBbEIsQ0FBc0JzRCxLQUFLLENBQUN6RCxNQUE1QixDQURWO1VBRUksT0FBTyxFQUFFNEosZUFGYjtVQUdJLFNBQVMsRUFBRTdKLFNBSGY7VUFJSSxPQUFPLEVBQUUsSUFBSTRFLEdBQUosRUFKYjtVQUtJLFdBQVcsRUFBRXBLLFFBTGpCO1VBTUksYUFBYSxFQUFFQyxjQUFjLEdBQUdDLGFBQUgsR0FBbUJvRCxTQU5wRDtVQU9JLGVBQWUsRUFBRSxDQUFDbUMsTUFBRCxFQUFTQyxRQUFULEtBQXNCSCxRQUFRLENBQUNoRixHQUFELEVBQU1pRixTQUFOLEVBQWlCQyxNQUFqQixFQUF5QkMsUUFBekIsQ0FQbkQ7VUFRSSxlQUFlLEVBQUdELE1BQUQsSUFBWXNCLFFBQVEsQ0FBQ3hHLEdBQUQsRUFBTWlGLFNBQU4sRUFBaUJDLE1BQWpCO1FBUnpDLEVBRE0sQ0FBVjtNQVlILENBYkQsTUFhTyxJQUFJLENBQUNELFNBQVMsQ0FBQ3FHLFdBQWYsRUFBNEI7UUFDL0JpRixPQUFPLGdCQUFHO1VBQUssU0FBUyxFQUFDO1FBQWYsZ0JBQ04seUNBQU0sSUFBQW5QLG1CQUFBLEVBQUcsa0JBQUgsQ0FBTixDQURNLGVBRU4sMENBQU8sSUFBQUEsbUJBQUEsRUFBRyw0REFBSCxDQUFQLENBRk0sQ0FBVjtNQUlIOztNQUVELElBQUlxUCxNQUFKOztNQUNBLElBQUl4TCxTQUFTLENBQUNxRyxXQUFkLEVBQTJCO1FBQ3ZCbUYsTUFBTSxnQkFBRztVQUFLLEdBQUcsRUFBRWI7UUFBVixnQkFDTCw2QkFBQyxnQkFBRCxPQURLLENBQVQ7TUFHSDs7TUFFRHBNLE9BQU8sZ0JBQUcseUVBQ047UUFBSyxTQUFTLEVBQUM7TUFBZixnQkFDSTtRQUFJLFNBQVMsRUFBQztNQUFkLEdBQ01tTCxLQUFLLENBQUNPLElBQU4sS0FBZSxJQUFBOU4sbUJBQUEsRUFBRyxTQUFILENBQWYsR0FBK0IsSUFBQUEsbUJBQUEsRUFBRyxrQkFBSCxDQURyQyxDQURKLGVBSUk7UUFBSyxTQUFTLEVBQUM7TUFBZixHQUNNc04saUJBRE4sRUFFTWhQLGNBQWMsaUJBQ1osNkJBQUMsYUFBRDtRQUNJLFNBQVMsRUFBRXVGLFNBRGY7UUFFSSxRQUFRLEVBQUV4RixRQUZkO1FBR0ksV0FBVyxFQUFFOE0sV0FIakI7UUFJSSxRQUFRLEVBQUU3QjtNQUpkLEVBSFIsQ0FKSixDQURNLEVBaUJKaUYsU0FBUyxpQkFBSTtRQUFLLFNBQVMsRUFBQztNQUFmLEdBQ1RBLFNBRFMsQ0FqQlQsZUFvQk47UUFDSSxTQUFTLEVBQUMsd0JBRGQ7UUFFSSxTQUFTLEVBQUVXLGdCQUZmO1FBR0ksSUFBSSxFQUFDLE1BSFQ7UUFJSSxjQUFZLElBQUFsUCxtQkFBQSxFQUFHLE9BQUg7TUFKaEIsR0FNTW1QLE9BTk4sQ0FwQk0sRUE0QkpFLE1BNUJJLENBQVY7SUE4Qkg7O0lBRUQsb0JBQU8seUVBQ0gsNkJBQUMsa0JBQUQ7TUFDSSxTQUFTLEVBQUMsZ0VBRGQ7TUFFSSxXQUFXLEVBQUUsSUFBQXJQLG1CQUFBLEVBQUcsK0JBQUgsQ0FGakI7TUFHSSxRQUFRLEVBQUV3TixRQUhkO01BSUksU0FBUyxFQUFFLElBSmY7TUFLSSxZQUFZLEVBQUVILFdBTGxCO01BTUksU0FBUyxFQUFFNkI7SUFOZixFQURHLEVBVUQ5TSxPQVZDLENBQVA7RUFZSCxDQWpGRSxDQUFQO0FBbUZILENBaEtEOztlQWtLZWdMLGMifQ==