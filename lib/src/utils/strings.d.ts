export declare function copyPlaintext(text: string): Promise<boolean>;
export declare function selectText(target: Element): void;
/**
 * Copy rich text to user's clipboard
 * It will overwrite user's selection range
 * In certain browsers it may only work if triggered by a user action or may ask user for permissions
 * @param ref pointer to the node to copy
 */
export declare function copyNode(ref: Element): boolean;
/**
 * Performant language-sensitive string comparison
 * @param a the first string to compare
 * @param b the second string to compare
 */
export declare function compare(a: string, b: string): number;
/**
 * Returns text which has been selected by the user
 * @returns the selected text
 */
export declare function getSelectedText(): string;
