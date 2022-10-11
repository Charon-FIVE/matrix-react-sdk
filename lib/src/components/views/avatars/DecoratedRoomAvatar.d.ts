import React from "react";
import { Room } from "matrix-js-sdk/src/models/room";
import { NotificationState } from "../../../stores/notifications/NotificationState";
import { IOOBData } from "../../../stores/ThreepidInviteStore";
import TooltipTarget from "../elements/TooltipTarget";
interface IProps {
    room: Room;
    avatarSize: number;
    displayBadge?: boolean;
    forceCount?: boolean;
    oobData?: IOOBData;
    viewAvatarOnClick?: boolean;
    tooltipProps?: Omit<React.ComponentProps<typeof TooltipTarget>, "label" | "tooltipClassName" | "className">;
}
interface IState {
    notificationState?: NotificationState;
    icon: Icon;
}
declare enum Icon {
    None = "NONE",
    Globe = "GLOBE",
    PresenceOnline = "ONLINE",
    PresenceAway = "AWAY",
    PresenceOffline = "OFFLINE",
    PresenceBusy = "BUSY"
}
export default class DecoratedRoomAvatar extends React.PureComponent<IProps, IState> {
    private _dmUser;
    private isUnmounted;
    private isWatchingTimeline;
    constructor(props: IProps);
    componentWillUnmount(): void;
    private get isPublicRoom();
    private get dmUser();
    private set dmUser(value);
    private onRoomTimeline;
    private onPresenceUpdate;
    private getPresenceIcon;
    private calculateIcon;
    render(): React.ReactNode;
}
export {};
