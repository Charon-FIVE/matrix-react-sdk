import React from 'react';
import { MatrixEvent } from 'matrix-js-sdk/src/models/event';
import { Relations } from 'matrix-js-sdk/src/models/relations';
import { RoomPermalinkCreator } from "../../../utils/permalinks/Permalinks";
import { Layout } from "../../../settings/enums/Layout";
import RoomContext from "../../../contexts/RoomContext";
interface IProps {
    parentEv?: MatrixEvent;
    onHeightChanged: () => void;
    permalinkCreator: RoomPermalinkCreator;
    layout?: Layout;
    alwaysShowTimestamps?: boolean;
    forExport?: boolean;
    isQuoteExpanded?: boolean;
    setQuoteExpanded: (isExpanded: boolean) => void;
    getRelationsForEvent?: ((eventId: string, relationType: string, eventType: string) => Relations);
}
interface IState {
    events: MatrixEvent[];
    loadedEv: MatrixEvent;
    loading: boolean;
    err: boolean;
}
export default class ReplyChain extends React.Component<IProps, IState> {
    static contextType: React.Context<import("../../structures/RoomView").IRoomState>;
    context: React.ContextType<typeof RoomContext>;
    private unmounted;
    private room;
    private blockquoteRef;
    constructor(props: IProps, context: React.ContextType<typeof RoomContext>);
    private get matrixClient();
    componentDidMount(): void;
    componentDidUpdate(): void;
    componentWillUnmount(): void;
    private trySetExpandableQuotes;
    private initialize;
    private getNextEvent;
    private getEvent;
    canCollapse: () => boolean;
    collapse: () => void;
    private onQuoteClick;
    private getReplyChainColorClass;
    render(): JSX.Element;
}
export {};
