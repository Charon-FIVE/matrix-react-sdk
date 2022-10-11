import React from 'react';
import { EventTimelineSet } from "matrix-js-sdk/src/models/event-timeline-set";
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { Room } from 'matrix-js-sdk/src/models/room';
import ResizeNotifier from '../../utils/ResizeNotifier';
interface IProps {
    roomId: string;
    onClose: () => void;
    resizeNotifier: ResizeNotifier;
}
interface IState {
    timelineSet: EventTimelineSet;
    narrow: boolean;
}
declare class FilePanel extends React.Component<IProps, IState> {
    static contextType: React.Context<import("./RoomView").IRoomState>;
    private decryptingEvents;
    noRoom: boolean;
    private card;
    state: {
        timelineSet: any;
        narrow: boolean;
    };
    private onRoomTimeline;
    private onEventDecrypted;
    addEncryptedLiveEvent(ev: MatrixEvent): void;
    componentDidMount(): Promise<void>;
    componentWillUnmount(): void;
    fetchFileEventsServer(room: Room): Promise<EventTimelineSet>;
    private onPaginationRequest;
    private onMeasurement;
    updateTimelineSet(roomId: string): Promise<void>;
    render(): JSX.Element;
}
export default FilePanel;
