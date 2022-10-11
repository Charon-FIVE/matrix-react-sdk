import React, { CSSProperties, ReactNode, KeyboardEvent } from "react";
import ResizeNotifier from "../../utils/ResizeNotifier";
interface IProps {
    stickyBottom?: boolean;
    startAtBottom?: boolean;
    className?: string;
    style?: CSSProperties;
    resizeNotifier?: ResizeNotifier;
    fixedChildren?: ReactNode;
    onFillRequest?(backwards: boolean): Promise<boolean>;
    onUnfillRequest?(backwards: boolean, scrollToken: string): void;
    onScroll?(event: Event): void;
}
export interface IScrollState {
    stuckAtBottom: boolean;
    trackedNode?: HTMLElement;
    trackedScrollToken?: string;
    bottomOffset?: number;
    pixelOffset?: number;
}
export default class ScrollPanel extends React.Component<IProps> {
    static defaultProps: {
        stickyBottom: boolean;
        startAtBottom: boolean;
        onFillRequest: (backwards: boolean) => Promise<boolean>;
        onUnfillRequest: (backwards: boolean, scrollToken: string) => void;
        onScroll: () => void;
    };
    private readonly pendingFillRequests;
    private readonly itemlist;
    private unmounted;
    private scrollTimeout;
    private isFilling;
    private isFillingDueToPropsUpdate;
    private fillRequestWhileRunning;
    private pendingFillDueToPropsUpdate;
    private scrollState;
    private preventShrinkingState;
    private unfillDebouncer;
    private bottomGrowth;
    private minListHeight;
    private heightUpdateInProgress;
    private divScroll;
    constructor(props: any, context: any);
    componentDidMount(): void;
    componentDidUpdate(): void;
    componentWillUnmount(): void;
    private onScroll;
    private onResize;
    checkScroll: (isFromPropsUpdate?: boolean) => void;
    isAtBottom: () => boolean;
    private getExcessHeight;
    checkFillState: (depth?: number, isFromPropsUpdate?: boolean) => Promise<void>;
    private checkUnfillState;
    private maybeFill;
    getScrollState: () => IScrollState;
    resetScrollState: () => void;
    /**
     * jump to the top of the content.
     */
    scrollToTop: () => void;
    /**
     * jump to the bottom of the content.
     */
    scrollToBottom: () => void;
    /**
     * Page up/down.
     *
     * @param {number} mult: -1 to page up, +1 to page down
     */
    scrollRelative: (mult: number) => void;
    /**
     * Scroll up/down in response to a scroll key
     * @param {object} ev the keyboard event
     */
    handleScrollKey: (ev: KeyboardEvent) => void;
    scrollToToken: (scrollToken: string, pixelOffset: number, offsetBase: number) => void;
    private saveScrollState;
    private restoreSavedScrollState;
    private updateHeight;
    private getTrackedNode;
    private getListHeight;
    private getMessagesHeight;
    private topFromBottom;
    private getScrollNode;
    private collectScroll;
    /**
    Mark the bottom offset of the last tile so we can balance it out when
    anything below it changes, by calling updatePreventShrinking, to keep
    the same minimum bottom offset, effectively preventing the timeline to shrink.
    */
    preventShrinking: () => void;
    /** Clear shrinking prevention. Used internally, and when the timeline is reloaded. */
    clearPreventShrinking: () => void;
    /**
    update the container padding to balance
    the bottom offset of the last tile since
    preventShrinking was called.
    Clears the prevent-shrinking state ones the offset
    from the bottom of the marked tile grows larger than
    what it was when marking.
    */
    updatePreventShrinking: () => void;
    render(): JSX.Element;
}
export {};
