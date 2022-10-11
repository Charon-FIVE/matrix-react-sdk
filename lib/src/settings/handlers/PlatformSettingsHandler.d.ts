import SettingsHandler from "./SettingsHandler";
/**
 * Gets and sets settings at the "platform" level for the current device.
 * This handler does not make use of the roomId parameter.
 */
export default class PlatformSettingsHandler extends SettingsHandler {
    private store;
    constructor();
    private onAction;
    canSetValue(settingName: string, roomId: string): boolean;
    getValue(settingName: string, roomId: string): any;
    setValue(settingName: string, roomId: string, newValue: any): Promise<void>;
    isSupported(): boolean;
}
