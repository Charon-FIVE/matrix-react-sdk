import { MatrixClient, MatrixEvent } from "matrix-js-sdk/src/matrix";
/**
 * Beacons should only have shareable locations (open in external mapping tool, forward)
 * when they are live and have a location
 * If not live, returns null
 */
export declare const getShareableLocationEventForBeacon: (event: MatrixEvent, cli: MatrixClient) => MatrixEvent | null;
