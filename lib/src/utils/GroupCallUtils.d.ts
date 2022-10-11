import { MatrixClient, MatrixEvent } from "matrix-js-sdk/src/matrix";
import { UnstableValue } from "matrix-js-sdk/src/NamespacedValue";
export declare const STUCK_DEVICE_TIMEOUT_MS: number;
export declare const CALL_STATE_EVENT_TYPE: UnstableValue<"m.call", "org.matrix.msc3401.call">;
export declare const CALL_MEMBER_STATE_EVENT_TYPE: UnstableValue<"m.call.member", "org.matrix.msc3401.call.member">;
/**
 * Finds the latest, non-terminated call state event.
 */
export declare const getGroupCall: (client: MatrixClient, roomId: string) => MatrixEvent;
/**
 * Finds the "m.call.member" events for an "m.call" event.
 *
 * @returns {MatrixEvent[]} non-expired "m.call.member" events for the call
 */
export declare const useConnectedMembers: (client: MatrixClient, callEvent: MatrixEvent) => MatrixEvent[];
/**
 * Removes the current device from a call.
 */
export declare const removeOurDevice: (client: MatrixClient, callEvent: MatrixEvent) => Promise<void>;
/**
 * Removes all devices of the current user that have not been seen within the STUCK_DEVICE_TIMEOUT_MS.
 * Does per default not remove the current device unless includeCurrentDevice is true.
 *
 * @param {boolean} includeCurrentDevice - Whether to include the current device of this session here.
 */
export declare const fixStuckDevices: (client: MatrixClient, callEvent: MatrixEvent, includeCurrentDevice: boolean) => Promise<void>;
