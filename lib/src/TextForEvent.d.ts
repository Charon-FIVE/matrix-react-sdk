/// <reference types="react" />
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
export declare function getSenderName(event: MatrixEvent): string;
export declare function textForLocationEvent(event: MatrixEvent): () => string | null;
/**
 * Determines whether the given event has text to display.
 * @param ev The event
 * @param showHiddenEvents An optional cached setting value for showHiddenEventsInTimeline
 *     to avoid hitting the settings store
 */
export declare function hasText(ev: MatrixEvent, showHiddenEvents?: boolean): boolean;
/**
 * Gets the textual content of the given event.
 * @param ev The event
 * @param allowJSX Whether to output rich JSX content
 * @param showHiddenEvents An optional cached setting value for showHiddenEventsInTimeline
 *     to avoid hitting the settings store
 */
export declare function textForEvent(ev: MatrixEvent): string;
export declare function textForEvent(ev: MatrixEvent, allowJSX: true, showHiddenEvents?: boolean): string | JSX.Element;
