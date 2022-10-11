import React, { MouseEventHandler, ReactNode, RefCallback } from "react";
export declare enum Direction {
    Top = 0,
    Left = 1,
    Bottom = 2,
    Right = 3
}
export declare function mouseWithinRegion(x: number, y: number, direction: Direction, targetRect: DOMRect, contentRect: DOMRect): boolean;
interface IProps {
    children(props: {
        ref: RefCallback<HTMLElement>;
        onMouseOver: MouseEventHandler;
    }): ReactNode;
    content: ReactNode;
    direction?: Direction;
    onVisibilityChange?(visible: boolean): void;
}
interface IState {
    contentRect: DOMRect;
    visible: boolean;
}
export default class InteractiveTooltip extends React.Component<IProps, IState> {
    private target;
    static defaultProps: {
        side: Direction;
    };
    constructor(props: any, context: any);
    componentDidUpdate(): void;
    componentWillUnmount(): void;
    private collectContentRect;
    private collectTarget;
    private onLeftOfTarget;
    private aboveTarget;
    private get isOnTheSide();
    private onMouseMove;
    private onTargetMouseOver;
    private showTooltip;
    hideTooltip(): void;
    private renderTooltip;
    render(): React.ReactNode;
}
export {};
