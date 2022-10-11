"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OwnBeaconStoreEvent = exports.OwnBeaconStore = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _lodash = require("lodash");

var _matrix = require("matrix-js-sdk/src/matrix");

var _contentHelpers = require("matrix-js-sdk/src/content-helpers");

var _beacon = require("matrix-js-sdk/src/@types/beacon");

var _logger = require("matrix-js-sdk/src/logger");

var _dispatcher = _interopRequireDefault(require("../dispatcher/dispatcher"));

var _AsyncStoreWithClient = require("./AsyncStoreWithClient");

var _arrays = require("../utils/arrays");

var _beacon2 = require("../utils/beacon");

var _localRoom = require("../utils/local-room");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

const isOwnBeacon = (beacon, userId) => beacon.beaconInfoOwner === userId;

let OwnBeaconStoreEvent;
exports.OwnBeaconStoreEvent = OwnBeaconStoreEvent;

(function (OwnBeaconStoreEvent) {
  OwnBeaconStoreEvent["LivenessChange"] = "OwnBeaconStore.LivenessChange";
  OwnBeaconStoreEvent["MonitoringLivePosition"] = "OwnBeaconStore.MonitoringLivePosition";
  OwnBeaconStoreEvent["LocationPublishError"] = "LocationPublishError";
  OwnBeaconStoreEvent["BeaconUpdateError"] = "BeaconUpdateError";
})(OwnBeaconStoreEvent || (exports.OwnBeaconStoreEvent = OwnBeaconStoreEvent = {}));

const MOVING_UPDATE_INTERVAL = 5000;
const STATIC_UPDATE_INTERVAL = 30000;
const BAIL_AFTER_CONSECUTIVE_ERROR_COUNT = 2;
const CREATED_BEACONS_KEY = 'mx_live_beacon_created_id';

const removeLocallyCreateBeaconEventId = eventId => {
  const ids = getLocallyCreatedBeaconEventIds();
  window.localStorage.setItem(CREATED_BEACONS_KEY, JSON.stringify(ids.filter(id => id !== eventId)));
};

const storeLocallyCreateBeaconEventId = eventId => {
  const ids = getLocallyCreatedBeaconEventIds();
  window.localStorage.setItem(CREATED_BEACONS_KEY, JSON.stringify([...ids, eventId]));
};

const getLocallyCreatedBeaconEventIds = () => {
  let ids;

  try {
    ids = JSON.parse(window.localStorage.getItem(CREATED_BEACONS_KEY) ?? '[]');

    if (!Array.isArray(ids)) {
      throw new Error('Invalid stored value');
    }
  } catch (error) {
    _logger.logger.error('Failed to retrieve locally created beacon event ids', error);

    ids = [];
  }

  return ids;
};

class OwnBeaconStore extends _AsyncStoreWithClient.AsyncStoreWithClient {
  // users beacons, keyed by event type

  /**
   * Track over the wire errors for published positions
   * Counts consecutive wire errors per beacon
   * Reset on successful publish of location
   */

  /**
   * ids of live beacons
   * ordered by creation time descending
   */

  /**
   * Track when the last position was published
   * So we can manually get position on slow interval
   * when the target is stationary
   */
  constructor() {
    super(_dispatcher.default);
    (0, _defineProperty2.default)(this, "beacons", new Map());
    (0, _defineProperty2.default)(this, "beaconsByRoomId", new Map());
    (0, _defineProperty2.default)(this, "beaconLocationPublishErrorCounts", new Map());
    (0, _defineProperty2.default)(this, "beaconUpdateErrors", new Map());
    (0, _defineProperty2.default)(this, "liveBeaconIds", []);
    (0, _defineProperty2.default)(this, "locationInterval", void 0);
    (0, _defineProperty2.default)(this, "geolocationError", void 0);
    (0, _defineProperty2.default)(this, "clearPositionWatch", void 0);
    (0, _defineProperty2.default)(this, "lastPublishedPositionTimestamp", void 0);
    (0, _defineProperty2.default)(this, "hasLiveBeacons", roomId => {
      return !!this.getLiveBeaconIds(roomId).length;
    });
    (0, _defineProperty2.default)(this, "hasLocationPublishErrors", roomId => {
      return this.getLiveBeaconIds(roomId).some(this.beaconHasLocationPublishError);
    });
    (0, _defineProperty2.default)(this, "beaconHasLocationPublishError", beaconId => {
      return this.beaconLocationPublishErrorCounts.get(beaconId) >= BAIL_AFTER_CONSECUTIVE_ERROR_COUNT;
    });
    (0, _defineProperty2.default)(this, "resetLocationPublishError", beaconId => {
      this.incrementBeaconLocationPublishErrorCount(beaconId, false); // always publish to all live beacons together
      // instead of just one that was changed
      // to keep lastPublishedTimestamp simple
      // and extra published locations don't hurt

      this.publishCurrentLocationToBeacons();
    });
    (0, _defineProperty2.default)(this, "getLiveBeaconIds", roomId => {
      if (!roomId) {
        return this.liveBeaconIds;
      }

      return this.liveBeaconIds.filter(beaconId => this.beaconsByRoomId.get(roomId)?.has(beaconId));
    });
    (0, _defineProperty2.default)(this, "getLiveBeaconIdsWithLocationPublishError", roomId => {
      return this.getLiveBeaconIds(roomId).filter(this.beaconHasLocationPublishError);
    });
    (0, _defineProperty2.default)(this, "getBeaconById", beaconId => {
      return this.beacons.get(beaconId);
    });
    (0, _defineProperty2.default)(this, "stopBeacon", async beaconIdentifier => {
      const beacon = this.beacons.get(beaconIdentifier); // if no beacon, or beacon is already explicitly set isLive: false
      // do nothing

      if (!beacon?.beaconInfo?.live) {
        return;
      }

      await this.updateBeaconEvent(beacon, {
        live: false
      }); // prune from local store

      removeLocallyCreateBeaconEventId(beacon.beaconInfoId);
    });
    (0, _defineProperty2.default)(this, "onNewBeacon", (_event, beacon) => {
      if (!isOwnBeacon(beacon, this.matrixClient.getUserId())) {
        return;
      }

      this.addBeacon(beacon);
      this.checkLiveness();
    });
    (0, _defineProperty2.default)(this, "onUpdateBeacon", (_event, beacon) => {
      if (!isOwnBeacon(beacon, this.matrixClient.getUserId())) {
        return;
      }

      this.checkLiveness();
      beacon.monitorLiveness();
    });
    (0, _defineProperty2.default)(this, "onDestroyBeacon", beaconIdentifier => {
      // check if we care about this beacon
      if (!this.beacons.has(beaconIdentifier)) {
        return;
      }

      this.checkLiveness();
    });
    (0, _defineProperty2.default)(this, "onBeaconLiveness", (isLive, beacon) => {
      // check if we care about this beacon
      if (!this.beacons.has(beacon.identifier)) {
        return;
      } // beacon expired, update beacon to un-alive state


      if (!isLive) {
        this.stopBeacon(beacon.identifier);
      }

      this.checkLiveness();
      this.emit(OwnBeaconStoreEvent.LivenessChange, this.getLiveBeaconIds());
    });
    (0, _defineProperty2.default)(this, "onRoomStateMembers", (_event, roomState, member) => {
      // no beacons for this room, ignore
      if (!this.beaconsByRoomId.has(roomState.roomId) || member.userId !== this.matrixClient.getUserId()) {
        return;
      } // TODO check powerlevels here
      // in PSF-797
      // stop watching beacons in rooms where user is no longer a member


      if (member.membership === 'leave' || member.membership === 'ban') {
        this.beaconsByRoomId.get(roomState.roomId)?.forEach(this.removeBeacon);
        this.beaconsByRoomId.delete(roomState.roomId);
      }
    });
    (0, _defineProperty2.default)(this, "initialiseBeaconState", () => {
      const userId = this.matrixClient.getUserId();
      const visibleRooms = this.matrixClient.getVisibleRooms();
      visibleRooms.forEach(room => {
        const roomState = room.currentState;
        const beacons = roomState.beacons;
        const ownBeaconsArray = [...beacons.values()].filter(beacon => isOwnBeacon(beacon, userId));
        ownBeaconsArray.forEach(beacon => this.addBeacon(beacon));
      });
      this.checkLiveness();
    });
    (0, _defineProperty2.default)(this, "addBeacon", beacon => {
      this.beacons.set(beacon.identifier, beacon);

      if (!this.beaconsByRoomId.has(beacon.roomId)) {
        this.beaconsByRoomId.set(beacon.roomId, new Set());
      }

      this.beaconsByRoomId.get(beacon.roomId).add(beacon.identifier);
      beacon.monitorLiveness();
    });
    (0, _defineProperty2.default)(this, "removeBeacon", beaconId => {
      if (!this.beacons.has(beaconId)) {
        return;
      }

      this.beacons.get(beaconId).destroy();
      this.beacons.delete(beaconId);
      this.checkLiveness();
    });
    (0, _defineProperty2.default)(this, "checkLiveness", () => {
      const locallyCreatedBeaconEventIds = getLocallyCreatedBeaconEventIds();
      const prevLiveBeaconIds = this.getLiveBeaconIds();
      this.liveBeaconIds = [...this.beacons.values()].filter(beacon => beacon.isLive && // only beacons created on this device should be shared to
      locallyCreatedBeaconEventIds.includes(beacon.beaconInfoId)).sort(_beacon2.sortBeaconsByLatestCreation).map(beacon => beacon.identifier);
      const diff = (0, _arrays.arrayDiff)(prevLiveBeaconIds, this.liveBeaconIds);

      if (diff.added.length || diff.removed.length) {
        this.emit(OwnBeaconStoreEvent.LivenessChange, this.liveBeaconIds);
      } // publish current location immediately
      // when there are new live beacons
      // and we already have a live monitor
      // so first position is published quickly
      // even when target is stationary
      //
      // when there is no existing live monitor
      // it will be created below by togglePollingLocation
      // and publish first position quickly


      if (diff.added.length && this.isMonitoringLiveLocation) {
        this.publishCurrentLocationToBeacons();
      } // if overall liveness changed


      if (!!prevLiveBeaconIds?.length !== !!this.liveBeaconIds.length) {
        this.togglePollingLocation();
      }
    });
    (0, _defineProperty2.default)(this, "createLiveBeacon", async (roomId, beaconInfoContent) => {
      // explicitly stop any live beacons this user has
      // to ensure they remain stopped
      // if the new replacing beacon is redacted
      const existingLiveBeaconIdsForRoom = this.getLiveBeaconIds(roomId);
      await Promise.all(existingLiveBeaconIdsForRoom.map(beaconId => this.stopBeacon(beaconId))); // eslint-disable-next-line camelcase

      const {
        event_id
      } = await (0, _localRoom.doMaybeLocalRoomAction)(roomId, actualRoomId => this.matrixClient.unstable_createLiveBeacon(actualRoomId, beaconInfoContent), this.matrixClient);
      storeLocallyCreateBeaconEventId(event_id);
    });
    (0, _defineProperty2.default)(this, "togglePollingLocation", () => {
      if (!!this.liveBeaconIds.length) {
        this.startPollingLocation();
      } else {
        this.stopPollingLocation();
      }
    });
    (0, _defineProperty2.default)(this, "startPollingLocation", async () => {
      // clear any existing interval
      this.stopPollingLocation();

      try {
        this.clearPositionWatch = (0, _beacon2.watchPosition)(this.onWatchedPosition, this.onGeolocationError);
      } catch (error) {
        this.onGeolocationError(error?.message); // don't set locationInterval if geolocation failed to setup

        return;
      }

      this.locationInterval = setInterval(() => {
        if (!this.lastPublishedPositionTimestamp) {
          return;
        } // if position was last updated STATIC_UPDATE_INTERVAL ms ago or more
        // get our position and publish it


        if (this.lastPublishedPositionTimestamp <= Date.now() - STATIC_UPDATE_INTERVAL) {
          this.publishCurrentLocationToBeacons();
        }
      }, STATIC_UPDATE_INTERVAL);
      this.emit(OwnBeaconStoreEvent.MonitoringLivePosition);
    });
    (0, _defineProperty2.default)(this, "stopPollingLocation", () => {
      clearInterval(this.locationInterval);
      this.locationInterval = undefined;
      this.lastPublishedPositionTimestamp = undefined;
      this.geolocationError = undefined;

      if (this.clearPositionWatch) {
        this.clearPositionWatch();
        this.clearPositionWatch = undefined;
      }

      this.emit(OwnBeaconStoreEvent.MonitoringLivePosition);
    });
    (0, _defineProperty2.default)(this, "onWatchedPosition", position => {
      const timedGeoPosition = (0, _beacon2.mapGeolocationPositionToTimedGeo)(position); // if this is our first position, publish immediately

      if (!this.lastPublishedPositionTimestamp) {
        this.publishLocationToBeacons(timedGeoPosition);
      } else {
        this.debouncedPublishLocationToBeacons(timedGeoPosition);
      }
    });
    (0, _defineProperty2.default)(this, "onGeolocationError", async error => {
      this.geolocationError = error;

      _logger.logger.error('Geolocation failed', this.geolocationError); // other errors are considered non-fatal
      // and self recovering


      if (![_beacon2.GeolocationError.Unavailable, _beacon2.GeolocationError.PermissionDenied].includes(error)) {
        return;
      }

      this.stopPollingLocation(); // kill live beacons when location permissions are revoked

      await Promise.all(this.liveBeaconIds.map(this.stopBeacon));
    });
    (0, _defineProperty2.default)(this, "publishCurrentLocationToBeacons", async () => {
      try {
        const position = await (0, _beacon2.getCurrentPosition)();
        this.publishLocationToBeacons((0, _beacon2.mapGeolocationPositionToTimedGeo)(position));
      } catch (error) {
        this.onGeolocationError(error?.message);
      }
    });
    (0, _defineProperty2.default)(this, "updateBeaconEvent", async (beacon, update) => {
      const {
        description,
        timeout,
        timestamp,
        live,
        assetType
      } = _objectSpread(_objectSpread({}, beacon.beaconInfo), update);

      const updateContent = (0, _contentHelpers.makeBeaconInfoContent)(timeout, live, description, assetType, timestamp);

      try {
        await this.matrixClient.unstable_setLiveBeacon(beacon.roomId, updateContent); // cleanup any errors

        const hadError = this.beaconUpdateErrors.has(beacon.identifier);

        if (hadError) {
          this.beaconUpdateErrors.delete(beacon.identifier);
          this.emit(OwnBeaconStoreEvent.BeaconUpdateError, beacon.identifier, false);
        }
      } catch (error) {
        _logger.logger.error('Failed to update beacon', error);

        this.beaconUpdateErrors.set(beacon.identifier, error);
        this.emit(OwnBeaconStoreEvent.BeaconUpdateError, beacon.identifier, true);
        throw error;
      }
    });
    (0, _defineProperty2.default)(this, "publishLocationToBeacons", async position => {
      this.lastPublishedPositionTimestamp = Date.now();
      await Promise.all(this.healthyLiveBeaconIds.map(beaconId => this.sendLocationToBeacon(this.beacons.get(beaconId), position)));
    });
    (0, _defineProperty2.default)(this, "debouncedPublishLocationToBeacons", (0, _lodash.debounce)(this.publishLocationToBeacons, MOVING_UPDATE_INTERVAL));
    (0, _defineProperty2.default)(this, "sendLocationToBeacon", async (beacon, _ref) => {
      let {
        geoUri,
        timestamp
      } = _ref;
      const content = (0, _contentHelpers.makeBeaconContent)(geoUri, timestamp, beacon.beaconInfoId);

      try {
        await this.matrixClient.sendEvent(beacon.roomId, _beacon.M_BEACON.name, content);
        this.incrementBeaconLocationPublishErrorCount(beacon.identifier, false);
      } catch (error) {
        _logger.logger.error(error);

        this.incrementBeaconLocationPublishErrorCount(beacon.identifier, true);
      }
    });
    (0, _defineProperty2.default)(this, "incrementBeaconLocationPublishErrorCount", (beaconId, isError) => {
      const hadError = this.beaconHasLocationPublishError(beaconId);

      if (isError) {
        // increment error count
        this.beaconLocationPublishErrorCounts.set(beaconId, (this.beaconLocationPublishErrorCounts.get(beaconId) ?? 0) + 1);
      } else {
        // clear any error count
        this.beaconLocationPublishErrorCounts.delete(beaconId);
      }

      if (this.beaconHasLocationPublishError(beaconId) !== hadError) {
        this.emit(OwnBeaconStoreEvent.LocationPublishError, beaconId);
      }
    });
  }

  static get instance() {
    return OwnBeaconStore.internalInstance;
  }
  /**
   * True when we have live beacons
   * and geolocation.watchPosition is active
   */


  get isMonitoringLiveLocation() {
    return !!this.clearPositionWatch;
  }

  async onNotReady() {
    this.matrixClient.removeListener(_matrix.BeaconEvent.LivenessChange, this.onBeaconLiveness);
    this.matrixClient.removeListener(_matrix.BeaconEvent.New, this.onNewBeacon);
    this.matrixClient.removeListener(_matrix.BeaconEvent.Update, this.onUpdateBeacon);
    this.matrixClient.removeListener(_matrix.BeaconEvent.Destroy, this.onDestroyBeacon);
    this.matrixClient.removeListener(_matrix.RoomStateEvent.Members, this.onRoomStateMembers);
    this.beacons.forEach(beacon => beacon.destroy());
    this.stopPollingLocation();
    this.beacons.clear();
    this.beaconsByRoomId.clear();
    this.liveBeaconIds = [];
    this.beaconLocationPublishErrorCounts.clear();
    this.beaconUpdateErrors.clear();
  }

  async onReady() {
    this.matrixClient.on(_matrix.BeaconEvent.LivenessChange, this.onBeaconLiveness);
    this.matrixClient.on(_matrix.BeaconEvent.New, this.onNewBeacon);
    this.matrixClient.on(_matrix.BeaconEvent.Update, this.onUpdateBeacon);
    this.matrixClient.on(_matrix.BeaconEvent.Destroy, this.onDestroyBeacon);
    this.matrixClient.on(_matrix.RoomStateEvent.Members, this.onRoomStateMembers);
    this.initialiseBeaconState();
  }

  async onAction(payload) {// we don't actually do anything here
  }

  /**
   * State management
   */

  /**
   * Live beacon ids that do not have wire errors
   */
  get healthyLiveBeaconIds() {
    return this.liveBeaconIds.filter(beaconId => !this.beaconHasLocationPublishError(beaconId) && !this.beaconUpdateErrors.has(beaconId));
  }

}

exports.OwnBeaconStore = OwnBeaconStore;
(0, _defineProperty2.default)(OwnBeaconStore, "internalInstance", (() => {
  const instance = new OwnBeaconStore();
  instance.start();
  return instance;
})());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpc093bkJlYWNvbiIsImJlYWNvbiIsInVzZXJJZCIsImJlYWNvbkluZm9Pd25lciIsIk93bkJlYWNvblN0b3JlRXZlbnQiLCJNT1ZJTkdfVVBEQVRFX0lOVEVSVkFMIiwiU1RBVElDX1VQREFURV9JTlRFUlZBTCIsIkJBSUxfQUZURVJfQ09OU0VDVVRJVkVfRVJST1JfQ09VTlQiLCJDUkVBVEVEX0JFQUNPTlNfS0VZIiwicmVtb3ZlTG9jYWxseUNyZWF0ZUJlYWNvbkV2ZW50SWQiLCJldmVudElkIiwiaWRzIiwiZ2V0TG9jYWxseUNyZWF0ZWRCZWFjb25FdmVudElkcyIsIndpbmRvdyIsImxvY2FsU3RvcmFnZSIsInNldEl0ZW0iLCJKU09OIiwic3RyaW5naWZ5IiwiZmlsdGVyIiwiaWQiLCJzdG9yZUxvY2FsbHlDcmVhdGVCZWFjb25FdmVudElkIiwicGFyc2UiLCJnZXRJdGVtIiwiQXJyYXkiLCJpc0FycmF5IiwiRXJyb3IiLCJlcnJvciIsImxvZ2dlciIsIk93bkJlYWNvblN0b3JlIiwiQXN5bmNTdG9yZVdpdGhDbGllbnQiLCJjb25zdHJ1Y3RvciIsImRlZmF1bHREaXNwYXRjaGVyIiwiTWFwIiwicm9vbUlkIiwiZ2V0TGl2ZUJlYWNvbklkcyIsImxlbmd0aCIsInNvbWUiLCJiZWFjb25IYXNMb2NhdGlvblB1Ymxpc2hFcnJvciIsImJlYWNvbklkIiwiYmVhY29uTG9jYXRpb25QdWJsaXNoRXJyb3JDb3VudHMiLCJnZXQiLCJpbmNyZW1lbnRCZWFjb25Mb2NhdGlvblB1Ymxpc2hFcnJvckNvdW50IiwicHVibGlzaEN1cnJlbnRMb2NhdGlvblRvQmVhY29ucyIsImxpdmVCZWFjb25JZHMiLCJiZWFjb25zQnlSb29tSWQiLCJoYXMiLCJiZWFjb25zIiwiYmVhY29uSWRlbnRpZmllciIsImJlYWNvbkluZm8iLCJsaXZlIiwidXBkYXRlQmVhY29uRXZlbnQiLCJiZWFjb25JbmZvSWQiLCJfZXZlbnQiLCJtYXRyaXhDbGllbnQiLCJnZXRVc2VySWQiLCJhZGRCZWFjb24iLCJjaGVja0xpdmVuZXNzIiwibW9uaXRvckxpdmVuZXNzIiwiaXNMaXZlIiwiaWRlbnRpZmllciIsInN0b3BCZWFjb24iLCJlbWl0IiwiTGl2ZW5lc3NDaGFuZ2UiLCJyb29tU3RhdGUiLCJtZW1iZXIiLCJtZW1iZXJzaGlwIiwiZm9yRWFjaCIsInJlbW92ZUJlYWNvbiIsImRlbGV0ZSIsInZpc2libGVSb29tcyIsImdldFZpc2libGVSb29tcyIsInJvb20iLCJjdXJyZW50U3RhdGUiLCJvd25CZWFjb25zQXJyYXkiLCJ2YWx1ZXMiLCJzZXQiLCJTZXQiLCJhZGQiLCJkZXN0cm95IiwibG9jYWxseUNyZWF0ZWRCZWFjb25FdmVudElkcyIsInByZXZMaXZlQmVhY29uSWRzIiwiaW5jbHVkZXMiLCJzb3J0Iiwic29ydEJlYWNvbnNCeUxhdGVzdENyZWF0aW9uIiwibWFwIiwiZGlmZiIsImFycmF5RGlmZiIsImFkZGVkIiwicmVtb3ZlZCIsImlzTW9uaXRvcmluZ0xpdmVMb2NhdGlvbiIsInRvZ2dsZVBvbGxpbmdMb2NhdGlvbiIsImJlYWNvbkluZm9Db250ZW50IiwiZXhpc3RpbmdMaXZlQmVhY29uSWRzRm9yUm9vbSIsIlByb21pc2UiLCJhbGwiLCJldmVudF9pZCIsImRvTWF5YmVMb2NhbFJvb21BY3Rpb24iLCJhY3R1YWxSb29tSWQiLCJ1bnN0YWJsZV9jcmVhdGVMaXZlQmVhY29uIiwic3RhcnRQb2xsaW5nTG9jYXRpb24iLCJzdG9wUG9sbGluZ0xvY2F0aW9uIiwiY2xlYXJQb3NpdGlvbldhdGNoIiwid2F0Y2hQb3NpdGlvbiIsIm9uV2F0Y2hlZFBvc2l0aW9uIiwib25HZW9sb2NhdGlvbkVycm9yIiwibWVzc2FnZSIsImxvY2F0aW9uSW50ZXJ2YWwiLCJzZXRJbnRlcnZhbCIsImxhc3RQdWJsaXNoZWRQb3NpdGlvblRpbWVzdGFtcCIsIkRhdGUiLCJub3ciLCJNb25pdG9yaW5nTGl2ZVBvc2l0aW9uIiwiY2xlYXJJbnRlcnZhbCIsInVuZGVmaW5lZCIsImdlb2xvY2F0aW9uRXJyb3IiLCJwb3NpdGlvbiIsInRpbWVkR2VvUG9zaXRpb24iLCJtYXBHZW9sb2NhdGlvblBvc2l0aW9uVG9UaW1lZEdlbyIsInB1Ymxpc2hMb2NhdGlvblRvQmVhY29ucyIsImRlYm91bmNlZFB1Ymxpc2hMb2NhdGlvblRvQmVhY29ucyIsIkdlb2xvY2F0aW9uRXJyb3IiLCJVbmF2YWlsYWJsZSIsIlBlcm1pc3Npb25EZW5pZWQiLCJnZXRDdXJyZW50UG9zaXRpb24iLCJ1cGRhdGUiLCJkZXNjcmlwdGlvbiIsInRpbWVvdXQiLCJ0aW1lc3RhbXAiLCJhc3NldFR5cGUiLCJ1cGRhdGVDb250ZW50IiwibWFrZUJlYWNvbkluZm9Db250ZW50IiwidW5zdGFibGVfc2V0TGl2ZUJlYWNvbiIsImhhZEVycm9yIiwiYmVhY29uVXBkYXRlRXJyb3JzIiwiQmVhY29uVXBkYXRlRXJyb3IiLCJoZWFsdGh5TGl2ZUJlYWNvbklkcyIsInNlbmRMb2NhdGlvblRvQmVhY29uIiwiZGVib3VuY2UiLCJnZW9VcmkiLCJjb250ZW50IiwibWFrZUJlYWNvbkNvbnRlbnQiLCJzZW5kRXZlbnQiLCJNX0JFQUNPTiIsIm5hbWUiLCJpc0Vycm9yIiwiTG9jYXRpb25QdWJsaXNoRXJyb3IiLCJpbnN0YW5jZSIsImludGVybmFsSW5zdGFuY2UiLCJvbk5vdFJlYWR5IiwicmVtb3ZlTGlzdGVuZXIiLCJCZWFjb25FdmVudCIsIm9uQmVhY29uTGl2ZW5lc3MiLCJOZXciLCJvbk5ld0JlYWNvbiIsIlVwZGF0ZSIsIm9uVXBkYXRlQmVhY29uIiwiRGVzdHJveSIsIm9uRGVzdHJveUJlYWNvbiIsIlJvb21TdGF0ZUV2ZW50IiwiTWVtYmVycyIsIm9uUm9vbVN0YXRlTWVtYmVycyIsImNsZWFyIiwib25SZWFkeSIsIm9uIiwiaW5pdGlhbGlzZUJlYWNvblN0YXRlIiwib25BY3Rpb24iLCJwYXlsb2FkIiwic3RhcnQiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RvcmVzL093bkJlYWNvblN0b3JlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7IGRlYm91bmNlIH0gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHtcbiAgICBCZWFjb24sXG4gICAgQmVhY29uSWRlbnRpZmllcixcbiAgICBCZWFjb25FdmVudCxcbiAgICBNYXRyaXhFdmVudCxcbiAgICBSb29tLFxuICAgIFJvb21NZW1iZXIsXG4gICAgUm9vbVN0YXRlLFxuICAgIFJvb21TdGF0ZUV2ZW50LFxufSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbWF0cml4XCI7XG5pbXBvcnQge1xuICAgIEJlYWNvbkluZm9TdGF0ZSwgbWFrZUJlYWNvbkNvbnRlbnQsIG1ha2VCZWFjb25JbmZvQ29udGVudCxcbn0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NvbnRlbnQtaGVscGVyc1wiO1xuaW1wb3J0IHsgTUJlYWNvbkluZm9FdmVudENvbnRlbnQsIE1fQkVBQ09OIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9iZWFjb25cIjtcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcblxuaW1wb3J0IGRlZmF1bHREaXNwYXRjaGVyIGZyb20gXCIuLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCB7IEFjdGlvblBheWxvYWQgfSBmcm9tIFwiLi4vZGlzcGF0Y2hlci9wYXlsb2Fkc1wiO1xuaW1wb3J0IHsgQXN5bmNTdG9yZVdpdGhDbGllbnQgfSBmcm9tIFwiLi9Bc3luY1N0b3JlV2l0aENsaWVudFwiO1xuaW1wb3J0IHsgYXJyYXlEaWZmIH0gZnJvbSBcIi4uL3V0aWxzL2FycmF5c1wiO1xuaW1wb3J0IHtcbiAgICBDbGVhcldhdGNoQ2FsbGJhY2ssXG4gICAgR2VvbG9jYXRpb25FcnJvcixcbiAgICBtYXBHZW9sb2NhdGlvblBvc2l0aW9uVG9UaW1lZEdlbyxcbiAgICBzb3J0QmVhY29uc0J5TGF0ZXN0Q3JlYXRpb24sXG4gICAgVGltZWRHZW9VcmksXG4gICAgd2F0Y2hQb3NpdGlvbixcbn0gZnJvbSBcIi4uL3V0aWxzL2JlYWNvblwiO1xuaW1wb3J0IHsgZ2V0Q3VycmVudFBvc2l0aW9uIH0gZnJvbSBcIi4uL3V0aWxzL2JlYWNvblwiO1xuaW1wb3J0IHsgZG9NYXliZUxvY2FsUm9vbUFjdGlvbiB9IGZyb20gXCIuLi91dGlscy9sb2NhbC1yb29tXCI7XG5cbmNvbnN0IGlzT3duQmVhY29uID0gKGJlYWNvbjogQmVhY29uLCB1c2VySWQ6IHN0cmluZyk6IGJvb2xlYW4gPT4gYmVhY29uLmJlYWNvbkluZm9Pd25lciA9PT0gdXNlcklkO1xuXG5leHBvcnQgZW51bSBPd25CZWFjb25TdG9yZUV2ZW50IHtcbiAgICBMaXZlbmVzc0NoYW5nZSA9ICdPd25CZWFjb25TdG9yZS5MaXZlbmVzc0NoYW5nZScsXG4gICAgTW9uaXRvcmluZ0xpdmVQb3NpdGlvbiA9ICdPd25CZWFjb25TdG9yZS5Nb25pdG9yaW5nTGl2ZVBvc2l0aW9uJyxcbiAgICBMb2NhdGlvblB1Ymxpc2hFcnJvciA9ICdMb2NhdGlvblB1Ymxpc2hFcnJvcicsXG4gICAgQmVhY29uVXBkYXRlRXJyb3IgPSAnQmVhY29uVXBkYXRlRXJyb3InLFxufVxuXG5jb25zdCBNT1ZJTkdfVVBEQVRFX0lOVEVSVkFMID0gNTAwMDtcbmNvbnN0IFNUQVRJQ19VUERBVEVfSU5URVJWQUwgPSAzMDAwMDtcblxuY29uc3QgQkFJTF9BRlRFUl9DT05TRUNVVElWRV9FUlJPUl9DT1VOVCA9IDI7XG5cbnR5cGUgT3duQmVhY29uU3RvcmVTdGF0ZSA9IHtcbiAgICBiZWFjb25zOiBNYXA8QmVhY29uSWRlbnRpZmllciwgQmVhY29uPjtcbiAgICBiZWFjb25Mb2NhdGlvblB1Ymxpc2hFcnJvckNvdW50czogTWFwPEJlYWNvbklkZW50aWZpZXIsIG51bWJlcj47XG4gICAgYmVhY29uVXBkYXRlRXJyb3JzOiBNYXA8QmVhY29uSWRlbnRpZmllciwgRXJyb3I+O1xuICAgIGJlYWNvbnNCeVJvb21JZDogTWFwPFJvb21bJ3Jvb21JZCddLCBTZXQ8QmVhY29uSWRlbnRpZmllcj4+O1xuICAgIGxpdmVCZWFjb25JZHM6IEJlYWNvbklkZW50aWZpZXJbXTtcbn07XG5cbmNvbnN0IENSRUFURURfQkVBQ09OU19LRVkgPSAnbXhfbGl2ZV9iZWFjb25fY3JlYXRlZF9pZCc7XG5jb25zdCByZW1vdmVMb2NhbGx5Q3JlYXRlQmVhY29uRXZlbnRJZCA9IChldmVudElkOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICBjb25zdCBpZHMgPSBnZXRMb2NhbGx5Q3JlYXRlZEJlYWNvbkV2ZW50SWRzKCk7XG4gICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKENSRUFURURfQkVBQ09OU19LRVksIEpTT04uc3RyaW5naWZ5KGlkcy5maWx0ZXIoaWQgPT4gaWQgIT09IGV2ZW50SWQpKSk7XG59O1xuY29uc3Qgc3RvcmVMb2NhbGx5Q3JlYXRlQmVhY29uRXZlbnRJZCA9IChldmVudElkOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICBjb25zdCBpZHMgPSBnZXRMb2NhbGx5Q3JlYXRlZEJlYWNvbkV2ZW50SWRzKCk7XG4gICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKENSRUFURURfQkVBQ09OU19LRVksIEpTT04uc3RyaW5naWZ5KFsuLi5pZHMsIGV2ZW50SWRdKSk7XG59O1xuXG5jb25zdCBnZXRMb2NhbGx5Q3JlYXRlZEJlYWNvbkV2ZW50SWRzID0gKCk6IHN0cmluZ1tdID0+IHtcbiAgICBsZXQgaWRzOiBzdHJpbmdbXTtcbiAgICB0cnkge1xuICAgICAgICBpZHMgPSBKU09OLnBhcnNlKHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShDUkVBVEVEX0JFQUNPTlNfS0VZKSA/PyAnW10nKTtcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGlkcykpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdG9yZWQgdmFsdWUnKTtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGxvZ2dlci5lcnJvcignRmFpbGVkIHRvIHJldHJpZXZlIGxvY2FsbHkgY3JlYXRlZCBiZWFjb24gZXZlbnQgaWRzJywgZXJyb3IpO1xuICAgICAgICBpZHMgPSBbXTtcbiAgICB9XG4gICAgcmV0dXJuIGlkcztcbn07XG5leHBvcnQgY2xhc3MgT3duQmVhY29uU3RvcmUgZXh0ZW5kcyBBc3luY1N0b3JlV2l0aENsaWVudDxPd25CZWFjb25TdG9yZVN0YXRlPiB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgaW50ZXJuYWxJbnN0YW5jZSA9ICgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGluc3RhbmNlID0gbmV3IE93bkJlYWNvblN0b3JlKCk7XG4gICAgICAgIGluc3RhbmNlLnN0YXJ0KCk7XG4gICAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICB9KSgpO1xuICAgIC8vIHVzZXJzIGJlYWNvbnMsIGtleWVkIGJ5IGV2ZW50IHR5cGVcbiAgICBwdWJsaWMgcmVhZG9ubHkgYmVhY29ucyA9IG5ldyBNYXA8QmVhY29uSWRlbnRpZmllciwgQmVhY29uPigpO1xuICAgIHB1YmxpYyByZWFkb25seSBiZWFjb25zQnlSb29tSWQgPSBuZXcgTWFwPFJvb21bJ3Jvb21JZCddLCBTZXQ8QmVhY29uSWRlbnRpZmllcj4+KCk7XG4gICAgLyoqXG4gICAgICogVHJhY2sgb3ZlciB0aGUgd2lyZSBlcnJvcnMgZm9yIHB1Ymxpc2hlZCBwb3NpdGlvbnNcbiAgICAgKiBDb3VudHMgY29uc2VjdXRpdmUgd2lyZSBlcnJvcnMgcGVyIGJlYWNvblxuICAgICAqIFJlc2V0IG9uIHN1Y2Nlc3NmdWwgcHVibGlzaCBvZiBsb2NhdGlvblxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkb25seSBiZWFjb25Mb2NhdGlvblB1Ymxpc2hFcnJvckNvdW50cyA9IG5ldyBNYXA8QmVhY29uSWRlbnRpZmllciwgbnVtYmVyPigpO1xuICAgIHB1YmxpYyByZWFkb25seSBiZWFjb25VcGRhdGVFcnJvcnMgPSBuZXcgTWFwPEJlYWNvbklkZW50aWZpZXIsIEVycm9yPigpO1xuICAgIC8qKlxuICAgICAqIGlkcyBvZiBsaXZlIGJlYWNvbnNcbiAgICAgKiBvcmRlcmVkIGJ5IGNyZWF0aW9uIHRpbWUgZGVzY2VuZGluZ1xuICAgICAqL1xuICAgIHByaXZhdGUgbGl2ZUJlYWNvbklkczogQmVhY29uSWRlbnRpZmllcltdID0gW107XG4gICAgcHJpdmF0ZSBsb2NhdGlvbkludGVydmFsOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBnZW9sb2NhdGlvbkVycm9yOiBHZW9sb2NhdGlvbkVycm9yIHwgdW5kZWZpbmVkO1xuICAgIHByaXZhdGUgY2xlYXJQb3NpdGlvbldhdGNoOiBDbGVhcldhdGNoQ2FsbGJhY2sgfCB1bmRlZmluZWQ7XG4gICAgLyoqXG4gICAgICogVHJhY2sgd2hlbiB0aGUgbGFzdCBwb3NpdGlvbiB3YXMgcHVibGlzaGVkXG4gICAgICogU28gd2UgY2FuIG1hbnVhbGx5IGdldCBwb3NpdGlvbiBvbiBzbG93IGludGVydmFsXG4gICAgICogd2hlbiB0aGUgdGFyZ2V0IGlzIHN0YXRpb25hcnlcbiAgICAgKi9cbiAgICBwcml2YXRlIGxhc3RQdWJsaXNoZWRQb3NpdGlvblRpbWVzdGFtcDogbnVtYmVyIHwgdW5kZWZpbmVkO1xuXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcihkZWZhdWx0RGlzcGF0Y2hlcik7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBnZXQgaW5zdGFuY2UoKTogT3duQmVhY29uU3RvcmUge1xuICAgICAgICByZXR1cm4gT3duQmVhY29uU3RvcmUuaW50ZXJuYWxJbnN0YW5jZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcnVlIHdoZW4gd2UgaGF2ZSBsaXZlIGJlYWNvbnNcbiAgICAgKiBhbmQgZ2VvbG9jYXRpb24ud2F0Y2hQb3NpdGlvbiBpcyBhY3RpdmVcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGlzTW9uaXRvcmluZ0xpdmVMb2NhdGlvbigpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5jbGVhclBvc2l0aW9uV2F0Y2g7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGFzeW5jIG9uTm90UmVhZHkoKSB7XG4gICAgICAgIHRoaXMubWF0cml4Q2xpZW50LnJlbW92ZUxpc3RlbmVyKEJlYWNvbkV2ZW50LkxpdmVuZXNzQ2hhbmdlLCB0aGlzLm9uQmVhY29uTGl2ZW5lc3MpO1xuICAgICAgICB0aGlzLm1hdHJpeENsaWVudC5yZW1vdmVMaXN0ZW5lcihCZWFjb25FdmVudC5OZXcsIHRoaXMub25OZXdCZWFjb24pO1xuICAgICAgICB0aGlzLm1hdHJpeENsaWVudC5yZW1vdmVMaXN0ZW5lcihCZWFjb25FdmVudC5VcGRhdGUsIHRoaXMub25VcGRhdGVCZWFjb24pO1xuICAgICAgICB0aGlzLm1hdHJpeENsaWVudC5yZW1vdmVMaXN0ZW5lcihCZWFjb25FdmVudC5EZXN0cm95LCB0aGlzLm9uRGVzdHJveUJlYWNvbik7XG4gICAgICAgIHRoaXMubWF0cml4Q2xpZW50LnJlbW92ZUxpc3RlbmVyKFJvb21TdGF0ZUV2ZW50Lk1lbWJlcnMsIHRoaXMub25Sb29tU3RhdGVNZW1iZXJzKTtcblxuICAgICAgICB0aGlzLmJlYWNvbnMuZm9yRWFjaChiZWFjb24gPT4gYmVhY29uLmRlc3Ryb3koKSk7XG5cbiAgICAgICAgdGhpcy5zdG9wUG9sbGluZ0xvY2F0aW9uKCk7XG4gICAgICAgIHRoaXMuYmVhY29ucy5jbGVhcigpO1xuICAgICAgICB0aGlzLmJlYWNvbnNCeVJvb21JZC5jbGVhcigpO1xuICAgICAgICB0aGlzLmxpdmVCZWFjb25JZHMgPSBbXTtcbiAgICAgICAgdGhpcy5iZWFjb25Mb2NhdGlvblB1Ymxpc2hFcnJvckNvdW50cy5jbGVhcigpO1xuICAgICAgICB0aGlzLmJlYWNvblVwZGF0ZUVycm9ycy5jbGVhcigpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBhc3luYyBvblJlYWR5KCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0aGlzLm1hdHJpeENsaWVudC5vbihCZWFjb25FdmVudC5MaXZlbmVzc0NoYW5nZSwgdGhpcy5vbkJlYWNvbkxpdmVuZXNzKTtcbiAgICAgICAgdGhpcy5tYXRyaXhDbGllbnQub24oQmVhY29uRXZlbnQuTmV3LCB0aGlzLm9uTmV3QmVhY29uKTtcbiAgICAgICAgdGhpcy5tYXRyaXhDbGllbnQub24oQmVhY29uRXZlbnQuVXBkYXRlLCB0aGlzLm9uVXBkYXRlQmVhY29uKTtcbiAgICAgICAgdGhpcy5tYXRyaXhDbGllbnQub24oQmVhY29uRXZlbnQuRGVzdHJveSwgdGhpcy5vbkRlc3Ryb3lCZWFjb24pO1xuICAgICAgICB0aGlzLm1hdHJpeENsaWVudC5vbihSb29tU3RhdGVFdmVudC5NZW1iZXJzLCB0aGlzLm9uUm9vbVN0YXRlTWVtYmVycyk7XG5cbiAgICAgICAgdGhpcy5pbml0aWFsaXNlQmVhY29uU3RhdGUoKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYXN5bmMgb25BY3Rpb24ocGF5bG9hZDogQWN0aW9uUGF5bG9hZCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICAvLyB3ZSBkb24ndCBhY3R1YWxseSBkbyBhbnl0aGluZyBoZXJlXG4gICAgfVxuXG4gICAgcHVibGljIGhhc0xpdmVCZWFjb25zID0gKHJvb21JZD86IHN0cmluZyk6IGJvb2xlYW4gPT4ge1xuICAgICAgICByZXR1cm4gISF0aGlzLmdldExpdmVCZWFjb25JZHMocm9vbUlkKS5sZW5ndGg7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNvbWUgbGl2ZSBiZWFjb24gaGFzIGEgd2lyZSBlcnJvclxuICAgICAqIE9wdGlvbmFsbHkgZmlsdGVyIGJ5IHJvb21cbiAgICAgKi9cbiAgICBwdWJsaWMgaGFzTG9jYXRpb25QdWJsaXNoRXJyb3JzID0gKHJvb21JZD86IHN0cmluZyk6IGJvb2xlYW4gPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRMaXZlQmVhY29uSWRzKHJvb21JZCkuc29tZSh0aGlzLmJlYWNvbkhhc0xvY2F0aW9uUHVibGlzaEVycm9yKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSWYgYSBiZWFjb24gaGFzIGZhaWxlZCB0byBwdWJsaXNoIHBvc2l0aW9uXG4gICAgICogcGFzdCB0aGUgYWxsb3dlZCBjb25zZWN1dGl2ZSBmYWlsdXJlIGNvdW50IChCQUlMX0FGVEVSX0NPTlNFQ1VUSVZFX0VSUk9SX0NPVU5UKVxuICAgICAqIFRoZW4gY29uc2lkZXIgaXQgdG8gaGF2ZSBhbiBlcnJvclxuICAgICAqL1xuICAgIHB1YmxpYyBiZWFjb25IYXNMb2NhdGlvblB1Ymxpc2hFcnJvciA9IChiZWFjb25JZDogc3RyaW5nKTogYm9vbGVhbiA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmJlYWNvbkxvY2F0aW9uUHVibGlzaEVycm9yQ291bnRzLmdldChiZWFjb25JZCkgPj0gQkFJTF9BRlRFUl9DT05TRUNVVElWRV9FUlJPUl9DT1VOVDtcbiAgICB9O1xuXG4gICAgcHVibGljIHJlc2V0TG9jYXRpb25QdWJsaXNoRXJyb3IgPSAoYmVhY29uSWQ6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLmluY3JlbWVudEJlYWNvbkxvY2F0aW9uUHVibGlzaEVycm9yQ291bnQoYmVhY29uSWQsIGZhbHNlKTtcblxuICAgICAgICAvLyBhbHdheXMgcHVibGlzaCB0byBhbGwgbGl2ZSBiZWFjb25zIHRvZ2V0aGVyXG4gICAgICAgIC8vIGluc3RlYWQgb2YganVzdCBvbmUgdGhhdCB3YXMgY2hhbmdlZFxuICAgICAgICAvLyB0byBrZWVwIGxhc3RQdWJsaXNoZWRUaW1lc3RhbXAgc2ltcGxlXG4gICAgICAgIC8vIGFuZCBleHRyYSBwdWJsaXNoZWQgbG9jYXRpb25zIGRvbid0IGh1cnRcbiAgICAgICAgdGhpcy5wdWJsaXNoQ3VycmVudExvY2F0aW9uVG9CZWFjb25zKCk7XG4gICAgfTtcblxuICAgIHB1YmxpYyBnZXRMaXZlQmVhY29uSWRzID0gKHJvb21JZD86IHN0cmluZyk6IHN0cmluZ1tdID0+IHtcbiAgICAgICAgaWYgKCFyb29tSWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxpdmVCZWFjb25JZHM7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMubGl2ZUJlYWNvbklkcy5maWx0ZXIoYmVhY29uSWQgPT4gdGhpcy5iZWFjb25zQnlSb29tSWQuZ2V0KHJvb21JZCk/LmhhcyhiZWFjb25JZCkpO1xuICAgIH07XG5cbiAgICBwdWJsaWMgZ2V0TGl2ZUJlYWNvbklkc1dpdGhMb2NhdGlvblB1Ymxpc2hFcnJvciA9IChyb29tSWQ/OiBzdHJpbmcpOiBzdHJpbmdbXSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldExpdmVCZWFjb25JZHMocm9vbUlkKS5maWx0ZXIodGhpcy5iZWFjb25IYXNMb2NhdGlvblB1Ymxpc2hFcnJvcik7XG4gICAgfTtcblxuICAgIHB1YmxpYyBnZXRCZWFjb25CeUlkID0gKGJlYWNvbklkOiBzdHJpbmcpOiBCZWFjb24gfCB1bmRlZmluZWQgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5iZWFjb25zLmdldChiZWFjb25JZCk7XG4gICAgfTtcblxuICAgIHB1YmxpYyBzdG9wQmVhY29uID0gYXN5bmMgKGJlYWNvbklkZW50aWZpZXI6IHN0cmluZyk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICBjb25zdCBiZWFjb24gPSB0aGlzLmJlYWNvbnMuZ2V0KGJlYWNvbklkZW50aWZpZXIpO1xuICAgICAgICAvLyBpZiBubyBiZWFjb24sIG9yIGJlYWNvbiBpcyBhbHJlYWR5IGV4cGxpY2l0bHkgc2V0IGlzTGl2ZTogZmFsc2VcbiAgICAgICAgLy8gZG8gbm90aGluZ1xuICAgICAgICBpZiAoIWJlYWNvbj8uYmVhY29uSW5mbz8ubGl2ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgYXdhaXQgdGhpcy51cGRhdGVCZWFjb25FdmVudChiZWFjb24sIHsgbGl2ZTogZmFsc2UgfSk7XG4gICAgICAgIC8vIHBydW5lIGZyb20gbG9jYWwgc3RvcmVcbiAgICAgICAgcmVtb3ZlTG9jYWxseUNyZWF0ZUJlYWNvbkV2ZW50SWQoYmVhY29uLmJlYWNvbkluZm9JZCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIExpc3RlbmVyc1xuICAgICAqL1xuXG4gICAgcHJpdmF0ZSBvbk5ld0JlYWNvbiA9IChfZXZlbnQ6IE1hdHJpeEV2ZW50LCBiZWFjb246IEJlYWNvbik6IHZvaWQgPT4ge1xuICAgICAgICBpZiAoIWlzT3duQmVhY29uKGJlYWNvbiwgdGhpcy5tYXRyaXhDbGllbnQuZ2V0VXNlcklkKCkpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hZGRCZWFjb24oYmVhY29uKTtcbiAgICAgICAgdGhpcy5jaGVja0xpdmVuZXNzKCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFRoaXMgd2lsbCBiZSBjYWxsZWQgd2hlbiBhIGJlYWNvbiBpcyByZXBsYWNlZFxuICAgICAqL1xuICAgIHByaXZhdGUgb25VcGRhdGVCZWFjb24gPSAoX2V2ZW50OiBNYXRyaXhFdmVudCwgYmVhY29uOiBCZWFjb24pOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKCFpc093bkJlYWNvbihiZWFjb24sIHRoaXMubWF0cml4Q2xpZW50LmdldFVzZXJJZCgpKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jaGVja0xpdmVuZXNzKCk7XG4gICAgICAgIGJlYWNvbi5tb25pdG9yTGl2ZW5lc3MoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkRlc3Ryb3lCZWFjb24gPSAoYmVhY29uSWRlbnRpZmllcjogQmVhY29uSWRlbnRpZmllcik6IHZvaWQgPT4ge1xuICAgICAgICAvLyBjaGVjayBpZiB3ZSBjYXJlIGFib3V0IHRoaXMgYmVhY29uXG4gICAgICAgIGlmICghdGhpcy5iZWFjb25zLmhhcyhiZWFjb25JZGVudGlmaWVyKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jaGVja0xpdmVuZXNzKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25CZWFjb25MaXZlbmVzcyA9IChpc0xpdmU6IGJvb2xlYW4sIGJlYWNvbjogQmVhY29uKTogdm9pZCA9PiB7XG4gICAgICAgIC8vIGNoZWNrIGlmIHdlIGNhcmUgYWJvdXQgdGhpcyBiZWFjb25cbiAgICAgICAgaWYgKCF0aGlzLmJlYWNvbnMuaGFzKGJlYWNvbi5pZGVudGlmaWVyKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gYmVhY29uIGV4cGlyZWQsIHVwZGF0ZSBiZWFjb24gdG8gdW4tYWxpdmUgc3RhdGVcbiAgICAgICAgaWYgKCFpc0xpdmUpIHtcbiAgICAgICAgICAgIHRoaXMuc3RvcEJlYWNvbihiZWFjb24uaWRlbnRpZmllcik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNoZWNrTGl2ZW5lc3MoKTtcblxuICAgICAgICB0aGlzLmVtaXQoT3duQmVhY29uU3RvcmVFdmVudC5MaXZlbmVzc0NoYW5nZSwgdGhpcy5nZXRMaXZlQmVhY29uSWRzKCkpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBmb3IgY2hhbmdlcyBpbiBtZW1iZXJzaGlwIGluIHJvb21zIHdpdGggYmVhY29uc1xuICAgICAqIGFuZCBzdG9wIG1vbml0b3JpbmcgYmVhY29ucyBpbiByb29tcyB1c2VyIGlzIG5vIGxvbmdlciBtZW1iZXIgb2ZcbiAgICAgKi9cbiAgICBwcml2YXRlIG9uUm9vbVN0YXRlTWVtYmVycyA9IChfZXZlbnQ6IE1hdHJpeEV2ZW50LCByb29tU3RhdGU6IFJvb21TdGF0ZSwgbWVtYmVyOiBSb29tTWVtYmVyKTogdm9pZCA9PiB7XG4gICAgICAgIC8vIG5vIGJlYWNvbnMgZm9yIHRoaXMgcm9vbSwgaWdub3JlXG4gICAgICAgIGlmIChcbiAgICAgICAgICAgICF0aGlzLmJlYWNvbnNCeVJvb21JZC5oYXMocm9vbVN0YXRlLnJvb21JZCkgfHxcbiAgICAgICAgICAgIG1lbWJlci51c2VySWQgIT09IHRoaXMubWF0cml4Q2xpZW50LmdldFVzZXJJZCgpXG4gICAgICAgICkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVE9ETyBjaGVjayBwb3dlcmxldmVscyBoZXJlXG4gICAgICAgIC8vIGluIFBTRi03OTdcblxuICAgICAgICAvLyBzdG9wIHdhdGNoaW5nIGJlYWNvbnMgaW4gcm9vbXMgd2hlcmUgdXNlciBpcyBubyBsb25nZXIgYSBtZW1iZXJcbiAgICAgICAgaWYgKG1lbWJlci5tZW1iZXJzaGlwID09PSAnbGVhdmUnIHx8IG1lbWJlci5tZW1iZXJzaGlwID09PSAnYmFuJykge1xuICAgICAgICAgICAgdGhpcy5iZWFjb25zQnlSb29tSWQuZ2V0KHJvb21TdGF0ZS5yb29tSWQpPy5mb3JFYWNoKHRoaXMucmVtb3ZlQmVhY29uKTtcbiAgICAgICAgICAgIHRoaXMuYmVhY29uc0J5Um9vbUlkLmRlbGV0ZShyb29tU3RhdGUucm9vbUlkKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTdGF0ZSBtYW5hZ2VtZW50XG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBMaXZlIGJlYWNvbiBpZHMgdGhhdCBkbyBub3QgaGF2ZSB3aXJlIGVycm9yc1xuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0IGhlYWx0aHlMaXZlQmVhY29uSWRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5saXZlQmVhY29uSWRzLmZpbHRlcihiZWFjb25JZCA9PlxuICAgICAgICAgICAgIXRoaXMuYmVhY29uSGFzTG9jYXRpb25QdWJsaXNoRXJyb3IoYmVhY29uSWQpICYmXG4gICAgICAgICAgICAhdGhpcy5iZWFjb25VcGRhdGVFcnJvcnMuaGFzKGJlYWNvbklkKSxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGluaXRpYWxpc2VCZWFjb25TdGF0ZSA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgdXNlcklkID0gdGhpcy5tYXRyaXhDbGllbnQuZ2V0VXNlcklkKCk7XG4gICAgICAgIGNvbnN0IHZpc2libGVSb29tcyA9IHRoaXMubWF0cml4Q2xpZW50LmdldFZpc2libGVSb29tcygpO1xuXG4gICAgICAgIHZpc2libGVSb29tc1xuICAgICAgICAgICAgLmZvckVhY2gocm9vbSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vbVN0YXRlID0gcm9vbS5jdXJyZW50U3RhdGU7XG4gICAgICAgICAgICAgICAgY29uc3QgYmVhY29ucyA9IHJvb21TdGF0ZS5iZWFjb25zO1xuICAgICAgICAgICAgICAgIGNvbnN0IG93bkJlYWNvbnNBcnJheSA9IFsuLi5iZWFjb25zLnZhbHVlcygpXS5maWx0ZXIoYmVhY29uID0+IGlzT3duQmVhY29uKGJlYWNvbiwgdXNlcklkKSk7XG4gICAgICAgICAgICAgICAgb3duQmVhY29uc0FycmF5LmZvckVhY2goYmVhY29uID0+IHRoaXMuYWRkQmVhY29uKGJlYWNvbikpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5jaGVja0xpdmVuZXNzKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgYWRkQmVhY29uID0gKGJlYWNvbjogQmVhY29uKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuYmVhY29ucy5zZXQoYmVhY29uLmlkZW50aWZpZXIsIGJlYWNvbik7XG5cbiAgICAgICAgaWYgKCF0aGlzLmJlYWNvbnNCeVJvb21JZC5oYXMoYmVhY29uLnJvb21JZCkpIHtcbiAgICAgICAgICAgIHRoaXMuYmVhY29uc0J5Um9vbUlkLnNldChiZWFjb24ucm9vbUlkLCBuZXcgU2V0PHN0cmluZz4oKSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmJlYWNvbnNCeVJvb21JZC5nZXQoYmVhY29uLnJvb21JZCkuYWRkKGJlYWNvbi5pZGVudGlmaWVyKTtcblxuICAgICAgICBiZWFjb24ubW9uaXRvckxpdmVuZXNzKCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBsaXN0ZW5lcnMgZm9yIGEgZ2l2ZW4gYmVhY29uXG4gICAgICogcmVtb3ZlIGZyb20gc3RhdGVcbiAgICAgKiBhbmQgdXBkYXRlIGxpdmVuZXNzIGlmIGNoYW5nZWRcbiAgICAgKi9cbiAgICBwcml2YXRlIHJlbW92ZUJlYWNvbiA9IChiZWFjb25JZDogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgICAgIGlmICghdGhpcy5iZWFjb25zLmhhcyhiZWFjb25JZCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJlYWNvbnMuZ2V0KGJlYWNvbklkKS5kZXN0cm95KCk7XG4gICAgICAgIHRoaXMuYmVhY29ucy5kZWxldGUoYmVhY29uSWQpO1xuXG4gICAgICAgIHRoaXMuY2hlY2tMaXZlbmVzcygpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGNoZWNrTGl2ZW5lc3MgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IGxvY2FsbHlDcmVhdGVkQmVhY29uRXZlbnRJZHMgPSBnZXRMb2NhbGx5Q3JlYXRlZEJlYWNvbkV2ZW50SWRzKCk7XG4gICAgICAgIGNvbnN0IHByZXZMaXZlQmVhY29uSWRzID0gdGhpcy5nZXRMaXZlQmVhY29uSWRzKCk7XG4gICAgICAgIHRoaXMubGl2ZUJlYWNvbklkcyA9IFsuLi50aGlzLmJlYWNvbnMudmFsdWVzKCldXG4gICAgICAgICAgICAuZmlsdGVyKGJlYWNvbiA9PlxuICAgICAgICAgICAgICAgIGJlYWNvbi5pc0xpdmUgJiZcbiAgICAgICAgICAgICAgICAvLyBvbmx5IGJlYWNvbnMgY3JlYXRlZCBvbiB0aGlzIGRldmljZSBzaG91bGQgYmUgc2hhcmVkIHRvXG4gICAgICAgICAgICAgICAgbG9jYWxseUNyZWF0ZWRCZWFjb25FdmVudElkcy5pbmNsdWRlcyhiZWFjb24uYmVhY29uSW5mb0lkKSxcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5zb3J0KHNvcnRCZWFjb25zQnlMYXRlc3RDcmVhdGlvbilcbiAgICAgICAgICAgIC5tYXAoYmVhY29uID0+IGJlYWNvbi5pZGVudGlmaWVyKTtcblxuICAgICAgICBjb25zdCBkaWZmID0gYXJyYXlEaWZmKHByZXZMaXZlQmVhY29uSWRzLCB0aGlzLmxpdmVCZWFjb25JZHMpO1xuXG4gICAgICAgIGlmIChkaWZmLmFkZGVkLmxlbmd0aCB8fCBkaWZmLnJlbW92ZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLmVtaXQoT3duQmVhY29uU3RvcmVFdmVudC5MaXZlbmVzc0NoYW5nZSwgdGhpcy5saXZlQmVhY29uSWRzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHB1Ymxpc2ggY3VycmVudCBsb2NhdGlvbiBpbW1lZGlhdGVseVxuICAgICAgICAvLyB3aGVuIHRoZXJlIGFyZSBuZXcgbGl2ZSBiZWFjb25zXG4gICAgICAgIC8vIGFuZCB3ZSBhbHJlYWR5IGhhdmUgYSBsaXZlIG1vbml0b3JcbiAgICAgICAgLy8gc28gZmlyc3QgcG9zaXRpb24gaXMgcHVibGlzaGVkIHF1aWNrbHlcbiAgICAgICAgLy8gZXZlbiB3aGVuIHRhcmdldCBpcyBzdGF0aW9uYXJ5XG4gICAgICAgIC8vXG4gICAgICAgIC8vIHdoZW4gdGhlcmUgaXMgbm8gZXhpc3RpbmcgbGl2ZSBtb25pdG9yXG4gICAgICAgIC8vIGl0IHdpbGwgYmUgY3JlYXRlZCBiZWxvdyBieSB0b2dnbGVQb2xsaW5nTG9jYXRpb25cbiAgICAgICAgLy8gYW5kIHB1Ymxpc2ggZmlyc3QgcG9zaXRpb24gcXVpY2tseVxuICAgICAgICBpZiAoZGlmZi5hZGRlZC5sZW5ndGggJiYgdGhpcy5pc01vbml0b3JpbmdMaXZlTG9jYXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMucHVibGlzaEN1cnJlbnRMb2NhdGlvblRvQmVhY29ucygpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgb3ZlcmFsbCBsaXZlbmVzcyBjaGFuZ2VkXG4gICAgICAgIGlmICghIXByZXZMaXZlQmVhY29uSWRzPy5sZW5ndGggIT09ICEhdGhpcy5saXZlQmVhY29uSWRzLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy50b2dnbGVQb2xsaW5nTG9jYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwdWJsaWMgY3JlYXRlTGl2ZUJlYWNvbiA9IGFzeW5jIChcbiAgICAgICAgcm9vbUlkOiBSb29tWydyb29tSWQnXSxcbiAgICAgICAgYmVhY29uSW5mb0NvbnRlbnQ6IE1CZWFjb25JbmZvRXZlbnRDb250ZW50LFxuICAgICk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICAvLyBleHBsaWNpdGx5IHN0b3AgYW55IGxpdmUgYmVhY29ucyB0aGlzIHVzZXIgaGFzXG4gICAgICAgIC8vIHRvIGVuc3VyZSB0aGV5IHJlbWFpbiBzdG9wcGVkXG4gICAgICAgIC8vIGlmIHRoZSBuZXcgcmVwbGFjaW5nIGJlYWNvbiBpcyByZWRhY3RlZFxuICAgICAgICBjb25zdCBleGlzdGluZ0xpdmVCZWFjb25JZHNGb3JSb29tID0gdGhpcy5nZXRMaXZlQmVhY29uSWRzKHJvb21JZCk7XG4gICAgICAgIGF3YWl0IFByb21pc2UuYWxsKGV4aXN0aW5nTGl2ZUJlYWNvbklkc0ZvclJvb20ubWFwKGJlYWNvbklkID0+IHRoaXMuc3RvcEJlYWNvbihiZWFjb25JZCkpKTtcblxuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgICAgIGNvbnN0IHsgZXZlbnRfaWQgfSA9IGF3YWl0IGRvTWF5YmVMb2NhbFJvb21BY3Rpb24oXG4gICAgICAgICAgICByb29tSWQsXG4gICAgICAgICAgICAoYWN0dWFsUm9vbUlkOiBzdHJpbmcpID0+IHRoaXMubWF0cml4Q2xpZW50LnVuc3RhYmxlX2NyZWF0ZUxpdmVCZWFjb24oYWN0dWFsUm9vbUlkLCBiZWFjb25JbmZvQ29udGVudCksXG4gICAgICAgICAgICB0aGlzLm1hdHJpeENsaWVudCxcbiAgICAgICAgKTtcblxuICAgICAgICBzdG9yZUxvY2FsbHlDcmVhdGVCZWFjb25FdmVudElkKGV2ZW50X2lkKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogR2VvbG9jYXRpb25cbiAgICAgKi9cblxuICAgIHByaXZhdGUgdG9nZ2xlUG9sbGluZ0xvY2F0aW9uID0gKCkgPT4ge1xuICAgICAgICBpZiAoISF0aGlzLmxpdmVCZWFjb25JZHMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0UG9sbGluZ0xvY2F0aW9uKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnN0b3BQb2xsaW5nTG9jYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIHN0YXJ0UG9sbGluZ0xvY2F0aW9uID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAvLyBjbGVhciBhbnkgZXhpc3RpbmcgaW50ZXJ2YWxcbiAgICAgICAgdGhpcy5zdG9wUG9sbGluZ0xvY2F0aW9uKCk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuY2xlYXJQb3NpdGlvbldhdGNoID0gd2F0Y2hQb3NpdGlvbih0aGlzLm9uV2F0Y2hlZFBvc2l0aW9uLCB0aGlzLm9uR2VvbG9jYXRpb25FcnJvcik7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICB0aGlzLm9uR2VvbG9jYXRpb25FcnJvcihlcnJvcj8ubWVzc2FnZSk7XG4gICAgICAgICAgICAvLyBkb24ndCBzZXQgbG9jYXRpb25JbnRlcnZhbCBpZiBnZW9sb2NhdGlvbiBmYWlsZWQgdG8gc2V0dXBcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubG9jYXRpb25JbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5sYXN0UHVibGlzaGVkUG9zaXRpb25UaW1lc3RhbXApIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBpZiBwb3NpdGlvbiB3YXMgbGFzdCB1cGRhdGVkIFNUQVRJQ19VUERBVEVfSU5URVJWQUwgbXMgYWdvIG9yIG1vcmVcbiAgICAgICAgICAgIC8vIGdldCBvdXIgcG9zaXRpb24gYW5kIHB1Ymxpc2ggaXRcbiAgICAgICAgICAgIGlmICh0aGlzLmxhc3RQdWJsaXNoZWRQb3NpdGlvblRpbWVzdGFtcCA8PSBEYXRlLm5vdygpIC0gU1RBVElDX1VQREFURV9JTlRFUlZBTCkge1xuICAgICAgICAgICAgICAgIHRoaXMucHVibGlzaEN1cnJlbnRMb2NhdGlvblRvQmVhY29ucygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBTVEFUSUNfVVBEQVRFX0lOVEVSVkFMKTtcblxuICAgICAgICB0aGlzLmVtaXQoT3duQmVhY29uU3RvcmVFdmVudC5Nb25pdG9yaW5nTGl2ZVBvc2l0aW9uKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBzdG9wUG9sbGluZ0xvY2F0aW9uID0gKCkgPT4ge1xuICAgICAgICBjbGVhckludGVydmFsKHRoaXMubG9jYXRpb25JbnRlcnZhbCk7XG4gICAgICAgIHRoaXMubG9jYXRpb25JbnRlcnZhbCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5sYXN0UHVibGlzaGVkUG9zaXRpb25UaW1lc3RhbXAgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuZ2VvbG9jYXRpb25FcnJvciA9IHVuZGVmaW5lZDtcblxuICAgICAgICBpZiAodGhpcy5jbGVhclBvc2l0aW9uV2F0Y2gpIHtcbiAgICAgICAgICAgIHRoaXMuY2xlYXJQb3NpdGlvbldhdGNoKCk7XG4gICAgICAgICAgICB0aGlzLmNsZWFyUG9zaXRpb25XYXRjaCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZW1pdChPd25CZWFjb25TdG9yZUV2ZW50Lk1vbml0b3JpbmdMaXZlUG9zaXRpb24pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uV2F0Y2hlZFBvc2l0aW9uID0gKHBvc2l0aW9uOiBHZW9sb2NhdGlvblBvc2l0aW9uKSA9PiB7XG4gICAgICAgIGNvbnN0IHRpbWVkR2VvUG9zaXRpb24gPSBtYXBHZW9sb2NhdGlvblBvc2l0aW9uVG9UaW1lZEdlbyhwb3NpdGlvbik7XG5cbiAgICAgICAgLy8gaWYgdGhpcyBpcyBvdXIgZmlyc3QgcG9zaXRpb24sIHB1Ymxpc2ggaW1tZWRpYXRlbHlcbiAgICAgICAgaWYgKCF0aGlzLmxhc3RQdWJsaXNoZWRQb3NpdGlvblRpbWVzdGFtcCkge1xuICAgICAgICAgICAgdGhpcy5wdWJsaXNoTG9jYXRpb25Ub0JlYWNvbnModGltZWRHZW9Qb3NpdGlvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRlYm91bmNlZFB1Ymxpc2hMb2NhdGlvblRvQmVhY29ucyh0aW1lZEdlb1Bvc2l0aW9uKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uR2VvbG9jYXRpb25FcnJvciA9IGFzeW5jIChlcnJvcjogR2VvbG9jYXRpb25FcnJvcik6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICB0aGlzLmdlb2xvY2F0aW9uRXJyb3IgPSBlcnJvcjtcbiAgICAgICAgbG9nZ2VyLmVycm9yKCdHZW9sb2NhdGlvbiBmYWlsZWQnLCB0aGlzLmdlb2xvY2F0aW9uRXJyb3IpO1xuXG4gICAgICAgIC8vIG90aGVyIGVycm9ycyBhcmUgY29uc2lkZXJlZCBub24tZmF0YWxcbiAgICAgICAgLy8gYW5kIHNlbGYgcmVjb3ZlcmluZ1xuICAgICAgICBpZiAoIVtcbiAgICAgICAgICAgIEdlb2xvY2F0aW9uRXJyb3IuVW5hdmFpbGFibGUsXG4gICAgICAgICAgICBHZW9sb2NhdGlvbkVycm9yLlBlcm1pc3Npb25EZW5pZWQsXG4gICAgICAgIF0uaW5jbHVkZXMoZXJyb3IpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnN0b3BQb2xsaW5nTG9jYXRpb24oKTtcbiAgICAgICAgLy8ga2lsbCBsaXZlIGJlYWNvbnMgd2hlbiBsb2NhdGlvbiBwZXJtaXNzaW9ucyBhcmUgcmV2b2tlZFxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbCh0aGlzLmxpdmVCZWFjb25JZHMubWFwKHRoaXMuc3RvcEJlYWNvbikpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBjdXJyZW50IGxvY2F0aW9uXG4gICAgICogKGFzIG9wcG9zZWQgdG8gdXNpbmcgd2F0Y2hlZCBsb2NhdGlvbilcbiAgICAgKiBhbmQgcHVibGlzaGVzIGl0IHRvIGFsbCBsaXZlIGJlYWNvbnNcbiAgICAgKi9cbiAgICBwcml2YXRlIHB1Ymxpc2hDdXJyZW50TG9jYXRpb25Ub0JlYWNvbnMgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbiA9IGF3YWl0IGdldEN1cnJlbnRQb3NpdGlvbigpO1xuICAgICAgICAgICAgdGhpcy5wdWJsaXNoTG9jYXRpb25Ub0JlYWNvbnMobWFwR2VvbG9jYXRpb25Qb3NpdGlvblRvVGltZWRHZW8ocG9zaXRpb24pKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHRoaXMub25HZW9sb2NhdGlvbkVycm9yKGVycm9yPy5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBNYXRyaXhDbGllbnQgYXBpXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGVzIGJlYWNvbiB3aXRoIHByb3ZpZGVkIGNvbnRlbnQgdXBkYXRlXG4gICAgICogUmVjb3JkcyBlcnJvciBpbiBiZWFjb25VcGRhdGVFcnJvcnNcbiAgICAgKiByZXRocm93c1xuICAgICAqL1xuICAgIHByaXZhdGUgdXBkYXRlQmVhY29uRXZlbnQgPSBhc3luYyAoYmVhY29uOiBCZWFjb24sIHVwZGF0ZTogUGFydGlhbDxCZWFjb25JbmZvU3RhdGU+KTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgIGNvbnN0IHsgZGVzY3JpcHRpb24sIHRpbWVvdXQsIHRpbWVzdGFtcCwgbGl2ZSwgYXNzZXRUeXBlIH0gPSB7XG4gICAgICAgICAgICAuLi5iZWFjb24uYmVhY29uSW5mbyxcbiAgICAgICAgICAgIC4uLnVwZGF0ZSxcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCB1cGRhdGVDb250ZW50ID0gbWFrZUJlYWNvbkluZm9Db250ZW50KHRpbWVvdXQsXG4gICAgICAgICAgICBsaXZlLFxuICAgICAgICAgICAgZGVzY3JpcHRpb24sXG4gICAgICAgICAgICBhc3NldFR5cGUsXG4gICAgICAgICAgICB0aW1lc3RhbXAsXG4gICAgICAgICk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMubWF0cml4Q2xpZW50LnVuc3RhYmxlX3NldExpdmVCZWFjb24oYmVhY29uLnJvb21JZCwgdXBkYXRlQ29udGVudCk7XG4gICAgICAgICAgICAvLyBjbGVhbnVwIGFueSBlcnJvcnNcbiAgICAgICAgICAgIGNvbnN0IGhhZEVycm9yID0gdGhpcy5iZWFjb25VcGRhdGVFcnJvcnMuaGFzKGJlYWNvbi5pZGVudGlmaWVyKTtcbiAgICAgICAgICAgIGlmIChoYWRFcnJvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuYmVhY29uVXBkYXRlRXJyb3JzLmRlbGV0ZShiZWFjb24uaWRlbnRpZmllcik7XG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KE93bkJlYWNvblN0b3JlRXZlbnQuQmVhY29uVXBkYXRlRXJyb3IsIGJlYWNvbi5pZGVudGlmaWVyLCBmYWxzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0ZhaWxlZCB0byB1cGRhdGUgYmVhY29uJywgZXJyb3IpO1xuICAgICAgICAgICAgdGhpcy5iZWFjb25VcGRhdGVFcnJvcnMuc2V0KGJlYWNvbi5pZGVudGlmaWVyLCBlcnJvcik7XG4gICAgICAgICAgICB0aGlzLmVtaXQoT3duQmVhY29uU3RvcmVFdmVudC5CZWFjb25VcGRhdGVFcnJvciwgYmVhY29uLmlkZW50aWZpZXIsIHRydWUpO1xuXG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTZW5kcyBtLmxvY2F0aW9uIGV2ZW50cyB0byBhbGwgbGl2ZSBiZWFjb25zXG4gICAgICogU2V0cyBsYXN0IHB1Ymxpc2hlZCBiZWFjb25cbiAgICAgKi9cbiAgICBwcml2YXRlIHB1Ymxpc2hMb2NhdGlvblRvQmVhY29ucyA9IGFzeW5jIChwb3NpdGlvbjogVGltZWRHZW9VcmkpID0+IHtcbiAgICAgICAgdGhpcy5sYXN0UHVibGlzaGVkUG9zaXRpb25UaW1lc3RhbXAgPSBEYXRlLm5vdygpO1xuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbCh0aGlzLmhlYWx0aHlMaXZlQmVhY29uSWRzLm1hcChiZWFjb25JZCA9PlxuICAgICAgICAgICAgdGhpcy5zZW5kTG9jYXRpb25Ub0JlYWNvbih0aGlzLmJlYWNvbnMuZ2V0KGJlYWNvbklkKSwgcG9zaXRpb24pKSxcbiAgICAgICAgKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBkZWJvdW5jZWRQdWJsaXNoTG9jYXRpb25Ub0JlYWNvbnMgPSBkZWJvdW5jZSh0aGlzLnB1Ymxpc2hMb2NhdGlvblRvQmVhY29ucywgTU9WSU5HX1VQREFURV9JTlRFUlZBTCk7XG5cbiAgICAvKipcbiAgICAgKiBTZW5kcyBtLmxvY2F0aW9uIGV2ZW50IHRvIHJlZmVyZW5jaW5nIGdpdmVuIGJlYWNvblxuICAgICAqL1xuICAgIHByaXZhdGUgc2VuZExvY2F0aW9uVG9CZWFjb24gPSBhc3luYyAoYmVhY29uOiBCZWFjb24sIHsgZ2VvVXJpLCB0aW1lc3RhbXAgfTogVGltZWRHZW9VcmkpID0+IHtcbiAgICAgICAgY29uc3QgY29udGVudCA9IG1ha2VCZWFjb25Db250ZW50KGdlb1VyaSwgdGltZXN0YW1wLCBiZWFjb24uYmVhY29uSW5mb0lkKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMubWF0cml4Q2xpZW50LnNlbmRFdmVudChiZWFjb24ucm9vbUlkLCBNX0JFQUNPTi5uYW1lLCBjb250ZW50KTtcbiAgICAgICAgICAgIHRoaXMuaW5jcmVtZW50QmVhY29uTG9jYXRpb25QdWJsaXNoRXJyb3JDb3VudChiZWFjb24uaWRlbnRpZmllciwgZmFsc2UpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGVycm9yKTtcbiAgICAgICAgICAgIHRoaXMuaW5jcmVtZW50QmVhY29uTG9jYXRpb25QdWJsaXNoRXJyb3JDb3VudChiZWFjb24uaWRlbnRpZmllciwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTWFuYWdlIGJlYWNvbiB3aXJlIGVycm9yIGNvdW50XG4gICAgICogLSBjbGVhciBjb3VudCBmb3IgYmVhY29uIHdoZW4gbm90IGVycm9yXG4gICAgICogLSBpbmNyZW1lbnQgY291bnQgZm9yIGJlYWNvbiB3aGVuIGlzIGVycm9yXG4gICAgICogLSBlbWl0IGlmIGJlYWNvbiBlcnJvciBjb3VudCBjcm9zc2VkIHRocmVzaG9sZFxuICAgICAqL1xuICAgIHByaXZhdGUgaW5jcmVtZW50QmVhY29uTG9jYXRpb25QdWJsaXNoRXJyb3JDb3VudCA9IChiZWFjb25JZDogc3RyaW5nLCBpc0Vycm9yOiBib29sZWFuKTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IGhhZEVycm9yID0gdGhpcy5iZWFjb25IYXNMb2NhdGlvblB1Ymxpc2hFcnJvcihiZWFjb25JZCk7XG5cbiAgICAgICAgaWYgKGlzRXJyb3IpIHtcbiAgICAgICAgICAgIC8vIGluY3JlbWVudCBlcnJvciBjb3VudFxuICAgICAgICAgICAgdGhpcy5iZWFjb25Mb2NhdGlvblB1Ymxpc2hFcnJvckNvdW50cy5zZXQoXG4gICAgICAgICAgICAgICAgYmVhY29uSWQsXG4gICAgICAgICAgICAgICAgKHRoaXMuYmVhY29uTG9jYXRpb25QdWJsaXNoRXJyb3JDb3VudHMuZ2V0KGJlYWNvbklkKSA/PyAwKSArIDEsXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gY2xlYXIgYW55IGVycm9yIGNvdW50XG4gICAgICAgICAgICB0aGlzLmJlYWNvbkxvY2F0aW9uUHVibGlzaEVycm9yQ291bnRzLmRlbGV0ZShiZWFjb25JZCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5iZWFjb25IYXNMb2NhdGlvblB1Ymxpc2hFcnJvcihiZWFjb25JZCkgIT09IGhhZEVycm9yKSB7XG4gICAgICAgICAgICB0aGlzLmVtaXQoT3duQmVhY29uU3RvcmVFdmVudC5Mb2NhdGlv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