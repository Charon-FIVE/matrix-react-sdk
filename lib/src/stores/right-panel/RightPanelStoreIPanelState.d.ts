import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { User } from "matrix-js-sdk/src/models/user";
import { Room } from "matrix-js-sdk/src/models/room";
import { RoomMember } from "matrix-js-sdk/src/models/room-member";
import { VerificationRequest } from "matrix-js-sdk/src/crypto/verification/request/VerificationRequest";
import { RightPanelPhases } from "./RightPanelStorePhases";
export interface IRightPanelCardState {
    member?: RoomMember | User;
    verificationRequest?: VerificationRequest;
    verificationRequestPromise?: Promise<VerificationRequest>;
    widgetId?: string;
    spaceId?: string;
    memberInfoEvent?: MatrixEvent;
    threadHeadEvent?: MatrixEvent;
    initialEvent?: MatrixEvent;
    isInitialEventHighlighted?: boolean;
    initialEventScrollIntoView?: boolean;
}
export interface IRightPanelCardStateStored {
    memberId?: string;
    widgetId?: string;
    spaceId?: string;
    memberInfoEventId?: string;
    threadHeadEventId?: string;
    initialEventId?: string;
    isInitialEventHighlighted?: boolean;
    initialEventScrollIntoView?: boolean;
}
export interface IRightPanelCard {
    phase: RightPanelPhases;
    state?: IRightPanelCardState;
}
export interface IRightPanelCardStored {
    phase: RightPanelPhases;
    state?: IRightPanelCardStateStored;
}
export interface IRightPanelForRoom {
    isOpen: boolean;
    history: Array<IRightPanelCard>;
}
interface IRightPanelForRoomStored {
    isOpen: boolean;
    history: Array<IRightPanelCardStored>;
}
export declare function convertToStorePanel(cacheRoom: IRightPanelForRoom): IRightPanelForRoomStored;
export declare function convertToStatePanel(storeRoom: IRightPanelForRoomStored, room: Room): IRightPanelForRoom;
export declare function convertCardToStore(panelState: IRightPanelCard): IRightPanelCardStored;
export {};
