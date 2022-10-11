import { Thread } from "matrix-js-sdk/src/models/thread";
import { NotificationColor } from "./NotificationColor";
import { IDestroyable } from "../../utils/IDestroyable";
import { NotificationState } from "./NotificationState";
export declare class ThreadNotificationState extends NotificationState implements IDestroyable {
    readonly thread: Thread;
    protected _symbol: any;
    protected _count: number;
    protected _color: NotificationColor;
    constructor(thread: Thread);
    destroy(): void;
    private handleNewThreadReply;
    private resetThreadNotification;
    private updateNotificationState;
}
