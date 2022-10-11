/// <reference types="node" />
import { Room } from "matrix-js-sdk/src/models/room";
import { EventEmitter } from "events";
import { RoomUpdateCause, TagID } from "../models";
import { IListOrderingMap, ITagMap, ITagSortingMap, ListAlgorithm, SortAlgorithm } from "./models";
/**
 * Fired when the Algorithm has determined a list has been updated.
 */
export declare const LIST_UPDATED_EVENT = "list_updated_event";
/**
 * Represents a list ordering algorithm. This class will take care of tag
 * management (which rooms go in which tags) and ask the implementation to
 * deal with ordering mechanics.
 */
export declare class Algorithm extends EventEmitter {
    private _cachedRooms;
    private _cachedStickyRooms;
    private _stickyRoom;
    private _lastStickyRoom;
    private sortAlgorithms;
    private listAlgorithms;
    private algorithms;
    private rooms;
    private roomIdsToTags;
    /**
     * Set to true to suspend emissions of algorithm updates.
     */
    updatesInhibited: boolean;
    start(): void;
    stop(): void;
    get stickyRoom(): Room;
    get knownRooms(): Room[];
    get hasTagSortingMap(): boolean;
    protected set cachedRooms(val: ITagMap);
    protected get cachedRooms(): ITagMap;
    /**
     * Awaitable version of the sticky room setter.
     * @param val The new room to sticky.
     */
    setStickyRoom(val: Room): void;
    getTagSorting(tagId: TagID): SortAlgorithm;
    setTagSorting(tagId: TagID, sort: SortAlgorithm): void;
    getListOrdering(tagId: TagID): ListAlgorithm;
    setListOrdering(tagId: TagID, order: ListAlgorithm): void;
    private updateStickyRoom;
    private doUpdateStickyRoom;
    private onActiveCalls;
    private initCachedStickyRooms;
    /**
     * Recalculate the sticky room position. If this is being called in relation to
     * a specific tag being updated, it should be given to this function to optimize
     * the call.
     * @param updatedTag The tag that was updated, if possible.
     */
    protected recalculateStickyRoom(updatedTag?: TagID): void;
    /**
     * Recalculate the position of any rooms with calls. If this is being called in
     * relation to a specific tag being updated, it should be given to this function to
     * optimize the call.
     *
     * This expects to be called *after* the sticky rooms are updated, and sticks the
     * room with the currently active call to the top of its tag.
     *
     * @param updatedTag The tag that was updated, if possible.
     */
    protected recalculateActiveCallRooms(updatedTag?: TagID): void;
    /**
     * Asks the Algorithm to regenerate all lists, using the tags given
     * as reference for which lists to generate and which way to generate
     * them.
     * @param {ITagSortingMap} tagSortingMap The tags to generate.
     * @param {IListOrderingMap} listOrderingMap The ordering of those tags.
     */
    populateTags(tagSortingMap: ITagSortingMap, listOrderingMap: IListOrderingMap): void;
    /**
     * Gets an ordered set of rooms for the all known tags.
     * @returns {ITagMap} The cached list of rooms, ordered,
     * for each tag. May be empty, but never null/undefined.
     */
    getOrderedRooms(): ITagMap;
    /**
     * This returns the same as getOrderedRooms(), but without the sticky room
     * map as it causes issues for sticky room handling (see sticky room handling
     * for more information).
     * @returns {ITagMap} The cached list of rooms, ordered,
     * for each tag. May be empty, but never null/undefined.
     */
    private getOrderedRoomsWithoutSticky;
    /**
     * Seeds the Algorithm with a set of rooms. The algorithm will discard all
     * previously known information and instead use these rooms instead.
     * @param {Room[]} rooms The rooms to force the algorithm to use.
     */
    setKnownRooms(rooms: Room[]): void;
    getTagsForRoom(room: Room): TagID[];
    private getTagsOfJoinedRoom;
    /**
     * Updates the roomsToTags map
     */
    private updateTagsFromCache;
    /**
     * Called when the Algorithm believes a complete regeneration of the existing
     * lists is needed.
     * @param {ITagMap} updatedTagMap The tag map which needs populating. Each tag
     * will already have the rooms which belong to it - they just need ordering. Must
     * be mutated in place.
     */
    private generateFreshTags;
    /**
     * Asks the Algorithm to update its knowledge of a room. For example, when
     * a user tags a room, joins/creates a room, or leaves a room the Algorithm
     * should be told that the room's info might have changed. The Algorithm
     * may no-op this request if no changes are required.
     * @param {Room} room The room which might have affected sorting.
     * @param {RoomUpdateCause} cause The reason for the update being triggered.
     * @returns {Promise<boolean>} A boolean of whether or not getOrderedRooms()
     * should be called after processing.
     */
    handleRoomUpdate(room: Room, cause: RoomUpdateCause): boolean;
}
