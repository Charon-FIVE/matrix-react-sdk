import React from 'react';
import { Room } from "matrix-js-sdk/src/models/room";
import ResizeNotifier from "../../../utils/ResizeNotifier";
import { Container } from "../../../stores/widgets/WidgetLayoutStore";
import { IApp } from "../../../stores/WidgetStore";
interface IProps {
    userId: string;
    room: Room;
    resizeNotifier: ResizeNotifier;
    showApps?: boolean;
    maxHeight: number;
}
interface IState {
    apps: {
        [id: Container]: IApp[];
    };
    resizingVertical: boolean;
    resizingHorizontal: boolean;
    resizing: boolean;
}
export default class AppsDrawer extends React.Component<IProps, IState> {
    private unmounted;
    private resizeContainer;
    private resizer;
    private dispatcherRef;
    static defaultProps: Partial<IProps>;
    constructor(props: IProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    private onIsResizing;
    private createResizer;
    private collectResizer;
    private getAppsHash;
    componentDidUpdate(prevProps: IProps, prevState: IState): void;
    private relaxResizer;
    private loadResizerPreferences;
    private isResizing;
    private onAction;
    private getApps;
    private topApps;
    private centerApps;
    private updateApps;
    render(): JSX.Element;
}
export {};
