import React from 'react';
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { Relations } from 'matrix-js-sdk/src/models/relations';
import RoomContext from "../../../contexts/RoomContext";
interface IProps {
    mxEvent: MatrixEvent;
    reactions?: Relations;
    onFinished(): void;
}
interface IState {
    selectedEmojis: Set<string>;
}
declare class ReactionPicker extends React.Component<IProps, IState> {
    static contextType: React.Context<import("../../structures/RoomView").IRoomState>;
    context: React.ContextType<typeof RoomContext>;
    constructor(props: IProps, context: React.ContextType<typeof RoomContext>);
    componentDidUpdate(prevProps: any): void;
    private addListeners;
    componentWillUnmount(): void;
    private getReactions;
    private onReactionsChange;
    private onChoose;
    private isEmojiDisabled;
    render(): JSX.Element;
}
export default ReactionPicker;
