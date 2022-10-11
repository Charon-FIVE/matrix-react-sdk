interface IOpts {
    labels?: string[];
    userText?: string;
    sendLogs?: boolean;
    progressCallback?: (s: string) => void;
    customApp?: string;
    customFields?: Record<string, string>;
}
/**
 * Send a bug report.
 *
 * @param {string} bugReportEndpoint HTTP url to send the report to
 *
 * @param {object} opts optional dictionary of options
 *
 * @param {string} opts.userText Any additional user input.
 *
 * @param {boolean} opts.sendLogs True to send logs
 *
 * @param {function(string)} opts.progressCallback Callback to call with progress updates
 *
 * @return {Promise<string>} URL returned by the rageshake server
 */
export default function sendBugReport(bugReportEndpoint: string, opts?: IOpts): Promise<string>;
/**
 * Downloads the files from a bug report. This is the same as sendBugReport,
 * but instead causes the browser to download the files locally.
 *
 * @param {object} opts optional dictionary of options
 *
 * @param {string} opts.userText Any additional user input.
 *
 * @param {boolean} opts.sendLogs True to send logs
 *
 * @param {function(string)} opts.progressCallback Callback to call with progress updates
 *
 * @return {Promise} Resolved when the bug report is downloaded (or started).
 */
export declare function downloadBugReport(opts?: IOpts): Promise<void>;
export declare function submitFeedback(endpoint: string, label: string, comment: string, canContact?: boolean, extraData?: Record<string, string>): Promise<void>;
export {};
