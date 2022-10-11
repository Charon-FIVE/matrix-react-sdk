import * as React from "react";
interface IProps {
    isMinimized: boolean;
}
export default class RoomSearch extends React.PureComponent<IProps> {
    private readonly dispatcherRef;
    constructor(props: IProps);
    componentWillUnmount(): void;
    private openSpotlight;
    private onAction;
    render(): React.ReactNode;
}
export {};
