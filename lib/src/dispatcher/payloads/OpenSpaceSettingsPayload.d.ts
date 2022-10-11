import { Room } from "matrix-js-sdk/src/models/room";
import { ActionPayload } from "../payloads";
import { Action } from "../actions";
export interface OpenSpaceSettingsPayload extends ActionPayload {
    action: Action.OpenSpaceSettings;
    /**
     * The space to open settings for.
     */
    space: Room;
}
