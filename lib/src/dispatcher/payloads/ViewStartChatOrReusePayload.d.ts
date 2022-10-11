import { User } from "matrix-js-sdk/src/models/user";
import { ActionPayload } from "../payloads";
import { Action } from "../actions";
export interface ViewStartChatOrReusePayload extends Pick<ActionPayload, "action"> {
    action: Action.ViewStartChatOrReuse;
    user_id: User["userId"];
}
