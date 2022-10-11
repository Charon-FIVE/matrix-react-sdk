import { Room } from "matrix-js-sdk/src/models/room";
import { IHierarchyRoom } from "matrix-js-sdk/src/@types/spaces";
export declare const UPDATE_TOP_LEVEL_SPACES: unique symbol;
export declare const UPDATE_INVITED_SPACES: unique symbol;
export declare const UPDATE_SELECTED_SPACE: unique symbol;
export declare const UPDATE_HOME_BEHAVIOUR: unique symbol;
export declare const UPDATE_SUGGESTED_ROOMS: unique symbol;
export declare enum MetaSpace {
    Home = "home-space",
    Favourites = "favourites-space",
    People = "people-space",
    Orphans = "orphans-space"
}
export declare const getMetaSpaceName: (spaceKey: MetaSpace, allRoomsInHome?: boolean) => string;
export declare type SpaceKey = MetaSpace | Room["roomId"];
export interface ISuggestedRoom extends IHierarchyRoom {
    viaServers: string[];
}
export declare function isMetaSpace(spaceKey: SpaceKey): boolean;
