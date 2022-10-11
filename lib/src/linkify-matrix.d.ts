import * as linkifyjs from 'linkifyjs';
import linkifyElement from 'linkify-element';
import linkifyString from 'linkify-string';
export declare enum Type {
    URL = "url",
    UserId = "userid",
    RoomAlias = "roomalias",
    GroupId = "groupid"
}
export declare const ELEMENT_URL_PATTERN: string;
export declare const options: {
    events: (href: string, type: Type | string) => Partial<GlobalEventHandlers>;
    formatHref: (href: string, type: Type | string) => string;
    attributes: {
        rel: string;
    };
    ignoreTags: string[];
    className: string;
    target: (href: string, type: Type | string) => string;
};
export declare const linkify: typeof linkifyjs;
export declare const _linkifyElement: typeof linkifyElement;
export declare const _linkifyString: typeof linkifyString;
