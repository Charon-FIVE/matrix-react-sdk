import React from 'react';
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { Layout } from '../../../settings/enums/Layout';
interface IProps {
    mxEvent: MatrixEvent;
    layout: Layout;
}
interface IState {
    error: Error;
}
export default class TileErrorBoundary extends React.Component<IProps, IState> {
    constructor(props: any);
    static getDerivedStateFromError(error: Error): Partial<IState>;
    private onBugReport;
    private onViewSource;
    render(): React.ReactNode;
}
export {};
