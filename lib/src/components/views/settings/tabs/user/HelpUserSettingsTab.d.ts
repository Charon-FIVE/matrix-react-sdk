import React from 'react';
interface IProps {
    closeSettingsFn: () => void;
}
interface IState {
    appVersion: string;
    canUpdate: boolean;
}
export default class HelpUserSettingsTab extends React.Component<IProps, IState> {
    constructor(props: any);
    componentDidMount(): void;
    private getVersionInfo;
    private onClearCacheAndReload;
    private onBugReport;
    private onStartBotChat;
    private renderLegal;
    private renderCredits;
    private getVersionTextToCopy;
    private onKeyboardShortcutsClicked;
    render(): JSX.Element;
}
export {};
