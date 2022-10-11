import { TypedEventEmitter } from "matrix-js-sdk/src/models/typed-event-emitter";
import { NotificationColor } from "./NotificationColor";
import { IDestroyable } from "../../utils/IDestroyable";
export interface INotificationStateSnapshotParams {
    symbol: string | null;
    count: number;
    color: NotificationColor;
}
export declare enum NotificationStateEvents {
    Update = "update"
}
declare type EventHandlerMap = {
    [NotificationStateEvents.Update]: () => void;
};
export declare abstract class NotificationState extends TypedEventEmitter<NotificationStateEvents, EventHandlerMap> implements INotificationStateSnapshotParams, IDestroyable {
    protected _symbol: string | null;
    protected _count: number;
    protected _color: NotificationColor;
    get symbol(): string;
    get count(): number;
    get color(): NotificationColor;
    get isIdle(): boolean;
    get isUnread(): boolean;
    get hasUnreadCount(): boolean;
    get hasMentions(): boolean;
    protected emitIfUpdated(snapshot: NotificationStateSnapshot): void;
    protected snapshot(): NotificationStateSnapshot;
    destroy(): void;
}
export declare class NotificationStateSnapshot {
    private readonly symbol;
    private readonly count;
    private readonly color;
    constructor(state: INotificationStateSnapshotParams);
    isDifferentFrom(other: INotificationStateSnapshotParams): boolean;
}
export {};
