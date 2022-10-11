import React from 'react';
interface IProps extends React.InputHTMLAttributes<HTMLInputElement> {
    inputRef?: React.RefObject<HTMLInputElement>;
    outlined?: boolean;
    childrenInLabel?: boolean;
}
interface IState {
}
export default class StyledRadioButton extends React.PureComponent<IProps, IState> {
    static readonly defaultProps: {
        className: string;
        childrenInLabel: boolean;
    };
    render(): JSX.Element;
}
export {};
