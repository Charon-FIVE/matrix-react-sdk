import { Optional } from "matrix-events-sdk";
import { Room } from "matrix-js-sdk/src/models/room";
import { IEventRelation } from "matrix-js-sdk/src/models/event";
import { AsyncStoreWithClient } from "./AsyncStoreWithClient";
import { ActionPayload } from "../dispatcher/payloads";
import { VoiceRecording } from "../audio/VoiceRecording";
interface IState {
    [voiceRecordingId: string]: Optional<VoiceRecording>;
}
export declare class VoiceRecordingStore extends AsyncStoreWithClient<IState> {
    private static internalInstance;
    constructor();
    static get instance(): VoiceRecordingStore;
    protected onAction(payload: ActionPayload): Promise<void>;
    static getVoiceRecordingId(room: Room, relation?: IEventRelation): string;
    /**
     * Gets the active recording instance, if any.
     * @param {string} voiceRecordingId The room ID (with optionally the thread ID if in one) to get the recording in.
     * @returns {Optional<VoiceRecording>} The recording, if any.
     */
    getActiveRecording(voiceRecordingId: string): Optional<VoiceRecording>;
    /**
     * Starts a new recording if one isn't already in progress. Note that this simply
     * creates a recording instance - whether or not recording is actively in progress
     * can be seen via the VoiceRecording class.
     * @param {string} voiceRecordingId The room ID (with optionally the thread ID if in one) to start recording in.
     * @returns {VoiceRecording} The recording.
     */
    startRecording(voiceRecordingId: string): VoiceRecording;
    /**
     * Disposes of the current recording, no matter the state of it.
     * @param {string} voiceRecordingId The room ID (with optionally the thread ID if in one) to dispose of the recording in.
     * @returns {Promise<void>} Resolves when complete.
     */
    disposeRecording(voiceRecordingId: string): Promise<void>;
}
export {};
