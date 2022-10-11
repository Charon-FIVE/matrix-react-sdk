import React from "react";
import { MatrixCall } from "matrix-js-sdk/src/webrtc/call";
import { CallFeed } from "matrix-js-sdk/src/webrtc/callFeed";
interface IProps {
    call: MatrixCall;
}
interface IState {
    feeds: Array<CallFeed>;
}
export default class AudioFeedArrayForLegacyCall extends React.Component<IProps, IState> {
    constructor(props: IProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    onFeedsChanged: () => void;
    render(): JSX.Element[];
}
export {};
