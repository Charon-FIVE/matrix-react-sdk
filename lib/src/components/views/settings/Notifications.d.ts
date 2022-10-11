import React from "react";
import { IAnnotatedPushRule, IPusher, RuleId } from "matrix-js-sdk/src/@types/PushRules";
import { IThreepid } from "matrix-js-sdk/src/@types/threepids";
import { IContentRules, VectorState } from "../../../notifications";
import { TranslatedString } from "../../../languageHandler";
declare enum Phase {
    Loading = "loading",
    Ready = "ready",
    Persisting = "persisting",
    Error = "error"
}
declare enum RuleClass {
    Master = "master",
    VectorGlobal = "vector_global",
    VectorMentions = "vector_mentions",
    VectorOther = "vector_other",
    Other = "other"
}
declare const KEYWORD_RULE_ID = "_keywords";
interface IVectorPushRule {
    ruleId: RuleId | typeof KEYWORD_RULE_ID | string;
    rule?: IAnnotatedPushRule;
    description: TranslatedString | string;
    vectorState: VectorState;
}
interface IProps {
}
interface IState {
    phase: Phase;
    masterPushRule?: IAnnotatedPushRule;
    vectorKeywordRuleInfo?: IContentRules;
    vectorPushRules?: {
        [category in RuleClass]?: IVectorPushRule[];
    };
    pushers?: IPusher[];
    threepids?: IThreepid[];
    desktopNotifications: boolean;
    desktopShowBody: boolean;
    audioNotifications: boolean;
}
export default class Notifications extends React.PureComponent<IProps, IState> {
    private settingWatchers;
    constructor(props: IProps);
    private get isInhibited();
    componentDidMount(): void;
    componentWillUnmount(): void;
    private refreshFromServer;
    private refreshRules;
    private refreshPushers;
    private refreshThreepids;
    private showSaveError;
    private onMasterRuleChanged;
    private onEmailNotificationsChanged;
    private onDesktopNotificationsChanged;
    private onDesktopShowBodyChanged;
    private onAudioNotificationsChanged;
    private onRadioChecked;
    private onClearNotificationsClicked;
    private setKeywords;
    private onKeywordAdd;
    private onKeywordRemove;
    private renderTopSection;
    private renderCategory;
    private renderTargets;
    render(): JSX.Element;
}
export {};
