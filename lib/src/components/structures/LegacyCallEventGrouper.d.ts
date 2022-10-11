/// <reference types="node" />
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { CallState } from "matrix-js-sdk/src/webrtc/call";
import { EventEmitter } from 'events';
export declare enum LegacyCallEventGrouperEvent {
    StateChanged = "state_changed",
    SilencedChanged = "silenced_changed",
    LengthChanged = "length_changed"
}
export declare enum CustomCallState {
    Missed = "missed"
}
export declare function buildLegacyCallEventGroupers(callEventGroupers: Map<string, LegacyCallEventGrouper>, events?: MatrixEvent[]): Map<string, LegacyCallEventGrouper>;
export default class LegacyCallEventGrouper extends EventEmitter {
    private events;
    private call;
    state: CallState | CustomCallState;
    constructor();
    private get invite();
    private get hangup();
    private get reject();
    private get selectAnswer();
    get isVoice(): boolean;
    get hangupReason(): string | null;
    get rejectParty(): string;
    get gotRejected(): boolean;
    get duration(): Date;
    /**
     * Returns true if there are only events from the other side - we missed the call
     */
    private get callWasMissed();
    private get callId();
    private get roomId();
    private onSilencedCallsChanged;
    private onLengthChanged;
    answerCall: () => void;
    rejectCall: () => void;
    callBack: () => void;
    toggleSilenced: () => void;
    private setCallListeners;
    private setState;
    private setCall;
    add(event: MatrixEvent): void;
}
