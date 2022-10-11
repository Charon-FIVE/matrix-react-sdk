import React from 'react';
import { RightPanelPhases } from '../../../stores/right-panel/RightPanelStorePhases';
import { IRightPanelCardState } from '../../../stores/right-panel/RightPanelStoreIPanelState';
import { NotificationColor } from '../../../stores/notifications/NotificationColor';
export declare enum HeaderKind {
    Room = "room"
}
interface IState {
    headerKind: HeaderKind;
    phase: RightPanelPhases;
    threadNotificationColor: NotificationColor;
}
interface IProps {
}
export default abstract class HeaderButtons<P = {}> extends React.Component<IProps & P, IState> {
    private unmounted;
    private dispatcherRef;
    constructor(props: IProps & P, kind: HeaderKind);
    componentDidMount(): void;
    componentWillUnmount(): void;
    protected abstract onAction(payload: any): any;
    setPhase(phase: RightPanelPhases, cardState?: Partial<IRightPanelCardState>): void;
    isPhase(phases: string | string[]): boolean;
    private onRightPanelStoreUpdate;
    abstract renderButtons(): JSX.Element;
    render(): JSX.Element;
}
export {};
