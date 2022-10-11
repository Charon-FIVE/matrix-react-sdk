import React from 'react';
import { IKeyBackupInfo } from "matrix-js-sdk/src/crypto/keybackup";
interface IProps {
    onFinished: (success: boolean) => void;
}
interface IState {
    shouldLoadBackupStatus: boolean;
    loading: boolean;
    backupInfo: IKeyBackupInfo;
    error?: string;
}
export default class LogoutDialog extends React.Component<IProps, IState> {
    static defaultProps: {
        onFinished: () => void;
    };
    constructor(props: any);
    private loadBackupStatus;
    private onExportE2eKeysClicked;
    private onFinished;
    private onSetRecoveryMethodClick;
    private onLogoutConfirm;
    render(): JSX.Element;
}
export {};
