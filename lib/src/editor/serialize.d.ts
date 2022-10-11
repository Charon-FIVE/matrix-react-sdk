import EditorModel from "./model";
export declare function mdSerialize(model: EditorModel): string;
interface ISerializeOpts {
    forceHTML?: boolean;
    useMarkdown?: boolean;
}
export declare function htmlSerializeIfNeeded(model: EditorModel, { forceHTML, useMarkdown }?: ISerializeOpts): string;
export declare function htmlSerializeFromMdIfNeeded(md: string, { forceHTML }?: {
    forceHTML?: boolean;
}): string;
export declare function textSerialize(model: EditorModel): string;
export declare function containsEmote(model: EditorModel): boolean;
export declare function startsWith(model: EditorModel, prefix: string, caseSensitive?: boolean): boolean;
export declare function stripEmoteCommand(model: EditorModel): EditorModel;
export declare function stripPrefix(model: EditorModel, prefix: string): EditorModel;
export declare function unescapeMessage(model: EditorModel): EditorModel;
export {};
