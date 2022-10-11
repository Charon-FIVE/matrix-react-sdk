import React, { ReactNode } from 'react';
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { EventTimelineSet } from "matrix-js-sdk/src/models/event-timeline-set";
import { TimelineWindow } from "matrix-js-sdk/src/timeline-window";
import { SyncState } from 'matrix-js-sdk/src/sync';
import { Layout } from "../../settings/enums/Layout";
import RoomContext from "../../contexts/RoomContext";
import { IScrollState } from "./ScrollPanel";
import ResizeNotifier from "../../utils/ResizeNotifier";
import { RoomPermalinkCreator } from "../../utils/permalinks/Permalinks";
import EditorStateTransfer from '../../utils/EditorStateTransfer';
interface IProps {
    timelineSet: EventTimelineSet;
    showReadReceipts?: boolean;
    manageReadReceipts?: boolean;
    sendReadReceiptOnLoad?: boolean;
    manageReadMarkers?: boolean;
    hidden?: boolean;
    highlightedEventId?: string;
    eventId?: string;
    eventScrollIntoView?: boolean;
    eventPixelOffset?: number;
    showUrlPreview?: boolean;
    timelineCap?: number;
    className?: string;
    empty?: ReactNode;
    showReactions?: boolean;
    layout?: Layout;
    alwaysShowTimestamps?: boolean;
    resizeNotifier?: ResizeNotifier;
    editState?: EditorStateTransfer;
    permalinkCreator?: RoomPermalinkCreator;
    membersLoaded?: boolean;
    onScroll?(event: Event): void;
    onEventScrolledIntoView?(eventId?: string): void;
    onReadMarkerUpdated?(): void;
    onPaginationRequest?(timelineWindow: TimelineWindow, direction: string, size: number): Promise<boolean>;
    hideThreadedMessages?: boolean;
    disableGrouping?: boolean;
}
interface IState {
    events: MatrixEvent[];
    liveEvents: MatrixEvent[];
    timelineLoading: boolean;
    firstVisibleEventIndex: number;
    canBackPaginate: boolean;
    canForwardPaginate: boolean;
    readMarkerVisible: boolean;
    readMarkerEventId: string;
    backPaginating: boolean;
    forwardPaginating: boolean;
    clientSyncState: SyncState;
    isTwelveHour: boolean;
    alwaysShowTimestamps: boolean;
    readMarkerInViewThresholdMs: number;
    readMarkerOutOfViewThresholdMs: number;
    editState?: EditorStateTransfer;
}
declare class TimelinePanel extends React.Component<IProps, IState> {
    static contextType: React.Context<import("./RoomView").IRoomState>;
    context: React.ContextType<typeof RoomContext>;
    static roomReadMarkerTsMap: Record<string, number>;
    static defaultProps: {
        timelineCap: number;
        className: string;
        sendReadReceiptOnLoad: boolean;
        hideThreadedMessages: boolean;
        disableGrouping: boolean;
    };
    private lastRRSentEventId;
    private lastRMSentEventId;
    private readonly messagePanel;
    private readonly dispatcherRef;
    private timelineWindow?;
    private unmounted;
    private readReceiptActivityTimer;
    private readMarkerActivityTimer;
    private callEventGroupers;
    constructor(props: any, context: any);
    UNSAFE_componentWillMount(): void;
    UNSAFE_componentWillReceiveProps(newProps: any): void;
    componentWillUnmount(): void;
    /**
     * Logs out debug info to describe the state of the TimelinePanel and the
     * events in the room according to the matrix-js-sdk. This is useful when
     * debugging problems like messages out of order, or messages that should
     * not be showing up in a thread, etc.
     *
     * It's too expensive and cumbersome to do all of these calculations for
     * every message change so instead we only log it out when asked.
     */
    private onDumpDebugLogs;
    private onMessageListUnfillRequest;
    private onPaginationRequest;
    private onMessageListFillRequest;
    private onMessageListScroll;
    private doManageReadMarkers;
    private onAction;
    private onRoomTimeline;
    private onRoomTimelineReset;
    canResetTimeline: () => boolean;
    private onRoomRedaction;
    private onEventVisibilityChange;
    private onVisibilityPowerLevelChange;
    private onEventReplaced;
    private onRoomReceipt;
    private onLocalEchoUpdated;
    private onAccountData;
    private onEventDecrypted;
    private onSync;
    private recheckFirstVisibleEventIndex;
    private readMarkerTimeout;
    private updateReadMarkerOnUserActivity;
    private updateReadReceiptOnUserActivity;
    private sendReadReceipt;
    private updateReadMarker;
    private advanceReadMarkerPastMyEvents;
    jumpToLiveTimeline: () => void;
    scrollToEventIfNeeded: (eventId: string) => void;
    jumpToReadMarker: () => void;
    forgetReadMarker: () => void;
    isAtEndOfLiveTimeline: () => boolean | undefined;
    getScrollState: () => IScrollState;
    getReadMarkerPosition: () => number;
    canJumpToReadMarker: () => boolean;
    handleScrollKey: (ev: any) => void;
    private initTimeline;
    private scrollIntoView;
    /**
     * (re)-load the event timeline, and initialise the scroll state, centered
     * around the given event.
     *
     * @param {string?}  eventId the event to focus on. If undefined, will
     *    scroll to the bottom of the room.
     *
     * @param {number?} pixelOffset   offset to position the given event at
     *    (pixels from the offsetBase). If omitted, defaults to 0.
     *
     * @param {number?} offsetBase the reference point for the pixelOffset. 0
     *     means the top of the container, 1 means the bottom, and fractional
     *     values mean somewhere in the middle. If omitted, it defaults to 0.
     *
     * @param {boolean?} scrollIntoView whether to scroll the event into view.
     */
    private loadTimeline;
    private reloadEvents;
    refreshTimeline(): void;
    private getEvents;
    /**
     * Check for undecryptable messages that were sent while the user was not in
     * the room.
     *
     * @param {Array<MatrixEvent>} events The timeline events to check
     *
     * @return {Number} The index within `events` of the event after the most recent
     * undecryptable event that was sent while the user was not in the room.  If no
     * such events were found, then it returns 0.
     */
    private checkForPreJoinUISI;
    private indexForEventId;
    private getLastDisplayedEventIndex;
    /**
     * Get the id of the event corresponding to our user's latest read-receipt.
     *
     * @param {Boolean} ignoreSynthesized If true, return only receipts that
     *                                    have been sent by the server, not
     *                                    implicit ones generated by the JS
     *                                    SDK.
     * @return {String} the event ID
     */
    private getCurrentReadReceipt;
    private setReadMarker;
    private shouldPaginate;
    private getRelationsForEvent;
    private buildLegacyCallEventGroupers;
    render(): JSX.Element;
}
export default TimelinePanel;
