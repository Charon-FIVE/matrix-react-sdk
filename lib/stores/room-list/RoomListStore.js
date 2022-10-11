"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.RoomListStoreClass = exports.LISTS_UPDATE_EVENT = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _utils = require("matrix-js-sdk/src/utils");

var _logger = require("matrix-js-sdk/src/logger");

var _event = require("matrix-js-sdk/src/@types/event");

var _SettingsStore = _interopRequireDefault(require("../../settings/SettingsStore"));

var _models = require("./models");

var _models2 = require("./algorithms/models");

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _readReceipts = require("../../utils/read-receipts");

var _IFilterCondition = require("./filters/IFilterCondition");

var _RoomViewStore = require("../RoomViewStore");

var _Algorithm = require("./algorithms/Algorithm");

var _membership = require("../../utils/membership");

var _RoomListLayoutStore = _interopRequireDefault(require("./RoomListLayoutStore"));

var _MarkedExecution = require("../../utils/MarkedExecution");

var _AsyncStoreWithClient = require("../AsyncStoreWithClient");

var _RoomNotificationStateStore = require("../notifications/RoomNotificationStateStore");

var _VisibilityProvider = require("./filters/VisibilityProvider");

var _SpaceWatcher = require("./SpaceWatcher");

var _Interface = require("./Interface");

/*
Copyright 2018 - 2022 The Matrix.org Foundation C.I.C.

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
const LISTS_UPDATE_EVENT = _Interface.RoomListStoreEvent.ListsUpdate;
exports.LISTS_UPDATE_EVENT = LISTS_UPDATE_EVENT;

class RoomListStoreClass extends _AsyncStoreWithClient.AsyncStoreWithClient {
  /**
   * Set to true if you're running tests on the store. Should not be touched in
   * any other environment.
   */
  constructor() {
    super(_dispatcher.default);
    (0, _defineProperty2.default)(this, "initialListsGenerated", false);
    (0, _defineProperty2.default)(this, "algorithm", new _Algorithm.Algorithm());
    (0, _defineProperty2.default)(this, "prefilterConditions", []);
    (0, _defineProperty2.default)(this, "updateFn", new _MarkedExecution.MarkedExecution(() => {
      for (const tagId of Object.keys(this.orderedLists)) {
        _RoomNotificationStateStore.RoomNotificationStateStore.instance.getListState(tagId).setRooms(this.orderedLists[tagId]);
      }

      this.emit(LISTS_UPDATE_EVENT);
    }));
    (0, _defineProperty2.default)(this, "onAlgorithmListUpdated", forceUpdate => {
      this.updateFn.mark();
      if (forceUpdate) this.updateFn.trigger();
    });
    (0, _defineProperty2.default)(this, "onAlgorithmFilterUpdated", () => {
      // The filter can happen off-cycle, so trigger an update. The filter will have
      // already caused a mark.
      this.updateFn.trigger();
    });
    (0, _defineProperty2.default)(this, "onPrefilterUpdated", async () => {
      await this.recalculatePrefiltering();
      this.updateFn.trigger();
    });
    this.setMaxListeners(20); // RoomList + LeftPanel + 8xRoomSubList + spares

    this.algorithm.start();
  }

  setupWatchers() {
    // TODO: Maybe destroy this if this class supports destruction
    new _SpaceWatcher.SpaceWatcher(this);
  }

  get orderedLists() {
    if (!this.algorithm) return {}; // No tags yet.

    return this.algorithm.getOrderedRooms();
  } // Intended for test usage


  async resetStore() {
    await this.reset();
    this.prefilterConditions = [];
    this.initialListsGenerated = false;
    this.algorithm.off(_Algorithm.LIST_UPDATED_EVENT, this.onAlgorithmListUpdated);
    this.algorithm.off(_IFilterCondition.FILTER_CHANGED, this.onAlgorithmListUpdated);
    this.algorithm.stop();
    this.algorithm = new _Algorithm.Algorithm();
    this.algorithm.on(_Algorithm.LIST_UPDATED_EVENT, this.onAlgorithmListUpdated);
    this.algorithm.on(_IFilterCondition.FILTER_CHANGED, this.onAlgorithmListUpdated); // Reset state without causing updates as the client will have been destroyed
    // and downstream code will throw NPE errors.

    await this.reset(null, true);
  } // Public for test usage. Do not call this.


  async makeReady(forcedClient) {
    if (forcedClient) {
      this.readyStore.useUnitTestClient(forcedClient);
    }

    _RoomViewStore.RoomViewStore.instance.addListener(() => this.handleRVSUpdate({}));

    this.algorithm.on(_Algorithm.LIST_UPDATED_EVENT, this.onAlgorithmListUpdated);
    this.algorithm.on(_IFilterCondition.FILTER_CHANGED, this.onAlgorithmFilterUpdated);
    this.setupWatchers(); // Update any settings here, as some may have happened before we were logically ready.

    _logger.logger.log("Regenerating room lists: Startup");

    this.updateAlgorithmInstances();
    this.regenerateAllLists({
      trigger: false
    });
    this.handleRVSUpdate({
      trigger: false
    }); // fake an RVS update to adjust sticky room, if needed

    this.updateFn.mark(); // we almost certainly want to trigger an update.

    this.updateFn.trigger();
  }
  /**
   * Handles suspected RoomViewStore changes.
   * @param trigger Set to false to prevent a list update from being sent. Should only
   * be used if the calling code will manually trigger the update.
   */


  handleRVSUpdate(_ref) {
    let {
      trigger = true
    } = _ref;
    if (!this.matrixClient) return; // We assume there won't be RVS updates without a client

    const activeRoomId = _RoomViewStore.RoomViewStore.instance.getRoomId();

    if (!activeRoomId && this.algorithm.stickyRoom) {
      this.algorithm.setStickyRoom(null);
    } else if (activeRoomId) {
      const activeRoom = this.matrixClient.getRoom(activeRoomId);

      if (!activeRoom) {
        _logger.logger.warn(`${activeRoomId} is current in RVS but missing from client - clearing sticky room`);

        this.algorithm.setStickyRoom(null);
      } else if (activeRoom !== this.algorithm.stickyRoom) {
        this.algorithm.setStickyRoom(activeRoom);
      }
    }

    if (trigger) this.updateFn.trigger();
  }

  async onReady() {
    await this.makeReady();
  }

  async onNotReady() {
    await this.resetStore();
  }

  async onAction(payload) {
    // If we're not remotely ready, don't even bother scheduling the dispatch handling.
    // This is repeated in the handler just in case things change between a decision here and
    // when the timer fires.
    const logicallyReady = this.matrixClient && this.initialListsGenerated;
    if (!logicallyReady) return; // When we're running tests we can't reliably use setImmediate out of timing concerns.
    // As such, we use a more synchronous model.

    if (RoomListStoreClass.TEST_MODE) {
      await this.onDispatchAsync(payload);
      return;
    } // We do this to intentionally break out of the current event loop task, allowing
    // us to instead wait for a more convenient time to run our updates.


    setImmediate(() => this.onDispatchAsync(payload));
  }

  async onDispatchAsync(payload) {
    // Everything here requires a MatrixClient or some sort of logical readiness.
    const logicallyReady = this.matrixClient && this.initialListsGenerated;
    if (!logicallyReady) return;

    if (!this.algorithm) {
      // This shouldn't happen because `initialListsGenerated` implies we have an algorithm.
      throw new Error("Room list store has no algorithm to process dispatcher update with");
    }

    if (payload.action === 'MatrixActions.Room.receipt') {
      // First see if the receipt event is for our own user. If it was, trigger
      // a room update (we probably read the room on a different device).
      if ((0, _readReceipts.readReceiptChangeIsFor)(payload.event, this.matrixClient)) {
        const room = payload.room;

        if (!room) {
          _logger.logger.warn(`Own read receipt was in unknown room ${room.roomId}`);

          return;
        }

        await this.handleRoomUpdate(room, _models.RoomUpdateCause.ReadReceipt);
        this.updateFn.trigger();
        return;
      }
    } else if (payload.action === 'MatrixActions.Room.tags') {
      const roomPayload = payload; // TODO: Type out the dispatcher types

      await this.handleRoomUpdate(roomPayload.room, _models.RoomUpdateCause.PossibleTagChange);
      this.updateFn.trigger();
    } else if (payload.action === 'MatrixActions.Room.timeline') {
      const eventPayload = payload; // Ignore non-live events (backfill) and notification timeline set events (without a room)

      if (!eventPayload.isLiveEvent || !eventPayload.isLiveUnfilteredRoomTimelineEvent || !eventPayload.room) {
        return;
      }

      const roomId = eventPayload.event.getRoomId();
      const room = this.matrixClient.getRoom(roomId);

      const tryUpdate = async updatedRoom => {
        if (eventPayload.event.getType() === _event.EventType.RoomTombstone && eventPayload.event.getStateKey() === '') {
          const newRoom = this.matrixClient.getRoom(eventPayload.event.getContent()['replacement_room']);

          if (newRoom) {
            // If we have the new room, then the new room check will have seen the predecessor
            // and did the required updates, so do nothing here.
            return;
          }
        }

        await this.handleRoomUpdate(updatedRoom, _models.RoomUpdateCause.Timeline);
        this.updateFn.trigger();
      };

      if (!room) {
        _logger.logger.warn(`Live timeline event ${eventPayload.event.getId()} received without associated room`);

        _logger.logger.warn(`Queuing failed room update for retry as a result.`);

        setTimeout(async () => {
          const updatedRoom = this.matrixClient.getRoom(roomId);
          await tryUpdate(updatedRoom);
        }, 100); // 100ms should be enough for the room to show up

        return;
      } else {
        await tryUpdate(room);
      }
    } else if (payload.action === 'MatrixActions.Event.decrypted') {
      const eventPayload = payload; // TODO: Type out the dispatcher types

      const roomId = eventPayload.event.getRoomId();

      if (!roomId) {
        return;
      }

      const room = this.matrixClient.getRoom(roomId);

      if (!room) {
        _logger.logger.warn(`Event ${eventPayload.event.getId()} was decrypted in an unknown room ${roomId}`);

        return;
      }

      await this.handleRoomUpdate(room, _models.RoomUpdateCause.Timeline);
      this.updateFn.trigger();
    } else if (payload.action === 'MatrixActions.accountData' && payload.event_type === _event.EventType.Direct) {
      const eventPayload = payload; // TODO: Type out the dispatcher types

      const dmMap = eventPayload.event.getContent();

      for (const userId of Object.keys(dmMap)) {
        const roomIds = dmMap[userId];

        for (const roomId of roomIds) {
          const room = this.matrixClient.getRoom(roomId);

          if (!room) {
            _logger.logger.warn(`${roomId} was found in DMs but the room is not in the store`);

            continue;
          } // We expect this RoomUpdateCause to no-op if there's no change, and we don't expect
          // the user to have hundreds of rooms to update in one event. As such, we just hammer
          // away at updates until the problem is solved. If we were expecting more than a couple
          // of rooms to be updated at once, we would consider batching the rooms up.


          await this.handleRoomUpdate(room, _models.RoomUpdateCause.PossibleTagChange);
        }
      }

      this.updateFn.trigger();
    } else if (payload.action === 'MatrixActions.Room.myMembership') {
      const membershipPayload = payload; // TODO: Type out the dispatcher types

      const oldMembership = (0, _membership.getEffectiveMembership)(membershipPayload.oldMembership);
      const newMembership = (0, _membership.getEffectiveMembership)(membershipPayload.membership);

      if (oldMembership !== _membership.EffectiveMembership.Join && newMembership === _membership.EffectiveMembership.Join) {
        // If we're joining an upgraded room, we'll want to make sure we don't proliferate
        // the dead room in the list.
        const createEvent = membershipPayload.room.currentState.getStateEvents(_event.EventType.RoomCreate, "");

        if (createEvent && createEvent.getContent()['predecessor']) {
          const prevRoom = this.matrixClient.getRoom(createEvent.getContent()['predecessor']['room_id']);

          if (prevRoom) {
            const isSticky = this.algorithm.stickyRoom === prevRoom;

            if (isSticky) {
              this.algorithm.setStickyRoom(null);
            } // Note: we hit the algorithm instead of our handleRoomUpdate() function to
            // avoid redundant updates.


            this.algorithm.handleRoomUpdate(prevRoom, _models.RoomUpdateCause.RoomRemoved);
          }
        }

        await this.handleRoomUpdate(membershipPayload.room, _models.RoomUpdateCause.NewRoom);
        this.updateFn.trigger();
        return;
      }

      if (oldMembership !== _membership.EffectiveMembership.Invite && newMembership === _membership.EffectiveMembership.Invite) {
        await this.handleRoomUpdate(membershipPayload.room, _models.RoomUpdateCause.NewRoom);
        this.updateFn.trigger();
        return;
      } // If it's not a join, it's transitioning into a different list (possibly historical)


      if (oldMembership !== newMembership) {
        await this.handleRoomUpdate(membershipPayload.room, _models.RoomUpdateCause.PossibleTagChange);
        this.updateFn.trigger();
        return;
      }
    }
  }

  async handleRoomUpdate(room, cause) {
    if (cause === _models.RoomUpdateCause.NewRoom && room.getMyMembership() === "invite") {
      // Let the visibility provider know that there is a new invited room. It would be nice
      // if this could just be an event that things listen for but the point of this is that
      // we delay doing anything about this room until the VoipUserMapper had had a chance
      // to do the things it needs to do to decide if we should show this room or not, so
      // an even wouldn't et us do that.
      await _VisibilityProvider.VisibilityProvider.instance.onNewInvitedRoom(room);
    }

    if (!_VisibilityProvider.VisibilityProvider.instance.isRoomVisible(room)) {
      return; // don't do anything on rooms that aren't visible
    }

    if ((cause === _models.RoomUpdateCause.NewRoom || cause === _models.RoomUpdateCause.PossibleTagChange) && !this.prefilterConditions.every(c => c.isVisible(room))) {
      return; // don't do anything on new/moved rooms which ought not to be shown
    }

    const shouldUpdate = this.algorithm.handleRoomUpdate(room, cause);

    if (shouldUpdate) {
      this.updateFn.mark();
    }
  }

  async recalculatePrefiltering() {
    if (!this.algorithm) return;
    if (!this.algorithm.hasTagSortingMap) return; // we're still loading
    // Inhibit updates because we're about to lie heavily to the algorithm

    this.algorithm.updatesInhibited = true; // Figure out which rooms are about to be valid, and the state of affairs

    const rooms = this.getPlausibleRooms();
    const currentSticky = this.algorithm.stickyRoom;
    const stickyIsStillPresent = currentSticky && rooms.includes(currentSticky); // Reset the sticky room before resetting the known rooms so the algorithm
    // doesn't freak out.

    this.algorithm.setStickyRoom(null);
    this.algorithm.setKnownRooms(rooms); // Set the sticky room back, if needed, now that we have updated the store.
    // This will use relative stickyness to the new room set.

    if (stickyIsStillPresent) {
      this.algorithm.setStickyRoom(currentSticky);
    } // Finally, mark an update and resume updates from the algorithm


    this.updateFn.mark();
    this.algorithm.updatesInhibited = false;
  }

  setTagSorting(tagId, sort) {
    this.setAndPersistTagSorting(tagId, sort);
    this.updateFn.trigger();
  }

  setAndPersistTagSorting(tagId, sort) {
    this.algorithm.setTagSorting(tagId, sort); // TODO: Per-account? https://github.com/vector-im/element-web/issues/14114

    localStorage.setItem(`mx_tagSort_${tagId}`, sort);
  }

  getTagSorting(tagId) {
    return this.algorithm.getTagSorting(tagId);
  } // noinspection JSMethodCanBeStatic


  getStoredTagSorting(tagId) {
    // TODO: Per-account? https://github.com/vector-im/element-web/issues/14114
    return localStorage.getItem(`mx_tagSort_${tagId}`);
  } // logic must match calculateListOrder


  calculateTagSorting(tagId) {
    const isDefaultRecent = tagId === _models.DefaultTagID.Invite || tagId === _models.DefaultTagID.DM;
    const defaultSort = isDefaultRecent ? _models2.SortAlgorithm.Recent : _models2.SortAlgorithm.Alphabetic;

    const settingAlphabetical = _SettingsStore.default.getValue("RoomList.orderAlphabetically", null, true);

    const definedSort = this.getTagSorting(tagId);
    const storedSort = this.getStoredTagSorting(tagId); // We use the following order to determine which of the 4 flags to use:
    // Stored > Settings > Defined > Default

    let tagSort = defaultSort;

    if (storedSort) {
      tagSort = storedSort;
    } else if (!(0, _utils.isNullOrUndefined)(settingAlphabetical)) {
      tagSort = settingAlphabetical ? _models2.SortAlgorithm.Alphabetic : _models2.SortAlgorithm.Recent;
    } else if (definedSort) {
      tagSort = definedSort;
    } // else default (already set)


    return tagSort;
  }

  setListOrder(tagId, order) {
    this.setAndPersistListOrder(tagId, order);
    this.updateFn.trigger();
  }

  setAndPersistListOrder(tagId, order) {
    this.algorithm.setListOrdering(tagId, order); // TODO: Per-account? https://github.com/vector-im/element-web/issues/14114

    localStorage.setItem(`mx_listOrder_${tagId}`, order);
  }

  getListOrder(tagId) {
    return this.algorithm.getListOrdering(tagId);
  } // noinspection JSMethodCanBeStatic


  getStoredListOrder(tagId) {
    // TODO: Per-account? https://github.com/vector-im/element-web/issues/14114
    return localStorage.getItem(`mx_listOrder_${tagId}`);
  } // logic must match calculateTagSorting


  calculateListOrder(tagId) {
    const defaultOrder = _models2.ListAlgorithm.Natural;

    const settingImportance = _SettingsStore.default.getValue("RoomList.orderByImportance", null, true);

    const definedOrder = this.getListOrder(tagId);
    const storedOrder = this.getStoredListOrder(tagId); // We use the following order to determine which of the 4 flags to use:
    // Stored > Settings > Defined > Default

    let listOrder = defaultOrder;

    if (storedOrder) {
      listOrder = storedOrder;
    } else if (!(0, _utils.isNullOrUndefined)(settingImportance)) {
      listOrder = settingImportance ? _models2.ListAlgorithm.Importance : _models2.ListAlgorithm.Natural;
    } else if (definedOrder) {
      listOrder = definedOrder;
    } // else default (already set)


    return listOrder;
  }

  updateAlgorithmInstances() {
    // We'll require an update, so mark for one. Marking now also prevents the calls
    // to setTagSorting and setListOrder from causing triggers.
    this.updateFn.mark();

    for (const tag of Object.keys(this.orderedLists)) {
      const definedSort = this.getTagSorting(tag);
      const definedOrder = this.getListOrder(tag);
      const tagSort = this.calculateTagSorting(tag);
      const listOrder = this.calculateListOrder(tag);

      if (tagSort !== definedSort) {
        this.setAndPersistTagSorting(tag, tagSort);
      }

      if (listOrder !== definedOrder) {
        this.setAndPersistListOrder(tag, listOrder);
      }
    }
  }

  getPlausibleRooms() {
    if (!this.matrixClient) return [];
    let rooms = this.matrixClient.getVisibleRooms().filter(r => _VisibilityProvider.VisibilityProvider.instance.isRoomVisible(r));

    if (this.prefilterConditions.length > 0) {
      rooms = rooms.filter(r => {
        for (const filter of this.prefilterConditions) {
          if (!filter.isVisible(r)) {
            return false;
          }
        }

        return true;
      });
    }

    return rooms;
  }
  /**
   * Regenerates the room whole room list, discarding any previous results.
   *
   * Note: This is only exposed externally for the tests. Do not call this from within
   * the app.
   * @param trigger Set to false to prevent a list update from being sent. Should only
   * be used if the calling code will manually trigger the update.
   */


  regenerateAllLists(_ref2) {
    let {
      trigger = true
    } = _ref2;

    _logger.logger.warn("Regenerating all room lists");

    const rooms = this.getPlausibleRooms();
    const sorts = {};
    const orders = {};
    const allTags = [..._models.OrderedDefaultTagIDs];

    for (const tagId of allTags) {
      sorts[tagId] = this.calculateTagSorting(tagId);
      orders[tagId] = this.calculateListOrder(tagId);

      _RoomListLayoutStore.default.instance.ensureLayoutExists(tagId);
    }

    this.algorithm.populateTags(sorts, orders);
    this.algorithm.setKnownRooms(rooms);
    this.initialListsGenerated = true;
    if (trigger) this.updateFn.trigger();
  }
  /**
   * Adds a filter condition to the room list store. Filters may be applied async,
   * and thus might not cause an update to the store immediately.
   * @param {IFilterCondition} filter The filter condition to add.
   */


  async addFilter(filter) {
    let promise = Promise.resolve();
    filter.on(_IFilterCondition.FILTER_CHANGED, this.onPrefilterUpdated);
    this.prefilterConditions.push(filter);
    promise = this.recalculatePrefiltering();
    promise.then(() => this.updateFn.trigger());
  }
  /**
   * Removes a filter condition from the room list store. If the filter was
   * not previously added to the room list store, this will no-op. The effects
   * of removing a filter may be applied async and therefore might not cause
   * an update right away.
   * @param {IFilterCondition} filter The filter condition to remove.
   */


  removeFilter(filter) {
    let promise = Promise.resolve();
    let removed = false;
    const idx = this.prefilterConditions.indexOf(filter);

    if (idx >= 0) {
      filter.off(_IFilterCondition.FILTER_CHANGED, this.onPrefilterUpdated);
      this.prefilterConditions.splice(idx, 1);
      promise = this.recalculatePrefiltering();
      removed = true;
    }

    if (removed) {
      promise.then(() => this.updateFn.trigger());
    }
  }
  /**
   * Gets the tags for a room identified by the store. The returned set
   * should never be empty, and will contain DefaultTagID.Untagged if
   * the store is not aware of any tags.
   * @param room The room to get the tags for.
   * @returns The tags for the room.
   */


  getTagsForRoom(room) {
    const algorithmTags = this.algorithm.getTagsForRoom(room);
    if (!algorithmTags) return [_models.DefaultTagID.Untagged];
    return algorithmTags;
  }
  /**
   * Manually update a room with a given cause. This should only be used if the
   * room list store would otherwise be incapable of doing the update itself. Note
   * that this may race with the room list's regular operation.
   * @param {Room} room The room to update.
   * @param {RoomUpdateCause} cause The cause to update for.
   */


  async manualRoomUpdate(room, cause) {
    await this.handleRoomUpdate(room, cause);
    this.updateFn.trigger();
  }

}

exports.RoomListStoreClass = RoomListStoreClass;
(0, _defineProperty2.default)(RoomListStoreClass, "TEST_MODE", false);

class RoomListStore {
  static get instance() {
    if (!this.internalInstance) {
      const instance = new RoomListStoreClass();
      instance.start();
      this.internalInstance = instance;
    }

    return this.internalInstance;
  }

}

exports.default = RoomListStore;
(0, _defineProperty2.default)(RoomListStore, "internalInstance", void 0);
window.mxRoomListStore = RoomListStore.instance;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMSVNUU19VUERBVEVfRVZFTlQiLCJSb29tTGlzdFN0b3JlRXZlbnQiLCJMaXN0c1VwZGF0ZSIsIlJvb21MaXN0U3RvcmVDbGFzcyIsIkFzeW5jU3RvcmVXaXRoQ2xpZW50IiwiY29uc3RydWN0b3IiLCJkZWZhdWx0RGlzcGF0Y2hlciIsIkFsZ29yaXRobSIsIk1hcmtlZEV4ZWN1dGlvbiIsInRhZ0lkIiwiT2JqZWN0Iiwia2V5cyIsIm9yZGVyZWRMaXN0cyIsIlJvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlIiwiaW5zdGFuY2UiLCJnZXRMaXN0U3RhdGUiLCJzZXRSb29tcyIsImVtaXQiLCJmb3JjZVVwZGF0ZSIsInVwZGF0ZUZuIiwibWFyayIsInRyaWdnZXIiLCJyZWNhbGN1bGF0ZVByZWZpbHRlcmluZyIsInNldE1heExpc3RlbmVycyIsImFsZ29yaXRobSIsInN0YXJ0Iiwic2V0dXBXYXRjaGVycyIsIlNwYWNlV2F0Y2hlciIsImdldE9yZGVyZWRSb29tcyIsInJlc2V0U3RvcmUiLCJyZXNldCIsInByZWZpbHRlckNvbmRpdGlvbnMiLCJpbml0aWFsTGlzdHNHZW5lcmF0ZWQiLCJvZmYiLCJMSVNUX1VQREFURURfRVZFTlQiLCJvbkFsZ29yaXRobUxpc3RVcGRhdGVkIiwiRklMVEVSX0NIQU5HRUQiLCJzdG9wIiwib24iLCJtYWtlUmVhZHkiLCJmb3JjZWRDbGllbnQiLCJyZWFkeVN0b3JlIiwidXNlVW5pdFRlc3RDbGllbnQiLCJSb29tVmlld1N0b3JlIiwiYWRkTGlzdGVuZXIiLCJoYW5kbGVSVlNVcGRhdGUiLCJvbkFsZ29yaXRobUZpbHRlclVwZGF0ZWQiLCJsb2dnZXIiLCJsb2ciLCJ1cGRhdGVBbGdvcml0aG1JbnN0YW5jZXMiLCJyZWdlbmVyYXRlQWxsTGlzdHMiLCJtYXRyaXhDbGllbnQiLCJhY3RpdmVSb29tSWQiLCJnZXRSb29tSWQiLCJzdGlja3lSb29tIiwic2V0U3RpY2t5Um9vbSIsImFjdGl2ZVJvb20iLCJnZXRSb29tIiwid2FybiIsIm9uUmVhZHkiLCJvbk5vdFJlYWR5Iiwib25BY3Rpb24iLCJwYXlsb2FkIiwibG9naWNhbGx5UmVhZHkiLCJURVNUX01PREUiLCJvbkRpc3BhdGNoQXN5bmMiLCJzZXRJbW1lZGlhdGUiLCJFcnJvciIsImFjdGlvbiIsInJlYWRSZWNlaXB0Q2hhbmdlSXNGb3IiLCJldmVudCIsInJvb20iLCJyb29tSWQiLCJoYW5kbGVSb29tVXBkYXRlIiwiUm9vbVVwZGF0ZUNhdXNlIiwiUmVhZFJlY2VpcHQiLCJyb29tUGF5bG9hZCIsIlBvc3NpYmxlVGFnQ2hhbmdlIiwiZXZlbnRQYXlsb2FkIiwiaXNMaXZlRXZlbnQiLCJpc0xpdmVVbmZpbHRlcmVkUm9vbVRpbWVsaW5lRXZlbnQiLCJ0cnlVcGRhdGUiLCJ1cGRhdGVkUm9vbSIsImdldFR5cGUiLCJFdmVudFR5cGUiLCJSb29tVG9tYnN0b25lIiwiZ2V0U3RhdGVLZXkiLCJuZXdSb29tIiwiZ2V0Q29udGVudCIsIlRpbWVsaW5lIiwiZ2V0SWQiLCJzZXRUaW1lb3V0IiwiZXZlbnRfdHlwZSIsIkRpcmVjdCIsImRtTWFwIiwidXNlcklkIiwicm9vbUlkcyIsIm1lbWJlcnNoaXBQYXlsb2FkIiwib2xkTWVtYmVyc2hpcCIsImdldEVmZmVjdGl2ZU1lbWJlcnNoaXAiLCJuZXdNZW1iZXJzaGlwIiwibWVtYmVyc2hpcCIsIkVmZmVjdGl2ZU1lbWJlcnNoaXAiLCJKb2luIiwiY3JlYXRlRXZlbnQiLCJjdXJyZW50U3RhdGUiLCJnZXRTdGF0ZUV2ZW50cyIsIlJvb21DcmVhdGUiLCJwcmV2Um9vbSIsImlzU3RpY2t5IiwiUm9vbVJlbW92ZWQiLCJOZXdSb29tIiwiSW52aXRlIiwiY2F1c2UiLCJnZXRNeU1lbWJlcnNoaXAiLCJWaXNpYmlsaXR5UHJvdmlkZXIiLCJvbk5ld0ludml0ZWRSb29tIiwiaXNSb29tVmlzaWJsZSIsImV2ZXJ5IiwiYyIsImlzVmlzaWJsZSIsInNob3VsZFVwZGF0ZSIsImhhc1RhZ1NvcnRpbmdNYXAiLCJ1cGRhdGVzSW5oaWJpdGVkIiwicm9vbXMiLCJnZXRQbGF1c2libGVSb29tcyIsImN1cnJlbnRTdGlja3kiLCJzdGlja3lJc1N0aWxsUHJlc2VudCIsImluY2x1ZGVzIiwic2V0S25vd25Sb29tcyIsInNldFRhZ1NvcnRpbmciLCJzb3J0Iiwic2V0QW5kUGVyc2lzdFRhZ1NvcnRpbmciLCJsb2NhbFN0b3JhZ2UiLCJzZXRJdGVtIiwiZ2V0VGFnU29ydGluZyIsImdldFN0b3JlZFRhZ1NvcnRpbmciLCJnZXRJdGVtIiwiY2FsY3VsYXRlVGFnU29ydGluZyIsImlzRGVmYXVsdFJlY2VudCIsIkRlZmF1bHRUYWdJRCIsIkRNIiwiZGVmYXVsdFNvcnQiLCJTb3J0QWxnb3JpdGhtIiwiUmVjZW50IiwiQWxwaGFiZXRpYyIsInNldHRpbmdBbHBoYWJldGljYWwiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJkZWZpbmVkU29ydCIsInN0b3JlZFNvcnQiLCJ0YWdTb3J0IiwiaXNOdWxsT3JVbmRlZmluZWQiLCJzZXRMaXN0T3JkZXIiLCJvcmRlciIsInNldEFuZFBlcnNpc3RMaXN0T3JkZXIiLCJzZXRMaXN0T3JkZXJpbmciLCJnZXRMaXN0T3JkZXIiLCJnZXRMaXN0T3JkZXJpbmciLCJnZXRTdG9yZWRMaXN0T3JkZXIiLCJjYWxjdWxhdGVMaXN0T3JkZXIiLCJkZWZhdWx0T3JkZXIiLCJMaXN0QWxnb3JpdGhtIiwiTmF0dXJhbCIsInNldHRpbmdJbXBvcnRhbmNlIiwiZGVmaW5lZE9yZGVyIiwic3RvcmVkT3JkZXIiLCJsaXN0T3JkZXIiLCJJbXBvcnRhbmNlIiwidGFnIiwiZ2V0VmlzaWJsZVJvb21zIiwiZmlsdGVyIiwiciIsImxlbmd0aCIsInNvcnRzIiwib3JkZXJzIiwiYWxsVGFncyIsIk9yZGVyZWREZWZhdWx0VGFnSURzIiwiUm9vbUxpc3RMYXlvdXRTdG9yZSIsImVuc3VyZUxheW91dEV4aXN0cyIsInBvcHVsYXRlVGFncyIsImFkZEZpbHRlciIsInByb21pc2UiLCJQcm9taXNlIiwicmVzb2x2ZSIsIm9uUHJlZmlsdGVyVXBkYXRlZCIsInB1c2giLCJ0aGVuIiwicmVtb3ZlRmlsdGVyIiwicmVtb3ZlZCIsImlkeCIsImluZGV4T2YiLCJzcGxpY2UiLCJnZXRUYWdzRm9yUm9vbSIsImFsZ29yaXRobVRhZ3MiLCJVbnRhZ2dlZCIsIm1hbnVhbFJvb21VcGRhdGUiLCJSb29tTGlzdFN0b3JlIiwiaW50ZXJuYWxJbnN0YW5jZSIsIndpbmRvdyIsIm14Um9vbUxpc3RTdG9yZSJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zdG9yZXMvcm9vbS1saXN0L1Jvb21MaXN0U3RvcmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE4IC0gMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7IE1hdHJpeENsaWVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jbGllbnRcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCB7IGlzTnVsbE9yVW5kZWZpbmVkIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL3V0aWxzXCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5pbXBvcnQgeyBFdmVudFR5cGUgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL2V2ZW50XCI7XG5cbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgeyBEZWZhdWx0VGFnSUQsIE9yZGVyZWREZWZhdWx0VGFnSURzLCBSb29tVXBkYXRlQ2F1c2UsIFRhZ0lEIH0gZnJvbSBcIi4vbW9kZWxzXCI7XG5pbXBvcnQgeyBJTGlzdE9yZGVyaW5nTWFwLCBJVGFnTWFwLCBJVGFnU29ydGluZ01hcCwgTGlzdEFsZ29yaXRobSwgU29ydEFsZ29yaXRobSB9IGZyb20gXCIuL2FsZ29yaXRobXMvbW9kZWxzXCI7XG5pbXBvcnQgeyBBY3Rpb25QYXlsb2FkIH0gZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHNcIjtcbmltcG9ydCBkZWZhdWx0RGlzcGF0Y2hlciBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQgeyByZWFkUmVjZWlwdENoYW5nZUlzRm9yIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3JlYWQtcmVjZWlwdHNcIjtcbmltcG9ydCB7IEZJTFRFUl9DSEFOR0VELCBJRmlsdGVyQ29uZGl0aW9uIH0gZnJvbSBcIi4vZmlsdGVycy9JRmlsdGVyQ29uZGl0aW9uXCI7XG5pbXBvcnQgeyBSb29tVmlld1N0b3JlIH0gZnJvbSBcIi4uL1Jvb21WaWV3U3RvcmVcIjtcbmltcG9ydCB7IEFsZ29yaXRobSwgTElTVF9VUERBVEVEX0VWRU5UIH0gZnJvbSBcIi4vYWxnb3JpdGhtcy9BbGdvcml0aG1cIjtcbmltcG9ydCB7IEVmZmVjdGl2ZU1lbWJlcnNoaXAsIGdldEVmZmVjdGl2ZU1lbWJlcnNoaXAgfSBmcm9tIFwiLi4vLi4vdXRpbHMvbWVtYmVyc2hpcFwiO1xuaW1wb3J0IFJvb21MaXN0TGF5b3V0U3RvcmUgZnJvbSBcIi4vUm9vbUxpc3RMYXlvdXRTdG9yZVwiO1xuaW1wb3J0IHsgTWFya2VkRXhlY3V0aW9uIH0gZnJvbSBcIi4uLy4uL3V0aWxzL01hcmtlZEV4ZWN1dGlvblwiO1xuaW1wb3J0IHsgQXN5bmNTdG9yZVdpdGhDbGllbnQgfSBmcm9tIFwiLi4vQXN5bmNTdG9yZVdpdGhDbGllbnRcIjtcbmltcG9ydCB7IFJvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlIH0gZnJvbSBcIi4uL25vdGlmaWNhdGlvbnMvUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmVcIjtcbmltcG9ydCB7IFZpc2liaWxpdHlQcm92aWRlciB9IGZyb20gXCIuL2ZpbHRlcnMvVmlzaWJpbGl0eVByb3ZpZGVyXCI7XG5pbXBvcnQgeyBTcGFjZVdhdGNoZXIgfSBmcm9tIFwiLi9TcGFjZVdhdGNoZXJcIjtcbmltcG9ydCB7IElSb29tVGltZWxpbmVBY3Rpb25QYXlsb2FkIH0gZnJvbSBcIi4uLy4uL2FjdGlvbnMvTWF0cml4QWN0aW9uQ3JlYXRvcnNcIjtcbmltcG9ydCB7IFJvb21MaXN0U3RvcmUgYXMgSW50ZXJmYWNlLCBSb29tTGlzdFN0b3JlRXZlbnQgfSBmcm9tIFwiLi9JbnRlcmZhY2VcIjtcblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgLy8gc3RhdGUgaXMgdHJhY2tlZCBpbiB1bmRlcmx5aW5nIGNsYXNzZXNcbn1cblxuZXhwb3J0IGNvbnN0IExJU1RTX1VQREFURV9FVkVOVCA9IFJvb21MaXN0U3RvcmVFdmVudC5MaXN0c1VwZGF0ZTtcblxuZXhwb3J0IGNsYXNzIFJvb21MaXN0U3RvcmVDbGFzcyBleHRlbmRzIEFzeW5jU3RvcmVXaXRoQ2xpZW50PElTdGF0ZT4gaW1wbGVtZW50cyBJbnRlcmZhY2Uge1xuICAgIC8qKlxuICAgICAqIFNldCB0byB0cnVlIGlmIHlvdSdyZSBydW5uaW5nIHRlc3RzIG9uIHRoZSBzdG9yZS4gU2hvdWxkIG5vdCBiZSB0b3VjaGVkIGluXG4gICAgICogYW55IG90aGVyIGVudmlyb25tZW50LlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgVEVTVF9NT0RFID0gZmFsc2U7XG5cbiAgICBwcml2YXRlIGluaXRpYWxMaXN0c0dlbmVyYXRlZCA9IGZhbHNlO1xuICAgIHByaXZhdGUgYWxnb3JpdGhtID0gbmV3IEFsZ29yaXRobSgpO1xuICAgIHByaXZhdGUgcHJlZmlsdGVyQ29uZGl0aW9uczogSUZpbHRlckNvbmRpdGlvbltdID0gW107XG4gICAgcHJpdmF0ZSB1cGRhdGVGbiA9IG5ldyBNYXJrZWRFeGVjdXRpb24oKCkgPT4ge1xuICAgICAgICBmb3IgKGNvbnN0IHRhZ0lkIG9mIE9iamVjdC5rZXlzKHRoaXMub3JkZXJlZExpc3RzKSkge1xuICAgICAgICAgICAgUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUuaW5zdGFuY2UuZ2V0TGlzdFN0YXRlKHRhZ0lkKS5zZXRSb29tcyh0aGlzLm9yZGVyZWRMaXN0c1t0YWdJZF0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZW1pdChMSVNUU19VUERBVEVfRVZFTlQpO1xuICAgIH0pO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKGRlZmF1bHREaXNwYXRjaGVyKTtcbiAgICAgICAgdGhpcy5zZXRNYXhMaXN0ZW5lcnMoMjApOyAvLyBSb29tTGlzdCArIExlZnRQYW5lbCArIDh4Um9vbVN1Ykxpc3QgKyBzcGFyZXNcbiAgICAgICAgdGhpcy5hbGdvcml0aG0uc3RhcnQoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNldHVwV2F0Y2hlcnMoKSB7XG4gICAgICAgIC8vIFRPRE86IE1heWJlIGRlc3Ryb3kgdGhpcyBpZiB0aGlzIGNsYXNzIHN1cHBvcnRzIGRlc3RydWN0aW9uXG4gICAgICAgIG5ldyBTcGFjZVdhdGNoZXIodGhpcyk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBvcmRlcmVkTGlzdHMoKTogSVRhZ01hcCB7XG4gICAgICAgIGlmICghdGhpcy5hbGdvcml0aG0pIHJldHVybiB7fTsgLy8gTm8gdGFncyB5ZXQuXG4gICAgICAgIHJldHVybiB0aGlzLmFsZ29yaXRobS5nZXRPcmRlcmVkUm9vbXMoKTtcbiAgICB9XG5cbiAgICAvLyBJbnRlbmRlZCBmb3IgdGVzdCB1c2FnZVxuICAgIHB1YmxpYyBhc3luYyByZXNldFN0b3JlKCkge1xuICAgICAgICBhd2FpdCB0aGlzLnJlc2V0KCk7XG4gICAgICAgIHRoaXMucHJlZmlsdGVyQ29uZGl0aW9ucyA9IFtdO1xuICAgICAgICB0aGlzLmluaXRpYWxMaXN0c0dlbmVyYXRlZCA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuYWxnb3JpdGhtLm9mZihMSVNUX1VQREFURURfRVZFTlQsIHRoaXMub25BbGdvcml0aG1MaXN0VXBkYXRlZCk7XG4gICAgICAgIHRoaXMuYWxnb3JpdGhtLm9mZihGSUxURVJfQ0hBTkdFRCwgdGhpcy5vbkFsZ29yaXRobUxpc3RVcGRhdGVkKTtcbiAgICAgICAgdGhpcy5hbGdvcml0aG0uc3RvcCgpO1xuICAgICAgICB0aGlzLmFsZ29yaXRobSA9IG5ldyBBbGdvcml0aG0oKTtcbiAgICAgICAgdGhpcy5hbGdvcml0aG0ub24oTElTVF9VUERBVEVEX0VWRU5ULCB0aGlzLm9uQWxnb3JpdGhtTGlzdFVwZGF0ZWQpO1xuICAgICAgICB0aGlzLmFsZ29yaXRobS5vbihGSUxURVJfQ0hBTkdFRCwgdGhpcy5vbkFsZ29yaXRobUxpc3RVcGRhdGVkKTtcblxuICAgICAgICAvLyBSZXNldCBzdGF0ZSB3aXRob3V0IGNhdXNpbmcgdXBkYXRlcyBhcyB0aGUgY2xpZW50IHdpbGwgaGF2ZSBiZWVuIGRlc3Ryb3llZFxuICAgICAgICAvLyBhbmQgZG93bnN0cmVhbSBjb2RlIHdpbGwgdGhyb3cgTlBFIGVycm9ycy5cbiAgICAgICAgYXdhaXQgdGhpcy5yZXNldChudWxsLCB0cnVlKTtcbiAgICB9XG5cbiAgICAvLyBQdWJsaWMgZm9yIHRlc3QgdXNhZ2UuIERvIG5vdCBjYWxsIHRoaXMuXG4gICAgcHVibGljIGFzeW5jIG1ha2VSZWFkeShmb3JjZWRDbGllbnQ/OiBNYXRyaXhDbGllbnQpIHtcbiAgICAgICAgaWYgKGZvcmNlZENsaWVudCkge1xuICAgICAgICAgICAgdGhpcy5yZWFkeVN0b3JlLnVzZVVuaXRUZXN0Q2xpZW50KGZvcmNlZENsaWVudCk7XG4gICAgICAgIH1cblxuICAgICAgICBSb29tVmlld1N0b3JlLmluc3RhbmNlLmFkZExpc3RlbmVyKCgpID0+IHRoaXMuaGFuZGxlUlZTVXBkYXRlKHt9KSk7XG4gICAgICAgIHRoaXMuYWxnb3JpdGhtLm9uKExJU1RfVVBEQVRFRF9FVkVOVCwgdGhpcy5vbkFsZ29yaXRobUxpc3RVcGRhdGVkKTtcbiAgICAgICAgdGhpcy5hbGdvcml0aG0ub24oRklMVEVSX0NIQU5HRUQsIHRoaXMub25BbGdvcml0aG1GaWx0ZXJVcGRhdGVkKTtcbiAgICAgICAgdGhpcy5zZXR1cFdhdGNoZXJzKCk7XG5cbiAgICAgICAgLy8gVXBkYXRlIGFueSBzZXR0aW5ncyBoZXJlLCBhcyBzb21lIG1heSBoYXZlIGhhcHBlbmVkIGJlZm9yZSB3ZSB3ZXJlIGxvZ2ljYWxseSByZWFkeS5cbiAgICAgICAgbG9nZ2VyLmxvZyhcIlJlZ2VuZXJhdGluZyByb29tIGxpc3RzOiBTdGFydHVwXCIpO1xuICAgICAgICB0aGlzLnVwZGF0ZUFsZ29yaXRobUluc3RhbmNlcygpO1xuICAgICAgICB0aGlzLnJlZ2VuZXJhdGVBbGxMaXN0cyh7IHRyaWdnZXI6IGZhbHNlIH0pO1xuICAgICAgICB0aGlzLmhhbmRsZVJWU1VwZGF0ZSh7IHRyaWdnZXI6IGZhbHNlIH0pOyAvLyBmYWtlIGFuIFJWUyB1cGRhdGUgdG8gYWRqdXN0IHN0aWNreSByb29tLCBpZiBuZWVkZWRcblxuICAgICAgICB0aGlzLnVwZGF0ZUZuLm1hcmsoKTsgLy8gd2UgYWxtb3N0IGNlcnRhaW5seSB3YW50IHRvIHRyaWdnZXIgYW4gdXBkYXRlLlxuICAgICAgICB0aGlzLnVwZGF0ZUZuLnRyaWdnZXIoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGVzIHN1c3BlY3RlZCBSb29tVmlld1N0b3JlIGNoYW5nZXMuXG4gICAgICogQHBhcmFtIHRyaWdnZXIgU2V0IHRvIGZhbHNlIHRvIHByZXZlbnQgYSBsaXN0IHVwZGF0ZSBmcm9tIGJlaW5nIHNlbnQuIFNob3VsZCBvbmx5XG4gICAgICogYmUgdXNlZCBpZiB0aGUgY2FsbGluZyBjb2RlIHdpbGwgbWFudWFsbHkgdHJpZ2dlciB0aGUgdXBkYXRlLlxuICAgICAqL1xuICAgIHByaXZhdGUgaGFuZGxlUlZTVXBkYXRlKHsgdHJpZ2dlciA9IHRydWUgfSkge1xuICAgICAgICBpZiAoIXRoaXMubWF0cml4Q2xpZW50KSByZXR1cm47IC8vIFdlIGFzc3VtZSB0aGVyZSB3b24ndCBiZSBSVlMgdXBkYXRlcyB3aXRob3V0IGEgY2xpZW50XG5cbiAgICAgICAgY29uc3QgYWN0aXZlUm9vbUlkID0gUm9vbVZpZXdTdG9yZS5pbnN0YW5jZS5nZXRSb29tSWQoKTtcbiAgICAgICAgaWYgKCFhY3RpdmVSb29tSWQgJiYgdGhpcy5hbGdvcml0aG0uc3RpY2t5Um9vbSkge1xuICAgICAgICAgICAgdGhpcy5hbGdvcml0aG0uc2V0U3RpY2t5Um9vbShudWxsKTtcbiAgICAgICAgfSBlbHNlIGlmIChhY3RpdmVSb29tSWQpIHtcbiAgICAgICAgICAgIGNvbnN0IGFjdGl2ZVJvb20gPSB0aGlzLm1hdHJpeENsaWVudC5nZXRSb29tKGFjdGl2ZVJvb21JZCk7XG4gICAgICAgICAgICBpZiAoIWFjdGl2ZVJvb20pIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIud2FybihgJHthY3RpdmVSb29tSWR9IGlzIGN1cnJlbnQgaW4gUlZTIGJ1dCBtaXNzaW5nIGZyb20gY2xpZW50IC0gY2xlYXJpbmcgc3RpY2t5IHJvb21gKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFsZ29yaXRobS5zZXRTdGlja3lSb29tKG51bGwpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhY3RpdmVSb29tICE9PSB0aGlzLmFsZ29yaXRobS5zdGlja3lSb29tKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hbGdvcml0aG0uc2V0U3RpY2t5Um9vbShhY3RpdmVSb29tKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0cmlnZ2VyKSB0aGlzLnVwZGF0ZUZuLnRyaWdnZXIoKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYXN5bmMgb25SZWFkeSgpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICBhd2FpdCB0aGlzLm1ha2VSZWFkeSgpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBhc3luYyBvbk5vdFJlYWR5KCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGF3YWl0IHRoaXMucmVzZXRTdG9yZSgpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBhc3luYyBvbkFjdGlvbihwYXlsb2FkOiBBY3Rpb25QYXlsb2FkKSB7XG4gICAgICAgIC8vIElmIHdlJ3JlIG5vdCByZW1vdGVseSByZWFkeSwgZG9uJ3QgZXZlbiBib3RoZXIgc2NoZWR1bGluZyB0aGUgZGlzcGF0Y2ggaGFuZGxpbmcuXG4gICAgICAgIC8vIFRoaXMgaXMgcmVwZWF0ZWQgaW4gdGhlIGhhbmRsZXIganVzdCBpbiBjYXNlIHRoaW5ncyBjaGFuZ2UgYmV0d2VlbiBhIGRlY2lzaW9uIGhlcmUgYW5kXG4gICAgICAgIC8vIHdoZW4gdGhlIHRpbWVyIGZpcmVzLlxuICAgICAgICBjb25zdCBsb2dpY2FsbHlSZWFkeSA9IHRoaXMubWF0cml4Q2xpZW50ICYmIHRoaXMuaW5pdGlhbExpc3RzR2VuZXJhdGVkO1xuICAgICAgICBpZiAoIWxvZ2ljYWxseVJlYWR5KSByZXR1cm47XG5cbiAgICAgICAgLy8gV2hlbiB3ZSdyZSBydW5uaW5nIHRlc3RzIHdlIGNhbid0IHJlbGlhYmx5IHVzZSBzZXRJbW1lZGlhdGUgb3V0IG9mIHRpbWluZyBjb25jZXJucy5cbiAgICAgICAgLy8gQXMgc3VjaCwgd2UgdXNlIGEgbW9yZSBzeW5jaHJvbm91cyBtb2RlbC5cbiAgICAgICAgaWYgKFJvb21MaXN0U3RvcmVDbGFzcy5URVNUX01PREUpIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMub25EaXNwYXRjaEFzeW5jKHBheWxvYWQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gV2UgZG8gdGhpcyB0byBpbnRlbnRpb25hbGx5IGJyZWFrIG91dCBvZiB0aGUgY3VycmVudCBldmVudCBsb29wIHRhc2ssIGFsbG93aW5nXG4gICAgICAgIC8vIHVzIHRvIGluc3RlYWQgd2FpdCBmb3IgYSBtb3JlIGNvbnZlbmllbnQgdGltZSB0byBydW4gb3VyIHVwZGF0ZXMuXG4gICAgICAgIHNldEltbWVkaWF0ZSgoKSA9PiB0aGlzLm9uRGlzcGF0Y2hBc3luYyhwYXlsb2FkKSk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGFzeW5jIG9uRGlzcGF0Y2hBc3luYyhwYXlsb2FkOiBBY3Rpb25QYXlsb2FkKSB7XG4gICAgICAgIC8vIEV2ZXJ5dGhpbmcgaGVyZSByZXF1aXJlcyBhIE1hdHJpeENsaWVudCBvciBzb21lIHNvcnQgb2YgbG9naWNhbCByZWFkaW5lc3MuXG4gICAgICAgIGNvbnN0IGxvZ2ljYWxseVJlYWR5ID0gdGhpcy5tYXRyaXhDbGllbnQgJiYgdGhpcy5pbml0aWFsTGlzdHNHZW5lcmF0ZWQ7XG4gICAgICAgIGlmICghbG9naWNhbGx5UmVhZHkpIHJldHVybjtcblxuICAgICAgICBpZiAoIXRoaXMuYWxnb3JpdGhtKSB7XG4gICAgICAgICAgICAvLyBUaGlzIHNob3VsZG4ndCBoYXBwZW4gYmVjYXVzZSBgaW5pdGlhbExpc3RzR2VuZXJhdGVkYCBpbXBsaWVzIHdlIGhhdmUgYW4gYWxnb3JpdGhtLlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUm9vbSBsaXN0IHN0b3JlIGhhcyBubyBhbGdvcml0aG0gdG8gcHJvY2VzcyBkaXNwYXRjaGVyIHVwZGF0ZSB3aXRoXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBheWxvYWQuYWN0aW9uID09PSAnTWF0cml4QWN0aW9ucy5Sb29tLnJlY2VpcHQnKSB7XG4gICAgICAgICAgICAvLyBGaXJzdCBzZWUgaWYgdGhlIHJlY2VpcHQgZXZlbnQgaXMgZm9yIG91ciBvd24gdXNlci4gSWYgaXQgd2FzLCB0cmlnZ2VyXG4gICAgICAgICAgICAvLyBhIHJvb20gdXBkYXRlICh3ZSBwcm9iYWJseSByZWFkIHRoZSByb29tIG9uIGEgZGlmZmVyZW50IGRldmljZSkuXG4gICAgICAgICAgICBpZiAocmVhZFJlY2VpcHRDaGFuZ2VJc0ZvcihwYXlsb2FkLmV2ZW50LCB0aGlzLm1hdHJpeENsaWVudCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByb29tID0gcGF5bG9hZC5yb29tO1xuICAgICAgICAgICAgICAgIGlmICghcm9vbSkge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIud2FybihgT3duIHJlYWQgcmVjZWlwdCB3YXMgaW4gdW5rbm93biByb29tICR7cm9vbS5yb29tSWR9YCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVSb29tVXBkYXRlKHJvb20sIFJvb21VcGRhdGVDYXVzZS5SZWFkUmVjZWlwdCk7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVGbi50cmlnZ2VyKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHBheWxvYWQuYWN0aW9uID09PSAnTWF0cml4QWN0aW9ucy5Sb29tLnRhZ3MnKSB7XG4gICAgICAgICAgICBjb25zdCByb29tUGF5bG9hZCA9ICg8YW55PnBheWxvYWQpOyAvLyBUT0RPOiBUeXBlIG91dCB0aGUgZGlzcGF0Y2hlciB0eXBlc1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVSb29tVXBkYXRlKHJvb21QYXlsb2FkLnJvb20sIFJvb21VcGRhdGVDYXVzZS5Qb3NzaWJsZVRhZ0NoYW5nZSk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUZuLnRyaWdnZXIoKTtcbiAgICAgICAgfSBlbHNlIGlmIChwYXlsb2FkLmFjdGlvbiA9PT0gJ01hdHJpeEFjdGlvbnMuUm9vbS50aW1lbGluZScpIHtcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50UGF5bG9hZCA9IDxJUm9vbVRpbWVsaW5lQWN0aW9uUGF5bG9hZD5wYXlsb2FkO1xuXG4gICAgICAgICAgICAvLyBJZ25vcmUgbm9uLWxpdmUgZXZlbnRzIChiYWNrZmlsbCkgYW5kIG5vdGlmaWNhdGlvbiB0aW1lbGluZSBzZXQgZXZlbnRzICh3aXRob3V0IGEgcm9vbSlcbiAgICAgICAgICAgIGlmICghZXZlbnRQYXlsb2FkLmlzTGl2ZUV2ZW50IHx8XG4gICAgICAgICAgICAgICAgIWV2ZW50UGF5bG9hZC5pc0xpdmVVbmZpbHRlcmVkUm9vbVRpbWVsaW5lRXZlbnQgfHxcbiAgICAgICAgICAgICAgICAhZXZlbnRQYXlsb2FkLnJvb21cbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgcm9vbUlkID0gZXZlbnRQYXlsb2FkLmV2ZW50LmdldFJvb21JZCgpO1xuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMubWF0cml4Q2xpZW50LmdldFJvb20ocm9vbUlkKTtcbiAgICAgICAgICAgIGNvbnN0IHRyeVVwZGF0ZSA9IGFzeW5jICh1cGRhdGVkUm9vbTogUm9vbSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChldmVudFBheWxvYWQuZXZlbnQuZ2V0VHlwZSgpID09PSBFdmVudFR5cGUuUm9vbVRvbWJzdG9uZSAmJlxuICAgICAgICAgICAgICAgICAgICBldmVudFBheWxvYWQuZXZlbnQuZ2V0U3RhdGVLZXkoKSA9PT0gJydcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3Um9vbSA9IHRoaXMubWF0cml4Q2xpZW50LmdldFJvb20oZXZlbnRQYXlsb2FkLmV2ZW50LmdldENvbnRlbnQoKVsncmVwbGFjZW1lbnRfcm9vbSddKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1Jvb20pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHdlIGhhdmUgdGhlIG5ldyByb29tLCB0aGVuIHRoZSBuZXcgcm9vbSBjaGVjayB3aWxsIGhhdmUgc2VlbiB0aGUgcHJlZGVjZXNzb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFuZCBkaWQgdGhlIHJlcXVpcmVkIHVwZGF0ZXMsIHNvIGRvIG5vdGhpbmcgaGVyZS5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmhhbmRsZVJvb21VcGRhdGUodXBkYXRlZFJvb20sIFJvb21VcGRhdGVDYXVzZS5UaW1lbGluZSk7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVGbi50cmlnZ2VyKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKCFyb29tKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oYExpdmUgdGltZWxpbmUgZXZlbnQgJHtldmVudFBheWxvYWQuZXZlbnQuZ2V0SWQoKX0gcmVjZWl2ZWQgd2l0aG91dCBhc3NvY2lhdGVkIHJvb21gKTtcbiAgICAgICAgICAgICAgICBsb2dnZXIud2FybihgUXVldWluZyBmYWlsZWQgcm9vbSB1cGRhdGUgZm9yIHJldHJ5IGFzIGEgcmVzdWx0LmApO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cGRhdGVkUm9vbSA9IHRoaXMubWF0cml4Q2xpZW50LmdldFJvb20ocm9vbUlkKTtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgdHJ5VXBkYXRlKHVwZGF0ZWRSb29tKTtcbiAgICAgICAgICAgICAgICB9LCAxMDApOyAvLyAxMDBtcyBzaG91bGQgYmUgZW5vdWdoIGZvciB0aGUgcm9vbSB0byBzaG93IHVwXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhd2FpdCB0cnlVcGRhdGUocm9vbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAocGF5bG9hZC5hY3Rpb24gPT09ICdNYXRyaXhBY3Rpb25zLkV2ZW50LmRlY3J5cHRlZCcpIHtcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50UGF5bG9hZCA9ICg8YW55PnBheWxvYWQpOyAvLyBUT0RPOiBUeXBlIG91dCB0aGUgZGlzcGF0Y2hlciB0eXBlc1xuICAgICAgICAgICAgY29uc3Qgcm9vbUlkID0gZXZlbnRQYXlsb2FkLmV2ZW50LmdldFJvb21JZCgpO1xuICAgICAgICAgICAgaWYgKCFyb29tSWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByb29tID0gdGhpcy5tYXRyaXhDbGllbnQuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICAgICAgaWYgKCFyb29tKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oYEV2ZW50ICR7ZXZlbnRQYXlsb2FkLmV2ZW50LmdldElkKCl9IHdhcyBkZWNyeXB0ZWQgaW4gYW4gdW5rbm93biByb29tICR7cm9vbUlkfWApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF3YWl0IHRoaXMuaGFuZGxlUm9vbVVwZGF0ZShyb29tLCBSb29tVXBkYXRlQ2F1c2UuVGltZWxpbmUpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVGbi50cmlnZ2VyKCk7XG4gICAgICAgIH0gZWxzZSBpZiAocGF5bG9hZC5hY3Rpb24gPT09ICdNYXRyaXhBY3Rpb25zLmFjY291bnREYXRhJyAmJiBwYXlsb2FkLmV2ZW50X3R5cGUgPT09IEV2ZW50VHlwZS5EaXJlY3QpIHtcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50UGF5bG9hZCA9ICg8YW55PnBheWxvYWQpOyAvLyBUT0RPOiBUeXBlIG91dCB0aGUgZGlzcGF0Y2hlciB0eXBlc1xuICAgICAgICAgICAgY29uc3QgZG1NYXAgPSBldmVudFBheWxvYWQuZXZlbnQuZ2V0Q29udGVudCgpO1xuICAgICAgICAgICAgZm9yIChjb25zdCB1c2VySWQgb2YgT2JqZWN0LmtleXMoZG1NYXApKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vbUlkcyA9IGRtTWFwW3VzZXJJZF07XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCByb29tSWQgb2Ygcm9vbUlkcykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByb29tID0gdGhpcy5tYXRyaXhDbGllbnQuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXJvb20pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci53YXJuKGAke3Jvb21JZH0gd2FzIGZvdW5kIGluIERNcyBidXQgdGhlIHJvb20gaXMgbm90IGluIHRoZSBzdG9yZWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAvLyBXZSBleHBlY3QgdGhpcyBSb29tVXBkYXRlQ2F1c2UgdG8gbm8tb3AgaWYgdGhlcmUncyBubyBjaGFuZ2UsIGFuZCB3ZSBkb24ndCBleHBlY3RcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhlIHVzZXIgdG8gaGF2ZSBodW5kcmVkcyBvZiByb29tcyB0byB1cGRhdGUgaW4gb25lIGV2ZW50LiBBcyBzdWNoLCB3ZSBqdXN0IGhhbW1lclxuICAgICAgICAgICAgICAgICAgICAvLyBhd2F5IGF0IHVwZGF0ZXMgdW50aWwgdGhlIHByb2JsZW0gaXMgc29sdmVkLiBJZiB3ZSB3ZXJlIGV4cGVjdGluZyBtb3JlIHRoYW4gYSBjb3VwbGVcbiAgICAgICAgICAgICAgICAgICAgLy8gb2Ygcm9vbXMgdG8gYmUgdXBkYXRlZCBhdCBvbmNlLCB3ZSB3b3VsZCBjb25zaWRlciBiYXRjaGluZyB0aGUgcm9vbXMgdXAuXG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuaGFuZGxlUm9vbVVwZGF0ZShyb29tLCBSb29tVXBkYXRlQ2F1c2UuUG9zc2libGVUYWdDaGFuZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudXBkYXRlRm4udHJpZ2dlcigpO1xuICAgICAgICB9IGVsc2UgaWYgKHBheWxvYWQuYWN0aW9uID09PSAnTWF0cml4QWN0aW9ucy5Sb29tLm15TWVtYmVyc2hpcCcpIHtcbiAgICAgICAgICAgIGNvbnN0IG1lbWJlcnNoaXBQYXlsb2FkID0gKDxhbnk+cGF5bG9hZCk7IC8vIFRPRE86IFR5cGUgb3V0IHRoZSBkaXNwYXRjaGVyIHR5cGVzXG4gICAgICAgICAgICBjb25zdCBvbGRNZW1iZXJzaGlwID0gZ2V0RWZmZWN0aXZlTWVtYmVyc2hpcChtZW1iZXJzaGlwUGF5bG9hZC5vbGRNZW1iZXJzaGlwKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld01lbWJlcnNoaXAgPSBnZXRFZmZlY3RpdmVNZW1iZXJzaGlwKG1lbWJlcnNoaXBQYXlsb2FkLm1lbWJlcnNoaXApO1xuICAgICAgICAgICAgaWYgKG9sZE1lbWJlcnNoaXAgIT09IEVmZmVjdGl2ZU1lbWJlcnNoaXAuSm9pbiAmJiBuZXdNZW1iZXJzaGlwID09PSBFZmZlY3RpdmVNZW1iZXJzaGlwLkpvaW4pIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSdyZSBqb2luaW5nIGFuIHVwZ3JhZGVkIHJvb20sIHdlJ2xsIHdhbnQgdG8gbWFrZSBzdXJlIHdlIGRvbid0IHByb2xpZmVyYXRlXG4gICAgICAgICAgICAgICAgLy8gdGhlIGRlYWQgcm9vbSBpbiB0aGUgbGlzdC5cbiAgICAgICAgICAgICAgICBjb25zdCBjcmVhdGVFdmVudCA9IG1lbWJlcnNoaXBQYXlsb2FkLnJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKEV2ZW50VHlwZS5Sb29tQ3JlYXRlLCBcIlwiKTtcbiAgICAgICAgICAgICAgICBpZiAoY3JlYXRlRXZlbnQgJiYgY3JlYXRlRXZlbnQuZ2V0Q29udGVudCgpWydwcmVkZWNlc3NvciddKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByZXZSb29tID0gdGhpcy5tYXRyaXhDbGllbnQuZ2V0Um9vbShjcmVhdGVFdmVudC5nZXRDb250ZW50KClbJ3ByZWRlY2Vzc29yJ11bJ3Jvb21faWQnXSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmV2Um9vbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNTdGlja3kgPSB0aGlzLmFsZ29yaXRobS5zdGlja3lSb29tID09PSBwcmV2Um9vbTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc1N0aWNreSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWxnb3JpdGhtLnNldFN0aWNreVJvb20obnVsbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdGU6IHdlIGhpdCB0aGUgYWxnb3JpdGhtIGluc3RlYWQgb2Ygb3VyIGhhbmRsZVJvb21VcGRhdGUoKSBmdW5jdGlvbiB0b1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXZvaWQgcmVkdW5kYW50IHVwZGF0ZXMuXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFsZ29yaXRobS5oYW5kbGVSb29tVXBkYXRlKHByZXZSb29tLCBSb29tVXBkYXRlQ2F1c2UuUm9vbVJlbW92ZWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5oYW5kbGVSb29tVXBkYXRlKG1lbWJlcnNoaXBQYXlsb2FkLnJvb20sIFJvb21VcGRhdGVDYXVzZS5OZXdSb29tKTtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUZuLnRyaWdnZXIoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvbGRNZW1iZXJzaGlwICE9PSBFZmZlY3RpdmVNZW1iZXJzaGlwLkludml0ZSAmJiBuZXdNZW1iZXJzaGlwID09PSBFZmZlY3RpdmVNZW1iZXJzaGlwLkludml0ZSkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuaGFuZGxlUm9vbVVwZGF0ZShtZW1iZXJzaGlwUGF5bG9hZC5yb29tLCBSb29tVXBkYXRlQ2F1c2UuTmV3Um9vbSk7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVGbi50cmlnZ2VyKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJZiBpdCdzIG5vdCBhIGpvaW4sIGl0J3MgdHJhbnNpdGlvbmluZyBpbnRvIGEgZGlmZmVyZW50IGxpc3QgKHBvc3NpYmx5IGhpc3RvcmljYWwpXG4gICAgICAgICAgICBpZiAob2xkTWVtYmVyc2hpcCAhPT0gbmV3TWVtYmVyc2hpcCkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuaGFuZGxlUm9vbVVwZGF0ZShtZW1iZXJzaGlwUGF5bG9hZC5yb29tLCBSb29tVXBkYXRlQ2F1c2UuUG9zc2libGVUYWdDaGFuZ2UpO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlRm4udHJpZ2dlcigpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgaGFuZGxlUm9vbVVwZGF0ZShyb29tOiBSb29tLCBjYXVzZTogUm9vbVVwZGF0ZUNhdXNlKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgaWYgKGNhdXNlID09PSBSb29tVXBkYXRlQ2F1c2UuTmV3Um9vbSAmJiByb29tLmdldE15TWVtYmVyc2hpcCgpID09PSBcImludml0ZVwiKSB7XG4gICAgICAgICAgICAvLyBMZXQgdGhlIHZpc2liaWxpdHkgcHJvdmlkZXIga25vdyB0aGF0IHRoZXJlIGlzIGEgbmV3IGludml0ZWQgcm9vbS4gSXQgd291bGQgYmUgbmljZVxuICAgICAgICAgICAgLy8gaWYgdGhpcyBjb3VsZCBqdXN0IGJlIGFuIGV2ZW50IHRoYXQgdGhpbmdzIGxpc3RlbiBmb3IgYnV0IHRoZSBwb2ludCBvZiB0aGlzIGlzIHRoYXRcbiAgICAgICAgICAgIC8vIHdlIGRlbGF5IGRvaW5nIGFueXRoaW5nIGFib3V0IHRoaXMgcm9vbSB1bnRpbCB0aGUgVm9pcFVzZXJNYXBwZXIgaGFkIGhhZCBhIGNoYW5jZVxuICAgICAgICAgICAgLy8gdG8gZG8gdGhlIHRoaW5ncyBpdCBuZWVkcyB0byBkbyB0byBkZWNpZGUgaWYgd2Ugc2hvdWxkIHNob3cgdGhpcyByb29tIG9yIG5vdCwgc29cbiAgICAgICAgICAgIC8vIGFuIGV2ZW4gd291bGRuJ3QgZXQgdXMgZG8gdGhhdC5cbiAgICAgICAgICAgIGF3YWl0IFZpc2liaWxpdHlQcm92aWRlci5pbnN0YW5jZS5vbk5ld0ludml0ZWRSb29tKHJvb20pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFWaXNpYmlsaXR5UHJvdmlkZXIuaW5zdGFuY2UuaXNSb29tVmlzaWJsZShyb29tKSkge1xuICAgICAgICAgICAgcmV0dXJuOyAvLyBkb24ndCBkbyBhbnl0aGluZyBvbiByb29tcyB0aGF0IGFyZW4ndCB2aXNpYmxlXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoKGNhdXNlID09PSBSb29tVXBkYXRlQ2F1c2UuTmV3Um9vbSB8fCBjYXVzZSA9PT0gUm9vbVVwZGF0ZUNhdXNlLlBvc3NpYmxlVGFnQ2hhbmdlKSAmJlxuICAgICAgICAgICAgIXRoaXMucHJlZmlsdGVyQ29uZGl0aW9ucy5ldmVyeShjID0+IGMuaXNWaXNpYmxlKHJvb20pKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybjsgLy8gZG9uJ3QgZG8gYW55dGhpbmcgb24gbmV3L21vdmVkIHJvb21zIHdoaWNoIG91Z2h0IG5vdCB0byBiZSBzaG93blxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2hvdWxkVXBkYXRlID0gdGhpcy5hbGdvcml0aG0uaGFuZGxlUm9vbVVwZGF0ZShyb29tLCBjYXVzZSk7XG4gICAgICAgIGlmIChzaG91bGRVcGRhdGUpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRm4ubWFyaygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyByZWNhbGN1bGF0ZVByZWZpbHRlcmluZygpIHtcbiAgICAgICAgaWYgKCF0aGlzLmFsZ29yaXRobSkgcmV0dXJuO1xuICAgICAgICBpZiAoIXRoaXMuYWxnb3JpdGhtLmhhc1RhZ1NvcnRpbmdNYXApIHJldHVybjsgLy8gd2UncmUgc3RpbGwgbG9hZGluZ1xuXG4gICAgICAgIC8vIEluaGliaXQgdXBkYXRlcyBiZWNhdXNlIHdlJ3JlIGFib3V0IHRvIGxpZSBoZWF2aWx5IHRvIHRoZSBhbGdvcml0aG1cbiAgICAgICAgdGhpcy5hbGdvcml0aG0udXBkYXRlc0luaGliaXRlZCA9IHRydWU7XG5cbiAgICAgICAgLy8gRmlndXJlIG91dCB3aGljaCByb29tcyBhcmUgYWJvdXQgdG8gYmUgdmFsaWQsIGFuZCB0aGUgc3RhdGUgb2YgYWZmYWlyc1xuICAgICAgICBjb25zdCByb29tcyA9IHRoaXMuZ2V0UGxhdXNpYmxlUm9vbXMoKTtcbiAgICAgICAgY29uc3QgY3VycmVudFN0aWNreSA9IHRoaXMuYWxnb3JpdGhtLnN0aWNreVJvb207XG4gICAgICAgIGNvbnN0IHN0aWNreUlzU3RpbGxQcmVzZW50ID0gY3VycmVudFN0aWNreSAmJiByb29tcy5pbmNsdWRlcyhjdXJyZW50U3RpY2t5KTtcblxuICAgICAgICAvLyBSZXNldCB0aGUgc3RpY2t5IHJvb20gYmVmb3JlIHJlc2V0dGluZyB0aGUga25vd24gcm9vbXMgc28gdGhlIGFsZ29yaXRobVxuICAgICAgICAvLyBkb2Vzbid0IGZyZWFrIG91dC5cbiAgICAgICAgdGhpcy5hbGdvcml0aG0uc2V0U3RpY2t5Um9vbShudWxsKTtcbiAgICAgICAgdGhpcy5hbGdvcml0aG0uc2V0S25vd25Sb29tcyhyb29tcyk7XG5cbiAgICAgICAgLy8gU2V0IHRoZSBzdGlja3kgcm9vbSBiYWNrLCBpZiBuZWVkZWQsIG5vdyB0aGF0IHdlIGhhdmUgdXBkYXRlZCB0aGUgc3RvcmUuXG4gICAgICAgIC8vIFRoaXMgd2lsbCB1c2UgcmVsYXRpdmUgc3RpY2t5bmVzcyB0byB0aGUgbmV3IHJvb20gc2V0LlxuICAgICAgICBpZiAoc3RpY2t5SXNTdGlsbFByZXNlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuYWxnb3JpdGhtLnNldFN0aWNreVJvb20oY3VycmVudFN0aWNreSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGaW5hbGx5LCBtYXJrIGFuIHVwZGF0ZSBhbmQgcmVzdW1lIHVwZGF0ZXMgZnJvbSB0aGUgYWxnb3JpdGhtXG4gICAgICAgIHRoaXMudXBkYXRlRm4ubWFyaygpO1xuICAgICAgICB0aGlzLmFsZ29yaXRobS51cGRhdGVzSW5oaWJpdGVkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIHNldFRhZ1NvcnRpbmcodGFnSWQ6IFRhZ0lELCBzb3J0OiBTb3J0QWxnb3JpdGhtKSB7XG4gICAgICAgIHRoaXMuc2V0QW5kUGVyc2lzdFRhZ1NvcnRpbmcodGFnSWQsIHNvcnQpO1xuICAgICAgICB0aGlzLnVwZGF0ZUZuLnRyaWdnZXIoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNldEFuZFBlcnNpc3RUYWdTb3J0aW5nKHRhZ0lkOiBUYWdJRCwgc29ydDogU29ydEFsZ29yaXRobSkge1xuICAgICAgICB0aGlzLmFsZ29yaXRobS5zZXRUYWdTb3J0aW5nKHRhZ0lkLCBzb3J0KTtcbiAgICAgICAgLy8gVE9ETzogUGVyLWFjY291bnQ/IGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0MTE0XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGBteF90YWdTb3J0XyR7dGFnSWR9YCwgc29ydCk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFRhZ1NvcnRpbmcodGFnSWQ6IFRhZ0lEKTogU29ydEFsZ29yaXRobSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFsZ29yaXRobS5nZXRUYWdTb3J0aW5nKHRhZ0lkKTtcbiAgICB9XG5cbiAgICAvLyBub2luc3BlY3Rpb24gSlNNZXRob2RDYW5CZVN0YXRpY1xuICAgIHByaXZhdGUgZ2V0U3RvcmVkVGFnU29ydGluZyh0YWdJZDogVGFnSUQpOiBTb3J0QWxnb3JpdGhtIHtcbiAgICAgICAgLy8gVE9ETzogUGVyLWFjY291bnQ/IGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzE0MTE0XG4gICAgICAgIHJldHVybiA8U29ydEFsZ29yaXRobT5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShgbXhfdGFnU29ydF8ke3RhZ0lkfWApO1xuICAgIH1cblxuICAgIC8vIGxvZ2ljIG11c3QgbWF0Y2ggY2FsY3VsYXRlTGlzdE9yZGVyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVUYWdTb3J0aW5nKHRhZ0lkOiBUYWdJRCk6IFNvcnRBbGdvcml0aG0ge1xuICAgICAgICBjb25zdCBpc0RlZmF1bHRSZWNlbnQgPSB0YWdJZCA9PT0gRGVmYXVsdFRhZ0lELkludml0ZSB8fCB0YWdJZCA9PT0gRGVmYXVsdFRhZ0lELkRNO1xuICAgICAgICBjb25zdCBkZWZhdWx0U29ydCA9IGlzRGVmYXVsdFJlY2VudCA/IFNvcnRBbGdvcml0aG0uUmVjZW50IDogU29ydEFsZ29yaXRobS5BbHBoYWJldGljO1xuICAgICAgICBjb25zdCBzZXR0aW5nQWxwaGFiZXRpY2FsID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcIlJvb21MaXN0Lm9yZGVyQWxwaGFiZXRpY2FsbHlcIiwgbnVsbCwgdHJ1ZSk7XG4gICAgICAgIGNvbnN0IGRlZmluZWRTb3J0ID0gdGhpcy5nZXRUYWdTb3J0aW5nKHRhZ0lkKTtcbiAgICAgICAgY29uc3Qgc3RvcmVkU29ydCA9IHRoaXMuZ2V0U3RvcmVkVGFnU29ydGluZyh0YWdJZCk7XG5cbiAgICAgICAgLy8gV2UgdXNlIHRoZSBmb2xsb3dpbmcgb3JkZXIgdG8gZGV0ZXJtaW5lIHdoaWNoIG9mIHRoZSA0IGZsYWdzIHRvIHVzZTpcbiAgICAgICAgLy8gU3RvcmVkID4gU2V0dGluZ3MgPiBEZWZpbmVkID4gRGVmYXVsdFxuXG4gICAgICAgIGxldCB0YWdTb3J0ID0gZGVmYXVsdFNvcnQ7XG4gICAgICAgIGlmIChzdG9yZWRTb3J0KSB7XG4gICAgICAgICAgICB0YWdTb3J0ID0gc3RvcmVkU29ydDtcbiAgICAgICAgfSBlbHNlIGlmICghaXNOdWxsT3JVbmRlZmluZWQoc2V0dGluZ0FscGhhYmV0aWNhbCkpIHtcbiAgICAgICAgICAgIHRhZ1NvcnQgPSBzZXR0aW5nQWxwaGFiZXRpY2FsID8gU29ydEFsZ29yaXRobS5BbHBoYWJldGljIDogU29ydEFsZ29yaXRobS5SZWNlbnQ7XG4gICAgICAgIH0gZWxzZSBpZiAoZGVmaW5lZFNvcnQpIHtcbiAgICAgICAgICAgIHRhZ1NvcnQgPSBkZWZpbmVkU29ydDtcbiAgICAgICAgfSAvLyBlbHNlIGRlZmF1bHQgKGFscmVhZHkgc2V0KVxuXG4gICAgICAgIHJldHVybiB0YWdTb3J0O1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRMaXN0T3JkZXIodGFnSWQ6IFRhZ0lELCBvcmRlcjogTGlzdEFsZ29yaXRobSkge1xuICAgICAgICB0aGlzLnNldEFuZFBlcnNpc3RMaXN0T3JkZXIodGFnSWQsIG9yZGVyKTtcbiAgICAgICAgdGhpcy51cGRhdGVGbi50cmlnZ2VyKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXRBbmRQZXJzaXN0TGlzdE9yZGVyKHRhZ0lkOiBUYWdJRCwgb3JkZXI6IExpc3RBbGdvcml0aG0pIHtcbiAgICAgICAgdGhpcy5hbGdvcml0aG0uc2V0TGlzdE9yZGVyaW5nKHRhZ0lkLCBvcmRlcik7XG4gICAgICAgIC8vIFRPRE86IFBlci1hY2NvdW50PyBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDExNFxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShgbXhfbGlzdE9yZGVyXyR7dGFnSWR9YCwgb3JkZXIpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRMaXN0T3JkZXIodGFnSWQ6IFRhZ0lEKTogTGlzdEFsZ29yaXRobSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFsZ29yaXRobS5nZXRMaXN0T3JkZXJpbmcodGFnSWQpO1xuICAgIH1cblxuICAgIC8vIG5vaW5zcGVjdGlvbiBKU01ldGhvZENhbkJlU3RhdGljXG4gICAgcHJpdmF0ZSBnZXRTdG9yZWRMaXN0T3JkZXIodGFnSWQ6IFRhZ0lEKTogTGlzdEFsZ29yaXRobSB7XG4gICAgICAgIC8vIFRPRE86IFBlci1hY2NvdW50PyBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xNDExNFxuICAgICAgICByZXR1cm4gPExpc3RBbGdvcml0aG0+bG9jYWxTdG9yYWdlLmdldEl0ZW0oYG14X2xpc3RPcmRlcl8ke3RhZ0lkfWApO1xuICAgIH1cblxuICAgIC8vIGxvZ2ljIG11c3QgbWF0Y2ggY2FsY3VsYXRlVGFnU29ydGluZ1xuICAgIHByaXZhdGUgY2FsY3VsYXRlTGlzdE9yZGVyKHRhZ0lkOiBUYWdJRCk6IExpc3RBbGdvcml0aG0ge1xuICAgICAgICBjb25zdCBkZWZhdWx0T3JkZXIgPSBMaXN0QWxnb3JpdGhtLk5hdHVyYWw7XG4gICAgICAgIGNvbnN0IHNldHRpbmdJbXBvcnRhbmNlID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcIlJvb21MaXN0Lm9yZGVyQnlJbXBvcnRhbmNlXCIsIG51bGwsIHRydWUpO1xuICAgICAgICBjb25zdCBkZWZpbmVkT3JkZXIgPSB0aGlzLmdldExpc3RPcmRlcih0YWdJZCk7XG4gICAgICAgIGNvbnN0IHN0b3JlZE9yZGVyID0gdGhpcy5nZXRTdG9yZWRMaXN0T3JkZXIodGFnSWQpO1xuXG4gICAgICAgIC8vIFdlIHVzZSB0aGUgZm9sbG93aW5nIG9yZGVyIHRvIGRldGVybWluZSB3aGljaCBvZiB0aGUgNCBmbGFncyB0byB1c2U6XG4gICAgICAgIC8vIFN0b3JlZCA+IFNldHRpbmdzID4gRGVmaW5lZCA+IERlZmF1bHRcblxuICAgICAgICBsZXQgbGlzdE9yZGVyID0gZGVmYXVsdE9yZGVyO1xuICAgICAgICBpZiAoc3RvcmVkT3JkZXIpIHtcbiAgICAgICAgICAgIGxpc3RPcmRlciA9IHN0b3JlZE9yZGVyO1xuICAgICAgICB9IGVsc2UgaWYgKCFpc051bGxPclVuZGVmaW5lZChzZXR0aW5nSW1wb3J0YW5jZSkpIHtcbiAgICAgICAgICAgIGxpc3RPcmRlciA9IHNldHRpbmdJbXBvcnRhbmNlID8gTGlzdEFsZ29yaXRobS5JbXBvcnRhbmNlIDogTGlzdEFsZ29yaXRobS5OYXR1cmFsO1xuICAgICAgICB9IGVsc2UgaWYgKGRlZmluZWRPcmRlcikge1xuICAgICAgICAgICAgbGlzdE9yZGVyID0gZGVmaW5lZE9yZGVyO1xuICAgICAgICB9IC8vIGVsc2UgZGVmYXVsdCAoYWxyZWFkeSBzZXQpXG5cbiAgICAgICAgcmV0dXJuIGxpc3RPcmRlcjtcbiAgICB9XG5cbiAgICBwcml2YXRlIHVwZGF0ZUFsZ29yaXRobUluc3RhbmNlcygpIHtcbiAgICAgICAgLy8gV2UnbGwgcmVxdWlyZSBhbiB1cGRhdGUsIHNvIG1hcmsgZm9yIG9uZS4gTWFya2luZyBub3cgYWxzbyBwcmV2ZW50cyB0aGUgY2FsbHNcbiAgICAgICAgLy8gdG8gc2V0VGFnU29ydGluZyBhbmQgc2V0TGlzdE9yZGVyIGZyb20gY2F1c2luZyB0cmlnZ2Vycy5cbiAgICAgICAgdGhpcy51cGRhdGVGbi5tYXJrKCk7XG5cbiAgICAgICAgZm9yIChjb25zdCB0YWcgb2YgT2JqZWN0LmtleXModGhpcy5vcmRlcmVkTGlzdHMpKSB7XG4gICAgICAgICAgICBjb25zdCBkZWZpbmVkU29ydCA9IHRoaXMuZ2V0VGFnU29ydGluZyh0YWcpO1xuICAgICAgICAgICAgY29uc3QgZGVmaW5lZE9yZGVyID0gdGhpcy5nZXRMaXN0T3JkZXIodGFnKTtcblxuICAgICAgICAgICAgY29uc3QgdGFnU29ydCA9IHRoaXMuY2FsY3VsYXRlVGFnU29ydGluZyh0YWcpO1xuICAgICAgICAgICAgY29uc3QgbGlzdE9yZGVyID0gdGhpcy5jYWxjdWxhdGVMaXN0T3JkZXIodGFnKTtcblxuICAgICAgICAgICAgaWYgKHRhZ1NvcnQgIT09IGRlZmluZWRTb3J0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBbmRQZXJzaXN0VGFnU29ydGluZyh0YWcsIHRhZ1NvcnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGxpc3RPcmRlciAhPT0gZGVmaW5lZE9yZGVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRBbmRQZXJzaXN0TGlzdE9yZGVyKHRhZywgbGlzdE9yZGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25BbGdvcml0aG1MaXN0VXBkYXRlZCA9IChmb3JjZVVwZGF0ZTogYm9vbGVhbikgPT4ge1xuICAgICAgICB0aGlzLnVwZGF0ZUZuLm1hcmsoKTtcbiAgICAgICAgaWYgKGZvcmNlVXBkYXRlKSB0aGlzLnVwZGF0ZUZuLnRyaWdnZXIoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkFsZ29yaXRobUZpbHRlclVwZGF0ZWQgPSAoKSA9PiB7XG4gICAgICAgIC8vIFRoZSBmaWx0ZXIgY2FuIGhhcHBlbiBvZmYtY3ljbGUsIHNvIHRyaWdnZXIgYW4gdXBkYXRlLiBUaGUgZmlsdGVyIHdpbGwgaGF2ZVxuICAgICAgICAvLyBhbHJlYWR5IGNhdXNlZCBhIG1hcmsuXG4gICAgICAgIHRoaXMudXBkYXRlRm4udHJpZ2dlcigpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUHJlZmlsdGVyVXBkYXRlZCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgYXdhaXQgdGhpcy5yZWNhbGN1bGF0ZVByZWZpbHRlcmluZygpO1xuICAgICAgICB0aGlzLnVwZGF0ZUZuLnRyaWdnZXIoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBnZXRQbGF1c2libGVSb29tcygpOiBSb29tW10ge1xuICAgICAgICBpZiAoIXRoaXMubWF0cml4Q2xpZW50KSByZXR1cm4gW107XG5cbiAgICAgICAgbGV0IHJvb21zID0gdGhpcy5tYXRyaXhDbGllbnQuZ2V0VmlzaWJsZVJvb21zKCkuZmlsdGVyKHIgPT4gVmlzaWJpbGl0eVByb3ZpZGVyLmluc3RhbmNlLmlzUm9vbVZpc2libGUocikpO1xuXG4gICAgICAgIGlmICh0aGlzLnByZWZpbHRlckNvbmRpdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcm9vbXMgPSByb29tcy5maWx0ZXIociA9PiB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBmaWx0ZXIgb2YgdGhpcy5wcmVmaWx0ZXJDb25kaXRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZmlsdGVyLmlzVmlzaWJsZShyKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcm9vbXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVnZW5lcmF0ZXMgdGhlIHJvb20gd2hvbGUgcm9vbSBsaXN0LCBkaXNjYXJkaW5nIGFueSBwcmV2aW91cyByZXN1bHRzLlxuICAgICAqXG4gICAgICogTm90ZTogVGhpcyBpcyBvbmx5IGV4cG9zZWQgZXh0ZXJuYWxseSBmb3IgdGhlIHRlc3RzLiBEbyBub3QgY2FsbCB0aGlzIGZyb20gd2l0aGluXG4gICAgICogdGhlIGFwcC5cbiAgICAgKiBAcGFyYW0gdHJpZ2dlciBTZXQgdG8gZmFsc2UgdG8gcHJldmVudCBhIGxpc3QgdXBkYXRlIGZyb20gYmVpbmcgc2VudC4gU2hvdWxkIG9ubHlcbiAgICAgKiBiZSB1c2VkIGlmIHRoZSBjYWxsaW5nIGNvZGUgd2lsbCBtYW51YWxseSB0cmlnZ2VyIHRoZSB1cGRhdGUuXG4gICAgICovXG4gICAgcHVibGljIHJlZ2VuZXJhdGVBbGxMaXN0cyh7IHRyaWdnZXIgPSB0cnVlIH0pIHtcbiAgICAgICAgbG9nZ2VyLndhcm4oXCJSZWdlbmVyYXRpbmcgYWxsIHJvb20gbGlzdHNcIik7XG5cbiAgICAgICAgY29uc3Qgcm9vbXMgPSB0aGlzLmdldFBsYXVzaWJsZVJvb21zKCk7XG5cbiAgICAgICAgY29uc3Qgc29ydHM6IElUYWdTb3J0aW5nTWFwID0ge307XG4gICAgICAgIGNvbnN0IG9yZGVyczogSUxpc3RPcmRlcmluZ01hcCA9IHt9O1xuICAgICAgICBjb25zdCBhbGxUYWdzID0gWy4uLk9yZGVyZWREZWZhdWx0VGFnSURzXTtcbiAgICAgICAgZm9yIChjb25zdCB0YWdJZCBvZiBhbGxUYWdzKSB7XG4gICAgICAgICAgICBzb3J0c1t0YWdJZF0gPSB0aGlzLmNhbGN1bGF0ZVRhZ1NvcnRpbmcodGFnSWQpO1xuICAgICAgICAgICAgb3JkZXJzW3RhZ0lkXSA9IHRoaXMuY2FsY3VsYXRlTGlzdE9yZGVyKHRhZ0lkKTtcblxuICAgICAgICAgICAgUm9vbUxpc3RMYXlvdXRTdG9yZS5pbnN0YW5jZS5lbnN1cmVMYXlvdXRFeGlzdHModGFnSWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hbGdvcml0aG0ucG9wdWxhdGVUYWdzKHNvcnRzLCBvcmRlcnMpO1xuICAgICAgICB0aGlzLmFsZ29yaXRobS5zZXRLbm93blJvb21zKHJvb21zKTtcblxuICAgICAgICB0aGlzLmluaXRpYWxMaXN0c0dlbmVyYXRlZCA9IHRydWU7XG5cbiAgICAgICAgaWYgKHRyaWdnZXIpIHRoaXMudXBkYXRlRm4udHJpZ2dlcigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBmaWx0ZXIgY29uZGl0aW9uIHRvIHRoZSByb29tIGxpc3Qgc3RvcmUuIEZpbHRlcnMgbWF5IGJlIGFwcGxpZWQgYXN5bmMsXG4gICAgICogYW5kIHRodXMgbWlnaHQgbm90IGNhdXNlIGFuIHVwZGF0ZSB0byB0aGUgc3RvcmUgaW1tZWRpYXRlbHkuXG4gICAgICogQHBhcmFtIHtJRmlsdGVyQ29uZGl0aW9ufSBmaWx0ZXIgVGhlIGZpbHRlciBjb25kaXRpb24gdG8gYWRkLlxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBhZGRGaWx0ZXIoZmlsdGVyOiBJRmlsdGVyQ29uZGl0aW9uKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGxldCBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIGZpbHRlci5vbihGSUxURVJfQ0hBTkdFRCwgdGhpcy5vblByZWZpbHRlclVwZGF0ZWQpO1xuICAgICAgICB0aGlzLnByZWZpbHRlckNvbmRpdGlvbnMucHVzaChmaWx0ZXIpO1xuICAgICAgICBwcm9taXNlID0gdGhpcy5yZWNhbGN1bGF0ZVByZWZpbHRlcmluZygpO1xuICAgICAgICBwcm9taXNlLnRoZW4oKCkgPT4gdGhpcy51cGRhdGVGbi50cmlnZ2VyKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYSBmaWx0ZXIgY29uZGl0aW9uIGZyb20gdGhlIHJvb20gbGlzdCBzdG9yZS4gSWYgdGhlIGZpbHRlciB3YXNcbiAgICAgKiBub3QgcHJldmlvdXNseSBhZGRlZCB0byB0aGUgcm9vbSBsaXN0IHN0b3JlLCB0aGlzIHdpbGwgbm8tb3AuIFRoZSBlZmZlY3RzXG4gICAgICogb2YgcmVtb3ZpbmcgYSBmaWx0ZXIgbWF5IGJlIGFwcGxpZWQgYXN5bmMgYW5kIHRoZXJlZm9yZSBtaWdodCBub3QgY2F1c2VcbiAgICAgKiBhbiB1cGRhdGUgcmlnaHQgYXdheS5cbiAgICAgKiBAcGFyYW0ge0lGaWx0ZXJDb25kaXRpb259IGZpbHRlciBUaGUgZmlsdGVyIGNvbmRpdGlvbiB0byByZW1vdmUuXG4gICAgICovXG4gICAgcHVibGljIHJlbW92ZUZpbHRlcihmaWx0ZXI6IElGaWx0ZXJDb25kaXRpb24pOiB2b2lkIHtcbiAgICAgICAgbGV0IHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgbGV0IHJlbW92ZWQgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgaWR4ID0gdGhpcy5wcmVmaWx0ZXJDb25kaXRpb25zLmluZGV4T2YoZmlsdGVyKTtcbiAgICAgICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICAgICAgICBmaWx0ZXIub2ZmKEZJTFRFUl9DSEFOR0VELCB0aGlzLm9uUHJlZmlsdGVyVXBkYXRlZCk7XG4gICAgICAgICAgICB0aGlzLnByZWZpbHRlckNvbmRpdGlvbnMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgICAgICBwcm9taXNlID0gdGhpcy5yZWNhbGN1bGF0ZVByZWZpbHRlcmluZygpO1xuICAgICAgICAgICAgcmVtb3ZlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVtb3ZlZCkge1xuICAgICAgICAgICAgcHJvbWlzZS50aGVuKCgpID0+IHRoaXMudXBkYXRlRm4udHJpZ2dlcigpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIHRhZ3MgZm9yIGEgcm9vbSBpZGVudGlmaWVkIGJ5IHRoZSBzdG9yZS4gVGhlIHJldHVybmVkIHNldFxuICAgICAqIHNob3VsZCBuZXZlciBiZSBlbXB0eSwgYW5kIHdpbGwgY29udGFpbiBEZWZhdWx0VGFnSUQuVW50YWdnZWQgaWZcbiAgICAgKiB0aGUgc3RvcmUgaXMgbm90IGF3YXJlIG9mIGFueSB0YWdzLlxuICAgICAqIEBwYXJhbSByb29tIFRoZSByb29tIHRvIGdldCB0aGUgdGFncyBmb3IuXG4gICAgICogQHJldHVybnMgVGhlIHRhZ3MgZm9yIHRoZSByb29tLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRUYWdzRm9yUm9vbShyb29tOiBSb29tKTogVGFnSURbXSB7XG4gICAgICAgIGNvbnN0IGFsZ29yaXRobVRhZ3MgPSB0aGlzLmFsZ29yaXRobS5nZXRUYWdzRm9yUm9vbShyb29tKTtcbiAgICAgICAgaWYgKCFhbGdvcml0aG1UYWdzKSByZXR1cm4gW0RlZmF1bHRUYWdJRC5VbnRhZ2dlZF07XG4gICAgICAgIHJldHVybiBhbGdvcml0aG1UYWdzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1hbnVhbGx5IHVwZGF0ZSBhIHJvb20gd2l0aCBhIGdpdmVuIGNhdXNlLiBUaGlzIHNob3VsZCBvbmx5IGJlIHVzZWQgaWYgdGhlXG4gICAgICogcm9vbSBsaXN0IHN0b3JlIHdvdWxkIG90aGVyd2lzZSBiZSBpbmNhcGFibGUgb2YgZG9pbmcgdGhlIHVwZGF0ZSBpdHNlbGYuIE5vdGVcbiAgICAgKiB0aGF0IHRoaXMgbWF5IHJhY2Ugd2l0aCB0aGUgcm9vbSBsaXN0J3MgcmVndWxhciBvcGVyYXRpb24uXG4gICAgICogQHBhcmFtIHtSb29tfSByb29tIFRoZSByb29tIHRvIHVwZGF0ZS5cbiAgICAgKiBAcGFyYW0ge1Jvb21VcGRhdGVDYXVzZX0gY2F1c2UgVGhlIGNhdXNlIHRvIHVwZGF0ZSBmb3IuXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIG1hbnVhbFJvb21VcGRhdGUocm9vbTogUm9vbSwgY2F1c2U6IFJvb21VcGRhdGVDYXVzZSkge1xuICAgICAgICBhd2FpdCB0aGlzLmhhbmRsZVJvb21VcGRhdGUocm9vbSwgY2F1c2UpO1xuICAgICAgICB0aGlzLnVwZGF0ZUZuLnRyaWdnZXIoKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJvb21MaXN0U3RvcmUge1xuICAgIHByaXZhdGUgc3RhdGljIGludGVybmFsSW5zdGFuY2U6IEludGVyZmFjZTtcblxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0IGluc3RhbmNlKCk6IEludGVyZmFjZSB7XG4gICAgICAgIGlmICghdGhpcy5pbnRlcm5hbEluc3RhbmNlKSB7XG4gICAgICAgICAgICBjb25zdCBpbnN0YW5jZSA9IG5ldyBSb29tTGlzdFN0b3JlQ2xhc3MoKTtcbiAgICAgICAgICAgIGluc3RhbmNlLnN0YXJ0KCk7XG4gICAgICAgICAgICB0aGlzLmludGVybmFsSW5zdGFuY2UgPSBpbnN0YW5jZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmludGVybmFsSW5zdGFuY2U7XG4gICAgfVxufVxuXG53aW5kb3cubXhSb29tTGlzdFN0b3JlID0gUm9vbUxpc3RTdG9yZS5pbnN0YW5jZTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFrQkE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQStCTyxNQUFNQSxrQkFBa0IsR0FBR0MsNkJBQUEsQ0FBbUJDLFdBQTlDOzs7QUFFQSxNQUFNQyxrQkFBTixTQUFpQ0MsMENBQWpDLENBQW1GO0VBQ3RGO0FBQ0o7QUFDQTtBQUNBO0VBYUlDLFdBQVcsR0FBRztJQUNWLE1BQU1DLG1CQUFOO0lBRFUsNkRBVmtCLEtBVWxCO0lBQUEsaURBVE0sSUFBSUMsb0JBQUosRUFTTjtJQUFBLDJEQVJvQyxFQVFwQztJ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