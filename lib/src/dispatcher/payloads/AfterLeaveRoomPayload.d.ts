import { Room } from "matrix-js-sdk/src/models/room";
import { Action } from "../actions";
import { ActionPayload } from "../payloads";
export interface AfterLeaveRoomPayload extends ActionPayload {
    action: Action.AfterLeaveRoom;
    room_id?: Room["roomId"];
}
