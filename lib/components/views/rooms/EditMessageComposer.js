"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _event = require("matrix-js-sdk/src/models/event");

var _event2 = require("matrix-js-sdk/src/@types/event");

var _logger = require("matrix-js-sdk/src/logger");

var _languageHandler = require("../../../languageHandler");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _model = _interopRequireDefault(require("../../../editor/model"));

var _dom = require("../../../editor/dom");

var _serialize = require("../../../editor/serialize");

var _EventUtils = require("../../../utils/EventUtils");

var _deserialize = require("../../../editor/deserialize");

var _parts = require("../../../editor/parts");

var _BasicMessageComposer = _interopRequireWildcard(require("./BasicMessageComposer"));

var _SlashCommands = require("../../../SlashCommands");

var _actions = require("../../../dispatcher/actions");

var _KeyBindingsManager = require("../../../KeyBindingsManager");

var _SendHistoryManager = _interopRequireDefault(require("../../../SendHistoryManager"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _ConfirmRedactDialog = require("../dialogs/ConfirmRedactDialog");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _MatrixClientContext = require("../../../contexts/MatrixClientContext");

var _RoomContext = _interopRequireDefault(require("../../../contexts/RoomContext"));

var _ComposerInsertPayload = require("../../../dispatcher/payloads/ComposerInsertPayload");

var _commands = require("../../../editor/commands");

var _KeyboardShortcuts = require("../../../accessibility/KeyboardShortcuts");

var _PosthogAnalytics = require("../../../PosthogAnalytics");

var _Editing = require("../../../Editing");

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
function getHtmlReplyFallback(mxEvent) {
  const html = mxEvent.getContent().formatted_body;

  if (!html) {
    return "";
  }

  const rootNode = new DOMParser().parseFromString(html, "text/html").body;
  const mxReply = rootNode.querySelector("mx-reply");
  return mxReply && mxReply.outerHTML || "";
}

function getTextReplyFallback(mxEvent) {
  const body = mxEvent.getContent().body;
  const lines = body.split("\n").map(l => l.trim());

  if (lines.length > 2 && lines[0].startsWith("> ") && lines[1].length === 0) {
    return `${lines[0]}\n\n`;
  }

  return "";
}

function createEditContent(model, editedEvent) {
  const isEmote = (0, _serialize.containsEmote)(model);

  if (isEmote) {
    model = (0, _serialize.stripEmoteCommand)(model);
  }

  const isReply = !!editedEvent.replyEventId;
  let plainPrefix = "";
  let htmlPrefix = "";

  if (isReply) {
    plainPrefix = getTextReplyFallback(editedEvent);
    htmlPrefix = getHtmlReplyFallback(editedEvent);
  }

  const body = (0, _serialize.textSerialize)(model);
  const newContent = {
    "msgtype": isEmote ? _event2.MsgType.Emote : _event2.MsgType.Text,
    "body": body
  };
  const contentBody = {
    msgtype: newContent.msgtype,
    body: `${plainPrefix} * ${body}`
  };
  const formattedBody = (0, _serialize.htmlSerializeIfNeeded)(model, {
    forceHTML: isReply,
    useMarkdown: _SettingsStore.default.getValue("MessageComposerInput.useMarkdown")
  });

  if (formattedBody) {
    newContent.format = "org.matrix.custom.html";
    newContent.formatted_body = formattedBody;
    contentBody.format = newContent.format;
    contentBody.formatted_body = `${htmlPrefix} * ${formattedBody}`;
  }

  const relation = {
    "m.new_content": newContent,
    "m.relates_to": {
      "rel_type": "m.replace",
      "event_id": editedEvent.getId()
    }
  };
  return Object.assign(relation, contentBody);
}

class EditMessageComposer extends _react.default.Component {
  constructor(props, context) {
    super(props);
    (0, _defineProperty2.default)(this, "context", void 0);
    (0, _defineProperty2.default)(this, "editorRef", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "model", null);
    (0, _defineProperty2.default)(this, "onKeyDown", event => {
      // ignore any keypress while doing IME compositions
      if (this.editorRef.current?.isComposing(event)) {
        return;
      }

      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getMessageComposerAction(event);

      switch (action) {
        case _KeyboardShortcuts.KeyBindingAction.SendMessage:
          this.sendEdit();
          event.stopPropagation();
          event.preventDefault();
          break;

        case _KeyboardShortcuts.KeyBindingAction.CancelReplyOrEdit:
          event.stopPropagation();
          this.cancelEdit();
          break;

        case _KeyboardShortcuts.KeyBindingAction.EditPrevMessage:
          {
            if (this.editorRef.current?.isModified() || !this.editorRef.current?.isCaretAtStart()) {
              return;
            }

            const previousEvent = (0, _EventUtils.findEditableEvent)({
              events: this.events,
              isForward: false,
              fromEventId: this.props.editState.getEvent().getId()
            });

            if (previousEvent) {
              _dispatcher.default.dispatch({
                action: _actions.Action.EditEvent,
                event: previousEvent,
                timelineRenderingType: this.context.timelineRenderingType
              });

              event.preventDefault();
            }

            break;
          }

        case _KeyboardShortcuts.KeyBindingAction.EditNextMessage:
          {
            if (this.editorRef.current?.isModified() || !this.editorRef.current?.isCaretAtEnd()) {
              return;
            }

            const nextEvent = (0, _EventUtils.findEditableEvent)({
              events: this.events,
              isForward: true,
              fromEventId: this.props.editState.getEvent().getId()
            });

            if (nextEvent) {
              _dispatcher.default.dispatch({
                action: _actions.Action.EditEvent,
                event: nextEvent,
                timelineRenderingType: this.context.timelineRenderingType
              });
            } else {
              this.cancelEdit();
            }

            event.preventDefault();
            break;
          }
      }
    });
    (0, _defineProperty2.default)(this, "cancelEdit", () => {
      this.endEdit();
    });
    (0, _defineProperty2.default)(this, "saveStoredEditorState", () => {
      const item = _SendHistoryManager.default.createItem(this.model);

      this.clearPreviousEdit();
      localStorage.setItem(this.editorRoomKey, this.props.editState.getEvent().getId());
      localStorage.setItem(this.editorStateKey, JSON.stringify(item));
    });
    (0, _defineProperty2.default)(this, "sendEdit", async () => {
      if (this.state.saveDisabled) return;
      const editedEvent = this.props.editState.getEvent();

      _PosthogAnalytics.PosthogAnalytics.instance.trackEvent({
        eventName: "Composer",
        isEditing: true,
        inThread: !!editedEvent?.getThread(),
        isReply: !!editedEvent.replyEventId
      }); // Replace emoticon at the end of the message


      if (_SettingsStore.default.getValue('MessageComposerInput.autoReplaceEmoji')) {
        const caret = this.editorRef.current?.getCaret();
        const position = this.model.positionForOffset(caret.offset, caret.atNodeEnd);
        this.editorRef.current?.replaceEmoticon(position, _BasicMessageComposer.REGEX_EMOTICON);
      }

      const editContent = createEditContent(this.model, editedEvent);
      const newContent = editContent["m.new_content"];
      let shouldSend = true;

      if (newContent?.body === '') {
        this.cancelPreviousPendingEdit();
        (0, _ConfirmRedactDialog.createRedactEventDialog)({
          mxEvent: editedEvent,
          onCloseDialog: () => {
            this.cancelEdit();
          }
        });
        return;
      } // If content is modified then send an updated event into the room


      if (this.isContentModified(newContent)) {
        const roomId = editedEvent.getRoomId();

        if (!(0, _serialize.containsEmote)(this.model) && (0, _commands.isSlashCommand)(this.model)) {
          const [cmd, args, commandText] = (0, _commands.getSlashCommand)(this.model);

          if (cmd) {
            const threadId = editedEvent?.getThread()?.id || null;
            const [content, commandSuccessful] = await (0, _commands.runSlashCommand)(cmd, args, roomId, threadId);

            if (!commandSuccessful) {
              return; // errored
            }

            if (cmd.category === _SlashCommands.CommandCategories.messages || cmd.category === _SlashCommands.CommandCategories.effects) {
              editContent["m.new_content"] = content;
            } else {
              shouldSend = false;
            }
          } else if (!(await (0, _commands.shouldSendAnyway)(commandText))) {
            // if !sendAnyway bail to let the user edit the composer and try again
            return;
          }
        }

        if (shouldSend) {
          this.cancelPreviousPendingEdit();
          const event = this.props.editState.getEvent();
          const threadId = event.threadRootId || null;
          this.props.mxClient.sendMessage(roomId, threadId, editContent);

          _dispatcher.default.dispatch({
            action: "message_sent"
          });
        }
      }

      this.endEdit();
    });
    (0, _defineProperty2.default)(this, "onChange", () => {
      if (!this.state.saveDisabled || !this.editorRef.current?.isModified()) {
        return;
      }

      this.setState({
        saveDisabled: false
      });
    });
    (0, _defineProperty2.default)(this, "onAction", payload => {
      if (!this.editorRef.current) return;

      if (payload.action === _actions.Action.ComposerInsert) {
        if (payload.timelineRenderingType !== this.context.timelineRenderingType) return;
        if (payload.composerType !== _ComposerInsertPayload.ComposerType.Edit) return;

        if (payload.userId) {
          this.editorRef.current?.insertMention(payload.userId);
        } else if (payload.event) {
          this.editorRef.current?.insertQuotedMessage(payload.event);
        } else if (payload.text) {
          this.editorRef.current?.insertPlaintext(payload.text);
        }
      } else if (payload.action === _actions.Action.FocusEditMessageComposer) {
        this.editorRef.current.focus();
      }
    });
    this.context = context; // otherwise React will only set it prior to render due to type def above

    const isRestored = this.createEditorModel();
    const ev = this.props.editState.getEvent();

    const _editContent = createEditContent(this.model, ev);

    this.state = {
      saveDisabled: !isRestored || !this.isContentModified(_editContent["m.new_content"])
    };
    window.addEventListener("beforeunload", this.saveStoredEditorState);
    this.dispatcherRef = _dispatcher.default.register(this.onAction);
  }

  getRoom() {
    return this.props.mxClient.getRoom(this.props.editState.getEvent().getRoomId());
  }

  endEdit() {
    localStorage.removeItem(this.editorRoomKey);
    localStorage.removeItem(this.editorStateKey); // close the event editing and focus composer

    _dispatcher.default.dispatch({
      action: _actions.Action.EditEvent,
      event: null,
      timelineRenderingType: this.context.timelineRenderingType
    });

    _dispatcher.default.dispatch({
      action: _actions.Action.FocusSendMessageComposer,
      context: this.context.timelineRenderingType
    });
  }

  get editorRoomKey() {
    return (0, _Editing.editorRoomKey)(this.props.editState.getEvent().getRoomId(), this.context.timelineRenderingType);
  }

  get editorStateKey() {
    return (0, _Editing.editorStateKey)(this.props.editState.getEvent().getId());
  }

  get events() {
    const liveTimelineEvents = this.context.liveTimeline.getEvents();
    const pendingEvents = this.getRoom().getPendingEvents();
    const isInThread = Boolean(this.props.editState.getEvent().getThread());
    return liveTimelineEvents.concat(isInThread ? [] : pendingEvents);
  }

  get shouldSaveStoredEditorState() {
    return localStorage.getItem(this.editorRoomKey) !== null;
  }

  restoreStoredEditorState(partCreator) {
    const json = localStorage.getItem(this.editorStateKey);

    if (json) {
      try {
        const {
          parts: serializedParts
        } = JSON.parse(json);
        const parts = serializedParts.map(p => partCreator.deserializePart(p));
        return parts;
      } catch (e) {
        _logger.logger.error("Error parsing editing state: ", e);
      }
    }
  }

  clearPreviousEdit() {
    if (localStorage.getItem(this.editorRoomKey)) {
      localStorage.removeItem(`mx_edit_state_${localStorage.getItem(this.editorRoomKey)}`);
    }
  }

  isContentModified(newContent) {
    // if nothing has changed then bail
    const oldContent = this.props.editState.getEvent().getContent();

    if (oldContent["msgtype"] === newContent["msgtype"] && oldContent["body"] === newContent["body"] && oldContent["format"] === newContent["format"] && oldContent["formatted_body"] === newContent["formatted_body"]) {
      return false;
    }

    return true;
  }

  cancelPreviousPendingEdit() {
    const originalEvent = this.props.editState.getEvent();
    const previousEdit = originalEvent.replacingEvent();

    if (previousEdit && (previousEdit.status === _event.EventStatus.QUEUED || previousEdit.status === _event.EventStatus.NOT_SENT)) {
      this.props.mxClient.cancelPendingEvent(previousEdit);
    }
  }

  componentWillUnmount() {
    // store caret and serialized parts in the
    // editorstate so it can be restored when the remote echo event tile gets rendered
    // in case we're currently editing a pending event
    const sel = document.getSelection();
    let caret;

    if (sel.focusNode) {
      caret = (0, _dom.getCaretOffsetAndText)(this.editorRef.current?.editorRef.current, sel).caret;
    }

    const parts = this.model.serializeParts(); // if caret is undefined because for some reason there isn't a valid selection,
    // then when mounting the editor again with the same editor state,
    // it will set the cursor at the end.

    this.props.editState.setEditorState(caret, parts);
    window.removeEventListener("beforeunload", this.saveStoredEditorState);

    if (this.shouldSaveStoredEditorState) {
      this.saveStoredEditorState();
    }

    _dispatcher.default.unregister(this.dispatcherRef);
  }

  createEditorModel() {
    const {
      editState
    } = this.props;
    const room = this.getRoom();
    const partCreator = new _parts.CommandPartCreator(room, this.props.mxClient);
    let parts;
    let isRestored = false;

    if (editState.hasEditorState()) {
      // if restoring state from a previous editor,
      // restore serialized parts from the state
      parts = editState.getSerializedParts().map(p => partCreator.deserializePart(p));
    } else {
      // otherwise, either restore serialized parts from localStorage or parse the body of the event
      const restoredParts = this.restoreStoredEditorState(partCreator);
      parts = restoredParts || (0, _deserialize.parseEvent)(editState.getEvent(), partCreator, {
        shouldEscape: _SettingsStore.default.getValue("MessageComposerInput.useMarkdown")
      });
      isRestored = !!restoredParts;
    }

    this.model = new _model.default(parts, partCreator);
    this.saveStoredEditorState();
    return isRestored;
  }

  render() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: (0, _classnames.default)("mx_EditMessageComposer", this.props.className),
      onKeyDown: this.onKeyDown
    }, /*#__PURE__*/_react.default.createElement(_BasicMessageComposer.default, {
      ref: this.editorRef,
      model: this.model,
      room: this.getRoom(),
      threadId: this.props.editState?.getEvent()?.getThread()?.id,
      initialCaret: this.props.editState.getCaret(),
      label: (0, _languageHandler._t)("Edit message"),
      onChange: this.onChange
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_EditMessageComposer_buttons"
    }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "secondary",
      onClick: this.cancelEdit
    }, (0, _languageHandler._t)("Cancel")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "primary",
      onClick: this.sendEdit,
      disabled: this.state.saveDisabled
    }, (0, _languageHandler._t)("Save"))));
  }

}

(0, _defineProperty2.default)(EditMessageComposer, "contextType", _RoomContext.default);
const EditMessageComposerWithMatrixClient = (0, _MatrixClientContext.withMatrixClientHOC)(EditMessageComposer);
var _default = EditMessageComposerWithMatrixClient;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRIdG1sUmVwbHlGYWxsYmFjayIsIm14RXZlbnQiLCJodG1sIiwiZ2V0Q29udGVudCIsImZvcm1hdHRlZF9ib2R5Iiwicm9vdE5vZGUiLCJET01QYXJzZXIiLCJwYXJzZUZyb21TdHJpbmciLCJib2R5IiwibXhSZXBseSIsInF1ZXJ5U2VsZWN0b3IiLCJvdXRlckhUTUwiLCJnZXRUZXh0UmVwbHlGYWxsYmFjayIsImxpbmVzIiwic3BsaXQiLCJtYXAiLCJsIiwidHJpbSIsImxlbmd0aCIsInN0YXJ0c1dpdGgiLCJjcmVhdGVFZGl0Q29udGVudCIsIm1vZGVsIiwiZWRpdGVkRXZlbnQiLCJpc0Vtb3RlIiwiY29udGFpbnNFbW90ZSIsInN0cmlwRW1vdGVDb21tYW5kIiwiaXNSZXBseSIsInJlcGx5RXZlbnRJZCIsInBsYWluUHJlZml4IiwiaHRtbFByZWZpeCIsInRleHRTZXJpYWxpemUiLCJuZXdDb250ZW50IiwiTXNnVHlwZSIsIkVtb3RlIiwiVGV4dCIsImNvbnRlbnRCb2R5IiwibXNndHlwZSIsImZvcm1hdHRlZEJvZHkiLCJodG1sU2VyaWFsaXplSWZOZWVkZWQiLCJmb3JjZUhUTUwiLCJ1c2VNYXJrZG93biIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsImZvcm1hdCIsInJlbGF0aW9uIiwiZ2V0SWQiLCJPYmplY3QiLCJhc3NpZ24iLCJFZGl0TWVzc2FnZUNvbXBvc2VyIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY29udGV4dCIsImNyZWF0ZVJlZiIsImV2ZW50IiwiZWRpdG9yUmVmIiwiY3VycmVudCIsImlzQ29tcG9zaW5nIiwiYWN0aW9uIiwiZ2V0S2V5QmluZGluZ3NNYW5hZ2VyIiwiZ2V0TWVzc2FnZUNvbXBvc2VyQWN0aW9uIiwiS2V5QmluZGluZ0FjdGlvbiIsIlNlbmRNZXNzYWdlIiwic2VuZEVkaXQiLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsIkNhbmNlbFJlcGx5T3JFZGl0IiwiY2FuY2VsRWRpdCIsIkVkaXRQcmV2TWVzc2FnZSIsImlzTW9kaWZpZWQiLCJpc0NhcmV0QXRTdGFydCIsInByZXZpb3VzRXZlbnQiLCJmaW5kRWRpdGFibGVFdmVudCIsImV2ZW50cyIsImlzRm9yd2FyZCIsImZyb21FdmVudElkIiwiZWRpdFN0YXRlIiwiZ2V0RXZlbnQiLCJkaXMiLCJkaXNwYXRjaCIsIkFjdGlvbiIsIkVkaXRFdmVudCIsInRpbWVsaW5lUmVuZGVyaW5nVHlwZSIsIkVkaXROZXh0TWVzc2FnZSIsImlzQ2FyZXRBdEVuZCIsIm5leHRFdmVudCIsImVuZEVkaXQiLCJpdGVtIiwiU2VuZEhpc3RvcnlNYW5hZ2VyIiwiY3JlYXRlSXRlbSIsImNsZWFyUHJldmlvdXNFZGl0IiwibG9jYWxTdG9yYWdlIiwic2V0SXRlbSIsImVkaXRvclJvb21LZXkiLCJlZGl0b3JTdGF0ZUtleSIsIkpTT04iLCJzdHJpbmdpZnkiLCJzdGF0ZSIsInNhdmVEaXNhYmxlZCIsIlBvc3Rob2dBbmFseXRpY3MiLCJpbnN0YW5jZSIsInRyYWNrRXZlbnQiLCJldmVudE5hbWUiLCJpc0VkaXRpbmciLCJpblRocmVhZCIsImdldFRocmVhZCIsImNhcmV0IiwiZ2V0Q2FyZXQiLCJwb3NpdGlvbiIsInBvc2l0aW9uRm9yT2Zmc2V0Iiwib2Zmc2V0IiwiYXROb2RlRW5kIiwicmVwbGFjZUVtb3RpY29uIiwiUkVHRVhfRU1PVElDT04iLCJlZGl0Q29udGVudCIsInNob3VsZFNlbmQiLCJjYW5jZWxQcmV2aW91c1BlbmRpbmdFZGl0IiwiY3JlYXRlUmVkYWN0RXZlbnREaWFsb2ciLCJvbkNsb3NlRGlhbG9nIiwiaXNDb250ZW50TW9kaWZpZWQiLCJyb29tSWQiLCJnZXRSb29tSWQiLCJpc1NsYXNoQ29tbWFuZCIsImNtZCIsImFyZ3MiLCJjb21tYW5kVGV4dCIsImdldFNsYXNoQ29tbWFuZCIsInRocmVhZElkIiwiaWQiLCJjb250ZW50IiwiY29tbWFuZFN1Y2Nlc3NmdWwiLCJydW5TbGFzaENvbW1hbmQiLCJjYXRlZ29yeSIsIkNvbW1hbmRDYXRlZ29yaWVzIiwibWVzc2FnZXMiLCJlZmZlY3RzIiwic2hvdWxkU2VuZEFueXdheSIsInRocmVhZFJvb3RJZCIsIm14Q2xpZW50Iiwic2VuZE1lc3NhZ2UiLCJzZXRTdGF0ZSIsInBheWxvYWQiLCJDb21wb3Nlckluc2VydCIsImNvbXBvc2VyVHlwZSIsIkNvbXBvc2VyVHlwZSIsIkVkaXQiLCJ1c2VySWQiLCJpbnNlcnRNZW50aW9uIiwiaW5zZXJ0UXVvdGVkTWVzc2FnZSIsInRleHQiLCJpbnNlcnRQbGFpbnRleHQiLCJGb2N1c0VkaXRNZXNzYWdlQ29tcG9zZXIiLCJmb2N1cyIsImlzUmVzdG9yZWQiLCJjcmVhdGVFZGl0b3JNb2RlbCIsImV2Iiwid2luZG93IiwiYWRkRXZlbnRMaXN0ZW5lciIsInNhdmVTdG9yZWRFZGl0b3JTdGF0ZSIsImRpc3BhdGNoZXJSZWYiLCJyZWdpc3RlciIsIm9uQWN0aW9uIiwiZ2V0Um9vbSIsInJlbW92ZUl0ZW0iLCJGb2N1c1NlbmRNZXNzYWdlQ29tcG9zZXIiLCJsaXZlVGltZWxpbmVFdmVudHMiLCJsaXZlVGltZWxpbmUiLCJnZXRFdmVudHMiLCJwZW5kaW5nRXZlbnRzIiwiZ2V0UGVuZGluZ0V2ZW50cyIsImlzSW5UaHJlYWQiLCJCb29sZWFuIiwiY29uY2F0Iiwic2hvdWxkU2F2ZVN0b3JlZEVkaXRvclN0YXRlIiwiZ2V0SXRlbSIsInJlc3RvcmVTdG9yZWRFZGl0b3JTdGF0ZSIsInBhcnRDcmVhdG9yIiwianNvbiIsInBhcnRzIiwic2VyaWFsaXplZFBhcnRzIiwicGFyc2UiLCJwIiwiZGVzZXJpYWxpemVQYXJ0IiwiZSIsImxvZ2dlciIsImVycm9yIiwib2xkQ29udGVudCIsIm9yaWdpbmFsRXZlbnQiLCJwcmV2aW91c0VkaXQiLCJyZXBsYWNpbmdFdmVudCIsInN0YXR1cyIsIkV2ZW50U3RhdHVzIiwiUVVFVUVEIiwiTk9UX1NFTlQiLCJjYW5jZWxQZW5kaW5nRXZlbnQiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInNlbCIsImRvY3VtZW50IiwiZ2V0U2VsZWN0aW9uIiwiZm9jdXNOb2RlIiwiZ2V0Q2FyZXRPZmZzZXRBbmRUZXh0Iiwic2VyaWFsaXplUGFydHMiLCJzZXRFZGl0b3JTdGF0ZSIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJ1bnJlZ2lzdGVyIiwicm9vbSIsIkNvbW1hbmRQYXJ0Q3JlYXRvciIsImhhc0VkaXRvclN0YXRlIiwiZ2V0U2VyaWFsaXplZFBhcnRzIiwicmVzdG9yZWRQYXJ0cyIsInBhcnNlRXZlbnQiLCJzaG91bGRFc2NhcGUiLCJFZGl0b3JNb2RlbCIsInJlbmRlciIsImNsYXNzTmFtZXMiLCJjbGFzc05hbWUiLCJvbktleURvd24iLCJfdCIsIm9uQ2hhbmdlIiwiUm9vbUNvbnRleHQiLCJFZGl0TWVzc2FnZUNvbXBvc2VyV2l0aE1hdHJpeENsaWVudCIsIndpdGhNYXRyaXhDbGllbnRIT0MiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9yb29tcy9FZGl0TWVzc2FnZUNvbXBvc2VyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgLSAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IGNyZWF0ZVJlZiwgS2V5Ym9hcmRFdmVudCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHsgRXZlbnRTdGF0dXMsIElDb250ZW50LCBNYXRyaXhFdmVudCB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudCc7XG5pbXBvcnQgeyBNc2dUeXBlIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL2V2ZW50JztcbmltcG9ydCB7IFJvb20gfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbSc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5pbXBvcnQgeyBDb21wb3NlciBhcyBDb21wb3NlckV2ZW50IH0gZnJvbSBcIkBtYXRyaXgtb3JnL2FuYWx5dGljcy1ldmVudHMvdHlwZXMvdHlwZXNjcmlwdC9Db21wb3NlclwiO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgRWRpdG9yTW9kZWwgZnJvbSAnLi4vLi4vLi4vZWRpdG9yL21vZGVsJztcbmltcG9ydCB7IGdldENhcmV0T2Zmc2V0QW5kVGV4dCB9IGZyb20gJy4uLy4uLy4uL2VkaXRvci9kb20nO1xuaW1wb3J0IHsgaHRtbFNlcmlhbGl6ZUlmTmVlZGVkLCB0ZXh0U2VyaWFsaXplLCBjb250YWluc0Vtb3RlLCBzdHJpcEVtb3RlQ29tbWFuZCB9IGZyb20gJy4uLy4uLy4uL2VkaXRvci9zZXJpYWxpemUnO1xuaW1wb3J0IHsgZmluZEVkaXRhYmxlRXZlbnQgfSBmcm9tICcuLi8uLi8uLi91dGlscy9FdmVudFV0aWxzJztcbmltcG9ydCB7IHBhcnNlRXZlbnQgfSBmcm9tICcuLi8uLi8uLi9lZGl0b3IvZGVzZXJpYWxpemUnO1xuaW1wb3J0IHsgQ29tbWFuZFBhcnRDcmVhdG9yLCBQYXJ0LCBQYXJ0Q3JlYXRvciB9IGZyb20gJy4uLy4uLy4uL2VkaXRvci9wYXJ0cyc7XG5pbXBvcnQgRWRpdG9yU3RhdGVUcmFuc2ZlciBmcm9tICcuLi8uLi8uLi91dGlscy9FZGl0b3JTdGF0ZVRyYW5zZmVyJztcbmltcG9ydCBCYXNpY01lc3NhZ2VDb21wb3NlciwgeyBSRUdFWF9FTU9USUNPTiB9IGZyb20gXCIuL0Jhc2ljTWVzc2FnZUNvbXBvc2VyXCI7XG5pbXBvcnQgeyBDb21tYW5kQ2F0ZWdvcmllcyB9IGZyb20gJy4uLy4uLy4uL1NsYXNoQ29tbWFuZHMnO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IHsgZ2V0S2V5QmluZGluZ3NNYW5hZ2VyIH0gZnJvbSAnLi4vLi4vLi4vS2V5QmluZGluZ3NNYW5hZ2VyJztcbmltcG9ydCBTZW5kSGlzdG9yeU1hbmFnZXIgZnJvbSAnLi4vLi4vLi4vU2VuZEhpc3RvcnlNYW5hZ2VyJztcbmltcG9ydCB7IEFjdGlvblBheWxvYWQgfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkc1wiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSAnLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvbic7XG5pbXBvcnQgeyBjcmVhdGVSZWRhY3RFdmVudERpYWxvZyB9IGZyb20gJy4uL2RpYWxvZ3MvQ29uZmlybVJlZGFjdERpYWxvZyc7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHsgd2l0aE1hdHJpeENsaWVudEhPQywgTWF0cml4Q2xpZW50UHJvcHMgfSBmcm9tICcuLi8uLi8uLi9jb250ZXh0cy9NYXRyaXhDbGllbnRDb250ZXh0JztcbmltcG9ydCBSb29tQ29udGV4dCBmcm9tICcuLi8uLi8uLi9jb250ZXh0cy9Sb29tQ29udGV4dCc7XG5pbXBvcnQgeyBDb21wb3NlclR5cGUgfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9Db21wb3Nlckluc2VydFBheWxvYWRcIjtcbmltcG9ydCB7IGdldFNsYXNoQ29tbWFuZCwgaXNTbGFzaENvbW1hbmQsIHJ1blNsYXNoQ29tbWFuZCwgc2hvdWxkU2VuZEFueXdheSB9IGZyb20gXCIuLi8uLi8uLi9lZGl0b3IvY29tbWFuZHNcIjtcbmltcG9ydCB7IEtleUJpbmRpbmdBY3Rpb24gfSBmcm9tIFwiLi4vLi4vLi4vYWNjZXNzaWJpbGl0eS9LZXlib2FyZFNob3J0Y3V0c1wiO1xuaW1wb3J0IHsgUG9zdGhvZ0FuYWx5dGljcyB9IGZyb20gXCIuLi8uLi8uLi9Qb3N0aG9nQW5hbHl0aWNzXCI7XG5pbXBvcnQgeyBlZGl0b3JSb29tS2V5LCBlZGl0b3JTdGF0ZUtleSB9IGZyb20gXCIuLi8uLi8uLi9FZGl0aW5nXCI7XG5cbmZ1bmN0aW9uIGdldEh0bWxSZXBseUZhbGxiYWNrKG14RXZlbnQ6IE1hdHJpeEV2ZW50KTogc3RyaW5nIHtcbiAgICBjb25zdCBodG1sID0gbXhFdmVudC5nZXRDb250ZW50KCkuZm9ybWF0dGVkX2JvZHk7XG4gICAgaWYgKCFodG1sKSB7XG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cbiAgICBjb25zdCByb290Tm9kZSA9IG5ldyBET01QYXJzZXIoKS5wYXJzZUZyb21TdHJpbmcoaHRtbCwgXCJ0ZXh0L2h0bWxcIikuYm9keTtcbiAgICBjb25zdCBteFJlcGx5ID0gcm9vdE5vZGUucXVlcnlTZWxlY3RvcihcIm14LXJlcGx5XCIpO1xuICAgIHJldHVybiAobXhSZXBseSAmJiBteFJlcGx5Lm91dGVySFRNTCkgfHwgXCJcIjtcbn1cblxuZnVuY3Rpb24gZ2V0VGV4dFJlcGx5RmFsbGJhY2sobXhFdmVudDogTWF0cml4RXZlbnQpOiBzdHJpbmcge1xuICAgIGNvbnN0IGJvZHkgPSBteEV2ZW50LmdldENvbnRlbnQoKS5ib2R5O1xuICAgIGNvbnN0IGxpbmVzID0gYm9keS5zcGxpdChcIlxcblwiKS5tYXAobCA9PiBsLnRyaW0oKSk7XG4gICAgaWYgKGxpbmVzLmxlbmd0aCA+IDIgJiYgbGluZXNbMF0uc3RhcnRzV2l0aChcIj4gXCIpICYmIGxpbmVzWzFdLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gYCR7bGluZXNbMF19XFxuXFxuYDtcbiAgICB9XG4gICAgcmV0dXJuIFwiXCI7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVkaXRDb250ZW50KFxuICAgIG1vZGVsOiBFZGl0b3JNb2RlbCxcbiAgICBlZGl0ZWRFdmVudDogTWF0cml4RXZlbnQsXG4pOiBJQ29udGVudCB7XG4gICAgY29uc3QgaXNFbW90ZSA9IGNvbnRhaW5zRW1vdGUobW9kZWwpO1xuICAgIGlmIChpc0Vtb3RlKSB7XG4gICAgICAgIG1vZGVsID0gc3RyaXBFbW90ZUNvbW1hbmQobW9kZWwpO1xuICAgIH1cbiAgICBjb25zdCBpc1JlcGx5ID0gISFlZGl0ZWRFdmVudC5yZXBseUV2ZW50SWQ7XG4gICAgbGV0IHBsYWluUHJlZml4ID0gXCJcIjtcbiAgICBsZXQgaHRtbFByZWZpeCA9IFwiXCI7XG5cbiAgICBpZiAoaXNSZXBseSkge1xuICAgICAgICBwbGFpblByZWZpeCA9IGdldFRleHRSZXBseUZhbGxiYWNrKGVkaXRlZEV2ZW50KTtcbiAgICAgICAgaHRtbFByZWZpeCA9IGdldEh0bWxSZXBseUZhbGxiYWNrKGVkaXRlZEV2ZW50KTtcbiAgICB9XG5cbiAgICBjb25zdCBib2R5ID0gdGV4dFNlcmlhbGl6ZShtb2RlbCk7XG5cbiAgICBjb25zdCBuZXdDb250ZW50OiBJQ29udGVudCA9IHtcbiAgICAgICAgXCJtc2d0eXBlXCI6IGlzRW1vdGUgPyBNc2dUeXBlLkVtb3RlIDogTXNnVHlwZS5UZXh0LFxuICAgICAgICBcImJvZHlcIjogYm9keSxcbiAgICB9O1xuICAgIGNvbnN0IGNvbnRlbnRCb2R5OiBJQ29udGVudCA9IHtcbiAgICAgICAgbXNndHlwZTogbmV3Q29udGVudC5tc2d0eXBlLFxuICAgICAgICBib2R5OiBgJHtwbGFpblByZWZpeH0gKiAke2JvZHl9YCxcbiAgICB9O1xuXG4gICAgY29uc3QgZm9ybWF0dGVkQm9keSA9IGh0bWxTZXJpYWxpemVJZk5lZWRlZChtb2RlbCwge1xuICAgICAgICBmb3JjZUhUTUw6IGlzUmVwbHksXG4gICAgICAgIHVzZU1hcmtkb3duOiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiTWVzc2FnZUNvbXBvc2VySW5wdXQudXNlTWFya2Rvd25cIiksXG4gICAgfSk7XG4gICAgaWYgKGZvcm1hdHRlZEJvZHkpIHtcbiAgICAgICAgbmV3Q29udGVudC5mb3JtYXQgPSBcIm9yZy5tYXRyaXguY3VzdG9tLmh0bWxcIjtcbiAgICAgICAgbmV3Q29udGVudC5mb3JtYXR0ZWRfYm9keSA9IGZvcm1hdHRlZEJvZHk7XG4gICAgICAgIGNvbnRlbnRCb2R5LmZvcm1hdCA9IG5ld0NvbnRlbnQuZm9ybWF0O1xuICAgICAgICBjb250ZW50Qm9keS5mb3JtYXR0ZWRfYm9keSA9IGAke2h0bWxQcmVmaXh9ICogJHtmb3JtYXR0ZWRCb2R5fWA7XG4gICAgfVxuXG4gICAgY29uc3QgcmVsYXRpb24gPSB7XG4gICAgICAgIFwibS5uZXdfY29udGVudFwiOiBuZXdDb250ZW50LFxuICAgICAgICBcIm0ucmVsYXRlc190b1wiOiB7XG4gICAgICAgICAgICBcInJlbF90eXBlXCI6IFwibS5yZXBsYWNlXCIsXG4gICAgICAgICAgICBcImV2ZW50X2lkXCI6IGVkaXRlZEV2ZW50LmdldElkKCksXG4gICAgICAgIH0sXG4gICAgfTtcblxuICAgIHJldHVybiBPYmplY3QuYXNzaWduKHJlbGF0aW9uLCBjb250ZW50Qm9keSk7XG59XG5cbmludGVyZmFjZSBJRWRpdE1lc3NhZ2VDb21wb3NlclByb3BzIGV4dGVuZHMgTWF0cml4Q2xpZW50UHJvcHMge1xuICAgIGVkaXRTdGF0ZTogRWRpdG9yU3RhdGVUcmFuc2ZlcjtcbiAgICBjbGFzc05hbWU/OiBzdHJpbmc7XG59XG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBzYXZlRGlzYWJsZWQ6IGJvb2xlYW47XG59XG5cbmNsYXNzIEVkaXRNZXNzYWdlQ29tcG9zZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SUVkaXRNZXNzYWdlQ29tcG9zZXJQcm9wcywgSVN0YXRlPiB7XG4gICAgc3RhdGljIGNvbnRleHRUeXBlID0gUm9vbUNvbnRleHQ7XG4gICAgY29udGV4dCE6IFJlYWN0LkNvbnRleHRUeXBlPHR5cGVvZiBSb29tQ29udGV4dD47XG5cbiAgICBwcml2YXRlIHJlYWRvbmx5IGVkaXRvclJlZiA9IGNyZWF0ZVJlZjxCYXNpY01lc3NhZ2VDb21wb3Nlcj4oKTtcbiAgICBwcml2YXRlIHJlYWRvbmx5IGRpc3BhdGNoZXJSZWY6IHN0cmluZztcbiAgICBwcml2YXRlIG1vZGVsOiBFZGl0b3JNb2RlbCA9IG51bGw7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSUVkaXRNZXNzYWdlQ29tcG9zZXJQcm9wcywgY29udGV4dDogUmVhY3QuQ29udGV4dFR5cGU8dHlwZW9mIFJvb21Db250ZXh0Pikge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQ7IC8vIG90aGVyd2lzZSBSZWFjdCB3aWxsIG9ubHkgc2V0IGl0IHByaW9yIHRvIHJlbmRlciBkdWUgdG8gdHlwZSBkZWYgYWJvdmVcblxuICAgICAgICBjb25zdCBpc1Jlc3RvcmVkID0gdGhpcy5jcmVhdGVFZGl0b3JNb2RlbCgpO1xuICAgICAgICBjb25zdCBldiA9IHRoaXMucHJvcHMuZWRpdFN0YXRlLmdldEV2ZW50KCk7XG5cbiAgICAgICAgY29uc3QgZWRpdENvbnRlbnQgPSBjcmVhdGVFZGl0Q29udGVudCh0aGlzLm1vZGVsLCBldik7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBzYXZlRGlzYWJsZWQ6ICFpc1Jlc3RvcmVkIHx8ICF0aGlzLmlzQ29udGVudE1vZGlmaWVkKGVkaXRDb250ZW50W1wibS5uZXdfY29udGVudFwiXSksXG4gICAgICAgIH07XG5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJiZWZvcmV1bmxvYWRcIiwgdGhpcy5zYXZlU3RvcmVkRWRpdG9yU3RhdGUpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXJSZWYgPSBkaXMucmVnaXN0ZXIodGhpcy5vbkFjdGlvbik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRSb29tKCk6IFJvb20ge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5teENsaWVudC5nZXRSb29tKHRoaXMucHJvcHMuZWRpdFN0YXRlLmdldEV2ZW50KCkuZ2V0Um9vbUlkKCkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25LZXlEb3duID0gKGV2ZW50OiBLZXlib2FyZEV2ZW50KTogdm9pZCA9PiB7XG4gICAgICAgIC8vIGlnbm9yZSBhbnkga2V5cHJlc3Mgd2hpbGUgZG9pbmcgSU1FIGNvbXBvc2l0aW9uc1xuICAgICAgICBpZiAodGhpcy5lZGl0b3JSZWYuY3VycmVudD8uaXNDb21wb3NpbmcoZXZlbnQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYWN0aW9uID0gZ2V0S2V5QmluZGluZ3NNYW5hZ2VyKCkuZ2V0TWVzc2FnZUNvbXBvc2VyQWN0aW9uKGV2ZW50KTtcbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5TZW5kTWVzc2FnZTpcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmRFZGl0KCk7XG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5DYW5jZWxSZXBseU9yRWRpdDpcbiAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbmNlbEVkaXQoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5FZGl0UHJldk1lc3NhZ2U6IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5lZGl0b3JSZWYuY3VycmVudD8uaXNNb2RpZmllZCgpIHx8ICF0aGlzLmVkaXRvclJlZi5jdXJyZW50Py5pc0NhcmV0QXRTdGFydCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgcHJldmlvdXNFdmVudCA9IGZpbmRFZGl0YWJsZUV2ZW50KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzOiB0aGlzLmV2ZW50cyxcbiAgICAgICAgICAgICAgICAgICAgaXNGb3J3YXJkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgZnJvbUV2ZW50SWQ6IHRoaXMucHJvcHMuZWRpdFN0YXRlLmdldEV2ZW50KCkuZ2V0SWQoKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAocHJldmlvdXNFdmVudCkge1xuICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uRWRpdEV2ZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IHByZXZpb3VzRXZlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lbGluZVJlbmRlcmluZ1R5cGU6IHRoaXMuY29udGV4dC50aW1lbGluZVJlbmRlcmluZ1R5cGUsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgS2V5QmluZGluZ0FjdGlvbi5FZGl0TmV4dE1lc3NhZ2U6IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5lZGl0b3JSZWYuY3VycmVudD8uaXNNb2RpZmllZCgpIHx8ICF0aGlzLmVkaXRvclJlZi5jdXJyZW50Py5pc0NhcmV0QXRFbmQoKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IG5leHRFdmVudCA9IGZpbmRFZGl0YWJsZUV2ZW50KHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzOiB0aGlzLmV2ZW50cyxcbiAgICAgICAgICAgICAgICAgICAgaXNGb3J3YXJkOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBmcm9tRXZlbnRJZDogdGhpcy5wcm9wcy5lZGl0U3RhdGUuZ2V0RXZlbnQoKS5nZXRJZCgpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChuZXh0RXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLkVkaXRFdmVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50OiBuZXh0RXZlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aW1lbGluZVJlbmRlcmluZ1R5cGU6IHRoaXMuY29udGV4dC50aW1lbGluZVJlbmRlcmluZ1R5cGUsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FuY2VsRWRpdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgZW5kRWRpdCgpOiB2b2lkIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0odGhpcy5lZGl0b3JSb29tS2V5KTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0odGhpcy5lZGl0b3JTdGF0ZUtleSk7XG5cbiAgICAgICAgLy8gY2xvc2UgdGhlIGV2ZW50IGVkaXRpbmcgYW5kIGZvY3VzIGNvbXBvc2VyXG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5FZGl0RXZlbnQsXG4gICAgICAgICAgICBldmVudDogbnVsbCxcbiAgICAgICAgICAgIHRpbWVsaW5lUmVuZGVyaW5nVHlwZTogdGhpcy5jb250ZXh0LnRpbWVsaW5lUmVuZGVyaW5nVHlwZSxcbiAgICAgICAgfSk7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5Gb2N1c1NlbmRNZXNzYWdlQ29tcG9zZXIsXG4gICAgICAgICAgICBjb250ZXh0OiB0aGlzLmNvbnRleHQudGltZWxpbmVSZW5kZXJpbmdUeXBlLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldCBlZGl0b3JSb29tS2V5KCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBlZGl0b3JSb29tS2V5KHRoaXMucHJvcHMuZWRpdFN0YXRlLmdldEV2ZW50KCkuZ2V0Um9vbUlkKCksIHRoaXMuY29udGV4dC50aW1lbGluZVJlbmRlcmluZ1R5cGUpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0IGVkaXRvclN0YXRlS2V5KCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBlZGl0b3JTdGF0ZUtleSh0aGlzLnByb3BzLmVkaXRTdGF0ZS5nZXRFdmVudCgpLmdldElkKCkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0IGV2ZW50cygpOiBNYXRyaXhFdmVudFtdIHtcbiAgICAgICAgY29uc3QgbGl2ZVRpbWVsaW5lRXZlbnRzID0gdGhpcy5jb250ZXh0LmxpdmVUaW1lbGluZS5nZXRFdmVudHMoKTtcbiAgICAgICAgY29uc3QgcGVuZGluZ0V2ZW50cyA9IHRoaXMuZ2V0Um9vbSgpLmdldFBlbmRpbmdFdmVudHMoKTtcbiAgICAgICAgY29uc3QgaXNJblRocmVhZCA9IEJvb2xlYW4odGhpcy5wcm9wcy5lZGl0U3RhdGUuZ2V0RXZlbnQoKS5nZXRUaHJlYWQoKSk7XG4gICAgICAgIHJldHVybiBsaXZlVGltZWxpbmVFdmVudHMuY29uY2F0KGlzSW5UaHJlYWQgPyBbXSA6IHBlbmRpbmdFdmVudHMpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2FuY2VsRWRpdCA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5lbmRFZGl0KCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgZ2V0IHNob3VsZFNhdmVTdG9yZWRFZGl0b3JTdGF0ZSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMuZWRpdG9yUm9vbUtleSkgIT09IG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZXN0b3JlU3RvcmVkRWRpdG9yU3RhdGUocGFydENyZWF0b3I6IFBhcnRDcmVhdG9yKTogUGFydFtdIHtcbiAgICAgICAgY29uc3QganNvbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMuZWRpdG9yU3RhdGVLZXkpO1xuICAgICAgICBpZiAoanNvbikge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IHBhcnRzOiBzZXJpYWxpemVkUGFydHMgfSA9IEpTT04ucGFyc2UoanNvbik7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFydHM6IFBhcnRbXSA9IHNlcmlhbGl6ZWRQYXJ0cy5tYXAocCA9PiBwYXJ0Q3JlYXRvci5kZXNlcmlhbGl6ZVBhcnQocCkpO1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJ0cztcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJFcnJvciBwYXJzaW5nIGVkaXRpbmcgc3RhdGU6IFwiLCBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY2xlYXJQcmV2aW91c0VkaXQoKTogdm9pZCB7XG4gICAgICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLmVkaXRvclJvb21LZXkpKSB7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShgbXhfZWRpdF9zdGF0ZV8ke2xvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMuZWRpdG9yUm9vbUtleSl9YCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHNhdmVTdG9yZWRFZGl0b3JTdGF0ZSA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgY29uc3QgaXRlbSA9IFNlbmRIaXN0b3J5TWFuYWdlci5jcmVhdGVJdGVtKHRoaXMubW9kZWwpO1xuICAgICAgICB0aGlzLmNsZWFyUHJldmlvdXNFZGl0KCk7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuZWRpdG9yUm9vbUtleSwgdGhpcy5wcm9wcy5lZGl0U3RhdGUuZ2V0RXZlbnQoKS5nZXRJZCgpKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5lZGl0b3JTdGF0ZUtleSwgSlNPTi5zdHJpbmdpZnkoaXRlbSkpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGlzQ29udGVudE1vZGlmaWVkKG5ld0NvbnRlbnQ6IElDb250ZW50KTogYm9vbGVhbiB7XG4gICAgICAgIC8vIGlmIG5vdGhpbmcgaGFzIGNoYW5nZWQgdGhlbiBiYWlsXG4gICAgICAgIGNvbnN0IG9sZENvbnRlbnQgPSB0aGlzLnByb3BzLmVkaXRTdGF0ZS5nZXRFdmVudCgpLmdldENvbnRlbnQoKTtcbiAgICAgICAgaWYgKG9sZENvbnRlbnRbXCJtc2d0eXBlXCJdID09PSBuZXdDb250ZW50W1wibXNndHlwZVwiXSAmJiBvbGRDb250ZW50W1wiYm9keVwiXSA9PT0gbmV3Q29udGVudFtcImJvZHlcIl0gJiZcbiAgICAgICAgICAgIG9sZENvbnRlbnRbXCJmb3JtYXRcIl0gPT09IG5ld0NvbnRlbnRbXCJmb3JtYXRcIl0gJiZcbiAgICAgICAgICAgIG9sZENvbnRlbnRbXCJmb3JtYXR0ZWRfYm9keVwiXSA9PT0gbmV3Q29udGVudFtcImZvcm1hdHRlZF9ib2R5XCJdKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZW5kRWRpdCA9IGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2F2ZURpc2FibGVkKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgZWRpdGVkRXZlbnQgPSB0aGlzLnByb3BzLmVkaXRTdGF0ZS5nZXRFdmVudCgpO1xuXG4gICAgICAgIFBvc3Rob2dBbmFseXRpY3MuaW5zdGFuY2UudHJhY2tFdmVudDxDb21wb3NlckV2ZW50Pih7XG4gICAgICAgICAgICBldmVudE5hbWU6IFwiQ29tcG9zZXJcIixcbiAgICAgICAgICAgIGlzRWRpdGluZzogdHJ1ZSxcbiAgICAgICAgICAgIGluVGhyZWFkOiAhIWVkaXRlZEV2ZW50Py5nZXRUaHJlYWQoKSxcbiAgICAgICAgICAgIGlzUmVwbHk6ICEhZWRpdGVkRXZlbnQucmVwbHlFdmVudElkLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBSZXBsYWNlIGVtb3RpY29uIGF0IHRoZSBlbmQgb2YgdGhlIG1lc3NhZ2VcbiAgICAgICAgaWYgKFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoJ01lc3NhZ2VDb21wb3NlcklucHV0LmF1dG9SZXBsYWNlRW1vamknKSkge1xuICAgICAgICAgICAgY29uc3QgY2FyZXQgPSB0aGlzLmVkaXRvclJlZi5jdXJyZW50Py5nZXRDYXJldCgpO1xuICAgICAgICAgICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLm1vZGVsLnBvc2l0aW9uRm9yT2Zmc2V0KGNhcmV0Lm9mZnNldCwgY2FyZXQuYXROb2RlRW5kKTtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQ/LnJlcGxhY2VFbW90aWNvbihwb3NpdGlvbiwgUkVHRVhfRU1PVElDT04pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGVkaXRDb250ZW50ID0gY3JlYXRlRWRpdENvbnRlbnQodGhpcy5tb2RlbCwgZWRpdGVkRXZlbnQpO1xuICAgICAgICBjb25zdCBuZXdDb250ZW50ID0gZWRpdENvbnRlbnRbXCJtLm5ld19jb250ZW50XCJdO1xuXG4gICAgICAgIGxldCBzaG91bGRTZW5kID0gdHJ1ZTtcblxuICAgICAgICBpZiAobmV3Q29udGVudD8uYm9keSA9PT0gJycpIHtcbiAgICAgICAgICAgIHRoaXMuY2FuY2VsUHJldmlvdXNQZW5kaW5nRWRpdCgpO1xuICAgICAgICAgICAgY3JlYXRlUmVkYWN0RXZlbnREaWFsb2coe1xuICAgICAgICAgICAgICAgIG14RXZlbnQ6IGVkaXRlZEV2ZW50LFxuICAgICAgICAgICAgICAgIG9uQ2xvc2VEaWFsb2c6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYW5jZWxFZGl0KCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgY29udGVudCBpcyBtb2RpZmllZCB0aGVuIHNlbmQgYW4gdXBkYXRlZCBldmVudCBpbnRvIHRoZSByb29tXG4gICAgICAgIGlmICh0aGlzLmlzQ29udGVudE1vZGlmaWVkKG5ld0NvbnRlbnQpKSB7XG4gICAgICAgICAgICBjb25zdCByb29tSWQgPSBlZGl0ZWRFdmVudC5nZXRSb29tSWQoKTtcbiAgICAgICAgICAgIGlmICghY29udGFpbnNFbW90ZSh0aGlzLm1vZGVsKSAmJiBpc1NsYXNoQ29tbWFuZCh0aGlzLm1vZGVsKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IFtjbWQsIGFyZ3MsIGNvbW1hbmRUZXh0XSA9IGdldFNsYXNoQ29tbWFuZCh0aGlzLm1vZGVsKTtcbiAgICAgICAgICAgICAgICBpZiAoY21kKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRocmVhZElkID0gZWRpdGVkRXZlbnQ/LmdldFRocmVhZCgpPy5pZCB8fCBudWxsO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBbY29udGVudCwgY29tbWFuZFN1Y2Nlc3NmdWxdID0gYXdhaXQgcnVuU2xhc2hDb21tYW5kKGNtZCwgYXJncywgcm9vbUlkLCB0aHJlYWRJZCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY29tbWFuZFN1Y2Nlc3NmdWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjsgLy8gZXJyb3JlZFxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNtZC5jYXRlZ29yeSA9PT0gQ29tbWFuZENhdGVnb3JpZXMubWVzc2FnZXMgfHwgY21kLmNhdGVnb3J5ID09PSBDb21tYW5kQ2F0ZWdvcmllcy5lZmZlY3RzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlZGl0Q29udGVudFtcIm0ubmV3X2NvbnRlbnRcIl0gPSBjb250ZW50O1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkU2VuZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghYXdhaXQgc2hvdWxkU2VuZEFueXdheShjb21tYW5kVGV4dCkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgIXNlbmRBbnl3YXkgYmFpbCB0byBsZXQgdGhlIHVzZXIgZWRpdCB0aGUgY29tcG9zZXIgYW5kIHRyeSBhZ2FpblxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNob3VsZFNlbmQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbmNlbFByZXZpb3VzUGVuZGluZ0VkaXQoKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gdGhpcy5wcm9wcy5lZGl0U3RhdGUuZ2V0RXZlbnQoKTtcbiAgICAgICAgICAgICAgICBjb25zdCB0aHJlYWRJZCA9IGV2ZW50LnRocmVhZFJvb3RJZCB8fCBudWxsO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5teENsaWVudC5zZW5kTWVzc2FnZShyb29tSWQsIHRocmVhZElkLCBlZGl0Q29udGVudCk7XG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHsgYWN0aW9uOiBcIm1lc3NhZ2Vfc2VudFwiIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbmRFZGl0KCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgY2FuY2VsUHJldmlvdXNQZW5kaW5nRWRpdCgpOiB2b2lkIHtcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxFdmVudCA9IHRoaXMucHJvcHMuZWRpdFN0YXRlLmdldEV2ZW50KCk7XG4gICAgICAgIGNvbnN0IHByZXZpb3VzRWRpdCA9IG9yaWdpbmFsRXZlbnQucmVwbGFjaW5nRXZlbnQoKTtcbiAgICAgICAgaWYgKHByZXZpb3VzRWRpdCAmJiAoXG4gICAgICAgICAgICBwcmV2aW91c0VkaXQuc3RhdHVzID09PSBFdmVudFN0YXR1cy5RVUVVRUQgfHxcbiAgICAgICAgICAgIHByZXZpb3VzRWRpdC5zdGF0dXMgPT09IEV2ZW50U3RhdHVzLk5PVF9TRU5UXG4gICAgICAgICkpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMubXhDbGllbnQuY2FuY2VsUGVuZGluZ0V2ZW50KHByZXZpb3VzRWRpdCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgLy8gc3RvcmUgY2FyZXQgYW5kIHNlcmlhbGl6ZWQgcGFydHMgaW4gdGhlXG4gICAgICAgIC8vIGVkaXRvcnN0YXRlIHNvIGl0IGNhbiBiZSByZXN0b3JlZCB3aGVuIHRoZSByZW1vdGUgZWNobyBldmVudCB0aWxlIGdldHMgcmVuZGVyZWRcbiAgICAgICAgLy8gaW4gY2FzZSB3ZSdyZSBjdXJyZW50bHkgZWRpdGluZyBhIHBlbmRpbmcgZXZlbnRcbiAgICAgICAgY29uc3Qgc2VsID0gZG9jdW1lbnQuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgIGxldCBjYXJldDtcbiAgICAgICAgaWYgKHNlbC5mb2N1c05vZGUpIHtcbiAgICAgICAgICAgIGNhcmV0ID0gZ2V0Q2FyZXRPZmZzZXRBbmRUZXh0KHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQ/LmVkaXRvclJlZi5jdXJyZW50LCBzZWwpLmNhcmV0O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhcnRzID0gdGhpcy5tb2RlbC5zZXJpYWxpemVQYXJ0cygpO1xuICAgICAgICAvLyBpZiBjYXJldCBpcyB1bmRlZmluZWQgYmVjYXVzZSBmb3Igc29tZSByZWFzb24gdGhlcmUgaXNuJ3QgYSB2YWxpZCBzZWxlY3Rpb24sXG4gICAgICAgIC8vIHRoZW4gd2hlbiBtb3VudGluZyB0aGUgZWRpdG9yIGFnYWluIHdpdGggdGhlIHNhbWUgZWRpdG9yIHN0YXRlLFxuICAgICAgICAvLyBpdCB3aWxsIHNldCB0aGUgY3Vyc29yIGF0IHRoZSBlbmQuXG4gICAgICAgIHRoaXMucHJvcHMuZWRpdFN0YXRlLnNldEVkaXRvclN0YXRlKGNhcmV0LCBwYXJ0cyk7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwiYmVmb3JldW5sb2FkXCIsIHRoaXMuc2F2ZVN0b3JlZEVkaXRvclN0YXRlKTtcbiAgICAgICAgaWYgKHRoaXMuc2hvdWxkU2F2ZVN0b3JlZEVkaXRvclN0YXRlKSB7XG4gICAgICAgICAgICB0aGlzLnNhdmVTdG9yZWRFZGl0b3JTdGF0ZSgpO1xuICAgICAgICB9XG4gICAgICAgIGRpcy51bnJlZ2lzdGVyKHRoaXMuZGlzcGF0Y2hlclJlZik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjcmVhdGVFZGl0b3JNb2RlbCgpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgeyBlZGl0U3RhdGUgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGNvbnN0IHJvb20gPSB0aGlzLmdldFJvb20oKTtcbiAgICAgICAgY29uc3QgcGFydENyZWF0b3IgPSBuZXcgQ29tbWFuZFBhcnRDcmVhdG9yKHJvb20sIHRoaXMucHJvcHMubXhDbGllbnQpO1xuXG4gICAgICAgIGxldCBwYXJ0czogUGFydFtdO1xuICAgICAgICBsZXQgaXNSZXN0b3JlZCA9IGZhbHNlO1xuICAgICAgICBpZiAoZWRpdFN0YXRlLmhhc0VkaXRvclN0YXRlKCkpIHtcbiAgICAgICAgICAgIC8vIGlmIHJlc3RvcmluZyBzdGF0ZSBmcm9tIGEgcHJldmlvdXMgZWRpdG9yLFxuICAgICAgICAgICAgLy8gcmVzdG9yZSBzZXJpYWxpemVkIHBhcnRzIGZyb20gdGhlIHN0YXRlXG4gICAgICAgICAgICBwYXJ0cyA9IGVkaXRTdGF0ZS5nZXRTZXJpYWxpemVkUGFydHMoKS5tYXAocCA9PiBwYXJ0Q3JlYXRvci5kZXNlcmlhbGl6ZVBhcnQocCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlLCBlaXRoZXIgcmVzdG9yZSBzZXJpYWxpemVkIHBhcnRzIGZyb20gbG9jYWxTdG9yYWdlIG9yIHBhcnNlIHRoZSBib2R5IG9mIHRoZSBldmVudFxuICAgICAgICAgICAgY29uc3QgcmVzdG9yZWRQYXJ0cyA9IHRoaXMucmVzdG9yZVN0b3JlZEVkaXRvclN0YXRlKHBhcnRDcmVhdG9yKTtcbiAgICAgICAgICAgIHBhcnRzID0gcmVzdG9yZWRQYXJ0cyB8fCBwYXJzZUV2ZW50KGVkaXRTdGF0ZS5nZXRFdmVudCgpLCBwYXJ0Q3JlYXRvciwge1xuICAgICAgICAgICAgICAgIHNob3VsZEVzY2FwZTogU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcIk1lc3NhZ2VDb21wb3NlcklucHV0LnVzZU1hcmtkb3duXCIpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpc1Jlc3RvcmVkID0gISFyZXN0b3JlZFBhcnRzO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubW9kZWwgPSBuZXcgRWRpdG9yTW9kZWwocGFydHMsIHBhcnRDcmVhdG9yKTtcbiAgICAgICAgdGhpcy5zYXZlU3RvcmVkRWRpdG9yU3RhdGUoKTtcblxuICAgICAgICByZXR1cm4gaXNSZXN0b3JlZDtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQ2hhbmdlID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuc2F2ZURpc2FibGVkIHx8ICF0aGlzLmVkaXRvclJlZi5jdXJyZW50Py5pc01vZGlmaWVkKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2F2ZURpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25BY3Rpb24gPSAocGF5bG9hZDogQWN0aW9uUGF5bG9hZCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuZWRpdG9yUmVmLmN1cnJlbnQpIHJldHVybjtcblxuICAgICAgICBpZiAocGF5bG9hZC5hY3Rpb24gPT09IEFjdGlvbi5Db21wb3Nlckluc2VydCkge1xuICAgICAgICAgICAgaWYgKHBheWxvYWQudGltZWxpbmVSZW5kZXJpbmdUeXBlICE9PSB0aGlzLmNvbnRleHQudGltZWxpbmVSZW5kZXJpbmdUeXBlKSByZXR1cm47XG4gICAgICAgICAgICBpZiAocGF5bG9hZC5jb21wb3NlclR5cGUgIT09IENvbXBvc2VyVHlwZS5FZGl0KSByZXR1cm47XG5cbiAgICAgICAgICAgIGlmIChwYXlsb2FkLnVzZXJJZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQ/Lmluc2VydE1lbnRpb24ocGF5bG9hZC51c2VySWQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwYXlsb2FkLmV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lZGl0b3JSZWYuY3VycmVudD8uaW5zZXJ0UXVvdGVkTWVzc2FnZShwYXlsb2FkLmV2ZW50KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocGF5bG9hZC50ZXh0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lZGl0b3JSZWYuY3VycmVudD8uaW5zZXJ0UGxhaW50ZXh0KHBheWxvYWQudGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAocGF5bG9hZC5hY3Rpb24gPT09IEFjdGlvbi5Gb2N1c0VkaXRNZXNzYWdlQ29tcG9zZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiAoPGRpdiBjbGFzc05hbWU9e2NsYXNzTmFtZXMoXCJteF9FZGl0TWVzc2FnZUNvbXBvc2VyXCIsIHRoaXMucHJvcHMuY2xhc3NOYW1lKX0gb25LZXlEb3duPXt0aGlzLm9uS2V5RG93bn0+XG4gICAgICAgICAgICA8QmFzaWNNZXNzYWdlQ29tcG9zZXJcbiAgICAgICAgICAgICAgICByZWY9e3RoaXMuZWRpdG9yUmVmfVxuICAgICAgICAgICAgICAgIG1vZGVsPXt0aGlzLm1vZGVsfVxuICAgICAgICAgICAgICAgIHJvb209e3RoaXMuZ2V0Um9vbSgpfVxuICAgICAgICAgICAgICAgIHRocmVhZElkPXt0aGlzLnByb3BzLmVkaXRTdGF0ZT8uZ2V0RXZlbnQoKT8uZ2V0VGhyZWFkKCk/LmlkfVxuICAgICAgICAgICAgICAgIGluaXRpYWxDYXJldD17dGhpcy5wcm9wcy5lZGl0U3RhdGUuZ2V0Q2FyZXQoKX1cbiAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJFZGl0IG1lc3NhZ2VcIil9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25DaGFuZ2V9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FZGl0TWVzc2FnZUNvbXBvc2VyX2J1dHRvbnNcIj5cbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwic2Vjb25kYXJ5XCIgb25DbGljaz17dGhpcy5jYW5jZWxFZGl0fT5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIkNhbmNlbFwiKSB9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9XCJwcmltYXJ5XCIgb25DbGljaz17dGhpcy5zZW5kRWRpdH0gZGlzYWJsZWQ9e3RoaXMuc3RhdGUuc2F2ZURpc2FibGVkfT5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIlNhdmVcIikgfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj4pO1xuICAgIH1cbn1cblxuY29uc3QgRWRpdE1lc3NhZ2VDb21wb3NlcldpdGhNYXRyaXhDbGllbnQgPSB3aXRoTWF0cml4Q2xpZW50SE9DKEVkaXRNZXNzYWdlQ29tcG9zZXIpO1xuZXhwb3J0IGRlZmF1bHQgRWRpdE1lc3NhZ2VDb21wb3NlcldpdGhNYXRyaXhDbGllbnQ7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUVB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