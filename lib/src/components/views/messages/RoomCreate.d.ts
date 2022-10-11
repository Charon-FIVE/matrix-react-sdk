import React from 'react';
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
interface IProps {
    mxEvent: MatrixEvent;
    timestamp?: JSX.Element;
}
export default class RoomCreate extends React.Component<IProps> {
    private onLinkClicked;
    render(): JSX.Element;
}
export {};
