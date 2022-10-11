import { IDiff } from "./diff";
import DocumentPosition, { IPosition } from "./position";
import Range from "./range";
import { SerializedPart, Part, PartCreator } from "./parts";
import AutocompleteWrapperModel from "./autocomplete";
import DocumentOffset from "./offset";
import { Caret } from "./caret";
/**
 * @callback ModelCallback
 * @param {DocumentPosition?} caretPosition the position where the caret should be position
 * @param {string?} inputType the inputType of the DOM input event
 * @param {object?} diff an object with `removed` and `added` strings
 */
/**
 * @callback TransformCallback
 * @param {DocumentPosition?} caretPosition the position where the caret should be position
 * @param {string?} inputType the inputType of the DOM input event
 * @param {object?} diff an object with `removed` and `added` strings
 * @return {Number?} addedLen how many characters were added/removed (-) before the caret during the transformation step.
 *    This is used to adjust the caret position.
 */
/**
 * @callback ManualTransformCallback
 * @return the caret position
 */
declare type TransformCallback = (caretPosition: DocumentPosition, inputType: string, diff: IDiff) => number | void;
declare type UpdateCallback = (caret: Caret, inputType?: string, diff?: IDiff) => void;
declare type ManualTransformCallback = () => Caret;
export default class EditorModel {
    private updateCallback;
    private _parts;
    private readonly _partCreator;
    private activePartIdx;
    private _autoComplete;
    private autoCompletePartIdx;
    private autoCompletePartCount;
    private transformCallback;
    constructor(parts: Part[], partCreator: PartCreator, updateCallback?: UpdateCallback);
    /**
     * Set a callback for the transformation step.
     * While processing an update, right before calling the update callback,
     * a transform callback can be called, which serves to do modifications
     * on the model that can span multiple parts. Also see `startRange()`.
     * @param {TransformCallback} transformCallback
     */
    setTransformCallback(transformCallback: TransformCallback): void;
    /**
     * Set a callback for rerendering the model after it has been updated.
     * @param {ModelCallback} updateCallback
     */
    setUpdateCallback(updateCallback: UpdateCallback): void;
    get partCreator(): PartCreator;
    get isEmpty(): boolean;
    clone(): EditorModel;
    private insertPart;
    private removePart;
    private replacePart;
    get parts(): Part[];
    get autoComplete(): AutocompleteWrapperModel;
    getPositionAtEnd(): DocumentPosition;
    serializeParts(): SerializedPart[];
    private diff;
    reset(serializedParts: SerializedPart[], caret?: Caret, inputType?: string): void;
    /**
     * Inserts the given parts at the given position.
     * Should be run inside a `model.transform()` callback.
     * @param {Part[]} parts the parts to replace the range with
     * @param {DocumentPosition} position the position to start inserting at
     * @return {Number} the amount of characters added
     */
    insert(parts: Part[], position: IPosition): number;
    update(newValue: string, inputType: string, caret: DocumentOffset): Promise<void>;
    private getTransformAddedLen;
    private setActivePart;
    private onAutoComplete;
    private mergeAdjacentParts;
    /**
     * removes `len` amount of characters at `pos`.
     * @param {Object} pos
     * @param {Number} len
     * @return {Number} how many characters before pos were also removed,
     * usually because of non-editable parts that can only be removed in their entirety.
     */
    removeText(pos: IPosition, len: number): number;
    private splitAt;
    /**
     * inserts `str` into the model at `pos`.
     * @param {Object} pos
     * @param {string} str
     * @param {string} inputType the source of the input, see html InputEvent.inputType
     * @return {Number} how far from position (in characters) the insertion ended.
     * This can be more than the length of `str` when crossing non-editable parts, which are skipped.
     */
    private addText;
    positionForOffset(totalOffset: number, atPartEnd?: boolean): DocumentPosition;
    /**
     * Starts a range, which can span across multiple parts, to find and replace text.
     * @param {DocumentPosition} positionA a boundary of the range
     * @param {DocumentPosition?} positionB the other boundary of the range, optional
     * @return {Range}
     */
    startRange(positionA: DocumentPosition, positionB?: DocumentPosition): Range;
    replaceRange(startPosition: DocumentPosition, endPosition: DocumentPosition, parts: Part[]): void;
    /**
     * Performs a transformation not part of an update cycle.
     * Modifying the model should only happen inside a transform call if not part of an update call.
     * @param {ManualTransformCallback} callback to run the transformations in
     * @return {Promise} a promise when auto-complete (if applicable) is done updating
     */
    transform(callback: ManualTransformCallback): Promise<void>;
}
export {};
