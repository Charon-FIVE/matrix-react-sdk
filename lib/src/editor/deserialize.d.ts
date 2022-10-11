import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { Part, PartCreator } from "./parts";
export declare function longestBacktickSequence(text: string): number;
interface IParseOptions {
    isQuotedMessage?: boolean;
    shouldEscape?: boolean;
}
export declare function parsePlainTextMessage(body: string, pc: PartCreator, opts: IParseOptions): Part[];
export declare function parseEvent(event: MatrixEvent, pc: PartCreator, opts?: IParseOptions): Part[];
export {};
