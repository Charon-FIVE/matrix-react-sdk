import { ActionPayload } from "../payloads";
import { Action } from "../actions";
import { UpdateStatus } from "../../BasePlatform";
export interface CheckUpdatesPayload extends ActionPayload, UpdateStatus {
    action: Action.CheckUpdates;
}
