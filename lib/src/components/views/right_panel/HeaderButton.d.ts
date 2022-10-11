import React from 'react';
import { ButtonEvent } from "../elements/AccessibleButton";
interface IProps {
    isHighlighted: boolean;
    isUnread?: boolean;
    onClick: (ev: ButtonEvent) => void;
    name: string;
    title: string;
}
export default class HeaderButton extends React.Component<IProps> {
    render(): JSX.Element;
}
export {};
