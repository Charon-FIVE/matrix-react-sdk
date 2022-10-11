import React from 'react';
import { Room } from 'matrix-js-sdk/src/models/room';
import MatrixClientContext from "../../../contexts/MatrixClientContext";
interface IProps {
    room: Room;
}
interface IState {
    upgraded?: boolean;
}
export default class RoomUpgradeWarningBar extends React.PureComponent<IProps, IState> {
    static contextType: React.Context<import("matrix-js-sdk/src").MatrixClient>;
    context: React.ContextType<typeof MatrixClientContext>;
    constructor(props: any, context: any);
    componentDidMount(): void;
    componentWillUnmount(): void;
    private onStateEvents;
    private onUpgradeClick;
    render(): JSX.Element;
}
export {};
