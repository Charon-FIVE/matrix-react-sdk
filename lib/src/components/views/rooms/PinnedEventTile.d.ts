import React from "react";
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { RoomPermalinkCreator } from "../../../utils/permalinks/Permalinks";
interface IProps {
    event: MatrixEvent;
    permalinkCreator: RoomPermalinkCreator;
    onUnpinClicked?(): void;
}
export default class PinnedEventTile extends React.Component<IProps> {
    static contextType: React.Context<import("matrix-js-sdk/src").MatrixClient>;
    private onTileClicked;
    private relations;
    private getRelationsForEvent;
    componentDidMount(): Promise<void>;
    render(): JSX.Element;
}
export {};
