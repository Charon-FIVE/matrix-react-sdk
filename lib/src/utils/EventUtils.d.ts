import { EventStatus, MatrixEvent } from 'matrix-js-sdk/src/models/event';
import { MatrixClient } from 'matrix-js-sdk/src/client';
import { GetRelationsForEvent } from "../components/views/rooms/EventTile";
import { TimelineRenderingType } from "../contexts/RoomContext";
/**
 * Returns whether an event should allow actions like reply, reactions, edit, etc.
 * which effectively checks whether it's a regular message that has been sent and that we
 * can display.
 *
 * @param {MatrixEvent} mxEvent The event to check
 * @returns {boolean} true if actionable
 */
export declare function isContentActionable(mxEvent: MatrixEvent): boolean;
export declare function canEditContent(mxEvent: MatrixEvent): boolean;
export declare function canEditOwnEvent(mxEvent: MatrixEvent): boolean;
export declare function findEditableEvent({ events, isForward, fromEventId, }: {
    events: MatrixEvent[];
    isForward: boolean;
    fromEventId?: string;
}): MatrixEvent;
/**
 * How we should render a message depending on its moderation state.
 */
export declare enum MessageModerationState {
    /**
     * The message is visible to all.
     */
    VISIBLE_FOR_ALL = "VISIBLE_FOR_ALL",
    /**
     * The message is hidden pending moderation and we're not a user who should
     * see it nevertheless.
     */
    HIDDEN_TO_CURRENT_USER = "HIDDEN_TO_CURRENT_USER",
    /**
     * The message is hidden pending moderation and we're either the author of
     * the message or a moderator. In either case, we need to see the message
     * with a marker.
     */
    SEE_THROUGH_FOR_CURRENT_USER = "SEE_THROUGH_FOR_CURRENT_USER"
}
/**
 * Determine whether a message should be displayed as hidden pending moderation.
 *
 * If MSC3531 is deactivated in settings, all messages are considered visible
 * to all.
 */
export declare function getMessageModerationState(mxEvent: MatrixEvent, client?: MatrixClient): MessageModerationState;
export declare function isVoiceMessage(mxEvent: MatrixEvent): boolean;
export declare function fetchInitialEvent(client: MatrixClient, roomId: string, eventId: string): Promise<MatrixEvent | null>;
export declare function editEvent(mxEvent: MatrixEvent, timelineRenderingType: TimelineRenderingType, getRelationsForEvent?: GetRelationsForEvent): void;
export declare function canCancel(status: EventStatus): boolean;
export declare const isLocationEvent: (event: MatrixEvent) => boolean;
export declare function hasThreadSummary(event: MatrixEvent): boolean;
export declare function canPinEvent(event: MatrixEvent): boolean;
