"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StopGapWidgetDriver = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _matrixWidgetApi = require("matrix-widget-api");

var _client = require("matrix-js-sdk/src/client");

var _event = require("matrix-js-sdk/src/@types/event");

var _logger = require("matrix-js-sdk/src/logger");

var _thread = require("matrix-js-sdk/src/models/thread");

var _iterables = require("../../utils/iterables");

var _MatrixClientPeg = require("../../MatrixClientPeg");

var _Modal = _interopRequireDefault(require("../../Modal"));

var _WidgetOpenIDPermissionsDialog = _interopRequireDefault(require("../../components/views/dialogs/WidgetOpenIDPermissionsDialog"));

var _WidgetCapabilitiesPromptDialog = _interopRequireDefault(require("../../components/views/dialogs/WidgetCapabilitiesPromptDialog"));

var _WidgetPermissions = require("../../customisations/WidgetPermissions");

var _WidgetPermissionStore = require("./WidgetPermissionStore");

var _WidgetType = require("../../widgets/WidgetType");

var _effects = require("../../effects");

var _utils = require("../../effects/utils");

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _SettingsStore = _interopRequireDefault(require("../../settings/SettingsStore"));

var _RoomViewStore = require("../RoomViewStore");

var _ElementWidgetCapabilities = require("./ElementWidgetCapabilities");

var _navigator = require("../../utils/permalinks/navigator");

/*
 * Copyright 2020 - 2022 The Matrix.org Foundation C.I.C.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// TODO: Purge this from the universe
function getRememberedCapabilitiesForWidget(widget) {
  return JSON.parse(localStorage.getItem(`widget_${widget.id}_approved_caps`) || "[]");
}

function setRememberedCapabilitiesForWidget(widget, caps) {
  localStorage.setItem(`widget_${widget.id}_approved_caps`, JSON.stringify(caps));
}

const normalizeTurnServer = _ref => {
  let {
    urls,
    username,
    credential
  } = _ref;
  return {
    uris: urls,
    username,
    password: credential
  };
};

class StopGapWidgetDriver extends _matrixWidgetApi.WidgetDriver {
  // TODO: Refactor widgetKind into the Widget class
  constructor(allowedCapabilities, forWidget, forWidgetKind, inRoomId) {
    super(); // Always allow screenshots to be taken because it's a client-induced flow. The widget can't
    // spew screenshots at us and can't request screenshots of us, so it's up to us to provide the
    // button if the widget says it supports screenshots.

    this.forWidget = forWidget;
    this.forWidgetKind = forWidgetKind;
    this.inRoomId = inRoomId;
    (0, _defineProperty2.default)(this, "allowedCapabilities", void 0);
    this.allowedCapabilities = new Set([...allowedCapabilities, _matrixWidgetApi.MatrixCapabilities.Screenshots, _ElementWidgetCapabilities.ElementWidgetCapabilities.RequiresClient]); // Grant the permissions that are specific to given widget types

    if (_WidgetType.WidgetType.JITSI.matches(this.forWidget.type) && forWidgetKind === _matrixWidgetApi.WidgetKind.Room) {
      this.allowedCapabilities.add(_matrixWidgetApi.MatrixCapabilities.AlwaysOnScreen);
    } else if (_WidgetType.WidgetType.STICKERPICKER.matches(this.forWidget.type) && forWidgetKind === _matrixWidgetApi.WidgetKind.Account) {
      const stickerSendingCap = _matrixWidgetApi.WidgetEventCapability.forRoomEvent(_matrixWidgetApi.EventDirection.Send, _event.EventType.Sticker).raw;

      this.allowedCapabilities.add(_matrixWidgetApi.MatrixCapabilities.StickerSending); // legacy as far as MSC2762 is concerned

      this.allowedCapabilities.add(stickerSendingCap); // Auto-approve the legacy visibility capability. We send it regardless of capability.
      // Widgets don't technically need to request this capability, but Scalar still does.

      this.allowedCapabilities.add("visibility");
    }
  }

  async validateCapabilities(requested) {
    // Check to see if any capabilities aren't automatically accepted (such as sticker pickers
    // allowing stickers to be sent). If there are excess capabilities to be approved, the user
    // will be prompted to accept them.
    const diff = (0, _iterables.iterableDiff)(requested, this.allowedCapabilities);
    const missing = new Set(diff.removed); // "removed" is "in A (requested) but not in B (allowed)"

    const allowedSoFar = new Set(this.allowedCapabilities);
    getRememberedCapabilitiesForWidget(this.forWidget).forEach(cap => {
      allowedSoFar.add(cap);
      missing.delete(cap);
    });

    if (_WidgetPermissions.WidgetPermissionCustomisations.preapproveCapabilities) {
      const approved = await _WidgetPermissions.WidgetPermissionCustomisations.preapproveCapabilities(this.forWidget, requested);

      if (approved) {
        approved.forEach(cap => {
          allowedSoFar.add(cap);
          missing.delete(cap);
        });
      }
    } // TODO: Do something when the widget requests new capabilities not yet asked for


    let rememberApproved = false;

    if (missing.size > 0) {
      try {
        const [result] = await _Modal.default.createDialog(_WidgetCapabilitiesPromptDialog.default, {
          requestedCapabilities: missing,
          widget: this.forWidget,
          widgetKind: this.forWidgetKind
        }).finished;
        (result.approved || []).forEach(cap => allowedSoFar.add(cap));
        rememberApproved = result.remember;
      } catch (e) {
        _logger.logger.error("Non-fatal error getting capabilities: ", e);
      }
    } // discard all previously allowed capabilities if they are not requested
    // TODO: this results in an unexpected behavior when this function is called during the capabilities renegotiation of MSC2974 that will be resolved later.


    const allAllowed = new Set((0, _iterables.iterableIntersection)(allowedSoFar, requested));

    if (rememberApproved) {
      setRememberedCapabilitiesForWidget(this.forWidget, Array.from(allAllowed));
    }

    return allAllowed;
  }

  async sendEvent(eventType, content) {
    let stateKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    let targetRoomId = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const roomId = targetRoomId || _RoomViewStore.RoomViewStore.instance.getRoomId();

    if (!client || !roomId) throw new Error("Not in a room or not attached to a client");
    let r = null; // eslint-disable-line camelcase

    if (stateKey !== null) {
      // state event
      r = await client.sendStateEvent(roomId, eventType, content, stateKey);
    } else if (eventType === _event.EventType.RoomRedaction) {
      // special case: extract the `redacts` property and call redact
      r = await client.redactEvent(roomId, content['redacts']);
    } else {
      // message event
      r = await client.sendEvent(roomId, eventType, content);

      if (eventType === _event.EventType.RoomMessage) {
        _effects.CHAT_EFFECTS.forEach(effect => {
          if ((0, _utils.containsEmoji)(content, effect.emojis)) {
            // For initial threads launch, chat effects are disabled
            // see #19731
            const isNotThread = content["m.relates_to"].rel_type !== _thread.THREAD_RELATION_TYPE.name;

            if (!_SettingsStore.default.getValue("feature_thread") || isNotThread) {
              _dispatcher.default.dispatch({
                action: `effects.${effect.command}`
              });
            }
          }
        });
      }
    }

    return {
      roomId,
      eventId: r.event_id
    };
  }

  async sendToDevice(eventType, encrypted, contentMap) {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    if (encrypted) {
      const deviceInfoMap = await client.crypto.deviceList.downloadKeys(Object.keys(contentMap), false);
      await Promise.all(Object.entries(contentMap).flatMap(_ref2 => {
        let [userId, userContentMap] = _ref2;
        return Object.entries(userContentMap).map(async _ref3 => {
          let [deviceId, content] = _ref3;

          if (deviceId === "*") {
            // Send the message to all devices we have keys for
            await client.encryptAndSendToDevices(Object.values(deviceInfoMap[userId]).map(deviceInfo => ({
              userId,
              deviceInfo
            })), content);
          } else {
            // Send the message to a specific device
            await client.encryptAndSendToDevices([{
              userId,
              deviceInfo: deviceInfoMap[userId][deviceId]
            }], content);
          }
        });
      }));
    } else {
      await client.queueToDevice({
        eventType,
        batch: Object.entries(contentMap).flatMap(_ref4 => {
          let [userId, userContentMap] = _ref4;
          return Object.entries(userContentMap).map(_ref5 => {
            let [deviceId, content] = _ref5;
            return {
              userId,
              deviceId,
              payload: content
            };
          });
        })
      });
    }
  }

  pickRooms() {
    let roomIds = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    const client = _MatrixClientPeg.MatrixClientPeg.get();

    if (!client) throw new Error("Not attached to a client");
    const targetRooms = roomIds ? roomIds.includes(_matrixWidgetApi.Symbols.AnyRoom) ? client.getVisibleRooms() : roomIds.map(r => client.getRoom(r)) : [client.getRoom(_RoomViewStore.RoomViewStore.instance.getRoomId())];
    return targetRooms.filter(r => !!r);
  }

  async readRoomEvents(eventType, msgtype, limitPerRoom) {
    let roomIds = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    limitPerRoom = limitPerRoom > 0 ? Math.min(limitPerRoom, Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER; // relatively arbitrary

    const rooms = this.pickRooms(roomIds);
    const allResults = [];

    for (const room of rooms) {
      const results = [];
      const events = room.getLiveTimeline().getEvents(); // timelines are most recent last

      for (let i = events.length - 1; i > 0; i--) {
        if (results.length >= limitPerRoom) break;
        const ev = events[i];
        if (ev.getType() !== eventType || ev.isState()) continue;
        if (eventType === _event.EventType.RoomMessage && msgtype && msgtype !== ev.getContent()['msgtype']) continue;
        results.push(ev);
      }

      results.forEach(e => allResults.push(e.getEffectiveEvent()));
    }

    return allResults;
  }

  async readStateEvents(eventType, stateKey, limitPerRoom) {
    let roomIds = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    limitPerRoom = limitPerRoom > 0 ? Math.min(limitPerRoom, Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER; // relatively arbitrary

    const rooms = this.pickRooms(roomIds);
    const allResults = [];

    for (const room of rooms) {
      const results = [];
      const state = room.currentState.events.get(eventType);

      if (state) {
        if (stateKey === "" || !!stateKey) {
          const forKey = state.get(stateKey);
          if (forKey) results.push(forKey);
        } else {
          results.push(...Array.from(state.values()));
        }
      }

      results.slice(0, limitPerRoom).forEach(e => allResults.push(e.getEffectiveEvent()));
    }

    return allResults;
  }

  async askOpenID(observer) {
    const oidcState = _WidgetPermissionStore.WidgetPermissionStore.instance.getOIDCState(this.forWidget, this.forWidgetKind, this.inRoomId);

    const getToken = () => {
      return _MatrixClientPeg.MatrixClientPeg.get().getOpenIdToken();
    };

    if (oidcState === _WidgetPermissionStore.OIDCState.Denied) {
      return observer.update({
        state: _matrixWidgetApi.OpenIDRequestState.Blocked
      });
    }

    if (oidcState === _WidgetPermissionStore.OIDCState.Allowed) {
      return observer.update({
        state: _matrixWidgetApi.OpenIDRequestState.Allowed,
        token: await getToken()
      });
    }

    observer.update({
      state: _matrixWidgetApi.OpenIDRequestState.PendingUserConfirmation
    });

    _Modal.default.createDialog(_WidgetOpenIDPermissionsDialog.default, {
      widget: this.forWidget,
      widgetKind: this.forWidgetKind,
      inRoomId: this.inRoomId,
      onFinished: async confirm => {
        if (!confirm) {
          return observer.update({
            state: _matrixWidgetApi.OpenIDRequestState.Blocked
          });
        }

        return observer.update({
          state: _matrixWidgetApi.OpenIDRequestState.Allowed,
          token: await getToken()
        });
      }
    });
  }

  async navigate(uri) {
    (0, _navigator.navigateToPermalink)(uri);
  }

  async *getTurnServers() {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    if (!client.pollingTurnServers || !client.getTurnServers().length) return;
    let setTurnServer;
    let setError;

    const onTurnServers = _ref6 => {
      let [server] = _ref6;
      return setTurnServer(normalizeTurnServer(server));
    };

    const onTurnServersError = (error, fatal) => {
      if (fatal) setError(error);
    };

    client.on(_client.ClientEvent.TurnServers, onTurnServers);
    client.on(_client.ClientEvent.TurnServersError, onTurnServersError);

    try {
      const initialTurnServer = client.getTurnServers()[0];
      yield normalizeTurnServer(initialTurnServer); // Repeatedly listen for new TURN servers until an error occurs or
      // the caller stops this generator

      while (true) {
        yield await new Promise((resolve, reject) => {
          setTurnServer = resolve;
          setError = reject;
        });
      }
    } finally {
      // The loop was broken - clean up
      client.off(_client.ClientEvent.TurnServers, onTurnServers);
      client.off(_client.ClientEvent.TurnServersError, onTurnServersError);
    }
  }

}

exports.StopGapWidgetDriver = StopGapWidgetDriver;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRSZW1lbWJlcmVkQ2FwYWJpbGl0aWVzRm9yV2lkZ2V0Iiwid2lkZ2V0IiwiSlNPTiIsInBhcnNlIiwibG9jYWxTdG9yYWdlIiwiZ2V0SXRlbSIsImlkIiwic2V0UmVtZW1iZXJlZENhcGFiaWxpdGllc0ZvcldpZGdldCIsImNhcHMiLCJzZXRJdGVtIiwic3RyaW5naWZ5Iiwibm9ybWFsaXplVHVyblNlcnZlciIsInVybHMiLCJ1c2VybmFtZSIsImNyZWRlbnRpYWwiLCJ1cmlzIiwicGFzc3dvcmQiLCJTdG9wR2FwV2lkZ2V0RHJpdmVyIiwiV2lkZ2V0RHJpdmVyIiwiY29uc3RydWN0b3IiLCJhbGxvd2VkQ2FwYWJpbGl0aWVzIiwiZm9yV2lkZ2V0IiwiZm9yV2lkZ2V0S2luZCIsImluUm9vbUlkIiwiU2V0IiwiTWF0cml4Q2FwYWJpbGl0aWVzIiwiU2NyZWVuc2hvdHMiLCJFbGVtZW50V2lkZ2V0Q2FwYWJpbGl0aWVzIiwiUmVxdWlyZXNDbGllbnQiLCJXaWRnZXRUeXBlIiwiSklUU0kiLCJtYXRjaGVzIiwidHlwZSIsIldpZGdldEtpbmQiLCJSb29tIiwiYWRkIiwiQWx3YXlzT25TY3JlZW4iLCJTVElDS0VSUElDS0VSIiwiQWNjb3VudCIsInN0aWNrZXJTZW5kaW5nQ2FwIiwiV2lkZ2V0RXZlbnRDYXBhYmlsaXR5IiwiZm9yUm9vbUV2ZW50IiwiRXZlbnREaXJlY3Rpb24iLCJTZW5kIiwiRXZlbnRUeXBlIiwiU3RpY2tlciIsInJhdyIsIlN0aWNrZXJTZW5kaW5nIiwidmFsaWRhdGVDYXBhYmlsaXRpZXMiLCJyZXF1ZXN0ZWQiLCJkaWZmIiwiaXRlcmFibGVEaWZmIiwibWlzc2luZyIsInJlbW92ZWQiLCJhbGxvd2VkU29GYXIiLCJmb3JFYWNoIiwiY2FwIiwiZGVsZXRlIiwiV2lkZ2V0UGVybWlzc2lvbkN1c3RvbWlzYXRpb25zIiwicHJlYXBwcm92ZUNhcGFiaWxpdGllcyIsImFwcHJvdmVkIiwicmVtZW1iZXJBcHByb3ZlZCIsInNpemUiLCJyZXN1bHQiLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIldpZGdldENhcGFiaWxpdGllc1Byb21wdERpYWxvZyIsInJlcXVlc3RlZENhcGFiaWxpdGllcyIsIndpZGdldEtpbmQiLCJmaW5pc2hlZCIsInJlbWVtYmVyIiwiZSIsImxvZ2dlciIsImVycm9yIiwiYWxsQWxsb3dlZCIsIml0ZXJhYmxlSW50ZXJzZWN0aW9uIiwiQXJyYXkiLCJmcm9tIiwic2VuZEV2ZW50IiwiZXZlbnRUeXBlIiwiY29udGVudCIsInN0YXRlS2V5IiwidGFyZ2V0Um9vbUlkIiwiY2xpZW50IiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0Iiwicm9vbUlkIiwiUm9vbVZpZXdTdG9yZSIsImluc3RhbmNlIiwiZ2V0Um9vbUlkIiwiRXJyb3IiLCJyIiwic2VuZFN0YXRlRXZlbnQiLCJSb29tUmVkYWN0aW9uIiwicmVkYWN0RXZlbnQiLCJSb29tTWVzc2FnZSIsIkNIQVRfRUZGRUNUUyIsImVmZmVjdCIsImNvbnRhaW5zRW1vamkiLCJlbW9qaXMiLCJpc05vdFRocmVhZCIsInJlbF90eXBlIiwiVEhSRUFEX1JFTEFUSU9OX1RZUEUiLCJuYW1lIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJjb21tYW5kIiwiZXZlbnRJZCIsImV2ZW50X2lkIiwic2VuZFRvRGV2aWNlIiwiZW5jcnlwdGVkIiwiY29udGVudE1hcCIsImRldmljZUluZm9NYXAiLCJjcnlwdG8iLCJkZXZpY2VMaXN0IiwiZG93bmxvYWRLZXlzIiwiT2JqZWN0Iiwia2V5cyIsIlByb21pc2UiLCJhbGwiLCJlbnRyaWVzIiwiZmxhdE1hcCIsInVzZXJJZCIsInVzZXJDb250ZW50TWFwIiwibWFwIiwiZGV2aWNlSWQiLCJlbmNyeXB0QW5kU2VuZFRvRGV2aWNlcyIsInZhbHVlcyIsImRldmljZUluZm8iLCJxdWV1ZVRvRGV2aWNlIiwiYmF0Y2giLCJwYXlsb2FkIiwicGlja1Jvb21zIiwicm9vbUlkcyIsInRhcmdldFJvb21zIiwiaW5jbHVkZXMiLCJTeW1ib2xzIiwiQW55Um9vbSIsImdldFZpc2libGVSb29tcyIsImdldFJvb20iLCJmaWx0ZXIiLCJyZWFkUm9vbUV2ZW50cyIsIm1zZ3R5cGUiLCJsaW1pdFBlclJvb20iLCJNYXRoIiwibWluIiwiTnVtYmVyIiwiTUFYX1NBRkVfSU5URUdFUiIsInJvb21zIiwiYWxsUmVzdWx0cyIsInJvb20iLCJyZXN1bHRzIiwiZXZlbnRzIiwiZ2V0TGl2ZVRpbWVsaW5lIiwiZ2V0RXZlbnRzIiwiaSIsImxlbmd0aCIsImV2IiwiZ2V0VHlwZSIsImlzU3RhdGUiLCJnZXRDb250ZW50IiwicHVzaCIsImdldEVmZmVjdGl2ZUV2ZW50IiwicmVhZFN0YXRlRXZlbnRzIiwic3RhdGUiLCJjdXJyZW50U3RhdGUiLCJmb3JLZXkiLCJzbGljZSIsImFza09wZW5JRCIsIm9ic2VydmVyIiwib2lkY1N0YXRlIiwiV2lkZ2V0UGVybWlzc2lvblN0b3JlIiwiZ2V0T0lEQ1N0YXRlIiwiZ2V0VG9rZW4iLCJnZXRPcGVuSWRUb2tlbiIsIk9JRENTdGF0ZSIsIkRlbmllZCIsInVwZGF0ZSIsIk9wZW5JRFJlcXVlc3RTdGF0ZSIsIkJsb2NrZWQiLCJBbGxvd2VkIiwidG9rZW4iLCJQZW5kaW5nVXNlckNvbmZpcm1hdGlvbiIsIldpZGdldE9wZW5JRFBlcm1pc3Npb25zRGlhbG9nIiwib25GaW5pc2hlZCIsImNvbmZpcm0iLCJuYXZpZ2F0ZSIsInVyaSIsIm5hdmlnYXRlVG9QZXJtYWxpbmsiLCJnZXRUdXJuU2VydmVycyIsInBvbGxpbmdUdXJuU2VydmVycyIsInNldFR1cm5TZXJ2ZXIiLCJzZXRFcnJvciIsIm9uVHVyblNlcnZlcnMiLCJzZXJ2ZXIiLCJvblR1cm5TZXJ2ZXJzRXJyb3IiLCJmYXRhbCIsIm9uIiwiQ2xpZW50RXZlbnQiLCJUdXJuU2VydmVycyIsIlR1cm5TZXJ2ZXJzRXJyb3IiLCJpbml0aWFsVHVyblNlcnZlciIsInJlc29sdmUiLCJyZWplY3QiLCJvZmYiXSwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvc3RvcmVzL3dpZGdldHMvU3RvcEdhcFdpZGdldERyaXZlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogQ29weXJpZ2h0IDIwMjAgLSAyMDIyIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge1xuICAgIENhcGFiaWxpdHksXG4gICAgRXZlbnREaXJlY3Rpb24sXG4gICAgSU9wZW5JRENyZWRlbnRpYWxzLFxuICAgIElPcGVuSURVcGRhdGUsXG4gICAgSVNlbmRFdmVudERldGFpbHMsXG4gICAgSVR1cm5TZXJ2ZXIsXG4gICAgSVJvb21FdmVudCxcbiAgICBNYXRyaXhDYXBhYmlsaXRpZXMsXG4gICAgT3BlbklEUmVxdWVzdFN0YXRlLFxuICAgIFNpbXBsZU9ic2VydmFibGUsXG4gICAgU3ltYm9scyxcbiAgICBXaWRnZXQsXG4gICAgV2lkZ2V0RHJpdmVyLFxuICAgIFdpZGdldEV2ZW50Q2FwYWJpbGl0eSxcbiAgICBXaWRnZXRLaW5kLFxufSBmcm9tIFwibWF0cml4LXdpZGdldC1hcGlcIjtcbmltcG9ydCB7IENsaWVudEV2ZW50LCBJVHVyblNlcnZlciBhcyBJQ2xpZW50VHVyblNlcnZlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jbGllbnRcIjtcbmltcG9ydCB7IEV2ZW50VHlwZSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvZXZlbnRcIjtcbmltcG9ydCB7IElDb250ZW50LCBJRXZlbnQsIE1hdHJpeEV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudFwiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuaW1wb3J0IHsgVEhSRUFEX1JFTEFUSU9OX1RZUEUgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3RocmVhZFwiO1xuXG5pbXBvcnQgeyBpdGVyYWJsZURpZmYsIGl0ZXJhYmxlSW50ZXJzZWN0aW9uIH0gZnJvbSBcIi4uLy4uL3V0aWxzL2l0ZXJhYmxlc1wiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSBcIi4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IFdpZGdldE9wZW5JRFBlcm1pc3Npb25zRGlhbG9nIGZyb20gXCIuLi8uLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvV2lkZ2V0T3BlbklEUGVybWlzc2lvbnNEaWFsb2dcIjtcbmltcG9ydCBXaWRnZXRDYXBhYmlsaXRpZXNQcm9tcHREaWFsb2cgZnJvbSBcIi4uLy4uL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9XaWRnZXRDYXBhYmlsaXRpZXNQcm9tcHREaWFsb2dcIjtcbmltcG9ydCB7IFdpZGdldFBlcm1pc3Npb25DdXN0b21pc2F0aW9ucyB9IGZyb20gXCIuLi8uLi9jdXN0b21pc2F0aW9ucy9XaWRnZXRQZXJtaXNzaW9uc1wiO1xuaW1wb3J0IHsgT0lEQ1N0YXRlLCBXaWRnZXRQZXJtaXNzaW9uU3RvcmUgfSBmcm9tIFwiLi9XaWRnZXRQZXJtaXNzaW9uU3RvcmVcIjtcbmltcG9ydCB7IFdpZGdldFR5cGUgfSBmcm9tIFwiLi4vLi4vd2lkZ2V0cy9XaWRnZXRUeXBlXCI7XG5pbXBvcnQgeyBDSEFUX0VGRkVDVFMgfSBmcm9tIFwiLi4vLi4vZWZmZWN0c1wiO1xuaW1wb3J0IHsgY29udGFpbnNFbW9qaSB9IGZyb20gXCIuLi8uLi9lZmZlY3RzL3V0aWxzXCI7XG5pbXBvcnQgZGlzIGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgeyBSb29tVmlld1N0b3JlIH0gZnJvbSBcIi4uL1Jvb21WaWV3U3RvcmVcIjtcbmltcG9ydCB7IEVsZW1lbnRXaWRnZXRDYXBhYmlsaXRpZXMgfSBmcm9tIFwiLi9FbGVtZW50V2lkZ2V0Q2FwYWJpbGl0aWVzXCI7XG5pbXBvcnQgeyBuYXZpZ2F0ZVRvUGVybWFsaW5rIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3Blcm1hbGlua3MvbmF2aWdhdG9yXCI7XG5cbi8vIFRPRE86IFB1cmdlIHRoaXMgZnJvbSB0aGUgdW5pdmVyc2VcblxuZnVuY3Rpb24gZ2V0UmVtZW1iZXJlZENhcGFiaWxpdGllc0ZvcldpZGdldCh3aWRnZXQ6IFdpZGdldCk6IENhcGFiaWxpdHlbXSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oYHdpZGdldF8ke3dpZGdldC5pZH1fYXBwcm92ZWRfY2Fwc2ApIHx8IFwiW11cIik7XG59XG5cbmZ1bmN0aW9uIHNldFJlbWVtYmVyZWRDYXBhYmlsaXRpZXNGb3JXaWRnZXQod2lkZ2V0OiBXaWRnZXQsIGNhcHM6IENhcGFiaWxpdHlbXSkge1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGB3aWRnZXRfJHt3aWRnZXQuaWR9X2FwcHJvdmVkX2NhcHNgLCBKU09OLnN0cmluZ2lmeShjYXBzKSk7XG59XG5cbmNvbnN0IG5vcm1hbGl6ZVR1cm5TZXJ2ZXIgPSAoeyB1cmxzLCB1c2VybmFtZSwgY3JlZGVudGlhbCB9OiBJQ2xpZW50VHVyblNlcnZlcik6IElUdXJuU2VydmVyID0+ICh7XG4gICAgdXJpczogdXJscyxcbiAgICB1c2VybmFtZSxcbiAgICBwYXNzd29yZDogY3JlZGVudGlhbCxcbn0pO1xuXG5leHBvcnQgY2xhc3MgU3RvcEdhcFdpZGdldERyaXZlciBleHRlbmRzIFdpZGdldERyaXZlciB7XG4gICAgcHJpdmF0ZSBhbGxvd2VkQ2FwYWJpbGl0aWVzOiBTZXQ8Q2FwYWJpbGl0eT47XG5cbiAgICAvLyBUT0RPOiBSZWZhY3RvciB3aWRnZXRLaW5kIGludG8gdGhlIFdpZGdldCBjbGFzc1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBhbGxvd2VkQ2FwYWJpbGl0aWVzOiBDYXBhYmlsaXR5W10sXG4gICAgICAgIHByaXZhdGUgZm9yV2lkZ2V0OiBXaWRnZXQsXG4gICAgICAgIHByaXZhdGUgZm9yV2lkZ2V0S2luZDogV2lkZ2V0S2luZCxcbiAgICAgICAgcHJpdmF0ZSBpblJvb21JZD86IHN0cmluZyxcbiAgICApIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICAvLyBBbHdheXMgYWxsb3cgc2NyZWVuc2hvdHMgdG8gYmUgdGFrZW4gYmVjYXVzZSBpdCdzIGEgY2xpZW50LWluZHVjZWQgZmxvdy4gVGhlIHdpZGdldCBjYW4ndFxuICAgICAgICAvLyBzcGV3IHNjcmVlbnNob3RzIGF0IHVzIGFuZCBjYW4ndCByZXF1ZXN0IHNjcmVlbnNob3RzIG9mIHVzLCBzbyBpdCdzIHVwIHRvIHVzIHRvIHByb3ZpZGUgdGhlXG4gICAgICAgIC8vIGJ1dHRvbiBpZiB0aGUgd2lkZ2V0IHNheXMgaXQgc3VwcG9ydHMgc2NyZWVuc2hvdHMuXG4gICAgICAgIHRoaXMuYWxsb3dlZENhcGFiaWxpdGllcyA9IG5ldyBTZXQoWy4uLmFsbG93ZWRDYXBhYmlsaXRpZXMsXG4gICAgICAgICAgICBNYXRyaXhDYXBhYmlsaXRpZXMuU2NyZWVuc2hvdHMsXG4gICAgICAgICAgICBFbGVtZW50V2lkZ2V0Q2FwYWJpbGl0aWVzLlJlcXVpcmVzQ2xpZW50XSk7XG5cbiAgICAgICAgLy8gR3JhbnQgdGhlIHBlcm1pc3Npb25zIHRoYXQgYXJlIHNwZWNpZmljIHRvIGdpdmVuIHdpZGdldCB0eXBlc1xuICAgICAgICBpZiAoV2lkZ2V0VHlwZS5KSVRTSS5tYXRjaGVzKHRoaXMuZm9yV2lkZ2V0LnR5cGUpICYmIGZvcldpZGdldEtpbmQgPT09IFdpZGdldEtpbmQuUm9vbSkge1xuICAgICAgICAgICAgdGhpcy5hbGxvd2VkQ2FwYWJpbGl0aWVzLmFkZChNYXRyaXhDYXBhYmlsaXRpZXMuQWx3YXlzT25TY3JlZW4pO1xuICAgICAgICB9IGVsc2UgaWYgKFdpZGdldFR5cGUuU1RJQ0tFUlBJQ0tFUi5tYXRjaGVzKHRoaXMuZm9yV2lkZ2V0LnR5cGUpICYmIGZvcldpZGdldEtpbmQgPT09IFdpZGdldEtpbmQuQWNjb3VudCkge1xuICAgICAgICAgICAgY29uc3Qgc3RpY2tlclNlbmRpbmdDYXAgPSBXaWRnZXRFdmVudENhcGFiaWxpdHkuZm9yUm9vbUV2ZW50KEV2ZW50RGlyZWN0aW9uLlNlbmQsIEV2ZW50VHlwZS5TdGlja2VyKS5yYXc7XG4gICAgICAgICAgICB0aGlzLmFsbG93ZWRDYXBhYmlsaXRpZXMuYWRkKE1hdHJpeENhcGFiaWxpdGllcy5TdGlja2VyU2VuZGluZyk7IC8vIGxlZ2FjeSBhcyBmYXIgYXMgTVNDMjc2MiBpcyBjb25jZXJuZWRcbiAgICAgICAgICAgIHRoaXMuYWxsb3dlZENhcGFiaWxpdGllcy5hZGQoc3RpY2tlclNlbmRpbmdDYXApO1xuXG4gICAgICAgICAgICAvLyBBdXRvLWFwcHJvdmUgdGhlIGxlZ2FjeSB2aXNpYmlsaXR5IGNhcGFiaWxpdHkuIFdlIHNlbmQgaXQgcmVnYXJkbGVzcyBvZiBjYXBhYmlsaXR5LlxuICAgICAgICAgICAgLy8gV2lkZ2V0cyBkb24ndCB0ZWNobmljYWxseSBuZWVkIHRvIHJlcXVlc3QgdGhpcyBjYXBhYmlsaXR5LCBidXQgU2NhbGFyIHN0aWxsIGRvZXMuXG4gICAgICAgICAgICB0aGlzLmFsbG93ZWRDYXBhYmlsaXRpZXMuYWRkKFwidmlzaWJpbGl0eVwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyB2YWxpZGF0ZUNhcGFiaWxpdGllcyhyZXF1ZXN0ZWQ6IFNldDxDYXBhYmlsaXR5Pik6IFByb21pc2U8U2V0PENhcGFiaWxpdHk+PiB7XG4gICAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiBhbnkgY2FwYWJpbGl0aWVzIGFyZW4ndCBhdXRvbWF0aWNhbGx5IGFjY2VwdGVkIChzdWNoIGFzIHN0aWNrZXIgcGlja2Vyc1xuICAgICAgICAvLyBhbGxvd2luZyBzdGlja2VycyB0byBiZSBzZW50KS4gSWYgdGhlcmUgYXJlIGV4Y2VzcyBjYXBhYmlsaXRpZXMgdG8gYmUgYXBwcm92ZWQsIHRoZSB1c2VyXG4gICAgICAgIC8vIHdpbGwgYmUgcHJvbXB0ZWQgdG8gYWNjZXB0IHRoZW0uXG4gICAgICAgIGNvbnN0IGRpZmYgPSBpdGVyYWJsZURpZmYocmVxdWVzdGVkLCB0aGlzLmFsbG93ZWRDYXBhYmlsaXRpZXMpO1xuICAgICAgICBjb25zdCBtaXNzaW5nID0gbmV3IFNldChkaWZmLnJlbW92ZWQpOyAvLyBcInJlbW92ZWRcIiBpcyBcImluIEEgKHJlcXVlc3RlZCkgYnV0IG5vdCBpbiBCIChhbGxvd2VkKVwiXG4gICAgICAgIGNvbnN0IGFsbG93ZWRTb0ZhciA9IG5ldyBTZXQodGhpcy5hbGxvd2VkQ2FwYWJpbGl0aWVzKTtcbiAgICAgICAgZ2V0UmVtZW1iZXJlZENhcGFiaWxpdGllc0ZvcldpZGdldCh0aGlzLmZvcldpZGdldCkuZm9yRWFjaChjYXAgPT4ge1xuICAgICAgICAgICAgYWxsb3dlZFNvRmFyLmFkZChjYXApO1xuICAgICAgICAgICAgbWlzc2luZy5kZWxldGUoY2FwKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChXaWRnZXRQZXJtaXNzaW9uQ3VzdG9taXNhdGlvbnMucHJlYXBwcm92ZUNhcGFiaWxpdGllcykge1xuICAgICAgICAgICAgY29uc3QgYXBwcm92ZWQgPSBhd2FpdCBXaWRnZXRQZXJtaXNzaW9uQ3VzdG9taXNhdGlvbnMucHJlYXBwcm92ZUNhcGFiaWxpdGllcyh0aGlzLmZvcldpZGdldCwgcmVxdWVzdGVkKTtcbiAgICAgICAgICAgIGlmIChhcHByb3ZlZCkge1xuICAgICAgICAgICAgICAgIGFwcHJvdmVkLmZvckVhY2goY2FwID0+IHtcbiAgICAgICAgICAgICAgICAgICAgYWxsb3dlZFNvRmFyLmFkZChjYXApO1xuICAgICAgICAgICAgICAgICAgICBtaXNzaW5nLmRlbGV0ZShjYXApO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFRPRE86IERvIHNvbWV0aGluZyB3aGVuIHRoZSB3aWRnZXQgcmVxdWVzdHMgbmV3IGNhcGFiaWxpdGllcyBub3QgeWV0IGFza2VkIGZvclxuICAgICAgICBsZXQgcmVtZW1iZXJBcHByb3ZlZCA9IGZhbHNlO1xuICAgICAgICBpZiAobWlzc2luZy5zaXplID4gMCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBbcmVzdWx0XSA9IGF3YWl0IE1vZGFsLmNyZWF0ZURpYWxvZyhcbiAgICAgICAgICAgICAgICAgICAgV2lkZ2V0Q2FwYWJpbGl0aWVzUHJvbXB0RGlhbG9nLFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0ZWRDYXBhYmlsaXRpZXM6IG1pc3NpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICB3aWRnZXQ6IHRoaXMuZm9yV2lkZ2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0S2luZDogdGhpcy5mb3JXaWRnZXRLaW5kLFxuICAgICAgICAgICAgICAgICAgICB9KS5maW5pc2hlZDtcbiAgICAgICAgICAgICAgICAocmVzdWx0LmFwcHJvdmVkIHx8IFtdKS5mb3JFYWNoKGNhcCA9PiBhbGxvd2VkU29GYXIuYWRkKGNhcCkpO1xuICAgICAgICAgICAgICAgIHJlbWVtYmVyQXBwcm92ZWQgPSByZXN1bHQucmVtZW1iZXI7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiTm9uLWZhdGFsIGVycm9yIGdldHRpbmcgY2FwYWJpbGl0aWVzOiBcIiwgZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBkaXNjYXJkIGFsbCBwcmV2aW91c2x5IGFsbG93ZWQgY2FwYWJpbGl0aWVzIGlmIHRoZXkgYXJlIG5vdCByZXF1ZXN0ZWRcbiAgICAgICAgLy8gVE9ETzogdGhpcyByZXN1bHRzIGluIGFuIHVuZXhwZWN0ZWQgYmVoYXZpb3Igd2hlbiB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBkdXJpbmcgdGhlIGNhcGFiaWxpdGllcyByZW5lZ290aWF0aW9uIG9mIE1TQzI5NzQgdGhhdCB3aWxsIGJlIHJlc29sdmVkIGxhdGVyLlxuICAgICAgICBjb25zdCBhbGxBbGxvd2VkID0gbmV3IFNldChpdGVyYWJsZUludGVyc2VjdGlvbihhbGxvd2VkU29GYXIsIHJlcXVlc3RlZCkpO1xuXG4gICAgICAgIGlmIChyZW1lbWJlckFwcHJvdmVkKSB7XG4gICAgICAgICAgICBzZXRSZW1lbWJlcmVkQ2FwYWJpbGl0aWVzRm9yV2lkZ2V0KHRoaXMuZm9yV2lkZ2V0LCBBcnJheS5mcm9tKGFsbEFsbG93ZWQpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhbGxBbGxvd2VkO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBzZW5kRXZlbnQoXG4gICAgICAgIGV2ZW50VHlwZTogc3RyaW5nLFxuICAgICAgICBjb250ZW50OiBJQ29udGVudCxcbiAgICAgICAgc3RhdGVLZXk6IHN0cmluZyA9IG51bGwsXG4gICAgICAgIHRhcmdldFJvb21JZDogc3RyaW5nID0gbnVsbCxcbiAgICApOiBQcm9taXNlPElTZW5kRXZlbnREZXRhaWxzPiB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3Qgcm9vbUlkID0gdGFyZ2V0Um9vbUlkIHx8IFJvb21WaWV3U3RvcmUuaW5zdGFuY2UuZ2V0Um9vbUlkKCk7XG5cbiAgICAgICAgaWYgKCFjbGllbnQgfHwgIXJvb21JZCkgdGhyb3cgbmV3IEVycm9yKFwiTm90IGluIGEgcm9vbSBvciBub3QgYXR0YWNoZWQgdG8gYSBjbGllbnRcIik7XG5cbiAgICAgICAgbGV0IHI6IHsgZXZlbnRfaWQ6IHN0cmluZyB9ID0gbnVsbDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2VcbiAgICAgICAgaWYgKHN0YXRlS2V5ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAvLyBzdGF0ZSBldmVudFxuICAgICAgICAgICAgciA9IGF3YWl0IGNsaWVudC5zZW5kU3RhdGVFdmVudChyb29tSWQsIGV2ZW50VHlwZSwgY29udGVudCwgc3RhdGVLZXkpO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50VHlwZSA9PT0gRXZlbnRUeXBlLlJvb21SZWRhY3Rpb24pIHtcbiAgICAgICAgICAgIC8vIHNwZWNpYWwgY2FzZTogZXh0cmFjdCB0aGUgYHJlZGFjdHNgIHByb3BlcnR5IGFuZCBjYWxsIHJlZGFjdFxuICAgICAgICAgICAgciA9IGF3YWl0IGNsaWVudC5yZWRhY3RFdmVudChyb29tSWQsIGNvbnRlbnRbJ3JlZGFjdHMnXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBtZXNzYWdlIGV2ZW50XG4gICAgICAgICAgICByID0gYXdhaXQgY2xpZW50LnNlbmRFdmVudChyb29tSWQsIGV2ZW50VHlwZSwgY29udGVudCk7XG5cbiAgICAgICAgICAgIGlmIChldmVudFR5cGUgPT09IEV2ZW50VHlwZS5Sb29tTWVzc2FnZSkge1xuICAgICAgICAgICAgICAgIENIQVRfRUZGRUNUUy5mb3JFYWNoKChlZmZlY3QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRhaW5zRW1vamkoY29udGVudCwgZWZmZWN0LmVtb2ppcykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZvciBpbml0aWFsIHRocmVhZHMgbGF1bmNoLCBjaGF0IGVmZmVjdHMgYXJlIGRpc2FibGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzZWUgIzE5NzMxXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpc05vdFRocmVhZCA9IGNvbnRlbnRbXCJtLnJlbGF0ZXNfdG9cIl0ucmVsX3R5cGUgIT09IFRIUkVBRF9SRUxBVElPTl9UWVBFLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJmZWF0dXJlX3RocmVhZFwiKSB8fCBpc05vdFRocmVhZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7IGFjdGlvbjogYGVmZmVjdHMuJHtlZmZlY3QuY29tbWFuZH1gIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyByb29tSWQsIGV2ZW50SWQ6IHIuZXZlbnRfaWQgfTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgc2VuZFRvRGV2aWNlKFxuICAgICAgICBldmVudFR5cGU6IHN0cmluZyxcbiAgICAgICAgZW5jcnlwdGVkOiBib29sZWFuLFxuICAgICAgICBjb250ZW50TWFwOiB7IFt1c2VySWQ6IHN0cmluZ106IHsgW2RldmljZUlkOiBzdHJpbmddOiBvYmplY3QgfSB9LFxuICAgICk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG5cbiAgICAgICAgaWYgKGVuY3J5cHRlZCkge1xuICAgICAgICAgICAgY29uc3QgZGV2aWNlSW5mb01hcCA9IGF3YWl0IGNsaWVudC5jcnlwdG8uZGV2aWNlTGlzdC5kb3dubG9hZEtleXMoT2JqZWN0LmtleXMoY29udGVudE1hcCksIGZhbHNlKTtcblxuICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgICAgICAgICAgICAgT2JqZWN0LmVudHJpZXMoY29udGVudE1hcCkuZmxhdE1hcCgoW3VzZXJJZCwgdXNlckNvbnRlbnRNYXBdKSA9PlxuICAgICAgICAgICAgICAgICAgICBPYmplY3QuZW50cmllcyh1c2VyQ29udGVudE1hcCkubWFwKGFzeW5jIChbZGV2aWNlSWQsIGNvbnRlbnRdKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGV2aWNlSWQgPT09IFwiKlwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2VuZCB0aGUgbWVzc2FnZSB0byBhbGwgZGV2aWNlcyB3ZSBoYXZlIGtleXMgZm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgY2xpZW50LmVuY3J5cHRBbmRTZW5kVG9EZXZpY2VzKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3QudmFsdWVzKGRldmljZUluZm9NYXBbdXNlcklkXSkubWFwKGRldmljZUluZm8gPT4gKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVzZXJJZCwgZGV2aWNlSW5mbyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNlbmQgdGhlIG1lc3NhZ2UgdG8gYSBzcGVjaWZpYyBkZXZpY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBjbGllbnQuZW5jcnlwdEFuZFNlbmRUb0RldmljZXMoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFt7IHVzZXJJZCwgZGV2aWNlSW5mbzogZGV2aWNlSW5mb01hcFt1c2VySWRdW2RldmljZUlkXSB9XSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF3YWl0IGNsaWVudC5xdWV1ZVRvRGV2aWNlKHtcbiAgICAgICAgICAgICAgICBldmVudFR5cGUsXG4gICAgICAgICAgICAgICAgYmF0Y2g6IE9iamVjdC5lbnRyaWVzKGNvbnRlbnRNYXApLmZsYXRNYXAoKFt1c2VySWQsIHVzZXJDb250ZW50TWFwXSkgPT5cbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmVudHJpZXModXNlckNvbnRlbnRNYXApLm1hcCgoW2RldmljZUlkLCBjb250ZW50XSkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICh7IHVzZXJJZCwgZGV2aWNlSWQsIHBheWxvYWQ6IGNvbnRlbnQgfSksXG4gICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwaWNrUm9vbXMocm9vbUlkczogKHN0cmluZyB8IFN5bWJvbHMuQW55Um9vbSlbXSA9IG51bGwpOiBSb29tW10ge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGlmICghY2xpZW50KSB0aHJvdyBuZXcgRXJyb3IoXCJOb3QgYXR0YWNoZWQgdG8gYSBjbGllbnRcIik7XG5cbiAgICAgICAgY29uc3QgdGFyZ2V0Um9vbXMgPSByb29tSWRzXG4gICAgICAgICAgICA/IChyb29tSWRzLmluY2x1ZGVzKFN5bWJvbHMuQW55Um9vbSkgPyBjbGllbnQuZ2V0VmlzaWJsZVJvb21zKCkgOiByb29tSWRzLm1hcChyID0+IGNsaWVudC5nZXRSb29tKHIpKSlcbiAgICAgICAgICAgIDogW2NsaWVudC5nZXRSb29tKFJvb21WaWV3U3RvcmUuaW5zdGFuY2UuZ2V0Um9vbUlkKCkpXTtcbiAgICAgICAgcmV0dXJuIHRhcmdldFJvb21zLmZpbHRlcihyID0+ICEhcik7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIHJlYWRSb29tRXZlbnRzKFxuICAgICAgICBldmVudFR5cGU6IHN0cmluZyxcbiAgICAgICAgbXNndHlwZTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgICAgICBsaW1pdFBlclJvb206IG51bWJlcixcbiAgICAgICAgcm9vbUlkczogKHN0cmluZyB8IFN5bWJvbHMuQW55Um9vbSlbXSA9IG51bGwsXG4gICAgKTogUHJvbWlzZTxJUm9vbUV2ZW50W10+IHtcbiAgICAgICAgbGltaXRQZXJSb29tID0gbGltaXRQZXJSb29tID4gMCA/IE1hdGgubWluKGxpbWl0UGVyUm9vbSwgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIpIDogTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7IC8vIHJlbGF0aXZlbHkgYXJiaXRyYXJ5XG5cbiAgICAgICAgY29uc3Qgcm9vbXMgPSB0aGlzLnBpY2tSb29tcyhyb29tSWRzKTtcbiAgICAgICAgY29uc3QgYWxsUmVzdWx0czogSUV2ZW50W10gPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCByb29tIG9mIHJvb21zKSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHRzOiBNYXRyaXhFdmVudFtdID0gW107XG4gICAgICAgICAgICBjb25zdCBldmVudHMgPSByb29tLmdldExpdmVUaW1lbGluZSgpLmdldEV2ZW50cygpOyAvLyB0aW1lbGluZXMgYXJlIG1vc3QgcmVjZW50IGxhc3RcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBldmVudHMubGVuZ3RoIC0gMTsgaSA+IDA7IGktLSkge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHRzLmxlbmd0aCA+PSBsaW1pdFBlclJvb20pIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgZXYgPSBldmVudHNbaV07XG4gICAgICAgICAgICAgICAgaWYgKGV2LmdldFR5cGUoKSAhPT0gZXZlbnRUeXBlIHx8IGV2LmlzU3RhdGUoKSkgY29udGludWU7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50VHlwZSA9PT0gRXZlbnRUeXBlLlJvb21NZXNzYWdlICYmIG1zZ3R5cGUgJiYgbXNndHlwZSAhPT0gZXYuZ2V0Q29udGVudCgpWydtc2d0eXBlJ10pIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChldik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlc3VsdHMuZm9yRWFjaChlID0+IGFsbFJlc3VsdHMucHVzaChlLmdldEVmZmVjdGl2ZUV2ZW50KCkpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYWxsUmVzdWx0cztcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgcmVhZFN0YXRlRXZlbnRzKFxuICAgICAgICBldmVudFR5cGU6IHN0cmluZyxcbiAgICAgICAgc3RhdGVLZXk6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICAgICAgbGltaXRQZXJSb29tOiBudW1iZXIsXG4gICAgICAgIHJvb21JZHM6IChzdHJpbmcgfCBTeW1ib2xzLkFueVJvb20pW10gPSBudWxsLFxuICAgICk6IFByb21pc2U8SVJvb21FdmVudFtdPiB7XG4gICAgICAgIGxpbWl0UGVyUm9vbSA9IGxpbWl0UGVyUm9vbSA+IDAgPyBNYXRoLm1pbihsaW1pdFBlclJvb20sIE51bWJlci5NQVhfU0FGRV9JTlRFR0VSKSA6IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSOyAvLyByZWxhdGl2ZWx5IGFyYml0cmFyeVxuXG4gICAgICAgIGNvbnN0IHJvb21zID0gdGhpcy5waWNrUm9vbXMocm9vbUlkcyk7XG4gICAgICAgIGNvbnN0IGFsbFJlc3VsdHM6IElFdmVudFtdID0gW107XG4gICAgICAgIGZvciAoY29uc3Qgcm9vbSBvZiByb29tcykge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0czogTWF0cml4RXZlbnRbXSA9IFtdO1xuICAgICAgICAgICAgY29uc3Qgc3RhdGU6IE1hcDxzdHJpbmcsIE1hdHJpeEV2ZW50PiA9IHJvb20uY3VycmVudFN0YXRlLmV2ZW50cy5nZXQoZXZlbnRUeXBlKTtcbiAgICAgICAgICAgIGlmIChzdGF0ZSkge1xuICAgICAgICAgICAgICAgIGlmIChzdGF0ZUtleSA9PT0gXCJcIiB8fCAhIXN0YXRlS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZvcktleSA9IHN0YXRlLmdldChzdGF0ZUtleSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmb3JLZXkpIHJlc3VsdHMucHVzaChmb3JLZXkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCguLi5BcnJheS5mcm9tKHN0YXRlLnZhbHVlcygpKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXN1bHRzLnNsaWNlKDAsIGxpbWl0UGVyUm9vbSkuZm9yRWFjaChlID0+IGFsbFJlc3VsdHMucHVzaChlLmdldEVmZmVjdGl2ZUV2ZW50KCkpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYWxsUmVzdWx0cztcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgYXNrT3BlbklEKG9ic2VydmVyOiBTaW1wbGVPYnNlcnZhYmxlPElPcGVuSURVcGRhdGU+KSB7XG4gICAgICAgIGNvbnN0IG9pZGNTdGF0ZSA9IFdpZGdldFBlcm1pc3Npb25TdG9yZS5pbnN0YW5jZS5nZXRPSURDU3RhdGUoXG4gICAgICAgICAgICB0aGlzLmZvcldpZGdldCwgdGhpcy5mb3JXaWRnZXRLaW5kLCB0aGlzLmluUm9vbUlkLFxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IGdldFRva2VuID0gKCk6IFByb21pc2U8SU9wZW5JRENyZWRlbnRpYWxzPiA9PiB7XG4gICAgICAgICAgICByZXR1cm4gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldE9wZW5JZFRva2VuKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKG9pZGNTdGF0ZSA9PT0gT0lEQ1N0YXRlLkRlbmllZCkge1xuICAgICAgICAgICAgcmV0dXJuIG9ic2VydmVyLnVwZGF0ZSh7IHN0YXRlOiBPcGVuSURSZXF1ZXN0U3RhdGUuQmxvY2tlZCB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob2lkY1N0YXRlID09PSBPSURDU3RhdGUuQWxsb3dlZCkge1xuICAgICAgICAgICAgcmV0dXJuIG9ic2VydmVyLnVwZGF0ZSh7IHN0YXRlOiBPcGVuSURSZXF1ZXN0U3RhdGUuQWxsb3dlZCwgdG9rZW46IGF3YWl0IGdldFRva2VuKCkgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBvYnNlcnZlci51cGRhdGUoeyBzdGF0ZTogT3BlbklEUmVxdWVzdFN0YXRlLlBlbmRpbmdVc2VyQ29uZmlybWF0aW9uIH0pO1xuXG4gICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhXaWRnZXRPcGVuSURQZXJtaXNzaW9uc0RpYWxvZywge1xuICAgICAgICAgICAgd2lkZ2V0OiB0aGlzLmZvcldpZGdldCxcbiAgICAgICAgICAgIHdpZGdldEtpbmQ6IHRoaXMuZm9yV2lkZ2V0S2luZCxcbiAgICAgICAgICAgIGluUm9vbUlkOiB0aGlzLmluUm9vbUlkLFxuXG4gICAgICAgICAgICBvbkZpbmlzaGVkOiBhc3luYyAoY29uZmlybSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghY29uZmlybSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2JzZXJ2ZXIudXBkYXRlKHsgc3RhdGU6IE9wZW5JRFJlcXVlc3RTdGF0ZS5CbG9ja2VkIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBvYnNlcnZlci51cGRhdGUoeyBzdGF0ZTogT3BlbklEUmVxdWVzdFN0YXRlLkFsbG93ZWQsIHRva2VuOiBhd2FpdCBnZXRUb2tlbigpIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIG5hdmlnYXRlKHVyaTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIG5hdmlnYXRlVG9QZXJtYWxpbmsodXJpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMqIGdldFR1cm5TZXJ2ZXJzKCk6IEFzeW5jR2VuZXJhdG9yPElUdXJuU2VydmVyPiB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgaWYgKCFjbGllbnQucG9sbGluZ1R1cm5TZXJ2ZXJzIHx8ICFjbGllbnQuZ2V0VHVyblNlcnZlcnMoKS5sZW5ndGgpIHJldHVybjtcblxuICAgICAgICBsZXQgc2V0VHVyblNlcnZlcjogKHNlcnZlcjogSVR1cm5TZXJ2ZXIpID0+IHZvaWQ7XG4gICAgICAgIGxldCBzZXRFcnJvcjogKGVycm9yOiBFcnJvcikgPT4gdm9pZDtcblxuICAgICAgICBjb25zdCBvblR1cm5TZXJ2ZXJzID0gKFtzZXJ2ZXJdOiBJQ2xpZW50VHVyblNlcnZlcltdKSA9PiBzZXRUdXJuU2VydmVyKG5vcm1hbGl6ZVR1cm5TZXJ2ZXIoc2VydmVyKSk7XG4gICAgICAgIGNvbnN0IG9uVHVyblNlcnZlcnNFcnJvciA9IChlcnJvcjogRXJyb3IsIGZhdGFsOiBib29sZWFuKSA9PiB7IGlmIChmYXRhbCkgc2V0RXJyb3IoZXJyb3IpOyB9O1xuXG4gICAgICAgIGNsaWVudC5vbihDbGllbnRFdmVudC5UdXJuU2VydmVycywgb25UdXJuU2VydmVycyk7XG4gICAgICAgIGNsaWVudC5vbihDbGllbnRFdmVudC5UdXJuU2VydmVyc0Vycm9yLCBvblR1cm5TZXJ2ZXJzRXJyb3IpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBpbml0aWFsVHVyblNlcnZlciA9IGNsaWVudC5nZXRUdXJuU2VydmVycygpWzBdO1xuICAgICAgICAgICAgeWllbGQgbm9ybWFsaXplVHVyblNlcnZlcihpbml0aWFsVHVyblNlcnZlcik7XG5cbiAgICAgICAgICAgIC8vIFJlcGVhdGVkbHkgbGlzdGVuIGZvciBuZXcgVFVSTiBzZXJ2ZXJzIHVudGlsIGFuIGVycm9yIG9jY3VycyBvclxuICAgICAgICAgICAgLy8gdGhlIGNhbGxlciBzdG9wcyB0aGlzIGdlbmVyYXRvclxuICAgICAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgICAgICB5aWVsZCBhd2FpdCBuZXcgUHJvbWlzZTxJVHVyblNlcnZlcj4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzZXRUdXJuU2VydmVyID0gcmVzb2x2ZTtcbiAgICAgICAgICAgICAgICAgICAgc2V0RXJyb3IgPSByZWplY3Q7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAvLyBUaGUgbG9vcCB3YXMgYnJva2VuIC0gY2xlYW4gdXBcbiAgICAgICAgICAgIGNsaWVudC5vZmYoQ2xpZW50RXZlbnQuVHVyblNlcnZlcnMsIG9uVHVyblNlcnZlcnMpO1xuICAgICAgICAgICAgY2xpZW50Lm9mZihDbGllbnRFdmVudC5UdXJuU2VydmVyc0Vycm9yLCBvblR1cm5TZXJ2ZXJzRXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFpQkE7O0FBQ0E7O0FBR0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQTBDQTtBQUVBLFNBQVNBLGtDQUFULENBQTRDQyxNQUE1QyxFQUEwRTtFQUN0RSxPQUFPQyxJQUFJLENBQUNDLEtBQUwsQ0FBV0MsWUFBWSxDQUFDQyxPQUFiLENBQXNCLFVBQVNKLE1BQU0sQ0FBQ0ssRUFBRyxnQkFBekMsS0FBNkQsSUFBeEUsQ0FBUDtBQUNIOztBQUVELFNBQVNDLGtDQUFULENBQTRDTixNQUE1QyxFQUE0RE8sSUFBNUQsRUFBZ0Y7RUFDNUVKLFlBQVksQ0FBQ0ssT0FBYixDQUFzQixVQUFTUixNQUFNLENBQUNLLEVBQUcsZ0JBQXpDLEVBQTBESixJQUFJLENBQUNRLFNBQUwsQ0FBZUYsSUFBZixDQUExRDtBQUNIOztBQUVELE1BQU1HLG1CQUFtQixHQUFHO0VBQUEsSUFBQztJQUFFQyxJQUFGO0lBQVFDLFFBQVI7SUFBa0JDO0VBQWxCLENBQUQ7RUFBQSxPQUFxRTtJQUM3RkMsSUFBSSxFQUFFSCxJQUR1RjtJQUU3RkMsUUFGNkY7SUFHN0ZHLFFBQVEsRUFBRUY7RUFIbUYsQ0FBckU7QUFBQSxDQUE1Qjs7QUFNTyxNQUFNRyxtQkFBTixTQUFrQ0MsNkJBQWxDLENBQStDO0VBR2xEO0VBQ0FDLFdBQVcsQ0FDUEMsbUJBRE8sRUFFQ0MsU0FGRCxFQUdD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