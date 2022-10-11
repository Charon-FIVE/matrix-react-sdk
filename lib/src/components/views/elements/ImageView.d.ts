import React from 'react';
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { RoomPermalinkCreator } from "../../../utils/permalinks/Permalinks";
import { IDialogProps } from '../dialogs/IDialogProps';
interface IProps extends IDialogProps {
    src: string;
    name?: string;
    link?: string;
    width?: number;
    height?: number;
    fileSize?: number;
    mxEvent?: MatrixEvent;
    permalinkCreator?: RoomPermalinkCreator;
    thumbnailInfo?: {
        positionX: number;
        positionY: number;
        width: number;
        height: number;
    };
}
interface IState {
    zoom: number;
    minZoom: number;
    maxZoom: number;
    rotation: number;
    translationX: number;
    translationY: number;
    moving: boolean;
    contextMenuDisplayed: boolean;
}
export default class ImageView extends React.Component<IProps, IState> {
    constructor(props: any);
    private contextMenuButton;
    private focusLock;
    private imageWrapper;
    private image;
    private initX;
    private initY;
    private previousX;
    private previousY;
    private animatingLoading;
    private imageIsLoaded;
    componentDidMount(): void;
    componentWillUnmount(): void;
    private imageLoaded;
    private recalculateZoom;
    private setZoomAndRotation;
    private zoomDelta;
    private zoom;
    private onWheel;
    private onZoomInClick;
    private onZoomOutClick;
    private onKeyDown;
    private onRotateCounterClockwiseClick;
    private onRotateClockwiseClick;
    private onDownloadClick;
    private onOpenContextMenu;
    private onCloseContextMenu;
    private onPermalinkClicked;
    private onStartMoving;
    private onMoving;
    private onEndMoving;
    private renderContextMenu;
    render(): JSX.Element;
}
export {};
