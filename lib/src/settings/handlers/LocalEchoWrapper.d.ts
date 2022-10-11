import SettingsHandler from "./SettingsHandler";
import { SettingLevel } from "../SettingLevel";
/**
 * A wrapper for a SettingsHandler that performs local echo on
 * changes to settings. This wrapper will use the underlying
 * handler as much as possible to ensure values are not stale.
 */
export default class LocalEchoWrapper extends SettingsHandler {
    private readonly handler;
    private readonly level;
    private cache;
    /**
     * Creates a new local echo wrapper
     * @param {SettingsHandler} handler The handler to wrap
     * @param {SettingLevel} level The level to notify updates at
     */
    constructor(handler: SettingsHandler, level: SettingLevel);
    getValue(settingName: string, roomId: string): any;
    setValue(settingName: string, roomId: string, newValue: any): Promise<void>;
    canSetValue(settingName: string, roomId: string): boolean;
    isSupported(): boolean;
}
