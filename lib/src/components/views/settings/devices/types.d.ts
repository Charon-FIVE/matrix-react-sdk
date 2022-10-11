import { IMyDevice } from "matrix-js-sdk/src/matrix";
export declare type DeviceWithVerification = IMyDevice & {
    isVerified: boolean | null;
};
export declare type DevicesDictionary = Record<DeviceWithVerification['device_id'], DeviceWithVerification>;
export declare enum DeviceSecurityVariation {
    Verified = "Verified",
    Unverified = "Unverified",
    Inactive = "Inactive"
}
