import { MatrixClient } from "matrix-js-sdk/src/client";
import MatrixClientBackedSettingsHandler from "./MatrixClientBackedSettingsHandler";
import { WatchManager } from "../WatchManager";
/**
 * Gets and sets settings at the "room" level.
 */
export default class RoomSettingsHandler extends MatrixClientBackedSettingsHandler {
    readonly watchers: WatchManager;
    constructor(watchers: WatchManager);
    protected initMatrixClient(oldClient: MatrixClient, newClient: MatrixClient): void;
    private onEvent;
    getValue(settingName: string, roomId: string): any;
    private sendStateEvent;
    setValue(settingName: string, roomId: string, newValue: any): Promise<void>;
    canSetValue(settingName: string, roomId: string): boolean;
    isSupported(): boolean;
    private getSettings;
}
