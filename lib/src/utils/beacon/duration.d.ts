import { BeaconInfoState } from "matrix-js-sdk/src/content-helpers";
import { Beacon } from "matrix-js-sdk/src/matrix";
/**
 * Get ms until expiry
 * Returns 0 when expiry is already passed
 * @param startTimestamp
 * @param durationMs
 * @returns remainingMs
 */
export declare const msUntilExpiry: (startTimestamp: number, durationMs: number) => number;
export declare const getBeaconMsUntilExpiry: (beaconInfo: BeaconInfoState) => number;
export declare const getBeaconExpiryTimestamp: (beacon: Beacon) => number;
export declare const sortBeaconsByLatestExpiry: (left: Beacon, right: Beacon) => number;
export declare const sortBeaconsByLatestCreation: (left: Beacon, right: Beacon) => number;
export declare const isBeaconWaitingToStart: (beacon: Beacon) => boolean;
