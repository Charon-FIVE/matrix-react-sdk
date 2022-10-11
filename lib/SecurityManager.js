"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AccessCancelledError = void 0;
exports.accessSecretStorage = accessSecretStorage;
exports.crossSigningCallbacks = void 0;
exports.getDehydrationKey = getDehydrationKey;
exports.isSecretStorageBeingAccessed = isSecretStorageBeingAccessed;
exports.promptForBackupPassphrase = promptForBackupPassphrase;
exports.tryToUnlockSecretStorageWithDehydrationKey = tryToUnlockSecretStorageWithDehydrationKey;

var _key_passphrase = require("matrix-js-sdk/src/crypto/key_passphrase");

var _recoverykey = require("matrix-js-sdk/src/crypto/recoverykey");

var _olmlib = require("matrix-js-sdk/src/crypto/olmlib");

var _logger = require("matrix-js-sdk/src/logger");

var _Modal = _interopRequireDefault(require("./Modal"));

var _MatrixClientPeg = require("./MatrixClientPeg");

var _languageHandler = require("./languageHandler");

var _WellKnownUtils = require("./utils/WellKnownUtils");

var _AccessSecretStorageDialog = _interopRequireDefault(require("./components/views/dialogs/security/AccessSecretStorageDialog"));

var _RestoreKeyBackupDialog = _interopRequireDefault(require("./components/views/dialogs/security/RestoreKeyBackupDialog"));

var _SettingsStore = _interopRequireDefault(require("./settings/SettingsStore"));

var _Security = _interopRequireDefault(require("./customisations/Security"));

var _QuestionDialog = _interopRequireDefault(require("./components/views/dialogs/QuestionDialog"));

var _InteractiveAuthDialog = _interopRequireDefault(require("./components/views/dialogs/InteractiveAuthDialog"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// This stores the secret storage private keys in memory for the JS SDK. This is
// only meant to act as a cache to avoid prompting the user multiple times
// during the same single operation. Use `accessSecretStorage` below to scope a
// single secret storage operation, as it will clear the cached keys once the
// operation ends.
let secretStorageKeys = {};
let secretStorageKeyInfo = {};
let secretStorageBeingAccessed = false;
let nonInteractive = false;
let dehydrationCache = {};

function isCachingAllowed() {
  return secretStorageBeingAccessed;
}
/**
 * This can be used by other components to check if secret storage access is in
 * progress, so that we can e.g. avoid intermittently showing toasts during
 * secret storage setup.
 *
 * @returns {bool}
 */


function isSecretStorageBeingAccessed() {
  return secretStorageBeingAccessed;
}

class AccessCancelledError extends Error {
  constructor() {
    super("Secret storage access canceled");
  }

}

exports.AccessCancelledError = AccessCancelledError;

async function confirmToDismiss() {
  const [sure] = await _Modal.default.createDialog(_QuestionDialog.default, {
    title: (0, _languageHandler._t)("Cancel entering passphrase?"),
    description: (0, _languageHandler._t)("Are you sure you want to cancel entering passphrase?"),
    danger: false,
    button: (0, _languageHandler._t)("Go Back"),
    cancelButton: (0, _languageHandler._t)("Cancel")
  }).finished;
  return !sure;
}

function makeInputToKey(keyInfo) {
  return async _ref => {
    let {
      passphrase,
      recoveryKey
    } = _ref;

    if (passphrase) {
      return (0, _key_passphrase.deriveKey)(passphrase, keyInfo.passphrase.salt, keyInfo.passphrase.iterations);
    } else {
      return (0, _recoverykey.decodeRecoveryKey)(recoveryKey);
    }
  };
}

async function getSecretStorageKey(_ref2) {
  let {
    keys: keyInfos
  } = _ref2;

  const cli = _MatrixClientPeg.MatrixClientPeg.get();

  let keyId = await cli.getDefaultSecretStorageKeyId();
  let keyInfo;

  if (keyId) {
    // use the default SSSS key if set
    keyInfo = keyInfos[keyId];

    if (!keyInfo) {
      // if the default key is not available, pretend the default key
      // isn't set
      keyId = undefined;
    }
  }

  if (!keyId) {
    // if no default SSSS key is set, fall back to a heuristic of using the
    // only available key, if only one key is set
    const keyInfoEntries = Object.entries(keyInfos);

    if (keyInfoEntries.length > 1) {
      throw new Error("Multiple storage key requests not implemented");
    }

    [keyId, keyInfo] = keyInfoEntries[0];
  } // Check the in-memory cache


  if (isCachingAllowed() && secretStorageKeys[keyId]) {
    return [keyId, secretStorageKeys[keyId]];
  }

  if (dehydrationCache.key) {
    if (await _MatrixClientPeg.MatrixClientPeg.get().checkSecretStorageKey(dehydrationCache.key, keyInfo)) {
      cacheSecretStorageKey(keyId, keyInfo, dehydrationCache.key);
      return [keyId, dehydrationCache.key];
    }
  }

  const keyFromCustomisations = _Security.default.getSecretStorageKey?.();

  if (keyFromCustomisations) {
    _logger.logger.log("Using key from security customisations (secret storage)");

    cacheSecretStorageKey(keyId, keyInfo, keyFromCustomisations);
    return [keyId, keyFromCustomisations];
  }

  if (nonInteractive) {
    throw new Error("Could not unlock non-interactively");
  }

  const inputToKey = makeInputToKey(keyInfo);

  const {
    finished
  } = _Modal.default.createDialog(_AccessSecretStorageDialog.default,
  /* props= */
  {
    keyInfo,
    checkPrivateKey: async input => {
      const key = await inputToKey(input);
      return _MatrixClientPeg.MatrixClientPeg.get().checkSecretStorageKey(key, keyInfo);
    }
  },
  /* className= */
  null,
  /* isPriorityModal= */
  false,
  /* isStaticModal= */
  false,
  /* options= */
  {
    onBeforeClose: async reason => {
      if (reason === "backgroundClick") {
        return confirmToDismiss();
      }

      return true;
    }
  });

  const [keyParams] = await finished;

  if (!keyParams) {
    throw new AccessCancelledError();
  }

  const key = await inputToKey(keyParams); // Save to cache to avoid future prompts in the current session

  cacheSecretStorageKey(keyId, keyInfo, key);
  return [keyId, key];
}

async function getDehydrationKey(keyInfo, checkFunc) {
  const keyFromCustomisations = _Security.default.getSecretStorageKey?.();

  if (keyFromCustomisations) {
    _logger.logger.log("Using key from security customisations (dehydration)");

    return keyFromCustomisations;
  }

  const inputToKey = makeInputToKey(keyInfo);

  const {
    finished
  } = _Modal.default.createDialog(_AccessSecretStorageDialog.default,
  /* props= */
  {
    keyInfo,
    checkPrivateKey: async input => {
      const key = await inputToKey(input);

      try {
        checkFunc(key);
        return true;
      } catch (e) {
        return false;
      }
    }
  },
  /* className= */
  null,
  /* isPriorityModal= */
  false,
  /* isStaticModal= */
  false,
  /* options= */
  {
    onBeforeClose: async reason => {
      if (reason === "backgroundClick") {
        return confirmToDismiss();
      }

      return true;
    }
  });

  const [input] = await finished;

  if (!input) {
    throw new AccessCancelledError();
  }

  const key = await inputToKey(input); // need to copy the key because rehydration (unpickling) will clobber it

  dehydrationCache = {
    key: new Uint8Array(key),
    keyInfo
  };
  return key;
}

function cacheSecretStorageKey(keyId, keyInfo, key) {
  if (isCachingAllowed()) {
    secretStorageKeys[keyId] = key;
    secretStorageKeyInfo[keyId] = keyInfo;
  }
}

async function onSecretRequested(userId, deviceId, requestId, name, deviceTrust) {
  _logger.logger.log("onSecretRequested", userId, deviceId, requestId, name, deviceTrust);

  const client = _MatrixClientPeg.MatrixClientPeg.get();

  if (userId !== client.getUserId()) {
    return;
  }

  if (!deviceTrust?.isVerified()) {
    _logger.logger.log(`Ignoring secret request from untrusted device ${deviceId}`);

    return;
  }

  if (name === "m.cross_signing.master" || name === "m.cross_signing.self_signing" || name === "m.cross_signing.user_signing") {
    const callbacks = client.getCrossSigningCacheCallbacks();
    if (!callbacks.getCrossSigningKeyCache) return;
    const keyId = name.replace("m.cross_signing.", "");
    const key = await callbacks.getCrossSigningKeyCache(keyId);

    if (!key) {
      _logger.logger.log(`${keyId} requested by ${deviceId}, but not found in cache`);
    }

    return key && (0, _olmlib.encodeBase64)(key);
  } else if (name === "m.megolm_backup.v1") {
    const key = await client.crypto.getSessionBackupPrivateKey();

    if (!key) {
      _logger.logger.log(`session backup key requested by ${deviceId}, but not found in cache`);
    }

    return key && (0, _olmlib.encodeBase64)(key);
  }

  _logger.logger.warn("onSecretRequested didn't recognise the secret named ", name);
}

const crossSigningCallbacks = {
  getSecretStorageKey,
  cacheSecretStorageKey,
  onSecretRequested,
  getDehydrationKey
};
exports.crossSigningCallbacks = crossSigningCallbacks;

async function promptForBackupPassphrase() {
  let key;

  const {
    finished
  } = _Modal.default.createDialog(_RestoreKeyBackupDialog.default, {
    showSummary: false,
    keyCallback: k => key = k
  }, null,
  /* priority = */
  false,
  /* static = */
  true);

  const success = await finished;
  if (!success) throw new Error("Key backup prompt cancelled");
  return key;
}
/**
 * This helper should be used whenever you need to access secret storage. It
 * ensures that secret storage (and also cross-signing since they each depend on
 * each other in a cycle of sorts) have been bootstrapped before running the
 * provided function.
 *
 * Bootstrapping secret storage may take one of these paths:
 * 1. Create secret storage from a passphrase and store cross-signing keys
 *    in secret storage.
 * 2. Access existing secret storage by requesting passphrase and accessing
 *    cross-signing keys as needed.
 * 3. All keys are loaded and there's nothing to do.
 *
 * Additionally, the secret storage keys are cached during the scope of this function
 * to ensure the user is prompted only once for their secret storage
 * passphrase. The cache is then cleared once the provided function completes.
 *
 * @param {Function} [func] An operation to perform once secret storage has been
 * bootstrapped. Optional.
 * @param {bool} [forceReset] Reset secret storage even if it's already set up
 */


async function accessSecretStorage() {
  let func = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : async () => {};
  let forceReset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  const cli = _MatrixClientPeg.MatrixClientPeg.get();

  secretStorageBeingAccessed = true;

  try {
    if (!(await cli.hasSecretStorageKey()) || forceReset) {
      // This dialog calls bootstrap itself after guiding the user through
      // passphrase creation.
      const {
        finished
      } = _Modal.default.createDialogAsync(Promise.resolve().then(() => _interopRequireWildcard(require("./async-components/views/dialogs/security/CreateSecretStorageDialog"))), {
        forceReset
      }, null,
      /* priority = */
      false,
      /* static = */
      true,
      /* options = */
      {
        onBeforeClose: async reason => {
          // If Secure Backup is required, you cannot leave the modal.
          if (reason === "backgroundClick") {
            return !(0, _WellKnownUtils.isSecureBackupRequired)();
          }

          return true;
        }
      });

      const [confirmed] = await finished;

      if (!confirmed) {
        throw new Error("Secret storage creation canceled");
      }
    } else {
      await cli.bootstrapCrossSigning({
        authUploadDeviceSigningKeys: async makeRequest => {
          const {
            finished
          } = _Modal.default.createDialog(_InteractiveAuthDialog.default, {
            title: (0, _languageHandler._t)("Setting up keys"),
            matrixClient: cli,
            makeRequest
          });

          const [confirmed] = await finished;

          if (!confirmed) {
            throw new Error("Cross-signing key upload auth canceled");
          }
        }
      });
      await cli.bootstrapSecretStorage({
        getKeyBackupPassphrase: promptForBackupPassphrase
      });
      const keyId = Object.keys(secretStorageKeys)[0];

      if (keyId && _SettingsStore.default.getValue("feature_dehydration")) {
        let dehydrationKeyInfo = {};

        if (secretStorageKeyInfo[keyId] && secretStorageKeyInfo[keyId].passphrase) {
          dehydrationKeyInfo = {
            passphrase: secretStorageKeyInfo[keyId].passphrase
          };
        }

        _logger.logger.log("Setting dehydration key");

        await cli.setDehydrationKey(secretStorageKeys[keyId], dehydrationKeyInfo, "Backup device");
      } else if (!keyId) {
        _logger.logger.warn("Not setting dehydration key: no SSSS key found");
      } else {
        _logger.logger.log("Not setting dehydration key: feature disabled");
      }
    } // `return await` needed here to ensure `finally` block runs after the
    // inner operation completes.


    return await func();
  } catch (e) {
    _Security.default.catchAccessSecretStorageError?.(e);

    _logger.logger.error(e); // Re-throw so that higher level logic can abort as needed


    throw e;
  } finally {
    // Clear secret storage key cache now that work is complete
    secretStorageBeingAccessed = false;

    if (!isCachingAllowed()) {
      secretStorageKeys = {};
      secretStorageKeyInfo = {};
    }
  }
} // FIXME: this function name is a bit of a mouthful


async function tryToUnlockSecretStorageWithDehydrationKey(client) {
  const key = dehydrationCache.key;
  let restoringBackup = false;

  if (key && (await client.isSecretStorageReady())) {
    _logger.logger.log("Trying to set up cross-signing using dehydration key");

    secretStorageBeingAccessed = true;
    nonInteractive = true;

    try {
      await client.checkOwnCrossSigningTrust(); // we also need to set a new dehydrated device to replace the
      // device we rehydrated

      let dehydrationKeyInfo = {};

      if (dehydrationCache.keyInfo && dehydrationCache.keyInfo.passphrase) {
        dehydrationKeyInfo = {
          passphrase: dehydrationCache.keyInfo.passphrase
        };
      }

      await client.setDehydrationKey(key, dehydrationKeyInfo, "Backup device"); // and restore from backup

      const backupInfo = await client.getKeyBackupVersion();

      if (backupInfo) {
        restoringBackup = true; // don't await, because this can take a long time

        client.restoreKeyBackupWithSecretStorage(backupInfo).finally(() => {
          secretStorageBeingAccessed = false;
          nonInteractive = false;

          if (!isCachingAllowed()) {
            secretStorageKeys = {};
            secretStorageKeyInfo = {};
          }
        });
      }
    } finally {
      dehydrationCache = {}; // the secret storage cache is needed for restoring from backup, so
      // don't clear it yet if we're restoring from backup

      if (!restoringBackup) {
        secretStorageBeingAccessed = false;
        nonInteractive = false;

        if (!isCachingAllowed()) {
          secretStorageKeys = {};
          secretStorageKeyInfo = {};
        }
      }
    }
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzZWNyZXRTdG9yYWdlS2V5cyIsInNlY3JldFN0b3JhZ2VLZXlJbmZvIiwic2VjcmV0U3RvcmFnZUJlaW5nQWNjZXNzZWQiLCJub25JbnRlcmFjdGl2ZSIsImRlaHlkcmF0aW9uQ2FjaGUiLCJpc0NhY2hpbmdBbGxvd2VkIiwiaXNTZWNyZXRTdG9yYWdlQmVpbmdBY2Nlc3NlZCIsIkFjY2Vzc0NhbmNlbGxlZEVycm9yIiwiRXJyb3IiLCJjb25zdHJ1Y3RvciIsImNvbmZpcm1Ub0Rpc21pc3MiLCJzdXJlIiwiTW9kYWwiLCJjcmVhdGVEaWFsb2ciLCJRdWVzdGlvbkRpYWxvZyIsInRpdGxlIiwiX3QiLCJkZXNjcmlwdGlvbiIsImRhbmdlciIsImJ1dHRvbiIsImNhbmNlbEJ1dHRvbiIsImZpbmlzaGVkIiwibWFrZUlucHV0VG9LZXkiLCJrZXlJbmZvIiwicGFzc3BocmFzZSIsInJlY292ZXJ5S2V5IiwiZGVyaXZlS2V5Iiwic2FsdCIsIml0ZXJhdGlvbnMiLCJkZWNvZGVSZWNvdmVyeUtleSIsImdldFNlY3JldFN0b3JhZ2VLZXkiLCJrZXlzIiwia2V5SW5mb3MiLCJjbGkiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJrZXlJZCIsImdldERlZmF1bHRTZWNyZXRTdG9yYWdlS2V5SWQiLCJ1bmRlZmluZWQiLCJrZXlJbmZvRW50cmllcyIsIk9iamVjdCIsImVudHJpZXMiLCJsZW5ndGgiLCJrZXkiLCJjaGVja1NlY3JldFN0b3JhZ2VLZXkiLCJjYWNoZVNlY3JldFN0b3JhZ2VLZXkiLCJrZXlGcm9tQ3VzdG9taXNhdGlvbnMiLCJTZWN1cml0eUN1c3RvbWlzYXRpb25zIiwibG9nZ2VyIiwibG9nIiwiaW5wdXRUb0tleSIsIkFjY2Vzc1NlY3JldFN0b3JhZ2VEaWFsb2ciLCJjaGVja1ByaXZhdGVLZXkiLCJpbnB1dCIsIm9uQmVmb3JlQ2xvc2UiLCJyZWFzb24iLCJrZXlQYXJhbXMiLCJnZXREZWh5ZHJhdGlvbktleSIsImNoZWNrRnVuYyIsImUiLCJVaW50OEFycmF5Iiwib25TZWNyZXRSZXF1ZXN0ZWQiLCJ1c2VySWQiLCJkZXZpY2VJZCIsInJlcXVlc3RJZCIsIm5hbWUiLCJkZXZpY2VUcnVzdCIsImNsaWVudCIsImdldFVzZXJJZCIsImlzVmVyaWZpZWQiLCJjYWxsYmFja3MiLCJnZXRDcm9zc1NpZ25pbmdDYWNoZUNhbGxiYWNrcyIsImdldENyb3NzU2lnbmluZ0tleUNhY2hlIiwicmVwbGFjZSIsImVuY29kZUJhc2U2NCIsImNyeXB0byIsImdldFNlc3Npb25CYWNrdXBQcml2YXRlS2V5Iiwid2FybiIsImNyb3NzU2lnbmluZ0NhbGxiYWNrcyIsInByb21wdEZvckJhY2t1cFBhc3NwaHJhc2UiLCJSZXN0b3JlS2V5QmFja3VwRGlhbG9nIiwic2hvd1N1bW1hcnkiLCJrZXlDYWxsYmFjayIsImsiLCJzdWNjZXNzIiwiYWNjZXNzU2VjcmV0U3RvcmFnZSIsImZ1bmMiLCJmb3JjZVJlc2V0IiwiaGFzU2VjcmV0U3RvcmFnZUtleSIsImNyZWF0ZURpYWxvZ0FzeW5jIiwiaXNTZWN1cmVCYWNrdXBSZXF1aXJlZCIsImNvbmZpcm1lZCIsImJvb3RzdHJhcENyb3NzU2lnbmluZyIsImF1dGhVcGxvYWREZXZpY2VTaWduaW5nS2V5cyIsIm1ha2VSZXF1ZXN0IiwiSW50ZXJhY3RpdmVBdXRoRGlhbG9nIiwibWF0cml4Q2xpZW50IiwiYm9vdHN0cmFwU2VjcmV0U3RvcmFnZSIsImdldEtleUJhY2t1cFBhc3NwaHJhc2UiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJkZWh5ZHJhdGlvbktleUluZm8iLCJzZXREZWh5ZHJhdGlvbktleSIsImNhdGNoQWNjZXNzU2VjcmV0U3RvcmFnZUVycm9yIiwiZXJyb3IiLCJ0cnlUb1VubG9ja1NlY3JldFN0b3JhZ2VXaXRoRGVoeWRyYXRpb25LZXkiLCJyZXN0b3JpbmdCYWNrdXAiLCJpc1NlY3JldFN0b3JhZ2VSZWFkeSIsImNoZWNrT3duQ3Jvc3NTaWduaW5nVHJ1c3QiLCJiYWNrdXBJbmZvIiwiZ2V0S2V5QmFja3VwVmVyc2lvbiIsInJlc3RvcmVLZXlCYWNrdXBXaXRoU2VjcmV0U3RvcmFnZSIsImZpbmFsbHkiXSwic291cmNlcyI6WyIuLi9zcmMvU2VjdXJpdHlNYW5hZ2VyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSwgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7IElDcnlwdG9DYWxsYmFja3MgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tYXRyaXgnO1xuaW1wb3J0IHsgSVNlY3JldFN0b3JhZ2VLZXlJbmZvIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvY3J5cHRvL2FwaSc7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnQgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9jbGllbnQnO1xuaW1wb3J0IHsgZGVyaXZlS2V5IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvY3J5cHRvL2tleV9wYXNzcGhyYXNlJztcbmltcG9ydCB7IGRlY29kZVJlY292ZXJ5S2V5IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvY3J5cHRvL3JlY292ZXJ5a2V5JztcbmltcG9ydCB7IGVuY29kZUJhc2U2NCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jcnlwdG8vb2xtbGliXCI7XG5pbXBvcnQgeyBEZXZpY2VUcnVzdExldmVsIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvY3J5cHRvL0Nyb3NzU2lnbmluZyc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5pbXBvcnQgeyBDb21wb25lbnRUeXBlIH0gZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCBNb2RhbCBmcm9tICcuL01vZGFsJztcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gJy4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHsgaXNTZWN1cmVCYWNrdXBSZXF1aXJlZCB9IGZyb20gJy4vdXRpbHMvV2VsbEtub3duVXRpbHMnO1xuaW1wb3J0IEFjY2Vzc1NlY3JldFN0b3JhZ2VEaWFsb2cgZnJvbSAnLi9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3Mvc2VjdXJpdHkvQWNjZXNzU2VjcmV0U3RvcmFnZURpYWxvZyc7XG5pbXBvcnQgUmVzdG9yZUtleUJhY2t1cERpYWxvZyBmcm9tICcuL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9zZWN1cml0eS9SZXN0b3JlS2V5QmFja3VwRGlhbG9nJztcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCBTZWN1cml0eUN1c3RvbWlzYXRpb25zIGZyb20gXCIuL2N1c3RvbWlzYXRpb25zL1NlY3VyaXR5XCI7XG5pbXBvcnQgUXVlc3Rpb25EaWFsb2cgZnJvbSBcIi4vY29tcG9uZW50cy92aWV3cy9kaWFsb2dzL1F1ZXN0aW9uRGlhbG9nXCI7XG5pbXBvcnQgSW50ZXJhY3RpdmVBdXRoRGlhbG9nIGZyb20gXCIuL2NvbXBvbmVudHMvdmlld3MvZGlhbG9ncy9JbnRlcmFjdGl2ZUF1dGhEaWFsb2dcIjtcblxuLy8gVGhpcyBzdG9yZXMgdGhlIHNlY3JldCBzdG9yYWdlIHByaXZhdGUga2V5cyBpbiBtZW1vcnkgZm9yIHRoZSBKUyBTREsuIFRoaXMgaXNcbi8vIG9ubHkgbWVhbnQgdG8gYWN0IGFzIGEgY2FjaGUgdG8gYXZvaWQgcHJvbXB0aW5nIHRoZSB1c2VyIG11bHRpcGxlIHRpbWVzXG4vLyBkdXJpbmcgdGhlIHNhbWUgc2luZ2xlIG9wZXJhdGlvbi4gVXNlIGBhY2Nlc3NTZWNyZXRTdG9yYWdlYCBiZWxvdyB0byBzY29wZSBhXG4vLyBzaW5nbGUgc2VjcmV0IHN0b3JhZ2Ugb3BlcmF0aW9uLCBhcyBpdCB3aWxsIGNsZWFyIHRoZSBjYWNoZWQga2V5cyBvbmNlIHRoZVxuLy8gb3BlcmF0aW9uIGVuZHMuXG5sZXQgc2VjcmV0U3RvcmFnZUtleXM6IFJlY29yZDxzdHJpbmcsIFVpbnQ4QXJyYXk+ID0ge307XG5sZXQgc2VjcmV0U3RvcmFnZUtleUluZm86IFJlY29yZDxzdHJpbmcsIElTZWNyZXRTdG9yYWdlS2V5SW5mbz4gPSB7fTtcbmxldCBzZWNyZXRTdG9yYWdlQmVpbmdBY2Nlc3NlZCA9IGZhbHNlO1xuXG5sZXQgbm9uSW50ZXJhY3RpdmUgPSBmYWxzZTtcblxubGV0IGRlaHlkcmF0aW9uQ2FjaGU6IHtcbiAgICBrZXk/OiBVaW50OEFycmF5O1xuICAgIGtleUluZm8/OiBJU2VjcmV0U3RvcmFnZUtleUluZm87XG59ID0ge307XG5cbmZ1bmN0aW9uIGlzQ2FjaGluZ0FsbG93ZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHNlY3JldFN0b3JhZ2VCZWluZ0FjY2Vzc2VkO1xufVxuXG4vKipcbiAqIFRoaXMgY2FuIGJlIHVzZWQgYnkgb3RoZXIgY29tcG9uZW50cyB0byBjaGVjayBpZiBzZWNyZXQgc3RvcmFnZSBhY2Nlc3MgaXMgaW5cbiAqIHByb2dyZXNzLCBzbyB0aGF0IHdlIGNhbiBlLmcuIGF2b2lkIGludGVybWl0dGVudGx5IHNob3dpbmcgdG9hc3RzIGR1cmluZ1xuICogc2VjcmV0IHN0b3JhZ2Ugc2V0dXAuXG4gKlxuICogQHJldHVybnMge2Jvb2x9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1NlY3JldFN0b3JhZ2VCZWluZ0FjY2Vzc2VkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBzZWNyZXRTdG9yYWdlQmVpbmdBY2Nlc3NlZDtcbn1cblxuZXhwb3J0IGNsYXNzIEFjY2Vzc0NhbmNlbGxlZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcihcIlNlY3JldCBzdG9yYWdlIGFjY2VzcyBjYW5jZWxlZFwiKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNvbmZpcm1Ub0Rpc21pc3MoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgW3N1cmVdID0gYXdhaXQgTW9kYWwuY3JlYXRlRGlhbG9nKFF1ZXN0aW9uRGlhbG9nLCB7XG4gICAgICAgIHRpdGxlOiBfdChcIkNhbmNlbCBlbnRlcmluZyBwYXNzcGhyYXNlP1wiKSxcbiAgICAgICAgZGVzY3JpcHRpb246IF90KFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGNhbmNlbCBlbnRlcmluZyBwYXNzcGhyYXNlP1wiKSxcbiAgICAgICAgZGFuZ2VyOiBmYWxzZSxcbiAgICAgICAgYnV0dG9uOiBfdChcIkdvIEJhY2tcIiksXG4gICAgICAgIGNhbmNlbEJ1dHRvbjogX3QoXCJDYW5jZWxcIiksXG4gICAgfSkuZmluaXNoZWQ7XG4gICAgcmV0dXJuICFzdXJlO1xufVxuXG50eXBlIEtleVBhcmFtcyA9IHsgcGFzc3BocmFzZTogc3RyaW5nLCByZWNvdmVyeUtleTogc3RyaW5nIH07XG5cbmZ1bmN0aW9uIG1ha2VJbnB1dFRvS2V5KFxuICAgIGtleUluZm86IElTZWNyZXRTdG9yYWdlS2V5SW5mbyxcbik6IChrZXlQYXJhbXM6IEtleVBhcmFtcykgPT4gUHJvbWlzZTxVaW50OEFycmF5PiB7XG4gICAgcmV0dXJuIGFzeW5jICh7IHBhc3NwaHJhc2UsIHJlY292ZXJ5S2V5IH0pID0+IHtcbiAgICAgICAgaWYgKHBhc3NwaHJhc2UpIHtcbiAgICAgICAgICAgIHJldHVybiBkZXJpdmVLZXkoXG4gICAgICAgICAgICAgICAgcGFzc3BocmFzZSxcbiAgICAgICAgICAgICAgICBrZXlJbmZvLnBhc3NwaHJhc2Uuc2FsdCxcbiAgICAgICAgICAgICAgICBrZXlJbmZvLnBhc3NwaHJhc2UuaXRlcmF0aW9ucyxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZGVjb2RlUmVjb3ZlcnlLZXkocmVjb3ZlcnlLZXkpO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0U2VjcmV0U3RvcmFnZUtleShcbiAgICB7IGtleXM6IGtleUluZm9zIH06IHsga2V5czogUmVjb3JkPHN0cmluZywgSVNlY3JldFN0b3JhZ2VLZXlJbmZvPiB9LFxuKTogUHJvbWlzZTxbc3RyaW5nLCBVaW50OEFycmF5XT4ge1xuICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICBsZXQga2V5SWQgPSBhd2FpdCBjbGkuZ2V0RGVmYXVsdFNlY3JldFN0b3JhZ2VLZXlJZCgpO1xuICAgIGxldCBrZXlJbmZvOiBJU2VjcmV0U3RvcmFnZUtleUluZm87XG4gICAgaWYgKGtleUlkKSB7XG4gICAgICAgIC8vIHVzZSB0aGUgZGVmYXVsdCBTU1NTIGtleSBpZiBzZXRcbiAgICAgICAga2V5SW5mbyA9IGtleUluZm9zW2tleUlkXTtcbiAgICAgICAgaWYgKCFrZXlJbmZvKSB7XG4gICAgICAgICAgICAvLyBpZiB0aGUgZGVmYXVsdCBrZXkgaXMgbm90IGF2YWlsYWJsZSwgcHJldGVuZCB0aGUgZGVmYXVsdCBrZXlcbiAgICAgICAgICAgIC8vIGlzbid0IHNldFxuICAgICAgICAgICAga2V5SWQgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFrZXlJZCkge1xuICAgICAgICAvLyBpZiBubyBkZWZhdWx0IFNTU1Mga2V5IGlzIHNldCwgZmFsbCBiYWNrIHRvIGEgaGV1cmlzdGljIG9mIHVzaW5nIHRoZVxuICAgICAgICAvLyBvbmx5IGF2YWlsYWJsZSBrZXksIGlmIG9ubHkgb25lIGtleSBpcyBzZXRcbiAgICAgICAgY29uc3Qga2V5SW5mb0VudHJpZXMgPSBPYmplY3QuZW50cmllcyhrZXlJbmZvcyk7XG4gICAgICAgIGlmIChrZXlJbmZvRW50cmllcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNdWx0aXBsZSBzdG9yYWdlIGtleSByZXF1ZXN0cyBub3QgaW1wbGVtZW50ZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgW2tleUlkLCBrZXlJbmZvXSA9IGtleUluZm9FbnRyaWVzWzBdO1xuICAgIH1cblxuICAgIC8vIENoZWNrIHRoZSBpbi1tZW1vcnkgY2FjaGVcbiAgICBpZiAoaXNDYWNoaW5nQWxsb3dlZCgpICYmIHNlY3JldFN0b3JhZ2VLZXlzW2tleUlkXSkge1xuICAgICAgICByZXR1cm4gW2tleUlkLCBzZWNyZXRTdG9yYWdlS2V5c1trZXlJZF1dO1xuICAgIH1cblxuICAgIGlmIChkZWh5ZHJhdGlvbkNhY2hlLmtleSkge1xuICAgICAgICBpZiAoYXdhaXQgTWF0cml4Q2xpZW50UGVnLmdldCgpLmNoZWNrU2VjcmV0U3RvcmFnZUtleShkZWh5ZHJhdGlvbkNhY2hlLmtleSwga2V5SW5mbykpIHtcbiAgICAgICAgICAgIGNhY2hlU2VjcmV0U3RvcmFnZUtleShrZXlJZCwga2V5SW5mbywgZGVoeWRyYXRpb25DYWNoZS5rZXkpO1xuICAgICAgICAgICAgcmV0dXJuIFtrZXlJZCwgZGVoeWRyYXRpb25DYWNoZS5rZXldO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qga2V5RnJvbUN1c3RvbWlzYXRpb25zID0gU2VjdXJpdHlDdXN0b21pc2F0aW9ucy5nZXRTZWNyZXRTdG9yYWdlS2V5Py4oKTtcbiAgICBpZiAoa2V5RnJvbUN1c3RvbWlzYXRpb25zKSB7XG4gICAgICAgIGxvZ2dlci5sb2coXCJVc2luZyBrZXkgZnJvbSBzZWN1cml0eSBjdXN0b21pc2F0aW9ucyAoc2VjcmV0IHN0b3JhZ2UpXCIpO1xuICAgICAgICBjYWNoZVNlY3JldFN0b3JhZ2VLZXkoa2V5SWQsIGtleUluZm8sIGtleUZyb21DdXN0b21pc2F0aW9ucyk7XG4gICAgICAgIHJldHVybiBba2V5SWQsIGtleUZyb21DdXN0b21pc2F0aW9uc107XG4gICAgfVxuXG4gICAgaWYgKG5vbkludGVyYWN0aXZlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCB1bmxvY2sgbm9uLWludGVyYWN0aXZlbHlcIik7XG4gICAgfVxuXG4gICAgY29uc3QgaW5wdXRUb0tleSA9IG1ha2VJbnB1dFRvS2V5KGtleUluZm8pO1xuICAgIGNvbnN0IHsgZmluaXNoZWQgfSA9IE1vZGFsLmNyZWF0ZURpYWxvZyhcbiAgICAgICAgQWNjZXNzU2VjcmV0U3RvcmFnZURpYWxvZyxcbiAgICAgICAgLyogcHJvcHM9ICovXG4gICAgICAgIHtcbiAgICAgICAgICAgIGtleUluZm8sXG4gICAgICAgICAgICBjaGVja1ByaXZhdGVLZXk6IGFzeW5jIChpbnB1dDogS2V5UGFyYW1zKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgaW5wdXRUb0tleShpbnB1dCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE1hdHJpeENsaWVudFBlZy5nZXQoKS5jaGVja1NlY3JldFN0b3JhZ2VLZXkoa2V5LCBrZXlJbmZvKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIC8qIGNsYXNzTmFtZT0gKi8gbnVsbCxcbiAgICAgICAgLyogaXNQcmlvcml0eU1vZGFsPSAqLyBmYWxzZSxcbiAgICAgICAgLyogaXNTdGF0aWNNb2RhbD0gKi8gZmFsc2UsXG4gICAgICAgIC8qIG9wdGlvbnM9ICovIHtcbiAgICAgICAgICAgIG9uQmVmb3JlQ2xvc2U6IGFzeW5jIChyZWFzb24pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVhc29uID09PSBcImJhY2tncm91bmRDbGlja1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb25maXJtVG9EaXNtaXNzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICApO1xuICAgIGNvbnN0IFtrZXlQYXJhbXNdID0gYXdhaXQgZmluaXNoZWQ7XG4gICAgaWYgKCFrZXlQYXJhbXMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEFjY2Vzc0NhbmNlbGxlZEVycm9yKCk7XG4gICAgfVxuICAgIGNvbnN0IGtleSA9IGF3YWl0IGlucHV0VG9LZXkoa2V5UGFyYW1zKTtcblxuICAgIC8vIFNhdmUgdG8gY2FjaGUgdG8gYXZvaWQgZnV0dXJlIHByb21wdHMgaW4gdGhlIGN1cnJlbnQgc2Vzc2lvblxuICAgIGNhY2hlU2VjcmV0U3RvcmFnZUtleShrZXlJZCwga2V5SW5mbywga2V5KTtcblxuICAgIHJldHVybiBba2V5SWQsIGtleV07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXREZWh5ZHJhdGlvbktleShcbiAgICBrZXlJbmZvOiBJU2VjcmV0U3RvcmFnZUtleUluZm8sXG4gICAgY2hlY2tGdW5jOiAoVWludDhBcnJheSkgPT4gdm9pZCxcbik6IFByb21pc2U8VWludDhBcnJheT4ge1xuICAgIGNvbnN0IGtleUZyb21DdXN0b21pc2F0aW9ucyA9IFNlY3VyaXR5Q3VzdG9taXNhdGlvbnMuZ2V0U2VjcmV0U3RvcmFnZUtleT8uKCk7XG4gICAgaWYgKGtleUZyb21DdXN0b21pc2F0aW9ucykge1xuICAgICAgICBsb2dnZXIubG9nKFwiVXNpbmcga2V5IGZyb20gc2VjdXJpdHkgY3VzdG9taXNhdGlvbnMgKGRlaHlkcmF0aW9uKVwiKTtcbiAgICAgICAgcmV0dXJuIGtleUZyb21DdXN0b21pc2F0aW9ucztcbiAgICB9XG5cbiAgICBjb25zdCBpbnB1dFRvS2V5ID0gbWFrZUlucHV0VG9LZXkoa2V5SW5mbyk7XG4gICAgY29uc3QgeyBmaW5pc2hlZCB9ID0gTW9kYWwuY3JlYXRlRGlhbG9nKFxuICAgICAgICBBY2Nlc3NTZWNyZXRTdG9yYWdlRGlhbG9nLFxuICAgICAgICAvKiBwcm9wcz0gKi9cbiAgICAgICAge1xuICAgICAgICAgICAga2V5SW5mbyxcbiAgICAgICAgICAgIGNoZWNrUHJpdmF0ZUtleTogYXN5bmMgKGlucHV0KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgaW5wdXRUb0tleShpbnB1dCk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tGdW5jKGtleSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIC8qIGNsYXNzTmFtZT0gKi8gbnVsbCxcbiAgICAgICAgLyogaXNQcmlvcml0eU1vZGFsPSAqLyBmYWxzZSxcbiAgICAgICAgLyogaXNTdGF0aWNNb2RhbD0gKi8gZmFsc2UsXG4gICAgICAgIC8qIG9wdGlvbnM9ICovIHtcbiAgICAgICAgICAgIG9uQmVmb3JlQ2xvc2U6IGFzeW5jIChyZWFzb24pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVhc29uID09PSBcImJhY2tncm91bmRDbGlja1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjb25maXJtVG9EaXNtaXNzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICApO1xuICAgIGNvbnN0IFtpbnB1dF0gPSBhd2FpdCBmaW5pc2hlZDtcbiAgICBpZiAoIWlucHV0KSB7XG4gICAgICAgIHRocm93IG5ldyBBY2Nlc3NDYW5jZWxsZWRFcnJvcigpO1xuICAgIH1cbiAgICBjb25zdCBrZXkgPSBhd2FpdCBpbnB1dFRvS2V5KGlucHV0KTtcblxuICAgIC8vIG5lZWQgdG8gY29weSB0aGUga2V5IGJlY2F1c2UgcmVoeWRyYXRpb24gKHVucGlja2xpbmcpIHdpbGwgY2xvYmJlciBpdFxuICAgIGRlaHlkcmF0aW9uQ2FjaGUgPSB7IGtleTogbmV3IFVpbnQ4QXJyYXkoa2V5KSwga2V5SW5mbyB9O1xuXG4gICAgcmV0dXJuIGtleTtcbn1cblxuZnVuY3Rpb24gY2FjaGVTZWNyZXRTdG9yYWdlS2V5KFxuICAgIGtleUlkOiBzdHJpbmcsXG4gICAga2V5SW5mbzogSVNlY3JldFN0b3JhZ2VLZXlJbmZvLFxuICAgIGtleTogVWludDhBcnJheSxcbik6IHZvaWQge1xuICAgIGlmIChpc0NhY2hpbmdBbGxvd2VkKCkpIHtcbiAgICAgICAgc2VjcmV0U3RvcmFnZUtleXNba2V5SWRdID0ga2V5O1xuICAgICAgICBzZWNyZXRTdG9yYWdlS2V5SW5mb1trZXlJZF0gPSBrZXlJbmZvO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gb25TZWNyZXRSZXF1ZXN0ZWQoXG4gICAgdXNlcklkOiBzdHJpbmcsXG4gICAgZGV2aWNlSWQ6IHN0cmluZyxcbiAgICByZXF1ZXN0SWQ6IHN0cmluZyxcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgZGV2aWNlVHJ1c3Q6IERldmljZVRydXN0TGV2ZWwsXG4pOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGxvZ2dlci5sb2coXCJvblNlY3JldFJlcXVlc3RlZFwiLCB1c2VySWQsIGRldmljZUlkLCByZXF1ZXN0SWQsIG5hbWUsIGRldmljZVRydXN0KTtcbiAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgaWYgKHVzZXJJZCAhPT0gY2xpZW50LmdldFVzZXJJZCgpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCFkZXZpY2VUcnVzdD8uaXNWZXJpZmllZCgpKSB7XG4gICAgICAgIGxvZ2dlci5sb2coYElnbm9yaW5nIHNlY3JldCByZXF1ZXN0IGZyb20gdW50cnVzdGVkIGRldmljZSAke2RldmljZUlkfWApO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChcbiAgICAgICAgbmFtZSA9PT0gXCJtLmNyb3NzX3NpZ25pbmcubWFzdGVyXCIgfHxcbiAgICAgICAgbmFtZSA9PT0gXCJtLmNyb3NzX3NpZ25pbmcuc2VsZl9zaWduaW5nXCIgfHxcbiAgICAgICAgbmFtZSA9PT0gXCJtLmNyb3NzX3NpZ25pbmcudXNlcl9zaWduaW5nXCJcbiAgICApIHtcbiAgICAgICAgY29uc3QgY2FsbGJhY2tzID0gY2xpZW50LmdldENyb3NzU2lnbmluZ0NhY2hlQ2FsbGJhY2tzKCk7XG4gICAgICAgIGlmICghY2FsbGJhY2tzLmdldENyb3NzU2lnbmluZ0tleUNhY2hlKSByZXR1cm47XG4gICAgICAgIGNvbnN0IGtleUlkID0gbmFtZS5yZXBsYWNlKFwibS5jcm9zc19zaWduaW5nLlwiLCBcIlwiKTtcbiAgICAgICAgY29uc3Qga2V5ID0gYXdhaXQgY2FsbGJhY2tzLmdldENyb3NzU2lnbmluZ0tleUNhY2hlKGtleUlkKTtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIGxvZ2dlci5sb2coXG4gICAgICAgICAgICAgICAgYCR7a2V5SWR9IHJlcXVlc3RlZCBieSAke2RldmljZUlkfSwgYnV0IG5vdCBmb3VuZCBpbiBjYWNoZWAsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBrZXkgJiYgZW5jb2RlQmFzZTY0KGtleSk7XG4gICAgfSBlbHNlIGlmIChuYW1lID09PSBcIm0ubWVnb2xtX2JhY2t1cC52MVwiKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IGF3YWl0IGNsaWVudC5jcnlwdG8uZ2V0U2Vzc2lvbkJhY2t1cFByaXZhdGVLZXkoKTtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIGxvZ2dlci5sb2coXG4gICAgICAgICAgICAgICAgYHNlc3Npb24gYmFja3VwIGtleSByZXF1ZXN0ZWQgYnkgJHtkZXZpY2VJZH0sIGJ1dCBub3QgZm91bmQgaW4gY2FjaGVgLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ga2V5ICYmIGVuY29kZUJhc2U2NChrZXkpO1xuICAgIH1cbiAgICBsb2dnZXIud2FybihcIm9uU2VjcmV0UmVxdWVzdGVkIGRpZG4ndCByZWNvZ25pc2UgdGhlIHNlY3JldCBuYW1lZCBcIiwgbmFtZSk7XG59XG5cbmV4cG9ydCBjb25zdCBjcm9zc1NpZ25pbmdDYWxsYmFja3M6IElDcnlwdG9DYWxsYmFja3MgPSB7XG4gICAgZ2V0U2VjcmV0U3RvcmFnZUtleSxcbiAgICBjYWNoZVNlY3JldFN0b3JhZ2VLZXksXG4gICAgb25TZWNyZXRSZXF1ZXN0ZWQsXG4gICAgZ2V0RGVoeWRyYXRpb25LZXksXG59O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJvbXB0Rm9yQmFja3VwUGFzc3BocmFzZSgpOiBQcm9taXNlPFVpbnQ4QXJyYXk+IHtcbiAgICBsZXQga2V5OiBVaW50OEFycmF5O1xuXG4gICAgY29uc3QgeyBmaW5pc2hlZCB9ID0gTW9kYWwuY3JlYXRlRGlhbG9nKFJlc3RvcmVLZXlCYWNrdXBEaWFsb2csIHtcbiAgICAgICAgc2hvd1N1bW1hcnk6IGZhbHNlLCBrZXlDYWxsYmFjazogayA9PiBrZXkgPSBrLFxuICAgIH0sIG51bGwsIC8qIHByaW9yaXR5ID0gKi8gZmFsc2UsIC8qIHN0YXRpYyA9ICovIHRydWUpO1xuXG4gICAgY29uc3Qgc3VjY2VzcyA9IGF3YWl0IGZpbmlzaGVkO1xuICAgIGlmICghc3VjY2VzcykgdGhyb3cgbmV3IEVycm9yKFwiS2V5IGJhY2t1cCBwcm9tcHQgY2FuY2VsbGVkXCIpO1xuXG4gICAgcmV0dXJuIGtleTtcbn1cblxuLyoqXG4gKiBUaGlzIGhlbHBlciBzaG91bGQgYmUgdXNlZCB3aGVuZXZlciB5b3UgbmVlZCB0byBhY2Nlc3Mgc2VjcmV0IHN0b3JhZ2UuIEl0XG4gKiBlbnN1cmVzIHRoYXQgc2VjcmV0IHN0b3JhZ2UgKGFuZCBhbHNvIGNyb3NzLXNpZ25pbmcgc2luY2UgdGhleSBlYWNoIGRlcGVuZCBvblxuICogZWFjaCBvdGhlciBpbiBhIGN5Y2xlIG9mIHNvcnRzKSBoYXZlIGJlZW4gYm9vdHN0cmFwcGVkIGJlZm9yZSBydW5uaW5nIHRoZVxuICogcHJvdmlkZWQgZnVuY3Rpb24uXG4gKlxuICogQm9vdHN0cmFwcGluZyBzZWNyZXQgc3RvcmFnZSBtYXkgdGFrZSBvbmUgb2YgdGhlc2UgcGF0aHM6XG4gKiAxLiBDcmVhdGUgc2VjcmV0IHN0b3JhZ2UgZnJvbSBhIHBhc3NwaHJhc2UgYW5kIHN0b3JlIGNyb3NzLXNpZ25pbmcga2V5c1xuICogICAgaW4gc2VjcmV0IHN0b3JhZ2UuXG4gKiAyLiBBY2Nlc3MgZXhpc3Rpbmcgc2VjcmV0IHN0b3JhZ2UgYnkgcmVxdWVzdGluZyBwYXNzcGhyYXNlIGFuZCBhY2Nlc3NpbmdcbiAqICAgIGNyb3NzLXNpZ25pbmcga2V5cyBhcyBuZWVkZWQuXG4gKiAzLiBBbGwga2V5cyBhcmUgbG9hZGVkIGFuZCB0aGVyZSdzIG5vdGhpbmcgdG8gZG8uXG4gKlxuICogQWRkaXRpb25hbGx5LCB0aGUgc2VjcmV0IHN0b3JhZ2Uga2V5cyBhcmUgY2FjaGVkIGR1cmluZyB0aGUgc2NvcGUgb2YgdGhpcyBmdW5jdGlvblxuICogdG8gZW5zdXJlIHRoZSB1c2VyIGlzIHByb21wdGVkIG9ubHkgb25jZSBmb3IgdGhlaXIgc2VjcmV0IHN0b3JhZ2VcbiAqIHBhc3NwaHJhc2UuIFRoZSBjYWNoZSBpcyB0aGVuIGNsZWFyZWQgb25jZSB0aGUgcHJvdmlkZWQgZnVuY3Rpb24gY29tcGxldGVzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtmdW5jXSBBbiBvcGVyYXRpb24gdG8gcGVyZm9ybSBvbmNlIHNlY3JldCBzdG9yYWdlIGhhcyBiZWVuXG4gKiBib290c3RyYXBwZWQuIE9wdGlvbmFsLlxuICogQHBhcmFtIHtib29sfSBbZm9yY2VSZXNldF0gUmVzZXQgc2VjcmV0IHN0b3JhZ2UgZXZlbiBpZiBpdCdzIGFscmVhZHkgc2V0IHVwXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhY2Nlc3NTZWNyZXRTdG9yYWdlKGZ1bmMgPSBhc3luYyAoKSA9PiB7IH0sIGZvcmNlUmVzZXQgPSBmYWxzZSkge1xuICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICBzZWNyZXRTdG9yYWdlQmVpbmdBY2Nlc3NlZCA9IHRydWU7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKCEoYXdhaXQgY2xpLmhhc1NlY3JldFN0b3JhZ2VLZXkoKSkgfHwgZm9yY2VSZXNldCkge1xuICAgICAgICAgICAgLy8gVGhpcyBkaWFsb2cgY2FsbHMgYm9vdHN0cmFwIGl0c2VsZiBhZnRlciBndWlkaW5nIHRoZSB1c2VyIHRocm91Z2hcbiAgICAgICAgICAgIC8vIHBhc3NwaHJhc2UgY3JlYXRpb24uXG4gICAgICAgICAgICBjb25zdCB7IGZpbmlzaGVkIH0gPSBNb2RhbC5jcmVhdGVEaWFsb2dBc3luYyhcbiAgICAgICAgICAgICAgICBpbXBvcnQoXG4gICAgICAgICAgICAgICAgICAgIFwiLi9hc3luYy1jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3Mvc2VjdXJpdHkvQ3JlYXRlU2VjcmV0U3RvcmFnZURpYWxvZ1wiXG4gICAgICAgICAgICAgICAgKSBhcyB1bmtub3duIGFzIFByb21pc2U8Q29tcG9uZW50VHlwZTx7fT4+LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yY2VSZXNldCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgLyogcHJpb3JpdHkgPSAqLyBmYWxzZSxcbiAgICAgICAgICAgICAgICAvKiBzdGF0aWMgPSAqLyB0cnVlLFxuICAgICAgICAgICAgICAgIC8qIG9wdGlvbnMgPSAqLyB7XG4gICAgICAgICAgICAgICAgICAgIG9uQmVmb3JlQ2xvc2U6IGFzeW5jIChyZWFzb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIFNlY3VyZSBCYWNrdXAgaXMgcmVxdWlyZWQsIHlvdSBjYW5ub3QgbGVhdmUgdGhlIG1vZGFsLlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlYXNvbiA9PT0gXCJiYWNrZ3JvdW5kQ2xpY2tcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAhaXNTZWN1cmVCYWNrdXBSZXF1aXJlZCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb25zdCBbY29uZmlybWVkXSA9IGF3YWl0IGZpbmlzaGVkO1xuICAgICAgICAgICAgaWYgKCFjb25maXJtZWQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZWNyZXQgc3RvcmFnZSBjcmVhdGlvbiBjYW5jZWxlZFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF3YWl0IGNsaS5ib290c3RyYXBDcm9zc1NpZ25pbmcoe1xuICAgICAgICAgICAgICAgIGF1dGhVcGxvYWREZXZpY2VTaWduaW5nS2V5czogYXN5bmMgKG1ha2VSZXF1ZXN0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgZmluaXNoZWQgfSA9IE1vZGFsLmNyZWF0ZURpYWxvZyhJbnRlcmFjdGl2ZUF1dGhEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIlNldHRpbmcgdXAga2V5c1wiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hdHJpeENsaWVudDogY2xpLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWFrZVJlcXVlc3QsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBbY29uZmlybWVkXSA9IGF3YWl0IGZpbmlzaGVkO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbmZpcm1lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ3Jvc3Mtc2lnbmluZyBrZXkgdXBsb2FkIGF1dGggY2FuY2VsZWRcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhd2FpdCBjbGkuYm9vdHN0cmFwU2VjcmV0U3RvcmFnZSh7XG4gICAgICAgICAgICAgICAgZ2V0S2V5QmFja3VwUGFzc3BocmFzZTogcHJvbXB0Rm9yQmFja3VwUGFzc3BocmFzZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBrZXlJZCA9IE9iamVjdC5rZXlzKHNlY3JldFN0b3JhZ2VLZXlzKVswXTtcbiAgICAgICAgICAgIGlmIChrZXlJZCAmJiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV9kZWh5ZHJhdGlvblwiKSkge1xuICAgICAgICAgICAgICAgIGxldCBkZWh5ZHJhdGlvbktleUluZm8gPSB7fTtcbiAgICAgICAgICAgICAgICBpZiAoc2VjcmV0U3RvcmFnZUtleUluZm9ba2V5SWRdICYmIHNlY3JldFN0b3JhZ2VLZXlJbmZvW2tleUlkXS5wYXNzcGhyYXNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlaHlkcmF0aW9uS2V5SW5mbyA9IHsgcGFzc3BocmFzZTogc2VjcmV0U3RvcmFnZUtleUluZm9ba2V5SWRdLnBhc3NwaHJhc2UgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmxvZyhcIlNldHRpbmcgZGVoeWRyYXRpb24ga2V5XCIpO1xuICAgICAgICAgICAgICAgIGF3YWl0IGNsaS5zZXREZWh5ZHJhdGlvbktleShzZWNyZXRTdG9yYWdlS2V5c1trZXlJZF0sIGRlaHlkcmF0aW9uS2V5SW5mbywgXCJCYWNrdXAgZGV2aWNlXCIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgha2V5SWQpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIud2FybihcIk5vdCBzZXR0aW5nIGRlaHlkcmF0aW9uIGtleTogbm8gU1NTUyBrZXkgZm91bmRcIik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5sb2coXCJOb3Qgc2V0dGluZyBkZWh5ZHJhdGlvbiBrZXk6IGZlYXR1cmUgZGlzYWJsZWRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBgcmV0dXJuIGF3YWl0YCBuZWVkZWQgaGVyZSB0byBlbnN1cmUgYGZpbmFsbHlgIGJsb2NrIHJ1bnMgYWZ0ZXIgdGhlXG4gICAgICAgIC8vIGlubmVyIG9wZXJhdGlvbiBjb21wbGV0ZXMuXG4gICAgICAgIHJldHVybiBhd2FpdCBmdW5jKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBTZWN1cml0eUN1c3RvbWlzYXRpb25zLmNhdGNoQWNjZXNzU2VjcmV0U3RvcmFnZUVycm9yPy4oZSk7XG4gICAgICAgIGxvZ2dlci5lcnJvcihlKTtcbiAgICAgICAgLy8gUmUtdGhyb3cgc28gdGhhdCBoaWdoZXIgbGV2ZWwgbG9naWMgY2FuIGFib3J0IGFzIG5lZWRlZFxuICAgICAgICB0aHJvdyBlO1xuICAgIH0gZmluYWxseSB7XG4gICAgICAgIC8vIENsZWFyIHNlY3JldCBzdG9yYWdlIGtleSBjYWNoZSBub3cgdGhhdCB3b3JrIGlzIGNvbXBsZXRlXG4gICAgICAgIHNlY3JldFN0b3JhZ2VCZWluZ0FjY2Vzc2VkID0gZmFsc2U7XG4gICAgICAgIGlmICghaXNDYWNoaW5nQWxsb3dlZCgpKSB7XG4gICAgICAgICAgICBzZWNyZXRTdG9yYWdlS2V5cyA9IHt9O1xuICAgICAgICAgICAgc2VjcmV0U3RvcmFnZUtleUluZm8gPSB7fTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLy8gRklYTUU6IHRoaXMgZnVuY3Rpb24gbmFtZSBpcyBhIGJpdCBvZiBhIG1vdXRoZnVsXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdHJ5VG9VbmxvY2tTZWNyZXRTdG9yYWdlV2l0aERlaHlkcmF0aW9uS2V5KFxuICAgIGNsaWVudDogTWF0cml4Q2xpZW50LFxuKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qga2V5ID0gZGVoeWRyYXRpb25DYWNoZS5rZXk7XG4gICAgbGV0IHJlc3RvcmluZ0JhY2t1cCA9IGZhbHNlO1xuICAgIGlmIChrZXkgJiYgKGF3YWl0IGNsaWVudC5pc1NlY3JldFN0b3JhZ2VSZWFkeSgpKSkge1xuICAgICAgICBsb2dnZXIubG9nKFwiVHJ5aW5nIHRvIHNldCB1cCBjcm9zcy1zaWduaW5nIHVzaW5nIGRlaHlkcmF0aW9uIGtleVwiKTtcbiAgICAgICAgc2VjcmV0U3RvcmFnZUJlaW5nQWNjZXNzZWQgPSB0cnVlO1xuICAgICAgICBub25JbnRlcmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBjbGllbnQuY2hlY2tPd25Dcm9zc1NpZ25pbmdUcnVzdCgpO1xuXG4gICAgICAgICAgICAvLyB3ZSBhbHNvIG5lZWQgdG8gc2V0IGEgbmV3IGRlaHlkcmF0ZWQgZGV2aWNlIHRvIHJlcGxhY2UgdGhlXG4gICAgICAgICAgICAvLyBkZXZpY2Ugd2UgcmVoeWRyYXRlZFxuICAgICAgICAgICAgbGV0IGRlaHlkcmF0aW9uS2V5SW5mbyA9IHt9O1xuICAgICAgICAgICAgaWYgKGRlaHlkcmF0aW9uQ2FjaGUua2V5SW5mbyAmJiBkZWh5ZHJhdGlvbkNhY2hlLmtleUluZm8ucGFzc3BocmFzZSkge1xuICAgICAgICAgICAgICAgIGRlaHlkcmF0aW9uS2V5SW5mbyA9IHsgcGFzc3BocmFzZTogZGVoeWRyYXRpb25DYWNoZS5rZXlJbmZvLnBhc3NwaHJhc2UgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF3YWl0IGNsaWVudC5zZXREZWh5ZHJhdGlvbktleShrZXksIGRlaHlkcmF0aW9uS2V5SW5mbywgXCJCYWNrdXAgZGV2aWNlXCIpO1xuXG4gICAgICAgICAgICAvLyBhbmQgcmVzdG9yZSBmcm9tIGJhY2t1cFxuICAgICAgICAgICAgY29uc3QgYmFja3VwSW5mbyA9IGF3YWl0IGNsaWVudC5nZXRLZXlCYWNrdXBWZXJzaW9uKCk7XG4gICAgICAgICAgICBpZiAoYmFja3VwSW5mbykge1xuICAgICAgICAgICAgICAgIHJlc3RvcmluZ0JhY2t1cCA9IHRydWU7XG4gICAgICAgICAgICAgICAgLy8gZG9uJ3QgYXdhaXQsIGJlY2F1c2UgdGhpcyBjYW4gdGFrZSBhIGxvbmcgdGltZVxuICAgICAgICAgICAgICAgIGNsaWVudC5yZXN0b3JlS2V5QmFja3VwV2l0aFNlY3JldFN0b3JhZ2UoYmFja3VwSW5mbylcbiAgICAgICAgICAgICAgICAgICAgLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VjcmV0U3RvcmFnZUJlaW5nQWNjZXNzZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vbkludGVyYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWlzQ2FjaGluZ0FsbG93ZWQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlY3JldFN0b3JhZ2VLZXlzID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VjcmV0U3RvcmFnZUtleUluZm8gPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICBkZWh5ZHJhdGlvbkNhY2hlID0ge307XG4gICAgICAgICAgICAvLyB0aGUgc2VjcmV0IHN0b3JhZ2UgY2FjaGUgaXMgbmVlZGVkIGZvciByZXN0b3JpbmcgZnJvbSBiYWNrdXAsIHNvXG4gICAgICAgICAgICAvLyBkb24ndCBjbGVhciBpdCB5ZXQgaWYgd2UncmUgcmVzdG9yaW5nIGZyb20gYmFja3VwXG4gICAgICAgICAgICBpZiAoIXJlc3RvcmluZ0JhY2t1cCkge1xuICAgICAgICAgICAgICAgIHNlY3JldFN0b3JhZ2VCZWluZ0FjY2Vzc2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgbm9uSW50ZXJhY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoIWlzQ2FjaGluZ0FsbG93ZWQoKSkge1xuICAgICAgICAgICAgICAgICAgICBzZWNyZXRTdG9yYWdlS2V5cyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBzZWNyZXRTdG9yYWdlS2V5SW5mbyA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBbUJBOztBQUNBOztBQUNBOztBQUVBOztBQUdBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSUEsaUJBQTZDLEdBQUcsRUFBcEQ7QUFDQSxJQUFJQyxvQkFBMkQsR0FBRyxFQUFsRTtBQUNBLElBQUlDLDBCQUEwQixHQUFHLEtBQWpDO0FBRUEsSUFBSUMsY0FBYyxHQUFHLEtBQXJC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