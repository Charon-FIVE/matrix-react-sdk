import React from 'react';
import { DeviceTileProps } from './DeviceTile';
interface Props extends DeviceTileProps {
    isSelected: boolean;
    onClick: () => void;
}
declare const SelectableDeviceTile: React.FC<Props>;
export default SelectableDeviceTile;
