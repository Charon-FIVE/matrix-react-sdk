"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Notifier = void 0;

var _event = require("matrix-js-sdk/src/models/event");

var _room = require("matrix-js-sdk/src/models/room");

var _client = require("matrix-js-sdk/src/client");

var _logger = require("matrix-js-sdk/src/logger");

var _event2 = require("matrix-js-sdk/src/@types/event");

var _location = require("matrix-js-sdk/src/@types/location");

var _MatrixClientPeg = require("./MatrixClientPeg");

var _PosthogAnalytics = require("./PosthogAnalytics");

var _SdkConfig = _interopRequireDefault(require("./SdkConfig"));

var _PlatformPeg = _interopRequireDefault(require("./PlatformPeg"));

var TextForEvent = _interopRequireWildcard(require("./TextForEvent"));

var Avatar = _interopRequireWildcard(require("./Avatar"));

var _dispatcher = _interopRequireDefault(require("./dispatcher/dispatcher"));

var _languageHandler = require("./languageHandler");

var _Modal = _interopRequireDefault(require("./Modal"));

var _SettingsStore = _interopRequireDefault(require("./settings/SettingsStore"));

var _DesktopNotificationsToast = require("./toasts/DesktopNotificationsToast");

var _SettingLevel = require("./settings/SettingLevel");

var _NotificationControllers = require("./settings/controllers/NotificationControllers");

var _RoomViewStore = require("./stores/RoomViewStore");

var _UserActivity = _interopRequireDefault(require("./UserActivity"));

var _Media = require("./customisations/Media");

var _ErrorDialog = _interopRequireDefault(require("./components/views/dialogs/ErrorDialog"));

var _LegacyCallHandler = _interopRequireDefault(require("./LegacyCallHandler"));

var _VoipUserMapper = _interopRequireDefault(require("./VoipUserMapper"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2017 Vector Creations Ltd
Copyright 2017 New Vector Ltd
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

/*
 * Dispatches:
 * {
 *   action: "notifier_enabled",
 *   value: boolean
 * }
 */
const MAX_PENDING_ENCRYPTED = 20;
/*
Override both the content body and the TextForEvent handler for specific msgtypes, in notifications.
This is useful when the content body contains fallback text that would explain that the client can't handle a particular
type of tile.
*/

const msgTypeHandlers = {
  [_event2.MsgType.KeyVerificationRequest]: event => {
    const name = (event.sender || {}).name;
    return (0, _languageHandler._t)("%(name)s is requesting verification", {
      name
    });
  },
  [_location.M_LOCATION.name]: event => {
    return TextForEvent.textForLocationEvent(event)();
  },
  [_location.M_LOCATION.altName]: event => {
    return TextForEvent.textForLocationEvent(event)();
  }
};
const Notifier = {
  notifsByRoom: {},
  // A list of event IDs that we've received but need to wait until
  // they're decrypted until we decide whether to notify for them
  // or not
  pendingEncryptedEventIds: [],
  notificationMessageForEvent: function (ev) {
    if (msgTypeHandlers.hasOwnProperty(ev.getContent().msgtype)) {
      return msgTypeHandlers[ev.getContent().msgtype](ev);
    }

    return TextForEvent.textForEvent(ev);
  },
  _displayPopupNotification: function (ev, room) {
    const plaf = _PlatformPeg.default.get();

    if (!plaf) {
      return;
    }

    if (!plaf.supportsNotifications() || !plaf.maySendNotifications()) {
      return;
    }

    let msg = this.notificationMessageForEvent(ev);
    if (!msg) return;
    let title;

    if (!ev.sender || room.name === ev.sender.name) {
      title = room.name; // notificationMessageForEvent includes sender,
      // but we already have the sender here

      if (ev.getContent().body && !msgTypeHandlers.hasOwnProperty(ev.getContent().msgtype)) {
        msg = ev.getContent().body;
      }
    } else if (ev.getType() === 'm.room.member') {
      // context is all in the message here, we don't need
      // to display sender info
      title = room.name;
    } else if (ev.sender) {
      title = ev.sender.name + " (" + room.name + ")"; // notificationMessageForEvent includes sender,
      // but we've just out sender in the title

      if (ev.getContent().body && !msgTypeHandlers.hasOwnProperty(ev.getContent().msgtype)) {
        msg = ev.getContent().body;
      }
    }

    if (!this.isBodyEnabled()) {
      msg = '';
    }

    let avatarUrl = null;

    if (ev.sender && !_SettingsStore.default.getValue("lowBandwidth")) {
      avatarUrl = Avatar.avatarUrlForMember(ev.sender, 40, 40, 'crop');
    }

    const notif = plaf.displayNotification(title, msg, avatarUrl, room, ev); // if displayNotification returns non-null,  the platform supports
    // clearing notifications later, so keep track of this.

    if (notif) {
      if (this.notifsByRoom[ev.getRoomId()] === undefined) this.notifsByRoom[ev.getRoomId()] = [];
      this.notifsByRoom[ev.getRoomId()].push(notif);
    }
  },
  getSoundForRoom: function (roomId) {
    // We do no caching here because the SDK caches setting
    // and the browser will cache the sound.
    const content = _SettingsStore.default.getValue("notificationSound", roomId);

    if (!content) {
      return null;
    }

    if (!content.url) {
      _logger.logger.warn(`${roomId} has custom notification sound event, but no url key`);

      return null;
    }

    if (!content.url.startsWith("mxc://")) {
      _logger.logger.warn(`${roomId} has custom notification sound event, but url is not a mxc url`);

      return null;
    } // Ideally in here we could use MSC1310 to detect the type of file, and reject it.


    return {
      url: (0, _Media.mediaFromMxc)(content.url).srcHttp,
      name: content.name,
      type: content.type,
      size: content.size
    };
  },
  _playAudioNotification: async function (ev, room) {
    const sound = this.getSoundForRoom(room.roomId);

    _logger.logger.log(`Got sound ${sound && sound.name || "default"} for ${room.roomId}`);

    try {
      const selector = document.querySelector(sound ? `audio[src='${sound.url}']` : "#messageAudio");
      let audioElement = selector;

      if (!selector) {
        if (!sound) {
          _logger.logger.error("No audio element or sound to play for notification");

          return;
        }

        audioElement = new Audio(sound.url);

        if (sound.type) {
          audioElement.type = sound.type;
        }

        document.body.appendChild(audioElement);
      }

      await audioElement.play();
    } catch (ex) {
      _logger.logger.warn("Caught error when trying to fetch room notification sound:", ex);
    }
  },
  start: function () {
    // do not re-bind in the case of repeated call
    this.boundOnEvent = this.boundOnEvent || this.onEvent.bind(this);
    this.boundOnSyncStateChange = this.boundOnSyncStateChange || this.onSyncStateChange.bind(this);
    this.boundOnRoomReceipt = this.boundOnRoomReceipt || this.onRoomReceipt.bind(this);
    this.boundOnEventDecrypted = this.boundOnEventDecrypted || this.onEventDecrypted.bind(this);

    _MatrixClientPeg.MatrixClientPeg.get().on(_client.ClientEvent.Event, this.boundOnEvent);

    _MatrixClientPeg.MatrixClientPeg.get().on(_room.RoomEvent.Receipt, this.boundOnRoomReceipt);

    _MatrixClientPeg.MatrixClientPeg.get().on(_event.MatrixEventEvent.Decrypted, this.boundOnEventDecrypted);

    _MatrixClientPeg.MatrixClientPeg.get().on(_client.ClientEvent.Sync, this.boundOnSyncStateChange);

    this.toolbarHidden = false;
    this.isSyncing = false;
  },
  stop: function () {
    if (_MatrixClientPeg.MatrixClientPeg.get()) {
      _MatrixClientPeg.MatrixClientPeg.get().removeListener(_client.ClientEvent.Event, this.boundOnEvent);

      _MatrixClientPeg.MatrixClientPeg.get().removeListener(_room.RoomEvent.Receipt, this.boundOnRoomReceipt);

      _MatrixClientPeg.MatrixClientPeg.get().removeListener(_event.MatrixEventEvent.Decrypted, this.boundOnEventDecrypted);

      _MatrixClientPeg.MatrixClientPeg.get().removeListener(_client.ClientEvent.Sync, this.boundOnSyncStateChange);
    }

    this.isSyncing = false;
  },
  supportsDesktopNotifications: function () {
    const plaf = _PlatformPeg.default.get();

    return plaf && plaf.supportsNotifications();
  },
  setEnabled: function (enable, callback) {
    const plaf = _PlatformPeg.default.get();

    if (!plaf) return; // Dev note: We don't set the "notificationsEnabled" setting to true here because it is a
    // calculated value. It is determined based upon whether or not the master rule is enabled
    // and other flags. Setting it here would cause a circular reference.
    // make sure that we persist the current setting audio_enabled setting
    // before changing anything

    if (_SettingsStore.default.isLevelSupported(_SettingLevel.SettingLevel.DEVICE)) {
      _SettingsStore.default.setValue("audioNotificationsEnabled", null, _SettingLevel.SettingLevel.DEVICE, this.isEnabled());
    }

    if (enable) {
      // Attempt to get permission from user
      plaf.requestNotificationPermission().then(result => {
        if (result !== 'granted') {
          // The permission request was dismissed or denied
          // TODO: Support alternative branding in messaging
          const brand = _SdkConfig.default.get().brand;

          const description = result === 'denied' ? (0, _languageHandler._t)('%(brand)s does not have permission to send you notifications - ' + 'please check your browser settings', {
            brand
          }) : (0, _languageHandler._t)('%(brand)s was not given permission to send notifications - please try again', {
            brand
          });

          _Modal.default.createDialog(_ErrorDialog.default, {
            title: (0, _languageHandler._t)('Unable to enable Notifications'),
            description
          });

          return;
        }

        if (callback) callback();

        _PosthogAnalytics.PosthogAnalytics.instance.trackEvent({
          eventName: "PermissionChanged",
          permission: "Notification",
          granted: true
        });

        _dispatcher.default.dispatch({
          action: "notifier_enabled",
          value: true
        });
      });
    } else {
      _PosthogAnalytics.PosthogAnalytics.instance.trackEvent({
        eventName: "PermissionChanged",
        permission: "Notification",
        granted: false
      });

      _dispatcher.default.dispatch({
        action: "notifier_enabled",
        value: false
      });
    } // set the notifications_hidden flag, as the user has knowingly interacted
    // with the setting we shouldn't nag them any further


    this.setPromptHidden(true);
  },
  isEnabled: function () {
    return this.isPossible() && _SettingsStore.default.getValue("notificationsEnabled");
  },
  isPossible: function () {
    const plaf = _PlatformPeg.default.get();

    if (!plaf) return false;
    if (!plaf.supportsNotifications()) return false;
    if (!plaf.maySendNotifications()) return false;
    return true; // possible, but not necessarily enabled
  },
  isBodyEnabled: function () {
    return this.isEnabled() && _SettingsStore.default.getValue("notificationBodyEnabled");
  },
  isAudioEnabled: function () {
    // We don't route Audio via the HTML Notifications API so it is possible regardless of other things
    return _SettingsStore.default.getValue("audioNotificationsEnabled");
  },
  setPromptHidden: function (hidden) {
    let persistent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    this.toolbarHidden = hidden;
    (0, _DesktopNotificationsToast.hideToast)(); // update the info to localStorage for persistent settings

    if (persistent && global.localStorage) {
      global.localStorage.setItem("notifications_hidden", String(hidden));
    }
  },
  shouldShowPrompt: function () {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    if (!client) {
      return false;
    }

    const isGuest = client.isGuest();
    return !isGuest && this.supportsDesktopNotifications() && !(0, _NotificationControllers.isPushNotifyDisabled)() && !this.isEnabled() && !this._isPromptHidden();
  },
  _isPromptHidden: function () {
    // Check localStorage for any such meta data
    if (global.localStorage) {
      return global.localStorage.getItem("notifications_hidden") === "true";
    }

    return this.toolbarHidden;
  },
  onSyncStateChange: function (state) {
    if (state === "SYNCING") {
      this.isSyncing = true;
    } else if (state === "STOPPED" || state === "ERROR") {
      this.isSyncing = false;
    }
  },
  onEvent: function (ev) {
    if (!this.isSyncing) return; // don't alert for any messages initially

    if (ev.getSender() === _MatrixClientPeg.MatrixClientPeg.get().credentials.userId) return;

    _MatrixClientPeg.MatrixClientPeg.get().decryptEventIfNeeded(ev); // If it's an encrypted event and the type is still 'm.room.encrypted',
    // it hasn't yet been decrypted, so wait until it is.


    if (ev.isBeingDecrypted() || ev.isDecryptionFailure()) {
      this.pendingEncryptedEventIds.push(ev.getId()); // don't let the list fill up indefinitely

      while (this.pendingEncryptedEventIds.length > MAX_PENDING_ENCRYPTED) {
        this.pendingEncryptedEventIds.shift();
      }

      return;
    }

    this._evaluateEvent(ev);
  },
  onEventDecrypted: function (ev) {
    // 'decrypted' means the decryption process has finished: it may have failed,
    // in which case it might decrypt soon if the keys arrive
    if (ev.isDecryptionFailure()) return;
    const idx = this.pendingEncryptedEventIds.indexOf(ev.getId());
    if (idx === -1) return;
    this.pendingEncryptedEventIds.splice(idx, 1);

    this._evaluateEvent(ev);
  },
  onRoomReceipt: function (ev, room) {
    if (room.getUnreadNotificationCount() === 0) {
      // ideally we would clear each notification when it was read,
      // but we have no way, given a read receipt, to know whether
      // the receipt comes before or after an event, so we can't
      // do this. Instead, clear all notifications for a room once
      // there are no notifs left in that room., which is not quite
      // as good but it's something.
      const plaf = _PlatformPeg.default.get();

      if (!plaf) return;
      if (this.notifsByRoom[room.roomId] === undefined) return;

      for (const notif of this.notifsByRoom[room.roomId]) {
        plaf.clearNotification(notif);
      }

      delete this.notifsByRoom[room.roomId];
    }
  },
  _evaluateEvent: function (ev) {
    let roomId = ev.getRoomId();

    if (_LegacyCallHandler.default.instance.getSupportsVirtualRooms()) {
      // Attempt to translate a virtual room to a native one
      const nativeRoomId = _VoipUserMapper.default.sharedInstance().nativeRoomForVirtualRoom(roomId);

      if (nativeRoomId) {
        roomId = nativeRoomId;
      }
    }

    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(roomId);

    const actions = _MatrixClientPeg.MatrixClientPeg.get().getPushActionsForEvent(ev);

    if (actions?.notify) {
      if (_RoomViewStore.RoomViewStore.instance.getRoomId() === room.roomId && _UserActivity.default.sharedInstance().userActiveRecently() && !_Modal.default.hasDialogs()) {
        // don't bother notifying as user was recently active in this room
        return;
      }

      if (this.isEnabled()) {
        this._displayPopupNotification(ev, room);
      }

      if (actions.tweaks.sound && this.isAudioEnabled()) {
        _PlatformPeg.default.get().loudNotification(ev, room);

        this._playAudioNotification(ev, room);
      }
    }
  }
};
exports.Notifier = Notifier;

if (!window.mxNotifier) {
  window.mxNotifier = Notifier;
}

var _default = window.mxNotifier;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNQVhfUEVORElOR19FTkNSWVBURUQiLCJtc2dUeXBlSGFuZGxlcnMiLCJNc2dUeXBlIiwiS2V5VmVyaWZpY2F0aW9uUmVxdWVzdCIsImV2ZW50IiwibmFtZSIsInNlbmRlciIsIl90IiwiTV9MT0NBVElPTiIsIlRleHRGb3JFdmVudCIsInRleHRGb3JMb2NhdGlvbkV2ZW50IiwiYWx0TmFtZSIsIk5vdGlmaWVyIiwibm90aWZzQnlSb29tIiwicGVuZGluZ0VuY3J5cHRlZEV2ZW50SWRzIiwibm90aWZpY2F0aW9uTWVzc2FnZUZvckV2ZW50IiwiZXYiLCJoYXNPd25Qcm9wZXJ0eSIsImdldENvbnRlbnQiLCJtc2d0eXBlIiwidGV4dEZvckV2ZW50IiwiX2Rpc3BsYXlQb3B1cE5vdGlmaWNhdGlvbiIsInJvb20iLCJwbGFmIiwiUGxhdGZvcm1QZWciLCJnZXQiLCJzdXBwb3J0c05vdGlmaWNhdGlvbnMiLCJtYXlTZW5kTm90aWZpY2F0aW9ucyIsIm1zZyIsInRpdGxlIiwiYm9keSIsImdldFR5cGUiLCJpc0JvZHlFbmFibGVkIiwiYXZhdGFyVXJsIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwiQXZhdGFyIiwiYXZhdGFyVXJsRm9yTWVtYmVyIiwibm90aWYiLCJkaXNwbGF5Tm90aWZpY2F0aW9uIiwiZ2V0Um9vbUlkIiwidW5kZWZpbmVkIiwicHVzaCIsImdldFNvdW5kRm9yUm9vbSIsInJvb21JZCIsImNvbnRlbnQiLCJ1cmwiLCJsb2dnZXIiLCJ3YXJuIiwic3RhcnRzV2l0aCIsIm1lZGlhRnJvbU14YyIsInNyY0h0dHAiLCJ0eXBlIiwic2l6ZSIsIl9wbGF5QXVkaW9Ob3RpZmljYXRpb24iLCJzb3VuZCIsImxvZyIsInNlbGVjdG9yIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yIiwiYXVkaW9FbGVtZW50IiwiZXJyb3IiLCJBdWRpbyIsImFwcGVuZENoaWxkIiwicGxheSIsImV4Iiwic3RhcnQiLCJib3VuZE9uRXZlbnQiLCJvbkV2ZW50IiwiYmluZCIsImJvdW5kT25TeW5jU3RhdGVDaGFuZ2UiLCJvblN5bmNTdGF0ZUNoYW5nZSIsImJvdW5kT25Sb29tUmVjZWlwdCIsIm9uUm9vbVJlY2VpcHQiLCJib3VuZE9uRXZlbnREZWNyeXB0ZWQiLCJvbkV2ZW50RGVjcnlwdGVkIiwiTWF0cml4Q2xpZW50UGVnIiwib24iLCJDbGllbnRFdmVudCIsIkV2ZW50IiwiUm9vbUV2ZW50IiwiUmVjZWlwdCIsIk1hdHJpeEV2ZW50RXZlbnQiLCJEZWNyeXB0ZWQiLCJTeW5jIiwidG9vbGJhckhpZGRlbiIsImlzU3luY2luZyIsInN0b3AiLCJyZW1vdmVMaXN0ZW5lciIsInN1cHBvcnRzRGVza3RvcE5vdGlmaWNhdGlvbnMiLCJzZXRFbmFibGVkIiwiZW5hYmxlIiwiY2FsbGJhY2siLCJpc0xldmVsU3VwcG9ydGVkIiwiU2V0dGluZ0xldmVsIiwiREVWSUNFIiwic2V0VmFsdWUiLCJpc0VuYWJsZWQiLCJyZXF1ZXN0Tm90aWZpY2F0aW9uUGVybWlzc2lvbiIsInRoZW4iLCJyZXN1bHQiLCJicmFuZCIsIlNka0NvbmZpZyIsImRlc2NyaXB0aW9uIiwiTW9kYWwiLCJjcmVhdGVEaWFsb2ciLCJFcnJvckRpYWxvZyIsIlBvc3Rob2dBbmFseXRpY3MiLCJpbnN0YW5jZSIsInRyYWNrRXZlbnQiLCJldmVudE5hbWUiLCJwZXJtaXNzaW9uIiwiZ3JhbnRlZCIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwidmFsdWUiLCJzZXRQcm9tcHRIaWRkZW4iLCJpc1Bvc3NpYmxlIiwiaXNBdWRpb0VuYWJsZWQiLCJoaWRkZW4iLCJwZXJzaXN0ZW50IiwiaGlkZU5vdGlmaWNhdGlvbnNUb2FzdCIsImdsb2JhbCIsImxvY2FsU3RvcmFnZSIsInNldEl0ZW0iLCJTdHJpbmciLCJzaG91bGRTaG93UHJvbXB0IiwiY2xpZW50IiwiaXNHdWVzdCIsImlzUHVzaE5vdGlmeURpc2FibGVkIiwiX2lzUHJvbXB0SGlkZGVuIiwiZ2V0SXRlbSIsInN0YXRlIiwiZ2V0U2VuZGVyIiwiY3JlZGVudGlhbHMiLCJ1c2VySWQiLCJkZWNyeXB0RXZlbnRJZk5lZWRlZCIsImlzQmVpbmdEZWNyeXB0ZWQiLCJpc0RlY3J5cHRpb25GYWlsdXJlIiwiZ2V0SWQiLCJsZW5ndGgiLCJzaGlmdCIsIl9ldmFsdWF0ZUV2ZW50IiwiaWR4IiwiaW5kZXhPZiIsInNwbGljZSIsImdldFVucmVhZE5vdGlmaWNhdGlvbkNvdW50IiwiY2xlYXJOb3RpZmljYXRpb24iLCJMZWdhY3lDYWxsSGFuZGxlciIsImdldFN1cHBvcnRzVmlydHVhbFJvb21zIiwibmF0aXZlUm9vbUlkIiwiVm9pcFVzZXJNYXBwZXIiLCJzaGFyZWRJbnN0YW5jZSIsIm5hdGl2ZVJvb21Gb3JWaXJ0dWFsUm9vbSIsImdldFJvb20iLCJhY3Rpb25zIiwiZ2V0UHVzaEFjdGlvbnNGb3JFdmVudCIsIm5vdGlmeSIsIlJvb21WaWV3U3RvcmUiLCJVc2VyQWN0aXZpdHkiLCJ1c2VyQWN0aXZlUmVjZW50bHkiLCJoYXNEaWFsb2dzIiwidHdlYWtzIiwibG91ZE5vdGlmaWNhdGlvbiIsIndpbmRvdyIsIm14Tm90aWZpZXIiXSwic291cmNlcyI6WyIuLi9zcmMvTm90aWZpZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxNyBWZWN0b3IgQ3JlYXRpb25zIEx0ZFxuQ29weXJpZ2h0IDIwMTcgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgTWF0cml4RXZlbnQsIE1hdHJpeEV2ZW50RXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5pbXBvcnQgeyBSb29tLCBSb29tRXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCB7IENsaWVudEV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NsaWVudFwiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuaW1wb3J0IHsgTXNnVHlwZSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvZXZlbnRcIjtcbmltcG9ydCB7IE1fTE9DQVRJT04gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL2xvY2F0aW9uXCI7XG5pbXBvcnQge1xuICAgIFBlcm1pc3Npb25DaGFuZ2VkIGFzIFBlcm1pc3Npb25DaGFuZ2VkRXZlbnQsXG59IGZyb20gXCJAbWF0cml4LW9yZy9hbmFseXRpY3MtZXZlbnRzL3R5cGVzL3R5cGVzY3JpcHQvUGVybWlzc2lvbkNoYW5nZWRcIjtcblxuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSAnLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IHsgUG9zdGhvZ0FuYWx5dGljcyB9IGZyb20gXCIuL1Bvc3Rob2dBbmFseXRpY3NcIjtcbmltcG9ydCBTZGtDb25maWcgZnJvbSAnLi9TZGtDb25maWcnO1xuaW1wb3J0IFBsYXRmb3JtUGVnIGZyb20gJy4vUGxhdGZvcm1QZWcnO1xuaW1wb3J0ICogYXMgVGV4dEZvckV2ZW50IGZyb20gJy4vVGV4dEZvckV2ZW50JztcbmltcG9ydCAqIGFzIEF2YXRhciBmcm9tICcuL0F2YXRhcic7XG5pbXBvcnQgZGlzIGZyb20gJy4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4vTW9kYWwnO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHsgaGlkZVRvYXN0IGFzIGhpZGVOb3RpZmljYXRpb25zVG9hc3QgfSBmcm9tIFwiLi90b2FzdHMvRGVza3RvcE5vdGlmaWNhdGlvbnNUb2FzdFwiO1xuaW1wb3J0IHsgU2V0dGluZ0xldmVsIH0gZnJvbSBcIi4vc2V0dGluZ3MvU2V0dGluZ0xldmVsXCI7XG5pbXBvcnQgeyBpc1B1c2hOb3RpZnlEaXNhYmxlZCB9IGZyb20gXCIuL3NldHRpbmdzL2NvbnRyb2xsZXJzL05vdGlmaWNhdGlvbkNvbnRyb2xsZXJzXCI7XG5pbXBvcnQgeyBSb29tVmlld1N0b3JlIH0gZnJvbSBcIi4vc3RvcmVzL1Jvb21WaWV3U3RvcmVcIjtcbmltcG9ydCBVc2VyQWN0aXZpdHkgZnJvbSBcIi4vVXNlckFjdGl2aXR5XCI7XG5pbXBvcnQgeyBtZWRpYUZyb21NeGMgfSBmcm9tIFwiLi9jdXN0b21pc2F0aW9ucy9NZWRpYVwiO1xuaW1wb3J0IEVycm9yRGlhbG9nIGZyb20gXCIuL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9FcnJvckRpYWxvZ1wiO1xuaW1wb3J0IExlZ2FjeUNhbGxIYW5kbGVyIGZyb20gXCIuL0xlZ2FjeUNhbGxIYW5kbGVyXCI7XG5pbXBvcnQgVm9pcFVzZXJNYXBwZXIgZnJvbSBcIi4vVm9pcFVzZXJNYXBwZXJcIjtcblxuLypcbiAqIERpc3BhdGNoZXM6XG4gKiB7XG4gKiAgIGFjdGlvbjogXCJub3RpZmllcl9lbmFibGVkXCIsXG4gKiAgIHZhbHVlOiBib29sZWFuXG4gKiB9XG4gKi9cblxuY29uc3QgTUFYX1BFTkRJTkdfRU5DUllQVEVEID0gMjA7XG5cbi8qXG5PdmVycmlkZSBib3RoIHRoZSBjb250ZW50IGJvZHkgYW5kIHRoZSBUZXh0Rm9yRXZlbnQgaGFuZGxlciBmb3Igc3BlY2lmaWMgbXNndHlwZXMsIGluIG5vdGlmaWNhdGlvbnMuXG5UaGlzIGlzIHVzZWZ1bCB3aGVuIHRoZSBjb250ZW50IGJvZHkgY29udGFpbnMgZmFsbGJhY2sgdGV4dCB0aGF0IHdvdWxkIGV4cGxhaW4gdGhhdCB0aGUgY2xpZW50IGNhbid0IGhhbmRsZSBhIHBhcnRpY3VsYXJcbnR5cGUgb2YgdGlsZS5cbiovXG5jb25zdCBtc2dUeXBlSGFuZGxlcnMgPSB7XG4gICAgW01zZ1R5cGUuS2V5VmVyaWZpY2F0aW9uUmVxdWVzdF06IChldmVudDogTWF0cml4RXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgbmFtZSA9IChldmVudC5zZW5kZXIgfHwge30pLm5hbWU7XG4gICAgICAgIHJldHVybiBfdChcIiUobmFtZSlzIGlzIHJlcXVlc3RpbmcgdmVyaWZpY2F0aW9uXCIsIHsgbmFtZSB9KTtcbiAgICB9LFxuICAgIFtNX0xPQ0FUSU9OLm5hbWVdOiAoZXZlbnQ6IE1hdHJpeEV2ZW50KSA9PiB7XG4gICAgICAgIHJldHVybiBUZXh0Rm9yRXZlbnQudGV4dEZvckxvY2F0aW9uRXZlbnQoZXZlbnQpKCk7XG4gICAgfSxcbiAgICBbTV9MT0NBVElPTi5hbHROYW1lXTogKGV2ZW50OiBNYXRyaXhFdmVudCkgPT4ge1xuICAgICAgICByZXR1cm4gVGV4dEZvckV2ZW50LnRleHRGb3JMb2NhdGlvbkV2ZW50KGV2ZW50KSgpO1xuICAgIH0sXG59O1xuXG5leHBvcnQgY29uc3QgTm90aWZpZXIgPSB7XG4gICAgbm90aWZzQnlSb29tOiB7fSxcblxuICAgIC8vIEEgbGlzdCBvZiBldmVudCBJRHMgdGhhdCB3ZSd2ZSByZWNlaXZlZCBidXQgbmVlZCB0byB3YWl0IHVudGlsXG4gICAgLy8gdGhleSdyZSBkZWNyeXB0ZWQgdW50aWwgd2UgZGVjaWRlIHdoZXRoZXIgdG8gbm90aWZ5IGZvciB0aGVtXG4gICAgLy8gb3Igbm90XG4gICAgcGVuZGluZ0VuY3J5cHRlZEV2ZW50SWRzOiBbXSxcblxuICAgIG5vdGlmaWNhdGlvbk1lc3NhZ2VGb3JFdmVudDogZnVuY3Rpb24oZXY6IE1hdHJpeEV2ZW50KTogc3RyaW5nIHtcbiAgICAgICAgaWYgKG1zZ1R5cGVIYW5kbGVycy5oYXNPd25Qcm9wZXJ0eShldi5nZXRDb250ZW50KCkubXNndHlwZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBtc2dUeXBlSGFuZGxlcnNbZXYuZ2V0Q29udGVudCgpLm1zZ3R5cGVdKGV2KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gVGV4dEZvckV2ZW50LnRleHRGb3JFdmVudChldik7XG4gICAgfSxcblxuICAgIF9kaXNwbGF5UG9wdXBOb3RpZmljYXRpb246IGZ1bmN0aW9uKGV2OiBNYXRyaXhFdmVudCwgcm9vbTogUm9vbSkge1xuICAgICAgICBjb25zdCBwbGFmID0gUGxhdGZvcm1QZWcuZ2V0KCk7XG4gICAgICAgIGlmICghcGxhZikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghcGxhZi5zdXBwb3J0c05vdGlmaWNhdGlvbnMoKSB8fCAhcGxhZi5tYXlTZW5kTm90aWZpY2F0aW9ucygpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgbXNnID0gdGhpcy5ub3RpZmljYXRpb25NZXNzYWdlRm9yRXZlbnQoZXYpO1xuICAgICAgICBpZiAoIW1zZykgcmV0dXJuO1xuXG4gICAgICAgIGxldCB0aXRsZTtcbiAgICAgICAgaWYgKCFldi5zZW5kZXIgfHwgcm9vbS5uYW1lID09PSBldi5zZW5kZXIubmFtZSkge1xuICAgICAgICAgICAgdGl0bGUgPSByb29tLm5hbWU7XG4gICAgICAgICAgICAvLyBub3RpZmljYXRpb25NZXNzYWdlRm9yRXZlbnQgaW5jbHVkZXMgc2VuZGVyLFxuICAgICAgICAgICAgLy8gYnV0IHdlIGFscmVhZHkgaGF2ZSB0aGUgc2VuZGVyIGhlcmVcbiAgICAgICAgICAgIGlmIChldi5nZXRDb250ZW50KCkuYm9keSAmJiAhbXNnVHlwZUhhbmRsZXJzLmhhc093blByb3BlcnR5KGV2LmdldENvbnRlbnQoKS5tc2d0eXBlKSkge1xuICAgICAgICAgICAgICAgIG1zZyA9IGV2LmdldENvbnRlbnQoKS5ib2R5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGV2LmdldFR5cGUoKSA9PT0gJ20ucm9vbS5tZW1iZXInKSB7XG4gICAgICAgICAgICAvLyBjb250ZXh0IGlzIGFsbCBpbiB0aGUgbWVzc2FnZSBoZXJlLCB3ZSBkb24ndCBuZWVkXG4gICAgICAgICAgICAvLyB0byBkaXNwbGF5IHNlbmRlciBpbmZvXG4gICAgICAgICAgICB0aXRsZSA9IHJvb20ubmFtZTtcbiAgICAgICAgfSBlbHNlIGlmIChldi5zZW5kZXIpIHtcbiAgICAgICAgICAgIHRpdGxlID0gZXYuc2VuZGVyLm5hbWUgKyBcIiAoXCIgKyByb29tLm5hbWUgKyBcIilcIjtcbiAgICAgICAgICAgIC8vIG5vdGlmaWNhdGlvbk1lc3NhZ2VGb3JFdmVudCBpbmNsdWRlcyBzZW5kZXIsXG4gICAgICAgICAgICAvLyBidXQgd2UndmUganVzdCBvdXQgc2VuZGVyIGluIHRoZSB0aXRsZVxuICAgICAgICAgICAgaWYgKGV2LmdldENvbnRlbnQoKS5ib2R5ICYmICFtc2dUeXBlSGFuZGxlcnMuaGFzT3duUHJvcGVydHkoZXYuZ2V0Q29udGVudCgpLm1zZ3R5cGUpKSB7XG4gICAgICAgICAgICAgICAgbXNnID0gZXYuZ2V0Q29udGVudCgpLmJvZHk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuaXNCb2R5RW5hYmxlZCgpKSB7XG4gICAgICAgICAgICBtc2cgPSAnJztcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBhdmF0YXJVcmwgPSBudWxsO1xuICAgICAgICBpZiAoZXYuc2VuZGVyICYmICFTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwibG93QmFuZHdpZHRoXCIpKSB7XG4gICAgICAgICAgICBhdmF0YXJVcmwgPSBBdmF0YXIuYXZhdGFyVXJsRm9yTWVtYmVyKGV2LnNlbmRlciwgNDAsIDQwLCAnY3JvcCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgbm90aWYgPSBwbGFmLmRpc3BsYXlOb3RpZmljYXRpb24odGl0bGUsIG1zZywgYXZhdGFyVXJsLCByb29tLCBldik7XG5cbiAgICAgICAgLy8gaWYgZGlzcGxheU5vdGlmaWNhdGlvbiByZXR1cm5zIG5vbi1udWxsLCAgdGhlIHBsYXRmb3JtIHN1cHBvcnRzXG4gICAgICAgIC8vIGNsZWFyaW5nIG5vdGlmaWNhdGlvbnMgbGF0ZXIsIHNvIGtlZXAgdHJhY2sgb2YgdGhpcy5cbiAgICAgICAgaWYgKG5vdGlmKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5ub3RpZnNCeVJvb21bZXYuZ2V0Um9vbUlkKCldID09PSB1bmRlZmluZWQpIHRoaXMubm90aWZzQnlSb29tW2V2LmdldFJvb21JZCgpXSA9IFtdO1xuICAgICAgICAgICAgdGhpcy5ub3RpZnNCeVJvb21bZXYuZ2V0Um9vbUlkKCldLnB1c2gobm90aWYpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGdldFNvdW5kRm9yUm9vbTogZnVuY3Rpb24ocm9vbUlkOiBzdHJpbmcpIHtcbiAgICAgICAgLy8gV2UgZG8gbm8gY2FjaGluZyBoZXJlIGJlY2F1c2UgdGhlIFNESyBjYWNoZXMgc2V0dGluZ1xuICAgICAgICAvLyBhbmQgdGhlIGJyb3dzZXIgd2lsbCBjYWNoZSB0aGUgc291bmQuXG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwibm90aWZpY2F0aW9uU291bmRcIiwgcm9vbUlkKTtcbiAgICAgICAgaWYgKCFjb250ZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghY29udGVudC51cmwpIHtcbiAgICAgICAgICAgIGxvZ2dlci53YXJuKGAke3Jvb21JZH0gaGFzIGN1c3RvbSBub3RpZmljYXRpb24gc291bmQgZXZlbnQsIGJ1dCBubyB1cmwga2V5YCk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghY29udGVudC51cmwuc3RhcnRzV2l0aChcIm14YzovL1wiKSkge1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oYCR7cm9vbUlkfSBoYXMgY3VzdG9tIG5vdGlmaWNhdGlvbiBzb3VuZCBldmVudCwgYnV0IHVybCBpcyBub3QgYSBteGMgdXJsYCk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElkZWFsbHkgaW4gaGVyZSB3ZSBjb3VsZCB1c2UgTVNDMTMxMCB0byBkZXRlY3QgdGhlIHR5cGUgb2YgZmlsZSwgYW5kIHJlamVjdCBpdC5cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdXJsOiBtZWRpYUZyb21NeGMoY29udGVudC51cmwpLnNyY0h0dHAsXG4gICAgICAgICAgICBuYW1lOiBjb250ZW50Lm5hbWUsXG4gICAgICAgICAgICB0eXBlOiBjb250ZW50LnR5cGUsXG4gICAgICAgICAgICBzaXplOiBjb250ZW50LnNpemUsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIF9wbGF5QXVkaW9Ob3RpZmljYXRpb246IGFzeW5jIGZ1bmN0aW9uKGV2OiBNYXRyaXhFdmVudCwgcm9vbTogUm9vbSkge1xuICAgICAgICBjb25zdCBzb3VuZCA9IHRoaXMuZ2V0U291bmRGb3JSb29tKHJvb20ucm9vbUlkKTtcbiAgICAgICAgbG9nZ2VyLmxvZyhgR290IHNvdW5kICR7c291bmQgJiYgc291bmQubmFtZSB8fCBcImRlZmF1bHRcIn0gZm9yICR7cm9vbS5yb29tSWR9YCk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdG9yID1cbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxBdWRpb0VsZW1lbnQ+KHNvdW5kID8gYGF1ZGlvW3NyYz0nJHtzb3VuZC51cmx9J11gIDogXCIjbWVzc2FnZUF1ZGlvXCIpO1xuICAgICAgICAgICAgbGV0IGF1ZGlvRWxlbWVudCA9IHNlbGVjdG9yO1xuICAgICAgICAgICAgaWYgKCFzZWxlY3Rvcikge1xuICAgICAgICAgICAgICAgIGlmICghc291bmQpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiTm8gYXVkaW8gZWxlbWVudCBvciBzb3VuZCB0byBwbGF5IGZvciBub3RpZmljYXRpb25cIik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXVkaW9FbGVtZW50ID0gbmV3IEF1ZGlvKHNvdW5kLnVybCk7XG4gICAgICAgICAgICAgICAgaWYgKHNvdW5kLnR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgYXVkaW9FbGVtZW50LnR5cGUgPSBzb3VuZC50eXBlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGF1ZGlvRWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhd2FpdCBhdWRpb0VsZW1lbnQucGxheSgpO1xuICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oXCJDYXVnaHQgZXJyb3Igd2hlbiB0cnlpbmcgdG8gZmV0Y2ggcm9vbSBub3RpZmljYXRpb24gc291bmQ6XCIsIGV4KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBzdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIGRvIG5vdCByZS1iaW5kIGluIHRoZSBjYXNlIG9mIHJlcGVhdGVkIGNhbGxcbiAgICAgICAgdGhpcy5ib3VuZE9uRXZlbnQgPSB0aGlzLmJvdW5kT25FdmVudCB8fCB0aGlzLm9uRXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5ib3VuZE9uU3luY1N0YXRlQ2hhbmdlID0gdGhpcy5ib3VuZE9uU3luY1N0YXRlQ2hhbmdlIHx8IHRoaXMub25TeW5jU3RhdGVDaGFuZ2UuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5ib3VuZE9uUm9vbVJlY2VpcHQgPSB0aGlzLmJvdW5kT25Sb29tUmVjZWlwdCB8fCB0aGlzLm9uUm9vbVJlY2VpcHQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5ib3VuZE9uRXZlbnREZWNyeXB0ZWQgPSB0aGlzLmJvdW5kT25FdmVudERlY3J5cHRlZCB8fCB0aGlzLm9uRXZlbnREZWNyeXB0ZWQuYmluZCh0aGlzKTtcblxuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkub24oQ2xpZW50RXZlbnQuRXZlbnQsIHRoaXMuYm91bmRPbkV2ZW50KTtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLm9uKFJvb21FdmVudC5SZWNlaXB0LCB0aGlzLmJvdW5kT25Sb29tUmVjZWlwdCk7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5vbihNYXRyaXhFdmVudEV2ZW50LkRlY3J5cHRlZCwgdGhpcy5ib3VuZE9uRXZlbnREZWNyeXB0ZWQpO1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkub24oQ2xpZW50RXZlbnQuU3luYywgdGhpcy5ib3VuZE9uU3luY1N0YXRlQ2hhbmdlKTtcbiAgICAgICAgdGhpcy50b29sYmFySGlkZGVuID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNTeW5jaW5nID0gZmFsc2U7XG4gICAgfSxcblxuICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoTWF0cml4Q2xpZW50UGVnLmdldCgpKSB7XG4gICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkucmVtb3ZlTGlzdGVuZXIoQ2xpZW50RXZlbnQuRXZlbnQsIHRoaXMuYm91bmRPbkV2ZW50KTtcbiAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5yZW1vdmVMaXN0ZW5lcihSb29tRXZlbnQuUmVjZWlwdCwgdGhpcy5ib3VuZE9uUm9vbVJlY2VpcHQpO1xuICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnJlbW92ZUxpc3RlbmVyKE1hdHJpeEV2ZW50RXZlbnQuRGVjcnlwdGVkLCB0aGlzLmJvdW5kT25FdmVudERlY3J5cHRlZCk7XG4gICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkucmVtb3ZlTGlzdGVuZXIoQ2xpZW50RXZlbnQuU3luYywgdGhpcy5ib3VuZE9uU3luY1N0YXRlQ2hhbmdlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmlzU3luY2luZyA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICBzdXBwb3J0c0Rlc2t0b3BOb3RpZmljYXRpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc3QgcGxhZiA9IFBsYXRmb3JtUGVnLmdldCgpO1xuICAgICAgICByZXR1cm4gcGxhZiAmJiBwbGFmLnN1cHBvcnRzTm90aWZpY2F0aW9ucygpO1xuICAgIH0sXG5cbiAgICBzZXRFbmFibGVkOiBmdW5jdGlvbihlbmFibGU6IGJvb2xlYW4sIGNhbGxiYWNrPzogKCkgPT4gdm9pZCkge1xuICAgICAgICBjb25zdCBwbGFmID0gUGxhdGZvcm1QZWcuZ2V0KCk7XG4gICAgICAgIGlmICghcGxhZikgcmV0dXJuO1xuXG4gICAgICAgIC8vIERldiBub3RlOiBXZSBkb24ndCBzZXQgdGhlIFwibm90aWZpY2F0aW9uc0VuYWJsZWRcIiBzZXR0aW5nIHRvIHRydWUgaGVyZSBiZWNhdXNlIGl0IGlzIGFcbiAgICAgICAgLy8gY2FsY3VsYXRlZCB2YWx1ZS4gSXQgaXMgZGV0ZXJtaW5lZCBiYXNlZCB1cG9uIHdoZXRoZXIgb3Igbm90IHRoZSBtYXN0ZXIgcnVsZSBpcyBlbmFibGVkXG4gICAgICAgIC8vIGFuZCBvdGhlciBmbGFncy4gU2V0dGluZyBpdCBoZXJlIHdvdWxkIGNhdXNlIGEgY2lyY3VsYXIgcmVmZXJlbmNlLlxuXG4gICAgICAgIC8vIG1ha2Ugc3VyZSB0aGF0IHdlIHBlcnNpc3QgdGhlIGN1cnJlbnQgc2V0dGluZyBhdWRpb19lbmFibGVkIHNldHRpbmdcbiAgICAgICAgLy8gYmVmb3JlIGNoYW5naW5nIGFueXRoaW5nXG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmlzTGV2ZWxTdXBwb3J0ZWQoU2V0dGluZ0xldmVsLkRFVklDRSkpIHtcbiAgICAgICAgICAgIFNldHRpbmdzU3RvcmUuc2V0VmFsdWUoXCJhdWRpb05vdGlmaWNhdGlvbnNFbmFibGVkXCIsIG51bGwsIFNldHRpbmdMZXZlbC5ERVZJQ0UsIHRoaXMuaXNFbmFibGVkKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVuYWJsZSkge1xuICAgICAgICAgICAgLy8gQXR0ZW1wdCB0byBnZXQgcGVybWlzc2lvbiBmcm9tIHVzZXJcbiAgICAgICAgICAgIHBsYWYucmVxdWVzdE5vdGlmaWNhdGlvblBlcm1pc3Npb24oKS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICE9PSAnZ3JhbnRlZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIHBlcm1pc3Npb24gcmVxdWVzdCB3YXMgZGlzbWlzc2VkIG9yIGRlbmllZFxuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBTdXBwb3J0IGFsdGVybmF0aXZlIGJyYW5kaW5nIGluIG1lc3NhZ2luZ1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBicmFuZCA9IFNka0NvbmZpZy5nZXQoKS5icmFuZDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVzY3JpcHRpb24gPSByZXN1bHQgPT09ICdkZW5pZWQnXG4gICAgICAgICAgICAgICAgICAgICAgICA/IF90KCclKGJyYW5kKXMgZG9lcyBub3QgaGF2ZSBwZXJtaXNzaW9uIHRvIHNlbmQgeW91IG5vdGlmaWNhdGlvbnMgLSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAncGxlYXNlIGNoZWNrIHlvdXIgYnJvd3NlciBzZXR0aW5ncycsIHsgYnJhbmQgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIDogX3QoJyUoYnJhbmQpcyB3YXMgbm90IGdpdmVuIHBlcm1pc3Npb24gdG8gc2VuZCBub3RpZmljYXRpb25zIC0gcGxlYXNlIHRyeSBhZ2FpbicsIHsgYnJhbmQgfSk7XG4gICAgICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KCdVbmFibGUgdG8gZW5hYmxlIE5vdGlmaWNhdGlvbnMnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soKTtcblxuICAgICAgICAgICAgICAgIFBvc3Rob2dBbmFseXRpY3MuaW5zdGFuY2UudHJhY2tFdmVudDxQZXJtaXNzaW9uQ2hhbmdlZEV2ZW50Pih7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogXCJQZXJtaXNzaW9uQ2hhbmdlZFwiLFxuICAgICAgICAgICAgICAgICAgICBwZXJtaXNzaW9uOiBcIk5vdGlmaWNhdGlvblwiLFxuICAgICAgICAgICAgICAgICAgICBncmFudGVkOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogXCJub3RpZmllcl9lbmFibGVkXCIsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBQb3N0aG9nQW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrRXZlbnQ8UGVybWlzc2lvbkNoYW5nZWRFdmVudD4oe1xuICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogXCJQZXJtaXNzaW9uQ2hhbmdlZFwiLFxuICAgICAgICAgICAgICAgIHBlcm1pc3Npb246IFwiTm90aWZpY2F0aW9uXCIsXG4gICAgICAgICAgICAgICAgZ3JhbnRlZDogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiBcIm5vdGlmaWVyX2VuYWJsZWRcIixcbiAgICAgICAgICAgICAgICB2YWx1ZTogZmFsc2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBzZXQgdGhlIG5vdGlmaWNhdGlvbnNfaGlkZGVuIGZsYWcsIGFzIHRoZSB1c2VyIGhhcyBrbm93aW5nbHkgaW50ZXJhY3RlZFxuICAgICAgICAvLyB3aXRoIHRoZSBzZXR0aW5nIHdlIHNob3VsZG4ndCBuYWcgdGhlbSBhbnkgZnVydGhlclxuICAgICAgICB0aGlzLnNldFByb21wdEhpZGRlbih0cnVlKTtcbiAgICB9LFxuXG4gICAgaXNFbmFibGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNQb3NzaWJsZSgpICYmIFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJub3RpZmljYXRpb25zRW5hYmxlZFwiKTtcbiAgICB9LFxuXG4gICAgaXNQb3NzaWJsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IHBsYWYgPSBQbGF0Zm9ybVBlZy5nZXQoKTtcbiAgICAgICAgaWYgKCFwbGFmKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmICghcGxhZi5zdXBwb3J0c05vdGlmaWNhdGlvbnMoKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAoIXBsYWYubWF5U2VuZE5vdGlmaWNhdGlvbnMoKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIHJldHVybiB0cnVlOyAvLyBwb3NzaWJsZSwgYnV0IG5vdCBuZWNlc3NhcmlseSBlbmFibGVkXG4gICAgfSxcblxuICAgIGlzQm9keUVuYWJsZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pc0VuYWJsZWQoKSAmJiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwibm90aWZpY2F0aW9uQm9keUVuYWJsZWRcIik7XG4gICAgfSxcblxuICAgIGlzQXVkaW9FbmFibGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gV2UgZG9uJ3Qgcm91dGUgQXVkaW8gdmlhIHRoZSBIVE1MIE5vdGlmaWNhdGlvbnMgQVBJIHNvIGl0IGlzIHBvc3NpYmxlIHJlZ2FyZGxlc3Mgb2Ygb3RoZXIgdGhpbmdzXG4gICAgICAgIHJldHVybiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiYXVkaW9Ob3RpZmljYXRpb25zRW5hYmxlZFwiKTtcbiAgICB9LFxuXG4gICAgc2V0UHJvbXB0SGlkZGVuOiBmdW5jdGlvbihoaWRkZW46IGJvb2xlYW4sIHBlcnNpc3RlbnQgPSB0cnVlKSB7XG4gICAgICAgIHRoaXMudG9vbGJhckhpZGRlbiA9IGhpZGRlbjtcblxuICAgICAgICBoaWRlTm90aWZpY2F0aW9uc1RvYXN0KCk7XG5cbiAgICAgICAgLy8gdXBkYXRlIHRoZSBpbmZvIHRvIGxvY2FsU3RvcmFnZSBmb3IgcGVyc2lzdGVudCBzZXR0aW5nc1xuICAgICAgICBpZiAocGVyc2lzdGVudCAmJiBnbG9iYWwubG9jYWxTdG9yYWdlKSB7XG4gICAgICAgICAgICBnbG9iYWwubG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJub3RpZmljYXRpb25zX2hpZGRlblwiLCBTdHJpbmcoaGlkZGVuKSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgc2hvdWxkU2hvd1Byb21wdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgaWYgKCFjbGllbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpc0d1ZXN0ID0gY2xpZW50LmlzR3Vlc3QoKTtcbiAgICAgICAgcmV0dXJuICFpc0d1ZXN0ICYmIHRoaXMuc3VwcG9ydHNEZXNrdG9wTm90aWZpY2F0aW9ucygpICYmICFpc1B1c2hOb3RpZnlEaXNhYmxlZCgpICYmXG4gICAgICAgICAgICAhdGhpcy5pc0VuYWJsZWQoKSAmJiAhdGhpcy5faXNQcm9tcHRIaWRkZW4oKTtcbiAgICB9LFxuXG4gICAgX2lzUHJvbXB0SGlkZGVuOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gQ2hlY2sgbG9jYWxTdG9yYWdlIGZvciBhbnkgc3VjaCBtZXRhIGRhdGFcbiAgICAgICAgaWYgKGdsb2JhbC5sb2NhbFN0b3JhZ2UpIHtcbiAgICAgICAgICAgIHJldHVybiBnbG9iYWwubG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJub3RpZmljYXRpb25zX2hpZGRlblwiKSA9PT0gXCJ0cnVlXCI7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy50b29sYmFySGlkZGVuO1xuICAgIH0sXG5cbiAgICBvblN5bmNTdGF0ZUNoYW5nZTogZnVuY3Rpb24oc3RhdGU6IHN0cmluZykge1xuICAgICAgICBpZiAoc3RhdGUgPT09IFwiU1lOQ0lOR1wiKSB7XG4gICAgICAgICAgICB0aGlzLmlzU3luY2luZyA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IFwiU1RPUFBFRFwiIHx8IHN0YXRlID09PSBcIkVSUk9SXCIpIHtcbiAgICAgICAgICAgIHRoaXMuaXNTeW5jaW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgb25FdmVudDogZnVuY3Rpb24oZXY6IE1hdHJpeEV2ZW50KSB7XG4gICAgICAgIGlmICghdGhpcy5pc1N5bmNpbmcpIHJldHVybjsgLy8gZG9uJ3QgYWxlcnQgZm9yIGFueSBtZXNzYWdlcyBpbml0aWFsbHlcbiAgICAgICAgaWYgKGV2LmdldFNlbmRlcigpID09PSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuY3JlZGVudGlhbHMudXNlcklkKSByZXR1cm47XG5cbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLmRlY3J5cHRFdmVudElmTmVlZGVkKGV2KTtcblxuICAgICAgICAvLyBJZiBpdCdzIGFuIGVuY3J5cHRlZCBldmVudCBhbmQgdGhlIHR5cGUgaXMgc3RpbGwgJ20ucm9vbS5lbmNyeXB0ZWQnLFxuICAgICAgICAvLyBpdCBoYXNuJ3QgeWV0IGJlZW4gZGVjcnlwdGVkLCBzbyB3YWl0IHVudGlsIGl0IGlzLlxuICAgICAgICBpZiAoZXYuaXNCZWluZ0RlY3J5cHRlZCgpIHx8IGV2LmlzRGVjcnlwdGlvbkZhaWx1cmUoKSkge1xuICAgICAgICAgICAgdGhpcy5wZW5kaW5nRW5jcnlwdGVkRXZlbnRJZHMucHVzaChldi5nZXRJZCgpKTtcbiAgICAgICAgICAgIC8vIGRvbid0IGxldCB0aGUgbGlzdCBmaWxsIHVwIGluZGVmaW5pdGVseVxuICAgICAgICAgICAgd2hpbGUgKHRoaXMucGVuZGluZ0VuY3J5cHRlZEV2ZW50SWRzLmxlbmd0aCA+IE1BWF9QRU5ESU5HX0VOQ1JZUFRFRCkge1xuICAgICAgICAgICAgICAgIHRoaXMucGVuZGluZ0VuY3J5cHRlZEV2ZW50SWRzLnNoaWZ0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9ldmFsdWF0ZUV2ZW50KGV2KTtcbiAgICB9LFxuXG4gICAgb25FdmVudERlY3J5cHRlZDogZnVuY3Rpb24oZXY6IE1hdHJpeEV2ZW50KSB7XG4gICAgICAgIC8vICdkZWNyeXB0ZWQnIG1lYW5zIHRoZSBkZWNyeXB0aW9uIHByb2Nlc3MgaGFzIGZpbmlzaGVkOiBpdCBtYXkgaGF2ZSBmYWlsZWQsXG4gICAgICAgIC8vIGluIHdoaWNoIGNhc2UgaXQgbWlnaHQgZGVjcnlwdCBzb29uIGlmIHRoZSBrZXlzIGFycml2ZVxuICAgICAgICBpZiAoZXYuaXNEZWNyeXB0aW9uRmFpbHVyZSgpKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgaWR4ID0gdGhpcy5wZW5kaW5nRW5jcnlwdGVkRXZlbnRJZHMuaW5kZXhPZihldi5nZXRJZCgpKTtcbiAgICAgICAgaWYgKGlkeCA9PT0gLTEpIHJldHVybjtcblxuICAgICAgICB0aGlzLnBlbmRpbmdFbmNyeXB0ZWRFdmVudElkcy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgdGhpcy5fZXZhbHVhdGVFdmVudChldik7XG4gICAgfSxcblxuICAgIG9uUm9vbVJlY2VpcHQ6IGZ1bmN0aW9uKGV2OiBNYXRyaXhFdmVudCwgcm9vbTogUm9vbSkge1xuICAgICAgICBpZiAocm9vbS5nZXRVbnJlYWROb3RpZmljYXRpb25Db3VudCgpID09PSAwKSB7XG4gICAgICAgICAgICAvLyBpZGVhbGx5IHdlIHdvdWxkIGNsZWFyIGVhY2ggbm90aWZpY2F0aW9uIHdoZW4gaXQgd2FzIHJlYWQsXG4gICAgICAgICAgICAvLyBidXQgd2UgaGF2ZSBubyB3YXksIGdpdmVuIGEgcmVhZCByZWNlaXB0LCB0byBrbm93IHdoZXRoZXJcbiAgICAgICAgICAgIC8vIHRoZSByZWNlaXB0IGNvbWVzIGJlZm9yZSBvciBhZnRlciBhbiBldmVudCwgc28gd2UgY2FuJ3RcbiAgICAgICAgICAgIC8vIGRvIHRoaXMuIEluc3RlYWQsIGNsZWFyIGFsbCBub3RpZmljYXRpb25zIGZvciBhIHJvb20gb25jZVxuICAgICAgICAgICAgLy8gdGhlcmUgYXJlIG5vIG5vdGlmcyBsZWZ0IGluIHRoYXQgcm9vbS4sIHdoaWNoIGlzIG5vdCBxdWl0ZVxuICAgICAgICAgICAgLy8gYXMgZ29vZCBidXQgaXQncyBzb21ldGhpbmcuXG4gICAgICAgICAgICBjb25zdCBwbGFmID0gUGxhdGZvcm1QZWcuZ2V0KCk7XG4gICAgICAgICAgICBpZiAoIXBsYWYpIHJldHVybjtcbiAgICAgICAgICAgIGlmICh0aGlzLm5vdGlmc0J5Um9vbVtyb29tLnJvb21JZF0gPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuICAgICAgICAgICAgZm9yIChjb25zdCBub3RpZiBvZiB0aGlzLm5vdGlmc0J5Um9vbVtyb29tLnJvb21JZF0pIHtcbiAgICAgICAgICAgICAgICBwbGFmLmNsZWFyTm90aWZpY2F0aW9uKG5vdGlmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLm5vdGlmc0J5Um9vbVtyb29tLnJvb21JZF07XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgX2V2YWx1YXRlRXZlbnQ6IGZ1bmN0aW9uKGV2OiBNYXRyaXhFdmVudCkge1xuICAgICAgICBsZXQgcm9vbUlkID0gZXYuZ2V0Um9vbUlkKCk7XG4gICAgICAgIGlmIChMZWdhY3lDYWxsSGFuZGxlci5pbnN0YW5jZS5nZXRTdXBwb3J0c1ZpcnR1YWxSb29tcygpKSB7XG4gICAgICAgICAgICAvLyBBdHRlbXB0IHRvIHRyYW5zbGF0ZSBhIHZpcnR1YWwgcm9vbSB0byBhIG5hdGl2ZSBvbmVcbiAgICAgICAgICAgIGNvbnN0IG5hdGl2ZVJvb21JZCA9IFZvaXBVc2VyTWFwcGVyLnNoYXJlZEluc3RhbmNlKCkubmF0aXZlUm9vbUZvclZpcnR1YWxSb29tKHJvb21JZCk7XG4gICAgICAgICAgICBpZiAobmF0aXZlUm9vbUlkKSB7XG4gICAgICAgICAgICAgICAgcm9vbUlkID0gbmF0aXZlUm9vbUlkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJvb20gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbShyb29tSWQpO1xuXG4gICAgICAgIGNvbnN0IGFjdGlvbnMgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0UHVzaEFjdGlvbnNGb3JFdmVudChldik7XG4gICAgICAgIGlmIChhY3Rpb25zPy5ub3RpZnkpIHtcbiAgICAgICAgICAgIGlmIChSb29tVmlld1N0b3JlLmluc3RhbmNlLmdldFJvb21JZCgpID09PSByb29tLnJvb21JZCAmJlxuICAgICAgICAgICAgICAgIFVzZXJBY3Rpdml0eS5zaGFyZWRJbnN0YW5jZSgpLnVzZXJBY3RpdmVSZWNlbnRseSgpICYmXG4gICAgICAgICAgICAgICAgIU1vZGFsLmhhc0RpYWxvZ3MoKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgLy8gZG9uJ3QgYm90aGVyIG5vdGlmeWluZyBhcyB1c2VyIHdhcyByZWNlbnRseSBhY3RpdmUgaW4gdGhpcyByb29tXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5pc0VuYWJsZWQoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2Rpc3BsYXlQb3B1cE5vdGlmaWNhdGlvbihldiwgcm9vbSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYWN0aW9ucy50d2Vha3Muc291bmQgJiYgdGhpcy5pc0F1ZGlvRW5hYmxlZCgpKSB7XG4gICAgICAgICAgICAgICAgUGxhdGZvcm1QZWcuZ2V0KCkubG91ZE5vdGlmaWNhdGlvbihldiwgcm9vbSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fcGxheUF1ZGlvTm90aWZpY2F0aW9uKGV2LCByb29tKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG59O1xuXG5pZiAoIXdpbmRvdy5teE5vdGlmaWVyKSB7XG4gICAgd2luZG93Lm14Tm90aWZpZXIgPSBOb3RpZmllcjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgd2luZG93Lm14Tm90aWZpZXI7XG4iXSwibWFwcGluZ3MiOiI7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