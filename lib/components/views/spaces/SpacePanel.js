"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.HomeButtonContextMenu = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireWildcard(require("react"));

var _reactBeautifulDnd = require("react-beautiful-dnd");

var _classnames = _interopRequireDefault(require("classnames"));

var _languageHandler = require("../../../languageHandler");

var _ContextMenu = require("../../structures/ContextMenu");

var _SpaceCreateMenu = _interopRequireDefault(require("./SpaceCreateMenu"));

var _SpaceTreeLevel = require("./SpaceTreeLevel");

var _AccessibleTooltipButton = _interopRequireDefault(require("../elements/AccessibleTooltipButton"));

var _useEventEmitter = require("../../../hooks/useEventEmitter");

var _SpaceStore = _interopRequireDefault(require("../../../stores/spaces/SpaceStore"));

var _spaces = require("../../../stores/spaces");

var _RovingTabIndex = require("../../../accessibility/RovingTabIndex");

var _RoomNotificationStateStore = require("../../../stores/notifications/RoomNotificationStateStore");

var _IconizedContextMenu = _interopRequireWildcard(require("../context_menus/IconizedContextMenu"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _SettingLevel = require("../../../settings/SettingLevel");

var _UIStore = _interopRequireDefault(require("../../../stores/UIStore"));

var _QuickSettingsButton = _interopRequireDefault(require("./QuickSettingsButton"));

var _useSettings = require("../../../hooks/useSettings");

var _UserMenu = _interopRequireDefault(require("../../structures/UserMenu"));

var _IndicatorScrollbar = _interopRequireDefault(require("../../structures/IndicatorScrollbar"));

var _Keyboard = require("../../../Keyboard");

var _useDispatcher = require("../../../hooks/useDispatcher");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _actions = require("../../../dispatcher/actions");

var _KeyboardShortcuts = require("../../../accessibility/KeyboardShortcuts");

var _UIComponents = require("../../../customisations/helpers/UIComponents");

var _UIFeature = require("../../../settings/UIFeature");

const _excluded = ["onFinished", "hideHeader"],
      _excluded2 = ["selected", "isPanelCollapsed"],
      _excluded3 = ["children", "isPanelCollapsed", "setPanelCollapsed", "isDraggingOver", "innerRef"];

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const useSpaces = () => {
  const invites = (0, _useEventEmitter.useEventEmitterState)(_SpaceStore.default.instance, _spaces.UPDATE_INVITED_SPACES, () => {
    return _SpaceStore.default.instance.invitedSpaces;
  });
  const [metaSpaces, actualSpaces] = (0, _useEventEmitter.useEventEmitterState)(_SpaceStore.default.instance, _spaces.UPDATE_TOP_LEVEL_SPACES, () => [_SpaceStore.default.instance.enabledMetaSpaces, _SpaceStore.default.instance.spacePanelSpaces]);
  const activeSpace = (0, _useEventEmitter.useEventEmitterState)(_SpaceStore.default.instance, _spaces.UPDATE_SELECTED_SPACE, () => {
    return _SpaceStore.default.instance.activeSpace;
  });
  return [invites, metaSpaces, actualSpaces, activeSpace];
};

const HomeButtonContextMenu = _ref => {
  let {
    onFinished,
    hideHeader
  } = _ref,
      props = (0, _objectWithoutProperties2.default)(_ref, _excluded);
  const allRoomsInHome = (0, _useSettings.useSettingValue)("Spaces.allRoomsInHome");
  return /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.default, (0, _extends2.default)({}, props, {
    onFinished: onFinished,
    className: "mx_SpacePanel_contextMenu",
    compact: true
  }), !hideHeader && /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpacePanel_contextMenu_header"
  }, (0, _languageHandler._t)("Home")), /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuOptionList, {
    first: true
  }, /*#__PURE__*/_react.default.createElement(_IconizedContextMenu.IconizedContextMenuCheckbox, {
    iconClassName: "mx_SpacePanel_noIcon",
    label: (0, _languageHandler._t)("Show all rooms"),
    active: allRoomsInHome,
    onClick: () => {
      _SettingsStore.default.setValue("Spaces.allRoomsInHome", null, _SettingLevel.SettingLevel.ACCOUNT, !allRoomsInHome);
    }
  })));
};

exports.HomeButtonContextMenu = HomeButtonContextMenu;

const MetaSpaceButton = _ref2 => {
  let {
    selected,
    isPanelCollapsed
  } = _ref2,
      props = (0, _objectWithoutProperties2.default)(_ref2, _excluded2);
  return /*#__PURE__*/_react.default.createElement("li", {
    className: (0, _classnames.default)("mx_SpaceItem", {
      "collapsed": isPanelCollapsed
    }),
    role: "treeitem",
    "aria-selected": selected
  }, /*#__PURE__*/_react.default.createElement(_SpaceTreeLevel.SpaceButton, (0, _extends2.default)({}, props, {
    selected: selected,
    isNarrow: isPanelCollapsed
  })));
};

const getHomeNotificationState = () => {
  return _SpaceStore.default.instance.allRoomsInHome ? _RoomNotificationStateStore.RoomNotificationStateStore.instance.globalState : _SpaceStore.default.instance.getNotificationState(_spaces.MetaSpace.Home);
};

const HomeButton = _ref3 => {
  let {
    selected,
    isPanelCollapsed
  } = _ref3;
  const allRoomsInHome = (0, _useEventEmitter.useEventEmitterState)(_SpaceStore.default.instance, _spaces.UPDATE_HOME_BEHAVIOUR, () => {
    return _SpaceStore.default.instance.allRoomsInHome;
  });
  const [notificationState, setNotificationState] = (0, _react.useState)(getHomeNotificationState());
  const updateNotificationState = (0, _react.useCallback)(() => {
    setNotificationState(getHomeNotificationState());
  }, []);
  (0, _react.useEffect)(updateNotificationState, [updateNotificationState, allRoomsInHome]);
  (0, _useEventEmitter.useEventEmitter)(_RoomNotificationStateStore.RoomNotificationStateStore.instance, _RoomNotificationStateStore.UPDATE_STATUS_INDICATOR, updateNotificationState);
  return /*#__PURE__*/_react.default.createElement(MetaSpaceButton, {
    spaceKey: _spaces.MetaSpace.Home,
    className: "mx_SpaceButton_home",
    selected: selected,
    isPanelCollapsed: isPanelCollapsed,
    label: (0, _spaces.getMetaSpaceName)(_spaces.MetaSpace.Home, allRoomsInHome),
    notificationState: notificationState,
    ContextMenuComponent: HomeButtonContextMenu,
    contextMenuTooltip: (0, _languageHandler._t)("Options")
  });
};

const FavouritesButton = _ref4 => {
  let {
    selected,
    isPanelCollapsed
  } = _ref4;
  return /*#__PURE__*/_react.default.createElement(MetaSpaceButton, {
    spaceKey: _spaces.MetaSpace.Favourites,
    className: "mx_SpaceButton_favourites",
    selected: selected,
    isPanelCollapsed: isPanelCollapsed,
    label: (0, _spaces.getMetaSpaceName)(_spaces.MetaSpace.Favourites),
    notificationState: _SpaceStore.default.instance.getNotificationState(_spaces.MetaSpace.Favourites)
  });
};

const PeopleButton = _ref5 => {
  let {
    selected,
    isPanelCollapsed
  } = _ref5;
  return /*#__PURE__*/_react.default.createElement(MetaSpaceButton, {
    spaceKey: _spaces.MetaSpace.People,
    className: "mx_SpaceButton_people",
    selected: selected,
    isPanelCollapsed: isPanelCollapsed,
    label: (0, _spaces.getMetaSpaceName)(_spaces.MetaSpace.People),
    notificationState: _SpaceStore.default.instance.getNotificationState(_spaces.MetaSpace.People)
  });
};

const OrphansButton = _ref6 => {
  let {
    selected,
    isPanelCollapsed
  } = _ref6;
  return /*#__PURE__*/_react.default.createElement(MetaSpaceButton, {
    spaceKey: _spaces.MetaSpace.Orphans,
    className: "mx_SpaceButton_orphans",
    selected: selected,
    isPanelCollapsed: isPanelCollapsed,
    label: (0, _spaces.getMetaSpaceName)(_spaces.MetaSpace.Orphans),
    notificationState: _SpaceStore.default.instance.getNotificationState(_spaces.MetaSpace.Orphans)
  });
};

const CreateSpaceButton = _ref7 => {
  let {
    isPanelCollapsed,
    setPanelCollapsed
  } = _ref7;
  // We don't need the handle as we position the menu in a constant location
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [menuDisplayed, _handle, openMenu, closeMenu] = (0, _ContextMenu.useContextMenu)();
  (0, _react.useEffect)(() => {
    if (!isPanelCollapsed && menuDisplayed) {
      closeMenu();
    }
  }, [isPanelCollapsed]); // eslint-disable-line react-hooks/exhaustive-deps

  let contextMenu = null;

  if (menuDisplayed) {
    contextMenu = /*#__PURE__*/_react.default.createElement(_SpaceCreateMenu.default, {
      onFinished: closeMenu
    });
  }

  const onNewClick = menuDisplayed ? closeMenu : () => {
    if (!isPanelCollapsed) setPanelCollapsed(true);
    openMenu();
  };
  return /*#__PURE__*/_react.default.createElement("li", {
    className: (0, _classnames.default)("mx_SpaceItem mx_SpaceItem_new", {
      "collapsed": isPanelCollapsed
    }),
    role: "treeitem"
  }, /*#__PURE__*/_react.default.createElement(_SpaceTreeLevel.SpaceButton, {
    "data-test-id": "create-space-button",
    className: (0, _classnames.default)("mx_SpaceButton_new", {
      mx_SpaceButton_newCancel: menuDisplayed
    }),
    label: menuDisplayed ? (0, _languageHandler._t)("Cancel") : (0, _languageHandler._t)("Create a space"),
    onClick: onNewClick,
    isNarrow: isPanelCollapsed
  }), contextMenu);
};

const metaSpaceComponentMap = {
  [_spaces.MetaSpace.Home]: HomeButton,
  [_spaces.MetaSpace.Favourites]: FavouritesButton,
  [_spaces.MetaSpace.People]: PeopleButton,
  [_spaces.MetaSpace.Orphans]: OrphansButton
};

// Optimisation based on https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/api/droppable.md#recommended-droppable--performance-optimisation
const InnerSpacePanel = /*#__PURE__*/_react.default.memo(_ref8 => {
  let {
    children,
    isPanelCollapsed,
    setPanelCollapsed,
    isDraggingOver,
    innerRef
  } = _ref8,
      props = (0, _objectWithoutProperties2.default)(_ref8, _excluded3);
  const [invites, metaSpaces, actualSpaces, activeSpace] = useSpaces();
  const activeSpaces = activeSpace ? [activeSpace] : [];
  const metaSpacesSection = metaSpaces.map(key => {
    const Component = metaSpaceComponentMap[key];
    return /*#__PURE__*/_react.default.createElement(Component, {
      key: key,
      selected: activeSpace === key,
      isPanelCollapsed: isPanelCollapsed
    });
  });
  return /*#__PURE__*/_react.default.createElement(_IndicatorScrollbar.default, (0, _extends2.default)({}, props, {
    wrappedRef: innerRef,
    className: "mx_SpaceTreeLevel",
    style: isDraggingOver ? {
      pointerEvents: "none"
    } : undefined,
    element: "ul",
    role: "tree",
    "aria-label": (0, _languageHandler._t)("Spaces")
  }), metaSpacesSection, invites.map(s => /*#__PURE__*/_react.default.createElement(_SpaceTreeLevel.SpaceItem, {
    key: s.roomId,
    space: s,
    activeSpaces: activeSpaces,
    isPanelCollapsed: isPanelCollapsed,
    onExpand: () => setPanelCollapsed(false)
  })), actualSpaces.map((s, i) => /*#__PURE__*/_react.default.createElement(_reactBeautifulDnd.Draggable, {
    key: s.roomId,
    draggableId: s.roomId,
    index: i
  }, (provided, snapshot) => /*#__PURE__*/_react.default.createElement(_SpaceTreeLevel.SpaceItem, (0, _extends2.default)({}, provided.draggableProps, {
    dragHandleProps: provided.dragHandleProps,
    key: s.roomId,
    innerRef: provided.innerRef,
    className: snapshot.isDragging ? "mx_SpaceItem_dragging" : undefined,
    space: s,
    activeSpaces: activeSpaces,
    isPanelCollapsed: isPanelCollapsed,
    onExpand: () => setPanelCollapsed(false)
  })))), children, (0, _UIComponents.shouldShowComponent)(_UIFeature.UIComponent.CreateSpaces) && /*#__PURE__*/_react.default.createElement(CreateSpaceButton, {
    isPanelCollapsed: isPanelCollapsed,
    setPanelCollapsed: setPanelCollapsed
  }));
});

const SpacePanel = () => {
  const [isPanelCollapsed, setPanelCollapsed] = (0, _react.useState)(true);
  const ref = (0, _react.useRef)();
  (0, _react.useLayoutEffect)(() => {
    _UIStore.default.instance.trackElementDimensions("SpacePanel", ref.current);

    return () => _UIStore.default.instance.stopTrackingElementDimensions("SpacePanel");
  }, []);
  (0, _useDispatcher.useDispatcher)(_dispatcher.default, payload => {
    if (payload.action === _actions.Action.ToggleSpacePanel) {
      setPanelCollapsed(!isPanelCollapsed);
    }
  });
  return /*#__PURE__*/_react.default.createElement(_reactBeautifulDnd.DragDropContext, {
    onDragEnd: result => {
      if (!result.destination) return; // dropped outside the list

      _SpaceStore.default.instance.moveRootSpace(result.source.index, result.destination.index);
    }
  }, /*#__PURE__*/_react.default.createElement(_RovingTabIndex.RovingTabIndexProvider, {
    handleHomeEnd: true,
    handleUpDown: true
  }, _ref9 => {
    let {
      onKeyDownHandler
    } = _ref9;
    return /*#__PURE__*/_react.default.createElement("div", {
      className: (0, _classnames.default)("mx_SpacePanel", {
        collapsed: isPanelCollapsed
      }),
      onKeyDown: onKeyDownHandler,
      ref: ref
    }, /*#__PURE__*/_react.default.createElement(_UserMenu.default, {
      isPanelCollapsed: isPanelCollapsed
    }, /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
      className: (0, _classnames.default)("mx_SpacePanel_toggleCollapse", {
        expanded: !isPanelCollapsed
      }),
      onClick: () => setPanelCollapsed(!isPanelCollapsed),
      title: isPanelCollapsed ? (0, _languageHandler._t)("Expand") : (0, _languageHandler._t)("Collapse"),
      tooltip: /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Tooltip_title"
      }, isPanelCollapsed ? (0, _languageHandler._t)("Expand") : (0, _languageHandler._t)("Collapse")), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_Tooltip_sub"
      }, _Keyboard.IS_MAC ? "⌘ + ⇧ + D" : (0, _languageHandler._t)(_KeyboardShortcuts.ALTERNATE_KEY_NAME[_Keyboard.Key.CONTROL]) + " + " + (0, _languageHandler._t)(_KeyboardShortcuts.ALTERNATE_KEY_NAME[_Keyboard.Key.SHIFT]) + " + D"))
    })), /*#__PURE__*/_react.default.createElement(_reactBeautifulDnd.Droppable, {
      droppableId: "top-level-spaces"
    }, (provided, snapshot) => /*#__PURE__*/_react.default.createElement(InnerSpacePanel, (0, _extends2.default)({}, provided.droppableProps, {
      isPanelCollapsed: isPanelCollapsed,
      setPanelCollapsed: setPanelCollapsed,
      isDraggingOver: snapshot.isDraggingOver,
      innerRef: provided.innerRef
    }), provided.placeholder)), /*#__PURE__*/_react.default.createElement(_QuickSettingsButton.default, {
      isPanelCollapsed: isPanelCollapsed
    }));
  }));
};

var _default = SpacePanel;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ1c2VTcGFjZXMiLCJpbnZpdGVzIiwidXNlRXZlbnRFbWl0dGVyU3RhdGUiLCJTcGFjZVN0b3JlIiwiaW5zdGFuY2UiLCJVUERBVEVfSU5WSVRFRF9TUEFDRVMiLCJpbnZpdGVkU3BhY2VzIiwibWV0YVNwYWNlcyIsImFjdHVhbFNwYWNlcyIsIlVQREFURV9UT1BfTEVWRUxfU1BBQ0VTIiwiZW5hYmxlZE1ldGFTcGFjZXMiLCJzcGFjZVBhbmVsU3BhY2VzIiwiYWN0aXZlU3BhY2UiLCJVUERBVEVfU0VMRUNURURfU1BBQ0UiLCJIb21lQnV0dG9uQ29udGV4dE1lbnUiLCJvbkZpbmlzaGVkIiwiaGlkZUhlYWRlciIsInByb3BzIiwiYWxsUm9vbXNJbkhvbWUiLCJ1c2VTZXR0aW5nVmFsdWUiLCJfdCIsIlNldHRpbmdzU3RvcmUiLCJzZXRWYWx1ZSIsIlNldHRpbmdMZXZlbCIsIkFDQ09VTlQiLCJNZXRhU3BhY2VCdXR0b24iLCJzZWxlY3RlZCIsImlzUGFuZWxDb2xsYXBzZWQiLCJjbGFzc05hbWVzIiwiZ2V0SG9tZU5vdGlmaWNhdGlvblN0YXRlIiwiUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUiLCJnbG9iYWxTdGF0ZSIsImdldE5vdGlmaWNhdGlvblN0YXRlIiwiTWV0YVNwYWNlIiwiSG9tZSIsIkhvbWVCdXR0b24iLCJVUERBVEVfSE9NRV9CRUhBVklPVVIiLCJub3RpZmljYXRpb25TdGF0ZSIsInNldE5vdGlmaWNhdGlvblN0YXRlIiwidXNlU3RhdGUiLCJ1cGRhdGVOb3RpZmljYXRpb25TdGF0ZSIsInVzZUNhbGxiYWNrIiwidXNlRWZmZWN0IiwidXNlRXZlbnRFbWl0dGVyIiwiVVBEQVRFX1NUQVRVU19JTkRJQ0FUT1IiLCJnZXRNZXRhU3BhY2VOYW1lIiwiRmF2b3VyaXRlc0J1dHRvbiIsIkZhdm91cml0ZXMiLCJQZW9wbGVCdXR0b24iLCJQZW9wbGUiLCJPcnBoYW5zQnV0dG9uIiwiT3JwaGFucyIsIkNyZWF0ZVNwYWNlQnV0dG9uIiwic2V0UGFuZWxDb2xsYXBzZWQiLCJtZW51RGlzcGxheWVkIiwiX2hhbmRsZSIsIm9wZW5NZW51IiwiY2xvc2VNZW51IiwidXNlQ29udGV4dE1lbnUiLCJjb250ZXh0TWVudSIsIm9uTmV3Q2xpY2siLCJteF9TcGFjZUJ1dHRvbl9uZXdDYW5jZWwiLCJtZXRhU3BhY2VDb21wb25lbnRNYXAiLCJJbm5lclNwYWNlUGFuZWwiLCJSZWFjdCIsIm1lbW8iLCJjaGlsZHJlbiIsImlzRHJhZ2dpbmdPdmVyIiwiaW5uZXJSZWYiLCJhY3RpdmVTcGFjZXMiLCJtZXRhU3BhY2VzU2VjdGlvbiIsIm1hcCIsImtleSIsIkNvbXBvbmVudCIsInBvaW50ZXJFdmVudHMiLCJ1bmRlZmluZWQiLCJzIiwicm9vbUlkIiwiaSIsInByb3ZpZGVkIiwic25hcHNob3QiLCJkcmFnZ2FibGVQcm9wcyIsImRyYWdIYW5kbGVQcm9wcyIsImlzRHJhZ2dpbmciLCJzaG91bGRTaG93Q29tcG9uZW50IiwiVUlDb21wb25lbnQiLCJDcmVhdGVTcGFjZXMiLCJTcGFjZVBhbmVsIiwicmVmIiwidXNlUmVmIiwidXNlTGF5b3V0RWZmZWN0IiwiVUlTdG9yZSIsInRyYWNrRWxlbWVudERpbWVuc2lvbnMiLCJjdXJyZW50Iiwic3RvcFRyYWNraW5nRWxlbWVudERpbWVuc2lvbnMiLCJ1c2VEaXNwYXRjaGVyIiwiZGVmYXVsdERpc3BhdGNoZXIiLCJwYXlsb2FkIiwiYWN0aW9uIiwiQWN0aW9uIiwiVG9nZ2xlU3BhY2VQYW5lbCIsInJlc3VsdCIsImRlc3RpbmF0aW9uIiwibW92ZVJvb3RTcGFjZSIsInNvdXJjZSIsImluZGV4Iiwib25LZXlEb3duSGFuZGxlciIsImNvbGxhcHNlZCIsImV4cGFuZGVkIiwiSVNfTUFDIiwiQUxURVJOQVRFX0tFWV9OQU1FIiwiS2V5IiwiQ09OVFJPTCIsIlNISUZUIiwiZHJvcHBhYmxlUHJvcHMiLCJwbGFjZWhvbGRlciJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NwYWNlcy9TcGFjZVBhbmVsLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgLSAyMDIyIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7XG4gICAgQ29tcG9uZW50UHJvcHMsXG4gICAgRGlzcGF0Y2gsXG4gICAgUmVhY3ROb2RlLFxuICAgIFJlZkNhbGxiYWNrLFxuICAgIFNldFN0YXRlQWN0aW9uLFxuICAgIHVzZUNhbGxiYWNrLFxuICAgIHVzZUVmZmVjdCxcbiAgICB1c2VMYXlvdXRFZmZlY3QsXG4gICAgdXNlUmVmLFxuICAgIHVzZVN0YXRlLFxufSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IERyYWdEcm9wQ29udGV4dCwgRHJhZ2dhYmxlLCBEcm9wcGFibGUsIERyb3BwYWJsZVByb3ZpZGVkUHJvcHMgfSBmcm9tIFwicmVhY3QtYmVhdXRpZnVsLWRuZFwiO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSBcImNsYXNzbmFtZXNcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcblxuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgeyB1c2VDb250ZXh0TWVudSB9IGZyb20gXCIuLi8uLi9zdHJ1Y3R1cmVzL0NvbnRleHRNZW51XCI7XG5pbXBvcnQgU3BhY2VDcmVhdGVNZW51IGZyb20gXCIuL1NwYWNlQ3JlYXRlTWVudVwiO1xuaW1wb3J0IHsgU3BhY2VCdXR0b24sIFNwYWNlSXRlbSB9IGZyb20gXCIuL1NwYWNlVHJlZUxldmVsXCI7XG5pbXBvcnQgQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVUb29sdGlwQnV0dG9uXCI7XG5pbXBvcnQgeyB1c2VFdmVudEVtaXR0ZXIsIHVzZUV2ZW50RW1pdHRlclN0YXRlIH0gZnJvbSBcIi4uLy4uLy4uL2hvb2tzL3VzZUV2ZW50RW1pdHRlclwiO1xuaW1wb3J0IFNwYWNlU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9zcGFjZXMvU3BhY2VTdG9yZVwiO1xuaW1wb3J0IHtcbiAgICBnZXRNZXRhU3BhY2VOYW1lLFxuICAgIE1ldGFTcGFjZSxcbiAgICBTcGFjZUtleSxcbiAgICBVUERBVEVfSE9NRV9CRUhBVklPVVIsXG4gICAgVVBEQVRFX0lOVklURURfU1BBQ0VTLFxuICAgIFVQREFURV9TRUxFQ1RFRF9TUEFDRSxcbiAgICBVUERBVEVfVE9QX0xFVkVMX1NQQUNFUyxcbn0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9zcGFjZXNcIjtcbmltcG9ydCB7IFJvdmluZ1RhYkluZGV4UHJvdmlkZXIgfSBmcm9tIFwiLi4vLi4vLi4vYWNjZXNzaWJpbGl0eS9Sb3ZpbmdUYWJJbmRleFwiO1xuaW1wb3J0IHtcbiAgICBSb29tTm90aWZpY2F0aW9uU3RhdGVTdG9yZSxcbiAgICBVUERBVEVfU1RBVFVTX0lORElDQVRPUixcbn0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9ub3RpZmljYXRpb25zL1Jvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlXCI7XG5pbXBvcnQgU3BhY2VDb250ZXh0TWVudSBmcm9tIFwiLi4vY29udGV4dF9tZW51cy9TcGFjZUNvbnRleHRNZW51XCI7XG5pbXBvcnQgSWNvbml6ZWRDb250ZXh0TWVudSwge1xuICAgIEljb25pemVkQ29udGV4dE1lbnVDaGVja2JveCxcbiAgICBJY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdCxcbn0gZnJvbSBcIi4uL2NvbnRleHRfbWVudXMvSWNvbml6ZWRDb250ZXh0TWVudVwiO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7IFNldHRpbmdMZXZlbCB9IGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nTGV2ZWxcIjtcbmltcG9ydCBVSVN0b3JlIGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvVUlTdG9yZVwiO1xuaW1wb3J0IFF1aWNrU2V0dGluZ3NCdXR0b24gZnJvbSBcIi4vUXVpY2tTZXR0aW5nc0J1dHRvblwiO1xuaW1wb3J0IHsgdXNlU2V0dGluZ1ZhbHVlIH0gZnJvbSBcIi4uLy4uLy4uL2hvb2tzL3VzZVNldHRpbmdzXCI7XG5pbXBvcnQgVXNlck1lbnUgZnJvbSBcIi4uLy4uL3N0cnVjdHVyZXMvVXNlck1lbnVcIjtcbmltcG9ydCBJbmRpY2F0b3JTY3JvbGxiYXIgZnJvbSBcIi4uLy4uL3N0cnVjdHVyZXMvSW5kaWNhdG9yU2Nyb2xsYmFyXCI7XG5pbXBvcnQgeyBJU19NQUMsIEtleSB9IGZyb20gXCIuLi8uLi8uLi9LZXlib2FyZFwiO1xuaW1wb3J0IHsgdXNlRGlzcGF0Y2hlciB9IGZyb20gXCIuLi8uLi8uLi9ob29rcy91c2VEaXNwYXRjaGVyXCI7XG5pbXBvcnQgZGVmYXVsdERpc3BhdGNoZXIgZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHsgQWN0aW9uUGF5bG9hZCB9IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzXCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQgeyBOb3RpZmljYXRpb25TdGF0ZSB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvbm90aWZpY2F0aW9ucy9Ob3RpZmljYXRpb25TdGF0ZVwiO1xuaW1wb3J0IHsgQUxURVJOQVRFX0tFWV9OQU1FIH0gZnJvbSBcIi4uLy4uLy4uL2FjY2Vzc2liaWxpdHkvS2V5Ym9hcmRTaG9ydGN1dHNcIjtcbmltcG9ydCB7IHNob3VsZFNob3dDb21wb25lbnQgfSBmcm9tIFwiLi4vLi4vLi4vY3VzdG9taXNhdGlvbnMvaGVscGVycy9VSUNvbXBvbmVudHNcIjtcbmltcG9ydCB7IFVJQ29tcG9uZW50IH0gZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1VJRmVhdHVyZVwiO1xuXG5jb25zdCB1c2VTcGFjZXMgPSAoKTogW1Jvb21bXSwgTWV0YVNwYWNlW10sIFJvb21bXSwgU3BhY2VLZXldID0+IHtcbiAgICBjb25zdCBpbnZpdGVzID0gdXNlRXZlbnRFbWl0dGVyU3RhdGU8Um9vbVtdPihTcGFjZVN0b3JlLmluc3RhbmNlLCBVUERBVEVfSU5WSVRFRF9TUEFDRVMsICgpID0+IHtcbiAgICAgICAgcmV0dXJuIFNwYWNlU3RvcmUuaW5zdGFuY2UuaW52aXRlZFNwYWNlcztcbiAgICB9KTtcbiAgICBjb25zdCBbbWV0YVNwYWNlcywgYWN0dWFsU3BhY2VzXSA9IHVzZUV2ZW50RW1pdHRlclN0YXRlPFtNZXRhU3BhY2VbXSwgUm9vbVtdXT4oXG4gICAgICAgIFNwYWNlU3RvcmUuaW5zdGFuY2UsIFVQREFURV9UT1BfTEVWRUxfU1BBQ0VTLFxuICAgICAgICAoKSA9PiBbXG4gICAgICAgICAgICBTcGFjZVN0b3JlLmluc3RhbmNlLmVuYWJsZWRNZXRhU3BhY2VzLFxuICAgICAgICAgICAgU3BhY2VTdG9yZS5pbnN0YW5jZS5zcGFjZVBhbmVsU3BhY2VzLFxuICAgICAgICBdLFxuICAgICk7XG4gICAgY29uc3QgYWN0aXZlU3BhY2UgPSB1c2VFdmVudEVtaXR0ZXJTdGF0ZTxTcGFjZUtleT4oU3BhY2VTdG9yZS5pbnN0YW5jZSwgVVBEQVRFX1NFTEVDVEVEX1NQQUNFLCAoKSA9PiB7XG4gICAgICAgIHJldHVybiBTcGFjZVN0b3JlLmluc3RhbmNlLmFjdGl2ZVNwYWNlO1xuICAgIH0pO1xuICAgIHJldHVybiBbaW52aXRlcywgbWV0YVNwYWNlcywgYWN0dWFsU3BhY2VzLCBhY3RpdmVTcGFjZV07XG59O1xuXG5leHBvcnQgY29uc3QgSG9tZUJ1dHRvbkNvbnRleHRNZW51ID0gKHtcbiAgICBvbkZpbmlzaGVkLFxuICAgIGhpZGVIZWFkZXIsXG4gICAgLi4ucHJvcHNcbn06IENvbXBvbmVudFByb3BzPHR5cGVvZiBTcGFjZUNvbnRleHRNZW51PikgPT4ge1xuICAgIGNvbnN0IGFsbFJvb21zSW5Ib21lID0gdXNlU2V0dGluZ1ZhbHVlPGJvb2xlYW4+KFwiU3BhY2VzLmFsbFJvb21zSW5Ib21lXCIpO1xuXG4gICAgcmV0dXJuIDxJY29uaXplZENvbnRleHRNZW51XG4gICAgICAgIHsuLi5wcm9wc31cbiAgICAgICAgb25GaW5pc2hlZD17b25GaW5pc2hlZH1cbiAgICAgICAgY2xhc3NOYW1lPVwibXhfU3BhY2VQYW5lbF9jb250ZXh0TWVudVwiXG4gICAgICAgIGNvbXBhY3RcbiAgICA+XG4gICAgICAgIHsgIWhpZGVIZWFkZXIgJiYgPGRpdiBjbGFzc05hbWU9XCJteF9TcGFjZVBhbmVsX2NvbnRleHRNZW51X2hlYWRlclwiPlxuICAgICAgICAgICAgeyBfdChcIkhvbWVcIikgfVxuICAgICAgICA8L2Rpdj4gfVxuICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudU9wdGlvbkxpc3QgZmlyc3Q+XG4gICAgICAgICAgICA8SWNvbml6ZWRDb250ZXh0TWVudUNoZWNrYm94XG4gICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZT1cIm14X1NwYWNlUGFuZWxfbm9JY29uXCJcbiAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJTaG93IGFsbCByb29tc1wiKX1cbiAgICAgICAgICAgICAgICBhY3RpdmU9e2FsbFJvb21zSW5Ib21lfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS5zZXRWYWx1ZShcIlNwYWNlcy5hbGxSb29tc0luSG9tZVwiLCBudWxsLCBTZXR0aW5nTGV2ZWwuQUNDT1VOVCwgIWFsbFJvb21zSW5Ib21lKTtcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgPC9JY29uaXplZENvbnRleHRNZW51T3B0aW9uTGlzdD5cbiAgICA8L0ljb25pemVkQ29udGV4dE1lbnU+O1xufTtcblxuaW50ZXJmYWNlIElNZXRhU3BhY2VCdXR0b25Qcm9wcyBleHRlbmRzIENvbXBvbmVudFByb3BzPHR5cGVvZiBTcGFjZUJ1dHRvbj4ge1xuICAgIHNlbGVjdGVkOiBib29sZWFuO1xuICAgIGlzUGFuZWxDb2xsYXBzZWQ6IGJvb2xlYW47XG59XG5cbnR5cGUgTWV0YVNwYWNlQnV0dG9uUHJvcHMgPSBQaWNrPElNZXRhU3BhY2VCdXR0b25Qcm9wcywgXCJzZWxlY3RlZFwiIHwgXCJpc1BhbmVsQ29sbGFwc2VkXCI+O1xuXG5jb25zdCBNZXRhU3BhY2VCdXR0b24gPSAoeyBzZWxlY3RlZCwgaXNQYW5lbENvbGxhcHNlZCwgLi4ucHJvcHMgfTogSU1ldGFTcGFjZUJ1dHRvblByb3BzKSA9PiB7XG4gICAgcmV0dXJuIDxsaVxuICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZXMoXCJteF9TcGFjZUl0ZW1cIiwge1xuICAgICAgICAgICAgXCJjb2xsYXBzZWRcIjogaXNQYW5lbENvbGxhcHNlZCxcbiAgICAgICAgfSl9XG4gICAgICAgIHJvbGU9XCJ0cmVlaXRlbVwiXG4gICAgICAgIGFyaWEtc2VsZWN0ZWQ9e3NlbGVjdGVkfVxuICAgID5cbiAgICAgICAgPFNwYWNlQnV0dG9uIHsuLi5wcm9wc30gc2VsZWN0ZWQ9e3NlbGVjdGVkfSBpc05hcnJvdz17aXNQYW5lbENvbGxhcHNlZH0gLz5cbiAgICA8L2xpPjtcbn07XG5cbmNvbnN0IGdldEhvbWVOb3RpZmljYXRpb25TdGF0ZSA9ICgpOiBOb3RpZmljYXRpb25TdGF0ZSA9PiB7XG4gICAgcmV0dXJuIFNwYWNlU3RvcmUuaW5zdGFuY2UuYWxsUm9vbXNJbkhvbWVcbiAgICAgICAgPyBSb29tTm90aWZpY2F0aW9uU3RhdGVTdG9yZS5pbnN0YW5jZS5nbG9iYWxTdGF0ZVxuICAgICAgICA6IFNwYWNlU3RvcmUuaW5zdGFuY2UuZ2V0Tm90aWZpY2F0aW9uU3RhdGUoTWV0YVNwYWNlLkhvbWUpO1xufTtcblxuY29uc3QgSG9tZUJ1dHRvbiA9ICh7IHNlbGVjdGVkLCBpc1BhbmVsQ29sbGFwc2VkIH06IE1ldGFTcGFjZUJ1dHRvblByb3BzKSA9PiB7XG4gICAgY29uc3QgYWxsUm9vbXNJbkhvbWUgPSB1c2VFdmVudEVtaXR0ZXJTdGF0ZShTcGFjZVN0b3JlLmluc3RhbmNlLCBVUERBVEVfSE9NRV9CRUhBVklPVVIsICgpID0+IHtcbiAgICAgICAgcmV0dXJuIFNwYWNlU3RvcmUuaW5zdGFuY2UuYWxsUm9vbXNJbkhvbWU7XG4gICAgfSk7XG4gICAgY29uc3QgW25vdGlmaWNhdGlvblN0YXRlLCBzZXROb3RpZmljYXRpb25TdGF0ZV0gPSB1c2VTdGF0ZShnZXRIb21lTm90aWZpY2F0aW9uU3RhdGUoKSk7XG4gICAgY29uc3QgdXBkYXRlTm90aWZpY2F0aW9uU3RhdGUgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldE5vdGlmaWNhdGlvblN0YXRlKGdldEhvbWVOb3RpZmljYXRpb25TdGF0ZSgpKTtcbiAgICB9LCBbXSk7XG4gICAgdXNlRWZmZWN0KHVwZGF0ZU5vdGlmaWNhdGlvblN0YXRlLCBbdXBkYXRlTm90aWZpY2F0aW9uU3RhdGUsIGFsbFJvb21zSW5Ib21lXSk7XG4gICAgdXNlRXZlbnRFbWl0dGVyKFJvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlLmluc3RhbmNlLCBVUERBVEVfU1RBVFVTX0lORElDQVRPUiwgdXBkYXRlTm90aWZpY2F0aW9uU3RhdGUpO1xuXG4gICAgcmV0dXJuIDxNZXRhU3BhY2VCdXR0b25cbiAgICAgICAgc3BhY2VLZXk9e01ldGFTcGFjZS5Ib21lfVxuICAgICAgICBjbGFzc05hbWU9XCJteF9TcGFjZUJ1dHRvbl9ob21lXCJcbiAgICAgICAgc2VsZWN0ZWQ9e3NlbGVjdGVkfVxuICAgICAgICBpc1BhbmVsQ29sbGFwc2VkPXtpc1BhbmVsQ29sbGFwc2VkfVxuICAgICAgICBsYWJlbD17Z2V0TWV0YVNwYWNlTmFtZShNZXRhU3BhY2UuSG9tZSwgYWxsUm9vbXNJbkhvbWUpfVxuICAgICAgICBub3RpZmljYXRpb25TdGF0ZT17bm90aWZpY2F0aW9uU3RhdGV9XG4gICAgICAgIENvbnRleHRNZW51Q29tcG9uZW50PXtIb21lQnV0dG9uQ29udGV4dE1lbnV9XG4gICAgICAgIGNvbnRleHRNZW51VG9vbHRpcD17X3QoXCJPcHRpb25zXCIpfVxuICAgIC8+O1xufTtcblxuY29uc3QgRmF2b3VyaXRlc0J1dHRvbiA9ICh7IHNlbGVjdGVkLCBpc1BhbmVsQ29sbGFwc2VkIH06IE1ldGFTcGFjZUJ1dHRvblByb3BzKSA9PiB7XG4gICAgcmV0dXJuIDxNZXRhU3BhY2VCdXR0b25cbiAgICAgICAgc3BhY2VLZXk9e01ldGFTcGFjZS5GYXZvdXJpdGVzfVxuICAgICAgICBjbGFzc05hbWU9XCJteF9TcGFjZUJ1dHRvbl9mYXZvdXJpdGVzXCJcbiAgICAgICAgc2VsZWN0ZWQ9e3NlbGVjdGVkfVxuICAgICAgICBpc1BhbmVsQ29sbGFwc2VkPXtpc1BhbmVsQ29sbGFwc2VkfVxuICAgICAgICBsYWJlbD17Z2V0TWV0YVNwYWNlTmFtZShNZXRhU3BhY2UuRmF2b3VyaXRlcyl9XG4gICAgICAgIG5vdGlmaWNhdGlvblN0YXRlPXtTcGFjZVN0b3JlLmluc3RhbmNlLmdldE5vdGlmaWNhdGlvblN0YXRlKE1ldGFTcGFjZS5GYXZvdXJpdGVzKX1cbiAgICAvPjtcbn07XG5cbmNvbnN0IFBlb3BsZUJ1dHRvbiA9ICh7IHNlbGVjdGVkLCBpc1BhbmVsQ29sbGFwc2VkIH06IE1ldGFTcGFjZUJ1dHRvblByb3BzKSA9PiB7XG4gICAgcmV0dXJuIDxNZXRhU3BhY2VCdXR0b25cbiAgICAgICAgc3BhY2VLZXk9e01ldGFTcGFjZS5QZW9wbGV9XG4gICAgICAgIGNsYXNzTmFtZT1cIm14X1NwYWNlQnV0dG9uX3Blb3BsZVwiXG4gICAgICAgIHNlbGVjdGVkPXtzZWxlY3RlZH1cbiAgICAgICAgaXNQYW5lbENvbGxhcHNlZD17aXNQYW5lbENvbGxhcHNlZH1cbiAgICAgICAgbGFiZWw9e2dldE1ldGFTcGFjZU5hbWUoTWV0YVNwYWNlLlBlb3BsZSl9XG4gICAgICAgIG5vdGlmaWNhdGlvblN0YXRlPXtTcGFjZVN0b3JlLmluc3RhbmNlLmdldE5vdGlmaWNhdGlvblN0YXRlKE1ldGFTcGFjZS5QZW9wbGUpfVxuICAgIC8+O1xufTtcblxuY29uc3QgT3JwaGFuc0J1dHRvbiA9ICh7IHNlbGVjdGVkLCBpc1BhbmVsQ29sbGFwc2VkIH06IE1ldGFTcGFjZUJ1dHRvblByb3BzKSA9PiB7XG4gICAgcmV0dXJuIDxNZXRhU3BhY2VCdXR0b25cbiAgICAgICAgc3BhY2VLZXk9e01ldGFTcGFjZS5PcnBoYW5zfVxuICAgICAgICBjbGFzc05hbWU9XCJteF9TcGFjZUJ1dHRvbl9vcnBoYW5zXCJcbiAgICAgICAgc2VsZWN0ZWQ9e3NlbGVjdGVkfVxuICAgICAgICBpc1BhbmVsQ29sbGFwc2VkPXtpc1BhbmVsQ29sbGFwc2VkfVxuICAgICAgICBsYWJlbD17Z2V0TWV0YVNwYWNlTmFtZShNZXRhU3BhY2UuT3JwaGFucyl9XG4gICAgICAgIG5vdGlmaWNhdGlvblN0YXRlPXtTcGFjZVN0b3JlLmluc3RhbmNlLmdldE5vdGlmaWNhdGlvblN0YXRlKE1ldGFTcGFjZS5PcnBoYW5zKX1cbiAgICAvPjtcbn07XG5cbmNvbnN0IENyZWF0ZVNwYWNlQnV0dG9uID0gKHtcbiAgICBpc1BhbmVsQ29sbGFwc2VkLFxuICAgIHNldFBhbmVsQ29sbGFwc2VkLFxufTogUGljazxJSW5uZXJTcGFjZVBhbmVsUHJvcHMsIFwiaXNQYW5lbENvbGxhcHNlZFwiIHwgXCJzZXRQYW5lbENvbGxhcHNlZFwiPikgPT4ge1xuICAgIC8vIFdlIGRvbid0IG5lZWQgdGhlIGhhbmRsZSBhcyB3ZSBwb3NpdGlvbiB0aGUgbWVudSBpbiBhIGNvbnN0YW50IGxvY2F0aW9uXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICAgIGNvbnN0IFttZW51RGlzcGxheWVkLCBfaGFuZGxlLCBvcGVuTWVudSwgY2xvc2VNZW51XSA9IHVzZUNvbnRleHRNZW51PHZvaWQ+KCk7XG5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAoIWlzUGFuZWxDb2xsYXBzZWQgJiYgbWVudURpc3BsYXllZCkge1xuICAgICAgICAgICAgY2xvc2VNZW51KCk7XG4gICAgICAgIH1cbiAgICB9LCBbaXNQYW5lbENvbGxhcHNlZF0pOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuXG4gICAgbGV0IGNvbnRleHRNZW51ID0gbnVsbDtcbiAgICBpZiAobWVudURpc3BsYXllZCkge1xuICAgICAgICBjb250ZXh0TWVudSA9IDxTcGFjZUNyZWF0ZU1lbnUgb25GaW5pc2hlZD17Y2xvc2VNZW51fSAvPjtcbiAgICB9XG5cbiAgICBjb25zdCBvbk5ld0NsaWNrID0gbWVudURpc3BsYXllZCA/IGNsb3NlTWVudSA6ICgpID0+IHtcbiAgICAgICAgaWYgKCFpc1BhbmVsQ29sbGFwc2VkKSBzZXRQYW5lbENvbGxhcHNlZCh0cnVlKTtcbiAgICAgICAgb3Blbk1lbnUoKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIDxsaVxuICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZXMoXCJteF9TcGFjZUl0ZW0gbXhfU3BhY2VJdGVtX25ld1wiLCB7XG4gICAgICAgICAgICBcImNvbGxhcHNlZFwiOiBpc1BhbmVsQ29sbGFwc2VkLFxuICAgICAgICB9KX1cbiAgICAgICAgcm9sZT1cInRyZWVpdGVtXCJcbiAgICA+XG4gICAgICAgIDxTcGFjZUJ1dHRvblxuICAgICAgICAgICAgZGF0YS10ZXN0LWlkPSdjcmVhdGUtc3BhY2UtYnV0dG9uJ1xuICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWVzKFwibXhfU3BhY2VCdXR0b25fbmV3XCIsIHtcbiAgICAgICAgICAgICAgICBteF9TcGFjZUJ1dHRvbl9uZXdDYW5jZWw6IG1lbnVEaXNwbGF5ZWQsXG4gICAgICAgICAgICB9KX1cbiAgICAgICAgICAgIGxhYmVsPXttZW51RGlzcGxheWVkID8gX3QoXCJDYW5jZWxcIikgOiBfdChcIkNyZWF0ZSBhIHNwYWNlXCIpfVxuICAgICAgICAgICAgb25DbGljaz17b25OZXdDbGlja31cbiAgICAgICAgICAgIGlzTmFycm93PXtpc1BhbmVsQ29sbGFwc2VkfVxuICAgICAgICAvPlxuXG4gICAgICAgIHsgY29udGV4dE1lbnUgfVxuICAgIDwvbGk+O1xufTtcblxuY29uc3QgbWV0YVNwYWNlQ29tcG9uZW50TWFwOiBSZWNvcmQ8TWV0YVNwYWNlLCB0eXBlb2YgSG9tZUJ1dHRvbj4gPSB7XG4gICAgW01ldGFTcGFjZS5Ib21lXTogSG9tZUJ1dHRvbixcbiAgICBbTWV0YVNwYWNlLkZhdm91cml0ZXNdOiBGYXZvdXJpdGVzQnV0dG9uLFxuICAgIFtNZXRhU3BhY2UuUGVvcGxlXTogUGVvcGxlQnV0dG9uLFxuICAgIFtNZXRhU3BhY2UuT3JwaGFuc106IE9ycGhhbnNCdXR0b24sXG59O1xuXG5pbnRlcmZhY2UgSUlubmVyU3BhY2VQYW5lbFByb3BzIGV4dGVuZHMgRHJvcHBhYmxlUHJvdmlkZWRQcm9wcyB7XG4gICAgY2hpbGRyZW4/OiBSZWFjdE5vZGU7XG4gICAgaXNQYW5lbENvbGxhcHNlZDogYm9vbGVhbjtcbiAgICBzZXRQYW5lbENvbGxhcHNlZDogRGlzcGF0Y2g8U2V0U3RhdGVBY3Rpb248Ym9vbGVhbj4+O1xuICAgIGlzRHJhZ2dpbmdPdmVyOiBib29sZWFuO1xuICAgIGlubmVyUmVmOiBSZWZDYWxsYmFjazxIVE1MRWxlbWVudD47XG59XG5cbi8vIE9wdGltaXNhdGlvbiBiYXNlZCBvbiBodHRwczovL2dpdGh1Yi5jb20vYXRsYXNzaWFuL3JlYWN0LWJlYXV0aWZ1bC1kbmQvYmxvYi9tYXN0ZXIvZG9jcy9hcGkvZHJvcHBhYmxlLm1kI3JlY29tbWVuZGVkLWRyb3BwYWJsZS0tcGVyZm9ybWFuY2Utb3B0aW1pc2F0aW9uXG5jb25zdCBJbm5lclNwYWNlUGFuZWwgPSBSZWFjdC5tZW1vPElJbm5lclNwYWNlUGFuZWxQcm9wcz4oKHtcbiAgICBjaGlsZHJlbixcbiAgICBpc1BhbmVsQ29sbGFwc2VkLFxuICAgIHNldFBhbmVsQ29sbGFwc2VkLFxuICAgIGlzRHJhZ2dpbmdPdmVyLFxuICAgIGlubmVyUmVmLFxuICAgIC4uLnByb3BzXG59KSA9PiB7XG4gICAgY29uc3QgW2ludml0ZXMsIG1ldGFTcGFjZXMsIGFjdHVhbFNwYWNlcywgYWN0aXZlU3BhY2VdID0gdXNlU3BhY2VzKCk7XG4gICAgY29uc3QgYWN0aXZlU3BhY2VzID0gYWN0aXZlU3BhY2UgPyBbYWN0aXZlU3BhY2VdIDogW107XG5cbiAgICBjb25zdCBtZXRhU3BhY2VzU2VjdGlvbiA9IG1ldGFTcGFjZXMubWFwKGtleSA9PiB7XG4gICAgICAgIGNvbnN0IENvbXBvbmVudCA9IG1ldGFTcGFjZUNvbXBvbmVudE1hcFtrZXldO1xuICAgICAgICByZXR1cm4gPENvbXBvbmVudCBrZXk9e2tleX0gc2VsZWN0ZWQ9e2FjdGl2ZVNwYWNlID09PSBrZXl9IGlzUGFuZWxDb2xsYXBzZWQ9e2lzUGFuZWxDb2xsYXBzZWR9IC8+O1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIDxJbmRpY2F0b3JTY3JvbGxiYXJcbiAgICAgICAgey4uLnByb3BzfVxuICAgICAgICB3cmFwcGVkUmVmPXtpbm5lclJlZn1cbiAgICAgICAgY2xhc3NOYW1lPVwibXhfU3BhY2VUcmVlTGV2ZWxcIlxuICAgICAgICBzdHlsZT17aXNEcmFnZ2luZ092ZXIgPyB7XG4gICAgICAgICAgICBwb2ludGVyRXZlbnRzOiBcIm5vbmVcIixcbiAgICAgICAgfSA6IHVuZGVmaW5lZH1cbiAgICAgICAgZWxlbWVudD1cInVsXCJcbiAgICAgICAgcm9sZT1cInRyZWVcIlxuICAgICAgICBhcmlhLWxhYmVsPXtfdChcIlNwYWNlc1wiKX1cbiAgICA+XG4gICAgICAgIHsgbWV0YVNwYWNlc1NlY3Rpb24gfVxuICAgICAgICB7IGludml0ZXMubWFwKHMgPT4gKFxuICAgICAgICAgICAgPFNwYWNlSXRlbVxuICAgICAgICAgICAgICAgIGtleT17cy5yb29tSWR9XG4gICAgICAgICAgICAgICAgc3BhY2U9e3N9XG4gICAgICAgICAgICAgICAgYWN0aXZlU3BhY2VzPXthY3RpdmVTcGFjZXN9XG4gICAgICAgICAgICAgICAgaXNQYW5lbENvbGxhcHNlZD17aXNQYW5lbENvbGxhcHNlZH1cbiAgICAgICAgICAgICAgICBvbkV4cGFuZD17KCkgPT4gc2V0UGFuZWxDb2xsYXBzZWQoZmFsc2UpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgKSkgfVxuICAgICAgICB7IGFjdHVhbFNwYWNlcy5tYXAoKHMsIGkpID0+IChcbiAgICAgICAgICAgIDxEcmFnZ2FibGUga2V5PXtzLnJvb21JZH0gZHJhZ2dhYmxlSWQ9e3Mucm9vbUlkfSBpbmRleD17aX0+XG4gICAgICAgICAgICAgICAgeyAocHJvdmlkZWQsIHNuYXBzaG90KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDxTcGFjZUl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgIHsuLi5wcm92aWRlZC5kcmFnZ2FibGVQcm9wc31cbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdIYW5kbGVQcm9wcz17cHJvdmlkZWQuZHJhZ0hhbmRsZVByb3BzfVxuICAgICAgICAgICAgICAgICAgICAgICAga2V5PXtzLnJvb21JZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlubmVyUmVmPXtwcm92aWRlZC5pbm5lclJlZn1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17c25hcHNob3QuaXNEcmFnZ2luZyA/IFwibXhfU3BhY2VJdGVtX2RyYWdnaW5nXCIgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICBzcGFjZT17c31cbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZVNwYWNlcz17YWN0aXZlU3BhY2VzfVxuICAgICAgICAgICAgICAgICAgICAgICAgaXNQYW5lbENvbGxhcHNlZD17aXNQYW5lbENvbGxhcHNlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRXhwYW5kPXsoKSA9PiBzZXRQYW5lbENvbGxhcHNlZChmYWxzZSl9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICA8L0RyYWdnYWJsZT5cbiAgICAgICAgKSkgfVxuICAgICAgICB7IGNoaWxkcmVuIH1cbiAgICAgICAge1xuICAgICAgICAgICAgc2hvdWxkU2hvd0NvbXBvbmVudChVSUNvbXBvbmVudC5DcmVhdGVTcGFjZXMpICYmXG4gICAgICAgICAgICA8Q3JlYXRlU3BhY2VCdXR0b24gaXNQYW5lbENvbGxhcHNlZD17aXNQYW5lbENvbGxhcHNlZH0gc2V0UGFuZWxDb2xsYXBzZWQ9e3NldFBhbmVsQ29sbGFwc2VkfSAvPlxuICAgICAgICB9XG5cbiAgICA8L0luZGljYXRvclNjcm9sbGJhcj47XG59KTtcblxuY29uc3QgU3BhY2VQYW5lbCA9ICgpID0+IHtcbiAgICBjb25zdCBbaXNQYW5lbENvbGxhcHNlZCwgc2V0UGFuZWxDb2xsYXBzZWRdID0gdXNlU3RhdGUodHJ1ZSk7XG4gICAgY29uc3QgcmVmID0gdXNlUmVmPEhUTUxEaXZFbGVtZW50PigpO1xuICAgIHVzZUxheW91dEVmZmVjdCgoKSA9PiB7XG4gICAgICAgIFVJU3RvcmUuaW5zdGFuY2UudHJhY2tFbGVtZW50RGltZW5zaW9ucyhcIlNwYWNlUGFuZWxcIiwgcmVmLmN1cnJlbnQpO1xuICAgICAgICByZXR1cm4gKCkgPT4gVUlTdG9yZS5pbnN0YW5jZS5zdG9wVHJhY2tpbmdFbGVtZW50RGltZW5zaW9ucyhcIlNwYWNlUGFuZWxcIik7XG4gICAgfSwgW10pO1xuXG4gICAgdXNlRGlzcGF0Y2hlcihkZWZhdWx0RGlzcGF0Y2hlciwgKHBheWxvYWQ6IEFjdGlvblBheWxvYWQpID0+IHtcbiAgICAgICAgaWYgKHBheWxvYWQuYWN0aW9uID09PSBBY3Rpb24uVG9nZ2xlU3BhY2VQYW5lbCkge1xuICAgICAgICAgICAgc2V0UGFuZWxDb2xsYXBzZWQoIWlzUGFuZWxDb2xsYXBzZWQpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8RHJhZ0Ryb3BDb250ZXh0IG9uRHJhZ0VuZD17cmVzdWx0ID0+IHtcbiAgICAgICAgICAgIGlmICghcmVzdWx0LmRlc3RpbmF0aW9uKSByZXR1cm47IC8vIGRyb3BwZWQgb3V0c2lkZSB0aGUgbGlzdFxuICAgICAgICAgICAgU3BhY2VTdG9yZS5pbnN0YW5jZS5tb3ZlUm9vdFNwYWNlKHJlc3VsdC5zb3VyY2UuaW5kZXgsIHJlc3VsdC5kZXN0aW5hdGlvbi5pbmRleCk7XG4gICAgICAgIH19PlxuICAgICAgICAgICAgPFJvdmluZ1RhYkluZGV4UHJvdmlkZXIgaGFuZGxlSG9tZUVuZCBoYW5kbGVVcERvd24+XG4gICAgICAgICAgICAgICAgeyAoeyBvbktleURvd25IYW5kbGVyIH0pID0+IChcbiAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWVzKFwibXhfU3BhY2VQYW5lbFwiLCB7IGNvbGxhcHNlZDogaXNQYW5lbENvbGxhcHNlZCB9KX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uS2V5RG93bj17b25LZXlEb3duSGFuZGxlcn1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZj17cmVmfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8VXNlck1lbnUgaXNQYW5lbENvbGxhcHNlZD17aXNQYW5lbENvbGxhcHNlZH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X1NwYWNlUGFuZWxfdG9nZ2xlQ29sbGFwc2VcIiwgeyBleHBhbmRlZDogIWlzUGFuZWxDb2xsYXBzZWQgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFBhbmVsQ29sbGFwc2VkKCFpc1BhbmVsQ29sbGFwc2VkKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9e2lzUGFuZWxDb2xsYXBzZWQgPyBfdChcIkV4cGFuZFwiKSA6IF90KFwiQ29sbGFwc2VcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvb2x0aXA9ezxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Rvb2x0aXBfdGl0bGVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGlzUGFuZWxDb2xsYXBzZWQgPyBfdChcIkV4cGFuZFwiKSA6IF90KFwiQ29sbGFwc2VcIikgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Rvb2x0aXBfc3ViXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBJU19NQUNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBcIuKMmCArIOKHpyArIERcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IF90KEFMVEVSTkFURV9LRVlfTkFNRVtLZXkuQ09OVFJPTF0pICsgXCIgKyBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3QoQUxURVJOQVRFX0tFWV9OQU1FW0tleS5TSElGVF0pICsgXCIgKyBEXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L1VzZXJNZW51PlxuICAgICAgICAgICAgICAgICAgICAgICAgPERyb3BwYWJsZSBkcm9wcGFibGVJZD1cInRvcC1sZXZlbC1zcGFjZXNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IChwcm92aWRlZCwgc25hcHNob3QpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPElubmVyU3BhY2VQYW5lbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgey4uLnByb3ZpZGVkLmRyb3BwYWJsZVByb3BzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNQYW5lbENvbGxhcHNlZD17aXNQYW5lbENvbGxhcHNlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFBhbmVsQ29sbGFwc2VkPXtzZXRQYW5lbENvbGxhcHNlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzRHJhZ2dpbmdPdmVyPXtzbmFwc2hvdC5pc0RyYWdnaW5nT3Zlcn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlubmVyUmVmPXtwcm92aWRlZC5pbm5lclJlZn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBwcm92aWRlZC5wbGFjZWhvbGRlciB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvSW5uZXJTcGFjZVBhbmVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9Ecm9wcGFibGU+XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxRdWlja1NldHRpbmdzQnV0dG9uIGlzUGFuZWxDb2xsYXBzZWQ9e2lzUGFuZWxDb2xsYXBzZWR9IC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICkgfVxuICAgICAgICAgICAgPC9Sb3ZpbmdUYWJJbmRleFByb3ZpZGVyPlxuICAgICAgICA8L0RyYWdEcm9wQ29udGV4dD5cbiAgICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgU3BhY2VQYW5lbDtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFZQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFTQTs7QUFDQTs7QUFLQTs7QUFJQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFFQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7OztBQUVBLE1BQU1BLFNBQVMs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