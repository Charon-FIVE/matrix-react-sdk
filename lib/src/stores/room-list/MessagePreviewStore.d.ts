import { Room } from "matrix-js-sdk/src/models/room";
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { ActionPayload } from "../../dispatcher/payloads";
import { AsyncStoreWithClient } from "../AsyncStoreWithClient";
import { TagID } from "./models";
interface IState {
}
export declare class MessagePreviewStore extends AsyncStoreWithClient<IState> {
    private static readonly internalInstance;
    private previews;
    private constructor();
    static get instance(): MessagePreviewStore;
    static getPreviewChangedEventName(room: Room): string;
    /**
     * Gets the pre-translated preview for a given room
     * @param room The room to get the preview for.
     * @param inTagId The tag ID in which the room resides
     * @returns The preview, or null if none present.
     */
    getPreviewForRoom(room: Room, inTagId: TagID): Promise<string>;
    generatePreviewForEvent(event: MatrixEvent): string;
    private generatePreview;
    protected onAction(payload: ActionPayload): Promise<void>;
}
export {};
