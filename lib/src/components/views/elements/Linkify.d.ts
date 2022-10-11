import React from "react";
interface Props {
    as?: string;
    children: React.ReactNode;
    onClick?: (ev: MouseEvent) => void;
}
export declare function Linkify({ as, children, onClick, }: Props): JSX.Element;
export {};
