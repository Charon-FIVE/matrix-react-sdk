import React from 'react';
import { IDevtoolsProps } from "./devtools/BaseTool";
export declare type Tool = React.FC<IDevtoolsProps>;
interface IProps {
    roomId: string;
    onFinished(finished: boolean): void;
}
declare const DevtoolsDialog: React.FC<IProps>;
export default DevtoolsDialog;
