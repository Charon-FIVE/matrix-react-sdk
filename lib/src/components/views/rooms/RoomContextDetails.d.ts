import { Room } from "matrix-js-sdk/src/matrix";
import { ComponentPropsWithoutRef, ElementType } from "react";
declare type Props<T extends ElementType> = ComponentPropsWithoutRef<T> & {
    component?: T;
    room: Room;
};
export declare function RoomContextDetails<T extends ElementType>({ room, component: Component, ...other }: Props<T>): JSX.Element;
export {};
