/// <reference types="react" />
import { RoomMember } from "matrix-js-sdk/src/matrix";
import { Member } from "../../../utils/direct-messages";
interface SearchResultAvatarProps {
    user: Member | RoomMember;
    size: number;
}
export declare function SearchResultAvatar({ user, size }: SearchResultAvatarProps): JSX.Element;
export {};
