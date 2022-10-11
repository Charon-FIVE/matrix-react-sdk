import React from "react";
import { NotificationState } from "../../../stores/notifications/NotificationState";
import { ButtonEvent } from "../elements/AccessibleButton";
interface IProps {
    isMinimized: boolean;
    isSelected: boolean;
    displayName: string;
    avatar: React.ReactElement;
    notificationState?: NotificationState;
    onClick: (ev: ButtonEvent) => void;
}
interface IState {
    hover: boolean;
}
export default class ExtraTile extends React.Component<IProps, IState> {
    constructor(props: IProps);
    private onTileMouseEnter;
    private onTileMouseLeave;
    render(): React.ReactElement;
}
export {};
