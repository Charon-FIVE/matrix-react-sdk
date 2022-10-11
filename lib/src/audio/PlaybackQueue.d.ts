import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { Room } from "matrix-js-sdk/src/models/room";
import { Playback } from "./Playback";
/**
 * Audio playback queue management for a given room. This keeps track of where the user
 * was at for each playback, what order the playbacks were played in, and triggers subsequent
 * playbacks.
 *
 * Currently this is only intended to be used by voice messages.
 *
 * The primary mechanics are:
 * * Persisted clock state for each playback instance (tied to Event ID).
 * * Limited memory of playback order (see code; not persisted).
 * * Autoplay of next eligible playback instance.
 */
export declare class PlaybackQueue {
    private room;
    private static queues;
    private playbacks;
    private clockStates;
    private playbackIdOrder;
    private currentPlaybackId;
    private recentFullPlays;
    constructor(room: Room);
    static forRoom(roomId: string): PlaybackQueue;
    private persistClocks;
    private loadClocks;
    unsortedEnqueue(mxEvent: MatrixEvent, playback: Playback): void;
    private onPlaybackStateChange;
    private onPlaybackClock;
}
