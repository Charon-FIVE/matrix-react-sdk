import React from 'react';
import { MatrixEvent } from 'matrix-js-sdk/src/models/event';
import { Relations } from 'matrix-js-sdk/src/models/relations';
import { RoomPermalinkCreator } from '../../../utils/permalinks/Permalinks';
import { IPosition, ChevronFace } from '../../structures/ContextMenu';
import RoomContext from '../../../contexts/RoomContext';
import { GetRelationsForEvent, IEventTileOps } from "../rooms/EventTile";
interface IProps extends IPosition {
    chevronFace: ChevronFace;
    mxEvent: MatrixEvent;
    eventTileOps?: IEventTileOps;
    permalinkCreator?: RoomPermalinkCreator;
    collapseReplyChain?(): void;
    onFinished(): void;
    onCloseDialog?(): void;
    rightClick?: boolean;
    reactions?: Relations;
    link?: string;
    getRelationsForEvent?: GetRelationsForEvent;
}
interface IState {
    canRedact: boolean;
    canPin: boolean;
    reactionPickerDisplayed: boolean;
}
export default class MessageContextMenu extends React.Component<IProps, IState> {
    static contextType: React.Context<import("../../structures/RoomView").IRoomState>;
    context: React.ContextType<typeof RoomContext>;
    private reactButtonRef;
    constructor(props: IProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    private checkPermissions;
    private isPinned;
    private canEndPoll;
    private onResendReactionsClick;
    private onJumpToRelatedEventClick;
    private onReportEventClick;
    private onViewSourceClick;
    private onRedactClick;
    private onForwardClick;
    private onPinClick;
    private closeMenu;
    private onUnhidePreviewClick;
    private onQuoteClick;
    private onShareClick;
    private onCopyLinkClick;
    private onCollapseReplyChainClick;
    private onCopyClick;
    private onEditClick;
    private onReplyClick;
    private onReactClick;
    private onCloseReactionPicker;
    private onEndPollClick;
    private getReactions;
    private getUnsentReactions;
    private viewInRoom;
    render(): JSX.Element;
}
export {};
