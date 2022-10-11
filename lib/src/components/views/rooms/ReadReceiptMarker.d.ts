import React from 'react';
import { RoomMember } from "matrix-js-sdk/src/models/room-member";
export interface IReadReceiptInfo {
    top?: number;
    right?: number;
    parent?: Element;
}
interface IProps {
    member?: RoomMember | null;
    fallbackUserId: string;
    offset: number;
    hidden?: boolean;
    suppressAnimation?: boolean;
    readReceiptInfo: IReadReceiptInfo;
    checkUnmounting?: () => boolean;
    timestamp?: number;
    showTwelveHour?: boolean;
}
interface IState {
    suppressDisplay: boolean;
    startStyles?: IReadReceiptMarkerStyle[];
}
interface IReadReceiptMarkerStyle {
    top: number;
    right: number;
}
export default class ReadReceiptMarker extends React.PureComponent<IProps, IState> {
    private avatar;
    constructor(props: IProps);
    componentWillUnmount(): void;
    componentDidMount(): void;
    componentDidUpdate(prevProps: IProps): void;
    private buildReadReceiptInfo;
    private readReceiptPosition;
    private animateMarker;
    render(): JSX.Element;
}
export {};
