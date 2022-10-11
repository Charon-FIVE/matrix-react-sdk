import React from 'react';
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { IDialogProps } from "./IDialogProps";
interface IProps extends IDialogProps {
    mxEvent: MatrixEvent;
}
interface IState {
    reason: string;
    busy: boolean;
    err?: string;
    nature?: ExtendedNature;
    ignoreUserToo: boolean;
}
declare enum Nature {
    Disagreement = "org.matrix.msc3215.abuse.nature.disagreement",
    Toxic = "org.matrix.msc3215.abuse.nature.toxic",
    Illegal = "org.matrix.msc3215.abuse.nature.illegal",
    Spam = "org.matrix.msc3215.abuse.nature.spam",
    Other = "org.matrix.msc3215.abuse.nature.other"
}
declare enum NonStandardValue {
    Admin = "non-standard.abuse.nature.admin"
}
declare type ExtendedNature = Nature | NonStandardValue;
export default class ReportEventDialog extends React.Component<IProps, IState> {
    private moderation?;
    constructor(props: IProps);
    private onIgnoreUserTooChanged;
    private onReasonChange;
    private onNatureChosen;
    private onCancel;
    private onSubmit;
    render(): JSX.Element;
}
export {};
