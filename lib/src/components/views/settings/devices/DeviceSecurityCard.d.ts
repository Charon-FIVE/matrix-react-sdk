import React from 'react';
import { DeviceSecurityVariation } from './types';
interface Props {
    variation: DeviceSecurityVariation;
    heading: string;
    description: string | React.ReactNode;
    children?: React.ReactNode;
}
declare const DeviceSecurityCard: React.FC<Props>;
export default DeviceSecurityCard;
