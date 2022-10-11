import React from "react";
interface IProps {
    sensor: Element;
    breakpoint: number;
    onMeasurement(narrow: boolean): void;
}
export default class Measured extends React.PureComponent<IProps> {
    private static instanceCount;
    private readonly instanceId;
    static defaultProps: {
        breakpoint: number;
    };
    constructor(props: any);
    componentDidMount(): void;
    componentDidUpdate(prevProps: Readonly<IProps>): void;
    componentWillUnmount(): void;
    private onResize;
    render(): any;
}
export {};
