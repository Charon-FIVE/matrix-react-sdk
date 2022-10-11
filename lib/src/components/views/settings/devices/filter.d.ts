import { DeviceWithVerification, DeviceSecurityVariation } from "./types";
declare type DeviceFilterCondition = (device: DeviceWithVerification) => boolean;
export declare const INACTIVE_DEVICE_AGE_MS = 7776000000;
export declare const INACTIVE_DEVICE_AGE_DAYS: number;
export declare const isDeviceInactive: DeviceFilterCondition;
export declare const filterDevicesBySecurityRecommendation: (devices: DeviceWithVerification[], securityVariations: DeviceSecurityVariation[]) => DeviceWithVerification[];
export {};
