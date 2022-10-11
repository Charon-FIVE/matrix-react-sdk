import React, { ComponentProps, ReactNode } from "react";
import { RovingAccessibleButton } from "../../../../accessibility/roving/RovingAccessibleButton";
interface OptionProps extends ComponentProps<typeof RovingAccessibleButton> {
    endAdornment?: ReactNode;
}
export declare const Option: React.FC<OptionProps>;
export {};
