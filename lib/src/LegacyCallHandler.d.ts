/// <reference types="node" />
import { CallType, MatrixCall } from "matrix-js-sdk/src/webrtc/call";
import EventEmitter from 'events';
export declare const PROTOCOL_PSTN = "m.protocol.pstn";
export declare const PROTOCOL_PSTN_PREFIXED = "im.vector.protocol.pstn";
export declare const PROTOCOL_SIP_NATIVE = "im.vector.protocol.sip_native";
export declare const PROTOCOL_SIP_VIRTUAL = "im.vector.protocol.sip_virtual";
declare enum AudioID {
    Ring = "ringAudio",
    Ringback = "ringbackAudio",
    CallEnd = "callendAudio",
    Busy = "busyAudio"
}
interface ThirdpartyLookupResponseFields {
    virtual_mxid?: string;
    is_virtual?: boolean;
    native_mxid?: string;
    is_native?: boolean;
    lookup_success?: boolean;
}
interface ThirdpartyLookupResponse {
    userid: string;
    protocol: string;
    fields: ThirdpartyLookupResponseFields;
}
export declare enum LegacyCallHandlerEvent {
    CallsChanged = "calls_changed",
    CallChangeRoom = "call_change_room",
    SilencedCallsChanged = "silenced_calls_changed",
    CallState = "call_state"
}
/**
 * LegacyCallHandler manages all currently active calls. It should be used for
 * placing, answering, rejecting and hanging up calls. It also handles ringing,
 * PSTN support and other things.
 */
export default class LegacyCallHandler extends EventEmitter {
    private calls;
    private transferees;
    private audioPromises;
    private supportsPstnProtocol;
    private pstnSupportPrefixed;
    private supportsSipNativeVirtual;
    private assertedIdentityNativeUsers;
    private silencedCalls;
    static get instance(): LegacyCallHandler;
    roomIdForCall(call: MatrixCall): string;
    start(): void;
    stop(): void;
    silenceCall(callId: string): void;
    unSilenceCall(callId: string): void;
    isCallSilenced(callId: string): boolean;
    /**
     * Returns true if there is at least one unsilenced call
     * @returns {boolean}
     */
    private areAnyCallsUnsilenced;
    private checkProtocols;
    private shouldObeyAssertedfIdentity;
    getSupportsPstnProtocol(): boolean;
    getSupportsVirtualRooms(): boolean;
    pstnLookup(phoneNumber: string): Promise<ThirdpartyLookupResponse[]>;
    sipVirtualLookup(nativeMxid: string): Promise<ThirdpartyLookupResponse[]>;
    sipNativeLookup(virtualMxid: string): Promise<ThirdpartyLookupResponse[]>;
    private onCallIncoming;
    getCallById(callId: string): MatrixCall;
    getCallForRoom(roomId: string): MatrixCall | null;
    getAnyActiveCall(): MatrixCall | null;
    getAllActiveCalls(): MatrixCall[];
    getAllActiveCallsNotInRoom(notInThisRoomId: string): MatrixCall[];
    getAllActiveCallsForPip(roomId: string): MatrixCall[];
    getTransfereeForCallId(callId: string): MatrixCall;
    play(audioId: AudioID): void;
    pause(audioId: AudioID): void;
    private matchesCallForThisRoom;
    private setCallListeners;
    private onCallStateChanged;
    private logCallStats;
    private setCallState;
    private removeCallForRoom;
    private showICEFallbackPrompt;
    private showMediaCaptureError;
    private placeMatrixCall;
    placeCall(roomId: string, type?: CallType, transferee?: MatrixCall): void;
    hangupAllCalls(): void;
    hangupOrReject(roomId: string, reject?: boolean): void;
    answerCall(roomId: string): void;
    private stopRingingIfPossible;
    dialNumber(number: string, transferee?: MatrixCall): Promise<void>;
    startTransferToPhoneNumber(call: MatrixCall, destination: string, consultFirst: boolean): Promise<void>;
    startTransferToMatrixID(call: MatrixCall, destination: string, consultFirst: boolean): Promise<void>;
    setActiveCallRoomId(activeCallRoomId: string): void;
    /**
     * @returns true if we are currently in any call where we haven't put the remote party on hold
     */
    hasAnyUnheldCall(): boolean;
    private placeJitsiCall;
    hangupCallApp(roomId: string): void;
    showTransferDialog(call: MatrixCall): void;
    private addCallForRoom;
}
export {};
