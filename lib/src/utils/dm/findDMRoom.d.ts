import { MatrixClient, Room } from "matrix-js-sdk/src/matrix";
import { Member } from "../direct-messages";
/**
 * Tries to find a DM room with some other users.
 *
 * @param {MatrixClient} client
 * @param {Member[]} targets The Members to try to find the room for
 * @returns {Room | null} Resolved so the room if found, else null
 */
export declare function findDMRoom(client: MatrixClient, targets: Member[]): Room | null;
