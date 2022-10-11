import React, { HTMLProps } from "react";
interface IProps extends Pick<HTMLProps<HTMLSpanElement>, "aria-live" | "role"> {
    seconds: number;
}
/**
 * Simply converts seconds into minutes and seconds. Note that hours will not be
 * displayed, making it possible to see "82:29".
 */
export default class Clock extends React.Component<IProps> {
    constructor(props: any);
    shouldComponentUpdate(nextProps: Readonly<IProps>): boolean;
    render(): JSX.Element;
}
export {};
