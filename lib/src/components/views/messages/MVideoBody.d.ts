import React from 'react';
import { IBodyProps } from "./IBodyProps";
import RoomContext from "../../../contexts/RoomContext";
interface IState {
    decryptedUrl?: string;
    decryptedThumbnailUrl?: string;
    decryptedBlob?: Blob;
    error?: any;
    fetchingData: boolean;
    posterLoading: boolean;
    blurhashUrl: string;
}
export default class MVideoBody extends React.PureComponent<IBodyProps, IState> {
    static contextType: React.Context<import("../../structures/RoomView").IRoomState>;
    context: React.ContextType<typeof RoomContext>;
    private videoRef;
    private sizeWatcher;
    constructor(props: any);
    private getContentUrl;
    private hasContentUrl;
    private getThumbUrl;
    private loadBlurhash;
    componentDidMount(): Promise<void>;
    componentWillUnmount(): void;
    private videoOnPlay;
    protected get showFileBody(): boolean;
    private getFileBody;
    render(): JSX.Element;
}
export {};
