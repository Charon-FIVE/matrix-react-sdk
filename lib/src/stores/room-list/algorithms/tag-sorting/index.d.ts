import { Room } from "matrix-js-sdk/src/models/room";
import { SortAlgorithm } from "../models";
import { IAlgorithm } from "./IAlgorithm";
import { TagID } from "../../models";
/**
 * Gets an instance of the defined algorithm
 * @param {SortAlgorithm} algorithm The algorithm to get an instance of.
 * @returns {IAlgorithm} The algorithm instance.
 */
export declare function getSortingAlgorithmInstance(algorithm: SortAlgorithm): IAlgorithm;
/**
 * Sorts rooms in a given tag according to the algorithm given.
 * @param {Room[]} rooms The rooms to sort.
 * @param {TagID} tagId The tag in which the sorting is occurring.
 * @param {SortAlgorithm} algorithm The algorithm to use for sorting.
 * @returns {Room[]} Returns the sorted rooms.
 */
export declare function sortRoomsWithAlgorithm(rooms: Room[], tagId: TagID, algorithm: SortAlgorithm): Room[];
