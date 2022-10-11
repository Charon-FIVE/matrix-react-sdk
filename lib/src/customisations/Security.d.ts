import { ISecretStorageKeyInfo } from 'matrix-js-sdk/src/crypto/api';
import { IMatrixClientCreds } from "../MatrixClientPeg";
import { Kind as SetupEncryptionKind } from "../toasts/SetupEncryptionToast";
declare function examineLoginResponse(response: any, credentials: IMatrixClientCreds): void;
declare function persistCredentials(credentials: IMatrixClientCreds): void;
declare function createSecretStorageKey(): Uint8Array;
declare function getSecretStorageKey(): Uint8Array;
declare function getDehydrationKey(keyInfo: ISecretStorageKeyInfo): Promise<Uint8Array>;
declare function catchAccessSecretStorageError(e: Error): void;
declare function setupEncryptionNeeded(kind: SetupEncryptionKind): boolean;
export interface ISecurityCustomisations {
    examineLoginResponse?: typeof examineLoginResponse;
    persistCredentials?: typeof persistCredentials;
    createSecretStorageKey?: typeof createSecretStorageKey;
    getSecretStorageKey?: typeof getSecretStorageKey;
    catchAccessSecretStorageError?: typeof catchAccessSecretStorageError;
    setupEncryptionNeeded?: typeof setupEncryptionNeeded;
    getDehydrationKey?: typeof getDehydrationKey;
    /**
     * When false, disables the post-login UI from showing. If there's
     * an error during setup, that will be shown to the user.
     *
     * Note: when this is set to false then the app will assume the user's
     * encryption is set up some other way which would circumvent the default
     * UI, such as by presenting alternative UI.
     */
    SHOW_ENCRYPTION_SETUP_UI?: boolean;
}
declare const _default: ISecurityCustomisations;
export default _default;
