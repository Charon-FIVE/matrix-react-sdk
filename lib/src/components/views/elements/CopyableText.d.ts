import React from "react";
interface IProps {
    children?: React.ReactNode;
    getTextToCopy: () => string;
    border?: boolean;
    className?: string;
}
declare const CopyableText: React.FC<IProps>;
export default CopyableText;
