import SettingsHandler from "./SettingsHandler";
/**
 * Abstract settings handler wrapping around localStorage making getValue calls cheaper
 * by caching the values and listening for localStorage updates from other tabs.
 */
export default abstract class AbstractLocalStorageSettingsHandler extends SettingsHandler {
    private static itemCache;
    private static objectCache;
    private static storageListenerBound;
    private static onStorageEvent;
    static clear(): void;
    protected constructor();
    protected getItem(key: string): string;
    protected getBoolean(key: string): boolean | null;
    protected getObject<T extends object>(key: string): T | null;
    protected setItem(key: string, value: string): void;
    protected setBoolean(key: string, value: boolean | null): void;
    protected setObject(key: string, value: object): void;
    protected removeItem(key: string): void;
    isSupported(): boolean;
}
