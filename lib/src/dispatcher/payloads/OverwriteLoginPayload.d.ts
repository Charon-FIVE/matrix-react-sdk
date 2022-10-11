import { ActionPayload } from "../payloads";
import { Action } from "../actions";
import { IMatrixClientCreds } from "../../MatrixClientPeg";
export interface OverwriteLoginPayload extends ActionPayload {
    action: Action.OverwriteLogin;
    credentials: IMatrixClientCreds;
}
