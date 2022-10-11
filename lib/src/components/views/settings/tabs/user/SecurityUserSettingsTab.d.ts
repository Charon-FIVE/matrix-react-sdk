import React from 'react';
interface IIgnoredUserProps {
    userId: string;
    onUnignored: (userId: string) => void;
    inProgress: boolean;
}
export declare class IgnoredUser extends React.Component<IIgnoredUserProps> {
    private onUnignoreClicked;
    render(): JSX.Element;
}
interface IProps {
    closeSettingsFn: () => void;
}
interface IState {
    ignoredUserIds: string[];
    waitingUnignored: string[];
    managingInvites: boolean;
    invitedRoomIds: Set<string>;
}
export default class SecurityUserSettingsTab extends React.Component<IProps, IState> {
    private dispatcherRef;
    constructor(props: IProps);
    private onAction;
    componentDidMount(): void;
    componentWillUnmount(): void;
    private onMyMembership;
    private addInvitedRoom;
    private removeInvitedRoom;
    private onUserUnignored;
    private getInvitedRooms;
    private manageInvites;
    private onAcceptAllInvitesClicked;
    private onRejectAllInvitesClicked;
    private renderIgnoredUsers;
    private renderManageInvites;
    render(): JSX.Element;
}
export {};
