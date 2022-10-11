/// <reference types="react" />
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { Room } from "matrix-js-sdk/src/models/room";
import { MatrixClient } from "matrix-js-sdk/src/client";
import { ExportType, IExportOptions } from "./exportUtils";
declare type BlobFile = {
    name: string;
    blob: Blob;
};
export default abstract class Exporter {
    protected room: Room;
    protected exportType: ExportType;
    protected exportOptions: IExportOptions;
    protected setProgressText: React.Dispatch<React.SetStateAction<string>>;
    protected files: BlobFile[];
    protected client: MatrixClient;
    protected cancelled: boolean;
    protected constructor(room: Room, exportType: ExportType, exportOptions: IExportOptions, setProgressText: React.Dispatch<React.SetStateAction<string>>);
    protected onBeforeUnload(e: BeforeUnloadEvent): string;
    protected updateProgress(progress: string, log?: boolean, show?: boolean): void;
    protected addFile(filePath: string, blob: Blob): void;
    protected downloadZIP(): Promise<string | void>;
    protected cleanUp(): string;
    cancelExport(): Promise<void>;
    protected downloadPlainText(fileName: string, text: string): void;
    protected setEventMetadata(event: MatrixEvent): MatrixEvent;
    getLimit(): number;
    protected getRequiredEvents(): Promise<MatrixEvent[]>;
    protected getMediaBlob(event: MatrixEvent): Promise<Blob>;
    splitFileName(file: string): string[];
    getFilePath(event: MatrixEvent): string;
    protected isReply(event: MatrixEvent): boolean;
    protected isAttachment(mxEv: MatrixEvent): boolean;
    abstract export(): Promise<void>;
}
export {};
