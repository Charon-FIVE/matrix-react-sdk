import React from 'react';
export declare const DEFAULT_DURATION_MS: number;
interface Props {
    timeout: number;
    onChange: (timeout: number) => void;
}
declare const LiveDurationDropdown: React.FC<Props>;
export default LiveDurationDropdown;
