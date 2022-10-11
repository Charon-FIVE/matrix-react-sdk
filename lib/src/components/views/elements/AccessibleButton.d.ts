import React, { HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
export declare type ButtonEvent = React.MouseEvent<Element> | React.KeyboardEvent<Element> | React.FormEvent<Element>;
declare type AccessibleButtonKind = 'primary' | 'primary_outline' | 'primary_sm' | 'secondary' | 'danger' | 'danger_outline' | 'danger_sm' | 'link' | 'link_inline' | 'link_sm' | 'confirm_sm' | 'cancel_sm' | 'icon';
/**
 * This type construct allows us to specifically pass those props down to the element we’re creating that the element
 * actually supports.
 *
 * e.g., if element is set to "a", we’ll support href and target, if it’s set to "input", we support type.
 *
 * To remain compatible with existing code, we’ll continue to support InputHTMLAttributes<Element>
 */
declare type DynamicHtmlElementProps<T extends keyof JSX.IntrinsicElements> = JSX.IntrinsicElements[T] extends HTMLAttributes<{}> ? DynamicElementProps<T> : DynamicElementProps<"div">;
declare type DynamicElementProps<T extends keyof JSX.IntrinsicElements> = Partial<Omit<JSX.IntrinsicElements[T], 'ref' | 'onClick' | 'onMouseDown' | 'onKeyUp' | 'onKeyDown'>> & Omit<InputHTMLAttributes<Element>, 'onClick'>;
/**
 * children: React's magic prop. Represents all children given to the element.
 * element:  (optional) The base element type. "div" by default.
 * onClick:  (required) Event handler for button activation. Should be
 *           implemented exactly like a normal onClick handler.
 */
declare type IProps<T extends keyof JSX.IntrinsicElements> = DynamicHtmlElementProps<T> & {
    inputRef?: React.Ref<Element>;
    element?: T;
    children?: ReactNode | undefined;
    kind?: AccessibleButtonKind | string;
    role?: string;
    tabIndex?: number;
    disabled?: boolean;
    className?: string;
    triggerOnMouseDown?: boolean;
    onClick(e?: ButtonEvent): void | Promise<void>;
};
interface IAccessibleButtonProps extends React.InputHTMLAttributes<Element> {
    ref?: React.Ref<Element>;
}
/**
 * AccessibleButton is a generic wrapper for any element that should be treated
 * as a button.  Identifies the element as a button, setting proper tab
 * indexing and keyboard activation behavior.
 *
 * @param {Object} props  react element properties
 * @returns {Object} rendered react
 */
declare function AccessibleButton<T extends keyof JSX.IntrinsicElements>({ element, onClick, children, kind, disabled, inputRef, className, onKeyDown, onKeyUp, triggerOnMouseDown, ...restProps }: IProps<T>): React.DOMElement<IAccessibleButtonProps, Element>;
declare namespace AccessibleButton {
    var defaultProps: {
        element: keyof React.ReactHTML;
        role: string;
        tabIndex: number;
    };
    var displayName: string;
}
export default AccessibleButton;
