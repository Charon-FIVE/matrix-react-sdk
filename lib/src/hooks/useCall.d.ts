import type { RoomMember } from "matrix-js-sdk/src/models/room-member";
import type { Call, ConnectionState } from "../models/Call";
export declare const useCall: (roomId: string) => Call | null;
export declare const useConnectionState: (call: Call) => ConnectionState;
export declare const useParticipants: (call: Call) => Set<RoomMember>;
