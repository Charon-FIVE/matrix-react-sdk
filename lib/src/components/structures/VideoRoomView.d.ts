import { FC } from "react";
import type { Room } from "matrix-js-sdk/src/models/room";
interface Props {
    room: Room;
    resizing: boolean;
}
export declare const VideoRoomView: FC<Props>;
export {};
