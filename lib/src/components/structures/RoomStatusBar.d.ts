import React from 'react';
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { SyncState, ISyncStateData } from "matrix-js-sdk/src/sync";
import { Room } from "matrix-js-sdk/src/models/room";
import MatrixClientContext from "../../contexts/MatrixClientContext";
export declare function getUnsentMessages(room: Room): MatrixEvent[];
interface IProps {
    room: Room;
    isPeeking?: boolean;
    onResendAllClick?: () => void;
    onCancelAllClick?: () => void;
    onInviteClick?: () => void;
    onResize?: () => void;
    onHidden?: () => void;
    onVisible?: () => void;
}
interface IState {
    syncState: SyncState;
    syncStateData: ISyncStateData;
    unsentMessages: MatrixEvent[];
    isResending: boolean;
}
export default class RoomStatusBar extends React.PureComponent<IProps, IState> {
    private unmounted;
    static contextType: React.Context<import("matrix-js-sdk/src").MatrixClient>;
    constructor(props: IProps, context: typeof MatrixClientContext);
    componentDidMount(): void;
    componentDidUpdate(): void;
    componentWillUnmount(): void;
    private onSyncStateChange;
    private onResendAllClick;
    private onCancelAllClick;
    private onRoomLocalEchoUpdated;
    private checkSize;
    private getSize;
    private shouldShowConnectionError;
    private getUnsentMessageContent;
    render(): JSX.Element;
}
export {};
