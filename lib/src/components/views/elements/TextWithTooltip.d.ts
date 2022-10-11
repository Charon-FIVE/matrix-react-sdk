import React, { HTMLAttributes } from 'react';
import TooltipTarget from './TooltipTarget';
interface IProps extends HTMLAttributes<HTMLSpanElement> {
    class?: string;
    tooltipClass?: string;
    tooltip: React.ReactNode;
    tooltipProps?: Omit<React.ComponentProps<typeof TooltipTarget>, "label" | "tooltipClassName" | "className">;
    onClick?: (ev?: React.MouseEvent) => void;
}
export default class TextWithTooltip extends React.Component<IProps> {
    constructor(props: IProps);
    render(): JSX.Element;
}
export {};
