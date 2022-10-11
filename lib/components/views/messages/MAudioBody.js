"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _InlineSpinner = _interopRequireDefault(require("../elements/InlineSpinner"));

var _languageHandler = require("../../../languageHandler");

var _AudioPlayer = _interopRequireDefault(require("../audio_messages/AudioPlayer"));

var _MFileBody = _interopRequireDefault(require("./MFileBody"));

var _PlaybackManager = require("../../../audio/PlaybackManager");

var _EventUtils = require("../../../utils/EventUtils");

var _PlaybackQueue = require("../../../audio/PlaybackQueue");

var _RoomContext = _interopRequireWildcard(require("../../../contexts/RoomContext"));

var _MediaProcessingError = _interopRequireDefault(require("./shared/MediaProcessingError"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2021 The Matrix.org Foundation C.I.C.

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
class MAudioBody extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "context", void 0);
    this.state = {};
  }

  async componentDidMount() {
    let buffer;

    try {
      try {
        const blob = await this.props.mediaEventHelper.sourceBlob.value;
        buffer = await blob.arrayBuffer();
      } catch (e) {
        this.setState({
          error: e
        });

        _logger.logger.warn("Unable to decrypt audio message", e);

        return; // stop processing the audio file
      }
    } catch (e) {
      this.setState({
        error: e
      });

      _logger.logger.warn("Unable to decrypt/download audio message", e);

      return; // stop processing the audio file
    } // We should have a buffer to work with now: let's set it up
    // Note: we don't actually need a waveform to render an audio event, but voice messages do.


    const content = this.props.mxEvent.getContent();
    const waveform = content?.["org.matrix.msc1767.audio"]?.waveform?.map(p => p / 1024); // We should have a buffer to work with now: let's set it up

    const playback = _PlaybackManager.PlaybackManager.instance.createPlaybackInstance(buffer, waveform);

    playback.clockInfo.populatePlaceholdersFrom(this.props.mxEvent);
    this.setState({
      playback
    });

    if ((0, _EventUtils.isVoiceMessage)(this.props.mxEvent)) {
      _PlaybackQueue.PlaybackQueue.forRoom(this.props.mxEvent.getRoomId()).unsortedEnqueue(this.props.mxEvent, playback);
    } // Note: the components later on will handle preparing the Playback class for us.

  }

  componentWillUnmount() {
    this.state.playback?.destroy();
  }

  get showFileBody() {
    return this.context.timelineRenderingType !== _RoomContext.TimelineRenderingType.Room && this.context.timelineRenderingType !== _RoomContext.TimelineRenderingType.Pinned && this.context.timelineRenderingType !== _RoomContext.TimelineRenderingType.Search;
  }

  render() {
    if (this.state.error) {
      return /*#__PURE__*/_react.default.createElement(_MediaProcessingError.default, {
        className: "mx_MAudioBody"
      }, (0, _languageHandler._t)("Error processing audio message"));
    }

    if (this.props.forExport) {
      const content = this.props.mxEvent.getContent(); // During export, the content url will point to the MSC, which will later point to a local url

      const contentUrl = content.file?.url || content.url;
      return /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_MAudioBody"
      }, /*#__PURE__*/_react.default.createElement("audio", {
        src: contentUrl,
        controls: true
      }));
    }

    if (!this.state.playback) {
      return /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_MAudioBody"
      }, /*#__PURE__*/_react.default.createElement(_InlineSpinner.default, null));
    } // At this point we should have a playable state


    return /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_MAudioBody"
    }, /*#__PURE__*/_react.default.createElement(_AudioPlayer.default, {
      playback: this.state.playback,
      mediaName: this.props.mxEvent.getContent().body
    }), this.showFileBody && /*#__PURE__*/_react.default.createElement(_MFileBody.default, (0, _extends2.default)({}, this.props, {
      showGenericPlaceholder: false
    })));
  }

}

exports.default = MAudioBody;
(0, _defineProperty2.default)(MAudioBody, "contextType", _RoomContext.default);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNQXVkaW9Cb2R5IiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInN0YXRlIiwiY29tcG9uZW50RGlkTW91bnQiLCJidWZmZXIiLCJibG9iIiwibWVkaWFFdmVudEhlbHBlciIsInNvdXJjZUJsb2IiLCJ2YWx1ZSIsImFycmF5QnVmZmVyIiwiZSIsInNldFN0YXRlIiwiZXJyb3IiLCJsb2dnZXIiLCJ3YXJuIiwiY29udGVudCIsIm14RXZlbnQiLCJnZXRDb250ZW50Iiwid2F2ZWZvcm0iLCJtYXAiLCJwIiwicGxheWJhY2siLCJQbGF5YmFja01hbmFnZXIiLCJpbnN0YW5jZSIsImNyZWF0ZVBsYXliYWNrSW5zdGFuY2UiLCJjbG9ja0luZm8iLCJwb3B1bGF0ZVBsYWNlaG9sZGVyc0Zyb20iLCJpc1ZvaWNlTWVzc2FnZSIsIlBsYXliYWNrUXVldWUiLCJmb3JSb29tIiwiZ2V0Um9vbUlkIiwidW5zb3J0ZWRFbnF1ZXVlIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJkZXN0cm95Iiwic2hvd0ZpbGVCb2R5IiwiY29udGV4dCIsInRpbWVsaW5lUmVuZGVyaW5nVHlwZSIsIlRpbWVsaW5lUmVuZGVyaW5nVHlwZSIsIlJvb20iLCJQaW5uZWQiLCJTZWFyY2giLCJyZW5kZXIiLCJfdCIsImZvckV4cG9ydCIsImNvbnRlbnRVcmwiLCJmaWxlIiwidXJsIiwiYm9keSIsIlJvb21Db250ZXh0Il0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvbWVzc2FnZXMvTUF1ZGlvQm9keS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuXG5pbXBvcnQgeyBQbGF5YmFjayB9IGZyb20gXCIuLi8uLi8uLi9hdWRpby9QbGF5YmFja1wiO1xuaW1wb3J0IElubGluZVNwaW5uZXIgZnJvbSAnLi4vZWxlbWVudHMvSW5saW5lU3Bpbm5lcic7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBBdWRpb1BsYXllciBmcm9tIFwiLi4vYXVkaW9fbWVzc2FnZXMvQXVkaW9QbGF5ZXJcIjtcbmltcG9ydCB7IElNZWRpYUV2ZW50Q29udGVudCB9IGZyb20gXCIuLi8uLi8uLi9jdXN0b21pc2F0aW9ucy9tb2RlbHMvSU1lZGlhRXZlbnRDb250ZW50XCI7XG5pbXBvcnQgTUZpbGVCb2R5IGZyb20gXCIuL01GaWxlQm9keVwiO1xuaW1wb3J0IHsgSUJvZHlQcm9wcyB9IGZyb20gXCIuL0lCb2R5UHJvcHNcIjtcbmltcG9ydCB7IFBsYXliYWNrTWFuYWdlciB9IGZyb20gXCIuLi8uLi8uLi9hdWRpby9QbGF5YmFja01hbmFnZXJcIjtcbmltcG9ydCB7IGlzVm9pY2VNZXNzYWdlIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL0V2ZW50VXRpbHNcIjtcbmltcG9ydCB7IFBsYXliYWNrUXVldWUgfSBmcm9tIFwiLi4vLi4vLi4vYXVkaW8vUGxheWJhY2tRdWV1ZVwiO1xuaW1wb3J0IFJvb21Db250ZXh0LCB7IFRpbWVsaW5lUmVuZGVyaW5nVHlwZSB9IGZyb20gXCIuLi8uLi8uLi9jb250ZXh0cy9Sb29tQ29udGV4dFwiO1xuaW1wb3J0IE1lZGlhUHJvY2Vzc2luZ0Vycm9yIGZyb20gXCIuL3NoYXJlZC9NZWRpYVByb2Nlc3NpbmdFcnJvclwiO1xuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBlcnJvcj86IEVycm9yO1xuICAgIHBsYXliYWNrPzogUGxheWJhY2s7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1BdWRpb0JvZHkgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElCb2R5UHJvcHMsIElTdGF0ZT4ge1xuICAgIHN0YXRpYyBjb250ZXh0VHlwZSA9IFJvb21Db250ZXh0O1xuICAgIHB1YmxpYyBjb250ZXh0ITogUmVhY3QuQ29udGV4dFR5cGU8dHlwZW9mIFJvb21Db250ZXh0PjtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBJQm9keVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge307XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBsZXQgYnVmZmVyOiBBcnJheUJ1ZmZlcjtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBibG9iID0gYXdhaXQgdGhpcy5wcm9wcy5tZWRpYUV2ZW50SGVscGVyLnNvdXJjZUJsb2IudmFsdWU7XG4gICAgICAgICAgICAgICAgYnVmZmVyID0gYXdhaXQgYmxvYi5hcnJheUJ1ZmZlcigpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBlcnJvcjogZSB9KTtcbiAgICAgICAgICAgICAgICBsb2dnZXIud2FybihcIlVuYWJsZSB0byBkZWNyeXB0IGF1ZGlvIG1lc3NhZ2VcIiwgZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuOyAvLyBzdG9wIHByb2Nlc3NpbmcgdGhlIGF1ZGlvIGZpbGVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVycm9yOiBlIH0pO1xuICAgICAgICAgICAgbG9nZ2VyLndhcm4oXCJVbmFibGUgdG8gZGVjcnlwdC9kb3dubG9hZCBhdWRpbyBtZXNzYWdlXCIsIGUpO1xuICAgICAgICAgICAgcmV0dXJuOyAvLyBzdG9wIHByb2Nlc3NpbmcgdGhlIGF1ZGlvIGZpbGVcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdlIHNob3VsZCBoYXZlIGEgYnVmZmVyIHRvIHdvcmsgd2l0aCBub3c6IGxldCdzIHNldCBpdCB1cFxuXG4gICAgICAgIC8vIE5vdGU6IHdlIGRvbid0IGFjdHVhbGx5IG5lZWQgYSB3YXZlZm9ybSB0byByZW5kZXIgYW4gYXVkaW8gZXZlbnQsIGJ1dCB2b2ljZSBtZXNzYWdlcyBkby5cbiAgICAgICAgY29uc3QgY29udGVudCA9IHRoaXMucHJvcHMubXhFdmVudC5nZXRDb250ZW50PElNZWRpYUV2ZW50Q29udGVudD4oKTtcbiAgICAgICAgY29uc3Qgd2F2ZWZvcm0gPSBjb250ZW50Py5bXCJvcmcubWF0cml4Lm1zYzE3NjcuYXVkaW9cIl0/LndhdmVmb3JtPy5tYXAocCA9PiBwIC8gMTAyNCk7XG5cbiAgICAgICAgLy8gV2Ugc2hvdWxkIGhhdmUgYSBidWZmZXIgdG8gd29yayB3aXRoIG5vdzogbGV0J3Mgc2V0IGl0IHVwXG4gICAgICAgIGNvbnN0IHBsYXliYWNrID0gUGxheWJhY2tNYW5hZ2VyLmluc3RhbmNlLmNyZWF0ZVBsYXliYWNrSW5zdGFuY2UoYnVmZmVyLCB3YXZlZm9ybSk7XG4gICAgICAgIHBsYXliYWNrLmNsb2NrSW5mby5wb3B1bGF0ZVBsYWNlaG9sZGVyc0Zyb20odGhpcy5wcm9wcy5teEV2ZW50KTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBsYXliYWNrIH0pO1xuXG4gICAgICAgIGlmIChpc1ZvaWNlTWVzc2FnZSh0aGlzLnByb3BzLm14RXZlbnQpKSB7XG4gICAgICAgICAgICBQbGF5YmFja1F1ZXVlLmZvclJvb20odGhpcy5wcm9wcy5teEV2ZW50LmdldFJvb21JZCgpKS51bnNvcnRlZEVucXVldWUodGhpcy5wcm9wcy5teEV2ZW50LCBwbGF5YmFjayk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb3RlOiB0aGUgY29tcG9uZW50cyBsYXRlciBvbiB3aWxsIGhhbmRsZSBwcmVwYXJpbmcgdGhlIFBsYXliYWNrIGNsYXNzIGZvciB1cy5cbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIHRoaXMuc3RhdGUucGxheWJhY2s/LmRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZ2V0IHNob3dGaWxlQm9keSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGV4dC50aW1lbGluZVJlbmRlcmluZ1R5cGUgIT09IFRpbWVsaW5lUmVuZGVyaW5nVHlwZS5Sb29tICYmXG4gICAgICAgICAgICB0aGlzLmNvbnRleHQudGltZWxpbmVSZW5kZXJpbmdUeXBlICE9PSBUaW1lbGluZVJlbmRlcmluZ1R5cGUuUGlubmVkICYmXG4gICAgICAgICAgICB0aGlzLmNvbnRleHQudGltZWxpbmVSZW5kZXJpbmdUeXBlICE9PSBUaW1lbGluZVJlbmRlcmluZ1R5cGUuU2VhcmNoO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmVycm9yKSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxNZWRpYVByb2Nlc3NpbmdFcnJvciBjbGFzc05hbWU9XCJteF9NQXVkaW9Cb2R5XCI+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJFcnJvciBwcm9jZXNzaW5nIGF1ZGlvIG1lc3NhZ2VcIikgfVxuICAgICAgICAgICAgICAgIDwvTWVkaWFQcm9jZXNzaW5nRXJyb3I+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZm9yRXhwb3J0KSB7XG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gdGhpcy5wcm9wcy5teEV2ZW50LmdldENvbnRlbnQoKTtcbiAgICAgICAgICAgIC8vIER1cmluZyBleHBvcnQsIHRoZSBjb250ZW50IHVybCB3aWxsIHBvaW50IHRvIHRoZSBNU0MsIHdoaWNoIHdpbGwgbGF0ZXIgcG9pbnQgdG8gYSBsb2NhbCB1cmxcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnRVcmwgPSBjb250ZW50LmZpbGU/LnVybCB8fCBjb250ZW50LnVybDtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfTUF1ZGlvQm9keVwiPlxuICAgICAgICAgICAgICAgICAgICA8YXVkaW8gc3JjPXtjb250ZW50VXJsfSBjb250cm9scyAvPlxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUucGxheWJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfTUF1ZGlvQm9keVwiPlxuICAgICAgICAgICAgICAgICAgICA8SW5saW5lU3Bpbm5lciAvPlxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBdCB0aGlzIHBvaW50IHdlIHNob3VsZCBoYXZlIGEgcGxheWFibGUgc3RhdGVcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X01BdWRpb0JvZHlcIj5cbiAgICAgICAgICAgICAgICA8QXVkaW9QbGF5ZXIgcGxheWJhY2s9e3RoaXMuc3RhdGUucGxheWJhY2t9IG1lZGlhTmFtZT17dGhpcy5wcm9wcy5teEV2ZW50LmdldENvbnRlbnQoKS5ib2R5fSAvPlxuICAgICAgICAgICAgICAgIHsgdGhpcy5zaG93RmlsZUJvZHkgJiYgPE1GaWxlQm9keSB7Li4udGhpcy5wcm9wc30gc2hvd0dlbmVyaWNQbGFjZWhvbGRlcj17ZmFsc2V9IC8+IH1cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBR0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQTlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUF1QmUsTUFBTUEsVUFBTixTQUF5QkMsY0FBQSxDQUFNQyxhQUEvQixDQUFpRTtFQUk1RUMsV0FBVyxDQUFDQyxLQUFELEVBQW9CO0lBQzNCLE1BQU1BLEtBQU47SUFEMkI7SUFHM0IsS0FBS0MsS0FBTCxHQUFhLEVBQWI7RUFDSDs7RUFFNkIsTUFBakJDLGlCQUFpQixHQUFHO0lBQzdCLElBQUlDLE1BQUo7O0lBRUEsSUFBSTtNQUNBLElBQUk7UUFDQSxNQUFNQyxJQUFJLEdBQUcsTUFBTSxLQUFLSixLQUFMLENBQVdLLGdCQUFYLENBQTRCQyxVQUE1QixDQUF1Q0MsS0FBMUQ7UUFDQUosTUFBTSxHQUFHLE1BQU1DLElBQUks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