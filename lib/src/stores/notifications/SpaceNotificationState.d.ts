import { Room } from "matrix-js-sdk/src/models/room";
import { NotificationState } from "./NotificationState";
import { FetchRoomFn } from "./ListNotificationState";
export declare class SpaceNotificationState extends NotificationState {
    private getRoomFn;
    rooms: Room[];
    private states;
    constructor(getRoomFn: FetchRoomFn);
    get symbol(): string;
    setRooms(rooms: Room[]): void;
    getFirstRoomWithNotifications(): string;
    destroy(): void;
    private onRoomNotificationStateUpdate;
    private calculateTotalState;
}
