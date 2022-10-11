import React from 'react';
import { Room } from 'matrix-js-sdk/src/matrix';
import { CallType } from "matrix-js-sdk/src/webrtc/call";
import { E2EStatus } from '../../../utils/ShieldUtils';
import { IOOBData } from '../../../stores/ThreepidInviteStore';
import { SearchScope } from './SearchBar';
import { RightPanelPhases } from '../../../stores/right-panel/RightPanelStorePhases';
import RoomContext from "../../../contexts/RoomContext";
export interface ISearchInfo {
    searchTerm: string;
    searchScope: SearchScope;
    searchCount: number;
}
interface IProps {
    room: Room;
    oobData?: IOOBData;
    inRoom: boolean;
    onSearchClick: () => void;
    onInviteClick: () => void;
    onForgetClick: () => void;
    onCallPlaced: (type: CallType) => void;
    onAppsClick: () => void;
    e2eStatus: E2EStatus;
    appsShown: boolean;
    searchInfo: ISearchInfo;
    excludedRightPanelPhaseButtons?: Array<RightPanelPhases>;
    showButtons?: boolean;
    enableRoomOptionsMenu?: boolean;
}
interface IState {
    contextMenuPosition?: DOMRect;
    rightPanelOpen: boolean;
}
export default class RoomHeader extends React.Component<IProps, IState> {
    static defaultProps: {
        editing: boolean;
        inRoom: boolean;
        excludedRightPanelPhaseButtons: any[];
        showButtons: boolean;
        enableRoomOptionsMenu: boolean;
    };
    static contextType: React.Context<import("../../structures/RoomView").IRoomState>;
    context: React.ContextType<typeof RoomContext>;
    constructor(props: any, context: any);
    componentDidMount(): void;
    componentWillUnmount(): void;
    private onRightPanelStoreUpdate;
    private onRoomStateEvents;
    private onNotificationUpdate;
    private rateLimitedUpdate;
    private onContextMenuOpenClick;
    private onContextMenuCloseClick;
    private renderButtons;
    private renderName;
    render(): JSX.Element;
}
export {};
