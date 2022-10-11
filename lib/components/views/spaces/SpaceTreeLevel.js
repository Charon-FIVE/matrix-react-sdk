"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SpaceItem = exports.SpaceButton = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _room = require("matrix-js-sdk/src/models/room");

var _RoomAvatar = _interopRequireDefault(require("../avatars/RoomAvatar"));

var _SpaceStore = _interopRequireDefault(require("../../../stores/spaces/SpaceStore"));

var _SpaceTreeLevelLayoutStore = _interopRequireDefault(require("../../../stores/spaces/SpaceTreeLevelLayoutStore"));

var _NotificationBadge = _interopRequireDefault(require("../rooms/NotificationBadge"));

var _languageHandler = require("../../../languageHandler");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _actions = require("../../../dispatcher/actions");

var _ContextMenuTooltipButton = require("../../../accessibility/context_menu/ContextMenuTooltipButton");

var _ContextMenu = require("../../structures/ContextMenu");

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _StaticNotificationState = require("../../../stores/notifications/StaticNotificationState");

var _NotificationColor = require("../../../stores/notifications/NotificationColor");

var _KeyBindingsManager = require("../../../KeyBindingsManager");

var _SpaceContextMenu = _interopRequireDefault(require("../context_menus/SpaceContextMenu"));

var _AccessibleTooltipButton = _interopRequireDefault(require("../elements/AccessibleTooltipButton"));

var _RovingTabIndex = require("../../../accessibility/RovingTabIndex");

var _KeyboardShortcuts = require("../../../accessibility/KeyboardShortcuts");

const _excluded = ["space", "spaceKey", "className", "selected", "label", "contextMenuTooltip", "notificationState", "avatarSize", "isNarrow", "children", "ContextMenuComponent"],
      _excluded2 = ["space", "activeSpaces", "isNested", "isPanelCollapsed", "onExpand", "parents", "innerRef", "dragHandleProps"],
      _excluded3 = ["tabIndex"];

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const SpaceButton = _ref => {
  let {
    space,
    spaceKey,
    className,
    selected,
    label,
    contextMenuTooltip,
    notificationState,
    avatarSize,
    isNarrow,
    children,
    ContextMenuComponent
  } = _ref,
      props = (0, _objectWithoutProperties2.default)(_ref, _excluded);
  const [menuDisplayed, ref, openMenu, closeMenu] = (0, _ContextMenu.useContextMenu)();
  const [onFocus, isActive, handle] = (0, _RovingTabIndex.useRovingTabIndex)(ref);
  const tabIndex = isActive ? 0 : -1;

  let avatar = /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceButton_avatarPlaceholder"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceButton_icon"
  }));

  if (space) {
    avatar = /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
      width: avatarSize,
      height: avatarSize,
      room: space
    });
  }

  let notifBadge;

  if (notificationState) {
    let ariaLabel = (0, _languageHandler._t)("Jump to first unread room.");

    if (space?.getMyMembership() === "invite") {
      ariaLabel = (0, _languageHandler._t)("Jump to first invite.");
    }

    const jumpToNotification = ev => {
      ev.stopPropagation();
      ev.preventDefault();

      _SpaceStore.default.instance.setActiveRoomInSpace(spaceKey ?? space.roomId);
    };

    notifBadge = /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SpacePanel_badgeContainer"
    }, /*#__PURE__*/_react.default.createElement(_NotificationBadge.default, {
      onClick: jumpToNotification,
      forceCount: false,
      notification: notificationState,
      "aria-label": ariaLabel,
      tabIndex: tabIndex,
      showUnsentTooltip: true
    }));
  }

  let contextMenu;

  if (menuDisplayed && ContextMenuComponent) {
    contextMenu = /*#__PURE__*/_react.default.createElement(ContextMenuComponent, (0, _extends2.default)({}, (0, _ContextMenu.toRightOf)(handle.current?.getBoundingClientRect(), 0), {
      space: space,
      onFinished: closeMenu
    }));
  }

  const viewSpaceHome = () => _dispatcher.default.dispatch({
    action: _actions.Action.ViewRoom,
    room_id: space.roomId
  });

  const activateSpace = () => _SpaceStore.default.instance.setActiveSpace(spaceKey ?? space.roomId);

  const onClick = props.onClick ?? (selected && space ? viewSpaceHome : activateSpace);
  return /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, (0, _extends2.default)({}, props, {
    className: (0, _classnames.default)("mx_SpaceButton", className, {
      mx_SpaceButton_active: selected,
      mx_SpaceButton_hasMenuOpen: menuDisplayed,
      mx_SpaceButton_narrow: isNarrow
    }),
    title: label,
    onClick: onClick,
    onContextMenu: openMenu,
    forceHide: !isNarrow || menuDisplayed,
    inputRef: handle,
    tabIndex: tabIndex,
    onFocus: onFocus
  }), children, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceButton_selectionWrapper"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceButton_avatarWrapper"
  }, avatar, notifBadge), !isNarrow && /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_SpaceButton_name"
  }, label), ContextMenuComponent && /*#__PURE__*/_react.default.createElement(_ContextMenuTooltipButton.ContextMenuTooltipButton, {
    className: "mx_SpaceButton_menuButton",
    onClick: openMenu,
    title: contextMenuTooltip,
    isExpanded: menuDisplayed
  }), contextMenu));
};

exports.SpaceButton = SpaceButton;

class SpaceItem extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "buttonRef", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "onSpaceUpdate", () => {
      this.setState({
        childSpaces: this.childSpaces
      });
    });
    (0, _defineProperty2.default)(this, "onRoomNameChange", () => {
      this.setState({
        name: this.props.space.name
      });
    });
    (0, _defineProperty2.default)(this, "toggleCollapse", evt => {
      if (this.props.onExpand && this.isCollapsed) {
        this.props.onExpand();
      }

      const newCollapsedState = !this.isCollapsed;

      _SpaceTreeLevelLayoutStore.default.instance.setSpaceCollapsedState(this.props.space.roomId, this.props.parents, newCollapsedState);

      this.setState({
        collapsed: newCollapsedState
      }); // don't bubble up so encapsulating button for space
      // doesn't get triggered

      evt.stopPropagation();
    });
    (0, _defineProperty2.default)(this, "onKeyDown", ev => {
      let handled = true;
      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getRoomListAction(ev);
      const hasChildren = this.state.childSpaces?.length;

      switch (action) {
        case _KeyboardShortcuts.KeyBindingAction.CollapseRoomListSection:
          if (hasChildren && !this.isCollapsed) {
            this.toggleCollapse(ev);
          } else {
            const parentItem = this.buttonRef?.current?.parentElement?.parentElement;
            const parentButton = parentItem?.previousElementSibling;
            parentButton?.focus();
          }

          break;

        case _KeyboardShortcuts.KeyBindingAction.ExpandRoomListSection:
          if (hasChildren) {
            if (this.isCollapsed) {
              this.toggleCollapse(ev);
            } else {
              const childLevel = this.buttonRef?.current?.nextElementSibling;
              const firstSpaceItemChild = childLevel?.querySelector(".mx_SpaceItem");
              firstSpaceItemChild?.querySelector(".mx_SpaceButton")?.focus();
            }
          }

          break;

        default:
          handled = false;
      }

      if (handled) {
        ev.stopPropagation();
        ev.preventDefault();
      }
    });

    const collapsed = _SpaceTreeLevelLayoutStore.default.instance.getSpaceCollapsedState(props.space.roomId, this.props.parents, !props.isNested // default to collapsed for root items
    );

    this.state = {
      name: this.props.space.name,
      collapsed,
      childSpaces: this.childSpaces
    };

    _SpaceStore.default.instance.on(this.props.space.roomId, this.onSpaceUpdate);

    this.props.space.on(_room.RoomEvent.Name, this.onRoomNameChange);
  }

  componentWillUnmount() {
    _SpaceStore.default.instance.off(this.props.space.roomId, this.onSpaceUpdate);

    this.props.space.off(_room.RoomEvent.Name, this.onRoomNameChange);
  }

  get childSpaces() {
    return _SpaceStore.default.instance.getChildSpaces(this.props.space.roomId).filter(s => !this.props.parents?.has(s.roomId));
  }

  get isCollapsed() {
    return this.state.collapsed || this.props.isPanelCollapsed;
  }

  render() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _this$props = this.props,
          {
      space,
      activeSpaces,
      isNested,
      isPanelCollapsed,
      onExpand,
      parents,
      innerRef,
      dragHandleProps
    } = _this$props,
          otherProps = (0, _objectWithoutProperties2.default)(_this$props, _excluded2);
    const collapsed = this.isCollapsed;
    const itemClasses = (0, _classnames.default)(this.props.className, {
      "mx_SpaceItem": true,
      "mx_SpaceItem_narrow": isPanelCollapsed,
      "collapsed": collapsed,
      "hasSubSpaces": this.state.childSpaces?.length
    });
    const isInvite = space.getMyMembership() === "invite";
    const notificationState = isInvite ? _StaticNotificationState.StaticNotificationState.forSymbol("!", _NotificationColor.NotificationColor.Red) : _SpaceStore.default.instance.getNotificationState(space.roomId);
    const hasChildren = this.state.childSpaces?.length;
    let childItems;

    if (hasChildren && !collapsed) {
      childItems = /*#__PURE__*/_react.default.createElement(SpaceTreeLevel, {
        spaces: this.state.childSpaces,
        activeSpaces: activeSpaces,
        isNested: true,
        parents: new Set(parents).add(space.roomId)
      });
    }

    const toggleCollapseButton = hasChildren ? /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_SpaceButton_toggleCollapse",
      onClick: this.toggleCollapse,
      tabIndex: -1,
      "aria-label": collapsed ? (0, _languageHandler._t)("Expand") : (0, _languageHandler._t)("Collapse")
    }) : null; // eslint-disable-next-line @typescript-eslint/no-unused-vars

    const _ref2 = dragHandleProps || {},
          {
      tabIndex
    } = _ref2,
          restDragHandleProps = (0, _objectWithoutProperties2.default)(_ref2, _excluded3);

    const selected = activeSpaces.includes(space.roomId);
    return /*#__PURE__*/_react.default.createElement("li", (0, _extends2.default)({}, otherProps, {
      className: itemClasses,
      ref: innerRef,
      "aria-expanded": hasChildren ? !collapsed : undefined,
      "aria-selected": selected,
      role: "treeitem"
    }), /*#__PURE__*/_react.default.createElement(SpaceButton, (0, _extends2.default)({}, restDragHandleProps, {
      space: space,
      className: isInvite ? "mx_SpaceButton_invite" : undefined,
      selected: selected,
      label: this.state.name,
      contextMenuTooltip: (0, _languageHandler._t)("Space options"),
      notificationState: notificationState,
      isNarrow: isPanelCollapsed,
      avatarSize: isNested ? 24 : 32,
      onKeyDown: this.onKeyDown,
      ContextMenuComponent: this.props.space.getMyMembership() === "join" ? _SpaceContextMenu.default : undefined
    }), toggleCollapseButton), childItems);
  }

}

exports.SpaceItem = SpaceItem;
(0, _defineProperty2.default)(SpaceItem, "contextType", _MatrixClientContext.default);

const SpaceTreeLevel = _ref3 => {
  let {
    spaces,
    activeSpaces,
    isNested,
    parents
  } = _ref3;
  return /*#__PURE__*/_react.default.createElement("ul", {
    className: "mx_SpaceTreeLevel",
    role: "group"
  }, spaces.map(s => {
    return /*#__PURE__*/_react.default.createElement(SpaceItem, {
      key: s.roomId,
      activeSpaces: activeSpaces,
      space: s,
      isNested: isNested,
      parents: parents
    });
  }));
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTcGFjZUJ1dHRvbiIsInNwYWNlIiwic3BhY2VLZXkiLCJjbGFzc05hbWUiLCJzZWxlY3RlZCIsImxhYmVsIiwiY29udGV4dE1lbnVUb29sdGlwIiwibm90aWZpY2F0aW9uU3RhdGUiLCJhdmF0YXJTaXplIiwiaXNOYXJyb3ciLCJjaGlsZHJlbiIsIkNvbnRleHRNZW51Q29tcG9uZW50IiwicHJvcHMiLCJtZW51RGlzcGxheWVkIiwicmVmIiwib3Blbk1lbnUiLCJjbG9zZU1lbnUiLCJ1c2VDb250ZXh0TWVudSIsIm9uRm9jdXMiLCJpc0FjdGl2ZSIsImhhbmRsZSIsInVzZVJvdmluZ1RhYkluZGV4IiwidGFiSW5kZXgiLCJhdmF0YXIiLCJub3RpZkJhZGdlIiwiYXJpYUxhYmVsIiwiX3QiLCJnZXRNeU1lbWJlcnNoaXAiLCJqdW1wVG9Ob3RpZmljYXRpb24iLCJldiIsInN0b3BQcm9wYWdhdGlvbiIsInByZXZlbnREZWZhdWx0IiwiU3BhY2VTdG9yZSIsImluc3RhbmNlIiwic2V0QWN0aXZlUm9vbUluU3BhY2UiLCJyb29tSWQiLCJjb250ZXh0TWVudSIsInRvUmlnaHRPZiIsImN1cnJlbnQiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJ2aWV3U3BhY2VIb21lIiwiZGVmYXVsdERpc3BhdGNoZXIiLCJkaXNwYXRjaCIsImFjdGlvbiIsIkFjdGlvbiIsIlZpZXdSb29tIiwicm9vbV9pZCIsImFjdGl2YXRlU3BhY2UiLCJzZXRBY3RpdmVTcGFjZSIsIm9uQ2xpY2siLCJjbGFzc05hbWVzIiwibXhfU3BhY2VCdXR0b25fYWN0aXZlIiwibXhfU3BhY2VCdXR0b25faGFzTWVudU9wZW4iLCJteF9TcGFjZUJ1dHRvbl9uYXJyb3ciLCJTcGFjZUl0ZW0iLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsImNyZWF0ZVJlZiIsInNldFN0YXRlIiwiY2hpbGRTcGFjZXMiLCJuYW1lIiwiZXZ0Iiwib25FeHBhbmQiLCJpc0NvbGxhcHNlZCIsIm5ld0NvbGxhcHNlZFN0YXRlIiwiU3BhY2VUcmVlTGV2ZWxMYXlvdXRTdG9yZSIsInNldFNwYWNlQ29sbGFwc2VkU3RhdGUiLCJwYXJlbnRzIiwiY29sbGFwc2VkIiwiaGFuZGxlZCIsImdldEtleUJpbmRpbmdzTWFuYWdlciIsImdldFJvb21MaXN0QWN0aW9uIiwiaGFzQ2hpbGRyZW4iLCJzdGF0ZSIsImxlbmd0aCIsIktleUJpbmRpbmdBY3Rpb24iLCJDb2xsYXBzZVJvb21MaXN0U2VjdGlvbiIsInRvZ2dsZUNvbGxhcHNlIiwicGFyZW50SXRlbSIsImJ1dHRvblJlZiIsInBhcmVudEVsZW1lbnQiLCJwYXJlbnRCdXR0b24iLCJwcmV2aW91c0VsZW1lbnRTaWJsaW5nIiwiZm9jdXMiLCJFeHBhbmRSb29tTGlzdFNlY3Rpb24iLCJjaGlsZExldmVsIiwibmV4dEVsZW1lbnRTaWJsaW5nIiwiZmlyc3RTcGFjZUl0ZW1DaGlsZCIsInF1ZXJ5U2VsZWN0b3IiLCJnZXRTcGFjZUNvbGxhcHNlZFN0YXRlIiwiaXNOZXN0ZWQiLCJvbiIsIm9uU3BhY2VVcGRhdGUiLCJSb29tRXZlbnQiLCJOYW1lIiwib25Sb29tTmFtZUNoYW5nZSIsImNvbXBvbmVudFdpbGxVbm1vdW50Iiwib2ZmIiwiZ2V0Q2hpbGRTcGFjZXMiLCJmaWx0ZXIiLCJzIiwiaGFzIiwiaXNQYW5lbENvbGxhcHNlZCIsInJlbmRlciIsImFjdGl2ZVNwYWNlcyIsImlubmVyUmVmIiwiZHJhZ0hhbmRsZVByb3BzIiwib3RoZXJQcm9wcyIsIml0ZW1DbGFzc2VzIiwiaXNJbnZpdGUiLCJTdGF0aWNOb3RpZmljYXRpb25TdGF0ZSIsImZvclN5bWJvbCIsIk5vdGlmaWNhdGlvbkNvbG9yIiwiUmVkIiwiZ2V0Tm90aWZpY2F0aW9uU3RhdGUiLCJjaGlsZEl0ZW1zIiwiU2V0IiwiYWRkIiwidG9nZ2xlQ29sbGFwc2VCdXR0b24iLCJyZXN0RHJhZ0hhbmRsZVByb3BzIiwiaW5jbHVkZXMiLCJ1bmRlZmluZWQiLCJvbktleURvd24iLCJTcGFjZUNvbnRleHRNZW51IiwiTWF0cml4Q2xpZW50Q29udGV4dCIsIlNwYWNlVHJlZUxldmVsIiwic3BhY2VzIiwibWFwIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3Mvc3BhY2VzL1NwYWNlVHJlZUxldmVsLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgTW91c2VFdmVudCwgQ29tcG9uZW50UHJvcHMsIENvbXBvbmVudFR5cGUsIGNyZWF0ZVJlZiwgSW5wdXRIVE1MQXR0cmlidXRlcywgTGVnYWN5UmVmIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tIFwiY2xhc3NuYW1lc1wiO1xuaW1wb3J0IHsgUm9vbSwgUm9vbUV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQgeyBEcmFnZ2FibGVQcm92aWRlZERyYWdIYW5kbGVQcm9wcyB9IGZyb20gXCJyZWFjdC1iZWF1dGlmdWwtZG5kXCI7XG5cbmltcG9ydCBSb29tQXZhdGFyIGZyb20gXCIuLi9hdmF0YXJzL1Jvb21BdmF0YXJcIjtcbmltcG9ydCBTcGFjZVN0b3JlIGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvc3BhY2VzL1NwYWNlU3RvcmVcIjtcbmltcG9ydCB7IFNwYWNlS2V5IH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9zcGFjZXNcIjtcbmltcG9ydCBTcGFjZVRyZWVMZXZlbExheW91dFN0b3JlIGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvc3BhY2VzL1NwYWNlVHJlZUxldmVsTGF5b3V0U3RvcmVcIjtcbmltcG9ydCBOb3RpZmljYXRpb25CYWRnZSBmcm9tIFwiLi4vcm9vbXMvTm90aWZpY2F0aW9uQmFkZ2VcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IGRlZmF1bHREaXNwYXRjaGVyIGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcbmltcG9ydCB7IENvbnRleHRNZW51VG9vbHRpcEJ1dHRvbiB9IGZyb20gXCIuLi8uLi8uLi9hY2Nlc3NpYmlsaXR5L2NvbnRleHRfbWVudS9Db250ZXh0TWVudVRvb2x0aXBCdXR0b25cIjtcbmltcG9ydCB7IHRvUmlnaHRPZiwgdXNlQ29udGV4dE1lbnUgfSBmcm9tIFwiLi4vLi4vc3RydWN0dXJlcy9Db250ZXh0TWVudVwiO1xuaW1wb3J0IE1hdHJpeENsaWVudENvbnRleHQgZnJvbSBcIi4uLy4uLy4uL2NvbnRleHRzL01hdHJpeENsaWVudENvbnRleHRcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uLCB7IEJ1dHRvbkV2ZW50IH0gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCB7IFN0YXRpY05vdGlmaWNhdGlvblN0YXRlIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9ub3RpZmljYXRpb25zL1N0YXRpY05vdGlmaWNhdGlvblN0YXRlXCI7XG5pbXBvcnQgeyBOb3RpZmljYXRpb25Db2xvciB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvbm90aWZpY2F0aW9ucy9Ob3RpZmljYXRpb25Db2xvclwiO1xuaW1wb3J0IHsgZ2V0S2V5QmluZGluZ3NNYW5hZ2VyIH0gZnJvbSBcIi4uLy4uLy4uL0tleUJpbmRpbmdzTWFuYWdlclwiO1xuaW1wb3J0IHsgTm90aWZpY2F0aW9uU3RhdGUgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL25vdGlmaWNhdGlvbnMvTm90aWZpY2F0aW9uU3RhdGVcIjtcbmltcG9ydCBTcGFjZUNvbnRleHRNZW51IGZyb20gXCIuLi9jb250ZXh0X21lbnVzL1NwYWNlQ29udGV4dE1lbnVcIjtcbmltcG9ydCBBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cIjtcbmltcG9ydCB7IHVzZVJvdmluZ1RhYkluZGV4IH0gZnJvbSBcIi4uLy4uLy4uL2FjY2Vzc2liaWxpdHkvUm92aW5nVGFiSW5kZXhcIjtcbmltcG9ydCB7IEtleUJpbmRpbmdBY3Rpb24gfSBmcm9tIFwiLi4vLi4vLi4vYWNjZXNzaWJpbGl0eS9LZXlib2FyZFNob3J0Y3V0c1wiO1xuXG5pbnRlcmZhY2UgSUJ1dHRvblByb3BzIGV4dGVuZHMgT21pdDxDb21wb25lbnRQcm9wczx0eXBlb2YgQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24+LCBcInRpdGxlXCIgfCBcIm9uQ2xpY2tcIj4ge1xuICAgIHNwYWNlPzogUm9vbTtcbiAgICBzcGFjZUtleT86IFNwYWNlS2V5O1xuICAgIGNsYXNzTmFtZT86IHN0cmluZztcbiAgICBzZWxlY3RlZD86IGJvb2xlYW47XG4gICAgbGFiZWw6IHN0cmluZztcbiAgICBjb250ZXh0TWVudVRvb2x0aXA/OiBzdHJpbmc7XG4gICAgbm90aWZpY2F0aW9uU3RhdGU/OiBOb3RpZmljYXRpb25TdGF0ZTtcbiAgICBpc05hcnJvdz86IGJvb2xlYW47XG4gICAgYXZhdGFyU2l6ZT86IG51bWJlcjtcbiAgICBDb250ZXh0TWVudUNvbXBvbmVudD86IENvbXBvbmVudFR5cGU8Q29tcG9uZW50UHJvcHM8dHlwZW9mIFNwYWNlQ29udGV4dE1lbnU+PjtcbiAgICBvbkNsaWNrPyhldj86IEJ1dHRvbkV2ZW50KTogdm9pZDtcbn1cblxuZXhwb3J0IGNvbnN0IFNwYWNlQnV0dG9uOiBSZWFjdC5GQzxJQnV0dG9uUHJvcHM+ID0gKHtcbiAgICBzcGFjZSxcbiAgICBzcGFjZUtleSxcbiAgICBjbGFzc05hbWUsXG4gICAgc2VsZWN0ZWQsXG4gICAgbGFiZWwsXG4gICAgY29udGV4dE1lbnVUb29sdGlwLFxuICAgIG5vdGlmaWNhdGlvblN0YXRlLFxuICAgIGF2YXRhclNpemUsXG4gICAgaXNOYXJyb3csXG4gICAgY2hpbGRyZW4sXG4gICAgQ29udGV4dE1lbnVDb21wb25lbnQsXG4gICAgLi4ucHJvcHNcbn0pID0+IHtcbiAgICBjb25zdCBbbWVudURpc3BsYXllZCwgcmVmLCBvcGVuTWVudSwgY2xvc2VNZW51XSA9IHVzZUNvbnRleHRNZW51PEhUTUxFbGVtZW50PigpO1xuICAgIGNvbnN0IFtvbkZvY3VzLCBpc0FjdGl2ZSwgaGFuZGxlXSA9IHVzZVJvdmluZ1RhYkluZGV4KHJlZik7XG4gICAgY29uc3QgdGFiSW5kZXggPSBpc0FjdGl2ZSA/IDAgOiAtMTtcblxuICAgIGxldCBhdmF0YXIgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X1NwYWNlQnV0dG9uX2F2YXRhclBsYWNlaG9sZGVyXCI+PGRpdiBjbGFzc05hbWU9XCJteF9TcGFjZUJ1dHRvbl9pY29uXCIgLz48L2Rpdj47XG4gICAgaWYgKHNwYWNlKSB7XG4gICAgICAgIGF2YXRhciA9IDxSb29tQXZhdGFyIHdpZHRoPXthdmF0YXJTaXplfSBoZWlnaHQ9e2F2YXRhclNpemV9IHJvb209e3NwYWNlfSAvPjtcbiAgICB9XG5cbiAgICBsZXQgbm90aWZCYWRnZTtcbiAgICBpZiAobm90aWZpY2F0aW9uU3RhdGUpIHtcbiAgICAgICAgbGV0IGFyaWFMYWJlbCA9IF90KFwiSnVtcCB0byBmaXJzdCB1bnJlYWQgcm9vbS5cIik7XG4gICAgICAgIGlmIChzcGFjZT8uZ2V0TXlNZW1iZXJzaGlwKCkgPT09IFwiaW52aXRlXCIpIHtcbiAgICAgICAgICAgIGFyaWFMYWJlbCA9IF90KFwiSnVtcCB0byBmaXJzdCBpbnZpdGUuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QganVtcFRvTm90aWZpY2F0aW9uID0gKGV2OiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBTcGFjZVN0b3JlLmluc3RhbmNlLnNldEFjdGl2ZVJvb21JblNwYWNlKHNwYWNlS2V5ID8/IHNwYWNlLnJvb21JZCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgbm90aWZCYWRnZSA9IDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VQYW5lbF9iYWRnZUNvbnRhaW5lclwiPlxuICAgICAgICAgICAgPE5vdGlmaWNhdGlvbkJhZGdlXG4gICAgICAgICAgICAgICAgb25DbGljaz17anVtcFRvTm90aWZpY2F0aW9ufVxuICAgICAgICAgICAgICAgIGZvcmNlQ291bnQ9e2ZhbHNlfVxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbj17bm90aWZpY2F0aW9uU3RhdGV9XG4gICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17YXJpYUxhYmVsfVxuICAgICAgICAgICAgICAgIHRhYkluZGV4PXt0YWJJbmRleH1cbiAgICAgICAgICAgICAgICBzaG93VW5zZW50VG9vbHRpcD17dHJ1ZX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PjtcbiAgICB9XG5cbiAgICBsZXQgY29udGV4dE1lbnU6IEpTWC5FbGVtZW50O1xuICAgIGlmIChtZW51RGlzcGxheWVkICYmIENvbnRleHRNZW51Q29tcG9uZW50KSB7XG4gICAgICAgIGNvbnRleHRNZW51ID0gPENvbnRleHRNZW51Q29tcG9uZW50XG4gICAgICAgICAgICB7Li4udG9SaWdodE9mKGhhbmRsZS5jdXJyZW50Py5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSwgMCl9XG4gICAgICAgICAgICBzcGFjZT17c3BhY2V9XG4gICAgICAgICAgICBvbkZpbmlzaGVkPXtjbG9zZU1lbnV9XG4gICAgICAgIC8+O1xuICAgIH1cblxuICAgIGNvbnN0IHZpZXdTcGFjZUhvbWUgPSAoKSA9PiBkZWZhdWx0RGlzcGF0Y2hlci5kaXNwYXRjaCh7IGFjdGlvbjogQWN0aW9uLlZpZXdSb29tLCByb29tX2lkOiBzcGFjZS5yb29tSWQgfSk7XG4gICAgY29uc3QgYWN0aXZhdGVTcGFjZSA9ICgpID0+IFNwYWNlU3RvcmUuaW5zdGFuY2Uuc2V0QWN0aXZlU3BhY2Uoc3BhY2VLZXkgPz8gc3BhY2Uucm9vbUlkKTtcbiAgICBjb25zdCBvbkNsaWNrID0gcHJvcHMub25DbGljayA/PyAoc2VsZWN0ZWQgJiYgc3BhY2UgPyB2aWV3U3BhY2VIb21lIDogYWN0aXZhdGVTcGFjZSk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgICA8QWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cbiAgICAgICAgICAgIHsuLi5wcm9wc31cbiAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X1NwYWNlQnV0dG9uXCIsIGNsYXNzTmFtZSwge1xuICAgICAgICAgICAgICAgIG14X1NwYWNlQnV0dG9uX2FjdGl2ZTogc2VsZWN0ZWQsXG4gICAgICAgICAgICAgICAgbXhfU3BhY2VCdXR0b25faGFzTWVudU9wZW46IG1lbnVEaXNwbGF5ZWQsXG4gICAgICAgICAgICAgICAgbXhfU3BhY2VCdXR0b25fbmFycm93OiBpc05hcnJvdyxcbiAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgdGl0bGU9e2xhYmVsfVxuICAgICAgICAgICAgb25DbGljaz17b25DbGlja31cbiAgICAgICAgICAgIG9uQ29udGV4dE1lbnU9e29wZW5NZW51fVxuICAgICAgICAgICAgZm9yY2VIaWRlPXshaXNOYXJyb3cgfHwgbWVudURpc3BsYXllZH1cbiAgICAgICAgICAgIGlucHV0UmVmPXtoYW5kbGV9XG4gICAgICAgICAgICB0YWJJbmRleD17dGFiSW5kZXh9XG4gICAgICAgICAgICBvbkZvY3VzPXtvbkZvY3VzfVxuICAgICAgICA+XG4gICAgICAgICAgICB7IGNoaWxkcmVuIH1cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VCdXR0b25fc2VsZWN0aW9uV3JhcHBlclwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VCdXR0b25fYXZhdGFyV3JhcHBlclwiPlxuICAgICAgICAgICAgICAgICAgICB7IGF2YXRhciB9XG4gICAgICAgICAgICAgICAgICAgIHsgbm90aWZCYWRnZSB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgeyAhaXNOYXJyb3cgJiYgPHNwYW4gY2xhc3NOYW1lPVwibXhfU3BhY2VCdXR0b25fbmFtZVwiPnsgbGFiZWwgfTwvc3Bhbj4gfVxuXG4gICAgICAgICAgICAgICAgeyBDb250ZXh0TWVudUNvbXBvbmVudCAmJiA8Q29udGV4dE1lbnVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1NwYWNlQnV0dG9uX21lbnVCdXR0b25cIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXtvcGVuTWVudX1cbiAgICAgICAgICAgICAgICAgICAgdGl0bGU9e2NvbnRleHRNZW51VG9vbHRpcH1cbiAgICAgICAgICAgICAgICAgICAgaXNFeHBhbmRlZD17bWVudURpc3BsYXllZH1cbiAgICAgICAgICAgICAgICAvPiB9XG5cbiAgICAgICAgICAgICAgICB7IGNvbnRleHRNZW51IH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L0FjY2Vzc2libGVUb29sdGlwQnV0dG9uPlxuICAgICk7XG59O1xuXG5pbnRlcmZhY2UgSUl0ZW1Qcm9wcyBleHRlbmRzIElucHV0SFRNTEF0dHJpYnV0ZXM8SFRNTExJRWxlbWVudD4ge1xuICAgIHNwYWNlOiBSb29tO1xuICAgIGFjdGl2ZVNwYWNlczogU3BhY2VLZXlbXTtcbiAgICBpc05lc3RlZD86IGJvb2xlYW47XG4gICAgaXNQYW5lbENvbGxhcHNlZD86IGJvb2xlYW47XG4gICAgb25FeHBhbmQ/OiBGdW5jdGlvbjtcbiAgICBwYXJlbnRzPzogU2V0PHN0cmluZz47XG4gICAgaW5uZXJSZWY/OiBMZWdhY3lSZWY8SFRNTExJRWxlbWVudD47XG4gICAgZHJhZ0hhbmRsZVByb3BzPzogRHJhZ2dhYmxlUHJvdmlkZWREcmFnSGFuZGxlUHJvcHM7XG59XG5cbmludGVyZmFjZSBJSXRlbVN0YXRlIHtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgY29sbGFwc2VkOiBib29sZWFuO1xuICAgIGNoaWxkU3BhY2VzOiBSb29tW107XG59XG5cbmV4cG9ydCBjbGFzcyBTcGFjZUl0ZW0gZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElJdGVtUHJvcHMsIElJdGVtU3RhdGU+IHtcbiAgICBzdGF0aWMgY29udGV4dFR5cGUgPSBNYXRyaXhDbGllbnRDb250ZXh0O1xuXG4gICAgcHJpdmF0ZSBidXR0b25SZWYgPSBjcmVhdGVSZWY8SFRNTERpdkVsZW1lbnQ+KCk7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgY29uc3QgY29sbGFwc2VkID0gU3BhY2VUcmVlTGV2ZWxMYXlvdXRTdG9yZS5pbnN0YW5jZS5nZXRTcGFjZUNvbGxhcHNlZFN0YXRlKFxuICAgICAgICAgICAgcHJvcHMuc3BhY2Uucm9vbUlkLFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5wYXJlbnRzLFxuICAgICAgICAgICAgIXByb3BzLmlzTmVzdGVkLCAvLyBkZWZhdWx0IHRvIGNvbGxhcHNlZCBmb3Igcm9vdCBpdGVtc1xuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBuYW1lOiB0aGlzLnByb3BzLnNwYWNlLm5hbWUsXG4gICAgICAgICAgICBjb2xsYXBzZWQsXG4gICAgICAgICAgICBjaGlsZFNwYWNlczogdGhpcy5jaGlsZFNwYWNlcyxcbiAgICAgICAgfTtcblxuICAgICAgICBTcGFjZVN0b3JlLmluc3RhbmNlLm9uKHRoaXMucHJvcHMuc3BhY2Uucm9vbUlkLCB0aGlzLm9uU3BhY2VVcGRhdGUpO1xuICAgICAgICB0aGlzLnByb3BzLnNwYWNlLm9uKFJvb21FdmVudC5OYW1lLCB0aGlzLm9uUm9vbU5hbWVDaGFuZ2UpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBTcGFjZVN0b3JlLmluc3RhbmNlLm9mZih0aGlzLnByb3BzLnNwYWNlLnJvb21JZCwgdGhpcy5vblNwYWNlVXBkYXRlKTtcbiAgICAgICAgdGhpcy5wcm9wcy5zcGFjZS5vZmYoUm9vbUV2ZW50Lk5hbWUsIHRoaXMub25Sb29tTmFtZUNoYW5nZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblNwYWNlVXBkYXRlID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGNoaWxkU3BhY2VzOiB0aGlzLmNoaWxkU3BhY2VzLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJvb21OYW1lQ2hhbmdlID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIG5hbWU6IHRoaXMucHJvcHMuc3BhY2UubmFtZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgZ2V0IGNoaWxkU3BhY2VzKCkge1xuICAgICAgICByZXR1cm4gU3BhY2VTdG9yZS5pbnN0YW5jZS5nZXRDaGlsZFNwYWNlcyh0aGlzLnByb3BzLnNwYWNlLnJvb21JZClcbiAgICAgICAgICAgIC5maWx0ZXIocyA9PiAhdGhpcy5wcm9wcy5wYXJlbnRzPy5oYXMocy5yb29tSWQpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldCBpc0NvbGxhcHNlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuY29sbGFwc2VkIHx8IHRoaXMucHJvcHMuaXNQYW5lbENvbGxhcHNlZDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHRvZ2dsZUNvbGxhcHNlID0gZXZ0ID0+IHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25FeHBhbmQgJiYgdGhpcy5pc0NvbGxhcHNlZCkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkV4cGFuZCgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5ld0NvbGxhcHNlZFN0YXRlID0gIXRoaXMuaXNDb2xsYXBzZWQ7XG5cbiAgICAgICAgU3BhY2VUcmVlTGV2ZWxMYXlvdXRTdG9yZS5pbnN0YW5jZS5zZXRTcGFjZUNvbGxhcHNlZFN0YXRlKFxuICAgICAgICAgICAgdGhpcy5wcm9wcy5zcGFjZS5yb29tSWQsXG4gICAgICAgICAgICB0aGlzLnByb3BzLnBhcmVudHMsXG4gICAgICAgICAgICBuZXdDb2xsYXBzZWRTdGF0ZSxcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvbGxhcHNlZDogbmV3Q29sbGFwc2VkU3RhdGUgfSk7XG4gICAgICAgIC8vIGRvbid0IGJ1YmJsZSB1cCBzbyBlbmNhcHN1bGF0aW5nIGJ1dHRvbiBmb3Igc3BhY2VcbiAgICAgICAgLy8gZG9lc24ndCBnZXQgdHJpZ2dlcmVkXG4gICAgICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbktleURvd24gPSAoZXY6IFJlYWN0LktleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgICAgbGV0IGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICBjb25zdCBhY3Rpb24gPSBnZXRLZXlCaW5kaW5nc01hbmFnZXIoKS5nZXRSb29tTGlzdEFjdGlvbihldik7XG4gICAgICAgIGNvbnN0IGhhc0NoaWxkcmVuID0gdGhpcy5zdGF0ZS5jaGlsZFNwYWNlcz8ubGVuZ3RoO1xuICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSBLZXlCaW5kaW5nQWN0aW9uLkNvbGxhcHNlUm9vbUxpc3RTZWN0aW9uOlxuICAgICAgICAgICAgICAgIGlmIChoYXNDaGlsZHJlbiAmJiAhdGhpcy5pc0NvbGxhcHNlZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUNvbGxhcHNlKGV2KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnRJdGVtID0gdGhpcy5idXR0b25SZWY/LmN1cnJlbnQ/LnBhcmVudEVsZW1lbnQ/LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcmVudEJ1dHRvbiA9IHBhcmVudEl0ZW0/LnByZXZpb3VzRWxlbWVudFNpYmxpbmcgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudEJ1dHRvbj8uZm9jdXMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5FeHBhbmRSb29tTGlzdFNlY3Rpb246XG4gICAgICAgICAgICAgICAgaWYgKGhhc0NoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzQ29sbGFwc2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUNvbGxhcHNlKGV2KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkTGV2ZWwgPSB0aGlzLmJ1dHRvblJlZj8uY3VycmVudD8ubmV4dEVsZW1lbnRTaWJsaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlyc3RTcGFjZUl0ZW1DaGlsZCA9IGNoaWxkTGV2ZWw/LnF1ZXJ5U2VsZWN0b3I8SFRNTExJRWxlbWVudD4oXCIubXhfU3BhY2VJdGVtXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RTcGFjZUl0ZW1DaGlsZD8ucXVlcnlTZWxlY3RvcjxIVE1MRGl2RWxlbWVudD4oXCIubXhfU3BhY2VCdXR0b25cIik/LmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgaGFuZGxlZCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGhhbmRsZWQpIHtcbiAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgICAgICAgY29uc3QgeyBzcGFjZSwgYWN0aXZlU3BhY2VzLCBpc05lc3RlZCwgaXNQYW5lbENvbGxhcHNlZCwgb25FeHBhbmQsIHBhcmVudHMsIGlubmVyUmVmLCBkcmFnSGFuZGxlUHJvcHMsXG4gICAgICAgICAgICAuLi5vdGhlclByb3BzIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgICAgIGNvbnN0IGNvbGxhcHNlZCA9IHRoaXMuaXNDb2xsYXBzZWQ7XG5cbiAgICAgICAgY29uc3QgaXRlbUNsYXNzZXMgPSBjbGFzc05hbWVzKHRoaXMucHJvcHMuY2xhc3NOYW1lLCB7XG4gICAgICAgICAgICBcIm14X1NwYWNlSXRlbVwiOiB0cnVlLFxuICAgICAgICAgICAgXCJteF9TcGFjZUl0ZW1fbmFycm93XCI6IGlzUGFuZWxDb2xsYXBzZWQsXG4gICAgICAgICAgICBcImNvbGxhcHNlZFwiOiBjb2xsYXBzZWQsXG4gICAgICAgICAgICBcImhhc1N1YlNwYWNlc1wiOiB0aGlzLnN0YXRlLmNoaWxkU3BhY2VzPy5sZW5ndGgsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGlzSW52aXRlID0gc3BhY2UuZ2V0TXlNZW1iZXJzaGlwKCkgPT09IFwiaW52aXRlXCI7XG5cbiAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uU3RhdGUgPSBpc0ludml0ZVxuICAgICAgICAgICAgPyBTdGF0aWNOb3RpZmljYXRpb25TdGF0ZS5mb3JTeW1ib2woXCIhXCIsIE5vdGlmaWNhdGlvbkNvbG9yLlJlZClcbiAgICAgICAgICAgIDogU3BhY2VTdG9yZS5pbnN0YW5jZS5nZXROb3RpZmljYXRpb25TdGF0ZShzcGFjZS5yb29tSWQpO1xuXG4gICAgICAgIGNvbnN0IGhhc0NoaWxkcmVuID0gdGhpcy5zdGF0ZS5jaGlsZFNwYWNlcz8ubGVuZ3RoO1xuXG4gICAgICAgIGxldCBjaGlsZEl0ZW1zO1xuICAgICAgICBpZiAoaGFzQ2hpbGRyZW4gJiYgIWNvbGxhcHNlZCkge1xuICAgICAgICAgICAgY2hpbGRJdGVtcyA9IDxTcGFjZVRyZWVMZXZlbFxuICAgICAgICAgICAgICAgIHNwYWNlcz17dGhpcy5zdGF0ZS5jaGlsZFNwYWNlc31cbiAgICAgICAgICAgICAgICBhY3RpdmVTcGFjZXM9e2FjdGl2ZVNwYWNlc31cbiAgICAgICAgICAgICAgICBpc05lc3RlZD17dHJ1ZX1cbiAgICAgICAgICAgICAgICBwYXJlbnRzPXtuZXcgU2V0KHBhcmVudHMpLmFkZChzcGFjZS5yb29tSWQpfVxuICAgICAgICAgICAgLz47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0b2dnbGVDb2xsYXBzZUJ1dHRvbiA9IGhhc0NoaWxkcmVuID9cbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfU3BhY2VCdXR0b25fdG9nZ2xlQ29sbGFwc2VcIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMudG9nZ2xlQ29sbGFwc2V9XG4gICAgICAgICAgICAgICAgdGFiSW5kZXg9ey0xfVxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e2NvbGxhcHNlZCA/IF90KFwiRXhwYW5kXCIpIDogX3QoXCJDb2xsYXBzZVwiKX1cbiAgICAgICAgICAgIC8+IDogbnVsbDtcblxuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gICAgICAgIGNvbnN0IHsgdGFiSW5kZXgsIC4uLnJlc3REcmFnSGFuZGxlUHJvcHMgfSA9IGRyYWdIYW5kbGVQcm9wcyB8fCB7fTtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWQgPSBhY3RpdmVTcGFjZXMuaW5jbHVkZXMoc3BhY2Uucm9vbUlkKTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGxpXG4gICAgICAgICAgICAgICAgey4uLm90aGVyUHJvcHN9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtpdGVtQ2xhc3Nlc31cbiAgICAgICAgICAgICAgICByZWY9e2lubmVyUmVmfVxuICAgICAgICAgICAgICAgIGFyaWEtZXhwYW5kZWQ9e2hhc0NoaWxkcmVuID8gIWNvbGxhcHNlZCA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICBhcmlhLXNlbGVjdGVkPXtzZWxlY3RlZH1cbiAgICAgICAgICAgICAgICByb2xlPVwidHJlZWl0ZW1cIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxTcGFjZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICB7Li4ucmVzdERyYWdIYW5kbGVQcm9wc31cbiAgICAgICAgICAgICAgICAgICAgc3BhY2U9e3NwYWNlfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2lzSW52aXRlID8gXCJteF9TcGFjZUJ1dHRvbl9pbnZpdGVcIiA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWQ9e3NlbGVjdGVkfVxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17dGhpcy5zdGF0ZS5uYW1lfVxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0TWVudVRvb2x0aXA9e190KFwiU3BhY2Ugb3B0aW9uc1wiKX1cbiAgICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uU3RhdGU9e25vdGlmaWNhdGlvblN0YXRlfVxuICAgICAgICAgICAgICAgICAgICBpc05hcnJvdz17aXNQYW5lbENvbGxhcHNlZH1cbiAgICAgICAgICAgICAgICAgICAgYXZhdGFyU2l6ZT17aXNOZXN0ZWQgPyAyNCA6IDMyfVxuICAgICAgICAgICAgICAgICAgICBvbktleURvd249e3RoaXMub25LZXlEb3dufVxuICAgICAgICAgICAgICAgICAgICBDb250ZXh0TWVudUNvbXBvbmVudD17dGhpcy5wcm9wcy5zcGFjZS5nZXRNeU1lbWJlcnNoaXAoKSA9PT0gXCJqb2luXCIgPyBTcGFjZUNvbnRleHRNZW51IDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgeyB0b2dnbGVDb2xsYXBzZUJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgPC9TcGFjZUJ1dHRvbj5cblxuICAgICAgICAgICAgICAgIHsgY2hpbGRJdGVtcyB9XG4gICAgICAgICAgICA8L2xpPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuaW50ZXJmYWNlIElUcmVlTGV2ZWxQcm9wcyB7XG4gICAgc3BhY2VzOiBSb29tW107XG4gICAgYWN0aXZlU3BhY2VzOiBTcGFjZUtleVtdO1xuICAgIGlzTmVzdGVkPzogYm9vbGVhbjtcbiAgICBwYXJlbnRzOiBTZXQ8c3RyaW5nPjtcbn1cblxuY29uc3QgU3BhY2VUcmVlTGV2ZWw6IFJlYWN0LkZDPElUcmVlTGV2ZWxQcm9wcz4gPSAoe1xuICAgIHNwYWNlcyxcbiAgICBhY3RpdmVTcGFjZXMsXG4gICAgaXNOZXN0ZWQsXG4gICAgcGFyZW50cyxcbn0pID0+IHtcbiAgICByZXR1cm4gPHVsIGNsYXNzTmFtZT1cIm14X1NwYWNlVHJlZUxldmVsXCIgcm9sZT1cImdyb3VwXCI+XG4gICAgICAgIHsgc3BhY2VzLm1hcChzID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoPFNwYWNlSXRlbVxuICAgICAgICAgICAgICAgIGtleT17cy5yb29tSWR9XG4gICAgICAgICAgICAgICAgYWN0aXZlU3BhY2VzPXthY3RpdmVTcGFjZXN9XG4gICAgICAgICAgICAgICAgc3BhY2U9e3N9XG4gICAgICAgICAgICAgICAgaXNOZXN0ZWQ9e2lzTmVzdGVkfVxuICAgICAgICAgICAgICAgIHBhcmVudHM9e3BhcmVudHN9XG4gICAgICAgICAgICAvPik7XG4gICAgICAgIH0pIH1cbiAgICA8L3VsPjtcbn07XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7OztBQWdCTyxNQUFNQSxXQUFtQyxHQUFHLFFBYTdDO0VBQUEsSUFiOEM7SUFDaERDLEtBRGdEO0lBRWhEQyxRQUZnRDtJQUdoREMsU0FIZ0Q7SUFJaERDLFFBSmdEO0lBS2hEQyxLQUxnRDtJQU1oREMsa0JBTmdEO0lBT2hEQyxpQkFQZ0Q7SUFRaERDLFVBUmdEO0lBU2hEQyxRQVRnRDtJQVVoREMsUUFWZ0Q7SUFXaERDO0VBWGdELENBYTlDO0VBQUEsSUFEQ0MsS0FDRDtFQUNGLE1BQU0sQ0FBQ0MsYUFB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