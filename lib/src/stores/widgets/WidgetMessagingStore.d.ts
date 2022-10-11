import { ClientWidgetApi, Widget } from "matrix-widget-api";
import { AsyncStoreWithClient } from "../AsyncStoreWithClient";
import { ActionPayload } from "../../dispatcher/payloads";
export declare enum WidgetMessagingStoreEvent {
    StoreMessaging = "store_messaging",
    StopMessaging = "stop_messaging"
}
/**
 * Temporary holding store for widget messaging instances. This is eventually
 * going to be merged with a more complete WidgetStore, but for now it's
 * easiest to split this into a single place.
 */
export declare class WidgetMessagingStore extends AsyncStoreWithClient<{}> {
    private static readonly internalInstance;
    private widgetMap;
    constructor();
    static get instance(): WidgetMessagingStore;
    protected onAction(payload: ActionPayload): Promise<void>;
    protected onReady(): Promise<any>;
    storeMessaging(widget: Widget, roomId: string, widgetApi: ClientWidgetApi): void;
    stopMessaging(widget: Widget, roomId: string): void;
    getMessaging(widget: Widget, roomId: string): ClientWidgetApi;
    /**
     * Stops the widget messaging instance for a given widget UID.
     * @param {string} widgetUid The widget UID.
     */
    stopMessagingByUid(widgetUid: string): void;
    /**
     * Gets the widget messaging class for a given widget UID.
     * @param {string} widgetUid The widget UID.
     * @returns {ClientWidgetApi} The widget API, or a falsy value if not found.
     */
    getMessagingForUid(widgetUid: string): ClientWidgetApi;
}
