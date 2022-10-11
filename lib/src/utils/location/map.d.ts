import maplibregl from "maplibre-gl";
import { MatrixEvent } from "matrix-js-sdk/src/matrix";
export declare const createMap: (interactive: boolean, bodyId: string, onError: (error: Error) => void) => maplibregl.Map;
export declare const createMarker: (coords: GeolocationCoordinates, element: HTMLElement) => maplibregl.Marker;
export declare const makeMapSiteLink: (coords: GeolocationCoordinates) => string;
export declare const createMapSiteLinkFromEvent: (event: MatrixEvent) => string;
