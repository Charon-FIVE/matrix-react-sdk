declare type Dimensions = {
    w: number;
    h: number;
};
export declare enum ImageSize {
    Normal = "normal",
    Large = "large"
}
/**
 * @param {ImageSize} size The user's image size preference
 * @param {Dimensions} contentSize The natural dimensions of the content
 * @param {number} maxHeight Overrides the default height limit
 * @returns {Dimensions} The suggested maximum dimensions for the image
 */
export declare function suggestedSize(size: ImageSize, contentSize: Dimensions, maxHeight?: number): Dimensions;
export {};
