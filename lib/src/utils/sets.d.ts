import { Diff } from "./arrays";
/**
 * Determines if two sets are different through a shallow comparison.
 * @param a The first set. Must be defined.
 * @param b The second set. Must be defined.
 * @returns True if they are different, false otherwise.
 */
export declare function setHasDiff<T>(a: Set<T>, b: Set<T>): boolean;
/**
 * Determines the values added and removed between two sets.
 * @param a The first set. Must be defined.
 * @param b The second set. Must be defined.
 * @returns The difference between the values in each set.
 */
export declare function setDiff<T>(a: Set<T>, b: Set<T>): Diff<T>;
