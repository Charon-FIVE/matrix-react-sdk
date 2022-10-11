import React from 'react';
import { MatrixEvent } from 'matrix-js-sdk/src/models/event';
import { MatrixClient } from 'matrix-js-sdk/src/client';
import { IDialogProps } from "../dialogs/IDialogProps";
interface IProps extends IDialogProps {
    matrixClient: MatrixClient;
    mxEvent: MatrixEvent;
}
interface IState {
    error: Error;
}
/**
 * Dialog to view m.location events maximised
 */
export default class LocationViewDialog extends React.Component<IProps, IState> {
    constructor(props: IProps);
    private getBodyId;
    private onError;
    render(): JSX.Element;
}
export {};
