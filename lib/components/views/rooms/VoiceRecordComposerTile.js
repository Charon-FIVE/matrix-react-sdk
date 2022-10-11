"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _event = require("matrix-js-sdk/src/@types/event");

var _logger = require("matrix-js-sdk/src/logger");

var _AccessibleTooltipButton = _interopRequireDefault(require("../elements/AccessibleTooltipButton"));

var _languageHandler = require("../../../languageHandler");

var _VoiceRecording = require("../../../audio/VoiceRecording");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _LiveRecordingWaveform = _interopRequireDefault(require("../audio_messages/LiveRecordingWaveform"));

var _LiveRecordingClock = _interopRequireDefault(require("../audio_messages/LiveRecordingClock"));

var _VoiceRecordingStore = require("../../../stores/VoiceRecordingStore");

var _AsyncStore = require("../../../stores/AsyncStore");

var _RecordingPlayback = _interopRequireWildcard(require("../audio_messages/RecordingPlayback"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _ErrorDialog = _interopRequireDefault(require("../dialogs/ErrorDialog"));

var _MediaDeviceHandler = _interopRequireWildcard(require("../../../MediaDeviceHandler"));

var _NotificationBadge = _interopRequireDefault(require("./NotificationBadge"));

var _StaticNotificationState = require("../../../stores/notifications/StaticNotificationState");

var _NotificationColor = require("../../../stores/notifications/NotificationColor");

var _InlineSpinner = _interopRequireDefault(require("../elements/InlineSpinner"));

var _PlaybackManager = require("../../../audio/PlaybackManager");

var _localRoom = require("../../../utils/local-room");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _SendMessageComposer = require("./SendMessageComposer");

var _Reply = require("../../../utils/Reply");

var _RoomContext = _interopRequireDefault(require("../../../contexts/RoomContext"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2021 - 2022 The Matrix.org Foundation C.I.C.

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

/**
 * Container tile for rendering the voice message recorder in the composer.
 */
class VoiceRecordComposerTile extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "context", void 0);
    (0, _defineProperty2.default)(this, "voiceRecordingId", void 0);
    (0, _defineProperty2.default)(this, "onCancel", async () => {
      await this.disposeRecording();
    });
    (0, _defineProperty2.default)(this, "onRecordStartEndClick", async () => {
      if (this.state.recorder) {
        await this.state.recorder.stop();
        return;
      } // The "microphone access error" dialogs are used a lot, so let's functionify them


      const accessError = () => {
        _Modal.default.createDialog(_ErrorDialog.default, {
          title: (0, _languageHandler._t)("Unable to access your microphone"),
          description: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("We were unable to access your microphone. Please check your browser settings and try again.")))
        });
      }; // Do a sanity test to ensure we're about to grab a valid microphone reference. Things might
      // change between this and recording, but at least we will have tried.


      try {
        const devices = await _MediaDeviceHandler.default.getDevices();

        if (!devices?.[_MediaDeviceHandler.MediaDeviceKindEnum.AudioInput]?.length) {
          _Modal.default.createDialog(_ErrorDialog.default, {
            title: (0, _languageHandler._t)("No microphone found"),
            description: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("We didn't find a microphone on your device. Please check your settings and try again.")))
          });

          return;
        } // else we probably have a device that is good enough

      } catch (e) {
        _logger.logger.error("Error getting devices: ", e);

        accessError();
        return;
      }

      try {
        // stop any noises which might be happening
        _PlaybackManager.PlaybackManager.instance.pauseAllExcept(null);

        const recorder = _VoiceRecordingStore.VoiceRecordingStore.instance.startRecording(this.voiceRecordingId);

        await recorder.start();
        this.bindNewRecorder(recorder);
        this.setState({
          recorder,
          recordingPhase: _VoiceRecording.RecordingState.Started
        });
      } catch (e) {
        _logger.logger.error("Error starting recording: ", e);

        accessError(); // noinspection ES6MissingAwait - if this goes wrong we don't want it to affect the call stack

        _VoiceRecordingStore.VoiceRecordingStore.instance.disposeRecording(this.voiceRecordingId);
      }
    });
    (0, _defineProperty2.default)(this, "onRecordingUpdate", ev => {
      if (ev === _VoiceRecording.RecordingState.EndingSoon) return; // ignore this state: it has no UI purpose here

      this.setState({
        recordingPhase: ev
      });
    });
    this.state = {
      recorder: null // no recording started by default

    };
    this.voiceRecordingId = _VoiceRecordingStore.VoiceRecordingStore.getVoiceRecordingId(this.props.room, this.props.relation);
  }

  componentDidMount() {
    const recorder = _VoiceRecordingStore.VoiceRecordingStore.instance.getActiveRecording(this.voiceRecordingId);

    if (recorder) {
      if (recorder.isRecording || !recorder.hasRecording) {
        _logger.logger.warn("Cached recording hasn't ended yet and might cause issues");
      }

      this.bindNewRecorder(recorder);
      this.setState({
        recorder,
        recordingPhase: _VoiceRecording.RecordingState.Ended
      });
    }
  }

  async componentWillUnmount() {
    // Stop recording, but keep the recording memory (don't dispose it). This is to let the user
    // come back and finish working with it.
    const recording = _VoiceRecordingStore.VoiceRecordingStore.instance.getActiveRecording(this.voiceRecordingId);

    await recording?.stop(); // Clean up our listeners by binding a falsy recorder

    this.bindNewRecorder(null);
  } // called by composer


  async send() {
    if (!this.state.recorder) {
      throw new Error("No recording started - cannot send anything");
    }

    const {
      replyToEvent,
      relation,
      permalinkCreator
    } = this.props;
    await this.state.recorder.stop();
    let upload;

    try {
      upload = await this.state.recorder.upload(this.voiceRecordingId);
    } catch (e) {
      _logger.logger.error("Error uploading voice message:", e); // Flag error and move on. The recording phase will be reset by the upload function.


      this.setState({
        didUploadFail: true
      });
      return; // don't dispose the recording: the user has a chance to re-upload
    }

    try {
      // noinspection ES6MissingAwait - we don't care if it fails, it'll get queued.
      const content = {
        "body": "Voice message",
        //"msgtype": "org.matrix.msc2516.voice",
        "msgtype": _event.MsgType.Audio,
        "url": upload.mxc,
        "file": upload.encrypted,
        "info": {
          duration: Math.round(this.state.recorder.durationSeconds * 1000),
          mimetype: this.state.recorder.contentType,
          size: this.state.recorder.contentLength
        },
        // MSC1767 + Ideals of MSC2516 as MSC3245
        // https://github.com/matrix-org/matrix-doc/pull/3245
        "org.matrix.msc1767.text": "Voice message",
        "org.matrix.msc1767.file": {
          url: upload.mxc,
          file: upload.encrypted,
          name: "Voice message.ogg",
          mimetype: this.state.recorder.contentType,
          size: this.state.recorder.contentLength
        },
        "org.matrix.msc1767.audio": {
          duration: Math.round(this.state.recorder.durationSeconds * 1000),
          // https://github.com/matrix-org/matrix-doc/pull/3246
          waveform: this.state.recorder.getPlayback().thumbnailWaveform.map(v => Math.round(v * 1024))
        },
        "org.matrix.msc3245.voice": {} // No content, this is a rendering hint

      };
      (0, _SendMessageComposer.attachRelation)(content, relation);

      if (replyToEvent) {
        (0, _Reply.addReplyToMessageContent)(content, replyToEvent, {
          permalinkCreator,
          includeLegacyFallback: true
        }); // Clear reply_to_event as we put the message into the queue
        // if the send fails, retry will handle resending.

        _dispatcher.default.dispatch({
          action: 'reply_to_event',
          event: null,
          context: this.context.timelineRenderingType
        });
      }

      (0, _localRoom.doMaybeLocalRoomAction)(this.props.room.roomId, actualRoomId => _MatrixClientPeg.MatrixClientPeg.get().sendMessage(actualRoomId, content));
    } catch (e) {
      _logger.logger.error("Error sending voice message:", e); // Voice message should be in the timeline at this point, so let other things take care
      // of error handling. We also shouldn't need the recording anymore, so fall through to
      // disposal.

    }

    await this.disposeRecording();
  }

  async disposeRecording() {
    await _VoiceRecordingStore.VoiceRecordingStore.instance.disposeRecording(this.voiceRecordingId); // Reset back to no recording, which means no phase (ie: restart component entirely)

    this.setState({
      recorder: null,
      recordingPhase: null,
      didUploadFail: false
    });
  }

  bindNewRecorder(recorder) {
    if (this.state.recorder) {
      this.state.recorder.off(_AsyncStore.UPDATE_EVENT, this.onRecordingUpdate);
    }

    if (recorder) {
      recorder.on(_AsyncStore.UPDATE_EVENT, this.onRecordingUpdate);
    }
  }

  renderWaveformArea() {
    if (!this.state.recorder) return null; // no recorder means we're not recording: no waveform

    if (this.state.recordingPhase !== _VoiceRecording.RecordingState.Started) {
      return /*#__PURE__*/_react.default.createElement(_RecordingPlayback.default, {
        playback: this.state.recorder.getPlayback(),
        layout: _RecordingPlayback.PlaybackLayout.Composer
      });
    } // only other UI is the recording-in-progress UI


    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MediaBody mx_VoiceMessagePrimaryContainer mx_VoiceRecordComposerTile_recording"
    }, /*#__PURE__*/_react.default.createElement(_LiveRecordingClock.default, {
      recorder: this.state.recorder
    }), /*#__PURE__*/_react.default.createElement(_LiveRecordingWaveform.default, {
      recorder: this.state.recorder
    }));
  }

  render() {
    if (!this.state.recordingPhase) return null;
    let stopBtn;
    let deleteButton;

    if (this.state.recordingPhase === _VoiceRecording.RecordingState.Started) {
      let tooltip = (0, _languageHandler._t)("Send voice message");

      if (!!this.state.recorder) {
        tooltip = (0, _languageHandler._t)("Stop recording");
      }

      stopBtn = /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
        className: "mx_VoiceRecordComposerTile_stop",
        onClick: this.onRecordStartEndClick,
        title: tooltip
      });

      if (this.state.recorder && !this.state.recorder?.isRecording) {
        stopBtn = null;
      }
    }

    if (this.state.recorder && this.state.recordingPhase !== _VoiceRecording.RecordingState.Uploading) {
      deleteButton = /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
        className: "mx_VoiceRecordComposerTile_delete",
        title: (0, _languageHandler._t)("Delete"),
        onClick: this.onCancel
      });
    }

    let uploadIndicator;

    if (this.state.recordingPhase === _VoiceRecording.RecordingState.Uploading) {
      uploadIndicator = /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_VoiceRecordComposerTile_uploadingState"
      }, /*#__PURE__*/_react.default.createElement(_InlineSpinner.default, {
        w: 16,
        h: 16
      }));
    } else if (this.state.didUploadFail && this.state.recordingPhase === _VoiceRecording.RecordingState.Ended) {
      uploadIndicator = /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_VoiceRecordComposerTile_failedState"
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_VoiceRecordComposerTile_uploadState_badge"
      }, /*#__PURE__*/_react.default.createElement(_NotificationBadge.default, {
        notification: _StaticNotificationState.StaticNotificationState.forSymbol("!", _NotificationColor.NotificationColor.Red)
      })), /*#__PURE__*/_react.default.createElement("span", {
        className: "text-warning"
      }, (0, _languageHandler._t)("Failed to send")));
    }

    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, uploadIndicator, deleteButton, stopBtn, this.renderWaveformArea());
  }

}

exports.default = VoiceRecordComposerTile;
(0, _defineProperty2.default)(VoiceRecordComposerTile, "contextType", _RoomContext.default);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWb2ljZVJlY29yZENvbXBvc2VyVGlsZSIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJkaXNwb3NlUmVjb3JkaW5nIiwic3RhdGUiLCJyZWNvcmRlciIsInN0b3AiLCJhY2Nlc3NFcnJvciIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwiRXJyb3JEaWFsb2ciLCJ0aXRsZSIsIl90IiwiZGVzY3JpcHRpb24iLCJkZXZpY2VzIiwiTWVkaWFEZXZpY2VIYW5kbGVyIiwiZ2V0RGV2aWNlcyIsIk1lZGlhRGV2aWNlS2luZEVudW0iLCJBdWRpb0lucHV0IiwibGVuZ3RoIiwiZSIsImxvZ2dlciIsImVycm9yIiwiUGxheWJhY2tNYW5hZ2VyIiwiaW5zdGFuY2UiLCJwYXVzZUFsbEV4Y2VwdCIsIlZvaWNlUmVjb3JkaW5nU3RvcmUiLCJzdGFydFJlY29yZGluZyIsInZvaWNlUmVjb3JkaW5nSWQiLCJzdGFydCIsImJpbmROZXdSZWNvcmRlciIsInNldFN0YXRlIiwicmVjb3JkaW5nUGhhc2UiLCJSZWNvcmRpbmdTdGF0ZSIsIlN0YXJ0ZWQiLCJldiIsIkVuZGluZ1Nvb24iLCJnZXRWb2ljZVJlY29yZGluZ0lkIiwicm9vbSIsInJlbGF0aW9uIiwiY29tcG9uZW50RGlkTW91bnQiLCJnZXRBY3RpdmVSZWNvcmRpbmciLCJpc1JlY29yZGluZyIsImhhc1JlY29yZGluZyIsIndhcm4iLCJFbmRlZCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVjb3JkaW5nIiwic2VuZCIsIkVycm9yIiwicmVwbHlUb0V2ZW50IiwicGVybWFsaW5rQ3JlYXRvciIsInVwbG9hZCIsImRpZFVwbG9hZEZhaWwiLCJjb250ZW50IiwiTXNnVHlwZSIsIkF1ZGlvIiwibXhjIiwiZW5jcnlwdGVkIiwiZHVyYXRpb24iLCJNYXRoIiwicm91bmQiLCJkdXJhdGlvblNlY29uZHMiLCJtaW1ldHlwZSIsImNvbnRlbnRUeXBlIiwic2l6ZSIsImNvbnRlbnRMZW5ndGgiLCJ1cmwiLCJmaWxlIiwibmFtZSIsIndhdmVmb3JtIiwiZ2V0UGxheWJhY2siLCJ0aHVtYm5haWxXYXZlZm9ybSIsIm1hcCIsInYiLCJhdHRhY2hSZWxhdGlvbiIsImFkZFJlcGx5VG9NZXNzYWdlQ29udGVudCIsImluY2x1ZGVMZWdhY3lGYWxsYmFjayIsImRlZmF1bHREaXNwYXRjaGVyIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJldmVudCIsImNvbnRleHQiLCJ0aW1lbGluZVJlbmRlcmluZ1R5cGUiLCJkb01heWJlTG9jYWxSb29tQWN0aW9uIiwicm9vbUlkIiwiYWN0dWFsUm9vbUlkIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0Iiwic2VuZE1lc3NhZ2UiLCJvZmYiLCJVUERBVEVfRVZFTlQiLCJvblJlY29yZGluZ1VwZGF0ZSIsIm9uIiwicmVuZGVyV2F2ZWZvcm1BcmVhIiwiUGxheWJhY2tMYXlvdXQiLCJDb21wb3NlciIsInJlbmRlciIsInN0b3BCdG4iLCJkZWxldGVCdXR0b24iLCJ0b29sdGlwIiwib25SZWNvcmRTdGFydEVuZENsaWNrIiwiVXBsb2FkaW5nIiwib25DYW5jZWwiLCJ1cGxvYWRJbmRpY2F0b3IiLCJTdGF0aWNOb3RpZmljYXRpb25TdGF0ZSIsImZvclN5bWJvbCIsIk5vdGlmaWNhdGlvbkNvbG9yIiwiUmVkIiwiUm9vbUNvbnRleHQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9yb29tcy9Wb2ljZVJlY29yZENvbXBvc2VyVGlsZS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIxIC0gMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBSZWFjdE5vZGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCB7IE1zZ1R5cGUgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL2V2ZW50XCI7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyXCI7XG5pbXBvcnQgeyBPcHRpb25hbCB9IGZyb20gXCJtYXRyaXgtZXZlbnRzLXNka1wiO1xuaW1wb3J0IHsgSUV2ZW50UmVsYXRpb24sIE1hdHJpeEV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudFwiO1xuXG5pbXBvcnQgQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVUb29sdGlwQnV0dG9uXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7IElVcGxvYWQsIFJlY29yZGluZ1N0YXRlLCBWb2ljZVJlY29yZGluZyB9IGZyb20gXCIuLi8uLi8uLi9hdWRpby9Wb2ljZVJlY29yZGluZ1wiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSBcIi4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IExpdmVSZWNvcmRpbmdXYXZlZm9ybSBmcm9tIFwiLi4vYXVkaW9fbWVzc2FnZXMvTGl2ZVJlY29yZGluZ1dhdmVmb3JtXCI7XG5pbXBvcnQgTGl2ZVJlY29yZGluZ0Nsb2NrIGZyb20gXCIuLi9hdWRpb19tZXNzYWdlcy9MaXZlUmVjb3JkaW5nQ2xvY2tcIjtcbmltcG9ydCB7IFZvaWNlUmVjb3JkaW5nU3RvcmUgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL1ZvaWNlUmVjb3JkaW5nU3RvcmVcIjtcbmltcG9ydCB7IFVQREFURV9FVkVOVCB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvQXN5bmNTdG9yZVwiO1xuaW1wb3J0IFJlY29yZGluZ1BsYXliYWNrLCB7IFBsYXliYWNrTGF5b3V0IH0gZnJvbSBcIi4uL2F1ZGlvX21lc3NhZ2VzL1JlY29yZGluZ1BsYXliYWNrXCI7XG5pbXBvcnQgTW9kYWwgZnJvbSBcIi4uLy4uLy4uL01vZGFsXCI7XG5pbXBvcnQgRXJyb3JEaWFsb2cgZnJvbSBcIi4uL2RpYWxvZ3MvRXJyb3JEaWFsb2dcIjtcbmltcG9ydCBNZWRpYURldmljZUhhbmRsZXIsIHsgTWVkaWFEZXZpY2VLaW5kRW51bSB9IGZyb20gXCIuLi8uLi8uLi9NZWRpYURldmljZUhhbmRsZXJcIjtcbmltcG9ydCBOb3RpZmljYXRpb25CYWRnZSBmcm9tIFwiLi9Ob3RpZmljYXRpb25CYWRnZVwiO1xuaW1wb3J0IHsgU3RhdGljTm90aWZpY2F0aW9uU3RhdGUgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL25vdGlmaWNhdGlvbnMvU3RhdGljTm90aWZpY2F0aW9uU3RhdGVcIjtcbmltcG9ydCB7IE5vdGlmaWNhdGlvbkNvbG9yIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9ub3RpZmljYXRpb25zL05vdGlmaWNhdGlvbkNvbG9yXCI7XG5pbXBvcnQgSW5saW5lU3Bpbm5lciBmcm9tIFwiLi4vZWxlbWVudHMvSW5saW5lU3Bpbm5lclwiO1xuaW1wb3J0IHsgUGxheWJhY2tNYW5hZ2VyIH0gZnJvbSBcIi4uLy4uLy4uL2F1ZGlvL1BsYXliYWNrTWFuYWdlclwiO1xuaW1wb3J0IHsgZG9NYXliZUxvY2FsUm9vbUFjdGlvbiB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9sb2NhbC1yb29tXCI7XG5pbXBvcnQgZGVmYXVsdERpc3BhdGNoZXIgZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHsgYXR0YWNoUmVsYXRpb24gfSBmcm9tIFwiLi9TZW5kTWVzc2FnZUNvbXBvc2VyXCI7XG5pbXBvcnQgeyBhZGRSZXBseVRvTWVzc2FnZUNvbnRlbnQgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvUmVwbHlcIjtcbmltcG9ydCB7IFJvb21QZXJtYWxpbmtDcmVhdG9yIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3Blcm1hbGlua3MvUGVybWFsaW5rc1wiO1xuaW1wb3J0IFJvb21Db250ZXh0IGZyb20gXCIuLi8uLi8uLi9jb250ZXh0cy9Sb29tQ29udGV4dFwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICByb29tOiBSb29tO1xuICAgIHBlcm1hbGlua0NyZWF0b3I/OiBSb29tUGVybWFsaW5rQ3JlYXRvcjtcbiAgICByZWxhdGlvbj86IElFdmVudFJlbGF0aW9uO1xuICAgIHJlcGx5VG9FdmVudD86IE1hdHJpeEV2ZW50O1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICByZWNvcmRlcj86IFZvaWNlUmVjb3JkaW5nO1xuICAgIHJlY29yZGluZ1BoYXNlPzogUmVjb3JkaW5nU3RhdGU7XG4gICAgZGlkVXBsb2FkRmFpbD86IGJvb2xlYW47XG59XG5cbi8qKlxuICogQ29udGFpbmVyIHRpbGUgZm9yIHJlbmRlcmluZyB0aGUgdm9pY2UgbWVzc2FnZSByZWNvcmRlciBpbiB0aGUgY29tcG9zZXIuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZvaWNlUmVjb3JkQ29tcG9zZXJUaWxlIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHN0YXRpYyBjb250ZXh0VHlwZSA9IFJvb21Db250ZXh0O1xuICAgIHB1YmxpYyBjb250ZXh0ITogUmVhY3QuQ29udGV4dFR5cGU8dHlwZW9mIFJvb21Db250ZXh0PjtcbiAgICBwcml2YXRlIHZvaWNlUmVjb3JkaW5nSWQ6IHN0cmluZztcblxuICAgIHB1YmxpYyBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgcmVjb3JkZXI6IG51bGwsIC8vIG5vIHJlY29yZGluZyBzdGFydGVkIGJ5IGRlZmF1bHRcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnZvaWNlUmVjb3JkaW5nSWQgPSBWb2ljZVJlY29yZGluZ1N0b3JlLmdldFZvaWNlUmVjb3JkaW5nSWQodGhpcy5wcm9wcy5yb29tLCB0aGlzLnByb3BzLnJlbGF0aW9uKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIGNvbnN0IHJlY29yZGVyID0gVm9pY2VSZWNvcmRpbmdTdG9yZS5pbnN0YW5jZS5nZXRBY3RpdmVSZWNvcmRpbmcodGhpcy52b2ljZVJlY29yZGluZ0lkKTtcbiAgICAgICAgaWYgKHJlY29yZGVyKSB7XG4gICAgICAgICAgICBpZiAocmVjb3JkZXIuaXNSZWNvcmRpbmcgfHwgIXJlY29yZGVyLmhhc1JlY29yZGluZykge1xuICAgICAgICAgICAgICAgIGxvZ2dlci53YXJuKFwiQ2FjaGVkIHJlY29yZGluZyBoYXNuJ3QgZW5kZWQgeWV0IGFuZCBtaWdodCBjYXVzZSBpc3N1ZXNcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmJpbmROZXdSZWNvcmRlcihyZWNvcmRlcik7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgcmVjb3JkZXIsIHJlY29yZGluZ1BoYXNlOiBSZWNvcmRpbmdTdGF0ZS5FbmRlZCB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgLy8gU3RvcCByZWNvcmRpbmcsIGJ1dCBrZWVwIHRoZSByZWNvcmRpbmcgbWVtb3J5IChkb24ndCBkaXNwb3NlIGl0KS4gVGhpcyBpcyB0byBsZXQgdGhlIHVzZXJcbiAgICAgICAgLy8gY29tZSBiYWNrIGFuZCBmaW5pc2ggd29ya2luZyB3aXRoIGl0LlxuICAgICAgICBjb25zdCByZWNvcmRpbmcgPSBWb2ljZVJlY29yZGluZ1N0b3JlLmluc3RhbmNlLmdldEFjdGl2ZVJlY29yZGluZyh0aGlzLnZvaWNlUmVjb3JkaW5nSWQpO1xuICAgICAgICBhd2FpdCByZWNvcmRpbmc/LnN0b3AoKTtcblxuICAgICAgICAvLyBDbGVhbiB1cCBvdXIgbGlzdGVuZXJzIGJ5IGJpbmRpbmcgYSBmYWxzeSByZWNvcmRlclxuICAgICAgICB0aGlzLmJpbmROZXdSZWNvcmRlcihudWxsKTtcbiAgICB9XG5cbiAgICAvLyBjYWxsZWQgYnkgY29tcG9zZXJcbiAgICBwdWJsaWMgYXN5bmMgc2VuZCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnJlY29yZGVyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyByZWNvcmRpbmcgc3RhcnRlZCAtIGNhbm5vdCBzZW5kIGFueXRoaW5nXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgeyByZXBseVRvRXZlbnQsIHJlbGF0aW9uLCBwZXJtYWxpbmtDcmVhdG9yIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgICAgIGF3YWl0IHRoaXMuc3RhdGUucmVjb3JkZXIuc3RvcCgpO1xuXG4gICAgICAgIGxldCB1cGxvYWQ6IElVcGxvYWQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB1cGxvYWQgPSBhd2FpdCB0aGlzLnN0YXRlLnJlY29yZGVyLnVwbG9hZCh0aGlzLnZvaWNlUmVjb3JkaW5nSWQpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJFcnJvciB1cGxvYWRpbmcgdm9pY2UgbWVzc2FnZTpcIiwgZSk7XG5cbiAgICAgICAgICAgIC8vIEZsYWcgZXJyb3IgYW5kIG1vdmUgb24uIFRoZSByZWNvcmRpbmcgcGhhc2Ugd2lsbCBiZSByZXNldCBieSB0aGUgdXBsb2FkIGZ1bmN0aW9uLlxuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGRpZFVwbG9hZEZhaWw6IHRydWUgfSk7XG5cbiAgICAgICAgICAgIHJldHVybjsgLy8gZG9uJ3QgZGlzcG9zZSB0aGUgcmVjb3JkaW5nOiB0aGUgdXNlciBoYXMgYSBjaGFuY2UgdG8gcmUtdXBsb2FkXG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gbm9pbnNwZWN0aW9uIEVTNk1pc3NpbmdBd2FpdCAtIHdlIGRvbid0IGNhcmUgaWYgaXQgZmFpbHMsIGl0J2xsIGdldCBxdWV1ZWQuXG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0ge1xuICAgICAgICAgICAgICAgIFwiYm9keVwiOiBcIlZvaWNlIG1lc3NhZ2VcIixcbiAgICAgICAgICAgICAgICAvL1wibXNndHlwZVwiOiBcIm9yZy5tYXRyaXgubXNjMjUxNi52b2ljZVwiLFxuICAgICAgICAgICAgICAgIFwibXNndHlwZVwiOiBNc2dUeXBlLkF1ZGlvLFxuICAgICAgICAgICAgICAgIFwidXJsXCI6IHVwbG9hZC5teGMsXG4gICAgICAgICAgICAgICAgXCJmaWxlXCI6IHVwbG9hZC5lbmNyeXB0ZWQsXG4gICAgICAgICAgICAgICAgXCJpbmZvXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IE1hdGgucm91bmQodGhpcy5zdGF0ZS5yZWNvcmRlci5kdXJhdGlvblNlY29uZHMgKiAxMDAwKSxcbiAgICAgICAgICAgICAgICAgICAgbWltZXR5cGU6IHRoaXMuc3RhdGUucmVjb3JkZXIuY29udGVudFR5cGUsXG4gICAgICAgICAgICAgICAgICAgIHNpemU6IHRoaXMuc3RhdGUucmVjb3JkZXIuY29udGVudExlbmd0aCxcbiAgICAgICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAgICAgLy8gTVNDMTc2NyArIElkZWFscyBvZiBNU0MyNTE2IGFzIE1TQzMyNDVcbiAgICAgICAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbWF0cml4LW9yZy9tYXRyaXgtZG9jL3B1bGwvMzI0NVxuICAgICAgICAgICAgICAgIFwib3JnLm1hdHJpeC5tc2MxNzY3LnRleHRcIjogXCJWb2ljZSBtZXNzYWdlXCIsXG4gICAgICAgICAgICAgICAgXCJvcmcubWF0cml4Lm1zYzE3NjcuZmlsZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgIHVybDogdXBsb2FkLm14YyxcbiAgICAgICAgICAgICAgICAgICAgZmlsZTogdXBsb2FkLmVuY3J5cHRlZCxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogXCJWb2ljZSBtZXNzYWdlLm9nZ1wiLFxuICAgICAgICAgICAgICAgICAgICBtaW1ldHlwZTogdGhpcy5zdGF0ZS5yZWNvcmRlci5jb250ZW50VHlwZSxcbiAgICAgICAgICAgICAgICAgICAgc2l6ZTogdGhpcy5zdGF0ZS5yZWNvcmRlci5jb250ZW50TGVuZ3RoLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJvcmcubWF0cml4Lm1zYzE3NjcuYXVkaW9cIjoge1xuICAgICAgICAgICAgICAgICAgICBkdXJhdGlvbjogTWF0aC5yb3VuZCh0aGlzLnN0YXRlLnJlY29yZGVyLmR1cmF0aW9uU2Vjb25kcyAqIDEwMDApLFxuXG4gICAgICAgICAgICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRyaXgtb3JnL21hdHJpeC1kb2MvcHVsbC8zMjQ2XG4gICAgICAgICAgICAgICAgICAgIHdhdmVmb3JtOiB0aGlzLnN0YXRlLnJlY29yZGVyLmdldFBsYXliYWNrKCkudGh1bWJuYWlsV2F2ZWZvcm0ubWFwKHYgPT4gTWF0aC5yb3VuZCh2ICogMTAyNCkpLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJvcmcubWF0cml4Lm1zYzMyNDUudm9pY2VcIjoge30sIC8vIE5vIGNvbnRlbnQsIHRoaXMgaXMgYSByZW5kZXJpbmcgaGludFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgYXR0YWNoUmVsYXRpb24oY29udGVudCwgcmVsYXRpb24pO1xuICAgICAgICAgICAgaWYgKHJlcGx5VG9FdmVudCkge1xuICAgICAgICAgICAgICAgIGFkZFJlcGx5VG9NZXNzYWdlQ29udGVudChjb250ZW50LCByZXBseVRvRXZlbnQsIHtcbiAgICAgICAgICAgICAgICAgICAgcGVybWFsaW5rQ3JlYXRvcixcbiAgICAgICAgICAgICAgICAgICAgaW5jbHVkZUxlZ2FjeUZhbGxiYWNrOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8vIENsZWFyIHJlcGx5X3RvX2V2ZW50IGFzIHdlIHB1dCB0aGUgbWVzc2FnZSBpbnRvIHRoZSBxdWV1ZVxuICAgICAgICAgICAgICAgIC8vIGlmIHRoZSBzZW5kIGZhaWxzLCByZXRyeSB3aWxsIGhhbmRsZSByZXNlbmRpbmcuXG4gICAgICAgICAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdyZXBseV90b19ldmVudCcsXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50OiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0OiB0aGlzLmNvbnRleHQudGltZWxpbmVSZW5kZXJpbmdUeXBlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkb01heWJlTG9jYWxSb29tQWN0aW9uKFxuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMucm9vbS5yb29tSWQsXG4gICAgICAgICAgICAgICAgKGFjdHVhbFJvb21JZDogc3RyaW5nKSA9PiBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2VuZE1lc3NhZ2UoYWN0dWFsUm9vbUlkLCBjb250ZW50KSxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkVycm9yIHNlbmRpbmcgdm9pY2UgbWVzc2FnZTpcIiwgZSk7XG5cbiAgICAgICAgICAgIC8vIFZvaWNlIG1lc3NhZ2Ugc2hvdWxkIGJlIGluIHRoZSB0aW1lbGluZSBhdCB0aGlzIHBvaW50LCBzbyBsZXQgb3RoZXIgdGhpbmdzIHRha2UgY2FyZVxuICAgICAgICAgICAgLy8gb2YgZXJyb3IgaGFuZGxpbmcuIFdlIGFsc28gc2hvdWxkbid0IG5lZWQgdGhlIHJlY29yZGluZyBhbnltb3JlLCBzbyBmYWxsIHRocm91Z2ggdG9cbiAgICAgICAgICAgIC8vIGRpc3Bvc2FsLlxuICAgICAgICB9XG4gICAgICAgIGF3YWl0IHRoaXMuZGlzcG9zZVJlY29yZGluZygpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgZGlzcG9zZVJlY29yZGluZygpIHtcbiAgICAgICAgYXdhaXQgVm9pY2VSZWNvcmRpbmdTdG9yZS5pbnN0YW5jZS5kaXNwb3NlUmVjb3JkaW5nKHRoaXMudm9pY2VSZWNvcmRpbmdJZCk7XG5cbiAgICAgICAgLy8gUmVzZXQgYmFjayB0byBubyByZWNvcmRpbmcsIHdoaWNoIG1lYW5zIG5vIHBoYXNlIChpZTogcmVzdGFydCBjb21wb25lbnQgZW50aXJlbHkpXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyByZWNvcmRlcjogbnVsbCwgcmVjb3JkaW5nUGhhc2U6IG51bGwsIGRpZFVwbG9hZEZhaWw6IGZhbHNlIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25DYW5jZWwgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IHRoaXMuZGlzcG9zZVJlY29yZGluZygpO1xuICAgIH07XG5cbiAgICBwdWJsaWMgb25SZWNvcmRTdGFydEVuZENsaWNrID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5yZWNvcmRlcikge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zdGF0ZS5yZWNvcmRlci5zdG9wKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgXCJtaWNyb3Bob25lIGFjY2VzcyBlcnJvclwiIGRpYWxvZ3MgYXJlIHVzZWQgYSBsb3QsIHNvIGxldCdzIGZ1bmN0aW9uaWZ5IHRoZW1cbiAgICAgICAgY29uc3QgYWNjZXNzRXJyb3IgPSAoKSA9PiB7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJVbmFibGUgdG8gYWNjZXNzIHlvdXIgbWljcm9waG9uZVwiKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogPD5cbiAgICAgICAgICAgICAgICAgICAgPHA+eyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiV2Ugd2VyZSB1bmFibGUgdG8gYWNjZXNzIHlvdXIgbWljcm9waG9uZS4gUGxlYXNlIGNoZWNrIHlvdXIgYnJvd3NlciBzZXR0aW5ncyBhbmQgdHJ5IGFnYWluLlwiLFxuICAgICAgICAgICAgICAgICAgICApIH08L3A+XG4gICAgICAgICAgICAgICAgPC8+LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gRG8gYSBzYW5pdHkgdGVzdCB0byBlbnN1cmUgd2UncmUgYWJvdXQgdG8gZ3JhYiBhIHZhbGlkIG1pY3JvcGhvbmUgcmVmZXJlbmNlLiBUaGluZ3MgbWlnaHRcbiAgICAgICAgLy8gY2hhbmdlIGJldHdlZW4gdGhpcyBhbmQgcmVjb3JkaW5nLCBidXQgYXQgbGVhc3Qgd2Ugd2lsbCBoYXZlIHRyaWVkLlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZGV2aWNlcyA9IGF3YWl0IE1lZGlhRGV2aWNlSGFuZGxlci5nZXREZXZpY2VzKCk7XG4gICAgICAgICAgICBpZiAoIWRldmljZXM/LltNZWRpYURldmljZUtpbmRFbnVtLkF1ZGlvSW5wdXRdPy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiTm8gbWljcm9waG9uZSBmb3VuZFwiKSxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IDw+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cD57IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiV2UgZGlkbid0IGZpbmQgYSBtaWNyb3Bob25lIG9uIHlvdXIgZGV2aWNlLiBQbGVhc2UgY2hlY2sgeW91ciBzZXR0aW5ncyBhbmQgdHJ5IGFnYWluLlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgKSB9PC9wPlxuICAgICAgICAgICAgICAgICAgICA8Lz4sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gZWxzZSB3ZSBwcm9iYWJseSBoYXZlIGEgZGV2aWNlIHRoYXQgaXMgZ29vZCBlbm91Z2hcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiRXJyb3IgZ2V0dGluZyBkZXZpY2VzOiBcIiwgZSk7XG4gICAgICAgICAgICBhY2Nlc3NFcnJvcigpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHN0b3AgYW55IG5vaXNlcyB3aGljaCBtaWdodCBiZSBoYXBwZW5pbmdcbiAgICAgICAgICAgIFBsYXliYWNrTWFuYWdlci5pbnN0YW5jZS5wYXVzZUFsbEV4Y2VwdChudWxsKTtcbiAgICAgICAgICAgIGNvbnN0IHJlY29yZGVyID0gVm9pY2VSZWNvcmRpbmdTdG9yZS5pbnN0YW5jZS5zdGFydFJlY29yZGluZyh0aGlzLnZvaWNlUmVjb3JkaW5nSWQpO1xuICAgICAgICAgICAgYXdhaXQgcmVjb3JkZXIuc3RhcnQoKTtcblxuICAgICAgICAgICAgdGhpcy5iaW5kTmV3UmVjb3JkZXIocmVjb3JkZXIpO1xuXG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgcmVjb3JkZXIsIHJlY29yZGluZ1BoYXNlOiBSZWNvcmRpbmdTdGF0ZS5TdGFydGVkIH0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoXCJFcnJvciBzdGFydGluZyByZWNvcmRpbmc6IFwiLCBlKTtcbiAgICAgICAgICAgIGFjY2Vzc0Vycm9yKCk7XG5cbiAgICAgICAgICAgIC8vIG5vaW5zcGVjdGlvbiBFUzZNaXNzaW5nQXdhaXQgLSBpZiB0aGlzIGdvZXMgd3Jvbmcgd2UgZG9uJ3Qgd2FudCBpdCB0byBhZmZlY3QgdGhlIGNhbGwgc3RhY2tcbiAgICAgICAgICAgIFZvaWNlUmVjb3JkaW5nU3RvcmUuaW5zdGFuY2UuZGlzcG9zZVJlY29yZGluZyh0aGlzLnZvaWNlUmVjb3JkaW5nSWQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgYmluZE5ld1JlY29yZGVyKHJlY29yZGVyOiBPcHRpb25hbDxWb2ljZVJlY29yZGluZz4pIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucmVjb3JkZXIpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUucmVjb3JkZXIub2ZmKFVQREFURV9FVkVOVCwgdGhpcy5vblJlY29yZGluZ1VwZGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlY29yZGVyKSB7XG4gICAgICAgICAgICByZWNvcmRlci5vbihVUERBVEVfRVZFTlQsIHRoaXMub25SZWNvcmRpbmdVcGRhdGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblJlY29yZGluZ1VwZGF0ZSA9IChldjogUmVjb3JkaW5nU3RhdGUpID0+IHtcbiAgICAgICAgaWYgKGV2ID09PSBSZWNvcmRpbmdTdGF0ZS5FbmRpbmdTb29uKSByZXR1cm47IC8vIGlnbm9yZSB0aGlzIHN0YXRlOiBpdCBoYXMgbm8gVUkgcHVycG9zZSBoZXJlXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyByZWNvcmRpbmdQaGFzZTogZXYgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgcmVuZGVyV2F2ZWZvcm1BcmVhKCk6IFJlYWN0Tm9kZSB7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5yZWNvcmRlcikgcmV0dXJuIG51bGw7IC8vIG5vIHJlY29yZGVyIG1lYW5zIHdlJ3JlIG5vdCByZWNvcmRpbmc6IG5vIHdhdmVmb3JtXG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUucmVjb3JkaW5nUGhhc2UgIT09IFJlY29yZGluZ1N0YXRlLlN0YXJ0ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiA8UmVjb3JkaW5nUGxheWJhY2tcbiAgICAgICAgICAgICAgICBwbGF5YmFjaz17dGhpcy5zdGF0ZS5yZWNvcmRlci5nZXRQbGF5YmFjaygpfVxuICAgICAgICAgICAgICAgIGxheW91dD17UGxheWJhY2tMYXlvdXQuQ29tcG9zZXJ9XG4gICAgICAgICAgICAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG9ubHkgb3RoZXIgVUkgaXMgdGhlIHJlY29yZGluZy1pbi1wcm9ncmVzcyBVSVxuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9NZWRpYUJvZHkgbXhfVm9pY2VNZXNzYWdlUHJpbWFyeUNvbnRhaW5lciBteF9Wb2ljZVJlY29yZENvbXBvc2VyVGlsZV9yZWNvcmRpbmdcIj5cbiAgICAgICAgICAgIDxMaXZlUmVjb3JkaW5nQ2xvY2sgcmVjb3JkZXI9e3RoaXMuc3RhdGUucmVjb3JkZXJ9IC8+XG4gICAgICAgICAgICA8TGl2ZVJlY29yZGluZ1dhdmVmb3JtIHJlY29yZGVyPXt0aGlzLnN0YXRlLnJlY29yZGVyfSAvPlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlcigpOiBSZWFjdE5vZGUge1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUucmVjb3JkaW5nUGhhc2UpIHJldHVybiBudWxsO1xuXG4gICAgICAgIGxldCBzdG9wQnRuO1xuICAgICAgICBsZXQgZGVsZXRlQnV0dG9uO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5yZWNvcmRpbmdQaGFzZSA9PT0gUmVjb3JkaW5nU3RhdGUuU3RhcnRlZCkge1xuICAgICAgICAgICAgbGV0IHRvb2x0aXAgPSBfdChcIlNlbmQgdm9pY2UgbWVzc2FnZVwiKTtcbiAgICAgICAgICAgIGlmICghIXRoaXMuc3RhdGUucmVjb3JkZXIpIHtcbiAgICAgICAgICAgICAgICB0b29sdGlwID0gX3QoXCJTdG9wIHJlY29yZGluZ1wiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3RvcEJ0biA9IDxBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1ZvaWNlUmVjb3JkQ29tcG9zZXJUaWxlX3N0b3BcIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25SZWNvcmRTdGFydEVuZENsaWNrfVxuICAgICAgICAgICAgICAgIHRpdGxlPXt0b29sdGlwfVxuICAgICAgICAgICAgLz47XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5yZWNvcmRlciAmJiAhdGhpcy5zdGF0ZS5yZWNvcmRlcj8uaXNSZWNvcmRpbmcpIHtcbiAgICAgICAgICAgICAgICBzdG9wQnRuID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnJlY29yZGVyICYmIHRoaXMuc3RhdGUucmVjb3JkaW5nUGhhc2UgIT09IFJlY29yZGluZ1N0YXRlLlVwbG9hZGluZykge1xuICAgICAgICAgICAgZGVsZXRlQnV0dG9uID0gPEFjY2Vzc2libGVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPSdteF9Wb2ljZVJlY29yZENvbXBvc2VyVGlsZV9kZWxldGUnXG4gICAgICAgICAgICAgICAgdGl0bGU9e190KFwiRGVsZXRlXCIpfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25DYW5jZWx9XG4gICAgICAgICAgICAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB1cGxvYWRJbmRpY2F0b3I7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnJlY29yZGluZ1BoYXNlID09PSBSZWNvcmRpbmdTdGF0ZS5VcGxvYWRpbmcpIHtcbiAgICAgICAgICAgIHVwbG9hZEluZGljYXRvciA9IDxzcGFuIGNsYXNzTmFtZT0nbXhfVm9pY2VSZWNvcmRDb21wb3NlclRpbGVfdXBsb2FkaW5nU3RhdGUnPlxuICAgICAgICAgICAgICAgIDxJbmxpbmVTcGlubmVyIHc9ezE2fSBoPXsxNn0gLz5cbiAgICAgICAgICAgIDwvc3Bhbj47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5kaWRVcGxvYWRGYWlsICYmIHRoaXMuc3RhdGUucmVjb3JkaW5nUGhhc2UgPT09IFJlY29yZGluZ1N0YXRlLkVuZGVkKSB7XG4gICAgICAgICAgICB1cGxvYWRJbmRpY2F0b3IgPSA8c3BhbiBjbGFzc05hbWU9J214X1ZvaWNlUmVjb3JkQ29tcG9zZXJUaWxlX2ZhaWxlZFN0YXRlJz5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9J214X1ZvaWNlUmVjb3JkQ29tcG9zZXJUaWxlX3VwbG9hZFN0YXRlX2JhZGdlJz5cbiAgICAgICAgICAgICAgICAgICAgeyAvKiBOZWVkIHRvIHN0aWNrIHRoZSBiYWRnZSBpbiBhIHNwYW4gdG8gZW5zdXJlIGl0IGRvZXNuJ3QgY3JlYXRlIGEgYmxvY2sgY29tcG9uZW50ICovIH1cbiAgICAgICAgICAgICAgICAgICAgPE5vdGlmaWNhdGlvbkJhZGdlXG4gICAgICAgICAgICAgICAgICAgICAgICBub3RpZmljYXRpb249e1N0YXRpY05vdGlmaWNhdGlvblN0YXRlLmZvclN5bWJvbChcIiFcIiwgTm90aWZpY2F0aW9uQ29sb3IuUmVkKX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPSd0ZXh0LXdhcm5pbmcnPnsgX3QoXCJGYWlsZWQgdG8gc2VuZFwiKSB9PC9zcGFuPlxuICAgICAgICAgICAgPC9zcGFuPjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoPD5cbiAgICAgICAgICAgIHsgdXBsb2FkSW5kaWNhdG9yIH1cbiAgICAgICAgICAgIHsgZGVsZXRlQnV0dG9uIH1cbiAgICAgICAgICAgIHsgc3RvcEJ0biB9XG4gICAgICAgICAgICB7IHRoaXMucmVuZGVyV2F2ZWZvcm1BcmVhKCkgfVxuICAgICAgICA8Lz4pO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBQ0E7O0FBSUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7Ozs7OztBQTdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBOENBO0FBQ0E7QUFDQTtBQUNlLE1BQU1BLHVCQUFOLFNBQXNDQyxjQUFBLENBQU1DLGFBQTVDLENBQTBFO0VBSzlFQyxXQUFXLENBQUNDLEtBQUQsRUFBZ0I7SUFDOUIsTUFBTUEsS0FBTjtJQUQ4QjtJQUFBO0lBQUEsZ0RBMEhmLFlBQVk7TUFDM0IsTUFBTSxLQUFLQyxnQkFBTCxFQUFOO0lBQ0gsQ0E1SGlDO0lBQUEsNkRBOEhILFlBQVk7TUFDdkMsSUFBSSxLQUFLQyxLQUFMLENBQVdDLFFBQWYsRUFBeUI7UUFDckIsTUFBTSxLQUFLRCxLQUFMLENBQVdDLFFBQVgsQ0FBb0JDLElBQXBCLEVBQU47UUFDQTtNQUNILENBSnNDLENBTXZDOzs7TUFDQSxNQUFNQyxXQUFXLEdBQUcsTUFBTTtRQUN0QkMsY0FBQSxDQUFNQyxZQUFOLENBQW1CQyxvQkFBbkIsRUFBZ0M7VUFDNUJDLEtBQUssRUFBRSxJQUFBQyxtQkFBQSxFQUFHLGtDQUFILENBRHFCO1VBRTVCQyxXQUFXLGVBQUUseUVBQ1Qsd0NBQUssSUFBQUQsbUJBQUEsRUFDRCw2RkFEQyxDQUFMLENBRFM7UUFGZSxDQUFoQztNQVFILENBVEQsQ0FQdUMsQ0FrQnZDO01BQ0E7OztNQUNBLElBQUk7UUFDQSxNQUFNRSxPQUFPLEdBQUcsTUFBTUMsMkJBQUEsQ0FBbUJDLFVBQW5CLEVBQXRCOztRQUNBLElBQUksQ0FBQ0YsT0FBTyxHQUFHRyx1Q0FBQSxDQUFvQkMsVUFBdkIsQ0FBUCxFQUEyQ0MsTUFBaEQsRUFBd0Q7VUFDcERYLGNBQUEsQ0FBTUMsWUFBTixDQUFtQkMsb0JBQW5CLEVBQWdDO1lBQzVCQyxLQUFLLEVBQUUsSUFBQUMsbUJBQUEsRUFBRyxxQkFBSCxDQURxQjtZQUU1QkMsV0FBVyxlQUFFLHlFQUNULHdDQUFLLElBQUFELG1CQUFBLEVBQ0QsdUZBREMsQ0FBTCxDQURTO1VBRmUsQ0FBaEM7O1VBUUE7UUFDSCxDQVpELENBYUE7O01BQ0gsQ0FkRCxDQWNFLE9BQU9RLENBQVAsRUFBVTtRQUNSQyxjQUFBLENBQU9DLEtBQVAsQ0FBYSx5QkFBYixFQUF3Q0YsQ0FBeEM7O1FBQ0FiLFdBQVc7UUFDWDtNQUNIOztNQUVELElBQUk7UUFDQTtRQUNBZ0IsZ0NBQUEsQ0FBZ0JDLFFBQWhCLENBQXlCQyxjQUF6QixDQUF3QyxJQUF4Qzs7UUFDQSxNQUFNcEIsUUFBUSxHQUFHcUIsd0NBQUEsQ0FBb0JGLFFBQXBCLENBQTZCRyxjQUE3QixDQUE0QyxLQUFLQyxnQkFBakQsQ0FBakI7O1FBQ0EsTUFBTXZCLFFBQVEsQ0FBQ3dCLEtBQVQsRUFBTjtRQUVBLEtBQUtDLGVBQUwsQ0FBcUJ6QixRQUFyQjtRQUVBLEtBQUswQixRQUFMLENBQWM7VUFBRTFCLFFBQUY7VUFBWTJCLGNBQWMsRUFBRUMsOEJBQUEsQ0FBZUM7UUFBM0MsQ0FBZDtNQUNILENBVEQsQ0FTRSxPQUFPZCxDQUFQLEVBQVU7UUFDUkMsY0FBQSxDQUFPQyxLQUFQLENBQWEsNEJBQWIsRUFBMkNGLENBQTNDOztRQUNBYixXQUFXLEdBRkgsQ0FJUjs7UUFDQW1CLHdDQUFBLENBQW9CRixRQUFwQixDQUE2QnJCLGdCQUE3QixDQUE4QyxLQUFLeUIsZ0JBQW5EO01BQ0g7SUFDSixDQXRMaUM7SUFBQSx5REFpTUxPLEVBQUQsSUFBd0I7TUFDaEQsSUFBSUEsRUFBRSxLQUFLRiw4QkFBQSxDQUFlRyxVQUExQixFQUFzQyxPQURVLENBQ0Y7O01BQzlDLEtBQUtMLFFBQUwsQ0FBYztRQUFFQyxjQUFjLEVBQUVHO01BQWxCLENBQWQ7SUFDSCxDQXBNaUM7SUFHOUIsS0FBSy9CLEtBQUwsR0FBYTtNQUNUQyxRQUFRLEVBQUUsSUFERCxDQUNPOztJQURQLENBQWI7SUFJQSxLQUFLdUIsZ0JBQUwsR0FBd0JGLHdDQUFBLENBQW9CVyxtQkFBcEIsQ0FBd0MsS0FBS25DLEtBQUwsQ0FBV29DLElBQW5ELEVBQXlELEtBQUtwQyxLQUFMLENBQVdxQyxRQUFwRSxDQUF4QjtFQUNIOztFQUVNQyxpQkFBaUIsR0FBRztJQUN2QixNQUFNbkMsUUFBUSxHQUFHcUIsd0NBQUEsQ0FBb0JGLFFBQXBCLENBQTZCaUIsa0JBQTdCLENBQWdELEtBQUtiLGdCQUFyRCxDQUFqQjs7SUFDQSxJQUFJdkIsUUFBSixFQUFjO01BQ1YsSUFBSUEsUUFBUSxDQUFDcUMsV0FBVCxJQUF3QixDQUFDckMsUUFBUSxDQUFDc0MsWUFBdEMsRUFBb0Q7UUFDaER0QixjQUFBLENBQU91QixJQUFQLENBQVksMERBQVo7TUFDSDs7TUFDRCxLQUFLZCxlQUFMLENBQXFCekIsUUFBckI7TUFDQSxLQUFLMEIsUUFBTCxDQUFjO1FBQUUxQixRQUFGO1FBQVkyQixjQUFjLEVBQUVDLDhCQUFBLENBQWVZO01BQTNDLENBQWQ7SUFDSDtFQUNKOztFQUVnQyxNQUFwQkMsb0JBQW9CLEdBQUc7SUFDaEM7SUFDQTtJQUNBLE1BQU1DLFNBQVMsR0FBR3JCLHdDQUFBLENBQW9CRixRQUFwQixDQUE2QmlCLGtCQUE3QixDQUFnRCxLQUFLYixnQkFBckQsQ0FBbEI7O0lBQ0EsTUFBTW1CLFNBQVMsRUFBRXpDLElBQVgsRUFBTixDQUpnQyxDQU1oQzs7SUFDQSxLQUFLd0IsZUFBTCxDQUFxQixJQUFyQjtFQUNILENBbENvRixDQW9DckY7OztFQUNpQixNQUFKa0IsSUFBSSxHQUFHO0lBQ2hCLElBQUksQ0FBQyxLQUFLNUMsS0FBTCxDQUFXQyxRQUFoQixFQUEwQjtNQUN0QixNQUFNLElBQUk0QyxLQUFKLENBQVUsNkNBQVYsQ0FBTjtJQUNIOztJQUVELE1BQU07TUFBRUMsWUFBRjtNQUFnQlgsUUFBaEI7TUFBMEJZO0lBQTFCLElBQStDLEtBQUtqRCxLQUExRDtJQUVBLE1BQU0sS0FBS0UsS0FBTCxDQUFXQyxRQUFYLENBQW9CQyxJQUFwQixFQUFOO0lBRUEsSUFBSThDLE1BQUo7O0lBQ0EsSUFBSTtNQUNBQSxNQUFNLEdBQUcsTUFBTSxLQUFLaEQsS0FBTCxDQUFXQyxRQUFYLENBQW9CK0MsTUFBcEIsQ0FBMkIsS0FBS3hCLGdCQUFoQyxDQUFmO0lBQ0gsQ0FGRCxDQUVFLE9BQU9SLENBQVAsRUFBVTtNQUNSQyxjQUFBLENBQU9DLEtBQVAsQ0FBYSxnQ0FBYixFQUErQ0YsQ0FBL0MsRUFEUSxDQUdSOzs7TUFDQSxLQUFLVyxRQUFMLENBQWM7UUFBRXNCLGFBQWEsRUFBRTtNQUFqQixDQUFkO01BRUEsT0FOUSxDQU1BO0lBQ1g7O0lBRUQsSUFBSTtNQUNBO01BQ0EsTUFBTUMsT0FBTyxHQUFHO1FBQ1osUUFBUSxlQURJO1FBRVo7UUFDQSxXQUFXQyxjQUFBLENBQVFDLEtBSFA7UUFJWixPQUFPSixNQUFNLENBQUNLLEdBSkY7UUFLWixRQUFRTCxNQUFNLENBQUNNLFNBTEg7UUFNWixRQUFRO1VBQ0pDLFFBQVEsRUFBRUMsSUFBSSxDQUFDQyxLQUFMLENBQVcsS0FBS3pELEtBQUwsQ0FBV0MsUUFBWCxDQUFvQnlELGVBQXBCLEdBQXNDLElBQWpELENBRE47VUFFSkMsUUFBUSxFQUFFLEtBQUszRCxLQUFMLENBQVdDLFFBQVgsQ0FBb0IyRCxXQUYxQjtVQUdKQyxJQUFJLEVBQUUsS0FBSzdELEtBQUwsQ0FBV0MsUUFBWCxDQUFvQjZEO1FBSHRCLENBTkk7UUFZWjtRQUNBO1FBQ0EsMkJBQTJCLGVBZGY7UUFlWiwyQkFBMkI7VUFDdkJDLEdBQUcsRUFBRWYsTUFBTSxDQUFDSyxHQURXO1VBRXZCVyxJQUFJLEVBQUVoQixNQUFNLENBQUNNLFNBRlU7VUFHdkJXLElBQUksRUFBRSxtQkFIaUI7VUFJdkJOLFFBQVEsRUFBRSxLQUFLM0QsS0FBTCxDQUFXQyxRQUFYLENBQW9CMkQsV0FKUDtVQUt2QkMsSUFBSSxFQUFFLEtBQUs3RCxLQUFMLENBQVdDLFFBQVgsQ0FBb0I2RDtRQUxILENBZmY7UUFzQlosNEJBQTRCO1VBQ3hCUCxRQUFRLEVBQUVDLElBQUksQ0FBQ0MsS0FBTCxDQUFXLEtBQUt6RCxLQUFMLENBQVdDLFFBQVgsQ0FBb0J5RCxlQUFwQixHQUFzQyxJQUFqRCxDQURjO1VBR3hCO1VBQ0FRLFFBQVEsRUFBRSxLQUFLbEUsS0FBTCxDQUFXQyxRQUFYLENBQW9Ca0UsV0FBcEIsR0FBa0NDLGlCQUFsQyxDQUFvREMsR0FBcEQsQ0FBd0RDLENBQUMsSUFBSWQsSUFBSSxDQUFDQyxLQUFMLENBQVdhLENBQUMsR0FBRyxJQUFmLENBQTdEO1FBSmMsQ0F0QmhCO1FBNEJaLDRCQUE0QixFQTVCaEIsQ0E0Qm9COztNQTVCcEIsQ0FBaEI7TUErQkEsSUFBQUMsbUNBQUEsRUFBZXJCLE9BQWYsRUFBd0JmLFFBQXhCOztNQUNBLElBQUlXLFlBQUosRUFBa0I7UUFDZCxJQUFBMEIsK0JBQUEsRUFBeUJ0QixPQUF6QixFQUFrQ0osWUFBbEMsRUFBZ0Q7VUFDNUNDLGdCQUQ0QztVQUU1QzBCLHFCQUFxQixFQUFFO1FBRnFCLENBQWhELEVBRGMsQ0FLZDtRQUNBOztRQUNBQyxtQkFBQSxDQUFrQkMsUUFBbEIsQ0FBMkI7VUFDdkJDLE1BQU0sRUFBRSxnQkFEZTtVQUV2QkMsS0FBSyxFQUFFLElBRmdCO1VBR3ZCQyxPQUFPLEVBQUUsS0FBS0EsT0FBTCxDQUFhQztRQUhDLENBQTNCO01BS0g7O01BRUQsSUFBQUMsaUNBQUEsRUFDSSxLQUFLbEYsS0FBTCxDQUFXb0MsSUFBWCxDQUFnQitDLE1BRHBCLEVBRUtDLFlBQUQsSUFBMEJDLGdDQUFBLENBQWdCQyxHQUFoQixHQUFzQkMsV0FBdEIsQ0FBa0NILFlBQWxDLEVBQWdEaEMsT0FBaEQsQ0FGOUI7SUFJSCxDQXBERCxDQW9ERSxPQUFPbEMsQ0FBUCxFQUFVO01BQ1JDLGNBQUEsQ0FBT0MsS0FBUCxDQUFhLDhCQUFiLEVBQTZDRixDQUE3QyxFQURRLENBR1I7TUFDQTtNQUNBOztJQUNIOztJQUNELE1BQU0sS0FBS2pCLGdCQUFMLEVBQU47RUFDSDs7RUFFNkIsTUFBaEJBLGdCQUFnQixHQUFHO0lBQzdCLE1BQU11Qix3Q0FBQSxDQUFvQkYsUUFBcEIsQ0FBNkJyQixnQkFBN0IsQ0FBOEMsS0FBS3lCLGdCQUFuRCxDQUFOLENBRDZCLENBRzdCOztJQUNBLEtBQUtHLFFBQUwsQ0FBYztNQUFFMUIsUUFBUSxFQUFFLElBQVo7TUFBa0IyQixjQUFjLEVBQUUsSUFBbEM7TUFBd0NxQixhQUFhLEVBQUU7SUFBdkQsQ0FBZDtFQUNIOztFQWdFT3ZCLGVBQWUsQ0FBQ3pCLFFBQUQsRUFBcUM7SUFDeEQsSUFBSSxLQUFLRCxLQUFMLENBQVdDLFFBQWYsRUFBeUI7TUFDckIsS0FBS0QsS0FBTCxDQUFXQyxRQUFYLENBQW9CcUYsR0FBcEIsQ0FBd0JDLHdCQUF4QixFQUFzQyxLQUFLQyxpQkFBM0M7SUFDSDs7SUFDRCxJQUFJdkYsUUFBSixFQUFjO01BQ1ZBLFFBQVEsQ0FBQ3dGLEVBQVQsQ0FBWUYsd0JBQVosRUFBMEIsS0FBS0MsaUJBQS9CO0lBQ0g7RUFDSjs7RUFPT0Usa0JBQWtCLEdBQWM7SUFDcEMsSUFBSSxDQUFDLEtBQUsxRixLQUFMLENBQVdDLFFBQWhCLEVBQTBCLE9BQU8sSUFBUCxDQURVLENBQ0c7O0lBRXZDLElBQUksS0FBS0QsS0FBTCxDQUFXNEIsY0FBWCxLQUE4QkMsOEJBQUEsQ0FBZUMsT0FBakQsRUFBMEQ7TUFDdEQsb0JBQU8sNkJBQUMsMEJBQUQ7UUFDSCxRQUFRLEVBQUUsS0FBSzlCLEtBQUwsQ0FBV0MsUUFBWCxDQUFvQmtFLFdBQXBCLEVBRFA7UUFFSCxNQUFNLEVBQUV3QixpQ0FBQSxDQUFlQztNQUZwQixFQUFQO0lBSUgsQ0FSbUMsQ0FVcEM7OztJQUNBLG9CQUFPO01BQUssU0FBUyxFQUFDO0lBQWYsZ0JBQ0gsNkJBQUMsMkJBQUQ7TUFBb0IsUUFBUSxFQUFFLEtBQUs1RixLQUFMLENBQVdDO0lBQXpDLEVBREcsZUFFSCw2QkFBQyw4QkFBRDtNQUF1QixRQUFRLEVBQUUsS0FBS0QsS0FBTCxDQUFXQztJQUE1QyxFQUZHLENBQVA7RUFJSDs7RUFFTTRGLE1BQU0sR0FBYztJQUN2QixJQUFJLENBQUMsS0FBSzdGLEtBQUwsQ0FBVzRCLGNBQWhCLEVBQWdDLE9BQU8sSUFBUDtJQUVoQyxJQUFJa0UsT0FBSjtJQUNBLElBQUlDLFlBQUo7O0lBQ0EsSUFBSSxLQUFLL0YsS0FBTCxDQUFXNEIsY0FBWCxLQUE4QkMsOEJBQUEsQ0FBZUMsT0FBakQsRUFBMEQ7TUFDdEQsSUFBSWtFLE9BQU8sR0FBRyxJQUFBeEYsbUJBQUEsRUFBRyxvQkFBSCxDQUFkOztNQUNBLElBQUksQ0FBQyxDQUFDLEtBQUtSLEtBQUwsQ0FBV0MsUUFBakIsRUFBMkI7UUFDdkIrRixPQUFPLEdBQUcsSUFBQXhGLG1CQUFBLEVBQUcsZ0JBQUgsQ0FBVjtNQUNIOztNQUVEc0YsT0FBTyxnQkFBRyw2QkFBQyxnQ0FBRDtRQUNOLFNBQVMsRUFBQyxpQ0FESjtRQUVOLE9BQU8sRUFBRSxLQUFLRyxxQkFGUjtRQUdOLEtBQUssRUFBRUQ7TUFIRCxFQUFWOztNQUtBLElBQUksS0FBS2hHLEtBQUwsQ0FBV0MsUUFBWCxJQUF1QixDQUFDLEtBQUtELEtBQUwsQ0FBV0MsUUFBWCxFQUFxQnFDLFdBQWpELEVBQThEO1FBQzFEd0QsT0FBTyxHQUFHLElBQVY7TUFDSDtJQUNKOztJQUVELElBQUksS0FBSzlGLEtBQUwsQ0FBV0MsUUFBWCxJQUF1QixLQUFLRCxLQUFMLENBQVc0QixjQUFYLEtBQThCQyw4QkFBQSxDQUFlcUUsU0FBeEUsRUFBbUY7TUFDL0VILFlBQVksZ0JBQUcsNkJBQUMsZ0NBQUQ7UUFDWCxTQUFTLEVBQUMsbUNBREM7UUFFWCxLQUFLLEVBQUUsSUFBQXZGLG1CQUFBLEVBQUcsUUFBSCxDQUZJO1FBR1gsT0FBTyxFQUFFLEtBQUsyRjtNQUhILEVBQWY7SUFLSDs7SUFFRCxJQUFJQyxlQUFKOztJQUNBLElBQUksS0FBS3BHLEtBQUwsQ0FBVzRCLGNBQVgsS0FBOEJDLDhCQUFBLENBQWVxRSxTQUFqRCxFQUE0RDtNQUN4REUsZUFBZSxnQkFBRztRQUFNLFNBQVMsRUFBQztNQUFoQixnQkFDZCw2QkFBQyxzQkFBRDtRQUFlLENBQUMsRUFBRSxFQUFsQjtRQUFzQixDQUFDLEVBQUU7TUFBekIsRUFEYyxDQUFsQjtJQUdILENBSkQsTUFJTyxJQUFJLEtBQUtwRyxLQUFMLENBQVdpRCxhQUFYLElBQTRCLEtBQUtqRCxLQUFMLENBQVc0QixjQUFYLEtBQThCQyw4QkFBQSxDQUFlWSxLQUE3RSxFQUFvRjtNQUN2RjJELGVBQWUsZ0JBQUc7UUFBTSxTQUFTLEVBQUM7TUFBaEIsZ0JBQ2Q7UUFBTSxTQUFTLEVBQUM7TUFBaEIsZ0JBRUksNkJBQUMsMEJBQUQ7UUFDSSxZQUFZLEVBQUVDLGdEQUFBLENBQXdCQyxTQUF4QixDQUFrQyxHQUFsQyxFQUF1Q0Msb0NBQUEsQ0FBa0JDLEdBQXpEO01BRGxCLEVBRkosQ0FEYyxlQU9kO1FBQU0sU0FBUyxFQUFDO01BQWhCLEdBQWlDLElBQUFoRyxtQkFBQSxFQUFHLGdCQUFILENBQWpDLENBUGMsQ0FBbEI7SUFTSDs7SUFFRCxvQkFBUSw0REFDRjRGLGVBREUsRUFFRkwsWUFGRSxFQUdGRCxPQUhFLEVBSUYsS0FBS0osa0JBQUwsRUFKRSxDQUFSO0VBTUg7O0FBaFJvRjs7OzhCQUFwRWhHLHVCLGlCQUNJK0csb0IifQ==