import React from 'react';
export declare enum InfoTooltipKind {
    Info = "info",
    Warning = "warning"
}
interface ITooltipProps {
    tooltip?: React.ReactNode;
    className?: string;
    tooltipClassName?: string;
    kind?: InfoTooltipKind;
}
export default class InfoTooltip extends React.PureComponent<ITooltipProps> {
    constructor(props: ITooltipProps);
    render(): JSX.Element;
}
export {};
