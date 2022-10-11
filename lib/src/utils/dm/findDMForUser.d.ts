import { MatrixClient, Room } from "matrix-js-sdk/src/matrix";
/**
 * Tries to find a DM room with a specific user.
 *
 * @param {MatrixClient} client
 * @param {string} userId ID of the user to find the DM for
 * @returns {Room} Room if found
 */
export declare function findDMForUser(client: MatrixClient, userId: string): Room;
