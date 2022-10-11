import React from 'react';
import { EventStatus, MatrixEvent } from 'matrix-js-sdk/src/models/event';
interface IProps {
    mxEvent: MatrixEvent;
    previousEdit?: MatrixEvent;
    isBaseEvent?: boolean;
    isTwelveHour?: boolean;
}
interface IState {
    canRedact: boolean;
    sendStatus: EventStatus;
}
export default class EditHistoryMessage extends React.PureComponent<IProps, IState> {
    private content;
    private pills;
    private tooltips;
    constructor(props: IProps);
    private onAssociatedStatusChanged;
    private onRedactClick;
    private onViewSourceClick;
    private pillifyLinks;
    private tooltipifyLinks;
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(): void;
    private renderActionBar;
    render(): JSX.Element;
}
export {};
