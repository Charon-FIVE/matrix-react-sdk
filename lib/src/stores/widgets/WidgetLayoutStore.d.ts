import { Room } from "matrix-js-sdk/src/models/room";
import { Optional } from "matrix-events-sdk";
import { IApp } from "../WidgetStore";
import { ReadyWatchingStore } from "../ReadyWatchingStore";
export declare const WIDGET_LAYOUT_EVENT_TYPE = "io.element.widgets.layout";
export declare enum Container {
    Top = "top",
    Right = "right",
    Center = "center"
}
export interface IStoredLayout {
    container: Container;
    index?: number;
    width?: number;
    height?: number;
}
export declare const MAX_PINNED = 3;
export declare class WidgetLayoutStore extends ReadyWatchingStore {
    private static internalInstance;
    private byRoom;
    private pinnedRef;
    private layoutRef;
    private constructor();
    static get instance(): WidgetLayoutStore;
    static emissionForRoom(room: Room): string;
    private emitFor;
    protected onReady(): Promise<any>;
    protected onNotReady(): Promise<any>;
    private updateAllRooms;
    private updateFromWidgetStore;
    private updateRoomFromState;
    private updateFromSettings;
    recalculateRoom(room: Room): void;
    getContainerWidgets(room: Optional<Room>, container: Container): IApp[];
    isInContainer(room: Optional<Room>, widget: IApp, container: Container): boolean;
    canAddToContainer(room: Room, container: Container): boolean;
    getResizerDistributions(room: Room, container: Container): string[];
    setResizerDistributions(room: Room, container: Container, distributions: string[]): void;
    getContainerHeight(room: Room, container: Container): number;
    setContainerHeight(room: Room, container: Container, height: number): void;
    moveWithinContainer(room: Room, container: Container, widget: IApp, delta: number): void;
    moveToContainer(room: Room, widget: IApp, toContainer: Container): void;
    hasMaximisedWidget(room: Room): boolean;
    hasPinnedWidgets(room: Room): boolean;
    canCopyLayoutToRoom(room: Room): boolean;
    copyLayoutToRoom(room: Room): void;
    private getAllWidgets;
    private updateUserLayout;
}
