import React from 'react';
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { Relations } from 'matrix-js-sdk/src/models/relations';
import { RoomPermalinkCreator } from '../../../utils/permalinks/Permalinks';
interface IProps {
    mxEvent: MatrixEvent;
    permalinkCreator?: RoomPermalinkCreator;
    highlights?: string[];
    highlightLink?: string;
    onHeightChanged?(): void;
    toggleExpandedQuote?: () => void;
    getRelationsForEvent?: ((eventId: string, relationType: string, eventType: string) => Relations);
}
export default class ReplyTile extends React.PureComponent<IProps> {
    private anchorElement;
    static defaultProps: {
        onHeightChanged: () => void;
    };
    componentDidMount(): void;
    componentWillUnmount(): void;
    private onDecrypted;
    private onEventRequiresUpdate;
    private onClick;
    render(): JSX.Element;
}
export {};
