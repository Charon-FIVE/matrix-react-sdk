import { Room } from "matrix-js-sdk/src/models/room";
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { TagID } from "../../models";
import { IAlgorithm } from "./IAlgorithm";
export declare function shouldCauseReorder(event: MatrixEvent): boolean;
export declare const sortRooms: (rooms: Room[]) => Room[];
/**
 * Sorts rooms according to the last event's timestamp in each room that seems
 * useful to the user.
 */
export declare class RecentAlgorithm implements IAlgorithm {
    sortRooms(rooms: Room[], tagId: TagID): Room[];
    getLastTs(room: Room, userId: string): number;
}
