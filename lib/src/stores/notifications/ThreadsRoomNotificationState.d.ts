import { Room } from "matrix-js-sdk/src/models/room";
import { Thread } from "matrix-js-sdk/src/models/thread";
import { IDestroyable } from "../../utils/IDestroyable";
import { NotificationState } from "./NotificationState";
import { ThreadNotificationState } from "./ThreadNotificationState";
import { NotificationColor } from "./NotificationColor";
export declare class ThreadsRoomNotificationState extends NotificationState implements IDestroyable {
    readonly room: Room;
    readonly threadsState: Map<Thread, ThreadNotificationState>;
    protected _symbol: any;
    protected _count: number;
    protected _color: NotificationColor;
    constructor(room: Room);
    destroy(): void;
    getThreadRoomState(thread: Thread): ThreadNotificationState;
    private onNewThread;
    private onThreadUpdate;
    private updateNotificationState;
}
