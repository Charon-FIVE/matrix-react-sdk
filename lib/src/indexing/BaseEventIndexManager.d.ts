import { IMatrixProfile, IEventWithRoomId as IMatrixEvent, IResultRoomEvents } from "matrix-js-sdk/src/@types/search";
import { Direction } from "matrix-js-sdk/src/matrix";
export interface ICrawlerCheckpoint {
    roomId: string;
    token: string;
    fullCrawl?: boolean;
    direction: Direction;
}
export interface ISearchArgs {
    search_term: string;
    before_limit: number;
    after_limit: number;
    order_by_recency: boolean;
    room_id?: string;
    limit: number;
    next_batch?: string;
}
export interface IEventAndProfile {
    event: IMatrixEvent;
    profile: IMatrixProfile;
}
export interface ILoadArgs {
    roomId: string;
    limit: number;
    fromEvent?: string;
    direction?: string;
}
export interface IIndexStats {
    size: number;
    eventCount: number;
    roomCount: number;
}
/**
 * Base class for classes that provide platform-specific event indexing.
 *
 * Instances of this class are provided by the application.
 */
export default abstract class BaseEventIndexManager {
    /**
     * Does our EventIndexManager support event indexing.
     *
     * If an EventIndexManager implementor has runtime dependencies that
     * optionally enable event indexing they may override this method to perform
     * the necessary runtime checks here.
     *
     * @return {Promise} A promise that will resolve to true if event indexing
     * is supported, false otherwise.
     */
    supportsEventIndexing(): Promise<boolean>;
    /**
     * Initialize the event index for the given user.
     *
     * @param {string} userId The event that should be added to the index.
     * @param {string} deviceId The profile of the event sender at the
     *
     * @return {Promise} A promise that will resolve when the event index is
     * initialized.
     */
    initEventIndex(userId: string, deviceId: string): Promise<void>;
    /**
     * Queue up an event to be added to the index.
     *
     * @param {MatrixEvent} ev The event that should be added to the index.
     * @param {IMatrixProfile} profile The profile of the event sender at the
     * time the event was received.
     *
     * @return {Promise} A promise that will resolve when the was queued up for
     * addition.
     */
    addEventToIndex(ev: IMatrixEvent, profile: IMatrixProfile): Promise<void>;
    deleteEvent(eventId: string): Promise<boolean>;
    isEventIndexEmpty(): Promise<boolean>;
    /**
     * Check if our event index is empty.
     */
    indexIsEmpty(): Promise<boolean>;
    /**
     * Check if the room with the given id is already indexed.
     *
     * @param {string} roomId The ID of the room which we want to check if it
     * has been already indexed.
     *
     * @return {Promise<boolean>} Returns true if the index contains events for
     * the given room, false otherwise.
     */
    isRoomIndexed(roomId: string): Promise<boolean>;
    /**
     * Get statistical information of the index.
     *
     * @return {Promise<IIndexStats>} A promise that will resolve to the index
     * statistics.
     */
    getStats(): Promise<IIndexStats>;
    /**
     * Get the user version of the database.
     * @return {Promise<number>} A promise that will resolve to the user stored
     * version number.
     */
    getUserVersion(): Promise<number>;
    /**
     * Set the user stored version to the given version number.
     *
     * @param {number} version The new version that should be stored in the
     * database.
     *
     * @return {Promise<void>} A promise that will resolve once the new version
     * is stored.
     */
    setUserVersion(version: number): Promise<void>;
    /**
     * Commit the previously queued up events to the index.
     *
     * @return {Promise} A promise that will resolve once the queued up events
     * were added to the index.
     */
    commitLiveEvents(): Promise<void>;
    /**
     * Search the event index using the given term for matching events.
     *
     * @param {ISearchArgs} searchArgs The search configuration for the search,
     * sets the search term and determines the search result contents.
     *
     * @return {Promise<IResultRoomEvents[]>} A promise that will resolve to an array
     * of search results once the search is done.
     */
    searchEventIndex(searchArgs: ISearchArgs): Promise<IResultRoomEvents>;
    /**
     * Add events from the room history to the event index.
     *
     * This is used to add a batch of events to the index.
     *
     * @param {[IEventAndProfile]} events The list of events and profiles that
     * should be added to the event index.
     * @param {[ICrawlerCheckpoint]} checkpoint A new crawler checkpoint that
     * should be stored in the index which should be used to continue crawling
     * the room.
     * @param {[ICrawlerCheckpoint]} oldCheckpoint The checkpoint that was used
     * to fetch the current batch of events. This checkpoint will be removed
     * from the index.
     *
     * @return {Promise} A promise that will resolve to true if all the events
     * were already added to the index, false otherwise.
     */
    addHistoricEvents(events: IEventAndProfile[], checkpoint: ICrawlerCheckpoint | null, oldCheckpoint: ICrawlerCheckpoint | null): Promise<boolean>;
    /**
     * Add a new crawler checkpoint to the index.
     *
     * @param {ICrawlerCheckpoint} checkpoint The checkpoint that should be added
     * to the index.
     *
     * @return {Promise} A promise that will resolve once the checkpoint has
     * been stored.
     */
    addCrawlerCheckpoint(checkpoint: ICrawlerCheckpoint): Promise<void>;
    /**
     * Add a new crawler checkpoint to the index.
     *
     * @param {ICrawlerCheckpoint} checkpoint The checkpoint that should be
     * removed from the index.
     *
     * @return {Promise} A promise that will resolve once the checkpoint has
     * been removed.
     */
    removeCrawlerCheckpoint(checkpoint: ICrawlerCheckpoint): Promise<void>;
    /**
     * Load the stored checkpoints from the index.
     *
     * @return {Promise<[ICrawlerCheckpoint]>} A promise that will resolve to an
     * array of crawler checkpoints once they have been loaded from the index.
     */
    loadCheckpoints(): Promise<ICrawlerCheckpoint[]>;
    /** Load events that contain an mxc URL to a file from the index.
     *
     * @param  {object} args Arguments object for the method.
     * @param  {string} args.roomId The ID of the room for which the events
     * should be loaded.
     * @param  {number} args.limit The maximum number of events to return.
     * @param  {string} args.fromEvent An event id of a previous event returned
     * by this method. Passing this means that we are going to continue loading
     * events from this point in the history.
     * @param  {string} args.direction The direction to which we should continue
     * loading events from. This is used only if fromEvent is used as well.
     *
     * @return {Promise<[IEventAndProfile]>} A promise that will resolve to an
     * array of Matrix events that contain mxc URLs accompanied with the
     * historic profile of the sender.
     */
    loadFileEvents(args: ILoadArgs): Promise<IEventAndProfile[]>;
    /**
     * close our event index.
     *
     * @return {Promise} A promise that will resolve once the event index has
     * been closed.
     */
    closeEventIndex(): Promise<void>;
    /**
     * Delete our current event index.
     *
     * @return {Promise} A promise that will resolve once the event index has
     * been deleted.
     */
    deleteEventIndex(): Promise<void>;
}
