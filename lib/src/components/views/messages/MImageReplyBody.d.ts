import React from "react";
import MImageBody from "./MImageBody";
import { IMediaEventContent } from "../../../customisations/models/IMediaEventContent";
export default class MImageReplyBody extends MImageBody {
    onClick: (ev: React.MouseEvent) => void;
    wrapImage(contentUrl: string, children: JSX.Element): JSX.Element;
    getFileBody(): string;
    protected getBanner(content: IMediaEventContent): JSX.Element;
    render(): JSX.Element;
}
