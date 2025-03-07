/*
Copyright 2021 - 2022 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React, { createRef, KeyboardEvent } from 'react';
import { Thread, THREAD_RELATION_TYPE, ThreadEvent } from 'matrix-js-sdk/src/models/thread';
import { Room } from 'matrix-js-sdk/src/models/room';
import { IEventRelation, MatrixEvent } from 'matrix-js-sdk/src/models/event';
import { TimelineWindow } from 'matrix-js-sdk/src/timeline-window';
import { Direction } from 'matrix-js-sdk/src/models/event-timeline';
import { IRelationsRequestOpts } from 'matrix-js-sdk/src/@types/requests';
import classNames from "classnames";
import { logger } from 'matrix-js-sdk/src/logger';

import BaseCard from "../views/right_panel/BaseCard";
import { RightPanelPhases } from "../../stores/right-panel/RightPanelStorePhases";
import ResizeNotifier from '../../utils/ResizeNotifier';
import MessageComposer from '../views/rooms/MessageComposer';
import { RoomPermalinkCreator } from '../../utils/permalinks/Permalinks';
import { Layout } from '../../settings/enums/Layout';
import TimelinePanel from './TimelinePanel';
import dis from "../../dispatcher/dispatcher";
import { ActionPayload } from '../../dispatcher/payloads';
import { Action } from '../../dispatcher/actions';
import { MatrixClientPeg } from '../../MatrixClientPeg';
import { E2EStatus } from '../../utils/ShieldUtils';
import EditorStateTransfer from '../../utils/EditorStateTransfer';
import RoomContext, { TimelineRenderingType } from '../../contexts/RoomContext';
import ContentMessages from '../../ContentMessages';
import UploadBar from './UploadBar';
import { _t } from '../../languageHandler';
import ThreadListContextMenu from '../views/context_menus/ThreadListContextMenu';
import RightPanelStore from '../../stores/right-panel/RightPanelStore';
import SettingsStore from "../../settings/SettingsStore";
import { ViewRoomPayload } from "../../dispatcher/payloads/ViewRoomPayload";
import FileDropTarget from "./FileDropTarget";
import { getKeyBindingsManager } from "../../KeyBindingsManager";
import { KeyBindingAction } from "../../accessibility/KeyboardShortcuts";
import Measured from '../views/elements/Measured';
import PosthogTrackers from "../../PosthogTrackers";
import { ButtonEvent } from "../views/elements/AccessibleButton";
import { RoomViewStore } from '../../stores/RoomViewStore';
import Spinner from "../views/elements/Spinner";
import { ComposerInsertPayload, ComposerType } from "../../dispatcher/payloads/ComposerInsertPayload";

interface IProps {
    room: Room;
    onClose: () => void;
    resizeNotifier: ResizeNotifier;
    mxEvent: MatrixEvent;
    permalinkCreator?: RoomPermalinkCreator;
    e2eStatus?: E2EStatus;
    initialEvent?: MatrixEvent;
    isInitialEventHighlighted?: boolean;
    initialEventScrollIntoView?: boolean;
}

interface IState {
    thread?: Thread;
    layout: Layout;
    editState?: EditorStateTransfer;
    replyToEvent?: MatrixEvent;
    narrow: boolean;
}

export default class ThreadView extends React.Component<IProps, IState> {
    static contextType = RoomContext;
    public context!: React.ContextType<typeof RoomContext>;

    private dispatcherRef: string;
    private readonly layoutWatcherRef: string;
    private timelinePanel = createRef<TimelinePanel>();
    private card = createRef<HTMLDivElement>();

    constructor(props: IProps) {
        super(props);

        this.state = {
            layout: SettingsStore.getValue("layout"),
            narrow: false,
        };

        this.layoutWatcherRef = SettingsStore.watchSetting("layout", null, (...[,,, value]) =>
            this.setState({ layout: value as Layout }),
        );
    }

    public componentDidMount(): void {
        this.setupThread(this.props.mxEvent);
        this.dispatcherRef = dis.register(this.onAction);

        const room = MatrixClientPeg.get().getRoom(this.props.mxEvent.getRoomId());
        room.on(ThreadEvent.New, this.onNewThread);
    }

    public componentWillUnmount(): void {
        if (this.dispatcherRef) dis.unregister(this.dispatcherRef);
        const roomId = this.props.mxEvent.getRoomId();
        const room = MatrixClientPeg.get().getRoom(roomId);
        room.removeListener(ThreadEvent.New, this.onNewThread);
        SettingsStore.unwatchSetting(this.layoutWatcherRef);

        const hasRoomChanged = RoomViewStore.instance.getRoomId() !== roomId;
        if (this.props.isInitialEventHighlighted && !hasRoomChanged) {
            dis.dispatch<ViewRoomPayload>({
                action: Action.ViewRoom,
                room_id: this.props.room.roomId,
                metricsTrigger: undefined, // room doesn't change
            });
        }
    }

    public componentDidUpdate(prevProps) {
        if (prevProps.mxEvent !== this.props.mxEvent) {
            this.setupThread(this.props.mxEvent);
        }

        if (prevProps.room !== this.props.room) {
            RightPanelStore.instance.setCard({ phase: RightPanelPhases.RoomSummary });
        }
    }

    private onAction = (payload: ActionPayload): void => {
        if (payload.phase == RightPanelPhases.ThreadView && payload.event) {
            this.setupThread(payload.event);
        }
        switch (payload.action) {
            case Action.ComposerInsert: {
                if (payload.composerType) break;
                if (payload.timelineRenderingType !== TimelineRenderingType.Thread) break;

                // re-dispatch to the correct composer
                dis.dispatch<ComposerInsertPayload>({
                    ...(payload as ComposerInsertPayload),
                    composerType: this.state.editState ? ComposerType.Edit : ComposerType.Send,
                });
                break;
            }

            case Action.EditEvent:
                // Quit early if it's not a thread context
                if (payload.timelineRenderingType !== TimelineRenderingType.Thread) return;
                // Quit early if that's not a thread event
                if (payload.event && !payload.event.getThread()) return;
                this.setState({
                    editState: payload.event ? new EditorStateTransfer(payload.event) : null,
                }, () => {
                    if (payload.event) {
                        this.timelinePanel.current?.scrollToEventIfNeeded(payload.event.getId());
                    }
                });
                break;
            case 'reply_to_event':
                if (payload.context === TimelineRenderingType.Thread) {
                    this.setState({
                        replyToEvent: payload.event,
                    });
                }
                break;
            default:
                break;
        }
    };

    private setupThread = (mxEv: MatrixEvent) => {
        let thread = this.props.room.getThread(mxEv.getId());
        if (!thread) {
            thread = this.props.room.createThread(mxEv.getId(), mxEv, [mxEv], true);
        }
        this.updateThread(thread);
    };

    private onNewThread = (thread: Thread) => {
        if (thread.id === this.props.mxEvent.getId()) {
            this.setupThread(this.props.mxEvent);
        }
    };

    private updateThread = (thread?: Thread) => {
        if (thread && this.state.thread !== thread) {
            this.setState({
                thread,
            }, async () => {
                thread.emit(ThreadEvent.ViewThread);
                await thread.fetchInitialEvents();
                this.nextBatch = thread.liveTimeline.getPaginationToken(Direction.Backward);
                this.timelinePanel.current?.refreshTimeline();
            });
        }
    };

    private resetJumpToEvent = (event?: string): void => {
        if (this.props.initialEvent && this.props.initialEventScrollIntoView &&
            event === this.props.initialEvent?.getId()) {
            dis.dispatch<ViewRoomPayload>({
                action: Action.ViewRoom,
                room_id: this.props.room.roomId,
                event_id: this.props.initialEvent?.getId(),
                highlighted: this.props.isInitialEventHighlighted,
                scroll_into_view: false,
                replyingToEvent: this.state.replyToEvent,
                metricsTrigger: undefined, // room doesn't change
            });
        }
    };

    private onMeasurement = (narrow: boolean): void => {
        this.setState({ narrow });
    };

    private onKeyDown = (ev: KeyboardEvent) => {
        let handled = false;

        const action = getKeyBindingsManager().getRoomAction(ev);
        switch (action) {
            case KeyBindingAction.UploadFile: {
                dis.dispatch({
                    action: "upload_file",
                    context: TimelineRenderingType.Thread,
                }, true);
                handled = true;
                break;
            }
        }

        if (handled) {
            ev.stopPropagation();
            ev.preventDefault();
        }
    };

    private nextBatch: string;

    private onPaginationRequest = async (
        timelineWindow: TimelineWindow | null,
        direction = Direction.Backward,
        limit = 20,
    ): Promise<boolean> => {
        if (!Thread.hasServerSideSupport) {
            timelineWindow.extend(direction, limit);
            return true;
        }

        const opts: IRelationsRequestOpts = {
            limit,
        };

        if (this.nextBatch) {
            opts.from = this.nextBatch;
        }

        const { nextBatch } = await this.state.thread.fetchEvents(opts);

        this.nextBatch = nextBatch;

        // Advances the marker on the TimelineWindow to define the correct
        // window of events to display on screen
        timelineWindow.extend(direction, limit);

        return !!nextBatch;
    };

    private onFileDrop = (dataTransfer: DataTransfer) => {
        ContentMessages.sharedInstance().sendContentListToRoom(
            Array.from(dataTransfer.files),
            this.props.mxEvent.getRoomId(),
            this.threadRelation,
            MatrixClientPeg.get(),
            TimelineRenderingType.Thread,
        );
    };

    private get threadRelation(): IEventRelation {
        const lastThreadReply = this.state.thread?.lastReply((ev: MatrixEvent) => {
            return ev.isRelation(THREAD_RELATION_TYPE.name) && !ev.status;
        });

        return {
            "rel_type": THREAD_RELATION_TYPE.name,
            "event_id": this.state.thread?.id,
            "is_falling_back": true,
            "m.in_reply_to": {
                "event_id": lastThreadReply?.getId() ?? this.state.thread?.id,
            },
        };
    }

    private renderThreadViewHeader = (): JSX.Element => {
        return <div className="mx_ThreadPanel__header">
            <span>{ _t("Thread") }</span>
            <ThreadListContextMenu
                mxEvent={this.props.mxEvent}
                permalinkCreator={this.props.permalinkCreator} />
        </div>;
    };

    public render(): JSX.Element {
        const highlightedEventId = this.props.isInitialEventHighlighted
            ? this.props.initialEvent?.getId()
            : null;

        const threadRelation = this.threadRelation;

        const messagePanelClassNames = classNames("mx_RoomView_messagePanel", {
            "mx_GroupLayout": this.state.layout === Layout.Group,
        });

        let timeline: JSX.Element;
        if (this.state.thread) {
            if (this.props.initialEvent && this.props.initialEvent.getRoomId() !== this.state.thread.roomId) {
                logger.warn("ThreadView attempting to render TimelinePanel with mismatched initialEvent",
                    this.state.thread.roomId,
                    this.props.initialEvent.getRoomId(),
                    this.props.initialEvent.getId(),
                );
            }

            timeline = <>
                <FileDropTarget parent={this.card.current} onFileDrop={this.onFileDrop} />
                <TimelinePanel
                    key={this.state.thread.id}
                    ref={this.timelinePanel}
                    showReadReceipts={false} // Hide the read receipts
                    // until homeservers speak threads language
                    manageReadReceipts={true}
                    manageReadMarkers={true}
                    sendReadReceiptOnLoad={true}
                    timelineSet={this.state.thread.timelineSet}
                    showUrlPreview={this.context.showUrlPreview}
                    // ThreadView doesn't support IRC layout at this time
                    layout={this.state.layout === Layout.Bubble ? Layout.Bubble : Layout.Group}
                    hideThreadedMessages={false}
                    hidden={false}
                    showReactions={true}
                    className={messagePanelClassNames}
                    permalinkCreator={this.props.permalinkCreator}
                    membersLoaded={true}
                    editState={this.state.editState}
                    eventId={this.props.initialEvent?.getId()}
                    highlightedEventId={highlightedEventId}
                    eventScrollIntoView={this.props.initialEventScrollIntoView}
                    onEventScrolledIntoView={this.resetJumpToEvent}
                    onPaginationRequest={this.onPaginationRequest}
                />
            </>;
        } else {
            timeline = <div className="mx_RoomView_messagePanelSpinner">
                <Spinner />
            </div>;
        }

        return (
            <RoomContext.Provider value={{
                ...this.context,
                timelineRenderingType: TimelineRenderingType.Thread,
                threadId: this.state.thread?.id,
                liveTimeline: this.state?.thread?.timelineSet?.getLiveTimeline(),
                narrow: this.state.narrow,
            }}>
                <BaseCard
                    className="mx_ThreadView mx_ThreadPanel"
                    onClose={this.props.onClose}
                    withoutScrollContainer={true}
                    header={this.renderThreadViewHeader()}
                    ref={this.card}
                    onKeyDown={this.onKeyDown}
                    onBack={(ev: ButtonEvent) => {
                        PosthogTrackers.trackInteraction("WebThreadViewBackButton", ev);
                    }}
                >
                    <Measured
                        sensor={this.card.current}
                        onMeasurement={this.onMeasurement}
                    />
                    <div className="mx_ThreadView_timelinePanelWrapper">
                        { timeline }
                    </div>

                    { ContentMessages.sharedInstance().getCurrentUploads(threadRelation).length > 0 && (
                        <UploadBar room={this.props.room} relation={threadRelation} />
                    ) }

                    { this.state.thread?.timelineSet && (<MessageComposer
                        room={this.props.room}
                        resizeNotifier={this.props.resizeNotifier}
                        relation={threadRelation}
                        replyToEvent={this.state.replyToEvent}
                        permalinkCreator={this.props.permalinkCreator}
                        e2eStatus={this.props.e2eStatus}
                        compact={true}
                    />) }
                </BaseCard>
            </RoomContext.Provider>
        );
    }
}
