import { ReactNode } from "react";
import { Room } from "matrix-js-sdk/src/models/room";
import { RoomHierarchy } from "matrix-js-sdk/src/room-hierarchy";
import { RoomType } from "matrix-js-sdk/src/@types/event";
import { IHierarchyRoom } from "matrix-js-sdk/src/@types/spaces";
import { MatrixClient } from "matrix-js-sdk/src/matrix";
interface IProps {
    space: Room;
    initialText?: string;
    additionalButtons?: ReactNode;
    showRoom(cli: MatrixClient, hierarchy: RoomHierarchy, roomId: string, roomType?: RoomType): void;
}
export declare const showRoom: (cli: MatrixClient, hierarchy: RoomHierarchy, roomId: string, roomType?: RoomType) => void;
export declare const joinRoom: (cli: MatrixClient, hierarchy: RoomHierarchy, roomId: string) => Promise<unknown>;
interface IHierarchyLevelProps {
    root: IHierarchyRoom;
    roomSet: Set<IHierarchyRoom>;
    hierarchy: RoomHierarchy;
    parents: Set<string>;
    selectedMap?: Map<string, Set<string>>;
    onViewRoomClick(roomId: string, roomType?: RoomType): void;
    onJoinRoomClick(roomId: string): Promise<unknown>;
    onToggleClick?(parentId: string, childId: string): void;
}
export declare const HierarchyLevel: ({ root, roomSet, hierarchy, parents, selectedMap, onViewRoomClick, onJoinRoomClick, onToggleClick, }: IHierarchyLevelProps) => JSX.Element;
export declare const useRoomHierarchy: (space: Room) => {
    loading: boolean;
    rooms?: IHierarchyRoom[];
    hierarchy: RoomHierarchy;
    error: Error;
    loadMore(pageSize?: number): Promise<void>;
};
declare const SpaceHierarchy: ({ space, initialText, showRoom, additionalButtons, }: IProps) => JSX.Element;
export default SpaceHierarchy;
