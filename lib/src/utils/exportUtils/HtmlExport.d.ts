import React from "react";
import { Room } from "matrix-js-sdk/src/models/room";
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import Exporter from "./Exporter";
import { RoomPermalinkCreator } from "../permalinks/Permalinks";
import { ExportType, IExportOptions } from "./exportUtils";
export default class HTMLExporter extends Exporter {
    protected avatars: Map<string, boolean>;
    protected permalinkCreator: RoomPermalinkCreator;
    protected totalSize: number;
    protected mediaOmitText: string;
    private threadsEnabled;
    constructor(room: Room, exportType: ExportType, exportOptions: IExportOptions, setProgressText: React.Dispatch<React.SetStateAction<string>>);
    protected getRoomAvatar(): Promise<string>;
    protected wrapHTML(content: string): Promise<string>;
    protected getAvatarURL(event: MatrixEvent): string;
    protected saveAvatarIfNeeded(event: MatrixEvent): Promise<void>;
    protected getDateSeparator(event: MatrixEvent): string;
    protected needsDateSeparator(event: MatrixEvent, prevEvent: MatrixEvent): boolean;
    getEventTile(mxEv: MatrixEvent, continuation: boolean): JSX.Element;
    protected getEventTileMarkup(mxEv: MatrixEvent, continuation: boolean, filePath?: string): Promise<string>;
    protected createModifiedEvent(text: string, mxEv: MatrixEvent, italic?: boolean): MatrixEvent;
    protected createMessageBody(mxEv: MatrixEvent, joined?: boolean): Promise<string>;
    protected createHTML(events: MatrixEvent[], start: number): Promise<string>;
    export(): Promise<void>;
}
