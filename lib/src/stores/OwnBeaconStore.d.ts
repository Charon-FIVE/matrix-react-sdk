import { Beacon, BeaconIdentifier, Room } from "matrix-js-sdk/src/matrix";
import { MBeaconInfoEventContent } from "matrix-js-sdk/src/@types/beacon";
import { ActionPayload } from "../dispatcher/payloads";
import { AsyncStoreWithClient } from "./AsyncStoreWithClient";
export declare enum OwnBeaconStoreEvent {
    LivenessChange = "OwnBeaconStore.LivenessChange",
    MonitoringLivePosition = "OwnBeaconStore.MonitoringLivePosition",
    LocationPublishError = "LocationPublishError",
    BeaconUpdateError = "BeaconUpdateError"
}
declare type OwnBeaconStoreState = {
    beacons: Map<BeaconIdentifier, Beacon>;
    beaconLocationPublishErrorCounts: Map<BeaconIdentifier, number>;
    beaconUpdateErrors: Map<BeaconIdentifier, Error>;
    beaconsByRoomId: Map<Room['roomId'], Set<BeaconIdentifier>>;
    liveBeaconIds: BeaconIdentifier[];
};
export declare class OwnBeaconStore extends AsyncStoreWithClient<OwnBeaconStoreState> {
    private static readonly internalInstance;
    readonly beacons: Map<string, Beacon>;
    readonly beaconsByRoomId: Map<string, Set<string>>;
    /**
     * Track over the wire errors for published positions
     * Counts consecutive wire errors per beacon
     * Reset on successful publish of location
     */
    readonly beaconLocationPublishErrorCounts: Map<string, number>;
    readonly beaconUpdateErrors: Map<string, Error>;
    /**
     * ids of live beacons
     * ordered by creation time descending
     */
    private liveBeaconIds;
    private locationInterval;
    private geolocationError;
    private clearPositionWatch;
    /**
     * Track when the last position was published
     * So we can manually get position on slow interval
     * when the target is stationary
     */
    private lastPublishedPositionTimestamp;
    constructor();
    static get instance(): OwnBeaconStore;
    /**
     * True when we have live beacons
     * and geolocation.watchPosition is active
     */
    get isMonitoringLiveLocation(): boolean;
    protected onNotReady(): Promise<void>;
    protected onReady(): Promise<void>;
    protected onAction(payload: ActionPayload): Promise<void>;
    hasLiveBeacons: (roomId?: string) => boolean;
    /**
     * Some live beacon has a wire error
     * Optionally filter by room
     */
    hasLocationPublishErrors: (roomId?: string) => boolean;
    /**
     * If a beacon has failed to publish position
     * past the allowed consecutive failure count (BAIL_AFTER_CONSECUTIVE_ERROR_COUNT)
     * Then consider it to have an error
     */
    beaconHasLocationPublishError: (beaconId: string) => boolean;
    resetLocationPublishError: (beaconId: string) => void;
    getLiveBeaconIds: (roomId?: string) => string[];
    getLiveBeaconIdsWithLocationPublishError: (roomId?: string) => string[];
    getBeaconById: (beaconId: string) => Beacon | undefined;
    stopBeacon: (beaconIdentifier: string) => Promise<void>;
    /**
     * Listeners
     */
    private onNewBeacon;
    /**
     * This will be called when a beacon is replaced
     */
    private onUpdateBeacon;
    private onDestroyBeacon;
    private onBeaconLiveness;
    /**
     * Check for changes in membership in rooms with beacons
     * and stop monitoring beacons in rooms user is no longer member of
     */
    private onRoomStateMembers;
    /**
     * State management
     */
    /**
     * Live beacon ids that do not have wire errors
     */
    private get healthyLiveBeaconIds();
    private initialiseBeaconState;
    private addBeacon;
    /**
     * Remove listeners for a given beacon
     * remove from state
     * and update liveness if changed
     */
    private removeBeacon;
    private checkLiveness;
    createLiveBeacon: (roomId: Room['roomId'], beaconInfoContent: MBeaconInfoEventContent) => Promise<void>;
    /**
     * Geolocation
     */
    private togglePollingLocation;
    private startPollingLocation;
    private stopPollingLocation;
    private onWatchedPosition;
    private onGeolocationError;
    /**
     * Gets the current location
     * (as opposed to using watched location)
     * and publishes it to all live beacons
     */
    private publishCurrentLocationToBeacons;
    /**
     * MatrixClient api
     */
    /**
     * Updates beacon with provided content update
     * Records error in beaconUpdateErrors
     * rethrows
     */
    private updateBeaconEvent;
    /**
     * Sends m.location events to all live beacons
     * Sets last published beacon
     */
    private publishLocationToBeacons;
    private debouncedPublishLocationToBeacons;
    /**
     * Sends m.location event to referencing given beacon
     */
    private sendLocationToBeacon;
    /**
     * Manage beacon wire error count
     * - clear count for beacon when not error
     * - increment count for beacon when is error
     * - emit if beacon error count crossed threshold
     */
    private incrementBeaconLocationPublishErrorCount;
}
export {};
