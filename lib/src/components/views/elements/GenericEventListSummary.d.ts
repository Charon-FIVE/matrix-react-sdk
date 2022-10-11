import React, { ReactNode } from "react";
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { RoomMember } from "matrix-js-sdk/src/models/room-member";
import { Layout } from '../../../settings/enums/Layout';
interface IProps {
    events: MatrixEvent[];
    threshold?: number;
    startExpanded?: boolean;
    summaryMembers?: RoomMember[];
    summaryText?: string | JSX.Element;
    children: ReactNode[];
    onToggle?(): void;
    layout?: Layout;
    'data-testid'?: string;
}
declare const GenericEventListSummary: React.FC<IProps>;
export default GenericEventListSummary;
