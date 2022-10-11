import { MatrixEvent } from "matrix-js-sdk/src/matrix";
/**
 * beacon_info events without live property set to true
 * should be displayed in the timeline
 */
export declare const shouldDisplayAsBeaconTile: (event: MatrixEvent) => boolean;
