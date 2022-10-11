import BasePlatform from "./BasePlatform";
export declare class PlatformPeg {
    private platform;
    /**
     * Returns the current Platform object for the application.
     * This should be an instance of a class extending BasePlatform.
     */
    get(): BasePlatform;
    /**
     * Sets the current platform handler object to use for the application.
     * @param {BasePlatform} platform an instance of a class extending BasePlatform.
     */
    set(platform: BasePlatform): void;
}
declare const _default: PlatformPeg;
export default _default;
