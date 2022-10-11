import React from 'react';
import { IDialogProps } from "./IDialogProps";
interface IProps extends IDialogProps {
    feature?: string;
}
declare const FeedbackDialog: React.FC<IProps>;
export default FeedbackDialog;
