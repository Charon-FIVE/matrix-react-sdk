import React, { ReactElement, ReactNode } from 'react';
export interface DropdownProps {
    id: string;
    label: string;
    value?: string;
    className?: string;
    children: ReactElement[];
    disabled?: boolean;
    menuWidth?: number;
    searchEnabled?: boolean;
    placeholder?: string;
    onOptionChange(dropdownKey: string): void;
    onSearchChange?(query: string): void;
    getShortOption?(value: string): ReactNode;
}
interface IState {
    expanded: boolean;
    highlightedOption: string | null;
    searchQuery: string;
}
export default class Dropdown extends React.Component<DropdownProps, IState> {
    private readonly buttonRef;
    private dropdownRootElement;
    private ignoreEvent;
    private childrenByKey;
    constructor(props: DropdownProps);
    componentWillUnmount(): void;
    UNSAFE_componentWillReceiveProps(nextProps: any): void;
    private reindexChildren;
    private onDocumentClick;
    private onRootClick;
    private onAccessibleButtonClick;
    private close;
    private onMenuOptionClick;
    private onKeyDown;
    private onInputChange;
    private collectRoot;
    private setHighlightedOption;
    private nextOption;
    private prevOption;
    private scrollIntoView;
    private getMenuOptions;
    render(): JSX.Element;
}
export {};
