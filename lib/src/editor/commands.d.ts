import { IContent } from "matrix-js-sdk/src/models/event";
import EditorModel from "./model";
import { Command } from "../SlashCommands";
export declare function isSlashCommand(model: EditorModel): boolean;
export declare function getSlashCommand(model: EditorModel): [Command, string, string];
export declare function runSlashCommand(cmd: Command, args: string, roomId: string, threadId: string | null): Promise<[content: IContent | null, success: boolean]>;
export declare function shouldSendAnyway(commandText: string): Promise<boolean>;
