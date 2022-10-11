import { Beacon, Room, MatrixClient } from "matrix-js-sdk/src/matrix";
/**
 * Returns an array of all live beacon ids for a given room
 *
 * Beacons are removed from array when they become inactive
 */
export declare const useLiveBeacons: (roomId: Room['roomId'], matrixClient: MatrixClient) => Beacon[];
