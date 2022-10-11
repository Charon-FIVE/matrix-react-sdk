import React from 'react';
import { LoginFlow } from "../../../Login";
declare enum LoginView {
    Loading = 0,
    Password = 1,
    CAS = 2,
    SSO = 3,
    PasswordWithSocialSignOn = 4,
    Unsupported = 5
}
interface IProps {
    realQueryParams: {
        loginToken?: string;
    };
    fragmentAfterLogin?: string;
    onTokenLoginCompleted: () => void;
}
interface IState {
    loginView: LoginView;
    keyBackupNeeded: boolean;
    busy: boolean;
    password: string;
    errorText: string;
    flows: LoginFlow[];
}
export default class SoftLogout extends React.Component<IProps, IState> {
    constructor(props: IProps);
    componentDidMount(): void;
    private onClearAll;
    private initLogin;
    private onPasswordChange;
    private onForgotPassword;
    private onPasswordLogin;
    private trySsoLogin;
    private renderPasswordForm;
    private renderSsoForm;
    private renderSignInSection;
    render(): JSX.Element;
}
export {};
