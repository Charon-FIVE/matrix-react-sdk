import { ClientWidgetApi } from "matrix-widget-api";
export declare function getConfigLivestreamUrl(): string;
export declare function startJitsiAudioLivestream(widgetMessaging: ClientWidgetApi, roomId: string): Promise<void>;
