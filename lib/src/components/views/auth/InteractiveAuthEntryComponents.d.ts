import { MatrixClient } from "matrix-js-sdk/src/client";
import { AuthType, IAuthDict, IInputs, IStageStatus } from 'matrix-js-sdk/src/interactive-auth';
import React from 'react';
import { LocalisedPolicy, Policies } from '../../../Terms';
export declare const DEFAULT_PHASE = 0;
interface IAuthEntryProps {
    matrixClient: MatrixClient;
    loginType: string;
    authSessionId: string;
    errorText?: string;
    errorCode?: string;
    busy?: boolean;
    onPhaseChange: (phase: number) => void;
    submitAuthDict: (auth: IAuthDict) => void;
    requestEmailToken?: () => Promise<void>;
}
interface IPasswordAuthEntryState {
    password: string;
}
export declare class PasswordAuthEntry extends React.Component<IAuthEntryProps, IPasswordAuthEntryState> {
    static LOGIN_TYPE: AuthType;
    constructor(props: any);
    componentDidMount(): void;
    private onSubmit;
    private onPasswordFieldChange;
    render(): JSX.Element;
}
interface IRecaptchaAuthEntryProps extends IAuthEntryProps {
    stageParams?: {
        public_key?: string;
    };
}
export declare class RecaptchaAuthEntry extends React.Component<IRecaptchaAuthEntryProps> {
    static LOGIN_TYPE: AuthType;
    componentDidMount(): void;
    private onCaptchaResponse;
    render(): JSX.Element;
}
interface ITermsAuthEntryProps extends IAuthEntryProps {
    stageParams?: {
        policies?: Policies;
    };
    showContinue: boolean;
}
interface LocalisedPolicyWithId extends LocalisedPolicy {
    id: string;
}
interface ITermsAuthEntryState {
    policies: LocalisedPolicyWithId[];
    toggledPolicies: {
        [policy: string]: boolean;
    };
    errorText?: string;
}
export declare class TermsAuthEntry extends React.Component<ITermsAuthEntryProps, ITermsAuthEntryState> {
    static LOGIN_TYPE: AuthType;
    constructor(props: any);
    componentDidMount(): void;
    private togglePolicy;
    private trySubmit;
    render(): JSX.Element;
}
interface IEmailIdentityAuthEntryProps extends IAuthEntryProps {
    inputs?: {
        emailAddress?: string;
    };
    stageState?: {
        emailSid: string;
    };
}
interface IEmailIdentityAuthEntryState {
    requested: boolean;
    requesting: boolean;
}
export declare class EmailIdentityAuthEntry extends React.Component<IEmailIdentityAuthEntryProps, IEmailIdentityAuthEntryState> {
    static LOGIN_TYPE: AuthType;
    constructor(props: IEmailIdentityAuthEntryProps);
    componentDidMount(): void;
    render(): any;
}
interface IMsisdnAuthEntryProps extends IAuthEntryProps {
    inputs: {
        phoneCountry: string;
        phoneNumber: string;
    };
    clientSecret: string;
    fail: (error: Error) => void;
}
interface IMsisdnAuthEntryState {
    token: string;
    requestingToken: boolean;
    errorText: string;
}
export declare class MsisdnAuthEntry extends React.Component<IMsisdnAuthEntryProps, IMsisdnAuthEntryState> {
    static LOGIN_TYPE: AuthType;
    private submitUrl;
    private sid;
    private msisdn;
    constructor(props: any);
    componentDidMount(): void;
    private requestMsisdnToken;
    private onTokenChange;
    private onFormSubmit;
    render(): JSX.Element;
}
interface ISSOAuthEntryProps extends IAuthEntryProps {
    continueText?: string;
    continueKind?: string;
    onCancel?: () => void;
}
interface ISSOAuthEntryState {
    phase: number;
    attemptFailed: boolean;
}
export declare class SSOAuthEntry extends React.Component<ISSOAuthEntryProps, ISSOAuthEntryState> {
    static LOGIN_TYPE: AuthType;
    static UNSTABLE_LOGIN_TYPE: AuthType;
    static PHASE_PREAUTH: number;
    static PHASE_POSTAUTH: number;
    private ssoUrl;
    private popupWindow;
    constructor(props: any);
    componentDidMount(): void;
    componentWillUnmount(): void;
    attemptFailed: () => void;
    private onReceiveMessage;
    private onStartAuthClick;
    private onConfirmClick;
    render(): JSX.Element;
}
export declare class FallbackAuthEntry extends React.Component<IAuthEntryProps> {
    private popupWindow;
    private fallbackButton;
    constructor(props: any);
    componentDidMount(): void;
    componentWillUnmount(): void;
    focus: () => void;
    private onShowFallbackClick;
    private onReceiveMessage;
    render(): JSX.Element;
}
export interface IStageComponentProps extends IAuthEntryProps {
    clientSecret?: string;
    stageParams?: Record<string, any>;
    inputs?: IInputs;
    stageState?: IStageStatus;
    showContinue?: boolean;
    continueText?: string;
    continueKind?: string;
    fail?(e: Error): void;
    setEmailSid?(sid: string): void;
    onCancel?(): void;
    requestEmailToken?(): Promise<void>;
}
export interface IStageComponent extends React.ComponentClass<React.PropsWithRef<IStageComponentProps>> {
    attemptFailed?(): void;
    focus?(): void;
}
export default function getEntryComponentForLoginType(loginType: AuthType): IStageComponent;
export {};
