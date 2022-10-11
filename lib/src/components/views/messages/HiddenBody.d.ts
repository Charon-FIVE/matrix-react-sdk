import React from "react";
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { IBodyProps } from "./IBodyProps";
interface IProps {
    mxEvent: MatrixEvent;
}
/**
 * A message hidden from the user pending moderation.
 *
 * Note: This component must not be used when the user is the author of the message
 * or has a sufficient powerlevel to see the message.
 */
declare const HiddenBody: React.ForwardRefExoticComponent<(IBodyProps | IProps) & React.RefAttributes<any>>;
export default HiddenBody;
