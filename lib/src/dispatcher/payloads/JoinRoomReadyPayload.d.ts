import { JoinedRoom as JoinedRoomEvent } from "@matrix-org/analytics-events/types/typescript/JoinedRoom";
import { ActionPayload } from "../payloads";
import { Action } from "../actions";
export interface JoinRoomReadyPayload extends Pick<ActionPayload, "action"> {
    action: Action.JoinRoomReady;
    roomId: string;
    metricsTrigger: JoinedRoomEvent["trigger"];
}
