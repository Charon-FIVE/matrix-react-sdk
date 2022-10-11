import React from 'react';
import { MatrixEvent } from 'matrix-js-sdk/src/models/event';
import { RoomMember } from 'matrix-js-sdk/src/models/room-member';
interface IProps {
    roomId: string;
    searchQuery: string;
    onClose(): void;
    onSearchQueryChanged: (query: string) => void;
}
interface IState {
    loading: boolean;
    members: Array<RoomMember>;
    filteredJoinedMembers: Array<RoomMember>;
    filteredInvitedMembers: Array<RoomMember | MatrixEvent>;
    canInvite: boolean;
    truncateAtJoined: number;
    truncateAtInvited: number;
}
export default class MemberList extends React.Component<IProps, IState> {
    private showPresence;
    private mounted;
    private collator;
    private sortNames;
    constructor(props: any);
    UNSAFE_componentWillMount(): void;
    private listenForMembersChanges;
    componentWillUnmount(): void;
    /**
     * If lazy loading is enabled, either:
     * show a spinner and load the members if the user is joined,
     * or show the members available so far if the user is invited
     */
    private showMembersAccordingToMembershipWithLL;
    private get canInvite();
    private getMembersState;
    private onUserPresenceChange;
    private onRoom;
    private onMyMembership;
    private onRoomStateUpdate;
    private onRoomMemberName;
    private onRoomStateEvent;
    private updateList;
    private updateListNow;
    private getMembersWithUser;
    private roomMembers;
    private createOverflowTileJoined;
    private createOverflowTileInvited;
    private createOverflowTile;
    private showMoreJoinedMemberList;
    private showMoreInvitedMemberList;
    /**
     * SHOULD ONLY BE USED BY TESTS
     */
    memberString(member: RoomMember): string;
    private memberSort;
    private onSearchQueryChanged;
    private onPending3pidInviteClick;
    private filterMembers;
    private getPending3PidInvites;
    private makeMemberTiles;
    private getChildrenJoined;
    private getChildCountJoined;
    private getChildrenInvited;
    private getChildCountInvited;
    render(): JSX.Element;
    private onInviteButtonClick;
}
export {};
