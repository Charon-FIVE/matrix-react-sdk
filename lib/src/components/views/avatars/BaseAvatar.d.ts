import React from 'react';
import { ResizeMethod } from 'matrix-js-sdk/src/@types/partials';
interface IProps {
    name: string;
    idName?: string;
    title?: string;
    url?: string;
    urls?: string[];
    width?: number;
    height?: number;
    resizeMethod?: ResizeMethod;
    defaultToInitialLetter?: boolean;
    onClick?: React.MouseEventHandler;
    inputRef?: React.RefObject<HTMLImageElement & HTMLSpanElement>;
    className?: string;
    tabIndex?: number;
}
declare const BaseAvatar: (props: IProps) => JSX.Element;
export default BaseAvatar;
export declare type BaseAvatarType = React.FC<IProps>;
