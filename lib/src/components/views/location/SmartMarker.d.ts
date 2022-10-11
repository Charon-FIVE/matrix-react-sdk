import React, { ReactNode } from 'react';
import maplibregl from 'maplibre-gl';
import { RoomMember } from 'matrix-js-sdk/src/matrix';
interface SmartMarkerProps {
    map: maplibregl.Map;
    geoUri: string;
    id?: string;
    roomMember?: RoomMember;
    useMemberColor?: boolean;
    tooltip?: ReactNode;
}
/**
 * Generic location marker
 */
declare const SmartMarker: React.FC<SmartMarkerProps>;
export default SmartMarker;
