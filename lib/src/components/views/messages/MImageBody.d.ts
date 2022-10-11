import React from 'react';
import { IMediaEventContent } from '../../../customisations/models/IMediaEventContent';
import { IBodyProps } from "./IBodyProps";
import RoomContext from "../../../contexts/RoomContext";
declare enum Placeholder {
    NoImage = 0,
    Blurhash = 1
}
interface IState {
    contentUrl?: string;
    thumbUrl?: string;
    isAnimated?: boolean;
    error?: Error;
    imgError: boolean;
    imgLoaded: boolean;
    loadedImageDimensions?: {
        naturalWidth: number;
        naturalHeight: number;
    };
    hover: boolean;
    showImage: boolean;
    placeholder: Placeholder;
}
export default class MImageBody extends React.Component<IBodyProps, IState> {
    static contextType: React.Context<import("../../structures/RoomView").IRoomState>;
    context: React.ContextType<typeof RoomContext>;
    private unmounted;
    private image;
    private timeout?;
    private sizeWatcher;
    private reconnectedListener;
    constructor(props: IBodyProps);
    protected showImage(): void;
    protected onClick: (ev: React.MouseEvent) => void;
    protected onImageEnter: (e: React.MouseEvent<HTMLImageElement>) => void;
    protected onImageLeave: (e: React.MouseEvent<HTMLImageElement>) => void;
    private clearError;
    private onImageError;
    private onImageLoad;
    private getContentUrl;
    private get media();
    private getThumbUrl;
    private downloadImage;
    private clearBlurhashTimeout;
    componentDidMount(): void;
    componentWillUnmount(): void;
    protected getBanner(content: IMediaEventContent): JSX.Element;
    protected messageContent(contentUrl: string, thumbUrl: string, content: IMediaEventContent, forcedHeight?: number): JSX.Element;
    protected wrapImage(contentUrl: string, children: JSX.Element): JSX.Element;
    protected getPlaceholder(width: number, height: number): JSX.Element;
    protected getTooltip(): JSX.Element;
    protected getFileBody(): string | JSX.Element;
    render(): JSX.Element;
}
interface PlaceholderIProps {
    hover?: boolean;
    maxWidth?: number;
}
export declare class HiddenImagePlaceholder extends React.PureComponent<PlaceholderIProps> {
    render(): JSX.Element;
}
export {};
