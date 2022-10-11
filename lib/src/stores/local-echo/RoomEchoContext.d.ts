import { Room } from "matrix-js-sdk/src/models/room";
import { EchoContext } from "./EchoContext";
export declare class RoomEchoContext extends EchoContext {
    readonly room: Room;
    constructor(room: Room);
}
