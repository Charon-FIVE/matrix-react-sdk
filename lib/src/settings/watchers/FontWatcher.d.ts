import IWatcher from "./Watcher";
export declare class FontWatcher implements IWatcher {
    static readonly MIN_SIZE = 8;
    static readonly DEFAULT_SIZE = 10;
    static readonly MAX_SIZE = 15;
    static readonly SIZE_DIFF = 5;
    private dispatcherRef;
    constructor();
    start(): void;
    stop(): void;
    private updateFont;
    private onAction;
    private setRootFontSize;
    private setSystemFont;
}
