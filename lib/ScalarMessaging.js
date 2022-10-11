"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startListening = startListening;
exports.stopListening = stopListening;

var _event = require("matrix-js-sdk/src/models/event");

var _logger = require("matrix-js-sdk/src/logger");

var _MatrixClientPeg = require("./MatrixClientPeg");

var _dispatcher = _interopRequireDefault(require("./dispatcher/dispatcher"));

var _WidgetUtils = _interopRequireDefault(require("./utils/WidgetUtils"));

var _RoomViewStore = require("./stores/RoomViewStore");

var _languageHandler = require("./languageHandler");

var _IntegrationManagers = require("./integrations/IntegrationManagers");

var _WidgetType = require("./widgets/WidgetType");

var _objects = require("./utils/objects");

/*
Copyright 2016 OpenMarket Ltd
Copyright 2017 Vector Creations Ltd
Copyright 2018 New Vector Ltd

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
// TODO: Generify the name of this and all components within - it's not just for scalar.

/*
Listens for incoming postMessage requests from the integrations UI URL. The following API is exposed:
{
    action: "invite" | "membership_state" | "bot_options" | "set_bot_options" | etc... ,
    room_id: $ROOM_ID,
    user_id: $USER_ID
    // additional request fields
}

The complete request object is returned to the caller with an additional "response" key like so:
{
    action: "invite" | "membership_state" | "bot_options" | "set_bot_options",
    room_id: $ROOM_ID,
    user_id: $USER_ID,
    // additional request fields
    response: { ... }
}

The "action" determines the format of the request and response. All actions can return an error response.
An error response is a "response" object which consists of a sole "error" key to indicate an error.
They look like:
{
    error: {
        message: "Unable to invite user into room.",
        _error: <Original Error Object>
    }
}
The "message" key should be a human-friendly string.

ACTIONS
=======
All actions can return an error response instead of the response outlined below.

invite
------
Invites a user into a room. The request will no-op if the user is already joined OR invited to the room.

Request:
 - room_id is the room to invite the user into.
 - user_id is the user ID to invite.
 - No additional fields.
Response:
{
    success: true
}
Example:
{
    action: "invite",
    room_id: "!foo:bar",
    user_id: "@invitee:bar",
    response: {
        success: true
    }
}

set_bot_options
---------------
Set the m.room.bot.options state event for a bot user.

Request:
 - room_id is the room to send the state event into.
 - user_id is the user ID of the bot who you're setting options for.
 - "content" is an object consisting of the content you wish to set.
Response:
{
    success: true
}
Example:
{
    action: "set_bot_options",
    room_id: "!foo:bar",
    user_id: "@bot:bar",
    content: {
        default_option: "alpha"
    },
    response: {
        success: true
    }
}

get_membership_count
--------------------
Get the number of joined users in the room.

Request:
 - room_id is the room to get the count in.
Response:
78
Example:
{
    action: "get_membership_count",
    room_id: "!foo:bar",
    response: 78
}

can_send_event
--------------
Check if the client can send the given event into the given room. If the client
is unable to do this, an error response is returned instead of 'response: false'.

Request:
 - room_id is the room to do the check in.
 - event_type is the event type which will be sent.
 - is_state is true if the event to be sent is a state event.
Response:
true
Example:
{
    action: "can_send_event",
    is_state: false,
    event_type: "m.room.message",
    room_id: "!foo:bar",
    response: true
}

set_widget
----------
Set a new widget in the room. Clobbers based on the ID.

Request:
 - `room_id` (String) is the room to set the widget in.
 - `widget_id` (String) is the ID of the widget to add (or replace if it already exists).
   It can be an arbitrary UTF8 string and is purely for distinguishing between widgets.
 - `url` (String) is the URL that clients should load in an iframe to run the widget.
   All widgets must have a valid URL. If the URL is `null` (not `undefined`), the
   widget will be removed from the room.
 - `type` (String) is the type of widget, which is provided as a hint for matrix clients so they
   can configure/lay out the widget in different ways. All widgets must have a type.
 - `name` (String) is an optional human-readable string about the widget.
 - `data` (Object) is some optional data about the widget, and can contain arbitrary key/value pairs.
 - `avatar_url` (String) is some optional mxc: URI pointing to the avatar of the widget.
Response:
{
    success: true
}
Example:
{
    action: "set_widget",
    room_id: "!foo:bar",
    widget_id: "abc123",
    url: "http://widget.url",
    type: "example",
    response: {
        success: true
    }
}

get_widgets
-----------
Get a list of all widgets in the room. The response is an array
of state events.

Request:
 - `room_id` (String) is the room to get the widgets in.
Response:
[
    {
        // TODO: Enable support for m.widget event type (https://github.com/vector-im/element-web/issues/13111)
        type: "im.vector.modular.widgets",
        state_key: "wid1",
        content: {
            type: "grafana",
            url: "https://grafanaurl",
            name: "dashboard",
            data: {key: "val"}
        }
        room_id: "!foo:bar",
        sender: "@alice:localhost"
    }
]
Example:
{
    action: "get_widgets",
    room_id: "!foo:bar",
    response: [
        {
            // TODO: Enable support for m.widget event type (https://github.com/vector-im/element-web/issues/13111)
            type: "im.vector.modular.widgets",
            state_key: "wid1",
            content: {
                type: "grafana",
                url: "https://grafanaurl",
                name: "dashboard",
                data: {key: "val"}
            }
            room_id: "!foo:bar",
            sender: "@alice:localhost"
        }
    ]
}

membership_state AND bot_options
--------------------------------
Get the content of the "m.room.member" or "m.room.bot.options" state event respectively.

NB: Whilst this API is basically equivalent to getStateEvent, we specifically do not
    want external entities to be able to query any state event for any room, hence the
    restrictive API outlined here.

Request:
 - room_id is the room which has the state event.
 - user_id is the state_key parameter which in both cases is a user ID (the member or the bot).
 - No additional fields.
Response:
 - The event content. If there is no state event, the "response" key should be null.
Example:
{
    action: "membership_state",
    room_id: "!foo:bar",
    user_id: "@somemember:bar",
    response: {
        membership: "join",
        displayname: "Bob",
        avatar_url: null
    }
}

get_open_id_token
-----------------
Get an openID token for the current user session.
Request: No parameters
Response:
 - The openId token object as described in https://spec.matrix.org/v1.2/client-server-api/#post_matrixclientv3useruseridopenidrequest_token
*/
var Action;

(function (Action) {
  Action["CloseScalar"] = "close_scalar";
  Action["GetWidgets"] = "get_widgets";
  Action["SetWidget"] = "set_widget";
  Action["JoinRulesState"] = "join_rules_state";
  Action["SetPlumbingState"] = "set_plumbing_state";
  Action["GetMembershipCount"] = "get_membership_count";
  Action["GetRoomEncryptionState"] = "get_room_enc_state";
  Action["CanSendEvent"] = "can_send_event";
  Action["MembershipState"] = "membership_state";
  Action["invite"] = "invite";
  Action["BotOptions"] = "bot_options";
  Action["SetBotOptions"] = "set_bot_options";
  Action["SetBotPower"] = "set_bot_power";
  Action["GetOpenIdToken"] = "get_open_id_token";
})(Action || (Action = {}));

function sendResponse(event, res) {
  const data = (0, _objects.objectClone)(event.data);
  data.response = res; // @ts-ignore

  event.source.postMessage(data, event.origin);
}

function sendError(event, msg, nestedError) {
  _logger.logger.error("Action:" + event.data.action + " failed with message: " + msg);

  const data = (0, _objects.objectClone)(event.data);
  data.response = {
    error: {
      message: msg
    }
  };

  if (nestedError) {
    data.response.error._error = nestedError;
  } // @ts-ignore


  event.source.postMessage(data, event.origin);
}

function inviteUser(event, roomId, userId) {
  _logger.logger.log(`Received request to invite ${userId} into room ${roomId}`);

  const client = _MatrixClientPeg.MatrixClientPeg.get();

  if (!client) {
    sendError(event, (0, _languageHandler._t)('You need to be logged in.'));
    return;
  }

  const room = client.getRoom(roomId);

  if (room) {
    // if they are already invited or joined we can resolve immediately.
    const member = room.getMember(userId);

    if (member && ["join", "invite"].includes(member.membership)) {
      sendResponse(event, {
        success: true
      });
      return;
    }
  }

  client.invite(roomId, userId).then(function () {
    sendResponse(event, {
      success: true
    });
  }, function (err) {
    sendError(event, (0, _languageHandler._t)('You need to be able to invite users to do that.'), err);
  });
}

function setWidget(event, roomId) {
  const widgetId = event.data.widget_id;
  let widgetType = event.data.type;
  const widgetUrl = event.data.url;
  const widgetName = event.data.name; // optional

  const widgetData = event.data.data; // optional

  const widgetAvatarUrl = event.data.avatar_url; // optional

  const userWidget = event.data.userWidget; // both adding/removing widgets need these checks

  if (!widgetId || widgetUrl === undefined) {
    sendError(event, (0, _languageHandler._t)("Unable to create widget."), new Error("Missing required widget fields."));
    return;
  }

  if (widgetUrl !== null) {
    // if url is null it is being deleted, don't need to check name/type/etc
    // check types of fields
    if (widgetName !== undefined && typeof widgetName !== 'string') {
      sendError(event, (0, _languageHandler._t)("Unable to create widget."), new Error("Optional field 'name' must be a string."));
      return;
    }

    if (widgetData !== undefined && !(widgetData instanceof Object)) {
      sendError(event, (0, _languageHandler._t)("Unable to create widget."), new Error("Optional field 'data' must be an Object."));
      return;
    }

    if (widgetAvatarUrl !== undefined && typeof widgetAvatarUrl !== 'string') {
      sendError(event, (0, _languageHandler._t)("Unable to create widget."), new Error("Optional field 'avatar_url' must be a string."));
      return;
    }

    if (typeof widgetType !== 'string') {
      sendError(event, (0, _languageHandler._t)("Unable to create widget."), new Error("Field 'type' must be a string."));
      return;
    }

    if (typeof widgetUrl !== 'string') {
      sendError(event, (0, _languageHandler._t)("Unable to create widget."), new Error("Field 'url' must be a string or null."));
      return;
    }
  } // convert the widget type to a known widget type


  widgetType = _WidgetType.WidgetType.fromString(widgetType);

  if (userWidget) {
    _WidgetUtils.default.setUserWidget(widgetId, widgetType, widgetUrl, widgetName, widgetData).then(() => {
      sendResponse(event, {
        success: true
      });

      _dispatcher.default.dispatch({
        action: "user_widget_updated"
      });
    }).catch(e => {
      sendError(event, (0, _languageHandler._t)('Unable to create widget.'), e);
    });
  } else {
    // Room widget
    if (!roomId) {
      sendError(event, (0, _languageHandler._t)('Missing roomId.'), null);
    }

    _WidgetUtils.default.setRoomWidget(roomId, widgetId, widgetType, widgetUrl, widgetName, widgetData, widgetAvatarUrl).then(() => {
      sendResponse(event, {
        success: true
      });
    }, err => {
      sendError(event, (0, _languageHandler._t)('Failed to send request.'), err);
    });
  }
}

function getWidgets(event, roomId) {
  const client = _MatrixClientPeg.MatrixClientPeg.get();

  if (!client) {
    sendError(event, (0, _languageHandler._t)('You need to be logged in.'));
    return;
  }

  let widgetStateEvents = [];

  if (roomId) {
    const room = client.getRoom(roomId);

    if (!room) {
      sendError(event, (0, _languageHandler._t)('This room is not recognised.'));
      return;
    } // XXX: This gets the raw event object (I think because we can't
    // send the MatrixEvent over postMessage?)


    widgetStateEvents = _WidgetUtils.default.getRoomWidgets(room).map(ev => ev.event);
  } // Add user widgets (not linked to a specific room)


  const userWidgets = _WidgetUtils.default.getUserWidgetsArray();

  widgetStateEvents = widgetStateEvents.concat(userWidgets);
  sendResponse(event, widgetStateEvents);
}

function getRoomEncState(event, roomId) {
  const client = _MatrixClientPeg.MatrixClientPeg.get();

  if (!client) {
    sendError(event, (0, _languageHandler._t)('You need to be logged in.'));
    return;
  }

  const room = client.getRoom(roomId);

  if (!room) {
    sendError(event, (0, _languageHandler._t)('This room is not recognised.'));
    return;
  }

  const roomIsEncrypted = _MatrixClientPeg.MatrixClientPeg.get().isRoomEncrypted(roomId);

  sendResponse(event, roomIsEncrypted);
}

function setPlumbingState(event, roomId, status) {
  if (typeof status !== 'string') {
    throw new Error('Plumbing state status should be a string');
  }

  _logger.logger.log(`Received request to set plumbing state to status "${status}" in room ${roomId}`);

  const client = _MatrixClientPeg.MatrixClientPeg.get();

  if (!client) {
    sendError(event, (0, _languageHandler._t)('You need to be logged in.'));
    return;
  }

  client.sendStateEvent(roomId, "m.room.plumbing", {
    status: status
  }).then(() => {
    sendResponse(event, {
      success: true
    });
  }, err => {
    sendError(event, err.message ? err.message : (0, _languageHandler._t)('Failed to send request.'), err);
  });
}

function setBotOptions(event, roomId, userId) {
  _logger.logger.log(`Received request to set options for bot ${userId} in room ${roomId}`);

  const client = _MatrixClientPeg.MatrixClientPeg.get();

  if (!client) {
    sendError(event, (0, _languageHandler._t)('You need to be logged in.'));
    return;
  }

  client.sendStateEvent(roomId, "m.room.bot.options", event.data.content, "_" + userId).then(() => {
    sendResponse(event, {
      success: true
    });
  }, err => {
    sendError(event, err.message ? err.message : (0, _languageHandler._t)('Failed to send request.'), err);
  });
}

async function setBotPower(event, roomId, userId, level, ignoreIfGreater) {
  if (!(Number.isInteger(level) && level >= 0)) {
    sendError(event, (0, _languageHandler._t)('Power level must be positive integer.'));
    return;
  }

  _logger.logger.log(`Received request to set power level to ${level} for bot ${userId} in room ${roomId}.`);

  const client = _MatrixClientPeg.MatrixClientPeg.get();

  if (!client) {
    sendError(event, (0, _languageHandler._t)('You need to be logged in.'));
    return;
  }

  try {
    const powerLevels = await client.getStateEvent(roomId, "m.room.power_levels", ""); // If the PL is equal to or greater than the requested PL, ignore.

    if (ignoreIfGreater === true) {
      // As per https://matrix.org/docs/spec/client_server/r0.6.0#m-room-power-levels
      const currentPl = powerLevels.users?.[userId] ?? powerLevels.users_default ?? 0;

      if (currentPl >= level) {
        return sendResponse(event, {
          success: true
        });
      }
    }

    await client.setPowerLevel(roomId, userId, level, new _event.MatrixEvent({
      type: "m.room.power_levels",
      content: powerLevels
    }));
    return sendResponse(event, {
      success: true
    });
  } catch (err) {
    sendError(event, err.message ? err.message : (0, _languageHandler._t)('Failed to send request.'), err);
  }
}

function getMembershipState(event, roomId, userId) {
  _logger.logger.log(`membership_state of ${userId} in room ${roomId} requested.`);

  returnStateEvent(event, roomId, "m.room.member", userId);
}

function getJoinRules(event, roomId) {
  _logger.logger.log(`join_rules of ${roomId} requested.`);

  returnStateEvent(event, roomId, "m.room.join_rules", "");
}

function botOptions(event, roomId, userId) {
  _logger.logger.log(`bot_options of ${userId} in room ${roomId} requested.`);

  returnStateEvent(event, roomId, "m.room.bot.options", "_" + userId);
}

function getMembershipCount(event, roomId) {
  const client = _MatrixClientPeg.MatrixClientPeg.get();

  if (!client) {
    sendError(event, (0, _languageHandler._t)('You need to be logged in.'));
    return;
  }

  const room = client.getRoom(roomId);

  if (!room) {
    sendError(event, (0, _languageHandler._t)('This room is not recognised.'));
    return;
  }

  const count = room.getJoinedMemberCount();
  sendResponse(event, count);
}

function canSendEvent(event, roomId) {
  const evType = "" + event.data.event_type; // force stringify

  const isState = Boolean(event.data.is_state);

  const client = _MatrixClientPeg.MatrixClientPeg.get();

  if (!client) {
    sendError(event, (0, _languageHandler._t)('You need to be logged in.'));
    return;
  }

  const room = client.getRoom(roomId);

  if (!room) {
    sendError(event, (0, _languageHandler._t)('This room is not recognised.'));
    return;
  }

  if (room.getMyMembership() !== "join") {
    sendError(event, (0, _languageHandler._t)('You are not in this room.'));
    return;
  }

  const me = client.credentials.userId;
  let canSend = false;

  if (isState) {
    canSend = room.currentState.maySendStateEvent(evType, me);
  } else {
    canSend = room.currentState.maySendEvent(evType, me);
  }

  if (!canSend) {
    sendError(event, (0, _languageHandler._t)('You do not have permission to do that in this room.'));
    return;
  }

  sendResponse(event, true);
}

function returnStateEvent(event, roomId, eventType, stateKey) {
  const client = _MatrixClientPeg.MatrixClientPeg.get();

  if (!client) {
    sendError(event, (0, _languageHandler._t)('You need to be logged in.'));
    return;
  }

  const room = client.getRoom(roomId);

  if (!room) {
    sendError(event, (0, _languageHandler._t)('This room is not recognised.'));
    return;
  }

  const stateEvent = room.currentState.getStateEvents(eventType, stateKey);

  if (!stateEvent) {
    sendResponse(event, null);
    return;
  }

  sendResponse(event, stateEvent.getContent());
}

async function getOpenIdToken(event) {
  try {
    const tokenObject = _MatrixClientPeg.MatrixClientPeg.get().getOpenIdToken();

    sendResponse(event, tokenObject);
  } catch (ex) {
    _logger.logger.warn("Unable to fetch openId token.", ex);

    sendError(event, 'Unable to fetch openId token.');
  }
}

const onMessage = function (event) {
  if (!event.origin) {
    // stupid chrome
    // @ts-ignore
    event.origin = event.originalEvent.origin;
  } // Check that the integrations UI URL starts with the origin of the event
  // This means the URL could contain a path (like /develop) and still be used
  // to validate event origins, which do not specify paths.
  // (See https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)


  let configUrl;

  try {
    if (!openManagerUrl) openManagerUrl = _IntegrationManagers.IntegrationManagers.sharedInstance().getPrimaryManager().uiUrl;
    configUrl = new URL(openManagerUrl);
  } catch (e) {
    // No integrations UI URL, ignore silently.
    return;
  }

  let eventOriginUrl;

  try {
    eventOriginUrl = new URL(event.origin);
  } catch (e) {
    return;
  } // TODO -- Scalar postMessage API should be namespaced with event.data.api field
  // Fix following "if" statement to respond only to specific API messages.


  if (configUrl.origin !== eventOriginUrl.origin || !event.data.action || event.data.api // Ignore messages with specific API set
  ) {
    // don't log this - debugging APIs and browser add-ons like to spam
    // postMessage which floods the log otherwise
    return;
  }

  if (event.data.action === Action.CloseScalar) {
    _dispatcher.default.dispatch({
      action: Action.CloseScalar
    });

    sendResponse(event, null);
    return;
  }

  const roomId = event.data.room_id;
  const userId = event.data.user_id;

  if (!roomId) {
    // These APIs don't require roomId
    // Get and set user widgets (not associated with a specific room)
    // If roomId is specified, it must be validated, so room-based widgets agreed
    // handled further down.
    if (event.data.action === Action.GetWidgets) {
      getWidgets(event, null);
      return;
    } else if (event.data.action === Action.SetWidget) {
      setWidget(event, null);
      return;
    } else {
      sendError(event, (0, _languageHandler._t)('Missing room_id in request'));
      return;
    }
  }

  if (roomId !== _RoomViewStore.RoomViewStore.instance.getRoomId()) {
    sendError(event, (0, _languageHandler._t)('Room %(roomId)s not visible', {
      roomId: roomId
    }));
    return;
  } // Get and set room-based widgets


  if (event.data.action === Action.GetWidgets) {
    getWidgets(event, roomId);
    return;
  } else if (event.data.action === Action.SetWidget) {
    setWidget(event, roomId);
    return;
  } // These APIs don't require userId


  if (event.data.action === Action.JoinRulesState) {
    getJoinRules(event, roomId);
    return;
  } else if (event.data.action === Action.SetPlumbingState) {
    setPlumbingState(event, roomId, event.data.status);
    return;
  } else if (event.data.action === Action.GetMembershipCount) {
    getMembershipCount(event, roomId);
    return;
  } else if (event.data.action === Action.GetRoomEncryptionState) {
    getRoomEncState(event, roomId);
    return;
  } else if (event.data.action === Action.CanSendEvent) {
    canSendEvent(event, roomId);
    return;
  }

  if (!userId) {
    sendError(event, (0, _languageHandler._t)('Missing user_id in request'));
    return;
  }

  switch (event.data.action) {
    case Action.MembershipState:
      getMembershipState(event, roomId, userId);
      break;

    case Action.invite:
      inviteUser(event, roomId, userId);
      break;

    case Action.BotOptions:
      botOptions(event, roomId, userId);
      break;

    case Action.SetBotOptions:
      setBotOptions(event, roomId, userId);
      break;

    case Action.SetBotPower:
      setBotPower(event, roomId, userId, event.data.level, event.data.ignoreIfGreater);
      break;

    case Action.GetOpenIdToken:
      getOpenIdToken(event);
      break;

    default:
      _logger.logger.warn("Unhandled postMessage event with action '" + event.data.action + "'");

      break;
  }
};

let listenerCount = 0;
let openManagerUrl = null;

function startListening() {
  if (listenerCount === 0) {
    window.addEventListener("message", onMessage, false);
  }

  listenerCount += 1;
}

function stopListening() {
  listenerCount -= 1;

  if (listenerCount === 0) {
    window.removeEventListener("message", onMessage);
  }

  if (listenerCount < 0) {
    // Make an error so we get a stack trace
    const e = new Error("ScalarMessaging: mismatched startListening / stopListening detected." + " Negative count");

    _logger.logger.error(e);
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBY3Rpb24iLCJzZW5kUmVzcG9uc2UiLCJldmVudCIsInJlcyIsImRhdGEiLCJvYmplY3RDbG9uZSIsInJlc3BvbnNlIiwic291cmNlIiwicG9zdE1lc3NhZ2UiLCJvcmlnaW4iLCJzZW5kRXJyb3IiLCJtc2ciLCJuZXN0ZWRFcnJvciIsImxvZ2dlciIsImVycm9yIiwiYWN0aW9uIiwibWVzc2FnZSIsIl9lcnJvciIsImludml0ZVVzZXIiLCJyb29tSWQiLCJ1c2VySWQiLCJsb2ciLCJjbGllbnQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJfdCIsInJvb20iLCJnZXRSb29tIiwibWVtYmVyIiwiZ2V0TWVtYmVyIiwiaW5jbHVkZXMiLCJtZW1iZXJzaGlwIiwic3VjY2VzcyIsImludml0ZSIsInRoZW4iLCJlcnIiLCJzZXRXaWRnZXQiLCJ3aWRnZXRJZCIsIndpZGdldF9pZCIsIndpZGdldFR5cGUiLCJ0eXBlIiwid2lkZ2V0VXJsIiwidXJsIiwid2lkZ2V0TmFtZSIsIm5hbWUiLCJ3aWRnZXREYXRhIiwid2lkZ2V0QXZhdGFyVXJsIiwiYXZhdGFyX3VybCIsInVzZXJXaWRnZXQiLCJ1bmRlZmluZWQiLCJFcnJvciIsIk9iamVjdCIsIldpZGdldFR5cGUiLCJmcm9tU3RyaW5nIiwiV2lkZ2V0VXRpbHMiLCJzZXRVc2VyV2lkZ2V0IiwiZGlzIiwiZGlzcGF0Y2giLCJjYXRjaCIsImUiLCJzZXRSb29tV2lkZ2V0IiwiZ2V0V2lkZ2V0cyIsIndpZGdldFN0YXRlRXZlbnRzIiwiZ2V0Um9vbVdpZGdldHMiLCJtYXAiLCJldiIsInVzZXJXaWRnZXRzIiwiZ2V0VXNlcldpZGdldHNBcnJheSIsImNvbmNhdCIsImdldFJvb21FbmNTdGF0ZSIsInJvb21Jc0VuY3J5cHRlZCIsImlzUm9vbUVuY3J5cHRlZCIsInNldFBsdW1iaW5nU3RhdGUiLCJzdGF0dXMiLCJzZW5kU3RhdGVFdmVudCIsInNldEJvdE9wdGlvbnMiLCJjb250ZW50Iiwic2V0Qm90UG93ZXIiLCJsZXZlbCIsImlnbm9yZUlmR3JlYXRlciIsIk51bWJlciIsImlzSW50ZWdlciIsInBvd2VyTGV2ZWxzIiwiZ2V0U3RhdGVFdmVudCIsImN1cnJlbnRQbCIsInVzZXJzIiwidXNlcnNfZGVmYXVsdCIsInNldFBvd2VyTGV2ZWwiLCJNYXRyaXhFdmVudCIsImdldE1lbWJlcnNoaXBTdGF0ZSIsInJldHVyblN0YXRlRXZlbnQiLCJnZXRKb2luUnVsZXMiLCJib3RPcHRpb25zIiwiZ2V0TWVtYmVyc2hpcENvdW50IiwiY291bnQiLCJnZXRKb2luZWRNZW1iZXJDb3VudCIsImNhblNlbmRFdmVudCIsImV2VHlwZSIsImV2ZW50X3R5cGUiLCJpc1N0YXRlIiwiQm9vbGVhbiIsImlzX3N0YXRlIiwiZ2V0TXlNZW1iZXJzaGlwIiwibWUiLCJjcmVkZW50aWFscyIsImNhblNlbmQiLCJjdXJyZW50U3RhdGUiLCJtYXlTZW5kU3RhdGVFdmVudCIsIm1heVNlbmRFdmVudCIsImV2ZW50VHlwZSIsInN0YXRlS2V5Iiwic3RhdGVFdmVudCIsImdldFN0YXRlRXZlbnRzIiwiZ2V0Q29udGVudCIsImdldE9wZW5JZFRva2VuIiwidG9rZW5PYmplY3QiLCJleCIsIndhcm4iLCJvbk1lc3NhZ2UiLCJvcmlnaW5hbEV2ZW50IiwiY29uZmlnVXJsIiwib3Blbk1hbmFnZXJVcmwiLCJJbnRlZ3JhdGlvbk1hbmFnZXJzIiwic2hhcmVkSW5zdGFuY2UiLCJnZXRQcmltYXJ5TWFuYWdlciIsInVpVXJsIiwiVVJMIiwiZXZlbnRPcmlnaW5VcmwiLCJhcGkiLCJDbG9zZVNjYWxhciIsInJvb21faWQiLCJ1c2VyX2lkIiwiR2V0V2lkZ2V0cyIsIlNldFdpZGdldCIsIlJvb21WaWV3U3RvcmUiLCJpbnN0YW5jZSIsImdldFJvb21JZCIsIkpvaW5SdWxlc1N0YXRlIiwiU2V0UGx1bWJpbmdTdGF0ZSIsIkdldE1lbWJlcnNoaXBDb3VudCIsIkdldFJvb21FbmNyeXB0aW9uU3RhdGUiLCJDYW5TZW5kRXZlbnQiLCJNZW1iZXJzaGlwU3RhdGUiLCJCb3RPcHRpb25zIiwiU2V0Qm90T3B0aW9ucyIsIlNldEJvdFBvd2VyIiwiR2V0T3BlbklkVG9rZW4iLCJsaXN0ZW5lckNvdW50Iiwic3RhcnRMaXN0ZW5pbmciLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwic3RvcExpc3RlbmluZyIsInJlbW92ZUV2ZW50TGlzdGVuZXIiXSwic291cmNlcyI6WyIuLi9zcmMvU2NhbGFyTWVzc2FnaW5nLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTcgVmVjdG9yIENyZWF0aW9ucyBMdGRcbkNvcHlyaWdodCAyMDE4IE5ldyBWZWN0b3IgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuLy8gVE9ETzogR2VuZXJpZnkgdGhlIG5hbWUgb2YgdGhpcyBhbmQgYWxsIGNvbXBvbmVudHMgd2l0aGluIC0gaXQncyBub3QganVzdCBmb3Igc2NhbGFyLlxuXG4vKlxuTGlzdGVucyBmb3IgaW5jb21pbmcgcG9zdE1lc3NhZ2UgcmVxdWVzdHMgZnJvbSB0aGUgaW50ZWdyYXRpb25zIFVJIFVSTC4gVGhlIGZvbGxvd2luZyBBUEkgaXMgZXhwb3NlZDpcbntcbiAgICBhY3Rpb246IFwiaW52aXRlXCIgfCBcIm1lbWJlcnNoaXBfc3RhdGVcIiB8IFwiYm90X29wdGlvbnNcIiB8IFwic2V0X2JvdF9vcHRpb25zXCIgfCBldGMuLi4gLFxuICAgIHJvb21faWQ6ICRST09NX0lELFxuICAgIHVzZXJfaWQ6ICRVU0VSX0lEXG4gICAgLy8gYWRkaXRpb25hbCByZXF1ZXN0IGZpZWxkc1xufVxuXG5UaGUgY29tcGxldGUgcmVxdWVzdCBvYmplY3QgaXMgcmV0dXJuZWQgdG8gdGhlIGNhbGxlciB3aXRoIGFuIGFkZGl0aW9uYWwgXCJyZXNwb25zZVwiIGtleSBsaWtlIHNvOlxue1xuICAgIGFjdGlvbjogXCJpbnZpdGVcIiB8IFwibWVtYmVyc2hpcF9zdGF0ZVwiIHwgXCJib3Rfb3B0aW9uc1wiIHwgXCJzZXRfYm90X29wdGlvbnNcIixcbiAgICByb29tX2lkOiAkUk9PTV9JRCxcbiAgICB1c2VyX2lkOiAkVVNFUl9JRCxcbiAgICAvLyBhZGRpdGlvbmFsIHJlcXVlc3QgZmllbGRzXG4gICAgcmVzcG9uc2U6IHsgLi4uIH1cbn1cblxuVGhlIFwiYWN0aW9uXCIgZGV0ZXJtaW5lcyB0aGUgZm9ybWF0IG9mIHRoZSByZXF1ZXN0IGFuZCByZXNwb25zZS4gQWxsIGFjdGlvbnMgY2FuIHJldHVybiBhbiBlcnJvciByZXNwb25zZS5cbkFuIGVycm9yIHJlc3BvbnNlIGlzIGEgXCJyZXNwb25zZVwiIG9iamVjdCB3aGljaCBjb25zaXN0cyBvZiBhIHNvbGUgXCJlcnJvclwiIGtleSB0byBpbmRpY2F0ZSBhbiBlcnJvci5cblRoZXkgbG9vayBsaWtlOlxue1xuICAgIGVycm9yOiB7XG4gICAgICAgIG1lc3NhZ2U6IFwiVW5hYmxlIHRvIGludml0ZSB1c2VyIGludG8gcm9vbS5cIixcbiAgICAgICAgX2Vycm9yOiA8T3JpZ2luYWwgRXJyb3IgT2JqZWN0PlxuICAgIH1cbn1cblRoZSBcIm1lc3NhZ2VcIiBrZXkgc2hvdWxkIGJlIGEgaHVtYW4tZnJpZW5kbHkgc3RyaW5nLlxuXG5BQ1RJT05TXG49PT09PT09XG5BbGwgYWN0aW9ucyBjYW4gcmV0dXJuIGFuIGVycm9yIHJlc3BvbnNlIGluc3RlYWQgb2YgdGhlIHJlc3BvbnNlIG91dGxpbmVkIGJlbG93LlxuXG5pbnZpdGVcbi0tLS0tLVxuSW52aXRlcyBhIHVzZXIgaW50byBhIHJvb20uIFRoZSByZXF1ZXN0IHdpbGwgbm8tb3AgaWYgdGhlIHVzZXIgaXMgYWxyZWFkeSBqb2luZWQgT1IgaW52aXRlZCB0byB0aGUgcm9vbS5cblxuUmVxdWVzdDpcbiAtIHJvb21faWQgaXMgdGhlIHJvb20gdG8gaW52aXRlIHRoZSB1c2VyIGludG8uXG4gLSB1c2VyX2lkIGlzIHRoZSB1c2VyIElEIHRvIGludml0ZS5cbiAtIE5vIGFkZGl0aW9uYWwgZmllbGRzLlxuUmVzcG9uc2U6XG57XG4gICAgc3VjY2VzczogdHJ1ZVxufVxuRXhhbXBsZTpcbntcbiAgICBhY3Rpb246IFwiaW52aXRlXCIsXG4gICAgcm9vbV9pZDogXCIhZm9vOmJhclwiLFxuICAgIHVzZXJfaWQ6IFwiQGludml0ZWU6YmFyXCIsXG4gICAgcmVzcG9uc2U6IHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZVxuICAgIH1cbn1cblxuc2V0X2JvdF9vcHRpb25zXG4tLS0tLS0tLS0tLS0tLS1cblNldCB0aGUgbS5yb29tLmJvdC5vcHRpb25zIHN0YXRlIGV2ZW50IGZvciBhIGJvdCB1c2VyLlxuXG5SZXF1ZXN0OlxuIC0gcm9vbV9pZCBpcyB0aGUgcm9vbSB0byBzZW5kIHRoZSBzdGF0ZSBldmVudCBpbnRvLlxuIC0gdXNlcl9pZCBpcyB0aGUgdXNlciBJRCBvZiB0aGUgYm90IHdobyB5b3UncmUgc2V0dGluZyBvcHRpb25zIGZvci5cbiAtIFwiY29udGVudFwiIGlzIGFuIG9iamVjdCBjb25zaXN0aW5nIG9mIHRoZSBjb250ZW50IHlvdSB3aXNoIHRvIHNldC5cblJlc3BvbnNlOlxue1xuICAgIHN1Y2Nlc3M6IHRydWVcbn1cbkV4YW1wbGU6XG57XG4gICAgYWN0aW9uOiBcInNldF9ib3Rfb3B0aW9uc1wiLFxuICAgIHJvb21faWQ6IFwiIWZvbzpiYXJcIixcbiAgICB1c2VyX2lkOiBcIkBib3Q6YmFyXCIsXG4gICAgY29udGVudDoge1xuICAgICAgICBkZWZhdWx0X29wdGlvbjogXCJhbHBoYVwiXG4gICAgfSxcbiAgICByZXNwb25zZToge1xuICAgICAgICBzdWNjZXNzOiB0cnVlXG4gICAgfVxufVxuXG5nZXRfbWVtYmVyc2hpcF9jb3VudFxuLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkdldCB0aGUgbnVtYmVyIG9mIGpvaW5lZCB1c2VycyBpbiB0aGUgcm9vbS5cblxuUmVxdWVzdDpcbiAtIHJvb21faWQgaXMgdGhlIHJvb20gdG8gZ2V0IHRoZSBjb3VudCBpbi5cblJlc3BvbnNlOlxuNzhcbkV4YW1wbGU6XG57XG4gICAgYWN0aW9uOiBcImdldF9tZW1iZXJzaGlwX2NvdW50XCIsXG4gICAgcm9vbV9pZDogXCIhZm9vOmJhclwiLFxuICAgIHJlc3BvbnNlOiA3OFxufVxuXG5jYW5fc2VuZF9ldmVudFxuLS0tLS0tLS0tLS0tLS1cbkNoZWNrIGlmIHRoZSBjbGllbnQgY2FuIHNlbmQgdGhlIGdpdmVuIGV2ZW50IGludG8gdGhlIGdpdmVuIHJvb20uIElmIHRoZSBjbGllbnRcbmlzIHVuYWJsZSB0byBkbyB0aGlzLCBhbiBlcnJvciByZXNwb25zZSBpcyByZXR1cm5lZCBpbnN0ZWFkIG9mICdyZXNwb25zZTogZmFsc2UnLlxuXG5SZXF1ZXN0OlxuIC0gcm9vbV9pZCBpcyB0aGUgcm9vbSB0byBkbyB0aGUgY2hlY2sgaW4uXG4gLSBldmVudF90eXBlIGlzIHRoZSBldmVudCB0eXBlIHdoaWNoIHdpbGwgYmUgc2VudC5cbiAtIGlzX3N0YXRlIGlzIHRydWUgaWYgdGhlIGV2ZW50IHRvIGJlIHNlbnQgaXMgYSBzdGF0ZSBldmVudC5cblJlc3BvbnNlOlxudHJ1ZVxuRXhhbXBsZTpcbntcbiAgICBhY3Rpb246IFwiY2FuX3NlbmRfZXZlbnRcIixcbiAgICBpc19zdGF0ZTogZmFsc2UsXG4gICAgZXZlbnRfdHlwZTogXCJtLnJvb20ubWVzc2FnZVwiLFxuICAgIHJvb21faWQ6IFwiIWZvbzpiYXJcIixcbiAgICByZXNwb25zZTogdHJ1ZVxufVxuXG5zZXRfd2lkZ2V0XG4tLS0tLS0tLS0tXG5TZXQgYSBuZXcgd2lkZ2V0IGluIHRoZSByb29tLiBDbG9iYmVycyBiYXNlZCBvbiB0aGUgSUQuXG5cblJlcXVlc3Q6XG4gLSBgcm9vbV9pZGAgKFN0cmluZykgaXMgdGhlIHJvb20gdG8gc2V0IHRoZSB3aWRnZXQgaW4uXG4gLSBgd2lkZ2V0X2lkYCAoU3RyaW5nKSBpcyB0aGUgSUQgb2YgdGhlIHdpZGdldCB0byBhZGQgKG9yIHJlcGxhY2UgaWYgaXQgYWxyZWFkeSBleGlzdHMpLlxuICAgSXQgY2FuIGJlIGFuIGFyYml0cmFyeSBVVEY4IHN0cmluZyBhbmQgaXMgcHVyZWx5IGZvciBkaXN0aW5ndWlzaGluZyBiZXR3ZWVuIHdpZGdldHMuXG4gLSBgdXJsYCAoU3RyaW5nKSBpcyB0aGUgVVJMIHRoYXQgY2xpZW50cyBzaG91bGQgbG9hZCBpbiBhbiBpZnJhbWUgdG8gcnVuIHRoZSB3aWRnZXQuXG4gICBBbGwgd2lkZ2V0cyBtdXN0IGhhdmUgYSB2YWxpZCBVUkwuIElmIHRoZSBVUkwgaXMgYG51bGxgIChub3QgYHVuZGVmaW5lZGApLCB0aGVcbiAgIHdpZGdldCB3aWxsIGJlIHJlbW92ZWQgZnJvbSB0aGUgcm9vbS5cbiAtIGB0eXBlYCAoU3RyaW5nKSBpcyB0aGUgdHlwZSBvZiB3aWRnZXQsIHdoaWNoIGlzIHByb3ZpZGVkIGFzIGEgaGludCBmb3IgbWF0cml4IGNsaWVudHMgc28gdGhleVxuICAgY2FuIGNvbmZpZ3VyZS9sYXkgb3V0IHRoZSB3aWRnZXQgaW4gZGlmZmVyZW50IHdheXMuIEFsbCB3aWRnZXRzIG11c3QgaGF2ZSBhIHR5cGUuXG4gLSBgbmFtZWAgKFN0cmluZykgaXMgYW4gb3B0aW9uYWwgaHVtYW4tcmVhZGFibGUgc3RyaW5nIGFib3V0IHRoZSB3aWRnZXQuXG4gLSBgZGF0YWAgKE9iamVjdCkgaXMgc29tZSBvcHRpb25hbCBkYXRhIGFib3V0IHRoZSB3aWRnZXQsIGFuZCBjYW4gY29udGFpbiBhcmJpdHJhcnkga2V5L3ZhbHVlIHBhaXJzLlxuIC0gYGF2YXRhcl91cmxgIChTdHJpbmcpIGlzIHNvbWUgb3B0aW9uYWwgbXhjOiBVUkkgcG9pbnRpbmcgdG8gdGhlIGF2YXRhciBvZiB0aGUgd2lkZ2V0LlxuUmVzcG9uc2U6XG57XG4gICAgc3VjY2VzczogdHJ1ZVxufVxuRXhhbXBsZTpcbntcbiAgICBhY3Rpb246IFwic2V0X3dpZGdldFwiLFxuICAgIHJvb21faWQ6IFwiIWZvbzpiYXJcIixcbiAgICB3aWRnZXRfaWQ6IFwiYWJjMTIzXCIsXG4gICAgdXJsOiBcImh0dHA6Ly93aWRnZXQudXJsXCIsXG4gICAgdHlwZTogXCJleGFtcGxlXCIsXG4gICAgcmVzcG9uc2U6IHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZVxuICAgIH1cbn1cblxuZ2V0X3dpZGdldHNcbi0tLS0tLS0tLS0tXG5HZXQgYSBsaXN0IG9mIGFsbCB3aWRnZXRzIGluIHRoZSByb29tLiBUaGUgcmVzcG9uc2UgaXMgYW4gYXJyYXlcbm9mIHN0YXRlIGV2ZW50cy5cblxuUmVxdWVzdDpcbiAtIGByb29tX2lkYCAoU3RyaW5nKSBpcyB0aGUgcm9vbSB0byBnZXQgdGhlIHdpZGdldHMgaW4uXG5SZXNwb25zZTpcbltcbiAgICB7XG4gICAgICAgIC8vIFRPRE86IEVuYWJsZSBzdXBwb3J0IGZvciBtLndpZGdldCBldmVudCB0eXBlIChodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xMzExMSlcbiAgICAgICAgdHlwZTogXCJpbS52ZWN0b3IubW9kdWxhci53aWRnZXRzXCIsXG4gICAgICAgIHN0YXRlX2tleTogXCJ3aWQxXCIsXG4gICAgICAgIGNvbnRlbnQ6IHtcbiAgICAgICAgICAgIHR5cGU6IFwiZ3JhZmFuYVwiLFxuICAgICAgICAgICAgdXJsOiBcImh0dHBzOi8vZ3JhZmFuYXVybFwiLFxuICAgICAgICAgICAgbmFtZTogXCJkYXNoYm9hcmRcIixcbiAgICAgICAgICAgIGRhdGE6IHtrZXk6IFwidmFsXCJ9XG4gICAgICAgIH1cbiAgICAgICAgcm9vbV9pZDogXCIhZm9vOmJhclwiLFxuICAgICAgICBzZW5kZXI6IFwiQGFsaWNlOmxvY2FsaG9zdFwiXG4gICAgfVxuXVxuRXhhbXBsZTpcbntcbiAgICBhY3Rpb246IFwiZ2V0X3dpZGdldHNcIixcbiAgICByb29tX2lkOiBcIiFmb286YmFyXCIsXG4gICAgcmVzcG9uc2U6IFtcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gVE9ETzogRW5hYmxlIHN1cHBvcnQgZm9yIG0ud2lkZ2V0IGV2ZW50IHR5cGUgKGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzEzMTExKVxuICAgICAgICAgICAgdHlwZTogXCJpbS52ZWN0b3IubW9kdWxhci53aWRnZXRzXCIsXG4gICAgICAgICAgICBzdGF0ZV9rZXk6IFwid2lkMVwiLFxuICAgICAgICAgICAgY29udGVudDoge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiZ3JhZmFuYVwiLFxuICAgICAgICAgICAgICAgIHVybDogXCJodHRwczovL2dyYWZhbmF1cmxcIixcbiAgICAgICAgICAgICAgICBuYW1lOiBcImRhc2hib2FyZFwiLFxuICAgICAgICAgICAgICAgIGRhdGE6IHtrZXk6IFwidmFsXCJ9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByb29tX2lkOiBcIiFmb286YmFyXCIsXG4gICAgICAgICAgICBzZW5kZXI6IFwiQGFsaWNlOmxvY2FsaG9zdFwiXG4gICAgICAgIH1cbiAgICBdXG59XG5cbm1lbWJlcnNoaXBfc3RhdGUgQU5EIGJvdF9vcHRpb25zXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuR2V0IHRoZSBjb250ZW50IG9mIHRoZSBcIm0ucm9vbS5tZW1iZXJcIiBvciBcIm0ucm9vbS5ib3Qub3B0aW9uc1wiIHN0YXRlIGV2ZW50IHJlc3BlY3RpdmVseS5cblxuTkI6IFdoaWxzdCB0aGlzIEFQSSBpcyBiYXNpY2FsbHkgZXF1aXZhbGVudCB0byBnZXRTdGF0ZUV2ZW50LCB3ZSBzcGVjaWZpY2FsbHkgZG8gbm90XG4gICAgd2FudCBleHRlcm5hbCBlbnRpdGllcyB0byBiZSBhYmxlIHRvIHF1ZXJ5IGFueSBzdGF0ZSBldmVudCBmb3IgYW55IHJvb20sIGhlbmNlIHRoZVxuICAgIHJlc3RyaWN0aXZlIEFQSSBvdXRsaW5lZCBoZXJlLlxuXG5SZXF1ZXN0OlxuIC0gcm9vbV9pZCBpcyB0aGUgcm9vbSB3aGljaCBoYXMgdGhlIHN0YXRlIGV2ZW50LlxuIC0gdXNlcl9pZCBpcyB0aGUgc3RhdGVfa2V5IHBhcmFtZXRlciB3aGljaCBpbiBib3RoIGNhc2VzIGlzIGEgdXNlciBJRCAodGhlIG1lbWJlciBvciB0aGUgYm90KS5cbiAtIE5vIGFkZGl0aW9uYWwgZmllbGRzLlxuUmVzcG9uc2U6XG4gLSBUaGUgZXZlbnQgY29udGVudC4gSWYgdGhlcmUgaXMgbm8gc3RhdGUgZXZlbnQsIHRoZSBcInJlc3BvbnNlXCIga2V5IHNob3VsZCBiZSBudWxsLlxuRXhhbXBsZTpcbntcbiAgICBhY3Rpb246IFwibWVtYmVyc2hpcF9zdGF0ZVwiLFxuICAgIHJvb21faWQ6IFwiIWZvbzpiYXJcIixcbiAgICB1c2VyX2lkOiBcIkBzb21lbWVtYmVyOmJhclwiLFxuICAgIHJlc3BvbnNlOiB7XG4gICAgICAgIG1lbWJlcnNoaXA6IFwiam9pblwiLFxuICAgICAgICBkaXNwbGF5bmFtZTogXCJCb2JcIixcbiAgICAgICAgYXZhdGFyX3VybDogbnVsbFxuICAgIH1cbn1cblxuZ2V0X29wZW5faWRfdG9rZW5cbi0tLS0tLS0tLS0tLS0tLS0tXG5HZXQgYW4gb3BlbklEIHRva2VuIGZvciB0aGUgY3VycmVudCB1c2VyIHNlc3Npb24uXG5SZXF1ZXN0OiBObyBwYXJhbWV0ZXJzXG5SZXNwb25zZTpcbiAtIFRoZSBvcGVuSWQgdG9rZW4gb2JqZWN0IGFzIGRlc2NyaWJlZCBpbiBodHRwczovL3NwZWMubWF0cml4Lm9yZy92MS4yL2NsaWVudC1zZXJ2ZXItYXBpLyNwb3N0X21hdHJpeGNsaWVudHYzdXNlcnVzZXJpZG9wZW5pZHJlcXVlc3RfdG9rZW5cbiovXG5cbmltcG9ydCB7IE1hdHJpeEV2ZW50IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50JztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcblxuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSAnLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IGRpcyBmcm9tICcuL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgV2lkZ2V0VXRpbHMgZnJvbSAnLi91dGlscy9XaWRnZXRVdGlscyc7XG5pbXBvcnQgeyBSb29tVmlld1N0b3JlIH0gZnJvbSAnLi9zdG9yZXMvUm9vbVZpZXdTdG9yZSc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7IEludGVncmF0aW9uTWFuYWdlcnMgfSBmcm9tIFwiLi9pbnRlZ3JhdGlvbnMvSW50ZWdyYXRpb25NYW5hZ2Vyc1wiO1xuaW1wb3J0IHsgV2lkZ2V0VHlwZSB9IGZyb20gXCIuL3dpZGdldHMvV2lkZ2V0VHlwZVwiO1xuaW1wb3J0IHsgb2JqZWN0Q2xvbmUgfSBmcm9tIFwiLi91dGlscy9vYmplY3RzXCI7XG5cbmVudW0gQWN0aW9uIHtcbiAgICBDbG9zZVNjYWxhciA9IFwiY2xvc2Vfc2NhbGFyXCIsXG4gICAgR2V0V2lkZ2V0cyA9IFwiZ2V0X3dpZGdldHNcIixcbiAgICBTZXRXaWRnZXQgPSBcInNldF93aWRnZXRcIixcbiAgICBKb2luUnVsZXNTdGF0ZSA9IFwiam9pbl9ydWxlc19zdGF0ZVwiLFxuICAgIFNldFBsdW1iaW5nU3RhdGUgPSBcInNldF9wbHVtYmluZ19zdGF0ZVwiLFxuICAgIEdldE1lbWJlcnNoaXBDb3VudCA9IFwiZ2V0X21lbWJlcnNoaXBfY291bnRcIixcbiAgICBHZXRSb29tRW5jcnlwdGlvblN0YXRlID0gXCJnZXRfcm9vbV9lbmNfc3RhdGVcIixcbiAgICBDYW5TZW5kRXZlbnQgPSBcImNhbl9zZW5kX2V2ZW50XCIsXG4gICAgTWVtYmVyc2hpcFN0YXRlID0gXCJtZW1iZXJzaGlwX3N0YXRlXCIsXG4gICAgaW52aXRlID0gXCJpbnZpdGVcIixcbiAgICBCb3RPcHRpb25zID0gXCJib3Rfb3B0aW9uc1wiLFxuICAgIFNldEJvdE9wdGlvbnMgPSBcInNldF9ib3Rfb3B0aW9uc1wiLFxuICAgIFNldEJvdFBvd2VyID0gXCJzZXRfYm90X3Bvd2VyXCIsXG4gICAgR2V0T3BlbklkVG9rZW4gPSBcImdldF9vcGVuX2lkX3Rva2VuXCJcbn1cblxuZnVuY3Rpb24gc2VuZFJlc3BvbnNlKGV2ZW50OiBNZXNzYWdlRXZlbnQ8YW55PiwgcmVzOiBhbnkpOiB2b2lkIHtcbiAgICBjb25zdCBkYXRhID0gb2JqZWN0Q2xvbmUoZXZlbnQuZGF0YSk7XG4gICAgZGF0YS5yZXNwb25zZSA9IHJlcztcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgZXZlbnQuc291cmNlLnBvc3RNZXNzYWdlKGRhdGEsIGV2ZW50Lm9yaWdpbik7XG59XG5cbmZ1bmN0aW9uIHNlbmRFcnJvcihldmVudDogTWVzc2FnZUV2ZW50PGFueT4sIG1zZzogc3RyaW5nLCBuZXN0ZWRFcnJvcj86IEVycm9yKTogdm9pZCB7XG4gICAgbG9nZ2VyLmVycm9yKFwiQWN0aW9uOlwiICsgZXZlbnQuZGF0YS5hY3Rpb24gKyBcIiBmYWlsZWQgd2l0aCBtZXNzYWdlOiBcIiArIG1zZyk7XG4gICAgY29uc3QgZGF0YSA9IG9iamVjdENsb25lKGV2ZW50LmRhdGEpO1xuICAgIGRhdGEucmVzcG9uc2UgPSB7XG4gICAgICAgIGVycm9yOiB7XG4gICAgICAgICAgICBtZXNzYWdlOiBtc2csXG4gICAgICAgIH0sXG4gICAgfTtcbiAgICBpZiAobmVzdGVkRXJyb3IpIHtcbiAgICAgICAgZGF0YS5yZXNwb25zZS5lcnJvci5fZXJyb3IgPSBuZXN0ZWRFcnJvcjtcbiAgICB9XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGV2ZW50LnNvdXJjZS5wb3N0TWVzc2FnZShkYXRhLCBldmVudC5vcmlnaW4pO1xufVxuXG5mdW5jdGlvbiBpbnZpdGVVc2VyKGV2ZW50OiBNZXNzYWdlRXZlbnQ8YW55Piwgcm9vbUlkOiBzdHJpbmcsIHVzZXJJZDogc3RyaW5nKTogdm9pZCB7XG4gICAgbG9nZ2VyLmxvZyhgUmVjZWl2ZWQgcmVxdWVzdCB0byBpbnZpdGUgJHt1c2VySWR9IGludG8gcm9vbSAke3Jvb21JZH1gKTtcbiAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgaWYgKCFjbGllbnQpIHtcbiAgICAgICAgc2VuZEVycm9yKGV2ZW50LCBfdCgnWW91IG5lZWQgdG8gYmUgbG9nZ2VkIGluLicpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCByb29tID0gY2xpZW50LmdldFJvb20ocm9vbUlkKTtcbiAgICBpZiAocm9vbSkge1xuICAgICAgICAvLyBpZiB0aGV5IGFyZSBhbHJlYWR5IGludml0ZWQgb3Igam9pbmVkIHdlIGNhbiByZXNvbHZlIGltbWVkaWF0ZWx5LlxuICAgICAgICBjb25zdCBtZW1iZXIgPSByb29tLmdldE1lbWJlcih1c2VySWQpO1xuICAgICAgICBpZiAobWVtYmVyICYmIFtcImpvaW5cIiwgXCJpbnZpdGVcIl0uaW5jbHVkZXMobWVtYmVyLm1lbWJlcnNoaXApKSB7XG4gICAgICAgICAgICBzZW5kUmVzcG9uc2UoZXZlbnQsIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjbGllbnQuaW52aXRlKHJvb21JZCwgdXNlcklkKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZW5kUmVzcG9uc2UoZXZlbnQsIHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgIH0pO1xuICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KCdZb3UgbmVlZCB0byBiZSBhYmxlIHRvIGludml0ZSB1c2VycyB0byBkbyB0aGF0LicpLCBlcnIpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBzZXRXaWRnZXQoZXZlbnQ6IE1lc3NhZ2VFdmVudDxhbnk+LCByb29tSWQ6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHdpZGdldElkID0gZXZlbnQuZGF0YS53aWRnZXRfaWQ7XG4gICAgbGV0IHdpZGdldFR5cGUgPSBldmVudC5kYXRhLnR5cGU7XG4gICAgY29uc3Qgd2lkZ2V0VXJsID0gZXZlbnQuZGF0YS51cmw7XG4gICAgY29uc3Qgd2lkZ2V0TmFtZSA9IGV2ZW50LmRhdGEubmFtZTsgLy8gb3B0aW9uYWxcbiAgICBjb25zdCB3aWRnZXREYXRhID0gZXZlbnQuZGF0YS5kYXRhOyAvLyBvcHRpb25hbFxuICAgIGNvbnN0IHdpZGdldEF2YXRhclVybCA9IGV2ZW50LmRhdGEuYXZhdGFyX3VybDsgLy8gb3B0aW9uYWxcbiAgICBjb25zdCB1c2VyV2lkZ2V0ID0gZXZlbnQuZGF0YS51c2VyV2lkZ2V0O1xuXG4gICAgLy8gYm90aCBhZGRpbmcvcmVtb3Zpbmcgd2lkZ2V0cyBuZWVkIHRoZXNlIGNoZWNrc1xuICAgIGlmICghd2lkZ2V0SWQgfHwgd2lkZ2V0VXJsID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc2VuZEVycm9yKGV2ZW50LCBfdChcIlVuYWJsZSB0byBjcmVhdGUgd2lkZ2V0LlwiKSwgbmV3IEVycm9yKFwiTWlzc2luZyByZXF1aXJlZCB3aWRnZXQgZmllbGRzLlwiKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAod2lkZ2V0VXJsICE9PSBudWxsKSB7IC8vIGlmIHVybCBpcyBudWxsIGl0IGlzIGJlaW5nIGRlbGV0ZWQsIGRvbid0IG5lZWQgdG8gY2hlY2sgbmFtZS90eXBlL2V0Y1xuICAgICAgICAvLyBjaGVjayB0eXBlcyBvZiBmaWVsZHNcbiAgICAgICAgaWYgKHdpZGdldE5hbWUgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygd2lkZ2V0TmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHNlbmRFcnJvcihldmVudCwgX3QoXCJVbmFibGUgdG8gY3JlYXRlIHdpZGdldC5cIiksIG5ldyBFcnJvcihcIk9wdGlvbmFsIGZpZWxkICduYW1lJyBtdXN0IGJlIGEgc3RyaW5nLlwiKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHdpZGdldERhdGEgIT09IHVuZGVmaW5lZCAmJiAhKHdpZGdldERhdGEgaW5zdGFuY2VvZiBPYmplY3QpKSB7XG4gICAgICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KFwiVW5hYmxlIHRvIGNyZWF0ZSB3aWRnZXQuXCIpLCBuZXcgRXJyb3IoXCJPcHRpb25hbCBmaWVsZCAnZGF0YScgbXVzdCBiZSBhbiBPYmplY3QuXCIpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAod2lkZ2V0QXZhdGFyVXJsICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHdpZGdldEF2YXRhclVybCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHNlbmRFcnJvcihcbiAgICAgICAgICAgICAgICBldmVudCxcbiAgICAgICAgICAgICAgICBfdChcIlVuYWJsZSB0byBjcmVhdGUgd2lkZ2V0LlwiKSxcbiAgICAgICAgICAgICAgICBuZXcgRXJyb3IoXCJPcHRpb25hbCBmaWVsZCAnYXZhdGFyX3VybCcgbXVzdCBiZSBhIHN0cmluZy5cIiksXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2Ygd2lkZ2V0VHlwZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHNlbmRFcnJvcihldmVudCwgX3QoXCJVbmFibGUgdG8gY3JlYXRlIHdpZGdldC5cIiksIG5ldyBFcnJvcihcIkZpZWxkICd0eXBlJyBtdXN0IGJlIGEgc3RyaW5nLlwiKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiB3aWRnZXRVcmwgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KFwiVW5hYmxlIHRvIGNyZWF0ZSB3aWRnZXQuXCIpLCBuZXcgRXJyb3IoXCJGaWVsZCAndXJsJyBtdXN0IGJlIGEgc3RyaW5nIG9yIG51bGwuXCIpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNvbnZlcnQgdGhlIHdpZGdldCB0eXBlIHRvIGEga25vd24gd2lkZ2V0IHR5cGVcbiAgICB3aWRnZXRUeXBlID0gV2lkZ2V0VHlwZS5mcm9tU3RyaW5nKHdpZGdldFR5cGUpO1xuXG4gICAgaWYgKHVzZXJXaWRnZXQpIHtcbiAgICAgICAgV2lkZ2V0VXRpbHMuc2V0VXNlcldpZGdldCh3aWRnZXRJZCwgd2lkZ2V0VHlwZSwgd2lkZ2V0VXJsLCB3aWRnZXROYW1lLCB3aWRnZXREYXRhKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHNlbmRSZXNwb25zZShldmVudCwge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiBcInVzZXJfd2lkZ2V0X3VwZGF0ZWRcIiB9KTtcbiAgICAgICAgfSkuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgIHNlbmRFcnJvcihldmVudCwgX3QoJ1VuYWJsZSB0byBjcmVhdGUgd2lkZ2V0LicpLCBlKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHsgLy8gUm9vbSB3aWRnZXRcbiAgICAgICAgaWYgKCFyb29tSWQpIHtcbiAgICAgICAgICAgIHNlbmRFcnJvcihldmVudCwgX3QoJ01pc3Npbmcgcm9vbUlkLicpLCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBXaWRnZXRVdGlscy5zZXRSb29tV2lkZ2V0KHJvb21JZCwgd2lkZ2V0SWQsIHdpZGdldFR5cGUsIHdpZGdldFVybCwgd2lkZ2V0TmFtZSwgd2lkZ2V0RGF0YSwgd2lkZ2V0QXZhdGFyVXJsKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHNlbmRSZXNwb25zZShldmVudCwge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIHNlbmRFcnJvcihldmVudCwgX3QoJ0ZhaWxlZCB0byBzZW5kIHJlcXVlc3QuJyksIGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGdldFdpZGdldHMoZXZlbnQ6IE1lc3NhZ2VFdmVudDxhbnk+LCByb29tSWQ6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICBpZiAoIWNsaWVudCkge1xuICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KCdZb3UgbmVlZCB0byBiZSBsb2dnZWQgaW4uJykpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCB3aWRnZXRTdGF0ZUV2ZW50cyA9IFtdO1xuXG4gICAgaWYgKHJvb21JZCkge1xuICAgICAgICBjb25zdCByb29tID0gY2xpZW50LmdldFJvb20ocm9vbUlkKTtcbiAgICAgICAgaWYgKCFyb29tKSB7XG4gICAgICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KCdUaGlzIHJvb20gaXMgbm90IHJlY29nbmlzZWQuJykpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIFhYWDogVGhpcyBnZXRzIHRoZSByYXcgZXZlbnQgb2JqZWN0IChJIHRoaW5rIGJlY2F1c2Ugd2UgY2FuJ3RcbiAgICAgICAgLy8gc2VuZCB0aGUgTWF0cml4RXZlbnQgb3ZlciBwb3N0TWVzc2FnZT8pXG4gICAgICAgIHdpZGdldFN0YXRlRXZlbnRzID0gV2lkZ2V0VXRpbHMuZ2V0Um9vbVdpZGdldHMocm9vbSkubWFwKChldikgPT4gZXYuZXZlbnQpO1xuICAgIH1cblxuICAgIC8vIEFkZCB1c2VyIHdpZGdldHMgKG5vdCBsaW5rZWQgdG8gYSBzcGVjaWZpYyByb29tKVxuICAgIGNvbnN0IHVzZXJXaWRnZXRzID0gV2lkZ2V0VXRpbHMuZ2V0VXNlcldpZGdldHNBcnJheSgpO1xuICAgIHdpZGdldFN0YXRlRXZlbnRzID0gd2lkZ2V0U3RhdGVFdmVudHMuY29uY2F0KHVzZXJXaWRnZXRzKTtcblxuICAgIHNlbmRSZXNwb25zZShldmVudCwgd2lkZ2V0U3RhdGVFdmVudHMpO1xufVxuXG5mdW5jdGlvbiBnZXRSb29tRW5jU3RhdGUoZXZlbnQ6IE1lc3NhZ2VFdmVudDxhbnk+LCByb29tSWQ6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICBpZiAoIWNsaWVudCkge1xuICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KCdZb3UgbmVlZCB0byBiZSBsb2dnZWQgaW4uJykpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJvb20gPSBjbGllbnQuZ2V0Um9vbShyb29tSWQpO1xuICAgIGlmICghcm9vbSkge1xuICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KCdUaGlzIHJvb20gaXMgbm90IHJlY29nbmlzZWQuJykpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJvb21Jc0VuY3J5cHRlZCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5pc1Jvb21FbmNyeXB0ZWQocm9vbUlkKTtcblxuICAgIHNlbmRSZXNwb25zZShldmVudCwgcm9vbUlzRW5jcnlwdGVkKTtcbn1cblxuZnVuY3Rpb24gc2V0UGx1bWJpbmdTdGF0ZShldmVudDogTWVzc2FnZUV2ZW50PGFueT4sIHJvb21JZDogc3RyaW5nLCBzdGF0dXM6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICh0eXBlb2Ygc3RhdHVzICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BsdW1iaW5nIHN0YXRlIHN0YXR1cyBzaG91bGQgYmUgYSBzdHJpbmcnKTtcbiAgICB9XG4gICAgbG9nZ2VyLmxvZyhgUmVjZWl2ZWQgcmVxdWVzdCB0byBzZXQgcGx1bWJpbmcgc3RhdGUgdG8gc3RhdHVzIFwiJHtzdGF0dXN9XCIgaW4gcm9vbSAke3Jvb21JZH1gKTtcbiAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgaWYgKCFjbGllbnQpIHtcbiAgICAgICAgc2VuZEVycm9yKGV2ZW50LCBfdCgnWW91IG5lZWQgdG8gYmUgbG9nZ2VkIGluLicpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjbGllbnQuc2VuZFN0YXRlRXZlbnQocm9vbUlkLCBcIm0ucm9vbS5wbHVtYmluZ1wiLCB7IHN0YXR1czogc3RhdHVzIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICBzZW5kUmVzcG9uc2UoZXZlbnQsIHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgIH0pO1xuICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgc2VuZEVycm9yKGV2ZW50LCBlcnIubWVzc2FnZSA/IGVyci5tZXNzYWdlIDogX3QoJ0ZhaWxlZCB0byBzZW5kIHJlcXVlc3QuJyksIGVycik7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHNldEJvdE9wdGlvbnMoZXZlbnQ6IE1lc3NhZ2VFdmVudDxhbnk+LCByb29tSWQ6IHN0cmluZywgdXNlcklkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsb2dnZXIubG9nKGBSZWNlaXZlZCByZXF1ZXN0IHRvIHNldCBvcHRpb25zIGZvciBib3QgJHt1c2VySWR9IGluIHJvb20gJHtyb29tSWR9YCk7XG4gICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgIGlmICghY2xpZW50KSB7XG4gICAgICAgIHNlbmRFcnJvcihldmVudCwgX3QoJ1lvdSBuZWVkIHRvIGJlIGxvZ2dlZCBpbi4nKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY2xpZW50LnNlbmRTdGF0ZUV2ZW50KHJvb21JZCwgXCJtLnJvb20uYm90Lm9wdGlvbnNcIiwgZXZlbnQuZGF0YS5jb250ZW50LCBcIl9cIiArIHVzZXJJZCkudGhlbigoKSA9PiB7XG4gICAgICAgIHNlbmRSZXNwb25zZShldmVudCwge1xuICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfSwgKGVycikgPT4ge1xuICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIGVyci5tZXNzYWdlID8gZXJyLm1lc3NhZ2UgOiBfdCgnRmFpbGVkIHRvIHNlbmQgcmVxdWVzdC4nKSwgZXJyKTtcbiAgICB9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2V0Qm90UG93ZXIoXG4gICAgZXZlbnQ6IE1lc3NhZ2VFdmVudDxhbnk+LCByb29tSWQ6IHN0cmluZywgdXNlcklkOiBzdHJpbmcsIGxldmVsOiBudW1iZXIsIGlnbm9yZUlmR3JlYXRlcj86IGJvb2xlYW4sXG4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIShOdW1iZXIuaXNJbnRlZ2VyKGxldmVsKSAmJiBsZXZlbCA+PSAwKSkge1xuICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KCdQb3dlciBsZXZlbCBtdXN0IGJlIHBvc2l0aXZlIGludGVnZXIuJykpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbG9nZ2VyLmxvZyhgUmVjZWl2ZWQgcmVxdWVzdCB0byBzZXQgcG93ZXIgbGV2ZWwgdG8gJHtsZXZlbH0gZm9yIGJvdCAke3VzZXJJZH0gaW4gcm9vbSAke3Jvb21JZH0uYCk7XG4gICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgIGlmICghY2xpZW50KSB7XG4gICAgICAgIHNlbmRFcnJvcihldmVudCwgX3QoJ1lvdSBuZWVkIHRvIGJlIGxvZ2dlZCBpbi4nKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCBwb3dlckxldmVscyA9IGF3YWl0IGNsaWVudC5nZXRTdGF0ZUV2ZW50KHJvb21JZCwgXCJtLnJvb20ucG93ZXJfbGV2ZWxzXCIsIFwiXCIpO1xuXG4gICAgICAgIC8vIElmIHRoZSBQTCBpcyBlcXVhbCB0byBvciBncmVhdGVyIHRoYW4gdGhlIHJlcXVlc3RlZCBQTCwgaWdub3JlLlxuICAgICAgICBpZiAoaWdub3JlSWZHcmVhdGVyID09PSB0cnVlKSB7XG4gICAgICAgICAgICAvLyBBcyBwZXIgaHR0cHM6Ly9tYXRyaXgub3JnL2RvY3Mvc3BlYy9jbGllbnRfc2VydmVyL3IwLjYuMCNtLXJvb20tcG93ZXItbGV2ZWxzXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50UGwgPSBwb3dlckxldmVscy51c2Vycz8uW3VzZXJJZF0gPz8gcG93ZXJMZXZlbHMudXNlcnNfZGVmYXVsdCA/PyAwO1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRQbCA+PSBsZXZlbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZW5kUmVzcG9uc2UoZXZlbnQsIHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBhd2FpdCBjbGllbnQuc2V0UG93ZXJMZXZlbChyb29tSWQsIHVzZXJJZCwgbGV2ZWwsIG5ldyBNYXRyaXhFdmVudChcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcIm0ucm9vbS5wb3dlcl9sZXZlbHNcIixcbiAgICAgICAgICAgICAgICBjb250ZW50OiBwb3dlckxldmVscyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICkpO1xuICAgICAgICByZXR1cm4gc2VuZFJlc3BvbnNlKGV2ZW50LCB7XG4gICAgICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgc2VuZEVycm9yKGV2ZW50LCBlcnIubWVzc2FnZSA/IGVyci5tZXNzYWdlIDogX3QoJ0ZhaWxlZCB0byBzZW5kIHJlcXVlc3QuJyksIGVycik7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBnZXRNZW1iZXJzaGlwU3RhdGUoZXZlbnQ6IE1lc3NhZ2VFdmVudDxhbnk+LCByb29tSWQ6IHN0cmluZywgdXNlcklkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsb2dnZXIubG9nKGBtZW1iZXJzaGlwX3N0YXRlIG9mICR7dXNlcklkfSBpbiByb29tICR7cm9vbUlkfSByZXF1ZXN0ZWQuYCk7XG4gICAgcmV0dXJuU3RhdGVFdmVudChldmVudCwgcm9vbUlkLCBcIm0ucm9vbS5tZW1iZXJcIiwgdXNlcklkKTtcbn1cblxuZnVuY3Rpb24gZ2V0Sm9pblJ1bGVzKGV2ZW50OiBNZXNzYWdlRXZlbnQ8YW55Piwgcm9vbUlkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsb2dnZXIubG9nKGBqb2luX3J1bGVzIG9mICR7cm9vbUlkfSByZXF1ZXN0ZWQuYCk7XG4gICAgcmV0dXJuU3RhdGVFdmVudChldmVudCwgcm9vbUlkLCBcIm0ucm9vbS5qb2luX3J1bGVzXCIsIFwiXCIpO1xufVxuXG5mdW5jdGlvbiBib3RPcHRpb25zKGV2ZW50OiBNZXNzYWdlRXZlbnQ8YW55Piwgcm9vbUlkOiBzdHJpbmcsIHVzZXJJZDogc3RyaW5nKTogdm9pZCB7XG4gICAgbG9nZ2VyLmxvZyhgYm90X29wdGlvbnMgb2YgJHt1c2VySWR9IGluIHJvb20gJHtyb29tSWR9IHJlcXVlc3RlZC5gKTtcbiAgICByZXR1cm5TdGF0ZUV2ZW50KGV2ZW50LCByb29tSWQsIFwibS5yb29tLmJvdC5vcHRpb25zXCIsIFwiX1wiICsgdXNlcklkKTtcbn1cblxuZnVuY3Rpb24gZ2V0TWVtYmVyc2hpcENvdW50KGV2ZW50OiBNZXNzYWdlRXZlbnQ8YW55Piwgcm9vbUlkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgaWYgKCFjbGllbnQpIHtcbiAgICAgICAgc2VuZEVycm9yKGV2ZW50LCBfdCgnWW91IG5lZWQgdG8gYmUgbG9nZ2VkIGluLicpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCByb29tID0gY2xpZW50LmdldFJvb20ocm9vbUlkKTtcbiAgICBpZiAoIXJvb20pIHtcbiAgICAgICAgc2VuZEVycm9yKGV2ZW50LCBfdCgnVGhpcyByb29tIGlzIG5vdCByZWNvZ25pc2VkLicpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBjb3VudCA9IHJvb20uZ2V0Sm9pbmVkTWVtYmVyQ291bnQoKTtcbiAgICBzZW5kUmVzcG9uc2UoZXZlbnQsIGNvdW50KTtcbn1cblxuZnVuY3Rpb24gY2FuU2VuZEV2ZW50KGV2ZW50OiBNZXNzYWdlRXZlbnQ8YW55Piwgcm9vbUlkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBldlR5cGUgPSBcIlwiICsgZXZlbnQuZGF0YS5ldmVudF90eXBlOyAvLyBmb3JjZSBzdHJpbmdpZnlcbiAgICBjb25zdCBpc1N0YXRlID0gQm9vbGVhbihldmVudC5kYXRhLmlzX3N0YXRlKTtcbiAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgaWYgKCFjbGllbnQpIHtcbiAgICAgICAgc2VuZEVycm9yKGV2ZW50LCBfdCgnWW91IG5lZWQgdG8gYmUgbG9nZ2VkIGluLicpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCByb29tID0gY2xpZW50LmdldFJvb20ocm9vbUlkKTtcbiAgICBpZiAoIXJvb20pIHtcbiAgICAgICAgc2VuZEVycm9yKGV2ZW50LCBfdCgnVGhpcyByb29tIGlzIG5vdCByZWNvZ25pc2VkLicpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAocm9vbS5nZXRNeU1lbWJlcnNoaXAoKSAhPT0gXCJqb2luXCIpIHtcbiAgICAgICAgc2VuZEVycm9yKGV2ZW50LCBfdCgnWW91IGFyZSBub3QgaW4gdGhpcyByb29tLicpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBtZSA9IGNsaWVudC5jcmVkZW50aWFscy51c2VySWQ7XG5cbiAgICBsZXQgY2FuU2VuZCA9IGZhbHNlO1xuICAgIGlmIChpc1N0YXRlKSB7XG4gICAgICAgIGNhblNlbmQgPSByb29tLmN1cnJlbnRTdGF0ZS5tYXlTZW5kU3RhdGVFdmVudChldlR5cGUsIG1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjYW5TZW5kID0gcm9vbS5jdXJyZW50U3RhdGUubWF5U2VuZEV2ZW50KGV2VHlwZSwgbWUpO1xuICAgIH1cblxuICAgIGlmICghY2FuU2VuZCkge1xuICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KCdZb3UgZG8gbm90IGhhdmUgcGVybWlzc2lvbiB0byBkbyB0aGF0IGluIHRoaXMgcm9vbS4nKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzZW5kUmVzcG9uc2UoZXZlbnQsIHRydWUpO1xufVxuXG5mdW5jdGlvbiByZXR1cm5TdGF0ZUV2ZW50KGV2ZW50OiBNZXNzYWdlRXZlbnQ8YW55Piwgcm9vbUlkOiBzdHJpbmcsIGV2ZW50VHlwZTogc3RyaW5nLCBzdGF0ZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgIGlmICghY2xpZW50KSB7XG4gICAgICAgIHNlbmRFcnJvcihldmVudCwgX3QoJ1lvdSBuZWVkIHRvIGJlIGxvZ2dlZCBpbi4nKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgcm9vbSA9IGNsaWVudC5nZXRSb29tKHJvb21JZCk7XG4gICAgaWYgKCFyb29tKSB7XG4gICAgICAgIHNlbmRFcnJvcihldmVudCwgX3QoJ1RoaXMgcm9vbSBpcyBub3QgcmVjb2duaXNlZC4nKSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgc3RhdGVFdmVudCA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKGV2ZW50VHlwZSwgc3RhdGVLZXkpO1xuICAgIGlmICghc3RhdGVFdmVudCkge1xuICAgICAgICBzZW5kUmVzcG9uc2UoZXZlbnQsIG51bGwpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHNlbmRSZXNwb25zZShldmVudCwgc3RhdGVFdmVudC5nZXRDb250ZW50KCkpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRPcGVuSWRUb2tlbihldmVudDogTWVzc2FnZUV2ZW50PGFueT4pIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCB0b2tlbk9iamVjdCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRPcGVuSWRUb2tlbigpO1xuICAgICAgICBzZW5kUmVzcG9uc2UoZXZlbnQsIHRva2VuT2JqZWN0KTtcbiAgICB9IGNhdGNoIChleCkge1xuICAgICAgICBsb2dnZXIud2FybihcIlVuYWJsZSB0byBmZXRjaCBvcGVuSWQgdG9rZW4uXCIsIGV4KTtcbiAgICAgICAgc2VuZEVycm9yKGV2ZW50LCAnVW5hYmxlIHRvIGZldGNoIG9wZW5JZCB0b2tlbi4nKTtcbiAgICB9XG59XG5cbmNvbnN0IG9uTWVzc2FnZSA9IGZ1bmN0aW9uKGV2ZW50OiBNZXNzYWdlRXZlbnQ8YW55Pik6IHZvaWQge1xuICAgIGlmICghZXZlbnQub3JpZ2luKSB7IC8vIHN0dXBpZCBjaHJvbWVcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBldmVudC5vcmlnaW4gPSBldmVudC5vcmlnaW5hbEV2ZW50Lm9yaWdpbjtcbiAgICB9XG5cbiAgICAvLyBDaGVjayB0aGF0IHRoZSBpbnRlZ3JhdGlvbnMgVUkgVVJMIHN0YXJ0cyB3aXRoIHRoZSBvcmlnaW4gb2YgdGhlIGV2ZW50XG4gICAgLy8gVGhpcyBtZWFucyB0aGUgVVJMIGNvdWxkIGNvbnRhaW4gYSBwYXRoIChsaWtlIC9kZXZlbG9wKSBhbmQgc3RpbGwgYmUgdXNlZFxuICAgIC8vIHRvIHZhbGlkYXRlIGV2ZW50IG9yaWdpbnMsIHdoaWNoIGRvIG5vdCBzcGVjaWZ5IHBhdGhzLlxuICAgIC8vIChTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1dpbmRvdy9wb3N0TWVzc2FnZSlcbiAgICBsZXQgY29uZmlnVXJsO1xuICAgIHRyeSB7XG4gICAgICAgIGlmICghb3Blbk1hbmFnZXJVcmwpIG9wZW5NYW5hZ2VyVXJsID0gSW50ZWdyYXRpb25NYW5hZ2Vycy5zaGFyZWRJbnN0YW5jZSgpLmdldFByaW1hcnlNYW5hZ2VyKCkudWlVcmw7XG4gICAgICAgIGNvbmZpZ1VybCA9IG5ldyBVUkwob3Blbk1hbmFnZXJVcmwpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gTm8gaW50ZWdyYXRpb25zIFVJIFVSTCwgaWdub3JlIHNpbGVudGx5LlxuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBldmVudE9yaWdpblVybDtcbiAgICB0cnkge1xuICAgICAgICBldmVudE9yaWdpblVybCA9IG5ldyBVUkwoZXZlbnQub3JpZ2luKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gVE9ETyAtLSBTY2FsYXIgcG9zdE1lc3NhZ2UgQVBJIHNob3VsZCBiZSBuYW1lc3BhY2VkIHdpdGggZXZlbnQuZGF0YS5hcGkgZmllbGRcbiAgICAvLyBGaXggZm9sbG93aW5nIFwiaWZcIiBzdGF0ZW1lbnQgdG8gcmVzcG9uZCBvbmx5IHRvIHNwZWNpZmljIEFQSSBtZXNzYWdlcy5cbiAgICBpZiAoXG4gICAgICAgIGNvbmZpZ1VybC5vcmlnaW4gIT09IGV2ZW50T3JpZ2luVXJsLm9yaWdpbiB8fFxuICAgICAgICAhZXZlbnQuZGF0YS5hY3Rpb24gfHxcbiAgICAgICAgZXZlbnQuZGF0YS5hcGkgLy8gSWdub3JlIG1lc3NhZ2VzIHdpdGggc3BlY2lmaWMgQVBJIHNldFxuICAgICkge1xuICAgICAgICAvLyBkb24ndCBsb2cgdGhpcyAtIGRlYnVnZ2luZyBBUElzIGFuZCBicm93c2VyIGFkZC1vbnMgbGlrZSB0byBzcGFtXG4gICAgICAgIC8vIHBvc3RNZXNzYWdlIHdoaWNoIGZsb29kcyB0aGUgbG9nIG90aGVyd2lzZVxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGV2ZW50LmRhdGEuYWN0aW9uID09PSBBY3Rpb24uQ2xvc2VTY2FsYXIpIHtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiBBY3Rpb24uQ2xvc2VTY2FsYXIgfSk7XG4gICAgICAgIHNlbmRSZXNwb25zZShldmVudCwgbnVsbCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCByb29tSWQgPSBldmVudC5kYXRhLnJvb21faWQ7XG4gICAgY29uc3QgdXNlcklkID0gZXZlbnQuZGF0YS51c2VyX2lkO1xuXG4gICAgaWYgKCFyb29tSWQpIHtcbiAgICAgICAgLy8gVGhlc2UgQVBJcyBkb24ndCByZXF1aXJlIHJvb21JZFxuICAgICAgICAvLyBHZXQgYW5kIHNldCB1c2VyIHdpZGdldHMgKG5vdCBhc3NvY2lhdGVkIHdpdGggYSBzcGVjaWZpYyByb29tKVxuICAgICAgICAvLyBJZiByb29tSWQgaXMgc3BlY2lmaWVkLCBpdCBtdXN0IGJlIHZhbGlkYXRlZCwgc28gcm9vbS1iYXNlZCB3aWRnZXRzIGFncmVlZFxuICAgICAgICAvLyBoYW5kbGVkIGZ1cnRoZXIgZG93bi5cbiAgICAgICAgaWYgKGV2ZW50LmRhdGEuYWN0aW9uID09PSBBY3Rpb24uR2V0V2lkZ2V0cykge1xuICAgICAgICAgICAgZ2V0V2lkZ2V0cyhldmVudCwgbnVsbCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuZGF0YS5hY3Rpb24gPT09IEFjdGlvbi5TZXRXaWRnZXQpIHtcbiAgICAgICAgICAgIHNldFdpZGdldChldmVudCwgbnVsbCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KCdNaXNzaW5nIHJvb21faWQgaW4gcmVxdWVzdCcpKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChyb29tSWQgIT09IFJvb21WaWV3U3RvcmUuaW5zdGFuY2UuZ2V0Um9vbUlkKCkpIHtcbiAgICAgICAgc2VuZEVycm9yKGV2ZW50LCBfdCgnUm9vbSAlKHJvb21JZClzIG5vdCB2aXNpYmxlJywgeyByb29tSWQ6IHJvb21JZCB9KSk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBHZXQgYW5kIHNldCByb29tLWJhc2VkIHdpZGdldHNcbiAgICBpZiAoZXZlbnQuZGF0YS5hY3Rpb24gPT09IEFjdGlvbi5HZXRXaWRnZXRzKSB7XG4gICAgICAgIGdldFdpZGdldHMoZXZlbnQsIHJvb21JZCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKGV2ZW50LmRhdGEuYWN0aW9uID09PSBBY3Rpb24uU2V0V2lkZ2V0KSB7XG4gICAgICAgIHNldFdpZGdldChldmVudCwgcm9vbUlkKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFRoZXNlIEFQSXMgZG9uJ3QgcmVxdWlyZSB1c2VySWRcbiAgICBpZiAoZXZlbnQuZGF0YS5hY3Rpb24gPT09IEFjdGlvbi5Kb2luUnVsZXNTdGF0ZSkge1xuICAgICAgICBnZXRKb2luUnVsZXMoZXZlbnQsIHJvb21JZCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKGV2ZW50LmRhdGEuYWN0aW9uID09PSBBY3Rpb24uU2V0UGx1bWJpbmdTdGF0ZSkge1xuICAgICAgICBzZXRQbHVtYmluZ1N0YXRlKGV2ZW50LCByb29tSWQsIGV2ZW50LmRhdGEuc3RhdHVzKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAoZXZlbnQuZGF0YS5hY3Rpb24gPT09IEFjdGlvbi5HZXRNZW1iZXJzaGlwQ291bnQpIHtcbiAgICAgICAgZ2V0TWVtYmVyc2hpcENvdW50KGV2ZW50LCByb29tSWQpO1xuICAgICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmIChldmVudC5kYXRhLmFjdGlvbiA9PT0gQWN0aW9uLkdldFJvb21FbmNyeXB0aW9uU3RhdGUpIHtcbiAgICAgICAgZ2V0Um9vbUVuY1N0YXRlKGV2ZW50LCByb29tSWQpO1xuICAgICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmIChldmVudC5kYXRhLmFjdGlvbiA9PT0gQWN0aW9uLkNhblNlbmRFdmVudCkge1xuICAgICAgICBjYW5TZW5kRXZlbnQoZXZlbnQsIHJvb21JZCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXVzZXJJZCkge1xuICAgICAgICBzZW5kRXJyb3IoZXZlbnQsIF90KCdNaXNzaW5nIHVzZXJfaWQgaW4gcmVxdWVzdCcpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBzd2l0Y2ggKGV2ZW50LmRhdGEuYWN0aW9uKSB7XG4gICAgICAgIGNhc2UgQWN0aW9uLk1lbWJlcnNoaXBTdGF0ZTpcbiAgICAgICAgICAgIGdldE1lbWJlcnNoaXBTdGF0ZShldmVudCwgcm9vbUlkLCB1c2VySWQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgQWN0aW9uLmludml0ZTpcbiAgICAgICAgICAgIGludml0ZVVzZXIoZXZlbnQsIHJvb21JZCwgdXNlcklkKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEFjdGlvbi5Cb3RPcHRpb25zOlxuICAgICAgICAgICAgYm90T3B0aW9ucyhldmVudCwgcm9vbUlkLCB1c2VySWQpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgQWN0aW9uLlNldEJvdE9wdGlvbnM6XG4gICAgICAgICAgICBzZXRCb3RPcHRpb25zKGV2ZW50LCByb29tSWQsIHVzZXJJZCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBBY3Rpb24uU2V0Qm90UG93ZXI6XG4gICAgICAgICAgICBzZXRCb3RQb3dlcihldmVudCwgcm9vbUlkLCB1c2VySWQsIGV2ZW50LmRhdGEubGV2ZWwsIGV2ZW50LmRhdGEuaWdub3JlSWZHcmVhdGVyKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEFjdGlvbi5HZXRPcGVuSWRUb2tlbjpcbiAgICAgICAgICAgIGdldE9wZW5JZFRva2VuKGV2ZW50KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgbG9nZ2VyLndhcm4oXCJVbmhhbmRsZWQgcG9zdE1lc3NhZ2UgZXZlbnQgd2l0aCBhY3Rpb24gJ1wiICsgZXZlbnQuZGF0YS5hY3Rpb24gK1wiJ1wiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn07XG5cbmxldCBsaXN0ZW5lckNvdW50ID0gMDtcbmxldCBvcGVuTWFuYWdlclVybDogc3RyaW5nID0gbnVsbDtcblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0TGlzdGVuaW5nKCk6IHZvaWQge1xuICAgIGlmIChsaXN0ZW5lckNvdW50ID09PSAwKSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBvbk1lc3NhZ2UsIGZhbHNlKTtcbiAgICB9XG4gICAgbGlzdGVuZXJDb3VudCArPSAxO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RvcExpc3RlbmluZygpOiB2b2lkIHtcbiAgICBsaXN0ZW5lckNvdW50IC09IDE7XG4gICAgaWYgKGxpc3RlbmVyQ291bnQgPT09IDApIHtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIG9uTWVzc2FnZSk7XG4gICAgfVxuICAgIGlmIChsaXN0ZW5lckNvdW50IDwgMCkge1xuICAgICAgICAvLyBNYWtlIGFuIGVycm9yIHNvIHdlIGdldCBhIHN0YWNrIHRyYWNlXG4gICAgICAgIGNvbnN0IGUgPSBuZXcgRXJyb3IoXG4gICAgICAgICAgICBcIlNjYWxhck1lc3NhZ2luZzogbWlzbWF0Y2hlZCBzdGFydExpc3RlbmluZyAvIHN0b3BMaXN0ZW5pbmcgZGV0ZWN0ZWQuXCIgK1xuICAgICAgICAgICAgXCIgTmVnYXRpdmUgY291bnRcIixcbiAgICAgICAgKTtcbiAgICAgICAgbG9nZ2VyLmVycm9yKGUpO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQXFQQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUEvUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFjS0EsTTs7V0FBQUEsTTtFQUFBQSxNO0VBQUFBLE07RUFBQUEsTTtFQUFB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