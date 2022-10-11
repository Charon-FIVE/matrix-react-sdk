"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getChildOrder = exports.default = exports.SpaceStoreClass = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _lodash = require("lodash");

var _event = require("matrix-js-sdk/src/@types/event");

var _room = require("matrix-js-sdk/src/models/room");

var _client = require("matrix-js-sdk/src/client");

var _logger = require("matrix-js-sdk/src/logger");

var _roomState = require("matrix-js-sdk/src/models/room-state");

var _AsyncStoreWithClient = require("../AsyncStoreWithClient");

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _RoomListStore = _interopRequireDefault(require("../room-list/RoomListStore"));

var _SettingsStore = _interopRequireDefault(require("../../settings/SettingsStore"));

var _DMRoomMap = _interopRequireDefault(require("../../utils/DMRoomMap"));

var _SpaceNotificationState = require("../notifications/SpaceNotificationState");

var _RoomNotificationStateStore = require("../notifications/RoomNotificationStateStore");

var _models = require("../room-list/models");

var _maps = require("../../utils/maps");

var _sets = require("../../utils/sets");

var _RoomViewStore = require("../RoomViewStore");

var _actions = require("../../dispatcher/actions");

var _arrays = require("../../utils/arrays");

var _stringOrderField = require("../../utils/stringOrderField");

var _RoomList = require("../../components/views/rooms/RoomList");

var _ = require(".");

var _RoomAliasCache = require("../../RoomAliasCache");

var _membership = require("../../utils/membership");

var _flattenSpaceHierarchy = require("./flattenSpaceHierarchy");

var _PosthogAnalytics = require("../../PosthogAnalytics");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

const ACTIVE_SPACE_LS_KEY = "mx_active_space";
const metaSpaceOrder = [_.MetaSpace.Home, _.MetaSpace.Favourites, _.MetaSpace.People, _.MetaSpace.Orphans];
const MAX_SUGGESTED_ROOMS = 20;

const getSpaceContextKey = space => `mx_space_context_${space}`;

const partitionSpacesAndRooms = arr => {
  // [spaces, rooms]
  return arr.reduce((result, room) => {
    result[room.isSpaceRoom() ? 0 : 1].push(room);
    return result;
  }, [[], []]);
};

const validOrder = order => {
  if (typeof order === "string" && order.length <= 50 && Array.from(order).every(c => {
    const charCode = c.charCodeAt(0);
    return charCode >= 0x20 && charCode <= 0x7E;
  })) {
    return order;
  }
}; // For sorting space children using a validated `order`, `origin_server_ts`, `room_id`


const getChildOrder = (order, ts, roomId) => {
  return [validOrder(order) ?? NaN, ts, roomId]; // NaN has lodash sort it at the end in asc
};

exports.getChildOrder = getChildOrder;

const getRoomFn = room => {
  return _RoomNotificationStateStore.RoomNotificationStateStore.instance.getRoomState(room);
};

class SpaceStoreClass extends _AsyncStoreWithClient.AsyncStoreWithClient {
  // The spaces representing the roots of the various tree-like hierarchies
  // Map from room/space ID to set of spaces which list it as a child
  // Map from SpaceKey to SpaceNotificationState instance representing that space
  // Map from SpaceKey to Set of room IDs that are direct descendants of that space
  // won't contain MetaSpace.People
  // Map from space id to Set of space keys that are direct descendants of that space
  // meta spaces do not have descendants
  // Map from space id to Set of user IDs that are direct descendants of that space
  // cache that stores the aggregated lists of roomIdsBySpace and userIdsBySpace
  // cleared on changes
  // The space currently selected in the Space Panel
  // set properly by onReady
  // The following properties are set by onReady as they live in account_data
  constructor() {
    var _this;

    super(_dispatcher.default, {});
    _this = this;
    (0, _defineProperty2.default)(this, "rootSpaces", []);
    (0, _defineProperty2.default)(this, "parentMap", new _maps.EnhancedMap());
    (0, _defineProperty2.default)(this, "notificationStateMap", new Map());
    (0, _defineProperty2.default)(this, "roomIdsBySpace", new Map());
    (0, _defineProperty2.default)(this, "childSpacesBySpace", new Map());
    (0, _defineProperty2.default)(this, "userIdsBySpace", new Map());
    (0, _defineProperty2.default)(this, "_aggregatedSpaceCache", {
      roomIdsBySpace: new Map(),
      userIdsBySpace: new Map()
    });
    (0, _defineProperty2.default)(this, "_activeSpace", _.MetaSpace.Home);
    (0, _defineProperty2.default)(this, "_suggestedRooms", []);
    (0, _defineProperty2.default)(this, "_invitedSpaces", new Set());
    (0, _defineProperty2.default)(this, "spaceOrderLocalEchoMap", new Map());
    (0, _defineProperty2.default)(this, "_allRoomsInHome", false);
    (0, _defineProperty2.default)(this, "_enabledMetaSpaces", []);
    (0, _defineProperty2.default)(this, "fetchSuggestedRooms", async function (space) {
      let limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : MAX_SUGGESTED_ROOMS;

      try {
        const {
          rooms
        } = await _this.matrixClient.getRoomHierarchy(space.roomId, limit, 1, true);
        const viaMap = new _maps.EnhancedMap();
        rooms.forEach(room => {
          room.children_state.forEach(ev => {
            if (ev.type === _event.EventType.SpaceChild && ev.content.via?.length) {
              ev.content.via.forEach(via => {
                viaMap.getOrCreate(ev.state_key, new Set()).add(via);
              });
            }
          });
        });
        return rooms.filter(roomInfo => {
          return roomInfo.room_type !== _event.RoomType.Space && _this.matrixClient.getRoom(roomInfo.room_id)?.getMyMembership() !== "join";
        }).map(roomInfo => _objectSpread(_objectSpread({}, roomInfo), {}, {
          viaServers: Array.from(viaMap.get(roomInfo.room_id) || [])
        }));
      } catch (e) {
        _logger.logger.error(e);
      }

      return [];
    });
    (0, _defineProperty2.default)(this, "getSpaceFilteredRoomIds", function (space) {
      let includeDescendantSpaces = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      let useCache = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

      if (space === _.MetaSpace.Home && _this.allRoomsInHome) {
        return new Set(_this.matrixClient.getVisibleRooms().map(r => r.roomId));
      } // meta spaces never have descendants
      // and the aggregate cache is not managed for meta spaces


      if (!includeDescendantSpaces || (0, _.isMetaSpace)(space)) {
        return _this.roomIdsBySpace.get(space) || new Set();
      }

      return _this.getAggregatedRoomIdsBySpace(_this.roomIdsBySpace, _this.childSpacesBySpace, space, useCache);
    });
    (0, _defineProperty2.default)(this, "getSpaceFilteredUserIds", function (space) {
      let includeDescendantSpaces = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      let useCache = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

      if (space === _.MetaSpace.Home && _this.allRoomsInHome) {
        return undefined;
      }

      if ((0, _.isMetaSpace)(space)) {
        return undefined;
      } // meta spaces never have descendants
      // and the aggregate cache is not managed for meta spaces


      if (!includeDescendantSpaces || (0, _.isMetaSpace)(space)) {
        return _this.userIdsBySpace.get(space) || new Set();
      }

      return _this.getAggregatedUserIdsBySpace(_this.userIdsBySpace, _this.childSpacesBySpace, space, useCache);
    });
    (0, _defineProperty2.default)(this, "getAggregatedRoomIdsBySpace", (0, _flattenSpaceHierarchy.flattenSpaceHierarchyWithCache)(this._aggregatedSpaceCache.roomIdsBySpace));
    (0, _defineProperty2.default)(this, "getAggregatedUserIdsBySpace", (0, _flattenSpaceHierarchy.flattenSpaceHierarchyWithCache)(this._aggregatedSpaceCache.userIdsBySpace));
    (0, _defineProperty2.default)(this, "markTreeChildren", (rootSpace, unseen) => {
      const stack = [rootSpace];

      while (stack.length) {
        const space = stack.pop();
        unseen.delete(space);
        this.getChildSpaces(space.roomId).forEach(space => {
          if (unseen.has(space)) {
            stack.push(space);
          }
        });
      }
    });
    (0, _defineProperty2.default)(this, "findRootSpaces", joinedSpaces => {
      // exclude invited spaces from unseenChildren as they will be forcibly shown at the top level of the treeview
      const unseenSpaces = new Set(joinedSpaces);
      joinedSpaces.forEach(space => {
        this.getChildSpaces(space.roomId).forEach(subspace => {
          unseenSpaces.delete(subspace);
        });
      }); // Consider any spaces remaining in unseenSpaces as root,
      // given they are not children of any known spaces.
      // The hierarchy from these roots may not yet be exhaustive due to the possibility of full-cycles.

      const rootSpaces = Array.from(unseenSpaces); // Next we need to determine the roots of any remaining full-cycles.
      // We sort spaces by room ID to force the cycle breaking to be deterministic.

      const detachedNodes = new Set((0, _lodash.sortBy)(joinedSpaces, space => space.roomId)); // Mark any nodes which are children of our existing root spaces as attached.

      rootSpaces.forEach(rootSpace => {
        this.markTreeChildren(rootSpace, detachedNodes);
      }); // Handle spaces forming fully cyclical relationships.
      // In order, assume each remaining detachedNode is a root unless it has already
      // been claimed as the child of prior detached node.
      // Work from a copy of the detachedNodes set as it will be mutated as part of this operation.
      // TODO consider sorting by number of in-refs to favour nodes with fewer parents.

      Array.from(detachedNodes).forEach(detachedNode => {
        if (!detachedNodes.has(detachedNode)) return; // already claimed, skip
        // declare this detached node a new root, find its children, without ever looping back to it

        rootSpaces.push(detachedNode); // consider this node a new root space

        this.markTreeChildren(detachedNode, detachedNodes); // declare this node and its children attached
      });
      return rootSpaces;
    });
    (0, _defineProperty2.default)(this, "rebuildSpaceHierarchy", () => {
      const visibleSpaces = this.matrixClient.getVisibleRooms().filter(r => r.isSpaceRoom());
      const [joinedSpaces, invitedSpaces] = visibleSpaces.reduce((_ref, s) => {
        let [joined, invited] = _ref;

        switch ((0, _membership.getEffectiveMembership)(s.getMyMembership())) {
          case _membership.EffectiveMembership.Join:
            joined.push(s);
            break;

          case _membership.EffectiveMembership.Invite:
            invited.push(s);
            break;
        }

        return [joined, invited];
      }, [[], []]);
      const rootSpaces = this.findRootSpaces(joinedSpaces);
      const oldRootSpaces = this.rootSpaces;
      this.rootSpaces = this.sortRootSpaces(rootSpaces);
      this.onRoomsUpdate();

      if ((0, _arrays.arrayHasOrderChange)(oldRootSpaces, this.rootSpaces)) {
        this.emit(_.UPDATE_TOP_LEVEL_SPACES, this.spacePanelSpaces, this.enabledMetaSpaces);
      }

      const oldInvitedSpaces = this._invitedSpaces;
      this._invitedSpaces = new Set(this.sortRootSpaces(invitedSpaces));

      if ((0, _sets.setHasDiff)(oldInvitedSpaces, this._invitedSpaces)) {
        this.emit(_.UPDATE_INVITED_SPACES, this.invitedSpaces);
      }
    });
    (0, _defineProperty2.default)(this, "rebuildParentMap", () => {
      const joinedSpaces = this.matrixClient.getVisibleRooms().filter(r => {
        return r.isSpaceRoom() && r.getMyMembership() === "join";
      });
      this.parentMap = new _maps.EnhancedMap();
      joinedSpaces.forEach(space => {
        const children = this.getChildren(space.roomId);
        children.forEach(child => {
          this.parentMap.getOrCreate(child.roomId, new Set()).add(space.roomId);
        });
      });

      _PosthogAnalytics.PosthogAnalytics.instance.setProperty("numSpaces", joinedSpaces.length);
    });
    (0, _defineProperty2.default)(this, "rebuildHomeSpace", () => {
      if (this.allRoomsInHome) {
        // this is a special-case to not have to maintain a set of all rooms
        this.roomIdsBySpace.delete(_.MetaSpace.Home);
      } else {
        const rooms = new Set(this.matrixClient.getVisibleRooms().filter(this.showInHomeSpace).map(r => r.roomId));
        this.roomIdsBySpace.set(_.MetaSpace.Home, rooms);
      }

      if (this.activeSpace === _.MetaSpace.Home) {
        this.switchSpaceIfNeeded();
      }
    });
    (0, _defineProperty2.default)(this, "rebuildMetaSpaces", () => {
      const enabledMetaSpaces = new Set(this.enabledMetaSpaces);
      const visibleRooms = this.matrixClient.getVisibleRooms();

      if (enabledMetaSpaces.has(_.MetaSpace.Home)) {
        this.rebuildHomeSpace();
      } else {
        this.roomIdsBySpace.delete(_.MetaSpace.Home);
      }

      if (enabledMetaSpaces.has(_.MetaSpace.Favourites)) {
        const favourites = visibleRooms.filter(r => r.tags[_models.DefaultTagID.Favourite]);
        this.roomIdsBySpace.set(_.MetaSpace.Favourites, new Set(favourites.map(r => r.roomId)));
      } else {
        this.roomIdsBySpace.delete(_.MetaSpace.Favourites);
      } // The People metaspace doesn't need maintaining
      // Populate the orphans space if the Home space is enabled as it is a superset of it.
      // Home is effectively a super set of People + Orphans with the addition of having all invites too.


      if (enabledMetaSpaces.has(_.MetaSpace.Orphans) || enabledMetaSpaces.has(_.MetaSpace.Home)) {
        const orphans = visibleRooms.filter(r => {
          // filter out DMs and rooms with >0 parents
          return !this.parentMap.get(r.roomId)?.size && !_DMRoomMap.default.shared().getUserIdForRoomId(r.roomId);
        });
        this.roomIdsBySpace.set(_.MetaSpace.Orphans, new Set(orphans.map(r => r.roomId)));
      }

      if ((0, _.isMetaSpace)(this.activeSpace)) {
        this.switchSpaceIfNeeded();
      }
    });
    (0, _defineProperty2.default)(this, "updateNotificationStates", spaces => {
      const enabledMetaSpaces = new Set(this.enabledMetaSpaces);
      const visibleRooms = this.matrixClient.getVisibleRooms();
      let dmBadgeSpace; // only show badges on dms on the most relevant space if such exists

      if (enabledMetaSpaces.has(_.MetaSpace.People)) {
        dmBadgeSpace = _.MetaSpace.People;
      } else if (enabledMetaSpaces.has(_.MetaSpace.Home)) {
        dmBadgeSpace = _.MetaSpace.Home;
      }

      if (!spaces) {
        spaces = [...this.roomIdsBySpace.keys()];

        if (dmBadgeSpace === _.MetaSpace.People) {
          spaces.push(_.MetaSpace.People);
        }

        if (enabledMetaSpaces.has(_.MetaSpace.Home) && !this.allRoomsInHome) {
          spaces.push(_.MetaSpace.Home);
        }
      }

      spaces.forEach(s => {
        if (this.allRoomsInHome && s === _.MetaSpace.Home) return; // we'll be using the global notification state, skip

        const flattenedRoomsForSpace = this.getSpaceFilteredRoomIds(s, true); // Update NotificationStates

        this.getNotificationState(s).setRooms(visibleRooms.filter(room => {
          if (s === _.MetaSpace.People) {
            return this.isRoomInSpace(_.MetaSpace.People, room.roomId);
          }

          if (room.isSpaceRoom() || !flattenedRoomsForSpace.has(room.roomId)) return false;

          if (dmBadgeSpace && _DMRoomMap.default.shared().getUserIdForRoomId(room.roomId)) {
            return s === dmBadgeSpace;
          }

          return true;
        }));
      });

      if (dmBadgeSpace !== _.MetaSpace.People) {
        this.notificationStateMap.delete(_.MetaSpace.People);
      }
    });
    (0, _defineProperty2.default)(this, "showInHomeSpace", room => {
      if (this.allRoomsInHome) return true;
      if (room.isSpaceRoom()) return false;
      return !this.parentMap.get(room.roomId)?.size // put all orphaned rooms in the Home Space
      || !!_DMRoomMap.default.shared().getUserIdForRoomId(room.roomId) || // put all DMs in the Home Space
      room.getMyMembership() === "invite"; // put all invites in the Home Space
    });
    (0, _defineProperty2.default)(this, "onMemberUpdate", (space, userId) => {
      const inSpace = SpaceStoreClass.isInSpace(space.getMember(userId));

      if (inSpace) {
        this.userIdsBySpace.get(space.roomId)?.add(userId);
      } else {
        this.userIdsBySpace.get(space.roomId)?.delete(userId);
      } // bust cache


      this._aggregatedSpaceCache.userIdsBySpace.clear();

      const affectedParentSpaceIds = this.getKnownParents(space.roomId, true);
      this.emit(space.roomId);
      affectedParentSpaceIds.forEach(spaceId => this.emit(spaceId));

      if (!inSpace) {
        // switch space if the DM is no longer considered part of the space
        this.switchSpaceIfNeeded();
      }
    });
    (0, _defineProperty2.default)(this, "onRoomsUpdate", () => {
      const visibleRooms = this.matrixClient.getVisibleRooms();
      const prevRoomsBySpace = this.roomIdsBySpace;
      const prevUsersBySpace = this.userIdsBySpace;
      const prevChildSpacesBySpace = this.childSpacesBySpace;
      this.roomIdsBySpace = new Map();
      this.userIdsBySpace = new Map();
      this.childSpacesBySpace = new Map();
      this.rebuildParentMap(); // mutates this.roomIdsBySpace

      this.rebuildMetaSpaces();
      const hiddenChildren = new _maps.EnhancedMap();
      visibleRooms.forEach(room => {
        if (room.getMyMembership() !== "join") return;
        this.getParents(room.roomId).forEach(parent => {
          hiddenChildren.getOrCreate(parent.roomId, new Set()).add(room.roomId);
        });
      });
      this.rootSpaces.forEach(s => {
        // traverse each space tree in DFS to build up the supersets as you go up,
        // reusing results from like subtrees.
        const traverseSpace = (spaceId, parentPath) => {
          if (parentPath.has(spaceId)) return; // prevent cycles
          // reuse existing results if multiple similar branches exist

          if (this.roomIdsBySpace.has(spaceId) && this.userIdsBySpace.has(spaceId)) {
            return [this.roomIdsBySpace.get(spaceId), this.userIdsBySpace.get(spaceId)];
          }

          const [childSpaces, childRooms] = partitionSpacesAndRooms(this.getChildren(spaceId));
          this.childSpacesBySpace.set(spaceId, new Set(childSpaces.map(space => space.roomId)));
          const roomIds = new Set(childRooms.map(r => r.roomId));
          const space = this.matrixClient?.getRoom(spaceId);
          const userIds = new Set(space?.getMembers().filter(m => {
            return m.membership === "join" || m.membership === "invite";
          }).map(m => m.userId));
          const newPath = new Set(parentPath).add(spaceId);
          childSpaces.forEach(childSpace => {
            traverseSpace(childSpace.roomId, newPath);
          });
          hiddenChildren.get(spaceId)?.forEach(roomId => {
            roomIds.add(roomId);
          }); // Expand room IDs to all known versions of the given rooms

          const expandedRoomIds = new Set(Array.from(roomIds).flatMap(roomId => {
            return this.matrixClient.getRoomUpgradeHistory(roomId, true).map(r => r.roomId);
          }));
          this.roomIdsBySpace.set(spaceId, expandedRoomIds);
          this.userIdsBySpace.set(spaceId, userIds);
          return [expandedRoomIds, userIds];
        };

        traverseSpace(s.roomId, new Set());
      });
      const roomDiff = (0, _maps.mapDiff)(prevRoomsBySpace, this.roomIdsBySpace);
      const userDiff = (0, _maps.mapDiff)(prevUsersBySpace, this.userIdsBySpace);
      const spaceDiff = (0, _maps.mapDiff)(prevChildSpacesBySpace, this.childSpacesBySpace); // filter out keys which changed by reference only by checking whether the sets differ

      const roomsChanged = roomDiff.changed.filter(k => {
        return (0, _sets.setHasDiff)(prevRoomsBySpace.get(k), this.roomIdsBySpace.get(k));
      });
      const usersChanged = userDiff.changed.filter(k => {
        return (0, _sets.setHasDiff)(prevUsersBySpace.get(k), this.userIdsBySpace.get(k));
      });
      const spacesChanged = spaceDiff.changed.filter(k => {
        return (0, _sets.setHasDiff)(prevChildSpacesBySpace.get(k), this.childSpacesBySpace.get(k));
      });
      const changeSet = new Set([...roomDiff.added, ...userDiff.added, ...spaceDiff.added, ...roomDiff.removed, ...userDiff.removed, ...spaceDiff.removed, ...roomsChanged, ...usersChanged, ...spacesChanged]);
      const affectedParents = Array.from(changeSet).flatMap(changedId => [...this.getKnownParents(changedId, true)]);
      affectedParents.forEach(parentId => changeSet.add(parentId)); // bust aggregate cache

      this._aggregatedSpaceCache.roomIdsBySpace.clear();

      this._aggregatedSpaceCache.userIdsBySpace.clear();

      changeSet.forEach(k => {
        this.emit(k);
      });

      if (changeSet.has(this.activeSpace)) {
        this.switchSpaceIfNeeded();
      }

      const notificationStatesToUpdate = [...changeSet];

      if (this.enabledMetaSpaces.includes(_.MetaSpace.People) && userDiff.added.length + userDiff.removed.length + usersChanged.length > 0) {
        notificationStatesToUpdate.push(_.MetaSpace.People);
      }

      this.updateNotificationStates(notificationStatesToUpdate);
    });
    (0, _defineProperty2.default)(this, "switchSpaceIfNeeded", function () {
      let roomId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _RoomViewStore.RoomViewStore.instance.getRoomId();

      if (!_this.isRoomInSpace(_this.activeSpace, roomId) && !_this.matrixClient.getRoom(roomId)?.isSpaceRoom()) {
        _this.switchToRelatedSpace(roomId);
      }
    });
    (0, _defineProperty2.default)(this, "switchToRelatedSpace", roomId => {
      if (this.suggestedRooms.find(r => r.room_id === roomId)) return; // try to find the canonical parent first

      let parent = this.getCanonicalParent(roomId)?.roomId; // otherwise, try to find a root space which contains this room

      if (!parent) {
        parent = this.rootSpaces.find(s => this.isRoomInSpace(s.roomId, roomId))?.roomId;
      } // otherwise, try to find a metaspace which contains this room


      if (!parent) {
        // search meta spaces in reverse as Home is the first and least specific one
        parent = [...this.enabledMetaSpaces].reverse().find(s => this.isRoomInSpace(s, roomId));
      } // don't trigger a context switch when we are switching a space to match the chosen room


      if (parent) {
        this.setActiveSpace(parent, false);
      } else {
        this.goToFirstSpace();
      }
    });
    (0, _defineProperty2.default)(this, "onRoom", (room, newMembership, oldMembership) => {
      const roomMembership = room.getMyMembership();

      if (!roomMembership) {
        // room is still being baked in the js-sdk, we'll process it at Room.myMembership instead
        return;
      }

      const membership = newMembership || roomMembership;

      if (!room.isSpaceRoom()) {
        this.onRoomsUpdate();

        if (membership === "join") {
          // the user just joined a room, remove it from the suggested list if it was there
          const numSuggestedRooms = this._suggestedRooms.length;
          this._suggestedRooms = this._suggestedRooms.filter(r => r.room_id !== room.roomId);

          if (numSuggestedRooms !== this._suggestedRooms.length) {
            this.emit(_.UPDATE_SUGGESTED_ROOMS, this._suggestedRooms);
          } // if the room currently being viewed was just joined then switch to its related space


          if (newMembership === "join" && room.roomId === _RoomViewStore.RoomViewStore.instance.getRoomId()) {
            this.switchSpaceIfNeeded(room.roomId);
          }
        }

        return;
      } // Space


      if (membership === "invite") {
        const len = this._invitedSpaces.size;

        this._invitedSpaces.add(room);

        if (len !== this._invitedSpaces.size) {
          this.emit(_.UPDATE_INVITED_SPACES, this.invitedSpaces);
        }
      } else if (oldMembership === "invite" && membership !== "join") {
        if (this._invitedSpaces.delete(room)) {
          this.emit(_.UPDATE_INVITED_SPACES, this.invitedSpaces);
        }
      } else {
        this.rebuildSpaceHierarchy(); // fire off updates to all parent listeners

        this.parentMap.get(room.roomId)?.forEach(parentId => {
          this.emit(parentId);
        });
        this.emit(room.roomId);
      }

      if (membership === "join" && room.roomId === _RoomViewStore.RoomViewStore.instance.getRoomId()) {
        // if the user was looking at the space and then joined: select that space
        this.setActiveSpace(room.roomId, false);
      } else if (membership === "leave" && room.roomId === this.activeSpace) {
        // user's active space has gone away, go back to home
        this.goToFirstSpace(true);
      }
    });
    (0, _defineProperty2.default)(this, "onRoomState", ev => {
      const room = this.matrixClient.getRoom(ev.getRoomId());
      if (!room) return;

      switch (ev.getType()) {
        case _event.EventType.SpaceChild:
          {
            const target = this.matrixClient.getRoom(ev.getStateKey());

            if (room.isSpaceRoom()) {
              if (target?.isSpaceRoom()) {
                this.rebuildSpaceHierarchy();
                this.emit(target.roomId);
              } else {
                this.onRoomsUpdate();
              }

              this.emit(room.roomId);
            }

            if (room.roomId === this.activeSpace && // current space
            target?.getMyMembership() !== "join" && // target not joined
            ev.getPrevContent().suggested !== ev.getContent().suggested // suggested flag changed
            ) {
              this.loadSuggestedRooms(room);
            }

            break;
          }

        case _event.EventType.SpaceParent:
          // TODO rebuild the space parent and not the room - check permissions?
          // TODO confirm this after implementing parenting behaviour
          if (room.isSpaceRoom()) {
            this.rebuildSpaceHierarchy();
          } else {
            this.onRoomsUpdate();
          }

          this.emit(room.roomId);
          break;

        case _event.EventType.RoomPowerLevels:
          if (room.isSpaceRoom()) {
            this.onRoomsUpdate();
          }

          break;
      }
    });
    (0, _defineProperty2.default)(this, "onRoomStateMembers", ev => {
      const room = this.matrixClient.getRoom(ev.getRoomId());
      const userId = ev.getStateKey();

      if (room?.isSpaceRoom() && // only consider space rooms
      _DMRoomMap.default.shared().getDMRoomsForUserId(userId).length > 0 && // only consider members we have a DM with
      ev.getPrevContent().membership !== ev.getContent().membership // only consider when membership changes
      ) {
        this.onMemberUpdate(room, userId);
      }
    });
    (0, _defineProperty2.default)(this, "onRoomAccountData", (ev, room, lastEv) => {
      if (room.isSpaceRoom() && ev.getType() === _event.EventType.SpaceOrder) {
        this.spaceOrderLocalEchoMap.delete(room.roomId); // clear any local echo

        const order = ev.getContent()?.order;
        const lastOrder = lastEv?.getContent()?.order;

        if (order !== lastOrder) {
          this.notifyIfOrderChanged();
        }
      } else if (ev.getType() === _event.EventType.Tag) {
        // If the room was in favourites and now isn't or the opposite then update its position in the trees
        const oldTags = lastEv?.getContent()?.tags || {};
        const newTags = ev.getContent()?.tags || {};

        if (!!oldTags[_models.DefaultTagID.Favourite] !== !!newTags[_models.DefaultTagID.Favourite]) {
          this.onRoomFavouriteChange(room);
        }
      }
    });
    (0, _defineProperty2.default)(this, "onAccountData", (ev, prevEv) => {
      if (ev.getType() === _event.EventType.Direct) {
        const previousRooms = new Set(Object.values(prevEv?.getContent() ?? {}).flat());
        const currentRooms = new Set(Object.values(ev.getContent()).flat());
        const diff = (0, _sets.setDiff)(previousRooms, currentRooms);
        [...diff.added, ...diff.removed].forEach(roomId => {
          const room = this.matrixClient?.getRoom(roomId);

          if (room) {
            this.onRoomDmChange(room, currentRooms.has(roomId));
          }
        });

        if (diff.removed.length > 0) {
          this.switchSpaceIfNeeded();
        }
      }
    });
    (0, _defineProperty2.default)(this, "getSpaceTagOrdering", space => {
      if (this.spaceOrderLocalEchoMap.has(space.roomId)) return this.spaceOrderLocalEchoMap.get(space.roomId);
      return validOrder(space.getAccountData(_event.EventType.SpaceOrder)?.getContent()?.order);
    });

    _SettingsStore.default.monitorSetting("Spaces.allRoomsInHome", null);

    _SettingsStore.default.monitorSetting("Spaces.enabledMetaSpaces", null);

    _SettingsStore.default.monitorSetting("Spaces.showPeopleInSpace", null);
  }

  get invitedSpaces() {
    return Array.from(this._invitedSpaces);
  }

  get enabledMetaSpaces() {
    return this._enabledMetaSpaces;
  }

  get spacePanelSpaces() {
    return this.rootSpaces;
  }

  get activeSpace() {
    return this._activeSpace;
  }

  get activeSpaceRoom() {
    if ((0, _.isMetaSpace)(this._activeSpace)) return null;
    return this.matrixClient?.getRoom(this._activeSpace);
  }

  get suggestedRooms() {
    return this._suggestedRooms;
  }

  get allRoomsInHome() {
    return this._allRoomsInHome;
  }

  setActiveRoomInSpace(space) {
    if (!(0, _.isMetaSpace)(space) && !this.matrixClient?.getRoom(space)?.isSpaceRoom()) return;
    if (space !== this.activeSpace) this.setActiveSpace(space, false);

    if (space) {
      const roomId = this.getNotificationState(space).getFirstRoomWithNotifications();

      _dispatcher.default.dispatch({
        action: _actions.Action.ViewRoom,
        room_id: roomId,
        context_switch: true,
        metricsTrigger: "WebSpacePanelNotificationBadge"
      });
    } else {
      const lists = _RoomListStore.default.instance.orderedLists;

      for (let i = 0; i < _RoomList.TAG_ORDER.length; i++) {
        const t = _RoomList.TAG_ORDER[i];
        const listRooms = lists[t];
        const unreadRoom = listRooms.find(r => {
          if (this.showInHomeSpace(r)) {
            const state = _RoomNotificationStateStore.RoomNotificationStateStore.instance.getRoomState(r);

            return state.isUnread;
          }
        });

        if (unreadRoom) {
          _dispatcher.default.dispatch({
            action: _actions.Action.ViewRoom,
            room_id: unreadRoom.roomId,
            context_switch: true,
            metricsTrigger: "WebSpacePanelNotificationBadge"
          });

          break;
        }
      }
    }
  }
  /**
   * Sets the active space, updates room list filters,
   * optionally switches the user's room back to where they were when they last viewed that space.
   * @param space which space to switch to.
   * @param contextSwitch whether to switch the user's context,
   * should not be done when the space switch is done implicitly due to another event like switching room.
   */


  setActiveSpace(space) {
    let contextSwitch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    if (!space || !this.matrixClient || space === this.activeSpace) return;
    let cliSpace;

    if (!(0, _.isMetaSpace)(space)) {
      cliSpace = this.matrixClient.getRoom(space);
      if (!cliSpace?.isSpaceRoom()) return;
    } else if (!this.enabledMetaSpaces.includes(space)) {
      return;
    }

    window.localStorage.setItem(ACTIVE_SPACE_LS_KEY, this._activeSpace = space); // Update & persist selected space

    if (contextSwitch) {
      // view last selected room from space
      const roomId = window.localStorage.getItem(getSpaceContextKey(space)); // if the space being selected is an invite then always view that invite
      // else if the last viewed room in this space is joined then view that
      // else view space home or home depending on what is being clicked on

      if (cliSpace?.getMyMembership() !== "invite" && this.matrixClient.getRoom(roomId)?.getMyMembership() === "join" && this.isRoomInSpace(space, roomId)) {
        _dispatcher.default.dispatch({
          action: _actions.Action.ViewRoom,
          room_id: roomId,
          context_switch: true,
          metricsTrigger: "WebSpaceContextSwitch"
        });
      } else if (cliSpace) {
        _dispatcher.default.dispatch({
          action: _actions.Action.ViewRoom,
          room_id: space,
          context_switch: true,
          metricsTrigger: "WebSpaceContextSwitch"
        });
      } else {
        _dispatcher.default.dispatch({
          action: _actions.Action.ViewHomePage,
          context_switch: true
        });
      }
    }

    this.emit(_.UPDATE_SELECTED_SPACE, this.activeSpace);
    this.emit(_.UPDATE_SUGGESTED_ROOMS, this._suggestedRooms = []);

    if (cliSpace) {
      this.loadSuggestedRooms(cliSpace); // Load all members for the selected space and its subspaces,
      // so we can correctly show DMs we have with members of this space.

      SpaceStore.instance.traverseSpace(space, roomId => {
        this.matrixClient.getRoom(roomId)?.loadMembersIfNeeded();
      }, false);
    }
  }

  async loadSuggestedRooms(space) {
    const suggestedRooms = await this.fetchSuggestedRooms(space);

    if (this._activeSpace === space.roomId) {
      this._suggestedRooms = suggestedRooms;
      this.emit(_.UPDATE_SUGGESTED_ROOMS, this._suggestedRooms);
    }
  }

  addRoomToSpace(space, roomId, via) {
    let suggested = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    return this.matrixClient.sendStateEvent(space.roomId, _event.EventType.SpaceChild, {
      via,
      suggested
    }, roomId);
  }

  getChildren(spaceId) {
    const room = this.matrixClient?.getRoom(spaceId);
    const childEvents = room?.currentState.getStateEvents(_event.EventType.SpaceChild).filter(ev => ev.getContent()?.via);
    return (0, _lodash.sortBy)(childEvents, ev => {
      return getChildOrder(ev.getContent().order, ev.getTs(), ev.getStateKey());
    }).map(ev => {
      const history = this.matrixClient.getRoomUpgradeHistory(ev.getStateKey(), true);
      return history[history.length - 1];
    }).filter(room => {
      return room?.getMyMembership() === "join" || room?.getMyMembership() === "invite";
    }) || [];
  }

  getChildRooms(spaceId) {
    return this.getChildren(spaceId).filter(r => !r.isSpaceRoom());
  }

  getChildSpaces(spaceId) {
    // don't show invited subspaces as they surface at the top level for better visibility
    return this.getChildren(spaceId).filter(r => r.isSpaceRoom() && r.getMyMembership() === "join");
  }

  getParents(roomId) {
    let canonicalOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    const userId = this.matrixClient?.getUserId();
    const room = this.matrixClient?.getRoom(roomId);
    return room?.currentState.getStateEvents(_event.EventType.SpaceParent).map(ev => {
      const content = ev.getContent();

      if (!Array.isArray(content.via) || canonicalOnly && !content.canonical) {
        return; // skip
      } // only respect the relationship if the sender has sufficient permissions in the parent to set
      // child relations, as per MSC1772.
      // https://github.com/matrix-org/matrix-doc/blob/main/proposals/1772-groups-as-rooms.md#relationship-between-rooms-and-spaces


      const parent = this.matrixClient.getRoom(ev.getStateKey());
      const relation = parent?.currentState.getStateEvents(_event.EventType.SpaceChild, roomId);

      if (!parent?.currentState.maySendStateEvent(_event.EventType.SpaceChild, userId) || // also skip this relation if the parent had this child added but then since removed it
      relation && !Array.isArray(relation.getContent().via)) {
        return; // skip
      }

      return parent;
    }).filter(Boolean) || [];
  }

  getCanonicalParent(roomId) {
    const parents = this.getParents(roomId, true);
    return (0, _lodash.sortBy)(parents, r => r.roomId)?.[0] || null;
  }

  getKnownParents(roomId, includeAncestors) {
    if (includeAncestors) {
      return (0, _flattenSpaceHierarchy.flattenSpaceHierarchy)(this.parentMap, this.parentMap, roomId);
    }

    return this.parentMap.get(roomId) || new Set();
  }

  isRoomInSpace(space, roomId) {
    let includeDescendantSpaces = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

    if (space === _.MetaSpace.Home && this.allRoomsInHome) {
      return true;
    }

    if (this.getSpaceFilteredRoomIds(space, includeDescendantSpaces)?.has(roomId)) {
      return true;
    }

    const dmPartner = _DMRoomMap.default.shared().getUserIdForRoomId(roomId);

    if (!dmPartner) {
      return false;
    } // beyond this point we know this is a DM


    if (space === _.MetaSpace.Home || space === _.MetaSpace.People) {
      // these spaces contain all DMs
      return true;
    }

    if (!(0, _.isMetaSpace)(space) && this.getSpaceFilteredUserIds(space, includeDescendantSpaces)?.has(dmPartner) && _SettingsStore.default.getValue("Spaces.showPeopleInSpace", space)) {
      return true;
    }

    return false;
  } // get all rooms in a space
  // including descendant spaces


  static isInSpace(member) {
    return member.membership === "join" || member.membership === "invite";
  } // Method for resolving the impact of a single user's membership change in the given Space and its hierarchy


  notifyIfOrderChanged() {
    const rootSpaces = this.sortRootSpaces(this.rootSpaces);

    if ((0, _arrays.arrayHasOrderChange)(this.rootSpaces, rootSpaces)) {
      this.rootSpaces = rootSpaces;
      this.emit(_.UPDATE_TOP_LEVEL_SPACES, this.spacePanelSpaces, this.enabledMetaSpaces);
    }
  }

  onRoomFavouriteChange(room) {
    if (this.enabledMetaSpaces.includes(_.MetaSpace.Favourites)) {
      if (room.tags[_models.DefaultTagID.Favourite]) {
        this.roomIdsBySpace.get(_.MetaSpace.Favourites).add(room.roomId);
      } else {
        this.roomIdsBySpace.get(_.MetaSpace.Favourites).delete(room.roomId);
      }

      this.emit(_.MetaSpace.Favourites);
    }
  }

  onRoomDmChange(room, isDm) {
    const enabledMetaSpaces = new Set(this.enabledMetaSpaces);

    if (!this.allRoomsInHome && enabledMetaSpaces.has(_.MetaSpace.Home)) {
      const homeRooms = this.roomIdsBySpace.get(_.MetaSpace.Home);

      if (this.showInHomeSpace(room)) {
        homeRooms?.add(room.roomId);
      } else if (!this.roomIdsBySpace.get(_.MetaSpace.Orphans).has(room.roomId)) {
        this.roomIdsBySpace.get(_.MetaSpace.Home)?.delete(room.roomId);
      }

      this.emit(_.MetaSpace.Home);
    }

    if (enabledMetaSpaces.has(_.MetaSpace.People)) {
      this.emit(_.MetaSpace.People);
    }

    if (enabledMetaSpaces.has(_.MetaSpace.Orphans) || enabledMetaSpaces.has(_.MetaSpace.Home)) {
      if (isDm && this.roomIdsBySpace.get(_.MetaSpace.Orphans).delete(room.roomId)) {
        this.emit(_.MetaSpace.Orphans);
        this.emit(_.MetaSpace.Home);
      }
    }
  }

  async reset() {
    this.rootSpaces = [];
    this.parentMap = new _maps.EnhancedMap();
    this.notificationStateMap = new Map();
    this.roomIdsBySpace = new Map();
    this.userIdsBySpace = new Map();

    this._aggregatedSpaceCache.roomIdsBySpace.clear();

    this._aggregatedSpaceCache.userIdsBySpace.clear();

    this._activeSpace = _.MetaSpace.Home; // set properly by onReady

    this._suggestedRooms = [];
    this._invitedSpaces = new Set();
    this._enabledMetaSpaces = [];
  }

  async onNotReady() {
    if (this.matrixClient) {
      this.matrixClient.removeListener(_client.ClientEvent.Room, this.onRoom);
      this.matrixClient.removeListener(_room.RoomEvent.MyMembership, this.onRoom);
      this.matrixClient.removeListener(_room.RoomEvent.AccountData, this.onRoomAccountData);
      this.matrixClient.removeListener(_roomState.RoomStateEvent.Events, this.onRoomState);
      this.matrixClient.removeListener(_roomState.RoomStateEvent.Members, this.onRoomStateMembers);
      this.matrixClient.removeListener(_client.ClientEvent.AccountData, this.onAccountData);
    }

    await this.reset();
  }

  async onReady() {
    this.matrixClient.on(_client.ClientEvent.Room, this.onRoom);
    this.matrixClient.on(_room.RoomEvent.MyMembership, this.onRoom);
    this.matrixClient.on(_room.RoomEvent.AccountData, this.onRoomAccountData);
    this.matrixClient.on(_roomState.RoomStateEvent.Events, this.onRoomState);
    this.matrixClient.on(_roomState.RoomStateEvent.Members, this.onRoomStateMembers);
    this.matrixClient.on(_client.ClientEvent.AccountData, this.onAccountData);
    const oldMetaSpaces = this._enabledMetaSpaces;

    const enabledMetaSpaces = _SettingsStore.default.getValue("Spaces.enabledMetaSpaces");

    this._enabledMetaSpaces = metaSpaceOrder.filter(k => enabledMetaSpaces[k]);
    this._allRoomsInHome = _SettingsStore.default.getValue("Spaces.allRoomsInHome");
    this.sendUserProperties();
    this.rebuildSpaceHierarchy(); // trigger an initial update
    // rebuildSpaceHierarchy will only send an update if the spaces have changed.
    // If only the meta spaces have changed, we need to send an update ourselves.

    if ((0, _arrays.arrayHasDiff)(oldMetaSpaces, this._enabledMetaSpaces)) {
      this.emit(_.UPDATE_TOP_LEVEL_SPACES, this.spacePanelSpaces, this.enabledMetaSpaces);
    } // restore selected state from last session if any and still valid


    const lastSpaceId = window.localStorage.getItem(ACTIVE_SPACE_LS_KEY);
    const valid = lastSpaceId && !(0, _.isMetaSpace)(lastSpaceId) ? this.matrixClient.getRoom(lastSpaceId) : enabledMetaSpaces[lastSpaceId];

    if (valid) {
      // don't context switch here as it may break permalinks
      this.setActiveSpace(lastSpaceId, false);
    } else {
      this.switchSpaceIfNeeded();
    }
  }

  sendUserProperties() {
    const enabled = new Set(this.enabledMetaSpaces);

    _PosthogAnalytics.PosthogAnalytics.instance.setProperty("WebMetaSpaceHomeEnabled", enabled.has(_.MetaSpace.Home));

    _PosthogAnalytics.PosthogAnalytics.instance.setProperty("WebMetaSpaceHomeAllRooms", this.allRoomsInHome);

    _PosthogAnalytics.PosthogAnalytics.instance.setProperty("WebMetaSpacePeopleEnabled", enabled.has(_.MetaSpace.People));

    _PosthogAnalytics.PosthogAnalytics.instance.setProperty("WebMetaSpaceFavouritesEnabled", enabled.has(_.MetaSpace.Favourites));

    _PosthogAnalytics.PosthogAnalytics.instance.setProperty("WebMetaSpaceOrphansEnabled", enabled.has(_.MetaSpace.Orphans));
  }

  goToFirstSpace() {
    let contextSwitch = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    this.setActiveSpace(this.enabledMetaSpaces[0] ?? this.spacePanelSpaces[0]?.roomId, contextSwitch);
  }

  async onAction(payload) {
    if (!this.matrixClient) return;

    switch (payload.action) {
      case _actions.Action.ViewRoom:
        {
          // Don't auto-switch rooms when reacting to a context-switch or for new rooms being created
          // as this is not helpful and can create loops of rooms/space switching
          const isSpace = payload.justCreatedOpts?.roomType === _event.RoomType.Space;
          if (payload.context_switch || payload.justCreatedOpts && !isSpace) break;
          let roomId = payload.room_id;

          if (payload.room_alias && !roomId) {
            roomId = (0, _RoomAliasCache.getCachedRoomIDForAlias)(payload.room_alias);
          }

          if (!roomId) return; // we'll get re-fired with the room ID shortly

          const room = this.matrixClient.getRoom(roomId);

          if (room?.isSpaceRoom()) {
            // Don't context switch when navigating to the space room
            // as it will cause you to end up in the wrong room
            this.setActiveSpace(room.roomId, false);
          } else {
            this.switchSpaceIfNeeded(roomId);
          } // Persist last viewed room from a space
          // we don't await setActiveSpace above as we only care about this.activeSpace being up to date
          // synchronously for the below code - everything else can and should be async.


          window.localStorage.setItem(getSpaceContextKey(this.activeSpace), payload.room_id);
          break;
        }

      case _actions.Action.ViewHomePage:
        if (!payload.context_switch && this.enabledMetaSpaces.includes(_.MetaSpace.Home)) {
          this.setActiveSpace(_.MetaSpace.Home, false);
          window.localStorage.setItem(getSpaceContextKey(this.activeSpace), "");
        }

        break;

      case _actions.Action.AfterLeaveRoom:
        if (!(0, _.isMetaSpace)(this._activeSpace) && payload.room_id === this._activeSpace) {
          // User has left the current space, go to first space
          this.goToFirstSpace(true);
        }

        break;

      case _actions.Action.SwitchSpace:
        {
          // Metaspaces start at 1, Spaces follow
          if (payload.num < 1 || payload.num > 9) break;
          const numMetaSpaces = this.enabledMetaSpaces.length;

          if (payload.num <= numMetaSpaces) {
            this.setActiveSpace(this.enabledMetaSpaces[payload.num - 1]);
          } else if (this.spacePanelSpaces.length > payload.num - numMetaSpaces - 1) {
            this.setActiveSpace(this.spacePanelSpaces[payload.num - numMetaSpaces - 1].roomId);
          }

          break;
        }

      case _actions.Action.SettingUpdated:
        {
          switch (payload.settingName) {
            case "Spaces.allRoomsInHome":
              {
                const newValue = _SettingsStore.default.getValue("Spaces.allRoomsInHome");

                if (this.allRoomsInHome !== newValue) {
                  this._allRoomsInHome = newValue;
                  this.emit(_.UPDATE_HOME_BEHAVIOUR, this.allRoomsInHome);

                  if (this.enabledMetaSpaces.includes(_.MetaSpace.Home)) {
                    this.rebuildHomeSpace();
                  }

                  this.sendUserProperties();
                }

                break;
              }

            case "Spaces.enabledMetaSpaces":
              {
                const newValue = _SettingsStore.default.getValue("Spaces.enabledMetaSpaces");

                const enabledMetaSpaces = metaSpaceOrder.filter(k => newValue[k]);

                if ((0, _arrays.arrayHasDiff)(this._enabledMetaSpaces, enabledMetaSpaces)) {
                  const hadPeopleOrHomeEnabled = this.enabledMetaSpaces.some(s => {
                    return s === _.MetaSpace.Home || s === _.MetaSpace.People;
                  });
                  this._enabledMetaSpaces = enabledMetaSpaces;
                  const hasPeopleOrHomeEnabled = this.enabledMetaSpaces.some(s => {
                    return s === _.MetaSpace.Home || s === _.MetaSpace.People;
                  }); // if a metaspace currently being viewed was removed, go to another one

                  if ((0, _.isMetaSpace)(this.activeSpace) && !newValue[this.activeSpace]) {
                    this.switchSpaceIfNeeded();
                  }

                  this.rebuildMetaSpaces();

                  if (hadPeopleOrHomeEnabled !== hasPeopleOrHomeEnabled) {
                    // in this case we have to rebuild everything as DM badges will move to/from real spaces
                    this.updateNotificationStates();
                  } else {
                    this.updateNotificationStates(enabledMetaSpaces);
                  }

                  this.emit(_.UPDATE_TOP_LEVEL_SPACES, this.spacePanelSpaces, this.enabledMetaSpaces);
                  this.sendUserProperties();
                }

                break;
              }

            case "Spaces.showPeopleInSpace":
              // getSpaceFilteredUserIds will return the appropriate value
              this.emit(payload.roomId);

              if (!this.enabledMetaSpaces.some(s => s === _.MetaSpace.Home || s === _.MetaSpace.People)) {
                this.updateNotificationStates([payload.roomId]);
              }

              break;
          }
        }
    }
  }

  getNotificationState(key) {
    if (this.notificationStateMap.has(key)) {
      return this.notificationStateMap.get(key);
    }

    const state = new _SpaceNotificationState.SpaceNotificationState(getRoomFn);
    this.notificationStateMap.set(key, state);
    return state;
  } // traverse space tree with DFS calling fn on each space including the given root one,
  // if includeRooms is true then fn will be called on each leaf room, if it is present in multiple sub-spaces
  // then fn will be called with it multiple times.


  traverseSpace(spaceId, fn) {
    let includeRooms = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    let parentPath = arguments.length > 3 ? arguments[3] : undefined;
    if (parentPath && parentPath.has(spaceId)) return; // prevent cycles

    fn(spaceId);
    const newPath = new Set(parentPath).add(spaceId);
    const [childSpaces, childRooms] = partitionSpacesAndRooms(this.getChildren(spaceId));

    if (includeRooms) {
      childRooms.forEach(r => fn(r.roomId));
    }

    childSpaces.forEach(s => this.traverseSpace(s.roomId, fn, includeRooms, newPath));
  }

  sortRootSpaces(spaces) {
    return (0, _lodash.sortBy)(spaces, [this.getSpaceTagOrdering, "roomId"]);
  }

  async setRootSpaceOrder(space, order) {
    this.spaceOrderLocalEchoMap.set(space.roomId, order);

    try {
      await this.matrixClient.setRoomAccountData(space.roomId, _event.EventType.SpaceOrder, {
        order
      });
    } catch (e) {
      _logger.logger.warn("Failed to set root space order", e);

      if (this.spaceOrderLocalEchoMap.get(space.roomId) === order) {
        this.spaceOrderLocalEchoMap.delete(space.roomId);
      }
    }
  }

  moveRootSpace(fromIndex, toIndex) {
    const currentOrders = this.rootSpaces.map(this.getSpaceTagOrdering);
    const changes = (0, _stringOrderField.reorderLexicographically)(currentOrders, fromIndex, toIndex);
    changes.forEach(_ref2 => {
      let {
        index,
        order
      } = _ref2;
      this.setRootSpaceOrder(this.rootSpaces[index], order);
    });
    this.notifyIfOrderChanged();
  }

}

exports.SpaceStoreClass = SpaceStoreClass;

class SpaceStore {
  static get instance() {
    return SpaceStore.internalInstance;
  }

}

exports.default = SpaceStore;
(0, _defineProperty2.default)(SpaceStore, "internalInstance", (() => {
  const instance = new SpaceStoreClass();
  instance.start();
  return instance;
})());
window.mxSpaceStore = SpaceStore.instance;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBQ1RJVkVfU1BBQ0VfTFNfS0VZIiwibWV0YVNwYWNlT3JkZXIiLCJNZXRhU3BhY2UiLCJIb21lIiwiRmF2b3VyaXRlcyIsIlBlb3BsZSIsIk9ycGhhbnMiLCJNQVhfU1VHR0VTVEVEX1JPT01TIiwiZ2V0U3BhY2VDb250ZXh0S2V5Iiwic3BhY2UiLCJwYXJ0aXRpb25TcGFjZXNBbmRSb29tcyIsImFyciIsInJlZHVjZSIsInJlc3VsdCIsInJvb20iLCJpc1NwYWNlUm9vbSIsInB1c2giLCJ2YWxpZE9yZGVyIiwib3JkZXIiLCJsZW5ndGgiLCJBcnJheSIsImZyb20iLCJldmVyeSIsImMiLCJjaGFyQ29kZSIsImNoYXJDb2RlQXQiLCJnZXRDaGlsZE9yZGVyIiwidHMiLCJyb29tSWQiLCJOYU4iLCJnZXRSb29tRm4iLCJSb29tTm90aWZpY2F0aW9uU3RhdGVTdG9yZSIsImluc3RhbmNlIiwiZ2V0Um9vbVN0YXRlIiwiU3BhY2VTdG9yZUNsYXNzIiwiQXN5bmNTdG9yZVdpdGhDbGllbnQiLCJjb25zdHJ1Y3RvciIsImRlZmF1bHREaXNwYXRjaGVyIiwiRW5oYW5jZWRNYXAiLCJNYXAiLCJyb29tSWRzQnlTcGFjZSIsInVzZXJJZHNCeVNwYWNlIiwiU2V0IiwibGltaXQiLCJyb29tcyIsIm1hdHJpeENsaWVudCIsImdldFJvb21IaWVyYXJjaHkiLCJ2aWFNYXAiLCJmb3JFYWNoIiwiY2hpbGRyZW5fc3RhdGUiLCJldiIsInR5cGUiLCJFdmVudFR5cGUiLCJTcGFjZUNoaWxkIiwiY29udGVudCIsInZpYSIsImdldE9yQ3JlYXRlIiwic3RhdGVfa2V5IiwiYWRkIiwiZmlsdGVyIiwicm9vbUluZm8iLCJyb29tX3R5cGUiLCJSb29tVHlwZSIsIlNwYWNlIiwiZ2V0Um9vbSIsInJvb21faWQiLCJnZXRNeU1lbWJlcnNoaXAiLCJtYXAiLCJ2aWFTZXJ2ZXJzIiwiZ2V0IiwiZSIsImxvZ2dlciIsImVycm9yIiwiaW5jbHVkZURlc2NlbmRhbnRTcGFjZXMiLCJ1c2VDYWNoZSIsImFsbFJvb21zSW5Ib21lIiwiZ2V0VmlzaWJsZVJvb21zIiwiciIsImlzTWV0YVNwYWNlIiwiZ2V0QWdncmVnYXRlZFJvb21JZHNCeVNwYWNlIiwiY2hpbGRTcGFjZXNCeVNwYWNlIiwidW5kZWZpbmVkIiwiZ2V0QWdncmVnYXRlZFVzZXJJZHNCeVNwYWNlIiwiZmxhdHRlblNwYWNlSGllcmFyY2h5V2l0aENhY2hlIiwiX2FnZ3JlZ2F0ZWRTcGFjZUNhY2hlIiwicm9vdFNwYWNlIiwidW5zZWVuIiwic3RhY2siLCJwb3AiLCJkZWxldGUiLCJnZXRDaGlsZFNwYWNlcyIsImhhcyIsImpvaW5lZFNwYWNlcyIsInVuc2VlblNwYWNlcyIsInN1YnNwYWNlIiwicm9vdFNwYWNlcyIsImRldGFjaGVkTm9kZXMiLCJzb3J0QnkiLCJtYXJrVHJlZUNoaWxkcmVuIiwiZGV0YWNoZWROb2RlIiwidmlzaWJsZVNwYWNlcyIsImludml0ZWRTcGFjZXMiLCJzIiwiam9pbmVkIiwiaW52aXRlZCIsImdldEVmZmVjdGl2ZU1lbWJlcnNoaXAiLCJFZmZlY3RpdmVNZW1iZXJzaGlwIiwiSm9pbiIsIkludml0ZSIsImZpbmRSb290U3BhY2VzIiwib2xkUm9vdFNwYWNlcyIsInNvcnRSb290U3BhY2VzIiwib25Sb29tc1VwZGF0ZSIsImFycmF5SGFzT3JkZXJDaGFuZ2UiLCJlbWl0IiwiVVBEQVRFX1RPUF9MRVZFTF9TUEFDRVMiLCJzcGFjZVBhbmVsU3BhY2VzIiwiZW5hYmxlZE1ldGFTcGFjZXMiLCJvbGRJbnZpdGVkU3BhY2VzIiwiX2ludml0ZWRTcGFjZXMiLCJzZXRIYXNEaWZmIiwiVVBEQVRFX0lOVklURURfU1BBQ0VTIiwicGFyZW50TWFwIiwiY2hpbGRyZW4iLCJnZXRDaGlsZHJlbiIsImNoaWxkIiwiUG9zdGhvZ0FuYWx5dGljcyIsInNldFByb3BlcnR5Iiwic2hvd0luSG9tZVNwYWNlIiwic2V0IiwiYWN0aXZlU3BhY2UiLCJzd2l0Y2hTcGFjZUlmTmVlZGVkIiwidmlzaWJsZVJvb21zIiwicmVidWlsZEhvbWVTcGFjZSIsImZhdm91cml0ZXMiLCJ0YWdzIiwiRGVmYXVsdFRhZ0lEIiwiRmF2b3VyaXRlIiwib3JwaGFucyIsInNpemUiLCJETVJvb21NYXAiLCJzaGFyZWQiLCJnZXRVc2VySWRGb3JSb29tSWQiLCJzcGFjZXMiLCJkbUJhZGdlU3BhY2UiLCJrZXlzIiwiZmxhdHRlbmVkUm9vbXNGb3JTcGFjZSIsImdldFNwYWNlRmlsdGVyZWRSb29tSWRzIiwiZ2V0Tm90aWZpY2F0aW9uU3RhdGUiLCJzZXRSb29tcyIsImlzUm9vbUluU3BhY2UiLCJub3RpZmljYXRpb25TdGF0ZU1hcCIsInVzZXJJZCIsImluU3BhY2UiLCJpc0luU3BhY2UiLCJnZXRNZW1iZXIiLCJjbGVhciIsImFmZmVjdGVkUGFyZW50U3BhY2VJZHMiLCJnZXRLbm93blBhcmVudHMiLCJzcGFjZUlkIiwicHJldlJvb21zQnlTcGFjZSIsInByZXZVc2Vyc0J5U3BhY2UiLCJwcmV2Q2hpbGRTcGFjZXNCeVNwYWNlIiwicmVidWlsZFBhcmVudE1hcCIsInJlYnVpbGRNZXRhU3BhY2VzIiwiaGlkZGVuQ2hpbGRyZW4iLCJnZXRQYXJlbnRzIiwicGFyZW50IiwidHJhdmVyc2VTcGFjZSIsInBhcmVudFBhdGgiLCJjaGlsZFNwYWNlcyIsImNoaWxkUm9vbXMiLCJyb29tSWRzIiwidXNlcklkcyIsImdldE1lbWJlcnMiLCJtIiwibWVtYmVyc2hpcCIsIm5ld1BhdGgiLCJjaGlsZFNwYWNlIiwiZXhwYW5kZWRSb29tSWRzIiwiZmxhdE1hcCIsImdldFJvb21VcGdyYWRlSGlzdG9yeSIsInJvb21EaWZmIiwibWFwRGlmZiIsInVzZXJEaWZmIiwic3BhY2VEaWZmIiwicm9vbXNDaGFuZ2VkIiwiY2hhbmdlZCIsImsiLCJ1c2Vyc0NoYW5nZWQiLCJzcGFjZXNDaGFuZ2VkIiwiY2hhbmdlU2V0IiwiYWRkZWQiLCJyZW1vdmVkIiwiYWZmZWN0ZWRQYXJlbnRzIiwiY2hhbmdlZElkIiwicGFyZW50SWQiLCJub3RpZmljYXRpb25TdGF0ZXNUb1VwZGF0ZSIsImluY2x1ZGVzIiwidXBkYXRlTm90aWZpY2F0aW9uU3RhdGVzIiwiUm9vbVZpZXdTdG9yZSIsImdldFJvb21JZCIsInN3aXRjaFRvUmVsYXRlZFNwYWNlIiwic3VnZ2VzdGVkUm9vbXMiLCJmaW5kIiwiZ2V0Q2Fub25pY2FsUGFyZW50IiwicmV2ZXJzZSIsInNldEFjdGl2ZVNwYWNlIiwiZ29Ub0ZpcnN0U3BhY2UiLCJuZXdNZW1iZXJzaGlwIiwib2xkTWVtYmVyc2hpcCIsInJvb21NZW1iZXJzaGlwIiwibnVtU3VnZ2VzdGVkUm9vbXMiLCJfc3VnZ2VzdGVkUm9vbXMiLCJVUERBVEVfU1VHR0VTVEVEX1JPT01TIiwibGVuIiwicmVidWlsZFNwYWNlSGllcmFyY2h5IiwiZ2V0VHlwZSIsInRhcmdldCIsImdldFN0YXRlS2V5IiwiZ2V0UHJldkNvbnRlbnQiLCJzdWdnZXN0ZWQiLCJnZXRDb250ZW50IiwibG9hZFN1Z2dlc3RlZFJvb21zIiwiU3BhY2VQYXJlbnQiLCJSb29tUG93ZXJMZXZlbHMiLCJnZXRETVJvb21zRm9yVXNlcklkIiwib25NZW1iZXJVcGRhdGUiLCJsYXN0RXYiLCJTcGFjZU9yZGVyIiwic3BhY2VPcmRlckxvY2FsRWNob01hcCIsImxhc3RPcmRlciIsIm5vdGlmeUlmT3JkZXJDaGFuZ2VkIiwiVGFnIiwib2xkVGFncyIsIm5ld1RhZ3MiLCJvblJvb21GYXZvdXJpdGVDaGFuZ2UiLCJwcmV2RXYiLCJEaXJlY3QiLCJwcmV2aW91c1Jvb21zIiwiT2JqZWN0IiwidmFsdWVzIiwiZmxhdCIsImN1cnJlbnRSb29tcyIsImRpZmYiLCJzZXREaWZmIiwib25Sb29tRG1DaGFuZ2UiLCJnZXRBY2NvdW50RGF0YSIsIlNldHRpbmdzU3RvcmUiLCJtb25pdG9yU2V0dGluZyIsIl9lbmFibGVkTWV0YVNwYWNlcyIsIl9hY3RpdmVTcGFjZSIsImFjdGl2ZVNwYWNlUm9vbSIsIl9hbGxSb29tc0luSG9tZSIsInNldEFjdGl2ZVJvb21JblNwYWNlIiwiZ2V0Rmlyc3RSb29tV2l0aE5vdGlmaWNhdGlvbnMiLCJkaXNwYXRjaCIsImFjdGlvbiIsIkFjdGlvbiIsIlZpZXdSb29tIiwiY29udGV4dF9zd2l0Y2giLCJtZXRyaWNzVHJpZ2dlciIsImxpc3RzIiwiUm9vbUxpc3RTdG9yZSIsIm9yZGVyZWRMaXN0cyIsImkiLCJUQUdfT1JERVIiLCJ0IiwibGlzdFJvb21zIiwidW5yZWFkUm9vbSIsInN0YXRlIiwiaXNVbnJlYWQiLCJjb250ZXh0U3dpdGNoIiwiY2xpU3BhY2UiLCJ3aW5kb3ciLCJsb2NhbFN0b3JhZ2UiLCJzZXRJdGVtIiwiZ2V0SXRlbSIsIlZpZXdIb21lUGFnZSIsIlVQREFURV9TRUxFQ1RFRF9TUEFDRSIsIlNwYWNlU3RvcmUiLCJsb2FkTWVtYmVyc0lmTmVlZGVkIiwiZmV0Y2hTdWdnZXN0ZWRSb29tcyIsImFkZFJvb21Ub1NwYWNlIiwic2VuZFN0YXRlRXZlbnQiLCJjaGlsZEV2ZW50cyIsImN1cnJlbnRTdGF0ZSIsImdldFN0YXRlRXZlbnRzIiwiZ2V0VHMiLCJoaXN0b3J5IiwiZ2V0Q2hpbGRSb29tcyIsImNhbm9uaWNhbE9ubHkiLCJnZXRVc2VySWQiLCJpc0FycmF5IiwiY2Fub25pY2FsIiwicmVsYXRpb24iLCJtYXlTZW5kU3RhdGVFdmVudCIsIkJvb2xlYW4iLCJwYXJlbnRzIiwiaW5jbHVkZUFuY2VzdG9ycyIsImZsYXR0ZW5TcGFjZUhpZXJhcmNoeSIsImRtUGFydG5lciIsImdldFNwYWNlRmlsdGVyZWRVc2VySWRzIiwiZ2V0VmFsdWUiLCJtZW1iZXIiLCJpc0RtIiwiaG9tZVJvb21zIiwicmVzZXQiLCJvbk5vdFJlYWR5IiwicmVtb3ZlTGlzdGVuZXIiLCJDbGllbnRFdmVudCIsIlJvb20iLCJvblJvb20iLCJSb29tRXZlbnQiLCJNeU1lbWJlcnNoaXAiLCJBY2NvdW50RGF0YSIsIm9uUm9vbUFjY291bnREYXRhIiwiUm9vbVN0YXRlRXZlbnQiLCJFdmVudHMiLCJvblJvb21TdGF0ZSIsIk1lbWJlcnMiLCJvblJvb21TdGF0ZU1lbWJlcnMiLCJvbkFjY291bnREYXRhIiwib25SZWFkeSIsIm9uIiwib2xkTWV0YVNwYWNlcyIsInNlbmRVc2VyUHJvcGVydGllcyIsImFycmF5SGFzRGlmZiIsImxhc3RTcGFjZUlkIiwidmFsaWQiLCJlbmFibGVkIiwib25BY3Rpb24iLCJwYXlsb2FkIiwiaXNTcGFjZSIsImp1c3RDcmVhdGVkT3B0cyIsInJvb21UeXBlIiwicm9vbV9hbGlhcyIsImdldENhY2hlZFJvb21JREZvckFsaWFzIiwiQWZ0ZXJMZWF2ZVJvb20iLCJTd2l0Y2hTcGFjZSIsIm51bSIsIm51bU1ldGFTcGFjZXMiLCJTZXR0aW5nVXBkYXRlZCIsInNldHRpbmdOYW1lIiwibmV3VmFsdWUiLCJVUERBVEVfSE9NRV9CRUhBVklPVVIiLCJoYWRQZW9wbGVPckhvbWVFbmFibGVkIiwic29tZSIsImhhc1Blb3BsZU9ySG9tZUVuYWJsZWQiLCJrZXkiLCJTcGFjZU5vdGlmaWNhdGlvblN0YXRlIiwiZm4iLCJpbmNsdWRlUm9vbXMiLCJnZXRTcGFjZVRhZ09yZGVyaW5nIiwic2V0Um9vdFNwYWNlT3JkZXIiLCJzZXRSb29tQWNjb3VudERhdGEiLCJ3YXJuIiwibW92ZVJvb3RTcGFjZSIsImZyb21JbmRleCIsInRvSW5kZXgiLCJjdXJyZW50T3JkZXJzIiwiY2hhbmdlcyIsInJlb3JkZXJMZXhpY29ncmFwaGljYWxseSIsImluZGV4IiwiaW50ZXJuYWxJbnN0YW5jZSIsInN0YXJ0IiwibXhTcGFjZVN0b3JlIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3N0b3Jlcy9zcGFjZXMvU3BhY2VTdG9yZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgLSAyMDIyIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgTGlzdEl0ZXJhdGVlLCBNYW55LCBzb3J0QnkgfSBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgeyBFdmVudFR5cGUsIFJvb21UeXBlIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9ldmVudFwiO1xuaW1wb3J0IHsgUm9vbSwgUm9vbUV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQgeyBNYXRyaXhFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnRcIjtcbmltcG9ydCB7IENsaWVudEV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NsaWVudFwiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuaW1wb3J0IHsgUm9vbU1lbWJlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbS1tZW1iZXJcIjtcbmltcG9ydCB7IFJvb21TdGF0ZUV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tLXN0YXRlXCI7XG5cbmltcG9ydCB7IEFzeW5jU3RvcmVXaXRoQ2xpZW50IH0gZnJvbSBcIi4uL0FzeW5jU3RvcmVXaXRoQ2xpZW50XCI7XG5pbXBvcnQgZGVmYXVsdERpc3BhdGNoZXIgZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IFJvb21MaXN0U3RvcmUgZnJvbSBcIi4uL3Jvb20tbGlzdC9Sb29tTGlzdFN0b3JlXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IERNUm9vbU1hcCBmcm9tIFwiLi4vLi4vdXRpbHMvRE1Sb29tTWFwXCI7XG5pbXBvcnQgeyBGZXRjaFJvb21GbiB9IGZyb20gXCIuLi9ub3RpZmljYXRpb25zL0xpc3ROb3RpZmljYXRpb25TdGF0ZVwiO1xuaW1wb3J0IHsgU3BhY2VOb3RpZmljYXRpb25TdGF0ZSB9IGZyb20gXCIuLi9ub3RpZmljYXRpb25zL1NwYWNlTm90aWZpY2F0aW9uU3RhdGVcIjtcbmltcG9ydCB7IFJvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlIH0gZnJvbSBcIi4uL25vdGlmaWNhdGlvbnMvUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmVcIjtcbmltcG9ydCB7IERlZmF1bHRUYWdJRCB9IGZyb20gXCIuLi9yb29tLWxpc3QvbW9kZWxzXCI7XG5pbXBvcnQgeyBFbmhhbmNlZE1hcCwgbWFwRGlmZiB9IGZyb20gXCIuLi8uLi91dGlscy9tYXBzXCI7XG5pbXBvcnQgeyBzZXREaWZmLCBzZXRIYXNEaWZmIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3NldHNcIjtcbmltcG9ydCB7IFJvb21WaWV3U3RvcmUgfSBmcm9tIFwiLi4vUm9vbVZpZXdTdG9yZVwiO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IHsgYXJyYXlIYXNEaWZmLCBhcnJheUhhc09yZGVyQ2hhbmdlIH0gZnJvbSBcIi4uLy4uL3V0aWxzL2FycmF5c1wiO1xuaW1wb3J0IHsgcmVvcmRlckxleGljb2dyYXBoaWNhbGx5IH0gZnJvbSBcIi4uLy4uL3V0aWxzL3N0cmluZ09yZGVyRmllbGRcIjtcbmltcG9ydCB7IFRBR19PUkRFUiB9IGZyb20gXCIuLi8uLi9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL1Jvb21MaXN0XCI7XG5pbXBvcnQgeyBTZXR0aW5nVXBkYXRlZFBheWxvYWQgfSBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9TZXR0aW5nVXBkYXRlZFBheWxvYWRcIjtcbmltcG9ydCB7XG4gICAgaXNNZXRhU3BhY2UsXG4gICAgSVN1Z2dlc3RlZFJvb20sXG4gICAgTWV0YVNwYWNlLFxuICAgIFNwYWNlS2V5LFxuICAgIFVQREFURV9IT01FX0JFSEFWSU9VUixcbiAgICBVUERBVEVfSU5WSVRFRF9TUEFDRVMsXG4gICAgVVBEQVRFX1NFTEVDVEVEX1NQQUNFLFxuICAgIFVQREFURV9TVUdHRVNURURfUk9PTVMsXG4gICAgVVBEQVRFX1RPUF9MRVZFTF9TUEFDRVMsXG59IGZyb20gXCIuXCI7XG5pbXBvcnQgeyBnZXRDYWNoZWRSb29tSURGb3JBbGlhcyB9IGZyb20gXCIuLi8uLi9Sb29tQWxpYXNDYWNoZVwiO1xuaW1wb3J0IHsgRWZmZWN0aXZlTWVtYmVyc2hpcCwgZ2V0RWZmZWN0aXZlTWVtYmVyc2hpcCB9IGZyb20gXCIuLi8uLi91dGlscy9tZW1iZXJzaGlwXCI7XG5pbXBvcnQge1xuICAgIGZsYXR0ZW5TcGFjZUhpZXJhcmNoeVdpdGhDYWNoZSxcbiAgICBTcGFjZUVudGl0eU1hcCxcbiAgICBTcGFjZURlc2NlbmRhbnRNYXAsXG4gICAgZmxhdHRlblNwYWNlSGllcmFyY2h5LFxufSBmcm9tIFwiLi9mbGF0dGVuU3BhY2VIaWVyYXJjaHlcIjtcbmltcG9ydCB7IFBvc3Rob2dBbmFseXRpY3MgfSBmcm9tIFwiLi4vLi4vUG9zdGhvZ0FuYWx5dGljc1wiO1xuaW1wb3J0IHsgVmlld1Jvb21QYXlsb2FkIH0gZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvVmlld1Jvb21QYXlsb2FkXCI7XG5pbXBvcnQgeyBWaWV3SG9tZVBhZ2VQYXlsb2FkIH0gZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvVmlld0hvbWVQYWdlUGF5bG9hZFwiO1xuaW1wb3J0IHsgU3dpdGNoU3BhY2VQYXlsb2FkIH0gZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvU3dpdGNoU3BhY2VQYXlsb2FkXCI7XG5pbXBvcnQgeyBBZnRlckxlYXZlUm9vbVBheWxvYWQgfSBmcm9tIFwiLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9BZnRlckxlYXZlUm9vbVBheWxvYWRcIjtcblxuaW50ZXJmYWNlIElTdGF0ZSB7IH1cblxuY29uc3QgQUNUSVZFX1NQQUNFX0xTX0tFWSA9IFwibXhfYWN0aXZlX3NwYWNlXCI7XG5cbmNvbnN0IG1ldGFTcGFjZU9yZGVyOiBNZXRhU3BhY2VbXSA9IFtNZXRhU3BhY2UuSG9tZSwgTWV0YVNwYWNlLkZhdm91cml0ZXMsIE1ldGFTcGFjZS5QZW9wbGUsIE1ldGFTcGFjZS5PcnBoYW5zXTtcblxuY29uc3QgTUFYX1NVR0dFU1RFRF9ST09NUyA9IDIwO1xuXG5jb25zdCBnZXRTcGFjZUNvbnRleHRLZXkgPSAoc3BhY2U6IFNwYWNlS2V5KSA9PiBgbXhfc3BhY2VfY29udGV4dF8ke3NwYWNlfWA7XG5cbmNvbnN0IHBhcnRpdGlvblNwYWNlc0FuZFJvb21zID0gKGFycjogUm9vbVtdKTogW1Jvb21bXSwgUm9vbVtdXSA9PiB7IC8vIFtzcGFjZXMsIHJvb21zXVxuICAgIHJldHVybiBhcnIucmVkdWNlKChyZXN1bHQsIHJvb206IFJvb20pID0+IHtcbiAgICAgICAgcmVzdWx0W3Jvb20uaXNTcGFjZVJvb20oKSA/IDAgOiAxXS5wdXNoKHJvb20pO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0sIFtbXSwgW11dKTtcbn07XG5cbmNvbnN0IHZhbGlkT3JkZXIgPSAob3JkZXI6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCA9PiB7XG4gICAgaWYgKHR5cGVvZiBvcmRlciA9PT0gXCJzdHJpbmdcIiAmJiBvcmRlci5sZW5ndGggPD0gNTAgJiYgQXJyYXkuZnJvbShvcmRlcikuZXZlcnkoKGM6IHN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCBjaGFyQ29kZSA9IGMuY2hhckNvZGVBdCgwKTtcbiAgICAgICAgcmV0dXJuIGNoYXJDb2RlID49IDB4MjAgJiYgY2hhckNvZGUgPD0gMHg3RTtcbiAgICB9KSkge1xuICAgICAgICByZXR1cm4gb3JkZXI7XG4gICAgfVxufTtcblxuLy8gRm9yIHNvcnRpbmcgc3BhY2UgY2hpbGRyZW4gdXNpbmcgYSB2YWxpZGF0ZWQgYG9yZGVyYCwgYG9yaWdpbl9zZXJ2ZXJfdHNgLCBgcm9vbV9pZGBcbmV4cG9ydCBjb25zdCBnZXRDaGlsZE9yZGVyID0gKG9yZGVyOiBzdHJpbmcsIHRzOiBudW1iZXIsIHJvb21JZDogc3RyaW5nKTogQXJyYXk8TWFueTxMaXN0SXRlcmF0ZWU8dW5rbm93bj4+PiA9PiB7XG4gICAgcmV0dXJuIFt2YWxpZE9yZGVyKG9yZGVyKSA/PyBOYU4sIHRzLCByb29tSWRdOyAvLyBOYU4gaGFzIGxvZGFzaCBzb3J0IGl0IGF0IHRoZSBlbmQgaW4gYXNjXG59O1xuXG5jb25zdCBnZXRSb29tRm46IEZldGNoUm9vbUZuID0gKHJvb206IFJvb20pID0+IHtcbiAgICByZXR1cm4gUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUuaW5zdGFuY2UuZ2V0Um9vbVN0YXRlKHJvb20pO1xufTtcblxudHlwZSBTcGFjZVN0b3JlQWN0aW9ucyA9XG4gICAgfCBTZXR0aW5nVXBkYXRlZFBheWxvYWRcbiAgICB8IFZpZXdSb29tUGF5bG9hZFxuICAgIHwgVmlld0hvbWVQYWdlUGF5bG9hZFxuICAgIHwgU3dpdGNoU3BhY2VQYXlsb2FkXG4gICAgfCBBZnRlckxlYXZlUm9vbVBheWxvYWQ7XG5cbmV4cG9ydCBjbGFzcyBTcGFjZVN0b3JlQ2xhc3MgZXh0ZW5kcyBBc3luY1N0b3JlV2l0aENsaWVudDxJU3RhdGU+IHtcbiAgICAvLyBUaGUgc3BhY2VzIHJlcHJlc2VudGluZyB0aGUgcm9vdHMgb2YgdGhlIHZhcmlvdXMgdHJlZS1saWtlIGhpZXJhcmNoaWVzXG4gICAgcHJpdmF0ZSByb290U3BhY2VzOiBSb29tW10gPSBbXTtcbiAgICAvLyBNYXAgZnJvbSByb29tL3NwYWNlIElEIHRvIHNldCBvZiBzcGFjZXMgd2hpY2ggbGlzdCBpdCBhcyBhIGNoaWxkXG4gICAgcHJpdmF0ZSBwYXJlbnRNYXAgPSBuZXcgRW5oYW5jZWRNYXA8c3RyaW5nLCBTZXQ8c3RyaW5nPj4oKTtcbiAgICAvLyBNYXAgZnJvbSBTcGFjZUtleSB0byBTcGFjZU5vdGlmaWNhdGlvblN0YXRlIGluc3RhbmNlIHJlcHJlc2VudGluZyB0aGF0IHNwYWNlXG4gICAgcHJpdmF0ZSBub3RpZmljYXRpb25TdGF0ZU1hcCA9IG5ldyBNYXA8U3BhY2VLZXksIFNwYWNlTm90aWZpY2F0aW9uU3RhdGU+KCk7XG4gICAgLy8gTWFwIGZyb20gU3BhY2VLZXkgdG8gU2V0IG9mIHJvb20gSURzIHRoYXQgYXJlIGRpcmVjdCBkZXNjZW5kYW50cyBvZiB0aGF0IHNwYWNlXG4gICAgcHJpdmF0ZSByb29tSWRzQnlTcGFjZTogU3BhY2VFbnRpdHlNYXAgPSBuZXcgTWFwPFNwYWNlS2V5LCBTZXQ8c3RyaW5nPj4oKTsgLy8gd29uJ3QgY29udGFpbiBNZXRhU3BhY2UuUGVvcGxlXG4gICAgLy8gTWFwIGZyb20gc3BhY2UgaWQgdG8gU2V0IG9mIHNwYWNlIGtleXMgdGhhdCBhcmUgZGlyZWN0IGRlc2NlbmRhbnRzIG9mIHRoYXQgc3BhY2VcbiAgICAvLyBtZXRhIHNwYWNlcyBkbyBub3QgaGF2ZSBkZXNjZW5kYW50c1xuICAgIHByaXZhdGUgY2hpbGRTcGFjZXNCeVNwYWNlOiBTcGFjZURlc2NlbmRhbnRNYXAgPSBuZXcgTWFwPFJvb21bXCJyb29tSWRcIl0sIFNldDxSb29tW1wicm9vbUlkXCJdPj4oKTtcbiAgICAvLyBNYXAgZnJvbSBzcGFjZSBpZCB0byBTZXQgb2YgdXNlciBJRHMgdGhhdCBhcmUgZGlyZWN0IGRlc2NlbmRhbnRzIG9mIHRoYXQgc3BhY2VcbiAgICBwcml2YXRlIHVzZXJJZHNCeVNwYWNlOiBTcGFjZUVudGl0eU1hcCA9IG5ldyBNYXA8Um9vbVtcInJvb21JZFwiXSwgU2V0PHN0cmluZz4+KCk7XG4gICAgLy8gY2FjaGUgdGhhdCBzdG9yZXMgdGhlIGFnZ3JlZ2F0ZWQgbGlzdHMgb2Ygcm9vbUlkc0J5U3BhY2UgYW5kIHVzZXJJZHNCeVNwYWNlXG4gICAgLy8gY2xlYXJlZCBvbiBjaGFuZ2VzXG4gICAgcHJpdmF0ZSBfYWdncmVnYXRlZFNwYWNlQ2FjaGUgPSB7XG4gICAgICAgIHJvb21JZHNCeVNwYWNlOiBuZXcgTWFwPFNwYWNlS2V5LCBTZXQ8c3RyaW5nPj4oKSxcbiAgICAgICAgdXNlcklkc0J5U3BhY2U6IG5ldyBNYXA8Um9vbVtcInJvb21JZFwiXSwgU2V0PHN0cmluZz4+KCksXG4gICAgfTtcbiAgICAvLyBUaGUgc3BhY2UgY3VycmVudGx5IHNlbGVjdGVkIGluIHRoZSBTcGFjZSBQYW5lbFxuICAgIHByaXZhdGUgX2FjdGl2ZVNwYWNlPzogU3BhY2VLZXkgPSBNZXRhU3BhY2UuSG9tZTsgLy8gc2V0IHByb3Blcmx5IGJ5IG9uUmVhZHlcbiAgICBwcml2YXRlIF9zdWdnZXN0ZWRSb29tczogSVN1Z2dlc3RlZFJvb21bXSA9IFtdO1xuICAgIHByaXZhdGUgX2ludml0ZWRTcGFjZXMgPSBuZXcgU2V0PFJvb20+KCk7XG4gICAgcHJpdmF0ZSBzcGFjZU9yZGVyTG9jYWxFY2hvTWFwID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcbiAgICAvLyBUaGUgZm9sbG93aW5nIHByb3BlcnRpZXMgYXJlIHNldCBieSBvblJlYWR5IGFzIHRoZXkgbGl2ZSBpbiBhY2NvdW50X2RhdGFcbiAgICBwcml2YXRlIF9hbGxSb29tc0luSG9tZSA9IGZhbHNlO1xuICAgIHByaXZhdGUgX2VuYWJsZWRNZXRhU3BhY2VzOiBNZXRhU3BhY2VbXSA9IFtdO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKGRlZmF1bHREaXNwYXRjaGVyLCB7fSk7XG5cbiAgICAgICAgU2V0dGluZ3NTdG9yZS5tb25pdG9yU2V0dGluZyhcIlNwYWNlcy5hbGxSb29tc0luSG9tZVwiLCBudWxsKTtcbiAgICAgICAgU2V0dGluZ3NTdG9yZS5tb25pdG9yU2V0dGluZyhcIlNwYWNlcy5lbmFibGVkTWV0YVNwYWNlc1wiLCBudWxsKTtcbiAgICAgICAgU2V0dGluZ3NTdG9yZS5tb25pdG9yU2V0dGluZyhcIlNwYWNlcy5zaG93UGVvcGxlSW5TcGFjZVwiLCBudWxsKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGludml0ZWRTcGFjZXMoKTogUm9vbVtdIHtcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5faW52aXRlZFNwYWNlcyk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBlbmFibGVkTWV0YVNwYWNlcygpOiBNZXRhU3BhY2VbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9lbmFibGVkTWV0YVNwYWNlcztcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHNwYWNlUGFuZWxTcGFjZXMoKTogUm9vbVtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucm9vdFNwYWNlcztcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGFjdGl2ZVNwYWNlKCk6IFNwYWNlS2V5IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FjdGl2ZVNwYWNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgYWN0aXZlU3BhY2VSb29tKCk6IFJvb20gfCBudWxsIHtcbiAgICAgICAgaWYgKGlzTWV0YVNwYWNlKHRoaXMuX2FjdGl2ZVNwYWNlKSkgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiB0aGlzLm1hdHJpeENsaWVudD8uZ2V0Um9vbSh0aGlzLl9hY3RpdmVTcGFjZSk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBzdWdnZXN0ZWRSb29tcygpOiBJU3VnZ2VzdGVkUm9vbVtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N1Z2dlc3RlZFJvb21zO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgYWxsUm9vbXNJbkhvbWUoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hbGxSb29tc0luSG9tZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0QWN0aXZlUm9vbUluU3BhY2Uoc3BhY2U6IFNwYWNlS2V5KTogdm9pZCB7XG4gICAgICAgIGlmICghaXNNZXRhU3BhY2Uoc3BhY2UpICYmICF0aGlzLm1hdHJpeENsaWVudD8uZ2V0Um9vbShzcGFjZSk/LmlzU3BhY2VSb29tKCkpIHJldHVybjtcbiAgICAgICAgaWYgKHNwYWNlICE9PSB0aGlzLmFjdGl2ZVNwYWNlKSB0aGlzLnNldEFjdGl2ZVNwYWNlKHNwYWNlLCBmYWxzZSk7XG5cbiAgICAgICAgaWYgKHNwYWNlKSB7XG4gICAgICAgICAgICBjb25zdCByb29tSWQgPSB0aGlzLmdldE5vdGlmaWNhdGlvblN0YXRlKHNwYWNlKS5nZXRGaXJzdFJvb21XaXRoTm90aWZpY2F0aW9ucygpO1xuICAgICAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZGlzcGF0Y2g8Vmlld1Jvb21QYXlsb2FkPih7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1Jvb20sXG4gICAgICAgICAgICAgICAgcm9vbV9pZDogcm9vbUlkLFxuICAgICAgICAgICAgICAgIGNvbnRleHRfc3dpdGNoOiB0cnVlLFxuICAgICAgICAgICAgICAgIG1ldHJpY3NUcmlnZ2VyOiBcIldlYlNwYWNlUGFuZWxOb3RpZmljYXRpb25CYWRnZVwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBsaXN0cyA9IFJvb21MaXN0U3RvcmUuaW5zdGFuY2Uub3JkZXJlZExpc3RzO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBUQUdfT1JERVIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0ID0gVEFHX09SREVSW2ldO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxpc3RSb29tcyA9IGxpc3RzW3RdO1xuICAgICAgICAgICAgICAgIGNvbnN0IHVucmVhZFJvb20gPSBsaXN0Um9vbXMuZmluZCgocjogUm9vbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zaG93SW5Ib21lU3BhY2UocikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRlID0gUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUuaW5zdGFuY2UuZ2V0Um9vbVN0YXRlKHIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0YXRlLmlzVW5yZWFkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHVucmVhZFJvb20pIHtcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZGlzcGF0Y2g8Vmlld1Jvb21QYXlsb2FkPih7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5WaWV3Um9vbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb21faWQ6IHVucmVhZFJvb20ucm9vbUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29udGV4dF9zd2l0Y2g6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRyaWNzVHJpZ2dlcjogXCJXZWJTcGFjZVBhbmVsTm90aWZpY2F0aW9uQmFkZ2VcIixcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGFjdGl2ZSBzcGFjZSwgdXBkYXRlcyByb29tIGxpc3QgZmlsdGVycyxcbiAgICAgKiBvcHRpb25hbGx5IHN3aXRjaGVzIHRoZSB1c2VyJ3Mgcm9vbSBiYWNrIHRvIHdoZXJlIHRoZXkgd2VyZSB3aGVuIHRoZXkgbGFzdCB2aWV3ZWQgdGhhdCBzcGFjZS5cbiAgICAgKiBAcGFyYW0gc3BhY2Ugd2hpY2ggc3BhY2UgdG8gc3dpdGNoIHRvLlxuICAgICAqIEBwYXJhbSBjb250ZXh0U3dpdGNoIHdoZXRoZXIgdG8gc3dpdGNoIHRoZSB1c2VyJ3MgY29udGV4dCxcbiAgICAgKiBzaG91bGQgbm90IGJlIGRvbmUgd2hlbiB0aGUgc3BhY2Ugc3dpdGNoIGlzIGRvbmUgaW1wbGljaXRseSBkdWUgdG8gYW5vdGhlciBldmVudCBsaWtlIHN3aXRjaGluZyByb29tLlxuICAgICAqL1xuICAgIHB1YmxpYyBzZXRBY3RpdmVTcGFjZShzcGFjZTogU3BhY2VLZXksIGNvbnRleHRTd2l0Y2ggPSB0cnVlKSB7XG4gICAgICAgIGlmICghc3BhY2UgfHwgIXRoaXMubWF0cml4Q2xpZW50IHx8IHNwYWNlID09PSB0aGlzLmFjdGl2ZVNwYWNlKSByZXR1cm47XG5cbiAgICAgICAgbGV0IGNsaVNwYWNlOiBSb29tO1xuICAgICAgICBpZiAoIWlzTWV0YVNwYWNlKHNwYWNlKSkge1xuICAgICAgICAgICAgY2xpU3BhY2UgPSB0aGlzLm1hdHJpeENsaWVudC5nZXRSb29tKHNwYWNlKTtcbiAgICAgICAgICAgIGlmICghY2xpU3BhY2U/LmlzU3BhY2VSb29tKCkpIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5lbmFibGVkTWV0YVNwYWNlcy5pbmNsdWRlcyhzcGFjZSBhcyBNZXRhU3BhY2UpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oQUNUSVZFX1NQQUNFX0xTX0tFWSwgdGhpcy5fYWN0aXZlU3BhY2UgPSBzcGFjZSk7IC8vIFVwZGF0ZSAmIHBlcnNpc3Qgc2VsZWN0ZWQgc3BhY2VcblxuICAgICAgICBpZiAoY29udGV4dFN3aXRjaCkge1xuICAgICAgICAgICAgLy8gdmlldyBsYXN0IHNlbGVjdGVkIHJvb20gZnJvbSBzcGFjZVxuICAgICAgICAgICAgY29uc3Qgcm9vbUlkID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKGdldFNwYWNlQ29udGV4dEtleShzcGFjZSkpO1xuXG4gICAgICAgICAgICAvLyBpZiB0aGUgc3BhY2UgYmVpbmcgc2VsZWN0ZWQgaXMgYW4gaW52aXRlIHRoZW4gYWx3YXlzIHZpZXcgdGhhdCBpbnZpdGVcbiAgICAgICAgICAgIC8vIGVsc2UgaWYgdGhlIGxhc3Qgdmlld2VkIHJvb20gaW4gdGhpcyBzcGFjZSBpcyBqb2luZWQgdGhlbiB2aWV3IHRoYXRcbiAgICAgICAgICAgIC8vIGVsc2UgdmlldyBzcGFjZSBob21lIG9yIGhvbWUgZGVwZW5kaW5nIG9uIHdoYXQgaXMgYmVpbmcgY2xpY2tlZCBvblxuICAgICAgICAgICAgaWYgKGNsaVNwYWNlPy5nZXRNeU1lbWJlcnNoaXAoKSAhPT0gXCJpbnZpdGVcIiAmJlxuICAgICAgICAgICAgICAgIHRoaXMubWF0cml4Q2xpZW50LmdldFJvb20ocm9vbUlkKT8uZ2V0TXlNZW1iZXJzaGlwKCkgPT09IFwiam9pblwiICYmXG4gICAgICAgICAgICAgICAgdGhpcy5pc1Jvb21JblNwYWNlKHNwYWNlLCByb29tSWQpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci5kaXNwYXRjaDxWaWV3Um9vbVBheWxvYWQ+KHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1Jvb20sXG4gICAgICAgICAgICAgICAgICAgIHJvb21faWQ6IHJvb21JZCxcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dF9zd2l0Y2g6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG1ldHJpY3NUcmlnZ2VyOiBcIldlYlNwYWNlQ29udGV4dFN3aXRjaFwiLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjbGlTcGFjZSkge1xuICAgICAgICAgICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoPFZpZXdSb29tUGF5bG9hZD4oe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5WaWV3Um9vbSxcbiAgICAgICAgICAgICAgICAgICAgcm9vbV9pZDogc3BhY2UsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHRfc3dpdGNoOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBtZXRyaWNzVHJpZ2dlcjogXCJXZWJTcGFjZUNvbnRleHRTd2l0Y2hcIixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZGlzcGF0Y2g8Vmlld0hvbWVQYWdlUGF5bG9hZD4oe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5WaWV3SG9tZVBhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHRfc3dpdGNoOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbWl0KFVQREFURV9TRUxFQ1RFRF9TUEFDRSwgdGhpcy5hY3RpdmVTcGFjZSk7XG4gICAgICAgIHRoaXMuZW1pdChVUERBVEVfU1VHR0VTVEVEX1JPT01TLCB0aGlzLl9zdWdnZXN0ZWRSb29tcyA9IFtdKTtcblxuICAgICAgICBpZiAoY2xpU3BhY2UpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZFN1Z2dlc3RlZFJvb21zKGNsaVNwYWNlKTtcblxuICAgICAgICAgICAgLy8gTG9hZCBhbGwgbWVtYmVycyBmb3IgdGhlIHNlbGVjdGVkIHNwYWNlIGFuZCBpdHMgc3Vic3BhY2VzLFxuICAgICAgICAgICAgLy8gc28gd2UgY2FuIGNvcnJlY3RseSBzaG93IERNcyB3ZSBoYXZlIHdpdGggbWVtYmVycyBvZiB0aGlzIHNwYWNlLlxuICAgICAgICAgICAgU3BhY2VTdG9yZS5pbnN0YW5jZS50cmF2ZXJzZVNwYWNlKHNwYWNlLCByb29tSWQgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMubWF0cml4Q2xpZW50LmdldFJvb20ocm9vbUlkKT8ubG9hZE1lbWJlcnNJZk5lZWRlZCgpO1xuICAgICAgICAgICAgfSwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBsb2FkU3VnZ2VzdGVkUm9vbXMoc3BhY2U6IFJvb20pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3Qgc3VnZ2VzdGVkUm9vbXMgPSBhd2FpdCB0aGlzLmZldGNoU3VnZ2VzdGVkUm9vbXMoc3BhY2UpO1xuICAgICAgICBpZiAodGhpcy5fYWN0aXZlU3BhY2UgPT09IHNwYWNlLnJvb21JZCkge1xuICAgICAgICAgICAgdGhpcy5fc3VnZ2VzdGVkUm9vbXMgPSBzdWdnZXN0ZWRSb29tcztcbiAgICAgICAgICAgIHRoaXMuZW1pdChVUERBVEVfU1VHR0VTVEVEX1JPT01TLCB0aGlzLl9zdWdnZXN0ZWRSb29tcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZmV0Y2hTdWdnZXN0ZWRSb29tcyA9IGFzeW5jIChzcGFjZTogUm9vbSwgbGltaXQgPSBNQVhfU1VHR0VTVEVEX1JPT01TKTogUHJvbWlzZTxJU3VnZ2VzdGVkUm9vbVtdPiA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB7IHJvb21zIH0gPSBhd2FpdCB0aGlzLm1hdHJpeENsaWVudC5nZXRSb29tSGllcmFyY2h5KHNwYWNlLnJvb21JZCwgbGltaXQsIDEsIHRydWUpO1xuXG4gICAgICAgICAgICBjb25zdCB2aWFNYXAgPSBuZXcgRW5oYW5jZWRNYXA8c3RyaW5nLCBTZXQ8c3RyaW5nPj4oKTtcbiAgICAgICAgICAgIHJvb21zLmZvckVhY2gocm9vbSA9PiB7XG4gICAgICAgICAgICAgICAgcm9vbS5jaGlsZHJlbl9zdGF0ZS5mb3JFYWNoKGV2ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2LnR5cGUgPT09IEV2ZW50VHlwZS5TcGFjZUNoaWxkICYmIGV2LmNvbnRlbnQudmlhPy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2LmNvbnRlbnQudmlhLmZvckVhY2godmlhID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWFNYXAuZ2V0T3JDcmVhdGUoZXYuc3RhdGVfa2V5LCBuZXcgU2V0KCkpLmFkZCh2aWEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gcm9vbXMuZmlsdGVyKHJvb21JbmZvID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcm9vbUluZm8ucm9vbV90eXBlICE9PSBSb29tVHlwZS5TcGFjZVxuICAgICAgICAgICAgICAgICAgICAmJiB0aGlzLm1hdHJpeENsaWVudC5nZXRSb29tKHJvb21JbmZvLnJvb21faWQpPy5nZXRNeU1lbWJlcnNoaXAoKSAhPT0gXCJqb2luXCI7XG4gICAgICAgICAgICB9KS5tYXAocm9vbUluZm8gPT4gKHtcbiAgICAgICAgICAgICAgICAuLi5yb29tSW5mbyxcbiAgICAgICAgICAgICAgICB2aWFTZXJ2ZXJzOiBBcnJheS5mcm9tKHZpYU1hcC5nZXQocm9vbUluZm8ucm9vbV9pZCkgfHwgW10pLFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH07XG5cbiAgICBwdWJsaWMgYWRkUm9vbVRvU3BhY2Uoc3BhY2U6IFJvb20sIHJvb21JZDogc3RyaW5nLCB2aWE6IHN0cmluZ1tdLCBzdWdnZXN0ZWQgPSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXRyaXhDbGllbnQuc2VuZFN0YXRlRXZlbnQoc3BhY2Uucm9vbUlkLCBFdmVudFR5cGUuU3BhY2VDaGlsZCwge1xuICAgICAgICAgICAgdmlhLFxuICAgICAgICAgICAgc3VnZ2VzdGVkLFxuICAgICAgICB9LCByb29tSWQpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRDaGlsZHJlbihzcGFjZUlkOiBzdHJpbmcpOiBSb29tW10ge1xuICAgICAgICBjb25zdCByb29tID0gdGhpcy5tYXRyaXhDbGllbnQ/LmdldFJvb20oc3BhY2VJZCk7XG4gICAgICAgIGNvbnN0IGNoaWxkRXZlbnRzID0gcm9vbT8uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKEV2ZW50VHlwZS5TcGFjZUNoaWxkKS5maWx0ZXIoZXYgPT4gZXYuZ2V0Q29udGVudCgpPy52aWEpO1xuICAgICAgICByZXR1cm4gc29ydEJ5KGNoaWxkRXZlbnRzLCBldiA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0Q2hpbGRPcmRlcihldi5nZXRDb250ZW50KCkub3JkZXIsIGV2LmdldFRzKCksIGV2LmdldFN0YXRlS2V5KCkpO1xuICAgICAgICB9KS5tYXAoZXYgPT4ge1xuICAgICAgICAgICAgY29uc3QgaGlzdG9yeSA9IHRoaXMubWF0cml4Q2xpZW50LmdldFJvb21VcGdyYWRlSGlzdG9yeShldi5nZXRTdGF0ZUtleSgpLCB0cnVlKTtcbiAgICAgICAgICAgIHJldHVybiBoaXN0b3J5W2hpc3RvcnkubGVuZ3RoIC0gMV07XG4gICAgICAgIH0pLmZpbHRlcihyb29tID0+IHtcbiAgICAgICAgICAgIHJldHVybiByb29tPy5nZXRNeU1lbWJlcnNoaXAoKSA9PT0gXCJqb2luXCIgfHwgcm9vbT8uZ2V0TXlNZW1iZXJzaGlwKCkgPT09IFwiaW52aXRlXCI7XG4gICAgICAgIH0pIHx8IFtdO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRDaGlsZFJvb21zKHNwYWNlSWQ6IHN0cmluZyk6IFJvb21bXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldENoaWxkcmVuKHNwYWNlSWQpLmZpbHRlcihyID0+ICFyLmlzU3BhY2VSb29tKCkpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRDaGlsZFNwYWNlcyhzcGFjZUlkOiBzdHJpbmcpOiBSb29tW10ge1xuICAgICAgICAvLyBkb24ndCBzaG93IGludml0ZWQgc3Vic3BhY2VzIGFzIHRoZXkgc3VyZmFjZSBhdCB0aGUgdG9wIGxldmVsIGZvciBiZXR0ZXIgdmlzaWJpbGl0eVxuICAgICAgICByZXR1cm4gdGhpcy5nZXRDaGlsZHJlbihzcGFjZUlkKS5maWx0ZXIociA9PiByLmlzU3BhY2VSb29tKCkgJiYgci5nZXRNeU1lbWJlcnNoaXAoKSA9PT0gXCJqb2luXCIpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRQYXJlbnRzKHJvb21JZDogc3RyaW5nLCBjYW5vbmljYWxPbmx5ID0gZmFsc2UpOiBSb29tW10ge1xuICAgICAgICBjb25zdCB1c2VySWQgPSB0aGlzLm1hdHJpeENsaWVudD8uZ2V0VXNlcklkKCk7XG4gICAgICAgIGNvbnN0IHJvb20gPSB0aGlzLm1hdHJpeENsaWVudD8uZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICByZXR1cm4gcm9vbT8uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKEV2ZW50VHlwZS5TcGFjZVBhcmVudClcbiAgICAgICAgICAgIC5tYXAoZXYgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBldi5nZXRDb250ZW50KCk7XG4gICAgICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGNvbnRlbnQudmlhKSB8fCAoY2Fub25pY2FsT25seSAmJiAhY29udGVudC5jYW5vbmljYWwpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjsgLy8gc2tpcFxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIG9ubHkgcmVzcGVjdCB0aGUgcmVsYXRpb25zaGlwIGlmIHRoZSBzZW5kZXIgaGFzIHN1ZmZpY2llbnQgcGVybWlzc2lvbnMgaW4gdGhlIHBhcmVudCB0byBzZXRcbiAgICAgICAgICAgICAgICAvLyBjaGlsZCByZWxhdGlvbnMsIGFzIHBlciBNU0MxNzcyLlxuICAgICAgICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRyaXgtb3JnL21hdHJpeC1kb2MvYmxvYi9tYWluL3Byb3Bvc2Fscy8xNzcyLWdyb3Vwcy1hcy1yb29tcy5tZCNyZWxhdGlvbnNoaXAtYmV0d2Vlbi1yb29tcy1hbmQtc3BhY2VzXG4gICAgICAgICAgICAgICAgY29uc3QgcGFyZW50ID0gdGhpcy5tYXRyaXhDbGllbnQuZ2V0Um9vbShldi5nZXRTdGF0ZUtleSgpKTtcbiAgICAgICAgICAgICAgICBjb25zdCByZWxhdGlvbiA9IHBhcmVudD8uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKEV2ZW50VHlwZS5TcGFjZUNoaWxkLCByb29tSWQpO1xuICAgICAgICAgICAgICAgIGlmICghcGFyZW50Py5jdXJyZW50U3RhdGUubWF5U2VuZFN0YXRlRXZlbnQoRXZlbnRUeXBlLlNwYWNlQ2hpbGQsIHVzZXJJZCkgfHxcbiAgICAgICAgICAgICAgICAgICAgLy8gYWxzbyBza2lwIHRoaXMgcmVsYXRpb24gaWYgdGhlIHBhcmVudCBoYWQgdGhpcyBjaGlsZCBhZGRlZCBidXQgdGhlbiBzaW5jZSByZW1vdmVkIGl0XG4gICAgICAgICAgICAgICAgICAgIChyZWxhdGlvbiAmJiAhQXJyYXkuaXNBcnJheShyZWxhdGlvbi5nZXRDb250ZW50KCkudmlhKSlcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuOyAvLyBza2lwXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcmVudDtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuZmlsdGVyKEJvb2xlYW4pIHx8IFtdO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRDYW5vbmljYWxQYXJlbnQocm9vbUlkOiBzdHJpbmcpOiBSb29tIHwgbnVsbCB7XG4gICAgICAgIGNvbnN0IHBhcmVudHMgPSB0aGlzLmdldFBhcmVudHMocm9vbUlkLCB0cnVlKTtcbiAgICAgICAgcmV0dXJuIHNvcnRCeShwYXJlbnRzLCByID0+IHIucm9vbUlkKT8uWzBdIHx8IG51bGw7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEtub3duUGFyZW50cyhyb29tSWQ6IHN0cmluZywgaW5jbHVkZUFuY2VzdG9ycz86IGJvb2xlYW4pOiBTZXQ8c3RyaW5nPiB7XG4gICAgICAgIGlmIChpbmNsdWRlQW5jZXN0b3JzKSB7XG4gICAgICAgICAgICByZXR1cm4gZmxhdHRlblNwYWNlSGllcmFyY2h5KHRoaXMucGFyZW50TWFwLCB0aGlzLnBhcmVudE1hcCwgcm9vbUlkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5wYXJlbnRNYXAuZ2V0KHJvb21JZCkgfHwgbmV3IFNldCgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBpc1Jvb21JblNwYWNlKHNwYWNlOiBTcGFjZUtleSwgcm9vbUlkOiBzdHJpbmcsIGluY2x1ZGVEZXNjZW5kYW50U3BhY2VzID0gdHJ1ZSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoc3BhY2UgPT09IE1ldGFTcGFjZS5Ib21lICYmIHRoaXMuYWxsUm9vbXNJbkhvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuZ2V0U3BhY2VGaWx0ZXJlZFJvb21JZHMoc3BhY2UsIGluY2x1ZGVEZXNjZW5kYW50U3BhY2VzKT8uaGFzKHJvb21JZCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZG1QYXJ0bmVyID0gRE1Sb29tTWFwLnNoYXJlZCgpLmdldFVzZXJJZEZvclJvb21JZChyb29tSWQpO1xuICAgICAgICBpZiAoIWRtUGFydG5lcikge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIC8vIGJleW9uZCB0aGlzIHBvaW50IHdlIGtub3cgdGhpcyBpcyBhIERNXG5cbiAgICAgICAgaWYgKHNwYWNlID09PSBNZXRhU3BhY2UuSG9tZSB8fCBzcGFjZSA9PT0gTWV0YVNwYWNlLlBlb3BsZSkge1xuICAgICAgICAgICAgLy8gdGhlc2Ugc3BhY2VzIGNvbnRhaW4gYWxsIERNc1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWlzTWV0YVNwYWNlKHNwYWNlKSAmJlxuICAgICAgICAgICAgdGhpcy5nZXRTcGFjZUZpbHRlcmVkVXNlcklkcyhzcGFjZSwgaW5jbHVkZURlc2NlbmRhbnRTcGFjZXMpPy5oYXMoZG1QYXJ0bmVyKSAmJlxuICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcIlNwYWNlcy5zaG93UGVvcGxlSW5TcGFjZVwiLCBzcGFjZSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBnZXQgYWxsIHJvb21zIGluIGEgc3BhY2VcbiAgICAvLyBpbmNsdWRpbmcgZGVzY2VuZGFudCBzcGFjZXNcbiAgICBwdWJsaWMgZ2V0U3BhY2VGaWx0ZXJlZFJvb21JZHMgPSAoXG4gICAgICAgIHNwYWNlOiBTcGFjZUtleSwgaW5jbHVkZURlc2NlbmRhbnRTcGFjZXMgPSB0cnVlLCB1c2VDYWNoZSA9IHRydWUsXG4gICAgKTogU2V0PHN0cmluZz4gPT4ge1xuICAgICAgICBpZiAoc3BhY2UgPT09IE1ldGFTcGFjZS5Ib21lICYmIHRoaXMuYWxsUm9vbXNJbkhvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgU2V0KHRoaXMubWF0cml4Q2xpZW50LmdldFZpc2libGVSb29tcygpLm1hcChyID0+IHIucm9vbUlkKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBtZXRhIHNwYWNlcyBuZXZlciBoYXZlIGRlc2NlbmRhbnRzXG4gICAgICAgIC8vIGFuZCB0aGUgYWdncmVnYXRlIGNhY2hlIGlzIG5vdCBtYW5hZ2VkIGZvciBtZXRhIHNwYWNlc1xuICAgICAgICBpZiAoIWluY2x1ZGVEZXNjZW5kYW50U3BhY2VzIHx8IGlzTWV0YVNwYWNlKHNwYWNlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucm9vbUlkc0J5U3BhY2UuZ2V0KHNwYWNlKSB8fCBuZXcgU2V0KCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5nZXRBZ2dyZWdhdGVkUm9vbUlkc0J5U3BhY2UodGhpcy5yb29tSWRzQnlTcGFjZSwgdGhpcy5jaGlsZFNwYWNlc0J5U3BhY2UsIHNwYWNlLCB1c2VDYWNoZSk7XG4gICAgfTtcblxuICAgIHB1YmxpYyBnZXRTcGFjZUZpbHRlcmVkVXNlcklkcyA9IChcbiAgICAgICAgc3BhY2U6IFNwYWNlS2V5LCBpbmNsdWRlRGVzY2VuZGFudFNwYWNlcyA9IHRydWUsIHVzZUNhY2hlID0gdHJ1ZSxcbiAgICApOiBTZXQ8c3RyaW5nPiA9PiB7XG4gICAgICAgIGlmIChzcGFjZSA9PT0gTWV0YVNwYWNlLkhvbWUgJiYgdGhpcy5hbGxSb29tc0luSG9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNNZXRhU3BhY2Uoc3BhY2UpKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbWV0YSBzcGFjZXMgbmV2ZXIgaGF2ZSBkZXNjZW5kYW50c1xuICAgICAgICAvLyBhbmQgdGhlIGFnZ3JlZ2F0ZSBjYWNoZSBpcyBub3QgbWFuYWdlZCBmb3IgbWV0YSBzcGFjZXNcbiAgICAgICAgaWYgKCFpbmNsdWRlRGVzY2VuZGFudFNwYWNlcyB8fCBpc01ldGFTcGFjZShzcGFjZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnVzZXJJZHNCeVNwYWNlLmdldChzcGFjZSkgfHwgbmV3IFNldCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QWdncmVnYXRlZFVzZXJJZHNCeVNwYWNlKHRoaXMudXNlcklkc0J5U3BhY2UsIHRoaXMuY2hpbGRTcGFjZXNCeVNwYWNlLCBzcGFjZSwgdXNlQ2FjaGUpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGdldEFnZ3JlZ2F0ZWRSb29tSWRzQnlTcGFjZSA9IGZsYXR0ZW5TcGFjZUhpZXJhcmNoeVdpdGhDYWNoZSh0aGlzLl9hZ2dyZWdhdGVkU3BhY2VDYWNoZS5yb29tSWRzQnlTcGFjZSk7XG4gICAgcHJpdmF0ZSBnZXRBZ2dyZWdhdGVkVXNlcklkc0J5U3BhY2UgPSBmbGF0dGVuU3BhY2VIaWVyYXJjaHlXaXRoQ2FjaGUodGhpcy5fYWdncmVnYXRlZFNwYWNlQ2FjaGUudXNlcklkc0J5U3BhY2UpO1xuXG4gICAgcHJpdmF0ZSBtYXJrVHJlZUNoaWxkcmVuID0gKHJvb3RTcGFjZTogUm9vbSwgdW5zZWVuOiBTZXQ8Um9vbT4pOiB2b2lkID0+IHtcbiAgICAgICAgY29uc3Qgc3RhY2sgPSBbcm9vdFNwYWNlXTtcbiAgICAgICAgd2hpbGUgKHN0YWNrLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3Qgc3BhY2UgPSBzdGFjay5wb3AoKTtcbiAgICAgICAgICAgIHVuc2Vlbi5kZWxldGUoc3BhY2UpO1xuICAgICAgICAgICAgdGhpcy5nZXRDaGlsZFNwYWNlcyhzcGFjZS5yb29tSWQpLmZvckVhY2goc3BhY2UgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh1bnNlZW4uaGFzKHNwYWNlKSkge1xuICAgICAgICAgICAgICAgICAgICBzdGFjay5wdXNoKHNwYWNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIGZpbmRSb290U3BhY2VzID0gKGpvaW5lZFNwYWNlczogUm9vbVtdKTogUm9vbVtdID0+IHtcbiAgICAgICAgLy8gZXhjbHVkZSBpbnZpdGVkIHNwYWNlcyBmcm9tIHVuc2VlbkNoaWxkcmVuIGFzIHRoZXkgd2lsbCBiZSBmb3JjaWJseSBzaG93biBhdCB0aGUgdG9wIGxldmVsIG9mIHRoZSB0cmVldmlld1xuICAgICAgICBjb25zdCB1bnNlZW5TcGFjZXMgPSBuZXcgU2V0KGpvaW5lZFNwYWNlcyk7XG5cbiAgICAgICAgam9pbmVkU3BhY2VzLmZvckVhY2goc3BhY2UgPT4ge1xuICAgICAgICAgICAgdGhpcy5nZXRDaGlsZFNwYWNlcyhzcGFjZS5yb29tSWQpLmZvckVhY2goc3Vic3BhY2UgPT4ge1xuICAgICAgICAgICAgICAgIHVuc2VlblNwYWNlcy5kZWxldGUoc3Vic3BhY2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIENvbnNpZGVyIGFueSBzcGFjZXMgcmVtYWluaW5nIGluIHVuc2VlblNwYWNlcyBhcyByb290LFxuICAgICAgICAvLyBnaXZlbiB0aGV5IGFyZSBub3QgY2hpbGRyZW4gb2YgYW55IGtub3duIHNwYWNlcy5cbiAgICAgICAgLy8gVGhlIGhpZXJhcmNoeSBmcm9tIHRoZXNlIHJvb3RzIG1heSBub3QgeWV0IGJlIGV4aGF1c3RpdmUgZHVlIHRvIHRoZSBwb3NzaWJpbGl0eSBvZiBmdWxsLWN5Y2xlcy5cbiAgICAgICAgY29uc3Qgcm9vdFNwYWNlcyA9IEFycmF5LmZyb20odW5zZWVuU3BhY2VzKTtcblxuICAgICAgICAvLyBOZXh0IHdlIG5lZWQgdG8gZGV0ZXJtaW5lIHRoZSByb290cyBvZiBhbnkgcmVtYWluaW5nIGZ1bGwtY3ljbGVzLlxuICAgICAgICAvLyBXZSBzb3J0IHNwYWNlcyBieSByb29tIElEIHRvIGZvcmNlIHRoZSBjeWNsZSBicmVha2luZyB0byBiZSBkZXRlcm1pbmlzdGljLlxuICAgICAgICBjb25zdCBkZXRhY2hlZE5vZGVzID0gbmV3IFNldDxSb29tPihzb3J0Qnkoam9pbmVkU3BhY2VzLCBzcGFjZSA9PiBzcGFjZS5yb29tSWQpKTtcblxuICAgICAgICAvLyBNYXJrIGFueSBub2RlcyB3aGljaCBhcmUgY2hpbGRyZW4gb2Ygb3VyIGV4aXN0aW5nIHJvb3Qgc3BhY2VzIGFzIGF0dGFjaGVkLlxuICAgICAgICByb290U3BhY2VzLmZvckVhY2gocm9vdFNwYWNlID0+IHtcbiAgICAgICAgICAgIHRoaXMubWFya1RyZWVDaGlsZHJlbihyb290U3BhY2UsIGRldGFjaGVkTm9kZXMpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBIYW5kbGUgc3BhY2VzIGZvcm1pbmcgZnVsbHkgY3ljbGljYWwgcmVsYXRpb25zaGlwcy5cbiAgICAgICAgLy8gSW4gb3JkZXIsIGFzc3VtZSBlYWNoIHJlbWFpbmluZyBkZXRhY2hlZE5vZGUgaXMgYSByb290IHVubGVzcyBpdCBoYXMgYWxyZWFkeVxuICAgICAgICAvLyBiZWVuIGNsYWltZWQgYXMgdGhlIGNoaWxkIG9mIHByaW9yIGRldGFjaGVkIG5vZGUuXG4gICAgICAgIC8vIFdvcmsgZnJvbSBhIGNvcHkgb2YgdGhlIGRldGFjaGVkTm9kZXMgc2V0IGFzIGl0IHdpbGwgYmUgbXV0YXRlZCBhcyBwYXJ0IG9mIHRoaXMgb3BlcmF0aW9uLlxuICAgICAgICAvLyBUT0RPIGNvbnNpZGVyIHNvcnRpbmcgYnkgbnVtYmVyIG9mIGluLXJlZnMgdG8gZmF2b3VyIG5vZGVzIHdpdGggZmV3ZXIgcGFyZW50cy5cbiAgICAgICAgQXJyYXkuZnJvbShkZXRhY2hlZE5vZGVzKS5mb3JFYWNoKGRldGFjaGVkTm9kZSA9PiB7XG4gICAgICAgICAgICBpZiAoIWRldGFjaGVkTm9kZXMuaGFzKGRldGFjaGVkTm9kZSkpIHJldHVybjsgLy8gYWxyZWFkeSBjbGFpbWVkLCBza2lwXG4gICAgICAgICAgICAvLyBkZWNsYXJlIHRoaXMgZGV0YWNoZWQgbm9kZSBhIG5ldyByb290LCBmaW5kIGl0cyBjaGlsZHJlbiwgd2l0aG91dCBldmVyIGxvb3BpbmcgYmFjayB0byBpdFxuICAgICAgICAgICAgcm9vdFNwYWNlcy5wdXNoKGRldGFjaGVkTm9kZSk7IC8vIGNvbnNpZGVyIHRoaXMgbm9kZSBhIG5ldyByb290IHNwYWNlXG4gICAgICAgICAgICB0aGlzLm1hcmtUcmVlQ2hpbGRyZW4oZGV0YWNoZWROb2RlLCBkZXRhY2hlZE5vZGVzKTsgLy8gZGVjbGFyZSB0aGlzIG5vZGUgYW5kIGl0cyBjaGlsZHJlbiBhdHRhY2hlZFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcm9vdFNwYWNlcztcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSByZWJ1aWxkU3BhY2VIaWVyYXJjaHkgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHZpc2libGVTcGFjZXMgPSB0aGlzLm1hdHJpeENsaWVudC5nZXRWaXNpYmxlUm9vbXMoKS5maWx0ZXIociA9PiByLmlzU3BhY2VSb29tKCkpO1xuICAgICAgICBjb25zdCBbam9pbmVkU3BhY2VzLCBpbnZpdGVkU3BhY2VzXSA9IHZpc2libGVTcGFjZXMucmVkdWNlKChbam9pbmVkLCBpbnZpdGVkXSwgcykgPT4ge1xuICAgICAgICAgICAgc3dpdGNoIChnZXRFZmZlY3RpdmVNZW1iZXJzaGlwKHMuZ2V0TXlNZW1iZXJzaGlwKCkpKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBFZmZlY3RpdmVNZW1iZXJzaGlwLkpvaW46XG4gICAgICAgICAgICAgICAgICAgIGpvaW5lZC5wdXNoKHMpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIEVmZmVjdGl2ZU1lbWJlcnNoaXAuSW52aXRlOlxuICAgICAgICAgICAgICAgICAgICBpbnZpdGVkLnB1c2gocyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIFtqb2luZWQsIGludml0ZWRdO1xuICAgICAgICB9LCBbW10sIFtdXSBhcyBbUm9vbVtdLCBSb29tW11dKTtcblxuICAgICAgICBjb25zdCByb290U3BhY2VzID0gdGhpcy5maW5kUm9vdFNwYWNlcyhqb2luZWRTcGFjZXMpO1xuICAgICAgICBjb25zdCBvbGRSb290U3BhY2VzID0gdGhpcy5yb290U3BhY2VzO1xuICAgICAgICB0aGlzLnJvb3RTcGFjZXMgPSB0aGlzLnNvcnRSb290U3BhY2VzKHJvb3RTcGFjZXMpO1xuXG4gICAgICAgIHRoaXMub25Sb29tc1VwZGF0ZSgpO1xuXG4gICAgICAgIGlmIChhcnJheUhhc09yZGVyQ2hhbmdlKG9sZFJvb3RTcGFjZXMsIHRoaXMucm9vdFNwYWNlcykpIHtcbiAgICAgICAgICAgIHRoaXMuZW1pdChVUERBVEVfVE9QX0xFVkVMX1NQQUNFUywgdGhpcy5zcGFjZVBhbmVsU3BhY2VzLCB0aGlzLmVuYWJsZWRNZXRhU3BhY2VzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG9sZEludml0ZWRTcGFjZXMgPSB0aGlzLl9pbnZpdGVkU3BhY2VzO1xuICAgICAgICB0aGlzLl9pbnZpdGVkU3BhY2VzID0gbmV3IFNldCh0aGlzLnNvcnRSb290U3BhY2VzKGludml0ZWRTcGFjZXMpKTtcbiAgICAgICAgaWYgKHNldEhhc0RpZmYob2xkSW52aXRlZFNwYWNlcywgdGhpcy5faW52aXRlZFNwYWNlcykpIHtcbiAgICAgICAgICAgIHRoaXMuZW1pdChVUERBVEVfSU5WSVRFRF9TUEFDRVMsIHRoaXMuaW52aXRlZFNwYWNlcyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSByZWJ1aWxkUGFyZW50TWFwID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBqb2luZWRTcGFjZXMgPSB0aGlzLm1hdHJpeENsaWVudC5nZXRWaXNpYmxlUm9vbXMoKS5maWx0ZXIociA9PiB7XG4gICAgICAgICAgICByZXR1cm4gci5pc1NwYWNlUm9vbSgpICYmIHIuZ2V0TXlNZW1iZXJzaGlwKCkgPT09IFwiam9pblwiO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnBhcmVudE1hcCA9IG5ldyBFbmhhbmNlZE1hcDxzdHJpbmcsIFNldDxzdHJpbmc+PigpO1xuICAgICAgICBqb2luZWRTcGFjZXMuZm9yRWFjaChzcGFjZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuZ2V0Q2hpbGRyZW4oc3BhY2Uucm9vbUlkKTtcbiAgICAgICAgICAgIGNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50TWFwLmdldE9yQ3JlYXRlKGNoaWxkLnJvb21JZCwgbmV3IFNldCgpKS5hZGQoc3BhY2Uucm9vbUlkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBQb3N0aG9nQW5hbHl0aWNzLmluc3RhbmNlLnNldFByb3BlcnR5KFwibnVtU3BhY2VzXCIsIGpvaW5lZFNwYWNlcy5sZW5ndGgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHJlYnVpbGRIb21lU3BhY2UgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmFsbFJvb21zSW5Ib21lKSB7XG4gICAgICAgICAgICAvLyB0aGlzIGlzIGEgc3BlY2lhbC1jYXNlIHRvIG5vdCBoYXZlIHRvIG1haW50YWluIGEgc2V0IG9mIGFsbCByb29tc1xuICAgICAgICAgICAgdGhpcy5yb29tSWRzQnlTcGFjZS5kZWxldGUoTWV0YVNwYWNlLkhvbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgcm9vbXMgPSBuZXcgU2V0KHRoaXMubWF0cml4Q2xpZW50LmdldFZpc2libGVSb29tcygpLmZpbHRlcih0aGlzLnNob3dJbkhvbWVTcGFjZSkubWFwKHIgPT4gci5yb29tSWQpKTtcbiAgICAgICAgICAgIHRoaXMucm9vbUlkc0J5U3BhY2Uuc2V0KE1ldGFTcGFjZS5Ib21lLCByb29tcyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5hY3RpdmVTcGFjZSA9PT0gTWV0YVNwYWNlLkhvbWUpIHtcbiAgICAgICAgICAgIHRoaXMuc3dpdGNoU3BhY2VJZk5lZWRlZCgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgcmVidWlsZE1ldGFTcGFjZXMgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGVuYWJsZWRNZXRhU3BhY2VzID0gbmV3IFNldCh0aGlzLmVuYWJsZWRNZXRhU3BhY2VzKTtcbiAgICAgICAgY29uc3QgdmlzaWJsZVJvb21zID0gdGhpcy5tYXRyaXhDbGllbnQuZ2V0VmlzaWJsZVJvb21zKCk7XG5cbiAgICAgICAgaWYgKGVuYWJsZWRNZXRhU3BhY2VzLmhhcyhNZXRhU3BhY2UuSG9tZSkpIHtcbiAgICAgICAgICAgIHRoaXMucmVidWlsZEhvbWVTcGFjZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yb29tSWRzQnlTcGFjZS5kZWxldGUoTWV0YVNwYWNlLkhvbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVuYWJsZWRNZXRhU3BhY2VzLmhhcyhNZXRhU3BhY2UuRmF2b3VyaXRlcykpIHtcbiAgICAgICAgICAgIGNvbnN0IGZhdm91cml0ZXMgPSB2aXNpYmxlUm9vbXMuZmlsdGVyKHIgPT4gci50YWdzW0RlZmF1bHRUYWdJRC5GYXZvdXJpdGVdKTtcbiAgICAgICAgICAgIHRoaXMucm9vbUlkc0J5U3BhY2Uuc2V0KE1ldGFTcGFjZS5GYXZvdXJpdGVzLCBuZXcgU2V0KGZhdm91cml0ZXMubWFwKHIgPT4gci5yb29tSWQpKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJvb21JZHNCeVNwYWNlLmRlbGV0ZShNZXRhU3BhY2UuRmF2b3VyaXRlcyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgUGVvcGxlIG1ldGFzcGFjZSBkb2Vzbid0IG5lZWQgbWFpbnRhaW5pbmdcblxuICAgICAgICAvLyBQb3B1bGF0ZSB0aGUgb3JwaGFucyBzcGFjZSBpZiB0aGUgSG9tZSBzcGFjZSBpcyBlbmFibGVkIGFzIGl0IGlzIGEgc3VwZXJzZXQgb2YgaXQuXG4gICAgICAgIC8vIEhvbWUgaXMgZWZmZWN0aXZlbHkgYSBzdXBlciBzZXQgb2YgUGVvcGxlICsgT3JwaGFucyB3aXRoIHRoZSBhZGRpdGlvbiBvZiBoYXZpbmcgYWxsIGludml0ZXMgdG9vLlxuICAgICAgICBpZiAoZW5hYmxlZE1ldGFTcGFjZXMuaGFzKE1ldGFTcGFjZS5PcnBoYW5zKSB8fCBlbmFibGVkTWV0YVNwYWNlcy5oYXMoTWV0YVNwYWNlLkhvbWUpKSB7XG4gICAgICAgICAgICBjb25zdCBvcnBoYW5zID0gdmlzaWJsZVJvb21zLmZpbHRlcihyID0+IHtcbiAgICAgICAgICAgICAgICAvLyBmaWx0ZXIgb3V0IERNcyBhbmQgcm9vbXMgd2l0aCA+MCBwYXJlbnRzXG4gICAgICAgICAgICAgICAgcmV0dXJuICF0aGlzLnBhcmVudE1hcC5nZXQoci5yb29tSWQpPy5zaXplICYmICFETVJvb21NYXAuc2hhcmVkKCkuZ2V0VXNlcklkRm9yUm9vbUlkKHIucm9vbUlkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5yb29tSWRzQnlTcGFjZS5zZXQoTWV0YVNwYWNlLk9ycGhhbnMsIG5ldyBTZXQob3JwaGFucy5tYXAociA9PiByLnJvb21JZCkpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc01ldGFTcGFjZSh0aGlzLmFjdGl2ZVNwYWNlKSkge1xuICAgICAgICAgICAgdGhpcy5zd2l0Y2hTcGFjZUlmTmVlZGVkKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSB1cGRhdGVOb3RpZmljYXRpb25TdGF0ZXMgPSAoc3BhY2VzPzogU3BhY2VLZXlbXSkgPT4ge1xuICAgICAgICBjb25zdCBlbmFibGVkTWV0YVNwYWNlcyA9IG5ldyBTZXQodGhpcy5lbmFibGVkTWV0YVNwYWNlcyk7XG4gICAgICAgIGNvbnN0IHZpc2libGVSb29tcyA9IHRoaXMubWF0cml4Q2xpZW50LmdldFZpc2libGVSb29tcygpO1xuXG4gICAgICAgIGxldCBkbUJhZGdlU3BhY2U6IE1ldGFTcGFjZTtcbiAgICAgICAgLy8gb25seSBzaG93IGJhZGdlcyBvbiBkbXMgb24gdGhlIG1vc3QgcmVsZXZhbnQgc3BhY2UgaWYgc3VjaCBleGlzdHNcbiAgICAgICAgaWYgKGVuYWJsZWRNZXRhU3BhY2VzLmhhcyhNZXRhU3BhY2UuUGVvcGxlKSkge1xuICAgICAgICAgICAgZG1CYWRnZVNwYWNlID0gTWV0YVNwYWNlLlBlb3BsZTtcbiAgICAgICAgfSBlbHNlIGlmIChlbmFibGVkTWV0YVNwYWNlcy5oYXMoTWV0YVNwYWNlLkhvbWUpKSB7XG4gICAgICAgICAgICBkbUJhZGdlU3BhY2UgPSBNZXRhU3BhY2UuSG9tZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghc3BhY2VzKSB7XG4gICAgICAgICAgICBzcGFjZXMgPSBbLi4udGhpcy5yb29tSWRzQnlTcGFjZS5rZXlzKCldO1xuICAgICAgICAgICAgaWYgKGRtQmFkZ2VTcGFjZSA9PT0gTWV0YVNwYWNlLlBlb3BsZSkge1xuICAgICAgICAgICAgICAgIHNwYWNlcy5wdXNoKE1ldGFTcGFjZS5QZW9wbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGVuYWJsZWRNZXRhU3BhY2VzLmhhcyhNZXRhU3BhY2UuSG9tZSkgJiYgIXRoaXMuYWxsUm9vbXNJbkhvbWUpIHtcbiAgICAgICAgICAgICAgICBzcGFjZXMucHVzaChNZXRhU3BhY2UuSG9tZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzcGFjZXMuZm9yRWFjaCgocykgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuYWxsUm9vbXNJbkhvbWUgJiYgcyA9PT0gTWV0YVNwYWNlLkhvbWUpIHJldHVybjsgLy8gd2UnbGwgYmUgdXNpbmcgdGhlIGdsb2JhbCBub3RpZmljYXRpb24gc3RhdGUsIHNraXBcblxuICAgICAgICAgICAgY29uc3QgZmxhdHRlbmVkUm9vbXNGb3JTcGFjZSA9IHRoaXMuZ2V0U3BhY2VGaWx0ZXJlZFJvb21JZHMocywgdHJ1ZSk7XG5cbiAgICAgICAgICAgIC8vIFVwZGF0ZSBOb3RpZmljYXRpb25TdGF0ZXNcbiAgICAgICAgICAgIHRoaXMuZ2V0Tm90aWZpY2F0aW9uU3RhdGUocykuc2V0Um9vbXModmlzaWJsZVJvb21zLmZpbHRlcihyb29tID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocyA9PT0gTWV0YVNwYWNlLlBlb3BsZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5pc1Jvb21JblNwYWNlKE1ldGFTcGFjZS5QZW9wbGUsIHJvb20ucm9vbUlkKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAocm9vbS5pc1NwYWNlUm9vbSgpIHx8ICFmbGF0dGVuZWRSb29tc0ZvclNwYWNlLmhhcyhyb29tLnJvb21JZCkpIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgICAgIGlmIChkbUJhZGdlU3BhY2UgJiYgRE1Sb29tTWFwLnNoYXJlZCgpLmdldFVzZXJJZEZvclJvb21JZChyb29tLnJvb21JZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHMgPT09IGRtQmFkZ2VTcGFjZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGRtQmFkZ2VTcGFjZSAhPT0gTWV0YVNwYWNlLlBlb3BsZSkge1xuICAgICAgICAgICAgdGhpcy5ub3RpZmljYXRpb25TdGF0ZU1hcC5kZWxldGUoTWV0YVNwYWNlLlBlb3BsZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBzaG93SW5Ib21lU3BhY2UgPSAocm9vbTogUm9vbSk6IGJvb2xlYW4gPT4ge1xuICAgICAgICBpZiAodGhpcy5hbGxSb29tc0luSG9tZSkgcmV0dXJuIHRydWU7XG4gICAgICAgIGlmIChyb29tLmlzU3BhY2VSb29tKCkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuICF0aGlzLnBhcmVudE1hcC5nZXQocm9vbS5yb29tSWQpPy5zaXplIC8vIHB1dCBhbGwgb3JwaGFuZWQgcm9vbXMgaW4gdGhlIEhvbWUgU3BhY2VcbiAgICAgICAgICAgIHx8ICEhRE1Sb29tTWFwLnNoYXJlZCgpLmdldFVzZXJJZEZvclJvb21JZChyb29tLnJvb21JZCkgfHwgLy8gcHV0IGFsbCBETXMgaW4gdGhlIEhvbWUgU3BhY2VcbiAgICAgICAgICAgIHJvb20uZ2V0TXlNZW1iZXJzaGlwKCkgPT09IFwiaW52aXRlXCI7IC8vIHB1dCBhbGwgaW52aXRlcyBpbiB0aGUgSG9tZSBTcGFjZVxuICAgIH07XG5cbiAgICBwcml2YXRlIHN0YXRpYyBpc0luU3BhY2UobWVtYmVyOiBSb29tTWVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBtZW1iZXIubWVtYmVyc2hpcCA9PT0gXCJqb2luXCIgfHwgbWVtYmVyLm1lbWJlcnNoaXAgPT09IFwiaW52aXRlXCI7XG4gICAgfVxuXG4gICAgLy8gTWV0aG9kIGZvciByZXNvbHZpbmcgdGhlIGltcGFjdCBvZiBhIHNpbmdsZSB1c2VyJ3MgbWVtYmVyc2hpcCBjaGFuZ2UgaW4gdGhlIGdpdmVuIFNwYWNlIGFuZCBpdHMgaGllcmFyY2h5XG4gICAgcHJpdmF0ZSBvbk1lbWJlclVwZGF0ZSA9IChzcGFjZTogUm9vbSwgdXNlcklkOiBzdHJpbmcpID0+IHtcbiAgICAgICAgY29uc3QgaW5TcGFjZSA9IFNwYWNlU3RvcmVDbGFzcy5pc0luU3BhY2Uoc3BhY2UuZ2V0TWVtYmVyKHVzZXJJZCkpO1xuXG4gICAgICAgIGlmIChpblNwYWNlKSB7XG4gICAgICAgICAgICB0aGlzLnVzZXJJZHNCeVNwYWNlLmdldChzcGFjZS5yb29tSWQpPy5hZGQodXNlcklkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudXNlcklkc0J5U3BhY2UuZ2V0KHNwYWNlLnJvb21JZCk/LmRlbGV0ZSh1c2VySWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYnVzdCBjYWNoZVxuICAgICAgICB0aGlzLl9hZ2dyZWdhdGVkU3BhY2VDYWNoZS51c2VySWRzQnlTcGFjZS5jbGVhcigpO1xuXG4gICAgICAgIGNvbnN0IGFmZmVjdGVkUGFyZW50U3BhY2VJZHMgPSB0aGlzLmdldEtub3duUGFyZW50cyhzcGFjZS5yb29tSWQsIHRydWUpO1xuICAgICAgICB0aGlzLmVtaXQoc3BhY2Uucm9vbUlkKTtcbiAgICAgICAgYWZmZWN0ZWRQYXJlbnRTcGFjZUlkcy5mb3JFYWNoKHNwYWNlSWQgPT4gdGhpcy5lbWl0KHNwYWNlSWQpKTtcblxuICAgICAgICBpZiAoIWluU3BhY2UpIHtcbiAgICAgICAgICAgIC8vIHN3aXRjaCBzcGFjZSBpZiB0aGUgRE0gaXMgbm8gbG9uZ2VyIGNvbnNpZGVyZWQgcGFydCBvZiB0aGUgc3BhY2VcbiAgICAgICAgICAgIHRoaXMuc3dpdGNoU3BhY2VJZk5lZWRlZCgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Sb29tc1VwZGF0ZSA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgdmlzaWJsZVJvb21zID0gdGhpcy5tYXRyaXhDbGllbnQuZ2V0VmlzaWJsZVJvb21zKCk7XG5cbiAgICAgICAgY29uc3QgcHJldlJvb21zQnlTcGFjZSA9IHRoaXMucm9vbUlkc0J5U3BhY2U7XG4gICAgICAgIGNvbnN0IHByZXZVc2Vyc0J5U3BhY2UgPSB0aGlzLnVzZXJJZHNCeVNwYWNlO1xuICAgICAgICBjb25zdCBwcmV2Q2hpbGRTcGFjZXNCeVNwYWNlID0gdGhpcy5jaGlsZFNwYWNlc0J5U3BhY2U7XG5cbiAgICAgICAgdGhpcy5yb29tSWRzQnlTcGFjZSA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy51c2VySWRzQnlTcGFjZSA9IG5ldyBNYXAoKTtcbiAgICAgICAgdGhpcy5jaGlsZFNwYWNlc0J5U3BhY2UgPSBuZXcgTWFwKCk7XG5cbiAgICAgICAgdGhpcy5yZWJ1aWxkUGFyZW50TWFwKCk7XG4gICAgICAgIC8vIG11dGF0ZXMgdGhpcy5yb29tSWRzQnlTcGFjZVxuICAgICAgICB0aGlzLnJlYnVpbGRNZXRhU3BhY2VzKCk7XG5cbiAgICAgICAgY29uc3QgaGlkZGVuQ2hpbGRyZW4gPSBuZXcgRW5oYW5jZWRNYXA8c3RyaW5nLCBTZXQ8c3RyaW5nPj4oKTtcbiAgICAgICAgdmlzaWJsZVJvb21zLmZvckVhY2gocm9vbSA9PiB7XG4gICAgICAgICAgICBpZiAocm9vbS5nZXRNeU1lbWJlcnNoaXAoKSAhPT0gXCJqb2luXCIpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuZ2V0UGFyZW50cyhyb29tLnJvb21JZCkuZm9yRWFjaChwYXJlbnQgPT4ge1xuICAgICAgICAgICAgICAgIGhpZGRlbkNoaWxkcmVuLmdldE9yQ3JlYXRlKHBhcmVudC5yb29tSWQsIG5ldyBTZXQoKSkuYWRkKHJvb20ucm9vbUlkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnJvb3RTcGFjZXMuZm9yRWFjaChzID0+IHtcbiAgICAgICAgICAgIC8vIHRyYXZlcnNlIGVhY2ggc3BhY2UgdHJlZSBpbiBERlMgdG8gYnVpbGQgdXAgdGhlIHN1cGVyc2V0cyBhcyB5b3UgZ28gdXAsXG4gICAgICAgICAgICAvLyByZXVzaW5nIHJlc3VsdHMgZnJvbSBsaWtlIHN1YnRyZWVzLlxuICAgICAgICAgICAgY29uc3QgdHJhdmVyc2VTcGFjZSA9IChzcGFjZUlkOiBzdHJpbmcsIHBhcmVudFBhdGg6IFNldDxzdHJpbmc+KTogW1NldDxzdHJpbmc+LCBTZXQ8c3RyaW5nPl0gPT4ge1xuICAgICAgICAgICAgICAgIGlmIChwYXJlbnRQYXRoLmhhcyhzcGFjZUlkKSkgcmV0dXJuOyAvLyBwcmV2ZW50IGN5Y2xlc1xuICAgICAgICAgICAgICAgIC8vIHJldXNlIGV4aXN0aW5nIHJlc3VsdHMgaWYgbXVsdGlwbGUgc2ltaWxhciBicmFuY2hlcyBleGlzdFxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnJvb21JZHNCeVNwYWNlLmhhcyhzcGFjZUlkKSAmJiB0aGlzLnVzZXJJZHNCeVNwYWNlLmhhcyhzcGFjZUlkKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW3RoaXMucm9vbUlkc0J5U3BhY2UuZ2V0KHNwYWNlSWQpLCB0aGlzLnVzZXJJZHNCeVNwYWNlLmdldChzcGFjZUlkKV07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgW2NoaWxkU3BhY2VzLCBjaGlsZFJvb21zXSA9IHBhcnRpdGlvblNwYWNlc0FuZFJvb21zKHRoaXMuZ2V0Q2hpbGRyZW4oc3BhY2VJZCkpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZFNwYWNlc0J5U3BhY2Uuc2V0KHNwYWNlSWQsIG5ldyBTZXQoY2hpbGRTcGFjZXMubWFwKHNwYWNlID0+IHNwYWNlLnJvb21JZCkpKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHJvb21JZHMgPSBuZXcgU2V0KGNoaWxkUm9vbXMubWFwKHIgPT4gci5yb29tSWQpKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHNwYWNlID0gdGhpcy5tYXRyaXhDbGllbnQ/LmdldFJvb20oc3BhY2VJZCk7XG4gICAgICAgICAgICAgICAgY29uc3QgdXNlcklkcyA9IG5ldyBTZXQoc3BhY2U/LmdldE1lbWJlcnMoKS5maWx0ZXIobSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtLm1lbWJlcnNoaXAgPT09IFwiam9pblwiIHx8IG0ubWVtYmVyc2hpcCA9PT0gXCJpbnZpdGVcIjtcbiAgICAgICAgICAgICAgICB9KS5tYXAobSA9PiBtLnVzZXJJZCkpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3UGF0aCA9IG5ldyBTZXQocGFyZW50UGF0aCkuYWRkKHNwYWNlSWQpO1xuXG4gICAgICAgICAgICAgICAgY2hpbGRTcGFjZXMuZm9yRWFjaChjaGlsZFNwYWNlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdHJhdmVyc2VTcGFjZShjaGlsZFNwYWNlLnJvb21JZCwgbmV3UGF0aCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaGlkZGVuQ2hpbGRyZW4uZ2V0KHNwYWNlSWQpPy5mb3JFYWNoKHJvb21JZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJvb21JZHMuYWRkKHJvb21JZCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBFeHBhbmQgcm9vbSBJRHMgdG8gYWxsIGtub3duIHZlcnNpb25zIG9mIHRoZSBnaXZlbiByb29tc1xuICAgICAgICAgICAgICAgIGNvbnN0IGV4cGFuZGVkUm9vbUlkcyA9IG5ldyBTZXQoQXJyYXkuZnJvbShyb29tSWRzKS5mbGF0TWFwKHJvb21JZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1hdHJpeENsaWVudC5nZXRSb29tVXBncmFkZUhpc3Rvcnkocm9vbUlkLCB0cnVlKS5tYXAociA9PiByLnJvb21JZCk7XG4gICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5yb29tSWRzQnlTcGFjZS5zZXQoc3BhY2VJZCwgZXhwYW5kZWRSb29tSWRzKTtcblxuICAgICAgICAgICAgICAgIHRoaXMudXNlcklkc0J5U3BhY2Uuc2V0KHNwYWNlSWQsIHVzZXJJZHMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBbZXhwYW5kZWRSb29tSWRzLCB1c2VySWRzXTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRyYXZlcnNlU3BhY2Uocy5yb29tSWQsIG5ldyBTZXQoKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHJvb21EaWZmID0gbWFwRGlmZihwcmV2Um9vbXNCeVNwYWNlLCB0aGlzLnJvb21JZHNCeVNwYWNlKTtcbiAgICAgICAgY29uc3QgdXNlckRpZmYgPSBtYXBEaWZmKHByZXZVc2Vyc0J5U3BhY2UsIHRoaXMudXNlcklkc0J5U3BhY2UpO1xuICAgICAgICBjb25zdCBzcGFjZURpZmYgPSBtYXBEaWZmKHByZXZDaGlsZFNwYWNlc0J5U3BhY2UsIHRoaXMuY2hpbGRTcGFjZXNCeVNwYWNlKTtcbiAgICAgICAgLy8gZmlsdGVyIG91dCBrZXlzIHdoaWNoIGNoYW5nZWQgYnkgcmVmZXJlbmNlIG9ubHkgYnkgY2hlY2tpbmcgd2hldGhlciB0aGUgc2V0cyBkaWZmZXJcbiAgICAgICAgY29uc3Qgcm9vbXNDaGFuZ2VkID0gcm9vbURpZmYuY2hhbmdlZC5maWx0ZXIoayA9PiB7XG4gICAgICAgICAgICByZXR1cm4gc2V0SGFzRGlmZihwcmV2Um9vbXNCeVNwYWNlLmdldChrKSwgdGhpcy5yb29tSWRzQnlTcGFjZS5nZXQoaykpO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgdXNlcnNDaGFuZ2VkID0gdXNlckRpZmYuY2hhbmdlZC5maWx0ZXIoayA9PiB7XG4gICAgICAgICAgICByZXR1cm4gc2V0SGFzRGlmZihwcmV2VXNlcnNCeVNwYWNlLmdldChrKSwgdGhpcy51c2VySWRzQnlTcGFjZS5nZXQoaykpO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3Qgc3BhY2VzQ2hhbmdlZCA9IHNwYWNlRGlmZi5jaGFuZ2VkLmZpbHRlcihrID0+IHtcbiAgICAgICAgICAgIHJldHVybiBzZXRIYXNEaWZmKHByZXZDaGlsZFNwYWNlc0J5U3BhY2UuZ2V0KGspLCB0aGlzLmNoaWxkU3BhY2VzQnlTcGFjZS5nZXQoaykpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBjaGFuZ2VTZXQgPSBuZXcgU2V0KFtcbiAgICAgICAgICAgIC4uLnJvb21EaWZmLmFkZGVkLFxuICAgICAgICAgICAgLi4udXNlckRpZmYuYWRkZWQsXG4gICAgICAgICAgICAuLi5zcGFjZURpZmYuYWRkZWQsXG4gICAgICAgICAgICAuLi5yb29tRGlmZi5yZW1vdmVkLFxuICAgICAgICAgICAgLi4udXNlckRpZmYucmVtb3ZlZCxcbiAgICAgICAgICAgIC4uLnNwYWNlRGlmZi5yZW1vdmVkLFxuICAgICAgICAgICAgLi4ucm9vbXNDaGFuZ2VkLFxuICAgICAgICAgICAgLi4udXNlcnNDaGFuZ2VkLFxuICAgICAgICAgICAgLi4uc3BhY2VzQ2hhbmdlZCxcbiAgICAgICAgXSk7XG5cbiAgICAgICAgY29uc3QgYWZmZWN0ZWRQYXJlbnRzID0gQXJyYXkuZnJvbShjaGFuZ2VTZXQpLmZsYXRNYXAoXG4gICAgICAgICAgICBjaGFuZ2VkSWQgPT4gWy4uLnRoaXMuZ2V0S25vd25QYXJlbnRzKGNoYW5nZWRJZCwgdHJ1ZSldLFxuICAgICAgICApO1xuICAgICAgICBhZmZlY3RlZFBhcmVudHMuZm9yRWFjaChwYXJlbnRJZCA9PiBjaGFuZ2VTZXQuYWRkKHBhcmVudElkKSk7XG4gICAgICAgIC8vIGJ1c3QgYWdncmVnYXRlIGNhY2hlXG4gICAgICAgIHRoaXMuX2FnZ3JlZ2F0ZWRTcGFjZUNhY2hlLnJvb21JZHNCeVNwYWNlLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuX2FnZ3JlZ2F0ZWRTcGFjZUNhY2hlLnVzZXJJZHNCeVNwYWNlLmNsZWFyKCk7XG5cbiAgICAgICAgY2hhbmdlU2V0LmZvckVhY2goayA9PiB7XG4gICAgICAgICAgICB0aGlzLmVtaXQoayk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChjaGFuZ2VTZXQuaGFzKHRoaXMuYWN0aXZlU3BhY2UpKSB7XG4gICAgICAgICAgICB0aGlzLnN3aXRjaFNwYWNlSWZOZWVkZWQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvblN0YXRlc1RvVXBkYXRlID0gWy4uLmNoYW5nZVNldF07XG4gICAgICAgIGlmICh0aGlzLmVuYWJsZWRNZXRhU3BhY2VzLmluY2x1ZGVzKE1ldGFTcGFjZS5QZW9wbGUpICYmXG4gICAgICAgICAgICB1c2VyRGlmZi5hZGRlZC5sZW5ndGggKyB1c2VyRGlmZi5yZW1vdmVkLmxlbmd0aCArIHVzZXJzQ2hhbmdlZC5sZW5ndGggPiAwXG4gICAgICAgICkge1xuICAgICAgICAgICAgbm90aWZpY2F0aW9uU3RhdGVzVG9VcGRhdGUucHVzaChNZXRhU3BhY2UuUGVvcGxlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVwZGF0ZU5vdGlmaWNhdGlvblN0YXRlcyhub3RpZmljYXRpb25TdGF0ZXNUb1VwZGF0ZSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgc3dpdGNoU3BhY2VJZk5lZWRlZCA9IChyb29tSWQgPSBSb29tVmlld1N0b3JlLmluc3RhbmNlLmdldFJvb21JZCgpKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5pc1Jvb21JblNwYWNlKHRoaXMuYWN0aXZlU3BhY2UsIHJvb21JZCkgJiYgIXRoaXMubWF0cml4Q2xpZW50LmdldFJvb20ocm9vbUlkKT8uaXNTcGFjZVJvb20oKSkge1xuICAgICAgICAgICAgdGhpcy5zd2l0Y2hUb1JlbGF0ZWRTcGFjZShyb29tSWQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgc3dpdGNoVG9SZWxhdGVkU3BhY2UgPSAocm9vbUlkOiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc3VnZ2VzdGVkUm9vbXMuZmluZChyID0+IHIucm9vbV9pZCA9PT0gcm9vbUlkKSkgcmV0dXJuO1xuXG4gICAgICAgIC8vIHRyeSB0byBmaW5kIHRoZSBjYW5vbmljYWwgcGFyZW50IGZpcnN0XG4gICAgICAgIGxldCBwYXJlbnQ6IFNwYWNlS2V5ID0gdGhpcy5nZXRDYW5vbmljYWxQYXJlbnQocm9vbUlkKT8ucm9vbUlkO1xuXG4gICAgICAgIC8vIG90aGVyd2lzZSwgdHJ5IHRvIGZpbmQgYSByb290IHNwYWNlIHdoaWNoIGNvbnRhaW5zIHRoaXMgcm9vbVxuICAgICAgICBpZiAoIXBhcmVudCkge1xuICAgICAgICAgICAgcGFyZW50ID0gdGhpcy5yb290U3BhY2VzLmZpbmQocyA9PiB0aGlzLmlzUm9vbUluU3BhY2Uocy5yb29tSWQsIHJvb21JZCkpPy5yb29tSWQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBvdGhlcndpc2UsIHRyeSB0byBmaW5kIGEgbWV0YXNwYWNlIHdoaWNoIGNvbnRhaW5zIHRoaXMgcm9vbVxuICAgICAgICBpZiAoIXBhcmVudCkge1xuICAgICAgICAgICAgLy8gc2VhcmNoIG1ldGEgc3BhY2VzIGluIHJldmVyc2UgYXMgSG9tZSBpcyB0aGUgZmlyc3QgYW5kIGxlYXN0IHNwZWNpZmljIG9uZVxuICAgICAgICAgICAgcGFyZW50ID0gWy4uLnRoaXMuZW5hYmxlZE1ldGFTcGFjZXNdLnJldmVyc2UoKS5maW5kKHMgPT4gdGhpcy5pc1Jvb21JblNwYWNlKHMsIHJvb21JZCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZG9uJ3QgdHJpZ2dlciBhIGNvbnRleHQgc3dpdGNoIHdoZW4gd2UgYXJlIHN3aXRjaGluZyBhIHNwYWNlIHRvIG1hdGNoIHRoZSBjaG9zZW4gcm9vbVxuICAgICAgICBpZiAocGFyZW50KSB7XG4gICAgICAgICAgICB0aGlzLnNldEFjdGl2ZVNwYWNlKHBhcmVudCwgZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5nb1RvRmlyc3RTcGFjZSgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Sb29tID0gKHJvb206IFJvb20sIG5ld01lbWJlcnNoaXA/OiBzdHJpbmcsIG9sZE1lbWJlcnNoaXA/OiBzdHJpbmcpID0+IHtcbiAgICAgICAgY29uc3Qgcm9vbU1lbWJlcnNoaXAgPSByb29tLmdldE15TWVtYmVyc2hpcCgpO1xuICAgICAgICBpZiAoIXJvb21NZW1iZXJzaGlwKSB7XG4gICAgICAgICAgICAvLyByb29tIGlzIHN0aWxsIGJlaW5nIGJha2VkIGluIHRoZSBqcy1zZGssIHdlJ2xsIHByb2Nlc3MgaXQgYXQgUm9vbS5teU1lbWJlcnNoaXAgaW5zdGVhZFxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1lbWJlcnNoaXAgPSBuZXdNZW1iZXJzaGlwIHx8IHJvb21NZW1iZXJzaGlwO1xuXG4gICAgICAgIGlmICghcm9vbS5pc1NwYWNlUm9vbSgpKSB7XG4gICAgICAgICAgICB0aGlzLm9uUm9vbXNVcGRhdGUoKTtcblxuICAgICAgICAgICAgaWYgKG1lbWJlcnNoaXAgPT09IFwiam9pblwiKSB7XG4gICAgICAgICAgICAgICAgLy8gdGhlIHVzZXIganVzdCBqb2luZWQgYSByb29tLCByZW1vdmUgaXQgZnJvbSB0aGUgc3VnZ2VzdGVkIGxpc3QgaWYgaXQgd2FzIHRoZXJlXG4gICAgICAgICAgICAgICAgY29uc3QgbnVtU3VnZ2VzdGVkUm9vbXMgPSB0aGlzLl9zdWdnZXN0ZWRSb29tcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgdGhpcy5fc3VnZ2VzdGVkUm9vbXMgPSB0aGlzLl9zdWdnZXN0ZWRSb29tcy5maWx0ZXIociA9PiByLnJvb21faWQgIT09IHJvb20ucm9vbUlkKTtcbiAgICAgICAgICAgICAgICBpZiAobnVtU3VnZ2VzdGVkUm9vbXMgIT09IHRoaXMuX3N1Z2dlc3RlZFJvb21zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoVVBEQVRFX1NVR0dFU1RFRF9ST09NUywgdGhpcy5fc3VnZ2VzdGVkUm9vbXMpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIGlmIHRoZSByb29tIGN1cnJlbnRseSBiZWluZyB2aWV3ZWQgd2FzIGp1c3Qgam9pbmVkIHRoZW4gc3dpdGNoIHRvIGl0cyByZWxhdGVkIHNwYWNlXG4gICAgICAgICAgICAgICAgaWYgKG5ld01lbWJlcnNoaXAgPT09IFwiam9pblwiICYmIHJvb20ucm9vbUlkID09PSBSb29tVmlld1N0b3JlLmluc3RhbmNlLmdldFJvb21JZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3dpdGNoU3BhY2VJZk5lZWRlZChyb29tLnJvb21JZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3BhY2VcbiAgICAgICAgaWYgKG1lbWJlcnNoaXAgPT09IFwiaW52aXRlXCIpIHtcbiAgICAgICAgICAgIGNvbnN0IGxlbiA9IHRoaXMuX2ludml0ZWRTcGFjZXMuc2l6ZTtcbiAgICAgICAgICAgIHRoaXMuX2ludml0ZWRTcGFjZXMuYWRkKHJvb20pO1xuICAgICAgICAgICAgaWYgKGxlbiAhPT0gdGhpcy5faW52aXRlZFNwYWNlcy5zaXplKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KFVQREFURV9JTlZJVEVEX1NQQUNFUywgdGhpcy5pbnZpdGVkU3BhY2VzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChvbGRNZW1iZXJzaGlwID09PSBcImludml0ZVwiICYmIG1lbWJlcnNoaXAgIT09IFwiam9pblwiKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5faW52aXRlZFNwYWNlcy5kZWxldGUocm9vbSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoVVBEQVRFX0lOVklURURfU1BBQ0VTLCB0aGlzLmludml0ZWRTcGFjZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yZWJ1aWxkU3BhY2VIaWVyYXJjaHkoKTtcbiAgICAgICAgICAgIC8vIGZpcmUgb2ZmIHVwZGF0ZXMgdG8gYWxsIHBhcmVudCBsaXN0ZW5lcnNcbiAgICAgICAgICAgIHRoaXMucGFyZW50TWFwLmdldChyb29tLnJvb21JZCk/LmZvckVhY2goKHBhcmVudElkKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KHBhcmVudElkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5lbWl0KHJvb20ucm9vbUlkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtZW1iZXJzaGlwID09PSBcImpvaW5cIiAmJiByb29tLnJvb21JZCA9PT0gUm9vbVZpZXdTdG9yZS5pbnN0YW5jZS5nZXRSb29tSWQoKSkge1xuICAgICAgICAgICAgLy8gaWYgdGhlIHVzZXIgd2FzIGxvb2tpbmcgYXQgdGhlIHNwYWNlIGFuZCB0aGVuIGpvaW5lZDogc2VsZWN0IHRoYXQgc3BhY2VcbiAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlU3BhY2Uocm9vbS5yb29tSWQsIGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIGlmIChtZW1iZXJzaGlwID09PSBcImxlYXZlXCIgJiYgcm9vbS5yb29tSWQgPT09IHRoaXMuYWN0aXZlU3BhY2UpIHtcbiAgICAgICAgICAgIC8vIHVzZXIncyBhY3RpdmUgc3BhY2UgaGFzIGdvbmUgYXdheSwgZ28gYmFjayB0byBob21lXG4gICAgICAgICAgICB0aGlzLmdvVG9GaXJzdFNwYWNlKHRydWUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgbm90aWZ5SWZPcmRlckNoYW5nZWQoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHJvb3RTcGFjZXMgPSB0aGlzLnNvcnRSb290U3BhY2VzKHRoaXMucm9vdFNwYWNlcyk7XG4gICAgICAgIGlmIChhcnJheUhhc09yZGVyQ2hhbmdlKHRoaXMucm9vdFNwYWNlcywgcm9vdFNwYWNlcykpIHtcbiAgICAgICAgICAgIHRoaXMucm9vdFNwYWNlcyA9IHJvb3RTcGFjZXM7XG4gICAgICAgICAgICB0aGlzLmVtaXQoVVBEQVRFX1RPUF9MRVZFTF9TUEFDRVMsIHRoaXMuc3BhY2VQYW5lbFNwYWNlcywgdGhpcy5lbmFibGVkTWV0YVNwYWNlcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUm9vbVN0YXRlID0gKGV2OiBNYXRyaXhFdmVudCkgPT4ge1xuICAgICAgICBjb25zdCByb29tID0gdGhpcy5tYXRyaXhDbGllbnQuZ2V0Um9vbShldi5nZXRSb29tSWQoKSk7XG5cbiAgICAgICAgaWYgKCFyb29tKSByZXR1cm47XG5cbiAgICAgICAgc3dpdGNoIChldi5nZXRUeXBlKCkpIHtcbiAgICAgICAgICAgIGNhc2UgRXZlbnRUeXBlLlNwYWNlQ2hpbGQ6IHtcbiAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXQgPSB0aGlzLm1hdHJpeENsaWVudC5nZXRSb29tKGV2LmdldFN0YXRlS2V5KCkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHJvb20uaXNTcGFjZVJvb20oKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0Py5pc1NwYWNlUm9vbSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlYnVpbGRTcGFjZUhpZXJhcmNoeSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KHRhcmdldC5yb29tSWQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vblJvb21zVXBkYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWl0KHJvb20ucm9vbUlkKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAocm9vbS5yb29tSWQgPT09IHRoaXMuYWN0aXZlU3BhY2UgJiYgLy8gY3VycmVudCBzcGFjZVxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQ/LmdldE15TWVtYmVyc2hpcCgpICE9PSBcImpvaW5cIiAmJiAvLyB0YXJnZXQgbm90IGpvaW5lZFxuICAgICAgICAgICAgICAgICAgICBldi5nZXRQcmV2Q29udGVudCgpLnN1Z2dlc3RlZCAhPT0gZXYuZ2V0Q29udGVudCgpLnN1Z2dlc3RlZCAvLyBzdWdnZXN0ZWQgZmxhZyBjaGFuZ2VkXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9hZFN1Z2dlc3RlZFJvb21zKHJvb20pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYXNlIEV2ZW50VHlwZS5TcGFjZVBhcmVudDpcbiAgICAgICAgICAgICAgICAvLyBUT0RPIHJlYnVpbGQgdGhlIHNwYWNlIHBhcmVudCBhbmQgbm90IHRoZSByb29tIC0gY2hlY2sgcGVybWlzc2lvbnM/XG4gICAgICAgICAgICAgICAgLy8gVE9ETyBjb25maXJtIHRoaXMgYWZ0ZXIgaW1wbGVtZW50aW5nIHBhcmVudGluZyBiZWhhdmlvdXJcbiAgICAgICAgICAgICAgICBpZiAocm9vbS5pc1NwYWNlUm9vbSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVidWlsZFNwYWNlSGllcmFyY2h5KCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vblJvb21zVXBkYXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuZW1pdChyb29tLnJvb21JZCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgRXZlbnRUeXBlLlJvb21Qb3dlckxldmVsczpcbiAgICAgICAgICAgICAgICBpZiAocm9vbS5pc1NwYWNlUm9vbSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25Sb29tc1VwZGF0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBsaXN0ZW5pbmcgZm9yIG0ucm9vbS5tZW1iZXIgZXZlbnRzIGluIG9uUm9vbVN0YXRlIGFib3ZlIGRvZXNuJ3Qgd29yayBhcyB0aGUgTWVtYmVyIG9iamVjdCBpc24ndCB1cGRhdGVkIGJ5IHRoZW5cbiAgICBwcml2YXRlIG9uUm9vbVN0YXRlTWVtYmVycyA9IChldjogTWF0cml4RXZlbnQpID0+IHtcbiAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMubWF0cml4Q2xpZW50LmdldFJvb20oZXYuZ2V0Um9vbUlkKCkpO1xuXG4gICAgICAgIGNvbnN0IHVzZXJJZCA9IGV2LmdldFN0YXRlS2V5KCk7XG4gICAgICAgIGlmIChyb29tPy5pc1NwYWNlUm9vbSgpICYmIC8vIG9ubHkgY29uc2lkZXIgc3BhY2Ugcm9vbXNcbiAgICAgICAgICAgIERNUm9vbU1hcC5zaGFyZWQoKS5nZXRETVJvb21zRm9yVXNlcklkKHVzZXJJZCkubGVuZ3RoID4gMCAmJiAvLyBvbmx5IGNvbnNpZGVyIG1lbWJlcnMgd2UgaGF2ZSBhIERNIHdpdGhcbiAgICAgICAgICAgIGV2LmdldFByZXZDb250ZW50KCkubWVtYmVyc2hpcCAhPT0gZXYuZ2V0Q29udGVudCgpLm1lbWJlcnNoaXAgLy8gb25seSBjb25zaWRlciB3aGVuIG1lbWJlcnNoaXAgY2hhbmdlc1xuICAgICAgICApIHtcbiAgICAgICAgICAgIHRoaXMub25NZW1iZXJVcGRhdGUocm9vbSwgdXNlcklkKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUm9vbUFjY291bnREYXRhID0gKGV2OiBNYXRyaXhFdmVudCwgcm9vbTogUm9vbSwgbGFzdEV2PzogTWF0cml4RXZlbnQpID0+IHtcbiAgICAgICAgaWYgKHJvb20uaXNTcGFjZVJvb20oKSAmJiBldi5nZXRUeXBlKCkgPT09IEV2ZW50VHlwZS5TcGFjZU9yZGVyKSB7XG4gICAgICAgICAgICB0aGlzLnNwYWNlT3JkZXJMb2NhbEVjaG9NYXAuZGVsZXRlKHJvb20ucm9vbUlkKTsgLy8gY2xlYXIgYW55IGxvY2FsIGVjaG9cbiAgICAgICAgICAgIGNvbnN0IG9yZGVyID0gZXYuZ2V0Q29udGVudCgpPy5vcmRlcjtcbiAgICAgICAgICAgIGNvbnN0IGxhc3RPcmRlciA9IGxhc3RFdj8uZ2V0Q29udGVudCgpPy5vcmRlcjtcbiAgICAgICAgICAgIGlmIChvcmRlciAhPT0gbGFzdE9yZGVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZnlJZk9yZGVyQ2hhbmdlZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGV2LmdldFR5cGUoKSA9PT0gRXZlbnRUeXBlLlRhZykge1xuICAgICAgICAgICAgLy8gSWYgdGhlIHJvb20gd2FzIGluIGZhdm91cml0ZXMgYW5kIG5vdyBpc24ndCBvciB0aGUgb3Bwb3NpdGUgdGhlbiB1cGRhdGUgaXRzIHBvc2l0aW9uIGluIHRoZSB0cmVlc1xuICAgICAgICAgICAgY29uc3Qgb2xkVGFncyA9IGxhc3RFdj8uZ2V0Q29udGVudCgpPy50YWdzIHx8IHt9O1xuICAgICAgICAgICAgY29uc3QgbmV3VGFncyA9IGV2LmdldENvbnRlbnQoKT8udGFncyB8fCB7fTtcbiAgICAgICAgICAgIGlmICghIW9sZFRhZ3NbRGVmYXVsdFRhZ0lELkZhdm91cml0ZV0gIT09ICEhbmV3VGFnc1tEZWZhdWx0VGFnSUQuRmF2b3VyaXRlXSkge1xuICAgICAgICAgICAgICAgIHRoaXMub25Sb29tRmF2b3VyaXRlQ2hhbmdlKHJvb20pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Sb29tRmF2b3VyaXRlQ2hhbmdlKHJvb206IFJvb20pIHtcbiAgICAgICAgaWYgKHRoaXMuZW5hYmxlZE1ldGFTcGFjZXMuaW5jbHVkZXMoTWV0YVNwYWNlLkZhdm91cml0ZXMpKSB7XG4gICAgICAgICAgICBpZiAocm9vbS50YWdzW0RlZmF1bHRUYWdJRC5GYXZvdXJpdGVdKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yb29tSWRzQnlTcGFjZS5nZXQoTWV0YVNwYWNlLkZhdm91cml0ZXMpLmFkZChyb29tLnJvb21JZCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucm9vbUlkc0J5U3BhY2UuZ2V0KE1ldGFTcGFjZS5GYXZvdXJpdGVzKS5kZWxldGUocm9vbS5yb29tSWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5lbWl0KE1ldGFTcGFjZS5GYXZvdXJpdGVzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25Sb29tRG1DaGFuZ2Uocm9vbTogUm9vbSwgaXNEbTogYm9vbGVhbik6IHZvaWQge1xuICAgICAgICBjb25zdCBlbmFibGVkTWV0YVNwYWNlcyA9IG5ldyBTZXQodGhpcy5lbmFibGVkTWV0YVNwYWNlcyk7XG5cbiAgICAgICAgaWYgKCF0aGlzLmFsbFJvb21zSW5Ib21lICYmIGVuYWJsZWRNZXRhU3BhY2VzLmhhcyhNZXRhU3BhY2UuSG9tZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGhvbWVSb29tcyA9IHRoaXMucm9vbUlkc0J5U3BhY2UuZ2V0KE1ldGFTcGFjZS5Ib21lKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnNob3dJbkhvbWVTcGFjZShyb29tKSkge1xuICAgICAgICAgICAgICAgIGhvbWVSb29tcz8uYWRkKHJvb20ucm9vbUlkKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMucm9vbUlkc0J5U3BhY2UuZ2V0KE1ldGFTcGFjZS5PcnBoYW5zKS5oYXMocm9vbS5yb29tSWQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yb29tSWRzQnlTcGFjZS5nZXQoTWV0YVNwYWNlLkhvbWUpPy5kZWxldGUocm9vbS5yb29tSWQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmVtaXQoTWV0YVNwYWNlLkhvbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVuYWJsZWRNZXRhU3BhY2VzLmhhcyhNZXRhU3BhY2UuUGVvcGxlKSkge1xuICAgICAgICAgICAgdGhpcy5lbWl0KE1ldGFTcGFjZS5QZW9wbGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVuYWJsZWRNZXRhU3BhY2VzLmhhcyhNZXRhU3BhY2UuT3JwaGFucykgfHwgZW5hYmxlZE1ldGFTcGFjZXMuaGFzKE1ldGFTcGFjZS5Ib21lKSkge1xuICAgICAgICAgICAgaWYgKGlzRG0gJiYgdGhpcy5yb29tSWRzQnlTcGFjZS5nZXQoTWV0YVNwYWNlLk9ycGhhbnMpLmRlbGV0ZShyb29tLnJvb21JZCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoTWV0YVNwYWNlLk9ycGhhbnMpO1xuICAgICAgICAgICAgICAgIHRoaXMuZW1pdChNZXRhU3BhY2UuSG9tZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQWNjb3VudERhdGEgPSAoZXY6IE1hdHJpeEV2ZW50LCBwcmV2RXY/OiBNYXRyaXhFdmVudCkgPT4ge1xuICAgICAgICBpZiAoZXYuZ2V0VHlwZSgpID09PSBFdmVudFR5cGUuRGlyZWN0KSB7XG4gICAgICAgICAgICBjb25zdCBwcmV2aW91c1Jvb21zID0gbmV3IFNldChPYmplY3QudmFsdWVzKHByZXZFdj8uZ2V0Q29udGVudDxSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT4+KCkgPz8ge30pLmZsYXQoKSk7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50Um9vbXMgPSBuZXcgU2V0KE9iamVjdC52YWx1ZXMoZXYuZ2V0Q29udGVudDxSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT4+KCkpLmZsYXQoKSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGRpZmYgPSBzZXREaWZmKHByZXZpb3VzUm9vbXMsIGN1cnJlbnRSb29tcyk7XG4gICAgICAgICAgICBbLi4uZGlmZi5hZGRlZCwgLi4uZGlmZi5yZW1vdmVkXS5mb3JFYWNoKHJvb21JZCA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMubWF0cml4Q2xpZW50Py5nZXRSb29tKHJvb21JZCk7XG4gICAgICAgICAgICAgICAgaWYgKHJvb20pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vblJvb21EbUNoYW5nZShyb29tLCBjdXJyZW50Um9vbXMuaGFzKHJvb21JZCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoZGlmZi5yZW1vdmVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN3aXRjaFNwYWNlSWZOZWVkZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcm90ZWN0ZWQgYXN5bmMgcmVzZXQoKSB7XG4gICAgICAgIHRoaXMucm9vdFNwYWNlcyA9IFtdO1xuICAgICAgICB0aGlzLnBhcmVudE1hcCA9IG5ldyBFbmhhbmNlZE1hcCgpO1xuICAgICAgICB0aGlzLm5vdGlmaWNhdGlvblN0YXRlTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLnJvb21JZHNCeVNwYWNlID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLnVzZXJJZHNCeVNwYWNlID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLl9hZ2dyZWdhdGVkU3BhY2VDYWNoZS5yb29tSWRzQnlTcGFjZS5jbGVhcigpO1xuICAgICAgICB0aGlzLl9hZ2dyZWdhdGVkU3BhY2VDYWNoZS51c2VySWRzQnlTcGFjZS5jbGVhcigpO1xuICAgICAgICB0aGlzLl9hY3RpdmVTcGFjZSA9IE1ldGFTcGFjZS5Ib21lOyAvLyBzZXQgcHJvcGVybHkgYnkgb25SZWFkeVxuICAgICAgICB0aGlzLl9zdWdnZXN0ZWRSb29tcyA9IFtdO1xuICAgICAgICB0aGlzLl9pbnZpdGVkU3BhY2VzID0gbmV3IFNldCgpO1xuICAgICAgICB0aGlzLl9lbmFibGVkTWV0YVNwYWNlcyA9IFtdO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBhc3luYyBvbk5vdFJlYWR5KCkge1xuICAgICAgICBpZiAodGhpcy5tYXRyaXhDbGllbnQpIHtcbiAgICAgICAgICAgIHRoaXMubWF0cml4Q2xpZW50LnJlbW92ZUxpc3RlbmVyKENsaWVudEV2ZW50LlJvb20sIHRoaXMub25Sb29tKTtcbiAgICAgICAgICAgIHRoaXMubWF0cml4Q2xpZW50LnJlbW92ZUxpc3RlbmVyKFJvb21FdmVudC5NeU1lbWJlcnNoaXAsIHRoaXMub25Sb29tKTtcbiAgICAgICAgICAgIHRoaXMubWF0cml4Q2xpZW50LnJlbW92ZUxpc3RlbmVyKFJvb21FdmVudC5BY2NvdW50RGF0YSwgdGhpcy5vblJvb21BY2NvdW50RGF0YSk7XG4gICAgICAgICAgICB0aGlzLm1hdHJpeENsaWVudC5yZW1vdmVMaXN0ZW5lcihSb29tU3RhdGVFdmVudC5FdmVudHMsIHRoaXMub25Sb29tU3RhdGUpO1xuICAgICAgICAgICAgdGhpcy5tYXRyaXhDbGllbnQucmVtb3ZlTGlzdGVuZXIoUm9vbVN0YXRlRXZlbnQuTWVtYmVycywgdGhpcy5vblJvb21TdGF0ZU1lbWJlcnMpO1xuICAgICAgICAgICAgdGhpcy5tYXRyaXhDbGllbnQucmVtb3ZlTGlzdGVuZXIoQ2xpZW50RXZlbnQuQWNjb3VudERhdGEsIHRoaXMub25BY2NvdW50RGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgdGhpcy5yZXNldCgpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBhc3luYyBvblJlYWR5KCkge1xuICAgICAgICB0aGlzLm1hdHJpeENsaWVudC5vbihDbGllbnRFdmVudC5Sb29tLCB0aGlzLm9uUm9vbSk7XG4gICAgICAgIHRoaXMubWF0cml4Q2xpZW50Lm9uKFJvb21FdmVudC5NeU1lbWJlcnNoaXAsIHRoaXMub25Sb29tKTtcbiAgICAgICAgdGhpcy5tYXRyaXhDbGllbnQub24oUm9vbUV2ZW50LkFjY291bnREYXRhLCB0aGlzLm9uUm9vbUFjY291bnREYXRhKTtcbiAgICAgICAgdGhpcy5tYXRyaXhDbGllbnQub24oUm9vbVN0YXRlRXZlbnQuRXZlbnRzLCB0aGlzLm9uUm9vbVN0YXRlKTtcbiAgICAgICAgdGhpcy5tYXRyaXhDbGllbnQub24oUm9vbVN0YXRlRXZlbnQuTWVtYmVycywgdGhpcy5vblJvb21TdGF0ZU1lbWJlcnMpO1xuICAgICAgICB0aGlzLm1hdHJpeENsaWVudC5vbihDbGllbnRFdmVudC5BY2NvdW50RGF0YSwgdGhpcy5vbkFjY291bnREYXRhKTtcblxuICAgICAgICBjb25zdCBvbGRNZXRhU3BhY2VzID0gdGhpcy5fZW5hYmxlZE1ldGFTcGFjZXM7XG4gICAgICAgIGNvbnN0IGVuYWJsZWRNZXRhU3BhY2VzID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcIlNwYWNlcy5lbmFibGVkTWV0YVNwYWNlc1wiKTtcbiAgICAgICAgdGhpcy5fZW5hYmxlZE1ldGFTcGFjZXMgPSBtZXRhU3BhY2VPcmRlci5maWx0ZXIoayA9PiBlbmFibGVkTWV0YVNwYWNlc1trXSk7XG5cbiAgICAgICAgdGhpcy5fYWxsUm9vbXNJbkhvbWUgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiU3BhY2VzLmFsbFJvb21zSW5Ib21lXCIpO1xuICAgICAgICB0aGlzLnNlbmRVc2VyUHJvcGVydGllcygpO1xuXG4gICAgICAgIHRoaXMucmVidWlsZFNwYWNlSGllcmFyY2h5KCk7IC8vIHRyaWdnZXIgYW4gaW5pdGlhbCB1cGRhdGVcbiAgICAgICAgLy8gcmVidWlsZFNwYWNlSGllcmFyY2h5IHdpbGwgb25seSBzZW5kIGFuIHVwZGF0ZSBpZiB0aGUgc3BhY2VzIGhhdmUgY2hhbmdlZC5cbiAgICAgICAgLy8gSWYgb25seSB0aGUgbWV0YSBzcGFjZXMgaGF2ZSBjaGFuZ2VkLCB3ZSBuZWVkIHRvIHNlbmQgYW4gdXBkYXRlIG91cnNlbHZlcy5cbiAgICAgICAgaWYgKGFycmF5SGFzRGlmZihvbGRNZXRhU3BhY2VzLCB0aGlzLl9lbmFibGVkTWV0YVNwYWNlcykpIHtcbiAgICAgICAgICAgIHRoaXMuZW1pdChVUERBVEVfVE9QX0xFVkVMX1NQQUNFUywgdGhpcy5zcGFjZVBhbmVsU3BhY2VzLCB0aGlzLmVuYWJsZWRNZXRhU3BhY2VzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHJlc3RvcmUgc2VsZWN0ZWQgc3RhdGUgZnJvbSBsYXN0IHNlc3Npb24gaWYgYW55IGFuZCBzdGlsbCB2YWxpZFxuICAgICAgICBjb25zdCBsYXN0U3BhY2VJZCA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShBQ1RJVkVfU1BBQ0VfTFNfS0VZKTtcbiAgICAgICAgY29uc3QgdmFsaWQgPSAobGFzdFNwYWNlSWQgJiYgIWlzTWV0YVNwYWNlKGxhc3RTcGFjZUlkKSlcbiAgICAgICAgICAgID8gdGhpcy5tYXRyaXhDbGllbnQuZ2V0Um9vbShsYXN0U3BhY2VJZClcbiAgICAgICAgICAgIDogZW5hYmxlZE1ldGFTcGFjZXNbbGFzdFNwYWNlSWRdO1xuICAgICAgICBpZiAodmFsaWQpIHtcbiAgICAgICAgICAgIC8vIGRvbid0IGNvbnRleHQgc3dpdGNoIGhlcmUgYXMgaXQgbWF5IGJyZWFrIHBlcm1hbGlua3NcbiAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlU3BhY2UobGFzdFNwYWNlSWQsIGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc3dpdGNoU3BhY2VJZk5lZWRlZCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZW5kVXNlclByb3BlcnRpZXMoKSB7XG4gICAgICAgIGNvbnN0IGVuYWJsZWQgPSBuZXcgU2V0KHRoaXMuZW5hYmxlZE1ldGFTcGFjZXMpO1xuICAgICAgICBQb3N0aG9nQW5hbHl0aWNzLmluc3RhbmNlLnNldFByb3BlcnR5KFwiV2ViTWV0YVNwYWNlSG9tZUVuYWJsZWRcIiwgZW5hYmxlZC5oYXMoTWV0YVNwYWNlLkhvbWUpKTtcbiAgICAgICAgUG9zdGhvZ0FuYWx5dGljcy5pbnN0YW5jZS5zZXRQcm9wZXJ0eShcIldlYk1ldGFTcGFjZUhvbWVBbGxSb29tc1wiLCB0aGlzLmFsbFJvb21zSW5Ib21lKTtcbiAgICAgICAgUG9zdGhvZ0FuYWx5dGljcy5pbnN0YW5jZS5zZXRQcm9wZXJ0eShcIldlYk1ldGFTcGFjZVBlb3BsZUVuYWJsZWRcIiwgZW5hYmxlZC5oYXMoTWV0YVNwYWNlLlBlb3BsZSkpO1xuICAgICAgICBQb3N0aG9nQW5hbHl0aWNzLmluc3RhbmNlLnNldFByb3BlcnR5KFwiV2ViTWV0YVNwYWNlRmF2b3VyaXRlc0VuYWJsZWRcIiwgZW5hYmxlZC5oYXMoTWV0YVNwYWNlLkZhdm91cml0ZXMpKTtcbiAgICAgICAgUG9zdGhvZ0FuYWx5dGljcy5pbnN0YW5jZS5zZXRQcm9wZXJ0eShcIldlYk1ldGFTcGFjZU9ycGhhbnNFbmFibGVkXCIsIGVuYWJsZWQuaGFzKE1ldGFTcGFjZS5PcnBoYW5zKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnb1RvRmlyc3RTcGFjZShjb250ZXh0U3dpdGNoID0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy5zZXRBY3RpdmVTcGFjZSh0aGlzLmVuYWJsZWRNZXRhU3BhY2VzWzBdID8/IHRoaXMuc3BhY2VQYW5lbFNwYWNlc1swXT8ucm9vbUlkLCBjb250ZXh0U3dpdGNoKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYXN5bmMgb25BY3Rpb24ocGF5bG9hZDogU3BhY2VTdG9yZUFjdGlvbnMpIHtcbiAgICAgICAgaWYgKCF0aGlzLm1hdHJpeENsaWVudCkgcmV0dXJuO1xuXG4gICAgICAgIHN3aXRjaCAocGF5bG9hZC5hY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLlZpZXdSb29tOiB7XG4gICAgICAgICAgICAgICAgLy8gRG9uJ3QgYXV0by1zd2l0Y2ggcm9vbXMgd2hlbiByZWFjdGluZyB0byBhIGNvbnRleHQtc3dpdGNoIG9yIGZvciBuZXcgcm9vbXMgYmVpbmcgY3JlYXRlZFxuICAgICAgICAgICAgICAgIC8vIGFzIHRoaXMgaXMgbm90IGhlbHBmdWwgYW5kIGNhbiBjcmVhdGUgbG9vcHMgb2Ygcm9vbXMvc3BhY2Ugc3dpdGNoaW5nXG4gICAgICAgICAgICAgICAgY29uc3QgaXNTcGFjZSA9IHBheWxvYWQuanVzdENyZWF0ZWRPcHRzPy5yb29tVHlwZSA9PT0gUm9vbVR5cGUuU3BhY2U7XG4gICAgICAgICAgICAgICAgaWYgKHBheWxvYWQuY29udGV4dF9zd2l0Y2ggfHwgKHBheWxvYWQuanVzdENyZWF0ZWRPcHRzICYmICFpc1NwYWNlKSkgYnJlYWs7XG4gICAgICAgICAgICAgICAgbGV0IHJvb21JZCA9IHBheWxvYWQucm9vbV9pZDtcblxuICAgICAgICAgICAgICAgIGlmIChwYXlsb2FkLnJvb21fYWxpYXMgJiYgIXJvb21JZCkge1xuICAgICAgICAgICAgICAgICAgICByb29tSWQgPSBnZXRDYWNoZWRSb29tSURGb3JBbGlhcyhwYXlsb2FkLnJvb21fYWxpYXMpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghcm9vbUlkKSByZXR1cm47IC8vIHdlJ2xsIGdldCByZS1maXJlZCB3aXRoIHRoZSByb29tIElEIHNob3J0bHlcblxuICAgICAgICAgICAgICAgIGNvbnN0IHJvb20gPSB0aGlzLm1hdHJpeENsaWVudC5nZXRSb29tKHJvb21JZCk7XG4gICAgICAgICAgICAgICAgaWYgKHJvb20/LmlzU3BhY2VSb29tKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRG9uJ3QgY29udGV4dCBzd2l0Y2ggd2hlbiBuYXZpZ2F0aW5nIHRvIHRoZSBzcGFjZSByb29tXG4gICAgICAgICAgICAgICAgICAgIC8vIGFzIGl0IHdpbGwgY2F1c2UgeW91IHRvIGVuZCB1cCBpbiB0aGUgd3Jvbmcgcm9vbVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldEFjdGl2ZVNwYWNlKHJvb20ucm9vbUlkLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zd2l0Y2hTcGFjZUlmTmVlZGVkKHJvb21JZCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gUGVyc2lzdCBsYXN0IHZpZXdlZCByb29tIGZyb20gYSBzcGFjZVxuICAgICAgICAgICAgICAgIC8vIHdlIGRvbid0IGF3YWl0IHNldEFjdGl2ZVNwYWNlIGFib3ZlIGFzIHdlIG9ubHkgY2FyZSBhYm91dCB0aGlzLmFjdGl2ZVNwYWNlIGJlaW5nIHVwIHRvIGRhdGVcbiAgICAgICAgICAgICAgICAvLyBzeW5jaHJvbm91c2x5IGZvciB0aGUgYmVsb3cgY29kZSAtIGV2ZXJ5dGhpbmcgZWxzZSBjYW4gYW5kIHNob3VsZCBiZSBhc3luYy5cbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oZ2V0U3BhY2VDb250ZXh0S2V5KHRoaXMuYWN0aXZlU3BhY2UpLCBwYXlsb2FkLnJvb21faWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5WaWV3SG9tZVBhZ2U6XG4gICAgICAgICAgICAgICAgaWYgKCFwYXlsb2FkLmNvbnRleHRfc3dpdGNoICYmIHRoaXMuZW5hYmxlZE1ldGFTcGFjZXMuaW5jbHVkZXMoTWV0YVNwYWNlLkhvbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0QWN0aXZlU3BhY2UoTWV0YVNwYWNlLkhvbWUsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKGdldFNwYWNlQ29udGV4dEtleSh0aGlzLmFjdGl2ZVNwYWNlKSwgXCJcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5BZnRlckxlYXZlUm9vbTpcbiAgICAgICAgICAgICAgICBpZiAoIWlzTWV0YVNwYWNlKHRoaXMuX2FjdGl2ZVNwYWNlKSAmJiBwYXlsb2FkLnJvb21faWQgPT09IHRoaXMuX2FjdGl2ZVNwYWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFVzZXIgaGFzIGxlZnQgdGhlIGN1cnJlbnQgc3BhY2UsIGdvIHRvIGZpcnN0IHNwYWNlXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ29Ub0ZpcnN0U3BhY2UodHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5Td2l0Y2hTcGFjZToge1xuICAgICAgICAgICAgICAgIC8vIE1ldGFzcGFjZXMgc3RhcnQgYXQgMSwgU3BhY2VzIGZvbGxvd1xuICAgICAgICAgICAgICAgIGlmIChwYXlsb2FkLm51bSA8IDEgfHwgcGF5bG9hZC5udW0gPiA5KSBicmVhaztcbiAgICAgICAgICAgICAgICBjb25zdCBudW1NZXRhU3BhY2VzID0gdGhpcy5lbmFibGVkTWV0YVNwYWNlcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgaWYgKHBheWxvYWQubnVtIDw9IG51bU1ldGFTcGFjZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmVTcGFjZSh0aGlzLmVuYWJsZWRNZXRhU3BhY2VzW3BheWxvYWQubnVtIC0gMV0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5zcGFjZVBhbmVsU3BhY2VzLmxlbmd0aCA+IHBheWxvYWQubnVtIC0gbnVtTWV0YVNwYWNlcyAtIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRBY3RpdmVTcGFjZSh0aGlzLnNwYWNlUGFuZWxTcGFjZXNbcGF5bG9hZC5udW0gLSBudW1NZXRhU3BhY2VzIC0gMV0ucm9vbUlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLlNldHRpbmdVcGRhdGVkOiB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChwYXlsb2FkLnNldHRpbmdOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJTcGFjZXMuYWxsUm9vbXNJbkhvbWVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3VmFsdWUgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiU3BhY2VzLmFsbFJvb21zSW5Ib21lXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuYWxsUm9vbXNJbkhvbWUgIT09IG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWxsUm9vbXNJbkhvbWUgPSBuZXdWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVtaXQoVVBEQVRFX0hPTUVfQkVIQVZJT1VSLCB0aGlzLmFsbFJvb21zSW5Ib21lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5lbmFibGVkTWV0YVNwYWNlcy5pbmNsdWRlcyhNZXRhU3BhY2UuSG9tZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWJ1aWxkSG9tZVNwYWNlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VuZFVzZXJQcm9wZXJ0aWVzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJTcGFjZXMuZW5hYmxlZE1ldGFTcGFjZXNcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3VmFsdWUgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiU3BhY2VzLmVuYWJsZWRNZXRhU3BhY2VzXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZW5hYmxlZE1ldGFTcGFjZXMgPSBtZXRhU3BhY2VPcmRlci5maWx0ZXIoayA9PiBuZXdWYWx1ZVtrXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXJyYXlIYXNEaWZmKHRoaXMuX2VuYWJsZWRNZXRhU3BhY2VzLCBlbmFibGVkTWV0YVNwYWNlcykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBoYWRQZW9wbGVPckhvbWVFbmFibGVkID0gdGhpcy5lbmFibGVkTWV0YVNwYWNlcy5zb21lKHMgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcyA9PT0gTWV0YVNwYWNlLkhvbWUgfHwgcyA9PT0gTWV0YVNwYWNlLlBlb3BsZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9lbmFibGVkTWV0YVNwYWNlcyA9IGVuYWJsZWRNZXRhU3BhY2VzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGhhc1Blb3BsZU9ySG9tZUVuYWJsZWQgPSB0aGlzLmVuYWJsZWRNZXRhU3BhY2VzLnNvbWUocyA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzID09PSBNZXRhU3BhY2UuSG9tZSB8fCBzID09PSBNZXRhU3BhY2UuUGVvcGxlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgYSBtZXRhc3BhY2UgY3VycmVudGx5IGJlaW5nIHZpZXdlZCB3YXMgcmVtb3ZlZCwgZ28gdG8gYW5vdGhlciBvbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNNZXRhU3BhY2UodGhpcy5hY3RpdmVTcGFjZSkgJiYgIW5ld1ZhbHVlW3RoaXMuYWN0aXZlU3BhY2VdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3dpdGNoU3BhY2VJZk5lZWRlZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlYnVpbGRNZXRhU3BhY2VzKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaGFkUGVvcGxlT3JIb21lRW5hYmxlZCAhPT0gaGFzUGVvcGxlT3JIb21lRW5hYmxlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpbiB0aGlzIGNhc2Ugd2UgaGF2ZSB0byByZWJ1aWxkIGV2ZXJ5dGhpbmcgYXMgRE0gYmFkZ2VzIHdpbGwgbW92ZSB0by9mcm9tIHJlYWwgc3BhY2VzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlTm90aWZpY2F0aW9uU3RhdGVzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVOb3RpZmljYXRpb25TdGF0ZXMoZW5hYmxlZE1ldGFTcGFjZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdChVUERBVEVfVE9QX0xFVkVMX1NQQUNFUywgdGhpcy5zcGFjZVBhbmVsU3BhY2VzLCB0aGlzLmVuYWJsZWRNZXRhU3BhY2VzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbmRVc2VyUHJvcGVydGllcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiU3BhY2VzLnNob3dQZW9wbGVJblNwYWNlXCI6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBnZXRTcGFjZUZpbHRlcmVkVXNlcklkcyB3aWxsIHJldHVybiB0aGUgYXBwcm9wcmlhdGUgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdChwYXlsb2FkLnJvb21JZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZW5hYmxlZE1ldGFTcGFjZXMuc29tZShzID0+IHMgPT09IE1ldGFTcGFjZS5Ib21lIHx8IHMgPT09IE1ldGFTcGFjZS5QZW9wbGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVOb3RpZmljYXRpb25TdGF0ZXMoW3BheWxvYWQucm9vbUlkXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0Tm90aWZpY2F0aW9uU3RhdGUoa2V5OiBTcGFjZUtleSk6IFNwYWNlTm90aWZpY2F0aW9uU3RhdGUge1xuICAgICAgICBpZiAodGhpcy5ub3RpZmljYXRpb25TdGF0ZU1hcC5oYXMoa2V5KSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubm90aWZpY2F0aW9uU3RhdGVNYXAuZ2V0KGtleSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzdGF0ZSA9IG5ldyBTcGFjZU5vdGlmaWNhdGlvblN0YXRlKGdldFJvb21Gbik7XG4gICAgICAgIHRoaXMubm90aWZpY2F0aW9uU3RhdGVNYXAuc2V0KGtleSwgc3RhdGUpO1xuICAgICAgICByZXR1cm4gc3RhdGU7XG4gICAgfVxuXG4gICAgLy8gdHJhdmVyc2Ugc3BhY2UgdHJlZSB3aXRoIERGUyBjYWxsaW5nIGZuIG9uIGVhY2ggc3BhY2UgaW5jbHVkaW5nIHRoZSBnaXZlbiByb290IG9uZSxcbiAgICAvLyBpZiBpbmNsdWRlUm9vbXMgaXMgdHJ1ZSB0aGVuIGZuIHdpbGwgYmUgY2FsbGVkIG9uIGVhY2ggbGVhZiByb29tLCBpZiBpdCBpcyBwcmVzZW50IGluIG11bHRpcGxlIHN1Yi1zcGFjZXNcbiAgICAvLyB0aGVuIGZuIHdpbGwgYmUgY2FsbGVkIHdpdGggaXQgbXVsdGlwbGUgdGltZXMuXG4gICAgcHVibGljIHRyYXZlcnNlU3BhY2UoXG4gICAgICAgIHNwYWNlSWQ6IHN0cmluZyxcbiAgICAgICAgZm46IChyb29tSWQ6IHN0cmluZykgPT4gdm9pZCxcbiAgICAgICAgaW5jbHVkZVJvb21zID0gZmFsc2UsXG4gICAgICAgIHBhcmVudFBhdGg/OiBTZXQ8c3RyaW5nPixcbiAgICApIHtcbiAgICAgICAgaWYgKHBhcmVudFBhdGggJiYgcGFyZW50UGF0aC5oYXMoc3BhY2VJZCkpIHJldHVybjsgLy8gcHJldmVudCBjeWNsZXNcblxuICAgICAgICBmbihzcGFjZUlkKTtcblxuICAgICAgICBjb25zdCBuZXdQYXRoID0gbmV3IFNldChwYXJlbnRQYXRoKS5hZGQoc3BhY2VJZCk7XG4gICAgICAgIGNvbnN0IFtjaGlsZFNwYWNlcywgY2hpbGRSb29tc10gPSBwYXJ0aXRpb25TcGFjZXNBbmRSb29tcyh0aGlzLmdldENoaWxkcmVuKHNwYWNlSWQpKTtcblxuICAgICAgICBpZiAoaW5jbHVkZVJvb21zKSB7XG4gICAgICAgICAgICBjaGlsZFJvb21zLmZvckVhY2gociA9PiBmbihyLnJvb21JZCkpO1xuICAgICAgICB9XG4gICAgICAgIGNoaWxkU3BhY2VzLmZvckVhY2gocyA9PiB0aGlzLnRyYXZlcnNlU3BhY2Uocy5yb29tSWQsIGZuLCBpbmNsdWRlUm9vbXMsIG5ld1BhdGgpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFNwYWNlVGFnT3JkZXJpbmcgPSAoc3BhY2U6IFJvb20pOiBzdHJpbmcgfCB1bmRlZmluZWQgPT4ge1xuICAgICAgICBpZiAodGhpcy5zcGFjZU9yZGVyTG9jYWxFY2hvTWFwLmhhcyhzcGFjZS5yb29tSWQpKSByZXR1cm4gdGhpcy5zcGFjZU9yZGVyTG9jYWxFY2hvTWFwLmdldChzcGFjZS5yb29tSWQpO1xuICAgICAgICByZXR1cm4gdmFsaWRPcmRlcihzcGFjZS5nZXRBY2NvdW50RGF0YShFdmVudFR5cGUuU3BhY2VPcmRlcik/LmdldENvbnRlbnQoKT8ub3JkZXIpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHNvcnRSb290U3BhY2VzKHNwYWNlczogUm9vbVtdKTogUm9vbVtdIHtcbiAgICAgICAgcmV0dXJuIHNvcnRCeShzcGFjZXMsIFt0aGlzLmdldFNwYWNlVGFnT3JkZXJpbmcsIFwicm9vbUlkXCJdKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHNldFJvb3RTcGFjZU9yZGVyKHNwYWNlOiBSb29tLCBvcmRlcjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHRoaXMuc3BhY2VPcmRlckxvY2FsRWNob01hcC5zZXQoc3BhY2Uucm9vbUlkLCBvcmRlcik7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLm1hdHJpeENsaWVudC5zZXRSb29tQWNjb3VudERhdGEoc3BhY2Uucm9vbUlkLCBFdmVudFR5cGUuU3BhY2VPcmRlciwgeyBvcmRlciB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oXCJGYWlsZWQgdG8gc2V0IHJvb3Qgc3BhY2Ugb3JkZXJcIiwgZSk7XG4gICAgICAgICAgICBpZiAodGhpcy5zcGFjZU9yZGVyTG9jYWxFY2hvTWFwLmdldChzcGFjZS5yb29tSWQpID09PSBvcmRlcikge1xuICAgICAgICAgICAgICAgIHRoaXMuc3BhY2VPcmRlckxvY2FsRWNob01hcC5kZWxldGUoc3BhY2Uucm9vbUlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBtb3ZlUm9vdFNwYWNlKGZyb21JbmRleDogbnVtYmVyLCB0b0luZGV4OiBudW1iZXIpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY3VycmVudE9yZGVycyA9IHRoaXMucm9vdFNwYWNlcy5tYXAodGhpcy5nZXRTcGFjZVRhZ09yZGVyaW5nKTtcbiAgICAgICAgY29uc3QgY2hhbmdlcyA9IHJlb3JkZXJMZXhpY29ncmFwaGljYWxseShjdXJyZW50T3JkZXJzLCBmcm9tSW5kZXgsIHRvSW5kZXgpO1xuXG4gICAgICAgIGNoYW5nZXMuZm9yRWFjaCgoeyBpbmRleCwgb3JkZXIgfSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRSb290U3BhY2VPcmRlcih0aGlzLnJvb3RTcGFjZXNbaW5kZXhdLCBvcmRlcik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMubm90aWZ5SWZPcmRlckNoYW5nZWQoKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNwYWNlU3RvcmUge1xuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IGludGVybmFsSW5zdGFuY2UgPSAoKCkgPT4ge1xuICAgICAgICBjb25zdCBpbnN0YW5jZSA9IG5ldyBTcGFjZVN0b3JlQ2xhc3MoKTtcbiAgICAgICAgaW5zdGFuY2Uuc3RhcnQoKTtcbiAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgIH0pKCk7XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldCBpbnN0YW5jZSgpOiBTcGFjZVN0b3JlQ2xhc3Mge1xuICAgICAgICByZXR1cm4gU3BhY2VTdG9yZS5pbnRlcm5hbEluc3RhbmNlO1xuICAgIH1cbn1cblxud2luZG93Lm14U3BhY2VTdG9yZSA9IFNwYWNlU3RvcmUuaW5zdGFuY2U7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUVBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQVdBOztBQUNBOztBQUNBOztBQU1BOzs7Ozs7QUFRQSxNQUFNQSxtQkFBbUIsR0FBRyxpQkFBNUI7QUFFQSxNQUFNQyxjQUEyQixHQUFHLENBQUNDLFdBQUEsQ0FBVUMsSUFBWCxFQUFpQkQsV0FBQSxDQUFVRSxVQUEzQixFQUF1Q0YsV0FBQSxDQUFVRyxNQUFqRCxFQUF5REgsV0FBQSxDQUFVSSxPQUFuRSxDQUFwQztBQUVBLE1BQU1DLG1CQUFtQixHQUFHLEVBQTVCOztBQUVBLE1BQU1DLGtCQUFrQixHQUFJQyxLQUFELElBQXNCLG9CQUFtQkEsS0FBTSxFQUExRTs7QUFFQSxNQUFNQyx1QkFBdUIsR0FBSUMsR0FBRCxJQUFtQztFQUFFO0VBQ2pFLE9BQU9BLEdBQUcsQ0FBQ0MsTUFBSixDQUFXLENBQUNDLE1BQUQsRUFBU0MsSUFBVCxLQUF3QjtJQUN0Q0QsTUFBTSxDQUFDQyxJQUFJLENBQUNDLFdBQUwsS0FBcUIsQ0FBckIsR0FBeUIsQ0FBMUIsQ0FBTixDQUFtQ0MsSUFBbkMsQ0FBd0NGLElBQXhDO0lBQ0EsT0FBT0QsTUFBUDtFQUNILENBSE0sRUFHSixDQUFDLEVBQUQsRUFBSyxFQUFMLENBSEksQ0FBUDtBQUlILENBTEQ7O0FBT0EsTUFBTUksVUFBVSxH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