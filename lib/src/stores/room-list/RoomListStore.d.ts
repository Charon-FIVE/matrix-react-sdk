import { MatrixClient } from "matrix-js-sdk/src/client";
import { Room } from "matrix-js-sdk/src/models/room";
import { RoomUpdateCause, TagID } from "./models";
import { ITagMap, ListAlgorithm, SortAlgorithm } from "./algorithms/models";
import { ActionPayload } from "../../dispatcher/payloads";
import { IFilterCondition } from "./filters/IFilterCondition";
import { AsyncStoreWithClient } from "../AsyncStoreWithClient";
import { RoomListStore as Interface, RoomListStoreEvent } from "./Interface";
interface IState {
}
export declare const LISTS_UPDATE_EVENT = RoomListStoreEvent.ListsUpdate;
export declare class RoomListStoreClass extends AsyncStoreWithClient<IState> implements Interface {
    /**
     * Set to true if you're running tests on the store. Should not be touched in
     * any other environment.
     */
    static TEST_MODE: boolean;
    private initialListsGenerated;
    private algorithm;
    private prefilterConditions;
    private updateFn;
    constructor();
    private setupWatchers;
    get orderedLists(): ITagMap;
    resetStore(): Promise<void>;
    makeReady(forcedClient?: MatrixClient): Promise<void>;
    /**
     * Handles suspected RoomViewStore changes.
     * @param trigger Set to false to prevent a list update from being sent. Should only
     * be used if the calling code will manually trigger the update.
     */
    private handleRVSUpdate;
    protected onReady(): Promise<any>;
    protected onNotReady(): Promise<any>;
    protected onAction(payload: ActionPayload): Promise<void>;
    protected onDispatchAsync(payload: ActionPayload): Promise<void>;
    private handleRoomUpdate;
    private recalculatePrefiltering;
    setTagSorting(tagId: TagID, sort: SortAlgorithm): void;
    private setAndPersistTagSorting;
    getTagSorting(tagId: TagID): SortAlgorithm;
    private getStoredTagSorting;
    private calculateTagSorting;
    setListOrder(tagId: TagID, order: ListAlgorithm): void;
    private setAndPersistListOrder;
    getListOrder(tagId: TagID): ListAlgorithm;
    private getStoredListOrder;
    private calculateListOrder;
    private updateAlgorithmInstances;
    private onAlgorithmListUpdated;
    private onAlgorithmFilterUpdated;
    private onPrefilterUpdated;
    private getPlausibleRooms;
    /**
     * Regenerates the room whole room list, discarding any previous results.
     *
     * Note: This is only exposed externally for the tests. Do not call this from within
     * the app.
     * @param trigger Set to false to prevent a list update from being sent. Should only
     * be used if the calling code will manually trigger the update.
     */
    regenerateAllLists({ trigger }: {
        trigger?: boolean;
    }): void;
    /**
     * Adds a filter condition to the room list store. Filters may be applied async,
     * and thus might not cause an update to the store immediately.
     * @param {IFilterCondition} filter The filter condition to add.
     */
    addFilter(filter: IFilterCondition): Promise<void>;
    /**
     * Removes a filter condition from the room list store. If the filter was
     * not previously added to the room list store, this will no-op. The effects
     * of removing a filter may be applied async and therefore might not cause
     * an update right away.
     * @param {IFilterCondition} filter The filter condition to remove.
     */
    removeFilter(filter: IFilterCondition): void;
    /**
     * Gets the tags for a room identified by the store. The returned set
     * should never be empty, and will contain DefaultTagID.Untagged if
     * the store is not aware of any tags.
     * @param room The room to get the tags for.
     * @returns The tags for the room.
     */
    getTagsForRoom(room: Room): TagID[];
    /**
     * Manually update a room with a given cause. This should only be used if the
     * room list store would otherwise be incapable of doing the update itself. Note
     * that this may race with the room list's regular operation.
     * @param {Room} room The room to update.
     * @param {RoomUpdateCause} cause The cause to update for.
     */
    manualRoomUpdate(room: Room, cause: RoomUpdateCause): Promise<void>;
}
export default class RoomListStore {
    private static internalInstance;
    static get instance(): Interface;
}
export {};
