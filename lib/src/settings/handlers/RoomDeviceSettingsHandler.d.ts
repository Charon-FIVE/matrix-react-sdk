import { WatchManager } from "../WatchManager";
import AbstractLocalStorageSettingsHandler from "./AbstractLocalStorageSettingsHandler";
/**
 * Gets and sets settings at the "room-device" level for the current device in a particular
 * room.
 */
export default class RoomDeviceSettingsHandler extends AbstractLocalStorageSettingsHandler {
    readonly watchers: WatchManager;
    constructor(watchers: WatchManager);
    getValue(settingName: string, roomId: string): any;
    setValue(settingName: string, roomId: string, newValue: any): Promise<void>;
    canSetValue(settingName: string, roomId: string): boolean;
    private read;
    private getKey;
}
