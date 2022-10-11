import React, { ReactNode } from 'react';
import { RoomMember } from "matrix-js-sdk/src/models/room-member";
interface IProps {
    member: RoomMember;
    action: string;
    title: string;
    askReason?: boolean;
    danger?: boolean;
    children?: ReactNode;
    className?: string;
    roomId?: string;
    onFinished: (success: boolean, reason?: string) => void;
}
interface IState {
    reason: string;
}
export default class ConfirmUserActionDialog extends React.Component<IProps, IState> {
    static defaultProps: {
        danger: boolean;
        askReason: boolean;
    };
    constructor(props: IProps);
    private onOk;
    private onCancel;
    private onReasonChange;
    render(): JSX.Element;
}
export {};
