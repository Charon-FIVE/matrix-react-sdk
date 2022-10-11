import { MatrixEvent } from "matrix-js-sdk/src/matrix";
import { LazyValue } from "./LazyValue";
import { Media } from "../customisations/Media";
import { IDestroyable } from "./IDestroyable";
export declare class MediaEventHelper implements IDestroyable {
    private event;
    readonly sourceUrl: LazyValue<string>;
    readonly thumbnailUrl: LazyValue<string>;
    readonly sourceBlob: LazyValue<Blob>;
    readonly thumbnailBlob: LazyValue<Blob>;
    readonly media: Media;
    constructor(event: MatrixEvent);
    get fileName(): string;
    destroy(): void;
    private prepareSourceUrl;
    private prepareThumbnailUrl;
    private fetchSource;
    private fetchThumbnail;
    static isEligible(event: MatrixEvent): boolean;
}
