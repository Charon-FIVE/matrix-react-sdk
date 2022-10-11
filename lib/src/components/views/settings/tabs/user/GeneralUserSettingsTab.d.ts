import React from 'react';
import { IThreepid } from "matrix-js-sdk/src/@types/threepids";
import { Policies, Service } from "../../../../../Terms";
interface IProps {
    closeSettingsFn: () => void;
}
interface IState {
    language: string;
    spellCheckEnabled: boolean;
    spellCheckLanguages: string[];
    haveIdServer: boolean;
    serverSupportsSeparateAddAndBind: boolean;
    idServerHasUnsignedTerms: boolean;
    requiredPolicyInfo: {
        hasTerms: boolean;
        policiesAndServices: {
            service: Service;
            policies: Policies;
        }[];
        agreedUrls: string[];
        resolve: (values: string[]) => void;
    };
    emails: IThreepid[];
    msisdns: IThreepid[];
    loading3pids: boolean;
    canChangePassword: boolean;
    idServerName: string;
}
export default class GeneralUserSettingsTab extends React.Component<IProps, IState> {
    private readonly dispatcherRef;
    constructor(props: IProps);
    UNSAFE_componentWillMount(): Promise<void>;
    componentDidMount(): Promise<void>;
    componentWillUnmount(): void;
    private onAction;
    private onEmailsChange;
    private onMsisdnsChange;
    private getThreepidState;
    private checkTerms;
    private onLanguageChange;
    private onSpellCheckLanguagesChange;
    private onSpellCheckEnabledChange;
    private onPasswordChangeError;
    private onPasswordChanged;
    private onDeactivateClicked;
    private renderProfileSection;
    private renderAccountSection;
    private renderLanguageSection;
    private renderSpellCheckSection;
    private renderDiscoverySection;
    private renderManagementSection;
    private renderIntegrationManagerSection;
    render(): JSX.Element;
}
export {};
