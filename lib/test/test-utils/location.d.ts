import { LocationAssetType } from "matrix-js-sdk/src/@types/location";
import { MatrixEvent } from "matrix-js-sdk/src/matrix";
export declare const makeLegacyLocationEvent: (geoUri: string) => MatrixEvent;
export declare const makeLocationEvent: (geoUri: string, assetType?: LocationAssetType) => MatrixEvent;
export declare const getMockGeolocationPositionError: (code: number, message: string) => GeolocationPositionError;
