"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MAC_ONLY_SHORTCUTS = exports.KeyBindingAction = exports.KEY_ICON = exports.KEYBOARD_SHORTCUTS = exports.DIGITS = exports.DESKTOP_SHORTCUTS = exports.CategoryName = exports.CATEGORIES = exports.ALTERNATE_KEY_NAME = void 0;

var _languageHandler = require("../languageHandler");

var _Keyboard = require("../Keyboard");

/*
Copyright 2020 The Matrix.org Foundation C.I.C.
Copyright 2022 The Matrix.org Foundation C.I.C.
Copyright 2021 - 2022 Šimon Brandner <simon.bra.ag@gmail.com>

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
let KeyBindingAction;
exports.KeyBindingAction = KeyBindingAction;

(function (KeyBindingAction) {
  KeyBindingAction["SendMessage"] = "KeyBinding.sendMessageInComposer";
  KeyBindingAction["SelectPrevSendHistory"] = "KeyBinding.previousMessageInComposerHistory";
  KeyBindingAction["SelectNextSendHistory"] = "KeyBinding.nextMessageInComposerHistory";
  KeyBindingAction["EditPrevMessage"] = "KeyBinding.editPreviousMessage";
  KeyBindingAction["EditNextMessage"] = "KeyBinding.editNextMessage";
  KeyBindingAction["CancelReplyOrEdit"] = "KeyBinding.cancelReplyInComposer";
  KeyBindingAction["ShowStickerPicker"] = "KeyBinding.showStickerPicker";
  KeyBindingAction["FormatBold"] = "KeyBinding.toggleBoldInComposer";
  KeyBindingAction["FormatItalics"] = "KeyBinding.toggleItalicsInComposer";
  KeyBindingAction["FormatLink"] = "KeyBinding.FormatLink";
  KeyBindingAction["FormatCode"] = "KeyBinding.FormatCode";
  KeyBindingAction["FormatQuote"] = "KeyBinding.toggleQuoteInComposer";
  KeyBindingAction["EditUndo"] = "KeyBinding.editUndoInComposer";
  KeyBindingAction["EditRedo"] = "KeyBinding.editRedoInComposer";
  KeyBindingAction["NewLine"] = "KeyBinding.newLineInComposer";
  KeyBindingAction["MoveCursorToStart"] = "KeyBinding.jumpToStartInComposer";
  KeyBindingAction["MoveCursorToEnd"] = "KeyBinding.jumpToEndInComposer";
  KeyBindingAction["CompleteAutocomplete"] = "KeyBinding.completeAutocomplete";
  KeyBindingAction["ForceCompleteAutocomplete"] = "KeyBinding.forceCompleteAutocomplete";
  KeyBindingAction["PrevSelectionInAutocomplete"] = "KeyBinding.previousOptionInAutoComplete";
  KeyBindingAction["NextSelectionInAutocomplete"] = "KeyBinding.nextOptionInAutoComplete";
  KeyBindingAction["CancelAutocomplete"] = "KeyBinding.cancelAutoComplete";
  KeyBindingAction["ClearRoomFilter"] = "KeyBinding.clearRoomFilter";
  KeyBindingAction["PrevRoom"] = "KeyBinding.downerRoom";
  KeyBindingAction["NextRoom"] = "KeyBinding.upperRoom";
  KeyBindingAction["SelectRoomInRoomList"] = "KeyBinding.selectRoomInRoomList";
  KeyBindingAction["CollapseRoomListSection"] = "KeyBinding.collapseSectionInRoomList";
  KeyBindingAction["ExpandRoomListSection"] = "KeyBinding.expandSectionInRoomList";
  KeyBindingAction["ScrollUp"] = "KeyBinding.scrollUpInTimeline";
  KeyBindingAction["ScrollDown"] = "KeyBinding.scrollDownInTimeline";
  KeyBindingAction["DismissReadMarker"] = "KeyBinding.dismissReadMarkerAndJumpToBottom";
  KeyBindingAction["JumpToOldestUnread"] = "KeyBinding.jumpToOldestUnreadMessage";
  KeyBindingAction["UploadFile"] = "KeyBinding.uploadFileToRoom";
  KeyBindingAction["SearchInRoom"] = "KeyBinding.searchInRoom";
  KeyBindingAction["JumpToFirstMessage"] = "KeyBinding.jumpToFirstMessageInTimeline";
  KeyBindingAction["JumpToLatestMessage"] = "KeyBinding.jumpToLastMessageInTimeline";
  KeyBindingAction["FilterRooms"] = "KeyBinding.filterRooms";
  KeyBindingAction["ToggleSpacePanel"] = "KeyBinding.toggleSpacePanel";
  KeyBindingAction["ToggleRoomSidePanel"] = "KeyBinding.toggleRightPanel";
  KeyBindingAction["ToggleUserMenu"] = "KeyBinding.toggleTopLeftMenu";
  KeyBindingAction["ShowKeyboardSettings"] = "KeyBinding.showKeyBindingsSettings";
  KeyBindingAction["GoToHome"] = "KeyBinding.goToHomeView";
  KeyBindingAction["SelectPrevRoom"] = "KeyBinding.previousRoom";
  KeyBindingAction["SelectNextRoom"] = "KeyBinding.nextRoom";
  KeyBindingAction["SelectPrevUnreadRoom"] = "KeyBinding.previousUnreadRoom";
  KeyBindingAction["SelectNextUnreadRoom"] = "KeyBinding.nextUnreadRoom";
  KeyBindingAction["SwitchToSpaceByNumber"] = "KeyBinding.switchToSpaceByNumber";
  KeyBindingAction["OpenUserSettings"] = "KeyBinding.openUserSettings";
  KeyBindingAction["PreviousVisitedRoomOrSpace"] = "KeyBinding.PreviousVisitedRoomOrSpace";
  KeyBindingAction["NextVisitedRoomOrSpace"] = "KeyBinding.NextVisitedRoomOrSpace";
  KeyBindingAction["ToggleMicInCall"] = "KeyBinding.toggleMicInCall";
  KeyBindingAction["ToggleWebcamInCall"] = "KeyBinding.toggleWebcamInCall";
  KeyBindingAction["Escape"] = "KeyBinding.escape";
  KeyBindingAction["Enter"] = "KeyBinding.enter";
  KeyBindingAction["Space"] = "KeyBinding.space";
  KeyBindingAction["Backspace"] = "KeyBinding.backspace";
  KeyBindingAction["Delete"] = "KeyBinding.delete";
  KeyBindingAction["Home"] = "KeyBinding.home";
  KeyBindingAction["End"] = "KeyBinding.end";
  KeyBindingAction["ArrowLeft"] = "KeyBinding.arrowLeft";
  KeyBindingAction["ArrowUp"] = "KeyBinding.arrowUp";
  KeyBindingAction["ArrowRight"] = "KeyBinding.arrowRight";
  KeyBindingAction["ArrowDown"] = "KeyBinding.arrowDown";
  KeyBindingAction["Tab"] = "KeyBinding.tab";
  KeyBindingAction["Comma"] = "KeyBinding.comma";
  KeyBindingAction["ToggleHiddenEventVisibility"] = "KeyBinding.toggleHiddenEventVisibility";
})(KeyBindingAction || (exports.KeyBindingAction = KeyBindingAction = {}));

let CategoryName; // Meta-key representing the digits [0-9] often found at the top of standard keyboard layouts

exports.CategoryName = CategoryName;

(function (CategoryName) {
  CategoryName["NAVIGATION"] = "Navigation";
  CategoryName["ACCESSIBILITY"] = "Accessibility";
  CategoryName["CALLS"] = "Calls";
  CategoryName["COMPOSER"] = "Composer";
  CategoryName["ROOM_LIST"] = "Room List";
  CategoryName["ROOM"] = "Room";
  CategoryName["AUTOCOMPLETE"] = "Autocomplete";
  CategoryName["LABS"] = "Labs";
})(CategoryName || (exports.CategoryName = CategoryName = {}));

const DIGITS = "digits";
exports.DIGITS = DIGITS;
const ALTERNATE_KEY_NAME = {
  [_Keyboard.Key.PAGE_UP]: (0, _languageHandler._td)("Page Up"),
  [_Keyboard.Key.PAGE_DOWN]: (0, _languageHandler._td)("Page Down"),
  [_Keyboard.Key.ESCAPE]: (0, _languageHandler._td)("Esc"),
  [_Keyboard.Key.ENTER]: (0, _languageHandler._td)("Enter"),
  [_Keyboard.Key.SPACE]: (0, _languageHandler._td)("Space"),
  [_Keyboard.Key.HOME]: (0, _languageHandler._td)("Home"),
  [_Keyboard.Key.END]: (0, _languageHandler._td)("End"),
  [_Keyboard.Key.ALT]: (0, _languageHandler._td)("Alt"),
  [_Keyboard.Key.CONTROL]: (0, _languageHandler._td)("Ctrl"),
  [_Keyboard.Key.SHIFT]: (0, _languageHandler._td)("Shift"),
  [DIGITS]: (0, _languageHandler._td)("[number]")
};
exports.ALTERNATE_KEY_NAME = ALTERNATE_KEY_NAME;
const KEY_ICON = {
  [_Keyboard.Key.ARROW_UP]: "↑",
  [_Keyboard.Key.ARROW_DOWN]: "↓",
  [_Keyboard.Key.ARROW_LEFT]: "←",
  [_Keyboard.Key.ARROW_RIGHT]: "→"
};
exports.KEY_ICON = KEY_ICON;

if (_Keyboard.IS_MAC) {
  KEY_ICON[_Keyboard.Key.META] = "⌘";
  KEY_ICON[_Keyboard.Key.ALT] = "⌥";
}

const CATEGORIES = {
  [CategoryName.COMPOSER]: {
    categoryLabel: (0, _languageHandler._td)("Composer"),
    settingNames: [KeyBindingAction.SendMessage, KeyBindingAction.NewLine, KeyBindingAction.FormatBold, KeyBindingAction.FormatItalics, KeyBindingAction.FormatQuote, KeyBindingAction.FormatLink, KeyBindingAction.FormatCode, KeyBindingAction.EditUndo, KeyBindingAction.EditRedo, KeyBindingAction.MoveCursorToStart, KeyBindingAction.MoveCursorToEnd, KeyBindingAction.CancelReplyOrEdit, KeyBindingAction.EditNextMessage, KeyBindingAction.EditPrevMessage, KeyBindingAction.SelectNextSendHistory, KeyBindingAction.SelectPrevSendHistory, KeyBindingAction.ShowStickerPicker]
  },
  [CategoryName.CALLS]: {
    categoryLabel: (0, _languageHandler._td)("Calls"),
    settingNames: [KeyBindingAction.ToggleMicInCall, KeyBindingAction.ToggleWebcamInCall]
  },
  [CategoryName.ROOM]: {
    categoryLabel: (0, _languageHandler._td)("Room"),
    settingNames: [KeyBindingAction.SearchInRoom, KeyBindingAction.UploadFile, KeyBindingAction.DismissReadMarker, KeyBindingAction.JumpToOldestUnread, KeyBindingAction.ScrollUp, KeyBindingAction.ScrollDown, KeyBindingAction.JumpToFirstMessage, KeyBindingAction.JumpToLatestMessage]
  },
  [CategoryName.ROOM_LIST]: {
    categoryLabel: (0, _languageHandler._td)("Room List"),
    settingNames: [KeyBindingAction.SelectRoomInRoomList, KeyBindingAction.ClearRoomFilter, KeyBindingAction.CollapseRoomListSection, KeyBindingAction.ExpandRoomListSection, KeyBindingAction.NextRoom, KeyBindingAction.PrevRoom]
  },
  [CategoryName.ACCESSIBILITY]: {
    categoryLabel: (0, _languageHandler._td)("Accessibility"),
    settingNames: [KeyBindingAction.Escape, KeyBindingAction.Enter, KeyBindingAction.Space, KeyBindingAction.Backspace, KeyBindingAction.Delete, KeyBindingAction.Home, KeyBindingAction.End, KeyBindingAction.ArrowLeft, KeyBindingAction.ArrowUp, KeyBindingAction.ArrowRight, KeyBindingAction.ArrowDown, KeyBindingAction.Comma]
  },
  [CategoryName.NAVIGATION]: {
    categoryLabel: (0, _languageHandler._td)("Navigation"),
    settingNames: [KeyBindingAction.ToggleUserMenu, KeyBindingAction.ToggleRoomSidePanel, KeyBindingAction.ToggleSpacePanel, KeyBindingAction.ShowKeyboardSettings, KeyBindingAction.GoToHome, KeyBindingAction.FilterRooms, KeyBindingAction.SelectNextUnreadRoom, KeyBindingAction.SelectPrevUnreadRoom, KeyBindingAction.SelectNextRoom, KeyBindingAction.SelectPrevRoom, KeyBindingAction.OpenUserSettings, KeyBindingAction.SwitchToSpaceByNumber, KeyBindingAction.PreviousVisitedRoomOrSpace, KeyBindingAction.NextVisitedRoomOrSpace]
  },
  [CategoryName.AUTOCOMPLETE]: {
    categoryLabel: (0, _languageHandler._td)("Autocomplete"),
    settingNames: [KeyBindingAction.CancelAutocomplete, KeyBindingAction.NextSelectionInAutocomplete, KeyBindingAction.PrevSelectionInAutocomplete, KeyBindingAction.CompleteAutocomplete, KeyBindingAction.ForceCompleteAutocomplete]
  },
  [CategoryName.LABS]: {
    categoryLabel: (0, _languageHandler._td)("Labs"),
    settingNames: [KeyBindingAction.ToggleHiddenEventVisibility]
  }
};
exports.CATEGORIES = CATEGORIES;
const DESKTOP_SHORTCUTS = [KeyBindingAction.OpenUserSettings, KeyBindingAction.SwitchToSpaceByNumber, KeyBindingAction.PreviousVisitedRoomOrSpace, KeyBindingAction.NextVisitedRoomOrSpace];
exports.DESKTOP_SHORTCUTS = DESKTOP_SHORTCUTS;
const MAC_ONLY_SHORTCUTS = [KeyBindingAction.OpenUserSettings]; // This is very intentionally modelled after SETTINGS as it will make it easier
// to implement customizable keyboard shortcuts
// TODO: TravisR will fix this nightmare when the new version of the SettingsStore becomes a thing
// XXX: Exported for tests

exports.MAC_ONLY_SHORTCUTS = MAC_ONLY_SHORTCUTS;
const KEYBOARD_SHORTCUTS = {
  [KeyBindingAction.FormatBold]: {
    default: {
      ctrlOrCmdKey: true,
      key: _Keyboard.Key.B
    },
    displayName: (0, _languageHandler._td)("Toggle Bold")
  },
  [KeyBindingAction.FormatItalics]: {
    default: {
      ctrlOrCmdKey: true,
      key: _Keyboard.Key.I
    },
    displayName: (0, _languageHandler._td)("Toggle Italics")
  },
  [KeyBindingAction.FormatQuote]: {
    default: {
      ctrlOrCmdKey: true,
      key: _Keyboard.Key.GREATER_THAN
    },
    displayName: (0, _languageHandler._td)("Toggle Quote")
  },
  [KeyBindingAction.FormatCode]: {
    default: {
      ctrlOrCmdKey: true,
      key: _Keyboard.Key.E
    },
    displayName: (0, _languageHandler._td)("Toggle Code Block")
  },
  [KeyBindingAction.FormatLink]: {
    default: {
      ctrlOrCmdKey: true,
      shiftKey: true,
      key: _Keyboard.Key.L
    },
    displayName: (0, _languageHandler._td)("Toggle Link")
  },
  [KeyBindingAction.CancelReplyOrEdit]: {
    default: {
      key: _Keyboard.Key.ESCAPE
    },
    displayName: (0, _languageHandler._td)("Cancel replying to a message")
  },
  [KeyBindingAction.EditNextMessage]: {
    default: {
      key: _Keyboard.Key.ARROW_DOWN
    },
    displayName: (0, _languageHandler._td)("Navigate to next message to edit")
  },
  [KeyBindingAction.EditPrevMessage]: {
    default: {
      key: _Keyboard.Key.ARROW_UP
    },
    displayName: (0, _languageHandler._td)("Navigate to previous message to edit")
  },
  [KeyBindingAction.MoveCursorToStart]: {
    default: {
      ctrlOrCmdKey: true,
      key: _Keyboard.Key.HOME
    },
    displayName: (0, _languageHandler._td)("Jump to start of the composer")
  },
  [KeyBindingAction.MoveCursorToEnd]: {
    default: {
      ctrlOrCmdKey: true,
      key: _Keyboard.Key.END
    },
    displayName: (0, _languageHandler._td)("Jump to end of the composer")
  },
  [KeyBindingAction.SelectNextSendHistory]: {
    default: {
      altKey: true,
      ctrlKey: true,
      key: _Keyboard.Key.ARROW_DOWN
    },
    displayName: (0, _languageHandler._td)("Navigate to next message in composer history")
  },
  [KeyBindingAction.SelectPrevSendHistory]: {
    default: {
      altKey: true,
      ctrlKey: true,
      key: _Keyboard.Key.ARROW_UP
    },
    displayName: (0, _languageHandler._td)("Navigate to previous message in composer history")
  },
  [KeyBindingAction.ShowStickerPicker]: {
    default: {
      ctrlOrCmdKey: true,
      key: _Keyboard.Key.SEMICOLON
    },
    displayName: (0, _languageHandler._td)("Send a sticker")
  },
  [KeyBindingAction.ToggleMicInCall]: {
    default: {
      ctrlOrCmdKey: true,
      key: _Keyboard.Key.D
    },
    displayName: (0, _languageHandler._td)("Toggle microphone mute")
  },
  [KeyBindingAction.ToggleWebcamInCall]: {
    default: {
      ctrlOrCmdKey: true,
      key: _Keyboard.Key.E
    },
    displayName: (0, _languageHandler._td)("Toggle webcam on/off")
  },
  [KeyBindingAction.DismissReadMarker]: {
    default: {
      key: _Keyboard.Key.ESCAPE
    },
    displayName: (0, _languageHandler._td)("Dismiss read marker and jump to bottom")
  },
  [KeyBindingAction.JumpToOldestUnread]: {
    default: {
      shiftKey: true,
      key: _Keyboard.Key.PAGE_UP
    },
    displayName: (0, _languageHandler._td)("Jump to oldest unread message")
  },
  [KeyBindingAction.UploadFile]: {
    default: {
      ctrlOrCmdKey: true,
      shiftKey: true,
      key: _Keyboard.Key.U
    },
    displayName: (0, _languageHandler._td)("Upload a file")
  },
  [KeyBindingAction.ScrollUp]: {
    default: {
      key: _Keyboard.Key.PAGE_UP
    },
    displayName: (0, _languageHandler._td)("Scroll up in the timeline")
  },
  [KeyBindingAction.ScrollDown]: {
    default: {
      key: _Keyboard.Key.PAGE_DOWN
    },
    displayName: (0, _languageHandler._td)("Scroll down in the timeline")
  },
  [KeyBindingAction.FilterRooms]: {
    default: {
      ctrlOrCmdKey: true,
      key: _Keyboard.Key.K
    },
    displayName: (0, _languageHandler._td)("Jump to room search")
  },
  [KeyBindingAction.SelectRoomInRoomList]: {
    default: {
      key: _Keyboard.Key.ENTER
    },
    displayName: (0, _languageHandler._td)("Select room from the room list")
  },
  [KeyBindingAction.CollapseRoomListSection]: {
    default: {
      key: _Keyboard.Key.ARROW_LEFT
    },
    displayName: (0, _languageHandler._td)("Collapse room list section")
  },
  [KeyBindingAction.ExpandRoomListSection]: {
    default: {
      key: _Keyboard.Key.ARROW_RIGHT
    },
    displayName: (0, _languageHandler._td)("Expand room list section")
  },
  [KeyBindingAction.NextRoom]: {
    default: {
      key: _Keyboard.Key.ARROW_DOWN
    },
    displayName: (0, _languageHandler._td)("Navigate down in the room list")
  },
  [KeyBindingAction.PrevRoom]: {
    default: {
      key: _Keyboard.Key.ARROW_UP
    },
    displayName: (0, _languageHandler._td)("Navigate up in the room list")
  },
  [KeyBindingAction.ToggleUserMenu]: {
    default: {
      ctrlOrCmdKey: true,
      key: _Keyboard.Key.BACKTICK
    },
    displayName: (0, _languageHandler._td)("Toggle the top left menu")
  },
  [KeyBindingAction.ToggleRoomSidePanel]: {
    default: {
      ctrlOrCmdKey: true,
      key: _Keyboard.Key.PERIOD
    },
    displayName: (0, _languageHandler._td)("Toggle right panel")
  },
  [KeyBindingAction.ShowKeyboardSettings]: {
    default: {
      ctrlOrCmdKey: true,
      key: _Keyboard.Key.SLASH
    },
    displayName: (0, _languageHandler._td)("Open this settings tab")
  },
  [KeyBindingAction.GoToHome]: {
    default: {
      ctrlOrCmdKey: true,
      altKey: !_Keyboard.IS_MAC,
      shiftKey: _Keyboard.IS_MAC,
      key: _Keyboard.Key.H
    },
    displayName: (0, _languageHandler._td)("Go to Home View")
  },
  [KeyBindingAction.SelectNextUnreadRoom]: {
    default: {
      shiftKey: true,
      altKey: true,
      key: _Keyboard.Key.ARROW_DOWN
    },
    displayName: (0, _languageHandler._td)("Next unread room or DM")
  },
  [KeyBindingAction.SelectPrevUnreadRoom]: {
    default: {
      shiftKey: true,
      altKey: true,
      key: _Keyboard.Key.ARROW_UP
    },
    displayName: (0, _languageHandler._td)("Previous unread room or DM")
  },
  [KeyBindingAction.SelectNextRoom]: {
    default: {
      altKey: true,
      key: _Keyboard.Key.ARROW_DOWN
    },
    displayName: (0, _languageHandler._td)("Next room or DM")
  },
  [KeyBindingAction.SelectPrevRoom]: {
    default: {
      altKey: true,
      key: _Keyboard.Key.ARROW_UP
    },
    displayName: (0, _languageHandler._td)("Previous room or DM")
  },
  [KeyBindingAction.CancelAutocomplete]: {
    default: {
      key: _Keyboard.Key.ESCAPE
    },
    displayName: (0, _languageHandler._td)("Cancel autocomplete")
  },
  [KeyBindingAction.NextSelectionInAutocomplete]: {
    default: {
      key: _Keyboard.Key.ARROW_DOWN
    },
    displayName: (0, _languageHandler._td)("Next autocomplete suggestion")
  },
  [KeyBindingAction.PrevSelectionInAutocomplete]: {
    default: {
      key: _Keyboard.Key.ARROW_UP
    },
    displayName: (0, _languageHandler._td)("Previous autocomplete suggestion")
  },
  [KeyBindingAction.ToggleSpacePanel]: {
    default: {
      ctrlOrCmdKey: true,
      shiftKey: true,
      key: _Keyboard.Key.D
    },
    displayName: (0, _languageHandler._td)("Toggle space panel")
  },
  [KeyBindingAction.ToggleHiddenEventVisibility]: {
    default: {
      ctrlOrCmdKey: true,
      shiftKey: true,
      key: _Keyboard.Key.H
    },
    displayName: (0, _languageHandler._td)("Toggle hidden event visibility")
  },
  [KeyBindingAction.JumpToFirstMessage]: {
    default: {
      key: _Keyboard.Key.HOME,
      ctrlKey: true
    },
    displayName: (0, _languageHandler._td)("Jump to first message")
  },
  [KeyBindingAction.JumpToLatestMessage]: {
    default: {
      key: _Keyboard.Key.END,
      ctrlKey: true
    },
    displayName: (0, _languageHandler._td)("Jump to last message")
  },
  [KeyBindingAction.EditUndo]: {
    default: {
      key: _Keyboard.Key.Z,
      ctrlOrCmdKey: true
    },
    displayName: (0, _languageHandler._td)("Undo edit")
  },
  [KeyBindingAction.EditRedo]: {
    default: {
      key: _Keyboard.IS_MAC ? _Keyboard.Key.Z : _Keyboard.Key.Y,
      ctrlOrCmdKey: true,
      shiftKey: _Keyboard.IS_MAC
    },
    displayName: (0, _languageHandler._td)("Redo edit")
  },
  [KeyBindingAction.PreviousVisitedRoomOrSpace]: {
    default: {
      metaKey: _Keyboard.IS_MAC,
      altKey: !_Keyboard.IS_MAC,
      key: _Keyboard.IS_MAC ? _Keyboard.Key.SQUARE_BRACKET_LEFT : _Keyboard.Key.ARROW_LEFT
    },
    displayName: (0, _languageHandler._td)("Previous recently visited room or space")
  },
  [KeyBindingAction.NextVisitedRoomOrSpace]: {
    default: {
      metaKey: _Keyboard.IS_MAC,
      altKey: !_Keyboard.IS_MAC,
      key: _Keyboard.IS_MAC ? _Keyboard.Key.SQUARE_BRACKET_RIGHT : _Keyboard.Key.ARROW_RIGHT
    },
    displayName: (0, _languageHandler._td)("Next recently visited room or space")
  },
  [KeyBindingAction.SwitchToSpaceByNumber]: {
    default: {
      ctrlOrCmdKey: true,
      key: DIGITS
    },
    displayName: (0, _languageHandler._td)("Switch to space by number")
  },
  [KeyBindingAction.OpenUserSettings]: {
    default: {
      metaKey: true,
      key: _Keyboard.Key.COMMA
    },
    displayName: (0, _languageHandler._td)("Open user settings")
  },
  [KeyBindingAction.Escape]: {
    default: {
      key: _Keyboard.Key.ESCAPE
    },
    displayName: (0, _languageHandler._td)("Close dialog or context menu")
  },
  [KeyBindingAction.Enter]: {
    default: {
      key: _Keyboard.Key.ENTER
    },
    displayName: (0, _languageHandler._td)("Activate selected button")
  },
  [KeyBindingAction.Space]: {
    default: {
      key: _Keyboard.Key.SPACE
    }
  },
  [KeyBindingAction.Backspace]: {
    default: {
      key: _Keyboard.Key.BACKSPACE
    }
  },
  [KeyBindingAction.Delete]: {
    default: {
      key: _Keyboard.Key.DELETE
    }
  },
  [KeyBindingAction.Home]: {
    default: {
      key: _Keyboard.Key.HOME
    }
  },
  [KeyBindingAction.End]: {
    default: {
      key: _Keyboard.Key.END
    }
  },
  [KeyBindingAction.ArrowLeft]: {
    default: {
      key: _Keyboard.Key.ARROW_LEFT
    }
  },
  [KeyBindingAction.ArrowUp]: {
    default: {
      key: _Keyboard.Key.ARROW_UP
    }
  },
  [KeyBindingAction.ArrowRight]: {
    default: {
      key: _Keyboard.Key.ARROW_RIGHT
    }
  },
  [KeyBindingAction.ArrowDown]: {
    default: {
      key: _Keyboard.Key.ARROW_DOWN
    }
  },
  [KeyBindingAction.Comma]: {
    default: {
      key: _Keyboard.Key.COMMA
    }
  }
};
exports.KEYBOARD_SHORTCUTS = KEYBOARD_SHORTCUTS;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJLZXlCaW5kaW5nQWN0aW9uIiwiQ2F0ZWdvcnlOYW1lIiwiRElHSVRTIiwiQUxURVJOQVRFX0tFWV9OQU1FIiwiS2V5IiwiUEFHRV9VUCIsIl90ZCIsIlBBR0VfRE9XTiIsIkVTQ0FQRSIsIkVOVEVSIiwiU1BBQ0UiLCJIT01FIiwiRU5EIiwiQUxUIiwiQ09OVFJPTCIsIlNISUZUIiwiS0VZX0lDT04iLCJBUlJPV19VUCIsIkFSUk9XX0RPV04iLCJBUlJPV19MRUZUIiwiQVJST1dfUklHSFQiLCJJU19NQUMiLCJNRVRBIiwiQ0FURUdPUklFUyIsIkNPTVBPU0VSIiwiY2F0ZWdvcnlMYWJlbCIsInNldHRpbmdOYW1lcyIsIlNlbmRNZXNzYWdlIiwiTmV3TGluZSIsIkZvcm1hdEJvbGQiLCJGb3JtYXRJdGFsaWNzIiwiRm9ybWF0UXVvdGUiLCJGb3JtYXRMaW5rIiwiRm9ybWF0Q29kZSIsIkVkaXRVbmRvIiwiRWRpdFJlZG8iLCJNb3ZlQ3Vyc29yVG9TdGFydCIsIk1vdmVDdXJzb3JUb0VuZCIsIkNhbmNlbFJlcGx5T3JFZGl0IiwiRWRpdE5leHRNZXNzYWdlIiwiRWRpdFByZXZNZXNzYWdlIiwiU2VsZWN0TmV4dFNlbmRIaXN0b3J5IiwiU2VsZWN0UHJldlNlbmRIaXN0b3J5IiwiU2hvd1N0aWNrZXJQaWNrZXIiLCJDQUxMUyIsIlRvZ2dsZU1pY0luQ2FsbCIsIlRvZ2dsZVdlYmNhbUluQ2FsbCIsIlJPT00iLCJTZWFyY2hJblJvb20iLCJVcGxvYWRGaWxlIiwiRGlzbWlzc1JlYWRNYXJrZXIiLCJKdW1wVG9PbGRlc3RVbnJlYWQiLCJTY3JvbGxVcCIsIlNjcm9sbERvd24iLCJKdW1wVG9GaXJzdE1lc3NhZ2UiLCJKdW1wVG9MYXRlc3RNZXNzYWdlIiwiUk9PTV9MSVNUIiwiU2VsZWN0Um9vbUluUm9vbUxpc3QiLCJDbGVhclJvb21GaWx0ZXIiLCJDb2xsYXBzZVJvb21MaXN0U2VjdGlvbiIsIkV4cGFuZFJvb21MaXN0U2VjdGlvbiIsIk5leHRSb29tIiwiUHJldlJvb20iLCJBQ0NFU1NJQklMSVRZIiwiRXNjYXBlIiwiRW50ZXIiLCJTcGFjZSIsIkJhY2tzcGFjZSIsIkRlbGV0ZSIsIkhvbWUiLCJFbmQiLCJBcnJvd0xlZnQiLCJBcnJvd1VwIiwiQXJyb3dSaWdodCIsIkFycm93RG93biIsIkNvbW1hIiwiTkFWSUdBVElPTiIsIlRvZ2dsZVVzZXJNZW51IiwiVG9nZ2xlUm9vbVNpZGVQYW5lbCIsIlRvZ2dsZVNwYWNlUGFuZWwiLCJTaG93S2V5Ym9hcmRTZXR0aW5ncyIsIkdvVG9Ib21lIiwiRmlsdGVyUm9vbXMiLCJTZWxlY3ROZXh0VW5yZWFkUm9vbSIsIlNlbGVjdFByZXZVbnJlYWRSb29tIiwiU2VsZWN0TmV4dFJvb20iLCJTZWxlY3RQcmV2Um9vbSIsIk9wZW5Vc2VyU2V0dGluZ3MiLCJTd2l0Y2hUb1NwYWNlQnlOdW1iZXIiLCJQcmV2aW91c1Zpc2l0ZWRSb29tT3JTcGFjZSIsIk5leHRWaXNpdGVkUm9vbU9yU3BhY2UiLCJBVVRPQ09NUExFVEUiLCJDYW5jZWxBdXRvY29tcGxldGUiLCJOZXh0U2VsZWN0aW9uSW5BdXRvY29tcGxldGUiLCJQcmV2U2VsZWN0aW9uSW5BdXRvY29tcGxldGUiLCJDb21wbGV0ZUF1dG9jb21wbGV0ZSIsIkZvcmNlQ29tcGxldGVBdXRvY29tcGxldGUiLCJMQUJTIiwiVG9nZ2xlSGlkZGVuRXZlbnRWaXNpYmlsaXR5IiwiREVTS1RPUF9TSE9SVENVVFMiLCJNQUNfT05MWV9TSE9SVENVVFMiLCJLRVlCT0FSRF9TSE9SVENVVFMiLCJkZWZhdWx0IiwiY3RybE9yQ21kS2V5Iiwia2V5IiwiQiIsImRpc3BsYXlOYW1lIiwiSSIsIkdSRUFURVJfVEhBTiIsIkUiLCJzaGlmdEtleSIsIkwiLCJhbHRLZXkiLCJjdHJsS2V5IiwiU0VNSUNPTE9OIiwiRCIsIlUiLCJLIiwiQkFDS1RJQ0siLCJQRVJJT0QiLCJTTEFTSCIsIkgiLCJaIiwiWSIsIm1ldGFLZXkiLCJTUVVBUkVfQlJBQ0tFVF9MRUZUIiwiU1FVQVJFX0JSQUNLRVRfUklHSFQiLCJDT01NQSIsIkJBQ0tTUEFDRSIsIkRFTEVURSJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hY2Nlc3NpYmlsaXR5L0tleWJvYXJkU2hvcnRjdXRzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuQ29weXJpZ2h0IDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cbkNvcHlyaWdodCAyMDIxIC0gMjAyMiDFoGltb24gQnJhbmRuZXIgPHNpbW9uLmJyYS5hZ0BnbWFpbC5jb20+XG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgX3RkIH0gZnJvbSBcIi4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IHsgSVNfTUFDLCBLZXkgfSBmcm9tIFwiLi4vS2V5Ym9hcmRcIjtcbmltcG9ydCB7IElCYXNlU2V0dGluZyB9IGZyb20gXCIuLi9zZXR0aW5ncy9TZXR0aW5nc1wiO1xuaW1wb3J0IHsgS2V5Q29tYm8gfSBmcm9tIFwiLi4vS2V5QmluZGluZ3NNYW5hZ2VyXCI7XG5cbmV4cG9ydCBlbnVtIEtleUJpbmRpbmdBY3Rpb24ge1xuICAgIC8qKiBTZW5kIGEgbWVzc2FnZSAqL1xuICAgIFNlbmRNZXNzYWdlID0gJ0tleUJpbmRpbmcuc2VuZE1lc3NhZ2VJbkNvbXBvc2VyJyxcbiAgICAvKiogR28gYmFja3dhcmRzIHRocm91Z2ggdGhlIHNlbmQgaGlzdG9yeSBhbmQgdXNlIHRoZSBtZXNzYWdlIGluIGNvbXBvc2VyIHZpZXcgKi9cbiAgICBTZWxlY3RQcmV2U2VuZEhpc3RvcnkgPSAnS2V5QmluZGluZy5wcmV2aW91c01lc3NhZ2VJbkNvbXBvc2VySGlzdG9yeScsXG4gICAgLyoqIEdvIGZvcndhcmRzIHRocm91Z2ggdGhlIHNlbmQgaGlzdG9yeSAqL1xuICAgIFNlbGVjdE5leHRTZW5kSGlzdG9yeSA9ICdLZXlCaW5kaW5nLm5leHRNZXNzYWdlSW5Db21wb3Nlckhpc3RvcnknLFxuICAgIC8qKiBTdGFydCBlZGl0aW5nIHRoZSB1c2VyJ3MgbGFzdCBzZW50IG1lc3NhZ2UgKi9cbiAgICBFZGl0UHJldk1lc3NhZ2UgPSAnS2V5QmluZGluZy5lZGl0UHJldmlvdXNNZXNzYWdlJyxcbiAgICAvKiogU3RhcnQgZWRpdGluZyB0aGUgdXNlcidzIG5leHQgc2VudCBtZXNzYWdlICovXG4gICAgRWRpdE5leHRNZXNzYWdlID0gJ0tleUJpbmRpbmcuZWRpdE5leHRNZXNzYWdlJyxcbiAgICAvKiogQ2FuY2VsIGVkaXRpbmcgYSBtZXNzYWdlIG9yIGNhbmNlbCByZXBseWluZyB0byBhIG1lc3NhZ2UgKi9cbiAgICBDYW5jZWxSZXBseU9yRWRpdCA9ICdLZXlCaW5kaW5nLmNhbmNlbFJlcGx5SW5Db21wb3NlcicsXG4gICAgLyoqIFNob3cgdGhlIHN0aWNrZXIgcGlja2VyICovXG4gICAgU2hvd1N0aWNrZXJQaWNrZXIgPSAnS2V5QmluZGluZy5zaG93U3RpY2tlclBpY2tlcicsXG5cbiAgICAvKiogU2V0IGJvbGQgZm9ybWF0IHRoZSBjdXJyZW50IHNlbGVjdGlvbiAqL1xuICAgIEZvcm1hdEJvbGQgPSAnS2V5QmluZGluZy50b2dnbGVCb2xkSW5Db21wb3NlcicsXG4gICAgLyoqIFNldCBpdGFsaWNzIGZvcm1hdCB0aGUgY3VycmVudCBzZWxlY3Rpb24gKi9cbiAgICBGb3JtYXRJdGFsaWNzID0gJ0tleUJpbmRpbmcudG9nZ2xlSXRhbGljc0luQ29tcG9zZXInLFxuICAgIC8qKiBJbnNlcnQgbGluayBmb3IgY3VycmVudCBzZWxlY3Rpb24gKi9cbiAgICBGb3JtYXRMaW5rID0gJ0tleUJpbmRpbmcuRm9ybWF0TGluaycsXG4gICAgLyoqIFNldCBjb2RlIGZvcm1hdCBmb3IgY3VycmVudCBzZWxlY3Rpb24gKi9cbiAgICBGb3JtYXRDb2RlID0gJ0tleUJpbmRpbmcuRm9ybWF0Q29kZScsXG4gICAgLyoqIEZvcm1hdCB0aGUgY3VycmVudCBzZWxlY3Rpb24gYXMgcXVvdGUgKi9cbiAgICBGb3JtYXRRdW90ZSA9ICdLZXlCaW5kaW5nLnRvZ2dsZVF1b3RlSW5Db21wb3NlcicsXG4gICAgLyoqIFVuZG8gdGhlIGxhc3QgZWRpdGluZyAqL1xuICAgIEVkaXRVbmRvID0gJ0tleUJpbmRpbmcuZWRpdFVuZG9JbkNvbXBvc2VyJyxcbiAgICAvKiogUmVkbyBlZGl0aW5nICovXG4gICAgRWRpdFJlZG8gPSAnS2V5QmluZGluZy5lZGl0UmVkb0luQ29tcG9zZXInLFxuICAgIC8qKiBJbnNlcnQgbmV3IGxpbmUgKi9cbiAgICBOZXdMaW5lID0gJ0tleUJpbmRpbmcubmV3TGluZUluQ29tcG9zZXInLFxuICAgIC8qKiBNb3ZlIHRoZSBjdXJzb3IgdG8gdGhlIHN0YXJ0IG9mIHRoZSBtZXNzYWdlICovXG4gICAgTW92ZUN1cnNvclRvU3RhcnQgPSAnS2V5QmluZGluZy5qdW1wVG9TdGFydEluQ29tcG9zZXInLFxuICAgIC8qKiBNb3ZlIHRoZSBjdXJzb3IgdG8gdGhlIGVuZCBvZiB0aGUgbWVzc2FnZSAqL1xuICAgIE1vdmVDdXJzb3JUb0VuZCA9ICdLZXlCaW5kaW5nLmp1bXBUb0VuZEluQ29tcG9zZXInLFxuXG4gICAgLyoqIEFjY2VwdHMgY2hvc2VuIGF1dG9jb21wbGV0ZSBzZWxlY3Rpb24gKi9cbiAgICBDb21wbGV0ZUF1dG9jb21wbGV0ZSA9ICdLZXlCaW5kaW5nLmNvbXBsZXRlQXV0b2NvbXBsZXRlJyxcbiAgICAvKiogQWNjZXB0cyBjaG9zZW4gYXV0b2NvbXBsZXRlIHNlbGVjdGlvbiBvcixcbiAgICAgKiBpZiB0aGUgYXV0b2NvbXBsZXRpb24gd2luZG93IGlzIG5vdCBzaG93biwgb3BlbiB0aGUgd2luZG93IGFuZCBzZWxlY3QgdGhlIGZpcnN0IHNlbGVjdGlvbiAqL1xuICAgIEZvcmNlQ29tcGxldGVBdXRvY29tcGxldGUgPSAnS2V5QmluZGluZy5mb3JjZUNvbXBsZXRlQXV0b2NvbXBsZXRlJyxcbiAgICAvKiogTW92ZSB0byB0aGUgcHJldmlvdXMgYXV0b2NvbXBsZXRlIHNlbGVjdGlvbiAqL1xuICAgIFByZXZTZWxlY3Rpb25JbkF1dG9jb21wbGV0ZSA9ICdLZXlCaW5kaW5nLnByZXZpb3VzT3B0aW9uSW5BdXRvQ29tcGxldGUnLFxuICAgIC8qKiBNb3ZlIHRvIHRoZSBuZXh0IGF1dG9jb21wbGV0ZSBzZWxlY3Rpb24gKi9cbiAgICBOZXh0U2VsZWN0aW9uSW5BdXRvY29tcGxldGUgPSAnS2V5QmluZGluZy5uZXh0T3B0aW9uSW5BdXRvQ29tcGxldGUnLFxuICAgIC8qKiBDbG9zZSB0aGUgYXV0b2NvbXBsZXRpb24gd2luZG93ICovXG4gICAgQ2FuY2VsQXV0b2NvbXBsZXRlID0gJ0tleUJpbmRpbmcuY2FuY2VsQXV0b0NvbXBsZXRlJyxcblxuICAgIC8qKiBDbGVhciByb29tIGxpc3QgZmlsdGVyIGZpZWxkICovXG4gICAgQ2xlYXJSb29tRmlsdGVyID0gJ0tleUJpbmRpbmcuY2xlYXJSb29tRmlsdGVyJyxcbiAgICAvKiogTmF2aWdhdGUgdXAvZG93biBpbiB0aGUgcm9vbSBsaXN0ICovXG4gICAgUHJldlJvb20gPSAnS2V5QmluZGluZy5kb3duZXJSb29tJyxcbiAgICAvKiogTmF2aWdhdGUgZG93biBpbiB0aGUgcm9vbSBsaXN0ICovXG4gICAgTmV4dFJvb20gPSAnS2V5QmluZGluZy51cHBlclJvb20nLFxuICAgIC8qKiBTZWxlY3Qgcm9vbSBmcm9tIHRoZSByb29tIGxpc3QgKi9cbiAgICBTZWxlY3RSb29tSW5Sb29tTGlzdCA9ICdLZXlCaW5kaW5nLnNlbGVjdFJvb21JblJvb21MaXN0JyxcbiAgICAvKiogQ29sbGFwc2Ugcm9vbSBsaXN0IHNlY3Rpb24gKi9cbiAgICBDb2xsYXBzZVJvb21MaXN0U2VjdGlvbiA9ICdLZXlCaW5kaW5nLmNvbGxhcHNlU2VjdGlvbkluUm9vbUxpc3QnLFxuICAgIC8qKiBFeHBhbmQgcm9vbSBsaXN0IHNlY3Rpb24sIGlmIGFscmVhZHkgZXhwYW5kZWQsIGp1bXAgdG8gZmlyc3Qgcm9vbSBpbiB0aGUgc2VsZWN0aW9uICovXG4gICAgRXhwYW5kUm9vbUxpc3RTZWN0aW9uID0gJ0tleUJpbmRpbmcuZXhwYW5kU2VjdGlvbkluUm9vbUxpc3QnLFxuXG4gICAgLyoqIFNjcm9sbCB1cCBpbiB0aGUgdGltZWxpbmUgKi9cbiAgICBTY3JvbGxVcCA9ICdLZXlCaW5kaW5nLnNjcm9sbFVwSW5UaW1lbGluZScsXG4gICAgLyoqIFNjcm9sbCBkb3duIGluIHRoZSB0aW1lbGluZSAqL1xuICAgIFNjcm9sbERvd24gPSAnS2V5QmluZGluZy5zY3JvbGxEb3duSW5UaW1lbGluZScsXG4gICAgLyoqIERpc21pc3MgcmVhZCBtYXJrZXIgYW5kIGp1bXAgdG8gYm90dG9tICovXG4gICAgRGlzbWlzc1JlYWRNYXJrZXIgPSAnS2V5QmluZGluZy5kaXNtaXNzUmVhZE1hcmtlckFuZEp1bXBUb0JvdHRvbScsXG4gICAgLyoqIEp1bXAgdG8gb2xkZXN0IHVucmVhZCBtZXNzYWdlICovXG4gICAgSnVtcFRvT2xkZXN0VW5yZWFkID0gJ0tleUJpbmRpbmcuanVtcFRvT2xkZXN0VW5yZWFkTWVzc2FnZScsXG4gICAgLyoqIFVwbG9hZCBhIGZpbGUgKi9cbiAgICBVcGxvYWRGaWxlID0gJ0tleUJpbmRpbmcudXBsb2FkRmlsZVRvUm9vbScsXG4gICAgLyoqIEZvY3VzIHNlYXJjaCBtZXNzYWdlIGluIGEgcm9vbSAobXVzdCBiZSBlbmFibGVkKSAqL1xuICAgIFNlYXJjaEluUm9vbSA9ICdLZXlCaW5kaW5nLnNlYXJjaEluUm9vbScsXG4gICAgLyoqIEp1bXAgdG8gdGhlIGZpcnN0IChkb3dubG9hZGVkKSBtZXNzYWdlIGluIHRoZSByb29tICovXG4gICAgSnVtcFRvRmlyc3RNZXNzYWdlID0gJ0tleUJpbmRpbmcuanVtcFRvRmlyc3RNZXNzYWdlSW5UaW1lbGluZScsXG4gICAgLyoqIEp1bXAgdG8gdGhlIGxhdGVzdCBtZXNzYWdlIGluIHRoZSByb29tICovXG4gICAgSnVtcFRvTGF0ZXN0TWVzc2FnZSA9ICdLZXlCaW5kaW5nLmp1bXBUb0xhc3RNZXNzYWdlSW5UaW1lbGluZScsXG5cbiAgICAvKiogSnVtcCB0byByb29tIHNlYXJjaCAoc2VhcmNoIGZvciBhIHJvb20pICovXG4gICAgRmlsdGVyUm9vbXMgPSAnS2V5QmluZGluZy5maWx0ZXJSb29tcycsXG4gICAgLyoqIFRvZ2dsZSB0aGUgc3BhY2UgcGFuZWwgKi9cbiAgICBUb2dnbGVTcGFjZVBhbmVsID0gJ0tleUJpbmRpbmcudG9nZ2xlU3BhY2VQYW5lbCcsXG4gICAgLyoqIFRvZ2dsZSB0aGUgcm9vbSBzaWRlIHBhbmVsICovXG4gICAgVG9nZ2xlUm9vbVNpZGVQYW5lbCA9ICdLZXlCaW5kaW5nLnRvZ2dsZVJpZ2h0UGFuZWwnLFxuICAgIC8qKiBUb2dnbGUgdGhlIHVzZXIgbWVudSAqL1xuICAgIFRvZ2dsZVVzZXJNZW51ID0gJ0tleUJpbmRpbmcudG9nZ2xlVG9wTGVmdE1lbnUnLFxuICAgIC8qKiBUb2dnbGUgdGhlIHNob3J0IGN1dCBoZWxwIGRpYWxvZyAqL1xuICAgIFNob3dLZXlib2FyZFNldHRpbmdzID0gJ0tleUJpbmRpbmcuc2hvd0tleUJpbmRpbmdzU2V0dGluZ3MnLFxuICAgIC8qKiBHb3QgdG8gdGhlIEVsZW1lbnQgaG9tZSBzY3JlZW4gKi9cbiAgICBHb1RvSG9tZSA9ICdLZXlCaW5kaW5nLmdvVG9Ib21lVmlldycsXG4gICAgLyoqIFNlbGVjdCBwcmV2IHJvb20gKi9cbiAgICBTZWxlY3RQcmV2Um9vbSA9ICdLZXlCaW5kaW5nLnByZXZpb3VzUm9vbScsXG4gICAgLyoqIFNlbGVjdCBuZXh0IHJvb20gKi9cbiAgICBTZWxlY3ROZXh0Um9vbSA9ICdLZXlCaW5kaW5nLm5leHRSb29tJyxcbiAgICAvKiogU2VsZWN0IHByZXYgcm9vbSB3aXRoIHVucmVhZCBtZXNzYWdlcyAqL1xuICAgIFNlbGVjdFByZXZVbnJlYWRSb29tID0gJ0tleUJpbmRpbmcucHJldmlvdXNVbnJlYWRSb29tJyxcbiAgICAvKiogU2VsZWN0IG5leHQgcm9vbSB3aXRoIHVucmVhZCBtZXNzYWdlcyAqL1xuICAgIFNlbGVjdE5leHRVbnJlYWRSb29tID0gJ0tleUJpbmRpbmcubmV4dFVucmVhZFJvb20nLFxuXG4gICAgLyoqIFN3aXRjaGVzIHRvIGEgc3BhY2UgYnkgbnVtYmVyICovXG4gICAgU3dpdGNoVG9TcGFjZUJ5TnVtYmVyID0gXCJLZXlCaW5kaW5nLnN3aXRjaFRvU3BhY2VCeU51bWJlclwiLFxuICAgIC8qKiBPcGVucyB1c2VyIHNldHRpbmdzICovXG4gICAgT3BlblVzZXJTZXR0aW5ncyA9IFwiS2V5QmluZGluZy5vcGVuVXNlclNldHRpbmdzXCIsXG4gICAgLyoqIE5hdmlnYXRlcyBiYWNrd2FyZCAqL1xuICAgIFByZXZpb3VzVmlzaXRlZFJvb21PclNwYWNlID0gXCJLZXlCaW5kaW5nLlByZXZpb3VzVmlzaXRlZFJvb21PclNwYWNlXCIsXG4gICAgLyoqIE5hdmlnYXRlcyBmb3J3YXJkICovXG4gICAgTmV4dFZpc2l0ZWRSb29tT3JTcGFjZSA9IFwiS2V5QmluZGluZy5OZXh0VmlzaXRlZFJvb21PclNwYWNlXCIsXG5cbiAgICAvKiogVG9nZ2xlcyBtaWNyb3Bob25lIHdoaWxlIG9uIGEgY2FsbCAqL1xuICAgIFRvZ2dsZU1pY0luQ2FsbCA9IFwiS2V5QmluZGluZy50b2dnbGVNaWNJbkNhbGxcIixcbiAgICAvKiogVG9nZ2xlcyB3ZWJjYW0gd2hpbGUgb24gYSBjYWxsICovXG4gICAgVG9nZ2xlV2ViY2FtSW5DYWxsID0gXCJLZXlCaW5kaW5nLnRvZ2dsZVdlYmNhbUluQ2FsbFwiLFxuXG4gICAgLyoqIEFjY2Vzc2liaWxpdHkgYWN0aW9ucyAqL1xuICAgIEVzY2FwZSA9IFwiS2V5QmluZGluZy5lc2NhcGVcIixcbiAgICBFbnRlciA9IFwiS2V5QmluZGluZy5lbnRlclwiLFxuICAgIFNwYWNlID0gXCJLZXlCaW5kaW5nLnNwYWNlXCIsXG4gICAgQmFja3NwYWNlID0gXCJLZXlCaW5kaW5nLmJhY2tzcGFjZVwiLFxuICAgIERlbGV0ZSA9IFwiS2V5QmluZGluZy5kZWxldGVcIixcbiAgICBIb21lID0gXCJLZXlCaW5kaW5nLmhvbWVcIixcbiAgICBFbmQgPSBcIktleUJpbmRpbmcuZW5kXCIsXG4gICAgQXJyb3dMZWZ0ID0gXCJLZXlCaW5kaW5nLmFycm93TGVmdFwiLFxuICAgIEFycm93VXAgPSBcIktleUJpbmRpbmcuYXJyb3dVcFwiLFxuICAgIEFycm93UmlnaHQgPSBcIktleUJpbmRpbmcuYXJyb3dSaWdodFwiLFxuICAgIEFycm93RG93biA9IFwiS2V5QmluZGluZy5hcnJvd0Rvd25cIixcbiAgICBUYWIgPSBcIktleUJpbmRpbmcudGFiXCIsXG4gICAgQ29tbWEgPSBcIktleUJpbmRpbmcuY29tbWFcIixcblxuICAgIC8qKiBUb2dnbGUgdmlzaWJpbGl0eSBvZiBoaWRkZW4gZXZlbnRzICovXG4gICAgVG9nZ2xlSGlkZGVuRXZlbnRWaXNpYmlsaXR5ID0gJ0tleUJpbmRpbmcudG9nZ2xlSGlkZGVuRXZlbnRWaXNpYmlsaXR5Jyxcbn1cblxudHlwZSBLZXlib2FyZFNob3J0Y3V0U2V0dGluZyA9IElCYXNlU2V0dGluZzxLZXlDb21ibz47XG5cbmV4cG9ydCB0eXBlIElLZXlib2FyZFNob3J0Y3V0cyA9IHtcbiAgICAvLyBUT0RPOiBXZSBzaG91bGQgZmlndXJlIG91dCB3aGF0IHRvIGRvIHdpdGggdGhlIGtleWJvYXJkIHNob3J0Y3V0cyB0aGF0IGFyZSBub3QgaGFuZGxlZCBieSBLZXliaW5kaW5nTWFuYWdlclxuICAgIFtrIGluIChLZXlCaW5kaW5nQWN0aW9uKV0/OiBLZXlib2FyZFNob3J0Y3V0U2V0dGluZztcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUNhdGVnb3J5IHtcbiAgICBjYXRlZ29yeUxhYmVsPzogc3RyaW5nO1xuICAgIC8vIFRPRE86IFdlIHNob3VsZCBmaWd1cmUgb3V0IHdoYXQgdG8gZG8gd2l0aCB0aGUga2V5Ym9hcmQgc2hvcnRjdXRzIHRoYXQgYXJlIG5vdCBoYW5kbGVkIGJ5IEtleWJpbmRpbmdNYW5hZ2VyXG4gICAgc2V0dGluZ05hbWVzOiAoS2V5QmluZGluZ0FjdGlvbilbXTtcbn1cblxuZXhwb3J0IGVudW0gQ2F0ZWdvcnlOYW1lIHtcbiAgICBOQVZJR0FUSU9OID0gXCJOYXZpZ2F0aW9uXCIsXG4gICAgQUNDRVNTSUJJTElUWSA9IFwiQWNjZXNzaWJpbGl0eVwiLFxuICAgIENBTExTID0gXCJDYWxsc1wiLFxuICAgIENPTVBPU0VSID0gXCJDb21wb3NlclwiLFxuICAgIFJPT01fTElTVCA9IFwiUm9vbSBMaXN0XCIsXG4gICAgUk9PTSA9IFwiUm9vbVwiLFxuICAgIEFVVE9DT01QTEVURSA9IFwiQXV0b2NvbXBsZXRlXCIsXG4gICAgTEFCUyA9IFwiTGFic1wiLFxufVxuXG4vLyBNZXRhLWtleSByZXByZXNlbnRpbmcgdGhlIGRpZ2l0cyBbMC05XSBvZnRlbiBmb3VuZCBhdCB0aGUgdG9wIG9mIHN0YW5kYXJkIGtleWJvYXJkIGxheW91dHNcbmV4cG9ydCBjb25zdCBESUdJVFMgPSBcImRpZ2l0c1wiO1xuXG5leHBvcnQgY29uc3QgQUxURVJOQVRFX0tFWV9OQU1FOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICAgIFtLZXkuUEFHRV9VUF06IF90ZChcIlBhZ2UgVXBcIiksXG4gICAgW0tleS5QQUdFX0RPV05dOiBfdGQoXCJQYWdlIERvd25cIiksXG4gICAgW0tleS5FU0NBUEVdOiBfdGQoXCJFc2NcIiksXG4gICAgW0tleS5FTlRFUl06IF90ZChcIkVudGVyXCIpLFxuICAgIFtLZXkuU1BBQ0VdOiBfdGQoXCJTcGFjZVwiKSxcbiAgICBbS2V5LkhPTUVdOiBfdGQoXCJIb21lXCIpLFxuICAgIFtLZXkuRU5EXTogX3RkKFwiRW5kXCIpLFxuICAgIFtLZXkuQUxUXTogX3RkKFwiQWx0XCIpLFxuICAgIFtLZXkuQ09OVFJPTF06IF90ZChcIkN0cmxcIiksXG4gICAgW0tleS5TSElGVF06IF90ZChcIlNoaWZ0XCIpLFxuICAgIFtESUdJVFNdOiBfdGQoXCJbbnVtYmVyXVwiKSxcbn07XG5leHBvcnQgY29uc3QgS0VZX0lDT046IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgW0tleS5BUlJPV19VUF06IFwi4oaRXCIsXG4gICAgW0tleS5BUlJPV19ET1dOXTogXCLihpNcIixcbiAgICBbS2V5LkFSUk9XX0xFRlRdOiBcIuKGkFwiLFxuICAgIFtLZXkuQVJST1dfUklHSFRdOiBcIuKGklwiLFxufTtcbmlmIChJU19NQUMpIHtcbiAgICBLRVlfSUNPTltLZXkuTUVUQV0gPSBcIuKMmFwiO1xuICAgIEtFWV9JQ09OW0tleS5BTFRdID0gXCLijKVcIjtcbn1cblxuZXhwb3J0IGNvbnN0IENBVEVHT1JJRVM6IFJlY29yZDxDYXRlZ29yeU5hbWUsIElDYXRlZ29yeT4gPSB7XG4gICAgW0NhdGVnb3J5TmFtZS5DT01QT1NFUl06IHtcbiAgICAgICAgY2F0ZWdvcnlMYWJlbDogX3RkKFwiQ29tcG9zZXJcIiksXG4gICAgICAgIHNldHRpbmdOYW1lczogW1xuICAgICAgICAgICAgS2V5QmluZGluZ0FjdGlvbi5TZW5kTWVzc2FnZSxcbiAgICAgICAgICAgIEtleUJpbmRpbmdBY3Rpb24uTmV3TGluZSxcbiAgICAgICAgICAgIEtleUJpbmRpbmdBY3Rpb24uRm9ybWF0Qm9sZCxcbiAgICAgICAgICAgIEtleUJpbmRpbmdBY3Rpb24uRm9ybWF0SXRhbGljcyxcbiAgICAgICAgICAgIEtleUJpbmRpbmdBY3Rpb24uRm9ybWF0UXVvdGUsXG4gICAgICAgICAgICBLZXlCaW5kaW5nQWN0aW9uLkZvcm1hdExpbmssXG4gICAgICAgICAgICBLZXlCaW5kaW5nQWN0aW9uLkZvcm1hdENvZGUsXG4gICAgICAgICAgICBLZXlCaW5kaW5nQWN0aW9uLkVkaXRVbmRvLFxuICAgICAgICAgICAgS2V5QmluZGluZ0FjdGlvbi5FZGl0UmVkbyxcbiAgICAgICAgICAgIEtleUJpbmRpbmdBY3Rpb24uTW92ZUN1cnNvclRvU3RhcnQsXG4gICAgICAgICAgICBLZXlCaW5kaW5nQWN0aW9uLk1vdmVDdXJzb3JUb0VuZCxcbiAgICAgICAgICAgIEtleUJpbmRpbmdBY3Rpb24uQ2FuY2VsUmVwbHlPckVkaXQsXG4gICAgICAgICAgICBLZXlCaW5kaW5nQWN0aW9uLkVkaXROZXh0TWVzc2FnZSxcbiAgICAgICAgICAgIEtleUJpbmRpbmdBY3Rpb24uRWRpdFByZXZNZXNzYWdlLFxuICAgICAgICAgICAgS2V5QmluZGluZ0FjdGlvbi5TZWxlY3ROZXh0U2VuZEhpc3RvcnksXG4gICAgICAgICAgICBLZXlCaW5kaW5nQWN0aW9uLlNlbGVjdFByZXZTZW5kSGlzdG9yeSxcbiAgICAgICAgICAgIEtleUJpbmRpbmdBY3Rpb24uU2hvd1N0aWNrZXJQaWNrZXIsXG4gICAgICAgIF0sXG4gICAgfSwgW0NhdGVnb3J5TmFtZS5DQUxMU106IHtcbiAgICAgICAgY2F0ZWdvcnlMYWJlbDogX3RkKFwiQ2FsbHNcIiksXG4gICAgICAgIHNldHRpbmdOYW1lczogW1xuICAgICAgICAgICAgS2V5QmluZGluZ0FjdGlvbi5Ub2dnbGVNaWNJbkNhbGwsXG4gICAgICAgICAgICBLZXlCaW5kaW5nQWN0aW9uLlRvZ2dsZVdlYmNhbUluQ2FsbCxcbiAgICAgICAgXSxcbiAgICB9LCBbQ2F0ZWdvcnlOYW1lLlJPT01dOiB7XG4gICAgICAgIGNhdGVnb3J5TGFiZWw6IF90ZChcIlJvb21cIiksXG4gICAgICAgIHNldHRpbmdOYW1lczogW1xuICAgICAgICAgICAgS2V5QmluZGluZ0FjdGlvbi5TZWFyY2hJblJvb20sXG4gICAgICAgICAgICBLZXlCaW5kaW5nQWN0aW9uLlVwbG9hZEZpbGUsXG4gICAgICAgICAgICBLZXlCaW5kaW5nQWN0aW9uLkRpc21pc3NSZWFkTWFya2VyLFxuICAgICAgICAgICAgS2V5QmluZGluZ0FjdGlvbi5KdW1wVG9PbGRlc3RVbnJlYWQsXG4gICAgICAgICAgICBLZXlCaW5kaW5nQWN0aW9uLlNjcm9sbFVwLFxuICAgICAgICAgICAgS2V5QmluZGluZ0FjdGlvbi5TY3JvbGxEb3duLFxuICAgICAgICAgICAgS2V5QmluZGluZ0FjdGlvbi5KdW1wVG9GaXJzdE1lc3NhZ2UsXG4gICAgICAgICAgICBLZXlCaW5kaW5nQWN0aW9uLkp1bXBUb0xhdGVzdE1lc3NhZ2UsXG4gICAgICAgIF0sXG4gICAgfSwgW0NhdGVnb3J5TmFtZS5ST09NX0xJU1RdOiB7XG4gICAgICAgIGNhdGVnb3J5TGFiZWw6IF90ZChcIlJvb20gTGlzdFwiKSxcbiAgICAgICAgc2V0dGluZ05hbWVzOiBbXG4gICAgICAgICAgICBLZXlCaW5kaW5nQWN0aW9uLlNlbGVjdFJvb21JblJvb21MaXN0LFxuICAgICAgICAgICAgS2V5QmluZGluZ0FjdGlvbi5DbGVhclJvb21GaWx0ZXIsXG4gICAgICAgICAgICBLZXlCaW5kaW5nQWN0aW9uLkNvbGxhcHNlUm9vbUxpc3RTZWN0aW9uLFxuICAgICAgICAgICAgS2V5QmluZGluZ0FjdGlvbi5FeHBhbmRSb29tTGlzdFNlY3Rpb24sXG4gICAgICAgICAgICBLZXlCaW5kaW5nQWN0aW9uLk5leHRSb29tLFxuICAgICAgICAgICAgS2V5QmluZGluZ0FjdGlvbi5QcmV2Um9vbSxcbiAgICAgICAgXSxcbiAgICB9LCBbQ2F0ZWdvcnlOYW1lLkFDQ0VTU0lCSUxJVFldOiB7XG4gICAgICAgIGNhdGVnb3J5TGFiZWw6IF90ZChcIkFjY2Vzc2liaWxpdHlcIiksXG4gICAgICAgIHNldHRpbmdOYW1lczogW1xuICAgICAgICAgICAgS2V5QmluZGluZ0FjdGlvbi5Fc2NhcGUsXG4gICAgICAgICAgICBLZXlCaW5kaW5nQWN0aW9uLkVudGVyLFxuICAgICAgICAgICAgS2V5QmluZGluZ0FjdGlvbi5TcGFjZSxcbiAgICAgICAgICAgIEtleUJpbmRpbmdBY3Rpb24uQmFja3NwYWNlLFxuICAgICAgICAgICAgS2V5QmluZGluZ0FjdGlvbi5EZWxldGUsXG4gICAgICAgICAgICBLZXlCaW5kaW5nQWN0aW9uLkhvbWUsXG4gICAgICAgICAgICBLZXlCaW5kaW5nQWN0aW9uLkVuZCxcbiAgICAgICAgICAgIEtleUJpbmRpbmdBY3Rpb24uQXJyb3dMZWZ0LFxuICAgICAgICAgICAgS2V5QmluZGluZ0FjdGlvbi5BcnJvd1VwLFxuICAgICAgICAgICAgS2V5QmluZGluZ0FjdGlvbi5BcnJvd1JpZ2h0LFxuICAgICAgICAgICAgS2V5QmluZGluZ0FjdGlvbi5BcnJvd0Rvd24sXG4gICAgICAgICAgICBLZXlCaW5kaW5nQWN0aW9uLkNvbW1hLFxuICAgICAgICBdLFxuICAgIH0sIFtDYXRlZ29yeU5hbWUuTkFWSUdBVElPTl06IHtcbiAgICAgICAgY2F0ZWdvcnlMYWJlbDogX3RkKFwiTmF2aWdhdGlvblwiKSxcbiAgICAgICAgc2V0dGluZ05hbWVzOiBbXG4gICAgICAgICAgICBLZXlCaW5kaW5nQWN0aW9uLlRvZ2dsZVVzZXJNZW51LFxuICAgICAgICAgICAgS2V5QmluZGluZ0FjdGlvbi5Ub2dnbGVSb29tU2lkZVBhbmVsLFxuICAgICAgICAgICAgS2V5QmluZGluZ0FjdGlvbi5Ub2dnbGVTcGFjZVBhbmVsLFxuICAgICAgICAgICAgS2V5QmluZGluZ0FjdGlvbi5TaG93S2V5Ym9hcmRTZXR0aW5ncyxcbiAgICAgICAgICAgIEtleUJpbmRpbmdBY3Rpb24uR29Ub0hvbWUsXG4gICAgICAgICAgICBLZXlCaW5kaW5nQWN0aW9uLkZpbHRlclJvb21zLFxuICAgICAgICAgICAgS2V5QmluZGluZ0FjdGlvbi5TZWxlY3ROZXh0VW5yZWFkUm9vbSxcbiAgICAgICAgICAgIEtleUJpbmRpbmdBY3Rpb24uU2VsZWN0UHJldlVucmVhZFJvb20sXG4gICAgICAgICAgICBLZXlCaW5kaW5nQWN0aW9uLlNlbGVjdE5leHRSb29tLFxuICAgICAgICAgICAgS2V5QmluZGluZ0FjdGlvbi5TZWxlY3RQcmV2Um9vbSxcbiAgICAgICAgICAgIEtleUJpbmRpbmdBY3Rpb24uT3BlblVzZXJTZXR0aW5ncyxcbiAgICAgICAgICAgIEtleUJpbmRpbmdBY3Rpb24uU3dpdGNoVG9TcGFjZUJ5TnVtYmVyLFxuICAgICAgICAgICAgS2V5QmluZGluZ0FjdGlvbi5QcmV2aW91c1Zpc2l0ZWRSb29tT3JTcGFjZSxcbiAgICAgICAgICAgIEtleUJpbmRpbmdBY3Rpb24uTmV4dFZpc2l0ZWRSb29tT3JTcGFjZSxcbiAgICAgICAgXSxcbiAgICB9LCBbQ2F0ZWdvcnlOYW1lLkFVVE9DT01QTEVURV06IHtcbiAgICAgICAgY2F0ZWdvcnlMYWJlbDogX3RkKFwiQXV0b2NvbXBsZXRlXCIpLFxuICAgICAgICBzZXR0aW5nTmFtZXM6IFtcbiAgICAgICAgICAgIEtleUJpbmRpbmdBY3Rpb24uQ2FuY2VsQXV0b2NvbXBsZXRlLFxuICAgICAgICAgICAgS2V5QmluZGluZ0FjdGlvbi5OZXh0U2VsZWN0aW9uSW5BdXRvY29tcGxldGUsXG4gICAgICAgICAgICBLZXlCaW5kaW5nQWN0aW9uLlByZXZTZWxlY3Rpb25JbkF1dG9jb21wbGV0ZSxcbiAgICAgICAgICAgIEtleUJpbmRpbmdBY3Rpb24uQ29tcGxldGVBdXRvY29tcGxldGUsXG4gICAgICAgICAgICBLZXlCaW5kaW5nQWN0aW9uLkZvcmNlQ29tcGxldGVBdXRvY29tcGxldGUsXG4gICAgICAgIF0sXG4gICAgfSwgW0NhdGVnb3J5TmFtZS5MQUJTXToge1xuICAgICAgICBjYXRlZ29yeUxhYmVsOiBfdGQoXCJMYWJzXCIpLFxuICAgICAgICBzZXR0aW5nTmFtZXM6IFtcbiAgICAgICAgICAgIEtleUJpbmRpbmdBY3Rpb24uVG9nZ2xlSGlkZGVuRXZlbnRWaXNpYmlsaXR5LFxuICAgICAgICBdLFxuICAgIH0sXG59O1xuXG5leHBvcnQgY29uc3QgREVTS1RPUF9TSE9SVENVVFMgPSBbXG4gICAgS2V5QmluZGluZ0FjdGlvbi5PcGVuVXNlclNldHRpbmdzLFxuICAgIEtleUJpbmRpbmdBY3Rpb24uU3dpdGNoVG9TcGFjZUJ5TnVtYmVyLFxuICAgIEtleUJpbmRpbmdBY3Rpb24uUHJldmlvdXNWaXNpdGVkUm9vbU9yU3BhY2UsXG4gICAgS2V5QmluZGluZ0FjdGlvbi5OZXh0VmlzaXRlZFJvb21PclNwYWNlLFxuXTtcblxuZXhwb3J0IGNvbnN0IE1BQ19PTkxZX1NIT1JUQ1VUUyA9IFtcbiAgICBLZXlCaW5kaW5nQWN0aW9uLk9wZW5Vc2VyU2V0dGluZ3MsXG5dO1xuXG4vLyBUaGlzIGlzIHZlcnkgaW50ZW50aW9uYWxseSBtb2RlbGxlZCBhZnRlciBTRVRUSU5HUyBhcyBpdCB3aWxsIG1ha2UgaXQgZWFzaWVyXG4vLyB0byBpbXBsZW1lbnQgY3VzdG9taXphYmxlIGtleWJvYXJkIHNob3J0Y3V0c1xuLy8gVE9ETzogVHJhdmlzUiB3aWxsIGZpeCB0aGlzIG5pZ2h0bWFyZSB3aGVuIHRoZSBuZXcgdmVyc2lvbiBvZiB0aGUgU2V0dGluZ3NTdG9yZSBiZWNvbWVzIGEgdGhpbmdcbi8vIFhYWDogRXhwb3J0ZWQgZm9yIHRlc3RzXG5leHBvcnQgY29uc3QgS0VZQk9BUkRfU0hPUlRDVVRTOiBJS2V5Ym9hcmRTaG9ydGN1dHMgPSB7XG4gICAgW0tleUJpbmRpbmdBY3Rpb24uRm9ybWF0Qm9sZF06IHtcbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgY3RybE9yQ21kS2V5OiB0cnVlLFxuICAgICAgICAgICAga2V5OiBLZXkuQixcbiAgICAgICAgfSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlRvZ2dsZSBCb2xkXCIpLFxuICAgIH0sXG4gICAgW0tleUJpbmRpbmdBY3Rpb24uRm9ybWF0SXRhbGljc106IHtcbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgY3RybE9yQ21kS2V5OiB0cnVlLFxuICAgICAgICAgICAga2V5OiBLZXkuSSxcbiAgICAgICAgfSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlRvZ2dsZSBJdGFsaWNzXCIpLFxuICAgIH0sXG4gICAgW0tleUJpbmRpbmdBY3Rpb24uRm9ybWF0UXVvdGVdOiB7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGN0cmxPckNtZEtleTogdHJ1ZSxcbiAgICAgICAgICAgIGtleTogS2V5LkdSRUFURVJfVEhBTixcbiAgICAgICAgfSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlRvZ2dsZSBRdW90ZVwiKSxcbiAgICB9LFxuICAgIFtLZXlCaW5kaW5nQWN0aW9uLkZvcm1hdENvZGVdOiB7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGN0cmxPckNtZEtleTogdHJ1ZSxcbiAgICAgICAgICAgIGtleTogS2V5LkUsXG4gICAgICAgIH0sXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJUb2dnbGUgQ29kZSBCbG9ja1wiKSxcbiAgICB9LFxuICAgIFtLZXlCaW5kaW5nQWN0aW9uLkZvcm1hdExpbmtdOiB7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGN0cmxPckNtZEtleTogdHJ1ZSxcbiAgICAgICAgICAgIHNoaWZ0S2V5OiB0cnVlLFxuICAgICAgICAgICAga2V5OiBLZXkuTCxcbiAgICAgICAgfSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlRvZ2dsZSBMaW5rXCIpLFxuICAgIH0sXG4gICAgW0tleUJpbmRpbmdBY3Rpb24uQ2FuY2VsUmVwbHlPckVkaXRdOiB7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGtleTogS2V5LkVTQ0FQRSxcbiAgICAgICAgfSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIkNhbmNlbCByZXBseWluZyB0byBhIG1lc3NhZ2VcIiksXG4gICAgfSxcbiAgICBbS2V5QmluZGluZ0FjdGlvbi5FZGl0TmV4dE1lc3NhZ2VdOiB7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGtleTogS2V5LkFSUk9XX0RPV04sXG4gICAgICAgIH0sXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJOYXZpZ2F0ZSB0byBuZXh0IG1lc3NhZ2UgdG8gZWRpdFwiKSxcbiAgICB9LFxuICAgIFtLZXlCaW5kaW5nQWN0aW9uLkVkaXRQcmV2TWVzc2FnZV06IHtcbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAga2V5OiBLZXkuQVJST1dfVVAsXG4gICAgICAgIH0sXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJOYXZpZ2F0ZSB0byBwcmV2aW91cyBtZXNzYWdlIHRvIGVkaXRcIiksXG4gICAgfSxcbiAgICBbS2V5QmluZGluZ0FjdGlvbi5Nb3ZlQ3Vyc29yVG9TdGFydF06IHtcbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgY3RybE9yQ21kS2V5OiB0cnVlLFxuICAgICAgICAgICAga2V5OiBLZXkuSE9NRSxcbiAgICAgICAgfSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIkp1bXAgdG8gc3RhcnQgb2YgdGhlIGNvbXBvc2VyXCIpLFxuICAgIH0sXG4gICAgW0tleUJpbmRpbmdBY3Rpb24uTW92ZUN1cnNvclRvRW5kXToge1xuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICBjdHJsT3JDbWRLZXk6IHRydWUsXG4gICAgICAgICAgICBrZXk6IEtleS5FTkQsXG4gICAgICAgIH0sXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJKdW1wIHRvIGVuZCBvZiB0aGUgY29tcG9zZXJcIiksXG4gICAgfSxcbiAgICBbS2V5QmluZGluZ0FjdGlvbi5TZWxlY3ROZXh0U2VuZEhpc3RvcnldOiB7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGFsdEtleTogdHJ1ZSxcbiAgICAgICAgICAgIGN0cmxLZXk6IHRydWUsXG4gICAgICAgICAgICBrZXk6IEtleS5BUlJPV19ET1dOLFxuICAgICAgICB9LFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiTmF2aWdhdGUgdG8gbmV4dCBtZXNzYWdlIGluIGNvbXBvc2VyIGhpc3RvcnlcIiksXG4gICAgfSxcbiAgICBbS2V5QmluZGluZ0FjdGlvbi5TZWxlY3RQcmV2U2VuZEhpc3RvcnldOiB7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGFsdEtleTogdHJ1ZSxcbiAgICAgICAgICAgIGN0cmxLZXk6IHRydWUsXG4gICAgICAgICAgICBrZXk6IEtleS5BUlJPV19VUCxcbiAgICAgICAgfSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIk5hdmlnYXRlIHRvIHByZXZpb3VzIG1lc3NhZ2UgaW4gY29tcG9zZXIgaGlzdG9yeVwiKSxcbiAgICB9LFxuICAgIFtLZXlCaW5kaW5nQWN0aW9uLlNob3dTdGlja2VyUGlja2VyXToge1xuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICBjdHJsT3JDbWRLZXk6IHRydWUsXG4gICAgICAgICAgICBrZXk6IEtleS5TRU1JQ09MT04sXG4gICAgICAgIH0sXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJTZW5kIGEgc3RpY2tlclwiKSxcbiAgICB9LFxuICAgIFtLZXlCaW5kaW5nQWN0aW9uLlRvZ2dsZU1pY0luQ2FsbF06IHtcbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgY3RybE9yQ21kS2V5OiB0cnVlLFxuICAgICAgICAgICAga2V5OiBLZXkuRCxcbiAgICAgICAgfSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlRvZ2dsZSBtaWNyb3Bob25lIG11dGVcIiksXG4gICAgfSxcbiAgICBbS2V5QmluZGluZ0FjdGlvbi5Ub2dnbGVXZWJjYW1JbkNhbGxdOiB7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGN0cmxPckNtZEtleTogdHJ1ZSxcbiAgICAgICAgICAgIGtleTogS2V5LkUsXG4gICAgICAgIH0sXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJUb2dnbGUgd2ViY2FtIG9uL29mZlwiKSxcbiAgICB9LFxuICAgIFtLZXlCaW5kaW5nQWN0aW9uLkRpc21pc3NSZWFkTWFya2VyXToge1xuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICBrZXk6IEtleS5FU0NBUEUsXG4gICAgICAgIH0sXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJEaXNtaXNzIHJlYWQgbWFya2VyIGFuZCBqdW1wIHRvIGJvdHRvbVwiKSxcbiAgICB9LFxuICAgIFtLZXlCaW5kaW5nQWN0aW9uLkp1bXBUb09sZGVzdFVucmVhZF06IHtcbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgc2hpZnRLZXk6IHRydWUsXG4gICAgICAgICAgICBrZXk6IEtleS5QQUdFX1VQLFxuICAgICAgICB9LFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiSnVtcCB0byBvbGRlc3QgdW5yZWFkIG1lc3NhZ2VcIiksXG4gICAgfSxcbiAgICBbS2V5QmluZGluZ0FjdGlvbi5VcGxvYWRGaWxlXToge1xuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICBjdHJsT3JDbWRLZXk6IHRydWUsXG4gICAgICAgICAgICBzaGlmdEtleTogdHJ1ZSxcbiAgICAgICAgICAgIGtleTogS2V5LlUsXG4gICAgICAgIH0sXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJVcGxvYWQgYSBmaWxlXCIpLFxuICAgIH0sXG4gICAgW0tleUJpbmRpbmdBY3Rpb24uU2Nyb2xsVXBdOiB7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGtleTogS2V5LlBBR0VfVVAsXG4gICAgICAgIH0sXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJTY3JvbGwgdXAgaW4gdGhlIHRpbWVsaW5lXCIpLFxuICAgIH0sXG4gICAgW0tleUJpbmRpbmdBY3Rpb24uU2Nyb2xsRG93bl06IHtcbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAga2V5OiBLZXkuUEFHRV9ET1dOLFxuICAgICAgICB9LFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiU2Nyb2xsIGRvd24gaW4gdGhlIHRpbWVsaW5lXCIpLFxuICAgIH0sXG4gICAgW0tleUJpbmRpbmdBY3Rpb24uRmlsdGVyUm9vbXNdOiB7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGN0cmxPckNtZEtleTogdHJ1ZSxcbiAgICAgICAgICAgIGtleTogS2V5LkssXG4gICAgICAgIH0sXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJKdW1wIHRvIHJvb20gc2VhcmNoXCIpLFxuICAgIH0sXG4gICAgW0tleUJpbmRpbmdBY3Rpb24uU2VsZWN0Um9vbUluUm9vbUxpc3RdOiB7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGtleTogS2V5LkVOVEVSLFxuICAgICAgICB9LFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiU2VsZWN0IHJvb20gZnJvbSB0aGUgcm9vbSBsaXN0XCIpLFxuICAgIH0sXG4gICAgW0tleUJpbmRpbmdBY3Rpb24uQ29sbGFwc2VSb29tTGlzdFNlY3Rpb25dOiB7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGtleTogS2V5LkFSUk9XX0xFRlQsXG4gICAgICAgIH0sXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJDb2xsYXBzZSByb29tIGxpc3Qgc2VjdGlvblwiKSxcbiAgICB9LFxuICAgIFtLZXlCaW5kaW5nQWN0aW9uLkV4cGFuZFJvb21MaXN0U2VjdGlvbl06IHtcbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAga2V5OiBLZXkuQVJST1dfUklHSFQsXG4gICAgICAgIH0sXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJFeHBhbmQgcm9vbSBsaXN0IHNlY3Rpb25cIiksXG4gICAgfSxcbiAgICBbS2V5QmluZGluZ0FjdGlvbi5OZXh0Um9vbV06IHtcbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAga2V5OiBLZXkuQVJST1dfRE9XTixcbiAgICAgICAgfSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIk5hdmlnYXRlIGRvd24gaW4gdGhlIHJvb20gbGlzdFwiKSxcbiAgICB9LFxuICAgIFtLZXlCaW5kaW5nQWN0aW9uLlByZXZSb29tXToge1xuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICBrZXk6IEtleS5BUlJPV19VUCxcbiAgICAgICAgfSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIk5hdmlnYXRlIHVwIGluIHRoZSByb29tIGxpc3RcIiksXG4gICAgfSxcbiAgICBbS2V5QmluZGluZ0FjdGlvbi5Ub2dnbGVVc2VyTWVudV06IHtcbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgY3RybE9yQ21kS2V5OiB0cnVlLFxuICAgICAgICAgICAga2V5OiBLZXkuQkFDS1RJQ0ssXG4gICAgICAgIH0sXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJUb2dnbGUgdGhlIHRvcCBsZWZ0IG1lbnVcIiksXG4gICAgfSxcbiAgICBbS2V5QmluZGluZ0FjdGlvbi5Ub2dnbGVSb29tU2lkZVBhbmVsXToge1xuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICBjdHJsT3JDbWRLZXk6IHRydWUsXG4gICAgICAgICAgICBrZXk6IEtleS5QRVJJT0QsXG4gICAgICAgIH0sXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJUb2dnbGUgcmlnaHQgcGFuZWxcIiksXG4gICAgfSxcbiAgICBbS2V5QmluZGluZ0FjdGlvbi5TaG93S2V5Ym9hcmRTZXR0aW5nc106IHtcbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgY3RybE9yQ21kS2V5OiB0cnVlLFxuICAgICAgICAgICAga2V5OiBLZXkuU0xBU0gsXG4gICAgICAgIH0sXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJPcGVuIHRoaXMgc2V0dGluZ3MgdGFiXCIpLFxuICAgIH0sXG4gICAgW0tleUJpbmRpbmdBY3Rpb24uR29Ub0hvbWVdOiB7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGN0cmxPckNtZEtleTogdHJ1ZSxcbiAgICAgICAgICAgIGFsdEtleTogIUlTX01BQyxcbiAgICAgICAgICAgIHNoaWZ0S2V5OiBJU19NQUMsXG4gICAgICAgICAgICBrZXk6IEtleS5ILFxuICAgICAgICB9LFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiR28gdG8gSG9tZSBWaWV3XCIpLFxuICAgIH0sXG4gICAgW0tleUJpbmRpbmdBY3Rpb24uU2VsZWN0TmV4dFVucmVhZFJvb21dOiB7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIHNoaWZ0S2V5OiB0cnVlLFxuICAgICAgICAgICAgYWx0S2V5OiB0cnVlLFxuICAgICAgICAgICAga2V5OiBLZXkuQVJST1dfRE9XTixcbiAgICAgICAgfSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIk5leHQgdW5yZWFkIHJvb20gb3IgRE1cIiksXG4gICAgfSxcbiAgICBbS2V5QmluZGluZ0FjdGlvbi5TZWxlY3RQcmV2VW5yZWFkUm9vbV06IHtcbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgc2hpZnRLZXk6IHRydWUsXG4gICAgICAgICAgICBhbHRLZXk6IHRydWUsXG4gICAgICAgICAgICBrZXk6IEtleS5BUlJPV19VUCxcbiAgICAgICAgfSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlByZXZpb3VzIHVucmVhZCByb29tIG9yIERNXCIpLFxuICAgIH0sXG4gICAgW0tleUJpbmRpbmdBY3Rpb24uU2VsZWN0TmV4dFJvb21dOiB7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGFsdEtleTogdHJ1ZSxcbiAgICAgICAgICAgIGtleTogS2V5LkFSUk9XX0RPV04sXG4gICAgICAgIH0sXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJOZXh0IHJvb20gb3IgRE1cIiksXG4gICAgfSxcbiAgICBbS2V5QmluZGluZ0FjdGlvbi5TZWxlY3RQcmV2Um9vbV06IHtcbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgYWx0S2V5OiB0cnVlLFxuICAgICAgICAgICAga2V5OiBLZXkuQVJST1dfVVAsXG4gICAgICAgIH0sXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJQcmV2aW91cyByb29tIG9yIERNXCIpLFxuICAgIH0sXG4gICAgW0tleUJpbmRpbmdBY3Rpb24uQ2FuY2VsQXV0b2NvbXBsZXRlXToge1xuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICBrZXk6IEtleS5FU0NBUEUsXG4gICAgICAgIH0sXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJDYW5jZWwgYXV0b2NvbXBsZXRlXCIpLFxuICAgIH0sXG4gICAgW0tleUJpbmRpbmdBY3Rpb24uTmV4dFNlbGVjdGlvbkluQXV0b2NvbXBsZXRlXToge1xuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICBrZXk6IEtleS5BUlJPV19ET1dOLFxuICAgICAgICB9LFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiTmV4dCBhdXRvY29tcGxldGUgc3VnZ2VzdGlvblwiKSxcbiAgICB9LFxuICAgIFtLZXlCaW5kaW5nQWN0aW9uLlByZXZTZWxlY3Rpb25JbkF1dG9jb21wbGV0ZV06IHtcbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAga2V5OiBLZXkuQVJST1dfVVAsXG4gICAgICAgIH0sXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJQcmV2aW91cyBhdXRvY29tcGxldGUgc3VnZ2VzdGlvblwiKSxcbiAgICB9LFxuICAgIFtLZXlCaW5kaW5nQWN0aW9uLlRvZ2dsZVNwYWNlUGFuZWxdOiB7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGN0cmxPckNtZEtleTogdHJ1ZSxcbiAgICAgICAgICAgIHNoaWZ0S2V5OiB0cnVlLFxuICAgICAgICAgICAga2V5OiBLZXkuRCxcbiAgICAgICAgfSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIlRvZ2dsZSBzcGFjZSBwYW5lbFwiKSxcbiAgICB9LFxuICAgIFtLZXlCaW5kaW5nQWN0aW9uLlRvZ2dsZUhpZGRlbkV2ZW50VmlzaWJpbGl0eV06IHtcbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgY3RybE9yQ21kS2V5OiB0cnVlLFxuICAgICAgICAgICAgc2hpZnRLZXk6IHRydWUsXG4gICAgICAgICAgICBrZXk6IEtleS5ILFxuICAgICAgICB9LFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiVG9nZ2xlIGhpZGRlbiBldmVudCB2aXNpYmlsaXR5XCIpLFxuICAgIH0sXG4gICAgW0tleUJpbmRpbmdBY3Rpb24uSnVtcFRvRmlyc3RNZXNzYWdlXToge1xuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICBrZXk6IEtleS5IT01FLFxuICAgICAgICAgICAgY3RybEtleTogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgICAgZGlzcGxheU5hbWU6IF90ZChcIkp1bXAgdG8gZmlyc3QgbWVzc2FnZVwiKSxcbiAgICB9LFxuICAgIFtLZXlCaW5kaW5nQWN0aW9uLkp1bXBUb0xhdGVzdE1lc3NhZ2VdOiB7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGtleTogS2V5LkVORCxcbiAgICAgICAgICAgIGN0cmxLZXk6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJKdW1wIHRvIGxhc3QgbWVzc2FnZVwiKSxcbiAgICB9LFxuICAgIFtLZXlCaW5kaW5nQWN0aW9uLkVkaXRVbmRvXToge1xuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICBrZXk6IEtleS5aLFxuICAgICAgICAgICAgY3RybE9yQ21kS2V5OiB0cnVlLFxuICAgICAgICB9LFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiVW5kbyBlZGl0XCIpLFxuICAgIH0sXG4gICAgW0tleUJpbmRpbmdBY3Rpb24uRWRpdFJlZG9dOiB7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGtleTogSVNfTUFDID8gS2V5LlogOiBLZXkuWSxcbiAgICAgICAgICAgIGN0cmxPckNtZEtleTogdHJ1ZSxcbiAgICAgICAgICAgIHNoaWZ0S2V5OiBJU19NQUMsXG4gICAgICAgIH0sXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJSZWRvIGVkaXRcIiksXG4gICAgfSxcbiAgICBbS2V5QmluZGluZ0FjdGlvbi5QcmV2aW91c1Zpc2l0ZWRSb29tT3JTcGFjZV06IHtcbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgbWV0YUtleTogSVNfTUFDLFxuICAgICAgICAgICAgYWx0S2V5OiAhSVNfTUFDLFxuICAgICAgICAgICAga2V5OiBJU19NQUMgPyBLZXkuU1FVQVJFX0JSQUNLRVRfTEVGVCA6IEtleS5BUlJPV19MRUZULFxuICAgICAgICB9LFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiUHJldmlvdXMgcmVjZW50bHkgdmlzaXRlZCByb29tIG9yIHNwYWNlXCIpLFxuICAgIH0sXG4gICAgW0tleUJpbmRpbmdBY3Rpb24uTmV4dFZpc2l0ZWRSb29tT3JTcGFjZV06IHtcbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgbWV0YUtleTogSVNfTUFDLFxuICAgICAgICAgICAgYWx0S2V5OiAhSVNfTUFDLFxuICAgICAgICAgICAga2V5OiBJU19NQUMgPyBLZXkuU1FVQVJFX0JSQUNLRVRfUklHSFQgOiBLZXkuQVJST1dfUklHSFQsXG4gICAgICAgIH0sXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJOZXh0IHJlY2VudGx5IHZpc2l0ZWQgcm9vbSBvciBzcGFjZVwiKSxcbiAgICB9LFxuICAgIFtLZXlCaW5kaW5nQWN0aW9uLlN3aXRjaFRvU3BhY2VCeU51bWJlcl06IHtcbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgY3RybE9yQ21kS2V5OiB0cnVlLFxuICAgICAgICAgICAga2V5OiBESUdJVFMsXG4gICAgICAgIH0sXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJTd2l0Y2ggdG8gc3BhY2UgYnkgbnVtYmVyXCIpLFxuICAgIH0sXG4gICAgW0tleUJpbmRpbmdBY3Rpb24uT3BlblVzZXJTZXR0aW5nc106IHtcbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgbWV0YUtleTogdHJ1ZSxcbiAgICAgICAgICAgIGtleTogS2V5LkNPTU1BLFxuICAgICAgICB9LFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiT3BlbiB1c2VyIHNldHRpbmdzXCIpLFxuICAgIH0sXG4gICAgW0tleUJpbmRpbmdBY3Rpb24uRXNjYXBlXToge1xuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICBrZXk6IEtleS5FU0NBUEUsXG4gICAgICAgIH0sXG4gICAgICAgIGRpc3BsYXlOYW1lOiBfdGQoXCJDbG9zZSBkaWFsb2cgb3IgY29udGV4dCBtZW51XCIpLFxuICAgIH0sXG4gICAgW0tleUJpbmRpbmdBY3Rpb24uRW50ZXJdOiB7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGtleTogS2V5LkVOVEVSLFxuICAgICAgICB9LFxuICAgICAgICBkaXNwbGF5TmFtZTogX3RkKFwiQWN0aXZhdGUgc2VsZWN0ZWQgYnV0dG9uXCIpLFxuICAgIH0sXG4gICAgW0tleUJpbmRpbmdBY3Rpb24uU3BhY2VdOiB7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGtleTogS2V5LlNQQUNFLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgW0tleUJpbmRpbmdBY3Rpb24uQmFja3NwYWNlXToge1xuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgICBrZXk6IEtleS5CQUNLU1BBQ0UsXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICBbS2V5QmluZGluZ0FjdGlvbi5EZWxldGVdOiB7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGtleTogS2V5LkRFTEVURSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIFtLZXlCaW5kaW5nQWN0aW9uLkhvbWVdOiB7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGtleTogS2V5LkhPTUUsXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICBbS2V5QmluZGluZ0FjdGlvbi5FbmRdOiB7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGtleTogS2V5LkVORCxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIFtLZXlCaW5kaW5nQWN0aW9uLkFycm93TGVmdF06IHtcbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAga2V5OiBLZXkuQVJST1dfTEVGVCxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIFtLZXlCaW5kaW5nQWN0aW9uLkFycm93VXBdOiB7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGtleTogS2V5LkFSUk9XX1VQLFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgW0tleUJpbmRpbmdBY3Rpb24uQXJyb3dSaWdodF06IHtcbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAga2V5OiBLZXkuQVJST1dfUklHSFQsXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICBbS2V5QmluZGluZ0FjdGlvbi5BcnJvd0Rvd25dOiB7XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICAgIGtleTogS2V5LkFSUk9XX0RPV04sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICBbS2V5QmluZGluZ0FjdGlvbi5Db21tYV06IHtcbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAga2V5OiBLZXkuQ09NTUEsXG4gICAgICAgIH0sXG4gICAgfSxcbn07XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFrQkE7O0FBQ0E7O0FBbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFPWUEsZ0I7OztXQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtFQUFBQSxnQjtHQUFBQSxnQixnQ0FBQUEsZ0I7O0lBa0pBQyxZLEVBV1o7Ozs7V0FYWUEsWTtFQUFBQSxZO0VBQUFBLFk7RUFBQUEsWTtFQUFBQSxZO0VBQUFB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