import React, { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, RefObject } from 'react';
import { IFieldState, IValidationResult } from "./Validation";
export interface IValidateOpts {
    focused?: boolean;
    allowEmpty?: boolean;
}
interface IProps {
    id?: string;
    type?: string;
    list?: string;
    label?: string;
    placeholder?: string;
    usePlaceholderAsHint?: boolean;
    prefixComponent?: React.ReactNode;
    postfixComponent?: React.ReactNode;
    onValidate?: (input: IFieldState) => Promise<IValidationResult>;
    forceValidity?: boolean;
    tooltipContent?: React.ReactNode;
    forceTooltipVisible?: boolean;
    tooltipClassName?: string;
    className?: string;
    validateOnFocus?: boolean;
    validateOnBlur?: boolean;
    validateOnChange?: boolean;
}
export interface IInputProps extends IProps, InputHTMLAttributes<HTMLInputElement> {
    inputRef?: RefObject<HTMLInputElement>;
    element?: "input";
    value: string;
}
interface ISelectProps extends IProps, SelectHTMLAttributes<HTMLSelectElement> {
    inputRef?: RefObject<HTMLSelectElement>;
    element: "select";
    value: string;
}
interface ITextareaProps extends IProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
    inputRef?: RefObject<HTMLTextAreaElement>;
    element: "textarea";
    value: string;
}
export interface INativeOnChangeInputProps extends IProps, InputHTMLAttributes<HTMLInputElement> {
    inputRef?: RefObject<HTMLInputElement>;
    element: "input";
    value: string;
}
declare type PropShapes = IInputProps | ISelectProps | ITextareaProps | INativeOnChangeInputProps;
interface IState {
    valid: boolean;
    feedback: React.ReactNode;
    feedbackVisible: boolean;
    focused: boolean;
}
export default class Field extends React.PureComponent<PropShapes, IState> {
    private id;
    private inputRef;
    static readonly defaultProps: {
        element: string;
        type: string;
        validateOnFocus: boolean;
        validateOnBlur: boolean;
        validateOnChange: boolean;
    };
    private validateOnChange;
    constructor(props: any);
    focus(): void;
    private onFocus;
    private onChange;
    private onBlur;
    validate({ focused, allowEmpty }: IValidateOpts): Promise<boolean>;
    render(): JSX.Element;
}
export {};
