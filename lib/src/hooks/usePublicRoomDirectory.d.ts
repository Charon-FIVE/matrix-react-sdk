import { RoomType } from "matrix-js-sdk/src/@types/event";
import { IPublicRoomsChunkRoom } from "matrix-js-sdk/src/client";
import { IPublicRoomDirectoryConfig } from "../components/views/directory/NetworkDropdown";
import { Protocols } from "../utils/DirectoryUtils";
export declare const ALL_ROOMS = "ALL_ROOMS";
export interface IPublicRoomsOpts {
    limit: number;
    query?: string;
    roomTypes?: Set<RoomType | null>;
}
export declare const usePublicRoomDirectory: () => {
    readonly ready: boolean;
    readonly loading: boolean;
    readonly publicRooms: IPublicRoomsChunkRoom[];
    readonly protocols: Protocols;
    readonly config: IPublicRoomDirectoryConfig;
    readonly search: ({ limit, query, roomTypes, }: IPublicRoomsOpts) => Promise<boolean>;
    readonly setConfig: (config: IPublicRoomDirectoryConfig) => void;
};
