import React from "react";
import { MatrixEvent } from "matrix-js-sdk/src/matrix";
import { RoomPermalinkCreator } from "../../../utils/permalinks/Permalinks";
interface IProps {
    mxEvent: MatrixEvent;
    permalinkCreator: RoomPermalinkCreator;
    onMenuToggle?: (open: boolean) => void;
}
declare const ThreadListContextMenu: React.FC<IProps>;
export default ThreadListContextMenu;
