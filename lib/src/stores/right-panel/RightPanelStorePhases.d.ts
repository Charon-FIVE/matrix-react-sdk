export declare enum RightPanelPhases {
    RoomMemberList = "RoomMemberList",
    FilePanel = "FilePanel",
    NotificationPanel = "NotificationPanel",
    RoomMemberInfo = "RoomMemberInfo",
    EncryptionPanel = "EncryptionPanel",
    RoomSummary = "RoomSummary",
    Widget = "Widget",
    PinnedMessages = "PinnedMessages",
    Timeline = "Timeline",
    Room3pidMemberInfo = "Room3pidMemberInfo",
    SpaceMemberList = "SpaceMemberList",
    SpaceMemberInfo = "SpaceMemberInfo",
    Space3pidMemberInfo = "Space3pidMemberInfo",
    ThreadView = "ThreadView",
    ThreadPanel = "ThreadPanel"
}
export declare function backLabelForPhase(phase: RightPanelPhases): string;
