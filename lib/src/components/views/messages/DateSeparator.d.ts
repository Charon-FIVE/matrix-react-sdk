import React from 'react';
interface IProps {
    roomId: string;
    ts: number;
    forExport?: boolean;
}
interface IState {
    contextMenuPosition?: DOMRect;
    jumpToDateEnabled: boolean;
}
export default class DateSeparator extends React.Component<IProps, IState> {
    private settingWatcherRef;
    constructor(props: any, context: any);
    componentWillUnmount(): void;
    private onContextMenuOpenClick;
    private onContextMenuCloseClick;
    private closeMenu;
    private getLabel;
    private pickDate;
    private onLastWeekClicked;
    private onLastMonthClicked;
    private onTheBeginningClicked;
    private onDatePicked;
    private renderJumpToDateMenu;
    render(): JSX.Element;
}
export {};
