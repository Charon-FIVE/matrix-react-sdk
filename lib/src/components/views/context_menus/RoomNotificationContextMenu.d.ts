/// <reference types="react" />
import { Room } from "matrix-js-sdk/src/models/room";
import { IProps as IContextMenuProps } from "../../structures/ContextMenu";
interface IProps extends IContextMenuProps {
    room: Room;
}
export declare const RoomNotificationContextMenu: ({ room, onFinished, ...props }: IProps) => JSX.Element;
export {};
