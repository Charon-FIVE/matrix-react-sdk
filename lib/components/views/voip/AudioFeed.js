"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _callFeed = require("matrix-js-sdk/src/webrtc/callFeed");

var _logger = require("matrix-js-sdk/src/logger");

var _MediaDeviceHandler = _interopRequireWildcard(require("../../../MediaDeviceHandler"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2021 Šimon Brandner <simon.bra.ag@gmail.com>

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
class AudioFeed extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "element", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "onAudioOutputChanged", audioOutput => {
      const element = this.element.current;

      if (audioOutput) {
        try {
          // This seems quite unreliable in Chrome, although I haven't yet managed to make a jsfiddle where
          // it fails.
          // It seems reliable if you set the sink ID after setting the srcObject and then set the sink ID
          // back to the default after the call is over - Dave
          element.setSinkId(audioOutput);
        } catch (e) {
          _logger.logger.error("Couldn't set requested audio output device: using default", e);

          _logger.logger.warn("Couldn't set requested audio output device: using default", e);
        }
      }
    });
    (0, _defineProperty2.default)(this, "onNewStream", () => {
      this.setState({
        audioMuted: this.props.feed.isAudioMuted()
      });
      this.playMedia();
    });
    this.state = {
      audioMuted: this.props.feed.isAudioMuted()
    };
  }

  componentDidMount() {
    _MediaDeviceHandler.default.instance.addListener(_MediaDeviceHandler.MediaDeviceHandlerEvent.AudioOutputChanged, this.onAudioOutputChanged);

    this.props.feed.addListener(_callFeed.CallFeedEvent.NewStream, this.onNewStream);
    this.playMedia();
  }

  componentWillUnmount() {
    _MediaDeviceHandler.default.instance.removeListener(_MediaDeviceHandler.MediaDeviceHandlerEvent.AudioOutputChanged, this.onAudioOutputChanged);

    this.props.feed.removeListener(_callFeed.CallFeedEvent.NewStream, this.onNewStream);
    this.stopMedia();
  }

  async playMedia() {
    const element = this.element.current;
    if (!element) return;
    this.onAudioOutputChanged(_MediaDeviceHandler.default.getAudioOutput());
    element.muted = false;
    element.srcObject = this.props.feed.stream;
    element.autoplay = true;

    try {
      // A note on calling methods on media elements:
      // We used to have queues per media element to serialise all calls on those elements.
      // The reason given for this was that load() and play() were racing. However, we now
      // never call load() explicitly so this seems unnecessary. However, serialising every
      // operation was causing bugs where video would not resume because some play command
      // had got stuck and all media operations were queued up behind it. If necessary, we
      // should serialise the ones that need to be serialised but then be able to interrupt
      // them with another load() which will cancel the pending one, but since we don't call
      // load() explicitly, it shouldn't be a problem. - Dave
      await element.load();
    } catch (e) {
      _logger.logger.info(`Failed to play media element with feed for userId ` + `${this.props.feed.userId} with purpose ${this.props.feed.purpose}`, e);
    }
  }

  stopMedia() {
    const element = this.element.current;
    if (!element) return;
    element.pause();
    element.src = null; // As per comment in componentDidMount, setting the sink ID back to the
    // default once the call is over makes setSinkId work reliably. - Dave
    // Since we are not using the same element anymore, the above doesn't
    // seem to be necessary - Šimon
  }

  render() {
    // Do not render the audio element if there is no audio track
    if (this.state.audioMuted) return null;
    return /*#__PURE__*/_react.default.createElement("audio", {
      ref: this.element
    });
  }

}

exports.default = AudioFeed;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBdWRpb0ZlZWQiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjcmVhdGVSZWYiLCJhdWRpb091dHB1dCIsImVsZW1lbnQiLCJjdXJyZW50Iiwic2V0U2lua0lkIiwiZSIsImxvZ2dlciIsImVycm9yIiwid2FybiIsInNldFN0YXRlIiwiYXVkaW9NdXRlZCIsImZlZWQiLCJpc0F1ZGlvTXV0ZWQiLCJwbGF5TWVkaWEiLCJzdGF0ZSIsImNvbXBvbmVudERpZE1vdW50IiwiTWVkaWFEZXZpY2VIYW5kbGVyIiwiaW5zdGFuY2UiLCJhZGRMaXN0ZW5lciIsIk1lZGlhRGV2aWNlSGFuZGxlckV2ZW50IiwiQXVkaW9PdXRwdXRDaGFuZ2VkIiwib25BdWRpb091dHB1dENoYW5nZWQiLCJDYWxsRmVlZEV2ZW50IiwiTmV3U3RyZWFtIiwib25OZXdTdHJlYW0iLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInJlbW92ZUxpc3RlbmVyIiwic3RvcE1lZGlhIiwiZ2V0QXVkaW9PdXRwdXQiLCJtdXRlZCIsInNyY09iamVjdCIsInN0cmVhbSIsImF1dG9wbGF5IiwibG9hZCIsImluZm8iLCJ1c2VySWQiLCJwdXJwb3NlIiwicGF1c2UiLCJzcmMiLCJyZW5kZXIiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy92b2lwL0F1ZGlvRmVlZC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIxIMWgaW1vbiBCcmFuZG5lciA8c2ltb24uYnJhLmFnQGdtYWlsLmNvbT5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgY3JlYXRlUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQ2FsbEZlZWQsIENhbGxGZWVkRXZlbnQgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy93ZWJydGMvY2FsbEZlZWQnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbG9nZ2VyJztcblxuaW1wb3J0IE1lZGlhRGV2aWNlSGFuZGxlciwgeyBNZWRpYURldmljZUhhbmRsZXJFdmVudCB9IGZyb20gXCIuLi8uLi8uLi9NZWRpYURldmljZUhhbmRsZXJcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgZmVlZDogQ2FsbEZlZWQ7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGF1ZGlvTXV0ZWQ6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEF1ZGlvRmVlZCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHByaXZhdGUgZWxlbWVudCA9IGNyZWF0ZVJlZjxIVE1MQXVkaW9FbGVtZW50PigpO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGF1ZGlvTXV0ZWQ6IHRoaXMucHJvcHMuZmVlZC5pc0F1ZGlvTXV0ZWQoKSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgTWVkaWFEZXZpY2VIYW5kbGVyLmluc3RhbmNlLmFkZExpc3RlbmVyKFxuICAgICAgICAgICAgTWVkaWFEZXZpY2VIYW5kbGVyRXZlbnQuQXVkaW9PdXRwdXRDaGFuZ2VkLFxuICAgICAgICAgICAgdGhpcy5vbkF1ZGlvT3V0cHV0Q2hhbmdlZCxcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5wcm9wcy5mZWVkLmFkZExpc3RlbmVyKENhbGxGZWVkRXZlbnQuTmV3U3RyZWFtLCB0aGlzLm9uTmV3U3RyZWFtKTtcbiAgICAgICAgdGhpcy5wbGF5TWVkaWEoKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgTWVkaWFEZXZpY2VIYW5kbGVyLmluc3RhbmNlLnJlbW92ZUxpc3RlbmVyKFxuICAgICAgICAgICAgTWVkaWFEZXZpY2VIYW5kbGVyRXZlbnQuQXVkaW9PdXRwdXRDaGFuZ2VkLFxuICAgICAgICAgICAgdGhpcy5vbkF1ZGlvT3V0cHV0Q2hhbmdlZCxcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5wcm9wcy5mZWVkLnJlbW92ZUxpc3RlbmVyKENhbGxGZWVkRXZlbnQuTmV3U3RyZWFtLCB0aGlzLm9uTmV3U3RyZWFtKTtcbiAgICAgICAgdGhpcy5zdG9wTWVkaWEoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQXVkaW9PdXRwdXRDaGFuZ2VkID0gKGF1ZGlvT3V0cHV0OiBzdHJpbmcpID0+IHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IHRoaXMuZWxlbWVudC5jdXJyZW50O1xuICAgICAgICBpZiAoYXVkaW9PdXRwdXQpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBzZWVtcyBxdWl0ZSB1bnJlbGlhYmxlIGluIENocm9tZSwgYWx0aG91Z2ggSSBoYXZlbid0IHlldCBtYW5hZ2VkIHRvIG1ha2UgYSBqc2ZpZGRsZSB3aGVyZVxuICAgICAgICAgICAgICAgIC8vIGl0IGZhaWxzLlxuICAgICAgICAgICAgICAgIC8vIEl0IHNlZW1zIHJlbGlhYmxlIGlmIHlvdSBzZXQgdGhlIHNpbmsgSUQgYWZ0ZXIgc2V0dGluZyB0aGUgc3JjT2JqZWN0IGFuZCB0aGVuIHNldCB0aGUgc2luayBJRFxuICAgICAgICAgICAgICAgIC8vIGJhY2sgdG8gdGhlIGRlZmF1bHQgYWZ0ZXIgdGhlIGNhbGwgaXMgb3ZlciAtIERhdmVcbiAgICAgICAgICAgICAgICBlbGVtZW50LnNldFNpbmtJZChhdWRpb091dHB1dCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFwiQ291bGRuJ3Qgc2V0IHJlcXVlc3RlZCBhdWRpbyBvdXRwdXQgZGV2aWNlOiB1c2luZyBkZWZhdWx0XCIsIGUpO1xuICAgICAgICAgICAgICAgIGxvZ2dlci53YXJuKFwiQ291bGRuJ3Qgc2V0IHJlcXVlc3RlZCBhdWRpbyBvdXRwdXQgZGV2aWNlOiB1c2luZyBkZWZhdWx0XCIsIGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgYXN5bmMgcGxheU1lZGlhKCkge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5lbGVtZW50LmN1cnJlbnQ7XG4gICAgICAgIGlmICghZWxlbWVudCkgcmV0dXJuO1xuICAgICAgICB0aGlzLm9uQXVkaW9PdXRwdXRDaGFuZ2VkKE1lZGlhRGV2aWNlSGFuZGxlci5nZXRBdWRpb091dHB1dCgpKTtcbiAgICAgICAgZWxlbWVudC5tdXRlZCA9IGZhbHNlO1xuICAgICAgICBlbGVtZW50LnNyY09iamVjdCA9IHRoaXMucHJvcHMuZmVlZC5zdHJlYW07XG4gICAgICAgIGVsZW1lbnQuYXV0b3BsYXkgPSB0cnVlO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBBIG5vdGUgb24gY2FsbGluZyBtZXRob2RzIG9uIG1lZGlhIGVsZW1lbnRzOlxuICAgICAgICAgICAgLy8gV2UgdXNlZCB0byBoYXZlIHF1ZXVlcyBwZXIgbWVkaWEgZWxlbWVudCB0byBzZXJpYWxpc2UgYWxsIGNhbGxzIG9uIHRob3NlIGVsZW1lbnRzLlxuICAgICAgICAgICAgLy8gVGhlIHJlYXNvbiBnaXZlbiBmb3IgdGhpcyB3YXMgdGhhdCBsb2FkKCkgYW5kIHBsYXkoKSB3ZXJlIHJhY2luZy4gSG93ZXZlciwgd2Ugbm93XG4gICAgICAgICAgICAvLyBuZXZlciBjYWxsIGxvYWQoKSBleHBsaWNpdGx5IHNvIHRoaXMgc2VlbXMgdW5uZWNlc3NhcnkuIEhvd2V2ZXIsIHNlcmlhbGlzaW5nIGV2ZXJ5XG4gICAgICAgICAgICAvLyBvcGVyYXRpb24gd2FzIGNhdXNpbmcgYnVncyB3aGVyZSB2aWRlbyB3b3VsZCBub3QgcmVzdW1lIGJlY2F1c2Ugc29tZSBwbGF5IGNvbW1hbmRcbiAgICAgICAgICAgIC8vIGhhZCBnb3Qgc3R1Y2sgYW5kIGFsbCBtZWRpYSBvcGVyYXRpb25zIHdlcmUgcXVldWVkIHVwIGJlaGluZCBpdC4gSWYgbmVjZXNzYXJ5LCB3ZVxuICAgICAgICAgICAgLy8gc2hvdWxkIHNlcmlhbGlzZSB0aGUgb25lcyB0aGF0IG5lZWQgdG8gYmUgc2VyaWFsaXNlZCBidXQgdGhlbiBiZSBhYmxlIHRvIGludGVycnVwdFxuICAgICAgICAgICAgLy8gdGhlbSB3aXRoIGFub3RoZXIgbG9hZCgpIHdoaWNoIHdpbGwgY2FuY2VsIHRoZSBwZW5kaW5nIG9uZSwgYnV0IHNpbmNlIHdlIGRvbid0IGNhbGxcbiAgICAgICAgICAgIC8vIGxvYWQoKSBleHBsaWNpdGx5LCBpdCBzaG91bGRuJ3QgYmUgYSBwcm9ibGVtLiAtIERhdmVcbiAgICAgICAgICAgIGF3YWl0IGVsZW1lbnQubG9hZCgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBsb2dnZXIuaW5mbyhcbiAgICAgICAgICAgICAgICBgRmFpbGVkIHRvIHBsYXkgbWVkaWEgZWxlbWVudCB3aXRoIGZlZWQgZm9yIHVzZXJJZCBgICtcbiAgICAgICAgICAgICAgICBgJHt0aGlzLnByb3BzLmZlZWQudXNlcklkfSB3aXRoIHB1cnBvc2UgJHt0aGlzLnByb3BzLmZlZWQucHVycG9zZX1gLCBlLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc3RvcE1lZGlhKCkge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5lbGVtZW50LmN1cnJlbnQ7XG4gICAgICAgIGlmICghZWxlbWVudCkgcmV0dXJuO1xuXG4gICAgICAgIGVsZW1lbnQucGF1c2UoKTtcbiAgICAgICAgZWxlbWVudC5zcmMgPSBudWxsO1xuXG4gICAgICAgIC8vIEFzIHBlciBjb21tZW50IGluIGNvbXBvbmVudERpZE1vdW50LCBzZXR0aW5nIHRoZSBzaW5rIElEIGJhY2sgdG8gdGhlXG4gICAgICAgIC8vIGRlZmF1bHQgb25jZSB0aGUgY2FsbCBpcyBvdmVyIG1ha2VzIHNldFNpbmtJZCB3b3JrIHJlbGlhYmx5LiAtIERhdmVcbiAgICAgICAgLy8gU2luY2Ugd2UgYXJlIG5vdCB1c2luZyB0aGUgc2FtZSBlbGVtZW50IGFueW1vcmUsIHRoZSBhYm92ZSBkb2Vzbid0XG4gICAgICAgIC8vIHNlZW0gdG8gYmUgbmVjZXNzYXJ5IC0gxaBpbW9uXG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbk5ld1N0cmVhbSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBhdWRpb011dGVkOiB0aGlzLnByb3BzLmZlZWQuaXNBdWRpb011dGVkKCksXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnBsYXlNZWRpYSgpO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIC8vIERvIG5vdCByZW5kZXIgdGhlIGF1ZGlvIGVsZW1lbnQgaWYgdGhlcmUgaXMgbm8gYXVkaW8gdHJhY2tcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuYXVkaW9NdXRlZCkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxhdWRpbyByZWY9e3RoaXMuZWxlbWVudH0gLz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUVBOzs7Ozs7QUFwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBZ0JlLE1BQU1BLFNBQU4sU0FBd0JDLGNBQUEsQ0FBTUMsU0FBOUIsQ0FBd0Q7RUFHbkVDLFdBQVcsQ0FBQ0MsS0FBRCxFQUFnQjtJQUN2QixNQUFNQSxLQUFOO0lBRHVCLDREQUZULElBQUFDLGdCQUFBLEdBRVM7SUFBQSw0REEwQktDLFdBQUQsSUFBeUI7TUFDcEQsTUFBTUMsT0FBTyxHQUFHLEtBQUtBLE9BQUwsQ0FBYUMsT0FBN0I7O01BQ0EsSUFBSUYsV0FBSixFQUFpQjtRQUNiLElBQUk7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBQyxPQUFPLENBQUNFLFNBQVIsQ0FBa0JILFdBQWxCO1FBQ0gsQ0FORCxDQU1FLE9BQU9JLENBQVAsRUFBVTtVQUNSQyxjQUFBLENBQU9DLEtBQVAsQ0FBYSwyREFBYixFQUEwRUYsQ0FBMUU7O1VBQ0FDLGNBQUEsQ0FBT0UsSUFBUCxDQUFZLDJEQUFaLEVBQXlFSCxDQUF6RTtRQUNIO01BQ0o7SUFDSixDQXhDMEI7SUFBQSxtREFrRkwsTUFBTTtNQUN4QixLQUFLSSxRQUFMLENBQWM7UUFDVkMsVUFBVSxFQUFFLEtBQUtYLEtBQUwsQ0FBV1ksSUFBWCxDQUFnQkMsWUFBaEI7TUFERixDQUFkO01BR0EsS0FBS0MsU0FBTDtJQUNILENBdkYwQjtJQUd2QixLQUFLQyxLQUFMLEdBQWE7TUFDVEosVUFBVSxFQUFFLEtBQUtYLEtBQUwsQ0FBV1ksSUFBWCxDQUFnQkMsWUFBaEI7SUFESCxDQUFiO0VBR0g7O0VBRURHLGlCQUFpQixHQUFHO0lBQ2hCQywyQkFBQSxDQUFtQkMsUUFBbkIsQ0FBNEJDLFdBQTVCLENBQ0lDLDJDQUFBLENBQXdCQyxrQkFENUIsRUFFSSxLQUFLQyxvQkFGVDs7SUFJQSxLQUFLdEIsS0FBTCxDQUFXWSxJQUFYLENBQWdCTyxXQUFoQixDQUE0QkksdUJBQUEsQ0FBY0MsU0FBMUMsRUFBcUQsS0FBS0MsV0FBMUQ7SUFDQSxLQUFLWCxTQUFMO0VBQ0g7O0VBRURZLG9CQUFvQixHQUFHO0lBQ25CVCwyQkFBQSxDQUFtQkMsUUFBbkIsQ0FBNEJTLGNBQTVCLENBQ0lQLDJDQUFBLENBQXdCQyxrQkFENUIsRUFFSSxLQUFLQyxvQkFGVDs7SUFJQSxLQUFLdEIsS0FBTCxDQUFXWSxJQUFYLENBQWdCZSxjQUFoQixDQUErQkosdUJBQUEsQ0FBY0MsU0FBN0MsRUFBd0QsS0FBS0MsV0FBN0Q7SUFDQSxLQUFLRyxTQUFMO0VBQ0g7O0VBa0JzQixNQUFUZCxTQUFTLEdBQUc7SUFDdEIsTUFBTVgsT0FBTyxHQUFHLEtBQUtBLE9BQUwsQ0FBYUMsT0FBN0I7SUFDQSxJQUFJLENBQUNELE9BQUwsRUFBYztJQUNkLEtBQUttQixvQkFBTCxDQUEwQkwsMkJBQUEsQ0FBbUJZLGNBQW5CLEVBQTFCO0lBQ0ExQixPQUFPLENBQUMyQixLQUFSLEdBQWdCLEtBQWhCO0lBQ0EzQixPQUFPLENBQUM0QixTQUFSLEdBQW9CLEtBQUsvQixLQUFMLENBQVdZLElBQVgsQ0FBZ0JvQixNQUFwQztJQUNBN0IsT0FBTyxDQUFDOEIsUUFBUixHQUFtQixJQUFuQjs7SUFFQSxJQUFJO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0EsTUFBTTlCLE9BQU8sQ0FBQytCLElBQVIsRUFBTjtJQUNILENBWEQsQ0FXRSxPQUFPNUIsQ0FBUCxFQUFVO01BQ1JDLGNBQUEsQ0FBTzRCLElBQVAsQ0FDSyxvREFBRCxHQUNDLEdBQUUsS0FBS25DLEtBQUwsQ0FBV1ksSUFBWCxDQUFnQndCLE1BQU8saUJBQWdCLEtBQUtwQyxLQUFMLENBQVdZLElBQVgsQ0FBZ0J5QixPQUFRLEVBRnRFLEVBRXlFL0IsQ0FGekU7SUFJSDtFQUNKOztFQUVPc0IsU0FBUyxHQUFHO0lBQ2hCLE1BQU16QixPQUFPLEdBQUcsS0FBS0EsT0FBTCxDQUFhQyxPQUE3QjtJQUNBLElBQUksQ0FBQ0QsT0FBTCxFQUFjO0lBRWRBLE9BQU8sQ0FBQ21DLEtBQVI7SUFDQW5DLE9BQU8sQ0FBQ29DLEdBQVIsR0FBYyxJQUFkLENBTGdCLENBT2hCO0lBQ0E7SUFDQTtJQUNBO0VBQ0g7O0VBU0RDLE1BQU0sR0FBRztJQUNMO0lBQ0EsSUFBSSxLQUFLekIsS0FBTCxDQUFXSixVQUFmLEVBQTJCLE9BQU8sSUFBUDtJQUUzQixvQkFDSTtNQUFPLEdBQUcsRUFBRSxLQUFLUjtJQUFqQixFQURKO0VBR0g7O0FBbkdrRSJ9