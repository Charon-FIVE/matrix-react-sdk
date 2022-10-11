import React from "react";
import { Room } from "matrix-js-sdk/src/models/room";
import { XOR } from "../../../../@types/common";
import { Tool } from "../DevtoolsDialog";
export interface IDevtoolsProps {
    onBack(): void;
    setTool(label: string, tool: Tool): void;
}
interface IMinProps extends Pick<IDevtoolsProps, "onBack"> {
    className?: string;
}
interface IProps extends IMinProps {
    actionLabel: string;
    onAction(): Promise<string | void>;
}
declare const BaseTool: React.FC<XOR<IMinProps, IProps>>;
export default BaseTool;
interface IContext {
    room: Room;
}
export declare const DevtoolsContext: React.Context<IContext>;
