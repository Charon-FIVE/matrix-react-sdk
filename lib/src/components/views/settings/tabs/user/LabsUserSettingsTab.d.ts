import React from 'react';
interface ILabsSettingToggleProps {
    featureId: string;
}
export declare class LabsSettingToggle extends React.Component<ILabsSettingToggleProps> {
    private onChange;
    render(): JSX.Element;
}
interface IState {
    showJumpToDate: boolean;
    showExploringPublicSpaces: boolean;
}
export default class LabsUserSettingsTab extends React.Component<{}, IState> {
    constructor(props: {});
    render(): JSX.Element;
}
export {};
