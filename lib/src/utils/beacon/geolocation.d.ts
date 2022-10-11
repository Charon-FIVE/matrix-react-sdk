export declare enum GeolocationError {
    Unavailable = "Unavailable",
    PermissionDenied = "PermissionDenied",
    PositionUnavailable = "PositionUnavailable",
    Timeout = "Timeout",
    Default = "Default"
}
/**
 * Maps GeolocationPositionError to our GeolocationError enum
 */
export declare const mapGeolocationError: (error: GeolocationPositionError | Error) => GeolocationError;
export declare type GenericPosition = {
    latitude: number;
    longitude: number;
    altitude?: number;
    accuracy?: number;
    timestamp: number;
};
export declare type TimedGeoUri = {
    geoUri: string;
    timestamp: number;
};
export declare const genericPositionFromGeolocation: (geoPosition: GeolocationPosition) => GenericPosition;
export declare const getGeoUri: (position: GenericPosition) => string;
export declare const mapGeolocationPositionToTimedGeo: (position: GeolocationPosition) => TimedGeoUri;
/**
 * Gets current position, returns a promise
 * @returns Promise<GeolocationPosition>
 */
export declare const getCurrentPosition: () => Promise<GeolocationPosition>;
export declare type ClearWatchCallback = () => void;
export declare const watchPosition: (onWatchPosition: PositionCallback, onWatchPositionError: (error: GeolocationError) => void) => ClearWatchCallback;
