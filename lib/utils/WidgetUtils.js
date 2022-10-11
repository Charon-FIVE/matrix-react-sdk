"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var url = _interopRequireWildcard(require("url"));

var _rfc = require("rfc4648");

var _logger = require("matrix-js-sdk/src/logger");

var _matrix = require("matrix-js-sdk/src/matrix");

var _call = require("matrix-js-sdk/src/webrtc/call");

var _randomstring = require("matrix-js-sdk/src/randomstring");

var _MatrixClientPeg = require("../MatrixClientPeg");

var _PlatformPeg = _interopRequireDefault(require("../PlatformPeg"));

var _SdkConfig = _interopRequireDefault(require("../SdkConfig"));

var _dispatcher = _interopRequireDefault(require("../dispatcher/dispatcher"));

var _WidgetEchoStore = _interopRequireDefault(require("../stores/WidgetEchoStore"));

var _IntegrationManagers = require("../integrations/IntegrationManagers");

var _WidgetType = require("../widgets/WidgetType");

var _Jitsi = require("../widgets/Jitsi");

var _objects = require("./objects");

var _languageHandler = require("../languageHandler");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2019 Travis Ralston
Copyright 2017 - 2020 The Matrix.org Foundation C.I.C.

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
// How long we wait for the state event echo to come back from the server
// before waitFor[Room/User]Widget rejects its promise
const WIDGET_WAIT_TIME = 20000;

class WidgetUtils {
  /* Returns true if user is able to send state events to modify widgets in this room
   * (Does not apply to non-room-based / user widgets)
   * @param roomId -- The ID of the room to check
   * @return Boolean -- true if the user can modify widgets in this room
   * @throws Error -- specifies the error reason
   */
  static canUserModifyWidgets(roomId) {
    if (!roomId) {
      _logger.logger.warn('No room ID specified');

      return false;
    }

    const client = _MatrixClientPeg.MatrixClientPeg.get();

    if (!client) {
      _logger.logger.warn('User must be be logged in');

      return false;
    }

    const room = client.getRoom(roomId);

    if (!room) {
      _logger.logger.warn(`Room ID ${roomId} is not recognised`);

      return false;
    }

    const me = client.credentials.userId;

    if (!me) {
      _logger.logger.warn('Failed to get user ID');

      return false;
    }

    if (room.getMyMembership() !== "join") {
      _logger.logger.warn(`User ${me} is not in room ${roomId}`);

      return false;
    } // TODO: Enable support for m.widget event type (https://github.com/vector-im/element-web/issues/13111)


    return room.currentState.maySendStateEvent('im.vector.modular.widgets', me);
  } // TODO: Generify the name of this function. It's not just scalar.

  /**
   * Returns true if specified url is a scalar URL, typically https://scalar.vector.im/api
   * @param  {[type]}  testUrlString URL to check
   * @return {Boolean} True if specified URL is a scalar URL
   */


  static isScalarUrl(testUrlString) {
    if (!testUrlString) {
      _logger.logger.error('Scalar URL check failed. No URL specified');

      return false;
    }

    const testUrl = url.parse(testUrlString);

    let scalarUrls = _SdkConfig.default.get().integrations_widgets_urls;

    if (!scalarUrls || scalarUrls.length === 0) {
      const defaultManager = _IntegrationManagers.IntegrationManagers.sharedInstance().getPrimaryManager();

      if (defaultManager) {
        scalarUrls = [defaultManager.apiUrl];
      } else {
        scalarUrls = [];
      }
    }

    for (let i = 0; i < scalarUrls.length; i++) {
      const scalarUrl = url.parse(scalarUrls[i]);

      if (testUrl && scalarUrl) {
        if (testUrl.protocol === scalarUrl.protocol && testUrl.host === scalarUrl.host && testUrl.pathname.startsWith(scalarUrl.pathname)) {
          return true;
        }
      }
    }

    return false;
  }
  /**
   * Returns a promise that resolves when a widget with the given
   * ID has been added as a user widget (ie. the accountData event
   * arrives) or rejects after a timeout
   *
   * @param {string} widgetId The ID of the widget to wait for
   * @param {boolean} add True to wait for the widget to be added,
   *     false to wait for it to be deleted.
   * @returns {Promise} that resolves when the widget is in the
   *     requested state according to the `add` param
   */


  static waitForUserWidget(widgetId, add) {
    return new Promise((resolve, reject) => {
      // Tests an account data event, returning true if it's in the state
      // we're waiting for it to be in
      function eventInIntendedState(ev) {
        if (!ev || !ev.getContent()) return false;

        if (add) {
          return ev.getContent()[widgetId] !== undefined;
        } else {
          return ev.getContent()[widgetId] === undefined;
        }
      }

      const startingAccountDataEvent = _MatrixClientPeg.MatrixClientPeg.get().getAccountData('m.widgets');

      if (eventInIntendedState(startingAccountDataEvent)) {
        resolve();
        return;
      }

      function onAccountData(ev) {
        const currentAccountDataEvent = _MatrixClientPeg.MatrixClientPeg.get().getAccountData('m.widgets');

        if (eventInIntendedState(currentAccountDataEvent)) {
          _MatrixClientPeg.MatrixClientPeg.get().removeListener(_matrix.ClientEvent.AccountData, onAccountData);

          clearTimeout(timerId);
          resolve();
        }
      }

      const timerId = setTimeout(() => {
        _MatrixClientPeg.MatrixClientPeg.get().removeListener(_matrix.ClientEvent.AccountData, onAccountData);

        reject(new Error("Timed out waiting for widget ID " + widgetId + " to appear"));
      }, WIDGET_WAIT_TIME);

      _MatrixClientPeg.MatrixClientPeg.get().on(_matrix.ClientEvent.AccountData, onAccountData);
    });
  }
  /**
   * Returns a promise that resolves when a widget with the given
   * ID has been added as a room widget in the given room (ie. the
   * room state event arrives) or rejects after a timeout
   *
   * @param {string} widgetId The ID of the widget to wait for
   * @param {string} roomId The ID of the room to wait for the widget in
   * @param {boolean} add True to wait for the widget to be added,
   *     false to wait for it to be deleted.
   * @returns {Promise} that resolves when the widget is in the
   *     requested state according to the `add` param
   */


  static waitForRoomWidget(widgetId, roomId, add) {
    return new Promise((resolve, reject) => {
      // Tests a list of state events, returning true if it's in the state
      // we're waiting for it to be in
      function eventsInIntendedState(evList) {
        const widgetPresent = evList.some(ev => {
          return ev.getContent() && ev.getContent()['id'] === widgetId;
        });

        if (add) {
          return widgetPresent;
        } else {
          return !widgetPresent;
        }
      }

      const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(roomId); // TODO: Enable support for m.widget event type (https://github.com/vector-im/element-web/issues/13111)


      const startingWidgetEvents = room.currentState.getStateEvents('im.vector.modular.widgets');

      if (eventsInIntendedState(startingWidgetEvents)) {
        resolve();
        return;
      }

      function onRoomStateEvents(ev) {
        if (ev.getRoomId() !== roomId || ev.getType() !== "im.vector.modular.widgets") return; // TODO: Enable support for m.widget event type (https://github.com/vector-im/element-web/issues/13111)

        const currentWidgetEvents = room.currentState.getStateEvents('im.vector.modular.widgets');

        if (eventsInIntendedState(currentWidgetEvents)) {
          _MatrixClientPeg.MatrixClientPeg.get().removeListener(_matrix.RoomStateEvent.Events, onRoomStateEvents);

          clearTimeout(timerId);
          resolve();
        }
      }

      const timerId = setTimeout(() => {
        _MatrixClientPeg.MatrixClientPeg.get().removeListener(_matrix.RoomStateEvent.Events, onRoomStateEvents);

        reject(new Error("Timed out waiting for widget ID " + widgetId + " to appear"));
      }, WIDGET_WAIT_TIME);

      _MatrixClientPeg.MatrixClientPeg.get().on(_matrix.RoomStateEvent.Events, onRoomStateEvents);
    });
  }

  static setUserWidget(widgetId, widgetType, widgetUrl, widgetName, widgetData) {
    const content = {
      type: widgetType.preferred,
      url: widgetUrl,
      name: widgetName,
      data: widgetData
    };

    const client = _MatrixClientPeg.MatrixClientPeg.get(); // Get the current widgets and clone them before we modify them, otherwise
    // we'll modify the content of the old event.


    const userWidgets = (0, _objects.objectClone)(WidgetUtils.getUserWidgets()); // Delete existing widget with ID

    try {
      delete userWidgets[widgetId];
    } catch (e) {
      _logger.logger.error(`$widgetId is non-configurable`);
    }

    const addingWidget = Boolean(widgetUrl); // Add new widget / update

    if (addingWidget) {
      userWidgets[widgetId] = {
        content: content,
        sender: client.getUserId(),
        state_key: widgetId,
        type: 'm.widget',
        id: widgetId
      };
    } // This starts listening for when the echo comes back from the server
    // since the widget won't appear added until this happens. If we don't
    // wait for this, the action will complete but if the user is fast enough,
    // the widget still won't actually be there.


    return client.setAccountData('m.widgets', userWidgets).then(() => {
      return WidgetUtils.waitForUserWidget(widgetId, addingWidget);
    }).then(() => {
      _dispatcher.default.dispatch({
        action: "user_widget_updated"
      });
    });
  }

  static setRoomWidget(roomId, widgetId, widgetType, widgetUrl, widgetName, widgetData, widgetAvatarUrl) {
    let content;
    const addingWidget = Boolean(widgetUrl);

    if (addingWidget) {
      content = {
        // TODO: Enable support for m.widget event type (https://github.com/vector-im/element-web/issues/13111)
        // For now we'll send the legacy event type for compatibility with older apps/elements
        type: widgetType.legacy,
        url: widgetUrl,
        name: widgetName,
        data: widgetData,
        avatar_url: widgetAvatarUrl
      };
    } else {
      content = {};
    }

    return WidgetUtils.setRoomWidgetContent(roomId, widgetId, content);
  }

  static setRoomWidgetContent(roomId, widgetId, content) {
    const addingWidget = !!content.url;

    _WidgetEchoStore.default.setRoomWidgetEcho(roomId, widgetId, content);

    const client = _MatrixClientPeg.MatrixClientPeg.get(); // TODO: Enable support for m.widget event type (https://github.com/vector-im/element-web/issues/13111)


    return client.sendStateEvent(roomId, "im.vector.modular.widgets", content, widgetId).then(() => {
      return WidgetUtils.waitForRoomWidget(widgetId, roomId, addingWidget);
    }).finally(() => {
      _WidgetEchoStore.default.removeRoomWidgetEcho(roomId, widgetId);
    });
  }
  /**
   * Get room specific widgets
   * @param  {Room} room The room to get widgets force
   * @return {[object]} Array containing current / active room widgets
   */


  static getRoomWidgets(room) {
    // TODO: Enable support for m.widget event type (https://github.com/vector-im/element-web/issues/13111)
    const appsStateEvents = room.currentState.getStateEvents('im.vector.modular.widgets');

    if (!appsStateEvents) {
      return [];
    }

    return appsStateEvents.filter(ev => {
      return ev.getContent().type && ev.getContent().url;
    });
  }
  /**
   * Get user specific widgets (not linked to a specific room)
   * @return {object} Event content object containing current / active user widgets
   */


  static getUserWidgets() {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    if (!client) {
      throw new Error('User not logged in');
    }

    const userWidgets = client.getAccountData('m.widgets');

    if (userWidgets && userWidgets.getContent()) {
      return userWidgets.getContent();
    }

    return {};
  }
  /**
   * Get user specific widgets (not linked to a specific room) as an array
   * @return {[object]} Array containing current / active user widgets
   */


  static getUserWidgetsArray() {
    return Object.values(WidgetUtils.getUserWidgets());
  }
  /**
   * Get active stickerpicker widgets (stickerpickers are user widgets by nature)
   * @return {[object]} Array containing current / active stickerpicker widgets
   */


  static getStickerpickerWidgets() {
    const widgets = WidgetUtils.getUserWidgetsArray();
    return widgets.filter(widget => widget.content && widget.content.type === "m.stickerpicker");
  }
  /**
   * Get all integration manager widgets for this user.
   * @returns {Object[]} An array of integration manager user widgets.
   */


  static getIntegrationManagerWidgets() {
    const widgets = WidgetUtils.getUserWidgetsArray();
    return widgets.filter(w => w.content && w.content.type === "m.integration_manager");
  }

  static getRoomWidgetsOfType(room, type) {
    const widgets = WidgetUtils.getRoomWidgets(room) || [];
    return widgets.filter(w => {
      const content = w.getContent();
      return content.url && type.matches(content.type);
    });
  }

  static async removeIntegrationManagerWidgets() {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    if (!client) {
      throw new Error('User not logged in');
    }

    const widgets = client.getAccountData('m.widgets');
    if (!widgets) return;
    const userWidgets = widgets.getContent() || {};
    Object.entries(userWidgets).forEach(_ref => {
      let [key, widget] = _ref;

      if (widget.content && widget.content.type === "m.integration_manager") {
        delete userWidgets[key];
      }
    });
    await client.setAccountData('m.widgets', userWidgets);
  }

  static addIntegrationManagerWidget(name, uiUrl, apiUrl) {
    return WidgetUtils.setUserWidget("integration_manager_" + new Date().getTime(), _WidgetType.WidgetType.INTEGRATION_MANAGER, uiUrl, "Integration manager: " + name, {
      "api_url": apiUrl
    });
  }
  /**
   * Remove all stickerpicker widgets (stickerpickers are user widgets by nature)
   * @return {Promise} Resolves on account data updated
   */


  static async removeStickerpickerWidgets() {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    if (!client) {
      throw new Error('User not logged in');
    }

    const widgets = client.getAccountData('m.widgets');
    if (!widgets) return;
    const userWidgets = widgets.getContent() || {};
    Object.entries(userWidgets).forEach(_ref2 => {
      let [key, widget] = _ref2;

      if (widget.content && widget.content.type === 'm.stickerpicker') {
        delete userWidgets[key];
      }
    });
    await client.setAccountData('m.widgets', userWidgets);
  }

  static async addJitsiWidget(roomId, type, name, isVideoChannel, oobRoomName) {
    const domain = _Jitsi.Jitsi.getInstance().preferredDomain;

    const auth = await _Jitsi.Jitsi.getInstance().getJitsiAuth();
    const widgetId = (0, _randomstring.randomString)(24); // Must be globally unique

    let confId;

    if (auth === 'openidtoken-jwt') {
      // Create conference ID from room ID
      // For compatibility with Jitsi, use base32 without padding.
      // More details here:
      // https://github.com/matrix-org/prosody-mod-auth-matrix-user-verification
      confId = _rfc.base32.stringify(Buffer.from(roomId), {
        pad: false
      });
    } else {
      // Create a random conference ID
      confId = `Jitsi${(0, _randomstring.randomUppercaseString)(1)}${(0, _randomstring.randomLowercaseString)(23)}`;
    } // TODO: Remove URL hacks when the mobile clients eventually support v2 widgets


    const widgetUrl = new URL(WidgetUtils.getLocalJitsiWrapperUrl({
      auth
    }));
    widgetUrl.search = ''; // Causes the URL class use searchParams instead

    widgetUrl.searchParams.set('confId', confId);
    await WidgetUtils.setRoomWidget(roomId, widgetId, _WidgetType.WidgetType.JITSI, widgetUrl.toString(), name, {
      conferenceId: confId,
      roomName: oobRoomName ?? _MatrixClientPeg.MatrixClientPeg.get().getRoom(roomId)?.name,
      isAudioOnly: type === _call.CallType.Voice,
      isVideoChannel,
      domain,
      auth
    });
  }

  static makeAppConfig(appId, app, senderUserId, roomId, eventId) {
    if (!senderUserId) {
      throw new Error("Widgets must be created by someone - provide a senderUserId");
    }

    app.creatorUserId = senderUserId;
    app.id = appId;
    app.roomId = roomId;
    app.eventId = eventId;
    app.name = app.name || app.type;
    return app;
  }

  static getLocalJitsiWrapperUrl() {
    let opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    // NB. we can't just encodeURIComponent all of these because the $ signs need to be there
    const queryStringParts = ['conferenceDomain=$domain', 'conferenceId=$conferenceId', 'isAudioOnly=$isAudioOnly', 'isVideoChannel=$isVideoChannel', 'displayName=$matrix_display_name', 'avatarUrl=$matrix_avatar_url', 'userId=$matrix_user_id', 'roomId=$matrix_room_id', 'theme=$theme', 'roomName=$roomName', `supportsScreensharing=${_PlatformPeg.default.get().supportsJitsiScreensharing()}`];

    if (opts.auth) {
      queryStringParts.push(`auth=${opts.auth}`);
    }

    const queryString = queryStringParts.join('&');
    let baseUrl = window.location.href;

    if (window.location.protocol !== "https:" && !opts.forLocalRender) {
      // Use an external wrapper if we're not locally rendering the widget. This is usually
      // the URL that will end up in the widget event, so we want to make sure it's relatively
      // safe to send.
      // We'll end up using a local render URL when we see a Jitsi widget anyways, so this is
      // really just for backwards compatibility and to appease the spec.
      baseUrl = "https://app.element.io/";
    }

    const url = new URL("jitsi.html#" + queryString, baseUrl); // this strips hash fragment from baseUrl

    return url.href;
  }

  static getWidgetName(app) {
    return app?.name?.trim() || (0, _languageHandler._t)("Unknown App");
  }

  static getWidgetDataTitle(app) {
    return app?.data?.title?.trim() || "";
  }

  static getWidgetUid(app) {
    return app ? WidgetUtils.calcWidgetUid(app.id, app.roomId) : "";
  }

  static calcWidgetUid(widgetId, roomId) {
    return roomId ? `room_${roomId}_${widgetId}` : `user_${widgetId}`;
  }

  static editWidget(room, app) {
    // noinspection JSIgnoredPromiseFromCall
    _IntegrationManagers.IntegrationManagers.sharedInstance().getPrimaryManager().open(room, 'type_' + app.type, app.id);
  }

  static isManagedByManager(app) {
    if (WidgetUtils.isScalarUrl(app.url)) {
      const managers = _IntegrationManagers.IntegrationManagers.sharedInstance();

      if (managers.hasManager()) {
        // TODO: Pick the right manager for the widget
        const defaultManager = managers.getPrimaryManager();
        return WidgetUtils.isScalarUrl(defaultManager.apiUrl);
      }
    }

    return false;
  }

}

exports.default = WidgetUtils;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJXSURHRVRfV0FJVF9USU1FIiwiV2lkZ2V0VXRpbHMiLCJjYW5Vc2VyTW9kaWZ5V2lkZ2V0cyIsInJvb21JZCIsImxvZ2dlciIsIndhcm4iLCJjbGllbnQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJyb29tIiwiZ2V0Um9vbSIsIm1lIiwiY3JlZGVudGlhbHMiLCJ1c2VySWQiLCJnZXRNeU1lbWJlcnNoaXAiLCJjdXJyZW50U3RhdGUiLCJtYXlTZW5kU3RhdGVFdmVudCIsImlzU2NhbGFyVXJsIiwidGVzdFVybFN0cmluZyIsImVycm9yIiwidGVzdFVybCIsInVybCIsInBhcnNlIiwic2NhbGFyVXJscyIsIlNka0NvbmZpZyIsImludGVncmF0aW9uc193aWRnZXRzX3VybHMiLCJsZW5ndGgiLCJkZWZhdWx0TWFuYWdlciIsIkludGVncmF0aW9uTWFuYWdlcnMiLCJzaGFyZWRJbnN0YW5jZSIsImdldFByaW1hcnlNYW5hZ2VyIiwiYXBpVXJsIiwiaSIsInNjYWxhclVybCIsInByb3RvY29sIiwiaG9zdCIsInBhdGhuYW1lIiwic3RhcnRzV2l0aCIsIndhaXRGb3JVc2VyV2lkZ2V0Iiwid2lkZ2V0SWQiLCJhZGQiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImV2ZW50SW5JbnRlbmRlZFN0YXRlIiwiZXYiLCJnZXRDb250ZW50IiwidW5kZWZpbmVkIiwic3RhcnRpbmdBY2NvdW50RGF0YUV2ZW50IiwiZ2V0QWNjb3VudERhdGEiLCJvbkFjY291bnREYXRhIiwiY3VycmVudEFjY291bnREYXRhRXZlbnQiLCJyZW1vdmVMaXN0ZW5lciIsIkNsaWVudEV2ZW50IiwiQWNjb3VudERhdGEiLCJjbGVhclRpbWVvdXQiLCJ0aW1lcklkIiwic2V0VGltZW91dCIsIkVycm9yIiwib24iLCJ3YWl0Rm9yUm9vbVdpZGdldCIsImV2ZW50c0luSW50ZW5kZWRTdGF0ZSIsImV2TGlzdCIsIndpZGdldFByZXNlbnQiLCJzb21lIiwic3RhcnRpbmdXaWRnZXRFdmVudHMiLCJnZXRTdGF0ZUV2ZW50cyIsIm9uUm9vbVN0YXRlRXZlbnRzIiwiZ2V0Um9vbUlkIiwiZ2V0VHlwZSIsImN1cnJlbnRXaWRnZXRFdmVudHMiLCJSb29tU3RhdGVFdmVudCIsIkV2ZW50cyIsInNldFVzZXJXaWRnZXQiLCJ3aWRnZXRUeXBlIiwid2lkZ2V0VXJsIiwid2lkZ2V0TmFtZSIsIndpZGdldERhdGEiLCJjb250ZW50IiwidHlwZSIsInByZWZlcnJlZCIsIm5hbWUiLCJkYXRhIiwidXNlcldpZGdldHMiLCJvYmplY3RDbG9uZSIsImdldFVzZXJXaWRnZXRzIiwiZSIsImFkZGluZ1dpZGdldCIsIkJvb2xlYW4iLCJzZW5kZXIiLCJnZXRVc2VySWQiLCJzdGF0ZV9rZXkiLCJpZCIsInNldEFjY291bnREYXRhIiwidGhlbiIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwic2V0Um9vbVdpZGdldCIsIndpZGdldEF2YXRhclVybCIsImxlZ2FjeSIsImF2YXRhcl91cmwiLCJzZXRSb29tV2lkZ2V0Q29udGVudCIsIldpZGdldEVjaG9TdG9yZSIsInNldFJvb21XaWRnZXRFY2hvIiwic2VuZFN0YXRlRXZlbnQiLCJmaW5hbGx5IiwicmVtb3ZlUm9vbVdpZGdldEVjaG8iLCJnZXRSb29tV2lkZ2V0cyIsImFwcHNTdGF0ZUV2ZW50cyIsImZpbHRlciIsImdldFVzZXJXaWRnZXRzQXJyYXkiLCJPYmplY3QiLCJ2YWx1ZXMiLCJnZXRTdGlja2VycGlja2VyV2lkZ2V0cyIsIndpZGdldHMiLCJ3aWRnZXQiLCJnZXRJbnRlZ3JhdGlvbk1hbmFnZXJXaWRnZXRzIiwidyIsImdldFJvb21XaWRnZXRzT2ZUeXBlIiwibWF0Y2hlcyIsInJlbW92ZUludGVncmF0aW9uTWFuYWdlcldpZGdldHMiLCJlbnRyaWVzIiwiZm9yRWFjaCIsImtleSIsImFkZEludGVncmF0aW9uTWFuYWdlcldpZGdldCIsInVpVXJsIiwiRGF0ZSIsImdldFRpbWUiLCJXaWRnZXRUeXBlIiwiSU5URUdSQVRJT05fTUFOQUdFUiIsInJlbW92ZVN0aWNrZXJwaWNrZXJXaWRnZXRzIiwiYWRkSml0c2lXaWRnZXQiLCJpc1ZpZGVvQ2hhbm5lbCIsIm9vYlJvb21OYW1lIiwiZG9tYWluIiwiSml0c2kiLCJnZXRJbnN0YW5jZSIsInByZWZlcnJlZERvbWFpbiIsImF1dGgiLCJnZXRKaXRzaUF1dGgiLCJyYW5kb21TdHJpbmciLCJjb25mSWQiLCJiYXNlMzIiLCJzdHJpbmdpZnkiLCJCdWZmZXIiLCJmcm9tIiwicGFkIiwicmFuZG9tVXBwZXJjYXNlU3RyaW5nIiwicmFuZG9tTG93ZXJjYXNlU3RyaW5nIiwiVVJMIiwiZ2V0TG9jYWxKaXRzaVdyYXBwZXJVcmwiLCJzZWFyY2giLCJzZWFyY2hQYXJhbXMiLCJzZXQiLCJKSVRTSSIsInRvU3RyaW5nIiwiY29uZmVyZW5jZUlkIiwicm9vbU5hbWUiLCJpc0F1ZGlvT25seSIsIkNhbGxUeXBlIiwiVm9pY2UiLCJtYWtlQXBwQ29uZmlnIiwiYXBwSWQiLCJhcHAiLCJzZW5kZXJVc2VySWQiLCJldmVudElkIiwiY3JlYXRvclVzZXJJZCIsIm9wdHMiLCJxdWVyeVN0cmluZ1BhcnRzIiwiUGxhdGZvcm1QZWciLCJzdXBwb3J0c0ppdHNpU2NyZWVuc2hhcmluZyIsInB1c2giLCJxdWVyeVN0cmluZyIsImpvaW4iLCJiYXNlVXJsIiwid2luZG93IiwibG9jYXRpb24iLCJocmVmIiwiZm9yTG9jYWxSZW5kZXIiLCJnZXRXaWRnZXROYW1lIiwidHJpbSIsIl90IiwiZ2V0V2lkZ2V0RGF0YVRpdGxlIiwidGl0bGUiLCJnZXRXaWRnZXRVaWQiLCJjYWxjV2lkZ2V0VWlkIiwiZWRpdFdpZGdldCIsIm9wZW4iLCJpc01hbmFnZWRCeU1hbmFnZXIiLCJtYW5hZ2VycyIsImhhc01hbmFnZXIiXSwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvV2lkZ2V0VXRpbHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IFRyYXZpcyBSYWxzdG9uXG5Db3B5cmlnaHQgMjAxNyAtIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgKiBhcyB1cmwgZnJvbSBcInVybFwiO1xuaW1wb3J0IHsgYmFzZTMyIH0gZnJvbSBcInJmYzQ2NDhcIjtcbmltcG9ydCB7IElXaWRnZXQsIElXaWRnZXREYXRhIH0gZnJvbSBcIm1hdHJpeC13aWRnZXQtYXBpXCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQgeyBNYXRyaXhFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnRcIjtcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcbmltcG9ydCB7IENsaWVudEV2ZW50LCBSb29tU3RhdGVFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tYXRyaXhcIjtcbmltcG9ydCB7IENhbGxUeXBlIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL3dlYnJ0Yy9jYWxsXCI7XG5pbXBvcnQgeyByYW5kb21TdHJpbmcsIHJhbmRvbUxvd2VyY2FzZVN0cmluZywgcmFuZG9tVXBwZXJjYXNlU3RyaW5nIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL3JhbmRvbXN0cmluZ1wiO1xuXG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tICcuLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IFBsYXRmb3JtUGVnIGZyb20gJy4uL1BsYXRmb3JtUGVnJztcbmltcG9ydCBTZGtDb25maWcgZnJvbSBcIi4uL1Nka0NvbmZpZ1wiO1xuaW1wb3J0IGRpcyBmcm9tICcuLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IFdpZGdldEVjaG9TdG9yZSBmcm9tICcuLi9zdG9yZXMvV2lkZ2V0RWNob1N0b3JlJztcbmltcG9ydCB7IEludGVncmF0aW9uTWFuYWdlcnMgfSBmcm9tIFwiLi4vaW50ZWdyYXRpb25zL0ludGVncmF0aW9uTWFuYWdlcnNcIjtcbmltcG9ydCB7IFdpZGdldFR5cGUgfSBmcm9tIFwiLi4vd2lkZ2V0cy9XaWRnZXRUeXBlXCI7XG5pbXBvcnQgeyBKaXRzaSB9IGZyb20gXCIuLi93aWRnZXRzL0ppdHNpXCI7XG5pbXBvcnQgeyBvYmplY3RDbG9uZSB9IGZyb20gXCIuL29iamVjdHNcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IHsgSUFwcCB9IGZyb20gXCIuLi9zdG9yZXMvV2lkZ2V0U3RvcmVcIjtcblxuLy8gSG93IGxvbmcgd2Ugd2FpdCBmb3IgdGhlIHN0YXRlIGV2ZW50IGVjaG8gdG8gY29tZSBiYWNrIGZyb20gdGhlIHNlcnZlclxuLy8gYmVmb3JlIHdhaXRGb3JbUm9vbS9Vc2VyXVdpZGdldCByZWplY3RzIGl0cyBwcm9taXNlXG5jb25zdCBXSURHRVRfV0FJVF9USU1FID0gMjAwMDA7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVdpZGdldEV2ZW50IHtcbiAgICBpZDogc3RyaW5nO1xuICAgIHR5cGU6IHN0cmluZztcbiAgICBzZW5kZXI6IHN0cmluZztcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgc3RhdGVfa2V5OiBzdHJpbmc7XG4gICAgY29udGVudDogUGFydGlhbDxJQXBwPjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV2lkZ2V0VXRpbHMge1xuICAgIC8qIFJldHVybnMgdHJ1ZSBpZiB1c2VyIGlzIGFibGUgdG8gc2VuZCBzdGF0ZSBldmVudHMgdG8gbW9kaWZ5IHdpZGdldHMgaW4gdGhpcyByb29tXG4gICAgICogKERvZXMgbm90IGFwcGx5IHRvIG5vbi1yb29tLWJhc2VkIC8gdXNlciB3aWRnZXRzKVxuICAgICAqIEBwYXJhbSByb29tSWQgLS0gVGhlIElEIG9mIHRoZSByb29tIHRvIGNoZWNrXG4gICAgICogQHJldHVybiBCb29sZWFuIC0tIHRydWUgaWYgdGhlIHVzZXIgY2FuIG1vZGlmeSB3aWRnZXRzIGluIHRoaXMgcm9vbVxuICAgICAqIEB0aHJvd3MgRXJyb3IgLS0gc3BlY2lmaWVzIHRoZSBlcnJvciByZWFzb25cbiAgICAgKi9cbiAgICBzdGF0aWMgY2FuVXNlck1vZGlmeVdpZGdldHMocm9vbUlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCFyb29tSWQpIHtcbiAgICAgICAgICAgIGxvZ2dlci53YXJuKCdObyByb29tIElEIHNwZWNpZmllZCcpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBpZiAoIWNsaWVudCkge1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oJ1VzZXIgbXVzdCBiZSBiZSBsb2dnZWQgaW4nKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJvb20gPSBjbGllbnQuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICBpZiAoIXJvb20pIHtcbiAgICAgICAgICAgIGxvZ2dlci53YXJuKGBSb29tIElEICR7cm9vbUlkfSBpcyBub3QgcmVjb2duaXNlZGApO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbWUgPSBjbGllbnQuY3JlZGVudGlhbHMudXNlcklkO1xuICAgICAgICBpZiAoIW1lKSB7XG4gICAgICAgICAgICBsb2dnZXIud2FybignRmFpbGVkIHRvIGdldCB1c2VyIElEJyk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocm9vbS5nZXRNeU1lbWJlcnNoaXAoKSAhPT0gXCJqb2luXCIpIHtcbiAgICAgICAgICAgIGxvZ2dlci53YXJuKGBVc2VyICR7bWV9IGlzIG5vdCBpbiByb29tICR7cm9vbUlkfWApO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVE9ETzogRW5hYmxlIHN1cHBvcnQgZm9yIG0ud2lkZ2V0IGV2ZW50IHR5cGUgKGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzEzMTExKVxuICAgICAgICByZXR1cm4gcm9vbS5jdXJyZW50U3RhdGUubWF5U2VuZFN0YXRlRXZlbnQoJ2ltLnZlY3Rvci5tb2R1bGFyLndpZGdldHMnLCBtZSk7XG4gICAgfVxuXG4gICAgLy8gVE9ETzogR2VuZXJpZnkgdGhlIG5hbWUgb2YgdGhpcyBmdW5jdGlvbi4gSXQncyBub3QganVzdCBzY2FsYXIuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHNwZWNpZmllZCB1cmwgaXMgYSBzY2FsYXIgVVJMLCB0eXBpY2FsbHkgaHR0cHM6Ly9zY2FsYXIudmVjdG9yLmltL2FwaVxuICAgICAqIEBwYXJhbSAge1t0eXBlXX0gIHRlc3RVcmxTdHJpbmcgVVJMIHRvIGNoZWNrXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn0gVHJ1ZSBpZiBzcGVjaWZpZWQgVVJMIGlzIGEgc2NhbGFyIFVSTFxuICAgICAqL1xuICAgIHN0YXRpYyBpc1NjYWxhclVybCh0ZXN0VXJsU3RyaW5nOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCF0ZXN0VXJsU3RyaW5nKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ1NjYWxhciBVUkwgY2hlY2sgZmFpbGVkLiBObyBVUkwgc3BlY2lmaWVkJyk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0ZXN0VXJsID0gdXJsLnBhcnNlKHRlc3RVcmxTdHJpbmcpO1xuICAgICAgICBsZXQgc2NhbGFyVXJscyA9IFNka0NvbmZpZy5nZXQoKS5pbnRlZ3JhdGlvbnNfd2lkZ2V0c191cmxzO1xuICAgICAgICBpZiAoIXNjYWxhclVybHMgfHwgc2NhbGFyVXJscy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGNvbnN0IGRlZmF1bHRNYW5hZ2VyID0gSW50ZWdyYXRpb25NYW5hZ2Vycy5zaGFyZWRJbnN0YW5jZSgpLmdldFByaW1hcnlNYW5hZ2VyKCk7XG4gICAgICAgICAgICBpZiAoZGVmYXVsdE1hbmFnZXIpIHtcbiAgICAgICAgICAgICAgICBzY2FsYXJVcmxzID0gW2RlZmF1bHRNYW5hZ2VyLmFwaVVybF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNjYWxhclVybHMgPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2NhbGFyVXJscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3Qgc2NhbGFyVXJsID0gdXJsLnBhcnNlKHNjYWxhclVybHNbaV0pO1xuICAgICAgICAgICAgaWYgKHRlc3RVcmwgJiYgc2NhbGFyVXJsKSB7XG4gICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICB0ZXN0VXJsLnByb3RvY29sID09PSBzY2FsYXJVcmwucHJvdG9jb2wgJiZcbiAgICAgICAgICAgICAgICAgICAgdGVzdFVybC5ob3N0ID09PSBzY2FsYXJVcmwuaG9zdCAmJlxuICAgICAgICAgICAgICAgICAgICB0ZXN0VXJsLnBhdGhuYW1lLnN0YXJ0c1dpdGgoc2NhbGFyVXJsLnBhdGhuYW1lKVxuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiBhIHdpZGdldCB3aXRoIHRoZSBnaXZlblxuICAgICAqIElEIGhhcyBiZWVuIGFkZGVkIGFzIGEgdXNlciB3aWRnZXQgKGllLiB0aGUgYWNjb3VudERhdGEgZXZlbnRcbiAgICAgKiBhcnJpdmVzKSBvciByZWplY3RzIGFmdGVyIGEgdGltZW91dFxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHdpZGdldElkIFRoZSBJRCBvZiB0aGUgd2lkZ2V0IHRvIHdhaXQgZm9yXG4gICAgICogQHBhcmFtIHtib29sZWFufSBhZGQgVHJ1ZSB0byB3YWl0IGZvciB0aGUgd2lkZ2V0IHRvIGJlIGFkZGVkLFxuICAgICAqICAgICBmYWxzZSB0byB3YWl0IGZvciBpdCB0byBiZSBkZWxldGVkLlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlfSB0aGF0IHJlc29sdmVzIHdoZW4gdGhlIHdpZGdldCBpcyBpbiB0aGVcbiAgICAgKiAgICAgcmVxdWVzdGVkIHN0YXRlIGFjY29yZGluZyB0byB0aGUgYGFkZGAgcGFyYW1cbiAgICAgKi9cbiAgICBzdGF0aWMgd2FpdEZvclVzZXJXaWRnZXQod2lkZ2V0SWQ6IHN0cmluZywgYWRkOiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAvLyBUZXN0cyBhbiBhY2NvdW50IGRhdGEgZXZlbnQsIHJldHVybmluZyB0cnVlIGlmIGl0J3MgaW4gdGhlIHN0YXRlXG4gICAgICAgICAgICAvLyB3ZSdyZSB3YWl0aW5nIGZvciBpdCB0byBiZSBpblxuICAgICAgICAgICAgZnVuY3Rpb24gZXZlbnRJbkludGVuZGVkU3RhdGUoZXYpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWV2IHx8ICFldi5nZXRDb250ZW50KCkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoYWRkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBldi5nZXRDb250ZW50KClbd2lkZ2V0SWRdICE9PSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV2LmdldENvbnRlbnQoKVt3aWRnZXRJZF0gPT09IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0aW5nQWNjb3VudERhdGFFdmVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRBY2NvdW50RGF0YSgnbS53aWRnZXRzJyk7XG4gICAgICAgICAgICBpZiAoZXZlbnRJbkludGVuZGVkU3RhdGUoc3RhcnRpbmdBY2NvdW50RGF0YUV2ZW50KSkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uQWNjb3VudERhdGEoZXYpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50QWNjb3VudERhdGFFdmVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRBY2NvdW50RGF0YSgnbS53aWRnZXRzJyk7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50SW5JbnRlbmRlZFN0YXRlKGN1cnJlbnRBY2NvdW50RGF0YUV2ZW50KSkge1xuICAgICAgICAgICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkucmVtb3ZlTGlzdGVuZXIoQ2xpZW50RXZlbnQuQWNjb3VudERhdGEsIG9uQWNjb3VudERhdGEpO1xuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXJJZCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB0aW1lcklkID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnJlbW92ZUxpc3RlbmVyKENsaWVudEV2ZW50LkFjY291bnREYXRhLCBvbkFjY291bnREYXRhKTtcbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKFwiVGltZWQgb3V0IHdhaXRpbmcgZm9yIHdpZGdldCBJRCBcIiArIHdpZGdldElkICsgXCIgdG8gYXBwZWFyXCIpKTtcbiAgICAgICAgICAgIH0sIFdJREdFVF9XQUlUX1RJTUUpO1xuICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLm9uKENsaWVudEV2ZW50LkFjY291bnREYXRhLCBvbkFjY291bnREYXRhKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIGEgd2lkZ2V0IHdpdGggdGhlIGdpdmVuXG4gICAgICogSUQgaGFzIGJlZW4gYWRkZWQgYXMgYSByb29tIHdpZGdldCBpbiB0aGUgZ2l2ZW4gcm9vbSAoaWUuIHRoZVxuICAgICAqIHJvb20gc3RhdGUgZXZlbnQgYXJyaXZlcykgb3IgcmVqZWN0cyBhZnRlciBhIHRpbWVvdXRcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB3aWRnZXRJZCBUaGUgSUQgb2YgdGhlIHdpZGdldCB0byB3YWl0IGZvclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSByb29tSWQgVGhlIElEIG9mIHRoZSByb29tIHRvIHdhaXQgZm9yIHRoZSB3aWRnZXQgaW5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGFkZCBUcnVlIHRvIHdhaXQgZm9yIHRoZSB3aWRnZXQgdG8gYmUgYWRkZWQsXG4gICAgICogICAgIGZhbHNlIHRvIHdhaXQgZm9yIGl0IHRvIGJlIGRlbGV0ZWQuXG4gICAgICogQHJldHVybnMge1Byb21pc2V9IHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgd2lkZ2V0IGlzIGluIHRoZVxuICAgICAqICAgICByZXF1ZXN0ZWQgc3RhdGUgYWNjb3JkaW5nIHRvIHRoZSBgYWRkYCBwYXJhbVxuICAgICAqL1xuICAgIHN0YXRpYyB3YWl0Rm9yUm9vbVdpZGdldCh3aWRnZXRJZDogc3RyaW5nLCByb29tSWQ6IHN0cmluZywgYWRkOiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAvLyBUZXN0cyBhIGxpc3Qgb2Ygc3RhdGUgZXZlbnRzLCByZXR1cm5pbmcgdHJ1ZSBpZiBpdCdzIGluIHRoZSBzdGF0ZVxuICAgICAgICAgICAgLy8gd2UncmUgd2FpdGluZyBmb3IgaXQgdG8gYmUgaW5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGV2ZW50c0luSW50ZW5kZWRTdGF0ZShldkxpc3QpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB3aWRnZXRQcmVzZW50ID0gZXZMaXN0LnNvbWUoKGV2KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBldi5nZXRDb250ZW50KCkgJiYgZXYuZ2V0Q29udGVudCgpWydpZCddID09PSB3aWRnZXRJZDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoYWRkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB3aWRnZXRQcmVzZW50O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAhd2lkZ2V0UHJlc2VudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHJvb20gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICAgICAgLy8gVE9ETzogRW5hYmxlIHN1cHBvcnQgZm9yIG0ud2lkZ2V0IGV2ZW50IHR5cGUgKGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzEzMTExKVxuICAgICAgICAgICAgY29uc3Qgc3RhcnRpbmdXaWRnZXRFdmVudHMgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cygnaW0udmVjdG9yLm1vZHVsYXIud2lkZ2V0cycpO1xuICAgICAgICAgICAgaWYgKGV2ZW50c0luSW50ZW5kZWRTdGF0ZShzdGFydGluZ1dpZGdldEV2ZW50cykpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBvblJvb21TdGF0ZUV2ZW50cyhldjogTWF0cml4RXZlbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXYuZ2V0Um9vbUlkKCkgIT09IHJvb21JZCB8fCBldi5nZXRUeXBlKCkgIT09IFwiaW0udmVjdG9yLm1vZHVsYXIud2lkZ2V0c1wiKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICAvLyBUT0RPOiBFbmFibGUgc3VwcG9ydCBmb3IgbS53aWRnZXQgZXZlbnQgdHlwZSAoaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTMxMTEpXG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudFdpZGdldEV2ZW50cyA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKCdpbS52ZWN0b3IubW9kdWxhci53aWRnZXRzJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZXZlbnRzSW5JbnRlbmRlZFN0YXRlKGN1cnJlbnRXaWRnZXRFdmVudHMpKSB7XG4gICAgICAgICAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5yZW1vdmVMaXN0ZW5lcihSb29tU3RhdGVFdmVudC5FdmVudHMsIG9uUm9vbVN0YXRlRXZlbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVySWQpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgdGltZXJJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5yZW1vdmVMaXN0ZW5lcihSb29tU3RhdGVFdmVudC5FdmVudHMsIG9uUm9vbVN0YXRlRXZlbnRzKTtcbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKFwiVGltZWQgb3V0IHdhaXRpbmcgZm9yIHdpZGdldCBJRCBcIiArIHdpZGdldElkICsgXCIgdG8gYXBwZWFyXCIpKTtcbiAgICAgICAgICAgIH0sIFdJREdFVF9XQUlUX1RJTUUpO1xuICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLm9uKFJvb21TdGF0ZUV2ZW50LkV2ZW50cywgb25Sb29tU3RhdGVFdmVudHMpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgc2V0VXNlcldpZGdldChcbiAgICAgICAgd2lkZ2V0SWQ6IHN0cmluZyxcbiAgICAgICAgd2lkZ2V0VHlwZTogV2lkZ2V0VHlwZSxcbiAgICAgICAgd2lkZ2V0VXJsOiBzdHJpbmcsXG4gICAgICAgIHdpZGdldE5hbWU6IHN0cmluZyxcbiAgICAgICAgd2lkZ2V0RGF0YTogSVdpZGdldERhdGEsXG4gICAgKSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSB7XG4gICAgICAgICAgICB0eXBlOiB3aWRnZXRUeXBlLnByZWZlcnJlZCxcbiAgICAgICAgICAgIHVybDogd2lkZ2V0VXJsLFxuICAgICAgICAgICAgbmFtZTogd2lkZ2V0TmFtZSxcbiAgICAgICAgICAgIGRhdGE6IHdpZGdldERhdGEsXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICAvLyBHZXQgdGhlIGN1cnJlbnQgd2lkZ2V0cyBhbmQgY2xvbmUgdGhlbSBiZWZvcmUgd2UgbW9kaWZ5IHRoZW0sIG90aGVyd2lzZVxuICAgICAgICAvLyB3ZSdsbCBtb2RpZnkgdGhlIGNvbnRlbnQgb2YgdGhlIG9sZCBldmVudC5cbiAgICAgICAgY29uc3QgdXNlcldpZGdldHMgPSBvYmplY3RDbG9uZShXaWRnZXRVdGlscy5nZXRVc2VyV2lkZ2V0cygpKTtcblxuICAgICAgICAvLyBEZWxldGUgZXhpc3Rpbmcgd2lkZ2V0IHdpdGggSURcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGRlbGV0ZSB1c2VyV2lkZ2V0c1t3aWRnZXRJZF07XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihgJHdpZGdldElkIGlzIG5vbi1jb25maWd1cmFibGVgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGFkZGluZ1dpZGdldCA9IEJvb2xlYW4od2lkZ2V0VXJsKTtcblxuICAgICAgICAvLyBBZGQgbmV3IHdpZGdldCAvIHVwZGF0ZVxuICAgICAgICBpZiAoYWRkaW5nV2lkZ2V0KSB7XG4gICAgICAgICAgICB1c2VyV2lkZ2V0c1t3aWRnZXRJZF0gPSB7XG4gICAgICAgICAgICAgICAgY29udGVudDogY29udGVudCxcbiAgICAgICAgICAgICAgICBzZW5kZXI6IGNsaWVudC5nZXRVc2VySWQoKSxcbiAgICAgICAgICAgICAgICBzdGF0ZV9rZXk6IHdpZGdldElkLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdtLndpZGdldCcsXG4gICAgICAgICAgICAgICAgaWQ6IHdpZGdldElkLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoaXMgc3RhcnRzIGxpc3RlbmluZyBmb3Igd2hlbiB0aGUgZWNobyBjb21lcyBiYWNrIGZyb20gdGhlIHNlcnZlclxuICAgICAgICAvLyBzaW5jZSB0aGUgd2lkZ2V0IHdvbid0IGFwcGVhciBhZGRlZCB1bnRpbCB0aGlzIGhhcHBlbnMuIElmIHdlIGRvbid0XG4gICAgICAgIC8vIHdhaXQgZm9yIHRoaXMsIHRoZSBhY3Rpb24gd2lsbCBjb21wbGV0ZSBidXQgaWYgdGhlIHVzZXIgaXMgZmFzdCBlbm91Z2gsXG4gICAgICAgIC8vIHRoZSB3aWRnZXQgc3RpbGwgd29uJ3QgYWN0dWFsbHkgYmUgdGhlcmUuXG4gICAgICAgIHJldHVybiBjbGllbnQuc2V0QWNjb3VudERhdGEoJ20ud2lkZ2V0cycsIHVzZXJXaWRnZXRzKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBXaWRnZXRVdGlscy53YWl0Rm9yVXNlcldpZGdldCh3aWRnZXRJZCwgYWRkaW5nV2lkZ2V0KTtcbiAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246IFwidXNlcl93aWRnZXRfdXBkYXRlZFwiIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgc2V0Um9vbVdpZGdldChcbiAgICAgICAgcm9vbUlkOiBzdHJpbmcsXG4gICAgICAgIHdpZGdldElkOiBzdHJpbmcsXG4gICAgICAgIHdpZGdldFR5cGU/OiBXaWRnZXRUeXBlLFxuICAgICAgICB3aWRnZXRVcmw/OiBzdHJpbmcsXG4gICAgICAgIHdpZGdldE5hbWU/OiBzdHJpbmcsXG4gICAgICAgIHdpZGdldERhdGE/OiBvYmplY3QsXG4gICAgICAgIHdpZGdldEF2YXRhclVybD86IHN0cmluZyxcbiAgICApIHtcbiAgICAgICAgbGV0IGNvbnRlbnQ7XG5cbiAgICAgICAgY29uc3QgYWRkaW5nV2lkZ2V0ID0gQm9vbGVhbih3aWRnZXRVcmwpO1xuXG4gICAgICAgIGlmIChhZGRpbmdXaWRnZXQpIHtcbiAgICAgICAgICAgIGNvbnRlbnQgPSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogRW5hYmxlIHN1cHBvcnQgZm9yIG0ud2lkZ2V0IGV2ZW50IHR5cGUgKGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzEzMTExKVxuICAgICAgICAgICAgICAgIC8vIEZvciBub3cgd2UnbGwgc2VuZCB0aGUgbGVnYWN5IGV2ZW50IHR5cGUgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBvbGRlciBhcHBzL2VsZW1lbnRzXG4gICAgICAgICAgICAgICAgdHlwZTogd2lkZ2V0VHlwZS5sZWdhY3ksXG4gICAgICAgICAgICAgICAgdXJsOiB3aWRnZXRVcmwsXG4gICAgICAgICAgICAgICAgbmFtZTogd2lkZ2V0TmFtZSxcbiAgICAgICAgICAgICAgICBkYXRhOiB3aWRnZXREYXRhLFxuICAgICAgICAgICAgICAgIGF2YXRhcl91cmw6IHdpZGdldEF2YXRhclVybCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb250ZW50ID0ge307XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gV2lkZ2V0VXRpbHMuc2V0Um9vbVdpZGdldENvbnRlbnQocm9vbUlkLCB3aWRnZXRJZCwgY29udGVudCk7XG4gICAgfVxuXG4gICAgc3RhdGljIHNldFJvb21XaWRnZXRDb250ZW50KFxuICAgICAgICByb29tSWQ6IHN0cmluZyxcbiAgICAgICAgd2lkZ2V0SWQ6IHN0cmluZyxcbiAgICAgICAgY29udGVudDogSVdpZGdldCxcbiAgICApIHtcbiAgICAgICAgY29uc3QgYWRkaW5nV2lkZ2V0ID0gISFjb250ZW50LnVybDtcblxuICAgICAgICBXaWRnZXRFY2hvU3RvcmUuc2V0Um9vbVdpZGdldEVjaG8ocm9vbUlkLCB3aWRnZXRJZCwgY29udGVudCk7XG5cbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICAvLyBUT0RPOiBFbmFibGUgc3VwcG9ydCBmb3IgbS53aWRnZXQgZXZlbnQgdHlwZSAoaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvMTMxMTEpXG4gICAgICAgIHJldHVybiBjbGllbnQuc2VuZFN0YXRlRXZlbnQocm9vbUlkLCBcImltLnZlY3Rvci5tb2R1bGFyLndpZGdldHNcIiwgY29udGVudCwgd2lkZ2V0SWQpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFdpZGdldFV0aWxzLndhaXRGb3JSb29tV2lkZ2V0KHdpZGdldElkLCByb29tSWQsIGFkZGluZ1dpZGdldCk7XG4gICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgV2lkZ2V0RWNob1N0b3JlLnJlbW92ZVJvb21XaWRnZXRFY2hvKHJvb21JZCwgd2lkZ2V0SWQpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgcm9vbSBzcGVjaWZpYyB3aWRnZXRzXG4gICAgICogQHBhcmFtICB7Um9vbX0gcm9vbSBUaGUgcm9vbSB0byBnZXQgd2lkZ2V0cyBmb3JjZVxuICAgICAqIEByZXR1cm4ge1tvYmplY3RdfSBBcnJheSBjb250YWluaW5nIGN1cnJlbnQgLyBhY3RpdmUgcm9vbSB3aWRnZXRzXG4gICAgICovXG4gICAgc3RhdGljIGdldFJvb21XaWRnZXRzKHJvb206IFJvb20pIHtcbiAgICAgICAgLy8gVE9ETzogRW5hYmxlIHN1cHBvcnQgZm9yIG0ud2lkZ2V0IGV2ZW50IHR5cGUgKGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzEzMTExKVxuICAgICAgICBjb25zdCBhcHBzU3RhdGVFdmVudHMgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cygnaW0udmVjdG9yLm1vZHVsYXIud2lkZ2V0cycpO1xuICAgICAgICBpZiAoIWFwcHNTdGF0ZUV2ZW50cykge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFwcHNTdGF0ZUV2ZW50cy5maWx0ZXIoKGV2KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZXYuZ2V0Q29udGVudCgpLnR5cGUgJiYgZXYuZ2V0Q29udGVudCgpLnVybDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHVzZXIgc3BlY2lmaWMgd2lkZ2V0cyAobm90IGxpbmtlZCB0byBhIHNwZWNpZmljIHJvb20pXG4gICAgICogQHJldHVybiB7b2JqZWN0fSBFdmVudCBjb250ZW50IG9iamVjdCBjb250YWluaW5nIGN1cnJlbnQgLyBhY3RpdmUgdXNlciB3aWRnZXRzXG4gICAgICovXG4gICAgc3RhdGljIGdldFVzZXJXaWRnZXRzKCk6IFJlY29yZDxzdHJpbmcsIElXaWRnZXRFdmVudD4ge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGlmICghY2xpZW50KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VzZXIgbm90IGxvZ2dlZCBpbicpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHVzZXJXaWRnZXRzID0gY2xpZW50LmdldEFjY291bnREYXRhKCdtLndpZGdldHMnKTtcbiAgICAgICAgaWYgKHVzZXJXaWRnZXRzICYmIHVzZXJXaWRnZXRzLmdldENvbnRlbnQoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHVzZXJXaWRnZXRzLmdldENvbnRlbnQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge307XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IHVzZXIgc3BlY2lmaWMgd2lkZ2V0cyAobm90IGxpbmtlZCB0byBhIHNwZWNpZmljIHJvb20pIGFzIGFuIGFycmF5XG4gICAgICogQHJldHVybiB7W29iamVjdF19IEFycmF5IGNvbnRhaW5pbmcgY3VycmVudCAvIGFjdGl2ZSB1c2VyIHdpZGdldHNcbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0VXNlcldpZGdldHNBcnJheSgpOiBJV2lkZ2V0RXZlbnRbXSB7XG4gICAgICAgIHJldHVybiBPYmplY3QudmFsdWVzKFdpZGdldFV0aWxzLmdldFVzZXJXaWRnZXRzKCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBhY3RpdmUgc3RpY2tlcnBpY2tlciB3aWRnZXRzIChzdGlja2VycGlja2VycyBhcmUgdXNlciB3aWRnZXRzIGJ5IG5hdHVyZSlcbiAgICAgKiBAcmV0dXJuIHtbb2JqZWN0XX0gQXJyYXkgY29udGFpbmluZyBjdXJyZW50IC8gYWN0aXZlIHN0aWNrZXJwaWNrZXIgd2lkZ2V0c1xuICAgICAqL1xuICAgIHN0YXRpYyBnZXRTdGlja2VycGlja2VyV2lkZ2V0cygpOiBJV2lkZ2V0RXZlbnRbXSB7XG4gICAgICAgIGNvbnN0IHdpZGdldHMgPSBXaWRnZXRVdGlscy5nZXRVc2VyV2lkZ2V0c0FycmF5KCk7XG4gICAgICAgIHJldHVybiB3aWRnZXRzLmZpbHRlcigod2lkZ2V0KSA9PiB3aWRnZXQuY29udGVudCAmJiB3aWRnZXQuY29udGVudC50eXBlID09PSBcIm0uc3RpY2tlcnBpY2tlclwiKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgYWxsIGludGVncmF0aW9uIG1hbmFnZXIgd2lkZ2V0cyBmb3IgdGhpcyB1c2VyLlxuICAgICAqIEByZXR1cm5zIHtPYmplY3RbXX0gQW4gYXJyYXkgb2YgaW50ZWdyYXRpb24gbWFuYWdlciB1c2VyIHdpZGdldHMuXG4gICAgICovXG4gICAgc3RhdGljIGdldEludGVncmF0aW9uTWFuYWdlcldpZGdldHMoKTogSVdpZGdldEV2ZW50W10ge1xuICAgICAgICBjb25zdCB3aWRnZXRzID0gV2lkZ2V0VXRpbHMuZ2V0VXNlcldpZGdldHNBcnJheSgpO1xuICAgICAgICByZXR1cm4gd2lkZ2V0cy5maWx0ZXIodyA9PiB3LmNvbnRlbnQgJiYgdy5jb250ZW50LnR5cGUgPT09IFwibS5pbnRlZ3JhdGlvbl9tYW5hZ2VyXCIpO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXRSb29tV2lkZ2V0c09mVHlwZShyb29tOiBSb29tLCB0eXBlOiBXaWRnZXRUeXBlKTogTWF0cml4RXZlbnRbXSB7XG4gICAgICAgIGNvbnN0IHdpZGdldHMgPSBXaWRnZXRVdGlscy5nZXRSb29tV2lkZ2V0cyhyb29tKSB8fCBbXTtcbiAgICAgICAgcmV0dXJuIHdpZGdldHMuZmlsdGVyKHcgPT4ge1xuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IHcuZ2V0Q29udGVudCgpO1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRlbnQudXJsICYmIHR5cGUubWF0Y2hlcyhjb250ZW50LnR5cGUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXN5bmMgcmVtb3ZlSW50ZWdyYXRpb25NYW5hZ2VyV2lkZ2V0cygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBpZiAoIWNsaWVudCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVc2VyIG5vdCBsb2dnZWQgaW4nKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB3aWRnZXRzID0gY2xpZW50LmdldEFjY291bnREYXRhKCdtLndpZGdldHMnKTtcbiAgICAgICAgaWYgKCF3aWRnZXRzKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHVzZXJXaWRnZXRzOiBSZWNvcmQ8c3RyaW5nLCBJV2lkZ2V0RXZlbnQ+ID0gd2lkZ2V0cy5nZXRDb250ZW50KCkgfHwge307XG4gICAgICAgIE9iamVjdC5lbnRyaWVzKHVzZXJXaWRnZXRzKS5mb3JFYWNoKChba2V5LCB3aWRnZXRdKSA9PiB7XG4gICAgICAgICAgICBpZiAod2lkZ2V0LmNvbnRlbnQgJiYgd2lkZ2V0LmNvbnRlbnQudHlwZSA9PT0gXCJtLmludGVncmF0aW9uX21hbmFnZXJcIikge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB1c2VyV2lkZ2V0c1trZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgY2xpZW50LnNldEFjY291bnREYXRhKCdtLndpZGdldHMnLCB1c2VyV2lkZ2V0cyk7XG4gICAgfVxuXG4gICAgc3RhdGljIGFkZEludGVncmF0aW9uTWFuYWdlcldpZGdldChuYW1lOiBzdHJpbmcsIHVpVXJsOiBzdHJpbmcsIGFwaVVybDogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiBXaWRnZXRVdGlscy5zZXRVc2VyV2lkZ2V0KFxuICAgICAgICAgICAgXCJpbnRlZ3JhdGlvbl9tYW5hZ2VyX1wiICsgKG5ldyBEYXRlKCkuZ2V0VGltZSgpKSxcbiAgICAgICAgICAgIFdpZGdldFR5cGUuSU5URUdSQVRJT05fTUFOQUdFUixcbiAgICAgICAgICAgIHVpVXJsLFxuICAgICAgICAgICAgXCJJbnRlZ3JhdGlvbiBtYW5hZ2VyOiBcIiArIG5hbWUsXG4gICAgICAgICAgICB7IFwiYXBpX3VybFwiOiBhcGlVcmwgfSxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgYWxsIHN0aWNrZXJwaWNrZXIgd2lkZ2V0cyAoc3RpY2tlcnBpY2tlcnMgYXJlIHVzZXIgd2lkZ2V0cyBieSBuYXR1cmUpXG4gICAgICogQHJldHVybiB7UHJvbWlzZX0gUmVzb2x2ZXMgb24gYWNjb3VudCBkYXRhIHVwZGF0ZWRcbiAgICAgKi9cbiAgICBzdGF0aWMgYXN5bmMgcmVtb3ZlU3RpY2tlcnBpY2tlcldpZGdldHMoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgaWYgKCFjbGllbnQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVXNlciBub3QgbG9nZ2VkIGluJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgd2lkZ2V0cyA9IGNsaWVudC5nZXRBY2NvdW50RGF0YSgnbS53aWRnZXRzJyk7XG4gICAgICAgIGlmICghd2lkZ2V0cykgcmV0dXJuO1xuICAgICAgICBjb25zdCB1c2VyV2lkZ2V0czogUmVjb3JkPHN0cmluZywgSVdpZGdldEV2ZW50PiA9IHdpZGdldHMuZ2V0Q29udGVudCgpIHx8IHt9O1xuICAgICAgICBPYmplY3QuZW50cmllcyh1c2VyV2lkZ2V0cykuZm9yRWFjaCgoW2tleSwgd2lkZ2V0XSkgPT4ge1xuICAgICAgICAgICAgaWYgKHdpZGdldC5jb250ZW50ICYmIHdpZGdldC5jb250ZW50LnR5cGUgPT09ICdtLnN0aWNrZXJwaWNrZXInKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHVzZXJXaWRnZXRzW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBhd2FpdCBjbGllbnQuc2V0QWNjb3VudERhdGEoJ20ud2lkZ2V0cycsIHVzZXJXaWRnZXRzKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgYXN5bmMgYWRkSml0c2lXaWRnZXQoXG4gICAgICAgIHJvb21JZDogc3RyaW5nLFxuICAgICAgICB0eXBlOiBDYWxsVHlwZSxcbiAgICAgICAgbmFtZTogc3RyaW5nLFxuICAgICAgICBpc1ZpZGVvQ2hhbm5lbDogYm9vbGVhbixcbiAgICAgICAgb29iUm9vbU5hbWU/OiBzdHJpbmcsXG4gICAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IGRvbWFpbiA9IEppdHNpLmdldEluc3RhbmNlKCkucHJlZmVycmVkRG9tYWluO1xuICAgICAgICBjb25zdCBhdXRoID0gYXdhaXQgSml0c2kuZ2V0SW5zdGFuY2UoKS5nZXRKaXRzaUF1dGgoKTtcbiAgICAgICAgY29uc3Qgd2lkZ2V0SWQgPSByYW5kb21TdHJpbmcoMjQpOyAvLyBNdXN0IGJlIGdsb2JhbGx5IHVuaXF1ZVxuXG4gICAgICAgIGxldCBjb25mSWQ7XG4gICAgICAgIGlmIChhdXRoID09PSAnb3BlbmlkdG9rZW4tand0Jykge1xuICAgICAgICAgICAgLy8gQ3JlYXRlIGNvbmZlcmVuY2UgSUQgZnJvbSByb29tIElEXG4gICAgICAgICAgICAvLyBGb3IgY29tcGF0aWJpbGl0eSB3aXRoIEppdHNpLCB1c2UgYmFzZTMyIHdpdGhvdXQgcGFkZGluZy5cbiAgICAgICAgICAgIC8vIE1vcmUgZGV0YWlscyBoZXJlOlxuICAgICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL21hdHJpeC1vcmcvcHJvc29keS1tb2QtYXV0aC1tYXRyaXgtdXNlci12ZXJpZmljYXRpb25cbiAgICAgICAgICAgIGNvbmZJZCA9IGJhc2UzMi5zdHJpbmdpZnkoQnVmZmVyLmZyb20ocm9vbUlkKSwgeyBwYWQ6IGZhbHNlIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gQ3JlYXRlIGEgcmFuZG9tIGNvbmZlcmVuY2UgSURcbiAgICAgICAgICAgIGNvbmZJZCA9IGBKaXRzaSR7cmFuZG9tVXBwZXJjYXNlU3RyaW5nKDEpfSR7cmFuZG9tTG93ZXJjYXNlU3RyaW5nKDIzKX1gO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVE9ETzogUmVtb3ZlIFVSTCBoYWNrcyB3aGVuIHRoZSBtb2JpbGUgY2xpZW50cyBldmVudHVhbGx5IHN1cHBvcnQgdjIgd2lkZ2V0c1xuICAgICAgICBjb25zdCB3aWRnZXRVcmwgPSBuZXcgVVJMKFdpZGdldFV0aWxzLmdldExvY2FsSml0c2lXcmFwcGVyVXJsKHsgYXV0aCB9KSk7XG4gICAgICAgIHdpZGdldFVybC5zZWFyY2ggPSAnJzsgLy8gQ2F1c2VzIHRoZSBVUkwgY2xhc3MgdXNlIHNlYXJjaFBhcmFtcyBpbnN0ZWFkXG4gICAgICAgIHdpZGdldFVybC5zZWFyY2hQYXJhbXMuc2V0KCdjb25mSWQnLCBjb25mSWQpO1xuXG4gICAgICAgIGF3YWl0IFdpZGdldFV0aWxzLnNldFJvb21XaWRnZXQocm9vbUlkLCB3aWRnZXRJZCwgV2lkZ2V0VHlwZS5KSVRTSSwgd2lkZ2V0VXJsLnRvU3RyaW5nKCksIG5hbWUsIHtcbiAgICAgICAgICAgIGNvbmZlcmVuY2VJZDogY29uZklkLFxuICAgICAgICAgICAgcm9vbU5hbWU6IG9vYlJvb21OYW1lID8/IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKHJvb21JZCk/Lm5hbWUsXG4gICAgICAgICAgICBpc0F1ZGlvT25seTogdHlwZSA9PT0gQ2FsbFR5cGUuVm9pY2UsXG4gICAgICAgICAgICBpc1ZpZGVvQ2hhbm5lbCxcbiAgICAgICAgICAgIGRvbWFpbixcbiAgICAgICAgICAgIGF1dGgsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0YXRpYyBtYWtlQXBwQ29uZmlnKFxuICAgICAgICBhcHBJZDogc3RyaW5nLFxuICAgICAgICBhcHA6IFBhcnRpYWw8SUFwcD4sXG4gICAgICAgIHNlbmRlclVzZXJJZDogc3RyaW5nLFxuICAgICAgICByb29tSWQ6IHN0cmluZyB8IG51bGwsXG4gICAgICAgIGV2ZW50SWQ6IHN0cmluZyxcbiAgICApOiBJQXBwIHtcbiAgICAgICAgaWYgKCFzZW5kZXJVc2VySWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIldpZGdldHMgbXVzdCBiZSBjcmVhdGVkIGJ5IHNvbWVvbmUgLSBwcm92aWRlIGEgc2VuZGVyVXNlcklkXCIpO1xuICAgICAgICB9XG4gICAgICAgIGFwcC5jcmVhdG9yVXNlcklkID0gc2VuZGVyVXNlcklkO1xuXG4gICAgICAgIGFwcC5pZCA9IGFwcElkO1xuICAgICAgICBhcHAucm9vbUlkID0gcm9vbUlkO1xuICAgICAgICBhcHAuZXZlbnRJZCA9IGV2ZW50SWQ7XG4gICAgICAgIGFwcC5uYW1lID0gYXBwLm5hbWUgfHwgYXBwLnR5cGU7XG5cbiAgICAgICAgcmV0dXJuIGFwcCBhcyBJQXBwO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXRMb2NhbEppdHNpV3JhcHBlclVybChvcHRzOiB7Zm9yTG9jYWxSZW5kZXI/OiBib29sZWFuLCBhdXRoPzogc3RyaW5nfSA9IHt9KSB7XG4gICAgICAgIC8vIE5CLiB3ZSBjYW4ndCBqdXN0IGVuY29kZVVSSUNvbXBvbmVudCBhbGwgb2YgdGhlc2UgYmVjYXVzZSB0aGUgJCBzaWducyBuZWVkIHRvIGJlIHRoZXJlXG4gICAgICAgIGNvbnN0IHF1ZXJ5U3RyaW5nUGFydHMgPSBbXG4gICAgICAgICAgICAnY29uZmVyZW5jZURvbWFpbj0kZG9tYWluJyxcbiAgICAgICAgICAgICdjb25mZXJlbmNlSWQ9JGNvbmZlcmVuY2VJZCcsXG4gICAgICAgICAgICAnaXNBdWRpb09ubHk9JGlzQXVkaW9Pbmx5JyxcbiAgICAgICAgICAgICdpc1ZpZGVvQ2hhbm5lbD0kaXNWaWRlb0NoYW5uZWwnLFxuICAgICAgICAgICAgJ2Rpc3BsYXlOYW1lPSRtYXRyaXhfZGlzcGxheV9uYW1lJyxcbiAgICAgICAgICAgICdhdmF0YXJVcmw9JG1hdHJpeF9hdmF0YXJfdXJsJyxcbiAgICAgICAgICAgICd1c2VySWQ9JG1hdHJpeF91c2VyX2lkJyxcbiAgICAgICAgICAgICdyb29tSWQ9JG1hdHJpeF9yb29tX2lkJyxcbiAgICAgICAgICAgICd0aGVtZT0kdGhlbWUnLFxuICAgICAgICAgICAgJ3Jvb21OYW1lPSRyb29tTmFtZScsXG4gICAgICAgICAgICBgc3VwcG9ydHNTY3JlZW5zaGFyaW5nPSR7UGxhdGZvcm1QZWcuZ2V0KCkuc3VwcG9ydHNKaXRzaVNjcmVlbnNoYXJpbmcoKX1gLFxuICAgICAgICBdO1xuICAgICAgICBpZiAob3B0cy5hdXRoKSB7XG4gICAgICAgICAgICBxdWVyeVN0cmluZ1BhcnRzLnB1c2goYGF1dGg9JHtvcHRzLmF1dGh9YCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeVN0cmluZ1BhcnRzLmpvaW4oJyYnKTtcblxuICAgICAgICBsZXQgYmFzZVVybCA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuICAgICAgICBpZiAod2luZG93LmxvY2F0aW9uLnByb3RvY29sICE9PSBcImh0dHBzOlwiICYmICFvcHRzLmZvckxvY2FsUmVuZGVyKSB7XG4gICAgICAgICAgICAvLyBVc2UgYW4gZXh0ZXJuYWwgd3JhcHBlciBpZiB3ZSdyZSBub3QgbG9jYWxseSByZW5kZXJpbmcgdGhlIHdpZGdldC4gVGhpcyBpcyB1c3VhbGx5XG4gICAgICAgICAgICAvLyB0aGUgVVJMIHRoYXQgd2lsbCBlbmQgdXAgaW4gdGhlIHdpZGdldCBldmVudCwgc28gd2Ugd2FudCB0byBtYWtlIHN1cmUgaXQncyByZWxhdGl2ZWx5XG4gICAgICAgICAgICAvLyBzYWZlIHRvIHNlbmQuXG4gICAgICAgICAgICAvLyBXZSdsbCBlbmQgdXAgdXNpbmcgYSBsb2NhbCByZW5kZXIgVVJMIHdoZW4gd2Ugc2VlIGEgSml0c2kgd2lkZ2V0IGFueXdheXMsIHNvIHRoaXMgaXNcbiAgICAgICAgICAgIC8vIHJlYWxseSBqdXN0IGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSBhbmQgdG8gYXBwZWFzZSB0aGUgc3BlYy5cbiAgICAgICAgICAgIGJhc2VVcmwgPSBcImh0dHBzOi8vYXBwLmVsZW1lbnQuaW8vXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTChcImppdHNpLmh0bWwjXCIgKyBxdWVyeVN0cmluZywgYmFzZVVybCk7IC8vIHRoaXMgc3RyaXBzIGhhc2ggZnJhZ21lbnQgZnJvbSBiYXNlVXJsXG4gICAgICAgIHJldHVybiB1cmwuaHJlZjtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0V2lkZ2V0TmFtZShhcHA/OiBJQXBwKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGFwcD8ubmFtZT8udHJpbSgpIHx8IF90KFwiVW5rbm93biBBcHBcIik7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldFdpZGdldERhdGFUaXRsZShhcHA/OiBJQXBwKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGFwcD8uZGF0YT8udGl0bGU/LnRyaW0oKSB8fCBcIlwiO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXRXaWRnZXRVaWQoYXBwPzogSUFwcCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBhcHAgPyBXaWRnZXRVdGlscy5jYWxjV2lkZ2V0VWlkKGFwcC5pZCwgYXBwLnJvb21JZCkgOiBcIlwiO1xuICAgIH1cblxuICAgIHN0YXRpYyBjYWxjV2lkZ2V0VWlkKHdpZGdldElkOiBzdHJpbmcsIHJvb21JZD86IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiByb29tSWQgPyBgcm9vbV8ke3Jvb21JZH1fJHt3aWRnZXRJZH1gIDogYHVzZXJfJHt3aWRnZXRJZH1gO1xuICAgIH1cblxuICAgIHN0YXRpYyBlZGl0V2lkZ2V0KHJvb206IFJvb20sIGFwcDogSUFwcCk6IHZvaWQge1xuICAgICAgICAvLyBub2luc3BlY3Rpb24gSlNJZ25vcmVkUHJvbWlzZUZyb21DYWxsXG4gICAgICAgIEludGVncmF0aW9uTWFuYWdlcnMuc2hhcmVkSW5zdGFuY2UoKS5nZXRQcmltYXJ5TWFuYWdlcigpLm9wZW4ocm9vbSwgJ3R5cGVfJyArIGFwcC50eXBlLCBhcHAuaWQpO1xuICAgIH1cblxuICAgIHN0YXRpYyBpc01hbmFnZWRCeU1hbmFnZXIoYXBwKSB7XG4gICAgICAgIGlmIChXaWRnZXRVdGlscy5pc1NjYWxhclVybChhcHAudXJsKSkge1xuICAgICAgICAgICAgY29uc3QgbWFuYWdlcnMgPSBJbnRlZ3JhdGlvbk1hbmFnZXJzLnNoYXJlZEluc3RhbmNlKCk7XG4gICAgICAgICAgICBpZiAobWFuYWdlcnMuaGFzTWFuYWdlcigpKSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogUGljayB0aGUgcmlnaHQgbWFuYWdlciBmb3IgdGhlIHdpZGdldFxuICAgICAgICAgICAgICAgIGNvbnN0IGRlZmF1bHRNYW5hZ2VyID0gbWFuYWdlcnMuZ2V0UHJpbWFyeU1hbmFnZXIoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gV2lkZ2V0VXRpbHMuaXNTY2FsYXJVcmwoZGVmYXVsdE1hbmFnZXIuYXBpVXJsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFpQkE7O0FBQ0E7O0FBSUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQXBDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXdCQTtBQUNBO0FBQ0EsTUFBTUEsZ0JBQWdCLEdBQUcsS0FBekI7O0FBV2UsTUFBTUMsV0FBTixDQUFrQjtFQUM3QjtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDK0IsT0FBcEJDLG9CQUFvQixDQUFDQyxNQUFELEVBQTBCO0lBQ2pELElBQUksQ0FBQ0EsTUFBTCxFQUFhO01BQ1RDLGNBQUEsQ0FBT0MsSUFBUCxDQUFZLHNCQUFaOztNQUNBLE9BQU8sS0FBUDtJQUNIOztJQUVELE1BQU1DLE1BQU0sR0FBR0MsZ0NBQUEsQ0FBZ0JDLEdBQWhCLEVBQWY7O0lBQ0EsSUFBSSxDQUFDRixNQUFMLEVBQWE7TUFDVEYsY0FBQSxDQUFPQyxJQUFQLENBQVksMkJBQVo7O01BQ0EsT0FBTyxLQUFQO0lBQ0g7O0lBRUQsTUFBTUksSUFBSSxHQUFHSCxNQUFNLENBQUNJLE9BQVAsQ0FBZVAsTUFBZixDQUFiOztJQUNBLElBQUksQ0FBQ00sSUFBTCxFQUFXO01BQ1BMLGNBQUEsQ0FBT0MsSUFBUCxDQUFhLFdBQVVGLE1BQU8sb0JBQTlCOztNQUNBLE9BQU8sS0FBUDtJQUNIOztJ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