import { Beacon } from 'matrix-js-sdk/src/matrix';
import React, { HTMLProps } from 'react';
import { BeaconDisplayStatus } from './displayStatus';
interface Props {
    displayStatus: BeaconDisplayStatus;
    className?: string;
    beacon?: Beacon;
    withIcon?: boolean;
}
/**
 * Wraps BeaconStatus with more capabilities
 * for errors and actions available for users own live beacons
 */
declare const OwnBeaconStatus: React.FC<Props & HTMLProps<HTMLDivElement>>;
export default OwnBeaconStatus;
