import React from "react";
import { MatrixCall } from "matrix-js-sdk/src/webrtc/call";
import { CallFeed } from "matrix-js-sdk/src/webrtc/callFeed";
interface IProps {
    feeds: Array<CallFeed>;
    call: MatrixCall;
    pipMode: boolean;
}
export default class LegacyCallViewSidebar extends React.Component<IProps> {
    render(): JSX.Element;
}
export {};
