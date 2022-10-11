import { Room } from "matrix-js-sdk/src/matrix";
import { RoomNotifState } from "../RoomNotifs";
export declare const useNotificationState: (room: Room) => [RoomNotifState, (state: RoomNotifState) => void];
