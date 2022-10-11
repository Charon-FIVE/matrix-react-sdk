import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { ActionPayload } from "../payloads";
import { Action } from "../actions";
export interface ShowThreadPayload extends ActionPayload {
    action: Action.ShowThread;
    rootEvent: MatrixEvent;
    initialEvent?: MatrixEvent;
    highlighted?: boolean;
    scrollIntoView?: boolean;
    push?: boolean;
}
