import React, { ReactNode } from 'react';
import maplibregl from 'maplibre-gl';
import { Beacon } from 'matrix-js-sdk/src/matrix';
interface Props {
    map: maplibregl.Map;
    beacon: Beacon;
    tooltip?: ReactNode;
}
/**
 * Updates a map SmartMarker with latest location from given beacon
 */
declare const BeaconMarker: React.FC<Props>;
export default BeaconMarker;
