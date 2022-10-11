import React from 'react';
import { IBodyProps } from "./IBodyProps";
import RoomContext from "../../../contexts/RoomContext";
interface IState {
    links: string[];
    widgetHidden: boolean;
}
export default class TextualBody extends React.Component<IBodyProps, IState> {
    private readonly contentRef;
    private unmounted;
    private pills;
    private tooltips;
    static contextType: React.Context<import("../../structures/RoomView").IRoomState>;
    context: React.ContextType<typeof RoomContext>;
    constructor(props: any);
    componentDidMount(): void;
    private applyFormatting;
    private addCodeElement;
    private addCodeExpansionButton;
    private addCodeCopyButton;
    private wrapInDiv;
    private handleCodeBlockExpansion;
    private addLineNumbers;
    private highlightCode;
    componentDidUpdate(prevProps: any): void;
    componentWillUnmount(): void;
    shouldComponentUpdate(nextProps: any, nextState: any): boolean;
    private calculateUrlPreview;
    private activateSpoilers;
    private findLinks;
    private isLinkPreviewable;
    private onCancelClick;
    private onEmoteSenderClick;
    /**
     * This acts as a fallback in-app navigation handler for any body links that
     * were ignored as part of linkification because they were already links
     * to start with (e.g. pills, links in the content).
     */
    private onBodyLinkClick;
    getEventTileOps: () => {
        isWidgetHidden: () => boolean;
        unhideWidget: () => void;
    };
    private onStarterLinkClick;
    private openHistoryDialog;
    private renderEditedMarker;
    /**
     * Render a marker informing the user that, while they can see the message,
     * it is hidden for other users.
     */
    private renderPendingModerationMarker;
    render(): JSX.Element;
}
export {};
