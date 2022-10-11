import React from 'react';
import { MatrixEvent } from 'matrix-js-sdk/src/models/event';
import MatrixClientContext from '../../../contexts/MatrixClientContext';
import { IBodyProps } from "./IBodyProps";
interface IState {
    error: Error;
}
export default class MLocationBody extends React.Component<IBodyProps, IState> {
    static contextType: React.Context<import("matrix-js-sdk/src/client").MatrixClient>;
    context: React.ContextType<typeof MatrixClientContext>;
    private mapId;
    private reconnectedListener;
    constructor(props: IBodyProps);
    private onClick;
    private clearError;
    private onError;
    componentWillUnmount(): void;
    render(): React.ReactElement<HTMLDivElement>;
}
export declare const LocationBodyFallbackContent: React.FC<{
    event: MatrixEvent;
    error: Error;
}>;
interface LocationBodyContentProps {
    mxEvent: MatrixEvent;
    mapId: string;
    tooltip?: string;
    onError: (error: Error) => void;
    onClick?: () => void;
}
export declare const LocationBodyContent: React.FC<LocationBodyContentProps>;
export {};
