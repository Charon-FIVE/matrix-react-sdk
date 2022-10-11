import React from 'react';
import { MatrixClient } from 'matrix-js-sdk/src/client';
import { MatrixCall } from 'matrix-js-sdk/src/webrtc/call';
import { ISyncStateData } from 'matrix-js-sdk/src/sync';
import { IUsageLimit } from 'matrix-js-sdk/src/@types/partials';
import { IMatrixClientCreds } from '../../MatrixClientPeg';
import { Resizer } from '../../resizer';
import ResizeNotifier from "../../utils/ResizeNotifier";
import { IOOBData, IThreepidInvite } from "../../stores/ThreepidInviteStore";
import { IOpts } from "../../createRoom";
import type { RoomView as RoomViewType } from './RoomView';
import { IConfigOptions } from "../../IConfigOptions";
interface IProps {
    matrixClient: MatrixClient;
    onRegistered: (credentials: IMatrixClientCreds) => Promise<MatrixClient>;
    hideToSRUsers: boolean;
    resizeNotifier: ResizeNotifier;
    page_type?: string;
    autoJoin?: boolean;
    threepidInvite?: IThreepidInvite;
    roomOobData?: IOOBData;
    currentRoomId: string;
    collapseLhs: boolean;
    config: IConfigOptions;
    currentUserId?: string;
    justRegistered?: boolean;
    roomJustCreatedOpts?: IOpts;
    forceTimeline?: boolean;
    currentGroupId?: string;
}
interface IState {
    syncErrorData?: ISyncStateData;
    usageLimitDismissed: boolean;
    usageLimitEventContent?: IUsageLimit;
    usageLimitEventTs?: number;
    useCompactLayout: boolean;
    activeCalls: Array<MatrixCall>;
    backgroundImage?: string;
}
/**
 * This is what our MatrixChat shows when we are logged in. The precise view is
 * determined by the page_type property.
 *
 * Currently, it's very tightly coupled with MatrixChat. We should try to do
 * something about that.
 *
 * Components mounted below us can access the matrix client via the react context.
 */
declare class LoggedInView extends React.Component<IProps, IState> {
    static displayName: string;
    protected readonly _matrixClient: MatrixClient;
    protected readonly _roomView: React.RefObject<RoomViewType>;
    protected readonly _resizeContainer: React.RefObject<HTMLDivElement>;
    protected readonly resizeHandler: React.RefObject<HTMLDivElement>;
    protected layoutWatcherRef: string;
    protected compactLayoutWatcherRef: string;
    protected backgroundImageWatcherRef: string;
    protected resizer: Resizer;
    constructor(props: any, context: any);
    componentDidMount(): void;
    componentWillUnmount(): void;
    private onCallState;
    private refreshBackgroundImage;
    canResetTimelineInRoom: (roomId: string) => boolean;
    private createResizer;
    private loadResizerPreferences;
    private onAccountData;
    private onCompactLayoutChanged;
    private onSync;
    private onRoomStateEvents;
    private onUsageLimitDismissed;
    private calculateServerLimitToast;
    private updateServerNoticeEvents;
    private onPaste;
    private onReactKeyDown;
    private onNativeKeyDown;
    private onKeyDown;
    /**
     * dispatch a page-up/page-down/etc to the appropriate component
     * @param {Object} ev The key event
     */
    private onScrollKeyPressed;
    render(): JSX.Element;
}
export default LoggedInView;
