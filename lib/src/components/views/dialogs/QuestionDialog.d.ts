import React from 'react';
import { IDialogProps } from "./IDialogProps";
export interface IQuestionDialogProps extends IDialogProps {
    title?: string;
    description?: React.ReactNode;
    extraButtons?: React.ReactNode;
    button?: string;
    buttonDisabled?: boolean;
    danger?: boolean;
    focus?: boolean;
    headerImage?: string;
    quitOnly?: boolean;
    fixedWidth?: boolean;
    className?: string;
    hasCancelButton?: boolean;
    cancelButton?: React.ReactNode;
}
export default class QuestionDialog extends React.Component<IQuestionDialogProps> {
    static defaultProps: Partial<IQuestionDialogProps>;
    private onOk;
    private onCancel;
    render(): JSX.Element;
}
