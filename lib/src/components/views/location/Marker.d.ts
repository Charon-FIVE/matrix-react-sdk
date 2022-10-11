import React, { ReactNode } from 'react';
import { RoomMember } from 'matrix-js-sdk/src/matrix';
interface Props {
    id?: string;
    roomMember?: RoomMember;
    useMemberColor?: boolean;
    tooltip?: ReactNode;
}
/**
 * Generic location marker
 */
declare const Marker: React.ForwardRefExoticComponent<Props & React.RefAttributes<HTMLDivElement>>;
export default Marker;
