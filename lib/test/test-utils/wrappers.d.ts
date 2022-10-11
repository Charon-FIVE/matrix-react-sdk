import { RefCallback, ComponentType } from "react";
declare type WrapperProps<T> = {
    wrappedRef?: RefCallback<ComponentType<T>>;
} & T;
export declare function wrapInMatrixClientContext<T>(WrappedComponent: ComponentType<T>): ComponentType<WrapperProps<T>>;
export {};
