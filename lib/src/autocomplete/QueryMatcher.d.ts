import { TimelineRenderingType } from '../contexts/RoomContext';
import { Leaves } from "../@types/common";
interface IOptions<T extends {}> {
    keys: Array<Leaves<T>>;
    funcs?: Array<(o: T) => string | string[]>;
    shouldMatchWordsOnly?: boolean;
    fuzzy?: boolean;
    context?: TimelineRenderingType;
}
/**
 * Simple search matcher that matches any results with the query string anywhere
 * in the search string. Returns matches in the order the query string appears
 * in the search key, earliest first, then in the order the search key appears
 * in the provided array of keys, then in the order the items appeared in the
 * source array.
 *
 * @param {Object[]} objects Initial list of objects. Equivalent to calling
 *     setObjects() after construction
 * @param {Object} options Options object
 * @param {string[]} options.keys List of keys to use as indexes on the objects
 * @param {function[]} options.funcs List of functions that when called with the
 *     object as an arg will return a string to use as an index
 */
export default class QueryMatcher<T extends Object> {
    private _options;
    private _items;
    constructor(objects: T[], options?: IOptions<T>);
    setObjects(objects: T[]): void;
    match(query: string, limit?: number): T[];
    private processQuery;
}
export {};
