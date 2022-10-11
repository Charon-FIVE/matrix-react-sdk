"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.PROTOCOL_SIP_VIRTUAL = exports.PROTOCOL_SIP_NATIVE = exports.PROTOCOL_PSTN_PREFIXED = exports.PROTOCOL_PSTN = exports.LegacyCallHandlerEvent = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _call = require("matrix-js-sdk/src/webrtc/call");

var _logger = require("matrix-js-sdk/src/logger");

var _events = _interopRequireDefault(require("events"));

var _PushRules = require("matrix-js-sdk/src/@types/PushRules");

var _pushprocessor = require("matrix-js-sdk/src/pushprocessor");

var _sync = require("matrix-js-sdk/src/sync");

var _callEventHandler = require("matrix-js-sdk/src/webrtc/callEventHandler");

var _MatrixClientPeg = require("./MatrixClientPeg");

var _Modal = _interopRequireDefault(require("./Modal"));

var _languageHandler = require("./languageHandler");

var _dispatcher = _interopRequireDefault(require("./dispatcher/dispatcher"));

var _WidgetUtils = _interopRequireDefault(require("./utils/WidgetUtils"));

var _SettingsStore = _interopRequireDefault(require("./settings/SettingsStore"));

var _WidgetType = require("./widgets/WidgetType");

var _SettingLevel = require("./settings/SettingLevel");

var _QuestionDialog = _interopRequireDefault(require("./components/views/dialogs/QuestionDialog"));

var _ErrorDialog = _interopRequireDefault(require("./components/views/dialogs/ErrorDialog"));

var _WidgetStore = _interopRequireDefault(require("./stores/WidgetStore"));

var _WidgetMessagingStore = require("./stores/widgets/WidgetMessagingStore");

var _ElementWidgetActions = require("./stores/widgets/ElementWidgetActions");

var _UIFeature = require("./settings/UIFeature");

var _actions = require("./dispatcher/actions");

var _VoipUserMapper = _interopRequireDefault(require("./VoipUserMapper"));

var _ManagedHybrid = require("./widgets/ManagedHybrid");

var _SdkConfig = _interopRequireDefault(require("./SdkConfig"));

var _createRoom = require("./createRoom");

var _WidgetLayoutStore = require("./stores/widgets/WidgetLayoutStore");

var _IncomingLegacyCallToast = _interopRequireWildcard(require("./toasts/IncomingLegacyCallToast"));

var _ToastStore = _interopRequireDefault(require("./stores/ToastStore"));

var _Resend = _interopRequireDefault(require("./Resend"));

var _InviteDialogTypes = require("./components/views/dialogs/InviteDialogTypes");

var _findDMForUser = require("./utils/dm/findDMForUser");

var _getJoinedNonFunctionalMembers = require("./utils/room/getJoinedNonFunctionalMembers");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2017, 2018 New Vector Ltd
Copyright 2019 - 2022 The Matrix.org Foundation C.I.C.
Copyright 2021 Šimon Brandner <simon.bra.ag@gmail.com>

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
const PROTOCOL_PSTN = 'm.protocol.pstn';
exports.PROTOCOL_PSTN = PROTOCOL_PSTN;
const PROTOCOL_PSTN_PREFIXED = 'im.vector.protocol.pstn';
exports.PROTOCOL_PSTN_PREFIXED = PROTOCOL_PSTN_PREFIXED;
const PROTOCOL_SIP_NATIVE = 'im.vector.protocol.sip_native';
exports.PROTOCOL_SIP_NATIVE = PROTOCOL_SIP_NATIVE;
const PROTOCOL_SIP_VIRTUAL = 'im.vector.protocol.sip_virtual';
exports.PROTOCOL_SIP_VIRTUAL = PROTOCOL_SIP_VIRTUAL;
const CHECK_PROTOCOLS_ATTEMPTS = 3;
var AudioID;

(function (AudioID) {
  AudioID["Ring"] = "ringAudio";
  AudioID["Ringback"] = "ringbackAudio";
  AudioID["CallEnd"] = "callendAudio";
  AudioID["Busy"] = "busyAudio";
})(AudioID || (AudioID = {}));

let LegacyCallHandlerEvent;
/**
 * LegacyCallHandler manages all currently active calls. It should be used for
 * placing, answering, rejecting and hanging up calls. It also handles ringing,
 * PSTN support and other things.
 */

exports.LegacyCallHandlerEvent = LegacyCallHandlerEvent;

(function (LegacyCallHandlerEvent) {
  LegacyCallHandlerEvent["CallsChanged"] = "calls_changed";
  LegacyCallHandlerEvent["CallChangeRoom"] = "call_change_room";
  LegacyCallHandlerEvent["SilencedCallsChanged"] = "silenced_calls_changed";
  LegacyCallHandlerEvent["CallState"] = "call_state";
})(LegacyCallHandlerEvent || (exports.LegacyCallHandlerEvent = LegacyCallHandlerEvent = {}));

class LegacyCallHandler extends _events.default {
  constructor() {
    super(...arguments);
    (0, _defineProperty2.default)(this, "calls", new Map());
    (0, _defineProperty2.default)(this, "transferees", new Map());
    (0, _defineProperty2.default)(this, "audioPromises", new Map());
    (0, _defineProperty2.default)(this, "supportsPstnProtocol", null);
    (0, _defineProperty2.default)(this, "pstnSupportPrefixed", null);
    (0, _defineProperty2.default)(this, "supportsSipNativeVirtual", null);
    (0, _defineProperty2.default)(this, "assertedIdentityNativeUsers", new Map());
    (0, _defineProperty2.default)(this, "silencedCalls", new Set());
    (0, _defineProperty2.default)(this, "onCallIncoming", call => {
      // if the runtime env doesn't do VoIP, stop here.
      if (!_MatrixClientPeg.MatrixClientPeg.get().supportsVoip()) {
        return;
      }

      const mappedRoomId = LegacyCallHandler.instance.roomIdForCall(call);

      if (this.getCallForRoom(mappedRoomId)) {
        _logger.logger.log("Got incoming call for room " + mappedRoomId + " but there's already a call for this room: ignoring");

        return;
      }

      this.addCallForRoom(mappedRoomId, call);
      this.setCallListeners(call); // Explicitly handle first state change

      this.onCallStateChanged(call.state, null, call); // get ready to send encrypted events in the room, so if the user does answer
      // the call, we'll be ready to send. NB. This is the protocol-level room ID not
      // the mapped one: that's where we'll send the events.

      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      cli.prepareToEncrypt(cli.getRoom(call.roomId));
    });
    (0, _defineProperty2.default)(this, "onCallStateChanged", (newState, oldState, call) => {
      if (!this.matchesCallForThisRoom(call)) return;
      const mappedRoomId = this.roomIdForCall(call);
      this.setCallState(call, newState);

      _dispatcher.default.dispatch({
        action: 'call_state',
        room_id: mappedRoomId,
        state: newState
      });

      switch (oldState) {
        case _call.CallState.Ringing:
          this.pause(AudioID.Ring);
          break;

        case _call.CallState.InviteSent:
          this.pause(AudioID.Ringback);
          break;
      }

      if (newState !== _call.CallState.Ringing) {
        this.silencedCalls.delete(call.callId);
      }

      switch (newState) {
        case _call.CallState.Ringing:
          {
            const incomingCallPushRule = new _pushprocessor.PushProcessor(_MatrixClientPeg.MatrixClientPeg.get()).getPushRuleById(_PushRules.RuleId.IncomingCall);
            const pushRuleEnabled = incomingCallPushRule?.enabled;
            const tweakSetToRing = incomingCallPushRule?.actions.some(action => action.set_tweak === _PushRules.TweakName.Sound && action.value === "ring");

            if (pushRuleEnabled && tweakSetToRing) {
              this.play(AudioID.Ring);
            } else {
              this.silenceCall(call.callId);
            }

            break;
          }

        case _call.CallState.InviteSent:
          {
            this.play(AudioID.Ringback);
            break;
          }

        case _call.CallState.Ended:
          {
            const hangupReason = call.hangupReason;
            this.removeCallForRoom(mappedRoomId);

            if (oldState === _call.CallState.InviteSent && call.hangupParty === _call.CallParty.Remote) {
              this.play(AudioID.Busy); // Don't show a modal when we got rejected/the call was hung up

              if (!hangupReason || [_call.CallErrorCode.UserHangup, "user hangup"].includes(hangupReason)) break;
              let title;
              let description; // TODO: We should either do away with these or figure out a copy for each code (expect user_hangup...)

              if (call.hangupReason === _call.CallErrorCode.UserBusy) {
                title = (0, _languageHandler._t)("User Busy");
                description = (0, _languageHandler._t)("The user you called is busy.");
              } else {
                title = (0, _languageHandler._t)("Call Failed");
                description = (0, _languageHandler._t)("The call could not be established");
              }

              _Modal.default.createDialog(_ErrorDialog.default, {
                title,
                description
              });
            } else if (hangupReason === _call.CallErrorCode.AnsweredElsewhere && oldState === _call.CallState.Connecting) {
              _Modal.default.createDialog(_ErrorDialog.default, {
                title: (0, _languageHandler._t)("Answered Elsewhere"),
                description: (0, _languageHandler._t)("The call was answered on another device.")
              });
            } else if (oldState !== _call.CallState.Fledgling && oldState !== _call.CallState.Ringing) {
              // don't play the end-call sound for calls that never got off the ground
              this.play(AudioID.CallEnd);
            }

            this.logCallStats(call, mappedRoomId);
            break;
          }
      }
    });
  }

  // callIds
  static get instance() {
    if (!window.mxLegacyCallHandler) {
      window.mxLegacyCallHandler = new LegacyCallHandler();
    }

    return window.mxLegacyCallHandler;
  }
  /*
   * Gets the user-facing room associated with a call (call.roomId may be the call "virtual room"
   * if a voip_mxid_translate_pattern is set in the config)
   */


  roomIdForCall(call) {
    if (!call) return null; // check asserted identity: if we're not obeying asserted identity,
    // this map will never be populated, but we check anyway for sanity

    if (this.shouldObeyAssertedfIdentity()) {
      const nativeUser = this.assertedIdentityNativeUsers[call.callId];

      if (nativeUser) {
        const room = (0, _findDMForUser.findDMForUser)(_MatrixClientPeg.MatrixClientPeg.get(), nativeUser);
        if (room) return room.roomId;
      }
    }

    return _VoipUserMapper.default.sharedInstance().nativeRoomForVirtualRoom(call.roomId) || call.roomId;
  }

  start() {
    // add empty handlers for media actions, otherwise the media keys
    // end up causing the audio elements with our ring/ringback etc
    // audio clips in to play.
    if (navigator.mediaSession) {
      navigator.mediaSession.setActionHandler('play', function () {});
      navigator.mediaSession.setActionHandler('pause', function () {});
      navigator.mediaSession.setActionHandler('seekbackward', function () {});
      navigator.mediaSession.setActionHandler('seekforward', function () {});
      navigator.mediaSession.setActionHandler('previoustrack', function () {});
      navigator.mediaSession.setActionHandler('nexttrack', function () {});
    }

    if (_SettingsStore.default.getValue(_UIFeature.UIFeature.Voip)) {
      _MatrixClientPeg.MatrixClientPeg.get().on(_callEventHandler.CallEventHandlerEvent.Incoming, this.onCallIncoming);
    }

    this.checkProtocols(CHECK_PROTOCOLS_ATTEMPTS);
  }

  stop() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    if (cli) {
      cli.removeListener(_callEventHandler.CallEventHandlerEvent.Incoming, this.onCallIncoming);
    }
  }

  silenceCall(callId) {
    this.silencedCalls.add(callId);
    this.emit(LegacyCallHandlerEvent.SilencedCallsChanged, this.silencedCalls); // Don't pause audio if we have calls which are still ringing

    if (this.areAnyCallsUnsilenced()) return;
    this.pause(AudioID.Ring);
  }

  unSilenceCall(callId) {
    this.silencedCalls.delete(callId);
    this.emit(LegacyCallHandlerEvent.SilencedCallsChanged, this.silencedCalls);
    this.play(AudioID.Ring);
  }

  isCallSilenced(callId) {
    return this.silencedCalls.has(callId);
  }
  /**
   * Returns true if there is at least one unsilenced call
   * @returns {boolean}
   */


  areAnyCallsUnsilenced() {
    for (const call of this.calls.values()) {
      if (call.state === _call.CallState.Ringing && !this.isCallSilenced(call.callId)) {
        return true;
      }
    }

    return false;
  }

  async checkProtocols(maxTries) {
    try {
      const protocols = await _MatrixClientPeg.MatrixClientPeg.get().getThirdpartyProtocols();

      if (protocols[PROTOCOL_PSTN] !== undefined) {
        this.supportsPstnProtocol = Boolean(protocols[PROTOCOL_PSTN]);
        if (this.supportsPstnProtocol) this.pstnSupportPrefixed = false;
      } else if (protocols[PROTOCOL_PSTN_PREFIXED] !== undefined) {
        this.supportsPstnProtocol = Boolean(protocols[PROTOCOL_PSTN_PREFIXED]);
        if (this.supportsPstnProtocol) this.pstnSupportPrefixed = true;
      } else {
        this.supportsPstnProtocol = null;
      }

      _dispatcher.default.dispatch({
        action: _actions.Action.PstnSupportUpdated
      });

      if (protocols[PROTOCOL_SIP_NATIVE] !== undefined && protocols[PROTOCOL_SIP_VIRTUAL] !== undefined) {
        this.supportsSipNativeVirtual = Boolean(protocols[PROTOCOL_SIP_NATIVE] && protocols[PROTOCOL_SIP_VIRTUAL]);
      }

      _dispatcher.default.dispatch({
        action: _actions.Action.VirtualRoomSupportUpdated
      });
    } catch (e) {
      if (maxTries === 1) {
        _logger.logger.log("Failed to check for protocol support and no retries remain: assuming no support", e);
      } else {
        _logger.logger.log("Failed to check for protocol support: will retry", e);

        setTimeout(() => {
          this.checkProtocols(maxTries - 1);
        }, 10000);
      }
    }
  }

  shouldObeyAssertedfIdentity() {
    return _SdkConfig.default.getObject("voip")?.get("obey_asserted_identity");
  }

  getSupportsPstnProtocol() {
    return this.supportsPstnProtocol;
  }

  getSupportsVirtualRooms() {
    return this.supportsSipNativeVirtual;
  }

  async pstnLookup(phoneNumber) {
    try {
      return await _MatrixClientPeg.MatrixClientPeg.get().getThirdpartyUser(this.pstnSupportPrefixed ? PROTOCOL_PSTN_PREFIXED : PROTOCOL_PSTN, {
        'm.id.phone': phoneNumber
      });
    } catch (e) {
      _logger.logger.warn('Failed to lookup user from phone number', e);

      return Promise.resolve([]);
    }
  }

  async sipVirtualLookup(nativeMxid) {
    try {
      return await _MatrixClientPeg.MatrixClientPeg.get().getThirdpartyUser(PROTOCOL_SIP_VIRTUAL, {
        'native_mxid': nativeMxid
      });
    } catch (e) {
      _logger.logger.warn('Failed to query SIP identity for user', e);

      return Promise.resolve([]);
    }
  }

  async sipNativeLookup(virtualMxid) {
    try {
      return await _MatrixClientPeg.MatrixClientPeg.get().getThirdpartyUser(PROTOCOL_SIP_NATIVE, {
        'virtual_mxid': virtualMxid
      });
    } catch (e) {
      _logger.logger.warn('Failed to query identity for SIP user', e);

      return Promise.resolve([]);
    }
  }

  getCallById(callId) {
    for (const call of this.calls.values()) {
      if (call.callId === callId) return call;
    }

    return null;
  }

  getCallForRoom(roomId) {
    return this.calls.get(roomId) || null;
  }

  getAnyActiveCall() {
    for (const call of this.calls.values()) {
      if (call.state !== _call.CallState.Ended) {
        return call;
      }
    }

    return null;
  }

  getAllActiveCalls() {
    const activeCalls = [];

    for (const call of this.calls.values()) {
      if (call.state !== _call.CallState.Ended && call.state !== _call.CallState.Ringing) {
        activeCalls.push(call);
      }
    }

    return activeCalls;
  }

  getAllActiveCallsNotInRoom(notInThisRoomId) {
    const callsNotInThatRoom = [];

    for (const [roomId, call] of this.calls.entries()) {
      if (roomId !== notInThisRoomId && call.state !== _call.CallState.Ended) {
        callsNotInThatRoom.push(call);
      }
    }

    return callsNotInThatRoom;
  }

  getAllActiveCallsForPip(roomId) {
    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(roomId);

    if (_WidgetLayoutStore.WidgetLayoutStore.instance.hasMaximisedWidget(room)) {
      // This checks if there is space for the call view in the aux panel
      // If there is no space any call should be displayed in PiP
      return this.getAllActiveCalls();
    }

    return this.getAllActiveCallsNotInRoom(roomId);
  }

  getTransfereeForCallId(callId) {
    return this.transferees[callId];
  }

  play(audioId) {
    const logPrefix = `LegacyCallHandler.play(${audioId}):`;

    _logger.logger.debug(`${logPrefix} beginning of function`); // TODO: Attach an invisible element for this instead
    // which listens?


    const audio = document.getElementById(audioId);

    if (audio) {
      const playAudio = async () => {
        try {
          // This still causes the chrome debugger to break on promise rejection if
          // the promise is rejected, even though we're catching the exception.
          _logger.logger.debug(`${logPrefix} attempting to play audio`);

          await audio.play();

          _logger.logger.debug(`${logPrefix} playing audio successfully`);
        } catch (e) {
          // This is usually because the user hasn't interacted with the document,
          // or chrome doesn't think so and is denying the request. Not sure what
          // we can really do here...
          // https://github.com/vector-im/element-web/issues/7657
          _logger.logger.warn(`${logPrefix} unable to play audio clip`, e);
        }
      };

      if (this.audioPromises.has(audioId)) {
        this.audioPromises.set(audioId, this.audioPromises.get(audioId).then(() => {
          audio.load();
          return playAudio();
        }));
      } else {
        this.audioPromises.set(audioId, playAudio());
      }
    } else {
      _logger.logger.warn(`${logPrefix} unable to find <audio> element for ${audioId}`);
    }
  }

  pause(audioId) {
    const logPrefix = `LegacyCallHandler.pause(${audioId}):`;

    _logger.logger.debug(`${logPrefix} beginning of function`); // TODO: Attach an invisible element for this instead
    // which listens?


    const audio = document.getElementById(audioId);

    const pauseAudio = () => {
      _logger.logger.debug(`${logPrefix} pausing audio`); // pause doesn't return a promise, so just do it


      audio.pause();
    };

    if (audio) {
      if (this.audioPromises.has(audioId)) {
        this.audioPromises.set(audioId, this.audioPromises.get(audioId).then(pauseAudio));
      } else {
        pauseAudio();
      }
    } else {
      _logger.logger.warn(`${logPrefix} unable to find <audio> element for ${audioId}`);
    }
  }

  matchesCallForThisRoom(call) {
    // We don't allow placing more than one call per room, but that doesn't mean there
    // can't be more than one, eg. in a glare situation. This checks that the given call
    // is the call we consider 'the' call for its room.
    const mappedRoomId = this.roomIdForCall(call);
    const callForThisRoom = this.getCallForRoom(mappedRoomId);
    return callForThisRoom && call.callId === callForThisRoom.callId;
  }

  setCallListeners(call) {
    let mappedRoomId = this.roomIdForCall(call);
    call.on(_call.CallEvent.Error, err => {
      if (!this.matchesCallForThisRoom(call)) return;

      _logger.logger.error("Call error:", err);

      if (err.code === _call.CallErrorCode.NoUserMedia) {
        this.showMediaCaptureError(call);
        return;
      }

      if (_MatrixClientPeg.MatrixClientPeg.get().getTurnServers().length === 0 && _SettingsStore.default.getValue("fallbackICEServerAllowed") === null) {
        this.showICEFallbackPrompt();
        return;
      }

      _Modal.default.createDialog(_ErrorDialog.default, {
        title: (0, _languageHandler._t)('Call Failed'),
        description: err.message
      });
    });
    call.on(_call.CallEvent.Hangup, () => {
      if (!this.matchesCallForThisRoom(call)) return;
      this.removeCallForRoom(mappedRoomId);
    });
    call.on(_call.CallEvent.State, (newState, oldState) => {
      this.onCallStateChanged(newState, oldState, call);
    });
    call.on(_call.CallEvent.Replaced, newCall => {
      if (!this.matchesCallForThisRoom(call)) return;

      _logger.logger.log(`Call ID ${call.callId} is being replaced by call ID ${newCall.callId}`);

      if (call.state === _call.CallState.Ringing) {
        this.pause(AudioID.Ring);
      } else if (call.state === _call.CallState.InviteSent) {
        this.pause(AudioID.Ringback);
      }

      this.removeCallForRoom(mappedRoomId);
      this.addCallForRoom(mappedRoomId, newCall);
      this.setCallListeners(newCall);
      this.setCallState(newCall, newCall.state);
    });
    call.on(_call.CallEvent.AssertedIdentityChanged, async () => {
      if (!this.matchesCallForThisRoom(call)) return;

      _logger.logger.log(`Call ID ${call.callId} got new asserted identity:`, call.getRemoteAssertedIdentity());

      if (!this.shouldObeyAssertedfIdentity()) {
        _logger.logger.log("asserted identity not enabled in config: ignoring");

        return;
      }

      const newAssertedIdentity = call.getRemoteAssertedIdentity().id;
      let newNativeAssertedIdentity = newAssertedIdentity;

      if (newAssertedIdentity) {
        const response = await this.sipNativeLookup(newAssertedIdentity);

        if (response.length && response[0].fields.lookup_success) {
          newNativeAssertedIdentity = response[0].userid;
        }
      }

      _logger.logger.log(`Asserted identity ${newAssertedIdentity} mapped to ${newNativeAssertedIdentity}`);

      if (newNativeAssertedIdentity) {
        this.assertedIdentityNativeUsers[call.callId] = newNativeAssertedIdentity; // If we don't already have a room with this user, make one. This will be slightly odd
        // if they called us because we'll be inviting them, but there's not much we can do about
        // this if we want the actual, native room to exist (which we do). This is why it's
        // important to only obey asserted identity in trusted environments, since anyone you're
        // on a call with can cause you to send a room invite to someone.

        await (0, _createRoom.ensureDMExists)(_MatrixClientPeg.MatrixClientPeg.get(), newNativeAssertedIdentity);
        const newMappedRoomId = this.roomIdForCall(call);

        _logger.logger.log(`Old room ID: ${mappedRoomId}, new room ID: ${newMappedRoomId}`);

        if (newMappedRoomId !== mappedRoomId) {
          this.removeCallForRoom(mappedRoomId);
          mappedRoomId = newMappedRoomId;

          _logger.logger.log("Moving call to room " + mappedRoomId);

          this.addCallForRoom(mappedRoomId, call, true);
        }
      }
    });
  }

  async logCallStats(call, mappedRoomId) {
    const stats = await call.getCurrentCallStats();

    _logger.logger.debug(`Call completed. Call ID: ${call.callId}, virtual room ID: ${call.roomId}, ` + `user-facing room ID: ${mappedRoomId}, direction: ${call.direction}, ` + `our Party ID: ${call.ourPartyId}, hangup party: ${call.hangupParty}, ` + `hangup reason: ${call.hangupReason}`);

    if (!stats) {
      _logger.logger.debug("Call statistics are undefined. The call has " + "probably failed before a peerConn was established");

      return;
    }

    _logger.logger.debug("Local candidates:");

    for (const cand of stats.filter(item => item.type === 'local-candidate')) {
      const address = cand.address || cand.ip; // firefox uses 'address', chrome uses 'ip'

      _logger.logger.debug(`${cand.id} - type: ${cand.candidateType}, address: ${address}, port: ${cand.port}, ` + `protocol: ${cand.protocol}, relay protocol: ${cand.relayProtocol}, network type: ${cand.networkType}`);
    }

    _logger.logger.debug("Remote candidates:");

    for (const cand of stats.filter(item => item.type === 'remote-candidate')) {
      const address = cand.address || cand.ip; // firefox uses 'address', chrome uses 'ip'

      _logger.logger.debug(`${cand.id} - type: ${cand.candidateType}, address: ${address}, port: ${cand.port}, ` + `protocol: ${cand.protocol}`);
    }

    _logger.logger.debug("Candidate pairs:");

    for (const pair of stats.filter(item => item.type === 'candidate-pair')) {
      _logger.logger.debug(`${pair.localCandidateId} / ${pair.remoteCandidateId} - state: ${pair.state}, ` + `nominated: ${pair.nominated}, ` + `requests sent ${pair.requestsSent}, requests received  ${pair.requestsReceived},  ` + `responses received: ${pair.responsesReceived}, responses sent: ${pair.responsesSent}, ` + `bytes received: ${pair.bytesReceived}, bytes sent: ${pair.bytesSent}, `);
    }

    _logger.logger.debug("Outbound RTP:");

    for (const s of stats.filter(item => item.type === 'outbound-rtp')) {
      _logger.logger.debug(s);
    }

    _logger.logger.debug("Inbound RTP:");

    for (const s of stats.filter(item => item.type === 'inbound-rtp')) {
      _logger.logger.debug(s);
    }
  }

  setCallState(call, status) {
    const mappedRoomId = LegacyCallHandler.instance.roomIdForCall(call);

    _logger.logger.log(`Call state in ${mappedRoomId} changed to ${status}`);

    const toastKey = (0, _IncomingLegacyCallToast.getIncomingLegacyCallToastKey)(call.callId);

    if (status === _call.CallState.Ringing) {
      _ToastStore.default.sharedInstance().addOrReplaceToast({
        key: toastKey,
        priority: 100,
        component: _IncomingLegacyCallToast.default,
        bodyClassName: "mx_IncomingLegacyCallToast",
        props: {
          call
        }
      });
    } else {
      _ToastStore.default.sharedInstance().dismissToast(toastKey);
    }

    this.emit(LegacyCallHandlerEvent.CallState, mappedRoomId, status);
  }

  removeCallForRoom(roomId) {
    _logger.logger.log("Removing call for room ", roomId);

    this.calls.delete(roomId);
    this.emit(LegacyCallHandlerEvent.CallsChanged, this.calls);
  }

  showICEFallbackPrompt() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const code = sub => /*#__PURE__*/_react.default.createElement("code", null, sub);

    _Modal.default.createDialog(_QuestionDialog.default, {
      title: (0, _languageHandler._t)("Call failed due to misconfigured server"),
      description: /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Please ask the administrator of your homeserver " + "(<code>%(homeserverDomain)s</code>) to configure a TURN server in " + "order for calls to work reliably.", {
        homeserverDomain: cli.getDomain()
      }, {
        code
      })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Alternatively, you can try to use the public server at " + "<code>turn.matrix.org</code>, but this will not be as reliable, and " + "it will share your IP address with that server. You can also manage " + "this in Settings.", null, {
        code
      }))),
      button: (0, _languageHandler._t)('Try using turn.matrix.org'),
      cancelButton: (0, _languageHandler._t)('OK'),
      onFinished: allow => {
        _SettingsStore.default.setValue("fallbackICEServerAllowed", null, _SettingLevel.SettingLevel.DEVICE, allow);

        cli.setFallbackICEServerAllowed(allow);
      }
    }, null, true);
  }

  showMediaCaptureError(call) {
    let title;
    let description;

    if (call.type === _call.CallType.Voice) {
      title = (0, _languageHandler._t)("Unable to access microphone");
      description = /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Call failed because microphone could not be accessed. " + "Check that a microphone is plugged in and set up correctly."));
    } else if (call.type === _call.CallType.Video) {
      title = (0, _languageHandler._t)("Unable to access webcam / microphone");
      description = /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Call failed because webcam or microphone could not be accessed. Check that:"), /*#__PURE__*/_react.default.createElement("ul", null, /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("A microphone and webcam are plugged in and set up correctly")), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("Permission is granted to use the webcam")), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("No other application is using the webcam"))));
    }

    _Modal.default.createDialog(_ErrorDialog.default, {
      title,
      description
    }, null, true);
  }

  async placeMatrixCall(roomId, type, transferee) {
    const mappedRoomId = (await _VoipUserMapper.default.sharedInstance().getOrCreateVirtualRoomForRoom(roomId)) || roomId;

    _logger.logger.debug("Mapped real room " + roomId + " to room ID " + mappedRoomId); // If we're using a virtual room nd there are any events pending, try to resend them,
    // otherwise the call will fail and because its a virtual room, the user won't be able
    // to see it to either retry or clear the pending events. There will only be call events
    // in this queue, and since we're about to place a new call, they can only be events from
    // previous calls that are probably stale by now, so just cancel them.


    if (mappedRoomId !== roomId) {
      const mappedRoom = _MatrixClientPeg.MatrixClientPeg.get().getRoom(mappedRoomId);

      if (mappedRoom.getPendingEvents().length > 0) {
        _Resend.default.cancelUnsentEvents(mappedRoom);
      }
    }

    const timeUntilTurnCresExpire = _MatrixClientPeg.MatrixClientPeg.get().getTurnServersExpiry() - Date.now();

    _logger.logger.log("Current turn creds expire in " + timeUntilTurnCresExpire + " ms");

    const call = _MatrixClientPeg.MatrixClientPeg.get().createCall(mappedRoomId);

    try {
      this.addCallForRoom(roomId, call);
    } catch (e) {
      _Modal.default.createDialog(_ErrorDialog.default, {
        title: (0, _languageHandler._t)('Already in call'),
        description: (0, _languageHandler._t)("You're already in a call with this person.")
      });

      return;
    }

    if (transferee) {
      this.transferees[call.callId] = transferee;
    }

    this.setCallListeners(call);
    this.setActiveCallRoomId(roomId);

    if (type === _call.CallType.Voice) {
      call.placeVoiceCall();
    } else if (type === 'video') {
      call.placeVideoCall();
    } else {
      _logger.logger.error("Unknown conf call type: " + type);
    }
  }

  placeCall(roomId, type, transferee) {
    // We might be using managed hybrid widgets
    if ((0, _ManagedHybrid.isManagedHybridWidgetEnabled)()) {
      (0, _ManagedHybrid.addManagedHybridWidget)(roomId);
      return;
    } // if the runtime env doesn't do VoIP, whine.


    if (!_MatrixClientPeg.MatrixClientPeg.get().supportsVoip()) {
      _Modal.default.createDialog(_ErrorDialog.default, {
        title: (0, _languageHandler._t)('Calls are unsupported'),
        description: (0, _languageHandler._t)('You cannot place calls in this browser.')
      });

      return;
    }

    if (_MatrixClientPeg.MatrixClientPeg.get().getSyncState() === _sync.SyncState.Error) {
      _Modal.default.createDialog(_ErrorDialog.default, {
        title: (0, _languageHandler._t)('Connectivity to the server has been lost'),
        description: (0, _languageHandler._t)('You cannot place calls without a connection to the server.')
      });

      return;
    } // don't allow > 2 calls to be placed.


    if (this.getAllActiveCalls().length > 1) {
      _Modal.default.createDialog(_ErrorDialog.default, {
        title: (0, _languageHandler._t)('Too Many Calls'),
        description: (0, _languageHandler._t)("You've reached the maximum number of simultaneous calls.")
      });

      return;
    }

    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(roomId);

    if (!room) {
      _logger.logger.error(`Room ${roomId} does not exist.`);

      return;
    } // We leave the check for whether there's already a call in this room until later,
    // otherwise it can race.


    const members = (0, _getJoinedNonFunctionalMembers.getJoinedNonFunctionalMembers)(room);

    if (members.length <= 1) {
      _Modal.default.createDialog(_ErrorDialog.default, {
        description: (0, _languageHandler._t)('You cannot place a call with yourself.')
      });
    } else if (members.length === 2) {
      _logger.logger.info(`Place ${type} call in ${roomId}`);

      this.placeMatrixCall(roomId, type, transferee);
    } else {
      // > 2
      this.placeJitsiCall(roomId, type);
    }
  }

  hangupAllCalls() {
    for (const call of this.calls.values()) {
      this.stopRingingIfPossible(call.callId);
      call.hangup(_call.CallErrorCode.UserHangup, false);
    }
  }

  hangupOrReject(roomId, reject) {
    const call = this.calls.get(roomId); // no call to hangup

    if (!call) return;
    this.stopRingingIfPossible(call.callId);

    if (reject) {
      call.reject();
    } else {
      call.hangup(_call.CallErrorCode.UserHangup, false);
    } // don't remove the call yet: let the hangup event handler do it (otherwise it will throw
    // the hangup event away)

  }

  answerCall(roomId) {
    const call = this.calls.get(roomId);
    this.stopRingingIfPossible(call.callId); // no call to answer

    if (!this.calls.has(roomId)) return;

    if (this.getAllActiveCalls().length > 1) {
      _Modal.default.createDialog(_ErrorDialog.default, {
        title: (0, _languageHandler._t)('Too Many Calls'),
        description: (0, _languageHandler._t)("You've reached the maximum number of simultaneous calls.")
      });

      return;
    }

    call.answer();
    this.setActiveCallRoomId(roomId);

    _dispatcher.default.dispatch({
      action: _actions.Action.ViewRoom,
      room_id: roomId,
      metricsTrigger: "WebAcceptCall"
    });
  }

  stopRingingIfPossible(callId) {
    this.silencedCalls.delete(callId);
    if (this.areAnyCallsUnsilenced()) return;
    this.pause(AudioID.Ring);
  }

  async dialNumber(number, transferee) {
    const results = await this.pstnLookup(number);

    if (!results || results.length === 0 || !results[0].userid) {
      _Modal.default.createDialog(_ErrorDialog.default, {
        title: (0, _languageHandler._t)("Unable to look up phone number"),
        description: (0, _languageHandler._t)("There was an error looking up the phone number")
      });

      return;
    }

    const userId = results[0].userid; // Now check to see if this is a virtual user, in which case we should find the
    // native user

    let nativeUserId;

    if (this.getSupportsVirtualRooms()) {
      const nativeLookupResults = await this.sipNativeLookup(userId);
      const lookupSuccess = nativeLookupResults.length > 0 && nativeLookupResults[0].fields.lookup_success;
      nativeUserId = lookupSuccess ? nativeLookupResults[0].userid : userId;

      _logger.logger.log("Looked up " + number + " to " + userId + " and mapped to native user " + nativeUserId);
    } else {
      nativeUserId = userId;
    }

    const roomId = await (0, _createRoom.ensureDMExists)(_MatrixClientPeg.MatrixClientPeg.get(), nativeUserId);

    _dispatcher.default.dispatch({
      action: _actions.Action.ViewRoom,
      room_id: roomId,
      metricsTrigger: "WebDialPad"
    });

    await this.placeMatrixCall(roomId, _call.CallType.Voice, transferee);
  }

  async startTransferToPhoneNumber(call, destination, consultFirst) {
    if (consultFirst) {
      // if we're consulting, we just start by placing a call to the transfer
      // target (passing the transferee so the actual transfer can happen later)
      this.dialNumber(destination, call);
      return;
    }

    const results = await this.pstnLookup(destination);

    if (!results || results.length === 0 || !results[0].userid) {
      _Modal.default.createDialog(_ErrorDialog.default, {
        title: (0, _languageHandler._t)("Unable to transfer call"),
        description: (0, _languageHandler._t)("There was an error looking up the phone number")
      });

      return;
    }

    await this.startTransferToMatrixID(call, results[0].userid, consultFirst);
  }

  async startTransferToMatrixID(call, destination, consultFirst) {
    if (consultFirst) {
      const dmRoomId = await (0, _createRoom.ensureDMExists)(_MatrixClientPeg.MatrixClientPeg.get(), destination);
      this.placeCall(dmRoomId, call.type, call);

      _dispatcher.default.dispatch({
        action: _actions.Action.ViewRoom,
        room_id: dmRoomId,
        should_peek: false,
        joining: false,
        metricsTrigger: undefined // other

      });
    } else {
      try {
        await call.transfer(destination);
      } catch (e) {
        _logger.logger.log("Failed to transfer call", e);

        _Modal.default.createDialog(_ErrorDialog.default, {
          title: (0, _languageHandler._t)('Transfer Failed'),
          description: (0, _languageHandler._t)('Failed to transfer call')
        });
      }
    }
  }

  setActiveCallRoomId(activeCallRoomId) {
    _logger.logger.info("Setting call in room " + activeCallRoomId + " active");

    for (const [roomId, call] of this.calls.entries()) {
      if (call.state === _call.CallState.Ended) continue;

      if (roomId === activeCallRoomId) {
        call.setRemoteOnHold(false);
      } else {
        _logger.logger.info("Holding call in room " + roomId + " because another call is being set active");

        call.setRemoteOnHold(true);
      }
    }
  }
  /**
   * @returns true if we are currently in any call where we haven't put the remote party on hold
   */


  hasAnyUnheldCall() {
    for (const call of this.calls.values()) {
      if (call.state === _call.CallState.Ended) continue;
      if (!call.isRemoteOnHold()) return true;
    }

    return false;
  }

  async placeJitsiCall(roomId, type) {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    _logger.logger.info(`Place conference call in ${roomId}`);

    _dispatcher.default.dispatch({
      action: 'appsDrawer',
      show: true
    }); // Prevent double clicking the call button


    const widget = _WidgetStore.default.instance.getApps(roomId).find(app => _WidgetType.WidgetType.JITSI.matches(app.type));

    if (widget) {
      // If there already is a Jitsi widget, pin it
      _WidgetLayoutStore.WidgetLayoutStore.instance.moveToContainer(client.getRoom(roomId), widget, _WidgetLayoutStore.Container.Top);

      return;
    }

    try {
      await _WidgetUtils.default.addJitsiWidget(roomId, type, 'Jitsi', false);

      _logger.logger.log('Jitsi widget added');
    } catch (e) {
      if (e.errcode === 'M_FORBIDDEN') {
        _Modal.default.createDialog(_ErrorDialog.default, {
          title: (0, _languageHandler._t)('Permission Required'),
          description: (0, _languageHandler._t)("You do not have permission to start a conference call in this room")
        });
      }

      _logger.logger.error(e);
    }
  }

  hangupCallApp(roomId) {
    _logger.logger.info("Leaving conference call in " + roomId);

    const roomInfo = _WidgetStore.default.instance.getRoom(roomId);

    if (!roomInfo) return; // "should never happen" clauses go here

    const jitsiWidgets = roomInfo.widgets.filter(w => _WidgetType.WidgetType.JITSI.matches(w.type));
    jitsiWidgets.forEach(w => {
      const messaging = _WidgetMessagingStore.WidgetMessagingStore.instance.getMessagingForUid(_WidgetUtils.default.getWidgetUid(w));

      if (!messaging) return; // more "should never happen" words

      messaging.transport.send(_ElementWidgetActions.ElementWidgetActions.HangupCall, {});
    });
  }
  /*
   * Shows the transfer dialog for a call, signalling to the other end that
   * a transfer is about to happen
   */


  showTransferDialog(call) {
    call.setRemoteOnHold(true);

    _dispatcher.default.dispatch({
      action: _actions.Action.OpenInviteDialog,
      kind: _InviteDialogTypes.KIND_CALL_TRANSFER,
      call,
      analyticsName: "Transfer Call",
      className: "mx_InviteDialog_transferWrapper",
      onFinishedCallback: results => {
        if (results.length === 0 || results[0] === false) {
          call.setRemoteOnHold(false);
        }
      }
    });
  }

  addCallForRoom(roomId, call) {
    let changedRooms = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    if (this.calls.has(roomId)) {
      _logger.logger.log(`Couldn't add call to room ${roomId}: already have a call for this room`);

      throw new Error("Already have a call for room " + roomId);
    }

    _logger.logger.log("setting call for room " + roomId);

    this.calls.set(roomId, call); // Should we always emit CallsChanged too?

    if (changedRooms) {
      this.emit(LegacyCallHandlerEvent.CallChangeRoom, call);
    } else {
      this.emit(LegacyCallHandlerEvent.CallsChanged, this.calls);
    }
  }

}

exports.default = LegacyCallHandler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQUk9UT0NPTF9QU1ROIiwiUFJPVE9DT0xfUFNUTl9QUkVGSVhFRCIsIlBST1RPQ09MX1NJUF9OQVRJVkUiLCJQUk9UT0NPTF9TSVBfVklSVFVBTCIsIkNIRUNLX1BST1RPQ09MU19BVFRFTVBUUyIsIkF1ZGlvSUQiLCJMZWdhY3lDYWxsSGFuZGxlckV2ZW50IiwiTGVnYWN5Q2FsbEhhbmRsZXIiLCJFdmVudEVtaXR0ZXIiLCJNYXAiLCJTZXQiLCJjYWxsIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0Iiwic3VwcG9ydHNWb2lwIiwibWFwcGVkUm9vbUlkIiwiaW5zdGFuY2UiLCJyb29tSWRGb3JDYWxsIiwiZ2V0Q2FsbEZvclJvb20iLCJsb2dnZXIiLCJsb2ciLCJhZGRDYWxsRm9yUm9vbSIsInNldENhbGxMaXN0ZW5lcnMiLCJvbkNhbGxTdGF0ZUNoYW5nZWQiLCJzdGF0ZSIsImNsaSIsInByZXBhcmVUb0VuY3J5cHQiLCJnZXRSb29tIiwicm9vbUlkIiwibmV3U3RhdGUiLCJvbGRTdGF0ZSIsIm1hdGNoZXNDYWxsRm9yVGhpc1Jvb20iLCJzZXRDYWxsU3RhdGUiLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsInJvb21faWQiLCJDYWxsU3RhdGUiLCJSaW5naW5nIiwicGF1c2UiLCJSaW5nIiwiSW52aXRlU2VudCIsIlJpbmdiYWNrIiwic2lsZW5jZWRDYWxscyIsImRlbGV0ZSIsImNhbGxJZCIsImluY29taW5nQ2FsbFB1c2hSdWxlIiwiUHVzaFByb2Nlc3NvciIsImdldFB1c2hSdWxlQnlJZCIsIlJ1bGVJZCIsIkluY29taW5nQ2FsbCIsInB1c2hSdWxlRW5hYmxlZCIsImVuYWJsZWQiLCJ0d2Vha1NldFRvUmluZyIsImFjdGlvbnMiLCJzb21lIiwic2V0X3R3ZWFrIiwiVHdlYWtOYW1lIiwiU291bmQiLCJ2YWx1ZSIsInBsYXkiLCJzaWxlbmNlQ2FsbCIsIkVuZGVkIiwiaGFuZ3VwUmVhc29uIiwicmVtb3ZlQ2FsbEZvclJvb20iLCJoYW5ndXBQYXJ0eSIsIkNhbGxQYXJ0eSIsIlJlbW90ZSIsIkJ1c3kiLCJDYWxsRXJyb3JDb2RlIiwiVXNlckhhbmd1cCIsImluY2x1ZGVzIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsIlVzZXJCdXN5IiwiX3QiLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIkVycm9yRGlhbG9nIiwiQW5zd2VyZWRFbHNld2hlcmUiLCJDb25uZWN0aW5nIiwiRmxlZGdsaW5nIiwiQ2FsbEVuZCIsImxvZ0NhbGxTdGF0cyIsIndpbmRvdyIsIm14TGVnYWN5Q2FsbEhhbmRsZXIiLCJzaG91bGRPYmV5QXNzZXJ0ZWRmSWRlbnRpdHkiLCJuYXRpdmVVc2VyIiwiYXNzZXJ0ZWRJZGVudGl0eU5hdGl2ZVVzZXJzIiwicm9vbSIsImZpbmRETUZvclVzZXIiLCJWb2lwVXNlck1hcHBlciIsInNoYXJlZEluc3RhbmNlIiwibmF0aXZlUm9vbUZvclZpcnR1YWxSb29tIiwic3RhcnQiLCJuYXZpZ2F0b3IiLCJtZWRpYVNlc3Npb24iLCJzZXRBY3Rpb25IYW5kbGVyIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwiVUlGZWF0dXJlIiwiVm9pcCIsIm9uIiwiQ2FsbEV2ZW50SGFuZGxlckV2ZW50IiwiSW5jb21pbmciLCJvbkNhbGxJbmNvbWluZyIsImNoZWNrUHJvdG9jb2xzIiwic3RvcCIsInJlbW92ZUxpc3RlbmVyIiwiYWRkIiwiZW1pdCIsIlNpbGVuY2VkQ2FsbHNDaGFuZ2VkIiwiYXJlQW55Q2FsbHNVbnNpbGVuY2VkIiwidW5TaWxlbmNlQ2FsbCIsImlzQ2FsbFNpbGVuY2VkIiwiaGFzIiwiY2FsbHMiLCJ2YWx1ZXMiLCJtYXhUcmllcyIsInByb3RvY29scyIsImdldFRoaXJkcGFydHlQcm90b2NvbHMiLCJ1bmRlZmluZWQiLCJzdXBwb3J0c1BzdG5Qcm90b2NvbCIsIkJvb2xlYW4iLCJwc3RuU3VwcG9ydFByZWZpeGVkIiwiQWN0aW9uIiwiUHN0blN1cHBvcnRVcGRhdGVkIiwic3VwcG9ydHNTaXBOYXRpdmVWaXJ0dWFsIiwiVmlydHVhbFJvb21TdXBwb3J0VXBkYXRlZCIsImUiLCJzZXRUaW1lb3V0IiwiU2RrQ29uZmlnIiwiZ2V0T2JqZWN0IiwiZ2V0U3VwcG9ydHNQc3RuUHJvdG9jb2wiLCJnZXRTdXBwb3J0c1ZpcnR1YWxSb29tcyIsInBzdG5Mb29rdXAiLCJwaG9uZU51bWJlciIsImdldFRoaXJkcGFydHlVc2VyIiwid2FybiIsIlByb21pc2UiLCJyZXNvbHZlIiwic2lwVmlydHVhbExvb2t1cCIsIm5hdGl2ZU14aWQiLCJzaXBOYXRpdmVMb29rdXAiLCJ2aXJ0dWFsTXhpZCIsImdldENhbGxCeUlkIiwiZ2V0QW55QWN0aXZlQ2FsbCIsImdldEFsbEFjdGl2ZUNhbGxzIiwiYWN0aXZlQ2FsbHMiLCJwdXNoIiwiZ2V0QWxsQWN0aXZlQ2FsbHNOb3RJblJvb20iLCJub3RJblRoaXNSb29tSWQiLCJjYWxsc05vdEluVGhhdFJvb20iLCJlbnRyaWVzIiwiZ2V0QWxsQWN0aXZlQ2FsbHNGb3JQaXAiLCJXaWRnZXRMYXlvdXRTdG9yZSIsImhhc01heGltaXNlZFdpZGdldCIsImdldFRyYW5zZmVyZWVGb3JDYWxsSWQiLCJ0cmFuc2ZlcmVlcyIsImF1ZGlvSWQiLCJsb2dQcmVmaXgiLCJkZWJ1ZyIsImF1ZGlvIiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsInBsYXlBdWRpbyIsImF1ZGlvUHJvbWlzZXMiLCJzZXQiLCJ0aGVuIiwibG9hZCIsInBhdXNlQXVkaW8iLCJjYWxsRm9yVGhpc1Jvb20iLCJDYWxsRXZlbnQiLCJFcnJvciIsImVyciIsImVycm9yIiwiY29kZSIsIk5vVXNlck1lZGlhIiwic2hvd01lZGlhQ2FwdHVyZUVycm9yIiwiZ2V0VHVyblNlcnZlcnMiLCJsZW5ndGgiLCJzaG93SUNFRmFsbGJhY2tQcm9tcHQiLCJtZXNzYWdlIiwiSGFuZ3VwIiwiU3RhdGUiLCJSZXBsYWNlZCIsIm5ld0NhbGwiLCJBc3NlcnRlZElkZW50aXR5Q2hhbmdlZCIsImdldFJlbW90ZUFzc2VydGVkSWRlbnRpdHkiLCJuZXdBc3NlcnRlZElkZW50aXR5IiwiaWQiLCJuZXdOYXRpdmVBc3NlcnRlZElkZW50aXR5IiwicmVzcG9uc2UiLCJmaWVsZHMiLCJsb29rdXBfc3VjY2VzcyIsInVzZXJpZCIsImVuc3VyZURNRXhpc3RzIiwibmV3TWFwcGVkUm9vbUlkIiwic3RhdHMiLCJnZXRDdXJyZW50Q2FsbFN0YXRzIiwiZGlyZWN0aW9uIiwib3VyUGFydHlJZCIsImNhbmQiLCJmaWx0ZXIiLCJpdGVtIiwidHlwZSIsImFkZHJlc3MiLCJpcCIsImNhbmRpZGF0ZVR5cGUiLCJwb3J0IiwicHJvdG9jb2wiLCJyZWxheVByb3RvY29sIiwibmV0d29ya1R5cGUiLCJwYWlyIiwibG9jYWxDYW5kaWRhdGVJZCIsInJlbW90ZUNhbmRpZGF0ZUlkIiwibm9taW5hdGVkIiwicmVxdWVzdHNTZW50IiwicmVxdWVzdHNSZWNlaXZlZCIsInJlc3BvbnNlc1JlY2VpdmVkIiwicmVzcG9uc2VzU2VudCIsImJ5dGVzUmVjZWl2ZWQiLCJieXRlc1NlbnQiLCJzIiwic3RhdHVzIiwidG9hc3RLZXkiLCJnZXRJbmNvbWluZ0xlZ2FjeUNhbGxUb2FzdEtleSIsIlRvYXN0U3RvcmUiLCJhZGRPclJlcGxhY2VUb2FzdCIsImtleSIsInByaW9yaXR5IiwiY29tcG9uZW50IiwiSW5jb21pbmdMZWdhY3lDYWxsVG9hc3QiLCJib2R5Q2xhc3NOYW1lIiwicHJvcHMiLCJkaXNtaXNzVG9hc3QiLCJDYWxsc0NoYW5nZWQiLCJzdWIiLCJRdWVzdGlvbkRpYWxvZyIsImhvbWVzZXJ2ZXJEb21haW4iLCJnZXREb21haW4iLCJidXR0b24iLCJjYW5jZWxCdXR0b24iLCJvbkZpbmlzaGVkIiwiYWxsb3ciLCJzZXRWYWx1ZSIsIlNldHRpbmdMZXZlbCIsIkRFVklDRSIsInNldEZhbGxiYWNrSUNFU2VydmVyQWxsb3dlZCIsIkNhbGxUeXBlIiwiVm9pY2UiLCJWaWRlbyIsInBsYWNlTWF0cml4Q2FsbCIsInRyYW5zZmVyZWUiLCJnZXRPckNyZWF0ZVZpcnR1YWxSb29tRm9yUm9vbSIsIm1hcHBlZFJvb20iLCJnZXRQZW5kaW5nRXZlbnRzIiwiUmVzZW5kIiwiY2FuY2VsVW5zZW50RXZlbnRzIiwidGltZVVudGlsVHVybkNyZXNFeHBpcmUiLCJnZXRUdXJuU2VydmVyc0V4cGlyeSIsIkRhdGUiLCJub3ciLCJjcmVhdGVDYWxsIiwic2V0QWN0aXZlQ2FsbFJvb21JZCIsInBsYWNlVm9pY2VDYWxsIiwicGxhY2VWaWRlb0NhbGwiLCJwbGFjZUNhbGwiLCJpc01hbmFnZWRIeWJyaWRXaWRnZXRFbmFibGVkIiwiYWRkTWFuYWdlZEh5YnJpZFdpZGdldCIsImdldFN5bmNTdGF0ZSIsIlN5bmNTdGF0ZSIsIm1lbWJlcnMiLCJnZXRKb2luZWROb25GdW5jdGlvbmFsTWVtYmVycyIsImluZm8iLCJwbGFjZUppdHNpQ2FsbCIsImhhbmd1cEFsbENhbGxzIiwic3RvcFJpbmdpbmdJZlBvc3NpYmxlIiwiaGFuZ3VwIiwiaGFuZ3VwT3JSZWplY3QiLCJyZWplY3QiLCJhbnN3ZXJDYWxsIiwiYW5zd2VyIiwiVmlld1Jvb20iLCJtZXRyaWNzVHJpZ2dlciIsImRpYWxOdW1iZXIiLCJudW1iZXIiLCJyZXN1bHRzIiwidXNlcklkIiwibmF0aXZlVXNlcklkIiwibmF0aXZlTG9va3VwUmVzdWx0cyIsImxvb2t1cFN1Y2Nlc3MiLCJzdGFydFRyYW5zZmVyVG9QaG9uZU51bWJlciIsImRlc3RpbmF0aW9uIiwiY29uc3VsdEZpcnN0Iiwic3RhcnRUcmFuc2ZlclRvTWF0cml4SUQiLCJkbVJvb21JZCIsInNob3VsZF9wZWVrIiwiam9pbmluZyIsInRyYW5zZmVyIiwiYWN0aXZlQ2FsbFJvb21JZCIsInNldFJlbW90ZU9uSG9sZCIsImhhc0FueVVuaGVsZENhbGwiLCJpc1JlbW90ZU9uSG9sZCIsImNsaWVudCIsInNob3ciLCJ3aWRnZXQiLCJXaWRnZXRTdG9yZSIsImdldEFwcHMiLCJmaW5kIiwiYXBwIiwiV2lkZ2V0VHlwZSIsIkpJVFNJIiwibWF0Y2hlcyIsIm1vdmVUb0NvbnRhaW5lciIsIkNvbnRhaW5lciIsIlRvcCIsIldpZGdldFV0aWxzIiwiYWRkSml0c2lXaWRnZXQiLCJlcnJjb2RlIiwiaGFuZ3VwQ2FsbEFwcCIsInJvb21JbmZvIiwiaml0c2lXaWRnZXRzIiwid2lkZ2V0cyIsInciLCJmb3JFYWNoIiwibWVzc2FnaW5nIiwiV2lkZ2V0TWVzc2FnaW5nU3RvcmUiLCJnZXRNZXNzYWdpbmdGb3JVaWQiLCJnZXRXaWRnZXRVaWQiLCJ0cmFuc3BvcnQiLCJzZW5kIiwiRWxlbWVudFdpZGdldEFjdGlvbnMiLCJIYW5ndXBDYWxsIiwic2hvd1RyYW5zZmVyRGlhbG9nIiwiT3Blbkludml0ZURpYWxvZyIsImtpbmQiLCJLSU5EX0NBTExfVFJBTlNGRVIiLCJhbmFseXRpY3NOYW1lIiwiY2xhc3NOYW1lIiwib25GaW5pc2hlZENhbGxiYWNrIiwiY2hhbmdlZFJvb21zIiwiQ2FsbENoYW5nZVJvb20iXSwic291cmNlcyI6WyIuLi9zcmMvTGVnYWN5Q2FsbEhhbmRsZXIudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTcsIDIwMTggTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IC0gMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuQ29weXJpZ2h0IDIwMjEgxaBpbW9uIEJyYW5kbmVyIDxzaW1vbi5icmEuYWdAZ21haWwuY29tPlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQge1xuICAgIENhbGxFcnJvcixcbiAgICBDYWxsRXJyb3JDb2RlLFxuICAgIENhbGxFdmVudCxcbiAgICBDYWxsUGFydHksXG4gICAgQ2FsbFN0YXRlLFxuICAgIENhbGxUeXBlLFxuICAgIE1hdHJpeENhbGwsXG59IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy93ZWJydGMvY2FsbFwiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyJztcbmltcG9ydCBFdmVudEVtaXR0ZXIgZnJvbSAnZXZlbnRzJztcbmltcG9ydCB7IFJ1bGVJZCwgVHdlYWtOYW1lLCBUd2Vha3MgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL1B1c2hSdWxlc1wiO1xuaW1wb3J0IHsgUHVzaFByb2Nlc3NvciB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL3B1c2hwcm9jZXNzb3InO1xuaW1wb3J0IHsgU3luY1N0YXRlIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL3N5bmNcIjtcbmltcG9ydCB7IENhbGxFdmVudEhhbmRsZXJFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy93ZWJydGMvY2FsbEV2ZW50SGFuZGxlclwiO1xuXG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tICcuL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi9Nb2RhbCc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBkaXMgZnJvbSAnLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IFdpZGdldFV0aWxzIGZyb20gJy4vdXRpbHMvV2lkZ2V0VXRpbHMnO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSAnLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlJztcbmltcG9ydCB7IFdpZGdldFR5cGUgfSBmcm9tIFwiLi93aWRnZXRzL1dpZGdldFR5cGVcIjtcbmltcG9ydCB7IFNldHRpbmdMZXZlbCB9IGZyb20gXCIuL3NldHRpbmdzL1NldHRpbmdMZXZlbFwiO1xuaW1wb3J0IFF1ZXN0aW9uRGlhbG9nIGZyb20gXCIuL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9RdWVzdGlvbkRpYWxvZ1wiO1xuaW1wb3J0IEVycm9yRGlhbG9nIGZyb20gXCIuL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9FcnJvckRpYWxvZ1wiO1xuaW1wb3J0IFdpZGdldFN0b3JlIGZyb20gXCIuL3N0b3Jlcy9XaWRnZXRTdG9yZVwiO1xuaW1wb3J0IHsgV2lkZ2V0TWVzc2FnaW5nU3RvcmUgfSBmcm9tIFwiLi9zdG9yZXMvd2lkZ2V0cy9XaWRnZXRNZXNzYWdpbmdTdG9yZVwiO1xuaW1wb3J0IHsgRWxlbWVudFdpZGdldEFjdGlvbnMgfSBmcm9tIFwiLi9zdG9yZXMvd2lkZ2V0cy9FbGVtZW50V2lkZ2V0QWN0aW9uc1wiO1xuaW1wb3J0IHsgVUlGZWF0dXJlIH0gZnJvbSBcIi4vc2V0dGluZ3MvVUlGZWF0dXJlXCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tICcuL2Rpc3BhdGNoZXIvYWN0aW9ucyc7XG5pbXBvcnQgVm9pcFVzZXJNYXBwZXIgZnJvbSAnLi9Wb2lwVXNlck1hcHBlcic7XG5pbXBvcnQgeyBhZGRNYW5hZ2VkSHlicmlkV2lkZ2V0LCBpc01hbmFnZWRIeWJyaWRXaWRnZXRFbmFibGVkIH0gZnJvbSAnLi93aWRnZXRzL01hbmFnZWRIeWJyaWQnO1xuaW1wb3J0IFNka0NvbmZpZyBmcm9tICcuL1Nka0NvbmZpZyc7XG5pbXBvcnQgeyBlbnN1cmVETUV4aXN0cyB9IGZyb20gJy4vY3JlYXRlUm9vbSc7XG5pbXBvcnQgeyBDb250YWluZXIsIFdpZGdldExheW91dFN0b3JlIH0gZnJvbSAnLi9zdG9yZXMvd2lkZ2V0cy9XaWRnZXRMYXlvdXRTdG9yZSc7XG5pbXBvcnQgSW5jb21pbmdMZWdhY3lDYWxsVG9hc3QsIHsgZ2V0SW5jb21pbmdMZWdhY3lDYWxsVG9hc3RLZXkgfSBmcm9tICcuL3RvYXN0cy9JbmNvbWluZ0xlZ2FjeUNhbGxUb2FzdCc7XG5pbXBvcnQgVG9hc3RTdG9yZSBmcm9tICcuL3N0b3Jlcy9Ub2FzdFN0b3JlJztcbmltcG9ydCBSZXNlbmQgZnJvbSAnLi9SZXNlbmQnO1xuaW1wb3J0IHsgVmlld1Jvb21QYXlsb2FkIH0gZnJvbSBcIi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9WaWV3Um9vbVBheWxvYWRcIjtcbmltcG9ydCB7IEtJTkRfQ0FMTF9UUkFOU0ZFUiB9IGZyb20gXCIuL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9JbnZpdGVEaWFsb2dUeXBlc1wiO1xuaW1wb3J0IHsgT3Blbkludml0ZURpYWxvZ1BheWxvYWQgfSBmcm9tIFwiLi9kaXNwYXRjaGVyL3BheWxvYWRzL09wZW5JbnZpdGVEaWFsb2dQYXlsb2FkXCI7XG5pbXBvcnQgeyBmaW5kRE1Gb3JVc2VyIH0gZnJvbSAnLi91dGlscy9kbS9maW5kRE1Gb3JVc2VyJztcbmltcG9ydCB7IGdldEpvaW5lZE5vbkZ1bmN0aW9uYWxNZW1iZXJzIH0gZnJvbSAnLi91dGlscy9yb29tL2dldEpvaW5lZE5vbkZ1bmN0aW9uYWxNZW1iZXJzJztcblxuZXhwb3J0IGNvbnN0IFBST1RPQ09MX1BTVE4gPSAnbS5wcm90b2NvbC5wc3RuJztcbmV4cG9ydCBjb25zdCBQUk9UT0NPTF9QU1ROX1BSRUZJWEVEID0gJ2ltLnZlY3Rvci5wcm90b2NvbC5wc3RuJztcbmV4cG9ydCBjb25zdCBQUk9UT0NPTF9TSVBfTkFUSVZFID0gJ2ltLnZlY3Rvci5wcm90b2NvbC5zaXBfbmF0aXZlJztcbmV4cG9ydCBjb25zdCBQUk9UT0NPTF9TSVBfVklSVFVBTCA9ICdpbS52ZWN0b3IucHJvdG9jb2wuc2lwX3ZpcnR1YWwnO1xuXG5jb25zdCBDSEVDS19QUk9UT0NPTFNfQVRURU1QVFMgPSAzO1xuXG5lbnVtIEF1ZGlvSUQge1xuICAgIFJpbmcgPSAncmluZ0F1ZGlvJyxcbiAgICBSaW5nYmFjayA9ICdyaW5nYmFja0F1ZGlvJyxcbiAgICBDYWxsRW5kID0gJ2NhbGxlbmRBdWRpbycsXG4gICAgQnVzeSA9ICdidXN5QXVkaW8nLFxufVxuXG5pbnRlcmZhY2UgVGhpcmRwYXJ0eUxvb2t1cFJlc3BvbnNlRmllbGRzIHtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBjYW1lbGNhc2UgKi9cblxuICAgIC8vIGltLnZlY3Rvci5zaXBfbmF0aXZlXG4gICAgdmlydHVhbF9teGlkPzogc3RyaW5nO1xuICAgIGlzX3ZpcnR1YWw/OiBib29sZWFuO1xuXG4gICAgLy8gaW0udmVjdG9yLnNpcF92aXJ0dWFsXG4gICAgbmF0aXZlX214aWQ/OiBzdHJpbmc7XG4gICAgaXNfbmF0aXZlPzogYm9vbGVhbjtcblxuICAgIC8vIGNvbW1vblxuICAgIGxvb2t1cF9zdWNjZXNzPzogYm9vbGVhbjtcblxuICAgIC8qIGVzbGludC1lbmFibGUgY2FtZWxjYXNlICovXG59XG5cbmludGVyZmFjZSBUaGlyZHBhcnR5TG9va3VwUmVzcG9uc2Uge1xuICAgIHVzZXJpZDogc3RyaW5nO1xuICAgIHByb3RvY29sOiBzdHJpbmc7XG4gICAgZmllbGRzOiBUaGlyZHBhcnR5TG9va3VwUmVzcG9uc2VGaWVsZHM7XG59XG5cbmV4cG9ydCBlbnVtIExlZ2FjeUNhbGxIYW5kbGVyRXZlbnQge1xuICAgIENhbGxzQ2hhbmdlZCA9IFwiY2FsbHNfY2hhbmdlZFwiLFxuICAgIENhbGxDaGFuZ2VSb29tID0gXCJjYWxsX2NoYW5nZV9yb29tXCIsXG4gICAgU2lsZW5jZWRDYWxsc0NoYW5nZWQgPSBcInNpbGVuY2VkX2NhbGxzX2NoYW5nZWRcIixcbiAgICBDYWxsU3RhdGUgPSBcImNhbGxfc3RhdGVcIixcbn1cblxuLyoqXG4gKiBMZWdhY3lDYWxsSGFuZGxlciBtYW5hZ2VzIGFsbCBjdXJyZW50bHkgYWN0aXZlIGNhbGxzLiBJdCBzaG91bGQgYmUgdXNlZCBmb3JcbiAqIHBsYWNpbmcsIGFuc3dlcmluZywgcmVqZWN0aW5nIGFuZCBoYW5naW5nIHVwIGNhbGxzLiBJdCBhbHNvIGhhbmRsZXMgcmluZ2luZyxcbiAqIFBTVE4gc3VwcG9ydCBhbmQgb3RoZXIgdGhpbmdzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMZWdhY3lDYWxsSGFuZGxlciBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gICAgcHJpdmF0ZSBjYWxscyA9IG5ldyBNYXA8c3RyaW5nLCBNYXRyaXhDYWxsPigpOyAvLyByb29tSWQgLT4gY2FsbFxuICAgIC8vIENhbGxzIHN0YXJ0ZWQgYXMgYW4gYXR0ZW5kZWQgdHJhbnNmZXIsIGllLiB3aXRoIHRoZSBpbnRlbnRpb24gb2YgdHJhbnNmZXJyaW5nIGFub3RoZXJcbiAgICAvLyBjYWxsIHdpdGggYSBkaWZmZXJlbnQgcGFydHkgdG8gdGhpcyBvbmUuXG4gICAgcHJpdmF0ZSB0cmFuc2ZlcmVlcyA9IG5ldyBNYXA8c3RyaW5nLCBNYXRyaXhDYWxsPigpOyAvLyBjYWxsSWQgKHRhcmdldCkgLT4gY2FsbCAodHJhbnNmZXJlZSlcbiAgICBwcml2YXRlIGF1ZGlvUHJvbWlzZXMgPSBuZXcgTWFwPEF1ZGlvSUQsIFByb21pc2U8dm9pZD4+KCk7XG4gICAgcHJpdmF0ZSBzdXBwb3J0c1BzdG5Qcm90b2NvbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBwc3RuU3VwcG9ydFByZWZpeGVkID0gbnVsbDsgLy8gVHJ1ZSBpZiB0aGUgc2VydmVyIG9ubHkgc3VwcG9ydCB0aGUgcHJlZml4ZWQgcHN0biBwcm90b2NvbFxuICAgIHByaXZhdGUgc3VwcG9ydHNTaXBOYXRpdmVWaXJ0dWFsID0gbnVsbDsgLy8gaW0udmVjdG9yLnByb3RvY29sLnNpcF92aXJ0dWFsIGFuZCBpbS52ZWN0b3IucHJvdG9jb2wuc2lwX25hdGl2ZVxuXG4gICAgLy8gTWFwIG9mIHRoZSBhc3NlcnRlZCBpZGVudGl0eSB1c2VycyBhZnRlciB3ZSd2ZSBsb29rZWQgdGhlbSB1cCB1c2luZyB0aGUgQVBJLlxuICAgIC8vIFdlIG5lZWQgdG8gYmUgYmUgYWJsZSB0byBkZXRlcm1pbmUgdGhlIG1hcHBlZCByb29tIHN5bmNocm9ub3VzbHksIHNvIHdlXG4gICAgLy8gZG8gdGhlIGFzeW5jIGxvb2t1cCB3aGVuIHdlIGdldCBuZXcgaW5mb3JtYXRpb24gYW5kIHRoZW4gc3RvcmUgdGhlc2UgbWFwcGluZ3MgaGVyZVxuICAgIHByaXZhdGUgYXNzZXJ0ZWRJZGVudGl0eU5hdGl2ZVVzZXJzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcblxuICAgIHByaXZhdGUgc2lsZW5jZWRDYWxscyA9IG5ldyBTZXQ8c3RyaW5nPigpOyAvLyBjYWxsSWRzXG5cbiAgICBwdWJsaWMgc3RhdGljIGdldCBpbnN0YW5jZSgpIHtcbiAgICAgICAgaWYgKCF3aW5kb3cubXhMZWdhY3lDYWxsSGFuZGxlcikge1xuICAgICAgICAgICAgd2luZG93Lm14TGVnYWN5Q2FsbEhhbmRsZXIgPSBuZXcgTGVnYWN5Q2FsbEhhbmRsZXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB3aW5kb3cubXhMZWdhY3lDYWxsSGFuZGxlcjtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIEdldHMgdGhlIHVzZXItZmFjaW5nIHJvb20gYXNzb2NpYXRlZCB3aXRoIGEgY2FsbCAoY2FsbC5yb29tSWQgbWF5IGJlIHRoZSBjYWxsIFwidmlydHVhbCByb29tXCJcbiAgICAgKiBpZiBhIHZvaXBfbXhpZF90cmFuc2xhdGVfcGF0dGVybiBpcyBzZXQgaW4gdGhlIGNvbmZpZylcbiAgICAgKi9cbiAgICBwdWJsaWMgcm9vbUlkRm9yQ2FsbChjYWxsOiBNYXRyaXhDYWxsKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKCFjYWxsKSByZXR1cm4gbnVsbDtcblxuICAgICAgICAvLyBjaGVjayBhc3NlcnRlZCBpZGVudGl0eTogaWYgd2UncmUgbm90IG9iZXlpbmcgYXNzZXJ0ZWQgaWRlbnRpdHksXG4gICAgICAgIC8vIHRoaXMgbWFwIHdpbGwgbmV2ZXIgYmUgcG9wdWxhdGVkLCBidXQgd2UgY2hlY2sgYW55d2F5IGZvciBzYW5pdHlcbiAgICAgICAgaWYgKHRoaXMuc2hvdWxkT2JleUFzc2VydGVkZklkZW50aXR5KCkpIHtcbiAgICAgICAgICAgIGNvbnN0IG5hdGl2ZVVzZXIgPSB0aGlzLmFzc2VydGVkSWRlbnRpdHlOYXRpdmVVc2Vyc1tjYWxsLmNhbGxJZF07XG4gICAgICAgICAgICBpZiAobmF0aXZlVXNlcikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb20gPSBmaW5kRE1Gb3JVc2VyKE1hdHJpeENsaWVudFBlZy5nZXQoKSwgbmF0aXZlVXNlcik7XG4gICAgICAgICAgICAgICAgaWYgKHJvb20pIHJldHVybiByb29tLnJvb21JZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBWb2lwVXNlck1hcHBlci5zaGFyZWRJbnN0YW5jZSgpLm5hdGl2ZVJvb21Gb3JWaXJ0dWFsUm9vbShjYWxsLnJvb21JZCkgfHwgY2FsbC5yb29tSWQ7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXJ0KCk6IHZvaWQge1xuICAgICAgICAvLyBhZGQgZW1wdHkgaGFuZGxlcnMgZm9yIG1lZGlhIGFjdGlvbnMsIG90aGVyd2lzZSB0aGUgbWVkaWEga2V5c1xuICAgICAgICAvLyBlbmQgdXAgY2F1c2luZyB0aGUgYXVkaW8gZWxlbWVudHMgd2l0aCBvdXIgcmluZy9yaW5nYmFjayBldGNcbiAgICAgICAgLy8gYXVkaW8gY2xpcHMgaW4gdG8gcGxheS5cbiAgICAgICAgaWYgKG5hdmlnYXRvci5tZWRpYVNlc3Npb24pIHtcbiAgICAgICAgICAgIG5hdmlnYXRvci5tZWRpYVNlc3Npb24uc2V0QWN0aW9uSGFuZGxlcigncGxheScsIGZ1bmN0aW9uKCkge30pO1xuICAgICAgICAgICAgbmF2aWdhdG9yLm1lZGlhU2Vzc2lvbi5zZXRBY3Rpb25IYW5kbGVyKCdwYXVzZScsIGZ1bmN0aW9uKCkge30pO1xuICAgICAgICAgICAgbmF2aWdhdG9yLm1lZGlhU2Vzc2lvbi5zZXRBY3Rpb25IYW5kbGVyKCdzZWVrYmFja3dhcmQnLCBmdW5jdGlvbigpIHt9KTtcbiAgICAgICAgICAgIG5hdmlnYXRvci5tZWRpYVNlc3Npb24uc2V0QWN0aW9uSGFuZGxlcignc2Vla2ZvcndhcmQnLCBmdW5jdGlvbigpIHt9KTtcbiAgICAgICAgICAgIG5hdmlnYXRvci5tZWRpYVNlc3Npb24uc2V0QWN0aW9uSGFuZGxlcigncHJldmlvdXN0cmFjaycsIGZ1bmN0aW9uKCkge30pO1xuICAgICAgICAgICAgbmF2aWdhdG9yLm1lZGlhU2Vzc2lvbi5zZXRBY3Rpb25IYW5kbGVyKCduZXh0dHJhY2snLCBmdW5jdGlvbigpIHt9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFVJRmVhdHVyZS5Wb2lwKSkge1xuICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLm9uKENhbGxFdmVudEhhbmRsZXJFdmVudC5JbmNvbWluZywgdGhpcy5vbkNhbGxJbmNvbWluZyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNoZWNrUHJvdG9jb2xzKENIRUNLX1BST1RPQ09MU19BVFRFTVBUUyk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0b3AoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgaWYgKGNsaSkge1xuICAgICAgICAgICAgY2xpLnJlbW92ZUxpc3RlbmVyKENhbGxFdmVudEhhbmRsZXJFdmVudC5JbmNvbWluZywgdGhpcy5vbkNhbGxJbmNvbWluZyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc2lsZW5jZUNhbGwoY2FsbElkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5zaWxlbmNlZENhbGxzLmFkZChjYWxsSWQpO1xuICAgICAgICB0aGlzLmVtaXQoTGVnYWN5Q2FsbEhhbmRsZXJFdmVudC5TaWxlbmNlZENhbGxzQ2hhbmdlZCwgdGhpcy5zaWxlbmNlZENhbGxzKTtcblxuICAgICAgICAvLyBEb24ndCBwYXVzZSBhdWRpbyBpZiB3ZSBoYXZlIGNhbGxzIHdoaWNoIGFyZSBzdGlsbCByaW5naW5nXG4gICAgICAgIGlmICh0aGlzLmFyZUFueUNhbGxzVW5zaWxlbmNlZCgpKSByZXR1cm47XG4gICAgICAgIHRoaXMucGF1c2UoQXVkaW9JRC5SaW5nKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdW5TaWxlbmNlQ2FsbChjYWxsSWQ6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICB0aGlzLnNpbGVuY2VkQ2FsbHMuZGVsZXRlKGNhbGxJZCk7XG4gICAgICAgIHRoaXMuZW1pdChMZWdhY3lDYWxsSGFuZGxlckV2ZW50LlNpbGVuY2VkQ2FsbHNDaGFuZ2VkLCB0aGlzLnNpbGVuY2VkQ2FsbHMpO1xuICAgICAgICB0aGlzLnBsYXkoQXVkaW9JRC5SaW5nKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgaXNDYWxsU2lsZW5jZWQoY2FsbElkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2lsZW5jZWRDYWxscy5oYXMoY2FsbElkKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlcmUgaXMgYXQgbGVhc3Qgb25lIHVuc2lsZW5jZWQgY2FsbFxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIHByaXZhdGUgYXJlQW55Q2FsbHNVbnNpbGVuY2VkKCk6IGJvb2xlYW4ge1xuICAgICAgICBmb3IgKGNvbnN0IGNhbGwgb2YgdGhpcy5jYWxscy52YWx1ZXMoKSkge1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIGNhbGwuc3RhdGUgPT09IENhbGxTdGF0ZS5SaW5naW5nICYmXG4gICAgICAgICAgICAgICAgIXRoaXMuaXNDYWxsU2lsZW5jZWQoY2FsbC5jYWxsSWQpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBjaGVja1Byb3RvY29scyhtYXhUcmllczogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBwcm90b2NvbHMgPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VGhpcmRwYXJ0eVByb3RvY29scygpO1xuXG4gICAgICAgICAgICBpZiAocHJvdG9jb2xzW1BST1RPQ09MX1BTVE5dICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN1cHBvcnRzUHN0blByb3RvY29sID0gQm9vbGVhbihwcm90b2NvbHNbUFJPVE9DT0xfUFNUTl0pO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN1cHBvcnRzUHN0blByb3RvY29sKSB0aGlzLnBzdG5TdXBwb3J0UHJlZml4ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvdG9jb2xzW1BST1RPQ09MX1BTVE5fUFJFRklYRURdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN1cHBvcnRzUHN0blByb3RvY29sID0gQm9vbGVhbihwcm90b2NvbHNbUFJPVE9DT0xfUFNUTl9QUkVGSVhFRF0pO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN1cHBvcnRzUHN0blByb3RvY29sKSB0aGlzLnBzdG5TdXBwb3J0UHJlZml4ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN1cHBvcnRzUHN0blByb3RvY29sID0gbnVsbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiBBY3Rpb24uUHN0blN1cHBvcnRVcGRhdGVkIH0pO1xuXG4gICAgICAgICAgICBpZiAocHJvdG9jb2xzW1BST1RPQ09MX1NJUF9OQVRJVkVdICE9PSB1bmRlZmluZWQgJiYgcHJvdG9jb2xzW1BST1RPQ09MX1NJUF9WSVJUVUFMXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdXBwb3J0c1NpcE5hdGl2ZVZpcnR1YWwgPSBCb29sZWFuKFxuICAgICAgICAgICAgICAgICAgICBwcm90b2NvbHNbUFJPVE9DT0xfU0lQX05BVElWRV0gJiYgcHJvdG9jb2xzW1BST1RPQ09MX1NJUF9WSVJUVUFMXSxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246IEFjdGlvbi5WaXJ0dWFsUm9vbVN1cHBvcnRVcGRhdGVkIH0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAobWF4VHJpZXMgPT09IDEpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIubG9nKFwiRmFpbGVkIHRvIGNoZWNrIGZvciBwcm90b2NvbCBzdXBwb3J0IGFuZCBubyByZXRyaWVzIHJlbWFpbjogYXNzdW1pbmcgbm8gc3VwcG9ydFwiLCBlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmxvZyhcIkZhaWxlZCB0byBjaGVjayBmb3IgcHJvdG9jb2wgc3VwcG9ydDogd2lsbCByZXRyeVwiLCBlKTtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVja1Byb3RvY29scyhtYXhUcmllcyAtIDEpO1xuICAgICAgICAgICAgICAgIH0sIDEwMDAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc2hvdWxkT2JleUFzc2VydGVkZklkZW50aXR5KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gU2RrQ29uZmlnLmdldE9iamVjdChcInZvaXBcIik/LmdldChcIm9iZXlfYXNzZXJ0ZWRfaWRlbnRpdHlcIik7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFN1cHBvcnRzUHN0blByb3RvY29sKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5zdXBwb3J0c1BzdG5Qcm90b2NvbDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0U3VwcG9ydHNWaXJ0dWFsUm9vbXMoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLnN1cHBvcnRzU2lwTmF0aXZlVmlydHVhbDtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgcHN0bkxvb2t1cChwaG9uZU51bWJlcjogc3RyaW5nKTogUHJvbWlzZTxUaGlyZHBhcnR5TG9va3VwUmVzcG9uc2VbXT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRUaGlyZHBhcnR5VXNlcihcbiAgICAgICAgICAgICAgICB0aGlzLnBzdG5TdXBwb3J0UHJlZml4ZWQgPyBQUk9UT0NPTF9QU1ROX1BSRUZJWEVEIDogUFJPVE9DT0xfUFNUTiwge1xuICAgICAgICAgICAgICAgICAgICAnbS5pZC5waG9uZSc6IHBob25lTnVtYmVyLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBsb2dnZXIud2FybignRmFpbGVkIHRvIGxvb2t1cCB1c2VyIGZyb20gcGhvbmUgbnVtYmVyJywgZSk7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBzaXBWaXJ0dWFsTG9va3VwKG5hdGl2ZU14aWQ6IHN0cmluZyk6IFByb21pc2U8VGhpcmRwYXJ0eUxvb2t1cFJlc3BvbnNlW10+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VGhpcmRwYXJ0eVVzZXIoXG4gICAgICAgICAgICAgICAgUFJPVE9DT0xfU0lQX1ZJUlRVQUwsIHtcbiAgICAgICAgICAgICAgICAgICAgJ25hdGl2ZV9teGlkJzogbmF0aXZlTXhpZCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oJ0ZhaWxlZCB0byBxdWVyeSBTSVAgaWRlbnRpdHkgZm9yIHVzZXInLCBlKTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIHNpcE5hdGl2ZUxvb2t1cCh2aXJ0dWFsTXhpZDogc3RyaW5nKTogUHJvbWlzZTxUaGlyZHBhcnR5TG9va3VwUmVzcG9uc2VbXT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRUaGlyZHBhcnR5VXNlcihcbiAgICAgICAgICAgICAgICBQUk9UT0NPTF9TSVBfTkFUSVZFLCB7XG4gICAgICAgICAgICAgICAgICAgICd2aXJ0dWFsX214aWQnOiB2aXJ0dWFsTXhpZCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oJ0ZhaWxlZCB0byBxdWVyeSBpZGVudGl0eSBmb3IgU0lQIHVzZXInLCBlKTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkNhbGxJbmNvbWluZyA9IChjYWxsOiBNYXRyaXhDYWxsKTogdm9pZCA9PiB7XG4gICAgICAgIC8vIGlmIHRoZSBydW50aW1lIGVudiBkb2Vzbid0IGRvIFZvSVAsIHN0b3AgaGVyZS5cbiAgICAgICAgaWYgKCFNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc3VwcG9ydHNWb2lwKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG1hcHBlZFJvb21JZCA9IExlZ2FjeUNhbGxIYW5kbGVyLmluc3RhbmNlLnJvb21JZEZvckNhbGwoY2FsbCk7XG4gICAgICAgIGlmICh0aGlzLmdldENhbGxGb3JSb29tKG1hcHBlZFJvb21JZCkpIHtcbiAgICAgICAgICAgIGxvZ2dlci5sb2coXG4gICAgICAgICAgICAgICAgXCJHb3QgaW5jb21pbmcgY2FsbCBmb3Igcm9vbSBcIiArIG1hcHBlZFJvb21JZCArXG4gICAgICAgICAgICAgICAgXCIgYnV0IHRoZXJlJ3MgYWxyZWFkeSBhIGNhbGwgZm9yIHRoaXMgcm9vbTogaWdub3JpbmdcIixcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFkZENhbGxGb3JSb29tKG1hcHBlZFJvb21JZCwgY2FsbCk7XG4gICAgICAgIHRoaXMuc2V0Q2FsbExpc3RlbmVycyhjYWxsKTtcbiAgICAgICAgLy8gRXhwbGljaXRseSBoYW5kbGUgZmlyc3Qgc3RhdGUgY2hhbmdlXG4gICAgICAgIHRoaXMub25DYWxsU3RhdGVDaGFuZ2VkKGNhbGwuc3RhdGUsIG51bGwsIGNhbGwpO1xuXG4gICAgICAgIC8vIGdldCByZWFkeSB0byBzZW5kIGVuY3J5cHRlZCBldmVudHMgaW4gdGhlIHJvb20sIHNvIGlmIHRoZSB1c2VyIGRvZXMgYW5zd2VyXG4gICAgICAgIC8vIHRoZSBjYWxsLCB3ZSdsbCBiZSByZWFkeSB0byBzZW5kLiBOQi4gVGhpcyBpcyB0aGUgcHJvdG9jb2wtbGV2ZWwgcm9vbSBJRCBub3RcbiAgICAgICAgLy8gdGhlIG1hcHBlZCBvbmU6IHRoYXQncyB3aGVyZSB3ZSdsbCBzZW5kIHRoZSBldmVudHMuXG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY2xpLnByZXBhcmVUb0VuY3J5cHQoY2xpLmdldFJvb20oY2FsbC5yb29tSWQpKTtcbiAgICB9O1xuXG4gICAgcHVibGljIGdldENhbGxCeUlkKGNhbGxJZDogc3RyaW5nKTogTWF0cml4Q2FsbCB7XG4gICAgICAgIGZvciAoY29uc3QgY2FsbCBvZiB0aGlzLmNhbGxzLnZhbHVlcygpKSB7XG4gICAgICAgICAgICBpZiAoY2FsbC5jYWxsSWQgPT09IGNhbGxJZCkgcmV0dXJuIGNhbGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcHVibGljIGdldENhbGxGb3JSb29tKHJvb21JZDogc3RyaW5nKTogTWF0cml4Q2FsbCB8IG51bGwge1xuICAgICAgICByZXR1cm4gdGhpcy5jYWxscy5nZXQocm9vbUlkKSB8fCBudWxsO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRBbnlBY3RpdmVDYWxsKCk6IE1hdHJpeENhbGwgfCBudWxsIHtcbiAgICAgICAgZm9yIChjb25zdCBjYWxsIG9mIHRoaXMuY2FsbHMudmFsdWVzKCkpIHtcbiAgICAgICAgICAgIGlmIChjYWxsLnN0YXRlICE9PSBDYWxsU3RhdGUuRW5kZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0QWxsQWN0aXZlQ2FsbHMoKTogTWF0cml4Q2FsbFtdIHtcbiAgICAgICAgY29uc3QgYWN0aXZlQ2FsbHMgPSBbXTtcblxuICAgICAgICBmb3IgKGNvbnN0IGNhbGwgb2YgdGhpcy5jYWxscy52YWx1ZXMoKSkge1xuICAgICAgICAgICAgaWYgKGNhbGwuc3RhdGUgIT09IENhbGxTdGF0ZS5FbmRlZCAmJiBjYWxsLnN0YXRlICE9PSBDYWxsU3RhdGUuUmluZ2luZykge1xuICAgICAgICAgICAgICAgIGFjdGl2ZUNhbGxzLnB1c2goY2FsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFjdGl2ZUNhbGxzO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRBbGxBY3RpdmVDYWxsc05vdEluUm9vbShub3RJblRoaXNSb29tSWQ6IHN0cmluZyk6IE1hdHJpeENhbGxbXSB7XG4gICAgICAgIGNvbnN0IGNhbGxzTm90SW5UaGF0Um9vbSA9IFtdO1xuXG4gICAgICAgIGZvciAoY29uc3QgW3Jvb21JZCwgY2FsbF0gb2YgdGhpcy5jYWxscy5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgIGlmIChyb29tSWQgIT09IG5vdEluVGhpc1Jvb21JZCAmJiBjYWxsLnN0YXRlICE9PSBDYWxsU3RhdGUuRW5kZWQpIHtcbiAgICAgICAgICAgICAgICBjYWxsc05vdEluVGhhdFJvb20ucHVzaChjYWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FsbHNOb3RJblRoYXRSb29tO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRBbGxBY3RpdmVDYWxsc0ZvclBpcChyb29tSWQ6IHN0cmluZykge1xuICAgICAgICBjb25zdCByb29tID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20ocm9vbUlkKTtcbiAgICAgICAgaWYgKFdpZGdldExheW91dFN0b3JlLmluc3RhbmNlLmhhc01heGltaXNlZFdpZGdldChyb29tKSkge1xuICAgICAgICAgICAgLy8gVGhpcyBjaGVja3MgaWYgdGhlcmUgaXMgc3BhY2UgZm9yIHRoZSBjYWxsIHZpZXcgaW4gdGhlIGF1eCBwYW5lbFxuICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gc3BhY2UgYW55IGNhbGwgc2hvdWxkIGJlIGRpc3BsYXllZCBpbiBQaVBcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEFsbEFjdGl2ZUNhbGxzKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QWxsQWN0aXZlQ2FsbHNOb3RJblJvb20ocm9vbUlkKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0VHJhbnNmZXJlZUZvckNhbGxJZChjYWxsSWQ6IHN0cmluZyk6IE1hdHJpeENhbGwge1xuICAgICAgICByZXR1cm4gdGhpcy50cmFuc2ZlcmVlc1tjYWxsSWRdO1xuICAgIH1cblxuICAgIHB1YmxpYyBwbGF5KGF1ZGlvSWQ6IEF1ZGlvSUQpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgbG9nUHJlZml4ID0gYExlZ2FjeUNhbGxIYW5kbGVyLnBsYXkoJHthdWRpb0lkfSk6YDtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKGAke2xvZ1ByZWZpeH0gYmVnaW5uaW5nIG9mIGZ1bmN0aW9uYCk7XG4gICAgICAgIC8vIFRPRE86IEF0dGFjaCBhbiBpbnZpc2libGUgZWxlbWVudCBmb3IgdGhpcyBpbnN0ZWFkXG4gICAgICAgIC8vIHdoaWNoIGxpc3RlbnM/XG4gICAgICAgIGNvbnN0IGF1ZGlvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYXVkaW9JZCkgYXMgSFRNTE1lZGlhRWxlbWVudDtcbiAgICAgICAgaWYgKGF1ZGlvKSB7XG4gICAgICAgICAgICBjb25zdCBwbGF5QXVkaW8gPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBzdGlsbCBjYXVzZXMgdGhlIGNocm9tZSBkZWJ1Z2dlciB0byBicmVhayBvbiBwcm9taXNlIHJlamVjdGlvbiBpZlxuICAgICAgICAgICAgICAgICAgICAvLyB0aGUgcHJvbWlzZSBpcyByZWplY3RlZCwgZXZlbiB0aG91Z2ggd2UncmUgY2F0Y2hpbmcgdGhlIGV4Y2VwdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKGAke2xvZ1ByZWZpeH0gYXR0ZW1wdGluZyB0byBwbGF5IGF1ZGlvYCk7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGF1ZGlvLnBsYXkoKTtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKGAke2xvZ1ByZWZpeH0gcGxheWluZyBhdWRpbyBzdWNjZXNzZnVsbHlgKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgdXN1YWxseSBiZWNhdXNlIHRoZSB1c2VyIGhhc24ndCBpbnRlcmFjdGVkIHdpdGggdGhlIGRvY3VtZW50LFxuICAgICAgICAgICAgICAgICAgICAvLyBvciBjaHJvbWUgZG9lc24ndCB0aGluayBzbyBhbmQgaXMgZGVueWluZyB0aGUgcmVxdWVzdC4gTm90IHN1cmUgd2hhdFxuICAgICAgICAgICAgICAgICAgICAvLyB3ZSBjYW4gcmVhbGx5IGRvIGhlcmUuLi5cbiAgICAgICAgICAgICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvNzY1N1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIud2FybihgJHtsb2dQcmVmaXh9IHVuYWJsZSB0byBwbGF5IGF1ZGlvIGNsaXBgLCBlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKHRoaXMuYXVkaW9Qcm9taXNlcy5oYXMoYXVkaW9JZCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmF1ZGlvUHJvbWlzZXMuc2V0KGF1ZGlvSWQsIHRoaXMuYXVkaW9Qcm9taXNlcy5nZXQoYXVkaW9JZCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGF1ZGlvLmxvYWQoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBsYXlBdWRpbygpO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hdWRpb1Byb21pc2VzLnNldChhdWRpb0lkLCBwbGF5QXVkaW8oKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsb2dnZXIud2FybihgJHtsb2dQcmVmaXh9IHVuYWJsZSB0byBmaW5kIDxhdWRpbz4gZWxlbWVudCBmb3IgJHthdWRpb0lkfWApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHBhdXNlKGF1ZGlvSWQ6IEF1ZGlvSUQpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgbG9nUHJlZml4ID0gYExlZ2FjeUNhbGxIYW5kbGVyLnBhdXNlKCR7YXVkaW9JZH0pOmA7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZyhgJHtsb2dQcmVmaXh9IGJlZ2lubmluZyBvZiBmdW5jdGlvbmApO1xuICAgICAgICAvLyBUT0RPOiBBdHRhY2ggYW4gaW52aXNpYmxlIGVsZW1lbnQgZm9yIHRoaXMgaW5zdGVhZFxuICAgICAgICAvLyB3aGljaCBsaXN0ZW5zP1xuICAgICAgICBjb25zdCBhdWRpbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGF1ZGlvSWQpIGFzIEhUTUxNZWRpYUVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IHBhdXNlQXVkaW8gPSAoKSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuZGVidWcoYCR7bG9nUHJlZml4fSBwYXVzaW5nIGF1ZGlvYCk7XG4gICAgICAgICAgICAvLyBwYXVzZSBkb2Vzbid0IHJldHVybiBhIHByb21pc2UsIHNvIGp1c3QgZG8gaXRcbiAgICAgICAgICAgIGF1ZGlvLnBhdXNlKCk7XG4gICAgICAgIH07XG4gICAgICAgIGlmIChhdWRpbykge1xuICAgICAgICAgICAgaWYgKHRoaXMuYXVkaW9Qcm9taXNlcy5oYXMoYXVkaW9JZCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmF1ZGlvUHJvbWlzZXMuc2V0KGF1ZGlvSWQsIHRoaXMuYXVkaW9Qcm9taXNlcy5nZXQoYXVkaW9JZCkudGhlbihwYXVzZUF1ZGlvKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhdXNlQXVkaW8oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxvZ2dlci53YXJuKGAke2xvZ1ByZWZpeH0gdW5hYmxlIHRvIGZpbmQgPGF1ZGlvPiBlbGVtZW50IGZvciAke2F1ZGlvSWR9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG1hdGNoZXNDYWxsRm9yVGhpc1Jvb20oY2FsbDogTWF0cml4Q2FsbCk6IGJvb2xlYW4ge1xuICAgICAgICAvLyBXZSBkb24ndCBhbGxvdyBwbGFjaW5nIG1vcmUgdGhhbiBvbmUgY2FsbCBwZXIgcm9vbSwgYnV0IHRoYXQgZG9lc24ndCBtZWFuIHRoZXJlXG4gICAgICAgIC8vIGNhbid0IGJlIG1vcmUgdGhhbiBvbmUsIGVnLiBpbiBhIGdsYXJlIHNpdHVhdGlvbi4gVGhpcyBjaGVja3MgdGhhdCB0aGUgZ2l2ZW4gY2FsbFxuICAgICAgICAvLyBpcyB0aGUgY2FsbCB3ZSBjb25zaWRlciAndGhlJyBjYWxsIGZvciBpdHMgcm9vbS5cbiAgICAgICAgY29uc3QgbWFwcGVkUm9vbUlkID0gdGhpcy5yb29tSWRGb3JDYWxsKGNhbGwpO1xuXG4gICAgICAgIGNvbnN0IGNhbGxGb3JUaGlzUm9vbSA9IHRoaXMuZ2V0Q2FsbEZvclJvb20obWFwcGVkUm9vbUlkKTtcbiAgICAgICAgcmV0dXJuIGNhbGxGb3JUaGlzUm9vbSAmJiBjYWxsLmNhbGxJZCA9PT0gY2FsbEZvclRoaXNSb29tLmNhbGxJZDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNldENhbGxMaXN0ZW5lcnMoY2FsbDogTWF0cml4Q2FsbCk6IHZvaWQge1xuICAgICAgICBsZXQgbWFwcGVkUm9vbUlkID0gdGhpcy5yb29tSWRGb3JDYWxsKGNhbGwpO1xuXG4gICAgICAgIGNhbGwub24oQ2FsbEV2ZW50LkVycm9yLCAoZXJyOiBDYWxsRXJyb3IpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5tYXRjaGVzQ2FsbEZvclRoaXNSb29tKGNhbGwpKSByZXR1cm47XG5cbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkNhbGwgZXJyb3I6XCIsIGVycik7XG5cbiAgICAgICAgICAgIGlmIChlcnIuY29kZSA9PT0gQ2FsbEVycm9yQ29kZS5Ob1VzZXJNZWRpYSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd01lZGlhQ2FwdHVyZUVycm9yKGNhbGwpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRUdXJuU2VydmVycygpLmxlbmd0aCA9PT0gMCAmJlxuICAgICAgICAgICAgICAgIFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJmYWxsYmFja0lDRVNlcnZlckFsbG93ZWRcIikgPT09IG51bGxcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0lDRUZhbGxiYWNrUHJvbXB0KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0NhbGwgRmFpbGVkJyksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBjYWxsLm9uKENhbGxFdmVudC5IYW5ndXAsICgpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5tYXRjaGVzQ2FsbEZvclRoaXNSb29tKGNhbGwpKSByZXR1cm47XG5cbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2FsbEZvclJvb20obWFwcGVkUm9vbUlkKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNhbGwub24oQ2FsbEV2ZW50LlN0YXRlLCAobmV3U3RhdGU6IENhbGxTdGF0ZSwgb2xkU3RhdGU6IENhbGxTdGF0ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5vbkNhbGxTdGF0ZUNoYW5nZWQobmV3U3RhdGUsIG9sZFN0YXRlLCBjYWxsKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNhbGwub24oQ2FsbEV2ZW50LlJlcGxhY2VkLCAobmV3Q2FsbDogTWF0cml4Q2FsbCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1hdGNoZXNDYWxsRm9yVGhpc1Jvb20oY2FsbCkpIHJldHVybjtcblxuICAgICAgICAgICAgbG9nZ2VyLmxvZyhgQ2FsbCBJRCAke2NhbGwuY2FsbElkfSBpcyBiZWluZyByZXBsYWNlZCBieSBjYWxsIElEICR7bmV3Q2FsbC5jYWxsSWR9YCk7XG5cbiAgICAgICAgICAgIGlmIChjYWxsLnN0YXRlID09PSBDYWxsU3RhdGUuUmluZ2luZykge1xuICAgICAgICAgICAgICAgIHRoaXMucGF1c2UoQXVkaW9JRC5SaW5nKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY2FsbC5zdGF0ZSA9PT0gQ2FsbFN0YXRlLkludml0ZVNlbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhdXNlKEF1ZGlvSUQuUmluZ2JhY2spO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnJlbW92ZUNhbGxGb3JSb29tKG1hcHBlZFJvb21JZCk7XG4gICAgICAgICAgICB0aGlzLmFkZENhbGxGb3JSb29tKG1hcHBlZFJvb21JZCwgbmV3Q2FsbCk7XG4gICAgICAgICAgICB0aGlzLnNldENhbGxMaXN0ZW5lcnMobmV3Q2FsbCk7XG4gICAgICAgICAgICB0aGlzLnNldENhbGxTdGF0ZShuZXdDYWxsLCBuZXdDYWxsLnN0YXRlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNhbGwub24oQ2FsbEV2ZW50LkFzc2VydGVkSWRlbnRpdHlDaGFuZ2VkLCBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMubWF0Y2hlc0NhbGxGb3JUaGlzUm9vbShjYWxsKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBsb2dnZXIubG9nKGBDYWxsIElEICR7Y2FsbC5jYWxsSWR9IGdvdCBuZXcgYXNzZXJ0ZWQgaWRlbnRpdHk6YCwgY2FsbC5nZXRSZW1vdGVBc3NlcnRlZElkZW50aXR5KCkpO1xuXG4gICAgICAgICAgICBpZiAoIXRoaXMuc2hvdWxkT2JleUFzc2VydGVkZklkZW50aXR5KCkpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIubG9nKFwiYXNzZXJ0ZWQgaWRlbnRpdHkgbm90IGVuYWJsZWQgaW4gY29uZmlnOiBpZ25vcmluZ1wiKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IG5ld0Fzc2VydGVkSWRlbnRpdHkgPSBjYWxsLmdldFJlbW90ZUFzc2VydGVkSWRlbnRpdHkoKS5pZDtcbiAgICAgICAgICAgIGxldCBuZXdOYXRpdmVBc3NlcnRlZElkZW50aXR5ID0gbmV3QXNzZXJ0ZWRJZGVudGl0eTtcbiAgICAgICAgICAgIGlmIChuZXdBc3NlcnRlZElkZW50aXR5KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLnNpcE5hdGl2ZUxvb2t1cChuZXdBc3NlcnRlZElkZW50aXR5KTtcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UubGVuZ3RoICYmIHJlc3BvbnNlWzBdLmZpZWxkcy5sb29rdXBfc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICBuZXdOYXRpdmVBc3NlcnRlZElkZW50aXR5ID0gcmVzcG9uc2VbMF0udXNlcmlkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxvZ2dlci5sb2coYEFzc2VydGVkIGlkZW50aXR5ICR7bmV3QXNzZXJ0ZWRJZGVudGl0eX0gbWFwcGVkIHRvICR7bmV3TmF0aXZlQXNzZXJ0ZWRJZGVudGl0eX1gKTtcblxuICAgICAgICAgICAgaWYgKG5ld05hdGl2ZUFzc2VydGVkSWRlbnRpdHkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFzc2VydGVkSWRlbnRpdHlOYXRpdmVVc2Vyc1tjYWxsLmNhbGxJZF0gPSBuZXdOYXRpdmVBc3NlcnRlZElkZW50aXR5O1xuXG4gICAgICAgICAgICAgICAgLy8gSWYgd2UgZG9uJ3QgYWxyZWFkeSBoYXZlIGEgcm9vbSB3aXRoIHRoaXMgdXNlciwgbWFrZSBvbmUuIFRoaXMgd2lsbCBiZSBzbGlnaHRseSBvZGRcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGV5IGNhbGxlZCB1cyBiZWNhdXNlIHdlJ2xsIGJlIGludml0aW5nIHRoZW0sIGJ1dCB0aGVyZSdzIG5vdCBtdWNoIHdlIGNhbiBkbyBhYm91dFxuICAgICAgICAgICAgICAgIC8vIHRoaXMgaWYgd2Ugd2FudCB0aGUgYWN0dWFsLCBuYXRpdmUgcm9vbSB0byBleGlzdCAod2hpY2ggd2UgZG8pLiBUaGlzIGlzIHdoeSBpdCdzXG4gICAgICAgICAgICAgICAgLy8gaW1wb3J0YW50IHRvIG9ubHkgb2JleSBhc3NlcnRlZCBpZGVudGl0eSBpbiB0cnVzdGVkIGVudmlyb25tZW50cywgc2luY2UgYW55b25lIHlvdSdyZVxuICAgICAgICAgICAgICAgIC8vIG9uIGEgY2FsbCB3aXRoIGNhbiBjYXVzZSB5b3UgdG8gc2VuZCBhIHJvb20gaW52aXRlIHRvIHNvbWVvbmUuXG4gICAgICAgICAgICAgICAgYXdhaXQgZW5zdXJlRE1FeGlzdHMoTWF0cml4Q2xpZW50UGVnLmdldCgpLCBuZXdOYXRpdmVBc3NlcnRlZElkZW50aXR5KTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld01hcHBlZFJvb21JZCA9IHRoaXMucm9vbUlkRm9yQ2FsbChjYWxsKTtcbiAgICAgICAgICAgICAgICBsb2dnZXIubG9nKGBPbGQgcm9vbSBJRDogJHttYXBwZWRSb29tSWR9LCBuZXcgcm9vbSBJRDogJHtuZXdNYXBwZWRSb29tSWR9YCk7XG4gICAgICAgICAgICAgICAgaWYgKG5ld01hcHBlZFJvb21JZCAhPT0gbWFwcGVkUm9vbUlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2FsbEZvclJvb20obWFwcGVkUm9vbUlkKTtcbiAgICAgICAgICAgICAgICAgICAgbWFwcGVkUm9vbUlkID0gbmV3TWFwcGVkUm9vbUlkO1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIubG9nKFwiTW92aW5nIGNhbGwgdG8gcm9vbSBcIiArIG1hcHBlZFJvb21JZCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkQ2FsbEZvclJvb20obWFwcGVkUm9vbUlkLCBjYWxsLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25DYWxsU3RhdGVDaGFuZ2VkID0gKG5ld1N0YXRlOiBDYWxsU3RhdGUsIG9sZFN0YXRlOiBDYWxsU3RhdGUsIGNhbGw6IE1hdHJpeENhbGwpOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLm1hdGNoZXNDYWxsRm9yVGhpc1Jvb20oY2FsbCkpIHJldHVybjtcblxuICAgICAgICBjb25zdCBtYXBwZWRSb29tSWQgPSB0aGlzLnJvb21JZEZvckNhbGwoY2FsbCk7XG4gICAgICAgIHRoaXMuc2V0Q2FsbFN0YXRlKGNhbGwsIG5ld1N0YXRlKTtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogJ2NhbGxfc3RhdGUnLFxuICAgICAgICAgICAgcm9vbV9pZDogbWFwcGVkUm9vbUlkLFxuICAgICAgICAgICAgc3RhdGU6IG5ld1N0YXRlLFxuICAgICAgICB9KTtcblxuICAgICAgICBzd2l0Y2ggKG9sZFN0YXRlKSB7XG4gICAgICAgICAgICBjYXNlIENhbGxTdGF0ZS5SaW5naW5nOlxuICAgICAgICAgICAgICAgIHRoaXMucGF1c2UoQXVkaW9JRC5SaW5nKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQ2FsbFN0YXRlLkludml0ZVNlbnQ6XG4gICAgICAgICAgICAgICAgdGhpcy5wYXVzZShBdWRpb0lELlJpbmdiYWNrKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuZXdTdGF0ZSAhPT0gQ2FsbFN0YXRlLlJpbmdpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuc2lsZW5jZWRDYWxscy5kZWxldGUoY2FsbC5jYWxsSWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoIChuZXdTdGF0ZSkge1xuICAgICAgICAgICAgY2FzZSBDYWxsU3RhdGUuUmluZ2luZzoge1xuICAgICAgICAgICAgICAgIGNvbnN0IGluY29taW5nQ2FsbFB1c2hSdWxlID0gKFxuICAgICAgICAgICAgICAgICAgICBuZXcgUHVzaFByb2Nlc3NvcihNYXRyaXhDbGllbnRQZWcuZ2V0KCkpLmdldFB1c2hSdWxlQnlJZChSdWxlSWQuSW5jb21pbmdDYWxsKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgY29uc3QgcHVzaFJ1bGVFbmFibGVkID0gaW5jb21pbmdDYWxsUHVzaFJ1bGU/LmVuYWJsZWQ7XG4gICAgICAgICAgICAgICAgY29uc3QgdHdlYWtTZXRUb1JpbmcgPSBpbmNvbWluZ0NhbGxQdXNoUnVsZT8uYWN0aW9ucy5zb21lKChhY3Rpb246IFR3ZWFrcykgPT4gKFxuICAgICAgICAgICAgICAgICAgICBhY3Rpb24uc2V0X3R3ZWFrID09PSBUd2Vha05hbWUuU291bmQgJiZcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uLnZhbHVlID09PSBcInJpbmdcIlxuICAgICAgICAgICAgICAgICkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHB1c2hSdWxlRW5hYmxlZCAmJiB0d2Vha1NldFRvUmluZykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBsYXkoQXVkaW9JRC5SaW5nKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNpbGVuY2VDYWxsKGNhbGwuY2FsbElkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIENhbGxTdGF0ZS5JbnZpdGVTZW50OiB7XG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5KEF1ZGlvSUQuUmluZ2JhY2spO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBDYWxsU3RhdGUuRW5kZWQ6IHtcbiAgICAgICAgICAgICAgICBjb25zdCBoYW5ndXBSZWFzb24gPSBjYWxsLmhhbmd1cFJlYXNvbjtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUNhbGxGb3JSb29tKG1hcHBlZFJvb21JZCk7XG4gICAgICAgICAgICAgICAgaWYgKG9sZFN0YXRlID09PSBDYWxsU3RhdGUuSW52aXRlU2VudCAmJiBjYWxsLmhhbmd1cFBhcnR5ID09PSBDYWxsUGFydHkuUmVtb3RlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGxheShBdWRpb0lELkJ1c3kpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIERvbid0IHNob3cgYSBtb2RhbCB3aGVuIHdlIGdvdCByZWplY3RlZC90aGUgY2FsbCB3YXMgaHVuZyB1cFxuICAgICAgICAgICAgICAgICAgICBpZiAoIWhhbmd1cFJlYXNvbiB8fCBbQ2FsbEVycm9yQ29kZS5Vc2VySGFuZ3VwLCBcInVzZXIgaGFuZ3VwXCJdLmluY2x1ZGVzKGhhbmd1cFJlYXNvbikpIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIGxldCB0aXRsZTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGRlc2NyaXB0aW9uO1xuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBXZSBzaG91bGQgZWl0aGVyIGRvIGF3YXkgd2l0aCB0aGVzZSBvciBmaWd1cmUgb3V0IGEgY29weSBmb3IgZWFjaCBjb2RlIChleHBlY3QgdXNlcl9oYW5ndXAuLi4pXG4gICAgICAgICAgICAgICAgICAgIGlmIChjYWxsLmhhbmd1cFJlYXNvbiA9PT0gQ2FsbEVycm9yQ29kZS5Vc2VyQnVzeSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGUgPSBfdChcIlVzZXIgQnVzeVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gX3QoXCJUaGUgdXNlciB5b3UgY2FsbGVkIGlzIGJ1c3kuXCIpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGUgPSBfdChcIkNhbGwgRmFpbGVkXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb24gPSBfdChcIlRoZSBjYWxsIGNvdWxkIG5vdCBiZSBlc3RhYmxpc2hlZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGUsIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAgICAgICAgICBoYW5ndXBSZWFzb24gPT09IENhbGxFcnJvckNvZGUuQW5zd2VyZWRFbHNld2hlcmUgJiYgb2xkU3RhdGUgPT09IENhbGxTdGF0ZS5Db25uZWN0aW5nXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiQW5zd2VyZWQgRWxzZXdoZXJlXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KFwiVGhlIGNhbGwgd2FzIGFuc3dlcmVkIG9uIGFub3RoZXIgZGV2aWNlLlwiKSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChvbGRTdGF0ZSAhPT0gQ2FsbFN0YXRlLkZsZWRnbGluZyAmJiBvbGRTdGF0ZSAhPT0gQ2FsbFN0YXRlLlJpbmdpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZG9uJ3QgcGxheSB0aGUgZW5kLWNhbGwgc291bmQgZm9yIGNhbGxzIHRoYXQgbmV2ZXIgZ290IG9mZiB0aGUgZ3JvdW5kXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGxheShBdWRpb0lELkNhbGxFbmQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMubG9nQ2FsbFN0YXRzKGNhbGwsIG1hcHBlZFJvb21JZCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBhc3luYyBsb2dDYWxsU3RhdHMoY2FsbDogTWF0cml4Q2FsbCwgbWFwcGVkUm9vbUlkOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3Qgc3RhdHMgPSBhd2FpdCBjYWxsLmdldEN1cnJlbnRDYWxsU3RhdHMoKTtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKFxuICAgICAgICAgICAgYENhbGwgY29tcGxldGVkLiBDYWxsIElEOiAke2NhbGwuY2FsbElkfSwgdmlydHVhbCByb29tIElEOiAke2NhbGwucm9vbUlkfSwgYCArXG4gICAgICAgICAgICBgdXNlci1mYWNpbmcgcm9vbSBJRDogJHttYXBwZWRSb29tSWR9LCBkaXJlY3Rpb246ICR7Y2FsbC5kaXJlY3Rpb259LCBgICtcbiAgICAgICAgICAgIGBvdXIgUGFydHkgSUQ6ICR7Y2FsbC5vdXJQYXJ0eUlkfSwgaGFuZ3VwIHBhcnR5OiAke2NhbGwuaGFuZ3VwUGFydHl9LCBgICtcbiAgICAgICAgICAgIGBoYW5ndXAgcmVhc29uOiAke2NhbGwuaGFuZ3VwUmVhc29ufWAsXG4gICAgICAgICk7XG4gICAgICAgIGlmICghc3RhdHMpIHtcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhcbiAgICAgICAgICAgICAgICBcIkNhbGwgc3RhdGlzdGljcyBhcmUgdW5kZWZpbmVkLiBUaGUgY2FsbCBoYXMgXCIgK1xuICAgICAgICAgICAgICAgIFwicHJvYmFibHkgZmFpbGVkIGJlZm9yZSBhIHBlZXJDb25uIHdhcyBlc3RhYmxpc2hlZFwiLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsb2dnZXIuZGVidWcoXCJMb2NhbCBjYW5kaWRhdGVzOlwiKTtcbiAgICAgICAgZm9yIChjb25zdCBjYW5kIG9mIHN0YXRzLmZpbHRlcihpdGVtID0+IGl0ZW0udHlwZSA9PT0gJ2xvY2FsLWNhbmRpZGF0ZScpKSB7XG4gICAgICAgICAgICBjb25zdCBhZGRyZXNzID0gY2FuZC5hZGRyZXNzIHx8IGNhbmQuaXA7IC8vIGZpcmVmb3ggdXNlcyAnYWRkcmVzcycsIGNocm9tZSB1c2VzICdpcCdcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhcbiAgICAgICAgICAgICAgICBgJHtjYW5kLmlkfSAtIHR5cGU6ICR7Y2FuZC5jYW5kaWRhdGVUeXBlfSwgYWRkcmVzczogJHthZGRyZXNzfSwgcG9ydDogJHtjYW5kLnBvcnR9LCBgICtcbiAgICAgICAgICAgICAgICBgcHJvdG9jb2w6ICR7Y2FuZC5wcm90b2NvbH0sIHJlbGF5IHByb3RvY29sOiAke2NhbmQucmVsYXlQcm90b2NvbH0sIG5ldHdvcmsgdHlwZTogJHtjYW5kLm5ldHdvcmtUeXBlfWAsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGxvZ2dlci5kZWJ1ZyhcIlJlbW90ZSBjYW5kaWRhdGVzOlwiKTtcbiAgICAgICAgZm9yIChjb25zdCBjYW5kIG9mIHN0YXRzLmZpbHRlcihpdGVtID0+IGl0ZW0udHlwZSA9PT0gJ3JlbW90ZS1jYW5kaWRhdGUnKSkge1xuICAgICAgICAgICAgY29uc3QgYWRkcmVzcyA9IGNhbmQuYWRkcmVzcyB8fCBjYW5kLmlwOyAvLyBmaXJlZm94IHVzZXMgJ2FkZHJlc3MnLCBjaHJvbWUgdXNlcyAnaXAnXG4gICAgICAgICAgICBsb2dnZXIuZGVidWcoXG4gICAgICAgICAgICAgICAgYCR7Y2FuZC5pZH0gLSB0eXBlOiAke2NhbmQuY2FuZGlkYXRlVHlwZX0sIGFkZHJlc3M6ICR7YWRkcmVzc30sIHBvcnQ6ICR7Y2FuZC5wb3J0fSwgYCArXG4gICAgICAgICAgICAgICAgYHByb3RvY29sOiAke2NhbmQucHJvdG9jb2x9YCxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgbG9nZ2VyLmRlYnVnKFwiQ2FuZGlkYXRlIHBhaXJzOlwiKTtcbiAgICAgICAgZm9yIChjb25zdCBwYWlyIG9mIHN0YXRzLmZpbHRlcihpdGVtID0+IGl0ZW0udHlwZSA9PT0gJ2NhbmRpZGF0ZS1wYWlyJykpIHtcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhcbiAgICAgICAgICAgICAgICBgJHtwYWlyLmxvY2FsQ2FuZGlkYXRlSWR9IC8gJHtwYWlyLnJlbW90ZUNhbmRpZGF0ZUlkfSAtIHN0YXRlOiAke3BhaXIuc3RhdGV9LCBgICtcbiAgICAgICAgICAgICAgICBgbm9taW5hdGVkOiAke3BhaXIubm9taW5hdGVkfSwgYCArXG4gICAgICAgICAgICAgICAgYHJlcXVlc3RzIHNlbnQgJHtwYWlyLnJlcXVlc3RzU2VudH0sIHJlcXVlc3RzIHJlY2VpdmVkICAke3BhaXIucmVxdWVzdHNSZWNlaXZlZH0sICBgICtcbiAgICAgICAgICAgICAgICBgcmVzcG9uc2VzIHJlY2VpdmVkOiAke3BhaXIucmVzcG9uc2VzUmVjZWl2ZWR9LCByZXNwb25zZXMgc2VudDogJHtwYWlyLnJlc3BvbnNlc1NlbnR9LCBgICtcbiAgICAgICAgICAgICAgICBgYnl0ZXMgcmVjZWl2ZWQ6ICR7cGFpci5ieXRlc1JlY2VpdmVkfSwgYnl0ZXMgc2VudDogJHtwYWlyLmJ5dGVzU2VudH0sIGAsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9nZ2VyLmRlYnVnKFwiT3V0Ym91bmQgUlRQOlwiKTtcbiAgICAgICAgZm9yIChjb25zdCBzIG9mIHN0YXRzLmZpbHRlcihpdGVtID0+IGl0ZW0udHlwZSA9PT0gJ291dGJvdW5kLXJ0cCcpKSB7XG4gICAgICAgICAgICBsb2dnZXIuZGVidWcocyk7XG4gICAgICAgIH1cblxuICAgICAgICBsb2dnZXIuZGVidWcoXCJJbmJvdW5kIFJUUDpcIik7XG4gICAgICAgIGZvciAoY29uc3QgcyBvZiBzdGF0cy5maWx0ZXIoaXRlbSA9PiBpdGVtLnR5cGUgPT09ICdpbmJvdW5kLXJ0cCcpKSB7XG4gICAgICAgICAgICBsb2dnZXIuZGVidWcocyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHNldENhbGxTdGF0ZShjYWxsOiBNYXRyaXhDYWxsLCBzdGF0dXM6IENhbGxTdGF0ZSk6IHZvaWQge1xuICAgICAgICBjb25zdCBtYXBwZWRSb29tSWQgPSBMZWdhY3lDYWxsSGFuZGxlci5pbnN0YW5jZS5yb29tSWRGb3JDYWxsKGNhbGwpO1xuXG4gICAgICAgIGxvZ2dlci5sb2coXG4gICAgICAgICAgICBgQ2FsbCBzdGF0ZSBpbiAke21hcHBlZFJvb21JZH0gY2hhbmdlZCB0byAke3N0YXR1c31gLFxuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IHRvYXN0S2V5ID0gZ2V0SW5jb21pbmdMZWdhY3lDYWxsVG9hc3RLZXkoY2FsbC5jYWxsSWQpO1xuICAgICAgICBpZiAoc3RhdHVzID09PSBDYWxsU3RhdGUuUmluZ2luZykge1xuICAgICAgICAgICAgVG9hc3RTdG9yZS5zaGFyZWRJbnN0YW5jZSgpLmFkZE9yUmVwbGFjZVRvYXN0KHtcbiAgICAgICAgICAgICAgICBrZXk6IHRvYXN0S2V5LFxuICAgICAgICAgICAgICAgIHByaW9yaXR5OiAxMDAsXG4gICAgICAgICAgICAgICAgY29tcG9uZW50OiBJbmNvbWluZ0xlZ2FjeUNhbGxUb2FzdCxcbiAgICAgICAgICAgICAgICBib2R5Q2xhc3NOYW1lOiBcIm14X0luY29taW5nTGVnYWN5Q2FsbFRvYXN0XCIsXG4gICAgICAgICAgICAgICAgcHJvcHM6IHsgY2FsbCB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBUb2FzdFN0b3JlLnNoYXJlZEluc3RhbmNlKCkuZGlzbWlzc1RvYXN0KHRvYXN0S2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZW1pdChMZWdhY3lDYWxsSGFuZGxlckV2ZW50LkNhbGxTdGF0ZSwgbWFwcGVkUm9vbUlkLCBzdGF0dXMpO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVtb3ZlQ2FsbEZvclJvb20ocm9vbUlkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgbG9nZ2VyLmxvZyhcIlJlbW92aW5nIGNhbGwgZm9yIHJvb20gXCIsIHJvb21JZCk7XG4gICAgICAgIHRoaXMuY2FsbHMuZGVsZXRlKHJvb21JZCk7XG4gICAgICAgIHRoaXMuZW1pdChMZWdhY3lDYWxsSGFuZGxlckV2ZW50LkNhbGxzQ2hhbmdlZCwgdGhpcy5jYWxscyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzaG93SUNFRmFsbGJhY2tQcm9tcHQoKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3QgY29kZSA9IHN1YiA9PiA8Y29kZT57IHN1YiB9PC9jb2RlPjtcbiAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKFF1ZXN0aW9uRGlhbG9nLCB7XG4gICAgICAgICAgICB0aXRsZTogX3QoXCJDYWxsIGZhaWxlZCBkdWUgdG8gbWlzY29uZmlndXJlZCBzZXJ2ZXJcIiksXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogPGRpdj5cbiAgICAgICAgICAgICAgICA8cD57IF90KFxuICAgICAgICAgICAgICAgICAgICBcIlBsZWFzZSBhc2sgdGhlIGFkbWluaXN0cmF0b3Igb2YgeW91ciBob21lc2VydmVyIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCIoPGNvZGU+JShob21lc2VydmVyRG9tYWluKXM8L2NvZGU+KSB0byBjb25maWd1cmUgYSBUVVJOIHNlcnZlciBpbiBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwib3JkZXIgZm9yIGNhbGxzIHRvIHdvcmsgcmVsaWFibHkuXCIsXG4gICAgICAgICAgICAgICAgICAgIHsgaG9tZXNlcnZlckRvbWFpbjogY2xpLmdldERvbWFpbigpIH0sIHsgY29kZSB9LFxuICAgICAgICAgICAgICAgICkgfTwvcD5cbiAgICAgICAgICAgICAgICA8cD57IF90KFxuICAgICAgICAgICAgICAgICAgICBcIkFsdGVybmF0aXZlbHksIHlvdSBjYW4gdHJ5IHRvIHVzZSB0aGUgcHVibGljIHNlcnZlciBhdCBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiPGNvZGU+dHVybi5tYXRyaXgub3JnPC9jb2RlPiwgYnV0IHRoaXMgd2lsbCBub3QgYmUgYXMgcmVsaWFibGUsIGFuZCBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiaXQgd2lsbCBzaGFyZSB5b3VyIElQIGFkZHJlc3Mgd2l0aCB0aGF0IHNlcnZlci4gWW91IGNhbiBhbHNvIG1hbmFnZSBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwidGhpcyBpbiBTZXR0aW5ncy5cIixcbiAgICAgICAgICAgICAgICAgICAgbnVsbCwgeyBjb2RlIH0sXG4gICAgICAgICAgICAgICAgKSB9PC9wPlxuICAgICAgICAgICAgPC9kaXY+LFxuICAgICAgICAgICAgYnV0dG9uOiBfdCgnVHJ5IHVzaW5nIHR1cm4ubWF0cml4Lm9yZycpLFxuICAgICAgICAgICAgY2FuY2VsQnV0dG9uOiBfdCgnT0snKSxcbiAgICAgICAgICAgIG9uRmluaXNoZWQ6IChhbGxvdykgPT4ge1xuICAgICAgICAgICAgICAgIFNldHRpbmdzU3RvcmUuc2V0VmFsdWUoXCJmYWxsYmFja0lDRVNlcnZlckFsbG93ZWRcIiwgbnVsbCwgU2V0dGluZ0xldmVsLkRFVklDRSwgYWxsb3cpO1xuICAgICAgICAgICAgICAgIGNsaS5zZXRGYWxsYmFja0lDRVNlcnZlckFsbG93ZWQoYWxsb3cpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSwgbnVsbCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzaG93TWVkaWFDYXB0dXJlRXJyb3IoY2FsbDogTWF0cml4Q2FsbCk6IHZvaWQge1xuICAgICAgICBsZXQgdGl0bGU7XG4gICAgICAgIGxldCBkZXNjcmlwdGlvbjtcblxuICAgICAgICBpZiAoY2FsbC50eXBlID09PSBDYWxsVHlwZS5Wb2ljZSkge1xuICAgICAgICAgICAgdGl0bGUgPSBfdChcIlVuYWJsZSB0byBhY2Nlc3MgbWljcm9waG9uZVwiKTtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uID0gPGRpdj5cbiAgICAgICAgICAgICAgICB7IF90KFxuICAgICAgICAgICAgICAgICAgICBcIkNhbGwgZmFpbGVkIGJlY2F1c2UgbWljcm9waG9uZSBjb3VsZCBub3QgYmUgYWNjZXNzZWQuIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJDaGVjayB0aGF0IGEgbWljcm9waG9uZSBpcyBwbHVnZ2VkIGluIGFuZCBzZXQgdXAgY29ycmVjdGx5LlwiLFxuICAgICAgICAgICAgICAgICkgfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9IGVsc2UgaWYgKGNhbGwudHlwZSA9PT0gQ2FsbFR5cGUuVmlkZW8pIHtcbiAgICAgICAgICAgIHRpdGxlID0gX3QoXCJVbmFibGUgdG8gYWNjZXNzIHdlYmNhbSAvIG1pY3JvcGhvbmVcIik7XG4gICAgICAgICAgICBkZXNjcmlwdGlvbiA9IDxkaXY+XG4gICAgICAgICAgICAgICAgeyBfdChcIkNhbGwgZmFpbGVkIGJlY2F1c2Ugd2ViY2FtIG9yIG1pY3JvcGhvbmUgY291bGQgbm90IGJlIGFjY2Vzc2VkLiBDaGVjayB0aGF0OlwiKSB9XG4gICAgICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgICAgICA8bGk+eyBfdChcIkEgbWljcm9waG9uZSBhbmQgd2ViY2FtIGFyZSBwbHVnZ2VkIGluIGFuZCBzZXQgdXAgY29ycmVjdGx5XCIpIH08L2xpPlxuICAgICAgICAgICAgICAgICAgICA8bGk+eyBfdChcIlBlcm1pc3Npb24gaXMgZ3JhbnRlZCB0byB1c2UgdGhlIHdlYmNhbVwiKSB9PC9saT5cbiAgICAgICAgICAgICAgICAgICAgPGxpPnsgX3QoXCJObyBvdGhlciBhcHBsaWNhdGlvbiBpcyB1c2luZyB0aGUgd2ViY2FtXCIpIH08L2xpPlxuICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgIHRpdGxlLCBkZXNjcmlwdGlvbixcbiAgICAgICAgfSwgbnVsbCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBwbGFjZU1hdHJpeENhbGwocm9vbUlkOiBzdHJpbmcsIHR5cGU6IENhbGxUeXBlLCB0cmFuc2ZlcmVlPzogTWF0cml4Q2FsbCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBtYXBwZWRSb29tSWQgPSAoYXdhaXQgVm9pcFVzZXJNYXBwZXIuc2hhcmVkSW5zdGFuY2UoKS5nZXRPckNyZWF0ZVZpcnR1YWxSb29tRm9yUm9vbShyb29tSWQpKSB8fCByb29tSWQ7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZyhcIk1hcHBlZCByZWFsIHJvb20gXCIgKyByb29tSWQgKyBcIiB0byByb29tIElEIFwiICsgbWFwcGVkUm9vbUlkKTtcblxuICAgICAgICAvLyBJZiB3ZSdyZSB1c2luZyBhIHZpcnR1YWwgcm9vbSBuZCB0aGVyZSBhcmUgYW55IGV2ZW50cyBwZW5kaW5nLCB0cnkgdG8gcmVzZW5kIHRoZW0sXG4gICAgICAgIC8vIG90aGVyd2lzZSB0aGUgY2FsbCB3aWxsIGZhaWwgYW5kIGJlY2F1c2UgaXRzIGEgdmlydHVhbCByb29tLCB0aGUgdXNlciB3b24ndCBiZSBhYmxlXG4gICAgICAgIC8vIHRvIHNlZSBpdCB0byBlaXRoZXIgcmV0cnkgb3IgY2xlYXIgdGhlIHBlbmRpbmcgZXZlbnRzLiBUaGVyZSB3aWxsIG9ubHkgYmUgY2FsbCBldmVudHNcbiAgICAgICAgLy8gaW4gdGhpcyBxdWV1ZSwgYW5kIHNpbmNlIHdlJ3JlIGFib3V0IHRvIHBsYWNlIGEgbmV3IGNhbGwsIHRoZXkgY2FuIG9ubHkgYmUgZXZlbnRzIGZyb21cbiAgICAgICAgLy8gcHJldmlvdXMgY2FsbHMgdGhhdCBhcmUgcHJvYmFibHkgc3RhbGUgYnkgbm93LCBzbyBqdXN0IGNhbmNlbCB0aGVtLlxuICAgICAgICBpZiAobWFwcGVkUm9vbUlkICE9PSByb29tSWQpIHtcbiAgICAgICAgICAgIGNvbnN0IG1hcHBlZFJvb20gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbShtYXBwZWRSb29tSWQpO1xuICAgICAgICAgICAgaWYgKG1hcHBlZFJvb20uZ2V0UGVuZGluZ0V2ZW50cygpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBSZXNlbmQuY2FuY2VsVW5zZW50RXZlbnRzKG1hcHBlZFJvb20pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGltZVVudGlsVHVybkNyZXNFeHBpcmUgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VHVyblNlcnZlcnNFeHBpcnkoKSAtIERhdGUubm93KCk7XG4gICAgICAgIGxvZ2dlci5sb2coXCJDdXJyZW50IHR1cm4gY3JlZHMgZXhwaXJlIGluIFwiICsgdGltZVVudGlsVHVybkNyZXNFeHBpcmUgKyBcIiBtc1wiKTtcbiAgICAgICAgY29uc3QgY2FsbCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5jcmVhdGVDYWxsKG1hcHBlZFJvb21JZCk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuYWRkQ2FsbEZvclJvb20ocm9vbUlkLCBjYWxsKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KCdBbHJlYWR5IGluIGNhbGwnKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXCJZb3UncmUgYWxyZWFkeSBpbiBhIGNhbGwgd2l0aCB0aGlzIHBlcnNvbi5cIiksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHJhbnNmZXJlZSkge1xuICAgICAgICAgICAgdGhpcy50cmFuc2ZlcmVlc1tjYWxsLmNhbGxJZF0gPSB0cmFuc2ZlcmVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRDYWxsTGlzdGVuZXJzKGNhbGwpO1xuXG4gICAgICAgIHRoaXMuc2V0QWN0aXZlQ2FsbFJvb21JZChyb29tSWQpO1xuXG4gICAgICAgIGlmICh0eXBlID09PSBDYWxsVHlwZS5Wb2ljZSkge1xuICAgICAgICAgICAgY2FsbC5wbGFjZVZvaWNlQ2FsbCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICd2aWRlbycpIHtcbiAgICAgICAgICAgIGNhbGwucGxhY2VWaWRlb0NhbGwoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIlVua25vd24gY29uZiBjYWxsIHR5cGU6IFwiICsgdHlwZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgcGxhY2VDYWxsKHJvb21JZDogc3RyaW5nLCB0eXBlPzogQ2FsbFR5cGUsIHRyYW5zZmVyZWU/OiBNYXRyaXhDYWxsKTogdm9pZCB7XG4gICAgICAgIC8vIFdlIG1pZ2h0IGJlIHVzaW5nIG1hbmFnZWQgaHlicmlkIHdpZGdldHNcbiAgICAgICAgaWYgKGlzTWFuYWdlZEh5YnJpZFdpZGdldEVuYWJsZWQoKSkge1xuICAgICAgICAgICAgYWRkTWFuYWdlZEh5YnJpZFdpZGdldChyb29tSWQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgdGhlIHJ1bnRpbWUgZW52IGRvZXNuJ3QgZG8gVm9JUCwgd2hpbmUuXG4gICAgICAgIGlmICghTWF0cml4Q2xpZW50UGVnLmdldCgpLnN1cHBvcnRzVm9pcCgpKSB7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0NhbGxzIGFyZSB1bnN1cHBvcnRlZCcpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdCgnWW91IGNhbm5vdCBwbGFjZSBjYWxscyBpbiB0aGlzIGJyb3dzZXIuJyksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0U3luY1N0YXRlKCkgPT09IFN5bmNTdGF0ZS5FcnJvcikge1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KCdDb25uZWN0aXZpdHkgdG8gdGhlIHNlcnZlciBoYXMgYmVlbiBsb3N0JyksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KCdZb3UgY2Fubm90IHBsYWNlIGNhbGxzIHdpdGhvdXQgYSBjb25uZWN0aW9uIHRvIHRoZSBzZXJ2ZXIuJyksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGRvbid0IGFsbG93ID4gMiBjYWxscyB0byBiZSBwbGFjZWQuXG4gICAgICAgIGlmICh0aGlzLmdldEFsbEFjdGl2ZUNhbGxzKCkubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KCdUb28gTWFueSBDYWxscycpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcIllvdSd2ZSByZWFjaGVkIHRoZSBtYXhpbXVtIG51bWJlciBvZiBzaW11bHRhbmVvdXMgY2FsbHMuXCIpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByb29tID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20ocm9vbUlkKTtcbiAgICAgICAgaWYgKCFyb29tKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoYFJvb20gJHtyb29tSWR9IGRvZXMgbm90IGV4aXN0LmApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gV2UgbGVhdmUgdGhlIGNoZWNrIGZvciB3aGV0aGVyIHRoZXJlJ3MgYWxyZWFkeSBhIGNhbGwgaW4gdGhpcyByb29tIHVudGlsIGxhdGVyLFxuICAgICAgICAvLyBvdGhlcndpc2UgaXQgY2FuIHJhY2UuXG5cbiAgICAgICAgY29uc3QgbWVtYmVycyA9IGdldEpvaW5lZE5vbkZ1bmN0aW9uYWxNZW1iZXJzKHJvb20pO1xuICAgICAgICBpZiAobWVtYmVycy5sZW5ndGggPD0gMSkge1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KCdZb3UgY2Fubm90IHBsYWNlIGEgY2FsbCB3aXRoIHlvdXJzZWxmLicpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAobWVtYmVycy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgIGxvZ2dlci5pbmZvKGBQbGFjZSAke3R5cGV9IGNhbGwgaW4gJHtyb29tSWR9YCk7XG5cbiAgICAgICAgICAgIHRoaXMucGxhY2VNYXRyaXhDYWxsKHJvb21JZCwgdHlwZSwgdHJhbnNmZXJlZSk7XG4gICAgICAgIH0gZWxzZSB7IC8vID4gMlxuICAgICAgICAgICAgdGhpcy5wbGFjZUppdHNpQ2FsbChyb29tSWQsIHR5cGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGhhbmd1cEFsbENhbGxzKCk6IHZvaWQge1xuICAgICAgICBmb3IgKGNvbnN0IGNhbGwgb2YgdGhpcy5jYWxscy52YWx1ZXMoKSkge1xuICAgICAgICAgICAgdGhpcy5zdG9wUmluZ2luZ0lmUG9zc2libGUoY2FsbC5jYWxsSWQpO1xuICAgICAgICAgICAgY2FsbC5oYW5ndXAoQ2FsbEVycm9yQ29kZS5Vc2VySGFuZ3VwLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgaGFuZ3VwT3JSZWplY3Qocm9vbUlkOiBzdHJpbmcsIHJlamVjdD86IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY2FsbCA9IHRoaXMuY2FsbHMuZ2V0KHJvb21JZCk7XG5cbiAgICAgICAgLy8gbm8gY2FsbCB0byBoYW5ndXBcbiAgICAgICAgaWYgKCFjYWxsKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5zdG9wUmluZ2luZ0lmUG9zc2libGUoY2FsbC5jYWxsSWQpO1xuXG4gICAgICAgIGlmIChyZWplY3QpIHtcbiAgICAgICAgICAgIGNhbGwucmVqZWN0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWxsLmhhbmd1cChDYWxsRXJyb3JDb2RlLlVzZXJIYW5ndXAsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBkb24ndCByZW1vdmUgdGhlIGNhbGwgeWV0OiBsZXQgdGhlIGhhbmd1cCBldmVudCBoYW5kbGVyIGRvIGl0IChvdGhlcndpc2UgaXQgd2lsbCB0aHJvd1xuICAgICAgICAvLyB0aGUgaGFuZ3VwIGV2ZW50IGF3YXkpXG4gICAgfVxuXG4gICAgcHVibGljIGFuc3dlckNhbGwocm9vbUlkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY2FsbCA9IHRoaXMuY2FsbHMuZ2V0KHJvb21JZCk7XG5cbiAgICAgICAgdGhpcy5zdG9wUmluZ2luZ0lmUG9zc2libGUoY2FsbC5jYWxsSWQpO1xuXG4gICAgICAgIC8vIG5vIGNhbGwgdG8gYW5zd2VyXG4gICAgICAgIGlmICghdGhpcy5jYWxscy5oYXMocm9vbUlkKSkgcmV0dXJuO1xuXG4gICAgICAgIGlmICh0aGlzLmdldEFsbEFjdGl2ZUNhbGxzKCkubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KCdUb28gTWFueSBDYWxscycpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcIllvdSd2ZSByZWFjaGVkIHRoZSBtYXhpbXVtIG51bWJlciBvZiBzaW11bHRhbmVvdXMgY2FsbHMuXCIpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsLmFuc3dlcigpO1xuICAgICAgICB0aGlzLnNldEFjdGl2ZUNhbGxSb29tSWQocm9vbUlkKTtcbiAgICAgICAgZGlzLmRpc3BhdGNoPFZpZXdSb29tUGF5bG9hZD4oe1xuICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1Jvb20sXG4gICAgICAgICAgICByb29tX2lkOiByb29tSWQsXG4gICAgICAgICAgICBtZXRyaWNzVHJpZ2dlcjogXCJXZWJBY2NlcHRDYWxsXCIsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RvcFJpbmdpbmdJZlBvc3NpYmxlKGNhbGxJZDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHRoaXMuc2lsZW5jZWRDYWxscy5kZWxldGUoY2FsbElkKTtcbiAgICAgICAgaWYgKHRoaXMuYXJlQW55Q2FsbHNVbnNpbGVuY2VkKCkpIHJldHVybjtcbiAgICAgICAgdGhpcy5wYXVzZShBdWRpb0lELlJpbmcpO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBkaWFsTnVtYmVyKG51bWJlcjogc3RyaW5nLCB0cmFuc2ZlcmVlPzogTWF0cml4Q2FsbCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgdGhpcy5wc3RuTG9va3VwKG51bWJlcik7XG4gICAgICAgIGlmICghcmVzdWx0cyB8fCByZXN1bHRzLmxlbmd0aCA9PT0gMCB8fCAhcmVzdWx0c1swXS51c2VyaWQpIHtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIlVuYWJsZSB0byBsb29rIHVwIHBob25lIG51bWJlclwiKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXCJUaGVyZSB3YXMgYW4gZXJyb3IgbG9va2luZyB1cCB0aGUgcGhvbmUgbnVtYmVyXCIpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdXNlcklkID0gcmVzdWx0c1swXS51c2VyaWQ7XG5cbiAgICAgICAgLy8gTm93IGNoZWNrIHRvIHNlZSBpZiB0aGlzIGlzIGEgdmlydHVhbCB1c2VyLCBpbiB3aGljaCBjYXNlIHdlIHNob3VsZCBmaW5kIHRoZVxuICAgICAgICAvLyBuYXRpdmUgdXNlclxuICAgICAgICBsZXQgbmF0aXZlVXNlcklkO1xuICAgICAgICBpZiAodGhpcy5nZXRTdXBwb3J0c1ZpcnR1YWxSb29tcygpKSB7XG4gICAgICAgICAgICBjb25zdCBuYXRpdmVMb29rdXBSZXN1bHRzID0gYXdhaXQgdGhpcy5zaXBOYXRpdmVMb29rdXAodXNlcklkKTtcbiAgICAgICAgICAgIGNvbnN0IGxvb2t1cFN1Y2Nlc3MgPSBuYXRpdmVMb29rdXBSZXN1bHRzLmxlbmd0aCA+IDAgJiYgbmF0aXZlTG9va3VwUmVzdWx0c1swXS5maWVsZHMubG9va3VwX3N1Y2Nlc3M7XG4gICAgICAgICAgICBuYXRpdmVVc2VySWQgPSBsb29rdXBTdWNjZXNzID8gbmF0aXZlTG9va3VwUmVzdWx0c1swXS51c2VyaWQgOiB1c2VySWQ7XG4gICAgICAgICAgICBsb2dnZXIubG9nKFwiTG9va2VkIHVwIFwiICsgbnVtYmVyICsgXCIgdG8gXCIgKyB1c2VySWQgKyBcIiBhbmQgbWFwcGVkIHRvIG5hdGl2ZSB1c2VyIFwiICsgbmF0aXZlVXNlcklkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5hdGl2ZVVzZXJJZCA9IHVzZXJJZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJvb21JZCA9IGF3YWl0IGVuc3VyZURNRXhpc3RzKE1hdHJpeENsaWVudFBlZy5nZXQoKSwgbmF0aXZlVXNlcklkKTtcblxuICAgICAgICBkaXMuZGlzcGF0Y2g8Vmlld1Jvb21QYXlsb2FkPih7XG4gICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5WaWV3Um9vbSxcbiAgICAgICAgICAgIHJvb21faWQ6IHJvb21JZCxcbiAgICAgICAgICAgIG1ldHJpY3NUcmlnZ2VyOiBcIldlYkRpYWxQYWRcIixcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYXdhaXQgdGhpcy5wbGFjZU1hdHJpeENhbGwocm9vbUlkLCBDYWxsVHlwZS5Wb2ljZSwgdHJhbnNmZXJlZSk7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIHN0YXJ0VHJhbnNmZXJUb1Bob25lTnVtYmVyKFxuICAgICAgICBjYWxsOiBNYXRyaXhDYWxsLCBkZXN0aW5hdGlvbjogc3RyaW5nLCBjb25zdWx0Rmlyc3Q6IGJvb2xlYW4sXG4gICAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGlmIChjb25zdWx0Rmlyc3QpIHtcbiAgICAgICAgICAgIC8vIGlmIHdlJ3JlIGNvbnN1bHRpbmcsIHdlIGp1c3Qgc3RhcnQgYnkgcGxhY2luZyBhIGNhbGwgdG8gdGhlIHRyYW5zZmVyXG4gICAgICAgICAgICAvLyB0YXJnZXQgKHBhc3NpbmcgdGhlIHRyYW5zZmVyZWUgc28gdGhlIGFjdHVhbCB0cmFuc2ZlciBjYW4gaGFwcGVuIGxhdGVyKVxuICAgICAgICAgICAgdGhpcy5kaWFsTnVtYmVyKGRlc3RpbmF0aW9uLCBjYWxsKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCB0aGlzLnBzdG5Mb29rdXAoZGVzdGluYXRpb24pO1xuICAgICAgICBpZiAoIXJlc3VsdHMgfHwgcmVzdWx0cy5sZW5ndGggPT09IDAgfHwgIXJlc3VsdHNbMF0udXNlcmlkKSB7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJVbmFibGUgdG8gdHJhbnNmZXIgY2FsbFwiKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXCJUaGVyZSB3YXMgYW4gZXJyb3IgbG9va2luZyB1cCB0aGUgcGhvbmUgbnVtYmVyXCIpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBhd2FpdCB0aGlzLnN0YXJ0VHJhbnNmZXJUb01hdHJpeElEKGNhbGwsIHJlc3VsdHNbMF0udXNlcmlkLCBjb25zdWx0Rmlyc3QpO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBzdGFydFRyYW5zZmVyVG9NYXRyaXhJRChcbiAgICAgICAgY2FsbDogTWF0cml4Q2FsbCwgZGVzdGluYXRpb246IHN0cmluZywgY29uc3VsdEZpcnN0OiBib29sZWFuLFxuICAgICk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBpZiAoY29uc3VsdEZpcnN0KSB7XG4gICAgICAgICAgICBjb25zdCBkbVJvb21JZCA9IGF3YWl0IGVuc3VyZURNRXhpc3RzKE1hdHJpeENsaWVudFBlZy5nZXQoKSwgZGVzdGluYXRpb24pO1xuXG4gICAgICAgICAgICB0aGlzLnBsYWNlQ2FsbChkbVJvb21JZCwgY2FsbC50eXBlLCBjYWxsKTtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaDxWaWV3Um9vbVBheWxvYWQ+KHtcbiAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5WaWV3Um9vbSxcbiAgICAgICAgICAgICAgICByb29tX2lkOiBkbVJvb21JZCxcbiAgICAgICAgICAgICAgICBzaG91bGRfcGVlazogZmFsc2UsXG4gICAgICAgICAgICAgICAgam9pbmluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgbWV0cmljc1RyaWdnZXI6IHVuZGVmaW5lZCwgLy8gb3RoZXJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCBjYWxsLnRyYW5zZmVyKGRlc3RpbmF0aW9uKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIubG9nKFwiRmFpbGVkIHRvIHRyYW5zZmVyIGNhbGxcIiwgZSk7XG4gICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnVHJhbnNmZXIgRmFpbGVkJyksXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdCgnRmFpbGVkIHRvIHRyYW5zZmVyIGNhbGwnKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzZXRBY3RpdmVDYWxsUm9vbUlkKGFjdGl2ZUNhbGxSb29tSWQ6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBsb2dnZXIuaW5mbyhcIlNldHRpbmcgY2FsbCBpbiByb29tIFwiICsgYWN0aXZlQ2FsbFJvb21JZCArIFwiIGFjdGl2ZVwiKTtcblxuICAgICAgICBmb3IgKGNvbnN0IFtyb29tSWQsIGNhbGxdIG9mIHRoaXMuY2FsbHMuZW50cmllcygpKSB7XG4gICAgICAgICAgICBpZiAoY2FsbC5zdGF0ZSA9PT0gQ2FsbFN0YXRlLkVuZGVkKSBjb250aW51ZTtcblxuICAgICAgICAgICAgaWYgKHJvb21JZCA9PT0gYWN0aXZlQ2FsbFJvb21JZCkge1xuICAgICAgICAgICAgICAgIGNhbGwuc2V0UmVtb3RlT25Ib2xkKGZhbHNlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmluZm8oXCJIb2xkaW5nIGNhbGwgaW4gcm9vbSBcIiArIHJvb21JZCArIFwiIGJlY2F1c2UgYW5vdGhlciBjYWxsIGlzIGJlaW5nIHNldCBhY3RpdmVcIik7XG4gICAgICAgICAgICAgICAgY2FsbC5zZXRSZW1vdGVPbkhvbGQodHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB0cnVlIGlmIHdlIGFyZSBjdXJyZW50bHkgaW4gYW55IGNhbGwgd2hlcmUgd2UgaGF2ZW4ndCBwdXQgdGhlIHJlbW90ZSBwYXJ0eSBvbiBob2xkXG4gICAgICovXG4gICAgcHVibGljIGhhc0FueVVuaGVsZENhbGwoKTogYm9vbGVhbiB7XG4gICAgICAgIGZvciAoY29uc3QgY2FsbCBvZiB0aGlzLmNhbGxzLnZhbHVlcygpKSB7XG4gICAgICAgICAgICBpZiAoY2FsbC5zdGF0ZSA9PT0gQ2FsbFN0YXRlLkVuZGVkKSBjb250aW51ZTtcbiAgICAgICAgICAgIGlmICghY2FsbC5pc1JlbW90ZU9uSG9sZCgpKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHBsYWNlSml0c2lDYWxsKHJvb21JZDogc3RyaW5nLCB0eXBlOiBDYWxsVHlwZSk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGxvZ2dlci5pbmZvKGBQbGFjZSBjb25mZXJlbmNlIGNhbGwgaW4gJHtyb29tSWR9YCk7XG5cbiAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiAnYXBwc0RyYXdlcicsIHNob3c6IHRydWUgfSk7XG5cbiAgICAgICAgLy8gUHJldmVudCBkb3VibGUgY2xpY2tpbmcgdGhlIGNhbGwgYnV0dG9uXG4gICAgICAgIGNvbnN0IHdpZGdldCA9IFdpZGdldFN0b3JlLmluc3RhbmNlLmdldEFwcHMocm9vbUlkKS5maW5kKGFwcCA9PiBXaWRnZXRUeXBlLkpJVFNJLm1hdGNoZXMoYXBwLnR5cGUpKTtcbiAgICAgICAgaWYgKHdpZGdldCkge1xuICAgICAgICAgICAgLy8gSWYgdGhlcmUgYWxyZWFkeSBpcyBhIEppdHNpIHdpZGdldCwgcGluIGl0XG4gICAgICAgICAgICBXaWRnZXRMYXlvdXRTdG9yZS5pbnN0YW5jZS5tb3ZlVG9Db250YWluZXIoY2xpZW50LmdldFJvb20ocm9vbUlkKSwgd2lkZ2V0LCBDb250YWluZXIuVG9wKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBXaWRnZXRVdGlscy5hZGRKaXRzaVdpZGdldChyb29tSWQsIHR5cGUsICdKaXRzaScsIGZhbHNlKTtcbiAgICAgICAgICAgIGxvZ2dlci5sb2coJ0ppdHNpIHdpZGdldCBhZGRlZCcpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoZS5lcnJjb2RlID09PSAnTV9GT1JCSURERU4nKSB7XG4gICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdCgnUGVybWlzc2lvbiBSZXF1aXJlZCcpLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXCJZb3UgZG8gbm90IGhhdmUgcGVybWlzc2lvbiB0byBzdGFydCBhIGNvbmZlcmVuY2UgY2FsbCBpbiB0aGlzIHJvb21cIiksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgaGFuZ3VwQ2FsbEFwcChyb29tSWQ6IHN0cmluZyk6IHZvaWQge1xuICAgICAgICBsb2dnZXIuaW5mbyhcIkxlYXZpbmcgY29uZmVyZW5jZSBjYWxsIGluIFwiICsgcm9vbUlkKTtcblxuICAgICAgICBjb25zdCByb29tSW5mbyA9IFdpZGdldFN0b3JlLmluc3RhbmNlLmdldFJvb20ocm9vbUlkKTtcbiAgICAgICAgaWYgKCFyb29tSW5mbykgcmV0dXJuOyAvLyBcInNob3VsZCBuZXZlciBoYXBwZW5cIiBjbGF1c2VzIGdvIGhlcmVcblxuICAgICAgICBjb25zdCBqaXRzaVdpZGdldHMgPSByb29tSW5mby53aWRnZXRzLmZpbHRlcih3ID0+IFdpZGdldFR5cGUuSklUU0kubWF0Y2hlcyh3LnR5cGUpKTtcbiAgICAgICAgaml0c2lXaWRnZXRzLmZvckVhY2godyA9PiB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdpbmcgPSBXaWRnZXRNZXNzYWdpbmdTdG9yZS5pbnN0YW5jZS5nZXRNZXNzYWdpbmdGb3JVaWQoV2lkZ2V0VXRpbHMuZ2V0V2lkZ2V0VWlkKHcpKTtcbiAgICAgICAgICAgIGlmICghbWVzc2FnaW5nKSByZXR1cm47IC8vIG1vcmUgXCJzaG91bGQgbmV2ZXIgaGFwcGVuXCIgd29yZHNcblxuICAgICAgICAgICAgbWVzc2FnaW5nLnRyYW5zcG9ydC5zZW5kKEVsZW1lbnRXaWRnZXRBY3Rpb25zLkhhbmd1cENhbGwsIHt9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLypcbiAgICAgKiBTaG93cyB0aGUgdHJhbnNmZXIgZGlhbG9nIGZvciBhIGNhbGwsIHNpZ25hbGxpbmcgdG8gdGhlIG90aGVyIGVuZCB0aGF0XG4gICAgICogYSB0cmFuc2ZlciBpcyBhYm91dCB0byBoYXBwZW5cbiAgICAgKi9cbiAgICBwdWJsaWMgc2hvd1RyYW5zZmVyRGlhbG9nKGNhbGw6IE1hdHJpeENhbGwpOiB2b2lkIHtcbiAgICAgICAgY2FsbC5zZXRSZW1vdGVPbkhvbGQodHJ1ZSk7XG4gICAgICAgIGRpcy5kaXNwYXRjaDxPcGVuSW52aXRlRGlhbG9nUGF5bG9hZD4oe1xuICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uT3Blbkludml0ZURpYWxvZyxcbiAgICAgICAgICAgIGtpbmQ6IEtJTkRfQ0FMTF9UUkFOU0ZFUixcbiAgICAgICAgICAgIGNhbGwsXG4gICAgICAgICAgICBhbmFseXRpY3NOYW1lOiBcIlRyYW5zZmVyIENhbGxcIixcbiAgICAgICAgICAgIGNsYXNzTmFtZTogXCJteF9JbnZpdGVEaWFsb2dfdHJhbnNmZXJXcmFwcGVyXCIsXG4gICAgICAgICAgICBvbkZpbmlzaGVkQ2FsbGJhY2s6IChyZXN1bHRzKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdHMubGVuZ3RoID09PSAwIHx8IHJlc3VsdHNbMF0gPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGwuc2V0UmVtb3RlT25Ib2xkKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFkZENhbGxGb3JSb29tKHJvb21JZDogc3RyaW5nLCBjYWxsOiBNYXRyaXhDYWxsLCBjaGFuZ2VkUm9vbXMgPSBmYWxzZSk6IHZvaWQge1xuICAgICAgICBpZiAodGhpcy5jYWxscy5oYXMocm9vbUlkKSkge1xuICAgICAgICAgICAgbG9nZ2VyLmxvZyhgQ291bGRuJ3QgYWRkIGNhbGwgdG8gcm9vbSAke3Jvb21JZH06IGFscmVhZHkgaGF2ZSBhIGNhbGwgZm9yIHRoaXMgcm9vbWApO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQWxyZWFkeSBoYXZlIGEgY2FsbCBmb3Igcm9vbSBcIiArIHJvb21JZCk7XG4gICAgICAgIH1cblxuICAgICAgICBsb2dnZXIubG9nKFwic2V0dGluZyBjYWxsIGZvciByb29tIFwiICsgcm9vbUlkKTtcbiAgICAgICAgdGhpcy5jYWxscy5zZXQocm9vbUlkLCBjYWxsKTtcblxuICAgICAgICAvLyBTaG91bGQgd2UgYWx3YXlzIGVtaXQgQ2FsbHNDaGFuZ2VkIHRvbz9cbiAgICAgICAgaWYgKGNoYW5nZWRSb29tcykge1xuICAgICAgICAgICAgdGhpcy5lbWl0KExlZ2FjeUNhbGxIYW5kbGVyRXZlbnQuQ2FsbENoYW5nZVJvb20sIGNhbGwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lbWl0KExlZ2FjeUNhbGxIYW5kbGVyRXZlbnQuQ2FsbHNDaGFuZ2VkLCB0aGlzLmNhbGxzKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFtQkE7O0FBQ0E7O0FBU0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBRUE7O0FBQ0E7Ozs7OztBQS9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFnRE8sTUFBTUEsYUFBYSxHQUFHLGlCQUF0Qjs7QUFDQSxNQUFNQyxzQkFBc0IsR0FBRyx5QkFBL0I7O0FBQ0EsTUFBTUMsbUJBQW1CLEdBQUcsK0JBQTVCOztBQUNBLE1BQU1DLG9CQUFvQixHQUFHLGdDQUE3Qjs7QUFFUCxNQUFNQyx3QkFBd0IsR0FBRyxDQUFqQztJQUVLQyxPOztXQUFBQSxPO0VBQUFBLE87RUFBQUEsTztFQUFBQSxPO0VBQUFBLE87R0FBQUEsTyxLQUFBQSxPOztJQThCT0Msc0I7QUFPWjtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O1dBWFlBLHNCO0VBQUFBLHNCO0VBQUFBLHNC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