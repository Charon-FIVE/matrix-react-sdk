import { Room } from "matrix-js-sdk/src/models/room";
export interface RoomContextDetails {
    details: string;
    ariaLabel?: string;
}
export declare function roomContextDetails(room: Room): RoomContextDetails | null;
