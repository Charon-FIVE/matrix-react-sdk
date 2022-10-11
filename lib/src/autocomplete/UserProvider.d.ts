import React from 'react';
import { Room } from "matrix-js-sdk/src/models/room";
import { RoomMember } from "matrix-js-sdk/src/models/room-member";
import QueryMatcher from './QueryMatcher';
import AutocompleteProvider from './AutocompleteProvider';
import { ICompletion, ISelectionRange } from "./Autocompleter";
import { TimelineRenderingType } from '../contexts/RoomContext';
export default class UserProvider extends AutocompleteProvider {
    matcher: QueryMatcher<RoomMember>;
    users: RoomMember[];
    room: Room;
    constructor(room: Room, renderingType?: TimelineRenderingType);
    destroy(): void;
    private onRoomTimeline;
    private onRoomStateUpdate;
    getCompletions(rawQuery: string, selection: ISelectionRange, force?: boolean, limit?: number): Promise<ICompletion[]>;
    getName(): string;
    private makeUsers;
    onUserSpoke(user: RoomMember): void;
    renderCompletions(completions: React.ReactNode[]): React.ReactNode;
    shouldForceComplete(): boolean;
}
