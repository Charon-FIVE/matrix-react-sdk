/// <reference types="react" />
import { Room } from "matrix-js-sdk/src/models/room";
import HeaderButtons from './HeaderButtons';
import { RightPanelPhases } from '../../../stores/right-panel/RightPanelStorePhases';
import { ActionPayload } from "../../../dispatcher/payloads";
interface IProps {
    room?: Room;
    excludedRightPanelPhaseButtons?: Array<RightPanelPhases>;
}
export default class RoomHeaderButtons extends HeaderButtons<IProps> {
    private static readonly THREAD_PHASES;
    private threadNotificationState;
    constructor(props: IProps);
    componentDidMount(): void;
    componentWillUnmount(): void;
    private onThreadNotification;
    protected onAction(payload: ActionPayload): void;
    private onRoomSummaryClicked;
    private onNotificationsClicked;
    private onPinnedMessagesClicked;
    private onTimelineCardClicked;
    private onThreadsPanelClicked;
    renderButtons(): JSX.Element;
}
export {};
