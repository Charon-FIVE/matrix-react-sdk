import { Room } from "matrix-js-sdk/src/models/room";
import { SortAlgorithm } from "../models";
import { OrderingAlgorithm } from "./OrderingAlgorithm";
import { TagID } from "../../models";
/**
 * Uses the natural tag sorting algorithm order to determine tag ordering. No
 * additional behavioural changes are present.
 */
export declare class NaturalAlgorithm extends OrderingAlgorithm {
    constructor(tagId: TagID, initialSortingAlgorithm: SortAlgorithm);
    setRooms(rooms: Room[]): void;
    handleRoomUpdate(room: any, cause: any): boolean;
}
