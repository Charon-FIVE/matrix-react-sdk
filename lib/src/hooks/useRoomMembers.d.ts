import { Room } from "matrix-js-sdk/src/models/room";
import { RoomMember } from "matrix-js-sdk/src/models/room-member";
export declare const useRoomMembers: (room: Room, throttleWait?: number) => RoomMember[];
export declare const useRoomMemberCount: (room: Room, throttleWait?: number) => number;
export declare const useMyRoomMembership: (room: Room) => string;
