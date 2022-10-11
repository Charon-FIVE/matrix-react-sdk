import { MatrixClient } from "matrix-js-sdk/src/matrix";
import { LocalRoom } from "../models/LocalRoom";
/**
 * Does a room action:
 * For non-local rooms it calls fn directly.
 * For local rooms it adds the callback function to the room's afterCreateCallbacks and
 * dispatches a "local_room_event".
 *
 * @async
 * @template T
 * @param {string} roomId Room ID of the target room
 * @param {(actualRoomId: string) => Promise<T>} fn Callback to be called directly or collected at the local room
 * @param {MatrixClient} [client]
 * @returns {Promise<T>} Promise that gets resolved after the callback has finished
 */
export declare function doMaybeLocalRoomAction<T>(roomId: string, fn: (actualRoomId: string) => Promise<T>, client?: MatrixClient): Promise<T>;
/**
 * Waits until a room is ready and then applies the after-create local room callbacks.
 * Also implements a stopgap timeout after that a room is assumed to be ready.
 *
 * @see isRoomReady
 * @async
 * @param {MatrixClient} client
 * @param {LocalRoom} localRoom
 * @returns {Promise<string>} Resolved to the actual room id
 */
export declare function waitForRoomReadyAndApplyAfterCreateCallbacks(client: MatrixClient, localRoom: LocalRoom): Promise<string>;
