declare type LogFunctionName = "log" | "info" | "warn" | "error";
export declare class ConsoleLogger {
    private logs;
    private originalFunctions;
    monkeyPatch(consoleObj: Console): void;
    bypassRageshake(fnName: LogFunctionName, ...args: (Error | DOMException | object | string)[]): void;
    log(level: string, ...args: (Error | DOMException | object | string)[]): void;
    /**
     * Retrieve log lines to flush to disk.
     * @param {boolean} keepLogs True to not delete logs after flushing.
     * @return {string} \n delimited log lines to flush.
     */
    flush(keepLogs?: boolean): string;
}
export declare class IndexedDBLogStore {
    private indexedDB;
    private logger;
    private id;
    private index;
    private db;
    private flushPromise;
    private flushAgainPromise;
    constructor(indexedDB: IDBFactory, logger: ConsoleLogger);
    /**
     * @return {Promise} Resolves when the store is ready.
     */
    connect(): Promise<void>;
    /**
     * Flush logs to disk.
     *
     * There are guards to protect against race conditions in order to ensure
     * that all previous flushes have completed before the most recent flush.
     * Consider without guards:
     *  - A calls flush() periodically.
     *  - B calls flush() and wants to send logs immediately afterwards.
     *  - If B doesn't wait for A's flush to complete, B will be missing the
     *    contents of A's flush.
     * To protect against this, we set 'flushPromise' when a flush is ongoing.
     * Subsequent calls to flush() during this period will chain another flush,
     * then keep returning that same chained flush.
     *
     * This guarantees that we will always eventually do a flush when flush() is
     * called.
     *
     * @return {Promise} Resolved when the logs have been flushed.
     */
    flush(): Promise<void>;
    /**
     * Consume the most recent logs and return them. Older logs which are not
     * returned are deleted at the same time, so this can be called at startup
     * to do house-keeping to keep the logs from growing too large.
     *
     * @return {Promise<Object[]>} Resolves to an array of objects. The array is
     * sorted in time (oldest first) based on when the log file was created (the
     * log ID). The objects have said log ID in an "id" field and "lines" which
     * is a big string with all the new-line delimited logs.
     */
    consume(): Promise<{
        lines: string;
        id: string;
    }[]>;
    private generateLogEntry;
    private generateLastModifiedTime;
}
/**
 * Configure rage shaking support for sending bug reports.
 * Modifies globals.
 * @param {boolean} setUpPersistence When true (default), the persistence will
 * be set up immediately for the logs.
 * @return {Promise} Resolves when set up.
 */
export declare function init(setUpPersistence?: boolean): Promise<void>;
/**
 * Try to start up the rageshake storage for logs. If not possible (client unsupported)
 * then this no-ops.
 * @return {Promise} Resolves when complete.
 */
export declare function tryInitStorage(): Promise<void>;
export declare function flush(): void;
/**
 * Clean up old logs.
 * @return {Promise} Resolves if cleaned logs.
 */
export declare function cleanup(): Promise<void>;
/**
 * Get a recent snapshot of the logs, ready for attaching to a bug report
 *
 * @return {Array<{lines: string, id, string}>}  list of log data
 */
export declare function getLogsForReport(): Promise<{
    lines: string;
    id: string;
}[]>;
export {};
