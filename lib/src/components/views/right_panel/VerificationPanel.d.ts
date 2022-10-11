import React from "react";
import { ReciprocateQRCode } from "matrix-js-sdk/src/crypto/verification/QRCode";
import { Phase, VerificationRequest } from "matrix-js-sdk/src/crypto/verification/request/VerificationRequest";
import { RoomMember } from "matrix-js-sdk/src/models/room-member";
import { User } from "matrix-js-sdk/src/models/user";
import { SAS } from "matrix-js-sdk/src/crypto/verification/SAS";
interface IProps {
    layout: string;
    request: VerificationRequest;
    member: RoomMember | User;
    phase: Phase;
    onClose: () => void;
    isRoomEncrypted: boolean;
    inDialog: boolean;
}
interface IState {
    sasEvent?: SAS["sasEvent"];
    emojiButtonClicked?: boolean;
    reciprocateButtonClicked?: boolean;
    reciprocateQREvent?: ReciprocateQRCode["reciprocateQREvent"];
}
export default class VerificationPanel extends React.PureComponent<IProps, IState> {
    private hasVerifier;
    constructor(props: IProps);
    private renderQRPhase;
    private onReciprocateYesClick;
    private onReciprocateNoClick;
    private getDevice;
    private renderQRReciprocatePhase;
    private renderVerifiedPhase;
    private renderCancelledPhase;
    render(): JSX.Element;
    private startSAS;
    private onSasMatchesClick;
    private onSasMismatchesClick;
    private updateVerifierState;
    private onRequestChange;
    componentDidMount(): void;
    componentWillUnmount(): void;
}
export {};
