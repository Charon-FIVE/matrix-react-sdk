import DocumentOffset from "./offset";
import EditorModel from "./model";
import Range from "./range";
declare type Predicate = (node: Node) => boolean;
declare type Callback = (node: Node) => void;
export declare function walkDOMDepthFirst(rootNode: Node, enterNodeCallback: Predicate, leaveNodeCallback: Callback): void;
export declare function getCaretOffsetAndText(editor: HTMLDivElement, sel: Selection): {
    caret: DocumentOffset;
    text: string;
};
export declare function getRangeForSelection(editor: HTMLDivElement, model: EditorModel, selection: Selection): Range;
export {};
