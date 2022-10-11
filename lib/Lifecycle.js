"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.attemptTokenLogin = attemptTokenLogin;
exports.getStoredSessionOwner = getStoredSessionOwner;
exports.getStoredSessionVars = getStoredSessionVars;
exports.handleInvalidStoreError = handleInvalidStoreError;
exports.hydrateSession = hydrateSession;
exports.isLoggingOut = isLoggingOut;
exports.isSoftLogout = isSoftLogout;
exports.loadSession = loadSession;
exports.logout = logout;
exports.onLoggedOut = onLoggedOut;
exports.restoreFromLocalStorage = restoreFromLocalStorage;
exports.setLoggedIn = setLoggedIn;
exports.softLogout = softLogout;
exports.stopMatrixClient = stopMatrixClient;

var _matrix = require("matrix-js-sdk/src/matrix");

var _errors = require("matrix-js-sdk/src/errors");

var _aes = require("matrix-js-sdk/src/crypto/aes");

var _logger = require("matrix-js-sdk/src/logger");

var _MatrixClientPeg = require("./MatrixClientPeg");

var _Security = _interopRequireDefault(require("./customisations/Security"));

var _EventIndexPeg = _interopRequireDefault(require("./indexing/EventIndexPeg"));

var _createMatrixClient = _interopRequireDefault(require("./utils/createMatrixClient"));

var _Notifier = _interopRequireDefault(require("./Notifier"));

var _UserActivity = _interopRequireDefault(require("./UserActivity"));

var _Presence = _interopRequireDefault(require("./Presence"));

var _dispatcher = _interopRequireDefault(require("./dispatcher/dispatcher"));

var _DMRoomMap = _interopRequireDefault(require("./utils/DMRoomMap"));

var _Modal = _interopRequireDefault(require("./Modal"));

var _ActiveWidgetStore = _interopRequireDefault(require("./stores/ActiveWidgetStore"));

var _PlatformPeg = _interopRequireDefault(require("./PlatformPeg"));

var _Login = require("./Login");

var StorageManager = _interopRequireWildcard(require("./utils/StorageManager"));

var _SettingsStore = _interopRequireDefault(require("./settings/SettingsStore"));

var _TypingStore = _interopRequireDefault(require("./stores/TypingStore"));

var _ToastStore = _interopRequireDefault(require("./stores/ToastStore"));

var _IntegrationManagers = require("./integrations/IntegrationManagers");

var _Mjolnir = require("./mjolnir/Mjolnir");

var _DeviceListener = _interopRequireDefault(require("./DeviceListener"));

var _Jitsi = require("./widgets/Jitsi");

var _BasePlatform = require("./BasePlatform");

var _ThreepidInviteStore = _interopRequireDefault(require("./stores/ThreepidInviteStore"));

var _PosthogAnalytics = require("./PosthogAnalytics");

var _LegacyCallHandler = _interopRequireDefault(require("./LegacyCallHandler"));

var _Lifecycle = _interopRequireDefault(require("./customisations/Lifecycle"));

var _ErrorDialog = _interopRequireDefault(require("./components/views/dialogs/ErrorDialog"));

var _languageHandler = require("./languageHandler");

var _LazyLoadingResyncDialog = _interopRequireDefault(require("./components/views/dialogs/LazyLoadingResyncDialog"));

var _LazyLoadingDisabledDialog = _interopRequireDefault(require("./components/views/dialogs/LazyLoadingDisabledDialog"));

var _SessionRestoreErrorDialog = _interopRequireDefault(require("./components/views/dialogs/SessionRestoreErrorDialog"));

var _StorageEvictedDialog = _interopRequireDefault(require("./components/views/dialogs/StorageEvictedDialog"));

var _sentry = require("./sentry");

var _SdkConfig = _interopRequireDefault(require("./SdkConfig"));

var _DialogOpener = require("./utils/DialogOpener");

var _actions = require("./dispatcher/actions");

var _AbstractLocalStorageSettingsHandler = _interopRequireDefault(require("./settings/handlers/AbstractLocalStorageSettingsHandler"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2017 Vector Creations Ltd
Copyright 2018 New Vector Ltd
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.

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
const HOMESERVER_URL_KEY = "mx_hs_url";
const ID_SERVER_URL_KEY = "mx_is_url";

_dispatcher.default.register(payload => {
  if (payload.action === _actions.Action.TriggerLogout) {
    // noinspection JSIgnoredPromiseFromCall - we don't care if it fails
    onLoggedOut();
  } else if (payload.action === _actions.Action.OverwriteLogin) {
    const typed = payload; // noinspection JSIgnoredPromiseFromCall - we don't care if it fails

    doSetLoggedIn(typed.credentials, true);
  }
});

/**
 * Called at startup, to attempt to build a logged-in Matrix session. It tries
 * a number of things:
 *
 * 1. if we have a guest access token in the fragment query params, it uses
 *    that.
 * 2. if an access token is stored in local storage (from a previous session),
 *    it uses that.
 * 3. it attempts to auto-register as a guest user.
 *
 * If any of steps 1-4 are successful, it will call {_doSetLoggedIn}, which in
 * turn will raise on_logged_in and will_start_client events.
 *
 * @param {object} [opts]
 * @param {object} [opts.fragmentQueryParams]: string->string map of the
 *     query-parameters extracted from the #-fragment of the starting URI.
 * @param {boolean} [opts.enableGuest]: set to true to enable guest access
 *     tokens and auto-guest registrations.
 * @param {string} [opts.guestHsUrl]: homeserver URL. Only used if enableGuest
 *     is true; defines the HS to register against.
 * @param {string} [opts.guestIsUrl]: homeserver URL. Only used if enableGuest
 *     is true; defines the IS to use.
 * @param {bool} [opts.ignoreGuest]: If the stored session is a guest account,
 *     ignore it and don't load it.
 * @param {string} [opts.defaultDeviceDisplayName]: Default display name to use
 *     when registering as a guest.
 * @returns {Promise} a promise which resolves when the above process completes.
 *     Resolves to `true` if we ended up starting a session, or `false` if we
 *     failed.
 */
async function loadSession() {
  let opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  try {
    let enableGuest = opts.enableGuest || false;
    const guestHsUrl = opts.guestHsUrl;
    const guestIsUrl = opts.guestIsUrl;
    const fragmentQueryParams = opts.fragmentQueryParams || {};
    const defaultDeviceDisplayName = opts.defaultDeviceDisplayName;

    if (enableGuest && !guestHsUrl) {
      _logger.logger.warn("Cannot enable guest access: can't determine HS URL to use");

      enableGuest = false;
    }

    if (enableGuest && fragmentQueryParams.guest_user_id && fragmentQueryParams.guest_access_token) {
      _logger.logger.log("Using guest access credentials");

      return doSetLoggedIn({
        userId: fragmentQueryParams.guest_user_id,
        accessToken: fragmentQueryParams.guest_access_token,
        homeserverUrl: guestHsUrl,
        identityServerUrl: guestIsUrl,
        guest: true
      }, true).then(() => true);
    }

    const success = await restoreFromLocalStorage({
      ignoreGuest: Boolean(opts.ignoreGuest)
    });

    if (success) {
      return true;
    }

    if (enableGuest) {
      return registerAsGuest(guestHsUrl, guestIsUrl, defaultDeviceDisplayName);
    } // fall back to welcome screen


    return false;
  } catch (e) {
    if (e instanceof AbortLoginAndRebuildStorage) {
      // If we're aborting login because of a storage inconsistency, we don't
      // need to show the general failure dialog. Instead, just go back to welcome.
      return false;
    }

    return handleLoadSessionFailure(e);
  }
}
/**
 * Gets the user ID of the persisted session, if one exists. This does not validate
 * that the user's credentials still work, just that they exist and that a user ID
 * is associated with them. The session is not loaded.
 * @returns {[string, boolean]} The persisted session's owner and whether the stored
 *     session is for a guest user, if an owner exists. If there is no stored session,
 *     return [null, null].
 */


async function getStoredSessionOwner() {
  const {
    hsUrl,
    userId,
    hasAccessToken,
    isGuest
  } = await getStoredSessionVars();
  return hsUrl && userId && hasAccessToken ? [userId, isGuest] : [null, null];
}
/**
 * @param {Object} queryParams    string->string map of the
 *     query-parameters extracted from the real query-string of the starting
 *     URI.
 *
 * @param {string} defaultDeviceDisplayName
 * @param {string} fragmentAfterLogin path to go to after a successful login, only used for "Try again"
 *
 * @returns {Promise} promise which resolves to true if we completed the token
 *    login, else false
 */


function attemptTokenLogin(queryParams, defaultDeviceDisplayName, fragmentAfterLogin) {
  if (!queryParams.loginToken) {
    return Promise.resolve(false);
  }

  const homeserver = localStorage.getItem(_BasePlatform.SSO_HOMESERVER_URL_KEY);
  const identityServer = localStorage.getItem(_BasePlatform.SSO_ID_SERVER_URL_KEY);

  if (!homeserver) {
    _logger.logger.warn("Cannot log in with token: can't determine HS URL to use");

    _Modal.default.createDialog(_ErrorDialog.default, {
      title: (0, _languageHandler._t)("We couldn't log you in"),
      description: (0, _languageHandler._t)("We asked the browser to remember which homeserver you use to let you sign in, " + "but unfortunately your browser has forgotten it. Go to the sign in page and try again."),
      button: (0, _languageHandler._t)("Try again")
    });

    return Promise.resolve(false);
  }

  return (0, _Login.sendLoginRequest)(homeserver, identityServer, "m.login.token", {
    token: queryParams.loginToken,
    initial_device_display_name: defaultDeviceDisplayName
  }).then(function (creds) {
    _logger.logger.log("Logged in with token");

    return clearStorage().then(async () => {
      await persistCredentials(creds); // remember that we just logged in

      sessionStorage.setItem("mx_fresh_login", String(true));
      return true;
    });
  }).catch(err => {
    _Modal.default.createDialog(_ErrorDialog.default, {
      title: (0, _languageHandler._t)("We couldn't log you in"),
      description: err.name === "ConnectionError" ? (0, _languageHandler._t)("Your homeserver was unreachable and was not able to log you in. Please try again. " + "If this continues, please contact your homeserver administrator.") : (0, _languageHandler._t)("Your homeserver rejected your log in attempt. " + "This could be due to things just taking too long. Please try again. " + "If this continues, please contact your homeserver administrator."),
      button: (0, _languageHandler._t)("Try again"),
      onFinished: tryAgain => {
        if (tryAgain) {
          const cli = (0, _matrix.createClient)({
            baseUrl: homeserver,
            idBaseUrl: identityServer
          });
          const idpId = localStorage.getItem(_BasePlatform.SSO_IDP_ID_KEY) || undefined;

          _PlatformPeg.default.get().startSingleSignOn(cli, "sso", fragmentAfterLogin, idpId);
        }
      }
    });

    _logger.logger.error("Failed to log in with login token:");

    _logger.logger.error(err);

    return false;
  });
}

function handleInvalidStoreError(e) {
  if (e.reason === _errors.InvalidStoreError.TOGGLED_LAZY_LOADING) {
    return Promise.resolve().then(() => {
      const lazyLoadEnabled = e.value;

      if (lazyLoadEnabled) {
        return new Promise(resolve => {
          _Modal.default.createDialog(_LazyLoadingResyncDialog.default, {
            onFinished: resolve
          });
        });
      } else {
        // show warning about simultaneous use
        // between LL/non-LL version on same host.
        // as disabling LL when previously enabled
        // is a strong indicator of this (/develop & /app)
        return new Promise(resolve => {
          _Modal.default.createDialog(_LazyLoadingDisabledDialog.default, {
            onFinished: resolve,
            host: window.location.host
          });
        });
      }
    }).then(() => {
      return _MatrixClientPeg.MatrixClientPeg.get().store.deleteAllData();
    }).then(() => {
      _PlatformPeg.default.get().reload();
    });
  }
}

function registerAsGuest(hsUrl, isUrl, defaultDeviceDisplayName) {
  _logger.logger.log(`Doing guest login on ${hsUrl}`); // create a temporary MatrixClient to do the login


  const client = (0, _matrix.createClient)({
    baseUrl: hsUrl
  });
  return client.registerGuest({
    body: {
      initial_device_display_name: defaultDeviceDisplayName
    }
  }).then(creds => {
    _logger.logger.log(`Registered as guest: ${creds.user_id}`);

    return doSetLoggedIn({
      userId: creds.user_id,
      deviceId: creds.device_id,
      accessToken: creds.access_token,
      homeserverUrl: hsUrl,
      identityServerUrl: isUrl,
      guest: true
    }, true).then(() => true);
  }, err => {
    _logger.logger.error("Failed to register as guest", err);

    return false;
  });
}

/**
 * Retrieves information about the stored session from the browser's storage. The session
 * may not be valid, as it is not tested for consistency here.
 * @returns {Object} Information about the session - see implementation for variables.
 */
async function getStoredSessionVars() {
  const hsUrl = localStorage.getItem(HOMESERVER_URL_KEY);
  const isUrl = localStorage.getItem(ID_SERVER_URL_KEY);
  let accessToken;

  try {
    accessToken = await StorageManager.idbLoad("account", "mx_access_token");
  } catch (e) {
    _logger.logger.error("StorageManager.idbLoad failed for account:mx_access_token", e);
  }

  if (!accessToken) {
    accessToken = localStorage.getItem("mx_access_token");

    if (accessToken) {
      try {
        // try to migrate access token to IndexedDB if we can
        await StorageManager.idbSave("account", "mx_access_token", accessToken);
        localStorage.removeItem("mx_access_token");
      } catch (e) {
        _logger.logger.error("migration of access token to IndexedDB failed", e);
      }
    }
  } // if we pre-date storing "mx_has_access_token", but we retrieved an access
  // token, then we should say we have an access token


  const hasAccessToken = localStorage.getItem("mx_has_access_token") === "true" || !!accessToken;
  const userId = localStorage.getItem("mx_user_id");
  const deviceId = localStorage.getItem("mx_device_id");
  let isGuest;

  if (localStorage.getItem("mx_is_guest") !== null) {
    isGuest = localStorage.getItem("mx_is_guest") === "true";
  } else {
    // legacy key name
    isGuest = localStorage.getItem("matrix-is-guest") === "true";
  }

  return {
    hsUrl,
    isUrl,
    hasAccessToken,
    accessToken,
    userId,
    deviceId,
    isGuest
  };
} // The pickle key is a string of unspecified length and format.  For AES, we
// need a 256-bit Uint8Array. So we HKDF the pickle key to generate the AES
// key.  The AES key should be zeroed after it is used.


async function pickleKeyToAesKey(pickleKey) {
  const pickleKeyBuffer = new Uint8Array(pickleKey.length);

  for (let i = 0; i < pickleKey.length; i++) {
    pickleKeyBuffer[i] = pickleKey.charCodeAt(i);
  }

  const hkdfKey = await window.crypto.subtle.importKey("raw", pickleKeyBuffer, "HKDF", false, ["deriveBits"]);
  pickleKeyBuffer.fill(0);
  return new Uint8Array(await window.crypto.subtle.deriveBits({
    name: "HKDF",
    hash: "SHA-256",
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/879
    salt: new Uint8Array(32),
    info: new Uint8Array(0)
  }, hkdfKey, 256));
}

async function abortLogin() {
  const signOut = await showStorageEvictedDialog();

  if (signOut) {
    await clearStorage(); // This error feels a bit clunky, but we want to make sure we don't go any
    // further and instead head back to sign in.

    throw new AbortLoginAndRebuildStorage("Aborting login in progress because of storage inconsistency");
  }
} // returns a promise which resolves to true if a session is found in
// localstorage
//
// N.B. Lifecycle.js should not maintain any further localStorage state, we
//      are moving towards using SessionStore to keep track of state related
//      to the current session (which is typically backed by localStorage).
//
//      The plan is to gradually move the localStorage access done here into
//      SessionStore to avoid bugs where the view becomes out-of-sync with
//      localStorage (e.g. isGuest etc.)


async function restoreFromLocalStorage(opts) {
  const ignoreGuest = opts?.ignoreGuest;

  if (!localStorage) {
    return false;
  }

  const {
    hsUrl,
    isUrl,
    hasAccessToken,
    accessToken,
    userId,
    deviceId,
    isGuest
  } = await getStoredSessionVars();

  if (hasAccessToken && !accessToken) {
    abortLogin();
  }

  if (accessToken && userId && hsUrl) {
    if (ignoreGuest && isGuest) {
      _logger.logger.log("Ignoring stored guest account: " + userId);

      return false;
    }

    let decryptedAccessToken = accessToken;
    const pickleKey = await _PlatformPeg.default.get().getPickleKey(userId, deviceId);

    if (pickleKey) {
      _logger.logger.log("Got pickle key");

      if (typeof accessToken !== "string") {
        const encrKey = await pickleKeyToAesKey(pickleKey);
        decryptedAccessToken = await (0, _aes.decryptAES)(accessToken, encrKey, "access_token");
        encrKey.fill(0);
      }
    } else {
      _logger.logger.log("No pickle key available");
    }

    const freshLogin = sessionStorage.getItem("mx_fresh_login") === "true";
    sessionStorage.removeItem("mx_fresh_login");

    _logger.logger.log(`Restoring session for ${userId}`);

    await doSetLoggedIn({
      userId: userId,
      deviceId: deviceId,
      accessToken: decryptedAccessToken,
      homeserverUrl: hsUrl,
      identityServerUrl: isUrl,
      guest: isGuest,
      pickleKey: pickleKey,
      freshLogin: freshLogin
    }, false);
    return true;
  } else {
    _logger.logger.log("No previous session found.");

    return false;
  }
}

async function handleLoadSessionFailure(e) {
  _logger.logger.error("Unable to load session", e);

  const modal = _Modal.default.createDialog(_SessionRestoreErrorDialog.default, {
    error: e
  });

  const [success] = await modal.finished;

  if (success) {
    // user clicked continue.
    await clearStorage();
    return false;
  } // try, try again


  return loadSession();
}
/**
 * Transitions to a logged-in state using the given credentials.
 *
 * Starts the matrix client and all other react-sdk services that
 * listen for events while a session is logged in.
 *
 * Also stops the old MatrixClient and clears old credentials/etc out of
 * storage before starting the new client.
 *
 * @param {IMatrixClientCreds} credentials The credentials to use
 *
 * @returns {Promise} promise which resolves to the new MatrixClient once it has been started
 */


async function setLoggedIn(credentials) {
  credentials.freshLogin = true;
  stopMatrixClient();
  const pickleKey = credentials.userId && credentials.deviceId ? await _PlatformPeg.default.get().createPickleKey(credentials.userId, credentials.deviceId) : null;

  if (pickleKey) {
    _logger.logger.log("Created pickle key");
  } else {
    _logger.logger.log("Pickle key not created");
  }

  return doSetLoggedIn(Object.assign({}, credentials, {
    pickleKey
  }), true);
}
/**
 * Hydrates an existing session by using the credentials provided. This will
 * not clear any local storage, unlike setLoggedIn().
 *
 * Stops the existing Matrix client (without clearing its data) and starts a
 * new one in its place. This additionally starts all other react-sdk services
 * which use the new Matrix client.
 *
 * If the credentials belong to a different user from the session already stored,
 * the old session will be cleared automatically.
 *
 * @param {IMatrixClientCreds} credentials The credentials to use
 *
 * @returns {Promise} promise which resolves to the new MatrixClient once it has been started
 */


async function hydrateSession(credentials) {
  const oldUserId = _MatrixClientPeg.MatrixClientPeg.get().getUserId();

  const oldDeviceId = _MatrixClientPeg.MatrixClientPeg.get().getDeviceId();

  stopMatrixClient(); // unsets MatrixClientPeg.get()

  localStorage.removeItem("mx_soft_logout");
  _isLoggingOut = false;
  const overwrite = credentials.userId !== oldUserId || credentials.deviceId !== oldDeviceId;

  if (overwrite) {
    _logger.logger.warn("Clearing all data: Old session belongs to a different user/session");
  }

  if (!credentials.pickleKey) {
    _logger.logger.info("Lifecycle#hydrateSession: Pickle key not provided - trying to get one");

    credentials.pickleKey = await _PlatformPeg.default.get().getPickleKey(credentials.userId, credentials.deviceId);
  }

  return doSetLoggedIn(credentials, overwrite);
}
/**
 * fires on_logging_in, optionally clears localstorage, persists new credentials
 * to localstorage, starts the new client.
 *
 * @param {IMatrixClientCreds} credentials
 * @param {Boolean} clearStorageEnabled
 *
 * @returns {Promise} promise which resolves to the new MatrixClient once it has been started
 */


async function doSetLoggedIn(credentials, clearStorageEnabled) {
  credentials.guest = Boolean(credentials.guest);
  const softLogout = isSoftLogout();

  _logger.logger.log("setLoggedIn: mxid: " + credentials.userId + " deviceId: " + credentials.deviceId + " guest: " + credentials.guest + " hs: " + credentials.homeserverUrl + " softLogout: " + softLogout, " freshLogin: " + credentials.freshLogin); // This is dispatched to indicate that the user is still in the process of logging in
  // because async code may take some time to resolve, breaking the assumption that
  // `setLoggedIn` takes an "instant" to complete, and dispatch `on_logged_in` a few ms
  // later than MatrixChat might assume.
  //
  // we fire it *synchronously* to make sure it fires before on_logged_in.
  // (dis.dispatch uses `setTimeout`, which does not guarantee ordering.)


  _dispatcher.default.dispatch({
    action: 'on_logging_in'
  }, true);

  if (clearStorageEnabled) {
    await clearStorage();
  }

  const results = await StorageManager.checkConsistency(); // If there's an inconsistency between account data in local storage and the
  // crypto store, we'll be generally confused when handling encrypted data.
  // Show a modal recommending a full reset of storage.

  if (results.dataInLocalStorage && results.cryptoInited && !results.dataInCryptoStore) {
    await abortLogin();
  }

  _MatrixClientPeg.MatrixClientPeg.replaceUsingCreds(credentials);

  (0, _sentry.setSentryUser)(credentials.userId);

  if (_PosthogAnalytics.PosthogAnalytics.instance.isEnabled()) {
    _PosthogAnalytics.PosthogAnalytics.instance.startListeningToSettingsChanges();
  }

  const client = _MatrixClientPeg.MatrixClientPeg.get();

  if (credentials.freshLogin && _SettingsStore.default.getValue("feature_dehydration")) {
    // If we just logged in, try to rehydrate a device instead of using a
    // new device.  If it succeeds, we'll get a new device ID, so make sure
    // we persist that ID to localStorage
    const newDeviceId = await client.rehydrateDevice();

    if (newDeviceId) {
      credentials.deviceId = newDeviceId;
    }

    delete credentials.freshLogin;
  }

  if (localStorage) {
    try {
      await persistCredentials(credentials); // make sure we don't think that it's a fresh login any more

      sessionStorage.removeItem("mx_fresh_login");
    } catch (e) {
      _logger.logger.warn("Error using local storage: can't persist session!", e);
    }
  } else {
    _logger.logger.warn("No local storage available: can't persist session!");
  }

  _dispatcher.default.fire(_actions.Action.OnLoggedIn);

  await startMatrixClient(
  /*startSyncing=*/
  !softLogout);
  return client;
}

function showStorageEvictedDialog() {
  return new Promise(resolve => {
    _Modal.default.createDialog(_StorageEvictedDialog.default, {
      onFinished: resolve
    });
  });
} // Note: Babel 6 requires the `transform-builtin-extend` plugin for this to satisfy
// `instanceof`. Babel 7 supports this natively in their class handling.


class AbortLoginAndRebuildStorage extends Error {}

async function persistCredentials(credentials) {
  localStorage.setItem(HOMESERVER_URL_KEY, credentials.homeserverUrl);

  if (credentials.identityServerUrl) {
    localStorage.setItem(ID_SERVER_URL_KEY, credentials.identityServerUrl);
  }

  localStorage.setItem("mx_user_id", credentials.userId);
  localStorage.setItem("mx_is_guest", JSON.stringify(credentials.guest)); // store whether we expect to find an access token, to detect the case
  // where IndexedDB is blown away

  if (credentials.accessToken) {
    localStorage.setItem("mx_has_access_token", "true");
  } else {
    localStorage.deleteItem("mx_has_access_token");
  }

  if (credentials.pickleKey) {
    let encryptedAccessToken;

    try {
      // try to encrypt the access token using the pickle key
      const encrKey = await pickleKeyToAesKey(credentials.pickleKey);
      encryptedAccessToken = await (0, _aes.encryptAES)(credentials.accessToken, encrKey, "access_token");
      encrKey.fill(0);
    } catch (e) {
      _logger.logger.warn("Could not encrypt access token", e);
    }

    try {
      // save either the encrypted access token, or the plain access
      // token if we were unable to encrypt (e.g. if the browser doesn't
      // have WebCrypto).
      await StorageManager.idbSave("account", "mx_access_token", encryptedAccessToken || credentials.accessToken);
    } catch (e) {
      // if we couldn't save to indexedDB, fall back to localStorage.  We
      // store the access token unencrypted since localStorage only saves
      // strings.
      localStorage.setItem("mx_access_token", credentials.accessToken);
    }

    localStorage.setItem("mx_has_pickle_key", String(true));
  } else {
    try {
      await StorageManager.idbSave("account", "mx_access_token", credentials.accessToken);
    } catch (e) {
      localStorage.setItem("mx_access_token", credentials.accessToken);
    }

    if (localStorage.getItem("mx_has_pickle_key")) {
      _logger.logger.error("Expected a pickle key, but none provided.  Encryption may not work.");
    }
  } // if we didn't get a deviceId from the login, leave mx_device_id unset,
  // rather than setting it to "undefined".
  //
  // (in this case MatrixClient doesn't bother with the crypto stuff
  // - that's fine for us).


  if (credentials.deviceId) {
    localStorage.setItem("mx_device_id", credentials.deviceId);
  }

  _Security.default.persistCredentials?.(credentials);

  _logger.logger.log(`Session persisted for ${credentials.userId}`);
}

let _isLoggingOut = false;
/**
 * Logs the current session out and transitions to the logged-out state
 */

function logout() {
  if (!_MatrixClientPeg.MatrixClientPeg.get()) return;

  _PosthogAnalytics.PosthogAnalytics.instance.logout();

  if (_MatrixClientPeg.MatrixClientPeg.get().isGuest()) {
    // logout doesn't work for guest sessions
    // Also we sometimes want to re-log in a guest session if we abort the login.
    // defer until next tick because it calls a synchronous dispatch, and we are likely here from a dispatch.
    setImmediate(() => onLoggedOut());
    return;
  }

  _isLoggingOut = true;

  const client = _MatrixClientPeg.MatrixClientPeg.get();

  _PlatformPeg.default.get().destroyPickleKey(client.getUserId(), client.getDeviceId());

  client.logout(undefined, true).then(onLoggedOut, err => {
    // Just throwing an error here is going to be very unhelpful
    // if you're trying to log out because your server's down and
    // you want to log into a different server, so just forget the
    // access token. It's annoying that this will leave the access
    // token still valid, but we should fix this by having access
    // tokens expire (and if you really think you've been compromised,
    // change your password).
    _logger.logger.warn("Failed to call logout API: token will not be invalidated", err);

    onLoggedOut();
  });
}

function softLogout() {
  if (!_MatrixClientPeg.MatrixClientPeg.get()) return; // Track that we've detected and trapped a soft logout. This helps prevent other
  // parts of the app from starting if there's no point (ie: don't sync if we've
  // been soft logged out, despite having credentials and data for a MatrixClient).

  localStorage.setItem("mx_soft_logout", "true"); // Dev note: please keep this log line around. It can be useful for track down
  // random clients stopping in the middle of the logs.

  _logger.logger.log("Soft logout initiated");

  _isLoggingOut = true; // to avoid repeated flags
  // Ensure that we dispatch a view change **before** stopping the client so
  // so that React components unmount first. This avoids React soft crashes
  // that can occur when components try to use a null client.

  _dispatcher.default.dispatch({
    action: 'on_client_not_viable'
  }); // generic version of on_logged_out


  stopMatrixClient(
  /*unsetClient=*/
  false); // DO NOT CALL LOGOUT. A soft logout preserves data, logout does not.
}

function isSoftLogout() {
  return localStorage.getItem("mx_soft_logout") === "true";
}

function isLoggingOut() {
  return _isLoggingOut;
}
/**
 * Starts the matrix client and all other react-sdk services that
 * listen for events while a session is logged in.
 * @param {boolean} startSyncing True (default) to actually start
 * syncing the client.
 */


async function startMatrixClient() {
  let startSyncing = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

  _logger.logger.log(`Lifecycle: Starting MatrixClient`); // dispatch this before starting the matrix client: it's used
  // to add listeners for the 'sync' event so otherwise we'd have
  // a race condition (and we need to dispatch synchronously for this
  // to work).


  _dispatcher.default.dispatch({
    action: 'will_start_client'
  }, true); // reset things first just in case


  _TypingStore.default.sharedInstance().reset();

  _ToastStore.default.sharedInstance().reset();

  _DialogOpener.DialogOpener.instance.prepare();

  _Notifier.default.start();

  _UserActivity.default.sharedInstance().start();

  _DMRoomMap.default.makeShared().start();

  _IntegrationManagers.IntegrationManagers.sharedInstance().startWatching();

  _ActiveWidgetStore.default.instance.start();

  _LegacyCallHandler.default.instance.start(); // Start Mjolnir even though we haven't checked the feature flag yet. Starting
  // the thing just wastes CPU cycles, but should result in no actual functionality
  // being exposed to the user.


  _Mjolnir.Mjolnir.sharedInstance().start();

  if (startSyncing) {
    // The client might want to populate some views with events from the
    // index (e.g. the FilePanel), therefore initialize the event index
    // before the client.
    await _EventIndexPeg.default.init();
    await _MatrixClientPeg.MatrixClientPeg.start();
  } else {
    _logger.logger.warn("Caller requested only auxiliary services be started");

    await _MatrixClientPeg.MatrixClientPeg.assign();
  } // Run the migrations after the MatrixClientPeg has been assigned


  _SettingsStore.default.runMigrations(); // This needs to be started after crypto is set up


  _DeviceListener.default.sharedInstance().start(); // Similarly, don't start sending presence updates until we've started
  // the client


  if (!_SettingsStore.default.getValue("lowBandwidth")) {
    _Presence.default.start();
  } // Now that we have a MatrixClientPeg, update the Jitsi info


  _Jitsi.Jitsi.getInstance().start(); // dispatch that we finished starting up to wire up any other bits
  // of the matrix client that cannot be set prior to starting up.


  _dispatcher.default.dispatch({
    action: 'client_started'
  });

  if (isSoftLogout()) {
    softLogout();
  }
}
/*
 * Stops a running client and all related services, and clears persistent
 * storage. Used after a session has been logged out.
 */


async function onLoggedOut() {
  // Ensure that we dispatch a view change **before** stopping the client,
  // that React components unmount first. This avoids React soft crashes
  // that can occur when components try to use a null client.
  _dispatcher.default.fire(_actions.Action.OnLoggedOut, true);

  stopMatrixClient();
  await clearStorage({
    deleteEverything: true
  });
  _Lifecycle.default.onLoggedOutAndStorageCleared?.(); // Do this last, so we can make sure all storage has been cleared and all
  // customisations got the memo.

  if (_SdkConfig.default.get().logout_redirect_url) {
    _logger.logger.log("Redirecting to external provider to finish logout"); // XXX: Defer this so that it doesn't race with MatrixChat unmounting the world by going to /#/login


    setTimeout(() => {
      window.location.href = _SdkConfig.default.get().logout_redirect_url;
    }, 100);
  } // Do this last to prevent racing `stopMatrixClient` and `on_logged_out` with MatrixChat handling Session.logged_out


  _isLoggingOut = false;
}
/**
 * @param {object} opts Options for how to clear storage.
 * @returns {Promise} promise which resolves once the stores have been cleared
 */


async function clearStorage(opts) {
  if (window.localStorage) {
    // try to save any 3pid invites from being obliterated and registration time
    const pendingInvites = _ThreepidInviteStore.default.instance.getWireInvites();

    const registrationTime = window.localStorage.getItem("mx_registration_time");
    window.localStorage.clear();

    _AbstractLocalStorageSettingsHandler.default.clear();

    try {
      await StorageManager.idbDelete("account", "mx_access_token");
    } catch (e) {
      _logger.logger.error("idbDelete failed for account:mx_access_token", e);
    } // now restore those invites and registration time


    if (!opts?.deleteEverything) {
      pendingInvites.forEach(i => {
        const roomId = i.roomId;
        delete i.roomId; // delete to avoid confusing the store

        _ThreepidInviteStore.default.instance.storeInvite(roomId, i);
      });

      if (registrationTime) {
        window.localStorage.setItem("mx_registration_time", registrationTime);
      }
    }
  }

  window.sessionStorage?.clear(); // create a temporary client to clear out the persistent stores.

  const cli = (0, _createMatrixClient.default)({
    // we'll never make any requests, so can pass a bogus HS URL
    baseUrl: ""
  });
  await _EventIndexPeg.default.deleteEventIndex();
  await cli.clearStores();
}
/**
 * Stop all the background processes related to the current client.
 * @param {boolean} unsetClient True (default) to abandon the client
 * on MatrixClientPeg after stopping.
 */


function stopMatrixClient() {
  let unsetClient = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

  _Notifier.default.stop();

  _LegacyCallHandler.default.instance.stop();

  _UserActivity.default.sharedInstance().stop();

  _TypingStore.default.sharedInstance().reset();

  _Presence.default.stop();

  _ActiveWidgetStore.default.instance.stop();

  _IntegrationManagers.IntegrationManagers.sharedInstance().stopWatching();

  _Mjolnir.Mjolnir.sharedInstance().stop();

  _DeviceListener.default.sharedInstance().stop();

  _DMRoomMap.default.shared()?.stop();

  _EventIndexPeg.default.stop();

  const cli = _MatrixClientPeg.MatrixClientPeg.get();

  if (cli) {
    cli.stopClient();
    cli.removeAllListeners();

    if (unsetClient) {
      _MatrixClientPeg.MatrixClientPeg.unset();

      _EventIndexPeg.default.unset();
    }
  }
} // Utility method to perform a login with an existing access_token


window.mxLoginWithAccessToken = async (hsUrl, accessToken) => {
  const tempClient = (0, _matrix.createClient)({
    baseUrl: hsUrl,
    accessToken
  });
  const {
    user_id: userId
  } = await tempClient.whoami();
  await doSetLoggedIn({
    homeserverUrl: hsUrl,
    accessToken,
    userId
  }, true);
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJIT01FU0VSVkVSX1VSTF9LRVkiLCJJRF9TRVJWRVJfVVJMX0tFWSIsImRpcyIsInJlZ2lzdGVyIiwicGF5bG9hZCIsImFjdGlvbiIsIkFjdGlvbiIsIlRyaWdnZXJMb2dvdXQiLCJvbkxvZ2dlZE91dCIsIk92ZXJ3cml0ZUxvZ2luIiwidHlwZWQiLCJkb1NldExvZ2dlZEluIiwiY3JlZGVudGlhbHMiLCJsb2FkU2Vzc2lvbiIsIm9wdHMiLCJlbmFibGVHdWVzdCIsImd1ZXN0SHNVcmwiLCJndWVzdElzVXJsIiwiZnJhZ21lbnRRdWVyeVBhcmFtcyIsImRlZmF1bHREZXZpY2VEaXNwbGF5TmFtZSIsImxvZ2dlciIsIndhcm4iLCJndWVzdF91c2VyX2lkIiwiZ3Vlc3RfYWNjZXNzX3Rva2VuIiwibG9nIiwidXNlcklkIiwiYWNjZXNzVG9rZW4iLCJob21lc2VydmVyVXJsIiwiaWRlbnRpdHlTZXJ2ZXJVcmwiLCJndWVzdCIsInRoZW4iLCJzdWNjZXNzIiwicmVzdG9yZUZyb21Mb2NhbFN0b3JhZ2UiLCJpZ25vcmVHdWVzdCIsIkJvb2xlYW4iLCJyZWdpc3RlckFzR3Vlc3QiLCJlIiwiQWJvcnRMb2dpbkFuZFJlYnVpbGRTdG9yYWdlIiwiaGFuZGxlTG9hZFNlc3Npb25GYWlsdXJlIiwiZ2V0U3RvcmVkU2Vzc2lvbk93bmVyIiwiaHNVcmwiLCJoYXNBY2Nlc3NUb2tlbiIsImlzR3Vlc3QiLCJnZXRTdG9yZWRTZXNzaW9uVmFycyIsImF0dGVtcHRUb2tlbkxvZ2luIiwicXVlcnlQYXJhbXMiLCJmcmFnbWVudEFmdGVyTG9naW4iLCJsb2dpblRva2VuIiwiUHJvbWlzZSIsInJlc29sdmUiLCJob21lc2VydmVyIiwibG9jYWxTdG9yYWdlIiwiZ2V0SXRlbSIsIlNTT19IT01FU0VSVkVSX1VSTF9LRVkiLCJpZGVudGl0eVNlcnZlciIsIlNTT19JRF9TRVJWRVJfVVJMX0tFWSIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwiRXJyb3JEaWFsb2ciLCJ0aXRsZSIsIl90IiwiZGVzY3JpcHRpb24iLCJidXR0b24iLCJzZW5kTG9naW5SZXF1ZXN0IiwidG9rZW4iLCJpbml0aWFsX2RldmljZV9kaXNwbGF5X25hbWUiLCJjcmVkcyIsImNsZWFyU3RvcmFnZSIsInBlcnNpc3RDcmVkZW50aWFscyIsInNlc3Npb25TdG9yYWdlIiwic2V0SXRlbSIsIlN0cmluZyIsImNhdGNoIiwiZXJyIiwibmFtZSIsIm9uRmluaXNoZWQiLCJ0cnlBZ2FpbiIsImNsaSIsImNyZWF0ZUNsaWVudCIsImJhc2VVcmwiLCJpZEJhc2VVcmwiLCJpZHBJZCIsIlNTT19JRFBfSURfS0VZIiwidW5kZWZpbmVkIiwiUGxhdGZvcm1QZWciLCJnZXQiLCJzdGFydFNpbmdsZVNpZ25PbiIsImVycm9yIiwiaGFuZGxlSW52YWxpZFN0b3JlRXJyb3IiLCJyZWFzb24iLCJJbnZhbGlkU3RvcmVFcnJvciIsIlRPR0dMRURfTEFaWV9MT0FESU5HIiwibGF6eUxvYWRFbmFibGVkIiwidmFsdWUiLCJMYXp5TG9hZGluZ1Jlc3luY0RpYWxvZyIsIkxhenlMb2FkaW5nRGlzYWJsZWREaWFsb2ciLCJob3N0Iiwid2luZG93IiwibG9jYXRpb24iLCJNYXRyaXhDbGllbnRQZWciLCJzdG9yZSIsImRlbGV0ZUFsbERhdGEiLCJyZWxvYWQiLCJpc1VybCIsImNsaWVudCIsInJlZ2lzdGVyR3Vlc3QiLCJib2R5IiwidXNlcl9pZCIsImRldmljZUlkIiwiZGV2aWNlX2lkIiwiYWNjZXNzX3Rva2VuIiwiU3RvcmFnZU1hbmFnZXIiLCJpZGJMb2FkIiwiaWRiU2F2ZSIsInJlbW92ZUl0ZW0iLCJwaWNrbGVLZXlUb0Flc0tleSIsInBpY2tsZUtleSIsInBpY2tsZUtleUJ1ZmZlciIsIlVpbnQ4QXJyYXkiLCJsZW5ndGgiLCJpIiwiY2hhckNvZGVBdCIsImhrZGZLZXkiLCJjcnlwdG8iLCJzdWJ0bGUiLCJpbXBvcnRLZXkiLCJmaWxsIiwiZGVyaXZlQml0cyIsImhhc2giLCJzYWx0IiwiaW5mbyIsImFib3J0TG9naW4iLCJzaWduT3V0Iiwic2hvd1N0b3JhZ2VFdmljdGVkRGlhbG9nIiwiZGVjcnlwdGVkQWNjZXNzVG9rZW4iLCJnZXRQaWNrbGVLZXkiLCJlbmNyS2V5IiwiZGVjcnlwdEFFUyIsImZyZXNoTG9naW4iLCJtb2RhbCIsIlNlc3Npb25SZXN0b3JlRXJyb3JEaWFsb2ciLCJmaW5pc2hlZCIsInNldExvZ2dlZEluIiwic3RvcE1hdHJpeENsaWVudCIsImNyZWF0ZVBpY2tsZUtleSIsIk9iamVjdCIsImFzc2lnbiIsImh5ZHJhdGVTZXNzaW9uIiwib2xkVXNlcklkIiwiZ2V0VXNlcklkIiwib2xkRGV2aWNlSWQiLCJnZXREZXZpY2VJZCIsIl9pc0xvZ2dpbmdPdXQiLCJvdmVyd3JpdGUiLCJjbGVhclN0b3JhZ2VFbmFibGVkIiwic29mdExvZ291dCIsImlzU29mdExvZ291dCIsImRpc3BhdGNoIiwicmVzdWx0cyIsImNoZWNrQ29uc2lzdGVuY3kiLCJkYXRhSW5Mb2NhbFN0b3JhZ2UiLCJjcnlwdG9Jbml0ZWQiLCJkYXRhSW5DcnlwdG9TdG9yZSIsInJlcGxhY2VVc2luZ0NyZWRzIiwic2V0U2VudHJ5VXNlciIsIlBvc3Rob2dBbmFseXRpY3MiLCJpbnN0YW5jZSIsImlzRW5hYmxlZCIsInN0YXJ0TGlzdGVuaW5nVG9TZXR0aW5nc0NoYW5nZXMiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJuZXdEZXZpY2VJZCIsInJlaHlkcmF0ZURldmljZSIsImZpcmUiLCJPbkxvZ2dlZEluIiwic3RhcnRNYXRyaXhDbGllbnQiLCJTdG9yYWdlRXZpY3RlZERpYWxvZyIsIkVycm9yIiwiSlNPTiIsInN0cmluZ2lmeSIsImRlbGV0ZUl0ZW0iLCJlbmNyeXB0ZWRBY2Nlc3NUb2tlbiIsImVuY3J5cHRBRVMiLCJTZWN1cml0eUN1c3RvbWlzYXRpb25zIiwibG9nb3V0Iiwic2V0SW1tZWRpYXRlIiwiZGVzdHJveVBpY2tsZUtleSIsImlzTG9nZ2luZ091dCIsInN0YXJ0U3luY2luZyIsIlR5cGluZ1N0b3JlIiwic2hhcmVkSW5zdGFuY2UiLCJyZXNldCIsIlRvYXN0U3RvcmUiLCJEaWFsb2dPcGVuZXIiLCJwcmVwYXJlIiwiTm90aWZpZXIiLCJzdGFydCIsIlVzZXJBY3Rpdml0eSIsIkRNUm9vbU1hcCIsIm1ha2VTaGFyZWQiLCJJbnRlZ3JhdGlvbk1hbmFnZXJzIiwic3RhcnRXYXRjaGluZyIsIkFjdGl2ZVdpZGdldFN0b3JlIiwiTGVnYWN5Q2FsbEhhbmRsZXIiLCJNam9sbmlyIiwiRXZlbnRJbmRleFBlZyIsImluaXQiLCJydW5NaWdyYXRpb25zIiwiRGV2aWNlTGlzdGVuZXIiLCJQcmVzZW5jZSIsIkppdHNpIiwiZ2V0SW5zdGFuY2UiLCJPbkxvZ2dlZE91dCIsImRlbGV0ZUV2ZXJ5dGhpbmciLCJMaWZlY3ljbGVDdXN0b21pc2F0aW9ucyIsIm9uTG9nZ2VkT3V0QW5kU3RvcmFnZUNsZWFyZWQiLCJTZGtDb25maWciLCJsb2dvdXRfcmVkaXJlY3RfdXJsIiwic2V0VGltZW91dCIsImhyZWYiLCJwZW5kaW5nSW52aXRlcyIsIlRocmVlcGlkSW52aXRlU3RvcmUiLCJnZXRXaXJlSW52aXRlcyIsInJlZ2lzdHJhdGlvblRpbWUiLCJjbGVhciIsIkFic3RyYWN0TG9jYWxTdG9yYWdlU2V0dGluZ3NIYW5kbGVyIiwiaWRiRGVsZXRlIiwiZm9yRWFjaCIsInJvb21JZCIsInN0b3JlSW52aXRlIiwiY3JlYXRlTWF0cml4Q2xpZW50IiwiZGVsZXRlRXZlbnRJbmRleCIsImNsZWFyU3RvcmVzIiwidW5zZXRDbGllbnQiLCJzdG9wIiwic3RvcFdhdGNoaW5nIiwic2hhcmVkIiwic3RvcENsaWVudCIsInJlbW92ZUFsbExpc3RlbmVycyIsInVuc2V0IiwibXhMb2dpbldpdGhBY2Nlc3NUb2tlbiIsInRlbXBDbGllbnQiLCJ3aG9hbWkiXSwic291cmNlcyI6WyIuLi9zcmMvTGlmZWN5Y2xlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTcgVmVjdG9yIENyZWF0aW9ucyBMdGRcbkNvcHlyaWdodCAyMDE4IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSwgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL21hdHJpeCc7XG5pbXBvcnQgeyBJbnZhbGlkU3RvcmVFcnJvciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9lcnJvcnNcIjtcbmltcG9ydCB7IE1hdHJpeENsaWVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jbGllbnRcIjtcbmltcG9ydCB7IGRlY3J5cHRBRVMsIGVuY3J5cHRBRVMsIElFbmNyeXB0ZWRQYXlsb2FkIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NyeXB0by9hZXNcIjtcbmltcG9ydCB7IFF1ZXJ5RGljdCB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL3V0aWxzJztcbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcblxuaW1wb3J0IHsgSU1hdHJpeENsaWVudENyZWRzLCBNYXRyaXhDbGllbnRQZWcgfSBmcm9tICcuL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgU2VjdXJpdHlDdXN0b21pc2F0aW9ucyBmcm9tIFwiLi9jdXN0b21pc2F0aW9ucy9TZWN1cml0eVwiO1xuaW1wb3J0IEV2ZW50SW5kZXhQZWcgZnJvbSAnLi9pbmRleGluZy9FdmVudEluZGV4UGVnJztcbmltcG9ydCBjcmVhdGVNYXRyaXhDbGllbnQgZnJvbSAnLi91dGlscy9jcmVhdGVNYXRyaXhDbGllbnQnO1xuaW1wb3J0IE5vdGlmaWVyIGZyb20gJy4vTm90aWZpZXInO1xuaW1wb3J0IFVzZXJBY3Rpdml0eSBmcm9tICcuL1VzZXJBY3Rpdml0eSc7XG5pbXBvcnQgUHJlc2VuY2UgZnJvbSAnLi9QcmVzZW5jZSc7XG5pbXBvcnQgZGlzIGZyb20gJy4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCBETVJvb21NYXAgZnJvbSAnLi91dGlscy9ETVJvb21NYXAnO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4vTW9kYWwnO1xuaW1wb3J0IEFjdGl2ZVdpZGdldFN0b3JlIGZyb20gJy4vc3RvcmVzL0FjdGl2ZVdpZGdldFN0b3JlJztcbmltcG9ydCBQbGF0Zm9ybVBlZyBmcm9tIFwiLi9QbGF0Zm9ybVBlZ1wiO1xuaW1wb3J0IHsgc2VuZExvZ2luUmVxdWVzdCB9IGZyb20gXCIuL0xvZ2luXCI7XG5pbXBvcnQgKiBhcyBTdG9yYWdlTWFuYWdlciBmcm9tICcuL3V0aWxzL1N0b3JhZ2VNYW5hZ2VyJztcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCBUeXBpbmdTdG9yZSBmcm9tIFwiLi9zdG9yZXMvVHlwaW5nU3RvcmVcIjtcbmltcG9ydCBUb2FzdFN0b3JlIGZyb20gXCIuL3N0b3Jlcy9Ub2FzdFN0b3JlXCI7XG5pbXBvcnQgeyBJbnRlZ3JhdGlvbk1hbmFnZXJzIH0gZnJvbSBcIi4vaW50ZWdyYXRpb25zL0ludGVncmF0aW9uTWFuYWdlcnNcIjtcbmltcG9ydCB7IE1qb2xuaXIgfSBmcm9tIFwiLi9tam9sbmlyL01qb2xuaXJcIjtcbmltcG9ydCBEZXZpY2VMaXN0ZW5lciBmcm9tIFwiLi9EZXZpY2VMaXN0ZW5lclwiO1xuaW1wb3J0IHsgSml0c2kgfSBmcm9tIFwiLi93aWRnZXRzL0ppdHNpXCI7XG5pbXBvcnQgeyBTU09fSE9NRVNFUlZFUl9VUkxfS0VZLCBTU09fSURfU0VSVkVSX1VSTF9LRVksIFNTT19JRFBfSURfS0VZIH0gZnJvbSBcIi4vQmFzZVBsYXRmb3JtXCI7XG5pbXBvcnQgVGhyZWVwaWRJbnZpdGVTdG9yZSBmcm9tIFwiLi9zdG9yZXMvVGhyZWVwaWRJbnZpdGVTdG9yZVwiO1xuaW1wb3J0IHsgUG9zdGhvZ0FuYWx5dGljcyB9IGZyb20gXCIuL1Bvc3Rob2dBbmFseXRpY3NcIjtcbmltcG9ydCBMZWdhY3lDYWxsSGFuZGxlciBmcm9tICcuL0xlZ2FjeUNhbGxIYW5kbGVyJztcbmltcG9ydCBMaWZlY3ljbGVDdXN0b21pc2F0aW9ucyBmcm9tIFwiLi9jdXN0b21pc2F0aW9ucy9MaWZlY3ljbGVcIjtcbmltcG9ydCBFcnJvckRpYWxvZyBmcm9tIFwiLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvRXJyb3JEaWFsb2dcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgTGF6eUxvYWRpbmdSZXN5bmNEaWFsb2cgZnJvbSBcIi4vY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL0xhenlMb2FkaW5nUmVzeW5jRGlhbG9nXCI7XG5pbXBvcnQgTGF6eUxvYWRpbmdEaXNhYmxlZERpYWxvZyBmcm9tIFwiLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvTGF6eUxvYWRpbmdEaXNhYmxlZERpYWxvZ1wiO1xuaW1wb3J0IFNlc3Npb25SZXN0b3JlRXJyb3JEaWFsb2cgZnJvbSBcIi4vY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL1Nlc3Npb25SZXN0b3JlRXJyb3JEaWFsb2dcIjtcbmltcG9ydCBTdG9yYWdlRXZpY3RlZERpYWxvZyBmcm9tIFwiLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvU3RvcmFnZUV2aWN0ZWREaWFsb2dcIjtcbmltcG9ydCB7IHNldFNlbnRyeVVzZXIgfSBmcm9tIFwiLi9zZW50cnlcIjtcbmltcG9ydCBTZGtDb25maWcgZnJvbSBcIi4vU2RrQ29uZmlnXCI7XG5pbXBvcnQgeyBEaWFsb2dPcGVuZXIgfSBmcm9tIFwiLi91dGlscy9EaWFsb2dPcGVuZXJcIjtcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gXCIuL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IEFic3RyYWN0TG9jYWxTdG9yYWdlU2V0dGluZ3NIYW5kbGVyIGZyb20gXCIuL3NldHRpbmdzL2hhbmRsZXJzL0Fic3RyYWN0TG9jYWxTdG9yYWdlU2V0dGluZ3NIYW5kbGVyXCI7XG5pbXBvcnQgeyBPdmVyd3JpdGVMb2dpblBheWxvYWQgfSBmcm9tIFwiLi9kaXNwYXRjaGVyL3BheWxvYWRzL092ZXJ3cml0ZUxvZ2luUGF5bG9hZFwiO1xuXG5jb25zdCBIT01FU0VSVkVSX1VSTF9LRVkgPSBcIm14X2hzX3VybFwiO1xuY29uc3QgSURfU0VSVkVSX1VSTF9LRVkgPSBcIm14X2lzX3VybFwiO1xuXG5kaXMucmVnaXN0ZXIoKHBheWxvYWQpID0+IHtcbiAgICBpZiAocGF5bG9hZC5hY3Rpb24gPT09IEFjdGlvbi5UcmlnZ2VyTG9nb3V0KSB7XG4gICAgICAgIC8vIG5vaW5zcGVjdGlvbiBKU0lnbm9yZWRQcm9taXNlRnJvbUNhbGwgLSB3ZSBkb24ndCBjYXJlIGlmIGl0IGZhaWxzXG4gICAgICAgIG9uTG9nZ2VkT3V0KCk7XG4gICAgfSBlbHNlIGlmIChwYXlsb2FkLmFjdGlvbiA9PT0gQWN0aW9uLk92ZXJ3cml0ZUxvZ2luKSB7XG4gICAgICAgIGNvbnN0IHR5cGVkID0gPE92ZXJ3cml0ZUxvZ2luUGF5bG9hZD5wYXlsb2FkO1xuICAgICAgICAvLyBub2luc3BlY3Rpb24gSlNJZ25vcmVkUHJvbWlzZUZyb21DYWxsIC0gd2UgZG9uJ3QgY2FyZSBpZiBpdCBmYWlsc1xuICAgICAgICBkb1NldExvZ2dlZEluKHR5cGVkLmNyZWRlbnRpYWxzLCB0cnVlKTtcbiAgICB9XG59KTtcblxuaW50ZXJmYWNlIElMb2FkU2Vzc2lvbk9wdHMge1xuICAgIGVuYWJsZUd1ZXN0PzogYm9vbGVhbjtcbiAgICBndWVzdEhzVXJsPzogc3RyaW5nO1xuICAgIGd1ZXN0SXNVcmw/OiBzdHJpbmc7XG4gICAgaWdub3JlR3Vlc3Q/OiBib29sZWFuO1xuICAgIGRlZmF1bHREZXZpY2VEaXNwbGF5TmFtZT86IHN0cmluZztcbiAgICBmcmFnbWVudFF1ZXJ5UGFyYW1zPzogUXVlcnlEaWN0O1xufVxuXG4vKipcbiAqIENhbGxlZCBhdCBzdGFydHVwLCB0byBhdHRlbXB0IHRvIGJ1aWxkIGEgbG9nZ2VkLWluIE1hdHJpeCBzZXNzaW9uLiBJdCB0cmllc1xuICogYSBudW1iZXIgb2YgdGhpbmdzOlxuICpcbiAqIDEuIGlmIHdlIGhhdmUgYSBndWVzdCBhY2Nlc3MgdG9rZW4gaW4gdGhlIGZyYWdtZW50IHF1ZXJ5IHBhcmFtcywgaXQgdXNlc1xuICogICAgdGhhdC5cbiAqIDIuIGlmIGFuIGFjY2VzcyB0b2tlbiBpcyBzdG9yZWQgaW4gbG9jYWwgc3RvcmFnZSAoZnJvbSBhIHByZXZpb3VzIHNlc3Npb24pLFxuICogICAgaXQgdXNlcyB0aGF0LlxuICogMy4gaXQgYXR0ZW1wdHMgdG8gYXV0by1yZWdpc3RlciBhcyBhIGd1ZXN0IHVzZXIuXG4gKlxuICogSWYgYW55IG9mIHN0ZXBzIDEtNCBhcmUgc3VjY2Vzc2Z1bCwgaXQgd2lsbCBjYWxsIHtfZG9TZXRMb2dnZWRJbn0sIHdoaWNoIGluXG4gKiB0dXJuIHdpbGwgcmFpc2Ugb25fbG9nZ2VkX2luIGFuZCB3aWxsX3N0YXJ0X2NsaWVudCBldmVudHMuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IFtvcHRzXVxuICogQHBhcmFtIHtvYmplY3R9IFtvcHRzLmZyYWdtZW50UXVlcnlQYXJhbXNdOiBzdHJpbmctPnN0cmluZyBtYXAgb2YgdGhlXG4gKiAgICAgcXVlcnktcGFyYW1ldGVycyBleHRyYWN0ZWQgZnJvbSB0aGUgIy1mcmFnbWVudCBvZiB0aGUgc3RhcnRpbmcgVVJJLlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0cy5lbmFibGVHdWVzdF06IHNldCB0byB0cnVlIHRvIGVuYWJsZSBndWVzdCBhY2Nlc3NcbiAqICAgICB0b2tlbnMgYW5kIGF1dG8tZ3Vlc3QgcmVnaXN0cmF0aW9ucy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0cy5ndWVzdEhzVXJsXTogaG9tZXNlcnZlciBVUkwuIE9ubHkgdXNlZCBpZiBlbmFibGVHdWVzdFxuICogICAgIGlzIHRydWU7IGRlZmluZXMgdGhlIEhTIHRvIHJlZ2lzdGVyIGFnYWluc3QuXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdHMuZ3Vlc3RJc1VybF06IGhvbWVzZXJ2ZXIgVVJMLiBPbmx5IHVzZWQgaWYgZW5hYmxlR3Vlc3RcbiAqICAgICBpcyB0cnVlOyBkZWZpbmVzIHRoZSBJUyB0byB1c2UuXG4gKiBAcGFyYW0ge2Jvb2x9IFtvcHRzLmlnbm9yZUd1ZXN0XTogSWYgdGhlIHN0b3JlZCBzZXNzaW9uIGlzIGEgZ3Vlc3QgYWNjb3VudCxcbiAqICAgICBpZ25vcmUgaXQgYW5kIGRvbid0IGxvYWQgaXQuXG4gKiBAcGFyYW0ge3N0cmluZ30gW29wdHMuZGVmYXVsdERldmljZURpc3BsYXlOYW1lXTogRGVmYXVsdCBkaXNwbGF5IG5hbWUgdG8gdXNlXG4gKiAgICAgd2hlbiByZWdpc3RlcmluZyBhcyBhIGd1ZXN0LlxuICogQHJldHVybnMge1Byb21pc2V9IGEgcHJvbWlzZSB3aGljaCByZXNvbHZlcyB3aGVuIHRoZSBhYm92ZSBwcm9jZXNzIGNvbXBsZXRlcy5cbiAqICAgICBSZXNvbHZlcyB0byBgdHJ1ZWAgaWYgd2UgZW5kZWQgdXAgc3RhcnRpbmcgYSBzZXNzaW9uLCBvciBgZmFsc2VgIGlmIHdlXG4gKiAgICAgZmFpbGVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZFNlc3Npb24ob3B0czogSUxvYWRTZXNzaW9uT3B0cyA9IHt9KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdHJ5IHtcbiAgICAgICAgbGV0IGVuYWJsZUd1ZXN0ID0gb3B0cy5lbmFibGVHdWVzdCB8fCBmYWxzZTtcbiAgICAgICAgY29uc3QgZ3Vlc3RIc1VybCA9IG9wdHMuZ3Vlc3RIc1VybDtcbiAgICAgICAgY29uc3QgZ3Vlc3RJc1VybCA9IG9wdHMuZ3Vlc3RJc1VybDtcbiAgICAgICAgY29uc3QgZnJhZ21lbnRRdWVyeVBhcmFtcyA9IG9wdHMuZnJhZ21lbnRRdWVyeVBhcmFtcyB8fCB7fTtcbiAgICAgICAgY29uc3QgZGVmYXVsdERldmljZURpc3BsYXlOYW1lID0gb3B0cy5kZWZhdWx0RGV2aWNlRGlzcGxheU5hbWU7XG5cbiAgICAgICAgaWYgKGVuYWJsZUd1ZXN0ICYmICFndWVzdEhzVXJsKSB7XG4gICAgICAgICAgICBsb2dnZXIud2FybihcIkNhbm5vdCBlbmFibGUgZ3Vlc3QgYWNjZXNzOiBjYW4ndCBkZXRlcm1pbmUgSFMgVVJMIHRvIHVzZVwiKTtcbiAgICAgICAgICAgIGVuYWJsZUd1ZXN0ID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXG4gICAgICAgICAgICBlbmFibGVHdWVzdCAmJlxuICAgICAgICAgICAgZnJhZ21lbnRRdWVyeVBhcmFtcy5ndWVzdF91c2VyX2lkICYmXG4gICAgICAgICAgICBmcmFnbWVudFF1ZXJ5UGFyYW1zLmd1ZXN0X2FjY2Vzc190b2tlblxuICAgICAgICApIHtcbiAgICAgICAgICAgIGxvZ2dlci5sb2coXCJVc2luZyBndWVzdCBhY2Nlc3MgY3JlZGVudGlhbHNcIik7XG4gICAgICAgICAgICByZXR1cm4gZG9TZXRMb2dnZWRJbih7XG4gICAgICAgICAgICAgICAgdXNlcklkOiBmcmFnbWVudFF1ZXJ5UGFyYW1zLmd1ZXN0X3VzZXJfaWQgYXMgc3RyaW5nLFxuICAgICAgICAgICAgICAgIGFjY2Vzc1Rva2VuOiBmcmFnbWVudFF1ZXJ5UGFyYW1zLmd1ZXN0X2FjY2Vzc190b2tlbiBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgaG9tZXNlcnZlclVybDogZ3Vlc3RIc1VybCxcbiAgICAgICAgICAgICAgICBpZGVudGl0eVNlcnZlclVybDogZ3Vlc3RJc1VybCxcbiAgICAgICAgICAgICAgICBndWVzdDogdHJ1ZSxcbiAgICAgICAgICAgIH0sIHRydWUpLnRoZW4oKCkgPT4gdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc3VjY2VzcyA9IGF3YWl0IHJlc3RvcmVGcm9tTG9jYWxTdG9yYWdlKHtcbiAgICAgICAgICAgIGlnbm9yZUd1ZXN0OiBCb29sZWFuKG9wdHMuaWdub3JlR3Vlc3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVuYWJsZUd1ZXN0KSB7XG4gICAgICAgICAgICByZXR1cm4gcmVnaXN0ZXJBc0d1ZXN0KGd1ZXN0SHNVcmwsIGd1ZXN0SXNVcmwsIGRlZmF1bHREZXZpY2VEaXNwbGF5TmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBmYWxsIGJhY2sgdG8gd2VsY29tZSBzY3JlZW5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBBYm9ydExvZ2luQW5kUmVidWlsZFN0b3JhZ2UpIHtcbiAgICAgICAgICAgIC8vIElmIHdlJ3JlIGFib3J0aW5nIGxvZ2luIGJlY2F1c2Ugb2YgYSBzdG9yYWdlIGluY29uc2lzdGVuY3ksIHdlIGRvbid0XG4gICAgICAgICAgICAvLyBuZWVkIHRvIHNob3cgdGhlIGdlbmVyYWwgZmFpbHVyZSBkaWFsb2cuIEluc3RlYWQsIGp1c3QgZ28gYmFjayB0byB3ZWxjb21lLlxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoYW5kbGVMb2FkU2Vzc2lvbkZhaWx1cmUoZSk7XG4gICAgfVxufVxuXG4vKipcbiAqIEdldHMgdGhlIHVzZXIgSUQgb2YgdGhlIHBlcnNpc3RlZCBzZXNzaW9uLCBpZiBvbmUgZXhpc3RzLiBUaGlzIGRvZXMgbm90IHZhbGlkYXRlXG4gKiB0aGF0IHRoZSB1c2VyJ3MgY3JlZGVudGlhbHMgc3RpbGwgd29yaywganVzdCB0aGF0IHRoZXkgZXhpc3QgYW5kIHRoYXQgYSB1c2VyIElEXG4gKiBpcyBhc3NvY2lhdGVkIHdpdGggdGhlbS4gVGhlIHNlc3Npb24gaXMgbm90IGxvYWRlZC5cbiAqIEByZXR1cm5zIHtbc3RyaW5nLCBib29sZWFuXX0gVGhlIHBlcnNpc3RlZCBzZXNzaW9uJ3Mgb3duZXIgYW5kIHdoZXRoZXIgdGhlIHN0b3JlZFxuICogICAgIHNlc3Npb24gaXMgZm9yIGEgZ3Vlc3QgdXNlciwgaWYgYW4gb3duZXIgZXhpc3RzLiBJZiB0aGVyZSBpcyBubyBzdG9yZWQgc2Vzc2lvbixcbiAqICAgICByZXR1cm4gW251bGwsIG51bGxdLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0U3RvcmVkU2Vzc2lvbk93bmVyKCk6IFByb21pc2U8W3N0cmluZywgYm9vbGVhbl0+IHtcbiAgICBjb25zdCB7IGhzVXJsLCB1c2VySWQsIGhhc0FjY2Vzc1Rva2VuLCBpc0d1ZXN0IH0gPSBhd2FpdCBnZXRTdG9yZWRTZXNzaW9uVmFycygpO1xuICAgIHJldHVybiBoc1VybCAmJiB1c2VySWQgJiYgaGFzQWNjZXNzVG9rZW4gPyBbdXNlcklkLCBpc0d1ZXN0XSA6IFtudWxsLCBudWxsXTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge09iamVjdH0gcXVlcnlQYXJhbXMgICAgc3RyaW5nLT5zdHJpbmcgbWFwIG9mIHRoZVxuICogICAgIHF1ZXJ5LXBhcmFtZXRlcnMgZXh0cmFjdGVkIGZyb20gdGhlIHJlYWwgcXVlcnktc3RyaW5nIG9mIHRoZSBzdGFydGluZ1xuICogICAgIFVSSS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZGVmYXVsdERldmljZURpc3BsYXlOYW1lXG4gKiBAcGFyYW0ge3N0cmluZ30gZnJhZ21lbnRBZnRlckxvZ2luIHBhdGggdG8gZ28gdG8gYWZ0ZXIgYSBzdWNjZXNzZnVsIGxvZ2luLCBvbmx5IHVzZWQgZm9yIFwiVHJ5IGFnYWluXCJcbiAqXG4gKiBAcmV0dXJucyB7UHJvbWlzZX0gcHJvbWlzZSB3aGljaCByZXNvbHZlcyB0byB0cnVlIGlmIHdlIGNvbXBsZXRlZCB0aGUgdG9rZW5cbiAqICAgIGxvZ2luLCBlbHNlIGZhbHNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhdHRlbXB0VG9rZW5Mb2dpbihcbiAgICBxdWVyeVBhcmFtczogUXVlcnlEaWN0LFxuICAgIGRlZmF1bHREZXZpY2VEaXNwbGF5TmFtZT86IHN0cmluZyxcbiAgICBmcmFnbWVudEFmdGVyTG9naW4/OiBzdHJpbmcsXG4pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBpZiAoIXF1ZXJ5UGFyYW1zLmxvZ2luVG9rZW4pIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSk7XG4gICAgfVxuXG4gICAgY29uc3QgaG9tZXNlcnZlciA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFNTT19IT01FU0VSVkVSX1VSTF9LRVkpO1xuICAgIGNvbnN0IGlkZW50aXR5U2VydmVyID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oU1NPX0lEX1NFUlZFUl9VUkxfS0VZKTtcbiAgICBpZiAoIWhvbWVzZXJ2ZXIpIHtcbiAgICAgICAgbG9nZ2VyLndhcm4oXCJDYW5ub3QgbG9nIGluIHdpdGggdG9rZW46IGNhbid0IGRldGVybWluZSBIUyBVUkwgdG8gdXNlXCIpO1xuICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgIHRpdGxlOiBfdChcIldlIGNvdWxkbid0IGxvZyB5b3UgaW5cIiksXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogX3QoXCJXZSBhc2tlZCB0aGUgYnJvd3NlciB0byByZW1lbWJlciB3aGljaCBob21lc2VydmVyIHlvdSB1c2UgdG8gbGV0IHlvdSBzaWduIGluLCBcIiArXG4gICAgICAgICAgICAgICAgXCJidXQgdW5mb3J0dW5hdGVseSB5b3VyIGJyb3dzZXIgaGFzIGZvcmdvdHRlbiBpdC4gR28gdG8gdGhlIHNpZ24gaW4gcGFnZSBhbmQgdHJ5IGFnYWluLlwiKSxcbiAgICAgICAgICAgIGJ1dHRvbjogX3QoXCJUcnkgYWdhaW5cIiksXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VuZExvZ2luUmVxdWVzdChcbiAgICAgICAgaG9tZXNlcnZlcixcbiAgICAgICAgaWRlbnRpdHlTZXJ2ZXIsXG4gICAgICAgIFwibS5sb2dpbi50b2tlblwiLCB7XG4gICAgICAgICAgICB0b2tlbjogcXVlcnlQYXJhbXMubG9naW5Ub2tlbiBhcyBzdHJpbmcsXG4gICAgICAgICAgICBpbml0aWFsX2RldmljZV9kaXNwbGF5X25hbWU6IGRlZmF1bHREZXZpY2VEaXNwbGF5TmFtZSxcbiAgICAgICAgfSxcbiAgICApLnRoZW4oZnVuY3Rpb24oY3JlZHMpIHtcbiAgICAgICAgbG9nZ2VyLmxvZyhcIkxvZ2dlZCBpbiB3aXRoIHRva2VuXCIpO1xuICAgICAgICByZXR1cm4gY2xlYXJTdG9yYWdlKCkudGhlbihhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBhd2FpdCBwZXJzaXN0Q3JlZGVudGlhbHMoY3JlZHMpO1xuICAgICAgICAgICAgLy8gcmVtZW1iZXIgdGhhdCB3ZSBqdXN0IGxvZ2dlZCBpblxuICAgICAgICAgICAgc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShcIm14X2ZyZXNoX2xvZ2luXCIsIFN0cmluZyh0cnVlKSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgIHRpdGxlOiBfdChcIldlIGNvdWxkbid0IGxvZyB5b3UgaW5cIiksXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZXJyLm5hbWUgPT09IFwiQ29ubmVjdGlvbkVycm9yXCJcbiAgICAgICAgICAgICAgICA/IF90KFwiWW91ciBob21lc2VydmVyIHdhcyB1bnJlYWNoYWJsZSBhbmQgd2FzIG5vdCBhYmxlIHRvIGxvZyB5b3UgaW4uIFBsZWFzZSB0cnkgYWdhaW4uIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJJZiB0aGlzIGNvbnRpbnVlcywgcGxlYXNlIGNvbnRhY3QgeW91ciBob21lc2VydmVyIGFkbWluaXN0cmF0b3IuXCIpXG4gICAgICAgICAgICAgICAgOiBfdChcIllvdXIgaG9tZXNlcnZlciByZWplY3RlZCB5b3VyIGxvZyBpbiBhdHRlbXB0LiBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiVGhpcyBjb3VsZCBiZSBkdWUgdG8gdGhpbmdzIGp1c3QgdGFraW5nIHRvbyBsb25nLiBQbGVhc2UgdHJ5IGFnYWluLiBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiSWYgdGhpcyBjb250aW51ZXMsIHBsZWFzZSBjb250YWN0IHlvdXIgaG9tZXNlcnZlciBhZG1pbmlzdHJhdG9yLlwiKSxcbiAgICAgICAgICAgIGJ1dHRvbjogX3QoXCJUcnkgYWdhaW5cIiksXG4gICAgICAgICAgICBvbkZpbmlzaGVkOiB0cnlBZ2FpbiA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRyeUFnYWluKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsaSA9IGNyZWF0ZUNsaWVudCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlVXJsOiBob21lc2VydmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWRCYXNlVXJsOiBpZGVudGl0eVNlcnZlcixcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGlkcElkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oU1NPX0lEUF9JRF9LRVkpIHx8IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAgICAgUGxhdGZvcm1QZWcuZ2V0KCkuc3RhcnRTaW5nbGVTaWduT24oY2xpLCBcInNzb1wiLCBmcmFnbWVudEFmdGVyTG9naW4sIGlkcElkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgbG9nZ2VyLmVycm9yKFwiRmFpbGVkIHRvIGxvZyBpbiB3aXRoIGxvZ2luIHRva2VuOlwiKTtcbiAgICAgICAgbG9nZ2VyLmVycm9yKGVycik7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZUludmFsaWRTdG9yZUVycm9yKGU6IEludmFsaWRTdG9yZUVycm9yKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKGUucmVhc29uID09PSBJbnZhbGlkU3RvcmVFcnJvci5UT0dHTEVEX0xBWllfTE9BRElORykge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsYXp5TG9hZEVuYWJsZWQgPSBlLnZhbHVlO1xuICAgICAgICAgICAgaWYgKGxhenlMb2FkRW5hYmxlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coTGF6eUxvYWRpbmdSZXN5bmNEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ6IHJlc29sdmUsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBzaG93IHdhcm5pbmcgYWJvdXQgc2ltdWx0YW5lb3VzIHVzZVxuICAgICAgICAgICAgICAgIC8vIGJldHdlZW4gTEwvbm9uLUxMIHZlcnNpb24gb24gc2FtZSBob3N0LlxuICAgICAgICAgICAgICAgIC8vIGFzIGRpc2FibGluZyBMTCB3aGVuIHByZXZpb3VzbHkgZW5hYmxlZFxuICAgICAgICAgICAgICAgIC8vIGlzIGEgc3Ryb25nIGluZGljYXRvciBvZiB0aGlzICgvZGV2ZWxvcCAmIC9hcHApXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIE1vZGFsLmNyZWF0ZURpYWxvZyhMYXp5TG9hZGluZ0Rpc2FibGVkRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkOiByZXNvbHZlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaG9zdDogd2luZG93LmxvY2F0aW9uLmhvc3QsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc3RvcmUuZGVsZXRlQWxsRGF0YSgpO1xuICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIFBsYXRmb3JtUGVnLmdldCgpLnJlbG9hZCgpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyQXNHdWVzdChcbiAgICBoc1VybDogc3RyaW5nLFxuICAgIGlzVXJsOiBzdHJpbmcsXG4gICAgZGVmYXVsdERldmljZURpc3BsYXlOYW1lOiBzdHJpbmcsXG4pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBsb2dnZXIubG9nKGBEb2luZyBndWVzdCBsb2dpbiBvbiAke2hzVXJsfWApO1xuXG4gICAgLy8gY3JlYXRlIGEgdGVtcG9yYXJ5IE1hdHJpeENsaWVudCB0byBkbyB0aGUgbG9naW5cbiAgICBjb25zdCBjbGllbnQgPSBjcmVhdGVDbGllbnQoe1xuICAgICAgICBiYXNlVXJsOiBoc1VybCxcbiAgICB9KTtcblxuICAgIHJldHVybiBjbGllbnQucmVnaXN0ZXJHdWVzdCh7XG4gICAgICAgIGJvZHk6IHtcbiAgICAgICAgICAgIGluaXRpYWxfZGV2aWNlX2Rpc3BsYXlfbmFtZTogZGVmYXVsdERldmljZURpc3BsYXlOYW1lLFxuICAgICAgICB9LFxuICAgIH0pLnRoZW4oKGNyZWRzKSA9PiB7XG4gICAgICAgIGxvZ2dlci5sb2coYFJlZ2lzdGVyZWQgYXMgZ3Vlc3Q6ICR7Y3JlZHMudXNlcl9pZH1gKTtcbiAgICAgICAgcmV0dXJuIGRvU2V0TG9nZ2VkSW4oe1xuICAgICAgICAgICAgdXNlcklkOiBjcmVkcy51c2VyX2lkLFxuICAgICAgICAgICAgZGV2aWNlSWQ6IGNyZWRzLmRldmljZV9pZCxcbiAgICAgICAgICAgIGFjY2Vzc1Rva2VuOiBjcmVkcy5hY2Nlc3NfdG9rZW4sXG4gICAgICAgICAgICBob21lc2VydmVyVXJsOiBoc1VybCxcbiAgICAgICAgICAgIGlkZW50aXR5U2VydmVyVXJsOiBpc1VybCxcbiAgICAgICAgICAgIGd1ZXN0OiB0cnVlLFxuICAgICAgICB9LCB0cnVlKS50aGVuKCgpID0+IHRydWUpO1xuICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgbG9nZ2VyLmVycm9yKFwiRmFpbGVkIHRvIHJlZ2lzdGVyIGFzIGd1ZXN0XCIsIGVycik7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJU3RvcmVkU2Vzc2lvbiB7XG4gICAgaHNVcmw6IHN0cmluZztcbiAgICBpc1VybDogc3RyaW5nO1xuICAgIGhhc0FjY2Vzc1Rva2VuOiBib29sZWFuO1xuICAgIGFjY2Vzc1Rva2VuOiBzdHJpbmcgfCBJRW5jcnlwdGVkUGF5bG9hZDtcbiAgICB1c2VySWQ6IHN0cmluZztcbiAgICBkZXZpY2VJZDogc3RyaW5nO1xuICAgIGlzR3Vlc3Q6IGJvb2xlYW47XG59XG5cbi8qKlxuICogUmV0cmlldmVzIGluZm9ybWF0aW9uIGFib3V0IHRoZSBzdG9yZWQgc2Vzc2lvbiBmcm9tIHRoZSBicm93c2VyJ3Mgc3RvcmFnZS4gVGhlIHNlc3Npb25cbiAqIG1heSBub3QgYmUgdmFsaWQsIGFzIGl0IGlzIG5vdCB0ZXN0ZWQgZm9yIGNvbnNpc3RlbmN5IGhlcmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBJbmZvcm1hdGlvbiBhYm91dCB0aGUgc2Vzc2lvbiAtIHNlZSBpbXBsZW1lbnRhdGlvbiBmb3IgdmFyaWFibGVzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0U3RvcmVkU2Vzc2lvblZhcnMoKTogUHJvbWlzZTxJU3RvcmVkU2Vzc2lvbj4ge1xuICAgIGNvbnN0IGhzVXJsID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oSE9NRVNFUlZFUl9VUkxfS0VZKTtcbiAgICBjb25zdCBpc1VybCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKElEX1NFUlZFUl9VUkxfS0VZKTtcbiAgICBsZXQgYWNjZXNzVG9rZW47XG4gICAgdHJ5IHtcbiAgICAgICAgYWNjZXNzVG9rZW4gPSBhd2FpdCBTdG9yYWdlTWFuYWdlci5pZGJMb2FkKFwiYWNjb3VudFwiLCBcIm14X2FjY2Vzc190b2tlblwiKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGxvZ2dlci5lcnJvcihcIlN0b3JhZ2VNYW5hZ2VyLmlkYkxvYWQgZmFpbGVkIGZvciBhY2NvdW50Om14X2FjY2Vzc190b2tlblwiLCBlKTtcbiAgICB9XG4gICAgaWYgKCFhY2Nlc3NUb2tlbikge1xuICAgICAgICBhY2Nlc3NUb2tlbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwibXhfYWNjZXNzX3Rva2VuXCIpO1xuICAgICAgICBpZiAoYWNjZXNzVG9rZW4pIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy8gdHJ5IHRvIG1pZ3JhdGUgYWNjZXNzIHRva2VuIHRvIEluZGV4ZWREQiBpZiB3ZSBjYW5cbiAgICAgICAgICAgICAgICBhd2FpdCBTdG9yYWdlTWFuYWdlci5pZGJTYXZlKFwiYWNjb3VudFwiLCBcIm14X2FjY2Vzc190b2tlblwiLCBhY2Nlc3NUb2tlbik7XG4gICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJteF9hY2Nlc3NfdG9rZW5cIik7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwibWlncmF0aW9uIG9mIGFjY2VzcyB0b2tlbiB0byBJbmRleGVkREIgZmFpbGVkXCIsIGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8vIGlmIHdlIHByZS1kYXRlIHN0b3JpbmcgXCJteF9oYXNfYWNjZXNzX3Rva2VuXCIsIGJ1dCB3ZSByZXRyaWV2ZWQgYW4gYWNjZXNzXG4gICAgLy8gdG9rZW4sIHRoZW4gd2Ugc2hvdWxkIHNheSB3ZSBoYXZlIGFuIGFjY2VzcyB0b2tlblxuICAgIGNvbnN0IGhhc0FjY2Vzc1Rva2VuID1cbiAgICAgICAgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwibXhfaGFzX2FjY2Vzc190b2tlblwiKSA9PT0gXCJ0cnVlXCIpIHx8ICEhYWNjZXNzVG9rZW47XG4gICAgY29uc3QgdXNlcklkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJteF91c2VyX2lkXCIpO1xuICAgIGNvbnN0IGRldmljZUlkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJteF9kZXZpY2VfaWRcIik7XG5cbiAgICBsZXQgaXNHdWVzdDtcbiAgICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJteF9pc19ndWVzdFwiKSAhPT0gbnVsbCkge1xuICAgICAgICBpc0d1ZXN0ID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJteF9pc19ndWVzdFwiKSA9PT0gXCJ0cnVlXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gbGVnYWN5IGtleSBuYW1lXG4gICAgICAgIGlzR3Vlc3QgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIm1hdHJpeC1pcy1ndWVzdFwiKSA9PT0gXCJ0cnVlXCI7XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgaHNVcmwsIGlzVXJsLCBoYXNBY2Nlc3NUb2tlbiwgYWNjZXNzVG9rZW4sIHVzZXJJZCwgZGV2aWNlSWQsIGlzR3Vlc3QgfTtcbn1cblxuLy8gVGhlIHBpY2tsZSBrZXkgaXMgYSBzdHJpbmcgb2YgdW5zcGVjaWZpZWQgbGVuZ3RoIGFuZCBmb3JtYXQuICBGb3IgQUVTLCB3ZVxuLy8gbmVlZCBhIDI1Ni1iaXQgVWludDhBcnJheS4gU28gd2UgSEtERiB0aGUgcGlja2xlIGtleSB0byBnZW5lcmF0ZSB0aGUgQUVTXG4vLyBrZXkuICBUaGUgQUVTIGtleSBzaG91bGQgYmUgemVyb2VkIGFmdGVyIGl0IGlzIHVzZWQuXG5hc3luYyBmdW5jdGlvbiBwaWNrbGVLZXlUb0Flc0tleShwaWNrbGVLZXk6IHN0cmluZyk6IFByb21pc2U8VWludDhBcnJheT4ge1xuICAgIGNvbnN0IHBpY2tsZUtleUJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KHBpY2tsZUtleS5sZW5ndGgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGlja2xlS2V5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHBpY2tsZUtleUJ1ZmZlcltpXSA9IHBpY2tsZUtleS5jaGFyQ29kZUF0KGkpO1xuICAgIH1cbiAgICBjb25zdCBoa2RmS2V5ID0gYXdhaXQgd2luZG93LmNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgICBcInJhd1wiLCBwaWNrbGVLZXlCdWZmZXIsIFwiSEtERlwiLCBmYWxzZSwgW1wiZGVyaXZlQml0c1wiXSxcbiAgICApO1xuICAgIHBpY2tsZUtleUJ1ZmZlci5maWxsKDApO1xuICAgIHJldHVybiBuZXcgVWludDhBcnJheShhd2FpdCB3aW5kb3cuY3J5cHRvLnN1YnRsZS5kZXJpdmVCaXRzKFxuICAgICAgICB7XG4gICAgICAgICAgICBuYW1lOiBcIkhLREZcIiwgaGFzaDogXCJTSEEtMjU2XCIsXG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlOiBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQtRE9NLWxpYi1nZW5lcmF0b3IvcHVsbC84NzlcbiAgICAgICAgICAgIHNhbHQ6IG5ldyBVaW50OEFycmF5KDMyKSwgaW5mbzogbmV3IFVpbnQ4QXJyYXkoMCksXG4gICAgICAgIH0sXG4gICAgICAgIGhrZGZLZXksXG4gICAgICAgIDI1NixcbiAgICApKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gYWJvcnRMb2dpbigpIHtcbiAgICBjb25zdCBzaWduT3V0ID0gYXdhaXQgc2hvd1N0b3JhZ2VFdmljdGVkRGlhbG9nKCk7XG4gICAgaWYgKHNpZ25PdXQpIHtcbiAgICAgICAgYXdhaXQgY2xlYXJTdG9yYWdlKCk7XG4gICAgICAgIC8vIFRoaXMgZXJyb3IgZmVlbHMgYSBiaXQgY2x1bmt5LCBidXQgd2Ugd2FudCB0byBtYWtlIHN1cmUgd2UgZG9uJ3QgZ28gYW55XG4gICAgICAgIC8vIGZ1cnRoZXIgYW5kIGluc3RlYWQgaGVhZCBiYWNrIHRvIHNpZ24gaW4uXG4gICAgICAgIHRocm93IG5ldyBBYm9ydExvZ2luQW5kUmVidWlsZFN0b3JhZ2UoXG4gICAgICAgICAgICBcIkFib3J0aW5nIGxvZ2luIGluIHByb2dyZXNzIGJlY2F1c2Ugb2Ygc3RvcmFnZSBpbmNvbnNpc3RlbmN5XCIsXG4gICAgICAgICk7XG4gICAgfVxufVxuXG4vLyByZXR1cm5zIGEgcHJvbWlzZSB3aGljaCByZXNvbHZlcyB0byB0cnVlIGlmIGEgc2Vzc2lvbiBpcyBmb3VuZCBpblxuLy8gbG9jYWxzdG9yYWdlXG4vL1xuLy8gTi5CLiBMaWZlY3ljbGUuanMgc2hvdWxkIG5vdCBtYWludGFpbiBhbnkgZnVydGhlciBsb2NhbFN0b3JhZ2Ugc3RhdGUsIHdlXG4vLyAgICAgIGFyZSBtb3ZpbmcgdG93YXJkcyB1c2luZyBTZXNzaW9uU3RvcmUgdG8ga2VlcCB0cmFjayBvZiBzdGF0ZSByZWxhdGVkXG4vLyAgICAgIHRvIHRoZSBjdXJyZW50IHNlc3Npb24gKHdoaWNoIGlzIHR5cGljYWxseSBiYWNrZWQgYnkgbG9jYWxTdG9yYWdlKS5cbi8vXG4vLyAgICAgIFRoZSBwbGFuIGlzIHRvIGdyYWR1YWxseSBtb3ZlIHRoZSBsb2NhbFN0b3JhZ2UgYWNjZXNzIGRvbmUgaGVyZSBpbnRvXG4vLyAgICAgIFNlc3Npb25TdG9yZSB0byBhdm9pZCBidWdzIHdoZXJlIHRoZSB2aWV3IGJlY29tZXMgb3V0LW9mLXN5bmMgd2l0aFxuLy8gICAgICBsb2NhbFN0b3JhZ2UgKGUuZy4gaXNHdWVzdCBldGMuKVxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlc3RvcmVGcm9tTG9jYWxTdG9yYWdlKG9wdHM/OiB7IGlnbm9yZUd1ZXN0PzogYm9vbGVhbiB9KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgaWdub3JlR3Vlc3QgPSBvcHRzPy5pZ25vcmVHdWVzdDtcblxuICAgIGlmICghbG9jYWxTdG9yYWdlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCB7IGhzVXJsLCBpc1VybCwgaGFzQWNjZXNzVG9rZW4sIGFjY2Vzc1Rva2VuLCB1c2VySWQsIGRldmljZUlkLCBpc0d1ZXN0IH0gPSBhd2FpdCBnZXRTdG9yZWRTZXNzaW9uVmFycygpO1xuXG4gICAgaWYgKGhhc0FjY2Vzc1Rva2VuICYmICFhY2Nlc3NUb2tlbikge1xuICAgICAgICBhYm9ydExvZ2luKCk7XG4gICAgfVxuXG4gICAgaWYgKGFjY2Vzc1Rva2VuICYmIHVzZXJJZCAmJiBoc1VybCkge1xuICAgICAgICBpZiAoaWdub3JlR3Vlc3QgJiYgaXNHdWVzdCkge1xuICAgICAgICAgICAgbG9nZ2VyLmxvZyhcIklnbm9yaW5nIHN0b3JlZCBndWVzdCBhY2NvdW50OiBcIiArIHVzZXJJZCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZGVjcnlwdGVkQWNjZXNzVG9rZW4gPSBhY2Nlc3NUb2tlbjtcbiAgICAgICAgY29uc3QgcGlja2xlS2V5ID0gYXdhaXQgUGxhdGZvcm1QZWcuZ2V0KCkuZ2V0UGlja2xlS2V5KHVzZXJJZCwgZGV2aWNlSWQpO1xuICAgICAgICBpZiAocGlja2xlS2V5KSB7XG4gICAgICAgICAgICBsb2dnZXIubG9nKFwiR290IHBpY2tsZSBrZXlcIik7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGFjY2Vzc1Rva2VuICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZW5jcktleSA9IGF3YWl0IHBpY2tsZUtleVRvQWVzS2V5KHBpY2tsZUtleSk7XG4gICAgICAgICAgICAgICAgZGVjcnlwdGVkQWNjZXNzVG9rZW4gPSBhd2FpdCBkZWNyeXB0QUVTKGFjY2Vzc1Rva2VuLCBlbmNyS2V5LCBcImFjY2Vzc190b2tlblwiKTtcbiAgICAgICAgICAgICAgICBlbmNyS2V5LmZpbGwoMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsb2dnZXIubG9nKFwiTm8gcGlja2xlIGtleSBhdmFpbGFibGVcIik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBmcmVzaExvZ2luID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShcIm14X2ZyZXNoX2xvZ2luXCIpID09PSBcInRydWVcIjtcbiAgICAgICAgc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbShcIm14X2ZyZXNoX2xvZ2luXCIpO1xuXG4gICAgICAgIGxvZ2dlci5sb2coYFJlc3RvcmluZyBzZXNzaW9uIGZvciAke3VzZXJJZH1gKTtcbiAgICAgICAgYXdhaXQgZG9TZXRMb2dnZWRJbih7XG4gICAgICAgICAgICB1c2VySWQ6IHVzZXJJZCxcbiAgICAgICAgICAgIGRldmljZUlkOiBkZXZpY2VJZCxcbiAgICAgICAgICAgIGFjY2Vzc1Rva2VuOiBkZWNyeXB0ZWRBY2Nlc3NUb2tlbiBhcyBzdHJpbmcsXG4gICAgICAgICAgICBob21lc2VydmVyVXJsOiBoc1VybCxcbiAgICAgICAgICAgIGlkZW50aXR5U2VydmVyVXJsOiBpc1VybCxcbiAgICAgICAgICAgIGd1ZXN0OiBpc0d1ZXN0LFxuICAgICAgICAgICAgcGlja2xlS2V5OiBwaWNrbGVLZXksXG4gICAgICAgICAgICBmcmVzaExvZ2luOiBmcmVzaExvZ2luLFxuICAgICAgICB9LCBmYWxzZSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxvZ2dlci5sb2coXCJObyBwcmV2aW91cyBzZXNzaW9uIGZvdW5kLlwiKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlTG9hZFNlc3Npb25GYWlsdXJlKGU6IEVycm9yKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgbG9nZ2VyLmVycm9yKFwiVW5hYmxlIHRvIGxvYWQgc2Vzc2lvblwiLCBlKTtcblxuICAgIGNvbnN0IG1vZGFsID0gTW9kYWwuY3JlYXRlRGlhbG9nKFNlc3Npb25SZXN0b3JlRXJyb3JEaWFsb2csIHtcbiAgICAgICAgZXJyb3I6IGUsXG4gICAgfSk7XG5cbiAgICBjb25zdCBbc3VjY2Vzc10gPSBhd2FpdCBtb2RhbC5maW5pc2hlZDtcbiAgICBpZiAoc3VjY2Vzcykge1xuICAgICAgICAvLyB1c2VyIGNsaWNrZWQgY29udGludWUuXG4gICAgICAgIGF3YWl0IGNsZWFyU3RvcmFnZSgpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gdHJ5LCB0cnkgYWdhaW5cbiAgICByZXR1cm4gbG9hZFNlc3Npb24oKTtcbn1cblxuLyoqXG4gKiBUcmFuc2l0aW9ucyB0byBhIGxvZ2dlZC1pbiBzdGF0ZSB1c2luZyB0aGUgZ2l2ZW4gY3JlZGVudGlhbHMuXG4gKlxuICogU3RhcnRzIHRoZSBtYXRyaXggY2xpZW50IGFuZCBhbGwgb3RoZXIgcmVhY3Qtc2RrIHNlcnZpY2VzIHRoYXRcbiAqIGxpc3RlbiBmb3IgZXZlbnRzIHdoaWxlIGEgc2Vzc2lvbiBpcyBsb2dnZWQgaW4uXG4gKlxuICogQWxzbyBzdG9wcyB0aGUgb2xkIE1hdHJpeENsaWVudCBhbmQgY2xlYXJzIG9sZCBjcmVkZW50aWFscy9ldGMgb3V0IG9mXG4gKiBzdG9yYWdlIGJlZm9yZSBzdGFydGluZyB0aGUgbmV3IGNsaWVudC5cbiAqXG4gKiBAcGFyYW0ge0lNYXRyaXhDbGllbnRDcmVkc30gY3JlZGVudGlhbHMgVGhlIGNyZWRlbnRpYWxzIHRvIHVzZVxuICpcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBwcm9taXNlIHdoaWNoIHJlc29sdmVzIHRvIHRoZSBuZXcgTWF0cml4Q2xpZW50IG9uY2UgaXQgaGFzIGJlZW4gc3RhcnRlZFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0TG9nZ2VkSW4oY3JlZGVudGlhbHM6IElNYXRyaXhDbGllbnRDcmVkcyk6IFByb21pc2U8TWF0cml4Q2xpZW50PiB7XG4gICAgY3JlZGVudGlhbHMuZnJlc2hMb2dpbiA9IHRydWU7XG4gICAgc3RvcE1hdHJpeENsaWVudCgpO1xuICAgIGNvbnN0IHBpY2tsZUtleSA9IGNyZWRlbnRpYWxzLnVzZXJJZCAmJiBjcmVkZW50aWFscy5kZXZpY2VJZFxuICAgICAgICA/IGF3YWl0IFBsYXRmb3JtUGVnLmdldCgpLmNyZWF0ZVBpY2tsZUtleShjcmVkZW50aWFscy51c2VySWQsIGNyZWRlbnRpYWxzLmRldmljZUlkKVxuICAgICAgICA6IG51bGw7XG5cbiAgICBpZiAocGlja2xlS2V5KSB7XG4gICAgICAgIGxvZ2dlci5sb2coXCJDcmVhdGVkIHBpY2tsZSBrZXlcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbG9nZ2VyLmxvZyhcIlBpY2tsZSBrZXkgbm90IGNyZWF0ZWRcIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRvU2V0TG9nZ2VkSW4oT2JqZWN0LmFzc2lnbih7fSwgY3JlZGVudGlhbHMsIHsgcGlja2xlS2V5IH0pLCB0cnVlKTtcbn1cblxuLyoqXG4gKiBIeWRyYXRlcyBhbiBleGlzdGluZyBzZXNzaW9uIGJ5IHVzaW5nIHRoZSBjcmVkZW50aWFscyBwcm92aWRlZC4gVGhpcyB3aWxsXG4gKiBub3QgY2xlYXIgYW55IGxvY2FsIHN0b3JhZ2UsIHVubGlrZSBzZXRMb2dnZWRJbigpLlxuICpcbiAqIFN0b3BzIHRoZSBleGlzdGluZyBNYXRyaXggY2xpZW50ICh3aXRob3V0IGNsZWFyaW5nIGl0cyBkYXRhKSBhbmQgc3RhcnRzIGFcbiAqIG5ldyBvbmUgaW4gaXRzIHBsYWNlLiBUaGlzIGFkZGl0aW9uYWxseSBzdGFydHMgYWxsIG90aGVyIHJlYWN0LXNkayBzZXJ2aWNlc1xuICogd2hpY2ggdXNlIHRoZSBuZXcgTWF0cml4IGNsaWVudC5cbiAqXG4gKiBJZiB0aGUgY3JlZGVudGlhbHMgYmVsb25nIHRvIGEgZGlmZmVyZW50IHVzZXIgZnJvbSB0aGUgc2Vzc2lvbiBhbHJlYWR5IHN0b3JlZCxcbiAqIHRoZSBvbGQgc2Vzc2lvbiB3aWxsIGJlIGNsZWFyZWQgYXV0b21hdGljYWxseS5cbiAqXG4gKiBAcGFyYW0ge0lNYXRyaXhDbGllbnRDcmVkc30gY3JlZGVudGlhbHMgVGhlIGNyZWRlbnRpYWxzIHRvIHVzZVxuICpcbiAqIEByZXR1cm5zIHtQcm9taXNlfSBwcm9taXNlIHdoaWNoIHJlc29sdmVzIHRvIHRoZSBuZXcgTWF0cml4Q2xpZW50IG9uY2UgaXQgaGFzIGJlZW4gc3RhcnRlZFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaHlkcmF0ZVNlc3Npb24oY3JlZGVudGlhbHM6IElNYXRyaXhDbGllbnRDcmVkcyk6IFByb21pc2U8TWF0cml4Q2xpZW50PiB7XG4gICAgY29uc3Qgb2xkVXNlcklkID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpO1xuICAgIGNvbnN0IG9sZERldmljZUlkID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldERldmljZUlkKCk7XG5cbiAgICBzdG9wTWF0cml4Q2xpZW50KCk7IC8vIHVuc2V0cyBNYXRyaXhDbGllbnRQZWcuZ2V0KClcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcIm14X3NvZnRfbG9nb3V0XCIpO1xuICAgIF9pc0xvZ2dpbmdPdXQgPSBmYWxzZTtcblxuICAgIGNvbnN0IG92ZXJ3cml0ZSA9IGNyZWRlbnRpYWxzLnVzZXJJZCAhPT0gb2xkVXNlcklkIHx8IGNyZWRlbnRpYWxzLmRldmljZUlkICE9PSBvbGREZXZpY2VJZDtcbiAgICBpZiAob3ZlcndyaXRlKSB7XG4gICAgICAgIGxvZ2dlci53YXJuKFwiQ2xlYXJpbmcgYWxsIGRhdGE6IE9sZCBzZXNzaW9uIGJlbG9uZ3MgdG8gYSBkaWZmZXJlbnQgdXNlci9zZXNzaW9uXCIpO1xuICAgIH1cblxuICAgIGlmICghY3JlZGVudGlhbHMucGlja2xlS2V5KSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKFwiTGlmZWN5Y2xlI2h5ZHJhdGVTZXNzaW9uOiBQaWNrbGUga2V5IG5vdCBwcm92aWRlZCAtIHRyeWluZyB0byBnZXQgb25lXCIpO1xuICAgICAgICBjcmVkZW50aWFscy5waWNrbGVLZXkgPSBhd2FpdCBQbGF0Zm9ybVBlZy5nZXQoKS5nZXRQaWNrbGVLZXkoY3JlZGVudGlhbHMudXNlcklkLCBjcmVkZW50aWFscy5kZXZpY2VJZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRvU2V0TG9nZ2VkSW4oY3JlZGVudGlhbHMsIG92ZXJ3cml0ZSk7XG59XG5cbi8qKlxuICogZmlyZXMgb25fbG9nZ2luZ19pbiwgb3B0aW9uYWxseSBjbGVhcnMgbG9jYWxzdG9yYWdlLCBwZXJzaXN0cyBuZXcgY3JlZGVudGlhbHNcbiAqIHRvIGxvY2Fsc3RvcmFnZSwgc3RhcnRzIHRoZSBuZXcgY2xpZW50LlxuICpcbiAqIEBwYXJhbSB7SU1hdHJpeENsaWVudENyZWRzfSBjcmVkZW50aWFsc1xuICogQHBhcmFtIHtCb29sZWFufSBjbGVhclN0b3JhZ2VFbmFibGVkXG4gKlxuICogQHJldHVybnMge1Byb21pc2V9IHByb21pc2Ugd2hpY2ggcmVzb2x2ZXMgdG8gdGhlIG5ldyBNYXRyaXhDbGllbnQgb25jZSBpdCBoYXMgYmVlbiBzdGFydGVkXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGRvU2V0TG9nZ2VkSW4oXG4gICAgY3JlZGVudGlhbHM6IElNYXRyaXhDbGllbnRDcmVkcyxcbiAgICBjbGVhclN0b3JhZ2VFbmFibGVkOiBib29sZWFuLFxuKTogUHJvbWlzZTxNYXRyaXhDbGllbnQ+IHtcbiAgICBjcmVkZW50aWFscy5ndWVzdCA9IEJvb2xlYW4oY3JlZGVudGlhbHMuZ3Vlc3QpO1xuXG4gICAgY29uc3Qgc29mdExvZ291dCA9IGlzU29mdExvZ291dCgpO1xuXG4gICAgbG9nZ2VyLmxvZyhcbiAgICAgICAgXCJzZXRMb2dnZWRJbjogbXhpZDogXCIgKyBjcmVkZW50aWFscy51c2VySWQgK1xuICAgICAgICBcIiBkZXZpY2VJZDogXCIgKyBjcmVkZW50aWFscy5kZXZpY2VJZCArXG4gICAgICAgIFwiIGd1ZXN0OiBcIiArIGNyZWRlbnRpYWxzLmd1ZXN0ICtcbiAgICAgICAgXCIgaHM6IFwiICsgY3JlZGVudGlhbHMuaG9tZXNlcnZlclVybCArXG4gICAgICAgIFwiIHNvZnRMb2dvdXQ6IFwiICsgc29mdExvZ291dCxcbiAgICAgICAgXCIgZnJlc2hMb2dpbjogXCIgKyBjcmVkZW50aWFscy5mcmVzaExvZ2luLFxuICAgICk7XG5cbiAgICAvLyBUaGlzIGlzIGRpc3BhdGNoZWQgdG8gaW5kaWNhdGUgdGhhdCB0aGUgdXNlciBpcyBzdGlsbCBpbiB0aGUgcHJvY2VzcyBvZiBsb2dnaW5nIGluXG4gICAgLy8gYmVjYXVzZSBhc3luYyBjb2RlIG1heSB0YWtlIHNvbWUgdGltZSB0byByZXNvbHZlLCBicmVha2luZyB0aGUgYXNzdW1wdGlvbiB0aGF0XG4gICAgLy8gYHNldExvZ2dlZEluYCB0YWtlcyBhbiBcImluc3RhbnRcIiB0byBjb21wbGV0ZSwgYW5kIGRpc3BhdGNoIGBvbl9sb2dnZWRfaW5gIGEgZmV3IG1zXG4gICAgLy8gbGF0ZXIgdGhhbiBNYXRyaXhDaGF0IG1pZ2h0IGFzc3VtZS5cbiAgICAvL1xuICAgIC8vIHdlIGZpcmUgaXQgKnN5bmNocm9ub3VzbHkqIHRvIG1ha2Ugc3VyZSBpdCBmaXJlcyBiZWZvcmUgb25fbG9nZ2VkX2luLlxuICAgIC8vIChkaXMuZGlzcGF0Y2ggdXNlcyBgc2V0VGltZW91dGAsIHdoaWNoIGRvZXMgbm90IGd1YXJhbnRlZSBvcmRlcmluZy4pXG4gICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiAnb25fbG9nZ2luZ19pbicgfSwgdHJ1ZSk7XG5cbiAgICBpZiAoY2xlYXJTdG9yYWdlRW5hYmxlZCkge1xuICAgICAgICBhd2FpdCBjbGVhclN0b3JhZ2UoKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgU3RvcmFnZU1hbmFnZXIuY2hlY2tDb25zaXN0ZW5jeSgpO1xuICAgIC8vIElmIHRoZXJlJ3MgYW4gaW5jb25zaXN0ZW5jeSBiZXR3ZWVuIGFjY291bnQgZGF0YSBpbiBsb2NhbCBzdG9yYWdlIGFuZCB0aGVcbiAgICAvLyBjcnlwdG8gc3RvcmUsIHdlJ2xsIGJlIGdlbmVyYWxseSBjb25mdXNlZCB3aGVuIGhhbmRsaW5nIGVuY3J5cHRlZCBkYXRhLlxuICAgIC8vIFNob3cgYSBtb2RhbCByZWNvbW1lbmRpbmcgYSBmdWxsIHJlc2V0IG9mIHN0b3JhZ2UuXG4gICAgaWYgKHJlc3VsdHMuZGF0YUluTG9jYWxTdG9yYWdlICYmIHJlc3VsdHMuY3J5cHRvSW5pdGVkICYmICFyZXN1bHRzLmRhdGFJbkNyeXB0b1N0b3JlKSB7XG4gICAgICAgIGF3YWl0IGFib3J0TG9naW4oKTtcbiAgICB9XG5cbiAgICBNYXRyaXhDbGllbnRQZWcucmVwbGFjZVVzaW5nQ3JlZHMoY3JlZGVudGlhbHMpO1xuXG4gICAgc2V0U2VudHJ5VXNlcihjcmVkZW50aWFscy51c2VySWQpO1xuXG4gICAgaWYgKFBvc3Rob2dBbmFseXRpY3MuaW5zdGFuY2UuaXNFbmFibGVkKCkpIHtcbiAgICAgICAgUG9zdGhvZ0FuYWx5dGljcy5pbnN0YW5jZS5zdGFydExpc3RlbmluZ1RvU2V0dGluZ3NDaGFuZ2VzKCk7XG4gICAgfVxuXG4gICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgIGlmIChjcmVkZW50aWFscy5mcmVzaExvZ2luICYmIFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJmZWF0dXJlX2RlaHlkcmF0aW9uXCIpKSB7XG4gICAgICAgIC8vIElmIHdlIGp1c3QgbG9nZ2VkIGluLCB0cnkgdG8gcmVoeWRyYXRlIGEgZGV2aWNlIGluc3RlYWQgb2YgdXNpbmcgYVxuICAgICAgICAvLyBuZXcgZGV2aWNlLiAgSWYgaXQgc3VjY2VlZHMsIHdlJ2xsIGdldCBhIG5ldyBkZXZpY2UgSUQsIHNvIG1ha2Ugc3VyZVxuICAgICAgICAvLyB3ZSBwZXJzaXN0IHRoYXQgSUQgdG8gbG9jYWxTdG9yYWdlXG4gICAgICAgIGNvbnN0IG5ld0RldmljZUlkID0gYXdhaXQgY2xpZW50LnJlaHlkcmF0ZURldmljZSgpO1xuICAgICAgICBpZiAobmV3RGV2aWNlSWQpIHtcbiAgICAgICAgICAgIGNyZWRlbnRpYWxzLmRldmljZUlkID0gbmV3RGV2aWNlSWQ7XG4gICAgICAgIH1cblxuICAgICAgICBkZWxldGUgY3JlZGVudGlhbHMuZnJlc2hMb2dpbjtcbiAgICB9XG5cbiAgICBpZiAobG9jYWxTdG9yYWdlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBwZXJzaXN0Q3JlZGVudGlhbHMoY3JlZGVudGlhbHMpO1xuICAgICAgICAgICAgLy8gbWFrZSBzdXJlIHdlIGRvbid0IHRoaW5rIHRoYXQgaXQncyBhIGZyZXNoIGxvZ2luIGFueSBtb3JlXG4gICAgICAgICAgICBzZXNzaW9uU3RvcmFnZS5yZW1vdmVJdGVtKFwibXhfZnJlc2hfbG9naW5cIik7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGxvZ2dlci53YXJuKFwiRXJyb3IgdXNpbmcgbG9jYWwgc3RvcmFnZTogY2FuJ3QgcGVyc2lzdCBzZXNzaW9uIVwiLCBlKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGxvZ2dlci53YXJuKFwiTm8gbG9jYWwgc3RvcmFnZSBhdmFpbGFibGU6IGNhbid0IHBlcnNpc3Qgc2Vzc2lvbiFcIik7XG4gICAgfVxuXG4gICAgZGlzLmZpcmUoQWN0aW9uLk9uTG9nZ2VkSW4pO1xuICAgIGF3YWl0IHN0YXJ0TWF0cml4Q2xpZW50KC8qc3RhcnRTeW5jaW5nPSovIXNvZnRMb2dvdXQpO1xuXG4gICAgcmV0dXJuIGNsaWVudDtcbn1cblxuZnVuY3Rpb24gc2hvd1N0b3JhZ2VFdmljdGVkRGlhbG9nKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKFN0b3JhZ2VFdmljdGVkRGlhbG9nLCB7XG4gICAgICAgICAgICBvbkZpbmlzaGVkOiByZXNvbHZlLFxuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuLy8gTm90ZTogQmFiZWwgNiByZXF1aXJlcyB0aGUgYHRyYW5zZm9ybS1idWlsdGluLWV4dGVuZGAgcGx1Z2luIGZvciB0aGlzIHRvIHNhdGlzZnlcbi8vIGBpbnN0YW5jZW9mYC4gQmFiZWwgNyBzdXBwb3J0cyB0aGlzIG5hdGl2ZWx5IGluIHRoZWlyIGNsYXNzIGhhbmRsaW5nLlxuY2xhc3MgQWJvcnRMb2dpbkFuZFJlYnVpbGRTdG9yYWdlIGV4dGVuZHMgRXJyb3IgeyB9XG5cbmFzeW5jIGZ1bmN0aW9uIHBlcnNpc3RDcmVkZW50aWFscyhjcmVkZW50aWFsczogSU1hdHJpeENsaWVudENyZWRzKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oSE9NRVNFUlZFUl9VUkxfS0VZLCBjcmVkZW50aWFscy5ob21lc2VydmVyVXJsKTtcbiAgICBpZiAoY3JlZGVudGlhbHMuaWRlbnRpdHlTZXJ2ZXJVcmwpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oSURfU0VSVkVSX1VSTF9LRVksIGNyZWRlbnRpYWxzLmlkZW50aXR5U2VydmVyVXJsKTtcbiAgICB9XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJteF91c2VyX2lkXCIsIGNyZWRlbnRpYWxzLnVzZXJJZCk7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJteF9pc19ndWVzdFwiLCBKU09OLnN0cmluZ2lmeShjcmVkZW50aWFscy5ndWVzdCkpO1xuXG4gICAgLy8gc3RvcmUgd2hldGhlciB3ZSBleHBlY3QgdG8gZmluZCBhbiBhY2Nlc3MgdG9rZW4sIHRvIGRldGVjdCB0aGUgY2FzZVxuICAgIC8vIHdoZXJlIEluZGV4ZWREQiBpcyBibG93biBhd2F5XG4gICAgaWYgKGNyZWRlbnRpYWxzLmFjY2Vzc1Rva2VuKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwibXhfaGFzX2FjY2Vzc190b2tlblwiLCBcInRydWVcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLmRlbGV0ZUl0ZW0oXCJteF9oYXNfYWNjZXNzX3Rva2VuXCIpO1xuICAgIH1cblxuICAgIGlmIChjcmVkZW50aWFscy5waWNrbGVLZXkpIHtcbiAgICAgICAgbGV0IGVuY3J5cHRlZEFjY2Vzc1Rva2VuOiBJRW5jcnlwdGVkUGF5bG9hZDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHRyeSB0byBlbmNyeXB0IHRoZSBhY2Nlc3MgdG9rZW4gdXNpbmcgdGhlIHBpY2tsZSBrZXlcbiAgICAgICAgICAgIGNvbnN0IGVuY3JLZXkgPSBhd2FpdCBwaWNrbGVLZXlUb0Flc0tleShjcmVkZW50aWFscy5waWNrbGVLZXkpO1xuICAgICAgICAgICAgZW5jcnlwdGVkQWNjZXNzVG9rZW4gPSBhd2FpdCBlbmNyeXB0QUVTKGNyZWRlbnRpYWxzLmFjY2Vzc1Rva2VuLCBlbmNyS2V5LCBcImFjY2Vzc190b2tlblwiKTtcbiAgICAgICAgICAgIGVuY3JLZXkuZmlsbCgwKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oXCJDb3VsZCBub3QgZW5jcnlwdCBhY2Nlc3MgdG9rZW5cIiwgZSk7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHNhdmUgZWl0aGVyIHRoZSBlbmNyeXB0ZWQgYWNjZXNzIHRva2VuLCBvciB0aGUgcGxhaW4gYWNjZXNzXG4gICAgICAgICAgICAvLyB0b2tlbiBpZiB3ZSB3ZXJlIHVuYWJsZSB0byBlbmNyeXB0IChlLmcuIGlmIHRoZSBicm93c2VyIGRvZXNuJ3RcbiAgICAgICAgICAgIC8vIGhhdmUgV2ViQ3J5cHRvKS5cbiAgICAgICAgICAgIGF3YWl0IFN0b3JhZ2VNYW5hZ2VyLmlkYlNhdmUoXG4gICAgICAgICAgICAgICAgXCJhY2NvdW50XCIsIFwibXhfYWNjZXNzX3Rva2VuXCIsXG4gICAgICAgICAgICAgICAgZW5jcnlwdGVkQWNjZXNzVG9rZW4gfHwgY3JlZGVudGlhbHMuYWNjZXNzVG9rZW4sXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvLyBpZiB3ZSBjb3VsZG4ndCBzYXZlIHRvIGluZGV4ZWREQiwgZmFsbCBiYWNrIHRvIGxvY2FsU3RvcmFnZS4gIFdlXG4gICAgICAgICAgICAvLyBzdG9yZSB0aGUgYWNjZXNzIHRva2VuIHVuZW5jcnlwdGVkIHNpbmNlIGxvY2FsU3RvcmFnZSBvbmx5IHNhdmVzXG4gICAgICAgICAgICAvLyBzdHJpbmdzLlxuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJteF9hY2Nlc3NfdG9rZW5cIiwgY3JlZGVudGlhbHMuYWNjZXNzVG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwibXhfaGFzX3BpY2tsZV9rZXlcIiwgU3RyaW5nKHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgU3RvcmFnZU1hbmFnZXIuaWRiU2F2ZShcbiAgICAgICAgICAgICAgICBcImFjY291bnRcIiwgXCJteF9hY2Nlc3NfdG9rZW5cIiwgY3JlZGVudGlhbHMuYWNjZXNzVG9rZW4sXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIm14X2FjY2Vzc190b2tlblwiLCBjcmVkZW50aWFscy5hY2Nlc3NUb2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwibXhfaGFzX3BpY2tsZV9rZXlcIikpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkV4cGVjdGVkIGEgcGlja2xlIGtleSwgYnV0IG5vbmUgcHJvdmlkZWQuICBFbmNyeXB0aW9uIG1heSBub3Qgd29yay5cIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBpZiB3ZSBkaWRuJ3QgZ2V0IGEgZGV2aWNlSWQgZnJvbSB0aGUgbG9naW4sIGxlYXZlIG14X2RldmljZV9pZCB1bnNldCxcbiAgICAvLyByYXRoZXIgdGhhbiBzZXR0aW5nIGl0IHRvIFwidW5kZWZpbmVkXCIuXG4gICAgLy9cbiAgICAvLyAoaW4gdGhpcyBjYXNlIE1hdHJpeENsaWVudCBkb2Vzbid0IGJvdGhlciB3aXRoIHRoZSBjcnlwdG8gc3R1ZmZcbiAgICAvLyAtIHRoYXQncyBmaW5lIGZvciB1cykuXG4gICAgaWYgKGNyZWRlbnRpYWxzLmRldmljZUlkKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwibXhfZGV2aWNlX2lkXCIsIGNyZWRlbnRpYWxzLmRldmljZUlkKTtcbiAgICB9XG5cbiAgICBTZWN1cml0eUN1c3RvbWlzYXRpb25zLnBlcnNpc3RDcmVkZW50aWFscz8uKGNyZWRlbnRpYWxzKTtcblxuICAgIGxvZ2dlci5sb2coYFNlc3Npb24gcGVyc2lzdGVkIGZvciAke2NyZWRlbnRpYWxzLnVzZXJJZH1gKTtcbn1cblxubGV0IF9pc0xvZ2dpbmdPdXQgPSBmYWxzZTtcblxuLyoqXG4gKiBMb2dzIHRoZSBjdXJyZW50IHNlc3Npb24gb3V0IGFuZCB0cmFuc2l0aW9ucyB0byB0aGUgbG9nZ2VkLW91dCBzdGF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gbG9nb3V0KCk6IHZvaWQge1xuICAgIGlmICghTWF0cml4Q2xpZW50UGVnLmdldCgpKSByZXR1cm47XG5cbiAgICBQb3N0aG9nQW5hbHl0aWNzLmluc3RhbmNlLmxvZ291dCgpO1xuXG4gICAgaWYgKE1hdHJpeENsaWVudFBlZy5nZXQoKS5pc0d1ZXN0KCkpIHtcbiAgICAgICAgLy8gbG9nb3V0IGRvZXNuJ3Qgd29yayBmb3IgZ3Vlc3Qgc2Vzc2lvbnNcbiAgICAgICAgLy8gQWxzbyB3ZSBzb21ldGltZXMgd2FudCB0byByZS1sb2cgaW4gYSBndWVzdCBzZXNzaW9uIGlmIHdlIGFib3J0IHRoZSBsb2dpbi5cbiAgICAgICAgLy8gZGVmZXIgdW50aWwgbmV4dCB0aWNrIGJlY2F1c2UgaXQgY2FsbHMgYSBzeW5jaHJvbm91cyBkaXNwYXRjaCwgYW5kIHdlIGFyZSBsaWtlbHkgaGVyZSBmcm9tIGEgZGlzcGF0Y2guXG4gICAgICAgIHNldEltbWVkaWF0ZSgoKSA9PiBvbkxvZ2dlZE91dCgpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIF9pc0xvZ2dpbmdPdXQgPSB0cnVlO1xuICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICBQbGF0Zm9ybVBlZy5nZXQoKS5kZXN0cm95UGlja2xlS2V5KGNsaWVudC5nZXRVc2VySWQoKSwgY2xpZW50LmdldERldmljZUlkKCkpO1xuICAgIGNsaWVudC5sb2dvdXQodW5kZWZpbmVkLCB0cnVlKS50aGVuKG9uTG9nZ2VkT3V0LCAoZXJyKSA9PiB7XG4gICAgICAgIC8vIEp1c3QgdGhyb3dpbmcgYW4gZXJyb3IgaGVyZSBpcyBnb2luZyB0byBiZSB2ZXJ5IHVuaGVscGZ1bFxuICAgICAgICAvLyBpZiB5b3UncmUgdHJ5aW5nIHRvIGxvZyBvdXQgYmVjYXVzZSB5b3VyIHNlcnZlcidzIGRvd24gYW5kXG4gICAgICAgIC8vIHlvdSB3YW50IHRvIGxvZyBpbnRvIGEgZGlmZmVyZW50IHNlcnZlciwgc28ganVzdCBmb3JnZXQgdGhlXG4gICAgICAgIC8vIGFjY2VzcyB0b2tlbi4gSXQncyBhbm5veWluZyB0aGF0IHRoaXMgd2lsbCBsZWF2ZSB0aGUgYWNjZXNzXG4gICAgICAgIC8vIHRva2VuIHN0aWxsIHZhbGlkLCBidXQgd2Ugc2hvdWxkIGZpeCB0aGlzIGJ5IGhhdmluZyBhY2Nlc3NcbiAgICAgICAgLy8gdG9rZW5zIGV4cGlyZSAoYW5kIGlmIHlvdSByZWFsbHkgdGhpbmsgeW91J3ZlIGJlZW4gY29tcHJvbWlzZWQsXG4gICAgICAgIC8vIGNoYW5nZSB5b3VyIHBhc3N3b3JkKS5cbiAgICAgICAgbG9nZ2VyLndhcm4oXCJGYWlsZWQgdG8gY2FsbCBsb2dvdXQgQVBJOiB0b2tlbiB3aWxsIG5vdCBiZSBpbnZhbGlkYXRlZFwiLCBlcnIpO1xuICAgICAgICBvbkxvZ2dlZE91dCgpO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc29mdExvZ291dCgpOiB2b2lkIHtcbiAgICBpZiAoIU1hdHJpeENsaWVudFBlZy5nZXQoKSkgcmV0dXJuO1xuXG4gICAgLy8gVHJhY2sgdGhhdCB3ZSd2ZSBkZXRlY3RlZCBhbmQgdHJhcHBlZCBhIHNvZnQgbG9nb3V0LiBUaGlzIGhlbHBzIHByZXZlbnQgb3RoZXJcbiAgICAvLyBwYXJ0cyBvZiB0aGUgYXBwIGZyb20gc3RhcnRpbmcgaWYgdGhlcmUncyBubyBwb2ludCAoaWU6IGRvbid0IHN5bmMgaWYgd2UndmVcbiAgICAvLyBiZWVuIHNvZnQgbG9nZ2VkIG91dCwgZGVzcGl0ZSBoYXZpbmcgY3JlZGVudGlhbHMgYW5kIGRhdGEgZm9yIGEgTWF0cml4Q2xpZW50KS5cbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIm14X3NvZnRfbG9nb3V0XCIsIFwidHJ1ZVwiKTtcblxuICAgIC8vIERldiBub3RlOiBwbGVhc2Uga2VlcCB0aGlzIGxvZyBsaW5lIGFyb3VuZC4gSXQgY2FuIGJlIHVzZWZ1bCBmb3IgdHJhY2sgZG93blxuICAgIC8vIHJhbmRvbSBjbGllbnRzIHN0b3BwaW5nIGluIHRoZSBtaWRkbGUgb2YgdGhlIGxvZ3MuXG4gICAgbG9nZ2VyLmxvZyhcIlNvZnQgbG9nb3V0IGluaXRpYXRlZFwiKTtcbiAgICBfaXNMb2dnaW5nT3V0ID0gdHJ1ZTsgLy8gdG8gYXZvaWQgcmVwZWF0ZWQgZmxhZ3NcbiAgICAvLyBFbnN1cmUgdGhhdCB3ZSBkaXNwYXRjaCBhIHZpZXcgY2hhbmdlICoqYmVmb3JlKiogc3RvcHBpbmcgdGhlIGNsaWVudCBzb1xuICAgIC8vIHNvIHRoYXQgUmVhY3QgY29tcG9uZW50cyB1bm1vdW50IGZpcnN0LiBUaGlzIGF2b2lkcyBSZWFjdCBzb2Z0IGNyYXNoZXNcbiAgICAvLyB0aGF0IGNhbiBvY2N1ciB3aGVuIGNvbXBvbmVudHMgdHJ5IHRvIHVzZSBhIG51bGwgY2xpZW50LlxuICAgIGRpcy5kaXNwYXRjaCh7IGFjdGlvbjogJ29uX2NsaWVudF9ub3RfdmlhYmxlJyB9KTsgLy8gZ2VuZXJpYyB2ZXJzaW9uIG9mIG9uX2xvZ2dlZF9vdXRcbiAgICBzdG9wTWF0cml4Q2xpZW50KC8qdW5zZXRDbGllbnQ9Ki9mYWxzZSk7XG5cbiAgICAvLyBETyBOT1QgQ0FMTCBMT0dPVVQuIEEgc29mdCBsb2dvdXQgcHJlc2VydmVzIGRhdGEsIGxvZ291dCBkb2VzIG5vdC5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzU29mdExvZ291dCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJteF9zb2Z0X2xvZ291dFwiKSA9PT0gXCJ0cnVlXCI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0xvZ2dpbmdPdXQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIF9pc0xvZ2dpbmdPdXQ7XG59XG5cbi8qKlxuICogU3RhcnRzIHRoZSBtYXRyaXggY2xpZW50IGFuZCBhbGwgb3RoZXIgcmVhY3Qtc2RrIHNlcnZpY2VzIHRoYXRcbiAqIGxpc3RlbiBmb3IgZXZlbnRzIHdoaWxlIGEgc2Vzc2lvbiBpcyBsb2dnZWQgaW4uXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHN0YXJ0U3luY2luZyBUcnVlIChkZWZhdWx0KSB0byBhY3R1YWxseSBzdGFydFxuICogc3luY2luZyB0aGUgY2xpZW50LlxuICovXG5hc3luYyBmdW5jdGlvbiBzdGFydE1hdHJpeENsaWVudChzdGFydFN5bmNpbmcgPSB0cnVlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbG9nZ2VyLmxvZyhgTGlmZWN5Y2xlOiBTdGFydGluZyBNYXRyaXhDbGllbnRgKTtcblxuICAgIC8vIGRpc3BhdGNoIHRoaXMgYmVmb3JlIHN0YXJ0aW5nIHRoZSBtYXRyaXggY2xpZW50OiBpdCdzIHVzZWRcbiAgICAvLyB0byBhZGQgbGlzdGVuZXJzIGZvciB0aGUgJ3N5bmMnIGV2ZW50IHNvIG90aGVyd2lzZSB3ZSdkIGhhdmVcbiAgICAvLyBhIHJhY2UgY29uZGl0aW9uIChhbmQgd2UgbmVlZCB0byBkaXNwYXRjaCBzeW5jaHJvbm91c2x5IGZvciB0aGlzXG4gICAgLy8gdG8gd29yaykuXG4gICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiAnd2lsbF9zdGFydF9jbGllbnQnIH0sIHRydWUpO1xuXG4gICAgLy8gcmVzZXQgdGhpbmdzIGZpcnN0IGp1c3QgaW4gY2FzZVxuICAgIFR5cGluZ1N0b3JlLnNoYXJlZEluc3RhbmNlKCkucmVzZXQoKTtcbiAgICBUb2FzdFN0b3JlLnNoYXJlZEluc3RhbmNlKCkucmVzZXQoKTtcblxuICAgIERpYWxvZ09wZW5lci5pbnN0YW5jZS5wcmVwYXJlKCk7XG4gICAgTm90aWZpZXIuc3RhcnQoKTtcbiAgICBVc2VyQWN0aXZpdHkuc2hhcmVkSW5zdGFuY2UoKS5zdGFydCgpO1xuICAgIERNUm9vbU1hcC5tYWtlU2hhcmVkKCkuc3RhcnQoKTtcbiAgICBJbnRlZ3JhdGlvbk1hbmFnZXJzLnNoYXJlZEluc3RhbmNlKCkuc3RhcnRXYXRjaGluZygpO1xuICAgIEFjdGl2ZVdpZGdldFN0b3JlLmluc3RhbmNlLnN0YXJ0KCk7XG4gICAgTGVnYWN5Q2FsbEhhbmRsZXIuaW5zdGFuY2Uuc3RhcnQoKTtcblxuICAgIC8vIFN0YXJ0IE1qb2xuaXIgZXZlbiB0aG91Z2ggd2UgaGF2ZW4ndCBjaGVja2VkIHRoZSBmZWF0dXJlIGZsYWcgeWV0LiBTdGFydGluZ1xuICAgIC8vIHRoZSB0aGluZyBqdXN0IHdhc3RlcyBDUFUgY3ljbGVzLCBidXQgc2hvdWxkIHJlc3VsdCBpbiBubyBhY3R1YWwgZnVuY3Rpb25hbGl0eVxuICAgIC8vIGJlaW5nIGV4cG9zZWQgdG8gdGhlIHVzZXIuXG4gICAgTWpvbG5pci5zaGFyZWRJbnN0YW5jZSgpLnN0YXJ0KCk7XG5cbiAgICBpZiAoc3RhcnRTeW5jaW5nKSB7XG4gICAgICAgIC8vIFRoZSBjbGllbnQgbWlnaHQgd2FudCB0byBwb3B1bGF0ZSBzb21lIHZpZXdzIHdpdGggZXZlbnRzIGZyb20gdGhlXG4gICAgICAgIC8vIGluZGV4IChlLmcuIHRoZSBGaWxlUGFuZWwpLCB0aGVyZWZvcmUgaW5pdGlhbGl6ZSB0aGUgZXZlbnQgaW5kZXhcbiAgICAgICAgLy8gYmVmb3JlIHRoZSBjbGllbnQuXG4gICAgICAgIGF3YWl0IEV2ZW50SW5kZXhQZWcuaW5pdCgpO1xuICAgICAgICBhd2FpdCBNYXRyaXhDbGllbnRQZWcuc3RhcnQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsb2dnZXIud2FybihcIkNhbGxlciByZXF1ZXN0ZWQgb25seSBhdXhpbGlhcnkgc2VydmljZXMgYmUgc3RhcnRlZFwiKTtcbiAgICAgICAgYXdhaXQgTWF0cml4Q2xpZW50UGVnLmFzc2lnbigpO1xuICAgIH1cblxuICAgIC8vIFJ1biB0aGUgbWlncmF0aW9ucyBhZnRlciB0aGUgTWF0cml4Q2xpZW50UGVnIGhhcyBiZWVuIGFzc2lnbmVkXG4gICAgU2V0dGluZ3NTdG9yZS5ydW5NaWdyYXRpb25zKCk7XG5cbiAgICAvLyBUaGlzIG5lZWRzIHRvIGJlIHN0YXJ0ZWQgYWZ0ZXIgY3J5cHRvIGlzIHNldCB1cFxuICAgIERldmljZUxpc3RlbmVyLnNoYXJlZEluc3RhbmNlKCkuc3RhcnQoKTtcbiAgICAvLyBTaW1pbGFybHksIGRvbid0IHN0YXJ0IHNlbmRpbmcgcHJlc2VuY2UgdXBkYXRlcyB1bnRpbCB3ZSd2ZSBzdGFydGVkXG4gICAgLy8gdGhlIGNsaWVudFxuICAgIGlmICghU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImxvd0JhbmR3aWR0aFwiKSkge1xuICAgICAgICBQcmVzZW5jZS5zdGFydCgpO1xuICAgIH1cblxuICAgIC8vIE5vdyB0aGF0IHdlIGhhdmUgYSBNYXRyaXhDbGllbnRQZWcsIHVwZGF0ZSB0aGUgSml0c2kgaW5mb1xuICAgIEppdHNpLmdldEluc3RhbmNlKCkuc3RhcnQoKTtcblxuICAgIC8vIGRpc3BhdGNoIHRoYXQgd2UgZmluaXNoZWQgc3RhcnRpbmcgdXAgdG8gd2lyZSB1cCBhbnkgb3RoZXIgYml0c1xuICAgIC8vIG9mIHRoZSBtYXRyaXggY2xpZW50IHRoYXQgY2Fubm90IGJlIHNldCBwcmlvciB0byBzdGFydGluZyB1cC5cbiAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246ICdjbGllbnRfc3RhcnRlZCcgfSk7XG5cbiAgICBpZiAoaXNTb2Z0TG9nb3V0KCkpIHtcbiAgICAgICAgc29mdExvZ291dCgpO1xuICAgIH1cbn1cblxuLypcbiAqIFN0b3BzIGEgcnVubmluZyBjbGllbnQgYW5kIGFsbCByZWxhdGVkIHNlcnZpY2VzLCBhbmQgY2xlYXJzIHBlcnNpc3RlbnRcbiAqIHN0b3JhZ2UuIFVzZWQgYWZ0ZXIgYSBzZXNzaW9uIGhhcyBiZWVuIGxvZ2dlZCBvdXQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvbkxvZ2dlZE91dCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBFbnN1cmUgdGhhdCB3ZSBkaXNwYXRjaCBhIHZpZXcgY2hhbmdlICoqYmVmb3JlKiogc3RvcHBpbmcgdGhlIGNsaWVudCxcbiAgICAvLyB0aGF0IFJlYWN0IGNvbXBvbmVudHMgdW5tb3VudCBmaXJzdC4gVGhpcyBhdm9pZHMgUmVhY3Qgc29mdCBjcmFzaGVzXG4gICAgLy8gdGhhdCBjYW4gb2NjdXIgd2hlbiBjb21wb25lbnRzIHRyeSB0byB1c2UgYSBudWxsIGNsaWVudC5cbiAgICBkaXMuZmlyZShBY3Rpb24uT25Mb2dnZWRPdXQsIHRydWUpO1xuICAgIHN0b3BNYXRyaXhDbGllbnQoKTtcbiAgICBhd2FpdCBjbGVhclN0b3JhZ2UoeyBkZWxldGVFdmVyeXRoaW5nOiB0cnVlIH0pO1xuICAgIExpZmVjeWNsZUN1c3RvbWlzYXRpb25zLm9uTG9nZ2VkT3V0QW5kU3RvcmFnZUNsZWFyZWQ/LigpO1xuXG4gICAgLy8gRG8gdGhpcyBsYXN0LCBzbyB3ZSBjYW4gbWFrZSBzdXJlIGFsbCBzdG9yYWdlIGhhcyBiZWVuIGNsZWFyZWQgYW5kIGFsbFxuICAgIC8vIGN1c3RvbWlzYXRpb25zIGdvdCB0aGUgbWVtby5cbiAgICBpZiAoU2RrQ29uZmlnLmdldCgpLmxvZ291dF9yZWRpcmVjdF91cmwpIHtcbiAgICAgICAgbG9nZ2VyLmxvZyhcIlJlZGlyZWN0aW5nIHRvIGV4dGVybmFsIHByb3ZpZGVyIHRvIGZpbmlzaCBsb2dvdXRcIik7XG4gICAgICAgIC8vIFhYWDogRGVmZXIgdGhpcyBzbyB0aGF0IGl0IGRvZXNuJ3QgcmFjZSB3aXRoIE1hdHJpeENoYXQgdW5tb3VudGluZyB0aGUgd29ybGQgYnkgZ29pbmcgdG8gLyMvbG9naW5cbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IFNka0NvbmZpZy5nZXQoKS5sb2dvdXRfcmVkaXJlY3RfdXJsO1xuICAgICAgICB9LCAxMDApO1xuICAgIH1cbiAgICAvLyBEbyB0aGlzIGxhc3QgdG8gcHJldmVudCByYWNpbmcgYHN0b3BNYXRyaXhDbGllbnRgIGFuZCBgb25fbG9nZ2VkX291dGAgd2l0aCBNYXRyaXhDaGF0IGhhbmRsaW5nIFNlc3Npb24ubG9nZ2VkX291dFxuICAgIF9pc0xvZ2dpbmdPdXQgPSBmYWxzZTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0cyBPcHRpb25zIGZvciBob3cgdG8gY2xlYXIgc3RvcmFnZS5cbiAqIEByZXR1cm5zIHtQcm9taXNlfSBwcm9taXNlIHdoaWNoIHJlc29sdmVzIG9uY2UgdGhlIHN0b3JlcyBoYXZlIGJlZW4gY2xlYXJlZFxuICovXG5hc3luYyBmdW5jdGlvbiBjbGVhclN0b3JhZ2Uob3B0cz86IHsgZGVsZXRlRXZlcnl0aGluZz86IGJvb2xlYW4gfSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh3aW5kb3cubG9jYWxTdG9yYWdlKSB7XG4gICAgICAgIC8vIHRyeSB0byBzYXZlIGFueSAzcGlkIGludml0ZXMgZnJvbSBiZWluZyBvYmxpdGVyYXRlZCBhbmQgcmVnaXN0cmF0aW9uIHRpbWVcbiAgICAgICAgY29uc3QgcGVuZGluZ0ludml0ZXMgPSBUaHJlZXBpZEludml0ZVN0b3JlLmluc3RhbmNlLmdldFdpcmVJbnZpdGVzKCk7XG4gICAgICAgIGNvbnN0IHJlZ2lzdHJhdGlvblRpbWUgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJteF9yZWdpc3RyYXRpb25fdGltZVwiKTtcblxuICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLmNsZWFyKCk7XG4gICAgICAgIEFic3RyYWN0TG9jYWxTdG9yYWdlU2V0dGluZ3NIYW5kbGVyLmNsZWFyKCk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IFN0b3JhZ2VNYW5hZ2VyLmlkYkRlbGV0ZShcImFjY291bnRcIiwgXCJteF9hY2Nlc3NfdG9rZW5cIik7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcImlkYkRlbGV0ZSBmYWlsZWQgZm9yIGFjY291bnQ6bXhfYWNjZXNzX3Rva2VuXCIsIGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbm93IHJlc3RvcmUgdGhvc2UgaW52aXRlcyBhbmQgcmVnaXN0cmF0aW9uIHRpbWVcbiAgICAgICAgaWYgKCFvcHRzPy5kZWxldGVFdmVyeXRoaW5nKSB7XG4gICAgICAgICAgICBwZW5kaW5nSW52aXRlcy5mb3JFYWNoKGkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb21JZCA9IGkucm9vbUlkO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBpLnJvb21JZDsgLy8gZGVsZXRlIHRvIGF2b2lkIGNvbmZ1c2luZyB0aGUgc3RvcmVcbiAgICAgICAgICAgICAgICBUaHJlZXBpZEludml0ZVN0b3JlLmluc3RhbmNlLnN0b3JlSW52aXRlKHJvb21JZCwgaSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKHJlZ2lzdHJhdGlvblRpbWUpIHtcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJteF9yZWdpc3RyYXRpb25fdGltZVwiLCByZWdpc3RyYXRpb25UaW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZT8uY2xlYXIoKTtcblxuICAgIC8vIGNyZWF0ZSBhIHRlbXBvcmFyeSBjbGllbnQgdG8gY2xlYXIgb3V0IHRoZSBwZXJzaXN0ZW50IHN0b3Jlcy5cbiAgICBjb25zdCBjbGkgPSBjcmVhdGVNYXRyaXhDbGllbnQoe1xuICAgICAgICAvLyB3ZSdsbCBuZXZlciBtYWtlIGFueSByZXF1ZXN0cywgc28gY2FuIHBhc3MgYSBib2d1cyBIUyBVUkxcbiAgICAgICAgYmFzZVVybDogXCJcIixcbiAgICB9KTtcblxuICAgIGF3YWl0IEV2ZW50SW5kZXhQZWcuZGVsZXRlRXZlbnRJbmRleCgpO1xuICAgIGF3YWl0IGNsaS5jbGVhclN0b3JlcygpO1xufVxuXG4vKipcbiAqIFN0b3AgYWxsIHRoZSBiYWNrZ3JvdW5kIHByb2Nlc3NlcyByZWxhdGVkIHRvIHRoZSBjdXJyZW50IGNsaWVudC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gdW5zZXRDbGllbnQgVHJ1ZSAoZGVmYXVsdCkgdG8gYWJhbmRvbiB0aGUgY2xpZW50XG4gKiBvbiBNYXRyaXhDbGllbnRQZWcgYWZ0ZXIgc3RvcHBpbmcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdG9wTWF0cml4Q2xpZW50KHVuc2V0Q2xpZW50ID0gdHJ1ZSk6IHZvaWQge1xuICAgIE5vdGlmaWVyLnN0b3AoKTtcbiAgICBMZWdhY3lDYWxsSGFuZGxlci5pbnN0YW5jZS5zdG9wKCk7XG4gICAgVXNlckFjdGl2aXR5LnNoYXJlZEluc3RhbmNlKCkuc3RvcCgpO1xuICAgIFR5cGluZ1N0b3JlLnNoYXJlZEluc3RhbmNlKCkucmVzZXQoKTtcbiAgICBQcmVzZW5jZS5zdG9wKCk7XG4gICAgQWN0aXZlV2lkZ2V0U3RvcmUuaW5zdGFuY2Uuc3RvcCgpO1xuICAgIEludGVncmF0aW9uTWFuYWdlcnMuc2hhcmVkSW5zdGFuY2UoKS5zdG9wV2F0Y2hpbmcoKTtcbiAgICBNam9sbmlyLnNoYXJlZEluc3RhbmNlKCkuc3RvcCgpO1xuICAgIERldmljZUxpc3RlbmVyLnNoYXJlZEluc3RhbmNlKCkuc3RvcCgpO1xuICAgIERNUm9vbU1hcC5zaGFyZWQoKT8uc3RvcCgpO1xuICAgIEV2ZW50SW5kZXhQZWcuc3RvcCgpO1xuICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICBpZiAoY2xpKSB7XG4gICAgICAgIGNsaS5zdG9wQ2xpZW50KCk7XG4gICAgICAgIGNsaS5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcblxuICAgICAgICBpZiAodW5zZXRDbGllbnQpIHtcbiAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy51bnNldCgpO1xuICAgICAgICAgICAgRXZlbnRJbmRleFBlZy51bnNldCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vLyBVdGlsaXR5IG1ldGhvZCB0byBwZXJmb3JtIGEgbG9naW4gd2l0aCBhbiBleGlzdGluZyBhY2Nlc3NfdG9rZW5cbndpbmRvdy5teExvZ2luV2l0aEFjY2Vzc1Rva2VuID0gYXN5bmMgKGhzVXJsOiBzdHJpbmcsIGFjY2Vzc1Rva2VuOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCB0ZW1wQ2xpZW50ID0gY3JlYXRlQ2xpZW50KHtcbiAgICAgICAgYmFzZVVybDogaHNVcmwsXG4gICAgICAgIGFjY2Vzc1Rva2VuLFxuICAgIH0pO1xuICAgIGNvbnN0IHsgdXNlcl9pZDogdXNlcklkIH0gPSBhd2FpdCB0ZW1wQ2xpZW50Lndob2FtaSgpO1xuICAgIGF3YWl0IGRvU2V0TG9nZ2VkSW4oe1xuICAgICAgICBob21lc2VydmVyVXJsOiBoc1VybCxcbiAgICAgICAgYWNjZXNzVG9rZW4sXG4gICAgICAgIHVzZXJJZCxcbiAgICB9LCB0cnVlKTtcbn07XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtQkE7O0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQTlEQTtBQUNBO0FBQ0E7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