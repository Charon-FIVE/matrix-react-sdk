/**
 * Quickly resample an array to have less/more data points. If an input which is larger
 * than the desired size is provided, it will be downsampled. Similarly, if the input
 * is smaller than the desired size then it will be upsampled.
 * @param {number[]} input The input array to resample.
 * @param {number} points The number of samples to end up with.
 * @returns {number[]} The resampled array.
 */
export declare function arrayFastResample(input: number[], points: number): number[];
/**
 * Attempts a smooth resample of the given array. This is functionally similar to arrayFastResample
 * though can take longer due to the smoothing of data.
 * @param {number[]} input The input array to resample.
 * @param {number} points The number of samples to end up with.
 * @returns {number[]} The resampled array.
 */
export declare function arraySmoothingResample(input: number[], points: number): number[];
/**
 * Rescales the input array to have values that are inclusively within the provided
 * minimum and maximum.
 * @param {number[]} input The array to rescale.
 * @param {number} newMin The minimum value to scale to.
 * @param {number} newMax The maximum value to scale to.
 * @returns {number[]} The rescaled array.
 */
export declare function arrayRescale(input: number[], newMin: number, newMax: number): number[];
/**
 * Creates an array of the given length, seeded with the given value.
 * @param {T} val The value to seed the array with.
 * @param {number} length The length of the array to create.
 * @returns {T[]} The array.
 */
export declare function arraySeed<T>(val: T, length: number): T[];
/**
 * Trims or fills the array to ensure it meets the desired length. The seed array
 * given is pulled from to fill any missing slots - it is recommended that this be
 * at least `len` long. The resulting array will be exactly `len` long, either
 * trimmed from the source or filled with the some/all of the seed array.
 * @param {T[]} a The array to trim/fill.
 * @param {number} len The length to trim or fill to, as needed.
 * @param {T[]} seed Values to pull from if the array needs filling.
 * @returns {T[]} The resulting array of `len` length.
 */
export declare function arrayTrimFill<T>(a: T[], len: number, seed: T[]): T[];
/**
 * Clones an array as fast as possible, retaining references of the array's values.
 * @param a The array to clone. Must be defined.
 * @returns A copy of the array.
 */
export declare function arrayFastClone<T>(a: T[]): T[];
/**
 * Determines if the two arrays are different either in length, contents,
 * or order of those contents.
 * @param a The first array. Must be defined.
 * @param b The second array. Must be defined.
 * @returns True if they are different, false otherwise.
 */
export declare function arrayHasOrderChange(a: any[], b: any[]): boolean;
/**
 * Determines if two arrays are different through a shallow comparison.
 * @param a The first array. Must be defined.
 * @param b The second array. Must be defined.
 * @returns True if they are different, false otherwise.
 */
export declare function arrayHasDiff(a: any[], b: any[]): boolean;
export declare type Diff<T> = {
    added: T[];
    removed: T[];
};
/**
 * Performs a diff on two arrays. The result is what is different with the
 * first array (`added` in the returned object means objects in B that aren't
 * in A). Shallow comparisons are used to perform the diff.
 * @param a The first array. Must be defined.
 * @param b The second array. Must be defined.
 * @returns The diff between the arrays.
 */
export declare function arrayDiff<T>(a: T[], b: T[]): Diff<T>;
/**
 * Returns the intersection of two arrays.
 * @param a The first array. Must be defined.
 * @param b The second array. Must be defined.
 * @returns The intersection of the arrays.
 */
export declare function arrayIntersection<T>(a: T[], b: T[]): T[];
/**
 * Unions arrays, deduping contents using a Set.
 * @param a The arrays to merge.
 * @returns The union of all given arrays.
 */
export declare function arrayUnion<T>(...a: T[][]): T[];
/**
 * Moves a single element from fromIndex to toIndex.
 * @param {array} list the list from which to construct the new list.
 * @param {number} fromIndex the index of the element to move.
 * @param {number} toIndex the index of where to put the element.
 * @returns {array} A new array with the requested value moved.
 */
export declare function moveElement<T>(list: T[], fromIndex: number, toIndex: number): T[];
/**
 * Helper functions to perform LINQ-like queries on arrays.
 */
export declare class ArrayUtil<T> {
    private a;
    /**
     * Create a new array helper.
     * @param a The array to help. Can be modified in-place.
     */
    constructor(a: T[]);
    /**
     * The value of this array, after all appropriate alterations.
     */
    get value(): T[];
    /**
     * Groups an array by keys.
     * @param fn The key-finding function.
     * @returns This.
     */
    groupBy<K>(fn: (a: T) => K): GroupedArray<K, T>;
}
/**
 * Helper functions to perform LINQ-like queries on groups (maps).
 */
export declare class GroupedArray<K, T> {
    private val;
    /**
     * Creates a new group helper.
     * @param val The group to help. Can be modified in-place.
     */
    constructor(val: Map<K, T[]>);
    /**
     * The value of this group, after all applicable alterations.
     */
    get value(): Map<K, T[]>;
    /**
     * Orders the grouping into an array using the provided key order.
     * @param keyOrder The key order.
     * @returns An array helper of the result.
     */
    orderBy(keyOrder: K[]): ArrayUtil<T>;
}
