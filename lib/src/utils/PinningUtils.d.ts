import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { EventType } from "matrix-js-sdk/src/@types/event";
export default class PinningUtils {
    /**
     * Event types that may be pinned.
     */
    static pinnableEventTypes: (EventType | string)[];
    /**
     * Determines if the given event may be pinned.
     * @param {MatrixEvent} event The event to check.
     * @return {boolean} True if the event may be pinned, false otherwise.
     */
    static isPinnable(event: MatrixEvent): boolean;
}
