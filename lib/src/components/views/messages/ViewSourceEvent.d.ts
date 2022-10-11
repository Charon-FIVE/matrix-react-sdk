import React from 'react';
import { MatrixEvent } from 'matrix-js-sdk/src/matrix';
interface IProps {
    mxEvent: MatrixEvent;
}
interface IState {
    expanded: boolean;
}
export default class ViewSourceEvent extends React.PureComponent<IProps, IState> {
    constructor(props: any);
    componentDidMount(): void;
    private onToggle;
    render(): React.ReactNode;
}
export {};
