import { MatrixEvent } from "matrix-js-sdk/src/models/event";
export declare function getEventDisplayInfo(mxEvent: MatrixEvent, showHiddenEvents: boolean, hideEvent?: boolean): {
    isInfoMessage: boolean;
    hasRenderer: boolean;
    isBubbleMessage: boolean;
    isLeftAlignedBubbleMessage: boolean;
    noBubbleEvent: boolean;
    isSeeingThroughMessageHiddenForModeration: boolean;
};
