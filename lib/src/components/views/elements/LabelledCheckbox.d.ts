import React from "react";
interface IProps {
    value: boolean;
    label: string;
    byline?: string;
    disabled?: boolean;
    onChange(checked: boolean): void;
}
declare const LabelledCheckbox: React.FC<IProps>;
export default LabelledCheckbox;
