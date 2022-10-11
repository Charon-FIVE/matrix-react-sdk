/// <reference types="react" />
import { Room } from "matrix-js-sdk/src/models/room";
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import Exporter from "./Exporter";
import { ExportType, IExportOptions } from "./exportUtils";
export default class JSONExporter extends Exporter {
    protected totalSize: number;
    protected messages: Record<string, any>[];
    constructor(room: Room, exportType: ExportType, exportOptions: IExportOptions, setProgressText: React.Dispatch<React.SetStateAction<string>>);
    protected createJSONString(): string;
    protected getJSONString(mxEv: MatrixEvent): Promise<any>;
    protected createOutput(events: MatrixEvent[]): Promise<string>;
    export(): Promise<void>;
}
