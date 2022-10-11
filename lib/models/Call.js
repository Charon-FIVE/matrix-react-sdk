"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isConnected = exports.JitsiCall = exports.ConnectionState = exports.CallEvent = exports.Call = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _typedEventEmitter = require("matrix-js-sdk/src/models/typed-event-emitter");

var _logger = require("matrix-js-sdk/src/logger");

var _room = require("matrix-js-sdk/src/models/room");

var _roomState = require("matrix-js-sdk/src/models/room-state");

var _call = require("matrix-js-sdk/src/webrtc/call");

var _MediaDeviceHandler = _interopRequireWildcard(require("../MediaDeviceHandler"));

var _promise = require("../utils/promise");

var _WidgetUtils = _interopRequireDefault(require("../utils/WidgetUtils"));

var _WidgetType = require("../widgets/WidgetType");

var _ElementWidgetActions = require("../stores/widgets/ElementWidgetActions");

var _WidgetStore = _interopRequireDefault(require("../stores/WidgetStore"));

var _WidgetMessagingStore = require("../stores/widgets/WidgetMessagingStore");

var _ActiveWidgetStore = _interopRequireWildcard(require("../stores/ActiveWidgetStore"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2022 The Matrix.org Foundation C.I.C.

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
const TIMEOUT_MS = 16000; // Waits until an event is emitted satisfying the given predicate

const waitForEvent = async function (emitter, event) {
  let pred = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : () => true;
  let listener;
  const wait = new Promise(resolve => {
    listener = function () {
      if (pred(...arguments)) resolve();
    };

    emitter.on(event, listener);
  });
  const timedOut = (await (0, _promise.timeout)(wait, false, TIMEOUT_MS)) === false;
  emitter.off(event, listener);
  if (timedOut) throw new Error("Timed out");
};

let ConnectionState;
exports.ConnectionState = ConnectionState;

(function (ConnectionState) {
  ConnectionState["Disconnected"] = "disconnected";
  ConnectionState["Connecting"] = "connecting";
  ConnectionState["Connected"] = "connected";
  ConnectionState["Disconnecting"] = "disconnecting";
})(ConnectionState || (exports.ConnectionState = ConnectionState = {}));

const isConnected = state => state === ConnectionState.Connected || state === ConnectionState.Disconnecting;

exports.isConnected = isConnected;
let CallEvent;
exports.CallEvent = CallEvent;

(function (CallEvent) {
  CallEvent["ConnectionState"] = "connection_state";
  CallEvent["Participants"] = "participants";
  CallEvent["Destroy"] = "destroy";
})(CallEvent || (exports.CallEvent = CallEvent = {}));

/**
 * A group call accessed through a widget.
 */
class Call extends _typedEventEmitter.TypedEventEmitter {
  /**
   * The widget's messaging, or null if disconnected.
   */
  get messaging() {
    return this._messaging;
  }

  set messaging(value) {
    this._messaging = value;
  }

  get roomId() {
    return this.widget.roomId;
  }

  get connectionState() {
    return this._connectionState;
  }

  set connectionState(value) {
    const prevValue = this._connectionState;
    this._connectionState = value;
    this.emit(CallEvent.ConnectionState, value, prevValue);
  }

  get connected() {
    return isConnected(this.connectionState);
  }

  get participants() {
    return this._participants;
  }

  set participants(value) {
    this._participants = value;
    this.emit(CallEvent.Participants, value);
  }

  constructor(
  /**
   * The widget used to access this call.
   */
  widget) {
    super();
    this.widget = widget;
    (0, _defineProperty2.default)(this, "widgetUid", _WidgetUtils.default.getWidgetUid(this.widget));
    (0, _defineProperty2.default)(this, "_messaging", null);
    (0, _defineProperty2.default)(this, "_connectionState", ConnectionState.Disconnected);
    (0, _defineProperty2.default)(this, "_participants", new Set());
  }
  /**
   * Gets the call associated with the given room, if any.
   * @param {Room} room The room.
   * @returns {Call | null} The call.
   */


  static get(room) {
    // There's currently only one implementation
    return JitsiCall.get(room);
  }
  /**
   * Performs a routine check of the call's associated room state, cleaning up
   * any data left over from an unclean disconnection.
   */


  /**
   * Connects the user to the call using the media devices set in
   * MediaDeviceHandler. The widget associated with the call must be active
   * for this to succeed.
   */
  async connect() {
    this.connectionState = ConnectionState.Connecting;
    const {
      [_MediaDeviceHandler.MediaDeviceKindEnum.AudioInput]: audioInputs,
      [_MediaDeviceHandler.MediaDeviceKindEnum.VideoInput]: videoInputs
    } = await _MediaDeviceHandler.default.getDevices();
    let audioInput = null;

    if (!_MediaDeviceHandler.default.startWithAudioMuted) {
      const deviceId = _MediaDeviceHandler.default.getAudioInput();

      audioInput = audioInputs.find(d => d.deviceId === deviceId) ?? audioInputs[0] ?? null;
    }

    let videoInput = null;

    if (!_MediaDeviceHandler.default.startWithVideoMuted) {
      const deviceId = _MediaDeviceHandler.default.getVideoInput();

      videoInput = videoInputs.find(d => d.deviceId === deviceId) ?? videoInputs[0] ?? null;
    }

    const messagingStore = _WidgetMessagingStore.WidgetMessagingStore.instance;
    this.messaging = messagingStore.getMessagingForUid(this.widgetUid);

    if (!this.messaging) {
      // The widget might still be initializing, so wait for it
      try {
        await waitForEvent(messagingStore, _WidgetMessagingStore.WidgetMessagingStoreEvent.StoreMessaging, (uid, widgetApi) => {
          if (uid === this.widgetUid) {
            this.messaging = widgetApi;
            return true;
          }

          return false;
        });
      } catch (e) {
        throw new Error(`Failed to bind call widget in room ${this.roomId}: ${e}`);
      }
    }

    try {
      await this.performConnection(audioInput, videoInput);
    } catch (e) {
      this.connectionState = ConnectionState.Disconnected;
      throw e;
    }

    this.connectionState = ConnectionState.Connected;
  }
  /**
   * Disconnects the user from the call.
   */


  async disconnect() {
    if (this.connectionState !== ConnectionState.Connected) throw new Error("Not connected");
    this.connectionState = ConnectionState.Disconnecting;
    await this.performDisconnection();
    this.setDisconnected();
  }
  /**
   * Manually marks the call as disconnected and cleans up.
   */


  setDisconnected() {
    this.messaging = null;
    this.connectionState = ConnectionState.Disconnected;
  }
  /**
   * Stops all internal timers and tasks to prepare for garbage collection.
   */


  destroy() {
    if (this.connected) this.setDisconnected();
    this.emit(CallEvent.Destroy);
  }

}
/**
 * A group call using Jitsi as a backend.
 */


exports.Call = Call;

class JitsiCall extends Call {
  // 1 hour
  constructor(widget, client) {
    super(widget);
    this.client = client;
    (0, _defineProperty2.default)(this, "room", this.client.getRoom(this.roomId));
    (0, _defineProperty2.default)(this, "resendDevicesTimer", null);
    (0, _defineProperty2.default)(this, "participantsExpirationTimer", null);
    (0, _defineProperty2.default)(this, "onRoomState", () => this.updateParticipants());
    (0, _defineProperty2.default)(this, "onConnectionState", async (state, prevState) => {
      if (state === ConnectionState.Connected && prevState === ConnectionState.Connecting) {
        this.updateParticipants(); // Tell others that we're connected, by adding our device to room state

        await this.addOurDevice(); // Re-add this device every so often so our video member event doesn't become stale

        this.resendDevicesTimer = setInterval(async () => {
          _logger.logger.log(`Resending video member event for ${this.roomId}`);

          await this.addOurDevice();
        }, JitsiCall.STUCK_DEVICE_TIMEOUT_MS * 3 / 4);
      } else if (state === ConnectionState.Disconnected && isConnected(prevState)) {
        this.updateParticipants();
        clearInterval(this.resendDevicesTimer);
        this.resendDevicesTimer = null; // Tell others that we're disconnected, by removing our device from room state

        await this.removeOurDevice();
      }
    });
    (0, _defineProperty2.default)(this, "onDock", async () => {
      // The widget is no longer a PiP, so let's restore the default layout
      await this.messaging.transport.send(_ElementWidgetActions.ElementWidgetActions.TileLayout, {});
    });
    (0, _defineProperty2.default)(this, "onUndock", async () => {
      // The widget has become a PiP, so let's switch Jitsi to spotlight mode
      // to only show the active speaker and economize on space
      await this.messaging.transport.send(_ElementWidgetActions.ElementWidgetActions.SpotlightLayout, {});
    });
    (0, _defineProperty2.default)(this, "onMyMembership", async (room, membership) => {
      if (membership !== "join") this.setDisconnected();
    });
    (0, _defineProperty2.default)(this, "beforeUnload", () => this.setDisconnected());
    (0, _defineProperty2.default)(this, "onHangup", async ev => {
      // If we're already in the middle of a client-initiated disconnection,
      // ignore the event
      if (this.connectionState === ConnectionState.Disconnecting) return;
      ev.preventDefault(); // In case this hangup is caused by Jitsi Meet crashing at startup,
      // wait for the connection event in order to avoid racing

      if (this.connectionState === ConnectionState.Connecting) {
        await waitForEvent(this, CallEvent.ConnectionState);
      }

      await this.messaging.transport.reply(ev.detail, {}); // ack

      this.setDisconnected();
    });
    this.room.on(_roomState.RoomStateEvent.Update, this.onRoomState);
    this.on(CallEvent.ConnectionState, this.onConnectionState);
    this.updateParticipants();
  }

  static get(room) {
    const apps = _WidgetStore.default.instance.getApps(room.roomId); // The isVideoChannel field differentiates rich Jitsi calls from bare Jitsi widgets


    const jitsiWidget = apps.find(app => _WidgetType.WidgetType.JITSI.matches(app.type) && app.data?.isVideoChannel);
    return jitsiWidget ? new JitsiCall(jitsiWidget, room.client) : null;
  }

  static async create(room) {
    await _WidgetUtils.default.addJitsiWidget(room.roomId, _call.CallType.Video, "Group call", true, room.name);
  }

  updateParticipants() {
    if (this.participantsExpirationTimer !== null) {
      clearTimeout(this.participantsExpirationTimer);
      this.participantsExpirationTimer = null;
    }

    const members = new Set();
    const now = Date.now();
    let allExpireAt = Infinity;

    for (const e of this.room.currentState.getStateEvents(JitsiCall.MEMBER_EVENT_TYPE)) {
      const member = this.room.getMember(e.getStateKey());
      const content = e.getContent();
      let devices = Array.isArray(content.devices) ? content.devices : [];
      const expiresAt = typeof content.expires_ts === "number" ? content.expires_ts : -Infinity; // Apply local echo for the disconnected case

      if (!this.connected && member?.userId === this.client.getUserId()) {
        devices = devices.filter(d => d !== this.client.getDeviceId());
      } // Must have a connected device, be unexpired, and still be joined to the room


      if (devices.length && expiresAt > now && member?.membership === "join") {
        members.add(member);
        if (expiresAt < allExpireAt) allExpireAt = expiresAt;
      }
    } // Apply local echo for the connected case


    if (this.connected) members.add(this.room.getMember(this.client.getUserId()));
    this.participants = members;

    if (allExpireAt < Infinity) {
      this.participantsExpirationTimer = setTimeout(() => this.updateParticipants(), allExpireAt - now);
    }
  } // Helper method that updates our member state with the devices returned by
  // the given function. If it returns null, the update is skipped.


  async updateDevices(fn) {
    if (this.room.getMyMembership() !== "join") return;
    const devicesState = this.room.currentState.getStateEvents(JitsiCall.MEMBER_EVENT_TYPE, this.client.getUserId());
    const devices = devicesState?.getContent().devices ?? [];
    const newDevices = fn(devices);

    if (newDevices) {
      const content = {
        devices: newDevices,
        expires_ts: Date.now() + JitsiCall.STUCK_DEVICE_TIMEOUT_MS
      };
      await this.client.sendStateEvent(this.roomId, JitsiCall.MEMBER_EVENT_TYPE, content, this.client.getUserId());
    }
  }

  async addOurDevice() {
    await this.updateDevices(devices => Array.from(new Set(devices).add(this.client.getDeviceId())));
  }

  async removeOurDevice() {
    await this.updateDevices(devices => {
      const devicesSet = new Set(devices);
      devicesSet.delete(this.client.getDeviceId());
      return Array.from(devicesSet);
    });
  }

  async clean() {
    const now = Date.now();
    const {
      devices: myDevices
    } = await this.client.getDevices();
    const deviceMap = new Map(myDevices.map(d => [d.device_id, d])); // Clean up our member state by filtering out logged out devices,
    // inactive devices, and our own device (if we're disconnected)

    await this.updateDevices(devices => {
      const newDevices = devices.filter(d => {
        const device = deviceMap.get(d);
        return device?.last_seen_ts && !(d === this.client.getDeviceId() && !this.connected) && now - device.last_seen_ts < JitsiCall.STUCK_DEVICE_TIMEOUT_MS;
      }); // Skip the update if the devices are unchanged

      return newDevices.length === devices.length ? null : newDevices;
    });
  }

  async performConnection(audioInput, videoInput) {
    // Ensure that the messaging doesn't get stopped while we're waiting for responses
    const dontStopMessaging = new Promise((resolve, reject) => {
      const messagingStore = _WidgetMessagingStore.WidgetMessagingStore.instance;

      const listener = uid => {
        if (uid === this.widgetUid) {
          cleanup();
          reject(new Error("Messaging stopped"));
        }
      };

      const done = () => {
        cleanup();
        resolve();
      };

      const cleanup = () => {
        messagingStore.off(_WidgetMessagingStore.WidgetMessagingStoreEvent.StopMessaging, listener);
        this.off(CallEvent.ConnectionState, done);
      };

      messagingStore.on(_WidgetMessagingStore.WidgetMessagingStoreEvent.StopMessaging, listener);
      this.on(CallEvent.ConnectionState, done);
    }); // Empirically, it's possible for Jitsi Meet to crash instantly at startup,
    // sending a hangup event that races with the rest of this method, so we need
    // to add the hangup listener now rather than later

    this.messaging.on(`action:${_ElementWidgetActions.ElementWidgetActions.HangupCall}`, this.onHangup); // Actually perform the join

    const response = waitForEvent(this.messaging, `action:${_ElementWidgetActions.ElementWidgetActions.JoinCall}`, ev => {
      ev.preventDefault();
      this.messaging.transport.reply(ev.detail, {}); // ack

      return true;
    });
    const request = this.messaging.transport.send(_ElementWidgetActions.ElementWidgetActions.JoinCall, {
      audioInput: audioInput?.label ?? null,
      videoInput: videoInput?.label ?? null
    });

    try {
      await Promise.race([Promise.all([request, response]), dontStopMessaging]);
    } catch (e) {
      // If it timed out, clean up our advance preparations
      this.messaging.off(`action:${_ElementWidgetActions.ElementWidgetActions.HangupCall}`, this.onHangup);

      if (this.messaging.transport.ready) {
        // The messaging still exists, which means Jitsi might still be going in the background
        this.messaging.transport.send(_ElementWidgetActions.ElementWidgetActions.HangupCall, {
          force: true
        });
      }

      throw new Error(`Failed to join call in room ${this.roomId}: ${e}`);
    }

    _ActiveWidgetStore.default.instance.on(_ActiveWidgetStore.ActiveWidgetStoreEvent.Dock, this.onDock);

    _ActiveWidgetStore.default.instance.on(_ActiveWidgetStore.ActiveWidgetStoreEvent.Undock, this.onUndock);

    this.room.on(_room.RoomEvent.MyMembership, this.onMyMembership);
    window.addEventListener("beforeunload", this.beforeUnload);
  }

  async performDisconnection() {
    const response = waitForEvent(this.messaging, `action:${_ElementWidgetActions.ElementWidgetActions.HangupCall}`, ev => {
      ev.preventDefault();
      this.messaging.transport.reply(ev.detail, {}); // ack

      return true;
    });
    const request = this.messaging.transport.send(_ElementWidgetActions.ElementWidgetActions.HangupCall, {});

    try {
      await Promise.all([request, response]);
    } catch (e) {
      throw new Error(`Failed to hangup call in room ${this.roomId}: ${e}`);
    }
  }

  setDisconnected() {
    this.messaging.off(`action:${_ElementWidgetActions.ElementWidgetActions.HangupCall}`, this.onHangup);

    _ActiveWidgetStore.default.instance.off(_ActiveWidgetStore.ActiveWidgetStoreEvent.Dock, this.onDock);

    _ActiveWidgetStore.default.instance.off(_ActiveWidgetStore.ActiveWidgetStoreEvent.Undock, this.onUndock);

    this.room.off(_room.RoomEvent.MyMembership, this.onMyMembership);
    window.removeEventListener("beforeunload", this.beforeUnload);
    super.setDisconnected();
  }

  destroy() {
    this.room.off(_roomState.RoomStateEvent.Update, this.updateParticipants);
    this.on(CallEvent.ConnectionState, this.onConnectionState);

    if (this.participantsExpirationTimer !== null) {
      clearTimeout(this.participantsExpirationTimer);
      this.participantsExpirationTimer = null;
    }

    if (this.resendDevicesTimer !== null) {
      clearInterval(this.resendDevicesTimer);
      this.resendDevicesTimer = null;
    }

    super.destroy();
  }

}

exports.JitsiCall = JitsiCall;
(0, _defineProperty2.default)(JitsiCall, "MEMBER_EVENT_TYPE", "io.element.video.member");
(0, _defineProperty2.default)(JitsiCall, "STUCK_DEVICE_TIMEOUT_MS", 1000 * 60 * 60);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUSU1FT1VUX01TIiwid2FpdEZvckV2ZW50IiwiZW1pdHRlciIsImV2ZW50IiwicHJlZCIsImxpc3RlbmVyIiwid2FpdCIsIlByb21pc2UiLCJyZXNvbHZlIiwib24iLCJ0aW1lZE91dCIsInRpbWVvdXQiLCJvZmYiLCJFcnJvciIsIkNvbm5lY3Rpb25TdGF0ZSIsImlzQ29ubmVjdGVkIiwic3RhdGUiLCJDb25uZWN0ZWQiLCJEaXNjb25uZWN0aW5nIiwiQ2FsbEV2ZW50IiwiQ2FsbCIsIlR5cGVkRXZlbnRFbWl0dGVyIiwibWVzc2FnaW5nIiwiX21lc3NhZ2luZyIsInZhbHVlIiwicm9vbUlkIiwid2lkZ2V0IiwiY29ubmVjdGlvblN0YXRlIiwiX2Nvbm5lY3Rpb25TdGF0ZSIsInByZXZWYWx1ZSIsImVtaXQiLCJjb25uZWN0ZWQiLCJwYXJ0aWNpcGFudHMiLCJfcGFydGljaXBhbnRzIiwiUGFydGljaXBhbnRzIiwiY29uc3RydWN0b3IiLCJXaWRnZXRVdGlscyIsImdldFdpZGdldFVpZCIsIkRpc2Nvbm5lY3RlZCIsIlNldCIsImdldCIsInJvb20iLCJKaXRzaUNhbGwiLCJjb25uZWN0IiwiQ29ubmVjdGluZyIsIk1lZGlhRGV2aWNlS2luZEVudW0iLCJBdWRpb0lucHV0IiwiYXVkaW9JbnB1dHMiLCJWaWRlb0lucHV0IiwidmlkZW9JbnB1dHMiLCJNZWRpYURldmljZUhhbmRsZXIiLCJnZXREZXZpY2VzIiwiYXVkaW9JbnB1dCIsInN0YXJ0V2l0aEF1ZGlvTXV0ZWQiLCJkZXZpY2VJZCIsImdldEF1ZGlvSW5wdXQiLCJmaW5kIiwiZCIsInZpZGVvSW5wdXQiLCJzdGFydFdpdGhWaWRlb011dGVkIiwiZ2V0VmlkZW9JbnB1dCIsIm1lc3NhZ2luZ1N0b3JlIiwiV2lkZ2V0TWVzc2FnaW5nU3RvcmUiLCJpbnN0YW5jZSIsImdldE1lc3NhZ2luZ0ZvclVpZCIsIndpZGdldFVpZCIsIldpZGdldE1lc3NhZ2luZ1N0b3JlRXZlbnQiLCJTdG9yZU1lc3NhZ2luZyIsInVpZCIsIndpZGdldEFwaSIsImUiLCJwZXJmb3JtQ29ubmVjdGlvbiIsImRpc2Nvbm5lY3QiLCJwZXJmb3JtRGlzY29ubmVjdGlvbiIsInNldERpc2Nvbm5lY3RlZCIsImRlc3Ryb3kiLCJEZXN0cm95IiwiY2xpZW50IiwiZ2V0Um9vbSIsInVwZGF0ZVBhcnRpY2lwYW50cyIsInByZXZTdGF0ZSIsImFkZE91ckRldmljZSIsInJlc2VuZERldmljZXNUaW1lciIsInNldEludGVydmFsIiwibG9nZ2VyIiwibG9nIiwiU1RVQ0tfREVWSUNFX1RJTUVPVVRfTVMiLCJjbGVhckludGVydmFsIiwicmVtb3ZlT3VyRGV2aWNlIiwidHJhbnNwb3J0Iiwic2VuZCIsIkVsZW1lbnRXaWRnZXRBY3Rpb25zIiwiVGlsZUxheW91dCIsIlNwb3RsaWdodExheW91dCIsIm1lbWJlcnNoaXAiLCJldiIsInByZXZlbnREZWZhdWx0IiwicmVwbHkiLCJkZXRhaWwiLCJSb29tU3RhdGVFdmVudCIsIlVwZGF0ZSIsIm9uUm9vbVN0YXRlIiwib25Db25uZWN0aW9uU3RhdGUiLCJhcHBzIiwiV2lkZ2V0U3RvcmUiLCJnZXRBcHBzIiwiaml0c2lXaWRnZXQiLCJhcHAiLCJXaWRnZXRUeXBlIiwiSklUU0kiLCJtYXRjaGVzIiwidHlwZSIsImRhdGEiLCJpc1ZpZGVvQ2hhbm5lbCIsImNyZWF0ZSIsImFkZEppdHNpV2lkZ2V0IiwiQ2FsbFR5cGUiLCJWaWRlbyIsIm5hbWUiLCJwYXJ0aWNpcGFudHNFeHBpcmF0aW9uVGltZXIiLCJjbGVhclRpbWVvdXQiLCJtZW1iZXJzIiwibm93IiwiRGF0ZSIsImFsbEV4cGlyZUF0IiwiSW5maW5pdHkiLCJjdXJyZW50U3RhdGUiLCJnZXRTdGF0ZUV2ZW50cyIsIk1FTUJFUl9FVkVOVF9UWVBFIiwibWVtYmVyIiwiZ2V0TWVtYmVyIiwiZ2V0U3RhdGVLZXkiLCJjb250ZW50IiwiZ2V0Q29udGVudCIsImRldmljZXMiLCJBcnJheSIsImlzQXJyYXkiLCJleHBpcmVzQXQiLCJleHBpcmVzX3RzIiwidXNlcklkIiwiZ2V0VXNlcklkIiwiZmlsdGVyIiwiZ2V0RGV2aWNlSWQiLCJsZW5ndGgiLCJhZGQiLCJzZXRUaW1lb3V0IiwidXBkYXRlRGV2aWNlcyIsImZuIiwiZ2V0TXlNZW1iZXJzaGlwIiwiZGV2aWNlc1N0YXRlIiwibmV3RGV2aWNlcyIsInNlbmRTdGF0ZUV2ZW50IiwiZnJvbSIsImRldmljZXNTZXQiLCJkZWxldGUiLCJjbGVhbiIsIm15RGV2aWNlcyIsImRldmljZU1hcCIsIk1hcCIsIm1hcCIsImRldmljZV9pZCIsImRldmljZSIsImxhc3Rfc2Vlbl90cyIsImRvbnRTdG9wTWVzc2FnaW5nIiwicmVqZWN0IiwiY2xlYW51cCIsImRvbmUiLCJTdG9wTWVzc2FnaW5nIiwiSGFuZ3VwQ2FsbCIsIm9uSGFuZ3VwIiwicmVzcG9uc2UiLCJKb2luQ2FsbCIsInJlcXVlc3QiLCJsYWJlbCIsInJhY2UiLCJhbGwiLCJyZWFkeSIsImZvcmNlIiwiQWN0aXZlV2lkZ2V0U3RvcmUiLCJBY3RpdmVXaWRnZXRTdG9yZUV2ZW50IiwiRG9jayIsIm9uRG9jayIsIlVuZG9jayIsIm9uVW5kb2NrIiwiUm9vbUV2ZW50IiwiTXlNZW1iZXJzaGlwIiwib25NeU1lbWJlcnNoaXAiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwiYmVmb3JlVW5sb2FkIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvQ2FsbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgeyBUeXBlZEV2ZW50RW1pdHRlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvdHlwZWQtZXZlbnQtZW1pdHRlclwiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NsaWVudFwiO1xuaW1wb3J0IHsgUm9vbUV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQgeyBSb29tU3RhdGVFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbS1zdGF0ZVwiO1xuaW1wb3J0IHsgQ2FsbFR5cGUgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvd2VicnRjL2NhbGxcIjtcbmltcG9ydCB7IElXaWRnZXRBcGlSZXF1ZXN0IH0gZnJvbSBcIm1hdHJpeC13aWRnZXQtYXBpXCI7XG5cbmltcG9ydCB0eXBlIEV2ZW50RW1pdHRlciBmcm9tIFwiZXZlbnRzXCI7XG5pbXBvcnQgdHlwZSB7IElNeURldmljZSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jbGllbnRcIjtcbmltcG9ydCB0eXBlIHsgUm9vbSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuaW1wb3J0IHR5cGUgeyBSb29tTWVtYmVyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tLW1lbWJlclwiO1xuaW1wb3J0IHR5cGUgeyBDbGllbnRXaWRnZXRBcGkgfSBmcm9tIFwibWF0cml4LXdpZGdldC1hcGlcIjtcbmltcG9ydCB0eXBlIHsgSUFwcCB9IGZyb20gXCIuLi9zdG9yZXMvV2lkZ2V0U3RvcmVcIjtcbmltcG9ydCBNZWRpYURldmljZUhhbmRsZXIsIHsgTWVkaWFEZXZpY2VLaW5kRW51bSB9IGZyb20gXCIuLi9NZWRpYURldmljZUhhbmRsZXJcIjtcbmltcG9ydCB7IHRpbWVvdXQgfSBmcm9tIFwiLi4vdXRpbHMvcHJvbWlzZVwiO1xuaW1wb3J0IFdpZGdldFV0aWxzIGZyb20gXCIuLi91dGlscy9XaWRnZXRVdGlsc1wiO1xuaW1wb3J0IHsgV2lkZ2V0VHlwZSB9IGZyb20gXCIuLi93aWRnZXRzL1dpZGdldFR5cGVcIjtcbmltcG9ydCB7IEVsZW1lbnRXaWRnZXRBY3Rpb25zIH0gZnJvbSBcIi4uL3N0b3Jlcy93aWRnZXRzL0VsZW1lbnRXaWRnZXRBY3Rpb25zXCI7XG5pbXBvcnQgV2lkZ2V0U3RvcmUgZnJvbSBcIi4uL3N0b3Jlcy9XaWRnZXRTdG9yZVwiO1xuaW1wb3J0IHsgV2lkZ2V0TWVzc2FnaW5nU3RvcmUsIFdpZGdldE1lc3NhZ2luZ1N0b3JlRXZlbnQgfSBmcm9tIFwiLi4vc3RvcmVzL3dpZGdldHMvV2lkZ2V0TWVzc2FnaW5nU3RvcmVcIjtcbmltcG9ydCBBY3RpdmVXaWRnZXRTdG9yZSwgeyBBY3RpdmVXaWRnZXRTdG9yZUV2ZW50IH0gZnJvbSBcIi4uL3N0b3Jlcy9BY3RpdmVXaWRnZXRTdG9yZVwiO1xuXG5jb25zdCBUSU1FT1VUX01TID0gMTYwMDA7XG5cbi8vIFdhaXRzIHVudGlsIGFuIGV2ZW50IGlzIGVtaXR0ZWQgc2F0aXNmeWluZyB0aGUgZ2l2ZW4gcHJlZGljYXRlXG5jb25zdCB3YWl0Rm9yRXZlbnQgPSBhc3luYyAoZW1pdHRlcjogRXZlbnRFbWl0dGVyLCBldmVudDogc3RyaW5nLCBwcmVkOiAoLi4uYXJncykgPT4gYm9vbGVhbiA9ICgpID0+IHRydWUpID0+IHtcbiAgICBsZXQgbGlzdGVuZXI6ICguLi5hcmdzKSA9PiB2b2lkO1xuICAgIGNvbnN0IHdhaXQgPSBuZXcgUHJvbWlzZTx2b2lkPihyZXNvbHZlID0+IHtcbiAgICAgICAgbGlzdGVuZXIgPSAoLi4uYXJncykgPT4geyBpZiAocHJlZCguLi5hcmdzKSkgcmVzb2x2ZSgpOyB9O1xuICAgICAgICBlbWl0dGVyLm9uKGV2ZW50LCBsaXN0ZW5lcik7XG4gICAgfSk7XG5cbiAgICBjb25zdCB0aW1lZE91dCA9IGF3YWl0IHRpbWVvdXQod2FpdCwgZmFsc2UsIFRJTUVPVVRfTVMpID09PSBmYWxzZTtcbiAgICBlbWl0dGVyLm9mZihldmVudCwgbGlzdGVuZXIpO1xuICAgIGlmICh0aW1lZE91dCkgdGhyb3cgbmV3IEVycm9yKFwiVGltZWQgb3V0XCIpO1xufTtcblxuZXhwb3J0IGVudW0gQ29ubmVjdGlvblN0YXRlIHtcbiAgICBEaXNjb25uZWN0ZWQgPSBcImRpc2Nvbm5lY3RlZFwiLFxuICAgIENvbm5lY3RpbmcgPSBcImNvbm5lY3RpbmdcIixcbiAgICBDb25uZWN0ZWQgPSBcImNvbm5lY3RlZFwiLFxuICAgIERpc2Nvbm5lY3RpbmcgPSBcImRpc2Nvbm5lY3RpbmdcIixcbn1cblxuZXhwb3J0IGNvbnN0IGlzQ29ubmVjdGVkID0gKHN0YXRlOiBDb25uZWN0aW9uU3RhdGUpOiBib29sZWFuID0+XG4gICAgc3RhdGUgPT09IENvbm5lY3Rpb25TdGF0ZS5Db25uZWN0ZWQgfHwgc3RhdGUgPT09IENvbm5lY3Rpb25TdGF0ZS5EaXNjb25uZWN0aW5nO1xuXG5leHBvcnQgZW51bSBDYWxsRXZlbnQge1xuICAgIENvbm5lY3Rpb25TdGF0ZSA9IFwiY29ubmVjdGlvbl9zdGF0ZVwiLFxuICAgIFBhcnRpY2lwYW50cyA9IFwicGFydGljaXBhbnRzXCIsXG4gICAgRGVzdHJveSA9IFwiZGVzdHJveVwiLFxufVxuXG5pbnRlcmZhY2UgQ2FsbEV2ZW50SGFuZGxlck1hcCB7XG4gICAgW0NhbGxFdmVudC5Db25uZWN0aW9uU3RhdGVdOiAoc3RhdGU6IENvbm5lY3Rpb25TdGF0ZSwgcHJldlN0YXRlOiBDb25uZWN0aW9uU3RhdGUpID0+IHZvaWQ7XG4gICAgW0NhbGxFdmVudC5QYXJ0aWNpcGFudHNdOiAocGFydGljaXBhbnRzOiBTZXQ8Um9vbU1lbWJlcj4pID0+IHZvaWQ7XG4gICAgW0NhbGxFdmVudC5EZXN0cm95XTogKCkgPT4gdm9pZDtcbn1cblxuaW50ZXJmYWNlIEppdHNpQ2FsbE1lbWJlckNvbnRlbnQge1xuICAgIC8vIENvbm5lY3RlZCBkZXZpY2UgSURzXG4gICAgZGV2aWNlczogc3RyaW5nW107XG4gICAgLy8gVGltZSBhdCB3aGljaCB0aGlzIHN0YXRlIGV2ZW50IHNob3VsZCBiZSBjb25zaWRlcmVkIHN0YWxlXG4gICAgZXhwaXJlc190czogbnVtYmVyO1xufVxuXG4vKipcbiAqIEEgZ3JvdXAgY2FsbCBhY2Nlc3NlZCB0aHJvdWdoIGEgd2lkZ2V0LlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ2FsbCBleHRlbmRzIFR5cGVkRXZlbnRFbWl0dGVyPENhbGxFdmVudCwgQ2FsbEV2ZW50SGFuZGxlck1hcD4ge1xuICAgIHByb3RlY3RlZCByZWFkb25seSB3aWRnZXRVaWQgPSBXaWRnZXRVdGlscy5nZXRXaWRnZXRVaWQodGhpcy53aWRnZXQpO1xuXG4gICAgcHJpdmF0ZSBfbWVzc2FnaW5nOiBDbGllbnRXaWRnZXRBcGkgfCBudWxsID0gbnVsbDtcbiAgICAvKipcbiAgICAgKiBUaGUgd2lkZ2V0J3MgbWVzc2FnaW5nLCBvciBudWxsIGlmIGRpc2Nvbm5lY3RlZC5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZ2V0IG1lc3NhZ2luZygpOiBDbGllbnRXaWRnZXRBcGkgfCBudWxsIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21lc3NhZ2luZztcbiAgICB9XG4gICAgcHJpdmF0ZSBzZXQgbWVzc2FnaW5nKHZhbHVlOiBDbGllbnRXaWRnZXRBcGkgfCBudWxsKSB7XG4gICAgICAgIHRoaXMuX21lc3NhZ2luZyA9IHZhbHVlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgcm9vbUlkKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLndpZGdldC5yb29tSWQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfY29ubmVjdGlvblN0YXRlOiBDb25uZWN0aW9uU3RhdGUgPSBDb25uZWN0aW9uU3RhdGUuRGlzY29ubmVjdGVkO1xuICAgIHB1YmxpYyBnZXQgY29ubmVjdGlvblN0YXRlKCk6IENvbm5lY3Rpb25TdGF0ZSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jb25uZWN0aW9uU3RhdGU7XG4gICAgfVxuICAgIHByb3RlY3RlZCBzZXQgY29ubmVjdGlvblN0YXRlKHZhbHVlOiBDb25uZWN0aW9uU3RhdGUpIHtcbiAgICAgICAgY29uc3QgcHJldlZhbHVlID0gdGhpcy5fY29ubmVjdGlvblN0YXRlO1xuICAgICAgICB0aGlzLl9jb25uZWN0aW9uU3RhdGUgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5lbWl0KENhbGxFdmVudC5Db25uZWN0aW9uU3RhdGUsIHZhbHVlLCBwcmV2VmFsdWUpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgY29ubmVjdGVkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gaXNDb25uZWN0ZWQodGhpcy5jb25uZWN0aW9uU3RhdGUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3BhcnRpY2lwYW50cyA9IG5ldyBTZXQ8Um9vbU1lbWJlcj4oKTtcbiAgICBwdWJsaWMgZ2V0IHBhcnRpY2lwYW50cygpOiBTZXQ8Um9vbU1lbWJlcj4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGFydGljaXBhbnRzO1xuICAgIH1cbiAgICBwcm90ZWN0ZWQgc2V0IHBhcnRpY2lwYW50cyh2YWx1ZTogU2V0PFJvb21NZW1iZXI+KSB7XG4gICAgICAgIHRoaXMuX3BhcnRpY2lwYW50cyA9IHZhbHVlO1xuICAgICAgICB0aGlzLmVtaXQoQ2FsbEV2ZW50LlBhcnRpY2lwYW50cywgdmFsdWUpO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIHdpZGdldCB1c2VkIHRvIGFjY2VzcyB0aGlzIGNhbGwuXG4gICAgICAgICAqL1xuICAgICAgICBwdWJsaWMgcmVhZG9ubHkgd2lkZ2V0OiBJQXBwLFxuICAgICkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGNhbGwgYXNzb2NpYXRlZCB3aXRoIHRoZSBnaXZlbiByb29tLCBpZiBhbnkuXG4gICAgICogQHBhcmFtIHtSb29tfSByb29tIFRoZSByb29tLlxuICAgICAqIEByZXR1cm5zIHtDYWxsIHwgbnVsbH0gVGhlIGNhbGwuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBnZXQocm9vbTogUm9vbSk6IENhbGwgfCBudWxsIHtcbiAgICAgICAgLy8gVGhlcmUncyBjdXJyZW50bHkgb25seSBvbmUgaW1wbGVtZW50YXRpb25cbiAgICAgICAgcmV0dXJuIEppdHNpQ2FsbC5nZXQocm9vbSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUGVyZm9ybXMgYSByb3V0aW5lIGNoZWNrIG9mIHRoZSBjYWxsJ3MgYXNzb2NpYXRlZCByb29tIHN0YXRlLCBjbGVhbmluZyB1cFxuICAgICAqIGFueSBkYXRhIGxlZnQgb3ZlciBmcm9tIGFuIHVuY2xlYW4gZGlzY29ubmVjdGlvbi5cbiAgICAgKi9cbiAgICBwdWJsaWMgYWJzdHJhY3QgY2xlYW4oKTogUHJvbWlzZTx2b2lkPjtcblxuICAgIC8qKlxuICAgICAqIENvbnRhY3RzIHRoZSB3aWRnZXQgdG8gY29ubmVjdCB0byB0aGUgY2FsbC5cbiAgICAgKiBAcGFyYW0ge01lZGlhRGV2aWNlSW5mbyB8IG51bGx9IGF1ZGlvRGV2aWNlIFRoZSBhdWRpbyBpbnB1dCB0byB1c2UsIG9yXG4gICAgICogICBudWxsIHRvIHN0YXJ0IG11dGVkLlxuICAgICAqIEBwYXJhbSB7TWVkaWFEZXZpY2VJbmZvIHwgbnVsbH0gYXVkaW9EZXZpY2UgVGhlIHZpZGVvIGlucHV0IHRvIHVzZSwgb3JcbiAgICAgKiAgIG51bGwgdG8gc3RhcnQgbXV0ZWQuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IHBlcmZvcm1Db25uZWN0aW9uKFxuICAgICAgICBhdWRpb0lucHV0OiBNZWRpYURldmljZUluZm8gfCBudWxsLFxuICAgICAgICB2aWRlb0lucHV0OiBNZWRpYURldmljZUluZm8gfCBudWxsLFxuICAgICk6IFByb21pc2U8dm9pZD47XG5cbiAgICAvKipcbiAgICAgKiBDb250YWN0cyB0aGUgd2lkZ2V0IHRvIGRpc2Nvbm5lY3QgZnJvbSB0aGUgY2FsbC5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgcGVyZm9ybURpc2Nvbm5lY3Rpb24oKTogUHJvbWlzZTx2b2lkPjtcblxuICAgIC8qKlxuICAgICAqIENvbm5lY3RzIHRoZSB1c2VyIHRvIHRoZSBjYWxsIHVzaW5nIHRoZSBtZWRpYSBkZXZpY2VzIHNldCBpblxuICAgICAqIE1lZGlhRGV2aWNlSGFuZGxlci4gVGhlIHdpZGdldCBhc3NvY2lhdGVkIHdpdGggdGhlIGNhbGwgbXVzdCBiZSBhY3RpdmVcbiAgICAgKiBmb3IgdGhpcyB0byBzdWNjZWVkLlxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBjb25uZWN0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICB0aGlzLmNvbm5lY3Rpb25TdGF0ZSA9IENvbm5lY3Rpb25TdGF0ZS5Db25uZWN0aW5nO1xuXG4gICAgICAgIGNvbnN0IHtcbiAgICAgICAgICAgIFtNZWRpYURldmljZUtpbmRFbnVtLkF1ZGlvSW5wdXRdOiBhdWRpb0lucHV0cyxcbiAgICAgICAgICAgIFtNZWRpYURldmljZUtpbmRFbnVtLlZpZGVvSW5wdXRdOiB2aWRlb0lucHV0cyxcbiAgICAgICAgfSA9IGF3YWl0IE1lZGlhRGV2aWNlSGFuZGxlci5nZXREZXZpY2VzKCk7XG5cbiAgICAgICAgbGV0IGF1ZGlvSW5wdXQ6IE1lZGlhRGV2aWNlSW5mbyB8IG51bGwgPSBudWxsO1xuICAgICAgICBpZiAoIU1lZGlhRGV2aWNlSGFuZGxlci5zdGFydFdpdGhBdWRpb011dGVkKSB7XG4gICAgICAgICAgICBjb25zdCBkZXZpY2VJZCA9IE1lZGlhRGV2aWNlSGFuZGxlci5nZXRBdWRpb0lucHV0KCk7XG4gICAgICAgICAgICBhdWRpb0lucHV0ID0gYXVkaW9JbnB1dHMuZmluZChkID0+IGQuZGV2aWNlSWQgPT09IGRldmljZUlkKSA/PyBhdWRpb0lucHV0c1swXSA/PyBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGxldCB2aWRlb0lucHV0OiBNZWRpYURldmljZUluZm8gfCBudWxsID0gbnVsbDtcbiAgICAgICAgaWYgKCFNZWRpYURldmljZUhhbmRsZXIuc3RhcnRXaXRoVmlkZW9NdXRlZCkge1xuICAgICAgICAgICAgY29uc3QgZGV2aWNlSWQgPSBNZWRpYURldmljZUhhbmRsZXIuZ2V0VmlkZW9JbnB1dCgpO1xuICAgICAgICAgICAgdmlkZW9JbnB1dCA9IHZpZGVvSW5wdXRzLmZpbmQoZCA9PiBkLmRldmljZUlkID09PSBkZXZpY2VJZCkgPz8gdmlkZW9JbnB1dHNbMF0gPz8gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG1lc3NhZ2luZ1N0b3JlID0gV2lkZ2V0TWVzc2FnaW5nU3RvcmUuaW5zdGFuY2U7XG4gICAgICAgIHRoaXMubWVzc2FnaW5nID0gbWVzc2FnaW5nU3RvcmUuZ2V0TWVzc2FnaW5nRm9yVWlkKHRoaXMud2lkZ2V0VWlkKTtcbiAgICAgICAgaWYgKCF0aGlzLm1lc3NhZ2luZykge1xuICAgICAgICAgICAgLy8gVGhlIHdpZGdldCBtaWdodCBzdGlsbCBiZSBpbml0aWFsaXppbmcsIHNvIHdhaXQgZm9yIGl0XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHdhaXRGb3JFdmVudChcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnaW5nU3RvcmUsXG4gICAgICAgICAgICAgICAgICAgIFdpZGdldE1lc3NhZ2luZ1N0b3JlRXZlbnQuU3RvcmVNZXNzYWdpbmcsXG4gICAgICAgICAgICAgICAgICAgICh1aWQ6IHN0cmluZywgd2lkZ2V0QXBpOiBDbGllbnRXaWRnZXRBcGkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1aWQgPT09IHRoaXMud2lkZ2V0VWlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZXNzYWdpbmcgPSB3aWRnZXRBcGk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBiaW5kIGNhbGwgd2lkZ2V0IGluIHJvb20gJHt0aGlzLnJvb21JZH06ICR7ZX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBlcmZvcm1Db25uZWN0aW9uKGF1ZGlvSW5wdXQsIHZpZGVvSW5wdXQpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLmNvbm5lY3Rpb25TdGF0ZSA9IENvbm5lY3Rpb25TdGF0ZS5EaXNjb25uZWN0ZWQ7XG4gICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jb25uZWN0aW9uU3RhdGUgPSBDb25uZWN0aW9uU3RhdGUuQ29ubmVjdGVkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERpc2Nvbm5lY3RzIHRoZSB1c2VyIGZyb20gdGhlIGNhbGwuXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIGRpc2Nvbm5lY3QoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGlmICh0aGlzLmNvbm5lY3Rpb25TdGF0ZSAhPT0gQ29ubmVjdGlvblN0YXRlLkNvbm5lY3RlZCkgdGhyb3cgbmV3IEVycm9yKFwiTm90IGNvbm5lY3RlZFwiKTtcblxuICAgICAgICB0aGlzLmNvbm5lY3Rpb25TdGF0ZSA9IENvbm5lY3Rpb25TdGF0ZS5EaXNjb25uZWN0aW5nO1xuICAgICAgICBhd2FpdCB0aGlzLnBlcmZvcm1EaXNjb25uZWN0aW9uKCk7XG4gICAgICAgIHRoaXMuc2V0RGlzY29ubmVjdGVkKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWFudWFsbHkgbWFya3MgdGhlIGNhbGwgYXMgZGlzY29ubmVjdGVkIGFuZCBjbGVhbnMgdXAuXG4gICAgICovXG4gICAgcHVibGljIHNldERpc2Nvbm5lY3RlZCgpIHtcbiAgICAgICAgdGhpcy5tZXNzYWdpbmcgPSBudWxsO1xuICAgICAgICB0aGlzLmNvbm5lY3Rpb25TdGF0ZSA9IENvbm5lY3Rpb25TdGF0ZS5EaXNjb25uZWN0ZWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3RvcHMgYWxsIGludGVybmFsIHRpbWVycyBhbmQgdGFza3MgdG8gcHJlcGFyZSBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9uLlxuICAgICAqL1xuICAgIHB1YmxpYyBkZXN0cm95KCkge1xuICAgICAgICBpZiAodGhpcy5jb25uZWN0ZWQpIHRoaXMuc2V0RGlzY29ubmVjdGVkKCk7XG4gICAgICAgIHRoaXMuZW1pdChDYWxsRXZlbnQuRGVzdHJveSk7XG4gICAgfVxufVxuXG4vKipcbiAqIEEgZ3JvdXAgY2FsbCB1c2luZyBKaXRzaSBhcyBhIGJhY2tlbmQuXG4gKi9cbmV4cG9ydCBjbGFzcyBKaXRzaUNhbGwgZXh0ZW5kcyBDYWxsIHtcbiAgICBwdWJsaWMgc3RhdGljIHJlYWRvbmx5IE1FTUJFUl9FVkVOVF9UWVBFID0gXCJpby5lbGVtZW50LnZpZGVvLm1lbWJlclwiO1xuICAgIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgU1RVQ0tfREVWSUNFX1RJTUVPVVRfTVMgPSAxMDAwICogNjAgKiA2MDsgLy8gMSBob3VyXG5cbiAgICBwcml2YXRlIHJvb206IFJvb20gPSB0aGlzLmNsaWVudC5nZXRSb29tKHRoaXMucm9vbUlkKSE7XG4gICAgcHJpdmF0ZSByZXNlbmREZXZpY2VzVGltZXI6IG51bWJlciB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgcGFydGljaXBhbnRzRXhwaXJhdGlvblRpbWVyOiBudW1iZXIgfCBudWxsID0gbnVsbDtcblxuICAgIHByaXZhdGUgY29uc3RydWN0b3Iod2lkZ2V0OiBJQXBwLCBwcml2YXRlIHJlYWRvbmx5IGNsaWVudDogTWF0cml4Q2xpZW50KSB7XG4gICAgICAgIHN1cGVyKHdpZGdldCk7XG5cbiAgICAgICAgdGhpcy5yb29tLm9uKFJvb21TdGF0ZUV2ZW50LlVwZGF0ZSwgdGhpcy5vblJvb21TdGF0ZSk7XG4gICAgICAgIHRoaXMub24oQ2FsbEV2ZW50LkNvbm5lY3Rpb25TdGF0ZSwgdGhpcy5vbkNvbm5lY3Rpb25TdGF0ZSk7XG4gICAgICAgIHRoaXMudXBkYXRlUGFydGljaXBhbnRzKCk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBnZXQocm9vbTogUm9vbSk6IEppdHNpQ2FsbCB8IG51bGwge1xuICAgICAgICBjb25zdCBhcHBzID0gV2lkZ2V0U3RvcmUuaW5zdGFuY2UuZ2V0QXBwcyhyb29tLnJvb21JZCk7XG4gICAgICAgIC8vIFRoZSBpc1ZpZGVvQ2hhbm5lbCBmaWVsZCBkaWZmZXJlbnRpYXRlcyByaWNoIEppdHNpIGNhbGxzIGZyb20gYmFyZSBKaXRzaSB3aWRnZXRzXG4gICAgICAgIGNvbnN0IGppdHNpV2lkZ2V0ID0gYXBwcy5maW5kKGFwcCA9PiBXaWRnZXRUeXBlLkpJVFNJLm1hdGNoZXMoYXBwLnR5cGUpICYmIGFwcC5kYXRhPy5pc1ZpZGVvQ2hhbm5lbCk7XG4gICAgICAgIHJldHVybiBqaXRzaVdpZGdldCA/IG5ldyBKaXRzaUNhbGwoaml0c2lXaWRnZXQsIHJvb20uY2xpZW50KSA6IG51bGw7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyBjcmVhdGUocm9vbTogUm9vbSk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBhd2FpdCBXaWRnZXRVdGlscy5hZGRKaXRzaVdpZGdldChyb29tLnJvb21JZCwgQ2FsbFR5cGUuVmlkZW8sIFwiR3JvdXAgY2FsbFwiLCB0cnVlLCByb29tLm5hbWUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgdXBkYXRlUGFydGljaXBhbnRzKCkge1xuICAgICAgICBpZiAodGhpcy5wYXJ0aWNpcGFudHNFeHBpcmF0aW9uVGltZXIgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnBhcnRpY2lwYW50c0V4cGlyYXRpb25UaW1lcik7XG4gICAgICAgICAgICB0aGlzLnBhcnRpY2lwYW50c0V4cGlyYXRpb25UaW1lciA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBtZW1iZXJzID0gbmV3IFNldDxSb29tTWVtYmVyPigpO1xuICAgICAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgICBsZXQgYWxsRXhwaXJlQXQgPSBJbmZpbml0eTtcblxuICAgICAgICBmb3IgKGNvbnN0IGUgb2YgdGhpcy5yb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhKaXRzaUNhbGwuTUVNQkVSX0VWRU5UX1RZUEUpKSB7XG4gICAgICAgICAgICBjb25zdCBtZW1iZXIgPSB0aGlzLnJvb20uZ2V0TWVtYmVyKGUuZ2V0U3RhdGVLZXkoKSEpO1xuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGUuZ2V0Q29udGVudDxKaXRzaUNhbGxNZW1iZXJDb250ZW50PigpO1xuICAgICAgICAgICAgbGV0IGRldmljZXMgPSBBcnJheS5pc0FycmF5KGNvbnRlbnQuZGV2aWNlcykgPyBjb250ZW50LmRldmljZXMgOiBbXTtcbiAgICAgICAgICAgIGNvbnN0IGV4cGlyZXNBdCA9IHR5cGVvZiBjb250ZW50LmV4cGlyZXNfdHMgPT09IFwibnVtYmVyXCIgPyBjb250ZW50LmV4cGlyZXNfdHMgOiAtSW5maW5pdHk7XG5cbiAgICAgICAgICAgIC8vIEFwcGx5IGxvY2FsIGVjaG8gZm9yIHRoZSBkaXNjb25uZWN0ZWQgY2FzZVxuICAgICAgICAgICAgaWYgKCF0aGlzLmNvbm5lY3RlZCAmJiBtZW1iZXI/LnVzZXJJZCA9PT0gdGhpcy5jbGllbnQuZ2V0VXNlcklkKCkpIHtcbiAgICAgICAgICAgICAgICBkZXZpY2VzID0gZGV2aWNlcy5maWx0ZXIoZCA9PiBkICE9PSB0aGlzLmNsaWVudC5nZXREZXZpY2VJZCgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIE11c3QgaGF2ZSBhIGNvbm5lY3RlZCBkZXZpY2UsIGJlIHVuZXhwaXJlZCwgYW5kIHN0aWxsIGJlIGpvaW5lZCB0byB0aGUgcm9vbVxuICAgICAgICAgICAgaWYgKGRldmljZXMubGVuZ3RoICYmIGV4cGlyZXNBdCA+IG5vdyAmJiBtZW1iZXI/Lm1lbWJlcnNoaXAgPT09IFwiam9pblwiKSB7XG4gICAgICAgICAgICAgICAgbWVtYmVycy5hZGQobWVtYmVyKTtcbiAgICAgICAgICAgICAgICBpZiAoZXhwaXJlc0F0IDwgYWxsRXhwaXJlQXQpIGFsbEV4cGlyZUF0ID0gZXhwaXJlc0F0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXBwbHkgbG9jYWwgZWNobyBmb3IgdGhlIGNvbm5lY3RlZCBjYXNlXG4gICAgICAgIGlmICh0aGlzLmNvbm5lY3RlZCkgbWVtYmVycy5hZGQodGhpcy5yb29tLmdldE1lbWJlcih0aGlzLmNsaWVudC5nZXRVc2VySWQoKSEpISk7XG5cbiAgICAgICAgdGhpcy5wYXJ0aWNpcGFudHMgPSBtZW1iZXJzO1xuICAgICAgICBpZiAoYWxsRXhwaXJlQXQgPCBJbmZpbml0eSkge1xuICAgICAgICAgICAgdGhpcy5wYXJ0aWNpcGFudHNFeHBpcmF0aW9uVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHRoaXMudXBkYXRlUGFydGljaXBhbnRzKCksIGFsbEV4cGlyZUF0IC0gbm93KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEhlbHBlciBtZXRob2QgdGhhdCB1cGRhdGVzIG91ciBtZW1iZXIgc3RhdGUgd2l0aCB0aGUgZGV2aWNlcyByZXR1cm5lZCBieVxuICAgIC8vIHRoZSBnaXZlbiBmdW5jdGlvbi4gSWYgaXQgcmV0dXJucyBudWxsLCB0aGUgdXBkYXRlIGlzIHNraXBwZWQuXG4gICAgcHJpdmF0ZSBhc3luYyB1cGRhdGVEZXZpY2VzKGZuOiAoZGV2aWNlczogc3RyaW5nW10pID0+IChzdHJpbmdbXSB8IG51bGwpKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGlmICh0aGlzLnJvb20uZ2V0TXlNZW1iZXJzaGlwKCkgIT09IFwiam9pblwiKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgZGV2aWNlc1N0YXRlID0gdGhpcy5yb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhcbiAgICAgICAgICAgIEppdHNpQ2FsbC5NRU1CRVJfRVZFTlRfVFlQRSwgdGhpcy5jbGllbnQuZ2V0VXNlcklkKCkhLFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBkZXZpY2VzID0gZGV2aWNlc1N0YXRlPy5nZXRDb250ZW50PEppdHNpQ2FsbE1lbWJlckNvbnRlbnQ+KCkuZGV2aWNlcyA/PyBbXTtcbiAgICAgICAgY29uc3QgbmV3RGV2aWNlcyA9IGZuKGRldmljZXMpO1xuXG4gICAgICAgIGlmIChuZXdEZXZpY2VzKSB7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50OiBKaXRzaUNhbGxNZW1iZXJDb250ZW50ID0ge1xuICAgICAgICAgICAgICAgIGRldmljZXM6IG5ld0RldmljZXMsXG4gICAgICAgICAgICAgICAgZXhwaXJlc190czogRGF0ZS5ub3coKSArIEppdHNpQ2FsbC5TVFVDS19ERVZJQ0VfVElNRU9VVF9NUyxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGF3YWl0IHRoaXMuY2xpZW50LnNlbmRTdGF0ZUV2ZW50KFxuICAgICAgICAgICAgICAgIHRoaXMucm9vbUlkLCBKaXRzaUNhbGwuTUVNQkVSX0VWRU5UX1RZUEUsIGNvbnRlbnQsIHRoaXMuY2xpZW50LmdldFVzZXJJZCgpISxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGFkZE91ckRldmljZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgYXdhaXQgdGhpcy51cGRhdGVEZXZpY2VzKGRldmljZXMgPT4gQXJyYXkuZnJvbShuZXcgU2V0KGRldmljZXMpLmFkZCh0aGlzLmNsaWVudC5nZXREZXZpY2VJZCgpKSkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcmVtb3ZlT3VyRGV2aWNlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBhd2FpdCB0aGlzLnVwZGF0ZURldmljZXMoZGV2aWNlcyA9PiB7XG4gICAgICAgICAgICBjb25zdCBkZXZpY2VzU2V0ID0gbmV3IFNldChkZXZpY2VzKTtcbiAgICAgICAgICAgIGRldmljZXNTZXQuZGVsZXRlKHRoaXMuY2xpZW50LmdldERldmljZUlkKCkpO1xuICAgICAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oZGV2aWNlc1NldCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBjbGVhbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgY29uc3QgeyBkZXZpY2VzOiBteURldmljZXMgfSA9IGF3YWl0IHRoaXMuY2xpZW50LmdldERldmljZXMoKTtcbiAgICAgICAgY29uc3QgZGV2aWNlTWFwID0gbmV3IE1hcDxzdHJpbmcsIElNeURldmljZT4obXlEZXZpY2VzLm1hcChkID0+IFtkLmRldmljZV9pZCwgZF0pKTtcblxuICAgICAgICAvLyBDbGVhbiB1cCBvdXIgbWVtYmVyIHN0YXRlIGJ5IGZpbHRlcmluZyBvdXQgbG9nZ2VkIG91dCBkZXZpY2VzLFxuICAgICAgICAvLyBpbmFjdGl2ZSBkZXZpY2VzLCBhbmQgb3VyIG93biBkZXZpY2UgKGlmIHdlJ3JlIGRpc2Nvbm5lY3RlZClcbiAgICAgICAgYXdhaXQgdGhpcy51cGRhdGVEZXZpY2VzKGRldmljZXMgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3RGV2aWNlcyA9IGRldmljZXMuZmlsdGVyKGQgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRldmljZSA9IGRldmljZU1hcC5nZXQoZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRldmljZT8ubGFzdF9zZWVuX3RzXG4gICAgICAgICAgICAgICAgICAgICYmICEoZCA9PT0gdGhpcy5jbGllbnQuZ2V0RGV2aWNlSWQoKSAmJiAhdGhpcy5jb25uZWN0ZWQpXG4gICAgICAgICAgICAgICAgICAgICYmIChub3cgLSBkZXZpY2UubGFzdF9zZWVuX3RzKSA8IEppdHNpQ2FsbC5TVFVDS19ERVZJQ0VfVElNRU9VVF9NUztcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBTa2lwIHRoZSB1cGRhdGUgaWYgdGhlIGRldmljZXMgYXJlIHVuY2hhbmdlZFxuICAgICAgICAgICAgcmV0dXJuIG5ld0RldmljZXMubGVuZ3RoID09PSBkZXZpY2VzLmxlbmd0aCA/IG51bGwgOiBuZXdEZXZpY2VzO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYXN5bmMgcGVyZm9ybUNvbm5lY3Rpb24oXG4gICAgICAgIGF1ZGlvSW5wdXQ6IE1lZGlhRGV2aWNlSW5mbyB8IG51bGwsXG4gICAgICAgIHZpZGVvSW5wdXQ6IE1lZGlhRGV2aWNlSW5mbyB8IG51bGwsXG4gICAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIC8vIEVuc3VyZSB0aGF0IHRoZSBtZXNzYWdpbmcgZG9lc24ndCBnZXQgc3RvcHBlZCB3aGlsZSB3ZSdyZSB3YWl0aW5nIGZvciByZXNwb25zZXNcbiAgICAgICAgY29uc3QgZG9udFN0b3BNZXNzYWdpbmcgPSBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdpbmdTdG9yZSA9IFdpZGdldE1lc3NhZ2luZ1N0b3JlLmluc3RhbmNlO1xuXG4gICAgICAgICAgICBjb25zdCBsaXN0ZW5lciA9ICh1aWQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh1aWQgPT09IHRoaXMud2lkZ2V0VWlkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIk1lc3NhZ2luZyBzdG9wcGVkXCIpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgZG9uZSA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IGNsZWFudXAgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgbWVzc2FnaW5nU3RvcmUub2ZmKFdpZGdldE1lc3NhZ2luZ1N0b3JlRXZlbnQuU3RvcE1lc3NhZ2luZywgbGlzdGVuZXIpO1xuICAgICAgICAgICAgICAgIHRoaXMub2ZmKENhbGxFdmVudC5Db25uZWN0aW9uU3RhdGUsIGRvbmUpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgbWVzc2FnaW5nU3RvcmUub24oV2lkZ2V0TWVzc2FnaW5nU3RvcmVFdmVudC5TdG9wTWVzc2FnaW5nLCBsaXN0ZW5lcik7XG4gICAgICAgICAgICB0aGlzLm9uKENhbGxFdmVudC5Db25uZWN0aW9uU3RhdGUsIGRvbmUpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBFbXBpcmljYWxseSwgaXQncyBwb3NzaWJsZSBmb3IgSml0c2kgTWVldCB0byBjcmFzaCBpbnN0YW50bHkgYXQgc3RhcnR1cCxcbiAgICAgICAgLy8gc2VuZGluZyBhIGhhbmd1cCBldmVudCB0aGF0IHJhY2VzIHdpdGggdGhlIHJlc3Qgb2YgdGhpcyBtZXRob2QsIHNvIHdlIG5lZWRcbiAgICAgICAgLy8gdG8gYWRkIHRoZSBoYW5ndXAgbGlzdGVuZXIgbm93IHJhdGhlciB0aGFuIGxhdGVyXG4gICAgICAgIHRoaXMubWVzc2FnaW5nIS5vbihgYWN0aW9uOiR7RWxlbWVudFdpZGdldEFjdGlvbnMuSGFuZ3VwQ2FsbH1gLCB0aGlzLm9uSGFuZ3VwKTtcblxuICAgICAgICAvLyBBY3R1YWxseSBwZXJmb3JtIHRoZSBqb2luXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gd2FpdEZvckV2ZW50KFxuICAgICAgICAgICAgdGhpcy5tZXNzYWdpbmchLFxuICAgICAgICAgICAgYGFjdGlvbjoke0VsZW1lbnRXaWRnZXRBY3Rpb25zLkpvaW5DYWxsfWAsXG4gICAgICAgICAgICAoZXY6IEN1c3RvbUV2ZW50PElXaWRnZXRBcGlSZXF1ZXN0PikgPT4ge1xuICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5tZXNzYWdpbmchLnRyYW5zcG9ydC5yZXBseShldi5kZXRhaWwsIHt9KTsgLy8gYWNrXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICApO1xuICAgICAgICBjb25zdCByZXF1ZXN0ID0gdGhpcy5tZXNzYWdpbmchLnRyYW5zcG9ydC5zZW5kKEVsZW1lbnRXaWRnZXRBY3Rpb25zLkpvaW5DYWxsLCB7XG4gICAgICAgICAgICBhdWRpb0lucHV0OiBhdWRpb0lucHV0Py5sYWJlbCA/PyBudWxsLFxuICAgICAgICAgICAgdmlkZW9JbnB1dDogdmlkZW9JbnB1dD8ubGFiZWwgPz8gbnVsbCxcbiAgICAgICAgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBQcm9taXNlLnJhY2UoW1Byb21pc2UuYWxsKFtyZXF1ZXN0LCByZXNwb25zZV0pLCBkb250U3RvcE1lc3NhZ2luZ10pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvLyBJZiBpdCB0aW1lZCBvdXQsIGNsZWFuIHVwIG91ciBhZHZhbmNlIHByZXBhcmF0aW9uc1xuICAgICAgICAgICAgdGhpcy5tZXNzYWdpbmchLm9mZihgYWN0aW9uOiR7RWxlbWVudFdpZGdldEFjdGlvbnMuSGFuZ3VwQ2FsbH1gLCB0aGlzLm9uSGFuZ3VwKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMubWVzc2FnaW5nIS50cmFuc3BvcnQucmVhZHkpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgbWVzc2FnaW5nIHN0aWxsIGV4aXN0cywgd2hpY2ggbWVhbnMgSml0c2kgbWlnaHQgc3RpbGwgYmUgZ29pbmcgaW4gdGhlIGJhY2tncm91bmRcbiAgICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2luZyEudHJhbnNwb3J0LnNlbmQoRWxlbWVudFdpZGdldEFjdGlvbnMuSGFuZ3VwQ2FsbCwgeyBmb3JjZTogdHJ1ZSB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gam9pbiBjYWxsIGluIHJvb20gJHt0aGlzLnJvb21JZH06ICR7ZX1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIEFjdGl2ZVdpZGdldFN0b3JlLmluc3RhbmNlLm9uKEFjdGl2ZVdpZGdldFN0b3JlRXZlbnQuRG9jaywgdGhpcy5vbkRvY2spO1xuICAgICAgICBBY3RpdmVXaWRnZXRTdG9yZS5pbnN0YW5jZS5vbihBY3RpdmVXaWRnZXRTdG9yZUV2ZW50LlVuZG9jaywgdGhpcy5vblVuZG9jayk7XG4gICAgICAgIHRoaXMucm9vbS5vbihSb29tRXZlbnQuTXlNZW1iZXJzaGlwLCB0aGlzLm9uTXlNZW1iZXJzaGlwKTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJiZWZvcmV1bmxvYWRcIiwgdGhpcy5iZWZvcmVVbmxvYWQpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBhc3luYyBwZXJmb3JtRGlzY29ubmVjdGlvbigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSB3YWl0Rm9yRXZlbnQoXG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2luZyEsXG4gICAgICAgICAgICBgYWN0aW9uOiR7RWxlbWVudFdpZGdldEFjdGlvbnMuSGFuZ3VwQ2FsbH1gLFxuICAgICAgICAgICAgKGV2OiBDdXN0b21FdmVudDxJV2lkZ2V0QXBpUmVxdWVzdD4pID0+IHtcbiAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIHRoaXMubWVzc2FnaW5nIS50cmFuc3BvcnQucmVwbHkoZXYuZGV0YWlsLCB7fSk7IC8vIGFja1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IHRoaXMubWVzc2FnaW5nIS50cmFuc3BvcnQuc2VuZChFbGVtZW50V2lkZ2V0QWN0aW9ucy5IYW5ndXBDYWxsLCB7fSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChbcmVxdWVzdCwgcmVzcG9uc2VdKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gaGFuZ3VwIGNhbGwgaW4gcm9vbSAke3RoaXMucm9vbUlkfTogJHtlfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHNldERpc2Nvbm5lY3RlZCgpIHtcbiAgICAgICAgdGhpcy5tZXNzYWdpbmchLm9mZihgYWN0aW9uOiR7RWxlbWVudFdpZGdldEFjdGlvbnMuSGFuZ3VwQ2FsbH1gLCB0aGlzLm9uSGFuZ3VwKTtcbiAgICAgICAgQWN0aXZlV2lkZ2V0U3RvcmUuaW5zdGFuY2Uub2ZmKEFjdGl2ZVdpZGdldFN0b3JlRXZlbnQuRG9jaywgdGhpcy5vbkRvY2spO1xuICAgICAgICBBY3RpdmVXaWRnZXRTdG9yZS5pbnN0YW5jZS5vZmYoQWN0aXZlV2lkZ2V0U3RvcmVFdmVudC5VbmRvY2ssIHRoaXMub25VbmRvY2spO1xuICAgICAgICB0aGlzLnJvb20ub2ZmKFJvb21FdmVudC5NeU1lbWJlcnNoaXAsIHRoaXMub25NeU1lbWJlcnNoaXApO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImJlZm9yZXVubG9hZFwiLCB0aGlzLmJlZm9yZVVubG9hZCk7XG5cbiAgICAgICAgc3VwZXIuc2V0RGlzY29ubmVjdGVkKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMucm9vbS5vZmYoUm9vbVN0YXRlRXZlbnQuVXBkYXRlLCB0aGlzLnVwZGF0ZVBhcnRpY2lwYW50cyk7XG4gICAgICAgIHRoaXMub24oQ2FsbEV2ZW50LkNvbm5lY3Rpb25TdGF0ZSwgdGhpcy5vbkNvbm5lY3Rpb25TdGF0ZSk7XG4gICAgICAgIGlmICh0aGlzLnBhcnRpY2lwYW50c0V4cGlyYXRpb25UaW1lciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMucGFydGljaXBhbnRzRXhwaXJhdGlvblRpbWVyKTtcbiAgICAgICAgICAgIHRoaXMucGFydGljaXBhbnRzRXhwaXJhdGlvblRpbWVyID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5yZXNlbmREZXZpY2VzVGltZXIgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5yZXNlbmREZXZpY2VzVGltZXIpO1xuICAgICAgICAgICAgdGhpcy5yZXNlbmREZXZpY2VzVGltZXIgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgc3VwZXIuZGVzdHJveSgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25Sb29tU3RhdGUgPSAoKSA9PiB0aGlzLnVwZGF0ZVBhcnRpY2lwYW50cygpO1xuXG4gICAgcHJpdmF0ZSBvbkNvbm5lY3Rpb25TdGF0ZSA9IGFzeW5jIChzdGF0ZTogQ29ubmVjdGlvblN0YXRlLCBwcmV2U3RhdGU6IENvbm5lY3Rpb25TdGF0ZSkgPT4ge1xuICAgICAgICBpZiAoc3RhdGUgPT09IENvbm5lY3Rpb25TdGF0ZS5Db25uZWN0ZWQgJiYgcHJldlN0YXRlID09PSBDb25uZWN0aW9uU3RhdGUuQ29ubmVjdGluZykge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVQYXJ0aWNpcGFudHMoKTtcblxuICAgICAgICAgICAgLy8gVGVsbCBvdGhlcnMgdGhhdCB3ZSdyZSBjb25uZWN0ZWQsIGJ5IGFkZGluZyBvdXIgZGV2aWNlIHRvIHJvb20gc3RhdGVcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuYWRkT3VyRGV2aWNlKCk7XG4gICAgICAgICAgICAvLyBSZS1hZGQgdGhpcyBkZXZpY2UgZXZlcnkgc28gb2Z0ZW4gc28gb3VyIHZpZGVvIG1lbWJlciBldmVudCBkb2Vzbid0IGJlY29tZSBzdGFsZVxuICAgICAgICAgICAgdGhpcy5yZXNlbmREZXZpY2VzVGltZXIgPSBzZXRJbnRlcnZhbChhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmxvZyhgUmVzZW5kaW5nIHZpZGVvIG1lbWJlciBldmVudCBmb3IgJHt0aGlzLnJvb21JZH1gKTtcbiAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLmFkZE91ckRldmljZSgpO1xuICAgICAgICAgICAgfSwgKEppdHNpQ2FsbC5TVFVDS19ERVZJQ0VfVElNRU9VVF9NUyAqIDMpIC8gNCk7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IENvbm5lY3Rpb25TdGF0ZS5EaXNjb25uZWN0ZWQgJiYgaXNDb25uZWN0ZWQocHJldlN0YXRlKSkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVQYXJ0aWNpcGFudHMoKTtcblxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLnJlc2VuZERldmljZXNUaW1lcik7XG4gICAgICAgICAgICB0aGlzLnJlc2VuZERldmljZXNUaW1lciA9IG51bGw7XG4gICAgICAgICAgICAvLyBUZWxsIG90aGVycyB0aGF0IHdlJ3JlIGRpc2Nvbm5lY3RlZCwgYnkgcmVtb3Zpbmcgb3VyIGRldmljZSBmcm9tIHJvb20gc3RhdGVcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucmVtb3ZlT3VyRGV2aWNlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkRvY2sgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIC8vIFRoZSB3aWRnZXQgaXMgbm8gbG9uZ2VyIGEgUGlQLCBzbyBsZXQncyByZXN0b3JlIHRoZSBkZWZhdWx0IGxheW91dFxuICAgICAgICBhd2FpdCB0aGlzLm1lc3NhZ2luZyEudHJhbnNwb3J0LnNlbmQoRWxlbWVudFdpZGdldEFjdGlvbnMuVGlsZUxheW91dCwge30pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVW5kb2NrID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAvLyBUaGUgd2lkZ2V0IGhhcyBiZWNvbWUgYSBQaVAsIHNvIGxldCdzIHN3aXRjaCBKaXRzaSB0byBzcG90bGlnaHQgbW9kZVxuICAgICAgICAvLyB0byBvbmx5IHNob3cgdGhlIGFjdGl2ZSBzcGVha2VyIGFuZCBlY29ub21pemUgb24gc3BhY2VcbiAgICAgICAgYXdhaXQgdGhpcy5tZXNzYWdpbmchLnRyYW5zcG9ydC5zZW5kKEVsZW1lbnRXaWRnZXRBY3Rpb25zLlNwb3RsaWdodExheW91dCwge30pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uTXlNZW1iZXJzaGlwID0gYXN5bmMgKHJvb206IFJvb20sIG1lbWJlcnNoaXA6IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAobWVtYmVyc2hpcCAhPT0gXCJqb2luXCIpIHRoaXMuc2V0RGlzY29ubmVjdGVkKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgYmVmb3JlVW5sb2FkID0gKCkgPT4gdGhpcy5zZXREaXNjb25uZWN0ZWQoKTtcblxuICAgIHByaXZhdGUgb25IYW5ndXAgPSBhc3luYyAoZXY6IEN1c3RvbUV2ZW50PElXaWRnZXRBcGlSZXF1ZXN0PikgPT4ge1xuICAgICAgICAvLyBJZiB3ZSdyZSBhbHJlYWR5IGluIHRoZSBtaWRkbGUgb2YgYSBjbGllbnQtaW5pdGlhdGVkIGRpc2Nvbm5lY3Rpb24sXG4gICAgICAgIC8vIGlnbm9yZSB0aGUgZXZlbnRcbiAgICAgICAgaWYgKHRoaXMuY29ubmVjdGlvblN0YXRlID09PSBDb25uZWN0aW9uU3RhdGUuRGlzY29ubmVjdGluZykgcmV0dXJuO1xuXG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgLy8gSW4gY2FzZSB0aGlzIGhhbmd1cCBpcyBjYXVzZWQgYnkgSml0c2kgTWVldCBjcmFzaGluZyBhdCBzdGFydHVwLFxuICAgICAgICAvLyB3YWl0IGZvciB0aGUgY29ubmVjdGlvbiBldmVudCBpbiBvcmRlciB0byBhdm9pZCByYWNpbmdcbiAgICAgICAgaWYgKHRoaXMuY29ubmVjdGlvblN0YXRlID09PSBDb25uZWN0aW9uU3RhdGUuQ29ubmVjdGluZykge1xuICAgICAgICAgICAgYXdhaXQgd2FpdEZvckV2ZW50KHRoaXMsIENhbGxFdmVudC5Db25uZWN0aW9uU3RhdGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgYXdhaXQgdGhpcy5tZXNzYWdpbmchLnRyYW5zcG9ydC5yZXBseShldi5kZXRhaWwsIHt9KTsgLy8gYWNrXG4gICAgICAgIHRoaXMuc2V0RGlzY29ubmVjdGVkKCk7XG4gICAgfTtcbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBU0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQXJDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUF5QkEsTUFBTUEsVUFBVSxHQUFHLEtBQW5CLEMsQ0FFQTs7QUFDQSxNQUFNQyxZQUFZLEdBQUcsZ0JBQU9DLE9BQVAsRUFBOEJDLEtBQTlCLEVBQXlGO0VBQUEsSUFBNUNDLElBQTRDLHVFQUFmLE1BQU0sSUFBUztFQUMxRyxJQUFJQyxRQUFKO0VBQ0EsTUFBTUMsSUFBSSxHQUFHLElBQUlDLE9BQUosQ0FBa0JDLE9BQU8sSUFBSTtJQUN0Q0gsUUFBUSxHQUFHLFlBQWE7TUFBRSxJQUFJRCxJQUFJLENBQUMsWUFBRCxDQUFSLEVBQW1CSSxPQUFPO0lBQUssQ0FBekQ7O0lBQ0FOLE9BQU8sQ0FBQ08sRUFBUixDQUFXTixLQUFYLEVBQWtCRSxRQUFsQjtFQUNILENBSFksQ0FBYjtFQUtBLE1BQU1LLFFBQVEsR0FBRyxPQUFNLElBQUFDLGdCQUFBLEVBQVFMLElBQVIsRUFBYyxLQUFkLEVBQXFCTixVQUFyQixDQUFOLE1BQTJDLEtBQTVEO0VBQ0FFLE9BQU8sQ0FBQ1UsR0FBUixDQUFZVCxLQUFaLEVBQW1CRSxRQUFuQjtFQUNBLElBQUlLLFFBQUosRUFBYyxNQUFNLElBQUlHLEtBQUosQ0FBVSxXQUFWLENBQU47QUFDakIsQ0FWRDs7SUFZWUMsZTs7O1dBQUFBLGU7RUFBQUEsZTtFQUFBQSxlO0VBQUFBLGU7RUFBQUEsZTtHQUFBQSxlLCtCQUFBQSxlOztBQU9MLE1BQU1DLFdBQVcsR0FBSUMsS0FBRCxJQUN2QkEsS0FBSyxLQUFLRixlQUFlLENBQUNHLFNBQTFCLElBQXVDRCxLQUFLLEtBQUtGLGVBQWUsQ0FBQ0ksYUFEOUQ7OztJQUdLQyxTOzs7V0FBQUEsUztFQUFBQSxTO0VBQUFBLFM7RUFBQUEsUztHQUFBQSxTLHlCQUFBQSxTOztBQW1CWjtBQUNBO0FBQ0E7QUFDTyxNQUFlQyxJQUFmLFNBQTRCQyxvQ0FBNUIsQ0FBOEU7RUFJakY7QUFDSjtBQUNBO0VBQzJCLElBQVRDLFNBQVMsR0FBMkI7SUFDOUMsT0FBTyxLQUFLQyxVQUFaO0VBQ0g7O0VBQ29CLElBQVRELFNBQVMsQ0FBQ0UsS0FBRCxFQUFnQztJQUNqRCxLQUFLRCxVQUFMLEdBQWtCQyxLQUFsQjtFQUNIOztFQUVnQixJQUFOQyxNQUFNLEdBQVc7SUFDeEIsT0FBTyxLQUFLQyxNQUFMLENBQVlELE1BQW5CO0VBQ0g7O0VBR3lCLElBQWZFLGVBQWUsR0FBb0I7SUFDMUMsT0FBTyxLQUFLQyxnQkFBWjtFQUNIOztFQUM0QixJQUFmRCxlQUFlLENBQUNILEtBQUQsRUFBeUI7SUFDbEQsTUFBTUssU0FBUyxHQUFHLEtBQUtELGdCQUF2QjtJQUNBLEtBQUtBLGdCQUFMLEdBQXdCSixLQUF4QjtJQUNBLEtBQUtNLElBQUwsQ0FBVVgsU0FBUyxDQUFDTCxlQUFwQixFQUFxQ1UsS0FBckMsRUFBNENLLFNBQTVDO0VBQ0g7O0VBRW1CLElBQVRFLFNBQVMsR0FBWTtJQUM1QixPQUFPaEIsV0FBVyxDQUFDLEtBQUtZLGVBQU4sQ0FBbEI7RUFDSDs7RUFHc0IsSUFBWkssWUFBWSxHQUFvQjtJQUN2QyxPQUFPLEtBQUtDLGFBQVo7RUFDSDs7RUFDeUIsSUFBWkQsWUFBWSxDQUFDUixLQUFELEVBQXlCO0lBQy9DLEtBQUtTLGFBQUwsR0FBcUJULEtBQXJCO0lBQ0EsS0FBS00sSUFBTCxDQUFVWCxTQUFTLENBQUNlLFlBQXBCLEVBQWtDVixLQUFsQztFQUNIOztFQUVEVyxXQUFXO0VBQ1A7QUFDUjtBQUNBO0VBQ3dCVCxNQUpULEVBS1Q7SUFDRTtJQURGLEtBRGtCQSxNQUNsQixHQURrQkEsTUFDbEI7SUFBQSxpREE3QzZCVSxvQkFBQSxDQUFZQyxZQUFaLENBQXlCLEtBQUtYLE1BQTlCLENBNkM3QjtJQUFBLGtEQTNDMkMsSUEyQzNDO0lBQUEsd0RBNUIwQ1osZUFBZSxDQUFDd0IsWUE0QjFEO0lBQUEscURBZHNCLElBQUlDLEdBQUosRUFjdEI7RUFFRDtFQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7OztFQUNxQixPQUFIQyxHQUFHLENBQUNDLElBQUQsRUFBMEI7SUFDdkM7SUFDQSxPQUFPQyxTQUFTLENBQUNGLEdBQVYsQ0FBY0MsSUFBZCxDQUFQO0VBQ0g7RUFFRDtBQUNKO0FBQ0E7QUFDQTs7O0VBb0JJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7RUFDd0IsTUFBUEUsT0FBTyxHQUFrQjtJQUNsQyxLQUFLaEIsZUFBTCxHQUF1QmIsZUFBZSxDQUFDOEIsVUFBdkM7SUFFQSxNQUFNO01BQ0YsQ0FBQ0MsdUNBQUEsQ0FBb0JDLFVBQXJCLEdBQWtDQyxXQURoQztNQUVGLENBQUNGLHVDQUFBLENBQW9CRyxVQUFyQixHQUFrQ0M7SUFGaEMsSUFHRixNQUFNQywyQkFBQSxDQUFtQkMsVUFBbkIsRUFIVjtJQUtBLElBQUlDLFVBQWtDLEdBQUcsSUFBekM7O0lBQ0EsSUFBSSxDQUFDRiwyQkFBQSxDQUFtQkcsbUJBQXhCLEVBQTZDO01BQ3pDLE1BQU1DLFFBQVEsR0FBR0osMkJBQUEsQ0FBbUJLLGFBQW5CLEVBQWpCOztNQUNBSCxVQUFVLEdBQUdMLFdBQVcsQ0FBQ1MsSUFBWixDQUFpQkMsQ0FBQyxJQUFJQSxDQUFDLENBQUNILFFBQUYsS0FBZUEsUUFBckMsS0FBa0RQLFdBQVcsQ0FBQyxDQUFELENBQTdELElBQW9FLElBQWpGO0lBQ0g7O0lBQ0QsSUFBSVcsVUFBa0MsR0FBRyxJQUF6Qzs7SUFDQSxJQUFJLENBQUNSLDJCQUFBLENBQW1CUyxtQkFBeEIsRUFBNkM7TUFDekMsTUFBTUwsUUFBUSxHQUFHSiwyQkFBQSxDQUFtQlUsYUFBbkIsRUFBakI7O01BQ0FGLFVBQVUsR0FBR1QsV0FBVyxDQUFDTyxJQUFaLENBQWlCQyxDQUFDLElBQUlBLENBQUMsQ0FBQ0gsUUFBRixLQUFlQSxRQUFyQyxLQUFrREwsV0FBVyxDQUFDLENBQUQsQ0FBN0QsSUFBb0UsSUFBakY7SUFDSDs7SUFFRCxNQUFNWSxjQUFjLEdBQUdDLDBDQUFBLENBQXFCQyxRQUE1QztJQUNBLEtBQUt6QyxTQUFMLEdBQWlCdUMsY0FBYyxDQUFDRyxrQkFBZixDQUFrQyxLQUFLQyxTQUF2QyxDQUFqQjs7SUFDQSxJQUFJLENBQUMsS0FBSzNDLFNBQVYsRUFBcUI7TUFDakI7TUFDQSxJQUFJO1FBQ0EsTUFBTXJCLFlBQVksQ0FDZDRELGNBRGMsRUFFZEssK0NBQUEsQ0FBMEJDLGNBRlosRUFHZCxDQUFDQyxHQUFELEVBQWNDLFNBQWQsS0FBNkM7VUFDekMsSUFBSUQsR0FBRyxLQUFLLEtBQUtILFNBQWpCLEVBQTRCO1lBQ3hCLEtBQUszQyxTQUFMLEdBQWlCK0MsU0FBakI7WUFDQSxPQUFPLElBQVA7VUFDSDs7VUFDRCxPQUFPLEtBQVA7UUFDSCxDQVRhLENBQWxCO01BV0gsQ0FaRCxDQVlFLE9BQU9DLENBQVAsRUFBVTtRQUNSLE1BQU0sSUFBSXpELEtBQUosQ0FBVyxzQ0FBcUMsS0FBS1ksTUFBTyxLQUFJNkMsQ0FBRSxFQUFsRSxDQUFOO01BQ0g7SUFDSjs7SUFFRCxJQUFJO01BQ0EsTUFBTSxLQUFLQyxpQkFBTCxDQUF1Qm5CLFVBQXZCLEVBQW1DTSxVQUFuQyxDQUFOO0lBQ0gsQ0FGRCxDQUVFLE9BQU9ZLENBQVAsRUFBVTtNQUNSLEtBQUszQyxlQUFMLEdBQXVCYixlQUFlLENBQUN3QixZQUF2QztNQUNBLE1BQU1nQyxDQUFOO0lBQ0g7O0lBRUQsS0FBSzNDLGVBQUwsR0FBdUJiLGVBQWUsQ0FBQ0csU0FBdkM7RUFDSDtFQUVEO0FBQ0o7QUFDQTs7O0VBQzJCLE1BQVZ1RCxVQUFVLEdBQWtCO0lBQ3JDLElBQUksS0FBSzdDLGVBQUwsS0FBeUJiLGVBQWUsQ0FBQ0csU0FBN0MsRUFBd0QsTUFBTSxJQUFJSixLQUFKLENBQVUsZUFBVixDQUFOO0lBRXhELEtBQUtjLGVBQUwsR0FBdUJiLGVBQWUsQ0FBQ0ksYUFBdkM7SUFDQSxNQUFNLEtBQUt1RCxvQkFBTCxFQUFOO0lBQ0EsS0FBS0MsZUFBTDtFQUNIO0VBRUQ7QUFDSjtBQUNBOzs7RUFDV0EsZUFBZSxHQUFHO0lBQ3JCLEtBQUtwRCxTQUFMLEdBQWlCLElBQWpCO0lBQ0EsS0FBS0ssZUFBTCxHQUF1QmIsZUFBZSxDQUFDd0IsWUFBdkM7RUFDSDtFQUVEO0FBQ0o7QUFDQTs7O0VBQ1dxQyxPQUFPLEdBQUc7SUFDYixJQUFJLEtBQUs1QyxTQUFULEVBQW9CLEtBQUsyQyxlQUFMO0lBQ3BCLEtBQUs1QyxJQUFMLENBQVVYLFNBQVMsQ0FBQ3lELE9BQXBCO0VBQ0g7O0FBbktnRjtBQXNLckY7QUFDQTtBQUNBOzs7OztBQUNPLE1BQU1sQyxTQUFOLFNBQXdCdEIsSUFBeEIsQ0FBNkI7RUFFaUM7RUFNekRlLFdBQVcsQ0FBQ1QsTUFBRCxFQUFnQ21ELE1BQWhDLEVBQXNEO0lBQ3JFLE1BQU1uRCxNQUFOO0lBRHFFLEtBQXRCbUQsTUFBc0IsR0FBdEJBLE1BQXNCO0lBQUEsNENBSnBELEtBQUtBLE1BQUwsQ0FBWUMsT0FBWixDQUFvQixLQUFLckQsTUFBekIsQ0FJb0Q7SUFBQSwwREFIN0IsSUFHNkI7SUFBQSxtRUFGcEIsSUFFb0I7SUFBQSxtREEyTm5ELE1BQU0sS0FBS3NELGtCQUFMLEVBM042QztJQUFBLHlEQTZON0MsT0FBTy9ELEtBQVAsRUFBK0JnRSxTQUEvQixLQUE4RDtNQUN0RixJQUFJaEUsS0FBSyxLQUFLRixlQUFlLENBQUNHLFNBQTFCLElBQXVDK0QsU0FBUyxLQUFLbEUsZUFBZSxDQUFDOEIsVUFBekUsRUFBcUY7UUFDakYsS0FBS21DLGtCQUFMLEdBRGlGLENBR2pGOztRQUNBLE1BQU0sS0FBS0UsWUFBTCxFQUFOLENBSmlGLENBS2pGOztRQUNBLEtBQUtDLGtCQUFMLEdBQTBCQyxXQUFXLENBQUMsWUFBWTtVQUM5Q0MsY0FBQSxDQUFPQyxHQUFQLENBQVksb0NBQW1DLEtBQUs1RCxNQUFPLEVBQTNEOztVQUNBLE1BQU0sS0FBS3dELFlBQUwsRUFBTjtRQUNILENBSG9DLEVBR2pDdkMsU0FBUyxDQUFDNEMsdUJBQVYsR0FBb0MsQ0FBckMsR0FBMEMsQ0FIUixDQUFyQztNQUlILENBVkQsTUFVTyxJQUFJdEUsS0FBSyxLQUFLRixlQUFlLENBQUN3QixZQUExQixJQUEwQ3ZCLFdBQVcsQ0FBQ2lFLFNBQUQsQ0FBekQsRUFBc0U7UUFDekUsS0FBS0Qsa0JBQUw7UUFFQVEsYUFBYSxDQUFDLEtBQUtMLGtCQUFOLENBQWI7UUFDQSxLQUFLQSxrQkFBTCxHQUEwQixJQUExQixDQUp5RSxDQUt6RTs7UUFDQSxNQUFNLEtBQUtNLGVBQUwsRUFBTjtNQUNIO0lBQ0osQ0FoUHdFO0lBQUEsOENBa1B4RCxZQUFZO01BQ3pCO01BQ0EsTUFBTSxLQUFLbEUsU0FBTCxDQUFnQm1FLFNBQWhCLENBQTBCQyxJQUExQixDQUErQkMsMENBQUEsQ0FBcUJDLFVBQXBELEVBQWdFLEVBQWhFLENBQU47SUFDSCxDQXJQd0U7SUFBQSxnREF1UHRELFlBQVk7TUFDM0I7TUFDQTtNQUNBLE1BQU0sS0FBS3RFLFNBQUwsQ0FBZ0JtRSxTQUFoQixDQUEwQkMsSUFBMUIsQ0FBK0JDLDBDQUFBLENBQXFCRSxlQUFwRCxFQUFxRSxFQUFyRSxDQUFOO0lBQ0gsQ0EzUHdFO0lBQUEsc0RBNlBoRCxPQUFPcEQsSUFBUCxFQUFtQnFELFVBQW5CLEtBQTBDO01BQy9ELElBQUlBLFVBQVUsS0FBSyxNQUFuQixFQUEyQixLQUFLcEIsZUFBTDtJQUM5QixDQS9Qd0U7SUFBQSxvREFpUWxELE1BQU0sS0FBS0EsZUFBTCxFQWpRNEM7SUFBQSxnREFtUXRELE1BQU9xQixFQUFQLElBQThDO01BQzdEO01BQ0E7TUFDQSxJQUFJLEtBQUtwRSxlQUFMLEtBQXlCYixlQUFlLENBQUNJLGFBQTdDLEVBQTREO01BRTVENkUsRUFBRSxDQUFDQyxjQUFILEdBTDZELENBTzdEO01BQ0E7O01BQ0EsSUFBSSxLQUFLckUsZUFBTCxLQUF5QmIsZUFBZSxDQUFDOEIsVUFBN0MsRUFBeUQ7UUFDckQsTUFBTTNDLFlBQVksQ0FBQyxJQUFELEVBQU9rQixTQUFTLENBQUNMLGVBQWpCLENBQWxCO01BQ0g7O01BRUQsTUFBTSxLQUFLUSxTQUFMLENBQWdCbUUsU0FBaEIsQ0FBMEJRLEtBQTFCLENBQWdDRixFQUFFLENBQUNHLE1BQW5DLEVBQTJDLEVBQTNDLENBQU4sQ0FiNkQsQ0FhUDs7TUFDdEQsS0FBS3hCLGVBQUw7SUFDSCxDQWxSd0U7SUFHckUsS0FBS2pDLElBQUwsQ0FBVWhDLEVBQVYsQ0FBYTBGLHlCQUFBLENBQWVDLE1BQTVCLEVBQW9DLEtBQUtDLFdBQXpDO0lBQ0EsS0FBSzVGLEVBQUwsQ0FBUVUsU0FBUyxDQUFDTCxlQUFsQixFQUFtQyxLQUFLd0YsaUJBQXhDO0lBQ0EsS0FBS3ZCLGtCQUFMO0VBQ0g7O0VBRWdCLE9BQUh2QyxHQUFHLENBQUNDLElBQUQsRUFBK0I7SUFDNUMsTUFBTThELElBQUksR0FBR0Msb0JBQUEsQ0FBWXpDLFFBQVosQ0FBcUIwQyxPQUFyQixDQUE2QmhFLElBQUksQ0FBQ2hCLE1BQWxDLENBQWIsQ0FENEMsQ0FFNUM7OztJQUNBLE1BQU1pRixXQUFXLEdBQUdILElBQUksQ0FBQy9DLElBQUwsQ0FBVW1ELEdBQUcsSUFBSUMsc0JBQUEsQ0FBV0MsS0FBWCxDQUFpQkMsT0FBakIsQ0FBeUJILEdBQUcsQ0FBQ0ksSUFBN0IsS0FBc0NKLEdBQUcsQ0FBQ0ssSUFBSixFQUFVQyxjQUFqRSxDQUFwQjtJQUNBLE9BQU9QLFdBQVcsR0FBRyxJQUFJaEUsU0FBSixDQUFjZ0UsV0FBZCxFQUEyQmpFLElBQUksQ0FBQ29DLE1BQWhDLENBQUgsR0FBNkMsSUFBL0Q7RUFDSDs7RUFFeUIsYUFBTnFDLE1BQU0sQ0FBQ3pFLElBQUQsRUFBNEI7SUFDbEQsTUFBTUwsb0JBQUEsQ0FBWStFLGNBQVosQ0FBMkIxRSxJQUFJLENBQUNoQixNQUFoQyxFQUF3QzJGLGNBQUEsQ0FBU0MsS0FBakQsRUFBd0QsWUFBeEQsRUFBc0UsSUFBdEUsRUFBNEU1RSxJQUFJLENBQUM2RSxJQUFqRixDQUFOO0VBQ0g7O0VBRU92QyxrQkFBa0IsR0FBRztJQUN6QixJQUFJLEtBQUt3QywyQkFBTCxLQUFxQyxJQUF6QyxFQUErQztNQUMzQ0MsWUFBWSxDQUFDLEtBQUtELDJCQUFOLENBQVo7TUFDQSxLQUFLQSwyQkFBTCxHQUFtQyxJQUFuQztJQUNIOztJQUVELE1BQU1FLE9BQU8sR0FBRyxJQUFJbEYsR0FBSixFQUFoQjtJQUNBLE1BQU1tRixHQUFHLEdBQUdDLElBQUksQ0FBQ0QsR0FBTCxFQUFaO0lBQ0EsSUFBSUUsV0FBVyxHQUFHQyxRQUFsQjs7SUFFQSxLQUFLLE1BQU12RCxDQUFYLElBQWdCLEtBQUs3QixJQUFMLENBQVVxRixZQUFWLENBQXVCQyxjQUF2QixDQUFzQ3JGLFNBQVMsQ0FBQ3NGLGlCQUFoRCxDQUFoQixFQUFvRjtNQUNoRixNQUFNQyxNQUFNLEdBQUcsS0FBS3hGLElBQUwsQ0FBVXlGLFNBQVYsQ0FBb0I1RCxDQUFDLENBQUM2RCxXQUFGLEVBQXBCLENBQWY7TUFDQSxNQUFNQyxPQUFPLEdBQUc5RCxDQUFDLENBQUMrRCxVQUFGLEVBQWhCO01BQ0EsSUFBSUMsT0FBTyxHQUFHQyxLQUFLLENBQUNDLE9BQU4sQ0FBY0osT0FBTyxDQUFDRSxPQUF0QixJQUFpQ0YsT0FBTyxDQUFDRSxPQUF6QyxHQUFtRCxFQUFqRTtNQUNBLE1BQU1HLFNBQVMsR0FBRyxPQUFPTCxPQUFPLENBQUNNLFVBQWYsS0FBOEIsUUFBOUIsR0FBeUNOLE9BQU8sQ0FBQ00sVUFBakQsR0FBOEQsQ0FBQ2IsUUFBakYsQ0FKZ0YsQ0FNaEY7O01BQ0EsSUFBSSxDQUFDLEtBQUs5RixTQUFOLElBQW1Ca0csTUFBTSxFQUFFVSxNQUFSLEtBQW1CLEtBQUs5RCxNQUFMLENBQVkrRCxTQUFaLEVBQTFDLEVBQW1FO1FBQy9ETixPQUFPLEdBQUdBLE9BQU8sQ0FBQ08sTUFBUixDQUFlcEYsQ0FBQyxJQUFJQSxDQUFDLEtBQUssS0FBS29CLE1BQUwsQ0FBWWlFLFdBQVosRUFBMUIsQ0FBVjtNQUNILENBVCtFLENBVWhGOzs7TUFDQSxJQUFJUixPQUFPLENBQUNTLE1BQVIsSUFBa0JOLFNBQVMsR0FBR2YsR0FBOUIsSUFBcUNPLE1BQU0sRUFBRW5DLFVBQVIsS0FBdUIsTUFBaEUsRUFBd0U7UUFDcEUyQixPQUFPLENBQUN1QixHQUFSLENBQVlmLE1BQVo7UUFDQSxJQUFJUSxTQUFTLEdBQUdiLFdBQWhCLEVBQTZCQSxXQUFXLEdBQUdhLFNBQWQ7TUFDaEM7SUFDSixDQXpCd0IsQ0EyQnpCOzs7SUFDQSxJQUFJLEtBQUsxRyxTQUFULEVBQW9CMEYsT0FBTyxDQUFDdUIsR0FBUixDQUFZLEtBQUt2RyxJQUFMLENBQVV5RixTQUFWLENBQW9CLEtBQUtyRCxNQUFMLENBQVkrRCxTQUFaLEVBQXBCLENBQVo7SUFFcEIsS0FBSzVHLFlBQUwsR0FBb0J5RixPQUFwQjs7SUFDQSxJQUFJRyxXQUFXLEdBQUdDLFFBQWxCLEVBQTRCO01BQ3hCLEtBQUtOLDJCQUFMLEdBQW1DMEIsVUFBVSxDQUFDLE1BQU0sS0FBS2xFLGtCQUFMLEVBQVAsRUFBa0M2QyxXQUFXLEdBQUdGLEdBQWhELENBQTdDO0lBQ0g7RUFDSixDQTdEK0IsQ0ErRGhDO0VBQ0E7OztFQUMyQixNQUFid0IsYUFBYSxDQUFDQyxFQUFELEVBQThEO0lBQ3JGLElBQUksS0FBSzFHLElBQUwsQ0FBVTJHLGVBQVYsT0FBZ0MsTUFBcEMsRUFBNEM7SUFFNUMsTUFBTUMsWUFBWSxHQUFHLEtBQUs1RyxJQUFMLENBQVVxRixZQUFWLENBQXVCQyxjQUF2QixDQUNqQnJGLFNBQVMsQ0FBQ3NGLGlCQURPLEVBQ1ksS0FBS25ELE1BQUwsQ0FBWStELFNBQVosRUFEWixDQUFyQjtJQUdBLE1BQU1OLE9BQU8sR0FBR2UsWUFBWSxFQUFFaEIsVUFBZCxHQUFtREMsT0FBbkQsSUFBOEQsRUFBOUU7SUFDQSxNQUFNZ0IsVUFBVSxHQUFHSCxFQUFFLENBQUNiLE9BQUQsQ0FBckI7O0lBRUEsSUFBSWdCLFVBQUosRUFBZ0I7TUFDWixNQUFNbEIsT0FBK0IsR0FBRztRQUNwQ0UsT0FBTyxFQUFFZ0IsVUFEMkI7UUFFcENaLFVBQVUsRUFBRWYsSUFBSSxDQUFDRCxHQUFMLEtBQWFoRixTQUFTLENBQUM0QztNQUZDLENBQXhDO01BS0EsTUFBTSxLQUFLVCxNQUFMLENBQVkwRSxjQUFaLENBQ0YsS0FBSzlILE1BREgsRUFDV2lCLFNBQVMsQ0FBQ3NGLGlCQURyQixFQUN3Q0ksT0FEeEMsRUFDaUQsS0FBS3ZELE1BQUwsQ0FBWStELFNBQVosRUFEakQsQ0FBTjtJQUdIO0VBQ0o7O0VBRXlCLE1BQVozRCxZQUFZLEdBQWtCO0lBQ3hDLE1BQU0sS0FBS2lFLGFBQUwsQ0FBbUJaLE9BQU8sSUFBSUMsS0FBSyxDQUFDaUIsSUFBTixDQUFXLElBQUlqSCxHQUFKLENBQVErRixPQUFSLEVBQWlCVSxHQUFqQixDQUFxQixLQUFLbkUsTUFBTCxDQUFZaUUsV0FBWixFQUFyQixDQUFYLENBQTlCLENBQU47RUFDSDs7RUFFNEIsTUFBZnRELGVBQWUsR0FBa0I7SUFDM0MsTUFBTSxLQUFLMEQsYUFBTCxDQUFtQlosT0FBTyxJQUFJO01BQ2hDLE1BQU1tQixVQUFVLEdBQUcsSUFBSWxILEdBQUosQ0FBUStGLE9BQVIsQ0FBbkI7TUFDQW1CLFVBQVUsQ0FBQ0MsTUFBWCxDQUFrQixLQUFLN0UsTUFBTCxDQUFZaUUsV0FBWixFQUFsQjtNQUNBLE9BQU9QLEtBQUssQ0FBQ2lCLElBQU4sQ0FBV0MsVUFBWCxDQUFQO0lBQ0gsQ0FKSyxDQUFOO0VBS0g7O0VBRWlCLE1BQUxFLEtBQUssR0FBa0I7SUFDaEMsTUFBTWpDLEdBQUcsR0FBR0MsSUFBSSxDQUFDRCxHQUFMLEVBQVo7SUFDQSxNQUFNO01BQUVZLE9BQU8sRUFBRXNCO0lBQVgsSUFBeUIsTUFBTSxLQUFLL0UsTUFBTCxDQUFZMUIsVUFBWixFQUFyQztJQUNBLE1BQU0wRyxTQUFTLEdBQUcsSUFBSUMsR0FBSixDQUEyQkYsU0FBUyxDQUFDRyxHQUFWLENBQWN0RyxDQUFDLElBQUksQ0FBQ0EsQ0FBQyxDQUFDdUcsU0FBSCxFQUFjdkcsQ0FBZCxDQUFuQixDQUEzQixDQUFsQixDQUhnQyxDQUtoQztJQUNBOztJQUNBLE1BQU0sS0FBS3lGLGFBQUwsQ0FBbUJaLE9BQU8sSUFBSTtNQUNoQyxNQUFNZ0IsVUFBVSxHQUFHaEIsT0FBTyxDQUFDTyxNQUFSLENBQWVwRixDQUFDLElBQUk7UUFDbkMsTUFBTXdHLE1BQU0sR0FBR0osU0FBUyxDQUFDckgsR0FBVixDQUFjaUIsQ0FBZCxDQUFmO1FBQ0EsT0FBT3dHLE1BQU0sRUFBRUMsWUFBUixJQUNBLEVBQUV6RyxDQUFDLEtBQUssS0FBS29CLE1BQUwsQ0FBWWlFLFdBQVosRUFBTixJQUFtQyxDQUFDLEtBQUsvRyxTQUEzQyxDQURBLElBRUMyRixHQUFHLEdBQUd1QyxNQUFNLENBQUNDLFlBQWQsR0FBOEJ4SCxTQUFTLENBQUM0Qyx1QkFGL0M7TUFHSCxDQUxrQixDQUFuQixDQURnQyxDQVFoQzs7TUFDQSxPQUFPZ0UsVUFBVSxDQUFDUCxNQUFYLEtBQXNCVCxPQUFPLENBQUNTLE1BQTlCLEdBQXVDLElBQXZDLEdBQThDTyxVQUFyRDtJQUNILENBVkssQ0FBTjtFQVdIOztFQUVnQyxNQUFqQi9FLGlCQUFpQixDQUM3Qm5CLFVBRDZCLEVBRTdCTSxVQUY2QixFQUdoQjtJQUNiO0lBQ0EsTUFBTXlHLGlCQUFpQixHQUFHLElBQUk1SixPQUFKLENBQWtCLENBQUNDLE9BQUQsRUFBVTRKLE1BQVYsS0FBcUI7TUFDN0QsTUFBTXZHLGNBQWMsR0FBR0MsMENBQUEsQ0FBcUJDLFFBQTVDOztNQUVBLE1BQU0xRCxRQUFRLEdBQUkrRCxHQUFELElBQWlCO1FBQzlCLElBQUlBLEdBQUcsS0FBSyxLQUFLSCxTQUFqQixFQUE0QjtVQUN4Qm9HLE9BQU87VUFDUEQsTUFBTSxDQUFDLElBQUl2SixLQUFKLENBQVUsbUJBQVYsQ0FBRCxDQUFOO1FBQ0g7TUFDSixDQUxEOztNQU1BLE1BQU15SixJQUFJLEdBQUcsTUFBTTtRQUNmRCxPQUFPO1FBQ1A3SixPQUFPO01BQ1YsQ0FIRDs7TUFJQSxNQUFNNkosT0FBTyxHQUFHLE1BQU07UUFDbEJ4RyxjQUFjLENBQUNqRCxHQUFmLENBQW1Cc0QsK0NBQUEsQ0FBMEJxRyxhQUE3QyxFQUE0RGxLLFFBQTVEO1FBQ0EsS0FBS08sR0FBTCxDQUFTTyxTQUFTLENBQUNMLGVBQW5CLEVBQW9Dd0osSUFBcEM7TUFDSCxDQUhEOztNQUtBekcsY0FBYyxDQUFDcEQsRUFBZixDQUFrQnlELCtDQUFBLENBQTBCcUcsYUFBNUMsRUFBMkRsSyxRQUEzRDtNQUNBLEtBQUtJLEVBQUwsQ0FBUVUsU0FBUyxDQUFDTCxlQUFsQixFQUFtQ3dKLElBQW5DO0lBQ0gsQ0FwQnlCLENBQTFCLENBRmEsQ0F3QmI7SUFDQTtJQUNBOztJQUNBLEtBQUtoSixTQUFMLENBQWdCYixFQUFoQixDQUFvQixVQUFTa0YsMENBQUEsQ0FBcUI2RSxVQUFXLEVBQTdELEVBQWdFLEtBQUtDLFFBQXJFLEVBM0JhLENBNkJiOztJQUNBLE1BQU1DLFFBQVEsR0FBR3pLLFlBQVksQ0FDekIsS0FBS3FCLFNBRG9CLEVBRXhCLFVBQVNxRSwwQ0FBQSxDQUFxQmdGLFFBQVMsRUFGZixFQUd4QjVFLEVBQUQsSUFBd0M7TUFDcENBLEVBQUUsQ0FBQ0MsY0FBSDtNQUNBLEtBQUsxRSxTQUFMLENBQWdCbUUsU0FBaEIsQ0FBMEJRLEtBQTFCLENBQWdDRixFQUFFLENBQUNHLE1BQW5DLEVBQTJDLEVBQTNDLEVBRm9DLENBRVk7O01BQ2hELE9BQU8sSUFBUDtJQUNILENBUHdCLENBQTdCO0lBU0EsTUFBTTBFLE9BQU8sR0FBRyxLQUFLdEosU0FBTCxDQUFnQm1FLFNBQWhCLENBQTBCQyxJQUExQixDQUErQkMsMENBQUEsQ0FBcUJnRixRQUFwRCxFQUE4RDtNQUMxRXZILFVBQVUsRUFBRUEsVUFBVSxFQUFFeUgsS0FBWixJQUFxQixJQUR5QztNQUUxRW5ILFVBQVUsRUFBRUEsVUFBVSxFQUFFbUgsS0FBWixJQUFxQjtJQUZ5QyxDQUE5RCxDQUFoQjs7SUFJQSxJQUFJO01BQ0EsTUFBTXRLLE9BQU8sQ0FBQ3VLLElBQVIsQ0FBYSxDQUFDdkssT0FBTyxDQUFDd0ssR0FBUixDQUFZLENBQUNILE9BQUQsRUFBVUYsUUFBVixDQUFaLENBQUQsRUFBbUNQLGlCQUFuQyxDQUFiLENBQU47SUFDSCxDQUZELENBRUUsT0FBTzdGLENBQVAsRUFBVTtNQUNSO01BQ0EsS0FBS2hELFNBQUwsQ0FBZ0JWLEdBQWhCLENBQXFCLFVBQVMrRSwwQ0FBQSxDQUFxQjZFLFVBQVcsRUFBOUQsRUFBaUUsS0FBS0MsUUFBdEU7O01BRUEsSUFBSSxLQUFLbkosU0FBTCxDQUFnQm1FLFNBQWhCLENBQTBCdUYsS0FBOUIsRUFBcUM7UUFDakM7UUFDQSxLQUFLMUosU0FBTCxDQUFnQm1FLFNBQWhCLENBQTBCQyxJQUExQixDQUErQkMsMENBQUEsQ0FBcUI2RSxVQUFwRCxFQUFnRTtVQUFFUyxLQUFLLEVBQUU7UUFBVCxDQUFoRTtNQUNIOztNQUVELE1BQU0sSUFBSXBLLEtBQUosQ0FBVywrQkFBOEIsS0FBS1ksTUFBTyxLQUFJNkMsQ0FBRSxFQUEzRCxDQUFOO0lBQ0g7O0lBRUQ0RywwQkFBQSxDQUFrQm5ILFFBQWxCLENBQTJCdEQsRUFBM0IsQ0FBOEIwSyx5Q0FBQSxDQUF1QkMsSUFBckQsRUFBMkQsS0FBS0MsTUFBaEU7O0lBQ0FILDBCQUFBLENBQWtCbkgsUUFBbEIsQ0FBMkJ0RCxFQUEzQixDQUE4QjBLLHlDQUFBLENBQXVCRyxNQUFyRCxFQUE2RCxLQUFLQyxRQUFsRTs7SUFDQSxLQUFLOUksSUFBTCxDQUFVaEMsRUFBVixDQUFhK0ssZUFBQSxDQUFVQyxZQUF2QixFQUFxQyxLQUFLQyxjQUExQztJQUNBQyxNQUFNLENBQUNDLGdCQUFQLENBQXdCLGNBQXhCLEVBQXdDLEtBQUtDLFlBQTdDO0VBQ0g7O0VBRW1DLE1BQXBCcEgsb0JBQW9CLEdBQWtCO0lBQ2xELE1BQU1pRyxRQUFRLEdBQUd6SyxZQUFZLENBQ3pCLEtBQUtxQixTQURvQixFQUV4QixVQUFTcUUsMENBQUEsQ0FBcUI2RSxVQUFXLEVBRmpCLEVBR3hCekUsRUFBRCxJQUF3QztNQUNwQ0EsRUFBRSxDQUFDQyxjQUFIO01BQ0EsS0FBSzFFLFNBQUwsQ0FBZ0JtRSxTQUFoQixDQUEwQlEsS0FBMUIsQ0FBZ0NGLEVBQUUsQ0FBQ0csTUFBbkMsRUFBMkMsRUFBM0MsRUFGb0MsQ0FFWTs7TUFDaEQsT0FBTyxJQUFQO0lBQ0gsQ0FQd0IsQ0FBN0I7SUFTQSxNQUFNMEUsT0FBTyxHQUFHLEtBQUt0SixTQUFMLENBQWdCbUUsU0FBaEIsQ0FBMEJDLElBQTFCLENBQStCQywwQ0FBQSxDQUFxQjZFLFVBQXBELEVBQWdFLEVBQWhFLENBQWhCOztJQUNBLElBQUk7TUFDQSxNQUFNakssT0FBTyxDQUFDd0ssR0FBUixDQUFZLENBQUNILE9BQUQsRUFBVUYsUUFBVixDQUFaLENBQU47SUFDSCxDQUZELENBRUUsT0FBT3BHLENBQVAsRUFBVTtNQUNSLE1BQU0sSUFBSXpELEtBQUosQ0FBVyxpQ0FBZ0MsS0FBS1ksTUFBTyxLQUFJNkMsQ0FBRSxFQUE3RCxDQUFOO0lBQ0g7RUFDSjs7RUFFTUksZUFBZSxHQUFHO0lBQ3JCLEtBQUtwRCxTQUFMLENBQWdCVixHQUFoQixDQUFxQixVQUFTK0UsMENBQUEsQ0FBcUI2RSxVQUFXLEVBQTlELEVBQWlFLEtBQUtDLFFBQXRFOztJQUNBUywwQkFBQSxDQUFrQm5ILFFBQWxCLENBQTJCbkQsR0FBM0IsQ0FBK0J1Syx5Q0FBQSxDQUF1QkMsSUFBdEQsRUFBNEQsS0FBS0MsTUFBakU7O0lBQ0FILDBCQUFBLENBQWtCbkgsUUFBbEIsQ0FBMkJuRCxHQUEzQixDQUErQnVLLHlDQUFBLENBQXVCRyxNQUF0RCxFQUE4RCxLQUFLQyxRQUFuRTs7SUFDQSxLQUFLOUksSUFBTCxDQUFVN0IsR0FBVixDQUFjNEssZUFBQSxDQUFVQyxZQUF4QixFQUFzQyxLQUFLQyxjQUEzQztJQUNBQyxNQUFNLENBQUNHLG1CQUFQLENBQTJCLGNBQTNCLEVBQTJDLEtBQUtELFlBQWhEO0lBRUEsTUFBTW5ILGVBQU47RUFDSDs7RUFFTUMsT0FBTyxHQUFHO0lBQ2IsS0FBS2xDLElBQUwsQ0FBVTdCLEdBQVYsQ0FBY3VGLHlCQUFBLENBQWVDLE1BQTdCLEVBQXFDLEtBQUtyQixrQkFBMUM7SUFDQSxLQUFLdEUsRUFBTCxDQUFRVSxTQUFTLENBQUNMLGVBQWxCLEVBQW1DLEtBQUt3RixpQkFBeEM7O0lBQ0EsSUFBSSxLQUFLaUIsMkJBQUwsS0FBcUMsSUFBekMsRUFBK0M7TUFDM0NDLFlBQVksQ0FBQyxLQUFLRCwyQkFBTixDQUFaO01BQ0EsS0FBS0EsMkJBQUwsR0FBbUMsSUFBbkM7SUFDSDs7SUFDRCxJQUFJLEtBQUtyQyxrQkFBTCxLQUE0QixJQUFoQyxFQUFzQztNQUNsQ0ssYUFBYSxDQUFDLEtBQUtMLGtCQUFOLENBQWI7TUFDQSxLQUFLQSxrQkFBTCxHQUEwQixJQUExQjtJQUNIOztJQUVELE1BQU1QLE9BQU47RUFDSDs7QUFqTytCOzs7OEJBQXZCakMsUyx1QkFDa0MseUI7OEJBRGxDQSxTLDZCQUV3QyxPQUFPLEVBQVAsR0FBWSxFIn0=