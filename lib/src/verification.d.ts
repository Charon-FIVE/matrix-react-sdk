import { User } from "matrix-js-sdk/src/models/user";
import { RoomMember } from "matrix-js-sdk/src/matrix";
import { IDevice } from "./components/views/right_panel/UserInfo";
export declare function verifyDevice(user: User, device: IDevice): Promise<void>;
export declare function legacyVerifyUser(user: User): Promise<void>;
export declare function verifyUser(user: User): Promise<void>;
export declare function pendingVerificationRequestForUser(user: User | RoomMember): import("matrix-js-sdk/src/crypto/verification/request/VerificationRequest").VerificationRequest<import("matrix-js-sdk/src/crypto/verification/request/Channel").IVerificationChannel>;
