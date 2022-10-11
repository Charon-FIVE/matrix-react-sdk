import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { Optional } from "matrix-events-sdk";
import { Action } from "../actions";
import { ActionPayload } from "../payloads";
import { RoomPermalinkCreator } from "../../utils/permalinks/Permalinks";
export interface OpenForwardDialogPayload extends ActionPayload {
    action: Action.OpenForwardDialog;
    event: MatrixEvent;
    permalinkCreator: Optional<RoomPermalinkCreator>;
}
