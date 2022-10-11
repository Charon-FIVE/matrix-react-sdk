import { Room } from "matrix-js-sdk/src/models/room";
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import MultiInviter, { CompletionStates } from './utils/MultiInviter';
import { Member } from "./utils/direct-messages";
export interface IInviteResult {
    states: CompletionStates;
    inviter: MultiInviter;
}
/**
 * Invites multiple addresses to a room
 * Simpler interface to utils/MultiInviter but with
 * no option to cancel.
 *
 * @param {string} roomId The ID of the room to invite to
 * @param {string[]} addresses Array of strings of addresses to invite. May be matrix IDs or 3pids.
 * @param {boolean} sendSharedHistoryKeys whether to share e2ee keys with the invitees if applicable.
 * @param {function} progressCallback optional callback, fired after each invite.
 * @returns {Promise} Promise
 */
export declare function inviteMultipleToRoom(roomId: string, addresses: string[], sendSharedHistoryKeys?: boolean, progressCallback?: () => void): Promise<IInviteResult>;
export declare function showStartChatInviteDialog(initialText?: string): void;
export declare function showRoomInviteDialog(roomId: string, initialText?: string): void;
/**
 * Checks if the given MatrixEvent is a valid 3rd party user invite.
 * @param {MatrixEvent} event The event to check
 * @returns {boolean} True if valid, false otherwise
 */
export declare function isValid3pidInvite(event: MatrixEvent): boolean;
export declare function inviteUsersToRoom(roomId: string, userIds: string[], sendSharedHistoryKeys?: boolean, progressCallback?: () => void): Promise<void>;
export declare function showAnyInviteErrors(states: CompletionStates, room: Room, inviter: MultiInviter, userMap?: Map<string, Member>): boolean;
