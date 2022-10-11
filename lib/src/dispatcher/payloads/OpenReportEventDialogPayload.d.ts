import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { Action } from "../actions";
import { ActionPayload } from "../payloads";
export interface OpenReportEventDialogPayload extends ActionPayload {
    action: Action.OpenReportEventDialog;
    event: MatrixEvent;
}
