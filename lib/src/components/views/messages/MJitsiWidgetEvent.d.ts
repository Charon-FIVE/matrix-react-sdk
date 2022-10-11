import React from 'react';
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
interface IProps {
    mxEvent: MatrixEvent;
    timestamp?: JSX.Element;
}
export default class MJitsiWidgetEvent extends React.PureComponent<IProps> {
    constructor(props: any);
    render(): JSX.Element;
}
export {};
