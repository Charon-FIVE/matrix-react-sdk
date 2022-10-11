import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { IPreview } from "./IPreview";
import { TagID } from "../models";
export declare class LegacyCallHangupEvent implements IPreview {
    getTextFor(event: MatrixEvent, tagId?: TagID): string;
}
