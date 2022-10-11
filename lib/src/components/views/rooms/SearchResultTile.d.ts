import React from "react";
import { SearchResult } from "matrix-js-sdk/src/models/search-result";
import RoomContext from "../../../contexts/RoomContext";
import { RoomPermalinkCreator } from '../../../utils/permalinks/Permalinks';
interface IProps {
    searchResult: SearchResult;
    searchHighlights?: string[];
    resultLink?: string;
    onHeightChanged?: () => void;
    permalinkCreator?: RoomPermalinkCreator;
}
export default class SearchResultTile extends React.Component<IProps> {
    static contextType: React.Context<import("../../structures/RoomView").IRoomState>;
    context: React.ContextType<typeof RoomContext>;
    private callEventGroupers;
    constructor(props: any, context: any);
    private buildLegacyCallEventGroupers;
    render(): JSX.Element;
}
export {};
