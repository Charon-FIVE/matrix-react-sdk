import { AsyncStoreWithClient } from './AsyncStoreWithClient';
import { ActionPayload } from '../dispatcher/payloads';
interface IState {
    reportedSessionIds: Set<string>;
    lastRageshakeTime: number;
    initialSyncCompleted: boolean;
}
/**
 * Watches for decryption errors to auto-report if the relevant lab is
 * enabled, and keeps track of session IDs that have already been
 * reported.
 */
export default class AutoRageshakeStore extends AsyncStoreWithClient<IState> {
    private static readonly internalInstance;
    private constructor();
    static get instance(): AutoRageshakeStore;
    protected onAction(payload: ActionPayload): Promise<void>;
    protected onReady(): Promise<void>;
    protected onNotReady(): Promise<void>;
    private onDecryptionAttempt;
    private onSyncStateChange;
    private onDeviceMessage;
    private onReportKeyBackupNotEnabled;
}
export {};
