import { MatrixEvent } from "matrix-js-sdk/src/matrix";
import React from "react";
import { MediaEventHelper } from "../../../utils/MediaEventHelper";
interface IProps {
    mxEvent: MatrixEvent;
    mediaEventHelperGet: () => MediaEventHelper;
}
interface IState {
    loading: boolean;
    blob?: Blob;
    tooltip: string;
}
export default class DownloadActionButton extends React.PureComponent<IProps, IState> {
    private downloader;
    constructor(props: IProps);
    private onDownloadClick;
    private doDownload;
    render(): JSX.Element;
}
export {};
