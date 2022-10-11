import React from "react";
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import MatrixClientContext from "../../../contexts/MatrixClientContext";
interface IProps {
    mxEvent: MatrixEvent;
    content: string;
    count: number;
    reactionEvents: Set<MatrixEvent>;
    myReactionEvent?: MatrixEvent;
    disabled?: boolean;
}
interface IState {
    tooltipRendered: boolean;
    tooltipVisible: boolean;
}
export default class ReactionsRowButton extends React.PureComponent<IProps, IState> {
    static contextType: React.Context<import("matrix-js-sdk/src").MatrixClient>;
    context: React.ContextType<typeof MatrixClientContext>;
    state: {
        tooltipRendered: boolean;
        tooltipVisible: boolean;
    };
    onClick: () => void;
    onMouseOver: () => void;
    onMouseLeave: () => void;
    render(): JSX.Element;
}
export {};
