import React from 'react';
import { MatrixClient } from 'matrix-js-sdk/src/client';
import { RoomMember } from 'matrix-js-sdk/src/models/room-member';
import { User } from 'matrix-js-sdk/src/models/user';
import { Room } from 'matrix-js-sdk/src/models/room';
import { VerificationRequest } from "matrix-js-sdk/src/crypto/verification/request/VerificationRequest";
import { RightPanelPhases } from '../../../stores/right-panel/RightPanelStorePhases';
import { E2EStatus } from "../../../utils/ShieldUtils";
export interface IDevice {
    deviceId: string;
    ambiguous?: boolean;
    getDisplayName(): string;
}
export declare const getE2EStatus: (cli: MatrixClient, userId: string, devices: IDevice[]) => E2EStatus;
interface IPowerLevelsContent {
    events?: Record<string, number>;
    users_default?: number;
    events_default?: number;
    state_default?: number;
    ban?: number;
    kick?: number;
    redact?: number;
}
export declare const useRoomPowerLevels: (cli: MatrixClient, room: Room) => IPowerLevelsContent;
export declare const useDevices: (userId: string) => any;
export declare type Member = User | RoomMember;
interface IProps {
    user: Member;
    room?: Room;
    phase: RightPanelPhases.RoomMemberInfo | RightPanelPhases.SpaceMemberInfo | RightPanelPhases.EncryptionPanel;
    onClose(): void;
    verificationRequest?: VerificationRequest;
    verificationRequestPromise?: Promise<VerificationRequest>;
}
declare const UserInfo: React.FC<IProps>;
export default UserInfo;
