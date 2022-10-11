import React, { ReactNode } from 'react';
import maplibregl from 'maplibre-gl';
import { Bounds } from '../../../utils/beacon/bounds';
interface MapProps {
    id: string;
    interactive?: boolean;
    /**
     * set map center to geoUri coords
     * Center will only be set to valid geoUri
     * this prop is only simply diffed by useEffect, so to trigger *recentering* of the same geoUri
     * append the uri with a var not used by the geoUri spec
     * eg a timestamp: `geo:54,42;mxTs=123`
     */
    centerGeoUri?: string;
    bounds?: Bounds;
    className?: string;
    onClick?: () => void;
    onError?: (error: Error) => void;
    children?: (renderProps: {
        map: maplibregl.Map;
    }) => ReactNode;
}
declare const Map: React.FC<MapProps>;
export default Map;
