import { SettingLevel } from "../SettingLevel";
/**
 * Represents a controller for individual settings to alter the reading behaviour
 * based upon environmental conditions, or to react to changes and therefore update
 * the working environment.
 *
 * This is not intended to replace the functionality of a SettingsHandler, it is only
 * intended to handle environmental factors for specific settings.
 */
export default abstract class SettingController {
    /**
     * Gets the overridden value for the setting, if any. This must return null if the
     * value is not to be overridden, otherwise it must return the new value.
     * @param {string} level The level at which the value was requested at.
     * @param {String} roomId The room ID, may be null.
     * @param {*} calculatedValue The value that the handlers think the setting should be,
     * may be null.
     * @param {SettingLevel} calculatedAtLevel The level for which the calculated value was
     * calculated at. May be null.
     * @return {*} The value that should be used, or null if no override is applicable.
     */
    getValueOverride(level: SettingLevel, roomId: string, calculatedValue: any, calculatedAtLevel: SettingLevel): any;
    /**
     * Called before the setting value has been changed, can abort the change.
     * @param {string} level The level at which the setting has been modified.
     * @param {String} roomId The room ID, may be null.
     * @param {*} newValue The new value for the setting, may be null.
     * @return {boolean} Whether the settings change should be accepted.
     */
    beforeChange(level: SettingLevel, roomId: string, newValue: any): Promise<boolean>;
    /**
     * Called when the setting value has been changed.
     * @param {string} level The level at which the setting has been modified.
     * @param {String} roomId The room ID, may be null.
     * @param {*} newValue The new value for the setting, may be null.
     */
    onChange(level: SettingLevel, roomId: string, newValue: any): void;
    /**
     * Gets whether the setting has been disabled due to this controller.
     */
    get settingDisabled(): boolean;
}
