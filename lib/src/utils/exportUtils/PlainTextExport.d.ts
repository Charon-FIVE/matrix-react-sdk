import { Room } from "matrix-js-sdk/src/models/room";
import { IContent, MatrixEvent } from "matrix-js-sdk/src/models/event";
import React from "react";
import Exporter from "./Exporter";
import { ExportType, IExportOptions } from "./exportUtils";
export default class PlainTextExporter extends Exporter {
    protected totalSize: number;
    protected mediaOmitText: string;
    constructor(room: Room, exportType: ExportType, exportOptions: IExportOptions, setProgressText: React.Dispatch<React.SetStateAction<string>>);
    textForReplyEvent: (content: IContent) => any;
    protected plainTextForEvent: (mxEv: MatrixEvent) => Promise<string>;
    protected createOutput(events: MatrixEvent[]): Promise<string>;
    export(): Promise<void>;
}
