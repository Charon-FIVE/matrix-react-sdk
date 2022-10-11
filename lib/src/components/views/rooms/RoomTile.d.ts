import React from "react";
import { Room } from "matrix-js-sdk/src/models/room";
import type { Call } from "../../../models/Call";
import { ChevronFace } from "../../structures/ContextMenu";
import { TagID } from "../../../stores/room-list/models";
interface IProps {
    room: Room;
    showMessagePreview: boolean;
    isMinimized: boolean;
    tag: TagID;
}
declare type PartialDOMRect = Pick<DOMRect, "left" | "bottom">;
interface IState {
    selected: boolean;
    notificationsMenuPosition: PartialDOMRect;
    generalMenuPosition: PartialDOMRect;
    call: Call | null;
    messagePreview?: string;
}
export declare const contextMenuBelow: (elementRect: PartialDOMRect) => {
    left: number;
    top: number;
    chevronFace: ChevronFace;
};
export default class RoomTile extends React.PureComponent<IProps, IState> {
    private dispatcherRef;
    private roomTileRef;
    private notificationState;
    private roomProps;
    constructor(props: IProps);
    private onRoomNameUpdate;
    private onNotificationUpdate;
    private onRoomPropertyUpdate;
    private get showContextMenu();
    private get showMessagePreview();
    componentDidUpdate(prevProps: Readonly<IProps>, prevState: Readonly<IState>): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    private onAction;
    private onRoomPreviewChanged;
    private onCallChanged;
    private generatePreview;
    private scrollIntoView;
    private onTileClick;
    private onActiveRoomUpdate;
    private onNotificationsMenuOpenClick;
    private onCloseNotificationsMenu;
    private onGeneralMenuOpenClick;
    private onContextMenu;
    private onCloseGeneralMenu;
    private renderNotificationsMenu;
    private renderGeneralMenu;
    render(): React.ReactElement;
}
export {};
