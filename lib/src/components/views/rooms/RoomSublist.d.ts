import { Dispatcher } from "flux";
import { Room } from "matrix-js-sdk/src/models/room";
import * as React from "react";
import { ComponentType, ReactComponentElement } from "react";
import { ActionPayload } from "../../../dispatcher/payloads";
import { TagID } from "../../../stores/room-list/models";
import ResizeNotifier from "../../../utils/ResizeNotifier";
import ExtraTile from "./ExtraTile";
export declare const HEADER_HEIGHT = 32;
export interface IAuxButtonProps {
    tabIndex: number;
    dispatcher?: Dispatcher<ActionPayload>;
}
interface IProps {
    forRooms: boolean;
    startAsHidden: boolean;
    label: string;
    AuxButtonComponent?: ComponentType<IAuxButtonProps>;
    isMinimized: boolean;
    tagId: TagID;
    showSkeleton?: boolean;
    alwaysVisible?: boolean;
    forceExpanded?: boolean;
    resizeNotifier: ResizeNotifier;
    extraTiles?: ReactComponentElement<typeof ExtraTile>[];
    onListCollapse?: (isExpanded: boolean) => void;
}
declare type PartialDOMRect = Pick<DOMRect, "left" | "top" | "height">;
interface IState {
    contextMenuPosition: PartialDOMRect;
    isResizing: boolean;
    isExpanded: boolean;
    height: number;
    rooms: Room[];
}
export default class RoomSublist extends React.Component<IProps, IState> {
    private headerButton;
    private sublistRef;
    private tilesRef;
    private dispatcherRef;
    private layout;
    private heightAtStart;
    private notificationState;
    constructor(props: IProps);
    private calculateInitialHeight;
    private get padding();
    private get extraTiles();
    private get numTiles();
    private static calcNumTiles;
    private get numVisibleTiles();
    componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>): void;
    shouldComponentUpdate(nextProps: Readonly<IProps>, nextState: Readonly<IState>): boolean;
    componentDidMount(): void;
    componentWillUnmount(): void;
    private onListsUpdated;
    private onAction;
    private applyHeightChange;
    private onResize;
    private onResizeStart;
    private onResizeStop;
    private onShowAllClick;
    private onShowLessClick;
    private focusRoomTile;
    private onOpenMenuClick;
    private onContextMenu;
    private onCloseMenu;
    private onUnreadFirstChanged;
    private onTagSortChanged;
    private onMessagePreviewChanged;
    private onBadgeClick;
    private onHeaderClick;
    private toggleCollapsed;
    private onHeaderKeyDown;
    private onKeyDown;
    private renderVisibleTiles;
    private renderMenu;
    private renderHeader;
    private onScrollPrevent;
    render(): React.ReactElement;
}
export {};
