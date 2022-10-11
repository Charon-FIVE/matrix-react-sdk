import React from "react";
import { RovingAccessibleButton } from "../RovingTabIndex";
interface IProps extends React.ComponentProps<typeof RovingAccessibleButton> {
    label?: string;
    active: boolean;
}
export declare const MenuItemCheckbox: React.FC<IProps>;
export {};
