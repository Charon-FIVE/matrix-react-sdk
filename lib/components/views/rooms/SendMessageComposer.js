"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SendMessageComposer = void 0;
exports.attachRelation = attachRelation;
exports.createMessageContent = createMessageContent;
exports.default = void 0;
exports.isQuickReaction = isQuickReaction;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _emojibaseRegex = _interopRequireDefault(require("emojibase-regex"));

var _lodash = require("lodash");

var _event = require("matrix-js-sdk/src/@types/event");

var _logger = require("matrix-js-sdk/src/logger");

var _thread = require("matrix-js-sdk/src/models/thread");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _model = _interopRequireDefault(require("../../../editor/model"));

var _serialize = require("../../../editor/serialize");

var _BasicMessageComposer = _interopRequireWildcard(require("./BasicMessageComposer"));

var _parts = require("../../../editor/parts");

var _EventUtils = require("../../../utils/EventUtils");

var _SendHistoryManager = _interopRequireDefault(require("../../../SendHistoryManager"));

var _SlashCommands = require("../../../SlashCommands");

var _ContentMessages = _interopRequireDefault(require("../../../ContentMessages"));

var _MatrixClientContext = require("../../../contexts/MatrixClientContext");

var _actions = require("../../../dispatcher/actions");

var _utils = require("../../../effects/utils");

var _effects = require("../../../effects");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _KeyBindingsManager = require("../../../KeyBindingsManager");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _sendTimePerformanceMetrics = require("../../../sendTimePerformanceMetrics");

var _RoomContext = _interopRequireWildcard(require("../../../contexts/RoomContext"));

var _position = _interopRequireDefault(require("../../../editor/position"));

var _ComposerInsertPayload = require("../../../dispatcher/payloads/ComposerInsertPayload");

var _commands = require("../../../editor/commands");

var _KeyboardShortcuts = require("../../../accessibility/KeyboardShortcuts");

var _PosthogAnalytics = require("../../../PosthogAnalytics");

var _Reply = require("../../../utils/Reply");

var _localRoom = require("../../../utils/local-room");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

// Merges favouring the given relation
function attachRelation(content, relation) {
  if (relation) {
    content['m.relates_to'] = _objectSpread(_objectSpread({}, content['m.relates_to'] || {}), relation);
  }
} // exported for tests


function createMessageContent(model, replyToEvent, relation, permalinkCreator) {
  let includeReplyLegacyFallback = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
  const isEmote = (0, _serialize.containsEmote)(model);

  if (isEmote) {
    model = (0, _serialize.stripEmoteCommand)(model);
  }

  if ((0, _serialize.startsWith)(model, "//")) {
    model = (0, _serialize.stripPrefix)(model, "/");
  }

  model = (0, _serialize.unescapeMessage)(model);
  const body = (0, _serialize.textSerialize)(model);
  const content = {
    msgtype: isEmote ? "m.emote" : "m.text",
    body: body
  };
  const formattedBody = (0, _serialize.htmlSerializeIfNeeded)(model, {
    forceHTML: !!replyToEvent,
    useMarkdown: _SettingsStore.default.getValue("MessageComposerInput.useMarkdown")
  });

  if (formattedBody) {
    content.format = "org.matrix.custom.html";
    content.formatted_body = formattedBody;
  }

  attachRelation(content, relation);

  if (replyToEvent) {
    (0, _Reply.addReplyToMessageContent)(content, replyToEvent, {
      permalinkCreator,
      includeLegacyFallback: includeReplyLegacyFallback
    });
  }

  return content;
} // exported for tests


function isQuickReaction(model) {
  const parts = model.parts;
  if (parts.length == 0) return false;
  const text = (0, _serialize.textSerialize)(model); // shortcut takes the form "+:emoji:" or "+ :emoji:""
  // can be in 1 or 2 parts

  if (parts.length <= 2) {
    const hasShortcut = text.startsWith("+") || text.startsWith("+ ");
    const emojiMatch = text.match(_emojibaseRegex.default);

    if (hasShortcut && emojiMatch && emojiMatch.length == 1) {
      return emojiMatch[0] === text.substring(1) || emojiMatch[0] === text.substring(2);
    }
  }

  return false;
}

class SendMessageComposer extends _react.default.Component {
  constructor(props, context) {
    super(props);
    (0, _defineProperty2.default)(this, "context", void 0);
    (0, _defineProperty2.default)(this, "prepareToEncrypt", void 0);
    (0, _defineProperty2.default)(this, "editorRef", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "model", null);
    (0, _defineProperty2.default)(this, "currentlyComposedEditorState", null);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "sendHistoryManager", void 0);
    (0, _defineProperty2.default)(this, "onKeyDown", event => {
      // ignore any keypress while doing IME compositions
      if (this.editorRef.current?.isComposing(event)) {
        return;
      }

      const replyingToThread = this.props.relation?.key === _thread.THREAD_RELATION_TYPE.name;
      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getMessageComposerAction(event);

      switch (action) {
        case _KeyboardShortcuts.KeyBindingAction.SendMessage:
          this.sendMessage();
          event.preventDefault();
          break;

        case _KeyboardShortcuts.KeyBindingAction.SelectPrevSendHistory:
        case _KeyboardShortcuts.KeyBindingAction.SelectNextSendHistory:
          {
            // Try select composer history
            const selected = this.selectSendHistory(action === _KeyboardShortcuts.KeyBindingAction.SelectPrevSendHistory);

            if (selected) {
              // We're selecting history, so prevent the key event from doing anything else
              event.preventDefault();
            }

            break;
          }

        case _KeyboardShortcuts.KeyBindingAction.ShowStickerPicker:
          {
            if (!_SettingsStore.default.getValue("MessageComposerInput.showStickersButton")) {
              return; // Do nothing if there is no Stickers button
            }

            this.props.toggleStickerPickerOpen();
            event.preventDefault();
            break;
          }

        case _KeyboardShortcuts.KeyBindingAction.EditPrevMessage:
          // selection must be collapsed and caret at start
          if (this.editorRef.current?.isSelectionCollapsed() && this.editorRef.current?.isCaretAtStart()) {
            const events = this.context.liveTimeline.getEvents().concat(replyingToThread ? [] : this.props.room.getPendingEvents());
            const editEvent = (0, _EventUtils.findEditableEvent)({
              events,
              isForward: false
            });

            if (editEvent) {
              // We're selecting history, so prevent the key event from doing anything else
              event.preventDefault();

              _dispatcher.default.dispatch({
                action: _actions.Action.EditEvent,
                event: editEvent,
                timelineRenderingType: this.context.timelineRenderingType
              });
            }
          }

          break;

        case _KeyboardShortcuts.KeyBindingAction.CancelReplyOrEdit:
          _dispatcher.default.dispatch({
            action: 'reply_to_event',
            event: null,
            context: this.context.timelineRenderingType
          });

          break;

        default:
          if (this.prepareToEncrypt) {
            // This needs to be last!
            this.prepareToEncrypt();
          }

      }
    });
    (0, _defineProperty2.default)(this, "shouldSaveStoredEditorState", () => {
      return !this.model.isEmpty || !!this.props.replyToEvent;
    });
    (0, _defineProperty2.default)(this, "saveStoredEditorState", () => {
      if (this.shouldSaveStoredEditorState()) {
        const item = _SendHistoryManager.default.createItem(this.model, this.props.replyToEvent);

        localStorage.setItem(this.editorStateKey, JSON.stringify(item));
      } else {
        this.clearStoredEditorState();
      }
    });
    (0, _defineProperty2.default)(this, "onAction", payload => {
      // don't let the user into the composer if it is disabled - all of these branches lead
      // to the cursor being in the composer
      if (this.props.disabled) return;

      switch (payload.action) {
        case 'reply_to_event':
        case _actions.Action.FocusSendMessageComposer:
          if ((payload.context ?? _RoomContext.TimelineRenderingType.Room) === this.context.timelineRenderingType) {
            this.editorRef.current?.focus();
          }

          break;

        case _actions.Action.ComposerInsert:
          if (payload.timelineRenderingType !== this.context.timelineRenderingType) break;
          if (payload.composerType !== _ComposerInsertPayload.ComposerType.Send) break;

          if (payload.userId) {
            this.editorRef.current?.insertMention(payload.userId);
          } else if (payload.event) {
            this.editorRef.current?.insertQuotedMessage(payload.event);
          } else if (payload.text) {
            this.editorRef.current?.insertPlaintext(payload.text);
          }

          break;
      }
    });
    (0, _defineProperty2.default)(this, "onPaste", event => {
      const {
        clipboardData
      } = event; // Prioritize text on the clipboard over files if RTF is present as Office on macOS puts a bitmap
      // in the clipboard as well as the content being copied. Modern versions of Office seem to not do this anymore.
      // We check text/rtf instead of text/plain as when copy+pasting a file from Finder or Gnome Image Viewer
      // it puts the filename in as text/plain which we want to ignore.

      if (clipboardData.files.length && !clipboardData.types.includes("text/rtf")) {
        _ContentMessages.default.sharedInstance().sendContentListToRoom(Array.from(clipboardData.files), this.props.room.roomId, this.props.relation, this.props.mxClient, this.context.timelineRenderingType);

        return true; // to skip internal onPaste handler
      }
    });
    (0, _defineProperty2.default)(this, "onChange", () => {
      if (this.props.onChange) this.props.onChange(this.model);
    });
    (0, _defineProperty2.default)(this, "focusComposer", () => {
      this.editorRef.current?.focus();
    });

    if (this.props.mxClient.isCryptoEnabled() && this.props.mxClient.isRoomEncrypted(this.props.room.roomId)) {
      this.prepareToEncrypt = (0, _lodash.throttle)(() => {
        this.props.mxClient.prepareToEncrypt(this.props.room);
      }, 60000, {
        leading: true,
        trailing: false
      });
    }

    window.addEventListener("beforeunload", this.saveStoredEditorState);
  }

  componentDidUpdate(prevProps) {
    const replyingToThread = this.props.relation?.key === _thread.THREAD_RELATION_TYPE.name;
    const differentEventTarget = this.props.relation?.event_id !== prevProps.relation?.event_id;
    const threadChanged = replyingToThread && differentEventTarget;

    if (threadChanged) {
      const partCreator = new _parts.CommandPartCreator(this.props.room, this.props.mxClient);
      const parts = this.restoreStoredEditorState(partCreator) || [];
      this.model.reset(parts);
      this.editorRef.current?.focus();
    }
  }

  // we keep sent messages/commands in a separate history (separate from undo history)
  // so you can alt+up/down in them
  selectSendHistory(up) {
    const delta = up ? -1 : 1; // True if we are not currently selecting history, but composing a message

    if (this.sendHistoryManager.currentIndex === this.sendHistoryManager.history.length) {
      // We can't go any further - there isn't any more history, so nop.
      if (!up) {
        return false;
      }

      this.currentlyComposedEditorState = this.model.serializeParts();
    } else if (this.sendHistoryManager.currentIndex + delta === this.sendHistoryManager.history.length) {
      // True when we return to the message being composed currently
      this.model.reset(this.currentlyComposedEditorState);
      this.sendHistoryManager.currentIndex = this.sendHistoryManager.history.length;
      return true;
    }

    const {
      parts,
      replyEventId
    } = this.sendHistoryManager.getItem(delta);

    _dispatcher.default.dispatch({
      action: 'reply_to_event',
      event: replyEventId ? this.props.room.findEventById(replyEventId) : null,
      context: this.context.timelineRenderingType
    });

    if (parts) {
      this.model.reset(parts);
      this.editorRef.current?.focus();
    }

    return true;
  }

  sendQuickReaction() {
    const timeline = this.context.liveTimeline;
    const events = timeline.getEvents();
    const reaction = this.model.parts[1].text;

    for (let i = events.length - 1; i >= 0; i--) {
      if (events[i].getType() === _event.EventType.RoomMessage) {
        let shouldReact = true;
        const lastMessage = events[i];

        const userId = _MatrixClientPeg.MatrixClientPeg.get().getUserId();

        const messageReactions = this.props.room.relations.getChildEventsForEvent(lastMessage.getId(), _event.RelationType.Annotation, _event.EventType.Reaction); // if we have already sent this reaction, don't redact but don't re-send

        if (messageReactions) {
          const myReactionEvents = messageReactions.getAnnotationsBySender()[userId] || [];
          const myReactionKeys = [...myReactionEvents].filter(event => !event.isRedacted()).map(event => event.getRelation().key);
          shouldReact = !myReactionKeys.includes(reaction);
        }

        if (shouldReact) {
          _MatrixClientPeg.MatrixClientPeg.get().sendEvent(lastMessage.getRoomId(), _event.EventType.Reaction, {
            "m.relates_to": {
              "rel_type": _event.RelationType.Annotation,
              "event_id": lastMessage.getId(),
              "key": reaction
            }
          });

          _dispatcher.default.dispatch({
            action: "message_sent"
          });
        }

        break;
      }
    }
  }

  async sendMessage() {
    const model = this.model;

    if (model.isEmpty) {
      return;
    }

    const posthogEvent = {
      eventName: "Composer",
      isEditing: false,
      isReply: !!this.props.replyToEvent,
      inThread: this.props.relation?.rel_type === _thread.THREAD_RELATION_TYPE.name
    };

    if (posthogEvent.inThread) {
      const threadRoot = this.props.room.findEventById(this.props.relation.event_id);
      posthogEvent.startsThread = threadRoot?.getThread()?.events.length === 1;
    }

    _PosthogAnalytics.PosthogAnalytics.instance.trackEvent(posthogEvent); // Replace emoticon at the end of the message


    if (_SettingsStore.default.getValue('MessageComposerInput.autoReplaceEmoji')) {
      const indexOfLastPart = model.parts.length - 1;
      const positionInLastPart = model.parts[indexOfLastPart].text.length;
      this.editorRef.current?.replaceEmoticon(new _position.default(indexOfLastPart, positionInLastPart), _BasicMessageComposer.REGEX_EMOTICON);
    }

    const replyToEvent = this.props.replyToEvent;
    let shouldSend = true;
    let content;

    if (!(0, _serialize.containsEmote)(model) && (0, _commands.isSlashCommand)(this.model)) {
      const [cmd, args, commandText] = (0, _commands.getSlashCommand)(this.model);

      if (cmd) {
        const threadId = this.props.relation?.rel_type === _thread.THREAD_RELATION_TYPE.name ? this.props.relation?.event_id : null;
        let commandSuccessful;
        [content, commandSuccessful] = await (0, _commands.runSlashCommand)(cmd, args, this.props.room.roomId, threadId);

        if (!commandSuccessful) {
          return; // errored
        }

        if (cmd.category === _SlashCommands.CommandCategories.messages || cmd.category === _SlashCommands.CommandCategories.effects) {
          attachRelation(content, this.props.relation);

          if (replyToEvent) {
            (0, _Reply.addReplyToMessageContent)(content, replyToEvent, {
              permalinkCreator: this.props.permalinkCreator,
              // Exclude the legacy fallback for custom event types such as those used by /fireworks
              includeLegacyFallback: content.msgtype?.startsWith("m.") ?? true
            });
          }
        } else {
          shouldSend = false;
        }
      } else if (!(await (0, _commands.shouldSendAnyway)(commandText))) {
        // if !sendAnyway bail to let the user edit the composer and try again
        return;
      }
    }

    if (isQuickReaction(model)) {
      shouldSend = false;
      this.sendQuickReaction();
    }

    if (shouldSend) {
      const {
        roomId
      } = this.props.room;

      if (!content) {
        content = createMessageContent(model, replyToEvent, this.props.relation, this.props.permalinkCreator, this.props.includeReplyLegacyFallback);
      } // don't bother sending an empty message


      if (!content.body.trim()) return;

      if (_SettingsStore.default.getValue("Performance.addSendMessageTimingMetadata")) {
        (0, _sendTimePerformanceMetrics.decorateStartSendingTime)(content);
      }

      const threadId = this.props.relation?.rel_type === _thread.THREAD_RELATION_TYPE.name ? this.props.relation.event_id : null;
      const prom = (0, _localRoom.doMaybeLocalRoomAction)(roomId, actualRoomId => this.props.mxClient.sendMessage(actualRoomId, threadId, content), this.props.mxClient);

      if (replyToEvent) {
        // Clear reply_to_event as we put the message into the queue
        // if the send fails, retry will handle resending.
        _dispatcher.default.dispatch({
          action: 'reply_to_event',
          event: null,
          context: this.context.timelineRenderingType
        });
      }

      _dispatcher.default.dispatch({
        action: "message_sent"
      });

      _effects.CHAT_EFFECTS.forEach(effect => {
        if ((0, _utils.containsEmoji)(content, effect.emojis)) {
          // For initial threads launch, chat effects are disabled
          // see #19731
          const isNotThread = this.props.relation?.rel_type !== _thread.THREAD_RELATION_TYPE.name;

          if (!_SettingsStore.default.getValue("feature_thread") || isNotThread) {
            _dispatcher.default.dispatch({
              action: `effects.${effect.command}`
            });
          }
        }
      });

      if (_SettingsStore.default.getValue("Performance.addSendMessageTimingMetadata")) {
        prom.then(resp => {
          (0, _sendTimePerformanceMetrics.sendRoundTripMetric)(this.props.mxClient, roomId, resp.event_id);
        });
      }
    }

    this.sendHistoryManager.save(model, replyToEvent); // clear composer

    model.reset([]);
    this.editorRef.current?.clearUndoHistory();
    this.editorRef.current?.focus();
    this.clearStoredEditorState();

    if (shouldSend && _SettingsStore.default.getValue("scrollToBottomOnMessageSent")) {
      _dispatcher.default.dispatch({
        action: "scroll_to_bottom",
        timelineRenderingType: this.context.timelineRenderingType
      });
    }
  }

  componentWillUnmount() {
    _dispatcher.default.unregister(this.dispatcherRef);

    window.removeEventListener("beforeunload", this.saveStoredEditorState);
    this.saveStoredEditorState();
  } // TODO: [REACT-WARNING] Move this to constructor


  UNSAFE_componentWillMount() {
    // eslint-disable-line
    const partCreator = new _parts.CommandPartCreator(this.props.room, this.props.mxClient);
    const parts = this.restoreStoredEditorState(partCreator) || [];
    this.model = new _model.default(parts, partCreator);
    this.dispatcherRef = _dispatcher.default.register(this.onAction);
    this.sendHistoryManager = new _SendHistoryManager.default(this.props.room.roomId, 'mx_cider_history_');
  }

  get editorStateKey() {
    let key = `mx_cider_state_${this.props.room.roomId}`;

    if (this.props.relation?.rel_type === _thread.THREAD_RELATION_TYPE.name) {
      key += `_${this.props.relation.event_id}`;
    }

    return key;
  }

  clearStoredEditorState() {
    localStorage.removeItem(this.editorStateKey);
  }

  restoreStoredEditorState(partCreator) {
    const replyingToThread = this.props.relation?.key === _thread.THREAD_RELATION_TYPE.name;

    if (replyingToThread) {
      return null;
    }

    const json = localStorage.getItem(this.editorStateKey);

    if (json) {
      try {
        const {
          parts: serializedParts,
          replyEventId
        } = JSON.parse(json);
        const parts = serializedParts.map(p => partCreator.deserializePart(p));

        if (replyEventId) {
          _dispatcher.default.dispatch({
            action: 'reply_to_event',
            event: this.props.room.findEventById(replyEventId),
            context: this.context.timelineRenderingType
          });
        }

        return parts;
      } catch (e) {
        _logger.logger.error(e);
      }
    }
  } // should save state when editor has contents or reply is open


  render() {
    const threadId = this.props.relation?.rel_type === _thread.THREAD_RELATION_TYPE.name ? this.props.relation.event_id : null;
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SendMessageComposer",
      onClick: this.focusComposer,
      onKeyDown: this.onKeyDown
    }, /*#__PURE__*/_react.default.createElement(_BasicMessageComposer.default, {
      onChange: this.onChange,
      ref: this.editorRef,
      model: this.model,
      room: this.props.room,
      threadId: threadId,
      label: this.props.placeholder,
      placeholder: this.props.placeholder,
      onPaste: this.onPaste,
      disabled: this.props.disabled
    }));
  }

}

exports.SendMessageComposer = SendMessageComposer;
(0, _defineProperty2.default)(SendMessageComposer, "contextType", _RoomContext.default);
(0, _defineProperty2.default)(SendMessageComposer, "defaultProps", {
  includeReplyLegacyFallback: true
});
const SendMessageComposerWithMatrixClient = (0, _MatrixClientContext.withMatrixClientHOC)(SendMessageComposer);
var _default = SendMessageComposerWithMatrixClient;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhdHRhY2hSZWxhdGlvbiIsImNvbnRlbnQiLCJyZWxhdGlvbiIsImNyZWF0ZU1lc3NhZ2VDb250ZW50IiwibW9kZWwiLCJyZXBseVRvRXZlbnQiLCJwZXJtYWxpbmtDcmVhdG9yIiwiaW5jbHVkZVJlcGx5TGVnYWN5RmFsbGJhY2siLCJpc0Vtb3RlIiwiY29udGFpbnNFbW90ZSIsInN0cmlwRW1vdGVDb21tYW5kIiwic3RhcnRzV2l0aCIsInN0cmlwUHJlZml4IiwidW5lc2NhcGVNZXNzYWdlIiwiYm9keSIsInRleHRTZXJpYWxpemUiLCJtc2d0eXBlIiwiZm9ybWF0dGVkQm9keSIsImh0bWxTZXJpYWxpemVJZk5lZWRlZCIsImZvcmNlSFRNTCIsInVzZU1hcmtkb3duIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwiZm9ybWF0IiwiZm9ybWF0dGVkX2JvZHkiLCJhZGRSZXBseVRvTWVzc2FnZUNvbnRlbnQiLCJpbmNsdWRlTGVnYWN5RmFsbGJhY2siLCJpc1F1aWNrUmVhY3Rpb24iLCJwYXJ0cyIsImxlbmd0aCIsInRleHQiLCJoYXNTaG9ydGN1dCIsImVtb2ppTWF0Y2giLCJtYXRjaCIsIkVNT0pJX1JFR0VYIiwic3Vic3RyaW5nIiwiU2VuZE1lc3NhZ2VDb21wb3NlciIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImNvbnRleHQiLCJjcmVhdGVSZWYiLCJldmVudCIsImVkaXRvclJlZiIsImN1cnJlbnQiLCJpc0NvbXBvc2luZyIsInJlcGx5aW5nVG9UaHJlYWQiLCJrZXkiLCJUSFJFQURfUkVMQVRJT05fVFlQRSIsIm5hbWUiLCJhY3Rpb24iLCJnZXRLZXlCaW5kaW5nc01hbmFnZXIiLCJnZXRNZXNzYWdlQ29tcG9zZXJBY3Rpb24iLCJLZXlCaW5kaW5nQWN0aW9uIiwiU2VuZE1lc3NhZ2UiLCJzZW5kTWVzc2FnZSIsInByZXZlbnREZWZhdWx0IiwiU2VsZWN0UHJldlNlbmRIaXN0b3J5IiwiU2VsZWN0TmV4dFNlbmRIaXN0b3J5Iiwic2VsZWN0ZWQiLCJzZWxlY3RTZW5kSGlzdG9yeSIsIlNob3dTdGlja2VyUGlja2VyIiwidG9nZ2xlU3RpY2tlclBpY2tlck9wZW4iLCJFZGl0UHJldk1lc3NhZ2UiLCJpc1NlbGVjdGlvbkNvbGxhcHNlZCIsImlzQ2FyZXRBdFN0YXJ0IiwiZXZlbnRzIiwibGl2ZVRpbWVsaW5lIiwiZ2V0RXZlbnRzIiwiY29uY2F0Iiwicm9vbSIsImdldFBlbmRpbmdFdmVudHMiLCJlZGl0RXZlbnQiLCJmaW5kRWRpdGFibGVFdmVudCIsImlzRm9yd2FyZCIsImRpcyIsImRpc3BhdGNoIiwiQWN0aW9uIiwiRWRpdEV2ZW50IiwidGltZWxpbmVSZW5kZXJpbmdUeXBlIiwiQ2FuY2VsUmVwbHlPckVkaXQiLCJwcmVwYXJlVG9FbmNyeXB0IiwiaXNFbXB0eSIsInNob3VsZFNhdmVTdG9yZWRFZGl0b3JTdGF0ZSIsIml0ZW0iLCJTZW5kSGlzdG9yeU1hbmFnZXIiLCJjcmVhdGVJdGVtIiwibG9jYWxTdG9yYWdlIiwic2V0SXRlbSIsImVkaXRvclN0YXRlS2V5IiwiSlNPTiIsInN0cmluZ2lmeSIsImNsZWFyU3RvcmVkRWRpdG9yU3RhdGUiLCJwYXlsb2FkIiwiZGlzYWJsZWQiLCJGb2N1c1NlbmRNZXNzYWdlQ29tcG9zZXIiLCJUaW1lbGluZVJlbmRlcmluZ1R5cGUiLCJSb29tIiwiZm9jdXMiLCJDb21wb3Nlckluc2VydCIsImNvbXBvc2VyVHlwZSIsIkNvbXBvc2VyVHlwZSIsIlNlbmQiLCJ1c2VySWQiLCJpbnNlcnRNZW50aW9uIiwiaW5zZXJ0UXVvdGVkTWVzc2FnZSIsImluc2VydFBsYWludGV4dCIsImNsaXBib2FyZERhdGEiLCJmaWxlcyIsInR5cGVzIiwiaW5jbHVkZXMiLCJDb250ZW50TWVzc2FnZXMiLCJzaGFyZWRJbnN0YW5jZSIsInNlbmRDb250ZW50TGlzdFRvUm9vbSIsIkFycmF5IiwiZnJvbSIsInJvb21JZCIsIm14Q2xpZW50Iiwib25DaGFuZ2UiLCJpc0NyeXB0b0VuYWJsZWQiLCJpc1Jvb21FbmNyeXB0ZWQiLCJ0aHJvdHRsZSIsImxlYWRpbmciLCJ0cmFpbGluZyIsIndpbmRvdyIsImFkZEV2ZW50TGlzdGVuZXIiLCJzYXZlU3RvcmVkRWRpdG9yU3RhdGUiLCJjb21wb25lbnREaWRVcGRhdGUiLCJwcmV2UHJvcHMiLCJkaWZmZXJlbnRFdmVudFRhcmdldCIsImV2ZW50X2lkIiwidGhyZWFkQ2hhbmdlZCIsInBhcnRDcmVhdG9yIiwiQ29tbWFuZFBhcnRDcmVhdG9yIiwicmVzdG9yZVN0b3JlZEVkaXRvclN0YXRlIiwicmVzZXQiLCJ1cCIsImRlbHRhIiwic2VuZEhpc3RvcnlNYW5hZ2VyIiwiY3VycmVudEluZGV4IiwiaGlzdG9yeSIsImN1cnJlbnRseUNvbXBvc2VkRWRpdG9yU3RhdGUiLCJzZXJpYWxpemVQYXJ0cyIsInJlcGx5RXZlbnRJZCIsImdldEl0ZW0iLCJmaW5kRXZlbnRCeUlkIiwic2VuZFF1aWNrUmVhY3Rpb24iLCJ0aW1lbGluZSIsInJlYWN0aW9uIiwiaSIsImdldFR5cGUiLCJFdmVudFR5cGUiLCJSb29tTWVzc2FnZSIsInNob3VsZFJlYWN0IiwibGFzdE1lc3NhZ2UiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJnZXRVc2VySWQiLCJtZXNzYWdlUmVhY3Rpb25zIiwicmVsYXRpb25zIiwiZ2V0Q2hpbGRFdmVudHNGb3JFdmVudCIsImdldElkIiwiUmVsYXRpb25UeXBlIiwiQW5ub3RhdGlvbiIsIlJlYWN0aW9uIiwibXlSZWFjdGlvbkV2ZW50cyIsImdldEFubm90YXRpb25zQnlTZW5kZXIiLCJteVJlYWN0aW9uS2V5cyIsImZpbHRlciIsImlzUmVkYWN0ZWQiLCJtYXAiLCJnZXRSZWxhdGlvbiIsInNlbmRFdmVudCIsImdldFJvb21JZCIsInBvc3Rob2dFdmVudCIsImV2ZW50TmFtZSIsImlzRWRpdGluZyIsImlzUmVwbHkiLCJpblRocmVhZCIsInJlbF90eXBlIiwidGhyZWFkUm9vdCIsInN0YXJ0c1RocmVhZCIsImdldFRocmVhZCIsIlBvc3Rob2dBbmFseXRpY3MiLCJpbnN0YW5jZSIsInRyYWNrRXZlbnQiLCJpbmRleE9mTGFzdFBhcnQiLCJwb3NpdGlvbkluTGFzdFBhcnQiLCJyZXBsYWNlRW1vdGljb24iLCJEb2N1bWVudFBvc2l0aW9uIiwiUkVHRVhfRU1PVElDT04iLCJzaG91bGRTZW5kIiwiaXNTbGFzaENvbW1hbmQiLCJjbWQiLCJhcmdzIiwiY29tbWFuZFRleHQiLCJnZXRTbGFzaENvbW1hbmQiLCJ0aHJlYWRJZCIsImNvbW1hbmRTdWNjZXNzZnVsIiwicnVuU2xhc2hDb21tYW5kIiwiY2F0ZWdvcnkiLCJDb21tYW5kQ2F0ZWdvcmllcyIsIm1lc3NhZ2VzIiwiZWZmZWN0cyIsInNob3VsZFNlbmRBbnl3YXkiLCJ0cmltIiwiZGVjb3JhdGVTdGFydFNlbmRpbmdUaW1lIiwicHJvbSIsImRvTWF5YmVMb2NhbFJvb21BY3Rpb24iLCJhY3R1YWxSb29tSWQiLCJDSEFUX0VGRkVDVFMiLCJmb3JFYWNoIiwiZWZmZWN0IiwiY29udGFpbnNFbW9qaSIsImVtb2ppcyIsImlzTm90VGhyZWFkIiwiY29tbWFuZCIsInRoZW4iLCJyZXNwIiwic2VuZFJvdW5kVHJpcE1ldHJpYyIsInNhdmUiLCJjbGVhclVuZG9IaXN0b3J5IiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJ1bnJlZ2lzdGVyIiwiZGlzcGF0Y2hlclJlZiIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJVTlNBRkVfY29tcG9uZW50V2lsbE1vdW50IiwiRWRpdG9yTW9kZWwiLCJyZWdpc3RlciIsIm9uQWN0aW9uIiwicmVtb3ZlSXRlbSIsImpzb24iLCJzZXJpYWxpemVkUGFydHMiLCJwYXJzZSIsInAiLCJkZXNlcmlhbGl6ZVBhcnQiLCJlIiwibG9nZ2VyIiwiZXJyb3IiLCJyZW5kZXIiLCJmb2N1c0NvbXBvc2VyIiwib25LZXlEb3duIiwicGxhY2Vob2xkZXIiLCJvblBhc3RlIiwiUm9vbUNvbnRleHQiLCJTZW5kTWVzc2FnZUNvbXBvc2VyV2l0aE1hdHJpeENsaWVudCIsIndpdGhNYXRyaXhDbGllbnRIT0MiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9yb29tcy9TZW5kTWVzc2FnZUNvbXBvc2VyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgLSAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IENsaXBib2FyZEV2ZW50LCBjcmVhdGVSZWYsIEtleWJvYXJkRXZlbnQgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgRU1PSklfUkVHRVggZnJvbSAnZW1vamliYXNlLXJlZ2V4JztcbmltcG9ydCB7IElDb250ZW50LCBNYXRyaXhFdmVudCwgSUV2ZW50UmVsYXRpb24gfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnQnO1xuaW1wb3J0IHsgRGVib3VuY2VkRnVuYywgdGhyb3R0bGUgfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgRXZlbnRUeXBlLCBSZWxhdGlvblR5cGUgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL2V2ZW50XCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb20nO1xuaW1wb3J0IHsgQ29tcG9zZXIgYXMgQ29tcG9zZXJFdmVudCB9IGZyb20gXCJAbWF0cml4LW9yZy9hbmFseXRpY3MtZXZlbnRzL3R5cGVzL3R5cGVzY3JpcHQvQ29tcG9zZXJcIjtcbmltcG9ydCB7IFRIUkVBRF9SRUxBVElPTl9UWVBFIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3RocmVhZCc7XG5cbmltcG9ydCBkaXMgZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCBFZGl0b3JNb2RlbCBmcm9tICcuLi8uLi8uLi9lZGl0b3IvbW9kZWwnO1xuaW1wb3J0IHtcbiAgICBjb250YWluc0Vtb3RlLFxuICAgIGh0bWxTZXJpYWxpemVJZk5lZWRlZCxcbiAgICBzdGFydHNXaXRoLFxuICAgIHN0cmlwRW1vdGVDb21tYW5kLFxuICAgIHN0cmlwUHJlZml4LFxuICAgIHRleHRTZXJpYWxpemUsXG4gICAgdW5lc2NhcGVNZXNzYWdlLFxufSBmcm9tICcuLi8uLi8uLi9lZGl0b3Ivc2VyaWFsaXplJztcbmltcG9ydCBCYXNpY01lc3NhZ2VDb21wb3NlciwgeyBSRUdFWF9FTU9USUNPTiB9IGZyb20gXCIuL0Jhc2ljTWVzc2FnZUNvbXBvc2VyXCI7XG5pbXBvcnQgeyBDb21tYW5kUGFydENyZWF0b3IsIFBhcnQsIFBhcnRDcmVhdG9yLCBTZXJpYWxpemVkUGFydCB9IGZyb20gJy4uLy4uLy4uL2VkaXRvci9wYXJ0cyc7XG5pbXBvcnQgeyBmaW5kRWRpdGFibGVFdmVudCB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL0V2ZW50VXRpbHMnO1xuaW1wb3J0IFNlbmRIaXN0b3J5TWFuYWdlciBmcm9tIFwiLi4vLi4vLi4vU2VuZEhpc3RvcnlNYW5hZ2VyXCI7XG5pbXBvcnQgeyBDb21tYW5kQ2F0ZWdvcmllcyB9IGZyb20gJy4uLy4uLy4uL1NsYXNoQ29tbWFuZHMnO1xuaW1wb3J0IENvbnRlbnRNZXNzYWdlcyBmcm9tICcuLi8uLi8uLi9Db250ZW50TWVzc2FnZXMnO1xuaW1wb3J0IHsgd2l0aE1hdHJpeENsaWVudEhPQywgTWF0cml4Q2xpZW50UHJvcHMgfSBmcm9tIFwiLi4vLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IHsgY29udGFpbnNFbW9qaSB9IGZyb20gXCIuLi8uLi8uLi9lZmZlY3RzL3V0aWxzXCI7XG5pbXBvcnQgeyBDSEFUX0VGRkVDVFMgfSBmcm9tICcuLi8uLi8uLi9lZmZlY3RzJztcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gXCIuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCB7IGdldEtleUJpbmRpbmdzTWFuYWdlciB9IGZyb20gJy4uLy4uLy4uL0tleUJpbmRpbmdzTWFuYWdlcic7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tICcuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlJztcbmltcG9ydCB7IFJvb21QZXJtYWxpbmtDcmVhdG9yIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3Blcm1hbGlua3MvUGVybWFsaW5rc1wiO1xuaW1wb3J0IHsgQWN0aW9uUGF5bG9hZCB9IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzXCI7XG5pbXBvcnQgeyBkZWNvcmF0ZVN0YXJ0U2VuZGluZ1RpbWUsIHNlbmRSb3VuZFRyaXBNZXRyaWMgfSBmcm9tIFwiLi4vLi4vLi4vc2VuZFRpbWVQZXJmb3JtYW5jZU1ldHJpY3NcIjtcbmltcG9ydCBSb29tQ29udGV4dCwgeyBUaW1lbGluZVJlbmRlcmluZ1R5cGUgfSBmcm9tICcuLi8uLi8uLi9jb250ZXh0cy9Sb29tQ29udGV4dCc7XG5pbXBvcnQgRG9jdW1lbnRQb3NpdGlvbiBmcm9tIFwiLi4vLi4vLi4vZWRpdG9yL3Bvc2l0aW9uXCI7XG5pbXBvcnQgeyBDb21wb3NlclR5cGUgfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9Db21wb3Nlckluc2VydFBheWxvYWRcIjtcbmltcG9ydCB7IGdldFNsYXNoQ29tbWFuZCwgaXNTbGFzaENvbW1hbmQsIHJ1blNsYXNoQ29tbWFuZCwgc2hvdWxkU2VuZEFueXdheSB9IGZyb20gXCIuLi8uLi8uLi9lZGl0b3IvY29tbWFuZHNcIjtcbmltcG9ydCB7IEtleUJpbmRpbmdBY3Rpb24gfSBmcm9tIFwiLi4vLi4vLi4vYWNjZXNzaWJpbGl0eS9LZXlib2FyZFNob3J0Y3V0c1wiO1xuaW1wb3J0IHsgUG9zdGhvZ0FuYWx5dGljcyB9IGZyb20gXCIuLi8uLi8uLi9Qb3N0aG9nQW5hbHl0aWNzXCI7XG5pbXBvcnQgeyBhZGRSZXBseVRvTWVzc2FnZUNvbnRlbnQgfSBmcm9tICcuLi8uLi8uLi91dGlscy9SZXBseSc7XG5pbXBvcnQgeyBkb01heWJlTG9jYWxSb29tQWN0aW9uIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvbG9jYWwtcm9vbSc7XG5cbi8vIE1lcmdlcyBmYXZvdXJpbmcgdGhlIGdpdmVuIHJlbGF0aW9uXG5leHBvcnQgZnVuY3Rpb24gYXR0YWNoUmVsYXRpb24oY29udGVudDogSUNvbnRlbnQsIHJlbGF0aW9uPzogSUV2ZW50UmVsYXRpb24pOiB2b2lkIHtcbiAgICBpZiAocmVsYXRpb24pIHtcbiAgICAgICAgY29udGVudFsnbS5yZWxhdGVzX3RvJ10gPSB7XG4gICAgICAgICAgICAuLi4oY29udGVudFsnbS5yZWxhdGVzX3RvJ10gfHwge30pLFxuICAgICAgICAgICAgLi4ucmVsYXRpb24sXG4gICAgICAgIH07XG4gICAgfVxufVxuXG4vLyBleHBvcnRlZCBmb3IgdGVzdHNcbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNZXNzYWdlQ29udGVudChcbiAgICBtb2RlbDogRWRpdG9yTW9kZWwsXG4gICAgcmVwbHlUb0V2ZW50OiBNYXRyaXhFdmVudCxcbiAgICByZWxhdGlvbjogSUV2ZW50UmVsYXRpb24gfCB1bmRlZmluZWQsXG4gICAgcGVybWFsaW5rQ3JlYXRvcjogUm9vbVBlcm1hbGlua0NyZWF0b3IsXG4gICAgaW5jbHVkZVJlcGx5TGVnYWN5RmFsbGJhY2sgPSB0cnVlLFxuKTogSUNvbnRlbnQge1xuICAgIGNvbnN0IGlzRW1vdGUgPSBjb250YWluc0Vtb3RlKG1vZGVsKTtcbiAgICBpZiAoaXNFbW90ZSkge1xuICAgICAgICBtb2RlbCA9IHN0cmlwRW1vdGVDb21tYW5kKG1vZGVsKTtcbiAgICB9XG4gICAgaWYgKHN0YXJ0c1dpdGgobW9kZWwsIFwiLy9cIikpIHtcbiAgICAgICAgbW9kZWwgPSBzdHJpcFByZWZpeChtb2RlbCwgXCIvXCIpO1xuICAgIH1cbiAgICBtb2RlbCA9IHVuZXNjYXBlTWVzc2FnZShtb2RlbCk7XG5cbiAgICBjb25zdCBib2R5ID0gdGV4dFNlcmlhbGl6ZShtb2RlbCk7XG4gICAgY29uc3QgY29udGVudDogSUNvbnRlbnQgPSB7XG4gICAgICAgIG1zZ3R5cGU6IGlzRW1vdGUgPyBcIm0uZW1vdGVcIiA6IFwibS50ZXh0XCIsXG4gICAgICAgIGJvZHk6IGJvZHksXG4gICAgfTtcbiAgICBjb25zdCBmb3JtYXR0ZWRCb2R5ID0gaHRtbFNlcmlhbGl6ZUlmTmVlZGVkKG1vZGVsLCB7XG4gICAgICAgIGZvcmNlSFRNTDogISFyZXBseVRvRXZlbnQsXG4gICAgICAgIHVzZU1hcmtkb3duOiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiTWVzc2FnZUNvbXBvc2VySW5wdXQudXNlTWFya2Rvd25cIiksXG4gICAgfSk7XG4gICAgaWYgKGZvcm1hdHRlZEJvZHkpIHtcbiAgICAgICAgY29udGVudC5mb3JtYXQgPSBcIm9yZy5tYXRyaXguY3VzdG9tLmh0bWxcIjtcbiAgICAgICAgY29udGVudC5mb3JtYXR0ZWRfYm9keSA9IGZvcm1hdHRlZEJvZHk7XG4gICAgfVxuXG4gICAgYXR0YWNoUmVsYXRpb24oY29udGVudCwgcmVsYXRpb24pO1xuICAgIGlmIChyZXBseVRvRXZlbnQpIHtcbiAgICAgICAgYWRkUmVwbHlUb01lc3NhZ2VDb250ZW50KGNvbnRlbnQsIHJlcGx5VG9FdmVudCwge1xuICAgICAgICAgICAgcGVybWFsaW5rQ3JlYXRvcixcbiAgICAgICAgICAgIGluY2x1ZGVMZWdhY3lGYWxsYmFjazogaW5jbHVkZVJlcGx5TGVnYWN5RmFsbGJhY2ssXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBjb250ZW50O1xufVxuXG4vLyBleHBvcnRlZCBmb3IgdGVzdHNcbmV4cG9ydCBmdW5jdGlvbiBpc1F1aWNrUmVhY3Rpb24obW9kZWw6IEVkaXRvck1vZGVsKTogYm9vbGVhbiB7XG4gICAgY29uc3QgcGFydHMgPSBtb2RlbC5wYXJ0cztcbiAgICBpZiAocGFydHMubGVuZ3RoID09IDApIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCB0ZXh0ID0gdGV4dFNlcmlhbGl6ZShtb2RlbCk7XG4gICAgLy8gc2hvcnRjdXQgdGFrZXMgdGhlIGZvcm0gXCIrOmVtb2ppOlwiIG9yIFwiKyA6ZW1vamk6XCJcIlxuICAgIC8vIGNhbiBiZSBpbiAxIG9yIDIgcGFydHNcbiAgICBpZiAocGFydHMubGVuZ3RoIDw9IDIpIHtcbiAgICAgICAgY29uc3QgaGFzU2hvcnRjdXQgPSB0ZXh0LnN0YXJ0c1dpdGgoXCIrXCIpIHx8IHRleHQuc3RhcnRzV2l0aChcIisgXCIpO1xuICAgICAgICBjb25zdCBlbW9qaU1hdGNoID0gdGV4dC5tYXRjaChFTU9KSV9SRUdFWCk7XG4gICAgICAgIGlmIChoYXNTaG9ydGN1dCAmJiBlbW9qaU1hdGNoICYmIGVtb2ppTWF0Y2gubGVuZ3RoID09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiBlbW9qaU1hdGNoWzBdID09PSB0ZXh0LnN1YnN0cmluZygxKSB8fFxuICAgICAgICAgICAgICAgIGVtb2ppTWF0Y2hbMF0gPT09IHRleHQuc3Vic3RyaW5nKDIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuaW50ZXJmYWNlIElTZW5kTWVzc2FnZUNvbXBvc2VyUHJvcHMgZXh0ZW5kcyBNYXRyaXhDbGllbnRQcm9wcyB7XG4gICAgcm9vbTogUm9vbTtcbiAgICBwbGFjZWhvbGRlcj86IHN0cmluZztcbiAgICBwZXJtYWxpbmtDcmVhdG9yOiBSb29tUGVybWFsaW5rQ3JlYXRvcjtcbiAgICByZWxhdGlvbj86IElFdmVudFJlbGF0aW9uO1xuICAgIHJlcGx5VG9FdmVudD86IE1hdHJpeEV2ZW50O1xuICAgIGRpc2FibGVkPzogYm9vbGVhbjtcbiAgICBvbkNoYW5nZT8obW9kZWw6IEVkaXRvck1vZGVsKTogdm9pZDtcbiAgICBpbmNsdWRlUmVwbHlMZWdhY3lGYWxsYmFjaz86IGJvb2xlYW47XG4gICAgdG9nZ2xlU3RpY2tlclBpY2tlck9wZW46ICgpID0+IHZvaWQ7XG59XG5cbmV4cG9ydCBjbGFzcyBTZW5kTWVzc2FnZUNvbXBvc2VyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElTZW5kTWVzc2FnZUNvbXBvc2VyUHJvcHM+IHtcbiAgICBzdGF0aWMgY29udGV4dFR5cGUgPSBSb29tQ29udGV4dDtcbiAgICBwdWJsaWMgY29udGV4dCE6IFJlYWN0LkNvbnRleHRUeXBlPHR5cGVvZiBSb29tQ29udGV4dD47XG5cbiAgICBwcml2YXRlIHJlYWRvbmx5IHByZXBhcmVUb0VuY3J5cHQ/OiBEZWJvdW5jZWRGdW5jPCgpID0+IHZvaWQ+O1xuICAgIHByaXZhdGUgcmVhZG9ubHkgZWRpdG9yUmVmID0gY3JlYXRlUmVmPEJhc2ljTWVzc2FnZUNvbXBvc2VyPigpO1xuICAgIHByaXZhdGUgbW9kZWw6IEVkaXRvck1vZGVsID0gbnVsbDtcbiAgICBwcml2YXRlIGN1cnJlbnRseUNvbXBvc2VkRWRpdG9yU3RhdGU6IFNlcmlhbGl6ZWRQYXJ0W10gPSBudWxsO1xuICAgIHByaXZhdGUgZGlzcGF0Y2hlclJlZjogc3RyaW5nO1xuICAgIHByaXZhdGUgc2VuZEhpc3RvcnlNYW5hZ2VyOiBTZW5kSGlzdG9yeU1hbmFnZXI7XG5cbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICBpbmNsdWRlUmVwbHlMZWdhY3lGYWxsYmFjazogdHJ1ZSxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElTZW5kTWVzc2FnZUNvbXBvc2VyUHJvcHMsIGNvbnRleHQ6IFJlYWN0LkNvbnRleHRUeXBlPHR5cGVvZiBSb29tQ29udGV4dD4pIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5teENsaWVudC5pc0NyeXB0b0VuYWJsZWQoKSAmJiB0aGlzLnByb3BzLm14Q2xpZW50LmlzUm9vbUVuY3J5cHRlZCh0aGlzLnByb3BzLnJvb20ucm9vbUlkKSkge1xuICAgICAgICAgICAgdGhpcy5wcmVwYXJlVG9FbmNyeXB0ID0gdGhyb3R0bGUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubXhDbGllbnQucHJlcGFyZVRvRW5jcnlwdCh0aGlzLnByb3BzLnJvb20pO1xuICAgICAgICAgICAgfSwgNjAwMDAsIHsgbGVhZGluZzogdHJ1ZSwgdHJhaWxpbmc6IGZhbHNlIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJiZWZvcmV1bmxvYWRcIiwgdGhpcy5zYXZlU3RvcmVkRWRpdG9yU3RhdGUpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzOiBJU2VuZE1lc3NhZ2VDb21wb3NlclByb3BzKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IHJlcGx5aW5nVG9UaHJlYWQgPSB0aGlzLnByb3BzLnJlbGF0aW9uPy5rZXkgPT09IFRIUkVBRF9SRUxBVElPTl9UWVBFLm5hbWU7XG4gICAgICAgIGNvbnN0IGRpZmZlcmVudEV2ZW50VGFyZ2V0ID0gdGhpcy5wcm9wcy5yZWxhdGlvbj8uZXZlbnRfaWQgIT09IHByZXZQcm9wcy5yZWxhdGlvbj8uZXZlbnRfaWQ7XG5cbiAgICAgICAgY29uc3QgdGhyZWFkQ2hhbmdlZCA9IHJlcGx5aW5nVG9UaHJlYWQgJiYgKGRpZmZlcmVudEV2ZW50VGFyZ2V0KTtcbiAgICAgICAgaWYgKHRocmVhZENoYW5nZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnRDcmVhdG9yID0gbmV3IENvbW1hbmRQYXJ0Q3JlYXRvcih0aGlzLnByb3BzLnJvb20sIHRoaXMucHJvcHMubXhDbGllbnQpO1xuICAgICAgICAgICAgY29uc3QgcGFydHMgPSB0aGlzLnJlc3RvcmVTdG9yZWRFZGl0b3JTdGF0ZShwYXJ0Q3JlYXRvcikgfHwgW107XG4gICAgICAgICAgICB0aGlzLm1vZGVsLnJlc2V0KHBhcnRzKTtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQ/LmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uS2V5RG93biA9IChldmVudDogS2V5Ym9hcmRFdmVudCk6IHZvaWQgPT4ge1xuICAgICAgICAvLyBpZ25vcmUgYW55IGtleXByZXNzIHdoaWxlIGRvaW5nIElNRSBjb21wb3NpdGlvbnNcbiAgICAgICAgaWYgKHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQ/LmlzQ29tcG9zaW5nKGV2ZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlcGx5aW5nVG9UaHJlYWQgPSB0aGlzLnByb3BzLnJlbGF0aW9uPy5rZXkgPT09IFRIUkVBRF9SRUxBVElPTl9UWVBFLm5hbWU7XG4gICAgICAgIGNvbnN0IGFjdGlvbiA9IGdldEtleUJpbmRpbmdzTWFuYWdlcigpLmdldE1lc3NhZ2VDb21wb3NlckFjdGlvbihldmVudCk7XG4gICAgICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uU2VuZE1lc3NhZ2U6XG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kTWVzc2FnZSgpO1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uU2VsZWN0UHJldlNlbmRIaXN0b3J5OlxuICAgICAgICAgICAgY2FzZSBLZXlCaW5kaW5nQWN0aW9uLlNlbGVjdE5leHRTZW5kSGlzdG9yeToge1xuICAgICAgICAgICAgICAgIC8vIFRyeSBzZWxlY3QgY29tcG9zZXIgaGlzdG9yeVxuICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkID0gdGhpcy5zZWxlY3RTZW5kSGlzdG9yeShhY3Rpb24gPT09IEtleUJpbmRpbmdBY3Rpb24uU2VsZWN0UHJldlNlbmRIaXN0b3J5KTtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gV2UncmUgc2VsZWN0aW5nIGhpc3RvcnksIHNvIHByZXZlbnQgdGhlIGtleSBldmVudCBmcm9tIGRvaW5nIGFueXRoaW5nIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uU2hvd1N0aWNrZXJQaWNrZXI6IHtcbiAgICAgICAgICAgICAgICBpZiAoIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJNZXNzYWdlQ29tcG9zZXJJbnB1dC5zaG93U3RpY2tlcnNCdXR0b25cIikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuOyAvLyBEbyBub3RoaW5nIGlmIHRoZXJlIGlzIG5vIFN0aWNrZXJzIGJ1dHRvblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnRvZ2dsZVN0aWNrZXJQaWNrZXJPcGVuKCk7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5FZGl0UHJldk1lc3NhZ2U6XG4gICAgICAgICAgICAgICAgLy8gc2VsZWN0aW9uIG11c3QgYmUgY29sbGFwc2VkIGFuZCBjYXJldCBhdCBzdGFydFxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmVkaXRvclJlZi5jdXJyZW50Py5pc1NlbGVjdGlvbkNvbGxhcHNlZCgpICYmIHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQ/LmlzQ2FyZXRBdFN0YXJ0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZXZlbnRzID1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dC5saXZlVGltZWxpbmUuZ2V0RXZlbnRzKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY29uY2F0KHJlcGx5aW5nVG9UaHJlYWQgPyBbXSA6IHRoaXMucHJvcHMucm9vbS5nZXRQZW5kaW5nRXZlbnRzKCkpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBlZGl0RXZlbnQgPSBmaW5kRWRpdGFibGVFdmVudCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBpc0ZvcndhcmQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVkaXRFdmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2UncmUgc2VsZWN0aW5nIGhpc3RvcnksIHNvIHByZXZlbnQgdGhlIGtleSBldmVudCBmcm9tIGRvaW5nIGFueXRoaW5nIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLkVkaXRFdmVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudDogZWRpdEV2ZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVsaW5lUmVuZGVyaW5nVHlwZTogdGhpcy5jb250ZXh0LnRpbWVsaW5lUmVuZGVyaW5nVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBLZXlCaW5kaW5nQWN0aW9uLkNhbmNlbFJlcGx5T3JFZGl0OlxuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3JlcGx5X3RvX2V2ZW50JyxcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMuY29udGV4dC50aW1lbGluZVJlbmRlcmluZ1R5cGUsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnByZXBhcmVUb0VuY3J5cHQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBuZWVkcyB0byBiZSBsYXN0IVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByZXBhcmVUb0VuY3J5cHQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gd2Uga2VlcCBzZW50IG1lc3NhZ2VzL2NvbW1hbmRzIGluIGEgc2VwYXJhdGUgaGlzdG9yeSAoc2VwYXJhdGUgZnJvbSB1bmRvIGhpc3RvcnkpXG4gICAgLy8gc28geW91IGNhbiBhbHQrdXAvZG93biBpbiB0aGVtXG4gICAgcHJpdmF0ZSBzZWxlY3RTZW5kSGlzdG9yeSh1cDogYm9vbGVhbik6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBkZWx0YSA9IHVwID8gLTEgOiAxO1xuICAgICAgICAvLyBUcnVlIGlmIHdlIGFyZSBub3QgY3VycmVudGx5IHNlbGVjdGluZyBoaXN0b3J5LCBidXQgY29tcG9zaW5nIGEgbWVzc2FnZVxuICAgICAgICBpZiAodGhpcy5zZW5kSGlzdG9yeU1hbmFnZXIuY3VycmVudEluZGV4ID09PSB0aGlzLnNlbmRIaXN0b3J5TWFuYWdlci5oaXN0b3J5Lmxlbmd0aCkge1xuICAgICAgICAgICAgLy8gV2UgY2FuJ3QgZ28gYW55IGZ1cnRoZXIgLSB0aGVyZSBpc24ndCBhbnkgbW9yZSBoaXN0b3J5LCBzbyBub3AuXG4gICAgICAgICAgICBpZiAoIXVwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdXJyZW50bHlDb21wb3NlZEVkaXRvclN0YXRlID0gdGhpcy5tb2RlbC5zZXJpYWxpemVQYXJ0cygpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc2VuZEhpc3RvcnlNYW5hZ2VyLmN1cnJlbnRJbmRleCArIGRlbHRhID09PSB0aGlzLnNlbmRIaXN0b3J5TWFuYWdlci5oaXN0b3J5Lmxlbmd0aCkge1xuICAgICAgICAgICAgLy8gVHJ1ZSB3aGVuIHdlIHJldHVybiB0byB0aGUgbWVzc2FnZSBiZWluZyBjb21wb3NlZCBjdXJyZW50bHlcbiAgICAgICAgICAgIHRoaXMubW9kZWwucmVzZXQodGhpcy5jdXJyZW50bHlDb21wb3NlZEVkaXRvclN0YXRlKTtcbiAgICAgICAgICAgIHRoaXMuc2VuZEhpc3RvcnlNYW5hZ2VyLmN1cnJlbnRJbmRleCA9IHRoaXMuc2VuZEhpc3RvcnlNYW5hZ2VyLmhpc3RvcnkubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgeyBwYXJ0cywgcmVwbHlFdmVudElkIH0gPSB0aGlzLnNlbmRIaXN0b3J5TWFuYWdlci5nZXRJdGVtKGRlbHRhKTtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogJ3JlcGx5X3RvX2V2ZW50JyxcbiAgICAgICAgICAgIGV2ZW50OiByZXBseUV2ZW50SWQgPyB0aGlzLnByb3BzLnJvb20uZmluZEV2ZW50QnlJZChyZXBseUV2ZW50SWQpIDogbnVsbCxcbiAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMuY29udGV4dC50aW1lbGluZVJlbmRlcmluZ1R5cGUsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAocGFydHMpIHtcbiAgICAgICAgICAgIHRoaXMubW9kZWwucmVzZXQocGFydHMpO1xuICAgICAgICAgICAgdGhpcy5lZGl0b3JSZWYuY3VycmVudD8uZm9jdXMoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNlbmRRdWlja1JlYWN0aW9uKCk6IHZvaWQge1xuICAgICAgICBjb25zdCB0aW1lbGluZSA9IHRoaXMuY29udGV4dC5saXZlVGltZWxpbmU7XG4gICAgICAgIGNvbnN0IGV2ZW50cyA9IHRpbWVsaW5lLmdldEV2ZW50cygpO1xuICAgICAgICBjb25zdCByZWFjdGlvbiA9IHRoaXMubW9kZWwucGFydHNbMV0udGV4dDtcbiAgICAgICAgZm9yIChsZXQgaSA9IGV2ZW50cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgaWYgKGV2ZW50c1tpXS5nZXRUeXBlKCkgPT09IEV2ZW50VHlwZS5Sb29tTWVzc2FnZSkge1xuICAgICAgICAgICAgICAgIGxldCBzaG91bGRSZWFjdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29uc3QgbGFzdE1lc3NhZ2UgPSBldmVudHNbaV07XG4gICAgICAgICAgICAgICAgY29uc3QgdXNlcklkID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2VSZWFjdGlvbnMgPSB0aGlzLnByb3BzLnJvb20ucmVsYXRpb25zXG4gICAgICAgICAgICAgICAgICAgIC5nZXRDaGlsZEV2ZW50c0ZvckV2ZW50KGxhc3RNZXNzYWdlLmdldElkKCksIFJlbGF0aW9uVHlwZS5Bbm5vdGF0aW9uLCBFdmVudFR5cGUuUmVhY3Rpb24pO1xuXG4gICAgICAgICAgICAgICAgLy8gaWYgd2UgaGF2ZSBhbHJlYWR5IHNlbnQgdGhpcyByZWFjdGlvbiwgZG9uJ3QgcmVkYWN0IGJ1dCBkb24ndCByZS1zZW5kXG4gICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2VSZWFjdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbXlSZWFjdGlvbkV2ZW50cyA9IG1lc3NhZ2VSZWFjdGlvbnMuZ2V0QW5ub3RhdGlvbnNCeVNlbmRlcigpW3VzZXJJZF0gfHwgW107XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG15UmVhY3Rpb25LZXlzID0gWy4uLm15UmVhY3Rpb25FdmVudHNdXG4gICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKGV2ZW50ID0+ICFldmVudC5pc1JlZGFjdGVkKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAubWFwKGV2ZW50ID0+IGV2ZW50LmdldFJlbGF0aW9uKCkua2V5KTtcbiAgICAgICAgICAgICAgICAgICAgc2hvdWxkUmVhY3QgPSAhbXlSZWFjdGlvbktleXMuaW5jbHVkZXMocmVhY3Rpb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc2hvdWxkUmVhY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLnNlbmRFdmVudChsYXN0TWVzc2FnZS5nZXRSb29tSWQoKSwgRXZlbnRUeXBlLlJlYWN0aW9uLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIm0ucmVsYXRlc190b1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWxfdHlwZVwiOiBSZWxhdGlvblR5cGUuQW5ub3RhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImV2ZW50X2lkXCI6IGxhc3RNZXNzYWdlLmdldElkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrZXlcIjogcmVhY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiBcIm1lc3NhZ2Vfc2VudFwiIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBzZW5kTWVzc2FnZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3QgbW9kZWwgPSB0aGlzLm1vZGVsO1xuXG4gICAgICAgIGlmIChtb2RlbC5pc0VtcHR5KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwb3N0aG9nRXZlbnQ6IENvbXBvc2VyRXZlbnQgPSB7XG4gICAgICAgICAgICBldmVudE5hbWU6IFwiQ29tcG9zZXJcIixcbiAgICAgICAgICAgIGlzRWRpdGluZzogZmFsc2UsXG4gICAgICAgICAgICBpc1JlcGx5OiAhIXRoaXMucHJvcHMucmVwbHlUb0V2ZW50LFxuICAgICAgICAgICAgaW5UaHJlYWQ6IHRoaXMucHJvcHMucmVsYXRpb24/LnJlbF90eXBlID09PSBUSFJFQURfUkVMQVRJT05fVFlQRS5uYW1lLFxuICAgICAgICB9O1xuICAgICAgICBpZiAocG9zdGhvZ0V2ZW50LmluVGhyZWFkKSB7XG4gICAgICAgICAgICBjb25zdCB0aHJlYWRSb290ID0gdGhpcy5wcm9wcy5yb29tLmZpbmRFdmVudEJ5SWQodGhpcy5wcm9wcy5yZWxhdGlvbi5ldmVudF9pZCk7XG4gICAgICAgICAgICBwb3N0aG9nRXZlbnQuc3RhcnRzVGhyZWFkID0gdGhyZWFkUm9vdD8uZ2V0VGhyZWFkKCk/LmV2ZW50cy5sZW5ndGggPT09IDE7XG4gICAgICAgIH1cbiAgICAgICAgUG9zdGhvZ0FuYWx5dGljcy5pbnN0YW5jZS50cmFja0V2ZW50PENvbXBvc2VyRXZlbnQ+KHBvc3Rob2dFdmVudCk7XG5cbiAgICAgICAgLy8gUmVwbGFjZSBlbW90aWNvbiBhdCB0aGUgZW5kIG9mIHRoZSBtZXNzYWdlXG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKCdNZXNzYWdlQ29tcG9zZXJJbnB1dC5hdXRvUmVwbGFjZUVtb2ppJykpIHtcbiAgICAgICAgICAgIGNvbnN0IGluZGV4T2ZMYXN0UGFydCA9IG1vZGVsLnBhcnRzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbkluTGFzdFBhcnQgPSBtb2RlbC5wYXJ0c1tpbmRleE9mTGFzdFBhcnRdLnRleHQubGVuZ3RoO1xuICAgICAgICAgICAgdGhpcy5lZGl0b3JSZWYuY3VycmVudD8ucmVwbGFjZUVtb3RpY29uKFxuICAgICAgICAgICAgICAgIG5ldyBEb2N1bWVudFBvc2l0aW9uKGluZGV4T2ZMYXN0UGFydCwgcG9zaXRpb25Jbkxhc3RQYXJ0KSxcbiAgICAgICAgICAgICAgICBSRUdFWF9FTU9USUNPTixcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXBseVRvRXZlbnQgPSB0aGlzLnByb3BzLnJlcGx5VG9FdmVudDtcbiAgICAgICAgbGV0IHNob3VsZFNlbmQgPSB0cnVlO1xuICAgICAgICBsZXQgY29udGVudDogSUNvbnRlbnQ7XG5cbiAgICAgICAgaWYgKCFjb250YWluc0Vtb3RlKG1vZGVsKSAmJiBpc1NsYXNoQ29tbWFuZCh0aGlzLm1vZGVsKSkge1xuICAgICAgICAgICAgY29uc3QgW2NtZCwgYXJncywgY29tbWFuZFRleHRdID0gZ2V0U2xhc2hDb21tYW5kKHRoaXMubW9kZWwpO1xuICAgICAgICAgICAgaWYgKGNtZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRocmVhZElkID0gdGhpcy5wcm9wcy5yZWxhdGlvbj8ucmVsX3R5cGUgPT09IFRIUkVBRF9SRUxBVElPTl9UWVBFLm5hbWVcbiAgICAgICAgICAgICAgICAgICAgPyB0aGlzLnByb3BzLnJlbGF0aW9uPy5ldmVudF9pZFxuICAgICAgICAgICAgICAgICAgICA6IG51bGw7XG5cbiAgICAgICAgICAgICAgICBsZXQgY29tbWFuZFN1Y2Nlc3NmdWw6IGJvb2xlYW47XG4gICAgICAgICAgICAgICAgW2NvbnRlbnQsIGNvbW1hbmRTdWNjZXNzZnVsXSA9IGF3YWl0IHJ1blNsYXNoQ29tbWFuZChjbWQsIGFyZ3MsIHRoaXMucHJvcHMucm9vbS5yb29tSWQsIHRocmVhZElkKTtcbiAgICAgICAgICAgICAgICBpZiAoIWNvbW1hbmRTdWNjZXNzZnVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjsgLy8gZXJyb3JlZFxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChjbWQuY2F0ZWdvcnkgPT09IENvbW1hbmRDYXRlZ29yaWVzLm1lc3NhZ2VzIHx8IGNtZC5jYXRlZ29yeSA9PT0gQ29tbWFuZENhdGVnb3JpZXMuZWZmZWN0cykge1xuICAgICAgICAgICAgICAgICAgICBhdHRhY2hSZWxhdGlvbihjb250ZW50LCB0aGlzLnByb3BzLnJlbGF0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlcGx5VG9FdmVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWRkUmVwbHlUb01lc3NhZ2VDb250ZW50KGNvbnRlbnQsIHJlcGx5VG9FdmVudCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlcm1hbGlua0NyZWF0b3I6IHRoaXMucHJvcHMucGVybWFsaW5rQ3JlYXRvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBFeGNsdWRlIHRoZSBsZWdhY3kgZmFsbGJhY2sgZm9yIGN1c3RvbSBldmVudCB0eXBlcyBzdWNoIGFzIHRob3NlIHVzZWQgYnkgL2ZpcmV3b3Jrc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluY2x1ZGVMZWdhY3lGYWxsYmFjazogY29udGVudC5tc2d0eXBlPy5zdGFydHNXaXRoKFwibS5cIikgPz8gdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2hvdWxkU2VuZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWF3YWl0IHNob3VsZFNlbmRBbnl3YXkoY29tbWFuZFRleHQpKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgIXNlbmRBbnl3YXkgYmFpbCB0byBsZXQgdGhlIHVzZXIgZWRpdCB0aGUgY29tcG9zZXIgYW5kIHRyeSBhZ2FpblxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc1F1aWNrUmVhY3Rpb24obW9kZWwpKSB7XG4gICAgICAgICAgICBzaG91bGRTZW5kID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnNlbmRRdWlja1JlYWN0aW9uKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2hvdWxkU2VuZCkge1xuICAgICAgICAgICAgY29uc3QgeyByb29tSWQgfSA9IHRoaXMucHJvcHMucm9vbTtcbiAgICAgICAgICAgIGlmICghY29udGVudCkge1xuICAgICAgICAgICAgICAgIGNvbnRlbnQgPSBjcmVhdGVNZXNzYWdlQ29udGVudChcbiAgICAgICAgICAgICAgICAgICAgbW9kZWwsXG4gICAgICAgICAgICAgICAgICAgIHJlcGx5VG9FdmVudCxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5yZWxhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5wZXJtYWxpbmtDcmVhdG9yLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmluY2x1ZGVSZXBseUxlZ2FjeUZhbGxiYWNrLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBkb24ndCBib3RoZXIgc2VuZGluZyBhbiBlbXB0eSBtZXNzYWdlXG4gICAgICAgICAgICBpZiAoIWNvbnRlbnQuYm9keS50cmltKCkpIHJldHVybjtcblxuICAgICAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJQZXJmb3JtYW5jZS5hZGRTZW5kTWVzc2FnZVRpbWluZ01ldGFkYXRhXCIpKSB7XG4gICAgICAgICAgICAgICAgZGVjb3JhdGVTdGFydFNlbmRpbmdUaW1lKGNvbnRlbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCB0aHJlYWRJZCA9IHRoaXMucHJvcHMucmVsYXRpb24/LnJlbF90eXBlID09PSBUSFJFQURfUkVMQVRJT05fVFlQRS5uYW1lXG4gICAgICAgICAgICAgICAgPyB0aGlzLnByb3BzLnJlbGF0aW9uLmV2ZW50X2lkXG4gICAgICAgICAgICAgICAgOiBudWxsO1xuXG4gICAgICAgICAgICBjb25zdCBwcm9tID0gZG9NYXliZUxvY2FsUm9vbUFjdGlvbihcbiAgICAgICAgICAgICAgICByb29tSWQsXG4gICAgICAgICAgICAgICAgKGFjdHVhbFJvb21JZDogc3RyaW5nKSA9PiB0aGlzLnByb3BzLm14Q2xpZW50LnNlbmRNZXNzYWdlKGFjdHVhbFJvb21JZCwgdGhyZWFkSWQsIGNvbnRlbnQpLFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubXhDbGllbnQsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKHJlcGx5VG9FdmVudCkge1xuICAgICAgICAgICAgICAgIC8vIENsZWFyIHJlcGx5X3RvX2V2ZW50IGFzIHdlIHB1dCB0aGUgbWVzc2FnZSBpbnRvIHRoZSBxdWV1ZVxuICAgICAgICAgICAgICAgIC8vIGlmIHRoZSBzZW5kIGZhaWxzLCByZXRyeSB3aWxsIGhhbmRsZSByZXNlbmRpbmcuXG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAncmVwbHlfdG9fZXZlbnQnLFxuICAgICAgICAgICAgICAgICAgICBldmVudDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dDogdGhpcy5jb250ZXh0LnRpbWVsaW5lUmVuZGVyaW5nVHlwZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7IGFjdGlvbjogXCJtZXNzYWdlX3NlbnRcIiB9KTtcbiAgICAgICAgICAgIENIQVRfRUZGRUNUUy5mb3JFYWNoKChlZmZlY3QpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoY29udGFpbnNFbW9qaShjb250ZW50LCBlZmZlY3QuZW1vamlzKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBGb3IgaW5pdGlhbCB0aHJlYWRzIGxhdW5jaCwgY2hhdCBlZmZlY3RzIGFyZSBkaXNhYmxlZFxuICAgICAgICAgICAgICAgICAgICAvLyBzZWUgIzE5NzMxXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGlzTm90VGhyZWFkID0gdGhpcy5wcm9wcy5yZWxhdGlvbj8ucmVsX3R5cGUgIT09IFRIUkVBRF9SRUxBVElPTl9UWVBFLm5hbWU7XG4gICAgICAgICAgICAgICAgICAgIGlmICghU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImZlYXR1cmVfdGhyZWFkXCIpIHx8IGlzTm90VGhyZWFkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goeyBhY3Rpb246IGBlZmZlY3RzLiR7ZWZmZWN0LmNvbW1hbmR9YCB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJQZXJmb3JtYW5jZS5hZGRTZW5kTWVzc2FnZVRpbWluZ01ldGFkYXRhXCIpKSB7XG4gICAgICAgICAgICAgICAgcHJvbS50aGVuKHJlc3AgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzZW5kUm91bmRUcmlwTWV0cmljKHRoaXMucHJvcHMubXhDbGllbnQsIHJvb21JZCwgcmVzcC5ldmVudF9pZCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNlbmRIaXN0b3J5TWFuYWdlci5zYXZlKG1vZGVsLCByZXBseVRvRXZlbnQpO1xuICAgICAgICAvLyBjbGVhciBjb21wb3NlclxuICAgICAgICBtb2RlbC5yZXNldChbXSk7XG4gICAgICAgIHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQ/LmNsZWFyVW5kb0hpc3RvcnkoKTtcbiAgICAgICAgdGhpcy5lZGl0b3JSZWYuY3VycmVudD8uZm9jdXMoKTtcbiAgICAgICAgdGhpcy5jbGVhclN0b3JlZEVkaXRvclN0YXRlKCk7XG4gICAgICAgIGlmIChzaG91bGRTZW5kICYmIFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJzY3JvbGxUb0JvdHRvbU9uTWVzc2FnZVNlbnRcIikpIHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiBcInNjcm9sbF90b19ib3R0b21cIixcbiAgICAgICAgICAgICAgICB0aW1lbGluZVJlbmRlcmluZ1R5cGU6IHRoaXMuY29udGV4dC50aW1lbGluZVJlbmRlcmluZ1R5cGUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBkaXMudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoZXJSZWYpO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImJlZm9yZXVubG9hZFwiLCB0aGlzLnNhdmVTdG9yZWRFZGl0b3JTdGF0ZSk7XG4gICAgICAgIHRoaXMuc2F2ZVN0b3JlZEVkaXRvclN0YXRlKCk7XG4gICAgfVxuXG4gICAgLy8gVE9ETzogW1JFQUNULVdBUk5JTkddIE1vdmUgdGhpcyB0byBjb25zdHJ1Y3RvclxuICAgIFVOU0FGRV9jb21wb25lbnRXaWxsTW91bnQoKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgICAgY29uc3QgcGFydENyZWF0b3IgPSBuZXcgQ29tbWFuZFBhcnRDcmVhdG9yKHRoaXMucHJvcHMucm9vbSwgdGhpcy5wcm9wcy5teENsaWVudCk7XG4gICAgICAgIGNvbnN0IHBhcnRzID0gdGhpcy5yZXN0b3JlU3RvcmVkRWRpdG9yU3RhdGUocGFydENyZWF0b3IpIHx8IFtdO1xuICAgICAgICB0aGlzLm1vZGVsID0gbmV3IEVkaXRvck1vZGVsKHBhcnRzLCBwYXJ0Q3JlYXRvcik7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlclJlZiA9IGRpcy5yZWdpc3Rlcih0aGlzLm9uQWN0aW9uKTtcbiAgICAgICAgdGhpcy5zZW5kSGlzdG9yeU1hbmFnZXIgPSBuZXcgU2VuZEhpc3RvcnlNYW5hZ2VyKHRoaXMucHJvcHMucm9vbS5yb29tSWQsICdteF9jaWRlcl9oaXN0b3J5XycpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0IGVkaXRvclN0YXRlS2V5KCkge1xuICAgICAgICBsZXQga2V5ID0gYG14X2NpZGVyX3N0YXRlXyR7dGhpcy5wcm9wcy5yb29tLnJvb21JZH1gO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5yZWxhdGlvbj8ucmVsX3R5cGUgPT09IFRIUkVBRF9SRUxBVElPTl9UWVBFLm5hbWUpIHtcbiAgICAgICAgICAgIGtleSArPSBgXyR7dGhpcy5wcm9wcy5yZWxhdGlvbi5ldmVudF9pZH1gO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBrZXk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjbGVhclN0b3JlZEVkaXRvclN0YXRlKCk6IHZvaWQge1xuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSh0aGlzLmVkaXRvclN0YXRlS2V5KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlc3RvcmVTdG9yZWRFZGl0b3JTdGF0ZShwYXJ0Q3JlYXRvcjogUGFydENyZWF0b3IpOiBQYXJ0W10ge1xuICAgICAgICBjb25zdCByZXBseWluZ1RvVGhyZWFkID0gdGhpcy5wcm9wcy5yZWxhdGlvbj8ua2V5ID09PSBUSFJFQURfUkVMQVRJT05fVFlQRS5uYW1lO1xuICAgICAgICBpZiAocmVwbHlpbmdUb1RocmVhZCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBqc29uID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5lZGl0b3JTdGF0ZUtleSk7XG4gICAgICAgIGlmIChqc29uKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgcGFydHM6IHNlcmlhbGl6ZWRQYXJ0cywgcmVwbHlFdmVudElkIH0gPSBKU09OLnBhcnNlKGpzb24pO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnRzOiBQYXJ0W10gPSBzZXJpYWxpemVkUGFydHMubWFwKHAgPT4gcGFydENyZWF0b3IuZGVzZXJpYWxpemVQYXJ0KHApKTtcbiAgICAgICAgICAgICAgICBpZiAocmVwbHlFdmVudElkKSB7XG4gICAgICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdyZXBseV90b19ldmVudCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudDogdGhpcy5wcm9wcy5yb29tLmZpbmRFdmVudEJ5SWQocmVwbHlFdmVudElkKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IHRoaXMuY29udGV4dC50aW1lbGluZVJlbmRlcmluZ1R5cGUsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcGFydHM7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gc2hvdWxkIHNhdmUgc3RhdGUgd2hlbiBlZGl0b3IgaGFzIGNvbnRlbnRzIG9yIHJlcGx5IGlzIG9wZW5cbiAgICBwcml2YXRlIHNob3VsZFNhdmVTdG9yZWRFZGl0b3JTdGF0ZSA9ICgpOiBib29sZWFuID0+IHtcbiAgICAgICAgcmV0dXJuICF0aGlzLm1vZGVsLmlzRW1wdHkgfHwgISF0aGlzLnByb3BzLnJlcGx5VG9FdmVudDtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBzYXZlU3RvcmVkRWRpdG9yU3RhdGUgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGlmICh0aGlzLnNob3VsZFNhdmVTdG9yZWRFZGl0b3JTdGF0ZSgpKSB7XG4gICAgICAgICAgICBjb25zdCBpdGVtID0gU2VuZEhpc3RvcnlNYW5hZ2VyLmNyZWF0ZUl0ZW0odGhpcy5tb2RlbCwgdGhpcy5wcm9wcy5yZXBseVRvRXZlbnQpO1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5lZGl0b3JTdGF0ZUtleSwgSlNPTi5zdHJpbmdpZnkoaXRlbSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jbGVhclN0b3JlZEVkaXRvclN0YXRlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkFjdGlvbiA9IChwYXlsb2FkOiBBY3Rpb25QYXlsb2FkKTogdm9pZCA9PiB7XG4gICAgICAgIC8vIGRvbid0IGxldCB0aGUgdXNlciBpbnRvIHRoZSBjb21wb3NlciBpZiBpdCBpcyBkaXNhYmxlZCAtIGFsbCBvZiB0aGVzZSBicmFuY2hlcyBsZWFkXG4gICAgICAgIC8vIHRvIHRoZSBjdXJzb3IgYmVpbmcgaW4gdGhlIGNvbXBvc2VyXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmRpc2FibGVkKSByZXR1cm47XG5cbiAgICAgICAgc3dpdGNoIChwYXlsb2FkLmFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSAncmVwbHlfdG9fZXZlbnQnOlxuICAgICAgICAgICAgY2FzZSBBY3Rpb24uRm9jdXNTZW5kTWVzc2FnZUNvbXBvc2VyOlxuICAgICAgICAgICAgICAgIGlmICgocGF5bG9hZC5jb250ZXh0ID8/IFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5Sb29tKSA9PT0gdGhpcy5jb250ZXh0LnRpbWVsaW5lUmVuZGVyaW5nVHlwZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVkaXRvclJlZi5jdXJyZW50Py5mb2N1cygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLkNvbXBvc2VySW5zZXJ0OlxuICAgICAgICAgICAgICAgIGlmIChwYXlsb2FkLnRpbWVsaW5lUmVuZGVyaW5nVHlwZSAhPT0gdGhpcy5jb250ZXh0LnRpbWVsaW5lUmVuZGVyaW5nVHlwZSkgYnJlYWs7XG4gICAgICAgICAgICAgICAgaWYgKHBheWxvYWQuY29tcG9zZXJUeXBlICE9PSBDb21wb3NlclR5cGUuU2VuZCkgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICBpZiAocGF5bG9hZC51c2VySWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lZGl0b3JSZWYuY3VycmVudD8uaW5zZXJ0TWVudGlvbihwYXlsb2FkLnVzZXJJZCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXlsb2FkLmV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQ/Lmluc2VydFF1b3RlZE1lc3NhZ2UocGF5bG9hZC5ldmVudCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXlsb2FkLnRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lZGl0b3JSZWYuY3VycmVudD8uaW5zZXJ0UGxhaW50ZXh0KHBheWxvYWQudGV4dCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25QYXN0ZSA9IChldmVudDogQ2xpcGJvYXJkRXZlbnQ8SFRNTERpdkVsZW1lbnQ+KTogYm9vbGVhbiA9PiB7XG4gICAgICAgIGNvbnN0IHsgY2xpcGJvYXJkRGF0YSB9ID0gZXZlbnQ7XG4gICAgICAgIC8vIFByaW9yaXRpemUgdGV4dCBvbiB0aGUgY2xpcGJvYXJkIG92ZXIgZmlsZXMgaWYgUlRGIGlzIHByZXNlbnQgYXMgT2ZmaWNlIG9uIG1hY09TIHB1dHMgYSBiaXRtYXBcbiAgICAgICAgLy8gaW4gdGhlIGNsaXBib2FyZCBhcyB3ZWxsIGFzIHRoZSBjb250ZW50IGJlaW5nIGNvcGllZC4gTW9kZXJuIHZlcnNpb25zIG9mIE9mZmljZSBzZWVtIHRvIG5vdCBkbyB0aGlzIGFueW1vcmUuXG4gICAgICAgIC8vIFdlIGNoZWNrIHRleHQvcnRmIGluc3RlYWQgb2YgdGV4dC9wbGFpbiBhcyB3aGVuIGNvcHkrcGFzdGluZyBhIGZpbGUgZnJvbSBGaW5kZXIgb3IgR25vbWUgSW1hZ2UgVmlld2VyXG4gICAgICAgIC8vIGl0IHB1dHMgdGhlIGZpbGVuYW1lIGluIGFzIHRleHQvcGxhaW4gd2hpY2ggd2Ugd2FudCB0byBpZ25vcmUuXG4gICAgICAgIGlmIChjbGlwYm9hcmREYXRhLmZpbGVzLmxlbmd0aCAmJiAhY2xpcGJvYXJkRGF0YS50eXBlcy5pbmNsdWRlcyhcInRleHQvcnRmXCIpKSB7XG4gICAgICAgICAgICBDb250ZW50TWVzc2FnZXMuc2hhcmVkSW5zdGFuY2UoKS5zZW5kQ29udGVudExpc3RUb1Jvb20oXG4gICAgICAgICAgICAgICAgQXJyYXkuZnJvbShjbGlwYm9hcmREYXRhLmZpbGVzKSxcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnJvb20ucm9vbUlkLFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMucmVsYXRpb24sXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5teENsaWVudCxcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRleHQudGltZWxpbmVSZW5kZXJpbmdUeXBlLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlOyAvLyB0byBza2lwIGludGVybmFsIG9uUGFzdGUgaGFuZGxlclxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25DaGFuZ2UgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlKSB0aGlzLnByb3BzLm9uQ2hhbmdlKHRoaXMubW9kZWwpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGZvY3VzQ29tcG9zZXIgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQ/LmZvY3VzKCk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgdGhyZWFkSWQgPSB0aGlzLnByb3BzLnJlbGF0aW9uPy5yZWxfdHlwZSA9PT0gVEhSRUFEX1JFTEFUSU9OX1RZUEUubmFtZVxuICAgICAgICAgICAgPyB0aGlzLnByb3BzLnJlbGF0aW9uLmV2ZW50X2lkXG4gICAgICAgICAgICA6IG51bGw7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NlbmRNZXNzYWdlQ29tcG9zZXJcIiBvbkNsaWNrPXt0aGlzLmZvY3VzQ29tcG9zZXJ9IG9uS2V5RG93bj17dGhpcy5vbktleURvd259PlxuICAgICAgICAgICAgICAgIDxCYXNpY01lc3NhZ2VDb21wb3NlclxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLmVkaXRvclJlZn1cbiAgICAgICAgICAgICAgICAgICAgbW9kZWw9e3RoaXMubW9kZWx9XG4gICAgICAgICAgICAgICAgICAgIHJvb209e3RoaXMucHJvcHMucm9vbX1cbiAgICAgICAgICAgICAgICAgICAgdGhyZWFkSWQ9e3RocmVhZElkfVxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17dGhpcy5wcm9wcy5wbGFjZWhvbGRlcn1cbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e3RoaXMucHJvcHMucGxhY2Vob2xkZXJ9XG4gICAgICAgICAgICAgICAgICAgIG9uUGFzdGU9e3RoaXMub25QYXN0ZX1cbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMucHJvcHMuZGlzYWJsZWR9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cblxuY29uc3QgU2VuZE1lc3NhZ2VDb21wb3NlcldpdGhNYXRyaXhDbGllbnQgPSB3aXRoTWF0cml4Q2xpZW50SE9DKFNlbmRNZXNzYWdlQ29tcG9zZXIpO1xuZXhwb3J0IGRlZmF1bHQgU2VuZE1lc3NhZ2VDb21wb3NlcldpdGhNYXRyaXhDbGllbnQ7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFHQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFTQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7OztBQUVBO0FBQ08sU0FBU0EsY0FBVCxDQUF3QkMsT0FBeEIsRUFB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