"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LIST_UPDATED_EVENT = exports.Algorithm = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _utils = require("matrix-js-sdk/src/utils");

var _events = require("events");

var _logger = require("matrix-js-sdk/src/logger");

var _DMRoomMap = _interopRequireDefault(require("../../../utils/DMRoomMap"));

var _arrays = require("../../../utils/arrays");

var _models = require("../models");

var _membership = require("../../../utils/membership");

var _listOrdering = require("./list-ordering");

var _VisibilityProvider = require("../filters/VisibilityProvider");

var _CallStore = require("../../CallStore");

/*
Copyright 2020, 2021 The Matrix.org Foundation C.I.C.

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

/**
 * Fired when the Algorithm has determined a list has been updated.
 */
const LIST_UPDATED_EVENT = "list_updated_event"; // These are the causes which require a room to be known in order for us to handle them. If
// a cause in this list is raised and we don't know about the room, we don't handle the update.
//
// Note: these typically happen when a new room is coming in, such as the user creating or
// joining the room. For these cases, we need to know about the room prior to handling it otherwise
// we'll make bad assumptions.

exports.LIST_UPDATED_EVENT = LIST_UPDATED_EVENT;
const CAUSES_REQUIRING_ROOM = [_models.RoomUpdateCause.Timeline, _models.RoomUpdateCause.ReadReceipt];

/**
 * Represents a list ordering algorithm. This class will take care of tag
 * management (which rooms go in which tags) and ask the implementation to
 * deal with ordering mechanics.
 */
class Algorithm extends _events.EventEmitter {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "_cachedRooms", {});
    (0, _defineProperty2.default)(this, "_cachedStickyRooms", {});
    (0, _defineProperty2.default)(this, "_stickyRoom", null);
    (0, _defineProperty2.default)(this, "_lastStickyRoom", null);
    (0, _defineProperty2.default)(this, "sortAlgorithms", void 0);
    (0, _defineProperty2.default)(this, "listAlgorithms", void 0);
    (0, _defineProperty2.default)(this, "algorithms", void 0);
    (0, _defineProperty2.default)(this, "rooms", []);
    (0, _defineProperty2.default)(this, "roomIdsToTags", {});
    (0, _defineProperty2.default)(this, "updatesInhibited", false);
    (0, _defineProperty2.default)(this, "onActiveCalls", () => {
      // In case we're unsticking a room, sort it back into natural order
      this.recalculateStickyRoom(); // Update the stickiness of rooms with calls

      this.recalculateActiveCallRooms();
      if (this.updatesInhibited) return; // This isn't in response to any particular RoomListStore update,
      // so notify the store that it needs to force-update

      this.emit(LIST_UPDATED_EVENT, true);
    });
  }

  start() {
    _CallStore.CallStore.instance.on(_CallStore.CallStoreEvent.ActiveCalls, this.onActiveCalls);
  }

  stop() {
    _CallStore.CallStore.instance.off(_CallStore.CallStoreEvent.ActiveCalls, this.onActiveCalls);
  }

  get stickyRoom() {
    return this._stickyRoom ? this._stickyRoom.room : null;
  }

  get knownRooms() {
    return this.rooms;
  }

  get hasTagSortingMap() {
    return !!this.sortAlgorithms;
  }

  set cachedRooms(val) {
    this._cachedRooms = val;
    this.recalculateStickyRoom();
    this.recalculateActiveCallRooms();
  }

  get cachedRooms() {
    // 🐉 Here be dragons.
    // Note: this is used by the underlying algorithm classes, so don't make it return
    // the sticky room cache. If it ends up returning the sticky room cache, we end up
    // corrupting our caches and confusing them.
    return this._cachedRooms;
  }
  /**
   * Awaitable version of the sticky room setter.
   * @param val The new room to sticky.
   */


  setStickyRoom(val) {
    try {
      this.updateStickyRoom(val);
    } catch (e) {
      _logger.logger.warn("Failed to update sticky room", e);
    }
  }

  getTagSorting(tagId) {
    if (!this.sortAlgorithms) return null;
    return this.sortAlgorithms[tagId];
  }

  setTagSorting(tagId, sort) {
    if (!tagId) throw new Error("Tag ID must be defined");
    if (!sort) throw new Error("Algorithm must be defined");
    this.sortAlgorithms[tagId] = sort;
    const algorithm = this.algorithms[tagId];
    algorithm.setSortAlgorithm(sort);
    this._cachedRooms[tagId] = algorithm.orderedRooms;
    this.recalculateStickyRoom(tagId); // update sticky room to make sure it appears if needed

    this.recalculateActiveCallRooms(tagId);
  }

  getListOrdering(tagId) {
    if (!this.listAlgorithms) return null;
    return this.listAlgorithms[tagId];
  }

  setListOrdering(tagId, order) {
    if (!tagId) throw new Error("Tag ID must be defined");
    if (!order) throw new Error("Algorithm must be defined");
    this.listAlgorithms[tagId] = order;
    const algorithm = (0, _listOrdering.getListAlgorithmInstance)(order, tagId, this.sortAlgorithms[tagId]);
    this.algorithms[tagId] = algorithm;
    algorithm.setRooms(this._cachedRooms[tagId]);
    this._cachedRooms[tagId] = algorithm.orderedRooms;
    this.recalculateStickyRoom(tagId); // update sticky room to make sure it appears if needed

    this.recalculateActiveCallRooms(tagId);
  }

  updateStickyRoom(val) {
    this.doUpdateStickyRoom(val);
    this._lastStickyRoom = null; // clear to indicate we're done changing
  }

  doUpdateStickyRoom(val) {
    if (val?.isSpaceRoom() && val.getMyMembership() !== "invite") {
      // no-op sticky rooms for spaces - they're effectively virtual rooms
      val = null;
    }

    if (val && !_VisibilityProvider.VisibilityProvider.instance.isRoomVisible(val)) {
      val = null; // the room isn't visible - lie to the rest of this function
    } // Set the last sticky room to indicate that we're in a change. The code throughout the
    // class can safely handle a null room, so this should be safe to do as a backup.


    this._lastStickyRoom = this._stickyRoom || {}; // It's possible to have no selected room. In that case, clear the sticky room

    if (!val) {
      if (this._stickyRoom) {
        const stickyRoom = this._stickyRoom.room;
        this._stickyRoom = null; // clear before we go to update the algorithm
        // Lie to the algorithm and re-add the room to the algorithm

        this.handleRoomUpdate(stickyRoom, _models.RoomUpdateCause.NewRoom);
        return;
      }

      return;
    } // When we do have a room though, we expect to be able to find it


    let tag = this.roomIdsToTags[val.roomId]?.[0];
    if (!tag) throw new Error(`${val.roomId} does not belong to a tag and cannot be sticky`); // We specifically do NOT use the ordered rooms set as it contains the sticky room, which
    // means we'll be off by 1 when the user is switching rooms. This leads to visual jumping
    // when the user is moving south in the list (not north, because of math).

    const tagList = this.getOrderedRoomsWithoutSticky()[tag] || []; // can be null if filtering

    let position = tagList.indexOf(val); // We do want to see if a tag change happened though - if this did happen then we'll want
    // to force the position to zero (top) to ensure we can properly handle it.

    const wasSticky = this._lastStickyRoom.room ? this._lastStickyRoom.room.roomId === val.roomId : false;

    if (this._lastStickyRoom.tag && tag !== this._lastStickyRoom.tag && wasSticky && position < 0) {
      _logger.logger.warn(`Sticky room ${val.roomId} changed tags during sticky room handling`);

      position = 0;
    } // Sanity check the position to make sure the room is qualified for being sticky


    if (position < 0) throw new Error(`${val.roomId} does not appear to be known and cannot be sticky`); // 🐉 Here be dragons.
    // Before we can go through with lying to the underlying algorithm about a room
    // we need to ensure that when we do we're ready for the inevitable sticky room
    // update we'll receive. To prepare for that, we first remove the sticky room and
    // recalculate the state ourselves so that when the underlying algorithm calls for
    // the same thing it no-ops. After we're done calling the algorithm, we'll issue
    // a new update for ourselves.

    const lastStickyRoom = this._stickyRoom;
    this._stickyRoom = null; // clear before we update the algorithm

    this.recalculateStickyRoom(); // When we do have the room, re-add the old room (if needed) to the algorithm
    // and remove the sticky room from the algorithm. This is so the underlying
    // algorithm doesn't try and confuse itself with the sticky room concept.
    // We don't add the new room if the sticky room isn't changing because that's
    // an easy way to cause duplication. We have to do room ID checks instead of
    // referential checks as the references can differ through the lifecycle.

    if (lastStickyRoom && lastStickyRoom.room && lastStickyRoom.room.roomId !== val.roomId) {
      // Lie to the algorithm and re-add the room to the algorithm
      this.handleRoomUpdate(lastStickyRoom.room, _models.RoomUpdateCause.NewRoom);
    } // Lie to the algorithm and remove the room from it's field of view


    this.handleRoomUpdate(val, _models.RoomUpdateCause.RoomRemoved); // Check for tag & position changes while we're here. We also check the room to ensure
    // it is still the same room.

    if (this._stickyRoom) {
      if (this._stickyRoom.room !== val) {
        // Check the room IDs just in case
        if (this._stickyRoom.room.roomId === val.roomId) {
          _logger.logger.warn("Sticky room changed references");
        } else {
          throw new Error("Sticky room changed while the sticky room was changing");
        }
      }

      _logger.logger.warn(`Sticky room changed tag & position from ${tag} / ${position} ` + `to ${this._stickyRoom.tag} / ${this._stickyRoom.position}`);

      tag = this._stickyRoom.tag;
      position = this._stickyRoom.position;
    } // Now that we're done lying to the algorithm, we need to update our position
    // marker only if the user is moving further down the same list. If they're switching
    // lists, or moving upwards, the position marker will splice in just fine but if
    // they went downwards in the same list we'll be off by 1 due to the shifting rooms.


    if (lastStickyRoom && lastStickyRoom.tag === tag && lastStickyRoom.position <= position) {
      position++;
    }

    this._stickyRoom = {
      room: val,
      position: position,
      tag: tag
    }; // We update the filtered rooms just in case, as otherwise users will end up visiting
    // a room while filtering and it'll disappear. We don't update the filter earlier in
    // this function simply because we don't have to.

    this.recalculateStickyRoom();
    this.recalculateActiveCallRooms(tag);
    if (lastStickyRoom && lastStickyRoom.tag !== tag) this.recalculateActiveCallRooms(lastStickyRoom.tag); // Finally, trigger an update

    if (this.updatesInhibited) return;
    this.emit(LIST_UPDATED_EVENT);
  }

  initCachedStickyRooms() {
    this._cachedStickyRooms = {};

    for (const tagId of Object.keys(this.cachedRooms)) {
      this._cachedStickyRooms[tagId] = [...this.cachedRooms[tagId]]; // shallow clone
    }
  }
  /**
   * Recalculate the sticky room position. If this is being called in relation to
   * a specific tag being updated, it should be given to this function to optimize
   * the call.
   * @param updatedTag The tag that was updated, if possible.
   */


  recalculateStickyRoom() {
    let updatedTag = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    // 🐉 Here be dragons.
    // This function does far too much for what it should, and is called by many places.
    // Not only is this responsible for ensuring the sticky room is held in place at all
    // times, it is also responsible for ensuring our clone of the cachedRooms is up to
    // date. If either of these desyncs, we see weird behaviour like duplicated rooms,
    // outdated lists, and other nonsensical issues that aren't necessarily obvious.
    if (!this._stickyRoom) {
      // If there's no sticky room, just do nothing useful.
      if (!!this._cachedStickyRooms) {
        // Clear the cache if we won't be needing it
        this._cachedStickyRooms = null;
        if (this.updatesInhibited) return;
        this.emit(LIST_UPDATED_EVENT);
      }

      return;
    }

    if (!this._cachedStickyRooms || !updatedTag) {
      this.initCachedStickyRooms();
    }

    if (updatedTag) {
      // Update the tag indicated by the caller, if possible. This is mostly to ensure
      // our cache is up to date.
      this._cachedStickyRooms[updatedTag] = [...this.cachedRooms[updatedTag]]; // shallow clone
    } // Now try to insert the sticky room, if we need to.
    // We need to if there's no updated tag (we regenned the whole cache) or if the tag
    // we might have updated from the cache is also our sticky room.


    const sticky = this._stickyRoom;

    if (!updatedTag || updatedTag === sticky.tag) {
      this._cachedStickyRooms[sticky.tag].splice(sticky.position, 0, sticky.room);
    } // Finally, trigger an update


    if (this.updatesInhibited) return;
    this.emit(LIST_UPDATED_EVENT);
  }
  /**
   * Recalculate the position of any rooms with calls. If this is being called in
   * relation to a specific tag being updated, it should be given to this function to
   * optimize the call.
   *
   * This expects to be called *after* the sticky rooms are updated, and sticks the
   * room with the currently active call to the top of its tag.
   *
   * @param updatedTag The tag that was updated, if possible.
   */


  recalculateActiveCallRooms() {
    let updatedTag = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    if (!updatedTag) {
      // Assume all tags need updating
      // We're not modifying the map here, so can safely rely on the cached values
      // rather than the explicitly sticky map.
      for (const tagId of Object.keys(this.cachedRooms)) {
        if (!tagId) {
          throw new Error("Unexpected recursion: falsy tag");
        }

        this.recalculateActiveCallRooms(tagId);
      }

      return;
    }

    if (_CallStore.CallStore.instance.activeCalls.size) {
      // We operate on the sticky rooms map
      if (!this._cachedStickyRooms) this.initCachedStickyRooms();
      const rooms = this._cachedStickyRooms[updatedTag];
      const activeRoomIds = new Set([..._CallStore.CallStore.instance.activeCalls].map(call => call.roomId));
      const activeRooms = [];
      const inactiveRooms = [];

      for (const room of rooms) {
        (activeRoomIds.has(room.roomId) ? activeRooms : inactiveRooms).push(room);
      } // Stick rooms with active calls to the top


      this._cachedStickyRooms[updatedTag] = [...activeRooms, ...inactiveRooms];
    }
  }
  /**
   * Asks the Algorithm to regenerate all lists, using the tags given
   * as reference for which lists to generate and which way to generate
   * them.
   * @param {ITagSortingMap} tagSortingMap The tags to generate.
   * @param {IListOrderingMap} listOrderingMap The ordering of those tags.
   */


  populateTags(tagSortingMap, listOrderingMap) {
    if (!tagSortingMap) throw new Error(`Sorting map cannot be null or empty`);
    if (!listOrderingMap) throw new Error(`Ordering ma cannot be null or empty`);

    if ((0, _arrays.arrayHasDiff)(Object.keys(tagSortingMap), Object.keys(listOrderingMap))) {
      throw new Error(`Both maps must contain the exact same tags`);
    }

    this.sortAlgorithms = tagSortingMap;
    this.listAlgorithms = listOrderingMap;
    this.algorithms = {};

    for (const tag of Object.keys(tagSortingMap)) {
      this.algorithms[tag] = (0, _listOrdering.getListAlgorithmInstance)(this.listAlgorithms[tag], tag, this.sortAlgorithms[tag]);
    }

    return this.setKnownRooms(this.rooms);
  }
  /**
   * Gets an ordered set of rooms for the all known tags.
   * @returns {ITagMap} The cached list of rooms, ordered,
   * for each tag. May be empty, but never null/undefined.
   */


  getOrderedRooms() {
    return this._cachedStickyRooms || this.cachedRooms;
  }
  /**
   * This returns the same as getOrderedRooms(), but without the sticky room
   * map as it causes issues for sticky room handling (see sticky room handling
   * for more information).
   * @returns {ITagMap} The cached list of rooms, ordered,
   * for each tag. May be empty, but never null/undefined.
   */


  getOrderedRoomsWithoutSticky() {
    return this.cachedRooms;
  }
  /**
   * Seeds the Algorithm with a set of rooms. The algorithm will discard all
   * previously known information and instead use these rooms instead.
   * @param {Room[]} rooms The rooms to force the algorithm to use.
   */


  setKnownRooms(rooms) {
    if ((0, _utils.isNullOrUndefined)(rooms)) throw new Error(`Array of rooms cannot be null`);
    if (!this.sortAlgorithms) throw new Error(`Cannot set known rooms without a tag sorting map`);

    if (!this.updatesInhibited) {
      // We only log this if we're expecting to be publishing updates, which means that
      // this could be an unexpected invocation. If we're inhibited, then this is probably
      // an intentional invocation.
      _logger.logger.warn("Resetting known rooms, initiating regeneration");
    } // Before we go any further we need to clear (but remember) the sticky room to
    // avoid accidentally duplicating it in the list.


    const oldStickyRoom = this._stickyRoom;
    if (oldStickyRoom) this.updateStickyRoom(null);
    this.rooms = rooms;
    const newTags = {};

    for (const tagId in this.sortAlgorithms) {
      // noinspection JSUnfilteredForInLoop
      newTags[tagId] = [];
    } // If we can avoid doing work, do so.


    if (!rooms.length) {
      this.generateFreshTags(newTags); // just in case it wants to do something

      this.cachedRooms = newTags;
      return;
    } // Split out the easy rooms first (leave and invite)


    const memberships = (0, _membership.splitRoomsByMembership)(rooms);

    for (const room of memberships[_membership.EffectiveMembership.Invite]) {
      newTags[_models.DefaultTagID.Invite].push(room);
    }

    for (const room of memberships[_membership.EffectiveMembership.Leave]) {
      newTags[_models.DefaultTagID.Archived].push(room);
    } // Now process all the joined rooms. This is a bit more complicated


    for (const room of memberships[_membership.EffectiveMembership.Join]) {
      const tags = this.getTagsOfJoinedRoom(room);
      let inTag = false;

      if (tags.length > 0) {
        for (const tag of tags) {
          if (!(0, _utils.isNullOrUndefined)(newTags[tag])) {
            newTags[tag].push(room);
            inTag = true;
          }
        }
      }

      if (!inTag) {
        if (_DMRoomMap.default.shared().getUserIdForRoomId(room.roomId)) {
          newTags[_models.DefaultTagID.DM].push(room);
        } else {
          newTags[_models.DefaultTagID.Untagged].push(room);
        }
      }
    }

    this.generateFreshTags(newTags);
    this.cachedRooms = newTags; // this recalculates the filtered rooms for us

    this.updateTagsFromCache(); // Now that we've finished generation, we need to update the sticky room to what
    // it was. It's entirely possible that it changed lists though, so if it did then
    // we also have to update the position of it.

    if (oldStickyRoom && oldStickyRoom.room) {
      this.updateStickyRoom(oldStickyRoom.room);

      if (this._stickyRoom && this._stickyRoom.room) {
        // just in case the update doesn't go according to plan
        if (this._stickyRoom.tag !== oldStickyRoom.tag) {
          // We put the sticky room at the top of the list to treat it as an obvious tag change.
          this._stickyRoom.position = 0;
          this.recalculateStickyRoom(this._stickyRoom.tag);
        }
      }
    }
  }

  getTagsForRoom(room) {
    const tags = [];
    const membership = (0, _membership.getEffectiveMembership)(room.getMyMembership());

    if (membership === _membership.EffectiveMembership.Invite) {
      tags.push(_models.DefaultTagID.Invite);
    } else if (membership === _membership.EffectiveMembership.Leave) {
      tags.push(_models.DefaultTagID.Archived);
    } else {
      tags.push(...this.getTagsOfJoinedRoom(room));
    }

    if (!tags.length) tags.push(_models.DefaultTagID.Untagged);
    return tags;
  }

  getTagsOfJoinedRoom(room) {
    let tags = Object.keys(room.tags || {});

    if (tags.length === 0) {
      // Check to see if it's a DM if it isn't anything else
      if (_DMRoomMap.default.shared().getUserIdForRoomId(room.roomId)) {
        tags = [_models.DefaultTagID.DM];
      }
    }

    return tags;
  }
  /**
   * Updates the roomsToTags map
   */


  updateTagsFromCache() {
    const newMap = {};
    const tags = Object.keys(this.cachedRooms);

    for (const tagId of tags) {
      const rooms = this.cachedRooms[tagId];

      for (const room of rooms) {
        if (!newMap[room.roomId]) newMap[room.roomId] = [];
        newMap[room.roomId].push(tagId);
      }
    }

    this.roomIdsToTags = newMap;
  }
  /**
   * Called when the Algorithm believes a complete regeneration of the existing
   * lists is needed.
   * @param {ITagMap} updatedTagMap The tag map which needs populating. Each tag
   * will already have the rooms which belong to it - they just need ordering. Must
   * be mutated in place.
   */


  generateFreshTags(updatedTagMap) {
    if (!this.algorithms) throw new Error("Not ready: no algorithms to determine tags from");

    for (const tag of Object.keys(updatedTagMap)) {
      const algorithm = this.algorithms[tag];
      if (!algorithm) throw new Error(`No algorithm for ${tag}`);
      algorithm.setRooms(updatedTagMap[tag]);
      updatedTagMap[tag] = algorithm.orderedRooms;
    }
  }
  /**
   * Asks the Algorithm to update its knowledge of a room. For example, when
   * a user tags a room, joins/creates a room, or leaves a room the Algorithm
   * should be told that the room's info might have changed. The Algorithm
   * may no-op this request if no changes are required.
   * @param {Room} room The room which might have affected sorting.
   * @param {RoomUpdateCause} cause The reason for the update being triggered.
   * @returns {Promise<boolean>} A boolean of whether or not getOrderedRooms()
   * should be called after processing.
   */


  handleRoomUpdate(room, cause) {
    if (!this.algorithms) throw new Error("Not ready: no algorithms to determine tags from"); // Note: check the isSticky against the room ID just in case the reference is wrong

    const isSticky = this._stickyRoom?.room?.roomId === room.roomId;

    if (cause === _models.RoomUpdateCause.NewRoom) {
      const isForLastSticky = this._lastStickyRoom?.room === room;
      const roomTags = this.roomIdsToTags[room.roomId];
      const hasTags = roomTags && roomTags.length > 0; // Don't change the cause if the last sticky room is being re-added. If we fail to
      // pass the cause through as NewRoom, we'll fail to lie to the algorithm and thus
      // lose the room.

      if (hasTags && !isForLastSticky) {
        _logger.logger.warn(`${room.roomId} is reportedly new but is already known - assuming TagChange instead`);

        cause = _models.RoomUpdateCause.PossibleTagChange;
      } // Check to see if the room is known first


      let knownRoomRef = this.rooms.includes(room);

      if (hasTags && !knownRoomRef) {
        _logger.logger.warn(`${room.roomId} might be a reference change - attempting to update reference`);

        this.rooms = this.rooms.map(r => r.roomId === room.roomId ? room : r);
        knownRoomRef = this.rooms.includes(room);

        if (!knownRoomRef) {
          _logger.logger.warn(`${room.roomId} is still not referenced. It may be sticky.`);
        }
      } // If we have tags for a room and don't have the room referenced, something went horribly
      // wrong - the reference should have been updated above.


      if (hasTags && !knownRoomRef && !isSticky) {
        throw new Error(`${room.roomId} is missing from room array but is known - trying to find duplicate`);
      } // Like above, update the reference to the sticky room if we need to


      if (hasTags && isSticky) {
        // Go directly in and set the sticky room's new reference, being careful not
        // to trigger a sticky room update ourselves.
        this._stickyRoom.room = room;
      } // If after all that we're still a NewRoom update, add the room if applicable.
      // We don't do this for the sticky room (because it causes duplication issues)
      // or if we know about the reference (as it should be replaced).


      if (cause === _models.RoomUpdateCause.NewRoom && !isSticky && !knownRoomRef) {
        this.rooms.push(room);
      }
    }

    let didTagChange = false;

    if (cause === _models.RoomUpdateCause.PossibleTagChange) {
      const oldTags = this.roomIdsToTags[room.roomId] || [];
      const newTags = this.getTagsForRoom(room);
      const diff = (0, _arrays.arrayDiff)(oldTags, newTags);

      if (diff.removed.length > 0 || diff.added.length > 0) {
        for (const rmTag of diff.removed) {
          const algorithm = this.algorithms[rmTag];
          if (!algorithm) throw new Error(`No algorithm for ${rmTag}`);
          algorithm.handleRoomUpdate(room, _models.RoomUpdateCause.RoomRemoved);
          this._cachedRooms[rmTag] = algorithm.orderedRooms;
          this.recalculateStickyRoom(rmTag); // update sticky room to make sure it moves if needed

          this.recalculateActiveCallRooms(rmTag);
        }

        for (const addTag of diff.added) {
          const algorithm = this.algorithms[addTag];
          if (!algorithm) throw new Error(`No algorithm for ${addTag}`);
          algorithm.handleRoomUpdate(room, _models.RoomUpdateCause.NewRoom);
          this._cachedRooms[addTag] = algorithm.orderedRooms;
        } // Update the tag map so we don't regen it in a moment


        this.roomIdsToTags[room.roomId] = newTags;
        cause = _models.RoomUpdateCause.Timeline;
        didTagChange = true;
      } else {
        // This is a tag change update and no tags were changed, nothing to do!
        return false;
      }

      if (didTagChange && isSticky) {
        // Manually update the tag for the sticky room without triggering a sticky room
        // update. The update will be handled implicitly by the sticky room handling and
        // requires no changes on our part, if we're in the middle of a sticky room change.
        if (this._lastStickyRoom) {
          this._stickyRoom = {
            room,
            tag: this.roomIdsToTags[room.roomId][0],
            position: 0 // right at the top as it changed tags

          };
        } else {
          // We have to clear the lock as the sticky room change will trigger updates.
          this.setStickyRoom(room);
        }
      }
    } // If the update is for a room change which might be the sticky room, prevent it. We
    // need to make sure that the causes (NewRoom and RoomRemoved) are still triggered though
    // as the sticky room relies on this.


    if (cause !== _models.RoomUpdateCause.NewRoom && cause !== _models.RoomUpdateCause.RoomRemoved) {
      if (this.stickyRoom === room) {
        return false;
      }
    }

    if (!this.roomIdsToTags[room.roomId]) {
      if (CAUSES_REQUIRING_ROOM.includes(cause)) {
        return false;
      } // Get the tags for the room and populate the cache


      const roomTags = this.getTagsForRoom(room).filter(t => !(0, _utils.isNullOrUndefined)(this.cachedRooms[t])); // "This should never happen" condition - we specify DefaultTagID.Untagged in getTagsForRoom(),
      // which means we should *always* have a tag to go off of.

      if (!roomTags.length) throw new Error(`Tags cannot be determined for ${room.roomId}`);
      this.roomIdsToTags[room.roomId] = roomTags;
    }

    const tags = this.roomIdsToTags[room.roomId];

    if (!tags) {
      _logger.logger.warn(`No tags known for "${room.name}" (${room.roomId})`);

      return false;
    }

    let changed = didTagChange;

    for (const tag of tags) {
      const algorithm = this.algorithms[tag];
      if (!algorithm) throw new Error(`No algorithm for ${tag}`);
      algorithm.handleRoomUpdate(room, cause);
      this._cachedRooms[tag] = algorithm.orderedRooms; // Flag that we've done something

      this.recalculateStickyRoom(tag); // update sticky room to make sure it appears if needed

      this.recalculateActiveCallRooms(tag);
      changed = true;
    }

    return changed;
  }

}

exports.Algorithm = Algorithm;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMSVNUX1VQREFURURfRVZFTlQiLCJDQVVTRVNfUkVRVUlSSU5HX1JPT00iLCJSb29tVXBkYXRlQ2F1c2UiLCJUaW1lbGluZSIsIlJlYWRSZWNlaXB0IiwiQWxnb3JpdGhtIiwiRXZlbnRFbWl0dGVyIiwicmVjYWxjdWxhdGVTdGlja3lSb29tIiwicmVjYWxjdWxhdGVBY3RpdmVDYWxsUm9vbXMiLCJ1cGRhdGVzSW5oaWJpdGVkIiwiZW1pdCIsInN0YXJ0IiwiQ2FsbFN0b3JlIiwiaW5zdGFuY2UiLCJvbiIsIkNhbGxTdG9yZUV2ZW50IiwiQWN0aXZlQ2FsbHMiLCJvbkFjdGl2ZUNhbGxzIiwic3RvcCIsIm9mZiIsInN0aWNreVJvb20iLCJfc3RpY2t5Um9vbSIsInJvb20iLCJrbm93blJvb21zIiwicm9vbXMiLCJoYXNUYWdTb3J0aW5nTWFwIiwic29ydEFsZ29yaXRobXMiLCJjYWNoZWRSb29tcyIsInZhbCIsIl9jYWNoZWRSb29tcyIsInNldFN0aWNreVJvb20iLCJ1cGRhdGVTdGlja3lSb29tIiwiZSIsImxvZ2dlciIsIndhcm4iLCJnZXRUYWdTb3J0aW5nIiwidGFnSWQiLCJzZXRUYWdTb3J0aW5nIiwic29ydCIsIkVycm9yIiwiYWxnb3JpdGhtIiwiYWxnb3JpdGhtcyIsInNldFNvcnRBbGdvcml0aG0iLCJvcmRlcmVkUm9vbXMiLCJnZXRMaXN0T3JkZXJpbmciLCJsaXN0QWxnb3JpdGhtcyIsInNldExpc3RPcmRlcmluZyIsIm9yZGVyIiwiZ2V0TGlzdEFsZ29yaXRobUluc3RhbmNlIiwic2V0Um9vbXMiLCJkb1VwZGF0ZVN0aWNreVJvb20iLCJfbGFzdFN0aWNreVJvb20iLCJpc1NwYWNlUm9vbSIsImdldE15TWVtYmVyc2hpcCIsIlZpc2liaWxpdHlQcm92aWRlciIsImlzUm9vbVZpc2libGUiLCJoYW5kbGVSb29tVXBkYXRlIiwiTmV3Um9vbSIsInRhZyIsInJvb21JZHNUb1RhZ3MiLCJyb29tSWQiLCJ0YWdMaXN0IiwiZ2V0T3JkZXJlZFJvb21zV2l0aG91dFN0aWNreSIsInBvc2l0aW9uIiwiaW5kZXhPZiIsIndhc1N0aWNreSIsImxhc3RTdGlja3lSb29tIiwiUm9vbVJlbW92ZWQiLCJpbml0Q2FjaGVkU3RpY2t5Um9vbXMiLCJfY2FjaGVkU3RpY2t5Um9vbXMiLCJPYmplY3QiLCJrZXlzIiwidXBkYXRlZFRhZyIsInN0aWNreSIsInNwbGljZSIsImFjdGl2ZUNhbGxzIiwic2l6ZSIsImFjdGl2ZVJvb21JZHMiLCJTZXQiLCJtYXAiLCJjYWxsIiwiYWN0aXZlUm9vbXMiLCJpbmFjdGl2ZVJvb21zIiwiaGFzIiwicHVzaCIsInBvcHVsYXRlVGFncyIsInRhZ1NvcnRpbmdNYXAiLCJsaXN0T3JkZXJpbmdNYXAiLCJhcnJheUhhc0RpZmYiLCJzZXRLbm93blJvb21zIiwiZ2V0T3JkZXJlZFJvb21zIiwiaXNOdWxsT3JVbmRlZmluZWQiLCJvbGRTdGlja3lSb29tIiwibmV3VGFncyIsImxlbmd0aCIsImdlbmVyYXRlRnJlc2hUYWdzIiwibWVtYmVyc2hpcHMiLCJzcGxpdFJvb21zQnlNZW1iZXJzaGlwIiwiRWZmZWN0aXZlTWVtYmVyc2hpcCIsIkludml0ZSIsIkRlZmF1bHRUYWdJRCIsIkxlYXZlIiwiQXJjaGl2ZWQiLCJKb2luIiwidGFncyIsImdldFRhZ3NPZkpvaW5lZFJvb20iLCJpblRhZyIsIkRNUm9vbU1hcCIsInNoYXJlZCIsImdldFVzZXJJZEZvclJvb21JZCIsIkRNIiwiVW50YWdnZWQiLCJ1cGRhdGVUYWdzRnJvbUNhY2hlIiwiZ2V0VGFnc0ZvclJvb20iLCJtZW1iZXJzaGlwIiwiZ2V0RWZmZWN0aXZlTWVtYmVyc2hpcCIsIm5ld01hcCIsInVwZGF0ZWRUYWdNYXAiLCJjYXVzZSIsImlzU3RpY2t5IiwiaXNGb3JMYXN0U3RpY2t5Iiwicm9vbVRhZ3MiLCJoYXNUYWdzIiwiUG9zc2libGVUYWdDaGFuZ2UiLCJrbm93blJvb21SZWYiLCJpbmNsdWRlcyIsInIiLCJkaWRUYWdDaGFuZ2UiLCJvbGRUYWdzIiwiZGlmZiIsImFycmF5RGlmZiIsInJlbW92ZWQiLCJhZGRlZCIsInJtVGFnIiwiYWRkVGFnIiwiZmlsdGVyIiwidCIsIm5hbWUiLCJjaGFuZ2VkIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3N0b3Jlcy9yb29tLWxpc3QvYWxnb3JpdGhtcy9BbGdvcml0aG0udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwLCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuaW1wb3J0IHsgaXNOdWxsT3JVbmRlZmluZWQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvdXRpbHNcIjtcbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gXCJldmVudHNcIjtcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcblxuaW1wb3J0IERNUm9vbU1hcCBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvRE1Sb29tTWFwXCI7XG5pbXBvcnQgeyBhcnJheURpZmYsIGFycmF5SGFzRGlmZiB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9hcnJheXNcIjtcbmltcG9ydCB7IERlZmF1bHRUYWdJRCwgUm9vbVVwZGF0ZUNhdXNlLCBUYWdJRCB9IGZyb20gXCIuLi9tb2RlbHNcIjtcbmltcG9ydCB7XG4gICAgSUxpc3RPcmRlcmluZ01hcCxcbiAgICBJT3JkZXJpbmdBbGdvcml0aG1NYXAsXG4gICAgSVRhZ01hcCxcbiAgICBJVGFnU29ydGluZ01hcCxcbiAgICBMaXN0QWxnb3JpdGhtLFxuICAgIFNvcnRBbGdvcml0aG0sXG59IGZyb20gXCIuL21vZGVsc1wiO1xuaW1wb3J0IHsgRWZmZWN0aXZlTWVtYmVyc2hpcCwgZ2V0RWZmZWN0aXZlTWVtYmVyc2hpcCwgc3BsaXRSb29tc0J5TWVtYmVyc2hpcCB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9tZW1iZXJzaGlwXCI7XG5pbXBvcnQgeyBPcmRlcmluZ0FsZ29yaXRobSB9IGZyb20gXCIuL2xpc3Qtb3JkZXJpbmcvT3JkZXJpbmdBbGdvcml0aG1cIjtcbmltcG9ydCB7IGdldExpc3RBbGdvcml0aG1JbnN0YW5jZSB9IGZyb20gXCIuL2xpc3Qtb3JkZXJpbmdcIjtcbmltcG9ydCB7IFZpc2liaWxpdHlQcm92aWRlciB9IGZyb20gXCIuLi9maWx0ZXJzL1Zpc2liaWxpdHlQcm92aWRlclwiO1xuaW1wb3J0IHsgQ2FsbFN0b3JlLCBDYWxsU3RvcmVFdmVudCB9IGZyb20gXCIuLi8uLi9DYWxsU3RvcmVcIjtcblxuLyoqXG4gKiBGaXJlZCB3aGVuIHRoZSBBbGdvcml0aG0gaGFzIGRldGVybWluZWQgYSBsaXN0IGhhcyBiZWVuIHVwZGF0ZWQuXG4gKi9cbmV4cG9ydCBjb25zdCBMSVNUX1VQREFURURfRVZFTlQgPSBcImxpc3RfdXBkYXRlZF9ldmVudFwiO1xuXG4vLyBUaGVzZSBhcmUgdGhlIGNhdXNlcyB3aGljaCByZXF1aXJlIGEgcm9vbSB0byBiZSBrbm93biBpbiBvcmRlciBmb3IgdXMgdG8gaGFuZGxlIHRoZW0uIElmXG4vLyBhIGNhdXNlIGluIHRoaXMgbGlzdCBpcyByYWlzZWQgYW5kIHdlIGRvbid0IGtub3cgYWJvdXQgdGhlIHJvb20sIHdlIGRvbid0IGhhbmRsZSB0aGUgdXBkYXRlLlxuLy9cbi8vIE5vdGU6IHRoZXNlIHR5cGljYWxseSBoYXBwZW4gd2hlbiBhIG5ldyByb29tIGlzIGNvbWluZyBpbiwgc3VjaCBhcyB0aGUgdXNlciBjcmVhdGluZyBvclxuLy8gam9pbmluZyB0aGUgcm9vbS4gRm9yIHRoZXNlIGNhc2VzLCB3ZSBuZWVkIHRvIGtub3cgYWJvdXQgdGhlIHJvb20gcHJpb3IgdG8gaGFuZGxpbmcgaXQgb3RoZXJ3aXNlXG4vLyB3ZSdsbCBtYWtlIGJhZCBhc3N1bXB0aW9ucy5cbmNvbnN0IENBVVNFU19SRVFVSVJJTkdfUk9PTSA9IFtcbiAgICBSb29tVXBkYXRlQ2F1c2UuVGltZWxpbmUsXG4gICAgUm9vbVVwZGF0ZUNhdXNlLlJlYWRSZWNlaXB0LFxuXTtcblxuaW50ZXJmYWNlIElTdGlja3lSb29tIHtcbiAgICByb29tOiBSb29tO1xuICAgIHBvc2l0aW9uOiBudW1iZXI7XG4gICAgdGFnOiBUYWdJRDtcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgbGlzdCBvcmRlcmluZyBhbGdvcml0aG0uIFRoaXMgY2xhc3Mgd2lsbCB0YWtlIGNhcmUgb2YgdGFnXG4gKiBtYW5hZ2VtZW50ICh3aGljaCByb29tcyBnbyBpbiB3aGljaCB0YWdzKSBhbmQgYXNrIHRoZSBpbXBsZW1lbnRhdGlvbiB0b1xuICogZGVhbCB3aXRoIG9yZGVyaW5nIG1lY2hhbmljcy5cbiAqL1xuZXhwb3J0IGNsYXNzIEFsZ29yaXRobSBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gICAgcHJpdmF0ZSBfY2FjaGVkUm9vbXM6IElUYWdNYXAgPSB7fTtcbiAgICBwcml2YXRlIF9jYWNoZWRTdGlja3lSb29tczogSVRhZ01hcCA9IHt9OyAvLyBhIGNsb25lIG9mIHRoZSBfY2FjaGVkUm9vbXMsIHdpdGggdGhlIHN0aWNreSByb29tXG4gICAgcHJpdmF0ZSBfc3RpY2t5Um9vbTogSVN0aWNreVJvb20gPSBudWxsO1xuICAgIHByaXZhdGUgX2xhc3RTdGlja3lSb29tOiBJU3RpY2t5Um9vbSA9IG51bGw7IC8vIG9ubHkgbm90LW51bGwgd2hlbiBjaGFuZ2luZyB0aGUgc3RpY2t5IHJvb21cbiAgICBwcml2YXRlIHNvcnRBbGdvcml0aG1zOiBJVGFnU29ydGluZ01hcDtcbiAgICBwcml2YXRlIGxpc3RBbGdvcml0aG1zOiBJTGlzdE9yZGVyaW5nTWFwO1xuICAgIHByaXZhdGUgYWxnb3JpdGhtczogSU9yZGVyaW5nQWxnb3JpdGhtTWFwO1xuICAgIHByaXZhdGUgcm9vbXM6IFJvb21bXSA9IFtdO1xuICAgIHByaXZhdGUgcm9vbUlkc1RvVGFnczoge1xuICAgICAgICBbcm9vbUlkOiBzdHJpbmddOiBUYWdJRFtdO1xuICAgIH0gPSB7fTtcblxuICAgIC8qKlxuICAgICAqIFNldCB0byB0cnVlIHRvIHN1c3BlbmQgZW1pc3Npb25zIG9mIGFsZ29yaXRobSB1cGRhdGVzLlxuICAgICAqL1xuICAgIHB1YmxpYyB1cGRhdGVzSW5oaWJpdGVkID0gZmFsc2U7XG5cbiAgICBwdWJsaWMgc3RhcnQoKSB7XG4gICAgICAgIENhbGxTdG9yZS5pbnN0YW5jZS5vbihDYWxsU3RvcmVFdmVudC5BY3RpdmVDYWxscywgdGhpcy5vbkFjdGl2ZUNhbGxzKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc3RvcCgpIHtcbiAgICAgICAgQ2FsbFN0b3JlLmluc3RhbmNlLm9mZihDYWxsU3RvcmVFdmVudC5BY3RpdmVDYWxscywgdGhpcy5vbkFjdGl2ZUNhbGxzKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHN0aWNreVJvb20oKTogUm9vbSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zdGlja3lSb29tID8gdGhpcy5fc3RpY2t5Um9vbS5yb29tIDogbnVsbDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGtub3duUm9vbXMoKTogUm9vbVtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucm9vbXM7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBoYXNUYWdTb3J0aW5nTWFwKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISF0aGlzLnNvcnRBbGdvcml0aG1zO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBzZXQgY2FjaGVkUm9vbXModmFsOiBJVGFnTWFwKSB7XG4gICAgICAgIHRoaXMuX2NhY2hlZFJvb21zID0gdmFsO1xuICAgICAgICB0aGlzLnJlY2FsY3VsYXRlU3RpY2t5Um9vbSgpO1xuICAgICAgICB0aGlzLnJlY2FsY3VsYXRlQWN0aXZlQ2FsbFJvb21zKCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGdldCBjYWNoZWRSb29tcygpOiBJVGFnTWFwIHtcbiAgICAgICAgLy8g8J+QiSBIZXJlIGJlIGRyYWdvbnMuXG4gICAgICAgIC8vIE5vdGU6IHRoaXMgaXMgdXNlZCBieSB0aGUgdW5kZXJseWluZyBhbGdvcml0aG0gY2xhc3Nlcywgc28gZG9uJ3QgbWFrZSBpdCByZXR1cm5cbiAgICAgICAgLy8gdGhlIHN0aWNreSByb29tIGNhY2hlLiBJZiBpdCBlbmRzIHVwIHJldHVybmluZyB0aGUgc3RpY2t5IHJvb20gY2FjaGUsIHdlIGVuZCB1cFxuICAgICAgICAvLyBjb3JydXB0aW5nIG91ciBjYWNoZXMgYW5kIGNvbmZ1c2luZyB0aGVtLlxuICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVkUm9vbXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXdhaXRhYmxlIHZlcnNpb24gb2YgdGhlIHN0aWNreSByb29tIHNldHRlci5cbiAgICAgKiBAcGFyYW0gdmFsIFRoZSBuZXcgcm9vbSB0byBzdGlja3kuXG4gICAgICovXG4gICAgcHVibGljIHNldFN0aWNreVJvb20odmFsOiBSb29tKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVN0aWNreVJvb20odmFsKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oXCJGYWlsZWQgdG8gdXBkYXRlIHN0aWNreSByb29tXCIsIGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGdldFRhZ1NvcnRpbmcodGFnSWQ6IFRhZ0lEKTogU29ydEFsZ29yaXRobSB7XG4gICAgICAgIGlmICghdGhpcy5zb3J0QWxnb3JpdGhtcykgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiB0aGlzLnNvcnRBbGdvcml0aG1zW3RhZ0lkXTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0VGFnU29ydGluZyh0YWdJZDogVGFnSUQsIHNvcnQ6IFNvcnRBbGdvcml0aG0pIHtcbiAgICAgICAgaWYgKCF0YWdJZCkgdGhyb3cgbmV3IEVycm9yKFwiVGFnIElEIG11c3QgYmUgZGVmaW5lZFwiKTtcbiAgICAgICAgaWYgKCFzb3J0KSB0aHJvdyBuZXcgRXJyb3IoXCJBbGdvcml0aG0gbXVzdCBiZSBkZWZpbmVkXCIpO1xuICAgICAgICB0aGlzLnNvcnRBbGdvcml0aG1zW3RhZ0lkXSA9IHNvcnQ7XG5cbiAgICAgICAgY29uc3QgYWxnb3JpdGhtOiBPcmRlcmluZ0FsZ29yaXRobSA9IHRoaXMuYWxnb3JpdGhtc1t0YWdJZF07XG4gICAgICAgIGFsZ29yaXRobS5zZXRTb3J0QWxnb3JpdGhtKHNvcnQpO1xuICAgICAgICB0aGlzLl9jYWNoZWRSb29tc1t0YWdJZF0gPSBhbGdvcml0aG0ub3JkZXJlZFJvb21zO1xuICAgICAgICB0aGlzLnJlY2FsY3VsYXRlU3RpY2t5Um9vbSh0YWdJZCk7IC8vIHVwZGF0ZSBzdGlja3kgcm9vbSB0byBtYWtlIHN1cmUgaXQgYXBwZWFycyBpZiBuZWVkZWRcbiAgICAgICAgdGhpcy5yZWNhbGN1bGF0ZUFjdGl2ZUNhbGxSb29tcyh0YWdJZCk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldExpc3RPcmRlcmluZyh0YWdJZDogVGFnSUQpOiBMaXN0QWxnb3JpdGhtIHtcbiAgICAgICAgaWYgKCF0aGlzLmxpc3RBbGdvcml0aG1zKSByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdEFsZ29yaXRobXNbdGFnSWRdO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRMaXN0T3JkZXJpbmcodGFnSWQ6IFRhZ0lELCBvcmRlcjogTGlzdEFsZ29yaXRobSkge1xuICAgICAgICBpZiAoIXRhZ0lkKSB0aHJvdyBuZXcgRXJyb3IoXCJUYWcgSUQgbXVzdCBiZSBkZWZpbmVkXCIpO1xuICAgICAgICBpZiAoIW9yZGVyKSB0aHJvdyBuZXcgRXJyb3IoXCJBbGdvcml0aG0gbXVzdCBiZSBkZWZpbmVkXCIpO1xuICAgICAgICB0aGlzLmxpc3RBbGdvcml0aG1zW3RhZ0lkXSA9IG9yZGVyO1xuXG4gICAgICAgIGNvbnN0IGFsZ29yaXRobSA9IGdldExpc3RBbGdvcml0aG1JbnN0YW5jZShvcmRlciwgdGFnSWQsIHRoaXMuc29ydEFsZ29yaXRobXNbdGFnSWRdKTtcbiAgICAgICAgdGhpcy5hbGdvcml0aG1zW3RhZ0lkXSA9IGFsZ29yaXRobTtcblxuICAgICAgICBhbGdvcml0aG0uc2V0Um9vbXModGhpcy5fY2FjaGVkUm9vbXNbdGFnSWRdKTtcbiAgICAgICAgdGhpcy5fY2FjaGVkUm9vbXNbdGFnSWRdID0gYWxnb3JpdGhtLm9yZGVyZWRSb29tcztcbiAgICAgICAgdGhpcy5yZWNhbGN1bGF0ZVN0aWNreVJvb20odGFnSWQpOyAvLyB1cGRhdGUgc3RpY2t5IHJvb20gdG8gbWFrZSBzdXJlIGl0IGFwcGVhcnMgaWYgbmVlZGVkXG4gICAgICAgIHRoaXMucmVjYWxjdWxhdGVBY3RpdmVDYWxsUm9vbXModGFnSWQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgdXBkYXRlU3RpY2t5Um9vbSh2YWw6IFJvb20pIHtcbiAgICAgICAgdGhpcy5kb1VwZGF0ZVN0aWNreVJvb20odmFsKTtcbiAgICAgICAgdGhpcy5fbGFzdFN0aWNreVJvb20gPSBudWxsOyAvLyBjbGVhciB0byBpbmRpY2F0ZSB3ZSdyZSBkb25lIGNoYW5naW5nXG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkb1VwZGF0ZVN0aWNreVJvb20odmFsOiBSb29tKSB7XG4gICAgICAgIGlmICh2YWw/LmlzU3BhY2VSb29tKCkgJiYgdmFsLmdldE15TWVtYmVyc2hpcCgpICE9PSBcImludml0ZVwiKSB7XG4gICAgICAgICAgICAvLyBuby1vcCBzdGlja3kgcm9vbXMgZm9yIHNwYWNlcyAtIHRoZXkncmUgZWZmZWN0aXZlbHkgdmlydHVhbCByb29tc1xuICAgICAgICAgICAgdmFsID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2YWwgJiYgIVZpc2liaWxpdHlQcm92aWRlci5pbnN0YW5jZS5pc1Jvb21WaXNpYmxlKHZhbCkpIHtcbiAgICAgICAgICAgIHZhbCA9IG51bGw7IC8vIHRoZSByb29tIGlzbid0IHZpc2libGUgLSBsaWUgdG8gdGhlIHJlc3Qgb2YgdGhpcyBmdW5jdGlvblxuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0IHRoZSBsYXN0IHN0aWNreSByb29tIHRvIGluZGljYXRlIHRoYXQgd2UncmUgaW4gYSBjaGFuZ2UuIFRoZSBjb2RlIHRocm91Z2hvdXQgdGhlXG4gICAgICAgIC8vIGNsYXNzIGNhbiBzYWZlbHkgaGFuZGxlIGEgbnVsbCByb29tLCBzbyB0aGlzIHNob3VsZCBiZSBzYWZlIHRvIGRvIGFzIGEgYmFja3VwLlxuICAgICAgICB0aGlzLl9sYXN0U3RpY2t5Um9vbSA9IHRoaXMuX3N0aWNreVJvb20gfHwgPElTdGlja3lSb29tPnt9O1xuXG4gICAgICAgIC8vIEl0J3MgcG9zc2libGUgdG8gaGF2ZSBubyBzZWxlY3RlZCByb29tLiBJbiB0aGF0IGNhc2UsIGNsZWFyIHRoZSBzdGlja3kgcm9vbVxuICAgICAgICBpZiAoIXZhbCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3N0aWNreVJvb20pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdGlja3lSb29tID0gdGhpcy5fc3RpY2t5Um9vbS5yb29tO1xuICAgICAgICAgICAgICAgIHRoaXMuX3N0aWNreVJvb20gPSBudWxsOyAvLyBjbGVhciBiZWZvcmUgd2UgZ28gdG8gdXBkYXRlIHRoZSBhbGdvcml0aG1cblxuICAgICAgICAgICAgICAgIC8vIExpZSB0byB0aGUgYWxnb3JpdGhtIGFuZCByZS1hZGQgdGhlIHJvb20gdG8gdGhlIGFsZ29yaXRobVxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlUm9vbVVwZGF0ZShzdGlja3lSb29tLCBSb29tVXBkYXRlQ2F1c2UuTmV3Um9vbSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gV2hlbiB3ZSBkbyBoYXZlIGEgcm9vbSB0aG91Z2gsIHdlIGV4cGVjdCB0byBiZSBhYmxlIHRvIGZpbmQgaXRcbiAgICAgICAgbGV0IHRhZyA9IHRoaXMucm9vbUlkc1RvVGFnc1t2YWwucm9vbUlkXT8uWzBdO1xuICAgICAgICBpZiAoIXRhZykgdGhyb3cgbmV3IEVycm9yKGAke3ZhbC5yb29tSWR9IGRvZXMgbm90IGJlbG9uZyB0byBhIHRhZyBhbmQgY2Fubm90IGJlIHN0aWNreWApO1xuXG4gICAgICAgIC8vIFdlIHNwZWNpZmljYWxseSBkbyBOT1QgdXNlIHRoZSBvcmRlcmVkIHJvb21zIHNldCBhcyBpdCBjb250YWlucyB0aGUgc3RpY2t5IHJvb20sIHdoaWNoXG4gICAgICAgIC8vIG1lYW5zIHdlJ2xsIGJlIG9mZiBieSAxIHdoZW4gdGhlIHVzZXIgaXMgc3dpdGNoaW5nIHJvb21zLiBUaGlzIGxlYWRzIHRvIHZpc3VhbCBqdW1waW5nXG4gICAgICAgIC8vIHdoZW4gdGhlIHVzZXIgaXMgbW92aW5nIHNvdXRoIGluIHRoZSBsaXN0IChub3Qgbm9ydGgsIGJlY2F1c2Ugb2YgbWF0aCkuXG4gICAgICAgIGNvbnN0IHRhZ0xpc3QgPSB0aGlzLmdldE9yZGVyZWRSb29tc1dpdGhvdXRTdGlja3koKVt0YWddIHx8IFtdOyAvLyBjYW4gYmUgbnVsbCBpZiBmaWx0ZXJpbmdcbiAgICAgICAgbGV0IHBvc2l0aW9uID0gdGFnTGlzdC5pbmRleE9mKHZhbCk7XG5cbiAgICAgICAgLy8gV2UgZG8gd2FudCB0byBzZWUgaWYgYSB0YWcgY2hhbmdlIGhhcHBlbmVkIHRob3VnaCAtIGlmIHRoaXMgZGlkIGhhcHBlbiB0aGVuIHdlJ2xsIHdhbnRcbiAgICAgICAgLy8gdG8gZm9yY2UgdGhlIHBvc2l0aW9uIHRvIHplcm8gKHRvcCkgdG8gZW5zdXJlIHdlIGNhbiBwcm9wZXJseSBoYW5kbGUgaXQuXG4gICAgICAgIGNvbnN0IHdhc1N0aWNreSA9IHRoaXMuX2xhc3RTdGlja3lSb29tLnJvb20gPyB0aGlzLl9sYXN0U3RpY2t5Um9vbS5yb29tLnJvb21JZCA9PT0gdmFsLnJvb21JZCA6IGZhbHNlO1xuICAgICAgICBpZiAodGhpcy5fbGFzdFN0aWNreVJvb20udGFnICYmIHRhZyAhPT0gdGhpcy5fbGFzdFN0aWNreVJvb20udGFnICYmIHdhc1N0aWNreSAmJiBwb3NpdGlvbiA8IDApIHtcbiAgICAgICAgICAgIGxvZ2dlci53YXJuKGBTdGlja3kgcm9vbSAke3ZhbC5yb29tSWR9IGNoYW5nZWQgdGFncyBkdXJpbmcgc3RpY2t5IHJvb20gaGFuZGxpbmdgKTtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNhbml0eSBjaGVjayB0aGUgcG9zaXRpb24gdG8gbWFrZSBzdXJlIHRoZSByb29tIGlzIHF1YWxpZmllZCBmb3IgYmVpbmcgc3RpY2t5XG4gICAgICAgIGlmIChwb3NpdGlvbiA8IDApIHRocm93IG5ldyBFcnJvcihgJHt2YWwucm9vbUlkfSBkb2VzIG5vdCBhcHBlYXIgdG8gYmUga25vd24gYW5kIGNhbm5vdCBiZSBzdGlja3lgKTtcblxuICAgICAgICAvLyDwn5CJIEhlcmUgYmUgZHJhZ29ucy5cbiAgICAgICAgLy8gQmVmb3JlIHdlIGNhbiBnbyB0aHJvdWdoIHdpdGggbHlpbmcgdG8gdGhlIHVuZGVybHlpbmcgYWxnb3JpdGhtIGFib3V0IGEgcm9vbVxuICAgICAgICAvLyB3ZSBuZWVkIHRvIGVuc3VyZSB0aGF0IHdoZW4gd2UgZG8gd2UncmUgcmVhZHkgZm9yIHRoZSBpbmV2aXRhYmxlIHN0aWNreSByb29tXG4gICAgICAgIC8vIHVwZGF0ZSB3ZSdsbCByZWNlaXZlLiBUbyBwcmVwYXJlIGZvciB0aGF0LCB3ZSBmaXJzdCByZW1vdmUgdGhlIHN0aWNreSByb29tIGFuZFxuICAgICAgICAvLyByZWNhbGN1bGF0ZSB0aGUgc3RhdGUgb3Vyc2VsdmVzIHNvIHRoYXQgd2hlbiB0aGUgdW5kZXJseWluZyBhbGdvcml0aG0gY2FsbHMgZm9yXG4gICAgICAgIC8vIHRoZSBzYW1lIHRoaW5nIGl0IG5vLW9wcy4gQWZ0ZXIgd2UncmUgZG9uZSBjYWxsaW5nIHRoZSBhbGdvcml0aG0sIHdlJ2xsIGlzc3VlXG4gICAgICAgIC8vIGEgbmV3IHVwZGF0ZSBmb3Igb3Vyc2VsdmVzLlxuICAgICAgICBjb25zdCBsYXN0U3RpY2t5Um9vbSA9IHRoaXMuX3N0aWNreVJvb207XG4gICAgICAgIHRoaXMuX3N0aWNreVJvb20gPSBudWxsOyAvLyBjbGVhciBiZWZvcmUgd2UgdXBkYXRlIHRoZSBhbGdvcml0aG1cbiAgICAgICAgdGhpcy5yZWNhbGN1bGF0ZVN0aWNreVJvb20oKTtcblxuICAgICAgICAvLyBXaGVuIHdlIGRvIGhhdmUgdGhlIHJvb20sIHJlLWFkZCB0aGUgb2xkIHJvb20gKGlmIG5lZWRlZCkgdG8gdGhlIGFsZ29yaXRobVxuICAgICAgICAvLyBhbmQgcmVtb3ZlIHRoZSBzdGlja3kgcm9vbSBmcm9tIHRoZSBhbGdvcml0aG0uIFRoaXMgaXMgc28gdGhlIHVuZGVybHlpbmdcbiAgICAgICAgLy8gYWxnb3JpdGhtIGRvZXNuJ3QgdHJ5IGFuZCBjb25mdXNlIGl0c2VsZiB3aXRoIHRoZSBzdGlja3kgcm9vbSBjb25jZXB0LlxuICAgICAgICAvLyBXZSBkb24ndCBhZGQgdGhlIG5ldyByb29tIGlmIHRoZSBzdGlja3kgcm9vbSBpc24ndCBjaGFuZ2luZyBiZWNhdXNlIHRoYXQnc1xuICAgICAgICAvLyBhbiBlYXN5IHdheSB0byBjYXVzZSBkdXBsaWNhdGlvbi4gV2UgaGF2ZSB0byBkbyByb29tIElEIGNoZWNrcyBpbnN0ZWFkIG9mXG4gICAgICAgIC8vIHJlZmVyZW50aWFsIGNoZWNrcyBhcyB0aGUgcmVmZXJlbmNlcyBjYW4gZGlmZmVyIHRocm91Z2ggdGhlIGxpZmVjeWNsZS5cbiAgICAgICAgaWYgKGxhc3RTdGlja3lSb29tICYmIGxhc3RTdGlja3lSb29tLnJvb20gJiYgbGFzdFN0aWNreVJvb20ucm9vbS5yb29tSWQgIT09IHZhbC5yb29tSWQpIHtcbiAgICAgICAgICAgIC8vIExpZSB0byB0aGUgYWxnb3JpdGhtIGFuZCByZS1hZGQgdGhlIHJvb20gdG8gdGhlIGFsZ29yaXRobVxuICAgICAgICAgICAgdGhpcy5oYW5kbGVSb29tVXBkYXRlKGxhc3RTdGlja3lSb29tLnJvb20sIFJvb21VcGRhdGVDYXVzZS5OZXdSb29tKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBMaWUgdG8gdGhlIGFsZ29yaXRobSBhbmQgcmVtb3ZlIHRoZSByb29tIGZyb20gaXQncyBmaWVsZCBvZiB2aWV3XG4gICAgICAgIHRoaXMuaGFuZGxlUm9vbVVwZGF0ZSh2YWwsIFJvb21VcGRhdGVDYXVzZS5Sb29tUmVtb3ZlZCk7XG5cbiAgICAgICAgLy8gQ2hlY2sgZm9yIHRhZyAmIHBvc2l0aW9uIGNoYW5nZXMgd2hpbGUgd2UncmUgaGVyZS4gV2UgYWxzbyBjaGVjayB0aGUgcm9vbSB0byBlbnN1cmVcbiAgICAgICAgLy8gaXQgaXMgc3RpbGwgdGhlIHNhbWUgcm9vbS5cbiAgICAgICAgaWYgKHRoaXMuX3N0aWNreVJvb20pIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9zdGlja3lSb29tLnJvb20gIT09IHZhbCkge1xuICAgICAgICAgICAgICAgIC8vIENoZWNrIHRoZSByb29tIElEcyBqdXN0IGluIGNhc2VcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fc3RpY2t5Um9vbS5yb29tLnJvb21JZCA9PT0gdmFsLnJvb21JZCkge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIud2FybihcIlN0aWNreSByb29tIGNoYW5nZWQgcmVmZXJlbmNlc1wiKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTdGlja3kgcm9vbSBjaGFuZ2VkIHdoaWxlIHRoZSBzdGlja3kgcm9vbSB3YXMgY2hhbmdpbmdcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsb2dnZXIud2FybihgU3RpY2t5IHJvb20gY2hhbmdlZCB0YWcgJiBwb3NpdGlvbiBmcm9tICR7dGFnfSAvICR7cG9zaXRpb259IGBcbiAgICAgICAgICAgICAgICArIGB0byAke3RoaXMuX3N0aWNreVJvb20udGFnfSAvICR7dGhpcy5fc3RpY2t5Um9vbS5wb3NpdGlvbn1gKTtcblxuICAgICAgICAgICAgdGFnID0gdGhpcy5fc3RpY2t5Um9vbS50YWc7XG4gICAgICAgICAgICBwb3NpdGlvbiA9IHRoaXMuX3N0aWNreVJvb20ucG9zaXRpb247XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb3cgdGhhdCB3ZSdyZSBkb25lIGx5aW5nIHRvIHRoZSBhbGdvcml0aG0sIHdlIG5lZWQgdG8gdXBkYXRlIG91ciBwb3NpdGlvblxuICAgICAgICAvLyBtYXJrZXIgb25seSBpZiB0aGUgdXNlciBpcyBtb3ZpbmcgZnVydGhlciBkb3duIHRoZSBzYW1lIGxpc3QuIElmIHRoZXkncmUgc3dpdGNoaW5nXG4gICAgICAgIC8vIGxpc3RzLCBvciBtb3ZpbmcgdXB3YXJkcywgdGhlIHBvc2l0aW9uIG1hcmtlciB3aWxsIHNwbGljZSBpbiBqdXN0IGZpbmUgYnV0IGlmXG4gICAgICAgIC8vIHRoZXkgd2VudCBkb3dud2FyZHMgaW4gdGhlIHNhbWUgbGlzdCB3ZSdsbCBiZSBvZmYgYnkgMSBkdWUgdG8gdGhlIHNoaWZ0aW5nIHJvb21zLlxuICAgICAgICBpZiAobGFzdFN0aWNreVJvb20gJiYgbGFzdFN0aWNreVJvb20udGFnID09PSB0YWcgJiYgbGFzdFN0aWNreVJvb20ucG9zaXRpb24gPD0gcG9zaXRpb24pIHtcbiAgICAgICAgICAgIHBvc2l0aW9uKys7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9zdGlja3lSb29tID0ge1xuICAgICAgICAgICAgcm9vbTogdmFsLFxuICAgICAgICAgICAgcG9zaXRpb246IHBvc2l0aW9uLFxuICAgICAgICAgICAgdGFnOiB0YWcsXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gV2UgdXBkYXRlIHRoZSBmaWx0ZXJlZCByb29tcyBqdXN0IGluIGNhc2UsIGFzIG90aGVyd2lzZSB1c2VycyB3aWxsIGVuZCB1cCB2aXNpdGluZ1xuICAgICAgICAvLyBhIHJvb20gd2hpbGUgZmlsdGVyaW5nIGFuZCBpdCdsbCBkaXNhcHBlYXIuIFdlIGRvbid0IHVwZGF0ZSB0aGUgZmlsdGVyIGVhcmxpZXIgaW5cbiAgICAgICAgLy8gdGhpcyBmdW5jdGlvbiBzaW1wbHkgYmVjYXVzZSB3ZSBkb24ndCBoYXZlIHRvLlxuICAgICAgICB0aGlzLnJlY2FsY3VsYXRlU3RpY2t5Um9vbSgpO1xuICAgICAgICB0aGlzLnJlY2FsY3VsYXRlQWN0aXZlQ2FsbFJvb21zKHRhZyk7XG4gICAgICAgIGlmIChsYXN0U3RpY2t5Um9vbSAmJiBsYXN0U3RpY2t5Um9vbS50YWcgIT09IHRhZykgdGhpcy5yZWNhbGN1bGF0ZUFjdGl2ZUNhbGxSb29tcyhsYXN0U3RpY2t5Um9vbS50YWcpO1xuXG4gICAgICAgIC8vIEZpbmFsbHksIHRyaWdnZXIgYW4gdXBkYXRlXG4gICAgICAgIGlmICh0aGlzLnVwZGF0ZXNJbmhpYml0ZWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5lbWl0KExJU1RfVVBEQVRFRF9FVkVOVCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkFjdGl2ZUNhbGxzID0gKCkgPT4ge1xuICAgICAgICAvLyBJbiBjYXNlIHdlJ3JlIHVuc3RpY2tpbmcgYSByb29tLCBzb3J0IGl0IGJhY2sgaW50byBuYXR1cmFsIG9yZGVyXG4gICAgICAgIHRoaXMucmVjYWxjdWxhdGVTdGlja3lSb29tKCk7XG5cbiAgICAgICAgLy8gVXBkYXRlIHRoZSBzdGlja2luZXNzIG9mIHJvb21zIHdpdGggY2FsbHNcbiAgICAgICAgdGhpcy5yZWNhbGN1bGF0ZUFjdGl2ZUNhbGxSb29tcygpO1xuXG4gICAgICAgIGlmICh0aGlzLnVwZGF0ZXNJbmhpYml0ZWQpIHJldHVybjtcbiAgICAgICAgLy8gVGhpcyBpc24ndCBpbiByZXNwb25zZSB0byBhbnkgcGFydGljdWxhciBSb29tTGlzdFN0b3JlIHVwZGF0ZSxcbiAgICAgICAgLy8gc28gbm90aWZ5IHRoZSBzdG9yZSB0aGF0IGl0IG5lZWRzIHRvIGZvcmNlLXVwZGF0ZVxuICAgICAgICB0aGlzLmVtaXQoTElTVF9VUERBVEVEX0VWRU5ULCB0cnVlKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBpbml0Q2FjaGVkU3RpY2t5Um9vbXMoKSB7XG4gICAgICAgIHRoaXMuX2NhY2hlZFN0aWNreVJvb21zID0ge307XG4gICAgICAgIGZvciAoY29uc3QgdGFnSWQgb2YgT2JqZWN0LmtleXModGhpcy5jYWNoZWRSb29tcykpIHtcbiAgICAgICAgICAgIHRoaXMuX2NhY2hlZFN0aWNreVJvb21zW3RhZ0lkXSA9IFsuLi50aGlzLmNhY2hlZFJvb21zW3RhZ0lkXV07IC8vIHNoYWxsb3cgY2xvbmVcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlY2FsY3VsYXRlIHRoZSBzdGlja3kgcm9vbSBwb3NpdGlvbi4gSWYgdGhpcyBpcyBiZWluZyBjYWxsZWQgaW4gcmVsYXRpb24gdG9cbiAgICAgKiBhIHNwZWNpZmljIHRhZyBiZWluZyB1cGRhdGVkLCBpdCBzaG91bGQgYmUgZ2l2ZW4gdG8gdGhpcyBmdW5jdGlvbiB0byBvcHRpbWl6ZVxuICAgICAqIHRoZSBjYWxsLlxuICAgICAqIEBwYXJhbSB1cGRhdGVkVGFnIFRoZSB0YWcgdGhhdCB3YXMgdXBkYXRlZCwgaWYgcG9zc2libGUuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHJlY2FsY3VsYXRlU3RpY2t5Um9vbSh1cGRhdGVkVGFnOiBUYWdJRCA9IG51bGwpOiB2b2lkIHtcbiAgICAgICAgLy8g8J+QiSBIZXJlIGJlIGRyYWdvbnMuXG4gICAgICAgIC8vIFRoaXMgZnVuY3Rpb24gZG9lcyBmYXIgdG9vIG11Y2ggZm9yIHdoYXQgaXQgc2hvdWxkLCBhbmQgaXMgY2FsbGVkIGJ5IG1hbnkgcGxhY2VzLlxuICAgICAgICAvLyBOb3Qgb25seSBpcyB0aGlzIHJlc3BvbnNpYmxlIGZvciBlbnN1cmluZyB0aGUgc3RpY2t5IHJvb20gaXMgaGVsZCBpbiBwbGFjZSBhdCBhbGxcbiAgICAgICAgLy8gdGltZXMsIGl0IGlzIGFsc28gcmVzcG9uc2libGUgZm9yIGVuc3VyaW5nIG91ciBjbG9uZSBvZiB0aGUgY2FjaGVkUm9vbXMgaXMgdXAgdG9cbiAgICAgICAgLy8gZGF0ZS4gSWYgZWl0aGVyIG9mIHRoZXNlIGRlc3luY3MsIHdlIHNlZSB3ZWlyZCBiZWhhdmlvdXIgbGlrZSBkdXBsaWNhdGVkIHJvb21zLFxuICAgICAgICAvLyBvdXRkYXRlZCBsaXN0cywgYW5kIG90aGVyIG5vbnNlbnNpY2FsIGlzc3VlcyB0aGF0IGFyZW4ndCBuZWNlc3NhcmlseSBvYnZpb3VzLlxuXG4gICAgICAgIGlmICghdGhpcy5fc3RpY2t5Um9vbSkge1xuICAgICAgICAgICAgLy8gSWYgdGhlcmUncyBubyBzdGlja3kgcm9vbSwganVzdCBkbyBub3RoaW5nIHVzZWZ1bC5cbiAgICAgICAgICAgIGlmICghIXRoaXMuX2NhY2hlZFN0aWNreVJvb21zKSB7XG4gICAgICAgICAgICAgICAgLy8gQ2xlYXIgdGhlIGNhY2hlIGlmIHdlIHdvbid0IGJlIG5lZWRpbmcgaXRcbiAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZWRTdGlja3lSb29tcyA9IG51bGw7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudXBkYXRlc0luaGliaXRlZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pdChMSVNUX1VQREFURURfRVZFTlQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLl9jYWNoZWRTdGlja3lSb29tcyB8fCAhdXBkYXRlZFRhZykge1xuICAgICAgICAgICAgdGhpcy5pbml0Q2FjaGVkU3RpY2t5Um9vbXMoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh1cGRhdGVkVGFnKSB7XG4gICAgICAgICAgICAvLyBVcGRhdGUgdGhlIHRhZyBpbmRpY2F0ZWQgYnkgdGhlIGNhbGxlciwgaWYgcG9zc2libGUuIFRoaXMgaXMgbW9zdGx5IHRvIGVuc3VyZVxuICAgICAgICAgICAgLy8gb3VyIGNhY2hlIGlzIHVwIHRvIGRhdGUuXG4gICAgICAgICAgICB0aGlzLl9jYWNoZWRTdGlja3lSb29tc1t1cGRhdGVkVGFnXSA9IFsuLi50aGlzLmNhY2hlZFJvb21zW3VwZGF0ZWRUYWddXTsgLy8gc2hhbGxvdyBjbG9uZVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm93IHRyeSB0byBpbnNlcnQgdGhlIHN0aWNreSByb29tLCBpZiB3ZSBuZWVkIHRvLlxuICAgICAgICAvLyBXZSBuZWVkIHRvIGlmIHRoZXJlJ3Mgbm8gdXBkYXRlZCB0YWcgKHdlIHJlZ2VubmVkIHRoZSB3aG9sZSBjYWNoZSkgb3IgaWYgdGhlIHRhZ1xuICAgICAgICAvLyB3ZSBtaWdodCBoYXZlIHVwZGF0ZWQgZnJvbSB0aGUgY2FjaGUgaXMgYWxzbyBvdXIgc3RpY2t5IHJvb20uXG4gICAgICAgIGNvbnN0IHN0aWNreSA9IHRoaXMuX3N0aWNreVJvb207XG4gICAgICAgIGlmICghdXBkYXRlZFRhZyB8fCB1cGRhdGVkVGFnID09PSBzdGlja3kudGFnKSB7XG4gICAgICAgICAgICB0aGlzLl9jYWNoZWRTdGlja3lSb29tc1tzdGlja3kudGFnXS5zcGxpY2Uoc3RpY2t5LnBvc2l0aW9uLCAwLCBzdGlja3kucm9vbSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGaW5hbGx5LCB0cmlnZ2VyIGFuIHVwZGF0ZVxuICAgICAgICBpZiAodGhpcy51cGRhdGVzSW5oaWJpdGVkKSByZXR1cm47XG4gICAgICAgIHRoaXMuZW1pdChMSVNUX1VQREFURURfRVZFTlQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlY2FsY3VsYXRlIHRoZSBwb3NpdGlvbiBvZiBhbnkgcm9vbXMgd2l0aCBjYWxscy4gSWYgdGhpcyBpcyBiZWluZyBjYWxsZWQgaW5cbiAgICAgKiByZWxhdGlvbiB0byBhIHNwZWNpZmljIHRhZyBiZWluZyB1cGRhdGVkLCBpdCBzaG91bGQgYmUgZ2l2ZW4gdG8gdGhpcyBmdW5jdGlvbiB0b1xuICAgICAqIG9wdGltaXplIHRoZSBjYWxsLlxuICAgICAqXG4gICAgICogVGhpcyBleHBlY3RzIHRvIGJlIGNhbGxlZCAqYWZ0ZXIqIHRoZSBzdGlja3kgcm9vbXMgYXJlIHVwZGF0ZWQsIGFuZCBzdGlja3MgdGhlXG4gICAgICogcm9vbSB3aXRoIHRoZSBjdXJyZW50bHkgYWN0aXZlIGNhbGwgdG8gdGhlIHRvcCBvZiBpdHMgdGFnLlxuICAgICAqXG4gICAgICogQHBhcmFtIHVwZGF0ZWRUYWcgVGhlIHRhZyB0aGF0IHdhcyB1cGRhdGVkLCBpZiBwb3NzaWJsZS5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVjYWxjdWxhdGVBY3RpdmVDYWxsUm9vbXModXBkYXRlZFRhZzogVGFnSUQgPSBudWxsKTogdm9pZCB7XG4gICAgICAgIGlmICghdXBkYXRlZFRhZykge1xuICAgICAgICAgICAgLy8gQXNzdW1lIGFsbCB0YWdzIG5lZWQgdXBkYXRpbmdcbiAgICAgICAgICAgIC8vIFdlJ3JlIG5vdCBtb2RpZnlpbmcgdGhlIG1hcCBoZXJlLCBzbyBjYW4gc2FmZWx5IHJlbHkgb24gdGhlIGNhY2hlZCB2YWx1ZXNcbiAgICAgICAgICAgIC8vIHJhdGhlciB0aGFuIHRoZSBleHBsaWNpdGx5IHN0aWNreSBtYXAuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHRhZ0lkIG9mIE9iamVjdC5rZXlzKHRoaXMuY2FjaGVkUm9vbXMpKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0YWdJZCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIHJlY3Vyc2lvbjogZmFsc3kgdGFnXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnJlY2FsY3VsYXRlQWN0aXZlQ2FsbFJvb21zKHRhZ0lkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChDYWxsU3RvcmUuaW5zdGFuY2UuYWN0aXZlQ2FsbHMuc2l6ZSkge1xuICAgICAgICAgICAgLy8gV2Ugb3BlcmF0ZSBvbiB0aGUgc3RpY2t5IHJvb21zIG1hcFxuICAgICAgICAgICAgaWYgKCF0aGlzLl9jYWNoZWRTdGlja3lSb29tcykgdGhpcy5pbml0Q2FjaGVkU3RpY2t5Um9vbXMoKTtcbiAgICAgICAgICAgIGNvbnN0IHJvb21zID0gdGhpcy5fY2FjaGVkU3RpY2t5Um9vbXNbdXBkYXRlZFRhZ107XG5cbiAgICAgICAgICAgIGNvbnN0IGFjdGl2ZVJvb21JZHMgPSBuZXcgU2V0KFsuLi5DYWxsU3RvcmUuaW5zdGFuY2UuYWN0aXZlQ2FsbHNdLm1hcChjYWxsID0+IGNhbGwucm9vbUlkKSk7XG4gICAgICAgICAgICBjb25zdCBhY3RpdmVSb29tczogUm9vbVtdID0gW107XG4gICAgICAgICAgICBjb25zdCBpbmFjdGl2ZVJvb21zOiBSb29tW10gPSBbXTtcblxuICAgICAgICAgICAgZm9yIChjb25zdCByb29tIG9mIHJvb21zKSB7XG4gICAgICAgICAgICAgICAgKGFjdGl2ZVJvb21JZHMuaGFzKHJvb20ucm9vbUlkKSA/IGFjdGl2ZVJvb21zIDogaW5hY3RpdmVSb29tcykucHVzaChyb29tKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gU3RpY2sgcm9vbXMgd2l0aCBhY3RpdmUgY2FsbHMgdG8gdGhlIHRvcFxuICAgICAgICAgICAgdGhpcy5fY2FjaGVkU3RpY2t5Um9vbXNbdXBkYXRlZFRhZ10gPSBbLi4uYWN0aXZlUm9vbXMsIC4uLmluYWN0aXZlUm9vbXNdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXNrcyB0aGUgQWxnb3JpdGhtIHRvIHJlZ2VuZXJhdGUgYWxsIGxpc3RzLCB1c2luZyB0aGUgdGFncyBnaXZlblxuICAgICAqIGFzIHJlZmVyZW5jZSBmb3Igd2hpY2ggbGlzdHMgdG8gZ2VuZXJhdGUgYW5kIHdoaWNoIHdheSB0byBnZW5lcmF0ZVxuICAgICAqIHRoZW0uXG4gICAgICogQHBhcmFtIHtJVGFnU29ydGluZ01hcH0gdGFnU29ydGluZ01hcCBUaGUgdGFncyB0byBnZW5lcmF0ZS5cbiAgICAgKiBAcGFyYW0ge0lMaXN0T3JkZXJpbmdNYXB9IGxpc3RPcmRlcmluZ01hcCBUaGUgb3JkZXJpbmcgb2YgdGhvc2UgdGFncy5cbiAgICAgKi9cbiAgICBwdWJsaWMgcG9wdWxhdGVUYWdzKHRhZ1NvcnRpbmdNYXA6IElUYWdTb3J0aW5nTWFwLCBsaXN0T3JkZXJpbmdNYXA6IElMaXN0T3JkZXJpbmdNYXApOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0YWdTb3J0aW5nTWFwKSB0aHJvdyBuZXcgRXJyb3IoYFNvcnRpbmcgbWFwIGNhbm5vdCBiZSBudWxsIG9yIGVtcHR5YCk7XG4gICAgICAgIGlmICghbGlzdE9yZGVyaW5nTWFwKSB0aHJvdyBuZXcgRXJyb3IoYE9yZGVyaW5nIG1hIGNhbm5vdCBiZSBudWxsIG9yIGVtcHR5YCk7XG4gICAgICAgIGlmIChhcnJheUhhc0RpZmYoT2JqZWN0LmtleXModGFnU29ydGluZ01hcCksIE9iamVjdC5rZXlzKGxpc3RPcmRlcmluZ01hcCkpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEJvdGggbWFwcyBtdXN0IGNvbnRhaW4gdGhlIGV4YWN0IHNhbWUgdGFnc2ApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc29ydEFsZ29yaXRobXMgPSB0YWdTb3J0aW5nTWFwO1xuICAgICAgICB0aGlzLmxpc3RBbGdvcml0aG1zID0gbGlzdE9yZGVyaW5nTWFwO1xuICAgICAgICB0aGlzLmFsZ29yaXRobXMgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCB0YWcgb2YgT2JqZWN0LmtleXModGFnU29ydGluZ01hcCkpIHtcbiAgICAgICAgICAgIHRoaXMuYWxnb3JpdGhtc1t0YWddID0gZ2V0TGlzdEFsZ29yaXRobUluc3RhbmNlKHRoaXMubGlzdEFsZ29yaXRobXNbdGFnXSwgdGFnLCB0aGlzLnNvcnRBbGdvcml0aG1zW3RhZ10pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnNldEtub3duUm9vbXModGhpcy5yb29tcyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyBhbiBvcmRlcmVkIHNldCBvZiByb29tcyBmb3IgdGhlIGFsbCBrbm93biB0YWdzLlxuICAgICAqIEByZXR1cm5zIHtJVGFnTWFwfSBUaGUgY2FjaGVkIGxpc3Qgb2Ygcm9vbXMsIG9yZGVyZWQsXG4gICAgICogZm9yIGVhY2ggdGFnLiBNYXkgYmUgZW1wdHksIGJ1dCBuZXZlciBudWxsL3VuZGVmaW5lZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0T3JkZXJlZFJvb21zKCk6IElUYWdNYXAge1xuICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVkU3RpY2t5Um9vbXMgfHwgdGhpcy5jYWNoZWRSb29tcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIHJldHVybnMgdGhlIHNhbWUgYXMgZ2V0T3JkZXJlZFJvb21zKCksIGJ1dCB3aXRob3V0IHRoZSBzdGlja3kgcm9vbVxuICAgICAqIG1hcCBhcyBpdCBjYXVzZXMgaXNzdWVzIGZvciBzdGlja3kgcm9vbSBoYW5kbGluZyAoc2VlIHN0aWNreSByb29tIGhhbmRsaW5nXG4gICAgICogZm9yIG1vcmUgaW5mb3JtYXRpb24pLlxuICAgICAqIEByZXR1cm5zIHtJVGFnTWFwfSBUaGUgY2FjaGVkIGxpc3Qgb2Ygcm9vbXMsIG9yZGVyZWQsXG4gICAgICogZm9yIGVhY2ggdGFnLiBNYXkgYmUgZW1wdHksIGJ1dCBuZXZlciBudWxsL3VuZGVmaW5lZC5cbiAgICAgKi9cbiAgICBwcml2YXRlIGdldE9yZGVyZWRSb29tc1dpdGhvdXRTdGlja3koKTogSVRhZ01hcCB7XG4gICAgICAgIHJldHVybiB0aGlzLmNhY2hlZFJvb21zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlZWRzIHRoZSBBbGdvcml0aG0gd2l0aCBhIHNldCBvZiByb29tcy4gVGhlIGFsZ29yaXRobSB3aWxsIGRpc2NhcmQgYWxsXG4gICAgICogcHJldmlvdXNseSBrbm93biBpbmZvcm1hdGlvbiBhbmQgaW5zdGVhZCB1c2UgdGhlc2Ugcm9vbXMgaW5zdGVhZC5cbiAgICAgKiBAcGFyYW0ge1Jvb21bXX0gcm9vbXMgVGhlIHJvb21zIHRvIGZvcmNlIHRoZSBhbGdvcml0aG0gdG8gdXNlLlxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRLbm93blJvb21zKHJvb21zOiBSb29tW10pOiB2b2lkIHtcbiAgICAgICAgaWYgKGlzTnVsbE9yVW5kZWZpbmVkKHJvb21zKSkgdGhyb3cgbmV3IEVycm9yKGBBcnJheSBvZiByb29tcyBjYW5ub3QgYmUgbnVsbGApO1xuICAgICAgICBpZiAoIXRoaXMuc29ydEFsZ29yaXRobXMpIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IHNldCBrbm93biByb29tcyB3aXRob3V0IGEgdGFnIHNvcnRpbmcgbWFwYCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLnVwZGF0ZXNJbmhpYml0ZWQpIHtcbiAgICAgICAgICAgIC8vIFdlIG9ubHkgbG9nIHRoaXMgaWYgd2UncmUgZXhwZWN0aW5nIHRvIGJlIHB1Ymxpc2hpbmcgdXBkYXRlcywgd2hpY2ggbWVhbnMgdGhhdFxuICAgICAgICAgICAgLy8gdGhpcyBjb3VsZCBiZSBhbiB1bmV4cGVjdGVkIGludm9jYXRpb24uIElmIHdlJ3JlIGluaGliaXRlZCwgdGhlbiB0aGlzIGlzIHByb2JhYmx5XG4gICAgICAgICAgICAvLyBhbiBpbnRlbnRpb25hbCBpbnZvY2F0aW9uLlxuICAgICAgICAgICAgbG9nZ2VyLndhcm4oXCJSZXNldHRpbmcga25vd24gcm9vbXMsIGluaXRpYXRpbmcgcmVnZW5lcmF0aW9uXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQmVmb3JlIHdlIGdvIGFueSBmdXJ0aGVyIHdlIG5lZWQgdG8gY2xlYXIgKGJ1dCByZW1lbWJlcikgdGhlIHN0aWNreSByb29tIHRvXG4gICAgICAgIC8vIGF2b2lkIGFjY2lkZW50YWxseSBkdXBsaWNhdGluZyBpdCBpbiB0aGUgbGlzdC5cbiAgICAgICAgY29uc3Qgb2xkU3RpY2t5Um9vbSA9IHRoaXMuX3N0aWNreVJvb207XG4gICAgICAgIGlmIChvbGRTdGlja3lSb29tKSB0aGlzLnVwZGF0ZVN0aWNreVJvb20obnVsbCk7XG5cbiAgICAgICAgdGhpcy5yb29tcyA9IHJvb21zO1xuXG4gICAgICAgIGNvbnN0IG5ld1RhZ3M6IElUYWdNYXAgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCB0YWdJZCBpbiB0aGlzLnNvcnRBbGdvcml0aG1zKSB7XG4gICAgICAgICAgICAvLyBub2luc3BlY3Rpb24gSlNVbmZpbHRlcmVkRm9ySW5Mb29wXG4gICAgICAgICAgICBuZXdUYWdzW3RhZ0lkXSA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgd2UgY2FuIGF2b2lkIGRvaW5nIHdvcmssIGRvIHNvLlxuICAgICAgICBpZiAoIXJvb21zLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZUZyZXNoVGFncyhuZXdUYWdzKTsgLy8ganVzdCBpbiBjYXNlIGl0IHdhbnRzIHRvIGRvIHNvbWV0aGluZ1xuICAgICAgICAgICAgdGhpcy5jYWNoZWRSb29tcyA9IG5ld1RhZ3M7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTcGxpdCBvdXQgdGhlIGVhc3kgcm9vbXMgZmlyc3QgKGxlYXZlIGFuZCBpbnZpdGUpXG4gICAgICAgIGNvbnN0IG1lbWJlcnNoaXBzID0gc3BsaXRSb29tc0J5TWVtYmVyc2hpcChyb29tcyk7XG4gICAgICAgIGZvciAoY29uc3Qgcm9vbSBvZiBtZW1iZXJzaGlwc1tFZmZlY3RpdmVNZW1iZXJzaGlwLkludml0ZV0pIHtcbiAgICAgICAgICAgIG5ld1RhZ3NbRGVmYXVsdFRhZ0lELkludml0ZV0ucHVzaChyb29tKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IHJvb20gb2YgbWVtYmVyc2hpcHNbRWZmZWN0aXZlTWVtYmVyc2hpcC5MZWF2ZV0pIHtcbiAgICAgICAgICAgIG5ld1RhZ3NbRGVmYXVsdFRhZ0lELkFyY2hpdmVkXS5wdXNoKHJvb20pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm93IHByb2Nlc3MgYWxsIHRoZSBqb2luZWQgcm9vbXMuIFRoaXMgaXMgYSBiaXQgbW9yZSBjb21wbGljYXRlZFxuICAgICAgICBmb3IgKGNvbnN0IHJvb20gb2YgbWVtYmVyc2hpcHNbRWZmZWN0aXZlTWVtYmVyc2hpcC5Kb2luXSkge1xuICAgICAgICAgICAgY29uc3QgdGFncyA9IHRoaXMuZ2V0VGFnc09mSm9pbmVkUm9vbShyb29tKTtcblxuICAgICAgICAgICAgbGV0IGluVGFnID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAodGFncy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCB0YWcgb2YgdGFncykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzTnVsbE9yVW5kZWZpbmVkKG5ld1RhZ3NbdGFnXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1RhZ3NbdGFnXS5wdXNoKHJvb20pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5UYWcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWluVGFnKSB7XG4gICAgICAgICAgICAgICAgaWYgKERNUm9vbU1hcC5zaGFyZWQoKS5nZXRVc2VySWRGb3JSb29tSWQocm9vbS5yb29tSWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld1RhZ3NbRGVmYXVsdFRhZ0lELkRNXS5wdXNoKHJvb20pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld1RhZ3NbRGVmYXVsdFRhZ0lELlVudGFnZ2VkXS5wdXNoKHJvb20pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZ2VuZXJhdGVGcmVzaFRhZ3MobmV3VGFncyk7XG5cbiAgICAgICAgdGhpcy5jYWNoZWRSb29tcyA9IG5ld1RhZ3M7IC8vIHRoaXMgcmVjYWxjdWxhdGVzIHRoZSBmaWx0ZXJlZCByb29tcyBmb3IgdXNcbiAgICAgICAgdGhpcy51cGRhdGVUYWdzRnJvbUNhY2hlKCk7XG5cbiAgICAgICAgLy8gTm93IHRoYXQgd2UndmUgZmluaXNoZWQgZ2VuZXJhdGlvbiwgd2UgbmVlZCB0byB1cGRhdGUgdGhlIHN0aWNreSByb29tIHRvIHdoYXRcbiAgICAgICAgLy8gaXQgd2FzLiBJdCdzIGVudGlyZWx5IHBvc3NpYmxlIHRoYXQgaXQgY2hhbmdlZCBsaXN0cyB0aG91Z2gsIHNvIGlmIGl0IGRpZCB0aGVuXG4gICAgICAgIC8vIHdlIGFsc28gaGF2ZSB0byB1cGRhdGUgdGhlIHBvc2l0aW9uIG9mIGl0LlxuICAgICAgICBpZiAob2xkU3RpY2t5Um9vbSAmJiBvbGRTdGlja3lSb29tLnJvb20pIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU3RpY2t5Um9vbShvbGRTdGlja3lSb29tLnJvb20pO1xuICAgICAgICAgICAgaWYgKHRoaXMuX3N0aWNreVJvb20gJiYgdGhpcy5fc3RpY2t5Um9vbS5yb29tKSB7IC8vIGp1c3QgaW4gY2FzZSB0aGUgdXBkYXRlIGRvZXNuJ3QgZ28gYWNjb3JkaW5nIHRvIHBsYW5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fc3RpY2t5Um9vbS50YWcgIT09IG9sZFN0aWNreVJvb20udGFnKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFdlIHB1dCB0aGUgc3RpY2t5IHJvb20gYXQgdGhlIHRvcCBvZiB0aGUgbGlzdCB0byB0cmVhdCBpdCBhcyBhbiBvYnZpb3VzIHRhZyBjaGFuZ2UuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3N0aWNreVJvb20ucG9zaXRpb24gPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlY2FsY3VsYXRlU3RpY2t5Um9vbSh0aGlzLl9zdGlja3lSb29tLnRhZyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGdldFRhZ3NGb3JSb29tKHJvb206IFJvb20pOiBUYWdJRFtdIHtcbiAgICAgICAgY29uc3QgdGFnczogVGFnSURbXSA9IFtdO1xuXG4gICAgICAgIGNvbnN0IG1lbWJlcnNoaXAgPSBnZXRFZmZlY3RpdmVNZW1iZXJzaGlwKHJvb20uZ2V0TXlNZW1iZXJzaGlwKCkpO1xuICAgICAgICBpZiAobWVtYmVyc2hpcCA9PT0gRWZmZWN0aXZlTWVtYmVyc2hpcC5JbnZpdGUpIHtcbiAgICAgICAgICAgIHRhZ3MucHVzaChEZWZhdWx0VGFnSUQuSW52aXRlKTtcbiAgICAgICAgfSBlbHNlIGlmIChtZW1iZXJzaGlwID09PSBFZmZlY3RpdmVNZW1iZXJzaGlwLkxlYXZlKSB7XG4gICAgICAgICAgICB0YWdzLnB1c2goRGVmYXVsdFRhZ0lELkFyY2hpdmVkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhZ3MucHVzaCguLi50aGlzLmdldFRhZ3NPZkpvaW5lZFJvb20ocm9vbSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0YWdzLmxlbmd0aCkgdGFncy5wdXNoKERlZmF1bHRUYWdJRC5VbnRhZ2dlZCk7XG5cbiAgICAgICAgcmV0dXJuIHRhZ3M7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRUYWdzT2ZKb2luZWRSb29tKHJvb206IFJvb20pOiBUYWdJRFtdIHtcbiAgICAgICAgbGV0IHRhZ3MgPSBPYmplY3Qua2V5cyhyb29tLnRhZ3MgfHwge30pO1xuXG4gICAgICAgIGlmICh0YWdzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIGl0J3MgYSBETSBpZiBpdCBpc24ndCBhbnl0aGluZyBlbHNlXG4gICAgICAgICAgICBpZiAoRE1Sb29tTWFwLnNoYXJlZCgpLmdldFVzZXJJZEZvclJvb21JZChyb29tLnJvb21JZCkpIHtcbiAgICAgICAgICAgICAgICB0YWdzID0gW0RlZmF1bHRUYWdJRC5ETV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGFncztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGVzIHRoZSByb29tc1RvVGFncyBtYXBcbiAgICAgKi9cbiAgICBwcml2YXRlIHVwZGF0ZVRhZ3NGcm9tQ2FjaGUoKSB7XG4gICAgICAgIGNvbnN0IG5ld01hcCA9IHt9O1xuXG4gICAgICAgIGNvbnN0IHRhZ3MgPSBPYmplY3Qua2V5cyh0aGlzLmNhY2hlZFJvb21zKTtcbiAgICAgICAgZm9yIChjb25zdCB0YWdJZCBvZiB0YWdzKSB7XG4gICAgICAgICAgICBjb25zdCByb29tcyA9IHRoaXMuY2FjaGVkUm9vbXNbdGFnSWRdO1xuICAgICAgICAgICAgZm9yIChjb25zdCByb29tIG9mIHJvb21zKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFuZXdNYXBbcm9vbS5yb29tSWRdKSBuZXdNYXBbcm9vbS5yb29tSWRdID0gW107XG4gICAgICAgICAgICAgICAgbmV3TWFwW3Jvb20ucm9vbUlkXS5wdXNoKHRhZ0lkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucm9vbUlkc1RvVGFncyA9IG5ld01hcDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDYWxsZWQgd2hlbiB0aGUgQWxnb3JpdGhtIGJlbGlldmVzIGEgY29tcGxldGUgcmVnZW5lcmF0aW9uIG9mIHRoZSBleGlzdGluZ1xuICAgICAqIGxpc3RzIGlzIG5lZWRlZC5cbiAgICAgKiBAcGFyYW0ge0lUYWdNYXB9IHVwZGF0ZWRUYWdNYXAgVGhlIHRhZyBtYXAgd2hpY2ggbmVlZHMgcG9wdWxhdGluZy4gRWFjaCB0YWdcbiAgICAgKiB3aWxsIGFscmVhZHkgaGF2ZSB0aGUgcm9vbXMgd2hpY2ggYmVsb25nIHRvIGl0IC0gdGhleSBqdXN0IG5lZWQgb3JkZXJpbmcuIE11c3RcbiAgICAgKiBiZSBtdXRhdGVkIGluIHBsYWNlLlxuICAgICAqL1xuICAgIHByaXZhdGUgZ2VuZXJhdGVGcmVzaFRhZ3ModXBkYXRlZFRhZ01hcDogSVRhZ01hcCk6IHZvaWQge1xuICAgICAgICBpZiAoIXRoaXMuYWxnb3JpdGhtcykgdGhyb3cgbmV3IEVycm9yKFwiTm90IHJlYWR5OiBubyBhbGdvcml0aG1zIHRvIGRldGVybWluZSB0YWdzIGZyb21cIik7XG5cbiAgICAgICAgZm9yIChjb25zdCB0YWcgb2YgT2JqZWN0LmtleXModXBkYXRlZFRhZ01hcCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGFsZ29yaXRobTogT3JkZXJpbmdBbGdvcml0aG0gPSB0aGlzLmFsZ29yaXRobXNbdGFnXTtcbiAgICAgICAgICAgIGlmICghYWxnb3JpdGhtKSB0aHJvdyBuZXcgRXJyb3IoYE5vIGFsZ29yaXRobSBmb3IgJHt0YWd9YCk7XG5cbiAgICAgICAgICAgIGFsZ29yaXRobS5zZXRSb29tcyh1cGRhdGVkVGFnTWFwW3RhZ10pO1xuICAgICAgICAgICAgdXBkYXRlZFRhZ01hcFt0YWddID0gYWxnb3JpdGhtLm9yZGVyZWRSb29tcztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFza3MgdGhlIEFsZ29yaXRobSB0byB1cGRhdGUgaXRzIGtub3dsZWRnZSBvZiBhIHJvb20uIEZvciBleGFtcGxlLCB3aGVuXG4gICAgICogYSB1c2VyIHRhZ3MgYSByb29tLCBqb2lucy9jcmVhdGVzIGEgcm9vbSwgb3IgbGVhdmVzIGEgcm9vbSB0aGUgQWxnb3JpdGhtXG4gICAgICogc2hvdWxkIGJlIHRvbGQgdGhhdCB0aGUgcm9vbSdzIGluZm8gbWlnaHQgaGF2ZSBjaGFuZ2VkLiBUaGUgQWxnb3JpdGhtXG4gICAgICogbWF5IG5vLW9wIHRoaXMgcmVxdWVzdCBpZiBubyBjaGFuZ2VzIGFyZSByZXF1aXJlZC5cbiAgICAgKiBAcGFyYW0ge1Jvb219IHJvb20gVGhlIHJvb20gd2hpY2ggbWlnaHQgaGF2ZSBhZmZlY3RlZCBzb3J0aW5nLlxuICAgICAqIEBwYXJhbSB7Um9vbVVwZGF0ZUNhdXNlfSBjYXVzZSBUaGUgcmVhc29uIGZvciB0aGUgdXBkYXRlIGJlaW5nIHRyaWdnZXJlZC5cbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPn0gQSBib29sZWFuIG9mIHdoZXRoZXIgb3Igbm90IGdldE9yZGVyZWRSb29tcygpXG4gICAgICogc2hvdWxkIGJlIGNhbGxlZCBhZnRlciBwcm9jZXNzaW5nLlxuICAgICAqL1xuICAgIHB1YmxpYyBoYW5kbGVSb29tVXBkYXRlKHJvb206IFJvb20sIGNhdXNlOiBSb29tVXBkYXRlQ2F1c2UpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCF0aGlzLmFsZ29yaXRobXMpIHRocm93IG5ldyBFcnJvcihcIk5vdCByZWFkeTogbm8gYWxnb3JpdGhtcyB0byBkZXRlcm1pbmUgdGFncyBmcm9tXCIpO1xuXG4gICAgICAgIC8vIE5vdGU6IGNoZWNrIHRoZSBpc1N0aWNreSBhZ2FpbnN0IHRoZSByb29tIElEIGp1c3QgaW4gY2FzZSB0aGUgcmVmZXJlbmNlIGlzIHdyb25nXG4gICAgICAgIGNvbnN0IGlzU3RpY2t5ID0gdGhpcy5fc3RpY2t5Um9vbT8ucm9vbT8ucm9vbUlkID09PSByb29tLnJvb21JZDtcbiAgICAgICAgaWYgKGNhdXNlID09PSBSb29tVXBkYXRlQ2F1c2UuTmV3Um9vbSkge1xuICAgICAgICAgICAgY29uc3QgaXNGb3JMYXN0U3RpY2t5ID0gdGhpcy5fbGFzdFN0aWNreVJvb20/LnJvb20gPT09IHJvb207XG4gICAgICAgICAgICBjb25zdCByb29tVGFncyA9IHRoaXMucm9vbUlkc1RvVGFnc1tyb29tLnJvb21JZF07XG4gICAgICAgICAgICBjb25zdCBoYXNUYWdzID0gcm9vbVRhZ3MgJiYgcm9vbVRhZ3MubGVuZ3RoID4gMDtcblxuICAgICAgICAgICAgLy8gRG9uJ3QgY2hhbmdlIHRoZSBjYXVzZSBpZiB0aGUgbGFzdCBzdGlja3kgcm9vbSBpcyBiZWluZyByZS1hZGRlZC4gSWYgd2UgZmFpbCB0b1xuICAgICAgICAgICAgLy8gcGFzcyB0aGUgY2F1c2UgdGhyb3VnaCBhcyBOZXdSb29tLCB3ZSdsbCBmYWlsIHRvIGxpZSB0byB0aGUgYWxnb3JpdGhtIGFuZCB0aHVzXG4gICAgICAgICAgICAvLyBsb3NlIHRoZSByb29tLlxuICAgICAgICAgICAgaWYgKGhhc1RhZ3MgJiYgIWlzRm9yTGFzdFN0aWNreSkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci53YXJuKGAke3Jvb20ucm9vbUlkfSBpcyByZXBvcnRlZGx5IG5ldyBidXQgaXMgYWxyZWFkeSBrbm93biAtIGFzc3VtaW5nIFRhZ0NoYW5nZSBpbnN0ZWFkYCk7XG4gICAgICAgICAgICAgICAgY2F1c2UgPSBSb29tVXBkYXRlQ2F1c2UuUG9zc2libGVUYWdDaGFuZ2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiB0aGUgcm9vbSBpcyBrbm93biBmaXJzdFxuICAgICAgICAgICAgbGV0IGtub3duUm9vbVJlZiA9IHRoaXMucm9vbXMuaW5jbHVkZXMocm9vbSk7XG4gICAgICAgICAgICBpZiAoaGFzVGFncyAmJiAha25vd25Sb29tUmVmKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oYCR7cm9vbS5yb29tSWR9IG1pZ2h0IGJlIGEgcmVmZXJlbmNlIGNoYW5nZSAtIGF0dGVtcHRpbmcgdG8gdXBkYXRlIHJlZmVyZW5jZWApO1xuICAgICAgICAgICAgICAgIHRoaXMucm9vbXMgPSB0aGlzLnJvb21zLm1hcChyID0+IHIucm9vbUlkID09PSByb29tLnJvb21JZCA/IHJvb20gOiByKTtcbiAgICAgICAgICAgICAgICBrbm93blJvb21SZWYgPSB0aGlzLnJvb21zLmluY2x1ZGVzKHJvb20pO1xuICAgICAgICAgICAgICAgIGlmICgha25vd25Sb29tUmVmKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci53YXJuKGAke3Jvb20ucm9vbUlkfSBpcyBzdGlsbCBub3QgcmVmZXJlbmNlZC4gSXQgbWF5IGJlIHN0aWNreS5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIElmIHdlIGhhdmUgdGFncyBmb3IgYSByb29tIGFuZCBkb24ndCBoYXZlIHRoZSByb29tIHJlZmVyZW5jZWQsIHNvbWV0aGluZyB3ZW50IGhvcnJpYmx5XG4gICAgICAgICAgICAvLyB3cm9uZyAtIHRoZSByZWZlcmVuY2Ugc2hvdWxkIGhhdmUgYmVlbiB1cGRhdGVkIGFib3ZlLlxuICAgICAgICAgICAgaWYgKGhhc1RhZ3MgJiYgIWtub3duUm9vbVJlZiAmJiAhaXNTdGlja3kpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7cm9vbS5yb29tSWR9IGlzIG1pc3NpbmcgZnJvbSByb29tIGFycmF5IGJ1dCBpcyBrbm93biAtIHRyeWluZyB0byBmaW5kIGR1cGxpY2F0ZWApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBMaWtlIGFib3ZlLCB1cGRhdGUgdGhlIHJlZmVyZW5jZSB0byB0aGUgc3RpY2t5IHJvb20gaWYgd2UgbmVlZCB0b1xuICAgICAgICAgICAgaWYgKGhhc1RhZ3MgJiYgaXNTdGlja3kpIHtcbiAgICAgICAgICAgICAgICAvLyBHbyBkaXJlY3RseSBpbiBhbmQgc2V0IHRoZSBzdGlja3kgcm9vbSdzIG5ldyByZWZlcmVuY2UsIGJlaW5nIGNhcmVmdWwgbm90XG4gICAgICAgICAgICAgICAgLy8gdG8gdHJpZ2dlciBhIHN0aWNreSByb29tIHVwZGF0ZSBvdXJzZWx2ZXMuXG4gICAgICAgICAgICAgICAgdGhpcy5fc3RpY2t5Um9vbS5yb29tID0gcm9vbTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWYgYWZ0ZXIgYWxsIHRoYXQgd2UncmUgc3RpbGwgYSBOZXdSb29tIHVwZGF0ZSwgYWRkIHRoZSByb29tIGlmIGFwcGxpY2FibGUuXG4gICAgICAgICAgICAvLyBXZSBkb24ndCBkbyB0aGlzIGZvciB0aGUgc3RpY2t5IHJvb20gKGJlY2F1c2UgaXQgY2F1c2VzIGR1cGxpY2F0aW9uIGlzc3VlcylcbiAgICAgICAgICAgIC8vIG9yIGlmIHdlIGtub3cgYWJvdXQgdGhlIHJlZmVyZW5jZSAoYXMgaXQgc2hvdWxkIGJlIHJlcGxhY2VkKS5cbiAgICAgICAgICAgIGlmIChjYXVzZSA9PT0gUm9vbVVwZGF0ZUNhdXNlLk5ld1Jvb20gJiYgIWlzU3RpY2t5ICYmICFrbm93blJvb21SZWYpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJvb21zLnB1c2gocm9vbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZGlkVGFnQ2hhbmdlID0gZmFsc2U7XG4gICAgICAgIGlmIChjYXVzZSA9PT0gUm9vbVVwZGF0ZUNhdXNlLlBvc3NpYmxlVGFnQ2hhbmdlKSB7XG4gICAgICAgICAgICBjb25zdCBvbGRUYWdzID0gdGhpcy5yb29tSWRzVG9UYWdzW3Jvb20ucm9vbUlkXSB8fCBbXTtcbiAgICAgICAgICAgIGNvbnN0IG5ld1RhZ3MgPSB0aGlzLmdldFRhZ3NGb3JSb29tKHJvb20pO1xuICAgICAgICAgICAgY29uc3QgZGlmZiA9IGFycmF5RGlmZihvbGRUYWdzLCBuZXdUYWdzKTtcbiAgICAgICAgICAgIGlmIChkaWZmLnJlbW92ZWQubGVuZ3RoID4gMCB8fCBkaWZmLmFkZGVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHJtVGFnIG9mIGRpZmYucmVtb3ZlZCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhbGdvcml0aG06IE9yZGVyaW5nQWxnb3JpdGhtID0gdGhpcy5hbGdvcml0aG1zW3JtVGFnXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFhbGdvcml0aG0pIHRocm93IG5ldyBFcnJvcihgTm8gYWxnb3JpdGhtIGZvciAke3JtVGFnfWApO1xuICAgICAgICAgICAgICAgICAgICBhbGdvcml0aG0uaGFuZGxlUm9vbVVwZGF0ZShyb29tLCBSb29tVXBkYXRlQ2F1c2UuUm9vbVJlbW92ZWQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZWRSb29tc1tybVRhZ10gPSBhbGdvcml0aG0ub3JkZXJlZFJvb21zO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlY2FsY3VsYXRlU3RpY2t5Um9vbShybVRhZyk7IC8vIHVwZGF0ZSBzdGlja3kgcm9vbSB0byBtYWtlIHN1cmUgaXQgbW92ZXMgaWYgbmVlZGVkXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVjYWxjdWxhdGVBY3RpdmVDYWxsUm9vbXMocm1UYWcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGFkZFRhZyBvZiBkaWZmLmFkZGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFsZ29yaXRobTogT3JkZXJpbmdBbGdvcml0aG0gPSB0aGlzLmFsZ29yaXRobXNbYWRkVGFnXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFhbGdvcml0aG0pIHRocm93IG5ldyBFcnJvcihgTm8gYWxnb3JpdGhtIGZvciAke2FkZFRhZ31gKTtcbiAgICAgICAgICAgICAgICAgICAgYWxnb3JpdGhtLmhhbmRsZVJvb21VcGRhdGUocm9vbSwgUm9vbVVwZGF0ZUNhdXNlLk5ld1Jvb20pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZWRSb29tc1thZGRUYWddID0gYWxnb3JpdGhtLm9yZGVyZWRSb29tcztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUgdGhlIHRhZyBtYXAgc28gd2UgZG9uJ3QgcmVnZW4gaXQgaW4gYSBtb21lbnRcbiAgICAgICAgICAgICAgICB0aGlzLnJvb21JZHNUb1RhZ3Nbcm9vbS5yb29tSWRdID0gbmV3VGFncztcblxuICAgICAgICAgICAgICAgIGNhdXNlID0gUm9vbVVwZGF0ZUNhdXNlLlRpbWVsaW5lO1xuICAgICAgICAgICAgICAgIGRpZFRhZ0NoYW5nZSA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgYSB0YWcgY2hhbmdlIHVwZGF0ZSBhbmQgbm8gdGFncyB3ZXJlIGNoYW5nZWQsIG5vdGhpbmcgdG8gZG8hXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZGlkVGFnQ2hhbmdlICYmIGlzU3RpY2t5KSB7XG4gICAgICAgICAgICAgICAgLy8gTWFudWFsbHkgdXBkYXRlIHRoZSB0YWcgZm9yIHRoZSBzdGlja3kgcm9vbSB3aXRob3V0IHRyaWdnZXJpbmcgYSBzdGlja3kgcm9vbVxuICAgICAgICAgICAgICAgIC8vIHVwZGF0ZS4gVGhlIHVwZGF0ZSB3aWxsIGJlIGhhbmRsZWQgaW1wbGljaXRseSBieSB0aGUgc3RpY2t5IHJvb20gaGFuZGxpbmcgYW5kXG4gICAgICAgICAgICAgICAgLy8gcmVxdWlyZXMgbm8gY2hhbmdlcyBvbiBvdXIgcGFydCwgaWYgd2UncmUgaW4gdGhlIG1pZGRsZSBvZiBhIHN0aWNreSByb29tIGNoYW5nZS5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fbGFzdFN0aWNreVJvb20pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc3RpY2t5Um9vbSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb20sXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWc6IHRoaXMucm9vbUlkc1RvVGFnc1tyb29tLnJvb21JZF1bMF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogMCwgLy8gcmlnaHQgYXQgdGhlIHRvcCBhcyBpdCBjaGFuZ2VkIHRhZ3NcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBXZSBoYXZlIHRvIGNsZWFyIHRoZSBsb2NrIGFzIHRoZSBzdGlja3kgcm9vbSBjaGFuZ2Ugd2lsbCB0cmlnZ2VyIHVwZGF0ZXMuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RpY2t5Um9vbShyb29tKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB0aGUgdXBkYXRlIGlzIGZvciBhIHJvb20gY2hhbmdlIHdoaWNoIG1pZ2h0IGJlIHRoZSBzdGlja3kgcm9vbSwgcHJldmVudCBpdC4gV2VcbiAgICAgICAgLy8gbmVlZCB0byBtYWtlIHN1cmUgdGhhdCB0aGUgY2F1c2VzIChOZXdSb29tIGFuZCBSb29tUmVtb3ZlZCkgYXJlIHN0aWxsIHRyaWdnZXJlZCB0aG91Z2hcbiAgICAgICAgLy8gYXMgdGhlIHN0aWNreSByb29tIHJlbGllcyBvbiB0aGlzLlxuICAgICAgICBpZiAoY2F1c2UgIT09IFJvb21VcGRhdGVDYXVzZS5OZXdSb29tICYmIGNhdXNlICE9PSBSb29tVXBkYXRlQ2F1c2UuUm9vbVJlbW92ZWQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0aWNreVJvb20gPT09IHJvb20pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMucm9vbUlkc1RvVGFnc1tyb29tLnJvb21JZF0pIHtcbiAgICAgICAgICAgIGlmIChDQVVTRVNfUkVRVUlSSU5HX1JPT00uaW5jbHVkZXMoY2F1c2UpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBHZXQgdGhlIHRhZ3MgZm9yIHRoZSByb29tIGFuZCBwb3B1bGF0ZSB0aGUgY2FjaGVcbiAgICAgICAgICAgIGNvbnN0IHJvb21UYWdzID0gdGhpcy5nZXRUYWdzRm9yUm9vbShyb29tKS5maWx0ZXIodCA9PiAhaXNOdWxsT3JVbmRlZmluZWQodGhpcy5jYWNoZWRSb29tc1t0XSkpO1xuXG4gICAgICAgICAgICAvLyBcIlRoaXMgc2hvdWxkIG5ldmVyIGhhcHBlblwiIGNvbmRpdGlvbiAtIHdlIHNwZWNpZnkgRGVmYXVsdFRhZ0lELlVudGFnZ2VkIGluIGdldFRhZ3NGb3JSb29tKCksXG4gICAgICAgICAgICAvLyB3aGljaCBtZWFucyB3ZSBzaG91bGQgKmFsd2F5cyogaGF2ZSBhIHRhZyB0byBnbyBvZmYgb2YuXG4gICAgICAgICAgICBpZiAoIXJvb21UYWdzLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKGBUYWdzIGNhbm5vdCBiZSBkZXRlcm1pbmVkIGZvciAke3Jvb20ucm9vbUlkfWApO1xuXG4gICAgICAgICAgICB0aGlzLnJvb21JZHNUb1RhZ3Nbcm9vbS5yb29tSWRdID0gcm9vbVRhZ3M7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0YWdzID0gdGhpcy5yb29tSWRzVG9UYWdzW3Jvb20ucm9vbUlkXTtcbiAgICAgICAgaWYgKCF0YWdzKSB7XG4gICAgICAgICAgICBsb2dnZXIud2FybihgTm8gdGFncyBrbm93biBmb3IgXCIke3Jvb20ubmFtZX1cIiAoJHtyb29tLnJvb21JZH0pYCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgY2hhbmdlZCA9IGRpZFRhZ0NoYW5nZTtcbiAgICAgICAgZm9yIChjb25zdCB0YWcgb2YgdGFncykge1xuICAgICAgICAgICAgY29uc3QgYWxnb3JpdGhtOiBPcmRlcmluZ0FsZ29yaXRobSA9IHRoaXMuYWxnb3JpdGhtc1t0YWddO1xuICAgICAgICAgICAgaWYgKCFhbGdvcml0aG0pIHRocm93IG5ldyBFcnJvcihgTm8gYWxnb3JpdGhtIGZvciAke3RhZ31gKTtcblxuICAgICAgICAgICAgYWxnb3JpdGhtLmhhbmRsZVJvb21VcGRhdGUocm9vbSwgY2F1c2UpO1xuICAgICAgICAgICAgdGhpcy5fY2FjaGVkUm9vbXNbdGFnXSA9IGFsZ29yaXRobS5vcmRlcmVkUm9vbXM7XG5cbiAgICAgICAgICAgIC8vIEZsYWcgdGhhdCB3ZSd2ZSBkb25lIHNvbWV0aGluZ1xuICAgICAgICAgICAgdGhpcy5yZWNhbGN1bGF0ZVN0aWNreVJvb20odGFnKTsgLy8gdXBkYXRlIHN0aWNreSByb29tIHRvIG1ha2Ugc3VyZSBpdCBhcHBlYXJzIGlmIG5lZWRlZFxuICAgICAgICAgICAgdGhpcy5yZWNhbGN1bGF0ZUFjdGl2ZUNhbGxSb29tcyh0YWcpO1xuICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY2hhbmdlZDtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQVNBOztBQUVBOztBQUNBOztBQUNBOztBQXBDQTtB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