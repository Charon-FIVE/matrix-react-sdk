import { Action } from "../actions";
import { ActionPayload } from "../payloads";
import BasePlatform from "../../BasePlatform";
export interface PlatformSetPayload extends ActionPayload {
    action: Action.PlatformSet;
    platform: BasePlatform;
}
