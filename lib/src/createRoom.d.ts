import { MatrixClient } from "matrix-js-sdk/src/client";
import { Room } from "matrix-js-sdk/src/models/room";
import { RoomType } from "matrix-js-sdk/src/@types/event";
import { ICreateRoomOpts } from "matrix-js-sdk/src/@types/requests";
import { HistoryVisibility, JoinRule } from "matrix-js-sdk/src/@types/partials";
export interface IOpts {
    dmUserId?: string;
    createOpts?: ICreateRoomOpts;
    spinner?: boolean;
    guestAccess?: boolean;
    encryption?: boolean;
    inlineErrors?: boolean;
    andView?: boolean;
    avatar?: File | string;
    roomType?: RoomType | string;
    historyVisibility?: HistoryVisibility;
    parentSpace?: Room;
    suggested?: boolean;
    joinRule?: JoinRule;
}
/**
 * Create a new room, and switch to it.
 *
 * @param {object=} opts parameters for creating the room
 * @param {string=} opts.dmUserId If specified, make this a DM room for this user and invite them
 * @param {object=} opts.createOpts set of options to pass to createRoom call.
 * @param {bool=} opts.spinner True to show a modal spinner while the room is created.
 *     Default: True
 * @param {bool=} opts.guestAccess Whether to enable guest access.
 *     Default: True
 * @param {bool=} opts.encryption Whether to enable encryption.
 *     Default: False
 * @param {bool=} opts.inlineErrors True to raise errors off the promise instead of resolving to null.
 *     Default: False
 * @param {bool=} opts.andView True to dispatch an action to view the room once it has been created.
 *
 * @returns {Promise} which resolves to the room id, or null if the
 * action was aborted or failed.
 */
export default function createRoom(opts: IOpts): Promise<string | null>;
export declare function canEncryptToAllUsers(client: MatrixClient, userIds: string[]): Promise<boolean>;
export declare function ensureVirtualRoomExists(client: MatrixClient, userId: string, nativeRoomId: string): Promise<string>;
export declare function ensureDMExists(client: MatrixClient, userId: string): Promise<string>;
