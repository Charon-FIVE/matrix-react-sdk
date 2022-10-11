import { Room } from "matrix-js-sdk/src/models/room";
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
/**
 * Returns true if this event arriving in a room should affect the room's
 * count of unread messages
 *
 * @param {Object} ev The event
 * @returns {boolean} True if the given event should affect the unread message count
 */
export declare function eventTriggersUnreadCount(ev: MatrixEvent): boolean;
export declare function doesRoomHaveUnreadMessages(room: Room): boolean;
