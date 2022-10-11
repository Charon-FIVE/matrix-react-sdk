import { Room } from "matrix-js-sdk/src/models/room";
import { AsyncStoreWithClient } from "./AsyncStoreWithClient";
import { SettingUpdatedPayload } from "../dispatcher/payloads/SettingUpdatedPayload";
import { ViewRoomPayload } from "../dispatcher/payloads/ViewRoomPayload";
import { JoinRoomPayload } from "../dispatcher/payloads/JoinRoomPayload";
interface IState {
    enabled?: boolean;
    rooms?: Room[];
}
export declare class BreadcrumbsStore extends AsyncStoreWithClient<IState> {
    private static readonly internalInstance;
    private waitingRooms;
    private constructor();
    static get instance(): BreadcrumbsStore;
    get rooms(): Room[];
    get visible(): boolean;
    get meetsRoomRequirement(): boolean;
    protected onAction(payload: SettingUpdatedPayload | ViewRoomPayload | JoinRoomPayload): Promise<void>;
    protected onReady(): Promise<void>;
    protected onNotReady(): Promise<void>;
    private onMyMembership;
    private onRoom;
    private updateRooms;
    private appendRoom;
}
export {};
