import { ActionPayload } from "../payloads";
import { Action } from "../actions";
export interface DoAfterSyncPreparedPayload<T extends ActionPayload> extends Pick<ActionPayload, "action"> {
    action: Action.DoAfterSyncPrepared;
    deferred_action: T;
}
