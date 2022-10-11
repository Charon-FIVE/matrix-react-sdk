import { ReactNode } from "react";
import AudioPlayerBase, { IProps as IAudioPlayerBaseProps } from "./AudioPlayerBase";
export declare enum PlaybackLayout {
    /**
     * Clock on the left side of a waveform, without seek bar.
     */
    Composer = 0,
    /**
     * Clock on the right side of a waveform, with an added seek bar.
     */
    Timeline = 1
}
interface IProps extends IAudioPlayerBaseProps {
    layout?: PlaybackLayout;
}
export default class RecordingPlayback extends AudioPlayerBase<IProps> {
    private renderComposerLook;
    private renderTimelineLook;
    protected renderComponent(): ReactNode;
}
export {};
