import { IConfigOptions } from "./IConfigOptions";
export declare function sendSentryReport(userText: string, issueUrl: string, error: Error): Promise<void>;
export declare function setSentryUser(mxid: string): void;
export declare function initSentry(sentryConfig: IConfigOptions["sentry"]): Promise<void>;
