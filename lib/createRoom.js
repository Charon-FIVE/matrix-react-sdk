"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.canEncryptToAllUsers = canEncryptToAllUsers;
exports.default = createRoom;
exports.ensureDMExists = ensureDMExists;
exports.ensureVirtualRoomExists = ensureVirtualRoomExists;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _client = require("matrix-js-sdk/src/client");

var _event = require("matrix-js-sdk/src/@types/event");

var _partials = require("matrix-js-sdk/src/@types/partials");

var _logger = require("matrix-js-sdk/src/logger");

var _MatrixClientPeg = require("./MatrixClientPeg");

var _Modal = _interopRequireDefault(require("./Modal"));

var _languageHandler = require("./languageHandler");

var _dispatcher = _interopRequireDefault(require("./dispatcher/dispatcher"));

var Rooms = _interopRequireWildcard(require("./Rooms"));

var _UserAddress = require("./UserAddress");

var _callTypes = require("./call-types");

var _SpaceStore = _interopRequireDefault(require("./stores/spaces/SpaceStore"));

var _space = require("./utils/space");

var _Call = require("./models/Call");

var _actions = require("./dispatcher/actions");

var _ErrorDialog = _interopRequireDefault(require("./components/views/dialogs/ErrorDialog"));

var _Spinner = _interopRequireDefault(require("./components/views/elements/Spinner"));

var _findDMForUser = require("./utils/dm/findDMForUser");

var _rooms = require("./utils/rooms");

var _membership = require("./utils/membership");

var _PreferredRoomVersions = require("./utils/PreferredRoomVersions");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

/**
 * Create a new room, and switch to it.
 *
 * @param {object=} opts parameters for creating the room
 * @param {string=} opts.dmUserId If specified, make this a DM room for this user and invite them
 * @param {object=} opts.createOpts set of options to pass to createRoom call.
 * @param {bool=} opts.spinner True to show a modal spinner while the room is created.
 *     Default: True
 * @param {bool=} opts.guestAccess Whether to enable guest access.
 *     Default: True
 * @param {bool=} opts.encryption Whether to enable encryption.
 *     Default: False
 * @param {bool=} opts.inlineErrors True to raise errors off the promise instead of resolving to null.
 *     Default: False
 * @param {bool=} opts.andView True to dispatch an action to view the room once it has been created.
 *
 * @returns {Promise} which resolves to the room id, or null if the
 * action was aborted or failed.
 */
async function createRoom(opts) {
  opts = opts || {};
  if (opts.spinner === undefined) opts.spinner = true;
  if (opts.guestAccess === undefined) opts.guestAccess = true;
  if (opts.encryption === undefined) opts.encryption = false;

  const client = _MatrixClientPeg.MatrixClientPeg.get();

  if (client.isGuest()) {
    _dispatcher.default.dispatch({
      action: 'require_registration'
    });

    return null;
  }

  const defaultPreset = opts.dmUserId ? _partials.Preset.TrustedPrivateChat : _partials.Preset.PrivateChat; // set some defaults for the creation

  const createOpts = opts.createOpts || {};
  createOpts.preset = createOpts.preset || defaultPreset;
  createOpts.visibility = createOpts.visibility || _partials.Visibility.Private;

  if (opts.dmUserId && createOpts.invite === undefined) {
    switch ((0, _UserAddress.getAddressType)(opts.dmUserId)) {
      case 'mx-user-id':
        createOpts.invite = [opts.dmUserId];
        break;

      case 'email':
        createOpts.invite_3pid = [{
          id_server: _MatrixClientPeg.MatrixClientPeg.get().getIdentityServerUrl(true),
          medium: 'email',
          address: opts.dmUserId
        }];
    }
  }

  if (opts.dmUserId && createOpts.is_direct === undefined) {
    createOpts.is_direct = true;
  }

  if (opts.roomType) {
    createOpts.creation_content = _objectSpread(_objectSpread({}, createOpts.creation_content), {}, {
      [_event.RoomCreateTypeField]: opts.roomType
    }); // Video rooms require custom power levels

    if (opts.roomType === _event.RoomType.ElementVideo) {
      createOpts.power_level_content_override = {
        events: {
          // Allow all users to send call membership updates
          [_Call.JitsiCall.MEMBER_EVENT_TYPE]: 0,
          // Make widgets immutable, even to admins
          "im.vector.modular.widgets": 200,
          // Annoyingly, we have to reiterate all the defaults here
          [_event.EventType.RoomName]: 50,
          [_event.EventType.RoomAvatar]: 50,
          [_event.EventType.RoomPowerLevels]: 100,
          [_event.EventType.RoomHistoryVisibility]: 100,
          [_event.EventType.RoomCanonicalAlias]: 50,
          [_event.EventType.RoomTombstone]: 100,
          [_event.EventType.RoomServerAcl]: 100,
          [_event.EventType.RoomEncryption]: 100
        },
        users: {
          // Temporarily give ourselves the power to set up a widget
          [client.getUserId()]: 200
        }
      };
    }
  } // By default, view the room after creating it


  if (opts.andView === undefined) {
    opts.andView = true;
  }

  createOpts.initial_state = createOpts.initial_state || []; // Allow guests by default since the room is private and they'd
  // need an invite. This means clicking on a 3pid invite email can
  // actually drop you right in to a chat.

  if (opts.guestAccess) {
    createOpts.initial_state.push({
      type: 'm.room.guest_access',
      state_key: '',
      content: {
        guest_access: 'can_join'
      }
    });
  }

  if (opts.encryption) {
    createOpts.initial_state.push({
      type: 'm.room.encryption',
      state_key: '',
      content: {
        algorithm: 'm.megolm.v1.aes-sha2'
      }
    });
  }

  if (opts.parentSpace) {
    createOpts.initial_state.push((0, _space.makeSpaceParentEvent)(opts.parentSpace, true));

    if (!opts.historyVisibility) {
      opts.historyVisibility = createOpts.preset === _partials.Preset.PublicChat ? _partials.HistoryVisibility.WorldReadable : _partials.HistoryVisibility.Invited;
    }

    if (opts.joinRule === _partials.JoinRule.Restricted) {
      createOpts.room_version = _PreferredRoomVersions.PreferredRoomVersions.RestrictedRooms;
      createOpts.initial_state.push({
        type: _event.EventType.RoomJoinRules,
        content: {
          "join_rule": _partials.JoinRule.Restricted,
          "allow": [{
            "type": _partials.RestrictedAllowType.RoomMembership,
            "room_id": opts.parentSpace.roomId
          }]
        }
      });
    }
  } // we handle the restricted join rule in the parentSpace handling block above


  if (opts.joinRule && opts.joinRule !== _partials.JoinRule.Restricted) {
    createOpts.initial_state.push({
      type: _event.EventType.RoomJoinRules,
      content: {
        join_rule: opts.joinRule
      }
    });
  }

  if (opts.avatar) {
    let url = opts.avatar;

    if (opts.avatar instanceof File) {
      url = await client.uploadContent(opts.avatar);
    }

    createOpts.initial_state.push({
      type: _event.EventType.RoomAvatar,
      content: {
        url
      }
    });
  }

  if (opts.historyVisibility) {
    createOpts.initial_state.push({
      type: _event.EventType.RoomHistoryVisibility,
      content: {
        "history_visibility": opts.historyVisibility
      }
    });
  }

  let modal;
  if (opts.spinner) modal = _Modal.default.createDialog(_Spinner.default, null, 'mx_Dialog_spinner');
  let roomId;
  let room;
  return client.createRoom(createOpts).catch(function (err) {
    // NB This checks for the Synapse-specific error condition of a room creation
    // having been denied because the requesting user wanted to publish the room,
    // but the server denies them that permission (via room_list_publication_rules).
    // The check below responds by retrying without publishing the room.
    if (err.httpStatus === 403 && err.errcode === "M_UNKNOWN" && err.data.error === "Not allowed to publish room") {
      _logger.logger.warn("Failed to publish room, try again without publishing it");

      createOpts.visibility = _partials.Visibility.Private;
      return client.createRoom(createOpts);
    } else {
      return Promise.reject(err);
    }
  }).finally(function () {
    if (modal) modal.close();
  }).then(async res => {
    roomId = res.room_id;
    room = new Promise(resolve => {
      const storedRoom = client.getRoom(roomId);

      if (storedRoom) {
        resolve(storedRoom);
      } else {
        // The room hasn't arrived down sync yet
        const onRoom = emittedRoom => {
          if (emittedRoom.roomId === roomId) {
            resolve(emittedRoom);
            client.off(_client.ClientEvent.Room, onRoom);
          }
        };

        client.on(_client.ClientEvent.Room, onRoom);
      }
    });
    if (opts.dmUserId) await Rooms.setDMRoom(roomId, opts.dmUserId);
  }).then(() => {
    if (opts.parentSpace) {
      return _SpaceStore.default.instance.addRoomToSpace(opts.parentSpace, roomId, [client.getDomain()], opts.suggested);
    }
  }).then(async () => {
    if (opts.roomType === _event.RoomType.ElementVideo) {
      // Set up video rooms with a Jitsi call
      await _Call.JitsiCall.create(await room); // Reset our power level back to admin so that the widget becomes immutable

      const plEvent = (await room)?.currentState.getStateEvents(_event.EventType.RoomPowerLevels, "");
      await client.setPowerLevel(roomId, client.getUserId(), 100, plEvent);
    }
  }).then(function () {
    // NB we haven't necessarily blocked on the room promise, so we race
    // here with the client knowing that the room exists, causing things
    // like https://github.com/vector-im/vector-web/issues/1813
    // Even if we were to block on the echo, servers tend to split the room
    // state over multiple syncs so we can't atomically know when we have the
    // entire thing.
    if (opts.andView) {
      _dispatcher.default.dispatch({
        action: _actions.Action.ViewRoom,
        room_id: roomId,
        should_peek: false,
        // Creating a room will have joined us to the room,
        // so we are expecting the room to come down the sync
        // stream, if it hasn't already.
        joining: true,
        justCreatedOpts: opts,
        metricsTrigger: "Created"
      });
    }

    return roomId;
  }, function (err) {
    // Raise the error if the caller requested that we do so.
    if (opts.inlineErrors) throw err; // We also failed to join the room (this sets joining to false in RoomViewStore)

    _dispatcher.default.dispatch({
      action: _actions.Action.JoinRoomError,
      roomId
    });

    _logger.logger.error("Failed to create room " + roomId + " " + err);

    let description = (0, _languageHandler._t)("Server may be unavailable, overloaded, or you hit a bug.");

    if (err.errcode === "M_UNSUPPORTED_ROOM_VERSION") {
      // Technically not possible with the UI as of April 2019 because there's no
      // options for the user to change this. However, it's not a bad thing to report
      // the error to the user for if/when the UI is available.
      description = (0, _languageHandler._t)("The server does not support the room version specified.");
    }

    _Modal.default.createDialog(_ErrorDialog.default, {
      title: (0, _languageHandler._t)("Failure to create room"),
      description
    });

    return null;
  });
}
/*
 * Ensure that for every user in a room, there is at least one device that we
 * can encrypt to.
 */


async function canEncryptToAllUsers(client, userIds) {
  try {
    const usersDeviceMap = await client.downloadKeys(userIds); // { "@user:host": { "DEVICE": {...}, ... }, ... }

    return Object.values(usersDeviceMap).every(userDevices => // { "DEVICE": {...}, ... }
    Object.keys(userDevices).length > 0);
  } catch (e) {
    _logger.logger.error("Error determining if it's possible to encrypt to all users: ", e);

    return false; // assume not
  }
} // Similar to ensureDMExists but also adds creation content
// without polluting ensureDMExists with unrelated stuff (also
// they're never encrypted).


async function ensureVirtualRoomExists(client, userId, nativeRoomId) {
  const existingDMRoom = (0, _findDMForUser.findDMForUser)(client, userId);
  let roomId;

  if (existingDMRoom) {
    roomId = existingDMRoom.roomId;
  } else {
    roomId = await createRoom({
      dmUserId: userId,
      spinner: false,
      andView: false,
      createOpts: {
        creation_content: {
          // This allows us to recognise that the room is a virtual room
          // when it comes down our sync stream (we also put the ID of the
          // respective native room in there because why not?)
          [_callTypes.VIRTUAL_ROOM_EVENT_TYPE]: nativeRoomId
        }
      }
    });
  }

  return roomId;
}

async function ensureDMExists(client, userId) {
  const existingDMRoom = (0, _findDMForUser.findDMForUser)(client, userId);
  let roomId;

  if (existingDMRoom) {
    roomId = existingDMRoom.roomId;
  } else {
    let encryption = undefined;

    if ((0, _rooms.privateShouldBeEncrypted)()) {
      encryption = await canEncryptToAllUsers(client, [userId]);
    }

    roomId = await createRoom({
      encryption,
      dmUserId: userId,
      spinner: false,
      andView: false
    });
    await (0, _membership.waitForMember)(client, roomId, userId);
  }

  return roomId;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVSb29tIiwib3B0cyIsInNwaW5uZXIiLCJ1bmRlZmluZWQiLCJndWVzdEFjY2VzcyIsImVuY3J5cHRpb24iLCJjbGllbnQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJpc0d1ZXN0IiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJkZWZhdWx0UHJlc2V0IiwiZG1Vc2VySWQiLCJQcmVzZXQiLCJUcnVzdGVkUHJpdmF0ZUNoYXQiLCJQcml2YXRlQ2hhdCIsImNyZWF0ZU9wdHMiLCJwcmVzZXQiLCJ2aXNpYmlsaXR5IiwiVmlzaWJpbGl0eSIsIlByaXZhdGUiLCJpbnZpdGUiLCJnZXRBZGRyZXNzVHlwZSIsImludml0ZV8zcGlkIiwiaWRfc2VydmVyIiwiZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwiLCJtZWRpdW0iLCJhZGRyZXNzIiwiaXNfZGlyZWN0Iiwicm9vbVR5cGUiLCJjcmVhdGlvbl9jb250ZW50IiwiUm9vbUNyZWF0ZVR5cGVGaWVsZCIsIlJvb21UeXBlIiwiRWxlbWVudFZpZGVvIiwicG93ZXJfbGV2ZWxfY29udGVudF9vdmVycmlkZSIsImV2ZW50cyIsIkppdHNpQ2FsbCIsIk1FTUJFUl9FVkVOVF9UWVBFIiwiRXZlbnRUeXBlIiwiUm9vbU5hbWUiLCJSb29tQXZhdGFyIiwiUm9vbVBvd2VyTGV2ZWxzIiwiUm9vbUhpc3RvcnlWaXNpYmlsaXR5IiwiUm9vbUNhbm9uaWNhbEFsaWFzIiwiUm9vbVRvbWJzdG9uZSIsIlJvb21TZXJ2ZXJBY2wiLCJSb29tRW5jcnlwdGlvbiIsInVzZXJzIiwiZ2V0VXNlcklkIiwiYW5kVmlldyIsImluaXRpYWxfc3RhdGUiLCJwdXNoIiwidHlwZSIsInN0YXRlX2tleSIsImNvbnRlbnQiLCJndWVzdF9hY2Nlc3MiLCJhbGdvcml0aG0iLCJwYXJlbnRTcGFjZSIsIm1ha2VTcGFjZVBhcmVudEV2ZW50IiwiaGlzdG9yeVZpc2liaWxpdHkiLCJQdWJsaWNDaGF0IiwiSGlzdG9yeVZpc2liaWxpdHkiLCJXb3JsZFJlYWRhYmxlIiwiSW52aXRlZCIsImpvaW5SdWxlIiwiSm9pblJ1bGUiLCJSZXN0cmljdGVkIiwicm9vbV92ZXJzaW9uIiwiUHJlZmVycmVkUm9vbVZlcnNpb25zIiwiUmVzdHJpY3RlZFJvb21zIiwiUm9vbUpvaW5SdWxlcyIsIlJlc3RyaWN0ZWRBbGxvd1R5cGUiLCJSb29tTWVtYmVyc2hpcCIsInJvb21JZCIsImpvaW5fcnVsZSIsImF2YXRhciIsInVybCIsIkZpbGUiLCJ1cGxvYWRDb250ZW50IiwibW9kYWwiLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIlNwaW5uZXIiLCJyb29tIiwiY2F0Y2giLCJlcnIiLCJodHRwU3RhdHVzIiwiZXJyY29kZSIsImRhdGEiLCJlcnJvciIsImxvZ2dlciIsIndhcm4iLCJQcm9taXNlIiwicmVqZWN0IiwiZmluYWxseSIsImNsb3NlIiwidGhlbiIsInJlcyIsInJvb21faWQiLCJyZXNvbHZlIiwic3RvcmVkUm9vbSIsImdldFJvb20iLCJvblJvb20iLCJlbWl0dGVkUm9vbSIsIm9mZiIsIkNsaWVudEV2ZW50IiwiUm9vbSIsIm9uIiwiUm9vbXMiLCJzZXRETVJvb20iLCJTcGFjZVN0b3JlIiwiaW5zdGFuY2UiLCJhZGRSb29tVG9TcGFjZSIsImdldERvbWFpbiIsInN1Z2dlc3RlZCIsImNyZWF0ZSIsInBsRXZlbnQiLCJjdXJyZW50U3RhdGUiLCJnZXRTdGF0ZUV2ZW50cyIsInNldFBvd2VyTGV2ZWwiLCJBY3Rpb24iLCJWaWV3Um9vbSIsInNob3VsZF9wZWVrIiwiam9pbmluZyIsImp1c3RDcmVhdGVkT3B0cyIsIm1ldHJpY3NUcmlnZ2VyIiwiaW5saW5lRXJyb3JzIiwiSm9pblJvb21FcnJvciIsImRlc2NyaXB0aW9uIiwiX3QiLCJFcnJvckRpYWxvZyIsInRpdGxlIiwiY2FuRW5jcnlwdFRvQWxsVXNlcnMiLCJ1c2VySWRzIiwidXNlcnNEZXZpY2VNYXAiLCJkb3dubG9hZEtleXMiLCJPYmplY3QiLCJ2YWx1ZXMiLCJldmVyeSIsInVzZXJEZXZpY2VzIiwia2V5cyIsImxlbmd0aCIsImUiLCJlbnN1cmVWaXJ0dWFsUm9vbUV4aXN0cyIsInVzZXJJZCIsIm5hdGl2ZVJvb21JZCIsImV4aXN0aW5nRE1Sb29tIiwiZmluZERNRm9yVXNlciIsIlZJUlRVQUxfUk9PTV9FVkVOVF9UWVBFIiwiZW5zdXJlRE1FeGlzdHMiLCJwcml2YXRlU2hvdWxkQmVFbmNyeXB0ZWQiLCJ3YWl0Rm9yTWVtYmVyIl0sInNvdXJjZXMiOlsiLi4vc3JjL2NyZWF0ZVJvb20udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOSwgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7IE1hdHJpeENsaWVudCwgQ2xpZW50RXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY2xpZW50XCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQgeyBFdmVudFR5cGUsIFJvb21DcmVhdGVUeXBlRmllbGQsIFJvb21UeXBlIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9ldmVudFwiO1xuaW1wb3J0IHsgSUNyZWF0ZVJvb21PcHRzIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9yZXF1ZXN0c1wiO1xuaW1wb3J0IHtcbiAgICBIaXN0b3J5VmlzaWJpbGl0eSxcbiAgICBKb2luUnVsZSxcbiAgICBQcmVzZXQsXG4gICAgUmVzdHJpY3RlZEFsbG93VHlwZSxcbiAgICBWaXNpYmlsaXR5LFxufSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL3BhcnRpYWxzXCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5cbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gJy4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCBNb2RhbCBmcm9tICcuL01vZGFsJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCAqIGFzIFJvb21zIGZyb20gXCIuL1Jvb21zXCI7XG5pbXBvcnQgeyBnZXRBZGRyZXNzVHlwZSB9IGZyb20gXCIuL1VzZXJBZGRyZXNzXCI7XG5pbXBvcnQgeyBWSVJUVUFMX1JPT01fRVZFTlRfVFlQRSB9IGZyb20gXCIuL2NhbGwtdHlwZXNcIjtcbmltcG9ydCBTcGFjZVN0b3JlIGZyb20gXCIuL3N0b3Jlcy9zcGFjZXMvU3BhY2VTdG9yZVwiO1xuaW1wb3J0IHsgbWFrZVNwYWNlUGFyZW50RXZlbnQgfSBmcm9tIFwiLi91dGlscy9zcGFjZVwiO1xuaW1wb3J0IHsgSml0c2lDYWxsIH0gZnJvbSBcIi4vbW9kZWxzL0NhbGxcIjtcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gXCIuL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IEVycm9yRGlhbG9nIGZyb20gXCIuL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9FcnJvckRpYWxvZ1wiO1xuaW1wb3J0IFNwaW5uZXIgZnJvbSBcIi4vY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9TcGlubmVyXCI7XG5pbXBvcnQgeyBWaWV3Um9vbVBheWxvYWQgfSBmcm9tIFwiLi9kaXNwYXRjaGVyL3BheWxvYWRzL1ZpZXdSb29tUGF5bG9hZFwiO1xuaW1wb3J0IHsgZmluZERNRm9yVXNlciB9IGZyb20gXCIuL3V0aWxzL2RtL2ZpbmRETUZvclVzZXJcIjtcbmltcG9ydCB7IHByaXZhdGVTaG91bGRCZUVuY3J5cHRlZCB9IGZyb20gXCIuL3V0aWxzL3Jvb21zXCI7XG5pbXBvcnQgeyB3YWl0Rm9yTWVtYmVyIH0gZnJvbSBcIi4vdXRpbHMvbWVtYmVyc2hpcFwiO1xuaW1wb3J0IHsgUHJlZmVycmVkUm9vbVZlcnNpb25zIH0gZnJvbSBcIi4vdXRpbHMvUHJlZmVycmVkUm9vbVZlcnNpb25zXCI7XG5cbi8vIHdlIGRlZmluZSBhIG51bWJlciBvZiBpbnRlcmZhY2VzIHdoaWNoIHRha2UgdGhlaXIgbmFtZXMgZnJvbSB0aGUganMtc2RrXG4vKiBlc2xpbnQtZGlzYWJsZSBjYW1lbGNhc2UgKi9cblxuZXhwb3J0IGludGVyZmFjZSBJT3B0cyB7XG4gICAgZG1Vc2VySWQ/OiBzdHJpbmc7XG4gICAgY3JlYXRlT3B0cz86IElDcmVhdGVSb29tT3B0cztcbiAgICBzcGlubmVyPzogYm9vbGVhbjtcbiAgICBndWVzdEFjY2Vzcz86IGJvb2xlYW47XG4gICAgZW5jcnlwdGlvbj86IGJvb2xlYW47XG4gICAgaW5saW5lRXJyb3JzPzogYm9vbGVhbjtcbiAgICBhbmRWaWV3PzogYm9vbGVhbjtcbiAgICBhdmF0YXI/OiBGaWxlIHwgc3RyaW5nOyAvLyB3aWxsIHVwbG9hZCBpZiBnaXZlbiBmaWxlLCBlbHNlIG14Y1VybCBpcyBuZWVkZWRcbiAgICByb29tVHlwZT86IFJvb21UeXBlIHwgc3RyaW5nO1xuICAgIGhpc3RvcnlWaXNpYmlsaXR5PzogSGlzdG9yeVZpc2liaWxpdHk7XG4gICAgcGFyZW50U3BhY2U/OiBSb29tO1xuICAgIC8vIGNvbnRleHR1YWxseSBvbmx5IG1ha2VzIHNlbnNlIGlmIHBhcmVudFNwYWNlIGlzIHNwZWNpZmllZCwgaWYgdHJ1ZSB0aGVuIHdpbGwgYmUgYWRkZWQgdG8gcGFyZW50U3BhY2UgYXMgc3VnZ2VzdGVkXG4gICAgc3VnZ2VzdGVkPzogYm9vbGVhbjtcbiAgICBqb2luUnVsZT86IEpvaW5SdWxlO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyByb29tLCBhbmQgc3dpdGNoIHRvIGl0LlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0PX0gb3B0cyBwYXJhbWV0ZXJzIGZvciBjcmVhdGluZyB0aGUgcm9vbVxuICogQHBhcmFtIHtzdHJpbmc9fSBvcHRzLmRtVXNlcklkIElmIHNwZWNpZmllZCwgbWFrZSB0aGlzIGEgRE0gcm9vbSBmb3IgdGhpcyB1c2VyIGFuZCBpbnZpdGUgdGhlbVxuICogQHBhcmFtIHtvYmplY3Q9fSBvcHRzLmNyZWF0ZU9wdHMgc2V0IG9mIG9wdGlvbnMgdG8gcGFzcyB0byBjcmVhdGVSb29tIGNhbGwuXG4gKiBAcGFyYW0ge2Jvb2w9fSBvcHRzLnNwaW5uZXIgVHJ1ZSB0byBzaG93IGEgbW9kYWwgc3Bpbm5lciB3aGlsZSB0aGUgcm9vbSBpcyBjcmVhdGVkLlxuICogICAgIERlZmF1bHQ6IFRydWVcbiAqIEBwYXJhbSB7Ym9vbD19IG9wdHMuZ3Vlc3RBY2Nlc3MgV2hldGhlciB0byBlbmFibGUgZ3Vlc3QgYWNjZXNzLlxuICogICAgIERlZmF1bHQ6IFRydWVcbiAqIEBwYXJhbSB7Ym9vbD19IG9wdHMuZW5jcnlwdGlvbiBXaGV0aGVyIHRvIGVuYWJsZSBlbmNyeXB0aW9uLlxuICogICAgIERlZmF1bHQ6IEZhbHNlXG4gKiBAcGFyYW0ge2Jvb2w9fSBvcHRzLmlubGluZUVycm9ycyBUcnVlIHRvIHJhaXNlIGVycm9ycyBvZmYgdGhlIHByb21pc2UgaW5zdGVhZCBvZiByZXNvbHZpbmcgdG8gbnVsbC5cbiAqICAgICBEZWZhdWx0OiBGYWxzZVxuICogQHBhcmFtIHtib29sPX0gb3B0cy5hbmRWaWV3IFRydWUgdG8gZGlzcGF0Y2ggYW4gYWN0aW9uIHRvIHZpZXcgdGhlIHJvb20gb25jZSBpdCBoYXMgYmVlbiBjcmVhdGVkLlxuICpcbiAqIEByZXR1cm5zIHtQcm9taXNlfSB3aGljaCByZXNvbHZlcyB0byB0aGUgcm9vbSBpZCwgb3IgbnVsbCBpZiB0aGVcbiAqIGFjdGlvbiB3YXMgYWJvcnRlZCBvciBmYWlsZWQuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVJvb20ob3B0czogSU9wdHMpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcbiAgICBvcHRzID0gb3B0cyB8fCB7fTtcbiAgICBpZiAob3B0cy5zcGlubmVyID09PSB1bmRlZmluZWQpIG9wdHMuc3Bpbm5lciA9IHRydWU7XG4gICAgaWYgKG9wdHMuZ3Vlc3RBY2Nlc3MgPT09IHVuZGVmaW5lZCkgb3B0cy5ndWVzdEFjY2VzcyA9IHRydWU7XG4gICAgaWYgKG9wdHMuZW5jcnlwdGlvbiA9PT0gdW5kZWZpbmVkKSBvcHRzLmVuY3J5cHRpb24gPSBmYWxzZTtcblxuICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICBpZiAoY2xpZW50LmlzR3Vlc3QoKSkge1xuICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246ICdyZXF1aXJlX3JlZ2lzdHJhdGlvbicgfSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGRlZmF1bHRQcmVzZXQgPSBvcHRzLmRtVXNlcklkID8gUHJlc2V0LlRydXN0ZWRQcml2YXRlQ2hhdCA6IFByZXNldC5Qcml2YXRlQ2hhdDtcblxuICAgIC8vIHNldCBzb21lIGRlZmF1bHRzIGZvciB0aGUgY3JlYXRpb25cbiAgICBjb25zdCBjcmVhdGVPcHRzOiBJQ3JlYXRlUm9vbU9wdHMgPSBvcHRzLmNyZWF0ZU9wdHMgfHwge307XG4gICAgY3JlYXRlT3B0cy5wcmVzZXQgPSBjcmVhdGVPcHRzLnByZXNldCB8fCBkZWZhdWx0UHJlc2V0O1xuICAgIGNyZWF0ZU9wdHMudmlzaWJpbGl0eSA9IGNyZWF0ZU9wdHMudmlzaWJpbGl0eSB8fCBWaXNpYmlsaXR5LlByaXZhdGU7XG4gICAgaWYgKG9wdHMuZG1Vc2VySWQgJiYgY3JlYXRlT3B0cy5pbnZpdGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzd2l0Y2ggKGdldEFkZHJlc3NUeXBlKG9wdHMuZG1Vc2VySWQpKSB7XG4gICAgICAgICAgICBjYXNlICdteC11c2VyLWlkJzpcbiAgICAgICAgICAgICAgICBjcmVhdGVPcHRzLmludml0ZSA9IFtvcHRzLmRtVXNlcklkXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2VtYWlsJzpcbiAgICAgICAgICAgICAgICBjcmVhdGVPcHRzLmludml0ZV8zcGlkID0gW3tcbiAgICAgICAgICAgICAgICAgICAgaWRfc2VydmVyOiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0SWRlbnRpdHlTZXJ2ZXJVcmwodHJ1ZSksXG4gICAgICAgICAgICAgICAgICAgIG1lZGl1bTogJ2VtYWlsJyxcbiAgICAgICAgICAgICAgICAgICAgYWRkcmVzczogb3B0cy5kbVVzZXJJZCxcbiAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAob3B0cy5kbVVzZXJJZCAmJiBjcmVhdGVPcHRzLmlzX2RpcmVjdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNyZWF0ZU9wdHMuaXNfZGlyZWN0ID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAob3B0cy5yb29tVHlwZSkge1xuICAgICAgICBjcmVhdGVPcHRzLmNyZWF0aW9uX2NvbnRlbnQgPSB7XG4gICAgICAgICAgICAuLi5jcmVhdGVPcHRzLmNyZWF0aW9uX2NvbnRlbnQsXG4gICAgICAgICAgICBbUm9vbUNyZWF0ZVR5cGVGaWVsZF06IG9wdHMucm9vbVR5cGUsXG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gVmlkZW8gcm9vbXMgcmVxdWlyZSBjdXN0b20gcG93ZXIgbGV2ZWxzXG4gICAgICAgIGlmIChvcHRzLnJvb21UeXBlID09PSBSb29tVHlwZS5FbGVtZW50VmlkZW8pIHtcbiAgICAgICAgICAgIGNyZWF0ZU9wdHMucG93ZXJfbGV2ZWxfY29udGVudF9vdmVycmlkZSA9IHtcbiAgICAgICAgICAgICAgICBldmVudHM6IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQWxsb3cgYWxsIHVzZXJzIHRvIHNlbmQgY2FsbCBtZW1iZXJzaGlwIHVwZGF0ZXNcbiAgICAgICAgICAgICAgICAgICAgW0ppdHNpQ2FsbC5NRU1CRVJfRVZFTlRfVFlQRV06IDAsXG4gICAgICAgICAgICAgICAgICAgIC8vIE1ha2Ugd2lkZ2V0cyBpbW11dGFibGUsIGV2ZW4gdG8gYWRtaW5zXG4gICAgICAgICAgICAgICAgICAgIFwiaW0udmVjdG9yLm1vZHVsYXIud2lkZ2V0c1wiOiAyMDAsXG4gICAgICAgICAgICAgICAgICAgIC8vIEFubm95aW5nbHksIHdlIGhhdmUgdG8gcmVpdGVyYXRlIGFsbCB0aGUgZGVmYXVsdHMgaGVyZVxuICAgICAgICAgICAgICAgICAgICBbRXZlbnRUeXBlLlJvb21OYW1lXTogNTAsXG4gICAgICAgICAgICAgICAgICAgIFtFdmVudFR5cGUuUm9vbUF2YXRhcl06IDUwLFxuICAgICAgICAgICAgICAgICAgICBbRXZlbnRUeXBlLlJvb21Qb3dlckxldmVsc106IDEwMCxcbiAgICAgICAgICAgICAgICAgICAgW0V2ZW50VHlwZS5Sb29tSGlzdG9yeVZpc2liaWxpdHldOiAxMDAsXG4gICAgICAgICAgICAgICAgICAgIFtFdmVudFR5cGUuUm9vbUNhbm9uaWNhbEFsaWFzXTogNTAsXG4gICAgICAgICAgICAgICAgICAgIFtFdmVudFR5cGUuUm9vbVRvbWJzdG9uZV06IDEwMCxcbiAgICAgICAgICAgICAgICAgICAgW0V2ZW50VHlwZS5Sb29tU2VydmVyQWNsXTogMTAwLFxuICAgICAgICAgICAgICAgICAgICBbRXZlbnRUeXBlLlJvb21FbmNyeXB0aW9uXTogMTAwLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdXNlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGVtcG9yYXJpbHkgZ2l2ZSBvdXJzZWx2ZXMgdGhlIHBvd2VyIHRvIHNldCB1cCBhIHdpZGdldFxuICAgICAgICAgICAgICAgICAgICBbY2xpZW50LmdldFVzZXJJZCgpXTogMjAwLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gQnkgZGVmYXVsdCwgdmlldyB0aGUgcm9vbSBhZnRlciBjcmVhdGluZyBpdFxuICAgIGlmIChvcHRzLmFuZFZpZXcgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBvcHRzLmFuZFZpZXcgPSB0cnVlO1xuICAgIH1cblxuICAgIGNyZWF0ZU9wdHMuaW5pdGlhbF9zdGF0ZSA9IGNyZWF0ZU9wdHMuaW5pdGlhbF9zdGF0ZSB8fCBbXTtcblxuICAgIC8vIEFsbG93IGd1ZXN0cyBieSBkZWZhdWx0IHNpbmNlIHRoZSByb29tIGlzIHByaXZhdGUgYW5kIHRoZXknZFxuICAgIC8vIG5lZWQgYW4gaW52aXRlLiBUaGlzIG1lYW5zIGNsaWNraW5nIG9uIGEgM3BpZCBpbnZpdGUgZW1haWwgY2FuXG4gICAgLy8gYWN0dWFsbHkgZHJvcCB5b3UgcmlnaHQgaW4gdG8gYSBjaGF0LlxuICAgIGlmIChvcHRzLmd1ZXN0QWNjZXNzKSB7XG4gICAgICAgIGNyZWF0ZU9wdHMuaW5pdGlhbF9zdGF0ZS5wdXNoKHtcbiAgICAgICAgICAgIHR5cGU6ICdtLnJvb20uZ3Vlc3RfYWNjZXNzJyxcbiAgICAgICAgICAgIHN0YXRlX2tleTogJycsXG4gICAgICAgICAgICBjb250ZW50OiB7XG4gICAgICAgICAgICAgICAgZ3Vlc3RfYWNjZXNzOiAnY2FuX2pvaW4nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKG9wdHMuZW5jcnlwdGlvbikge1xuICAgICAgICBjcmVhdGVPcHRzLmluaXRpYWxfc3RhdGUucHVzaCh7XG4gICAgICAgICAgICB0eXBlOiAnbS5yb29tLmVuY3J5cHRpb24nLFxuICAgICAgICAgICAgc3RhdGVfa2V5OiAnJyxcbiAgICAgICAgICAgIGNvbnRlbnQ6IHtcbiAgICAgICAgICAgICAgICBhbGdvcml0aG06ICdtLm1lZ29sbS52MS5hZXMtc2hhMicsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAob3B0cy5wYXJlbnRTcGFjZSkge1xuICAgICAgICBjcmVhdGVPcHRzLmluaXRpYWxfc3RhdGUucHVzaChtYWtlU3BhY2VQYXJlbnRFdmVudChvcHRzLnBhcmVudFNwYWNlLCB0cnVlKSk7XG4gICAgICAgIGlmICghb3B0cy5oaXN0b3J5VmlzaWJpbGl0eSkge1xuICAgICAgICAgICAgb3B0cy5oaXN0b3J5VmlzaWJpbGl0eSA9IGNyZWF0ZU9wdHMucHJlc2V0ID09PSBQcmVzZXQuUHVibGljQ2hhdFxuICAgICAgICAgICAgICAgID8gSGlzdG9yeVZpc2liaWxpdHkuV29ybGRSZWFkYWJsZVxuICAgICAgICAgICAgICAgIDogSGlzdG9yeVZpc2liaWxpdHkuSW52aXRlZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRzLmpvaW5SdWxlID09PSBKb2luUnVsZS5SZXN0cmljdGVkKSB7XG4gICAgICAgICAgICBjcmVhdGVPcHRzLnJvb21fdmVyc2lvbiA9IFByZWZlcnJlZFJvb21WZXJzaW9ucy5SZXN0cmljdGVkUm9vbXM7XG5cbiAgICAgICAgICAgIGNyZWF0ZU9wdHMuaW5pdGlhbF9zdGF0ZS5wdXNoKHtcbiAgICAgICAgICAgICAgICB0eXBlOiBFdmVudFR5cGUuUm9vbUpvaW5SdWxlcyxcbiAgICAgICAgICAgICAgICBjb250ZW50OiB7XG4gICAgICAgICAgICAgICAgICAgIFwiam9pbl9ydWxlXCI6IEpvaW5SdWxlLlJlc3RyaWN0ZWQsXG4gICAgICAgICAgICAgICAgICAgIFwiYWxsb3dcIjogW3tcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBSZXN0cmljdGVkQWxsb3dUeXBlLlJvb21NZW1iZXJzaGlwLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJyb29tX2lkXCI6IG9wdHMucGFyZW50U3BhY2Uucm9vbUlkLFxuICAgICAgICAgICAgICAgICAgICB9XSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB3ZSBoYW5kbGUgdGhlIHJlc3RyaWN0ZWQgam9pbiBydWxlIGluIHRoZSBwYXJlbnRTcGFjZSBoYW5kbGluZyBibG9jayBhYm92ZVxuICAgIGlmIChvcHRzLmpvaW5SdWxlICYmIG9wdHMuam9pblJ1bGUgIT09IEpvaW5SdWxlLlJlc3RyaWN0ZWQpIHtcbiAgICAgICAgY3JlYXRlT3B0cy5pbml0aWFsX3N0YXRlLnB1c2goe1xuICAgICAgICAgICAgdHlwZTogRXZlbnRUeXBlLlJvb21Kb2luUnVsZXMsXG4gICAgICAgICAgICBjb250ZW50OiB7IGpvaW5fcnVsZTogb3B0cy5qb2luUnVsZSB9LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAob3B0cy5hdmF0YXIpIHtcbiAgICAgICAgbGV0IHVybCA9IG9wdHMuYXZhdGFyO1xuICAgICAgICBpZiAob3B0cy5hdmF0YXIgaW5zdGFuY2VvZiBGaWxlKSB7XG4gICAgICAgICAgICB1cmwgPSBhd2FpdCBjbGllbnQudXBsb2FkQ29udGVudChvcHRzLmF2YXRhcik7XG4gICAgICAgIH1cblxuICAgICAgICBjcmVhdGVPcHRzLmluaXRpYWxfc3RhdGUucHVzaCh7XG4gICAgICAgICAgICB0eXBlOiBFdmVudFR5cGUuUm9vbUF2YXRhcixcbiAgICAgICAgICAgIGNvbnRlbnQ6IHsgdXJsIH0sXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChvcHRzLmhpc3RvcnlWaXNpYmlsaXR5KSB7XG4gICAgICAgIGNyZWF0ZU9wdHMuaW5pdGlhbF9zdGF0ZS5wdXNoKHtcbiAgICAgICAgICAgIHR5cGU6IEV2ZW50VHlwZS5Sb29tSGlzdG9yeVZpc2liaWxpdHksXG4gICAgICAgICAgICBjb250ZW50OiB7XG4gICAgICAgICAgICAgICAgXCJoaXN0b3J5X3Zpc2liaWxpdHlcIjogb3B0cy5oaXN0b3J5VmlzaWJpbGl0eSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGxldCBtb2RhbDtcbiAgICBpZiAob3B0cy5zcGlubmVyKSBtb2RhbCA9IE1vZGFsLmNyZWF0ZURpYWxvZyhTcGlubmVyLCBudWxsLCAnbXhfRGlhbG9nX3NwaW5uZXInKTtcblxuICAgIGxldCByb29tSWQ6IHN0cmluZztcbiAgICBsZXQgcm9vbTogUHJvbWlzZTxSb29tPjtcbiAgICByZXR1cm4gY2xpZW50LmNyZWF0ZVJvb20oY3JlYXRlT3B0cykuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIC8vIE5CIFRoaXMgY2hlY2tzIGZvciB0aGUgU3luYXBzZS1zcGVjaWZpYyBlcnJvciBjb25kaXRpb24gb2YgYSByb29tIGNyZWF0aW9uXG4gICAgICAgIC8vIGhhdmluZyBiZWVuIGRlbmllZCBiZWNhdXNlIHRoZSByZXF1ZXN0aW5nIHVzZXIgd2FudGVkIHRvIHB1Ymxpc2ggdGhlIHJvb20sXG4gICAgICAgIC8vIGJ1dCB0aGUgc2VydmVyIGRlbmllcyB0aGVtIHRoYXQgcGVybWlzc2lvbiAodmlhIHJvb21fbGlzdF9wdWJsaWNhdGlvbl9ydWxlcykuXG4gICAgICAgIC8vIFRoZSBjaGVjayBiZWxvdyByZXNwb25kcyBieSByZXRyeWluZyB3aXRob3V0IHB1Ymxpc2hpbmcgdGhlIHJvb20uXG4gICAgICAgIGlmIChlcnIuaHR0cFN0YXR1cyA9PT0gNDAzICYmIGVyci5lcnJjb2RlID09PSBcIk1fVU5LTk9XTlwiICYmIGVyci5kYXRhLmVycm9yID09PSBcIk5vdCBhbGxvd2VkIHRvIHB1Ymxpc2ggcm9vbVwiKSB7XG4gICAgICAgICAgICBsb2dnZXIud2FybihcIkZhaWxlZCB0byBwdWJsaXNoIHJvb20sIHRyeSBhZ2FpbiB3aXRob3V0IHB1Ymxpc2hpbmcgaXRcIik7XG4gICAgICAgICAgICBjcmVhdGVPcHRzLnZpc2liaWxpdHkgPSBWaXNpYmlsaXR5LlByaXZhdGU7XG4gICAgICAgICAgICByZXR1cm4gY2xpZW50LmNyZWF0ZVJvb20oY3JlYXRlT3B0cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyKTtcbiAgICAgICAgfVxuICAgIH0pLmZpbmFsbHkoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChtb2RhbCkgbW9kYWwuY2xvc2UoKTtcbiAgICB9KS50aGVuKGFzeW5jIHJlcyA9PiB7XG4gICAgICAgIHJvb21JZCA9IHJlcy5yb29tX2lkO1xuXG4gICAgICAgIHJvb20gPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHN0b3JlZFJvb20gPSBjbGllbnQuZ2V0Um9vbShyb29tSWQpO1xuICAgICAgICAgICAgaWYgKHN0b3JlZFJvb20pIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHN0b3JlZFJvb20pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgcm9vbSBoYXNuJ3QgYXJyaXZlZCBkb3duIHN5bmMgeWV0XG4gICAgICAgICAgICAgICAgY29uc3Qgb25Sb29tID0gKGVtaXR0ZWRSb29tOiBSb29tKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlbWl0dGVkUm9vbS5yb29tSWQgPT09IHJvb21JZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShlbWl0dGVkUm9vbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGllbnQub2ZmKENsaWVudEV2ZW50LlJvb20sIG9uUm9vbSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGNsaWVudC5vbihDbGllbnRFdmVudC5Sb29tLCBvblJvb20pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAob3B0cy5kbVVzZXJJZCkgYXdhaXQgUm9vbXMuc2V0RE1Sb29tKHJvb21JZCwgb3B0cy5kbVVzZXJJZCk7XG4gICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgIGlmIChvcHRzLnBhcmVudFNwYWNlKSB7XG4gICAgICAgICAgICByZXR1cm4gU3BhY2VTdG9yZS5pbnN0YW5jZS5hZGRSb29tVG9TcGFjZShvcHRzLnBhcmVudFNwYWNlLCByb29tSWQsIFtjbGllbnQuZ2V0RG9tYWluKCldLCBvcHRzLnN1Z2dlc3RlZCk7XG4gICAgICAgIH1cbiAgICB9KS50aGVuKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKG9wdHMucm9vbVR5cGUgPT09IFJvb21UeXBlLkVsZW1lbnRWaWRlbykge1xuICAgICAgICAgICAgLy8gU2V0IHVwIHZpZGVvIHJvb21zIHdpdGggYSBKaXRzaSBjYWxsXG4gICAgICAgICAgICBhd2FpdCBKaXRzaUNhbGwuY3JlYXRlKGF3YWl0IHJvb20pO1xuXG4gICAgICAgICAgICAvLyBSZXNldCBvdXIgcG93ZXIgbGV2ZWwgYmFjayB0byBhZG1pbiBzbyB0aGF0IHRoZSB3aWRnZXQgYmVjb21lcyBpbW11dGFibGVcbiAgICAgICAgICAgIGNvbnN0IHBsRXZlbnQgPSAoYXdhaXQgcm9vbSk/LmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhFdmVudFR5cGUuUm9vbVBvd2VyTGV2ZWxzLCBcIlwiKTtcbiAgICAgICAgICAgIGF3YWl0IGNsaWVudC5zZXRQb3dlckxldmVsKHJvb21JZCwgY2xpZW50LmdldFVzZXJJZCgpISwgMTAwLCBwbEV2ZW50KTtcbiAgICAgICAgfVxuICAgIH0pLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIE5CIHdlIGhhdmVuJ3QgbmVjZXNzYXJpbHkgYmxvY2tlZCBvbiB0aGUgcm9vbSBwcm9taXNlLCBzbyB3ZSByYWNlXG4gICAgICAgIC8vIGhlcmUgd2l0aCB0aGUgY2xpZW50IGtub3dpbmcgdGhhdCB0aGUgcm9vbSBleGlzdHMsIGNhdXNpbmcgdGhpbmdzXG4gICAgICAgIC8vIGxpa2UgaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS92ZWN0b3Itd2ViL2lzc3Vlcy8xODEzXG4gICAgICAgIC8vIEV2ZW4gaWYgd2Ugd2VyZSB0byBibG9jayBvbiB0aGUgZWNobywgc2VydmVycyB0ZW5kIHRvIHNwbGl0IHRoZSByb29tXG4gICAgICAgIC8vIHN0YXRlIG92ZXIgbXVsdGlwbGUgc3luY3Mgc28gd2UgY2FuJ3QgYXRvbWljYWxseSBrbm93IHdoZW4gd2UgaGF2ZSB0aGVcbiAgICAgICAgLy8gZW50aXJlIHRoaW5nLlxuICAgICAgICBpZiAob3B0cy5hbmRWaWV3KSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2g8Vmlld1Jvb21QYXlsb2FkPih7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1Jvb20sXG4gICAgICAgICAgICAgICAgcm9vbV9pZDogcm9vbUlkLFxuICAgICAgICAgICAgICAgIHNob3VsZF9wZWVrOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAvLyBDcmVhdGluZyBhIHJvb20gd2lsbCBoYXZlIGpvaW5lZCB1cyB0byB0aGUgcm9vbSxcbiAgICAgICAgICAgICAgICAvLyBzbyB3ZSBhcmUgZXhwZWN0aW5nIHRoZSByb29tIHRvIGNvbWUgZG93biB0aGUgc3luY1xuICAgICAgICAgICAgICAgIC8vIHN0cmVhbSwgaWYgaXQgaGFzbid0IGFscmVhZHkuXG4gICAgICAgICAgICAgICAgam9pbmluZzogdHJ1ZSxcbiAgICAgICAgICAgICAgICBqdXN0Q3JlYXRlZE9wdHM6IG9wdHMsXG4gICAgICAgICAgICAgICAgbWV0cmljc1RyaWdnZXI6IFwiQ3JlYXRlZFwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJvb21JZDtcbiAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgLy8gUmFpc2UgdGhlIGVycm9yIGlmIHRoZSBjYWxsZXIgcmVxdWVzdGVkIHRoYXQgd2UgZG8gc28uXG4gICAgICAgIGlmIChvcHRzLmlubGluZUVycm9ycykgdGhyb3cgZXJyO1xuXG4gICAgICAgIC8vIFdlIGFsc28gZmFpbGVkIHRvIGpvaW4gdGhlIHJvb20gKHRoaXMgc2V0cyBqb2luaW5nIHRvIGZhbHNlIGluIFJvb21WaWV3U3RvcmUpXG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5Kb2luUm9vbUVycm9yLFxuICAgICAgICAgICAgcm9vbUlkLFxuICAgICAgICB9KTtcbiAgICAgICAgbG9nZ2VyLmVycm9yKFwiRmFpbGVkIHRvIGNyZWF0ZSByb29tIFwiICsgcm9vbUlkICsgXCIgXCIgKyBlcnIpO1xuICAgICAgICBsZXQgZGVzY3JpcHRpb24gPSBfdChcIlNlcnZlciBtYXkgYmUgdW5hdmFpbGFibGUsIG92ZXJsb2FkZWQsIG9yIHlvdSBoaXQgYSBidWcuXCIpO1xuICAgICAgICBpZiAoZXJyLmVycmNvZGUgPT09IFwiTV9VTlNVUFBPUlRFRF9ST09NX1ZFUlNJT05cIikge1xuICAgICAgICAgICAgLy8gVGVjaG5pY2FsbHkgbm90IHBvc3NpYmxlIHdpdGggdGhlIFVJIGFzIG9mIEFwcmlsIDIwMTkgYmVjYXVzZSB0aGVyZSdzIG5vXG4gICAgICAgICAgICAvLyBvcHRpb25zIGZvciB0aGUgdXNlciB0byBjaGFuZ2UgdGhpcy4gSG93ZXZlciwgaXQncyBub3QgYSBiYWQgdGhpbmcgdG8gcmVwb3J0XG4gICAgICAgICAgICAvLyB0aGUgZXJyb3IgdG8gdGhlIHVzZXIgZm9yIGlmL3doZW4gdGhlIFVJIGlzIGF2YWlsYWJsZS5cbiAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gX3QoXCJUaGUgc2VydmVyIGRvZXMgbm90IHN1cHBvcnQgdGhlIHJvb20gdmVyc2lvbiBzcGVjaWZpZWQuXCIpO1xuICAgICAgICB9XG4gICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgdGl0bGU6IF90KFwiRmFpbHVyZSB0byBjcmVhdGUgcm9vbVwiKSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSk7XG59XG5cbi8qXG4gKiBFbnN1cmUgdGhhdCBmb3IgZXZlcnkgdXNlciBpbiBhIHJvb20sIHRoZXJlIGlzIGF0IGxlYXN0IG9uZSBkZXZpY2UgdGhhdCB3ZVxuICogY2FuIGVuY3J5cHQgdG8uXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjYW5FbmNyeXB0VG9BbGxVc2VycyhjbGllbnQ6IE1hdHJpeENsaWVudCwgdXNlcklkczogc3RyaW5nW10pIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCB1c2Vyc0RldmljZU1hcCA9IGF3YWl0IGNsaWVudC5kb3dubG9hZEtleXModXNlcklkcyk7XG4gICAgICAgIC8vIHsgXCJAdXNlcjpob3N0XCI6IHsgXCJERVZJQ0VcIjogey4uLn0sIC4uLiB9LCAuLi4gfVxuICAgICAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyh1c2Vyc0RldmljZU1hcCkuZXZlcnkoKHVzZXJEZXZpY2VzKSA9PlxuICAgICAgICAgICAgLy8geyBcIkRFVklDRVwiOiB7Li4ufSwgLi4uIH1cbiAgICAgICAgICAgIE9iamVjdC5rZXlzKHVzZXJEZXZpY2VzKS5sZW5ndGggPiAwLFxuICAgICAgICApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgbG9nZ2VyLmVycm9yKFwiRXJyb3IgZGV0ZXJtaW5pbmcgaWYgaXQncyBwb3NzaWJsZSB0byBlbmNyeXB0IHRvIGFsbCB1c2VyczogXCIsIGUpO1xuICAgICAgICByZXR1cm4gZmFsc2U7IC8vIGFzc3VtZSBub3RcbiAgICB9XG59XG5cbi8vIFNpbWlsYXIgdG8gZW5zdXJlRE1FeGlzdHMgYnV0IGFsc28gYWRkcyBjcmVhdGlvbiBjb250ZW50XG4vLyB3aXRob3V0IHBvbGx1dGluZyBlbnN1cmVETUV4aXN0cyB3aXRoIHVucmVsYXRlZCBzdHVmZiAoYWxzb1xuLy8gdGhleSdyZSBuZXZlciBlbmNyeXB0ZWQpLlxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuc3VyZVZpcnR1YWxSb29tRXhpc3RzKFxuICAgIGNsaWVudDogTWF0cml4Q2xpZW50LCB1c2VySWQ6IHN0cmluZywgbmF0aXZlUm9vbUlkOiBzdHJpbmcsXG4pOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGV4aXN0aW5nRE1Sb29tID0gZmluZERNRm9yVXNlcihjbGllbnQsIHVzZXJJZCk7XG4gICAgbGV0IHJvb21JZDtcbiAgICBpZiAoZXhpc3RpbmdETVJvb20pIHtcbiAgICAgICAgcm9vbUlkID0gZXhpc3RpbmdETVJvb20ucm9vbUlkO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb21JZCA9IGF3YWl0IGNyZWF0ZVJvb20oe1xuICAgICAgICAgICAgZG1Vc2VySWQ6IHVzZXJJZCxcbiAgICAgICAgICAgIHNwaW5uZXI6IGZhbHNlLFxuICAgICAgICAgICAgYW5kVmlldzogZmFsc2UsXG4gICAgICAgICAgICBjcmVhdGVPcHRzOiB7XG4gICAgICAgICAgICAgICAgY3JlYXRpb25fY29udGVudDoge1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGFsbG93cyB1cyB0byByZWNvZ25pc2UgdGhhdCB0aGUgcm9vbSBpcyBhIHZpcnR1YWwgcm9vbVxuICAgICAgICAgICAgICAgICAgICAvLyB3aGVuIGl0IGNvbWVzIGRvd24gb3VyIHN5bmMgc3RyZWFtICh3ZSBhbHNvIHB1dCB0aGUgSUQgb2YgdGhlXG4gICAgICAgICAgICAgICAgICAgIC8vIHJlc3BlY3RpdmUgbmF0aXZlIHJvb20gaW4gdGhlcmUgYmVjYXVzZSB3aHkgbm90PylcbiAgICAgICAgICAgICAgICAgICAgW1ZJUlRVQUxfUk9PTV9FVkVOVF9UWVBFXTogbmF0aXZlUm9vbUlkLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHJvb21JZDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuc3VyZURNRXhpc3RzKGNsaWVudDogTWF0cml4Q2xpZW50LCB1c2VySWQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgZXhpc3RpbmdETVJvb20gPSBmaW5kRE1Gb3JVc2VyKGNsaWVudCwgdXNlcklkKTtcbiAgICBsZXQgcm9vbUlkO1xuICAgIGlmIChleGlzdGluZ0RNUm9vbSkge1xuICAgICAgICByb29tSWQgPSBleGlzdGluZ0RNUm9vbS5yb29tSWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGVuY3J5cHRpb246IGJvb2xlYW4gPSB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChwcml2YXRlU2hvdWxkQmVFbmNyeXB0ZWQoKSkge1xuICAgICAgICAgICAgZW5jcnlwdGlvbiA9IGF3YWl0IGNhbkVuY3J5cHRUb0FsbFVzZXJzKGNsaWVudCwgW3VzZXJJZF0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcm9vbUlkID0gYXdhaXQgY3JlYXRlUm9vbSh7IGVuY3J5cHRpb24sIGRtVXNlcklkOiB1c2VySWQsIHNwaW5uZXI6IGZhbHNlLCBhbmRWaWV3OiBmYWxzZSB9KTtcbiAgICAgICAgYXdhaXQgd2FpdEZvck1lbWJlcihjbGllbnQsIHJvb21JZCwgdXNlcklkKTtcbiAgICB9XG4gICAgcmV0dXJuIHJvb21JZDtcbn1cbiJdLCJtYXBwaW5n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