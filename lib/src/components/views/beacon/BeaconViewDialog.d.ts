import React from 'react';
import { MatrixClient } from 'matrix-js-sdk/src/client';
import { Beacon, Room } from 'matrix-js-sdk/src/matrix';
import { IDialogProps } from "../dialogs/IDialogProps";
interface IProps extends IDialogProps {
    roomId: Room['roomId'];
    matrixClient: MatrixClient;
    initialFocusedBeacon?: Beacon;
}
/**
 * Dialog to view live beacons maximised
 */
declare const BeaconViewDialog: React.FC<IProps>;
export default BeaconViewDialog;
