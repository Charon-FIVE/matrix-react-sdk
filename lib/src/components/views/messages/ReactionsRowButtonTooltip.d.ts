import React from "react";
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
interface IProps {
    mxEvent: MatrixEvent;
    content: string;
    reactionEvents: Set<MatrixEvent>;
    visible: boolean;
}
export default class ReactionsRowButtonTooltip extends React.PureComponent<IProps> {
    static contextType: React.Context<import("matrix-js-sdk/src").MatrixClient>;
    render(): any;
}
export {};
