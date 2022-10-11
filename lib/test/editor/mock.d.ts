import { PartCreator } from "../../src/editor/parts";
import DocumentPosition from "../../src/editor/position";
export declare function createPartCreator(completions?: any[]): PartCreator;
export declare function createRenderer(): {
    (c: DocumentPosition): void;
    count: number;
    caret: DocumentPosition;
};
