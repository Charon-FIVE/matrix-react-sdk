import { Room } from "matrix-js-sdk/src/models/room";
import React from "react";
import MatrixClientContext from "../../contexts/MatrixClientContext";
import { IOpts } from "../../createRoom";
import ResizeNotifier from "../../utils/ResizeNotifier";
interface IProps {
    space: Room;
    justCreatedOpts?: IOpts;
    resizeNotifier: ResizeNotifier;
    onJoinButtonClicked(): void;
    onRejectButtonClicked(): void;
}
interface IState {
    phase: Phase;
    firstRoomId?: string;
    showRightPanel: boolean;
    myMembership: string;
}
declare enum Phase {
    Landing = 0,
    PublicCreateRooms = 1,
    PublicShare = 2,
    PrivateScope = 3,
    PrivateInvite = 4,
    PrivateCreateRooms = 5,
    PrivateExistingRooms = 6
}
export default class SpaceRoomView extends React.PureComponent<IProps, IState> {
    static contextType: React.Context<import("matrix-js-sdk/src").MatrixClient>;
    context: React.ContextType<typeof MatrixClientContext>;
    private readonly creator;
    private readonly dispatcherRef;
    constructor(props: IProps, context: React.ContextType<typeof MatrixClientContext>);
    componentDidMount(): void;
    componentWillUnmount(): void;
    private onMyMembership;
    private onRightPanelStoreUpdate;
    private onAction;
    private goToFirstRoom;
    private renderBody;
    render(): JSX.Element;
}
export {};
