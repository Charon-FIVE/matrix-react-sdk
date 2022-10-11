"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MatrixClientPeg = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _matrix = require("matrix-js-sdk/src/matrix");

var _memory = require("matrix-js-sdk/src/store/memory");

var utils = _interopRequireWildcard(require("matrix-js-sdk/src/utils"));

var _eventTimeline = require("matrix-js-sdk/src/models/event-timeline");

var _eventTimelineSet = require("matrix-js-sdk/src/models/event-timeline-set");

var _crypto = require("matrix-js-sdk/src/crypto");

var _QRCode = require("matrix-js-sdk/src/crypto/verification/QRCode");

var _logger = require("matrix-js-sdk/src/logger");

var _createMatrixClient = _interopRequireDefault(require("./utils/createMatrixClient"));

var _SettingsStore = _interopRequireDefault(require("./settings/SettingsStore"));

var _MatrixActionCreators = _interopRequireDefault(require("./actions/MatrixActionCreators"));

var _Modal = _interopRequireDefault(require("./Modal"));

var _MatrixClientBackedSettingsHandler = _interopRequireDefault(require("./settings/handlers/MatrixClientBackedSettingsHandler"));

var StorageManager = _interopRequireWildcard(require("./utils/StorageManager"));

var _IdentityAuthClient = _interopRequireDefault(require("./IdentityAuthClient"));

var _SecurityManager = require("./SecurityManager");

var _Security = _interopRequireDefault(require("./customisations/Security"));

var _CryptoStoreTooNewDialog = _interopRequireDefault(require("./components/views/dialogs/CryptoStoreTooNewDialog"));

var _languageHandler = require("./languageHandler");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

/**
 * Wrapper object for handling the js-sdk Matrix Client object in the react-sdk
 * Handles the creation/initialisation of client objects.
 * This module provides a singleton instance of this class so the 'current'
 * Matrix Client object is available easily.
 */
class MatrixClientPegClass {
  constructor() {
    (0, _defineProperty2.default)(this, "opts", {
      initialSyncLimit: 20
    });
    (0, _defineProperty2.default)(this, "matrixClient", null);
    (0, _defineProperty2.default)(this, "justRegisteredUserId", null);
    (0, _defineProperty2.default)(this, "currentClientCreds", void 0);
  }

  get() {
    return this.matrixClient;
  }

  unset() {
    this.matrixClient = null;

    _MatrixActionCreators.default.stop();
  }

  setJustRegisteredUserId(uid) {
    this.justRegisteredUserId = uid;

    if (uid) {
      const registrationTime = Date.now().toString();
      window.localStorage.setItem("mx_registration_time", registrationTime);
    }
  }

  currentUserIsJustRegistered() {
    return this.matrixClient && this.matrixClient.credentials.userId === this.justRegisteredUserId;
  }

  userRegisteredWithinLastHours(hours) {
    if (hours <= 0) {
      return false;
    }

    try {
      const registrationTime = parseInt(window.localStorage.getItem("mx_registration_time"), 10);
      const diff = Date.now() - registrationTime;
      return diff / 36e5 <= hours;
    } catch (e) {
      return false;
    }
  }

  userRegisteredAfter(timestamp) {
    try {
      const registrationTime = parseInt(window.localStorage.getItem("mx_registration_time"), 10);
      return timestamp.getTime() <= registrationTime;
    } catch (e) {
      return false;
    }
  }

  replaceUsingCreds(creds) {
    this.currentClientCreds = creds;
    this.createClient(creds);
  }

  async assign() {
    for (const dbType of ['indexeddb', 'memory']) {
      try {
        const promise = this.matrixClient.store.startup();

        _logger.logger.log("MatrixClientPeg: waiting for MatrixClient store to initialise");

        await promise;
        break;
      } catch (err) {
        if (dbType === 'indexeddb') {
          _logger.logger.error('Error starting matrixclient store - falling back to memory store', err);

          this.matrixClient.store = new _memory.MemoryStore({
            localStorage: localStorage
          });
        } else {
          _logger.logger.error('Failed to start memory store!', err);

          throw err;
        }
      }
    } // try to initialise e2e on the new client


    try {
      // check that we have a version of the js-sdk which includes initCrypto
      if (!_SettingsStore.default.getValue("lowBandwidth") && this.matrixClient.initCrypto) {
        await this.matrixClient.initCrypto();
        this.matrixClient.setCryptoTrustCrossSignedDevices(!_SettingsStore.default.getValue('e2ee.manuallyVerifyAllSessions'));
        await (0, _SecurityManager.tryToUnlockSecretStorageWithDehydrationKey)(this.matrixClient);
        StorageManager.setCryptoInitialised(true);
      }
    } catch (e) {
      if (e && e.name === 'InvalidCryptoStoreError') {
        // The js-sdk found a crypto DB too new for it to use
        _Modal.default.createDialog(_CryptoStoreTooNewDialog.default);
      } // this can happen for a number of reasons, the most likely being
      // that the olm library was missing. It's not fatal.


      _logger.logger.warn("Unable to initialise e2e", e);
    }

    const opts = utils.deepCopy(this.opts); // the react sdk doesn't work without this, so don't allow

    opts.pendingEventOrdering = _matrix.PendingEventOrdering.Detached;
    opts.lazyLoadMembers = true;
    opts.clientWellKnownPollPeriod = 2 * 60 * 60; // 2 hours

    opts.experimentalThreadSupport = _SettingsStore.default.getValue("feature_thread"); // Connect the matrix client to the dispatcher and setting handlers

    _MatrixActionCreators.default.start(this.matrixClient);

    _MatrixClientBackedSettingsHandler.default.matrixClient = this.matrixClient;
    return opts;
  }

  async start() {
    const opts = await this.assign();

    _logger.logger.log(`MatrixClientPeg: really starting MatrixClient`);

    await this.get().startClient(opts);

    _logger.logger.log(`MatrixClientPeg: MatrixClient started`);
  }

  getCredentials() {
    let copiedCredentials = this.currentClientCreds;

    if (this.currentClientCreds?.userId !== this.matrixClient?.credentials?.userId) {
      // cached credentials belong to a different user - don't use them
      copiedCredentials = null;
    }

    return _objectSpread(_objectSpread({}, copiedCredentials ?? {}), {}, {
      homeserverUrl: this.matrixClient.baseUrl,
      identityServerUrl: this.matrixClient.idBaseUrl,
      userId: this.matrixClient.credentials.userId,
      deviceId: this.matrixClient.getDeviceId(),
      accessToken: this.matrixClient.getAccessToken(),
      guest: this.matrixClient.isGuest()
    });
  }

  getHomeserverName() {
    const matches = /^@[^:]+:(.+)$/.exec(this.matrixClient.credentials.userId);

    if (matches === null || matches.length < 1) {
      throw new Error("Failed to derive homeserver name from user ID!");
    }

    return matches[1];
  }

  namesToRoomName(names, count) {
    const countWithoutMe = count - 1;

    if (!names.length) {
      return (0, _languageHandler._t)("Empty room");
    }

    if (names.length === 1 && countWithoutMe <= 1) {
      return names[0];
    }
  }

  memberNamesToRoomName(names, count) {
    const name = this.namesToRoomName(names, count);
    if (name) return name;

    if (names.length === 2 && count === 2) {
      return (0, _languageHandler._t)("%(user1)s and %(user2)s", {
        user1: names[0],
        user2: names[1]
      });
    }

    return (0, _languageHandler._t)("%(user)s and %(count)s others", {
      user: names[0],
      count: count - 1
    });
  }

  inviteeNamesToRoomName(names, count) {
    const name = this.namesToRoomName(names, count);
    if (name) return name;

    if (names.length === 2 && count === 2) {
      return (0, _languageHandler._t)("Inviting %(user1)s and %(user2)s", {
        user1: names[0],
        user2: names[1]
      });
    }

    return (0, _languageHandler._t)("Inviting %(user)s and %(count)s others", {
      user: names[0],
      count: count - 1
    });
  }

  createClient(creds) {
    const opts = {
      baseUrl: creds.homeserverUrl,
      idBaseUrl: creds.identityServerUrl,
      accessToken: creds.accessToken,
      userId: creds.userId,
      deviceId: creds.deviceId,
      pickleKey: creds.pickleKey,
      timelineSupport: true,
      forceTURN: !_SettingsStore.default.getValue('webRtcAllowPeerToPeer'),
      fallbackICEServerAllowed: !!_SettingsStore.default.getValue('fallbackICEServerAllowed'),
      // Gather up to 20 ICE candidates when a call arrives: this should be more than we'd
      // ever normally need, so effectively this should make all the gathering happen when
      // the call arrives.
      iceCandidatePoolSize: 20,
      verificationMethods: [_crypto.verificationMethods.SAS, _QRCode.SHOW_QR_CODE_METHOD, _crypto.verificationMethods.RECIPROCATE_QR_CODE],
      identityServer: new _IdentityAuthClient.default(),
      // These are always installed regardless of the labs flag so that cross-signing features
      // can toggle on without reloading and also be accessed immediately after login.
      cryptoCallbacks: _objectSpread({}, _SecurityManager.crossSigningCallbacks),
      roomNameGenerator: (_, state) => {
        switch (state.type) {
          case _matrix.RoomNameType.Generated:
            switch (state.subtype) {
              case "Inviting":
                return this.inviteeNamesToRoomName(state.names, state.count);

              default:
                return this.memberNamesToRoomName(state.names, state.count);
            }

          case _matrix.RoomNameType.EmptyRoom:
            if (state.oldName) {
              return (0, _languageHandler._t)("Empty room (was %(oldName)s)", {
                oldName: state.oldName
              });
            } else {
              return (0, _languageHandler._t)("Empty room");
            }

          default:
            return null;
        }
      }
    };

    if (_Security.default.getDehydrationKey) {
      opts.cryptoCallbacks.getDehydrationKey = _Security.default.getDehydrationKey;
    }

    this.matrixClient = (0, _createMatrixClient.default)(opts); // we're going to add eventlisteners for each matrix event tile, so the
    // potential number of event listeners is quite high.

    this.matrixClient.setMaxListeners(500);
    this.matrixClient.setGuest(Boolean(creds.guest));
    const notifTimelineSet = new _eventTimelineSet.EventTimelineSet(undefined, {
      timelineSupport: true,
      pendingEvents: false
    }); // XXX: what is our initial pagination token?! it somehow needs to be synchronised with /sync.

    notifTimelineSet.getLiveTimeline().setPaginationToken("", _eventTimeline.EventTimeline.BACKWARDS);
    this.matrixClient.setNotifTimelineSet(notifTimelineSet);
  }

}
/**
 * Note: You should be using a React context with access to a client rather than
 * using this, as in a multi-account world this will not exist!
 */


const MatrixClientPeg = new MatrixClientPegClass();
exports.MatrixClientPeg = MatrixClientPeg;

if (!window.mxMatrixClientPeg) {
  window.mxMatrixClientPeg = MatrixClientPeg;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYXRyaXhDbGllbnRQZWdDbGFzcyIsImluaXRpYWxTeW5jTGltaXQiLCJnZXQiLCJtYXRyaXhDbGllbnQiLCJ1bnNldCIsIk1hdHJpeEFjdGlvbkNyZWF0b3JzIiwic3RvcCIsInNldEp1c3RSZWdpc3RlcmVkVXNlcklkIiwidWlkIiwianVzdFJlZ2lzdGVyZWRVc2VySWQiLCJyZWdpc3RyYXRpb25UaW1lIiwiRGF0ZSIsIm5vdyIsInRvU3RyaW5nIiwid2luZG93IiwibG9jYWxTdG9yYWdlIiwic2V0SXRlbSIsImN1cnJlbnRVc2VySXNKdXN0UmVnaXN0ZXJlZCIsImNyZWRlbnRpYWxzIiwidXNlcklkIiwidXNlclJlZ2lzdGVyZWRXaXRoaW5MYXN0SG91cnMiLCJob3VycyIsInBhcnNlSW50IiwiZ2V0SXRlbSIsImRpZmYiLCJlIiwidXNlclJlZ2lzdGVyZWRBZnRlciIsInRpbWVzdGFtcCIsImdldFRpbWUiLCJyZXBsYWNlVXNpbmdDcmVkcyIsImNyZWRzIiwiY3VycmVudENsaWVudENyZWRzIiwiY3JlYXRlQ2xpZW50IiwiYXNzaWduIiwiZGJUeXBlIiwicHJvbWlzZSIsInN0b3JlIiwic3RhcnR1cCIsImxvZ2dlciIsImxvZyIsImVyciIsImVycm9yIiwiTWVtb3J5U3RvcmUiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJpbml0Q3J5cHRvIiwic2V0Q3J5cHRvVHJ1c3RDcm9zc1NpZ25lZERldmljZXMiLCJ0cnlUb1VubG9ja1NlY3JldFN0b3JhZ2VXaXRoRGVoeWRyYXRpb25LZXkiLCJTdG9yYWdlTWFuYWdlciIsInNldENyeXB0b0luaXRpYWxpc2VkIiwibmFtZSIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwiQ3J5cHRvU3RvcmVUb29OZXdEaWFsb2ciLCJ3YXJuIiwib3B0cyIsInV0aWxzIiwiZGVlcENvcHkiLCJwZW5kaW5nRXZlbnRPcmRlcmluZyIsIlBlbmRpbmdFdmVudE9yZGVyaW5nIiwiRGV0YWNoZWQiLCJsYXp5TG9hZE1lbWJlcnMiLCJjbGllbnRXZWxsS25vd25Qb2xsUGVyaW9kIiwiZXhwZXJpbWVudGFsVGhyZWFkU3VwcG9ydCIsInN0YXJ0IiwiTWF0cml4Q2xpZW50QmFja2VkU2V0dGluZ3NIYW5kbGVyIiwic3RhcnRDbGllbnQiLCJnZXRDcmVkZW50aWFscyIsImNvcGllZENyZWRlbnRpYWxzIiwiaG9tZXNlcnZlclVybCIsImJhc2VVcmwiLCJpZGVudGl0eVNlcnZlclVybCIsImlkQmFzZVVybCIsImRldmljZUlkIiwiZ2V0RGV2aWNlSWQiLCJhY2Nlc3NUb2tlbiIsImdldEFjY2Vzc1Rva2VuIiwiZ3Vlc3QiLCJpc0d1ZXN0IiwiZ2V0SG9tZXNlcnZlck5hbWUiLCJtYXRjaGVzIiwiZXhlYyIsImxlbmd0aCIsIkVycm9yIiwibmFtZXNUb1Jvb21OYW1lIiwibmFtZXMiLCJjb3VudCIsImNvdW50V2l0aG91dE1lIiwiX3QiLCJtZW1iZXJOYW1lc1RvUm9vbU5hbWUiLCJ1c2VyMSIsInVzZXIyIiwidXNlciIsImludml0ZWVOYW1lc1RvUm9vbU5hbWUiLCJwaWNrbGVLZXkiLCJ0aW1lbGluZVN1cHBvcnQiLCJmb3JjZVRVUk4iLCJmYWxsYmFja0lDRVNlcnZlckFsbG93ZWQiLCJpY2VDYW5kaWRhdGVQb29sU2l6ZSIsInZlcmlmaWNhdGlvbk1ldGhvZHMiLCJTQVMiLCJTSE9XX1FSX0NPREVfTUVUSE9EIiwiUkVDSVBST0NBVEVfUVJfQ09ERSIsImlkZW50aXR5U2VydmVyIiwiSWRlbnRpdHlBdXRoQ2xpZW50IiwiY3J5cHRvQ2FsbGJhY2tzIiwiY3Jvc3NTaWduaW5nQ2FsbGJhY2tzIiwicm9vbU5hbWVHZW5lcmF0b3IiLCJfIiwic3RhdGUiLCJ0eXBlIiwiUm9vbU5hbWVUeXBlIiwiR2VuZXJhdGVkIiwic3VidHlwZSIsIkVtcHR5Um9vbSIsIm9sZE5hbWUiLCJTZWN1cml0eUN1c3RvbWlzYXRpb25zIiwiZ2V0RGVoeWRyYXRpb25LZXkiLCJjcmVhdGVNYXRyaXhDbGllbnQiLCJzZXRNYXhMaXN0ZW5lcnMiLCJzZXRHdWVzdCIsIkJvb2xlYW4iLCJub3RpZlRpbWVsaW5lU2V0IiwiRXZlbnRUaW1lbGluZVNldCIsInVuZGVmaW5lZCIsInBlbmRpbmdFdmVudHMiLCJnZXRMaXZlVGltZWxpbmUiLCJzZXRQYWdpbmF0aW9uVG9rZW4iLCJFdmVudFRpbWVsaW5lIiwiQkFDS1dBUkRTIiwic2V0Tm90aWZUaW1lbGluZVNldCIsIk1hdHJpeENsaWVudFBlZyIsIm14TWF0cml4Q2xpZW50UGVnIl0sInNvdXJjZXMiOlsiLi4vc3JjL01hdHJpeENsaWVudFBlZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE3IFZlY3RvciBDcmVhdGlvbnMgTHRkLlxuQ29weXJpZ2h0IDIwMTcsIDIwMTgsIDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5LCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgSUNyZWF0ZUNsaWVudE9wdHMsIFBlbmRpbmdFdmVudE9yZGVyaW5nLCBSb29tTmFtZVN0YXRlLCBSb29tTmFtZVR5cGUgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tYXRyaXgnO1xuaW1wb3J0IHsgSVN0YXJ0Q2xpZW50T3B0cywgTWF0cml4Q2xpZW50IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvY2xpZW50JztcbmltcG9ydCB7IE1lbW9yeVN0b3JlIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvc3RvcmUvbWVtb3J5JztcbmltcG9ydCAqIGFzIHV0aWxzIGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL3V0aWxzJztcbmltcG9ydCB7IEV2ZW50VGltZWxpbmUgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnQtdGltZWxpbmUnO1xuaW1wb3J0IHsgRXZlbnRUaW1lbGluZVNldCB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudC10aW1lbGluZS1zZXQnO1xuaW1wb3J0IHsgdmVyaWZpY2F0aW9uTWV0aG9kcyB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL2NyeXB0byc7XG5pbXBvcnQgeyBTSE9XX1FSX0NPREVfTUVUSE9EIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NyeXB0by92ZXJpZmljYXRpb24vUVJDb2RlXCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5cbmltcG9ydCBjcmVhdGVNYXRyaXhDbGllbnQgZnJvbSAnLi91dGlscy9jcmVhdGVNYXRyaXhDbGllbnQnO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSAnLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlJztcbmltcG9ydCBNYXRyaXhBY3Rpb25DcmVhdG9ycyBmcm9tICcuL2FjdGlvbnMvTWF0cml4QWN0aW9uQ3JlYXRvcnMnO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4vTW9kYWwnO1xuaW1wb3J0IE1hdHJpeENsaWVudEJhY2tlZFNldHRpbmdzSGFuZGxlciBmcm9tIFwiLi9zZXR0aW5ncy9oYW5kbGVycy9NYXRyaXhDbGllbnRCYWNrZWRTZXR0aW5nc0hhbmRsZXJcIjtcbmltcG9ydCAqIGFzIFN0b3JhZ2VNYW5hZ2VyIGZyb20gJy4vdXRpbHMvU3RvcmFnZU1hbmFnZXInO1xuaW1wb3J0IElkZW50aXR5QXV0aENsaWVudCBmcm9tICcuL0lkZW50aXR5QXV0aENsaWVudCc7XG5pbXBvcnQgeyBjcm9zc1NpZ25pbmdDYWxsYmFja3MsIHRyeVRvVW5sb2NrU2VjcmV0U3RvcmFnZVdpdGhEZWh5ZHJhdGlvbktleSB9IGZyb20gJy4vU2VjdXJpdHlNYW5hZ2VyJztcbmltcG9ydCBTZWN1cml0eUN1c3RvbWlzYXRpb25zIGZyb20gXCIuL2N1c3RvbWlzYXRpb25zL1NlY3VyaXR5XCI7XG5pbXBvcnQgQ3J5cHRvU3RvcmVUb29OZXdEaWFsb2cgZnJvbSBcIi4vY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL0NyeXB0b1N0b3JlVG9vTmV3RGlhbG9nXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuL2xhbmd1YWdlSGFuZGxlclwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIElNYXRyaXhDbGllbnRDcmVkcyB7XG4gICAgaG9tZXNlcnZlclVybDogc3RyaW5nO1xuICAgIGlkZW50aXR5U2VydmVyVXJsPzogc3RyaW5nO1xuICAgIHVzZXJJZDogc3RyaW5nO1xuICAgIGRldmljZUlkPzogc3RyaW5nO1xuICAgIGFjY2Vzc1Rva2VuOiBzdHJpbmc7XG4gICAgZ3Vlc3Q/OiBib29sZWFuO1xuICAgIHBpY2tsZUtleT86IHN0cmluZztcbiAgICBmcmVzaExvZ2luPzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBIb2xkcyB0aGUgY3VycmVudCBpbnN0YW5jZSBvZiB0aGUgYE1hdHJpeENsaWVudGAgdG8gdXNlIGFjcm9zcyB0aGUgY29kZWJhc2UuXG4gKiBMb29raW5nIGZvciBhbiBgTWF0cml4Q2xpZW50YD8gSnVzdCBsb29rIGZvciB0aGUgYE1hdHJpeENsaWVudFBlZ2Agb24gdGhlIHBlZ1xuICogYm9hcmQuIFwiUGVnXCIgaXMgdGhlIGxpdGVyYWwgbWVhbmluZyBvZiBzb21ldGhpbmcgeW91IGhhbmcgc29tZXRoaW5nIG9uLiBTb1xuICogeW91J2xsIGZpbmQgYSBgTWF0cml4Q2xpZW50YCBoYW5naW5nIG9uIHRoZSBgTWF0cml4Q2xpZW50UGVnYC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJTWF0cml4Q2xpZW50UGVnIHtcbiAgICBvcHRzOiBJU3RhcnRDbGllbnRPcHRzO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBzZXJ2ZXIgbmFtZSBvZiB0aGUgdXNlcidzIGhvbWVzZXJ2ZXJcbiAgICAgKiBUaHJvd3MgYW4gZXJyb3IgaWYgdW5hYmxlIHRvIGRlZHVjZSB0aGUgaG9tZXNlcnZlciBuYW1lXG4gICAgICogKGVnLiBpZiB0aGUgdXNlciBpcyBub3QgbG9nZ2VkIGluKVxuICAgICAqXG4gICAgICogQHJldHVybnMge3N0cmluZ30gVGhlIGhvbWVzZXJ2ZXIgbmFtZSwgaWYgcHJlc2VudC5cbiAgICAgKi9cbiAgICBnZXRIb21lc2VydmVyTmFtZSgpOiBzdHJpbmc7XG5cbiAgICBnZXQoKTogTWF0cml4Q2xpZW50O1xuICAgIHVuc2V0KCk6IHZvaWQ7XG4gICAgYXNzaWduKCk6IFByb21pc2U8YW55PjtcbiAgICBzdGFydCgpOiBQcm9taXNlPGFueT47XG5cbiAgICBnZXRDcmVkZW50aWFscygpOiBJTWF0cml4Q2xpZW50Q3JlZHM7XG5cbiAgICAvKipcbiAgICAgKiBJZiB3ZSd2ZSByZWdpc3RlcmVkIGEgdXNlciBJRCB3ZSBzZXQgdGhpcyB0byB0aGUgSUQgb2YgdGhlXG4gICAgICogdXNlciB3ZSd2ZSBqdXN0IHJlZ2lzdGVyZWQuIElmIHRoZXkgdGhlbiBnbyAmIGxvZyBpbiwgd2VcbiAgICAgKiBjYW4gc2VuZCB0aGVtIHRvIHRoZSB3ZWxjb21lIHVzZXIgKG9idmlvdXNseSB0aGlzIGRvZXNuJ3RcbiAgICAgKiBndWFyYW50ZWUgdGhleSdsbCBnZXQgYSBjaGF0IHdpdGggdGhlIHdlbGNvbWUgdXNlcikuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdWlkIFRoZSB1c2VyIElEIG9mIHRoZSB1c2VyIHdlJ3ZlIGp1c3QgcmVnaXN0ZXJlZFxuICAgICAqL1xuICAgIHNldEp1c3RSZWdpc3RlcmVkVXNlcklkKHVpZDogc3RyaW5nIHwgbnVsbCk6IHZvaWQ7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGN1cnJlbnQgdXNlciBoYXMganVzdCBiZWVuIHJlZ2lzdGVyZWQgYnkgdGhpc1xuICAgICAqIGNsaWVudCBhcyBkZXRlcm1pbmVkIGJ5IHNldEp1c3RSZWdpc3RlcmVkVXNlcklkKClcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtib29sfSBUcnVlIGlmIHVzZXIgaGFzIGp1c3QgYmVlbiByZWdpc3RlcmVkXG4gICAgICovXG4gICAgY3VycmVudFVzZXJJc0p1c3RSZWdpc3RlcmVkKCk6IGJvb2xlYW47XG5cbiAgICAvKipcbiAgICAgKiBJZiB0aGUgY3VycmVudCB1c2VyIGhhcyBiZWVuIHJlZ2lzdGVyZWQgYnkgdGhpcyBkZXZpY2UgdGhlbiB0aGlzXG4gICAgICogcmV0dXJucyBhIGJvb2xlYW4gb2Ygd2hldGhlciBpdCB3YXMgd2l0aGluIHRoZSBsYXN0IE4gaG91cnMgZ2l2ZW4uXG4gICAgICovXG4gICAgdXNlclJlZ2lzdGVyZWRXaXRoaW5MYXN0SG91cnMoaG91cnM6IG51bWJlcik6IGJvb2xlYW47XG5cbiAgICAvKipcbiAgICAgKiBJZiB0aGUgY3VycmVudCB1c2VyIGhhcyBiZWVuIHJlZ2lzdGVyZWQgYnkgdGhpcyBkZXZpY2UgdGhlbiB0aGlzXG4gICAgICogcmV0dXJucyBhIGJvb2xlYW4gb2Ygd2hldGhlciBpdCB3YXMgYWZ0ZXIgYSBnaXZlbiB0aW1lc3RhbXAuXG4gICAgICovXG4gICAgdXNlclJlZ2lzdGVyZWRBZnRlcihkYXRlOiBEYXRlKTogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICAqIFJlcGxhY2UgdGhpcyBNYXRyaXhDbGllbnRQZWcncyBjbGllbnQgd2l0aCBhIGNsaWVudCBpbnN0YW5jZSB0aGF0IGhhc1xuICAgICAqIGhvbWVzZXJ2ZXIgLyBpZGVudGl0eSBzZXJ2ZXIgVVJMcyBhbmQgYWN0aXZlIGNyZWRlbnRpYWxzXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0lNYXRyaXhDbGllbnRDcmVkc30gY3JlZHMgVGhlIG5ldyBjcmVkZW50aWFscyB0byB1c2UuXG4gICAgICovXG4gICAgcmVwbGFjZVVzaW5nQ3JlZHMoY3JlZHM6IElNYXRyaXhDbGllbnRDcmVkcyk6IHZvaWQ7XG59XG5cbi8qKlxuICogV3JhcHBlciBvYmplY3QgZm9yIGhhbmRsaW5nIHRoZSBqcy1zZGsgTWF0cml4IENsaWVudCBvYmplY3QgaW4gdGhlIHJlYWN0LXNka1xuICogSGFuZGxlcyB0aGUgY3JlYXRpb24vaW5pdGlhbGlzYXRpb24gb2YgY2xpZW50IG9iamVjdHMuXG4gKiBUaGlzIG1vZHVsZSBwcm92aWRlcyBhIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGlzIGNsYXNzIHNvIHRoZSAnY3VycmVudCdcbiAqIE1hdHJpeCBDbGllbnQgb2JqZWN0IGlzIGF2YWlsYWJsZSBlYXNpbHkuXG4gKi9cbmNsYXNzIE1hdHJpeENsaWVudFBlZ0NsYXNzIGltcGxlbWVudHMgSU1hdHJpeENsaWVudFBlZyB7XG4gICAgLy8gVGhlc2UgYXJlIHRoZSBkZWZhdWx0IG9wdGlvbnMgdXNlZCB3aGVuIHdoZW4gdGhlXG4gICAgLy8gY2xpZW50IGlzIHN0YXJ0ZWQgaW4gJ3N0YXJ0Jy4gVGhlc2UgY2FuIGJlIGFsdGVyZWRcbiAgICAvLyBhdCBhbnkgdGltZSB1cCB0byBhZnRlciB0aGUgJ3dpbGxfc3RhcnRfY2xpZW50J1xuICAgIC8vIGV2ZW50IGlzIGZpbmlzaGVkIHByb2Nlc3NpbmcuXG4gICAgcHVibGljIG9wdHM6IElTdGFydENsaWVudE9wdHMgPSB7XG4gICAgICAgIGluaXRpYWxTeW5jTGltaXQ6IDIwLFxuICAgIH07XG5cbiAgICBwcml2YXRlIG1hdHJpeENsaWVudDogTWF0cml4Q2xpZW50ID0gbnVsbDtcbiAgICBwcml2YXRlIGp1c3RSZWdpc3RlcmVkVXNlcklkOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuICAgIC8vIHRoZSBjcmVkZW50aWFscyB1c2VkIHRvIGluaXQgdGhlIGN1cnJlbnQgY2xpZW50IG9iamVjdC5cbiAgICAvLyB1c2VkIGlmIHdlIHRlYXIgaXQgZG93biAmIHJlY3JlYXRlIGl0IHdpdGggYSBkaWZmZXJlbnQgc3RvcmVcbiAgICBwcml2YXRlIGN1cnJlbnRDbGllbnRDcmVkczogSU1hdHJpeENsaWVudENyZWRzO1xuXG4gICAgcHVibGljIGdldCgpOiBNYXRyaXhDbGllbnQge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXRyaXhDbGllbnQ7XG4gICAgfVxuXG4gICAgcHVibGljIHVuc2V0KCk6IHZvaWQge1xuICAgICAgICB0aGlzLm1hdHJpeENsaWVudCA9IG51bGw7XG5cbiAgICAgICAgTWF0cml4QWN0aW9uQ3JlYXRvcnMuc3RvcCgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRKdXN0UmVnaXN0ZXJlZFVzZXJJZCh1aWQ6IHN0cmluZyB8IG51bGwpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5qdXN0UmVnaXN0ZXJlZFVzZXJJZCA9IHVpZDtcbiAgICAgICAgaWYgKHVpZCkge1xuICAgICAgICAgICAgY29uc3QgcmVnaXN0cmF0aW9uVGltZSA9IERhdGUubm93KCkudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIm14X3JlZ2lzdHJhdGlvbl90aW1lXCIsIHJlZ2lzdHJhdGlvblRpbWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGN1cnJlbnRVc2VySXNKdXN0UmVnaXN0ZXJlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIHRoaXMubWF0cml4Q2xpZW50ICYmXG4gICAgICAgICAgICB0aGlzLm1hdHJpeENsaWVudC5jcmVkZW50aWFscy51c2VySWQgPT09IHRoaXMuanVzdFJlZ2lzdGVyZWRVc2VySWRcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdXNlclJlZ2lzdGVyZWRXaXRoaW5MYXN0SG91cnMoaG91cnM6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoaG91cnMgPD0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlZ2lzdHJhdGlvblRpbWUgPSBwYXJzZUludCh3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJteF9yZWdpc3RyYXRpb25fdGltZVwiKSwgMTApO1xuICAgICAgICAgICAgY29uc3QgZGlmZiA9IERhdGUubm93KCkgLSByZWdpc3RyYXRpb25UaW1lO1xuICAgICAgICAgICAgcmV0dXJuIChkaWZmIC8gMzZlNSkgPD0gaG91cnM7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyB1c2VyUmVnaXN0ZXJlZEFmdGVyKHRpbWVzdGFtcDogRGF0ZSk6IGJvb2xlYW4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVnaXN0cmF0aW9uVGltZSA9IHBhcnNlSW50KHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIm14X3JlZ2lzdHJhdGlvbl90aW1lXCIpLCAxMCk7XG4gICAgICAgICAgICByZXR1cm4gdGltZXN0YW1wLmdldFRpbWUoKSA8PSByZWdpc3RyYXRpb25UaW1lO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgcmVwbGFjZVVzaW5nQ3JlZHMoY3JlZHM6IElNYXRyaXhDbGllbnRDcmVkcyk6IHZvaWQge1xuICAgICAgICB0aGlzLmN1cnJlbnRDbGllbnRDcmVkcyA9IGNyZWRzO1xuICAgICAgICB0aGlzLmNyZWF0ZUNsaWVudChjcmVkcyk7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGFzc2lnbigpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICBmb3IgKGNvbnN0IGRiVHlwZSBvZiBbJ2luZGV4ZWRkYicsICdtZW1vcnknXSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBwcm9taXNlID0gdGhpcy5tYXRyaXhDbGllbnQuc3RvcmUuc3RhcnR1cCgpO1xuICAgICAgICAgICAgICAgIGxvZ2dlci5sb2coXCJNYXRyaXhDbGllbnRQZWc6IHdhaXRpbmcgZm9yIE1hdHJpeENsaWVudCBzdG9yZSB0byBpbml0aWFsaXNlXCIpO1xuICAgICAgICAgICAgICAgIGF3YWl0IHByb21pc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGJUeXBlID09PSAnaW5kZXhlZGRiJykge1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIHN0YXJ0aW5nIG1hdHJpeGNsaWVudCBzdG9yZSAtIGZhbGxpbmcgYmFjayB0byBtZW1vcnkgc3RvcmUnLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hdHJpeENsaWVudC5zdG9yZSA9IG5ldyBNZW1vcnlTdG9yZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2U6IGxvY2FsU3RvcmFnZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKCdGYWlsZWQgdG8gc3RhcnQgbWVtb3J5IHN0b3JlIScsIGVycik7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0cnkgdG8gaW5pdGlhbGlzZSBlMmUgb24gdGhlIG5ldyBjbGllbnRcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIGNoZWNrIHRoYXQgd2UgaGF2ZSBhIHZlcnNpb24gb2YgdGhlIGpzLXNkayB3aGljaCBpbmNsdWRlcyBpbml0Q3J5cHRvXG4gICAgICAgICAgICBpZiAoIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJsb3dCYW5kd2lkdGhcIikgJiYgdGhpcy5tYXRyaXhDbGllbnQuaW5pdENyeXB0bykge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMubWF0cml4Q2xpZW50LmluaXRDcnlwdG8oKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1hdHJpeENsaWVudC5zZXRDcnlwdG9UcnVzdENyb3NzU2lnbmVkRGV2aWNlcyhcbiAgICAgICAgICAgICAgICAgICAgIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoJ2UyZWUubWFudWFsbHlWZXJpZnlBbGxTZXNzaW9ucycpLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgYXdhaXQgdHJ5VG9VbmxvY2tTZWNyZXRTdG9yYWdlV2l0aERlaHlkcmF0aW9uS2V5KHRoaXMubWF0cml4Q2xpZW50KTtcbiAgICAgICAgICAgICAgICBTdG9yYWdlTWFuYWdlci5zZXRDcnlwdG9Jbml0aWFsaXNlZCh0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgaWYgKGUgJiYgZS5uYW1lID09PSAnSW52YWxpZENyeXB0b1N0b3JlRXJyb3InKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhlIGpzLXNkayBmb3VuZCBhIGNyeXB0byBEQiB0b28gbmV3IGZvciBpdCB0byB1c2VcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coQ3J5cHRvU3RvcmVUb29OZXdEaWFsb2cpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdGhpcyBjYW4gaGFwcGVuIGZvciBhIG51bWJlciBvZiByZWFzb25zLCB0aGUgbW9zdCBsaWtlbHkgYmVpbmdcbiAgICAgICAgICAgIC8vIHRoYXQgdGhlIG9sbSBsaWJyYXJ5IHdhcyBtaXNzaW5nLiBJdCdzIG5vdCBmYXRhbC5cbiAgICAgICAgICAgIGxvZ2dlci53YXJuKFwiVW5hYmxlIHRvIGluaXRpYWxpc2UgZTJlXCIsIGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgb3B0cyA9IHV0aWxzLmRlZXBDb3B5KHRoaXMub3B0cyk7XG4gICAgICAgIC8vIHRoZSByZWFjdCBzZGsgZG9lc24ndCB3b3JrIHdpdGhvdXQgdGhpcywgc28gZG9uJ3QgYWxsb3dcbiAgICAgICAgb3B0cy5wZW5kaW5nRXZlbnRPcmRlcmluZyA9IFBlbmRpbmdFdmVudE9yZGVyaW5nLkRldGFjaGVkO1xuICAgICAgICBvcHRzLmxhenlMb2FkTWVtYmVycyA9IHRydWU7XG4gICAgICAgIG9wdHMuY2xpZW50V2VsbEtub3duUG9sbFBlcmlvZCA9IDIgKiA2MCAqIDYwOyAvLyAyIGhvdXJzXG4gICAgICAgIG9wdHMuZXhwZXJpbWVudGFsVGhyZWFkU3VwcG9ydCA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJmZWF0dXJlX3RocmVhZFwiKTtcblxuICAgICAgICAvLyBDb25uZWN0IHRoZSBtYXRyaXggY2xpZW50IHRvIHRoZSBkaXNwYXRjaGVyIGFuZCBzZXR0aW5nIGhhbmRsZXJzXG4gICAgICAgIE1hdHJpeEFjdGlvbkNyZWF0b3JzLnN0YXJ0KHRoaXMubWF0cml4Q2xpZW50KTtcbiAgICAgICAgTWF0cml4Q2xpZW50QmFja2VkU2V0dGluZ3NIYW5kbGVyLm1hdHJpeENsaWVudCA9IHRoaXMubWF0cml4Q2xpZW50O1xuXG4gICAgICAgIHJldHVybiBvcHRzO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBzdGFydCgpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICBjb25zdCBvcHRzID0gYXdhaXQgdGhpcy5hc3NpZ24oKTtcblxuICAgICAgICBsb2dnZXIubG9nKGBNYXRyaXhDbGllbnRQZWc6IHJlYWxseSBzdGFydGluZyBNYXRyaXhDbGllbnRgKTtcbiAgICAgICAgYXdhaXQgdGhpcy5nZXQoKS5zdGFydENsaWVudChvcHRzKTtcbiAgICAgICAgbG9nZ2VyLmxvZyhgTWF0cml4Q2xpZW50UGVnOiBNYXRyaXhDbGllbnQgc3RhcnRlZGApO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRDcmVkZW50aWFscygpOiBJTWF0cml4Q2xpZW50Q3JlZHMge1xuICAgICAgICBsZXQgY29waWVkQ3JlZGVudGlhbHMgPSB0aGlzLmN1cnJlbnRDbGllbnRDcmVkcztcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudENsaWVudENyZWRzPy51c2VySWQgIT09IHRoaXMubWF0cml4Q2xpZW50Py5jcmVkZW50aWFscz8udXNlcklkKSB7XG4gICAgICAgICAgICAvLyBjYWNoZWQgY3JlZGVudGlhbHMgYmVsb25nIHRvIGEgZGlmZmVyZW50IHVzZXIgLSBkb24ndCB1c2UgdGhlbVxuICAgICAgICAgICAgY29waWVkQ3JlZGVudGlhbHMgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAvLyBDb3B5IHRoZSBjYWNoZWQgY3JlZGVudGlhbHMgYmVmb3JlIG92ZXJyaWRpbmcgd2hhdCB3ZSBjYW4uXG4gICAgICAgICAgICAuLi4oY29waWVkQ3JlZGVudGlhbHMgPz8ge30pLFxuXG4gICAgICAgICAgICBob21lc2VydmVyVXJsOiB0aGlzLm1hdHJpeENsaWVudC5iYXNlVXJsLFxuICAgICAgICAgICAgaWRlbnRpdHlTZXJ2ZXJVcmw6IHRoaXMubWF0cml4Q2xpZW50LmlkQmFzZVVybCxcbiAgICAgICAgICAgIHVzZXJJZDogdGhpcy5tYXRyaXhDbGllbnQuY3JlZGVudGlhbHMudXNlcklkLFxuICAgICAgICAgICAgZGV2aWNlSWQ6IHRoaXMubWF0cml4Q2xpZW50LmdldERldmljZUlkKCksXG4gICAgICAgICAgICBhY2Nlc3NUb2tlbjogdGhpcy5tYXRyaXhDbGllbnQuZ2V0QWNjZXNzVG9rZW4oKSxcbiAgICAgICAgICAgIGd1ZXN0OiB0aGlzLm1hdHJpeENsaWVudC5pc0d1ZXN0KCksXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHVibGljIGdldEhvbWVzZXJ2ZXJOYW1lKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IG1hdGNoZXMgPSAvXkBbXjpdKzooLispJC8uZXhlYyh0aGlzLm1hdHJpeENsaWVudC5jcmVkZW50aWFscy51c2VySWQpO1xuICAgICAgICBpZiAobWF0Y2hlcyA9PT0gbnVsbCB8fCBtYXRjaGVzLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZhaWxlZCB0byBkZXJpdmUgaG9tZXNlcnZlciBuYW1lIGZyb20gdXNlciBJRCFcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hdGNoZXNbMV07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBuYW1lc1RvUm9vbU5hbWUobmFtZXM6IHN0cmluZ1tdLCBjb3VudDogbnVtYmVyKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICAgICAgY29uc3QgY291bnRXaXRob3V0TWUgPSBjb3VudCAtIDE7XG4gICAgICAgIGlmICghbmFtZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gX3QoXCJFbXB0eSByb29tXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuYW1lcy5sZW5ndGggPT09IDEgJiYgY291bnRXaXRob3V0TWUgPD0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIG5hbWVzWzBdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBtZW1iZXJOYW1lc1RvUm9vbU5hbWUobmFtZXM6IHN0cmluZ1tdLCBjb3VudDogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgbmFtZSA9IHRoaXMubmFtZXNUb1Jvb21OYW1lKG5hbWVzLCBjb3VudCk7XG4gICAgICAgIGlmIChuYW1lKSByZXR1cm4gbmFtZTtcblxuICAgICAgICBpZiAobmFtZXMubGVuZ3RoID09PSAyICYmIGNvdW50ID09PSAyKSB7XG4gICAgICAgICAgICByZXR1cm4gX3QoXCIlKHVzZXIxKXMgYW5kICUodXNlcjIpc1wiLCB7XG4gICAgICAgICAgICAgICAgdXNlcjE6IG5hbWVzWzBdLFxuICAgICAgICAgICAgICAgIHVzZXIyOiBuYW1lc1sxXSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfdChcIiUodXNlcilzIGFuZCAlKGNvdW50KXMgb3RoZXJzXCIsIHtcbiAgICAgICAgICAgIHVzZXI6IG5hbWVzWzBdLFxuICAgICAgICAgICAgY291bnQ6IGNvdW50IC0gMSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpbnZpdGVlTmFtZXNUb1Jvb21OYW1lKG5hbWVzOiBzdHJpbmdbXSwgY291bnQ6IG51bWJlcik6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSB0aGlzLm5hbWVzVG9Sb29tTmFtZShuYW1lcywgY291bnQpO1xuICAgICAgICBpZiAobmFtZSkgcmV0dXJuIG5hbWU7XG5cbiAgICAgICAgaWYgKG5hbWVzLmxlbmd0aCA9PT0gMiAmJiBjb3VudCA9PT0gMikge1xuICAgICAgICAgICAgcmV0dXJuIF90KFwiSW52aXRpbmcgJSh1c2VyMSlzIGFuZCAlKHVzZXIyKXNcIiwge1xuICAgICAgICAgICAgICAgIHVzZXIxOiBuYW1lc1swXSxcbiAgICAgICAgICAgICAgICB1c2VyMjogbmFtZXNbMV0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3QoXCJJbnZpdGluZyAlKHVzZXIpcyBhbmQgJShjb3VudClzIG90aGVyc1wiLCB7XG4gICAgICAgICAgICB1c2VyOiBuYW1lc1swXSxcbiAgICAgICAgICAgIGNvdW50OiBjb3VudCAtIDEsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlQ2xpZW50KGNyZWRzOiBJTWF0cml4Q2xpZW50Q3JlZHMpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgb3B0czogSUNyZWF0ZUNsaWVudE9wdHMgPSB7XG4gICAgICAgICAgICBiYXNlVXJsOiBjcmVkcy5ob21lc2VydmVyVXJsLFxuICAgICAgICAgICAgaWRCYXNlVXJsOiBjcmVkcy5pZGVudGl0eVNlcnZlclVybCxcbiAgICAgICAgICAgIGFjY2Vzc1Rva2VuOiBjcmVkcy5hY2Nlc3NUb2tlbixcbiAgICAgICAgICAgIHVzZXJJZDogY3JlZHMudXNlcklkLFxuICAgICAgICAgICAgZGV2aWNlSWQ6IGNyZWRzLmRldmljZUlkLFxuICAgICAgICAgICAgcGlja2xlS2V5OiBjcmVkcy5waWNrbGVLZXksXG4gICAgICAgICAgICB0aW1lbGluZVN1cHBvcnQ6IHRydWUsXG4gICAgICAgICAgICBmb3JjZVRVUk46ICFTZXR0aW5nc1N0b3JlLmdldFZhbHVlKCd3ZWJSdGNBbGxvd1BlZXJUb1BlZXInKSxcbiAgICAgICAgICAgIGZhbGxiYWNrSUNFU2VydmVyQWxsb3dlZDogISFTZXR0aW5nc1N0b3JlLmdldFZhbHVlKCdmYWxsYmFja0lDRVNlcnZlckFsbG93ZWQnKSxcbiAgICAgICAgICAgIC8vIEdhdGhlciB1cCB0byAyMCBJQ0UgY2FuZGlkYXRlcyB3aGVuIGEgY2FsbCBhcnJpdmVzOiB0aGlzIHNob3VsZCBiZSBtb3JlIHRoYW4gd2UnZFxuICAgICAgICAgICAgLy8gZXZlciBub3JtYWxseSBuZWVkLCBzbyBlZmZlY3RpdmVseSB0aGlzIHNob3VsZCBtYWtlIGFsbCB0aGUgZ2F0aGVyaW5nIGhhcHBlbiB3aGVuXG4gICAgICAgICAgICAvLyB0aGUgY2FsbCBhcnJpdmVzLlxuICAgICAgICAgICAgaWNlQ2FuZGlkYXRlUG9vbFNpemU6IDIwLFxuICAgICAgICAgICAgdmVyaWZpY2F0aW9uTWV0aG9kczogW1xuICAgICAgICAgICAgICAgIHZlcmlmaWNhdGlvbk1ldGhvZHMuU0FTLFxuICAgICAgICAgICAgICAgIFNIT1dfUVJfQ09ERV9NRVRIT0QsXG4gICAgICAgICAgICAgICAgdmVyaWZpY2F0aW9uTWV0aG9kcy5SRUNJUFJPQ0FURV9RUl9DT0RFLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIGlkZW50aXR5U2VydmVyOiBuZXcgSWRlbnRpdHlBdXRoQ2xpZW50KCksXG4gICAgICAgICAgICAvLyBUaGVzZSBhcmUgYWx3YXlzIGluc3RhbGxlZCByZWdhcmRsZXNzIG9mIHRoZSBsYWJzIGZsYWcgc28gdGhhdCBjcm9zcy1zaWduaW5nIGZlYXR1cmVzXG4gICAgICAgICAgICAvLyBjYW4gdG9nZ2xlIG9uIHdpdGhvdXQgcmVsb2FkaW5nIGFuZCBhbHNvIGJlIGFjY2Vzc2VkIGltbWVkaWF0ZWx5IGFmdGVyIGxvZ2luLlxuICAgICAgICAgICAgY3J5cHRvQ2FsbGJhY2tzOiB7IC4uLmNyb3NzU2lnbmluZ0NhbGxiYWNrcyB9LFxuICAgICAgICAgICAgcm9vbU5hbWVHZW5lcmF0b3I6IChfOiBzdHJpbmcsIHN0YXRlOiBSb29tTmFtZVN0YXRlKSA9PiB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChzdGF0ZS50eXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgUm9vbU5hbWVUeXBlLkdlbmVyYXRlZDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoc3RhdGUuc3VidHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgXCJJbnZpdGluZ1wiOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5pbnZpdGVlTmFtZXNUb1Jvb21OYW1lKHN0YXRlLm5hbWVzLCBzdGF0ZS5jb3VudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubWVtYmVyTmFtZXNUb1Jvb21OYW1lKHN0YXRlLm5hbWVzLCBzdGF0ZS5jb3VudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgUm9vbU5hbWVUeXBlLkVtcHR5Um9vbTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGF0ZS5vbGROYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90KFwiRW1wdHkgcm9vbSAod2FzICUob2xkTmFtZSlzKVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9sZE5hbWU6IHN0YXRlLm9sZE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfdChcIkVtcHR5IHJvb21cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmIChTZWN1cml0eUN1c3RvbWlzYXRpb25zLmdldERlaHlkcmF0aW9uS2V5KSB7XG4gICAgICAgICAgICBvcHRzLmNyeXB0b0NhbGxiYWNrcyEuZ2V0RGVoeWRyYXRpb25LZXkgPSBTZWN1cml0eUN1c3RvbWlzYXRpb25zLmdldERlaHlkcmF0aW9uS2V5O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5tYXRyaXhDbGllbnQgPSBjcmVhdGVNYXRyaXhDbGllbnQob3B0cyk7XG5cbiAgICAgICAgLy8gd2UncmUgZ29pbmcgdG8gYWRkIGV2ZW50bGlzdGVuZXJzIGZvciBlYWNoIG1hdHJpeCBldmVudCB0aWxlLCBzbyB0aGVcbiAgICAgICAgLy8gcG90ZW50aWFsIG51bWJlciBvZiBldmVudCBsaXN0ZW5lcnMgaXMgcXVpdGUgaGlnaC5cbiAgICAgICAgdGhpcy5tYXRyaXhDbGllbnQuc2V0TWF4TGlzdGVuZXJzKDUwMCk7XG5cbiAgICAgICAgdGhpcy5tYXRyaXhDbGllbnQuc2V0R3Vlc3QoQm9vbGVhbihjcmVkcy5ndWVzdCkpO1xuXG4gICAgICAgIGNvbnN0IG5vdGlmVGltZWxpbmVTZXQgPSBuZXcgRXZlbnRUaW1lbGluZVNldCh1bmRlZmluZWQsIHtcbiAgICAgICAgICAgIHRpbWVsaW5lU3VwcG9ydDogdHJ1ZSxcbiAgICAgICAgICAgIHBlbmRpbmdFdmVudHM6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICAgICAgLy8gWFhYOiB3aGF0IGlzIG91ciBpbml0aWFsIHBhZ2luYXRpb24gdG9rZW4/ISBpdCBzb21laG93IG5lZWRzIHRvIGJlIHN5bmNocm9uaXNlZCB3aXRoIC9zeW5jLlxuICAgICAgICBub3RpZlRpbWVsaW5lU2V0LmdldExpdmVUaW1lbGluZSgpLnNldFBhZ2luYXRpb25Ub2tlbihcIlwiLCBFdmVudFRpbWVsaW5lLkJBQ0tXQVJEUyk7XG4gICAgICAgIHRoaXMubWF0cml4Q2xpZW50LnNldE5vdGlmVGltZWxpbmVTZXQobm90aWZUaW1lbGluZVNldCk7XG4gICAgfVxufVxuXG4vKipcbiAqIE5vdGU6IFlvdSBzaG91bGQgYmUgdXNpbmcgYSBSZWFjdCBjb250ZXh0IHdpdGggYWNjZXNzIHRvIGEgY2xpZW50IHJhdGhlciB0aGFuXG4gKiB1c2luZyB0aGlzLCBhcyBpbiBhIG11bHRpLWFjY291bnQgd29ybGQgdGhpcyB3aWxsIG5vdCBleGlzdCFcbiAqL1xuZXhwb3J0IGNvbnN0IE1hdHJpeENsaWVudFBlZzogSU1hdHJpeENsaWVudFBlZyA9IG5ldyBNYXRyaXhDbGllbnRQZWdDbGFzcygpO1xuXG5pZiAoIXdpbmRvdy5teE1hdHJpeENsaWVudFBlZykge1xuICAgIHdpbmRvdy5teE1hdHJpeENsaWVudFBlZyA9IE1hdHJpeENsaWVudFBlZztcbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFtQkE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7Ozs7QUE2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTUEsb0JBQU4sQ0FBdUQ7RUFBQTtJQUFBLDRDQUtuQjtNQUM1QkMsZ0JBQWdCLEVBQUU7SUFEVSxDQUxtQjtJQUFBLG9EQVNkLElBVGM7SUFBQSw0REFVTCxJQVZLO0lBQUE7RUFBQTs7RUFnQjVDQyxHQUFHLEdBQWlCO0lBQ3ZCLE9BQU8sS0FBS0MsWUFBWjtFQUNIOztFQUVNQyxLQUFLLEdBQVM7SUFDakIsS0FBS0QsWUFBTCxHQUFvQixJQUFwQjs7SUFFQUUsNkJBQUEsQ0FBcUJDLElBQXJCO0VBQ0g7O0VBRU1DLHVCQUF1QixDQUFDQyxHQUFELEVBQTJCO0lBQ3JELEtBQUtDLG9CQUFMLEdBQTRCRCxHQUE1Qjs7SUFDQSxJQUFJQSxHQUFKLEVBQVM7TUFDTCxNQUFNRSxnQkFBZ0IsR0FBR0MsSUFBSSxDQUFDQyxHQUFMLEdBQVdDLFFBQVgsRUFBekI7TUFDQUMsTUFBTSxDQUFDQyxZQUFQLENBQW9CQyxPQUFwQixDQUE0QixzQkFBNUIsRUFBb0ROLGdCQUFwRDtJQUNIO0VBQ0o7O0VBRU1PLDJCQUEyQixHQUFZO0lBQzFDLE9BQ0ksS0FBS2QsWUFBTCxJQUNBLEtBQUtBLFlBQUwsQ0FBa0JlLFdBQWxCLENBQThCQyxNQUE5QixLQUF5QyxLQUFLVixvQkFGbEQ7RUFJSDs7RUFFTVcsNkJBQTZCLENBQUNDLEtBQUQsRUFBeUI7SUFDekQsSUFBSUEsS0FBSyxJQUFJLENBQWIsRUFBZ0I7TUFDWixPQUFPLEtBQVA7SUFDSDs7SUFFRCxJQUFJ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