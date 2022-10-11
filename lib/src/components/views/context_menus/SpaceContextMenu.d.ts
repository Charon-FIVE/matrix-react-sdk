/// <reference types="react" />
import { Room } from "matrix-js-sdk/src/models/room";
import { IProps as IContextMenuProps } from "../../structures/ContextMenu";
interface IProps extends IContextMenuProps {
    space: Room;
    hideHeader?: boolean;
}
declare const SpaceContextMenu: ({ space, hideHeader, onFinished, ...props }: IProps) => JSX.Element;
export default SpaceContextMenu;
