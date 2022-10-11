import { Room } from 'matrix-js-sdk/src/models/room';
import React from 'react';
interface LegacyCallViewHeaderProps {
    pipMode: boolean;
    callRooms?: Room[];
    onPipMouseDown: (event: React.MouseEvent<Element, MouseEvent>) => void;
    onExpand?: () => void;
    onPin?: () => void;
    onMaximize?: () => void;
}
declare const LegacyCallViewHeader: React.FC<LegacyCallViewHeaderProps>;
export default LegacyCallViewHeader;
