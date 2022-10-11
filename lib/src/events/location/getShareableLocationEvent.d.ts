import { MatrixEvent, MatrixClient } from "matrix-js-sdk/src/matrix";
/**
 * Get event that is shareable as a location
 * If an event does not have a shareable location, return null
 */
export declare const getShareableLocationEvent: (event: MatrixEvent, cli: MatrixClient) => MatrixEvent | null;
