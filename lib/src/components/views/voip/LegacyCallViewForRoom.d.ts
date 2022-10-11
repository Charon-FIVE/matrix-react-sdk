import { MatrixCall } from 'matrix-js-sdk/src/webrtc/call';
import React from 'react';
import ResizeNotifier from "../../../utils/ResizeNotifier";
interface IProps {
    roomId: string;
    resizeNotifier: ResizeNotifier;
    showApps?: boolean;
}
interface IState {
    call: MatrixCall | null;
}
export default class LegacyCallViewForRoom extends React.Component<IProps, IState> {
    constructor(props: IProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    private updateCall;
    private getCall;
    private onResizeStart;
    private onResize;
    private onResizeStop;
    render(): JSX.Element;
}
export {};
