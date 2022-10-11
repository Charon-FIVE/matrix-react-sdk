import React, { ReactNode } from 'react';
import { MatrixClient } from "matrix-js-sdk/src/client";
import { IMatrixClientCreds } from "../../../MatrixClientPeg";
import { ISSOFlow } from "../../../Login";
import { ValidatedServerConfig } from '../../../utils/ValidatedServerConfig';
interface IProps {
    serverConfig: ValidatedServerConfig;
    defaultDeviceDisplayName: string;
    email?: string;
    brand?: string;
    clientSecret?: string;
    sessionId?: string;
    idSid?: string;
    fragmentAfterLogin?: string;
    onLoggedIn(params: IMatrixClientCreds, password: string): void;
    makeRegistrationUrl(params: {
        client_secret: string;
        hs_url: string;
        is_url?: string;
        session_id: string;
    }): string;
    onLoginClick(): void;
    onServerConfigChange(config: ValidatedServerConfig): void;
}
interface IState {
    busy: boolean;
    errorText?: ReactNode;
    formVals: Record<string, string>;
    doingUIAuth: boolean;
    completedNoSignin: boolean;
    flows: {
        stages: string[];
    }[];
    serverIsAlive: boolean;
    serverErrorIsFatal: boolean;
    serverDeadError?: ReactNode;
    matrixClient?: MatrixClient;
    registeredUsername?: string;
    differentLoggedInUserId?: string;
    ssoFlow?: ISSOFlow;
}
export default class Registration extends React.Component<IProps, IState> {
    private readonly loginLogic;
    private latestServerConfig;
    constructor(props: any);
    componentDidMount(): void;
    componentWillUnmount(): void;
    private unloadCallback;
    UNSAFE_componentWillReceiveProps(newProps: any): void;
    private replaceClient;
    private onFormSubmit;
    private requestEmailToken;
    private onUIAuthFinished;
    private setupPushers;
    private onLoginClick;
    private onGoToFormClicked;
    private makeRegisterRequest;
    private getUIAuthInputs;
    private onLoginClickWithCheck;
    private renderRegisterComponent;
    render(): JSX.Element;
}
export {};
