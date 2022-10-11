import { MatrixClient } from "matrix-js-sdk/src/client";
import { Room } from "matrix-js-sdk/src/models/room";
import { LocalRoom } from "../models/LocalRoom";
export declare function startDmOnFirstMessage(client: MatrixClient, targets: Member[]): Promise<Room>;
/**
 * Starts a DM based on a local room.
 *
 * @async
 * @param {MatrixClient} client
 * @param {LocalRoom} localRoom
 * @returns {Promise<string | void>} Resolves to the created room id
 */
export declare function createRoomFromLocalRoom(client: MatrixClient, localRoom: LocalRoom): Promise<string | void>;
export declare abstract class Member {
    /**
     * The display name of this Member. For users this should be their profile's display
     * name or user ID if none set. For 3PIDs this should be the 3PID address (email).
     */
    abstract get name(): string;
    /**
     * The ID of this Member. For users this should be their user ID. For 3PIDs this should
     * be the 3PID address (email).
     */
    abstract get userId(): string;
    /**
     * Gets the MXC URL of this Member's avatar. For users this should be their profile's
     * avatar MXC URL or null if none set. For 3PIDs this should always be null.
     */
    abstract getMxcAvatarUrl(): string;
}
export declare class DirectoryMember extends Member {
    private readonly _userId;
    private readonly displayName?;
    private readonly avatarUrl?;
    constructor(userDirResult: {
        user_id: string;
        display_name?: string;
        avatar_url?: string;
    });
    get name(): string;
    get userId(): string;
    getMxcAvatarUrl(): string;
}
export declare class ThreepidMember extends Member {
    private readonly id;
    constructor(id: string);
    get isEmail(): boolean;
    get name(): string;
    get userId(): string;
    getMxcAvatarUrl(): string;
}
export interface IDMUserTileProps {
    member: Member;
    onRemove(member: Member): void;
}
/**
 * Detects whether a room should be encrypted.
 *
 * @async
 * @param {MatrixClient} client
 * @param {Member[]} targets The members to which run the check against
 * @returns {Promise<boolean>}
 */
export declare function determineCreateRoomEncryptionOption(client: MatrixClient, targets: Member[]): Promise<boolean>;
