import { Room } from "matrix-js-sdk/src/models/room";
import { RoomNotificationState } from "./RoomNotificationState";
import { NotificationState } from "./NotificationState";
export declare type FetchRoomFn = (room: Room) => RoomNotificationState;
export declare class ListNotificationState extends NotificationState {
    private byTileCount;
    private getRoomFn;
    private rooms;
    private states;
    constructor(byTileCount: boolean, getRoomFn: FetchRoomFn);
    get symbol(): string;
    setRooms(rooms: Room[]): void;
    getForRoom(room: Room): RoomNotificationState;
    destroy(): void;
    private onRoomNotificationStateUpdate;
    private calculateTotalState;
}
