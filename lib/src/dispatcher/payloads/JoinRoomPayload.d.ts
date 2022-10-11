import { JoinedRoom as JoinedRoomEvent } from "@matrix-org/analytics-events/types/typescript/JoinedRoom";
import { IJoinRoomOpts } from "matrix-js-sdk/src/@types/requests";
import { ActionPayload } from "../payloads";
import { Action } from "../actions";
export interface JoinRoomPayload extends Pick<ActionPayload, "action"> {
    action: Action.JoinRoom;
    roomId: string;
    opts?: IJoinRoomOpts;
    metricsTrigger: JoinedRoomEvent["trigger"];
}
