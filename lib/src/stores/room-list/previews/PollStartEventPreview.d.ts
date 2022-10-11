/// <reference types="react" />
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { IPreview } from "./IPreview";
import { TagID } from "../models";
import MatrixClientContext from "../../../contexts/MatrixClientContext";
export declare class PollStartEventPreview implements IPreview {
    static contextType: import("react").Context<import("matrix-js-sdk/src").MatrixClient>;
    context: React.ContextType<typeof MatrixClientContext>;
    getTextFor(event: MatrixEvent, tagId?: TagID, isThread?: boolean): string;
}
