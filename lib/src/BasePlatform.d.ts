import { MatrixClient } from "matrix-js-sdk/src/client";
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { Room } from "matrix-js-sdk/src/models/room";
import BaseEventIndexManager from './indexing/BaseEventIndexManager';
import { ActionPayload } from "./dispatcher/payloads";
import { IConfigOptions } from "./IConfigOptions";
export declare const SSO_HOMESERVER_URL_KEY = "mx_sso_hs_url";
export declare const SSO_ID_SERVER_URL_KEY = "mx_sso_is_url";
export declare const SSO_IDP_ID_KEY = "mx_sso_idp_id";
export declare enum UpdateCheckStatus {
    Checking = "CHECKING",
    Error = "ERROR",
    NotAvailable = "NOTAVAILABLE",
    Downloading = "DOWNLOADING",
    Ready = "READY"
}
export interface UpdateStatus {
    /**
     * The current phase of the manual update check.
     */
    status: UpdateCheckStatus;
    /**
     * Detail string relating to the current status, typically for error details.
     */
    detail?: string;
}
/**
 * Base class for classes that provide platform-specific functionality
 * eg. Setting an application badge or displaying notifications
 *
 * Instances of this class are provided by the application.
 */
export default abstract class BasePlatform {
    protected notificationCount: number;
    protected errorDidOccur: boolean;
    constructor();
    abstract getConfig(): Promise<IConfigOptions>;
    abstract getDefaultDeviceDisplayName(): string;
    protected onAction: (payload: ActionPayload) => void;
    abstract getHumanReadableName(): string;
    setNotificationCount(count: number): void;
    setErrorStatus(errorDidOccur: boolean): void;
    /**
     * Whether we can call checkForUpdate on this platform build
     */
    canSelfUpdate(): Promise<boolean>;
    startUpdateCheck(): void;
    /**
     * Update the currently running app to the latest available version
     * and replace this instance of the app with the new version.
     */
    installUpdate(): void;
    /**
     * Check if the version update has been deferred and that deferment is still in effect
     * @param newVersion the version string to check
     */
    protected shouldShowUpdate(newVersion: string): boolean;
    /**
     * Ignore the pending update and don't prompt about this version
     * until the next morning (8am).
     */
    deferUpdate(newVersion: string): void;
    /**
     * Return true if platform supports multi-language
     * spell-checking, otherwise false.
     */
    supportsSpellCheckSettings(): boolean;
    /**
     * Returns true if platform allows overriding native context menus
     */
    allowOverridingNativeContextMenus(): boolean;
    /**
     * Returns true if the platform supports displaying
     * notifications, otherwise false.
     * @returns {boolean} whether the platform supports displaying notifications
     */
    supportsNotifications(): boolean;
    /**
     * Returns true if the application currently has permission
     * to display notifications. Otherwise false.
     * @returns {boolean} whether the application has permission to display notifications
     */
    maySendNotifications(): boolean;
    /**
     * Requests permission to send notifications. Returns
     * a promise that is resolved when the user has responded
     * to the request. The promise has a single string argument
     * that is 'granted' if the user allowed the request or
     * 'denied' otherwise.
     */
    abstract requestNotificationPermission(): Promise<string>;
    displayNotification(title: string, msg: string, avatarUrl: string, room: Room, ev?: MatrixEvent): Notification;
    loudNotification(ev: MatrixEvent, room: Room): void;
    clearNotification(notif: Notification): void;
    /**
     * Returns true if the platform requires URL previews in tooltips, otherwise false.
     * @returns {boolean} whether the platform requires URL previews in tooltips
     */
    needsUrlTooltips(): boolean;
    /**
     * Returns a promise that resolves to a string representing the current version of the application.
     */
    abstract getAppVersion(): Promise<string>;
    /**
     * Restarts the application, without necessarily reloading
     * any application code
     */
    abstract reload(): void;
    supportsSetting(settingName?: string): boolean;
    getSettingValue(settingName: string): Promise<any>;
    setSettingValue(settingName: string, value: any): Promise<void>;
    /**
     * Get our platform specific EventIndexManager.
     *
     * @return {BaseEventIndexManager} The EventIndex manager for our platform,
     * can be null if the platform doesn't support event indexing.
     */
    getEventIndexingManager(): BaseEventIndexManager | null;
    setLanguage(preferredLangs: string[]): void;
    setSpellCheckEnabled(enabled: boolean): void;
    getSpellCheckEnabled(): Promise<boolean>;
    setSpellCheckLanguages(preferredLangs: string[]): void;
    getSpellCheckLanguages(): Promise<string[]> | null;
    getDesktopCapturerSources(options: GetSourcesOptions): Promise<Array<DesktopCapturerSource>>;
    supportsDesktopCapturer(): boolean;
    supportsJitsiScreensharing(): boolean;
    overrideBrowserShortcuts(): boolean;
    navigateForwardBack(back: boolean): void;
    getAvailableSpellCheckLanguages(): Promise<string[]> | null;
    protected getSSOCallbackUrl(fragmentAfterLogin: string): URL;
    /**
     * Begin Single Sign On flows.
     * @param {MatrixClient} mxClient the matrix client using which we should start the flow
     * @param {"sso"|"cas"} loginType the type of SSO it is, CAS/SSO.
     * @param {string} fragmentAfterLogin the hash to pass to the app during sso callback.
     * @param {string} idpId The ID of the Identity Provider being targeted, optional.
     */
    startSingleSignOn(mxClient: MatrixClient, loginType: "sso" | "cas", fragmentAfterLogin: string, idpId?: string): void;
    /**
     * Get a previously stored pickle key.  The pickle key is used for
     * encrypting libolm objects.
     * @param {string} userId the user ID for the user that the pickle key is for.
     * @param {string} userId the device ID that the pickle key is for.
     * @returns {string|null} the previously stored pickle key, or null if no
     *     pickle key has been stored.
     */
    getPickleKey(userId: string, deviceId: string): Promise<string | null>;
    /**
     * Create and store a pickle key for encrypting libolm objects.
     * @param {string} userId the user ID for the user that the pickle key is for.
     * @param {string} deviceId the device ID that the pickle key is for.
     * @returns {string|null} the pickle key, or null if the platform does not
     *     support storing pickle keys.
     */
    createPickleKey(userId: string, deviceId: string): Promise<string | null>;
    /**
     * Delete a previously stored pickle key from storage.
     * @param {string} userId the user ID for the user that the pickle key is for.
     * @param {string} userId the device ID that the pickle key is for.
     */
    destroyPickleKey(userId: string, deviceId: string): Promise<void>;
}
