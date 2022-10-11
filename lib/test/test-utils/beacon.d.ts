import { MockedObject } from "jest-mock";
import { MatrixClient, MatrixEvent, Beacon } from "matrix-js-sdk/src/matrix";
import { LocationAssetType } from "matrix-js-sdk/src/@types/location";
declare type InfoContentProps = {
    timeout: number;
    isLive?: boolean;
    assetType?: LocationAssetType;
    description?: string;
    timestamp?: number;
};
/**
 * Create an m.beacon_info event
 * all required properties are mocked
 * override with contentProps
 */
export declare const makeBeaconInfoEvent: (sender: string, roomId: string, contentProps?: Partial<InfoContentProps>, eventId?: string) => MatrixEvent;
declare type ContentProps = {
    geoUri: string;
    timestamp: number;
    beaconInfoId: string;
    description?: string;
};
/**
 * Create an m.beacon event
 * all required properties are mocked
 * override with contentProps
 */
export declare const makeBeaconEvent: (sender: string, contentProps?: Partial<ContentProps>, roomId?: string) => MatrixEvent;
/**
 * Create a mock geolocation position
 * defaults all required properties
 */
export declare const makeGeolocationPosition: ({ timestamp, coords }: {
    timestamp?: number;
    coords?: Partial<GeolocationCoordinates>;
}) => GeolocationPosition;
/**
 * Creates a basic mock of Geolocation
 * sets navigator.geolocation to the mock
 * and returns mock
 */
export declare const mockGeolocation: () => MockedObject<Geolocation>;
/**
 * Creates a mock watchPosition implementation
 * that calls success callback at the provided delays
 * ```
 * geolocation.watchPosition.mockImplementation([0, 1000, 5000, 50])
 * ```
 * will call the provided handler with a mock position at
 * next tick, 1000ms, 6000ms, 6050ms
 *
 * to produce errors provide an array of error codes
 * that will be applied to the delay with the same index
 * eg:
 * ```
 * // return two good positions, then a permission denied error
 * geolocation.watchPosition.mockImplementation(watchPositionMockImplementation(
 *      [0, 1000, 3000], [0, 0, 1]),
 * );
 * ```
 * See for error codes: https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPositionError
 */
export declare const watchPositionMockImplementation: (delays: number[], errorCodes?: number[]) => (callback: PositionCallback, error: PositionErrorCallback) => void;
/**
 * Creates a room with beacon events
 * sets given locations on beacons
 * returns beacons
 */
export declare const makeRoomWithBeacons: (roomId: string, mockClient: MockedObject<MatrixClient>, beaconInfoEvents: MatrixEvent[], locationEvents?: MatrixEvent[]) => Beacon[];
export {};
