import React, { HTMLAttributes } from 'react';
import { ITooltipProps } from './Tooltip';
interface IProps extends HTMLAttributes<HTMLSpanElement>, Omit<ITooltipProps, 'visible'> {
    tooltipTargetClassName?: string;
    ignoreHover?: (ev: React.MouseEvent) => boolean;
}
/**
 * Generic tooltip target element that handles tooltip visibility state
 * and displays children
 */
declare const TooltipTarget: React.FC<IProps>;
export default TooltipTarget;
