import React from 'react';
import { IEventRelation, MatrixEvent } from 'matrix-js-sdk/src/models/event';
import { EventTimelineSet } from 'matrix-js-sdk/src/models/event-timeline-set';
import { Room } from 'matrix-js-sdk/src/models/room';
import { Thread } from 'matrix-js-sdk/src/models/thread';
import ResizeNotifier from '../../../utils/ResizeNotifier';
import { RoomPermalinkCreator } from '../../../utils/permalinks/Permalinks';
import { Layout } from '../../../settings/enums/Layout';
import { E2EStatus } from '../../../utils/ShieldUtils';
import EditorStateTransfer from '../../../utils/EditorStateTransfer';
import { TimelineRenderingType } from '../../../contexts/RoomContext';
interface IProps {
    room: Room;
    onClose: () => void;
    resizeNotifier: ResizeNotifier;
    permalinkCreator?: RoomPermalinkCreator;
    e2eStatus?: E2EStatus;
    classNames?: string;
    timelineSet?: EventTimelineSet;
    timelineRenderingType?: TimelineRenderingType;
    showComposer?: boolean;
    composerRelation?: IEventRelation;
}
interface IState {
    thread?: Thread;
    editState?: EditorStateTransfer;
    replyToEvent?: MatrixEvent;
    initialEventId?: string;
    isInitialEventHighlighted?: boolean;
    layout: Layout;
    atEndOfLiveTimeline: boolean;
    narrow: boolean;
    showReadReceipts?: boolean;
}
export default class TimelineCard extends React.Component<IProps, IState> {
    static contextType: React.Context<import("../../structures/RoomView").IRoomState>;
    private dispatcherRef;
    private layoutWatcherRef;
    private timelinePanel;
    private card;
    private roomStoreToken;
    private readReceiptsSettingWatcher;
    constructor(props: IProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    private onRoomViewStoreUpdate;
    private onAction;
    private onScroll;
    private onMeasurement;
    private jumpToLiveTimeline;
    private renderTimelineCardHeader;
    render(): JSX.Element;
}
export {};
