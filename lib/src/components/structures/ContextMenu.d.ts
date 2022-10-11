import React, { RefObject, SyntheticEvent } from "react";
export interface IPosition {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    rightAligned?: boolean;
    bottomAligned?: boolean;
}
export declare enum ChevronFace {
    Top = "top",
    Bottom = "bottom",
    Left = "left",
    Right = "right",
    None = "none"
}
export interface IProps extends IPosition {
    menuWidth?: number;
    menuHeight?: number;
    chevronOffset?: number;
    chevronFace?: ChevronFace;
    menuPaddingTop?: number;
    menuPaddingBottom?: number;
    menuPaddingLeft?: number;
    menuPaddingRight?: number;
    zIndex?: number;
    hasBackground?: boolean;
    managed?: boolean;
    wrapperClassName?: string;
    menuClassName?: string;
    mountAsChild?: boolean;
    focusLock?: boolean;
    onFinished(): any;
    windowResize?(): any;
}
interface IState {
    contextMenuElem: HTMLDivElement;
}
export default class ContextMenu extends React.PureComponent<IProps, IState> {
    private readonly initialFocus;
    static defaultProps: {
        hasBackground: boolean;
        managed: boolean;
    };
    constructor(props: any, context: any);
    componentWillUnmount(): void;
    private collectContextMenuRect;
    private onContextMenu;
    private onContextMenuPreventBubbling;
    private onFinished;
    private onClick;
    private onKeyDown;
    protected renderMenu(hasBackground?: boolean): JSX.Element;
    render(): React.ReactChild;
}
export declare type ToRightOf = {
    left: number;
    top: number;
    chevronOffset: number;
};
export declare const toRightOf: (elementRect: Pick<DOMRect, "right" | "top" | "height">, chevronOffset?: number) => ToRightOf;
export declare type AboveLeftOf = IPosition & {
    chevronFace: ChevronFace;
};
export declare const aboveLeftOf: (elementRect: Pick<DOMRect, "right" | "top" | "bottom">, chevronFace?: ChevronFace, vPadding?: number) => AboveLeftOf;
export declare const aboveRightOf: (elementRect: Pick<DOMRect, "left" | "top" | "bottom">, chevronFace?: ChevronFace, vPadding?: number) => AboveLeftOf;
export declare const alwaysAboveLeftOf: (elementRect: Pick<DOMRect, "right" | "bottom" | "top">, chevronFace?: ChevronFace, vPadding?: number) => IPosition & {
    chevronFace: ChevronFace;
};
export declare const alwaysAboveRightOf: (elementRect: Pick<DOMRect, "left" | "top">, chevronFace?: ChevronFace, vPadding?: number) => IPosition & {
    chevronFace: ChevronFace;
};
declare type ContextMenuTuple<T> = [
    boolean,
    RefObject<T>,
    (ev?: SyntheticEvent) => void,
    (ev?: SyntheticEvent) => void,
    (val: boolean) => void
];
export declare const useContextMenu: <T extends unknown = HTMLElement>() => ContextMenuTuple<T>;
export declare function createMenu(ElementClass: any, props: any): {
    close: (...args: any[]) => void;
};
export { ContextMenuButton } from "../../accessibility/context_menu/ContextMenuButton";
export { ContextMenuTooltipButton } from "../../accessibility/context_menu/ContextMenuTooltipButton";
export { MenuItem } from "../../accessibility/context_menu/MenuItem";
export { MenuItemCheckbox } from "../../accessibility/context_menu/MenuItemCheckbox";
export { MenuItemRadio } from "../../accessibility/context_menu/MenuItemRadio";
export { StyledMenuItemCheckbox } from "../../accessibility/context_menu/StyledMenuItemCheckbox";
export { StyledMenuItemRadio } from "../../accessibility/context_menu/StyledMenuItemRadio";
