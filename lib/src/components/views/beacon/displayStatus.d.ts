import { BeaconLocationState } from "matrix-js-sdk/src/content-helpers";
export declare enum BeaconDisplayStatus {
    Loading = "Loading",
    Error = "Error",
    Stopped = "Stopped",
    Active = "Active"
}
export declare const getBeaconDisplayStatus: (isLive: boolean, latestLocationState?: BeaconLocationState, error?: Error, waitingToStart?: boolean) => BeaconDisplayStatus;
