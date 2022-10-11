import { Room } from "matrix-js-sdk/src/models/room";
import { IDestroyable } from "../../utils/IDestroyable";
import { NotificationState } from "./NotificationState";
import { ThreadsRoomNotificationState } from "./ThreadsRoomNotificationState";
export declare class RoomNotificationState extends NotificationState implements IDestroyable {
    readonly room: Room;
    private readonly threadsState?;
    constructor(room: Room, threadsState?: ThreadsRoomNotificationState);
    private get roomIsInvite();
    destroy(): void;
    private handleThreadsUpdate;
    private handleLocalEchoUpdated;
    private handleReadReceipt;
    private handleMembershipUpdate;
    private onEventDecrypted;
    private handleRoomEventUpdate;
    private handleAccountDataUpdate;
    private updateNotificationState;
}
