/// <reference types="react" />
import { IReadReceiptInfo } from "./ReadReceiptMarker";
import { IReadReceiptProps } from "./EventTile";
export declare const READ_AVATAR_SIZE = 16;
interface Props {
    readReceipts: IReadReceiptProps[];
    readReceiptMap: {
        [userId: string]: IReadReceiptInfo;
    };
    checkUnmounting: () => boolean;
    suppressAnimation: boolean;
    isTwelveHour: boolean;
}
interface IAvatarPosition {
    hidden: boolean;
    position: number;
}
export declare function determineAvatarPosition(index: number, max: number): IAvatarPosition;
export declare function readReceiptTooltip(members: string[], hasMore: boolean): string | null;
export declare function ReadReceiptGroup({ readReceipts, readReceiptMap, checkUnmounting, suppressAnimation, isTwelveHour }: Props): JSX.Element;
export {};
