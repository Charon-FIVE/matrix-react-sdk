import React, { ChangeEvent } from "react";
import { Room } from "matrix-js-sdk/src/models/room";
import { KNOWN_POLL_KIND } from "matrix-events-sdk";
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import ScrollableBaseModal, { IScrollableBaseState } from "../dialogs/ScrollableBaseModal";
import { IDialogProps } from "../dialogs/IDialogProps";
interface IProps extends IDialogProps {
    room: Room;
    threadId?: string;
    editingMxEvent?: MatrixEvent;
}
declare enum FocusTarget {
    Topic = 0,
    NewOption = 1
}
interface IState extends IScrollableBaseState {
    question: string;
    options: string[];
    busy: boolean;
    kind: KNOWN_POLL_KIND;
    autoFocusTarget: FocusTarget;
}
export default class PollCreateDialog extends ScrollableBaseModal<IProps, IState> {
    private addOptionRef;
    constructor(props: IProps);
    private checkCanSubmit;
    private onQuestionChange;
    private onOptionChange;
    private onOptionRemove;
    private onOptionAdd;
    private createEvent;
    protected submit(): void;
    protected cancel(): void;
    protected renderContent(): React.ReactNode;
    onPollTypeChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}
export {};
