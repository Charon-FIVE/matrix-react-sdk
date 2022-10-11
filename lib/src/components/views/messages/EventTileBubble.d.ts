import React, { ReactNode, ReactChildren } from "react";
interface IProps {
    className: string;
    title: string;
    timestamp?: JSX.Element;
    subtitle?: ReactNode;
    children?: ReactChildren;
}
declare const EventTileBubble: React.ForwardRefExoticComponent<IProps & React.RefAttributes<HTMLDivElement>>;
export default EventTileBubble;
