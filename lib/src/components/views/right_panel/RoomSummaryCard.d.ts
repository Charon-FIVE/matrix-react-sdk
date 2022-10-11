import React from "react";
import { Room } from "matrix-js-sdk/src/models/room";
import { IApp } from "../../../stores/WidgetStore";
interface IProps {
    room: Room;
    onClose(): void;
}
export declare const useWidgets: (room: Room) => IApp[];
declare const RoomSummaryCard: React.FC<IProps>;
export default RoomSummaryCard;
