import React, { CSSProperties } from 'react';
export declare enum Alignment {
    Natural = 0,
    Left = 1,
    Right = 2,
    Top = 3,
    Bottom = 4,
    InnerBottom = 5,
    TopRight = 6
}
export interface ITooltipProps {
    className?: string;
    tooltipClassName?: string;
    visible?: boolean;
    label: React.ReactNode;
    alignment?: Alignment;
    id?: string;
    maxParentWidth?: number;
}
declare type State = Partial<Pick<CSSProperties, "display" | "right" | "top" | "transform" | "left">>;
export default class Tooltip extends React.PureComponent<ITooltipProps, State> {
    private static container;
    private parent;
    static readonly Alignment: typeof Alignment;
    static readonly defaultProps: {
        visible: boolean;
        alignment: Alignment;
    };
    constructor(props: any);
    componentDidMount(): void;
    componentDidUpdate(prevProps: any): void;
    componentWillUnmount(): void;
    private updatePosition;
    render(): JSX.Element;
}
export {};
