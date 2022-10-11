import React from 'react';
import { IEmoji } from "../../../emoji";
export declare const CATEGORY_HEADER_HEIGHT = 20;
export declare const EMOJI_HEIGHT = 35;
export declare const EMOJIS_PER_ROW = 8;
interface IProps {
    selectedEmojis?: Set<string>;
    showQuickReactions?: boolean;
    onChoose(unicode: string): boolean;
    isEmojiDisabled?: (unicode: string) => boolean;
}
interface IState {
    filter: string;
    previewEmoji?: IEmoji;
    scrollTop: number;
    viewportHeight: number;
}
declare class EmojiPicker extends React.Component<IProps, IState> {
    private readonly recentlyUsed;
    private readonly memoizedDataByCategory;
    private readonly categories;
    private scrollRef;
    constructor(props: IProps);
    private onScroll;
    private updateVisibility;
    private scrollToCategory;
    private onChangeFilter;
    private emojiMatchesFilter;
    private onEnterFilter;
    private onHoverEmoji;
    private onHoverEmojiEnd;
    private onClickEmoji;
    private static categoryHeightForEmojiCount;
    render(): JSX.Element;
}
export default EmojiPicker;
