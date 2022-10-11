import { Capability, IOpenIDUpdate, ISendEventDetails, ITurnServer, IRoomEvent, SimpleObservable, Symbols, Widget, WidgetDriver, WidgetKind } from "matrix-widget-api";
import { IContent } from "matrix-js-sdk/src/models/event";
export declare class StopGapWidgetDriver extends WidgetDriver {
    private forWidget;
    private forWidgetKind;
    private inRoomId?;
    private allowedCapabilities;
    constructor(allowedCapabilities: Capability[], forWidget: Widget, forWidgetKind: WidgetKind, inRoomId?: string);
    validateCapabilities(requested: Set<Capability>): Promise<Set<Capability>>;
    sendEvent(eventType: string, content: IContent, stateKey?: string, targetRoomId?: string): Promise<ISendEventDetails>;
    sendToDevice(eventType: string, encrypted: boolean, contentMap: {
        [userId: string]: {
            [deviceId: string]: object;
        };
    }): Promise<void>;
    private pickRooms;
    readRoomEvents(eventType: string, msgtype: string | undefined, limitPerRoom: number, roomIds?: (string | Symbols.AnyRoom)[]): Promise<IRoomEvent[]>;
    readStateEvents(eventType: string, stateKey: string | undefined, limitPerRoom: number, roomIds?: (string | Symbols.AnyRoom)[]): Promise<IRoomEvent[]>;
    askOpenID(observer: SimpleObservable<IOpenIDUpdate>): Promise<void>;
    navigate(uri: string): Promise<void>;
    getTurnServers(): AsyncGenerator<ITurnServer>;
}
