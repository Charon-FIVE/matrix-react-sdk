import React from 'react';
import { Room } from 'matrix-js-sdk/src/models/room';
import AutocompleteProvider from './AutocompleteProvider';
import QueryMatcher from './QueryMatcher';
import { ICompletion, ISelectionRange } from "./Autocompleter";
import { Command } from '../SlashCommands';
import { TimelineRenderingType } from '../contexts/RoomContext';
export default class CommandProvider extends AutocompleteProvider {
    matcher: QueryMatcher<Command>;
    constructor(room: Room, renderingType?: TimelineRenderingType);
    getCompletions(query: string, selection: ISelectionRange, force?: boolean, limit?: number): Promise<ICompletion[]>;
    getName(): string;
    renderCompletions(completions: React.ReactNode[]): React.ReactNode;
}
