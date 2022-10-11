/// <reference types="react" />
import { Room } from "matrix-js-sdk/src/models/room";
import { IProps as IContextMenuProps } from "../../structures/ContextMenu";
import { ButtonEvent } from "../elements/AccessibleButton";
interface IProps extends IContextMenuProps {
    room: Room;
    onPostFavoriteClick?: (event: ButtonEvent) => void;
    onPostLowPriorityClick?: (event: ButtonEvent) => void;
    onPostInviteClick?: (event: ButtonEvent) => void;
    onPostCopyLinkClick?: (event: ButtonEvent) => void;
    onPostSettingsClick?: (event: ButtonEvent) => void;
    onPostForgetClick?: (event: ButtonEvent) => void;
    onPostLeaveClick?: (event: ButtonEvent) => void;
}
export declare const RoomGeneralContextMenu: ({ room, onFinished, onPostFavoriteClick, onPostLowPriorityClick, onPostInviteClick, onPostCopyLinkClick, onPostSettingsClick, onPostLeaveClick, onPostForgetClick, ...props }: IProps) => JSX.Element;
export {};
