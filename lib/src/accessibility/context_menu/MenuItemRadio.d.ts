import React from "react";
import { RovingAccessibleButton } from "../RovingTabIndex";
interface IProps extends React.ComponentProps<typeof RovingAccessibleButton> {
    label?: string;
    active: boolean;
}
export declare const MenuItemRadio: React.FC<IProps>;
export {};
