import React from 'react';
import { Room } from 'matrix-js-sdk/src/models/room';
import { RoomMember } from 'matrix-js-sdk/src/models/room-member';
export declare enum PillType {
    UserMention = "TYPE_USER_MENTION",
    RoomMention = "TYPE_ROOM_MENTION",
    AtRoomMention = "TYPE_AT_ROOM_MENTION"
}
interface IProps {
    type?: PillType;
    url?: string;
    inMessage?: boolean;
    room?: Room;
    shouldShowPillAvatar?: boolean;
}
interface IState {
    resourceId: string;
    pillType: string;
    member?: RoomMember;
    room?: Room;
    hover: boolean;
}
export default class Pill extends React.Component<IProps, IState> {
    private unmounted;
    private matrixClient;
    static roomNotifPos(text: string): number;
    static roomNotifLen(): number;
    constructor(props: IProps);
    UNSAFE_componentWillReceiveProps(nextProps: IProps): Promise<void>;
    componentDidMount(): void;
    componentWillUnmount(): void;
    private onMouseOver;
    private onMouseLeave;
    private doProfileLookup;
    private onUserPillClicked;
    render(): JSX.Element;
}
export {};
