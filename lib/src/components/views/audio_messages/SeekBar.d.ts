import React, { ReactNode } from "react";
import { Playback, PlaybackState } from "../../../audio/Playback";
interface IProps {
    playback: Playback;
    tabIndex?: number;
    playbackPhase: PlaybackState;
}
interface IState {
    percentage: number;
}
export default class SeekBar extends React.PureComponent<IProps, IState> {
    private animationFrameFn;
    static defaultProps: {
        tabIndex: number;
    };
    constructor(props: IProps);
    private doUpdate;
    left(): void;
    right(): void;
    private onChange;
    render(): ReactNode;
}
export {};
