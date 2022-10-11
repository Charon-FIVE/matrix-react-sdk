"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _events = require("events");

var _roomMember = require("matrix-js-sdk/src/models/room-member");

var _eventTimeline = require("matrix-js-sdk/src/models/event-timeline");

var _room = require("matrix-js-sdk/src/models/room");

var _roomState = require("matrix-js-sdk/src/models/room-state");

var _utils = require("matrix-js-sdk/src/utils");

var _logger = require("matrix-js-sdk/src/logger");

var _event = require("matrix-js-sdk/src/@types/event");

var _client = require("matrix-js-sdk/src/client");

var _PlatformPeg = _interopRequireDefault(require("../PlatformPeg"));

var _MatrixClientPeg = require("../MatrixClientPeg");

var _SettingsStore = _interopRequireDefault(require("../settings/SettingsStore"));

var _SettingLevel = require("../settings/SettingLevel");

/*
Copyright 2019, 2021 The Matrix.org Foundation C.I.C.

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
// The time in ms that the crawler will wait loop iterations if there
// have not been any checkpoints to consume in the last iteration.
const CRAWLER_IDLE_TIME = 5000; // The maximum number of events our crawler should fetch in a single crawl.

const EVENTS_PER_CRAWL = 100;

/*
 * Event indexing class that wraps the platform specific event indexing.
 */
class EventIndex extends _events.EventEmitter {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "crawlerCheckpoints", []);
    (0, _defineProperty2.default)(this, "crawler", null);
    (0, _defineProperty2.default)(this, "currentCheckpoint", null);
    (0, _defineProperty2.default)(this, "onSync", async (state, prevState, data) => {
      const indexManager = _PlatformPeg.default.get().getEventIndexingManager();

      if (prevState === "PREPARED" && state === "SYNCING") {
        // If our indexer is empty we're most likely running Element the
        // first time with indexing support or running it with an
        // initial sync. Add checkpoints to crawl our encrypted rooms.
        const eventIndexWasEmpty = await indexManager.isEventIndexEmpty();
        if (eventIndexWasEmpty) await this.addInitialCheckpoints();
        this.startCrawler();
        return;
      }

      if (prevState === "SYNCING" && state === "SYNCING") {
        // A sync was done, presumably we queued up some live events,
        // commit them now.
        await indexManager.commitLiveEvents();
      }
    });
    (0, _defineProperty2.default)(this, "onRoomTimeline", async (ev, room, toStartOfTimeline, removed, data) => {
      if (!room) return; // notification timeline, we'll get this event again with a room specific timeline

      const client = _MatrixClientPeg.MatrixClientPeg.get(); // We only index encrypted rooms locally.


      if (!client.isRoomEncrypted(ev.getRoomId())) return;

      if (ev.isRedaction()) {
        return this.redactEvent(ev);
      } // If it isn't a live event or if it's redacted there's nothing to do.


      if (toStartOfTimeline || !data || !data.liveEvent || ev.isRedacted()) {
        return;
      }

      await client.decryptEventIfNeeded(ev);
      await this.addLiveEventToIndex(ev);
    });
    (0, _defineProperty2.default)(this, "onRoomStateEvent", async (ev, state) => {
      if (!_MatrixClientPeg.MatrixClientPeg.get().isRoomEncrypted(state.roomId)) return;

      if (ev.getType() === _event.EventType.RoomEncryption && !(await this.isRoomIndexed(state.roomId))) {
        _logger.logger.log("EventIndex: Adding a checkpoint for a newly encrypted room", state.roomId);

        this.addRoomCheckpoint(state.roomId, true);
      }
    });
    (0, _defineProperty2.default)(this, "redactEvent", async ev => {
      const indexManager = _PlatformPeg.default.get().getEventIndexingManager();

      try {
        await indexManager.deleteEvent(ev.getAssociatedId());
      } catch (e) {
        _logger.logger.log("EventIndex: Error deleting event from index", e);
      }
    });
    (0, _defineProperty2.default)(this, "onTimelineReset", async (room, timelineSet, resetAllTimelines) => {
      if (room === null) return;
      if (!_MatrixClientPeg.MatrixClientPeg.get().isRoomEncrypted(room.roomId)) return;

      _logger.logger.log("EventIndex: Adding a checkpoint because of a limited timeline", room.roomId);

      this.addRoomCheckpoint(room.roomId, false);
    });
  }

  async init() {
    const indexManager = _PlatformPeg.default.get().getEventIndexingManager();

    this.crawlerCheckpoints = await indexManager.loadCheckpoints();

    _logger.logger.log("EventIndex: Loaded checkpoints", this.crawlerCheckpoints);

    this.registerListeners();
  }
  /**
   * Register event listeners that are necessary for the event index to work.
   */


  registerListeners() {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    client.on(_client.ClientEvent.Sync, this.onSync);
    client.on(_room.RoomEvent.Timeline, this.onRoomTimeline);
    client.on(_room.RoomEvent.TimelineReset, this.onTimelineReset);
    client.on(_roomState.RoomStateEvent.Events, this.onRoomStateEvent);
  }
  /**
   * Remove the event index specific event listeners.
   */


  removeListeners() {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    if (client === null) return;
    client.removeListener(_client.ClientEvent.Sync, this.onSync);
    client.removeListener(_room.RoomEvent.Timeline, this.onRoomTimeline);
    client.removeListener(_room.RoomEvent.TimelineReset, this.onTimelineReset);
    client.removeListener(_roomState.RoomStateEvent.Events, this.onRoomStateEvent);
  }
  /**
   * Get crawler checkpoints for the encrypted rooms and store them in the index.
   */


  async addInitialCheckpoints() {
    const indexManager = _PlatformPeg.default.get().getEventIndexingManager();

    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const rooms = client.getRooms();

    const isRoomEncrypted = room => {
      return client.isRoomEncrypted(room.roomId);
    }; // We only care to crawl the encrypted rooms, non-encrypted
    // rooms can use the search provided by the homeserver.


    const encryptedRooms = rooms.filter(isRoomEncrypted);

    _logger.logger.log("EventIndex: Adding initial crawler checkpoints"); // Gather the prev_batch tokens and create checkpoints for
    // our message crawler.


    await Promise.all(encryptedRooms.map(async room => {
      const timeline = room.getLiveTimeline();
      const token = timeline.getPaginationToken(_eventTimeline.Direction.Backward);
      const backCheckpoint = {
        roomId: room.roomId,
        token: token,
        direction: _eventTimeline.Direction.Backward,
        fullCrawl: true
      };
      const forwardCheckpoint = {
        roomId: room.roomId,
        token: token,
        direction: _eventTimeline.Direction.Forward
      };

      try {
        if (backCheckpoint.token) {
          await indexManager.addCrawlerCheckpoint(backCheckpoint);
          this.crawlerCheckpoints.push(backCheckpoint);
        }

        if (forwardCheckpoint.token) {
          await indexManager.addCrawlerCheckpoint(forwardCheckpoint);
          this.crawlerCheckpoints.push(forwardCheckpoint);
        }
      } catch (e) {
        _logger.logger.log("EventIndex: Error adding initial checkpoints for room", room.roomId, backCheckpoint, forwardCheckpoint, e);
      }
    }));
  }
  /*
   * The sync event listener.
   *
   * The listener has two cases:
   *     - First sync after start up, check if the index is empty, add
   *         initial checkpoints, if so. Start the crawler background task.
   *     - Every other sync, tell the event index to commit all the queued up
   *         live events
   */


  /**
   * Check if an event should be added to the event index.
   *
   * Most notably we filter events for which decryption failed, are redacted
   * or aren't of a type that we know how to index.
   *
   * @param {MatrixEvent} ev The event that should be checked.
   * @returns {bool} Returns true if the event can be indexed, false
   * otherwise.
   */
  isValidEvent(ev) {
    const isUsefulType = [_event.EventType.RoomMessage, _event.EventType.RoomName, _event.EventType.RoomTopic].includes(ev.getType());
    const validEventType = isUsefulType && !ev.isRedacted() && !ev.isDecryptionFailure();
    let validMsgType = true;
    let hasContentValue = true;

    if (ev.getType() === _event.EventType.RoomMessage && !ev.isRedacted()) {
      // Expand this if there are more invalid msgtypes.
      const msgtype = ev.getContent().msgtype;
      if (!msgtype) validMsgType = false;else validMsgType = !msgtype.startsWith("m.key.verification");
      if (!ev.getContent().body) hasContentValue = false;
    } else if (ev.getType() === _event.EventType.RoomTopic && !ev.isRedacted()) {
      if (!ev.getContent().topic) hasContentValue = false;
    } else if (ev.getType() === _event.EventType.RoomName && !ev.isRedacted()) {
      if (!ev.getContent().name) hasContentValue = false;
    }

    return validEventType && validMsgType && hasContentValue;
  }

  eventToJson(ev) {
    const jsonEvent = ev.toJSON();
    const e = ev.isEncrypted() ? jsonEvent.decrypted : jsonEvent;

    if (ev.isEncrypted()) {
      // Let us store some additional data so we can re-verify the event.
      // The js-sdk checks if an event is encrypted using the algorithm,
      // the sender key and ed25519 signing key are used to find the
      // correct device that sent the event which allows us to check the
      // verification state of the event, either directly or using cross
      // signing.
      e.curve25519Key = ev.getSenderKey();
      e.ed25519Key = ev.getClaimedEd25519Key();
      e.algorithm = ev.getWireContent().algorithm;
      e.forwardingCurve25519KeyChain = ev.getForwardingCurve25519KeyChain();
    } else {
      // Make sure that unencrypted events don't contain any of that data,
      // despite what the server might give to us.
      delete e.curve25519Key;
      delete e.ed25519Key;
      delete e.algorithm;
      delete e.forwardingCurve25519KeyChain;
    }

    return e;
  }
  /**
   * Queue up live events to be added to the event index.
   *
   * @param {MatrixEvent} ev The event that should be added to the index.
   */


  async addLiveEventToIndex(ev) {
    const indexManager = _PlatformPeg.default.get().getEventIndexingManager();

    if (!this.isValidEvent(ev)) return;
    const e = this.eventToJson(ev);
    const profile = {
      displayname: ev.sender.rawDisplayName,
      avatar_url: ev.sender.getMxcAvatarUrl()
    };
    await indexManager.addEventToIndex(e, profile);
  }
  /**
   * Emmit that the crawler has changed the checkpoint that it's currently
   * handling.
   */


  emitNewCheckpoint() {
    this.emit("changedCheckpoint", this.currentRoom());
  }

  async addEventsFromLiveTimeline(timeline) {
    const events = timeline.getEvents();

    for (let i = 0; i < events.length; i++) {
      const ev = events[i];
      await this.addLiveEventToIndex(ev);
    }
  }

  async addRoomCheckpoint(roomId) {
    let fullCrawl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    const indexManager = _PlatformPeg.default.get().getEventIndexingManager();

    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const room = client.getRoom(roomId);
    if (!room) return;
    const timeline = room.getLiveTimeline();
    const token = timeline.getPaginationToken(_eventTimeline.Direction.Backward);

    if (!token) {
      // The room doesn't contain any tokens, meaning the live timeline
      // contains all the events, add those to the index.
      await this.addEventsFromLiveTimeline(timeline);
      return;
    }

    const checkpoint = {
      roomId: room.roomId,
      token: token,
      fullCrawl: fullCrawl,
      direction: _eventTimeline.Direction.Backward
    };

    _logger.logger.log("EventIndex: Adding checkpoint", checkpoint);

    try {
      await indexManager.addCrawlerCheckpoint(checkpoint);
    } catch (e) {
      _logger.logger.log("EventIndex: Error adding new checkpoint for room", room.roomId, checkpoint, e);
    }

    this.crawlerCheckpoints.push(checkpoint);
  }
  /**
   * The main crawler loop.
   *
   * Goes through crawlerCheckpoints and fetches events from the server to be
   * added to the EventIndex.
   *
   * If a /room/{roomId}/messages request doesn't contain any events, stop the
   * crawl, otherwise create a new checkpoint and push it to the
   * crawlerCheckpoints queue, so we go through them in a round-robin way.
   */


  async crawlerFunc() {
    let cancelled = false;

    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const indexManager = _PlatformPeg.default.get().getEventIndexingManager();

    this.crawler = {
      cancel: () => {
        cancelled = true;
      }
    };
    let idle = false;

    while (!cancelled) {
      let sleepTime = _SettingsStore.default.getValueAt(_SettingLevel.SettingLevel.DEVICE, 'crawlerSleepTime'); // Don't let the user configure a lower sleep time than 100 ms.


      sleepTime = Math.max(sleepTime, 100);

      if (idle) {
        sleepTime = CRAWLER_IDLE_TIME;
      }

      if (this.currentCheckpoint !== null) {
        this.currentCheckpoint = null;
        this.emitNewCheckpoint();
      }

      await (0, _utils.sleep)(sleepTime);

      if (cancelled) {
        break;
      }

      const checkpoint = this.crawlerCheckpoints.shift(); /// There is no checkpoint available currently, one may appear if
      // a sync with limited room timelines happens, so go back to sleep.

      if (checkpoint === undefined) {
        idle = true;
        continue;
      }

      this.currentCheckpoint = checkpoint;
      this.emitNewCheckpoint();
      idle = false; // We have a checkpoint, let us fetch some messages, again, very
      // conservatively to not bother our homeserver too much.

      const eventMapper = client.getEventMapper({
        preventReEmit: true
      }); // TODO we need to ensure to use member lazy loading with this
      // request so we get the correct profiles.

      let res;

      try {
        res = await client.createMessagesRequest(checkpoint.roomId, checkpoint.token, EVENTS_PER_CRAWL, checkpoint.direction);
      } catch (e) {
        if (e.httpStatus === 403) {
          _logger.logger.log("EventIndex: Removing checkpoint as we don't have ", "permissions to fetch messages from this room.", checkpoint);

          try {
            await indexManager.removeCrawlerCheckpoint(checkpoint);
          } catch (e) {
            _logger.logger.log("EventIndex: Error removing checkpoint", checkpoint, e); // We don't push the checkpoint here back, it will
            // hopefully be removed after a restart. But let us
            // ignore it for now as we don't want to hammer the
            // endpoint.

          }

          continue;
        }

        _logger.logger.log("EventIndex: Error crawling using checkpoint:", checkpoint, ",", e);

        this.crawlerCheckpoints.push(checkpoint);
        continue;
      }

      if (cancelled) {
        this.crawlerCheckpoints.push(checkpoint);
        break;
      }

      if (res.chunk.length === 0) {
        _logger.logger.log("EventIndex: Done with the checkpoint", checkpoint); // We got to the start/end of our timeline, lets just
        // delete our checkpoint and go back to sleep.


        try {
          await indexManager.removeCrawlerCheckpoint(checkpoint);
        } catch (e) {
          _logger.logger.log("EventIndex: Error removing checkpoint", checkpoint, e);
        }

        continue;
      } // Convert the plain JSON events into Matrix events so they get
      // decrypted if necessary.


      const matrixEvents = res.chunk.map(eventMapper);
      let stateEvents = [];

      if (res.state !== undefined) {
        stateEvents = res.state.map(eventMapper);
      }

      const profiles = {};
      stateEvents.forEach(ev => {
        if (ev.event.content && ev.event.content.membership === "join") {
          profiles[ev.event.sender] = {
            displayname: ev.event.content.displayname,
            avatar_url: ev.event.content.avatar_url
          };
        }
      });
      const decryptionPromises = matrixEvents.filter(event => event.isEncrypted()).map(event => {
        return client.decryptEventIfNeeded(event, {
          isRetry: true,
          emit: false
        });
      }); // Let us wait for all the events to get decrypted.

      await Promise.all(decryptionPromises); // TODO if there are no events at this point we're missing a lot
      // decryption keys, do we want to retry this checkpoint at a later
      // stage?

      const filteredEvents = matrixEvents.filter(this.isValidEvent); // Collect the redaction events, so we can delete the redacted events from the index.

      const redactionEvents = matrixEvents.filter(ev => ev.isRedaction()); // Let us convert the events back into a format that EventIndex can
      // consume.

      const events = filteredEvents.map(ev => {
        const e = this.eventToJson(ev);
        let profile = {};
        if (e.sender in profiles) profile = profiles[e.sender];
        const object = {
          event: e,
          profile: profile
        };
        return object;
      });
      let newCheckpoint; // The token can be null for some reason. Don't create a checkpoint
      // in that case since adding it to the db will fail.

      if (res.end) {
        // Create a new checkpoint so we can continue crawling the room
        // for messages.
        newCheckpoint = {
          roomId: checkpoint.roomId,
          token: res.end,
          fullCrawl: checkpoint.fullCrawl,
          direction: checkpoint.direction
        };
      }

      try {
        for (let i = 0; i < redactionEvents.length; i++) {
          const ev = redactionEvents[i];
          const eventId = ev.getAssociatedId();

          if (eventId) {
            await indexManager.deleteEvent(eventId);
          } else {
            _logger.logger.warn("EventIndex: Redaction event doesn't contain a valid associated event id", ev);
          }
        }

        const eventsAlreadyAdded = await indexManager.addHistoricEvents(events, newCheckpoint, checkpoint); // We didn't get a valid new checkpoint from the server, nothing
        // to do here anymore.

        if (!newCheckpoint) {
          _logger.logger.log("EventIndex: The server didn't return a valid ", "new checkpoint, not continuing the crawl.", checkpoint);

          continue;
        } // If all events were already indexed we assume that we caught
        // up with our index and don't need to crawl the room further.
        // Let us delete the checkpoint in that case, otherwise push
        // the new checkpoint to be used by the crawler.


        if (eventsAlreadyAdded === true && newCheckpoint.fullCrawl !== true) {
          _logger.logger.log("EventIndex: Checkpoint had already all events", "added, stopping the crawl", checkpoint);

          await indexManager.removeCrawlerCheckpoint(newCheckpoint);
        } else {
          if (eventsAlreadyAdded === true) {
            _logger.logger.log("EventIndex: Checkpoint had already all events", "added, but continuing due to a full crawl", checkpoint);
          }

          this.crawlerCheckpoints.push(newCheckpoint);
        }
      } catch (e) {
        _logger.logger.log("EventIndex: Error during a crawl", e); // An error occurred, put the checkpoint back so we
        // can retry.


        this.crawlerCheckpoints.push(checkpoint);
      }
    }

    this.crawler = null;
  }
  /**
   * Start the crawler background task.
   */


  startCrawler() {
    if (this.crawler !== null) return;
    this.crawlerFunc();
  }
  /**
   * Stop the crawler background task.
   */


  stopCrawler() {
    if (this.crawler === null) return;
    this.crawler.cancel();
  }
  /**
   * Close the event index.
   *
   * This removes all the MatrixClient event listeners, stops the crawler
   * task, and closes the index.
   */


  async close() {
    const indexManager = _PlatformPeg.default.get().getEventIndexingManager();

    this.removeListeners();
    this.stopCrawler();
    await indexManager.closeEventIndex();
  }
  /**
   * Search the event index using the given term for matching events.
   *
   * @param {ISearchArgs} searchArgs The search configuration for the search,
   * sets the search term and determines the search result contents.
   *
   * @return {Promise<IResultRoomEvents[]>} A promise that will resolve to an array
   * of search results once the search is done.
   */


  async search(searchArgs) {
    const indexManager = _PlatformPeg.default.get().getEventIndexingManager();

    return indexManager.searchEventIndex(searchArgs);
  }
  /**
   * Load events that contain URLs from the event index.
   *
   * @param {Room} room The room for which we should fetch events containing
   * URLs
   *
   * @param {number} limit The maximum number of events to fetch.
   *
   * @param {string} fromEvent From which event should we continue fetching
   * events from the index. This is only needed if we're continuing to fill
   * the timeline, e.g. if we're paginating. This needs to be set to a event
   * id of an event that was previously fetched with this function.
   *
   * @param {string} direction The direction in which we will continue
   * fetching events. EventTimeline.BACKWARDS to continue fetching events that
   * are older than the event given in fromEvent, EventTimeline.FORWARDS to
   * fetch newer events.
   *
   * @returns {Promise<MatrixEvent[]>} Resolves to an array of events that
   * contain URLs.
   */


  async loadFileEvents(room) {
    let limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;
    let fromEvent = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    let direction = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : _eventTimeline.EventTimeline.BACKWARDS;

    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const indexManager = _PlatformPeg.default.get().getEventIndexingManager();

    const loadArgs = {
      roomId: room.roomId,
      limit: limit
    };

    if (fromEvent) {
      loadArgs.fromEvent = fromEvent;
      loadArgs.direction = direction;
    }

    let events; // Get our events from the event index.

    try {
      events = await indexManager.loadFileEvents(loadArgs);
    } catch (e) {
      _logger.logger.log("EventIndex: Error getting file events", e);

      return [];
    }

    const eventMapper = client.getEventMapper(); // Turn the events into MatrixEvent objects.

    const matrixEvents = events.map(e => {
      const matrixEvent = eventMapper(e.event);
      const member = new _roomMember.RoomMember(room.roomId, matrixEvent.getSender()); // We can't really reconstruct the whole room state from our
      // EventIndex to calculate the correct display name. Use the
      // disambiguated form always instead.

      member.name = e.profile.displayname + " (" + matrixEvent.getSender() + ")"; // This is sets the avatar URL.

      const memberEvent = eventMapper({
        content: {
          membership: "join",
          avatar_url: e.profile.avatar_url,
          displayname: e.profile.displayname
        },
        type: _event.EventType.RoomMember,
        event_id: matrixEvent.getId() + ":eventIndex",
        room_id: matrixEvent.getRoomId(),
        sender: matrixEvent.getSender(),
        origin_server_ts: matrixEvent.getTs(),
        state_key: matrixEvent.getSender()
      }); // We set this manually to avoid emitting RoomMember.membership and
      // RoomMember.name events.

      member.events.member = memberEvent;
      matrixEvent.sender = member;
      return matrixEvent;
    });
    return matrixEvents;
  }
  /**
   * Fill a timeline with events that contain URLs.
   *
   * @param {TimelineSet} timelineSet The TimelineSet the Timeline belongs to,
   * used to check if we're adding duplicate events.
   *
   * @param {Timeline} timeline The Timeline which should be filed with
   * events.
   *
   * @param {Room} room The room for which we should fetch events containing
   * URLs
   *
   * @param {number} limit The maximum number of events to fetch.
   *
   * @param {string} fromEvent From which event should we continue fetching
   * events from the index. This is only needed if we're continuing to fill
   * the timeline, e.g. if we're paginating. This needs to be set to a event
   * id of an event that was previously fetched with this function.
   *
   * @param {string} direction The direction in which we will continue
   * fetching events. EventTimeline.BACKWARDS to continue fetching events that
   * are older than the event given in fromEvent, EventTimeline.FORWARDS to
   * fetch newer events.
   *
   * @returns {Promise<boolean>} Resolves to true if events were added to the
   * timeline, false otherwise.
   */


  async populateFileTimeline(timelineSet, timeline, room) {
    let limit = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 10;
    let fromEvent = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
    let direction = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : _eventTimeline.EventTimeline.BACKWARDS;
    const matrixEvents = await this.loadFileEvents(room, limit, fromEvent, direction); // If this is a normal fill request, not a pagination request, we need
    // to get our events in the BACKWARDS direction but populate them in the
    // forwards direction.
    // This needs to happen because a fill request might come with an
    // existing timeline e.g. if you close and re-open the FilePanel.

    if (fromEvent === null) {
      matrixEvents.reverse();
      direction = direction == _eventTimeline.EventTimeline.BACKWARDS ? _eventTimeline.EventTimeline.FORWARDS : _eventTimeline.EventTimeline.BACKWARDS;
    } // Add the events to the timeline of the file panel.


    matrixEvents.forEach(e => {
      if (!timelineSet.eventIdToTimeline(e.getId())) {
        timelineSet.addEventToTimeline(e, timeline, direction == _eventTimeline.EventTimeline.BACKWARDS);
      }
    });
    let ret = false;
    let paginationToken = ""; // Set the pagination token to the oldest event that we retrieved.

    if (matrixEvents.length > 0) {
      paginationToken = matrixEvents[matrixEvents.length - 1].getId();
      ret = true;
    }

    _logger.logger.log("EventIndex: Populating file panel with", matrixEvents.length, "events and setting the pagination token to", paginationToken);

    timeline.setPaginationToken(paginationToken, _eventTimeline.EventTimeline.BACKWARDS);
    return ret;
  }
  /**
   * Emulate a TimelineWindow pagination() request with the event index as the event source
   *
   * Might not fetch events from the index if the timeline already contains
   * events that the window isn't showing.
   *
   * @param {Room} room The room for which we should fetch events containing
   * URLs
   *
   * @param {TimelineWindow} timelineWindow The timeline window that should be
   * populated with new events.
   *
   * @param {string} direction The direction in which we should paginate.
   * EventTimeline.BACKWARDS to paginate back, EventTimeline.FORWARDS to
   * paginate forwards.
   *
   * @param {number} limit The maximum number of events to fetch while
   * paginating.
   *
   * @returns {Promise<boolean>} Resolves to a boolean which is true if more
   * events were successfully retrieved.
   */


  paginateTimelineWindow(room, timelineWindow, direction, limit) {
    const tl = timelineWindow.getTimelineIndex(direction);
    if (!tl) return Promise.resolve(false);
    if (tl.pendingPaginate) return tl.pendingPaginate;

    if (timelineWindow.extend(direction, limit)) {
      return Promise.resolve(true);
    }

    const paginationMethod = async (timelineWindow, timelineIndex, room, direction, limit) => {
      const timeline = timelineIndex.timeline;
      const timelineSet = timeline.getTimelineSet();
      const token = timeline.getPaginationToken(direction);
      const ret = await this.populateFileTimeline(timelineSet, timeline, room, limit, token, direction);
      timelineIndex.pendingPaginate = null;
      timelineWindow.extend(direction, limit);
      return ret;
    };

    const paginationPromise = paginationMethod(timelineWindow, tl, room, direction, limit);
    tl.pendingPaginate = paginationPromise;
    return paginationPromise;
  }
  /**
   * Get statistical information of the index.
   *
   * @return {Promise<IndexStats>} A promise that will resolve to the index
   * statistics.
   */


  async getStats() {
    const indexManager = _PlatformPeg.default.get().getEventIndexingManager();

    return indexManager.getStats();
  }
  /**
   * Check if the room with the given id is already indexed.
   *
   * @param {string} roomId The ID of the room which we want to check if it
   * has been already indexed.
   *
   * @return {Promise<boolean>} Returns true if the index contains events for
   * the given room, false otherwise.
   */


  async isRoomIndexed(roomId) {
    const indexManager = _PlatformPeg.default.get().getEventIndexingManager();

    return indexManager.isRoomIndexed(roomId);
  }
  /**
   * Get the room that we are currently crawling.
   *
   * @returns {Room} A MatrixRoom that is being currently crawled, null
   * if no room is currently being crawled.
   */


  currentRoom() {
    if (this.currentCheckpoint === null && this.crawlerCheckpoints.length === 0) {
      return null;
    }

    const client = _MatrixClientPeg.MatrixClientPeg.get();

    if (this.currentCheckpoint !== null) {
      return client.getRoom(this.currentCheckpoint.roomId);
    } else {
      return client.getRoom(this.crawlerCheckpoints[0].roomId);
    }
  }

  crawlingRooms() {
    const totalRooms = new Set();
    const crawlingRooms = new Set();
    this.crawlerCheckpoints.forEach((checkpoint, index) => {
      crawlingRooms.add(checkpoint.roomId);
    });

    if (this.currentCheckpoint !== null) {
      crawlingRooms.add(this.currentCheckpoint.roomId);
    }

    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const rooms = client.getRooms();

    const isRoomEncrypted = room => {
      return client.isRoomEncrypted(room.roomId);
    };

    const encryptedRooms = rooms.filter(isRoomEncrypted);
    encryptedRooms.forEach((room, index) => {
      totalRooms.add(room.roomId);
    });
    return {
      crawlingRooms,
      totalRooms
    };
  }

}

exports.default = EventIndex;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDUkFXTEVSX0lETEVfVElNRSIsIkVWRU5UU19QRVJfQ1JBV0wiLCJFdmVudEluZGV4IiwiRXZlbnRFbWl0dGVyIiwic3RhdGUiLCJwcmV2U3RhdGUiLCJkYXRhIiwiaW5kZXhNYW5hZ2VyIiwiUGxhdGZvcm1QZWciLCJnZXQiLCJnZXRFdmVudEluZGV4aW5nTWFuYWdlciIsImV2ZW50SW5kZXhXYXNFbXB0eSIsImlzRXZlbnRJbmRleEVtcHR5IiwiYWRkSW5pdGlhbENoZWNrcG9pbnRzIiwic3RhcnRDcmF3bGVyIiwiY29tbWl0TGl2ZUV2ZW50cyIsImV2Iiwicm9vbSIsInRvU3RhcnRPZlRpbWVsaW5lIiwicmVtb3ZlZCIsImNsaWVudCIsIk1hdHJpeENsaWVudFBlZyIsImlzUm9vbUVuY3J5cHRlZCIsImdldFJvb21JZCIsImlzUmVkYWN0aW9uIiwicmVkYWN0RXZlbnQiLCJsaXZlRXZlbnQiLCJpc1JlZGFjdGVkIiwiZGVjcnlwdEV2ZW50SWZOZWVkZWQiLCJhZGRMaXZlRXZlbnRUb0luZGV4Iiwicm9vbUlkIiwiZ2V0VHlwZSIsIkV2ZW50VHlwZSIsIlJvb21FbmNyeXB0aW9uIiwiaXNSb29tSW5kZXhlZCIsImxvZ2dlciIsImxvZyIsImFkZFJvb21DaGVja3BvaW50IiwiZGVsZXRlRXZlbnQiLCJnZXRBc3NvY2lhdGVkSWQiLCJlIiwidGltZWxpbmVTZXQiLCJyZXNldEFsbFRpbWVsaW5lcyIsImluaXQiLCJjcmF3bGVyQ2hlY2twb2ludHMiLCJsb2FkQ2hlY2twb2ludHMiLCJyZWdpc3Rlckxpc3RlbmVycyIsIm9uIiwiQ2xpZW50RXZlbnQiLCJTeW5jIiwib25TeW5jIiwiUm9vbUV2ZW50IiwiVGltZWxpbmUiLCJvblJvb21UaW1lbGluZSIsIlRpbWVsaW5lUmVzZXQiLCJvblRpbWVsaW5lUmVzZXQiLCJSb29tU3RhdGVFdmVudCIsIkV2ZW50cyIsIm9uUm9vbVN0YXRlRXZlbnQiLCJyZW1vdmVMaXN0ZW5lcnMiLCJyZW1vdmVMaXN0ZW5lciIsInJvb21zIiwiZ2V0Um9vbXMiLCJlbmNyeXB0ZWRSb29tcyIsImZpbHRlciIsIlByb21pc2UiLCJhbGwiLCJtYXAiLCJ0aW1lbGluZSIsImdldExpdmVUaW1lbGluZSIsInRva2VuIiwiZ2V0UGFnaW5hdGlvblRva2VuIiwiRGlyZWN0aW9uIiwiQmFja3dhcmQiLCJiYWNrQ2hlY2twb2ludCIsImRpcmVjdGlvbiIsImZ1bGxDcmF3bCIsImZvcndhcmRDaGVja3BvaW50IiwiRm9yd2FyZCIsImFkZENyYXdsZXJDaGVja3BvaW50IiwicHVzaCIsImlzVmFsaWRFdmVudCIsImlzVXNlZnVsVHlwZSIsIlJvb21NZXNzYWdlIiwiUm9vbU5hbWUiLCJSb29tVG9waWMiLCJpbmNsdWRlcyIsInZhbGlkRXZlbnRUeXBlIiwiaXNEZWNyeXB0aW9uRmFpbHVyZSIsInZhbGlkTXNnVHlwZSIsImhhc0NvbnRlbnRWYWx1ZSIsIm1zZ3R5cGUiLCJnZXRDb250ZW50Iiwic3RhcnRzV2l0aCIsImJvZHkiLCJ0b3BpYyIsIm5hbWUiLCJldmVudFRvSnNvbiIsImpzb25FdmVudCIsInRvSlNPTiIsImlzRW5jcnlwdGVkIiwiZGVjcnlwdGVkIiwiY3VydmUyNTUxOUtleSIsImdldFNlbmRlcktleSIsImVkMjU1MTlLZXkiLCJnZXRDbGFpbWVkRWQyNTUxOUtleSIsImFsZ29yaXRobSIsImdldFdpcmVDb250ZW50IiwiZm9yd2FyZGluZ0N1cnZlMjU1MTlLZXlDaGFpbiIsImdldEZvcndhcmRpbmdDdXJ2ZTI1NTE5S2V5Q2hhaW4iLCJwcm9maWxlIiwiZGlzcGxheW5hbWUiLCJzZW5kZXIiLCJyYXdEaXNwbGF5TmFtZSIsImF2YXRhcl91cmwiLCJnZXRNeGNBdmF0YXJVcmwiLCJhZGRFdmVudFRvSW5kZXgiLCJlbWl0TmV3Q2hlY2twb2ludCIsImVtaXQiLCJjdXJyZW50Um9vbSIsImFkZEV2ZW50c0Zyb21MaXZlVGltZWxpbmUiLCJldmVudHMiLCJnZXRFdmVudHMiLCJpIiwibGVuZ3RoIiwiZ2V0Um9vbSIsImNoZWNrcG9pbnQiLCJjcmF3bGVyRnVuYyIsImNhbmNlbGxlZCIsImNyYXdsZXIiLCJjYW5jZWwiLCJpZGxlIiwic2xlZXBUaW1lIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlQXQiLCJTZXR0aW5nTGV2ZWwiLCJERVZJQ0UiLCJNYXRoIiwibWF4IiwiY3VycmVudENoZWNrcG9pbnQiLCJzbGVlcCIsInNoaWZ0IiwidW5kZWZpbmVkIiwiZXZlbnRNYXBwZXIiLCJnZXRFdmVudE1hcHBlciIsInByZXZlbnRSZUVtaXQiLCJyZXMiLCJjcmVhdGVNZXNzYWdlc1JlcXVlc3QiLCJodHRwU3RhdHVzIiwicmVtb3ZlQ3Jhd2xlckNoZWNrcG9pbnQiLCJjaHVuayIsIm1hdHJpeEV2ZW50cyIsInN0YXRlRXZlbnRzIiwicHJvZmlsZXMiLCJmb3JFYWNoIiwiZXZlbnQiLCJjb250ZW50IiwibWVtYmVyc2hpcCIsImRlY3J5cHRpb25Qcm9taXNlcyIsImlzUmV0cnkiLCJmaWx0ZXJlZEV2ZW50cyIsInJlZGFjdGlvbkV2ZW50cyIsIm9iamVjdCIsIm5ld0NoZWNrcG9pbnQiLCJlbmQiLCJldmVudElkIiwid2FybiIsImV2ZW50c0FscmVhZHlBZGRlZCIsImFkZEhpc3RvcmljRXZlbnRzIiwic3RvcENyYXdsZXIiLCJjbG9zZSIsImNsb3NlRXZlbnRJbmRleCIsInNlYXJjaCIsInNlYXJjaEFyZ3MiLCJzZWFyY2hFdmVudEluZGV4IiwibG9hZEZpbGVFdmVudHMiLCJsaW1pdCIsImZyb21FdmVudCIsIkV2ZW50VGltZWxpbmUiLCJCQUNLV0FSRFMiLCJsb2FkQXJncyIsIm1hdHJpeEV2ZW50IiwibWVtYmVyIiwiUm9vbU1lbWJlciIsImdldFNlbmRlciIsIm1lbWJlckV2ZW50IiwidHlwZSIsImV2ZW50X2lkIiwiZ2V0SWQiLCJyb29tX2lkIiwib3JpZ2luX3NlcnZlcl90cyIsImdldFRzIiwic3RhdGVfa2V5IiwicG9wdWxhdGVGaWxlVGltZWxpbmUiLCJyZXZlcnNlIiwiRk9SV0FSRFMiLCJldmVudElkVG9UaW1lbGluZSIsImFkZEV2ZW50VG9UaW1lbGluZSIsInJldCIsInBhZ2luYXRpb25Ub2tlbiIsInNldFBhZ2luYXRpb25Ub2tlbiIsInBhZ2luYXRlVGltZWxpbmVXaW5kb3ciLCJ0aW1lbGluZVdpbmRvdyIsInRsIiwiZ2V0VGltZWxpbmVJbmRleCIsInJlc29sdmUiLCJwZW5kaW5nUGFnaW5hdGUiLCJleHRlbmQiLCJwYWdpbmF0aW9uTWV0aG9kIiwidGltZWxpbmVJbmRleCIsImdldFRpbWVsaW5lU2V0IiwicGFnaW5hdGlvblByb21pc2UiLCJnZXRTdGF0cyIsImNyYXdsaW5nUm9vbXMiLCJ0b3RhbFJvb21zIiwiU2V0IiwiaW5kZXgiLCJhZGQiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXhpbmcvRXZlbnRJbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTksIDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tIFwiZXZlbnRzXCI7XG5pbXBvcnQgeyBSb29tTWVtYmVyIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb20tbWVtYmVyJztcbmltcG9ydCB7IERpcmVjdGlvbiwgRXZlbnRUaW1lbGluZSB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudC10aW1lbGluZSc7XG5pbXBvcnQgeyBSb29tLCBSb29tRXZlbnQgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbSc7XG5pbXBvcnQgeyBNYXRyaXhFdmVudCB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudCc7XG5pbXBvcnQgeyBFdmVudFRpbWVsaW5lU2V0LCBJUm9vbVRpbWVsaW5lRGF0YSB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudC10aW1lbGluZS1zZXQnO1xuaW1wb3J0IHsgUm9vbVN0YXRlLCBSb29tU3RhdGVFdmVudCB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tLXN0YXRlJztcbmltcG9ydCB7IFRpbWVsaW5lSW5kZXgsIFRpbWVsaW5lV2luZG93IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvdGltZWxpbmUtd2luZG93JztcbmltcG9ydCB7IHNsZWVwIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL3V0aWxzXCI7XG5pbXBvcnQgeyBJUmVzdWx0Um9vbUV2ZW50cyB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvc2VhcmNoXCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5pbXBvcnQgeyBFdmVudFR5cGUgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL2V2ZW50XCI7XG5pbXBvcnQgeyBDbGllbnRFdmVudCwgTWF0cml4Q2xpZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NsaWVudFwiO1xuXG5pbXBvcnQgUGxhdGZvcm1QZWcgZnJvbSBcIi4uL1BsYXRmb3JtUGVnXCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tIFwiLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHsgU2V0dGluZ0xldmVsIH0gZnJvbSBcIi4uL3NldHRpbmdzL1NldHRpbmdMZXZlbFwiO1xuaW1wb3J0IHsgSUNyYXdsZXJDaGVja3BvaW50LCBJTG9hZEFyZ3MsIElTZWFyY2hBcmdzIH0gZnJvbSBcIi4vQmFzZUV2ZW50SW5kZXhNYW5hZ2VyXCI7XG5cbi8vIFRoZSB0aW1lIGluIG1zIHRoYXQgdGhlIGNyYXdsZXIgd2lsbCB3YWl0IGxvb3AgaXRlcmF0aW9ucyBpZiB0aGVyZVxuLy8gaGF2ZSBub3QgYmVlbiBhbnkgY2hlY2twb2ludHMgdG8gY29uc3VtZSBpbiB0aGUgbGFzdCBpdGVyYXRpb24uXG5jb25zdCBDUkFXTEVSX0lETEVfVElNRSA9IDUwMDA7XG5cbi8vIFRoZSBtYXhpbXVtIG51bWJlciBvZiBldmVudHMgb3VyIGNyYXdsZXIgc2hvdWxkIGZldGNoIGluIGEgc2luZ2xlIGNyYXdsLlxuY29uc3QgRVZFTlRTX1BFUl9DUkFXTCA9IDEwMDtcblxuaW50ZXJmYWNlIElDcmF3bGVyIHtcbiAgICBjYW5jZWwoKTogdm9pZDtcbn1cblxuLypcbiAqIEV2ZW50IGluZGV4aW5nIGNsYXNzIHRoYXQgd3JhcHMgdGhlIHBsYXRmb3JtIHNwZWNpZmljIGV2ZW50IGluZGV4aW5nLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFdmVudEluZGV4IGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgICBwcml2YXRlIGNyYXdsZXJDaGVja3BvaW50czogSUNyYXdsZXJDaGVja3BvaW50W10gPSBbXTtcbiAgICBwcml2YXRlIGNyYXdsZXI6IElDcmF3bGVyID0gbnVsbDtcbiAgICBwcml2YXRlIGN1cnJlbnRDaGVja3BvaW50OiBJQ3Jhd2xlckNoZWNrcG9pbnQgPSBudWxsO1xuXG4gICAgcHVibGljIGFzeW5jIGluaXQoKSB7XG4gICAgICAgIGNvbnN0IGluZGV4TWFuYWdlciA9IFBsYXRmb3JtUGVnLmdldCgpLmdldEV2ZW50SW5kZXhpbmdNYW5hZ2VyKCk7XG5cbiAgICAgICAgdGhpcy5jcmF3bGVyQ2hlY2twb2ludHMgPSBhd2FpdCBpbmRleE1hbmFnZXIubG9hZENoZWNrcG9pbnRzKCk7XG4gICAgICAgIGxvZ2dlci5sb2coXCJFdmVudEluZGV4OiBMb2FkZWQgY2hlY2twb2ludHNcIiwgdGhpcy5jcmF3bGVyQ2hlY2twb2ludHMpO1xuXG4gICAgICAgIHRoaXMucmVnaXN0ZXJMaXN0ZW5lcnMoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlciBldmVudCBsaXN0ZW5lcnMgdGhhdCBhcmUgbmVjZXNzYXJ5IGZvciB0aGUgZXZlbnQgaW5kZXggdG8gd29yay5cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcblxuICAgICAgICBjbGllbnQub24oQ2xpZW50RXZlbnQuU3luYywgdGhpcy5vblN5bmMpO1xuICAgICAgICBjbGllbnQub24oUm9vbUV2ZW50LlRpbWVsaW5lLCB0aGlzLm9uUm9vbVRpbWVsaW5lKTtcbiAgICAgICAgY2xpZW50Lm9uKFJvb21FdmVudC5UaW1lbGluZVJlc2V0LCB0aGlzLm9uVGltZWxpbmVSZXNldCk7XG4gICAgICAgIGNsaWVudC5vbihSb29tU3RhdGVFdmVudC5FdmVudHMsIHRoaXMub25Sb29tU3RhdGVFdmVudCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIHRoZSBldmVudCBpbmRleCBzcGVjaWZpYyBldmVudCBsaXN0ZW5lcnMuXG4gICAgICovXG4gICAgcHVibGljIHJlbW92ZUxpc3RlbmVycygpIHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBpZiAoY2xpZW50ID09PSBudWxsKSByZXR1cm47XG5cbiAgICAgICAgY2xpZW50LnJlbW92ZUxpc3RlbmVyKENsaWVudEV2ZW50LlN5bmMsIHRoaXMub25TeW5jKTtcbiAgICAgICAgY2xpZW50LnJlbW92ZUxpc3RlbmVyKFJvb21FdmVudC5UaW1lbGluZSwgdGhpcy5vblJvb21UaW1lbGluZSk7XG4gICAgICAgIGNsaWVudC5yZW1vdmVMaXN0ZW5lcihSb29tRXZlbnQuVGltZWxpbmVSZXNldCwgdGhpcy5vblRpbWVsaW5lUmVzZXQpO1xuICAgICAgICBjbGllbnQucmVtb3ZlTGlzdGVuZXIoUm9vbVN0YXRlRXZlbnQuRXZlbnRzLCB0aGlzLm9uUm9vbVN0YXRlRXZlbnQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBjcmF3bGVyIGNoZWNrcG9pbnRzIGZvciB0aGUgZW5jcnlwdGVkIHJvb21zIGFuZCBzdG9yZSB0aGVtIGluIHRoZSBpbmRleC5cbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgYWRkSW5pdGlhbENoZWNrcG9pbnRzKCkge1xuICAgICAgICBjb25zdCBpbmRleE1hbmFnZXIgPSBQbGF0Zm9ybVBlZy5nZXQoKS5nZXRFdmVudEluZGV4aW5nTWFuYWdlcigpO1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHJvb21zID0gY2xpZW50LmdldFJvb21zKCk7XG5cbiAgICAgICAgY29uc3QgaXNSb29tRW5jcnlwdGVkID0gKHJvb20pID0+IHtcbiAgICAgICAgICAgIHJldHVybiBjbGllbnQuaXNSb29tRW5jcnlwdGVkKHJvb20ucm9vbUlkKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBXZSBvbmx5IGNhcmUgdG8gY3Jhd2wgdGhlIGVuY3J5cHRlZCByb29tcywgbm9uLWVuY3J5cHRlZFxuICAgICAgICAvLyByb29tcyBjYW4gdXNlIHRoZSBzZWFyY2ggcHJvdmlkZWQgYnkgdGhlIGhvbWVzZXJ2ZXIuXG4gICAgICAgIGNvbnN0IGVuY3J5cHRlZFJvb21zID0gcm9vbXMuZmlsdGVyKGlzUm9vbUVuY3J5cHRlZCk7XG5cbiAgICAgICAgbG9nZ2VyLmxvZyhcIkV2ZW50SW5kZXg6IEFkZGluZyBpbml0aWFsIGNyYXdsZXIgY2hlY2twb2ludHNcIik7XG5cbiAgICAgICAgLy8gR2F0aGVyIHRoZSBwcmV2X2JhdGNoIHRva2VucyBhbmQgY3JlYXRlIGNoZWNrcG9pbnRzIGZvclxuICAgICAgICAvLyBvdXIgbWVzc2FnZSBjcmF3bGVyLlxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChlbmNyeXB0ZWRSb29tcy5tYXAoYXN5bmMgKHJvb20pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRpbWVsaW5lID0gcm9vbS5nZXRMaXZlVGltZWxpbmUoKTtcbiAgICAgICAgICAgIGNvbnN0IHRva2VuID0gdGltZWxpbmUuZ2V0UGFnaW5hdGlvblRva2VuKERpcmVjdGlvbi5CYWNrd2FyZCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGJhY2tDaGVja3BvaW50OiBJQ3Jhd2xlckNoZWNrcG9pbnQgPSB7XG4gICAgICAgICAgICAgICAgcm9vbUlkOiByb29tLnJvb21JZCxcbiAgICAgICAgICAgICAgICB0b2tlbjogdG9rZW4sXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uOiBEaXJlY3Rpb24uQmFja3dhcmQsXG4gICAgICAgICAgICAgICAgZnVsbENyYXdsOiB0cnVlLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgZm9yd2FyZENoZWNrcG9pbnQ6IElDcmF3bGVyQ2hlY2twb2ludCA9IHtcbiAgICAgICAgICAgICAgICByb29tSWQ6IHJvb20ucm9vbUlkLFxuICAgICAgICAgICAgICAgIHRva2VuOiB0b2tlbixcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb246IERpcmVjdGlvbi5Gb3J3YXJkLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAoYmFja0NoZWNrcG9pbnQudG9rZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgaW5kZXhNYW5hZ2VyLmFkZENyYXdsZXJDaGVja3BvaW50KGJhY2tDaGVja3BvaW50KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcmF3bGVyQ2hlY2twb2ludHMucHVzaChiYWNrQ2hlY2twb2ludCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGZvcndhcmRDaGVja3BvaW50LnRva2VuKSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGluZGV4TWFuYWdlci5hZGRDcmF3bGVyQ2hlY2twb2ludChmb3J3YXJkQ2hlY2twb2ludCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3Jhd2xlckNoZWNrcG9pbnRzLnB1c2goZm9yd2FyZENoZWNrcG9pbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIubG9nKFxuICAgICAgICAgICAgICAgICAgICBcIkV2ZW50SW5kZXg6IEVycm9yIGFkZGluZyBpbml0aWFsIGNoZWNrcG9pbnRzIGZvciByb29tXCIsXG4gICAgICAgICAgICAgICAgICAgIHJvb20ucm9vbUlkLFxuICAgICAgICAgICAgICAgICAgICBiYWNrQ2hlY2twb2ludCxcbiAgICAgICAgICAgICAgICAgICAgZm9yd2FyZENoZWNrcG9pbnQsXG4gICAgICAgICAgICAgICAgICAgIGUsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogVGhlIHN5bmMgZXZlbnQgbGlzdGVuZXIuXG4gICAgICpcbiAgICAgKiBUaGUgbGlzdGVuZXIgaGFzIHR3byBjYXNlczpcbiAgICAgKiAgICAgLSBGaXJzdCBzeW5jIGFmdGVyIHN0YXJ0IHVwLCBjaGVjayBpZiB0aGUgaW5kZXggaXMgZW1wdHksIGFkZFxuICAgICAqICAgICAgICAgaW5pdGlhbCBjaGVja3BvaW50cywgaWYgc28uIFN0YXJ0IHRoZSBjcmF3bGVyIGJhY2tncm91bmQgdGFzay5cbiAgICAgKiAgICAgLSBFdmVyeSBvdGhlciBzeW5jLCB0ZWxsIHRoZSBldmVudCBpbmRleCB0byBjb21taXQgYWxsIHRoZSBxdWV1ZWQgdXBcbiAgICAgKiAgICAgICAgIGxpdmUgZXZlbnRzXG4gICAgICovXG4gICAgcHJpdmF0ZSBvblN5bmMgPSBhc3luYyAoc3RhdGU6IHN0cmluZywgcHJldlN0YXRlOiBzdHJpbmcsIGRhdGE6IG9iamVjdCkgPT4ge1xuICAgICAgICBjb25zdCBpbmRleE1hbmFnZXIgPSBQbGF0Zm9ybVBlZy5nZXQoKS5nZXRFdmVudEluZGV4aW5nTWFuYWdlcigpO1xuXG4gICAgICAgIGlmIChwcmV2U3RhdGUgPT09IFwiUFJFUEFSRURcIiAmJiBzdGF0ZSA9PT0gXCJTWU5DSU5HXCIpIHtcbiAgICAgICAgICAgIC8vIElmIG91ciBpbmRleGVyIGlzIGVtcHR5IHdlJ3JlIG1vc3QgbGlrZWx5IHJ1bm5pbmcgRWxlbWVudCB0aGVcbiAgICAgICAgICAgIC8vIGZpcnN0IHRpbWUgd2l0aCBpbmRleGluZyBzdXBwb3J0IG9yIHJ1bm5pbmcgaXQgd2l0aCBhblxuICAgICAgICAgICAgLy8gaW5pdGlhbCBzeW5jLiBBZGQgY2hlY2twb2ludHMgdG8gY3Jhd2wgb3VyIGVuY3J5cHRlZCByb29tcy5cbiAgICAgICAgICAgIGNvbnN0IGV2ZW50SW5kZXhXYXNFbXB0eSA9IGF3YWl0IGluZGV4TWFuYWdlci5pc0V2ZW50SW5kZXhFbXB0eSgpO1xuICAgICAgICAgICAgaWYgKGV2ZW50SW5kZXhXYXNFbXB0eSkgYXdhaXQgdGhpcy5hZGRJbml0aWFsQ2hlY2twb2ludHMoKTtcblxuICAgICAgICAgICAgdGhpcy5zdGFydENyYXdsZXIoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcmV2U3RhdGUgPT09IFwiU1lOQ0lOR1wiICYmIHN0YXRlID09PSBcIlNZTkNJTkdcIikge1xuICAgICAgICAgICAgLy8gQSBzeW5jIHdhcyBkb25lLCBwcmVzdW1hYmx5IHdlIHF1ZXVlZCB1cCBzb21lIGxpdmUgZXZlbnRzLFxuICAgICAgICAgICAgLy8gY29tbWl0IHRoZW0gbm93LlxuICAgICAgICAgICAgYXdhaXQgaW5kZXhNYW5hZ2VyLmNvbW1pdExpdmVFdmVudHMoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKlxuICAgICAqIFRoZSBSb29tLnRpbWVsaW5lIGxpc3RlbmVyLlxuICAgICAqXG4gICAgICogVGhpcyBsaXN0ZW5lciB3YWl0cyBmb3IgbGl2ZSBldmVudHMgaW4gZW5jcnlwdGVkIHJvb21zLCBpZiB0aGV5IGFyZVxuICAgICAqIGRlY3J5cHRlZCBvciB1bmVuY3J5cHRlZCB3ZSBxdWV1ZSB0aGVtIHRvIGJlIGFkZGVkIHRvIHRoZSBpbmRleCxcbiAgICAgKiBvdGhlcndpc2Ugd2Ugc2F2ZSB0aGVpciBldmVudCBpZCBhbmQgd2FpdCBmb3IgdGhlbSBpbiB0aGUgRXZlbnQuZGVjcnlwdGVkXG4gICAgICogbGlzdGVuZXIuXG4gICAgICovXG4gICAgcHJpdmF0ZSBvblJvb21UaW1lbGluZSA9IGFzeW5jIChcbiAgICAgICAgZXY6IE1hdHJpeEV2ZW50LFxuICAgICAgICByb29tOiBSb29tIHwgbnVsbCxcbiAgICAgICAgdG9TdGFydE9mVGltZWxpbmU6IGJvb2xlYW4sXG4gICAgICAgIHJlbW92ZWQ6IGJvb2xlYW4sXG4gICAgICAgIGRhdGE6IElSb29tVGltZWxpbmVEYXRhLFxuICAgICkgPT4ge1xuICAgICAgICBpZiAoIXJvb20pIHJldHVybjsgLy8gbm90aWZpY2F0aW9uIHRpbWVsaW5lLCB3ZSdsbCBnZXQgdGhpcyBldmVudCBhZ2FpbiB3aXRoIGEgcm9vbSBzcGVjaWZpYyB0aW1lbGluZVxuXG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcblxuICAgICAgICAvLyBXZSBvbmx5IGluZGV4IGVuY3J5cHRlZCByb29tcyBsb2NhbGx5LlxuICAgICAgICBpZiAoIWNsaWVudC5pc1Jvb21FbmNyeXB0ZWQoZXYuZ2V0Um9vbUlkKCkpKSByZXR1cm47XG5cbiAgICAgICAgaWYgKGV2LmlzUmVkYWN0aW9uKCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlZGFjdEV2ZW50KGV2KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIGl0IGlzbid0IGEgbGl2ZSBldmVudCBvciBpZiBpdCdzIHJlZGFjdGVkIHRoZXJlJ3Mgbm90aGluZyB0byBkby5cbiAgICAgICAgaWYgKHRvU3RhcnRPZlRpbWVsaW5lIHx8ICFkYXRhIHx8ICFkYXRhLmxpdmVFdmVudCB8fCBldi5pc1JlZGFjdGVkKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IGNsaWVudC5kZWNyeXB0RXZlbnRJZk5lZWRlZChldik7XG5cbiAgICAgICAgYXdhaXQgdGhpcy5hZGRMaXZlRXZlbnRUb0luZGV4KGV2KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJvb21TdGF0ZUV2ZW50ID0gYXN5bmMgKGV2OiBNYXRyaXhFdmVudCwgc3RhdGU6IFJvb21TdGF0ZSkgPT4ge1xuICAgICAgICBpZiAoIU1hdHJpeENsaWVudFBlZy5nZXQoKS5pc1Jvb21FbmNyeXB0ZWQoc3RhdGUucm9vbUlkKSkgcmV0dXJuO1xuXG4gICAgICAgIGlmIChldi5nZXRUeXBlKCkgPT09IEV2ZW50VHlwZS5Sb29tRW5jcnlwdGlvbiAmJiAhKGF3YWl0IHRoaXMuaXNSb29tSW5kZXhlZChzdGF0ZS5yb29tSWQpKSkge1xuICAgICAgICAgICAgbG9nZ2VyLmxvZyhcIkV2ZW50SW5kZXg6IEFkZGluZyBhIGNoZWNrcG9pbnQgZm9yIGEgbmV3bHkgZW5jcnlwdGVkIHJvb21cIiwgc3RhdGUucm9vbUlkKTtcbiAgICAgICAgICAgIHRoaXMuYWRkUm9vbUNoZWNrcG9pbnQoc3RhdGUucm9vbUlkLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKlxuICAgICAqIFJlbW92ZXMgYSByZWRhY3RlZCBldmVudCBmcm9tIG91ciBldmVudCBpbmRleC5cbiAgICAgKiBXZSBjYW5ub3QgcmVseSBvbiBSb29tLnJlZGFjdGlvbiBhcyB0aGlzIG9ubHkgZmlyZXMgaWYgdGhlIHJlZGFjdGlvbiBhcHBsaWVkIHRvIGFuIGV2ZW50IHRoZSBqcy1zZGsgaGFzIGxvYWRlZC5cbiAgICAgKi9cbiAgICBwcml2YXRlIHJlZGFjdEV2ZW50ID0gYXN5bmMgKGV2OiBNYXRyaXhFdmVudCkgPT4ge1xuICAgICAgICBjb25zdCBpbmRleE1hbmFnZXIgPSBQbGF0Zm9ybVBlZy5nZXQoKS5nZXRFdmVudEluZGV4aW5nTWFuYWdlcigpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBpbmRleE1hbmFnZXIuZGVsZXRlRXZlbnQoZXYuZ2V0QXNzb2NpYXRlZElkKCkpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBsb2dnZXIubG9nKFwiRXZlbnRJbmRleDogRXJyb3IgZGVsZXRpbmcgZXZlbnQgZnJvbSBpbmRleFwiLCBlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKlxuICAgICAqIFRoZSBSb29tLnRpbWVsaW5lUmVzZXQgbGlzdGVuZXIuXG4gICAgICpcbiAgICAgKiBMaXN0ZW5zIGZvciB0aW1lbGluZSByZXNldHMgdGhhdCBhcmUgY2F1c2VkIGJ5IGEgbGltaXRlZCB0aW1lbGluZSB0b1xuICAgICAqIHJlLWFkZCBjaGVja3BvaW50cyBmb3Igcm9vbXMgdGhhdCBuZWVkIHRvIGJlIGNyYXdsZWQgYWdhaW4uXG4gICAgICovXG4gICAgcHJpdmF0ZSBvblRpbWVsaW5lUmVzZXQgPSBhc3luYyAocm9vbTogUm9vbSwgdGltZWxpbmVTZXQ6IEV2ZW50VGltZWxpbmVTZXQsIHJlc2V0QWxsVGltZWxpbmVzOiBib29sZWFuKSA9PiB7XG4gICAgICAgIGlmIChyb29tID09PSBudWxsKSByZXR1cm47XG4gICAgICAgIGlmICghTWF0cml4Q2xpZW50UGVnLmdldCgpLmlzUm9vbUVuY3J5cHRlZChyb29tLnJvb21JZCkpIHJldHVybjtcblxuICAgICAgICBsb2dnZXIubG9nKFwiRXZlbnRJbmRleDogQWRkaW5nIGEgY2hlY2twb2ludCBiZWNhdXNlIG9mIGEgbGltaXRlZCB0aW1lbGluZVwiLFxuICAgICAgICAgICAgcm9vbS5yb29tSWQpO1xuXG4gICAgICAgIHRoaXMuYWRkUm9vbUNoZWNrcG9pbnQocm9vbS5yb29tSWQsIGZhbHNlKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgYW4gZXZlbnQgc2hvdWxkIGJlIGFkZGVkIHRvIHRoZSBldmVudCBpbmRleC5cbiAgICAgKlxuICAgICAqIE1vc3Qgbm90YWJseSB3ZSBmaWx0ZXIgZXZlbnRzIGZvciB3aGljaCBkZWNyeXB0aW9uIGZhaWxlZCwgYXJlIHJlZGFjdGVkXG4gICAgICogb3IgYXJlbid0IG9mIGEgdHlwZSB0aGF0IHdlIGtub3cgaG93IHRvIGluZGV4LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtNYXRyaXhFdmVudH0gZXYgVGhlIGV2ZW50IHRoYXQgc2hvdWxkIGJlIGNoZWNrZWQuXG4gICAgICogQHJldHVybnMge2Jvb2x9IFJldHVybnMgdHJ1ZSBpZiB0aGUgZXZlbnQgY2FuIGJlIGluZGV4ZWQsIGZhbHNlXG4gICAgICogb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIHByaXZhdGUgaXNWYWxpZEV2ZW50KGV2OiBNYXRyaXhFdmVudCk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBpc1VzZWZ1bFR5cGUgPSBbXG4gICAgICAgICAgICBFdmVudFR5cGUuUm9vbU1lc3NhZ2UsXG4gICAgICAgICAgICBFdmVudFR5cGUuUm9vbU5hbWUsXG4gICAgICAgICAgICBFdmVudFR5cGUuUm9vbVRvcGljLFxuICAgICAgICBdLmluY2x1ZGVzKGV2LmdldFR5cGUoKSBhcyBFdmVudFR5cGUpO1xuICAgICAgICBjb25zdCB2YWxpZEV2ZW50VHlwZSA9IGlzVXNlZnVsVHlwZSAmJiAhZXYuaXNSZWRhY3RlZCgpICYmICFldi5pc0RlY3J5cHRpb25GYWlsdXJlKCk7XG5cbiAgICAgICAgbGV0IHZhbGlkTXNnVHlwZSA9IHRydWU7XG4gICAgICAgIGxldCBoYXNDb250ZW50VmFsdWUgPSB0cnVlO1xuXG4gICAgICAgIGlmIChldi5nZXRUeXBlKCkgPT09IEV2ZW50VHlwZS5Sb29tTWVzc2FnZSAmJiAhZXYuaXNSZWRhY3RlZCgpKSB7XG4gICAgICAgICAgICAvLyBFeHBhbmQgdGhpcyBpZiB0aGVyZSBhcmUgbW9yZSBpbnZhbGlkIG1zZ3R5cGVzLlxuICAgICAgICAgICAgY29uc3QgbXNndHlwZSA9IGV2LmdldENvbnRlbnQoKS5tc2d0eXBlO1xuXG4gICAgICAgICAgICBpZiAoIW1zZ3R5cGUpIHZhbGlkTXNnVHlwZSA9IGZhbHNlO1xuICAgICAgICAgICAgZWxzZSB2YWxpZE1zZ1R5cGUgPSAhbXNndHlwZS5zdGFydHNXaXRoKFwibS5rZXkudmVyaWZpY2F0aW9uXCIpO1xuXG4gICAgICAgICAgICBpZiAoIWV2LmdldENvbnRlbnQoKS5ib2R5KSBoYXNDb250ZW50VmFsdWUgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmIChldi5nZXRUeXBlKCkgPT09IEV2ZW50VHlwZS5Sb29tVG9waWMgJiYgIWV2LmlzUmVkYWN0ZWQoKSkge1xuICAgICAgICAgICAgaWYgKCFldi5nZXRDb250ZW50KCkudG9waWMpIGhhc0NvbnRlbnRWYWx1ZSA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKGV2LmdldFR5cGUoKSA9PT0gRXZlbnRUeXBlLlJvb21OYW1lICYmICFldi5pc1JlZGFjdGVkKCkpIHtcbiAgICAgICAgICAgIGlmICghZXYuZ2V0Q29udGVudCgpLm5hbWUpIGhhc0NvbnRlbnRWYWx1ZSA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZhbGlkRXZlbnRUeXBlICYmIHZhbGlkTXNnVHlwZSAmJiBoYXNDb250ZW50VmFsdWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBldmVudFRvSnNvbihldjogTWF0cml4RXZlbnQpIHtcbiAgICAgICAgY29uc3QganNvbkV2ZW50OiBhbnkgPSBldi50b0pTT04oKTtcbiAgICAgICAgY29uc3QgZSA9IGV2LmlzRW5jcnlwdGVkKCkgPyBqc29uRXZlbnQuZGVjcnlwdGVkIDoganNvbkV2ZW50O1xuXG4gICAgICAgIGlmIChldi5pc0VuY3J5cHRlZCgpKSB7XG4gICAgICAgICAgICAvLyBMZXQgdXMgc3RvcmUgc29tZSBhZGRpdGlvbmFsIGRhdGEgc28gd2UgY2FuIHJlLXZlcmlmeSB0aGUgZXZlbnQuXG4gICAgICAgICAgICAvLyBUaGUganMtc2RrIGNoZWNrcyBpZiBhbiBldmVudCBpcyBlbmNyeXB0ZWQgdXNpbmcgdGhlIGFsZ29yaXRobSxcbiAgICAgICAgICAgIC8vIHRoZSBzZW5kZXIga2V5IGFuZCBlZDI1NTE5IHNpZ25pbmcga2V5IGFyZSB1c2VkIHRvIGZpbmQgdGhlXG4gICAgICAgICAgICAvLyBjb3JyZWN0IGRldmljZSB0aGF0IHNlbnQgdGhlIGV2ZW50IHdoaWNoIGFsbG93cyB1cyB0byBjaGVjayB0aGVcbiAgICAgICAgICAgIC8vIHZlcmlmaWNhdGlvbiBzdGF0ZSBvZiB0aGUgZXZlbnQsIGVpdGhlciBkaXJlY3RseSBvciB1c2luZyBjcm9zc1xuICAgICAgICAgICAgLy8gc2lnbmluZy5cbiAgICAgICAgICAgIGUuY3VydmUyNTUxOUtleSA9IGV2LmdldFNlbmRlcktleSgpO1xuICAgICAgICAgICAgZS5lZDI1NTE5S2V5ID0gZXYuZ2V0Q2xhaW1lZEVkMjU1MTlLZXkoKTtcbiAgICAgICAgICAgIGUuYWxnb3JpdGhtID0gZXYuZ2V0V2lyZUNvbnRlbnQoKS5hbGdvcml0aG07XG4gICAgICAgICAgICBlLmZvcndhcmRpbmdDdXJ2ZTI1NTE5S2V5Q2hhaW4gPSBldi5nZXRGb3J3YXJkaW5nQ3VydmUyNTUxOUtleUNoYWluKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhhdCB1bmVuY3J5cHRlZCBldmVudHMgZG9uJ3QgY29udGFpbiBhbnkgb2YgdGhhdCBkYXRhLFxuICAgICAgICAgICAgLy8gZGVzcGl0ZSB3aGF0IHRoZSBzZXJ2ZXIgbWlnaHQgZ2l2ZSB0byB1cy5cbiAgICAgICAgICAgIGRlbGV0ZSBlLmN1cnZlMjU1MTlLZXk7XG4gICAgICAgICAgICBkZWxldGUgZS5lZDI1NTE5S2V5O1xuICAgICAgICAgICAgZGVsZXRlIGUuYWxnb3JpdGhtO1xuICAgICAgICAgICAgZGVsZXRlIGUuZm9yd2FyZGluZ0N1cnZlMjU1MTlLZXlDaGFpbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFF1ZXVlIHVwIGxpdmUgZXZlbnRzIHRvIGJlIGFkZGVkIHRvIHRoZSBldmVudCBpbmRleC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7TWF0cml4RXZlbnR9IGV2IFRoZSBldmVudCB0aGF0IHNob3VsZCBiZSBhZGRlZCB0byB0aGUgaW5kZXguXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBhZGRMaXZlRXZlbnRUb0luZGV4KGV2OiBNYXRyaXhFdmVudCkge1xuICAgICAgICBjb25zdCBpbmRleE1hbmFnZXIgPSBQbGF0Zm9ybVBlZy5nZXQoKS5nZXRFdmVudEluZGV4aW5nTWFuYWdlcigpO1xuXG4gICAgICAgIGlmICghdGhpcy5pc1ZhbGlkRXZlbnQoZXYpKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgZSA9IHRoaXMuZXZlbnRUb0pzb24oZXYpO1xuXG4gICAgICAgIGNvbnN0IHByb2ZpbGUgPSB7XG4gICAgICAgICAgICBkaXNwbGF5bmFtZTogZXYuc2VuZGVyLnJhd0Rpc3BsYXlOYW1lLFxuICAgICAgICAgICAgYXZhdGFyX3VybDogZXYuc2VuZGVyLmdldE14Y0F2YXRhclVybCgpLFxuICAgICAgICB9O1xuXG4gICAgICAgIGF3YWl0IGluZGV4TWFuYWdlci5hZGRFdmVudFRvSW5kZXgoZSwgcHJvZmlsZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRW1taXQgdGhhdCB0aGUgY3Jhd2xlciBoYXMgY2hhbmdlZCB0aGUgY2hlY2twb2ludCB0aGF0IGl0J3MgY3VycmVudGx5XG4gICAgICogaGFuZGxpbmcuXG4gICAgICovXG4gICAgcHJpdmF0ZSBlbWl0TmV3Q2hlY2twb2ludCgpIHtcbiAgICAgICAgdGhpcy5lbWl0KFwiY2hhbmdlZENoZWNrcG9pbnRcIiwgdGhpcy5jdXJyZW50Um9vbSgpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGFkZEV2ZW50c0Zyb21MaXZlVGltZWxpbmUodGltZWxpbmU6IEV2ZW50VGltZWxpbmUpIHtcbiAgICAgICAgY29uc3QgZXZlbnRzID0gdGltZWxpbmUuZ2V0RXZlbnRzKCk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGV2ID0gZXZlbnRzW2ldO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5hZGRMaXZlRXZlbnRUb0luZGV4KGV2KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgYWRkUm9vbUNoZWNrcG9pbnQocm9vbUlkOiBzdHJpbmcsIGZ1bGxDcmF3bCA9IGZhbHNlKSB7XG4gICAgICAgIGNvbnN0IGluZGV4TWFuYWdlciA9IFBsYXRmb3JtUGVnLmdldCgpLmdldEV2ZW50SW5kZXhpbmdNYW5hZ2VyKCk7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3Qgcm9vbSA9IGNsaWVudC5nZXRSb29tKHJvb21JZCk7XG5cbiAgICAgICAgaWYgKCFyb29tKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgdGltZWxpbmUgPSByb29tLmdldExpdmVUaW1lbGluZSgpO1xuICAgICAgICBjb25zdCB0b2tlbiA9IHRpbWVsaW5lLmdldFBhZ2luYXRpb25Ub2tlbihEaXJlY3Rpb24uQmFja3dhcmQpO1xuXG4gICAgICAgIGlmICghdG9rZW4pIHtcbiAgICAgICAgICAgIC8vIFRoZSByb29tIGRvZXNuJ3QgY29udGFpbiBhbnkgdG9rZW5zLCBtZWFuaW5nIHRoZSBsaXZlIHRpbWVsaW5lXG4gICAgICAgICAgICAvLyBjb250YWlucyBhbGwgdGhlIGV2ZW50cywgYWRkIHRob3NlIHRvIHRoZSBpbmRleC5cbiAgICAgICAgICAgIGF3YWl0IHRoaXMuYWRkRXZlbnRzRnJvbUxpdmVUaW1lbGluZSh0aW1lbGluZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjaGVja3BvaW50ID0ge1xuICAgICAgICAgICAgcm9vbUlkOiByb29tLnJvb21JZCxcbiAgICAgICAgICAgIHRva2VuOiB0b2tlbixcbiAgICAgICAgICAgIGZ1bGxDcmF3bDogZnVsbENyYXdsLFxuICAgICAgICAgICAgZGlyZWN0aW9uOiBEaXJlY3Rpb24uQmFja3dhcmQsXG4gICAgICAgIH07XG5cbiAgICAgICAgbG9nZ2VyLmxvZyhcIkV2ZW50SW5kZXg6IEFkZGluZyBjaGVja3BvaW50XCIsIGNoZWNrcG9pbnQpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBpbmRleE1hbmFnZXIuYWRkQ3Jhd2xlckNoZWNrcG9pbnQoY2hlY2twb2ludCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGxvZ2dlci5sb2coXG4gICAgICAgICAgICAgICAgXCJFdmVudEluZGV4OiBFcnJvciBhZGRpbmcgbmV3IGNoZWNrcG9pbnQgZm9yIHJvb21cIixcbiAgICAgICAgICAgICAgICByb29tLnJvb21JZCxcbiAgICAgICAgICAgICAgICBjaGVja3BvaW50LFxuICAgICAgICAgICAgICAgIGUsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jcmF3bGVyQ2hlY2twb2ludHMucHVzaChjaGVja3BvaW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbWFpbiBjcmF3bGVyIGxvb3AuXG4gICAgICpcbiAgICAgKiBHb2VzIHRocm91Z2ggY3Jhd2xlckNoZWNrcG9pbnRzIGFuZCBmZXRjaGVzIGV2ZW50cyBmcm9tIHRoZSBzZXJ2ZXIgdG8gYmVcbiAgICAgKiBhZGRlZCB0byB0aGUgRXZlbnRJbmRleC5cbiAgICAgKlxuICAgICAqIElmIGEgL3Jvb20ve3Jvb21JZH0vbWVzc2FnZXMgcmVxdWVzdCBkb2Vzbid0IGNvbnRhaW4gYW55IGV2ZW50cywgc3RvcCB0aGVcbiAgICAgKiBjcmF3bCwgb3RoZXJ3aXNlIGNyZWF0ZSBhIG5ldyBjaGVja3BvaW50IGFuZCBwdXNoIGl0IHRvIHRoZVxuICAgICAqIGNyYXdsZXJDaGVja3BvaW50cyBxdWV1ZSwgc28gd2UgZ28gdGhyb3VnaCB0aGVtIGluIGEgcm91bmQtcm9iaW4gd2F5LlxuICAgICAqL1xuICAgIHByaXZhdGUgYXN5bmMgY3Jhd2xlckZ1bmMoKSB7XG4gICAgICAgIGxldCBjYW5jZWxsZWQgPSBmYWxzZTtcblxuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IGluZGV4TWFuYWdlciA9IFBsYXRmb3JtUGVnLmdldCgpLmdldEV2ZW50SW5kZXhpbmdNYW5hZ2VyKCk7XG5cbiAgICAgICAgdGhpcy5jcmF3bGVyID0ge1xuICAgICAgICAgICAgY2FuY2VsOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY2FuY2VsbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGlkbGUgPSBmYWxzZTtcblxuICAgICAgICB3aGlsZSAoIWNhbmNlbGxlZCkge1xuICAgICAgICAgICAgbGV0IHNsZWVwVGltZSA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWVBdChTZXR0aW5nTGV2ZWwuREVWSUNFLCAnY3Jhd2xlclNsZWVwVGltZScpO1xuXG4gICAgICAgICAgICAvLyBEb24ndCBsZXQgdGhlIHVzZXIgY29uZmlndXJlIGEgbG93ZXIgc2xlZXAgdGltZSB0aGFuIDEwMCBtcy5cbiAgICAgICAgICAgIHNsZWVwVGltZSA9IE1hdGgubWF4KHNsZWVwVGltZSwgMTAwKTtcblxuICAgICAgICAgICAgaWYgKGlkbGUpIHtcbiAgICAgICAgICAgICAgICBzbGVlcFRpbWUgPSBDUkFXTEVSX0lETEVfVElNRTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudENoZWNrcG9pbnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRDaGVja3BvaW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXROZXdDaGVja3BvaW50KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGF3YWl0IHNsZWVwKHNsZWVwVGltZSk7XG5cbiAgICAgICAgICAgIGlmIChjYW5jZWxsZWQpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgY2hlY2twb2ludCA9IHRoaXMuY3Jhd2xlckNoZWNrcG9pbnRzLnNoaWZ0KCk7XG5cbiAgICAgICAgICAgIC8vLyBUaGVyZSBpcyBubyBjaGVja3BvaW50IGF2YWlsYWJsZSBjdXJyZW50bHksIG9uZSBtYXkgYXBwZWFyIGlmXG4gICAgICAgICAgICAvLyBhIHN5bmMgd2l0aCBsaW1pdGVkIHJvb20gdGltZWxpbmVzIGhhcHBlbnMsIHNvIGdvIGJhY2sgdG8gc2xlZXAuXG4gICAgICAgICAgICBpZiAoY2hlY2twb2ludCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgaWRsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuY3VycmVudENoZWNrcG9pbnQgPSBjaGVja3BvaW50O1xuICAgICAgICAgICAgdGhpcy5lbWl0TmV3Q2hlY2twb2ludCgpO1xuXG4gICAgICAgICAgICBpZGxlID0gZmFsc2U7XG5cbiAgICAgICAgICAgIC8vIFdlIGhhdmUgYSBjaGVja3BvaW50LCBsZXQgdXMgZmV0Y2ggc29tZSBtZXNzYWdlcywgYWdhaW4sIHZlcnlcbiAgICAgICAgICAgIC8vIGNvbnNlcnZhdGl2ZWx5IHRvIG5vdCBib3RoZXIgb3VyIGhvbWVzZXJ2ZXIgdG9vIG11Y2guXG4gICAgICAgICAgICBjb25zdCBldmVudE1hcHBlciA9IGNsaWVudC5nZXRFdmVudE1hcHBlcih7IHByZXZlbnRSZUVtaXQ6IHRydWUgfSk7XG4gICAgICAgICAgICAvLyBUT0RPIHdlIG5lZWQgdG8gZW5zdXJlIHRvIHVzZSBtZW1iZXIgbGF6eSBsb2FkaW5nIHdpdGggdGhpc1xuICAgICAgICAgICAgLy8gcmVxdWVzdCBzbyB3ZSBnZXQgdGhlIGNvcnJlY3QgcHJvZmlsZXMuXG4gICAgICAgICAgICBsZXQgcmVzOiBBd2FpdGVkPFJldHVyblR5cGU8TWF0cml4Q2xpZW50W1wiY3JlYXRlTWVzc2FnZXNSZXF1ZXN0XCJdPj47XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmVzID0gYXdhaXQgY2xpZW50LmNyZWF0ZU1lc3NhZ2VzUmVxdWVzdChcbiAgICAgICAgICAgICAgICAgICAgY2hlY2twb2ludC5yb29tSWQsXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrcG9pbnQudG9rZW4sXG4gICAgICAgICAgICAgICAgICAgIEVWRU5UU19QRVJfQ1JBV0wsXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrcG9pbnQuZGlyZWN0aW9uLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGUuaHR0cFN0YXR1cyA9PT0gNDAzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5sb2coXCJFdmVudEluZGV4OiBSZW1vdmluZyBjaGVja3BvaW50IGFzIHdlIGRvbid0IGhhdmUgXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInBlcm1pc3Npb25zIHRvIGZldGNoIG1lc3NhZ2VzIGZyb20gdGhpcyByb29tLlwiLCBjaGVja3BvaW50KTtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGluZGV4TWFuYWdlci5yZW1vdmVDcmF3bGVyQ2hlY2twb2ludChjaGVja3BvaW50KTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmxvZyhcIkV2ZW50SW5kZXg6IEVycm9yIHJlbW92aW5nIGNoZWNrcG9pbnRcIiwgY2hlY2twb2ludCwgZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBkb24ndCBwdXNoIHRoZSBjaGVja3BvaW50IGhlcmUgYmFjaywgaXQgd2lsbFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaG9wZWZ1bGx5IGJlIHJlbW92ZWQgYWZ0ZXIgYSByZXN0YXJ0LiBCdXQgbGV0IHVzXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZ25vcmUgaXQgZm9yIG5vdyBhcyB3ZSBkb24ndCB3YW50IHRvIGhhbW1lciB0aGVcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVuZHBvaW50LlxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxvZ2dlci5sb2coXCJFdmVudEluZGV4OiBFcnJvciBjcmF3bGluZyB1c2luZyBjaGVja3BvaW50OlwiLCBjaGVja3BvaW50LCBcIixcIiwgZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jcmF3bGVyQ2hlY2twb2ludHMucHVzaChjaGVja3BvaW50KTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNhbmNlbGxlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY3Jhd2xlckNoZWNrcG9pbnRzLnB1c2goY2hlY2twb2ludCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChyZXMuY2h1bmsubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmxvZyhcIkV2ZW50SW5kZXg6IERvbmUgd2l0aCB0aGUgY2hlY2twb2ludFwiLCBjaGVja3BvaW50KTtcbiAgICAgICAgICAgICAgICAvLyBXZSBnb3QgdG8gdGhlIHN0YXJ0L2VuZCBvZiBvdXIgdGltZWxpbmUsIGxldHMganVzdFxuICAgICAgICAgICAgICAgIC8vIGRlbGV0ZSBvdXIgY2hlY2twb2ludCBhbmQgZ28gYmFjayB0byBzbGVlcC5cbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBpbmRleE1hbmFnZXIucmVtb3ZlQ3Jhd2xlckNoZWNrcG9pbnQoY2hlY2twb2ludCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIubG9nKFwiRXZlbnRJbmRleDogRXJyb3IgcmVtb3ZpbmcgY2hlY2twb2ludFwiLCBjaGVja3BvaW50LCBlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENvbnZlcnQgdGhlIHBsYWluIEpTT04gZXZlbnRzIGludG8gTWF0cml4IGV2ZW50cyBzbyB0aGV5IGdldFxuICAgICAgICAgICAgLy8gZGVjcnlwdGVkIGlmIG5lY2Vzc2FyeS5cbiAgICAgICAgICAgIGNvbnN0IG1hdHJpeEV2ZW50cyA9IHJlcy5jaHVuay5tYXAoZXZlbnRNYXBwZXIpO1xuICAgICAgICAgICAgbGV0IHN0YXRlRXZlbnRzID0gW107XG4gICAgICAgICAgICBpZiAocmVzLnN0YXRlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBzdGF0ZUV2ZW50cyA9IHJlcy5zdGF0ZS5tYXAoZXZlbnRNYXBwZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBwcm9maWxlcyA9IHt9O1xuXG4gICAgICAgICAgICBzdGF0ZUV2ZW50cy5mb3JFYWNoKGV2ID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXYuZXZlbnQuY29udGVudCAmJlxuICAgICAgICAgICAgICAgICAgICBldi5ldmVudC5jb250ZW50Lm1lbWJlcnNoaXAgPT09IFwiam9pblwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb2ZpbGVzW2V2LmV2ZW50LnNlbmRlcl0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5bmFtZTogZXYuZXZlbnQuY29udGVudC5kaXNwbGF5bmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2YXRhcl91cmw6IGV2LmV2ZW50LmNvbnRlbnQuYXZhdGFyX3VybCxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29uc3QgZGVjcnlwdGlvblByb21pc2VzID0gbWF0cml4RXZlbnRzXG4gICAgICAgICAgICAgICAgLmZpbHRlcihldmVudCA9PiBldmVudC5pc0VuY3J5cHRlZCgpKVxuICAgICAgICAgICAgICAgIC5tYXAoZXZlbnQgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2xpZW50LmRlY3J5cHRFdmVudElmTmVlZGVkKGV2ZW50LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpc1JldHJ5OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZW1pdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBMZXQgdXMgd2FpdCBmb3IgYWxsIHRoZSBldmVudHMgdG8gZ2V0IGRlY3J5cHRlZC5cbiAgICAgICAgICAgIGF3YWl0IFByb21pc2UuYWxsKGRlY3J5cHRpb25Qcm9taXNlcyk7XG5cbiAgICAgICAgICAgIC8vIFRPRE8gaWYgdGhlcmUgYXJlIG5vIGV2ZW50cyBhdCB0aGlzIHBvaW50IHdlJ3JlIG1pc3NpbmcgYSBsb3RcbiAgICAgICAgICAgIC8vIGRlY3J5cHRpb24ga2V5cywgZG8gd2Ugd2FudCB0byByZXRyeSB0aGlzIGNoZWNrcG9pbnQgYXQgYSBsYXRlclxuICAgICAgICAgICAgLy8gc3RhZ2U/XG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJlZEV2ZW50cyA9IG1hdHJpeEV2ZW50cy5maWx0ZXIodGhpcy5pc1ZhbGlkRXZlbnQpO1xuXG4gICAgICAgICAgICAvLyBDb2xsZWN0IHRoZSByZWRhY3Rpb24gZXZlbnRzLCBzbyB3ZSBjYW4gZGVsZXRlIHRoZSByZWRhY3RlZCBldmVudHMgZnJvbSB0aGUgaW5kZXguXG4gICAgICAgICAgICBjb25zdCByZWRhY3Rpb25FdmVudHMgPSBtYXRyaXhFdmVudHMuZmlsdGVyKGV2ID0+IGV2LmlzUmVkYWN0aW9uKCkpO1xuXG4gICAgICAgICAgICAvLyBMZXQgdXMgY29udmVydCB0aGUgZXZlbnRzIGJhY2sgaW50byBhIGZvcm1hdCB0aGF0IEV2ZW50SW5kZXggY2FuXG4gICAgICAgICAgICAvLyBjb25zdW1lLlxuICAgICAgICAgICAgY29uc3QgZXZlbnRzID0gZmlsdGVyZWRFdmVudHMubWFwKChldikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGUgPSB0aGlzLmV2ZW50VG9Kc29uKGV2KTtcblxuICAgICAgICAgICAgICAgIGxldCBwcm9maWxlID0ge307XG4gICAgICAgICAgICAgICAgaWYgKGUuc2VuZGVyIGluIHByb2ZpbGVzKSBwcm9maWxlID0gcHJvZmlsZXNbZS5zZW5kZXJdO1xuICAgICAgICAgICAgICAgIGNvbnN0IG9iamVjdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IGUsXG4gICAgICAgICAgICAgICAgICAgIHByb2ZpbGU6IHByb2ZpbGUsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqZWN0O1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxldCBuZXdDaGVja3BvaW50O1xuXG4gICAgICAgICAgICAvLyBUaGUgdG9rZW4gY2FuIGJlIG51bGwgZm9yIHNvbWUgcmVhc29uLiBEb24ndCBjcmVhdGUgYSBjaGVja3BvaW50XG4gICAgICAgICAgICAvLyBpbiB0aGF0IGNhc2Ugc2luY2UgYWRkaW5nIGl0IHRvIHRoZSBkYiB3aWxsIGZhaWwuXG4gICAgICAgICAgICBpZiAocmVzLmVuZCkge1xuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBhIG5ldyBjaGVja3BvaW50IHNvIHdlIGNhbiBjb250aW51ZSBjcmF3bGluZyB0aGUgcm9vbVxuICAgICAgICAgICAgICAgIC8vIGZvciBtZXNzYWdlcy5cbiAgICAgICAgICAgICAgICBuZXdDaGVja3BvaW50ID0ge1xuICAgICAgICAgICAgICAgICAgICByb29tSWQ6IGNoZWNrcG9pbnQucm9vbUlkLFxuICAgICAgICAgICAgICAgICAgICB0b2tlbjogcmVzLmVuZCxcbiAgICAgICAgICAgICAgICAgICAgZnVsbENyYXdsOiBjaGVja3BvaW50LmZ1bGxDcmF3bCxcbiAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uOiBjaGVja3BvaW50LmRpcmVjdGlvbixcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVkYWN0aW9uRXZlbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGV2ID0gcmVkYWN0aW9uRXZlbnRzW2ldO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBldmVudElkID0gZXYuZ2V0QXNzb2NpYXRlZElkKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50SWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IGluZGV4TWFuYWdlci5kZWxldGVFdmVudChldmVudElkKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci53YXJuKFwiRXZlbnRJbmRleDogUmVkYWN0aW9uIGV2ZW50IGRvZXNuJ3QgY29udGFpbiBhIHZhbGlkIGFzc29jaWF0ZWQgZXZlbnQgaWRcIiwgZXYpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnRzQWxyZWFkeUFkZGVkID0gYXdhaXQgaW5kZXhNYW5hZ2VyLmFkZEhpc3RvcmljRXZlbnRzKFxuICAgICAgICAgICAgICAgICAgICBldmVudHMsIG5ld0NoZWNrcG9pbnQsIGNoZWNrcG9pbnQpO1xuXG4gICAgICAgICAgICAgICAgLy8gV2UgZGlkbid0IGdldCBhIHZhbGlkIG5ldyBjaGVja3BvaW50IGZyb20gdGhlIHNlcnZlciwgbm90aGluZ1xuICAgICAgICAgICAgICAgIC8vIHRvIGRvIGhlcmUgYW55bW9yZS5cbiAgICAgICAgICAgICAgICBpZiAoIW5ld0NoZWNrcG9pbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmxvZyhcIkV2ZW50SW5kZXg6IFRoZSBzZXJ2ZXIgZGlkbid0IHJldHVybiBhIHZhbGlkIFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJuZXcgY2hlY2twb2ludCwgbm90IGNvbnRpbnVpbmcgdGhlIGNyYXdsLlwiLCBjaGVja3BvaW50KTtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gSWYgYWxsIGV2ZW50cyB3ZXJlIGFscmVhZHkgaW5kZXhlZCB3ZSBhc3N1bWUgdGhhdCB3ZSBjYXVnaHRcbiAgICAgICAgICAgICAgICAvLyB1cCB3aXRoIG91ciBpbmRleCBhbmQgZG9uJ3QgbmVlZCB0byBjcmF3bCB0aGUgcm9vbSBmdXJ0aGVyLlxuICAgICAgICAgICAgICAgIC8vIExldCB1cyBkZWxldGUgdGhlIGNoZWNrcG9pbnQgaW4gdGhhdCBjYXNlLCBvdGhlcndpc2UgcHVzaFxuICAgICAgICAgICAgICAgIC8vIHRoZSBuZXcgY2hlY2twb2ludCB0byBiZSB1c2VkIGJ5IHRoZSBjcmF3bGVyLlxuICAgICAgICAgICAgICAgIGlmIChldmVudHNBbHJlYWR5QWRkZWQgPT09IHRydWUgJiYgbmV3Q2hlY2twb2ludC5mdWxsQ3Jhd2wgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmxvZyhcIkV2ZW50SW5kZXg6IENoZWNrcG9pbnQgaGFkIGFscmVhZHkgYWxsIGV2ZW50c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJhZGRlZCwgc3RvcHBpbmcgdGhlIGNyYXdsXCIsIGNoZWNrcG9pbnQpO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBpbmRleE1hbmFnZXIucmVtb3ZlQ3Jhd2xlckNoZWNrcG9pbnQobmV3Q2hlY2twb2ludCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50c0FscmVhZHlBZGRlZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmxvZyhcIkV2ZW50SW5kZXg6IENoZWNrcG9pbnQgaGFkIGFscmVhZHkgYWxsIGV2ZW50c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWRkZWQsIGJ1dCBjb250aW51aW5nIGR1ZSB0byBhIGZ1bGwgY3Jhd2xcIiwgY2hlY2twb2ludCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcmF3bGVyQ2hlY2twb2ludHMucHVzaChuZXdDaGVja3BvaW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmxvZyhcIkV2ZW50SW5kZXg6IEVycm9yIGR1cmluZyBhIGNyYXdsXCIsIGUpO1xuICAgICAgICAgICAgICAgIC8vIEFuIGVycm9yIG9jY3VycmVkLCBwdXQgdGhlIGNoZWNrcG9pbnQgYmFjayBzbyB3ZVxuICAgICAgICAgICAgICAgIC8vIGNhbiByZXRyeS5cbiAgICAgICAgICAgICAgICB0aGlzLmNyYXdsZXJDaGVja3BvaW50cy5wdXNoKGNoZWNrcG9pbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jcmF3bGVyID0gbnVsbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdGFydCB0aGUgY3Jhd2xlciBiYWNrZ3JvdW5kIHRhc2suXG4gICAgICovXG4gICAgcHVibGljIHN0YXJ0Q3Jhd2xlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuY3Jhd2xlciAhPT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICB0aGlzLmNyYXdsZXJGdW5jKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3RvcCB0aGUgY3Jhd2xlciBiYWNrZ3JvdW5kIHRhc2suXG4gICAgICovXG4gICAgcHVibGljIHN0b3BDcmF3bGVyKCkge1xuICAgICAgICBpZiAodGhpcy5jcmF3bGVyID09PSBudWxsKSByZXR1cm47XG4gICAgICAgIHRoaXMuY3Jhd2xlci5jYW5jZWwoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbG9zZSB0aGUgZXZlbnQgaW5kZXguXG4gICAgICpcbiAgICAgKiBUaGlzIHJlbW92ZXMgYWxsIHRoZSBNYXRyaXhDbGllbnQgZXZlbnQgbGlzdGVuZXJzLCBzdG9wcyB0aGUgY3Jhd2xlclxuICAgICAqIHRhc2ssIGFuZCBjbG9zZXMgdGhlIGluZGV4LlxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBjbG9zZSgpIHtcbiAgICAgICAgY29uc3QgaW5kZXhNYW5hZ2VyID0gUGxhdGZvcm1QZWcuZ2V0KCkuZ2V0RXZlbnRJbmRleGluZ01hbmFnZXIoKTtcbiAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcnMoKTtcbiAgICAgICAgdGhpcy5zdG9wQ3Jhd2xlcigpO1xuICAgICAgICBhd2FpdCBpbmRleE1hbmFnZXIuY2xvc2VFdmVudEluZGV4KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VhcmNoIHRoZSBldmVudCBpbmRleCB1c2luZyB0aGUgZ2l2ZW4gdGVybSBmb3IgbWF0Y2hpbmcgZXZlbnRzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtJU2VhcmNoQXJnc30gc2VhcmNoQXJncyBUaGUgc2VhcmNoIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBzZWFyY2gsXG4gICAgICogc2V0cyB0aGUgc2VhcmNoIHRlcm0gYW5kIGRldGVybWluZXMgdGhlIHNlYXJjaCByZXN1bHQgY29udGVudHMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlPElSZXN1bHRSb29tRXZlbnRzW10+fSBBIHByb21pc2UgdGhhdCB3aWxsIHJlc29sdmUgdG8gYW4gYXJyYXlcbiAgICAgKiBvZiBzZWFyY2ggcmVzdWx0cyBvbmNlIHRoZSBzZWFyY2ggaXMgZG9uZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgc2VhcmNoKHNlYXJjaEFyZ3M6IElTZWFyY2hBcmdzKTogUHJvbWlzZTxJUmVzdWx0Um9vbUV2ZW50cz4ge1xuICAgICAgICBjb25zdCBpbmRleE1hbmFnZXIgPSBQbGF0Zm9ybVBlZy5nZXQoKS5nZXRFdmVudEluZGV4aW5nTWFuYWdlcigpO1xuICAgICAgICByZXR1cm4gaW5kZXhNYW5hZ2VyLnNlYXJjaEV2ZW50SW5kZXgoc2VhcmNoQXJncyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9hZCBldmVudHMgdGhhdCBjb250YWluIFVSTHMgZnJvbSB0aGUgZXZlbnQgaW5kZXguXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1Jvb219IHJvb20gVGhlIHJvb20gZm9yIHdoaWNoIHdlIHNob3VsZCBmZXRjaCBldmVudHMgY29udGFpbmluZ1xuICAgICAqIFVSTHNcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsaW1pdCBUaGUgbWF4aW11bSBudW1iZXIgb2YgZXZlbnRzIHRvIGZldGNoLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZyb21FdmVudCBGcm9tIHdoaWNoIGV2ZW50IHNob3VsZCB3ZSBjb250aW51ZSBmZXRjaGluZ1xuICAgICAqIGV2ZW50cyBmcm9tIHRoZSBpbmRleC4gVGhpcyBpcyBvbmx5IG5lZWRlZCBpZiB3ZSdyZSBjb250aW51aW5nIHRvIGZpbGxcbiAgICAgKiB0aGUgdGltZWxpbmUsIGUuZy4gaWYgd2UncmUgcGFnaW5hdGluZy4gVGhpcyBuZWVkcyB0byBiZSBzZXQgdG8gYSBldmVudFxuICAgICAqIGlkIG9mIGFuIGV2ZW50IHRoYXQgd2FzIHByZXZpb3VzbHkgZmV0Y2hlZCB3aXRoIHRoaXMgZnVuY3Rpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGlyZWN0aW9uIFRoZSBkaXJlY3Rpb24gaW4gd2hpY2ggd2Ugd2lsbCBjb250aW51ZVxuICAgICAqIGZldGNoaW5nIGV2ZW50cy4gRXZlbnRUaW1lbGluZS5CQUNLV0FSRFMgdG8gY29udGludWUgZmV0Y2hpbmcgZXZlbnRzIHRoYXRcbiAgICAgKiBhcmUgb2xkZXIgdGhhbiB0aGUgZXZlbnQgZ2l2ZW4gaW4gZnJvbUV2ZW50LCBFdmVudFRpbWVsaW5lLkZPUldBUkRTIHRvXG4gICAgICogZmV0Y2ggbmV3ZXIgZXZlbnRzLlxuICAgICAqXG4gICAgICogQHJldHVybnMge1Byb21pc2U8TWF0cml4RXZlbnRbXT59IFJlc29sdmVzIHRvIGFuIGFycmF5IG9mIGV2ZW50cyB0aGF0XG4gICAgICogY29udGFpbiBVUkxzLlxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBsb2FkRmlsZUV2ZW50cyhcbiAgICAgICAgcm9vbTogUm9vbSxcbiAgICAgICAgbGltaXQgPSAxMCxcbiAgICAgICAgZnJvbUV2ZW50OiBzdHJpbmcgPSBudWxsLFxuICAgICAgICBkaXJlY3Rpb246IHN0cmluZyA9IEV2ZW50VGltZWxpbmUuQkFDS1dBUkRTLFxuICAgICkge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IGluZGV4TWFuYWdlciA9IFBsYXRmb3JtUGVnLmdldCgpLmdldEV2ZW50SW5kZXhpbmdNYW5hZ2VyKCk7XG5cbiAgICAgICAgY29uc3QgbG9hZEFyZ3M6IElMb2FkQXJncyA9IHtcbiAgICAgICAgICAgIHJvb21JZDogcm9vbS5yb29tSWQsXG4gICAgICAgICAgICBsaW1pdDogbGltaXQsXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKGZyb21FdmVudCkge1xuICAgICAgICAgICAgbG9hZEFyZ3MuZnJvbUV2ZW50ID0gZnJvbUV2ZW50O1xuICAgICAgICAgICAgbG9hZEFyZ3MuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGV2ZW50cztcblxuICAgICAgICAvLyBHZXQgb3VyIGV2ZW50cyBmcm9tIHRoZSBldmVudCBpbmRleC5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGV2ZW50cyA9IGF3YWl0IGluZGV4TWFuYWdlci5sb2FkRmlsZUV2ZW50cyhsb2FkQXJncyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGxvZ2dlci5sb2coXCJFdmVudEluZGV4OiBFcnJvciBnZXR0aW5nIGZpbGUgZXZlbnRzXCIsIGUpO1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZXZlbnRNYXBwZXIgPSBjbGllbnQuZ2V0RXZlbnRNYXBwZXIoKTtcblxuICAgICAgICAvLyBUdXJuIHRoZSBldmVudHMgaW50byBNYXRyaXhFdmVudCBvYmplY3RzLlxuICAgICAgICBjb25zdCBtYXRyaXhFdmVudHMgPSBldmVudHMubWFwKGUgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWF0cml4RXZlbnQgPSBldmVudE1hcHBlcihlLmV2ZW50KTtcblxuICAgICAgICAgICAgY29uc3QgbWVtYmVyID0gbmV3IFJvb21NZW1iZXIocm9vbS5yb29tSWQsIG1hdHJpeEV2ZW50LmdldFNlbmRlcigpKTtcblxuICAgICAgICAgICAgLy8gV2UgY2FuJ3QgcmVhbGx5IHJlY29uc3RydWN0IHRoZSB3aG9sZSByb29tIHN0YXRlIGZyb20gb3VyXG4gICAgICAgICAgICAvLyBFdmVudEluZGV4IHRvIGNhbGN1bGF0ZSB0aGUgY29ycmVjdCBkaXNwbGF5IG5hbWUuIFVzZSB0aGVcbiAgICAgICAgICAgIC8vIGRpc2FtYmlndWF0ZWQgZm9ybSBhbHdheXMgaW5zdGVhZC5cbiAgICAgICAgICAgIG1lbWJlci5uYW1lID0gZS5wcm9maWxlLmRpc3BsYXluYW1lICsgXCIgKFwiICsgbWF0cml4RXZlbnQuZ2V0U2VuZGVyKCkgKyBcIilcIjtcblxuICAgICAgICAgICAgLy8gVGhpcyBpcyBzZXRzIHRoZSBhdmF0YXIgVVJMLlxuICAgICAgICAgICAgY29uc3QgbWVtYmVyRXZlbnQgPSBldmVudE1hcHBlcihcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcnNoaXA6IFwiam9pblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXZhdGFyX3VybDogZS5wcm9maWxlLmF2YXRhcl91cmwsXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5bmFtZTogZS5wcm9maWxlLmRpc3BsYXluYW1lLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBFdmVudFR5cGUuUm9vbU1lbWJlcixcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRfaWQ6IG1hdHJpeEV2ZW50LmdldElkKCkgKyBcIjpldmVudEluZGV4XCIsXG4gICAgICAgICAgICAgICAgICAgIHJvb21faWQ6IG1hdHJpeEV2ZW50LmdldFJvb21JZCgpLFxuICAgICAgICAgICAgICAgICAgICBzZW5kZXI6IG1hdHJpeEV2ZW50LmdldFNlbmRlcigpLFxuICAgICAgICAgICAgICAgICAgICBvcmlnaW5fc2VydmVyX3RzOiBtYXRyaXhFdmVudC5nZXRUcygpLFxuICAgICAgICAgICAgICAgICAgICBzdGF0ZV9rZXk6IG1hdHJpeEV2ZW50LmdldFNlbmRlcigpLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAvLyBXZSBzZXQgdGhpcyBtYW51YWxseSB0byBhdm9pZCBlbWl0dGluZyBSb29tTWVtYmVyLm1lbWJlcnNoaXAgYW5kXG4gICAgICAgICAgICAvLyBSb29tTWVtYmVyLm5hbWUgZXZlbnRzLlxuICAgICAgICAgICAgbWVtYmVyLmV2ZW50cy5tZW1iZXIgPSBtZW1iZXJFdmVudDtcbiAgICAgICAgICAgIG1hdHJpeEV2ZW50LnNlbmRlciA9IG1lbWJlcjtcblxuICAgICAgICAgICAgcmV0dXJuIG1hdHJpeEV2ZW50O1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gbWF0cml4RXZlbnRzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZpbGwgYSB0aW1lbGluZSB3aXRoIGV2ZW50cyB0aGF0IGNvbnRhaW4gVVJMcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7VGltZWxpbmVTZXR9IHRpbWVsaW5lU2V0IFRoZSBUaW1lbGluZVNldCB0aGUgVGltZWxpbmUgYmVsb25ncyB0byxcbiAgICAgKiB1c2VkIHRvIGNoZWNrIGlmIHdlJ3JlIGFkZGluZyBkdXBsaWNhdGUgZXZlbnRzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtUaW1lbGluZX0gdGltZWxpbmUgVGhlIFRpbWVsaW5lIHdoaWNoIHNob3VsZCBiZSBmaWxlZCB3aXRoXG4gICAgICogZXZlbnRzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtSb29tfSByb29tIFRoZSByb29tIGZvciB3aGljaCB3ZSBzaG91bGQgZmV0Y2ggZXZlbnRzIGNvbnRhaW5pbmdcbiAgICAgKiBVUkxzXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbGltaXQgVGhlIG1heGltdW0gbnVtYmVyIG9mIGV2ZW50cyB0byBmZXRjaC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBmcm9tRXZlbnQgRnJvbSB3aGljaCBldmVudCBzaG91bGQgd2UgY29udGludWUgZmV0Y2hpbmdcbiAgICAgKiBldmVudHMgZnJvbSB0aGUgaW5kZXguIFRoaXMgaXMgb25seSBuZWVkZWQgaWYgd2UncmUgY29udGludWluZyB0byBmaWxsXG4gICAgICogdGhlIHRpbWVsaW5lLCBlLmcuIGlmIHdlJ3JlIHBhZ2luYXRpbmcuIFRoaXMgbmVlZHMgdG8gYmUgc2V0IHRvIGEgZXZlbnRcbiAgICAgKiBpZCBvZiBhbiBldmVudCB0aGF0IHdhcyBwcmV2aW91c2x5IGZldGNoZWQgd2l0aCB0aGlzIGZ1bmN0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGRpcmVjdGlvbiBUaGUgZGlyZWN0aW9uIGluIHdoaWNoIHdlIHdpbGwgY29udGludWVcbiAgICAgKiBmZXRjaGluZyBldmVudHMuIEV2ZW50VGltZWxpbmUuQkFDS1dBUkRTIHRvIGNvbnRpbnVlIGZldGNoaW5nIGV2ZW50cyB0aGF0XG4gICAgICogYXJlIG9sZGVyIHRoYW4gdGhlIGV2ZW50IGdpdmVuIGluIGZyb21FdmVudCwgRXZlbnRUaW1lbGluZS5GT1JXQVJEUyB0b1xuICAgICAqIGZldGNoIG5ld2VyIGV2ZW50cy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+fSBSZXNvbHZlcyB0byB0cnVlIGlmIGV2ZW50cyB3ZXJlIGFkZGVkIHRvIHRoZVxuICAgICAqIHRpbWVsaW5lLCBmYWxzZSBvdGhlcndpc2UuXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIHBvcHVsYXRlRmlsZVRpbWVsaW5lKFxuICAgICAgICB0aW1lbGluZVNldDogRXZlbnRUaW1lbGluZVNldCxcbiAgICAgICAgdGltZWxpbmU6IEV2ZW50VGltZWxpbmUsXG4gICAgICAgIHJvb206IFJvb20sXG4gICAgICAgIGxpbWl0ID0gMTAsXG4gICAgICAgIGZyb21FdmVudDogc3RyaW5nID0gbnVsbCxcbiAgICAgICAgZGlyZWN0aW9uOiBzdHJpbmcgPSBFdmVudFRpbWVsaW5lLkJBQ0tXQVJEUyxcbiAgICApIHtcbiAgICAgICAgY29uc3QgbWF0cml4RXZlbnRzID0gYXdhaXQgdGhpcy5sb2FkRmlsZUV2ZW50cyhyb29tLCBsaW1pdCwgZnJvbUV2ZW50LCBkaXJlY3Rpb24pO1xuXG4gICAgICAgIC8vIElmIHRoaXMgaXMgYSBub3JtYWwgZmlsbCByZXF1ZXN0LCBub3QgYSBwYWdpbmF0aW9uIHJlcXVlc3QsIHdlIG5lZWRcbiAgICAgICAgLy8gdG8gZ2V0IG91ciBldmVudHMgaW4gdGhlIEJBQ0tXQVJEUyBkaXJlY3Rpb24gYnV0IHBvcHVsYXRlIHRoZW0gaW4gdGhlXG4gICAgICAgIC8vIGZvcndhcmRzIGRpcmVjdGlvbi5cbiAgICAgICAgLy8gVGhpcyBuZWVkcyB0byBoYXBwZW4gYmVjYXVzZSBhIGZpbGwgcmVxdWVzdCBtaWdodCBjb21lIHdpdGggYW5cbiAgICAgICAgLy8gZXhpc3RpbmcgdGltZWxpbmUgZS5nLiBpZiB5b3UgY2xvc2UgYW5kIHJlLW9wZW4gdGhlIEZpbGVQYW5lbC5cbiAgICAgICAgaWYgKGZyb21FdmVudCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgbWF0cml4RXZlbnRzLnJldmVyc2UoKTtcbiAgICAgICAgICAgIGRpcmVjdGlvbiA9IGRpcmVjdGlvbiA9PSBFdmVudFRpbWVsaW5lLkJBQ0tXQVJEUyA/IEV2ZW50VGltZWxpbmUuRk9SV0FSRFM6IEV2ZW50VGltZWxpbmUuQkFDS1dBUkRTO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWRkIHRoZSBldmVudHMgdG8gdGhlIHRpbWVsaW5lIG9mIHRoZSBmaWxlIHBhbmVsLlxuICAgICAgICBtYXRyaXhFdmVudHMuZm9yRWFjaChlID0+IHtcbiAgICAgICAgICAgIGlmICghdGltZWxpbmVTZXQuZXZlbnRJZFRvVGltZWxpbmUoZS5nZXRJZCgpKSkge1xuICAgICAgICAgICAgICAgIHRpbWVsaW5lU2V0LmFkZEV2ZW50VG9UaW1lbGluZShlLCB0aW1lbGluZSwgZGlyZWN0aW9uID09IEV2ZW50VGltZWxpbmUuQkFDS1dBUkRTKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IHJldCA9IGZhbHNlO1xuICAgICAgICBsZXQgcGFnaW5hdGlvblRva2VuID0gXCJcIjtcblxuICAgICAgICAvLyBTZXQgdGhlIHBhZ2luYXRpb24gdG9rZW4gdG8gdGhlIG9sZGVzdCBldmVudCB0aGF0IHdlIHJldHJpZXZlZC5cbiAgICAgICAgaWYgKG1hdHJpeEV2ZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBwYWdpbmF0aW9uVG9rZW4gPSBtYXRyaXhFdmVudHNbbWF0cml4RXZlbnRzLmxlbmd0aCAtIDFdLmdldElkKCk7XG4gICAgICAgICAgICByZXQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9nZ2VyLmxvZyhcIkV2ZW50SW5kZXg6IFBvcHVsYXRpbmcgZmlsZSBwYW5lbCB3aXRoXCIsIG1hdHJpeEV2ZW50cy5sZW5ndGgsXG4gICAgICAgICAgICBcImV2ZW50cyBhbmQgc2V0dGluZyB0aGUgcGFnaW5hdGlvbiB0b2tlbiB0b1wiLCBwYWdpbmF0aW9uVG9rZW4pO1xuXG4gICAgICAgIHRpbWVsaW5lLnNldFBhZ2luYXRpb25Ub2tlbihwYWdpbmF0aW9uVG9rZW4sIEV2ZW50VGltZWxpbmUuQkFDS1dBUkRTKTtcbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFbXVsYXRlIGEgVGltZWxpbmVXaW5kb3cgcGFnaW5hdGlvbigpIHJlcXVlc3Qgd2l0aCB0aGUgZXZlbnQgaW5kZXggYXMgdGhlIGV2ZW50IHNvdXJjZVxuICAgICAqXG4gICAgICogTWlnaHQgbm90IGZldGNoIGV2ZW50cyBmcm9tIHRoZSBpbmRleCBpZiB0aGUgdGltZWxpbmUgYWxyZWFkeSBjb250YWluc1xuICAgICAqIGV2ZW50cyB0aGF0IHRoZSB3aW5kb3cgaXNuJ3Qgc2hvd2luZy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Um9vbX0gcm9vbSBUaGUgcm9vbSBmb3Igd2hpY2ggd2Ugc2hvdWxkIGZldGNoIGV2ZW50cyBjb250YWluaW5nXG4gICAgICogVVJMc1xuICAgICAqXG4gICAgICogQHBhcmFtIHtUaW1lbGluZVdpbmRvd30gdGltZWxpbmVXaW5kb3cgVGhlIHRpbWVsaW5lIHdpbmRvdyB0aGF0IHNob3VsZCBiZVxuICAgICAqIHBvcHVsYXRlZCB3aXRoIG5ldyBldmVudHMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGlyZWN0aW9uIFRoZSBkaXJlY3Rpb24gaW4gd2hpY2ggd2Ugc2hvdWxkIHBhZ2luYXRlLlxuICAgICAqIEV2ZW50VGltZWxpbmUuQkFDS1dBUkRTIHRvIHBhZ2luYXRlIGJhY2ssIEV2ZW50VGltZWxpbmUuRk9SV0FSRFMgdG9cbiAgICAgKiBwYWdpbmF0ZSBmb3J3YXJkcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBsaW1pdCBUaGUgbWF4aW11bSBudW1iZXIgb2YgZXZlbnRzIHRvIGZldGNoIHdoaWxlXG4gICAgICogcGFnaW5hdGluZy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPGJvb2xlYW4+fSBSZXNvbHZlcyB0byBhIGJvb2xlYW4gd2hpY2ggaXMgdHJ1ZSBpZiBtb3JlXG4gICAgICogZXZlbnRzIHdlcmUgc3VjY2Vzc2Z1bGx5IHJldHJpZXZlZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgcGFnaW5hdGVUaW1lbGluZVdpbmRvdyhyb29tOiBSb29tLCB0aW1lbGluZVdpbmRvdzogVGltZWxpbmVXaW5kb3csIGRpcmVjdGlvbjogRGlyZWN0aW9uLCBsaW1pdDogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IHRsID0gdGltZWxpbmVXaW5kb3cuZ2V0VGltZWxpbmVJbmRleChkaXJlY3Rpb24pO1xuXG4gICAgICAgIGlmICghdGwpIHJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpO1xuICAgICAgICBpZiAodGwucGVuZGluZ1BhZ2luYXRlKSByZXR1cm4gdGwucGVuZGluZ1BhZ2luYXRlO1xuXG4gICAgICAgIGlmICh0aW1lbGluZVdpbmRvdy5leHRlbmQoZGlyZWN0aW9uLCBsaW1pdCkpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwYWdpbmF0aW9uTWV0aG9kID0gYXN5bmMgKFxuICAgICAgICAgICAgdGltZWxpbmVXaW5kb3c6IFRpbWVsaW5lV2luZG93LFxuICAgICAgICAgICAgdGltZWxpbmVJbmRleDogVGltZWxpbmVJbmRleCxcbiAgICAgICAgICAgIHJvb206IFJvb20sXG4gICAgICAgICAgICBkaXJlY3Rpb246IERpcmVjdGlvbixcbiAgICAgICAgICAgIGxpbWl0OiBudW1iZXIsXG4gICAgICAgICkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdGltZWxpbmUgPSB0aW1lbGluZUluZGV4LnRpbWVsaW5lO1xuICAgICAgICAgICAgY29uc3QgdGltZWxpbmVTZXQgPSB0aW1lbGluZS5nZXRUaW1lbGluZVNldCgpO1xuICAgICAgICAgICAgY29uc3QgdG9rZW4gPSB0aW1lbGluZS5nZXRQYWdpbmF0aW9uVG9rZW4oZGlyZWN0aW9uKTtcblxuICAgICAgICAgICAgY29uc3QgcmV0ID0gYXdhaXQgdGhpcy5wb3B1bGF0ZUZpbGVUaW1lbGluZShcbiAgICAgICAgICAgICAgICB0aW1lbGluZVNldCxcbiAgICAgICAgICAgICAgICB0aW1lbGluZSxcbiAgICAgICAgICAgICAgICByb29tLFxuICAgICAgICAgICAgICAgIGxpbWl0LFxuICAgICAgICAgICAgICAgIHRva2VuLFxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbixcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHRpbWVsaW5lSW5kZXgucGVuZGluZ1BhZ2luYXRlID0gbnVsbDtcbiAgICAgICAgICAgIHRpbWVsaW5lV2luZG93LmV4dGVuZChkaXJlY3Rpb24sIGxpbWl0KTtcblxuICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBwYWdpbmF0aW9uUHJvbWlzZSA9IHBhZ2luYXRpb25NZXRob2QodGltZWxpbmVXaW5kb3csIHRsLCByb29tLCBkaXJlY3Rpb24sIGxpbWl0KTtcbiAgICAgICAgdGwucGVuZGluZ1BhZ2luYXRlID0gcGFnaW5hdGlvblByb21pc2U7XG5cbiAgICAgICAgcmV0dXJuIHBhZ2luYXRpb25Qcm9taXNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBzdGF0aXN0aWNhbCBpbmZvcm1hdGlvbiBvZiB0aGUgaW5kZXguXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlPEluZGV4U3RhdHM+fSBBIHByb21pc2UgdGhhdCB3aWxsIHJlc29sdmUgdG8gdGhlIGluZGV4XG4gICAgICogc3RhdGlzdGljcy5cbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgZ2V0U3RhdHMoKSB7XG4gICAgICAgIGNvbnN0IGluZGV4TWFuYWdlciA9IFBsYXRmb3JtUGVnLmdldCgpLmdldEV2ZW50SW5kZXhpbmdNYW5hZ2VyKCk7XG4gICAgICAgIHJldHVybiBpbmRleE1hbmFnZXIuZ2V0U3RhdHMoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiB0aGUgcm9vbSB3aXRoIHRoZSBnaXZlbiBpZCBpcyBhbHJlYWR5IGluZGV4ZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcm9vbUlkIFRoZSBJRCBvZiB0aGUgcm9vbSB3aGljaCB3ZSB3YW50IHRvIGNoZWNrIGlmIGl0XG4gICAgICogaGFzIGJlZW4gYWxyZWFkeSBpbmRleGVkLlxuICAgICAqXG4gICAgICogQHJldHVybiB7UHJvbWlzZTxib29sZWFuPn0gUmV0dXJucyB0cnVlIGlmIHRoZSBpbmRleCBjb250YWlucyBldmVudHMgZm9yXG4gICAgICogdGhlIGdpdmVuIHJvb20sIGZhbHNlIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgaXNSb29tSW5kZXhlZChyb29tSWQpIHtcbiAgICAgICAgY29uc3QgaW5kZXhNYW5hZ2VyID0gUGxhdGZvcm1QZWcuZ2V0KCkuZ2V0RXZlbnRJbmRleGluZ01hbmFnZXIoKTtcbiAgICAgICAgcmV0dXJuIGluZGV4TWFuYWdlci5pc1Jvb21JbmRleGVkKHJvb21JZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSByb29tIHRoYXQgd2UgYXJlIGN1cnJlbnRseSBjcmF3bGluZy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtSb29tfSBBIE1hdHJpeFJvb20gdGhhdCBpcyBiZWluZyBjdXJyZW50bHkgY3Jhd2xlZCwgbnVsbFxuICAgICAqIGlmIG5vIHJvb20gaXMgY3VycmVudGx5IGJlaW5nIGNyYXdsZWQuXG4gICAgICovXG4gICAgcHVibGljIGN1cnJlbnRSb29tKCkge1xuICAgICAgICBpZiAodGhpcy5jdXJyZW50Q2hlY2twb2ludCA9PT0gbnVsbCAmJiB0aGlzLmNyYXdsZXJDaGVja3BvaW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRDaGVja3BvaW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gY2xpZW50LmdldFJvb20odGhpcy5jdXJyZW50Q2hlY2twb2ludC5yb29tSWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGNsaWVudC5nZXRSb29tKHRoaXMuY3Jhd2xlckNoZWNrcG9pbnRzWzBdLnJvb21JZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgY3Jhd2xpbmdSb29tcygpIHtcbiAgICAgICAgY29uc3QgdG90YWxSb29tcyA9IG5ldyBTZXQoKTtcbiAgICAgICAgY29uc3QgY3Jhd2xpbmdSb29tcyA9IG5ldyBTZXQoKTtcblxuICAgICAgICB0aGlzLmNyYXdsZXJDaGVja3BvaW50cy5mb3JFYWNoKChjaGVja3BvaW50LCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY3Jhd2xpbmdSb29tcy5hZGQoY2hlY2twb2ludC5yb29tSWQpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAodGhpcy5jdXJyZW50Q2hlY2twb2ludCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY3Jhd2xpbmdSb29tcy5hZGQodGhpcy5jdXJyZW50Q2hlY2twb2ludC5yb29tSWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCByb29tcyA9IGNsaWVudC5nZXRSb29tcygpO1xuXG4gICAgICAgIGNvbnN0IGlzUm9vbUVuY3J5cHRlZCA9IChyb29tOiBSb29tKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gY2xpZW50LmlzUm9vbUVuY3J5cHRlZChyb29tLnJvb21JZCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgZW5jcnlwdGVkUm9vbXMgPSByb29tcy5maWx0ZXIoaXNSb29tRW5jcnlwdGVkKTtcbiAgICAgICAgZW5jcnlwdGVkUm9vbXMuZm9yRWFjaCgocm9vbSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIHRvdGFsUm9vbXMuYWRkKHJvb20ucm9vbUlkKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHsgY3Jhd2xpbmdSb29tcywgdG90YWxSb29tcyB9O1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBR0E7O0FBRUE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXNCQTtBQUNBO0FBQ0EsTUFBTUEsaUJBQWlCLEdBQUcsSUFBMUIsQyxDQUVBOztBQUNBLE1BQU1DLGdCQUFnQixHQUFHLEdBQXpCOztBQU1BO0FBQ0E7QUFDQTtBQUNlLE1BQU1DLFVBQU4sU0FBeUJDLG9CQUF6QixDQUFzQztFQUFBO0lBQUE7SUFBQSwwREFDRSxFQURGO0lBQUEsK0NBRXJCLElBRnFCO0lBQUEseURBR0QsSUFIQztJQUFBLDhDQTJHaEMsT0FBT0MsS0FBUCxFQUFzQkMsU0FBdEIsRUFBeUNDLElBQXpDLEtBQTBEO01BQ3ZFLE1BQU1DLFlBQVksR0FBR0Msb0JBQUEsQ0FBWUMsR0FBWixHQUFrQkMsdUJBQWxCLEVBQXJCOztNQUVBLElBQUlMLFNBQVMsS0FBSyxVQUFkLElBQTRCRCxLQUFLLEtBQUssU0FBMUMsRUFBcUQ7UUFDakQ7UUFDQTtRQUNBO1FBQ0EsTUFBTU8sa0JBQWtCLEdBQUcsTUFBTUosWUFBWSxDQUFDSyxpQkFBYixFQUFqQztRQUNBLElBQUlELGtCQUFKLEVBQXdCLE1BQU0sS0FBS0UscUJBQUwsRUFBTjtRQUV4QixLQUFLQyxZQUFMO1FBQ0E7TUFDSDs7TUFFRCxJQUFJVCxTQUFTLEtBQUssU0FBZCxJQUEyQkQsS0FBSyxLQUFLLFNBQXpDLEVBQW9EO1FBQ2hEO1FB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