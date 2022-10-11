export declare enum InviteState {
    Invited = "invited",
    Error = "error"
}
export declare type CompletionStates = Record<string, InviteState>;
/**
 * Invites multiple addresses to a room, handling rate limiting from the server
 */
export default class MultiInviter {
    private roomId;
    private readonly progressCallback?;
    private readonly matrixClient;
    private canceled;
    private addresses;
    private busy;
    private _fatal;
    private completionStates;
    private errors;
    private deferred;
    private reason;
    /**
     * @param {string} roomId The ID of the room to invite to
     * @param {function} progressCallback optional callback, fired after each invite.
     */
    constructor(roomId: string, progressCallback?: () => void);
    get fatal(): boolean;
    /**
     * Invite users to this room. This may only be called once per
     * instance of the class.
     *
     * @param {array} addresses Array of addresses to invite
     * @param {string} reason Reason for inviting (optional)
     * @param {boolean} sendSharedHistoryKeys whether to share e2ee keys with the invitees if applicable.
     * @returns {Promise} Resolved when all invitations in the queue are complete
     */
    invite(addresses: any, reason?: string, sendSharedHistoryKeys?: boolean): Promise<CompletionStates>;
    /**
     * Stops inviting. Causes promises returned by invite() to be rejected.
     */
    cancel(): void;
    getCompletionState(addr: string): InviteState;
    getErrorText(addr: string): string;
    private inviteToRoom;
    private doInvite;
    private inviteMore;
}
