import React from 'react';
import { Beacon } from 'matrix-js-sdk/src/matrix';
interface Props {
    beacons: Beacon[];
    requestClose: () => void;
    onBeaconClick: (beacon: Beacon) => void;
}
declare const DialogSidebar: React.FC<Props>;
export default DialogSidebar;
