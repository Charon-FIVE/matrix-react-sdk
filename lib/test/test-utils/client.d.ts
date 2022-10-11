/// <reference types="node" />
/// <reference types="jest" />
import EventEmitter from "events";
import { MethodKeysOf, MockedObject } from "jest-mock";
import { MatrixClient } from "matrix-js-sdk/src/matrix";
/**
 * Mock client with real event emitter
 * useful for testing code that listens
 * to MatrixClient events
 */
export declare class MockClientWithEventEmitter extends EventEmitter {
    constructor(mockProperties?: Partial<Record<MethodKeysOf<MatrixClient>, unknown>>);
}
/**
 * - make a mock client
 * - cast the type to mocked(MatrixClient)
 * - spy on MatrixClientPeg.get to return the mock
 * eg
 * ```
 * const mockClient = getMockClientWithEventEmitter({
        getUserId: jest.fn().mockReturnValue(aliceId),
    });
 * ```
 */
export declare const getMockClientWithEventEmitter: (mockProperties: Partial<Record<MethodKeysOf<MatrixClient>, unknown>>) => MockedObject<MatrixClient>;
export declare const unmockClientPeg: () => void;
/**
 * Returns basic mocked client methods related to the current user
 * ```
 * const mockClient = getMockClientWithEventEmitter({
        ...mockClientMethodsUser('@mytestuser:domain'),
    });
 * ```
 */
export declare const mockClientMethodsUser: (userId?: string) => {
    getUserId: jest.Mock<any, any>;
    isGuest: jest.Mock<any, any>;
    mxcUrlToHttp: jest.Mock<any, any>;
    credentials: {
        userId: string;
    };
    getThreePids: jest.Mock<any, any>;
    getAccessToken: jest.Mock<any, any>;
};
/**
 * Returns basic mocked client methods related to rendering events
 * ```
 * const mockClient = getMockClientWithEventEmitter({
        ...mockClientMethodsUser('@mytestuser:domain'),
    });
 * ```
 */
export declare const mockClientMethodsEvents: () => {
    decryptEventIfNeeded: jest.Mock<any, any>;
    getPushActionsForEvent: jest.Mock<any, any>;
};
/**
 * Returns basic mocked client methods related to server support
 */
export declare const mockClientMethodsServer: () => Partial<Record<MethodKeysOf<MatrixClient>, unknown>>;
