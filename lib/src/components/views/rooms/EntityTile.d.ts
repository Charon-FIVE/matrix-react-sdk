import React from 'react';
import { E2EState } from './E2EIcon';
export declare enum PowerStatus {
    Admin = "admin",
    Moderator = "moderator"
}
interface IProps {
    name?: string;
    nameJSX?: JSX.Element;
    title?: string;
    avatarJsx?: JSX.Element;
    className?: string;
    presenceState?: string;
    presenceLastActiveAgo?: number;
    presenceLastTs?: number;
    presenceCurrentlyActive?: boolean;
    showInviteButton?: boolean;
    onClick?(): void;
    suppressOnHover?: boolean;
    showPresence?: boolean;
    subtextLabel?: string;
    e2eStatus?: E2EState;
    powerStatus?: PowerStatus;
}
interface IState {
    hover: boolean;
}
export default class EntityTile extends React.PureComponent<IProps, IState> {
    static defaultProps: {
        onClick: () => void;
        presenceState: string;
        presenceLastActiveAgo: number;
        presenceLastTs: number;
        showInviteButton: boolean;
        suppressOnHover: boolean;
        showPresence: boolean;
    };
    constructor(props: IProps);
    render(): JSX.Element;
}
export {};
