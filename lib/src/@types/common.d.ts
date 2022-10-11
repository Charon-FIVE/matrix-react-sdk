import React, { JSXElementConstructor } from "react";
export declare type Without<T, U> = {
    [P in Exclude<keyof T, keyof U>]?: never;
};
export declare type XOR<T, U> = (T | U) extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
export declare type Writeable<T> = {
    -readonly [P in keyof T]: T[P];
};
export declare type ComponentClass = keyof JSX.IntrinsicElements | JSXElementConstructor<any>;
export declare type ReactAnyComponent = React.Component | React.ExoticComponent;
declare type Join<K, P> = K extends string | number ? P extends string | number ? `${K}${"" extends P ? "" : "."}${P}` : never : never;
declare type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, ...0[]];
export declare type Leaves<T, D extends number = 5> = [D] extends [never] ? never : T extends object ? {
    [K in keyof T]-?: Join<K, Leaves<T[K], Prev[D]>>;
}[keyof T] : "";
export declare type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[] : T[P] extends object ? RecursivePartial<T[P]> : T[P];
};
export declare type KeysWithObjectShape<Input> = {
    [P in keyof Input]: Input[P] extends object ? (Input[P] extends Array<unknown> ? never : P) : never;
}[keyof Input];
export {};
