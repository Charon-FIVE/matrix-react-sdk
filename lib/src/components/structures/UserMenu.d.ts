import React from "react";
import { Room } from "matrix-js-sdk/src/models/room";
interface IProps {
    isPanelCollapsed: boolean;
}
declare type PartialDOMRect = Pick<DOMRect, "width" | "left" | "top" | "height">;
interface IState {
    contextMenuPosition: PartialDOMRect;
    isDarkTheme: boolean;
    isHighContrast: boolean;
    selectedSpace?: Room;
}
export default class UserMenu extends React.Component<IProps, IState> {
    private dispatcherRef;
    private themeWatcherRef;
    private readonly dndWatcherRef;
    private buttonRef;
    constructor(props: IProps);
    private get hasHomePage();
    componentDidMount(): void;
    componentWillUnmount(): void;
    private isUserOnDarkTheme;
    private isUserOnHighContrastTheme;
    private onProfileUpdate;
    private onSelectedSpaceUpdate;
    private onThemeChanged;
    private onAction;
    private onOpenMenuClick;
    private onContextMenu;
    private onCloseMenu;
    private onSwitchThemeClick;
    private onSettingsOpen;
    private onProvideFeedback;
    private onSignOutClick;
    private onSignInClick;
    private onRegisterClick;
    private onHomeClick;
    private renderContextMenu;
    render(): JSX.Element;
}
export {};
