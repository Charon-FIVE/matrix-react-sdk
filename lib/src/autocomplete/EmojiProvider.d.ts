import React from 'react';
import { Room } from 'matrix-js-sdk/src/models/room';
import AutocompleteProvider from './AutocompleteProvider';
import QueryMatcher from './QueryMatcher';
import { ICompletion, ISelectionRange } from './Autocompleter';
import { IEmoji } from '../emoji';
import { TimelineRenderingType } from '../contexts/RoomContext';
interface ISortedEmoji {
    emoji: IEmoji;
    _orderBy: number;
}
export default class EmojiProvider extends AutocompleteProvider {
    matcher: QueryMatcher<ISortedEmoji>;
    nameMatcher: QueryMatcher<ISortedEmoji>;
    private readonly recentlyUsed;
    constructor(room: Room, renderingType?: TimelineRenderingType);
    getCompletions(query: string, selection: ISelectionRange, force?: boolean, limit?: number): Promise<ICompletion[]>;
    getName(): string;
    renderCompletions(completions: React.ReactNode[]): React.ReactNode;
}
export {};
