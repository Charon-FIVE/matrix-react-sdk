import { Room } from "matrix-js-sdk/src/models/room";
import { PermalinkParts } from "./PermalinkConstructor";
export declare class RoomPermalinkCreator {
    private room;
    private roomId;
    private highestPlUserId;
    private populationMap;
    private bannedHostsRegexps;
    private allowedHostsRegexps;
    private _serverCandidates;
    private started;
    constructor(room: Room, roomId?: string | null, shouldThrottle?: boolean);
    load(): void;
    start(): void;
    stop(): void;
    get serverCandidates(): string[];
    isStarted(): boolean;
    forEvent(eventId: string): string;
    forShareableRoom(): string;
    forRoom(): string;
    private onRoomStateUpdate;
    private fullUpdate;
    private updateHighestPlUser;
    private updateAllowedServers;
    private updatePopulationMap;
    private updateServerCandidates;
}
export declare function makeGenericPermalink(entityId: string): string;
export declare function makeUserPermalink(userId: string): string;
export declare function makeRoomPermalink(roomId: string): string;
export declare function makeGroupPermalink(groupId: string): string;
export declare function isPermalinkHost(host: string): boolean;
/**
 * Transforms an entity (permalink, room alias, user ID, etc) into a local URL
 * if possible. If it is already a permalink (matrix.to) it gets returned
 * unchanged.
 * @param {string} entity The entity to transform.
 * @returns {string|null} The transformed permalink or null if unable.
 */
export declare function tryTransformEntityToPermalink(entity: string): string;
/**
 * Transforms a permalink (or possible permalink) into a local URL if possible. If
 * the given permalink is found to not be a permalink, it'll be returned unaltered.
 * @param {string} permalink The permalink to try and transform.
 * @returns {string} The transformed permalink or original URL if unable.
 */
export declare function tryTransformPermalinkToLocalHref(permalink: string): string;
export declare function getPrimaryPermalinkEntity(permalink: string): string;
export declare function parsePermalink(fullUrl: string): PermalinkParts;
export declare const calculateRoomVia: (room: Room) => string[];
