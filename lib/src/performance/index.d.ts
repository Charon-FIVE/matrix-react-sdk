import { PerformanceEntryNames } from "./entry-names";
interface GetEntriesOptions {
    name?: string;
    type?: string;
}
declare type PerformanceCallbackFunction = (entry: PerformanceEntry[]) => void;
interface PerformanceDataListener {
    entryNames?: string[];
    callback: PerformanceCallbackFunction;
}
export default class PerformanceMonitor {
    static _instance: PerformanceMonitor;
    private START_PREFIX;
    private STOP_PREFIX;
    private listeners;
    private entries;
    static get instance(): PerformanceMonitor;
    /**
     * Starts a performance recording
     * @param name Name of the recording
     * @param id Specify an identifier appended to the measurement name
     * @returns {void}
     */
    start(name: string, id?: string): void;
    /**
     * Stops a performance recording and stores delta duration
     * with the start marker
     * @param name Name of the recording
     * @param id Specify an identifier appended to the measurement name
     * @returns The measurement
     */
    stop(name: string, id?: string): PerformanceEntry;
    clear(name: string, id?: string): void;
    getEntries({ name, type }?: GetEntriesOptions): PerformanceEntry[];
    addPerformanceDataCallback(listener: PerformanceDataListener, buffer?: boolean): void;
    removePerformanceDataCallback(callback?: PerformanceCallbackFunction): void;
    /**
     * Tor browser does not support the Performance API
     * @returns {boolean} true if the Performance API is supported
     */
    private supportsPerformanceApi;
    private shouldEmit;
    /**
     * Internal utility to ensure consistent name for the recording
     * @param name Name of the recording
     * @param id Specify an identifier appended to the measurement name
     * @returns {string} a compound of the name and identifier if present
     */
    private buildKey;
}
export { PerformanceEntryNames, };
