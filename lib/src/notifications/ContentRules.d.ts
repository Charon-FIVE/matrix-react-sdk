import { IAnnotatedPushRule, IPushRules } from "matrix-js-sdk/src/@types/PushRules";
import { VectorState } from "./PushRuleVectorState";
export interface IContentRules {
    vectorState: VectorState;
    rules: IAnnotatedPushRule[];
    externalRules: IAnnotatedPushRule[];
}
export declare class ContentRules {
    /**
     * Extract the keyword rules from a list of rules, and parse them
     * into a form which is useful for Vector's UI.
     *
     * Returns an object containing:
     *   rules: the primary list of keyword rules
     *   vectorState: a PushRuleVectorState indicating whether those rules are
     *      OFF/ON/LOUD
     *   externalRules: a list of other keyword rules, with states other than
     *      vectorState
     */
    static parseContentRules(rulesets: IPushRules): IContentRules;
    private static categoriseContentRules;
}
