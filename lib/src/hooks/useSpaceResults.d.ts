import { Room } from "matrix-js-sdk/src/matrix";
import { IHierarchyRoom } from "matrix-js-sdk/src/@types/spaces";
export declare const useSpaceResults: (space?: Room, query?: string) => [IHierarchyRoom[], boolean];
