/// <reference types="node" />
import EventEmitter from 'events';
export declare enum MediaDeviceKindEnum {
    AudioOutput = "audiooutput",
    AudioInput = "audioinput",
    VideoInput = "videoinput"
}
export declare type IMediaDevices = Record<MediaDeviceKindEnum, Array<MediaDeviceInfo>>;
export declare enum MediaDeviceHandlerEvent {
    AudioOutputChanged = "audio_output_changed"
}
export default class MediaDeviceHandler extends EventEmitter {
    private static internalInstance;
    static get instance(): MediaDeviceHandler;
    static hasAnyLabeledDevices(): Promise<boolean>;
    static getDevices(): Promise<IMediaDevices>;
    /**
     * Retrieves devices from the SettingsStore and tells the js-sdk to use them
     */
    static loadDevices(): Promise<void>;
    setAudioOutput(deviceId: string): void;
    /**
     * This will not change the device that a potential call uses. The call will
     * need to be ended and started again for this change to take effect
     * @param {string} deviceId
     */
    setAudioInput(deviceId: string): Promise<void>;
    /**
     * This will not change the device that a potential call uses. The call will
     * need to be ended and started again for this change to take effect
     * @param {string} deviceId
     */
    setVideoInput(deviceId: string): Promise<void>;
    setDevice(deviceId: string, kind: MediaDeviceKindEnum): Promise<void>;
    static getAudioOutput(): string;
    static getAudioInput(): string;
    static getVideoInput(): string;
    /**
     * Returns the current set deviceId for a device kind
     * @param {MediaDeviceKindEnum} kind of the device that will be returned
     * @returns {string} the deviceId
     */
    static getDevice(kind: MediaDeviceKindEnum): string;
    static get startWithAudioMuted(): boolean;
    static set startWithAudioMuted(value: boolean);
    static get startWithVideoMuted(): boolean;
    static set startWithVideoMuted(value: boolean);
}
