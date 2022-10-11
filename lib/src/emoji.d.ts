export interface IEmoji {
    label: string;
    group?: number;
    hexcode: string;
    order?: number;
    shortcodes: string[];
    tags?: string[];
    unicode: string;
    skins?: Omit<IEmoji, "shortcodes" | "tags">[];
    emoticon?: string | string[];
}
export declare const EMOTICON_TO_EMOJI: Map<string, IEmoji>;
export declare const getEmojiFromUnicode: (unicode: any) => IEmoji;
export declare const DATA_BY_CATEGORY: {
    people: any[];
    nature: any[];
    foods: any[];
    places: any[];
    activity: any[];
    objects: any[];
    symbols: any[];
    flags: any[];
};
export declare const EMOJI: IEmoji[];
