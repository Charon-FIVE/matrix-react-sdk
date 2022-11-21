import { ComponentProps, PropsWithChildren, Reducer } from "react";
import { AuthHeaderModifier } from "./AuthHeaderModifier";
export declare enum AuthHeaderActionType {
    Add = 0,
    Remove = 1
}
interface AuthHeaderAction {
    type: AuthHeaderActionType;
    value: ComponentProps<typeof AuthHeaderModifier>;
}
export declare type AuthHeaderReducer = Reducer<ComponentProps<typeof AuthHeaderModifier>[], AuthHeaderAction>;
export declare function AuthHeaderProvider({ children }: PropsWithChildren<{}>): JSX.Element;
export {};
