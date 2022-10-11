import { DecryptionError } from "matrix-js-sdk/src/crypto/algorithms";
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
export declare class DecryptionFailure {
    readonly failedEventId: string;
    readonly errorCode: string;
    readonly ts: number;
    constructor(failedEventId: string, errorCode: string);
}
declare type ErrorCode = "OlmKeysNotSentError" | "OlmIndexError" | "UnknownError" | "OlmUnspecifiedError";
export declare type ErrCodeMapFn = (errcode: string) => ErrorCode;
export declare class DecryptionFailureTracker {
    private readonly fn;
    private readonly errorCodeMapFn;
    private static internalInstance;
    failures: Map<string, DecryptionFailure>;
    visibleEvents: Set<string>;
    visibleFailures: Map<string, DecryptionFailure>;
    failureCounts: Record<string, number>;
    trackedEvents: Set<string>;
    checkInterval: number;
    trackInterval: number;
    static TRACK_INTERVAL_MS: number;
    static CHECK_INTERVAL_MS: number;
    static GRACE_PERIOD_MS: number;
    /**
     * Create a new DecryptionFailureTracker.
     *
     * Call `eventDecrypted(event, err)` on this instance when an event is decrypted.
     *
     * Call `start()` to start the tracker, and `stop()` to stop tracking.
     *
     * @param {function} fn The tracking function, which will be called when failures
     * are tracked. The function should have a signature `(count, trackedErrorCode) => {...}`,
     * where `count` is the number of failures and `errorCode` matches the `.code` of
     * provided DecryptionError errors (by default, unless `errorCodeMapFn` is specified.
     * @param {function?} errorCodeMapFn The function used to map error codes to the
     * trackedErrorCode. If not provided, the `.code` of errors will be used.
     */
    private constructor();
    static get instance(): DecryptionFailureTracker;
    eventDecrypted(e: MatrixEvent, err: DecryptionError): void;
    addVisibleEvent(e: MatrixEvent): void;
    addDecryptionFailure(failure: DecryptionFailure): void;
    removeDecryptionFailuresForEvent(e: MatrixEvent): void;
    /**
     * Start checking for and tracking failures.
     */
    start(): void;
    /**
     * Clear state and stop checking for and tracking failures.
     */
    stop(): void;
    /**
     * Mark failures that occurred before nowTs - GRACE_PERIOD_MS as failures that should be
     * tracked. Only mark one failure per event ID.
     * @param {number} nowTs the timestamp that represents the time now.
     */
    checkFailures(nowTs: number): void;
    private aggregateFailures;
    /**
     * If there are failures that should be tracked, call the given trackDecryptionFailure
     * function with the number of failures that should be tracked.
     */
    trackFailures(): void;
}
export {};
