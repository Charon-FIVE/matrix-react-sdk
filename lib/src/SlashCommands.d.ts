import { IContent } from 'matrix-js-sdk/src/models/event';
import { SlashCommand as SlashCommandEvent } from "@matrix-org/analytics-events/types/typescript/SlashCommand";
import { ITranslatableError } from './languageHandler';
import { TimelineRenderingType } from './contexts/RoomContext';
import { XOR } from "./@types/common";
export declare const CommandCategories: {
    messages: string;
    actions: string;
    admin: string;
    advanced: string;
    effects: string;
    other: string;
};
export declare type RunResult = XOR<{
    error: Error | ITranslatableError;
}, {
    promise: Promise<IContent | undefined>;
}>;
declare type RunFn = ((roomId: string, args: string, cmd: string) => RunResult);
interface ICommandOpts {
    command: string;
    aliases?: string[];
    args?: string;
    description: string;
    analyticsName?: SlashCommandEvent["command"];
    runFn?: RunFn;
    category: string;
    hideCompletionAfterSpace?: boolean;
    isEnabled?(): boolean;
    renderingTypes?: TimelineRenderingType[];
}
export declare class Command {
    readonly command: string;
    readonly aliases: string[];
    readonly args: undefined | string;
    readonly description: string;
    readonly runFn: undefined | RunFn;
    readonly category: string;
    readonly hideCompletionAfterSpace: boolean;
    readonly renderingTypes?: TimelineRenderingType[];
    readonly analyticsName?: SlashCommandEvent["command"];
    private readonly _isEnabled?;
    constructor(opts: ICommandOpts);
    getCommand(): string;
    getCommandWithArgs(): string;
    run(roomId: string, threadId: string, args: string): RunResult;
    getUsage(): string;
    isEnabled(): boolean;
}
export declare const Commands: Command[];
export declare const CommandMap: Map<string, Command>;
export declare function parseCommandString(input: string): {
    cmd?: string;
    args?: string;
};
interface ICmd {
    cmd?: Command;
    args?: string;
}
/**
 * Process the given text for /commands and returns a parsed command that can be used for running the operation.
 * @param {string} input The raw text input by the user.
 * @return {ICmd} The parsed command object.
 * Returns an empty object if the input didn't match a command.
 */
export declare function getCommand(input: string): ICmd;
export {};
