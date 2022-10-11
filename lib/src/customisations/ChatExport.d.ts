import { ExportFormat, ExportType } from "../utils/exportUtils/exportUtils";
export declare type ForceChatExportParameters = {
    format?: ExportFormat;
    range?: ExportType;
    numberOfMessages?: number;
    includeAttachments?: boolean;
    sizeMb?: number;
};
/**
 * Force parameters in room chat export
 * fields returned here are forced
 * and not allowed to be edited in the chat export form
 */
declare const getForceChatExportParameters: () => ForceChatExportParameters;
export interface IChatExportCustomisations {
    getForceChatExportParameters?: typeof getForceChatExportParameters;
}
declare const _default: IChatExportCustomisations;
export default _default;
