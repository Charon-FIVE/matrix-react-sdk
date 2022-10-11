import { MatrixError, Room } from "matrix-js-sdk/src/matrix";
import { ActionPayload } from "../payloads";
import { Action } from "../actions";
export interface ViewRoomErrorPayload extends Pick<ActionPayload, "action"> {
    action: Action.ViewRoomError;
    room_id: Room["roomId"];
    room_alias?: string;
    err?: MatrixError;
}
