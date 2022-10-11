import React, { ReactNode } from 'react';
import { IContent } from 'matrix-js-sdk/src/models/event';
import { Optional } from 'matrix-events-sdk';
export declare const PERMITTED_URL_SCHEMES: string[];
/**
 * Returns the shortcode for an emoji character.
 *
 * @param {String} char The emoji character
 * @return {String} The shortcode (such as :thumbup:)
 */
export declare function unicodeToShortcode(char: string): string;
export declare function sanitizedHtmlNode(insaneHtml: string): ReactNode;
export declare function getHtmlText(insaneHtml: string): string;
/**
 * Tests if a URL from an untrusted source may be safely put into the DOM
 * The biggest threat here is javascript: URIs.
 * Note that the HTML sanitiser library has its own internal logic for
 * doing this, to which we pass the same list of schemes. This is used in
 * other places we need to sanitise URLs.
 * @return true if permitted, otherwise false
 */
export declare function isUrlPermitted(inputUrl: string): boolean;
interface IOpts {
    highlightLink?: string;
    disableBigEmoji?: boolean;
    stripReplyFallback?: boolean;
    returnString?: boolean;
    forComposerQuote?: boolean;
    ref?: React.Ref<HTMLSpanElement>;
}
export interface IOptsReturnNode extends IOpts {
    returnString: false | undefined;
}
export interface IOptsReturnString extends IOpts {
    returnString: true;
}
export declare function bodyToHtml(content: IContent, highlights: Optional<string[]>, opts: IOptsReturnString): string;
export declare function bodyToHtml(content: IContent, highlights: Optional<string[]>, opts: IOptsReturnNode): ReactNode;
/**
 * Turn a room topic into html
 * @param topic plain text topic
 * @param htmlTopic optional html topic
 * @param ref React ref to attach to any React components returned
 * @param allowExtendedHtml whether to allow extended HTML tags such as headings and lists
 * @return The HTML-ified node.
 */
export declare function topicToHtml(topic: string, htmlTopic?: string, ref?: React.Ref<HTMLSpanElement>, allowExtendedHtml?: boolean): ReactNode;
/**
 * Linkifies the given string. This is a wrapper around 'linkifyjs/string'.
 *
 * @param {string} str string to linkify
 * @param {object} [options] Options for linkifyString. Default: linkifyMatrixOptions
 * @returns {string} Linkified string
 */
export declare function linkifyString(str: string, options?: {
    events: (href: string, type: string) => Partial<GlobalEventHandlers>;
    formatHref: (href: string, type: string) => string;
    attributes: {
        rel: string;
    };
    ignoreTags: string[];
    className: string;
    target: (href: string, type: string) => string;
}): string;
/**
 * Linkifies the given DOM element. This is a wrapper around 'linkifyjs/element'.
 *
 * @param {object} element DOM element to linkify
 * @param {object} [options] Options for linkifyElement. Default: linkifyMatrixOptions
 * @returns {object}
 */
export declare function linkifyElement(element: HTMLElement, options?: {
    events: (href: string, type: string) => Partial<GlobalEventHandlers>;
    formatHref: (href: string, type: string) => string;
    attributes: {
        rel: string;
    };
    ignoreTags: string[];
    className: string;
    target: (href: string, type: string) => string;
}): HTMLElement;
/**
 * Linkify the given string and sanitize the HTML afterwards.
 *
 * @param {string} dirtyHtml The HTML string to sanitize and linkify
 * @param {object} [options] Options for linkifyString. Default: linkifyMatrixOptions
 * @returns {string}
 */
export declare function linkifyAndSanitizeHtml(dirtyHtml: string, options?: {
    events: (href: string, type: string) => Partial<GlobalEventHandlers>;
    formatHref: (href: string, type: string) => string;
    attributes: {
        rel: string;
    };
    ignoreTags: string[];
    className: string;
    target: (href: string, type: string) => string;
}): string;
/**
 * Returns if a node is a block element or not.
 * Only takes html nodes into account that are allowed in matrix messages.
 *
 * @param {Node} node
 * @returns {bool}
 */
export declare function checkBlockNode(node: Node): boolean;
export {};
