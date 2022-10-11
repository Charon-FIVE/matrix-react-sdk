import { ReactElement } from "react";
import { StaticNotificationState } from "../../stores/notifications/StaticNotificationState";
interface RoomStatusBarUnsentMessagesProps {
    title: string;
    description?: string;
    notificationState: StaticNotificationState;
    buttons: ReactElement;
}
export declare const RoomStatusBarUnsentMessages: (props: RoomStatusBarUnsentMessagesProps) => ReactElement;
export {};
