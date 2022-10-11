import { ReadyWatchingStore } from '../ReadyWatchingStore';
import { IRightPanelCard } from './RightPanelStoreIPanelState';
import { ActionPayload } from "../../dispatcher/payloads";
/**
 * A class for tracking the state of the right panel between layouts and
 * sessions. This state includes a history for each room. Each history element
 * contains the phase (e.g. RightPanelPhase.RoomMemberInfo) and the state (e.g.
 * the member) associated with it.
*/
export default class RightPanelStore extends ReadyWatchingStore {
    private static internalInstance;
    private global?;
    private byRoom;
    private viewedRoomId;
    private constructor();
    /**
     * Resets the store. Intended for test usage only.
     */
    reset(): void;
    protected onReady(): Promise<any>;
    protected onNotReady(): Promise<any>;
    protected onDispatcherAction(payload: ActionPayload): void;
    /**
     * If you are calling this from a component that already knows about a
     * specific room from props / state, then it's best to prefer
     * `isOpenForRoom` below to ensure all your data is for a single room
     * during room changes.
     */
    get isOpen(): boolean;
    isOpenForRoom(roomId: string): boolean;
    get roomPhaseHistory(): Array<IRightPanelCard>;
    /**
     * If you are calling this from a component that already knows about a
     * specific room from props / state, then it's best to prefer
     * `currentCardForRoom` below to ensure all your data is for a single room
     * during room changes.
     */
    get currentCard(): IRightPanelCard;
    currentCardForRoom(roomId: string): IRightPanelCard;
    get previousCard(): IRightPanelCard;
    setCard(card: IRightPanelCard, allowClose?: boolean, roomId?: string): void;
    setCards(cards: IRightPanelCard[], allowClose?: boolean, roomId?: string): void;
    pushCard(card: IRightPanelCard, allowClose?: boolean, roomId?: string): void;
    popCard(roomId?: string): IRightPanelCard;
    togglePanel(roomId: string | null): void;
    show(roomId: string | null): void;
    hide(roomId: string | null): void;
    private loadCacheFromSettings;
    private emitAndUpdateSettings;
    private filterValidCards;
    private isCardStateValid;
    private getVerificationRedirect;
    private isPhaseValid;
    private onVerificationRequestUpdate;
    private handleViewedRoomChange;
    static get instance(): RightPanelStore;
}
