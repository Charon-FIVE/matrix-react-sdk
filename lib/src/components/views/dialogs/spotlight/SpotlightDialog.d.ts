import React from "react";
import { IDialogProps } from "../IDialogProps";
interface IProps extends IDialogProps {
    initialText?: string;
    initialFilter?: Filter;
}
export declare enum Filter {
    People = 0,
    PublicRooms = 1
}
export declare const useWebSearchMetrics: (numResults: number, queryLength: number, viaSpotlight: boolean) => void;
declare const RovingSpotlightDialog: React.FC<IProps>;
export default RovingSpotlightDialog;
