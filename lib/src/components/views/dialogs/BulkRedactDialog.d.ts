import React from 'react';
import { MatrixClient } from 'matrix-js-sdk/src/client';
import { RoomMember } from 'matrix-js-sdk/src/models/room-member';
import { Room } from 'matrix-js-sdk/src/models/room';
import { IDialogProps } from "./IDialogProps";
interface IBulkRedactDialogProps extends IDialogProps {
    matrixClient: MatrixClient;
    room: Room;
    member: RoomMember;
}
declare const BulkRedactDialog: React.FC<IBulkRedactDialogProps>;
export default BulkRedactDialog;
