import PermalinkConstructor, { PermalinkParts } from "./PermalinkConstructor";
/**
 * Generates matrix: scheme permalinks
 */
export default class MatrixSchemePermalinkConstructor extends PermalinkConstructor {
    constructor();
    private encodeEntity;
    forEvent(roomId: string, eventId: string, serverCandidates: string[]): string;
    forRoom(roomIdOrAlias: string, serverCandidates: string[]): string;
    forUser(userId: string): string;
    forGroup(groupId: string): string;
    forEntity(entityId: string): string;
    isPermalinkHost(testHost: string): boolean;
    encodeServerCandidates(candidates: string[]): string;
    parsePermalink(fullUrl: string): PermalinkParts;
}
