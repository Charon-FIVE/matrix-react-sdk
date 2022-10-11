import React from 'react';
import MatrixClientContext from "../../contexts/MatrixClientContext";
interface IProps {
    url?: string;
    className?: string;
    scrollbar?: boolean;
    replaceMap?: Record<string, string>;
}
interface IState {
    page: string;
}
export default class EmbeddedPage extends React.PureComponent<IProps, IState> {
    static contextType: React.Context<import("matrix-js-sdk/src").MatrixClient>;
    private unmounted;
    private dispatcherRef;
    constructor(props: IProps, context: typeof MatrixClientContext);
    private translate;
    componentDidMount(): void;
    componentWillUnmount(): void;
    private onAction;
    render(): JSX.Element;
}
export {};
