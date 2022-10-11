import { SimpleObservable } from "matrix-widget-api";
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { IDestroyable } from "../utils/IDestroyable";
/**
 * Tracks accurate human-perceptible time for an audio clip, as informed
 * by managed playback. This clock is tightly coupled with the operation
 * of the Playback class, making assumptions about how the provided
 * AudioContext will be used (suspended/resumed to preserve time, etc).
 *
 * But why do we need a clock? The AudioContext exposes time information,
 * and so does the audio buffer, but not in a way that is useful for humans
 * to perceive. The audio buffer time is often lagged behind the context
 * time due to internal processing delays of the audio API. Additionally,
 * the context's time is tracked from when it was first initialized/started,
 * not related to positioning within the clip. However, the context time
 * is the most accurate time we can use to determine position within the
 * clip if we're fast enough to track the pauses and stops.
 *
 * As a result, we track every play, pause, stop, and seek event from the
 * Playback class (kinda: it calls us, which is close enough to the same
 * thing). These events are then tracked on the AudioContext time scale,
 * with assumptions that code execution will result in negligible desync
 * of the clock, or at least no perceptible difference in time. It's
 * extremely important that the calling code, and the clock's own code,
 * is extremely fast between the event happening and the clock time being
 * tracked - anything more than a dozen milliseconds is likely to stack up
 * poorly, leading to clock desync.
 *
 * Clock desync can be dangerous for the stability of the playback controls:
 * if the clock thinks the user is somewhere else in the clip, it could
 * inform the playback of the wrong place in time, leading to dead air in
 * the output or, if severe enough, a clock that won't stop running while
 * the audio is paused/stopped. Other examples include the clip stopping at
 * 90% time due to playback ending, the clip playing from the wrong spot
 * relative to the time, and negative clock time.
 *
 * Note that the clip duration is fed to the clock: this is to ensure that
 * we have the most accurate time possible to present.
 */
export declare class PlaybackClock implements IDestroyable {
    private context;
    private clipStart;
    private stopped;
    private lastCheck;
    private observable;
    private timerId;
    private clipDuration;
    private placeholderDuration;
    constructor(context: AudioContext);
    get durationSeconds(): number;
    set durationSeconds(val: number);
    get timeSeconds(): number;
    get liveData(): SimpleObservable<number[]>;
    private checkTime;
    /**
     * Populates default information about the audio clip from the event body.
     * The placeholders will be overridden once known.
     * @param {MatrixEvent} event The event to use for placeholders.
     */
    populatePlaceholdersFrom(event: MatrixEvent): void;
    /**
     * Mark the time in the audio context where the clip starts/has been loaded.
     * This is to ensure the clock isn't skewed into thinking it is ~0.5s into
     * a clip when the duration is set.
     */
    flagLoadTime(): void;
    flagStart(): void;
    flagStop(): void;
    syncTo(contextTime: number, clipTime: number): void;
    destroy(): void;
}
