import { IAnnotatedPushRule, PushRuleAction } from "matrix-js-sdk/src/@types/PushRules";
import { VectorState } from "./PushRuleVectorState";
declare type StateToActionsMap = {
    [state in VectorState]?: PushRuleAction[];
};
interface IVectorPushRuleDefinition {
    description: string;
    vectorStateToActions: StateToActionsMap;
}
declare class VectorPushRuleDefinition {
    readonly description: string;
    readonly vectorStateToActions: StateToActionsMap;
    constructor(opts: IVectorPushRuleDefinition);
    ruleToVectorState(rule: IAnnotatedPushRule): VectorState;
}
export type { VectorPushRuleDefinition };
/**
 * The descriptions of rules managed by the Vector UI.
 */
export declare const VectorPushRulesDefinitions: {
    ".m.rule.contains_display_name": VectorPushRuleDefinition;
    ".m.rule.contains_user_name": VectorPushRuleDefinition;
    ".m.rule.roomnotif": VectorPushRuleDefinition;
    ".m.rule.room_one_to_one": VectorPushRuleDefinition;
    ".m.rule.encrypted_room_one_to_one": VectorPushRuleDefinition;
    ".m.rule.message": VectorPushRuleDefinition;
    ".m.rule.encrypted": VectorPushRuleDefinition;
    ".m.rule.invite_for_me": VectorPushRuleDefinition;
    ".m.rule.call": VectorPushRuleDefinition;
    ".m.rule.suppress_notices": VectorPushRuleDefinition;
    ".m.rule.tombstone": VectorPushRuleDefinition;
};
