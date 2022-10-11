import React from "react";
import { DeviceWithVerification } from "./types";
export interface DeviceTileProps {
    device: DeviceWithVerification;
    children?: React.ReactNode;
    onClick?: () => void;
}
declare const DeviceTile: React.FC<DeviceTileProps>;
export default DeviceTile;
