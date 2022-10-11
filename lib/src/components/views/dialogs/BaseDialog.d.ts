import React from 'react';
import { IDialogProps } from "./IDialogProps";
import { ScreenName } from "../../../PosthogTrackers";
interface IProps extends IDialogProps {
    hasCancel?: boolean;
    onKeyDown?: (e: KeyboardEvent | React.KeyboardEvent) => void;
    className?: string;
    fixedWidth?: boolean;
    title?: JSX.Element | string;
    "aria-label"?: string;
    headerImage?: string;
    children?: React.ReactNode;
    contentId?: string;
    titleClass?: string | string[];
    headerButton?: JSX.Element;
    screenName?: ScreenName;
}
export default class BaseDialog extends React.Component<IProps> {
    private matrixClient;
    static defaultProps: {
        hasCancel: boolean;
        fixedWidth: boolean;
    };
    constructor(props: any);
    private onKeyDown;
    private onCancelClick;
    render(): JSX.Element;
}
export {};
