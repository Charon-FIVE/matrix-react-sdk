/// <reference types="react" />
import { IRoomState } from "../components/structures/RoomView";
export declare enum TimelineRenderingType {
    Room = "Room",
    Thread = "Thread",
    ThreadsList = "ThreadsList",
    File = "File",
    Notification = "Notification",
    Search = "Search",
    Pinned = "Pinned"
}
declare const RoomContext: import("react").Context<IRoomState>;
export default RoomContext;
