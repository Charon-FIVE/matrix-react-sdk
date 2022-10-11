import { CallbackFn, WatchManager } from "../WatchManager";
import AbstractLocalStorageSettingsHandler from "./AbstractLocalStorageSettingsHandler";
/**
 * Gets and sets settings at the "device" level for the current device.
 * This handler does not make use of the roomId parameter. This handler
 * will special-case features to support legacy settings.
 */
export default class DeviceSettingsHandler extends AbstractLocalStorageSettingsHandler {
    private featureNames;
    readonly watchers: WatchManager;
    /**
     * Creates a new device settings handler
     * @param {string[]} featureNames The names of known features.
     * @param {WatchManager} watchers The watch manager to notify updates to
     */
    constructor(featureNames: string[], watchers: WatchManager);
    getValue(settingName: string, roomId: string): any;
    setValue(settingName: string, roomId: string, newValue: any): Promise<void>;
    canSetValue(settingName: string, roomId: string): boolean;
    watchSetting(settingName: string, roomId: string, cb: CallbackFn): void;
    unwatchSetting(cb: CallbackFn): void;
    private getSettings;
    readFeature(featureName: string): boolean | null;
    private writeFeature;
}
