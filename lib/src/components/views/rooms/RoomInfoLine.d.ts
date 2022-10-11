import { FC } from "react";
import { Room } from "matrix-js-sdk/src/models/room";
interface IProps {
    room: Room;
}
declare const RoomInfoLine: FC<IProps>;
export default RoomInfoLine;
