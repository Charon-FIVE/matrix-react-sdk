import React from 'react';
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { Relations } from "matrix-js-sdk/src/models/relations";
import { RoomMember } from "matrix-js-sdk/src/models/room-member";
import { Thread } from 'matrix-js-sdk/src/models/thread';
import { NotificationCountType } from 'matrix-js-sdk/src/models/room';
import { Layout } from "../../../settings/enums/Layout";
import MatrixClientContext from "../../../contexts/MatrixClientContext";
import EditorStateTransfer from "../../../utils/EditorStateTransfer";
import { RoomPermalinkCreator } from '../../../utils/permalinks/Permalinks';
import LegacyCallEventGrouper from "../../structures/LegacyCallEventGrouper";
import { IReadReceiptInfo } from "./ReadReceiptMarker";
import RoomContext from "../../../contexts/RoomContext";
export declare type GetRelationsForEvent = (eventId: string, relationType: string, eventType: string) => Relations;
export interface IReadReceiptProps {
    userId: string;
    roomMember: RoomMember | null;
    ts: number;
}
export interface IEventTileOps {
    isWidgetHidden(): boolean;
    unhideWidget(): void;
}
export interface IEventTileType extends React.Component {
    getEventTileOps?(): IEventTileOps;
}
interface IProps {
    mxEvent: MatrixEvent;
    isRedacted?: boolean;
    continuation?: boolean;
    last?: boolean;
    lastInSection?: boolean;
    lastSuccessful?: boolean;
    contextual?: boolean;
    highlights?: string[];
    highlightLink?: string;
    showUrlPreview?: boolean;
    isSelectedEvent?: boolean;
    onHeightChanged?: () => void;
    readReceipts?: IReadReceiptProps[];
    readReceiptMap?: {
        [userId: string]: IReadReceiptInfo;
    };
    checkUnmounting?: () => boolean;
    eventSendStatus?: string;
    forExport?: boolean;
    isTwelveHour?: boolean;
    getRelationsForEvent?: GetRelationsForEvent;
    showReactions?: boolean;
    layout?: Layout;
    showReadReceipts?: boolean;
    editState?: EditorStateTransfer;
    replacingEventId?: string;
    permalinkCreator?: RoomPermalinkCreator;
    callEventGrouper?: LegacyCallEventGrouper;
    as?: string;
    alwaysShowTimestamps?: boolean;
    hideSender?: boolean;
    showThreadInfo?: boolean;
    isSeeingThroughMessageHiddenForModeration?: boolean;
}
interface IState {
    actionBarFocused: boolean;
    verified: string;
    previouslyRequestedKeys: boolean;
    reactions: Relations;
    hover: boolean;
    contextMenu?: {
        position: Pick<DOMRect, "top" | "left" | "bottom">;
        link?: string;
    };
    isQuoteExpanded?: boolean;
    thread: Thread;
    threadNotification?: NotificationCountType;
}
export declare class UnwrappedEventTile extends React.Component<IProps, IState> {
    private suppressReadReceiptAnimation;
    private isListeningForReceipts;
    private tile;
    private replyChain;
    private threadState;
    readonly ref: React.RefObject<HTMLElement>;
    static defaultProps: {
        onHeightChanged: () => void;
        forExport: boolean;
        layout: Layout;
    };
    static contextType: React.Context<import("../../structures/RoomView").IRoomState>;
    context: React.ContextType<typeof RoomContext>;
    constructor(props: IProps, context: React.ContextType<typeof MatrixClientContext>);
    /**
     * When true, the tile qualifies for some sort of special read receipt. This could be a 'sending'
     * or 'sent' receipt, for example.
     * @returns {boolean}
     */
    private get isEligibleForSpecialReceipt();
    private get shouldShowSentReceipt();
    private get shouldShowSendingReceipt();
    UNSAFE_componentWillMount(): void;
    componentDidMount(): void;
    private setupNotificationListener;
    private onThreadStateUpdate;
    private updateThread;
    UNSAFE_componentWillReceiveProps(nextProps: IProps): void;
    shouldComponentUpdate(nextProps: IProps, nextState: IState): boolean;
    componentWillUnmount(): void;
    componentDidUpdate(prevProps: IProps, prevState: IState, snapshot: any): void;
    private onNewThread;
    private get thread();
    private renderThreadPanelSummary;
    private renderThreadInfo;
    private viewInRoom;
    private copyLinkToThread;
    private onRoomReceipt;
    /** called when the event is decrypted after we show it.
     */
    private onDecrypted;
    private onDeviceVerificationChanged;
    private onUserVerificationChanged;
    private verifyEvent;
    private propsEqual;
    private shouldHighlight;
    private onSenderProfileClick;
    private onRequestKeysClick;
    private onPermalinkClicked;
    private renderE2EPadlock;
    private onActionBarFocusChange;
    private getTile;
    private getReplyChain;
    private getReactions;
    private onReactionsCreated;
    private onContextMenu;
    private onTimestampContextMenu;
    private showContextMenu;
    private onCloseMenu;
    private setQuoteExpanded;
    /**
     * In some cases we can't use shouldHideEvent() since whether or not we hide
     * an event depends on other things that the event itself
     * @returns {boolean} true if event should be hidden
     */
    private shouldHideEvent;
    private renderContextMenu;
    render(): JSX.Element;
}
declare const SafeEventTile: React.ForwardRefExoticComponent<IProps & React.RefAttributes<UnwrappedEventTile>>;
export default SafeEventTile;
