import React from "react";
import { Room } from "matrix-js-sdk/src/models/room";
interface IProps extends React.HTMLProps<HTMLDivElement> {
    room?: Room;
}
export default function RoomTopic({ room, ...props }: IProps): JSX.Element;
export {};
