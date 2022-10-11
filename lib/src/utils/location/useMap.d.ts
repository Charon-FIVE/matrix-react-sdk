import { Map as MapLibreMap } from 'maplibre-gl';
interface UseMapProps {
    bodyId: string;
    onError: (error: Error) => void;
    interactive?: boolean;
}
/**
 * Create a map instance
 * Add listeners for errors
 * Make sure `onError` has a stable reference
 * As map is recreated on changes to it
 */
export declare const useMap: ({ interactive, bodyId, onError, }: UseMapProps) => MapLibreMap | undefined;
export {};
