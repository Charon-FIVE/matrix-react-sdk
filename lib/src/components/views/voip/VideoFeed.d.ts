import { MatrixCall } from 'matrix-js-sdk/src/webrtc/call';
import React from 'react';
import { CallFeed } from 'matrix-js-sdk/src/webrtc/callFeed';
interface IProps {
    call: MatrixCall;
    feed: CallFeed;
    pipMode?: boolean;
    onResize?: (e: Event) => void;
    primary?: boolean;
    secondary?: boolean;
}
interface IState {
    audioMuted: boolean;
    videoMuted: boolean;
}
export default class VideoFeed extends React.PureComponent<IProps, IState> {
    private element;
    constructor(props: IProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(prevProps: IProps, prevState: IState): void;
    static getDerivedStateFromProps(props: IProps): {
        audioMuted: boolean;
        videoMuted: boolean;
    };
    private setElementRef;
    private updateFeed;
    private playMedia;
    private stopMedia;
    private onNewStream;
    private onMuteStateChanged;
    private onResize;
    render(): JSX.Element;
}
export {};
