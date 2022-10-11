import React from 'react';
import { GuestAccess, HistoryVisibility } from "matrix-js-sdk/src/@types/partials";
import MatrixClientContext from "../../../../../contexts/MatrixClientContext";
interface IProps {
    roomId: string;
    closeSettingsFn: () => void;
}
interface IState {
    guestAccess: GuestAccess;
    history: HistoryVisibility;
    hasAliases: boolean;
    encrypted: boolean;
    showAdvancedSection: boolean;
}
export default class SecurityRoomSettingsTab extends React.Component<IProps, IState> {
    static contextType: React.Context<import("matrix-js-sdk/src").MatrixClient>;
    context: React.ContextType<typeof MatrixClientContext>;
    constructor(props: any, context: any);
    componentDidMount(): void;
    private pullContentPropertyFromEvent;
    componentWillUnmount(): void;
    private onStateEvent;
    private onEncryptionChange;
    private onGuestAccessChange;
    private createNewRoom;
    private onHistoryRadioToggle;
    private updateBlacklistDevicesFlag;
    private hasAliases;
    private renderJoinRule;
    private onJoinRuleChangeError;
    private onBeforeJoinRuleChange;
    private renderHistory;
    private toggleAdvancedSection;
    private renderAdvanced;
    render(): JSX.Element;
}
export {};
