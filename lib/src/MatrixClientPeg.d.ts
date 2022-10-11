import { IStartClientOpts, MatrixClient } from 'matrix-js-sdk/src/client';
export interface IMatrixClientCreds {
    homeserverUrl: string;
    identityServerUrl?: string;
    userId: string;
    deviceId?: string;
    accessToken: string;
    guest?: boolean;
    pickleKey?: string;
    freshLogin?: boolean;
}
/**
 * Holds the current instance of the `MatrixClient` to use across the codebase.
 * Looking for an `MatrixClient`? Just look for the `MatrixClientPeg` on the peg
 * board. "Peg" is the literal meaning of something you hang something on. So
 * you'll find a `MatrixClient` hanging on the `MatrixClientPeg`.
 */
export interface IMatrixClientPeg {
    opts: IStartClientOpts;
    /**
     * Return the server name of the user's homeserver
     * Throws an error if unable to deduce the homeserver name
     * (eg. if the user is not logged in)
     *
     * @returns {string} The homeserver name, if present.
     */
    getHomeserverName(): string;
    get(): MatrixClient;
    unset(): void;
    assign(): Promise<any>;
    start(): Promise<any>;
    getCredentials(): IMatrixClientCreds;
    /**
     * If we've registered a user ID we set this to the ID of the
     * user we've just registered. If they then go & log in, we
     * can send them to the welcome user (obviously this doesn't
     * guarantee they'll get a chat with the welcome user).
     *
     * @param {string} uid The user ID of the user we've just registered
     */
    setJustRegisteredUserId(uid: string | null): void;
    /**
     * Returns true if the current user has just been registered by this
     * client as determined by setJustRegisteredUserId()
     *
     * @returns {bool} True if user has just been registered
     */
    currentUserIsJustRegistered(): boolean;
    /**
     * If the current user has been registered by this device then this
     * returns a boolean of whether it was within the last N hours given.
     */
    userRegisteredWithinLastHours(hours: number): boolean;
    /**
     * If the current user has been registered by this device then this
     * returns a boolean of whether it was after a given timestamp.
     */
    userRegisteredAfter(date: Date): boolean;
    /**
     * Replace this MatrixClientPeg's client with a client instance that has
     * homeserver / identity server URLs and active credentials
     *
     * @param {IMatrixClientCreds} creds The new credentials to use.
     */
    replaceUsingCreds(creds: IMatrixClientCreds): void;
}
/**
 * Note: You should be using a React context with access to a client rather than
 * using this, as in a multi-account world this will not exist!
 */
export declare const MatrixClientPeg: IMatrixClientPeg;
