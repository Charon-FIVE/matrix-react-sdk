import type { Room } from "matrix-js-sdk/src/models/room";
import type { RoomMember } from "matrix-js-sdk/src/models/room-member";
import { Call } from "../../src/models/Call";
export declare class MockedCall extends Call {
    private readonly room;
    private readonly id;
    private static EVENT_TYPE;
    private constructor();
    static get(room: Room): MockedCall | null;
    static create(room: Room, id: string): void;
    get participants(): Set<RoomMember>;
    set participants(value: Set<RoomMember>);
    clean(): Promise<void>;
    performConnection(audioInput: MediaDeviceInfo | null, videoInput: MediaDeviceInfo | null): Promise<void>;
    performDisconnection(): Promise<void>;
    destroy(): void;
}
/**
 * Sets up the call store to use mocked calls.
 */
export declare const useMockedCalls: () => void;
