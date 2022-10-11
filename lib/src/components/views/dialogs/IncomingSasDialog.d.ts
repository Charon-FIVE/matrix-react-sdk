import React from 'react';
import { IGeneratedSas, SasEvent } from "matrix-js-sdk/src/crypto/verification/SAS";
import { VerificationBase } from "matrix-js-sdk/src/crypto/verification/Base";
import { IDialogProps } from "./IDialogProps";
interface IProps extends IDialogProps {
    verifier: VerificationBase<SasEvent, any>;
}
interface IState {
    phase: number;
    sasVerified: boolean;
    opponentProfile: {
        avatar_url?: string;
        displayname?: string;
    };
    opponentProfileError: Error;
    sas: IGeneratedSas;
}
export default class IncomingSasDialog extends React.Component<IProps, IState> {
    private showSasEvent;
    constructor(props: IProps);
    componentWillUnmount(): void;
    private fetchOpponentProfile;
    private onFinished;
    private onCancelClick;
    private onContinueClick;
    private onVerifierShowSas;
    private onVerifierCancel;
    private onSasMatchesClick;
    private onVerifiedDoneClick;
    private renderPhaseStart;
    private renderPhaseShowSas;
    private renderPhaseWaitForPartnerToConfirm;
    private renderPhaseVerified;
    private renderPhaseCancelled;
    render(): JSX.Element;
}
export {};
