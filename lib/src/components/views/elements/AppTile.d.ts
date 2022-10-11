import React, { ContextType, MutableRefObject } from 'react';
import { Room } from "matrix-js-sdk/src/models/room";
import { IApp } from "../../../stores/WidgetStore";
import MatrixClientContext from "../../../contexts/MatrixClientContext";
interface IProps {
    app: IApp;
    room?: Room;
    threadId?: string | null;
    fullWidth?: boolean;
    miniMode?: boolean;
    userId: string;
    creatorUserId: string;
    waitForIframeLoad: boolean;
    showMenubar?: boolean;
    onEditClick?: () => void;
    onDeleteClick?: () => void;
    showTitle?: boolean;
    handleMinimisePointerEvents?: boolean;
    showPopout?: boolean;
    userWidget: boolean;
    pointerEvents?: string;
    widgetPageTitle?: string;
    showLayoutButtons?: boolean;
    movePersistedElement?: MutableRefObject<() => void>;
}
interface IState {
    initialising: boolean;
    loading: boolean;
    hasPermissionToLoad: boolean;
    isUserProfileReady: boolean;
    error: Error;
    menuDisplayed: boolean;
    widgetPageTitle: string;
    requiresClient: boolean;
}
export default class AppTile extends React.Component<IProps, IState> {
    static contextType: React.Context<import("matrix-js-sdk/src").MatrixClient>;
    context: ContextType<typeof MatrixClientContext>;
    static defaultProps: Partial<IProps>;
    private contextMenuButton;
    private iframe;
    private allowedWidgetsWatchRef;
    private persistKey;
    private sgWidget;
    private dispatcherRef;
    private unmounted;
    constructor(props: IProps);
    private watchUserReady;
    private onUserReady;
    private hasPermissionToLoad;
    private onUserLeftRoom;
    private onMyMembership;
    private determineInitialRequiresClientState;
    /**
     * Set initial component state when the App wUrl (widget URL) is being updated.
     * Component props *must* be passed (rather than relying on this.props).
     * @param  {Object} newProps The new properties of the component
     * @return {Object} Updated component state to be set with setState
     */
    private getNewState;
    private onAllowedWidgetsChange;
    private isMixedContent;
    componentDidMount(): void;
    componentWillUnmount(): void;
    private setupSgListeners;
    private stopSgListeners;
    private resetWidget;
    private startWidget;
    private startMessaging;
    private iframeRefChange;
    UNSAFE_componentWillReceiveProps(nextProps: IProps): void;
    /**
     * Ends all widget interaction, such as cancelling calls and disabling webcams.
     * @private
     * @returns {Promise<*>} Resolves when the widget is terminated, or timeout passed.
     */
    private endWidgetActions;
    private onWidgetPreparing;
    private onWidgetCapabilitiesNotified;
    private onAction;
    private grantWidgetPermission;
    private formatAppTileName;
    /**
     * Whether we're using a local version of the widget rather than loading the
     * actual widget URL
     * @returns {bool} true If using a local version of the widget
     */
    private usingLocalWidget;
    private getTileTitle;
    private reload;
    private onPopoutWidgetClick;
    private onToggleMaximisedClick;
    private onMinimiseClicked;
    private onContextMenuClick;
    private closeContextMenu;
    render(): JSX.Element;
}
export {};
