/// <reference types="node" />
import { EventEmitter } from "events";
import { Direction, EventTimeline } from 'matrix-js-sdk/src/models/event-timeline';
import { Room } from 'matrix-js-sdk/src/models/room';
import { EventTimelineSet } from 'matrix-js-sdk/src/models/event-timeline-set';
import { TimelineWindow } from 'matrix-js-sdk/src/timeline-window';
import { IResultRoomEvents } from "matrix-js-sdk/src/@types/search";
import { ISearchArgs } from "./BaseEventIndexManager";
export default class EventIndex extends EventEmitter {
    private crawlerCheckpoints;
    private crawler;
    private currentCheckpoint;
    init(): Promise<void>;
    /**
     * Register event listeners that are necessary for the event index to work.
     */
    registerListeners(): void;
    /**
     * Remove the event index specific event listeners.
     */
    removeListeners(): void;
    /**
     * Get crawler checkpoints for the encrypted rooms and store them in the index.
     */
    addInitialCheckpoints(): Promise<void>;
    private onSync;
    private onRoomTimeline;
    private onRoomStateEvent;
    private redactEvent;
    private onTimelineReset;
    /**
     * Check if an event should be added to the event index.
     *
     * Most notably we filter events for which decryption failed, are redacted
     * or aren't of a type that we know how to index.
     *
     * @param {MatrixEvent} ev The event that should be checked.
     * @returns {bool} Returns true if the event can be indexed, false
     * otherwise.
     */
    private isValidEvent;
    private eventToJson;
    /**
     * Queue up live events to be added to the event index.
     *
     * @param {MatrixEvent} ev The event that should be added to the index.
     */
    private addLiveEventToIndex;
    /**
     * Emmit that the crawler has changed the checkpoint that it's currently
     * handling.
     */
    private emitNewCheckpoint;
    private addEventsFromLiveTimeline;
    private addRoomCheckpoint;
    /**
     * The main crawler loop.
     *
     * Goes through crawlerCheckpoints and fetches events from the server to be
     * added to the EventIndex.
     *
     * If a /room/{roomId}/messages request doesn't contain any events, stop the
     * crawl, otherwise create a new checkpoint and push it to the
     * crawlerCheckpoints queue, so we go through them in a round-robin way.
     */
    private crawlerFunc;
    /**
     * Start the crawler background task.
     */
    startCrawler(): void;
    /**
     * Stop the crawler background task.
     */
    stopCrawler(): void;
    /**
     * Close the event index.
     *
     * This removes all the MatrixClient event listeners, stops the crawler
     * task, and closes the index.
     */
    close(): Promise<void>;
    /**
     * Search the event index using the given term for matching events.
     *
     * @param {ISearchArgs} searchArgs The search configuration for the search,
     * sets the search term and determines the search result contents.
     *
     * @return {Promise<IResultRoomEvents[]>} A promise that will resolve to an array
     * of search results once the search is done.
     */
    search(searchArgs: ISearchArgs): Promise<IResultRoomEvents>;
    /**
     * Load events that contain URLs from the event index.
     *
     * @param {Room} room The room for which we should fetch events containing
     * URLs
     *
     * @param {number} limit The maximum number of events to fetch.
     *
     * @param {string} fromEvent From which event should we continue fetching
     * events from the index. This is only needed if we're continuing to fill
     * the timeline, e.g. if we're paginating. This needs to be set to a event
     * id of an event that was previously fetched with this function.
     *
     * @param {string} direction The direction in which we will continue
     * fetching events. EventTimeline.BACKWARDS to continue fetching events that
     * are older than the event given in fromEvent, EventTimeline.FORWARDS to
     * fetch newer events.
     *
     * @returns {Promise<MatrixEvent[]>} Resolves to an array of events that
     * contain URLs.
     */
    loadFileEvents(room: Room, limit?: number, fromEvent?: string, direction?: string): Promise<any>;
    /**
     * Fill a timeline with events that contain URLs.
     *
     * @param {TimelineSet} timelineSet The TimelineSet the Timeline belongs to,
     * used to check if we're adding duplicate events.
     *
     * @param {Timeline} timeline The Timeline which should be filed with
     * events.
     *
     * @param {Room} room The room for which we should fetch events containing
     * URLs
     *
     * @param {number} limit The maximum number of events to fetch.
     *
     * @param {string} fromEvent From which event should we continue fetching
     * events from the index. This is only needed if we're continuing to fill
     * the timeline, e.g. if we're paginating. This needs to be set to a event
     * id of an event that was previously fetched with this function.
     *
     * @param {string} direction The direction in which we will continue
     * fetching events. EventTimeline.BACKWARDS to continue fetching events that
     * are older than the event given in fromEvent, EventTimeline.FORWARDS to
     * fetch newer events.
     *
     * @returns {Promise<boolean>} Resolves to true if events were added to the
     * timeline, false otherwise.
     */
    populateFileTimeline(timelineSet: EventTimelineSet, timeline: EventTimeline, room: Room, limit?: number, fromEvent?: string, direction?: string): Promise<boolean>;
    /**
     * Emulate a TimelineWindow pagination() request with the event index as the event source
     *
     * Might not fetch events from the index if the timeline already contains
     * events that the window isn't showing.
     *
     * @param {Room} room The room for which we should fetch events containing
     * URLs
     *
     * @param {TimelineWindow} timelineWindow The timeline window that should be
     * populated with new events.
     *
     * @param {string} direction The direction in which we should paginate.
     * EventTimeline.BACKWARDS to paginate back, EventTimeline.FORWARDS to
     * paginate forwards.
     *
     * @param {number} limit The maximum number of events to fetch while
     * paginating.
     *
     * @returns {Promise<boolean>} Resolves to a boolean which is true if more
     * events were successfully retrieved.
     */
    paginateTimelineWindow(room: Room, timelineWindow: TimelineWindow, direction: Direction, limit: number): Promise<boolean>;
    /**
     * Get statistical information of the index.
     *
     * @return {Promise<IndexStats>} A promise that will resolve to the index
     * statistics.
     */
    getStats(): Promise<import("./BaseEventIndexManager").IIndexStats>;
    /**
     * Check if the room with the given id is already indexed.
     *
     * @param {string} roomId The ID of the room which we want to check if it
     * has been already indexed.
     *
     * @return {Promise<boolean>} Returns true if the index contains events for
     * the given room, false otherwise.
     */
    isRoomIndexed(roomId: any): Promise<boolean>;
    /**
     * Get the room that we are currently crawling.
     *
     * @returns {Room} A MatrixRoom that is being currently crawled, null
     * if no room is currently being crawled.
     */
    currentRoom(): Room;
    crawlingRooms(): {
        crawlingRooms: Set<unknown>;
        totalRooms: Set<unknown>;
    };
}
