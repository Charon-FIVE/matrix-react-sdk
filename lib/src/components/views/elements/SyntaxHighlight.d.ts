import React from 'react';
interface IProps {
    language?: string;
    children: string;
}
export default class SyntaxHighlight extends React.PureComponent<IProps> {
    render(): JSX.Element;
}
export {};
