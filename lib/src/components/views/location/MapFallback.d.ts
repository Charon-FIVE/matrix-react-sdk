import React from 'react';
interface Props extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
    isLoading?: boolean;
    children?: React.ReactNode | React.ReactNodeArray;
}
declare const MapFallback: React.FC<Props>;
export default MapFallback;
