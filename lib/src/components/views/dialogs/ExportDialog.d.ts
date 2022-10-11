import React from "react";
import { Room } from "matrix-js-sdk/src/matrix";
import { IDialogProps } from "./IDialogProps";
interface IProps extends IDialogProps {
    room: Room;
}
declare const ExportDialog: React.FC<IProps>;
export default ExportDialog;
