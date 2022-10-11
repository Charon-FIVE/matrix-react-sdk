import { MockedObject } from 'jest-mock';
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { Room, User, IContent, RoomMember, MatrixClient, EventType, IEventRelation, IUnsigned } from 'matrix-js-sdk/src/matrix';
import { AsyncStoreWithClient } from "../../src/stores/AsyncStoreWithClient";
/**
 * Stub out the MatrixClient, and configure the MatrixClientPeg object to
 * return it when get() is called.
 *
 * TODO: once the components are updated to get their MatrixClients from
 * the react context, we can get rid of this and just inject a test client
 * via the context instead.
 */
export declare function stubClient(): void;
/**
 * Create a stubbed-out MatrixClient
 *
 * @returns {object} MatrixClient stub
 */
export declare function createTestClient(): MatrixClient;
declare type MakeEventPassThruProps = {
    user: User["userId"];
    relatesTo?: IEventRelation;
    event?: boolean;
    ts?: number;
    skey?: string;
};
declare type MakeEventProps = MakeEventPassThruProps & {
    type: string;
    content: IContent;
    room?: Room["roomId"];
    prev_content?: IContent;
    unsigned?: IUnsigned;
};
/**
 * Create an Event.
 * @param {Object} opts Values for the event.
 * @param {string} opts.type The event.type
 * @param {string} opts.room The event.room_id
 * @param {string} opts.user The event.user_id
 * @param {string=} opts.skey Optional. The state key (auto inserts empty string)
 * @param {number=} opts.ts   Optional. Timestamp for the event
 * @param {Object} opts.content The event.content
 * @param {boolean} opts.event True to make a MatrixEvent.
 * @param {unsigned=} opts.unsigned
 * @return {Object} a JSON object representing this event.
 */
export declare function mkEvent(opts: MakeEventProps): MatrixEvent;
/**
 * Create an m.presence event.
 * @param {Object} opts Values for the presence.
 * @return {Object|MatrixEvent} The event
 */
export declare function mkPresence(opts: any): MatrixEvent | {
    event_id: string;
    type: string;
    sender: any;
    content: {
        avatar_url: any;
        displayname: any;
        last_active_ago: any;
        presence: any;
    };
};
/**
 * Create an m.room.member event.
 * @param {Object} opts Values for the membership.
 * @param {string} opts.room The room ID for the event.
 * @param {string} opts.mship The content.membership for the event.
 * @param {string} opts.prevMship The prev_content.membership for the event.
 * @param {number=} opts.ts   Optional. Timestamp for the event
 * @param {string} opts.user The user ID for the event.
 * @param {RoomMember} opts.target The target of the event.
 * @param {string=} opts.skey The other user ID for the event if applicable
 * e.g. for invites/bans.
 * @param {string} opts.name The content.displayname for the event.
 * @param {string=} opts.url The content.avatar_url for the event.
 * @param {boolean} opts.event True to make a MatrixEvent.
 * @return {Object|MatrixEvent} The event
 */
export declare function mkMembership(opts: MakeEventPassThruProps & {
    room: Room["roomId"];
    mship: string;
    prevMship?: string;
    name?: string;
    url?: string;
    skey?: string;
    target?: RoomMember;
}): MatrixEvent;
export declare function mkRoomMember(roomId: string, userId: string, membership?: string): RoomMember;
export declare type MessageEventProps = MakeEventPassThruProps & {
    room: Room["roomId"];
    relatesTo?: IEventRelation;
    msg?: string;
};
/**
 * Create an m.room.message event.
 * @param {Object} opts Values for the message
 * @param {string} opts.room The room ID for the event.
 * @param {string} opts.user The user ID for the event.
 * @param {number} opts.ts The timestamp for the event.
 * @param {boolean} opts.event True to make a MatrixEvent.
 * @param {string=} opts.msg Optional. The content.body for the event.
 * @return {Object|MatrixEvent} The event
 */
export declare function mkMessage({ msg, relatesTo, ...opts }: MakeEventPassThruProps & {
    room: Room["roomId"];
    msg?: string;
}): MatrixEvent;
export declare function mkStubRoom(roomId: string, name: string, client: MatrixClient): Room;
export declare function mkServerConfig(hsUrl: any, isUrl: any): any;
export declare function getDispatchForStore(store: any): (payload: any) => void;
export declare const setupAsyncStoreWithClient: <T = unknown>(store: AsyncStoreWithClient<T>, client: MatrixClient) => Promise<void>;
export declare const resetAsyncStoreWithClient: <T = unknown>(store: AsyncStoreWithClient<T>) => Promise<void>;
export declare const mockStateEventImplementation: (events: MatrixEvent[]) => {
    (eventType: EventType | string): MatrixEvent[];
    (eventType: EventType | string, stateKey: string): MatrixEvent;
};
export declare const mkRoom: (client: MatrixClient, roomId: string, rooms?: ReturnType<typeof mkStubRoom>[]) => MockedObject<Room>;
/**
 * Upserts given events into room.currentState
 * @param room
 * @param events
 */
export declare const upsertRoomStateEvents: (room: Room, events: MatrixEvent[]) => void;
export declare const mkSpace: (client: MatrixClient, spaceId: string, rooms?: ReturnType<typeof mkStubRoom>[], children?: string[]) => MockedObject<Room>;
export {};
