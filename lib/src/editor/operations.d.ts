import Range from "./range";
import { Part } from "./parts";
import { Formatting } from "../components/views/rooms/MessageComposerFormatBar";
/**
 * Some common queries and transformations on the editor model
 */
/**
 * Formats a given range with a given action
 * @param {Range} range the range that should be formatted
 * @param {Formatting} action the action that should be performed on the range
 */
export declare function formatRange(range: Range, action: Formatting): void;
export declare function replaceRangeAndExpandSelection(range: Range, newParts: Part[]): void;
export declare function replaceRangeAndMoveCaret(range: Range, newParts: Part[], offset?: number, atNodeEnd?: boolean): void;
/**
 * Replaces a range with formatting or removes existing formatting and
 * positions the cursor with respect to the prefix and suffix length.
 * @param {Range} range the previous value
 * @param {Part[]} newParts the new value
 * @param {boolean} rangeHasFormatting the new value
 * @param {number} prefixLength the length of the formatting prefix
 * @param {number} suffixLength the length of the formatting suffix, defaults to prefix length
 */
export declare function replaceRangeAndAutoAdjustCaret(range: Range, newParts: Part[], rangeHasFormatting: boolean, prefixLength: number, suffixLength?: number): void;
export declare function selectRangeOfWordAtCaret(range: Range): void;
export declare function rangeStartsAtBeginningOfLine(range: Range): boolean;
export declare function rangeEndsAtEndOfLine(range: Range): boolean;
export declare function formatRangeAsQuote(range: Range): void;
export declare function formatRangeAsCode(range: Range): void;
export declare function formatRangeAsLink(range: Range, text?: string): void;
export declare function toggleInlineFormat(range: Range, prefix: string, suffix?: string): void;
