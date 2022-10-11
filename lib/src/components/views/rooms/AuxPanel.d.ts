import React from 'react';
import { Room } from 'matrix-js-sdk/src/models/room';
import ResizeNotifier from "../../../utils/ResizeNotifier";
interface IProps {
    room: Room;
    userId: string;
    showApps: boolean;
    resizeNotifier: ResizeNotifier;
}
interface Counter {
    title: string;
    value: number;
    link: string;
    severity: string;
    stateKey: string;
}
interface IState {
    counters: Counter[];
}
export default class AuxPanel extends React.Component<IProps, IState> {
    static defaultProps: {
        showApps: boolean;
    };
    constructor(props: any);
    componentDidMount(): void;
    componentWillUnmount(): void;
    shouldComponentUpdate(nextProps: any, nextState: any): boolean;
    private onRoomStateEvents;
    private updateCounters;
    private computeCounters;
    render(): JSX.Element;
}
export {};
