import React from 'react';
import { Room } from 'matrix-js-sdk/src/matrix';
interface Props {
    roomId: Room['roomId'];
}
declare const RoomLiveShareWarning: React.FC<Props>;
export default RoomLiveShareWarning;
