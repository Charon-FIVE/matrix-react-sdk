import React from 'react';
import { CallState, MatrixCall } from 'matrix-js-sdk/src/webrtc/call';
import { CallFeed } from 'matrix-js-sdk/src/webrtc/callFeed';
interface IProps {
    call: MatrixCall;
    secondaryCall?: MatrixCall;
    onResize?: (event: Event) => void;
    pipMode?: boolean;
    onMouseDownOnHeader?: (event: React.MouseEvent<Element, MouseEvent>) => void;
    showApps?: boolean;
}
interface IState {
    isLocalOnHold: boolean;
    isRemoteOnHold: boolean;
    micMuted: boolean;
    vidMuted: boolean;
    screensharing: boolean;
    callState: CallState;
    primaryFeed?: CallFeed;
    secondaryFeed?: CallFeed;
    sidebarFeeds: Array<CallFeed>;
    sidebarShown: boolean;
}
export default class LegacyCallView extends React.Component<IProps, IState> {
    private dispatcherRef;
    private contentWrapperRef;
    private buttonsRef;
    constructor(props: IProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    static getDerivedStateFromProps(props: IProps): Partial<IState>;
    componentDidUpdate(prevProps: IProps): void;
    private onAction;
    private updateCallListeners;
    private onCallState;
    private onFeedsChanged;
    private onCallLocalHoldUnhold;
    private onCallRemoteHoldUnhold;
    private onMouseMove;
    static getOrderedFeeds(feeds: Array<CallFeed>): {
        primary?: CallFeed;
        secondary?: CallFeed;
        sidebar: Array<CallFeed>;
    };
    private onMaximizeClick;
    private onMicMuteClick;
    private onVidMuteClick;
    private onScreenshareClick;
    private onNativeKeyDown;
    private onCallResumeClick;
    private onTransferClick;
    private onHangupClick;
    private onToggleSidebar;
    private renderCallControls;
    private renderToast;
    private renderContent;
    render(): JSX.Element;
}
export {};
