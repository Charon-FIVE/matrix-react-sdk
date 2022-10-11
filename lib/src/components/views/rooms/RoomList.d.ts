import React from "react";
import { IState as IRovingTabIndexState } from "../../../accessibility/RovingTabIndex";
import MatrixClientContext from "../../../contexts/MatrixClientContext";
import { ITagMap } from "../../../stores/room-list/algorithms/models";
import { TagID } from "../../../stores/room-list/models";
import { ISuggestedRoom, SpaceKey } from "../../../stores/spaces";
import ResizeNotifier from "../../../utils/ResizeNotifier";
interface IProps {
    onKeyDown: (ev: React.KeyboardEvent, state: IRovingTabIndexState) => void;
    onFocus: (ev: React.FocusEvent) => void;
    onBlur: (ev: React.FocusEvent) => void;
    onResize: () => void;
    onListCollapse?: (isExpanded: boolean) => void;
    resizeNotifier: ResizeNotifier;
    isMinimized: boolean;
    activeSpace: SpaceKey;
}
interface IState {
    sublists: ITagMap;
    currentRoomId?: string;
    suggestedRooms: ISuggestedRoom[];
    feature_favourite_messages: boolean;
}
export declare const TAG_ORDER: TagID[];
export default class RoomList extends React.PureComponent<IProps, IState> {
    private dispatcherRef;
    private roomStoreToken;
    private treeRef;
    private favouriteMessageWatcher;
    static contextType: React.Context<import("matrix-js-sdk/src").MatrixClient>;
    context: React.ContextType<typeof MatrixClientContext>;
    constructor(props: IProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    private onRoomViewStoreUpdate;
    private onAction;
    private getRoomDelta;
    private updateSuggestedRooms;
    private updateLists;
    private renderSuggestedRooms;
    private renderFavoriteMessagesList;
    private renderSublists;
    focus(): void;
    render(): JSX.Element;
}
export {};
