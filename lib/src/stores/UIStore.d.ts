/// <reference types="node" />
import EventEmitter from "events";
export declare enum UI_EVENTS {
    Resize = "resize"
}
export default class UIStore extends EventEmitter {
    private static _instance;
    private resizeObserver;
    private uiElementDimensions;
    private trackedUiElements;
    windowWidth: number;
    windowHeight: number;
    constructor();
    static get instance(): UIStore;
    static destroy(): void;
    getElementDimensions(name: string): DOMRectReadOnly;
    trackElementDimensions(name: string, element: Element): void;
    stopTrackingElementDimensions(name: string): void;
    isTrackingElementDimensions(name: string): boolean;
    private resizeObserverCallback;
}
