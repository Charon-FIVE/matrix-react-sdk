import React from 'react';
import { MatrixEvent } from 'matrix-js-sdk/src/models/event';
import { RoomPermalinkCreator } from "../../../utils/permalinks/Permalinks";
interface IProps {
    permalinkCreator: RoomPermalinkCreator;
    replyToEvent: MatrixEvent;
}
export default class ReplyPreview extends React.Component<IProps> {
    static contextType: React.Context<import("../../structures/RoomView").IRoomState>;
    render(): JSX.Element;
}
export {};
