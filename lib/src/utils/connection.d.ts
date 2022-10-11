import { ClientEvent, ClientEventHandlerMap } from "matrix-js-sdk/src/matrix";
/**
 * Creates a MatrixClient event listener function that can be used to get notified about reconnects.
 * @param callback The callback to be called on reconnect
 */
export declare const createReconnectedListener: (callback: () => void) => ClientEventHandlerMap[ClientEvent.Sync];
