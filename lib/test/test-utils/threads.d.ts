import { MatrixEvent, Room } from "matrix-js-sdk/src/matrix";
import { MessageEventProps } from "./test-utils";
export declare const makeThreadEvent: ({ rootEventId, replyToEventId, ...props }: {
    user: string;
    relatesTo?: import("matrix-js-sdk/src/matrix").IEventRelation;
    event?: boolean;
    ts?: number;
    skey?: string;
} & {
    room: string;
    relatesTo?: import("matrix-js-sdk/src/matrix").IEventRelation;
    msg?: string;
} & {
    rootEventId: string;
    replyToEventId: string;
}) => MatrixEvent;
declare type MakeThreadEventsProps = {
    roomId: Room["roomId"];
    authorId: string;
    participantUserIds: string[];
    length?: number;
    ts?: number;
    currentUserId?: string;
};
export declare const makeThreadEvents: ({ roomId, authorId, participantUserIds, length, ts, currentUserId, }: MakeThreadEventsProps) => {
    rootEvent: MatrixEvent;
    events: MatrixEvent[];
};
export {};
