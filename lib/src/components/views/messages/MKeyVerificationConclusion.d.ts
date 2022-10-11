import React from 'react';
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { VerificationRequest } from "matrix-js-sdk/src/crypto/verification/request/VerificationRequest";
interface IProps {
    mxEvent: MatrixEvent;
    timestamp?: JSX.Element;
}
export default class MKeyVerificationConclusion extends React.Component<IProps> {
    constructor(props: IProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    private onRequestChanged;
    private onTrustChanged;
    static shouldRender(mxEvent: MatrixEvent, request: VerificationRequest): boolean;
    render(): JSX.Element;
}
export {};
