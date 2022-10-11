"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _logger = require("matrix-js-sdk/src/logger");

var _crypto = require("matrix-js-sdk/src/crypto");

var _matrix = require("matrix-js-sdk/src/matrix");

var _MatrixClientPeg = require("./MatrixClientPeg");

var _dispatcher = _interopRequireDefault(require("./dispatcher/dispatcher"));

var _BulkUnverifiedSessionsToast = require("./toasts/BulkUnverifiedSessionsToast");

var _SetupEncryptionToast = require("./toasts/SetupEncryptionToast");

var _UnverifiedSessionToast = require("./toasts/UnverifiedSessionToast");

var _SecurityManager = require("./SecurityManager");

var _WellKnownUtils = require("./utils/WellKnownUtils");

var _actions = require("./dispatcher/actions");

var _login = require("./utils/login");

/*
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
const KEY_BACKUP_POLL_INTERVAL = 5 * 60 * 1000;

class DeviceListener {
  constructor() {
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "dismissed", new Set());
    (0, _defineProperty2.default)(this, "dismissedThisDeviceToast", false);
    (0, _defineProperty2.default)(this, "keyBackupInfo", null);
    (0, _defineProperty2.default)(this, "keyBackupFetchedAt", null);
    (0, _defineProperty2.default)(this, "keyBackupStatusChecked", false);
    (0, _defineProperty2.default)(this, "ourDeviceIdsAtStart", null);
    (0, _defineProperty2.default)(this, "displayingToastsForDeviceIds", new Set());
    (0, _defineProperty2.default)(this, "running", false);
    (0, _defineProperty2.default)(this, "onWillUpdateDevices", async (users, initialFetch) => {
      // If we didn't know about *any* devices before (ie. it's fresh login),
      // then they are all pre-existing devices, so ignore this and set the
      // devicesAtStart list to the devices that we see after the fetch.
      if (initialFetch) return;

      const myUserId = _MatrixClientPeg.MatrixClientPeg.get().getUserId();

      if (users.includes(myUserId)) this.ensureDeviceIdsAtStartPopulated(); // No need to do a recheck here: we just need to get a snapshot of our devices
      // before we download any new ones.
    });
    (0, _defineProperty2.default)(this, "onDevicesUpdated", users => {
      if (!users.includes(_MatrixClientPeg.MatrixClientPeg.get().getUserId())) return;
      this.recheck();
    });
    (0, _defineProperty2.default)(this, "onDeviceVerificationChanged", userId => {
      if (userId !== _MatrixClientPeg.MatrixClientPeg.get().getUserId()) return;
      this.recheck();
    });
    (0, _defineProperty2.default)(this, "onUserTrustStatusChanged", userId => {
      if (userId !== _MatrixClientPeg.MatrixClientPeg.get().getUserId()) return;
      this.recheck();
    });
    (0, _defineProperty2.default)(this, "onCrossSingingKeysChanged", () => {
      this.recheck();
    });
    (0, _defineProperty2.default)(this, "onAccountData", ev => {
      // User may have:
      // * migrated SSSS to symmetric
      // * uploaded keys to secret storage
      // * completed secret storage creation
      // which result in account data changes affecting checks below.
      if (ev.getType().startsWith('m.secret_storage.') || ev.getType().startsWith('m.cross_signing.') || ev.getType() === 'm.megolm_backup.v1') {
        this.recheck();
      }
    });
    (0, _defineProperty2.default)(this, "onSync", (state, prevState) => {
      if (state === 'PREPARED' && prevState === null) {
        this.recheck();
      }
    });
    (0, _defineProperty2.default)(this, "onRoomStateEvents", ev => {
      if (ev.getType() !== _matrix.EventType.RoomEncryption) return; // If a room changes to encrypted, re-check as it may be our first
      // encrypted room. This also catches encrypted room creation as well.

      this.recheck();
    });
    (0, _defineProperty2.default)(this, "onAction", _ref => {
      let {
        action
      } = _ref;
      if (action !== _actions.Action.OnLoggedIn) return;
      this.recheck();
    });
    (0, _defineProperty2.default)(this, "checkKeyBackupStatus", async () => {
      if (this.keyBackupStatusChecked) {
        return;
      } // returns null when key backup status hasn't finished being checked


      const isKeyBackupEnabled = _MatrixClientPeg.MatrixClientPeg.get().getKeyBackupEnabled();

      this.keyBackupStatusChecked = isKeyBackupEnabled !== null;

      if (isKeyBackupEnabled === false) {
        _dispatcher.default.dispatch({
          action: _actions.Action.ReportKeyBackupNotEnabled
        });
      }
    });
  }

  static sharedInstance() {
    if (!window.mxDeviceListener) window.mxDeviceListener = new DeviceListener();
    return window.mxDeviceListener;
  }

  start() {
    this.running = true;

    _MatrixClientPeg.MatrixClientPeg.get().on(_crypto.CryptoEvent.WillUpdateDevices, this.onWillUpdateDevices);

    _MatrixClientPeg.MatrixClientPeg.get().on(_crypto.CryptoEvent.DevicesUpdated, this.onDevicesUpdated);

    _MatrixClientPeg.MatrixClientPeg.get().on(_crypto.CryptoEvent.DeviceVerificationChanged, this.onDeviceVerificationChanged);

    _MatrixClientPeg.MatrixClientPeg.get().on(_crypto.CryptoEvent.UserTrustStatusChanged, this.onUserTrustStatusChanged);

    _MatrixClientPeg.MatrixClientPeg.get().on(_crypto.CryptoEvent.KeysChanged, this.onCrossSingingKeysChanged);

    _MatrixClientPeg.MatrixClientPeg.get().on(_matrix.ClientEvent.AccountData, this.onAccountData);

    _MatrixClientPeg.MatrixClientPeg.get().on(_matrix.ClientEvent.Sync, this.onSync);

    _MatrixClientPeg.MatrixClientPeg.get().on(_matrix.RoomStateEvent.Events, this.onRoomStateEvents);

    this.dispatcherRef = _dispatcher.default.register(this.onAction);
    this.recheck();
  }

  stop() {
    this.running = false;

    if (_MatrixClientPeg.MatrixClientPeg.get()) {
      _MatrixClientPeg.MatrixClientPeg.get().removeListener(_crypto.CryptoEvent.WillUpdateDevices, this.onWillUpdateDevices);

      _MatrixClientPeg.MatrixClientPeg.get().removeListener(_crypto.CryptoEvent.DevicesUpdated, this.onDevicesUpdated);

      _MatrixClientPeg.MatrixClientPeg.get().removeListener(_crypto.CryptoEvent.DeviceVerificationChanged, this.onDeviceVerificationChanged);

      _MatrixClientPeg.MatrixClientPeg.get().removeListener(_crypto.CryptoEvent.UserTrustStatusChanged, this.onUserTrustStatusChanged);

      _MatrixClientPeg.MatrixClientPeg.get().removeListener(_crypto.CryptoEvent.KeysChanged, this.onCrossSingingKeysChanged);

      _MatrixClientPeg.MatrixClientPeg.get().removeListener(_matrix.ClientEvent.AccountData, this.onAccountData);

      _MatrixClientPeg.MatrixClientPeg.get().removeListener(_matrix.ClientEvent.Sync, this.onSync);

      _MatrixClientPeg.MatrixClientPeg.get().removeListener(_matrix.RoomStateEvent.Events, this.onRoomStateEvents);
    }

    if (this.dispatcherRef) {
      _dispatcher.default.unregister(this.dispatcherRef);

      this.dispatcherRef = null;
    }

    this.dismissed.clear();
    this.dismissedThisDeviceToast = false;
    this.keyBackupInfo = null;
    this.keyBackupFetchedAt = null;
    this.keyBackupStatusChecked = false;
    this.ourDeviceIdsAtStart = null;
    this.displayingToastsForDeviceIds = new Set();
  }
  /**
   * Dismiss notifications about our own unverified devices
   *
   * @param {String[]} deviceIds List of device IDs to dismiss notifications for
   */


  async dismissUnverifiedSessions(deviceIds) {
    _logger.logger.log("Dismissing unverified sessions: " + Array.from(deviceIds).join(','));

    for (const d of deviceIds) {
      this.dismissed.add(d);
    }

    this.recheck();
  }

  dismissEncryptionSetup() {
    this.dismissedThisDeviceToast = true;
    this.recheck();
  }

  ensureDeviceIdsAtStartPopulated() {
    if (this.ourDeviceIdsAtStart === null) {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      this.ourDeviceIdsAtStart = new Set(cli.getStoredDevicesForUser(cli.getUserId()).map(d => d.deviceId));
    }
  }

  // The server doesn't tell us when key backup is set up, so we poll
  // & cache the result
  async getKeyBackupInfo() {
    const now = new Date().getTime();

    if (!this.keyBackupInfo || this.keyBackupFetchedAt < now - KEY_BACKUP_POLL_INTERVAL) {
      this.keyBackupInfo = await _MatrixClientPeg.MatrixClientPeg.get().getKeyBackupVersion();
      this.keyBackupFetchedAt = now;
    }

    return this.keyBackupInfo;
  }

  shouldShowSetupEncryptionToast() {
    // If we're in the middle of a secret storage operation, we're likely
    // modifying the state involved here, so don't add new toasts to setup.
    if ((0, _SecurityManager.isSecretStorageBeingAccessed)()) return false; // Show setup toasts once the user is in at least one encrypted room.

    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    return cli && cli.getRooms().some(r => cli.isRoomEncrypted(r.roomId));
  }

  async recheck() {
    if (!this.running) return; // we have been stopped

    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    if (!(await cli.doesServerSupportUnstableFeature("org.matrix.e2e_cross_signing"))) return;
    if (!cli.isCryptoEnabled()) return; // don't recheck until the initial sync is complete: lots of account data events will fire
    // while the initial sync is processing and we don't need to recheck on each one of them
    // (we add a listener on sync to do once check after the initial sync is done)

    if (!cli.isInitialSyncComplete()) return;
    const crossSigningReady = await cli.isCrossSigningReady();
    const secretStorageReady = await cli.isSecretStorageReady();
    const allSystemsReady = crossSigningReady && secretStorageReady;

    if (this.dismissedThisDeviceToast || allSystemsReady) {
      (0, _SetupEncryptionToast.hideToast)();
      this.checkKeyBackupStatus();
    } else if (this.shouldShowSetupEncryptionToast()) {
      // make sure our keys are finished downloading
      await cli.downloadKeys([cli.getUserId()]); // cross signing isn't enabled - nag to enable it
      // There are 3 different toasts for:

      if (!cli.getCrossSigningId() && cli.getStoredCrossSigningForUser(cli.getUserId())) {
        // Cross-signing on account but this device doesn't trust the master key (verify this session)
        (0, _SetupEncryptionToast.showToast)(_SetupEncryptionToast.Kind.VERIFY_THIS_SESSION);
        this.checkKeyBackupStatus();
      } else {
        const backupInfo = await this.getKeyBackupInfo();

        if (backupInfo) {
          // No cross-signing on account but key backup available (upgrade encryption)
          (0, _SetupEncryptionToast.showToast)(_SetupEncryptionToast.Kind.UPGRADE_ENCRYPTION);
        } else {
          // No cross-signing or key backup on account (set up encryption)
          await cli.waitForClientWellKnown();

          if ((0, _WellKnownUtils.isSecureBackupRequired)() && (0, _login.isLoggedIn)()) {
            // If we're meant to set up, and Secure Backup is required,
            // trigger the flow directly without a toast once logged in.
            (0, _SetupEncryptionToast.hideToast)();
            (0, _SecurityManager.accessSecretStorage)();
          } else {
            (0, _SetupEncryptionToast.showToast)(_SetupEncryptionToast.Kind.SET_UP_ENCRYPTION);
          }
        }
      }
    } // This needs to be done after awaiting on downloadKeys() above, so
    // we make sure we get the devices after the fetch is done.


    this.ensureDeviceIdsAtStartPopulated(); // Unverified devices that were there last time the app ran
    // (technically could just be a boolean: we don't actually
    // need to remember the device IDs, but for the sake of
    // symmetry...).

    const oldUnverifiedDeviceIds = new Set(); // Unverified devices that have appeared since then

    const newUnverifiedDeviceIds = new Set(); // as long as cross-signing isn't ready,
    // you can't see or dismiss any device toasts

    if (crossSigningReady) {
      const devices = cli.getStoredDevicesForUser(cli.getUserId());

      for (const device of devices) {
        if (device.deviceId === cli.deviceId) continue;
        const deviceTrust = await cli.checkDeviceTrust(cli.getUserId(), device.deviceId);

        if (!deviceTrust.isCrossSigningVerified() && !this.dismissed.has(device.deviceId)) {
          if (this.ourDeviceIdsAtStart.has(device.deviceId)) {
            oldUnverifiedDeviceIds.add(device.deviceId);
          } else {
            newUnverifiedDeviceIds.add(device.deviceId);
          }
        }
      }
    }

    _logger.logger.debug("Old unverified sessions: " + Array.from(oldUnverifiedDeviceIds).join(','));

    _logger.logger.debug("New unverified sessions: " + Array.from(newUnverifiedDeviceIds).join(','));

    _logger.logger.debug("Currently showing toasts for: " + Array.from(this.displayingToastsForDeviceIds).join(',')); // Display or hide the batch toast for old unverified sessions


    if (oldUnverifiedDeviceIds.size > 0) {
      (0, _BulkUnverifiedSessionsToast.showToast)(oldUnverifiedDeviceIds);
    } else {
      (0, _BulkUnverifiedSessionsToast.hideToast)();
    } // Show toasts for new unverified devices if they aren't already there


    for (const deviceId of newUnverifiedDeviceIds) {
      (0, _UnverifiedSessionToast.showToast)(deviceId);
    } // ...and hide any we don't need any more


    for (const deviceId of this.displayingToastsForDeviceIds) {
      if (!newUnverifiedDeviceIds.has(deviceId)) {
        _logger.logger.debug("Hiding unverified session toast for " + deviceId);

        (0, _UnverifiedSessionToast.hideToast)(deviceId);
      }
    }

    this.displayingToastsForDeviceIds = newUnverifiedDeviceIds;
  }

}

exports.default = DeviceListener;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJLRVlfQkFDS1VQX1BPTExfSU5URVJWQUwiLCJEZXZpY2VMaXN0ZW5lciIsIlNldCIsInVzZXJzIiwiaW5pdGlhbEZldGNoIiwibXlVc2VySWQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJnZXRVc2VySWQiLCJpbmNsdWRlcyIsImVuc3VyZURldmljZUlkc0F0U3RhcnRQb3B1bGF0ZWQiLCJyZWNoZWNrIiwidXNlcklkIiwiZXYiLCJnZXRUeXBlIiwic3RhcnRzV2l0aCIsInN0YXRlIiwicHJldlN0YXRlIiwiRXZlbnRUeXBlIiwiUm9vbUVuY3J5cHRpb24iLCJhY3Rpb24iLCJBY3Rpb24iLCJPbkxvZ2dlZEluIiwia2V5QmFja3VwU3RhdHVzQ2hlY2tlZCIsImlzS2V5QmFja3VwRW5hYmxlZCIsImdldEtleUJhY2t1cEVuYWJsZWQiLCJkaXMiLCJkaXNwYXRjaCIsIlJlcG9ydEtleUJhY2t1cE5vdEVuYWJsZWQiLCJzaGFyZWRJbnN0YW5jZSIsIndpbmRvdyIsIm14RGV2aWNlTGlzdGVuZXIiLCJzdGFydCIsInJ1bm5pbmciLCJvbiIsIkNyeXB0b0V2ZW50IiwiV2lsbFVwZGF0ZURldmljZXMiLCJvbldpbGxVcGRhdGVEZXZpY2VzIiwiRGV2aWNlc1VwZGF0ZWQiLCJvbkRldmljZXNVcGRhdGVkIiwiRGV2aWNlVmVyaWZpY2F0aW9uQ2hhbmdlZCIsIm9uRGV2aWNlVmVyaWZpY2F0aW9uQ2hhbmdlZCIsIlVzZXJUcnVzdFN0YXR1c0NoYW5nZWQiLCJvblVzZXJUcnVzdFN0YXR1c0NoYW5nZWQiLCJLZXlzQ2hhbmdlZCIsIm9uQ3Jvc3NTaW5naW5nS2V5c0NoYW5nZWQiLCJDbGllbnRFdmVudCIsIkFjY291bnREYXRhIiwib25BY2NvdW50RGF0YSIsIlN5bmMiLCJvblN5bmMiLCJSb29tU3RhdGVFdmVudCIsIkV2ZW50cyIsIm9uUm9vbVN0YXRlRXZlbnRzIiwiZGlzcGF0Y2hlclJlZiIsInJlZ2lzdGVyIiwib25BY3Rpb24iLCJzdG9wIiwicmVtb3ZlTGlzdGVuZXIiLCJ1bnJlZ2lzdGVyIiwiZGlzbWlzc2VkIiwiY2xlYXIiLCJkaXNtaXNzZWRUaGlzRGV2aWNlVG9hc3QiLCJrZXlCYWNrdXBJbmZvIiwia2V5QmFja3VwRmV0Y2hlZEF0Iiwib3VyRGV2aWNlSWRzQXRTdGFydCIsImRpc3BsYXlpbmdUb2FzdHNGb3JEZXZpY2VJZHMiLCJkaXNtaXNzVW52ZXJpZmllZFNlc3Npb25zIiwiZGV2aWNlSWRzIiwibG9nZ2VyIiwibG9nIiwiQXJyYXkiLCJmcm9tIiwiam9pbiIsImQiLCJhZGQiLCJkaXNtaXNzRW5jcnlwdGlvblNldHVwIiwiY2xpIiwiZ2V0U3RvcmVkRGV2aWNlc0ZvclVzZXIiLCJtYXAiLCJkZXZpY2VJZCIsImdldEtleUJhY2t1cEluZm8iLCJub3ciLCJEYXRlIiwiZ2V0VGltZSIsImdldEtleUJhY2t1cFZlcnNpb24iLCJzaG91bGRTaG93U2V0dXBFbmNyeXB0aW9uVG9hc3QiLCJpc1NlY3JldFN0b3JhZ2VCZWluZ0FjY2Vzc2VkIiwiZ2V0Um9vbXMiLCJzb21lIiwiciIsImlzUm9vbUVuY3J5cHRlZCIsInJvb21JZCIsImRvZXNTZXJ2ZXJTdXBwb3J0VW5zdGFibGVGZWF0dXJlIiwiaXNDcnlwdG9FbmFibGVkIiwiaXNJbml0aWFsU3luY0NvbXBsZXRlIiwiY3Jvc3NTaWduaW5nUmVhZHkiLCJpc0Nyb3NzU2lnbmluZ1JlYWR5Iiwic2VjcmV0U3RvcmFnZVJlYWR5IiwiaXNTZWNyZXRTdG9yYWdlUmVhZHkiLCJhbGxTeXN0ZW1zUmVhZHkiLCJoaWRlU2V0dXBFbmNyeXB0aW9uVG9hc3QiLCJjaGVja0tleUJhY2t1cFN0YXR1cyIsImRvd25sb2FkS2V5cyIsImdldENyb3NzU2lnbmluZ0lkIiwiZ2V0U3RvcmVkQ3Jvc3NTaWduaW5nRm9yVXNlciIsInNob3dTZXR1cEVuY3J5cHRpb25Ub2FzdCIsIlNldHVwS2luZCIsIlZFUklGWV9USElTX1NFU1NJT04iLCJiYWNrdXBJbmZvIiwiVVBHUkFERV9FTkNSWVBUSU9OIiwid2FpdEZvckNsaWVudFdlbGxLbm93biIsImlzU2VjdXJlQmFja3VwUmVxdWlyZWQiLCJpc0xvZ2dlZEluIiwiYWNjZXNzU2VjcmV0U3RvcmFnZSIsIlNFVF9VUF9FTkNSWVBUSU9OIiwib2xkVW52ZXJpZmllZERldmljZUlkcyIsIm5ld1VudmVyaWZpZWREZXZpY2VJZHMiLCJkZXZpY2VzIiwiZGV2aWNlIiwiZGV2aWNlVHJ1c3QiLCJjaGVja0RldmljZVRydXN0IiwiaXNDcm9zc1NpZ25pbmdWZXJpZmllZCIsImhhcyIsImRlYnVnIiwic2l6ZSIsInNob3dCdWxrVW52ZXJpZmllZFNlc3Npb25zVG9hc3QiLCJoaWRlQnVsa1VudmVyaWZpZWRTZXNzaW9uc1RvYXN0Iiwic2hvd1VudmVyaWZpZWRTZXNzaW9uc1RvYXN0IiwiaGlkZVVudmVyaWZpZWRTZXNzaW9uc1RvYXN0Il0sInNvdXJjZXMiOlsiLi4vc3JjL0RldmljZUxpc3RlbmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7IE1hdHJpeEV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudFwiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuaW1wb3J0IHsgQ3J5cHRvRXZlbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY3J5cHRvXCI7XG5pbXBvcnQgeyBDbGllbnRFdmVudCwgRXZlbnRUeXBlLCBSb29tU3RhdGVFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tYXRyaXhcIjtcbmltcG9ydCB7IFN5bmNTdGF0ZSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9zeW5jXCI7XG5cbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gJy4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCBkaXMgZnJvbSBcIi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQge1xuICAgIGhpZGVUb2FzdCBhcyBoaWRlQnVsa1VudmVyaWZpZWRTZXNzaW9uc1RvYXN0LFxuICAgIHNob3dUb2FzdCBhcyBzaG93QnVsa1VudmVyaWZpZWRTZXNzaW9uc1RvYXN0LFxufSBmcm9tIFwiLi90b2FzdHMvQnVsa1VudmVyaWZpZWRTZXNzaW9uc1RvYXN0XCI7XG5pbXBvcnQge1xuICAgIGhpZGVUb2FzdCBhcyBoaWRlU2V0dXBFbmNyeXB0aW9uVG9hc3QsXG4gICAgS2luZCBhcyBTZXR1cEtpbmQsXG4gICAgc2hvd1RvYXN0IGFzIHNob3dTZXR1cEVuY3J5cHRpb25Ub2FzdCxcbn0gZnJvbSBcIi4vdG9hc3RzL1NldHVwRW5jcnlwdGlvblRvYXN0XCI7XG5pbXBvcnQge1xuICAgIGhpZGVUb2FzdCBhcyBoaWRlVW52ZXJpZmllZFNlc3Npb25zVG9hc3QsXG4gICAgc2hvd1RvYXN0IGFzIHNob3dVbnZlcmlmaWVkU2Vzc2lvbnNUb2FzdCxcbn0gZnJvbSBcIi4vdG9hc3RzL1VudmVyaWZpZWRTZXNzaW9uVG9hc3RcIjtcbmltcG9ydCB7IGFjY2Vzc1NlY3JldFN0b3JhZ2UsIGlzU2VjcmV0U3RvcmFnZUJlaW5nQWNjZXNzZWQgfSBmcm9tIFwiLi9TZWN1cml0eU1hbmFnZXJcIjtcbmltcG9ydCB7IGlzU2VjdXJlQmFja3VwUmVxdWlyZWQgfSBmcm9tICcuL3V0aWxzL1dlbGxLbm93blV0aWxzJztcbmltcG9ydCB7IEFjdGlvblBheWxvYWQgfSBmcm9tIFwiLi9kaXNwYXRjaGVyL3BheWxvYWRzXCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcbmltcG9ydCB7IGlzTG9nZ2VkSW4gfSBmcm9tIFwiLi91dGlscy9sb2dpblwiO1xuXG5jb25zdCBLRVlfQkFDS1VQX1BPTExfSU5URVJWQUwgPSA1ICogNjAgKiAxMDAwO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEZXZpY2VMaXN0ZW5lciB7XG4gICAgcHJpdmF0ZSBkaXNwYXRjaGVyUmVmOiBzdHJpbmc7XG4gICAgLy8gZGV2aWNlIElEcyBmb3Igd2hpY2ggdGhlIHVzZXIgaGFzIGRpc21pc3NlZCB0aGUgdmVyaWZ5IHRvYXN0ICgnTGF0ZXInKVxuICAgIHByaXZhdGUgZGlzbWlzc2VkID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgLy8gaGFzIHRoZSB1c2VyIGRpc21pc3NlZCBhbnkgb2YgdGhlIHZhcmlvdXMgbmFnIHRvYXN0cyB0byBzZXR1cCBlbmNyeXB0aW9uIG9uIHRoaXMgZGV2aWNlP1xuICAgIHByaXZhdGUgZGlzbWlzc2VkVGhpc0RldmljZVRvYXN0ID0gZmFsc2U7XG4gICAgLy8gY2FjaGUgb2YgdGhlIGtleSBiYWNrdXAgaW5mb1xuICAgIHByaXZhdGUga2V5QmFja3VwSW5mbzogb2JqZWN0ID0gbnVsbDtcbiAgICBwcml2YXRlIGtleUJhY2t1cEZldGNoZWRBdDogbnVtYmVyID0gbnVsbDtcbiAgICBwcml2YXRlIGtleUJhY2t1cFN0YXR1c0NoZWNrZWQgPSBmYWxzZTtcbiAgICAvLyBXZSBrZWVwIGEgbGlzdCBvZiBvdXIgb3duIGRldmljZSBJRHMgc28gd2UgY2FuIGJhdGNoIG9uZXMgdGhhdCB3ZXJlIGFscmVhZHlcbiAgICAvLyB0aGVyZSB0aGUgbGFzdCB0aW1lIHRoZSBhcHAgbGF1bmNoZWQgaW50byBhIHNpbmdsZSB0b2FzdCwgYnV0IGRpc3BsYXkgbmV3XG4gICAgLy8gb25lcyBpbiB0aGVpciBvd24gdG9hc3RzLlxuICAgIHByaXZhdGUgb3VyRGV2aWNlSWRzQXRTdGFydDogU2V0PHN0cmluZz4gPSBudWxsO1xuICAgIC8vIFRoZSBzZXQgb2YgZGV2aWNlIElEcyB3ZSdyZSBjdXJyZW50bHkgZGlzcGxheWluZyB0b2FzdHMgZm9yXG4gICAgcHJpdmF0ZSBkaXNwbGF5aW5nVG9hc3RzRm9yRGV2aWNlSWRzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gICAgcHJpdmF0ZSBydW5uaW5nID0gZmFsc2U7XG5cbiAgICBwdWJsaWMgc3RhdGljIHNoYXJlZEluc3RhbmNlKCkge1xuICAgICAgICBpZiAoIXdpbmRvdy5teERldmljZUxpc3RlbmVyKSB3aW5kb3cubXhEZXZpY2VMaXN0ZW5lciA9IG5ldyBEZXZpY2VMaXN0ZW5lcigpO1xuICAgICAgICByZXR1cm4gd2luZG93Lm14RGV2aWNlTGlzdGVuZXI7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXJ0KCkge1xuICAgICAgICB0aGlzLnJ1bm5pbmcgPSB0cnVlO1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkub24oQ3J5cHRvRXZlbnQuV2lsbFVwZGF0ZURldmljZXMsIHRoaXMub25XaWxsVXBkYXRlRGV2aWNlcyk7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5vbihDcnlwdG9FdmVudC5EZXZpY2VzVXBkYXRlZCwgdGhpcy5vbkRldmljZXNVcGRhdGVkKTtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLm9uKENyeXB0b0V2ZW50LkRldmljZVZlcmlmaWNhdGlvbkNoYW5nZWQsIHRoaXMub25EZXZpY2VWZXJpZmljYXRpb25DaGFuZ2VkKTtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLm9uKENyeXB0b0V2ZW50LlVzZXJUcnVzdFN0YXR1c0NoYW5nZWQsIHRoaXMub25Vc2VyVHJ1c3RTdGF0dXNDaGFuZ2VkKTtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLm9uKENyeXB0b0V2ZW50LktleXNDaGFuZ2VkLCB0aGlzLm9uQ3Jvc3NTaW5naW5nS2V5c0NoYW5nZWQpO1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkub24oQ2xpZW50RXZlbnQuQWNjb3VudERhdGEsIHRoaXMub25BY2NvdW50RGF0YSk7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5vbihDbGllbnRFdmVudC5TeW5jLCB0aGlzLm9uU3luYyk7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5vbihSb29tU3RhdGVFdmVudC5FdmVudHMsIHRoaXMub25Sb29tU3RhdGVFdmVudHMpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXJSZWYgPSBkaXMucmVnaXN0ZXIodGhpcy5vbkFjdGlvbik7XG4gICAgICAgIHRoaXMucmVjaGVjaygpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdG9wKCkge1xuICAgICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgaWYgKE1hdHJpeENsaWVudFBlZy5nZXQoKSkge1xuICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnJlbW92ZUxpc3RlbmVyKENyeXB0b0V2ZW50LldpbGxVcGRhdGVEZXZpY2VzLCB0aGlzLm9uV2lsbFVwZGF0ZURldmljZXMpO1xuICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnJlbW92ZUxpc3RlbmVyKENyeXB0b0V2ZW50LkRldmljZXNVcGRhdGVkLCB0aGlzLm9uRGV2aWNlc1VwZGF0ZWQpO1xuICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnJlbW92ZUxpc3RlbmVyKFxuICAgICAgICAgICAgICAgIENyeXB0b0V2ZW50LkRldmljZVZlcmlmaWNhdGlvbkNoYW5nZWQsXG4gICAgICAgICAgICAgICAgdGhpcy5vbkRldmljZVZlcmlmaWNhdGlvbkNoYW5nZWQsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnJlbW92ZUxpc3RlbmVyKENyeXB0b0V2ZW50LlVzZXJUcnVzdFN0YXR1c0NoYW5nZWQsIHRoaXMub25Vc2VyVHJ1c3RTdGF0dXNDaGFuZ2VkKTtcbiAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5yZW1vdmVMaXN0ZW5lcihDcnlwdG9FdmVudC5LZXlzQ2hhbmdlZCwgdGhpcy5vbkNyb3NzU2luZ2luZ0tleXNDaGFuZ2VkKTtcbiAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5yZW1vdmVMaXN0ZW5lcihDbGllbnRFdmVudC5BY2NvdW50RGF0YSwgdGhpcy5vbkFjY291bnREYXRhKTtcbiAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5yZW1vdmVMaXN0ZW5lcihDbGllbnRFdmVudC5TeW5jLCB0aGlzLm9uU3luYyk7XG4gICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkucmVtb3ZlTGlzdGVuZXIoUm9vbVN0YXRlRXZlbnQuRXZlbnRzLCB0aGlzLm9uUm9vbVN0YXRlRXZlbnRzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5kaXNwYXRjaGVyUmVmKSB7XG4gICAgICAgICAgICBkaXMudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoZXJSZWYpO1xuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaGVyUmVmID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRpc21pc3NlZC5jbGVhcigpO1xuICAgICAgICB0aGlzLmRpc21pc3NlZFRoaXNEZXZpY2VUb2FzdCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmtleUJhY2t1cEluZm8gPSBudWxsO1xuICAgICAgICB0aGlzLmtleUJhY2t1cEZldGNoZWRBdCA9IG51bGw7XG4gICAgICAgIHRoaXMua2V5QmFja3VwU3RhdHVzQ2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLm91ckRldmljZUlkc0F0U3RhcnQgPSBudWxsO1xuICAgICAgICB0aGlzLmRpc3BsYXlpbmdUb2FzdHNGb3JEZXZpY2VJZHMgPSBuZXcgU2V0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGlzbWlzcyBub3RpZmljYXRpb25zIGFib3V0IG91ciBvd24gdW52ZXJpZmllZCBkZXZpY2VzXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1N0cmluZ1tdfSBkZXZpY2VJZHMgTGlzdCBvZiBkZXZpY2UgSURzIHRvIGRpc21pc3Mgbm90aWZpY2F0aW9ucyBmb3JcbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgZGlzbWlzc1VudmVyaWZpZWRTZXNzaW9ucyhkZXZpY2VJZHM6IEl0ZXJhYmxlPHN0cmluZz4pIHtcbiAgICAgICAgbG9nZ2VyLmxvZyhcIkRpc21pc3NpbmcgdW52ZXJpZmllZCBzZXNzaW9uczogXCIgKyBBcnJheS5mcm9tKGRldmljZUlkcykuam9pbignLCcpKTtcbiAgICAgICAgZm9yIChjb25zdCBkIG9mIGRldmljZUlkcykge1xuICAgICAgICAgICAgdGhpcy5kaXNtaXNzZWQuYWRkKGQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yZWNoZWNrKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGRpc21pc3NFbmNyeXB0aW9uU2V0dXAoKSB7XG4gICAgICAgIHRoaXMuZGlzbWlzc2VkVGhpc0RldmljZVRvYXN0ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5yZWNoZWNrKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBlbnN1cmVEZXZpY2VJZHNBdFN0YXJ0UG9wdWxhdGVkKCkge1xuICAgICAgICBpZiAodGhpcy5vdXJEZXZpY2VJZHNBdFN0YXJ0ID09PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgICAgICB0aGlzLm91ckRldmljZUlkc0F0U3RhcnQgPSBuZXcgU2V0KFxuICAgICAgICAgICAgICAgIGNsaS5nZXRTdG9yZWREZXZpY2VzRm9yVXNlcihjbGkuZ2V0VXNlcklkKCkpLm1hcChkID0+IGQuZGV2aWNlSWQpLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25XaWxsVXBkYXRlRGV2aWNlcyA9IGFzeW5jICh1c2Vyczogc3RyaW5nW10sIGluaXRpYWxGZXRjaD86IGJvb2xlYW4pID0+IHtcbiAgICAgICAgLy8gSWYgd2UgZGlkbid0IGtub3cgYWJvdXQgKmFueSogZGV2aWNlcyBiZWZvcmUgKGllLiBpdCdzIGZyZXNoIGxvZ2luKSxcbiAgICAgICAgLy8gdGhlbiB0aGV5IGFyZSBhbGwgcHJlLWV4aXN0aW5nIGRldmljZXMsIHNvIGlnbm9yZSB0aGlzIGFuZCBzZXQgdGhlXG4gICAgICAgIC8vIGRldmljZXNBdFN0YXJ0IGxpc3QgdG8gdGhlIGRldmljZXMgdGhhdCB3ZSBzZWUgYWZ0ZXIgdGhlIGZldGNoLlxuICAgICAgICBpZiAoaW5pdGlhbEZldGNoKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgbXlVc2VySWQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VXNlcklkKCk7XG4gICAgICAgIGlmICh1c2Vycy5pbmNsdWRlcyhteVVzZXJJZCkpIHRoaXMuZW5zdXJlRGV2aWNlSWRzQXRTdGFydFBvcHVsYXRlZCgpO1xuXG4gICAgICAgIC8vIE5vIG5lZWQgdG8gZG8gYSByZWNoZWNrIGhlcmU6IHdlIGp1c3QgbmVlZCB0byBnZXQgYSBzbmFwc2hvdCBvZiBvdXIgZGV2aWNlc1xuICAgICAgICAvLyBiZWZvcmUgd2UgZG93bmxvYWQgYW55IG5ldyBvbmVzLlxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRGV2aWNlc1VwZGF0ZWQgPSAodXNlcnM6IHN0cmluZ1tdKSA9PiB7XG4gICAgICAgIGlmICghdXNlcnMuaW5jbHVkZXMoTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpKSkgcmV0dXJuO1xuICAgICAgICB0aGlzLnJlY2hlY2soKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkRldmljZVZlcmlmaWNhdGlvbkNoYW5nZWQgPSAodXNlcklkOiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKHVzZXJJZCAhPT0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpKSByZXR1cm47XG4gICAgICAgIHRoaXMucmVjaGVjaygpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVXNlclRydXN0U3RhdHVzQ2hhbmdlZCA9ICh1c2VySWQ6IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAodXNlcklkICE9PSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VXNlcklkKCkpIHJldHVybjtcbiAgICAgICAgdGhpcy5yZWNoZWNrKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Dcm9zc1NpbmdpbmdLZXlzQ2hhbmdlZCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5yZWNoZWNrKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25BY2NvdW50RGF0YSA9IChldjogTWF0cml4RXZlbnQpID0+IHtcbiAgICAgICAgLy8gVXNlciBtYXkgaGF2ZTpcbiAgICAgICAgLy8gKiBtaWdyYXRlZCBTU1NTIHRvIHN5bW1ldHJpY1xuICAgICAgICAvLyAqIHVwbG9hZGVkIGtleXMgdG8gc2VjcmV0IHN0b3JhZ2VcbiAgICAgICAgLy8gKiBjb21wbGV0ZWQgc2VjcmV0IHN0b3JhZ2UgY3JlYXRpb25cbiAgICAgICAgLy8gd2hpY2ggcmVzdWx0IGluIGFjY291bnQgZGF0YSBjaGFuZ2VzIGFmZmVjdGluZyBjaGVja3MgYmVsb3cuXG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIGV2LmdldFR5cGUoKS5zdGFydHNXaXRoKCdtLnNlY3JldF9zdG9yYWdlLicpIHx8XG4gICAgICAgICAgICBldi5nZXRUeXBlKCkuc3RhcnRzV2l0aCgnbS5jcm9zc19zaWduaW5nLicpIHx8XG4gICAgICAgICAgICBldi5nZXRUeXBlKCkgPT09ICdtLm1lZ29sbV9iYWNrdXAudjEnXG4gICAgICAgICkge1xuICAgICAgICAgICAgdGhpcy5yZWNoZWNrKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblN5bmMgPSAoc3RhdGU6IFN5bmNTdGF0ZSwgcHJldlN0YXRlPzogU3luY1N0YXRlKSA9PiB7XG4gICAgICAgIGlmIChzdGF0ZSA9PT0gJ1BSRVBBUkVEJyAmJiBwcmV2U3RhdGUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMucmVjaGVjaygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Sb29tU3RhdGVFdmVudHMgPSAoZXY6IE1hdHJpeEV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldi5nZXRUeXBlKCkgIT09IEV2ZW50VHlwZS5Sb29tRW5jcnlwdGlvbikgcmV0dXJuO1xuXG4gICAgICAgIC8vIElmIGEgcm9vbSBjaGFuZ2VzIHRvIGVuY3J5cHRlZCwgcmUtY2hlY2sgYXMgaXQgbWF5IGJlIG91ciBmaXJzdFxuICAgICAgICAvLyBlbmNyeXB0ZWQgcm9vbS4gVGhpcyBhbHNvIGNhdGNoZXMgZW5jcnlwdGVkIHJvb20gY3JlYXRpb24gYXMgd2VsbC5cbiAgICAgICAgdGhpcy5yZWNoZWNrKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25BY3Rpb24gPSAoeyBhY3Rpb24gfTogQWN0aW9uUGF5bG9hZCkgPT4ge1xuICAgICAgICBpZiAoYWN0aW9uICE9PSBBY3Rpb24uT25Mb2dnZWRJbikgcmV0dXJuO1xuICAgICAgICB0aGlzLnJlY2hlY2soKTtcbiAgICB9O1xuXG4gICAgLy8gVGhlIHNlcnZlciBkb2Vzbid0IHRlbGwgdXMgd2hlbiBrZXkgYmFja3VwIGlzIHNldCB1cCwgc28gd2UgcG9sbFxuICAgIC8vICYgY2FjaGUgdGhlIHJlc3VsdFxuICAgIHByaXZhdGUgYXN5bmMgZ2V0S2V5QmFja3VwSW5mbygpIHtcbiAgICAgICAgY29uc3Qgbm93ID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcbiAgICAgICAgaWYgKCF0aGlzLmtleUJhY2t1cEluZm8gfHwgdGhpcy5rZXlCYWNrdXBGZXRjaGVkQXQgPCBub3cgLSBLRVlfQkFDS1VQX1BPTExfSU5URVJWQUwpIHtcbiAgICAgICAgICAgIHRoaXMua2V5QmFja3VwSW5mbyA9IGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRLZXlCYWNrdXBWZXJzaW9uKCk7XG4gICAgICAgICAgICB0aGlzLmtleUJhY2t1cEZldGNoZWRBdCA9IG5vdztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5rZXlCYWNrdXBJbmZvO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2hvdWxkU2hvd1NldHVwRW5jcnlwdGlvblRvYXN0KCkge1xuICAgICAgICAvLyBJZiB3ZSdyZSBpbiB0aGUgbWlkZGxlIG9mIGEgc2VjcmV0IHN0b3JhZ2Ugb3BlcmF0aW9uLCB3ZSdyZSBsaWtlbHlcbiAgICAgICAgLy8gbW9kaWZ5aW5nIHRoZSBzdGF0ZSBpbnZvbHZlZCBoZXJlLCBzbyBkb24ndCBhZGQgbmV3IHRvYXN0cyB0byBzZXR1cC5cbiAgICAgICAgaWYgKGlzU2VjcmV0U3RvcmFnZUJlaW5nQWNjZXNzZWQoKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAvLyBTaG93IHNldHVwIHRvYXN0cyBvbmNlIHRoZSB1c2VyIGlzIGluIGF0IGxlYXN0IG9uZSBlbmNyeXB0ZWQgcm9vbS5cbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICByZXR1cm4gY2xpICYmIGNsaS5nZXRSb29tcygpLnNvbWUociA9PiBjbGkuaXNSb29tRW5jcnlwdGVkKHIucm9vbUlkKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyByZWNoZWNrKCkge1xuICAgICAgICBpZiAoIXRoaXMucnVubmluZykgcmV0dXJuOyAvLyB3ZSBoYXZlIGJlZW4gc3RvcHBlZFxuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG5cbiAgICAgICAgaWYgKCEoYXdhaXQgY2xpLmRvZXNTZXJ2ZXJTdXBwb3J0VW5zdGFibGVGZWF0dXJlKFwib3JnLm1hdHJpeC5lMmVfY3Jvc3Nfc2lnbmluZ1wiKSkpIHJldHVybjtcblxuICAgICAgICBpZiAoIWNsaS5pc0NyeXB0b0VuYWJsZWQoKSkgcmV0dXJuO1xuICAgICAgICAvLyBkb24ndCByZWNoZWNrIHVudGlsIHRoZSBpbml0aWFsIHN5bmMgaXMgY29tcGxldGU6IGxvdHMgb2YgYWNjb3VudCBkYXRhIGV2ZW50cyB3aWxsIGZpcmVcbiAgICAgICAgLy8gd2hpbGUgdGhlIGluaXRpYWwgc3luYyBpcyBwcm9jZXNzaW5nIGFuZCB3ZSBkb24ndCBuZWVkIHRvIHJlY2hlY2sgb24gZWFjaCBvbmUgb2YgdGhlbVxuICAgICAgICAvLyAod2UgYWRkIGEgbGlzdGVuZXIgb24gc3luYyB0byBkbyBvbmNlIGNoZWNrIGFmdGVyIHRoZSBpbml0aWFsIHN5bmMgaXMgZG9uZSlcbiAgICAgICAgaWYgKCFjbGkuaXNJbml0aWFsU3luY0NvbXBsZXRlKCkpIHJldHVybjtcblxuICAgICAgICBjb25zdCBjcm9zc1NpZ25pbmdSZWFkeSA9IGF3YWl0IGNsaS5pc0Nyb3NzU2lnbmluZ1JlYWR5KCk7XG4gICAgICAgIGNvbnN0IHNlY3JldFN0b3JhZ2VSZWFkeSA9IGF3YWl0IGNsaS5pc1NlY3JldFN0b3JhZ2VSZWFkeSgpO1xuICAgICAgICBjb25zdCBhbGxTeXN0ZW1zUmVhZHkgPSBjcm9zc1NpZ25pbmdSZWFkeSAmJiBzZWNyZXRTdG9yYWdlUmVhZHk7XG5cbiAgICAgICAgaWYgKHRoaXMuZGlzbWlzc2VkVGhpc0RldmljZVRvYXN0IHx8IGFsbFN5c3RlbXNSZWFkeSkge1xuICAgICAgICAgICAgaGlkZVNldHVwRW5jcnlwdGlvblRvYXN0KCk7XG5cbiAgICAgICAgICAgIHRoaXMuY2hlY2tLZXlCYWNrdXBTdGF0dXMoKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnNob3VsZFNob3dTZXR1cEVuY3J5cHRpb25Ub2FzdCgpKSB7XG4gICAgICAgICAgICAvLyBtYWtlIHN1cmUgb3VyIGtleXMgYXJlIGZpbmlzaGVkIGRvd25sb2FkaW5nXG4gICAgICAgICAgICBhd2FpdCBjbGkuZG93bmxvYWRLZXlzKFtjbGkuZ2V0VXNlcklkKCldKTtcbiAgICAgICAgICAgIC8vIGNyb3NzIHNpZ25pbmcgaXNuJ3QgZW5hYmxlZCAtIG5hZyB0byBlbmFibGUgaXRcbiAgICAgICAgICAgIC8vIFRoZXJlIGFyZSAzIGRpZmZlcmVudCB0b2FzdHMgZm9yOlxuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICFjbGkuZ2V0Q3Jvc3NTaWduaW5nSWQoKSAmJlxuICAgICAgICAgICAgICAgIGNsaS5nZXRTdG9yZWRDcm9zc1NpZ25pbmdGb3JVc2VyKGNsaS5nZXRVc2VySWQoKSlcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIC8vIENyb3NzLXNpZ25pbmcgb24gYWNjb3VudCBidXQgdGhpcyBkZXZpY2UgZG9lc24ndCB0cnVzdCB0aGUgbWFzdGVyIGtleSAodmVyaWZ5IHRoaXMgc2Vzc2lvbilcbiAgICAgICAgICAgICAgICBzaG93U2V0dXBFbmNyeXB0aW9uVG9hc3QoU2V0dXBLaW5kLlZFUklGWV9USElTX1NFU1NJT04pO1xuICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tLZXlCYWNrdXBTdGF0dXMoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYmFja3VwSW5mbyA9IGF3YWl0IHRoaXMuZ2V0S2V5QmFja3VwSW5mbygpO1xuICAgICAgICAgICAgICAgIGlmIChiYWNrdXBJbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vIGNyb3NzLXNpZ25pbmcgb24gYWNjb3VudCBidXQga2V5IGJhY2t1cCBhdmFpbGFibGUgKHVwZ3JhZGUgZW5jcnlwdGlvbilcbiAgICAgICAgICAgICAgICAgICAgc2hvd1NldHVwRW5jcnlwdGlvblRvYXN0KFNldHVwS2luZC5VUEdSQURFX0VOQ1JZUFRJT04pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vIGNyb3NzLXNpZ25pbmcgb3Iga2V5IGJhY2t1cCBvbiBhY2NvdW50IChzZXQgdXAgZW5jcnlwdGlvbilcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgY2xpLndhaXRGb3JDbGllbnRXZWxsS25vd24oKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzU2VjdXJlQmFja3VwUmVxdWlyZWQoKSAmJiBpc0xvZ2dlZEluKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHdlJ3JlIG1lYW50IHRvIHNldCB1cCwgYW5kIFNlY3VyZSBCYWNrdXAgaXMgcmVxdWlyZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0cmlnZ2VyIHRoZSBmbG93IGRpcmVjdGx5IHdpdGhvdXQgYSB0b2FzdCBvbmNlIGxvZ2dlZCBpbi5cbiAgICAgICAgICAgICAgICAgICAgICAgIGhpZGVTZXR1cEVuY3J5cHRpb25Ub2FzdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYWNjZXNzU2VjcmV0U3RvcmFnZSgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hvd1NldHVwRW5jcnlwdGlvblRvYXN0KFNldHVwS2luZC5TRVRfVVBfRU5DUllQVElPTik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGlzIG5lZWRzIHRvIGJlIGRvbmUgYWZ0ZXIgYXdhaXRpbmcgb24gZG93bmxvYWRLZXlzKCkgYWJvdmUsIHNvXG4gICAgICAgIC8vIHdlIG1ha2Ugc3VyZSB3ZSBnZXQgdGhlIGRldmljZXMgYWZ0ZXIgdGhlIGZldGNoIGlzIGRvbmUuXG4gICAgICAgIHRoaXMuZW5zdXJlRGV2aWNlSWRzQXRTdGFydFBvcHVsYXRlZCgpO1xuXG4gICAgICAgIC8vIFVudmVyaWZpZWQgZGV2aWNlcyB0aGF0IHdlcmUgdGhlcmUgbGFzdCB0aW1lIHRoZSBhcHAgcmFuXG4gICAgICAgIC8vICh0ZWNobmljYWxseSBjb3VsZCBqdXN0IGJlIGEgYm9vbGVhbjogd2UgZG9uJ3QgYWN0dWFsbHlcbiAgICAgICAgLy8gbmVlZCB0byByZW1lbWJlciB0aGUgZGV2aWNlIElEcywgYnV0IGZvciB0aGUgc2FrZSBvZlxuICAgICAgICAvLyBzeW1tZXRyeS4uLikuXG4gICAgICAgIGNvbnN0IG9sZFVudmVyaWZpZWREZXZpY2VJZHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgICAgICAgLy8gVW52ZXJpZmllZCBkZXZpY2VzIHRoYXQgaGF2ZSBhcHBlYXJlZCBzaW5jZSB0aGVuXG4gICAgICAgIGNvbnN0IG5ld1VudmVyaWZpZWREZXZpY2VJZHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcblxuICAgICAgICAvLyBhcyBsb25nIGFzIGNyb3NzLXNpZ25pbmcgaXNuJ3QgcmVhZHksXG4gICAgICAgIC8vIHlvdSBjYW4ndCBzZWUgb3IgZGlzbWlzcyBhbnkgZGV2aWNlIHRvYXN0c1xuICAgICAgICBpZiAoY3Jvc3NTaWduaW5nUmVhZHkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRldmljZXMgPSBjbGkuZ2V0U3RvcmVkRGV2aWNlc0ZvclVzZXIoY2xpLmdldFVzZXJJZCgpKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZGV2aWNlIG9mIGRldmljZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGV2aWNlLmRldmljZUlkID09PSBjbGkuZGV2aWNlSWQpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgZGV2aWNlVHJ1c3QgPSBhd2FpdCBjbGkuY2hlY2tEZXZpY2VUcnVzdChjbGkuZ2V0VXNlcklkKCksIGRldmljZS5kZXZpY2VJZCk7XG4gICAgICAgICAgICAgICAgaWYgKCFkZXZpY2VUcnVzdC5pc0Nyb3NzU2lnbmluZ1ZlcmlmaWVkKCkgJiYgIXRoaXMuZGlzbWlzc2VkLmhhcyhkZXZpY2UuZGV2aWNlSWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm91ckRldmljZUlkc0F0U3RhcnQuaGFzKGRldmljZS5kZXZpY2VJZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9sZFVudmVyaWZpZWREZXZpY2VJZHMuYWRkKGRldmljZS5kZXZpY2VJZCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdVbnZlcmlmaWVkRGV2aWNlSWRzLmFkZChkZXZpY2UuZGV2aWNlSWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbG9nZ2VyLmRlYnVnKFwiT2xkIHVudmVyaWZpZWQgc2Vzc2lvbnM6IFwiICsgQXJyYXkuZnJvbShvbGRVbnZlcmlmaWVkRGV2aWNlSWRzKS5qb2luKCcsJykpO1xuICAgICAgICBsb2dnZXIuZGVidWcoXCJOZXcgdW52ZXJpZmllZCBzZXNzaW9uczogXCIgKyBBcnJheS5mcm9tKG5ld1VudmVyaWZpZWREZXZpY2VJZHMpLmpvaW4oJywnKSk7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZyhcIkN1cnJlbnRseSBzaG93aW5nIHRvYXN0cyBmb3I6IFwiICsgQXJyYXkuZnJvbSh0aGlzLmRpc3BsYXlpbmdUb2FzdHNGb3JEZXZpY2VJZHMpLmpvaW4oJywnKSk7XG5cbiAgICAgICAgLy8gRGlzcGxheSBvciBoaWRlIHRoZSBiYXRjaCB0b2FzdCBmb3Igb2xkIHVudmVyaWZpZWQgc2Vzc2lvbnNcbiAgICAgICAgaWYgKG9sZFVudmVyaWZpZWREZXZpY2VJZHMuc2l6ZSA+IDApIHtcbiAgICAgICAgICAgIHNob3dCdWxrVW52ZXJpZmllZFNlc3Npb25zVG9hc3Qob2xkVW52ZXJpZmllZERldmljZUlkcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBoaWRlQnVsa1VudmVyaWZpZWRTZXNzaW9uc1RvYXN0KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTaG93IHRvYXN0cyBmb3IgbmV3IHVudmVyaWZpZWQgZGV2aWNlcyBpZiB0aGV5IGFyZW4ndCBhbHJlYWR5IHRoZXJlXG4gICAgICAgIGZvciAoY29uc3QgZGV2aWNlSWQgb2YgbmV3VW52ZXJpZmllZERldmljZUlkcykge1xuICAgICAgICAgICAgc2hvd1VudmVyaWZpZWRTZXNzaW9uc1RvYXN0KGRldmljZUlkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIC4uLmFuZCBoaWRlIGFueSB3ZSBkb24ndCBuZWVkIGFueSBtb3JlXG4gICAgICAgIGZvciAoY29uc3QgZGV2aWNlSWQgb2YgdGhpcy5kaXNwbGF5aW5nVG9hc3RzRm9yRGV2aWNlSWRzKSB7XG4gICAgICAgICAgICBpZiAoIW5ld1VudmVyaWZpZWREZXZpY2VJZHMuaGFzKGRldmljZUlkKSkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhcIkhpZGluZyB1bnZlcmlmaWVkIHNlc3Npb24gdG9hc3QgZm9yIFwiICsgZGV2aWNlSWQpO1xuICAgICAgICAgICAgICAgIGhpZGVVbnZlcmlmaWVkU2Vzc2lvbnNUb2FzdChkZXZpY2VJZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmRpc3BsYXlpbmdUb2FzdHNGb3JEZXZpY2VJZHMgPSBuZXdVbnZlcmlmaWVkRGV2aWNlSWRzO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2hlY2tLZXlCYWNrdXBTdGF0dXMgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmtleUJhY2t1cFN0YXR1c0NoZWNrZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyByZXR1cm5zIG51bGwgd2hlbiBrZXkgYmFja3VwIHN0YXR1cyBoYXNuJ3QgZmluaXNoZWQgYmVpbmcgY2hlY2tlZFxuICAgICAgICBjb25zdCBpc0tleUJhY2t1cEVuYWJsZWQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0S2V5QmFja3VwRW5hYmxlZCgpO1xuICAgICAgICB0aGlzLmtleUJhY2t1cFN0YXR1c0NoZWNrZWQgPSBpc0tleUJhY2t1cEVuYWJsZWQgIT09IG51bGw7XG5cbiAgICAgICAgaWYgKGlzS2V5QmFja3VwRW5hYmxlZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7IGFjdGlvbjogQWN0aW9uLlJlcG9ydEtleUJhY2t1cE5vdEVuYWJsZWQgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFJQTs7QUFLQTs7QUFJQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUF6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBNkJBLE1BQU1BLHdCQUF3QixHQUFHLElBQUksRUFBSixHQUFTLElBQTFDOztBQUVlLE1BQU1DLGNBQU4sQ0FBcUI7RUFBQTtJQUFBO0lBQUEsaURBR1osSUFBSUMsR0FBSixFQUhZO0lBQUEsZ0VBS0csS0FMSDtJQUFBLHFEQU9BLElBUEE7SUFBQSwwREFRSyxJQVJMO0lBQUEsOERBU0MsS0FURDtJQUFBLDJEQWFXLElBYlg7SUFBQSxvRUFlTyxJQUFJQSxHQUFKLEVBZlA7SUFBQSwrQ0FnQmQsS0FoQmM7SUFBQSwyREE2RkYsT0FBT0MsS0FBUCxFQUF3QkMsWUFBeEIsS0FBbUQ7TUFDN0U7TUFDQTtNQUNBO01BQ0EsSUFBSUEsWUFB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