import { PureComponent, SyntheticEvent } from "react";
import { WebScreen as ScreenEvent } from "@matrix-org/analytics-events/types/typescript/WebScreen";
import { Interaction as InteractionEvent } from "@matrix-org/analytics-events/types/typescript/Interaction";
import PageType from "./PageTypes";
import Views from "./Views";
export declare type ScreenName = ScreenEvent["$current_url"];
export declare type InteractionName = InteractionEvent["name"];
export default class PosthogTrackers {
    private static internalInstance;
    static get instance(): PosthogTrackers;
    private view;
    private pageType?;
    private override?;
    trackPageChange(view: Views, pageType: PageType | undefined, durationMs: number): void;
    private trackPage;
    trackOverride(screenName: ScreenName): void;
    clearOverride(screenName: ScreenName): void;
    static trackInteraction(name: InteractionName, ev?: SyntheticEvent, index?: number): void;
}
export declare class PosthogScreenTracker extends PureComponent<{
    screenName: ScreenName;
}> {
    componentDidMount(): void;
    componentDidUpdate(): void;
    componentWillUnmount(): void;
    render(): any;
}
