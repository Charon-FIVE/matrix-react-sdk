import React from 'react';
import { DevicesDictionary, DeviceSecurityVariation, DeviceWithVerification } from './types';
interface Props {
    devices: DevicesDictionary;
    expandedDeviceIds: DeviceWithVerification['device_id'][];
    filter?: DeviceSecurityVariation;
    onFilterChange: (filter: DeviceSecurityVariation | undefined) => void;
    onDeviceExpandToggle: (deviceId: DeviceWithVerification['device_id']) => void;
}
/**
 * Filtered list of devices
 * Sorted by latest activity descending
 */
export declare const FilteredDeviceList: React.ForwardRefExoticComponent<Props & React.RefAttributes<HTMLDivElement>>;
export {};
