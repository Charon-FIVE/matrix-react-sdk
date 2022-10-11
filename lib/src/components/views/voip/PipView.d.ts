import React from 'react';
import { MatrixCall } from 'matrix-js-sdk/src/webrtc/call';
interface IProps {
}
interface IState {
    viewedRoomId: string;
    primaryCall: MatrixCall;
    secondaryCall: MatrixCall;
    persistentWidgetId: string;
    persistentRoomId: string;
    showWidgetInPip: boolean;
    moving: boolean;
}
/**
 * PipView shows a small version of the LegacyCallView or a sticky widget hovering over the UI in 'picture-in-picture'
 * (PiP mode). It displays the call(s) which is *not* in the room the user is currently viewing
 * and all widgets that are active but not shown in any other possible container.
 */
export default class PipView extends React.Component<IProps, IState> {
    private roomStoreToken;
    private settingsWatcherRef;
    private movePersistedElement;
    constructor(props: IProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    private onStartMoving;
    private onEndMoving;
    private onMove;
    private onRoomViewStoreUpdate;
    private onWidgetPersistence;
    private onWidgetDockChanges;
    private updateCalls;
    private onCallRemoteHold;
    private onDoubleClick;
    private onMaximize;
    private onPin;
    private onExpand;
    updateShowWidgetInPip(persistentWidgetId?: string, persistentRoomId?: string): void;
    render(): JSX.Element;
}
export {};
