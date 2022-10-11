/// <reference types="node" />
import EventEmitter from 'events';
export declare enum ActiveWidgetStoreEvent {
    Persistence = "persistence",
    Dock = "dock",
    Undock = "undock"
}
/**
 * Stores information about the widgets active in the app right now:
 *  * What widget is set to remain always-on-screen, if any
 *    Only one widget may be 'always on screen' at any one time.
 *  * Reference counts to keep track of whether a widget is kept docked or alive
 *    by any components
 */
export default class ActiveWidgetStore extends EventEmitter {
    private static internalInstance;
    private persistentWidgetId;
    private persistentRoomId;
    private dockedWidgetsByUid;
    static get instance(): ActiveWidgetStore;
    start(): void;
    stop(): void;
    private onRoomStateEvents;
    destroyPersistentWidget(widgetId: string, roomId: string): void;
    setWidgetPersistence(widgetId: string, roomId: string, val: boolean): void;
    getWidgetPersistence(widgetId: string, roomId: string): boolean;
    getPersistentWidgetId(): string;
    getPersistentRoomId(): string;
    dockWidget(widgetId: string, roomId: string): void;
    undockWidget(widgetId: string, roomId: string): void;
    isDocked(widgetId: string, roomId: string): boolean;
    isLive(widgetId: string, roomId: string): boolean;
}
