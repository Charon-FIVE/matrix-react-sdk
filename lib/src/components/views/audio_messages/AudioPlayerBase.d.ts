import React, { ReactNode, RefObject } from "react";
import { Playback, PlaybackState } from "../../../audio/Playback";
import SeekBar from "./SeekBar";
import PlayPauseButton from "./PlayPauseButton";
export interface IProps {
    playback: Playback;
    mediaName?: string;
}
interface IState {
    playbackPhase: PlaybackState;
    error?: boolean;
}
export default abstract class AudioPlayerBase<T extends IProps = IProps> extends React.PureComponent<T, IState> {
    protected seekRef: RefObject<SeekBar>;
    protected playPauseRef: RefObject<PlayPauseButton>;
    constructor(props: T);
    protected onKeyDown: (ev: React.KeyboardEvent) => void;
    private onPlaybackUpdate;
    protected abstract renderComponent(): ReactNode;
    render(): ReactNode;
}
export {};
