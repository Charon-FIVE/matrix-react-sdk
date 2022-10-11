"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.HEADER_HEIGHT = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classnames = _interopRequireDefault(require("classnames"));

var _reResizable = require("re-resizable");

var React = _interopRequireWildcard(require("react"));

var _polyfill = require("../../../@types/polyfill");

var _KeyboardShortcuts = require("../../../accessibility/KeyboardShortcuts");

var _RovingTabIndex = require("../../../accessibility/RovingTabIndex");

var _actions = require("../../../dispatcher/actions");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _KeyBindingsManager = require("../../../KeyBindingsManager");

var _languageHandler = require("../../../languageHandler");

var _RoomNotificationStateStore = require("../../../stores/notifications/RoomNotificationStateStore");

var _models = require("../../../stores/room-list/algorithms/models");

var _models2 = require("../../../stores/room-list/models");

var _RoomListLayoutStore = _interopRequireDefault(require("../../../stores/room-list/RoomListLayoutStore"));

var _RoomListStore = _interopRequireWildcard(require("../../../stores/room-list/RoomListStore"));

var _arrays = require("../../../utils/arrays");

var _objects = require("../../../utils/objects");

var _ContextMenu = _interopRequireWildcard(require("../../structures/ContextMenu"));

var _AccessibleButton = _interopRequireDefault(require("../../views/elements/AccessibleButton"));

var _AccessibleTooltipButton = _interopRequireDefault(require("../elements/AccessibleTooltipButton"));

var _NotificationBadge = _interopRequireDefault(require("./NotificationBadge"));

var _RoomTile = _interopRequireDefault(require("./RoomTile"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2017, 2018 Vector Creations Ltd
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
const SHOW_N_BUTTON_HEIGHT = 28; // As defined by CSS

const RESIZE_HANDLE_HEIGHT = 4; // As defined by CSS

const HEADER_HEIGHT = 32; // As defined by CSS

exports.HEADER_HEIGHT = HEADER_HEIGHT;
const MAX_PADDING_HEIGHT = SHOW_N_BUTTON_HEIGHT + RESIZE_HANDLE_HEIGHT; // HACK: We really shouldn't have to do this.

(0, _polyfill.polyfillTouchEvent)();

class RoomSublist extends React.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "headerButton", /*#__PURE__*/(0, React.createRef)());
    (0, _defineProperty2.default)(this, "sublistRef", /*#__PURE__*/(0, React.createRef)());
    (0, _defineProperty2.default)(this, "tilesRef", /*#__PURE__*/(0, React.createRef)());
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "layout", void 0);
    (0, _defineProperty2.default)(this, "heightAtStart", void 0);
    (0, _defineProperty2.default)(this, "notificationState", void 0);
    (0, _defineProperty2.default)(this, "onListsUpdated", () => {
      const stateUpdates = {}; // &any is to avoid a cast on the initializer

      const currentRooms = this.state.rooms;
      const newRooms = (0, _arrays.arrayFastClone)(_RoomListStore.default.instance.orderedLists[this.props.tagId] || []);

      if ((0, _arrays.arrayHasOrderChange)(currentRooms, newRooms)) {
        stateUpdates.rooms = newRooms;
      }

      if (Object.keys(stateUpdates).length > 0) {
        this.setState(stateUpdates);
      }
    });
    (0, _defineProperty2.default)(this, "onAction", payload => {
      if (payload.action === _actions.Action.ViewRoom && payload.show_room_tile && this.state.rooms) {
        // XXX: we have to do this a tick later because we have incorrect intermediate props during a room change
        // where we lose the room we are changing from temporarily and then it comes back in an update right after.
        setImmediate(() => {
          const roomIndex = this.state.rooms.findIndex(r => r.roomId === payload.room_id);

          if (!this.state.isExpanded && roomIndex > -1) {
            this.toggleCollapsed();
          } // extend the visible section to include the room if it is entirely invisible


          if (roomIndex >= this.numVisibleTiles) {
            this.layout.visibleTiles = this.layout.tilesWithPadding(roomIndex + 1, MAX_PADDING_HEIGHT);
            this.forceUpdate(); // because the layout doesn't trigger a re-render
          }
        });
      }
    });
    (0, _defineProperty2.default)(this, "onResize", (e, travelDirection, refToElement, delta) => {
      const newHeight = this.heightAtStart + delta.height;
      this.applyHeightChange(newHeight);
      this.setState({
        height: newHeight
      });
    });
    (0, _defineProperty2.default)(this, "onResizeStart", () => {
      this.heightAtStart = this.state.height;
      this.setState({
        isResizing: true
      });
    });
    (0, _defineProperty2.default)(this, "onResizeStop", (e, travelDirection, refToElement, delta) => {
      const newHeight = this.heightAtStart + delta.height;
      this.applyHeightChange(newHeight);
      this.setState({
        isResizing: false,
        height: newHeight
      });
    });
    (0, _defineProperty2.default)(this, "onShowAllClick", () => {
      // read number of visible tiles before we mutate it
      const numVisibleTiles = this.numVisibleTiles;
      const newHeight = this.layout.tilesToPixelsWithPadding(this.numTiles, this.padding);
      this.applyHeightChange(newHeight);
      this.setState({
        height: newHeight
      }, () => {
        // focus the top-most new room
        this.focusRoomTile(numVisibleTiles);
      });
    });
    (0, _defineProperty2.default)(this, "onShowLessClick", () => {
      const newHeight = this.layout.tilesToPixelsWithPadding(this.layout.defaultVisibleTiles, this.padding);
      this.applyHeightChange(newHeight);
      this.setState({
        height: newHeight
      });
    });
    (0, _defineProperty2.default)(this, "focusRoomTile", index => {
      if (!this.sublistRef.current) return;
      const elements = this.sublistRef.current.querySelectorAll(".mx_RoomTile");
      const element = elements && elements[index];

      if (element) {
        element.focus();
      }
    });
    (0, _defineProperty2.default)(this, "onOpenMenuClick", ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const target = ev.target;
      this.setState({
        contextMenuPosition: target.getBoundingClientRect()
      });
    });
    (0, _defineProperty2.default)(this, "onContextMenu", ev => {
      ev.preventDefault();
      ev.stopPropagation();
      this.setState({
        contextMenuPosition: {
          left: ev.clientX,
          top: ev.clientY,
          height: 0
        }
      });
    });
    (0, _defineProperty2.default)(this, "onCloseMenu", () => {
      this.setState({
        contextMenuPosition: null
      });
    });
    (0, _defineProperty2.default)(this, "onUnreadFirstChanged", () => {
      const isUnreadFirst = _RoomListStore.default.instance.getListOrder(this.props.tagId) === _models.ListAlgorithm.Importance;

      const newAlgorithm = isUnreadFirst ? _models.ListAlgorithm.Natural : _models.ListAlgorithm.Importance;

      _RoomListStore.default.instance.setListOrder(this.props.tagId, newAlgorithm);

      this.forceUpdate(); // because if the sublist doesn't have any changes then we will miss the list order change
    });
    (0, _defineProperty2.default)(this, "onTagSortChanged", async sort => {
      _RoomListStore.default.instance.setTagSorting(this.props.tagId, sort);

      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "onMessagePreviewChanged", () => {
      this.layout.showPreviews = !this.layout.showPreviews;
      this.forceUpdate(); // because the layout doesn't trigger a re-render
    });
    (0, _defineProperty2.default)(this, "onBadgeClick", ev => {
      ev.preventDefault();
      ev.stopPropagation();
      let room;

      if (this.props.tagId === _models2.DefaultTagID.Invite) {
        // switch to first room as that'll be the top of the list for the user
        room = this.state.rooms && this.state.rooms[0];
      } else {
        // find the first room with a count of the same colour as the badge count
        room = _RoomListStore.default.instance.orderedLists[this.props.tagId].find(r => {
          const notifState = this.notificationState.getForRoom(r);
          return notifState.count > 0 && notifState.color === this.notificationState.color;
        });
      }

      if (room) {
        _dispatcher.default.dispatch({
          action: _actions.Action.ViewRoom,
          room_id: room.roomId,
          show_room_tile: true,
          // to make sure the room gets scrolled into view
          metricsTrigger: "WebRoomListNotificationBadge",
          metricsViaKeyboard: ev.type !== "click"
        });
      }
    });
    (0, _defineProperty2.default)(this, "onHeaderClick", () => {
      const possibleSticky = this.headerButton.current.parentElement;
      const sublist = possibleSticky.parentElement.parentElement;
      const list = sublist.parentElement.parentElement; // the scrollTop is capped at the height of the header in LeftPanel, the top header is always sticky

      const listScrollTop = Math.round(list.scrollTop);
      const isAtTop = listScrollTop <= Math.round(HEADER_HEIGHT);
      const isAtBottom = listScrollTop >= Math.round(list.scrollHeight - list.offsetHeight);
      const isStickyTop = possibleSticky.classList.contains('mx_RoomSublist_headerContainer_stickyTop');
      const isStickyBottom = possibleSticky.classList.contains('mx_RoomSublist_headerContainer_stickyBottom');

      if (isStickyBottom && !isAtBottom || isStickyTop && !isAtTop) {
        // is sticky - jump to list
        sublist.scrollIntoView({
          behavior: 'smooth'
        });
      } else {
        // on screen - toggle collapse
        const isExpanded = this.state.isExpanded;
        this.toggleCollapsed(); // if the bottom list is collapsed then scroll it in so it doesn't expand off screen

        if (!isExpanded && isStickyBottom) {
          setImmediate(() => {
            sublist.scrollIntoView({
              behavior: 'smooth'
            });
          });
        }
      }
    });
    (0, _defineProperty2.default)(this, "toggleCollapsed", () => {
      if (this.props.forceExpanded) return;
      this.layout.isCollapsed = this.state.isExpanded;
      this.setState({
        isExpanded: !this.layout.isCollapsed
      });

      if (this.props.onListCollapse) {
        this.props.onListCollapse(!this.layout.isCollapsed);
      }
    });
    (0, _defineProperty2.default)(this, "onHeaderKeyDown", ev => {
      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getRoomListAction(ev);

      switch (action) {
        case _KeyboardShortcuts.KeyBindingAction.CollapseRoomListSection:
          ev.stopPropagation();

          if (this.state.isExpanded) {
            // Collapse the room sublist if it isn't already
            this.toggleCollapsed();
          }

          break;

        case _KeyboardShortcuts.KeyBindingAction.ExpandRoomListSection:
          {
            ev.stopPropagation();

            if (!this.state.isExpanded) {
              // Expand the room sublist if it isn't already
              this.toggleCollapsed();
            } else if (this.sublistRef.current) {
              // otherwise focus the first room
              const element = this.sublistRef.current.querySelector(".mx_RoomTile");

              if (element) {
                element.focus();
              }
            }

            break;
          }
      }
    });
    (0, _defineProperty2.default)(this, "onKeyDown", ev => {
      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getAccessibilityAction(ev);

      switch (action) {
        // On ArrowLeft go to the sublist header
        case _KeyboardShortcuts.KeyBindingAction.ArrowLeft:
          ev.stopPropagation();
          this.headerButton.current.focus();
          break;
        // Consume ArrowRight so it doesn't cause focus to get sent to composer

        case _KeyboardShortcuts.KeyBindingAction.ArrowRight:
          ev.stopPropagation();
      }
    });
    this.layout = _RoomListLayoutStore.default.instance.getLayoutFor(this.props.tagId);
    this.heightAtStart = 0;
    this.notificationState = _RoomNotificationStateStore.RoomNotificationStateStore.instance.getListState(this.props.tagId);
    this.state = {
      contextMenuPosition: null,
      isResizing: false,
      isExpanded: !this.layout.isCollapsed,
      height: 0,
      // to be fixed in a moment, we need `rooms` to calculate this.
      rooms: (0, _arrays.arrayFastClone)(_RoomListStore.default.instance.orderedLists[this.props.tagId] || [])
    }; // Why Object.assign() and not this.state.height? Because TypeScript says no.

    this.state = Object.assign(this.state, {
      height: this.calculateInitialHeight()
    });
  }

  calculateInitialHeight() {
    const requestedVisibleTiles = Math.max(Math.floor(this.layout.visibleTiles), this.layout.minVisibleTiles);
    const tileCount = Math.min(this.numTiles, requestedVisibleTiles);
    return this.layout.tilesToPixelsWithPadding(tileCount, this.padding);
  }

  get padding() {
    let padding = RESIZE_HANDLE_HEIGHT; // this is used for calculating the max height of the whole container,
    // and takes into account whether there should be room reserved for the show more/less button
    // when fully expanded. We can't rely purely on the layout's defaultVisible tile count
    // because there are conditions in which we need to know that the 'show more' button
    // is present while well under the default tile limit.

    const needsShowMore = this.numTiles > this.numVisibleTiles; // ...but also check this or we'll miss if the section is expanded and we need a
    // 'show less'

    const needsShowLess = this.numTiles > this.layout.defaultVisibleTiles;

    if (needsShowMore || needsShowLess) {
      padding += SHOW_N_BUTTON_HEIGHT;
    }

    return padding;
  }

  get extraTiles() {
    if (this.props.extraTiles) {
      return this.props.extraTiles;
    }

    return null;
  }

  get numTiles() {
    return RoomSublist.calcNumTiles(this.state.rooms, this.extraTiles);
  }

  static calcNumTiles(rooms, extraTiles) {
    return (rooms || []).length + (extraTiles || []).length;
  }

  get numVisibleTiles() {
    const nVisible = Math.ceil(this.layout.visibleTiles);
    return Math.min(nVisible, this.numTiles);
  }

  componentDidUpdate(prevProps, prevState) {
    const prevExtraTiles = prevProps.extraTiles; // as the rooms can come in one by one we need to reevaluate
    // the amount of available rooms to cap the amount of requested visible rooms by the layout

    if (RoomSublist.calcNumTiles(prevState.rooms, prevExtraTiles) !== this.numTiles) {
      this.setState({
        height: this.calculateInitialHeight()
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if ((0, _objects.objectHasDiff)(this.props, nextProps)) {
      // Something we don't care to optimize has updated, so update.
      return true;
    } // Do the same check used on props for state, without the rooms we're going to no-op


    const prevStateNoRooms = (0, _objects.objectExcluding)(this.state, ['rooms']);
    const nextStateNoRooms = (0, _objects.objectExcluding)(nextState, ['rooms']);

    if ((0, _objects.objectHasDiff)(prevStateNoRooms, nextStateNoRooms)) {
      return true;
    } // If we're supposed to handle extra tiles, take the performance hit and re-render all the
    // time so we don't have to consider them as part of the visible room optimization.


    const prevExtraTiles = this.props.extraTiles || [];
    const nextExtraTiles = nextProps.extraTiles || [];

    if (prevExtraTiles.length > 0 || nextExtraTiles.length > 0) {
      return true;
    } // If we're about to update the height of the list, we don't really care about which rooms
    // are visible or not for no-op purposes, so ensure that the height calculation runs through.


    if (RoomSublist.calcNumTiles(nextState.rooms, nextExtraTiles) !== this.numTiles) {
      return true;
    } // Before we go analyzing the rooms, we can see if we're collapsed. If we're collapsed, we don't need
    // to render anything. We do this after the height check though to ensure that the height gets appropriately
    // calculated for when/if we become uncollapsed.


    if (!nextState.isExpanded) {
      return false;
    } // Quickly double check we're not about to break something due to the number of rooms changing.


    if (this.state.rooms.length !== nextState.rooms.length) {
      return true;
    } // Finally, determine if the room update (as presumably that's all that's left) is within
    // our visible range. If it is, then do a render. If the update is outside our visible range
    // then we can skip the update.
    //
    // We also optimize for order changing here: if the update did happen in our visible range
    // but doesn't result in the list re-sorting itself then there's no reason for us to update
    // on our own.


    const prevSlicedRooms = this.state.rooms.slice(0, this.numVisibleTiles);
    const nextSlicedRooms = nextState.rooms.slice(0, this.numVisibleTiles);

    if ((0, _arrays.arrayHasOrderChange)(prevSlicedRooms, nextSlicedRooms)) {
      return true;
    } // Finally, nothing happened so no-op the update


    return false;
  }

  componentDidMount() {
    this.dispatcherRef = _dispatcher.default.register(this.onAction);

    _RoomListStore.default.instance.on(_RoomListStore.LISTS_UPDATE_EVENT, this.onListsUpdated); // Using the passive option to not block the main thread
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#improving_scrolling_performance_with_passive_listeners


    this.tilesRef.current?.addEventListener("scroll", this.onScrollPrevent, {
      passive: true
    });
  }

  componentWillUnmount() {
    _dispatcher.default.unregister(this.dispatcherRef);

    _RoomListStore.default.instance.off(_RoomListStore.LISTS_UPDATE_EVENT, this.onListsUpdated);

    this.tilesRef.current?.removeEventListener("scroll", this.onScrollPrevent);
  }

  applyHeightChange(newHeight) {
    const heightInTiles = Math.ceil(this.layout.pixelsToTiles(newHeight - this.padding));
    this.layout.visibleTiles = Math.min(this.numTiles, heightInTiles);
  }

  renderVisibleTiles() {
    if (!this.state.isExpanded && !this.props.forceExpanded) {
      // don't waste time on rendering
      return [];
    }

    const tiles = [];

    if (this.state.rooms) {
      let visibleRooms = this.state.rooms;

      if (!this.props.forceExpanded) {
        visibleRooms = visibleRooms.slice(0, this.numVisibleTiles);
      }

      for (const room of visibleRooms) {
        tiles.push( /*#__PURE__*/React.createElement(_RoomTile.default, {
          room: room,
          key: `room-${room.roomId}`,
          showMessagePreview: this.layout.showPreviews,
          isMinimized: this.props.isMinimized,
          tag: this.props.tagId
        }));
      }
    }

    if (this.extraTiles) {
      // HACK: We break typing here, but this 'extra tiles' property shouldn't exist.
      tiles.push(...this.extraTiles);
    } // We only have to do this because of the extra tiles. We do it conditionally
    // to avoid spending cycles on slicing. It's generally fine to do this though
    // as users are unlikely to have more than a handful of tiles when the extra
    // tiles are used.


    if (tiles.length > this.numVisibleTiles && !this.props.forceExpanded) {
      return tiles.slice(0, this.numVisibleTiles);
    }

    return tiles;
  }

  renderMenu() {
    if (this.props.tagId === _models2.DefaultTagID.Suggested || this.props.tagId === _models2.DefaultTagID.SavedItems) return null; // not sortable

    let contextMenu = null;

    if (this.state.contextMenuPosition) {
      const isAlphabetical = _RoomListStore.default.instance.getTagSorting(this.props.tagId) === _models.SortAlgorithm.Alphabetic;

      const isUnreadFirst = _RoomListStore.default.instance.getListOrder(this.props.tagId) === _models.ListAlgorithm.Importance; // Invites don't get some nonsense options, so only add them if we have to.


      let otherSections = null;

      if (this.props.tagId !== _models2.DefaultTagID.Invite) {
        otherSections = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
          className: "mx_RoomSublist_contextMenu_title"
        }, (0, _languageHandler._t)("Appearance")), /*#__PURE__*/React.createElement(_ContextMenu.StyledMenuItemCheckbox, {
          onClose: this.onCloseMenu,
          onChange: this.onUnreadFirstChanged,
          checked: isUnreadFirst
        }, (0, _languageHandler._t)("Show rooms with unread messages first")), /*#__PURE__*/React.createElement(_ContextMenu.StyledMenuItemCheckbox, {
          onClose: this.onCloseMenu,
          onChange: this.onMessagePreviewChanged,
          checked: this.layout.showPreviews
        }, (0, _languageHandler._t)("Show previews of messages"))));
      }

      contextMenu = /*#__PURE__*/React.createElement(_ContextMenu.default, {
        chevronFace: _ContextMenu.ChevronFace.None,
        left: this.state.contextMenuPosition.left,
        top: this.state.contextMenuPosition.top + this.state.contextMenuPosition.height,
        onFinished: this.onCloseMenu
      }, /*#__PURE__*/React.createElement("div", {
        className: "mx_RoomSublist_contextMenu"
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        className: "mx_RoomSublist_contextMenu_title"
      }, (0, _languageHandler._t)("Sort by")), /*#__PURE__*/React.createElement(_ContextMenu.StyledMenuItemRadio, {
        onClose: this.onCloseMenu,
        onChange: () => this.onTagSortChanged(_models.SortAlgorithm.Recent),
        checked: !isAlphabetical,
        name: `mx_${this.props.tagId}_sortBy`
      }, (0, _languageHandler._t)("Activity")), /*#__PURE__*/React.createElement(_ContextMenu.StyledMenuItemRadio, {
        onClose: this.onCloseMenu,
        onChange: () => this.onTagSortChanged(_models.SortAlgorithm.Alphabetic),
        checked: isAlphabetical,
        name: `mx_${this.props.tagId}_sortBy`
      }, (0, _languageHandler._t)("A-Z"))), otherSections));
    }

    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_ContextMenu.ContextMenuTooltipButton, {
      className: "mx_RoomSublist_menuButton",
      onClick: this.onOpenMenuClick,
      title: (0, _languageHandler._t)("List options"),
      isExpanded: !!this.state.contextMenuPosition
    }), contextMenu);
  }

  renderHeader() {
    return /*#__PURE__*/React.createElement(_RovingTabIndex.RovingTabIndexWrapper, {
      inputRef: this.headerButton
    }, _ref => {
      let {
        onFocus,
        isActive,
        ref
      } = _ref;
      const tabIndex = isActive ? 0 : -1;
      let ariaLabel = (0, _languageHandler._t)("Jump to first unread room.");

      if (this.props.tagId === _models2.DefaultTagID.Invite) {
        ariaLabel = (0, _languageHandler._t)("Jump to first invite.");
      }

      const badge = /*#__PURE__*/React.createElement(_NotificationBadge.default, {
        forceCount: true,
        notification: this.notificationState,
        onClick: this.onBadgeClick,
        tabIndex: tabIndex,
        "aria-label": ariaLabel,
        showUnsentTooltip: true
      });
      let addRoomButton = null;

      if (this.props.AuxButtonComponent) {
        const AuxButtonComponent = this.props.AuxButtonComponent;
        addRoomButton = /*#__PURE__*/React.createElement(AuxButtonComponent, {
          tabIndex: tabIndex
        });
      }

      const collapseClasses = (0, _classnames.default)({
        'mx_RoomSublist_collapseBtn': true,
        'mx_RoomSublist_collapseBtn_collapsed': !this.state.isExpanded && !this.props.forceExpanded
      });
      const classes = (0, _classnames.default)({
        'mx_RoomSublist_headerContainer': true,
        'mx_RoomSublist_headerContainer_withAux': !!addRoomButton
      });
      const badgeContainer = /*#__PURE__*/React.createElement("div", {
        className: "mx_RoomSublist_badgeContainer"
      }, badge);
      let Button = _AccessibleButton.default;

      if (this.props.isMinimized) {
        Button = _AccessibleTooltipButton.default;
      } // Note: the addRoomButton conditionally gets moved around
      // the DOM depending on whether or not the list is minimized.
      // If we're minimized, we want it below the header so it
      // doesn't become sticky.
      // The same applies to the notification badge.


      return /*#__PURE__*/React.createElement("div", {
        className: classes,
        onKeyDown: this.onHeaderKeyDown,
        onFocus: onFocus,
        "aria-label": this.props.label
      }, /*#__PURE__*/React.createElement("div", {
        className: "mx_RoomSublist_stickableContainer"
      }, /*#__PURE__*/React.createElement("div", {
        className: "mx_RoomSublist_stickable"
      }, /*#__PURE__*/React.createElement(Button, {
        onFocus: onFocus,
        inputRef: ref,
        tabIndex: tabIndex,
        className: "mx_RoomSublist_headerText",
        role: "treeitem",
        "aria-expanded": this.state.isExpanded,
        "aria-level": 1,
        onClick: this.onHeaderClick,
        onContextMenu: this.onContextMenu,
        title: this.props.isMinimized ? this.props.label : undefined
      }, /*#__PURE__*/React.createElement("span", {
        className: collapseClasses
      }), /*#__PURE__*/React.createElement("span", null, this.props.label)), this.renderMenu(), this.props.isMinimized ? null : badgeContainer, this.props.isMinimized ? null : addRoomButton)), this.props.isMinimized ? badgeContainer : null, this.props.isMinimized ? addRoomButton : null);
    });
  }

  onScrollPrevent(e) {
    // the RoomTile calls scrollIntoView and the browser may scroll a div we do not wish to be scrollable
    // this fixes https://github.com/vector-im/element-web/issues/14413
    e.target.scrollTop = 0;
  }

  render() {
    const visibleTiles = this.renderVisibleTiles();
    const classes = (0, _classnames.default)({
      'mx_RoomSublist': true,
      'mx_RoomSublist_hasMenuOpen': !!this.state.contextMenuPosition,
      'mx_RoomSublist_minimized': this.props.isMinimized,
      'mx_RoomSublist_hidden': !this.state.rooms.length && !this.props.extraTiles?.length && this.props.alwaysVisible !== true
    });
    let content = null;

    if (visibleTiles.length > 0 && this.props.forceExpanded) {
      content = /*#__PURE__*/React.createElement("div", {
        className: "mx_RoomSublist_resizeBox mx_RoomSublist_resizeBox_forceExpanded"
      }, /*#__PURE__*/React.createElement("div", {
        className: "mx_RoomSublist_tiles",
        ref: this.tilesRef
      }, visibleTiles));
    } else if (visibleTiles.length > 0) {
      const layout = this.layout; // to shorten calls

      const minTiles = Math.min(layout.minVisibleTiles, this.numTiles);
      const showMoreAtMinHeight = minTiles < this.numTiles;
      const minHeightPadding = RESIZE_HANDLE_HEIGHT + (showMoreAtMinHeight ? SHOW_N_BUTTON_HEIGHT : 0);
      const minTilesPx = layout.tilesToPixelsWithPadding(minTiles, minHeightPadding);
      const maxTilesPx = layout.tilesToPixelsWithPadding(this.numTiles, this.padding);
      const showMoreBtnClasses = (0, _classnames.default)({
        'mx_RoomSublist_showNButton': true
      }); // If we're hiding rooms, show a 'show more' button to the user. This button
      // floats above the resize handle, if we have one present. If the user has all
      // tiles visible, it becomes 'show less'.

      let showNButton = null;

      if (maxTilesPx > this.state.height) {
        // the height of all the tiles is greater than the section height: we need a 'show more' button
        const nonPaddedHeight = this.state.height - RESIZE_HANDLE_HEIGHT - SHOW_N_BUTTON_HEIGHT;
        const amountFullyShown = Math.floor(nonPaddedHeight / this.layout.tileHeight);
        const numMissing = this.numTiles - amountFullyShown;
        const label = (0, _languageHandler._t)("Show %(count)s more", {
          count: numMissing
        });
        let showMoreText = /*#__PURE__*/React.createElement("span", {
          className: "mx_RoomSublist_showNButtonText"
        }, label);
        if (this.props.isMinimized) showMoreText = null;
        showNButton = /*#__PURE__*/React.createElement(_RovingTabIndex.RovingAccessibleButton, {
          role: "treeitem",
          onClick: this.onShowAllClick,
          className: showMoreBtnClasses,
          "aria-label": label
        }, /*#__PURE__*/React.createElement("span", {
          className: "mx_RoomSublist_showMoreButtonChevron mx_RoomSublist_showNButtonChevron"
        }), showMoreText);
      } else if (this.numTiles > this.layout.defaultVisibleTiles) {
        // we have all tiles visible - add a button to show less
        const label = (0, _languageHandler._t)("Show less");
        let showLessText = /*#__PURE__*/React.createElement("span", {
          className: "mx_RoomSublist_showNButtonText"
        }, label);
        if (this.props.isMinimized) showLessText = null;
        showNButton = /*#__PURE__*/React.createElement(_RovingTabIndex.RovingAccessibleButton, {
          role: "treeitem",
          onClick: this.onShowLessClick,
          className: showMoreBtnClasses,
          "aria-label": label
        }, /*#__PURE__*/React.createElement("span", {
          className: "mx_RoomSublist_showLessButtonChevron mx_RoomSublist_showNButtonChevron"
        }), showLessText);
      } // Figure out if we need a handle


      const handles = {
        bottom: true,
        // the only one we need, but the others must be explicitly false
        bottomLeft: false,
        bottomRight: false,
        left: false,
        right: false,
        top: false,
        topLeft: false,
        topRight: false
      };

      if (layout.visibleTiles >= this.numTiles && this.numTiles <= layout.minVisibleTiles) {
        // we're at a minimum, don't have a bottom handle
        handles.bottom = false;
      } // We have to account for padding so we can accommodate a 'show more' button and
      // the resize handle, which are pinned to the bottom of the container. This is the
      // easiest way to have a resize handle below the button as otherwise we're writing
      // our own resize handling and that doesn't sound fun.
      //
      // The layout class has some helpers for dealing with padding, as we don't want to
      // apply it in all cases. If we apply it in all cases, the resizing feels like it
      // goes backwards and can become wildly incorrect (visibleTiles says 18 when there's
      // only mathematically 7 possible).


      const handleWrapperClasses = (0, _classnames.default)({
        'mx_RoomSublist_resizerHandles': true,
        'mx_RoomSublist_resizerHandles_showNButton': !!showNButton
      });
      content = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_reResizable.Resizable, {
        size: {
          height: this.state.height
        },
        minHeight: minTilesPx,
        maxHeight: maxTilesPx,
        onResizeStart: this.onResizeStart,
        onResizeStop: this.onResizeStop,
        onResize: this.onResize,
        handleWrapperClass: handleWrapperClasses,
        handleClasses: {
          bottom: "mx_RoomSublist_resizerHandle"
        },
        className: "mx_RoomSublist_resizeBox",
        enable: handles
      }, /*#__PURE__*/React.createElement("div", {
        className: "mx_RoomSublist_tiles",
        ref: this.tilesRef
      }, visibleTiles), showNButton));
    } else if (this.props.showSkeleton && this.state.isExpanded) {
      content = /*#__PURE__*/React.createElement("div", {
        className: "mx_RoomSublist_skeletonUI"
      });
    }

    return /*#__PURE__*/React.createElement("div", {
      ref: this.sublistRef,
      className: classes,
      role: "group",
      "aria-label": this.props.label,
      onKeyDown: this.onKeyDown
    }, this.renderHeader(), content);
  }

}

exports.default = RoomSublist;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTSE9XX05fQlVUVE9OX0hFSUdIVCIsIlJFU0laRV9IQU5ETEVfSEVJR0hUIiwiSEVBREVSX0hFSUdIVCIsIk1BWF9QQURESU5HX0hFSUdIVCIsInBvbHlmaWxsVG91Y2hFdmVudCIsIlJvb21TdWJsaXN0IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY3JlYXRlUmVmIiwic3RhdGVVcGRhdGVzIiwiY3VycmVudFJvb21zIiwic3RhdGUiLCJyb29tcyIsIm5ld1Jvb21zIiwiYXJyYXlGYXN0Q2xvbmUiLCJSb29tTGlzdFN0b3JlIiwiaW5zdGFuY2UiLCJvcmRlcmVkTGlzdHMiLCJ0YWdJZCIsImFycmF5SGFzT3JkZXJDaGFuZ2UiLCJPYmplY3QiLCJrZXlzIiwibGVuZ3RoIiwic2V0U3RhdGUiLCJwYXlsb2FkIiwiYWN0aW9uIiwiQWN0aW9uIiwiVmlld1Jvb20iLCJzaG93X3Jvb21fdGlsZSIsInNldEltbWVkaWF0ZSIsInJvb21JbmRleCIsImZpbmRJbmRleCIsInIiLCJyb29tSWQiLCJyb29tX2lkIiwiaXNFeHBhbmRlZCIsInRvZ2dsZUNvbGxhcHNlZCIsIm51bVZpc2libGVUaWxlcyIsImxheW91dCIsInZpc2libGVUaWxlcyIsInRpbGVzV2l0aFBhZGRpbmciLCJmb3JjZVVwZGF0ZSIsImUiLCJ0cmF2ZWxEaXJlY3Rpb24iLCJyZWZUb0VsZW1lbnQiLCJkZWx0YSIsIm5ld0hlaWdodCIsImhlaWdodEF0U3RhcnQiLCJoZWlnaHQiLCJhcHBseUhlaWdodENoYW5nZSIsImlzUmVzaXppbmciLCJ0aWxlc1RvUGl4ZWxzV2l0aFBhZGRpbmciLCJudW1UaWxlcyIsInBhZGRpbmciLCJmb2N1c1Jvb21UaWxlIiwiZGVmYXVsdFZpc2libGVUaWxlcyIsImluZGV4Iiwic3VibGlzdFJlZiIsImN1cnJlbnQiLCJlbGVtZW50cyIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJlbGVtZW50IiwiZm9jdXMiLCJldiIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwidGFyZ2V0IiwiY29udGV4dE1lbnVQb3NpdGlvbiIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsImxlZnQiLCJjbGllbnRYIiwidG9wIiwiY2xpZW50WSIsImlzVW5yZWFkRmlyc3QiLCJnZXRMaXN0T3JkZXIiLCJMaXN0QWxnb3JpdGhtIiwiSW1wb3J0YW5jZSIsIm5ld0FsZ29yaXRobSIsIk5hdHVyYWwiLCJzZXRMaXN0T3JkZXIiLCJzb3J0Iiwic2V0VGFnU29ydGluZyIsInNob3dQcmV2aWV3cyIsInJvb20iLCJEZWZhdWx0VGFnSUQiLCJJbnZpdGUiLCJmaW5kIiwibm90aWZTdGF0ZSIsIm5vdGlmaWNhdGlvblN0YXRlIiwiZ2V0Rm9yUm9vbSIsImNvdW50IiwiY29sb3IiLCJkZWZhdWx0RGlzcGF0Y2hlciIsImRpc3BhdGNoIiwibWV0cmljc1RyaWdnZXIiLCJtZXRyaWNzVmlhS2V5Ym9hcmQiLCJ0eXBlIiwicG9zc2libGVTdGlja3kiLCJoZWFkZXJCdXR0b24iLCJwYXJlbnRFbGVtZW50Iiwic3VibGlzdCIsImxpc3QiLCJsaXN0U2Nyb2xsVG9wIiwiTWF0aCIsInJvdW5kIiwic2Nyb2xsVG9wIiwiaXNBdFRvcCIsImlzQXRCb3R0b20iLCJzY3JvbGxIZWlnaHQiLCJvZmZzZXRIZWlnaHQiLCJpc1N0aWNreVRvcCIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwiaXNTdGlja3lCb3R0b20iLCJzY3JvbGxJbnRvVmlldyIsImJlaGF2aW9yIiwiZm9yY2VFeHBhbmRlZCIsImlzQ29sbGFwc2VkIiwib25MaXN0Q29sbGFwc2UiLCJnZXRLZXlCaW5kaW5nc01hbmFnZXIiLCJnZXRSb29tTGlzdEFjdGlvbiIsIktleUJpbmRpbmdBY3Rpb24iLCJDb2xsYXBzZVJvb21MaXN0U2VjdGlvbiIsIkV4cGFuZFJvb21MaXN0U2VjdGlvbiIsInF1ZXJ5U2VsZWN0b3IiLCJnZXRBY2Nlc3NpYmlsaXR5QWN0aW9uIiwiQXJyb3dMZWZ0IiwiQXJyb3dSaWdodCIsIlJvb21MaXN0TGF5b3V0U3RvcmUiLCJnZXRMYXlvdXRGb3IiLCJSb29tTm90aWZpY2F0aW9uU3RhdGVTdG9yZSIsImdldExpc3RTdGF0ZSIsImFzc2lnbiIsImNhbGN1bGF0ZUluaXRpYWxIZWlnaHQiLCJyZXF1ZXN0ZWRWaXNpYmxlVGlsZXMiLCJtYXgiLCJmbG9vciIsIm1pblZpc2libGVUaWxlcyIsInRpbGVDb3VudCIsIm1pbiIsIm5lZWRzU2hvd01vcmUiLCJuZWVkc1Nob3dMZXNzIiwiZXh0cmFUaWxlcyIsImNhbGNOdW1UaWxlcyIsIm5WaXNpYmxlIiwiY2VpbCIsImNvbXBvbmVudERpZFVwZGF0ZSIsInByZXZQcm9wcyIsInByZXZTdGF0ZSIsInByZXZFeHRyYVRpbGVzIiwic2hvdWxkQ29tcG9uZW50VXBkYXRlIiwibmV4dFByb3BzIiwibmV4dFN0YXRlIiwib2JqZWN0SGFzRGlmZiIsInByZXZTdGF0ZU5vUm9vbXMiLCJvYmplY3RFeGNsdWRpbmciLCJuZXh0U3RhdGVOb1Jvb21zIiwibmV4dEV4dHJhVGlsZXMiLCJwcmV2U2xpY2VkUm9vbXMiLCJzbGljZSIsIm5leHRTbGljZWRSb29tcyIsImNvbXBvbmVudERpZE1vdW50IiwiZGlzcGF0Y2hlclJlZiIsInJlZ2lzdGVyIiwib25BY3Rpb24iLCJvbiIsIkxJU1RTX1VQREFURV9FVkVOVCIsIm9uTGlzdHNVcGRhdGVkIiwidGlsZXNSZWYiLCJhZGRFdmVudExpc3RlbmVyIiwib25TY3JvbGxQcmV2ZW50IiwicGFzc2l2ZSIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwidW5yZWdpc3RlciIsIm9mZiIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJoZWlnaHRJblRpbGVzIiwicGl4ZWxzVG9UaWxlcyIsInJlbmRlclZpc2libGVUaWxlcyIsInRpbGVzIiwidmlzaWJsZVJvb21zIiwicHVzaCIsImlzTWluaW1pemVkIiwicmVuZGVyTWVudSIsIlN1Z2dlc3RlZCIsIlNhdmVkSXRlbXMiLCJjb250ZXh0TWVudSIsImlzQWxwaGFiZXRpY2FsIiwiZ2V0VGFnU29ydGluZyIsIlNvcnRBbGdvcml0aG0iLCJBbHBoYWJldGljIiwib3RoZXJTZWN0aW9ucyIsIl90Iiwib25DbG9zZU1lbnUiLCJvblVucmVhZEZpcnN0Q2hhbmdlZCIsIm9uTWVzc2FnZVByZXZpZXdDaGFuZ2VkIiwiQ2hldnJvbkZhY2UiLCJOb25lIiwib25UYWdTb3J0Q2hhbmdlZCIsIlJlY2VudCIsIm9uT3Blbk1lbnVDbGljayIsInJlbmRlckhlYWRlciIsIm9uRm9jdXMiLCJpc0FjdGl2ZSIsInJlZiIsInRhYkluZGV4IiwiYXJpYUxhYmVsIiwiYmFkZ2UiLCJvbkJhZGdlQ2xpY2siLCJhZGRSb29tQnV0dG9uIiwiQXV4QnV0dG9uQ29tcG9uZW50IiwiY29sbGFwc2VDbGFzc2VzIiwiY2xhc3NOYW1lcyIsImNsYXNzZXMiLCJiYWRnZUNvbnRhaW5lciIsIkJ1dHRvbiIsIkFjY2Vzc2libGVCdXR0b24iLCJBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbiIsIm9uSGVhZGVyS2V5RG93biIsImxhYmVsIiwib25IZWFkZXJDbGljayIsIm9uQ29udGV4dE1lbnUiLCJ1bmRlZmluZWQiLCJyZW5kZXIiLCJhbHdheXNWaXNpYmxlIiwiY29udGVudCIsIm1pblRpbGVzIiwic2hvd01vcmVBdE1pbkhlaWdodCIsIm1pbkhlaWdodFBhZGRpbmciLCJtaW5UaWxlc1B4IiwibWF4VGlsZXNQeCIsInNob3dNb3JlQnRuQ2xhc3NlcyIsInNob3dOQnV0dG9uIiwibm9uUGFkZGVkSGVpZ2h0IiwiYW1vdW50RnVsbHlTaG93biIsInRpbGVIZWlnaHQiLCJudW1NaXNzaW5nIiwic2hvd01vcmVUZXh0Iiwib25TaG93QWxsQ2xpY2siLCJzaG93TGVzc1RleHQiLCJvblNob3dMZXNzQ2xpY2siLCJoYW5kbGVzIiwiYm90dG9tIiwiYm90dG9tTGVmdCIsImJvdHRvbVJpZ2h0IiwicmlnaHQiLCJ0b3BMZWZ0IiwidG9wUmlnaHQiLCJoYW5kbGVXcmFwcGVyQ2xhc3NlcyIsIm9uUmVzaXplU3RhcnQiLCJvblJlc2l6ZVN0b3AiLCJvblJlc2l6ZSIsInNob3dTa2VsZXRvbiIsIm9uS2V5RG93biJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL1Jvb21TdWJsaXN0LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE3LCAyMDE4IFZlY3RvciBDcmVhdGlvbnMgTHRkXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHsgRGlzcGF0Y2hlciB9IGZyb20gXCJmbHV4XCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQgeyBFbmFibGUsIFJlc2l6YWJsZSB9IGZyb20gXCJyZS1yZXNpemFibGVcIjtcbmltcG9ydCB7IERpcmVjdGlvbiB9IGZyb20gXCJyZS1yZXNpemFibGUvbGliL3Jlc2l6ZXJcIjtcbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgQ29tcG9uZW50VHlwZSwgY3JlYXRlUmVmLCBSZWFjdENvbXBvbmVudEVsZW1lbnQgfSBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IHsgcG9seWZpbGxUb3VjaEV2ZW50IH0gZnJvbSBcIi4uLy4uLy4uL0B0eXBlcy9wb2x5ZmlsbFwiO1xuaW1wb3J0IHsgS2V5QmluZGluZ0FjdGlvbiB9IGZyb20gXCIuLi8uLi8uLi9hY2Nlc3NpYmlsaXR5L0tleWJvYXJkU2hvcnRjdXRzXCI7XG5pbXBvcnQgeyBSb3ZpbmdBY2Nlc3NpYmxlQnV0dG9uLCBSb3ZpbmdUYWJJbmRleFdyYXBwZXIgfSBmcm9tIFwiLi4vLi4vLi4vYWNjZXNzaWJpbGl0eS9Sb3ZpbmdUYWJJbmRleFwiO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IGRlZmF1bHREaXNwYXRjaGVyIGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCB7IEFjdGlvblBheWxvYWQgfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkc1wiO1xuaW1wb3J0IHsgVmlld1Jvb21QYXlsb2FkIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvVmlld1Jvb21QYXlsb2FkXCI7XG5pbXBvcnQgeyBnZXRLZXlCaW5kaW5nc01hbmFnZXIgfSBmcm9tIFwiLi4vLi4vLi4vS2V5QmluZGluZ3NNYW5hZ2VyXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7IExpc3ROb3RpZmljYXRpb25TdGF0ZSB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvbm90aWZpY2F0aW9ucy9MaXN0Tm90aWZpY2F0aW9uU3RhdGVcIjtcbmltcG9ydCB7IFJvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9ub3RpZmljYXRpb25zL1Jvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlXCI7XG5pbXBvcnQgeyBMaXN0QWxnb3JpdGhtLCBTb3J0QWxnb3JpdGhtIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9yb29tLWxpc3QvYWxnb3JpdGhtcy9tb2RlbHNcIjtcbmltcG9ydCB7IExpc3RMYXlvdXQgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL3Jvb20tbGlzdC9MaXN0TGF5b3V0XCI7XG5pbXBvcnQgeyBEZWZhdWx0VGFnSUQsIFRhZ0lEIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9yb29tLWxpc3QvbW9kZWxzXCI7XG5pbXBvcnQgUm9vbUxpc3RMYXlvdXRTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL3Jvb20tbGlzdC9Sb29tTGlzdExheW91dFN0b3JlXCI7XG5pbXBvcnQgUm9vbUxpc3RTdG9yZSwgeyBMSVNUU19VUERBVEVfRVZFTlQgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL3Jvb20tbGlzdC9Sb29tTGlzdFN0b3JlXCI7XG5pbXBvcnQgeyBhcnJheUZhc3RDbG9uZSwgYXJyYXlIYXNPcmRlckNoYW5nZSB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9hcnJheXNcIjtcbmltcG9ydCB7IG9iamVjdEV4Y2x1ZGluZywgb2JqZWN0SGFzRGlmZiB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9vYmplY3RzXCI7XG5pbXBvcnQgUmVzaXplTm90aWZpZXIgZnJvbSBcIi4uLy4uLy4uL3V0aWxzL1Jlc2l6ZU5vdGlmaWVyXCI7XG5pbXBvcnQgQ29udGV4dE1lbnUsIHtcbiAgICBDaGV2cm9uRmFjZSxcbiAgICBDb250ZXh0TWVudVRvb2x0aXBCdXR0b24sXG4gICAgU3R5bGVkTWVudUl0ZW1DaGVja2JveCxcbiAgICBTdHlsZWRNZW51SXRlbVJhZGlvLFxufSBmcm9tIFwiLi4vLi4vc3RydWN0dXJlcy9Db250ZXh0TWVudVwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uLy4uL3ZpZXdzL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cIjtcbmltcG9ydCBFeHRyYVRpbGUgZnJvbSBcIi4vRXh0cmFUaWxlXCI7XG5pbXBvcnQgTm90aWZpY2F0aW9uQmFkZ2UgZnJvbSBcIi4vTm90aWZpY2F0aW9uQmFkZ2VcIjtcbmltcG9ydCBSb29tVGlsZSBmcm9tIFwiLi9Sb29tVGlsZVwiO1xuXG5jb25zdCBTSE9XX05fQlVUVE9OX0hFSUdIVCA9IDI4OyAvLyBBcyBkZWZpbmVkIGJ5IENTU1xuY29uc3QgUkVTSVpFX0hBTkRMRV9IRUlHSFQgPSA0OyAvLyBBcyBkZWZpbmVkIGJ5IENTU1xuZXhwb3J0IGNvbnN0IEhFQURFUl9IRUlHSFQgPSAzMjsgLy8gQXMgZGVmaW5lZCBieSBDU1NcblxuY29uc3QgTUFYX1BBRERJTkdfSEVJR0hUID0gU0hPV19OX0JVVFRPTl9IRUlHSFQgKyBSRVNJWkVfSEFORExFX0hFSUdIVDtcblxuLy8gSEFDSzogV2UgcmVhbGx5IHNob3VsZG4ndCBoYXZlIHRvIGRvIHRoaXMuXG5wb2x5ZmlsbFRvdWNoRXZlbnQoKTtcblxuZXhwb3J0IGludGVyZmFjZSBJQXV4QnV0dG9uUHJvcHMge1xuICAgIHRhYkluZGV4OiBudW1iZXI7XG4gICAgZGlzcGF0Y2hlcj86IERpc3BhdGNoZXI8QWN0aW9uUGF5bG9hZD47XG59XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIGZvclJvb21zOiBib29sZWFuO1xuICAgIHN0YXJ0QXNIaWRkZW46IGJvb2xlYW47XG4gICAgbGFiZWw6IHN0cmluZztcbiAgICBBdXhCdXR0b25Db21wb25lbnQ/OiBDb21wb25lbnRUeXBlPElBdXhCdXR0b25Qcm9wcz47XG4gICAgaXNNaW5pbWl6ZWQ6IGJvb2xlYW47XG4gICAgdGFnSWQ6IFRhZ0lEO1xuICAgIHNob3dTa2VsZXRvbj86IGJvb2xlYW47XG4gICAgYWx3YXlzVmlzaWJsZT86IGJvb2xlYW47XG4gICAgZm9yY2VFeHBhbmRlZD86IGJvb2xlYW47XG4gICAgcmVzaXplTm90aWZpZXI6IFJlc2l6ZU5vdGlmaWVyO1xuICAgIGV4dHJhVGlsZXM/OiBSZWFjdENvbXBvbmVudEVsZW1lbnQ8dHlwZW9mIEV4dHJhVGlsZT5bXTtcbiAgICBvbkxpc3RDb2xsYXBzZT86IChpc0V4cGFuZGVkOiBib29sZWFuKSA9PiB2b2lkO1xufVxuXG4vLyBUT0RPOiBVc2UgcmUtcmVzaXplcidzIE51bWJlclNpemUgd2hlbiBpdCBpcyBleHBvc2VkIGFzIHRoZSB0eXBlXG5pbnRlcmZhY2UgUmVzaXplRGVsdGEge1xuICAgIHdpZHRoOiBudW1iZXI7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG59XG5cbnR5cGUgUGFydGlhbERPTVJlY3QgPSBQaWNrPERPTVJlY3QsIFwibGVmdFwiIHwgXCJ0b3BcIiB8IFwiaGVpZ2h0XCI+O1xuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBjb250ZXh0TWVudVBvc2l0aW9uOiBQYXJ0aWFsRE9NUmVjdDtcbiAgICBpc1Jlc2l6aW5nOiBib29sZWFuO1xuICAgIGlzRXhwYW5kZWQ6IGJvb2xlYW47IC8vIHVzZWQgZm9yIHRoZSBmb3IgZXhwYW5kIG9mIHRoZSBzdWJsaXN0IHdoZW4gdGhlIHJvb20gbGlzdCBpcyBiZWluZyBmaWx0ZXJlZFxuICAgIGhlaWdodDogbnVtYmVyO1xuICAgIHJvb21zOiBSb29tW107XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJvb21TdWJsaXN0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSBoZWFkZXJCdXR0b24gPSBjcmVhdGVSZWY8SFRNTERpdkVsZW1lbnQ+KCk7XG4gICAgcHJpdmF0ZSBzdWJsaXN0UmVmID0gY3JlYXRlUmVmPEhUTUxEaXZFbGVtZW50PigpO1xuICAgIHByaXZhdGUgdGlsZXNSZWYgPSBjcmVhdGVSZWY8SFRNTERpdkVsZW1lbnQ+KCk7XG4gICAgcHJpdmF0ZSBkaXNwYXRjaGVyUmVmOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBsYXlvdXQ6IExpc3RMYXlvdXQ7XG4gICAgcHJpdmF0ZSBoZWlnaHRBdFN0YXJ0OiBudW1iZXI7XG4gICAgcHJpdmF0ZSBub3RpZmljYXRpb25TdGF0ZTogTGlzdE5vdGlmaWNhdGlvblN0YXRlO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5sYXlvdXQgPSBSb29tTGlzdExheW91dFN0b3JlLmluc3RhbmNlLmdldExheW91dEZvcih0aGlzLnByb3BzLnRhZ0lkKTtcbiAgICAgICAgdGhpcy5oZWlnaHRBdFN0YXJ0ID0gMDtcbiAgICAgICAgdGhpcy5ub3RpZmljYXRpb25TdGF0ZSA9IFJvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlLmluc3RhbmNlLmdldExpc3RTdGF0ZSh0aGlzLnByb3BzLnRhZ0lkKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGNvbnRleHRNZW51UG9zaXRpb246IG51bGwsXG4gICAgICAgICAgICBpc1Jlc2l6aW5nOiBmYWxzZSxcbiAgICAgICAgICAgIGlzRXhwYW5kZWQ6ICF0aGlzLmxheW91dC5pc0NvbGxhcHNlZCxcbiAgICAgICAgICAgIGhlaWdodDogMCwgLy8gdG8gYmUgZml4ZWQgaW4gYSBtb21lbnQsIHdlIG5lZWQgYHJvb21zYCB0byBjYWxjdWxhdGUgdGhpcy5cbiAgICAgICAgICAgIHJvb21zOiBhcnJheUZhc3RDbG9uZShSb29tTGlzdFN0b3JlLmluc3RhbmNlLm9yZGVyZWRMaXN0c1t0aGlzLnByb3BzLnRhZ0lkXSB8fCBbXSksXG4gICAgICAgIH07XG4gICAgICAgIC8vIFdoeSBPYmplY3QuYXNzaWduKCkgYW5kIG5vdCB0aGlzLnN0YXRlLmhlaWdodD8gQmVjYXVzZSBUeXBlU2NyaXB0IHNheXMgbm8uXG4gICAgICAgIHRoaXMuc3RhdGUgPSBPYmplY3QuYXNzaWduKHRoaXMuc3RhdGUsIHsgaGVpZ2h0OiB0aGlzLmNhbGN1bGF0ZUluaXRpYWxIZWlnaHQoKSB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNhbGN1bGF0ZUluaXRpYWxIZWlnaHQoKSB7XG4gICAgICAgIGNvbnN0IHJlcXVlc3RlZFZpc2libGVUaWxlcyA9IE1hdGgubWF4KE1hdGguZmxvb3IodGhpcy5sYXlvdXQudmlzaWJsZVRpbGVzKSwgdGhpcy5sYXlvdXQubWluVmlzaWJsZVRpbGVzKTtcbiAgICAgICAgY29uc3QgdGlsZUNvdW50ID0gTWF0aC5taW4odGhpcy5udW1UaWxlcywgcmVxdWVzdGVkVmlzaWJsZVRpbGVzKTtcbiAgICAgICAgcmV0dXJuIHRoaXMubGF5b3V0LnRpbGVzVG9QaXhlbHNXaXRoUGFkZGluZyh0aWxlQ291bnQsIHRoaXMucGFkZGluZyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXQgcGFkZGluZygpIHtcbiAgICAgICAgbGV0IHBhZGRpbmcgPSBSRVNJWkVfSEFORExFX0hFSUdIVDtcbiAgICAgICAgLy8gdGhpcyBpcyB1c2VkIGZvciBjYWxjdWxhdGluZyB0aGUgbWF4IGhlaWdodCBvZiB0aGUgd2hvbGUgY29udGFpbmVyLFxuICAgICAgICAvLyBhbmQgdGFrZXMgaW50byBhY2NvdW50IHdoZXRoZXIgdGhlcmUgc2hvdWxkIGJlIHJvb20gcmVzZXJ2ZWQgZm9yIHRoZSBzaG93IG1vcmUvbGVzcyBidXR0b25cbiAgICAgICAgLy8gd2hlbiBmdWxseSBleHBhbmRlZC4gV2UgY2FuJ3QgcmVseSBwdXJlbHkgb24gdGhlIGxheW91dCdzIGRlZmF1bHRWaXNpYmxlIHRpbGUgY291bnRcbiAgICAgICAgLy8gYmVjYXVzZSB0aGVyZSBhcmUgY29uZGl0aW9ucyBpbiB3aGljaCB3ZSBuZWVkIHRvIGtub3cgdGhhdCB0aGUgJ3Nob3cgbW9yZScgYnV0dG9uXG4gICAgICAgIC8vIGlzIHByZXNlbnQgd2hpbGUgd2VsbCB1bmRlciB0aGUgZGVmYXVsdCB0aWxlIGxpbWl0LlxuICAgICAgICBjb25zdCBuZWVkc1Nob3dNb3JlID0gdGhpcy5udW1UaWxlcyA+IHRoaXMubnVtVmlzaWJsZVRpbGVzO1xuXG4gICAgICAgIC8vIC4uLmJ1dCBhbHNvIGNoZWNrIHRoaXMgb3Igd2UnbGwgbWlzcyBpZiB0aGUgc2VjdGlvbiBpcyBleHBhbmRlZCBhbmQgd2UgbmVlZCBhXG4gICAgICAgIC8vICdzaG93IGxlc3MnXG4gICAgICAgIGNvbnN0IG5lZWRzU2hvd0xlc3MgPSB0aGlzLm51bVRpbGVzID4gdGhpcy5sYXlvdXQuZGVmYXVsdFZpc2libGVUaWxlcztcblxuICAgICAgICBpZiAobmVlZHNTaG93TW9yZSB8fCBuZWVkc1Nob3dMZXNzKSB7XG4gICAgICAgICAgICBwYWRkaW5nICs9IFNIT1dfTl9CVVRUT05fSEVJR0hUO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYWRkaW5nO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0IGV4dHJhVGlsZXMoKTogUmVhY3RDb21wb25lbnRFbGVtZW50PHR5cGVvZiBFeHRyYVRpbGU+W10gfCBudWxsIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZXh0cmFUaWxlcykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMuZXh0cmFUaWxlcztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldCBudW1UaWxlcygpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gUm9vbVN1Ymxpc3QuY2FsY051bVRpbGVzKHRoaXMuc3RhdGUucm9vbXMsIHRoaXMuZXh0cmFUaWxlcyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgY2FsY051bVRpbGVzKHJvb21zOiBSb29tW10sIGV4dHJhVGlsZXM6IGFueVtdKSB7XG4gICAgICAgIHJldHVybiAocm9vbXMgfHwgW10pLmxlbmd0aCArIChleHRyYVRpbGVzIHx8IFtdKS5sZW5ndGg7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXQgbnVtVmlzaWJsZVRpbGVzKCk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IG5WaXNpYmxlID0gTWF0aC5jZWlsKHRoaXMubGF5b3V0LnZpc2libGVUaWxlcyk7XG4gICAgICAgIHJldHVybiBNYXRoLm1pbihuVmlzaWJsZSwgdGhpcy5udW1UaWxlcyk7XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHM6IFJlYWRvbmx5PElQcm9wcz4sIHByZXZTdGF0ZTogUmVhZG9ubHk8SVN0YXRlPikge1xuICAgICAgICBjb25zdCBwcmV2RXh0cmFUaWxlcyA9IHByZXZQcm9wcy5leHRyYVRpbGVzO1xuICAgICAgICAvLyBhcyB0aGUgcm9vbXMgY2FuIGNvbWUgaW4gb25lIGJ5IG9uZSB3ZSBuZWVkIHRvIHJlZXZhbHVhdGVcbiAgICAgICAgLy8gdGhlIGFtb3VudCBvZiBhdmFpbGFibGUgcm9vbXMgdG8gY2FwIHRoZSBhbW91bnQgb2YgcmVxdWVzdGVkIHZpc2libGUgcm9vbXMgYnkgdGhlIGxheW91dFxuICAgICAgICBpZiAoUm9vbVN1Ymxpc3QuY2FsY051bVRpbGVzKHByZXZTdGF0ZS5yb29tcywgcHJldkV4dHJhVGlsZXMpICE9PSB0aGlzLm51bVRpbGVzKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgaGVpZ2h0OiB0aGlzLmNhbGN1bGF0ZUluaXRpYWxIZWlnaHQoKSB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzOiBSZWFkb25seTxJUHJvcHM+LCBuZXh0U3RhdGU6IFJlYWRvbmx5PElTdGF0ZT4pOiBib29sZWFuIHtcbiAgICAgICAgaWYgKG9iamVjdEhhc0RpZmYodGhpcy5wcm9wcywgbmV4dFByb3BzKSkge1xuICAgICAgICAgICAgLy8gU29tZXRoaW5nIHdlIGRvbid0IGNhcmUgdG8gb3B0aW1pemUgaGFzIHVwZGF0ZWQsIHNvIHVwZGF0ZS5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRG8gdGhlIHNhbWUgY2hlY2sgdXNlZCBvbiBwcm9wcyBmb3Igc3RhdGUsIHdpdGhvdXQgdGhlIHJvb21zIHdlJ3JlIGdvaW5nIHRvIG5vLW9wXG4gICAgICAgIGNvbnN0IHByZXZTdGF0ZU5vUm9vbXMgPSBvYmplY3RFeGNsdWRpbmcodGhpcy5zdGF0ZSwgWydyb29tcyddKTtcbiAgICAgICAgY29uc3QgbmV4dFN0YXRlTm9Sb29tcyA9IG9iamVjdEV4Y2x1ZGluZyhuZXh0U3RhdGUsIFsncm9vbXMnXSk7XG4gICAgICAgIGlmIChvYmplY3RIYXNEaWZmKHByZXZTdGF0ZU5vUm9vbXMsIG5leHRTdGF0ZU5vUm9vbXMpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHdlJ3JlIHN1cHBvc2VkIHRvIGhhbmRsZSBleHRyYSB0aWxlcywgdGFrZSB0aGUgcGVyZm9ybWFuY2UgaGl0IGFuZCByZS1yZW5kZXIgYWxsIHRoZVxuICAgICAgICAvLyB0aW1lIHNvIHdlIGRvbid0IGhhdmUgdG8gY29uc2lkZXIgdGhlbSBhcyBwYXJ0IG9mIHRoZSB2aXNpYmxlIHJvb20gb3B0aW1pemF0aW9uLlxuICAgICAgICBjb25zdCBwcmV2RXh0cmFUaWxlcyA9IHRoaXMucHJvcHMuZXh0cmFUaWxlcyB8fCBbXTtcbiAgICAgICAgY29uc3QgbmV4dEV4dHJhVGlsZXMgPSBuZXh0UHJvcHMuZXh0cmFUaWxlcyB8fCBbXTtcbiAgICAgICAgaWYgKHByZXZFeHRyYVRpbGVzLmxlbmd0aCA+IDAgfHwgbmV4dEV4dHJhVGlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB3ZSdyZSBhYm91dCB0byB1cGRhdGUgdGhlIGhlaWdodCBvZiB0aGUgbGlzdCwgd2UgZG9uJ3QgcmVhbGx5IGNhcmUgYWJvdXQgd2hpY2ggcm9vbXNcbiAgICAgICAgLy8gYXJlIHZpc2libGUgb3Igbm90IGZvciBuby1vcCBwdXJwb3Nlcywgc28gZW5zdXJlIHRoYXQgdGhlIGhlaWdodCBjYWxjdWxhdGlvbiBydW5zIHRocm91Z2guXG4gICAgICAgIGlmIChSb29tU3VibGlzdC5jYWxjTnVtVGlsZXMobmV4dFN0YXRlLnJvb21zLCBuZXh0RXh0cmFUaWxlcykgIT09IHRoaXMubnVtVGlsZXMpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQmVmb3JlIHdlIGdvIGFuYWx5emluZyB0aGUgcm9vbXMsIHdlIGNhbiBzZWUgaWYgd2UncmUgY29sbGFwc2VkLiBJZiB3ZSdyZSBjb2xsYXBzZWQsIHdlIGRvbid0IG5lZWRcbiAgICAgICAgLy8gdG8gcmVuZGVyIGFueXRoaW5nLiBXZSBkbyB0aGlzIGFmdGVyIHRoZSBoZWlnaHQgY2hlY2sgdGhvdWdoIHRvIGVuc3VyZSB0aGF0IHRoZSBoZWlnaHQgZ2V0cyBhcHByb3ByaWF0ZWx5XG4gICAgICAgIC8vIGNhbGN1bGF0ZWQgZm9yIHdoZW4vaWYgd2UgYmVjb21lIHVuY29sbGFwc2VkLlxuICAgICAgICBpZiAoIW5leHRTdGF0ZS5pc0V4cGFuZGVkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBRdWlja2x5IGRvdWJsZSBjaGVjayB3ZSdyZSBub3QgYWJvdXQgdG8gYnJlYWsgc29tZXRoaW5nIGR1ZSB0byB0aGUgbnVtYmVyIG9mIHJvb21zIGNoYW5naW5nLlxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5yb29tcy5sZW5ndGggIT09IG5leHRTdGF0ZS5yb29tcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmluYWxseSwgZGV0ZXJtaW5lIGlmIHRoZSByb29tIHVwZGF0ZSAoYXMgcHJlc3VtYWJseSB0aGF0J3MgYWxsIHRoYXQncyBsZWZ0KSBpcyB3aXRoaW5cbiAgICAgICAgLy8gb3VyIHZpc2libGUgcmFuZ2UuIElmIGl0IGlzLCB0aGVuIGRvIGEgcmVuZGVyLiBJZiB0aGUgdXBkYXRlIGlzIG91dHNpZGUgb3VyIHZpc2libGUgcmFuZ2VcbiAgICAgICAgLy8gdGhlbiB3ZSBjYW4gc2tpcCB0aGUgdXBkYXRlLlxuICAgICAgICAvL1xuICAgICAgICAvLyBXZSBhbHNvIG9wdGltaXplIGZvciBvcmRlciBjaGFuZ2luZyBoZXJlOiBpZiB0aGUgdXBkYXRlIGRpZCBoYXBwZW4gaW4gb3VyIHZpc2libGUgcmFuZ2VcbiAgICAgICAgLy8gYnV0IGRvZXNuJ3QgcmVzdWx0IGluIHRoZSBsaXN0IHJlLXNvcnRpbmcgaXRzZWxmIHRoZW4gdGhlcmUncyBubyByZWFzb24gZm9yIHVzIHRvIHVwZGF0ZVxuICAgICAgICAvLyBvbiBvdXIgb3duLlxuICAgICAgICBjb25zdCBwcmV2U2xpY2VkUm9vbXMgPSB0aGlzLnN0YXRlLnJvb21zLnNsaWNlKDAsIHRoaXMubnVtVmlzaWJsZVRpbGVzKTtcbiAgICAgICAgY29uc3QgbmV4dFNsaWNlZFJvb21zID0gbmV4dFN0YXRlLnJvb21zLnNsaWNlKDAsIHRoaXMubnVtVmlzaWJsZVRpbGVzKTtcbiAgICAgICAgaWYgKGFycmF5SGFzT3JkZXJDaGFuZ2UocHJldlNsaWNlZFJvb21zLCBuZXh0U2xpY2VkUm9vbXMpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZpbmFsbHksIG5vdGhpbmcgaGFwcGVuZWQgc28gbm8tb3AgdGhlIHVwZGF0ZVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXJSZWYgPSBkZWZhdWx0RGlzcGF0Y2hlci5yZWdpc3Rlcih0aGlzLm9uQWN0aW9uKTtcbiAgICAgICAgUm9vbUxpc3RTdG9yZS5pbnN0YW5jZS5vbihMSVNUU19VUERBVEVfRVZFTlQsIHRoaXMub25MaXN0c1VwZGF0ZWQpO1xuICAgICAgICAvLyBVc2luZyB0aGUgcGFzc2l2ZSBvcHRpb24gdG8gbm90IGJsb2NrIHRoZSBtYWluIHRocmVhZFxuICAgICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvRXZlbnRUYXJnZXQvYWRkRXZlbnRMaXN0ZW5lciNpbXByb3Zpbmdfc2Nyb2xsaW5nX3BlcmZvcm1hbmNlX3dpdGhfcGFzc2l2ZV9saXN0ZW5lcnNcbiAgICAgICAgdGhpcy50aWxlc1JlZi5jdXJyZW50Py5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsIHRoaXMub25TY3JvbGxQcmV2ZW50LCB7IHBhc3NpdmU6IHRydWUgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci51bnJlZ2lzdGVyKHRoaXMuZGlzcGF0Y2hlclJlZik7XG4gICAgICAgIFJvb21MaXN0U3RvcmUuaW5zdGFuY2Uub2ZmKExJU1RTX1VQREFURV9FVkVOVCwgdGhpcy5vbkxpc3RzVXBkYXRlZCk7XG4gICAgICAgIHRoaXMudGlsZXNSZWYuY3VycmVudD8ucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCB0aGlzLm9uU2Nyb2xsUHJldmVudCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkxpc3RzVXBkYXRlZCA9ICgpID0+IHtcbiAgICAgICAgY29uc3Qgc3RhdGVVcGRhdGVzOiBJU3RhdGUgJiBhbnkgPSB7fTsgLy8gJmFueSBpcyB0byBhdm9pZCBhIGNhc3Qgb24gdGhlIGluaXRpYWxpemVyXG5cbiAgICAgICAgY29uc3QgY3VycmVudFJvb21zID0gdGhpcy5zdGF0ZS5yb29tcztcbiAgICAgICAgY29uc3QgbmV3Um9vbXMgPSBhcnJheUZhc3RDbG9uZShSb29tTGlzdFN0b3JlLmluc3RhbmNlLm9yZGVyZWRMaXN0c1t0aGlzLnByb3BzLnRhZ0lkXSB8fCBbXSk7XG4gICAgICAgIGlmIChhcnJheUhhc09yZGVyQ2hhbmdlKGN1cnJlbnRSb29tcywgbmV3Um9vbXMpKSB7XG4gICAgICAgICAgICBzdGF0ZVVwZGF0ZXMucm9vbXMgPSBuZXdSb29tcztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChPYmplY3Qua2V5cyhzdGF0ZVVwZGF0ZXMpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoc3RhdGVVcGRhdGVzKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQWN0aW9uID0gKHBheWxvYWQ6IEFjdGlvblBheWxvYWQpID0+IHtcbiAgICAgICAgaWYgKHBheWxvYWQuYWN0aW9uID09PSBBY3Rpb24uVmlld1Jvb20gJiYgcGF5bG9hZC5zaG93X3Jvb21fdGlsZSAmJiB0aGlzLnN0YXRlLnJvb21zKSB7XG4gICAgICAgICAgICAvLyBYWFg6IHdlIGhhdmUgdG8gZG8gdGhpcyBhIHRpY2sgbGF0ZXIgYmVjYXVzZSB3ZSBoYXZlIGluY29ycmVjdCBpbnRlcm1lZGlhdGUgcHJvcHMgZHVyaW5nIGEgcm9vbSBjaGFuZ2VcbiAgICAgICAgICAgIC8vIHdoZXJlIHdlIGxvc2UgdGhlIHJvb20gd2UgYXJlIGNoYW5naW5nIGZyb20gdGVtcG9yYXJpbHkgYW5kIHRoZW4gaXQgY29tZXMgYmFjayBpbiBhbiB1cGRhdGUgcmlnaHQgYWZ0ZXIuXG4gICAgICAgICAgICBzZXRJbW1lZGlhdGUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb21JbmRleCA9IHRoaXMuc3RhdGUucm9vbXMuZmluZEluZGV4KChyKSA9PiByLnJvb21JZCA9PT0gcGF5bG9hZC5yb29tX2lkKTtcblxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5zdGF0ZS5pc0V4cGFuZGVkICYmIHJvb21JbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlQ29sbGFwc2VkKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGV4dGVuZCB0aGUgdmlzaWJsZSBzZWN0aW9uIHRvIGluY2x1ZGUgdGhlIHJvb20gaWYgaXQgaXMgZW50aXJlbHkgaW52aXNpYmxlXG4gICAgICAgICAgICAgICAgaWYgKHJvb21JbmRleCA+PSB0aGlzLm51bVZpc2libGVUaWxlcykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxheW91dC52aXNpYmxlVGlsZXMgPSB0aGlzLmxheW91dC50aWxlc1dpdGhQYWRkaW5nKHJvb21JbmRleCArIDEsIE1BWF9QQURESU5HX0hFSUdIVCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTsgLy8gYmVjYXVzZSB0aGUgbGF5b3V0IGRvZXNuJ3QgdHJpZ2dlciBhIHJlLXJlbmRlclxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgYXBwbHlIZWlnaHRDaGFuZ2UobmV3SGVpZ2h0OiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgaGVpZ2h0SW5UaWxlcyA9IE1hdGguY2VpbCh0aGlzLmxheW91dC5waXhlbHNUb1RpbGVzKG5ld0hlaWdodCAtIHRoaXMucGFkZGluZykpO1xuICAgICAgICB0aGlzLmxheW91dC52aXNpYmxlVGlsZXMgPSBNYXRoLm1pbih0aGlzLm51bVRpbGVzLCBoZWlnaHRJblRpbGVzKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUmVzaXplID0gKFxuICAgICAgICBlOiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCxcbiAgICAgICAgdHJhdmVsRGlyZWN0aW9uOiBEaXJlY3Rpb24sXG4gICAgICAgIHJlZlRvRWxlbWVudDogSFRNTERpdkVsZW1lbnQsXG4gICAgICAgIGRlbHRhOiBSZXNpemVEZWx0YSxcbiAgICApID0+IHtcbiAgICAgICAgY29uc3QgbmV3SGVpZ2h0ID0gdGhpcy5oZWlnaHRBdFN0YXJ0ICsgZGVsdGEuaGVpZ2h0O1xuICAgICAgICB0aGlzLmFwcGx5SGVpZ2h0Q2hhbmdlKG5ld0hlaWdodCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBoZWlnaHQ6IG5ld0hlaWdodCB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJlc2l6ZVN0YXJ0ID0gKCkgPT4ge1xuICAgICAgICB0aGlzLmhlaWdodEF0U3RhcnQgPSB0aGlzLnN0YXRlLmhlaWdodDtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGlzUmVzaXppbmc6IHRydWUgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25SZXNpemVTdG9wID0gKFxuICAgICAgICBlOiBNb3VzZUV2ZW50IHwgVG91Y2hFdmVudCxcbiAgICAgICAgdHJhdmVsRGlyZWN0aW9uOiBEaXJlY3Rpb24sXG4gICAgICAgIHJlZlRvRWxlbWVudDogSFRNTERpdkVsZW1lbnQsXG4gICAgICAgIGRlbHRhOiBSZXNpemVEZWx0YSxcbiAgICApID0+IHtcbiAgICAgICAgY29uc3QgbmV3SGVpZ2h0ID0gdGhpcy5oZWlnaHRBdFN0YXJ0ICsgZGVsdGEuaGVpZ2h0O1xuICAgICAgICB0aGlzLmFwcGx5SGVpZ2h0Q2hhbmdlKG5ld0hlaWdodCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBpc1Jlc2l6aW5nOiBmYWxzZSwgaGVpZ2h0OiBuZXdIZWlnaHQgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25TaG93QWxsQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIC8vIHJlYWQgbnVtYmVyIG9mIHZpc2libGUgdGlsZXMgYmVmb3JlIHdlIG11dGF0ZSBpdFxuICAgICAgICBjb25zdCBudW1WaXNpYmxlVGlsZXMgPSB0aGlzLm51bVZpc2libGVUaWxlcztcbiAgICAgICAgY29uc3QgbmV3SGVpZ2h0ID0gdGhpcy5sYXlvdXQudGlsZXNUb1BpeGVsc1dpdGhQYWRkaW5nKHRoaXMubnVtVGlsZXMsIHRoaXMucGFkZGluZyk7XG4gICAgICAgIHRoaXMuYXBwbHlIZWlnaHRDaGFuZ2UobmV3SGVpZ2h0KTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGhlaWdodDogbmV3SGVpZ2h0IH0sICgpID0+IHtcbiAgICAgICAgICAgIC8vIGZvY3VzIHRoZSB0b3AtbW9zdCBuZXcgcm9vbVxuICAgICAgICAgICAgdGhpcy5mb2N1c1Jvb21UaWxlKG51bVZpc2libGVUaWxlcyk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uU2hvd0xlc3NDbGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgbmV3SGVpZ2h0ID0gdGhpcy5sYXlvdXQudGlsZXNUb1BpeGVsc1dpdGhQYWRkaW5nKHRoaXMubGF5b3V0LmRlZmF1bHRWaXNpYmxlVGlsZXMsIHRoaXMucGFkZGluZyk7XG4gICAgICAgIHRoaXMuYXBwbHlIZWlnaHRDaGFuZ2UobmV3SGVpZ2h0KTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGhlaWdodDogbmV3SGVpZ2h0IH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGZvY3VzUm9vbVRpbGUgPSAoaW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuc3VibGlzdFJlZi5jdXJyZW50KSByZXR1cm47XG4gICAgICAgIGNvbnN0IGVsZW1lbnRzID0gdGhpcy5zdWJsaXN0UmVmLmN1cnJlbnQucXVlcnlTZWxlY3RvckFsbDxIVE1MRGl2RWxlbWVudD4oXCIubXhfUm9vbVRpbGVcIik7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBlbGVtZW50cyAmJiBlbGVtZW50c1tpbmRleF07XG4gICAgICAgIGlmIChlbGVtZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50LmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbk9wZW5NZW51Q2xpY2sgPSAoZXY6IFJlYWN0Lk1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGV2LnRhcmdldCBhcyBIVE1MQnV0dG9uRWxlbWVudDtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvbnRleHRNZW51UG9zaXRpb246IHRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNvbnRleHRNZW51ID0gKGV2OiBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGNvbnRleHRNZW51UG9zaXRpb246IHtcbiAgICAgICAgICAgICAgICBsZWZ0OiBldi5jbGllbnRYLFxuICAgICAgICAgICAgICAgIHRvcDogZXYuY2xpZW50WSxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDAsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNsb3NlTWVudSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNvbnRleHRNZW51UG9zaXRpb246IG51bGwgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25VbnJlYWRGaXJzdENoYW5nZWQgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGlzVW5yZWFkRmlyc3QgPSBSb29tTGlzdFN0b3JlLmluc3RhbmNlLmdldExpc3RPcmRlcih0aGlzLnByb3BzLnRhZ0lkKSA9PT0gTGlzdEFsZ29yaXRobS5JbXBvcnRhbmNlO1xuICAgICAgICBjb25zdCBuZXdBbGdvcml0aG0gPSBpc1VucmVhZEZpcnN0ID8gTGlzdEFsZ29yaXRobS5OYXR1cmFsIDogTGlzdEFsZ29yaXRobS5JbXBvcnRhbmNlO1xuICAgICAgICBSb29tTGlzdFN0b3JlLmluc3RhbmNlLnNldExpc3RPcmRlcih0aGlzLnByb3BzLnRhZ0lkLCBuZXdBbGdvcml0aG0pO1xuICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7IC8vIGJlY2F1c2UgaWYgdGhlIHN1Ymxpc3QgZG9lc24ndCBoYXZlIGFueSBjaGFuZ2VzIHRoZW4gd2Ugd2lsbCBtaXNzIHRoZSBsaXN0IG9yZGVyIGNoYW5nZVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVGFnU29ydENoYW5nZWQgPSBhc3luYyAoc29ydDogU29ydEFsZ29yaXRobSkgPT4ge1xuICAgICAgICBSb29tTGlzdFN0b3JlLmluc3RhbmNlLnNldFRhZ1NvcnRpbmcodGhpcy5wcm9wcy50YWdJZCwgc29ydCk7XG4gICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbk1lc3NhZ2VQcmV2aWV3Q2hhbmdlZCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5sYXlvdXQuc2hvd1ByZXZpZXdzID0gIXRoaXMubGF5b3V0LnNob3dQcmV2aWV3cztcbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpOyAvLyBiZWNhdXNlIHRoZSBsYXlvdXQgZG9lc24ndCB0cmlnZ2VyIGEgcmUtcmVuZGVyXG4gICAgfTtcblxuICAgIHByaXZhdGUgb25CYWRnZUNsaWNrID0gKGV2OiBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIGxldCByb29tO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy50YWdJZCA9PT0gRGVmYXVsdFRhZ0lELkludml0ZSkge1xuICAgICAgICAgICAgLy8gc3dpdGNoIHRvIGZpcnN0IHJvb20gYXMgdGhhdCdsbCBiZSB0aGUgdG9wIG9mIHRoZSBsaXN0IGZvciB0aGUgdXNlclxuICAgICAgICAgICAgcm9vbSA9IHRoaXMuc3RhdGUucm9vbXMgJiYgdGhpcy5zdGF0ZS5yb29tc1swXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGZpbmQgdGhlIGZpcnN0IHJvb20gd2l0aCBhIGNvdW50IG9mIHRoZSBzYW1lIGNvbG91ciBhcyB0aGUgYmFkZ2UgY291bnRcbiAgICAgICAgICAgIHJvb20gPSBSb29tTGlzdFN0b3JlLmluc3RhbmNlLm9yZGVyZWRMaXN0c1t0aGlzLnByb3BzLnRhZ0lkXS5maW5kKChyOiBSb29tKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm90aWZTdGF0ZSA9IHRoaXMubm90aWZpY2F0aW9uU3RhdGUuZ2V0Rm9yUm9vbShyKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbm90aWZTdGF0ZS5jb3VudCA+IDAgJiYgbm90aWZTdGF0ZS5jb2xvciA9PT0gdGhpcy5ub3RpZmljYXRpb25TdGF0ZS5jb2xvcjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJvb20pIHtcbiAgICAgICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoPFZpZXdSb29tUGF5bG9hZD4oe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlZpZXdSb29tLFxuICAgICAgICAgICAgICAgIHJvb21faWQ6IHJvb20ucm9vbUlkLFxuICAgICAgICAgICAgICAgIHNob3dfcm9vbV90aWxlOiB0cnVlLCAvLyB0byBtYWtlIHN1cmUgdGhlIHJvb20gZ2V0cyBzY3JvbGxlZCBpbnRvIHZpZXdcbiAgICAgICAgICAgICAgICBtZXRyaWNzVHJpZ2dlcjogXCJXZWJSb29tTGlzdE5vdGlmaWNhdGlvbkJhZGdlXCIsXG4gICAgICAgICAgICAgICAgbWV0cmljc1ZpYUtleWJvYXJkOiBldi50eXBlICE9PSBcImNsaWNrXCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uSGVhZGVyQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHBvc3NpYmxlU3RpY2t5ID0gdGhpcy5oZWFkZXJCdXR0b24uY3VycmVudC5wYXJlbnRFbGVtZW50O1xuICAgICAgICBjb25zdCBzdWJsaXN0ID0gcG9zc2libGVTdGlja3kucGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50O1xuICAgICAgICBjb25zdCBsaXN0ID0gc3VibGlzdC5wYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgIC8vIHRoZSBzY3JvbGxUb3AgaXMgY2FwcGVkIGF0IHRoZSBoZWlnaHQgb2YgdGhlIGhlYWRlciBpbiBMZWZ0UGFuZWwsIHRoZSB0b3AgaGVhZGVyIGlzIGFsd2F5cyBzdGlja3lcbiAgICAgICAgY29uc3QgbGlzdFNjcm9sbFRvcCA9IE1hdGgucm91bmQobGlzdC5zY3JvbGxUb3ApO1xuICAgICAgICBjb25zdCBpc0F0VG9wID0gbGlzdFNjcm9sbFRvcCA8PSBNYXRoLnJvdW5kKEhFQURFUl9IRUlHSFQpO1xuICAgICAgICBjb25zdCBpc0F0Qm90dG9tID0gbGlzdFNjcm9sbFRvcCA+PSBNYXRoLnJvdW5kKGxpc3Quc2Nyb2xsSGVpZ2h0IC0gbGlzdC5vZmZzZXRIZWlnaHQpO1xuICAgICAgICBjb25zdCBpc1N0aWNreVRvcCA9IHBvc3NpYmxlU3RpY2t5LmNsYXNzTGlzdC5jb250YWlucygnbXhfUm9vbVN1Ymxpc3RfaGVhZGVyQ29udGFpbmVyX3N0aWNreVRvcCcpO1xuICAgICAgICBjb25zdCBpc1N0aWNreUJvdHRvbSA9IHBvc3NpYmxlU3RpY2t5LmNsYXNzTGlzdC5jb250YWlucygnbXhfUm9vbVN1Ymxpc3RfaGVhZGVyQ29udGFpbmVyX3N0aWNreUJvdHRvbScpO1xuXG4gICAgICAgIGlmICgoaXNTdGlja3lCb3R0b20gJiYgIWlzQXRCb3R0b20pIHx8IChpc1N0aWNreVRvcCAmJiAhaXNBdFRvcCkpIHtcbiAgICAgICAgICAgIC8vIGlzIHN0aWNreSAtIGp1bXAgdG8gbGlzdFxuICAgICAgICAgICAgc3VibGlzdC5zY3JvbGxJbnRvVmlldyh7IGJlaGF2aW9yOiAnc21vb3RoJyB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIG9uIHNjcmVlbiAtIHRvZ2dsZSBjb2xsYXBzZVxuICAgICAgICAgICAgY29uc3QgaXNFeHBhbmRlZCA9IHRoaXMuc3RhdGUuaXNFeHBhbmRlZDtcbiAgICAgICAgICAgIHRoaXMudG9nZ2xlQ29sbGFwc2VkKCk7XG4gICAgICAgICAgICAvLyBpZiB0aGUgYm90dG9tIGxpc3QgaXMgY29sbGFwc2VkIHRoZW4gc2Nyb2xsIGl0IGluIHNvIGl0IGRvZXNuJ3QgZXhwYW5kIG9mZiBzY3JlZW5cbiAgICAgICAgICAgIGlmICghaXNFeHBhbmRlZCAmJiBpc1N0aWNreUJvdHRvbSkge1xuICAgICAgICAgICAgICAgIHNldEltbWVkaWF0ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Ymxpc3Quc2Nyb2xsSW50b1ZpZXcoeyBiZWhhdmlvcjogJ3Ntb290aCcgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSB0b2dnbGVDb2xsYXBzZWQgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmZvcmNlRXhwYW5kZWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5sYXlvdXQuaXNDb2xsYXBzZWQgPSB0aGlzLnN0YXRlLmlzRXhwYW5kZWQ7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBpc0V4cGFuZGVkOiAhdGhpcy5sYXlvdXQuaXNDb2xsYXBzZWQgfSk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uTGlzdENvbGxhcHNlKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uTGlzdENvbGxhcHNlKCF0aGlzLmxheW91dC5pc0NvbGxhcHNlZCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkhlYWRlcktleURvd24gPSAoZXY6IFJlYWN0LktleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgYWN0aW9uID0gZ2V0S2V5QmluZGluZ3NNYW5hZ2VyKCkuZ2V0Um9vbUxpc3RBY3Rpb24oZXYpO1xuICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSBLZXlCaW5kaW5nQWN0aW9uLkNvbGxhcHNlUm9vbUxpc3RTZWN0aW9uOlxuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmlzRXhwYW5kZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ29sbGFwc2UgdGhlIHJvb20gc3VibGlzdCBpZiBpdCBpc24ndCBhbHJlYWR5XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlQ29sbGFwc2VkKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBLZXlCaW5kaW5nQWN0aW9uLkV4cGFuZFJvb21MaXN0U2VjdGlvbjoge1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5zdGF0ZS5pc0V4cGFuZGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEV4cGFuZCB0aGUgcm9vbSBzdWJsaXN0IGlmIGl0IGlzbid0IGFscmVhZHlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVDb2xsYXBzZWQoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3VibGlzdFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIG90aGVyd2lzZSBmb2N1cyB0aGUgZmlyc3Qgcm9vbVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5zdWJsaXN0UmVmLmN1cnJlbnQucXVlcnlTZWxlY3RvcihcIi5teF9Sb29tVGlsZVwiKSBhcyBIVE1MRGl2RWxlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uS2V5RG93biA9IChldjogUmVhY3QuS2V5Ym9hcmRFdmVudCkgPT4ge1xuICAgICAgICBjb25zdCBhY3Rpb24gPSBnZXRLZXlCaW5kaW5nc01hbmFnZXIoKS5nZXRBY2Nlc3NpYmlsaXR5QWN0aW9uKGV2KTtcbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgIC8vIE9uIEFycm93TGVmdCBnbyB0byB0aGUgc3VibGlzdCBoZWFkZXJcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5BcnJvd0xlZnQ6XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5oZWFkZXJCdXR0b24uY3VycmVudC5mb2N1cygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgLy8gQ29uc3VtZSBBcnJvd1JpZ2h0IHNvIGl0IGRvZXNuJ3QgY2F1c2UgZm9jdXMgdG8gZ2V0IHNlbnQgdG8gY29tcG9zZXJcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5BcnJvd1JpZ2h0OlxuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgcmVuZGVyVmlzaWJsZVRpbGVzKCk6IFJlYWN0LlJlYWN0RWxlbWVudFtdIHtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmlzRXhwYW5kZWQgJiYgIXRoaXMucHJvcHMuZm9yY2VFeHBhbmRlZCkge1xuICAgICAgICAgICAgLy8gZG9uJ3Qgd2FzdGUgdGltZSBvbiByZW5kZXJpbmdcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHRpbGVzOiBSZWFjdC5SZWFjdEVsZW1lbnRbXSA9IFtdO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnJvb21zKSB7XG4gICAgICAgICAgICBsZXQgdmlzaWJsZVJvb21zID0gdGhpcy5zdGF0ZS5yb29tcztcbiAgICAgICAgICAgIGlmICghdGhpcy5wcm9wcy5mb3JjZUV4cGFuZGVkKSB7XG4gICAgICAgICAgICAgICAgdmlzaWJsZVJvb21zID0gdmlzaWJsZVJvb21zLnNsaWNlKDAsIHRoaXMubnVtVmlzaWJsZVRpbGVzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yIChjb25zdCByb29tIG9mIHZpc2libGVSb29tcykge1xuICAgICAgICAgICAgICAgIHRpbGVzLnB1c2goPFJvb21UaWxlXG4gICAgICAgICAgICAgICAgICAgIHJvb209e3Jvb219XG4gICAgICAgICAgICAgICAgICAgIGtleT17YHJvb20tJHtyb29tLnJvb21JZH1gfVxuICAgICAgICAgICAgICAgICAgICBzaG93TWVzc2FnZVByZXZpZXc9e3RoaXMubGF5b3V0LnNob3dQcmV2aWV3c31cbiAgICAgICAgICAgICAgICAgICAgaXNNaW5pbWl6ZWQ9e3RoaXMucHJvcHMuaXNNaW5pbWl6ZWR9XG4gICAgICAgICAgICAgICAgICAgIHRhZz17dGhpcy5wcm9wcy50YWdJZH1cbiAgICAgICAgICAgICAgICAvPik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5leHRyYVRpbGVzKSB7XG4gICAgICAgICAgICAvLyBIQUNLOiBXZSBicmVhayB0eXBpbmcgaGVyZSwgYnV0IHRoaXMgJ2V4dHJhIHRpbGVzJyBwcm9wZXJ0eSBzaG91bGRuJ3QgZXhpc3QuXG4gICAgICAgICAgICAodGlsZXMgYXMgYW55W10pLnB1c2goLi4udGhpcy5leHRyYVRpbGVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdlIG9ubHkgaGF2ZSB0byBkbyB0aGlzIGJlY2F1c2Ugb2YgdGhlIGV4dHJhIHRpbGVzLiBXZSBkbyBpdCBjb25kaXRpb25hbGx5XG4gICAgICAgIC8vIHRvIGF2b2lkIHNwZW5kaW5nIGN5Y2xlcyBvbiBzbGljaW5nLiBJdCdzIGdlbmVyYWxseSBmaW5lIHRvIGRvIHRoaXMgdGhvdWdoXG4gICAgICAgIC8vIGFzIHVzZXJzIGFyZSB1bmxpa2VseSB0byBoYXZlIG1vcmUgdGhhbiBhIGhhbmRmdWwgb2YgdGlsZXMgd2hlbiB0aGUgZXh0cmFcbiAgICAgICAgLy8gdGlsZXMgYXJlIHVzZWQuXG4gICAgICAgIGlmICh0aWxlcy5sZW5ndGggPiB0aGlzLm51bVZpc2libGVUaWxlcyAmJiAhdGhpcy5wcm9wcy5mb3JjZUV4cGFuZGVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGlsZXMuc2xpY2UoMCwgdGhpcy5udW1WaXNpYmxlVGlsZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRpbGVzO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyTWVudSgpOiBSZWFjdC5SZWFjdEVsZW1lbnQge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy50YWdJZCA9PT0gRGVmYXVsdFRhZ0lELlN1Z2dlc3RlZCB8fCB0aGlzLnByb3BzLnRhZ0lkID09PSBEZWZhdWx0VGFnSUQuU2F2ZWRJdGVtcykgcmV0dXJuIG51bGw7IC8vIG5vdCBzb3J0YWJsZVxuXG4gICAgICAgIGxldCBjb250ZXh0TWVudSA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmNvbnRleHRNZW51UG9zaXRpb24pIHtcbiAgICAgICAgICAgIGNvbnN0IGlzQWxwaGFiZXRpY2FsID0gUm9vbUxpc3RTdG9yZS5pbnN0YW5jZS5nZXRUYWdTb3J0aW5nKHRoaXMucHJvcHMudGFnSWQpID09PSBTb3J0QWxnb3JpdGhtLkFscGhhYmV0aWM7XG4gICAgICAgICAgICBjb25zdCBpc1VucmVhZEZpcnN0ID0gUm9vbUxpc3RTdG9yZS5pbnN0YW5jZS5nZXRMaXN0T3JkZXIodGhpcy5wcm9wcy50YWdJZCkgPT09IExpc3RBbGdvcml0aG0uSW1wb3J0YW5jZTtcblxuICAgICAgICAgICAgLy8gSW52aXRlcyBkb24ndCBnZXQgc29tZSBub25zZW5zZSBvcHRpb25zLCBzbyBvbmx5IGFkZCB0aGVtIGlmIHdlIGhhdmUgdG8uXG4gICAgICAgICAgICBsZXQgb3RoZXJTZWN0aW9ucyA9IG51bGw7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy50YWdJZCAhPT0gRGVmYXVsdFRhZ0lELkludml0ZSkge1xuICAgICAgICAgICAgICAgIG90aGVyU2VjdGlvbnMgPSAoXG4gICAgICAgICAgICAgICAgICAgIDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxociAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfUm9vbVN1Ymxpc3RfY29udGV4dE1lbnVfdGl0bGUnPnsgX3QoXCJBcHBlYXJhbmNlXCIpIH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8U3R5bGVkTWVudUl0ZW1DaGVja2JveFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsb3NlPXt0aGlzLm9uQ2xvc2VNZW51fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vblVucmVhZEZpcnN0Q2hhbmdlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tlZD17aXNVbnJlYWRGaXJzdH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJTaG93IHJvb21zIHdpdGggdW5yZWFkIG1lc3NhZ2VzIGZpcnN0XCIpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1N0eWxlZE1lbnVJdGVtQ2hlY2tib3g+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPFN0eWxlZE1lbnVJdGVtQ2hlY2tib3hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbG9zZT17dGhpcy5vbkNsb3NlTWVudX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25NZXNzYWdlUHJldmlld0NoYW5nZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ9e3RoaXMubGF5b3V0LnNob3dQcmV2aWV3c31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJTaG93IHByZXZpZXdzIG9mIG1lc3NhZ2VzXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1N0eWxlZE1lbnVJdGVtQ2hlY2tib3g+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9SZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb250ZXh0TWVudSA9IChcbiAgICAgICAgICAgICAgICA8Q29udGV4dE1lbnVcbiAgICAgICAgICAgICAgICAgICAgY2hldnJvbkZhY2U9e0NoZXZyb25GYWNlLk5vbmV9XG4gICAgICAgICAgICAgICAgICAgIGxlZnQ9e3RoaXMuc3RhdGUuY29udGV4dE1lbnVQb3NpdGlvbi5sZWZ0fVxuICAgICAgICAgICAgICAgICAgICB0b3A9e3RoaXMuc3RhdGUuY29udGV4dE1lbnVQb3NpdGlvbi50b3AgKyB0aGlzLnN0YXRlLmNvbnRleHRNZW51UG9zaXRpb24uaGVpZ2h0fVxuICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLm9uQ2xvc2VNZW51fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tU3VibGlzdF9jb250ZXh0TWVudVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfUm9vbVN1Ymxpc3RfY29udGV4dE1lbnVfdGl0bGUnPnsgX3QoXCJTb3J0IGJ5XCIpIH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8U3R5bGVkTWVudUl0ZW1SYWRpb1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsb3NlPXt0aGlzLm9uQ2xvc2VNZW51fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KCkgPT4gdGhpcy5vblRhZ1NvcnRDaGFuZ2VkKFNvcnRBbGdvcml0aG0uUmVjZW50KX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tlZD17IWlzQWxwaGFiZXRpY2FsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lPXtgbXhfJHt0aGlzLnByb3BzLnRhZ0lkfV9zb3J0QnlgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkFjdGl2aXR5XCIpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L1N0eWxlZE1lbnVJdGVtUmFkaW8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPFN0eWxlZE1lbnVJdGVtUmFkaW9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbG9zZT17dGhpcy5vbkNsb3NlTWVudX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eygpID0+IHRoaXMub25UYWdTb3J0Q2hhbmdlZChTb3J0QWxnb3JpdGhtLkFscGhhYmV0aWMpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja2VkPXtpc0FscGhhYmV0aWNhbH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZT17YG14XyR7dGhpcy5wcm9wcy50YWdJZH1fc29ydEJ5YH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJBLVpcIikgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvU3R5bGVkTWVudUl0ZW1SYWRpbz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBvdGhlclNlY3Rpb25zIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9Db250ZXh0TWVudT5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgICAgIDxDb250ZXh0TWVudVRvb2x0aXBCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUm9vbVN1Ymxpc3RfbWVudUJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25PcGVuTWVudUNsaWNrfVxuICAgICAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJMaXN0IG9wdGlvbnNcIil9XG4gICAgICAgICAgICAgICAgICAgIGlzRXhwYW5kZWQ9eyEhdGhpcy5zdGF0ZS5jb250ZXh0TWVudVBvc2l0aW9ufVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgeyBjb250ZXh0TWVudSB9XG4gICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVySGVhZGVyKCk6IFJlYWN0LlJlYWN0RWxlbWVudCB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Um92aW5nVGFiSW5kZXhXcmFwcGVyIGlucHV0UmVmPXt0aGlzLmhlYWRlckJ1dHRvbn0+XG4gICAgICAgICAgICAgICAgeyAoeyBvbkZvY3VzLCBpc0FjdGl2ZSwgcmVmIH0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdGFiSW5kZXggPSBpc0FjdGl2ZSA/IDAgOiAtMTtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgYXJpYUxhYmVsID0gX3QoXCJKdW1wIHRvIGZpcnN0IHVucmVhZCByb29tLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMudGFnSWQgPT09IERlZmF1bHRUYWdJRC5JbnZpdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyaWFMYWJlbCA9IF90KFwiSnVtcCB0byBmaXJzdCBpbnZpdGUuXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYmFkZ2UgPSAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8Tm90aWZpY2F0aW9uQmFkZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3JjZUNvdW50PXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbj17dGhpcy5ub3RpZmljYXRpb25TdGF0ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQmFkZ2VDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWJJbmRleD17dGFiSW5kZXh9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17YXJpYUxhYmVsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dVbnNlbnRUb29sdGlwPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgICAgICAgICBsZXQgYWRkUm9vbUJ1dHRvbiA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLkF1eEJ1dHRvbkNvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgQXV4QnV0dG9uQ29tcG9uZW50ID0gdGhpcy5wcm9wcy5BdXhCdXR0b25Db21wb25lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRSb29tQnV0dG9uID0gPEF1eEJ1dHRvbkNvbXBvbmVudCB0YWJJbmRleD17dGFiSW5kZXh9IC8+O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sbGFwc2VDbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAnbXhfUm9vbVN1Ymxpc3RfY29sbGFwc2VCdG4nOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ214X1Jvb21TdWJsaXN0X2NvbGxhcHNlQnRuX2NvbGxhcHNlZCc6ICF0aGlzLnN0YXRlLmlzRXhwYW5kZWQgJiYgIXRoaXMucHJvcHMuZm9yY2VFeHBhbmRlZCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ214X1Jvb21TdWJsaXN0X2hlYWRlckNvbnRhaW5lcic6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAnbXhfUm9vbVN1Ymxpc3RfaGVhZGVyQ29udGFpbmVyX3dpdGhBdXgnOiAhIWFkZFJvb21CdXR0b24sXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJhZGdlQ29udGFpbmVyID0gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tU3VibGlzdF9iYWRnZUNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgYmFkZ2UgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICAgICAgbGV0IEJ1dHRvbjogUmVhY3QuQ29tcG9uZW50VHlwZTxSZWFjdC5Db21wb25lbnRQcm9wczx0eXBlb2YgQWNjZXNzaWJsZUJ1dHRvbj4+ID0gQWNjZXNzaWJsZUJ1dHRvbjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuaXNNaW5pbWl6ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIEJ1dHRvbiA9IEFjY2Vzc2libGVUb29sdGlwQnV0dG9uO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gTm90ZTogdGhlIGFkZFJvb21CdXR0b24gY29uZGl0aW9uYWxseSBnZXRzIG1vdmVkIGFyb3VuZFxuICAgICAgICAgICAgICAgICAgICAvLyB0aGUgRE9NIGRlcGVuZGluZyBvbiB3aGV0aGVyIG9yIG5vdCB0aGUgbGlzdCBpcyBtaW5pbWl6ZWQuXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHdlJ3JlIG1pbmltaXplZCwgd2Ugd2FudCBpdCBiZWxvdyB0aGUgaGVhZGVyIHNvIGl0XG4gICAgICAgICAgICAgICAgICAgIC8vIGRvZXNuJ3QgYmVjb21lIHN0aWNreS5cbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIHNhbWUgYXBwbGllcyB0byB0aGUgbm90aWZpY2F0aW9uIGJhZGdlLlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3Nlc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbktleURvd249e3RoaXMub25IZWFkZXJLZXlEb3dufVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uRm9jdXM9e29uRm9jdXN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17dGhpcy5wcm9wcy5sYWJlbH1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21TdWJsaXN0X3N0aWNrYWJsZUNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21TdWJsaXN0X3N0aWNrYWJsZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uRm9jdXM9e29uRm9jdXN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXRSZWY9e3JlZn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWJJbmRleD17dGFiSW5kZXh9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUm9vbVN1Ymxpc3RfaGVhZGVyVGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9sZT1cInRyZWVpdGVtXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWV4cGFuZGVkPXt0aGlzLnN0YXRlLmlzRXhwYW5kZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1sZXZlbD17MX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uSGVhZGVyQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25Db250ZXh0TWVudT17dGhpcy5vbkNvbnRleHRNZW51fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXt0aGlzLnByb3BzLmlzTWluaW1pemVkID8gdGhpcy5wcm9wcy5sYWJlbCA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2NvbGxhcHNlQ2xhc3Nlc30gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57IHRoaXMucHJvcHMubGFiZWwgfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnJlbmRlck1lbnUoKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHRoaXMucHJvcHMuaXNNaW5pbWl6ZWQgPyBudWxsIDogYmFkZ2VDb250YWluZXIgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLmlzTWluaW1pemVkID8gbnVsbCA6IGFkZFJvb21CdXR0b24gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHRoaXMucHJvcHMuaXNNaW5pbWl6ZWQgPyBiYWRnZUNvbnRhaW5lciA6IG51bGwgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy5pc01pbmltaXplZCA/IGFkZFJvb21CdXR0b24gOiBudWxsIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gfVxuICAgICAgICAgICAgPC9Sb3ZpbmdUYWJJbmRleFdyYXBwZXI+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblNjcm9sbFByZXZlbnQoZTogRXZlbnQpIHtcbiAgICAgICAgLy8gdGhlIFJvb21UaWxlIGNhbGxzIHNjcm9sbEludG9WaWV3IGFuZCB0aGUgYnJvd3NlciBtYXkgc2Nyb2xsIGEgZGl2IHdlIGRvIG5vdCB3aXNoIHRvIGJlIHNjcm9sbGFibGVcbiAgICAgICAgLy8gdGhpcyBmaXhlcyBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDQxM1xuICAgICAgICAoZS50YXJnZXQgYXMgSFRNTERpdkVsZW1lbnQpLnNjcm9sbFRvcCA9IDA7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlcigpOiBSZWFjdC5SZWFjdEVsZW1lbnQge1xuICAgICAgICBjb25zdCB2aXNpYmxlVGlsZXMgPSB0aGlzLnJlbmRlclZpc2libGVUaWxlcygpO1xuICAgICAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICAnbXhfUm9vbVN1Ymxpc3QnOiB0cnVlLFxuICAgICAgICAgICAgJ214X1Jvb21TdWJsaXN0X2hhc01lbnVPcGVuJzogISF0aGlzLnN0YXRlLmNvbnRleHRNZW51UG9zaXRpb24sXG4gICAgICAgICAgICAnbXhfUm9vbVN1Ymxpc3RfbWluaW1pemVkJzogdGhpcy5wcm9wcy5pc01pbmltaXplZCxcbiAgICAgICAgICAgICdteF9Sb29tU3VibGlzdF9oaWRkZW4nOiAoXG4gICAgICAgICAgICAgICAgIXRoaXMuc3RhdGUucm9vbXMubGVuZ3RoICYmICF0aGlzLnByb3BzLmV4dHJhVGlsZXM/Lmxlbmd0aCAmJiB0aGlzLnByb3BzLmFsd2F5c1Zpc2libGUgIT09IHRydWVcbiAgICAgICAgICAgICksXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBjb250ZW50ID0gbnVsbDtcbiAgICAgICAgaWYgKHZpc2libGVUaWxlcy5sZW5ndGggPiAwICYmIHRoaXMucHJvcHMuZm9yY2VFeHBhbmRlZCkge1xuICAgICAgICAgICAgY29udGVudCA9IDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbVN1Ymxpc3RfcmVzaXplQm94IG14X1Jvb21TdWJsaXN0X3Jlc2l6ZUJveF9mb3JjZUV4cGFuZGVkXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tU3VibGlzdF90aWxlc1wiIHJlZj17dGhpcy50aWxlc1JlZn0+XG4gICAgICAgICAgICAgICAgICAgIHsgdmlzaWJsZVRpbGVzIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfSBlbHNlIGlmICh2aXNpYmxlVGlsZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgbGF5b3V0ID0gdGhpcy5sYXlvdXQ7IC8vIHRvIHNob3J0ZW4gY2FsbHNcblxuICAgICAgICAgICAgY29uc3QgbWluVGlsZXMgPSBNYXRoLm1pbihsYXlvdXQubWluVmlzaWJsZVRpbGVzLCB0aGlzLm51bVRpbGVzKTtcbiAgICAgICAgICAgIGNvbnN0IHNob3dNb3JlQXRNaW5IZWlnaHQgPSBtaW5UaWxlcyA8IHRoaXMubnVtVGlsZXM7XG4gICAgICAgICAgICBjb25zdCBtaW5IZWlnaHRQYWRkaW5nID0gUkVTSVpFX0hBTkRMRV9IRUlHSFQgKyAoc2hvd01vcmVBdE1pbkhlaWdodCA/IFNIT1dfTl9CVVRUT05fSEVJR0hUIDogMCk7XG4gICAgICAgICAgICBjb25zdCBtaW5UaWxlc1B4ID0gbGF5b3V0LnRpbGVzVG9QaXhlbHNXaXRoUGFkZGluZyhtaW5UaWxlcywgbWluSGVpZ2h0UGFkZGluZyk7XG4gICAgICAgICAgICBjb25zdCBtYXhUaWxlc1B4ID0gbGF5b3V0LnRpbGVzVG9QaXhlbHNXaXRoUGFkZGluZyh0aGlzLm51bVRpbGVzLCB0aGlzLnBhZGRpbmcpO1xuICAgICAgICAgICAgY29uc3Qgc2hvd01vcmVCdG5DbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICAgICAgJ214X1Jvb21TdWJsaXN0X3Nob3dOQnV0dG9uJzogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBJZiB3ZSdyZSBoaWRpbmcgcm9vbXMsIHNob3cgYSAnc2hvdyBtb3JlJyBidXR0b24gdG8gdGhlIHVzZXIuIFRoaXMgYnV0dG9uXG4gICAgICAgICAgICAvLyBmbG9hdHMgYWJvdmUgdGhlIHJlc2l6ZSBoYW5kbGUsIGlmIHdlIGhhdmUgb25lIHByZXNlbnQuIElmIHRoZSB1c2VyIGhhcyBhbGxcbiAgICAgICAgICAgIC8vIHRpbGVzIHZpc2libGUsIGl0IGJlY29tZXMgJ3Nob3cgbGVzcycuXG4gICAgICAgICAgICBsZXQgc2hvd05CdXR0b24gPSBudWxsO1xuXG4gICAgICAgICAgICBpZiAobWF4VGlsZXNQeCA+IHRoaXMuc3RhdGUuaGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgLy8gdGhlIGhlaWdodCBvZiBhbGwgdGhlIHRpbGVzIGlzIGdyZWF0ZXIgdGhhbiB0aGUgc2VjdGlvbiBoZWlnaHQ6IHdlIG5lZWQgYSAnc2hvdyBtb3JlJyBidXR0b25cbiAgICAgICAgICAgICAgICBjb25zdCBub25QYWRkZWRIZWlnaHQgPSB0aGlzLnN0YXRlLmhlaWdodCAtIFJFU0laRV9IQU5ETEVfSEVJR0hUIC0gU0hPV19OX0JVVFRPTl9IRUlHSFQ7XG4gICAgICAgICAgICAgICAgY29uc3QgYW1vdW50RnVsbHlTaG93biA9IE1hdGguZmxvb3Iobm9uUGFkZGVkSGVpZ2h0IC8gdGhpcy5sYXlvdXQudGlsZUhlaWdodCk7XG4gICAgICAgICAgICAgICAgY29uc3QgbnVtTWlzc2luZyA9IHRoaXMubnVtVGlsZXMgLSBhbW91bnRGdWxseVNob3duO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxhYmVsID0gX3QoXCJTaG93ICUoY291bnQpcyBtb3JlXCIsIHsgY291bnQ6IG51bU1pc3NpbmcgfSk7XG4gICAgICAgICAgICAgICAgbGV0IHNob3dNb3JlVGV4dCA9IChcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSdteF9Sb29tU3VibGlzdF9zaG93TkJ1dHRvblRleHQnPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBsYWJlbCB9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmlzTWluaW1pemVkKSBzaG93TW9yZVRleHQgPSBudWxsO1xuICAgICAgICAgICAgICAgIHNob3dOQnV0dG9uID0gKFxuICAgICAgICAgICAgICAgICAgICA8Um92aW5nQWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgcm9sZT1cInRyZWVpdGVtXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25TaG93QWxsQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3Nob3dNb3JlQnRuQ2xhc3Nlc31cbiAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e2xhYmVsfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X1Jvb21TdWJsaXN0X3Nob3dNb3JlQnV0dG9uQ2hldnJvbiBteF9Sb29tU3VibGlzdF9zaG93TkJ1dHRvbkNoZXZyb24nPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgLyogc2V0IGJ5IENTUyBtYXNraW5nICovIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc2hvd01vcmVUZXh0IH1cbiAgICAgICAgICAgICAgICAgICAgPC9Sb3ZpbmdBY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMubnVtVGlsZXMgPiB0aGlzLmxheW91dC5kZWZhdWx0VmlzaWJsZVRpbGVzKSB7XG4gICAgICAgICAgICAgICAgLy8gd2UgaGF2ZSBhbGwgdGlsZXMgdmlzaWJsZSAtIGFkZCBhIGJ1dHRvbiB0byBzaG93IGxlc3NcbiAgICAgICAgICAgICAgICBjb25zdCBsYWJlbCA9IF90KFwiU2hvdyBsZXNzXCIpO1xuICAgICAgICAgICAgICAgIGxldCBzaG93TGVzc1RleHQgPSAoXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nbXhfUm9vbVN1Ymxpc3Rfc2hvd05CdXR0b25UZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgbGFiZWwgfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5pc01pbmltaXplZCkgc2hvd0xlc3NUZXh0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICBzaG93TkJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICAgICAgPFJvdmluZ0FjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIHJvbGU9XCJ0cmVlaXRlbVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uU2hvd0xlc3NDbGlja31cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17c2hvd01vcmVCdG5DbGFzc2VzfVxuICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17bGFiZWx9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nbXhfUm9vbVN1Ymxpc3Rfc2hvd0xlc3NCdXR0b25DaGV2cm9uIG14X1Jvb21TdWJsaXN0X3Nob3dOQnV0dG9uQ2hldnJvbic+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyAvKiBzZXQgYnkgQ1NTIG1hc2tpbmcgKi8gfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzaG93TGVzc1RleHQgfVxuICAgICAgICAgICAgICAgICAgICA8L1JvdmluZ0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRmlndXJlIG91dCBpZiB3ZSBuZWVkIGEgaGFuZGxlXG4gICAgICAgICAgICBjb25zdCBoYW5kbGVzOiBFbmFibGUgPSB7XG4gICAgICAgICAgICAgICAgYm90dG9tOiB0cnVlLCAvLyB0aGUgb25seSBvbmUgd2UgbmVlZCwgYnV0IHRoZSBvdGhlcnMgbXVzdCBiZSBleHBsaWNpdGx5IGZhbHNlXG4gICAgICAgICAgICAgICAgYm90dG9tTGVmdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgYm90dG9tUmlnaHQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGxlZnQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHJpZ2h0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICB0b3A6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHRvcExlZnQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHRvcFJpZ2h0OiBmYWxzZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAobGF5b3V0LnZpc2libGVUaWxlcyA+PSB0aGlzLm51bVRpbGVzICYmIHRoaXMubnVtVGlsZXMgPD0gbGF5b3V0Lm1pblZpc2libGVUaWxlcykge1xuICAgICAgICAgICAgICAgIC8vIHdlJ3JlIGF0IGEgbWluaW11bSwgZG9uJ3QgaGF2ZSBhIGJvdHRvbSBoYW5kbGVcbiAgICAgICAgICAgICAgICBoYW5kbGVzLmJvdHRvbSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBXZSBoYXZlIHRvIGFjY291bnQgZm9yIHBhZGRpbmcgc28gd2UgY2FuIGFjY29tbW9kYXRlIGEgJ3Nob3cgbW9yZScgYnV0dG9uIGFuZFxuICAgICAgICAgICAgLy8gdGhlIHJlc2l6ZSBoYW5kbGUsIHdoaWNoIGFyZSBwaW5uZWQgdG8gdGhlIGJvdHRvbSBvZiB0aGUgY29udGFpbmVyLiBUaGlzIGlzIHRoZVxuICAgICAgICAgICAgLy8gZWFzaWVzdCB3YXkgdG8gaGF2ZSBhIHJlc2l6ZSBoYW5kbGUgYmVsb3cgdGhlIGJ1dHRvbiBhcyBvdGhlcndpc2Ugd2UncmUgd3JpdGluZ1xuICAgICAgICAgICAgLy8gb3VyIG93biByZXNpemUgaGFuZGxpbmcgYW5kIHRoYXQgZG9lc24ndCBzb3VuZCBmdW4uXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gVGhlIGxheW91dCBjbGFzcyBoYXMgc29tZSBoZWxwZXJzIGZvciBkZWFsaW5nIHdpdGggcGFkZGluZywgYXMgd2UgZG9uJ3Qgd2FudCB0b1xuICAgICAgICAgICAgLy8gYXBwbHkgaXQgaW4gYWxsIGNhc2VzLiBJZiB3ZSBhcHBseSBpdCBpbiBhbGwgY2FzZXMsIHRoZSByZXNpemluZyBmZWVscyBsaWtlIGl0XG4gICAgICAgICAgICAvLyBnb2VzIGJhY2t3YXJkcyBhbmQgY2FuIGJlY29tZSB3aWxkbHkgaW5jb3JyZWN0ICh2aXNpYmxlVGlsZXMgc2F5cyAxOCB3aGVuIHRoZXJlJ3NcbiAgICAgICAgICAgIC8vIG9ubHkgbWF0aGVtYXRpY2FsbHkgNyBwb3NzaWJsZSkuXG5cbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZVdyYXBwZXJDbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICAgICAgJ214X1Jvb21TdWJsaXN0X3Jlc2l6ZXJIYW5kbGVzJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAnbXhfUm9vbVN1Ymxpc3RfcmVzaXplckhhbmRsZXNfc2hvd05CdXR0b24nOiAhIXNob3dOQnV0dG9uLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNvbnRlbnQgPSAoXG4gICAgICAgICAgICAgICAgPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgICAgICAgICA8UmVzaXphYmxlXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplPXt7IGhlaWdodDogdGhpcy5zdGF0ZS5oZWlnaHQgfSBhcyBhbnl9XG4gICAgICAgICAgICAgICAgICAgICAgICBtaW5IZWlnaHQ9e21pblRpbGVzUHh9XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhIZWlnaHQ9e21heFRpbGVzUHh9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblJlc2l6ZVN0YXJ0PXt0aGlzLm9uUmVzaXplU3RhcnR9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblJlc2l6ZVN0b3A9e3RoaXMub25SZXNpemVTdG9wfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25SZXNpemU9e3RoaXMub25SZXNpemV9XG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVXcmFwcGVyQ2xhc3M9e2hhbmRsZVdyYXBwZXJDbGFzc2VzfVxuICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlQ2xhc3Nlcz17eyBib3R0b206IFwibXhfUm9vbVN1Ymxpc3RfcmVzaXplckhhbmRsZVwiIH19XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tU3VibGlzdF9yZXNpemVCb3hcIlxuICAgICAgICAgICAgICAgICAgICAgICAgZW5hYmxlPXtoYW5kbGVzfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21TdWJsaXN0X3RpbGVzXCIgcmVmPXt0aGlzLnRpbGVzUmVmfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHZpc2libGVUaWxlcyB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc2hvd05CdXR0b24gfVxuICAgICAgICAgICAgICAgICAgICA8L1Jlc2l6YWJsZT5cbiAgICAgICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnNob3dTa2VsZXRvbiAmJiB0aGlzLnN0YXRlLmlzRXhwYW5kZWQpIHtcbiAgICAgICAgICAgIGNvbnRlbnQgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21TdWJsaXN0X3NrZWxldG9uVUlcIiAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgcmVmPXt0aGlzLnN1Ymxpc3RSZWZ9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc2VzfVxuICAgICAgICAgICAgICAgIHJvbGU9XCJncm91cFwiXG4gICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17dGhpcy5wcm9wcy5sYWJlbH1cbiAgICAgICAgICAgICAgICBvbktleURvd249e3RoaXMub25LZXlEb3dufVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgdGhpcy5yZW5kZXJIZWFkZXIoKSB9XG4gICAgICAgICAgICAgICAgeyBjb250ZW50IH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFrQkE7O0FBR0E7O0FBRUE7O0FBR0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBR0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBTUE7O0FBQ0E7O0FBRUE7O0FBQ0E7Ozs7OztBQXZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBeUNBLE1BQU1BLG9CQUFvQixHQUFHLEVBQTdCLEMsQ0FBaUM7O0FBQ2pDLE1BQU1DLG9CQUFvQixHQUFHLENBQTdCLEMsQ0FBZ0M7O0FBQ3pCLE1BQU1DLGFBQWEsR0FBRyxFQUF0QixDLENBQTBCOzs7QUFFakMsTUFBTUMsa0JBQWtCLEdB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