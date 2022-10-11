import React from 'react';
import MImageBody from './MImageBody';
import { IMediaEventContent } from "../../../customisations/models/IMediaEventContent";
export default class MStickerBody extends MImageBody {
    protected onClick: (ev: React.MouseEvent) => void;
    protected wrapImage(contentUrl: string, children: React.ReactNode): JSX.Element;
    protected getPlaceholder(width: number, height: number): JSX.Element;
    protected getTooltip(): JSX.Element;
    protected getFileBody(): any;
    protected getBanner(content: IMediaEventContent): JSX.Element;
}
