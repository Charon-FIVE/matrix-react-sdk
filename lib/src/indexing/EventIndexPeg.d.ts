import EventIndex from "../indexing/EventIndex";
/**
 * Holds the current instance of the `EventIndex` to use across the codebase.
 * Looking for an `EventIndex`? Just look for the `EventIndexPeg` on the peg
 * board. "Peg" is the literal meaning of something you hang something on. So
 * you'll find a `EventIndex` hanging on the `EventIndexPeg`.
 */
export declare class EventIndexPeg {
    index: EventIndex;
    error: Error;
    private _supportIsInstalled;
    /**
     * Initialize the EventIndexPeg and if event indexing is enabled initialize
     * the event index.
     *
     * @return {Promise<boolean>} A promise that will resolve to true if an
     * EventIndex was successfully initialized, false otherwise.
     */
    init(): Promise<boolean>;
    /**
     * Initialize the event index.
     *
     * @returns {boolean} True if the event index was successfully initialized,
     * false otherwise.
     */
    initEventIndex(): Promise<boolean>;
    /**
     * Check if the current platform has support for event indexing.
     *
     * @return {boolean} True if it has support, false otherwise. Note that this
     * does not mean that support is installed.
     */
    platformHasSupport(): boolean;
    /**
     * Check if event indexing support is installed for the platform.
     *
     * Event indexing might require additional optional modules to be installed,
     * this tells us if those are installed. Note that this should only be
     * called after the init() method was called.
     *
     * @return {boolean} True if support is installed, false otherwise.
     */
    supportIsInstalled(): boolean;
    /**
     * Get the current event index.
     *
     * @return {EventIndex} The current event index.
     */
    get(): EventIndex;
    start(): void;
    stop(): void;
    /**
     * Unset our event store
     *
     * After a call to this the init() method will need to be called again.
     *
     * @return {Promise} A promise that will resolve once the event index is
     * closed.
     */
    unset(): Promise<void>;
    /**
     * Delete our event indexer.
     *
     * After a call to this the init() method will need to be called again.
     *
     * @return {Promise} A promise that will resolve once the event index is
     * deleted.
     */
    deleteEventIndex(): Promise<void>;
}
declare const _default: EventIndexPeg;
export default _default;
