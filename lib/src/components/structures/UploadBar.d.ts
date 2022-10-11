import React from 'react';
import { Room } from "matrix-js-sdk/src/models/room";
import { IAbortablePromise, IEventRelation } from 'matrix-js-sdk/src/matrix';
interface IProps {
    room: Room;
    relation?: IEventRelation;
}
interface IState {
    currentFile?: string;
    currentPromise?: IAbortablePromise<any>;
    currentLoaded?: number;
    currentTotal?: number;
    countFiles: number;
}
export default class UploadBar extends React.PureComponent<IProps, IState> {
    static contextType: React.Context<import("matrix-js-sdk/src/client").MatrixClient>;
    private dispatcherRef;
    private mounted;
    constructor(props: any);
    componentDidMount(): void;
    componentWillUnmount(): void;
    private getUploadsInRoom;
    private calculateState;
    private onAction;
    private onCancelClick;
    render(): JSX.Element;
}
export {};
