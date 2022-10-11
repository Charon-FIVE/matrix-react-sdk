import { MatrixError } from "matrix-js-sdk/src/http-api";
import { ActionPayload } from "../payloads";
import { Action } from "../actions";
export interface JoinRoomErrorPayload extends Pick<ActionPayload, "action"> {
    action: Action.JoinRoomError;
    roomId: string;
    err?: MatrixError;
}
