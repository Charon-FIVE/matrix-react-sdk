import React from 'react';
import { IMyDevice } from "matrix-js-sdk/src/client";
import { CrossSigningInfo } from "matrix-js-sdk/src/crypto/CrossSigning";
interface IProps {
    className?: string;
}
interface IState {
    devices: IMyDevice[];
    crossSigningInfo?: CrossSigningInfo;
    deviceLoadError?: string;
    selectedDevices: string[];
    deleting?: boolean;
}
export default class DevicesPanel extends React.Component<IProps, IState> {
    private unmounted;
    constructor(props: IProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    private loadDevices;
    private deviceCompare;
    private isDeviceVerified;
    private onDeviceSelectionToggled;
    private selectAll;
    private deselectAll;
    private onDeleteClick;
    private renderDevice;
    render(): JSX.Element;
}
export {};
