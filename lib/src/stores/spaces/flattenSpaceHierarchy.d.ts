import { SpaceKey } from ".";
export declare type SpaceEntityMap = Map<SpaceKey, Set<string>>;
export declare type SpaceDescendantMap = Map<SpaceKey, Set<SpaceKey>>;
/**
 * Helper function to traverse space hierarchy and flatten
 * @param spaceEntityMap ie map of rooms or dm userIds
 * @param spaceDescendantMap map of spaces and their children
 * @returns set of all rooms
 */
export declare const flattenSpaceHierarchy: (spaceEntityMap: SpaceEntityMap, spaceDescendantMap: SpaceDescendantMap, spaceId: SpaceKey) => Set<string>;
export declare const flattenSpaceHierarchyWithCache: (cache: SpaceEntityMap) => (spaceEntityMap: SpaceEntityMap, spaceDescendantMap: SpaceDescendantMap, spaceId: SpaceKey, useCache?: boolean) => Set<string>;
