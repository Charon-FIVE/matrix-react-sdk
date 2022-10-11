import React from "react";
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { IDialogProps } from "../views/dialogs/IDialogProps";
interface IProps extends IDialogProps {
    mxEvent: MatrixEvent;
}
interface IState {
    isEditing: boolean;
}
export default class ViewSource extends React.Component<IProps, IState> {
    constructor(props: IProps);
    private onBack;
    private onEdit;
    private viewSourceContent;
    private editSourceContent;
    private canSendStateEvent;
    render(): JSX.Element;
}
export {};
