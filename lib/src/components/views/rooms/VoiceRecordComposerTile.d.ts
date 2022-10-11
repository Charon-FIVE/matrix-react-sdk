import React, { ReactNode } from "react";
import { Room } from "matrix-js-sdk/src/models/room";
import { IEventRelation, MatrixEvent } from "matrix-js-sdk/src/models/event";
import { RecordingState, VoiceRecording } from "../../../audio/VoiceRecording";
import { RoomPermalinkCreator } from "../../../utils/permalinks/Permalinks";
import RoomContext from "../../../contexts/RoomContext";
interface IProps {
    room: Room;
    permalinkCreator?: RoomPermalinkCreator;
    relation?: IEventRelation;
    replyToEvent?: MatrixEvent;
}
interface IState {
    recorder?: VoiceRecording;
    recordingPhase?: RecordingState;
    didUploadFail?: boolean;
}
/**
 * Container tile for rendering the voice message recorder in the composer.
 */
export default class VoiceRecordComposerTile extends React.PureComponent<IProps, IState> {
    static contextType: React.Context<import("../../structures/RoomView").IRoomState>;
    context: React.ContextType<typeof RoomContext>;
    private voiceRecordingId;
    constructor(props: IProps);
    componentDidMount(): void;
    componentWillUnmount(): Promise<void>;
    send(): Promise<void>;
    private disposeRecording;
    private onCancel;
    onRecordStartEndClick: () => Promise<void>;
    private bindNewRecorder;
    private onRecordingUpdate;
    private renderWaveformArea;
    render(): ReactNode;
}
export {};
