import React from 'react';
import { RoomMember } from "matrix-js-sdk/src/models/room-member";
interface IProps {
    member: RoomMember;
    showPresence?: boolean;
}
interface IState {
    isRoomEncrypted: boolean;
    e2eStatus: string;
}
export default class MemberTile extends React.Component<IProps, IState> {
    private userLastModifiedTime;
    private memberLastModifiedTime;
    static defaultProps: {
        showPresence: boolean;
    };
    constructor(props: any);
    componentDidMount(): void;
    componentWillUnmount(): void;
    private onRoomStateEvents;
    private onUserTrustStatusChanged;
    private onDeviceVerificationChanged;
    private updateE2EStatus;
    shouldComponentUpdate(nextProps: IProps, nextState: IState): boolean;
    private onClick;
    private getDisplayName;
    private getPowerLabel;
    render(): JSX.Element;
}
export {};
