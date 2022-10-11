import React from "react";
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { Relations } from "matrix-js-sdk/src/models/relations";
import RoomContext from "../../../contexts/RoomContext";
interface IProps {
    mxEvent: MatrixEvent;
    reactions?: Relations;
}
interface IState {
    myReactions: MatrixEvent[];
    showAll: boolean;
}
export default class ReactionsRow extends React.PureComponent<IProps, IState> {
    static contextType: React.Context<import("../../structures/RoomView").IRoomState>;
    context: React.ContextType<typeof RoomContext>;
    constructor(props: IProps, context: React.ContextType<typeof RoomContext>);
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(prevProps: IProps): void;
    private onDecrypted;
    private onReactionsChange;
    private getMyReactions;
    private onShowAllClick;
    render(): JSX.Element;
}
export {};
