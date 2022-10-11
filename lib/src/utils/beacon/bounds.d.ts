import { Beacon } from "matrix-js-sdk/src/matrix";
export declare type Bounds = {
    north: number;
    east: number;
    west: number;
    south: number;
};
/**
 * Get the geo bounds of given list of beacons
 *
 * Latitude:
 * equator: 0, North pole: 90, South pole -90
 * Longitude:
 * Prime Meridian (Greenwich): 0
 * east of Greenwich has a positive longitude, max 180
 * west of Greenwich has a negative longitude, min -180
 */
export declare const getBeaconBounds: (beacons: Beacon[]) => Bounds | undefined;
