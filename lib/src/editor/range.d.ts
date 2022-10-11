import EditorModel from "./model";
import DocumentPosition, { Predicate } from "./position";
import { Part } from "./parts";
export default class Range {
    readonly model: EditorModel;
    private _start;
    private _end;
    private _lastStart;
    private _initializedEmpty;
    constructor(model: EditorModel, positionA: DocumentPosition, positionB?: DocumentPosition);
    moveStartForwards(delta: number): void;
    wasInitializedEmpty(): boolean;
    setWasEmpty(value: boolean): void;
    getLastStartingPosition(): DocumentPosition;
    setLastStartingPosition(position: DocumentPosition): void;
    moveEndBackwards(delta: number): void;
    trim(): void;
    expandBackwardsWhile(predicate: Predicate): void;
    expandForwardsWhile(predicate: Predicate): void;
    get text(): string;
    /**
     * Splits the model at the range boundaries and replaces with the given parts.
     * Should be run inside a `model.transform()` callback.
     * @param {Part[]} parts the parts to replace the range with
     * @return {Number} the net amount of characters added, can be negative.
     */
    replace(parts: Part[]): number;
    /**
     * Returns a copy of the (partial) parts within the range.
     * For partial parts, only the text is adjusted to the part that intersects with the range.
     */
    get parts(): Part[];
    get length(): number;
    get start(): DocumentPosition;
    get end(): DocumentPosition;
}
