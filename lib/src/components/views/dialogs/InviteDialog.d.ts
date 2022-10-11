import React from 'react';
import { RoomMember } from "matrix-js-sdk/src/models/room-member";
import { MatrixCall } from 'matrix-js-sdk/src/webrtc/call';
import { Member } from "../../../utils/direct-messages";
import { AnyInviteKind } from './InviteDialogTypes';
interface IRecentUser {
    userId: string;
    user: RoomMember;
    lastActive: number;
}
declare enum TabId {
    UserDirectory = "users",
    DialPad = "dialpad"
}
interface IInviteDialogProps {
    onFinished: (success: boolean) => void;
    kind: AnyInviteKind;
    roomId: string;
    call: MatrixCall;
    initialText: string;
}
interface IInviteDialogState {
    targets: Member[];
    filterText: string;
    recents: {
        user: Member;
        userId: string;
    }[];
    numRecentsShown: number;
    suggestions: {
        user: Member;
        userId: string;
    }[];
    numSuggestionsShown: number;
    serverResultsMixin: {
        user: Member;
        userId: string;
    }[];
    threepidResultsMixin: {
        user: Member;
        userId: string;
    }[];
    canUseIdentityServer: boolean;
    tryingIdentityServer: boolean;
    consultFirst: boolean;
    dialPadValue: string;
    currentTabId: TabId;
    busy: boolean;
    errorText: string;
}
export default class InviteDialog extends React.PureComponent<IInviteDialogProps, IInviteDialogState> {
    static defaultProps: {
        kind: string;
        initialText: string;
    };
    private closeCopiedTooltip;
    private debounceTimer;
    private editorRef;
    private numberEntryFieldRef;
    private unmounted;
    constructor(props: any);
    componentDidMount(): void;
    componentWillUnmount(): void;
    private onConsultFirstChange;
    static buildRecents(excludedTargetIds: Set<string>): IRecentUser[];
    private buildSuggestions;
    private shouldAbortAfterInviteError;
    private convertFilter;
    private startDm;
    private inviteUsers;
    private transferCall;
    private onKeyDown;
    private onCancel;
    private updateSuggestions;
    private updateFilter;
    private showMoreRecents;
    private showMoreSuggestions;
    private toggleMember;
    private removeMember;
    private onPaste;
    private onClickInputArea;
    private onUseDefaultIdentityServerClick;
    private onManageSettingsClick;
    private renderSection;
    private renderEditor;
    private renderIdentityServerWarning;
    private onDialFormSubmit;
    private onDialChange;
    private onDigitPress;
    private onDeletePress;
    private onTabChange;
    private onLinkClick;
    private get screenName();
    render(): JSX.Element;
}
export {};
