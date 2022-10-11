import { FC, HTMLAttributes, ReactNode } from "react";
import { RoomMember } from "matrix-js-sdk/src/models/room-member";
interface IProps extends HTMLAttributes<HTMLSpanElement> {
    members: RoomMember[];
    faceSize: number;
    overflow: boolean;
    tooltip?: ReactNode;
    children?: ReactNode;
}
declare const FacePile: FC<IProps>;
export default FacePile;
