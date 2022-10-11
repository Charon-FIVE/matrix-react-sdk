import { MatrixClient } from "matrix-js-sdk/src/matrix";
import { LocalRoom } from "../../../src/models/LocalRoom";
import { Member } from "../../../src/utils/direct-messages";
/**
 * Create a DM local room. This room will not be send to the server and only exists inside the client.
 * It sets up the local room with some artificial state events
 * so that can be used in most components instead of a „real“ room.
 *
 * @async
 * @param {MatrixClient} client
 * @param {Member[]} targets DM partners
 * @returns {Promise<LocalRoom>} Resolves to the new local room
 */
export declare function createDmLocalRoom(client: MatrixClient, targets: Member[]): Promise<LocalRoom>;
