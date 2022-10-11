import React from 'react';
import { ValidatedServerConfig } from '../../../utils/ValidatedServerConfig';
declare enum Phase {
    Forgot = 1,
    SendingEmail = 2,
    EmailSent = 3,
    Done = 4
}
interface IProps {
    serverConfig: ValidatedServerConfig;
    onServerConfigChange: (serverConfig: ValidatedServerConfig) => void;
    onLoginClick?: () => void;
    onComplete: () => void;
}
interface IState {
    phase: Phase;
    email: string;
    password: string;
    password2: string;
    errorText: string;
    serverIsAlive: boolean;
    serverErrorIsFatal: boolean;
    serverDeadError: string;
    currentHttpRequest?: Promise<any>;
    serverSupportsControlOfDevicesLogout: boolean;
    logoutDevices: boolean;
}
export default class ForgotPassword extends React.Component<IProps, IState> {
    private reset;
    state: IState;
    componentDidMount(): void;
    UNSAFE_componentWillReceiveProps(newProps: IProps): void;
    private checkServerLiveliness;
    private checkServerCapabilities;
    submitPasswordReset(email: string, password: string, logoutDevices?: boolean): void;
    private onVerify;
    private onSubmitForm;
    private verifyFieldsBeforeSubmit;
    private onInputChanged;
    private onLoginClick;
    showErrorDialog(description: string, title?: string): void;
    private handleHttpRequest;
    renderForgot(): JSX.Element;
    renderSendingEmail(): JSX.Element;
    renderEmailSent(): JSX.Element;
    renderDone(): JSX.Element;
    render(): JSX.Element;
}
export {};
