import { MockedObject } from "jest-mock";
import { MatrixClient, MatrixEvent, Room } from "matrix-js-sdk/src/matrix";
export declare const makeMembershipEvent: (roomId: string, userId: string, membership?: string) => MatrixEvent;
/**
 * Creates a room
 * sets state events on the room
 * Sets client getRoom to return room
 * returns room
 */
export declare const makeRoomWithStateEvents: (stateEvents: MatrixEvent[], { roomId, mockClient }: {
    roomId: string;
    mockClient: MockedObject<MatrixClient>;
}) => Room;
