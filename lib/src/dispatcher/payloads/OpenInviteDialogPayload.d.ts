import { Optional } from "matrix-events-sdk";
import { MatrixCall } from "matrix-js-sdk/src/webrtc/call";
import { ActionPayload } from "../payloads";
import { Action } from "../actions";
import { AnyInviteKind } from "../../components/views/dialogs/InviteDialogTypes";
export interface OpenInviteDialogPayload extends ActionPayload {
    action: Action.OpenInviteDialog;
    kind: AnyInviteKind;
    onFinishedCallback: Optional<(results: boolean[]) => void>;
    call?: MatrixCall;
    roomId?: string;
    analyticsName: string;
    className: string;
}
