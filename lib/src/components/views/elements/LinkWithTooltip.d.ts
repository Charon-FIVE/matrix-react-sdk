import React from 'react';
import TextWithTooltip from './TextWithTooltip';
interface IProps extends Omit<React.ComponentProps<typeof TextWithTooltip>, "tabIndex" | "onClick"> {
}
export default class LinkWithTooltip extends React.Component<IProps> {
    constructor(props: IProps);
    render(): JSX.Element;
}
export {};
