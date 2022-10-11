import { ReactNode } from "react";
import { ISetting, LabGroup } from "./Settings";
import { SettingLevel } from "./SettingLevel";
export declare const LEVEL_ORDER: SettingLevel[];
export declare type CallbackFn = (settingName: string, roomId: string, atLevel: SettingLevel, newValAtLevel: any, newVal: any) => void;
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
export default class SettingsStore {
    private static watchers;
    private static monitors;
    private static watcherCount;
    /**
     * Gets all the feature-style setting names.
     * @returns {string[]} The names of the feature settings.
     */
    static getFeatureSettingNames(): string[];
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
    static watchSetting(settingName: string, roomId: string | null, callbackFn: CallbackFn): string;
    /**
     * Stops the SettingsStore from watching a setting. This is a no-op if the watcher
     * provided is not found.
     * @param {string} watcherReference The watcher reference (received from #watchSetting)
     * to cancel.
     */
    static unwatchSetting(watcherReference: string): void;
    /**
     * Sets up a monitor for a setting. This behaves similar to #watchSetting except instead
     * of making a call to a callback, it forwards all changes to the dispatcher. Callers can
     * expect to listen for the 'setting_updated' action with an object containing settingName,
     * roomId, level, newValueAtLevel, and newValue.
     * @param {string} settingName The setting name to monitor.
     * @param {String} roomId The room ID to monitor for changes in. Use null for all rooms.
     */
    static monitorSetting(settingName: string, roomId: string | null): void;
    /**
     * Gets the translated display name for a given setting
     * @param {string} settingName The setting to look up.
     * @param {SettingLevel} atLevel
     * The level to get the display name for; Defaults to 'default'.
     * @return {String} The display name for the setting, or null if not found.
     */
    static getDisplayName(settingName: string, atLevel?: SettingLevel): string;
    /**
     * Gets the translated description for a given setting
     * @param {string} settingName The setting to look up.
     * @return {String} The description for the setting, or null if not found.
     */
    static getDescription(settingName: string): string | ReactNode;
    /**
     * Determines if a setting is also a feature.
     * @param {string} settingName The setting to look up.
     * @return {boolean} True if the setting is a feature.
     */
    static isFeature(settingName: string): boolean;
    static getBetaInfo(settingName: string): ISetting["betaInfo"];
    static getLabGroup(settingName: string): LabGroup;
    /**
     * Determines if a setting is enabled.
     * If a setting is disabled then it should be hidden from the user.
     * @param {string} settingName The setting to look up.
     * @return {boolean} True if the setting is enabled.
     */
    static isEnabled(settingName: string): boolean;
    /**
     * Gets the value of a setting. The room ID is optional if the setting is not to
     * be applied to any particular room, otherwise it should be supplied.
     * @param {string} settingName The name of the setting to read the value of.
     * @param {String} roomId The room ID to read the setting value in, may be null.
     * @param {boolean} excludeDefault True to disable using the default value.
     * @return {*} The value, or null if not found
     */
    static getValue<T = any>(settingName: string, roomId?: string, excludeDefault?: boolean): T;
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
    static getValueAt(level: SettingLevel, settingName: string, roomId?: string, explicit?: boolean, excludeDefault?: boolean): any;
    /**
     * Gets the default value of a setting.
     * @param {string} settingName The name of the setting to read the value of.
     * @param {String} roomId The room ID to read the setting value in, may be null.
     * @return {*} The default value
     */
    static getDefaultValue(settingName: string): any;
    private static getFinalValue;
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
    static setValue(settingName: string, roomId: string | null, level: SettingLevel, value: any): Promise<void>;
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
    static canSetValue(settingName: string, roomId: string, level: SettingLevel): boolean;
    /**
     * Determines if the given level is supported on this device.
     * @param {SettingLevel} level The level
     * to check the feasibility of.
     * @return {boolean} True if the level is supported, false otherwise.
     */
    static isLevelSupported(level: SettingLevel): boolean;
    /**
     * Determines if a setting supports a particular level.
     * @param settingName The setting name.
     * @param level The level.
     * @returns True if supported, false otherwise. Note that this will not check to see if
     * the level itself can be supported by the runtime (ie: you will need to call #isLevelSupported()
     * on your own).
     */
    static doesSettingSupportLevel(settingName: string, level: SettingLevel): boolean;
    /**
     * Determines the first supported level out of all the levels that can be used for a
     * specific setting.
     * @param {string} settingName The setting name.
     * @return {SettingLevel}
     */
    static firstSupportedLevel(settingName: string): SettingLevel;
    /**
     * Runs or queues any setting migrations needed.
     */
    static runMigrations(): void;
    private static migrateHiddenReadReceipts;
    /**
     * Debugging function for reading explicit setting values without going through the
     * complicated/biased functions in the SettingsStore. This will print information to
     * the console for analysis. Not intended to be used within the application.
     * @param {string} realSettingName The setting name to try and read.
     * @param {string} roomId Optional room ID to test the setting in.
     */
    static debugSetting(realSettingName: string, roomId: string): void;
    private static getHandler;
    private static getHandlers;
}
