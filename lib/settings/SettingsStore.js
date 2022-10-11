"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.LEVEL_ORDER = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _logger = require("matrix-js-sdk/src/logger");

var _DeviceSettingsHandler = _interopRequireDefault(require("./handlers/DeviceSettingsHandler"));

var _RoomDeviceSettingsHandler = _interopRequireDefault(require("./handlers/RoomDeviceSettingsHandler"));

var _DefaultSettingsHandler = _interopRequireDefault(require("./handlers/DefaultSettingsHandler"));

var _RoomAccountSettingsHandler = _interopRequireDefault(require("./handlers/RoomAccountSettingsHandler"));

var _AccountSettingsHandler = _interopRequireDefault(require("./handlers/AccountSettingsHandler"));

var _RoomSettingsHandler = _interopRequireDefault(require("./handlers/RoomSettingsHandler"));

var _ConfigSettingsHandler = _interopRequireDefault(require("./handlers/ConfigSettingsHandler"));

var _languageHandler = require("../languageHandler");

var _dispatcher = _interopRequireDefault(require("../dispatcher/dispatcher"));

var _Settings = require("./Settings");

var _LocalEchoWrapper = _interopRequireDefault(require("./handlers/LocalEchoWrapper"));

var _WatchManager = require("./WatchManager");

var _SettingLevel = require("./SettingLevel");

var _actions = require("../dispatcher/actions");

var _PlatformSettingsHandler = _interopRequireDefault(require("./handlers/PlatformSettingsHandler"));

var _MatrixClientPeg = require("../MatrixClientPeg");

/*
Copyright 2017 Travis Ralston
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
const defaultWatchManager = new _WatchManager.WatchManager(); // Convert the settings to easier to manage objects for the handlers

const defaultSettings = {};
const invertedDefaultSettings = {};
const featureNames = [];

for (const key of Object.keys(_Settings.SETTINGS)) {
  defaultSettings[key] = _Settings.SETTINGS[key].default;
  if (_Settings.SETTINGS[key].isFeature) featureNames.push(key);

  if (_Settings.SETTINGS[key].invertedSettingName) {
    // Invert now so that the rest of the system will invert it back
    // to what was intended.
    invertedDefaultSettings[_Settings.SETTINGS[key].invertedSettingName] = !_Settings.SETTINGS[key].default;
  }
} // Only wrap the handlers with async setters in a local echo wrapper


const LEVEL_HANDLERS = {
  [_SettingLevel.SettingLevel.DEVICE]: new _DeviceSettingsHandler.default(featureNames, defaultWatchManager),
  [_SettingLevel.SettingLevel.ROOM_DEVICE]: new _RoomDeviceSettingsHandler.default(defaultWatchManager),
  [_SettingLevel.SettingLevel.ROOM_ACCOUNT]: new _LocalEchoWrapper.default(new _RoomAccountSettingsHandler.default(defaultWatchManager), _SettingLevel.SettingLevel.ROOM_ACCOUNT),
  [_SettingLevel.SettingLevel.ACCOUNT]: new _LocalEchoWrapper.default(new _AccountSettingsHandler.default(defaultWatchManager), _SettingLevel.SettingLevel.ACCOUNT),
  [_SettingLevel.SettingLevel.ROOM]: new _LocalEchoWrapper.default(new _RoomSettingsHandler.default(defaultWatchManager), _SettingLevel.SettingLevel.ROOM),
  [_SettingLevel.SettingLevel.PLATFORM]: new _LocalEchoWrapper.default(new _PlatformSettingsHandler.default(), _SettingLevel.SettingLevel.PLATFORM),
  [_SettingLevel.SettingLevel.CONFIG]: new _ConfigSettingsHandler.default(featureNames),
  [_SettingLevel.SettingLevel.DEFAULT]: new _DefaultSettingsHandler.default(defaultSettings, invertedDefaultSettings)
};
const LEVEL_ORDER = [_SettingLevel.SettingLevel.DEVICE, _SettingLevel.SettingLevel.ROOM_DEVICE, _SettingLevel.SettingLevel.ROOM_ACCOUNT, _SettingLevel.SettingLevel.ACCOUNT, _SettingLevel.SettingLevel.ROOM, _SettingLevel.SettingLevel.CONFIG, _SettingLevel.SettingLevel.DEFAULT];
exports.LEVEL_ORDER = LEVEL_ORDER;

function getLevelOrder(setting) {
  // Settings which support only a single setting level are inherently ordered
  if (setting.supportedLevelsAreOrdered || setting.supportedLevels.length === 1) {
    // return a copy to prevent callers from modifying the array
    return [...setting.supportedLevels];
  }

  return LEVEL_ORDER;
}

/**
 * Controls and manages application settings by providing varying levels at which the
 * setting value may be specified. The levels are then used to determine what the setting
 * value should be given a set of circumstances. The levels, in priority order, are:
 * - SettingLevel.DEVICE         - Values are determined by the current device
 * - SettingLevel.ROOM_DEVICE    - Values are determined by the current device for a particular room
 * - SettingLevel.ROOM_ACCOUNT   - Values are determined by the current account for a particular room
 * - SettingLevel.ACCOUNT        - Values are determined by the current account
 * - SettingLevel.ROOM           - Values are determined by a particular room (by the room admins)
 * - SettingLevel.CONFIG         - Values are determined by the config.json
 * - SettingLevel.DEFAULT        - Values are determined by the hardcoded defaults
 *
 * Each level has a different method to storing the setting value. For implementation
 * specific details, please see the handlers. The "config" and "default" levels are
 * both always supported on all platforms. All other settings should be guarded by
 * isLevelSupported() prior to attempting to set the value.
 *
 * Settings can also represent features. Features are significant portions of the
 * application that warrant a dedicated setting to toggle them on or off. Features are
 * special-cased to ensure that their values respect the configuration (for example, a
 * feature may be reported as disabled even though a user has specifically requested it
 * be enabled).
 */
class SettingsStore {
  // We support watching settings for changes, and do this by tracking which callbacks have
  // been given to us. We end up returning the callbackRef to the caller so they can unsubscribe
  // at a later point.
  //
  // We also maintain a list of monitors which are special watchers: they cause dispatches
  // when the setting changes. We track which rooms we're monitoring though to ensure we
  // don't duplicate updates on the bus.
  // { settingName => { roomId => callbackRef } }
  // Counter used for generation of watcher IDs

  /**
   * Gets all the feature-style setting names.
   * @returns {string[]} The names of the feature settings.
   */
  static getFeatureSettingNames() {
    return Object.keys(_Settings.SETTINGS).filter(n => SettingsStore.isFeature(n));
  }
  /**
   * Watches for changes in a particular setting. This is done without any local echo
   * wrapping and fires whenever a change is detected in a setting's value, at any level.
   * Watching is intended to be used in scenarios where the app needs to react to changes
   * made by other devices. It is otherwise expected that callers will be able to use the
   * Controller system or track their own changes to settings. Callers should retain the
   * returned reference to later unsubscribe from updates.
   * @param {string} settingName The setting name to watch
   * @param {String} roomId The room ID to watch for changes in. May be null for 'all'.
   * @param {function} callbackFn A function to be called when a setting change is
   * detected. Five arguments can be expected: the setting name, the room ID (may be null),
   * the level the change happened at, the new value at the given level, and finally the new
   * value for the setting regardless of level. The callback is responsible for determining
   * if the change in value is worthwhile enough to react upon.
   * @returns {string} A reference to the watcher that was employed.
   */


  static watchSetting(settingName, roomId, callbackFn) {
    const setting = _Settings.SETTINGS[settingName];
    const originalSettingName = settingName;
    if (!setting) throw new Error(`${settingName} is not a setting`);

    if (setting.invertedSettingName) {
      settingName = setting.invertedSettingName;
    }

    const watcherId = `${new Date().getTime()}_${SettingsStore.watcherCount++}_${settingName}_${roomId}`;

    const localizedCallback = (changedInRoomId, atLevel, newValAtLevel) => {
      if (!SettingsStore.doesSettingSupportLevel(originalSettingName, atLevel)) {
        _logger.logger.warn(`Setting handler notified for an update of an invalid setting level: ` + `${originalSettingName}@${atLevel} - this likely means a weird setting value ` + `made it into the level's storage. The notification will be ignored.`);

        return;
      }

      const newValue = SettingsStore.getValue(originalSettingName);
      const newValueAtLevel = SettingsStore.getValueAt(atLevel, originalSettingName) ?? newValAtLevel;
      callbackFn(originalSettingName, changedInRoomId, atLevel, newValueAtLevel, newValue);
    };

    SettingsStore.watchers.set(watcherId, localizedCallback);
    defaultWatchManager.watchSetting(settingName, roomId, localizedCallback);
    return watcherId;
  }
  /**
   * Stops the SettingsStore from watching a setting. This is a no-op if the watcher
   * provided is not found.
   * @param {string} watcherReference The watcher reference (received from #watchSetting)
   * to cancel.
   */


  static unwatchSetting(watcherReference) {
    if (!SettingsStore.watchers.has(watcherReference)) {
      _logger.logger.warn(`Ending non-existent watcher ID ${watcherReference}`);

      return;
    }

    defaultWatchManager.unwatchSetting(SettingsStore.watchers.get(watcherReference));
    SettingsStore.watchers.delete(watcherReference);
  }
  /**
   * Sets up a monitor for a setting. This behaves similar to #watchSetting except instead
   * of making a call to a callback, it forwards all changes to the dispatcher. Callers can
   * expect to listen for the 'setting_updated' action with an object containing settingName,
   * roomId, level, newValueAtLevel, and newValue.
   * @param {string} settingName The setting name to monitor.
   * @param {String} roomId The room ID to monitor for changes in. Use null for all rooms.
   */


  static monitorSetting(settingName, roomId) {
    roomId = roomId || null; // the thing wants null specifically to work, so appease it.

    if (!this.monitors.has(settingName)) this.monitors.set(settingName, new Map());

    const registerWatcher = () => {
      this.monitors.get(settingName).set(roomId, SettingsStore.watchSetting(settingName, roomId, (settingName, inRoomId, level, newValueAtLevel, newValue) => {
        _dispatcher.default.dispatch({
          action: _actions.Action.SettingUpdated,
          settingName,
          roomId: inRoomId,
          level,
          newValueAtLevel,
          newValue
        });
      }));
    };

    const rooms = Array.from(this.monitors.get(settingName).keys());
    const hasRoom = rooms.find(r => r === roomId || r === null);

    if (!hasRoom) {
      registerWatcher();
    } else {
      if (roomId === null) {
        // Unregister all existing watchers and register the new one
        rooms.forEach(roomId => {
          SettingsStore.unwatchSetting(this.monitors.get(settingName).get(roomId));
        });
        this.monitors.get(settingName).clear();
        registerWatcher();
      } // else a watcher is already registered for the room, so don't bother registering it again

    }
  }
  /**
   * Gets the translated display name for a given setting
   * @param {string} settingName The setting to look up.
   * @param {SettingLevel} atLevel
   * The level to get the display name for; Defaults to 'default'.
   * @return {String} The display name for the setting, or null if not found.
   */


  static getDisplayName(settingName) {
    let atLevel = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _SettingLevel.SettingLevel.DEFAULT;
    if (!_Settings.SETTINGS[settingName] || !_Settings.SETTINGS[settingName].displayName) return null;
    let displayName = _Settings.SETTINGS[settingName].displayName;

    if (displayName instanceof Object) {
      if (displayName[atLevel]) displayName = displayName[atLevel];else displayName = displayName["default"];
    }

    return (0, _languageHandler._t)(displayName);
  }
  /**
   * Gets the translated description for a given setting
   * @param {string} settingName The setting to look up.
   * @return {String} The description for the setting, or null if not found.
   */


  static getDescription(settingName) {
    const description = _Settings.SETTINGS[settingName]?.description;
    if (!description) return null;
    if (typeof description !== 'string') return description();
    return (0, _languageHandler._t)(description);
  }
  /**
   * Determines if a setting is also a feature.
   * @param {string} settingName The setting to look up.
   * @return {boolean} True if the setting is a feature.
   */


  static isFeature(settingName) {
    if (!_Settings.SETTINGS[settingName]) return false;
    return _Settings.SETTINGS[settingName].isFeature;
  }

  static getBetaInfo(settingName) {
    // consider a beta disabled if the config is explicitly set to false, in which case treat as normal Labs flag
    if (SettingsStore.isFeature(settingName) && SettingsStore.getValueAt(_SettingLevel.SettingLevel.CONFIG, settingName, null, true, true) !== false) {
      return _Settings.SETTINGS[settingName]?.betaInfo;
    }
  }

  static getLabGroup(settingName) {
    if (SettingsStore.isFeature(settingName)) {
      return _Settings.SETTINGS[settingName].labsGroup;
    }
  }
  /**
   * Determines if a setting is enabled.
   * If a setting is disabled then it should be hidden from the user.
   * @param {string} settingName The setting to look up.
   * @return {boolean} True if the setting is enabled.
   */


  static isEnabled(settingName) {
    if (!_Settings.SETTINGS[settingName]) return false;
    return _Settings.SETTINGS[settingName].controller ? !_Settings.SETTINGS[settingName].controller.settingDisabled : true;
  }
  /**
   * Gets the value of a setting. The room ID is optional if the setting is not to
   * be applied to any particular room, otherwise it should be supplied.
   * @param {string} settingName The name of the setting to read the value of.
   * @param {String} roomId The room ID to read the setting value in, may be null.
   * @param {boolean} excludeDefault True to disable using the default value.
   * @return {*} The value, or null if not found
   */


  static getValue(settingName) {
    let roomId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    let excludeDefault = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    // Verify that the setting is actually a setting
    if (!_Settings.SETTINGS[settingName]) {
      throw new Error("Setting '" + settingName + "' does not appear to be a setting.");
    }

    const setting = _Settings.SETTINGS[settingName];
    const levelOrder = getLevelOrder(setting);
    return SettingsStore.getValueAt(levelOrder[0], settingName, roomId, false, excludeDefault);
  }
  /**
   * Gets a setting's value at a particular level, ignoring all levels that are more specific.
   * @param {SettingLevel|"config"|"default"} level The
   * level to look at.
   * @param {string} settingName The name of the setting to read.
   * @param {String} roomId The room ID to read the setting value in, may be null.
   * @param {boolean} explicit If true, this method will not consider other levels, just the one
   * provided. Defaults to false.
   * @param {boolean} excludeDefault True to disable using the default value.
   * @return {*} The value, or null if not found.
   */


  static getValueAt(level, settingName) {
    let roomId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    let explicit = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    let excludeDefault = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
    // Verify that the setting is actually a setting
    const setting = _Settings.SETTINGS[settingName];

    if (!setting) {
      throw new Error("Setting '" + settingName + "' does not appear to be a setting.");
    }

    const levelOrder = getLevelOrder(setting);
    if (!levelOrder.includes(_SettingLevel.SettingLevel.DEFAULT)) levelOrder.push(_SettingLevel.SettingLevel.DEFAULT); // always include default

    const minIndex = levelOrder.indexOf(level);
    if (minIndex === -1) throw new Error(`Level "${level}" for setting "${settingName}" is not prioritized`);
    const handlers = SettingsStore.getHandlers(settingName); // Check if we need to invert the setting at all. Do this after we get the setting
    // handlers though, otherwise we'll fail to read the value.

    if (setting.invertedSettingName) {
      //console.warn(`Inverting ${settingName} to be ${setting.invertedSettingName} - legacy setting`);
      settingName = setting.invertedSettingName;
    }

    if (explicit) {
      const handler = handlers[level];

      if (!handler) {
        return SettingsStore.getFinalValue(setting, level, roomId, null, null);
      }

      const value = handler.getValue(settingName, roomId);
      return SettingsStore.getFinalValue(setting, level, roomId, value, level);
    }

    for (let i = minIndex; i < levelOrder.length; i++) {
      const handler = handlers[levelOrder[i]];
      if (!handler) continue;
      if (excludeDefault && levelOrder[i] === "default") continue;
      const value = handler.getValue(settingName, roomId);
      if (value === null || value === undefined) continue;
      return SettingsStore.getFinalValue(setting, level, roomId, value, levelOrder[i]);
    }

    return SettingsStore.getFinalValue(setting, level, roomId, null, null);
  }
  /**
   * Gets the default value of a setting.
   * @param {string} settingName The name of the setting to read the value of.
   * @param {String} roomId The room ID to read the setting value in, may be null.
   * @return {*} The default value
   */


  static getDefaultValue(settingName) {
    // Verify that the setting is actually a setting
    if (!_Settings.SETTINGS[settingName]) {
      throw new Error("Setting '" + settingName + "' does not appear to be a setting.");
    }

    return _Settings.SETTINGS[settingName].default;
  }

  static getFinalValue(setting, level, roomId, calculatedValue, calculatedAtLevel) {
    let resultingValue = calculatedValue;

    if (setting.controller) {
      const actualValue = setting.controller.getValueOverride(level, roomId, calculatedValue, calculatedAtLevel);
      if (actualValue !== undefined && actualValue !== null) resultingValue = actualValue;
    }

    if (setting.invertedSettingName) resultingValue = !resultingValue;
    return resultingValue;
  }
  /* eslint-disable valid-jsdoc */
  //https://github.com/eslint/eslint/issues/7307

  /**
   * Sets the value for a setting. The room ID is optional if the setting is not being
   * set for a particular room, otherwise it should be supplied. The value may be null
   * to indicate that the level should no longer have an override.
   * @param {string} settingName The name of the setting to change.
   * @param {String} roomId The room ID to change the value in, may be null.
   * @param {SettingLevel} level The level
   * to change the value at.
   * @param {*} value The new value of the setting, may be null.
   * @return {Promise} Resolves when the setting has been changed.
   */

  /* eslint-enable valid-jsdoc */


  static async setValue(settingName, roomId, level, value) {
    // Verify that the setting is actually a setting
    const setting = _Settings.SETTINGS[settingName];

    if (!setting) {
      throw new Error("Setting '" + settingName + "' does not appear to be a setting.");
    }

    const handler = SettingsStore.getHandler(settingName, level);

    if (!handler) {
      throw new Error("Setting " + settingName + " does not have a handler for " + level);
    }

    if (setting.invertedSettingName) {
      // Note: We can't do this when the `level` is "default", however we also
      // know that the user can't possible change the default value through this
      // function so we don't bother checking it.
      //console.warn(`Inverting ${settingName} to be ${setting.invertedSettingName} - legacy setting`);
      settingName = setting.invertedSettingName;
      value = !value;
    }

    if (!handler.canSetValue(settingName, roomId)) {
      throw new Error("User cannot set " + settingName + " at " + level + " in " + roomId);
    }

    if (setting.controller && !(await setting.controller.beforeChange(level, roomId, value))) {
      return; // controller says no
    }

    await handler.setValue(settingName, roomId, value);
    setting.controller?.onChange(level, roomId, value);
  }
  /**
   * Determines if the current user is permitted to set the given setting at the given
   * level for a particular room. The room ID is optional if the setting is not being
   * set for a particular room, otherwise it should be supplied.
   * @param {string} settingName The name of the setting to check.
   * @param {String} roomId The room ID to check in, may be null.
   * @param {SettingLevel} level The level to
   * check at.
   * @return {boolean} True if the user may set the setting, false otherwise.
   */


  static canSetValue(settingName, roomId, level) {
    // Verify that the setting is actually a setting
    if (!_Settings.SETTINGS[settingName]) {
      throw new Error("Setting '" + settingName + "' does not appear to be a setting.");
    }

    if (!SettingsStore.isEnabled(settingName)) {
      return false;
    } // When non-beta features are specified in the config.json, we force them as enabled or disabled.


    if (SettingsStore.isFeature(settingName) && !_Settings.SETTINGS[settingName]?.betaInfo) {
      const configVal = SettingsStore.getValueAt(_SettingLevel.SettingLevel.CONFIG, settingName, roomId, true, true);
      if (configVal === true || configVal === false) return false;
    }

    const handler = SettingsStore.getHandler(settingName, level);
    if (!handler) return false;
    return handler.canSetValue(settingName, roomId);
  }
  /**
   * Determines if the given level is supported on this device.
   * @param {SettingLevel} level The level
   * to check the feasibility of.
   * @return {boolean} True if the level is supported, false otherwise.
   */


  static isLevelSupported(level) {
    if (!LEVEL_HANDLERS[level]) return false;
    return LEVEL_HANDLERS[level].isSupported();
  }
  /**
   * Determines if a setting supports a particular level.
   * @param settingName The setting name.
   * @param level The level.
   * @returns True if supported, false otherwise. Note that this will not check to see if
   * the level itself can be supported by the runtime (ie: you will need to call #isLevelSupported()
   * on your own).
   */


  static doesSettingSupportLevel(settingName, level) {
    const setting = _Settings.SETTINGS[settingName];

    if (!setting) {
      throw new Error("Setting '" + settingName + "' does not appear to be a setting.");
    }

    return level === _SettingLevel.SettingLevel.DEFAULT || setting.supportedLevels.includes(level);
  }
  /**
   * Determines the first supported level out of all the levels that can be used for a
   * specific setting.
   * @param {string} settingName The setting name.
   * @return {SettingLevel}
   */


  static firstSupportedLevel(settingName) {
    // Verify that the setting is actually a setting
    const setting = _Settings.SETTINGS[settingName];

    if (!setting) {
      throw new Error("Setting '" + settingName + "' does not appear to be a setting.");
    }

    const levelOrder = getLevelOrder(setting);
    if (!levelOrder.includes(_SettingLevel.SettingLevel.DEFAULT)) levelOrder.push(_SettingLevel.SettingLevel.DEFAULT); // always include default

    const handlers = SettingsStore.getHandlers(settingName);

    for (const level of levelOrder) {
      const handler = handlers[level];
      if (!handler) continue;
      return level;
    }

    return null;
  }
  /**
   * Runs or queues any setting migrations needed.
   */


  static runMigrations() {
    // Dev notes: to add your migration, just add a new `migrateMyFeature` function, call it, and
    // add a comment to note when it can be removed.
    SettingsStore.migrateHiddenReadReceipts(); // Can be removed after October 2022.
  }

  static migrateHiddenReadReceipts() {
    if (_MatrixClientPeg.MatrixClientPeg.get().isGuest()) return; // not worth it
    // We wait for the first sync to ensure that the user's existing account data has loaded, as otherwise
    // getValue() for an account-level setting like sendReadReceipts will return `null`.

    const disRef = _dispatcher.default.register(payload => {
      if (payload.action === "MatrixActions.sync") {
        _dispatcher.default.unregister(disRef);

        const rrVal = SettingsStore.getValue("sendReadReceipts", null, true);

        if (typeof rrVal !== "boolean") {
          // new setting isn't set - see if the labs flag was. We have to manually reach into the
          // handler for this because it isn't a setting anymore (`getValue` will yell at us).
          const handler = LEVEL_HANDLERS[_SettingLevel.SettingLevel.DEVICE];
          const labsVal = handler.readFeature("feature_hidden_read_receipts");

          if (typeof labsVal === "boolean") {
            // Inverse of labs flag because negative->positive language switch in setting name
            const newVal = !labsVal;
            console.log(`Setting sendReadReceipts to ${newVal} because of previously-set labs flag`); // noinspection JSIgnoredPromiseFromCall

            SettingsStore.setValue("sendReadReceipts", null, _SettingLevel.SettingLevel.ACCOUNT, newVal);
          }
        }
      }
    });
  }
  /**
   * Debugging function for reading explicit setting values without going through the
   * complicated/biased functions in the SettingsStore. This will print information to
   * the console for analysis. Not intended to be used within the application.
   * @param {string} realSettingName The setting name to try and read.
   * @param {string} roomId Optional room ID to test the setting in.
   */


  static debugSetting(realSettingName, roomId) {
    _logger.logger.log(`--- DEBUG ${realSettingName}`); // Note: we intentionally use JSON.stringify here to avoid the console masking the
    // problem if there's a type representation issue. Also, this way it is guaranteed
    // to show up in a rageshake if required.


    const def = _Settings.SETTINGS[realSettingName];

    _logger.logger.log(`--- definition: ${def ? JSON.stringify(def) : '<NOT_FOUND>'}`);

    _logger.logger.log(`--- default level order: ${JSON.stringify(LEVEL_ORDER)}`);

    _logger.logger.log(`--- registered handlers: ${JSON.stringify(Object.keys(LEVEL_HANDLERS))}`);

    const doChecks = settingName => {
      for (const handlerName of Object.keys(LEVEL_HANDLERS)) {
        const handler = LEVEL_HANDLERS[handlerName];

        try {
          const value = handler.getValue(settingName, roomId);

          _logger.logger.log(`---     ${handlerName}@${roomId || '<no_room>'} = ${JSON.stringify(value)}`);
        } catch (e) {
          _logger.logger.log(`---     ${handler}@${roomId || '<no_room>'} THREW ERROR: ${e.message}`);

          _logger.logger.error(e);
        }

        if (roomId) {
          try {
            const value = handler.getValue(settingName, null);

            _logger.logger.log(`---     ${handlerName}@<no_room> = ${JSON.stringify(value)}`);
          } catch (e) {
            _logger.logger.log(`---     ${handler}@<no_room> THREW ERROR: ${e.message}`);

            _logger.logger.error(e);
          }
        }
      }

      _logger.logger.log(`--- calculating as returned by SettingsStore`);

      _logger.logger.log(`--- these might not match if the setting uses a controller - be warned!`);

      try {
        const value = SettingsStore.getValue(settingName, roomId);

        _logger.logger.log(`---     SettingsStore#generic@${roomId || '<no_room>'}  = ${JSON.stringify(value)}`);
      } catch (e) {
        _logger.logger.log(`---     SettingsStore#generic@${roomId || '<no_room>'} THREW ERROR: ${e.message}`);

        _logger.logger.error(e);
      }

      if (roomId) {
        try {
          const value = SettingsStore.getValue(settingName, null);

          _logger.logger.log(`---     SettingsStore#generic@<no_room>  = ${JSON.stringify(value)}`);
        } catch (e) {
          _logger.logger.log(`---     SettingsStore#generic@$<no_room> THREW ERROR: ${e.message}`);

          _logger.logger.error(e);
        }
      }

      for (const level of LEVEL_ORDER) {
        try {
          const value = SettingsStore.getValueAt(level, settingName, roomId);

          _logger.logger.log(`---     SettingsStore#${level}@${roomId || '<no_room>'} = ${JSON.stringify(value)}`);
        } catch (e) {
          _logger.logger.log(`---     SettingsStore#${level}@${roomId || '<no_room>'} THREW ERROR: ${e.message}`);

          _logger.logger.error(e);
        }

        if (roomId) {
          try {
            const value = SettingsStore.getValueAt(level, settingName, null);

            _logger.logger.log(`---     SettingsStore#${level}@<no_room> = ${JSON.stringify(value)}`);
          } catch (e) {
            _logger.logger.log(`---     SettingsStore#${level}@$<no_room> THREW ERROR: ${e.message}`);

            _logger.logger.error(e);
          }
        }
      }
    };

    doChecks(realSettingName);

    if (def.invertedSettingName) {
      _logger.logger.log(`--- TESTING INVERTED SETTING NAME`);

      _logger.logger.log(`--- inverted: ${def.invertedSettingName}`);

      doChecks(def.invertedSettingName);
    }

    _logger.logger.log(`--- END DEBUG`);
  }

  static getHandler(settingName, level) {
    const handlers = SettingsStore.getHandlers(settingName);
    if (!handlers[level]) return null;
    return handlers[level];
  }

  static getHandlers(settingName) {
    if (!_Settings.SETTINGS[settingName]) return {};
    const handlers = {};

    for (const level of _Settings.SETTINGS[settingName].supportedLevels) {
      if (!LEVEL_HANDLERS[level]) throw new Error("Unexpected level " + level);
      if (SettingsStore.isLevelSupported(level)) handlers[level] = LEVEL_HANDLERS[level];
    } // Always support 'default'


    if (!handlers['default']) handlers['default'] = LEVEL_HANDLERS['default'];
    return handlers;
  }

} // For debugging purposes


exports.default = SettingsStore;
(0, _defineProperty2.default)(SettingsStore, "watchers", new Map());
(0, _defineProperty2.default)(SettingsStore, "monitors", new Map());
(0, _defineProperty2.default)(SettingsStore, "watcherCount", 1);
window.mxSettingsStore = SettingsStore;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkZWZhdWx0V2F0Y2hNYW5hZ2VyIiwiV2F0Y2hNYW5hZ2VyIiwiZGVmYXVsdFNldHRpbmdzIiwiaW52ZXJ0ZWREZWZhdWx0U2V0dGluZ3MiLCJmZWF0dXJlTmFtZXMiLCJrZXkiLCJPYmplY3QiLCJrZXlzIiwiU0VUVElOR1MiLCJkZWZhdWx0IiwiaXNGZWF0dXJlIiwicHVzaCIsImludmVydGVkU2V0dGluZ05hbWUiLCJMRVZFTF9IQU5ETEVSUyIsIlNldHRpbmdMZXZlbCIsIkRFVklDRSIsIkRldmljZVNldHRpbmdzSGFuZGxlciIsIlJPT01fREVWSUNFIiwiUm9vbURldmljZVNldHRpbmdzSGFuZGxlciIsIlJPT01fQUNDT1VOVCIsIkxvY2FsRWNob1dyYXBwZXIiLCJSb29tQWNjb3VudFNldHRpbmdzSGFuZGxlciIsIkFDQ09VTlQiLCJBY2NvdW50U2V0dGluZ3NIYW5kbGVyIiwiUk9PTSIsIlJvb21TZXR0aW5nc0hhbmRsZXIiLCJQTEFURk9STSIsIlBsYXRmb3JtU2V0dGluZ3NIYW5kbGVyIiwiQ09ORklHIiwiQ29uZmlnU2V0dGluZ3NIYW5kbGVyIiwiREVGQVVMVCIsIkRlZmF1bHRTZXR0aW5nc0hhbmRsZXIiLCJMRVZFTF9PUkRFUiIsImdldExldmVsT3JkZXIiLCJzZXR0aW5nIiwic3VwcG9ydGVkTGV2ZWxzQXJlT3JkZXJlZCIsInN1cHBvcnRlZExldmVscyIsImxlbmd0aCIsIlNldHRpbmdzU3RvcmUiLCJnZXRGZWF0dXJlU2V0dGluZ05hbWVzIiwiZmlsdGVyIiwibiIsIndhdGNoU2V0dGluZyIsInNldHRpbmdOYW1lIiwicm9vbUlkIiwiY2FsbGJhY2tGbiIsIm9yaWdpbmFsU2V0dGluZ05hbWUiLCJFcnJvciIsIndhdGNoZXJJZCIsIkRhdGUiLCJnZXRUaW1lIiwid2F0Y2hlckNvdW50IiwibG9jYWxpemVkQ2FsbGJhY2siLCJjaGFuZ2VkSW5Sb29tSWQiLCJhdExldmVsIiwibmV3VmFsQXRMZXZlbCIsImRvZXNTZXR0aW5nU3VwcG9ydExldmVsIiwibG9nZ2VyIiwid2FybiIsIm5ld1ZhbHVlIiwiZ2V0VmFsdWUiLCJuZXdWYWx1ZUF0TGV2ZWwiLCJnZXRWYWx1ZUF0Iiwid2F0Y2hlcnMiLCJzZXQiLCJ1bndhdGNoU2V0dGluZyIsIndhdGNoZXJSZWZlcmVuY2UiLCJoYXMiLCJnZXQiLCJkZWxldGUiLCJtb25pdG9yU2V0dGluZyIsIm1vbml0b3JzIiwiTWFwIiwicmVnaXN0ZXJXYXRjaGVyIiwiaW5Sb29tSWQiLCJsZXZlbCIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwiQWN0aW9uIiwiU2V0dGluZ1VwZGF0ZWQiLCJyb29tcyIsIkFycmF5IiwiZnJvbSIsImhhc1Jvb20iLCJmaW5kIiwiciIsImZvckVhY2giLCJjbGVhciIsImdldERpc3BsYXlOYW1lIiwiZGlzcGxheU5hbWUiLCJfdCIsImdldERlc2NyaXB0aW9uIiwiZGVzY3JpcHRpb24iLCJnZXRCZXRhSW5mbyIsImJldGFJbmZvIiwiZ2V0TGFiR3JvdXAiLCJsYWJzR3JvdXAiLCJpc0VuYWJsZWQiLCJjb250cm9sbGVyIiwic2V0dGluZ0Rpc2FibGVkIiwiZXhjbHVkZURlZmF1bHQiLCJsZXZlbE9yZGVyIiwiZXhwbGljaXQiLCJpbmNsdWRlcyIsIm1pbkluZGV4IiwiaW5kZXhPZiIsImhhbmRsZXJzIiwiZ2V0SGFuZGxlcnMiLCJoYW5kbGVyIiwiZ2V0RmluYWxWYWx1ZSIsInZhbHVlIiwiaSIsInVuZGVmaW5lZCIsImdldERlZmF1bHRWYWx1ZSIsImNhbGN1bGF0ZWRWYWx1ZSIsImNhbGN1bGF0ZWRBdExldmVsIiwicmVzdWx0aW5nVmFsdWUiLCJhY3R1YWxWYWx1ZSIsImdldFZhbHVlT3ZlcnJpZGUiLCJzZXRWYWx1ZSIsImdldEhhbmRsZXIiLCJjYW5TZXRWYWx1ZSIsImJlZm9yZUNoYW5nZSIsIm9uQ2hhbmdlIiwiY29uZmlnVmFsIiwiaXNMZXZlbFN1cHBvcnRlZCIsImlzU3VwcG9ydGVkIiwiZmlyc3RTdXBwb3J0ZWRMZXZlbCIsInJ1bk1pZ3JhdGlvbnMiLCJtaWdyYXRlSGlkZGVuUmVhZFJlY2VpcHRzIiwiTWF0cml4Q2xpZW50UGVnIiwiaXNHdWVzdCIsImRpc1JlZiIsImRpc3BhdGNoZXIiLCJyZWdpc3RlciIsInBheWxvYWQiLCJ1bnJlZ2lzdGVyIiwicnJWYWwiLCJsYWJzVmFsIiwicmVhZEZlYXR1cmUiLCJuZXdWYWwiLCJjb25zb2xlIiwibG9nIiwiZGVidWdTZXR0aW5nIiwicmVhbFNldHRpbmdOYW1lIiwiZGVmIiwiSlNPTiIsInN0cmluZ2lmeSIsImRvQ2hlY2tzIiwiaGFuZGxlck5hbWUiLCJlIiwibWVzc2FnZSIsImVycm9yIiwid2luZG93IiwibXhTZXR0aW5nc1N0b3JlIl0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NldHRpbmdzL1NldHRpbmdzU3RvcmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE3IFRyYXZpcyBSYWxzdG9uXG5Db3B5cmlnaHQgMjAxOSwgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7IGxvZ2dlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9sb2dnZXJcIjtcbmltcG9ydCB7IFJlYWN0Tm9kZSB9IGZyb20gXCJyZWFjdFwiO1xuXG5pbXBvcnQgRGV2aWNlU2V0dGluZ3NIYW5kbGVyIGZyb20gXCIuL2hhbmRsZXJzL0RldmljZVNldHRpbmdzSGFuZGxlclwiO1xuaW1wb3J0IFJvb21EZXZpY2VTZXR0aW5nc0hhbmRsZXIgZnJvbSBcIi4vaGFuZGxlcnMvUm9vbURldmljZVNldHRpbmdzSGFuZGxlclwiO1xuaW1wb3J0IERlZmF1bHRTZXR0aW5nc0hhbmRsZXIgZnJvbSBcIi4vaGFuZGxlcnMvRGVmYXVsdFNldHRpbmdzSGFuZGxlclwiO1xuaW1wb3J0IFJvb21BY2NvdW50U2V0dGluZ3NIYW5kbGVyIGZyb20gXCIuL2hhbmRsZXJzL1Jvb21BY2NvdW50U2V0dGluZ3NIYW5kbGVyXCI7XG5pbXBvcnQgQWNjb3VudFNldHRpbmdzSGFuZGxlciBmcm9tIFwiLi9oYW5kbGVycy9BY2NvdW50U2V0dGluZ3NIYW5kbGVyXCI7XG5pbXBvcnQgUm9vbVNldHRpbmdzSGFuZGxlciBmcm9tIFwiLi9oYW5kbGVycy9Sb29tU2V0dGluZ3NIYW5kbGVyXCI7XG5pbXBvcnQgQ29uZmlnU2V0dGluZ3NIYW5kbGVyIGZyb20gXCIuL2hhbmRsZXJzL0NvbmZpZ1NldHRpbmdzSGFuZGxlclwiO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IGRpcyBmcm9tICcuLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IHsgSUZlYXR1cmUsIElTZXR0aW5nLCBMYWJHcm91cCwgU0VUVElOR1MgfSBmcm9tIFwiLi9TZXR0aW5nc1wiO1xuaW1wb3J0IExvY2FsRWNob1dyYXBwZXIgZnJvbSBcIi4vaGFuZGxlcnMvTG9jYWxFY2hvV3JhcHBlclwiO1xuaW1wb3J0IHsgQ2FsbGJhY2tGbiBhcyBXYXRjaENhbGxiYWNrRm4sIFdhdGNoTWFuYWdlciB9IGZyb20gXCIuL1dhdGNoTWFuYWdlclwiO1xuaW1wb3J0IHsgU2V0dGluZ0xldmVsIH0gZnJvbSBcIi4vU2V0dGluZ0xldmVsXCI7XG5pbXBvcnQgU2V0dGluZ3NIYW5kbGVyIGZyb20gXCIuL2hhbmRsZXJzL1NldHRpbmdzSGFuZGxlclwiO1xuaW1wb3J0IHsgU2V0dGluZ1VwZGF0ZWRQYXlsb2FkIH0gZnJvbSBcIi4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvU2V0dGluZ1VwZGF0ZWRQYXlsb2FkXCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQgUGxhdGZvcm1TZXR0aW5nc0hhbmRsZXIgZnJvbSBcIi4vaGFuZGxlcnMvUGxhdGZvcm1TZXR0aW5nc0hhbmRsZXJcIjtcbmltcG9ydCBkaXNwYXRjaGVyIGZyb20gXCIuLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCB7IEFjdGlvblBheWxvYWQgfSBmcm9tIFwiLi4vZGlzcGF0Y2hlci9wYXlsb2Fkc1wiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSBcIi4uL01hdHJpeENsaWVudFBlZ1wiO1xuXG5jb25zdCBkZWZhdWx0V2F0Y2hNYW5hZ2VyID0gbmV3IFdhdGNoTWFuYWdlcigpO1xuXG4vLyBDb252ZXJ0IHRoZSBzZXR0aW5ncyB0byBlYXNpZXIgdG8gbWFuYWdlIG9iamVjdHMgZm9yIHRoZSBoYW5kbGVyc1xuY29uc3QgZGVmYXVsdFNldHRpbmdzID0ge307XG5jb25zdCBpbnZlcnRlZERlZmF1bHRTZXR0aW5ncyA9IHt9O1xuY29uc3QgZmVhdHVyZU5hbWVzID0gW107XG5mb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhTRVRUSU5HUykpIHtcbiAgICBkZWZhdWx0U2V0dGluZ3Nba2V5XSA9IFNFVFRJTkdTW2tleV0uZGVmYXVsdDtcbiAgICBpZiAoU0VUVElOR1Nba2V5XS5pc0ZlYXR1cmUpIGZlYXR1cmVOYW1lcy5wdXNoKGtleSk7XG4gICAgaWYgKFNFVFRJTkdTW2tleV0uaW52ZXJ0ZWRTZXR0aW5nTmFtZSkge1xuICAgICAgICAvLyBJbnZlcnQgbm93IHNvIHRoYXQgdGhlIHJlc3Qgb2YgdGhlIHN5c3RlbSB3aWxsIGludmVydCBpdCBiYWNrXG4gICAgICAgIC8vIHRvIHdoYXQgd2FzIGludGVuZGVkLlxuICAgICAgICBpbnZlcnRlZERlZmF1bHRTZXR0aW5nc1tTRVRUSU5HU1trZXldLmludmVydGVkU2V0dGluZ05hbWVdID0gIVNFVFRJTkdTW2tleV0uZGVmYXVsdDtcbiAgICB9XG59XG5cbi8vIE9ubHkgd3JhcCB0aGUgaGFuZGxlcnMgd2l0aCBhc3luYyBzZXR0ZXJzIGluIGEgbG9jYWwgZWNobyB3cmFwcGVyXG5jb25zdCBMRVZFTF9IQU5ETEVSUyA9IHtcbiAgICBbU2V0dGluZ0xldmVsLkRFVklDRV06IG5ldyBEZXZpY2VTZXR0aW5nc0hhbmRsZXIoZmVhdHVyZU5hbWVzLCBkZWZhdWx0V2F0Y2hNYW5hZ2VyKSxcbiAgICBbU2V0dGluZ0xldmVsLlJPT01fREVWSUNFXTogbmV3IFJvb21EZXZpY2VTZXR0aW5nc0hhbmRsZXIoZGVmYXVsdFdhdGNoTWFuYWdlciksXG4gICAgW1NldHRpbmdMZXZlbC5ST09NX0FDQ09VTlRdOiBuZXcgTG9jYWxFY2hvV3JhcHBlcihcbiAgICAgICAgbmV3IFJvb21BY2NvdW50U2V0dGluZ3NIYW5kbGVyKGRlZmF1bHRXYXRjaE1hbmFnZXIpLFxuICAgICAgICBTZXR0aW5nTGV2ZWwuUk9PTV9BQ0NPVU5ULFxuICAgICksXG4gICAgW1NldHRpbmdMZXZlbC5BQ0NPVU5UXTogbmV3IExvY2FsRWNob1dyYXBwZXIobmV3IEFjY291bnRTZXR0aW5nc0hhbmRsZXIoZGVmYXVsdFdhdGNoTWFuYWdlciksIFNldHRpbmdMZXZlbC5BQ0NPVU5UKSxcbiAgICBbU2V0dGluZ0xldmVsLlJPT01dOiBuZXcgTG9jYWxFY2hvV3JhcHBlcihuZXcgUm9vbVNldHRpbmdzSGFuZGxlcihkZWZhdWx0V2F0Y2hNYW5hZ2VyKSwgU2V0dGluZ0xldmVsLlJPT00pLFxuICAgIFtTZXR0aW5nTGV2ZWwuUExBVEZPUk1dOiBuZXcgTG9jYWxFY2hvV3JhcHBlcihuZXcgUGxhdGZvcm1TZXR0aW5nc0hhbmRsZXIoKSwgU2V0dGluZ0xldmVsLlBMQVRGT1JNKSxcbiAgICBbU2V0dGluZ0xldmVsLkNPTkZJR106IG5ldyBDb25maWdTZXR0aW5nc0hhbmRsZXIoZmVhdHVyZU5hbWVzKSxcbiAgICBbU2V0dGluZ0xldmVsLkRFRkFVTFRdOiBuZXcgRGVmYXVsdFNldHRpbmdzSGFuZGxlcihkZWZhdWx0U2V0dGluZ3MsIGludmVydGVkRGVmYXVsdFNldHRpbmdzKSxcbn07XG5cbmV4cG9ydCBjb25zdCBMRVZFTF9PUkRFUiA9IFtcbiAgICBTZXR0aW5nTGV2ZWwuREVWSUNFLFxuICAgIFNldHRpbmdMZXZlbC5ST09NX0RFVklDRSxcbiAgICBTZXR0aW5nTGV2ZWwuUk9PTV9BQ0NPVU5ULFxuICAgIFNldHRpbmdMZXZlbC5BQ0NPVU5ULFxuICAgIFNldHRpbmdMZXZlbC5ST09NLFxuICAgIFNldHRpbmdMZXZlbC5DT05GSUcsXG4gICAgU2V0dGluZ0xldmVsLkRFRkFVTFQsXG5dO1xuXG5mdW5jdGlvbiBnZXRMZXZlbE9yZGVyKHNldHRpbmc6IElTZXR0aW5nKTogU2V0dGluZ0xldmVsW10ge1xuICAgIC8vIFNldHRpbmdzIHdoaWNoIHN1cHBvcnQgb25seSBhIHNpbmdsZSBzZXR0aW5nIGxldmVsIGFyZSBpbmhlcmVudGx5IG9yZGVyZWRcbiAgICBpZiAoc2V0dGluZy5zdXBwb3J0ZWRMZXZlbHNBcmVPcmRlcmVkIHx8IHNldHRpbmcuc3VwcG9ydGVkTGV2ZWxzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAvLyByZXR1cm4gYSBjb3B5IHRvIHByZXZlbnQgY2FsbGVycyBmcm9tIG1vZGlmeWluZyB0aGUgYXJyYXlcbiAgICAgICAgcmV0dXJuIFsuLi5zZXR0aW5nLnN1cHBvcnRlZExldmVsc107XG4gICAgfVxuICAgIHJldHVybiBMRVZFTF9PUkRFUjtcbn1cblxuZXhwb3J0IHR5cGUgQ2FsbGJhY2tGbiA9IChcbiAgICBzZXR0aW5nTmFtZTogc3RyaW5nLFxuICAgIHJvb21JZDogc3RyaW5nLFxuICAgIGF0TGV2ZWw6IFNldHRpbmdMZXZlbCxcbiAgICBuZXdWYWxBdExldmVsOiBhbnksXG4gICAgbmV3VmFsOiBhbnksXG4pID0+IHZvaWQ7XG5cbmludGVyZmFjZSBJSGFuZGxlck1hcCB7XG4gICAgLy8gQHRzLWlnbm9yZSAtIFRTIHdhbnRzIHRoaXMgdG8gYmUgYSBzdHJpbmcga2V5IGJ1dCB3ZSBrbm93IGJldHRlclxuICAgIFtsZXZlbDogU2V0dGluZ0xldmVsXTogU2V0dGluZ3NIYW5kbGVyO1xufVxuXG4vKipcbiAqIENvbnRyb2xzIGFuZCBtYW5hZ2VzIGFwcGxpY2F0aW9uIHNldHRpbmdzIGJ5IHByb3ZpZGluZyB2YXJ5aW5nIGxldmVscyBhdCB3aGljaCB0aGVcbiAqIHNldHRpbmcgdmFsdWUgbWF5IGJlIHNwZWNpZmllZC4gVGhlIGxldmVscyBhcmUgdGhlbiB1c2VkIHRvIGRldGVybWluZSB3aGF0IHRoZSBzZXR0aW5nXG4gKiB2YWx1ZSBzaG91bGQgYmUgZ2l2ZW4gYSBzZXQgb2YgY2lyY3Vtc3RhbmNlcy4gVGhlIGxldmVscywgaW4gcHJpb3JpdHkgb3JkZXIsIGFyZTpcbiAqIC0gU2V0dGluZ0xldmVsLkRFVklDRSAgICAgICAgIC0gVmFsdWVzIGFyZSBkZXRlcm1pbmVkIGJ5IHRoZSBjdXJyZW50IGRldmljZVxuICogLSBTZXR0aW5nTGV2ZWwuUk9PTV9ERVZJQ0UgICAgLSBWYWx1ZXMgYXJlIGRldGVybWluZWQgYnkgdGhlIGN1cnJlbnQgZGV2aWNlIGZvciBhIHBhcnRpY3VsYXIgcm9vbVxuICogLSBTZXR0aW5nTGV2ZWwuUk9PTV9BQ0NPVU5UICAgLSBWYWx1ZXMgYXJlIGRldGVybWluZWQgYnkgdGhlIGN1cnJlbnQgYWNjb3VudCBmb3IgYSBwYXJ0aWN1bGFyIHJvb21cbiAqIC0gU2V0dGluZ0xldmVsLkFDQ09VTlQgICAgICAgIC0gVmFsdWVzIGFyZSBkZXRlcm1pbmVkIGJ5IHRoZSBjdXJyZW50IGFjY291bnRcbiAqIC0gU2V0dGluZ0xldmVsLlJPT00gICAgICAgICAgIC0gVmFsdWVzIGFyZSBkZXRlcm1pbmVkIGJ5IGEgcGFydGljdWxhciByb29tIChieSB0aGUgcm9vbSBhZG1pbnMpXG4gKiAtIFNldHRpbmdMZXZlbC5DT05GSUcgICAgICAgICAtIFZhbHVlcyBhcmUgZGV0ZXJtaW5lZCBieSB0aGUgY29uZmlnLmpzb25cbiAqIC0gU2V0dGluZ0xldmVsLkRFRkFVTFQgICAgICAgIC0gVmFsdWVzIGFyZSBkZXRlcm1pbmVkIGJ5IHRoZSBoYXJkY29kZWQgZGVmYXVsdHNcbiAqXG4gKiBFYWNoIGxldmVsIGhhcyBhIGRpZmZlcmVudCBtZXRob2QgdG8gc3RvcmluZyB0aGUgc2V0dGluZyB2YWx1ZS4gRm9yIGltcGxlbWVudGF0aW9uXG4gKiBzcGVjaWZpYyBkZXRhaWxzLCBwbGVhc2Ugc2VlIHRoZSBoYW5kbGVycy4gVGhlIFwiY29uZmlnXCIgYW5kIFwiZGVmYXVsdFwiIGxldmVscyBhcmVcbiAqIGJvdGggYWx3YXlzIHN1cHBvcnRlZCBvbiBhbGwgcGxhdGZvcm1zLiBBbGwgb3RoZXIgc2V0dGluZ3Mgc2hvdWxkIGJlIGd1YXJkZWQgYnlcbiAqIGlzTGV2ZWxTdXBwb3J0ZWQoKSBwcmlvciB0byBhdHRlbXB0aW5nIHRvIHNldCB0aGUgdmFsdWUuXG4gKlxuICogU2V0dGluZ3MgY2FuIGFsc28gcmVwcmVzZW50IGZlYXR1cmVzLiBGZWF0dXJlcyBhcmUgc2lnbmlmaWNhbnQgcG9ydGlvbnMgb2YgdGhlXG4gKiBhcHBsaWNhdGlvbiB0aGF0IHdhcnJhbnQgYSBkZWRpY2F0ZWQgc2V0dGluZyB0byB0b2dnbGUgdGhlbSBvbiBvciBvZmYuIEZlYXR1cmVzIGFyZVxuICogc3BlY2lhbC1jYXNlZCB0byBlbnN1cmUgdGhhdCB0aGVpciB2YWx1ZXMgcmVzcGVjdCB0aGUgY29uZmlndXJhdGlvbiAoZm9yIGV4YW1wbGUsIGFcbiAqIGZlYXR1cmUgbWF5IGJlIHJlcG9ydGVkIGFzIGRpc2FibGVkIGV2ZW4gdGhvdWdoIGEgdXNlciBoYXMgc3BlY2lmaWNhbGx5IHJlcXVlc3RlZCBpdFxuICogYmUgZW5hYmxlZCkuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNldHRpbmdzU3RvcmUge1xuICAgIC8vIFdlIHN1cHBvcnQgd2F0Y2hpbmcgc2V0dGluZ3MgZm9yIGNoYW5nZXMsIGFuZCBkbyB0aGlzIGJ5IHRyYWNraW5nIHdoaWNoIGNhbGxiYWNrcyBoYXZlXG4gICAgLy8gYmVlbiBnaXZlbiB0byB1cy4gV2UgZW5kIHVwIHJldHVybmluZyB0aGUgY2FsbGJhY2tSZWYgdG8gdGhlIGNhbGxlciBzbyB0aGV5IGNhbiB1bnN1YnNjcmliZVxuICAgIC8vIGF0IGEgbGF0ZXIgcG9pbnQuXG4gICAgLy9cbiAgICAvLyBXZSBhbHNvIG1haW50YWluIGEgbGlzdCBvZiBtb25pdG9ycyB3aGljaCBhcmUgc3BlY2lhbCB3YXRjaGVyczogdGhleSBjYXVzZSBkaXNwYXRjaGVzXG4gICAgLy8gd2hlbiB0aGUgc2V0dGluZyBjaGFuZ2VzLiBXZSB0cmFjayB3aGljaCByb29tcyB3ZSdyZSBtb25pdG9yaW5nIHRob3VnaCB0byBlbnN1cmUgd2VcbiAgICAvLyBkb24ndCBkdXBsaWNhdGUgdXBkYXRlcyBvbiB0aGUgYnVzLlxuICAgIHByaXZhdGUgc3RhdGljIHdhdGNoZXJzID0gbmV3IE1hcDxzdHJpbmcsIFdhdGNoQ2FsbGJhY2tGbj4oKTtcbiAgICBwcml2YXRlIHN0YXRpYyBtb25pdG9ycyA9IG5ldyBNYXA8c3RyaW5nLCBNYXA8c3RyaW5nLCBzdHJpbmc+PigpOyAvLyB7IHNldHRpbmdOYW1lID0+IHsgcm9vbUlkID0+IGNhbGxiYWNrUmVmIH0gfVxuXG4gICAgLy8gQ291bnRlciB1c2VkIGZvciBnZW5lcmF0aW9uIG9mIHdhdGNoZXIgSURzXG4gICAgcHJpdmF0ZSBzdGF0aWMgd2F0Y2hlckNvdW50ID0gMTtcblxuICAgIC8qKlxuICAgICAqIEdldHMgYWxsIHRoZSBmZWF0dXJlLXN0eWxlIHNldHRpbmcgbmFtZXMuXG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfSBUaGUgbmFtZXMgb2YgdGhlIGZlYXR1cmUgc2V0dGluZ3MuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBnZXRGZWF0dXJlU2V0dGluZ05hbWVzKCk6IHN0cmluZ1tdIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKFNFVFRJTkdTKS5maWx0ZXIobiA9PiBTZXR0aW5nc1N0b3JlLmlzRmVhdHVyZShuKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV2F0Y2hlcyBmb3IgY2hhbmdlcyBpbiBhIHBhcnRpY3VsYXIgc2V0dGluZy4gVGhpcyBpcyBkb25lIHdpdGhvdXQgYW55IGxvY2FsIGVjaG9cbiAgICAgKiB3cmFwcGluZyBhbmQgZmlyZXMgd2hlbmV2ZXIgYSBjaGFuZ2UgaXMgZGV0ZWN0ZWQgaW4gYSBzZXR0aW5nJ3MgdmFsdWUsIGF0IGFueSBsZXZlbC5cbiAgICAgKiBXYXRjaGluZyBpcyBpbnRlbmRlZCB0byBiZSB1c2VkIGluIHNjZW5hcmlvcyB3aGVyZSB0aGUgYXBwIG5lZWRzIHRvIHJlYWN0IHRvIGNoYW5nZXNcbiAgICAgKiBtYWRlIGJ5IG90aGVyIGRldmljZXMuIEl0IGlzIG90aGVyd2lzZSBleHBlY3RlZCB0aGF0IGNhbGxlcnMgd2lsbCBiZSBhYmxlIHRvIHVzZSB0aGVcbiAgICAgKiBDb250cm9sbGVyIHN5c3RlbSBvciB0cmFjayB0aGVpciBvd24gY2hhbmdlcyB0byBzZXR0aW5ncy4gQ2FsbGVycyBzaG91bGQgcmV0YWluIHRoZVxuICAgICAqIHJldHVybmVkIHJlZmVyZW5jZSB0byBsYXRlciB1bnN1YnNjcmliZSBmcm9tIHVwZGF0ZXMuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNldHRpbmdOYW1lIFRoZSBzZXR0aW5nIG5hbWUgdG8gd2F0Y2hcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gcm9vbUlkIFRoZSByb29tIElEIHRvIHdhdGNoIGZvciBjaGFuZ2VzIGluLiBNYXkgYmUgbnVsbCBmb3IgJ2FsbCcuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2tGbiBBIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIGEgc2V0dGluZyBjaGFuZ2UgaXNcbiAgICAgKiBkZXRlY3RlZC4gRml2ZSBhcmd1bWVudHMgY2FuIGJlIGV4cGVjdGVkOiB0aGUgc2V0dGluZyBuYW1lLCB0aGUgcm9vbSBJRCAobWF5IGJlIG51bGwpLFxuICAgICAqIHRoZSBsZXZlbCB0aGUgY2hhbmdlIGhhcHBlbmVkIGF0LCB0aGUgbmV3IHZhbHVlIGF0IHRoZSBnaXZlbiBsZXZlbCwgYW5kIGZpbmFsbHkgdGhlIG5ld1xuICAgICAqIHZhbHVlIGZvciB0aGUgc2V0dGluZyByZWdhcmRsZXNzIG9mIGxldmVsLiBUaGUgY2FsbGJhY2sgaXMgcmVzcG9uc2libGUgZm9yIGRldGVybWluaW5nXG4gICAgICogaWYgdGhlIGNoYW5nZSBpbiB2YWx1ZSBpcyB3b3J0aHdoaWxlIGVub3VnaCB0byByZWFjdCB1cG9uLlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IEEgcmVmZXJlbmNlIHRvIHRoZSB3YXRjaGVyIHRoYXQgd2FzIGVtcGxveWVkLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgd2F0Y2hTZXR0aW5nKHNldHRpbmdOYW1lOiBzdHJpbmcsIHJvb21JZDogc3RyaW5nIHwgbnVsbCwgY2FsbGJhY2tGbjogQ2FsbGJhY2tGbik6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IHNldHRpbmcgPSBTRVRUSU5HU1tzZXR0aW5nTmFtZV07XG4gICAgICAgIGNvbnN0IG9yaWdpbmFsU2V0dGluZ05hbWUgPSBzZXR0aW5nTmFtZTtcbiAgICAgICAgaWYgKCFzZXR0aW5nKSB0aHJvdyBuZXcgRXJyb3IoYCR7c2V0dGluZ05hbWV9IGlzIG5vdCBhIHNldHRpbmdgKTtcblxuICAgICAgICBpZiAoc2V0dGluZy5pbnZlcnRlZFNldHRpbmdOYW1lKSB7XG4gICAgICAgICAgICBzZXR0aW5nTmFtZSA9IHNldHRpbmcuaW52ZXJ0ZWRTZXR0aW5nTmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHdhdGNoZXJJZCA9IGAke25ldyBEYXRlKCkuZ2V0VGltZSgpfV8ke1NldHRpbmdzU3RvcmUud2F0Y2hlckNvdW50Kyt9XyR7c2V0dGluZ05hbWV9XyR7cm9vbUlkfWA7XG5cbiAgICAgICAgY29uc3QgbG9jYWxpemVkQ2FsbGJhY2sgPSAoY2hhbmdlZEluUm9vbUlkOiBzdHJpbmcgfCBudWxsLCBhdExldmVsOiBTZXR0aW5nTGV2ZWwsIG5ld1ZhbEF0TGV2ZWw6IGFueSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFTZXR0aW5nc1N0b3JlLmRvZXNTZXR0aW5nU3VwcG9ydExldmVsKG9yaWdpbmFsU2V0dGluZ05hbWUsIGF0TGV2ZWwpKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLndhcm4oXG4gICAgICAgICAgICAgICAgICAgIGBTZXR0aW5nIGhhbmRsZXIgbm90aWZpZWQgZm9yIGFuIHVwZGF0ZSBvZiBhbiBpbnZhbGlkIHNldHRpbmcgbGV2ZWw6IGAgK1xuICAgICAgICAgICAgICAgICAgICBgJHtvcmlnaW5hbFNldHRpbmdOYW1lfUAke2F0TGV2ZWx9IC0gdGhpcyBsaWtlbHkgbWVhbnMgYSB3ZWlyZCBzZXR0aW5nIHZhbHVlIGAgK1xuICAgICAgICAgICAgICAgICAgICBgbWFkZSBpdCBpbnRvIHRoZSBsZXZlbCdzIHN0b3JhZ2UuIFRoZSBub3RpZmljYXRpb24gd2lsbCBiZSBpZ25vcmVkLmAsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBuZXdWYWx1ZSA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUob3JpZ2luYWxTZXR0aW5nTmFtZSk7XG4gICAgICAgICAgICBjb25zdCBuZXdWYWx1ZUF0TGV2ZWwgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlQXQoYXRMZXZlbCwgb3JpZ2luYWxTZXR0aW5nTmFtZSkgPz8gbmV3VmFsQXRMZXZlbDtcbiAgICAgICAgICAgIGNhbGxiYWNrRm4ob3JpZ2luYWxTZXR0aW5nTmFtZSwgY2hhbmdlZEluUm9vbUlkLCBhdExldmVsLCBuZXdWYWx1ZUF0TGV2ZWwsIG5ld1ZhbHVlKTtcbiAgICAgICAgfTtcblxuICAgICAgICBTZXR0aW5nc1N0b3JlLndhdGNoZXJzLnNldCh3YXRjaGVySWQsIGxvY2FsaXplZENhbGxiYWNrKTtcbiAgICAgICAgZGVmYXVsdFdhdGNoTWFuYWdlci53YXRjaFNldHRpbmcoc2V0dGluZ05hbWUsIHJvb21JZCwgbG9jYWxpemVkQ2FsbGJhY2spO1xuXG4gICAgICAgIHJldHVybiB3YXRjaGVySWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3RvcHMgdGhlIFNldHRpbmdzU3RvcmUgZnJvbSB3YXRjaGluZyBhIHNldHRpbmcuIFRoaXMgaXMgYSBuby1vcCBpZiB0aGUgd2F0Y2hlclxuICAgICAqIHByb3ZpZGVkIGlzIG5vdCBmb3VuZC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gd2F0Y2hlclJlZmVyZW5jZSBUaGUgd2F0Y2hlciByZWZlcmVuY2UgKHJlY2VpdmVkIGZyb20gI3dhdGNoU2V0dGluZylcbiAgICAgKiB0byBjYW5jZWwuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyB1bndhdGNoU2V0dGluZyh3YXRjaGVyUmVmZXJlbmNlOiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKCFTZXR0aW5nc1N0b3JlLndhdGNoZXJzLmhhcyh3YXRjaGVyUmVmZXJlbmNlKSkge1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oYEVuZGluZyBub24tZXhpc3RlbnQgd2F0Y2hlciBJRCAke3dhdGNoZXJSZWZlcmVuY2V9YCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBkZWZhdWx0V2F0Y2hNYW5hZ2VyLnVud2F0Y2hTZXR0aW5nKFNldHRpbmdzU3RvcmUud2F0Y2hlcnMuZ2V0KHdhdGNoZXJSZWZlcmVuY2UpKTtcbiAgICAgICAgU2V0dGluZ3NTdG9yZS53YXRjaGVycy5kZWxldGUod2F0Y2hlclJlZmVyZW5jZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2V0cyB1cCBhIG1vbml0b3IgZm9yIGEgc2V0dGluZy4gVGhpcyBiZWhhdmVzIHNpbWlsYXIgdG8gI3dhdGNoU2V0dGluZyBleGNlcHQgaW5zdGVhZFxuICAgICAqIG9mIG1ha2luZyBhIGNhbGwgdG8gYSBjYWxsYmFjaywgaXQgZm9yd2FyZHMgYWxsIGNoYW5nZXMgdG8gdGhlIGRpc3BhdGNoZXIuIENhbGxlcnMgY2FuXG4gICAgICogZXhwZWN0IHRvIGxpc3RlbiBmb3IgdGhlICdzZXR0aW5nX3VwZGF0ZWQnIGFjdGlvbiB3aXRoIGFuIG9iamVjdCBjb250YWluaW5nIHNldHRpbmdOYW1lLFxuICAgICAqIHJvb21JZCwgbGV2ZWwsIG5ld1ZhbHVlQXRMZXZlbCwgYW5kIG5ld1ZhbHVlLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzZXR0aW5nTmFtZSBUaGUgc2V0dGluZyBuYW1lIHRvIG1vbml0b3IuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHJvb21JZCBUaGUgcm9vbSBJRCB0byBtb25pdG9yIGZvciBjaGFuZ2VzIGluLiBVc2UgbnVsbCBmb3IgYWxsIHJvb21zLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgbW9uaXRvclNldHRpbmcoc2V0dGluZ05hbWU6IHN0cmluZywgcm9vbUlkOiBzdHJpbmcgfCBudWxsKSB7XG4gICAgICAgIHJvb21JZCA9IHJvb21JZCB8fCBudWxsOyAvLyB0aGUgdGhpbmcgd2FudHMgbnVsbCBzcGVjaWZpY2FsbHkgdG8gd29yaywgc28gYXBwZWFzZSBpdC5cblxuICAgICAgICBpZiAoIXRoaXMubW9uaXRvcnMuaGFzKHNldHRpbmdOYW1lKSkgdGhpcy5tb25pdG9ycy5zZXQoc2V0dGluZ05hbWUsIG5ldyBNYXAoKSk7XG5cbiAgICAgICAgY29uc3QgcmVnaXN0ZXJXYXRjaGVyID0gKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5tb25pdG9ycy5nZXQoc2V0dGluZ05hbWUpLnNldChyb29tSWQsIFNldHRpbmdzU3RvcmUud2F0Y2hTZXR0aW5nKFxuICAgICAgICAgICAgICAgIHNldHRpbmdOYW1lLCByb29tSWQsIChzZXR0aW5nTmFtZSwgaW5Sb29tSWQsIGxldmVsLCBuZXdWYWx1ZUF0TGV2ZWwsIG5ld1ZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaDxTZXR0aW5nVXBkYXRlZFBheWxvYWQ+KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlNldHRpbmdVcGRhdGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ05hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICByb29tSWQ6IGluUm9vbUlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGV2ZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZUF0TGV2ZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdWYWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICkpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHJvb21zID0gQXJyYXkuZnJvbSh0aGlzLm1vbml0b3JzLmdldChzZXR0aW5nTmFtZSkua2V5cygpKTtcbiAgICAgICAgY29uc3QgaGFzUm9vbSA9IHJvb21zLmZpbmQoKHIpID0+IHIgPT09IHJvb21JZCB8fCByID09PSBudWxsKTtcbiAgICAgICAgaWYgKCFoYXNSb29tKSB7XG4gICAgICAgICAgICByZWdpc3RlcldhdGNoZXIoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChyb29tSWQgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAvLyBVbnJlZ2lzdGVyIGFsbCBleGlzdGluZyB3YXRjaGVycyBhbmQgcmVnaXN0ZXIgdGhlIG5ldyBvbmVcbiAgICAgICAgICAgICAgICByb29tcy5mb3JFYWNoKHJvb21JZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIFNldHRpbmdzU3RvcmUudW53YXRjaFNldHRpbmcodGhpcy5tb25pdG9ycy5nZXQoc2V0dGluZ05hbWUpLmdldChyb29tSWQpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLm1vbml0b3JzLmdldChzZXR0aW5nTmFtZSkuY2xlYXIoKTtcbiAgICAgICAgICAgICAgICByZWdpc3RlcldhdGNoZXIoKTtcbiAgICAgICAgICAgIH0gLy8gZWxzZSBhIHdhdGNoZXIgaXMgYWxyZWFkeSByZWdpc3RlcmVkIGZvciB0aGUgcm9vbSwgc28gZG9uJ3QgYm90aGVyIHJlZ2lzdGVyaW5nIGl0IGFnYWluXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSB0cmFuc2xhdGVkIGRpc3BsYXkgbmFtZSBmb3IgYSBnaXZlbiBzZXR0aW5nXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNldHRpbmdOYW1lIFRoZSBzZXR0aW5nIHRvIGxvb2sgdXAuXG4gICAgICogQHBhcmFtIHtTZXR0aW5nTGV2ZWx9IGF0TGV2ZWxcbiAgICAgKiBUaGUgbGV2ZWwgdG8gZ2V0IHRoZSBkaXNwbGF5IG5hbWUgZm9yOyBEZWZhdWx0cyB0byAnZGVmYXVsdCcuXG4gICAgICogQHJldHVybiB7U3RyaW5nfSBUaGUgZGlzcGxheSBuYW1lIGZvciB0aGUgc2V0dGluZywgb3IgbnVsbCBpZiBub3QgZm91bmQuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBnZXREaXNwbGF5TmFtZShzZXR0aW5nTmFtZTogc3RyaW5nLCBhdExldmVsID0gU2V0dGluZ0xldmVsLkRFRkFVTFQpIHtcbiAgICAgICAgaWYgKCFTRVRUSU5HU1tzZXR0aW5nTmFtZV0gfHwgIVNFVFRJTkdTW3NldHRpbmdOYW1lXS5kaXNwbGF5TmFtZSkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgbGV0IGRpc3BsYXlOYW1lID0gU0VUVElOR1Nbc2V0dGluZ05hbWVdLmRpc3BsYXlOYW1lO1xuICAgICAgICBpZiAoZGlzcGxheU5hbWUgaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgICAgIGlmIChkaXNwbGF5TmFtZVthdExldmVsXSkgZGlzcGxheU5hbWUgPSBkaXNwbGF5TmFtZVthdExldmVsXTtcbiAgICAgICAgICAgIGVsc2UgZGlzcGxheU5hbWUgPSBkaXNwbGF5TmFtZVtcImRlZmF1bHRcIl07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gX3QoZGlzcGxheU5hbWUgYXMgc3RyaW5nKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSB0cmFuc2xhdGVkIGRlc2NyaXB0aW9uIGZvciBhIGdpdmVuIHNldHRpbmdcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2V0dGluZ05hbWUgVGhlIHNldHRpbmcgdG8gbG9vayB1cC5cbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9IFRoZSBkZXNjcmlwdGlvbiBmb3IgdGhlIHNldHRpbmcsIG9yIG51bGwgaWYgbm90IGZvdW5kLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZ2V0RGVzY3JpcHRpb24oc2V0dGluZ05hbWU6IHN0cmluZyk6IHN0cmluZyB8IFJlYWN0Tm9kZSB7XG4gICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gU0VUVElOR1Nbc2V0dGluZ05hbWVdPy5kZXNjcmlwdGlvbjtcbiAgICAgICAgaWYgKCFkZXNjcmlwdGlvbikgcmV0dXJuIG51bGw7XG4gICAgICAgIGlmICh0eXBlb2YgZGVzY3JpcHRpb24gIT09ICdzdHJpbmcnKSByZXR1cm4gZGVzY3JpcHRpb24oKTtcbiAgICAgICAgcmV0dXJuIF90KGRlc2NyaXB0aW9uKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGlmIGEgc2V0dGluZyBpcyBhbHNvIGEgZmVhdHVyZS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2V0dGluZ05hbWUgVGhlIHNldHRpbmcgdG8gbG9vayB1cC5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHRoZSBzZXR0aW5nIGlzIGEgZmVhdHVyZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGlzRmVhdHVyZShzZXR0aW5nTmFtZTogc3RyaW5nKSB7XG4gICAgICAgIGlmICghU0VUVElOR1Nbc2V0dGluZ05hbWVdKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiBTRVRUSU5HU1tzZXR0aW5nTmFtZV0uaXNGZWF0dXJlO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0QmV0YUluZm8oc2V0dGluZ05hbWU6IHN0cmluZyk6IElTZXR0aW5nW1wiYmV0YUluZm9cIl0ge1xuICAgICAgICAvLyBjb25zaWRlciBhIGJldGEgZGlzYWJsZWQgaWYgdGhlIGNvbmZpZyBpcyBleHBsaWNpdGx5IHNldCB0byBmYWxzZSwgaW4gd2hpY2ggY2FzZSB0cmVhdCBhcyBub3JtYWwgTGFicyBmbGFnXG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmlzRmVhdHVyZShzZXR0aW5nTmFtZSlcbiAgICAgICAgICAgICYmIFNldHRpbmdzU3RvcmUuZ2V0VmFsdWVBdChTZXR0aW5nTGV2ZWwuQ09ORklHLCBzZXR0aW5nTmFtZSwgbnVsbCwgdHJ1ZSwgdHJ1ZSkgIT09IGZhbHNlXG4gICAgICAgICkge1xuICAgICAgICAgICAgcmV0dXJuIFNFVFRJTkdTW3NldHRpbmdOYW1lXT8uYmV0YUluZm87XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldExhYkdyb3VwKHNldHRpbmdOYW1lOiBzdHJpbmcpOiBMYWJHcm91cCB7XG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmlzRmVhdHVyZShzZXR0aW5nTmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybiAoPElGZWF0dXJlPlNFVFRJTkdTW3NldHRpbmdOYW1lXSkubGFic0dyb3VwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBpZiBhIHNldHRpbmcgaXMgZW5hYmxlZC5cbiAgICAgKiBJZiBhIHNldHRpbmcgaXMgZGlzYWJsZWQgdGhlbiBpdCBzaG91bGQgYmUgaGlkZGVuIGZyb20gdGhlIHVzZXIuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNldHRpbmdOYW1lIFRoZSBzZXR0aW5nIHRvIGxvb2sgdXAuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgc2V0dGluZyBpcyBlbmFibGVkLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgaXNFbmFibGVkKHNldHRpbmdOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCFTRVRUSU5HU1tzZXR0aW5nTmFtZV0pIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIFNFVFRJTkdTW3NldHRpbmdOYW1lXS5jb250cm9sbGVyID8gIVNFVFRJTkdTW3NldHRpbmdOYW1lXS5jb250cm9sbGVyLnNldHRpbmdEaXNhYmxlZCA6IHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgdmFsdWUgb2YgYSBzZXR0aW5nLiBUaGUgcm9vbSBJRCBpcyBvcHRpb25hbCBpZiB0aGUgc2V0dGluZyBpcyBub3QgdG9cbiAgICAgKiBiZSBhcHBsaWVkIHRvIGFueSBwYXJ0aWN1bGFyIHJvb20sIG90aGVyd2lzZSBpdCBzaG91bGQgYmUgc3VwcGxpZWQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNldHRpbmdOYW1lIFRoZSBuYW1lIG9mIHRoZSBzZXR0aW5nIHRvIHJlYWQgdGhlIHZhbHVlIG9mLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSByb29tSWQgVGhlIHJvb20gSUQgdG8gcmVhZCB0aGUgc2V0dGluZyB2YWx1ZSBpbiwgbWF5IGJlIG51bGwuXG4gICAgICogQHBhcmFtIHtib29sZWFufSBleGNsdWRlRGVmYXVsdCBUcnVlIHRvIGRpc2FibGUgdXNpbmcgdGhlIGRlZmF1bHQgdmFsdWUuXG4gICAgICogQHJldHVybiB7Kn0gVGhlIHZhbHVlLCBvciBudWxsIGlmIG5vdCBmb3VuZFxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZ2V0VmFsdWU8VCA9IGFueT4oc2V0dGluZ05hbWU6IHN0cmluZywgcm9vbUlkOiBzdHJpbmcgPSBudWxsLCBleGNsdWRlRGVmYXVsdCA9IGZhbHNlKTogVCB7XG4gICAgICAgIC8vIFZlcmlmeSB0aGF0IHRoZSBzZXR0aW5nIGlzIGFjdHVhbGx5IGEgc2V0dGluZ1xuICAgICAgICBpZiAoIVNFVFRJTkdTW3NldHRpbmdOYW1lXSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2V0dGluZyAnXCIgKyBzZXR0aW5nTmFtZSArIFwiJyBkb2VzIG5vdCBhcHBlYXIgdG8gYmUgYSBzZXR0aW5nLlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNldHRpbmcgPSBTRVRUSU5HU1tzZXR0aW5nTmFtZV07XG4gICAgICAgIGNvbnN0IGxldmVsT3JkZXIgPSBnZXRMZXZlbE9yZGVyKHNldHRpbmcpO1xuXG4gICAgICAgIHJldHVybiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlQXQobGV2ZWxPcmRlclswXSwgc2V0dGluZ05hbWUsIHJvb21JZCwgZmFsc2UsIGV4Y2x1ZGVEZWZhdWx0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIGEgc2V0dGluZydzIHZhbHVlIGF0IGEgcGFydGljdWxhciBsZXZlbCwgaWdub3JpbmcgYWxsIGxldmVscyB0aGF0IGFyZSBtb3JlIHNwZWNpZmljLlxuICAgICAqIEBwYXJhbSB7U2V0dGluZ0xldmVsfFwiY29uZmlnXCJ8XCJkZWZhdWx0XCJ9IGxldmVsIFRoZVxuICAgICAqIGxldmVsIHRvIGxvb2sgYXQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNldHRpbmdOYW1lIFRoZSBuYW1lIG9mIHRoZSBzZXR0aW5nIHRvIHJlYWQuXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHJvb21JZCBUaGUgcm9vbSBJRCB0byByZWFkIHRoZSBzZXR0aW5nIHZhbHVlIGluLCBtYXkgYmUgbnVsbC5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGV4cGxpY2l0IElmIHRydWUsIHRoaXMgbWV0aG9kIHdpbGwgbm90IGNvbnNpZGVyIG90aGVyIGxldmVscywganVzdCB0aGUgb25lXG4gICAgICogcHJvdmlkZWQuIERlZmF1bHRzIHRvIGZhbHNlLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gZXhjbHVkZURlZmF1bHQgVHJ1ZSB0byBkaXNhYmxlIHVzaW5nIHRoZSBkZWZhdWx0IHZhbHVlLlxuICAgICAqIEByZXR1cm4geyp9IFRoZSB2YWx1ZSwgb3IgbnVsbCBpZiBub3QgZm91bmQuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBnZXRWYWx1ZUF0KFxuICAgICAgICBsZXZlbDogU2V0dGluZ0xldmVsLFxuICAgICAgICBzZXR0aW5nTmFtZTogc3RyaW5nLFxuICAgICAgICByb29tSWQ6IHN0cmluZyA9IG51bGwsXG4gICAgICAgIGV4cGxpY2l0ID0gZmFsc2UsXG4gICAgICAgIGV4Y2x1ZGVEZWZhdWx0ID0gZmFsc2UsXG4gICAgKTogYW55IHtcbiAgICAgICAgLy8gVmVyaWZ5IHRoYXQgdGhlIHNldHRpbmcgaXMgYWN0dWFsbHkgYSBzZXR0aW5nXG4gICAgICAgIGNvbnN0IHNldHRpbmcgPSBTRVRUSU5HU1tzZXR0aW5nTmFtZV07XG4gICAgICAgIGlmICghc2V0dGluZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2V0dGluZyAnXCIgKyBzZXR0aW5nTmFtZSArIFwiJyBkb2VzIG5vdCBhcHBlYXIgdG8gYmUgYSBzZXR0aW5nLlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGxldmVsT3JkZXIgPSBnZXRMZXZlbE9yZGVyKHNldHRpbmcpO1xuICAgICAgICBpZiAoIWxldmVsT3JkZXIuaW5jbHVkZXMoU2V0dGluZ0xldmVsLkRFRkFVTFQpKSBsZXZlbE9yZGVyLnB1c2goU2V0dGluZ0xldmVsLkRFRkFVTFQpOyAvLyBhbHdheXMgaW5jbHVkZSBkZWZhdWx0XG5cbiAgICAgICAgY29uc3QgbWluSW5kZXggPSBsZXZlbE9yZGVyLmluZGV4T2YobGV2ZWwpO1xuICAgICAgICBpZiAobWluSW5kZXggPT09IC0xKSB0aHJvdyBuZXcgRXJyb3IoYExldmVsIFwiJHtsZXZlbH1cIiBmb3Igc2V0dGluZyBcIiR7c2V0dGluZ05hbWV9XCIgaXMgbm90IHByaW9yaXRpemVkYCk7XG5cbiAgICAgICAgY29uc3QgaGFuZGxlcnMgPSBTZXR0aW5nc1N0b3JlLmdldEhhbmRsZXJzKHNldHRpbmdOYW1lKTtcblxuICAgICAgICAvLyBDaGVjayBpZiB3ZSBuZWVkIHRvIGludmVydCB0aGUgc2V0dGluZyBhdCBhbGwuIERvIHRoaXMgYWZ0ZXIgd2UgZ2V0IHRoZSBzZXR0aW5nXG4gICAgICAgIC8vIGhhbmRsZXJzIHRob3VnaCwgb3RoZXJ3aXNlIHdlJ2xsIGZhaWwgdG8gcmVhZCB0aGUgdmFsdWUuXG4gICAgICAgIGlmIChzZXR0aW5nLmludmVydGVkU2V0dGluZ05hbWUpIHtcbiAgICAgICAgICAgIC8vY29uc29sZS53YXJuKGBJbnZlcnRpbmcgJHtzZXR0aW5nTmFtZX0gdG8gYmUgJHtzZXR0aW5nLmludmVydGVkU2V0dGluZ05hbWV9IC0gbGVnYWN5IHNldHRpbmdgKTtcbiAgICAgICAgICAgIHNldHRpbmdOYW1lID0gc2V0dGluZy5pbnZlcnRlZFNldHRpbmdOYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV4cGxpY2l0KSB7XG4gICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gaGFuZGxlcnNbbGV2ZWxdO1xuICAgICAgICAgICAgaWYgKCFoYW5kbGVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFNldHRpbmdzU3RvcmUuZ2V0RmluYWxWYWx1ZShzZXR0aW5nLCBsZXZlbCwgcm9vbUlkLCBudWxsLCBudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gaGFuZGxlci5nZXRWYWx1ZShzZXR0aW5nTmFtZSwgcm9vbUlkKTtcbiAgICAgICAgICAgIHJldHVybiBTZXR0aW5nc1N0b3JlLmdldEZpbmFsVmFsdWUoc2V0dGluZywgbGV2ZWwsIHJvb21JZCwgdmFsdWUsIGxldmVsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGkgPSBtaW5JbmRleDsgaSA8IGxldmVsT3JkZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSBoYW5kbGVyc1tsZXZlbE9yZGVyW2ldXTtcbiAgICAgICAgICAgIGlmICghaGFuZGxlcikgY29udGludWU7XG4gICAgICAgICAgICBpZiAoZXhjbHVkZURlZmF1bHQgJiYgbGV2ZWxPcmRlcltpXSA9PT0gXCJkZWZhdWx0XCIpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGhhbmRsZXIuZ2V0VmFsdWUoc2V0dGluZ05hbWUsIHJvb21JZCk7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCkgY29udGludWU7XG4gICAgICAgICAgICByZXR1cm4gU2V0dGluZ3NTdG9yZS5nZXRGaW5hbFZhbHVlKHNldHRpbmcsIGxldmVsLCByb29tSWQsIHZhbHVlLCBsZXZlbE9yZGVyW2ldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBTZXR0aW5nc1N0b3JlLmdldEZpbmFsVmFsdWUoc2V0dGluZywgbGV2ZWwsIHJvb21JZCwgbnVsbCwgbnVsbCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgZGVmYXVsdCB2YWx1ZSBvZiBhIHNldHRpbmcuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNldHRpbmdOYW1lIFRoZSBuYW1lIG9mIHRoZSBzZXR0aW5nIHRvIHJlYWQgdGhlIHZhbHVlIG9mLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSByb29tSWQgVGhlIHJvb20gSUQgdG8gcmVhZCB0aGUgc2V0dGluZyB2YWx1ZSBpbiwgbWF5IGJlIG51bGwuXG4gICAgICogQHJldHVybiB7Kn0gVGhlIGRlZmF1bHQgdmFsdWVcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGdldERlZmF1bHRWYWx1ZShzZXR0aW5nTmFtZTogc3RyaW5nKTogYW55IHtcbiAgICAgICAgLy8gVmVyaWZ5IHRoYXQgdGhlIHNldHRpbmcgaXMgYWN0dWFsbHkgYSBzZXR0aW5nXG4gICAgICAgIGlmICghU0VUVElOR1Nbc2V0dGluZ05hbWVdKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZXR0aW5nICdcIiArIHNldHRpbmdOYW1lICsgXCInIGRvZXMgbm90IGFwcGVhciB0byBiZSBhIHNldHRpbmcuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFNFVFRJTkdTW3NldHRpbmdOYW1lXS5kZWZhdWx0O1xuICAgIH1cblxuICAgIHByaXZhdGUgc3RhdGljIGdldEZpbmFsVmFsdWUoXG4gICAgICAgIHNldHRpbmc6IElTZXR0aW5nLFxuICAgICAgICBsZXZlbDogU2V0dGluZ0xldmVsLFxuICAgICAgICByb29tSWQ6IHN0cmluZyxcbiAgICAgICAgY2FsY3VsYXRlZFZhbHVlOiBhbnksXG4gICAgICAgIGNhbGN1bGF0ZWRBdExldmVsOiBTZXR0aW5nTGV2ZWwsXG4gICAgKTogYW55IHtcbiAgICAgICAgbGV0IHJlc3VsdGluZ1ZhbHVlID0gY2FsY3VsYXRlZFZhbHVlO1xuXG4gICAgICAgIGlmIChzZXR0aW5nLmNvbnRyb2xsZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IGFjdHVhbFZhbHVlID0gc2V0dGluZy5jb250cm9sbGVyLmdldFZhbHVlT3ZlcnJpZGUobGV2ZWwsIHJvb21JZCwgY2FsY3VsYXRlZFZhbHVlLCBjYWxjdWxhdGVkQXRMZXZlbCk7XG4gICAgICAgICAgICBpZiAoYWN0dWFsVmFsdWUgIT09IHVuZGVmaW5lZCAmJiBhY3R1YWxWYWx1ZSAhPT0gbnVsbCkgcmVzdWx0aW5nVmFsdWUgPSBhY3R1YWxWYWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZXR0aW5nLmludmVydGVkU2V0dGluZ05hbWUpIHJlc3VsdGluZ1ZhbHVlID0gIXJlc3VsdGluZ1ZhbHVlO1xuICAgICAgICByZXR1cm4gcmVzdWx0aW5nVmFsdWU7XG4gICAgfVxuXG4gICAgLyogZXNsaW50LWRpc2FibGUgdmFsaWQtanNkb2MgKi8gLy9odHRwczovL2dpdGh1Yi5jb20vZXNsaW50L2VzbGludC9pc3N1ZXMvNzMwN1xuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIHZhbHVlIGZvciBhIHNldHRpbmcuIFRoZSByb29tIElEIGlzIG9wdGlvbmFsIGlmIHRoZSBzZXR0aW5nIGlzIG5vdCBiZWluZ1xuICAgICAqIHNldCBmb3IgYSBwYXJ0aWN1bGFyIHJvb20sIG90aGVyd2lzZSBpdCBzaG91bGQgYmUgc3VwcGxpZWQuIFRoZSB2YWx1ZSBtYXkgYmUgbnVsbFxuICAgICAqIHRvIGluZGljYXRlIHRoYXQgdGhlIGxldmVsIHNob3VsZCBubyBsb25nZXIgaGF2ZSBhbiBvdmVycmlkZS5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2V0dGluZ05hbWUgVGhlIG5hbWUgb2YgdGhlIHNldHRpbmcgdG8gY2hhbmdlLlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSByb29tSWQgVGhlIHJvb20gSUQgdG8gY2hhbmdlIHRoZSB2YWx1ZSBpbiwgbWF5IGJlIG51bGwuXG4gICAgICogQHBhcmFtIHtTZXR0aW5nTGV2ZWx9IGxldmVsIFRoZSBsZXZlbFxuICAgICAqIHRvIGNoYW5nZSB0aGUgdmFsdWUgYXQuXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgbmV3IHZhbHVlIG9mIHRoZSBzZXR0aW5nLCBtYXkgYmUgbnVsbC5cbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlfSBSZXNvbHZlcyB3aGVuIHRoZSBzZXR0aW5nIGhhcyBiZWVuIGNoYW5nZWQuXG4gICAgICovXG5cbiAgICAvKiBlc2xpbnQtZW5hYmxlIHZhbGlkLWpzZG9jICovXG4gICAgcHVibGljIHN0YXRpYyBhc3luYyBzZXRWYWx1ZShcbiAgICAgICAgc2V0dGluZ05hbWU6IHN0cmluZyxcbiAgICAgICAgcm9vbUlkOiBzdHJpbmcgfCBudWxsLFxuICAgICAgICBsZXZlbDogU2V0dGluZ0xldmVsLFxuICAgICAgICB2YWx1ZTogYW55LFxuICAgICk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICAvLyBWZXJpZnkgdGhhdCB0aGUgc2V0dGluZyBpcyBhY3R1YWxseSBhIHNldHRpbmdcbiAgICAgICAgY29uc3Qgc2V0dGluZyA9IFNFVFRJTkdTW3NldHRpbmdOYW1lXTtcbiAgICAgICAgaWYgKCFzZXR0aW5nKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZXR0aW5nICdcIiArIHNldHRpbmdOYW1lICsgXCInIGRvZXMgbm90IGFwcGVhciB0byBiZSBhIHNldHRpbmcuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaGFuZGxlciA9IFNldHRpbmdzU3RvcmUuZ2V0SGFuZGxlcihzZXR0aW5nTmFtZSwgbGV2ZWwpO1xuICAgICAgICBpZiAoIWhhbmRsZXIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNldHRpbmcgXCIgKyBzZXR0aW5nTmFtZSArIFwiIGRvZXMgbm90IGhhdmUgYSBoYW5kbGVyIGZvciBcIiArIGxldmVsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZXR0aW5nLmludmVydGVkU2V0dGluZ05hbWUpIHtcbiAgICAgICAgICAgIC8vIE5vdGU6IFdlIGNhbid0IGRvIHRoaXMgd2hlbiB0aGUgYGxldmVsYCBpcyBcImRlZmF1bHRcIiwgaG93ZXZlciB3ZSBhbHNvXG4gICAgICAgICAgICAvLyBrbm93IHRoYXQgdGhlIHVzZXIgY2FuJ3QgcG9zc2libGUgY2hhbmdlIHRoZSBkZWZhdWx0IHZhbHVlIHRocm91Z2ggdGhpc1xuICAgICAgICAgICAgLy8gZnVuY3Rpb24gc28gd2UgZG9uJ3QgYm90aGVyIGNoZWNraW5nIGl0LlxuICAgICAgICAgICAgLy9jb25zb2xlLndhcm4oYEludmVydGluZyAke3NldHRpbmdOYW1lfSB0byBiZSAke3NldHRpbmcuaW52ZXJ0ZWRTZXR0aW5nTmFtZX0gLSBsZWdhY3kgc2V0dGluZ2ApO1xuICAgICAgICAgICAgc2V0dGluZ05hbWUgPSBzZXR0aW5nLmludmVydGVkU2V0dGluZ05hbWU7XG4gICAgICAgICAgICB2YWx1ZSA9ICF2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghaGFuZGxlci5jYW5TZXRWYWx1ZShzZXR0aW5nTmFtZSwgcm9vbUlkKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVXNlciBjYW5ub3Qgc2V0IFwiICsgc2V0dGluZ05hbWUgKyBcIiBhdCBcIiArIGxldmVsICsgXCIgaW4gXCIgKyByb29tSWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNldHRpbmcuY29udHJvbGxlciAmJiAhKGF3YWl0IHNldHRpbmcuY29udHJvbGxlci5iZWZvcmVDaGFuZ2UobGV2ZWwsIHJvb21JZCwgdmFsdWUpKSkge1xuICAgICAgICAgICAgcmV0dXJuOyAvLyBjb250cm9sbGVyIHNheXMgbm9cbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IGhhbmRsZXIuc2V0VmFsdWUoc2V0dGluZ05hbWUsIHJvb21JZCwgdmFsdWUpO1xuXG4gICAgICAgIHNldHRpbmcuY29udHJvbGxlcj8ub25DaGFuZ2UobGV2ZWwsIHJvb21JZCwgdmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgaWYgdGhlIGN1cnJlbnQgdXNlciBpcyBwZXJtaXR0ZWQgdG8gc2V0IHRoZSBnaXZlbiBzZXR0aW5nIGF0IHRoZSBnaXZlblxuICAgICAqIGxldmVsIGZvciBhIHBhcnRpY3VsYXIgcm9vbS4gVGhlIHJvb20gSUQgaXMgb3B0aW9uYWwgaWYgdGhlIHNldHRpbmcgaXMgbm90IGJlaW5nXG4gICAgICogc2V0IGZvciBhIHBhcnRpY3VsYXIgcm9vbSwgb3RoZXJ3aXNlIGl0IHNob3VsZCBiZSBzdXBwbGllZC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2V0dGluZ05hbWUgVGhlIG5hbWUgb2YgdGhlIHNldHRpbmcgdG8gY2hlY2suXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHJvb21JZCBUaGUgcm9vbSBJRCB0byBjaGVjayBpbiwgbWF5IGJlIG51bGwuXG4gICAgICogQHBhcmFtIHtTZXR0aW5nTGV2ZWx9IGxldmVsIFRoZSBsZXZlbCB0b1xuICAgICAqIGNoZWNrIGF0LlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgdGhlIHVzZXIgbWF5IHNldCB0aGUgc2V0dGluZywgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgY2FuU2V0VmFsdWUoc2V0dGluZ05hbWU6IHN0cmluZywgcm9vbUlkOiBzdHJpbmcsIGxldmVsOiBTZXR0aW5nTGV2ZWwpOiBib29sZWFuIHtcbiAgICAgICAgLy8gVmVyaWZ5IHRoYXQgdGhlIHNldHRpbmcgaXMgYWN0dWFsbHkgYSBzZXR0aW5nXG4gICAgICAgIGlmICghU0VUVElOR1Nbc2V0dGluZ05hbWVdKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZXR0aW5nICdcIiArIHNldHRpbmdOYW1lICsgXCInIGRvZXMgbm90IGFwcGVhciB0byBiZSBhIHNldHRpbmcuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFTZXR0aW5nc1N0b3JlLmlzRW5hYmxlZChzZXR0aW5nTmFtZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdoZW4gbm9uLWJldGEgZmVhdHVyZXMgYXJlIHNwZWNpZmllZCBpbiB0aGUgY29uZmlnLmpzb24sIHdlIGZvcmNlIHRoZW0gYXMgZW5hYmxlZCBvciBkaXNhYmxlZC5cbiAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuaXNGZWF0dXJlKHNldHRpbmdOYW1lKSAmJiAhU0VUVElOR1Nbc2V0dGluZ05hbWVdPy5iZXRhSW5mbykge1xuICAgICAgICAgICAgY29uc3QgY29uZmlnVmFsID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZUF0KFNldHRpbmdMZXZlbC5DT05GSUcsIHNldHRpbmdOYW1lLCByb29tSWQsIHRydWUsIHRydWUpO1xuICAgICAgICAgICAgaWYgKGNvbmZpZ1ZhbCA9PT0gdHJ1ZSB8fCBjb25maWdWYWwgPT09IGZhbHNlKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBoYW5kbGVyID0gU2V0dGluZ3NTdG9yZS5nZXRIYW5kbGVyKHNldHRpbmdOYW1lLCBsZXZlbCk7XG4gICAgICAgIGlmICghaGFuZGxlcikgcmV0dXJuIGZhbHNlO1xuICAgICAgICByZXR1cm4gaGFuZGxlci5jYW5TZXRWYWx1ZShzZXR0aW5nTmFtZSwgcm9vbUlkKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIGlmIHRoZSBnaXZlbiBsZXZlbCBpcyBzdXBwb3J0ZWQgb24gdGhpcyBkZXZpY2UuXG4gICAgICogQHBhcmFtIHtTZXR0aW5nTGV2ZWx9IGxldmVsIFRoZSBsZXZlbFxuICAgICAqIHRvIGNoZWNrIHRoZSBmZWFzaWJpbGl0eSBvZi5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHRoZSBsZXZlbCBpcyBzdXBwb3J0ZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGlzTGV2ZWxTdXBwb3J0ZWQobGV2ZWw6IFNldHRpbmdMZXZlbCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIUxFVkVMX0hBTkRMRVJTW2xldmVsXSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICByZXR1cm4gTEVWRUxfSEFORExFUlNbbGV2ZWxdLmlzU3VwcG9ydGVkKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyBpZiBhIHNldHRpbmcgc3VwcG9ydHMgYSBwYXJ0aWN1bGFyIGxldmVsLlxuICAgICAqIEBwYXJhbSBzZXR0aW5nTmFtZSBUaGUgc2V0dGluZyBuYW1lLlxuICAgICAqIEBwYXJhbSBsZXZlbCBUaGUgbGV2ZWwuXG4gICAgICogQHJldHVybnMgVHJ1ZSBpZiBzdXBwb3J0ZWQsIGZhbHNlIG90aGVyd2lzZS4gTm90ZSB0aGF0IHRoaXMgd2lsbCBub3QgY2hlY2sgdG8gc2VlIGlmXG4gICAgICogdGhlIGxldmVsIGl0c2VsZiBjYW4gYmUgc3VwcG9ydGVkIGJ5IHRoZSBydW50aW1lIChpZTogeW91IHdpbGwgbmVlZCB0byBjYWxsICNpc0xldmVsU3VwcG9ydGVkKClcbiAgICAgKiBvbiB5b3VyIG93bikuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBkb2VzU2V0dGluZ1N1cHBvcnRMZXZlbChzZXR0aW5nTmFtZTogc3RyaW5nLCBsZXZlbDogU2V0dGluZ0xldmVsKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IHNldHRpbmcgPSBTRVRUSU5HU1tzZXR0aW5nTmFtZV07XG4gICAgICAgIGlmICghc2V0dGluZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2V0dGluZyAnXCIgKyBzZXR0aW5nTmFtZSArIFwiJyBkb2VzIG5vdCBhcHBlYXIgdG8gYmUgYSBzZXR0aW5nLlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBsZXZlbCA9PT0gU2V0dGluZ0xldmVsLkRFRkFVTFQgfHwgKHNldHRpbmcuc3VwcG9ydGVkTGV2ZWxzLmluY2x1ZGVzKGxldmVsKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyB0aGUgZmlyc3Qgc3VwcG9ydGVkIGxldmVsIG91dCBvZiBhbGwgdGhlIGxldmVscyB0aGF0IGNhbiBiZSB1c2VkIGZvciBhXG4gICAgICogc3BlY2lmaWMgc2V0dGluZy5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2V0dGluZ05hbWUgVGhlIHNldHRpbmcgbmFtZS5cbiAgICAgKiBAcmV0dXJuIHtTZXR0aW5nTGV2ZWx9XG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBmaXJzdFN1cHBvcnRlZExldmVsKHNldHRpbmdOYW1lOiBzdHJpbmcpOiBTZXR0aW5nTGV2ZWwge1xuICAgICAgICAvLyBWZXJpZnkgdGhhdCB0aGUgc2V0dGluZyBpcyBhY3R1YWxseSBhIHNldHRpbmdcbiAgICAgICAgY29uc3Qgc2V0dGluZyA9IFNFVFRJTkdTW3NldHRpbmdOYW1lXTtcbiAgICAgICAgaWYgKCFzZXR0aW5nKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTZXR0aW5nICdcIiArIHNldHRpbmdOYW1lICsgXCInIGRvZXMgbm90IGFwcGVhciB0byBiZSBhIHNldHRpbmcuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbGV2ZWxPcmRlciA9IGdldExldmVsT3JkZXIoc2V0dGluZyk7XG4gICAgICAgIGlmICghbGV2ZWxPcmRlci5pbmNsdWRlcyhTZXR0aW5nTGV2ZWwuREVGQVVMVCkpIGxldmVsT3JkZXIucHVzaChTZXR0aW5nTGV2ZWwuREVGQVVMVCk7IC8vIGFsd2F5cyBpbmNsdWRlIGRlZmF1bHRcblxuICAgICAgICBjb25zdCBoYW5kbGVycyA9IFNldHRpbmdzU3RvcmUuZ2V0SGFuZGxlcnMoc2V0dGluZ05hbWUpO1xuXG4gICAgICAgIGZvciAoY29uc3QgbGV2ZWwgb2YgbGV2ZWxPcmRlcikge1xuICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IGhhbmRsZXJzW2xldmVsXTtcbiAgICAgICAgICAgIGlmICghaGFuZGxlcikgY29udGludWU7XG4gICAgICAgICAgICByZXR1cm4gbGV2ZWw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVucyBvciBxdWV1ZXMgYW55IHNldHRpbmcgbWlncmF0aW9ucyBuZWVkZWQuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBydW5NaWdyYXRpb25zKCk6IHZvaWQge1xuICAgICAgICAvLyBEZXYgbm90ZXM6IHRvIGFkZCB5b3VyIG1pZ3JhdGlvbiwganVzdCBhZGQgYSBuZXcgYG1pZ3JhdGVNeUZlYXR1cmVgIGZ1bmN0aW9uLCBjYWxsIGl0LCBhbmRcbiAgICAgICAgLy8gYWRkIGEgY29tbWVudCB0byBub3RlIHdoZW4gaXQgY2FuIGJlIHJlbW92ZWQuXG5cbiAgICAgICAgU2V0dGluZ3NTdG9yZS5taWdyYXRlSGlkZGVuUmVhZFJlY2VpcHRzKCk7IC8vIENhbiBiZSByZW1vdmVkIGFmdGVyIE9jdG9iZXIgMjAyMi5cbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBtaWdyYXRlSGlkZGVuUmVhZFJlY2VpcHRzKCk6IHZvaWQge1xuICAgICAgICBpZiAoTWF0cml4Q2xpZW50UGVnLmdldCgpLmlzR3Vlc3QoKSkgcmV0dXJuOyAvLyBub3Qgd29ydGggaXRcblxuICAgICAgICAvLyBXZSB3YWl0IGZvciB0aGUgZmlyc3Qgc3luYyB0byBlbnN1cmUgdGhhdCB0aGUgdXNlcidzIGV4aXN0aW5nIGFjY291bnQgZGF0YSBoYXMgbG9hZGVkLCBhcyBvdGhlcndpc2VcbiAgICAgICAgLy8gZ2V0VmFsdWUoKSBmb3IgYW4gYWNjb3VudC1sZXZlbCBzZXR0aW5nIGxpa2Ugc2VuZFJlYWRSZWNlaXB0cyB3aWxsIHJldHVybiBgbnVsbGAuXG4gICAgICAgIGNvbnN0IGRpc1JlZiA9IGRpc3BhdGNoZXIucmVnaXN0ZXIoKHBheWxvYWQ6IEFjdGlvblBheWxvYWQpID0+IHtcbiAgICAgICAgICAgIGlmIChwYXlsb2FkLmFjdGlvbiA9PT0gXCJNYXRyaXhBY3Rpb25zLnN5bmNcIikge1xuICAgICAgICAgICAgICAgIGRpc3BhdGNoZXIudW5yZWdpc3RlcihkaXNSZWYpO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgcnJWYWwgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwic2VuZFJlYWRSZWNlaXB0c1wiLCBudWxsLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJyVmFsICE9PSBcImJvb2xlYW5cIikge1xuICAgICAgICAgICAgICAgICAgICAvLyBuZXcgc2V0dGluZyBpc24ndCBzZXQgLSBzZWUgaWYgdGhlIGxhYnMgZmxhZyB3YXMuIFdlIGhhdmUgdG8gbWFudWFsbHkgcmVhY2ggaW50byB0aGVcbiAgICAgICAgICAgICAgICAgICAgLy8gaGFuZGxlciBmb3IgdGhpcyBiZWNhdXNlIGl0IGlzbid0IGEgc2V0dGluZyBhbnltb3JlIChgZ2V0VmFsdWVgIHdpbGwgeWVsbCBhdCB1cykuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSBMRVZFTF9IQU5ETEVSU1tTZXR0aW5nTGV2ZWwuREVWSUNFXSBhcyBEZXZpY2VTZXR0aW5nc0hhbmRsZXI7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxhYnNWYWwgPSBoYW5kbGVyLnJlYWRGZWF0dXJlKFwiZmVhdHVyZV9oaWRkZW5fcmVhZF9yZWNlaXB0c1wiKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBsYWJzVmFsID09PSBcImJvb2xlYW5cIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW52ZXJzZSBvZiBsYWJzIGZsYWcgYmVjYXVzZSBuZWdhdGl2ZS0+cG9zaXRpdmUgbGFuZ3VhZ2Ugc3dpdGNoIGluIHNldHRpbmcgbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3VmFsID0gIWxhYnNWYWw7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgU2V0dGluZyBzZW5kUmVhZFJlY2VpcHRzIHRvICR7bmV3VmFsfSBiZWNhdXNlIG9mIHByZXZpb3VzbHktc2V0IGxhYnMgZmxhZ2ApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBub2luc3BlY3Rpb24gSlNJZ25vcmVkUHJvbWlzZUZyb21DYWxsXG4gICAgICAgICAgICAgICAgICAgICAgICBTZXR0aW5nc1N0b3JlLnNldFZhbHVlKFwic2VuZFJlYWRSZWNlaXB0c1wiLCBudWxsLCBTZXR0aW5nTGV2ZWwuQUNDT1VOVCwgbmV3VmFsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGVidWdnaW5nIGZ1bmN0aW9uIGZvciByZWFkaW5nIGV4cGxpY2l0IHNldHRpbmcgdmFsdWVzIHdpdGhvdXQgZ29pbmcgdGhyb3VnaCB0aGVcbiAgICAgKiBjb21wbGljYXRlZC9iaWFzZWQgZnVuY3Rpb25zIGluIHRoZSBTZXR0aW5nc1N0b3JlLiBUaGlzIHdpbGwgcHJpbnQgaW5mb3JtYXRpb24gdG9cbiAgICAgKiB0aGUgY29uc29sZSBmb3IgYW5hbHlzaXMuIE5vdCBpbnRlbmRlZCB0byBiZSB1c2VkIHdpdGhpbiB0aGUgYXBwbGljYXRpb24uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHJlYWxTZXR0aW5nTmFtZSBUaGUgc2V0dGluZyBuYW1lIHRvIHRyeSBhbmQgcmVhZC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcm9vbUlkIE9wdGlvbmFsIHJvb20gSUQgdG8gdGVzdCB0aGUgc2V0dGluZyBpbi5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGRlYnVnU2V0dGluZyhyZWFsU2V0dGluZ05hbWU6IHN0cmluZywgcm9vbUlkOiBzdHJpbmcpIHtcbiAgICAgICAgbG9nZ2VyLmxvZyhgLS0tIERFQlVHICR7cmVhbFNldHRpbmdOYW1lfWApO1xuXG4gICAgICAgIC8vIE5vdGU6IHdlIGludGVudGlvbmFsbHkgdXNlIEpTT04uc3RyaW5naWZ5IGhlcmUgdG8gYXZvaWQgdGhlIGNvbnNvbGUgbWFza2luZyB0aGVcbiAgICAgICAgLy8gcHJvYmxlbSBpZiB0aGVyZSdzIGEgdHlwZSByZXByZXNlbnRhdGlvbiBpc3N1ZS4gQWxzbywgdGhpcyB3YXkgaXQgaXMgZ3VhcmFudGVlZFxuICAgICAgICAvLyB0byBzaG93IHVwIGluIGEgcmFnZXNoYWtlIGlmIHJlcXVpcmVkLlxuXG4gICAgICAgIGNvbnN0IGRlZiA9IFNFVFRJTkdTW3JlYWxTZXR0aW5nTmFtZV07XG4gICAgICAgIGxvZ2dlci5sb2coYC0tLSBkZWZpbml0aW9uOiAke2RlZiA/IEpTT04uc3RyaW5naWZ5KGRlZikgOiAnPE5PVF9GT1VORD4nfWApO1xuICAgICAgICBsb2dnZXIubG9nKGAtLS0gZGVmYXVsdCBsZXZlbCBvcmRlcjogJHtKU09OLnN0cmluZ2lmeShMRVZFTF9PUkRFUil9YCk7XG4gICAgICAgIGxvZ2dlci5sb2coYC0tLSByZWdpc3RlcmVkIGhhbmRsZXJzOiAke0pTT04uc3RyaW5naWZ5KE9iamVjdC5rZXlzKExFVkVMX0hBTkRMRVJTKSl9YCk7XG5cbiAgICAgICAgY29uc3QgZG9DaGVja3MgPSAoc2V0dGluZ05hbWUpID0+IHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgaGFuZGxlck5hbWUgb2YgT2JqZWN0LmtleXMoTEVWRUxfSEFORExFUlMpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaGFuZGxlciA9IExFVkVMX0hBTkRMRVJTW2hhbmRsZXJOYW1lXTtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gaGFuZGxlci5nZXRWYWx1ZShzZXR0aW5nTmFtZSwgcm9vbUlkKTtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmxvZyhgLS0tICAgICAke2hhbmRsZXJOYW1lfUAke3Jvb21JZCB8fCAnPG5vX3Jvb20+J30gPSAke0pTT04uc3RyaW5naWZ5KHZhbHVlKX1gKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5sb2coYC0tLSAgICAgJHtoYW5kbGVyfUAke3Jvb21JZCB8fCAnPG5vX3Jvb20+J30gVEhSRVcgRVJST1I6ICR7ZS5tZXNzYWdlfWApO1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHJvb21JZCkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBoYW5kbGVyLmdldFZhbHVlKHNldHRpbmdOYW1lLCBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5sb2coYC0tLSAgICAgJHtoYW5kbGVyTmFtZX1APG5vX3Jvb20+ID0gJHtKU09OLnN0cmluZ2lmeSh2YWx1ZSl9YCk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5sb2coYC0tLSAgICAgJHtoYW5kbGVyfUA8bm9fcm9vbT4gVEhSRVcgRVJST1I6ICR7ZS5tZXNzYWdlfWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsb2dnZXIubG9nKGAtLS0gY2FsY3VsYXRpbmcgYXMgcmV0dXJuZWQgYnkgU2V0dGluZ3NTdG9yZWApO1xuICAgICAgICAgICAgbG9nZ2VyLmxvZyhgLS0tIHRoZXNlIG1pZ2h0IG5vdCBtYXRjaCBpZiB0aGUgc2V0dGluZyB1c2VzIGEgY29udHJvbGxlciAtIGJlIHdhcm5lZCFgKTtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoc2V0dGluZ05hbWUsIHJvb21JZCk7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmxvZyhgLS0tICAgICBTZXR0aW5nc1N0b3JlI2dlbmVyaWNAJHtyb29tSWQgfHwgJzxub19yb29tPid9ICA9ICR7SlNPTi5zdHJpbmdpZnkodmFsdWUpfWApO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5sb2coYC0tLSAgICAgU2V0dGluZ3NTdG9yZSNnZW5lcmljQCR7cm9vbUlkIHx8ICc8bm9fcm9vbT4nfSBUSFJFVyBFUlJPUjogJHtlLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocm9vbUlkKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKHNldHRpbmdOYW1lLCBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmxvZyhgLS0tICAgICBTZXR0aW5nc1N0b3JlI2dlbmVyaWNAPG5vX3Jvb20+ICA9ICR7SlNPTi5zdHJpbmdpZnkodmFsdWUpfWApO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmxvZyhgLS0tICAgICBTZXR0aW5nc1N0b3JlI2dlbmVyaWNAJDxub19yb29tPiBUSFJFVyBFUlJPUjogJHtlLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgbGV2ZWwgb2YgTEVWRUxfT1JERVIpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWVBdChsZXZlbCwgc2V0dGluZ05hbWUsIHJvb21JZCk7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5sb2coYC0tLSAgICAgU2V0dGluZ3NTdG9yZSMke2xldmVsfUAke3Jvb21JZCB8fCAnPG5vX3Jvb20+J30gPSAke0pTT04uc3RyaW5naWZ5KHZhbHVlKX1gKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5sb2coYC0tLSAgICAgU2V0dGluZ3NTdG9yZSMke2xldmVsfUAke3Jvb21JZCB8fCAnPG5vX3Jvb20+J30gVEhSRVcgRVJST1I6ICR7ZS5tZXNzYWdlfWApO1xuICAgICAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHJvb21JZCkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlQXQobGV2ZWwsIHNldHRpbmdOYW1lLCBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2dlci5sb2coYC0tLSAgICAgU2V0dGluZ3NTdG9yZSMke2xldmVsfUA8bm9fcm9vbT4gPSAke0pTT04uc3RyaW5naWZ5KHZhbHVlKX1gKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmxvZyhgLS0tICAgICBTZXR0aW5nc1N0b3JlIyR7bGV2ZWx9QCQ8bm9fcm9vbT4gVEhSRVcgRVJST1I6ICR7ZS5tZXNzYWdlfWApO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGRvQ2hlY2tzKHJlYWxTZXR0aW5nTmFtZSk7XG5cbiAgICAgICAgaWYgKGRlZi5pbnZlcnRlZFNldHRpbmdOYW1lKSB7XG4gICAgICAgICAgICBsb2dnZXIubG9nKGAtLS0gVEVTVElORyBJTlZFUlRFRCBTRVRUSU5HIE5BTUVgKTtcbiAgICAgICAgICAgIGxvZ2dlci5sb2coYC0tLSBpbnZlcnRlZDogJHtkZWYuaW52ZXJ0ZWRTZXR0aW5nTmFtZX1gKTtcbiAgICAgICAgICAgIGRvQ2hlY2tzKGRlZi5pbnZlcnRlZFNldHRpbmdOYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvZ2dlci5sb2coYC0tLSBFTkQgREVCVUdgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0YXRpYyBnZXRIYW5kbGVyKHNldHRpbmdOYW1lOiBzdHJpbmcsIGxldmVsOiBTZXR0aW5nTGV2ZWwpOiBTZXR0aW5nc0hhbmRsZXIge1xuICAgICAgICBjb25zdCBoYW5kbGVycyA9IFNldHRpbmdzU3RvcmUuZ2V0SGFuZGxlcnMoc2V0dGluZ05hbWUpO1xuICAgICAgICBpZiAoIWhhbmRsZXJzW2xldmVsXSkgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiBoYW5kbGVyc1tsZXZlbF07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2V0SGFuZGxlcnMoc2V0dGluZ05hbWU6IHN0cmluZyk6IElIYW5kbGVyTWFwIHtcbiAgICAgICAgaWYgKCFTRVRUSU5HU1tzZXR0aW5nTmFtZV0pIHJldHVybiB7fTtcblxuICAgICAgICBjb25zdCBoYW5kbGVycyA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IGxldmVsIG9mIFNFVFRJTkdTW3NldHRpbmdOYW1lXS5zdXBwb3J0ZWRMZXZlbHMpIHtcbiAgICAgICAgICAgIGlmICghTEVWRUxfSEFORExFUlNbbGV2ZWxdKSB0aHJvdyBuZXcgRXJyb3IoXCJVbmV4cGVjdGVkIGxldmVsIFwiICsgbGV2ZWwpO1xuICAgICAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuaXNMZXZlbFN1cHBvcnRlZChsZXZlbCkpIGhhbmRsZXJzW2xldmVsXSA9IExFVkVMX0hBTkRMRVJTW2xldmVsXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFsd2F5cyBzdXBwb3J0ICdkZWZhdWx0J1xuICAgICAgICBpZiAoIWhhbmRsZXJzWydkZWZhdWx0J10pIGhhbmRsZXJzWydkZWZhdWx0J10gPSBMRVZFTF9IQU5ETEVSU1snZGVmYXVsdCddO1xuXG4gICAgICAgIHJldHVybiBoYW5kbGVycztcbiAgICB9XG59XG5cbi8vIEZvciBkZWJ1Z2dpbmcgcHVycG9zZXNcbndpbmRvdy5teFNldHRpbmdzU3RvcmUgPSBTZXR0aW5nc1N0b3JlO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWlCQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFHQTs7QUF2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUEwQkEsTUFBTUEsbUJBQW1CLEdBQUcsSUFBSUMsMEJBQUosRUFBNUIsQyxDQUVBOztBQUNBLE1BQU1DLGVBQWUsR0FBRyxFQUF4QjtBQUNBLE1BQU1DLHVCQUF1QixHQUFHLEVBQWhDO0FBQ0EsTUFBTUMsWUFBWSxHQUFHLEVBQXJCOztBQUNBLEtBQUssTUFBTUMsR0FBWCxJQUFrQkMsTUFBTSxDQUFDQyxJQUFQLENBQVlDLGtCQUFaLENBQWxCLEVBQXlDO0VBQ3JDTixlQUFlLENBQUNHLEdBQUQsQ0FBZixHQUF1Qkcsa0JBQUEsQ0FBU0gsR0FBVCxFQUFjSSxPQUFyQztFQUNBLElBQUlELGtCQUFBLENBQVNILEdBQVQsRUFBY0ssU0FBbEIsRUFBNkJOLFlBQVksQ0FBQ08sSUFBYixDQUFrQk4sR0FBbEI7O0VBQzdCLElBQUlHLGtCQUFBLENBQVNILEdBQVQsRUFBY08sbUJBQWxCLEVBQXVDO0lBQ25DO0lBQ0E7SUFDQVQsdUJBQXVCLENBQUNLLGtCQUFBLENBQVNILEdBQVQsRUFBY08sbUJBQWYsQ0FBdkIsR0FBNkQsQ0FBQ0osa0JBQUEsQ0FBU0gsR0FBVCxFQUFjSSxPQUE1RTtFQUNIO0FBQ0osQyxD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