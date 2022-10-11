import { IBaseSetting } from "../settings/Settings";
import { KeyCombo } from "../KeyBindingsManager";
export declare enum KeyBindingAction {
    /** Send a message */
    SendMessage = "KeyBinding.sendMessageInComposer",
    /** Go backwards through the send history and use the message in composer view */
    SelectPrevSendHistory = "KeyBinding.previousMessageInComposerHistory",
    /** Go forwards through the send history */
    SelectNextSendHistory = "KeyBinding.nextMessageInComposerHistory",
    /** Start editing the user's last sent message */
    EditPrevMessage = "KeyBinding.editPreviousMessage",
    /** Start editing the user's next sent message */
    EditNextMessage = "KeyBinding.editNextMessage",
    /** Cancel editing a message or cancel replying to a message */
    CancelReplyOrEdit = "KeyBinding.cancelReplyInComposer",
    /** Show the sticker picker */
    ShowStickerPicker = "KeyBinding.showStickerPicker",
    /** Set bold format the current selection */
    FormatBold = "KeyBinding.toggleBoldInComposer",
    /** Set italics format the current selection */
    FormatItalics = "KeyBinding.toggleItalicsInComposer",
    /** Insert link for current selection */
    FormatLink = "KeyBinding.FormatLink",
    /** Set code format for current selection */
    FormatCode = "KeyBinding.FormatCode",
    /** Format the current selection as quote */
    FormatQuote = "KeyBinding.toggleQuoteInComposer",
    /** Undo the last editing */
    EditUndo = "KeyBinding.editUndoInComposer",
    /** Redo editing */
    EditRedo = "KeyBinding.editRedoInComposer",
    /** Insert new line */
    NewLine = "KeyBinding.newLineInComposer",
    /** Move the cursor to the start of the message */
    MoveCursorToStart = "KeyBinding.jumpToStartInComposer",
    /** Move the cursor to the end of the message */
    MoveCursorToEnd = "KeyBinding.jumpToEndInComposer",
    /** Accepts chosen autocomplete selection */
    CompleteAutocomplete = "KeyBinding.completeAutocomplete",
    /** Accepts chosen autocomplete selection or,
     * if the autocompletion window is not shown, open the window and select the first selection */
    ForceCompleteAutocomplete = "KeyBinding.forceCompleteAutocomplete",
    /** Move to the previous autocomplete selection */
    PrevSelectionInAutocomplete = "KeyBinding.previousOptionInAutoComplete",
    /** Move to the next autocomplete selection */
    NextSelectionInAutocomplete = "KeyBinding.nextOptionInAutoComplete",
    /** Close the autocompletion window */
    CancelAutocomplete = "KeyBinding.cancelAutoComplete",
    /** Clear room list filter field */
    ClearRoomFilter = "KeyBinding.clearRoomFilter",
    /** Navigate up/down in the room list */
    PrevRoom = "KeyBinding.downerRoom",
    /** Navigate down in the room list */
    NextRoom = "KeyBinding.upperRoom",
    /** Select room from the room list */
    SelectRoomInRoomList = "KeyBinding.selectRoomInRoomList",
    /** Collapse room list section */
    CollapseRoomListSection = "KeyBinding.collapseSectionInRoomList",
    /** Expand room list section, if already expanded, jump to first room in the selection */
    ExpandRoomListSection = "KeyBinding.expandSectionInRoomList",
    /** Scroll up in the timeline */
    ScrollUp = "KeyBinding.scrollUpInTimeline",
    /** Scroll down in the timeline */
    ScrollDown = "KeyBinding.scrollDownInTimeline",
    /** Dismiss read marker and jump to bottom */
    DismissReadMarker = "KeyBinding.dismissReadMarkerAndJumpToBottom",
    /** Jump to oldest unread message */
    JumpToOldestUnread = "KeyBinding.jumpToOldestUnreadMessage",
    /** Upload a file */
    UploadFile = "KeyBinding.uploadFileToRoom",
    /** Focus search message in a room (must be enabled) */
    SearchInRoom = "KeyBinding.searchInRoom",
    /** Jump to the first (downloaded) message in the room */
    JumpToFirstMessage = "KeyBinding.jumpToFirstMessageInTimeline",
    /** Jump to the latest message in the room */
    JumpToLatestMessage = "KeyBinding.jumpToLastMessageInTimeline",
    /** Jump to room search (search for a room) */
    FilterRooms = "KeyBinding.filterRooms",
    /** Toggle the space panel */
    ToggleSpacePanel = "KeyBinding.toggleSpacePanel",
    /** Toggle the room side panel */
    ToggleRoomSidePanel = "KeyBinding.toggleRightPanel",
    /** Toggle the user menu */
    ToggleUserMenu = "KeyBinding.toggleTopLeftMenu",
    /** Toggle the short cut help dialog */
    ShowKeyboardSettings = "KeyBinding.showKeyBindingsSettings",
    /** Got to the Element home screen */
    GoToHome = "KeyBinding.goToHomeView",
    /** Select prev room */
    SelectPrevRoom = "KeyBinding.previousRoom",
    /** Select next room */
    SelectNextRoom = "KeyBinding.nextRoom",
    /** Select prev room with unread messages */
    SelectPrevUnreadRoom = "KeyBinding.previousUnreadRoom",
    /** Select next room with unread messages */
    SelectNextUnreadRoom = "KeyBinding.nextUnreadRoom",
    /** Switches to a space by number */
    SwitchToSpaceByNumber = "KeyBinding.switchToSpaceByNumber",
    /** Opens user settings */
    OpenUserSettings = "KeyBinding.openUserSettings",
    /** Navigates backward */
    PreviousVisitedRoomOrSpace = "KeyBinding.PreviousVisitedRoomOrSpace",
    /** Navigates forward */
    NextVisitedRoomOrSpace = "KeyBinding.NextVisitedRoomOrSpace",
    /** Toggles microphone while on a call */
    ToggleMicInCall = "KeyBinding.toggleMicInCall",
    /** Toggles webcam while on a call */
    ToggleWebcamInCall = "KeyBinding.toggleWebcamInCall",
    /** Accessibility actions */
    Escape = "KeyBinding.escape",
    Enter = "KeyBinding.enter",
    Space = "KeyBinding.space",
    Backspace = "KeyBinding.backspace",
    Delete = "KeyBinding.delete",
    Home = "KeyBinding.home",
    End = "KeyBinding.end",
    ArrowLeft = "KeyBinding.arrowLeft",
    ArrowUp = "KeyBinding.arrowUp",
    ArrowRight = "KeyBinding.arrowRight",
    ArrowDown = "KeyBinding.arrowDown",
    Tab = "KeyBinding.tab",
    Comma = "KeyBinding.comma",
    /** Toggle visibility of hidden events */
    ToggleHiddenEventVisibility = "KeyBinding.toggleHiddenEventVisibility"
}
declare type KeyboardShortcutSetting = IBaseSetting<KeyCombo>;
export declare type IKeyboardShortcuts = {
    [k in (KeyBindingAction)]?: KeyboardShortcutSetting;
};
export interface ICategory {
    categoryLabel?: string;
    settingNames: (KeyBindingAction)[];
}
export declare enum CategoryName {
    NAVIGATION = "Navigation",
    ACCESSIBILITY = "Accessibility",
    CALLS = "Calls",
    COMPOSER = "Composer",
    ROOM_LIST = "Room List",
    ROOM = "Room",
    AUTOCOMPLETE = "Autocomplete",
    LABS = "Labs"
}
export declare const DIGITS = "digits";
export declare const ALTERNATE_KEY_NAME: Record<string, string>;
export declare const KEY_ICON: Record<string, string>;
export declare const CATEGORIES: Record<CategoryName, ICategory>;
export declare const DESKTOP_SHORTCUTS: KeyBindingAction[];
export declare const MAC_ONLY_SHORTCUTS: KeyBindingAction[];
export declare const KEYBOARD_SHORTCUTS: IKeyboardShortcuts;
export {};
