import React from 'react';
import { IKeyBackupInfo } from "matrix-js-sdk/src/crypto/keybackup";
import { TrustInfo } from "matrix-js-sdk/src/crypto/backup";
import { IDialogProps } from "../../../../components/views/dialogs/IDialogProps";
declare enum Phase {
    Loading = "loading",
    LoadError = "load_error",
    ChooseKeyPassphrase = "choose_key_passphrase",
    Migrate = "migrate",
    Passphrase = "passphrase",
    PassphraseConfirm = "passphrase_confirm",
    ShowKey = "show_key",
    Storing = "storing",
    ConfirmSkip = "confirm_skip"
}
interface IProps extends IDialogProps {
    hasCancel: boolean;
    accountPassword: string;
    forceReset: boolean;
}
interface IState {
    phase: Phase;
    passPhrase: string;
    passPhraseValid: boolean;
    passPhraseConfirm: string;
    copied: boolean;
    downloaded: boolean;
    setPassphrase: boolean;
    backupInfo: IKeyBackupInfo;
    backupSigStatus: TrustInfo;
    canUploadKeysWithPasswordOnly: boolean;
    accountPassword: string;
    accountPasswordCorrect: boolean;
    canSkip: boolean;
    passPhraseKeySelected: string;
    error?: string;
}
export default class CreateSecretStorageDialog extends React.PureComponent<IProps, IState> {
    static defaultProps: Partial<IProps>;
    private recoveryKey;
    private backupKey;
    private recoveryKeyNode;
    private passphraseField;
    constructor(props: IProps);
    componentWillUnmount(): void;
    private getInitialPhase;
    private fetchBackupInfo;
    private queryKeyUploadAuth;
    private onKeyBackupStatusChange;
    private onKeyPassphraseChange;
    private onChooseKeyPassphraseFormSubmit;
    private onMigrateFormSubmit;
    private onCopyClick;
    private onDownloadClick;
    private doBootstrapUIAuth;
    private bootstrapSecretStorage;
    private onCancel;
    private restoreBackup;
    private onLoadRetryClick;
    private onShowKeyContinueClick;
    private onCancelClick;
    private onGoBackClick;
    private onPassPhraseNextClick;
    private onPassPhraseConfirmNextClick;
    private onSetAgainClick;
    private onPassPhraseValidate;
    private onPassPhraseChange;
    private onPassPhraseConfirmChange;
    private onAccountPasswordChange;
    private renderOptionKey;
    private renderOptionPassphrase;
    private renderPhaseChooseKeyPassphrase;
    private renderPhaseMigrate;
    private renderPhasePassPhrase;
    private renderPhasePassPhraseConfirm;
    private renderPhaseShowKey;
    private renderBusyPhase;
    private renderPhaseLoadError;
    private renderPhaseSkipConfirm;
    private titleForPhase;
    render(): JSX.Element;
}
export {};
