import { IContent, IEventRelation, MatrixEvent } from "matrix-js-sdk/src/models/event";
import { RoomPermalinkCreator } from "./permalinks/Permalinks";
export declare function getParentEventId(ev?: MatrixEvent): string | undefined;
export declare function stripPlainReply(body: string): string;
export declare function stripHTMLReply(html: string): string;
export declare function getNestedReplyText(ev: MatrixEvent, permalinkCreator: RoomPermalinkCreator): {
    body: string;
    html: string;
} | null;
export declare function makeReplyMixIn(ev?: MatrixEvent): IEventRelation;
export declare function shouldDisplayReply(event: MatrixEvent): boolean;
interface IAddReplyOpts {
    permalinkCreator?: RoomPermalinkCreator;
    includeLegacyFallback?: boolean;
}
export declare function addReplyToMessageContent(content: IContent, replyToEvent: MatrixEvent, opts?: IAddReplyOpts): void;
export {};
