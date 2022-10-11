import React from "react";
import { MatrixEvent } from "matrix-js-sdk/src/matrix";
interface IProps {
    mxEvent: MatrixEvent;
    children?: React.ReactNode;
}
declare const _default: React.ForwardRefExoticComponent<IProps & React.RefAttributes<HTMLDivElement>>;
export default _default;
