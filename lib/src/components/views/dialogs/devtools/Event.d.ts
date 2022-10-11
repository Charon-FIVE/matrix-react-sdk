import React from "react";
import { IContent, MatrixEvent } from "matrix-js-sdk/src/models/event";
import { IDevtoolsProps } from "./BaseTool";
export declare const stringify: (object: object) => string;
interface IEventEditorProps extends Pick<IDevtoolsProps, "onBack"> {
    fieldDefs: IFieldDef[];
    defaultContent?: string;
    onSend(fields: string[], content?: IContent): Promise<unknown>;
}
interface IFieldDef {
    id: string;
    label: string;
    default?: string;
}
export declare const eventTypeField: (defaultValue?: string) => IFieldDef;
export declare const stateKeyField: (defaultValue?: string) => IFieldDef;
export declare const EventEditor: ({ fieldDefs, defaultContent, onSend, onBack }: IEventEditorProps) => JSX.Element;
export interface IEditorProps extends Pick<IDevtoolsProps, "onBack"> {
    mxEvent?: MatrixEvent;
}
interface IViewerProps extends Required<IEditorProps> {
    Editor: React.FC<Required<IEditorProps>>;
}
export declare const EventViewer: ({ mxEvent, onBack, Editor }: IViewerProps) => JSX.Element;
export declare const TimelineEventEditor: ({ mxEvent, onBack }: IEditorProps) => JSX.Element;
export {};
