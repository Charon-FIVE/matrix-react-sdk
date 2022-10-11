import React from 'react';
import { MatrixEvent } from 'matrix-js-sdk/src/models/event';
import { RelationType } from 'matrix-js-sdk/src/@types/event';
import type { Relations } from 'matrix-js-sdk/src/models/relations';
import { RoomPermalinkCreator } from '../../../utils/permalinks/Permalinks';
import ReplyChain from '../elements/ReplyChain';
interface IMessageActionBarProps {
    mxEvent: MatrixEvent;
    reactions?: Relations;
    getTile: () => any | null;
    getReplyChain: () => ReplyChain | undefined;
    permalinkCreator?: RoomPermalinkCreator;
    onFocusChange?: (menuDisplayed: boolean) => void;
    toggleThreadExpanded: () => void;
    isQuoteExpanded?: boolean;
    getRelationsForEvent?: (eventId: string, relationType: RelationType | string, eventType: string) => Relations;
}
export default class MessageActionBar extends React.PureComponent<IMessageActionBarProps> {
    static contextType: React.Context<import("../../structures/RoomView").IRoomState>;
    componentDidMount(): void;
    componentWillUnmount(): void;
    private onDecrypted;
    private onBeforeRedaction;
    private onSent;
    private onFocusChange;
    private onReplyClick;
    private onEditClick;
    private readonly forbiddenThreadHeadMsgType;
    private get showReplyInThreadAction();
    /**
     * Runs a given fn on the set of possible events to test. The first event
     * that passes the checkFn will have fn executed on it. Both functions take
     * a MatrixEvent object. If no particular conditions are needed, checkFn can
     * be null/undefined. If no functions pass the checkFn, no action will be
     * taken.
     * @param {Function} fn The execution function.
     * @param {Function} checkFn The test function.
     */
    private runActionOnFailedEv;
    private onResendClick;
    private onCancelClick;
    render(): JSX.Element;
}
export {};
