import { MatrixClient } from "matrix-js-sdk/src/client";
import MatrixClientBackedSettingsHandler from "./MatrixClientBackedSettingsHandler";
import { SettingLevel } from "../SettingLevel";
import { WatchManager } from "../WatchManager";
/**
 * Gets and sets settings at the "account" level for the current user.
 * This handler does not make use of the roomId parameter.
 */
export default class AccountSettingsHandler extends MatrixClientBackedSettingsHandler {
    readonly watchers: WatchManager;
    constructor(watchers: WatchManager);
    get level(): SettingLevel;
    initMatrixClient(oldClient: MatrixClient, newClient: MatrixClient): void;
    private onAccountData;
    getValue(settingName: string, roomId: string): any;
    private setAccountData;
    setValue(settingName: string, roomId: string, newValue: any): Promise<void>;
    canSetValue(settingName: string, roomId: string): boolean;
    isSupported(): boolean;
    private getSettings;
    private notifyBreadcrumbsUpdate;
}
