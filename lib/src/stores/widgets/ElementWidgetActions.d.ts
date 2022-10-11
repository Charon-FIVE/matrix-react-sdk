import { IWidgetApiRequest } from "matrix-widget-api";
export declare enum ElementWidgetActions {
    JoinCall = "io.element.join",
    HangupCall = "im.vector.hangup",
    CallParticipants = "io.element.participants",
    MuteAudio = "io.element.mute_audio",
    UnmuteAudio = "io.element.unmute_audio",
    MuteVideo = "io.element.mute_video",
    UnmuteVideo = "io.element.unmute_video",
    StartLiveStream = "im.vector.start_live_stream",
    TileLayout = "io.element.tile_layout",
    SpotlightLayout = "io.element.spotlight_layout",
    OpenIntegrationManager = "integration_manager_open",
    /**
     * @deprecated Use MSC2931 instead
     */
    ViewRoom = "io.element.view_room"
}
export interface IHangupCallApiRequest extends IWidgetApiRequest {
    data: {
        errorMessage?: string;
    };
}
/**
 * @deprecated Use MSC2931 instead
 */
export interface IViewRoomApiRequest extends IWidgetApiRequest {
    data: {
        room_id: string;
    };
}
