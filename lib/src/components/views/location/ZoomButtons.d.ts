import React from 'react';
import maplibregl from 'maplibre-gl';
interface Props {
    map: maplibregl.Map;
}
declare const ZoomButtons: React.FC<Props>;
export default ZoomButtons;
