import React from 'react';
import { MatrixCall } from 'matrix-js-sdk/src/webrtc/call';
export declare const getIncomingLegacyCallToastKey: (callId: string) => string;
interface IProps {
    call: MatrixCall;
}
interface IState {
    silenced: boolean;
}
export default class IncomingLegacyCallToast extends React.Component<IProps, IState> {
    constructor(props: IProps);
    componentDidMount: () => void;
    componentWillUnmount(): void;
    private onSilencedCallsChanged;
    private onAnswerClick;
    private onRejectClick;
    private onSilenceClick;
    render(): JSX.Element;
}
export {};
