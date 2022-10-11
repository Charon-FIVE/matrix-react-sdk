/// <reference types="react" />
import { IPublicRoomsChunkRoom } from "matrix-js-sdk/src/matrix";
interface Props {
    room: IPublicRoomsChunkRoom;
    labelId: string;
    descriptionId: string;
    detailsId: string;
}
export declare function PublicRoomResultDetails({ room, labelId, descriptionId, detailsId }: Props): JSX.Element;
export {};
