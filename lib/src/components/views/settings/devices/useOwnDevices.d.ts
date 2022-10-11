import { DevicesDictionary } from "./types";
export declare enum OwnDevicesError {
    Unsupported = "Unsupported",
    Default = "Default"
}
declare type DevicesState = {
    devices: DevicesDictionary;
    currentDeviceId: string;
    isLoading: boolean;
    error?: OwnDevicesError;
};
export declare const useOwnDevices: () => DevicesState;
export {};
