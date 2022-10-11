import React from 'react';
import { DeviceSecurityVariation, DeviceWithVerification, DevicesDictionary } from './types';
interface Props {
    devices: DevicesDictionary;
    currentDeviceId: DeviceWithVerification['device_id'];
    goToFilteredList: (filter: DeviceSecurityVariation) => void;
}
declare const SecurityRecommendations: React.FC<Props>;
export default SecurityRecommendations;
