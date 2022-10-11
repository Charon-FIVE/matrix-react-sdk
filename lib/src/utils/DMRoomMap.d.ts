import { Room } from "matrix-js-sdk/src/models/room";
import { MatrixClient } from "matrix-js-sdk/src/client";
import { Optional } from "matrix-events-sdk";
/**
 * Class that takes a Matrix Client and flips the m.direct map
 * so the operation of mapping a room ID to which user it's a DM
 * with can be performed efficiently.
 *
 * With 'start', this can also keep itself up to date over time.
 */
export default class DMRoomMap {
    private readonly matrixClient;
    private static sharedInstance;
    private roomToUser;
    private userToRooms;
    private hasSentOutPatchDirectAccountDataPatch;
    private mDirectEvent;
    constructor(matrixClient: MatrixClient);
    /**
     * Makes and returns a new shared instance that can then be accessed
     * with shared(). This returned instance is not automatically started.
     */
    static makeShared(): DMRoomMap;
    /**
     * Set the shared instance to the instance supplied
     * Used by tests
     * @param inst the new shared instance
     */
    static setShared(inst: DMRoomMap): void;
    /**
     * Returns a shared instance of the class
     * that uses the singleton matrix client
     * The shared instance must be started before use.
     */
    static shared(): DMRoomMap;
    start(): void;
    stop(): void;
    private onAccountData;
    /**
     * some client bug somewhere is causing some DMs to be marked
     * with ourself, not the other user. Fix it by guessing the other user and
     * modifying userToRooms
     */
    private patchUpSelfDMs;
    getDMRoomsForUserId(userId: string): string[];
    /**
     * Gets the DM room which the given IDs share, if any.
     * @param {string[]} ids The identifiers (user IDs and email addresses) to look for.
     * @returns {Room} The DM room which all IDs given share, or falsy if no common room.
     */
    getDMRoomForIdentifiers(ids: string[]): Room;
    getUserIdForRoomId(roomId: string): Optional<string>;
    getUniqueRoomsWithIndividuals(): {
        [userId: string]: Room;
    };
    private getUserToRooms;
    private populateRoomToUser;
}
