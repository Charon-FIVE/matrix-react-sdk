/// <reference types="node" />
import { Room } from "matrix-js-sdk/src/models/room";
import { ClientWidgetApi, ITemplateParams, IWidget, IWidgetData, Widget } from "matrix-widget-api";
import { EventEmitter } from "events";
interface IAppTileProps {
    app: IWidget;
    room?: Room;
    userId: string;
    creatorUserId: string;
    waitForIframeLoad: boolean;
    whitelistCapabilities?: string[];
    userWidget: boolean;
}
export declare class ElementWidget extends Widget {
    private rawDefinition;
    constructor(rawDefinition: IWidget);
    get templateUrl(): string;
    get popoutTemplateUrl(): string;
    get rawData(): IWidgetData;
    getCompleteUrl(params: ITemplateParams, asPopout?: boolean): string;
}
export declare class StopGapWidget extends EventEmitter {
    private appTileProps;
    private client;
    private messaging;
    private mockWidget;
    private scalarToken;
    private roomId?;
    private kind;
    private readUpToMap;
    constructor(appTileProps: IAppTileProps);
    private get eventListenerRoomId();
    get widgetApi(): ClientWidgetApi;
    /**
     * The URL to use in the iframe
     */
    get embedUrl(): string;
    /**
     * The URL to use in the popout
     */
    get popoutUrl(): string;
    private runUrlTemplate;
    get isManagedByManager(): boolean;
    get started(): boolean;
    private onOpenModal;
    /**
     * This starts the messaging for the widget if it is not in the state `started` yet.
     * @param iframe the iframe the widget should use
     */
    startMessaging(iframe: HTMLIFrameElement): any;
    prepare(): Promise<void>;
    /**
     * Stops the widget messaging for if it is started. Skips stopping if it is an active
     * widget.
     * @param opts
     */
    stopMessaging(opts?: {
        forceDestroy: boolean;
    }): void;
    private onEvent;
    private onEventDecrypted;
    private onToDeviceEvent;
    private feedEvent;
}
export {};
