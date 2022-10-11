import { MatrixClient } from "matrix-js-sdk/src/client";
import { RoomMember } from "matrix-js-sdk/src/models/room-member";
import { Room } from "matrix-js-sdk/src/models/room";
import AutocompleteWrapperModel, { GetAutocompleterComponent, UpdateCallback, UpdateQuery } from "./autocomplete";
interface ISerializedPart {
    type: Type.Plain | Type.Newline | Type.Emoji | Type.Command | Type.PillCandidate;
    text: string;
}
interface ISerializedPillPart {
    type: Type.AtRoomPill | Type.RoomPill | Type.UserPill;
    text: string;
    resourceId?: string;
}
export declare type SerializedPart = ISerializedPart | ISerializedPillPart;
export declare enum Type {
    Plain = "plain",
    Newline = "newline",
    Emoji = "emoji",
    Command = "command",
    UserPill = "user-pill",
    RoomPill = "room-pill",
    AtRoomPill = "at-room-pill",
    PillCandidate = "pill-candidate"
}
interface IBasePart {
    text: string;
    type: Type.Plain | Type.Newline | Type.Emoji;
    canEdit: boolean;
    acceptsCaret: boolean;
    createAutoComplete(updateCallback: UpdateCallback): void;
    serialize(): SerializedPart;
    remove(offset: number, len: number): string | undefined;
    split(offset: number): IBasePart;
    validateAndInsert(offset: number, str: string, inputType: string): boolean;
    appendUntilRejected(str: string, inputType: string): string | undefined;
    updateDOMNode(node: Node): void;
    canUpdateDOMNode(node: Node): boolean;
    toDOMNode(): Node;
}
interface IPillCandidatePart extends Omit<IBasePart, "type" | "createAutoComplete"> {
    type: Type.PillCandidate | Type.Command;
    createAutoComplete(updateCallback: UpdateCallback): AutocompleteWrapperModel;
}
interface IPillPart extends Omit<IBasePart, "type" | "resourceId"> {
    type: Type.AtRoomPill | Type.RoomPill | Type.UserPill;
    resourceId: string;
}
export declare type Part = IBasePart | IPillCandidatePart | IPillPart;
declare abstract class BasePart {
    protected _text: string;
    constructor(text?: string);
    protected acceptsInsertion(chr: string, offset: number, inputType: string): boolean;
    protected acceptsRemoval(position: number, chr: string): boolean;
    merge(part: Part): boolean;
    split(offset: number): IBasePart;
    remove(offset: number, len: number): string | undefined;
    appendUntilRejected(str: string, inputType: string): string | undefined;
    validateAndInsert(offset: number, str: string, inputType: string): boolean;
    createAutoComplete(updateCallback: UpdateCallback): void;
    protected trim(len: number): string;
    get text(): string;
    abstract get type(): Type;
    get canEdit(): boolean;
    get acceptsCaret(): boolean;
    toString(): string;
    serialize(): SerializedPart;
    abstract updateDOMNode(node: Node): void;
    abstract canUpdateDOMNode(node: Node): boolean;
    abstract toDOMNode(): Node;
}
declare abstract class PlainBasePart extends BasePart {
    protected acceptsInsertion(chr: string, offset: number, inputType: string): boolean;
    toDOMNode(): Node;
    merge(part: any): boolean;
    updateDOMNode(node: Node): void;
    canUpdateDOMNode(node: Node): boolean;
}
export declare class PlainPart extends PlainBasePart implements IBasePart {
    get type(): IBasePart["type"];
}
export declare abstract class PillPart extends BasePart implements IPillPart {
    resourceId: string;
    constructor(resourceId: string, label: any);
    protected acceptsInsertion(chr: string): boolean;
    protected acceptsRemoval(position: number, chr: string): boolean;
    toDOMNode(): Node;
    updateDOMNode(node: HTMLElement): void;
    canUpdateDOMNode(node: HTMLElement): boolean;
    protected setAvatarVars(node: HTMLElement, avatarUrl: string, initialLetter: string): void;
    serialize(): ISerializedPillPart;
    get canEdit(): boolean;
    abstract get type(): IPillPart["type"];
    protected abstract get className(): string;
    protected onClick?: () => void;
    protected abstract setAvatar(node: HTMLElement): void;
}
declare class NewlinePart extends BasePart implements IBasePart {
    protected acceptsInsertion(chr: string, offset: number): boolean;
    protected acceptsRemoval(position: number, chr: string): boolean;
    toDOMNode(): Node;
    merge(): boolean;
    updateDOMNode(): void;
    canUpdateDOMNode(node: HTMLElement): boolean;
    get type(): IBasePart["type"];
    get canEdit(): boolean;
}
export declare class EmojiPart extends BasePart implements IBasePart {
    protected acceptsInsertion(chr: string, offset: number): boolean;
    protected acceptsRemoval(position: number, chr: string): boolean;
    toDOMNode(): Node;
    updateDOMNode(node: HTMLElement): void;
    canUpdateDOMNode(node: HTMLElement): boolean;
    get type(): IBasePart["type"];
    get canEdit(): boolean;
    get acceptsCaret(): boolean;
}
declare class RoomPillPart extends PillPart {
    private room;
    constructor(resourceId: string, label: string, room: Room);
    protected setAvatar(node: HTMLElement): void;
    get type(): IPillPart["type"];
    protected get className(): string;
}
declare class AtRoomPillPart extends RoomPillPart {
    constructor(text: string, room: Room);
    get type(): IPillPart["type"];
    serialize(): ISerializedPillPart;
}
declare class UserPillPart extends PillPart {
    private member;
    constructor(userId: any, displayName: any, member: RoomMember);
    get type(): IPillPart["type"];
    protected get className(): string;
    protected setAvatar(node: HTMLElement): void;
    protected onClick: () => void;
}
declare class PillCandidatePart extends PlainBasePart implements IPillCandidatePart {
    private autoCompleteCreator;
    constructor(text: string, autoCompleteCreator: IAutocompleteCreator);
    createAutoComplete(updateCallback: UpdateCallback): AutocompleteWrapperModel;
    protected acceptsInsertion(chr: string, offset: number, inputType: string): boolean;
    merge(): boolean;
    protected acceptsRemoval(position: number, chr: string): boolean;
    get type(): IPillCandidatePart["type"];
}
export declare function getAutoCompleteCreator(getAutocompleterComponent: GetAutocompleterComponent, updateQuery: UpdateQuery): (partCreator: PartCreator) => (updateCallback: UpdateCallback) => AutocompleteWrapperModel;
declare type AutoCompleteCreator = ReturnType<typeof getAutoCompleteCreator>;
interface IAutocompleteCreator {
    create(updateCallback: UpdateCallback): AutocompleteWrapperModel;
}
export declare class PartCreator {
    private readonly room;
    private readonly client;
    protected readonly autoCompleteCreator: IAutocompleteCreator;
    constructor(room: Room, client: MatrixClient, autoCompleteCreator?: AutoCompleteCreator);
    setAutoCompleteCreator(autoCompleteCreator: AutoCompleteCreator): void;
    createPartForInput(input: string, partIndex: number, inputType?: string): Part;
    createDefaultPart(text: string): Part;
    deserializePart(part: SerializedPart): Part;
    plain(text: string): PlainPart;
    newline(): NewlinePart;
    emoji(text: string): EmojiPart;
    pillCandidate(text: string): PillCandidatePart;
    roomPill(alias: string, roomId?: string): RoomPillPart;
    atRoomPill(text: string): AtRoomPillPart;
    userPill(displayName: string, userId: string): UserPillPart;
    plainWithEmoji(text: string): (PlainPart | EmojiPart)[];
    createMentionParts(insertTrailingCharacter: boolean, displayName: string, userId: string): [UserPillPart, PlainPart];
}
export declare class CommandPartCreator extends PartCreator {
    createPartForInput(text: string, partIndex: number): Part;
    command(text: string): CommandPart;
    deserializePart(part: SerializedPart): Part;
}
declare class CommandPart extends PillCandidatePart {
    get type(): IPillCandidatePart["type"];
}
export {};
