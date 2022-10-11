declare type ThumbnailableElement = HTMLImageElement | HTMLVideoElement;
interface IThumbnail {
    info: {
        thumbnail_info: {
            w: number;
            h: number;
            mimetype: string;
            size: number;
        };
        w: number;
        h: number;
        [BLURHASH_FIELD]: string;
    };
    thumbnail: Blob;
}
export declare const BLURHASH_FIELD = "xyz.amorgan.blurhash";
/**
 * Create a thumbnail for a image DOM element.
 * The image will be smaller than MAX_WIDTH and MAX_HEIGHT.
 * The thumbnail will have the same aspect ratio as the original.
 * Draws the element into a canvas using CanvasRenderingContext2D.drawImage
 * Then calls Canvas.toBlob to get a blob object for the image data.
 *
 * Since it needs to calculate the dimensions of the source image and the
 * thumbnailed image it returns an info object filled out with information
 * about the original image and the thumbnail.
 *
 * @param {HTMLElement} element The element to thumbnail.
 * @param {number} inputWidth The width of the image in the input element.
 * @param {number} inputHeight the width of the image in the input element.
 * @param {string} mimeType The mimeType to save the blob as.
 * @param {boolean} calculateBlurhash Whether to calculate a blurhash of the given image too.
 * @return {Promise} A promise that resolves with an object with an info key
 *  and a thumbnail key.
 */
export declare function createThumbnail(element: ThumbnailableElement, inputWidth: number, inputHeight: number, mimeType: string, calculateBlurhash?: boolean): Promise<IThumbnail>;
export {};
