import { FC } from "react";
import { Room } from "matrix-js-sdk/src/models/room";
interface IProps {
    room: Room;
    onJoinButtonClicked: () => void;
    onRejectButtonClicked: () => void;
}
declare const RoomPreviewCard: FC<IProps>;
export default RoomPreviewCard;
