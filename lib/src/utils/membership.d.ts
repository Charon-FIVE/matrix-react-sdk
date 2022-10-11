import { Room } from "matrix-js-sdk/src/models/room";
import { MatrixClient } from "matrix-js-sdk/src/client";
/**
 * Approximation of a membership status for a given room.
 */
export declare enum EffectiveMembership {
    /**
     * The user is effectively joined to the room. For example, actually joined
     * or knocking on the room (when that becomes possible).
     */
    Join = "JOIN",
    /**
     * The user is effectively invited to the room. Currently this is a direct map
     * to the invite membership as no other membership states are effectively
     * invites.
     */
    Invite = "INVITE",
    /**
     * The user is effectively no longer in the room. For example, kicked,
     * banned, or voluntarily left.
     */
    Leave = "LEAVE"
}
export interface MembershipSplit {
    [state: EffectiveMembership]: Room[];
}
export declare function splitRoomsByMembership(rooms: Room[]): MembershipSplit;
export declare function getEffectiveMembership(membership: string): EffectiveMembership;
export declare function isJoinedOrNearlyJoined(membership: string): boolean;
/**
 * Try to ensure the user is already in the megolm session before continuing
 * NOTE: this assumes you've just created the room and there's not been an opportunity
 * for other code to run, so we shouldn't miss RoomState.newMember when it comes by.
 */
export declare function waitForMember(client: MatrixClient, roomId: string, userId: string, opts?: {
    timeout: number;
}): Promise<unknown>;
