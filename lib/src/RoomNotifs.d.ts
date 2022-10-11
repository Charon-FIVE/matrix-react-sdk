import { NotificationCountType, Room } from "matrix-js-sdk/src/models/room";
export declare enum RoomNotifState {
    AllMessagesLoud = "all_messages_loud",
    AllMessages = "all_messages",
    MentionsOnly = "mentions_only",
    Mute = "mute"
}
export declare function getRoomNotifsState(roomId: string): RoomNotifState;
export declare function setRoomNotifsState(roomId: string, newState: RoomNotifState): Promise<void>;
export declare function getUnreadNotificationCount(room: Room, type?: NotificationCountType): number;
