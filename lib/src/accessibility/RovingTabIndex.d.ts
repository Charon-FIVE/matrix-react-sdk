import React, { Dispatch, RefObject } from "react";
import { FocusHandler, Ref } from "./roving/types";
/**
 * Module to simplify implementing the Roving TabIndex accessibility technique
 *
 * Wrap the Widget in an RovingTabIndexContextProvider
 * and then for all buttons make use of useRovingTabIndex or RovingTabIndexWrapper.
 * The code will keep track of which tabIndex was most recently focused and expose that information as `isActive` which
 * can then be used to only set the tabIndex to 0 as expected by the roving tabindex technique.
 * When the active button gets unmounted the closest button will be chosen as expected.
 * Initially the first button to mount will be given active state.
 *
 * https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets#Technique_1_Roving_tabindex
 */
export declare function checkInputableElement(el: HTMLElement): boolean;
export interface IState {
    activeRef: Ref;
    refs: Ref[];
}
interface IContext {
    state: IState;
    dispatch: Dispatch<IAction>;
}
export declare const RovingTabIndexContext: React.Context<IContext>;
export declare enum Type {
    Register = "REGISTER",
    Unregister = "UNREGISTER",
    SetFocus = "SET_FOCUS"
}
interface IAction {
    type: Type;
    payload: {
        ref: Ref;
    };
}
export declare const reducer: (state: IState, action: IAction) => IState;
interface IProps {
    handleHomeEnd?: boolean;
    handleUpDown?: boolean;
    handleLeftRight?: boolean;
    children(renderProps: {
        onKeyDownHandler(ev: React.KeyboardEvent): any;
    }): any;
    onKeyDown?(ev: React.KeyboardEvent, state: IState): any;
}
export declare const findSiblingElement: (refs: RefObject<HTMLElement>[], startIndex: number, backwards?: boolean) => RefObject<HTMLElement>;
export declare const RovingTabIndexProvider: React.FC<IProps>;
export declare const useRovingTabIndex: <T extends HTMLElement>(inputRef?: React.RefObject<T>) => [FocusHandler, boolean, React.RefObject<T>];
export { RovingTabIndexWrapper } from "./roving/RovingTabIndexWrapper";
export { RovingAccessibleButton } from "./roving/RovingAccessibleButton";
export { RovingAccessibleTooltipButton } from "./roving/RovingAccessibleTooltipButton";
