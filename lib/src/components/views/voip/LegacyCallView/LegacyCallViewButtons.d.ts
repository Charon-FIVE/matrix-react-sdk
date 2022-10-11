import React from "react";
import { MatrixCall } from "matrix-js-sdk/src/webrtc/call";
interface IProps {
    call: MatrixCall;
    pipMode: boolean;
    handlers: {
        onHangupClick: () => void;
        onScreenshareClick: () => void;
        onToggleSidebarClick: () => void;
        onMicMuteClick: () => void;
        onVidMuteClick: () => void;
    };
    buttonsState: {
        micMuted: boolean;
        vidMuted: boolean;
        sidebarShown: boolean;
        screensharing: boolean;
    };
    buttonsVisibility: {
        screensharing: boolean;
        vidMute: boolean;
        sidebar: boolean;
        dialpad: boolean;
        contextMenu: boolean;
    };
}
interface IState {
    visible: boolean;
    showDialpad: boolean;
    hoveringControls: boolean;
    showMoreMenu: boolean;
}
export default class LegacyCallViewButtons extends React.Component<IProps, IState> {
    private dialpadButton;
    private contextMenuButton;
    private controlsHideTimer;
    constructor(props: IProps);
    componentDidMount(): void;
    showControls(): void;
    private onControlsHideTimer;
    private onMouseEnter;
    private onMouseLeave;
    private onDialpadClick;
    private onMoreClick;
    private closeDialpad;
    private closeContextMenu;
    render(): JSX.Element;
}
export {};
