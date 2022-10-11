import React, { SyntheticEvent } from 'react';
import AccessibleButton from "./AccessibleButton";
import { Alignment } from './Tooltip';
interface IProps extends React.ComponentProps<typeof AccessibleButton> {
    title: string;
    tooltip?: React.ReactNode;
    label?: string;
    tooltipClassName?: string;
    forceHide?: boolean;
    alignment?: Alignment;
    onHover?: (hovering: boolean) => void;
    onHideTooltip?(ev: SyntheticEvent): void;
}
interface IState {
    hover: boolean;
}
export default class AccessibleTooltipButton extends React.PureComponent<IProps, IState> {
    constructor(props: IProps);
    componentDidUpdate(prevProps: Readonly<IProps>): void;
    private showTooltip;
    private hideTooltip;
    private onFocus;
    render(): JSX.Element;
}
export {};
