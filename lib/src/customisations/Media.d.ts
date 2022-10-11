import { MatrixClient } from "matrix-js-sdk/src/client";
import { ResizeMethod } from "matrix-js-sdk/src/@types/partials";
import { Optional } from "matrix-events-sdk";
import { IMediaEventContent, IPreparedMedia } from "./models/IMediaEventContent";
/**
 * A media object is a representation of a "source media" and an optional
 * "thumbnail media", derived from event contents or external sources.
 */
export declare class Media {
    private prepared;
    private client;
    constructor(prepared: IPreparedMedia, client?: MatrixClient);
    /**
     * True if the media appears to be encrypted. Actual file contents may vary.
     */
    get isEncrypted(): boolean;
    /**
     * The MXC URI of the source media.
     */
    get srcMxc(): string;
    /**
     * The MXC URI of the thumbnail media, if a thumbnail is recorded. Null/undefined
     * otherwise.
     */
    get thumbnailMxc(): Optional<string>;
    /**
     * Whether or not a thumbnail is recorded for this media.
     */
    get hasThumbnail(): boolean;
    /**
     * The HTTP URL for the source media.
     */
    get srcHttp(): string;
    /**
     * The HTTP URL for the thumbnail media (without any specified width, height, etc). Null/undefined
     * if no thumbnail media recorded.
     */
    get thumbnailHttp(): string | undefined | null;
    /**
     * Gets the HTTP URL for the thumbnail media with the requested characteristics, if a thumbnail
     * is recorded for this media. Returns null/undefined otherwise.
     * @param {number} width The desired width of the thumbnail.
     * @param {number} height The desired height of the thumbnail.
     * @param {"scale"|"crop"} mode The desired thumbnailing mode. Defaults to scale.
     * @returns {string} The HTTP URL which points to the thumbnail.
     */
    getThumbnailHttp(width: number, height: number, mode?: ResizeMethod): string | null | undefined;
    /**
     * Gets the HTTP URL for a thumbnail of the source media with the requested characteristics.
     * @param {number} width The desired width of the thumbnail.
     * @param {number} height The desired height of the thumbnail.
     * @param {"scale"|"crop"} mode The desired thumbnailing mode. Defaults to scale.
     * @returns {string} The HTTP URL which points to the thumbnail.
     */
    getThumbnailOfSourceHttp(width: number, height: number, mode?: ResizeMethod): string;
    /**
     * Creates a square thumbnail of the media. If the media has a thumbnail recorded, that MXC will
     * be used, otherwise the source media will be used.
     * @param {number} dim The desired width and height.
     * @returns {string} An HTTP URL for the thumbnail.
     */
    getSquareThumbnailHttp(dim: number): string;
    /**
     * Downloads the source media.
     * @returns {Promise<Response>} Resolves to the server's response for chaining.
     */
    downloadSource(): Promise<Response>;
}
/**
 * Creates a media object from event content.
 * @param {IMediaEventContent} content The event content.
 * @param {MatrixClient} client? Optional client to use.
 * @returns {Media} The media object.
 */
export declare function mediaFromContent(content: IMediaEventContent, client?: MatrixClient): Media;
/**
 * Creates a media object from an MXC URI.
 * @param {string} mxc The MXC URI.
 * @param {MatrixClient} client? Optional client to use.
 * @returns {Media} The media object.
 */
export declare function mediaFromMxc(mxc: string, client?: MatrixClient): Media;
