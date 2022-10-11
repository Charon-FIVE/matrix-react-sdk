import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { TagID } from "../models";
/**
 * Represents an event preview.
 */
export interface IPreview {
    /**
     * Gets the text which represents the event as a preview.
     * @param event The event to preview.
     * @param tagId Optional. The tag where the room the event was sent in resides.
     * @param isThread Optional. Whether the preview being generated is for a thread summary.
     * @returns The preview.
     */
    getTextFor(event: MatrixEvent, tagId?: TagID, isThread?: boolean): string | null;
}
