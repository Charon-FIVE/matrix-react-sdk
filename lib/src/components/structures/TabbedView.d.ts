import * as React from "react";
import { ScreenName } from "../../PosthogTrackers";
/**
 * Represents a tab for the TabbedView.
 */
export declare class Tab {
    readonly id: string;
    readonly label: string;
    readonly icon: string;
    readonly body: React.ReactNode;
    readonly screenName?: ScreenName;
    /**
     * Creates a new tab.
     * @param {string} id The tab's ID.
     * @param {string} label The untranslated tab label.
     * @param {string} icon The class for the tab icon. This should be a simple mask.
     * @param {React.ReactNode} body The JSX for the tab container.
     * @param {string} screenName The screen name to report to Posthog.
     */
    constructor(id: string, label: string, icon: string, body: React.ReactNode, screenName?: ScreenName);
}
export declare enum TabLocation {
    LEFT = "left",
    TOP = "top"
}
interface IProps {
    tabs: Tab[];
    initialTabId?: string;
    tabLocation: TabLocation;
    onChange?: (tabId: string) => void;
    screenName?: ScreenName;
}
interface IState {
    activeTabId: string;
}
export default class TabbedView extends React.Component<IProps, IState> {
    constructor(props: IProps);
    static defaultProps: {
        tabLocation: TabLocation;
    };
    private getTabById;
    /**
     * Shows the given tab
     * @param {Tab} tab the tab to show
     * @private
     */
    private setActiveTab;
    private renderTabLabel;
    private renderTabPanel;
    render(): React.ReactNode;
}
export {};
