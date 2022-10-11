import { FC } from "react";
import { Room } from "matrix-js-sdk/src/models/room";
import { Call } from "../../../models/Call";
interface Props {
    room: Room;
    call: Call;
}
export declare const CallLobby: FC<Props>;
export {};
