import { Dispatcher } from "flux";
import { ActionPayload } from "../dispatcher/payloads";
export declare const useDispatcher: (dispatcher: Dispatcher<ActionPayload>, handler: (payload: ActionPayload) => void) => void;
