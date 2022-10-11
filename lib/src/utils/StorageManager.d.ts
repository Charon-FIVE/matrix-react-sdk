export declare function tryPersistStorage(): void;
export declare function checkConsistency(): Promise<{
    dataInLocalStorage: boolean;
    dataInCryptoStore: boolean;
    cryptoInited: boolean;
    healthy: boolean;
}>;
/**
 * Sets whether crypto has ever been successfully
 * initialised on this client.
 * StorageManager uses this to determine whether indexeddb
 * has been wiped by the browser: this flag is saved to localStorage
 * and if it is true and not crypto data is found, an error is
 * presented to the user.
 *
 * @param {boolean} cryptoInited True if crypto has been set up
 */
export declare function setCryptoInitialised(cryptoInited: boolean): void;
export declare function idbLoad(table: string, key: string | string[]): Promise<any>;
export declare function idbSave(table: string, key: string | string[], data: any): Promise<void>;
export declare function idbDelete(table: string, key: string | string[]): Promise<void>;
