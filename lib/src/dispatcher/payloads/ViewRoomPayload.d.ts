import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { ViewRoom as ViewRoomEvent } from "@matrix-org/analytics-events/types/typescript/ViewRoom";
import { ActionPayload } from "../payloads";
import { Action } from "../actions";
import { IOOBData, IThreepidInvite } from "../../stores/ThreepidInviteStore";
import { IOpts } from "../../createRoom";
export interface ViewRoomPayload extends Pick<ActionPayload, "action"> {
    action: Action.ViewRoom;
    room_id?: string;
    room_alias?: string;
    event_id?: string;
    highlighted?: boolean;
    scroll_into_view?: boolean;
    should_peek?: boolean;
    joining?: boolean;
    via_servers?: string[];
    context_switch?: boolean;
    replyingToEvent?: MatrixEvent;
    auto_join?: boolean;
    threepid_invite?: IThreepidInvite;
    justCreatedOpts?: IOpts;
    oob_data?: IOOBData;
    forceTimeline?: boolean;
    show_room_tile?: boolean;
    clear_search?: boolean;
    deferred_action?: ActionPayload;
    metricsTrigger: ViewRoomEvent["trigger"];
    metricsViaKeyboard?: ViewRoomEvent["viaKeyboard"];
}
