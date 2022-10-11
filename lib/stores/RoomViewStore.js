"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RoomViewStore = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _utils = require("flux/utils");

var _logger = require("matrix-js-sdk/src/logger");

var _partials = require("matrix-js-sdk/src/@types/partials");

var _dispatcher = _interopRequireDefault(require("../dispatcher/dispatcher"));

var _MatrixClientPeg = require("../MatrixClientPeg");

var _Modal = _interopRequireDefault(require("../Modal"));

var _languageHandler = require("../languageHandler");

var _RoomAliasCache = require("../RoomAliasCache");

var _actions = require("../dispatcher/actions");

var _promise = require("../utils/promise");

var _RoomContext = require("../contexts/RoomContext");

var _PosthogAnalytics = require("../PosthogAnalytics");

var _DMRoomMap = _interopRequireDefault(require("../utils/DMRoomMap"));

var _SpaceStore = _interopRequireDefault(require("./spaces/SpaceStore"));

var _spaces = require("./spaces");

var _ErrorDialog = _interopRequireDefault(require("../components/views/dialogs/ErrorDialog"));

var _RoomUpgrade = require("../utils/RoomUpgrade");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

const NUM_JOIN_RETRY = 5;
const INITIAL_STATE = {
  // Whether we're joining the currently viewed room (see isJoining())
  joining: false,
  // Any error that has occurred during joining
  joinError: null,
  // The room ID of the room currently being viewed
  roomId: null,
  // The event to scroll to when the room is first viewed
  initialEventId: null,
  initialEventPixelOffset: null,
  // Whether to highlight the initial event
  isInitialEventHighlighted: false,
  // whether to scroll `event_id` into view
  initialEventScrollIntoView: true,
  // The room alias of the room (or null if not originally specified in view_room)
  roomAlias: null,
  // Whether the current room is loading
  roomLoading: false,
  // Any error that has occurred during loading
  roomLoadError: null,
  replyingToEvent: null,
  shouldPeek: false,
  viaServers: [],
  wasContextSwitch: false
};

/**
 * A class for storing application state for RoomView. This is the RoomView's interface
*  with a subset of the js-sdk.
 *  ```
 */
class RoomViewStore extends _utils.Store {
  // Important: This cannot be a dynamic getter (lazily-constructed instance) because
  // otherwise we'll miss view_room dispatches during startup, breaking relaunches of
  // the app. We need to eagerly create the instance.
  // initialize state
  // Keep these out of state to avoid causing excessive/recursive updates
  constructor() {
    super(_dispatcher.default);
    (0, _defineProperty2.default)(this, "state", INITIAL_STATE);
    (0, _defineProperty2.default)(this, "roomIdActivityListeners", {});
  }

  addRoomListener(roomId, fn) {
    if (!this.roomIdActivityListeners[roomId]) this.roomIdActivityListeners[roomId] = [];
    this.roomIdActivityListeners[roomId].push(fn);
  }

  removeRoomListener(roomId, fn) {
    if (this.roomIdActivityListeners[roomId]) {
      const i = this.roomIdActivityListeners[roomId].indexOf(fn);

      if (i > -1) {
        this.roomIdActivityListeners[roomId].splice(i, 1);
      }
    } else {
      _logger.logger.warn("Unregistering unrecognised listener (roomId=" + roomId + ")");
    }
  }

  emitForRoom(roomId, isActive) {
    if (!this.roomIdActivityListeners[roomId]) return;

    for (const fn of this.roomIdActivityListeners[roomId]) {
      fn.call(null, isActive);
    }
  }

  setState(newState) {
    // If values haven't changed, there's nothing to do.
    // This only tries a shallow comparison, so unchanged objects will slip
    // through, but that's probably okay for now.
    let stateChanged = false;

    for (const key of Object.keys(newState)) {
      if (this.state[key] !== newState[key]) {
        stateChanged = true;
        break;
      }
    }

    if (!stateChanged) {
      return;
    }

    const lastRoomId = this.state.roomId;
    this.state = Object.assign(this.state, newState);

    if (lastRoomId !== this.state.roomId) {
      if (lastRoomId) this.emitForRoom(lastRoomId, false);
      if (this.state.roomId) this.emitForRoom(this.state.roomId, true); // Fired so we can reduce dependency on event emitters to this store, which is relatively
      // central to the application and can easily cause import cycles.

      _dispatcher.default.dispatch({
        action: _actions.Action.ActiveRoomChanged,
        oldRoomId: lastRoomId,
        newRoomId: this.state.roomId
      });
    }

    this.__emitChange();
  }

  __onDispatch(payload) {
    // eslint-disable-line @typescript-eslint/naming-convention
    switch (payload.action) {
      // view_room:
      //      - room_alias:   '#somealias:matrix.org'
      //      - room_id:      '!roomid123:matrix.org'
      //      - event_id:     '$213456782:matrix.org'
      //      - event_offset: 100
      //      - highlighted:  true
      case _actions.Action.ViewRoom:
        this.viewRoom(payload);
        break;
      // for these events blank out the roomId as we are no longer in the RoomView

      case 'view_welcome_page':
      case _actions.Action.ViewHomePage:
        this.setState({
          roomId: null,
          roomAlias: null,
          viaServers: [],
          wasContextSwitch: false
        });
        break;

      case _actions.Action.ViewRoomError:
        this.viewRoomError(payload);
        break;

      case 'will_join':
        this.setState({
          joining: true
        });
        break;

      case 'cancel_join':
        this.setState({
          joining: false
        });
        break;
      // join_room:
      //      - opts: options for joinRoom

      case _actions.Action.JoinRoom:
        this.joinRoom(payload);
        break;

      case _actions.Action.JoinRoomError:
        this.joinRoomError(payload);
        break;

      case _actions.Action.JoinRoomReady:
        {
          if (this.state.roomId === payload.roomId) {
            this.setState({
              shouldPeek: false
            });
          }

          (0, _RoomUpgrade.awaitRoomDownSync)(_MatrixClientPeg.MatrixClientPeg.get(), payload.roomId).then(room => {
            const numMembers = room.getJoinedMemberCount();
            const roomSize = numMembers > 1000 ? "MoreThanAThousand" : numMembers > 100 ? "OneHundredAndOneToAThousand" : numMembers > 10 ? "ElevenToOneHundred" : numMembers > 2 ? "ThreeToTen" : numMembers > 1 ? "Two" : "One";

            _PosthogAnalytics.PosthogAnalytics.instance.trackEvent({
              eventName: "JoinedRoom",
              trigger: payload.metricsTrigger,
              roomSize,
              isDM: !!_DMRoomMap.default.shared().getUserIdForRoomId(room.roomId),
              isSpace: room.isSpaceRoom()
            });
          });
          break;
        }

      case 'on_client_not_viable':
      case _actions.Action.OnLoggedOut:
        this.reset();
        break;

      case 'reply_to_event':
        // If currently viewed room does not match the room in which we wish to reply then change rooms
        // this can happen when performing a search across all rooms. Persist the data from this event for
        // both room and search timeline rendering types, search will get auto-closed by RoomView at this time.
        if ([_RoomContext.TimelineRenderingType.Room, _RoomContext.TimelineRenderingType.Search].includes(payload.context)) {
          if (payload.event && payload.event.getRoomId() !== this.state.roomId) {
            _dispatcher.default.dispatch({
              action: _actions.Action.ViewRoom,
              room_id: payload.event.getRoomId(),
              replyingToEvent: payload.event,
              metricsTrigger: undefined // room doesn't change

            });
          } else {
            this.setState({
              replyingToEvent: payload.event
            });
          }
        }

        break;
    }
  }

  async viewRoom(payload) {
    if (payload.room_id) {
      if (payload.metricsTrigger !== null && payload.room_id !== this.state.roomId) {
        let activeSpace;

        if (_SpaceStore.default.instance.activeSpace === _spaces.MetaSpace.Home) {
          activeSpace = "Home";
        } else if ((0, _spaces.isMetaSpace)(_SpaceStore.default.instance.activeSpace)) {
          activeSpace = "Meta";
        } else {
          activeSpace = _SpaceStore.default.instance.activeSpaceRoom.getJoinRule() === _partials.JoinRule.Public ? "Public" : "Private";
        }

        _PosthogAnalytics.PosthogAnalytics.instance.trackEvent({
          eventName: "ViewRoom",
          trigger: payload.metricsTrigger,
          viaKeyboard: payload.metricsViaKeyboard,
          isDM: !!_DMRoomMap.default.shared().getUserIdForRoomId(payload.room_id),
          isSpace: _MatrixClientPeg.MatrixClientPeg.get().getRoom(payload.room_id)?.isSpaceRoom(),
          activeSpace
        });
      }

      const newState = {
        roomId: payload.room_id,
        roomAlias: payload.room_alias,
        initialEventId: payload.event_id,
        isInitialEventHighlighted: payload.highlighted,
        initialEventScrollIntoView: payload.scroll_into_view ?? true,
        roomLoading: false,
        roomLoadError: null,
        // should peek by default
        shouldPeek: payload.should_peek === undefined ? true : payload.should_peek,
        // have we sent a join request for this room and are waiting for a response?
        joining: payload.joining || false,
        // Reset replyingToEvent because we don't want cross-room because bad UX
        replyingToEvent: null,
        viaServers: payload.via_servers,
        wasContextSwitch: payload.context_switch
      }; // Allow being given an event to be replied to when switching rooms but sanity check its for this room

      if (payload.replyingToEvent?.getRoomId() === payload.room_id) {
        newState.replyingToEvent = payload.replyingToEvent;
      } else if (this.state.roomId === payload.room_id) {
        // if the room isn't being changed, e.g visiting a permalink then maintain replyingToEvent
        newState.replyingToEvent = this.state.replyingToEvent;
      }

      this.setState(newState);

      if (payload.auto_join) {
        _dispatcher.default.dispatch(_objectSpread(_objectSpread({}, payload), {}, {
          action: _actions.Action.JoinRoom,
          roomId: payload.room_id,
          metricsTrigger: payload.metricsTrigger
        }));
      }
    } else if (payload.room_alias) {
      // Try the room alias to room ID navigation cache first to avoid
      // blocking room navigation on the homeserver.
      let roomId = (0, _RoomAliasCache.getCachedRoomIDForAlias)(payload.room_alias);

      if (!roomId) {
        // Room alias cache miss, so let's ask the homeserver. Resolve the alias
        // and then do a second dispatch with the room ID acquired.
        this.setState({
          roomId: null,
          initialEventId: null,
          initialEventPixelOffset: null,
          isInitialEventHighlighted: null,
          initialEventScrollIntoView: true,
          roomAlias: payload.room_alias,
          roomLoading: true,
          roomLoadError: null,
          viaServers: payload.via_servers,
          wasContextSwitch: payload.context_switch
        });

        try {
          const result = await _MatrixClientPeg.MatrixClientPeg.get().getRoomIdForAlias(payload.room_alias);
          (0, _RoomAliasCache.storeRoomAliasInCache)(payload.room_alias, result.room_id);
          roomId = result.room_id;
        } catch (err) {
          _logger.logger.error("RVS failed to get room id for alias: ", err);

          _dispatcher.default.dispatch({
            action: _actions.Action.ViewRoomError,
            room_id: null,
            room_alias: payload.room_alias,
            err
          });

          return;
        }
      } // Re-fire the payload with the newly found room_id


      _dispatcher.default.dispatch(_objectSpread(_objectSpread({}, payload), {}, {
        room_id: roomId
      }));
    }
  }

  viewRoomError(payload) {
    this.setState({
      roomId: payload.room_id,
      roomAlias: payload.room_alias,
      roomLoading: false,
      roomLoadError: payload.err
    });
  }

  async joinRoom(payload) {
    this.setState({
      joining: true
    });

    const cli = _MatrixClientPeg.MatrixClientPeg.get(); // take a copy of roomAlias & roomId as they may change by the time the join is complete


    const {
      roomAlias,
      roomId
    } = this.state;
    const address = roomAlias || roomId;
    const viaServers = this.state.viaServers || [];

    try {
      await (0, _promise.retry)(() => cli.joinRoom(address, _objectSpread({
        viaServers
      }, payload.opts || {})), NUM_JOIN_RETRY, err => {
        // if we received a Gateway timeout then retry
        return err.httpStatus === 504;
      }); // We do *not* clear the 'joining' flag because the Room object and/or our 'joined' member event may not
      // have come down the sync stream yet, and that's the point at which we'd consider the user joined to the
      // room.

      _dispatcher.default.dispatch({
        action: _actions.Action.JoinRoomReady,
        roomId,
        metricsTrigger: payload.metricsTrigger
      });
    } catch (err) {
      _dispatcher.default.dispatch({
        action: _actions.Action.JoinRoomError,
        roomId,
        err
      });
    }
  }

  getInvitingUserId(roomId) {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const room = cli.getRoom(roomId);

    if (room?.getMyMembership() === "invite") {
      const myMember = room.getMember(cli.getUserId());
      const inviteEvent = myMember ? myMember.events.member : null;
      return inviteEvent && inviteEvent.getSender();
    }
  }

  showJoinRoomError(err, roomId) {
    let description = err.message ? err.message : JSON.stringify(err);

    _logger.logger.log("Failed to join room:", description);

    if (err.name === "ConnectionError") {
      description = (0, _languageHandler._t)("There was an error joining.");
    } else if (err.errcode === 'M_INCOMPATIBLE_ROOM_VERSION') {
      description = /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Sorry, your homeserver is too old to participate here."), /*#__PURE__*/_react.default.createElement("br", null), (0, _languageHandler._t)("Please contact your homeserver administrator."));
    } else if (err.httpStatus === 404) {
      const invitingUserId = this.getInvitingUserId(roomId); // only provide a better error message for invites

      if (invitingUserId) {
        // if the inviting user is on the same HS, there can only be one cause: they left.
        if (invitingUserId.endsWith(`:${_MatrixClientPeg.MatrixClientPeg.get().getDomain()}`)) {
          description = (0, _languageHandler._t)("The person who invited you has already left.");
        } else {
          description = (0, _languageHandler._t)("The person who invited you has already left, or their server is offline.");
        }
      }
    }

    _Modal.default.createDialog(_ErrorDialog.default, {
      title: (0, _languageHandler._t)("Failed to join"),
      description
    });
  }

  joinRoomError(payload) {
    this.setState({
      joining: false,
      joinError: payload.err
    });
    this.showJoinRoomError(payload.err, payload.roomId);
  }

  reset() {
    this.state = Object.assign({}, INITIAL_STATE);
  } // The room ID of the room currently being viewed


  getRoomId() {
    return this.state.roomId;
  } // The event to scroll to when the room is first viewed


  getInitialEventId() {
    return this.state.initialEventId;
  } // Whether to highlight the initial event


  isInitialEventHighlighted() {
    return this.state.isInitialEventHighlighted;
  } // Whether to avoid jumping to the initial event


  initialEventScrollIntoView() {
    return this.state.initialEventScrollIntoView;
  } // The room alias of the room (or null if not originally specified in view_room)


  getRoomAlias() {
    return this.state.roomAlias;
  } // Whether the current room is loading (true whilst resolving an alias)


  isRoomLoading() {
    return this.state.roomLoading;
  } // Any error that has occurred during loading


  getRoomLoadError() {
    return this.state.roomLoadError;
  } // True if we're expecting the user to be joined to the room currently being
  // viewed. Note that this is left true after the join request has finished,
  // since we should still consider a join to be in progress until the room
  // & member events come down the sync.
  //
  // This flag remains true after the room has been successfully joined,
  // (this store doesn't listen for the appropriate member events)
  // so you should always observe the joined state from the member event
  // if a room object is present.
  // ie. The correct logic is:
  // if (room) {
  //     if (myMember.membership == 'joined') {
  //         // user is joined to the room
  //     } else {
  //         // Not joined
  //     }
  // } else {
  //     if (RoomViewStore.instance.isJoining()) {
  //         // show spinner
  //     } else {
  //         // show join prompt
  //     }
  // }


  isJoining() {
    return this.state.joining;
  } // Any error that has occurred during joining


  getJoinError() {
    return this.state.joinError;
  } // The mxEvent if one is currently being replied to/quoted


  getQuotingEvent() {
    return this.state.replyingToEvent;
  }

  shouldPeek() {
    return this.state.shouldPeek;
  }

  getWasContextSwitch() {
    return this.state.wasContextSwitch;
  }

}

exports.RoomViewStore = RoomViewStore;
(0, _defineProperty2.default)(RoomViewStore, "instance", new RoomViewStore());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOVU1fSk9JTl9SRVRSWSIsIklOSVRJQUxfU1RBVEUiLCJqb2luaW5nIiwiam9pbkVycm9yIiwicm9vbUlkIiwiaW5pdGlhbEV2ZW50SWQiLCJpbml0aWFsRXZlbnRQaXhlbE9mZnNldCIsImlzSW5pdGlhbEV2ZW50SGlnaGxpZ2h0ZWQiLCJpbml0aWFsRXZlbnRTY3JvbGxJbnRvVmlldyIsInJvb21BbGlhcyIsInJvb21Mb2FkaW5nIiwicm9vbUxvYWRFcnJvciIsInJlcGx5aW5nVG9FdmVudCIsInNob3VsZFBlZWsiLCJ2aWFTZXJ2ZXJzIiwid2FzQ29udGV4dFN3aXRjaCIsIlJvb21WaWV3U3RvcmUiLCJTdG9yZSIsImNvbnN0cnVjdG9yIiwiZGlzIiwiYWRkUm9vbUxpc3RlbmVyIiwiZm4iLCJyb29tSWRBY3Rpdml0eUxpc3RlbmVycyIsInB1c2giLCJyZW1vdmVSb29tTGlzdGVuZXIiLCJpIiwiaW5kZXhPZiIsInNwbGljZSIsImxvZ2dlciIsIndhcm4iLCJlbWl0Rm9yUm9vbSIsImlzQWN0aXZlIiwiY2FsbCIsInNldFN0YXRlIiwibmV3U3RhdGUiLCJzdGF0ZUNoYW5nZWQiLCJrZXkiLCJPYmplY3QiLCJrZXlzIiwic3RhdGUiLCJsYXN0Um9vbUlkIiwiYXNzaWduIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJBY3Rpb24iLCJBY3RpdmVSb29tQ2hhbmdlZCIsIm9sZFJvb21JZCIsIm5ld1Jvb21JZCIsIl9fZW1pdENoYW5nZSIsIl9fb25EaXNwYXRjaCIsInBheWxvYWQiLCJWaWV3Um9vbSIsInZpZXdSb29tIiwiVmlld0hvbWVQYWdlIiwiVmlld1Jvb21FcnJvciIsInZpZXdSb29tRXJyb3IiLCJKb2luUm9vbSIsImpvaW5Sb29tIiwiSm9pblJvb21FcnJvciIsImpvaW5Sb29tRXJyb3IiLCJKb2luUm9vbVJlYWR5IiwiYXdhaXRSb29tRG93blN5bmMiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJ0aGVuIiwicm9vbSIsIm51bU1lbWJlcnMiLCJnZXRKb2luZWRNZW1iZXJDb3VudCIsInJvb21TaXplIiwiUG9zdGhvZ0FuYWx5dGljcyIsImluc3RhbmNlIiwidHJhY2tFdmVudCIsImV2ZW50TmFtZSIsInRyaWdnZXIiLCJtZXRyaWNzVHJpZ2dlciIsImlzRE0iLCJETVJvb21NYXAiLCJzaGFyZWQiLCJnZXRVc2VySWRGb3JSb29tSWQiLCJpc1NwYWNlIiwiaXNTcGFjZVJvb20iLCJPbkxvZ2dlZE91dCIsInJlc2V0IiwiVGltZWxpbmVSZW5kZXJpbmdUeXBlIiwiUm9vbSIsIlNlYXJjaCIsImluY2x1ZGVzIiwiY29udGV4dCIsImV2ZW50IiwiZ2V0Um9vbUlkIiwicm9vbV9pZCIsInVuZGVmaW5lZCIsImFjdGl2ZVNwYWNlIiwiU3BhY2VTdG9yZSIsIk1ldGFTcGFjZSIsIkhvbWUiLCJpc01ldGFTcGFjZSIsImFjdGl2ZVNwYWNlUm9vbSIsImdldEpvaW5SdWxlIiwiSm9pblJ1bGUiLCJQdWJsaWMiLCJ2aWFLZXlib2FyZCIsIm1ldHJpY3NWaWFLZXlib2FyZCIsImdldFJvb20iLCJyb29tX2FsaWFzIiwiZXZlbnRfaWQiLCJoaWdobGlnaHRlZCIsInNjcm9sbF9pbnRvX3ZpZXciLCJzaG91bGRfcGVlayIsInZpYV9zZXJ2ZXJzIiwiY29udGV4dF9zd2l0Y2giLCJhdXRvX2pvaW4iLCJnZXRDYWNoZWRSb29tSURGb3JBbGlhcyIsInJlc3VsdCIsImdldFJvb21JZEZvckFsaWFzIiwic3RvcmVSb29tQWxpYXNJbkNhY2hlIiwiZXJyIiwiZXJyb3IiLCJjbGkiLCJhZGRyZXNzIiwicmV0cnkiLCJvcHRzIiwiaHR0cFN0YXR1cyIsImdldEludml0aW5nVXNlcklkIiwiZ2V0TXlNZW1iZXJzaGlwIiwibXlNZW1iZXIiLCJnZXRNZW1iZXIiLCJnZXRVc2VySWQiLCJpbnZpdGVFdmVudCIsImV2ZW50cyIsIm1lbWJlciIsImdldFNlbmRlciIsInNob3dKb2luUm9vbUVycm9yIiwiZGVzY3JpcHRpb24iLCJtZXNzYWdlIiwiSlNPTiIsInN0cmluZ2lmeSIsImxvZyIsIm5hbWUiLCJfdCIsImVycmNvZGUiLCJpbnZpdGluZ1VzZXJJZCIsImVuZHNXaXRoIiwiZ2V0RG9tYWluIiwiTW9kYWwiLCJjcmVhdGVEaWFsb2ciLCJFcnJvckRpYWxvZyIsInRpdGxlIiwiZ2V0SW5pdGlhbEV2ZW50SWQiLCJnZXRSb29tQWxpYXMiLCJpc1Jvb21Mb2FkaW5nIiwiZ2V0Um9vbUxvYWRFcnJvciIsImlzSm9pbmluZyIsImdldEpvaW5FcnJvciIsImdldFF1b3RpbmdFdmVudCIsImdldFdhc0NvbnRleHRTd2l0Y2giXSwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RvcmVzL1Jvb21WaWV3U3RvcmUudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNyBWZWN0b3IgQ3JlYXRpb25zIEx0ZFxuQ29weXJpZ2h0IDIwMTcsIDIwMTggTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IC0gMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBSZWFjdE5vZGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IFN0b3JlIH0gZnJvbSAnZmx1eC91dGlscyc7XG5pbXBvcnQgeyBNYXRyaXhFcnJvciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9odHRwLWFwaVwiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuaW1wb3J0IHsgVmlld1Jvb20gYXMgVmlld1Jvb21FdmVudCB9IGZyb20gXCJAbWF0cml4LW9yZy9hbmFseXRpY3MtZXZlbnRzL3R5cGVzL3R5cGVzY3JpcHQvVmlld1Jvb21cIjtcbmltcG9ydCB7IEpvaW5lZFJvb20gYXMgSm9pbmVkUm9vbUV2ZW50IH0gZnJvbSBcIkBtYXRyaXgtb3JnL2FuYWx5dGljcy1ldmVudHMvdHlwZXMvdHlwZXNjcmlwdC9Kb2luZWRSb29tXCI7XG5pbXBvcnQgeyBKb2luUnVsZSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvcGFydGlhbHNcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCB7IE1hdHJpeEV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudFwiO1xuaW1wb3J0IHsgT3B0aW9uYWwgfSBmcm9tIFwibWF0cml4LWV2ZW50cy1zZGtcIjtcblxuaW1wb3J0IGRpcyBmcm9tICcuLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSAnLi4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCBNb2RhbCBmcm9tICcuLi9Nb2RhbCc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgeyBnZXRDYWNoZWRSb29tSURGb3JBbGlhcywgc3RvcmVSb29tQWxpYXNJbkNhY2hlIH0gZnJvbSAnLi4vUm9vbUFsaWFzQ2FjaGUnO1xuaW1wb3J0IHsgQWN0aW9uUGF5bG9hZCB9IGZyb20gXCIuLi9kaXNwYXRjaGVyL3BheWxvYWRzXCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQgeyByZXRyeSB9IGZyb20gXCIuLi91dGlscy9wcm9taXNlXCI7XG5pbXBvcnQgeyBUaW1lbGluZVJlbmRlcmluZ1R5cGUgfSBmcm9tIFwiLi4vY29udGV4dHMvUm9vbUNvbnRleHRcIjtcbmltcG9ydCB7IFBvc3Rob2dBbmFseXRpY3MgfSBmcm9tIFwiLi4vUG9zdGhvZ0FuYWx5dGljc1wiO1xuaW1wb3J0IHsgVmlld1Jvb21QYXlsb2FkIH0gZnJvbSBcIi4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvVmlld1Jvb21QYXlsb2FkXCI7XG5pbXBvcnQgRE1Sb29tTWFwIGZyb20gXCIuLi91dGlscy9ETVJvb21NYXBcIjtcbmltcG9ydCBTcGFjZVN0b3JlIGZyb20gXCIuL3NwYWNlcy9TcGFjZVN0b3JlXCI7XG5pbXBvcnQgeyBpc01ldGFTcGFjZSwgTWV0YVNwYWNlIH0gZnJvbSBcIi4vc3BhY2VzXCI7XG5pbXBvcnQgeyBKb2luUm9vbVBheWxvYWQgfSBmcm9tIFwiLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9Kb2luUm9vbVBheWxvYWRcIjtcbmltcG9ydCB7IEpvaW5Sb29tUmVhZHlQYXlsb2FkIH0gZnJvbSBcIi4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvSm9pblJvb21SZWFkeVBheWxvYWRcIjtcbmltcG9ydCB7IEpvaW5Sb29tRXJyb3JQYXlsb2FkIH0gZnJvbSBcIi4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvSm9pblJvb21FcnJvclBheWxvYWRcIjtcbmltcG9ydCB7IFZpZXdSb29tRXJyb3JQYXlsb2FkIH0gZnJvbSBcIi4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvVmlld1Jvb21FcnJvclBheWxvYWRcIjtcbmltcG9ydCBFcnJvckRpYWxvZyBmcm9tIFwiLi4vY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL0Vycm9yRGlhbG9nXCI7XG5pbXBvcnQgeyBBY3RpdmVSb29tQ2hhbmdlZFBheWxvYWQgfSBmcm9tIFwiLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9BY3RpdmVSb29tQ2hhbmdlZFBheWxvYWRcIjtcbmltcG9ydCB7IGF3YWl0Um9vbURvd25TeW5jIH0gZnJvbSBcIi4uL3V0aWxzL1Jvb21VcGdyYWRlXCI7XG5cbmNvbnN0IE5VTV9KT0lOX1JFVFJZID0gNTtcblxuY29uc3QgSU5JVElBTF9TVEFURSA9IHtcbiAgICAvLyBXaGV0aGVyIHdlJ3JlIGpvaW5pbmcgdGhlIGN1cnJlbnRseSB2aWV3ZWQgcm9vbSAoc2VlIGlzSm9pbmluZygpKVxuICAgIGpvaW5pbmc6IGZhbHNlLFxuICAgIC8vIEFueSBlcnJvciB0aGF0IGhhcyBvY2N1cnJlZCBkdXJpbmcgam9pbmluZ1xuICAgIGpvaW5FcnJvcjogbnVsbCBhcyBFcnJvcixcbiAgICAvLyBUaGUgcm9vbSBJRCBvZiB0aGUgcm9vbSBjdXJyZW50bHkgYmVpbmcgdmlld2VkXG4gICAgcm9vbUlkOiBudWxsIGFzIHN0cmluZyxcblxuICAgIC8vIFRoZSBldmVudCB0byBzY3JvbGwgdG8gd2hlbiB0aGUgcm9vbSBpcyBmaXJzdCB2aWV3ZWRcbiAgICBpbml0aWFsRXZlbnRJZDogbnVsbCBhcyBzdHJpbmcsXG4gICAgaW5pdGlhbEV2ZW50UGl4ZWxPZmZzZXQ6IG51bGwgYXMgbnVtYmVyLFxuICAgIC8vIFdoZXRoZXIgdG8gaGlnaGxpZ2h0IHRoZSBpbml0aWFsIGV2ZW50XG4gICAgaXNJbml0aWFsRXZlbnRIaWdobGlnaHRlZDogZmFsc2UsXG4gICAgLy8gd2hldGhlciB0byBzY3JvbGwgYGV2ZW50X2lkYCBpbnRvIHZpZXdcbiAgICBpbml0aWFsRXZlbnRTY3JvbGxJbnRvVmlldzogdHJ1ZSxcblxuICAgIC8vIFRoZSByb29tIGFsaWFzIG9mIHRoZSByb29tIChvciBudWxsIGlmIG5vdCBvcmlnaW5hbGx5IHNwZWNpZmllZCBpbiB2aWV3X3Jvb20pXG4gICAgcm9vbUFsaWFzOiBudWxsIGFzIHN0cmluZyxcbiAgICAvLyBXaGV0aGVyIHRoZSBjdXJyZW50IHJvb20gaXMgbG9hZGluZ1xuICAgIHJvb21Mb2FkaW5nOiBmYWxzZSxcbiAgICAvLyBBbnkgZXJyb3IgdGhhdCBoYXMgb2NjdXJyZWQgZHVyaW5nIGxvYWRpbmdcbiAgICByb29tTG9hZEVycm9yOiBudWxsIGFzIE1hdHJpeEVycm9yLFxuXG4gICAgcmVwbHlpbmdUb0V2ZW50OiBudWxsIGFzIE1hdHJpeEV2ZW50LFxuXG4gICAgc2hvdWxkUGVlazogZmFsc2UsXG5cbiAgICB2aWFTZXJ2ZXJzOiBbXSBhcyBzdHJpbmdbXSxcblxuICAgIHdhc0NvbnRleHRTd2l0Y2g6IGZhbHNlLFxufTtcblxudHlwZSBMaXN0ZW5lciA9IChpc0FjdGl2ZTogYm9vbGVhbikgPT4gdm9pZDtcblxuLyoqXG4gKiBBIGNsYXNzIGZvciBzdG9yaW5nIGFwcGxpY2F0aW9uIHN0YXRlIGZvciBSb29tVmlldy4gVGhpcyBpcyB0aGUgUm9vbVZpZXcncyBpbnRlcmZhY2VcbiogIHdpdGggYSBzdWJzZXQgb2YgdGhlIGpzLXNkay5cbiAqICBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFJvb21WaWV3U3RvcmUgZXh0ZW5kcyBTdG9yZTxBY3Rpb25QYXlsb2FkPiB7XG4gICAgLy8gSW1wb3J0YW50OiBUaGlzIGNhbm5vdCBiZSBhIGR5bmFtaWMgZ2V0dGVyIChsYXppbHktY29uc3RydWN0ZWQgaW5zdGFuY2UpIGJlY2F1c2VcbiAgICAvLyBvdGhlcndpc2Ugd2UnbGwgbWlzcyB2aWV3X3Jvb20gZGlzcGF0Y2hlcyBkdXJpbmcgc3RhcnR1cCwgYnJlYWtpbmcgcmVsYXVuY2hlcyBvZlxuICAgIC8vIHRoZSBhcHAuIFdlIG5lZWQgdG8gZWFnZXJseSBjcmVhdGUgdGhlIGluc3RhbmNlLlxuICAgIHB1YmxpYyBzdGF0aWMgcmVhZG9ubHkgaW5zdGFuY2UgPSBuZXcgUm9vbVZpZXdTdG9yZSgpO1xuXG4gICAgcHJpdmF0ZSBzdGF0ZSA9IElOSVRJQUxfU1RBVEU7IC8vIGluaXRpYWxpemUgc3RhdGVcblxuICAgIC8vIEtlZXAgdGhlc2Ugb3V0IG9mIHN0YXRlIHRvIGF2b2lkIGNhdXNpbmcgZXhjZXNzaXZlL3JlY3Vyc2l2ZSB1cGRhdGVzXG4gICAgcHJpdmF0ZSByb29tSWRBY3Rpdml0eUxpc3RlbmVyczogUmVjb3JkPHN0cmluZywgTGlzdGVuZXJbXT4gPSB7fTtcblxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoZGlzKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkUm9vbUxpc3RlbmVyKHJvb21JZDogc3RyaW5nLCBmbjogTGlzdGVuZXIpOiB2b2lkIHtcbiAgICAgICAgaWYgKCF0aGlzLnJvb21JZEFjdGl2aXR5TGlzdGVuZXJzW3Jvb21JZF0pIHRoaXMucm9vbUlkQWN0aXZpdHlMaXN0ZW5lcnNbcm9vbUlkXSA9IFtdO1xuICAgICAgICB0aGlzLnJvb21JZEFjdGl2aXR5TGlzdGVuZXJzW3Jvb21JZF0ucHVzaChmbik7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbW92ZVJvb21MaXN0ZW5lcihyb29tSWQ6IHN0cmluZywgZm46IExpc3RlbmVyKTogdm9pZCB7XG4gICAgICAgIGlmICh0aGlzLnJvb21JZEFjdGl2aXR5TGlzdGVuZXJzW3Jvb21JZF0pIHtcbiAgICAgICAgICAgIGNvbnN0IGkgPSB0aGlzLnJvb21JZEFjdGl2aXR5TGlzdGVuZXJzW3Jvb21JZF0uaW5kZXhPZihmbik7XG4gICAgICAgICAgICBpZiAoaSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yb29tSWRBY3Rpdml0eUxpc3RlbmVyc1tyb29tSWRdLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxvZ2dlci53YXJuKFwiVW5yZWdpc3RlcmluZyB1bnJlY29nbmlzZWQgbGlzdGVuZXIgKHJvb21JZD1cIiArIHJvb21JZCArIFwiKVwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZW1pdEZvclJvb20ocm9vbUlkOiBzdHJpbmcsIGlzQWN0aXZlOiBib29sZWFuKTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy5yb29tSWRBY3Rpdml0eUxpc3RlbmVyc1tyb29tSWRdKSByZXR1cm47XG5cbiAgICAgICAgZm9yIChjb25zdCBmbiBvZiB0aGlzLnJvb21JZEFjdGl2aXR5TGlzdGVuZXJzW3Jvb21JZF0pIHtcbiAgICAgICAgICAgIGZuLmNhbGwobnVsbCwgaXNBY3RpdmUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXRTdGF0ZShuZXdTdGF0ZTogUGFydGlhbDx0eXBlb2YgSU5JVElBTF9TVEFURT4pOiB2b2lkIHtcbiAgICAgICAgLy8gSWYgdmFsdWVzIGhhdmVuJ3QgY2hhbmdlZCwgdGhlcmUncyBub3RoaW5nIHRvIGRvLlxuICAgICAgICAvLyBUaGlzIG9ubHkgdHJpZXMgYSBzaGFsbG93IGNvbXBhcmlzb24sIHNvIHVuY2hhbmdlZCBvYmplY3RzIHdpbGwgc2xpcFxuICAgICAgICAvLyB0aHJvdWdoLCBidXQgdGhhdCdzIHByb2JhYmx5IG9rYXkgZm9yIG5vdy5cbiAgICAgICAgbGV0IHN0YXRlQ2hhbmdlZCA9IGZhbHNlO1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhuZXdTdGF0ZSkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlW2tleV0gIT09IG5ld1N0YXRlW2tleV0pIHtcbiAgICAgICAgICAgICAgICBzdGF0ZUNoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghc3RhdGVDaGFuZ2VkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBsYXN0Um9vbUlkID0gdGhpcy5zdGF0ZS5yb29tSWQ7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBPYmplY3QuYXNzaWduKHRoaXMuc3RhdGUsIG5ld1N0YXRlKTtcbiAgICAgICAgaWYgKGxhc3RSb29tSWQgIT09IHRoaXMuc3RhdGUucm9vbUlkKSB7XG4gICAgICAgICAgICBpZiAobGFzdFJvb21JZCkgdGhpcy5lbWl0Rm9yUm9vbShsYXN0Um9vbUlkLCBmYWxzZSk7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5yb29tSWQpIHRoaXMuZW1pdEZvclJvb20odGhpcy5zdGF0ZS5yb29tSWQsIHRydWUpO1xuXG4gICAgICAgICAgICAvLyBGaXJlZCBzbyB3ZSBjYW4gcmVkdWNlIGRlcGVuZGVuY3kgb24gZXZlbnQgZW1pdHRlcnMgdG8gdGhpcyBzdG9yZSwgd2hpY2ggaXMgcmVsYXRpdmVseVxuICAgICAgICAgICAgLy8gY2VudHJhbCB0byB0aGUgYXBwbGljYXRpb24gYW5kIGNhbiBlYXNpbHkgY2F1c2UgaW1wb3J0IGN5Y2xlcy5cbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaDxBY3RpdmVSb29tQ2hhbmdlZFBheWxvYWQ+KHtcbiAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5BY3RpdmVSb29tQ2hhbmdlZCxcbiAgICAgICAgICAgICAgICBvbGRSb29tSWQ6IGxhc3RSb29tSWQsXG4gICAgICAgICAgICAgICAgbmV3Um9vbUlkOiB0aGlzLnN0YXRlLnJvb21JZCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fX2VtaXRDaGFuZ2UoKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgX19vbkRpc3BhdGNoKHBheWxvYWQpOiB2b2lkIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbmFtaW5nLWNvbnZlbnRpb25cbiAgICAgICAgc3dpdGNoIChwYXlsb2FkLmFjdGlvbikge1xuICAgICAgICAgICAgLy8gdmlld19yb29tOlxuICAgICAgICAgICAgLy8gICAgICAtIHJvb21fYWxpYXM6ICAgJyNzb21lYWxpYXM6bWF0cml4Lm9yZydcbiAgICAgICAgICAgIC8vICAgICAgLSByb29tX2lkOiAgICAgICchcm9vbWlkMTIzOm1hdHJpeC5vcmcnXG4gICAgICAgICAgICAvLyAgICAgIC0gZXZlbnRfaWQ6ICAgICAnJDIxMzQ1Njc4MjptYXRyaXgub3JnJ1xuICAgICAgICAgICAgLy8gICAgICAtIGV2ZW50X29mZnNldDogMTAwXG4gICAgICAgICAgICAvLyAgICAgIC0gaGlnaGxpZ2h0ZWQ6ICB0cnVlXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5WaWV3Um9vbTpcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdSb29tKHBheWxvYWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgLy8gZm9yIHRoZXNlIGV2ZW50cyBibGFuayBvdXQgdGhlIHJvb21JZCBhcyB3ZSBhcmUgbm8gbG9uZ2VyIGluIHRoZSBSb29tVmlld1xuICAgICAgICAgICAgY2FzZSAndmlld193ZWxjb21lX3BhZ2UnOlxuICAgICAgICAgICAgY2FzZSBBY3Rpb24uVmlld0hvbWVQYWdlOlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICByb29tSWQ6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIHJvb21BbGlhczogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgdmlhU2VydmVyczogW10sXG4gICAgICAgICAgICAgICAgICAgIHdhc0NvbnRleHRTd2l0Y2g6IGZhbHNlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBBY3Rpb24uVmlld1Jvb21FcnJvcjpcbiAgICAgICAgICAgICAgICB0aGlzLnZpZXdSb29tRXJyb3IocGF5bG9hZCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd3aWxsX2pvaW4nOlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBqb2luaW5nOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY2FuY2VsX2pvaW4nOlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBqb2luaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8vIGpvaW5fcm9vbTpcbiAgICAgICAgICAgIC8vICAgICAgLSBvcHRzOiBvcHRpb25zIGZvciBqb2luUm9vbVxuICAgICAgICAgICAgY2FzZSBBY3Rpb24uSm9pblJvb206XG4gICAgICAgICAgICAgICAgdGhpcy5qb2luUm9vbShwYXlsb2FkKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLkpvaW5Sb29tRXJyb3I6XG4gICAgICAgICAgICAgICAgdGhpcy5qb2luUm9vbUVycm9yKHBheWxvYWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBBY3Rpb24uSm9pblJvb21SZWFkeToge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnJvb21JZCA9PT0gcGF5bG9hZC5yb29tSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNob3VsZFBlZWs6IGZhbHNlIH0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGF3YWl0Um9vbURvd25TeW5jKE1hdHJpeENsaWVudFBlZy5nZXQoKSwgcGF5bG9hZC5yb29tSWQpLnRoZW4ocm9vbSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG51bU1lbWJlcnMgPSByb29tLmdldEpvaW5lZE1lbWJlckNvdW50KCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHJvb21TaXplID0gbnVtTWVtYmVycyA+IDEwMDAgPyBcIk1vcmVUaGFuQVRob3VzYW5kXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIDogbnVtTWVtYmVycyA+IDEwMCA/IFwiT25lSHVuZHJlZEFuZE9uZVRvQVRob3VzYW5kXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IG51bU1lbWJlcnMgPiAxMCA/IFwiRWxldmVuVG9PbmVIdW5kcmVkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBudW1NZW1iZXJzID4gMiA/IFwiVGhyZWVUb1RlblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IG51bU1lbWJlcnMgPiAxID8gXCJUd29cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogXCJPbmVcIjtcblxuICAgICAgICAgICAgICAgICAgICBQb3N0aG9nQW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrRXZlbnQ8Sm9pbmVkUm9vbUV2ZW50Pih7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudE5hbWU6IFwiSm9pbmVkUm9vbVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJpZ2dlcjogcGF5bG9hZC5tZXRyaWNzVHJpZ2dlcixcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb21TaXplLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXNETTogISFETVJvb21NYXAuc2hhcmVkKCkuZ2V0VXNlcklkRm9yUm9vbUlkKHJvb20ucm9vbUlkKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzU3BhY2U6IHJvb20uaXNTcGFjZVJvb20oKSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ29uX2NsaWVudF9ub3RfdmlhYmxlJzpcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLk9uTG9nZ2VkT3V0OlxuICAgICAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3JlcGx5X3RvX2V2ZW50JzpcbiAgICAgICAgICAgICAgICAvLyBJZiBjdXJyZW50bHkgdmlld2VkIHJvb20gZG9lcyBub3QgbWF0Y2ggdGhlIHJvb20gaW4gd2hpY2ggd2Ugd2lzaCB0byByZXBseSB0aGVuIGNoYW5nZSByb29tc1xuICAgICAgICAgICAgICAgIC8vIHRoaXMgY2FuIGhhcHBlbiB3aGVuIHBlcmZvcm1pbmcgYSBzZWFyY2ggYWNyb3NzIGFsbCByb29tcy4gUGVyc2lzdCB0aGUgZGF0YSBmcm9tIHRoaXMgZXZlbnQgZm9yXG4gICAgICAgICAgICAgICAgLy8gYm90aCByb29tIGFuZCBzZWFyY2ggdGltZWxpbmUgcmVuZGVyaW5nIHR5cGVzLCBzZWFyY2ggd2lsbCBnZXQgYXV0by1jbG9zZWQgYnkgUm9vbVZpZXcgYXQgdGhpcyB0aW1lLlxuICAgICAgICAgICAgICAgIGlmIChbVGltZWxpbmVSZW5kZXJpbmdUeXBlLlJvb20sIFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5TZWFyY2hdLmluY2x1ZGVzKHBheWxvYWQuY29udGV4dCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBheWxvYWQuZXZlbnQgJiYgcGF5bG9hZC5ldmVudC5nZXRSb29tSWQoKSAhPT0gdGhpcy5zdGF0ZS5yb29tSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaDxWaWV3Um9vbVBheWxvYWQ+KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5WaWV3Um9vbSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb29tX2lkOiBwYXlsb2FkLmV2ZW50LmdldFJvb21JZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5aW5nVG9FdmVudDogcGF5bG9hZC5ldmVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRyaWNzVHJpZ2dlcjogdW5kZWZpbmVkLCAvLyByb29tIGRvZXNuJ3QgY2hhbmdlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5aW5nVG9FdmVudDogcGF5bG9hZC5ldmVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyB2aWV3Um9vbShwYXlsb2FkOiBWaWV3Um9vbVBheWxvYWQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKHBheWxvYWQucm9vbV9pZCkge1xuICAgICAgICAgICAgaWYgKHBheWxvYWQubWV0cmljc1RyaWdnZXIgIT09IG51bGwgJiYgcGF5bG9hZC5yb29tX2lkICE9PSB0aGlzLnN0YXRlLnJvb21JZCkge1xuICAgICAgICAgICAgICAgIGxldCBhY3RpdmVTcGFjZTogVmlld1Jvb21FdmVudFtcImFjdGl2ZVNwYWNlXCJdO1xuICAgICAgICAgICAgICAgIGlmIChTcGFjZVN0b3JlLmluc3RhbmNlLmFjdGl2ZVNwYWNlID09PSBNZXRhU3BhY2UuSG9tZSkge1xuICAgICAgICAgICAgICAgICAgICBhY3RpdmVTcGFjZSA9IFwiSG9tZVwiO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNNZXRhU3BhY2UoU3BhY2VTdG9yZS5pbnN0YW5jZS5hY3RpdmVTcGFjZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZlU3BhY2UgPSBcIk1ldGFcIjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhY3RpdmVTcGFjZSA9IFNwYWNlU3RvcmUuaW5zdGFuY2UuYWN0aXZlU3BhY2VSb29tLmdldEpvaW5SdWxlKCkgPT09IEpvaW5SdWxlLlB1YmxpY1xuICAgICAgICAgICAgICAgICAgICAgICAgPyBcIlB1YmxpY1wiXG4gICAgICAgICAgICAgICAgICAgICAgICA6IFwiUHJpdmF0ZVwiO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIFBvc3Rob2dBbmFseXRpY3MuaW5zdGFuY2UudHJhY2tFdmVudDxWaWV3Um9vbUV2ZW50Pih7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50TmFtZTogXCJWaWV3Um9vbVwiLFxuICAgICAgICAgICAgICAgICAgICB0cmlnZ2VyOiBwYXlsb2FkLm1ldHJpY3NUcmlnZ2VyLFxuICAgICAgICAgICAgICAgICAgICB2aWFLZXlib2FyZDogcGF5bG9hZC5tZXRyaWNzVmlhS2V5Ym9hcmQsXG4gICAgICAgICAgICAgICAgICAgIGlzRE06ICEhRE1Sb29tTWFwLnNoYXJlZCgpLmdldFVzZXJJZEZvclJvb21JZChwYXlsb2FkLnJvb21faWQpLFxuICAgICAgICAgICAgICAgICAgICBpc1NwYWNlOiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbShwYXlsb2FkLnJvb21faWQpPy5pc1NwYWNlUm9vbSgpLFxuICAgICAgICAgICAgICAgICAgICBhY3RpdmVTcGFjZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgbmV3U3RhdGUgPSB7XG4gICAgICAgICAgICAgICAgcm9vbUlkOiBwYXlsb2FkLnJvb21faWQsXG4gICAgICAgICAgICAgICAgcm9vbUFsaWFzOiBwYXlsb2FkLnJvb21fYWxpYXMsXG4gICAgICAgICAgICAgICAgaW5pdGlhbEV2ZW50SWQ6IHBheWxvYWQuZXZlbnRfaWQsXG4gICAgICAgICAgICAgICAgaXNJbml0aWFsRXZlbnRIaWdobGlnaHRlZDogcGF5bG9hZC5oaWdobGlnaHRlZCxcbiAgICAgICAgICAgICAgICBpbml0aWFsRXZlbnRTY3JvbGxJbnRvVmlldzogcGF5bG9hZC5zY3JvbGxfaW50b192aWV3ID8/IHRydWUsXG4gICAgICAgICAgICAgICAgcm9vbUxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHJvb21Mb2FkRXJyb3I6IG51bGwsXG4gICAgICAgICAgICAgICAgLy8gc2hvdWxkIHBlZWsgYnkgZGVmYXVsdFxuICAgICAgICAgICAgICAgIHNob3VsZFBlZWs6IHBheWxvYWQuc2hvdWxkX3BlZWsgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBwYXlsb2FkLnNob3VsZF9wZWVrLFxuICAgICAgICAgICAgICAgIC8vIGhhdmUgd2Ugc2VudCBhIGpvaW4gcmVxdWVzdCBmb3IgdGhpcyByb29tIGFuZCBhcmUgd2FpdGluZyBmb3IgYSByZXNwb25zZT9cbiAgICAgICAgICAgICAgICBqb2luaW5nOiBwYXlsb2FkLmpvaW5pbmcgfHwgZmFsc2UsXG4gICAgICAgICAgICAgICAgLy8gUmVzZXQgcmVwbHlpbmdUb0V2ZW50IGJlY2F1c2Ugd2UgZG9uJ3Qgd2FudCBjcm9zcy1yb29tIGJlY2F1c2UgYmFkIFVYXG4gICAgICAgICAgICAgICAgcmVwbHlpbmdUb0V2ZW50OiBudWxsLFxuICAgICAgICAgICAgICAgIHZpYVNlcnZlcnM6IHBheWxvYWQudmlhX3NlcnZlcnMsXG4gICAgICAgICAgICAgICAgd2FzQ29udGV4dFN3aXRjaDogcGF5bG9hZC5jb250ZXh0X3N3aXRjaCxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIEFsbG93IGJlaW5nIGdpdmVuIGFuIGV2ZW50IHRvIGJlIHJlcGxpZWQgdG8gd2hlbiBzd2l0Y2hpbmcgcm9vbXMgYnV0IHNhbml0eSBjaGVjayBpdHMgZm9yIHRoaXMgcm9vbVxuICAgICAgICAgICAgaWYgKHBheWxvYWQucmVwbHlpbmdUb0V2ZW50Py5nZXRSb29tSWQoKSA9PT0gcGF5bG9hZC5yb29tX2lkKSB7XG4gICAgICAgICAgICAgICAgbmV3U3RhdGUucmVwbHlpbmdUb0V2ZW50ID0gcGF5bG9hZC5yZXBseWluZ1RvRXZlbnQ7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUucm9vbUlkID09PSBwYXlsb2FkLnJvb21faWQpIHtcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGUgcm9vbSBpc24ndCBiZWluZyBjaGFuZ2VkLCBlLmcgdmlzaXRpbmcgYSBwZXJtYWxpbmsgdGhlbiBtYWludGFpbiByZXBseWluZ1RvRXZlbnRcbiAgICAgICAgICAgICAgICBuZXdTdGF0ZS5yZXBseWluZ1RvRXZlbnQgPSB0aGlzLnN0YXRlLnJlcGx5aW5nVG9FdmVudDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZShuZXdTdGF0ZSk7XG5cbiAgICAgICAgICAgIGlmIChwYXlsb2FkLmF1dG9fam9pbikge1xuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaDxKb2luUm9vbVBheWxvYWQ+KHtcbiAgICAgICAgICAgICAgICAgICAgLi4ucGF5bG9hZCxcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uSm9pblJvb20sXG4gICAgICAgICAgICAgICAgICAgIHJvb21JZDogcGF5bG9hZC5yb29tX2lkLFxuICAgICAgICAgICAgICAgICAgICBtZXRyaWNzVHJpZ2dlcjogcGF5bG9hZC5tZXRyaWNzVHJpZ2dlciBhcyBKb2luUm9vbVBheWxvYWRbXCJtZXRyaWNzVHJpZ2dlclwiXSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChwYXlsb2FkLnJvb21fYWxpYXMpIHtcbiAgICAgICAgICAgIC8vIFRyeSB0aGUgcm9vbSBhbGlhcyB0byByb29tIElEIG5hdmlnYXRpb24gY2FjaGUgZmlyc3QgdG8gYXZvaWRcbiAgICAgICAgICAgIC8vIGJsb2NraW5nIHJvb20gbmF2aWdhdGlvbiBvbiB0aGUgaG9tZXNlcnZlci5cbiAgICAgICAgICAgIGxldCByb29tSWQgPSBnZXRDYWNoZWRSb29tSURGb3JBbGlhcyhwYXlsb2FkLnJvb21fYWxpYXMpO1xuICAgICAgICAgICAgaWYgKCFyb29tSWQpIHtcbiAgICAgICAgICAgICAgICAvLyBSb29tIGFsaWFzIGNhY2hlIG1pc3MsIHNvIGxldCdzIGFzayB0aGUgaG9tZXNlcnZlci4gUmVzb2x2ZSB0aGUgYWxpYXNcbiAgICAgICAgICAgICAgICAvLyBhbmQgdGhlbiBkbyBhIHNlY29uZCBkaXNwYXRjaCB3aXRoIHRoZSByb29tIElEIGFjcXVpcmVkLlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICByb29tSWQ6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGluaXRpYWxFdmVudElkOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBpbml0aWFsRXZlbnRQaXhlbE9mZnNldDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgaXNJbml0aWFsRXZlbnRIaWdobGlnaHRlZDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhbEV2ZW50U2Nyb2xsSW50b1ZpZXc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHJvb21BbGlhczogcGF5bG9hZC5yb29tX2FsaWFzLFxuICAgICAgICAgICAgICAgICAgICByb29tTG9hZGluZzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgcm9vbUxvYWRFcnJvcjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgdmlhU2VydmVyczogcGF5bG9hZC52aWFfc2VydmVycyxcbiAgICAgICAgICAgICAgICAgICAgd2FzQ29udGV4dFN3aXRjaDogcGF5bG9hZC5jb250ZXh0X3N3aXRjaCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbUlkRm9yQWxpYXMocGF5bG9hZC5yb29tX2FsaWFzKTtcbiAgICAgICAgICAgICAgICAgICAgc3RvcmVSb29tQWxpYXNJbkNhY2hlKHBheWxvYWQucm9vbV9hbGlhcywgcmVzdWx0LnJvb21faWQpO1xuICAgICAgICAgICAgICAgICAgICByb29tSWQgPSByZXN1bHQucm9vbV9pZDtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiUlZTIGZhaWxlZCB0byBnZXQgcm9vbSBpZCBmb3IgYWxpYXM6IFwiLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2g8Vmlld1Jvb21FcnJvclBheWxvYWQ+KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlZpZXdSb29tRXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICByb29tX2lkOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgcm9vbV9hbGlhczogcGF5bG9hZC5yb29tX2FsaWFzLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUmUtZmlyZSB0aGUgcGF5bG9hZCB3aXRoIHRoZSBuZXdseSBmb3VuZCByb29tX2lkXG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIC4uLnBheWxvYWQsXG4gICAgICAgICAgICAgICAgcm9vbV9pZDogcm9vbUlkLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHZpZXdSb29tRXJyb3IocGF5bG9hZDogVmlld1Jvb21FcnJvclBheWxvYWQpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICByb29tSWQ6IHBheWxvYWQucm9vbV9pZCxcbiAgICAgICAgICAgIHJvb21BbGlhczogcGF5bG9hZC5yb29tX2FsaWFzLFxuICAgICAgICAgICAgcm9vbUxvYWRpbmc6IGZhbHNlLFxuICAgICAgICAgICAgcm9vbUxvYWRFcnJvcjogcGF5bG9hZC5lcnIsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgam9pblJvb20ocGF5bG9hZDogSm9pblJvb21QYXlsb2FkKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgam9pbmluZzogdHJ1ZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICAvLyB0YWtlIGEgY29weSBvZiByb29tQWxpYXMgJiByb29tSWQgYXMgdGhleSBtYXkgY2hhbmdlIGJ5IHRoZSB0aW1lIHRoZSBqb2luIGlzIGNvbXBsZXRlXG4gICAgICAgIGNvbnN0IHsgcm9vbUFsaWFzLCByb29tSWQgfSA9IHRoaXMuc3RhdGU7XG4gICAgICAgIGNvbnN0IGFkZHJlc3MgPSByb29tQWxpYXMgfHwgcm9vbUlkO1xuICAgICAgICBjb25zdCB2aWFTZXJ2ZXJzID0gdGhpcy5zdGF0ZS52aWFTZXJ2ZXJzIHx8IFtdO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgcmV0cnk8Um9vbSwgTWF0cml4RXJyb3I+KCgpID0+IGNsaS5qb2luUm9vbShhZGRyZXNzLCB7XG4gICAgICAgICAgICAgICAgdmlhU2VydmVycyxcbiAgICAgICAgICAgICAgICAuLi4ocGF5bG9hZC5vcHRzIHx8IHt9KSxcbiAgICAgICAgICAgIH0pLCBOVU1fSk9JTl9SRVRSWSwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIC8vIGlmIHdlIHJlY2VpdmVkIGEgR2F0ZXdheSB0aW1lb3V0IHRoZW4gcmV0cnlcbiAgICAgICAgICAgICAgICByZXR1cm4gZXJyLmh0dHBTdGF0dXMgPT09IDUwNDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBXZSBkbyAqbm90KiBjbGVhciB0aGUgJ2pvaW5pbmcnIGZsYWcgYmVjYXVzZSB0aGUgUm9vbSBvYmplY3QgYW5kL29yIG91ciAnam9pbmVkJyBtZW1iZXIgZXZlbnQgbWF5IG5vdFxuICAgICAgICAgICAgLy8gaGF2ZSBjb21lIGRvd24gdGhlIHN5bmMgc3RyZWFtIHlldCwgYW5kIHRoYXQncyB0aGUgcG9pbnQgYXQgd2hpY2ggd2UnZCBjb25zaWRlciB0aGUgdXNlciBqb2luZWQgdG8gdGhlXG4gICAgICAgICAgICAvLyByb29tLlxuICAgICAgICAgICAgZGlzLmRpc3BhdGNoPEpvaW5Sb29tUmVhZHlQYXlsb2FkPih7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uSm9pblJvb21SZWFkeSxcbiAgICAgICAgICAgICAgICByb29tSWQsXG4gICAgICAgICAgICAgICAgbWV0cmljc1RyaWdnZXI6IHBheWxvYWQubWV0cmljc1RyaWdnZXIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLkpvaW5Sb29tRXJyb3IsXG4gICAgICAgICAgICAgICAgcm9vbUlkLFxuICAgICAgICAgICAgICAgIGVycixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRJbnZpdGluZ1VzZXJJZChyb29tSWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3Qgcm9vbSA9IGNsaS5nZXRSb29tKHJvb21JZCk7XG4gICAgICAgIGlmIChyb29tPy5nZXRNeU1lbWJlcnNoaXAoKSA9PT0gXCJpbnZpdGVcIikge1xuICAgICAgICAgICAgY29uc3QgbXlNZW1iZXIgPSByb29tLmdldE1lbWJlcihjbGkuZ2V0VXNlcklkKCkpO1xuICAgICAgICAgICAgY29uc3QgaW52aXRlRXZlbnQgPSBteU1lbWJlciA/IG15TWVtYmVyLmV2ZW50cy5tZW1iZXIgOiBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIGludml0ZUV2ZW50ICYmIGludml0ZUV2ZW50LmdldFNlbmRlcigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHNob3dKb2luUm9vbUVycm9yKGVycjogTWF0cml4RXJyb3IsIHJvb21JZDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIGxldCBkZXNjcmlwdGlvbjogUmVhY3ROb2RlID0gZXJyLm1lc3NhZ2UgPyBlcnIubWVzc2FnZSA6IEpTT04uc3RyaW5naWZ5KGVycik7XG4gICAgICAgIGxvZ2dlci5sb2coXCJGYWlsZWQgdG8gam9pbiByb29tOlwiLCBkZXNjcmlwdGlvbik7XG5cbiAgICAgICAgaWYgKGVyci5uYW1lID09PSBcIkNvbm5lY3Rpb25FcnJvclwiKSB7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbiA9IF90KFwiVGhlcmUgd2FzIGFuIGVycm9yIGpvaW5pbmcuXCIpO1xuICAgICAgICB9IGVsc2UgaWYgKGVyci5lcnJjb2RlID09PSAnTV9JTkNPTVBBVElCTEVfUk9PTV9WRVJTSU9OJykge1xuICAgICAgICAgICAgZGVzY3JpcHRpb24gPSA8ZGl2PlxuICAgICAgICAgICAgICAgIHsgX3QoXCJTb3JyeSwgeW91ciBob21lc2VydmVyIGlzIHRvbyBvbGQgdG8gcGFydGljaXBhdGUgaGVyZS5cIikgfTxiciAvPlxuICAgICAgICAgICAgICAgIHsgX3QoXCJQbGVhc2UgY29udGFjdCB5b3VyIGhvbWVzZXJ2ZXIgYWRtaW5pc3RyYXRvci5cIikgfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9IGVsc2UgaWYgKGVyci5odHRwU3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgICAgIGNvbnN0IGludml0aW5nVXNlcklkID0gdGhpcy5nZXRJbnZpdGluZ1VzZXJJZChyb29tSWQpO1xuICAgICAgICAgICAgLy8gb25seSBwcm92aWRlIGEgYmV0dGVyIGVycm9yIG1lc3NhZ2UgZm9yIGludml0ZXNcbiAgICAgICAgICAgIGlmIChpbnZpdGluZ1VzZXJJZCkge1xuICAgICAgICAgICAgICAgIC8vIGlmIHRoZSBpbnZpdGluZyB1c2VyIGlzIG9uIHRoZSBzYW1lIEhTLCB0aGVyZSBjYW4gb25seSBiZSBvbmUgY2F1c2U6IHRoZXkgbGVmdC5cbiAgICAgICAgICAgICAgICBpZiAoaW52aXRpbmdVc2VySWQuZW5kc1dpdGgoYDoke01hdHJpeENsaWVudFBlZy5nZXQoKS5nZXREb21haW4oKX1gKSkge1xuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbiA9IF90KFwiVGhlIHBlcnNvbiB3aG8gaW52aXRlZCB5b3UgaGFzIGFscmVhZHkgbGVmdC5cIik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb24gPSBfdChcIlRoZSBwZXJzb24gd2hvIGludml0ZWQgeW91IGhhcyBhbHJlYWR5IGxlZnQsIG9yIHRoZWlyIHNlcnZlciBpcyBvZmZsaW5lLlwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgIHRpdGxlOiBfdChcIkZhaWxlZCB0byBqb2luXCIpLFxuICAgICAgICAgICAgZGVzY3JpcHRpb24sXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgam9pblJvb21FcnJvcihwYXlsb2FkOiBKb2luUm9vbUVycm9yUGF5bG9hZCk6IHZvaWQge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGpvaW5pbmc6IGZhbHNlLFxuICAgICAgICAgICAgam9pbkVycm9yOiBwYXlsb2FkLmVycixcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2hvd0pvaW5Sb29tRXJyb3IocGF5bG9hZC5lcnIsIHBheWxvYWQucm9vbUlkKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVzZXQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuc3RhdGUgPSBPYmplY3QuYXNzaWduKHt9LCBJTklUSUFMX1NUQVRFKTtcbiAgICB9XG5cbiAgICAvLyBUaGUgcm9vbSBJRCBvZiB0aGUgcm9vbSBjdXJyZW50bHkgYmVpbmcgdmlld2VkXG4gICAgcHVibGljIGdldFJvb21JZCgpOiBPcHRpb25hbDxzdHJpbmc+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUucm9vbUlkO1xuICAgIH1cblxuICAgIC8vIFRoZSBldmVudCB0byBzY3JvbGwgdG8gd2hlbiB0aGUgcm9vbSBpcyBmaXJzdCB2aWV3ZWRcbiAgICBwdWJsaWMgZ2V0SW5pdGlhbEV2ZW50SWQoKTogT3B0aW9uYWw8c3RyaW5nPiB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLmluaXRpYWxFdmVudElkO1xuICAgIH1cblxuICAgIC8vIFdoZXRoZXIgdG8gaGlnaGxpZ2h0IHRoZSBpbml0aWFsIGV2ZW50XG4gICAgcHVibGljIGlzSW5pdGlhbEV2ZW50SGlnaGxpZ2h0ZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLmlzSW5pdGlhbEV2ZW50SGlnaGxpZ2h0ZWQ7XG4gICAgfVxuXG4gICAgLy8gV2hldGhlciB0byBhdm9pZCBqdW1waW5nIHRvIHRoZSBpbml0aWFsIGV2ZW50XG4gICAgcHVibGljIGluaXRpYWxFdmVudFNjcm9sbEludG9WaWV3KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5pbml0aWFsRXZlbnRTY3JvbGxJbnRvVmlldztcbiAgICB9XG5cbiAgICAvLyBUaGUgcm9vbSBhbGlhcyBvZiB0aGUgcm9vbSAob3IgbnVsbCBpZiBub3Qgb3JpZ2luYWxseSBzcGVjaWZpZWQgaW4gdmlld19yb29tKVxuICAgIHB1YmxpYyBnZXRSb29tQWxpYXMoKTogT3B0aW9uYWw8c3RyaW5nPiB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLnJvb21BbGlhcztcbiAgICB9XG5cbiAgICAvLyBXaGV0aGVyIHRoZSBjdXJyZW50IHJvb20gaXMgbG9hZGluZyAodHJ1ZSB3aGlsc3QgcmVzb2x2aW5nIGFuIGFsaWFzKVxuICAgIHB1YmxpYyBpc1Jvb21Mb2FkaW5nKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5yb29tTG9hZGluZztcbiAgICB9XG5cbiAgICAvLyBBbnkgZXJyb3IgdGhhdCBoYXMgb2NjdXJyZWQgZHVyaW5nIGxvYWRpbmdcbiAgICBwdWJsaWMgZ2V0Um9vbUxvYWRFcnJvcigpOiBPcHRpb25hbDxNYXRyaXhFcnJvcj4ge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5yb29tTG9hZEVycm9yO1xuICAgIH1cblxuICAgIC8vIFRydWUgaWYgd2UncmUgZXhwZWN0aW5nIHRoZSB1c2VyIHRvIGJlIGpvaW5lZCB0byB0aGUgcm9vbSBjdXJyZW50bHkgYmVpbmdcbiAgICAvLyB2aWV3ZWQuIE5vdGUgdGhhdCB0aGlzIGlzIGxlZnQgdHJ1ZSBhZnRlciB0aGUgam9pbiByZXF1ZXN0IGhhcyBmaW5pc2hlZCxcbiAgICAvLyBzaW5jZSB3ZSBzaG91bGQgc3RpbGwgY29uc2lkZXIgYSBqb2luIHRvIGJlIGluIHByb2dyZXNzIHVudGlsIHRoZSByb29tXG4gICAgLy8gJiBtZW1iZXIgZXZlbnRzIGNvbWUgZG93biB0aGUgc3luYy5cbiAgICAvL1xuICAgIC8vIFRoaXMgZmxhZyByZW1haW5zIHRydWUgYWZ0ZXIgdGhlIHJvb20gaGFzIGJlZW4gc3VjY2Vzc2Z1bGx5IGpvaW5lZCxcbiAgICAvLyAodGhpcyBzdG9yZSBkb2Vzbid0IGxpc3RlbiBmb3IgdGhlIGFwcHJvcHJpYXRlIG1lbWJlciBldmVudHMpXG4gICAgLy8gc28geW91IHNob3VsZCBhbHdheXMgb2JzZXJ2ZSB0aGUgam9pbmVkIHN0YXRlIGZyb20gdGhlIG1lbWJlciBldmVudFxuICAgIC8vIGlmIGEgcm9vbSBvYmplY3QgaXMgcHJlc2VudC5cbiAgICAvLyBpZS4gVGhlIGNvcnJlY3QgbG9naWMgaXM6XG4gICAgLy8gaWYgKHJvb20pIHtcbiAgICAvLyAgICAgaWYgKG15TWVtYmVyLm1lbWJlcnNoaXAgPT0gJ2pvaW5lZCcpIHtcbiAgICAvLyAgICAgICAgIC8vIHVzZXIgaXMgam9pbmVkIHRvIHRoZSByb29tXG4gICAgLy8gICAgIH0gZWxzZSB7XG4gICAgLy8gICAgICAgICAvLyBOb3Qgam9pbmVkXG4gICAgLy8gICAgIH1cbiAgICAvLyB9IGVsc2Uge1xuICAgIC8vICAgICBpZiAoUm9vbVZpZXdTdG9yZS5pbnN0YW5jZS5pc0pvaW5pbmcoKSkge1xuICAgIC8vICAgICAgICAgLy8gc2hvdyBzcGlubmVyXG4gICAgLy8gICAgIH0gZWxzZSB7XG4gICAgLy8gICAgICAgICAvLyBzaG93IGpvaW4gcHJvbXB0XG4gICAgLy8gICAgIH1cbiAgICAvLyB9XG4gICAgcHVibGljIGlzSm9pbmluZygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuam9pbmluZztcbiAgICB9XG5cbiAgICAvLyBBbnkgZXJyb3IgdGhhdCBoYXMgb2NjdXJyZWQgZHVyaW5nIGpvaW5pbmdcbiAgICBwdWJsaWMgZ2V0Sm9pbkVycm9yKCk6IE9wdGlvbmFsPEVycm9yPiB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLmpvaW5FcnJvcjtcbiAgICB9XG5cbiAgICAvLyBUaGUgbXhFdmVudCBpZiBvbmUgaXMgY3VycmVudGx5IGJlaW5nIHJlcGxpZWQgdG8vcXVvdGVkXG4gICAgcHVibGljIGdldFF1b3RpbmdFdmVudCgpOiBPcHRpb25hbDxNYXRyaXhFdmVudD4ge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5yZXBseWluZ1RvRXZlbnQ7XG4gICAgfVxuXG4gICAgcHVibGljIHNob3VsZFBlZWsoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLnNob3VsZFBlZWs7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFdhc0NvbnRleHRTd2l0Y2goKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLndhc0NvbnRleHRTd2l0Y2g7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWtCQTs7QUFDQTs7QUFFQTs7QUFHQTs7QUFLQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFLQTs7QUFFQTs7Ozs7O0FBRUEsTUFBTUEsY0FBYyxHQUFHLENBQXZCO0FBRUEsTUFBTUMsYUFBYSxHQUFHO0VBQ2xCO0VBQ0FDLE9BQU8sRUFBRSxLQUZTO0VBR2xCO0VBQ0FDLFNBQVMsRUFBRSxJQUpPO0VBS2xCO0VBQ0FDLE1BQU0sRUFBRSxJQU5VO0VBUWxCO0VBQ0FDLGNBQWMsRUFBRSxJQVRFO0VBVWxCQyx1QkFBdUIsRUFBRSxJQVZQO0VBV2xCO0VBQ0FDLHlCQUF5QixFQUFFLEtBWlQ7RUFhbEI7RUFDQUMsMEJBQTBCLEVBQUUsSUFkVjtFQWdCbEI7RUFDQUMsU0FBUyxFQUFFLElBakJPO0VBa0JsQjtFQUNBQyxXQUFXLEVBQUUsS0FuQks7RUFvQmxCO0VBQ0FDLGFBQWEsRUFBRSxJQXJCRztFQXVCbEJDLGVBQWUsRUFBRSxJQXZCQztFQXlCbEJDLFVBQVUsRUFBRSxLQXpCTTtFQTJCbEJDLFVBQVUsRUFBRSxFQTNCTTtFQTZCbEJDLGdCQUFnQixFQUFFO0FBN0JBLENBQXRCOztBQWtDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ08sTUFBTUMsYUFBTixTQUE0QkMsWUFBNUIsQ0FBaUQ7RUFDcEQ7RUFDQTtFQUNBO0VBRytCO0VBRS9CO0VBR09DLFdBQVcsR0FBRztJQUNqQixNQUFNQyxtQkFBTjtJQURpQiw2Q0FMTGxC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