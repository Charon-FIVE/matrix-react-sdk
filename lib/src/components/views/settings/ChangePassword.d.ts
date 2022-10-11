import React from 'react';
declare enum Phase {
    Edit = "edit",
    Uploading = "uploading",
    Error = "error"
}
interface IProps {
    onFinished?: (outcome: {
        didSetEmail?: boolean;
        /** Was one or more other devices logged out whilst changing the password */
        didLogoutOutOtherDevices: boolean;
    }) => void;
    onError?: (error: {
        error: string;
    }) => void;
    rowClassName?: string;
    buttonClassName?: string;
    buttonKind?: string;
    buttonLabel?: string;
    confirm?: boolean;
    autoFocusNewPasswordInput?: boolean;
    className?: string;
    shouldAskForEmail?: boolean;
}
interface IState {
    fieldValid: {};
    phase: Phase;
    oldPassword: string;
    newPassword: string;
    newPasswordConfirm: string;
}
export default class ChangePassword extends React.Component<IProps, IState> {
    static defaultProps: Partial<IProps>;
    constructor(props: IProps);
    private onChangePassword;
    private changePassword;
    private checkPassword;
    private optionallySetEmail;
    private onExportE2eKeysClicked;
    private markFieldValid;
    private onChangeOldPassword;
    private onOldPasswordValidate;
    private validateOldPasswordRules;
    private onChangeNewPassword;
    private onNewPasswordValidate;
    private onChangeNewPasswordConfirm;
    private onNewPasswordConfirmValidate;
    private validatePasswordConfirmRules;
    private onClickChange;
    private verifyFieldsBeforeSubmit;
    private allFieldsValid;
    private findFirstInvalidField;
    render(): JSX.Element;
}
export {};
