import React, { ComponentProps, ReactNode } from "react";
import { RovingAccessibleTooltipButton } from "../../../../accessibility/roving/RovingAccessibleTooltipButton";
interface TooltipOptionProps extends ComponentProps<typeof RovingAccessibleTooltipButton> {
    endAdornment?: ReactNode;
}
export declare const TooltipOption: React.FC<TooltipOptionProps>;
export {};
