import { ActionPayload } from "../dispatcher/payloads";
import { AsyncStoreWithClient } from "./AsyncStoreWithClient";
import { Call } from "../models/Call";
export declare enum CallStoreEvent {
    Call = "call",
    ActiveCalls = "active_calls"
}
export declare class CallStore extends AsyncStoreWithClient<{}> {
    private static _instance;
    static get instance(): CallStore;
    private constructor();
    protected onAction(payload: ActionPayload): Promise<void>;
    protected onReady(): Promise<any>;
    protected onNotReady(): Promise<any>;
    private _activeCalls;
    /**
     * The calls to which the user is currently connected.
     */
    get activeCalls(): Set<Call>;
    private set activeCalls(value);
    private calls;
    private callListeners;
    private updateRoom;
    /**
     * Gets the call associated with the given room, if any.
     * @param {string} roomId The room's ID.
     * @returns {Call | null} The call.
     */
    get(roomId: string): Call | null;
    private onRoom;
    private onRoomState;
    private onWidgets;
}
