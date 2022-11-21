import { Dispatch, ReducerAction, ReducerState } from "react";
import type { AuthHeaderReducer } from "./AuthHeaderProvider";
interface AuthHeaderContextType {
    state: ReducerState<AuthHeaderReducer>;
    dispatch: Dispatch<ReducerAction<AuthHeaderReducer>>;
}
export declare const AuthHeaderContext: import("react").Context<AuthHeaderContextType>;
export {};
