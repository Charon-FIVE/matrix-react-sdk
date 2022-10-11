import { AuthType, IAuthData, IInputs, IStageStatus } from "matrix-js-sdk/src/interactive-auth";
import { MatrixClient } from "matrix-js-sdk/src/client";
import React from 'react';
export declare const ERROR_USER_CANCELLED: Error;
declare type InteractiveAuthCallbackSuccess = (success: true, response: IAuthData, extra?: {
    emailSid?: string;
    clientSecret?: string;
}) => void;
declare type InteractiveAuthCallbackFailure = (success: false, response: IAuthData | Error) => void;
export declare type InteractiveAuthCallback = InteractiveAuthCallbackSuccess & InteractiveAuthCallbackFailure;
interface IProps {
    matrixClient: MatrixClient;
    authData?: IAuthData;
    inputs?: IInputs;
    sessionId?: string;
    clientSecret?: string;
    emailSid?: string;
    poll?: boolean;
    continueIsManaged?: boolean;
    continueText?: string;
    continueKind?: string;
    makeRequest(auth: IAuthData): Promise<IAuthData>;
    onAuthFinished: InteractiveAuthCallback;
    requestEmailToken?(email: string, secret: string, attempt: number, session: string): Promise<{
        sid: string;
    }>;
    onStagePhaseChange?(stage: string, phase: string | number): void;
}
interface IState {
    authStage?: AuthType;
    stageState?: IStageStatus;
    busy: boolean;
    errorText?: string;
    errorCode?: string;
    submitButtonEnabled: boolean;
}
export default class InteractiveAuthComponent extends React.Component<IProps, IState> {
    private readonly authLogic;
    private readonly intervalId;
    private readonly stageComponent;
    private unmounted;
    constructor(props: any);
    UNSAFE_componentWillMount(): void;
    componentWillUnmount(): void;
    private requestEmailToken;
    private authStateUpdated;
    private requestCallback;
    private onBusyChanged;
    private setFocus;
    private submitAuthDict;
    private onPhaseChange;
    private onStageCancel;
    private onAuthStageFailed;
    private setEmailSid;
    render(): JSX.Element;
}
export {};
