import React from "react";
export declare enum CheckboxStyle {
    Solid = "solid",
    Outline = "outline"
}
interface IProps extends React.InputHTMLAttributes<HTMLInputElement> {
    inputRef?: React.RefObject<HTMLInputElement>;
    kind?: CheckboxStyle;
    id?: string;
}
interface IState {
}
export default class StyledCheckbox extends React.PureComponent<IProps, IState> {
    private id;
    static readonly defaultProps: {
        className: string;
    };
    constructor(props: IProps);
    render(): JSX.Element;
}
export {};
