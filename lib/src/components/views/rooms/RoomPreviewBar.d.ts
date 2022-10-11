import React from "react";
import { Room } from "matrix-js-sdk/src/models/room";
import { MatrixError } from "matrix-js-sdk/src/http-api";
import { IOOBData } from "../../../stores/ThreepidInviteStore";
interface IProps {
    inviterName?: string;
    invitedEmail?: string;
    oobData?: IOOBData;
    signUrl?: string;
    error?: MatrixError;
    canPreview?: boolean;
    previewLoading?: boolean;
    room?: Room;
    loading?: boolean;
    joining?: boolean;
    rejecting?: boolean;
    roomAlias?: string;
    onJoinClick?(): void;
    onRejectClick?(): void;
    onRejectAndIgnoreClick?(): void;
    onForgetClick?(): void;
}
interface IState {
    busy: boolean;
    accountEmails?: string[];
    invitedEmailMxid?: string;
    threePidFetchError?: MatrixError;
}
export default class RoomPreviewBar extends React.Component<IProps, IState> {
    static defaultProps: {
        onJoinClick(): void;
    };
    constructor(props: any);
    componentDidMount(): void;
    componentDidUpdate(prevProps: any, prevState: any): void;
    private checkInvitedEmail;
    private getMessageCase;
    private getKickOrBanInfo;
    private joinRule;
    private getMyMember;
    private getInviteMember;
    private isDMInvite;
    private makeScreenAfterLogin;
    private onLoginClick;
    private onRegisterClick;
    render(): JSX.Element;
}
export {};
