import React, { LegacyRef } from "react";
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { Relations } from "matrix-js-sdk/src/models/relations";
import { MediaEventHelper } from "../../../utils/MediaEventHelper";
import EditorStateTransfer from "../../../utils/EditorStateTransfer";
import { RoomPermalinkCreator } from "../../../utils/permalinks/Permalinks";
export interface IBodyProps {
    mxEvent: MatrixEvent;
    highlights?: string[];
    highlightLink?: string;
    onHeightChanged: () => void;
    showUrlPreview?: boolean;
    forExport?: boolean;
    maxImageHeight?: number;
    replacingEventId?: string;
    editState?: EditorStateTransfer;
    onMessageAllowed: () => void;
    permalinkCreator: RoomPermalinkCreator;
    mediaEventHelper: MediaEventHelper;
    isSeeingThroughMessageHiddenForModeration?: boolean;
    getRelationsForEvent?: (eventId: string, relationType: string, eventType: string) => Relations;
    ref?: React.RefObject<any> | LegacyRef<any>;
}
