import React from 'react';
import { MatrixEvent } from 'matrix-js-sdk/src/matrix';
interface IProps {
    mxEvent: MatrixEvent;
    timestamp?: JSX.Element;
}
export default class MKeyVerificationRequest extends React.Component<IProps> {
    componentDidMount(): void;
    componentWillUnmount(): void;
    private openRequest;
    private onRequestChanged;
    private onAcceptClicked;
    private onRejectClicked;
    private acceptedLabel;
    private cancelledLabel;
    render(): JSX.Element;
}
export {};
