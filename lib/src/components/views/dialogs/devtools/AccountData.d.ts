/// <reference types="react" />
import { IDevtoolsProps } from "./BaseTool";
import { IEditorProps } from "./Event";
export declare const AccountDataEventEditor: ({ mxEvent, onBack }: IEditorProps) => JSX.Element;
export declare const RoomAccountDataEventEditor: ({ mxEvent, onBack }: IEditorProps) => JSX.Element;
export declare const AccountDataExplorer: ({ onBack, setTool }: IDevtoolsProps) => JSX.Element;
export declare const RoomAccountDataExplorer: ({ onBack, setTool }: IDevtoolsProps) => JSX.Element;
