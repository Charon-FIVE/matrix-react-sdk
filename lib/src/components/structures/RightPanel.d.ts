import React from 'react';
import { Room } from "matrix-js-sdk/src/models/room";
import { RightPanelPhases } from '../../stores/right-panel/RightPanelStorePhases';
import MatrixClientContext from "../../contexts/MatrixClientContext";
import ResizeNotifier from "../../utils/ResizeNotifier";
import { RoomPermalinkCreator } from '../../utils/permalinks/Permalinks';
import { E2EStatus } from '../../utils/ShieldUtils';
import { IRightPanelCard, IRightPanelCardState } from '../../stores/right-panel/RightPanelStoreIPanelState';
interface IProps {
    room?: Room;
    overwriteCard?: IRightPanelCard;
    resizeNotifier: ResizeNotifier;
    permalinkCreator?: RoomPermalinkCreator;
    e2eStatus?: E2EStatus;
}
interface IState {
    phase?: RightPanelPhases;
    searchQuery: string;
    cardState?: IRightPanelCardState;
}
export default class RightPanel extends React.Component<IProps, IState> {
    static contextType: React.Context<import("matrix-js-sdk/src").MatrixClient>;
    context: React.ContextType<typeof MatrixClientContext>;
    constructor(props: any, context: any);
    private readonly delayedUpdate;
    componentDidMount(): void;
    componentWillUnmount(): void;
    static getDerivedStateFromProps(props: IProps): Partial<IState>;
    private onRoomStateMember;
    private onRightPanelStoreUpdate;
    private onClose;
    private onSearchQueryChanged;
    render(): JSX.Element;
}
export {};
