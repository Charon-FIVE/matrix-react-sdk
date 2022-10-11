import React from "react";
interface IProps {
    onClose(): void;
}
interface IState {
    narrow: boolean;
}
export default class NotificationPanel extends React.PureComponent<IProps, IState> {
    static contextType: React.Context<import("./RoomView").IRoomState>;
    private card;
    constructor(props: any);
    private onMeasurement;
    render(): JSX.Element;
}
export {};
