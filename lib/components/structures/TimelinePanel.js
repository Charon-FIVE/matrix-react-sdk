"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _room = require("matrix-js-sdk/src/models/room");

var _event = require("matrix-js-sdk/src/models/event");

var _eventTimeline = require("matrix-js-sdk/src/models/event-timeline");

var _timelineWindow = require("matrix-js-sdk/src/timeline-window");

var _event2 = require("matrix-js-sdk/src/@types/event");

var _roomMember = require("matrix-js-sdk/src/models/room-member");

var _lodash = require("lodash");

var _logger = require("matrix-js-sdk/src/logger");

var _client = require("matrix-js-sdk/src/client");

var _thread = require("matrix-js-sdk/src/models/thread");

var _read_receipts = require("matrix-js-sdk/src/@types/read_receipts");

var _utils = require("matrix-js-sdk/src/utils");

var _SettingsStore = _interopRequireDefault(require("../../settings/SettingsStore"));

var _languageHandler = require("../../languageHandler");

var _MatrixClientPeg = require("../../MatrixClientPeg");

var _RoomContext = _interopRequireWildcard(require("../../contexts/RoomContext"));

var _UserActivity = _interopRequireDefault(require("../../UserActivity"));

var _Modal = _interopRequireDefault(require("../../Modal"));

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _actions = require("../../dispatcher/actions");

var _Timer = _interopRequireDefault(require("../../utils/Timer"));

var _shouldHideEvent = _interopRequireDefault(require("../../shouldHideEvent"));

var _arrays = require("../../utils/arrays");

var _MessagePanel = _interopRequireDefault(require("./MessagePanel"));

var _Spinner = _interopRequireDefault(require("../views/elements/Spinner"));

var _ErrorDialog = _interopRequireDefault(require("../views/dialogs/ErrorDialog"));

var _LegacyCallEventGrouper = require("./LegacyCallEventGrouper");

var _KeyBindingsManager = require("../../KeyBindingsManager");

var _KeyboardShortcuts = require("../../accessibility/KeyboardShortcuts");

var _EventTileFactory = require("../../events/EventTileFactory");

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
const PAGINATE_SIZE = 20;
const INITIAL_SIZE = 20;
const READ_RECEIPT_INTERVAL_MS = 500;
const READ_MARKER_DEBOUNCE_MS = 100;

const debuglog = function () {
  if (_SettingsStore.default.getValue("debug_timeline_panel")) {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _logger.logger.log.call(console, "TimelinePanel debuglog:", ...args);
  }
};

/*
 * Component which shows the event timeline in a room view.
 *
 * Also responsible for handling and sending read receipts.
 */
class TimelinePanel extends _react.default.Component {
  // a map from room id to read marker event timestamp
  // A map of <callId, LegacyCallEventGrouper>
  constructor(props, context) {
    super(props, context);
    (0, _defineProperty2.default)(this, "context", void 0);
    (0, _defineProperty2.default)(this, "lastRRSentEventId", undefined);
    (0, _defineProperty2.default)(this, "lastRMSentEventId", undefined);
    (0, _defineProperty2.default)(this, "messagePanel", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "timelineWindow", void 0);
    (0, _defineProperty2.default)(this, "unmounted", false);
    (0, _defineProperty2.default)(this, "readReceiptActivityTimer", void 0);
    (0, _defineProperty2.default)(this, "readMarkerActivityTimer", void 0);
    (0, _defineProperty2.default)(this, "callEventGroupers", new Map());
    (0, _defineProperty2.default)(this, "onDumpDebugLogs", () => {
      const room = this.props.timelineSet?.room; // Get a list of the event IDs used in this TimelinePanel.
      // This includes state and hidden events which we don't render

      const eventIdList = this.state?.events?.map(ev => ev.getId()); // Get the list of actually rendered events seen in the DOM.
      // This is useful to know for sure what's being shown on screen.
      // And we can suss out any corrupted React `key` problems.

      let renderedEventIds;

      try {
        const messagePanel = this.messagePanel.current;

        if (messagePanel) {
          const messagePanelNode = _reactDom.default.findDOMNode(messagePanel);

          if (messagePanelNode) {
            const actuallyRenderedEvents = messagePanelNode.querySelectorAll('[data-event-id]');
            renderedEventIds = [...actuallyRenderedEvents].map(renderedEvent => {
              return renderedEvent.getAttribute('data-event-id');
            });
          }
        }
      } catch (err) {
        _logger.logger.error(`onDumpDebugLogs: Failed to get the actual event ID's in the DOM`, err);
      } // Get the list of events and threads for the room as seen by the
      // matrix-js-sdk.


      let serializedEventIdsFromTimelineSets;
      let serializedEventIdsFromThreadsTimelineSets;
      const serializedThreadsMap = {};

      if (room) {
        const timelineSets = room.getTimelineSets();
        const threadsTimelineSets = room.threadsTimelineSets;

        try {
          // Serialize all of the timelineSets and timelines in each set to their event IDs
          serializedEventIdsFromTimelineSets = serializeEventIdsFromTimelineSets(timelineSets);
          serializedEventIdsFromThreadsTimelineSets = serializeEventIdsFromTimelineSets(threadsTimelineSets);
        } catch (err) {
          _logger.logger.error(`onDumpDebugLogs: Failed to serialize event IDs from timelinesets`, err);
        }

        try {
          // Serialize all threads in the room from theadId -> event IDs in the thread
          room.getThreads().forEach(thread => {
            serializedThreadsMap[thread.id] = {
              events: thread.events.map(ev => ev.getId()),
              numTimelines: thread.timelineSet.getTimelines().length,
              liveTimeline: thread.timelineSet.getLiveTimeline().getEvents().length,
              prevTimeline: thread.timelineSet.getLiveTimeline().getNeighbouringTimeline(_eventTimeline.Direction.Backward)?.getEvents().length,
              nextTimeline: thread.timelineSet.getLiveTimeline().getNeighbouringTimeline(_eventTimeline.Direction.Forward)?.getEvents().length
            };
          });
        } catch (err) {
          _logger.logger.error(`onDumpDebugLogs: Failed to serialize event IDs from the threads`, err);
        }
      }

      let timelineWindowEventIds;

      try {
        timelineWindowEventIds = this.timelineWindow.getEvents().map(ev => ev.getId());
      } catch (err) {
        _logger.logger.error(`onDumpDebugLogs: Failed to get event IDs from the timelineWindow`, err);
      }

      let pendingEventIds;

      try {
        pendingEventIds = this.props.timelineSet.getPendingEvents().map(ev => ev.getId());
      } catch (err) {
        _logger.logger.error(`onDumpDebugLogs: Failed to get pending event IDs`, err);
      }

      _logger.logger.debug(`TimelinePanel(${this.context.timelineRenderingType}): Debugging info for ${room?.roomId}\n` + `\tevents(${eventIdList.length})=${JSON.stringify(eventIdList)}\n` + `\trenderedEventIds(${renderedEventIds?.length ?? 0})=` + `${JSON.stringify(renderedEventIds)}\n` + `\tserializedEventIdsFromTimelineSets=${JSON.stringify(serializedEventIdsFromTimelineSets)}\n` + `\tserializedEventIdsFromThreadsTimelineSets=` + `${JSON.stringify(serializedEventIdsFromThreadsTimelineSets)}\n` + `\tserializedThreadsMap=${JSON.stringify(serializedThreadsMap)}\n` + `\ttimelineWindowEventIds(${timelineWindowEventIds.length})=${JSON.stringify(timelineWindowEventIds)}\n` + `\tpendingEventIds(${pendingEventIds.length})=${JSON.stringify(pendingEventIds)}`);
    });
    (0, _defineProperty2.default)(this, "onMessageListUnfillRequest", (backwards, scrollToken) => {
      // If backwards, unpaginate from the back (i.e. the start of the timeline)
      const dir = backwards ? _eventTimeline.EventTimeline.BACKWARDS : _eventTimeline.EventTimeline.FORWARDS;
      debuglog("unpaginating events in direction", dir); // All tiles are inserted by MessagePanel to have a scrollToken === eventId, and
      // this particular event should be the first or last to be unpaginated.

      const eventId = scrollToken;
      const marker = this.state.events.findIndex(ev => {
        return ev.getId() === eventId;
      });
      const count = backwards ? marker + 1 : this.state.events.length - marker;

      if (count > 0) {
        debuglog("Unpaginating", count, "in direction", dir);
        this.timelineWindow.unpaginate(count, backwards);
        const {
          events,
          liveEvents,
          firstVisibleEventIndex
        } = this.getEvents();
        this.buildLegacyCallEventGroupers(events);
        const newState = {
          events,
          liveEvents,
          firstVisibleEventIndex
        }; // We can now paginate in the unpaginated direction

        if (backwards) {
          newState.canBackPaginate = true;
        } else {
          newState.canForwardPaginate = true;
        }

        this.setState(newState);
      }
    });
    (0, _defineProperty2.default)(this, "onPaginationRequest", (timelineWindow, direction, size) => {
      if (this.props.onPaginationRequest) {
        return this.props.onPaginationRequest(timelineWindow, direction, size);
      } else {
        return timelineWindow.paginate(direction, size);
      }
    });
    (0, _defineProperty2.default)(this, "onMessageListFillRequest", backwards => {
      if (!this.shouldPaginate()) return Promise.resolve(false);
      const dir = backwards ? _eventTimeline.EventTimeline.BACKWARDS : _eventTimeline.EventTimeline.FORWARDS;
      const canPaginateKey = backwards ? 'canBackPaginate' : 'canForwardPaginate';
      const paginatingKey = backwards ? 'backPaginating' : 'forwardPaginating';

      if (!this.state[canPaginateKey]) {
        debuglog("have given up", dir, "paginating this timeline");
        return Promise.resolve(false);
      }

      if (!this.timelineWindow.canPaginate(dir)) {
        debuglog("can't", dir, "paginate any further");
        this.setState({
          [canPaginateKey]: false
        });
        return Promise.resolve(false);
      }

      if (backwards && this.state.firstVisibleEventIndex !== 0) {
        debuglog("won't", dir, "paginate past first visible event");
        return Promise.resolve(false);
      }

      debuglog("Initiating paginate; backwards:" + backwards);
      this.setState({
        [paginatingKey]: true
      });
      return this.onPaginationRequest(this.timelineWindow, dir, PAGINATE_SIZE).then(r => {
        if (this.unmounted) {
          return;
        }

        debuglog("paginate complete backwards:" + backwards + "; success:" + r);
        const {
          events,
          liveEvents,
          firstVisibleEventIndex
        } = this.getEvents();
        this.buildLegacyCallEventGroupers(events);
        const newState = {
          [paginatingKey]: false,
          [canPaginateKey]: r,
          events,
          liveEvents,
          firstVisibleEventIndex
        }; // moving the window in this direction may mean that we can now
        // paginate in the other where we previously could not.

        const otherDirection = backwards ? _eventTimeline.EventTimeline.FORWARDS : _eventTimeline.EventTimeline.BACKWARDS;
        const canPaginateOtherWayKey = backwards ? 'canForwardPaginate' : 'canBackPaginate';

        if (!this.state[canPaginateOtherWayKey] && this.timelineWindow.canPaginate(otherDirection)) {
          debuglog('can now', otherDirection, 'paginate again');
          newState[canPaginateOtherWayKey] = true;
        } // Don't resolve until the setState has completed: we need to let
        // the component update before we consider the pagination completed,
        // otherwise we'll end up paginating in all the history the js-sdk
        // has in memory because we never gave the component a chance to scroll
        // itself into the right place


        return new Promise(resolve => {
          this.setState(newState, () => {
            // we can continue paginating in the given direction if:
            // - timelineWindow.paginate says we can
            // - we're paginating forwards, or we won't be trying to
            //   paginate backwards past the first visible event
            resolve(r && (!backwards || firstVisibleEventIndex === 0));
          });
        });
      });
    });
    (0, _defineProperty2.default)(this, "onMessageListScroll", e => {
      this.props.onScroll?.(e);

      if (this.props.manageReadMarkers) {
        this.doManageReadMarkers();
      }
    });
    (0, _defineProperty2.default)(this, "doManageReadMarkers", (0, _lodash.debounce)(() => {
      const rmPosition = this.getReadMarkerPosition(); // we hide the read marker when it first comes onto the screen, but if
      // it goes back off the top of the screen (presumably because the user
      // clicks on the 'jump to bottom' button), we need to re-enable it.

      if (rmPosition < 0) {
        this.setState({
          readMarkerVisible: true
        });
      } // if read marker position goes between 0 and -1/1,
      // (and user is active), switch timeout


      const timeout = this.readMarkerTimeout(rmPosition); // NO-OP when timeout already has set to the given value

      this.readMarkerActivityTimer?.changeTimeout(timeout);
    }, READ_MARKER_DEBOUNCE_MS, {
      leading: false,
      trailing: true
    }));
    (0, _defineProperty2.default)(this, "onAction", payload => {
      switch (payload.action) {
        case "ignore_state_changed":
          this.forceUpdate();
          break;

        case _actions.Action.DumpDebugLogs:
          this.onDumpDebugLogs();
          break;
      }
    });
    (0, _defineProperty2.default)(this, "onRoomTimeline", (ev, room, toStartOfTimeline, removed, data) => {
      // ignore events for other timeline sets
      if (data.timeline.getTimelineSet() !== this.props.timelineSet) return;

      if (!_thread.Thread.hasServerSideSupport && this.context.timelineRenderingType === _RoomContext.TimelineRenderingType.Thread) {
        // const direction = toStartOfTimeline ? Direction.Backward : Direction.Forward;
        // this.timelineWindow.extend(direction, 1);
        if (toStartOfTimeline && !this.state.canBackPaginate) {
          this.setState({
            canBackPaginate: true
          });
        }

        if (!toStartOfTimeline && !this.state.canForwardPaginate) {
          this.setState({
            canForwardPaginate: true
          });
        }
      } // ignore anything but real-time updates at the end of the room:
      // updates from pagination will happen when the paginate completes.


      if (toStartOfTimeline || !data || !data.liveEvent) return;
      if (!this.messagePanel.current?.getScrollState()) return;

      if (!this.messagePanel.current.getScrollState().stuckAtBottom) {
        // we won't load this event now, because we don't want to push any
        // events off the other end of the timeline. But we need to note
        // that we can now paginate.
        this.setState({
          canForwardPaginate: true
        });
        return;
      } // tell the timeline window to try to advance itself, but not to make
      // a http request to do so.
      //
      // we deliberately avoid going via the ScrollPanel for this call - the
      // ScrollPanel might already have an active pagination promise, which
      // will fail, but would stop us passing the pagination request to the
      // timeline window.
      //
      // see https://github.com/vector-im/vector-web/issues/1035


      this.timelineWindow.paginate(_eventTimeline.EventTimeline.FORWARDS, 1, false).then(() => {
        if (this.unmounted) {
          return;
        }

        const {
          events,
          liveEvents,
          firstVisibleEventIndex
        } = this.getEvents();
        this.buildLegacyCallEventGroupers(events);
        const lastLiveEvent = liveEvents[liveEvents.length - 1];
        const updatedState = {
          events,
          liveEvents,
          firstVisibleEventIndex
        };
        let callRMUpdated;

        if (this.props.manageReadMarkers) {
          // when a new event arrives when the user is not watching the
          // window, but the window is in its auto-scroll mode, make sure the
          // read marker is visible.
          //
          // We ignore events we have sent ourselves; we don't want to see the
          // read-marker when a remote echo of an event we have just sent takes
          // more than the timeout on userActiveRecently.
          //
          const myUserId = _MatrixClientPeg.MatrixClientPeg.get().credentials.userId;

          callRMUpdated = false;

          if (ev.getSender() !== myUserId && !_UserActivity.default.sharedInstance().userActiveRecently()) {
            updatedState.readMarkerVisible = true;
          } else if (lastLiveEvent && this.getReadMarkerPosition() === 0) {
            // we know we're stuckAtBottom, so we can advance the RM
            // immediately, to save a later render cycle
            this.setReadMarker(lastLiveEvent.getId(), lastLiveEvent.getTs(), true);
            updatedState.readMarkerVisible = false;
            updatedState.readMarkerEventId = lastLiveEvent.getId();
            callRMUpdated = true;
          }
        }

        this.setState(updatedState, () => {
          this.messagePanel.current?.updateTimelineMinHeight();

          if (callRMUpdated) {
            this.props.onReadMarkerUpdated?.();
          }
        });
      });
    });
    (0, _defineProperty2.default)(this, "onRoomTimelineReset", (room, timelineSet) => {
      if (timelineSet !== this.props.timelineSet) return;

      if (this.messagePanel.current && this.messagePanel.current.isAtBottom()) {
        this.loadTimeline();
      }
    });
    (0, _defineProperty2.default)(this, "canResetTimeline", () => this.messagePanel?.current.isAtBottom());
    (0, _defineProperty2.default)(this, "onRoomRedaction", (ev, room) => {
      if (this.unmounted) return; // ignore events for other rooms

      if (room !== this.props.timelineSet.room) return; // we could skip an update if the event isn't in our timeline,
      // but that's probably an early optimisation.

      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "onEventVisibilityChange", ev => {
      if (this.unmounted) {
        return;
      } // ignore events for other rooms


      const roomId = ev.getRoomId();

      if (roomId !== this.props.timelineSet.room?.roomId) {
        return;
      } // we could skip an update if the event isn't in our timeline,
      // but that's probably an early optimisation.


      const tile = this.messagePanel.current?.getTileForEventId(ev.getId());

      if (tile) {
        tile.forceUpdate();
      }
    });
    (0, _defineProperty2.default)(this, "onVisibilityPowerLevelChange", (ev, member) => {
      if (this.unmounted) return; // ignore events for other rooms

      if (member.roomId !== this.props.timelineSet.room?.roomId) return; // ignore events for other users

      if (member.userId != _MatrixClientPeg.MatrixClientPeg.get().credentials?.userId) return; // We could skip an update if the power level change didn't cross the
      // threshold for `VISIBILITY_CHANGE_TYPE`.

      for (const event of this.state.events) {
        const tile = this.messagePanel.current?.getTileForEventId(event.getId());

        if (!tile) {
          // The event is not visible, nothing to re-render.
          continue;
        }

        tile.forceUpdate();
      }

      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "onEventReplaced", replacedEvent => {
      if (this.unmounted) return; // ignore events for other rooms

      if (replacedEvent.getRoomId() !== this.props.timelineSet.room.roomId) return; // we could skip an update if the event isn't in our timeline,
      // but that's probably an early optimisation.

      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "onRoomReceipt", (ev, room) => {
      if (this.unmounted) return; // ignore events for other rooms

      if (room !== this.props.timelineSet.room) return;
      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "onLocalEchoUpdated", (ev, room, oldEventId) => {
      if (this.unmounted) return; // ignore events for other rooms

      if (room !== this.props.timelineSet.room) return;
      this.reloadEvents();
    });
    (0, _defineProperty2.default)(this, "onAccountData", (ev, room) => {
      if (this.unmounted) return; // ignore events for other rooms

      if (room !== this.props.timelineSet.room) return;
      if (ev.getType() !== _event2.EventType.FullyRead) return; // XXX: roomReadMarkerTsMap not updated here so it is now inconsistent. Replace
      // this mechanism of determining where the RM is relative to the view-port with
      // one supported by the server (the client needs more than an event ID).

      this.setState({
        readMarkerEventId: ev.getContent().event_id
      }, this.props.onReadMarkerUpdated);
    });
    (0, _defineProperty2.default)(this, "onEventDecrypted", ev => {
      // Can be null for the notification timeline, etc.
      if (!this.props.timelineSet.room) return;
      if (ev.getRoomId() !== this.props.timelineSet.room.roomId) return;
      if (!this.state.events.includes(ev)) return;
      this.recheckFirstVisibleEventIndex(); // Need to update as we don't display event tiles for events that
      // haven't yet been decrypted. The event will have just been updated
      // in place so we just need to re-render.
      // TODO: We should restrict this to only events in our timeline,
      // but possibly the event tile itself should just update when this
      // happens to save us re-rendering the whole timeline.

      this.buildLegacyCallEventGroupers(this.state.events);
      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "onSync", (clientSyncState, prevState, data) => {
      if (this.unmounted) return;
      this.setState({
        clientSyncState
      });
    });
    (0, _defineProperty2.default)(this, "recheckFirstVisibleEventIndex", (0, _lodash.throttle)(() => {
      const firstVisibleEventIndex = this.checkForPreJoinUISI(this.state.events);

      if (firstVisibleEventIndex !== this.state.firstVisibleEventIndex) {
        this.setState({
          firstVisibleEventIndex
        });
      }
    }, 500, {
      leading: true,
      trailing: true
    }));
    (0, _defineProperty2.default)(this, "sendReadReceipt", () => {
      if (_SettingsStore.default.getValue("lowBandwidth")) return;
      if (!this.messagePanel.current) return;
      if (!this.props.manageReadReceipts) return; // This happens on user_activity_end which is delayed, and it's
      // very possible have logged out within that timeframe, so check
      // we still have a client.

      const cli = _MatrixClientPeg.MatrixClientPeg.get(); // if no client or client is guest don't send RR or RM


      if (!cli || cli.isGuest()) return;
      let shouldSendRR = true;
      const currentRREventId = this.getCurrentReadReceipt(true);
      const currentRREventIndex = this.indexForEventId(currentRREventId); // We want to avoid sending out read receipts when we are looking at
      // events in the past which are before the latest RR.
      //
      // For now, let's apply a heuristic: if (a) the event corresponding to
      // the latest RR (either from the server, or sent by ourselves) doesn't
      // appear in our timeline, and (b) we could forward-paginate the event
      // timeline, then don't send any more RRs.
      //
      // This isn't watertight, as we could be looking at a section of
      // timeline which is *after* the latest RR (so we should actually send
      // RRs) - but that is a bit of a niche case. It will sort itself out when
      // the user eventually hits the live timeline.
      //

      if (currentRREventId && currentRREventIndex === null && this.timelineWindow.canPaginate(_eventTimeline.EventTimeline.FORWARDS)) {
        shouldSendRR = false;
      }

      const lastReadEventIndex = this.getLastDisplayedEventIndex({
        ignoreOwn: true
      });

      if (lastReadEventIndex === null) {
        shouldSendRR = false;
      }

      let lastReadEvent = this.state.events[lastReadEventIndex];
      shouldSendRR = shouldSendRR && // Only send a RR if the last read event is ahead in the timeline relative to
      // the current RR event.
      lastReadEventIndex > currentRREventIndex && // Only send a RR if the last RR set != the one we would send
      this.lastRRSentEventId != lastReadEvent.getId(); // Only send a RM if the last RM sent != the one we would send

      const shouldSendRM = this.lastRMSentEventId != this.state.readMarkerEventId; // we also remember the last read receipt we sent to avoid spamming the
      // same one at the server repeatedly

      if (shouldSendRR || shouldSendRM) {
        if (shouldSendRR) {
          this.lastRRSentEventId = lastReadEvent.getId();
        } else {
          lastReadEvent = null;
        }

        this.lastRMSentEventId = this.state.readMarkerEventId;
        const roomId = this.props.timelineSet.room.roomId;

        const sendRRs = _SettingsStore.default.getValue("sendReadReceipts", roomId);

        debuglog(`Sending Read Markers for ${this.props.timelineSet.room.roomId}: `, `rm=${this.state.readMarkerEventId} `, `rr=${sendRRs ? lastReadEvent?.getId() : null} `, `prr=${lastReadEvent?.getId()}`);

        _MatrixClientPeg.MatrixClientPeg.get().setRoomReadMarkers(roomId, this.state.readMarkerEventId, sendRRs ? lastReadEvent : null, // Public read receipt (could be null)
        lastReadEvent // Private read receipt (could be null)
        ).catch(async e => {
          // /read_markers API is not implemented on this HS, fallback to just RR
          if (e.errcode === 'M_UNRECOGNIZED' && lastReadEvent) {
            const privateField = await (0, _utils.getPrivateReadReceiptField)(_MatrixClientPeg.MatrixClientPeg.get());
            if (!sendRRs && !privateField) return;

            try {
              return await _MatrixClientPeg.MatrixClientPeg.get().sendReadReceipt(lastReadEvent, sendRRs ? _read_receipts.ReceiptType.Read : privateField);
            } catch (error) {
              _logger.logger.error(e);

              this.lastRRSentEventId = undefined;
            }
          } else {
            _logger.logger.error(e);
          } // it failed, so allow retries next time the user is active


          this.lastRRSentEventId = undefined;
          this.lastRMSentEventId = undefined;
        }); // do a quick-reset of our unreadNotificationCount to avoid having
        // to wait from the remote echo from the homeserver.
        // we only do this if we're right at the end, because we're just assuming
        // that sending an RR for the latest message will set our notif counter
        // to zero: it may not do this if we send an RR for somewhere before the end.


        if (this.isAtEndOfLiveTimeline()) {
          this.props.timelineSet.room.setUnreadNotificationCount(_room.NotificationCountType.Total, 0);
          this.props.timelineSet.room.setUnreadNotificationCount(_room.NotificationCountType.Highlight, 0);

          _dispatcher.default.dispatch({
            action: 'on_room_read',
            roomId: this.props.timelineSet.room.roomId
          });
        }
      }
    });
    (0, _defineProperty2.default)(this, "updateReadMarker", () => {
      if (!this.props.manageReadMarkers) return;

      if (this.getReadMarkerPosition() === 1) {
        // the read marker is at an event below the viewport,
        // we don't want to rewind it.
        return;
      } // move the RM to *after* the message at the bottom of the screen. This
      // avoids a problem whereby we never advance the RM if there is a huge
      // message which doesn't fit on the screen.


      const lastDisplayedIndex = this.getLastDisplayedEventIndex({
        allowPartial: true
      });

      if (lastDisplayedIndex === null) {
        return;
      }

      const lastDisplayedEvent = this.state.events[lastDisplayedIndex];
      this.setReadMarker(lastDisplayedEvent.getId(), lastDisplayedEvent.getTs()); // the read-marker should become invisible, so that if the user scrolls
      // down, they don't see it.

      if (this.state.readMarkerVisible) {
        this.setState({
          readMarkerVisible: false
        });
      } // Send the updated read marker (along with read receipt) to the server


      this.sendReadReceipt();
    });
    (0, _defineProperty2.default)(this, "jumpToLiveTimeline", () => {
      // if we can't forward-paginate the existing timeline, then there
      // is no point reloading it - just jump straight to the bottom.
      //
      // Otherwise, reload the timeline rather than trying to paginate
      // through all of space-time.
      if (this.timelineWindow.canPaginate(_eventTimeline.EventTimeline.FORWARDS)) {
        this.loadTimeline();
      } else {
        this.messagePanel.current?.scrollToBottom();
      }
    });
    (0, _defineProperty2.default)(this, "scrollToEventIfNeeded", eventId => {
      this.messagePanel.current?.scrollToEventIfNeeded(eventId);
    });
    (0, _defineProperty2.default)(this, "jumpToReadMarker", () => {
      if (!this.props.manageReadMarkers) return;
      if (!this.messagePanel.current) return;
      if (!this.state.readMarkerEventId) return; // we may not have loaded the event corresponding to the read-marker
      // into the timelineWindow. In that case, attempts to scroll to it
      // will fail.
      //
      // a quick way to figure out if we've loaded the relevant event is
      // simply to check if the messagepanel knows where the read-marker is.

      const ret = this.messagePanel.current.getReadMarkerPosition();

      if (ret !== null) {
        // The messagepanel knows where the RM is, so we must have loaded
        // the relevant event.
        this.messagePanel.current.scrollToEvent(this.state.readMarkerEventId, 0, 1 / 3);
        return;
      } // Looks like we haven't loaded the event corresponding to the read-marker.
      // As with jumpToLiveTimeline, we want to reload the timeline around the
      // read-marker.


      this.loadTimeline(this.state.readMarkerEventId, 0, 1 / 3);
    });
    (0, _defineProperty2.default)(this, "forgetReadMarker", () => {
      if (!this.props.manageReadMarkers) return; // Find the read receipt - we will set the read marker to this

      const rmId = this.getCurrentReadReceipt(); // Look up the timestamp if we can find it

      const tl = this.props.timelineSet.getTimelineForEvent(rmId);
      let rmTs;

      if (tl) {
        const event = tl.getEvents().find(e => {
          return e.getId() == rmId;
        });

        if (event) {
          rmTs = event.getTs();
        }
      } // Update the read marker to the values we found


      this.setReadMarker(rmId, rmTs); // Send the receipts to the server immediately (don't wait for activity)

      this.sendReadReceipt();
    });
    (0, _defineProperty2.default)(this, "isAtEndOfLiveTimeline", () => {
      return this.messagePanel.current?.isAtBottom() && this.timelineWindow && !this.timelineWindow.canPaginate(_eventTimeline.EventTimeline.FORWARDS);
    });
    (0, _defineProperty2.default)(this, "getScrollState", () => {
      if (!this.messagePanel.current) {
        return null;
      }

      return this.messagePanel.current.getScrollState();
    });
    (0, _defineProperty2.default)(this, "getReadMarkerPosition", () => {
      if (!this.props.manageReadMarkers) return null;
      if (!this.messagePanel.current) return null;
      const ret = this.messagePanel.current.getReadMarkerPosition();

      if (ret !== null) {
        return ret;
      } // the messagePanel doesn't know where the read marker is.
      // if we know the timestamp of the read marker, make a guess based on that.


      const rmTs = TimelinePanel.roomReadMarkerTsMap[this.props.timelineSet.room.roomId];

      if (rmTs && this.state.events.length > 0) {
        if (rmTs < this.state.events[0].getTs()) {
          return -1;
        } else {
          return 1;
        }
      }

      return null;
    });
    (0, _defineProperty2.default)(this, "canJumpToReadMarker", () => {
      // 1. Do not show jump bar if neither the RM nor the RR are set.
      // 3. We want to show the bar if the read-marker is off the top of the screen.
      // 4. Also, if pos === null, the event might not be paginated - show the unread bar
      const pos = this.getReadMarkerPosition();
      const ret = this.state.readMarkerEventId !== null && ( // 1.
      pos < 0 || pos === null); // 3., 4.

      return ret;
    });
    (0, _defineProperty2.default)(this, "handleScrollKey", ev => {
      if (!this.messagePanel.current) return; // jump to the live timeline on ctrl-end, rather than the end of the
      // timeline window.

      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getRoomAction(ev);

      if (action === _KeyboardShortcuts.KeyBindingAction.JumpToLatestMessage) {
        this.jumpToLiveTimeline();
      } else {
        this.messagePanel.current.handleScrollKey(ev);
      }
    });
    (0, _defineProperty2.default)(this, "getRelationsForEvent", (eventId, relationType, eventType) => this.props.timelineSet.relations?.getChildEventsForEvent(eventId, relationType, eventType));
    this.context = context;
    debuglog("mounting"); // XXX: we could track RM per TimelineSet rather than per Room.
    // but for now we just do it per room for simplicity.

    let initialReadMarker = null;

    if (this.props.manageReadMarkers) {
      const readmarker = this.props.timelineSet.room.getAccountData('m.fully_read');

      if (readmarker) {
        initialReadMarker = readmarker.getContent().event_id;
      } else {
        initialReadMarker = this.getCurrentReadReceipt();
      }
    }

    this.state = {
      events: [],
      liveEvents: [],
      timelineLoading: true,
      firstVisibleEventIndex: 0,
      canBackPaginate: false,
      canForwardPaginate: false,
      readMarkerVisible: true,
      readMarkerEventId: initialReadMarker,
      backPaginating: false,
      forwardPaginating: false,
      clientSyncState: _MatrixClientPeg.MatrixClientPeg.get().getSyncState(),
      isTwelveHour: _SettingsStore.default.getValue("showTwelveHourTimestamps"),
      alwaysShowTimestamps: _SettingsStore.default.getValue("alwaysShowTimestamps"),
      readMarkerInViewThresholdMs: _SettingsStore.default.getValue("readMarkerInViewThresholdMs"),
      readMarkerOutOfViewThresholdMs: _SettingsStore.default.getValue("readMarkerOutOfViewThresholdMs")
    };
    this.dispatcherRef = _dispatcher.default.register(this.onAction);

    const _cli = _MatrixClientPeg.MatrixClientPeg.get();

    _cli.on(_room.RoomEvent.Timeline, this.onRoomTimeline);

    _cli.on(_room.RoomEvent.TimelineReset, this.onRoomTimelineReset);

    _cli.on(_room.RoomEvent.Redaction, this.onRoomRedaction);

    if (_SettingsStore.default.getValue("feature_msc3531_hide_messages_pending_moderation")) {
      // Make sure that events are re-rendered when their visibility-pending-moderation changes.
      _cli.on(_event.MatrixEventEvent.VisibilityChange, this.onEventVisibilityChange);

      _cli.on(_roomMember.RoomMemberEvent.PowerLevel, this.onVisibilityPowerLevelChange);
    } // same event handler as Room.redaction as for both we just do forceUpdate


    _cli.on(_room.RoomEvent.RedactionCancelled, this.onRoomRedaction);

    _cli.on(_room.RoomEvent.Receipt, this.onRoomReceipt);

    _cli.on(_room.RoomEvent.LocalEchoUpdated, this.onLocalEchoUpdated);

    _cli.on(_room.RoomEvent.AccountData, this.onAccountData);

    _cli.on(_event.MatrixEventEvent.Decrypted, this.onEventDecrypted);

    _cli.on(_event.MatrixEventEvent.Replaced, this.onEventReplaced);

    _cli.on(_client.ClientEvent.Sync, this.onSync);
  } // TODO: [REACT-WARNING] Move into constructor
  // eslint-disable-next-line


  UNSAFE_componentWillMount() {
    if (this.props.manageReadReceipts) {
      this.updateReadReceiptOnUserActivity();
    }

    if (this.props.manageReadMarkers) {
      this.updateReadMarkerOnUserActivity();
    }

    this.initTimeline(this.props);
  } // TODO: [REACT-WARNING] Replace with appropriate lifecycle event
  // eslint-disable-next-line


  UNSAFE_componentWillReceiveProps(newProps) {
    if (newProps.timelineSet !== this.props.timelineSet) {
      // throw new Error("changing timelineSet on a TimelinePanel is not supported");
      // regrettably, this does happen; in particular, when joining a
      // room with /join. In that case, there are two Rooms in
      // circulation - one which is created by the MatrixClient.joinRoom
      // call and used to create the RoomView, and a second which is
      // created by the sync loop once the room comes back down the /sync
      // pipe. Once the latter happens, our room is replaced with the new one.
      //
      // for now, just warn about this. But we're going to end up paginating
      // both rooms separately, and it's all bad.
      _logger.logger.warn("Replacing timelineSet on a TimelinePanel - confusion may ensue");
    }

    const differentEventId = newProps.eventId != this.props.eventId;
    const differentHighlightedEventId = newProps.highlightedEventId != this.props.highlightedEventId;
    const differentAvoidJump = newProps.eventScrollIntoView && !this.props.eventScrollIntoView;

    if (differentEventId || differentHighlightedEventId || differentAvoidJump) {
      _logger.logger.log("TimelinePanel switching to " + "eventId " + newProps.eventId + " (was " + this.props.eventId + "), " + "scrollIntoView: " + newProps.eventScrollIntoView + " (was " + this.props.eventScrollIntoView + ")");

      return this.initTimeline(newProps);
    }
  }

  componentWillUnmount() {
    // set a boolean to say we've been unmounted, which any pending
    // promises can use to throw away their results.
    //
    // (We could use isMounted, but facebook have deprecated that.)
    this.unmounted = true;

    if (this.readReceiptActivityTimer) {
      this.readReceiptActivityTimer.abort();
      this.readReceiptActivityTimer = null;
    }

    if (this.readMarkerActivityTimer) {
      this.readMarkerActivityTimer.abort();
      this.readMarkerActivityTimer = null;
    }

    _dispatcher.default.unregister(this.dispatcherRef);

    const client = _MatrixClientPeg.MatrixClientPeg.get();

    if (client) {
      client.removeListener(_room.RoomEvent.Timeline, this.onRoomTimeline);
      client.removeListener(_room.RoomEvent.TimelineReset, this.onRoomTimelineReset);
      client.removeListener(_room.RoomEvent.Redaction, this.onRoomRedaction);
      client.removeListener(_room.RoomEvent.RedactionCancelled, this.onRoomRedaction);
      client.removeListener(_room.RoomEvent.Receipt, this.onRoomReceipt);
      client.removeListener(_room.RoomEvent.LocalEchoUpdated, this.onLocalEchoUpdated);
      client.removeListener(_room.RoomEvent.AccountData, this.onAccountData);
      client.removeListener(_roomMember.RoomMemberEvent.PowerLevel, this.onVisibilityPowerLevelChange);
      client.removeListener(_event.MatrixEventEvent.Decrypted, this.onEventDecrypted);
      client.removeListener(_event.MatrixEventEvent.Replaced, this.onEventReplaced);
      client.removeListener(_event.MatrixEventEvent.VisibilityChange, this.onEventVisibilityChange);
      client.removeListener(_client.ClientEvent.Sync, this.onSync);
    }
  }
  /**
   * Logs out debug info to describe the state of the TimelinePanel and the
   * events in the room according to the matrix-js-sdk. This is useful when
   * debugging problems like messages out of order, or messages that should
   * not be showing up in a thread, etc.
   *
   * It's too expensive and cumbersome to do all of these calculations for
   * every message change so instead we only log it out when asked.
   */


  readMarkerTimeout(readMarkerPosition) {
    return readMarkerPosition === 0 ? this.context?.readMarkerInViewThresholdMs ?? this.state.readMarkerInViewThresholdMs : this.context?.readMarkerOutOfViewThresholdMs ?? this.state.readMarkerOutOfViewThresholdMs;
  }

  async updateReadMarkerOnUserActivity() {
    const initialTimeout = this.readMarkerTimeout(this.getReadMarkerPosition());
    this.readMarkerActivityTimer = new _Timer.default(initialTimeout);

    while (this.readMarkerActivityTimer) {
      //unset on unmount
      _UserActivity.default.sharedInstance().timeWhileActiveRecently(this.readMarkerActivityTimer);

      try {
        await this.readMarkerActivityTimer.finished();
      } catch (e) {
        continue;
        /* aborted */
      } // outside of try/catch to not swallow errors


      this.updateReadMarker();
    }
  }

  async updateReadReceiptOnUserActivity() {
    this.readReceiptActivityTimer = new _Timer.default(READ_RECEIPT_INTERVAL_MS);

    while (this.readReceiptActivityTimer) {
      //unset on unmount
      _UserActivity.default.sharedInstance().timeWhileActiveNow(this.readReceiptActivityTimer);

      try {
        await this.readReceiptActivityTimer.finished();
      } catch (e) {
        continue;
        /* aborted */
      } // outside of try/catch to not swallow errors


      this.sendReadReceipt();
    }
  }

  // advance the read marker past any events we sent ourselves.
  advanceReadMarkerPastMyEvents() {
    if (!this.props.manageReadMarkers) return; // we call `timelineWindow.getEvents()` rather than using
    // `this.state.liveEvents`, because React batches the update to the
    // latter, so it may not have been updated yet.

    const events = this.timelineWindow.getEvents(); // first find where the current RM is

    let i;

    for (i = 0; i < events.length; i++) {
      if (events[i].getId() == this.state.readMarkerEventId) {
        break;
      }
    }

    if (i >= events.length) {
      return;
    } // now think about advancing it


    const myUserId = _MatrixClientPeg.MatrixClientPeg.get().credentials.userId;

    for (i++; i < events.length; i++) {
      const ev = events[i];

      if (ev.getSender() !== myUserId) {
        break;
      }
    } // i is now the first unread message which we didn't send ourselves.


    i--;
    const ev = events[i];
    this.setReadMarker(ev.getId(), ev.getTs());
  }
  /* jump down to the bottom of this room, where new events are arriving
   */


  initTimeline(props) {
    const initialEvent = props.eventId;
    const pixelOffset = props.eventPixelOffset; // if a pixelOffset is given, it is relative to the bottom of the
    // container. If not, put the event in the middle of the container.

    let offsetBase = 1;

    if (pixelOffset == null) {
      offsetBase = 0.5;
    }

    return this.loadTimeline(initialEvent, pixelOffset, offsetBase, props.eventScrollIntoView);
  }

  scrollIntoView(eventId, pixelOffset, offsetBase) {
    const doScroll = () => {
      if (!this.messagePanel.current) return;

      if (eventId) {
        debuglog("TimelinePanel scrolling to eventId " + eventId + " at position " + offsetBase * 100 + "% + " + pixelOffset);
        this.messagePanel.current.scrollToEvent(eventId, pixelOffset, offsetBase);
      } else {
        debuglog("TimelinePanel scrolling to bottom");
        this.messagePanel.current.scrollToBottom();
      }
    };

    debuglog("TimelinePanel scheduling scroll to event");
    this.props.onEventScrolledIntoView?.(eventId); // Ensure the correct scroll position pre render, if the messages have already been loaded to DOM,
    // to avoid it jumping around

    doScroll(); // Ensure the correct scroll position post render for correct behaviour.
    //
    // requestAnimationFrame runs our code immediately after the DOM update but before the next repaint.
    //
    // If the messages have just been loaded for the first time, this ensures we'll repeat setting the
    // correct scroll position after React has re-rendered the TimelinePanel and MessagePanel and
    // updated the DOM.

    window.requestAnimationFrame(() => {
      doScroll();
    });
  }
  /**
   * (re)-load the event timeline, and initialise the scroll state, centered
   * around the given event.
   *
   * @param {string?}  eventId the event to focus on. If undefined, will
   *    scroll to the bottom of the room.
   *
   * @param {number?} pixelOffset   offset to position the given event at
   *    (pixels from the offsetBase). If omitted, defaults to 0.
   *
   * @param {number?} offsetBase the reference point for the pixelOffset. 0
   *     means the top of the container, 1 means the bottom, and fractional
   *     values mean somewhere in the middle. If omitted, it defaults to 0.
   *
   * @param {boolean?} scrollIntoView whether to scroll the event into view.
   */


  loadTimeline(eventId, pixelOffset, offsetBase) {
    let scrollIntoView = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    this.timelineWindow = new _timelineWindow.TimelineWindow(cli, this.props.timelineSet, {
      windowLimit: this.props.timelineCap
    });

    const onLoaded = () => {
      if (this.unmounted) return; // clear the timeline min-height when (re)loading the timeline

      this.messagePanel.current?.onTimelineReset();
      this.reloadEvents(); // If we switched away from the room while there were pending
      // outgoing events, the read-marker will be before those events.
      // We need to skip over any which have subsequently been sent.

      this.advanceReadMarkerPastMyEvents();
      this.setState({
        canBackPaginate: this.timelineWindow.canPaginate(_eventTimeline.EventTimeline.BACKWARDS),
        canForwardPaginate: this.timelineWindow.canPaginate(_eventTimeline.EventTimeline.FORWARDS),
        timelineLoading: false
      }, () => {
        // initialise the scroll state of the message panel
        if (!this.messagePanel.current) {
          // this shouldn't happen - we know we're mounted because
          // we're in a setState callback, and we know
          // timelineLoading is now false, so render() should have
          // mounted the message panel.
          _logger.logger.log("can't initialise scroll state because messagePanel didn't load");

          return;
        }

        if (scrollIntoView) {
          this.scrollIntoView(eventId, pixelOffset, offsetBase);
        }

        if (this.props.sendReadReceiptOnLoad) {
          this.sendReadReceipt();
        }
      });
    };

    const onError = error => {
      if (this.unmounted) return;
      this.setState({
        timelineLoading: false
      });

      _logger.logger.error(`Error loading timeline panel at ${this.props.timelineSet.room?.roomId}/${eventId}: ${error}`);

      let onFinished; // if we were given an event ID, then when the user closes the
      // dialog, let's jump to the end of the timeline. If we weren't,
      // something has gone badly wrong and rather than causing a loop of
      // undismissable dialogs, let's just give up.

      if (eventId) {
        onFinished = () => {
          // go via the dispatcher so that the URL is updated
          _dispatcher.default.dispatch({
            action: _actions.Action.ViewRoom,
            room_id: this.props.timelineSet.room.roomId,
            metricsTrigger: undefined // room doesn't change

          });
        };
      }

      let description;

      if (error.errcode == 'M_FORBIDDEN') {
        description = (0, _languageHandler._t)("Tried to load a specific point in this room's timeline, but you " + "do not have permission to view the message in question.");
      } else {
        description = (0, _languageHandler._t)("Tried to load a specific point in this room's timeline, but was " + "unable to find it.");
      }

      _Modal.default.createDialog(_ErrorDialog.default, {
        title: (0, _languageHandler._t)("Failed to load timeline position"),
        description,
        onFinished
      });
    }; // if we already have the event in question, TimelineWindow.load
    // returns a resolved promise.
    //
    // In this situation, we don't really want to defer the update of the
    // state to the next event loop, because it makes room-switching feel
    // quite slow. So we detect that situation and shortcut straight to
    // calling _reloadEvents and updating the state.


    const timeline = this.props.timelineSet.getTimelineForEvent(eventId);

    if (timeline) {
      // This is a hot-path optimization by skipping a promise tick
      // by repeating a no-op sync branch in TimelineSet.getTimelineForEvent & MatrixClient.getEventTimeline
      this.timelineWindow.load(eventId, INITIAL_SIZE); // in this branch this method will happen in sync time

      onLoaded();
    } else {
      const prom = this.timelineWindow.load(eventId, INITIAL_SIZE);
      this.buildLegacyCallEventGroupers();
      this.setState({
        events: [],
        liveEvents: [],
        canBackPaginate: false,
        canForwardPaginate: false,
        timelineLoading: true
      });
      prom.then(onLoaded, onError);
    }
  } // handle the completion of a timeline load or localEchoUpdate, by
  // reloading the events from the timelinewindow and pending event list into
  // the state.


  reloadEvents() {
    // we might have switched rooms since the load started - just bin
    // the results if so.
    if (this.unmounted) return;
    const state = this.getEvents();
    this.buildLegacyCallEventGroupers(state.events);
    this.setState(state);
  } // Force refresh the timeline before threads support pending events


  refreshTimeline() {
    this.loadTimeline();
    this.reloadEvents();
  } // get the list of events from the timeline window and the pending event list


  getEvents() {
    const events = this.timelineWindow.getEvents(); // `arrayFastClone` performs a shallow copy of the array
    // we want the last event to be decrypted first but displayed last
    // `reverse` is destructive and unfortunately mutates the "events" array

    (0, _arrays.arrayFastClone)(events).reverse().forEach(event => {
      const client = _MatrixClientPeg.MatrixClientPeg.get();

      client.decryptEventIfNeeded(event);
    });
    const firstVisibleEventIndex = this.checkForPreJoinUISI(events); // Hold onto the live events separately. The read receipt and read marker
    // should use this list, so that they don't advance into pending events.

    const liveEvents = [...events]; // if we're at the end of the live timeline, append the pending events

    if (!this.timelineWindow.canPaginate(_eventTimeline.EventTimeline.FORWARDS)) {
      const pendingEvents = this.props.timelineSet.getPendingEvents();
      events.push(...pendingEvents.filter(event => {
        const {
          shouldLiveInRoom,
          threadId
        } = this.props.timelineSet.room.eventShouldLiveIn(event, pendingEvents);

        if (this.context.timelineRenderingType === _RoomContext.TimelineRenderingType.Thread) {
          return threadId === this.context.threadId;
        }

        {
          return shouldLiveInRoom;
        }
      }));
    }

    return {
      events,
      liveEvents,
      firstVisibleEventIndex
    };
  }
  /**
   * Check for undecryptable messages that were sent while the user was not in
   * the room.
   *
   * @param {Array<MatrixEvent>} events The timeline events to check
   *
   * @return {Number} The index within `events` of the event after the most recent
   * undecryptable event that was sent while the user was not in the room.  If no
   * such events were found, then it returns 0.
   */


  checkForPreJoinUISI(events) {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const room = this.props.timelineSet.room;
    const isThreadTimeline = [_RoomContext.TimelineRenderingType.Thread, _RoomContext.TimelineRenderingType.ThreadsList].includes(this.context.timelineRenderingType);

    if (events.length === 0 || !room || !cli.isRoomEncrypted(room.roomId) || isThreadTimeline) {
      _logger.logger.info("checkForPreJoinUISI: showing all messages, skipping check");

      return 0;
    }

    const userId = cli.credentials.userId; // get the user's membership at the last event by getting the timeline
    // that the event belongs to, and traversing the timeline looking for
    // that event, while keeping track of the user's membership

    let i = events.length - 1;
    let userMembership = "leave";

    for (; i >= 0; i--) {
      const timeline = room.getTimelineForEvent(events[i].getId());

      if (!timeline) {
        // Somehow, it seems to be possible for live events to not have
        // a timeline, even though that should not happen. :(
        // https://github.com/vector-im/element-web/issues/12120
        _logger.logger.warn(`Event ${events[i].getId()} in room ${room.roomId} is live, ` + `but it does not have a timeline`);

        continue;
      }

      userMembership = timeline.getState(_eventTimeline.EventTimeline.FORWARDS).getMember(userId)?.membership ?? "leave";
      const timelineEvents = timeline.getEvents();

      for (let j = timelineEvents.length - 1; j >= 0; j--) {
        const event = timelineEvents[j];

        if (event.getId() === events[i].getId()) {
          break;
        } else if (event.getStateKey() === userId && event.getType() === _event2.EventType.RoomMember) {
          userMembership = event.getPrevContent().membership || "leave";
        }
      }

      break;
    } // now go through the rest of the events and find the first undecryptable
    // one that was sent when the user wasn't in the room


    for (; i >= 0; i--) {
      const event = events[i];

      if (event.getStateKey() === userId && event.getType() === _event2.EventType.RoomMember) {
        userMembership = event.getPrevContent().membership || "leave";
      } else if (userMembership === "leave" && (event.isDecryptionFailure() || event.isBeingDecrypted())) {
        // reached an undecryptable message when the user wasn't in the room -- don't try to load any more
        // Note: for now, we assume that events that are being decrypted are
        // not decryptable - we will be called once more when it is decrypted.
        _logger.logger.info("checkForPreJoinUISI: reached a pre-join UISI at index ", i);

        return i + 1;
      }
    }

    _logger.logger.info("checkForPreJoinUISI: did not find pre-join UISI");

    return 0;
  }

  indexForEventId(evId) {
    /* Threads do not have server side support for read receipts and the concept
    is very tied to the main room timeline, we are forcing the timeline to
    send read receipts for threaded events */
    const isThreadTimeline = this.context.timelineRenderingType === _RoomContext.TimelineRenderingType.Thread;

    if (_SettingsStore.default.getValue("feature_thread") && isThreadTimeline) {
      return 0;
    }

    const index = this.state.events.findIndex(ev => ev.getId() === evId);
    return index > -1 ? index : null;
  }

  getLastDisplayedEventIndex() {
    let opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    const ignoreOwn = opts.ignoreOwn || false;
    const allowPartial = opts.allowPartial || false;
    const messagePanel = this.messagePanel.current;
    if (!messagePanel) return null;

    const messagePanelNode = _reactDom.default.findDOMNode(messagePanel);

    if (!messagePanelNode) return null; // sometimes this happens for fresh rooms/post-sync

    const wrapperRect = messagePanelNode.getBoundingClientRect();

    const myUserId = _MatrixClientPeg.MatrixClientPeg.get().credentials.userId;

    const isNodeInView = node => {
      if (node) {
        const boundingRect = node.getBoundingClientRect();

        if (allowPartial && boundingRect.top <= wrapperRect.bottom || !allowPartial && boundingRect.bottom <= wrapperRect.bottom) {
          return true;
        }
      }

      return false;
    }; // We keep track of how many of the adjacent events didn't have a tile
    // but should have the read receipt moved past them, so
    // we can include those once we find the last displayed (visible) event.
    // The counter is not started for events we don't want
    // to send a read receipt for (our own events, local echos).


    let adjacentInvisibleEventCount = 0; // Use `liveEvents` here because we don't want the read marker or read
    // receipt to advance into pending events.

    for (let i = this.state.liveEvents.length - 1; i >= 0; --i) {
      const ev = this.state.liveEvents[i];
      const node = messagePanel.getNodeForEventId(ev.getId());
      const isInView = isNodeInView(node); // when we've reached the first visible event, and the previous
      // events were all invisible (with the first one not being ignored),
      // return the index of the first invisible event.

      if (isInView && adjacentInvisibleEventCount !== 0) {
        return i + adjacentInvisibleEventCount;
      }

      if (node && !isInView) {
        // has node but not in view, so reset adjacent invisible events
        adjacentInvisibleEventCount = 0;
      }

      const shouldIgnore = !!ev.status || // local echo
      ignoreOwn && ev.getSender() === myUserId; // own message

      const isWithoutTile = !(0, _EventTileFactory.haveRendererForEvent)(ev, this.context?.showHiddenEvents) || (0, _shouldHideEvent.default)(ev, this.context);

      if (isWithoutTile || !node) {
        // don't start counting if the event should be ignored,
        // but continue counting if we were already so the offset
        // to the previous invisble event that didn't need to be ignored
        // doesn't get messed up
        if (!shouldIgnore || shouldIgnore && adjacentInvisibleEventCount !== 0) {
          ++adjacentInvisibleEventCount;
        }

        continue;
      }

      if (shouldIgnore) {
        continue;
      }

      if (isInView) {
        return i;
      }
    }

    return null;
  }
  /**
   * Get the id of the event corresponding to our user's latest read-receipt.
   *
   * @param {Boolean} ignoreSynthesized If true, return only receipts that
   *                                    have been sent by the server, not
   *                                    implicit ones generated by the JS
   *                                    SDK.
   * @return {String} the event ID
   */


  getCurrentReadReceipt() {
    let ignoreSynthesized = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    const client = _MatrixClientPeg.MatrixClientPeg.get(); // the client can be null on logout


    if (client == null) {
      return null;
    }

    const myUserId = client.credentials.userId;
    return this.props.timelineSet.room.getEventReadUpTo(myUserId, ignoreSynthesized);
  }

  setReadMarker(eventId, eventTs) {
    let inhibitSetState = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    const roomId = this.props.timelineSet.room.roomId; // don't update the state (and cause a re-render) if there is
    // no change to the RM.

    if (eventId === this.state.readMarkerEventId) {
      return;
    } // in order to later figure out if the read marker is
    // above or below the visible timeline, we stash the timestamp.


    TimelinePanel.roomReadMarkerTsMap[roomId] = eventTs;

    if (inhibitSetState) {
      return;
    } // Do the local echo of the RM
    // run the render cycle before calling the callback, so that
    // getReadMarkerPosition() returns the right thing.


    this.setState({
      readMarkerEventId: eventId
    }, this.props.onReadMarkerUpdated);
  }

  shouldPaginate() {
    // don't try to paginate while events in the timeline are
    // still being decrypted. We don't render events while they're
    // being decrypted, so they don't take up space in the timeline.
    // This means we can pull quite a lot of events into the timeline
    // and end up trying to render a lot of events.
    return !this.state.events.some(e => {
      return e.isBeingDecrypted();
    });
  }

  buildLegacyCallEventGroupers(events) {
    this.callEventGroupers = (0, _LegacyCallEventGrouper.buildLegacyCallEventGroupers)(this.callEventGroupers, events);
  }

  render() {
    // just show a spinner while the timeline loads.
    //
    // put it in a div of the right class (mx_RoomView_messagePanel) so
    // that the order in the roomview flexbox is correct, and
    // mx_RoomView_messageListWrapper to position the inner div in the
    // right place.
    //
    // Note that the click-on-search-result functionality relies on the
    // fact that the messagePanel is hidden while the timeline reloads,
    // but that the RoomHeader (complete with search term) continues to
    // exist.
    if (this.state.timelineLoading) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_RoomView_messagePanelSpinner"
      }, /*#__PURE__*/_react.default.createElement(_Spinner.default, null));
    }

    if (this.state.events.length == 0 && !this.state.canBackPaginate && this.props.empty) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: this.props.className + " mx_RoomView_messageListWrapper"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_RoomView_empty"
      }, this.props.empty));
    } // give the messagepanel a stickybottom if we're at the end of the
    // live timeline, so that the arrival of new events triggers a
    // scroll.
    //
    // Make sure that stickyBottom is *false* if we can paginate
    // forwards, otherwise if somebody hits the bottom of the loaded
    // events when viewing historical messages, we get stuck in a loop
    // of paginating our way through the entire history of the room.


    const stickyBottom = !this.timelineWindow.canPaginate(_eventTimeline.EventTimeline.FORWARDS); // If the state is PREPARED or CATCHUP, we're still waiting for the js-sdk to sync with
    // the HS and fetch the latest events, so we are effectively forward paginating.

    const forwardPaginating = this.state.forwardPaginating || ['PREPARED', 'CATCHUP'].includes(this.state.clientSyncState);
    const events = this.state.firstVisibleEventIndex ? this.state.events.slice(this.state.firstVisibleEventIndex) : this.state.events;
    return /*#__PURE__*/_react.default.createElement(_MessagePanel.default, {
      ref: this.messagePanel,
      room: this.props.timelineSet.room,
      permalinkCreator: this.props.permalinkCreator,
      hidden: this.props.hidden,
      backPaginating: this.state.backPaginating,
      forwardPaginating: forwardPaginating,
      events: events,
      highlightedEventId: this.props.highlightedEventId,
      readMarkerEventId: this.state.readMarkerEventId,
      readMarkerVisible: this.state.readMarkerVisible,
      canBackPaginate: this.state.canBackPaginate && this.state.firstVisibleEventIndex === 0,
      showUrlPreview: this.props.showUrlPreview,
      showReadReceipts: this.props.showReadReceipts,
      ourUserId: _MatrixClientPeg.MatrixClientPeg.get().credentials.userId,
      stickyBottom: stickyBottom,
      onScroll: this.onMessageListScroll,
      onFillRequest: this.onMessageListFillRequest,
      onUnfillRequest: this.onMessageListUnfillRequest,
      isTwelveHour: this.context?.showTwelveHourTimestamps ?? this.state.isTwelveHour,
      alwaysShowTimestamps: this.props.alwaysShowTimestamps ?? this.context?.alwaysShowTimestamps ?? this.state.alwaysShowTimestamps,
      className: this.props.className,
      resizeNotifier: this.props.resizeNotifier,
      getRelationsForEvent: this.getRelationsForEvent,
      editState: this.props.editState,
      showReactions: this.props.showReactions,
      layout: this.props.layout,
      hideThreadedMessages: this.props.hideThreadedMessages,
      disableGrouping: this.props.disableGrouping,
      callEventGroupers: this.callEventGroupers
    });
  }

}
/**
 * Iterate across all of the timelineSets and timelines inside to expose all of
 * the event IDs contained inside.
 *
 * @return An event ID list for every timeline in every timelineSet
 */


(0, _defineProperty2.default)(TimelinePanel, "contextType", _RoomContext.default);
(0, _defineProperty2.default)(TimelinePanel, "roomReadMarkerTsMap", {});
(0, _defineProperty2.default)(TimelinePanel, "defaultProps", {
  // By default, disable the timelineCap in favour of unpaginating based on
  // event tile heights. (See _unpaginateEvents)
  timelineCap: Number.MAX_VALUE,
  className: 'mx_RoomView_messagePanel',
  sendReadReceiptOnLoad: true,
  hideThreadedMessages: true,
  disableGrouping: false
});

function serializeEventIdsFromTimelineSets(timelineSets) {
  const serializedEventIdsInTimelineSet = timelineSets.map(timelineSet => {
    const timelineMap = {};
    const timelines = timelineSet.getTimelines();
    const liveTimeline = timelineSet.getLiveTimeline();
    timelines.forEach((timeline, index) => {
      // Add a special label when it is the live timeline so we can tell
      // it apart from the others
      const isLiveTimeline = timeline === liveTimeline;
      timelineMap[isLiveTimeline ? 'liveTimeline' : `${index}`] = timeline.getEvents().map(ev => ev.getId());
    });
    return timelineMap;
  });
  return serializedEventIdsInTimelineSet;
}

var _default = TimelinePanel;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQQUdJTkFURV9TSVpFIiwiSU5JVElBTF9TSVpFIiwiUkVBRF9SRUNFSVBUX0lOVEVSVkFMX01TIiwiUkVBRF9NQVJLRVJfREVCT1VOQ0VfTVMiLCJkZWJ1Z2xvZyIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsImFyZ3MiLCJsb2dnZXIiLCJsb2ciLCJjYWxsIiwiY29uc29sZSIsIlRpbWVsaW5lUGFuZWwiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjb250ZXh0IiwidW5kZWZpbmVkIiwiY3JlYXRlUmVmIiwiTWFwIiwicm9vbSIsInRpbWVsaW5lU2V0IiwiZXZlbnRJZExpc3QiLCJzdGF0ZSIsImV2ZW50cyIsIm1hcCIsImV2IiwiZ2V0SWQiLCJyZW5kZXJlZEV2ZW50SWRzIiwibWVzc2FnZVBhbmVsIiwiY3VycmVudCIsIm1lc3NhZ2VQYW5lbE5vZGUiLCJSZWFjdERPTSIsImZpbmRET01Ob2RlIiwiYWN0dWFsbHlSZW5kZXJlZEV2ZW50cyIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJyZW5kZXJlZEV2ZW50IiwiZ2V0QXR0cmlidXRlIiwiZXJyIiwiZXJyb3IiLCJzZXJpYWxpemVkRXZlbnRJZHNGcm9tVGltZWxpbmVTZXRzIiwic2VyaWFsaXplZEV2ZW50SWRzRnJvbVRocmVhZHNUaW1lbGluZVNldHMiLCJzZXJpYWxpemVkVGhyZWFkc01hcCIsInRpbWVsaW5lU2V0cyIsImdldFRpbWVsaW5lU2V0cyIsInRocmVhZHNUaW1lbGluZVNldHMiLCJzZXJpYWxpemVFdmVudElkc0Zyb21UaW1lbGluZVNldHMiLCJnZXRUaHJlYWRzIiwiZm9yRWFjaCIsInRocmVhZCIsImlkIiwibnVtVGltZWxpbmVzIiwiZ2V0VGltZWxpbmVzIiwibGVuZ3RoIiwibGl2ZVRpbWVsaW5lIiwiZ2V0TGl2ZVRpbWVsaW5lIiwiZ2V0RXZlbnRzIiwicHJldlRpbWVsaW5lIiwiZ2V0TmVpZ2hib3VyaW5nVGltZWxpbmUiLCJEaXJlY3Rpb24iLCJCYWNrd2FyZCIsIm5leHRUaW1lbGluZSIsIkZvcndhcmQiLCJ0aW1lbGluZVdpbmRvd0V2ZW50SWRzIiwidGltZWxpbmVXaW5kb3ciLCJwZW5kaW5nRXZlbnRJZHMiLCJnZXRQZW5kaW5nRXZlbnRzIiwiZGVidWciLCJ0aW1lbGluZVJlbmRlcmluZ1R5cGUiLCJyb29tSWQiLCJKU09OIiwic3RyaW5naWZ5IiwiYmFja3dhcmRzIiwic2Nyb2xsVG9rZW4iLCJkaXIiLCJFdmVudFRpbWVsaW5lIiwiQkFDS1dBUkRTIiwiRk9SV0FSRFMiLCJldmVudElkIiwibWFya2VyIiwiZmluZEluZGV4IiwiY291bnQiLCJ1bnBhZ2luYXRlIiwibGl2ZUV2ZW50cyIsImZpcnN0VmlzaWJsZUV2ZW50SW5kZXgiLCJidWlsZExlZ2FjeUNhbGxFdmVudEdyb3VwZXJzIiwibmV3U3RhdGUiLCJjYW5CYWNrUGFnaW5hdGUiLCJjYW5Gb3J3YXJkUGFnaW5hdGUiLCJzZXRTdGF0ZSIsImRpcmVjdGlvbiIsInNpemUiLCJvblBhZ2luYXRpb25SZXF1ZXN0IiwicGFnaW5hdGUiLCJzaG91bGRQYWdpbmF0ZSIsIlByb21pc2UiLCJyZXNvbHZlIiwiY2FuUGFnaW5hdGVLZXkiLCJwYWdpbmF0aW5nS2V5IiwiY2FuUGFnaW5hdGUiLCJ0aGVuIiwiciIsInVubW91bnRlZCIsIm90aGVyRGlyZWN0aW9uIiwiY2FuUGFnaW5hdGVPdGhlcldheUtleSIsImUiLCJvblNjcm9sbCIsIm1hbmFnZVJlYWRNYXJrZXJzIiwiZG9NYW5hZ2VSZWFkTWFya2VycyIsImRlYm91bmNlIiwicm1Qb3NpdGlvbiIsImdldFJlYWRNYXJrZXJQb3NpdGlvbiIsInJlYWRNYXJrZXJWaXNpYmxlIiwidGltZW91dCIsInJlYWRNYXJrZXJUaW1lb3V0IiwicmVhZE1hcmtlckFjdGl2aXR5VGltZXIiLCJjaGFuZ2VUaW1lb3V0IiwibGVhZGluZyIsInRyYWlsaW5nIiwicGF5bG9hZCIsImFjdGlvbiIsImZvcmNlVXBkYXRlIiwiQWN0aW9uIiwiRHVtcERlYnVnTG9ncyIsIm9uRHVtcERlYnVnTG9ncyIsInRvU3RhcnRPZlRpbWVsaW5lIiwicmVtb3ZlZCIsImRhdGEiLCJ0aW1lbGluZSIsImdldFRpbWVsaW5lU2V0IiwiVGhyZWFkIiwiaGFzU2VydmVyU2lkZVN1cHBvcnQiLCJUaW1lbGluZVJlbmRlcmluZ1R5cGUiLCJsaXZlRXZlbnQiLCJnZXRTY3JvbGxTdGF0ZSIsInN0dWNrQXRCb3R0b20iLCJsYXN0TGl2ZUV2ZW50IiwidXBkYXRlZFN0YXRlIiwiY2FsbFJNVXBkYXRlZCIsIm15VXNlcklkIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiY3JlZGVudGlhbHMiLCJ1c2VySWQiLCJnZXRTZW5kZXIiLCJVc2VyQWN0aXZpdHkiLCJzaGFyZWRJbnN0YW5jZSIsInVzZXJBY3RpdmVSZWNlbnRseSIsInNldFJlYWRNYXJrZXIiLCJnZXRUcyIsInJlYWRNYXJrZXJFdmVudElkIiwidXBkYXRlVGltZWxpbmVNaW5IZWlnaHQiLCJvblJlYWRNYXJrZXJVcGRhdGVkIiwiaXNBdEJvdHRvbSIsImxvYWRUaW1lbGluZSIsImdldFJvb21JZCIsInRpbGUiLCJnZXRUaWxlRm9yRXZlbnRJZCIsIm1lbWJlciIsImV2ZW50IiwicmVwbGFjZWRFdmVudCIsIm9sZEV2ZW50SWQiLCJyZWxvYWRFdmVudHMiLCJnZXRUeXBlIiwiRXZlbnRUeXBlIiwiRnVsbHlSZWFkIiwiZ2V0Q29udGVudCIsImV2ZW50X2lkIiwiaW5jbHVkZXMiLCJyZWNoZWNrRmlyc3RWaXNpYmxlRXZlbnRJbmRleCIsImNsaWVudFN5bmNTdGF0ZSIsInByZXZTdGF0ZSIsInRocm90dGxlIiwiY2hlY2tGb3JQcmVKb2luVUlTSSIsIm1hbmFnZVJlYWRSZWNlaXB0cyIsImNsaSIsImlzR3Vlc3QiLCJzaG91bGRTZW5kUlIiLCJjdXJyZW50UlJFdmVudElkIiwiZ2V0Q3VycmVudFJlYWRSZWNlaXB0IiwiY3VycmVudFJSRXZlbnRJbmRleCIsImluZGV4Rm9yRXZlbnRJZCIsImxhc3RSZWFkRXZlbnRJbmRleCIsImdldExhc3REaXNwbGF5ZWRFdmVudEluZGV4IiwiaWdub3JlT3duIiwibGFzdFJlYWRFdmVudCIsImxhc3RSUlNlbnRFdmVudElkIiwic2hvdWxkU2VuZFJNIiwibGFzdFJNU2VudEV2ZW50SWQiLCJzZW5kUlJzIiwic2V0Um9vbVJlYWRNYXJrZXJzIiwiY2F0Y2giLCJlcnJjb2RlIiwicHJpdmF0ZUZpZWxkIiwiZ2V0UHJpdmF0ZVJlYWRSZWNlaXB0RmllbGQiLCJzZW5kUmVhZFJlY2VpcHQiLCJSZWNlaXB0VHlwZSIsIlJlYWQiLCJpc0F0RW5kT2ZMaXZlVGltZWxpbmUiLCJzZXRVbnJlYWROb3RpZmljYXRpb25Db3VudCIsIk5vdGlmaWNhdGlvbkNvdW50VHlwZSIsIlRvdGFsIiwiSGlnaGxpZ2h0IiwiZGlzIiwiZGlzcGF0Y2giLCJsYXN0RGlzcGxheWVkSW5kZXgiLCJhbGxvd1BhcnRpYWwiLCJsYXN0RGlzcGxheWVkRXZlbnQiLCJzY3JvbGxUb0JvdHRvbSIsInNjcm9sbFRvRXZlbnRJZk5lZWRlZCIsInJldCIsInNjcm9sbFRvRXZlbnQiLCJybUlkIiwidGwiLCJnZXRUaW1lbGluZUZvckV2ZW50Iiwicm1UcyIsImZpbmQiLCJyb29tUmVhZE1hcmtlclRzTWFwIiwicG9zIiwiZ2V0S2V5QmluZGluZ3NNYW5hZ2VyIiwiZ2V0Um9vbUFjdGlvbiIsIktleUJpbmRpbmdBY3Rpb24iLCJKdW1wVG9MYXRlc3RNZXNzYWdlIiwianVtcFRvTGl2ZVRpbWVsaW5lIiwiaGFuZGxlU2Nyb2xsS2V5IiwicmVsYXRpb25UeXBlIiwiZXZlbnRUeXBlIiwicmVsYXRpb25zIiwiZ2V0Q2hpbGRFdmVudHNGb3JFdmVudCIsImluaXRpYWxSZWFkTWFya2VyIiwicmVhZG1hcmtlciIsImdldEFjY291bnREYXRhIiwidGltZWxpbmVMb2FkaW5nIiwiYmFja1BhZ2luYXRpbmciLCJmb3J3YXJkUGFnaW5hdGluZyIsImdldFN5bmNTdGF0ZSIsImlzVHdlbHZlSG91ciIsImFsd2F5c1Nob3dUaW1lc3RhbXBzIiwicmVhZE1hcmtlckluVmlld1RocmVzaG9sZE1zIiwicmVhZE1hcmtlck91dE9mVmlld1RocmVzaG9sZE1zIiwiZGlzcGF0Y2hlclJlZiIsInJlZ2lzdGVyIiwib25BY3Rpb24iLCJvbiIsIlJvb21FdmVudCIsIlRpbWVsaW5lIiwib25Sb29tVGltZWxpbmUiLCJUaW1lbGluZVJlc2V0Iiwib25Sb29tVGltZWxpbmVSZXNldCIsIlJlZGFjdGlvbiIsIm9uUm9vbVJlZGFjdGlvbiIsIk1hdHJpeEV2ZW50RXZlbnQiLCJWaXNpYmlsaXR5Q2hhbmdlIiwib25FdmVudFZpc2liaWxpdHlDaGFuZ2UiLCJSb29tTWVtYmVyRXZlbnQiLCJQb3dlckxldmVsIiwib25WaXNpYmlsaXR5UG93ZXJMZXZlbENoYW5nZSIsIlJlZGFjdGlvbkNhbmNlbGxlZCIsIlJlY2VpcHQiLCJvblJvb21SZWNlaXB0IiwiTG9jYWxFY2hvVXBkYXRlZCIsIm9uTG9jYWxFY2hvVXBkYXRlZCIsIkFjY291bnREYXRhIiwib25BY2NvdW50RGF0YSIsIkRlY3J5cHRlZCIsIm9uRXZlbnREZWNyeXB0ZWQiLCJSZXBsYWNlZCIsIm9uRXZlbnRSZXBsYWNlZCIsIkNsaWVudEV2ZW50IiwiU3luYyIsIm9uU3luYyIsIlVOU0FGRV9jb21wb25lbnRXaWxsTW91bnQiLCJ1cGRhdGVSZWFkUmVjZWlwdE9uVXNlckFjdGl2aXR5IiwidXBkYXRlUmVhZE1hcmtlck9uVXNlckFjdGl2aXR5IiwiaW5pdFRpbWVsaW5lIiwiVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJuZXdQcm9wcyIsIndhcm4iLCJkaWZmZXJlbnRFdmVudElkIiwiZGlmZmVyZW50SGlnaGxpZ2h0ZWRFdmVudElkIiwiaGlnaGxpZ2h0ZWRFdmVudElkIiwiZGlmZmVyZW50QXZvaWRKdW1wIiwiZXZlbnRTY3JvbGxJbnRvVmlldyIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVhZFJlY2VpcHRBY3Rpdml0eVRpbWVyIiwiYWJvcnQiLCJ1bnJlZ2lzdGVyIiwiY2xpZW50IiwicmVtb3ZlTGlzdGVuZXIiLCJyZWFkTWFya2VyUG9zaXRpb24iLCJpbml0aWFsVGltZW91dCIsIlRpbWVyIiwidGltZVdoaWxlQWN0aXZlUmVjZW50bHkiLCJmaW5pc2hlZCIsInVwZGF0ZVJlYWRNYXJrZXIiLCJ0aW1lV2hpbGVBY3RpdmVOb3ciLCJhZHZhbmNlUmVhZE1hcmtlclBhc3RNeUV2ZW50cyIsImkiLCJpbml0aWFsRXZlbnQiLCJwaXhlbE9mZnNldCIsImV2ZW50UGl4ZWxPZmZzZXQiLCJvZmZzZXRCYXNlIiwic2Nyb2xsSW50b1ZpZXciLCJkb1Njcm9sbCIsIm9uRXZlbnRTY3JvbGxlZEludG9WaWV3Iiwid2luZG93IiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwiVGltZWxpbmVXaW5kb3ciLCJ3aW5kb3dMaW1pdCIsInRpbWVsaW5lQ2FwIiwib25Mb2FkZWQiLCJvblRpbWVsaW5lUmVzZXQiLCJzZW5kUmVhZFJlY2VpcHRPbkxvYWQiLCJvbkVycm9yIiwib25GaW5pc2hlZCIsIlZpZXdSb29tIiwicm9vbV9pZCIsIm1ldHJpY3NUcmlnZ2VyIiwiZGVzY3JpcHRpb24iLCJfdCIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwiRXJyb3JEaWFsb2ciLCJ0aXRsZSIsImxvYWQiLCJwcm9tIiwicmVmcmVzaFRpbWVsaW5lIiwiYXJyYXlGYXN0Q2xvbmUiLCJyZXZlcnNlIiwiZGVjcnlwdEV2ZW50SWZOZWVkZWQiLCJwZW5kaW5nRXZlbnRzIiwicHVzaCIsImZpbHRlciIsInNob3VsZExpdmVJblJvb20iLCJ0aHJlYWRJZCIsImV2ZW50U2hvdWxkTGl2ZUluIiwiaXNUaHJlYWRUaW1lbGluZSIsIlRocmVhZHNMaXN0IiwiaXNSb29tRW5jcnlwdGVkIiwiaW5mbyIsInVzZXJNZW1iZXJzaGlwIiwiZ2V0U3RhdGUiLCJnZXRNZW1iZXIiLCJtZW1iZXJzaGlwIiwidGltZWxpbmVFdmVudHMiLCJqIiwiZ2V0U3RhdGVLZXkiLCJSb29tTWVtYmVyIiwiZ2V0UHJldkNvbnRlbnQiLCJpc0RlY3J5cHRpb25GYWlsdXJlIiwiaXNCZWluZ0RlY3J5cHRlZCIsImV2SWQiLCJpbmRleCIsIm9wdHMiLCJ3cmFwcGVyUmVjdCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsImlzTm9kZUluVmlldyIsIm5vZGUiLCJib3VuZGluZ1JlY3QiLCJ0b3AiLCJib3R0b20iLCJhZGphY2VudEludmlzaWJsZUV2ZW50Q291bnQiLCJnZXROb2RlRm9yRXZlbnRJZCIsImlzSW5WaWV3Iiwic2hvdWxkSWdub3JlIiwic3RhdHVzIiwiaXNXaXRob3V0VGlsZSIsImhhdmVSZW5kZXJlckZvckV2ZW50Iiwic2hvd0hpZGRlbkV2ZW50cyIsInNob3VsZEhpZGVFdmVudCIsImlnbm9yZVN5bnRoZXNpemVkIiwiZ2V0RXZlbnRSZWFkVXBUbyIsImV2ZW50VHMiLCJpbmhpYml0U2V0U3RhdGUiLCJzb21lIiwiY2FsbEV2ZW50R3JvdXBlcnMiLCJyZW5kZXIiLCJlbXB0eSIsImNsYXNzTmFtZSIsInN0aWNreUJvdHRvbSIsInNsaWNlIiwicGVybWFsaW5rQ3JlYXRvciIsImhpZGRlbiIsInNob3dVcmxQcmV2aWV3Iiwic2hvd1JlYWRSZWNlaXB0cyIsIm9uTWVzc2FnZUxpc3RTY3JvbGwiLCJvbk1lc3NhZ2VMaXN0RmlsbFJlcXVlc3QiLCJvbk1lc3NhZ2VMaXN0VW5maWxsUmVxdWVzdCIsInNob3dUd2VsdmVIb3VyVGltZXN0YW1wcyIsInJlc2l6ZU5vdGlmaWVyIiwiZ2V0UmVsYXRpb25zRm9yRXZlbnQiLCJlZGl0U3RhdGUiLCJzaG93UmVhY3Rpb25zIiwibGF5b3V0IiwiaGlkZVRocmVhZGVkTWVzc2FnZXMiLCJkaXNhYmxlR3JvdXBpbmciLCJSb29tQ29udGV4dCIsIk51bWJlciIsIk1BWF9WQUxVRSIsInNlcmlhbGl6ZWRFdmVudElkc0luVGltZWxpbmVTZXQiLCJ0aW1lbGluZU1hcCIsInRpbWVsaW5lcyIsImlzTGl2ZVRpbWVsaW5lIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvc3RydWN0dXJlcy9UaW1lbGluZVBhbmVsLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTYgLSAyMDIyIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IGNyZWF0ZVJlZiwgUmVhY3ROb2RlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFJlYWN0RE9NIGZyb20gXCJyZWFjdC1kb21cIjtcbmltcG9ydCB7IE5vdGlmaWNhdGlvbkNvdW50VHlwZSwgUm9vbSwgUm9vbUV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQgeyBNYXRyaXhFdmVudCwgTWF0cml4RXZlbnRFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnRcIjtcbmltcG9ydCB7IEV2ZW50VGltZWxpbmVTZXQsIElSb29tVGltZWxpbmVEYXRhIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudC10aW1lbGluZS1zZXRcIjtcbmltcG9ydCB7IERpcmVjdGlvbiwgRXZlbnRUaW1lbGluZSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnQtdGltZWxpbmVcIjtcbmltcG9ydCB7IFRpbWVsaW5lV2luZG93IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL3RpbWVsaW5lLXdpbmRvd1wiO1xuaW1wb3J0IHsgRXZlbnRUeXBlLCBSZWxhdGlvblR5cGUgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvZXZlbnQnO1xuaW1wb3J0IHsgU3luY1N0YXRlIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvc3luYyc7XG5pbXBvcnQgeyBSb29tTWVtYmVyLCBSb29tTWVtYmVyRXZlbnQgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbS1tZW1iZXInO1xuaW1wb3J0IHsgZGVib3VuY2UsIHRocm90dGxlIH0gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcbmltcG9ydCB7IENsaWVudEV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NsaWVudFwiO1xuaW1wb3J0IHsgVGhyZWFkIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3RocmVhZCc7XG5pbXBvcnQgeyBSZWNlaXB0VHlwZSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvcmVhZF9yZWNlaXB0c1wiO1xuaW1wb3J0IHsgTWF0cml4RXJyb3IgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9odHRwLWFwaSc7XG5pbXBvcnQgeyBnZXRQcml2YXRlUmVhZFJlY2VpcHRGaWVsZCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy91dGlsc1wiO1xuXG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHsgTGF5b3V0IH0gZnJvbSBcIi4uLy4uL3NldHRpbmdzL2VudW1zL0xheW91dFwiO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSBcIi4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IFJvb21Db250ZXh0LCB7IFRpbWVsaW5lUmVuZGVyaW5nVHlwZSB9IGZyb20gXCIuLi8uLi9jb250ZXh0cy9Sb29tQ29udGV4dFwiO1xuaW1wb3J0IFVzZXJBY3Rpdml0eSBmcm9tIFwiLi4vLi4vVXNlckFjdGl2aXR5XCI7XG5pbXBvcnQgTW9kYWwgZnJvbSBcIi4uLy4uL01vZGFsXCI7XG5pbXBvcnQgZGlzIGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gJy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9ucyc7XG5pbXBvcnQgVGltZXIgZnJvbSAnLi4vLi4vdXRpbHMvVGltZXInO1xuaW1wb3J0IHNob3VsZEhpZGVFdmVudCBmcm9tICcuLi8uLi9zaG91bGRIaWRlRXZlbnQnO1xuaW1wb3J0IHsgYXJyYXlGYXN0Q2xvbmUgfSBmcm9tIFwiLi4vLi4vdXRpbHMvYXJyYXlzXCI7XG5pbXBvcnQgTWVzc2FnZVBhbmVsIGZyb20gXCIuL01lc3NhZ2VQYW5lbFwiO1xuaW1wb3J0IHsgSVNjcm9sbFN0YXRlIH0gZnJvbSBcIi4vU2Nyb2xsUGFuZWxcIjtcbmltcG9ydCB7IEFjdGlvblBheWxvYWQgfSBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkc1wiO1xuaW1wb3J0IFJlc2l6ZU5vdGlmaWVyIGZyb20gXCIuLi8uLi91dGlscy9SZXNpemVOb3RpZmllclwiO1xuaW1wb3J0IHsgUm9vbVBlcm1hbGlua0NyZWF0b3IgfSBmcm9tIFwiLi4vLi4vdXRpbHMvcGVybWFsaW5rcy9QZXJtYWxpbmtzXCI7XG5pbXBvcnQgU3Bpbm5lciBmcm9tIFwiLi4vdmlld3MvZWxlbWVudHMvU3Bpbm5lclwiO1xuaW1wb3J0IEVkaXRvclN0YXRlVHJhbnNmZXIgZnJvbSAnLi4vLi4vdXRpbHMvRWRpdG9yU3RhdGVUcmFuc2Zlcic7XG5pbXBvcnQgRXJyb3JEaWFsb2cgZnJvbSAnLi4vdmlld3MvZGlhbG9ncy9FcnJvckRpYWxvZyc7XG5pbXBvcnQgTGVnYWN5Q2FsbEV2ZW50R3JvdXBlciwgeyBidWlsZExlZ2FjeUNhbGxFdmVudEdyb3VwZXJzIH0gZnJvbSBcIi4vTGVnYWN5Q2FsbEV2ZW50R3JvdXBlclwiO1xuaW1wb3J0IHsgVmlld1Jvb21QYXlsb2FkIH0gZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvVmlld1Jvb21QYXlsb2FkXCI7XG5pbXBvcnQgeyBnZXRLZXlCaW5kaW5nc01hbmFnZXIgfSBmcm9tIFwiLi4vLi4vS2V5QmluZGluZ3NNYW5hZ2VyXCI7XG5pbXBvcnQgeyBLZXlCaW5kaW5nQWN0aW9uIH0gZnJvbSBcIi4uLy4uL2FjY2Vzc2liaWxpdHkvS2V5Ym9hcmRTaG9ydGN1dHNcIjtcbmltcG9ydCB7IGhhdmVSZW5kZXJlckZvckV2ZW50IH0gZnJvbSBcIi4uLy4uL2V2ZW50cy9FdmVudFRpbGVGYWN0b3J5XCI7XG5cbmNvbnN0IFBBR0lOQVRFX1NJWkUgPSAyMDtcbmNvbnN0IElOSVRJQUxfU0laRSA9IDIwO1xuY29uc3QgUkVBRF9SRUNFSVBUX0lOVEVSVkFMX01TID0gNTAwO1xuXG5jb25zdCBSRUFEX01BUktFUl9ERUJPVU5DRV9NUyA9IDEwMDtcblxuY29uc3QgZGVidWdsb2cgPSAoLi4uYXJnczogYW55W10pID0+IHtcbiAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImRlYnVnX3RpbWVsaW5lX3BhbmVsXCIpKSB7XG4gICAgICAgIGxvZ2dlci5sb2cuY2FsbChjb25zb2xlLCBcIlRpbWVsaW5lUGFuZWwgZGVidWdsb2c6XCIsIC4uLmFyZ3MpO1xuICAgIH1cbn07XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIC8vIFRoZSBqcy1zZGsgRXZlbnRUaW1lbGluZVNldCBvYmplY3QgZm9yIHRoZSB0aW1lbGluZSBzZXF1ZW5jZSB3ZSBhcmVcbiAgICAvLyByZXByZXNlbnRpbmcuICBUaGlzIG1heSBvciBtYXkgbm90IGhhdmUgYSByb29tLCBkZXBlbmRpbmcgb24gd2hhdCBpdCdzXG4gICAgLy8gYSB0aW1lbGluZSByZXByZXNlbnRpbmcuICBJZiBpdCBoYXMgYSByb29tLCB3ZSBtYWludGFpbiBSUnMgZXRjIGZvclxuICAgIC8vIHRoYXQgcm9vbS5cbiAgICB0aW1lbGluZVNldDogRXZlbnRUaW1lbGluZVNldDtcbiAgICBzaG93UmVhZFJlY2VpcHRzPzogYm9vbGVhbjtcbiAgICAvLyBFbmFibGUgbWFuYWdpbmcgUlJzIGFuZCBSTXMuIFRoZXNlIHJlcXVpcmUgdGhlIHRpbWVsaW5lU2V0IHRvIGhhdmUgYSByb29tLlxuICAgIG1hbmFnZVJlYWRSZWNlaXB0cz86IGJvb2xlYW47XG4gICAgc2VuZFJlYWRSZWNlaXB0T25Mb2FkPzogYm9vbGVhbjtcbiAgICBtYW5hZ2VSZWFkTWFya2Vycz86IGJvb2xlYW47XG5cbiAgICAvLyB0cnVlIHRvIGdpdmUgdGhlIGNvbXBvbmVudCBhICdkaXNwbGF5OiBub25lJyBzdHlsZS5cbiAgICBoaWRkZW4/OiBib29sZWFuO1xuXG4gICAgLy8gSUQgb2YgYW4gZXZlbnQgdG8gaGlnaGxpZ2h0LiBJZiB1bmRlZmluZWQsIG5vIGV2ZW50IHdpbGwgYmUgaGlnaGxpZ2h0ZWQuXG4gICAgLy8gdHlwaWNhbGx5IHRoaXMgd2lsbCBiZSBlaXRoZXIgJ2V2ZW50SWQnIG9yIHVuZGVmaW5lZC5cbiAgICBoaWdobGlnaHRlZEV2ZW50SWQ/OiBzdHJpbmc7XG5cbiAgICAvLyBpZCBvZiBhbiBldmVudCB0byBqdW1wIHRvLiBJZiBub3QgZ2l2ZW4sIHdpbGwgZ28gdG8gdGhlIGVuZCBvZiB0aGUgbGl2ZSB0aW1lbGluZS5cbiAgICBldmVudElkPzogc3RyaW5nO1xuXG4gICAgLy8gd2hldGhlciB3ZSBzaG91bGQgc2Nyb2xsIHRoZSBldmVudCBpbnRvIHZpZXdcbiAgICBldmVudFNjcm9sbEludG9WaWV3PzogYm9vbGVhbjtcblxuICAgIC8vIHdoZXJlIHRvIHBvc2l0aW9uIHRoZSBldmVudCBnaXZlbiBieSBldmVudElkLCBpbiBwaXhlbHMgZnJvbSB0aGUgYm90dG9tIG9mIHRoZSB2aWV3cG9ydC5cbiAgICAvLyBJZiBub3QgZ2l2ZW4sIHdpbGwgdHJ5IHRvIHB1dCB0aGUgZXZlbnQgaGFsZiB3YXkgZG93biB0aGUgdmlld3BvcnQuXG4gICAgZXZlbnRQaXhlbE9mZnNldD86IG51bWJlcjtcblxuICAgIC8vIFNob3VsZCB3ZSBzaG93IFVSTCBQcmV2aWV3c1xuICAgIHNob3dVcmxQcmV2aWV3PzogYm9vbGVhbjtcblxuICAgIC8vIG1heGltdW0gbnVtYmVyIG9mIGV2ZW50cyB0byBzaG93IGluIGEgdGltZWxpbmVcbiAgICB0aW1lbGluZUNhcD86IG51bWJlcjtcblxuICAgIC8vIGNsYXNzbmFtZSB0byB1c2UgZm9yIHRoZSBtZXNzYWdlcGFuZWxcbiAgICBjbGFzc05hbWU/OiBzdHJpbmc7XG5cbiAgICAvLyBwbGFjZWhvbGRlciB0byB1c2UgaWYgdGhlIHRpbWVsaW5lIGlzIGVtcHR5XG4gICAgZW1wdHk/OiBSZWFjdE5vZGU7XG5cbiAgICAvLyB3aGV0aGVyIHRvIHNob3cgcmVhY3Rpb25zIGZvciBhbiBldmVudFxuICAgIHNob3dSZWFjdGlvbnM/OiBib29sZWFuO1xuXG4gICAgLy8gd2hpY2ggbGF5b3V0IHRvIHVzZVxuICAgIGxheW91dD86IExheW91dDtcblxuICAgIC8vIHdoZXRoZXIgdG8gYWx3YXlzIHNob3cgdGltZXN0YW1wcyBmb3IgYW4gZXZlbnRcbiAgICBhbHdheXNTaG93VGltZXN0YW1wcz86IGJvb2xlYW47XG5cbiAgICByZXNpemVOb3RpZmllcj86IFJlc2l6ZU5vdGlmaWVyO1xuICAgIGVkaXRTdGF0ZT86IEVkaXRvclN0YXRlVHJhbnNmZXI7XG4gICAgcGVybWFsaW5rQ3JlYXRvcj86IFJvb21QZXJtYWxpbmtDcmVhdG9yO1xuICAgIG1lbWJlcnNMb2FkZWQ/OiBib29sZWFuO1xuXG4gICAgLy8gY2FsbGJhY2sgd2hpY2ggaXMgY2FsbGVkIHdoZW4gdGhlIHBhbmVsIGlzIHNjcm9sbGVkLlxuICAgIG9uU2Nyb2xsPyhldmVudDogRXZlbnQpOiB2b2lkO1xuXG4gICAgb25FdmVudFNjcm9sbGVkSW50b1ZpZXc/KGV2ZW50SWQ/OiBzdHJpbmcpOiB2b2lkO1xuXG4gICAgLy8gY2FsbGJhY2sgd2hpY2ggaXMgY2FsbGVkIHdoZW4gdGhlIHJlYWQtdXAtdG8gbWFyayBpcyB1cGRhdGVkLlxuICAgIG9uUmVhZE1hcmtlclVwZGF0ZWQ/KCk6IHZvaWQ7XG5cbiAgICAvLyBjYWxsYmFjayB3aGljaCBpcyBjYWxsZWQgd2hlbiB3ZSB3aXNoIHRvIHBhZ2luYXRlIHRoZSB0aW1lbGluZSB3aW5kb3cuXG4gICAgb25QYWdpbmF0aW9uUmVxdWVzdD8odGltZWxpbmVXaW5kb3c6IFRpbWVsaW5lV2luZG93LCBkaXJlY3Rpb246IHN0cmluZywgc2l6ZTogbnVtYmVyKTogUHJvbWlzZTxib29sZWFuPjtcblxuICAgIGhpZGVUaHJlYWRlZE1lc3NhZ2VzPzogYm9vbGVhbjtcbiAgICBkaXNhYmxlR3JvdXBpbmc/OiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBldmVudHM6IE1hdHJpeEV2ZW50W107XG4gICAgbGl2ZUV2ZW50czogTWF0cml4RXZlbnRbXTtcbiAgICAvLyB0cmFjayB3aGV0aGVyIG91ciByb29tIHRpbWVsaW5lIGlzIGxvYWRpbmdcbiAgICB0aW1lbGluZUxvYWRpbmc6IGJvb2xlYW47XG5cbiAgICAvLyB0aGUgaW5kZXggb2YgdGhlIGZpcnN0IGV2ZW50IHRoYXQgaXMgdG8gYmUgc2hvd25cbiAgICBmaXJzdFZpc2libGVFdmVudEluZGV4OiBudW1iZXI7XG5cbiAgICAvLyBjYW5CYWNrUGFnaW5hdGUgPT0gZmFsc2UgbWF5IG1lYW46XG4gICAgLy9cbiAgICAvLyAqIHdlIGhhdmVuJ3QgKHN1Y2Nlc3NmdWxseSkgbG9hZGVkIHRoZSB0aW1lbGluZSB5ZXQsIG9yOlxuICAgIC8vXG4gICAgLy8gKiB3ZSBoYXZlIGdvdCB0byB0aGUgcG9pbnQgd2hlcmUgdGhlIHJvb20gd2FzIGNyZWF0ZWQsIG9yOlxuICAgIC8vXG4gICAgLy8gKiB0aGUgc2VydmVyIGluZGljYXRlZCB0aGF0IHRoZXJlIHdlcmUgbm8gbW9yZSB2aXNpYmxlIGV2ZW50c1xuICAgIC8vICAobm9ybWFsbHkgaW1wbHlpbmcgd2UgZ290IHRvIHRoZSBzdGFydCBvZiB0aGUgcm9vbSksIG9yOlxuICAgIC8vXG4gICAgLy8gKiB3ZSBnYXZlIHVwIGFza2luZyB0aGUgc2VydmVyIGZvciBtb3JlIGV2ZW50c1xuICAgIGNhbkJhY2tQYWdpbmF0ZTogYm9vbGVhbjtcblxuICAgIC8vIGNhbkZvcndhcmRQYWdpbmF0ZSA9PSBmYWxzZSBtYXkgbWVhbjpcbiAgICAvL1xuICAgIC8vICogd2UgaGF2ZW4ndCAoc3VjY2Vzc2Z1bGx5KSBsb2FkZWQgdGhlIHRpbWVsaW5lIHlldFxuICAgIC8vXG4gICAgLy8gKiB3ZSBoYXZlIGdvdCB0byB0aGUgZW5kIG9mIHRpbWUgYW5kIGFyZSBub3cgdHJhY2tpbmcgdGhlIGxpdmVcbiAgICAvLyAgIHRpbWVsaW5lLCBvcjpcbiAgICAvL1xuICAgIC8vICogdGhlIHNlcnZlciBpbmRpY2F0ZWQgdGhhdCB0aGVyZSB3ZXJlIG5vIG1vcmUgdmlzaWJsZSBldmVudHNcbiAgICAvLyAgIChub3Qgc3VyZSBpZiB0aGlzIGV2ZXIgaGFwcGVucyB3aGVuIHdlJ3JlIG5vdCBhdCB0aGUgbGl2ZVxuICAgIC8vICAgdGltZWxpbmUpLCBvcjpcbiAgICAvL1xuICAgIC8vICogd2UgYXJlIGxvb2tpbmcgYXQgc29tZSBoaXN0b3JpY2FsIHBvaW50LCBidXQgZ2F2ZSB1cCBhc2tpbmdcbiAgICAvLyAgIHRoZSBzZXJ2ZXIgZm9yIG1vcmUgZXZlbnRzXG4gICAgY2FuRm9yd2FyZFBhZ2luYXRlOiBib29sZWFuO1xuXG4gICAgLy8gc3RhcnQgd2l0aCB0aGUgcmVhZC1tYXJrZXIgdmlzaWJsZSwgc28gdGhhdCB3ZSBzZWUgaXRzIGFuaW1hdGVkXG4gICAgLy8gZGlzYXBwZWFyYW5jZSB3aGVuIHN3aXRjaGluZyBpbnRvIHRoZSByb29tLlxuICAgIHJlYWRNYXJrZXJWaXNpYmxlOiBib29sZWFuO1xuXG4gICAgcmVhZE1hcmtlckV2ZW50SWQ6IHN0cmluZztcblxuICAgIGJhY2tQYWdpbmF0aW5nOiBib29sZWFuO1xuICAgIGZvcndhcmRQYWdpbmF0aW5nOiBib29sZWFuO1xuXG4gICAgLy8gY2FjaGUgb2YgbWF0cml4Q2xpZW50LmdldFN5bmNTdGF0ZSgpIChidXQgZnJvbSB0aGUgJ3N5bmMnIGV2ZW50KVxuICAgIGNsaWVudFN5bmNTdGF0ZTogU3luY1N0YXRlO1xuXG4gICAgLy8gc2hvdWxkIHRoZSBldmVudCB0aWxlcyBoYXZlIHR3ZWx2ZSBob3VyIHRpbWVzXG4gICAgaXNUd2VsdmVIb3VyOiBib29sZWFuO1xuXG4gICAgLy8gYWx3YXlzIHNob3cgdGltZXN0YW1wcyBvbiBldmVudCB0aWxlcz9cbiAgICBhbHdheXNTaG93VGltZXN0YW1wczogYm9vbGVhbjtcblxuICAgIC8vIGhvdyBsb25nIHRvIHNob3cgdGhlIFJNIGZvciB3aGVuIGl0J3MgdmlzaWJsZSBpbiB0aGUgd2luZG93XG4gICAgcmVhZE1hcmtlckluVmlld1RocmVzaG9sZE1zOiBudW1iZXI7XG5cbiAgICAvLyBob3cgbG9uZyB0byBzaG93IHRoZSBSTSBmb3Igd2hlbiBpdCdzIHNjcm9sbGVkIG9mZi1zY3JlZW5cbiAgICByZWFkTWFya2VyT3V0T2ZWaWV3VGhyZXNob2xkTXM6IG51bWJlcjtcblxuICAgIGVkaXRTdGF0ZT86IEVkaXRvclN0YXRlVHJhbnNmZXI7XG59XG5cbmludGVyZmFjZSBJRXZlbnRJbmRleE9wdHMge1xuICAgIGlnbm9yZU93bj86IGJvb2xlYW47XG4gICAgYWxsb3dQYXJ0aWFsPzogYm9vbGVhbjtcbn1cblxuLypcbiAqIENvbXBvbmVudCB3aGljaCBzaG93cyB0aGUgZXZlbnQgdGltZWxpbmUgaW4gYSByb29tIHZpZXcuXG4gKlxuICogQWxzbyByZXNwb25zaWJsZSBmb3IgaGFuZGxpbmcgYW5kIHNlbmRpbmcgcmVhZCByZWNlaXB0cy5cbiAqL1xuY2xhc3MgVGltZWxpbmVQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHN0YXRpYyBjb250ZXh0VHlwZSA9IFJvb21Db250ZXh0O1xuICAgIHB1YmxpYyBjb250ZXh0ITogUmVhY3QuQ29udGV4dFR5cGU8dHlwZW9mIFJvb21Db250ZXh0PjtcblxuICAgIC8vIGEgbWFwIGZyb20gcm9vbSBpZCB0byByZWFkIG1hcmtlciBldmVudCB0aW1lc3RhbXBcbiAgICBzdGF0aWMgcm9vbVJlYWRNYXJrZXJUc01hcDogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHt9O1xuXG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgLy8gQnkgZGVmYXVsdCwgZGlzYWJsZSB0aGUgdGltZWxpbmVDYXAgaW4gZmF2b3VyIG9mIHVucGFnaW5hdGluZyBiYXNlZCBvblxuICAgICAgICAvLyBldmVudCB0aWxlIGhlaWdodHMuIChTZWUgX3VucGFnaW5hdGVFdmVudHMpXG4gICAgICAgIHRpbWVsaW5lQ2FwOiBOdW1iZXIuTUFYX1ZBTFVFLFxuICAgICAgICBjbGFzc05hbWU6ICdteF9Sb29tVmlld19tZXNzYWdlUGFuZWwnLFxuICAgICAgICBzZW5kUmVhZFJlY2VpcHRPbkxvYWQ6IHRydWUsXG4gICAgICAgIGhpZGVUaHJlYWRlZE1lc3NhZ2VzOiB0cnVlLFxuICAgICAgICBkaXNhYmxlR3JvdXBpbmc6IGZhbHNlLFxuICAgIH07XG5cbiAgICBwcml2YXRlIGxhc3RSUlNlbnRFdmVudElkOiBzdHJpbmcgPSB1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSBsYXN0Uk1TZW50RXZlbnRJZDogc3RyaW5nID0gdW5kZWZpbmVkO1xuXG4gICAgcHJpdmF0ZSByZWFkb25seSBtZXNzYWdlUGFuZWwgPSBjcmVhdGVSZWY8TWVzc2FnZVBhbmVsPigpO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgZGlzcGF0Y2hlclJlZjogc3RyaW5nO1xuICAgIHByaXZhdGUgdGltZWxpbmVXaW5kb3c/OiBUaW1lbGluZVdpbmRvdztcbiAgICBwcml2YXRlIHVubW91bnRlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgcmVhZFJlY2VpcHRBY3Rpdml0eVRpbWVyOiBUaW1lcjtcbiAgICBwcml2YXRlIHJlYWRNYXJrZXJBY3Rpdml0eVRpbWVyOiBUaW1lcjtcblxuICAgIC8vIEEgbWFwIG9mIDxjYWxsSWQsIExlZ2FjeUNhbGxFdmVudEdyb3VwZXI+XG4gICAgcHJpdmF0ZSBjYWxsRXZlbnRHcm91cGVycyA9IG5ldyBNYXA8c3RyaW5nLCBMZWdhY3lDYWxsRXZlbnRHcm91cGVyPigpO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMsIGNvbnRleHQpIHtcbiAgICAgICAgc3VwZXIocHJvcHMsIGNvbnRleHQpO1xuICAgICAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuXG4gICAgICAgIGRlYnVnbG9nKFwibW91bnRpbmdcIik7XG5cbiAgICAgICAgLy8gWFhYOiB3ZSBjb3VsZCB0cmFjayBSTSBwZXIgVGltZWxpbmVTZXQgcmF0aGVyIHRoYW4gcGVyIFJvb20uXG4gICAgICAgIC8vIGJ1dCBmb3Igbm93IHdlIGp1c3QgZG8gaXQgcGVyIHJvb20gZm9yIHNpbXBsaWNpdHkuXG4gICAgICAgIGxldCBpbml0aWFsUmVhZE1hcmtlciA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm1hbmFnZVJlYWRNYXJrZXJzKSB7XG4gICAgICAgICAgICBjb25zdCByZWFkbWFya2VyID0gdGhpcy5wcm9wcy50aW1lbGluZVNldC5yb29tLmdldEFjY291bnREYXRhKCdtLmZ1bGx5X3JlYWQnKTtcbiAgICAgICAgICAgIGlmIChyZWFkbWFya2VyKSB7XG4gICAgICAgICAgICAgICAgaW5pdGlhbFJlYWRNYXJrZXIgPSByZWFkbWFya2VyLmdldENvbnRlbnQoKS5ldmVudF9pZDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaW5pdGlhbFJlYWRNYXJrZXIgPSB0aGlzLmdldEN1cnJlbnRSZWFkUmVjZWlwdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGV2ZW50czogW10sXG4gICAgICAgICAgICBsaXZlRXZlbnRzOiBbXSxcbiAgICAgICAgICAgIHRpbWVsaW5lTG9hZGluZzogdHJ1ZSxcbiAgICAgICAgICAgIGZpcnN0VmlzaWJsZUV2ZW50SW5kZXg6IDAsXG4gICAgICAgICAgICBjYW5CYWNrUGFnaW5hdGU6IGZhbHNlLFxuICAgICAgICAgICAgY2FuRm9yd2FyZFBhZ2luYXRlOiBmYWxzZSxcbiAgICAgICAgICAgIHJlYWRNYXJrZXJWaXNpYmxlOiB0cnVlLFxuICAgICAgICAgICAgcmVhZE1hcmtlckV2ZW50SWQ6IGluaXRpYWxSZWFkTWFya2VyLFxuICAgICAgICAgICAgYmFja1BhZ2luYXRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgZm9yd2FyZFBhZ2luYXRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgY2xpZW50U3luY1N0YXRlOiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0U3luY1N0YXRlKCksXG4gICAgICAgICAgICBpc1R3ZWx2ZUhvdXI6IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJzaG93VHdlbHZlSG91clRpbWVzdGFtcHNcIiksXG4gICAgICAgICAgICBhbHdheXNTaG93VGltZXN0YW1wczogU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImFsd2F5c1Nob3dUaW1lc3RhbXBzXCIpLFxuICAgICAgICAgICAgcmVhZE1hcmtlckluVmlld1RocmVzaG9sZE1zOiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwicmVhZE1hcmtlckluVmlld1RocmVzaG9sZE1zXCIpLFxuICAgICAgICAgICAgcmVhZE1hcmtlck91dE9mVmlld1RocmVzaG9sZE1zOiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwicmVhZE1hcmtlck91dE9mVmlld1RocmVzaG9sZE1zXCIpLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlclJlZiA9IGRpcy5yZWdpc3Rlcih0aGlzLm9uQWN0aW9uKTtcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjbGkub24oUm9vbUV2ZW50LlRpbWVsaW5lLCB0aGlzLm9uUm9vbVRpbWVsaW5lKTtcbiAgICAgICAgY2xpLm9uKFJvb21FdmVudC5UaW1lbGluZVJlc2V0LCB0aGlzLm9uUm9vbVRpbWVsaW5lUmVzZXQpO1xuICAgICAgICBjbGkub24oUm9vbUV2ZW50LlJlZGFjdGlvbiwgdGhpcy5vblJvb21SZWRhY3Rpb24pO1xuICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImZlYXR1cmVfbXNjMzUzMV9oaWRlX21lc3NhZ2VzX3BlbmRpbmdfbW9kZXJhdGlvblwiKSkge1xuICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHRoYXQgZXZlbnRzIGFyZSByZS1yZW5kZXJlZCB3aGVuIHRoZWlyIHZpc2liaWxpdHktcGVuZGluZy1tb2RlcmF0aW9uIGNoYW5nZXMuXG4gICAgICAgICAgICBjbGkub24oTWF0cml4RXZlbnRFdmVudC5WaXNpYmlsaXR5Q2hhbmdlLCB0aGlzLm9uRXZlbnRWaXNpYmlsaXR5Q2hhbmdlKTtcbiAgICAgICAgICAgIGNsaS5vbihSb29tTWVtYmVyRXZlbnQuUG93ZXJMZXZlbCwgdGhpcy5vblZpc2liaWxpdHlQb3dlckxldmVsQ2hhbmdlKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBzYW1lIGV2ZW50IGhhbmRsZXIgYXMgUm9vbS5yZWRhY3Rpb24gYXMgZm9yIGJvdGggd2UganVzdCBkbyBmb3JjZVVwZGF0ZVxuICAgICAgICBjbGkub24oUm9vbUV2ZW50LlJlZGFjdGlvbkNhbmNlbGxlZCwgdGhpcy5vblJvb21SZWRhY3Rpb24pO1xuICAgICAgICBjbGkub24oUm9vbUV2ZW50LlJlY2VpcHQsIHRoaXMub25Sb29tUmVjZWlwdCk7XG4gICAgICAgIGNsaS5vbihSb29tRXZlbnQuTG9jYWxFY2hvVXBkYXRlZCwgdGhpcy5vbkxvY2FsRWNob1VwZGF0ZWQpO1xuICAgICAgICBjbGkub24oUm9vbUV2ZW50LkFjY291bnREYXRhLCB0aGlzLm9uQWNjb3VudERhdGEpO1xuICAgICAgICBjbGkub24oTWF0cml4RXZlbnRFdmVudC5EZWNyeXB0ZWQsIHRoaXMub25FdmVudERlY3J5cHRlZCk7XG4gICAgICAgIGNsaS5vbihNYXRyaXhFdmVudEV2ZW50LlJlcGxhY2VkLCB0aGlzLm9uRXZlbnRSZXBsYWNlZCk7XG4gICAgICAgIGNsaS5vbihDbGllbnRFdmVudC5TeW5jLCB0aGlzLm9uU3luYyk7XG4gICAgfVxuXG4gICAgLy8gVE9ETzogW1JFQUNULVdBUk5JTkddIE1vdmUgaW50byBjb25zdHJ1Y3RvclxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuICAgIFVOU0FGRV9jb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm1hbmFnZVJlYWRSZWNlaXB0cykge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVSZWFkUmVjZWlwdE9uVXNlckFjdGl2aXR5KCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJvcHMubWFuYWdlUmVhZE1hcmtlcnMpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUmVhZE1hcmtlck9uVXNlckFjdGl2aXR5KCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmluaXRUaW1lbGluZSh0aGlzLnByb3BzKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBbUkVBQ1QtV0FSTklOR10gUmVwbGFjZSB3aXRoIGFwcHJvcHJpYXRlIGxpZmVjeWNsZSBldmVudFxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuICAgIFVOU0FGRV9jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5ld1Byb3BzKSB7XG4gICAgICAgIGlmIChuZXdQcm9wcy50aW1lbGluZVNldCAhPT0gdGhpcy5wcm9wcy50aW1lbGluZVNldCkge1xuICAgICAgICAgICAgLy8gdGhyb3cgbmV3IEVycm9yKFwiY2hhbmdpbmcgdGltZWxpbmVTZXQgb24gYSBUaW1lbGluZVBhbmVsIGlzIG5vdCBzdXBwb3J0ZWRcIik7XG5cbiAgICAgICAgICAgIC8vIHJlZ3JldHRhYmx5LCB0aGlzIGRvZXMgaGFwcGVuOyBpbiBwYXJ0aWN1bGFyLCB3aGVuIGpvaW5pbmcgYVxuICAgICAgICAgICAgLy8gcm9vbSB3aXRoIC9qb2luLiBJbiB0aGF0IGNhc2UsIHRoZXJlIGFyZSB0d28gUm9vbXMgaW5cbiAgICAgICAgICAgIC8vIGNpcmN1bGF0aW9uIC0gb25lIHdoaWNoIGlzIGNyZWF0ZWQgYnkgdGhlIE1hdHJpeENsaWVudC5qb2luUm9vbVxuICAgICAgICAgICAgLy8gY2FsbCBhbmQgdXNlZCB0byBjcmVhdGUgdGhlIFJvb21WaWV3LCBhbmQgYSBzZWNvbmQgd2hpY2ggaXNcbiAgICAgICAgICAgIC8vIGNyZWF0ZWQgYnkgdGhlIHN5bmMgbG9vcCBvbmNlIHRoZSByb29tIGNvbWVzIGJhY2sgZG93biB0aGUgL3N5bmNcbiAgICAgICAgICAgIC8vIHBpcGUuIE9uY2UgdGhlIGxhdHRlciBoYXBwZW5zLCBvdXIgcm9vbSBpcyByZXBsYWNlZCB3aXRoIHRoZSBuZXcgb25lLlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIGZvciBub3csIGp1c3Qgd2FybiBhYm91dCB0aGlzLiBCdXQgd2UncmUgZ29pbmcgdG8gZW5kIHVwIHBhZ2luYXRpbmdcbiAgICAgICAgICAgIC8vIGJvdGggcm9vbXMgc2VwYXJhdGVseSwgYW5kIGl0J3MgYWxsIGJhZC5cbiAgICAgICAgICAgIGxvZ2dlci53YXJuKFwiUmVwbGFjaW5nIHRpbWVsaW5lU2V0IG9uIGEgVGltZWxpbmVQYW5lbCAtIGNvbmZ1c2lvbiBtYXkgZW5zdWVcIik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBkaWZmZXJlbnRFdmVudElkID0gbmV3UHJvcHMuZXZlbnRJZCAhPSB0aGlzLnByb3BzLmV2ZW50SWQ7XG4gICAgICAgIGNvbnN0IGRpZmZlcmVudEhpZ2hsaWdodGVkRXZlbnRJZCA9IG5ld1Byb3BzLmhpZ2hsaWdodGVkRXZlbnRJZCAhPSB0aGlzLnByb3BzLmhpZ2hsaWdodGVkRXZlbnRJZDtcbiAgICAgICAgY29uc3QgZGlmZmVyZW50QXZvaWRKdW1wID0gbmV3UHJvcHMuZXZlbnRTY3JvbGxJbnRvVmlldyAmJiAhdGhpcy5wcm9wcy5ldmVudFNjcm9sbEludG9WaWV3O1xuICAgICAgICBpZiAoZGlmZmVyZW50RXZlbnRJZCB8fCBkaWZmZXJlbnRIaWdobGlnaHRlZEV2ZW50SWQgfHwgZGlmZmVyZW50QXZvaWRKdW1wKSB7XG4gICAgICAgICAgICBsb2dnZXIubG9nKFwiVGltZWxpbmVQYW5lbCBzd2l0Y2hpbmcgdG8gXCIgK1xuICAgICAgICAgICAgICAgIFwiZXZlbnRJZCBcIiArIG5ld1Byb3BzLmV2ZW50SWQgKyBcIiAod2FzIFwiICsgdGhpcy5wcm9wcy5ldmVudElkICsgXCIpLCBcIiArXG4gICAgICAgICAgICAgICAgXCJzY3JvbGxJbnRvVmlldzogXCIgKyBuZXdQcm9wcy5ldmVudFNjcm9sbEludG9WaWV3ICsgXCIgKHdhcyBcIiArIHRoaXMucHJvcHMuZXZlbnRTY3JvbGxJbnRvVmlldyArIFwiKVwiKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmluaXRUaW1lbGluZShuZXdQcm9wcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgLy8gc2V0IGEgYm9vbGVhbiB0byBzYXkgd2UndmUgYmVlbiB1bm1vdW50ZWQsIHdoaWNoIGFueSBwZW5kaW5nXG4gICAgICAgIC8vIHByb21pc2VzIGNhbiB1c2UgdG8gdGhyb3cgYXdheSB0aGVpciByZXN1bHRzLlxuICAgICAgICAvL1xuICAgICAgICAvLyAoV2UgY291bGQgdXNlIGlzTW91bnRlZCwgYnV0IGZhY2Vib29rIGhhdmUgZGVwcmVjYXRlZCB0aGF0LilcbiAgICAgICAgdGhpcy51bm1vdW50ZWQgPSB0cnVlO1xuICAgICAgICBpZiAodGhpcy5yZWFkUmVjZWlwdEFjdGl2aXR5VGltZXIpIHtcbiAgICAgICAgICAgIHRoaXMucmVhZFJlY2VpcHRBY3Rpdml0eVRpbWVyLmFib3J0KCk7XG4gICAgICAgICAgICB0aGlzLnJlYWRSZWNlaXB0QWN0aXZpdHlUaW1lciA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucmVhZE1hcmtlckFjdGl2aXR5VGltZXIpIHtcbiAgICAgICAgICAgIHRoaXMucmVhZE1hcmtlckFjdGl2aXR5VGltZXIuYWJvcnQoKTtcbiAgICAgICAgICAgIHRoaXMucmVhZE1hcmtlckFjdGl2aXR5VGltZXIgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgZGlzLnVucmVnaXN0ZXIodGhpcy5kaXNwYXRjaGVyUmVmKTtcblxuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGlmIChjbGllbnQpIHtcbiAgICAgICAgICAgIGNsaWVudC5yZW1vdmVMaXN0ZW5lcihSb29tRXZlbnQuVGltZWxpbmUsIHRoaXMub25Sb29tVGltZWxpbmUpO1xuICAgICAgICAgICAgY2xpZW50LnJlbW92ZUxpc3RlbmVyKFJvb21FdmVudC5UaW1lbGluZVJlc2V0LCB0aGlzLm9uUm9vbVRpbWVsaW5lUmVzZXQpO1xuICAgICAgICAgICAgY2xpZW50LnJlbW92ZUxpc3RlbmVyKFJvb21FdmVudC5SZWRhY3Rpb24sIHRoaXMub25Sb29tUmVkYWN0aW9uKTtcbiAgICAgICAgICAgIGNsaWVudC5yZW1vdmVMaXN0ZW5lcihSb29tRXZlbnQuUmVkYWN0aW9uQ2FuY2VsbGVkLCB0aGlzLm9uUm9vbVJlZGFjdGlvbik7XG4gICAgICAgICAgICBjbGllbnQucmVtb3ZlTGlzdGVuZXIoUm9vbUV2ZW50LlJlY2VpcHQsIHRoaXMub25Sb29tUmVjZWlwdCk7XG4gICAgICAgICAgICBjbGllbnQucmVtb3ZlTGlzdGVuZXIoUm9vbUV2ZW50LkxvY2FsRWNob1VwZGF0ZWQsIHRoaXMub25Mb2NhbEVjaG9VcGRhdGVkKTtcbiAgICAgICAgICAgIGNsaWVudC5yZW1vdmVMaXN0ZW5lcihSb29tRXZlbnQuQWNjb3VudERhdGEsIHRoaXMub25BY2NvdW50RGF0YSk7XG4gICAgICAgICAgICBjbGllbnQucmVtb3ZlTGlzdGVuZXIoUm9vbU1lbWJlckV2ZW50LlBvd2VyTGV2ZWwsIHRoaXMub25WaXNpYmlsaXR5UG93ZXJMZXZlbENoYW5nZSk7XG4gICAgICAgICAgICBjbGllbnQucmVtb3ZlTGlzdGVuZXIoTWF0cml4RXZlbnRFdmVudC5EZWNyeXB0ZWQsIHRoaXMub25FdmVudERlY3J5cHRlZCk7XG4gICAgICAgICAgICBjbGllbnQucmVtb3ZlTGlzdGVuZXIoTWF0cml4RXZlbnRFdmVudC5SZXBsYWNlZCwgdGhpcy5vbkV2ZW50UmVwbGFjZWQpO1xuICAgICAgICAgICAgY2xpZW50LnJlbW92ZUxpc3RlbmVyKE1hdHJpeEV2ZW50RXZlbnQuVmlzaWJpbGl0eUNoYW5nZSwgdGhpcy5vbkV2ZW50VmlzaWJpbGl0eUNoYW5nZSk7XG4gICAgICAgICAgICBjbGllbnQucmVtb3ZlTGlzdGVuZXIoQ2xpZW50RXZlbnQuU3luYywgdGhpcy5vblN5bmMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9ncyBvdXQgZGVidWcgaW5mbyB0byBkZXNjcmliZSB0aGUgc3RhdGUgb2YgdGhlIFRpbWVsaW5lUGFuZWwgYW5kIHRoZVxuICAgICAqIGV2ZW50cyBpbiB0aGUgcm9vbSBhY2NvcmRpbmcgdG8gdGhlIG1hdHJpeC1qcy1zZGsuIFRoaXMgaXMgdXNlZnVsIHdoZW5cbiAgICAgKiBkZWJ1Z2dpbmcgcHJvYmxlbXMgbGlrZSBtZXNzYWdlcyBvdXQgb2Ygb3JkZXIsIG9yIG1lc3NhZ2VzIHRoYXQgc2hvdWxkXG4gICAgICogbm90IGJlIHNob3dpbmcgdXAgaW4gYSB0aHJlYWQsIGV0Yy5cbiAgICAgKlxuICAgICAqIEl0J3MgdG9vIGV4cGVuc2l2ZSBhbmQgY3VtYmVyc29tZSB0byBkbyBhbGwgb2YgdGhlc2UgY2FsY3VsYXRpb25zIGZvclxuICAgICAqIGV2ZXJ5IG1lc3NhZ2UgY2hhbmdlIHNvIGluc3RlYWQgd2Ugb25seSBsb2cgaXQgb3V0IHdoZW4gYXNrZWQuXG4gICAgICovXG4gICAgcHJpdmF0ZSBvbkR1bXBEZWJ1Z0xvZ3MgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IHJvb20gPSB0aGlzLnByb3BzLnRpbWVsaW5lU2V0Py5yb29tO1xuICAgICAgICAvLyBHZXQgYSBsaXN0IG9mIHRoZSBldmVudCBJRHMgdXNlZCBpbiB0aGlzIFRpbWVsaW5lUGFuZWwuXG4gICAgICAgIC8vIFRoaXMgaW5jbHVkZXMgc3RhdGUgYW5kIGhpZGRlbiBldmVudHMgd2hpY2ggd2UgZG9uJ3QgcmVuZGVyXG4gICAgICAgIGNvbnN0IGV2ZW50SWRMaXN0ID0gdGhpcy5zdGF0ZT8uZXZlbnRzPy5tYXAoKGV2KSA9PiBldi5nZXRJZCgpKTtcblxuICAgICAgICAvLyBHZXQgdGhlIGxpc3Qgb2YgYWN0dWFsbHkgcmVuZGVyZWQgZXZlbnRzIHNlZW4gaW4gdGhlIERPTS5cbiAgICAgICAgLy8gVGhpcyBpcyB1c2VmdWwgdG8ga25vdyBmb3Igc3VyZSB3aGF0J3MgYmVpbmcgc2hvd24gb24gc2NyZWVuLlxuICAgICAgICAvLyBBbmQgd2UgY2FuIHN1c3Mgb3V0IGFueSBjb3JydXB0ZWQgUmVhY3QgYGtleWAgcHJvYmxlbXMuXG4gICAgICAgIGxldCByZW5kZXJlZEV2ZW50SWRzOiBzdHJpbmdbXTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2VQYW5lbCA9IHRoaXMubWVzc2FnZVBhbmVsLmN1cnJlbnQ7XG4gICAgICAgICAgICBpZiAobWVzc2FnZVBhbmVsKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZVBhbmVsTm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKG1lc3NhZ2VQYW5lbCkgYXMgRWxlbWVudDtcbiAgICAgICAgICAgICAgICBpZiAobWVzc2FnZVBhbmVsTm9kZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhY3R1YWxseVJlbmRlcmVkRXZlbnRzID0gbWVzc2FnZVBhbmVsTm9kZS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1ldmVudC1pZF0nKTtcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyZWRFdmVudElkcyA9IFsuLi5hY3R1YWxseVJlbmRlcmVkRXZlbnRzXS5tYXAoKHJlbmRlcmVkRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZW5kZXJlZEV2ZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1ldmVudC1pZCcpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGBvbkR1bXBEZWJ1Z0xvZ3M6IEZhaWxlZCB0byBnZXQgdGhlIGFjdHVhbCBldmVudCBJRCdzIGluIHRoZSBET01gLCBlcnIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2V0IHRoZSBsaXN0IG9mIGV2ZW50cyBhbmQgdGhyZWFkcyBmb3IgdGhlIHJvb20gYXMgc2VlbiBieSB0aGVcbiAgICAgICAgLy8gbWF0cml4LWpzLXNkay5cbiAgICAgICAgbGV0IHNlcmlhbGl6ZWRFdmVudElkc0Zyb21UaW1lbGluZVNldHM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nW10gfVtdO1xuICAgICAgICBsZXQgc2VyaWFsaXplZEV2ZW50SWRzRnJvbVRocmVhZHNUaW1lbGluZVNldHM6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nW10gfVtdO1xuICAgICAgICBjb25zdCBzZXJpYWxpemVkVGhyZWFkc01hcDogeyBba2V5OiBzdHJpbmddOiBhbnkgfSA9IHt9O1xuICAgICAgICBpZiAocm9vbSkge1xuICAgICAgICAgICAgY29uc3QgdGltZWxpbmVTZXRzID0gcm9vbS5nZXRUaW1lbGluZVNldHMoKTtcbiAgICAgICAgICAgIGNvbnN0IHRocmVhZHNUaW1lbGluZVNldHMgPSByb29tLnRocmVhZHNUaW1lbGluZVNldHM7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy8gU2VyaWFsaXplIGFsbCBvZiB0aGUgdGltZWxpbmVTZXRzIGFuZCB0aW1lbGluZXMgaW4gZWFjaCBzZXQgdG8gdGhlaXIgZXZlbnQgSURzXG4gICAgICAgICAgICAgICAgc2VyaWFsaXplZEV2ZW50SWRzRnJvbVRpbWVsaW5lU2V0cyA9IHNlcmlhbGl6ZUV2ZW50SWRzRnJvbVRpbWVsaW5lU2V0cyh0aW1lbGluZVNldHMpO1xuICAgICAgICAgICAgICAgIHNlcmlhbGl6ZWRFdmVudElkc0Zyb21UaHJlYWRzVGltZWxpbmVTZXRzID0gc2VyaWFsaXplRXZlbnRJZHNGcm9tVGltZWxpbmVTZXRzKHRocmVhZHNUaW1lbGluZVNldHMpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGBvbkR1bXBEZWJ1Z0xvZ3M6IEZhaWxlZCB0byBzZXJpYWxpemUgZXZlbnQgSURzIGZyb20gdGltZWxpbmVzZXRzYCwgZXJyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyBTZXJpYWxpemUgYWxsIHRocmVhZHMgaW4gdGhlIHJvb20gZnJvbSB0aGVhZElkIC0+IGV2ZW50IElEcyBpbiB0aGUgdGhyZWFkXG4gICAgICAgICAgICAgICAgcm9vbS5nZXRUaHJlYWRzKCkuZm9yRWFjaCgodGhyZWFkKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNlcmlhbGl6ZWRUaHJlYWRzTWFwW3RocmVhZC5pZF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudHM6IHRocmVhZC5ldmVudHMubWFwKGV2ID0+IGV2LmdldElkKCkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbnVtVGltZWxpbmVzOiB0aHJlYWQudGltZWxpbmVTZXQuZ2V0VGltZWxpbmVzKCkubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGl2ZVRpbWVsaW5lOiB0aHJlYWQudGltZWxpbmVTZXQuZ2V0TGl2ZVRpbWVsaW5lKCkuZ2V0RXZlbnRzKCkubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJldlRpbWVsaW5lOiB0aHJlYWQudGltZWxpbmVTZXQuZ2V0TGl2ZVRpbWVsaW5lKCkuZ2V0TmVpZ2hib3VyaW5nVGltZWxpbmUoRGlyZWN0aW9uLkJhY2t3YXJkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8uZ2V0RXZlbnRzKCkubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFRpbWVsaW5lOiB0aHJlYWQudGltZWxpbmVTZXQuZ2V0TGl2ZVRpbWVsaW5lKCkuZ2V0TmVpZ2hib3VyaW5nVGltZWxpbmUoRGlyZWN0aW9uLkZvcndhcmQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPy5nZXRFdmVudHMoKS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoYG9uRHVtcERlYnVnTG9nczogRmFpbGVkIHRvIHNlcmlhbGl6ZSBldmVudCBJRHMgZnJvbSB0aGUgdGhyZWFkc2AsIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdGltZWxpbmVXaW5kb3dFdmVudElkczogc3RyaW5nW107XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aW1lbGluZVdpbmRvd0V2ZW50SWRzID0gdGhpcy50aW1lbGluZVdpbmRvdy5nZXRFdmVudHMoKS5tYXAoZXYgPT4gZXYuZ2V0SWQoKSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGBvbkR1bXBEZWJ1Z0xvZ3M6IEZhaWxlZCB0byBnZXQgZXZlbnQgSURzIGZyb20gdGhlIHRpbWVsaW5lV2luZG93YCwgZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcGVuZGluZ0V2ZW50SWRzOiBzdHJpbmdbXTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHBlbmRpbmdFdmVudElkcyA9IHRoaXMucHJvcHMudGltZWxpbmVTZXQuZ2V0UGVuZGluZ0V2ZW50cygpLm1hcChldiA9PiBldi5nZXRJZCgpKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoYG9uRHVtcERlYnVnTG9nczogRmFpbGVkIHRvIGdldCBwZW5kaW5nIGV2ZW50IElEc2AsIGVycik7XG4gICAgICAgIH1cblxuICAgICAgICBsb2dnZXIuZGVidWcoXG4gICAgICAgICAgICBgVGltZWxpbmVQYW5lbCgke3RoaXMuY29udGV4dC50aW1lbGluZVJlbmRlcmluZ1R5cGV9KTogRGVidWdnaW5nIGluZm8gZm9yICR7cm9vbT8ucm9vbUlkfVxcbmAgK1xuICAgICAgICAgICAgYFxcdGV2ZW50cygke2V2ZW50SWRMaXN0Lmxlbmd0aH0pPSR7SlNPTi5zdHJpbmdpZnkoZXZlbnRJZExpc3QpfVxcbmAgK1xuICAgICAgICAgICAgYFxcdHJlbmRlcmVkRXZlbnRJZHMoJHtyZW5kZXJlZEV2ZW50SWRzPy5sZW5ndGggPz8gMH0pPWAgK1xuICAgICAgICAgICAgYCR7SlNPTi5zdHJpbmdpZnkocmVuZGVyZWRFdmVudElkcyl9XFxuYCArXG4gICAgICAgICAgICBgXFx0c2VyaWFsaXplZEV2ZW50SWRzRnJvbVRpbWVsaW5lU2V0cz0ke0pTT04uc3RyaW5naWZ5KHNlcmlhbGl6ZWRFdmVudElkc0Zyb21UaW1lbGluZVNldHMpfVxcbmAgK1xuICAgICAgICAgICAgYFxcdHNlcmlhbGl6ZWRFdmVudElkc0Zyb21UaHJlYWRzVGltZWxpbmVTZXRzPWAgK1xuICAgICAgICAgICAgYCR7SlNPTi5zdHJpbmdpZnkoc2VyaWFsaXplZEV2ZW50SWRzRnJvbVRocmVhZHNUaW1lbGluZVNldHMpfVxcbmAgK1xuICAgICAgICAgICAgYFxcdHNlcmlhbGl6ZWRUaHJlYWRzTWFwPSR7SlNPTi5zdHJpbmdpZnkoc2VyaWFsaXplZFRocmVhZHNNYXApfVxcbmAgK1xuICAgICAgICAgICAgYFxcdHRpbWVsaW5lV2luZG93RXZlbnRJZHMoJHt0aW1lbGluZVdpbmRvd0V2ZW50SWRzLmxlbmd0aH0pPSR7SlNPTi5zdHJpbmdpZnkodGltZWxpbmVXaW5kb3dFdmVudElkcyl9XFxuYCArXG4gICAgICAgICAgICBgXFx0cGVuZGluZ0V2ZW50SWRzKCR7cGVuZGluZ0V2ZW50SWRzLmxlbmd0aH0pPSR7SlNPTi5zdHJpbmdpZnkocGVuZGluZ0V2ZW50SWRzKX1gLFxuICAgICAgICApO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uTWVzc2FnZUxpc3RVbmZpbGxSZXF1ZXN0ID0gKGJhY2t3YXJkczogYm9vbGVhbiwgc2Nyb2xsVG9rZW46IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgICAgICAvLyBJZiBiYWNrd2FyZHMsIHVucGFnaW5hdGUgZnJvbSB0aGUgYmFjayAoaS5lLiB0aGUgc3RhcnQgb2YgdGhlIHRpbWVsaW5lKVxuICAgICAgICBjb25zdCBkaXIgPSBiYWNrd2FyZHMgPyBFdmVudFRpbWVsaW5lLkJBQ0tXQVJEUyA6IEV2ZW50VGltZWxpbmUuRk9SV0FSRFM7XG4gICAgICAgIGRlYnVnbG9nKFwidW5wYWdpbmF0aW5nIGV2ZW50cyBpbiBkaXJlY3Rpb25cIiwgZGlyKTtcblxuICAgICAgICAvLyBBbGwgdGlsZXMgYXJlIGluc2VydGVkIGJ5IE1lc3NhZ2VQYW5lbCB0byBoYXZlIGEgc2Nyb2xsVG9rZW4gPT09IGV2ZW50SWQsIGFuZFxuICAgICAgICAvLyB0aGlzIHBhcnRpY3VsYXIgZXZlbnQgc2hvdWxkIGJlIHRoZSBmaXJzdCBvciBsYXN0IHRvIGJlIHVucGFnaW5hdGVkLlxuICAgICAgICBjb25zdCBldmVudElkID0gc2Nyb2xsVG9rZW47XG5cbiAgICAgICAgY29uc3QgbWFya2VyID0gdGhpcy5zdGF0ZS5ldmVudHMuZmluZEluZGV4KFxuICAgICAgICAgICAgKGV2KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGV2LmdldElkKCkgPT09IGV2ZW50SWQ7XG4gICAgICAgICAgICB9LFxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IGNvdW50ID0gYmFja3dhcmRzID8gbWFya2VyICsgMSA6IHRoaXMuc3RhdGUuZXZlbnRzLmxlbmd0aCAtIG1hcmtlcjtcblxuICAgICAgICBpZiAoY291bnQgPiAwKSB7XG4gICAgICAgICAgICBkZWJ1Z2xvZyhcIlVucGFnaW5hdGluZ1wiLCBjb3VudCwgXCJpbiBkaXJlY3Rpb25cIiwgZGlyKTtcbiAgICAgICAgICAgIHRoaXMudGltZWxpbmVXaW5kb3cudW5wYWdpbmF0ZShjb3VudCwgYmFja3dhcmRzKTtcblxuICAgICAgICAgICAgY29uc3QgeyBldmVudHMsIGxpdmVFdmVudHMsIGZpcnN0VmlzaWJsZUV2ZW50SW5kZXggfSA9IHRoaXMuZ2V0RXZlbnRzKCk7XG4gICAgICAgICAgICB0aGlzLmJ1aWxkTGVnYWN5Q2FsbEV2ZW50R3JvdXBlcnMoZXZlbnRzKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld1N0YXRlOiBQYXJ0aWFsPElTdGF0ZT4gPSB7XG4gICAgICAgICAgICAgICAgZXZlbnRzLFxuICAgICAgICAgICAgICAgIGxpdmVFdmVudHMsXG4gICAgICAgICAgICAgICAgZmlyc3RWaXNpYmxlRXZlbnRJbmRleCxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIFdlIGNhbiBub3cgcGFnaW5hdGUgaW4gdGhlIHVucGFnaW5hdGVkIGRpcmVjdGlvblxuICAgICAgICAgICAgaWYgKGJhY2t3YXJkcykge1xuICAgICAgICAgICAgICAgIG5ld1N0YXRlLmNhbkJhY2tQYWdpbmF0ZSA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ld1N0YXRlLmNhbkZvcndhcmRQYWdpbmF0ZSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlPG51bGw+KG5ld1N0YXRlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUGFnaW5hdGlvblJlcXVlc3QgPSAoXG4gICAgICAgIHRpbWVsaW5lV2luZG93OiBUaW1lbGluZVdpbmRvdyxcbiAgICAgICAgZGlyZWN0aW9uOiBEaXJlY3Rpb24sXG4gICAgICAgIHNpemU6IG51bWJlcixcbiAgICApOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25QYWdpbmF0aW9uUmVxdWVzdCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMub25QYWdpbmF0aW9uUmVxdWVzdCh0aW1lbGluZVdpbmRvdywgZGlyZWN0aW9uLCBzaXplKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aW1lbGluZVdpbmRvdy5wYWdpbmF0ZShkaXJlY3Rpb24sIHNpemUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIHNldCBvZmYgYSBwYWdpbmF0aW9uIHJlcXVlc3QuXG4gICAgcHJpdmF0ZSBvbk1lc3NhZ2VMaXN0RmlsbFJlcXVlc3QgPSAoYmFja3dhcmRzOiBib29sZWFuKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgICAgIGlmICghdGhpcy5zaG91bGRQYWdpbmF0ZSgpKSByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTtcblxuICAgICAgICBjb25zdCBkaXIgPSBiYWNrd2FyZHMgPyBFdmVudFRpbWVsaW5lLkJBQ0tXQVJEUyA6IEV2ZW50VGltZWxpbmUuRk9SV0FSRFM7XG4gICAgICAgIGNvbnN0IGNhblBhZ2luYXRlS2V5ID0gYmFja3dhcmRzID8gJ2NhbkJhY2tQYWdpbmF0ZScgOiAnY2FuRm9yd2FyZFBhZ2luYXRlJztcbiAgICAgICAgY29uc3QgcGFnaW5hdGluZ0tleSA9IGJhY2t3YXJkcyA/ICdiYWNrUGFnaW5hdGluZycgOiAnZm9yd2FyZFBhZ2luYXRpbmcnO1xuXG4gICAgICAgIGlmICghdGhpcy5zdGF0ZVtjYW5QYWdpbmF0ZUtleV0pIHtcbiAgICAgICAgICAgIGRlYnVnbG9nKFwiaGF2ZSBnaXZlbiB1cFwiLCBkaXIsIFwicGFnaW5hdGluZyB0aGlzIHRpbWVsaW5lXCIpO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMudGltZWxpbmVXaW5kb3cuY2FuUGFnaW5hdGUoZGlyKSkge1xuICAgICAgICAgICAgZGVidWdsb2coXCJjYW4ndFwiLCBkaXIsIFwicGFnaW5hdGUgYW55IGZ1cnRoZXJcIik7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlPG51bGw+KHsgW2NhblBhZ2luYXRlS2V5XTogZmFsc2UgfSk7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChiYWNrd2FyZHMgJiYgdGhpcy5zdGF0ZS5maXJzdFZpc2libGVFdmVudEluZGV4ICE9PSAwKSB7XG4gICAgICAgICAgICBkZWJ1Z2xvZyhcIndvbid0XCIsIGRpciwgXCJwYWdpbmF0ZSBwYXN0IGZpcnN0IHZpc2libGUgZXZlbnRcIik7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRlYnVnbG9nKFwiSW5pdGlhdGluZyBwYWdpbmF0ZTsgYmFja3dhcmRzOlwiK2JhY2t3YXJkcyk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGU8bnVsbD4oeyBbcGFnaW5hdGluZ0tleV06IHRydWUgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMub25QYWdpbmF0aW9uUmVxdWVzdCh0aGlzLnRpbWVsaW5lV2luZG93LCBkaXIsIFBBR0lOQVRFX1NJWkUpLnRoZW4oKHIpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkgeyByZXR1cm47IH1cblxuICAgICAgICAgICAgZGVidWdsb2coXCJwYWdpbmF0ZSBjb21wbGV0ZSBiYWNrd2FyZHM6XCIrYmFja3dhcmRzK1wiOyBzdWNjZXNzOlwiK3IpO1xuXG4gICAgICAgICAgICBjb25zdCB7IGV2ZW50cywgbGl2ZUV2ZW50cywgZmlyc3RWaXNpYmxlRXZlbnRJbmRleCB9ID0gdGhpcy5nZXRFdmVudHMoKTtcbiAgICAgICAgICAgIHRoaXMuYnVpbGRMZWdhY3lDYWxsRXZlbnRHcm91cGVycyhldmVudHMpO1xuICAgICAgICAgICAgY29uc3QgbmV3U3RhdGU6IFBhcnRpYWw8SVN0YXRlPiA9IHtcbiAgICAgICAgICAgICAgICBbcGFnaW5hdGluZ0tleV06IGZhbHNlLFxuICAgICAgICAgICAgICAgIFtjYW5QYWdpbmF0ZUtleV06IHIsXG4gICAgICAgICAgICAgICAgZXZlbnRzLFxuICAgICAgICAgICAgICAgIGxpdmVFdmVudHMsXG4gICAgICAgICAgICAgICAgZmlyc3RWaXNpYmxlRXZlbnRJbmRleCxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIG1vdmluZyB0aGUgd2luZG93IGluIHRoaXMgZGlyZWN0aW9uIG1heSBtZWFuIHRoYXQgd2UgY2FuIG5vd1xuICAgICAgICAgICAgLy8gcGFnaW5hdGUgaW4gdGhlIG90aGVyIHdoZXJlIHdlIHByZXZpb3VzbHkgY291bGQgbm90LlxuICAgICAgICAgICAgY29uc3Qgb3RoZXJEaXJlY3Rpb24gPSBiYWNrd2FyZHMgPyBFdmVudFRpbWVsaW5lLkZPUldBUkRTIDogRXZlbnRUaW1lbGluZS5CQUNLV0FSRFM7XG4gICAgICAgICAgICBjb25zdCBjYW5QYWdpbmF0ZU90aGVyV2F5S2V5ID0gYmFja3dhcmRzID8gJ2NhbkZvcndhcmRQYWdpbmF0ZScgOiAnY2FuQmFja1BhZ2luYXRlJztcbiAgICAgICAgICAgIGlmICghdGhpcy5zdGF0ZVtjYW5QYWdpbmF0ZU90aGVyV2F5S2V5XSAmJlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbWVsaW5lV2luZG93LmNhblBhZ2luYXRlKG90aGVyRGlyZWN0aW9uKSkge1xuICAgICAgICAgICAgICAgIGRlYnVnbG9nKCdjYW4gbm93Jywgb3RoZXJEaXJlY3Rpb24sICdwYWdpbmF0ZSBhZ2FpbicpO1xuICAgICAgICAgICAgICAgIG5ld1N0YXRlW2NhblBhZ2luYXRlT3RoZXJXYXlLZXldID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRG9uJ3QgcmVzb2x2ZSB1bnRpbCB0aGUgc2V0U3RhdGUgaGFzIGNvbXBsZXRlZDogd2UgbmVlZCB0byBsZXRcbiAgICAgICAgICAgIC8vIHRoZSBjb21wb25lbnQgdXBkYXRlIGJlZm9yZSB3ZSBjb25zaWRlciB0aGUgcGFnaW5hdGlvbiBjb21wbGV0ZWQsXG4gICAgICAgICAgICAvLyBvdGhlcndpc2Ugd2UnbGwgZW5kIHVwIHBhZ2luYXRpbmcgaW4gYWxsIHRoZSBoaXN0b3J5IHRoZSBqcy1zZGtcbiAgICAgICAgICAgIC8vIGhhcyBpbiBtZW1vcnkgYmVjYXVzZSB3ZSBuZXZlciBnYXZlIHRoZSBjb21wb25lbnQgYSBjaGFuY2UgdG8gc2Nyb2xsXG4gICAgICAgICAgICAvLyBpdHNlbGYgaW50byB0aGUgcmlnaHQgcGxhY2VcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGU8bnVsbD4obmV3U3RhdGUsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gd2UgY2FuIGNvbnRpbnVlIHBhZ2luYXRpbmcgaW4gdGhlIGdpdmVuIGRpcmVjdGlvbiBpZjpcbiAgICAgICAgICAgICAgICAgICAgLy8gLSB0aW1lbGluZVdpbmRvdy5wYWdpbmF0ZSBzYXlzIHdlIGNhblxuICAgICAgICAgICAgICAgICAgICAvLyAtIHdlJ3JlIHBhZ2luYXRpbmcgZm9yd2FyZHMsIG9yIHdlIHdvbid0IGJlIHRyeWluZyB0b1xuICAgICAgICAgICAgICAgICAgICAvLyAgIHBhZ2luYXRlIGJhY2t3YXJkcyBwYXN0IHRoZSBmaXJzdCB2aXNpYmxlIGV2ZW50XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUociAmJiAoIWJhY2t3YXJkcyB8fCBmaXJzdFZpc2libGVFdmVudEluZGV4ID09PSAwKSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25NZXNzYWdlTGlzdFNjcm9sbCA9IGUgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uU2Nyb2xsPy4oZSk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm1hbmFnZVJlYWRNYXJrZXJzKSB7XG4gICAgICAgICAgICB0aGlzLmRvTWFuYWdlUmVhZE1hcmtlcnMoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKlxuICAgICAqIERlYm91bmNlZCBmdW5jdGlvbiB0byBtYW5hZ2UgcmVhZCBtYXJrZXJzIGJlY2F1c2Ugd2UgZG9uJ3QgbmVlZCB0b1xuICAgICAqIGRvIHRoaXMgb24gZXZlcnkgdGlueSBzY3JvbGwgdXBkYXRlLiBJdCBhbHNvIHNldHMgc3RhdGUgd2hpY2ggY2F1c2VzXG4gICAgICogYSBjb21wb25lbnQgdXBkYXRlLCB3aGljaCBjYW4gaW4gdHVybiByZXNldCB0aGUgc2Nyb2xsIHBvc2l0aW9uLCBzb1xuICAgICAqIGl0J3MgaW1wb3J0YW50IHdlIGFsbG93IHRoZSBicm93c2VyIHRvIHNjcm9sbCBhIGJpdCBiZWZvcmUgcnVubmluZyB0aGlzXG4gICAgICogKGhlbmNlIHRyYWlsaW5nIGVkZ2Ugb25seSBhbmQgZGVib3VuY2UgcmF0aGVyIHRoYW4gdGhyb3R0bGUgYmVjYXVzZVxuICAgICAqIHdlIHJlYWxseSBvbmx5IG5lZWQgdG8gdXBkYXRlIHRoaXMgb25jZSB0aGUgdXNlciBoYXMgZmluaXNoZWQgc2Nyb2xsaW5nLFxuICAgICAqIG5vdCBwZXJpb2RpY2FsbHkgd2hpbGUgdGhleSBzY3JvbGwpLlxuICAgICAqL1xuICAgIHByaXZhdGUgZG9NYW5hZ2VSZWFkTWFya2VycyA9IGRlYm91bmNlKCgpID0+IHtcbiAgICAgICAgY29uc3Qgcm1Qb3NpdGlvbiA9IHRoaXMuZ2V0UmVhZE1hcmtlclBvc2l0aW9uKCk7XG4gICAgICAgIC8vIHdlIGhpZGUgdGhlIHJlYWQgbWFya2VyIHdoZW4gaXQgZmlyc3QgY29tZXMgb250byB0aGUgc2NyZWVuLCBidXQgaWZcbiAgICAgICAgLy8gaXQgZ29lcyBiYWNrIG9mZiB0aGUgdG9wIG9mIHRoZSBzY3JlZW4gKHByZXN1bWFibHkgYmVjYXVzZSB0aGUgdXNlclxuICAgICAgICAvLyBjbGlja3Mgb24gdGhlICdqdW1wIHRvIGJvdHRvbScgYnV0dG9uKSwgd2UgbmVlZCB0byByZS1lbmFibGUgaXQuXG4gICAgICAgIGlmIChybVBvc2l0aW9uIDwgMCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHJlYWRNYXJrZXJWaXNpYmxlOiB0cnVlIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgcmVhZCBtYXJrZXIgcG9zaXRpb24gZ29lcyBiZXR3ZWVuIDAgYW5kIC0xLzEsXG4gICAgICAgIC8vIChhbmQgdXNlciBpcyBhY3RpdmUpLCBzd2l0Y2ggdGltZW91dFxuICAgICAgICBjb25zdCB0aW1lb3V0ID0gdGhpcy5yZWFkTWFya2VyVGltZW91dChybVBvc2l0aW9uKTtcbiAgICAgICAgLy8gTk8tT1Agd2hlbiB0aW1lb3V0IGFscmVhZHkgaGFzIHNldCB0byB0aGUgZ2l2ZW4gdmFsdWVcbiAgICAgICAgdGhpcy5yZWFkTWFya2VyQWN0aXZpdHlUaW1lcj8uY2hhbmdlVGltZW91dCh0aW1lb3V0KTtcbiAgICB9LCBSRUFEX01BUktFUl9ERUJPVU5DRV9NUywgeyBsZWFkaW5nOiBmYWxzZSwgdHJhaWxpbmc6IHRydWUgfSk7XG5cbiAgICBwcml2YXRlIG9uQWN0aW9uID0gKHBheWxvYWQ6IEFjdGlvblBheWxvYWQpOiB2b2lkID0+IHtcbiAgICAgICAgc3dpdGNoIChwYXlsb2FkLmFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSBcImlnbm9yZV9zdGF0ZV9jaGFuZ2VkXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBBY3Rpb24uRHVtcERlYnVnTG9nczpcbiAgICAgICAgICAgICAgICB0aGlzLm9uRHVtcERlYnVnTG9ncygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Sb29tVGltZWxpbmUgPSAoXG4gICAgICAgIGV2OiBNYXRyaXhFdmVudCxcbiAgICAgICAgcm9vbTogUm9vbSB8IG51bGwsXG4gICAgICAgIHRvU3RhcnRPZlRpbWVsaW5lOiBib29sZWFuLFxuICAgICAgICByZW1vdmVkOiBib29sZWFuLFxuICAgICAgICBkYXRhOiBJUm9vbVRpbWVsaW5lRGF0YSxcbiAgICApOiB2b2lkID0+IHtcbiAgICAgICAgLy8gaWdub3JlIGV2ZW50cyBmb3Igb3RoZXIgdGltZWxpbmUgc2V0c1xuICAgICAgICBpZiAoZGF0YS50aW1lbGluZS5nZXRUaW1lbGluZVNldCgpICE9PSB0aGlzLnByb3BzLnRpbWVsaW5lU2V0KSByZXR1cm47XG5cbiAgICAgICAgaWYgKCFUaHJlYWQuaGFzU2VydmVyU2lkZVN1cHBvcnQgJiYgdGhpcy5jb250ZXh0LnRpbWVsaW5lUmVuZGVyaW5nVHlwZSA9PT0gVGltZWxpbmVSZW5kZXJpbmdUeXBlLlRocmVhZCkge1xuICAgICAgICAgICAgLy8gY29uc3QgZGlyZWN0aW9uID0gdG9TdGFydE9mVGltZWxpbmUgPyBEaXJlY3Rpb24uQmFja3dhcmQgOiBEaXJlY3Rpb24uRm9yd2FyZDtcbiAgICAgICAgICAgIC8vIHRoaXMudGltZWxpbmVXaW5kb3cuZXh0ZW5kKGRpcmVjdGlvbiwgMSk7XG4gICAgICAgICAgICBpZiAodG9TdGFydE9mVGltZWxpbmUgJiYgIXRoaXMuc3RhdGUuY2FuQmFja1BhZ2luYXRlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGNhbkJhY2tQYWdpbmF0ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdG9TdGFydE9mVGltZWxpbmUgJiYgIXRoaXMuc3RhdGUuY2FuRm9yd2FyZFBhZ2luYXRlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGNhbkZvcndhcmRQYWdpbmF0ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlnbm9yZSBhbnl0aGluZyBidXQgcmVhbC10aW1lIHVwZGF0ZXMgYXQgdGhlIGVuZCBvZiB0aGUgcm9vbTpcbiAgICAgICAgLy8gdXBkYXRlcyBmcm9tIHBhZ2luYXRpb24gd2lsbCBoYXBwZW4gd2hlbiB0aGUgcGFnaW5hdGUgY29tcGxldGVzLlxuICAgICAgICBpZiAodG9TdGFydE9mVGltZWxpbmUgfHwgIWRhdGEgfHwgIWRhdGEubGl2ZUV2ZW50KSByZXR1cm47XG5cbiAgICAgICAgaWYgKCF0aGlzLm1lc3NhZ2VQYW5lbC5jdXJyZW50Py5nZXRTY3JvbGxTdGF0ZSgpKSByZXR1cm47XG5cbiAgICAgICAgaWYgKCF0aGlzLm1lc3NhZ2VQYW5lbC5jdXJyZW50LmdldFNjcm9sbFN0YXRlKCkuc3R1Y2tBdEJvdHRvbSkge1xuICAgICAgICAgICAgLy8gd2Ugd29uJ3QgbG9hZCB0aGlzIGV2ZW50IG5vdywgYmVjYXVzZSB3ZSBkb24ndCB3YW50IHRvIHB1c2ggYW55XG4gICAgICAgICAgICAvLyBldmVudHMgb2ZmIHRoZSBvdGhlciBlbmQgb2YgdGhlIHRpbWVsaW5lLiBCdXQgd2UgbmVlZCB0byBub3RlXG4gICAgICAgICAgICAvLyB0aGF0IHdlIGNhbiBub3cgcGFnaW5hdGUuXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgY2FuRm9yd2FyZFBhZ2luYXRlOiB0cnVlIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdGVsbCB0aGUgdGltZWxpbmUgd2luZG93IHRvIHRyeSB0byBhZHZhbmNlIGl0c2VsZiwgYnV0IG5vdCB0byBtYWtlXG4gICAgICAgIC8vIGEgaHR0cCByZXF1ZXN0IHRvIGRvIHNvLlxuICAgICAgICAvL1xuICAgICAgICAvLyB3ZSBkZWxpYmVyYXRlbHkgYXZvaWQgZ29pbmcgdmlhIHRoZSBTY3JvbGxQYW5lbCBmb3IgdGhpcyBjYWxsIC0gdGhlXG4gICAgICAgIC8vIFNjcm9sbFBhbmVsIG1pZ2h0IGFscmVhZHkgaGF2ZSBhbiBhY3RpdmUgcGFnaW5hdGlvbiBwcm9taXNlLCB3aGljaFxuICAgICAgICAvLyB3aWxsIGZhaWwsIGJ1dCB3b3VsZCBzdG9wIHVzIHBhc3NpbmcgdGhlIHBhZ2luYXRpb24gcmVxdWVzdCB0byB0aGVcbiAgICAgICAgLy8gdGltZWxpbmUgd2luZG93LlxuICAgICAgICAvL1xuICAgICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS92ZWN0b3Itd2ViL2lzc3Vlcy8xMDM1XG4gICAgICAgIHRoaXMudGltZWxpbmVXaW5kb3cucGFnaW5hdGUoRXZlbnRUaW1lbGluZS5GT1JXQVJEUywgMSwgZmFsc2UpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMudW5tb3VudGVkKSB7IHJldHVybjsgfVxuXG4gICAgICAgICAgICBjb25zdCB7IGV2ZW50cywgbGl2ZUV2ZW50cywgZmlyc3RWaXNpYmxlRXZlbnRJbmRleCB9ID0gdGhpcy5nZXRFdmVudHMoKTtcbiAgICAgICAgICAgIHRoaXMuYnVpbGRMZWdhY3lDYWxsRXZlbnRHcm91cGVycyhldmVudHMpO1xuICAgICAgICAgICAgY29uc3QgbGFzdExpdmVFdmVudCA9IGxpdmVFdmVudHNbbGl2ZUV2ZW50cy5sZW5ndGggLSAxXTtcblxuICAgICAgICAgICAgY29uc3QgdXBkYXRlZFN0YXRlOiBQYXJ0aWFsPElTdGF0ZT4gPSB7XG4gICAgICAgICAgICAgICAgZXZlbnRzLFxuICAgICAgICAgICAgICAgIGxpdmVFdmVudHMsXG4gICAgICAgICAgICAgICAgZmlyc3RWaXNpYmxlRXZlbnRJbmRleCxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGxldCBjYWxsUk1VcGRhdGVkO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMubWFuYWdlUmVhZE1hcmtlcnMpIHtcbiAgICAgICAgICAgICAgICAvLyB3aGVuIGEgbmV3IGV2ZW50IGFycml2ZXMgd2hlbiB0aGUgdXNlciBpcyBub3Qgd2F0Y2hpbmcgdGhlXG4gICAgICAgICAgICAgICAgLy8gd2luZG93LCBidXQgdGhlIHdpbmRvdyBpcyBpbiBpdHMgYXV0by1zY3JvbGwgbW9kZSwgbWFrZSBzdXJlIHRoZVxuICAgICAgICAgICAgICAgIC8vIHJlYWQgbWFya2VyIGlzIHZpc2libGUuXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAvLyBXZSBpZ25vcmUgZXZlbnRzIHdlIGhhdmUgc2VudCBvdXJzZWx2ZXM7IHdlIGRvbid0IHdhbnQgdG8gc2VlIHRoZVxuICAgICAgICAgICAgICAgIC8vIHJlYWQtbWFya2VyIHdoZW4gYSByZW1vdGUgZWNobyBvZiBhbiBldmVudCB3ZSBoYXZlIGp1c3Qgc2VudCB0YWtlc1xuICAgICAgICAgICAgICAgIC8vIG1vcmUgdGhhbiB0aGUgdGltZW91dCBvbiB1c2VyQWN0aXZlUmVjZW50bHkuXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICBjb25zdCBteVVzZXJJZCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5jcmVkZW50aWFscy51c2VySWQ7XG4gICAgICAgICAgICAgICAgY2FsbFJNVXBkYXRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChldi5nZXRTZW5kZXIoKSAhPT0gbXlVc2VySWQgJiYgIVVzZXJBY3Rpdml0eS5zaGFyZWRJbnN0YW5jZSgpLnVzZXJBY3RpdmVSZWNlbnRseSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZWRTdGF0ZS5yZWFkTWFya2VyVmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChsYXN0TGl2ZUV2ZW50ICYmIHRoaXMuZ2V0UmVhZE1hcmtlclBvc2l0aW9uKCkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gd2Uga25vdyB3ZSdyZSBzdHVja0F0Qm90dG9tLCBzbyB3ZSBjYW4gYWR2YW5jZSB0aGUgUk1cbiAgICAgICAgICAgICAgICAgICAgLy8gaW1tZWRpYXRlbHksIHRvIHNhdmUgYSBsYXRlciByZW5kZXIgY3ljbGVcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFJlYWRNYXJrZXIobGFzdExpdmVFdmVudC5nZXRJZCgpLCBsYXN0TGl2ZUV2ZW50LmdldFRzKCksIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGVkU3RhdGUucmVhZE1hcmtlclZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlZFN0YXRlLnJlYWRNYXJrZXJFdmVudElkID0gbGFzdExpdmVFdmVudC5nZXRJZCgpO1xuICAgICAgICAgICAgICAgICAgICBjYWxsUk1VcGRhdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGU8bnVsbD4odXBkYXRlZFN0YXRlLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5tZXNzYWdlUGFuZWwuY3VycmVudD8udXBkYXRlVGltZWxpbmVNaW5IZWlnaHQoKTtcbiAgICAgICAgICAgICAgICBpZiAoY2FsbFJNVXBkYXRlZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uUmVhZE1hcmtlclVwZGF0ZWQ/LigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJvb21UaW1lbGluZVJlc2V0ID0gKHJvb206IFJvb20sIHRpbWVsaW5lU2V0OiBFdmVudFRpbWVsaW5lU2V0KTogdm9pZCA9PiB7XG4gICAgICAgIGlmICh0aW1lbGluZVNldCAhPT0gdGhpcy5wcm9wcy50aW1lbGluZVNldCkgcmV0dXJuO1xuXG4gICAgICAgIGlmICh0aGlzLm1lc3NhZ2VQYW5lbC5jdXJyZW50ICYmIHRoaXMubWVzc2FnZVBhbmVsLmN1cnJlbnQuaXNBdEJvdHRvbSgpKSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRUaW1lbGluZSgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHB1YmxpYyBjYW5SZXNldFRpbWVsaW5lID0gKCkgPT4gdGhpcy5tZXNzYWdlUGFuZWw/LmN1cnJlbnQuaXNBdEJvdHRvbSgpO1xuXG4gICAgcHJpdmF0ZSBvblJvb21SZWRhY3Rpb24gPSAoZXY6IE1hdHJpeEV2ZW50LCByb29tOiBSb29tKTogdm9pZCA9PiB7XG4gICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIGlnbm9yZSBldmVudHMgZm9yIG90aGVyIHJvb21zXG4gICAgICAgIGlmIChyb29tICE9PSB0aGlzLnByb3BzLnRpbWVsaW5lU2V0LnJvb20pIHJldHVybjtcblxuICAgICAgICAvLyB3ZSBjb3VsZCBza2lwIGFuIHVwZGF0ZSBpZiB0aGUgZXZlbnQgaXNuJ3QgaW4gb3VyIHRpbWVsaW5lLFxuICAgICAgICAvLyBidXQgdGhhdCdzIHByb2JhYmx5IGFuIGVhcmx5IG9wdGltaXNhdGlvbi5cbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgIH07XG5cbiAgICAvLyBDYWxsZWQgd2hlbmV2ZXIgdGhlIHZpc2liaWxpdHkgb2YgYW4gZXZlbnQgY2hhbmdlcywgYXMgcGVyXG4gICAgLy8gTVNDMzUzMS4gV2UgdHlwaWNhbGx5IG5lZWQgdG8gcmUtcmVuZGVyIHRoZSB0aWxlLlxuICAgIHByaXZhdGUgb25FdmVudFZpc2liaWxpdHlDaGFuZ2UgPSAoZXY6IE1hdHJpeEV2ZW50KTogdm9pZCA9PiB7XG4gICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWdub3JlIGV2ZW50cyBmb3Igb3RoZXIgcm9vbXNcbiAgICAgICAgY29uc3Qgcm9vbUlkID0gZXYuZ2V0Um9vbUlkKCk7XG4gICAgICAgIGlmIChyb29tSWQgIT09IHRoaXMucHJvcHMudGltZWxpbmVTZXQucm9vbT8ucm9vbUlkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyB3ZSBjb3VsZCBza2lwIGFuIHVwZGF0ZSBpZiB0aGUgZXZlbnQgaXNuJ3QgaW4gb3VyIHRpbWVsaW5lLFxuICAgICAgICAvLyBidXQgdGhhdCdzIHByb2JhYmx5IGFuIGVhcmx5IG9wdGltaXNhdGlvbi5cbiAgICAgICAgY29uc3QgdGlsZSA9IHRoaXMubWVzc2FnZVBhbmVsLmN1cnJlbnQ/LmdldFRpbGVGb3JFdmVudElkKGV2LmdldElkKCkpO1xuICAgICAgICBpZiAodGlsZSkge1xuICAgICAgICAgICAgdGlsZS5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25WaXNpYmlsaXR5UG93ZXJMZXZlbENoYW5nZSA9IChldjogTWF0cml4RXZlbnQsIG1lbWJlcjogUm9vbU1lbWJlcik6IHZvaWQgPT4ge1xuICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHJldHVybjtcblxuICAgICAgICAvLyBpZ25vcmUgZXZlbnRzIGZvciBvdGhlciByb29tc1xuICAgICAgICBpZiAobWVtYmVyLnJvb21JZCAhPT0gdGhpcy5wcm9wcy50aW1lbGluZVNldC5yb29tPy5yb29tSWQpIHJldHVybjtcblxuICAgICAgICAvLyBpZ25vcmUgZXZlbnRzIGZvciBvdGhlciB1c2Vyc1xuICAgICAgICBpZiAobWVtYmVyLnVzZXJJZCAhPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuY3JlZGVudGlhbHM/LnVzZXJJZCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIFdlIGNvdWxkIHNraXAgYW4gdXBkYXRlIGlmIHRoZSBwb3dlciBsZXZlbCBjaGFuZ2UgZGlkbid0IGNyb3NzIHRoZVxuICAgICAgICAvLyB0aHJlc2hvbGQgZm9yIGBWSVNJQklMSVRZX0NIQU5HRV9UWVBFYC5cbiAgICAgICAgZm9yIChjb25zdCBldmVudCBvZiB0aGlzLnN0YXRlLmV2ZW50cykge1xuICAgICAgICAgICAgY29uc3QgdGlsZSA9IHRoaXMubWVzc2FnZVBhbmVsLmN1cnJlbnQ/LmdldFRpbGVGb3JFdmVudElkKGV2ZW50LmdldElkKCkpO1xuICAgICAgICAgICAgaWYgKCF0aWxlKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhlIGV2ZW50IGlzIG5vdCB2aXNpYmxlLCBub3RoaW5nIHRvIHJlLXJlbmRlci5cbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRpbGUuZm9yY2VVcGRhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkV2ZW50UmVwbGFjZWQgPSAocmVwbGFjZWRFdmVudDogTWF0cml4RXZlbnQpOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKHRoaXMudW5tb3VudGVkKSByZXR1cm47XG5cbiAgICAgICAgLy8gaWdub3JlIGV2ZW50cyBmb3Igb3RoZXIgcm9vbXNcbiAgICAgICAgaWYgKHJlcGxhY2VkRXZlbnQuZ2V0Um9vbUlkKCkgIT09IHRoaXMucHJvcHMudGltZWxpbmVTZXQucm9vbS5yb29tSWQpIHJldHVybjtcblxuICAgICAgICAvLyB3ZSBjb3VsZCBza2lwIGFuIHVwZGF0ZSBpZiB0aGUgZXZlbnQgaXNuJ3QgaW4gb3VyIHRpbWVsaW5lLFxuICAgICAgICAvLyBidXQgdGhhdCdzIHByb2JhYmx5IGFuIGVhcmx5IG9wdGltaXNhdGlvbi5cbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUm9vbVJlY2VpcHQgPSAoZXY6IE1hdHJpeEV2ZW50LCByb29tOiBSb29tKTogdm9pZCA9PiB7XG4gICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIGlnbm9yZSBldmVudHMgZm9yIG90aGVyIHJvb21zXG4gICAgICAgIGlmIChyb29tICE9PSB0aGlzLnByb3BzLnRpbWVsaW5lU2V0LnJvb20pIHJldHVybjtcblxuICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Mb2NhbEVjaG9VcGRhdGVkID0gKGV2OiBNYXRyaXhFdmVudCwgcm9vbTogUm9vbSwgb2xkRXZlbnRJZDogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIGlnbm9yZSBldmVudHMgZm9yIG90aGVyIHJvb21zXG4gICAgICAgIGlmIChyb29tICE9PSB0aGlzLnByb3BzLnRpbWVsaW5lU2V0LnJvb20pIHJldHVybjtcblxuICAgICAgICB0aGlzLnJlbG9hZEV2ZW50cygpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQWNjb3VudERhdGEgPSAoZXY6IE1hdHJpeEV2ZW50LCByb29tOiBSb29tKTogdm9pZCA9PiB7XG4gICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIGlnbm9yZSBldmVudHMgZm9yIG90aGVyIHJvb21zXG4gICAgICAgIGlmIChyb29tICE9PSB0aGlzLnByb3BzLnRpbWVsaW5lU2V0LnJvb20pIHJldHVybjtcblxuICAgICAgICBpZiAoZXYuZ2V0VHlwZSgpICE9PSBFdmVudFR5cGUuRnVsbHlSZWFkKSByZXR1cm47XG5cbiAgICAgICAgLy8gWFhYOiByb29tUmVhZE1hcmtlclRzTWFwIG5vdCB1cGRhdGVkIGhlcmUgc28gaXQgaXMgbm93IGluY29uc2lzdGVudC4gUmVwbGFjZVxuICAgICAgICAvLyB0aGlzIG1lY2hhbmlzbSBvZiBkZXRlcm1pbmluZyB3aGVyZSB0aGUgUk0gaXMgcmVsYXRpdmUgdG8gdGhlIHZpZXctcG9ydCB3aXRoXG4gICAgICAgIC8vIG9uZSBzdXBwb3J0ZWQgYnkgdGhlIHNlcnZlciAodGhlIGNsaWVudCBuZWVkcyBtb3JlIHRoYW4gYW4gZXZlbnQgSUQpLlxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHJlYWRNYXJrZXJFdmVudElkOiBldi5nZXRDb250ZW50KCkuZXZlbnRfaWQsXG4gICAgICAgIH0sIHRoaXMucHJvcHMub25SZWFkTWFya2VyVXBkYXRlZCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25FdmVudERlY3J5cHRlZCA9IChldjogTWF0cml4RXZlbnQpOiB2b2lkID0+IHtcbiAgICAgICAgLy8gQ2FuIGJlIG51bGwgZm9yIHRoZSBub3RpZmljYXRpb24gdGltZWxpbmUsIGV0Yy5cbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLnRpbWVsaW5lU2V0LnJvb20pIHJldHVybjtcblxuICAgICAgICBpZiAoZXYuZ2V0Um9vbUlkKCkgIT09IHRoaXMucHJvcHMudGltZWxpbmVTZXQucm9vbS5yb29tSWQpIHJldHVybjtcblxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZXZlbnRzLmluY2x1ZGVzKGV2KSkgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMucmVjaGVja0ZpcnN0VmlzaWJsZUV2ZW50SW5kZXgoKTtcblxuICAgICAgICAvLyBOZWVkIHRvIHVwZGF0ZSBhcyB3ZSBkb24ndCBkaXNwbGF5IGV2ZW50IHRpbGVzIGZvciBldmVudHMgdGhhdFxuICAgICAgICAvLyBoYXZlbid0IHlldCBiZWVuIGRlY3J5cHRlZC4gVGhlIGV2ZW50IHdpbGwgaGF2ZSBqdXN0IGJlZW4gdXBkYXRlZFxuICAgICAgICAvLyBpbiBwbGFjZSBzbyB3ZSBqdXN0IG5lZWQgdG8gcmUtcmVuZGVyLlxuICAgICAgICAvLyBUT0RPOiBXZSBzaG91bGQgcmVzdHJpY3QgdGhpcyB0byBvbmx5IGV2ZW50cyBpbiBvdXIgdGltZWxpbmUsXG4gICAgICAgIC8vIGJ1dCBwb3NzaWJseSB0aGUgZXZlbnQgdGlsZSBpdHNlbGYgc2hvdWxkIGp1c3QgdXBkYXRlIHdoZW4gdGhpc1xuICAgICAgICAvLyBoYXBwZW5zIHRvIHNhdmUgdXMgcmUtcmVuZGVyaW5nIHRoZSB3aG9sZSB0aW1lbGluZS5cbiAgICAgICAgdGhpcy5idWlsZExlZ2FjeUNhbGxFdmVudEdyb3VwZXJzKHRoaXMuc3RhdGUuZXZlbnRzKTtcbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uU3luYyA9IChjbGllbnRTeW5jU3RhdGU6IFN5bmNTdGF0ZSwgcHJldlN0YXRlOiBTeW5jU3RhdGUsIGRhdGE6IG9iamVjdCk6IHZvaWQgPT4ge1xuICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGNsaWVudFN5bmNTdGF0ZSB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSByZWNoZWNrRmlyc3RWaXNpYmxlRXZlbnRJbmRleCA9IHRocm90dGxlKCgpOiB2b2lkID0+IHtcbiAgICAgICAgY29uc3QgZmlyc3RWaXNpYmxlRXZlbnRJbmRleCA9IHRoaXMuY2hlY2tGb3JQcmVKb2luVUlTSSh0aGlzLnN0YXRlLmV2ZW50cyk7XG4gICAgICAgIGlmIChmaXJzdFZpc2libGVFdmVudEluZGV4ICE9PSB0aGlzLnN0YXRlLmZpcnN0VmlzaWJsZUV2ZW50SW5kZXgpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBmaXJzdFZpc2libGVFdmVudEluZGV4IH0pO1xuICAgICAgICB9XG4gICAgfSwgNTAwLCB7IGxlYWRpbmc6IHRydWUsIHRyYWlsaW5nOiB0cnVlIH0pO1xuXG4gICAgcHJpdmF0ZSByZWFkTWFya2VyVGltZW91dChyZWFkTWFya2VyUG9zaXRpb246IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIHJldHVybiByZWFkTWFya2VyUG9zaXRpb24gPT09IDAgP1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0Py5yZWFkTWFya2VySW5WaWV3VGhyZXNob2xkTXMgPz8gdGhpcy5zdGF0ZS5yZWFkTWFya2VySW5WaWV3VGhyZXNob2xkTXMgOlxuICAgICAgICAgICAgdGhpcy5jb250ZXh0Py5yZWFkTWFya2VyT3V0T2ZWaWV3VGhyZXNob2xkTXMgPz8gdGhpcy5zdGF0ZS5yZWFkTWFya2VyT3V0T2ZWaWV3VGhyZXNob2xkTXM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyB1cGRhdGVSZWFkTWFya2VyT25Vc2VyQWN0aXZpdHkoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IGluaXRpYWxUaW1lb3V0ID0gdGhpcy5yZWFkTWFya2VyVGltZW91dCh0aGlzLmdldFJlYWRNYXJrZXJQb3NpdGlvbigpKTtcbiAgICAgICAgdGhpcy5yZWFkTWFya2VyQWN0aXZpdHlUaW1lciA9IG5ldyBUaW1lcihpbml0aWFsVGltZW91dCk7XG5cbiAgICAgICAgd2hpbGUgKHRoaXMucmVhZE1hcmtlckFjdGl2aXR5VGltZXIpIHsgLy91bnNldCBvbiB1bm1vdW50XG4gICAgICAgICAgICBVc2VyQWN0aXZpdHkuc2hhcmVkSW5zdGFuY2UoKS50aW1lV2hpbGVBY3RpdmVSZWNlbnRseSh0aGlzLnJlYWRNYXJrZXJBY3Rpdml0eVRpbWVyKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5yZWFkTWFya2VyQWN0aXZpdHlUaW1lci5maW5pc2hlZCgpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkgeyBjb250aW51ZTsgLyogYWJvcnRlZCAqLyB9XG4gICAgICAgICAgICAvLyBvdXRzaWRlIG9mIHRyeS9jYXRjaCB0byBub3Qgc3dhbGxvdyBlcnJvcnNcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUmVhZE1hcmtlcigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyB1cGRhdGVSZWFkUmVjZWlwdE9uVXNlckFjdGl2aXR5KCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0aGlzLnJlYWRSZWNlaXB0QWN0aXZpdHlUaW1lciA9IG5ldyBUaW1lcihSRUFEX1JFQ0VJUFRfSU5URVJWQUxfTVMpO1xuICAgICAgICB3aGlsZSAodGhpcy5yZWFkUmVjZWlwdEFjdGl2aXR5VGltZXIpIHsgLy91bnNldCBvbiB1bm1vdW50XG4gICAgICAgICAgICBVc2VyQWN0aXZpdHkuc2hhcmVkSW5zdGFuY2UoKS50aW1lV2hpbGVBY3RpdmVOb3codGhpcy5yZWFkUmVjZWlwdEFjdGl2aXR5VGltZXIpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnJlYWRSZWNlaXB0QWN0aXZpdHlUaW1lci5maW5pc2hlZCgpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkgeyBjb250aW51ZTsgLyogYWJvcnRlZCAqLyB9XG4gICAgICAgICAgICAvLyBvdXRzaWRlIG9mIHRyeS9jYXRjaCB0byBub3Qgc3dhbGxvdyBlcnJvcnNcbiAgICAgICAgICAgIHRoaXMuc2VuZFJlYWRSZWNlaXB0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHNlbmRSZWFkUmVjZWlwdCA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJsb3dCYW5kd2lkdGhcIikpIHJldHVybjtcblxuICAgICAgICBpZiAoIXRoaXMubWVzc2FnZVBhbmVsLmN1cnJlbnQpIHJldHVybjtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLm1hbmFnZVJlYWRSZWNlaXB0cykgcmV0dXJuO1xuICAgICAgICAvLyBUaGlzIGhhcHBlbnMgb24gdXNlcl9hY3Rpdml0eV9lbmQgd2hpY2ggaXMgZGVsYXllZCwgYW5kIGl0J3NcbiAgICAgICAgLy8gdmVyeSBwb3NzaWJsZSBoYXZlIGxvZ2dlZCBvdXQgd2l0aGluIHRoYXQgdGltZWZyYW1lLCBzbyBjaGVja1xuICAgICAgICAvLyB3ZSBzdGlsbCBoYXZlIGEgY2xpZW50LlxuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIC8vIGlmIG5vIGNsaWVudCBvciBjbGllbnQgaXMgZ3Vlc3QgZG9uJ3Qgc2VuZCBSUiBvciBSTVxuICAgICAgICBpZiAoIWNsaSB8fCBjbGkuaXNHdWVzdCgpKSByZXR1cm47XG5cbiAgICAgICAgbGV0IHNob3VsZFNlbmRSUiA9IHRydWU7XG5cbiAgICAgICAgY29uc3QgY3VycmVudFJSRXZlbnRJZCA9IHRoaXMuZ2V0Q3VycmVudFJlYWRSZWNlaXB0KHRydWUpO1xuICAgICAgICBjb25zdCBjdXJyZW50UlJFdmVudEluZGV4ID0gdGhpcy5pbmRleEZvckV2ZW50SWQoY3VycmVudFJSRXZlbnRJZCk7XG4gICAgICAgIC8vIFdlIHdhbnQgdG8gYXZvaWQgc2VuZGluZyBvdXQgcmVhZCByZWNlaXB0cyB3aGVuIHdlIGFyZSBsb29raW5nIGF0XG4gICAgICAgIC8vIGV2ZW50cyBpbiB0aGUgcGFzdCB3aGljaCBhcmUgYmVmb3JlIHRoZSBsYXRlc3QgUlIuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIEZvciBub3csIGxldCdzIGFwcGx5IGEgaGV1cmlzdGljOiBpZiAoYSkgdGhlIGV2ZW50IGNvcnJlc3BvbmRpbmcgdG9cbiAgICAgICAgLy8gdGhlIGxhdGVzdCBSUiAoZWl0aGVyIGZyb20gdGhlIHNlcnZlciwgb3Igc2VudCBieSBvdXJzZWx2ZXMpIGRvZXNuJ3RcbiAgICAgICAgLy8gYXBwZWFyIGluIG91ciB0aW1lbGluZSwgYW5kIChiKSB3ZSBjb3VsZCBmb3J3YXJkLXBhZ2luYXRlIHRoZSBldmVudFxuICAgICAgICAvLyB0aW1lbGluZSwgdGhlbiBkb24ndCBzZW5kIGFueSBtb3JlIFJScy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gVGhpcyBpc24ndCB3YXRlcnRpZ2h0LCBhcyB3ZSBjb3VsZCBiZSBsb29raW5nIGF0IGEgc2VjdGlvbiBvZlxuICAgICAgICAvLyB0aW1lbGluZSB3aGljaCBpcyAqYWZ0ZXIqIHRoZSBsYXRlc3QgUlIgKHNvIHdlIHNob3VsZCBhY3R1YWxseSBzZW5kXG4gICAgICAgIC8vIFJScykgLSBidXQgdGhhdCBpcyBhIGJpdCBvZiBhIG5pY2hlIGNhc2UuIEl0IHdpbGwgc29ydCBpdHNlbGYgb3V0IHdoZW5cbiAgICAgICAgLy8gdGhlIHVzZXIgZXZlbnR1YWxseSBoaXRzIHRoZSBsaXZlIHRpbWVsaW5lLlxuICAgICAgICAvL1xuICAgICAgICBpZiAoY3VycmVudFJSRXZlbnRJZCAmJiBjdXJyZW50UlJFdmVudEluZGV4ID09PSBudWxsICYmXG4gICAgICAgICAgICAgICAgdGhpcy50aW1lbGluZVdpbmRvdy5jYW5QYWdpbmF0ZShFdmVudFRpbWVsaW5lLkZPUldBUkRTKSkge1xuICAgICAgICAgICAgc2hvdWxkU2VuZFJSID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBsYXN0UmVhZEV2ZW50SW5kZXggPSB0aGlzLmdldExhc3REaXNwbGF5ZWRFdmVudEluZGV4KHtcbiAgICAgICAgICAgIGlnbm9yZU93bjogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChsYXN0UmVhZEV2ZW50SW5kZXggPT09IG51bGwpIHtcbiAgICAgICAgICAgIHNob3VsZFNlbmRSUiA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGxldCBsYXN0UmVhZEV2ZW50ID0gdGhpcy5zdGF0ZS5ldmVudHNbbGFzdFJlYWRFdmVudEluZGV4XTtcbiAgICAgICAgc2hvdWxkU2VuZFJSID0gc2hvdWxkU2VuZFJSICYmXG4gICAgICAgICAgICAvLyBPbmx5IHNlbmQgYSBSUiBpZiB0aGUgbGFzdCByZWFkIGV2ZW50IGlzIGFoZWFkIGluIHRoZSB0aW1lbGluZSByZWxhdGl2ZSB0b1xuICAgICAgICAgICAgLy8gdGhlIGN1cnJlbnQgUlIgZXZlbnQuXG4gICAgICAgICAgICBsYXN0UmVhZEV2ZW50SW5kZXggPiBjdXJyZW50UlJFdmVudEluZGV4ICYmXG4gICAgICAgICAgICAvLyBPbmx5IHNlbmQgYSBSUiBpZiB0aGUgbGFzdCBSUiBzZXQgIT0gdGhlIG9uZSB3ZSB3b3VsZCBzZW5kXG4gICAgICAgICAgICB0aGlzLmxhc3RSUlNlbnRFdmVudElkICE9IGxhc3RSZWFkRXZlbnQuZ2V0SWQoKTtcblxuICAgICAgICAvLyBPbmx5IHNlbmQgYSBSTSBpZiB0aGUgbGFzdCBSTSBzZW50ICE9IHRoZSBvbmUgd2Ugd291bGQgc2VuZFxuICAgICAgICBjb25zdCBzaG91bGRTZW5kUk0gPVxuICAgICAgICAgICAgdGhpcy5sYXN0Uk1TZW50RXZlbnRJZCAhPSB0aGlzLnN0YXRlLnJlYWRNYXJrZXJFdmVudElkO1xuXG4gICAgICAgIC8vIHdlIGFsc28gcmVtZW1iZXIgdGhlIGxhc3QgcmVhZCByZWNlaXB0IHdlIHNlbnQgdG8gYXZvaWQgc3BhbW1pbmcgdGhlXG4gICAgICAgIC8vIHNhbWUgb25lIGF0IHRoZSBzZXJ2ZXIgcmVwZWF0ZWRseVxuICAgICAgICBpZiAoc2hvdWxkU2VuZFJSIHx8IHNob3VsZFNlbmRSTSkge1xuICAgICAgICAgICAgaWYgKHNob3VsZFNlbmRSUikge1xuICAgICAgICAgICAgICAgIHRoaXMubGFzdFJSU2VudEV2ZW50SWQgPSBsYXN0UmVhZEV2ZW50LmdldElkKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxhc3RSZWFkRXZlbnQgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5sYXN0Uk1TZW50RXZlbnRJZCA9IHRoaXMuc3RhdGUucmVhZE1hcmtlckV2ZW50SWQ7XG5cbiAgICAgICAgICAgIGNvbnN0IHJvb21JZCA9IHRoaXMucHJvcHMudGltZWxpbmVTZXQucm9vbS5yb29tSWQ7XG4gICAgICAgICAgICBjb25zdCBzZW5kUlJzID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInNlbmRSZWFkUmVjZWlwdHNcIiwgcm9vbUlkKTtcblxuICAgICAgICAgICAgZGVidWdsb2coXG4gICAgICAgICAgICAgICAgYFNlbmRpbmcgUmVhZCBNYXJrZXJzIGZvciAke3RoaXMucHJvcHMudGltZWxpbmVTZXQucm9vbS5yb29tSWR9OiBgLFxuICAgICAgICAgICAgICAgIGBybT0ke3RoaXMuc3RhdGUucmVhZE1hcmtlckV2ZW50SWR9IGAsXG4gICAgICAgICAgICAgICAgYHJyPSR7c2VuZFJScyA/IGxhc3RSZWFkRXZlbnQ/LmdldElkKCkgOiBudWxsfSBgLFxuICAgICAgICAgICAgICAgIGBwcnI9JHtsYXN0UmVhZEV2ZW50Py5nZXRJZCgpfWAsXG5cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2V0Um9vbVJlYWRNYXJrZXJzKFxuICAgICAgICAgICAgICAgIHJvb21JZCxcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlLnJlYWRNYXJrZXJFdmVudElkLFxuICAgICAgICAgICAgICAgIHNlbmRSUnMgPyBsYXN0UmVhZEV2ZW50IDogbnVsbCwgLy8gUHVibGljIHJlYWQgcmVjZWlwdCAoY291bGQgYmUgbnVsbClcbiAgICAgICAgICAgICAgICBsYXN0UmVhZEV2ZW50LCAvLyBQcml2YXRlIHJlYWQgcmVjZWlwdCAoY291bGQgYmUgbnVsbClcbiAgICAgICAgICAgICkuY2F0Y2goYXN5bmMgKGUpID0+IHtcbiAgICAgICAgICAgICAgICAvLyAvcmVhZF9tYXJrZXJzIEFQSSBpcyBub3QgaW1wbGVtZW50ZWQgb24gdGhpcyBIUywgZmFsbGJhY2sgdG8ganVzdCBSUlxuICAgICAgICAgICAgICAgIGlmIChlLmVycmNvZGUgPT09ICdNX1VOUkVDT0dOSVpFRCcgJiYgbGFzdFJlYWRFdmVudCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcml2YXRlRmllbGQgPSBhd2FpdCBnZXRQcml2YXRlUmVhZFJlY2VpcHRGaWVsZChNYXRyaXhDbGllbnRQZWcuZ2V0KCkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXNlbmRSUnMgJiYgIXByaXZhdGVGaWVsZCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLnNlbmRSZWFkUmVjZWlwdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0UmVhZEV2ZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbmRSUnMgPyBSZWNlaXB0VHlwZS5SZWFkIDogcHJpdmF0ZUZpZWxkLFxuICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdFJSU2VudEV2ZW50SWQgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGl0IGZhaWxlZCwgc28gYWxsb3cgcmV0cmllcyBuZXh0IHRpbWUgdGhlIHVzZXIgaXMgYWN0aXZlXG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0UlJTZW50RXZlbnRJZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RSTVNlbnRFdmVudElkID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGRvIGEgcXVpY2stcmVzZXQgb2Ygb3VyIHVucmVhZE5vdGlmaWNhdGlvbkNvdW50IHRvIGF2b2lkIGhhdmluZ1xuICAgICAgICAgICAgLy8gdG8gd2FpdCBmcm9tIHRoZSByZW1vdGUgZWNobyBmcm9tIHRoZSBob21lc2VydmVyLlxuICAgICAgICAgICAgLy8gd2Ugb25seSBkbyB0aGlzIGlmIHdlJ3JlIHJpZ2h0IGF0IHRoZSBlbmQsIGJlY2F1c2Ugd2UncmUganVzdCBhc3N1bWluZ1xuICAgICAgICAgICAgLy8gdGhhdCBzZW5kaW5nIGFuIFJSIGZvciB0aGUgbGF0ZXN0IG1lc3NhZ2Ugd2lsbCBzZXQgb3VyIG5vdGlmIGNvdW50ZXJcbiAgICAgICAgICAgIC8vIHRvIHplcm86IGl0IG1heSBub3QgZG8gdGhpcyBpZiB3ZSBzZW5kIGFuIFJSIGZvciBzb21ld2hlcmUgYmVmb3JlIHRoZSBlbmQuXG4gICAgICAgICAgICBpZiAodGhpcy5pc0F0RW5kT2ZMaXZlVGltZWxpbmUoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMudGltZWxpbmVTZXQucm9vbS5zZXRVbnJlYWROb3RpZmljYXRpb25Db3VudChOb3RpZmljYXRpb25Db3VudFR5cGUuVG90YWwsIDApO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMudGltZWxpbmVTZXQucm9vbS5zZXRVbnJlYWROb3RpZmljYXRpb25Db3VudChOb3RpZmljYXRpb25Db3VudFR5cGUuSGlnaGxpZ2h0LCAwKTtcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdvbl9yb29tX3JlYWQnLFxuICAgICAgICAgICAgICAgICAgICByb29tSWQ6IHRoaXMucHJvcHMudGltZWxpbmVTZXQucm9vbS5yb29tSWQsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gaWYgdGhlIHJlYWQgbWFya2VyIGlzIG9uIHRoZSBzY3JlZW4sIHdlIGNhbiBub3cgYXNzdW1lIHdlJ3ZlIGNhdWdodCB1cCB0byB0aGUgZW5kXG4gICAgLy8gb2YgdGhlIHNjcmVlbiwgc28gbW92ZSB0aGUgbWFya2VyIGRvd24gdG8gdGhlIGJvdHRvbSBvZiB0aGUgc2NyZWVuLlxuICAgIHByaXZhdGUgdXBkYXRlUmVhZE1hcmtlciA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLm1hbmFnZVJlYWRNYXJrZXJzKSByZXR1cm47XG4gICAgICAgIGlmICh0aGlzLmdldFJlYWRNYXJrZXJQb3NpdGlvbigpID09PSAxKSB7XG4gICAgICAgICAgICAvLyB0aGUgcmVhZCBtYXJrZXIgaXMgYXQgYW4gZXZlbnQgYmVsb3cgdGhlIHZpZXdwb3J0LFxuICAgICAgICAgICAgLy8gd2UgZG9uJ3Qgd2FudCB0byByZXdpbmQgaXQuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gbW92ZSB0aGUgUk0gdG8gKmFmdGVyKiB0aGUgbWVzc2FnZSBhdCB0aGUgYm90dG9tIG9mIHRoZSBzY3JlZW4uIFRoaXNcbiAgICAgICAgLy8gYXZvaWRzIGEgcHJvYmxlbSB3aGVyZWJ5IHdlIG5ldmVyIGFkdmFuY2UgdGhlIFJNIGlmIHRoZXJlIGlzIGEgaHVnZVxuICAgICAgICAvLyBtZXNzYWdlIHdoaWNoIGRvZXNuJ3QgZml0IG9uIHRoZSBzY3JlZW4uXG4gICAgICAgIGNvbnN0IGxhc3REaXNwbGF5ZWRJbmRleCA9IHRoaXMuZ2V0TGFzdERpc3BsYXllZEV2ZW50SW5kZXgoe1xuICAgICAgICAgICAgYWxsb3dQYXJ0aWFsOiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAobGFzdERpc3BsYXllZEluZGV4ID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbGFzdERpc3BsYXllZEV2ZW50ID0gdGhpcy5zdGF0ZS5ldmVudHNbbGFzdERpc3BsYXllZEluZGV4XTtcbiAgICAgICAgdGhpcy5zZXRSZWFkTWFya2VyKFxuICAgICAgICAgICAgbGFzdERpc3BsYXllZEV2ZW50LmdldElkKCksXG4gICAgICAgICAgICBsYXN0RGlzcGxheWVkRXZlbnQuZ2V0VHMoKSxcbiAgICAgICAgKTtcblxuICAgICAgICAvLyB0aGUgcmVhZC1tYXJrZXIgc2hvdWxkIGJlY29tZSBpbnZpc2libGUsIHNvIHRoYXQgaWYgdGhlIHVzZXIgc2Nyb2xsc1xuICAgICAgICAvLyBkb3duLCB0aGV5IGRvbid0IHNlZSBpdC5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucmVhZE1hcmtlclZpc2libGUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIHJlYWRNYXJrZXJWaXNpYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2VuZCB0aGUgdXBkYXRlZCByZWFkIG1hcmtlciAoYWxvbmcgd2l0aCByZWFkIHJlY2VpcHQpIHRvIHRoZSBzZXJ2ZXJcbiAgICAgICAgdGhpcy5zZW5kUmVhZFJlY2VpcHQoKTtcbiAgICB9O1xuXG4gICAgLy8gYWR2YW5jZSB0aGUgcmVhZCBtYXJrZXIgcGFzdCBhbnkgZXZlbnRzIHdlIHNlbnQgb3Vyc2VsdmVzLlxuICAgIHByaXZhdGUgYWR2YW5jZVJlYWRNYXJrZXJQYXN0TXlFdmVudHMoKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5tYW5hZ2VSZWFkTWFya2VycykgcmV0dXJuO1xuXG4gICAgICAgIC8vIHdlIGNhbGwgYHRpbWVsaW5lV2luZG93LmdldEV2ZW50cygpYCByYXRoZXIgdGhhbiB1c2luZ1xuICAgICAgICAvLyBgdGhpcy5zdGF0ZS5saXZlRXZlbnRzYCwgYmVjYXVzZSBSZWFjdCBiYXRjaGVzIHRoZSB1cGRhdGUgdG8gdGhlXG4gICAgICAgIC8vIGxhdHRlciwgc28gaXQgbWF5IG5vdCBoYXZlIGJlZW4gdXBkYXRlZCB5ZXQuXG4gICAgICAgIGNvbnN0IGV2ZW50cyA9IHRoaXMudGltZWxpbmVXaW5kb3cuZ2V0RXZlbnRzKCk7XG5cbiAgICAgICAgLy8gZmlyc3QgZmluZCB3aGVyZSB0aGUgY3VycmVudCBSTSBpc1xuICAgICAgICBsZXQgaTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGV2ZW50c1tpXS5nZXRJZCgpID09IHRoaXMuc3RhdGUucmVhZE1hcmtlckV2ZW50SWQpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoaSA+PSBldmVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBub3cgdGhpbmsgYWJvdXQgYWR2YW5jaW5nIGl0XG4gICAgICAgIGNvbnN0IG15VXNlcklkID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmNyZWRlbnRpYWxzLnVzZXJJZDtcbiAgICAgICAgZm9yIChpKys7IGkgPCBldmVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGV2ID0gZXZlbnRzW2ldO1xuICAgICAgICAgICAgaWYgKGV2LmdldFNlbmRlcigpICE9PSBteVVzZXJJZCkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIGkgaXMgbm93IHRoZSBmaXJzdCB1bnJlYWQgbWVzc2FnZSB3aGljaCB3ZSBkaWRuJ3Qgc2VuZCBvdXJzZWx2ZXMuXG4gICAgICAgIGktLTtcblxuICAgICAgICBjb25zdCBldiA9IGV2ZW50c1tpXTtcbiAgICAgICAgdGhpcy5zZXRSZWFkTWFya2VyKGV2LmdldElkKCksIGV2LmdldFRzKCkpO1xuICAgIH1cblxuICAgIC8qIGp1bXAgZG93biB0byB0aGUgYm90dG9tIG9mIHRoaXMgcm9vbSwgd2hlcmUgbmV3IGV2ZW50cyBhcmUgYXJyaXZpbmdcbiAgICAgKi9cbiAgICBwdWJsaWMganVtcFRvTGl2ZVRpbWVsaW5lID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICAvLyBpZiB3ZSBjYW4ndCBmb3J3YXJkLXBhZ2luYXRlIHRoZSBleGlzdGluZyB0aW1lbGluZSwgdGhlbiB0aGVyZVxuICAgICAgICAvLyBpcyBubyBwb2ludCByZWxvYWRpbmcgaXQgLSBqdXN0IGp1bXAgc3RyYWlnaHQgdG8gdGhlIGJvdHRvbS5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCByZWxvYWQgdGhlIHRpbWVsaW5lIHJhdGhlciB0aGFuIHRyeWluZyB0byBwYWdpbmF0ZVxuICAgICAgICAvLyB0aHJvdWdoIGFsbCBvZiBzcGFjZS10aW1lLlxuICAgICAgICBpZiAodGhpcy50aW1lbGluZVdpbmRvdy5jYW5QYWdpbmF0ZShFdmVudFRpbWVsaW5lLkZPUldBUkRTKSkge1xuICAgICAgICAgICAgdGhpcy5sb2FkVGltZWxpbmUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZVBhbmVsLmN1cnJlbnQ/LnNjcm9sbFRvQm90dG9tKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHVibGljIHNjcm9sbFRvRXZlbnRJZk5lZWRlZCA9IChldmVudElkOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5tZXNzYWdlUGFuZWwuY3VycmVudD8uc2Nyb2xsVG9FdmVudElmTmVlZGVkKGV2ZW50SWQpO1xuICAgIH07XG5cbiAgICAvKiBzY3JvbGwgdG8gc2hvdyB0aGUgcmVhZC11cC10byBtYXJrZXIuIFdlIHB1dCBpdCAxLzMgb2YgdGhlIHdheSBkb3duXG4gICAgICogdGhlIGNvbnRhaW5lci5cbiAgICAgKi9cbiAgICBwdWJsaWMganVtcFRvUmVhZE1hcmtlciA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLm1hbmFnZVJlYWRNYXJrZXJzKSByZXR1cm47XG4gICAgICAgIGlmICghdGhpcy5tZXNzYWdlUGFuZWwuY3VycmVudCkgcmV0dXJuO1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUucmVhZE1hcmtlckV2ZW50SWQpIHJldHVybjtcblxuICAgICAgICAvLyB3ZSBtYXkgbm90IGhhdmUgbG9hZGVkIHRoZSBldmVudCBjb3JyZXNwb25kaW5nIHRvIHRoZSByZWFkLW1hcmtlclxuICAgICAgICAvLyBpbnRvIHRoZSB0aW1lbGluZVdpbmRvdy4gSW4gdGhhdCBjYXNlLCBhdHRlbXB0cyB0byBzY3JvbGwgdG8gaXRcbiAgICAgICAgLy8gd2lsbCBmYWlsLlxuICAgICAgICAvL1xuICAgICAgICAvLyBhIHF1aWNrIHdheSB0byBmaWd1cmUgb3V0IGlmIHdlJ3ZlIGxvYWRlZCB0aGUgcmVsZXZhbnQgZXZlbnQgaXNcbiAgICAgICAgLy8gc2ltcGx5IHRvIGNoZWNrIGlmIHRoZSBtZXNzYWdlcGFuZWwga25vd3Mgd2hlcmUgdGhlIHJlYWQtbWFya2VyIGlzLlxuICAgICAgICBjb25zdCByZXQgPSB0aGlzLm1lc3NhZ2VQYW5lbC5jdXJyZW50LmdldFJlYWRNYXJrZXJQb3NpdGlvbigpO1xuICAgICAgICBpZiAocmV0ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAvLyBUaGUgbWVzc2FnZXBhbmVsIGtub3dzIHdoZXJlIHRoZSBSTSBpcywgc28gd2UgbXVzdCBoYXZlIGxvYWRlZFxuICAgICAgICAgICAgLy8gdGhlIHJlbGV2YW50IGV2ZW50LlxuICAgICAgICAgICAgdGhpcy5tZXNzYWdlUGFuZWwuY3VycmVudC5zY3JvbGxUb0V2ZW50KHRoaXMuc3RhdGUucmVhZE1hcmtlckV2ZW50SWQsXG4gICAgICAgICAgICAgICAgMCwgMS8zKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIExvb2tzIGxpa2Ugd2UgaGF2ZW4ndCBsb2FkZWQgdGhlIGV2ZW50IGNvcnJlc3BvbmRpbmcgdG8gdGhlIHJlYWQtbWFya2VyLlxuICAgICAgICAvLyBBcyB3aXRoIGp1bXBUb0xpdmVUaW1lbGluZSwgd2Ugd2FudCB0byByZWxvYWQgdGhlIHRpbWVsaW5lIGFyb3VuZCB0aGVcbiAgICAgICAgLy8gcmVhZC1tYXJrZXIuXG4gICAgICAgIHRoaXMubG9hZFRpbWVsaW5lKHRoaXMuc3RhdGUucmVhZE1hcmtlckV2ZW50SWQsIDAsIDEvMyk7XG4gICAgfTtcblxuICAgIC8qIHVwZGF0ZSB0aGUgcmVhZC11cC10byBtYXJrZXIgdG8gbWF0Y2ggdGhlIHJlYWQgcmVjZWlwdFxuICAgICAqL1xuICAgIHB1YmxpYyBmb3JnZXRSZWFkTWFya2VyID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMubWFuYWdlUmVhZE1hcmtlcnMpIHJldHVybjtcblxuICAgICAgICAvLyBGaW5kIHRoZSByZWFkIHJlY2VpcHQgLSB3ZSB3aWxsIHNldCB0aGUgcmVhZCBtYXJrZXIgdG8gdGhpc1xuICAgICAgICBjb25zdCBybUlkID0gdGhpcy5nZXRDdXJyZW50UmVhZFJlY2VpcHQoKTtcblxuICAgICAgICAvLyBMb29rIHVwIHRoZSB0aW1lc3RhbXAgaWYgd2UgY2FuIGZpbmQgaXRcbiAgICAgICAgY29uc3QgdGwgPSB0aGlzLnByb3BzLnRpbWVsaW5lU2V0LmdldFRpbWVsaW5lRm9yRXZlbnQocm1JZCk7XG4gICAgICAgIGxldCBybVRzOiBudW1iZXI7XG4gICAgICAgIGlmICh0bCkge1xuICAgICAgICAgICAgY29uc3QgZXZlbnQgPSB0bC5nZXRFdmVudHMoKS5maW5kKChlKSA9PiB7IHJldHVybiBlLmdldElkKCkgPT0gcm1JZDsgfSk7XG4gICAgICAgICAgICBpZiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBybVRzID0gZXZlbnQuZ2V0VHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgcmVhZCBtYXJrZXIgdG8gdGhlIHZhbHVlcyB3ZSBmb3VuZFxuICAgICAgICB0aGlzLnNldFJlYWRNYXJrZXIocm1JZCwgcm1Ucyk7XG5cbiAgICAgICAgLy8gU2VuZCB0aGUgcmVjZWlwdHMgdG8gdGhlIHNlcnZlciBpbW1lZGlhdGVseSAoZG9uJ3Qgd2FpdCBmb3IgYWN0aXZpdHkpXG4gICAgICAgIHRoaXMuc2VuZFJlYWRSZWNlaXB0KCk7XG4gICAgfTtcblxuICAgIC8qIHJldHVybiB0cnVlIGlmIHRoZSBjb250ZW50IGlzIGZ1bGx5IHNjcm9sbGVkIGRvd24gYW5kIHdlIGFyZVxuICAgICAqIGF0IHRoZSBlbmQgb2YgdGhlIGxpdmUgdGltZWxpbmUuXG4gICAgICovXG4gICAgcHVibGljIGlzQXRFbmRPZkxpdmVUaW1lbGluZSA9ICgpOiBib29sZWFuIHwgdW5kZWZpbmVkID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWVzc2FnZVBhbmVsLmN1cnJlbnQ/LmlzQXRCb3R0b20oKVxuICAgICAgICAgICAgJiYgdGhpcy50aW1lbGluZVdpbmRvd1xuICAgICAgICAgICAgJiYgIXRoaXMudGltZWxpbmVXaW5kb3cuY2FuUGFnaW5hdGUoRXZlbnRUaW1lbGluZS5GT1JXQVJEUyk7XG4gICAgfTtcblxuICAgIC8qIGdldCB0aGUgY3VycmVudCBzY3JvbGwgc3RhdGUuIFNlZSBTY3JvbGxQYW5lbC5nZXRTY3JvbGxTdGF0ZSBmb3JcbiAgICAgKiBkZXRhaWxzLlxuICAgICAqXG4gICAgICogcmV0dXJucyBudWxsIGlmIHdlIGFyZSBub3QgbW91bnRlZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0U2Nyb2xsU3RhdGUgPSAoKTogSVNjcm9sbFN0YXRlID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLm1lc3NhZ2VQYW5lbC5jdXJyZW50KSB7IHJldHVybiBudWxsOyB9XG4gICAgICAgIHJldHVybiB0aGlzLm1lc3NhZ2VQYW5lbC5jdXJyZW50LmdldFNjcm9sbFN0YXRlKCk7XG4gICAgfTtcblxuICAgIC8vIHJldHVybnMgb25lIG9mOlxuICAgIC8vXG4gICAgLy8gIG51bGw6IHRoZXJlIGlzIG5vIHJlYWQgbWFya2VyXG4gICAgLy8gIC0xOiByZWFkIG1hcmtlciBpcyBhYm92ZSB0aGUgd2luZG93XG4gICAgLy8gICAwOiByZWFkIG1hcmtlciBpcyB2aXNpYmxlXG4gICAgLy8gICsxOiByZWFkIG1hcmtlciBpcyBiZWxvdyB0aGUgd2luZG93XG4gICAgcHVibGljIGdldFJlYWRNYXJrZXJQb3NpdGlvbiA9ICgpOiBudW1iZXIgPT4ge1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMubWFuYWdlUmVhZE1hcmtlcnMpIHJldHVybiBudWxsO1xuICAgICAgICBpZiAoIXRoaXMubWVzc2FnZVBhbmVsLmN1cnJlbnQpIHJldHVybiBudWxsO1xuXG4gICAgICAgIGNvbnN0IHJldCA9IHRoaXMubWVzc2FnZVBhbmVsLmN1cnJlbnQuZ2V0UmVhZE1hcmtlclBvc2l0aW9uKCk7XG4gICAgICAgIGlmIChyZXQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0aGUgbWVzc2FnZVBhbmVsIGRvZXNuJ3Qga25vdyB3aGVyZSB0aGUgcmVhZCBtYXJrZXIgaXMuXG4gICAgICAgIC8vIGlmIHdlIGtub3cgdGhlIHRpbWVzdGFtcCBvZiB0aGUgcmVhZCBtYXJrZXIsIG1ha2UgYSBndWVzcyBiYXNlZCBvbiB0aGF0LlxuICAgICAgICBjb25zdCBybVRzID0gVGltZWxpbmVQYW5lbC5yb29tUmVhZE1hcmtlclRzTWFwW3RoaXMucHJvcHMudGltZWxpbmVTZXQucm9vbS5yb29tSWRdO1xuICAgICAgICBpZiAocm1UcyAmJiB0aGlzLnN0YXRlLmV2ZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBpZiAocm1UcyA8IHRoaXMuc3RhdGUuZXZlbnRzWzBdLmdldFRzKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcblxuICAgIHB1YmxpYyBjYW5KdW1wVG9SZWFkTWFya2VyID0gKCk6IGJvb2xlYW4gPT4ge1xuICAgICAgICAvLyAxLiBEbyBub3Qgc2hvdyBqdW1wIGJhciBpZiBuZWl0aGVyIHRoZSBSTSBub3IgdGhlIFJSIGFyZSBzZXQuXG4gICAgICAgIC8vIDMuIFdlIHdhbnQgdG8gc2hvdyB0aGUgYmFyIGlmIHRoZSByZWFkLW1hcmtlciBpcyBvZmYgdGhlIHRvcCBvZiB0aGUgc2NyZWVuLlxuICAgICAgICAvLyA0LiBBbHNvLCBpZiBwb3MgPT09IG51bGwsIHRoZSBldmVudCBtaWdodCBub3QgYmUgcGFnaW5hdGVkIC0gc2hvdyB0aGUgdW5yZWFkIGJhclxuICAgICAgICBjb25zdCBwb3MgPSB0aGlzLmdldFJlYWRNYXJrZXJQb3NpdGlvbigpO1xuICAgICAgICBjb25zdCByZXQgPSB0aGlzLnN0YXRlLnJlYWRNYXJrZXJFdmVudElkICE9PSBudWxsICYmIC8vIDEuXG4gICAgICAgICAgICAocG9zIDwgMCB8fCBwb3MgPT09IG51bGwpOyAvLyAzLiwgNC5cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9O1xuXG4gICAgLypcbiAgICAgKiBjYWxsZWQgYnkgdGhlIHBhcmVudCBjb21wb25lbnQgd2hlbiBQYWdlVXAvRG93bi9ldGMgaXMgcHJlc3NlZC5cbiAgICAgKlxuICAgICAqIFdlIHBhc3MgaXQgZG93biB0byB0aGUgc2Nyb2xsIHBhbmVsLlxuICAgICAqL1xuICAgIHB1YmxpYyBoYW5kbGVTY3JvbGxLZXkgPSBldiA9PiB7XG4gICAgICAgIGlmICghdGhpcy5tZXNzYWdlUGFuZWwuY3VycmVudCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIGp1bXAgdG8gdGhlIGxpdmUgdGltZWxpbmUgb24gY3RybC1lbmQsIHJhdGhlciB0aGFuIHRoZSBlbmQgb2YgdGhlXG4gICAgICAgIC8vIHRpbWVsaW5lIHdpbmRvdy5cbiAgICAgICAgY29uc3QgYWN0aW9uID0gZ2V0S2V5QmluZGluZ3NNYW5hZ2VyKCkuZ2V0Um9vbUFjdGlvbihldik7XG4gICAgICAgIGlmIChhY3Rpb24gPT09IEtleUJpbmRpbmdBY3Rpb24uSnVtcFRvTGF0ZXN0TWVzc2FnZSkge1xuICAgICAgICAgICAgdGhpcy5qdW1wVG9MaXZlVGltZWxpbmUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZVBhbmVsLmN1cnJlbnQuaGFuZGxlU2Nyb2xsS2V5KGV2KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIGluaXRUaW1lbGluZShwcm9wczogSVByb3BzKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGluaXRpYWxFdmVudCA9IHByb3BzLmV2ZW50SWQ7XG4gICAgICAgIGNvbnN0IHBpeGVsT2Zmc2V0ID0gcHJvcHMuZXZlbnRQaXhlbE9mZnNldDtcblxuICAgICAgICAvLyBpZiBhIHBpeGVsT2Zmc2V0IGlzIGdpdmVuLCBpdCBpcyByZWxhdGl2ZSB0byB0aGUgYm90dG9tIG9mIHRoZVxuICAgICAgICAvLyBjb250YWluZXIuIElmIG5vdCwgcHV0IHRoZSBldmVudCBpbiB0aGUgbWlkZGxlIG9mIHRoZSBjb250YWluZXIuXG4gICAgICAgIGxldCBvZmZzZXRCYXNlID0gMTtcbiAgICAgICAgaWYgKHBpeGVsT2Zmc2V0ID09IG51bGwpIHtcbiAgICAgICAgICAgIG9mZnNldEJhc2UgPSAwLjU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5sb2FkVGltZWxpbmUoaW5pdGlhbEV2ZW50LCBwaXhlbE9mZnNldCwgb2Zmc2V0QmFzZSwgcHJvcHMuZXZlbnRTY3JvbGxJbnRvVmlldyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzY3JvbGxJbnRvVmlldyhldmVudElkPzogc3RyaW5nLCBwaXhlbE9mZnNldD86IG51bWJlciwgb2Zmc2V0QmFzZT86IG51bWJlcik6IHZvaWQge1xuICAgICAgICBjb25zdCBkb1Njcm9sbCA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5tZXNzYWdlUGFuZWwuY3VycmVudCkgcmV0dXJuO1xuICAgICAgICAgICAgaWYgKGV2ZW50SWQpIHtcbiAgICAgICAgICAgICAgICBkZWJ1Z2xvZyhcIlRpbWVsaW5lUGFuZWwgc2Nyb2xsaW5nIHRvIGV2ZW50SWQgXCIgKyBldmVudElkICtcbiAgICAgICAgICAgICAgICAgICAgXCIgYXQgcG9zaXRpb24gXCIgKyAob2Zmc2V0QmFzZSAqIDEwMCkgKyBcIiUgKyBcIiArIHBpeGVsT2Zmc2V0KTtcbiAgICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2VQYW5lbC5jdXJyZW50LnNjcm9sbFRvRXZlbnQoXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50SWQsXG4gICAgICAgICAgICAgICAgICAgIHBpeGVsT2Zmc2V0LFxuICAgICAgICAgICAgICAgICAgICBvZmZzZXRCYXNlLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlYnVnbG9nKFwiVGltZWxpbmVQYW5lbCBzY3JvbGxpbmcgdG8gYm90dG9tXCIpO1xuICAgICAgICAgICAgICAgIHRoaXMubWVzc2FnZVBhbmVsLmN1cnJlbnQuc2Nyb2xsVG9Cb3R0b20oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBkZWJ1Z2xvZyhcIlRpbWVsaW5lUGFuZWwgc2NoZWR1bGluZyBzY3JvbGwgdG8gZXZlbnRcIik7XG4gICAgICAgIHRoaXMucHJvcHMub25FdmVudFNjcm9sbGVkSW50b1ZpZXc/LihldmVudElkKTtcbiAgICAgICAgLy8gRW5zdXJlIHRoZSBjb3JyZWN0IHNjcm9sbCBwb3NpdGlvbiBwcmUgcmVuZGVyLCBpZiB0aGUgbWVzc2FnZXMgaGF2ZSBhbHJlYWR5IGJlZW4gbG9hZGVkIHRvIERPTSxcbiAgICAgICAgLy8gdG8gYXZvaWQgaXQganVtcGluZyBhcm91bmRcbiAgICAgICAgZG9TY3JvbGwoKTtcblxuICAgICAgICAvLyBFbnN1cmUgdGhlIGNvcnJlY3Qgc2Nyb2xsIHBvc2l0aW9uIHBvc3QgcmVuZGVyIGZvciBjb3JyZWN0IGJlaGF2aW91ci5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gcmVxdWVzdEFuaW1hdGlvbkZyYW1lIHJ1bnMgb3VyIGNvZGUgaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIERPTSB1cGRhdGUgYnV0IGJlZm9yZSB0aGUgbmV4dCByZXBhaW50LlxuICAgICAgICAvL1xuICAgICAgICAvLyBJZiB0aGUgbWVzc2FnZXMgaGF2ZSBqdXN0IGJlZW4gbG9hZGVkIGZvciB0aGUgZmlyc3QgdGltZSwgdGhpcyBlbnN1cmVzIHdlJ2xsIHJlcGVhdCBzZXR0aW5nIHRoZVxuICAgICAgICAvLyBjb3JyZWN0IHNjcm9sbCBwb3NpdGlvbiBhZnRlciBSZWFjdCBoYXMgcmUtcmVuZGVyZWQgdGhlIFRpbWVsaW5lUGFuZWwgYW5kIE1lc3NhZ2VQYW5lbCBhbmRcbiAgICAgICAgLy8gdXBkYXRlZCB0aGUgRE9NLlxuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAgIGRvU2Nyb2xsKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIChyZSktbG9hZCB0aGUgZXZlbnQgdGltZWxpbmUsIGFuZCBpbml0aWFsaXNlIHRoZSBzY3JvbGwgc3RhdGUsIGNlbnRlcmVkXG4gICAgICogYXJvdW5kIHRoZSBnaXZlbiBldmVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nP30gIGV2ZW50SWQgdGhlIGV2ZW50IHRvIGZvY3VzIG9uLiBJZiB1bmRlZmluZWQsIHdpbGxcbiAgICAgKiAgICBzY3JvbGwgdG8gdGhlIGJvdHRvbSBvZiB0aGUgcm9vbS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyP30gcGl4ZWxPZmZzZXQgICBvZmZzZXQgdG8gcG9zaXRpb24gdGhlIGdpdmVuIGV2ZW50IGF0XG4gICAgICogICAgKHBpeGVscyBmcm9tIHRoZSBvZmZzZXRCYXNlKS4gSWYgb21pdHRlZCwgZGVmYXVsdHMgdG8gMC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyP30gb2Zmc2V0QmFzZSB0aGUgcmVmZXJlbmNlIHBvaW50IGZvciB0aGUgcGl4ZWxPZmZzZXQuIDBcbiAgICAgKiAgICAgbWVhbnMgdGhlIHRvcCBvZiB0aGUgY29udGFpbmVyLCAxIG1lYW5zIHRoZSBib3R0b20sIGFuZCBmcmFjdGlvbmFsXG4gICAgICogICAgIHZhbHVlcyBtZWFuIHNvbWV3aGVyZSBpbiB0aGUgbWlkZGxlLiBJZiBvbWl0dGVkLCBpdCBkZWZhdWx0cyB0byAwLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtib29sZWFuP30gc2Nyb2xsSW50b1ZpZXcgd2hldGhlciB0byBzY3JvbGwgdGhlIGV2ZW50IGludG8gdmlldy5cbiAgICAgKi9cbiAgICBwcml2YXRlIGxvYWRUaW1lbGluZShldmVudElkPzogc3RyaW5nLCBwaXhlbE9mZnNldD86IG51bWJlciwgb2Zmc2V0QmFzZT86IG51bWJlciwgc2Nyb2xsSW50b1ZpZXcgPSB0cnVlKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgdGhpcy50aW1lbGluZVdpbmRvdyA9IG5ldyBUaW1lbGluZVdpbmRvdyhjbGksIHRoaXMucHJvcHMudGltZWxpbmVTZXQsIHsgd2luZG93TGltaXQ6IHRoaXMucHJvcHMudGltZWxpbmVDYXAgfSk7XG5cbiAgICAgICAgY29uc3Qgb25Mb2FkZWQgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHJldHVybjtcblxuICAgICAgICAgICAgLy8gY2xlYXIgdGhlIHRpbWVsaW5lIG1pbi1oZWlnaHQgd2hlbiAocmUpbG9hZGluZyB0aGUgdGltZWxpbmVcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZVBhbmVsLmN1cnJlbnQ/Lm9uVGltZWxpbmVSZXNldCgpO1xuICAgICAgICAgICAgdGhpcy5yZWxvYWRFdmVudHMoKTtcblxuICAgICAgICAgICAgLy8gSWYgd2Ugc3dpdGNoZWQgYXdheSBmcm9tIHRoZSByb29tIHdoaWxlIHRoZXJlIHdlcmUgcGVuZGluZ1xuICAgICAgICAgICAgLy8gb3V0Z29pbmcgZXZlbnRzLCB0aGUgcmVhZC1tYXJrZXIgd2lsbCBiZSBiZWZvcmUgdGhvc2UgZXZlbnRzLlxuICAgICAgICAgICAgLy8gV2UgbmVlZCB0byBza2lwIG92ZXIgYW55IHdoaWNoIGhhdmUgc3Vic2VxdWVudGx5IGJlZW4gc2VudC5cbiAgICAgICAgICAgIHRoaXMuYWR2YW5jZVJlYWRNYXJrZXJQYXN0TXlFdmVudHMoKTtcblxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgY2FuQmFja1BhZ2luYXRlOiB0aGlzLnRpbWVsaW5lV2luZG93LmNhblBhZ2luYXRlKEV2ZW50VGltZWxpbmUuQkFDS1dBUkRTKSxcbiAgICAgICAgICAgICAgICBjYW5Gb3J3YXJkUGFnaW5hdGU6IHRoaXMudGltZWxpbmVXaW5kb3cuY2FuUGFnaW5hdGUoRXZlbnRUaW1lbGluZS5GT1JXQVJEUyksXG4gICAgICAgICAgICAgICAgdGltZWxpbmVMb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBpbml0aWFsaXNlIHRoZSBzY3JvbGwgc3RhdGUgb2YgdGhlIG1lc3NhZ2UgcGFuZWxcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubWVzc2FnZVBhbmVsLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhpcyBzaG91bGRuJ3QgaGFwcGVuIC0gd2Uga25vdyB3ZSdyZSBtb3VudGVkIGJlY2F1c2VcbiAgICAgICAgICAgICAgICAgICAgLy8gd2UncmUgaW4gYSBzZXRTdGF0ZSBjYWxsYmFjaywgYW5kIHdlIGtub3dcbiAgICAgICAgICAgICAgICAgICAgLy8gdGltZWxpbmVMb2FkaW5nIGlzIG5vdyBmYWxzZSwgc28gcmVuZGVyKCkgc2hvdWxkIGhhdmVcbiAgICAgICAgICAgICAgICAgICAgLy8gbW91bnRlZCB0aGUgbWVzc2FnZSBwYW5lbC5cbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmxvZyhcImNhbid0IGluaXRpYWxpc2Ugc2Nyb2xsIHN0YXRlIGJlY2F1c2UgbWVzc2FnZVBhbmVsIGRpZG4ndCBsb2FkXCIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHNjcm9sbEludG9WaWV3KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsSW50b1ZpZXcoZXZlbnRJZCwgcGl4ZWxPZmZzZXQsIG9mZnNldEJhc2UpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLnNlbmRSZWFkUmVjZWlwdE9uTG9hZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbmRSZWFkUmVjZWlwdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IG9uRXJyb3IgPSAoZXJyb3I6IE1hdHJpeEVycm9yKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHJldHVybjtcblxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHRpbWVsaW5lTG9hZGluZzogZmFsc2UgfSk7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoYEVycm9yIGxvYWRpbmcgdGltZWxpbmUgcGFuZWwgYXQgJHt0aGlzLnByb3BzLnRpbWVsaW5lU2V0LnJvb20/LnJvb21JZH0vJHtldmVudElkfTogJHtlcnJvcn1gKTtcblxuICAgICAgICAgICAgbGV0IG9uRmluaXNoZWQ6ICgpID0+IHZvaWQ7XG5cbiAgICAgICAgICAgIC8vIGlmIHdlIHdlcmUgZ2l2ZW4gYW4gZXZlbnQgSUQsIHRoZW4gd2hlbiB0aGUgdXNlciBjbG9zZXMgdGhlXG4gICAgICAgICAgICAvLyBkaWFsb2csIGxldCdzIGp1bXAgdG8gdGhlIGVuZCBvZiB0aGUgdGltZWxpbmUuIElmIHdlIHdlcmVuJ3QsXG4gICAgICAgICAgICAvLyBzb21ldGhpbmcgaGFzIGdvbmUgYmFkbHkgd3JvbmcgYW5kIHJhdGhlciB0aGFuIGNhdXNpbmcgYSBsb29wIG9mXG4gICAgICAgICAgICAvLyB1bmRpc21pc3NhYmxlIGRpYWxvZ3MsIGxldCdzIGp1c3QgZ2l2ZSB1cC5cbiAgICAgICAgICAgIGlmIChldmVudElkKSB7XG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZ28gdmlhIHRoZSBkaXNwYXRjaGVyIHNvIHRoYXQgdGhlIFVSTCBpcyB1cGRhdGVkXG4gICAgICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaDxWaWV3Um9vbVBheWxvYWQ+KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlZpZXdSb29tLFxuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbV9pZDogdGhpcy5wcm9wcy50aW1lbGluZVNldC5yb29tLnJvb21JZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldHJpY3NUcmlnZ2VyOiB1bmRlZmluZWQsIC8vIHJvb20gZG9lc24ndCBjaGFuZ2VcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gICAgICAgICAgICBpZiAoZXJyb3IuZXJyY29kZSA9PSAnTV9GT1JCSURERU4nKSB7XG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb24gPSBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJUcmllZCB0byBsb2FkIGEgc3BlY2lmaWMgcG9pbnQgaW4gdGhpcyByb29tJ3MgdGltZWxpbmUsIGJ1dCB5b3UgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcImRvIG5vdCBoYXZlIHBlcm1pc3Npb24gdG8gdmlldyB0aGUgbWVzc2FnZSBpbiBxdWVzdGlvbi5cIixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbiA9IF90KFxuICAgICAgICAgICAgICAgICAgICBcIlRyaWVkIHRvIGxvYWQgYSBzcGVjaWZpYyBwb2ludCBpbiB0aGlzIHJvb20ncyB0aW1lbGluZSwgYnV0IHdhcyBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwidW5hYmxlIHRvIGZpbmQgaXQuXCIsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiRmFpbGVkIHRvIGxvYWQgdGltZWxpbmUgcG9zaXRpb25cIiksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGlmIHdlIGFscmVhZHkgaGF2ZSB0aGUgZXZlbnQgaW4gcXVlc3Rpb24sIFRpbWVsaW5lV2luZG93LmxvYWRcbiAgICAgICAgLy8gcmV0dXJucyBhIHJlc29sdmVkIHByb21pc2UuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIEluIHRoaXMgc2l0dWF0aW9uLCB3ZSBkb24ndCByZWFsbHkgd2FudCB0byBkZWZlciB0aGUgdXBkYXRlIG9mIHRoZVxuICAgICAgICAvLyBzdGF0ZSB0byB0aGUgbmV4dCBldmVudCBsb29wLCBiZWNhdXNlIGl0IG1ha2VzIHJvb20tc3dpdGNoaW5nIGZlZWxcbiAgICAgICAgLy8gcXVpdGUgc2xvdy4gU28gd2UgZGV0ZWN0IHRoYXQgc2l0dWF0aW9uIGFuZCBzaG9ydGN1dCBzdHJhaWdodCB0b1xuICAgICAgICAvLyBjYWxsaW5nIF9yZWxvYWRFdmVudHMgYW5kIHVwZGF0aW5nIHRoZSBzdGF0ZS5cblxuICAgICAgICBjb25zdCB0aW1lbGluZSA9IHRoaXMucHJvcHMudGltZWxpbmVTZXQuZ2V0VGltZWxpbmVGb3JFdmVudChldmVudElkKTtcbiAgICAgICAgaWYgKHRpbWVsaW5lKSB7XG4gICAgICAgICAgICAvLyBUaGlzIGlzIGEgaG90LXBhdGggb3B0aW1pemF0aW9uIGJ5IHNraXBwaW5nIGEgcHJvbWlzZSB0aWNrXG4gICAgICAgICAgICAvLyBieSByZXBlYXRpbmcgYSBuby1vcCBzeW5jIGJyYW5jaCBpbiBUaW1lbGluZVNldC5nZXRUaW1lbGluZUZvckV2ZW50ICYgTWF0cml4Q2xpZW50LmdldEV2ZW50VGltZWxpbmVcbiAgICAgICAgICAgIHRoaXMudGltZWxpbmVXaW5kb3cubG9hZChldmVudElkLCBJTklUSUFMX1NJWkUpOyAvLyBpbiB0aGlzIGJyYW5jaCB0aGlzIG1ldGhvZCB3aWxsIGhhcHBlbiBpbiBzeW5jIHRpbWVcbiAgICAgICAgICAgIG9uTG9hZGVkKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBwcm9tID0gdGhpcy50aW1lbGluZVdpbmRvdy5sb2FkKGV2ZW50SWQsIElOSVRJQUxfU0laRSk7XG4gICAgICAgICAgICB0aGlzLmJ1aWxkTGVnYWN5Q2FsbEV2ZW50R3JvdXBlcnMoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGV2ZW50czogW10sXG4gICAgICAgICAgICAgICAgbGl2ZUV2ZW50czogW10sXG4gICAgICAgICAgICAgICAgY2FuQmFja1BhZ2luYXRlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjYW5Gb3J3YXJkUGFnaW5hdGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHRpbWVsaW5lTG9hZGluZzogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcHJvbS50aGVuKG9uTG9hZGVkLCBvbkVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGhhbmRsZSB0aGUgY29tcGxldGlvbiBvZiBhIHRpbWVsaW5lIGxvYWQgb3IgbG9jYWxFY2hvVXBkYXRlLCBieVxuICAgIC8vIHJlbG9hZGluZyB0aGUgZXZlbnRzIGZyb20gdGhlIHRpbWVsaW5ld2luZG93IGFuZCBwZW5kaW5nIGV2ZW50IGxpc3QgaW50b1xuICAgIC8vIHRoZSBzdGF0ZS5cbiAgICBwcml2YXRlIHJlbG9hZEV2ZW50cygpOiB2b2lkIHtcbiAgICAgICAgLy8gd2UgbWlnaHQgaGF2ZSBzd2l0Y2hlZCByb29tcyBzaW5jZSB0aGUgbG9hZCBzdGFydGVkIC0ganVzdCBiaW5cbiAgICAgICAgLy8gdGhlIHJlc3VsdHMgaWYgc28uXG4gICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHN0YXRlID0gdGhpcy5nZXRFdmVudHMoKTtcbiAgICAgICAgdGhpcy5idWlsZExlZ2FjeUNhbGxFdmVudEdyb3VwZXJzKHN0YXRlLmV2ZW50cyk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoc3RhdGUpO1xuICAgIH1cblxuICAgIC8vIEZvcmNlIHJlZnJlc2ggdGhlIHRpbWVsaW5lIGJlZm9yZSB0aHJlYWRzIHN1cHBvcnQgcGVuZGluZyBldmVudHNcbiAgICBwdWJsaWMgcmVmcmVzaFRpbWVsaW5lKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmxvYWRUaW1lbGluZSgpO1xuICAgICAgICB0aGlzLnJlbG9hZEV2ZW50cygpO1xuICAgIH1cblxuICAgIC8vIGdldCB0aGUgbGlzdCBvZiBldmVudHMgZnJvbSB0aGUgdGltZWxpbmUgd2luZG93IGFuZCB0aGUgcGVuZGluZyBldmVudCBsaXN0XG4gICAgcHJpdmF0ZSBnZXRFdmVudHMoKTogUGljazxJU3RhdGUsIFwiZXZlbnRzXCIgfCBcImxpdmVFdmVudHNcIiB8IFwiZmlyc3RWaXNpYmxlRXZlbnRJbmRleFwiPiB7XG4gICAgICAgIGNvbnN0IGV2ZW50czogTWF0cml4RXZlbnRbXSA9IHRoaXMudGltZWxpbmVXaW5kb3cuZ2V0RXZlbnRzKCk7XG5cbiAgICAgICAgLy8gYGFycmF5RmFzdENsb25lYCBwZXJmb3JtcyBhIHNoYWxsb3cgY29weSBvZiB0aGUgYXJyYXlcbiAgICAgICAgLy8gd2Ugd2FudCB0aGUgbGFzdCBldmVudCB0byBiZSBkZWNyeXB0ZWQgZmlyc3QgYnV0IGRpc3BsYXllZCBsYXN0XG4gICAgICAgIC8vIGByZXZlcnNlYCBpcyBkZXN0cnVjdGl2ZSBhbmQgdW5mb3J0dW5hdGVseSBtdXRhdGVzIHRoZSBcImV2ZW50c1wiIGFycmF5XG4gICAgICAgIGFycmF5RmFzdENsb25lKGV2ZW50cylcbiAgICAgICAgICAgIC5yZXZlcnNlKClcbiAgICAgICAgICAgIC5mb3JFYWNoKGV2ZW50ID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgICAgICAgICAgY2xpZW50LmRlY3J5cHRFdmVudElmTmVlZGVkKGV2ZW50KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGZpcnN0VmlzaWJsZUV2ZW50SW5kZXggPSB0aGlzLmNoZWNrRm9yUHJlSm9pblVJU0koZXZlbnRzKTtcblxuICAgICAgICAvLyBIb2xkIG9udG8gdGhlIGxpdmUgZXZlbnRzIHNlcGFyYXRlbHkuIFRoZSByZWFkIHJlY2VpcHQgYW5kIHJlYWQgbWFya2VyXG4gICAgICAgIC8vIHNob3VsZCB1c2UgdGhpcyBsaXN0LCBzbyB0aGF0IHRoZXkgZG9uJ3QgYWR2YW5jZSBpbnRvIHBlbmRpbmcgZXZlbnRzLlxuICAgICAgICBjb25zdCBsaXZlRXZlbnRzID0gWy4uLmV2ZW50c107XG5cbiAgICAgICAgLy8gaWYgd2UncmUgYXQgdGhlIGVuZCBvZiB0aGUgbGl2ZSB0aW1lbGluZSwgYXBwZW5kIHRoZSBwZW5kaW5nIGV2ZW50c1xuICAgICAgICBpZiAoIXRoaXMudGltZWxpbmVXaW5kb3cuY2FuUGFnaW5hdGUoRXZlbnRUaW1lbGluZS5GT1JXQVJEUykpIHtcbiAgICAgICAgICAgIGNvbnN0IHBlbmRpbmdFdmVudHMgPSB0aGlzLnByb3BzLnRpbWVsaW5lU2V0LmdldFBlbmRpbmdFdmVudHMoKTtcbiAgICAgICAgICAgIGV2ZW50cy5wdXNoKC4uLnBlbmRpbmdFdmVudHMuZmlsdGVyKGV2ZW50ID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICAgICAgICAgIHNob3VsZExpdmVJblJvb20sXG4gICAgICAgICAgICAgICAgICAgIHRocmVhZElkLFxuICAgICAgICAgICAgICAgIH0gPSB0aGlzLnByb3BzLnRpbWVsaW5lU2V0LnJvb20uZXZlbnRTaG91bGRMaXZlSW4oZXZlbnQsIHBlbmRpbmdFdmVudHMpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29udGV4dC50aW1lbGluZVJlbmRlcmluZ1R5cGUgPT09IFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5UaHJlYWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRocmVhZElkID09PSB0aGlzLmNvbnRleHQudGhyZWFkSWQ7XG4gICAgICAgICAgICAgICAgfSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzaG91bGRMaXZlSW5Sb29tO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBldmVudHMsXG4gICAgICAgICAgICBsaXZlRXZlbnRzLFxuICAgICAgICAgICAgZmlyc3RWaXNpYmxlRXZlbnRJbmRleCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBmb3IgdW5kZWNyeXB0YWJsZSBtZXNzYWdlcyB0aGF0IHdlcmUgc2VudCB3aGlsZSB0aGUgdXNlciB3YXMgbm90IGluXG4gICAgICogdGhlIHJvb20uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0FycmF5PE1hdHJpeEV2ZW50Pn0gZXZlbnRzIFRoZSB0aW1lbGluZSBldmVudHMgdG8gY2hlY2tcbiAgICAgKlxuICAgICAqIEByZXR1cm4ge051bWJlcn0gVGhlIGluZGV4IHdpdGhpbiBgZXZlbnRzYCBvZiB0aGUgZXZlbnQgYWZ0ZXIgdGhlIG1vc3QgcmVjZW50XG4gICAgICogdW5kZWNyeXB0YWJsZSBldmVudCB0aGF0IHdhcyBzZW50IHdoaWxlIHRoZSB1c2VyIHdhcyBub3QgaW4gdGhlIHJvb20uICBJZiBub1xuICAgICAqIHN1Y2ggZXZlbnRzIHdlcmUgZm91bmQsIHRoZW4gaXQgcmV0dXJucyAwLlxuICAgICAqL1xuICAgIHByaXZhdGUgY2hlY2tGb3JQcmVKb2luVUlTSShldmVudHM6IE1hdHJpeEV2ZW50W10pOiBudW1iZXIge1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHJvb20gPSB0aGlzLnByb3BzLnRpbWVsaW5lU2V0LnJvb207XG5cbiAgICAgICAgY29uc3QgaXNUaHJlYWRUaW1lbGluZSA9IFtUaW1lbGluZVJlbmRlcmluZ1R5cGUuVGhyZWFkLCBUaW1lbGluZVJlbmRlcmluZ1R5cGUuVGhyZWFkc0xpc3RdXG4gICAgICAgICAgICAuaW5jbHVkZXModGhpcy5jb250ZXh0LnRpbWVsaW5lUmVuZGVyaW5nVHlwZSk7XG4gICAgICAgIGlmIChldmVudHMubGVuZ3RoID09PSAwIHx8ICFyb29tIHx8ICFjbGkuaXNSb29tRW5jcnlwdGVkKHJvb20ucm9vbUlkKSB8fCBpc1RocmVhZFRpbWVsaW5lKSB7XG4gICAgICAgICAgICBsb2dnZXIuaW5mbyhcImNoZWNrRm9yUHJlSm9pblVJU0k6IHNob3dpbmcgYWxsIG1lc3NhZ2VzLCBza2lwcGluZyBjaGVja1wiKTtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdXNlcklkID0gY2xpLmNyZWRlbnRpYWxzLnVzZXJJZDtcblxuICAgICAgICAvLyBnZXQgdGhlIHVzZXIncyBtZW1iZXJzaGlwIGF0IHRoZSBsYXN0IGV2ZW50IGJ5IGdldHRpbmcgdGhlIHRpbWVsaW5lXG4gICAgICAgIC8vIHRoYXQgdGhlIGV2ZW50IGJlbG9uZ3MgdG8sIGFuZCB0cmF2ZXJzaW5nIHRoZSB0aW1lbGluZSBsb29raW5nIGZvclxuICAgICAgICAvLyB0aGF0IGV2ZW50LCB3aGlsZSBrZWVwaW5nIHRyYWNrIG9mIHRoZSB1c2VyJ3MgbWVtYmVyc2hpcFxuICAgICAgICBsZXQgaSA9IGV2ZW50cy5sZW5ndGggLSAxO1xuICAgICAgICBsZXQgdXNlck1lbWJlcnNoaXAgPSBcImxlYXZlXCI7XG4gICAgICAgIGZvciAoOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgY29uc3QgdGltZWxpbmUgPSByb29tLmdldFRpbWVsaW5lRm9yRXZlbnQoZXZlbnRzW2ldLmdldElkKCkpO1xuICAgICAgICAgICAgaWYgKCF0aW1lbGluZSkge1xuICAgICAgICAgICAgICAgIC8vIFNvbWVob3csIGl0IHNlZW1zIHRvIGJlIHBvc3NpYmxlIGZvciBsaXZlIGV2ZW50cyB0byBub3QgaGF2ZVxuICAgICAgICAgICAgICAgIC8vIGEgdGltZWxpbmUsIGV2ZW4gdGhvdWdoIHRoYXQgc2hvdWxkIG5vdCBoYXBwZW4uIDooXG4gICAgICAgICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTIxMjBcbiAgICAgICAgICAgICAgICBsb2dnZXIud2FybihcbiAgICAgICAgICAgICAgICAgICAgYEV2ZW50ICR7ZXZlbnRzW2ldLmdldElkKCl9IGluIHJvb20gJHtyb29tLnJvb21JZH0gaXMgbGl2ZSwgYCArXG4gICAgICAgICAgICAgICAgICAgIGBidXQgaXQgZG9lcyBub3QgaGF2ZSBhIHRpbWVsaW5lYCxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB1c2VyTWVtYmVyc2hpcCA9IHRpbWVsaW5lLmdldFN0YXRlKEV2ZW50VGltZWxpbmUuRk9SV0FSRFMpLmdldE1lbWJlcih1c2VySWQpPy5tZW1iZXJzaGlwID8/IFwibGVhdmVcIjtcbiAgICAgICAgICAgIGNvbnN0IHRpbWVsaW5lRXZlbnRzID0gdGltZWxpbmUuZ2V0RXZlbnRzKCk7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gdGltZWxpbmVFdmVudHMubGVuZ3RoIC0gMTsgaiA+PSAwOyBqLS0pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBldmVudCA9IHRpbWVsaW5lRXZlbnRzW2pdO1xuICAgICAgICAgICAgICAgIGlmIChldmVudC5nZXRJZCgpID09PSBldmVudHNbaV0uZ2V0SWQoKSkge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmdldFN0YXRlS2V5KCkgPT09IHVzZXJJZCAmJiBldmVudC5nZXRUeXBlKCkgPT09IEV2ZW50VHlwZS5Sb29tTWVtYmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHVzZXJNZW1iZXJzaGlwID0gZXZlbnQuZ2V0UHJldkNvbnRlbnQoKS5tZW1iZXJzaGlwIHx8IFwibGVhdmVcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG5vdyBnbyB0aHJvdWdoIHRoZSByZXN0IG9mIHRoZSBldmVudHMgYW5kIGZpbmQgdGhlIGZpcnN0IHVuZGVjcnlwdGFibGVcbiAgICAgICAgLy8gb25lIHRoYXQgd2FzIHNlbnQgd2hlbiB0aGUgdXNlciB3YXNuJ3QgaW4gdGhlIHJvb21cbiAgICAgICAgZm9yICg7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBjb25zdCBldmVudCA9IGV2ZW50c1tpXTtcbiAgICAgICAgICAgIGlmIChldmVudC5nZXRTdGF0ZUtleSgpID09PSB1c2VySWQgJiYgZXZlbnQuZ2V0VHlwZSgpID09PSBFdmVudFR5cGUuUm9vbU1lbWJlcikge1xuICAgICAgICAgICAgICAgIHVzZXJNZW1iZXJzaGlwID0gZXZlbnQuZ2V0UHJldkNvbnRlbnQoKS5tZW1iZXJzaGlwIHx8IFwibGVhdmVcIjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodXNlck1lbWJlcnNoaXAgPT09IFwibGVhdmVcIiAmJiAoZXZlbnQuaXNEZWNyeXB0aW9uRmFpbHVyZSgpIHx8IGV2ZW50LmlzQmVpbmdEZWNyeXB0ZWQoKSkpIHtcbiAgICAgICAgICAgICAgICAvLyByZWFjaGVkIGFuIHVuZGVjcnlwdGFibGUgbWVzc2FnZSB3aGVuIHRoZSB1c2VyIHdhc24ndCBpbiB0aGUgcm9vbSAtLSBkb24ndCB0cnkgdG8gbG9hZCBhbnkgbW9yZVxuICAgICAgICAgICAgICAgIC8vIE5vdGU6IGZvciBub3csIHdlIGFzc3VtZSB0aGF0IGV2ZW50cyB0aGF0IGFyZSBiZWluZyBkZWNyeXB0ZWQgYXJlXG4gICAgICAgICAgICAgICAgLy8gbm90IGRlY3J5cHRhYmxlIC0gd2Ugd2lsbCBiZSBjYWxsZWQgb25jZSBtb3JlIHdoZW4gaXQgaXMgZGVjcnlwdGVkLlxuICAgICAgICAgICAgICAgIGxvZ2dlci5pbmZvKFwiY2hlY2tGb3JQcmVKb2luVUlTSTogcmVhY2hlZCBhIHByZS1qb2luIFVJU0kgYXQgaW5kZXggXCIsIGkpO1xuICAgICAgICAgICAgICAgIHJldHVybiBpICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxvZ2dlci5pbmZvKFwiY2hlY2tGb3JQcmVKb2luVUlTSTogZGlkIG5vdCBmaW5kIHByZS1qb2luIFVJU0lcIik7XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cblxuICAgIHByaXZhdGUgaW5kZXhGb3JFdmVudElkKGV2SWQ6IHN0cmluZyk6IG51bWJlciB8IG51bGwge1xuICAgICAgICAvKiBUaHJlYWRzIGRvIG5vdCBoYXZlIHNlcnZlciBzaWRlIHN1cHBvcnQgZm9yIHJlYWQgcmVjZWlwdHMgYW5kIHRoZSBjb25jZXB0XG4gICAgICAgIGlzIHZlcnkgdGllZCB0byB0aGUgbWFpbiByb29tIHRpbWVsaW5lLCB3ZSBhcmUgZm9yY2luZyB0aGUgdGltZWxpbmUgdG9cbiAgICAgICAgc2VuZCByZWFkIHJlY2VpcHRzIGZvciB0aHJlYWRlZCBldmVudHMgKi9cbiAgICAgICAgY29uc3QgaXNUaHJlYWRUaW1lbGluZSA9IHRoaXMuY29udGV4dC50aW1lbGluZVJlbmRlcmluZ1R5cGUgPT09IFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5UaHJlYWQ7XG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV90aHJlYWRcIikgJiYgaXNUaHJlYWRUaW1lbGluZSkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLnN0YXRlLmV2ZW50cy5maW5kSW5kZXgoZXYgPT4gZXYuZ2V0SWQoKSA9PT0gZXZJZCk7XG4gICAgICAgIHJldHVybiBpbmRleCA+IC0xXG4gICAgICAgICAgICA/IGluZGV4XG4gICAgICAgICAgICA6IG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRMYXN0RGlzcGxheWVkRXZlbnRJbmRleChvcHRzOiBJRXZlbnRJbmRleE9wdHMgPSB7fSk6IG51bWJlciB8IG51bGwge1xuICAgICAgICBjb25zdCBpZ25vcmVPd24gPSBvcHRzLmlnbm9yZU93biB8fCBmYWxzZTtcbiAgICAgICAgY29uc3QgYWxsb3dQYXJ0aWFsID0gb3B0cy5hbGxvd1BhcnRpYWwgfHwgZmFsc2U7XG5cbiAgICAgICAgY29uc3QgbWVzc2FnZVBhbmVsID0gdGhpcy5tZXNzYWdlUGFuZWwuY3VycmVudDtcbiAgICAgICAgaWYgKCFtZXNzYWdlUGFuZWwpIHJldHVybiBudWxsO1xuXG4gICAgICAgIGNvbnN0IG1lc3NhZ2VQYW5lbE5vZGUgPSBSZWFjdERPTS5maW5kRE9NTm9kZShtZXNzYWdlUGFuZWwpIGFzIEVsZW1lbnQ7XG4gICAgICAgIGlmICghbWVzc2FnZVBhbmVsTm9kZSkgcmV0dXJuIG51bGw7IC8vIHNvbWV0aW1lcyB0aGlzIGhhcHBlbnMgZm9yIGZyZXNoIHJvb21zL3Bvc3Qtc3luY1xuICAgICAgICBjb25zdCB3cmFwcGVyUmVjdCA9IG1lc3NhZ2VQYW5lbE5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IG15VXNlcklkID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmNyZWRlbnRpYWxzLnVzZXJJZDtcblxuICAgICAgICBjb25zdCBpc05vZGVJblZpZXcgPSAobm9kZSkgPT4ge1xuICAgICAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBib3VuZGluZ1JlY3QgPSBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICAgKGFsbG93UGFydGlhbCAmJiBib3VuZGluZ1JlY3QudG9wIDw9IHdyYXBwZXJSZWN0LmJvdHRvbSkgfHxcbiAgICAgICAgICAgICAgICAgICAgKCFhbGxvd1BhcnRpYWwgJiYgYm91bmRpbmdSZWN0LmJvdHRvbSA8PSB3cmFwcGVyUmVjdC5ib3R0b20pXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBXZSBrZWVwIHRyYWNrIG9mIGhvdyBtYW55IG9mIHRoZSBhZGphY2VudCBldmVudHMgZGlkbid0IGhhdmUgYSB0aWxlXG4gICAgICAgIC8vIGJ1dCBzaG91bGQgaGF2ZSB0aGUgcmVhZCByZWNlaXB0IG1vdmVkIHBhc3QgdGhlbSwgc29cbiAgICAgICAgLy8gd2UgY2FuIGluY2x1ZGUgdGhvc2Ugb25jZSB3ZSBmaW5kIHRoZSBsYXN0IGRpc3BsYXllZCAodmlzaWJsZSkgZXZlbnQuXG4gICAgICAgIC8vIFRoZSBjb3VudGVyIGlzIG5vdCBzdGFydGVkIGZvciBldmVudHMgd2UgZG9uJ3Qgd2FudFxuICAgICAgICAvLyB0byBzZW5kIGEgcmVhZCByZWNlaXB0IGZvciAob3VyIG93biBldmVudHMsIGxvY2FsIGVjaG9zKS5cbiAgICAgICAgbGV0IGFkamFjZW50SW52aXNpYmxlRXZlbnRDb3VudCA9IDA7XG4gICAgICAgIC8vIFVzZSBgbGl2ZUV2ZW50c2AgaGVyZSBiZWNhdXNlIHdlIGRvbid0IHdhbnQgdGhlIHJlYWQgbWFya2VyIG9yIHJlYWRcbiAgICAgICAgLy8gcmVjZWlwdCB0byBhZHZhbmNlIGludG8gcGVuZGluZyBldmVudHMuXG4gICAgICAgIGZvciAobGV0IGkgPSB0aGlzLnN0YXRlLmxpdmVFdmVudHMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgICAgIGNvbnN0IGV2ID0gdGhpcy5zdGF0ZS5saXZlRXZlbnRzW2ldO1xuXG4gICAgICAgICAgICBjb25zdCBub2RlID0gbWVzc2FnZVBhbmVsLmdldE5vZGVGb3JFdmVudElkKGV2LmdldElkKCkpO1xuICAgICAgICAgICAgY29uc3QgaXNJblZpZXcgPSBpc05vZGVJblZpZXcobm9kZSk7XG5cbiAgICAgICAgICAgIC8vIHdoZW4gd2UndmUgcmVhY2hlZCB0aGUgZmlyc3QgdmlzaWJsZSBldmVudCwgYW5kIHRoZSBwcmV2aW91c1xuICAgICAgICAgICAgLy8gZXZlbnRzIHdlcmUgYWxsIGludmlzaWJsZSAod2l0aCB0aGUgZmlyc3Qgb25lIG5vdCBiZWluZyBpZ25vcmVkKSxcbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgaW5kZXggb2YgdGhlIGZpcnN0IGludmlzaWJsZSBldmVudC5cbiAgICAgICAgICAgIGlmIChpc0luVmlldyAmJiBhZGphY2VudEludmlzaWJsZUV2ZW50Q291bnQgIT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaSArIGFkamFjZW50SW52aXNpYmxlRXZlbnRDb3VudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChub2RlICYmICFpc0luVmlldykge1xuICAgICAgICAgICAgICAgIC8vIGhhcyBub2RlIGJ1dCBub3QgaW4gdmlldywgc28gcmVzZXQgYWRqYWNlbnQgaW52aXNpYmxlIGV2ZW50c1xuICAgICAgICAgICAgICAgIGFkamFjZW50SW52aXNpYmxlRXZlbnRDb3VudCA9IDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHNob3VsZElnbm9yZSA9ICEhZXYuc3RhdHVzIHx8IC8vIGxvY2FsIGVjaG9cbiAgICAgICAgICAgICAgICAoaWdub3JlT3duICYmIGV2LmdldFNlbmRlcigpID09PSBteVVzZXJJZCk7IC8vIG93biBtZXNzYWdlXG4gICAgICAgICAgICBjb25zdCBpc1dpdGhvdXRUaWxlID0gIWhhdmVSZW5kZXJlckZvckV2ZW50KGV2LCB0aGlzLmNvbnRleHQ/LnNob3dIaWRkZW5FdmVudHMpIHx8XG4gICAgICAgICAgICAgICAgc2hvdWxkSGlkZUV2ZW50KGV2LCB0aGlzLmNvbnRleHQpO1xuXG4gICAgICAgICAgICBpZiAoaXNXaXRob3V0VGlsZSB8fCAhbm9kZSkge1xuICAgICAgICAgICAgICAgIC8vIGRvbid0IHN0YXJ0IGNvdW50aW5nIGlmIHRoZSBldmVudCBzaG91bGQgYmUgaWdub3JlZCxcbiAgICAgICAgICAgICAgICAvLyBidXQgY29udGludWUgY291bnRpbmcgaWYgd2Ugd2VyZSBhbHJlYWR5IHNvIHRoZSBvZmZzZXRcbiAgICAgICAgICAgICAgICAvLyB0byB0aGUgcHJldmlvdXMgaW52aXNibGUgZXZlbnQgdGhhdCBkaWRuJ3QgbmVlZCB0byBiZSBpZ25vcmVkXG4gICAgICAgICAgICAgICAgLy8gZG9lc24ndCBnZXQgbWVzc2VkIHVwXG4gICAgICAgICAgICAgICAgaWYgKCFzaG91bGRJZ25vcmUgfHwgKHNob3VsZElnbm9yZSAmJiBhZGphY2VudEludmlzaWJsZUV2ZW50Q291bnQgIT09IDApKSB7XG4gICAgICAgICAgICAgICAgICAgICsrYWRqYWNlbnRJbnZpc2libGVFdmVudENvdW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHNob3VsZElnbm9yZSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaXNJblZpZXcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgaWQgb2YgdGhlIGV2ZW50IGNvcnJlc3BvbmRpbmcgdG8gb3VyIHVzZXIncyBsYXRlc3QgcmVhZC1yZWNlaXB0LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtCb29sZWFufSBpZ25vcmVTeW50aGVzaXplZCBJZiB0cnVlLCByZXR1cm4gb25seSByZWNlaXB0cyB0aGF0XG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXZlIGJlZW4gc2VudCBieSB0aGUgc2VydmVyLCBub3RcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltcGxpY2l0IG9uZXMgZ2VuZXJhdGVkIGJ5IHRoZSBKU1xuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU0RLLlxuICAgICAqIEByZXR1cm4ge1N0cmluZ30gdGhlIGV2ZW50IElEXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRDdXJyZW50UmVhZFJlY2VpcHQoaWdub3JlU3ludGhlc2l6ZWQgPSBmYWxzZSk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgLy8gdGhlIGNsaWVudCBjYW4gYmUgbnVsbCBvbiBsb2dvdXRcbiAgICAgICAgaWYgKGNsaWVudCA9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG15VXNlcklkID0gY2xpZW50LmNyZWRlbnRpYWxzLnVzZXJJZDtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMudGltZWxpbmVTZXQucm9vbS5nZXRFdmVudFJlYWRVcFRvKG15VXNlcklkLCBpZ25vcmVTeW50aGVzaXplZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXRSZWFkTWFya2VyKGV2ZW50SWQ6IHN0cmluZywgZXZlbnRUczogbnVtYmVyLCBpbmhpYml0U2V0U3RhdGUgPSBmYWxzZSk6IHZvaWQge1xuICAgICAgICBjb25zdCByb29tSWQgPSB0aGlzLnByb3BzLnRpbWVsaW5lU2V0LnJvb20ucm9vbUlkO1xuXG4gICAgICAgIC8vIGRvbid0IHVwZGF0ZSB0aGUgc3RhdGUgKGFuZCBjYXVzZSBhIHJlLXJlbmRlcikgaWYgdGhlcmUgaXNcbiAgICAgICAgLy8gbm8gY2hhbmdlIHRvIHRoZSBSTS5cbiAgICAgICAgaWYgKGV2ZW50SWQgPT09IHRoaXMuc3RhdGUucmVhZE1hcmtlckV2ZW50SWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGluIG9yZGVyIHRvIGxhdGVyIGZpZ3VyZSBvdXQgaWYgdGhlIHJlYWQgbWFya2VyIGlzXG4gICAgICAgIC8vIGFib3ZlIG9yIGJlbG93IHRoZSB2aXNpYmxlIHRpbWVsaW5lLCB3ZSBzdGFzaCB0aGUgdGltZXN0YW1wLlxuICAgICAgICBUaW1lbGluZVBhbmVsLnJvb21SZWFkTWFya2VyVHNNYXBbcm9vbUlkXSA9IGV2ZW50VHM7XG5cbiAgICAgICAgaWYgKGluaGliaXRTZXRTdGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRG8gdGhlIGxvY2FsIGVjaG8gb2YgdGhlIFJNXG4gICAgICAgIC8vIHJ1biB0aGUgcmVuZGVyIGN5Y2xlIGJlZm9yZSBjYWxsaW5nIHRoZSBjYWxsYmFjaywgc28gdGhhdFxuICAgICAgICAvLyBnZXRSZWFkTWFya2VyUG9zaXRpb24oKSByZXR1cm5zIHRoZSByaWdodCB0aGluZy5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICByZWFkTWFya2VyRXZlbnRJZDogZXZlbnRJZCxcbiAgICAgICAgfSwgdGhpcy5wcm9wcy5vblJlYWRNYXJrZXJVcGRhdGVkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNob3VsZFBhZ2luYXRlKCk6IGJvb2xlYW4ge1xuICAgICAgICAvLyBkb24ndCB0cnkgdG8gcGFnaW5hdGUgd2hpbGUgZXZlbnRzIGluIHRoZSB0aW1lbGluZSBhcmVcbiAgICAgICAgLy8gc3RpbGwgYmVpbmcgZGVjcnlwdGVkLiBXZSBkb24ndCByZW5kZXIgZXZlbnRzIHdoaWxlIHRoZXkncmVcbiAgICAgICAgLy8gYmVpbmcgZGVjcnlwdGVkLCBzbyB0aGV5IGRvbid0IHRha2UgdXAgc3BhY2UgaW4gdGhlIHRpbWVsaW5lLlxuICAgICAgICAvLyBUaGlzIG1lYW5zIHdlIGNhbiBwdWxsIHF1aXRlIGEgbG90IG9mIGV2ZW50cyBpbnRvIHRoZSB0aW1lbGluZVxuICAgICAgICAvLyBhbmQgZW5kIHVwIHRyeWluZyB0byByZW5kZXIgYSBsb3Qgb2YgZXZlbnRzLlxuICAgICAgICByZXR1cm4gIXRoaXMuc3RhdGUuZXZlbnRzLnNvbWUoKGUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBlLmlzQmVpbmdEZWNyeXB0ZWQoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRSZWxhdGlvbnNGb3JFdmVudCA9IChcbiAgICAgICAgZXZlbnRJZDogc3RyaW5nLFxuICAgICAgICByZWxhdGlvblR5cGU6IFJlbGF0aW9uVHlwZSxcbiAgICAgICAgZXZlbnRUeXBlOiBFdmVudFR5cGUgfCBzdHJpbmcsXG4gICAgKSA9PiB0aGlzLnByb3BzLnRpbWVsaW5lU2V0LnJlbGF0aW9ucz8uZ2V0Q2hpbGRFdmVudHNGb3JFdmVudChldmVudElkLCByZWxhdGlvblR5cGUsIGV2ZW50VHlwZSk7XG5cbiAgICBwcml2YXRlIGJ1aWxkTGVnYWN5Q2FsbEV2ZW50R3JvdXBlcnMoZXZlbnRzPzogTWF0cml4RXZlbnRbXSk6IHZvaWQge1xuICAgICAgICB0aGlzLmNhbGxFdmVudEdyb3VwZXJzID0gYnVpbGRMZWdhY3lDYWxsRXZlbnRHcm91cGVycyh0aGlzLmNhbGxFdmVudEdyb3VwZXJzLCBldmVudHMpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgLy8ganVzdCBzaG93IGEgc3Bpbm5lciB3aGlsZSB0aGUgdGltZWxpbmUgbG9hZHMuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIHB1dCBpdCBpbiBhIGRpdiBvZiB0aGUgcmlnaHQgY2xhc3MgKG14X1Jvb21WaWV3X21lc3NhZ2VQYW5lbCkgc29cbiAgICAgICAgLy8gdGhhdCB0aGUgb3JkZXIgaW4gdGhlIHJvb212aWV3IGZsZXhib3ggaXMgY29ycmVjdCwgYW5kXG4gICAgICAgIC8vIG14X1Jvb21WaWV3X21lc3NhZ2VMaXN0V3JhcHBlciB0byBwb3NpdGlvbiB0aGUgaW5uZXIgZGl2IGluIHRoZVxuICAgICAgICAvLyByaWdodCBwbGFjZS5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gTm90ZSB0aGF0IHRoZSBjbGljay1vbi1zZWFyY2gtcmVzdWx0IGZ1bmN0aW9uYWxpdHkgcmVsaWVzIG9uIHRoZVxuICAgICAgICAvLyBmYWN0IHRoYXQgdGhlIG1lc3NhZ2VQYW5lbCBpcyBoaWRkZW4gd2hpbGUgdGhlIHRpbWVsaW5lIHJlbG9hZHMsXG4gICAgICAgIC8vIGJ1dCB0aGF0IHRoZSBSb29tSGVhZGVyIChjb21wbGV0ZSB3aXRoIHNlYXJjaCB0ZXJtKSBjb250aW51ZXMgdG9cbiAgICAgICAgLy8gZXhpc3QuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnRpbWVsaW5lTG9hZGluZykge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21WaWV3X21lc3NhZ2VQYW5lbFNwaW5uZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPFNwaW5uZXIgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5ldmVudHMubGVuZ3RoID09IDAgJiYgIXRoaXMuc3RhdGUuY2FuQmFja1BhZ2luYXRlICYmIHRoaXMucHJvcHMuZW1wdHkpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e3RoaXMucHJvcHMuY2xhc3NOYW1lICsgXCIgbXhfUm9vbVZpZXdfbWVzc2FnZUxpc3RXcmFwcGVyXCJ9PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21WaWV3X2VtcHR5XCI+eyB0aGlzLnByb3BzLmVtcHR5IH08L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBnaXZlIHRoZSBtZXNzYWdlcGFuZWwgYSBzdGlja3lib3R0b20gaWYgd2UncmUgYXQgdGhlIGVuZCBvZiB0aGVcbiAgICAgICAgLy8gbGl2ZSB0aW1lbGluZSwgc28gdGhhdCB0aGUgYXJyaXZhbCBvZiBuZXcgZXZlbnRzIHRyaWdnZXJzIGFcbiAgICAgICAgLy8gc2Nyb2xsLlxuICAgICAgICAvL1xuICAgICAgICAvLyBNYWtlIHN1cmUgdGhhdCBzdGlja3lCb3R0b20gaXMgKmZhbHNlKiBpZiB3ZSBjYW4gcGFnaW5hdGVcbiAgICAgICAgLy8gZm9yd2FyZHMsIG90aGVyd2lzZSBpZiBzb21lYm9keSBoaXRzIHRoZSBib3R0b20gb2YgdGhlIGxvYWRlZFxuICAgICAgICAvLyBldmVudHMgd2hlbiB2aWV3aW5nIGhpc3RvcmljYWwgbWVzc2FnZXMsIHdlIGdldCBzdHVjayBpbiBhIGxvb3BcbiAgICAgICAgLy8gb2YgcGFnaW5hdGluZyBvdXIgd2F5IHRocm91Z2ggdGhlIGVudGlyZSBoaXN0b3J5IG9mIHRoZSByb29tLlxuICAgICAgICBjb25zdCBzdGlja3lCb3R0b20gPSAhdGhpcy50aW1lbGluZVdpbmRvdy5jYW5QYWdpbmF0ZShFdmVudFRpbWVsaW5lLkZPUldBUkRTKTtcblxuICAgICAgICAvLyBJZiB0aGUgc3RhdGUgaXMgUFJFUEFSRUQgb3IgQ0FUQ0hVUCwgd2UncmUgc3RpbGwgd2FpdGluZyBmb3IgdGhlIGpzLXNkayB0byBzeW5jIHdpdGhcbiAgICAgICAgLy8gdGhlIEhTIGFuZCBmZXRjaCB0aGUgbGF0ZXN0IGV2ZW50cywgc28gd2UgYXJlIGVmZmVjdGl2ZWx5IGZvcndhcmQgcGFnaW5hdGluZy5cbiAgICAgICAgY29uc3QgZm9yd2FyZFBhZ2luYXRpbmcgPSAoXG4gICAgICAgICAgICB0aGlzLnN0YXRlLmZvcndhcmRQYWdpbmF0aW5nIHx8XG4gICAgICAgICAgICBbJ1BSRVBBUkVEJywgJ0NBVENIVVAnXS5pbmNsdWRlcyh0aGlzLnN0YXRlLmNsaWVudFN5bmNTdGF0ZSlcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgZXZlbnRzID0gdGhpcy5zdGF0ZS5maXJzdFZpc2libGVFdmVudEluZGV4XG4gICAgICAgICAgICA/IHRoaXMuc3RhdGUuZXZlbnRzLnNsaWNlKHRoaXMuc3RhdGUuZmlyc3RWaXNpYmxlRXZlbnRJbmRleClcbiAgICAgICAgICAgIDogdGhpcy5zdGF0ZS5ldmVudHM7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8TWVzc2FnZVBhbmVsXG4gICAgICAgICAgICAgICAgcmVmPXt0aGlzLm1lc3NhZ2VQYW5lbH1cbiAgICAgICAgICAgICAgICByb29tPXt0aGlzLnByb3BzLnRpbWVsaW5lU2V0LnJvb219XG4gICAgICAgICAgICAgICAgcGVybWFsaW5rQ3JlYXRvcj17dGhpcy5wcm9wcy5wZXJtYWxpbmtDcmVhdG9yfVxuICAgICAgICAgICAgICAgIGhpZGRlbj17dGhpcy5wcm9wcy5oaWRkZW59XG4gICAgICAgICAgICAgICAgYmFja1BhZ2luYXRpbmc9e3RoaXMuc3RhdGUuYmFja1BhZ2luYXRpbmd9XG4gICAgICAgICAgICAgICAgZm9yd2FyZFBhZ2luYXRpbmc9e2ZvcndhcmRQYWdpbmF0aW5nfVxuICAgICAgICAgICAgICAgIGV2ZW50cz17ZXZlbnRzfVxuICAgICAgICAgICAgICAgIGhpZ2hsaWdodGVkRXZlbnRJZD17dGhpcy5wcm9wcy5oaWdobGlnaHRlZEV2ZW50SWR9XG4gICAgICAgICAgICAgICAgcmVhZE1hcmtlckV2ZW50SWQ9e3RoaXMuc3RhdGUucmVhZE1hcmtlckV2ZW50SWR9XG4gICAgICAgICAgICAgICAgcmVhZE1hcmtlclZpc2libGU9e3RoaXMuc3RhdGUucmVhZE1hcmtlclZpc2libGV9XG4gICAgICAgICAgICAgICAgY2FuQmFja1BhZ2luYXRlPXt0aGlzLnN0YXRlLmNhbkJhY2tQYWdpbmF0ZSAmJiB0aGlzLnN0YXRlLmZpcnN0VmlzaWJsZUV2ZW50SW5kZXggPT09IDB9XG4gICAgICAgICAgICAgICAgc2hvd1VybFByZXZpZXc9e3RoaXMucHJvcHMuc2hvd1VybFByZXZpZXd9XG4gICAgICAgICAgICAgICAgc2hvd1JlYWRSZWNlaXB0cz17dGhpcy5wcm9wcy5zaG93UmVhZFJlY2VpcHRzfVxuICAgICAgICAgICAgICAgIG91clVzZXJJZD17TWF0cml4Q2xpZW50UGVnLmdldCgpLmNyZWRlbnRpYWxzLnVzZXJJZH1cbiAgICAgICAgICAgICAgICBzdGlja3lCb3R0b209e3N0aWNreUJvdHRvbX1cbiAgICAgICAgICAgICAgICBvblNjcm9sbD17dGhpcy5vbk1lc3NhZ2VMaXN0U2Nyb2xsfVxuICAgICAgICAgICAgICAgIG9uRmlsbFJlcXVlc3Q9e3RoaXMub25NZXNzYWdlTGlzdEZpbGxSZXF1ZXN0fVxuICAgICAgICAgICAgICAgIG9uVW5maWxsUmVxdWVzdD17dGhpcy5vbk1lc3NhZ2VMaXN0VW5maWxsUmVxdWVzdH1cbiAgICAgICAgICAgICAgICBpc1R3ZWx2ZUhvdXI9e3RoaXMuY29udGV4dD8uc2hvd1R3ZWx2ZUhvdXJUaW1lc3RhbXBzID8/IHRoaXMuc3RhdGUuaXNUd2VsdmVIb3VyfVxuICAgICAgICAgICAgICAgIGFsd2F5c1Nob3dUaW1lc3RhbXBzPXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5hbHdheXNTaG93VGltZXN0YW1wcyA/P1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRleHQ/LmFsd2F5c1Nob3dUaW1lc3RhbXBzID8/XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUuYWx3YXlzU2hvd1RpbWVzdGFtcHNcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXt0aGlzLnByb3BzLmNsYXNzTmFtZX1cbiAgICAgICAgICAgICAgICByZXNpemVOb3RpZmllcj17dGhpcy5wcm9wcy5yZXNpemVOb3RpZmllcn1cbiAgICAgICAgICAgICAgICBnZXRSZWxhdGlvbnNGb3JFdmVudD17dGhpcy5nZXRSZWxhdGlvbnNGb3JFdmVudH1cbiAgICAgICAgICAgICAgICBlZGl0U3RhdGU9e3RoaXMucHJvcHMuZWRpdFN0YXRlfVxuICAgICAgICAgICAgICAgIHNob3dSZWFjdGlvbnM9e3RoaXMucHJvcHMuc2hvd1JlYWN0aW9uc31cbiAgICAgICAgICAgICAgICBsYXlvdXQ9e3RoaXMucHJvcHMubGF5b3V0fVxuICAgICAgICAgICAgICAgIGhpZGVUaHJlYWRlZE1lc3NhZ2VzPXt0aGlzLnByb3BzLmhpZGVUaHJlYWRlZE1lc3NhZ2VzfVxuICAgICAgICAgICAgICAgIGRpc2FibGVHcm91cGluZz17dGhpcy5wcm9wcy5kaXNhYmxlR3JvdXBpbmd9XG4gICAgICAgICAgICAgICAgY2FsbEV2ZW50R3JvdXBlcnM9e3RoaXMuY2FsbEV2ZW50R3JvdXBlcnN9XG4gICAgICAgICAgICAvPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuLyoqXG4gKiBJdGVyYXRlIGFjcm9zcyBhbGwgb2YgdGhlIHRpbWVsaW5lU2V0cyBhbmQgdGltZWxpbmVzIGluc2lkZSB0byBleHBvc2UgYWxsIG9mXG4gKiB0aGUgZXZlbnQgSURzIGNvbnRhaW5lZCBpbnNpZGUuXG4gKlxuICogQHJldHVybiBBbiBldmVudCBJRCBsaXN0IGZvciBldmVyeSB0aW1lbGluZSBpbiBldmVyeSB0aW1lbGluZVNldFxuICovXG5mdW5jdGlvbiBzZXJpYWxpemVFdmVudElkc0Zyb21UaW1lbGluZVNldHModGltZWxpbmVTZXRzKTogeyBba2V5OiBzdHJpbmddOiBzdHJpbmdbXSB9W10ge1xuICAgIGNvbnN0IHNlcmlhbGl6ZWRFdmVudElkc0luVGltZWxpbmVTZXQgPSB0aW1lbGluZVNldHMubWFwKCh0aW1lbGluZVNldCkgPT4ge1xuICAgICAgICBjb25zdCB0aW1lbGluZU1hcCA9IHt9O1xuXG4gICAgICAgIGNvbnN0IHRpbWVsaW5lcyA9IHRpbWVsaW5lU2V0LmdldFRpbWVsaW5lcygpO1xuICAgICAgICBjb25zdCBsaXZlVGltZWxpbmUgPSB0aW1lbGluZVNldC5nZXRMaXZlVGltZWxpbmUoKTtcblxuICAgICAgICB0aW1lbGluZXMuZm9yRWFjaCgodGltZWxpbmUsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAvLyBBZGQgYSBzcGVjaWFsIGxhYmVsIHdoZW4gaXQgaXMgdGhlIGxpdmUgdGltZWxpbmUgc28gd2UgY2FuIHRlbGxcbiAgICAgICAgICAgIC8vIGl0IGFwYXJ0IGZyb20gdGhlIG90aGVyc1xuICAgICAgICAgICAgY29uc3QgaXNMaXZlVGltZWxpbmUgPSB0aW1lbGluZSA9PT0gbGl2ZVRpbWVsaW5lO1xuICAgICAgICAgICAgdGltZWxpbmVNYXBbaXNMaXZlVGltZWxpbmUgPyAnbGl2ZVRpbWVsaW5lJyA6IGAke2luZGV4fWBdID0gdGltZWxpbmUuZ2V0RXZlbnRzKCkubWFwKGV2ID0+IGV2LmdldElkKCkpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGltZWxpbmVNYXA7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gc2VyaWFsaXplZEV2ZW50SWRzSW5UaW1lbGluZVNldDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgVGltZWxpbmVQYW5lbDtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBS0E7O0FBRUE7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7Ozs7OztBQTFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUE4Q0EsTUFBTUEsYUFBYSxHQUFHLEVBQXRCO0FBQ0EsTUFBTUMsWUFBWSxHQUFHLEVBQXJCO0FBQ0EsTUFBTUMsd0JBQXdCLEdBQUcsR0FBakM7QUFFQSxNQUFNQyx1QkFBdUIsR0FBRyxHQUFoQzs7QUFFQSxNQUFNQyxRQUFRLEdBQUcsWUFBb0I7RUFDakMsSUFBSUMsc0JBQUEsQ0FBY0MsUUFBZCxDQUF1QixzQkFBdkIsQ0FBSixFQUFvRDtJQUFBLGtDQURuQ0MsSUFDbUM7TUFEbkNBLElBQ21DO0lBQUE7O0lBQ2hEQyxjQUFBLENBQU9DLEdBQVAsQ0FBV0MsSUFBWCxDQUFn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