import { MatrixClient } from "matrix-js-sdk/src/matrix";
/**
 * Decorates the given event content object with the "send start time". The
 * object will be modified in-place.
 * @param {object} content The event content.
 */
export declare function decorateStartSendingTime(content: object): void;
/**
 * Called when an event decorated with `decorateStartSendingTime()` has been sent
 * by the server (the client now knows the event ID).
 * @param {MatrixClient} client The client to send as.
 * @param {string} inRoomId The room ID where the original event was sent.
 * @param {string} forEventId The event ID for the decorated event.
 */
export declare function sendRoundTripMetric(client: MatrixClient, inRoomId: string, forEventId: string): void;
