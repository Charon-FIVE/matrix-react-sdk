import { ListIteratee, Many } from "lodash";
import { Room } from "matrix-js-sdk/src/models/room";
import { AsyncStoreWithClient } from "../AsyncStoreWithClient";
import { SpaceNotificationState } from "../notifications/SpaceNotificationState";
import { SettingUpdatedPayload } from "../../dispatcher/payloads/SettingUpdatedPayload";
import { ISuggestedRoom, MetaSpace, SpaceKey } from ".";
import { ViewRoomPayload } from "../../dispatcher/payloads/ViewRoomPayload";
import { ViewHomePagePayload } from "../../dispatcher/payloads/ViewHomePagePayload";
import { SwitchSpacePayload } from "../../dispatcher/payloads/SwitchSpacePayload";
import { AfterLeaveRoomPayload } from "../../dispatcher/payloads/AfterLeaveRoomPayload";
interface IState {
}
export declare const getChildOrder: (order: string, ts: number, roomId: string) => Array<Many<ListIteratee<unknown>>>;
declare type SpaceStoreActions = SettingUpdatedPayload | ViewRoomPayload | ViewHomePagePayload | SwitchSpacePayload | AfterLeaveRoomPayload;
export declare class SpaceStoreClass extends AsyncStoreWithClient<IState> {
    private rootSpaces;
    private parentMap;
    private notificationStateMap;
    private roomIdsBySpace;
    private childSpacesBySpace;
    private userIdsBySpace;
    private _aggregatedSpaceCache;
    private _activeSpace?;
    private _suggestedRooms;
    private _invitedSpaces;
    private spaceOrderLocalEchoMap;
    private _allRoomsInHome;
    private _enabledMetaSpaces;
    constructor();
    get invitedSpaces(): Room[];
    get enabledMetaSpaces(): MetaSpace[];
    get spacePanelSpaces(): Room[];
    get activeSpace(): SpaceKey;
    get activeSpaceRoom(): Room | null;
    get suggestedRooms(): ISuggestedRoom[];
    get allRoomsInHome(): boolean;
    setActiveRoomInSpace(space: SpaceKey): void;
    /**
     * Sets the active space, updates room list filters,
     * optionally switches the user's room back to where they were when they last viewed that space.
     * @param space which space to switch to.
     * @param contextSwitch whether to switch the user's context,
     * should not be done when the space switch is done implicitly due to another event like switching room.
     */
    setActiveSpace(space: SpaceKey, contextSwitch?: boolean): void;
    private loadSuggestedRooms;
    fetchSuggestedRooms: (space: Room, limit?: number) => Promise<ISuggestedRoom[]>;
    addRoomToSpace(space: Room, roomId: string, via: string[], suggested?: boolean): Promise<import("matrix-js-sdk/src").ISendEventResponse>;
    getChildren(spaceId: string): Room[];
    getChildRooms(spaceId: string): Room[];
    getChildSpaces(spaceId: string): Room[];
    getParents(roomId: string, canonicalOnly?: boolean): Room[];
    getCanonicalParent(roomId: string): Room | null;
    getKnownParents(roomId: string, includeAncestors?: boolean): Set<string>;
    isRoomInSpace(space: SpaceKey, roomId: string, includeDescendantSpaces?: boolean): boolean;
    getSpaceFilteredRoomIds: (space: SpaceKey, includeDescendantSpaces?: boolean, useCache?: boolean) => Set<string>;
    getSpaceFilteredUserIds: (space: SpaceKey, includeDescendantSpaces?: boolean, useCache?: boolean) => Set<string>;
    private getAggregatedRoomIdsBySpace;
    private getAggregatedUserIdsBySpace;
    private markTreeChildren;
    private findRootSpaces;
    private rebuildSpaceHierarchy;
    private rebuildParentMap;
    private rebuildHomeSpace;
    private rebuildMetaSpaces;
    private updateNotificationStates;
    private showInHomeSpace;
    private static isInSpace;
    private onMemberUpdate;
    private onRoomsUpdate;
    private switchSpaceIfNeeded;
    private switchToRelatedSpace;
    private onRoom;
    private notifyIfOrderChanged;
    private onRoomState;
    private onRoomStateMembers;
    private onRoomAccountData;
    private onRoomFavouriteChange;
    private onRoomDmChange;
    private onAccountData;
    protected reset(): Promise<void>;
    protected onNotReady(): Promise<void>;
    protected onReady(): Promise<void>;
    private sendUserProperties;
    private goToFirstSpace;
    protected onAction(payload: SpaceStoreActions): Promise<void>;
    getNotificationState(key: SpaceKey): SpaceNotificationState;
    traverseSpace(spaceId: string, fn: (roomId: string) => void, includeRooms?: boolean, parentPath?: Set<string>): void;
    private getSpaceTagOrdering;
    private sortRootSpaces;
    private setRootSpaceOrder;
    moveRootSpace(fromIndex: number, toIndex: number): void;
}
export default class SpaceStore {
    private static readonly internalInstance;
    static get instance(): SpaceStoreClass;
}
export {};
