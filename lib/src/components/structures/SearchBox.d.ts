import React, { HTMLProps } from 'react';
interface IProps extends HTMLProps<HTMLInputElement> {
    onSearch?: (query: string) => void;
    onCleared?: (source?: string) => void;
    onKeyDown?: (ev: React.KeyboardEvent) => void;
    onFocus?: (ev: React.FocusEvent) => void;
    onBlur?: (ev: React.FocusEvent) => void;
    className?: string;
    placeholder: string;
    blurredPlaceholder?: string;
    autoFocus?: boolean;
    initialValue?: string;
    collapsed?: boolean;
}
interface IState {
    searchTerm: string;
    blurred: boolean;
}
export default class SearchBox extends React.Component<IProps, IState> {
    private search;
    constructor(props: IProps);
    private onChange;
    private onSearch;
    private onKeyDown;
    private onFocus;
    private onBlur;
    private clearSearch;
    render(): JSX.Element;
}
export {};
