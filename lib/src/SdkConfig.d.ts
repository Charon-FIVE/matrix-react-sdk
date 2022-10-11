import { Optional } from "matrix-events-sdk";
import { SnakedObject } from "./utils/SnakedObject";
import { IConfigOptions, ISsoRedirectOptions } from "./IConfigOptions";
import { KeysWithObjectShape } from "./@types/common";
export declare const DEFAULTS: IConfigOptions;
export default class SdkConfig {
    private static instance;
    private static fallback;
    private static setInstance;
    static get(): IConfigOptions;
    static get<K extends keyof IConfigOptions>(key: K, altCaseName?: string): IConfigOptions[K];
    static getObject<K extends KeysWithObjectShape<IConfigOptions>>(key: K, altCaseName?: string): Optional<SnakedObject<IConfigOptions[K]>>;
    static put(cfg: IConfigOptions): void;
    /**
     * Resets the config to be completely empty.
     */
    static unset(): void;
    static add(cfg: Partial<IConfigOptions>): void;
}
export declare function parseSsoRedirectOptions(config: IConfigOptions): ISsoRedirectOptions;
