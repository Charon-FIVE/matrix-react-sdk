"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _event = require("matrix-js-sdk/src/@types/event");

var _thread = require("matrix-js-sdk/src/models/thread");

var _languageHandler = require("../../../languageHandler");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _Stickerpicker = _interopRequireDefault(require("./Stickerpicker"));

var _Permalinks = require("../../../utils/permalinks/Permalinks");

var _E2EIcon = _interopRequireDefault(require("./E2EIcon"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _ContextMenu = require("../../structures/ContextMenu");

var _AccessibleTooltipButton = _interopRequireDefault(require("../elements/AccessibleTooltipButton"));

var _ReplyPreview = _interopRequireDefault(require("./ReplyPreview"));

var _AsyncStore = require("../../../stores/AsyncStore");

var _VoiceRecordComposerTile = _interopRequireDefault(require("./VoiceRecordComposerTile"));

var _VoiceRecordingStore = require("../../../stores/VoiceRecordingStore");

var _VoiceRecording = require("../../../audio/VoiceRecording");

var _Tooltip = _interopRequireWildcard(require("../elements/Tooltip"));

var _SendMessageComposer = _interopRequireDefault(require("./SendMessageComposer"));

var _actions = require("../../../dispatcher/actions");

var _UIStore = _interopRequireWildcard(require("../../../stores/UIStore"));

var _RoomContext = _interopRequireDefault(require("../../../contexts/RoomContext"));

var _MessageComposerButtons = _interopRequireDefault(require("./MessageComposerButtons"));

var _isLocalRoom = require("../../../utils/localRoom/isLocalRoom");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2015 - 2022 The Matrix.org Foundation C.I.C.

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
let instanceCount = 0;

function SendButton(props) {
  return /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
    className: "mx_MessageComposer_sendMessage",
    onClick: props.onClick,
    title: props.title ?? (0, _languageHandler._t)('Send message')
  });
}

class MessageComposer extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "messageComposerInput", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "voiceRecordingButton", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "ref", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "instanceId", void 0);
    (0, _defineProperty2.default)(this, "_voiceRecording", void 0);
    (0, _defineProperty2.default)(this, "context", void 0);
    (0, _defineProperty2.default)(this, "onResize", (type, entry) => {
      if (type === _UIStore.UI_EVENTS.Resize) {
        const {
          narrow
        } = this.context;
        this.setState({
          isMenuOpen: !narrow ? false : this.state.isMenuOpen,
          isStickerPickerOpen: false
        });
      }
    });
    (0, _defineProperty2.default)(this, "onAction", payload => {
      switch (payload.action) {
        case "reply_to_event":
          if (payload.context === this.context.timelineRenderingType) {
            // add a timeout for the reply preview to be rendered, so
            // that the ScrollPanel listening to the resizeNotifier can
            // correctly measure it's new height and scroll down to keep
            // at the bottom if it already is
            setTimeout(() => {
              this.props.resizeNotifier.notifyTimelineHeightChanged();
            }, 100);
          }

          break;

        case _actions.Action.SettingUpdated:
          {
            const settingUpdatedPayload = payload;

            switch (settingUpdatedPayload.settingName) {
              case "MessageComposerInput.showStickersButton":
                {
                  const showStickersButton = _SettingsStore.default.getValue("MessageComposerInput.showStickersButton");

                  if (this.state.showStickersButton !== showStickersButton) {
                    this.setState({
                      showStickersButton
                    });
                  }

                  break;
                }

              case "MessageComposerInput.showPollsButton":
                {
                  const showPollsButton = _SettingsStore.default.getValue("MessageComposerInput.showPollsButton");

                  if (this.state.showPollsButton !== showPollsButton) {
                    this.setState({
                      showPollsButton
                    });
                  }

                  break;
                }
            }
          }
      }
    });
    (0, _defineProperty2.default)(this, "onTombstoneClick", ev => {
      ev.preventDefault();
      const replacementRoomId = this.context.tombstone.getContent()['replacement_room'];

      const replacementRoom = _MatrixClientPeg.MatrixClientPeg.get().getRoom(replacementRoomId);

      let createEventId = null;

      if (replacementRoom) {
        const createEvent = replacementRoom.currentState.getStateEvents(_event.EventType.RoomCreate, '');
        if (createEvent && createEvent.getId()) createEventId = createEvent.getId();
      }

      const viaServers = [this.context.tombstone.getSender().split(':').slice(1).join(':')];

      _dispatcher.default.dispatch({
        action: _actions.Action.ViewRoom,
        highlighted: true,
        event_id: createEventId,
        room_id: replacementRoomId,
        auto_join: true,
        // Try to join via the server that sent the event. This converts @something:example.org
        // into a server domain by splitting on colons and ignoring the first entry ("@something").
        via_servers: viaServers,
        metricsTrigger: "Tombstone",
        metricsViaKeyboard: ev.type !== "click"
      });
    });
    (0, _defineProperty2.default)(this, "renderPlaceholderText", () => {
      if (this.props.replyToEvent) {
        const replyingToThread = this.props.relation?.rel_type === _thread.THREAD_RELATION_TYPE.name;

        if (replyingToThread && this.props.e2eStatus) {
          return (0, _languageHandler._t)('Reply to encrypted thread…');
        } else if (replyingToThread) {
          return (0, _languageHandler._t)('Reply to thread…');
        } else if (this.props.e2eStatus) {
          return (0, _languageHandler._t)('Send an encrypted reply…');
        } else {
          return (0, _languageHandler._t)('Send a reply…');
        }
      } else {
        if (this.props.e2eStatus) {
          return (0, _languageHandler._t)('Send an encrypted message…');
        } else {
          return (0, _languageHandler._t)('Send a message…');
        }
      }
    });
    (0, _defineProperty2.default)(this, "addEmoji", emoji => {
      _dispatcher.default.dispatch({
        action: _actions.Action.ComposerInsert,
        text: emoji,
        timelineRenderingType: this.context.timelineRenderingType
      });

      return true;
    });
    (0, _defineProperty2.default)(this, "sendMessage", async () => {
      if (this.state.haveRecording && this.voiceRecordingButton.current) {
        // There shouldn't be any text message to send when a voice recording is active, so
        // just send out the voice recording.
        await this.voiceRecordingButton.current?.send();
        return;
      }

      this.messageComposerInput.current?.sendMessage();
    });
    (0, _defineProperty2.default)(this, "onChange", model => {
      this.setState({
        isComposerEmpty: model.isEmpty
      });
    });
    (0, _defineProperty2.default)(this, "onVoiceStoreUpdate", () => {
      this.updateRecordingState();
    });
    (0, _defineProperty2.default)(this, "onRecordingStarted", () => {
      // update the recording instance, just in case
      const voiceRecordingId = _VoiceRecordingStore.VoiceRecordingStore.getVoiceRecordingId(this.props.room, this.props.relation);

      this.voiceRecording = _VoiceRecordingStore.VoiceRecordingStore.instance.getActiveRecording(voiceRecordingId);
      this.setState({
        haveRecording: !!this.voiceRecording
      });
    });
    (0, _defineProperty2.default)(this, "onRecordingEndingSoon", _ref => {
      let {
        secondsLeft
      } = _ref;
      this.setState({
        recordingTimeLeftSeconds: secondsLeft
      });
      setTimeout(() => this.setState({
        recordingTimeLeftSeconds: null
      }), 3000);
    });
    (0, _defineProperty2.default)(this, "setStickerPickerOpen", isStickerPickerOpen => {
      this.setState({
        isStickerPickerOpen,
        isMenuOpen: false
      });
    });
    (0, _defineProperty2.default)(this, "toggleStickerPickerOpen", () => {
      this.setStickerPickerOpen(!this.state.isStickerPickerOpen);
    });
    (0, _defineProperty2.default)(this, "toggleButtonMenu", () => {
      this.setState({
        isMenuOpen: !this.state.isMenuOpen
      });
    });

    _VoiceRecordingStore.VoiceRecordingStore.instance.on(_AsyncStore.UPDATE_EVENT, this.onVoiceStoreUpdate);

    this.state = {
      isComposerEmpty: true,
      haveRecording: false,
      recordingTimeLeftSeconds: null,
      // when set to a number, shows a toast
      isMenuOpen: false,
      isStickerPickerOpen: false,
      showStickersButton: _SettingsStore.default.getValue("MessageComposerInput.showStickersButton"),
      showPollsButton: _SettingsStore.default.getValue("MessageComposerInput.showPollsButton")
    };
    this.instanceId = instanceCount++;

    _SettingsStore.default.monitorSetting("MessageComposerInput.showStickersButton", null);

    _SettingsStore.default.monitorSetting("MessageComposerInput.showPollsButton", null);
  }

  get voiceRecording() {
    return this._voiceRecording;
  }

  set voiceRecording(rec) {
    if (this._voiceRecording) {
      this._voiceRecording.off(_VoiceRecording.RecordingState.Started, this.onRecordingStarted);

      this._voiceRecording.off(_VoiceRecording.RecordingState.EndingSoon, this.onRecordingEndingSoon);
    }

    this._voiceRecording = rec;

    if (rec) {
      // Delay saying we have a recording until it is started, as we might not yet
      // have A/V permissions
      rec.on(_VoiceRecording.RecordingState.Started, this.onRecordingStarted); // We show a little heads up that the recording is about to automatically end soon. The 3s
      // display time is completely arbitrary.

      rec.on(_VoiceRecording.RecordingState.EndingSoon, this.onRecordingEndingSoon);
    }
  }

  componentDidMount() {
    this.dispatcherRef = _dispatcher.default.register(this.onAction);
    this.waitForOwnMember();

    _UIStore.default.instance.trackElementDimensions(`MessageComposer${this.instanceId}`, this.ref.current);

    _UIStore.default.instance.on(`MessageComposer${this.instanceId}`, this.onResize);

    this.updateRecordingState(); // grab any cached recordings
  }

  waitForOwnMember() {
    // if we have the member already, do that
    const me = this.props.room.getMember(_MatrixClientPeg.MatrixClientPeg.get().getUserId());

    if (me) {
      this.setState({
        me
      });
      return;
    } // Otherwise, wait for member loading to finish and then update the member for the avatar.
    // The members should already be loading, and loadMembersIfNeeded
    // will return the promise for the existing operation


    this.props.room.loadMembersIfNeeded().then(() => {
      const me = this.props.room.getMember(_MatrixClientPeg.MatrixClientPeg.get().getUserId());
      this.setState({
        me
      });
    });
  }

  componentWillUnmount() {
    _VoiceRecordingStore.VoiceRecordingStore.instance.off(_AsyncStore.UPDATE_EVENT, this.onVoiceStoreUpdate);

    _dispatcher.default.unregister(this.dispatcherRef);

    _UIStore.default.instance.stopTrackingElementDimensions(`MessageComposer${this.instanceId}`);

    _UIStore.default.instance.removeListener(`MessageComposer${this.instanceId}`, this.onResize); // clean up our listeners by setting our cached recording to falsy (see internal setter)


    this.voiceRecording = null;
  }

  updateRecordingState() {
    const voiceRecordingId = _VoiceRecordingStore.VoiceRecordingStore.getVoiceRecordingId(this.props.room, this.props.relation);

    this.voiceRecording = _VoiceRecordingStore.VoiceRecordingStore.instance.getActiveRecording(voiceRecordingId);

    if (this.voiceRecording) {
      // If the recording has already started, it's probably a cached one.
      if (this.voiceRecording.hasRecording && !this.voiceRecording.isRecording) {
        this.setState({
          haveRecording: true
        });
      } // Note: Listeners for recording states are set by the `this.voiceRecording` setter.

    } else {
      this.setState({
        haveRecording: false
      });
    }
  }

  get showStickersButton() {
    return this.state.showStickersButton && !(0, _isLocalRoom.isLocalRoom)(this.props.room);
  }

  render() {
    const controls = [this.props.e2eStatus ? /*#__PURE__*/_react.default.createElement(_E2EIcon.default, {
      key: "e2eIcon",
      status: this.props.e2eStatus,
      className: "mx_MessageComposer_e2eIcon"
    }) : null];
    let menuPosition;

    if (this.ref.current) {
      const contentRect = this.ref.current.getBoundingClientRect();
      menuPosition = (0, _ContextMenu.aboveLeftOf)(contentRect);
    }

    const canSendMessages = this.context.canSendMessages && !this.context.tombstone;

    if (canSendMessages) {
      controls.push( /*#__PURE__*/_react.default.createElement(_SendMessageComposer.default, {
        ref: this.messageComposerInput,
        key: "controls_input",
        room: this.props.room,
        placeholder: this.renderPlaceholderText(),
        permalinkCreator: this.props.permalinkCreator,
        relation: this.props.relation,
        replyToEvent: this.props.replyToEvent,
        onChange: this.onChange,
        disabled: this.state.haveRecording,
        toggleStickerPickerOpen: this.toggleStickerPickerOpen
      }));
      controls.push( /*#__PURE__*/_react.default.createElement(_VoiceRecordComposerTile.default, {
        key: "controls_voice_record",
        ref: this.voiceRecordingButton,
        room: this.props.room,
        permalinkCreator: this.props.permalinkCreator,
        relation: this.props.relation,
        replyToEvent: this.props.replyToEvent
      }));
    } else if (this.context.tombstone) {
      const replacementRoomId = this.context.tombstone.getContent()['replacement_room'];
      const continuesLink = replacementRoomId ? /*#__PURE__*/_react.default.createElement("a", {
        href: (0, _Permalinks.makeRoomPermalink)(replacementRoomId),
        className: "mx_MessageComposer_roomReplaced_link",
        onClick: this.onTombstoneClick
      }, (0, _languageHandler._t)("The conversation continues here.")) : '';
      controls.push( /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_MessageComposer_replaced_wrapper",
        key: "room_replaced"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_MessageComposer_replaced_valign"
      }, /*#__PURE__*/_react.default.createElement("img", {
        className: "mx_MessageComposer_roomReplaced_icon",
        src: require("../../../../res/img/room_replaced.svg").default
      }), /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_MessageComposer_roomReplaced_header"
      }, (0, _languageHandler._t)("This room has been replaced and is no longer active.")), /*#__PURE__*/_react.default.createElement("br", null), continuesLink)));
    } else {
      controls.push( /*#__PURE__*/_react.default.createElement("div", {
        key: "controls_error",
        className: "mx_MessageComposer_noperm_error"
      }, (0, _languageHandler._t)('You do not have permission to post to this room')));
    }

    let recordingTooltip;
    const secondsLeft = Math.round(this.state.recordingTimeLeftSeconds);

    if (secondsLeft) {
      recordingTooltip = /*#__PURE__*/_react.default.createElement(_Tooltip.default, {
        label: (0, _languageHandler._t)("%(seconds)ss left", {
          seconds: secondsLeft
        }),
        alignment: _Tooltip.Alignment.Top
      });
    }

    const threadId = this.props.relation?.rel_type === _thread.THREAD_RELATION_TYPE.name ? this.props.relation.event_id : null;
    controls.push( /*#__PURE__*/_react.default.createElement(_Stickerpicker.default, {
      room: this.props.room,
      threadId: threadId,
      isStickerPickerOpen: this.state.isStickerPickerOpen,
      setStickerPickerOpen: this.setStickerPickerOpen,
      menuPosition: menuPosition,
      key: "stickers"
    }));
    const showSendButton = !this.state.isComposerEmpty || this.state.haveRecording;
    const classes = (0, _classnames.default)({
      "mx_MessageComposer": true,
      "mx_MessageComposer--compact": this.props.compact,
      "mx_MessageComposer_e2eStatus": this.props.e2eStatus != undefined
    });
    return /*#__PURE__*/_react.default.createElement("div", {
      className: classes,
      ref: this.ref
    }, recordingTooltip, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MessageComposer_wrapper"
    }, /*#__PURE__*/_react.default.createElement(_ReplyPreview.default, {
      replyToEvent: this.props.replyToEvent,
      permalinkCreator: this.props.permalinkCreator
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MessageComposer_row"
    }, controls, canSendMessages && /*#__PURE__*/_react.default.createElement(_MessageComposerButtons.default, {
      addEmoji: this.addEmoji,
      haveRecording: this.state.haveRecording,
      isMenuOpen: this.state.isMenuOpen,
      isStickerPickerOpen: this.state.isStickerPickerOpen,
      menuPosition: menuPosition,
      relation: this.props.relation,
      onRecordStartEndClick: () => {
        this.voiceRecordingButton.current?.onRecordStartEndClick();

        if (this.context.narrow) {
          this.toggleButtonMenu();
        }
      },
      setStickerPickerOpen: this.setStickerPickerOpen,
      showLocationButton: !window.electron,
      showPollsButton: this.state.showPollsButton,
      showStickersButton: this.showStickersButton,
      toggleButtonMenu: this.toggleButtonMenu
    }), showSendButton && /*#__PURE__*/_react.default.createElement(SendButton, {
      key: "controls_send",
      onClick: this.sendMessage,
      title: this.state.haveRecording ? (0, _languageHandler._t)("Send voice message") : undefined
    }))));
  }

}

exports.default = MessageComposer;
(0, _defineProperty2.default)(MessageComposer, "contextType", _RoomContext.default);
(0, _defineProperty2.default)(MessageComposer, "defaultProps", {
  compact: false
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpbnN0YW5jZUNvdW50IiwiU2VuZEJ1dHRvbiIsInByb3BzIiwib25DbGljayIsInRpdGxlIiwiX3QiLCJNZXNzYWdlQ29tcG9zZXIiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwiY3JlYXRlUmVmIiwidHlwZSIsImVudHJ5IiwiVUlfRVZFTlRTIiwiUmVzaXplIiwibmFycm93IiwiY29udGV4dCIsInNldFN0YXRlIiwiaXNNZW51T3BlbiIsInN0YXRlIiwiaXNTdGlja2VyUGlja2VyT3BlbiIsInBheWxvYWQiLCJhY3Rpb24iLCJ0aW1lbGluZVJlbmRlcmluZ1R5cGUiLCJzZXRUaW1lb3V0IiwicmVzaXplTm90aWZpZXIiLCJub3RpZnlUaW1lbGluZUhlaWdodENoYW5nZWQiLCJBY3Rpb24iLCJTZXR0aW5nVXBkYXRlZCIsInNldHRpbmdVcGRhdGVkUGF5bG9hZCIsInNldHRpbmdOYW1lIiwic2hvd1N0aWNrZXJzQnV0dG9uIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwic2hvd1BvbGxzQnV0dG9uIiwiZXYiLCJwcmV2ZW50RGVmYXVsdCIsInJlcGxhY2VtZW50Um9vbUlkIiwidG9tYnN0b25lIiwiZ2V0Q29udGVudCIsInJlcGxhY2VtZW50Um9vbSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImdldFJvb20iLCJjcmVhdGVFdmVudElkIiwiY3JlYXRlRXZlbnQiLCJjdXJyZW50U3RhdGUiLCJnZXRTdGF0ZUV2ZW50cyIsIkV2ZW50VHlwZSIsIlJvb21DcmVhdGUiLCJnZXRJZCIsInZpYVNlcnZlcnMiLCJnZXRTZW5kZXIiLCJzcGxpdCIsInNsaWNlIiwiam9pbiIsImRpcyIsImRpc3BhdGNoIiwiVmlld1Jvb20iLCJoaWdobGlnaHRlZCIsImV2ZW50X2lkIiwicm9vbV9pZCIsImF1dG9fam9pbiIsInZpYV9zZXJ2ZXJzIiwibWV0cmljc1RyaWdnZXIiLCJtZXRyaWNzVmlhS2V5Ym9hcmQiLCJyZXBseVRvRXZlbnQiLCJyZXBseWluZ1RvVGhyZWFkIiwicmVsYXRpb24iLCJyZWxfdHlwZSIsIlRIUkVBRF9SRUxBVElPTl9UWVBFIiwibmFtZSIsImUyZVN0YXR1cyIsImVtb2ppIiwiQ29tcG9zZXJJbnNlcnQiLCJ0ZXh0IiwiaGF2ZVJlY29yZGluZyIsInZvaWNlUmVjb3JkaW5nQnV0dG9uIiwiY3VycmVudCIsInNlbmQiLCJtZXNzYWdlQ29tcG9zZXJJbnB1dCIsInNlbmRNZXNzYWdlIiwibW9kZWwiLCJpc0NvbXBvc2VyRW1wdHkiLCJpc0VtcHR5IiwidXBkYXRlUmVjb3JkaW5nU3RhdGUiLCJ2b2ljZVJlY29yZGluZ0lkIiwiVm9pY2VSZWNvcmRpbmdTdG9yZSIsImdldFZvaWNlUmVjb3JkaW5nSWQiLCJyb29tIiwidm9pY2VSZWNvcmRpbmciLCJpbnN0YW5jZSIsImdldEFjdGl2ZVJlY29yZGluZyIsInNlY29uZHNMZWZ0IiwicmVjb3JkaW5nVGltZUxlZnRTZWNvbmRzIiwic2V0U3RpY2tlclBpY2tlck9wZW4iLCJvbiIsIlVQREFURV9FVkVOVCIsIm9uVm9pY2VTdG9yZVVwZGF0ZSIsImluc3RhbmNlSWQiLCJtb25pdG9yU2V0dGluZyIsIl92b2ljZVJlY29yZGluZyIsInJlYyIsIm9mZiIsIlJlY29yZGluZ1N0YXRlIiwiU3RhcnRlZCIsIm9uUmVjb3JkaW5nU3RhcnRlZCIsIkVuZGluZ1Nvb24iLCJvblJlY29yZGluZ0VuZGluZ1Nvb24iLCJjb21wb25lbnREaWRNb3VudCIsImRpc3BhdGNoZXJSZWYiLCJyZWdpc3RlciIsIm9uQWN0aW9uIiwid2FpdEZvck93bk1lbWJlciIsIlVJU3RvcmUiLCJ0cmFja0VsZW1lbnREaW1lbnNpb25zIiwicmVmIiwib25SZXNpemUiLCJtZSIsImdldE1lbWJlciIsImdldFVzZXJJZCIsImxvYWRNZW1iZXJzSWZOZWVkZWQiLCJ0aGVuIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJ1bnJlZ2lzdGVyIiwic3RvcFRyYWNraW5nRWxlbWVudERpbWVuc2lvbnMiLCJyZW1vdmVMaXN0ZW5lciIsImhhc1JlY29yZGluZyIsImlzUmVjb3JkaW5nIiwiaXNMb2NhbFJvb20iLCJyZW5kZXIiLCJjb250cm9scyIsIm1lbnVQb3NpdGlvbiIsImNvbnRlbnRSZWN0IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiYWJvdmVMZWZ0T2YiLCJjYW5TZW5kTWVzc2FnZXMiLCJwdXNoIiwicmVuZGVyUGxhY2Vob2xkZXJUZXh0IiwicGVybWFsaW5rQ3JlYXRvciIsIm9uQ2hhbmdlIiwidG9nZ2xlU3RpY2tlclBpY2tlck9wZW4iLCJjb250aW51ZXNMaW5rIiwibWFrZVJvb21QZXJtYWxpbmsiLCJvblRvbWJzdG9uZUNsaWNrIiwicmVxdWlyZSIsImRlZmF1bHQiLCJyZWNvcmRpbmdUb29sdGlwIiwiTWF0aCIsInJvdW5kIiwic2Vjb25kcyIsIkFsaWdubWVudCIsIlRvcCIsInRocmVhZElkIiwic2hvd1NlbmRCdXR0b24iLCJjbGFzc2VzIiwiY2xhc3NOYW1lcyIsImNvbXBhY3QiLCJ1bmRlZmluZWQiLCJhZGRFbW9qaSIsIm9uUmVjb3JkU3RhcnRFbmRDbGljayIsInRvZ2dsZUJ1dHRvbk1lbnUiLCJ3aW5kb3ciLCJlbGVjdHJvbiIsIlJvb21Db250ZXh0Il0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3Mvcm9vbXMvTWVzc2FnZUNvbXBvc2VyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUgLSAyMDIyIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IGNyZWF0ZVJlZiB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHsgSUV2ZW50UmVsYXRpb24sIE1hdHJpeEV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudFwiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuaW1wb3J0IHsgUm9vbU1lbWJlciB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbS1tZW1iZXJcIjtcbmltcG9ydCB7IEV2ZW50VHlwZSB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9ldmVudCc7XG5pbXBvcnQgeyBPcHRpb25hbCB9IGZyb20gXCJtYXRyaXgtZXZlbnRzLXNka1wiO1xuaW1wb3J0IHsgVEhSRUFEX1JFTEFUSU9OX1RZUEUgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvdGhyZWFkJztcblxuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSAnLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCBkaXMgZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCB7IEFjdGlvblBheWxvYWQgfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkc1wiO1xuaW1wb3J0IFN0aWNrZXJwaWNrZXIgZnJvbSAnLi9TdGlja2VycGlja2VyJztcbmltcG9ydCB7IG1ha2VSb29tUGVybWFsaW5rLCBSb29tUGVybWFsaW5rQ3JlYXRvciB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3Blcm1hbGlua3MvUGVybWFsaW5rcyc7XG5pbXBvcnQgRTJFSWNvbiBmcm9tICcuL0UyRUljb24nO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCB7IGFib3ZlTGVmdE9mLCBBYm92ZUxlZnRPZiB9IGZyb20gXCIuLi8uLi9zdHJ1Y3R1cmVzL0NvbnRleHRNZW51XCI7XG5pbXBvcnQgQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVUb29sdGlwQnV0dG9uXCI7XG5pbXBvcnQgUmVwbHlQcmV2aWV3IGZyb20gXCIuL1JlcGx5UHJldmlld1wiO1xuaW1wb3J0IHsgVVBEQVRFX0VWRU5UIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9Bc3luY1N0b3JlXCI7XG5pbXBvcnQgVm9pY2VSZWNvcmRDb21wb3NlclRpbGUgZnJvbSBcIi4vVm9pY2VSZWNvcmRDb21wb3NlclRpbGVcIjtcbmltcG9ydCB7IFZvaWNlUmVjb3JkaW5nU3RvcmUgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL1ZvaWNlUmVjb3JkaW5nU3RvcmVcIjtcbmltcG9ydCB7IFJlY29yZGluZ1N0YXRlLCBWb2ljZVJlY29yZGluZyB9IGZyb20gXCIuLi8uLi8uLi9hdWRpby9Wb2ljZVJlY29yZGluZ1wiO1xuaW1wb3J0IFRvb2x0aXAsIHsgQWxpZ25tZW50IH0gZnJvbSBcIi4uL2VsZW1lbnRzL1Rvb2x0aXBcIjtcbmltcG9ydCBSZXNpemVOb3RpZmllciBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvUmVzaXplTm90aWZpZXJcIjtcbmltcG9ydCB7IEUyRVN0YXR1cyB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL1NoaWVsZFV0aWxzJztcbmltcG9ydCBTZW5kTWVzc2FnZUNvbXBvc2VyLCB7IFNlbmRNZXNzYWdlQ29tcG9zZXIgYXMgU2VuZE1lc3NhZ2VDb21wb3NlckNsYXNzIH0gZnJvbSBcIi4vU2VuZE1lc3NhZ2VDb21wb3NlclwiO1xuaW1wb3J0IHsgQ29tcG9zZXJJbnNlcnRQYXlsb2FkIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvQ29tcG9zZXJJbnNlcnRQYXlsb2FkXCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQgRWRpdG9yTW9kZWwgZnJvbSBcIi4uLy4uLy4uL2VkaXRvci9tb2RlbFwiO1xuaW1wb3J0IFVJU3RvcmUsIHsgVUlfRVZFTlRTIH0gZnJvbSAnLi4vLi4vLi4vc3RvcmVzL1VJU3RvcmUnO1xuaW1wb3J0IFJvb21Db250ZXh0IGZyb20gJy4uLy4uLy4uL2NvbnRleHRzL1Jvb21Db250ZXh0JztcbmltcG9ydCB7IFNldHRpbmdVcGRhdGVkUGF5bG9hZCB9IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL3BheWxvYWRzL1NldHRpbmdVcGRhdGVkUGF5bG9hZFwiO1xuaW1wb3J0IE1lc3NhZ2VDb21wb3NlckJ1dHRvbnMgZnJvbSAnLi9NZXNzYWdlQ29tcG9zZXJCdXR0b25zJztcbmltcG9ydCB7IEJ1dHRvbkV2ZW50IH0gZnJvbSAnLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvbic7XG5pbXBvcnQgeyBWaWV3Um9vbVBheWxvYWQgfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9WaWV3Um9vbVBheWxvYWRcIjtcbmltcG9ydCB7IGlzTG9jYWxSb29tIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvbG9jYWxSb29tL2lzTG9jYWxSb29tJztcblxubGV0IGluc3RhbmNlQ291bnQgPSAwO1xuXG5pbnRlcmZhY2UgSVNlbmRCdXR0b25Qcm9wcyB7XG4gICAgb25DbGljazogKGV2OiBCdXR0b25FdmVudCkgPT4gdm9pZDtcbiAgICB0aXRsZT86IHN0cmluZzsgLy8gZGVmYXVsdHMgdG8gc29tZXRoaW5nIGdlbmVyaWNcbn1cblxuZnVuY3Rpb24gU2VuZEJ1dHRvbihwcm9wczogSVNlbmRCdXR0b25Qcm9wcykge1xuICAgIHJldHVybiAoXG4gICAgICAgIDxBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTWVzc2FnZUNvbXBvc2VyX3NlbmRNZXNzYWdlXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9e3Byb3BzLm9uQ2xpY2t9XG4gICAgICAgICAgICB0aXRsZT17cHJvcHMudGl0bGUgPz8gX3QoJ1NlbmQgbWVzc2FnZScpfVxuICAgICAgICAvPlxuICAgICk7XG59XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHJvb206IFJvb207XG4gICAgcmVzaXplTm90aWZpZXI6IFJlc2l6ZU5vdGlmaWVyO1xuICAgIHBlcm1hbGlua0NyZWF0b3I6IFJvb21QZXJtYWxpbmtDcmVhdG9yO1xuICAgIHJlcGx5VG9FdmVudD86IE1hdHJpeEV2ZW50O1xuICAgIHJlbGF0aW9uPzogSUV2ZW50UmVsYXRpb247XG4gICAgZTJlU3RhdHVzPzogRTJFU3RhdHVzO1xuICAgIGNvbXBhY3Q/OiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBpc0NvbXBvc2VyRW1wdHk6IGJvb2xlYW47XG4gICAgaGF2ZVJlY29yZGluZzogYm9vbGVhbjtcbiAgICByZWNvcmRpbmdUaW1lTGVmdFNlY29uZHM/OiBudW1iZXI7XG4gICAgbWU/OiBSb29tTWVtYmVyO1xuICAgIGlzTWVudU9wZW46IGJvb2xlYW47XG4gICAgaXNTdGlja2VyUGlja2VyT3BlbjogYm9vbGVhbjtcbiAgICBzaG93U3RpY2tlcnNCdXR0b246IGJvb2xlYW47XG4gICAgc2hvd1BvbGxzQnV0dG9uOiBib29sZWFuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNZXNzYWdlQ29tcG9zZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIGRpc3BhdGNoZXJSZWY6IHN0cmluZztcbiAgICBwcml2YXRlIG1lc3NhZ2VDb21wb3NlcklucHV0ID0gY3JlYXRlUmVmPFNlbmRNZXNzYWdlQ29tcG9zZXJDbGFzcz4oKTtcbiAgICBwcml2YXRlIHZvaWNlUmVjb3JkaW5nQnV0dG9uID0gY3JlYXRlUmVmPFZvaWNlUmVjb3JkQ29tcG9zZXJUaWxlPigpO1xuICAgIHByaXZhdGUgcmVmOiBSZWFjdC5SZWZPYmplY3Q8SFRNTERpdkVsZW1lbnQ+ID0gY3JlYXRlUmVmKCk7XG4gICAgcHJpdmF0ZSBpbnN0YW5jZUlkOiBudW1iZXI7XG5cbiAgICBwcml2YXRlIF92b2ljZVJlY29yZGluZzogT3B0aW9uYWw8Vm9pY2VSZWNvcmRpbmc+O1xuXG4gICAgcHVibGljIHN0YXRpYyBjb250ZXh0VHlwZSA9IFJvb21Db250ZXh0O1xuICAgIHB1YmxpYyBjb250ZXh0ITogUmVhY3QuQ29udGV4dFR5cGU8dHlwZW9mIFJvb21Db250ZXh0PjtcblxuICAgIHB1YmxpYyBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICBjb21wYWN0OiBmYWxzZSxcbiAgICB9O1xuXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHByb3BzOiBJUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICBWb2ljZVJlY29yZGluZ1N0b3JlLmluc3RhbmNlLm9uKFVQREFURV9FVkVOVCwgdGhpcy5vblZvaWNlU3RvcmVVcGRhdGUpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBpc0NvbXBvc2VyRW1wdHk6IHRydWUsXG4gICAgICAgICAgICBoYXZlUmVjb3JkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIHJlY29yZGluZ1RpbWVMZWZ0U2Vjb25kczogbnVsbCwgLy8gd2hlbiBzZXQgdG8gYSBudW1iZXIsIHNob3dzIGEgdG9hc3RcbiAgICAgICAgICAgIGlzTWVudU9wZW46IGZhbHNlLFxuICAgICAgICAgICAgaXNTdGlja2VyUGlja2VyT3BlbjogZmFsc2UsXG4gICAgICAgICAgICBzaG93U3RpY2tlcnNCdXR0b246IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJNZXNzYWdlQ29tcG9zZXJJbnB1dC5zaG93U3RpY2tlcnNCdXR0b25cIiksXG4gICAgICAgICAgICBzaG93UG9sbHNCdXR0b246IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJNZXNzYWdlQ29tcG9zZXJJbnB1dC5zaG93UG9sbHNCdXR0b25cIiksXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5pbnN0YW5jZUlkID0gaW5zdGFuY2VDb3VudCsrO1xuXG4gICAgICAgIFNldHRpbmdzU3RvcmUubW9uaXRvclNldHRpbmcoXCJNZXNzYWdlQ29tcG9zZXJJbnB1dC5zaG93U3RpY2tlcnNCdXR0b25cIiwgbnVsbCk7XG4gICAgICAgIFNldHRpbmdzU3RvcmUubW9uaXRvclNldHRpbmcoXCJNZXNzYWdlQ29tcG9zZXJJbnB1dC5zaG93UG9sbHNCdXR0b25cIiwgbnVsbCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXQgdm9pY2VSZWNvcmRpbmcoKTogT3B0aW9uYWw8Vm9pY2VSZWNvcmRpbmc+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZvaWNlUmVjb3JkaW5nO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2V0IHZvaWNlUmVjb3JkaW5nKHJlYzogT3B0aW9uYWw8Vm9pY2VSZWNvcmRpbmc+KSB7XG4gICAgICAgIGlmICh0aGlzLl92b2ljZVJlY29yZGluZykge1xuICAgICAgICAgICAgdGhpcy5fdm9pY2VSZWNvcmRpbmcub2ZmKFJlY29yZGluZ1N0YXRlLlN0YXJ0ZWQsIHRoaXMub25SZWNvcmRpbmdTdGFydGVkKTtcbiAgICAgICAgICAgIHRoaXMuX3ZvaWNlUmVjb3JkaW5nLm9mZihSZWNvcmRpbmdTdGF0ZS5FbmRpbmdTb29uLCB0aGlzLm9uUmVjb3JkaW5nRW5kaW5nU29vbik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl92b2ljZVJlY29yZGluZyA9IHJlYztcblxuICAgICAgICBpZiAocmVjKSB7XG4gICAgICAgICAgICAvLyBEZWxheSBzYXlpbmcgd2UgaGF2ZSBhIHJlY29yZGluZyB1bnRpbCBpdCBpcyBzdGFydGVkLCBhcyB3ZSBtaWdodCBub3QgeWV0XG4gICAgICAgICAgICAvLyBoYXZlIEEvViBwZXJtaXNzaW9uc1xuICAgICAgICAgICAgcmVjLm9uKFJlY29yZGluZ1N0YXRlLlN0YXJ0ZWQsIHRoaXMub25SZWNvcmRpbmdTdGFydGVkKTtcblxuICAgICAgICAgICAgLy8gV2Ugc2hvdyBhIGxpdHRsZSBoZWFkcyB1cCB0aGF0IHRoZSByZWNvcmRpbmcgaXMgYWJvdXQgdG8gYXV0b21hdGljYWxseSBlbmQgc29vbi4gVGhlIDNzXG4gICAgICAgICAgICAvLyBkaXNwbGF5IHRpbWUgaXMgY29tcGxldGVseSBhcmJpdHJhcnkuXG4gICAgICAgICAgICByZWMub24oUmVjb3JkaW5nU3RhdGUuRW5kaW5nU29vbiwgdGhpcy5vblJlY29yZGluZ0VuZGluZ1Nvb24pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXJSZWYgPSBkaXMucmVnaXN0ZXIodGhpcy5vbkFjdGlvbik7XG4gICAgICAgIHRoaXMud2FpdEZvck93bk1lbWJlcigpO1xuICAgICAgICBVSVN0b3JlLmluc3RhbmNlLnRyYWNrRWxlbWVudERpbWVuc2lvbnMoYE1lc3NhZ2VDb21wb3NlciR7dGhpcy5pbnN0YW5jZUlkfWAsIHRoaXMucmVmLmN1cnJlbnQpO1xuICAgICAgICBVSVN0b3JlLmluc3RhbmNlLm9uKGBNZXNzYWdlQ29tcG9zZXIke3RoaXMuaW5zdGFuY2VJZH1gLCB0aGlzLm9uUmVzaXplKTtcbiAgICAgICAgdGhpcy51cGRhdGVSZWNvcmRpbmdTdGF0ZSgpOyAvLyBncmFiIGFueSBjYWNoZWQgcmVjb3JkaW5nc1xuICAgIH1cblxuICAgIHByaXZhdGUgb25SZXNpemUgPSAodHlwZTogVUlfRVZFTlRTLCBlbnRyeTogUmVzaXplT2JzZXJ2ZXJFbnRyeSkgPT4ge1xuICAgICAgICBpZiAodHlwZSA9PT0gVUlfRVZFTlRTLlJlc2l6ZSkge1xuICAgICAgICAgICAgY29uc3QgeyBuYXJyb3cgfSA9IHRoaXMuY29udGV4dDtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGlzTWVudU9wZW46ICFuYXJyb3cgPyBmYWxzZSA6IHRoaXMuc3RhdGUuaXNNZW51T3BlbixcbiAgICAgICAgICAgICAgICBpc1N0aWNrZXJQaWNrZXJPcGVuOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25BY3Rpb24gPSAocGF5bG9hZDogQWN0aW9uUGF5bG9hZCkgPT4ge1xuICAgICAgICBzd2l0Y2ggKHBheWxvYWQuYWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlIFwicmVwbHlfdG9fZXZlbnRcIjpcbiAgICAgICAgICAgICAgICBpZiAocGF5bG9hZC5jb250ZXh0ID09PSB0aGlzLmNvbnRleHQudGltZWxpbmVSZW5kZXJpbmdUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGFkZCBhIHRpbWVvdXQgZm9yIHRoZSByZXBseSBwcmV2aWV3IHRvIGJlIHJlbmRlcmVkLCBzb1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGF0IHRoZSBTY3JvbGxQYW5lbCBsaXN0ZW5pbmcgdG8gdGhlIHJlc2l6ZU5vdGlmaWVyIGNhblxuICAgICAgICAgICAgICAgICAgICAvLyBjb3JyZWN0bHkgbWVhc3VyZSBpdCdzIG5ldyBoZWlnaHQgYW5kIHNjcm9sbCBkb3duIHRvIGtlZXBcbiAgICAgICAgICAgICAgICAgICAgLy8gYXQgdGhlIGJvdHRvbSBpZiBpdCBhbHJlYWR5IGlzXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5yZXNpemVOb3RpZmllci5ub3RpZnlUaW1lbGluZUhlaWdodENoYW5nZWQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLlNldHRpbmdVcGRhdGVkOiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2V0dGluZ1VwZGF0ZWRQYXlsb2FkID0gcGF5bG9hZCBhcyBTZXR0aW5nVXBkYXRlZFBheWxvYWQ7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChzZXR0aW5nVXBkYXRlZFBheWxvYWQuc2V0dGluZ05hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIk1lc3NhZ2VDb21wb3NlcklucHV0LnNob3dTdGlja2Vyc0J1dHRvblwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzaG93U3RpY2tlcnNCdXR0b24gPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiTWVzc2FnZUNvbXBvc2VySW5wdXQuc2hvd1N0aWNrZXJzQnV0dG9uXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2hvd1N0aWNrZXJzQnV0dG9uICE9PSBzaG93U3RpY2tlcnNCdXR0b24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2hvd1N0aWNrZXJzQnV0dG9uIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIk1lc3NhZ2VDb21wb3NlcklucHV0LnNob3dQb2xsc0J1dHRvblwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzaG93UG9sbHNCdXR0b24gPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiTWVzc2FnZUNvbXBvc2VySW5wdXQuc2hvd1BvbGxzQnV0dG9uXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuc2hvd1BvbGxzQnV0dG9uICE9PSBzaG93UG9sbHNCdXR0b24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2hvd1BvbGxzQnV0dG9uIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSB3YWl0Rm9yT3duTWVtYmVyKCkge1xuICAgICAgICAvLyBpZiB3ZSBoYXZlIHRoZSBtZW1iZXIgYWxyZWFkeSwgZG8gdGhhdFxuICAgICAgICBjb25zdCBtZSA9IHRoaXMucHJvcHMucm9vbS5nZXRNZW1iZXIoTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpKTtcbiAgICAgICAgaWYgKG1lKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbWUgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCB3YWl0IGZvciBtZW1iZXIgbG9hZGluZyB0byBmaW5pc2ggYW5kIHRoZW4gdXBkYXRlIHRoZSBtZW1iZXIgZm9yIHRoZSBhdmF0YXIuXG4gICAgICAgIC8vIFRoZSBtZW1iZXJzIHNob3VsZCBhbHJlYWR5IGJlIGxvYWRpbmcsIGFuZCBsb2FkTWVtYmVyc0lmTmVlZGVkXG4gICAgICAgIC8vIHdpbGwgcmV0dXJuIHRoZSBwcm9taXNlIGZvciB0aGUgZXhpc3Rpbmcgb3BlcmF0aW9uXG4gICAgICAgIHRoaXMucHJvcHMucm9vbS5sb2FkTWVtYmVyc0lmTmVlZGVkKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBtZSA9IHRoaXMucHJvcHMucm9vbS5nZXRNZW1iZXIoTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtZSB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBWb2ljZVJlY29yZGluZ1N0b3JlLmluc3RhbmNlLm9mZihVUERBVEVfRVZFTlQsIHRoaXMub25Wb2ljZVN0b3JlVXBkYXRlKTtcbiAgICAgICAgZGlzLnVucmVnaXN0ZXIodGhpcy5kaXNwYXRjaGVyUmVmKTtcbiAgICAgICAgVUlTdG9yZS5pbnN0YW5jZS5zdG9wVHJhY2tpbmdFbGVtZW50RGltZW5zaW9ucyhgTWVzc2FnZUNvbXBvc2VyJHt0aGlzLmluc3RhbmNlSWR9YCk7XG4gICAgICAgIFVJU3RvcmUuaW5zdGFuY2UucmVtb3ZlTGlzdGVuZXIoYE1lc3NhZ2VDb21wb3NlciR7dGhpcy5pbnN0YW5jZUlkfWAsIHRoaXMub25SZXNpemUpO1xuXG4gICAgICAgIC8vIGNsZWFuIHVwIG91ciBsaXN0ZW5lcnMgYnkgc2V0dGluZyBvdXIgY2FjaGVkIHJlY29yZGluZyB0byBmYWxzeSAoc2VlIGludGVybmFsIHNldHRlcilcbiAgICAgICAgdGhpcy52b2ljZVJlY29yZGluZyA9IG51bGw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblRvbWJzdG9uZUNsaWNrID0gKGV2KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgY29uc3QgcmVwbGFjZW1lbnRSb29tSWQgPSB0aGlzLmNvbnRleHQudG9tYnN0b25lLmdldENvbnRlbnQoKVsncmVwbGFjZW1lbnRfcm9vbSddO1xuICAgICAgICBjb25zdCByZXBsYWNlbWVudFJvb20gPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0Um9vbShyZXBsYWNlbWVudFJvb21JZCk7XG4gICAgICAgIGxldCBjcmVhdGVFdmVudElkID0gbnVsbDtcbiAgICAgICAgaWYgKHJlcGxhY2VtZW50Um9vbSkge1xuICAgICAgICAgICAgY29uc3QgY3JlYXRlRXZlbnQgPSByZXBsYWNlbWVudFJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKEV2ZW50VHlwZS5Sb29tQ3JlYXRlLCAnJyk7XG4gICAgICAgICAgICBpZiAoY3JlYXRlRXZlbnQgJiYgY3JlYXRlRXZlbnQuZ2V0SWQoKSkgY3JlYXRlRXZlbnRJZCA9IGNyZWF0ZUV2ZW50LmdldElkKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB2aWFTZXJ2ZXJzID0gW3RoaXMuY29udGV4dC50b21ic3RvbmUuZ2V0U2VuZGVyKCkuc3BsaXQoJzonKS5zbGljZSgxKS5qb2luKCc6JyldO1xuICAgICAgICBkaXMuZGlzcGF0Y2g8Vmlld1Jvb21QYXlsb2FkPih7XG4gICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5WaWV3Um9vbSxcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkOiB0cnVlLFxuICAgICAgICAgICAgZXZlbnRfaWQ6IGNyZWF0ZUV2ZW50SWQsXG4gICAgICAgICAgICByb29tX2lkOiByZXBsYWNlbWVudFJvb21JZCxcbiAgICAgICAgICAgIGF1dG9fam9pbjogdHJ1ZSxcbiAgICAgICAgICAgIC8vIFRyeSB0byBqb2luIHZpYSB0aGUgc2VydmVyIHRoYXQgc2VudCB0aGUgZXZlbnQuIFRoaXMgY29udmVydHMgQHNvbWV0aGluZzpleGFtcGxlLm9yZ1xuICAgICAgICAgICAgLy8gaW50byBhIHNlcnZlciBkb21haW4gYnkgc3BsaXR0aW5nIG9uIGNvbG9ucyBhbmQgaWdub3JpbmcgdGhlIGZpcnN0IGVudHJ5IChcIkBzb21ldGhpbmdcIikuXG4gICAgICAgICAgICB2aWFfc2VydmVyczogdmlhU2VydmVycyxcbiAgICAgICAgICAgIG1ldHJpY3NUcmlnZ2VyOiBcIlRvbWJzdG9uZVwiLFxuICAgICAgICAgICAgbWV0cmljc1ZpYUtleWJvYXJkOiBldi50eXBlICE9PSBcImNsaWNrXCIsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHJlbmRlclBsYWNlaG9sZGVyVGV4dCA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMucmVwbHlUb0V2ZW50KSB7XG4gICAgICAgICAgICBjb25zdCByZXBseWluZ1RvVGhyZWFkID0gdGhpcy5wcm9wcy5yZWxhdGlvbj8ucmVsX3R5cGUgPT09IFRIUkVBRF9SRUxBVElPTl9UWVBFLm5hbWU7XG4gICAgICAgICAgICBpZiAocmVwbHlpbmdUb1RocmVhZCAmJiB0aGlzLnByb3BzLmUyZVN0YXR1cykge1xuICAgICAgICAgICAgICAgIHJldHVybiBfdCgnUmVwbHkgdG8gZW5jcnlwdGVkIHRocmVhZOKApicpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChyZXBseWluZ1RvVGhyZWFkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90KCdSZXBseSB0byB0aHJlYWTigKYnKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5lMmVTdGF0dXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3QoJ1NlbmQgYW4gZW5jcnlwdGVkIHJlcGx54oCmJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBfdCgnU2VuZCBhIHJlcGx54oCmJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5lMmVTdGF0dXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3QoJ1NlbmQgYW4gZW5jcnlwdGVkIG1lc3NhZ2XigKYnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90KCdTZW5kIGEgbWVzc2FnZeKApicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgYWRkRW1vamkgPSAoZW1vamk6IHN0cmluZyk6IGJvb2xlYW4gPT4ge1xuICAgICAgICBkaXMuZGlzcGF0Y2g8Q29tcG9zZXJJbnNlcnRQYXlsb2FkPih7XG4gICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5Db21wb3Nlckluc2VydCxcbiAgICAgICAgICAgIHRleHQ6IGVtb2ppLFxuICAgICAgICAgICAgdGltZWxpbmVSZW5kZXJpbmdUeXBlOiB0aGlzLmNvbnRleHQudGltZWxpbmVSZW5kZXJpbmdUeXBlLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIHByaXZhdGUgc2VuZE1lc3NhZ2UgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmhhdmVSZWNvcmRpbmcgJiYgdGhpcy52b2ljZVJlY29yZGluZ0J1dHRvbi5jdXJyZW50KSB7XG4gICAgICAgICAgICAvLyBUaGVyZSBzaG91bGRuJ3QgYmUgYW55IHRleHQgbWVzc2FnZSB0byBzZW5kIHdoZW4gYSB2b2ljZSByZWNvcmRpbmcgaXMgYWN0aXZlLCBzb1xuICAgICAgICAgICAgLy8ganVzdCBzZW5kIG91dCB0aGUgdm9pY2UgcmVjb3JkaW5nLlxuICAgICAgICAgICAgYXdhaXQgdGhpcy52b2ljZVJlY29yZGluZ0J1dHRvbi5jdXJyZW50Py5zZW5kKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm1lc3NhZ2VDb21wb3NlcklucHV0LmN1cnJlbnQ/LnNlbmRNZXNzYWdlKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25DaGFuZ2UgPSAobW9kZWw6IEVkaXRvck1vZGVsKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgaXNDb21wb3NlckVtcHR5OiBtb2RlbC5pc0VtcHR5LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblZvaWNlU3RvcmVVcGRhdGUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMudXBkYXRlUmVjb3JkaW5nU3RhdGUoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSB1cGRhdGVSZWNvcmRpbmdTdGF0ZSgpIHtcbiAgICAgICAgY29uc3Qgdm9pY2VSZWNvcmRpbmdJZCA9IFZvaWNlUmVjb3JkaW5nU3RvcmUuZ2V0Vm9pY2VSZWNvcmRpbmdJZCh0aGlzLnByb3BzLnJvb20sIHRoaXMucHJvcHMucmVsYXRpb24pO1xuICAgICAgICB0aGlzLnZvaWNlUmVjb3JkaW5nID0gVm9pY2VSZWNvcmRpbmdTdG9yZS5pbnN0YW5jZS5nZXRBY3RpdmVSZWNvcmRpbmcodm9pY2VSZWNvcmRpbmdJZCk7XG4gICAgICAgIGlmICh0aGlzLnZvaWNlUmVjb3JkaW5nKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGUgcmVjb3JkaW5nIGhhcyBhbHJlYWR5IHN0YXJ0ZWQsIGl0J3MgcHJvYmFibHkgYSBjYWNoZWQgb25lLlxuICAgICAgICAgICAgaWYgKHRoaXMudm9pY2VSZWNvcmRpbmcuaGFzUmVjb3JkaW5nICYmICF0aGlzLnZvaWNlUmVjb3JkaW5nLmlzUmVjb3JkaW5nKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGhhdmVSZWNvcmRpbmc6IHRydWUgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE5vdGU6IExpc3RlbmVycyBmb3IgcmVjb3JkaW5nIHN0YXRlcyBhcmUgc2V0IGJ5IHRoZSBgdGhpcy52b2ljZVJlY29yZGluZ2Agc2V0dGVyLlxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGhhdmVSZWNvcmRpbmc6IGZhbHNlIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblJlY29yZGluZ1N0YXJ0ZWQgPSAoKSA9PiB7XG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgcmVjb3JkaW5nIGluc3RhbmNlLCBqdXN0IGluIGNhc2VcbiAgICAgICAgY29uc3Qgdm9pY2VSZWNvcmRpbmdJZCA9IFZvaWNlUmVjb3JkaW5nU3RvcmUuZ2V0Vm9pY2VSZWNvcmRpbmdJZCh0aGlzLnByb3BzLnJvb20sIHRoaXMucHJvcHMucmVsYXRpb24pO1xuICAgICAgICB0aGlzLnZvaWNlUmVjb3JkaW5nID0gVm9pY2VSZWNvcmRpbmdTdG9yZS5pbnN0YW5jZS5nZXRBY3RpdmVSZWNvcmRpbmcodm9pY2VSZWNvcmRpbmdJZCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgaGF2ZVJlY29yZGluZzogISF0aGlzLnZvaWNlUmVjb3JkaW5nLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblJlY29yZGluZ0VuZGluZ1Nvb24gPSAoeyBzZWNvbmRzTGVmdCB9KSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyByZWNvcmRpbmdUaW1lTGVmdFNlY29uZHM6IHNlY29uZHNMZWZ0IH0pO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuc2V0U3RhdGUoeyByZWNvcmRpbmdUaW1lTGVmdFNlY29uZHM6IG51bGwgfSksIDMwMDApO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHNldFN0aWNrZXJQaWNrZXJPcGVuID0gKGlzU3RpY2tlclBpY2tlck9wZW46IGJvb2xlYW4pID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBpc1N0aWNrZXJQaWNrZXJPcGVuLFxuICAgICAgICAgICAgaXNNZW51T3BlbjogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHRvZ2dsZVN0aWNrZXJQaWNrZXJPcGVuID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0aWNrZXJQaWNrZXJPcGVuKCF0aGlzLnN0YXRlLmlzU3RpY2tlclBpY2tlck9wZW4pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHRvZ2dsZUJ1dHRvbk1lbnUgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgaXNNZW51T3BlbjogIXRoaXMuc3RhdGUuaXNNZW51T3BlbixcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgZ2V0IHNob3dTdGlja2Vyc0J1dHRvbigpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuc2hvd1N0aWNrZXJzQnV0dG9uICYmICFpc0xvY2FsUm9vbSh0aGlzLnByb3BzLnJvb20pO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGNvbnRyb2xzID0gW1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5lMmVTdGF0dXMgP1xuICAgICAgICAgICAgICAgIDxFMkVJY29uIGtleT1cImUyZUljb25cIiBzdGF0dXM9e3RoaXMucHJvcHMuZTJlU3RhdHVzfSBjbGFzc05hbWU9XCJteF9NZXNzYWdlQ29tcG9zZXJfZTJlSWNvblwiIC8+IDpcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICBdO1xuXG4gICAgICAgIGxldCBtZW51UG9zaXRpb246IEFib3ZlTGVmdE9mIHwgdW5kZWZpbmVkO1xuICAgICAgICBpZiAodGhpcy5yZWYuY3VycmVudCkge1xuICAgICAgICAgICAgY29uc3QgY29udGVudFJlY3QgPSB0aGlzLnJlZi5jdXJyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgbWVudVBvc2l0aW9uID0gYWJvdmVMZWZ0T2YoY29udGVudFJlY3QpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2FuU2VuZE1lc3NhZ2VzID0gdGhpcy5jb250ZXh0LmNhblNlbmRNZXNzYWdlcyAmJiAhdGhpcy5jb250ZXh0LnRvbWJzdG9uZTtcbiAgICAgICAgaWYgKGNhblNlbmRNZXNzYWdlcykge1xuICAgICAgICAgICAgY29udHJvbHMucHVzaChcbiAgICAgICAgICAgICAgICA8U2VuZE1lc3NhZ2VDb21wb3NlclxuICAgICAgICAgICAgICAgICAgICByZWY9e3RoaXMubWVzc2FnZUNvbXBvc2VySW5wdXR9XG4gICAgICAgICAgICAgICAgICAgIGtleT1cImNvbnRyb2xzX2lucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgcm9vbT17dGhpcy5wcm9wcy5yb29tfVxuICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17dGhpcy5yZW5kZXJQbGFjZWhvbGRlclRleHQoKX1cbiAgICAgICAgICAgICAgICAgICAgcGVybWFsaW5rQ3JlYXRvcj17dGhpcy5wcm9wcy5wZXJtYWxpbmtDcmVhdG9yfVxuICAgICAgICAgICAgICAgICAgICByZWxhdGlvbj17dGhpcy5wcm9wcy5yZWxhdGlvbn1cbiAgICAgICAgICAgICAgICAgICAgcmVwbHlUb0V2ZW50PXt0aGlzLnByb3BzLnJlcGx5VG9FdmVudH1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25DaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLmhhdmVSZWNvcmRpbmd9XG4gICAgICAgICAgICAgICAgICAgIHRvZ2dsZVN0aWNrZXJQaWNrZXJPcGVuPXt0aGlzLnRvZ2dsZVN0aWNrZXJQaWNrZXJPcGVufVxuICAgICAgICAgICAgICAgIC8+LFxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgY29udHJvbHMucHVzaCg8Vm9pY2VSZWNvcmRDb21wb3NlclRpbGVcbiAgICAgICAgICAgICAgICBrZXk9XCJjb250cm9sc192b2ljZV9yZWNvcmRcIlxuICAgICAgICAgICAgICAgIHJlZj17dGhpcy52b2ljZVJlY29yZGluZ0J1dHRvbn1cbiAgICAgICAgICAgICAgICByb29tPXt0aGlzLnByb3BzLnJvb219XG4gICAgICAgICAgICAgICAgcGVybWFsaW5rQ3JlYXRvcj17dGhpcy5wcm9wcy5wZXJtYWxpbmtDcmVhdG9yfVxuICAgICAgICAgICAgICAgIHJlbGF0aW9uPXt0aGlzLnByb3BzLnJlbGF0aW9ufVxuICAgICAgICAgICAgICAgIHJlcGx5VG9FdmVudD17dGhpcy5wcm9wcy5yZXBseVRvRXZlbnR9IC8+KTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmNvbnRleHQudG9tYnN0b25lKSB7XG4gICAgICAgICAgICBjb25zdCByZXBsYWNlbWVudFJvb21JZCA9IHRoaXMuY29udGV4dC50b21ic3RvbmUuZ2V0Q29udGVudCgpWydyZXBsYWNlbWVudF9yb29tJ107XG5cbiAgICAgICAgICAgIGNvbnN0IGNvbnRpbnVlc0xpbmsgPSByZXBsYWNlbWVudFJvb21JZCA/IChcbiAgICAgICAgICAgICAgICA8YSBocmVmPXttYWtlUm9vbVBlcm1hbGluayhyZXBsYWNlbWVudFJvb21JZCl9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb21wb3Nlcl9yb29tUmVwbGFjZWRfbGlua1wiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25Ub21ic3RvbmVDbGlja31cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJUaGUgY29udmVyc2F0aW9uIGNvbnRpbnVlcyBoZXJlLlwiKSB9XG4gICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgKSA6ICcnO1xuXG4gICAgICAgICAgICBjb250cm9scy5wdXNoKDxkaXYgY2xhc3NOYW1lPVwibXhfTWVzc2FnZUNvbXBvc2VyX3JlcGxhY2VkX3dyYXBwZXJcIiBrZXk9XCJyb29tX3JlcGxhY2VkXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NZXNzYWdlQ29tcG9zZXJfcmVwbGFjZWRfdmFsaWduXCI+XG4gICAgICAgICAgICAgICAgICAgIDxpbWcgY2xhc3NOYW1lPVwibXhfTWVzc2FnZUNvbXBvc2VyX3Jvb21SZXBsYWNlZF9pY29uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyYz17cmVxdWlyZShcIi4uLy4uLy4uLy4uL3Jlcy9pbWcvcm9vbV9yZXBsYWNlZC5zdmdcIikuZGVmYXVsdH1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfTWVzc2FnZUNvbXBvc2VyX3Jvb21SZXBsYWNlZF9oZWFkZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJUaGlzIHJvb20gaGFzIGJlZW4gcmVwbGFjZWQgYW5kIGlzIG5vIGxvbmdlciBhY3RpdmUuXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPjxiciAvPlxuICAgICAgICAgICAgICAgICAgICB7IGNvbnRpbnVlc0xpbmsgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRyb2xzLnB1c2goXG4gICAgICAgICAgICAgICAgPGRpdiBrZXk9XCJjb250cm9sc19lcnJvclwiIGNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb21wb3Nlcl9ub3Blcm1fZXJyb3JcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdCgnWW91IGRvIG5vdCBoYXZlIHBlcm1pc3Npb24gdG8gcG9zdCB0byB0aGlzIHJvb20nKSB9XG4gICAgICAgICAgICAgICAgPC9kaXY+LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCByZWNvcmRpbmdUb29sdGlwO1xuICAgICAgICBjb25zdCBzZWNvbmRzTGVmdCA9IE1hdGgucm91bmQodGhpcy5zdGF0ZS5yZWNvcmRpbmdUaW1lTGVmdFNlY29uZHMpO1xuICAgICAgICBpZiAoc2Vjb25kc0xlZnQpIHtcbiAgICAgICAgICAgIHJlY29yZGluZ1Rvb2x0aXAgPSA8VG9vbHRpcFxuICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIiUoc2Vjb25kcylzcyBsZWZ0XCIsIHsgc2Vjb25kczogc2Vjb25kc0xlZnQgfSl9XG4gICAgICAgICAgICAgICAgYWxpZ25tZW50PXtBbGlnbm1lbnQuVG9wfVxuICAgICAgICAgICAgLz47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB0aHJlYWRJZCA9IHRoaXMucHJvcHMucmVsYXRpb24/LnJlbF90eXBlID09PSBUSFJFQURfUkVMQVRJT05fVFlQRS5uYW1lXG4gICAgICAgICAgICA/IHRoaXMucHJvcHMucmVsYXRpb24uZXZlbnRfaWRcbiAgICAgICAgICAgIDogbnVsbDtcblxuICAgICAgICBjb250cm9scy5wdXNoKFxuICAgICAgICAgICAgPFN0aWNrZXJwaWNrZXJcbiAgICAgICAgICAgICAgICByb29tPXt0aGlzLnByb3BzLnJvb219XG4gICAgICAgICAgICAgICAgdGhyZWFkSWQ9e3RocmVhZElkfVxuICAgICAgICAgICAgICAgIGlzU3RpY2tlclBpY2tlck9wZW49e3RoaXMuc3RhdGUuaXNTdGlja2VyUGlja2VyT3Blbn1cbiAgICAgICAgICAgICAgICBzZXRTdGlja2VyUGlja2VyT3Blbj17dGhpcy5zZXRTdGlja2VyUGlja2VyT3Blbn1cbiAgICAgICAgICAgICAgICBtZW51UG9zaXRpb249e21lbnVQb3NpdGlvbn1cbiAgICAgICAgICAgICAgICBrZXk9XCJzdGlja2Vyc1wiXG4gICAgICAgICAgICAvPixcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBzaG93U2VuZEJ1dHRvbiA9ICF0aGlzLnN0YXRlLmlzQ29tcG9zZXJFbXB0eSB8fCB0aGlzLnN0YXRlLmhhdmVSZWNvcmRpbmc7XG5cbiAgICAgICAgY29uc3QgY2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgXCJteF9NZXNzYWdlQ29tcG9zZXJcIjogdHJ1ZSxcbiAgICAgICAgICAgIFwibXhfTWVzc2FnZUNvbXBvc2VyLS1jb21wYWN0XCI6IHRoaXMucHJvcHMuY29tcGFjdCxcbiAgICAgICAgICAgIFwibXhfTWVzc2FnZUNvbXBvc2VyX2UyZVN0YXR1c1wiOiB0aGlzLnByb3BzLmUyZVN0YXR1cyAhPSB1bmRlZmluZWQsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3Nlc30gcmVmPXt0aGlzLnJlZn0+XG4gICAgICAgICAgICAgICAgeyByZWNvcmRpbmdUb29sdGlwIH1cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb21wb3Nlcl93cmFwcGVyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxSZXBseVByZXZpZXdcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcGx5VG9FdmVudD17dGhpcy5wcm9wcy5yZXBseVRvRXZlbnR9XG4gICAgICAgICAgICAgICAgICAgICAgICBwZXJtYWxpbmtDcmVhdG9yPXt0aGlzLnByb3BzLnBlcm1hbGlua0NyZWF0b3J9IC8+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTWVzc2FnZUNvbXBvc2VyX3Jvd1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBjb250cm9scyB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGNhblNlbmRNZXNzYWdlcyAmJiA8TWVzc2FnZUNvbXBvc2VyQnV0dG9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZEVtb2ppPXt0aGlzLmFkZEVtb2ppfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhdmVSZWNvcmRpbmc9e3RoaXMuc3RhdGUuaGF2ZVJlY29yZGluZ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc01lbnVPcGVuPXt0aGlzLnN0YXRlLmlzTWVudU9wZW59XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNTdGlja2VyUGlja2VyT3Blbj17dGhpcy5zdGF0ZS5pc1N0aWNrZXJQaWNrZXJPcGVufVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lbnVQb3NpdGlvbj17bWVudVBvc2l0aW9ufVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aW9uPXt0aGlzLnByb3BzLnJlbGF0aW9ufVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uUmVjb3JkU3RhcnRFbmRDbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZvaWNlUmVjb3JkaW5nQnV0dG9uLmN1cnJlbnQ/Lm9uUmVjb3JkU3RhcnRFbmRDbGljaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb250ZXh0Lm5hcnJvdykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50b2dnbGVCdXR0b25NZW51KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFN0aWNrZXJQaWNrZXJPcGVuPXt0aGlzLnNldFN0aWNrZXJQaWNrZXJPcGVufVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dMb2NhdGlvbkJ1dHRvbj17IXdpbmRvdy5lbGVjdHJvbn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG93UG9sbHNCdXR0b249e3RoaXMuc3RhdGUuc2hvd1BvbGxzQnV0dG9ufVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dTdGlja2Vyc0J1dHRvbj17dGhpcy5zaG93U3RpY2tlcnNCdXR0b259XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9nZ2xlQnV0dG9uTWVudT17dGhpcy50b2dnbGVCdXR0b25NZW51fVxuICAgICAgICAgICAgICAgICAgICAgICAgLz4gfVxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzaG93U2VuZEJ1dHRvbiAmJiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPFNlbmRCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5PVwiY29udHJvbHNfc2VuZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuc2VuZE1lc3NhZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXt0aGlzLnN0YXRlLmhhdmVSZWNvcmRpbmcgPyBfdChcIlNlbmQgdm9pY2UgbWVzc2FnZVwiKSA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFJQTs7QUFFQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFHQTs7QUFFQTs7QUFFQTs7QUFDQTs7QUFFQTs7QUFHQTs7Ozs7O0FBckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXlDQSxJQUFJQSxhQUFhLEdBQUcsQ0FBcEI7O0FBT0EsU0FBU0MsVUFBVCxDQUFvQkMsS0FBcEIsRUFBNkM7RUFDekMsb0JBQ0ksNkJBQUMsZ0NBQUQ7SUFDSSxTQUFTLEVBQUMsZ0NBRGQ7SUFFSSxPQUFPLEVBQUVBLEtBQUssQ0FBQ0MsT0FGbkI7SUFHSSxLQUFLLEVBQUVELEtBQUssQ0FBQ0UsS0FBTixJQUFlLElBQUFDLG1CQUFBLEVBQUcsY0FBSDtFQUgxQixFQURKO0FBT0g7O0FBdUJjLE1BQU1DLGVBQU4sU0FBOEJDLGNBQUEsQ0FBTUMsU0FBcEMsQ0FBOEQ7RUFnQmxFQyxXQUFXLENBQUNQ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