import React from 'react';
import { Thread } from 'matrix-js-sdk/src/models/thread';
import { Room } from 'matrix-js-sdk/src/models/room';
import { MatrixEvent } from 'matrix-js-sdk/src/models/event';
import ResizeNotifier from '../../utils/ResizeNotifier';
import { RoomPermalinkCreator } from '../../utils/permalinks/Permalinks';
import { Layout } from '../../settings/enums/Layout';
import { E2EStatus } from '../../utils/ShieldUtils';
import EditorStateTransfer from '../../utils/EditorStateTransfer';
import RoomContext from '../../contexts/RoomContext';
interface IProps {
    room: Room;
    onClose: () => void;
    resizeNotifier: ResizeNotifier;
    mxEvent: MatrixEvent;
    permalinkCreator?: RoomPermalinkCreator;
    e2eStatus?: E2EStatus;
    initialEvent?: MatrixEvent;
    isInitialEventHighlighted?: boolean;
    initialEventScrollIntoView?: boolean;
}
interface IState {
    thread?: Thread;
    layout: Layout;
    editState?: EditorStateTransfer;
    replyToEvent?: MatrixEvent;
    narrow: boolean;
}
export default class ThreadView extends React.Component<IProps, IState> {
    static contextType: React.Context<import("./RoomView").IRoomState>;
    context: React.ContextType<typeof RoomContext>;
    private dispatcherRef;
    private readonly layoutWatcherRef;
    private timelinePanel;
    private card;
    constructor(props: IProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(prevProps: any): void;
    private onAction;
    private setupThread;
    private onNewThread;
    private updateThread;
    private resetJumpToEvent;
    private onMeasurement;
    private onKeyDown;
    private nextBatch;
    private onPaginationRequest;
    private onFileDrop;
    private get threadRelation();
    private renderThreadViewHeader;
    render(): JSX.Element;
}
export {};
