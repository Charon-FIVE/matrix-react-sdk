import { Room } from "matrix-js-sdk/src/models/room";
import { RoomType, EventType } from "matrix-js-sdk/src/@types/event";
import { SpacePreferenceTab } from "../dispatcher/payloads/OpenSpacePreferencesPayload";
export declare const shouldShowSpaceSettings: (space: Room) => boolean;
export declare const makeSpaceParentEvent: (room: Room, canonical?: boolean) => {
    type: EventType;
    content: {
        via: string[];
        canonical: boolean;
    };
    state_key: string;
};
export declare function showSpaceSettings(space: Room): void;
export declare const showAddExistingRooms: (space: Room) => void;
export declare const showCreateNewRoom: (space: Room, type?: RoomType) => Promise<boolean>;
export declare const shouldShowSpaceInvite: (space: Room) => boolean;
export declare const showSpaceInvite: (space: Room, initialText?: string) => void;
export declare const showAddExistingSubspace: (space: Room) => void;
export declare const showCreateNewSubspace: (space: Room) => void;
export declare const bulkSpaceBehaviour: (space: Room, children: Room[], fn: (room: Room) => Promise<unknown>) => Promise<void>;
export declare const showSpacePreferences: (space: Room, initialTabId?: SpacePreferenceTab) => void;
