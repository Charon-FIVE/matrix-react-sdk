/// <reference types="react" />
import { IPublicRoomsChunkRoom } from "matrix-js-sdk/src/client";
interface IProps {
    room: IPublicRoomsChunkRoom;
    removeFromDirectory?: (room: IPublicRoomsChunkRoom) => void;
    showRoom: (room: IPublicRoomsChunkRoom, roomAlias?: string, autoJoin?: boolean, shouldPeek?: boolean) => void;
}
export declare const PublicRoomTile: ({ room, showRoom, removeFromDirectory, }: IProps) => JSX.Element;
export {};
