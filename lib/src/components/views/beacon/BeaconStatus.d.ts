import React, { HTMLProps } from 'react';
import { Beacon } from 'matrix-js-sdk/src/matrix';
import { BeaconDisplayStatus } from './displayStatus';
interface Props {
    displayStatus: BeaconDisplayStatus;
    displayLiveTimeRemaining?: boolean;
    withIcon?: boolean;
    beacon?: Beacon;
    label?: string;
}
declare const BeaconStatus: React.FC<Props & HTMLProps<HTMLDivElement>>;
export default BeaconStatus;
