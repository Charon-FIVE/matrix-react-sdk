import React from 'react';
import { MatrixEvent } from "matrix-js-sdk/src/models/event";
import { Relations } from 'matrix-js-sdk/src/models/relations';
import { MatrixClient } from 'matrix-js-sdk/src/matrix';
import { RelatedRelations } from "matrix-js-sdk/src/models/related-relations";
import { IBodyProps } from "./IBodyProps";
import MatrixClientContext from "../../../contexts/MatrixClientContext";
import { GetRelationsForEvent } from "../rooms/EventTile";
interface IState {
    selected?: string;
    voteRelations: RelatedRelations;
    endRelations: RelatedRelations;
}
export declare function createVoteRelations(getRelationsForEvent: (eventId: string, relationType: string, eventType: string) => Relations, eventId: string): RelatedRelations;
export declare function findTopAnswer(pollEvent: MatrixEvent, matrixClient: MatrixClient, getRelationsForEvent?: (eventId: string, relationType: string, eventType: string) => Relations): string;
export declare function isPollEnded(pollEvent: MatrixEvent, matrixClient: MatrixClient, getRelationsForEvent?: (eventId: string, relationType: string, eventType: string) => Relations): boolean;
export declare function pollAlreadyHasVotes(mxEvent: MatrixEvent, getRelationsForEvent?: GetRelationsForEvent): boolean;
export declare function launchPollEditor(mxEvent: MatrixEvent, getRelationsForEvent?: GetRelationsForEvent): void;
export default class MPollBody extends React.Component<IBodyProps, IState> {
    static contextType: React.Context<MatrixClient>;
    context: React.ContextType<typeof MatrixClientContext>;
    private seenEventIds;
    private voteRelationsReceived;
    private endRelationsReceived;
    constructor(props: IBodyProps);
    componentWillUnmount(): void;
    private addListeners;
    private removeListeners;
    private onRelationsCreated;
    private onRelationsChange;
    private selectOption;
    private onOptionSelected;
    private fetchVoteRelations;
    private fetchEndRelations;
    private fetchRelations;
    /**
     * @returns userId -> UserVote
     */
    private collectUserVotes;
    /**
     * If we've just received a new event that we hadn't seen
     * before, and that event is me voting (e.g. from a different
     * device) then forget when the local user selected.
     *
     * Either way, calls setState to update our list of events we
     * have already seen.
     */
    private unselectIfNewEventFromMe;
    private totalVotes;
    private isEnded;
    render(): JSX.Element;
}
export declare class UserVote {
    readonly ts: number;
    readonly sender: string;
    readonly answers: string[];
    constructor(ts: number, sender: string, answers: string[]);
}
export declare function allVotes(pollEvent: MatrixEvent, matrixClient: MatrixClient, voteRelations: RelatedRelations, endRelations: RelatedRelations): Array<UserVote>;
/**
 * Returns the earliest timestamp from the supplied list of end_poll events
 * or null if there are no authorised events.
 */
export declare function pollEndTs(pollEvent: MatrixEvent, matrixClient: MatrixClient, endRelations: RelatedRelations): number | null;
export {};
