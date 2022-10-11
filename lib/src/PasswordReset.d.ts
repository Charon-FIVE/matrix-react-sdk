import { IRequestTokenResponse } from 'matrix-js-sdk/src/matrix';
/**
 * Allows a user to reset their password on a homeserver.
 *
 * This involves getting an email token from the identity server to "prove" that
 * the client owns the given email address, which is then passed to the password
 * API on the homeserver in question with the new password.
 */
export default class PasswordReset {
    private client;
    private clientSecret;
    private password;
    private sessionId;
    private logoutDevices;
    /**
     * Configure the endpoints for password resetting.
     * @param {string} homeserverUrl The URL to the HS which has the account to reset.
     * @param {string} identityUrl The URL to the IS which has linked the email -> mxid mapping.
     */
    constructor(homeserverUrl: string, identityUrl: string);
    /**
     * Attempt to reset the user's password. This will trigger a side-effect of
     * sending an email to the provided email address.
     * @param {string} emailAddress The email address
     * @param {string} newPassword The new password for the account.
     * @param {boolean} logoutDevices Should all devices be signed out after the reset? Defaults to `true`.
     * @return {Promise} Resolves when the email has been sent. Then call checkEmailLinkClicked().
     */
    resetPassword(emailAddress: string, newPassword: string, logoutDevices?: boolean): Promise<IRequestTokenResponse>;
    /**
     * Checks if the email link has been clicked by attempting to change the password
     * for the mxid linked to the email.
     * @return {Promise} Resolves if the password was reset. Rejects with an object
     * with a "message" property which contains a human-readable message detailing why
     * the reset failed, e.g. "There is no mapped matrix user ID for the given email address".
     */
    checkEmailLinkClicked(): Promise<void>;
}
