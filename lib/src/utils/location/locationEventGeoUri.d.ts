import { MatrixEvent } from "matrix-js-sdk/src/matrix";
/**
 * Find the geo-URI contained within a location event.
 */
export declare const locationEventGeoUri: (mxEvent: MatrixEvent) => string;
