import React from "react";
import { Playback } from "../../../audio/Playback";
import { IBodyProps } from "./IBodyProps";
import RoomContext from "../../../contexts/RoomContext";
interface IState {
    error?: Error;
    playback?: Playback;
}
export default class MAudioBody extends React.PureComponent<IBodyProps, IState> {
    static contextType: React.Context<import("../../structures/RoomView").IRoomState>;
    context: React.ContextType<typeof RoomContext>;
    constructor(props: IBodyProps);
    componentDidMount(): Promise<void>;
    componentWillUnmount(): void;
    protected get showFileBody(): boolean;
    render(): JSX.Element;
}
export {};
