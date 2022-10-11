import React, { HTMLAttributes } from "react";
export interface SettingsSubsectionProps extends HTMLAttributes<HTMLDivElement> {
    heading: string;
    description?: string | React.ReactNode;
    children?: React.ReactNode;
}
declare const SettingsSubsection: React.FC<SettingsSubsectionProps>;
export default SettingsSubsection;
