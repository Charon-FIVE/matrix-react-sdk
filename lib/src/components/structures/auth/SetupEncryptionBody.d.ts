import React from 'react';
import { IKeyBackupInfo } from "matrix-js-sdk/src/crypto/keybackup";
import { VerificationRequest } from "matrix-js-sdk/src/crypto/verification/request/VerificationRequest";
import { Phase } from '../../../stores/SetupEncryptionStore';
interface IProps {
    onFinished: () => void;
}
interface IState {
    phase: Phase;
    verificationRequest: VerificationRequest;
    backupInfo: IKeyBackupInfo;
    lostKeys: boolean;
}
export default class SetupEncryptionBody extends React.Component<IProps, IState> {
    constructor(props: any);
    private onStoreUpdate;
    componentWillUnmount(): void;
    private onUsePassphraseClick;
    private onVerifyClick;
    private onSkipConfirmClick;
    private onSkipBackClick;
    private onResetClick;
    private onResetConfirmClick;
    private onResetBackClick;
    private onDoneClick;
    private onEncryptionPanelClose;
    render(): JSX.Element;
}
export {};
