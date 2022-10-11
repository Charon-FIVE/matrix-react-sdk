import React from 'react';
import { Layout } from "../../../../../settings/enums/Layout";
interface IProps {
}
interface IState {
    useSystemFont: boolean;
    systemFont: string;
    showAdvanced: boolean;
    layout: Layout;
    userId?: string;
    displayName: string;
    avatarUrl: string;
}
export default class AppearanceUserSettingsTab extends React.Component<IProps, IState> {
    private readonly MESSAGE_PREVIEW_TEXT;
    private unmounted;
    constructor(props: IProps);
    componentDidMount(): Promise<void>;
    componentWillUnmount(): void;
    private onLayoutChanged;
    private renderAdvancedSection;
    render(): JSX.Element;
}
export {};
