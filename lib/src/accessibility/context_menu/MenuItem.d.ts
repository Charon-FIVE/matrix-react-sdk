import React from "react";
import { RovingAccessibleButton } from "../RovingTabIndex";
interface IProps extends React.ComponentProps<typeof RovingAccessibleButton> {
    label?: string;
    tooltip?: string;
}
export declare const MenuItem: React.FC<IProps>;
export {};
