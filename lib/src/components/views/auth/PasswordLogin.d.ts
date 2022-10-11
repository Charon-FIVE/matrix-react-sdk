import React from 'react';
import { ValidatedServerConfig } from '../../../utils/ValidatedServerConfig';
interface IProps {
    username: string;
    phoneCountry: string;
    phoneNumber: string;
    serverConfig: ValidatedServerConfig;
    loginIncorrect?: boolean;
    disableSubmit?: boolean;
    busy?: boolean;
    onSubmit(username: string, phoneCountry: void, phoneNumber: void, password: string): void;
    onSubmit(username: void, phoneCountry: string, phoneNumber: string, password: string): void;
    onUsernameChanged?(username: string): void;
    onUsernameBlur?(username: string): void;
    onPhoneCountryChanged?(phoneCountry: string): void;
    onPhoneNumberChanged?(phoneNumber: string): void;
    onForgotPasswordClick?(): void;
}
interface IState {
    fieldValid: Partial<Record<LoginField, boolean>>;
    loginType: LoginField.Email | LoginField.MatrixId | LoginField.Phone;
    password: "";
}
declare enum LoginField {
    Email = "login_field_email",
    MatrixId = "login_field_mxid",
    Phone = "login_field_phone",
    Password = "login_field_phone"
}
export default class PasswordLogin extends React.PureComponent<IProps, IState> {
    static defaultProps: {
        onUsernameChanged: () => void;
        onUsernameBlur: () => void;
        onPhoneCountryChanged: () => void;
        onPhoneNumberChanged: () => void;
        loginIncorrect: boolean;
        disableSubmit: boolean;
    };
    constructor(props: any);
    private onForgotPasswordClick;
    private onSubmitForm;
    private onUsernameChanged;
    private onUsernameBlur;
    private onLoginTypeChange;
    private onPhoneCountryChanged;
    private onPhoneNumberChanged;
    private onPasswordChanged;
    private verifyFieldsBeforeSubmit;
    private allFieldsValid;
    private findFirstInvalidField;
    private markFieldValid;
    private validateUsernameRules;
    private onUsernameValidate;
    private onEmailValidate;
    private validatePhoneNumberRules;
    private onPhoneNumberValidate;
    private validatePasswordRules;
    private onPasswordValidate;
    private renderLoginField;
    private isLoginEmpty;
    render(): JSX.Element;
}
export {};
