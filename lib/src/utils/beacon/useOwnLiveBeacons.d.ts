import { Beacon, BeaconIdentifier } from "matrix-js-sdk/src/matrix";
declare type LiveBeaconsState = {
    beacon?: Beacon;
    onStopSharing?: () => void;
    onResetLocationPublishError?: () => void;
    stoppingInProgress?: boolean;
    hasStopSharingError?: boolean;
    hasLocationPublishError?: boolean;
};
/**
 * Monitor the current users own beacons
 * While current implementation only allows one live beacon per user per room
 * In future it will be possible to have multiple live beacons in one room
 * Select the latest expiry to display,
 * and kill all beacons on stop sharing
 */
export declare const useOwnLiveBeacons: (liveBeaconIds: BeaconIdentifier[]) => LiveBeaconsState;
export {};
