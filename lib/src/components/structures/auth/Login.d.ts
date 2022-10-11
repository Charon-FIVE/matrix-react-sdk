import React, { ReactNode } from 'react';
import { LoginFlow } from '../../../Login';
import { IMatrixClientCreds } from "../../../MatrixClientPeg";
import { ValidatedServerConfig } from '../../../utils/ValidatedServerConfig';
interface IProps {
    serverConfig: ValidatedServerConfig;
    busy?: boolean;
    isSyncing?: boolean;
    fallbackHsUrl?: string;
    defaultDeviceDisplayName?: string;
    fragmentAfterLogin?: string;
    defaultUsername?: string;
    onLoggedIn(data: IMatrixClientCreds, password: string): void;
    onRegisterClick(): void;
    onForgotPasswordClick?(): void;
    onServerConfigChange(config: ValidatedServerConfig): void;
}
interface IState {
    busy: boolean;
    busyLoggingIn?: boolean;
    errorText?: ReactNode;
    loginIncorrect: boolean;
    canTryLogin: boolean;
    flows?: LoginFlow[];
    username: string;
    phoneCountry?: string;
    phoneNumber: string;
    serverIsAlive: boolean;
    serverErrorIsFatal: boolean;
    serverDeadError?: ReactNode;
}
export default class LoginComponent extends React.PureComponent<IProps, IState> {
    private unmounted;
    private loginLogic;
    private readonly stepRendererMap;
    constructor(props: any);
    UNSAFE_componentWillMount(): void;
    componentWillUnmount(): void;
    UNSAFE_componentWillReceiveProps(newProps: any): void;
    isBusy: () => boolean;
    onPasswordLogin: (username: any, phoneCountry: any, phoneNumber: any, password: any) => Promise<void>;
    onUsernameChanged: (username: any) => void;
    onUsernameBlur: (username: any) => Promise<void>;
    onPhoneCountryChanged: (phoneCountry: any) => void;
    onPhoneNumberChanged: (phoneNumber: any) => void;
    onRegisterClick: (ev: any) => void;
    onTryRegisterClick: (ev: any) => void;
    private initLoginLogic;
    private isSupportedFlow;
    private errorTextFromError;
    renderLoginComponentForFlows(): JSX.Element;
    private renderPasswordStep;
    private renderSsoStep;
    render(): JSX.Element;
}
export {};
