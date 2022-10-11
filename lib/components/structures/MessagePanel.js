"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.shouldFormContinuation = shouldFormContinuation;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _classnames = _interopRequireDefault(require("classnames"));

var _event = require("matrix-js-sdk/src/@types/event");

var _logger = require("matrix-js-sdk/src/logger");

var _roomState = require("matrix-js-sdk/src/models/room-state");

var _beacon = require("matrix-js-sdk/src/@types/beacon");

var _utils = require("matrix-js-sdk/src/utils");

var _shouldHideEvent = _interopRequireDefault(require("../../shouldHideEvent"));

var _DateUtils = require("../../DateUtils");

var _MatrixClientPeg = require("../../MatrixClientPeg");

var _SettingsStore = _interopRequireDefault(require("../../settings/SettingsStore"));

var _RoomContext = _interopRequireWildcard(require("../../contexts/RoomContext"));

var _Layout = require("../../settings/enums/Layout");

var _languageHandler = require("../../languageHandler");

var _EventTile = _interopRequireDefault(require("../views/rooms/EventTile"));

var _TextForEvent = require("../../TextForEvent");

var _IRCTimelineProfileResizer = _interopRequireDefault(require("../views/elements/IRCTimelineProfileResizer"));

var _DMRoomMap = _interopRequireDefault(require("../../utils/DMRoomMap"));

var _NewRoomIntro = _interopRequireDefault(require("../views/rooms/NewRoomIntro"));

var _HistoryTile = _interopRequireDefault(require("../views/rooms/HistoryTile"));

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _WhoIsTypingTile = _interopRequireDefault(require("../views/rooms/WhoIsTypingTile"));

var _ScrollPanel = _interopRequireDefault(require("./ScrollPanel"));

var _GenericEventListSummary = _interopRequireDefault(require("../views/elements/GenericEventListSummary"));

var _EventListSummary = _interopRequireDefault(require("../views/elements/EventListSummary"));

var _DateSeparator = _interopRequireDefault(require("../views/messages/DateSeparator"));

var _ErrorBoundary = _interopRequireDefault(require("../views/elements/ErrorBoundary"));

var _Spinner = _interopRequireDefault(require("../views/elements/Spinner"));

var _actions = require("../../dispatcher/actions");

var _EventRenderingUtils = require("../../utils/EventRenderingUtils");

var _EventTileFactory = require("../../events/EventTileFactory");

var _Editing = require("../../Editing");

var _EventUtils = require("../../utils/EventUtils");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2016 - 2022 The Matrix.org Foundation C.I.C.

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
const CONTINUATION_MAX_INTERVAL = 5 * 60 * 1000; // 5 minutes

const continuedTypes = [_event.EventType.Sticker, _event.EventType.RoomMessage];
const groupedStateEvents = [_event.EventType.RoomMember, _event.EventType.RoomThirdPartyInvite, _event.EventType.RoomServerAcl, _event.EventType.RoomPinnedEvents]; // check if there is a previous event and it has the same sender as this event
// and the types are the same/is in continuedTypes and the time between them is <= CONTINUATION_MAX_INTERVAL

function shouldFormContinuation(prevEvent, mxEvent, showHiddenEvents, threadsEnabled, timelineRenderingType) {
  if (timelineRenderingType === _RoomContext.TimelineRenderingType.ThreadsList) return false; // sanity check inputs

  if (!prevEvent?.sender || !mxEvent.sender) return false; // check if within the max continuation period

  if (mxEvent.getTs() - prevEvent.getTs() > CONTINUATION_MAX_INTERVAL) return false; // As we summarise redactions, do not continue a redacted event onto a non-redacted one and vice-versa

  if (mxEvent.isRedacted() !== prevEvent.isRedacted()) return false; // Some events should appear as continuations from previous events of different types.

  if (mxEvent.getType() !== prevEvent.getType() && (!continuedTypes.includes(mxEvent.getType()) || !continuedTypes.includes(prevEvent.getType()))) return false; // Check if the sender is the same and hasn't changed their displayname/avatar between these events

  if (mxEvent.sender.userId !== prevEvent.sender.userId || mxEvent.sender.name !== prevEvent.sender.name || mxEvent.sender.getMxcAvatarUrl() !== prevEvent.sender.getMxcAvatarUrl()) return false; // Thread summaries in the main timeline should break up a continuation on both sides

  if (threadsEnabled && ((0, _EventUtils.hasThreadSummary)(mxEvent) || (0, _EventUtils.hasThreadSummary)(prevEvent)) && timelineRenderingType !== _RoomContext.TimelineRenderingType.Thread) {
    return false;
  } // if we don't have tile for previous event then it was shown by showHiddenEvents and has no SenderProfile


  if (!(0, _EventTileFactory.haveRendererForEvent)(prevEvent, showHiddenEvents)) return false;
  return true;
}

/* (almost) stateless UI component which builds the event tiles in the room timeline.
 */
class MessagePanel extends _react.default.Component {
  // opaque readreceipt info for each userId; used by ReadReceiptMarker
  // to manage its animations
  // Track read receipts by event ID. For each _shown_ event ID, we store
  // the list of read receipts to display:
  //   [
  //       {
  //           userId: string,
  //           member: RoomMember,
  //           ts: number,
  //       },
  //   ]
  // This is recomputed on each render. It's only stored on the component
  // for ease of passing the data around since it's computed in one pass
  // over all events.
  // Track read receipts by user ID. For each user ID we've ever shown a
  // a read receipt for, we store an object:
  //   {
  //       lastShownEventId: string,
  //       receipt: {
  //           userId: string,
  //           member: RoomMember,
  //           ts: number,
  //       },
  //   }
  // so that we can always keep receipts displayed by reverting back to
  // the last shown event for that user ID when needed. This may feel like
  // it duplicates the receipt storage in the room, but at this layer, we
  // are tracking _shown_ event IDs, which the JS SDK knows nothing about.
  // This is recomputed on each render, using the data from the previous
  // render as our fallback for any user IDs we can't match a receipt to a
  // displayed event in the current render cycle.
  // A map to allow groupers to maintain consistent keys even if their first event is uprooted due to back-pagination.
  constructor(props, context) {
    super(props, context);
    (0, _defineProperty2.default)(this, "context", void 0);
    (0, _defineProperty2.default)(this, "readReceiptMap", {});
    (0, _defineProperty2.default)(this, "readReceiptsByEvent", {});
    (0, _defineProperty2.default)(this, "readReceiptsByUserId", {});
    (0, _defineProperty2.default)(this, "_showHiddenEvents", void 0);
    (0, _defineProperty2.default)(this, "threadsEnabled", void 0);
    (0, _defineProperty2.default)(this, "isMounted", false);
    (0, _defineProperty2.default)(this, "readMarkerNode", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "whoIsTyping", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "scrollPanel", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "showTypingNotificationsWatcherRef", void 0);
    (0, _defineProperty2.default)(this, "eventTiles", {});
    (0, _defineProperty2.default)(this, "grouperKeyMap", new WeakMap());
    (0, _defineProperty2.default)(this, "calculateRoomMembersCount", () => {
      this.setState({
        hideSender: this.shouldHideSender()
      });
    });
    (0, _defineProperty2.default)(this, "onShowTypingNotificationsChange", () => {
      this.setState({
        showTypingNotifications: _SettingsStore.default.getValue("showTypingNotifications")
      });
    });
    (0, _defineProperty2.default)(this, "isUnmounting", () => {
      return !this.isMounted;
    });
    (0, _defineProperty2.default)(this, "collectGhostReadMarker", node => {
      if (node) {
        // now the element has appeared, change the style which will trigger the CSS transition
        requestAnimationFrame(() => {
          node.style.width = '10%';
          node.style.opacity = '0';
        });
      }
    });
    (0, _defineProperty2.default)(this, "onGhostTransitionEnd", ev => {
      // we can now clean up the ghost element
      const finishedEventId = ev.target.dataset.eventid;
      this.setState({
        ghostReadMarkers: this.state.ghostReadMarkers.filter(eid => eid !== finishedEventId)
      });
    });
    (0, _defineProperty2.default)(this, "collectEventTile", (eventId, node) => {
      this.eventTiles[eventId] = node;
    });
    (0, _defineProperty2.default)(this, "onHeightChanged", () => {
      const scrollPanel = this.scrollPanel.current;

      if (scrollPanel) {
        scrollPanel.checkScroll();
      }
    });
    (0, _defineProperty2.default)(this, "onTypingShown", () => {
      const scrollPanel = this.scrollPanel.current; // this will make the timeline grow, so checkScroll

      scrollPanel.checkScroll();

      if (scrollPanel && scrollPanel.getScrollState().stuckAtBottom) {
        scrollPanel.preventShrinking();
      }
    });
    (0, _defineProperty2.default)(this, "onTypingHidden", () => {
      const scrollPanel = this.scrollPanel.current;

      if (scrollPanel) {
        // as hiding the typing notifications doesn't
        // update the scrollPanel, we tell it to apply
        // the shrinking prevention once the typing notifs are hidden
        scrollPanel.updatePreventShrinking(); // order is important here as checkScroll will scroll down to
        // reveal added padding to balance the notifs disappearing.

        scrollPanel.checkScroll();
      }
    });
    this.state = {
      // previous positions the read marker has been in, so we can
      // display 'ghost' read markers that are animating away
      ghostReadMarkers: [],
      showTypingNotifications: _SettingsStore.default.getValue("showTypingNotifications"),
      hideSender: this.shouldHideSender()
    }; // Cache these settings on mount since Settings is expensive to query,
    // and we check this in a hot code path. This is also cached in our
    // RoomContext, however we still need a fallback for roomless MessagePanels.

    this._showHiddenEvents = _SettingsStore.default.getValue("showHiddenEventsInTimeline");
    this.threadsEnabled = _SettingsStore.default.getValue("feature_thread");
    this.showTypingNotificationsWatcherRef = _SettingsStore.default.watchSetting("showTypingNotifications", null, this.onShowTypingNotificationsChange);
  }

  componentDidMount() {
    this.calculateRoomMembersCount();
    this.props.room?.currentState.on(_roomState.RoomStateEvent.Update, this.calculateRoomMembersCount);
    this.isMounted = true;
  }

  componentWillUnmount() {
    this.isMounted = false;
    this.props.room?.currentState.off(_roomState.RoomStateEvent.Update, this.calculateRoomMembersCount);

    _SettingsStore.default.unwatchSetting(this.showTypingNotificationsWatcherRef);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.layout !== this.props.layout) {
      this.calculateRoomMembersCount();
    }

    if (prevProps.readMarkerVisible && this.props.readMarkerEventId !== prevProps.readMarkerEventId) {
      const ghostReadMarkers = this.state.ghostReadMarkers;
      ghostReadMarkers.push(prevProps.readMarkerEventId);
      this.setState({
        ghostReadMarkers
      });
    }

    const pendingEditItem = this.pendingEditItem;

    if (!this.props.editState && this.props.room && pendingEditItem) {
      const event = this.props.room.findEventById(pendingEditItem);

      _dispatcher.default.dispatch({
        action: _actions.Action.EditEvent,
        event: !event?.isRedacted() ? event : null,
        timelineRenderingType: this.context.timelineRenderingType
      });
    }
  }

  shouldHideSender() {
    return this.props.room?.getInvitedAndJoinedMemberCount() <= 2 && this.props.layout === _Layout.Layout.Bubble;
  }

  /* get the DOM node representing the given event */
  getNodeForEventId(eventId) {
    if (!this.eventTiles) {
      return undefined;
    }

    return this.eventTiles[eventId]?.ref?.current;
  }

  getTileForEventId(eventId) {
    if (!this.eventTiles) {
      return undefined;
    }

    return this.eventTiles[eventId];
  }
  /* return true if the content is fully scrolled down right now; else false.
   */


  isAtBottom() {
    return this.scrollPanel.current?.isAtBottom();
  }
  /* get the current scroll state. See ScrollPanel.getScrollState for
   * details.
   *
   * returns null if we are not mounted.
   */


  getScrollState() {
    return this.scrollPanel.current?.getScrollState() ?? null;
  } // returns one of:
  //
  //  null: there is no read marker
  //  -1: read marker is above the window
  //   0: read marker is within the window
  //  +1: read marker is below the window


  getReadMarkerPosition() {
    const readMarker = this.readMarkerNode.current;
    const messageWrapper = this.scrollPanel.current;

    if (!readMarker || !messageWrapper) {
      return null;
    }

    const wrapperRect = _reactDom.default.findDOMNode(messageWrapper).getBoundingClientRect();

    const readMarkerRect = readMarker.getBoundingClientRect(); // the read-marker pretends to have zero height when it is actually
    // two pixels high; +2 here to account for that.

    if (readMarkerRect.bottom + 2 < wrapperRect.top) {
      return -1;
    } else if (readMarkerRect.top < wrapperRect.bottom) {
      return 0;
    } else {
      return 1;
    }
  }
  /* jump to the top of the content.
   */


  scrollToTop() {
    if (this.scrollPanel.current) {
      this.scrollPanel.current.scrollToTop();
    }
  }
  /* jump to the bottom of the content.
   */


  scrollToBottom() {
    if (this.scrollPanel.current) {
      this.scrollPanel.current.scrollToBottom();
    }
  }
  /**
   * Page up/down.
   *
   * @param {number} mult: -1 to page up, +1 to page down
   */


  scrollRelative(mult) {
    if (this.scrollPanel.current) {
      this.scrollPanel.current.scrollRelative(mult);
    }
  }
  /**
   * Scroll up/down in response to a scroll key
   *
   * @param {KeyboardEvent} ev: the keyboard event to handle
   */


  handleScrollKey(ev) {
    if (this.scrollPanel.current) {
      this.scrollPanel.current.handleScrollKey(ev);
    }
  }
  /* jump to the given event id.
   *
   * offsetBase gives the reference point for the pixelOffset. 0 means the
   * top of the container, 1 means the bottom, and fractional values mean
   * somewhere in the middle. If omitted, it defaults to 0.
   *
   * pixelOffset gives the number of pixels *above* the offsetBase that the
   * node (specifically, the bottom of it) will be positioned. If omitted, it
   * defaults to 0.
   */


  scrollToEvent(eventId, pixelOffset, offsetBase) {
    if (this.scrollPanel.current) {
      this.scrollPanel.current.scrollToToken(eventId, pixelOffset, offsetBase);
    }
  }

  scrollToEventIfNeeded(eventId) {
    const node = this.getNodeForEventId(eventId);

    if (node) {
      node.scrollIntoView({
        block: "nearest",
        behavior: "instant"
      });
    }
  }

  get showHiddenEvents() {
    return this.context?.showHiddenEvents ?? this._showHiddenEvents;
  } // TODO: Implement granular (per-room) hide options


  shouldShowEvent(mxEv) {
    let forceHideEvents = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (this.props.hideThreadedMessages && this.threadsEnabled && this.props.room) {
      const {
        shouldLiveInRoom
      } = this.props.room.eventShouldLiveIn(mxEv, this.props.events);

      if (!shouldLiveInRoom) {
        return false;
      }
    }

    if (_MatrixClientPeg.MatrixClientPeg.get().isUserIgnored(mxEv.getSender())) {
      return false; // ignored = no show (only happens if the ignore happens after an event was received)
    }

    if (this.showHiddenEvents && !forceHideEvents) {
      return true;
    }

    if (!(0, _EventTileFactory.haveRendererForEvent)(mxEv, this.showHiddenEvents)) {
      return false; // no tile = no show
    } // Always show highlighted event


    if (this.props.highlightedEventId === mxEv.getId()) return true;
    return !(0, _shouldHideEvent.default)(mxEv, this.context);
  }

  readMarkerForEvent(eventId, isLastEvent) {
    const visible = !isLastEvent && this.props.readMarkerVisible;

    if (this.props.readMarkerEventId === eventId) {
      let hr; // if the read marker comes at the end of the timeline (except
      // for local echoes, which are excluded from RMs, because they
      // don't have useful event ids), we don't want to show it, but
      // we still want to create the <li/> for it so that the
      // algorithms which depend on its position on the screen aren't
      // confused.

      if (visible) {
        hr = /*#__PURE__*/_react.default.createElement("hr", {
          className: "mx_RoomView_myReadMarker",
          style: {
            opacity: 1,
            width: '99%'
          }
        });
      }

      return /*#__PURE__*/_react.default.createElement("li", {
        key: "readMarker_" + eventId,
        ref: this.readMarkerNode,
        className: "mx_RoomView_myReadMarker_container",
        "data-scroll-tokens": eventId
      }, hr);
    } else if (this.state.ghostReadMarkers.includes(eventId)) {
      // We render 'ghost' read markers in the DOM while they
      // transition away. This allows the actual read marker
      // to be in the right place straight away without having
      // to wait for the transition to finish.
      // There are probably much simpler ways to do this transition,
      // possibly using react-transition-group which handles keeping
      // elements in the DOM whilst they transition out, although our
      // case is a little more complex because only some of the items
      // transition (ie. the read markers do but the event tiles do not)
      // and TransitionGroup requires that all its children are Transitions.
      const hr = /*#__PURE__*/_react.default.createElement("hr", {
        className: "mx_RoomView_myReadMarker",
        ref: this.collectGhostReadMarker,
        onTransitionEnd: this.onGhostTransitionEnd,
        "data-eventid": eventId
      }); // give it a key which depends on the event id. That will ensure that
      // we get a new DOM node (restarting the animation) when the ghost
      // moves to a different event.


      return /*#__PURE__*/_react.default.createElement("li", {
        key: "_readuptoghost_" + eventId,
        className: "mx_RoomView_myReadMarker_container"
      }, hr);
    }

    return null;
  }

  getNextEventInfo(arr, i) {
    const nextEvent = i < arr.length - 1 ? arr[i + 1] : null; // The next event with tile is used to to determine the 'last successful' flag
    // when rendering the tile. The shouldShowEvent function is pretty quick at what
    // it does, so this should have no significant cost even when a room is used for
    // not-chat purposes.

    const nextTile = arr.slice(i + 1).find(e => this.shouldShowEvent(e));
    return {
      nextEvent,
      nextTile
    };
  }

  get pendingEditItem() {
    if (!this.props.room) {
      return undefined;
    }

    try {
      return localStorage.getItem((0, _Editing.editorRoomKey)(this.props.room.roomId, this.context.timelineRenderingType));
    } catch (err) {
      _logger.logger.error(err);

      return undefined;
    }
  }

  getEventTiles() {
    let i; // first figure out which is the last event in the list which we're
    // actually going to show; this allows us to behave slightly
    // differently for the last event in the list. (eg show timestamp)
    //
    // we also need to figure out which is the last event we show which isn't
    // a local echo, to manage the read-marker.

    let lastShownEvent;
    let lastShownNonLocalEchoIndex = -1;

    for (i = this.props.events.length - 1; i >= 0; i--) {
      const mxEv = this.props.events[i];

      if (!this.shouldShowEvent(mxEv)) {
        continue;
      }

      if (lastShownEvent === undefined) {
        lastShownEvent = mxEv;
      }

      if (mxEv.status) {
        // this is a local echo
        continue;
      }

      lastShownNonLocalEchoIndex = i;
      break;
    }

    const ret = [];
    let prevEvent = null; // the last event we showed
    // Note: the EventTile might still render a "sent/sending receipt" independent of
    // this information. When not providing read receipt information, the tile is likely
    // to assume that sent receipts are to be shown more often.

    this.readReceiptsByEvent = {};

    if (this.props.showReadReceipts) {
      this.readReceiptsByEvent = this.getReadReceiptsByShownEvent();
    }

    let grouper = null;

    for (i = 0; i < this.props.events.length; i++) {
      const mxEv = this.props.events[i];
      const eventId = mxEv.getId();
      const last = mxEv === lastShownEvent;
      const {
        nextEvent,
        nextTile
      } = this.getNextEventInfo(this.props.events, i);

      if (grouper) {
        if (grouper.shouldGroup(mxEv)) {
          grouper.add(mxEv);
          continue;
        } else {
          // not part of group, so get the group tiles, close the
          // group, and continue like a normal event
          ret.push(...grouper.getTiles());
          prevEvent = grouper.getNewPrevEvent();
          grouper = null;
        }
      }

      for (const Grouper of groupers) {
        if (Grouper.canStartGroup(this, mxEv) && !this.props.disableGrouping) {
          grouper = new Grouper(this, mxEv, prevEvent, lastShownEvent, nextEvent, nextTile);
          break; // break on first grouper
        }
      }

      if (!grouper) {
        if (this.shouldShowEvent(mxEv)) {
          // make sure we unpack the array returned by getTilesForEvent,
          // otherwise React will auto-generate keys, and we will end up
          // replacing all the DOM elements every time we paginate.
          ret.push(...this.getTilesForEvent(prevEvent, mxEv, last, false, nextEvent, nextTile));
          prevEvent = mxEv;
        }

        const readMarker = this.readMarkerForEvent(eventId, i >= lastShownNonLocalEchoIndex);
        if (readMarker) ret.push(readMarker);
      }
    }

    if (grouper) {
      ret.push(...grouper.getTiles());
    }

    return ret;
  }

  getTilesForEvent(prevEvent, mxEv) {
    let last = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    let isGrouped = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    let nextEvent = arguments.length > 4 ? arguments[4] : undefined;
    let nextEventWithTile = arguments.length > 5 ? arguments[5] : undefined;
    const ret = [];
    const isEditing = this.props.editState?.getEvent().getId() === mxEv.getId(); // local echoes have a fake date, which could even be yesterday. Treat them as 'today' for the date separators.

    let ts1 = mxEv.getTs();
    let eventDate = mxEv.getDate();

    if (mxEv.status) {
      eventDate = new Date();
      ts1 = eventDate.getTime();
    } // do we need a date separator since the last event?


    const wantsDateSeparator = this.wantsDateSeparator(prevEvent, eventDate);

    if (wantsDateSeparator && !isGrouped && this.props.room) {
      const dateSeparator = /*#__PURE__*/_react.default.createElement("li", {
        key: ts1
      }, /*#__PURE__*/_react.default.createElement(_DateSeparator.default, {
        key: ts1,
        roomId: this.props.room.roomId,
        ts: ts1
      }));

      ret.push(dateSeparator);
    }

    let lastInSection = true;

    if (nextEventWithTile) {
      const nextEv = nextEventWithTile;
      const willWantDateSeparator = this.wantsDateSeparator(mxEv, nextEv.getDate() || new Date());
      lastInSection = willWantDateSeparator || mxEv.getSender() !== nextEv.getSender() || (0, _EventRenderingUtils.getEventDisplayInfo)(nextEv, this.showHiddenEvents).isInfoMessage || !shouldFormContinuation(mxEv, nextEv, this.showHiddenEvents, this.threadsEnabled, this.context.timelineRenderingType);
    } // is this a continuation of the previous message?


    const continuation = !wantsDateSeparator && shouldFormContinuation(prevEvent, mxEv, this.showHiddenEvents, this.threadsEnabled, this.context.timelineRenderingType);
    const eventId = mxEv.getId();
    const highlight = eventId === this.props.highlightedEventId;
    const readReceipts = this.readReceiptsByEvent[eventId];
    let isLastSuccessful = false;

    const isSentState = s => !s || s === 'sent';

    const isSent = isSentState(mxEv.getAssociatedStatus());
    const hasNextEvent = nextEvent && this.shouldShowEvent(nextEvent);

    if (!hasNextEvent && isSent) {
      isLastSuccessful = true;
    } else if (hasNextEvent && isSent && !isSentState(nextEvent.getAssociatedStatus())) {
      isLastSuccessful = true;
    } // This is a bit nuanced, but if our next event is hidden but a future event is not
    // hidden then we're not the last successful.


    if (nextEventWithTile && nextEventWithTile !== nextEvent && isSentState(nextEventWithTile.getAssociatedStatus())) {
      isLastSuccessful = false;
    } // We only want to consider "last successful" if the event is sent by us, otherwise of course
    // it's successful: we received it.


    isLastSuccessful = isLastSuccessful && mxEv.getSender() === _MatrixClientPeg.MatrixClientPeg.get().getUserId();
    const callEventGrouper = this.props.callEventGroupers.get(mxEv.getContent().call_id); // use txnId as key if available so that we don't remount during sending

    ret.push( /*#__PURE__*/_react.default.createElement(_EventTile.default, {
      key: mxEv.getTxnId() || eventId,
      as: "li",
      ref: this.collectEventTile.bind(this, eventId),
      alwaysShowTimestamps: this.props.alwaysShowTimestamps,
      mxEvent: mxEv,
      continuation: continuation,
      isRedacted: mxEv.isRedacted(),
      replacingEventId: mxEv.replacingEventId(),
      editState: isEditing && this.props.editState,
      onHeightChanged: this.onHeightChanged,
      readReceipts: readReceipts,
      readReceiptMap: this.readReceiptMap,
      showUrlPreview: this.props.showUrlPreview,
      checkUnmounting: this.isUnmounting,
      eventSendStatus: mxEv.getAssociatedStatus(),
      isTwelveHour: this.props.isTwelveHour,
      permalinkCreator: this.props.permalinkCreator,
      last: last,
      lastInSection: lastInSection,
      lastSuccessful: isLastSuccessful,
      isSelectedEvent: highlight,
      getRelationsForEvent: this.props.getRelationsForEvent,
      showReactions: this.props.showReactions,
      layout: this.props.layout,
      showReadReceipts: this.props.showReadReceipts,
      callEventGrouper: callEventGrouper,
      hideSender: this.state.hideSender
    }));
    return ret;
  }

  wantsDateSeparator(prevEvent, nextEventDate) {
    if (this.context.timelineRenderingType === _RoomContext.TimelineRenderingType.ThreadsList) {
      return false;
    }

    if (prevEvent == null) {
      // first event in the panel: depends if we could back-paginate from
      // here.
      return !this.props.canBackPaginate;
    }

    return (0, _DateUtils.wantsDateSeparator)(prevEvent.getDate(), nextEventDate);
  } // Get a list of read receipts that should be shown next to this event
  // Receipts are objects which have a 'userId', 'roomMember' and 'ts'.


  getReadReceiptsForEvent(event) {
    const myUserId = _MatrixClientPeg.MatrixClientPeg.get().credentials.userId; // get list of read receipts, sorted most recent first


    const {
      room
    } = this.props;

    if (!room) {
      return null;
    }

    const receipts = [];
    room.getReceiptsForEvent(event).forEach(r => {
      if (!r.userId || !(0, _utils.isSupportedReceiptType)(r.type) || r.userId === myUserId) {
        return; // ignore non-read receipts and receipts from self.
      }

      if (_MatrixClientPeg.MatrixClientPeg.get().isUserIgnored(r.userId)) {
        return; // ignore ignored users
      }

      const member = room.getMember(r.userId);
      receipts.push({
        userId: r.userId,
        roomMember: member,
        ts: r.data ? r.data.ts : 0
      });
    });
    return receipts;
  } // Get an object that maps from event ID to a list of read receipts that
  // should be shown next to that event. If a hidden event has read receipts,
  // they are folded into the receipts of the last shown event.


  getReadReceiptsByShownEvent() {
    const receiptsByEvent = {};
    const receiptsByUserId = {};
    let lastShownEventId;

    for (const event of this.props.events) {
      if (this.shouldShowEvent(event)) {
        lastShownEventId = event.getId();
      }

      if (!lastShownEventId) {
        continue;
      }

      const existingReceipts = receiptsByEvent[lastShownEventId] || [];
      const newReceipts = this.getReadReceiptsForEvent(event);
      receiptsByEvent[lastShownEventId] = existingReceipts.concat(newReceipts); // Record these receipts along with their last shown event ID for
      // each associated user ID.

      for (const receipt of newReceipts) {
        receiptsByUserId[receipt.userId] = {
          lastShownEventId,
          receipt
        };
      }
    } // It's possible in some cases (for example, when a read receipt
    // advances before we have paginated in the new event that it's marking
    // received) that we can temporarily not have a matching event for
    // someone which had one in the last. By looking through our previous
    // mapping of receipts by user ID, we can cover recover any receipts
    // that would have been lost by using the same event ID from last time.


    for (const userId in this.readReceiptsByUserId) {
      if (receiptsByUserId[userId]) {
        continue;
      }

      const {
        lastShownEventId,
        receipt
      } = this.readReceiptsByUserId[userId];
      const existingReceipts = receiptsByEvent[lastShownEventId] || [];
      receiptsByEvent[lastShownEventId] = existingReceipts.concat(receipt);
      receiptsByUserId[userId] = {
        lastShownEventId,
        receipt
      };
    }

    this.readReceiptsByUserId = receiptsByUserId; // After grouping receipts by shown events, do another pass to sort each
    // receipt list.

    for (const eventId in receiptsByEvent) {
      receiptsByEvent[eventId].sort((r1, r2) => {
        return r2.ts - r1.ts;
      });
    }

    return receiptsByEvent;
  }

  updateTimelineMinHeight() {
    const scrollPanel = this.scrollPanel.current;

    if (scrollPanel) {
      const isAtBottom = scrollPanel.isAtBottom();
      const whoIsTyping = this.whoIsTyping.current;
      const isTypingVisible = whoIsTyping && whoIsTyping.isVisible(); // when messages get added to the timeline,
      // but somebody else is still typing,
      // update the min-height, so once the last
      // person stops typing, no jumping occurs

      if (isAtBottom && isTypingVisible) {
        scrollPanel.preventShrinking();
      }
    }
  }

  onTimelineReset() {
    const scrollPanel = this.scrollPanel.current;

    if (scrollPanel) {
      scrollPanel.clearPreventShrinking();
    }
  }

  render() {
    let topSpinner;
    let bottomSpinner;

    if (this.props.backPaginating) {
      topSpinner = /*#__PURE__*/_react.default.createElement("li", {
        key: "_topSpinner"
      }, /*#__PURE__*/_react.default.createElement(_Spinner.default, null));
    }

    if (this.props.forwardPaginating) {
      bottomSpinner = /*#__PURE__*/_react.default.createElement("li", {
        key: "_bottomSpinner"
      }, /*#__PURE__*/_react.default.createElement(_Spinner.default, null));
    }

    const style = this.props.hidden ? {
      display: 'none'
    } : {};
    let whoIsTyping;

    if (this.props.room && this.state.showTypingNotifications && this.context.timelineRenderingType === _RoomContext.TimelineRenderingType.Room) {
      whoIsTyping = /*#__PURE__*/_react.default.createElement(_WhoIsTypingTile.default, {
        room: this.props.room,
        onShown: this.onTypingShown,
        onHidden: this.onTypingHidden,
        ref: this.whoIsTyping
      });
    }

    let ircResizer = null;

    if (this.props.layout == _Layout.Layout.IRC) {
      ircResizer = /*#__PURE__*/_react.default.createElement(_IRCTimelineProfileResizer.default, {
        minWidth: 20,
        maxWidth: 600,
        roomId: this.props.room ? this.props.room.roomId : null
      });
    }

    const classes = (0, _classnames.default)(this.props.className, {
      "mx_MessagePanel_narrow": this.context.narrow
    });
    return /*#__PURE__*/_react.default.createElement(_ErrorBoundary.default, null, /*#__PURE__*/_react.default.createElement(_ScrollPanel.default, {
      ref: this.scrollPanel,
      className: classes,
      onScroll: this.props.onScroll,
      onFillRequest: this.props.onFillRequest,
      onUnfillRequest: this.props.onUnfillRequest,
      style: style,
      stickyBottom: this.props.stickyBottom,
      resizeNotifier: this.props.resizeNotifier,
      fixedChildren: ircResizer
    }, topSpinner, this.getEventTiles(), whoIsTyping, bottomSpinner));
  }

}

exports.default = MessagePanel;
(0, _defineProperty2.default)(MessagePanel, "contextType", _RoomContext.default);
(0, _defineProperty2.default)(MessagePanel, "defaultProps", {
  disableGrouping: false
});

class BaseGrouper {
  // events that we include in the group but then eject out and place above the group.
  constructor(panel, event, prevEvent, lastShownEvent, nextEvent, nextEventTile) {
    this.panel = panel;
    this.event = event;
    this.prevEvent = prevEvent;
    this.lastShownEvent = lastShownEvent;
    this.nextEvent = nextEvent;
    this.nextEventTile = nextEventTile;
    (0, _defineProperty2.default)(this, "events", []);
    (0, _defineProperty2.default)(this, "ejectedEvents", []);
    (0, _defineProperty2.default)(this, "readMarker", void 0);
    this.readMarker = panel.readMarkerForEvent(event.getId(), event === lastShownEvent);
  }

}
/* Grouper classes determine when events can be grouped together in a summary.
 * Groupers should have the following methods:
 * - canStartGroup (static): determines if a new group should be started with the
 *   given event
 * - shouldGroup: determines if the given event should be added to an existing group
 * - add: adds an event to an existing group (should only be called if shouldGroup
 *   return true)
 * - getTiles: returns the tiles that represent the group
 * - getNewPrevEvent: returns the event that should be used as the new prevEvent
 *   when determining things such as whether a date separator is necessary
 */
// Wrap initial room creation events into a GenericEventListSummary
// Grouping only events sent by the same user that sent the `m.room.create` and only until
// the first non-state event, beacon_info event or membership event which is not regarding the sender of the `m.room.create` event


(0, _defineProperty2.default)(BaseGrouper, "canStartGroup", (panel, ev) => true);

class CreationGrouper extends BaseGrouper {
  shouldGroup(ev) {
    const panel = this.panel;
    const createEvent = this.event;

    if (!panel.shouldShowEvent(ev)) {
      return true;
    }

    if (panel.wantsDateSeparator(this.event, ev.getDate())) {
      return false;
    }

    if (ev.getType() === _event.EventType.RoomMember && (ev.getStateKey() !== createEvent.getSender() || ev.getContent()["membership"] !== "join")) {
      return false;
    } // beacons are not part of room creation configuration
    // should be shown in timeline


    if (_beacon.M_BEACON_INFO.matches(ev.getType())) {
      return false;
    }

    if (ev.isState() && ev.getSender() === createEvent.getSender()) {
      return true;
    }

    return false;
  }

  add(ev) {
    const panel = this.panel;
    this.readMarker = this.readMarker || panel.readMarkerForEvent(ev.getId(), ev === this.lastShownEvent);

    if (!panel.shouldShowEvent(ev)) {
      return;
    }

    if (ev.getType() === _event.EventType.RoomEncryption) {
      this.ejectedEvents.push(ev);
    } else {
      this.events.push(ev);
    }
  }

  getTiles() {
    // If we don't have any events to group, don't even try to group them. The logic
    // below assumes that we have a group of events to deal with, but we might not if
    // the events we were supposed to group were redacted.
    if (!this.events || !this.events.length) return [];
    const panel = this.panel;
    const ret = [];
    const isGrouped = true;
    const createEvent = this.event;
    const lastShownEvent = this.lastShownEvent;

    if (panel.wantsDateSeparator(this.prevEvent, createEvent.getDate())) {
      const ts = createEvent.getTs();
      ret.push( /*#__PURE__*/_react.default.createElement("li", {
        key: ts + '~'
      }, /*#__PURE__*/_react.default.createElement(_DateSeparator.default, {
        roomId: createEvent.getRoomId(),
        ts: ts
      })));
    } // If this m.room.create event should be shown (room upgrade) then show it before the summary


    if (panel.shouldShowEvent(createEvent)) {
      // pass in the createEvent as prevEvent as well so no extra DateSeparator is rendered
      ret.push(...panel.getTilesForEvent(createEvent, createEvent));
    }

    for (const ejected of this.ejectedEvents) {
      ret.push(...panel.getTilesForEvent(createEvent, ejected, createEvent === lastShownEvent, isGrouped));
    }

    const eventTiles = this.events.map(e => {
      // In order to prevent DateSeparators from appearing in the expanded form
      // of GenericEventListSummary, render each member event as if the previous
      // one was itself. This way, the timestamp of the previous event === the
      // timestamp of the current event, and no DateSeparator is inserted.
      return panel.getTilesForEvent(e, e, e === lastShownEvent, isGrouped);
    }).reduce((a, b) => a.concat(b), []); // Get sender profile from the latest event in the summary as the m.room.create doesn't contain one

    const ev = this.events[this.events.length - 1];
    let summaryText;
    const roomId = ev.getRoomId();
    const creator = ev.sender ? ev.sender.name : ev.getSender();

    if (_DMRoomMap.default.shared().getUserIdForRoomId(roomId)) {
      summaryText = (0, _languageHandler._t)("%(creator)s created this DM.", {
        creator
      });
    } else {
      summaryText = (0, _languageHandler._t)("%(creator)s created and configured the room.", {
        creator
      });
    }

    ret.push( /*#__PURE__*/_react.default.createElement(_NewRoomIntro.default, {
      key: "newroomintro"
    }));
    ret.push( /*#__PURE__*/_react.default.createElement(_GenericEventListSummary.default, {
      key: "roomcreationsummary",
      events: this.events,
      onToggle: panel.onHeightChanged // Update scroll state
      ,
      summaryMembers: [ev.sender],
      summaryText: summaryText,
      layout: this.panel.props.layout
    }, eventTiles));

    if (this.readMarker) {
      ret.push(this.readMarker);
    }

    return ret;
  }

  getNewPrevEvent() {
    return this.event;
  }

} // Wrap consecutive grouped events in a ListSummary


(0, _defineProperty2.default)(CreationGrouper, "canStartGroup", function (panel, ev) {
  return ev.getType() === _event.EventType.RoomCreate;
});

class MainGrouper extends BaseGrouper {
  constructor(panel, event, prevEvent, lastShownEvent, nextEvent, nextEventTile) {
    super(panel, event, prevEvent, lastShownEvent, nextEvent, nextEventTile);
    this.panel = panel;
    this.event = event;
    this.prevEvent = prevEvent;
    this.lastShownEvent = lastShownEvent;
    this.events = [event];
  }

  shouldGroup(ev) {
    if (!this.panel.shouldShowEvent(ev)) {
      // absorb hidden events so that they do not break up streams of messages & redaction events being grouped
      return true;
    }

    if (this.panel.wantsDateSeparator(this.events[0], ev.getDate())) {
      return false;
    }

    if (ev.isState() && groupedStateEvents.includes(ev.getType())) {
      return true;
    }

    if (ev.isRedacted()) {
      return true;
    }

    if (this.panel.showHiddenEvents && !this.panel.shouldShowEvent(ev, true)) {
      return true;
    }

    return false;
  }

  add(ev) {
    if (ev.getType() === _event.EventType.RoomMember) {
      // We can ignore any events that don't actually have a message to display
      if (!(0, _TextForEvent.hasText)(ev, this.panel.showHiddenEvents)) return;
    }

    this.readMarker = this.readMarker || this.panel.readMarkerForEvent(ev.getId(), ev === this.lastShownEvent);

    if (!this.panel.showHiddenEvents && !this.panel.shouldShowEvent(ev)) {
      // absorb hidden events to not split the summary
      return;
    }

    this.events.push(ev);
  }

  generateKey() {
    return "eventlistsummary-" + this.events[0].getId();
  }

  getTiles() {
    // If we don't have any events to group, don't even try to group them. The logic
    // below assumes that we have a group of events to deal with, but we might not if
    // the events we were supposed to group were redacted.
    if (!this.events?.length) return [];
    const isGrouped = true;
    const panel = this.panel;
    const lastShownEvent = this.lastShownEvent;
    const ret = [];

    if (panel.wantsDateSeparator(this.prevEvent, this.events[0].getDate())) {
      const ts = this.events[0].getTs();
      ret.push( /*#__PURE__*/_react.default.createElement("li", {
        key: ts + '~'
      }, /*#__PURE__*/_react.default.createElement(_DateSeparator.default, {
        roomId: this.events[0].getRoomId(),
        ts: ts
      })));
    } // Ensure that the key of the EventListSummary does not change with new events in either direction.
    // This will prevent it from being re-created unnecessarily, and instead will allow new props to be provided.
    // In turn, the shouldComponentUpdate method on ELS can be used to prevent unnecessary renderings.


    const keyEvent = this.events.find(e => this.panel.grouperKeyMap.get(e));
    const key = keyEvent ? this.panel.grouperKeyMap.get(keyEvent) : this.generateKey();

    if (!keyEvent) {
      // Populate the weak map with the key.
      // Note that we only set the key on the specific event it refers to, since this group might get
      // split up in the future by other intervening events. If we were to set the key on all events
      // currently in the group, we would risk later giving the same key to multiple groups.
      this.panel.grouperKeyMap.set(this.events[0], key);
    }

    let highlightInSummary = false;
    let eventTiles = this.events.map((e, i) => {
      if (e.getId() === panel.props.highlightedEventId) {
        highlightInSummary = true;
      }

      return panel.getTilesForEvent(i === 0 ? this.prevEvent : this.events[i - 1], e, e === lastShownEvent, isGrouped, this.nextEvent, this.nextEventTile);
    }).reduce((a, b) => a.concat(b), []);

    if (eventTiles.length === 0) {
      eventTiles = null;
    } // If a membership event is the start of visible history, tell the user
    // why they can't see earlier messages


    if (!this.panel.props.canBackPaginate && !this.prevEvent) {
      ret.push( /*#__PURE__*/_react.default.createElement(_HistoryTile.default, {
        key: "historytile"
      }));
    }

    ret.push( /*#__PURE__*/_react.default.createElement(_EventListSummary.default, {
      key: key,
      "data-testid": key,
      events: this.events,
      onToggle: panel.onHeightChanged // Update scroll state
      ,
      startExpanded: highlightInSummary,
      layout: this.panel.props.layout
    }, eventTiles));

    if (this.readMarker) {
      ret.push(this.readMarker);
    }

    return ret;
  }

  getNewPrevEvent() {
    return this.events[this.events.length - 1];
  }

} // all the grouper classes that we use, ordered by priority


(0, _defineProperty2.default)(MainGrouper, "canStartGroup", function (panel, ev) {
  if (!panel.shouldShowEvent(ev)) return false;

  if (ev.isState() && groupedStateEvents.includes(ev.getType())) {
    return true;
  }

  if (ev.isRedacted()) {
    return true;
  }

  if (panel.showHiddenEvents && !panel.shouldShowEvent(ev, true)) {
    return true;
  }

  return false;
});
const groupers = [CreationGrouper, MainGrouper];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDT05USU5VQVRJT05fTUFYX0lOVEVSVkFMIiwiY29udGludWVkVHlwZXMiLCJFdmVudFR5cGUiLCJTdGlja2VyIiwiUm9vbU1lc3NhZ2UiLCJncm91cGVkU3RhdGVFdmVudHMiLCJSb29tTWVtYmVyIiwiUm9vbVRoaXJkUGFydHlJbnZpdGUiLCJSb29tU2VydmVyQWNsIiwiUm9vbVBpbm5lZEV2ZW50cyIsInNob3VsZEZvcm1Db250aW51YXRpb24iLCJwcmV2RXZlbnQiLCJteEV2ZW50Iiwic2hvd0hpZGRlbkV2ZW50cyIsInRocmVhZHNFbmFibGVkIiwidGltZWxpbmVSZW5kZXJpbmdUeXBlIiwiVGltZWxpbmVSZW5kZXJpbmdUeXBlIiwiVGhyZWFkc0xpc3QiLCJzZW5kZXIiLCJnZXRUcyIsImlzUmVkYWN0ZWQiLCJnZXRUeXBlIiwiaW5jbHVkZXMiLCJ1c2VySWQiLCJuYW1lIiwiZ2V0TXhjQXZhdGFyVXJsIiwiaGFzVGhyZWFkU3VtbWFyeSIsIlRocmVhZCIsImhhdmVSZW5kZXJlckZvckV2ZW50IiwiTWVzc2FnZVBhbmVsIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY29udGV4dCIsImNyZWF0ZVJlZiIsIldlYWtNYXAiLCJzZXRTdGF0ZSIsImhpZGVTZW5kZXIiLCJzaG91bGRIaWRlU2VuZGVyIiwic2hvd1R5cGluZ05vdGlmaWNhdGlvbnMiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJpc01vdW50ZWQiLCJub2RlIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwic3R5bGUiLCJ3aWR0aCIsIm9wYWNpdHkiLCJldiIsImZpbmlzaGVkRXZlbnRJZCIsInRhcmdldCIsImRhdGFzZXQiLCJldmVudGlkIiwiZ2hvc3RSZWFkTWFya2VycyIsInN0YXRlIiwiZmlsdGVyIiwiZWlkIiwiZXZlbnRJZCIsImV2ZW50VGlsZXMiLCJzY3JvbGxQYW5lbCIsImN1cnJlbnQiLCJjaGVja1Njcm9sbCIsImdldFNjcm9sbFN0YXRlIiwic3R1Y2tBdEJvdHRvbSIsInByZXZlbnRTaHJpbmtpbmciLCJ1cGRhdGVQcmV2ZW50U2hyaW5raW5nIiwiX3Nob3dIaWRkZW5FdmVudHMiLCJzaG93VHlwaW5nTm90aWZpY2F0aW9uc1dhdGNoZXJSZWYiLCJ3YXRjaFNldHRpbmciLCJvblNob3dUeXBpbmdOb3RpZmljYXRpb25zQ2hhbmdlIiwiY29tcG9uZW50RGlkTW91bnQiLCJjYWxjdWxhdGVSb29tTWVtYmVyc0NvdW50Iiwicm9vbSIsImN1cnJlbnRTdGF0ZSIsIm9uIiwiUm9vbVN0YXRlRXZlbnQiLCJVcGRhdGUiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsIm9mZiIsInVud2F0Y2hTZXR0aW5nIiwiY29tcG9uZW50RGlkVXBkYXRlIiwicHJldlByb3BzIiwicHJldlN0YXRlIiwibGF5b3V0IiwicmVhZE1hcmtlclZpc2libGUiLCJyZWFkTWFya2VyRXZlbnRJZCIsInB1c2giLCJwZW5kaW5nRWRpdEl0ZW0iLCJlZGl0U3RhdGUiLCJldmVudCIsImZpbmRFdmVudEJ5SWQiLCJkZWZhdWx0RGlzcGF0Y2hlciIsImRpc3BhdGNoIiwiYWN0aW9uIiwiQWN0aW9uIiwiRWRpdEV2ZW50IiwiZ2V0SW52aXRlZEFuZEpvaW5lZE1lbWJlckNvdW50IiwiTGF5b3V0IiwiQnViYmxlIiwiZ2V0Tm9kZUZvckV2ZW50SWQiLCJ1bmRlZmluZWQiLCJyZWYiLCJnZXRUaWxlRm9yRXZlbnRJZCIsImlzQXRCb3R0b20iLCJnZXRSZWFkTWFya2VyUG9zaXRpb24iLCJyZWFkTWFya2VyIiwicmVhZE1hcmtlck5vZGUiLCJtZXNzYWdlV3JhcHBlciIsIndyYXBwZXJSZWN0IiwiUmVhY3RET00iLCJmaW5kRE9NTm9kZSIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsInJlYWRNYXJrZXJSZWN0IiwiYm90dG9tIiwidG9wIiwic2Nyb2xsVG9Ub3AiLCJzY3JvbGxUb0JvdHRvbSIsInNjcm9sbFJlbGF0aXZlIiwibXVsdCIsImhhbmRsZVNjcm9sbEtleSIsInNjcm9sbFRvRXZlbnQiLCJwaXhlbE9mZnNldCIsIm9mZnNldEJhc2UiLCJzY3JvbGxUb1Rva2VuIiwic2Nyb2xsVG9FdmVudElmTmVlZGVkIiwic2Nyb2xsSW50b1ZpZXciLCJibG9jayIsImJlaGF2aW9yIiwic2hvdWxkU2hvd0V2ZW50IiwibXhFdiIsImZvcmNlSGlkZUV2ZW50cyIsImhpZGVUaHJlYWRlZE1lc3NhZ2VzIiwic2hvdWxkTGl2ZUluUm9vbSIsImV2ZW50U2hvdWxkTGl2ZUluIiwiZXZlbnRzIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiaXNVc2VySWdub3JlZCIsImdldFNlbmRlciIsImhpZ2hsaWdodGVkRXZlbnRJZCIsImdldElkIiwic2hvdWxkSGlkZUV2ZW50IiwicmVhZE1hcmtlckZvckV2ZW50IiwiaXNMYXN0RXZlbnQiLCJ2aXNpYmxlIiwiaHIiLCJjb2xsZWN0R2hvc3RSZWFkTWFya2VyIiwib25HaG9zdFRyYW5zaXRpb25FbmQiLCJnZXROZXh0RXZlbnRJbmZvIiwiYXJyIiwiaSIsIm5leHRFdmVudCIsImxlbmd0aCIsIm5leHRUaWxlIiwic2xpY2UiLCJmaW5kIiwiZSIsImxvY2FsU3RvcmFnZSIsImdldEl0ZW0iLCJlZGl0b3JSb29tS2V5Iiwicm9vbUlkIiwiZXJyIiwibG9nZ2VyIiwiZXJyb3IiLCJnZXRFdmVudFRpbGVzIiwibGFzdFNob3duRXZlbnQiLCJsYXN0U2hvd25Ob25Mb2NhbEVjaG9JbmRleCIsInN0YXR1cyIsInJldCIsInJlYWRSZWNlaXB0c0J5RXZlbnQiLCJzaG93UmVhZFJlY2VpcHRzIiwiZ2V0UmVhZFJlY2VpcHRzQnlTaG93bkV2ZW50IiwiZ3JvdXBlciIsImxhc3QiLCJzaG91bGRHcm91cCIsImFkZCIsImdldFRpbGVzIiwiZ2V0TmV3UHJldkV2ZW50IiwiR3JvdXBlciIsImdyb3VwZXJzIiwiY2FuU3RhcnRHcm91cCIsImRpc2FibGVHcm91cGluZyIsImdldFRpbGVzRm9yRXZlbnQiLCJpc0dyb3VwZWQiLCJuZXh0RXZlbnRXaXRoVGlsZSIsImlzRWRpdGluZyIsImdldEV2ZW50IiwidHMxIiwiZXZlbnREYXRlIiwiZ2V0RGF0ZSIsIkRhdGUiLCJnZXRUaW1lIiwid2FudHNEYXRlU2VwYXJhdG9yIiwiZGF0ZVNlcGFyYXRvciIsImxhc3RJblNlY3Rpb24iLCJuZXh0RXYiLCJ3aWxsV2FudERhdGVTZXBhcmF0b3IiLCJnZXRFdmVudERpc3BsYXlJbmZvIiwiaXNJbmZvTWVzc2FnZSIsImNvbnRpbnVhdGlvbiIsImhpZ2hsaWdodCIsInJlYWRSZWNlaXB0cyIsImlzTGFzdFN1Y2Nlc3NmdWwiLCJpc1NlbnRTdGF0ZSIsInMiLCJpc1NlbnQiLCJnZXRBc3NvY2lhdGVkU3RhdHVzIiwiaGFzTmV4dEV2ZW50IiwiZ2V0VXNlcklkIiwiY2FsbEV2ZW50R3JvdXBlciIsImNhbGxFdmVudEdyb3VwZXJzIiwiZ2V0Q29udGVudCIsImNhbGxfaWQiLCJnZXRUeG5JZCIsImNvbGxlY3RFdmVudFRpbGUiLCJiaW5kIiwiYWx3YXlzU2hvd1RpbWVzdGFtcHMiLCJyZXBsYWNpbmdFdmVudElkIiwib25IZWlnaHRDaGFuZ2VkIiwicmVhZFJlY2VpcHRNYXAiLCJzaG93VXJsUHJldmlldyIsImlzVW5tb3VudGluZyIsImlzVHdlbHZlSG91ciIsInBlcm1hbGlua0NyZWF0b3IiLCJnZXRSZWxhdGlvbnNGb3JFdmVudCIsInNob3dSZWFjdGlvbnMiLCJuZXh0RXZlbnREYXRlIiwiY2FuQmFja1BhZ2luYXRlIiwiZ2V0UmVhZFJlY2VpcHRzRm9yRXZlbnQiLCJteVVzZXJJZCIsImNyZWRlbnRpYWxzIiwicmVjZWlwdHMiLCJnZXRSZWNlaXB0c0ZvckV2ZW50IiwiZm9yRWFjaCIsInIiLCJpc1N1cHBvcnRlZFJlY2VpcHRUeXBlIiwidHlwZSIsIm1lbWJlciIsImdldE1lbWJlciIsInJvb21NZW1iZXIiLCJ0cyIsImRhdGEiLCJyZWNlaXB0c0J5RXZlbnQiLCJyZWNlaXB0c0J5VXNlcklkIiwibGFzdFNob3duRXZlbnRJZCIsImV4aXN0aW5nUmVjZWlwdHMiLCJuZXdSZWNlaXB0cyIsImNvbmNhdCIsInJlY2VpcHQiLCJyZWFkUmVjZWlwdHNCeVVzZXJJZCIsInNvcnQiLCJyMSIsInIyIiwidXBkYXRlVGltZWxpbmVNaW5IZWlnaHQiLCJ3aG9Jc1R5cGluZyIsImlzVHlwaW5nVmlzaWJsZSIsImlzVmlzaWJsZSIsIm9uVGltZWxpbmVSZXNldCIsImNsZWFyUHJldmVudFNocmlua2luZyIsInJlbmRlciIsInRvcFNwaW5uZXIiLCJib3R0b21TcGlubmVyIiwiYmFja1BhZ2luYXRpbmciLCJmb3J3YXJkUGFnaW5hdGluZyIsImhpZGRlbiIsImRpc3BsYXkiLCJSb29tIiwib25UeXBpbmdTaG93biIsIm9uVHlwaW5nSGlkZGVuIiwiaXJjUmVzaXplciIsIklSQyIsImNsYXNzZXMiLCJjbGFzc05hbWVzIiwiY2xhc3NOYW1lIiwibmFycm93Iiwib25TY3JvbGwiLCJvbkZpbGxSZXF1ZXN0Iiwib25VbmZpbGxSZXF1ZXN0Iiwic3RpY2t5Qm90dG9tIiwicmVzaXplTm90aWZpZXIiLCJSb29tQ29udGV4dCIsIkJhc2VHcm91cGVyIiwicGFuZWwiLCJuZXh0RXZlbnRUaWxlIiwiQ3JlYXRpb25Hcm91cGVyIiwiY3JlYXRlRXZlbnQiLCJnZXRTdGF0ZUtleSIsIk1fQkVBQ09OX0lORk8iLCJtYXRjaGVzIiwiaXNTdGF0ZSIsIlJvb21FbmNyeXB0aW9uIiwiZWplY3RlZEV2ZW50cyIsImdldFJvb21JZCIsImVqZWN0ZWQiLCJtYXAiLCJyZWR1Y2UiLCJhIiwiYiIsInN1bW1hcnlUZXh0IiwiY3JlYXRvciIsIkRNUm9vbU1hcCIsInNoYXJlZCIsImdldFVzZXJJZEZvclJvb21JZCIsIl90IiwiUm9vbUNyZWF0ZSIsIk1haW5Hcm91cGVyIiwiaGFzVGV4dCIsImdlbmVyYXRlS2V5Iiwia2V5RXZlbnQiLCJncm91cGVyS2V5TWFwIiwia2V5Iiwic2V0IiwiaGlnaGxpZ2h0SW5TdW1tYXJ5Il0sInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvc3RydWN0dXJlcy9NZXNzYWdlUGFuZWwudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNiAtIDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgY3JlYXRlUmVmLCBLZXlib2FyZEV2ZW50LCBSZWFjdE5vZGUsIFRyYW5zaXRpb25FdmVudCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb20nO1xuaW1wb3J0IHsgRXZlbnRUeXBlIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL2V2ZW50JztcbmltcG9ydCB7IE1hdHJpeEV2ZW50IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50JztcbmltcG9ydCB7IFJlbGF0aW9ucyB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcmVsYXRpb25zXCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXInO1xuaW1wb3J0IHsgUm9vbVN0YXRlRXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb20tc3RhdGVcIjtcbmltcG9ydCB7IE1fQkVBQ09OX0lORk8gfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvYmVhY29uJztcbmltcG9ydCB7IGlzU3VwcG9ydGVkUmVjZWlwdFR5cGUgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvdXRpbHNcIjtcblxuaW1wb3J0IHNob3VsZEhpZGVFdmVudCBmcm9tICcuLi8uLi9zaG91bGRIaWRlRXZlbnQnO1xuaW1wb3J0IHsgd2FudHNEYXRlU2VwYXJhdG9yIH0gZnJvbSAnLi4vLi4vRGF0ZVV0aWxzJztcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gJy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tICcuLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlJztcbmltcG9ydCBSb29tQ29udGV4dCwgeyBUaW1lbGluZVJlbmRlcmluZ1R5cGUgfSBmcm9tIFwiLi4vLi4vY29udGV4dHMvUm9vbUNvbnRleHRcIjtcbmltcG9ydCB7IExheW91dCB9IGZyb20gXCIuLi8uLi9zZXR0aW5ncy9lbnVtcy9MYXlvdXRcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IEV2ZW50VGlsZSwgeyBVbndyYXBwZWRFdmVudFRpbGUsIElSZWFkUmVjZWlwdFByb3BzIH0gZnJvbSBcIi4uL3ZpZXdzL3Jvb21zL0V2ZW50VGlsZVwiO1xuaW1wb3J0IHsgaGFzVGV4dCB9IGZyb20gXCIuLi8uLi9UZXh0Rm9yRXZlbnRcIjtcbmltcG9ydCBJUkNUaW1lbGluZVByb2ZpbGVSZXNpemVyIGZyb20gXCIuLi92aWV3cy9lbGVtZW50cy9JUkNUaW1lbGluZVByb2ZpbGVSZXNpemVyXCI7XG5pbXBvcnQgRE1Sb29tTWFwIGZyb20gXCIuLi8uLi91dGlscy9ETVJvb21NYXBcIjtcbmltcG9ydCBOZXdSb29tSW50cm8gZnJvbSBcIi4uL3ZpZXdzL3Jvb21zL05ld1Jvb21JbnRyb1wiO1xuaW1wb3J0IEhpc3RvcnlUaWxlIGZyb20gXCIuLi92aWV3cy9yb29tcy9IaXN0b3J5VGlsZVwiO1xuaW1wb3J0IGRlZmF1bHREaXNwYXRjaGVyIGZyb20gJy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgTGVnYWN5Q2FsbEV2ZW50R3JvdXBlciBmcm9tIFwiLi9MZWdhY3lDYWxsRXZlbnRHcm91cGVyXCI7XG5pbXBvcnQgV2hvSXNUeXBpbmdUaWxlIGZyb20gJy4uL3ZpZXdzL3Jvb21zL1dob0lzVHlwaW5nVGlsZSc7XG5pbXBvcnQgU2Nyb2xsUGFuZWwsIHsgSVNjcm9sbFN0YXRlIH0gZnJvbSBcIi4vU2Nyb2xsUGFuZWxcIjtcbmltcG9ydCBHZW5lcmljRXZlbnRMaXN0U3VtbWFyeSBmcm9tICcuLi92aWV3cy9lbGVtZW50cy9HZW5lcmljRXZlbnRMaXN0U3VtbWFyeSc7XG5pbXBvcnQgRXZlbnRMaXN0U3VtbWFyeSBmcm9tICcuLi92aWV3cy9lbGVtZW50cy9FdmVudExpc3RTdW1tYXJ5JztcbmltcG9ydCBEYXRlU2VwYXJhdG9yIGZyb20gJy4uL3ZpZXdzL21lc3NhZ2VzL0RhdGVTZXBhcmF0b3InO1xuaW1wb3J0IEVycm9yQm91bmRhcnkgZnJvbSAnLi4vdmlld3MvZWxlbWVudHMvRXJyb3JCb3VuZGFyeSc7XG5pbXBvcnQgUmVzaXplTm90aWZpZXIgZnJvbSBcIi4uLy4uL3V0aWxzL1Jlc2l6ZU5vdGlmaWVyXCI7XG5pbXBvcnQgU3Bpbm5lciBmcm9tIFwiLi4vdmlld3MvZWxlbWVudHMvU3Bpbm5lclwiO1xuaW1wb3J0IHsgUm9vbVBlcm1hbGlua0NyZWF0b3IgfSBmcm9tIFwiLi4vLi4vdXRpbHMvcGVybWFsaW5rcy9QZXJtYWxpbmtzXCI7XG5pbXBvcnQgRWRpdG9yU3RhdGVUcmFuc2ZlciBmcm9tIFwiLi4vLi4vdXRpbHMvRWRpdG9yU3RhdGVUcmFuc2ZlclwiO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSAnLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zJztcbmltcG9ydCB7IGdldEV2ZW50RGlzcGxheUluZm8gfSBmcm9tIFwiLi4vLi4vdXRpbHMvRXZlbnRSZW5kZXJpbmdVdGlsc1wiO1xuaW1wb3J0IHsgSVJlYWRSZWNlaXB0SW5mbyB9IGZyb20gXCIuLi92aWV3cy9yb29tcy9SZWFkUmVjZWlwdE1hcmtlclwiO1xuaW1wb3J0IHsgaGF2ZVJlbmRlcmVyRm9yRXZlbnQgfSBmcm9tIFwiLi4vLi4vZXZlbnRzL0V2ZW50VGlsZUZhY3RvcnlcIjtcbmltcG9ydCB7IGVkaXRvclJvb21LZXkgfSBmcm9tIFwiLi4vLi4vRWRpdGluZ1wiO1xuaW1wb3J0IHsgaGFzVGhyZWFkU3VtbWFyeSB9IGZyb20gXCIuLi8uLi91dGlscy9FdmVudFV0aWxzXCI7XG5cbmNvbnN0IENPTlRJTlVBVElPTl9NQVhfSU5URVJWQUwgPSA1ICogNjAgKiAxMDAwOyAvLyA1IG1pbnV0ZXNcbmNvbnN0IGNvbnRpbnVlZFR5cGVzID0gW0V2ZW50VHlwZS5TdGlja2VyLCBFdmVudFR5cGUuUm9vbU1lc3NhZ2VdO1xuY29uc3QgZ3JvdXBlZFN0YXRlRXZlbnRzID0gW1xuICAgIEV2ZW50VHlwZS5Sb29tTWVtYmVyLFxuICAgIEV2ZW50VHlwZS5Sb29tVGhpcmRQYXJ0eUludml0ZSxcbiAgICBFdmVudFR5cGUuUm9vbVNlcnZlckFjbCxcbiAgICBFdmVudFR5cGUuUm9vbVBpbm5lZEV2ZW50cyxcbl07XG5cbi8vIGNoZWNrIGlmIHRoZXJlIGlzIGEgcHJldmlvdXMgZXZlbnQgYW5kIGl0IGhhcyB0aGUgc2FtZSBzZW5kZXIgYXMgdGhpcyBldmVudFxuLy8gYW5kIHRoZSB0eXBlcyBhcmUgdGhlIHNhbWUvaXMgaW4gY29udGludWVkVHlwZXMgYW5kIHRoZSB0aW1lIGJldHdlZW4gdGhlbSBpcyA8PSBDT05USU5VQVRJT05fTUFYX0lOVEVSVkFMXG5leHBvcnQgZnVuY3Rpb24gc2hvdWxkRm9ybUNvbnRpbnVhdGlvbihcbiAgICBwcmV2RXZlbnQ6IE1hdHJpeEV2ZW50LFxuICAgIG14RXZlbnQ6IE1hdHJpeEV2ZW50LFxuICAgIHNob3dIaWRkZW5FdmVudHM6IGJvb2xlYW4sXG4gICAgdGhyZWFkc0VuYWJsZWQ6IGJvb2xlYW4sXG4gICAgdGltZWxpbmVSZW5kZXJpbmdUeXBlPzogVGltZWxpbmVSZW5kZXJpbmdUeXBlLFxuKTogYm9vbGVhbiB7XG4gICAgaWYgKHRpbWVsaW5lUmVuZGVyaW5nVHlwZSA9PT0gVGltZWxpbmVSZW5kZXJpbmdUeXBlLlRocmVhZHNMaXN0KSByZXR1cm4gZmFsc2U7XG4gICAgLy8gc2FuaXR5IGNoZWNrIGlucHV0c1xuICAgIGlmICghcHJldkV2ZW50Py5zZW5kZXIgfHwgIW14RXZlbnQuc2VuZGVyKSByZXR1cm4gZmFsc2U7XG4gICAgLy8gY2hlY2sgaWYgd2l0aGluIHRoZSBtYXggY29udGludWF0aW9uIHBlcmlvZFxuICAgIGlmIChteEV2ZW50LmdldFRzKCkgLSBwcmV2RXZlbnQuZ2V0VHMoKSA+IENPTlRJTlVBVElPTl9NQVhfSU5URVJWQUwpIHJldHVybiBmYWxzZTtcblxuICAgIC8vIEFzIHdlIHN1bW1hcmlzZSByZWRhY3Rpb25zLCBkbyBub3QgY29udGludWUgYSByZWRhY3RlZCBldmVudCBvbnRvIGEgbm9uLXJlZGFjdGVkIG9uZSBhbmQgdmljZS12ZXJzYVxuICAgIGlmIChteEV2ZW50LmlzUmVkYWN0ZWQoKSAhPT0gcHJldkV2ZW50LmlzUmVkYWN0ZWQoKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gU29tZSBldmVudHMgc2hvdWxkIGFwcGVhciBhcyBjb250aW51YXRpb25zIGZyb20gcHJldmlvdXMgZXZlbnRzIG9mIGRpZmZlcmVudCB0eXBlcy5cbiAgICBpZiAobXhFdmVudC5nZXRUeXBlKCkgIT09IHByZXZFdmVudC5nZXRUeXBlKCkgJiZcbiAgICAgICAgKCFjb250aW51ZWRUeXBlcy5pbmNsdWRlcyhteEV2ZW50LmdldFR5cGUoKSBhcyBFdmVudFR5cGUpIHx8XG4gICAgICAgICAgICAhY29udGludWVkVHlwZXMuaW5jbHVkZXMocHJldkV2ZW50LmdldFR5cGUoKSBhcyBFdmVudFR5cGUpKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgLy8gQ2hlY2sgaWYgdGhlIHNlbmRlciBpcyB0aGUgc2FtZSBhbmQgaGFzbid0IGNoYW5nZWQgdGhlaXIgZGlzcGxheW5hbWUvYXZhdGFyIGJldHdlZW4gdGhlc2UgZXZlbnRzXG4gICAgaWYgKG14RXZlbnQuc2VuZGVyLnVzZXJJZCAhPT0gcHJldkV2ZW50LnNlbmRlci51c2VySWQgfHxcbiAgICAgICAgbXhFdmVudC5zZW5kZXIubmFtZSAhPT0gcHJldkV2ZW50LnNlbmRlci5uYW1lIHx8XG4gICAgICAgIG14RXZlbnQuc2VuZGVyLmdldE14Y0F2YXRhclVybCgpICE9PSBwcmV2RXZlbnQuc2VuZGVyLmdldE14Y0F2YXRhclVybCgpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBUaHJlYWQgc3VtbWFyaWVzIGluIHRoZSBtYWluIHRpbWVsaW5lIHNob3VsZCBicmVhayB1cCBhIGNvbnRpbnVhdGlvbiBvbiBib3RoIHNpZGVzXG4gICAgaWYgKHRocmVhZHNFbmFibGVkICYmXG4gICAgICAgIChoYXNUaHJlYWRTdW1tYXJ5KG14RXZlbnQpIHx8IGhhc1RocmVhZFN1bW1hcnkocHJldkV2ZW50KSkgJiZcbiAgICAgICAgdGltZWxpbmVSZW5kZXJpbmdUeXBlICE9PSBUaW1lbGluZVJlbmRlcmluZ1R5cGUuVGhyZWFkXG4gICAgKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBpZiB3ZSBkb24ndCBoYXZlIHRpbGUgZm9yIHByZXZpb3VzIGV2ZW50IHRoZW4gaXQgd2FzIHNob3duIGJ5IHNob3dIaWRkZW5FdmVudHMgYW5kIGhhcyBubyBTZW5kZXJQcm9maWxlXG4gICAgaWYgKCFoYXZlUmVuZGVyZXJGb3JFdmVudChwcmV2RXZlbnQsIHNob3dIaWRkZW5FdmVudHMpKSByZXR1cm4gZmFsc2U7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgLy8gdGhlIGxpc3Qgb2YgTWF0cml4RXZlbnRzIHRvIGRpc3BsYXlcbiAgICBldmVudHM6IE1hdHJpeEV2ZW50W107XG5cbiAgICAvLyB0cnVlIHRvIGdpdmUgdGhlIGNvbXBvbmVudCBhICdkaXNwbGF5OiBub25lJyBzdHlsZS5cbiAgICBoaWRkZW4/OiBib29sZWFuO1xuXG4gICAgLy8gdHJ1ZSB0byBzaG93IGEgc3Bpbm5lciBhdCB0aGUgdG9wIG9mIHRoZSB0aW1lbGluZSB0byBpbmRpY2F0ZVxuICAgIC8vIGJhY2stcGFnaW5hdGlvbiBpbiBwcm9ncmVzc1xuICAgIGJhY2tQYWdpbmF0aW5nPzogYm9vbGVhbjtcblxuICAgIC8vIHRydWUgdG8gc2hvdyBhIHNwaW5uZXIgYXQgdGhlIGVuZCBvZiB0aGUgdGltZWxpbmUgdG8gaW5kaWNhdGVcbiAgICAvLyBmb3J3YXJkLXBhZ2luYXRpb24gaW4gcHJvZ3Jlc3NcbiAgICBmb3J3YXJkUGFnaW5hdGluZz86IGJvb2xlYW47XG5cbiAgICAvLyBJRCBvZiBhbiBldmVudCB0byBoaWdobGlnaHQuIElmIHVuZGVmaW5lZCwgbm8gZXZlbnQgd2lsbCBiZSBoaWdobGlnaHRlZC5cbiAgICBoaWdobGlnaHRlZEV2ZW50SWQ/OiBzdHJpbmc7XG5cbiAgICAvLyBUaGUgcm9vbSB0aGVzZSBldmVudHMgYXJlIGFsbCBpbiB0b2dldGhlciwgaWYgYW55LlxuICAgIC8vIChUaGUgbm90aWZpY2F0aW9uIHBhbmVsIHdvbid0IGhhdmUgYSByb29tIGhlcmUsIGZvciBleGFtcGxlLilcbiAgICByb29tPzogUm9vbTtcblxuICAgIC8vIFNob3VsZCB3ZSBzaG93IFVSTCBQcmV2aWV3c1xuICAgIHNob3dVcmxQcmV2aWV3PzogYm9vbGVhbjtcblxuICAgIC8vIGV2ZW50IGFmdGVyIHdoaWNoIHdlIHNob3VsZCBzaG93IGEgcmVhZCBtYXJrZXJcbiAgICByZWFkTWFya2VyRXZlbnRJZD86IHN0cmluZztcblxuICAgIC8vIHdoZXRoZXIgdGhlIHJlYWQgbWFya2VyIHNob3VsZCBiZSB2aXNpYmxlXG4gICAgcmVhZE1hcmtlclZpc2libGU/OiBib29sZWFuO1xuXG4gICAgLy8gdGhlIHVzZXJpZCBvZiBvdXIgdXNlci4gVGhpcyBpcyB1c2VkIHRvIHN1cHByZXNzIHRoZSByZWFkIG1hcmtlclxuICAgIC8vIGZvciBwZW5kaW5nIG1lc3NhZ2VzLlxuICAgIG91clVzZXJJZD86IHN0cmluZztcblxuICAgIC8vIHdoZXRoZXIgdGhlIHRpbWVsaW5lIGNhbiB2aXN1YWxseSBnbyBiYWNrIGFueSBmdXJ0aGVyXG4gICAgY2FuQmFja1BhZ2luYXRlPzogYm9vbGVhbjtcblxuICAgIC8vIHdoZXRoZXIgdG8gc2hvdyByZWFkIHJlY2VpcHRzXG4gICAgc2hvd1JlYWRSZWNlaXB0cz86IGJvb2xlYW47XG5cbiAgICAvLyB0cnVlIGlmIHVwZGF0ZXMgdG8gdGhlIGV2ZW50IGxpc3Qgc2hvdWxkIGNhdXNlIHRoZSBzY3JvbGwgcGFuZWwgdG9cbiAgICAvLyBzY3JvbGwgZG93biB3aGVuIHdlIGFyZSBhdCB0aGUgYm90dG9tIG9mIHRoZSB3aW5kb3cuIFNlZSBTY3JvbGxQYW5lbFxuICAgIC8vIGZvciBtb3JlIGRldGFpbHMuXG4gICAgc3RpY2t5Qm90dG9tPzogYm9vbGVhbjtcblxuICAgIC8vIGNsYXNzTmFtZSBmb3IgdGhlIHBhbmVsXG4gICAgY2xhc3NOYW1lOiBzdHJpbmc7XG5cbiAgICAvLyBzaG93IHR3ZWx2ZSBob3VyIHRpbWVzdGFtcHNcbiAgICBpc1R3ZWx2ZUhvdXI/OiBib29sZWFuO1xuXG4gICAgLy8gc2hvdyB0aW1lc3RhbXBzIGFsd2F5c1xuICAgIGFsd2F5c1Nob3dUaW1lc3RhbXBzPzogYm9vbGVhbjtcblxuICAgIC8vIHdoZXRoZXIgdG8gc2hvdyByZWFjdGlvbnMgZm9yIGFuIGV2ZW50XG4gICAgc2hvd1JlYWN0aW9ucz86IGJvb2xlYW47XG5cbiAgICAvLyB3aGljaCBsYXlvdXQgdG8gdXNlXG4gICAgbGF5b3V0PzogTGF5b3V0O1xuXG4gICAgcmVzaXplTm90aWZpZXI6IFJlc2l6ZU5vdGlmaWVyO1xuICAgIHBlcm1hbGlua0NyZWF0b3I/OiBSb29tUGVybWFsaW5rQ3JlYXRvcjtcbiAgICBlZGl0U3RhdGU/OiBFZGl0b3JTdGF0ZVRyYW5zZmVyO1xuXG4gICAgLy8gY2FsbGJhY2sgd2hpY2ggaXMgY2FsbGVkIHdoZW4gdGhlIHBhbmVsIGlzIHNjcm9sbGVkLlxuICAgIG9uU2Nyb2xsPyhldmVudDogRXZlbnQpOiB2b2lkO1xuXG4gICAgLy8gY2FsbGJhY2sgd2hpY2ggaXMgY2FsbGVkIHdoZW4gbW9yZSBjb250ZW50IGlzIG5lZWRlZC5cbiAgICBvbkZpbGxSZXF1ZXN0PyhiYWNrd2FyZHM6IGJvb2xlYW4pOiBQcm9taXNlPGJvb2xlYW4+O1xuXG4gICAgLy8gaGVscGVyIGZ1bmN0aW9uIHRvIGFjY2VzcyByZWxhdGlvbnMgZm9yIGFuIGV2ZW50XG4gICAgb25VbmZpbGxSZXF1ZXN0PyhiYWNrd2FyZHM6IGJvb2xlYW4sIHNjcm9sbFRva2VuOiBzdHJpbmcpOiB2b2lkO1xuXG4gICAgZ2V0UmVsYXRpb25zRm9yRXZlbnQ/KGV2ZW50SWQ6IHN0cmluZywgcmVsYXRpb25UeXBlOiBzdHJpbmcsIGV2ZW50VHlwZTogc3RyaW5nKTogUmVsYXRpb25zO1xuXG4gICAgaGlkZVRocmVhZGVkTWVzc2FnZXM/OiBib29sZWFuO1xuICAgIGRpc2FibGVHcm91cGluZz86IGJvb2xlYW47XG5cbiAgICBjYWxsRXZlbnRHcm91cGVyczogTWFwPHN0cmluZywgTGVnYWN5Q2FsbEV2ZW50R3JvdXBlcj47XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGdob3N0UmVhZE1hcmtlcnM6IHN0cmluZ1tdO1xuICAgIHNob3dUeXBpbmdOb3RpZmljYXRpb25zOiBib29sZWFuO1xuICAgIGhpZGVTZW5kZXI6IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBJUmVhZFJlY2VpcHRGb3JVc2VyIHtcbiAgICBsYXN0U2hvd25FdmVudElkOiBzdHJpbmc7XG4gICAgcmVjZWlwdDogSVJlYWRSZWNlaXB0UHJvcHM7XG59XG5cbi8qIChhbG1vc3QpIHN0YXRlbGVzcyBVSSBjb21wb25lbnQgd2hpY2ggYnVpbGRzIHRoZSBldmVudCB0aWxlcyBpbiB0aGUgcm9vbSB0aW1lbGluZS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWVzc2FnZVBhbmVsIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgc3RhdGljIGNvbnRleHRUeXBlID0gUm9vbUNvbnRleHQ7XG4gICAgcHVibGljIGNvbnRleHQhOiBSZWFjdC5Db250ZXh0VHlwZTx0eXBlb2YgUm9vbUNvbnRleHQ+O1xuXG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgZGlzYWJsZUdyb3VwaW5nOiBmYWxzZSxcbiAgICB9O1xuXG4gICAgLy8gb3BhcXVlIHJlYWRyZWNlaXB0IGluZm8gZm9yIGVhY2ggdXNlcklkOyB1c2VkIGJ5IFJlYWRSZWNlaXB0TWFya2VyXG4gICAgLy8gdG8gbWFuYWdlIGl0cyBhbmltYXRpb25zXG4gICAgcHJpdmF0ZSByZWFkb25seSByZWFkUmVjZWlwdE1hcDogeyBbdXNlcklkOiBzdHJpbmddOiBJUmVhZFJlY2VpcHRJbmZvIH0gPSB7fTtcblxuICAgIC8vIFRyYWNrIHJlYWQgcmVjZWlwdHMgYnkgZXZlbnQgSUQuIEZvciBlYWNoIF9zaG93bl8gZXZlbnQgSUQsIHdlIHN0b3JlXG4gICAgLy8gdGhlIGxpc3Qgb2YgcmVhZCByZWNlaXB0cyB0byBkaXNwbGF5OlxuICAgIC8vICAgW1xuICAgIC8vICAgICAgIHtcbiAgICAvLyAgICAgICAgICAgdXNlcklkOiBzdHJpbmcsXG4gICAgLy8gICAgICAgICAgIG1lbWJlcjogUm9vbU1lbWJlcixcbiAgICAvLyAgICAgICAgICAgdHM6IG51bWJlcixcbiAgICAvLyAgICAgICB9LFxuICAgIC8vICAgXVxuICAgIC8vIFRoaXMgaXMgcmVjb21wdXRlZCBvbiBlYWNoIHJlbmRlci4gSXQncyBvbmx5IHN0b3JlZCBvbiB0aGUgY29tcG9uZW50XG4gICAgLy8gZm9yIGVhc2Ugb2YgcGFzc2luZyB0aGUgZGF0YSBhcm91bmQgc2luY2UgaXQncyBjb21wdXRlZCBpbiBvbmUgcGFzc1xuICAgIC8vIG92ZXIgYWxsIGV2ZW50cy5cbiAgICBwcml2YXRlIHJlYWRSZWNlaXB0c0J5RXZlbnQ6IFJlY29yZDxzdHJpbmcsIElSZWFkUmVjZWlwdFByb3BzW10+ID0ge307XG5cbiAgICAvLyBUcmFjayByZWFkIHJlY2VpcHRzIGJ5IHVzZXIgSUQuIEZvciBlYWNoIHVzZXIgSUQgd2UndmUgZXZlciBzaG93biBhXG4gICAgLy8gYSByZWFkIHJlY2VpcHQgZm9yLCB3ZSBzdG9yZSBhbiBvYmplY3Q6XG4gICAgLy8gICB7XG4gICAgLy8gICAgICAgbGFzdFNob3duRXZlbnRJZDogc3RyaW5nLFxuICAgIC8vICAgICAgIHJlY2VpcHQ6IHtcbiAgICAvLyAgICAgICAgICAgdXNlcklkOiBzdHJpbmcsXG4gICAgLy8gICAgICAgICAgIG1lbWJlcjogUm9vbU1lbWJlcixcbiAgICAvLyAgICAgICAgICAgdHM6IG51bWJlcixcbiAgICAvLyAgICAgICB9LFxuICAgIC8vICAgfVxuICAgIC8vIHNvIHRoYXQgd2UgY2FuIGFsd2F5cyBrZWVwIHJlY2VpcHRzIGRpc3BsYXllZCBieSByZXZlcnRpbmcgYmFjayB0b1xuICAgIC8vIHRoZSBsYXN0IHNob3duIGV2ZW50IGZvciB0aGF0IHVzZXIgSUQgd2hlbiBuZWVkZWQuIFRoaXMgbWF5IGZlZWwgbGlrZVxuICAgIC8vIGl0IGR1cGxpY2F0ZXMgdGhlIHJlY2VpcHQgc3RvcmFnZSBpbiB0aGUgcm9vbSwgYnV0IGF0IHRoaXMgbGF5ZXIsIHdlXG4gICAgLy8gYXJlIHRyYWNraW5nIF9zaG93bl8gZXZlbnQgSURzLCB3aGljaCB0aGUgSlMgU0RLIGtub3dzIG5vdGhpbmcgYWJvdXQuXG4gICAgLy8gVGhpcyBpcyByZWNvbXB1dGVkIG9uIGVhY2ggcmVuZGVyLCB1c2luZyB0aGUgZGF0YSBmcm9tIHRoZSBwcmV2aW91c1xuICAgIC8vIHJlbmRlciBhcyBvdXIgZmFsbGJhY2sgZm9yIGFueSB1c2VyIElEcyB3ZSBjYW4ndCBtYXRjaCBhIHJlY2VpcHQgdG8gYVxuICAgIC8vIGRpc3BsYXllZCBldmVudCBpbiB0aGUgY3VycmVudCByZW5kZXIgY3ljbGUuXG4gICAgcHJpdmF0ZSByZWFkUmVjZWlwdHNCeVVzZXJJZDogUmVjb3JkPHN0cmluZywgSVJlYWRSZWNlaXB0Rm9yVXNlcj4gPSB7fTtcblxuICAgIHByaXZhdGUgcmVhZG9ubHkgX3Nob3dIaWRkZW5FdmVudHM6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSByZWFkb25seSB0aHJlYWRzRW5hYmxlZDogYm9vbGVhbjtcbiAgICBwcml2YXRlIGlzTW91bnRlZCA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSByZWFkTWFya2VyTm9kZSA9IGNyZWF0ZVJlZjxIVE1MTElFbGVtZW50PigpO1xuICAgIHByaXZhdGUgd2hvSXNUeXBpbmcgPSBjcmVhdGVSZWY8V2hvSXNUeXBpbmdUaWxlPigpO1xuICAgIHByaXZhdGUgc2Nyb2xsUGFuZWwgPSBjcmVhdGVSZWY8U2Nyb2xsUGFuZWw+KCk7XG5cbiAgICBwcml2YXRlIHJlYWRvbmx5IHNob3dUeXBpbmdOb3RpZmljYXRpb25zV2F0Y2hlclJlZjogc3RyaW5nO1xuICAgIHByaXZhdGUgZXZlbnRUaWxlczogUmVjb3JkPHN0cmluZywgVW53cmFwcGVkRXZlbnRUaWxlPiA9IHt9O1xuXG4gICAgLy8gQSBtYXAgdG8gYWxsb3cgZ3JvdXBlcnMgdG8gbWFpbnRhaW4gY29uc2lzdGVudCBrZXlzIGV2ZW4gaWYgdGhlaXIgZmlyc3QgZXZlbnQgaXMgdXByb290ZWQgZHVlIHRvIGJhY2stcGFnaW5hdGlvbi5cbiAgICBwdWJsaWMgZ3JvdXBlcktleU1hcCA9IG5ldyBXZWFrTWFwPE1hdHJpeEV2ZW50LCBzdHJpbmc+KCk7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcywgY29udGV4dCkge1xuICAgICAgICBzdXBlcihwcm9wcywgY29udGV4dCk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIC8vIHByZXZpb3VzIHBvc2l0aW9ucyB0aGUgcmVhZCBtYXJrZXIgaGFzIGJlZW4gaW4sIHNvIHdlIGNhblxuICAgICAgICAgICAgLy8gZGlzcGxheSAnZ2hvc3QnIHJlYWQgbWFya2VycyB0aGF0IGFyZSBhbmltYXRpbmcgYXdheVxuICAgICAgICAgICAgZ2hvc3RSZWFkTWFya2VyczogW10sXG4gICAgICAgICAgICBzaG93VHlwaW5nTm90aWZpY2F0aW9uczogU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInNob3dUeXBpbmdOb3RpZmljYXRpb25zXCIpLFxuICAgICAgICAgICAgaGlkZVNlbmRlcjogdGhpcy5zaG91bGRIaWRlU2VuZGVyKCksXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQ2FjaGUgdGhlc2Ugc2V0dGluZ3Mgb24gbW91bnQgc2luY2UgU2V0dGluZ3MgaXMgZXhwZW5zaXZlIHRvIHF1ZXJ5LFxuICAgICAgICAvLyBhbmQgd2UgY2hlY2sgdGhpcyBpbiBhIGhvdCBjb2RlIHBhdGguIFRoaXMgaXMgYWxzbyBjYWNoZWQgaW4gb3VyXG4gICAgICAgIC8vIFJvb21Db250ZXh0LCBob3dldmVyIHdlIHN0aWxsIG5lZWQgYSBmYWxsYmFjayBmb3Igcm9vbWxlc3MgTWVzc2FnZVBhbmVscy5cbiAgICAgICAgdGhpcy5fc2hvd0hpZGRlbkV2ZW50cyA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJzaG93SGlkZGVuRXZlbnRzSW5UaW1lbGluZVwiKTtcbiAgICAgICAgdGhpcy50aHJlYWRzRW5hYmxlZCA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJmZWF0dXJlX3RocmVhZFwiKTtcblxuICAgICAgICB0aGlzLnNob3dUeXBpbmdOb3RpZmljYXRpb25zV2F0Y2hlclJlZiA9XG4gICAgICAgICAgICBTZXR0aW5nc1N0b3JlLndhdGNoU2V0dGluZyhcInNob3dUeXBpbmdOb3RpZmljYXRpb25zXCIsIG51bGwsIHRoaXMub25TaG93VHlwaW5nTm90aWZpY2F0aW9uc0NoYW5nZSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuY2FsY3VsYXRlUm9vbU1lbWJlcnNDb3VudCgpO1xuICAgICAgICB0aGlzLnByb3BzLnJvb20/LmN1cnJlbnRTdGF0ZS5vbihSb29tU3RhdGVFdmVudC5VcGRhdGUsIHRoaXMuY2FsY3VsYXRlUm9vbU1lbWJlcnNDb3VudCk7XG4gICAgICAgIHRoaXMuaXNNb3VudGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgdGhpcy5pc01vdW50ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5wcm9wcy5yb29tPy5jdXJyZW50U3RhdGUub2ZmKFJvb21TdGF0ZUV2ZW50LlVwZGF0ZSwgdGhpcy5jYWxjdWxhdGVSb29tTWVtYmVyc0NvdW50KTtcbiAgICAgICAgU2V0dGluZ3NTdG9yZS51bndhdGNoU2V0dGluZyh0aGlzLnNob3dUeXBpbmdOb3RpZmljYXRpb25zV2F0Y2hlclJlZik7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wcywgcHJldlN0YXRlKSB7XG4gICAgICAgIGlmIChwcmV2UHJvcHMubGF5b3V0ICE9PSB0aGlzLnByb3BzLmxheW91dCkge1xuICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGVSb29tTWVtYmVyc0NvdW50KCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJldlByb3BzLnJlYWRNYXJrZXJWaXNpYmxlICYmIHRoaXMucHJvcHMucmVhZE1hcmtlckV2ZW50SWQgIT09IHByZXZQcm9wcy5yZWFkTWFya2VyRXZlbnRJZCkge1xuICAgICAgICAgICAgY29uc3QgZ2hvc3RSZWFkTWFya2VycyA9IHRoaXMuc3RhdGUuZ2hvc3RSZWFkTWFya2VycztcbiAgICAgICAgICAgIGdob3N0UmVhZE1hcmtlcnMucHVzaChwcmV2UHJvcHMucmVhZE1hcmtlckV2ZW50SWQpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgZ2hvc3RSZWFkTWFya2VycyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcGVuZGluZ0VkaXRJdGVtID0gdGhpcy5wZW5kaW5nRWRpdEl0ZW07XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5lZGl0U3RhdGUgJiYgdGhpcy5wcm9wcy5yb29tICYmIHBlbmRpbmdFZGl0SXRlbSkge1xuICAgICAgICAgICAgY29uc3QgZXZlbnQgPSB0aGlzLnByb3BzLnJvb20uZmluZEV2ZW50QnlJZChwZW5kaW5nRWRpdEl0ZW0pO1xuICAgICAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLkVkaXRFdmVudCxcbiAgICAgICAgICAgICAgICBldmVudDogIWV2ZW50Py5pc1JlZGFjdGVkKCkgPyBldmVudCA6IG51bGwsXG4gICAgICAgICAgICAgICAgdGltZWxpbmVSZW5kZXJpbmdUeXBlOiB0aGlzLmNvbnRleHQudGltZWxpbmVSZW5kZXJpbmdUeXBlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHNob3VsZEhpZGVTZW5kZXIoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLnJvb20/LmdldEludml0ZWRBbmRKb2luZWRNZW1iZXJDb3VudCgpIDw9IDIgJiYgdGhpcy5wcm9wcy5sYXlvdXQgPT09IExheW91dC5CdWJibGU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVSb29tTWVtYmVyc0NvdW50ID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGhpZGVTZW5kZXI6IHRoaXMuc2hvdWxkSGlkZVNlbmRlcigpLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblNob3dUeXBpbmdOb3RpZmljYXRpb25zQ2hhbmdlID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHNob3dUeXBpbmdOb3RpZmljYXRpb25zOiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwic2hvd1R5cGluZ05vdGlmaWNhdGlvbnNcIiksXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvKiBnZXQgdGhlIERPTSBub2RlIHJlcHJlc2VudGluZyB0aGUgZ2l2ZW4gZXZlbnQgKi9cbiAgICBwdWJsaWMgZ2V0Tm9kZUZvckV2ZW50SWQoZXZlbnRJZDogc3RyaW5nKTogSFRNTEVsZW1lbnQge1xuICAgICAgICBpZiAoIXRoaXMuZXZlbnRUaWxlcykge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmV2ZW50VGlsZXNbZXZlbnRJZF0/LnJlZj8uY3VycmVudDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0VGlsZUZvckV2ZW50SWQoZXZlbnRJZDogc3RyaW5nKTogVW53cmFwcGVkRXZlbnRUaWxlIHtcbiAgICAgICAgaWYgKCF0aGlzLmV2ZW50VGlsZXMpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnRUaWxlc1tldmVudElkXTtcbiAgICB9XG5cbiAgICAvKiByZXR1cm4gdHJ1ZSBpZiB0aGUgY29udGVudCBpcyBmdWxseSBzY3JvbGxlZCBkb3duIHJpZ2h0IG5vdzsgZWxzZSBmYWxzZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgaXNBdEJvdHRvbSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2Nyb2xsUGFuZWwuY3VycmVudD8uaXNBdEJvdHRvbSgpO1xuICAgIH1cblxuICAgIC8qIGdldCB0aGUgY3VycmVudCBzY3JvbGwgc3RhdGUuIFNlZSBTY3JvbGxQYW5lbC5nZXRTY3JvbGxTdGF0ZSBmb3JcbiAgICAgKiBkZXRhaWxzLlxuICAgICAqXG4gICAgICogcmV0dXJucyBudWxsIGlmIHdlIGFyZSBub3QgbW91bnRlZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0U2Nyb2xsU3RhdGUoKTogSVNjcm9sbFN0YXRlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2Nyb2xsUGFuZWwuY3VycmVudD8uZ2V0U2Nyb2xsU3RhdGUoKSA/PyBudWxsO1xuICAgIH1cblxuICAgIC8vIHJldHVybnMgb25lIG9mOlxuICAgIC8vXG4gICAgLy8gIG51bGw6IHRoZXJlIGlzIG5vIHJlYWQgbWFya2VyXG4gICAgLy8gIC0xOiByZWFkIG1hcmtlciBpcyBhYm92ZSB0aGUgd2luZG93XG4gICAgLy8gICAwOiByZWFkIG1hcmtlciBpcyB3aXRoaW4gdGhlIHdpbmRvd1xuICAgIC8vICArMTogcmVhZCBtYXJrZXIgaXMgYmVsb3cgdGhlIHdpbmRvd1xuICAgIHB1YmxpYyBnZXRSZWFkTWFya2VyUG9zaXRpb24oKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3QgcmVhZE1hcmtlciA9IHRoaXMucmVhZE1hcmtlck5vZGUuY3VycmVudDtcbiAgICAgICAgY29uc3QgbWVzc2FnZVdyYXBwZXIgPSB0aGlzLnNjcm9sbFBhbmVsLmN1cnJlbnQ7XG5cbiAgICAgICAgaWYgKCFyZWFkTWFya2VyIHx8ICFtZXNzYWdlV3JhcHBlcikge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB3cmFwcGVyUmVjdCA9IChSZWFjdERPTS5maW5kRE9NTm9kZShtZXNzYWdlV3JhcHBlcikgYXMgSFRNTEVsZW1lbnQpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjb25zdCByZWFkTWFya2VyUmVjdCA9IHJlYWRNYXJrZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgLy8gdGhlIHJlYWQtbWFya2VyIHByZXRlbmRzIHRvIGhhdmUgemVybyBoZWlnaHQgd2hlbiBpdCBpcyBhY3R1YWxseVxuICAgICAgICAvLyB0d28gcGl4ZWxzIGhpZ2g7ICsyIGhlcmUgdG8gYWNjb3VudCBmb3IgdGhhdC5cbiAgICAgICAgaWYgKHJlYWRNYXJrZXJSZWN0LmJvdHRvbSArIDIgPCB3cmFwcGVyUmVjdC50b3ApIHtcbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfSBlbHNlIGlmIChyZWFkTWFya2VyUmVjdC50b3AgPCB3cmFwcGVyUmVjdC5ib3R0b20pIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBqdW1wIHRvIHRoZSB0b3Agb2YgdGhlIGNvbnRlbnQuXG4gICAgICovXG4gICAgcHVibGljIHNjcm9sbFRvVG9wKCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5zY3JvbGxQYW5lbC5jdXJyZW50KSB7XG4gICAgICAgICAgICB0aGlzLnNjcm9sbFBhbmVsLmN1cnJlbnQuc2Nyb2xsVG9Ub3AoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qIGp1bXAgdG8gdGhlIGJvdHRvbSBvZiB0aGUgY29udGVudC5cbiAgICAgKi9cbiAgICBwdWJsaWMgc2Nyb2xsVG9Cb3R0b20oKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLnNjcm9sbFBhbmVsLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsUGFuZWwuY3VycmVudC5zY3JvbGxUb0JvdHRvbSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGFnZSB1cC9kb3duLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG11bHQ6IC0xIHRvIHBhZ2UgdXAsICsxIHRvIHBhZ2UgZG93blxuICAgICAqL1xuICAgIHB1YmxpYyBzY3JvbGxSZWxhdGl2ZShtdWx0OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMuc2Nyb2xsUGFuZWwuY3VycmVudCkge1xuICAgICAgICAgICAgdGhpcy5zY3JvbGxQYW5lbC5jdXJyZW50LnNjcm9sbFJlbGF0aXZlKG11bHQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2Nyb2xsIHVwL2Rvd24gaW4gcmVzcG9uc2UgdG8gYSBzY3JvbGwga2V5XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0tleWJvYXJkRXZlbnR9IGV2OiB0aGUga2V5Ym9hcmQgZXZlbnQgdG8gaGFuZGxlXG4gICAgICovXG4gICAgcHVibGljIGhhbmRsZVNjcm9sbEtleShldjogS2V5Ym9hcmRFdmVudCk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5zY3JvbGxQYW5lbC5jdXJyZW50KSB7XG4gICAgICAgICAgICB0aGlzLnNjcm9sbFBhbmVsLmN1cnJlbnQuaGFuZGxlU2Nyb2xsS2V5KGV2KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qIGp1bXAgdG8gdGhlIGdpdmVuIGV2ZW50IGlkLlxuICAgICAqXG4gICAgICogb2Zmc2V0QmFzZSBnaXZlcyB0aGUgcmVmZXJlbmNlIHBvaW50IGZvciB0aGUgcGl4ZWxPZmZzZXQuIDAgbWVhbnMgdGhlXG4gICAgICogdG9wIG9mIHRoZSBjb250YWluZXIsIDEgbWVhbnMgdGhlIGJvdHRvbSwgYW5kIGZyYWN0aW9uYWwgdmFsdWVzIG1lYW5cbiAgICAgKiBzb21ld2hlcmUgaW4gdGhlIG1pZGRsZS4gSWYgb21pdHRlZCwgaXQgZGVmYXVsdHMgdG8gMC5cbiAgICAgKlxuICAgICAqIHBpeGVsT2Zmc2V0IGdpdmVzIHRoZSBudW1iZXIgb2YgcGl4ZWxzICphYm92ZSogdGhlIG9mZnNldEJhc2UgdGhhdCB0aGVcbiAgICAgKiBub2RlIChzcGVjaWZpY2FsbHksIHRoZSBib3R0b20gb2YgaXQpIHdpbGwgYmUgcG9zaXRpb25lZC4gSWYgb21pdHRlZCwgaXRcbiAgICAgKiBkZWZhdWx0cyB0byAwLlxuICAgICAqL1xuICAgIHB1YmxpYyBzY3JvbGxUb0V2ZW50KGV2ZW50SWQ6IHN0cmluZywgcGl4ZWxPZmZzZXQ6IG51bWJlciwgb2Zmc2V0QmFzZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLnNjcm9sbFBhbmVsLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsUGFuZWwuY3VycmVudC5zY3JvbGxUb1Rva2VuKGV2ZW50SWQsIHBpeGVsT2Zmc2V0LCBvZmZzZXRCYXNlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzY3JvbGxUb0V2ZW50SWZOZWVkZWQoZXZlbnRJZDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLmdldE5vZGVGb3JFdmVudElkKGV2ZW50SWQpO1xuICAgICAgICBpZiAobm9kZSkge1xuICAgICAgICAgICAgbm9kZS5zY3JvbGxJbnRvVmlldyh7XG4gICAgICAgICAgICAgICAgYmxvY2s6IFwibmVhcmVzdFwiLFxuICAgICAgICAgICAgICAgIGJlaGF2aW9yOiBcImluc3RhbnRcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1VubW91bnRpbmcgPSAoKTogYm9vbGVhbiA9PiB7XG4gICAgICAgIHJldHVybiAhdGhpcy5pc01vdW50ZWQ7XG4gICAgfTtcblxuICAgIHB1YmxpYyBnZXQgc2hvd0hpZGRlbkV2ZW50cygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGV4dD8uc2hvd0hpZGRlbkV2ZW50cyA/PyB0aGlzLl9zaG93SGlkZGVuRXZlbnRzO1xuICAgIH1cblxuICAgIC8vIFRPRE86IEltcGxlbWVudCBncmFudWxhciAocGVyLXJvb20pIGhpZGUgb3B0aW9uc1xuICAgIHB1YmxpYyBzaG91bGRTaG93RXZlbnQobXhFdjogTWF0cml4RXZlbnQsIGZvcmNlSGlkZUV2ZW50cyA9IGZhbHNlKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmhpZGVUaHJlYWRlZE1lc3NhZ2VzICYmIHRoaXMudGhyZWFkc0VuYWJsZWQgJiYgdGhpcy5wcm9wcy5yb29tKSB7XG4gICAgICAgICAgICBjb25zdCB7IHNob3VsZExpdmVJblJvb20gfSA9IHRoaXMucHJvcHMucm9vbS5ldmVudFNob3VsZExpdmVJbihteEV2LCB0aGlzLnByb3BzLmV2ZW50cyk7XG4gICAgICAgICAgICBpZiAoIXNob3VsZExpdmVJblJvb20pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoTWF0cml4Q2xpZW50UGVnLmdldCgpLmlzVXNlcklnbm9yZWQobXhFdi5nZXRTZW5kZXIoKSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gaWdub3JlZCA9IG5vIHNob3cgKG9ubHkgaGFwcGVucyBpZiB0aGUgaWdub3JlIGhhcHBlbnMgYWZ0ZXIgYW4gZXZlbnQgd2FzIHJlY2VpdmVkKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuc2hvd0hpZGRlbkV2ZW50cyAmJiAhZm9yY2VIaWRlRXZlbnRzKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaGF2ZVJlbmRlcmVyRm9yRXZlbnQobXhFdiwgdGhpcy5zaG93SGlkZGVuRXZlbnRzKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBubyB0aWxlID0gbm8gc2hvd1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWx3YXlzIHNob3cgaGlnaGxpZ2h0ZWQgZXZlbnRcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaGlnaGxpZ2h0ZWRFdmVudElkID09PSBteEV2LmdldElkKCkpIHJldHVybiB0cnVlO1xuXG4gICAgICAgIHJldHVybiAhc2hvdWxkSGlkZUV2ZW50KG14RXYsIHRoaXMuY29udGV4dCk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlYWRNYXJrZXJGb3JFdmVudChldmVudElkOiBzdHJpbmcsIGlzTGFzdEV2ZW50OiBib29sZWFuKTogUmVhY3ROb2RlIHtcbiAgICAgICAgY29uc3QgdmlzaWJsZSA9ICFpc0xhc3RFdmVudCAmJiB0aGlzLnByb3BzLnJlYWRNYXJrZXJWaXNpYmxlO1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLnJlYWRNYXJrZXJFdmVudElkID09PSBldmVudElkKSB7XG4gICAgICAgICAgICBsZXQgaHI7XG4gICAgICAgICAgICAvLyBpZiB0aGUgcmVhZCBtYXJrZXIgY29tZXMgYXQgdGhlIGVuZCBvZiB0aGUgdGltZWxpbmUgKGV4Y2VwdFxuICAgICAgICAgICAgLy8gZm9yIGxvY2FsIGVjaG9lcywgd2hpY2ggYXJlIGV4Y2x1ZGVkIGZyb20gUk1zLCBiZWNhdXNlIHRoZXlcbiAgICAgICAgICAgIC8vIGRvbid0IGhhdmUgdXNlZnVsIGV2ZW50IGlkcyksIHdlIGRvbid0IHdhbnQgdG8gc2hvdyBpdCwgYnV0XG4gICAgICAgICAgICAvLyB3ZSBzdGlsbCB3YW50IHRvIGNyZWF0ZSB0aGUgPGxpLz4gZm9yIGl0IHNvIHRoYXQgdGhlXG4gICAgICAgICAgICAvLyBhbGdvcml0aG1zIHdoaWNoIGRlcGVuZCBvbiBpdHMgcG9zaXRpb24gb24gdGhlIHNjcmVlbiBhcmVuJ3RcbiAgICAgICAgICAgIC8vIGNvbmZ1c2VkLlxuICAgICAgICAgICAgaWYgKHZpc2libGUpIHtcbiAgICAgICAgICAgICAgICBociA9IDxociBjbGFzc05hbWU9XCJteF9Sb29tVmlld19teVJlYWRNYXJrZXJcIlxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyBvcGFjaXR5OiAxLCB3aWR0aDogJzk5JScgfX1cbiAgICAgICAgICAgICAgICAvPjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8bGkga2V5PXtcInJlYWRNYXJrZXJfXCIrZXZlbnRJZH1cbiAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLnJlYWRNYXJrZXJOb2RlfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tVmlld19teVJlYWRNYXJrZXJfY29udGFpbmVyXCJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS1zY3JvbGwtdG9rZW5zPXtldmVudElkfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgeyBociB9XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5naG9zdFJlYWRNYXJrZXJzLmluY2x1ZGVzKGV2ZW50SWQpKSB7XG4gICAgICAgICAgICAvLyBXZSByZW5kZXIgJ2dob3N0JyByZWFkIG1hcmtlcnMgaW4gdGhlIERPTSB3aGlsZSB0aGV5XG4gICAgICAgICAgICAvLyB0cmFuc2l0aW9uIGF3YXkuIFRoaXMgYWxsb3dzIHRoZSBhY3R1YWwgcmVhZCBtYXJrZXJcbiAgICAgICAgICAgIC8vIHRvIGJlIGluIHRoZSByaWdodCBwbGFjZSBzdHJhaWdodCBhd2F5IHdpdGhvdXQgaGF2aW5nXG4gICAgICAgICAgICAvLyB0byB3YWl0IGZvciB0aGUgdHJhbnNpdGlvbiB0byBmaW5pc2guXG4gICAgICAgICAgICAvLyBUaGVyZSBhcmUgcHJvYmFibHkgbXVjaCBzaW1wbGVyIHdheXMgdG8gZG8gdGhpcyB0cmFuc2l0aW9uLFxuICAgICAgICAgICAgLy8gcG9zc2libHkgdXNpbmcgcmVhY3QtdHJhbnNpdGlvbi1ncm91cCB3aGljaCBoYW5kbGVzIGtlZXBpbmdcbiAgICAgICAgICAgIC8vIGVsZW1lbnRzIGluIHRoZSBET00gd2hpbHN0IHRoZXkgdHJhbnNpdGlvbiBvdXQsIGFsdGhvdWdoIG91clxuICAgICAgICAgICAgLy8gY2FzZSBpcyBhIGxpdHRsZSBtb3JlIGNvbXBsZXggYmVjYXVzZSBvbmx5IHNvbWUgb2YgdGhlIGl0ZW1zXG4gICAgICAgICAgICAvLyB0cmFuc2l0aW9uIChpZS4gdGhlIHJlYWQgbWFya2VycyBkbyBidXQgdGhlIGV2ZW50IHRpbGVzIGRvIG5vdClcbiAgICAgICAgICAgIC8vIGFuZCBUcmFuc2l0aW9uR3JvdXAgcmVxdWlyZXMgdGhhdCBhbGwgaXRzIGNoaWxkcmVuIGFyZSBUcmFuc2l0aW9ucy5cbiAgICAgICAgICAgIGNvbnN0IGhyID0gPGhyIGNsYXNzTmFtZT1cIm14X1Jvb21WaWV3X215UmVhZE1hcmtlclwiXG4gICAgICAgICAgICAgICAgcmVmPXt0aGlzLmNvbGxlY3RHaG9zdFJlYWRNYXJrZXJ9XG4gICAgICAgICAgICAgICAgb25UcmFuc2l0aW9uRW5kPXt0aGlzLm9uR2hvc3RUcmFuc2l0aW9uRW5kfVxuICAgICAgICAgICAgICAgIGRhdGEtZXZlbnRpZD17ZXZlbnRJZH1cbiAgICAgICAgICAgIC8+O1xuXG4gICAgICAgICAgICAvLyBnaXZlIGl0IGEga2V5IHdoaWNoIGRlcGVuZHMgb24gdGhlIGV2ZW50IGlkLiBUaGF0IHdpbGwgZW5zdXJlIHRoYXRcbiAgICAgICAgICAgIC8vIHdlIGdldCBhIG5ldyBET00gbm9kZSAocmVzdGFydGluZyB0aGUgYW5pbWF0aW9uKSB3aGVuIHRoZSBnaG9zdFxuICAgICAgICAgICAgLy8gbW92ZXMgdG8gYSBkaWZmZXJlbnQgZXZlbnQuXG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxsaVxuICAgICAgICAgICAgICAgICAgICBrZXk9e1wiX3JlYWR1cHRvZ2hvc3RfXCIrZXZlbnRJZH1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUm9vbVZpZXdfbXlSZWFkTWFya2VyX2NvbnRhaW5lclwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7IGhyIH1cbiAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHByaXZhdGUgY29sbGVjdEdob3N0UmVhZE1hcmtlciA9IChub2RlOiBIVE1MRWxlbWVudCk6IHZvaWQgPT4ge1xuICAgICAgICBpZiAobm9kZSkge1xuICAgICAgICAgICAgLy8gbm93IHRoZSBlbGVtZW50IGhhcyBhcHBlYXJlZCwgY2hhbmdlIHRoZSBzdHlsZSB3aGljaCB3aWxsIHRyaWdnZXIgdGhlIENTUyB0cmFuc2l0aW9uXG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIG5vZGUuc3R5bGUud2lkdGggPSAnMTAlJztcbiAgICAgICAgICAgICAgICBub2RlLnN0eWxlLm9wYWNpdHkgPSAnMCc7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uR2hvc3RUcmFuc2l0aW9uRW5kID0gKGV2OiBUcmFuc2l0aW9uRXZlbnQpOiB2b2lkID0+IHtcbiAgICAgICAgLy8gd2UgY2FuIG5vdyBjbGVhbiB1cCB0aGUgZ2hvc3QgZWxlbWVudFxuICAgICAgICBjb25zdCBmaW5pc2hlZEV2ZW50SWQgPSAoZXYudGFyZ2V0IGFzIEhUTUxFbGVtZW50KS5kYXRhc2V0LmV2ZW50aWQ7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZ2hvc3RSZWFkTWFya2VyczogdGhpcy5zdGF0ZS5naG9zdFJlYWRNYXJrZXJzLmZpbHRlcihlaWQgPT4gZWlkICE9PSBmaW5pc2hlZEV2ZW50SWQpLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBnZXROZXh0RXZlbnRJbmZvKGFycjogTWF0cml4RXZlbnRbXSwgaTogbnVtYmVyKTogeyBuZXh0RXZlbnQ6IE1hdHJpeEV2ZW50LCBuZXh0VGlsZTogTWF0cml4RXZlbnQgfSB7XG4gICAgICAgIGNvbnN0IG5leHRFdmVudCA9IGkgPCBhcnIubGVuZ3RoIC0gMVxuICAgICAgICAgICAgPyBhcnJbaSArIDFdXG4gICAgICAgICAgICA6IG51bGw7XG5cbiAgICAgICAgLy8gVGhlIG5leHQgZXZlbnQgd2l0aCB0aWxlIGlzIHVzZWQgdG8gdG8gZGV0ZXJtaW5lIHRoZSAnbGFzdCBzdWNjZXNzZnVsJyBmbGFnXG4gICAgICAgIC8vIHdoZW4gcmVuZGVyaW5nIHRoZSB0aWxlLiBUaGUgc2hvdWxkU2hvd0V2ZW50IGZ1bmN0aW9uIGlzIHByZXR0eSBxdWljayBhdCB3aGF0XG4gICAgICAgIC8vIGl0IGRvZXMsIHNvIHRoaXMgc2hvdWxkIGhhdmUgbm8gc2lnbmlmaWNhbnQgY29zdCBldmVuIHdoZW4gYSByb29tIGlzIHVzZWQgZm9yXG4gICAgICAgIC8vIG5vdC1jaGF0IHB1cnBvc2VzLlxuICAgICAgICBjb25zdCBuZXh0VGlsZSA9IGFyci5zbGljZShpICsgMSkuZmluZChlID0+IHRoaXMuc2hvdWxkU2hvd0V2ZW50KGUpKTtcblxuICAgICAgICByZXR1cm4geyBuZXh0RXZlbnQsIG5leHRUaWxlIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXQgcGVuZGluZ0VkaXRJdGVtKCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5yb29tKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShlZGl0b3JSb29tS2V5KHRoaXMucHJvcHMucm9vbS5yb29tSWQsIHRoaXMuY29udGV4dC50aW1lbGluZVJlbmRlcmluZ1R5cGUpKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGdldEV2ZW50VGlsZXMoKTogUmVhY3ROb2RlW10ge1xuICAgICAgICBsZXQgaTtcblxuICAgICAgICAvLyBmaXJzdCBmaWd1cmUgb3V0IHdoaWNoIGlzIHRoZSBsYXN0IGV2ZW50IGluIHRoZSBsaXN0IHdoaWNoIHdlJ3JlXG4gICAgICAgIC8vIGFjdHVhbGx5IGdvaW5nIHRvIHNob3c7IHRoaXMgYWxsb3dzIHVzIHRvIGJlaGF2ZSBzbGlnaHRseVxuICAgICAgICAvLyBkaWZmZXJlbnRseSBmb3IgdGhlIGxhc3QgZXZlbnQgaW4gdGhlIGxpc3QuIChlZyBzaG93IHRpbWVzdGFtcClcbiAgICAgICAgLy9cbiAgICAgICAgLy8gd2UgYWxzbyBuZWVkIHRvIGZpZ3VyZSBvdXQgd2hpY2ggaXMgdGhlIGxhc3QgZXZlbnQgd2Ugc2hvdyB3aGljaCBpc24ndFxuICAgICAgICAvLyBhIGxvY2FsIGVjaG8sIHRvIG1hbmFnZSB0aGUgcmVhZC1tYXJrZXIuXG4gICAgICAgIGxldCBsYXN0U2hvd25FdmVudDtcblxuICAgICAgICBsZXQgbGFzdFNob3duTm9uTG9jYWxFY2hvSW5kZXggPSAtMTtcbiAgICAgICAgZm9yIChpID0gdGhpcy5wcm9wcy5ldmVudHMubGVuZ3RoLTE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBjb25zdCBteEV2ID0gdGhpcy5wcm9wcy5ldmVudHNbaV07XG4gICAgICAgICAgICBpZiAoIXRoaXMuc2hvdWxkU2hvd0V2ZW50KG14RXYpKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChsYXN0U2hvd25FdmVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbGFzdFNob3duRXZlbnQgPSBteEV2O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobXhFdi5zdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAvLyB0aGlzIGlzIGEgbG9jYWwgZWNob1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsYXN0U2hvd25Ob25Mb2NhbEVjaG9JbmRleCA9IGk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJldCA9IFtdO1xuXG4gICAgICAgIGxldCBwcmV2RXZlbnQgPSBudWxsOyAvLyB0aGUgbGFzdCBldmVudCB3ZSBzaG93ZWRcblxuICAgICAgICAvLyBOb3RlOiB0aGUgRXZlbnRUaWxlIG1pZ2h0IHN0aWxsIHJlbmRlciBhIFwic2VudC9zZW5kaW5nIHJlY2VpcHRcIiBpbmRlcGVuZGVudCBvZlxuICAgICAgICAvLyB0aGlzIGluZm9ybWF0aW9uLiBXaGVuIG5vdCBwcm92aWRpbmcgcmVhZCByZWNlaXB0IGluZm9ybWF0aW9uLCB0aGUgdGlsZSBpcyBsaWtlbHlcbiAgICAgICAgLy8gdG8gYXNzdW1lIHRoYXQgc2VudCByZWNlaXB0cyBhcmUgdG8gYmUgc2hvd24gbW9yZSBvZnRlbi5cbiAgICAgICAgdGhpcy5yZWFkUmVjZWlwdHNCeUV2ZW50ID0ge307XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnNob3dSZWFkUmVjZWlwdHMpIHtcbiAgICAgICAgICAgIHRoaXMucmVhZFJlY2VpcHRzQnlFdmVudCA9IHRoaXMuZ2V0UmVhZFJlY2VpcHRzQnlTaG93bkV2ZW50KCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZ3JvdXBlcjogQmFzZUdyb3VwZXIgPSBudWxsO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLnByb3BzLmV2ZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgbXhFdiA9IHRoaXMucHJvcHMuZXZlbnRzW2ldO1xuICAgICAgICAgICAgY29uc3QgZXZlbnRJZCA9IG14RXYuZ2V0SWQoKTtcbiAgICAgICAgICAgIGNvbnN0IGxhc3QgPSAobXhFdiA9PT0gbGFzdFNob3duRXZlbnQpO1xuICAgICAgICAgICAgY29uc3QgeyBuZXh0RXZlbnQsIG5leHRUaWxlIH0gPSB0aGlzLmdldE5leHRFdmVudEluZm8odGhpcy5wcm9wcy5ldmVudHMsIGkpO1xuXG4gICAgICAgICAgICBpZiAoZ3JvdXBlcikge1xuICAgICAgICAgICAgICAgIGlmIChncm91cGVyLnNob3VsZEdyb3VwKG14RXYpKSB7XG4gICAgICAgICAgICAgICAgICAgIGdyb3VwZXIuYWRkKG14RXYpO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBub3QgcGFydCBvZiBncm91cCwgc28gZ2V0IHRoZSBncm91cCB0aWxlcywgY2xvc2UgdGhlXG4gICAgICAgICAgICAgICAgICAgIC8vIGdyb3VwLCBhbmQgY29udGludWUgbGlrZSBhIG5vcm1hbCBldmVudFxuICAgICAgICAgICAgICAgICAgICByZXQucHVzaCguLi5ncm91cGVyLmdldFRpbGVzKCkpO1xuICAgICAgICAgICAgICAgICAgICBwcmV2RXZlbnQgPSBncm91cGVyLmdldE5ld1ByZXZFdmVudCgpO1xuICAgICAgICAgICAgICAgICAgICBncm91cGVyID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgR3JvdXBlciBvZiBncm91cGVycykge1xuICAgICAgICAgICAgICAgIGlmIChHcm91cGVyLmNhblN0YXJ0R3JvdXAodGhpcywgbXhFdikgJiYgIXRoaXMucHJvcHMuZGlzYWJsZUdyb3VwaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIGdyb3VwZXIgPSBuZXcgR3JvdXBlcih0aGlzLCBteEV2LCBwcmV2RXZlbnQsIGxhc3RTaG93bkV2ZW50LCBuZXh0RXZlbnQsIG5leHRUaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7IC8vIGJyZWFrIG9uIGZpcnN0IGdyb3VwZXJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghZ3JvdXBlcikge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNob3VsZFNob3dFdmVudChteEV2KSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBtYWtlIHN1cmUgd2UgdW5wYWNrIHRoZSBhcnJheSByZXR1cm5lZCBieSBnZXRUaWxlc0ZvckV2ZW50LFxuICAgICAgICAgICAgICAgICAgICAvLyBvdGhlcndpc2UgUmVhY3Qgd2lsbCBhdXRvLWdlbmVyYXRlIGtleXMsIGFuZCB3ZSB3aWxsIGVuZCB1cFxuICAgICAgICAgICAgICAgICAgICAvLyByZXBsYWNpbmcgYWxsIHRoZSBET00gZWxlbWVudHMgZXZlcnkgdGltZSB3ZSBwYWdpbmF0ZS5cbiAgICAgICAgICAgICAgICAgICAgcmV0LnB1c2goLi4udGhpcy5nZXRUaWxlc0ZvckV2ZW50KHByZXZFdmVudCwgbXhFdiwgbGFzdCwgZmFsc2UsIG5leHRFdmVudCwgbmV4dFRpbGUpKTtcbiAgICAgICAgICAgICAgICAgICAgcHJldkV2ZW50ID0gbXhFdjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCByZWFkTWFya2VyID0gdGhpcy5yZWFkTWFya2VyRm9yRXZlbnQoZXZlbnRJZCwgaSA+PSBsYXN0U2hvd25Ob25Mb2NhbEVjaG9JbmRleCk7XG4gICAgICAgICAgICAgICAgaWYgKHJlYWRNYXJrZXIpIHJldC5wdXNoKHJlYWRNYXJrZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGdyb3VwZXIpIHtcbiAgICAgICAgICAgIHJldC5wdXNoKC4uLmdyb3VwZXIuZ2V0VGlsZXMoKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRUaWxlc0ZvckV2ZW50KFxuICAgICAgICBwcmV2RXZlbnQ6IE1hdHJpeEV2ZW50LFxuICAgICAgICBteEV2OiBNYXRyaXhFdmVudCxcbiAgICAgICAgbGFzdCA9IGZhbHNlLFxuICAgICAgICBpc0dyb3VwZWQgPSBmYWxzZSxcbiAgICAgICAgbmV4dEV2ZW50PzogTWF0cml4RXZlbnQsXG4gICAgICAgIG5leHRFdmVudFdpdGhUaWxlPzogTWF0cml4RXZlbnQsXG4gICAgKTogUmVhY3ROb2RlW10ge1xuICAgICAgICBjb25zdCByZXQgPSBbXTtcblxuICAgICAgICBjb25zdCBpc0VkaXRpbmcgPSB0aGlzLnByb3BzLmVkaXRTdGF0ZT8uZ2V0RXZlbnQoKS5nZXRJZCgpID09PSBteEV2LmdldElkKCk7XG4gICAgICAgIC8vIGxvY2FsIGVjaG9lcyBoYXZlIGEgZmFrZSBkYXRlLCB3aGljaCBjb3VsZCBldmVuIGJlIHllc3RlcmRheS4gVHJlYXQgdGhlbSBhcyAndG9kYXknIGZvciB0aGUgZGF0ZSBzZXBhcmF0b3JzLlxuICAgICAgICBsZXQgdHMxID0gbXhFdi5nZXRUcygpO1xuICAgICAgICBsZXQgZXZlbnREYXRlID0gbXhFdi5nZXREYXRlKCk7XG4gICAgICAgIGlmIChteEV2LnN0YXR1cykge1xuICAgICAgICAgICAgZXZlbnREYXRlID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIHRzMSA9IGV2ZW50RGF0ZS5nZXRUaW1lKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBkbyB3ZSBuZWVkIGEgZGF0ZSBzZXBhcmF0b3Igc2luY2UgdGhlIGxhc3QgZXZlbnQ/XG4gICAgICAgIGNvbnN0IHdhbnRzRGF0ZVNlcGFyYXRvciA9IHRoaXMud2FudHNEYXRlU2VwYXJhdG9yKHByZXZFdmVudCwgZXZlbnREYXRlKTtcbiAgICAgICAgaWYgKHdhbnRzRGF0ZVNlcGFyYXRvciAmJiAhaXNHcm91cGVkICYmIHRoaXMucHJvcHMucm9vbSkge1xuICAgICAgICAgICAgY29uc3QgZGF0ZVNlcGFyYXRvciA9IChcbiAgICAgICAgICAgICAgICA8bGkga2V5PXt0czF9PlxuICAgICAgICAgICAgICAgICAgICA8RGF0ZVNlcGFyYXRvciBrZXk9e3RzMX0gcm9vbUlkPXt0aGlzLnByb3BzLnJvb20ucm9vbUlkfSB0cz17dHMxfSAvPlxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0LnB1c2goZGF0ZVNlcGFyYXRvcik7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbGFzdEluU2VjdGlvbiA9IHRydWU7XG4gICAgICAgIGlmIChuZXh0RXZlbnRXaXRoVGlsZSkge1xuICAgICAgICAgICAgY29uc3QgbmV4dEV2ID0gbmV4dEV2ZW50V2l0aFRpbGU7XG4gICAgICAgICAgICBjb25zdCB3aWxsV2FudERhdGVTZXBhcmF0b3IgPSB0aGlzLndhbnRzRGF0ZVNlcGFyYXRvcihteEV2LCBuZXh0RXYuZ2V0RGF0ZSgpIHx8IG5ldyBEYXRlKCkpO1xuICAgICAgICAgICAgbGFzdEluU2VjdGlvbiA9IHdpbGxXYW50RGF0ZVNlcGFyYXRvciB8fFxuICAgICAgICAgICAgICAgIG14RXYuZ2V0U2VuZGVyKCkgIT09IG5leHRFdi5nZXRTZW5kZXIoKSB8fFxuICAgICAgICAgICAgICAgIGdldEV2ZW50RGlzcGxheUluZm8obmV4dEV2LCB0aGlzLnNob3dIaWRkZW5FdmVudHMpLmlzSW5mb01lc3NhZ2UgfHxcbiAgICAgICAgICAgICAgICAhc2hvdWxkRm9ybUNvbnRpbnVhdGlvbihcbiAgICAgICAgICAgICAgICAgICAgbXhFdiwgbmV4dEV2LCB0aGlzLnNob3dIaWRkZW5FdmVudHMsIHRoaXMudGhyZWFkc0VuYWJsZWQsIHRoaXMuY29udGV4dC50aW1lbGluZVJlbmRlcmluZ1R5cGUsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlzIHRoaXMgYSBjb250aW51YXRpb24gb2YgdGhlIHByZXZpb3VzIG1lc3NhZ2U/XG4gICAgICAgIGNvbnN0IGNvbnRpbnVhdGlvbiA9ICF3YW50c0RhdGVTZXBhcmF0b3IgJiZcbiAgICAgICAgICAgIHNob3VsZEZvcm1Db250aW51YXRpb24oXG4gICAgICAgICAgICAgICAgcHJldkV2ZW50LCBteEV2LCB0aGlzLnNob3dIaWRkZW5FdmVudHMsIHRoaXMudGhyZWFkc0VuYWJsZWQsIHRoaXMuY29udGV4dC50aW1lbGluZVJlbmRlcmluZ1R5cGUsXG4gICAgICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IGV2ZW50SWQgPSBteEV2LmdldElkKCk7XG4gICAgICAgIGNvbnN0IGhpZ2hsaWdodCA9IChldmVudElkID09PSB0aGlzLnByb3BzLmhpZ2hsaWdodGVkRXZlbnRJZCk7XG5cbiAgICAgICAgY29uc3QgcmVhZFJlY2VpcHRzID0gdGhpcy5yZWFkUmVjZWlwdHNCeUV2ZW50W2V2ZW50SWRdO1xuXG4gICAgICAgIGxldCBpc0xhc3RTdWNjZXNzZnVsID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IGlzU2VudFN0YXRlID0gcyA9PiAhcyB8fCBzID09PSAnc2VudCc7XG4gICAgICAgIGNvbnN0IGlzU2VudCA9IGlzU2VudFN0YXRlKG14RXYuZ2V0QXNzb2NpYXRlZFN0YXR1cygpKTtcbiAgICAgICAgY29uc3QgaGFzTmV4dEV2ZW50ID0gbmV4dEV2ZW50ICYmIHRoaXMuc2hvdWxkU2hvd0V2ZW50KG5leHRFdmVudCk7XG4gICAgICAgIGlmICghaGFzTmV4dEV2ZW50ICYmIGlzU2VudCkge1xuICAgICAgICAgICAgaXNMYXN0U3VjY2Vzc2Z1bCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAoaGFzTmV4dEV2ZW50ICYmIGlzU2VudCAmJiAhaXNTZW50U3RhdGUobmV4dEV2ZW50LmdldEFzc29jaWF0ZWRTdGF0dXMoKSkpIHtcbiAgICAgICAgICAgIGlzTGFzdFN1Y2Nlc3NmdWwgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhpcyBpcyBhIGJpdCBudWFuY2VkLCBidXQgaWYgb3VyIG5leHQgZXZlbnQgaXMgaGlkZGVuIGJ1dCBhIGZ1dHVyZSBldmVudCBpcyBub3RcbiAgICAgICAgLy8gaGlkZGVuIHRoZW4gd2UncmUgbm90IHRoZSBsYXN0IHN1Y2Nlc3NmdWwuXG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIG5leHRFdmVudFdpdGhUaWxlICYmXG4gICAgICAgICAgICBuZXh0RXZlbnRXaXRoVGlsZSAhPT0gbmV4dEV2ZW50ICYmXG4gICAgICAgICAgICBpc1NlbnRTdGF0ZShuZXh0RXZlbnRXaXRoVGlsZS5nZXRBc3NvY2lhdGVkU3RhdHVzKCkpXG4gICAgICAgICkge1xuICAgICAgICAgICAgaXNMYXN0U3VjY2Vzc2Z1bCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gV2Ugb25seSB3YW50IHRvIGNvbnNpZGVyIFwibGFzdCBzdWNjZXNzZnVsXCIgaWYgdGhlIGV2ZW50IGlzIHNlbnQgYnkgdXMsIG90aGVyd2lzZSBvZiBjb3Vyc2VcbiAgICAgICAgLy8gaXQncyBzdWNjZXNzZnVsOiB3ZSByZWNlaXZlZCBpdC5cbiAgICAgICAgaXNMYXN0U3VjY2Vzc2Z1bCA9IGlzTGFzdFN1Y2Nlc3NmdWwgJiYgbXhFdi5nZXRTZW5kZXIoKSA9PT0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpO1xuXG4gICAgICAgIGNvbnN0IGNhbGxFdmVudEdyb3VwZXIgPSB0aGlzLnByb3BzLmNhbGxFdmVudEdyb3VwZXJzLmdldChteEV2LmdldENvbnRlbnQoKS5jYWxsX2lkKTtcbiAgICAgICAgLy8gdXNlIHR4bklkIGFzIGtleSBpZiBhdmFpbGFibGUgc28gdGhhdCB3ZSBkb24ndCByZW1vdW50IGR1cmluZyBzZW5kaW5nXG4gICAgICAgIHJldC5wdXNoKFxuICAgICAgICAgICAgPEV2ZW50VGlsZVxuICAgICAgICAgICAgICAgIGtleT17bXhFdi5nZXRUeG5JZCgpIHx8IGV2ZW50SWR9XG4gICAgICAgICAgICAgICAgYXM9XCJsaVwiXG4gICAgICAgICAgICAgICAgcmVmPXt0aGlzLmNvbGxlY3RFdmVudFRpbGUuYmluZCh0aGlzLCBldmVudElkKX1cbiAgICAgICAgICAgICAgICBhbHdheXNTaG93VGltZXN0YW1wcz17dGhpcy5wcm9wcy5hbHdheXNTaG93VGltZXN0YW1wc31cbiAgICAgICAgICAgICAgICBteEV2ZW50PXtteEV2fVxuICAgICAgICAgICAgICAgIGNvbnRpbnVhdGlvbj17Y29udGludWF0aW9ufVxuICAgICAgICAgICAgICAgIGlzUmVkYWN0ZWQ9e214RXYuaXNSZWRhY3RlZCgpfVxuICAgICAgICAgICAgICAgIHJlcGxhY2luZ0V2ZW50SWQ9e214RXYucmVwbGFjaW5nRXZlbnRJZCgpfVxuICAgICAgICAgICAgICAgIGVkaXRTdGF0ZT17aXNFZGl0aW5nICYmIHRoaXMucHJvcHMuZWRpdFN0YXRlfVxuICAgICAgICAgICAgICAgIG9uSGVpZ2h0Q2hhbmdlZD17dGhpcy5vbkhlaWdodENoYW5nZWR9XG4gICAgICAgICAgICAgICAgcmVhZFJlY2VpcHRzPXtyZWFkUmVjZWlwdHN9XG4gICAgICAgICAgICAgICAgcmVhZFJlY2VpcHRNYXA9e3RoaXMucmVhZFJlY2VpcHRNYXB9XG4gICAgICAgICAgICAgICAgc2hvd1VybFByZXZpZXc9e3RoaXMucHJvcHMuc2hvd1VybFByZXZpZXd9XG4gICAgICAgICAgICAgICAgY2hlY2tVbm1vdW50aW5nPXt0aGlzLmlzVW5tb3VudGluZ31cbiAgICAgICAgICAgICAgICBldmVudFNlbmRTdGF0dXM9e214RXYuZ2V0QXNzb2NpYXRlZFN0YXR1cygpfVxuICAgICAgICAgICAgICAgIGlzVHdlbHZlSG91cj17dGhpcy5wcm9wcy5pc1R3ZWx2ZUhvdXJ9XG4gICAgICAgICAgICAgICAgcGVybWFsaW5rQ3JlYXRvcj17dGhpcy5wcm9wcy5wZXJtYWxpbmtDcmVhdG9yfVxuICAgICAgICAgICAgICAgIGxhc3Q9e2xhc3R9XG4gICAgICAgICAgICAgICAgbGFzdEluU2VjdGlvbj17bGFzdEluU2VjdGlvbn1cbiAgICAgICAgICAgICAgICBsYXN0U3VjY2Vzc2Z1bD17aXNMYXN0U3VjY2Vzc2Z1bH1cbiAgICAgICAgICAgICAgICBpc1NlbGVjdGVkRXZlbnQ9e2hpZ2hsaWdodH1cbiAgICAgICAgICAgICAgICBnZXRSZWxhdGlvbnNGb3JFdmVudD17dGhpcy5wcm9wcy5nZXRSZWxhdGlvbnNGb3JFdmVudH1cbiAgICAgICAgICAgICAgICBzaG93UmVhY3Rpb25zPXt0aGlzLnByb3BzLnNob3dSZWFjdGlvbnN9XG4gICAgICAgICAgICAgICAgbGF5b3V0PXt0aGlzLnByb3BzLmxheW91dH1cbiAgICAgICAgICAgICAgICBzaG93UmVhZFJlY2VpcHRzPXt0aGlzLnByb3BzLnNob3dSZWFkUmVjZWlwdHN9XG4gICAgICAgICAgICAgICAgY2FsbEV2ZW50R3JvdXBlcj17Y2FsbEV2ZW50R3JvdXBlcn1cbiAgICAgICAgICAgICAgICBoaWRlU2VuZGVyPXt0aGlzLnN0YXRlLmhpZGVTZW5kZXJ9XG4gICAgICAgICAgICAvPixcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIHB1YmxpYyB3YW50c0RhdGVTZXBhcmF0b3IocHJldkV2ZW50OiBNYXRyaXhFdmVudCwgbmV4dEV2ZW50RGF0ZTogRGF0ZSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodGhpcy5jb250ZXh0LnRpbWVsaW5lUmVuZGVyaW5nVHlwZSA9PT0gVGltZWxpbmVSZW5kZXJpbmdUeXBlLlRocmVhZHNMaXN0KSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByZXZFdmVudCA9PSBudWxsKSB7XG4gICAgICAgICAgICAvLyBmaXJzdCBldmVudCBpbiB0aGUgcGFuZWw6IGRlcGVuZHMgaWYgd2UgY291bGQgYmFjay1wYWdpbmF0ZSBmcm9tXG4gICAgICAgICAgICAvLyBoZXJlLlxuICAgICAgICAgICAgcmV0dXJuICF0aGlzLnByb3BzLmNhbkJhY2tQYWdpbmF0ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gd2FudHNEYXRlU2VwYXJhdG9yKHByZXZFdmVudC5nZXREYXRlKCksIG5leHRFdmVudERhdGUpO1xuICAgIH1cblxuICAgIC8vIEdldCBhIGxpc3Qgb2YgcmVhZCByZWNlaXB0cyB0aGF0IHNob3VsZCBiZSBzaG93biBuZXh0IHRvIHRoaXMgZXZlbnRcbiAgICAvLyBSZWNlaXB0cyBhcmUgb2JqZWN0cyB3aGljaCBoYXZlIGEgJ3VzZXJJZCcsICdyb29tTWVtYmVyJyBhbmQgJ3RzJy5cbiAgICBwcml2YXRlIGdldFJlYWRSZWNlaXB0c0ZvckV2ZW50KGV2ZW50OiBNYXRyaXhFdmVudCk6IElSZWFkUmVjZWlwdFByb3BzW10ge1xuICAgICAgICBjb25zdCBteVVzZXJJZCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5jcmVkZW50aWFscy51c2VySWQ7XG5cbiAgICAgICAgLy8gZ2V0IGxpc3Qgb2YgcmVhZCByZWNlaXB0cywgc29ydGVkIG1vc3QgcmVjZW50IGZpcnN0XG4gICAgICAgIGNvbnN0IHsgcm9vbSB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgaWYgKCFyb29tKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZWNlaXB0czogSVJlYWRSZWNlaXB0UHJvcHNbXSA9IFtdO1xuICAgICAgICByb29tLmdldFJlY2VpcHRzRm9yRXZlbnQoZXZlbnQpLmZvckVhY2goKHIpID0+IHtcbiAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAhci51c2VySWQgfHxcbiAgICAgICAgICAgICAgICAhaXNTdXBwb3J0ZWRSZWNlaXB0VHlwZShyLnR5cGUpIHx8XG4gICAgICAgICAgICAgICAgci51c2VySWQgPT09IG15VXNlcklkXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICByZXR1cm47IC8vIGlnbm9yZSBub24tcmVhZCByZWNlaXB0cyBhbmQgcmVjZWlwdHMgZnJvbSBzZWxmLlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKE1hdHJpeENsaWVudFBlZy5nZXQoKS5pc1VzZXJJZ25vcmVkKHIudXNlcklkKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjsgLy8gaWdub3JlIGlnbm9yZWQgdXNlcnNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG1lbWJlciA9IHJvb20uZ2V0TWVtYmVyKHIudXNlcklkKTtcbiAgICAgICAgICAgIHJlY2VpcHRzLnB1c2goe1xuICAgICAgICAgICAgICAgIHVzZXJJZDogci51c2VySWQsXG4gICAgICAgICAgICAgICAgcm9vbU1lbWJlcjogbWVtYmVyLFxuICAgICAgICAgICAgICAgIHRzOiByLmRhdGEgPyByLmRhdGEudHMgOiAwLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmVjZWlwdHM7XG4gICAgfVxuXG4gICAgLy8gR2V0IGFuIG9iamVjdCB0aGF0IG1hcHMgZnJvbSBldmVudCBJRCB0byBhIGxpc3Qgb2YgcmVhZCByZWNlaXB0cyB0aGF0XG4gICAgLy8gc2hvdWxkIGJlIHNob3duIG5leHQgdG8gdGhhdCBldmVudC4gSWYgYSBoaWRkZW4gZXZlbnQgaGFzIHJlYWQgcmVjZWlwdHMsXG4gICAgLy8gdGhleSBhcmUgZm9sZGVkIGludG8gdGhlIHJlY2VpcHRzIG9mIHRoZSBsYXN0IHNob3duIGV2ZW50LlxuICAgIHByaXZhdGUgZ2V0UmVhZFJlY2VpcHRzQnlTaG93bkV2ZW50KCk6IFJlY29yZDxzdHJpbmcsIElSZWFkUmVjZWlwdFByb3BzW10+IHtcbiAgICAgICAgY29uc3QgcmVjZWlwdHNCeUV2ZW50ID0ge307XG4gICAgICAgIGNvbnN0IHJlY2VpcHRzQnlVc2VySWQgPSB7fTtcblxuICAgICAgICBsZXQgbGFzdFNob3duRXZlbnRJZDtcbiAgICAgICAgZm9yIChjb25zdCBldmVudCBvZiB0aGlzLnByb3BzLmV2ZW50cykge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2hvdWxkU2hvd0V2ZW50KGV2ZW50KSkge1xuICAgICAgICAgICAgICAgIGxhc3RTaG93bkV2ZW50SWQgPSBldmVudC5nZXRJZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFsYXN0U2hvd25FdmVudElkKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGV4aXN0aW5nUmVjZWlwdHMgPSByZWNlaXB0c0J5RXZlbnRbbGFzdFNob3duRXZlbnRJZF0gfHwgW107XG4gICAgICAgICAgICBjb25zdCBuZXdSZWNlaXB0cyA9IHRoaXMuZ2V0UmVhZFJlY2VpcHRzRm9yRXZlbnQoZXZlbnQpO1xuICAgICAgICAgICAgcmVjZWlwdHNCeUV2ZW50W2xhc3RTaG93bkV2ZW50SWRdID0gZXhpc3RpbmdSZWNlaXB0cy5jb25jYXQobmV3UmVjZWlwdHMpO1xuXG4gICAgICAgICAgICAvLyBSZWNvcmQgdGhlc2UgcmVjZWlwdHMgYWxvbmcgd2l0aCB0aGVpciBsYXN0IHNob3duIGV2ZW50IElEIGZvclxuICAgICAgICAgICAgLy8gZWFjaCBhc3NvY2lhdGVkIHVzZXIgSUQuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJlY2VpcHQgb2YgbmV3UmVjZWlwdHMpIHtcbiAgICAgICAgICAgICAgICByZWNlaXB0c0J5VXNlcklkW3JlY2VpcHQudXNlcklkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgbGFzdFNob3duRXZlbnRJZCxcbiAgICAgICAgICAgICAgICAgICAgcmVjZWlwdCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gSXQncyBwb3NzaWJsZSBpbiBzb21lIGNhc2VzIChmb3IgZXhhbXBsZSwgd2hlbiBhIHJlYWQgcmVjZWlwdFxuICAgICAgICAvLyBhZHZhbmNlcyBiZWZvcmUgd2UgaGF2ZSBwYWdpbmF0ZWQgaW4gdGhlIG5ldyBldmVudCB0aGF0IGl0J3MgbWFya2luZ1xuICAgICAgICAvLyByZWNlaXZlZCkgdGhhdCB3ZSBjYW4gdGVtcG9yYXJpbHkgbm90IGhhdmUgYSBtYXRjaGluZyBldmVudCBmb3JcbiAgICAgICAgLy8gc29tZW9uZSB3aGljaCBoYWQgb25lIGluIHRoZSBsYXN0LiBCeSBsb29raW5nIHRocm91Z2ggb3VyIHByZXZpb3VzXG4gICAgICAgIC8vIG1hcHBpbmcgb2YgcmVjZWlwdHMgYnkgdXNlciBJRCwgd2UgY2FuIGNvdmVyIHJlY292ZXIgYW55IHJlY2VpcHRzXG4gICAgICAgIC8vIHRoYXQgd291bGQgaGF2ZSBiZWVuIGxvc3QgYnkgdXNpbmcgdGhlIHNhbWUgZXZlbnQgSUQgZnJvbSBsYXN0IHRpbWUuXG4gICAgICAgIGZvciAoY29uc3QgdXNlcklkIGluIHRoaXMucmVhZFJlY2VpcHRzQnlVc2VySWQpIHtcbiAgICAgICAgICAgIGlmIChyZWNlaXB0c0J5VXNlcklkW3VzZXJJZF0pIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHsgbGFzdFNob3duRXZlbnRJZCwgcmVjZWlwdCB9ID0gdGhpcy5yZWFkUmVjZWlwdHNCeVVzZXJJZFt1c2VySWRdO1xuICAgICAgICAgICAgY29uc3QgZXhpc3RpbmdSZWNlaXB0cyA9IHJlY2VpcHRzQnlFdmVudFtsYXN0U2hvd25FdmVudElkXSB8fCBbXTtcbiAgICAgICAgICAgIHJlY2VpcHRzQnlFdmVudFtsYXN0U2hvd25FdmVudElkXSA9IGV4aXN0aW5nUmVjZWlwdHMuY29uY2F0KHJlY2VpcHQpO1xuICAgICAgICAgICAgcmVjZWlwdHNCeVVzZXJJZFt1c2VySWRdID0geyBsYXN0U2hvd25FdmVudElkLCByZWNlaXB0IH07XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZWFkUmVjZWlwdHNCeVVzZXJJZCA9IHJlY2VpcHRzQnlVc2VySWQ7XG5cbiAgICAgICAgLy8gQWZ0ZXIgZ3JvdXBpbmcgcmVjZWlwdHMgYnkgc2hvd24gZXZlbnRzLCBkbyBhbm90aGVyIHBhc3MgdG8gc29ydCBlYWNoXG4gICAgICAgIC8vIHJlY2VpcHQgbGlzdC5cbiAgICAgICAgZm9yIChjb25zdCBldmVudElkIGluIHJlY2VpcHRzQnlFdmVudCkge1xuICAgICAgICAgICAgcmVjZWlwdHNCeUV2ZW50W2V2ZW50SWRdLnNvcnQoKHIxLCByMikgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByMi50cyAtIHIxLnRzO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVjZWlwdHNCeUV2ZW50O1xuICAgIH1cblxuICAgIHByaXZhdGUgY29sbGVjdEV2ZW50VGlsZSA9IChldmVudElkOiBzdHJpbmcsIG5vZGU6IFVud3JhcHBlZEV2ZW50VGlsZSk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLmV2ZW50VGlsZXNbZXZlbnRJZF0gPSBub2RlO1xuICAgIH07XG5cbiAgICAvLyBvbmNlIGR5bmFtaWMgY29udGVudCBpbiB0aGUgZXZlbnRzIGxvYWQsIG1ha2UgdGhlIHNjcm9sbFBhbmVsIGNoZWNrIHRoZVxuICAgIC8vIHNjcm9sbCBvZmZzZXRzLlxuICAgIHB1YmxpYyBvbkhlaWdodENoYW5nZWQgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IHNjcm9sbFBhbmVsID0gdGhpcy5zY3JvbGxQYW5lbC5jdXJyZW50O1xuICAgICAgICBpZiAoc2Nyb2xsUGFuZWwpIHtcbiAgICAgICAgICAgIHNjcm9sbFBhbmVsLmNoZWNrU2Nyb2xsKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblR5cGluZ1Nob3duID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBjb25zdCBzY3JvbGxQYW5lbCA9IHRoaXMuc2Nyb2xsUGFuZWwuY3VycmVudDtcbiAgICAgICAgLy8gdGhpcyB3aWxsIG1ha2UgdGhlIHRpbWVsaW5lIGdyb3csIHNvIGNoZWNrU2Nyb2xsXG4gICAgICAgIHNjcm9sbFBhbmVsLmNoZWNrU2Nyb2xsKCk7XG4gICAgICAgIGlmIChzY3JvbGxQYW5lbCAmJiBzY3JvbGxQYW5lbC5nZXRTY3JvbGxTdGF0ZSgpLnN0dWNrQXRCb3R0b20pIHtcbiAgICAgICAgICAgIHNjcm9sbFBhbmVsLnByZXZlbnRTaHJpbmtpbmcoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVHlwaW5nSGlkZGVuID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBjb25zdCBzY3JvbGxQYW5lbCA9IHRoaXMuc2Nyb2xsUGFuZWwuY3VycmVudDtcbiAgICAgICAgaWYgKHNjcm9sbFBhbmVsKSB7XG4gICAgICAgICAgICAvLyBhcyBoaWRpbmcgdGhlIHR5cGluZyBub3RpZmljYXRpb25zIGRvZXNuJ3RcbiAgICAgICAgICAgIC8vIHVwZGF0ZSB0aGUgc2Nyb2xsUGFuZWwsIHdlIHRlbGwgaXQgdG8gYXBwbHlcbiAgICAgICAgICAgIC8vIHRoZSBzaHJpbmtpbmcgcHJldmVudGlvbiBvbmNlIHRoZSB0eXBpbmcgbm90aWZzIGFyZSBoaWRkZW5cbiAgICAgICAgICAgIHNjcm9sbFBhbmVsLnVwZGF0ZVByZXZlbnRTaHJpbmtpbmcoKTtcbiAgICAgICAgICAgIC8vIG9yZGVyIGlzIGltcG9ydGFudCBoZXJlIGFzIGNoZWNrU2Nyb2xsIHdpbGwgc2Nyb2xsIGRvd24gdG9cbiAgICAgICAgICAgIC8vIHJldmVhbCBhZGRlZCBwYWRkaW5nIHRvIGJhbGFuY2UgdGhlIG5vdGlmcyBkaXNhcHBlYXJpbmcuXG4gICAgICAgICAgICBzY3JvbGxQYW5lbC5jaGVja1Njcm9sbCgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHB1YmxpYyB1cGRhdGVUaW1lbGluZU1pbkhlaWdodCgpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgc2Nyb2xsUGFuZWwgPSB0aGlzLnNjcm9sbFBhbmVsLmN1cnJlbnQ7XG5cbiAgICAgICAgaWYgKHNjcm9sbFBhbmVsKSB7XG4gICAgICAgICAgICBjb25zdCBpc0F0Qm90dG9tID0gc2Nyb2xsUGFuZWwuaXNBdEJvdHRvbSgpO1xuICAgICAgICAgICAgY29uc3Qgd2hvSXNUeXBpbmcgPSB0aGlzLndob0lzVHlwaW5nLmN1cnJlbnQ7XG4gICAgICAgICAgICBjb25zdCBpc1R5cGluZ1Zpc2libGUgPSB3aG9Jc1R5cGluZyAmJiB3aG9Jc1R5cGluZy5pc1Zpc2libGUoKTtcbiAgICAgICAgICAgIC8vIHdoZW4gbWVzc2FnZXMgZ2V0IGFkZGVkIHRvIHRoZSB0aW1lbGluZSxcbiAgICAgICAgICAgIC8vIGJ1dCBzb21lYm9keSBlbHNlIGlzIHN0aWxsIHR5cGluZyxcbiAgICAgICAgICAgIC8vIHVwZGF0ZSB0aGUgbWluLWhlaWdodCwgc28gb25jZSB0aGUgbGFzdFxuICAgICAgICAgICAgLy8gcGVyc29uIHN0b3BzIHR5cGluZywgbm8ganVtcGluZyBvY2N1cnNcbiAgICAgICAgICAgIGlmIChpc0F0Qm90dG9tICYmIGlzVHlwaW5nVmlzaWJsZSkge1xuICAgICAgICAgICAgICAgIHNjcm9sbFBhbmVsLnByZXZlbnRTaHJpbmtpbmcoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBvblRpbWVsaW5lUmVzZXQoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHNjcm9sbFBhbmVsID0gdGhpcy5zY3JvbGxQYW5lbC5jdXJyZW50O1xuICAgICAgICBpZiAoc2Nyb2xsUGFuZWwpIHtcbiAgICAgICAgICAgIHNjcm9sbFBhbmVsLmNsZWFyUHJldmVudFNocmlua2luZygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgdG9wU3Bpbm5lcjtcbiAgICAgICAgbGV0IGJvdHRvbVNwaW5uZXI7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmJhY2tQYWdpbmF0aW5nKSB7XG4gICAgICAgICAgICB0b3BTcGlubmVyID0gPGxpIGtleT1cIl90b3BTcGlubmVyXCI+PFNwaW5uZXIgLz48L2xpPjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5wcm9wcy5mb3J3YXJkUGFnaW5hdGluZykge1xuICAgICAgICAgICAgYm90dG9tU3Bpbm5lciA9IDxsaSBrZXk9XCJfYm90dG9tU3Bpbm5lclwiPjxTcGlubmVyIC8+PC9saT47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzdHlsZSA9IHRoaXMucHJvcHMuaGlkZGVuID8geyBkaXNwbGF5OiAnbm9uZScgfSA6IHt9O1xuXG4gICAgICAgIGxldCB3aG9Jc1R5cGluZztcbiAgICAgICAgaWYgKHRoaXMucHJvcHMucm9vbSAmJlxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5zaG93VHlwaW5nTm90aWZpY2F0aW9ucyAmJlxuICAgICAgICAgICAgdGhpcy5jb250ZXh0LnRpbWVsaW5lUmVuZGVyaW5nVHlwZSA9PT0gVGltZWxpbmVSZW5kZXJpbmdUeXBlLlJvb21cbiAgICAgICAgKSB7XG4gICAgICAgICAgICB3aG9Jc1R5cGluZyA9ICg8V2hvSXNUeXBpbmdUaWxlXG4gICAgICAgICAgICAgICAgcm9vbT17dGhpcy5wcm9wcy5yb29tfVxuICAgICAgICAgICAgICAgIG9uU2hvd249e3RoaXMub25UeXBpbmdTaG93bn1cbiAgICAgICAgICAgICAgICBvbkhpZGRlbj17dGhpcy5vblR5cGluZ0hpZGRlbn1cbiAgICAgICAgICAgICAgICByZWY9e3RoaXMud2hvSXNUeXBpbmd9IC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGlyY1Jlc2l6ZXIgPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5sYXlvdXQgPT0gTGF5b3V0LklSQykge1xuICAgICAgICAgICAgaXJjUmVzaXplciA9IDxJUkNUaW1lbGluZVByb2ZpbGVSZXNpemVyXG4gICAgICAgICAgICAgICAgbWluV2lkdGg9ezIwfVxuICAgICAgICAgICAgICAgIG1heFdpZHRoPXs2MDB9XG4gICAgICAgICAgICAgICAgcm9vbUlkPXt0aGlzLnByb3BzLnJvb20gPyB0aGlzLnByb3BzLnJvb20ucm9vbUlkIDogbnVsbH1cbiAgICAgICAgICAgIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2xhc3NlcyA9IGNsYXNzTmFtZXModGhpcy5wcm9wcy5jbGFzc05hbWUsIHtcbiAgICAgICAgICAgIFwibXhfTWVzc2FnZVBhbmVsX25hcnJvd1wiOiB0aGlzLmNvbnRleHQubmFycm93LFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEVycm9yQm91bmRhcnk+XG4gICAgICAgICAgICAgICAgPFNjcm9sbFBhbmVsXG4gICAgICAgICAgICAgICAgICAgIHJlZj17dGhpcy5zY3JvbGxQYW5lbH1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc2VzfVxuICAgICAgICAgICAgICAgICAgICBvblNjcm9sbD17dGhpcy5wcm9wcy5vblNjcm9sbH1cbiAgICAgICAgICAgICAgICAgICAgb25GaWxsUmVxdWVzdD17dGhpcy5wcm9wcy5vbkZpbGxSZXF1ZXN0fVxuICAgICAgICAgICAgICAgICAgICBvblVuZmlsbFJlcXVlc3Q9e3RoaXMucHJvcHMub25VbmZpbGxSZXF1ZXN0fVxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17c3R5bGV9XG4gICAgICAgICAgICAgICAgICAgIHN0aWNreUJvdHRvbT17dGhpcy5wcm9wcy5zdGlja3lCb3R0b219XG4gICAgICAgICAgICAgICAgICAgIHJlc2l6ZU5vdGlmaWVyPXt0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyfVxuICAgICAgICAgICAgICAgICAgICBmaXhlZENoaWxkcmVuPXtpcmNSZXNpemVyfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgeyB0b3BTcGlubmVyIH1cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLmdldEV2ZW50VGlsZXMoKSB9XG4gICAgICAgICAgICAgICAgICAgIHsgd2hvSXNUeXBpbmcgfVxuICAgICAgICAgICAgICAgICAgICB7IGJvdHRvbVNwaW5uZXIgfVxuICAgICAgICAgICAgICAgIDwvU2Nyb2xsUGFuZWw+XG4gICAgICAgICAgICA8L0Vycm9yQm91bmRhcnk+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5hYnN0cmFjdCBjbGFzcyBCYXNlR3JvdXBlciB7XG4gICAgc3RhdGljIGNhblN0YXJ0R3JvdXAgPSAocGFuZWw6IE1lc3NhZ2VQYW5lbCwgZXY6IE1hdHJpeEV2ZW50KTogYm9vbGVhbiA9PiB0cnVlO1xuXG4gICAgcHVibGljIGV2ZW50czogTWF0cml4RXZlbnRbXSA9IFtdO1xuICAgIC8vIGV2ZW50cyB0aGF0IHdlIGluY2x1ZGUgaW4gdGhlIGdyb3VwIGJ1dCB0aGVuIGVqZWN0IG91dCBhbmQgcGxhY2UgYWJvdmUgdGhlIGdyb3VwLlxuICAgIHB1YmxpYyBlamVjdGVkRXZlbnRzOiBNYXRyaXhFdmVudFtdID0gW107XG4gICAgcHVibGljIHJlYWRNYXJrZXI6IFJlYWN0Tm9kZTtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwdWJsaWMgcmVhZG9ubHkgcGFuZWw6IE1lc3NhZ2VQYW5lbCxcbiAgICAgICAgcHVibGljIHJlYWRvbmx5IGV2ZW50OiBNYXRyaXhFdmVudCxcbiAgICAgICAgcHVibGljIHJlYWRvbmx5IHByZXZFdmVudDogTWF0cml4RXZlbnQsXG4gICAgICAgIHB1YmxpYyByZWFkb25seSBsYXN0U2hvd25FdmVudDogTWF0cml4RXZlbnQsXG4gICAgICAgIHB1YmxpYyByZWFkb25seSBuZXh0RXZlbnQ/OiBNYXRyaXhFdmVudCxcbiAgICAgICAgcHVibGljIHJlYWRvbmx5IG5leHRFdmVudFRpbGU/OiBNYXRyaXhFdmVudCxcbiAgICApIHtcbiAgICAgICAgdGhpcy5yZWFkTWFya2VyID0gcGFuZWwucmVhZE1hcmtlckZvckV2ZW50KGV2ZW50LmdldElkKCksIGV2ZW50ID09PSBsYXN0U2hvd25FdmVudCk7XG4gICAgfVxuXG4gICAgcHVibGljIGFic3RyYWN0IHNob3VsZEdyb3VwKGV2OiBNYXRyaXhFdmVudCk6IGJvb2xlYW47XG4gICAgcHVibGljIGFic3RyYWN0IGFkZChldjogTWF0cml4RXZlbnQpOiB2b2lkO1xuICAgIHB1YmxpYyBhYnN0cmFjdCBnZXRUaWxlcygpOiBSZWFjdE5vZGVbXTtcbiAgICBwdWJsaWMgYWJzdHJhY3QgZ2V0TmV3UHJldkV2ZW50KCk6IE1hdHJpeEV2ZW50O1xufVxuXG4vKiBHcm91cGVyIGNsYXNzZXMgZGV0ZXJtaW5lIHdoZW4gZXZlbnRzIGNhbiBiZSBncm91cGVkIHRvZ2V0aGVyIGluIGEgc3VtbWFyeS5cbiAqIEdyb3VwZXJzIHNob3VsZCBoYXZlIHRoZSBmb2xsb3dpbmcgbWV0aG9kczpcbiAqIC0gY2FuU3RhcnRHcm91cCAoc3RhdGljKTogZGV0ZXJtaW5lcyBpZiBhIG5ldyBncm91cCBzaG91bGQgYmUgc3RhcnRlZCB3aXRoIHRoZVxuICogICBnaXZlbiBldmVudFxuICogLSBzaG91bGRHcm91cDogZGV0ZXJtaW5lcyBpZiB0aGUgZ2l2ZW4gZXZlbnQgc2hvdWxkIGJlIGFkZGVkIHRvIGFuIGV4aXN0aW5nIGdyb3VwXG4gKiAtIGFkZDogYWRkcyBhbiBldmVudCB0byBhbiBleGlzdGluZyBncm91cCAoc2hvdWxkIG9ubHkgYmUgY2FsbGVkIGlmIHNob3VsZEdyb3VwXG4gKiAgIHJldHVybiB0cnVlKVxuICogLSBnZXRUaWxlczogcmV0dXJucyB0aGUgdGlsZXMgdGhhdCByZXByZXNlbnQgdGhlIGdyb3VwXG4gKiAtIGdldE5ld1ByZXZFdmVudDogcmV0dXJucyB0aGUgZXZlbnQgdGhhdCBzaG91bGQgYmUgdXNlZCBhcyB0aGUgbmV3IHByZXZFdmVudFxuICogICB3aGVuIGRldGVybWluaW5nIHRoaW5ncyBzdWNoIGFzIHdoZXRoZXIgYSBkYXRlIHNlcGFyYXRvciBpcyBuZWNlc3NhcnlcbiAqL1xuXG4vLyBXcmFwIGluaXRpYWwgcm9vbSBjcmVhdGlvbiBldmVudHMgaW50byBhIEdlbmVyaWNFdmVudExpc3RTdW1tYXJ5XG4vLyBHcm91cGluZyBvbmx5IGV2ZW50cyBzZW50IGJ5IHRoZSBzYW1lIHVzZXIgdGhhdCBzZW50IHRoZSBgbS5yb29tLmNyZWF0ZWAgYW5kIG9ubHkgdW50aWxcbi8vIHRoZSBmaXJzdCBub24tc3RhdGUgZXZlbnQsIGJlYWNvbl9pbmZvIGV2ZW50IG9yIG1lbWJlcnNoaXAgZXZlbnQgd2hpY2ggaXMgbm90IHJlZ2FyZGluZyB0aGUgc2VuZGVyIG9mIHRoZSBgbS5yb29tLmNyZWF0ZWAgZXZlbnRcbmNsYXNzIENyZWF0aW9uR3JvdXBlciBleHRlbmRzIEJhc2VHcm91cGVyIHtcbiAgICBzdGF0aWMgY2FuU3RhcnRHcm91cCA9IGZ1bmN0aW9uKHBhbmVsOiBNZXNzYWdlUGFuZWwsIGV2OiBNYXRyaXhFdmVudCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gZXYuZ2V0VHlwZSgpID09PSBFdmVudFR5cGUuUm9vbUNyZWF0ZTtcbiAgICB9O1xuXG4gICAgcHVibGljIHNob3VsZEdyb3VwKGV2OiBNYXRyaXhFdmVudCk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBwYW5lbCA9IHRoaXMucGFuZWw7XG4gICAgICAgIGNvbnN0IGNyZWF0ZUV2ZW50ID0gdGhpcy5ldmVudDtcbiAgICAgICAgaWYgKCFwYW5lbC5zaG91bGRTaG93RXZlbnQoZXYpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFuZWwud2FudHNEYXRlU2VwYXJhdG9yKHRoaXMuZXZlbnQsIGV2LmdldERhdGUoKSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXYuZ2V0VHlwZSgpID09PSBFdmVudFR5cGUuUm9vbU1lbWJlclxuICAgICAgICAgICAgJiYgKGV2LmdldFN0YXRlS2V5KCkgIT09IGNyZWF0ZUV2ZW50LmdldFNlbmRlcigpIHx8IGV2LmdldENvbnRlbnQoKVtcIm1lbWJlcnNoaXBcIl0gIT09IFwiam9pblwiKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIC8vIGJlYWNvbnMgYXJlIG5vdCBwYXJ0IG9mIHJvb20gY3JlYXRpb24gY29uZmlndXJhdGlvblxuICAgICAgICAvLyBzaG91bGQgYmUgc2hvd24gaW4gdGltZWxpbmVcbiAgICAgICAgaWYgKE1fQkVBQ09OX0lORk8ubWF0Y2hlcyhldi5nZXRUeXBlKCkpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2LmlzU3RhdGUoKSAmJiBldi5nZXRTZW5kZXIoKSA9PT0gY3JlYXRlRXZlbnQuZ2V0U2VuZGVyKCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGQoZXY6IE1hdHJpeEV2ZW50KTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHBhbmVsID0gdGhpcy5wYW5lbDtcbiAgICAgICAgdGhpcy5yZWFkTWFya2VyID0gdGhpcy5yZWFkTWFya2VyIHx8IHBhbmVsLnJlYWRNYXJrZXJGb3JFdmVudChcbiAgICAgICAgICAgIGV2LmdldElkKCksXG4gICAgICAgICAgICBldiA9PT0gdGhpcy5sYXN0U2hvd25FdmVudCxcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKCFwYW5lbC5zaG91bGRTaG93RXZlbnQoZXYpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2LmdldFR5cGUoKSA9PT0gRXZlbnRUeXBlLlJvb21FbmNyeXB0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLmVqZWN0ZWRFdmVudHMucHVzaChldik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmV2ZW50cy5wdXNoKGV2KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBnZXRUaWxlcygpOiBSZWFjdE5vZGVbXSB7XG4gICAgICAgIC8vIElmIHdlIGRvbid0IGhhdmUgYW55IGV2ZW50cyB0byBncm91cCwgZG9uJ3QgZXZlbiB0cnkgdG8gZ3JvdXAgdGhlbS4gVGhlIGxvZ2ljXG4gICAgICAgIC8vIGJlbG93IGFzc3VtZXMgdGhhdCB3ZSBoYXZlIGEgZ3JvdXAgb2YgZXZlbnRzIHRvIGRlYWwgd2l0aCwgYnV0IHdlIG1pZ2h0IG5vdCBpZlxuICAgICAgICAvLyB0aGUgZXZlbnRzIHdlIHdlcmUgc3VwcG9zZWQgdG8gZ3JvdXAgd2VyZSByZWRhY3RlZC5cbiAgICAgICAgaWYgKCF0aGlzLmV2ZW50cyB8fCAhdGhpcy5ldmVudHMubGVuZ3RoKSByZXR1cm4gW107XG5cbiAgICAgICAgY29uc3QgcGFuZWwgPSB0aGlzLnBhbmVsO1xuICAgICAgICBjb25zdCByZXQ6IFJlYWN0Tm9kZVtdID0gW107XG4gICAgICAgIGNvbnN0IGlzR3JvdXBlZCA9IHRydWU7XG4gICAgICAgIGNvbnN0IGNyZWF0ZUV2ZW50ID0gdGhpcy5ldmVudDtcbiAgICAgICAgY29uc3QgbGFzdFNob3duRXZlbnQgPSB0aGlzLmxhc3RTaG93bkV2ZW50O1xuXG4gICAgICAgIGlmIChwYW5lbC53YW50c0RhdGVTZXBhcmF0b3IodGhpcy5wcmV2RXZlbnQsIGNyZWF0ZUV2ZW50LmdldERhdGUoKSkpIHtcbiAgICAgICAgICAgIGNvbnN0IHRzID0gY3JlYXRlRXZlbnQuZ2V0VHMoKTtcbiAgICAgICAgICAgIHJldC5wdXNoKFxuICAgICAgICAgICAgICAgIDxsaSBrZXk9e3RzKyd+J30+PERhdGVTZXBhcmF0b3Igcm9vbUlkPXtjcmVhdGVFdmVudC5nZXRSb29tSWQoKX0gdHM9e3RzfSAvPjwvbGk+LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHRoaXMgbS5yb29tLmNyZWF0ZSBldmVudCBzaG91bGQgYmUgc2hvd24gKHJvb20gdXBncmFkZSkgdGhlbiBzaG93IGl0IGJlZm9yZSB0aGUgc3VtbWFyeVxuICAgICAgICBpZiAocGFuZWwuc2hvdWxkU2hvd0V2ZW50KGNyZWF0ZUV2ZW50KSkge1xuICAgICAgICAgICAgLy8gcGFzcyBpbiB0aGUgY3JlYXRlRXZlbnQgYXMgcHJldkV2ZW50IGFzIHdlbGwgc28gbm8gZXh0cmEgRGF0ZVNlcGFyYXRvciBpcyByZW5kZXJlZFxuICAgICAgICAgICAgcmV0LnB1c2goLi4ucGFuZWwuZ2V0VGlsZXNGb3JFdmVudChjcmVhdGVFdmVudCwgY3JlYXRlRXZlbnQpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoY29uc3QgZWplY3RlZCBvZiB0aGlzLmVqZWN0ZWRFdmVudHMpIHtcbiAgICAgICAgICAgIHJldC5wdXNoKC4uLnBhbmVsLmdldFRpbGVzRm9yRXZlbnQoXG4gICAgICAgICAgICAgICAgY3JlYXRlRXZlbnQsIGVqZWN0ZWQsIGNyZWF0ZUV2ZW50ID09PSBsYXN0U2hvd25FdmVudCwgaXNHcm91cGVkLFxuICAgICAgICAgICAgKSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBldmVudFRpbGVzID0gdGhpcy5ldmVudHMubWFwKChlKSA9PiB7XG4gICAgICAgICAgICAvLyBJbiBvcmRlciB0byBwcmV2ZW50IERhdGVTZXBhcmF0b3JzIGZyb20gYXBwZWFyaW5nIGluIHRoZSBleHBhbmRlZCBmb3JtXG4gICAgICAgICAgICAvLyBvZiBHZW5lcmljRXZlbnRMaXN0U3VtbWFyeSwgcmVuZGVyIGVhY2ggbWVtYmVyIGV2ZW50IGFzIGlmIHRoZSBwcmV2aW91c1xuICAgICAgICAgICAgLy8gb25lIHdhcyBpdHNlbGYuIFRoaXMgd2F5LCB0aGUgdGltZXN0YW1wIG9mIHRoZSBwcmV2aW91cyBldmVudCA9PT0gdGhlXG4gICAgICAgICAgICAvLyB0aW1lc3RhbXAgb2YgdGhlIGN1cnJlbnQgZXZlbnQsIGFuZCBubyBEYXRlU2VwYXJhdG9yIGlzIGluc2VydGVkLlxuICAgICAgICAgICAgcmV0dXJuIHBhbmVsLmdldFRpbGVzRm9yRXZlbnQoZSwgZSwgZSA9PT0gbGFzdFNob3duRXZlbnQsIGlzR3JvdXBlZCk7XG4gICAgICAgIH0pLnJlZHVjZSgoYSwgYikgPT4gYS5jb25jYXQoYiksIFtdKTtcbiAgICAgICAgLy8gR2V0IHNlbmRlciBwcm9maWxlIGZyb20gdGhlIGxhdGVzdCBldmVudCBpbiB0aGUgc3VtbWFyeSBhcyB0aGUgbS5yb29tLmNyZWF0ZSBkb2Vzbid0IGNvbnRhaW4gb25lXG4gICAgICAgIGNvbnN0IGV2ID0gdGhpcy5ldmVudHNbdGhpcy5ldmVudHMubGVuZ3RoIC0gMV07XG5cbiAgICAgICAgbGV0IHN1bW1hcnlUZXh0OiBzdHJpbmc7XG4gICAgICAgIGNvbnN0IHJvb21JZCA9IGV2LmdldFJvb21JZCgpO1xuICAgICAgICBjb25zdCBjcmVhdG9yID0gZXYuc2VuZGVyID8gZXYuc2VuZGVyLm5hbWUgOiBldi5nZXRTZW5kZXIoKTtcbiAgICAgICAgaWYgKERNUm9vbU1hcC5zaGFyZWQoKS5nZXRVc2VySWRGb3JSb29tSWQocm9vbUlkKSkge1xuICAgICAgICAgICAgc3VtbWFyeVRleHQgPSBfdChcIiUoY3JlYXRvcilzIGNyZWF0ZWQgdGhpcyBETS5cIiwgeyBjcmVhdG9yIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VtbWFyeVRleHQgPSBfdChcIiUoY3JlYXRvcilzIGNyZWF0ZWQgYW5kIGNvbmZpZ3VyZWQgdGhlIHJvb20uXCIsIHsgY3JlYXRvciB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldC5wdXNoKDxOZXdSb29tSW50cm8ga2V5PVwibmV3cm9vbWludHJvXCIgLz4pO1xuXG4gICAgICAgIHJldC5wdXNoKFxuICAgICAgICAgICAgPEdlbmVyaWNFdmVudExpc3RTdW1tYXJ5XG4gICAgICAgICAgICAgICAga2V5PVwicm9vbWNyZWF0aW9uc3VtbWFyeVwiXG4gICAgICAgICAgICAgICAgZXZlbnRzPXt0aGlzLmV2ZW50c31cbiAgICAgICAgICAgICAgICBvblRvZ2dsZT17cGFuZWwub25IZWlnaHRDaGFuZ2VkfSAvLyBVcGRhdGUgc2Nyb2xsIHN0YXRlXG4gICAgICAgICAgICAgICAgc3VtbWFyeU1lbWJlcnM9e1tldi5zZW5kZXJdfVxuICAgICAgICAgICAgICAgIHN1bW1hcnlUZXh0PXtzdW1tYXJ5VGV4dH1cbiAgICAgICAgICAgICAgICBsYXlvdXQ9e3RoaXMucGFuZWwucHJvcHMubGF5b3V0fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgZXZlbnRUaWxlcyB9XG4gICAgICAgICAgICA8L0dlbmVyaWNFdmVudExpc3RTdW1tYXJ5PixcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAodGhpcy5yZWFkTWFya2VyKSB7XG4gICAgICAgICAgICByZXQucHVzaCh0aGlzLnJlYWRNYXJrZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0TmV3UHJldkV2ZW50KCk6IE1hdHJpeEV2ZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnQ7XG4gICAgfVxufVxuXG4vLyBXcmFwIGNvbnNlY3V0aXZlIGdyb3VwZWQgZXZlbnRzIGluIGEgTGlzdFN1bW1hcnlcbmNsYXNzIE1haW5Hcm91cGVyIGV4dGVuZHMgQmFzZUdyb3VwZXIge1xuICAgIHN0YXRpYyBjYW5TdGFydEdyb3VwID0gZnVuY3Rpb24ocGFuZWw6IE1lc3NhZ2VQYW5lbCwgZXY6IE1hdHJpeEV2ZW50KTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghcGFuZWwuc2hvdWxkU2hvd0V2ZW50KGV2KSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIGlmIChldi5pc1N0YXRlKCkgJiYgZ3JvdXBlZFN0YXRlRXZlbnRzLmluY2x1ZGVzKGV2LmdldFR5cGUoKSBhcyBFdmVudFR5cGUpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChldi5pc1JlZGFjdGVkKCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBhbmVsLnNob3dIaWRkZW5FdmVudHMgJiYgIXBhbmVsLnNob3VsZFNob3dFdmVudChldiwgdHJ1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHVibGljIHJlYWRvbmx5IHBhbmVsOiBNZXNzYWdlUGFuZWwsXG4gICAgICAgIHB1YmxpYyByZWFkb25seSBldmVudDogTWF0cml4RXZlbnQsXG4gICAgICAgIHB1YmxpYyByZWFkb25seSBwcmV2RXZlbnQ6IE1hdHJpeEV2ZW50LFxuICAgICAgICBwdWJsaWMgcmVhZG9ubHkgbGFzdFNob3duRXZlbnQ6IE1hdHJpeEV2ZW50LFxuICAgICAgICBuZXh0RXZlbnQ6IE1hdHJpeEV2ZW50LFxuICAgICAgICBuZXh0RXZlbnRUaWxlOiBNYXRyaXhFdmVudCxcbiAgICApIHtcbiAgICAgICAgc3VwZXIocGFuZWwsIGV2ZW50LCBwcmV2RXZlbnQsIGxhc3RTaG93bkV2ZW50LCBuZXh0RXZlbnQsIG5leHRFdmVudFRpbGUpO1xuICAgICAgICB0aGlzLmV2ZW50cyA9IFtldmVudF07XG4gICAgfVxuXG4gICAgcHVibGljIHNob3VsZEdyb3VwKGV2OiBNYXRyaXhFdmVudCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIXRoaXMucGFuZWwuc2hvdWxkU2hvd0V2ZW50KGV2KSkge1xuICAgICAgICAgICAgLy8gYWJzb3JiIGhpZGRlbiBldmVudHMgc28gdGhhdCB0aGV5IGRvIG5vdCBicmVhayB1cCBzdHJlYW1zIG9mIG1lc3NhZ2VzICYgcmVkYWN0aW9uIGV2ZW50cyBiZWluZyBncm91cGVkXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5wYW5lbC53YW50c0RhdGVTZXBhcmF0b3IodGhpcy5ldmVudHNbMF0sIGV2LmdldERhdGUoKSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXYuaXNTdGF0ZSgpICYmIGdyb3VwZWRTdGF0ZUV2ZW50cy5pbmNsdWRlcyhldi5nZXRUeXBlKCkgYXMgRXZlbnRUeXBlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2LmlzUmVkYWN0ZWQoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucGFuZWwuc2hvd0hpZGRlbkV2ZW50cyAmJiAhdGhpcy5wYW5lbC5zaG91bGRTaG93RXZlbnQoZXYsIHRydWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZChldjogTWF0cml4RXZlbnQpOiB2b2lkIHtcbiAgICAgICAgaWYgKGV2LmdldFR5cGUoKSA9PT0gRXZlbnRUeXBlLlJvb21NZW1iZXIpIHtcbiAgICAgICAgICAgIC8vIFdlIGNhbiBpZ25vcmUgYW55IGV2ZW50cyB0aGF0IGRvbid0IGFjdHVhbGx5IGhhdmUgYSBtZXNzYWdlIHRvIGRpc3BsYXlcbiAgICAgICAgICAgIGlmICghaGFzVGV4dChldiwgdGhpcy5wYW5lbC5zaG93SGlkZGVuRXZlbnRzKSkgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVhZE1hcmtlciA9IHRoaXMucmVhZE1hcmtlciB8fCB0aGlzLnBhbmVsLnJlYWRNYXJrZXJGb3JFdmVudChldi5nZXRJZCgpLCBldiA9PT0gdGhpcy5sYXN0U2hvd25FdmVudCk7XG4gICAgICAgIGlmICghdGhpcy5wYW5lbC5zaG93SGlkZGVuRXZlbnRzICYmICF0aGlzLnBhbmVsLnNob3VsZFNob3dFdmVudChldikpIHtcbiAgICAgICAgICAgIC8vIGFic29yYiBoaWRkZW4gZXZlbnRzIHRvIG5vdCBzcGxpdCB0aGUgc3VtbWFyeVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZXZlbnRzLnB1c2goZXYpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2VuZXJhdGVLZXkoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIFwiZXZlbnRsaXN0c3VtbWFyeS1cIiArIHRoaXMuZXZlbnRzWzBdLmdldElkKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFRpbGVzKCk6IFJlYWN0Tm9kZVtdIHtcbiAgICAgICAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSBhbnkgZXZlbnRzIHRvIGdyb3VwLCBkb24ndCBldmVuIHRyeSB0byBncm91cCB0aGVtLiBUaGUgbG9naWNcbiAgICAgICAgLy8gYmVsb3cgYXNzdW1lcyB0aGF0IHdlIGhhdmUgYSBncm91cCBvZiBldmVudHMgdG8gZGVhbCB3aXRoLCBidXQgd2UgbWlnaHQgbm90IGlmXG4gICAgICAgIC8vIHRoZSBldmVudHMgd2Ugd2VyZSBzdXBwb3NlZCB0byBncm91cCB3ZXJlIHJlZGFjdGVkLlxuICAgICAgICBpZiAoIXRoaXMuZXZlbnRzPy5sZW5ndGgpIHJldHVybiBbXTtcblxuICAgICAgICBjb25zdCBpc0dyb3VwZWQgPSB0cnVlO1xuICAgICAgICBjb25zdCBwYW5lbCA9IHRoaXMucGFuZWw7XG4gICAgICAgIGNvbnN0IGxhc3RTaG93bkV2ZW50ID0gdGhpcy5sYXN0U2hvd25FdmVudDtcbiAgICAgICAgY29uc3QgcmV0OiBSZWFjdE5vZGVbXSA9IFtdO1xuXG4gICAgICAgIGlmIChwYW5lbC53YW50c0RhdGVTZXBhcmF0b3IodGhpcy5wcmV2RXZlbnQsIHRoaXMuZXZlbnRzWzBdLmdldERhdGUoKSkpIHtcbiAgICAgICAgICAgIGNvbnN0IHRzID0gdGhpcy5ldmVudHNbMF0uZ2V0VHMoKTtcbiAgICAgICAgICAgIHJldC5wdXNoKFxuICAgICAgICAgICAgICAgIDxsaSBrZXk9e3RzKyd+J30+PERhdGVTZXBhcmF0b3Igcm9vbUlkPXt0aGlzLmV2ZW50c1swXS5nZXRSb29tSWQoKX0gdHM9e3RzfSAvPjwvbGk+LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEVuc3VyZSB0aGF0IHRoZSBrZXkgb2YgdGhlIEV2ZW50TGlzdFN1bW1hcnkgZG9lcyBub3QgY2hhbmdlIHdpdGggbmV3IGV2ZW50cyBpbiBlaXRoZXIgZGlyZWN0aW9uLlxuICAgICAgICAvLyBUaGlzIHdpbGwgcHJldmVudCBpdCBmcm9tIGJlaW5nIHJlLWNyZWF0ZWQgdW5uZWNlc3NhcmlseSwgYW5kIGluc3RlYWQgd2lsbCBhbGxvdyBuZXcgcHJvcHMgdG8gYmUgcHJvdmlkZWQuXG4gICAgICAgIC8vIEluIHR1cm4sIHRoZSBzaG91bGRDb21wb25lbnRVcGRhdGUgbWV0aG9kIG9uIEVMUyBjYW4gYmUgdXNlZCB0byBwcmV2ZW50IHVubmVjZXNzYXJ5IHJlbmRlcmluZ3MuXG4gICAgICAgIGNvbnN0IGtleUV2ZW50ID0gdGhpcy5ldmVudHMuZmluZChlID0+IHRoaXMucGFuZWwuZ3JvdXBlcktleU1hcC5nZXQoZSkpO1xuICAgICAgICBjb25zdCBrZXkgPSBrZXlFdmVudCA/IHRoaXMucGFuZWwuZ3JvdXBlcktleU1hcC5nZXQoa2V5RXZlbnQpIDogdGhpcy5nZW5lcmF0ZUtleSgpO1xuICAgICAgICBpZiAoIWtleUV2ZW50KSB7XG4gICAgICAgICAgICAvLyBQb3B1bGF0ZSB0aGUgd2VhayBtYXAgd2l0aCB0aGUga2V5LlxuICAgICAgICAgICAgLy8gTm90ZSB0aGF0IHdlIG9ubHkgc2V0IHRoZSBrZXkgb24gdGhlIHNwZWNpZmljIGV2ZW50IGl0IHJlZmVycyB0bywgc2luY2UgdGhpcyBncm91cCBtaWdodCBnZXRcbiAgICAgICAgICAgIC8vIHNwbGl0IHVwIGluIHRoZSBmdXR1cmUgYnkgb3RoZXIgaW50ZXJ2ZW5pbmcgZXZlbnRzLiBJZiB3ZSB3ZXJlIHRvIHNldCB0aGUga2V5IG9uIGFsbCBldmVudHNcbiAgICAgICAgICAgIC8vIGN1cnJlbnRseSBpbiB0aGUgZ3JvdXAsIHdlIHdvdWxkIHJpc2sgbGF0ZXIgZ2l2aW5nIHRoZSBzYW1lIGtleSB0byBtdWx0aXBsZSBncm91cHMuXG4gICAgICAgICAgICB0aGlzLnBhbmVsLmdyb3VwZXJLZXlNYXAuc2V0KHRoaXMuZXZlbnRzWzBdLCBrZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGhpZ2hsaWdodEluU3VtbWFyeSA9IGZhbHNlO1xuICAgICAgICBsZXQgZXZlbnRUaWxlcyA9IHRoaXMuZXZlbnRzLm1hcCgoZSwgaSkgPT4ge1xuICAgICAgICAgICAgaWYgKGUuZ2V0SWQoKSA9PT0gcGFuZWwucHJvcHMuaGlnaGxpZ2h0ZWRFdmVudElkKSB7XG4gICAgICAgICAgICAgICAgaGlnaGxpZ2h0SW5TdW1tYXJ5ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwYW5lbC5nZXRUaWxlc0ZvckV2ZW50KFxuICAgICAgICAgICAgICAgIGkgPT09IDAgPyB0aGlzLnByZXZFdmVudCA6IHRoaXMuZXZlbnRzW2kgLSAxXSxcbiAgICAgICAgICAgICAgICBlLFxuICAgICAgICAgICAgICAgIGUgPT09IGxhc3RTaG93bkV2ZW50LFxuICAgICAgICAgICAgICAgIGlzR3JvdXBlZCxcbiAgICAgICAgICAgICAgICB0aGlzLm5leHRFdmVudCxcbiAgICAgICAgICAgICAgICB0aGlzLm5leHRFdmVudFRpbGUsXG4gICAgICAgICAgICApO1xuICAgICAgICB9KS5yZWR1Y2UoKGEsIGIpID0+IGEuY29uY2F0KGIpLCBbXSk7XG5cbiAgICAgICAgaWYgKGV2ZW50VGlsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBldmVudFRpbGVzID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIGEgbWVtYmVyc2hpcCBldmVudCBpcyB0aGUgc3RhcnQgb2YgdmlzaWJsZSBoaXN0b3J5LCB0ZWxsIHRoZSB1c2VyXG4gICAgICAgIC8vIHdoeSB0aGV5IGNhbid0IHNlZSBlYXJsaWVyIG1lc3NhZ2VzXG4gICAgICAgIGlmICghdGhpcy5wYW5lbC5wcm9wcy5jYW5CYWNrUGFnaW5hdGUgJiYgIXRoaXMucHJldkV2ZW50KSB7XG4gICAgICAgICAgICByZXQucHVzaCg8SGlzdG9yeVRpbGUga2V5PVwiaGlzdG9yeXRpbGVcIiAvPik7XG4gICAgICAgIH1cblxuICAgICAgICByZXQucHVzaChcbiAgICAgICAgICAgIDxFdmVudExpc3RTdW1tYXJ5XG4gICAgICAgICAgICAgICAga2V5PXtrZXl9XG4gICAgICAgICAgICAgICAgZGF0YS10ZXN0aWQ9e2tleX1cbiAgICAgICAgICAgICAgICBldmVudHM9e3RoaXMuZXZlbnRzfVxuICAgICAgICAgICAgICAgIG9uVG9nZ2xlPXtwYW5lbC5vbkhlaWdodENoYW5nZWR9IC8vIFVwZGF0ZSBzY3JvbGwgc3RhdGVcbiAgICAgICAgICAgICAgICBzdGFydEV4cGFuZGVkPXtoaWdobGlnaHRJblN1bW1hcnl9XG4gICAgICAgICAgICAgICAgbGF5b3V0PXt0aGlzLnBhbmVsLnByb3BzLmxheW91dH1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IGV2ZW50VGlsZXMgfVxuICAgICAgICAgICAgPC9FdmVudExpc3RTdW1tYXJ5PixcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAodGhpcy5yZWFkTWFya2VyKSB7XG4gICAgICAgICAgICByZXQucHVzaCh0aGlzLnJlYWRNYXJrZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0TmV3UHJldkV2ZW50KCk6IE1hdHJpeEV2ZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnRzW3RoaXMuZXZlbnRzLmxlbmd0aCAtIDFdO1xuICAgIH1cbn1cblxuLy8gYWxsIHRoZSBncm91cGVyIGNsYXNzZXMgdGhhdCB3ZSB1c2UsIG9yZGVyZWQgYnkgcHJpb3JpdHlcbmNvbnN0IGdyb3VwZXJzID0gW0NyZWF0aW9uR3JvdXBlciwgTWFpbkdyb3VwZXJdO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBR0E7O0FB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