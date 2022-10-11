import React from 'react';
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { CallState } from 'matrix-js-sdk/src/webrtc/call';
import LegacyCallEventGrouper, { CustomCallState } from '../../structures/LegacyCallEventGrouper';
interface IProps {
    mxEvent: MatrixEvent;
    callEventGrouper: LegacyCallEventGrouper;
    timestamp?: JSX.Element;
}
interface IState {
    callState: CallState | CustomCallState;
    silenced: boolean;
    narrow: boolean;
    length: number;
}
export default class LegacyCallEvent extends React.PureComponent<IProps, IState> {
    private wrapperElement;
    private resizeObserver;
    constructor(props: IProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    private onLengthChanged;
    private resizeObserverCallback;
    private onSilencedChanged;
    private onStateChanged;
    private renderCallBackButton;
    private renderSilenceIcon;
    private renderContent;
    render(): JSX.Element;
}
export {};
