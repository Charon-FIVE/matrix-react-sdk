import { MatrixClient } from "matrix-js-sdk/src/client";
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { Room } from "matrix-js-sdk/src/models/room";
import { RoomState } from "matrix-js-sdk/src/models/room-state";
import { ActionPayload } from "../dispatcher/payloads";
/**
 * @typedef IRoomTimelineActionPayload
 * @type {Object}
 * @property {string} action 'MatrixActions.Room.timeline'.
 * @property {boolean} isLiveEvent whether the event was attached to a
 * live timeline.
 * @property {boolean} isLiveUnfilteredRoomTimelineEvent whether the
 * event was attached to a timeline in the set of unfiltered timelines.
 * @property {Room} room the Room whose tags changed.
 */
export interface IRoomTimelineActionPayload extends Pick<ActionPayload, "action"> {
    action: 'MatrixActions.Room.timeline';
    event: MatrixEvent;
    room: Room | null;
    isLiveEvent?: boolean;
    isLiveUnfilteredRoomTimelineEvent: boolean;
}
/**
 * @typedef IRoomStateEventsActionPayload
 * @type {Object}
 * @property {string} action 'MatrixActions.RoomState.events'.
 * @property {MatrixEvent} event the state event received
 * @property {RoomState} state the room state into which the event was applied
 * @property {MatrixEvent | null} lastStateEvent the previous value for this (event-type, state-key) tuple in room state
 */
export interface IRoomStateEventsActionPayload extends Pick<ActionPayload, "action"> {
    action: 'MatrixActions.RoomState.events';
    event: MatrixEvent;
    state: RoomState;
    lastStateEvent: MatrixEvent | null;
}
/**
 * This object is responsible for dispatching actions when certain events are emitted by
 * the given MatrixClient.
 */
declare const _default: {
    /**
     * Start listening to certain events from the MatrixClient and dispatch actions when
     * they are emitted.
     * @param {MatrixClient} matrixClient the MatrixClient to listen to events from
     */
    start(matrixClient: MatrixClient): void;
    /**
     * Stop listening to events.
     */
    stop(): void;
};
export default _default;
