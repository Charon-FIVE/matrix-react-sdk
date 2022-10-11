/**
 * Interface for classes that actually produce permalinks (strings).
 * TODO: Convert this to a real TypeScript interface
 */
export default class PermalinkConstructor {
    forEvent(roomId: string, eventId: string, serverCandidates?: string[]): string;
    forRoom(roomIdOrAlias: string, serverCandidates?: string[]): string;
    forGroup(groupId: string): string;
    forUser(userId: string): string;
    forEntity(entityId: string): string;
    isPermalinkHost(host: string): boolean;
    parsePermalink(fullUrl: string): PermalinkParts;
}
export declare class PermalinkParts {
    roomIdOrAlias: string;
    eventId: string;
    userId: string;
    viaServers: string[];
    groupId: string;
    constructor(roomIdOrAlias: string, eventId: string, userId: string, groupId: string, viaServers: string[]);
    static forUser(userId: string): PermalinkParts;
    static forGroup(groupId: string): PermalinkParts;
    static forRoom(roomIdOrAlias: string, viaServers?: string[]): PermalinkParts;
    static forEvent(roomId: string, eventId: string, viaServers?: string[]): PermalinkParts;
    get primaryEntityId(): string;
    get sigil(): string;
}
