import { IWidget, IWidgetData } from "matrix-widget-api";
import { Room } from "matrix-js-sdk/src/models/room";
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { CallType } from "matrix-js-sdk/src/webrtc/call";
import { WidgetType } from "../widgets/WidgetType";
import { IApp } from "../stores/WidgetStore";
export interface IWidgetEvent {
    id: string;
    type: string;
    sender: string;
    state_key: string;
    content: Partial<IApp>;
}
export default class WidgetUtils {
    static canUserModifyWidgets(roomId: string): boolean;
    /**
     * Returns true if specified url is a scalar URL, typically https://scalar.vector.im/api
     * @param  {[type]}  testUrlString URL to check
     * @return {Boolean} True if specified URL is a scalar URL
     */
    static isScalarUrl(testUrlString: string): boolean;
    /**
     * Returns a promise that resolves when a widget with the given
     * ID has been added as a user widget (ie. the accountData event
     * arrives) or rejects after a timeout
     *
     * @param {string} widgetId The ID of the widget to wait for
     * @param {boolean} add True to wait for the widget to be added,
     *     false to wait for it to be deleted.
     * @returns {Promise} that resolves when the widget is in the
     *     requested state according to the `add` param
     */
    static waitForUserWidget(widgetId: string, add: boolean): Promise<void>;
    /**
     * Returns a promise that resolves when a widget with the given
     * ID has been added as a room widget in the given room (ie. the
     * room state event arrives) or rejects after a timeout
     *
     * @param {string} widgetId The ID of the widget to wait for
     * @param {string} roomId The ID of the room to wait for the widget in
     * @param {boolean} add True to wait for the widget to be added,
     *     false to wait for it to be deleted.
     * @returns {Promise} that resolves when the widget is in the
     *     requested state according to the `add` param
     */
    static waitForRoomWidget(widgetId: string, roomId: string, add: boolean): Promise<void>;
    static setUserWidget(widgetId: string, widgetType: WidgetType, widgetUrl: string, widgetName: string, widgetData: IWidgetData): Promise<void>;
    static setRoomWidget(roomId: string, widgetId: string, widgetType?: WidgetType, widgetUrl?: string, widgetName?: string, widgetData?: object, widgetAvatarUrl?: string): Promise<void>;
    static setRoomWidgetContent(roomId: string, widgetId: string, content: IWidget): Promise<void>;
    /**
     * Get room specific widgets
     * @param  {Room} room The room to get widgets force
     * @return {[object]} Array containing current / active room widgets
     */
    static getRoomWidgets(room: Room): MatrixEvent[];
    /**
     * Get user specific widgets (not linked to a specific room)
     * @return {object} Event content object containing current / active user widgets
     */
    static getUserWidgets(): Record<string, IWidgetEvent>;
    /**
     * Get user specific widgets (not linked to a specific room) as an array
     * @return {[object]} Array containing current / active user widgets
     */
    static getUserWidgetsArray(): IWidgetEvent[];
    /**
     * Get active stickerpicker widgets (stickerpickers are user widgets by nature)
     * @return {[object]} Array containing current / active stickerpicker widgets
     */
    static getStickerpickerWidgets(): IWidgetEvent[];
    /**
     * Get all integration manager widgets for this user.
     * @returns {Object[]} An array of integration manager user widgets.
     */
    static getIntegrationManagerWidgets(): IWidgetEvent[];
    static getRoomWidgetsOfType(room: Room, type: WidgetType): MatrixEvent[];
    static removeIntegrationManagerWidgets(): Promise<void>;
    static addIntegrationManagerWidget(name: string, uiUrl: string, apiUrl: string): Promise<void>;
    /**
     * Remove all stickerpicker widgets (stickerpickers are user widgets by nature)
     * @return {Promise} Resolves on account data updated
     */
    static removeStickerpickerWidgets(): Promise<void>;
    static addJitsiWidget(roomId: string, type: CallType, name: string, isVideoChannel: boolean, oobRoomName?: string): Promise<void>;
    static makeAppConfig(appId: string, app: Partial<IApp>, senderUserId: string, roomId: string | null, eventId: string): IApp;
    static getLocalJitsiWrapperUrl(opts?: {
        forLocalRender?: boolean;
        auth?: string;
    }): string;
    static getWidgetName(app?: IApp): string;
    static getWidgetDataTitle(app?: IApp): string;
    static getWidgetUid(app?: IApp): string;
    static calcWidgetUid(widgetId: string, roomId?: string): string;
    static editWidget(room: Room, app: IApp): void;
    static isManagedByManager(app: any): boolean;
}
