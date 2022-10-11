import React from "react";
import { IKeyBackupInfo } from "matrix-js-sdk/src/crypto/keybackup";
import { IDialogProps } from "../../../../components/views/dialogs/IDialogProps";
interface IProps extends IDialogProps {
    newVersionInfo: IKeyBackupInfo;
}
export default class NewRecoveryMethodDialog extends React.PureComponent<IProps> {
    private onOkClick;
    private onGoToSettingsClick;
    private onSetupClick;
    render(): JSX.Element;
}
export {};
