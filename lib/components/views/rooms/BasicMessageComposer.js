"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.REGEX_EMOTICON = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classnames = _interopRequireDefault(require("classnames"));

var _react = _interopRequireWildcard(require("react"));

var _emoticon = _interopRequireDefault(require("emojibase-regex/emoticon"));

var _logger = require("matrix-js-sdk/src/logger");

var _history = _interopRequireDefault(require("../../../editor/history"));

var _caret = require("../../../editor/caret");

var _operations = require("../../../editor/operations");

var _dom = require("../../../editor/dom");

var _Autocomplete = _interopRequireWildcard(require("../rooms/Autocomplete"));

var _parts = require("../../../editor/parts");

var _deserialize = require("../../../editor/deserialize");

var _render = require("../../../editor/render");

var _TypingStore = _interopRequireDefault(require("../../../stores/TypingStore"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _Keyboard = require("../../../Keyboard");

var _emoji = require("../../../emoji");

var _SlashCommands = require("../../../SlashCommands");

var _range = _interopRequireDefault(require("../../../editor/range"));

var _MessageComposerFormatBar = _interopRequireWildcard(require("./MessageComposerFormatBar"));

var _KeyBindingsManager = require("../../../KeyBindingsManager");

var _KeyboardShortcuts = require("../../../accessibility/KeyboardShortcuts");

var _languageHandler = require("../../../languageHandler");

var _linkifyMatrix = require("../../../linkify-matrix");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2019 - 2021 The Matrix.org Foundation C.I.C.

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
// matches emoticons which follow the start of a line or whitespace
const REGEX_EMOTICON_WHITESPACE = new RegExp('(?:^|\\s)(' + _emoticon.default.source + ')\\s|:^$');
const REGEX_EMOTICON = new RegExp('(?:^|\\s)(' + _emoticon.default.source + ')$');
exports.REGEX_EMOTICON = REGEX_EMOTICON;
const SURROUND_WITH_CHARACTERS = ["\"", "_", "`", "'", "*", "~", "$"];
const SURROUND_WITH_DOUBLE_CHARACTERS = new Map([["(", ")"], ["[", "]"], ["{", "}"], ["<", ">"]]);

function ctrlShortcutLabel(key) {
  let needsShift = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  let needsAlt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  return (_Keyboard.IS_MAC ? "⌘" : (0, _languageHandler._t)(_KeyboardShortcuts.ALTERNATE_KEY_NAME[_Keyboard.Key.CONTROL])) + (needsShift ? "+" + (0, _languageHandler._t)(_KeyboardShortcuts.ALTERNATE_KEY_NAME[_Keyboard.Key.SHIFT]) : "") + (needsAlt ? "+" + (0, _languageHandler._t)(_KeyboardShortcuts.ALTERNATE_KEY_NAME[_Keyboard.Key.ALT]) : "") + "+" + key;
}

function cloneSelection(selection) {
  return {
    anchorNode: selection.anchorNode,
    anchorOffset: selection.anchorOffset,
    focusNode: selection.focusNode,
    focusOffset: selection.focusOffset,
    isCollapsed: selection.isCollapsed,
    rangeCount: selection.rangeCount,
    type: selection.type
  };
}

function selectionEquals(a, b) {
  return a.anchorNode === b.anchorNode && a.anchorOffset === b.anchorOffset && a.focusNode === b.focusNode && a.focusOffset === b.focusOffset && a.isCollapsed === b.isCollapsed && a.rangeCount === b.rangeCount && a.type === b.type;
}

class BasicMessageEditor extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "editorRef", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "autocompleteRef", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "formatBarRef", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "modifiedFlag", false);
    (0, _defineProperty2.default)(this, "isIMEComposing", false);
    (0, _defineProperty2.default)(this, "hasTextSelected", false);
    (0, _defineProperty2.default)(this, "_isCaretAtEnd", void 0);
    (0, _defineProperty2.default)(this, "lastCaret", void 0);
    (0, _defineProperty2.default)(this, "lastSelection", void 0);
    (0, _defineProperty2.default)(this, "useMarkdownHandle", void 0);
    (0, _defineProperty2.default)(this, "emoticonSettingHandle", void 0);
    (0, _defineProperty2.default)(this, "shouldShowPillAvatarSettingHandle", void 0);
    (0, _defineProperty2.default)(this, "surroundWithHandle", void 0);
    (0, _defineProperty2.default)(this, "historyManager", new _history.default());
    (0, _defineProperty2.default)(this, "updateEditorState", (selection, inputType, diff) => {
      (0, _render.renderModel)(this.editorRef.current, this.props.model);

      if (selection) {
        // set the caret/selection
        try {
          (0, _caret.setSelection)(this.editorRef.current, this.props.model, selection);
        } catch (err) {
          _logger.logger.error(err);
        } // if caret selection is a range, take the end position


        const position = selection instanceof _range.default ? selection.end : selection;
        this.setLastCaretFromPosition(position);
      }

      const {
        isEmpty
      } = this.props.model;

      if (this.props.placeholder) {
        if (isEmpty) {
          this.showPlaceholder();
        } else {
          this.hidePlaceholder();
        }
      }

      if (isEmpty) {
        this.formatBarRef.current.hide();
      }

      this.setState({
        autoComplete: this.props.model.autoComplete,
        // if a change is happening then clear the showVisualBell
        showVisualBell: diff ? false : this.state.showVisualBell
      });
      this.historyManager.tryPush(this.props.model, selection, inputType, diff); // inputType is falsy during initial mount, don't consider re-loading the draft as typing

      let isTyping = !this.props.model.isEmpty && !!inputType; // If the user is entering a command, only consider them typing if it is one which sends a message into the room

      if (isTyping && this.props.model.parts[0].type === "command") {
        const {
          cmd
        } = (0, _SlashCommands.parseCommandString)(this.props.model.parts[0].text);

        const command = _SlashCommands.CommandMap.get(cmd);

        if (!command || !command.isEnabled() || command.category !== _SlashCommands.CommandCategories.messages) {
          isTyping = false;
        }
      }

      _TypingStore.default.sharedInstance().setSelfTyping(this.props.room.roomId, this.props.threadId, isTyping);

      if (this.props.onChange) {
        this.props.onChange();
      }
    });
    (0, _defineProperty2.default)(this, "onCompositionStart", () => {
      this.isIMEComposing = true; // even if the model is empty, the composition text shouldn't be mixed with the placeholder

      this.hidePlaceholder();
    });
    (0, _defineProperty2.default)(this, "onCompositionEnd", () => {
      this.isIMEComposing = false; // some browsers (Chrome) don't fire an input event after ending a composition,
      // so trigger a model update after the composition is done by calling the input handler.
      // however, modifying the DOM (caused by the editor model update) from the compositionend handler seems
      // to confuse the IME in Chrome, likely causing https://github.com/vector-im/element-web/issues/10913 ,
      // so we do it async
      // however, doing this async seems to break things in Safari for some reason, so browser sniff.

      const ua = navigator.userAgent.toLowerCase();
      const isSafari = ua.includes('safari/') && !ua.includes('chrome/');

      if (isSafari) {
        this.onInput({
          inputType: "insertCompositionText"
        });
      } else {
        Promise.resolve().then(() => {
          this.onInput({
            inputType: "insertCompositionText"
          });
        });
      }
    });
    (0, _defineProperty2.default)(this, "onCutCopy", (event, type) => {
      const selection = document.getSelection();
      const text = selection.toString();

      if (text) {
        const {
          model
        } = this.props;
        const range = (0, _dom.getRangeForSelection)(this.editorRef.current, model, selection);
        const selectedParts = range.parts.map(p => p.serialize());
        event.clipboardData.setData("application/x-element-composer", JSON.stringify(selectedParts));
        event.clipboardData.setData("text/plain", text); // so plain copy/paste works

        if (type === "cut") {
          // Remove the text, updating the model as appropriate
          this.modifiedFlag = true;
          (0, _operations.replaceRangeAndMoveCaret)(range, []);
        }

        event.preventDefault();
      }
    });
    (0, _defineProperty2.default)(this, "onCopy", event => {
      this.onCutCopy(event, "copy");
    });
    (0, _defineProperty2.default)(this, "onCut", event => {
      this.onCutCopy(event, "cut");
    });
    (0, _defineProperty2.default)(this, "onPaste", event => {
      event.preventDefault(); // we always handle the paste ourselves

      if (this.props.onPaste?.(event, this.props.model)) {
        // to prevent double handling, allow props.onPaste to skip internal onPaste
        return true;
      }

      const {
        model
      } = this.props;
      const {
        partCreator
      } = model;
      const plainText = event.clipboardData.getData("text/plain");
      const partsText = event.clipboardData.getData("application/x-element-composer");
      let parts;

      if (partsText) {
        const serializedTextParts = JSON.parse(partsText);
        parts = serializedTextParts.map(p => partCreator.deserializePart(p));
      } else {
        parts = (0, _deserialize.parsePlainTextMessage)(plainText, partCreator, {
          shouldEscape: false
        });
      }

      this.modifiedFlag = true;
      const range = (0, _dom.getRangeForSelection)(this.editorRef.current, model, document.getSelection()); // If the user is pasting a link, and has a range selected which is not a link, wrap the range with the link

      if (plainText && range.length > 0 && _linkifyMatrix.linkify.test(plainText) && !_linkifyMatrix.linkify.test(range.text)) {
        (0, _operations.formatRangeAsLink)(range, plainText);
      } else {
        (0, _operations.replaceRangeAndMoveCaret)(range, parts);
      }
    });
    (0, _defineProperty2.default)(this, "onInput", event => {
      // ignore any input while doing IME compositions
      if (this.isIMEComposing) {
        return;
      }

      this.modifiedFlag = true;
      const sel = document.getSelection();
      const {
        caret,
        text
      } = (0, _dom.getCaretOffsetAndText)(this.editorRef.current, sel);
      this.props.model.update(text, event.inputType, caret);
    });
    (0, _defineProperty2.default)(this, "onBlur", () => {
      document.removeEventListener("selectionchange", this.onSelectionChange);
    });
    (0, _defineProperty2.default)(this, "onFocus", () => {
      document.addEventListener("selectionchange", this.onSelectionChange); // force to recalculate

      this.lastSelection = null;
      this.refreshLastCaretIfNeeded();
    });
    (0, _defineProperty2.default)(this, "onSelectionChange", () => {
      const {
        isEmpty
      } = this.props.model;
      this.refreshLastCaretIfNeeded();
      const selection = document.getSelection();

      if (this.hasTextSelected && selection.isCollapsed) {
        this.hasTextSelected = false;
        this.formatBarRef.current?.hide();
      } else if (!selection.isCollapsed && !isEmpty) {
        this.hasTextSelected = true;
        const range = (0, _dom.getRangeForSelection)(this.editorRef.current, this.props.model, selection);

        if (this.formatBarRef.current && this.state.useMarkdown && !!range.text.trim()) {
          const selectionRect = selection.getRangeAt(0).getBoundingClientRect();
          this.formatBarRef.current.showAt(selectionRect);
        }
      }
    });
    (0, _defineProperty2.default)(this, "onKeyDown", event => {
      const model = this.props.model;
      let handled = false;

      if (this.state.surroundWith && document.getSelection().type !== "Caret") {
        // This surrounds the selected text with a character. This is
        // intentionally left out of the keybinding manager as the keybinds
        // here shouldn't be changeable
        const selectionRange = (0, _dom.getRangeForSelection)(this.editorRef.current, this.props.model, document.getSelection()); // trim the range as we want it to exclude leading/trailing spaces

        selectionRange.trim();

        if ([...SURROUND_WITH_DOUBLE_CHARACTERS.keys(), ...SURROUND_WITH_CHARACTERS].includes(event.key)) {
          this.historyManager.ensureLastChangesPushed(this.props.model);
          this.modifiedFlag = true;
          (0, _operations.toggleInlineFormat)(selectionRange, event.key, SURROUND_WITH_DOUBLE_CHARACTERS.get(event.key));
          handled = true;
        }
      }

      const autocompleteAction = (0, _KeyBindingsManager.getKeyBindingsManager)().getAutocompleteAction(event);
      const accessibilityAction = (0, _KeyBindingsManager.getKeyBindingsManager)().getAccessibilityAction(event);

      if (model.autoComplete?.hasCompletions()) {
        const autoComplete = model.autoComplete;

        switch (autocompleteAction) {
          case _KeyboardShortcuts.KeyBindingAction.ForceCompleteAutocomplete:
          case _KeyboardShortcuts.KeyBindingAction.CompleteAutocomplete:
            this.historyManager.ensureLastChangesPushed(this.props.model);
            this.modifiedFlag = true;
            autoComplete.confirmCompletion();
            handled = true;
            break;

          case _KeyboardShortcuts.KeyBindingAction.PrevSelectionInAutocomplete:
            autoComplete.selectPreviousSelection();
            handled = true;
            break;

          case _KeyboardShortcuts.KeyBindingAction.NextSelectionInAutocomplete:
            autoComplete.selectNextSelection();
            handled = true;
            break;

          case _KeyboardShortcuts.KeyBindingAction.CancelAutocomplete:
            autoComplete.onEscape(event);
            handled = true;
            break;

          default:
            return;
          // don't preventDefault on anything else
        }
      } else if (autocompleteAction === _KeyboardShortcuts.KeyBindingAction.ForceCompleteAutocomplete && !this.state.showVisualBell) {
        // there is no current autocomplete window, try to open it
        this.tabCompleteName();
        handled = true;
      } else if ([_KeyboardShortcuts.KeyBindingAction.Delete, _KeyboardShortcuts.KeyBindingAction.Backspace].includes(accessibilityAction)) {
        this.formatBarRef.current.hide();
      }

      if (handled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getMessageComposerAction(event);

      switch (action) {
        case _KeyboardShortcuts.KeyBindingAction.FormatBold:
          this.onFormatAction(_MessageComposerFormatBar.Formatting.Bold);
          handled = true;
          break;

        case _KeyboardShortcuts.KeyBindingAction.FormatItalics:
          this.onFormatAction(_MessageComposerFormatBar.Formatting.Italics);
          handled = true;
          break;

        case _KeyboardShortcuts.KeyBindingAction.FormatCode:
          this.onFormatAction(_MessageComposerFormatBar.Formatting.Code);
          handled = true;
          break;

        case _KeyboardShortcuts.KeyBindingAction.FormatQuote:
          this.onFormatAction(_MessageComposerFormatBar.Formatting.Quote);
          handled = true;
          break;

        case _KeyboardShortcuts.KeyBindingAction.FormatLink:
          this.onFormatAction(_MessageComposerFormatBar.Formatting.InsertLink);
          handled = true;
          break;

        case _KeyboardShortcuts.KeyBindingAction.EditRedo:
          if (this.historyManager.canRedo()) {
            const {
              parts,
              caret
            } = this.historyManager.redo(); // pass matching inputType so historyManager doesn't push echo
            // when invoked from rerender callback.

            model.reset(parts, caret, "historyRedo");
          }

          handled = true;
          break;

        case _KeyboardShortcuts.KeyBindingAction.EditUndo:
          if (this.historyManager.canUndo()) {
            const {
              parts,
              caret
            } = this.historyManager.undo(this.props.model); // pass matching inputType so historyManager doesn't push echo
            // when invoked from rerender callback.

            model.reset(parts, caret, "historyUndo");
          }

          handled = true;
          break;

        case _KeyboardShortcuts.KeyBindingAction.NewLine:
          this.insertText("\n");
          handled = true;
          break;

        case _KeyboardShortcuts.KeyBindingAction.MoveCursorToStart:
          (0, _caret.setSelection)(this.editorRef.current, model, {
            index: 0,
            offset: 0
          });
          handled = true;
          break;

        case _KeyboardShortcuts.KeyBindingAction.MoveCursorToEnd:
          (0, _caret.setSelection)(this.editorRef.current, model, {
            index: model.parts.length - 1,
            offset: model.parts[model.parts.length - 1].text.length
          });
          handled = true;
          break;
      }

      if (handled) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
    (0, _defineProperty2.default)(this, "onAutoCompleteConfirm", completion => {
      this.modifiedFlag = true;
      this.props.model.autoComplete.onComponentConfirm(completion);
    });
    (0, _defineProperty2.default)(this, "onAutoCompleteSelectionChange", completionIndex => {
      this.modifiedFlag = true;
      this.setState({
        completionIndex
      });
    });
    (0, _defineProperty2.default)(this, "configureUseMarkdown", () => {
      const useMarkdown = _SettingsStore.default.getValue("MessageComposerInput.useMarkdown");

      this.setState({
        useMarkdown
      });

      if (!useMarkdown && this.formatBarRef.current) {
        this.formatBarRef.current.hide();
      }
    });
    (0, _defineProperty2.default)(this, "configureEmoticonAutoReplace", () => {
      this.props.model.setTransformCallback(this.transform);
    });
    (0, _defineProperty2.default)(this, "configureShouldShowPillAvatar", () => {
      const showPillAvatar = _SettingsStore.default.getValue("Pill.shouldShowPillAvatar");

      this.setState({
        showPillAvatar
      });
    });
    (0, _defineProperty2.default)(this, "surroundWithSettingChanged", () => {
      const surroundWith = _SettingsStore.default.getValue("MessageComposerInput.surroundWith");

      this.setState({
        surroundWith
      });
    });
    (0, _defineProperty2.default)(this, "transform", documentPosition => {
      const shouldReplace = _SettingsStore.default.getValue('MessageComposerInput.autoReplaceEmoji');

      if (shouldReplace) this.replaceEmoticon(documentPosition, REGEX_EMOTICON_WHITESPACE);
    });
    (0, _defineProperty2.default)(this, "onFormatAction", action => {
      if (!this.state.useMarkdown) {
        return;
      }

      const range = (0, _dom.getRangeForSelection)(this.editorRef.current, this.props.model, document.getSelection());
      this.historyManager.ensureLastChangesPushed(this.props.model);
      this.modifiedFlag = true;
      (0, _operations.formatRange)(range, action);
    });
    this.state = {
      showPillAvatar: _SettingsStore.default.getValue("Pill.shouldShowPillAvatar"),
      useMarkdown: _SettingsStore.default.getValue("MessageComposerInput.useMarkdown"),
      surroundWith: _SettingsStore.default.getValue("MessageComposerInput.surroundWith"),
      showVisualBell: false
    };
    this.useMarkdownHandle = _SettingsStore.default.watchSetting('MessageComposerInput.useMarkdown', null, this.configureUseMarkdown);
    this.emoticonSettingHandle = _SettingsStore.default.watchSetting('MessageComposerInput.autoReplaceEmoji', null, this.configureEmoticonAutoReplace);
    this.configureEmoticonAutoReplace();
    this.shouldShowPillAvatarSettingHandle = _SettingsStore.default.watchSetting("Pill.shouldShowPillAvatar", null, this.configureShouldShowPillAvatar);
    this.surroundWithHandle = _SettingsStore.default.watchSetting("MessageComposerInput.surroundWith", null, this.surroundWithSettingChanged);
  }

  componentDidUpdate(prevProps) {
    // We need to re-check the placeholder when the enabled state changes because it causes the
    // placeholder element to remount, which gets rid of the `::before` class. Re-evaluating the
    // placeholder means we get a proper `::before` with the placeholder.
    const enabledChange = this.props.disabled !== prevProps.disabled;
    const placeholderChanged = this.props.placeholder !== prevProps.placeholder;

    if (this.props.placeholder && (placeholderChanged || enabledChange)) {
      const {
        isEmpty
      } = this.props.model;

      if (isEmpty) {
        this.showPlaceholder();
      } else {
        this.hidePlaceholder();
      }
    }
  }

  replaceEmoticon(caretPosition, regex) {
    const {
      model
    } = this.props;
    const range = model.startRange(caretPosition); // expand range max 8 characters backwards from caretPosition,
    // as a space to look for an emoticon

    let n = 8;
    range.expandBackwardsWhile((index, offset) => {
      const part = model.parts[index];
      n -= 1;
      return n >= 0 && [_parts.Type.Plain, _parts.Type.PillCandidate, _parts.Type.Newline].includes(part.type);
    });
    const emoticonMatch = regex.exec(range.text);

    if (emoticonMatch) {
      const query = emoticonMatch[1].replace("-", ""); // try both exact match and lower-case, this means that xd won't match xD but :P will match :p

      const data = _emoji.EMOTICON_TO_EMOJI.get(query) || _emoji.EMOTICON_TO_EMOJI.get(query.toLowerCase());

      if (data) {
        const {
          partCreator
        } = model;
        const firstMatch = emoticonMatch[0];
        const moveStart = firstMatch[0] === " " ? 1 : 0; // we need the range to only comprise of the emoticon
        // because we'll replace the whole range with an emoji,
        // so move the start forward to the start of the emoticon.
        // Take + 1 because index is reported without the possible preceding space.

        range.moveStartForwards(emoticonMatch.index + moveStart); // If the end is a trailing space/newline move end backwards, so that we don't replace it

        if (["\n", " "].includes(firstMatch[firstMatch.length - 1])) {
          range.moveEndBackwards(1);
        } // this returns the amount of added/removed characters during the replace
        // so the caret position can be adjusted.


        return range.replace([partCreator.emoji(data.unicode)]);
      }
    }
  }

  showPlaceholder() {
    // escape single quotes
    const placeholder = this.props.placeholder.replace(/'/g, '\\\'');
    this.editorRef.current.style.setProperty("--placeholder", `'${placeholder}'`);
    this.editorRef.current.classList.add("mx_BasicMessageComposer_inputEmpty");
  }

  hidePlaceholder() {
    this.editorRef.current.classList.remove("mx_BasicMessageComposer_inputEmpty");
    this.editorRef.current.style.removeProperty("--placeholder");
  }

  isComposing(event) {
    // checking the event.isComposing flag just in case any browser out there
    // emits events related to the composition after compositionend
    // has been fired
    return !!(this.isIMEComposing || event.nativeEvent && event.nativeEvent.isComposing);
  }

  insertText(textToInsert) {
    let inputType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "insertText";
    const sel = document.getSelection();
    const {
      caret,
      text
    } = (0, _dom.getCaretOffsetAndText)(this.editorRef.current, sel);
    const newText = text.slice(0, caret.offset) + textToInsert + text.slice(caret.offset);
    caret.offset += textToInsert.length;
    this.modifiedFlag = true;
    this.props.model.update(newText, inputType, caret);
  } // this is used later to see if we need to recalculate the caret
  // on selectionchange. If it is just a consequence of typing
  // we don't need to. But if the user is navigating the caret without input
  // we need to recalculate it, to be able to know where to insert content after
  // losing focus


  setLastCaretFromPosition(position) {
    const {
      model
    } = this.props;
    this._isCaretAtEnd = position.isAtEnd(model);
    this.lastCaret = position.asOffset(model);
    this.lastSelection = cloneSelection(document.getSelection());
  }

  refreshLastCaretIfNeeded() {
    // XXX: needed when going up and down in editing messages ... not sure why yet
    // because the editors should stop doing this when when blurred ...
    // maybe it's on focus and the _editorRef isn't available yet or something.
    if (!this.editorRef.current) {
      return;
    }

    const selection = document.getSelection();

    if (!this.lastSelection || !selectionEquals(this.lastSelection, selection)) {
      this.lastSelection = cloneSelection(selection);
      const {
        caret,
        text
      } = (0, _dom.getCaretOffsetAndText)(this.editorRef.current, selection);
      this.lastCaret = caret;
      this._isCaretAtEnd = caret.offset === text.length;
    }

    return this.lastCaret;
  }

  clearUndoHistory() {
    this.historyManager.clear();
  }

  getCaret() {
    return this.lastCaret;
  }

  isSelectionCollapsed() {
    return !this.lastSelection || this.lastSelection.isCollapsed;
  }

  isCaretAtStart() {
    return this.getCaret().offset === 0;
  }

  isCaretAtEnd() {
    return this._isCaretAtEnd;
  }

  async tabCompleteName() {
    try {
      await new Promise(resolve => this.setState({
        showVisualBell: false
      }, resolve));
      const {
        model
      } = this.props;
      const caret = this.getCaret();
      const position = model.positionForOffset(caret.offset, caret.atNodeEnd);
      const range = model.startRange(position);
      range.expandBackwardsWhile((index, offset, part) => {
        return part.text[offset] !== " " && part.text[offset] !== "+" && (part.type === _parts.Type.Plain || part.type === _parts.Type.PillCandidate || part.type === _parts.Type.Command);
      });
      const {
        partCreator
      } = model; // await for auto-complete to be open

      await model.transform(() => {
        const addedLen = range.replace([partCreator.pillCandidate(range.text)]);
        return model.positionForOffset(caret.offset + addedLen, true);
      }); // Don't try to do things with the autocomplete if there is none shown

      if (model.autoComplete) {
        await model.autoComplete.startSelection();

        if (!model.autoComplete.hasSelection()) {
          this.setState({
            showVisualBell: true
          });
          model.autoComplete.close();
        }
      } else {
        this.setState({
          showVisualBell: true
        });
      }
    } catch (err) {
      _logger.logger.error(err);
    }
  }

  isModified() {
    return this.modifiedFlag;
  }

  componentWillUnmount() {
    document.removeEventListener("selectionchange", this.onSelectionChange);
    this.editorRef.current.removeEventListener("input", this.onInput, true);
    this.editorRef.current.removeEventListener("compositionstart", this.onCompositionStart, true);
    this.editorRef.current.removeEventListener("compositionend", this.onCompositionEnd, true);

    _SettingsStore.default.unwatchSetting(this.useMarkdownHandle);

    _SettingsStore.default.unwatchSetting(this.emoticonSettingHandle);

    _SettingsStore.default.unwatchSetting(this.shouldShowPillAvatarSettingHandle);

    _SettingsStore.default.unwatchSetting(this.surroundWithHandle);
  }

  componentDidMount() {
    const model = this.props.model;
    model.setUpdateCallback(this.updateEditorState);
    const partCreator = model.partCreator; // TODO: does this allow us to get rid of EditorStateTransfer?
    // not really, but we could not serialize the parts, and just change the autoCompleter

    partCreator.setAutoCompleteCreator((0, _parts.getAutoCompleteCreator)(() => this.autocompleteRef.current, query => new Promise(resolve => this.setState({
      query
    }, resolve)))); // initial render of model

    this.updateEditorState(this.getInitialCaretPosition()); // attach input listener by hand so React doesn't proxy the events,
    // as the proxied event doesn't support inputType, which we need.

    this.editorRef.current.addEventListener("input", this.onInput, true);
    this.editorRef.current.addEventListener("compositionstart", this.onCompositionStart, true);
    this.editorRef.current.addEventListener("compositionend", this.onCompositionEnd, true);
    this.editorRef.current.focus();
  }

  getInitialCaretPosition() {
    let caretPosition;

    if (this.props.initialCaret) {
      // if restoring state from a previous editor,
      // restore caret position from the state
      const caret = this.props.initialCaret;
      caretPosition = this.props.model.positionForOffset(caret.offset, caret.atNodeEnd);
    } else {
      // otherwise, set it at the end
      caretPosition = this.props.model.getPositionAtEnd();
    }

    return caretPosition;
  }

  render() {
    let autoComplete;

    if (this.state.autoComplete) {
      const query = this.state.query;
      const queryLen = query.length;
      autoComplete = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_BasicMessageComposer_AutoCompleteWrapper"
      }, /*#__PURE__*/_react.default.createElement(_Autocomplete.default, {
        ref: this.autocompleteRef,
        query: query,
        onConfirm: this.onAutoCompleteConfirm,
        onSelectionChange: this.onAutoCompleteSelectionChange,
        selection: {
          beginning: true,
          end: queryLen,
          start: queryLen
        },
        room: this.props.room
      }));
    }

    const wrapperClasses = (0, _classnames.default)("mx_BasicMessageComposer", {
      "mx_BasicMessageComposer_input_error": this.state.showVisualBell
    });
    const classes = (0, _classnames.default)("mx_BasicMessageComposer_input", {
      "mx_BasicMessageComposer_input_shouldShowPillAvatar": this.state.showPillAvatar,
      "mx_BasicMessageComposer_input_disabled": this.props.disabled
    });
    const shortcuts = {
      [_MessageComposerFormatBar.Formatting.Bold]: ctrlShortcutLabel("B"),
      [_MessageComposerFormatBar.Formatting.Italics]: ctrlShortcutLabel("I"),
      [_MessageComposerFormatBar.Formatting.Code]: ctrlShortcutLabel("E"),
      [_MessageComposerFormatBar.Formatting.Quote]: ctrlShortcutLabel(">"),
      [_MessageComposerFormatBar.Formatting.InsertLink]: ctrlShortcutLabel("L", true)
    };
    const {
      completionIndex
    } = this.state;
    const hasAutocomplete = Boolean(this.state.autoComplete);
    let activeDescendant;

    if (hasAutocomplete && completionIndex >= 0) {
      activeDescendant = (0, _Autocomplete.generateCompletionDomId)(completionIndex);
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: wrapperClasses
    }, autoComplete, /*#__PURE__*/_react.default.createElement(_MessageComposerFormatBar.default, {
      ref: this.formatBarRef,
      onAction: this.onFormatAction,
      shortcuts: shortcuts
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: classes,
      contentEditable: this.props.disabled ? null : true,
      tabIndex: 0,
      onBlur: this.onBlur,
      onFocus: this.onFocus,
      onCopy: this.onCopy,
      onCut: this.onCut,
      onPaste: this.onPaste,
      onKeyDown: this.onKeyDown,
      ref: this.editorRef,
      "aria-label": this.props.label,
      role: "textbox",
      "aria-multiline": "true",
      "aria-autocomplete": "list",
      "aria-haspopup": "listbox",
      "aria-expanded": hasAutocomplete ? true : undefined,
      "aria-owns": hasAutocomplete ? "mx_Autocomplete" : undefined,
      "aria-activedescendant": activeDescendant,
      dir: "auto",
      "aria-disabled": this.props.disabled
    }));
  }

  focus() {
    this.editorRef.current.focus();
  }

  insertMention(userId) {
    this.modifiedFlag = true;
    const {
      model
    } = this.props;
    const {
      partCreator
    } = model;
    const member = this.props.room.getMember(userId);
    const displayName = member ? member.rawDisplayName : userId;
    const caret = this.getCaret();
    const position = model.positionForOffset(caret.offset, caret.atNodeEnd); // Insert suffix only if the caret is at the start of the composer

    const parts = partCreator.createMentionParts(caret.offset === 0, displayName, userId);
    model.transform(() => {
      const addedLen = model.insert(parts, position);
      return model.positionForOffset(caret.offset + addedLen, true);
    }); // refocus on composer, as we just clicked "Mention"

    this.focus();
  }

  insertQuotedMessage(event) {
    this.modifiedFlag = true;
    const {
      model
    } = this.props;
    const {
      partCreator
    } = model;
    const quoteParts = (0, _deserialize.parseEvent)(event, partCreator, {
      isQuotedMessage: true
    }); // add two newlines

    quoteParts.push(partCreator.newline());
    quoteParts.push(partCreator.newline());
    model.transform(() => {
      const addedLen = model.insert(quoteParts, model.positionForOffset(0));
      return model.positionForOffset(addedLen, true);
    }); // refocus on composer, as we just clicked "Quote"

    this.focus();
  }

  insertPlaintext(text) {
    this.modifiedFlag = true;
    const {
      model
    } = this.props;
    const {
      partCreator
    } = model;
    const caret = this.getCaret();
    const position = model.positionForOffset(caret.offset, caret.atNodeEnd);
    model.transform(() => {
      const addedLen = model.insert(partCreator.plainWithEmoji(text), position);
      return model.positionForOffset(caret.offset + addedLen, true);
    });
  }

}

exports.default = BasicMessageEditor;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSRUdFWF9FTU9USUNPTl9XSElURVNQQUNFIiwiUmVnRXhwIiwiRU1PVElDT05fUkVHRVgiLCJzb3VyY2UiLCJSRUdFWF9FTU9USUNPTiIsIlNVUlJPVU5EX1dJVEhfQ0hBUkFDVEVSUyIsIlNVUlJPVU5EX1dJVEhfRE9VQkxFX0NIQVJBQ1RFUlMiLCJNYXAiLCJjdHJsU2hvcnRjdXRMYWJlbCIsImtleSIsIm5lZWRzU2hpZnQiLCJuZWVkc0FsdCIsIklTX01BQyIsIl90IiwiQUxURVJOQVRFX0tFWV9OQU1FIiwiS2V5IiwiQ09OVFJPTCIsIlNISUZUIiwiQUxUIiwiY2xvbmVTZWxlY3Rpb24iLCJzZWxlY3Rpb24iLCJhbmNob3JOb2RlIiwiYW5jaG9yT2Zmc2V0IiwiZm9jdXNOb2RlIiwiZm9jdXNPZmZzZXQiLCJpc0NvbGxhcHNlZCIsInJhbmdlQ291bnQiLCJ0eXBlIiwic2VsZWN0aW9uRXF1YWxzIiwiYSIsImIiLCJCYXNpY01lc3NhZ2VFZGl0b3IiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjcmVhdGVSZWYiLCJIaXN0b3J5TWFuYWdlciIsImlucHV0VHlwZSIsImRpZmYiLCJyZW5kZXJNb2RlbCIsImVkaXRvclJlZiIsImN1cnJlbnQiLCJtb2RlbCIsInNldFNlbGVjdGlvbiIsImVyciIsImxvZ2dlciIsImVycm9yIiwicG9zaXRpb24iLCJSYW5nZSIsImVuZCIsInNldExhc3RDYXJldEZyb21Qb3NpdGlvbiIsImlzRW1wdHkiLCJwbGFjZWhvbGRlciIsInNob3dQbGFjZWhvbGRlciIsImhpZGVQbGFjZWhvbGRlciIsImZvcm1hdEJhclJlZiIsImhpZGUiLCJzZXRTdGF0ZSIsImF1dG9Db21wbGV0ZSIsInNob3dWaXN1YWxCZWxsIiwic3RhdGUiLCJoaXN0b3J5TWFuYWdlciIsInRyeVB1c2giLCJpc1R5cGluZyIsInBhcnRzIiwiY21kIiwicGFyc2VDb21tYW5kU3RyaW5nIiwidGV4dCIsImNvbW1hbmQiLCJDb21tYW5kTWFwIiwiZ2V0IiwiaXNFbmFibGVkIiwiY2F0ZWdvcnkiLCJDb21tYW5kQ2F0ZWdvcmllcyIsIm1lc3NhZ2VzIiwiVHlwaW5nU3RvcmUiLCJzaGFyZWRJbnN0YW5jZSIsInNldFNlbGZUeXBpbmciLCJyb29tIiwicm9vbUlkIiwidGhyZWFkSWQiLCJvbkNoYW5nZSIsImlzSU1FQ29tcG9zaW5nIiwidWEiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJ0b0xvd2VyQ2FzZSIsImlzU2FmYXJpIiwiaW5jbHVkZXMiLCJvbklucHV0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJ0aGVuIiwiZXZlbnQiLCJkb2N1bWVudCIsImdldFNlbGVjdGlvbiIsInRvU3RyaW5nIiwicmFuZ2UiLCJnZXRSYW5nZUZvclNlbGVjdGlvbiIsInNlbGVjdGVkUGFydHMiLCJtYXAiLCJwIiwic2VyaWFsaXplIiwiY2xpcGJvYXJkRGF0YSIsInNldERhdGEiLCJKU09OIiwic3RyaW5naWZ5IiwibW9kaWZpZWRGbGFnIiwicmVwbGFjZVJhbmdlQW5kTW92ZUNhcmV0IiwicHJldmVudERlZmF1bHQiLCJvbkN1dENvcHkiLCJvblBhc3RlIiwicGFydENyZWF0b3IiLCJwbGFpblRleHQiLCJnZXREYXRhIiwicGFydHNUZXh0Iiwic2VyaWFsaXplZFRleHRQYXJ0cyIsInBhcnNlIiwiZGVzZXJpYWxpemVQYXJ0IiwicGFyc2VQbGFpblRleHRNZXNzYWdlIiwic2hvdWxkRXNjYXBlIiwibGVuZ3RoIiwibGlua2lmeSIsInRlc3QiLCJmb3JtYXRSYW5nZUFzTGluayIsInNlbCIsImNhcmV0IiwiZ2V0Q2FyZXRPZmZzZXRBbmRUZXh0IiwidXBkYXRlIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsIm9uU2VsZWN0aW9uQ2hhbmdlIiwiYWRkRXZlbnRMaXN0ZW5lciIsImxhc3RTZWxlY3Rpb24iLCJyZWZyZXNoTGFzdENhcmV0SWZOZWVkZWQiLCJoYXNUZXh0U2VsZWN0ZWQiLCJ1c2VNYXJrZG93biIsInRyaW0iLCJzZWxlY3Rpb25SZWN0IiwiZ2V0UmFuZ2VBdCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsInNob3dBdCIsImhhbmRsZWQiLCJzdXJyb3VuZFdpdGgiLCJzZWxlY3Rpb25SYW5nZSIsImtleXMiLCJlbnN1cmVMYXN0Q2hhbmdlc1B1c2hlZCIsInRvZ2dsZUlubGluZUZvcm1hdCIsImF1dG9jb21wbGV0ZUFjdGlvbiIsImdldEtleUJpbmRpbmdzTWFuYWdlciIsImdldEF1dG9jb21wbGV0ZUFjdGlvbiIsImFjY2Vzc2liaWxpdHlBY3Rpb24iLCJnZXRBY2Nlc3NpYmlsaXR5QWN0aW9uIiwiaGFzQ29tcGxldGlvbnMiLCJLZXlCaW5kaW5nQWN0aW9uIiwiRm9yY2VDb21wbGV0ZUF1dG9jb21wbGV0ZSIsIkNvbXBsZXRlQXV0b2NvbXBsZXRlIiwiY29uZmlybUNvbXBsZXRpb24iLCJQcmV2U2VsZWN0aW9uSW5BdXRvY29tcGxldGUiLCJzZWxlY3RQcmV2aW91c1NlbGVjdGlvbiIsIk5leHRTZWxlY3Rpb25JbkF1dG9jb21wbGV0ZSIsInNlbGVjdE5leHRTZWxlY3Rpb24iLCJDYW5jZWxBdXRvY29tcGxldGUiLCJvbkVzY2FwZSIsInRhYkNvbXBsZXRlTmFtZSIsIkRlbGV0ZSIsIkJhY2tzcGFjZSIsInN0b3BQcm9wYWdhdGlvbiIsImFjdGlvbiIsImdldE1lc3NhZ2VDb21wb3NlckFjdGlvbiIsIkZvcm1hdEJvbGQiLCJvbkZvcm1hdEFjdGlvbiIsIkZvcm1hdHRpbmciLCJCb2xkIiwiRm9ybWF0SXRhbGljcyIsIkl0YWxpY3MiLCJGb3JtYXRDb2RlIiwiQ29kZSIsIkZvcm1hdFF1b3RlIiwiUXVvdGUiLCJGb3JtYXRMaW5rIiwiSW5zZXJ0TGluayIsIkVkaXRSZWRvIiwiY2FuUmVkbyIsInJlZG8iLCJyZXNldCIsIkVkaXRVbmRvIiwiY2FuVW5kbyIsInVuZG8iLCJOZXdMaW5lIiwiaW5zZXJ0VGV4dCIsIk1vdmVDdXJzb3JUb1N0YXJ0IiwiaW5kZXgiLCJvZmZzZXQiLCJNb3ZlQ3Vyc29yVG9FbmQiLCJjb21wbGV0aW9uIiwib25Db21wb25lbnRDb25maXJtIiwiY29tcGxldGlvbkluZGV4IiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwic2V0VHJhbnNmb3JtQ2FsbGJhY2siLCJ0cmFuc2Zvcm0iLCJzaG93UGlsbEF2YXRhciIsImRvY3VtZW50UG9zaXRpb24iLCJzaG91bGRSZXBsYWNlIiwicmVwbGFjZUVtb3RpY29uIiwiZm9ybWF0UmFuZ2UiLCJ1c2VNYXJrZG93bkhhbmRsZSIsIndhdGNoU2V0dGluZyIsImNvbmZpZ3VyZVVzZU1hcmtkb3duIiwiZW1vdGljb25TZXR0aW5nSGFuZGxlIiwiY29uZmlndXJlRW1vdGljb25BdXRvUmVwbGFjZSIsInNob3VsZFNob3dQaWxsQXZhdGFyU2V0dGluZ0hhbmRsZSIsImNvbmZpZ3VyZVNob3VsZFNob3dQaWxsQXZhdGFyIiwic3Vycm91bmRXaXRoSGFuZGxlIiwic3Vycm91bmRXaXRoU2V0dGluZ0NoYW5nZWQiLCJjb21wb25lbnREaWRVcGRhdGUiLCJwcmV2UHJvcHMiLCJlbmFibGVkQ2hhbmdlIiwiZGlzYWJsZWQiLCJwbGFjZWhvbGRlckNoYW5nZWQiLCJjYXJldFBvc2l0aW9uIiwicmVnZXgiLCJzdGFydFJhbmdlIiwibiIsImV4cGFuZEJhY2t3YXJkc1doaWxlIiwicGFydCIsIlR5cGUiLCJQbGFpbiIsIlBpbGxDYW5kaWRhdGUiLCJOZXdsaW5lIiwiZW1vdGljb25NYXRjaCIsImV4ZWMiLCJxdWVyeSIsInJlcGxhY2UiLCJkYXRhIiwiRU1PVElDT05fVE9fRU1PSkkiLCJmaXJzdE1hdGNoIiwibW92ZVN0YXJ0IiwibW92ZVN0YXJ0Rm9yd2FyZHMiLCJtb3ZlRW5kQmFja3dhcmRzIiwiZW1vamkiLCJ1bmljb2RlIiwic3R5bGUiLCJzZXRQcm9wZXJ0eSIsImNsYXNzTGlzdCIsImFkZCIsInJlbW92ZSIsInJlbW92ZVByb3BlcnR5IiwiaXNDb21wb3NpbmciLCJuYXRpdmVFdmVudCIsInRleHRUb0luc2VydCIsIm5ld1RleHQiLCJzbGljZSIsIl9pc0NhcmV0QXRFbmQiLCJpc0F0RW5kIiwibGFzdENhcmV0IiwiYXNPZmZzZXQiLCJjbGVhclVuZG9IaXN0b3J5IiwiY2xlYXIiLCJnZXRDYXJldCIsImlzU2VsZWN0aW9uQ29sbGFwc2VkIiwiaXNDYXJldEF0U3RhcnQiLCJpc0NhcmV0QXRFbmQiLCJwb3NpdGlvbkZvck9mZnNldCIsImF0Tm9kZUVuZCIsIkNvbW1hbmQiLCJhZGRlZExlbiIsInBpbGxDYW5kaWRhdGUiLCJzdGFydFNlbGVjdGlvbiIsImhhc1NlbGVjdGlvbiIsImNsb3NlIiwiaXNNb2RpZmllZCIsImNvbXBvbmVudFdpbGxVbm1vdW50Iiwib25Db21wb3NpdGlvblN0YXJ0Iiwib25Db21wb3NpdGlvbkVuZCIsInVud2F0Y2hTZXR0aW5nIiwiY29tcG9uZW50RGlkTW91bnQiLCJzZXRVcGRhdGVDYWxsYmFjayIsInVwZGF0ZUVkaXRvclN0YXRlIiwic2V0QXV0b0NvbXBsZXRlQ3JlYXRvciIsImdldEF1dG9Db21wbGV0ZUNyZWF0b3IiLCJhdXRvY29tcGxldGVSZWYiLCJnZXRJbml0aWFsQ2FyZXRQb3NpdGlvbiIsImZvY3VzIiwiaW5pdGlhbENhcmV0IiwiZ2V0UG9zaXRpb25BdEVuZCIsInJlbmRlciIsInF1ZXJ5TGVuIiwib25BdXRvQ29tcGxldGVDb25maXJtIiwib25BdXRvQ29tcGxldGVTZWxlY3Rpb25DaGFuZ2UiLCJiZWdpbm5pbmciLCJzdGFydCIsIndyYXBwZXJDbGFzc2VzIiwiY2xhc3NOYW1lcyIsImNsYXNzZXMiLCJzaG9ydGN1dHMiLCJoYXNBdXRvY29tcGxldGUiLCJCb29sZWFuIiwiYWN0aXZlRGVzY2VuZGFudCIsImdlbmVyYXRlQ29tcGxldGlvbkRvbUlkIiwib25CbHVyIiwib25Gb2N1cyIsIm9uQ29weSIsIm9uQ3V0Iiwib25LZXlEb3duIiwibGFiZWwiLCJ1bmRlZmluZWQiLCJpbnNlcnRNZW50aW9uIiwidXNlcklkIiwibWVtYmVyIiwiZ2V0TWVtYmVyIiwiZGlzcGxheU5hbWUiLCJyYXdEaXNwbGF5TmFtZSIsImNyZWF0ZU1lbnRpb25QYXJ0cyIsImluc2VydCIsImluc2VydFF1b3RlZE1lc3NhZ2UiLCJxdW90ZVBhcnRzIiwicGFyc2VFdmVudCIsImlzUXVvdGVkTWVzc2FnZSIsInB1c2giLCJuZXdsaW5lIiwiaW5zZXJ0UGxhaW50ZXh0IiwicGxhaW5XaXRoRW1vamkiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9yb29tcy9CYXNpY01lc3NhZ2VDb21wb3Nlci50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IC0gMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IFJlYWN0LCB7IGNyZWF0ZVJlZiwgQ2xpcGJvYXJkRXZlbnQgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb20nO1xuaW1wb3J0IHsgTWF0cml4RXZlbnQgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnQnO1xuaW1wb3J0IEVNT1RJQ09OX1JFR0VYIGZyb20gJ2Vtb2ppYmFzZS1yZWdleC9lbW90aWNvbic7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5cbmltcG9ydCBFZGl0b3JNb2RlbCBmcm9tICcuLi8uLi8uLi9lZGl0b3IvbW9kZWwnO1xuaW1wb3J0IEhpc3RvcnlNYW5hZ2VyIGZyb20gJy4uLy4uLy4uL2VkaXRvci9oaXN0b3J5JztcbmltcG9ydCB7IENhcmV0LCBzZXRTZWxlY3Rpb24gfSBmcm9tICcuLi8uLi8uLi9lZGl0b3IvY2FyZXQnO1xuaW1wb3J0IHsgZm9ybWF0UmFuZ2UsIGZvcm1hdFJhbmdlQXNMaW5rLCByZXBsYWNlUmFuZ2VBbmRNb3ZlQ2FyZXQsIHRvZ2dsZUlubGluZUZvcm1hdCB9XG4gICAgZnJvbSAnLi4vLi4vLi4vZWRpdG9yL29wZXJhdGlvbnMnO1xuaW1wb3J0IHsgZ2V0Q2FyZXRPZmZzZXRBbmRUZXh0LCBnZXRSYW5nZUZvclNlbGVjdGlvbiB9IGZyb20gJy4uLy4uLy4uL2VkaXRvci9kb20nO1xuaW1wb3J0IEF1dG9jb21wbGV0ZSwgeyBnZW5lcmF0ZUNvbXBsZXRpb25Eb21JZCB9IGZyb20gJy4uL3Jvb21zL0F1dG9jb21wbGV0ZSc7XG5pbXBvcnQgeyBnZXRBdXRvQ29tcGxldGVDcmVhdG9yLCBQYXJ0LCBUeXBlIH0gZnJvbSAnLi4vLi4vLi4vZWRpdG9yL3BhcnRzJztcbmltcG9ydCB7IHBhcnNlRXZlbnQsIHBhcnNlUGxhaW5UZXh0TWVzc2FnZSB9IGZyb20gJy4uLy4uLy4uL2VkaXRvci9kZXNlcmlhbGl6ZSc7XG5pbXBvcnQgeyByZW5kZXJNb2RlbCB9IGZyb20gJy4uLy4uLy4uL2VkaXRvci9yZW5kZXInO1xuaW1wb3J0IFR5cGluZ1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvVHlwaW5nU3RvcmVcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgeyBJU19NQUMsIEtleSB9IGZyb20gXCIuLi8uLi8uLi9LZXlib2FyZFwiO1xuaW1wb3J0IHsgRU1PVElDT05fVE9fRU1PSkkgfSBmcm9tIFwiLi4vLi4vLi4vZW1vamlcIjtcbmltcG9ydCB7IENvbW1hbmRDYXRlZ29yaWVzLCBDb21tYW5kTWFwLCBwYXJzZUNvbW1hbmRTdHJpbmcgfSBmcm9tIFwiLi4vLi4vLi4vU2xhc2hDb21tYW5kc1wiO1xuaW1wb3J0IFJhbmdlIGZyb20gXCIuLi8uLi8uLi9lZGl0b3IvcmFuZ2VcIjtcbmltcG9ydCBNZXNzYWdlQ29tcG9zZXJGb3JtYXRCYXIsIHsgRm9ybWF0dGluZyB9IGZyb20gXCIuL01lc3NhZ2VDb21wb3NlckZvcm1hdEJhclwiO1xuaW1wb3J0IERvY3VtZW50T2Zmc2V0IGZyb20gXCIuLi8uLi8uLi9lZGl0b3Ivb2Zmc2V0XCI7XG5pbXBvcnQgeyBJRGlmZiB9IGZyb20gXCIuLi8uLi8uLi9lZGl0b3IvZGlmZlwiO1xuaW1wb3J0IEF1dG9jb21wbGV0ZVdyYXBwZXJNb2RlbCBmcm9tIFwiLi4vLi4vLi4vZWRpdG9yL2F1dG9jb21wbGV0ZVwiO1xuaW1wb3J0IERvY3VtZW50UG9zaXRpb24gZnJvbSAnLi4vLi4vLi4vZWRpdG9yL3Bvc2l0aW9uJztcbmltcG9ydCB7IElDb21wbGV0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL2F1dG9jb21wbGV0ZS9BdXRvY29tcGxldGVyXCI7XG5pbXBvcnQgeyBnZXRLZXlCaW5kaW5nc01hbmFnZXIgfSBmcm9tICcuLi8uLi8uLi9LZXlCaW5kaW5nc01hbmFnZXInO1xuaW1wb3J0IHsgQUxURVJOQVRFX0tFWV9OQU1FLCBLZXlCaW5kaW5nQWN0aW9uIH0gZnJvbSAnLi4vLi4vLi4vYWNjZXNzaWJpbGl0eS9LZXlib2FyZFNob3J0Y3V0cyc7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7IGxpbmtpZnkgfSBmcm9tICcuLi8uLi8uLi9saW5raWZ5LW1hdHJpeCc7XG5cbi8vIG1hdGNoZXMgZW1vdGljb25zIHdoaWNoIGZvbGxvdyB0aGUgc3RhcnQgb2YgYSBsaW5lIG9yIHdoaXRlc3BhY2VcbmNvbnN0IFJFR0VYX0VNT1RJQ09OX1dISVRFU1BBQ0UgPSBuZXcgUmVnRXhwKCcoPzpefFxcXFxzKSgnICsgRU1PVElDT05fUkVHRVguc291cmNlICsgJylcXFxcc3w6XiQnKTtcbmV4cG9ydCBjb25zdCBSRUdFWF9FTU9USUNPTiA9IG5ldyBSZWdFeHAoJyg/Ol58XFxcXHMpKCcgKyBFTU9USUNPTl9SRUdFWC5zb3VyY2UgKyAnKSQnKTtcblxuY29uc3QgU1VSUk9VTkRfV0lUSF9DSEFSQUNURVJTID0gW1wiXFxcIlwiLCBcIl9cIiwgXCJgXCIsIFwiJ1wiLCBcIipcIiwgXCJ+XCIsIFwiJFwiXTtcbmNvbnN0IFNVUlJPVU5EX1dJVEhfRE9VQkxFX0NIQVJBQ1RFUlMgPSBuZXcgTWFwKFtcbiAgICBbXCIoXCIsIFwiKVwiXSxcbiAgICBbXCJbXCIsIFwiXVwiXSxcbiAgICBbXCJ7XCIsIFwifVwiXSxcbiAgICBbXCI8XCIsIFwiPlwiXSxcbl0pO1xuXG5mdW5jdGlvbiBjdHJsU2hvcnRjdXRMYWJlbChrZXk6IHN0cmluZywgbmVlZHNTaGlmdCA9IGZhbHNlLCBuZWVkc0FsdCA9IGZhbHNlKTogc3RyaW5nIHtcbiAgICByZXR1cm4gKElTX01BQyA/IFwi4oyYXCIgOiBfdChBTFRFUk5BVEVfS0VZX05BTUVbS2V5LkNPTlRST0xdKSkgK1xuICAgICAgICAobmVlZHNTaGlmdCA/IChcIitcIiArIF90KEFMVEVSTkFURV9LRVlfTkFNRVtLZXkuU0hJRlRdKSkgOiBcIlwiKSArXG4gICAgICAgIChuZWVkc0FsdCA/IChcIitcIiArIF90KEFMVEVSTkFURV9LRVlfTkFNRVtLZXkuQUxUXSkpIDogXCJcIikgK1xuICAgICAgICBcIitcIiArIGtleTtcbn1cblxuZnVuY3Rpb24gY2xvbmVTZWxlY3Rpb24oc2VsZWN0aW9uOiBTZWxlY3Rpb24pOiBQYXJ0aWFsPFNlbGVjdGlvbj4ge1xuICAgIHJldHVybiB7XG4gICAgICAgIGFuY2hvck5vZGU6IHNlbGVjdGlvbi5hbmNob3JOb2RlLFxuICAgICAgICBhbmNob3JPZmZzZXQ6IHNlbGVjdGlvbi5hbmNob3JPZmZzZXQsXG4gICAgICAgIGZvY3VzTm9kZTogc2VsZWN0aW9uLmZvY3VzTm9kZSxcbiAgICAgICAgZm9jdXNPZmZzZXQ6IHNlbGVjdGlvbi5mb2N1c09mZnNldCxcbiAgICAgICAgaXNDb2xsYXBzZWQ6IHNlbGVjdGlvbi5pc0NvbGxhcHNlZCxcbiAgICAgICAgcmFuZ2VDb3VudDogc2VsZWN0aW9uLnJhbmdlQ291bnQsXG4gICAgICAgIHR5cGU6IHNlbGVjdGlvbi50eXBlLFxuICAgIH07XG59XG5cbmZ1bmN0aW9uIHNlbGVjdGlvbkVxdWFscyhhOiBQYXJ0aWFsPFNlbGVjdGlvbj4sIGI6IFNlbGVjdGlvbik6IGJvb2xlYW4ge1xuICAgIHJldHVybiBhLmFuY2hvck5vZGUgPT09IGIuYW5jaG9yTm9kZSAmJlxuICAgICAgICBhLmFuY2hvck9mZnNldCA9PT0gYi5hbmNob3JPZmZzZXQgJiZcbiAgICAgICAgYS5mb2N1c05vZGUgPT09IGIuZm9jdXNOb2RlICYmXG4gICAgICAgIGEuZm9jdXNPZmZzZXQgPT09IGIuZm9jdXNPZmZzZXQgJiZcbiAgICAgICAgYS5pc0NvbGxhcHNlZCA9PT0gYi5pc0NvbGxhcHNlZCAmJlxuICAgICAgICBhLnJhbmdlQ291bnQgPT09IGIucmFuZ2VDb3VudCAmJlxuICAgICAgICBhLnR5cGUgPT09IGIudHlwZTtcbn1cblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgbW9kZWw6IEVkaXRvck1vZGVsO1xuICAgIHJvb206IFJvb207XG4gICAgdGhyZWFkSWQ/OiBzdHJpbmc7XG4gICAgcGxhY2Vob2xkZXI/OiBzdHJpbmc7XG4gICAgbGFiZWw/OiBzdHJpbmc7XG4gICAgaW5pdGlhbENhcmV0PzogRG9jdW1lbnRPZmZzZXQ7XG4gICAgZGlzYWJsZWQ/OiBib29sZWFuO1xuXG4gICAgb25DaGFuZ2U/KCk7XG4gICAgb25QYXN0ZT8oZXZlbnQ6IENsaXBib2FyZEV2ZW50PEhUTUxEaXZFbGVtZW50PiwgbW9kZWw6IEVkaXRvck1vZGVsKTogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgdXNlTWFya2Rvd246IGJvb2xlYW47XG4gICAgc2hvd1BpbGxBdmF0YXI6IGJvb2xlYW47XG4gICAgcXVlcnk/OiBzdHJpbmc7XG4gICAgc2hvd1Zpc3VhbEJlbGw/OiBib29sZWFuO1xuICAgIGF1dG9Db21wbGV0ZT86IEF1dG9jb21wbGV0ZVdyYXBwZXJNb2RlbDtcbiAgICBjb21wbGV0aW9uSW5kZXg/OiBudW1iZXI7XG4gICAgc3Vycm91bmRXaXRoOiBib29sZWFuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYXNpY01lc3NhZ2VFZGl0b3IgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwdWJsaWMgcmVhZG9ubHkgZWRpdG9yUmVmID0gY3JlYXRlUmVmPEhUTUxEaXZFbGVtZW50PigpO1xuICAgIHByaXZhdGUgYXV0b2NvbXBsZXRlUmVmID0gY3JlYXRlUmVmPEF1dG9jb21wbGV0ZT4oKTtcbiAgICBwcml2YXRlIGZvcm1hdEJhclJlZiA9IGNyZWF0ZVJlZjxNZXNzYWdlQ29tcG9zZXJGb3JtYXRCYXI+KCk7XG5cbiAgICBwcml2YXRlIG1vZGlmaWVkRmxhZyA9IGZhbHNlO1xuICAgIHByaXZhdGUgaXNJTUVDb21wb3NpbmcgPSBmYWxzZTtcbiAgICBwcml2YXRlIGhhc1RleHRTZWxlY3RlZCA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBfaXNDYXJldEF0RW5kOiBib29sZWFuO1xuICAgIHByaXZhdGUgbGFzdENhcmV0OiBEb2N1bWVudE9mZnNldDtcbiAgICBwcml2YXRlIGxhc3RTZWxlY3Rpb246IFJldHVyblR5cGU8dHlwZW9mIGNsb25lU2VsZWN0aW9uPjtcblxuICAgIHByaXZhdGUgcmVhZG9ubHkgdXNlTWFya2Rvd25IYW5kbGU6IHN0cmluZztcbiAgICBwcml2YXRlIHJlYWRvbmx5IGVtb3RpY29uU2V0dGluZ0hhbmRsZTogc3RyaW5nO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgc2hvdWxkU2hvd1BpbGxBdmF0YXJTZXR0aW5nSGFuZGxlOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSByZWFkb25seSBzdXJyb3VuZFdpdGhIYW5kbGU6IHN0cmluZztcbiAgICBwcml2YXRlIHJlYWRvbmx5IGhpc3RvcnlNYW5hZ2VyID0gbmV3IEhpc3RvcnlNYW5hZ2VyKCk7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBzaG93UGlsbEF2YXRhcjogU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcIlBpbGwuc2hvdWxkU2hvd1BpbGxBdmF0YXJcIiksXG4gICAgICAgICAgICB1c2VNYXJrZG93bjogU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcIk1lc3NhZ2VDb21wb3NlcklucHV0LnVzZU1hcmtkb3duXCIpLFxuICAgICAgICAgICAgc3Vycm91bmRXaXRoOiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiTWVzc2FnZUNvbXBvc2VySW5wdXQuc3Vycm91bmRXaXRoXCIpLFxuICAgICAgICAgICAgc2hvd1Zpc3VhbEJlbGw6IGZhbHNlLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMudXNlTWFya2Rvd25IYW5kbGUgPSBTZXR0aW5nc1N0b3JlLndhdGNoU2V0dGluZygnTWVzc2FnZUNvbXBvc2VySW5wdXQudXNlTWFya2Rvd24nLCBudWxsLFxuICAgICAgICAgICAgdGhpcy5jb25maWd1cmVVc2VNYXJrZG93bik7XG4gICAgICAgIHRoaXMuZW1vdGljb25TZXR0aW5nSGFuZGxlID0gU2V0dGluZ3NTdG9yZS53YXRjaFNldHRpbmcoJ01lc3NhZ2VDb21wb3NlcklucHV0LmF1dG9SZXBsYWNlRW1vamknLCBudWxsLFxuICAgICAgICAgICAgdGhpcy5jb25maWd1cmVFbW90aWNvbkF1dG9SZXBsYWNlKTtcbiAgICAgICAgdGhpcy5jb25maWd1cmVFbW90aWNvbkF1dG9SZXBsYWNlKCk7XG4gICAgICAgIHRoaXMuc2hvdWxkU2hvd1BpbGxBdmF0YXJTZXR0aW5nSGFuZGxlID0gU2V0dGluZ3NTdG9yZS53YXRjaFNldHRpbmcoXCJQaWxsLnNob3VsZFNob3dQaWxsQXZhdGFyXCIsIG51bGwsXG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyZVNob3VsZFNob3dQaWxsQXZhdGFyKTtcbiAgICAgICAgdGhpcy5zdXJyb3VuZFdpdGhIYW5kbGUgPSBTZXR0aW5nc1N0b3JlLndhdGNoU2V0dGluZyhcIk1lc3NhZ2VDb21wb3NlcklucHV0LnN1cnJvdW5kV2l0aFwiLCBudWxsLFxuICAgICAgICAgICAgdGhpcy5zdXJyb3VuZFdpdGhTZXR0aW5nQ2hhbmdlZCk7XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHM6IElQcm9wcykge1xuICAgICAgICAvLyBXZSBuZWVkIHRvIHJlLWNoZWNrIHRoZSBwbGFjZWhvbGRlciB3aGVuIHRoZSBlbmFibGVkIHN0YXRlIGNoYW5nZXMgYmVjYXVzZSBpdCBjYXVzZXMgdGhlXG4gICAgICAgIC8vIHBsYWNlaG9sZGVyIGVsZW1lbnQgdG8gcmVtb3VudCwgd2hpY2ggZ2V0cyByaWQgb2YgdGhlIGA6OmJlZm9yZWAgY2xhc3MuIFJlLWV2YWx1YXRpbmcgdGhlXG4gICAgICAgIC8vIHBsYWNlaG9sZGVyIG1lYW5zIHdlIGdldCBhIHByb3BlciBgOjpiZWZvcmVgIHdpdGggdGhlIHBsYWNlaG9sZGVyLlxuICAgICAgICBjb25zdCBlbmFibGVkQ2hhbmdlID0gdGhpcy5wcm9wcy5kaXNhYmxlZCAhPT0gcHJldlByb3BzLmRpc2FibGVkO1xuICAgICAgICBjb25zdCBwbGFjZWhvbGRlckNoYW5nZWQgPSB0aGlzLnByb3BzLnBsYWNlaG9sZGVyICE9PSBwcmV2UHJvcHMucGxhY2Vob2xkZXI7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnBsYWNlaG9sZGVyICYmIChwbGFjZWhvbGRlckNoYW5nZWQgfHwgZW5hYmxlZENoYW5nZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgaXNFbXB0eSB9ID0gdGhpcy5wcm9wcy5tb2RlbDtcbiAgICAgICAgICAgIGlmIChpc0VtcHR5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93UGxhY2Vob2xkZXIoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlUGxhY2Vob2xkZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyByZXBsYWNlRW1vdGljb24oY2FyZXRQb3NpdGlvbjogRG9jdW1lbnRQb3NpdGlvbiwgcmVnZXg6IFJlZ0V4cCk6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IHsgbW9kZWwgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGNvbnN0IHJhbmdlID0gbW9kZWwuc3RhcnRSYW5nZShjYXJldFBvc2l0aW9uKTtcbiAgICAgICAgLy8gZXhwYW5kIHJhbmdlIG1heCA4IGNoYXJhY3RlcnMgYmFja3dhcmRzIGZyb20gY2FyZXRQb3NpdGlvbixcbiAgICAgICAgLy8gYXMgYSBzcGFjZSB0byBsb29rIGZvciBhbiBlbW90aWNvblxuICAgICAgICBsZXQgbiA9IDg7XG4gICAgICAgIHJhbmdlLmV4cGFuZEJhY2t3YXJkc1doaWxlKChpbmRleCwgb2Zmc2V0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwYXJ0ID0gbW9kZWwucGFydHNbaW5kZXhdO1xuICAgICAgICAgICAgbiAtPSAxO1xuICAgICAgICAgICAgcmV0dXJuIG4gPj0gMCAmJiBbVHlwZS5QbGFpbiwgVHlwZS5QaWxsQ2FuZGlkYXRlLCBUeXBlLk5ld2xpbmVdLmluY2x1ZGVzKHBhcnQudHlwZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBlbW90aWNvbk1hdGNoID0gcmVnZXguZXhlYyhyYW5nZS50ZXh0KTtcbiAgICAgICAgaWYgKGVtb3RpY29uTWF0Y2gpIHtcbiAgICAgICAgICAgIGNvbnN0IHF1ZXJ5ID0gZW1vdGljb25NYXRjaFsxXS5yZXBsYWNlKFwiLVwiLCBcIlwiKTtcbiAgICAgICAgICAgIC8vIHRyeSBib3RoIGV4YWN0IG1hdGNoIGFuZCBsb3dlci1jYXNlLCB0aGlzIG1lYW5zIHRoYXQgeGQgd29uJ3QgbWF0Y2ggeEQgYnV0IDpQIHdpbGwgbWF0Y2ggOnBcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBFTU9USUNPTl9UT19FTU9KSS5nZXQocXVlcnkpIHx8IEVNT1RJQ09OX1RPX0VNT0pJLmdldChxdWVyeS50b0xvd2VyQ2FzZSgpKTtcblxuICAgICAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IHBhcnRDcmVhdG9yIH0gPSBtb2RlbDtcbiAgICAgICAgICAgICAgICBjb25zdCBmaXJzdE1hdGNoID0gZW1vdGljb25NYXRjaFswXTtcbiAgICAgICAgICAgICAgICBjb25zdCBtb3ZlU3RhcnQgPSBmaXJzdE1hdGNoWzBdID09PSBcIiBcIiA/IDEgOiAwO1xuXG4gICAgICAgICAgICAgICAgLy8gd2UgbmVlZCB0aGUgcmFuZ2UgdG8gb25seSBjb21wcmlzZSBvZiB0aGUgZW1vdGljb25cbiAgICAgICAgICAgICAgICAvLyBiZWNhdXNlIHdlJ2xsIHJlcGxhY2UgdGhlIHdob2xlIHJhbmdlIHdpdGggYW4gZW1vamksXG4gICAgICAgICAgICAgICAgLy8gc28gbW92ZSB0aGUgc3RhcnQgZm9yd2FyZCB0byB0aGUgc3RhcnQgb2YgdGhlIGVtb3RpY29uLlxuICAgICAgICAgICAgICAgIC8vIFRha2UgKyAxIGJlY2F1c2UgaW5kZXggaXMgcmVwb3J0ZWQgd2l0aG91dCB0aGUgcG9zc2libGUgcHJlY2VkaW5nIHNwYWNlLlxuICAgICAgICAgICAgICAgIHJhbmdlLm1vdmVTdGFydEZvcndhcmRzKGVtb3RpY29uTWF0Y2guaW5kZXggKyBtb3ZlU3RhcnQpO1xuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBlbmQgaXMgYSB0cmFpbGluZyBzcGFjZS9uZXdsaW5lIG1vdmUgZW5kIGJhY2t3YXJkcywgc28gdGhhdCB3ZSBkb24ndCByZXBsYWNlIGl0XG4gICAgICAgICAgICAgICAgaWYgKFtcIlxcblwiLCBcIiBcIl0uaW5jbHVkZXMoZmlyc3RNYXRjaFtmaXJzdE1hdGNoLmxlbmd0aCAtIDFdKSkge1xuICAgICAgICAgICAgICAgICAgICByYW5nZS5tb3ZlRW5kQmFja3dhcmRzKDEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIHRoaXMgcmV0dXJucyB0aGUgYW1vdW50IG9mIGFkZGVkL3JlbW92ZWQgY2hhcmFjdGVycyBkdXJpbmcgdGhlIHJlcGxhY2VcbiAgICAgICAgICAgICAgICAvLyBzbyB0aGUgY2FyZXQgcG9zaXRpb24gY2FuIGJlIGFkanVzdGVkLlxuICAgICAgICAgICAgICAgIHJldHVybiByYW5nZS5yZXBsYWNlKFtwYXJ0Q3JlYXRvci5lbW9qaShkYXRhLnVuaWNvZGUpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHVwZGF0ZUVkaXRvclN0YXRlID0gKHNlbGVjdGlvbjogQ2FyZXQsIGlucHV0VHlwZT86IHN0cmluZywgZGlmZj86IElEaWZmKTogdm9pZCA9PiB7XG4gICAgICAgIHJlbmRlck1vZGVsKHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQsIHRoaXMucHJvcHMubW9kZWwpO1xuICAgICAgICBpZiAoc2VsZWN0aW9uKSB7IC8vIHNldCB0aGUgY2FyZXQvc2VsZWN0aW9uXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHNldFNlbGVjdGlvbih0aGlzLmVkaXRvclJlZi5jdXJyZW50LCB0aGlzLnByb3BzLm1vZGVsLCBzZWxlY3Rpb24pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBpZiBjYXJldCBzZWxlY3Rpb24gaXMgYSByYW5nZSwgdGFrZSB0aGUgZW5kIHBvc2l0aW9uXG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHNlbGVjdGlvbiBpbnN0YW5jZW9mIFJhbmdlID8gc2VsZWN0aW9uLmVuZCA6IHNlbGVjdGlvbjtcbiAgICAgICAgICAgIHRoaXMuc2V0TGFzdENhcmV0RnJvbVBvc2l0aW9uKHBvc2l0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7IGlzRW1wdHkgfSA9IHRoaXMucHJvcHMubW9kZWw7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnBsYWNlaG9sZGVyKSB7XG4gICAgICAgICAgICBpZiAoaXNFbXB0eSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1BsYWNlaG9sZGVyKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuaGlkZVBsYWNlaG9sZGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzRW1wdHkpIHtcbiAgICAgICAgICAgIHRoaXMuZm9ybWF0QmFyUmVmLmN1cnJlbnQuaGlkZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYXV0b0NvbXBsZXRlOiB0aGlzLnByb3BzLm1vZGVsLmF1dG9Db21wbGV0ZSxcbiAgICAgICAgICAgIC8vIGlmIGEgY2hhbmdlIGlzIGhhcHBlbmluZyB0aGVuIGNsZWFyIHRoZSBzaG93VmlzdWFsQmVsbFxuICAgICAgICAgICAgc2hvd1Zpc3VhbEJlbGw6IGRpZmYgPyBmYWxzZSA6IHRoaXMuc3RhdGUuc2hvd1Zpc3VhbEJlbGwsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmhpc3RvcnlNYW5hZ2VyLnRyeVB1c2godGhpcy5wcm9wcy5tb2RlbCwgc2VsZWN0aW9uLCBpbnB1dFR5cGUsIGRpZmYpO1xuXG4gICAgICAgIC8vIGlucHV0VHlwZSBpcyBmYWxzeSBkdXJpbmcgaW5pdGlhbCBtb3VudCwgZG9uJ3QgY29uc2lkZXIgcmUtbG9hZGluZyB0aGUgZHJhZnQgYXMgdHlwaW5nXG4gICAgICAgIGxldCBpc1R5cGluZyA9ICF0aGlzLnByb3BzLm1vZGVsLmlzRW1wdHkgJiYgISFpbnB1dFR5cGU7XG4gICAgICAgIC8vIElmIHRoZSB1c2VyIGlzIGVudGVyaW5nIGEgY29tbWFuZCwgb25seSBjb25zaWRlciB0aGVtIHR5cGluZyBpZiBpdCBpcyBvbmUgd2hpY2ggc2VuZHMgYSBtZXNzYWdlIGludG8gdGhlIHJvb21cbiAgICAgICAgaWYgKGlzVHlwaW5nICYmIHRoaXMucHJvcHMubW9kZWwucGFydHNbMF0udHlwZSA9PT0gXCJjb21tYW5kXCIpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgY21kIH0gPSBwYXJzZUNvbW1hbmRTdHJpbmcodGhpcy5wcm9wcy5tb2RlbC5wYXJ0c1swXS50ZXh0KTtcbiAgICAgICAgICAgIGNvbnN0IGNvbW1hbmQgPSBDb21tYW5kTWFwLmdldChjbWQpO1xuICAgICAgICAgICAgaWYgKCFjb21tYW5kIHx8ICFjb21tYW5kLmlzRW5hYmxlZCgpIHx8IGNvbW1hbmQuY2F0ZWdvcnkgIT09IENvbW1hbmRDYXRlZ29yaWVzLm1lc3NhZ2VzKSB7XG4gICAgICAgICAgICAgICAgaXNUeXBpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBUeXBpbmdTdG9yZS5zaGFyZWRJbnN0YW5jZSgpLnNldFNlbGZUeXBpbmcoXG4gICAgICAgICAgICB0aGlzLnByb3BzLnJvb20ucm9vbUlkLFxuICAgICAgICAgICAgdGhpcy5wcm9wcy50aHJlYWRJZCxcbiAgICAgICAgICAgIGlzVHlwaW5nLFxuICAgICAgICApO1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBzaG93UGxhY2Vob2xkZXIoKTogdm9pZCB7XG4gICAgICAgIC8vIGVzY2FwZSBzaW5nbGUgcXVvdGVzXG4gICAgICAgIGNvbnN0IHBsYWNlaG9sZGVyID0gdGhpcy5wcm9wcy5wbGFjZWhvbGRlci5yZXBsYWNlKC8nL2csICdcXFxcXFwnJyk7XG4gICAgICAgIHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQuc3R5bGUuc2V0UHJvcGVydHkoXCItLXBsYWNlaG9sZGVyXCIsIGAnJHtwbGFjZWhvbGRlcn0nYCk7XG4gICAgICAgIHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQuY2xhc3NMaXN0LmFkZChcIm14X0Jhc2ljTWVzc2FnZUNvbXBvc2VyX2lucHV0RW1wdHlcIik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBoaWRlUGxhY2Vob2xkZXIoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQuY2xhc3NMaXN0LnJlbW92ZShcIm14X0Jhc2ljTWVzc2FnZUNvbXBvc2VyX2lucHV0RW1wdHlcIik7XG4gICAgICAgIHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQuc3R5bGUucmVtb3ZlUHJvcGVydHkoXCItLXBsYWNlaG9sZGVyXCIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25Db21wb3NpdGlvblN0YXJ0ID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLmlzSU1FQ29tcG9zaW5nID0gdHJ1ZTtcbiAgICAgICAgLy8gZXZlbiBpZiB0aGUgbW9kZWwgaXMgZW1wdHksIHRoZSBjb21wb3NpdGlvbiB0ZXh0IHNob3VsZG4ndCBiZSBtaXhlZCB3aXRoIHRoZSBwbGFjZWhvbGRlclxuICAgICAgICB0aGlzLmhpZGVQbGFjZWhvbGRlcigpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ29tcG9zaXRpb25FbmQgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuaXNJTUVDb21wb3NpbmcgPSBmYWxzZTtcbiAgICAgICAgLy8gc29tZSBicm93c2VycyAoQ2hyb21lKSBkb24ndCBmaXJlIGFuIGlucHV0IGV2ZW50IGFmdGVyIGVuZGluZyBhIGNvbXBvc2l0aW9uLFxuICAgICAgICAvLyBzbyB0cmlnZ2VyIGEgbW9kZWwgdXBkYXRlIGFmdGVyIHRoZSBjb21wb3NpdGlvbiBpcyBkb25lIGJ5IGNhbGxpbmcgdGhlIGlucHV0IGhhbmRsZXIuXG5cbiAgICAgICAgLy8gaG93ZXZlciwgbW9kaWZ5aW5nIHRoZSBET00gKGNhdXNlZCBieSB0aGUgZWRpdG9yIG1vZGVsIHVwZGF0ZSkgZnJvbSB0aGUgY29tcG9zaXRpb25lbmQgaGFuZGxlciBzZWVtc1xuICAgICAgICAvLyB0byBjb25mdXNlIHRoZSBJTUUgaW4gQ2hyb21lLCBsaWtlbHkgY2F1c2luZyBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xMDkxMyAsXG4gICAgICAgIC8vIHNvIHdlIGRvIGl0IGFzeW5jXG5cbiAgICAgICAgLy8gaG93ZXZlciwgZG9pbmcgdGhpcyBhc3luYyBzZWVtcyB0byBicmVhayB0aGluZ3MgaW4gU2FmYXJpIGZvciBzb21lIHJlYXNvbiwgc28gYnJvd3NlciBzbmlmZi5cblxuICAgICAgICBjb25zdCB1YSA9IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgY29uc3QgaXNTYWZhcmkgPSB1YS5pbmNsdWRlcygnc2FmYXJpLycpICYmICF1YS5pbmNsdWRlcygnY2hyb21lLycpO1xuXG4gICAgICAgIGlmIChpc1NhZmFyaSkge1xuICAgICAgICAgICAgdGhpcy5vbklucHV0KHsgaW5wdXRUeXBlOiBcImluc2VydENvbXBvc2l0aW9uVGV4dFwiIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbklucHV0KHsgaW5wdXRUeXBlOiBcImluc2VydENvbXBvc2l0aW9uVGV4dFwiIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHVibGljIGlzQ29tcG9zaW5nKGV2ZW50OiBSZWFjdC5LZXlib2FyZEV2ZW50KTogYm9vbGVhbiB7XG4gICAgICAgIC8vIGNoZWNraW5nIHRoZSBldmVudC5pc0NvbXBvc2luZyBmbGFnIGp1c3QgaW4gY2FzZSBhbnkgYnJvd3NlciBvdXQgdGhlcmVcbiAgICAgICAgLy8gZW1pdHMgZXZlbnRzIHJlbGF0ZWQgdG8gdGhlIGNvbXBvc2l0aW9uIGFmdGVyIGNvbXBvc2l0aW9uZW5kXG4gICAgICAgIC8vIGhhcyBiZWVuIGZpcmVkXG4gICAgICAgIHJldHVybiAhISh0aGlzLmlzSU1FQ29tcG9zaW5nIHx8IChldmVudC5uYXRpdmVFdmVudCAmJiBldmVudC5uYXRpdmVFdmVudC5pc0NvbXBvc2luZykpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25DdXRDb3B5ID0gKGV2ZW50OiBDbGlwYm9hcmRFdmVudCwgdHlwZTogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IHNlbGVjdGlvbiA9IGRvY3VtZW50LmdldFNlbGVjdGlvbigpO1xuICAgICAgICBjb25zdCB0ZXh0ID0gc2VsZWN0aW9uLnRvU3RyaW5nKCk7XG4gICAgICAgIGlmICh0ZXh0KSB7XG4gICAgICAgICAgICBjb25zdCB7IG1vZGVsIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgY29uc3QgcmFuZ2UgPSBnZXRSYW5nZUZvclNlbGVjdGlvbih0aGlzLmVkaXRvclJlZi5jdXJyZW50LCBtb2RlbCwgc2VsZWN0aW9uKTtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkUGFydHMgPSByYW5nZS5wYXJ0cy5tYXAocCA9PiBwLnNlcmlhbGl6ZSgpKTtcbiAgICAgICAgICAgIGV2ZW50LmNsaXBib2FyZERhdGEuc2V0RGF0YShcImFwcGxpY2F0aW9uL3gtZWxlbWVudC1jb21wb3NlclwiLCBKU09OLnN0cmluZ2lmeShzZWxlY3RlZFBhcnRzKSk7XG4gICAgICAgICAgICBldmVudC5jbGlwYm9hcmREYXRhLnNldERhdGEoXCJ0ZXh0L3BsYWluXCIsIHRleHQpOyAvLyBzbyBwbGFpbiBjb3B5L3Bhc3RlIHdvcmtzXG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gXCJjdXRcIikge1xuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSB0aGUgdGV4dCwgdXBkYXRpbmcgdGhlIG1vZGVsIGFzIGFwcHJvcHJpYXRlXG4gICAgICAgICAgICAgICAgdGhpcy5tb2RpZmllZEZsYWcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJlcGxhY2VSYW5nZUFuZE1vdmVDYXJldChyYW5nZSwgW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ29weSA9IChldmVudDogQ2xpcGJvYXJkRXZlbnQpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5vbkN1dENvcHkoZXZlbnQsIFwiY29weVwiKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkN1dCA9IChldmVudDogQ2xpcGJvYXJkRXZlbnQpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5vbkN1dENvcHkoZXZlbnQsIFwiY3V0XCIpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUGFzdGUgPSAoZXZlbnQ6IENsaXBib2FyZEV2ZW50PEhUTUxEaXZFbGVtZW50Pik6IGJvb2xlYW4gPT4ge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpOyAvLyB3ZSBhbHdheXMgaGFuZGxlIHRoZSBwYXN0ZSBvdXJzZWx2ZXNcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25QYXN0ZT8uKGV2ZW50LCB0aGlzLnByb3BzLm1vZGVsKSkge1xuICAgICAgICAgICAgLy8gdG8gcHJldmVudCBkb3VibGUgaGFuZGxpbmcsIGFsbG93IHByb3BzLm9uUGFzdGUgdG8gc2tpcCBpbnRlcm5hbCBvblBhc3RlXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHsgbW9kZWwgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGNvbnN0IHsgcGFydENyZWF0b3IgfSA9IG1vZGVsO1xuICAgICAgICBjb25zdCBwbGFpblRleHQgPSBldmVudC5jbGlwYm9hcmREYXRhLmdldERhdGEoXCJ0ZXh0L3BsYWluXCIpO1xuICAgICAgICBjb25zdCBwYXJ0c1RleHQgPSBldmVudC5jbGlwYm9hcmREYXRhLmdldERhdGEoXCJhcHBsaWNhdGlvbi94LWVsZW1lbnQtY29tcG9zZXJcIik7XG5cbiAgICAgICAgbGV0IHBhcnRzOiBQYXJ0W107XG4gICAgICAgIGlmIChwYXJ0c1RleHQpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlcmlhbGl6ZWRUZXh0UGFydHMgPSBKU09OLnBhcnNlKHBhcnRzVGV4dCk7XG4gICAgICAgICAgICBwYXJ0cyA9IHNlcmlhbGl6ZWRUZXh0UGFydHMubWFwKHAgPT4gcGFydENyZWF0b3IuZGVzZXJpYWxpemVQYXJ0KHApKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhcnRzID0gcGFyc2VQbGFpblRleHRNZXNzYWdlKHBsYWluVGV4dCwgcGFydENyZWF0b3IsIHsgc2hvdWxkRXNjYXBlOiBmYWxzZSB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubW9kaWZpZWRGbGFnID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgcmFuZ2UgPSBnZXRSYW5nZUZvclNlbGVjdGlvbih0aGlzLmVkaXRvclJlZi5jdXJyZW50LCBtb2RlbCwgZG9jdW1lbnQuZ2V0U2VsZWN0aW9uKCkpO1xuXG4gICAgICAgIC8vIElmIHRoZSB1c2VyIGlzIHBhc3RpbmcgYSBsaW5rLCBhbmQgaGFzIGEgcmFuZ2Ugc2VsZWN0ZWQgd2hpY2ggaXMgbm90IGEgbGluaywgd3JhcCB0aGUgcmFuZ2Ugd2l0aCB0aGUgbGlua1xuICAgICAgICBpZiAocGxhaW5UZXh0ICYmIHJhbmdlLmxlbmd0aCA+IDAgJiYgbGlua2lmeS50ZXN0KHBsYWluVGV4dCkgJiYgIWxpbmtpZnkudGVzdChyYW5nZS50ZXh0KSkge1xuICAgICAgICAgICAgZm9ybWF0UmFuZ2VBc0xpbmsocmFuZ2UsIHBsYWluVGV4dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXBsYWNlUmFuZ2VBbmRNb3ZlQ2FyZXQocmFuZ2UsIHBhcnRzKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uSW5wdXQgPSAoZXZlbnQ6IFBhcnRpYWw8SW5wdXRFdmVudD4pOiB2b2lkID0+IHtcbiAgICAgICAgLy8gaWdub3JlIGFueSBpbnB1dCB3aGlsZSBkb2luZyBJTUUgY29tcG9zaXRpb25zXG4gICAgICAgIGlmICh0aGlzLmlzSU1FQ29tcG9zaW5nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tb2RpZmllZEZsYWcgPSB0cnVlO1xuICAgICAgICBjb25zdCBzZWwgPSBkb2N1bWVudC5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgY29uc3QgeyBjYXJldCwgdGV4dCB9ID0gZ2V0Q2FyZXRPZmZzZXRBbmRUZXh0KHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQsIHNlbCk7XG4gICAgICAgIHRoaXMucHJvcHMubW9kZWwudXBkYXRlKHRleHQsIGV2ZW50LmlucHV0VHlwZSwgY2FyZXQpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGluc2VydFRleHQodGV4dFRvSW5zZXJ0OiBzdHJpbmcsIGlucHV0VHlwZSA9IFwiaW5zZXJ0VGV4dFwiKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHNlbCA9IGRvY3VtZW50LmdldFNlbGVjdGlvbigpO1xuICAgICAgICBjb25zdCB7IGNhcmV0LCB0ZXh0IH0gPSBnZXRDYXJldE9mZnNldEFuZFRleHQodGhpcy5lZGl0b3JSZWYuY3VycmVudCwgc2VsKTtcbiAgICAgICAgY29uc3QgbmV3VGV4dCA9IHRleHQuc2xpY2UoMCwgY2FyZXQub2Zmc2V0KSArIHRleHRUb0luc2VydCArIHRleHQuc2xpY2UoY2FyZXQub2Zmc2V0KTtcbiAgICAgICAgY2FyZXQub2Zmc2V0ICs9IHRleHRUb0luc2VydC5sZW5ndGg7XG4gICAgICAgIHRoaXMubW9kaWZpZWRGbGFnID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC51cGRhdGUobmV3VGV4dCwgaW5wdXRUeXBlLCBjYXJldCk7XG4gICAgfVxuXG4gICAgLy8gdGhpcyBpcyB1c2VkIGxhdGVyIHRvIHNlZSBpZiB3ZSBuZWVkIHRvIHJlY2FsY3VsYXRlIHRoZSBjYXJldFxuICAgIC8vIG9uIHNlbGVjdGlvbmNoYW5nZS4gSWYgaXQgaXMganVzdCBhIGNvbnNlcXVlbmNlIG9mIHR5cGluZ1xuICAgIC8vIHdlIGRvbid0IG5lZWQgdG8uIEJ1dCBpZiB0aGUgdXNlciBpcyBuYXZpZ2F0aW5nIHRoZSBjYXJldCB3aXRob3V0IGlucHV0XG4gICAgLy8gd2UgbmVlZCB0byByZWNhbGN1bGF0ZSBpdCwgdG8gYmUgYWJsZSB0byBrbm93IHdoZXJlIHRvIGluc2VydCBjb250ZW50IGFmdGVyXG4gICAgLy8gbG9zaW5nIGZvY3VzXG4gICAgcHJpdmF0ZSBzZXRMYXN0Q2FyZXRGcm9tUG9zaXRpb24ocG9zaXRpb246IERvY3VtZW50UG9zaXRpb24pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgeyBtb2RlbCB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgdGhpcy5faXNDYXJldEF0RW5kID0gcG9zaXRpb24uaXNBdEVuZChtb2RlbCk7XG4gICAgICAgIHRoaXMubGFzdENhcmV0ID0gcG9zaXRpb24uYXNPZmZzZXQobW9kZWwpO1xuICAgICAgICB0aGlzLmxhc3RTZWxlY3Rpb24gPSBjbG9uZVNlbGVjdGlvbihkb2N1bWVudC5nZXRTZWxlY3Rpb24oKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZWZyZXNoTGFzdENhcmV0SWZOZWVkZWQoKTogRG9jdW1lbnRPZmZzZXQge1xuICAgICAgICAvLyBYWFg6IG5lZWRlZCB3aGVuIGdvaW5nIHVwIGFuZCBkb3duIGluIGVkaXRpbmcgbWVzc2FnZXMgLi4uIG5vdCBzdXJlIHdoeSB5ZXRcbiAgICAgICAgLy8gYmVjYXVzZSB0aGUgZWRpdG9ycyBzaG91bGQgc3RvcCBkb2luZyB0aGlzIHdoZW4gd2hlbiBibHVycmVkIC4uLlxuICAgICAgICAvLyBtYXliZSBpdCdzIG9uIGZvY3VzIGFuZCB0aGUgX2VkaXRvclJlZiBpc24ndCBhdmFpbGFibGUgeWV0IG9yIHNvbWV0aGluZy5cbiAgICAgICAgaWYgKCF0aGlzLmVkaXRvclJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc2VsZWN0aW9uID0gZG9jdW1lbnQuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgIGlmICghdGhpcy5sYXN0U2VsZWN0aW9uIHx8ICFzZWxlY3Rpb25FcXVhbHModGhpcy5sYXN0U2VsZWN0aW9uLCBzZWxlY3Rpb24pKSB7XG4gICAgICAgICAgICB0aGlzLmxhc3RTZWxlY3Rpb24gPSBjbG9uZVNlbGVjdGlvbihzZWxlY3Rpb24pO1xuICAgICAgICAgICAgY29uc3QgeyBjYXJldCwgdGV4dCB9ID0gZ2V0Q2FyZXRPZmZzZXRBbmRUZXh0KHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQsIHNlbGVjdGlvbik7XG4gICAgICAgICAgICB0aGlzLmxhc3RDYXJldCA9IGNhcmV0O1xuICAgICAgICAgICAgdGhpcy5faXNDYXJldEF0RW5kID0gY2FyZXQub2Zmc2V0ID09PSB0ZXh0Lmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5sYXN0Q2FyZXQ7XG4gICAgfVxuXG4gICAgcHVibGljIGNsZWFyVW5kb0hpc3RvcnkoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuaGlzdG9yeU1hbmFnZXIuY2xlYXIoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0Q2FyZXQoKTogRG9jdW1lbnRPZmZzZXQge1xuICAgICAgICByZXR1cm4gdGhpcy5sYXN0Q2FyZXQ7XG4gICAgfVxuXG4gICAgcHVibGljIGlzU2VsZWN0aW9uQ29sbGFwc2VkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gIXRoaXMubGFzdFNlbGVjdGlvbiB8fCB0aGlzLmxhc3RTZWxlY3Rpb24uaXNDb2xsYXBzZWQ7XG4gICAgfVxuXG4gICAgcHVibGljIGlzQ2FyZXRBdFN0YXJ0KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRDYXJldCgpLm9mZnNldCA9PT0gMDtcbiAgICB9XG5cbiAgICBwdWJsaWMgaXNDYXJldEF0RW5kKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5faXNDYXJldEF0RW5kO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25CbHVyID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwic2VsZWN0aW9uY2hhbmdlXCIsIHRoaXMub25TZWxlY3Rpb25DaGFuZ2UpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRm9jdXMgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJzZWxlY3Rpb25jaGFuZ2VcIiwgdGhpcy5vblNlbGVjdGlvbkNoYW5nZSk7XG4gICAgICAgIC8vIGZvcmNlIHRvIHJlY2FsY3VsYXRlXG4gICAgICAgIHRoaXMubGFzdFNlbGVjdGlvbiA9IG51bGw7XG4gICAgICAgIHRoaXMucmVmcmVzaExhc3RDYXJldElmTmVlZGVkKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25TZWxlY3Rpb25DaGFuZ2UgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IHsgaXNFbXB0eSB9ID0gdGhpcy5wcm9wcy5tb2RlbDtcblxuICAgICAgICB0aGlzLnJlZnJlc2hMYXN0Q2FyZXRJZk5lZWRlZCgpO1xuICAgICAgICBjb25zdCBzZWxlY3Rpb24gPSBkb2N1bWVudC5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgaWYgKHRoaXMuaGFzVGV4dFNlbGVjdGVkICYmIHNlbGVjdGlvbi5pc0NvbGxhcHNlZCkge1xuICAgICAgICAgICAgdGhpcy5oYXNUZXh0U2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuZm9ybWF0QmFyUmVmLmN1cnJlbnQ/LmhpZGUoKTtcbiAgICAgICAgfSBlbHNlIGlmICghc2VsZWN0aW9uLmlzQ29sbGFwc2VkICYmICFpc0VtcHR5KSB7XG4gICAgICAgICAgICB0aGlzLmhhc1RleHRTZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICBjb25zdCByYW5nZSA9IGdldFJhbmdlRm9yU2VsZWN0aW9uKHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQsIHRoaXMucHJvcHMubW9kZWwsIHNlbGVjdGlvbik7XG4gICAgICAgICAgICBpZiAodGhpcy5mb3JtYXRCYXJSZWYuY3VycmVudCAmJiB0aGlzLnN0YXRlLnVzZU1hcmtkb3duICYmICEhcmFuZ2UudGV4dC50cmltKCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3Rpb25SZWN0ID0gc2VsZWN0aW9uLmdldFJhbmdlQXQoMCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5mb3JtYXRCYXJSZWYuY3VycmVudC5zaG93QXQoc2VsZWN0aW9uUmVjdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbktleURvd24gPSAoZXZlbnQ6IFJlYWN0LktleWJvYXJkRXZlbnQpOiB2b2lkID0+IHtcbiAgICAgICAgY29uc3QgbW9kZWwgPSB0aGlzLnByb3BzLm1vZGVsO1xuICAgICAgICBsZXQgaGFuZGxlZCA9IGZhbHNlO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnN1cnJvdW5kV2l0aCAmJiBkb2N1bWVudC5nZXRTZWxlY3Rpb24oKS50eXBlICE9PSBcIkNhcmV0XCIpIHtcbiAgICAgICAgICAgIC8vIFRoaXMgc3Vycm91bmRzIHRoZSBzZWxlY3RlZCB0ZXh0IHdpdGggYSBjaGFyYWN0ZXIuIFRoaXMgaXNcbiAgICAgICAgICAgIC8vIGludGVudGlvbmFsbHkgbGVmdCBvdXQgb2YgdGhlIGtleWJpbmRpbmcgbWFuYWdlciBhcyB0aGUga2V5YmluZHNcbiAgICAgICAgICAgIC8vIGhlcmUgc2hvdWxkbid0IGJlIGNoYW5nZWFibGVcblxuICAgICAgICAgICAgY29uc3Qgc2VsZWN0aW9uUmFuZ2UgPSBnZXRSYW5nZUZvclNlbGVjdGlvbihcbiAgICAgICAgICAgICAgICB0aGlzLmVkaXRvclJlZi5jdXJyZW50LFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubW9kZWwsXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0U2VsZWN0aW9uKCksXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgLy8gdHJpbSB0aGUgcmFuZ2UgYXMgd2Ugd2FudCBpdCB0byBleGNsdWRlIGxlYWRpbmcvdHJhaWxpbmcgc3BhY2VzXG4gICAgICAgICAgICBzZWxlY3Rpb25SYW5nZS50cmltKCk7XG5cbiAgICAgICAgICAgIGlmIChbLi4uU1VSUk9VTkRfV0lUSF9ET1VCTEVfQ0hBUkFDVEVSUy5rZXlzKCksIC4uLlNVUlJPVU5EX1dJVEhfQ0hBUkFDVEVSU10uaW5jbHVkZXMoZXZlbnQua2V5KSkge1xuICAgICAgICAgICAgICAgIHRoaXMuaGlzdG9yeU1hbmFnZXIuZW5zdXJlTGFzdENoYW5nZXNQdXNoZWQodGhpcy5wcm9wcy5tb2RlbCk7XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RpZmllZEZsYWcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRvZ2dsZUlubGluZUZvcm1hdChzZWxlY3Rpb25SYW5nZSwgZXZlbnQua2V5LCBTVVJST1VORF9XSVRIX0RPVUJMRV9DSEFSQUNURVJTLmdldChldmVudC5rZXkpKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGF1dG9jb21wbGV0ZUFjdGlvbiA9IGdldEtleUJpbmRpbmdzTWFuYWdlcigpLmdldEF1dG9jb21wbGV0ZUFjdGlvbihldmVudCk7XG4gICAgICAgIGNvbnN0IGFjY2Vzc2liaWxpdHlBY3Rpb24gPSBnZXRLZXlCaW5kaW5nc01hbmFnZXIoKS5nZXRBY2Nlc3NpYmlsaXR5QWN0aW9uKGV2ZW50KTtcbiAgICAgICAgaWYgKG1vZGVsLmF1dG9Db21wbGV0ZT8uaGFzQ29tcGxldGlvbnMoKSkge1xuICAgICAgICAgICAgY29uc3QgYXV0b0NvbXBsZXRlID0gbW9kZWwuYXV0b0NvbXBsZXRlO1xuICAgICAgICAgICAgc3dpdGNoIChhdXRvY29tcGxldGVBY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uRm9yY2VDb21wbGV0ZUF1dG9jb21wbGV0ZTpcbiAgICAgICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uQ29tcGxldGVBdXRvY29tcGxldGU6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGlzdG9yeU1hbmFnZXIuZW5zdXJlTGFzdENoYW5nZXNQdXNoZWQodGhpcy5wcm9wcy5tb2RlbCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW9kaWZpZWRGbGFnID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlLmNvbmZpcm1Db21wbGV0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uUHJldlNlbGVjdGlvbkluQXV0b2NvbXBsZXRlOlxuICAgICAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGUuc2VsZWN0UHJldmlvdXNTZWxlY3Rpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5OZXh0U2VsZWN0aW9uSW5BdXRvY29tcGxldGU6XG4gICAgICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZS5zZWxlY3ROZXh0U2VsZWN0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uQ2FuY2VsQXV0b2NvbXBsZXRlOlxuICAgICAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGUub25Fc2NhcGUoZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuOyAvLyBkb24ndCBwcmV2ZW50RGVmYXVsdCBvbiBhbnl0aGluZyBlbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoYXV0b2NvbXBsZXRlQWN0aW9uID09PSBLZXlCaW5kaW5nQWN0aW9uLkZvcmNlQ29tcGxldGVBdXRvY29tcGxldGUgJiYgIXRoaXMuc3RhdGUuc2hvd1Zpc3VhbEJlbGwpIHtcbiAgICAgICAgICAgIC8vIHRoZXJlIGlzIG5vIGN1cnJlbnQgYXV0b2NvbXBsZXRlIHdpbmRvdywgdHJ5IHRvIG9wZW4gaXRcbiAgICAgICAgICAgIHRoaXMudGFiQ29tcGxldGVOYW1lKCk7XG4gICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChbS2V5QmluZGluZ0FjdGlvbi5EZWxldGUsIEtleUJpbmRpbmdBY3Rpb24uQmFja3NwYWNlXS5pbmNsdWRlcyhhY2Nlc3NpYmlsaXR5QWN0aW9uKSkge1xuICAgICAgICAgICAgdGhpcy5mb3JtYXRCYXJSZWYuY3VycmVudC5oaWRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFuZGxlZCkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYWN0aW9uID0gZ2V0S2V5QmluZGluZ3NNYW5hZ2VyKCkuZ2V0TWVzc2FnZUNvbXBvc2VyQWN0aW9uKGV2ZW50KTtcbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5Gb3JtYXRCb2xkOlxuICAgICAgICAgICAgICAgIHRoaXMub25Gb3JtYXRBY3Rpb24oRm9ybWF0dGluZy5Cb2xkKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5Gb3JtYXRJdGFsaWNzOlxuICAgICAgICAgICAgICAgIHRoaXMub25Gb3JtYXRBY3Rpb24oRm9ybWF0dGluZy5JdGFsaWNzKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5Gb3JtYXRDb2RlOlxuICAgICAgICAgICAgICAgIHRoaXMub25Gb3JtYXRBY3Rpb24oRm9ybWF0dGluZy5Db2RlKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5Gb3JtYXRRdW90ZTpcbiAgICAgICAgICAgICAgICB0aGlzLm9uRm9ybWF0QWN0aW9uKEZvcm1hdHRpbmcuUXVvdGUpO1xuICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBLZXlCaW5kaW5nQWN0aW9uLkZvcm1hdExpbms6XG4gICAgICAgICAgICAgICAgdGhpcy5vbkZvcm1hdEFjdGlvbihGb3JtYXR0aW5nLkluc2VydExpbmspO1xuICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBLZXlCaW5kaW5nQWN0aW9uLkVkaXRSZWRvOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmhpc3RvcnlNYW5hZ2VyLmNhblJlZG8oKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB7IHBhcnRzLCBjYXJldCB9ID0gdGhpcy5oaXN0b3J5TWFuYWdlci5yZWRvKCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIHBhc3MgbWF0Y2hpbmcgaW5wdXRUeXBlIHNvIGhpc3RvcnlNYW5hZ2VyIGRvZXNuJ3QgcHVzaCBlY2hvXG4gICAgICAgICAgICAgICAgICAgIC8vIHdoZW4gaW52b2tlZCBmcm9tIHJlcmVuZGVyIGNhbGxiYWNrLlxuICAgICAgICAgICAgICAgICAgICBtb2RlbC5yZXNldChwYXJ0cywgY2FyZXQsIFwiaGlzdG9yeVJlZG9cIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBLZXlCaW5kaW5nQWN0aW9uLkVkaXRVbmRvOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmhpc3RvcnlNYW5hZ2VyLmNhblVuZG8oKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB7IHBhcnRzLCBjYXJldCB9ID0gdGhpcy5oaXN0b3J5TWFuYWdlci51bmRvKHRoaXMucHJvcHMubW9kZWwpO1xuICAgICAgICAgICAgICAgICAgICAvLyBwYXNzIG1hdGNoaW5nIGlucHV0VHlwZSBzbyBoaXN0b3J5TWFuYWdlciBkb2Vzbid0IHB1c2ggZWNob1xuICAgICAgICAgICAgICAgICAgICAvLyB3aGVuIGludm9rZWQgZnJvbSByZXJlbmRlciBjYWxsYmFjay5cbiAgICAgICAgICAgICAgICAgICAgbW9kZWwucmVzZXQocGFydHMsIGNhcmV0LCBcImhpc3RvcnlVbmRvXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5OZXdMaW5lOlxuICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0VGV4dChcIlxcblwiKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5Nb3ZlQ3Vyc29yVG9TdGFydDpcbiAgICAgICAgICAgICAgICBzZXRTZWxlY3Rpb24odGhpcy5lZGl0b3JSZWYuY3VycmVudCwgbW9kZWwsIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6IDAsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogMCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5Nb3ZlQ3Vyc29yVG9FbmQ6XG4gICAgICAgICAgICAgICAgc2V0U2VsZWN0aW9uKHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQsIG1vZGVsLCB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiBtb2RlbC5wYXJ0cy5sZW5ndGggLSAxLFxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IG1vZGVsLnBhcnRzW21vZGVsLnBhcnRzLmxlbmd0aCAtIDFdLnRleHQubGVuZ3RoLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChoYW5kbGVkKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBhc3luYyB0YWJDb21wbGV0ZU5hbWUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZTx2b2lkPihyZXNvbHZlID0+IHRoaXMuc2V0U3RhdGUoeyBzaG93VmlzdWFsQmVsbDogZmFsc2UgfSwgcmVzb2x2ZSkpO1xuICAgICAgICAgICAgY29uc3QgeyBtb2RlbCB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIGNvbnN0IGNhcmV0ID0gdGhpcy5nZXRDYXJldCgpO1xuICAgICAgICAgICAgY29uc3QgcG9zaXRpb24gPSBtb2RlbC5wb3NpdGlvbkZvck9mZnNldChjYXJldC5vZmZzZXQsIGNhcmV0LmF0Tm9kZUVuZCk7XG4gICAgICAgICAgICBjb25zdCByYW5nZSA9IG1vZGVsLnN0YXJ0UmFuZ2UocG9zaXRpb24pO1xuICAgICAgICAgICAgcmFuZ2UuZXhwYW5kQmFja3dhcmRzV2hpbGUoKGluZGV4LCBvZmZzZXQsIHBhcnQpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFydC50ZXh0W29mZnNldF0gIT09IFwiIFwiICYmIHBhcnQudGV4dFtvZmZzZXRdICE9PSBcIitcIiAmJiAoXG4gICAgICAgICAgICAgICAgICAgIHBhcnQudHlwZSA9PT0gVHlwZS5QbGFpbiB8fFxuICAgICAgICAgICAgICAgICAgICBwYXJ0LnR5cGUgPT09IFR5cGUuUGlsbENhbmRpZGF0ZSB8fFxuICAgICAgICAgICAgICAgICAgICBwYXJ0LnR5cGUgPT09IFR5cGUuQ29tbWFuZFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IHsgcGFydENyZWF0b3IgfSA9IG1vZGVsO1xuICAgICAgICAgICAgLy8gYXdhaXQgZm9yIGF1dG8tY29tcGxldGUgdG8gYmUgb3BlblxuICAgICAgICAgICAgYXdhaXQgbW9kZWwudHJhbnNmb3JtKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBhZGRlZExlbiA9IHJhbmdlLnJlcGxhY2UoW3BhcnRDcmVhdG9yLnBpbGxDYW5kaWRhdGUocmFuZ2UudGV4dCldKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbW9kZWwucG9zaXRpb25Gb3JPZmZzZXQoY2FyZXQub2Zmc2V0ICsgYWRkZWRMZW4sIHRydWUpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIERvbid0IHRyeSB0byBkbyB0aGluZ3Mgd2l0aCB0aGUgYXV0b2NvbXBsZXRlIGlmIHRoZXJlIGlzIG5vbmUgc2hvd25cbiAgICAgICAgICAgIGlmIChtb2RlbC5hdXRvQ29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBtb2RlbC5hdXRvQ29tcGxldGUuc3RhcnRTZWxlY3Rpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAoIW1vZGVsLmF1dG9Db21wbGV0ZS5oYXNTZWxlY3Rpb24oKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2hvd1Zpc3VhbEJlbGw6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVsLmF1dG9Db21wbGV0ZS5jbG9zZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNob3dWaXN1YWxCZWxsOiB0cnVlIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGlzTW9kaWZpZWQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLm1vZGlmaWVkRmxhZztcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQXV0b0NvbXBsZXRlQ29uZmlybSA9IChjb21wbGV0aW9uOiBJQ29tcGxldGlvbik6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLm1vZGlmaWVkRmxhZyA9IHRydWU7XG4gICAgICAgIHRoaXMucHJvcHMubW9kZWwuYXV0b0NvbXBsZXRlLm9uQ29tcG9uZW50Q29uZmlybShjb21wbGV0aW9uKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkF1dG9Db21wbGV0ZVNlbGVjdGlvbkNoYW5nZSA9IChjb21wbGV0aW9uSW5kZXg6IG51bWJlcik6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLm1vZGlmaWVkRmxhZyA9IHRydWU7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjb21wbGV0aW9uSW5kZXggfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgY29uZmlndXJlVXNlTWFya2Rvd24gPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IHVzZU1hcmtkb3duID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcIk1lc3NhZ2VDb21wb3NlcklucHV0LnVzZU1hcmtkb3duXCIpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgdXNlTWFya2Rvd24gfSk7XG4gICAgICAgIGlmICghdXNlTWFya2Rvd24gJiYgdGhpcy5mb3JtYXRCYXJSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgdGhpcy5mb3JtYXRCYXJSZWYuY3VycmVudC5oaWRlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBjb25maWd1cmVFbW90aWNvbkF1dG9SZXBsYWNlID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNldFRyYW5zZm9ybUNhbGxiYWNrKHRoaXMudHJhbnNmb3JtKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBjb25maWd1cmVTaG91bGRTaG93UGlsbEF2YXRhciA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgY29uc3Qgc2hvd1BpbGxBdmF0YXIgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiUGlsbC5zaG91bGRTaG93UGlsbEF2YXRhclwiKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNob3dQaWxsQXZhdGFyIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHN1cnJvdW5kV2l0aFNldHRpbmdDaGFuZ2VkID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBzdXJyb3VuZFdpdGggPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiTWVzc2FnZUNvbXBvc2VySW5wdXQuc3Vycm91bmRXaXRoXCIpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgc3Vycm91bmRXaXRoIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHRyYW5zZm9ybSA9IChkb2N1bWVudFBvc2l0aW9uOiBEb2N1bWVudFBvc2l0aW9uKTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IHNob3VsZFJlcGxhY2UgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKCdNZXNzYWdlQ29tcG9zZXJJbnB1dC5hdXRvUmVwbGFjZUVtb2ppJyk7XG4gICAgICAgIGlmIChzaG91bGRSZXBsYWNlKSB0aGlzLnJlcGxhY2VFbW90aWNvbihkb2N1bWVudFBvc2l0aW9uLCBSRUdFWF9FTU9USUNPTl9XSElURVNQQUNFKTtcbiAgICB9O1xuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJzZWxlY3Rpb25jaGFuZ2VcIiwgdGhpcy5vblNlbGVjdGlvbkNoYW5nZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIHRoaXMub25JbnB1dCwgdHJ1ZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNvbXBvc2l0aW9uc3RhcnRcIiwgdGhpcy5vbkNvbXBvc2l0aW9uU3RhcnQsIHRydWUpO1xuICAgICAgICB0aGlzLmVkaXRvclJlZi5jdXJyZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjb21wb3NpdGlvbmVuZFwiLCB0aGlzLm9uQ29tcG9zaXRpb25FbmQsIHRydWUpO1xuICAgICAgICBTZXR0aW5nc1N0b3JlLnVud2F0Y2hTZXR0aW5nKHRoaXMudXNlTWFya2Rvd25IYW5kbGUpO1xuICAgICAgICBTZXR0aW5nc1N0b3JlLnVud2F0Y2hTZXR0aW5nKHRoaXMuZW1vdGljb25TZXR0aW5nSGFuZGxlKTtcbiAgICAgICAgU2V0dGluZ3NTdG9yZS51bndhdGNoU2V0dGluZyh0aGlzLnNob3VsZFNob3dQaWxsQXZhdGFyU2V0dGluZ0hhbmRsZSk7XG4gICAgICAgIFNldHRpbmdzU3RvcmUudW53YXRjaFNldHRpbmcodGhpcy5zdXJyb3VuZFdpdGhIYW5kbGUpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBjb25zdCBtb2RlbCA9IHRoaXMucHJvcHMubW9kZWw7XG4gICAgICAgIG1vZGVsLnNldFVwZGF0ZUNhbGxiYWNrKHRoaXMudXBkYXRlRWRpdG9yU3RhdGUpO1xuICAgICAgICBjb25zdCBwYXJ0Q3JlYXRvciA9IG1vZGVsLnBhcnRDcmVhdG9yO1xuICAgICAgICAvLyBUT0RPOiBkb2VzIHRoaXMgYWxsb3cgdXMgdG8gZ2V0IHJpZCBvZiBFZGl0b3JTdGF0ZVRyYW5zZmVyP1xuICAgICAgICAvLyBub3QgcmVhbGx5LCBidXQgd2UgY291bGQgbm90IHNlcmlhbGl6ZSB0aGUgcGFydHMsIGFuZCBqdXN0IGNoYW5nZSB0aGUgYXV0b0NvbXBsZXRlclxuICAgICAgICBwYXJ0Q3JlYXRvci5zZXRBdXRvQ29tcGxldGVDcmVhdG9yKGdldEF1dG9Db21wbGV0ZUNyZWF0b3IoXG4gICAgICAgICAgICAoKSA9PiB0aGlzLmF1dG9jb21wbGV0ZVJlZi5jdXJyZW50LFxuICAgICAgICAgICAgcXVlcnkgPT4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB0aGlzLnNldFN0YXRlKHsgcXVlcnkgfSwgcmVzb2x2ZSkpLFxuICAgICAgICApKTtcbiAgICAgICAgLy8gaW5pdGlhbCByZW5kZXIgb2YgbW9kZWxcbiAgICAgICAgdGhpcy51cGRhdGVFZGl0b3JTdGF0ZSh0aGlzLmdldEluaXRpYWxDYXJldFBvc2l0aW9uKCkpO1xuICAgICAgICAvLyBhdHRhY2ggaW5wdXQgbGlzdGVuZXIgYnkgaGFuZCBzbyBSZWFjdCBkb2Vzbid0IHByb3h5IHRoZSBldmVudHMsXG4gICAgICAgIC8vIGFzIHRoZSBwcm94aWVkIGV2ZW50IGRvZXNuJ3Qgc3VwcG9ydCBpbnB1dFR5cGUsIHdoaWNoIHdlIG5lZWQuXG4gICAgICAgIHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIHRoaXMub25JbnB1dCwgdHJ1ZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNvbXBvc2l0aW9uc3RhcnRcIiwgdGhpcy5vbkNvbXBvc2l0aW9uU3RhcnQsIHRydWUpO1xuICAgICAgICB0aGlzLmVkaXRvclJlZi5jdXJyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjb21wb3NpdGlvbmVuZFwiLCB0aGlzLm9uQ29tcG9zaXRpb25FbmQsIHRydWUpO1xuICAgICAgICB0aGlzLmVkaXRvclJlZi5jdXJyZW50LmZvY3VzKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRJbml0aWFsQ2FyZXRQb3NpdGlvbigpOiBEb2N1bWVudFBvc2l0aW9uIHtcbiAgICAgICAgbGV0IGNhcmV0UG9zaXRpb246IERvY3VtZW50UG9zaXRpb247XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmluaXRpYWxDYXJldCkge1xuICAgICAgICAgICAgLy8gaWYgcmVzdG9yaW5nIHN0YXRlIGZyb20gYSBwcmV2aW91cyBlZGl0b3IsXG4gICAgICAgICAgICAvLyByZXN0b3JlIGNhcmV0IHBvc2l0aW9uIGZyb20gdGhlIHN0YXRlXG4gICAgICAgICAgICBjb25zdCBjYXJldCA9IHRoaXMucHJvcHMuaW5pdGlhbENhcmV0O1xuICAgICAgICAgICAgY2FyZXRQb3NpdGlvbiA9IHRoaXMucHJvcHMubW9kZWwucG9zaXRpb25Gb3JPZmZzZXQoY2FyZXQub2Zmc2V0LCBjYXJldC5hdE5vZGVFbmQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlLCBzZXQgaXQgYXQgdGhlIGVuZFxuICAgICAgICAgICAgY2FyZXRQb3NpdGlvbiA9IHRoaXMucHJvcHMubW9kZWwuZ2V0UG9zaXRpb25BdEVuZCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYXJldFBvc2l0aW9uO1xuICAgIH1cblxuICAgIHB1YmxpYyBvbkZvcm1hdEFjdGlvbiA9IChhY3Rpb246IEZvcm1hdHRpbmcpOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnVzZU1hcmtkb3duKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByYW5nZTogUmFuZ2UgPSBnZXRSYW5nZUZvclNlbGVjdGlvbih0aGlzLmVkaXRvclJlZi5jdXJyZW50LCB0aGlzLnByb3BzLm1vZGVsLCBkb2N1bWVudC5nZXRTZWxlY3Rpb24oKSk7XG5cbiAgICAgICAgdGhpcy5oaXN0b3J5TWFuYWdlci5lbnN1cmVMYXN0Q2hhbmdlc1B1c2hlZCh0aGlzLnByb3BzLm1vZGVsKTtcbiAgICAgICAgdGhpcy5tb2RpZmllZEZsYWcgPSB0cnVlO1xuXG4gICAgICAgIGZvcm1hdFJhbmdlKHJhbmdlLCBhY3Rpb24pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBhdXRvQ29tcGxldGU7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmF1dG9Db21wbGV0ZSkge1xuICAgICAgICAgICAgY29uc3QgcXVlcnkgPSB0aGlzLnN0YXRlLnF1ZXJ5O1xuICAgICAgICAgICAgY29uc3QgcXVlcnlMZW4gPSBxdWVyeS5sZW5ndGg7XG4gICAgICAgICAgICBhdXRvQ29tcGxldGUgPSAoPGRpdiBjbGFzc05hbWU9XCJteF9CYXNpY01lc3NhZ2VDb21wb3Nlcl9BdXRvQ29tcGxldGVXcmFwcGVyXCI+XG4gICAgICAgICAgICAgICAgPEF1dG9jb21wbGV0ZVxuICAgICAgICAgICAgICAgICAgICByZWY9e3RoaXMuYXV0b2NvbXBsZXRlUmVmfVxuICAgICAgICAgICAgICAgICAgICBxdWVyeT17cXVlcnl9XG4gICAgICAgICAgICAgICAgICAgIG9uQ29uZmlybT17dGhpcy5vbkF1dG9Db21wbGV0ZUNvbmZpcm19XG4gICAgICAgICAgICAgICAgICAgIG9uU2VsZWN0aW9uQ2hhbmdlPXt0aGlzLm9uQXV0b0NvbXBsZXRlU2VsZWN0aW9uQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb249e3sgYmVnaW5uaW5nOiB0cnVlLCBlbmQ6IHF1ZXJ5TGVuLCBzdGFydDogcXVlcnlMZW4gfX1cbiAgICAgICAgICAgICAgICAgICAgcm9vbT17dGhpcy5wcm9wcy5yb29tfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj4pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHdyYXBwZXJDbGFzc2VzID0gY2xhc3NOYW1lcyhcIm14X0Jhc2ljTWVzc2FnZUNvbXBvc2VyXCIsIHtcbiAgICAgICAgICAgIFwibXhfQmFzaWNNZXNzYWdlQ29tcG9zZXJfaW5wdXRfZXJyb3JcIjogdGhpcy5zdGF0ZS5zaG93VmlzdWFsQmVsbCxcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWVzKFwibXhfQmFzaWNNZXNzYWdlQ29tcG9zZXJfaW5wdXRcIiwge1xuICAgICAgICAgICAgXCJteF9CYXNpY01lc3NhZ2VDb21wb3Nlcl9pbnB1dF9zaG91bGRTaG93UGlsbEF2YXRhclwiOiB0aGlzLnN0YXRlLnNob3dQaWxsQXZhdGFyLFxuICAgICAgICAgICAgXCJteF9CYXNpY01lc3NhZ2VDb21wb3Nlcl9pbnB1dF9kaXNhYmxlZFwiOiB0aGlzLnByb3BzLmRpc2FibGVkLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBzaG9ydGN1dHMgPSB7XG4gICAgICAgICAgICBbRm9ybWF0dGluZy5Cb2xkXTogY3RybFNob3J0Y3V0TGFiZWwoXCJCXCIpLFxuICAgICAgICAgICAgW0Zvcm1hdHRpbmcuSXRhbGljc106IGN0cmxTaG9ydGN1dExhYmVsKFwiSVwiKSxcbiAgICAgICAgICAgIFtGb3JtYXR0aW5nLkNvZGVdOiBjdHJsU2hvcnRjdXRMYWJlbChcIkVcIiksXG4gICAgICAgICAgICBbRm9ybWF0dGluZy5RdW90ZV06IGN0cmxTaG9ydGN1dExhYmVsKFwiPlwiKSxcbiAgICAgICAgICAgIFtGb3JtYXR0aW5nLkluc2VydExpbmtdOiBjdHJsU2hvcnRjdXRMYWJlbChcIkxcIiwgdHJ1ZSksXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgeyBjb21wbGV0aW9uSW5kZXggfSA9IHRoaXMuc3RhdGU7XG4gICAgICAgIGNvbnN0IGhhc0F1dG9jb21wbGV0ZSA9IEJvb2xlYW4odGhpcy5zdGF0ZS5hdXRvQ29tcGxldGUpO1xuICAgICAgICBsZXQgYWN0aXZlRGVzY2VuZGFudDogc3RyaW5nO1xuICAgICAgICBpZiAoaGFzQXV0b2NvbXBsZXRlICYmIGNvbXBsZXRpb25JbmRleCA+PSAwKSB7XG4gICAgICAgICAgICBhY3RpdmVEZXNjZW5kYW50ID0gZ2VuZXJhdGVDb21wbGV0aW9uRG9tSWQoY29tcGxldGlvbkluZGV4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoPGRpdiBjbGFzc05hbWU9e3dyYXBwZXJDbGFzc2VzfT5cbiAgICAgICAgICAgIHsgYXV0b0NvbXBsZXRlIH1cbiAgICAgICAgICAgIDxNZXNzYWdlQ29tcG9zZXJGb3JtYXRCYXIgcmVmPXt0aGlzLmZvcm1hdEJhclJlZn0gb25BY3Rpb249e3RoaXMub25Gb3JtYXRBY3Rpb259IHNob3J0Y3V0cz17c2hvcnRjdXRzfSAvPlxuICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3Nlc31cbiAgICAgICAgICAgICAgICBjb250ZW50RWRpdGFibGU9e3RoaXMucHJvcHMuZGlzYWJsZWQgPyBudWxsIDogdHJ1ZX1cbiAgICAgICAgICAgICAgICB0YWJJbmRleD17MH1cbiAgICAgICAgICAgICAgICBvbkJsdXI9e3RoaXMub25CbHVyfVxuICAgICAgICAgICAgICAgIG9uRm9jdXM9e3RoaXMub25Gb2N1c31cbiAgICAgICAgICAgICAgICBvbkNvcHk9e3RoaXMub25Db3B5fVxuICAgICAgICAgICAgICAgIG9uQ3V0PXt0aGlzLm9uQ3V0fVxuICAgICAgICAgICAgICAgIG9uUGFzdGU9e3RoaXMub25QYXN0ZX1cbiAgICAgICAgICAgICAgICBvbktleURvd249e3RoaXMub25LZXlEb3dufVxuICAgICAgICAgICAgICAgIHJlZj17dGhpcy5lZGl0b3JSZWZ9XG4gICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17dGhpcy5wcm9wcy5sYWJlbH1cbiAgICAgICAgICAgICAgICByb2xlPVwidGV4dGJveFwiXG4gICAgICAgICAgICAgICAgYXJpYS1tdWx0aWxpbmU9XCJ0cnVlXCJcbiAgICAgICAgICAgICAgICBhcmlhLWF1dG9jb21wbGV0ZT1cImxpc3RcIlxuICAgICAgICAgICAgICAgIGFyaWEtaGFzcG9wdXA9XCJsaXN0Ym94XCJcbiAgICAgICAgICAgICAgICBhcmlhLWV4cGFuZGVkPXtoYXNBdXRvY29tcGxldGUgPyB0cnVlIDogdW5kZWZpbmVkfVxuICAgICAgICAgICAgICAgIGFyaWEtb3ducz17aGFzQXV0b2NvbXBsZXRlID8gXCJteF9BdXRvY29tcGxldGVcIiA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICBhcmlhLWFjdGl2ZWRlc2NlbmRhbnQ9e2FjdGl2ZURlc2NlbmRhbnR9XG4gICAgICAgICAgICAgICAgZGlyPVwiYXV0b1wiXG4gICAgICAgICAgICAgICAgYXJpYS1kaXNhYmxlZD17dGhpcy5wcm9wcy5kaXNhYmxlZH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2Pik7XG4gICAgfVxuXG4gICAgcHVibGljIGZvY3VzKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmVkaXRvclJlZi5jdXJyZW50LmZvY3VzKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGluc2VydE1lbnRpb24odXNlcklkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5tb2RpZmllZEZsYWcgPSB0cnVlO1xuICAgICAgICBjb25zdCB7IG1vZGVsIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICBjb25zdCB7IHBhcnRDcmVhdG9yIH0gPSBtb2RlbDtcbiAgICAgICAgY29uc3QgbWVtYmVyID0gdGhpcy5wcm9wcy5yb29tLmdldE1lbWJlcih1c2VySWQpO1xuICAgICAgICBjb25zdCBkaXNwbGF5TmFtZSA9IG1lbWJlciA/XG4gICAgICAgICAgICBtZW1iZXIucmF3RGlzcGxheU5hbWUgOiB1c2VySWQ7XG4gICAgICAgIGNvbnN0IGNhcmV0ID0gdGhpcy5nZXRDYXJldCgpO1xuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IG1vZGVsLnBvc2l0aW9uRm9yT2Zmc2V0KGNhcmV0Lm9mZnNldCwgY2FyZXQuYXROb2RlRW5kKTtcbiAgICAgICAgLy8gSW5zZXJ0IHN1ZmZpeCBvbmx5IGlmIHRoZSBjYXJldCBpcyBhdCB0aGUgc3RhcnQgb2YgdGhlIGNvbXBvc2VyXG4gICAgICAgIGNvbnN0IHBhcnRzID0gcGFydENyZWF0b3IuY3JlYXRlTWVudGlvblBhcnRzKGNhcmV0Lm9mZnNldCA9PT0gMCwgZGlzcGxheU5hbWUsIHVzZXJJZCk7XG4gICAgICAgIG1vZGVsLnRyYW5zZm9ybSgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhZGRlZExlbiA9IG1vZGVsLmluc2VydChwYXJ0cywgcG9zaXRpb24pO1xuICAgICAgICAgICAgcmV0dXJuIG1vZGVsLnBvc2l0aW9uRm9yT2Zmc2V0KGNhcmV0Lm9mZnNldCArIGFkZGVkTGVuLCB0cnVlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIHJlZm9jdXMgb24gY29tcG9zZXIsIGFzIHdlIGp1c3QgY2xpY2tlZCBcIk1lbnRpb25cIlxuICAgICAgICB0aGlzLmZvY3VzKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGluc2VydFF1b3RlZE1lc3NhZ2UoZXZlbnQ6IE1hdHJpeEV2ZW50KTogdm9pZCB7XG4gICAgICAgIHRoaXMubW9kaWZpZWRGbGFnID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgeyBtb2RlbCB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgY29uc3QgeyBwYXJ0Q3JlYXRvciB9ID0gbW9kZWw7XG4gICAgICAgIGNvbnN0IHF1b3RlUGFydHMgPSBwYXJzZUV2ZW50KGV2ZW50LCBwYXJ0Q3JlYXRvciwgeyBpc1F1b3RlZE1lc3NhZ2U6IHRydWUgfSk7XG4gICAgICAgIC8vIGFkZCB0d28gbmV3bGluZXNcbiAgICAgICAgcXVvdGVQYXJ0cy5wdXNoKHBhcnRDcmVhdG9yLm5ld2xpbmUoKSk7XG4gICAgICAgIHF1b3RlUGFydHMucHVzaChwYXJ0Q3JlYXRvci5uZXdsaW5lKCkpO1xuICAgICAgICBtb2RlbC50cmFuc2Zvcm0oKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYWRkZWRMZW4gPSBtb2RlbC5pbnNlcnQocXVvdGVQYXJ0cywgbW9kZWwucG9zaXRpb25Gb3JPZmZzZXQoMCkpO1xuICAgICAgICAgICAgcmV0dXJuIG1vZGVsLnBvc2l0aW9uRm9yT2Zmc2V0KGFkZGVkTGVuLCB0cnVlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIHJlZm9jdXMgb24gY29tcG9zZXIsIGFzIHdlIGp1c3QgY2xpY2tlZCBcIlF1b3RlXCJcbiAgICAgICAgdGhpcy5mb2N1cygpO1xuICAgIH1cblxuICAgIHB1YmxpYyBpbnNlcnRQbGFpbnRleHQodGV4dDogc3RyaW5nKTogdm9pZCB7XG4gICAgICAgIHRoaXMubW9kaWZpZWRGbGFnID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgeyBtb2RlbCB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgY29uc3QgeyBwYXJ0Q3JlYXRvciB9ID0gbW9kZWw7XG4gICAgICAgIGNvbnN0IGNhcmV0ID0gdGhpcy5nZXRDYXJldCgpO1xuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IG1vZGVsLnBvc2l0aW9uRm9yT2Zmc2V0KGNhcmV0Lm9mZnNldCwgY2FyZXQuYXROb2RlRW5kKTtcbiAgICAgICAgbW9kZWwudHJhbnNmb3JtKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFkZGVkTGVuID0gbW9kZWwuaW5zZXJ0KHBhcnRDcmVhdG9yLnBsYWluV2l0aEVtb2ppKHRleHQpLCBwb3NpdGlvbik7XG4gICAgICAgICAgICByZXR1cm4gbW9kZWwucG9zaXRpb25Gb3JPZmZzZXQoY2FyZXQub2Zmc2V0ICsgYWRkZWRMZW4sIHRydWUpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUdBOztBQUNBOztBQUdBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQU1BOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBb0NBO0FBQ0EsTUFBTUEseUJBQXlCLEdBQUcsSUFBSUMsTUFBSixDQUFXLGVBQWVDLGlCQUFBLENBQWVDLE1BQTlCLEdBQXVDLFVBQWxELENBQWxDO0FBQ08sTUFBTUMsY0FBYyxHQUFHLElBQUlILE1BQUosQ0FBVyxlQUFlQyxpQkFBQSxDQUFlQyxNQUE5QixH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