import React from 'react';
import { LocationShareError } from '../../../utils/location';
export interface MapErrorProps {
    error: LocationShareError;
    onFinished?: () => void;
    isMinimised?: boolean;
    className?: string;
    onClick?: () => void;
}
export declare const MapError: React.FC<MapErrorProps>;
