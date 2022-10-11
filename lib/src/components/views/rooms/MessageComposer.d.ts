import React from 'react';
import { IEventRelation, MatrixEvent } from "matrix-js-sdk/src/models/event";
import { Room } from "matrix-js-sdk/src/models/room";
import { RoomMember } from "matrix-js-sdk/src/models/room-member";
import { RoomPermalinkCreator } from '../../../utils/permalinks/Permalinks';
import ResizeNotifier from "../../../utils/ResizeNotifier";
import { E2EStatus } from '../../../utils/ShieldUtils';
import RoomContext from '../../../contexts/RoomContext';
interface IProps {
    room: Room;
    resizeNotifier: ResizeNotifier;
    permalinkCreator: RoomPermalinkCreator;
    replyToEvent?: MatrixEvent;
    relation?: IEventRelation;
    e2eStatus?: E2EStatus;
    compact?: boolean;
}
interface IState {
    isComposerEmpty: boolean;
    haveRecording: boolean;
    recordingTimeLeftSeconds?: number;
    me?: RoomMember;
    isMenuOpen: boolean;
    isStickerPickerOpen: boolean;
    showStickersButton: boolean;
    showPollsButton: boolean;
}
export default class MessageComposer extends React.Component<IProps, IState> {
    private dispatcherRef;
    private messageComposerInput;
    private voiceRecordingButton;
    private ref;
    private instanceId;
    private _voiceRecording;
    static contextType: React.Context<import("../../structures/RoomView").IRoomState>;
    context: React.ContextType<typeof RoomContext>;
    static defaultProps: {
        compact: boolean;
    };
    constructor(props: IProps);
    private get voiceRecording();
    private set voiceRecording(value);
    componentDidMount(): void;
    private onResize;
    private onAction;
    private waitForOwnMember;
    componentWillUnmount(): void;
    private onTombstoneClick;
    private renderPlaceholderText;
    private addEmoji;
    private sendMessage;
    private onChange;
    private onVoiceStoreUpdate;
    private updateRecordingState;
    private onRecordingStarted;
    private onRecordingEndingSoon;
    private setStickerPickerOpen;
    private toggleStickerPickerOpen;
    private toggleButtonMenu;
    private get showStickersButton();
    render(): JSX.Element;
}
export {};
