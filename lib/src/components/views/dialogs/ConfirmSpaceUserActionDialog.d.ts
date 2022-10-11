import React, { ComponentProps } from 'react';
import { Room } from "matrix-js-sdk/src/models/room";
import ConfirmUserActionDialog from "./ConfirmUserActionDialog";
declare type BaseProps = ComponentProps<typeof ConfirmUserActionDialog>;
interface IProps extends Omit<BaseProps, "matrixClient" | "children" | "onFinished"> {
    space: Room;
    allLabel: string;
    specificLabel: string;
    noneLabel?: string;
    warningMessage?: string;
    onFinished(success: boolean, reason?: string, rooms?: Room[]): void;
    spaceChildFilter?(child: Room): boolean;
}
declare const ConfirmSpaceUserActionDialog: React.FC<IProps>;
export default ConfirmSpaceUserActionDialog;
