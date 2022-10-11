import { Room } from "matrix-js-sdk/src/models/room";
import { RoomEchoChamber } from "./RoomEchoChamber";
/**
 * Semantic access to local echo
 */
export declare class EchoChamber {
    private constructor();
    static forRoom(room: Room): RoomEchoChamber;
}
