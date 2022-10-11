import { IRequestMsisdnTokenResponse, IRequestTokenResponse } from "matrix-js-sdk/src/matrix";
/**
 * Allows a user to add a third party identifier to their homeserver and,
 * optionally, the identity servers.
 *
 * This involves getting an email token from the identity server to "prove" that
 * the client owns the given email address, which is then passed to the
 * add threepid API on the homeserver.
 *
 * Diagrams of the intended API flows here are available at:
 *
 * https://gist.github.com/jryans/839a09bf0c5a70e2f36ed990d50ed928
 */
export default class AddThreepid {
    private sessionId;
    private submitUrl;
    private clientSecret;
    private bind;
    constructor();
    /**
     * Attempt to add an email threepid to the homeserver.
     * This will trigger a side-effect of sending an email to the provided email address.
     * @param {string} emailAddress The email address to add
     * @return {Promise} Resolves when the email has been sent. Then call checkEmailLinkClicked().
     */
    addEmailAddress(emailAddress: string): Promise<IRequestTokenResponse>;
    /**
     * Attempt to bind an email threepid on the identity server via the homeserver.
     * This will trigger a side-effect of sending an email to the provided email address.
     * @param {string} emailAddress The email address to add
     * @return {Promise} Resolves when the email has been sent. Then call checkEmailLinkClicked().
     */
    bindEmailAddress(emailAddress: string): Promise<IRequestTokenResponse>;
    /**
     * Attempt to add a MSISDN threepid to the homeserver.
     * This will trigger a side-effect of sending an SMS to the provided phone number.
     * @param {string} phoneCountry The ISO 2 letter code of the country to resolve phoneNumber in
     * @param {string} phoneNumber The national or international formatted phone number to add
     * @return {Promise} Resolves when the text message has been sent. Then call haveMsisdnToken().
     */
    addMsisdn(phoneCountry: string, phoneNumber: string): Promise<IRequestMsisdnTokenResponse>;
    /**
     * Attempt to bind a MSISDN threepid on the identity server via the homeserver.
     * This will trigger a side-effect of sending an SMS to the provided phone number.
     * @param {string} phoneCountry The ISO 2 letter code of the country to resolve phoneNumber in
     * @param {string} phoneNumber The national or international formatted phone number to add
     * @return {Promise} Resolves when the text message has been sent. Then call haveMsisdnToken().
     */
    bindMsisdn(phoneCountry: string, phoneNumber: string): Promise<IRequestMsisdnTokenResponse>;
    /**
     * Checks if the email link has been clicked by attempting to add the threepid
     * @return {Promise} Resolves if the email address was added. Rejects with an object
     * with a "message" property which contains a human-readable message detailing why
     * the request failed.
     */
    checkEmailLinkClicked(): Promise<any[]>;
    /**
     * @param {{type: string, session?: string}} auth UI auth object
     * @return {Promise<Object>} Response from /3pid/add call (in current spec, an empty object)
     */
    private makeAddThreepidOnlyRequest;
    /**
     * Takes a phone number verification code as entered by the user and validates
     * it with the identity server, then if successful, adds the phone number.
     * @param {string} msisdnToken phone number verification code as entered by the user
     * @return {Promise} Resolves if the phone number was added. Rejects with an object
     * with a "message" property which contains a human-readable message detailing why
     * the request failed.
     */
    haveMsisdnToken(msisdnToken: string): Promise<any[]>;
}
