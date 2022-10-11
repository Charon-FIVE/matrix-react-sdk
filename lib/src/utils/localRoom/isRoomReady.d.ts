import { MatrixClient } from "matrix-js-sdk/src/matrix";
import { LocalRoom } from "../../models/LocalRoom";
/**
 * Tests whether a room created based on a local room is ready.
 */
export declare function isRoomReady(client: MatrixClient, localRoom: LocalRoom): boolean;
