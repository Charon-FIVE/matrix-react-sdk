export default class DeviceListener {
    private dispatcherRef;
    private dismissed;
    private dismissedThisDeviceToast;
    private keyBackupInfo;
    private keyBackupFetchedAt;
    private keyBackupStatusChecked;
    private ourDeviceIdsAtStart;
    private displayingToastsForDeviceIds;
    private running;
    static sharedInstance(): DeviceListener;
    start(): void;
    stop(): void;
    /**
     * Dismiss notifications about our own unverified devices
     *
     * @param {String[]} deviceIds List of device IDs to dismiss notifications for
     */
    dismissUnverifiedSessions(deviceIds: Iterable<string>): Promise<void>;
    dismissEncryptionSetup(): void;
    private ensureDeviceIdsAtStartPopulated;
    private onWillUpdateDevices;
    private onDevicesUpdated;
    private onDeviceVerificationChanged;
    private onUserTrustStatusChanged;
    private onCrossSingingKeysChanged;
    private onAccountData;
    private onSync;
    private onRoomStateEvents;
    private onAction;
    private getKeyBackupInfo;
    private shouldShowSetupEncryptionToast;
    private recheck;
    private checkKeyBackupStatus;
}
