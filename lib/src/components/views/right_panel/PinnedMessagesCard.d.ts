/// <reference types="react" />
import { Room } from "matrix-js-sdk/src/models/room";
import { RoomPermalinkCreator } from "../../../utils/permalinks/Permalinks";
interface IProps {
    room: Room;
    permalinkCreator: RoomPermalinkCreator;
    onClose(): void;
}
export declare const usePinnedEvents: (room: Room) => string[];
export declare const useReadPinnedEvents: (room: Room) => Set<string>;
declare const PinnedMessagesCard: ({ room, onClose, permalinkCreator }: IProps) => JSX.Element;
export default PinnedMessagesCard;
