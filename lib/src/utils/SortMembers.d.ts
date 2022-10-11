import { MatrixClient, RoomMember } from "matrix-js-sdk/src/matrix";
import { Member } from "./direct-messages";
export declare const compareMembers: (activityScores: Record<string, IActivityScore>, memberScores: Record<string, IMemberScore>) => (a: Member | RoomMember, b: Member | RoomMember) => number;
interface IActivityScore {
    lastSpoke: number;
    score: number;
}
export declare function buildActivityScores(cli: MatrixClient): {
    [key: string]: IActivityScore;
};
interface IMemberScore {
    member: RoomMember;
    score: number;
    numRooms: number;
}
export declare function buildMemberScores(cli: MatrixClient): {
    [key: string]: IMemberScore;
};
export {};
