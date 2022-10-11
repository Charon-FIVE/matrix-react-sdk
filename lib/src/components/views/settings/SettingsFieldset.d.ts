import React, { ReactNode, HTMLAttributes } from 'react';
interface Props extends HTMLAttributes<HTMLFieldSetElement> {
    legend: string | ReactNode;
    description?: string | ReactNode;
}
declare const SettingsFieldset: React.FC<Props>;
export default SettingsFieldset;
