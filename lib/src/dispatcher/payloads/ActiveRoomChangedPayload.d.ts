import { Optional } from "matrix-events-sdk";
import { Action } from "../actions";
import { ActionPayload } from "../payloads";
export interface ActiveRoomChangedPayload extends ActionPayload {
    action: Action.ActiveRoomChanged;
    oldRoomId: Optional<string>;
    newRoomId: Optional<string>;
}
