"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.UpdateCheckStatus = exports.SSO_ID_SERVER_URL_KEY = exports.SSO_IDP_ID_KEY = exports.SSO_HOMESERVER_URL_KEY = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _olmlib = require("matrix-js-sdk/src/crypto/olmlib");

var _logger = require("matrix-js-sdk/src/logger");

var _dispatcher = _interopRequireDefault(require("./dispatcher/dispatcher"));

var _actions = require("./dispatcher/actions");

var _UpdateToast = require("./toasts/UpdateToast");

var _MatrixClientPeg = require("./MatrixClientPeg");

var _StorageManager = require("./utils/StorageManager");

/*
Copyright 2016 Aviral Dasgupta
Copyright 2016 OpenMarket Ltd
Copyright 2018 New Vector Ltd
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
const SSO_HOMESERVER_URL_KEY = "mx_sso_hs_url";
exports.SSO_HOMESERVER_URL_KEY = SSO_HOMESERVER_URL_KEY;
const SSO_ID_SERVER_URL_KEY = "mx_sso_is_url";
exports.SSO_ID_SERVER_URL_KEY = SSO_ID_SERVER_URL_KEY;
const SSO_IDP_ID_KEY = "mx_sso_idp_id";
exports.SSO_IDP_ID_KEY = SSO_IDP_ID_KEY;
let UpdateCheckStatus;
exports.UpdateCheckStatus = UpdateCheckStatus;

(function (UpdateCheckStatus) {
  UpdateCheckStatus["Checking"] = "CHECKING";
  UpdateCheckStatus["Error"] = "ERROR";
  UpdateCheckStatus["NotAvailable"] = "NOTAVAILABLE";
  UpdateCheckStatus["Downloading"] = "DOWNLOADING";
  UpdateCheckStatus["Ready"] = "READY";
})(UpdateCheckStatus || (exports.UpdateCheckStatus = UpdateCheckStatus = {}));

const UPDATE_DEFER_KEY = "mx_defer_update";
/**
 * Base class for classes that provide platform-specific functionality
 * eg. Setting an application badge or displaying notifications
 *
 * Instances of this class are provided by the application.
 */

class BasePlatform {
  constructor() {
    (0, _defineProperty2.default)(this, "notificationCount", 0);
    (0, _defineProperty2.default)(this, "errorDidOccur", false);
    (0, _defineProperty2.default)(this, "onAction", payload => {
      switch (payload.action) {
        case 'on_client_not_viable':
        case _actions.Action.OnLoggedOut:
          this.setNotificationCount(0);
          break;
      }
    });

    _dispatcher.default.register(this.onAction);

    this.startUpdateCheck = this.startUpdateCheck.bind(this);
  }

  setNotificationCount(count) {
    this.notificationCount = count;
  }

  setErrorStatus(errorDidOccur) {
    this.errorDidOccur = errorDidOccur;
  }
  /**
   * Whether we can call checkForUpdate on this platform build
   */


  async canSelfUpdate() {
    return false;
  }

  startUpdateCheck() {
    (0, _UpdateToast.hideToast)();
    localStorage.removeItem(UPDATE_DEFER_KEY);

    _dispatcher.default.dispatch({
      action: _actions.Action.CheckUpdates,
      status: UpdateCheckStatus.Checking
    });
  }
  /**
   * Update the currently running app to the latest available version
   * and replace this instance of the app with the new version.
   */


  installUpdate() {}
  /**
   * Check if the version update has been deferred and that deferment is still in effect
   * @param newVersion the version string to check
   */


  shouldShowUpdate(newVersion) {
    // If the user registered on this client in the last 24 hours then do not show them the update toast
    if (_MatrixClientPeg.MatrixClientPeg.userRegisteredWithinLastHours(24)) return false;

    try {
      const [version, deferUntil] = JSON.parse(localStorage.getItem(UPDATE_DEFER_KEY));
      return newVersion !== version || Date.now() > deferUntil;
    } catch (e) {
      return true;
    }
  }
  /**
   * Ignore the pending update and don't prompt about this version
   * until the next morning (8am).
   */


  deferUpdate(newVersion) {
    const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
    date.setHours(8, 0, 0, 0); // set to next 8am

    localStorage.setItem(UPDATE_DEFER_KEY, JSON.stringify([newVersion, date.getTime()]));
    (0, _UpdateToast.hideToast)();
  }
  /**
   * Return true if platform supports multi-language
   * spell-checking, otherwise false.
   */


  supportsSpellCheckSettings() {
    return false;
  }
  /**
   * Returns true if platform allows overriding native context menus
   */


  allowOverridingNativeContextMenus() {
    return false;
  }
  /**
   * Returns true if the platform supports displaying
   * notifications, otherwise false.
   * @returns {boolean} whether the platform supports displaying notifications
   */


  supportsNotifications() {
    return false;
  }
  /**
   * Returns true if the application currently has permission
   * to display notifications. Otherwise false.
   * @returns {boolean} whether the application has permission to display notifications
   */


  maySendNotifications() {
    return false;
  }
  /**
   * Requests permission to send notifications. Returns
   * a promise that is resolved when the user has responded
   * to the request. The promise has a single string argument
   * that is 'granted' if the user allowed the request or
   * 'denied' otherwise.
   */


  displayNotification(title, msg, avatarUrl, room, ev) {
    const notifBody = {
      body: msg,
      silent: true // we play our own sounds

    };
    if (avatarUrl) notifBody['icon'] = avatarUrl;
    const notification = new window.Notification(title, notifBody);

    notification.onclick = () => {
      const payload = {
        action: _actions.Action.ViewRoom,
        room_id: room.roomId,
        metricsTrigger: "Notification"
      };

      if (ev.getThread()) {
        payload.event_id = ev.getId();
      }

      _dispatcher.default.dispatch(payload);

      window.focus();
    };

    return notification;
  }

  loudNotification(ev, room) {}

  clearNotification(notif) {
    // Some browsers don't support this, e.g Safari on iOS
    // https://developer.mozilla.org/en-US/docs/Web/API/Notification/close
    if (notif.close) {
      notif.close();
    }
  }
  /**
   * Returns true if the platform requires URL previews in tooltips, otherwise false.
   * @returns {boolean} whether the platform requires URL previews in tooltips
   */


  needsUrlTooltips() {
    return false;
  }
  /**
   * Returns a promise that resolves to a string representing the current version of the application.
   */


  supportsSetting(settingName) {
    return false;
  }

  getSettingValue(settingName) {
    return undefined;
  }

  setSettingValue(settingName, value) {
    throw new Error("Unimplemented");
  }
  /**
   * Get our platform specific EventIndexManager.
   *
   * @return {BaseEventIndexManager} The EventIndex manager for our platform,
   * can be null if the platform doesn't support event indexing.
   */


  getEventIndexingManager() {
    return null;
  }

  setLanguage(preferredLangs) {}

  setSpellCheckEnabled(enabled) {}

  async getSpellCheckEnabled() {
    return null;
  }

  setSpellCheckLanguages(preferredLangs) {}

  getSpellCheckLanguages() {
    return null;
  }

  async getDesktopCapturerSources(options) {
    return [];
  }

  supportsDesktopCapturer() {
    return false;
  }

  supportsJitsiScreensharing() {
    return true;
  }

  overrideBrowserShortcuts() {
    return false;
  }

  navigateForwardBack(back) {}

  getAvailableSpellCheckLanguages() {
    return null;
  }

  getSSOCallbackUrl(fragmentAfterLogin) {
    const url = new URL(window.location.href);
    url.hash = fragmentAfterLogin || "";
    return url;
  }
  /**
   * Begin Single Sign On flows.
   * @param {MatrixClient} mxClient the matrix client using which we should start the flow
   * @param {"sso"|"cas"} loginType the type of SSO it is, CAS/SSO.
   * @param {string} fragmentAfterLogin the hash to pass to the app during sso callback.
   * @param {string} idpId The ID of the Identity Provider being targeted, optional.
   */


  startSingleSignOn(mxClient, loginType, fragmentAfterLogin, idpId) {
    // persist hs url and is url for when the user is returned to the app with the login token
    localStorage.setItem(SSO_HOMESERVER_URL_KEY, mxClient.getHomeserverUrl());

    if (mxClient.getIdentityServerUrl()) {
      localStorage.setItem(SSO_ID_SERVER_URL_KEY, mxClient.getIdentityServerUrl());
    }

    if (idpId) {
      localStorage.setItem(SSO_IDP_ID_KEY, idpId);
    }

    const callbackUrl = this.getSSOCallbackUrl(fragmentAfterLogin);
    window.location.href = mxClient.getSsoLoginUrl(callbackUrl.toString(), loginType, idpId); // redirect to SSO
  }
  /**
   * Get a previously stored pickle key.  The pickle key is used for
   * encrypting libolm objects.
   * @param {string} userId the user ID for the user that the pickle key is for.
   * @param {string} userId the device ID that the pickle key is for.
   * @returns {string|null} the previously stored pickle key, or null if no
   *     pickle key has been stored.
   */


  async getPickleKey(userId, deviceId) {
    if (!window.crypto || !window.crypto.subtle) {
      return null;
    }

    let data;

    try {
      data = await (0, _StorageManager.idbLoad)("pickleKey", [userId, deviceId]);
    } catch (e) {
      _logger.logger.error("idbLoad for pickleKey failed", e);
    }

    if (!data) {
      return null;
    }

    if (!data.encrypted || !data.iv || !data.cryptoKey) {
      _logger.logger.error("Badly formatted pickle key");

      return null;
    }

    const additionalData = new Uint8Array(userId.length + deviceId.length + 1);

    for (let i = 0; i < userId.length; i++) {
      additionalData[i] = userId.charCodeAt(i);
    }

    additionalData[userId.length] = 124; // "|"

    for (let i = 0; i < deviceId.length; i++) {
      additionalData[userId.length + 1 + i] = deviceId.charCodeAt(i);
    }

    try {
      const key = await crypto.subtle.decrypt({
        name: "AES-GCM",
        iv: data.iv,
        additionalData
      }, data.cryptoKey, data.encrypted);
      return (0, _olmlib.encodeUnpaddedBase64)(key);
    } catch (e) {
      _logger.logger.error("Error decrypting pickle key");

      return null;
    }
  }
  /**
   * Create and store a pickle key for encrypting libolm objects.
   * @param {string} userId the user ID for the user that the pickle key is for.
   * @param {string} deviceId the device ID that the pickle key is for.
   * @returns {string|null} the pickle key, or null if the platform does not
   *     support storing pickle keys.
   */


  async createPickleKey(userId, deviceId) {
    if (!window.crypto || !window.crypto.subtle) {
      return null;
    }

    const crypto = window.crypto;
    const randomArray = new Uint8Array(32);
    crypto.getRandomValues(randomArray);
    const cryptoKey = await crypto.subtle.generateKey({
      name: "AES-GCM",
      length: 256
    }, false, ["encrypt", "decrypt"]);
    const iv = new Uint8Array(32);
    crypto.getRandomValues(iv);
    const additionalData = new Uint8Array(userId.length + deviceId.length + 1);

    for (let i = 0; i < userId.length; i++) {
      additionalData[i] = userId.charCodeAt(i);
    }

    additionalData[userId.length] = 124; // "|"

    for (let i = 0; i < deviceId.length; i++) {
      additionalData[userId.length + 1 + i] = deviceId.charCodeAt(i);
    }

    const encrypted = await crypto.subtle.encrypt({
      name: "AES-GCM",
      iv,
      additionalData
    }, cryptoKey, randomArray);

    try {
      await (0, _StorageManager.idbSave)("pickleKey", [userId, deviceId], {
        encrypted,
        iv,
        cryptoKey
      });
    } catch (e) {
      return null;
    }

    return (0, _olmlib.encodeUnpaddedBase64)(randomArray);
  }
  /**
   * Delete a previously stored pickle key from storage.
   * @param {string} userId the user ID for the user that the pickle key is for.
   * @param {string} userId the device ID that the pickle key is for.
   */


  async destroyPickleKey(userId, deviceId) {
    try {
      await (0, _StorageManager.idbDelete)("pickleKey", [userId, deviceId]);
    } catch (e) {
      _logger.logger.error("idbDelete failed in destroyPickleKey", e);
    }
  }

}

exports.default = BasePlatform;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTU09fSE9NRVNFUlZFUl9VUkxfS0VZIiwiU1NPX0lEX1NFUlZFUl9VUkxfS0VZIiwiU1NPX0lEUF9JRF9LRVkiLCJVcGRhdGVDaGVja1N0YXR1cyIsIlVQREFURV9ERUZFUl9LRVkiLCJCYXNlUGxhdGZvcm0iLCJjb25zdHJ1Y3RvciIsInBheWxvYWQiLCJhY3Rpb24iLCJBY3Rpb24iLCJPbkxvZ2dlZE91dCIsInNldE5vdGlmaWNhdGlvbkNvdW50IiwiZGlzIiwicmVnaXN0ZXIiLCJvbkFjdGlvbiIsInN0YXJ0VXBkYXRlQ2hlY2siLCJiaW5kIiwiY291bnQiLCJub3RpZmljYXRpb25Db3VudCIsInNldEVycm9yU3RhdHVzIiwiZXJyb3JEaWRPY2N1ciIsImNhblNlbGZVcGRhdGUiLCJoaWRlVXBkYXRlVG9hc3QiLCJsb2NhbFN0b3JhZ2UiLCJyZW1vdmVJdGVtIiwiZGlzcGF0Y2giLCJDaGVja1VwZGF0ZXMiLCJzdGF0dXMiLCJDaGVja2luZyIsImluc3RhbGxVcGRhdGUiLCJzaG91bGRTaG93VXBkYXRlIiwibmV3VmVyc2lvbiIsIk1hdHJpeENsaWVudFBlZyIsInVzZXJSZWdpc3RlcmVkV2l0aGluTGFzdEhvdXJzIiwidmVyc2lvbiIsImRlZmVyVW50aWwiLCJKU09OIiwicGFyc2UiLCJnZXRJdGVtIiwiRGF0ZSIsIm5vdyIsImUiLCJkZWZlclVwZGF0ZSIsImRhdGUiLCJzZXRIb3VycyIsInNldEl0ZW0iLCJzdHJpbmdpZnkiLCJnZXRUaW1lIiwic3VwcG9ydHNTcGVsbENoZWNrU2V0dGluZ3MiLCJhbGxvd092ZXJyaWRpbmdOYXRpdmVDb250ZXh0TWVudXMiLCJzdXBwb3J0c05vdGlmaWNhdGlvbnMiLCJtYXlTZW5kTm90aWZpY2F0aW9ucyIsImRpc3BsYXlOb3RpZmljYXRpb24iLCJ0aXRsZSIsIm1zZyIsImF2YXRhclVybCIsInJvb20iLCJldiIsIm5vdGlmQm9keSIsImJvZHkiLCJzaWxlbnQiLCJub3RpZmljYXRpb24iLCJ3aW5kb3ciLCJOb3RpZmljYXRpb24iLCJvbmNsaWNrIiwiVmlld1Jvb20iLCJyb29tX2lkIiwicm9vbUlkIiwibWV0cmljc1RyaWdnZXIiLCJnZXRUaHJlYWQiLCJldmVudF9pZCIsImdldElkIiwiZm9jdXMiLCJsb3VkTm90aWZpY2F0aW9uIiwiY2xlYXJOb3RpZmljYXRpb24iLCJub3RpZiIsImNsb3NlIiwibmVlZHNVcmxUb29sdGlwcyIsInN1cHBvcnRzU2V0dGluZyIsInNldHRpbmdOYW1lIiwiZ2V0U2V0dGluZ1ZhbHVlIiwidW5kZWZpbmVkIiwic2V0U2V0dGluZ1ZhbHVlIiwidmFsdWUiLCJFcnJvciIsImdldEV2ZW50SW5kZXhpbmdNYW5hZ2VyIiwic2V0TGFuZ3VhZ2UiLCJwcmVmZXJyZWRMYW5ncyIsInNldFNwZWxsQ2hlY2tFbmFibGVkIiwiZW5hYmxlZCIsImdldFNwZWxsQ2hlY2tFbmFibGVkIiwic2V0U3BlbGxDaGVja0xhbmd1YWdlcyIsImdldFNwZWxsQ2hlY2tMYW5ndWFnZXMiLCJnZXREZXNrdG9wQ2FwdHVyZXJTb3VyY2VzIiwib3B0aW9ucyIsInN1cHBvcnRzRGVza3RvcENhcHR1cmVyIiwic3VwcG9ydHNKaXRzaVNjcmVlbnNoYXJpbmciLCJvdmVycmlkZUJyb3dzZXJTaG9ydGN1dHMiLCJuYXZpZ2F0ZUZvcndhcmRCYWNrIiwiYmFjayIsImdldEF2YWlsYWJsZVNwZWxsQ2hlY2tMYW5ndWFnZXMiLCJnZXRTU09DYWxsYmFja1VybCIsImZyYWdtZW50QWZ0ZXJMb2dpbiIsInVybCIsIlVSTCIsImxvY2F0aW9uIiwiaHJlZiIsImhhc2giLCJzdGFydFNpbmdsZVNpZ25PbiIsIm14Q2xpZW50IiwibG9naW5UeXBlIiwiaWRwSWQiLCJnZXRIb21lc2VydmVyVXJsIiwiZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwiLCJjYWxsYmFja1VybCIsImdldFNzb0xvZ2luVXJsIiwidG9TdHJpbmciLCJnZXRQaWNrbGVLZXkiLCJ1c2VySWQiLCJkZXZpY2VJZCIsImNyeXB0byIsInN1YnRsZSIsImRhdGEiLCJpZGJMb2FkIiwibG9nZ2VyIiwiZXJyb3IiLCJlbmNyeXB0ZWQiLCJpdiIsImNyeXB0b0tleSIsImFkZGl0aW9uYWxEYXRhIiwiVWludDhBcnJheSIsImxlbmd0aCIsImkiLCJjaGFyQ29kZUF0Iiwia2V5IiwiZGVjcnlwdCIsIm5hbWUiLCJlbmNvZGVVbnBhZGRlZEJhc2U2NCIsImNyZWF0ZVBpY2tsZUtleSIsInJhbmRvbUFycmF5IiwiZ2V0UmFuZG9tVmFsdWVzIiwiZ2VuZXJhdGVLZXkiLCJlbmNyeXB0IiwiaWRiU2F2ZSIsImRlc3Ryb3lQaWNrbGVLZXkiLCJpZGJEZWxldGUiXSwic291cmNlcyI6WyIuLi9zcmMvQmFzZVBsYXRmb3JtLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNiBBdmlyYWwgRGFzZ3VwdGFcbkNvcHlyaWdodCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgeyBNYXRyaXhDbGllbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY2xpZW50XCI7XG5pbXBvcnQgeyBlbmNvZGVVbnBhZGRlZEJhc2U2NCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jcnlwdG8vb2xtbGliXCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5pbXBvcnQgeyBNYXRyaXhFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnRcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcblxuaW1wb3J0IGRpcyBmcm9tICcuL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgQmFzZUV2ZW50SW5kZXhNYW5hZ2VyIGZyb20gJy4vaW5kZXhpbmcvQmFzZUV2ZW50SW5kZXhNYW5hZ2VyJztcbmltcG9ydCB7IEFjdGlvblBheWxvYWQgfSBmcm9tIFwiLi9kaXNwYXRjaGVyL3BheWxvYWRzXCI7XG5pbXBvcnQgeyBDaGVja1VwZGF0ZXNQYXlsb2FkIH0gZnJvbSBcIi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9DaGVja1VwZGF0ZXNQYXlsb2FkXCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcbmltcG9ydCB7IGhpZGVUb2FzdCBhcyBoaWRlVXBkYXRlVG9hc3QgfSBmcm9tIFwiLi90b2FzdHMvVXBkYXRlVG9hc3RcIjtcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gXCIuL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IHsgaWRiTG9hZCwgaWRiU2F2ZSwgaWRiRGVsZXRlIH0gZnJvbSBcIi4vdXRpbHMvU3RvcmFnZU1hbmFnZXJcIjtcbmltcG9ydCB7IFZpZXdSb29tUGF5bG9hZCB9IGZyb20gXCIuL2Rpc3BhdGNoZXIvcGF5bG9hZHMvVmlld1Jvb21QYXlsb2FkXCI7XG5pbXBvcnQgeyBJQ29uZmlnT3B0aW9ucyB9IGZyb20gXCIuL0lDb25maWdPcHRpb25zXCI7XG5cbmV4cG9ydCBjb25zdCBTU09fSE9NRVNFUlZFUl9VUkxfS0VZID0gXCJteF9zc29faHNfdXJsXCI7XG5leHBvcnQgY29uc3QgU1NPX0lEX1NFUlZFUl9VUkxfS0VZID0gXCJteF9zc29faXNfdXJsXCI7XG5leHBvcnQgY29uc3QgU1NPX0lEUF9JRF9LRVkgPSBcIm14X3Nzb19pZHBfaWRcIjtcblxuZXhwb3J0IGVudW0gVXBkYXRlQ2hlY2tTdGF0dXMge1xuICAgIENoZWNraW5nID0gXCJDSEVDS0lOR1wiLFxuICAgIEVycm9yID0gXCJFUlJPUlwiLFxuICAgIE5vdEF2YWlsYWJsZSA9IFwiTk9UQVZBSUxBQkxFXCIsXG4gICAgRG93bmxvYWRpbmcgPSBcIkRPV05MT0FESU5HXCIsXG4gICAgUmVhZHkgPSBcIlJFQURZXCIsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVXBkYXRlU3RhdHVzIHtcbiAgICAvKipcbiAgICAgKiBUaGUgY3VycmVudCBwaGFzZSBvZiB0aGUgbWFudWFsIHVwZGF0ZSBjaGVjay5cbiAgICAgKi9cbiAgICBzdGF0dXM6IFVwZGF0ZUNoZWNrU3RhdHVzO1xuICAgIC8qKlxuICAgICAqIERldGFpbCBzdHJpbmcgcmVsYXRpbmcgdG8gdGhlIGN1cnJlbnQgc3RhdHVzLCB0eXBpY2FsbHkgZm9yIGVycm9yIGRldGFpbHMuXG4gICAgICovXG4gICAgZGV0YWlsPzogc3RyaW5nO1xufVxuXG5jb25zdCBVUERBVEVfREVGRVJfS0VZID0gXCJteF9kZWZlcl91cGRhdGVcIjtcblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBjbGFzc2VzIHRoYXQgcHJvdmlkZSBwbGF0Zm9ybS1zcGVjaWZpYyBmdW5jdGlvbmFsaXR5XG4gKiBlZy4gU2V0dGluZyBhbiBhcHBsaWNhdGlvbiBiYWRnZSBvciBkaXNwbGF5aW5nIG5vdGlmaWNhdGlvbnNcbiAqXG4gKiBJbnN0YW5jZXMgb2YgdGhpcyBjbGFzcyBhcmUgcHJvdmlkZWQgYnkgdGhlIGFwcGxpY2F0aW9uLlxuICovXG5leHBvcnQgZGVmYXVsdCBhYnN0cmFjdCBjbGFzcyBCYXNlUGxhdGZvcm0ge1xuICAgIHByb3RlY3RlZCBub3RpZmljYXRpb25Db3VudCA9IDA7XG4gICAgcHJvdGVjdGVkIGVycm9yRGlkT2NjdXIgPSBmYWxzZTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBkaXMucmVnaXN0ZXIodGhpcy5vbkFjdGlvbik7XG4gICAgICAgIHRoaXMuc3RhcnRVcGRhdGVDaGVjayA9IHRoaXMuc3RhcnRVcGRhdGVDaGVjay5iaW5kKHRoaXMpO1xuICAgIH1cblxuICAgIHB1YmxpYyBhYnN0cmFjdCBnZXRDb25maWcoKTogUHJvbWlzZTxJQ29uZmlnT3B0aW9ucz47XG5cbiAgICBwdWJsaWMgYWJzdHJhY3QgZ2V0RGVmYXVsdERldmljZURpc3BsYXlOYW1lKCk6IHN0cmluZztcblxuICAgIHByb3RlY3RlZCBvbkFjdGlvbiA9IChwYXlsb2FkOiBBY3Rpb25QYXlsb2FkKTogdm9pZCA9PiB7XG4gICAgICAgIHN3aXRjaCAocGF5bG9hZC5hY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgJ29uX2NsaWVudF9ub3RfdmlhYmxlJzpcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLk9uTG9nZ2VkT3V0OlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0Tm90aWZpY2F0aW9uQ291bnQoMCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gVXNlZCBwcmltYXJpbHkgZm9yIEFuYWx5dGljc1xuICAgIHB1YmxpYyBhYnN0cmFjdCBnZXRIdW1hblJlYWRhYmxlTmFtZSgpOiBzdHJpbmc7XG5cbiAgICBwdWJsaWMgc2V0Tm90aWZpY2F0aW9uQ291bnQoY291bnQ6IG51bWJlcik6IHZvaWQge1xuICAgICAgICB0aGlzLm5vdGlmaWNhdGlvbkNvdW50ID0gY291bnQ7XG4gICAgfVxuXG4gICAgcHVibGljIHNldEVycm9yU3RhdHVzKGVycm9yRGlkT2NjdXI6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgdGhpcy5lcnJvckRpZE9jY3VyID0gZXJyb3JEaWRPY2N1cjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHdlIGNhbiBjYWxsIGNoZWNrRm9yVXBkYXRlIG9uIHRoaXMgcGxhdGZvcm0gYnVpbGRcbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgY2FuU2VsZlVwZGF0ZSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGFydFVwZGF0ZUNoZWNrKCk6IHZvaWQge1xuICAgICAgICBoaWRlVXBkYXRlVG9hc3QoKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oVVBEQVRFX0RFRkVSX0tFWSk7XG4gICAgICAgIGRpcy5kaXNwYXRjaDxDaGVja1VwZGF0ZXNQYXlsb2FkPih7XG4gICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5DaGVja1VwZGF0ZXMsXG4gICAgICAgICAgICBzdGF0dXM6IFVwZGF0ZUNoZWNrU3RhdHVzLkNoZWNraW5nLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGRhdGUgdGhlIGN1cnJlbnRseSBydW5uaW5nIGFwcCB0byB0aGUgbGF0ZXN0IGF2YWlsYWJsZSB2ZXJzaW9uXG4gICAgICogYW5kIHJlcGxhY2UgdGhpcyBpbnN0YW5jZSBvZiB0aGUgYXBwIHdpdGggdGhlIG5ldyB2ZXJzaW9uLlxuICAgICAqL1xuICAgIHB1YmxpYyBpbnN0YWxsVXBkYXRlKCk6IHZvaWQge31cblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIHRoZSB2ZXJzaW9uIHVwZGF0ZSBoYXMgYmVlbiBkZWZlcnJlZCBhbmQgdGhhdCBkZWZlcm1lbnQgaXMgc3RpbGwgaW4gZWZmZWN0XG4gICAgICogQHBhcmFtIG5ld1ZlcnNpb24gdGhlIHZlcnNpb24gc3RyaW5nIHRvIGNoZWNrXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHNob3VsZFNob3dVcGRhdGUobmV3VmVyc2lvbjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIC8vIElmIHRoZSB1c2VyIHJlZ2lzdGVyZWQgb24gdGhpcyBjbGllbnQgaW4gdGhlIGxhc3QgMjQgaG91cnMgdGhlbiBkbyBub3Qgc2hvdyB0aGVtIHRoZSB1cGRhdGUgdG9hc3RcbiAgICAgICAgaWYgKE1hdHJpeENsaWVudFBlZy51c2VyUmVnaXN0ZXJlZFdpdGhpbkxhc3RIb3VycygyNCkpIHJldHVybiBmYWxzZTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgW3ZlcnNpb24sIGRlZmVyVW50aWxdID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShVUERBVEVfREVGRVJfS0VZKSk7XG4gICAgICAgICAgICByZXR1cm4gbmV3VmVyc2lvbiAhPT0gdmVyc2lvbiB8fCBEYXRlLm5vdygpID4gZGVmZXJVbnRpbDtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJZ25vcmUgdGhlIHBlbmRpbmcgdXBkYXRlIGFuZCBkb24ndCBwcm9tcHQgYWJvdXQgdGhpcyB2ZXJzaW9uXG4gICAgICogdW50aWwgdGhlIG5leHQgbW9ybmluZyAoOGFtKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgZGVmZXJVcGRhdGUobmV3VmVyc2lvbjogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZShEYXRlLm5vdygpICsgMjQgKiA2MCAqIDYwICogMTAwMCk7XG4gICAgICAgIGRhdGUuc2V0SG91cnMoOCwgMCwgMCwgMCk7IC8vIHNldCB0byBuZXh0IDhhbVxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShVUERBVEVfREVGRVJfS0VZLCBKU09OLnN0cmluZ2lmeShbbmV3VmVyc2lvbiwgZGF0ZS5nZXRUaW1lKCldKSk7XG4gICAgICAgIGhpZGVVcGRhdGVUb2FzdCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0cnVlIGlmIHBsYXRmb3JtIHN1cHBvcnRzIG11bHRpLWxhbmd1YWdlXG4gICAgICogc3BlbGwtY2hlY2tpbmcsIG90aGVyd2lzZSBmYWxzZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3VwcG9ydHNTcGVsbENoZWNrU2V0dGluZ3MoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgcGxhdGZvcm0gYWxsb3dzIG92ZXJyaWRpbmcgbmF0aXZlIGNvbnRleHQgbWVudXNcbiAgICAgKi9cbiAgICBwdWJsaWMgYWxsb3dPdmVycmlkaW5nTmF0aXZlQ29udGV4dE1lbnVzKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBwbGF0Zm9ybSBzdXBwb3J0cyBkaXNwbGF5aW5nXG4gICAgICogbm90aWZpY2F0aW9ucywgb3RoZXJ3aXNlIGZhbHNlLlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB3aGV0aGVyIHRoZSBwbGF0Zm9ybSBzdXBwb3J0cyBkaXNwbGF5aW5nIG5vdGlmaWNhdGlvbnNcbiAgICAgKi9cbiAgICBwdWJsaWMgc3VwcG9ydHNOb3RpZmljYXRpb25zKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBhcHBsaWNhdGlvbiBjdXJyZW50bHkgaGFzIHBlcm1pc3Npb25cbiAgICAgKiB0byBkaXNwbGF5IG5vdGlmaWNhdGlvbnMuIE90aGVyd2lzZSBmYWxzZS5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gd2hldGhlciB0aGUgYXBwbGljYXRpb24gaGFzIHBlcm1pc3Npb24gdG8gZGlzcGxheSBub3RpZmljYXRpb25zXG4gICAgICovXG4gICAgcHVibGljIG1heVNlbmROb3RpZmljYXRpb25zKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVxdWVzdHMgcGVybWlzc2lvbiB0byBzZW5kIG5vdGlmaWNhdGlvbnMuIFJldHVybnNcbiAgICAgKiBhIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIHRoZSB1c2VyIGhhcyByZXNwb25kZWRcbiAgICAgKiB0byB0aGUgcmVxdWVzdC4gVGhlIHByb21pc2UgaGFzIGEgc2luZ2xlIHN0cmluZyBhcmd1bWVudFxuICAgICAqIHRoYXQgaXMgJ2dyYW50ZWQnIGlmIHRoZSB1c2VyIGFsbG93ZWQgdGhlIHJlcXVlc3Qgb3JcbiAgICAgKiAnZGVuaWVkJyBvdGhlcndpc2UuXG4gICAgICovXG4gICAgcHVibGljIGFic3RyYWN0IHJlcXVlc3ROb3RpZmljYXRpb25QZXJtaXNzaW9uKCk6IFByb21pc2U8c3RyaW5nPjtcblxuICAgIHB1YmxpYyBkaXNwbGF5Tm90aWZpY2F0aW9uKFxuICAgICAgICB0aXRsZTogc3RyaW5nLFxuICAgICAgICBtc2c6IHN0cmluZyxcbiAgICAgICAgYXZhdGFyVXJsOiBzdHJpbmcsXG4gICAgICAgIHJvb206IFJvb20sXG4gICAgICAgIGV2PzogTWF0cml4RXZlbnQsXG4gICAgKTogTm90aWZpY2F0aW9uIHtcbiAgICAgICAgY29uc3Qgbm90aWZCb2R5ID0ge1xuICAgICAgICAgICAgYm9keTogbXNnLFxuICAgICAgICAgICAgc2lsZW50OiB0cnVlLCAvLyB3ZSBwbGF5IG91ciBvd24gc291bmRzXG4gICAgICAgIH07XG4gICAgICAgIGlmIChhdmF0YXJVcmwpIG5vdGlmQm9keVsnaWNvbiddID0gYXZhdGFyVXJsO1xuICAgICAgICBjb25zdCBub3RpZmljYXRpb24gPSBuZXcgd2luZG93Lk5vdGlmaWNhdGlvbih0aXRsZSwgbm90aWZCb2R5KTtcblxuICAgICAgICBub3RpZmljYXRpb24ub25jbGljayA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBheWxvYWQ6IFZpZXdSb29tUGF5bG9hZCA9IHtcbiAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5WaWV3Um9vbSxcbiAgICAgICAgICAgICAgICByb29tX2lkOiByb29tLnJvb21JZCxcbiAgICAgICAgICAgICAgICBtZXRyaWNzVHJpZ2dlcjogXCJOb3RpZmljYXRpb25cIixcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmIChldi5nZXRUaHJlYWQoKSkge1xuICAgICAgICAgICAgICAgIHBheWxvYWQuZXZlbnRfaWQgPSBldi5nZXRJZCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2gocGF5bG9hZCk7XG4gICAgICAgICAgICB3aW5kb3cuZm9jdXMoKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gbm90aWZpY2F0aW9uO1xuICAgIH1cblxuICAgIHB1YmxpYyBsb3VkTm90aWZpY2F0aW9uKGV2OiBNYXRyaXhFdmVudCwgcm9vbTogUm9vbSk6IHZvaWQge31cblxuICAgIHB1YmxpYyBjbGVhck5vdGlmaWNhdGlvbihub3RpZjogTm90aWZpY2F0aW9uKTogdm9pZCB7XG4gICAgICAgIC8vIFNvbWUgYnJvd3NlcnMgZG9uJ3Qgc3VwcG9ydCB0aGlzLCBlLmcgU2FmYXJpIG9uIGlPU1xuICAgICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvTm90aWZpY2F0aW9uL2Nsb3NlXG4gICAgICAgIGlmIChub3RpZi5jbG9zZSkge1xuICAgICAgICAgICAgbm90aWYuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgcGxhdGZvcm0gcmVxdWlyZXMgVVJMIHByZXZpZXdzIGluIHRvb2x0aXBzLCBvdGhlcndpc2UgZmFsc2UuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHdoZXRoZXIgdGhlIHBsYXRmb3JtIHJlcXVpcmVzIFVSTCBwcmV2aWV3cyBpbiB0b29sdGlwc1xuICAgICAqL1xuICAgIHB1YmxpYyBuZWVkc1VybFRvb2x0aXBzKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIGN1cnJlbnQgdmVyc2lvbiBvZiB0aGUgYXBwbGljYXRpb24uXG4gICAgICovXG4gICAgcHVibGljIGFic3RyYWN0IGdldEFwcFZlcnNpb24oKTogUHJvbWlzZTxzdHJpbmc+O1xuXG4gICAgLyoqXG4gICAgICogUmVzdGFydHMgdGhlIGFwcGxpY2F0aW9uLCB3aXRob3V0IG5lY2Vzc2FyaWx5IHJlbG9hZGluZ1xuICAgICAqIGFueSBhcHBsaWNhdGlvbiBjb2RlXG4gICAgICovXG4gICAgcHVibGljIGFic3RyYWN0IHJlbG9hZCgpOiB2b2lkO1xuXG4gICAgcHVibGljIHN1cHBvcnRzU2V0dGluZyhzZXR0aW5nTmFtZT86IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFNldHRpbmdWYWx1ZShzZXR0aW5nTmFtZTogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0U2V0dGluZ1ZhbHVlKHNldHRpbmdOYW1lOiBzdHJpbmcsIHZhbHVlOiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5pbXBsZW1lbnRlZFwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgb3VyIHBsYXRmb3JtIHNwZWNpZmljIEV2ZW50SW5kZXhNYW5hZ2VyLlxuICAgICAqXG4gICAgICogQHJldHVybiB7QmFzZUV2ZW50SW5kZXhNYW5hZ2VyfSBUaGUgRXZlbnRJbmRleCBtYW5hZ2VyIGZvciBvdXIgcGxhdGZvcm0sXG4gICAgICogY2FuIGJlIG51bGwgaWYgdGhlIHBsYXRmb3JtIGRvZXNuJ3Qgc3VwcG9ydCBldmVudCBpbmRleGluZy5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0RXZlbnRJbmRleGluZ01hbmFnZXIoKTogQmFzZUV2ZW50SW5kZXhNYW5hZ2VyIHwgbnVsbCB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRMYW5ndWFnZShwcmVmZXJyZWRMYW5nczogc3RyaW5nW10pIHt9XG5cbiAgICBwdWJsaWMgc2V0U3BlbGxDaGVja0VuYWJsZWQoZW5hYmxlZDogYm9vbGVhbik6IHZvaWQge31cblxuICAgIHB1YmxpYyBhc3luYyBnZXRTcGVsbENoZWNrRW5hYmxlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcHVibGljIHNldFNwZWxsQ2hlY2tMYW5ndWFnZXMocHJlZmVycmVkTGFuZ3M6IHN0cmluZ1tdKSB7fVxuXG4gICAgcHVibGljIGdldFNwZWxsQ2hlY2tMYW5ndWFnZXMoKTogUHJvbWlzZTxzdHJpbmdbXT4gfCBudWxsIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGdldERlc2t0b3BDYXB0dXJlclNvdXJjZXMob3B0aW9uczogR2V0U291cmNlc09wdGlvbnMpOiBQcm9taXNlPEFycmF5PERlc2t0b3BDYXB0dXJlclNvdXJjZT4+IHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdXBwb3J0c0Rlc2t0b3BDYXB0dXJlcigpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdXBwb3J0c0ppdHNpU2NyZWVuc2hhcmluZygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcHVibGljIG92ZXJyaWRlQnJvd3NlclNob3J0Y3V0cygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBuYXZpZ2F0ZUZvcndhcmRCYWNrKGJhY2s6IGJvb2xlYW4pOiB2b2lkIHt9XG5cbiAgICBwdWJsaWMgZ2V0QXZhaWxhYmxlU3BlbGxDaGVja0xhbmd1YWdlcygpOiBQcm9taXNlPHN0cmluZ1tdPiB8IG51bGwge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0U1NPQ2FsbGJhY2tVcmwoZnJhZ21lbnRBZnRlckxvZ2luOiBzdHJpbmcpOiBVUkwge1xuICAgICAgICBjb25zdCB1cmwgPSBuZXcgVVJMKHdpbmRvdy5sb2NhdGlvbi5ocmVmKTtcbiAgICAgICAgdXJsLmhhc2ggPSBmcmFnbWVudEFmdGVyTG9naW4gfHwgXCJcIjtcbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBCZWdpbiBTaW5nbGUgU2lnbiBPbiBmbG93cy5cbiAgICAgKiBAcGFyYW0ge01hdHJpeENsaWVudH0gbXhDbGllbnQgdGhlIG1hdHJpeCBjbGllbnQgdXNpbmcgd2hpY2ggd2Ugc2hvdWxkIHN0YXJ0IHRoZSBmbG93XG4gICAgICogQHBhcmFtIHtcInNzb1wifFwiY2FzXCJ9IGxvZ2luVHlwZSB0aGUgdHlwZSBvZiBTU08gaXQgaXMsIENBUy9TU08uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGZyYWdtZW50QWZ0ZXJMb2dpbiB0aGUgaGFzaCB0byBwYXNzIHRvIHRoZSBhcHAgZHVyaW5nIHNzbyBjYWxsYmFjay5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gaWRwSWQgVGhlIElEIG9mIHRoZSBJZGVudGl0eSBQcm92aWRlciBiZWluZyB0YXJnZXRlZCwgb3B0aW9uYWwuXG4gICAgICovXG4gICAgcHVibGljIHN0YXJ0U2luZ2xlU2lnbk9uKFxuICAgICAgICBteENsaWVudDogTWF0cml4Q2xpZW50LFxuICAgICAgICBsb2dpblR5cGU6IFwic3NvXCIgfCBcImNhc1wiLFxuICAgICAgICBmcmFnbWVudEFmdGVyTG9naW46IHN0cmluZyxcbiAgICAgICAgaWRwSWQ/OiBzdHJpbmcsXG4gICAgKTogdm9pZCB7XG4gICAgICAgIC8vIHBlcnNpc3QgaHMgdXJsIGFuZCBpcyB1cmwgZm9yIHdoZW4gdGhlIHVzZXIgaXMgcmV0dXJuZWQgdG8gdGhlIGFwcCB3aXRoIHRoZSBsb2dpbiB0b2tlblxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShTU09fSE9NRVNFUlZFUl9VUkxfS0VZLCBteENsaWVudC5nZXRIb21lc2VydmVyVXJsKCkpO1xuICAgICAgICBpZiAobXhDbGllbnQuZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwoKSkge1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oU1NPX0lEX1NFUlZFUl9VUkxfS0VZLCBteENsaWVudC5nZXRJZGVudGl0eVNlcnZlclVybCgpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaWRwSWQpIHtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFNTT19JRFBfSURfS0VZLCBpZHBJZCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2FsbGJhY2tVcmwgPSB0aGlzLmdldFNTT0NhbGxiYWNrVXJsKGZyYWdtZW50QWZ0ZXJMb2dpbik7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gbXhDbGllbnQuZ2V0U3NvTG9naW5VcmwoY2FsbGJhY2tVcmwudG9TdHJpbmcoKSwgbG9naW5UeXBlLCBpZHBJZCk7IC8vIHJlZGlyZWN0IHRvIFNTT1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhIHByZXZpb3VzbHkgc3RvcmVkIHBpY2tsZSBrZXkuICBUaGUgcGlja2xlIGtleSBpcyB1c2VkIGZvclxuICAgICAqIGVuY3J5cHRpbmcgbGlib2xtIG9iamVjdHMuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVzZXJJZCB0aGUgdXNlciBJRCBmb3IgdGhlIHVzZXIgdGhhdCB0aGUgcGlja2xlIGtleSBpcyBmb3IuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHVzZXJJZCB0aGUgZGV2aWNlIElEIHRoYXQgdGhlIHBpY2tsZSBrZXkgaXMgZm9yLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd8bnVsbH0gdGhlIHByZXZpb3VzbHkgc3RvcmVkIHBpY2tsZSBrZXksIG9yIG51bGwgaWYgbm9cbiAgICAgKiAgICAgcGlja2xlIGtleSBoYXMgYmVlbiBzdG9yZWQuXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIGdldFBpY2tsZUtleSh1c2VySWQ6IHN0cmluZywgZGV2aWNlSWQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICAgICAgICBpZiAoIXdpbmRvdy5jcnlwdG8gfHwgIXdpbmRvdy5jcnlwdG8uc3VidGxlKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZGF0YTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGRhdGEgPSBhd2FpdCBpZGJMb2FkKFwicGlja2xlS2V5XCIsIFt1c2VySWQsIGRldmljZUlkXSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcImlkYkxvYWQgZm9yIHBpY2tsZUtleSBmYWlsZWRcIiwgZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFkYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWRhdGEuZW5jcnlwdGVkIHx8ICFkYXRhLml2IHx8ICFkYXRhLmNyeXB0b0tleSkge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiQmFkbHkgZm9ybWF0dGVkIHBpY2tsZSBrZXlcIik7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGFkZGl0aW9uYWxEYXRhID0gbmV3IFVpbnQ4QXJyYXkodXNlcklkLmxlbmd0aCArIGRldmljZUlkLmxlbmd0aCArIDEpO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHVzZXJJZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYWRkaXRpb25hbERhdGFbaV0gPSB1c2VySWQuY2hhckNvZGVBdChpKTtcbiAgICAgICAgfVxuICAgICAgICBhZGRpdGlvbmFsRGF0YVt1c2VySWQubGVuZ3RoXSA9IDEyNDsgLy8gXCJ8XCJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkZXZpY2VJZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYWRkaXRpb25hbERhdGFbdXNlcklkLmxlbmd0aCArIDEgKyBpXSA9IGRldmljZUlkLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5kZWNyeXB0KFxuICAgICAgICAgICAgICAgIHsgbmFtZTogXCJBRVMtR0NNXCIsIGl2OiBkYXRhLml2LCBhZGRpdGlvbmFsRGF0YSB9LCBkYXRhLmNyeXB0b0tleSxcbiAgICAgICAgICAgICAgICBkYXRhLmVuY3J5cHRlZCxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm4gZW5jb2RlVW5wYWRkZWRCYXNlNjQoa2V5KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiRXJyb3IgZGVjcnlwdGluZyBwaWNrbGUga2V5XCIpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYW5kIHN0b3JlIGEgcGlja2xlIGtleSBmb3IgZW5jcnlwdGluZyBsaWJvbG0gb2JqZWN0cy5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXNlcklkIHRoZSB1c2VyIElEIGZvciB0aGUgdXNlciB0aGF0IHRoZSBwaWNrbGUga2V5IGlzIGZvci5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gZGV2aWNlSWQgdGhlIGRldmljZSBJRCB0aGF0IHRoZSBwaWNrbGUga2V5IGlzIGZvci5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfG51bGx9IHRoZSBwaWNrbGUga2V5LCBvciBudWxsIGlmIHRoZSBwbGF0Zm9ybSBkb2VzIG5vdFxuICAgICAqICAgICBzdXBwb3J0IHN0b3JpbmcgcGlja2xlIGtleXMuXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIGNyZWF0ZVBpY2tsZUtleSh1c2VySWQ6IHN0cmluZywgZGV2aWNlSWQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xuICAgICAgICBpZiAoIXdpbmRvdy5jcnlwdG8gfHwgIXdpbmRvdy5jcnlwdG8uc3VidGxlKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjcnlwdG8gPSB3aW5kb3cuY3J5cHRvO1xuICAgICAgICBjb25zdCByYW5kb21BcnJheSA9IG5ldyBVaW50OEFycmF5KDMyKTtcbiAgICAgICAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhyYW5kb21BcnJheSk7XG4gICAgICAgIGNvbnN0IGNyeXB0b0tleSA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZ2VuZXJhdGVLZXkoXG4gICAgICAgICAgICB7IG5hbWU6IFwiQUVTLUdDTVwiLCBsZW5ndGg6IDI1NiB9LCBmYWxzZSwgW1wiZW5jcnlwdFwiLCBcImRlY3J5cHRcIl0sXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGl2ID0gbmV3IFVpbnQ4QXJyYXkoMzIpO1xuICAgICAgICBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKGl2KTtcblxuICAgICAgICBjb25zdCBhZGRpdGlvbmFsRGF0YSA9IG5ldyBVaW50OEFycmF5KHVzZXJJZC5sZW5ndGggKyBkZXZpY2VJZC5sZW5ndGggKyAxKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB1c2VySWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFkZGl0aW9uYWxEYXRhW2ldID0gdXNlcklkLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIH1cbiAgICAgICAgYWRkaXRpb25hbERhdGFbdXNlcklkLmxlbmd0aF0gPSAxMjQ7IC8vIFwifFwiXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGV2aWNlSWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFkZGl0aW9uYWxEYXRhW3VzZXJJZC5sZW5ndGggKyAxICsgaV0gPSBkZXZpY2VJZC5jaGFyQ29kZUF0KGkpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZW5jcnlwdGVkID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxuICAgICAgICAgICAgeyBuYW1lOiBcIkFFUy1HQ01cIiwgaXYsIGFkZGl0aW9uYWxEYXRhIH0sIGNyeXB0b0tleSwgcmFuZG9tQXJyYXksXG4gICAgICAgICk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGlkYlNhdmUoXCJwaWNrbGVLZXlcIiwgW3VzZXJJZCwgZGV2aWNlSWRdLCB7IGVuY3J5cHRlZCwgaXYsIGNyeXB0b0tleSB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVuY29kZVVucGFkZGVkQmFzZTY0KHJhbmRvbUFycmF5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZWxldGUgYSBwcmV2aW91c2x5IHN0b3JlZCBwaWNrbGUga2V5IGZyb20gc3RvcmFnZS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXNlcklkIHRoZSB1c2VyIElEIGZvciB0aGUgdXNlciB0aGF0IHRoZSBwaWNrbGUga2V5IGlzIGZvci5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXNlcklkIHRoZSBkZXZpY2UgSUQgdGhhdCB0aGUgcGlja2xlIGtleSBpcyBmb3IuXG4gICAgICovXG4gICAgcHVibGljIGFzeW5jIGRlc3Ryb3lQaWNrbGVLZXkodXNlcklkOiBzdHJpbmcsIGRldmljZUlkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGlkYkRlbGV0ZShcInBpY2tsZUtleVwiLCBbdXNlcklkLCBkZXZpY2VJZF0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJpZGJEZWxldGUgZmFpbGVkIGluIGRlc3Ryb3lQaWNrbGVLZXlcIiwgZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOztBQUlBOztBQUlBOztBQUNBOztBQUNBOztBQUNBOztBQWhDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFtQk8sTUFBTUEsc0JBQXNCLEdBQUcsZUFBL0I7O0FBQ0EsTUFBTUMscUJBQXFCLEdBQUcsZUFBOUI7O0FBQ0EsTUFBTUMsY0FBYyxHQUFHLGVBQXZCOztJQUVLQyxpQjs7O1dBQUFBLGlCO0VBQUFBLGlCO0VBQUFBLGlCO0VBQUFBLGlCO0VBQUFBLGlCO0VBQUFBLGlCO0dBQUFBLGlCLGlDQUFBQSxpQjs7QUFtQlosTUFBTUMsZ0JBQWdCLEdBQUcsaUJBQXpCO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUNlLE1BQWVDLFlBQWYsQ0FBNEI7RUFJdkNDLFdBQVcsR0FBRztJQUFBLHlEQUhnQixDQUdoQjtJQUFBLHFEQUZZLEtBRVo7SUFBQSxnREFTUUMsT0FBRCxJQUFrQztNQUNuRCxRQUFRQSxP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