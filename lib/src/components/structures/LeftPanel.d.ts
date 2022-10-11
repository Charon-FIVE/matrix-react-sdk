import * as React from "react";
import ResizeNotifier from "../../utils/ResizeNotifier";
import { SpaceKey } from "../../stores/spaces";
import PageType from "../../PageTypes";
interface IProps {
    isMinimized: boolean;
    pageType: PageType;
    resizeNotifier: ResizeNotifier;
}
declare enum BreadcrumbsMode {
    Disabled = 0,
    Legacy = 1,
    Labs = 2
}
interface IState {
    showBreadcrumbs: BreadcrumbsMode;
    activeSpace: SpaceKey;
}
export default class LeftPanel extends React.Component<IProps, IState> {
    private listContainerRef;
    private roomListRef;
    private focusedElement;
    private isDoingStickyHeaders;
    constructor(props: IProps);
    private static get breadcrumbsMode();
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(prevProps: IProps, prevState: IState): void;
    private updateActiveSpace;
    private onDialPad;
    private onExplore;
    private refreshStickyHeaders;
    private onBreadcrumbsUpdate;
    private handleStickyHeaders;
    private doStickyHeaders;
    private onScroll;
    private onFocus;
    private onBlur;
    private onKeyDown;
    private renderBreadcrumbs;
    private renderSearchDialExplore;
    render(): React.ReactNode;
}
export {};
