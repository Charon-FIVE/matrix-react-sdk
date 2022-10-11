import { FC, HTMLAttributes } from "react";
import { Room } from "matrix-js-sdk/src/models/room";
interface IProps extends HTMLAttributes<HTMLSpanElement> {
    room: Room;
    onlyKnownUsers?: boolean;
    numShown?: number;
}
declare const RoomFacePile: FC<IProps>;
export default RoomFacePile;
