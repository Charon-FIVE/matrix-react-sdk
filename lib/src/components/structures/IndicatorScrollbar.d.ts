import React from "react";
import { IProps as AutoHideScrollbarProps } from "./AutoHideScrollbar";
export declare type IProps<T extends keyof JSX.IntrinsicElements> = Omit<AutoHideScrollbarProps<T>, "onWheel"> & {
    trackHorizontalOverflow?: boolean;
    verticalScrollsHorizontally?: boolean;
    children: React.ReactNode;
};
interface IState {
    leftIndicatorOffset: string;
    rightIndicatorOffset: string;
}
export default class IndicatorScrollbar<T extends keyof JSX.IntrinsicElements> extends React.Component<IProps<T>, IState> {
    private autoHideScrollbar;
    private scrollElement;
    private likelyTrackpadUser;
    private checkAgainForTrackpad;
    constructor(props: IProps<T>);
    private collectScroller;
    componentDidUpdate(prevProps: IProps<T>): void;
    componentDidMount(): void;
    private checkOverflow;
    componentWillUnmount(): void;
    private onMouseWheel;
    render(): JSX.Element;
}
export {};
