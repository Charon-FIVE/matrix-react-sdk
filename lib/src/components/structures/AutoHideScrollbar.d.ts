import React, { HTMLAttributes, WheelEvent } from "react";
declare type DynamicHtmlElementProps<T extends keyof JSX.IntrinsicElements> = JSX.IntrinsicElements[T] extends HTMLAttributes<{}> ? DynamicElementProps<T> : DynamicElementProps<"div">;
declare type DynamicElementProps<T extends keyof JSX.IntrinsicElements> = Partial<Omit<JSX.IntrinsicElements[T], 'ref'>>;
export declare type IProps<T extends keyof JSX.IntrinsicElements> = DynamicHtmlElementProps<T> & {
    element?: T;
    className?: string;
    onScroll?: (event: Event) => void;
    onWheel?: (event: WheelEvent) => void;
    style?: React.CSSProperties;
    tabIndex?: number;
    wrappedRef?: (ref: HTMLDivElement) => void;
};
export default class AutoHideScrollbar<T extends keyof JSX.IntrinsicElements> extends React.Component<IProps<T>> {
    static defaultProps: {
        element: keyof React.ReactHTML;
    };
    readonly containerRef: React.RefObject<HTMLDivElement>;
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): React.DOMElement<Omit<Readonly<IProps<T>> & Readonly<{
        children?: React.ReactNode;
    }>, "className" | "children" | "tabIndex" | "element" | "onScroll" | "wrappedRef"> & {
        ref: React.RefObject<HTMLDivElement>;
        className: string;
        tabIndex: number | IProps<T>["tabIndex"];
    }, HTMLDivElement>;
}
export {};
