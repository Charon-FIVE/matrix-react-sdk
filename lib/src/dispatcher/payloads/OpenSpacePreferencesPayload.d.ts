import { Room } from "matrix-js-sdk/src/models/room";
import { ActionPayload } from "../payloads";
import { Action } from "../actions";
export declare enum SpacePreferenceTab {
    Appearance = "SPACE_PREFERENCE_APPEARANCE_TAB"
}
export interface OpenSpacePreferencesPayload extends ActionPayload {
    action: Action.OpenSpacePreferences;
    /**
     * The space to open preferences for.
     */
    space: Room;
    /**
     * Optional tab to open specifically, otherwise the dialog's internal default.
     */
    initialTabId?: SpacePreferenceTab;
}
