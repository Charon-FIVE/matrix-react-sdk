/**
 * Determines the keys added, changed, and removed between two Maps.
 * For changes, simple triple equal comparisons are done, not in-depth tree checking.
 * @param a The first Map. Must be defined.
 * @param b The second Map. Must be defined.
 * @returns The difference between the keys of each Map.
 */
export declare function mapDiff<K, V>(a: Map<K, V>, b: Map<K, V>): {
    changed: K[];
    added: K[];
    removed: K[];
};
/**
 * A Map<K, V> with added utility.
 */
export declare class EnhancedMap<K, V> extends Map<K, V> {
    constructor(entries?: Iterable<[K, V]>);
    getOrCreate(key: K, def: V): V;
    remove(key: K): V;
}
