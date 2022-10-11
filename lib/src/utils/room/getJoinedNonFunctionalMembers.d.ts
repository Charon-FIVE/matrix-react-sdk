import { Room, RoomMember } from "matrix-js-sdk/src/matrix";
/**
 * Returns all room members that are non-functional (bots etc.).
 */
export declare const getJoinedNonFunctionalMembers: (room: Room) => RoomMember[];
