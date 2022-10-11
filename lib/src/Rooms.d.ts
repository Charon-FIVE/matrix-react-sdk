import { Room } from "matrix-js-sdk/src/models/room";
/**
 * Given a room object, return the alias we should use for it,
 * if any. This could be the canonical alias if one exists, otherwise
 * an alias selected arbitrarily but deterministically from the list
 * of aliases. Otherwise return null;
 *
 * @param {Object} room The room object
 * @returns {string} A display alias for the given room
 */
export declare function getDisplayAliasForRoom(room: Room): string;
export declare function getDisplayAliasForAliasSet(canonicalAlias: string, altAliases: string[]): string;
export declare function guessAndSetDMRoom(room: Room, isDirect: boolean): Promise<void>;
/**
 * Marks or unmarks the given room as being as a DM room.
 * @param {string} roomId The ID of the room to modify
 * @param {string} userId The user ID of the desired DM
 room target user or null to un-mark
 this room as a DM room
 * @returns {object} A promise
 */
export declare function setDMRoom(roomId: string, userId: string): Promise<void>;
