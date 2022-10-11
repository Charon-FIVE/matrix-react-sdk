import { MatrixEvent, MatrixClient } from "matrix-js-sdk/src/matrix";
/**
 * Get forwardable event for a given event
 * If an event is not forwardable return null
 */
export declare const getForwardableEvent: (event: MatrixEvent, cli: MatrixClient) => MatrixEvent | null;
