import React from 'react';
import { IDialogProps } from "./IDialogProps";
import { UserTab } from "./UserTab";
interface IProps extends IDialogProps {
    initialTabId?: UserTab;
}
interface IState {
    mjolnirEnabled: boolean;
    newSessionManagerEnabled: boolean;
}
export default class UserSettingsDialog extends React.Component<IProps, IState> {
    private settingsWatchers;
    constructor(props: any);
    componentDidMount(): void;
    componentWillUnmount(): void;
    private mjolnirChanged;
    private sessionManagerChanged;
    private getTabs;
    render(): JSX.Element;
}
export {};
