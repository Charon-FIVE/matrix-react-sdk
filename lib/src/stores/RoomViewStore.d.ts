import { Store } from 'flux/utils';
import { MatrixError } from "matrix-js-sdk/src/http-api";
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { Optional } from "matrix-events-sdk";
import { ActionPayload } from "../dispatcher/payloads";
declare type Listener = (isActive: boolean) => void;
/**
 * A class for storing application state for RoomView. This is the RoomView's interface
*  with a subset of the js-sdk.
 *  ```
 */
export declare class RoomViewStore extends Store<ActionPayload> {
    static readonly instance: RoomViewStore;
    private state;
    private roomIdActivityListeners;
    constructor();
    addRoomListener(roomId: string, fn: Listener): void;
    removeRoomListener(roomId: string, fn: Listener): void;
    private emitForRoom;
    private setState;
    protected __onDispatch(payload: any): void;
    private viewRoom;
    private viewRoomError;
    private joinRoom;
    private getInvitingUserId;
    showJoinRoomError(err: MatrixError, roomId: string): void;
    private joinRoomError;
    reset(): void;
    getRoomId(): Optional<string>;
    getInitialEventId(): Optional<string>;
    isInitialEventHighlighted(): boolean;
    initialEventScrollIntoView(): boolean;
    getRoomAlias(): Optional<string>;
    isRoomLoading(): boolean;
    getRoomLoadError(): Optional<MatrixError>;
    isJoining(): boolean;
    getJoinError(): Optional<Error>;
    getQuotingEvent(): Optional<MatrixEvent>;
    shouldPeek(): boolean;
    getWasContextSwitch(): boolean;
}
export {};
