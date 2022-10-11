import { InvalidStoreError } from "matrix-js-sdk/src/errors";
import { MatrixClient } from "matrix-js-sdk/src/client";
import { IEncryptedPayload } from "matrix-js-sdk/src/crypto/aes";
import { QueryDict } from 'matrix-js-sdk/src/utils';
import { IMatrixClientCreds } from './MatrixClientPeg';
interface ILoadSessionOpts {
    enableGuest?: boolean;
    guestHsUrl?: string;
    guestIsUrl?: string;
    ignoreGuest?: boolean;
    defaultDeviceDisplayName?: string;
    fragmentQueryParams?: QueryDict;
}
/**
 * Called at startup, to attempt to build a logged-in Matrix session. It tries
 * a number of things:
 *
 * 1. if we have a guest access token in the fragment query params, it uses
 *    that.
 * 2. if an access token is stored in local storage (from a previous session),
 *    it uses that.
 * 3. it attempts to auto-register as a guest user.
 *
 * If any of steps 1-4 are successful, it will call {_doSetLoggedIn}, which in
 * turn will raise on_logged_in and will_start_client events.
 *
 * @param {object} [opts]
 * @param {object} [opts.fragmentQueryParams]: string->string map of the
 *     query-parameters extracted from the #-fragment of the starting URI.
 * @param {boolean} [opts.enableGuest]: set to true to enable guest access
 *     tokens and auto-guest registrations.
 * @param {string} [opts.guestHsUrl]: homeserver URL. Only used if enableGuest
 *     is true; defines the HS to register against.
 * @param {string} [opts.guestIsUrl]: homeserver URL. Only used if enableGuest
 *     is true; defines the IS to use.
 * @param {bool} [opts.ignoreGuest]: If the stored session is a guest account,
 *     ignore it and don't load it.
 * @param {string} [opts.defaultDeviceDisplayName]: Default display name to use
 *     when registering as a guest.
 * @returns {Promise} a promise which resolves when the above process completes.
 *     Resolves to `true` if we ended up starting a session, or `false` if we
 *     failed.
 */
export declare function loadSession(opts?: ILoadSessionOpts): Promise<boolean>;
/**
 * Gets the user ID of the persisted session, if one exists. This does not validate
 * that the user's credentials still work, just that they exist and that a user ID
 * is associated with them. The session is not loaded.
 * @returns {[string, boolean]} The persisted session's owner and whether the stored
 *     session is for a guest user, if an owner exists. If there is no stored session,
 *     return [null, null].
 */
export declare function getStoredSessionOwner(): Promise<[string, boolean]>;
/**
 * @param {Object} queryParams    string->string map of the
 *     query-parameters extracted from the real query-string of the starting
 *     URI.
 *
 * @param {string} defaultDeviceDisplayName
 * @param {string} fragmentAfterLogin path to go to after a successful login, only used for "Try again"
 *
 * @returns {Promise} promise which resolves to true if we completed the token
 *    login, else false
 */
export declare function attemptTokenLogin(queryParams: QueryDict, defaultDeviceDisplayName?: string, fragmentAfterLogin?: string): Promise<boolean>;
export declare function handleInvalidStoreError(e: InvalidStoreError): Promise<void>;
export interface IStoredSession {
    hsUrl: string;
    isUrl: string;
    hasAccessToken: boolean;
    accessToken: string | IEncryptedPayload;
    userId: string;
    deviceId: string;
    isGuest: boolean;
}
/**
 * Retrieves information about the stored session from the browser's storage. The session
 * may not be valid, as it is not tested for consistency here.
 * @returns {Object} Information about the session - see implementation for variables.
 */
export declare function getStoredSessionVars(): Promise<IStoredSession>;
export declare function restoreFromLocalStorage(opts?: {
    ignoreGuest?: boolean;
}): Promise<boolean>;
/**
 * Transitions to a logged-in state using the given credentials.
 *
 * Starts the matrix client and all other react-sdk services that
 * listen for events while a session is logged in.
 *
 * Also stops the old MatrixClient and clears old credentials/etc out of
 * storage before starting the new client.
 *
 * @param {IMatrixClientCreds} credentials The credentials to use
 *
 * @returns {Promise} promise which resolves to the new MatrixClient once it has been started
 */
export declare function setLoggedIn(credentials: IMatrixClientCreds): Promise<MatrixClient>;
/**
 * Hydrates an existing session by using the credentials provided. This will
 * not clear any local storage, unlike setLoggedIn().
 *
 * Stops the existing Matrix client (without clearing its data) and starts a
 * new one in its place. This additionally starts all other react-sdk services
 * which use the new Matrix client.
 *
 * If the credentials belong to a different user from the session already stored,
 * the old session will be cleared automatically.
 *
 * @param {IMatrixClientCreds} credentials The credentials to use
 *
 * @returns {Promise} promise which resolves to the new MatrixClient once it has been started
 */
export declare function hydrateSession(credentials: IMatrixClientCreds): Promise<MatrixClient>;
/**
 * Logs the current session out and transitions to the logged-out state
 */
export declare function logout(): void;
export declare function softLogout(): void;
export declare function isSoftLogout(): boolean;
export declare function isLoggingOut(): boolean;
export declare function onLoggedOut(): Promise<void>;
/**
 * Stop all the background processes related to the current client.
 * @param {boolean} unsetClient True (default) to abandon the client
 * on MatrixClientPeg after stopping.
 */
export declare function stopMatrixClient(unsetClient?: boolean): void;
export {};
