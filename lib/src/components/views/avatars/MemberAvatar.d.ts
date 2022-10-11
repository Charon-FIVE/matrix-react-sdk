import React from 'react';
import { RoomMember } from "matrix-js-sdk/src/models/room-member";
import { ResizeMethod } from 'matrix-js-sdk/src/@types/partials';
import BaseAvatar from "./BaseAvatar";
interface IProps extends Omit<React.ComponentProps<typeof BaseAvatar>, "name" | "idName" | "url"> {
    member: RoomMember | null;
    fallbackUserId?: string;
    width: number;
    height: number;
    resizeMethod?: ResizeMethod;
    onClick?: React.MouseEventHandler;
    viewUserOnClick?: boolean;
    pushUserOnClick?: boolean;
    title?: string;
    style?: any;
    forceHistorical?: boolean;
    hideTitle?: boolean;
}
interface IState {
    name: string;
    title: string;
    imageUrl?: string;
}
export default class MemberAvatar extends React.PureComponent<IProps, IState> {
    static defaultProps: {
        width: number;
        height: number;
        resizeMethod: string;
        viewUserOnClick: boolean;
    };
    constructor(props: IProps);
    static getDerivedStateFromProps(nextProps: IProps): IState;
    private static getState;
    render(): JSX.Element;
}
export {};
