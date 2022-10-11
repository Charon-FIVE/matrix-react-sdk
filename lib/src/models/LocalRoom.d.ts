import { MatrixClient, Room } from "matrix-js-sdk/src/matrix";
import { Member } from "../utils/direct-messages";
export declare const LOCAL_ROOM_ID_PREFIX = "local+";
export declare enum LocalRoomState {
    NEW = 0,
    CREATING = 1,
    CREATED = 2,
    ERROR = 3
}
/**
 * A local room that only exists client side.
 * Its main purpose is to be used for temporary rooms when creating a DM.
 */
export declare class LocalRoom extends Room {
    /** Whether the actual room should be encrypted. */
    encrypted: boolean;
    /** If the actual room has been created, this holds its ID. */
    actualRoomId: string;
    /** DM chat partner */
    targets: Member[];
    /** Callbacks that should be invoked after the actual room has been created. */
    afterCreateCallbacks: Function[];
    state: LocalRoomState;
    constructor(roomId: string, client: MatrixClient, myUserId: string);
    get isNew(): boolean;
    get isCreated(): boolean;
    get isError(): boolean;
}
