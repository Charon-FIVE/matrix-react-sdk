import React, { KeyboardEvent, ReactNode } from 'react';
import { Room } from 'matrix-js-sdk/src/models/room';
import { MatrixEvent } from 'matrix-js-sdk/src/models/event';
import { Relations } from "matrix-js-sdk/src/models/relations";
import RoomContext, { TimelineRenderingType } from "../../contexts/RoomContext";
import { Layout } from "../../settings/enums/Layout";
import { UnwrappedEventTile } from "../views/rooms/EventTile";
import LegacyCallEventGrouper from "./LegacyCallEventGrouper";
import { IScrollState } from "./ScrollPanel";
import ResizeNotifier from "../../utils/ResizeNotifier";
import { RoomPermalinkCreator } from "../../utils/permalinks/Permalinks";
import EditorStateTransfer from "../../utils/EditorStateTransfer";
export declare function shouldFormContinuation(prevEvent: MatrixEvent, mxEvent: MatrixEvent, showHiddenEvents: boolean, threadsEnabled: boolean, timelineRenderingType?: TimelineRenderingType): boolean;
interface IProps {
    events: MatrixEvent[];
    hidden?: boolean;
    backPaginating?: boolean;
    forwardPaginating?: boolean;
    highlightedEventId?: string;
    room?: Room;
    showUrlPreview?: boolean;
    readMarkerEventId?: string;
    readMarkerVisible?: boolean;
    ourUserId?: string;
    canBackPaginate?: boolean;
    showReadReceipts?: boolean;
    stickyBottom?: boolean;
    className: string;
    isTwelveHour?: boolean;
    alwaysShowTimestamps?: boolean;
    showReactions?: boolean;
    layout?: Layout;
    resizeNotifier: ResizeNotifier;
    permalinkCreator?: RoomPermalinkCreator;
    editState?: EditorStateTransfer;
    onScroll?(event: Event): void;
    onFillRequest?(backwards: boolean): Promise<boolean>;
    onUnfillRequest?(backwards: boolean, scrollToken: string): void;
    getRelationsForEvent?(eventId: string, relationType: string, eventType: string): Relations;
    hideThreadedMessages?: boolean;
    disableGrouping?: boolean;
    callEventGroupers: Map<string, LegacyCallEventGrouper>;
}
interface IState {
    ghostReadMarkers: string[];
    showTypingNotifications: boolean;
    hideSender: boolean;
}
export default class MessagePanel extends React.Component<IProps, IState> {
    static contextType: React.Context<import("./RoomView").IRoomState>;
    context: React.ContextType<typeof RoomContext>;
    static defaultProps: {
        disableGrouping: boolean;
    };
    private readonly readReceiptMap;
    private readReceiptsByEvent;
    private readReceiptsByUserId;
    private readonly _showHiddenEvents;
    private readonly threadsEnabled;
    private isMounted;
    private readMarkerNode;
    private whoIsTyping;
    private scrollPanel;
    private readonly showTypingNotificationsWatcherRef;
    private eventTiles;
    grouperKeyMap: WeakMap<MatrixEvent, string>;
    constructor(props: any, context: any);
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(prevProps: any, prevState: any): void;
    private shouldHideSender;
    private calculateRoomMembersCount;
    private onShowTypingNotificationsChange;
    getNodeForEventId(eventId: string): HTMLElement;
    getTileForEventId(eventId: string): UnwrappedEventTile;
    isAtBottom(): boolean;
    getScrollState(): IScrollState;
    getReadMarkerPosition(): number;
    scrollToTop(): void;
    scrollToBottom(): void;
    /**
     * Page up/down.
     *
     * @param {number} mult: -1 to page up, +1 to page down
     */
    scrollRelative(mult: number): void;
    /**
     * Scroll up/down in response to a scroll key
     *
     * @param {KeyboardEvent} ev: the keyboard event to handle
     */
    handleScrollKey(ev: KeyboardEvent): void;
    scrollToEvent(eventId: string, pixelOffset: number, offsetBase: number): void;
    scrollToEventIfNeeded(eventId: string): void;
    private isUnmounting;
    get showHiddenEvents(): boolean;
    shouldShowEvent(mxEv: MatrixEvent, forceHideEvents?: boolean): boolean;
    readMarkerForEvent(eventId: string, isLastEvent: boolean): ReactNode;
    private collectGhostReadMarker;
    private onGhostTransitionEnd;
    private getNextEventInfo;
    private get pendingEditItem();
    private getEventTiles;
    getTilesForEvent(prevEvent: MatrixEvent, mxEv: MatrixEvent, last?: boolean, isGrouped?: boolean, nextEvent?: MatrixEvent, nextEventWithTile?: MatrixEvent): ReactNode[];
    wantsDateSeparator(prevEvent: MatrixEvent, nextEventDate: Date): boolean;
    private getReadReceiptsForEvent;
    private getReadReceiptsByShownEvent;
    private collectEventTile;
    onHeightChanged: () => void;
    private onTypingShown;
    private onTypingHidden;
    updateTimelineMinHeight(): void;
    onTimelineReset(): void;
    render(): JSX.Element;
}
export {};
