import React, { HTMLProps } from 'react';
import { Beacon } from 'matrix-js-sdk/src/matrix';
interface Props {
    beacon: Beacon;
}
declare const BeaconListItem: React.FC<Props & HTMLProps<HTMLLIElement>>;
export default BeaconListItem;
