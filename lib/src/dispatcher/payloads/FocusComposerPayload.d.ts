import { ActionPayload } from "../payloads";
import { Action } from "../actions";
import { TimelineRenderingType } from "../../contexts/RoomContext";
export interface FocusComposerPayload extends ActionPayload {
    action: Action.FocusAComposer | Action.FocusEditMessageComposer | Action.FocusSendMessageComposer | "reply_to_event";
    context?: TimelineRenderingType;
}
