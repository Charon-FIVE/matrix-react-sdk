import { Room } from "matrix-js-sdk/src/models/room";
import { ActionPayload } from "../payloads";
import { Action } from "../actions";
export interface OpenAddExistingToSpaceDialogPayload extends ActionPayload {
    action: Action.OpenAddToExistingSpaceDialog;
    space: Room;
}
