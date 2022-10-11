import { TypedEventEmitter } from "matrix-js-sdk/src/models/typed-event-emitter";
import type { Room } from "matrix-js-sdk/src/models/room";
import type { RoomMember } from "matrix-js-sdk/src/models/room-member";
import type { ClientWidgetApi } from "matrix-widget-api";
import type { IApp } from "../stores/WidgetStore";
export declare enum ConnectionState {
    Disconnected = "disconnected",
    Connecting = "connecting",
    Connected = "connected",
    Disconnecting = "disconnecting"
}
export declare const isConnected: (state: ConnectionState) => boolean;
export declare enum CallEvent {
    ConnectionState = "connection_state",
    Participants = "participants",
    Destroy = "destroy"
}
interface CallEventHandlerMap {
    [CallEvent.ConnectionState]: (state: ConnectionState, prevState: ConnectionState) => void;
    [CallEvent.Participants]: (participants: Set<RoomMember>) => void;
    [CallEvent.Destroy]: () => void;
}
/**
 * A group call accessed through a widget.
 */
export declare abstract class Call extends TypedEventEmitter<CallEvent, CallEventHandlerMap> {
    /**
     * The widget used to access this call.
     */
    readonly widget: IApp;
    protected readonly widgetUid: string;
    private _messaging;
    /**
     * The widget's messaging, or null if disconnected.
     */
    protected get messaging(): ClientWidgetApi | null;
    private set messaging(value);
    get roomId(): string;
    private _connectionState;
    get connectionState(): ConnectionState;
    protected set connectionState(value: ConnectionState);
    get connected(): boolean;
    private _participants;
    get participants(): Set<RoomMember>;
    protected set participants(value: Set<RoomMember>);
    constructor(
    /**
     * The widget used to access this call.
     */
    widget: IApp);
    /**
     * Gets the call associated with the given room, if any.
     * @param {Room} room The room.
     * @returns {Call | null} The call.
     */
    static get(room: Room): Call | null;
    /**
     * Performs a routine check of the call's associated room state, cleaning up
     * any data left over from an unclean disconnection.
     */
    abstract clean(): Promise<void>;
    /**
     * Contacts the widget to connect to the call.
     * @param {MediaDeviceInfo | null} audioDevice The audio input to use, or
     *   null to start muted.
     * @param {MediaDeviceInfo | null} audioDevice The video input to use, or
     *   null to start muted.
     */
    protected abstract performConnection(audioInput: MediaDeviceInfo | null, videoInput: MediaDeviceInfo | null): Promise<void>;
    /**
     * Contacts the widget to disconnect from the call.
     */
    protected abstract performDisconnection(): Promise<void>;
    /**
     * Connects the user to the call using the media devices set in
     * MediaDeviceHandler. The widget associated with the call must be active
     * for this to succeed.
     */
    connect(): Promise<void>;
    /**
     * Disconnects the user from the call.
     */
    disconnect(): Promise<void>;
    /**
     * Manually marks the call as disconnected and cleans up.
     */
    setDisconnected(): void;
    /**
     * Stops all internal timers and tasks to prepare for garbage collection.
     */
    destroy(): void;
}
/**
 * A group call using Jitsi as a backend.
 */
export declare class JitsiCall extends Call {
    private readonly client;
    static readonly MEMBER_EVENT_TYPE = "io.element.video.member";
    static readonly STUCK_DEVICE_TIMEOUT_MS: number;
    private room;
    private resendDevicesTimer;
    private participantsExpirationTimer;
    private constructor();
    static get(room: Room): JitsiCall | null;
    static create(room: Room): Promise<void>;
    private updateParticipants;
    private updateDevices;
    private addOurDevice;
    private removeOurDevice;
    clean(): Promise<void>;
    protected performConnection(audioInput: MediaDeviceInfo | null, videoInput: MediaDeviceInfo | null): Promise<void>;
    protected performDisconnection(): Promise<void>;
    setDisconnected(): void;
    destroy(): void;
    private onRoomState;
    private onConnectionState;
    private onDock;
    private onUndock;
    private onMyMembership;
    private beforeUnload;
    private onHangup;
}
export {};
