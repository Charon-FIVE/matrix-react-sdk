import React from 'react';
import { MatrixError } from 'matrix-js-sdk/src/http-api';
import { QueryDict } from "matrix-js-sdk/src/utils";
import 'focus-visible';
import 'what-input';
import '../../stores/LifecycleStore';
import '../../stores/AutoRageshakeStore';
import PageType from '../../PageTypes';
import { IOpts } from "../../createRoom";
import ResizeNotifier from "../../utils/ResizeNotifier";
import { IThreepidInvite } from "../../stores/ThreepidInviteStore";
import Views from '../../Views';
import { IConfigOptions } from "../../IConfigOptions";
import { ValidatedServerConfig } from '../../utils/ValidatedServerConfig';
export { default as Views } from "../../Views";
interface IScreen {
    screen: string;
    params?: QueryDict;
}
interface IProps {
    config: IConfigOptions;
    serverConfig?: ValidatedServerConfig;
    onNewScreen: (screen: string, replaceLast: boolean) => void;
    enableGuest?: boolean;
    realQueryParams?: QueryDict;
    startingFragmentQueryParams?: QueryDict;
    onTokenLoginCompleted?: () => void;
    initialScreenAfterLogin?: IScreen;
    defaultDeviceDisplayName?: string;
    makeRegistrationUrl: (params: QueryDict) => string;
}
interface IState {
    view: Views;
    page_type?: PageType;
    currentRoomId?: string;
    currentUserId?: string;
    currentGroupId?: string;
    collapseLhs: boolean;
    register_client_secret?: string;
    register_session_id?: string;
    register_id_sid?: string;
    hideToSRUsers: boolean;
    syncError?: MatrixError;
    resizeNotifier: ResizeNotifier;
    serverConfig?: ValidatedServerConfig;
    ready: boolean;
    threepidInvite?: IThreepidInvite;
    roomOobData?: object;
    pendingInitialSync?: boolean;
    justRegistered?: boolean;
    roomJustCreatedOpts?: IOpts;
    forceTimeline?: boolean;
}
export default class MatrixChat extends React.PureComponent<IProps, IState> {
    static displayName: string;
    static defaultProps: {
        realQueryParams: {};
        startingFragmentQueryParams: {};
        config: {};
        onTokenLoginCompleted: () => void;
    };
    private firstSyncComplete;
    private firstSyncPromise;
    private screenAfterLogin?;
    private tokenLogin?;
    private accountPassword?;
    private accountPasswordTimer?;
    private focusComposer;
    private subTitleStatus;
    private prevWindowWidth;
    private readonly loggedInView;
    private readonly dispatcherRef;
    private readonly themeWatcher;
    private readonly fontWatcher;
    constructor(props: IProps);
    private postLoginSetup;
    UNSAFE_componentWillUpdate(props: any, state: any): void;
    componentDidMount(): void;
    componentDidUpdate(prevProps: any, prevState: any): void;
    componentWillUnmount(): void;
    private onWindowResized;
    private warnInConsole;
    private getFallbackHsUrl;
    private getServerProperties;
    private loadSession;
    private startPageChangeTimer;
    private stopPageChangeTimer;
    private shouldTrackPageChange;
    private setStateForNewView;
    private onAction;
    private setPage;
    private startRegistration;
    private viewRoom;
    private viewSomethingBehindModal;
    private viewWelcome;
    private viewLogin;
    private viewHome;
    private viewUser;
    private viewLegacyGroup;
    private createRoom;
    private chatCreateOrReuse;
    private leaveRoomWarnings;
    private leaveRoom;
    private forgetRoom;
    private copyRoom;
    /**
     * Starts a chat with the welcome user, if the user doesn't already have one
     * @returns {string} The room ID of the new room, or null if no room was created
     */
    private startWelcomeUserChat;
    /**
     * Called when a new logged in session has started
     */
    private onLoggedIn;
    private onShowPostLoginScreen;
    private initPosthogAnalyticsToast;
    private showScreenAfterLogin;
    private viewLastRoom;
    /**
     * Called when the session is logged out
     */
    private onLoggedOut;
    /**
     * Called when the session is softly logged out
     */
    private onSoftLogout;
    /**
     * Called just before the matrix client is started
     * (useful for setting listeners)
     */
    private onWillStartClient;
    /**
     * Called shortly after the matrix client has started. Useful for
     * setting up anything that requires the client to be started.
     * @private
     */
    private onClientStarted;
    showScreen(screen: string, params?: {
        [key: string]: any;
    }): void;
    private notifyNewScreen;
    private onLogoutClick;
    private handleResize;
    private dispatchTimelineResize;
    private onRegisterClick;
    private onLoginClick;
    private onForgotPasswordClick;
    private onRegisterFlowComplete;
    private onRegistered;
    private onSendEvent;
    private setPageSubtitle;
    private onUpdateStatusIndicator;
    private onServerConfigChange;
    private makeRegistrationUrl;
    /**
     * After registration or login, we run various post-auth steps before entering the app
     * proper, such setting up cross-signing or verifying the new session.
     *
     * Note: SSO users (and any others using token login) currently do not pass through
     * this, as they instead jump straight into the app after `attemptTokenLogin`.
     */
    private onUserCompletedLoginFlow;
    private onCompleteSecurityE2eSetupFinished;
    private getFragmentAfterLogin;
    render(): JSX.Element;
}
