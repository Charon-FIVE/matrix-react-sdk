"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _call = require("matrix-js-sdk/src/webrtc/call");

var _classnames = _interopRequireDefault(require("classnames"));

var _languageHandler = require("../../../languageHandler");

var _MemberAvatar = _interopRequireDefault(require("../avatars/MemberAvatar"));

var _LegacyCallEventGrouper = require("../../structures/LegacyCallEventGrouper");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _InfoTooltip = _interopRequireWildcard(require("../elements/InfoTooltip"));

var _AccessibleTooltipButton = _interopRequireDefault(require("../elements/AccessibleTooltipButton"));

var _DateUtils = require("../../../DateUtils");

var _Clock = _interopRequireDefault(require("../audio_messages/Clock"));

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
const MAX_NON_NARROW_WIDTH = 450 / 70 * 100;

class LegacyCallEvent extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "wrapperElement", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "resizeObserver", void 0);
    (0, _defineProperty2.default)(this, "onLengthChanged", length => {
      this.setState({
        length
      });
    });
    (0, _defineProperty2.default)(this, "resizeObserverCallback", entries => {
      const wrapperElementEntry = entries.find(entry => entry.target === this.wrapperElement.current);
      if (!wrapperElementEntry) return;
      this.setState({
        narrow: wrapperElementEntry.contentRect.width < MAX_NON_NARROW_WIDTH
      });
    });
    (0, _defineProperty2.default)(this, "onSilencedChanged", newState => {
      this.setState({
        silenced: newState
      });
    });
    (0, _defineProperty2.default)(this, "onStateChanged", newState => {
      this.setState({
        callState: newState
      });
    });
    this.state = {
      callState: this.props.callEventGrouper.state,
      silenced: false,
      narrow: false,
      length: 0
    };
  }

  componentDidMount() {
    this.props.callEventGrouper.addListener(_LegacyCallEventGrouper.LegacyCallEventGrouperEvent.StateChanged, this.onStateChanged);
    this.props.callEventGrouper.addListener(_LegacyCallEventGrouper.LegacyCallEventGrouperEvent.SilencedChanged, this.onSilencedChanged);
    this.props.callEventGrouper.addListener(_LegacyCallEventGrouper.LegacyCallEventGrouperEvent.LengthChanged, this.onLengthChanged);
    this.resizeObserver = new ResizeObserver(this.resizeObserverCallback);
    this.wrapperElement.current && this.resizeObserver.observe(this.wrapperElement.current);
  }

  componentWillUnmount() {
    this.props.callEventGrouper.removeListener(_LegacyCallEventGrouper.LegacyCallEventGrouperEvent.StateChanged, this.onStateChanged);
    this.props.callEventGrouper.removeListener(_LegacyCallEventGrouper.LegacyCallEventGrouperEvent.SilencedChanged, this.onSilencedChanged);
    this.props.callEventGrouper.removeListener(_LegacyCallEventGrouper.LegacyCallEventGrouperEvent.LengthChanged, this.onLengthChanged);
    this.resizeObserver.disconnect();
  }

  renderCallBackButton(text) {
    return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      className: "mx_LegacyCallEvent_content_button mx_LegacyCallEvent_content_button_callBack",
      onClick: this.props.callEventGrouper.callBack,
      kind: "primary"
    }, /*#__PURE__*/_react.default.createElement("span", null, " ", text, " "));
  }

  renderSilenceIcon() {
    const silenceClass = (0, _classnames.default)({
      "mx_LegacyCallEvent_iconButton": true,
      "mx_LegacyCallEvent_unSilence": this.state.silenced,
      "mx_LegacyCallEvent_silence": !this.state.silenced
    });
    return /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
      className: silenceClass,
      onClick: this.props.callEventGrouper.toggleSilenced,
      title: this.state.silenced ? (0, _languageHandler._t)("Sound on") : (0, _languageHandler._t)("Silence call")
    });
  }

  renderContent(state) {
    if (state === _call.CallState.Ringing) {
      let silenceIcon;

      if (!this.state.narrow) {
        silenceIcon = this.renderSilenceIcon();
      }

      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_LegacyCallEvent_content"
      }, silenceIcon, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_LegacyCallEvent_content_button mx_LegacyCallEvent_content_button_reject",
        onClick: this.props.callEventGrouper.rejectCall,
        kind: "danger"
      }, /*#__PURE__*/_react.default.createElement("span", null, " ", (0, _languageHandler._t)("Decline"), " ")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_LegacyCallEvent_content_button mx_LegacyCallEvent_content_button_answer",
        onClick: this.props.callEventGrouper.answerCall,
        kind: "primary"
      }, /*#__PURE__*/_react.default.createElement("span", null, " ", (0, _languageHandler._t)("Accept"), " ")), this.props.timestamp);
    }

    if (state === _call.CallState.Ended) {
      const hangupReason = this.props.callEventGrouper.hangupReason;
      const gotRejected = this.props.callEventGrouper.gotRejected;

      if (gotRejected) {
        return /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_LegacyCallEvent_content"
        }, (0, _languageHandler._t)("Call declined"), this.renderCallBackButton((0, _languageHandler._t)("Call back")), this.props.timestamp);
      } else if ([_call.CallErrorCode.UserHangup, "user hangup"].includes(hangupReason) || !hangupReason) {
        // workaround for https://github.com/vector-im/element-web/issues/5178
        // it seems Android randomly sets a reason of "user hangup" which is
        // interpreted as an error code :(
        // https://github.com/vector-im/riot-android/issues/2623
        // Also the correct hangup code as of VoIP v1 (with underscore)
        // Also, if we don't have a reason
        const duration = this.props.callEventGrouper.duration;
        let text = (0, _languageHandler._t)("Call ended");

        if (duration) {
          text += " • " + (0, _DateUtils.formatCallTime)(duration);
        }

        return /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_LegacyCallEvent_content"
        }, text, this.props.timestamp);
      } else if (hangupReason === _call.CallErrorCode.InviteTimeout) {
        return /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_LegacyCallEvent_content"
        }, (0, _languageHandler._t)("No answer"), this.renderCallBackButton((0, _languageHandler._t)("Call back")), this.props.timestamp);
      }

      let reason;

      if (hangupReason === _call.CallErrorCode.IceFailed) {
        // We couldn't establish a connection at all
        reason = (0, _languageHandler._t)("Could not connect media");
      } else if (hangupReason === "ice_timeout") {
        // We established a connection but it died
        reason = (0, _languageHandler._t)("Connection failed");
      } else if (hangupReason === _call.CallErrorCode.NoUserMedia) {
        // The other side couldn't open capture devices
        reason = (0, _languageHandler._t)("Their device couldn't start the camera or microphone");
      } else if (hangupReason === "unknown_error") {
        // An error code the other side doesn't have a way to express
        // (as opposed to an error code they gave but we don't know about,
        // in which case we show the error code)
        reason = (0, _languageHandler._t)("An unknown error occurred");
      } else if (hangupReason === _call.CallErrorCode.UserBusy) {
        reason = (0, _languageHandler._t)("The user you called is busy.");
      } else {
        reason = (0, _languageHandler._t)('Unknown failure: %(reason)s', {
          reason: hangupReason
        });
      }

      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_LegacyCallEvent_content"
      }, /*#__PURE__*/_react.default.createElement(_InfoTooltip.default, {
        tooltip: reason,
        className: "mx_LegacyCallEvent_content_tooltip",
        kind: _InfoTooltip.InfoTooltipKind.Warning
      }), (0, _languageHandler._t)("Connection failed"), this.renderCallBackButton((0, _languageHandler._t)("Retry")), this.props.timestamp);
    }

    if (state === _call.CallState.Connected) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_LegacyCallEvent_content"
      }, /*#__PURE__*/_react.default.createElement(_Clock.default, {
        seconds: this.state.length,
        "aria-live": "off"
      }), this.props.timestamp);
    }

    if (state === _call.CallState.Connecting) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_LegacyCallEvent_content"
      }, (0, _languageHandler._t)("Connecting"), this.props.timestamp);
    }

    if (state === _LegacyCallEventGrouper.CustomCallState.Missed) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_LegacyCallEvent_content"
      }, (0, _languageHandler._t)("Missed call"), this.renderCallBackButton((0, _languageHandler._t)("Call back")), this.props.timestamp);
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_LegacyCallEvent_content"
    }, (0, _languageHandler._t)("The call is in an unknown state!"), this.props.timestamp);
  }

  render() {
    const event = this.props.mxEvent;
    const sender = event.sender ? event.sender.name : event.getSender();
    const isVoice = this.props.callEventGrouper.isVoice;
    const callType = isVoice ? (0, _languageHandler._t)("Voice call") : (0, _languageHandler._t)("Video call");
    const callState = this.state.callState;
    const hangupReason = this.props.callEventGrouper.hangupReason;
    const content = this.renderContent(callState);
    const className = (0, _classnames.default)("mx_LegacyCallEvent", {
      mx_LegacyCallEvent_voice: isVoice,
      mx_LegacyCallEvent_video: !isVoice,
      mx_LegacyCallEvent_narrow: this.state.narrow,
      mx_LegacyCallEvent_missed: callState === _LegacyCallEventGrouper.CustomCallState.Missed,
      mx_LegacyCallEvent_noAnswer: callState === _call.CallState.Ended && hangupReason === _call.CallErrorCode.InviteTimeout,
      mx_LegacyCallEvent_rejected: callState === _call.CallState.Ended && this.props.callEventGrouper.gotRejected
    });
    let silenceIcon;

    if (this.state.narrow && this.state.callState === _call.CallState.Ringing) {
      silenceIcon = this.renderSilenceIcon();
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_LegacyCallEvent_wrapper",
      ref: this.wrapperElement
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: className
    }, silenceIcon, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_LegacyCallEvent_info"
    }, /*#__PURE__*/_react.default.createElement(_MemberAvatar.default, {
      member: event.sender,
      width: 32,
      height: 32
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_LegacyCallEvent_info_basic"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_LegacyCallEvent_sender"
    }, sender), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_LegacyCallEvent_type"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_LegacyCallEvent_type_icon"
    }), callType))), content));
  }

}

exports.default = LegacyCallEvent;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNQVhfTk9OX05BUlJPV19XSURUSCIsIkxlZ2FjeUNhbGxFdmVudCIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjcmVhdGVSZWYiLCJsZW5ndGgiLCJzZXRTdGF0ZSIsImVudHJpZXMiLCJ3cmFwcGVyRWxlbWVudEVudHJ5IiwiZmluZCIsImVudHJ5IiwidGFyZ2V0Iiwid3JhcHBlckVsZW1lbnQiLCJjdXJyZW50IiwibmFycm93IiwiY29udGVudFJlY3QiLCJ3aWR0aCIsIm5ld1N0YXRlIiwic2lsZW5jZWQiLCJjYWxsU3RhdGUiLCJzdGF0ZSIsImNhbGxFdmVudEdyb3VwZXIiLCJjb21wb25lbnREaWRNb3VudCIsImFkZExpc3RlbmVyIiwiTGVnYWN5Q2FsbEV2ZW50R3JvdXBlckV2ZW50IiwiU3RhdGVDaGFuZ2VkIiwib25TdGF0ZUNoYW5nZWQiLCJTaWxlbmNlZENoYW5nZWQiLCJvblNpbGVuY2VkQ2hhbmdlZCIsIkxlbmd0aENoYW5nZWQiLCJvbkxlbmd0aENoYW5nZWQiLCJyZXNpemVPYnNlcnZlciIsIlJlc2l6ZU9ic2VydmVyIiwicmVzaXplT2JzZXJ2ZXJDYWxsYmFjayIsIm9ic2VydmUiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInJlbW92ZUxpc3RlbmVyIiwiZGlzY29ubmVjdCIsInJlbmRlckNhbGxCYWNrQnV0dG9uIiwidGV4dCIsImNhbGxCYWNrIiwicmVuZGVyU2lsZW5jZUljb24iLCJzaWxlbmNlQ2xhc3MiLCJjbGFzc05hbWVzIiwidG9nZ2xlU2lsZW5jZWQiLCJfdCIsInJlbmRlckNvbnRlbnQiLCJDYWxsU3RhdGUiLCJSaW5naW5nIiwic2lsZW5jZUljb24iLCJyZWplY3RDYWxsIiwiYW5zd2VyQ2FsbCIsInRpbWVzdGFtcCIsIkVuZGVkIiwiaGFuZ3VwUmVhc29uIiwiZ290UmVqZWN0ZWQiLCJDYWxsRXJyb3JDb2RlIiwiVXNlckhhbmd1cCIsImluY2x1ZGVzIiwiZHVyYXRpb24iLCJmb3JtYXRDYWxsVGltZSIsIkludml0ZVRpbWVvdXQiLCJyZWFzb24iLCJJY2VGYWlsZWQiLCJOb1VzZXJNZWRpYSIsIlVzZXJCdXN5IiwiSW5mb1Rvb2x0aXBLaW5kIiwiV2FybmluZyIsIkNvbm5lY3RlZCIsIkNvbm5lY3RpbmciLCJDdXN0b21DYWxsU3RhdGUiLCJNaXNzZWQiLCJyZW5kZXIiLCJldmVudCIsIm14RXZlbnQiLCJzZW5kZXIiLCJuYW1lIiwiZ2V0U2VuZGVyIiwiaXNWb2ljZSIsImNhbGxUeXBlIiwiY29udGVudCIsImNsYXNzTmFtZSIsIm14X0xlZ2FjeUNhbGxFdmVudF92b2ljZSIsIm14X0xlZ2FjeUNhbGxFdmVudF92aWRlbyIsIm14X0xlZ2FjeUNhbGxFdmVudF9uYXJyb3ciLCJteF9MZWdhY3lDYWxsRXZlbnRfbWlzc2VkIiwibXhfTGVnYWN5Q2FsbEV2ZW50X25vQW5zd2VyIiwibXhfTGVnYWN5Q2FsbEV2ZW50X3JlamVjdGVkIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvbWVzc2FnZXMvTGVnYWN5Q2FsbEV2ZW50LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjEgxaBpbW9uIEJyYW5kbmVyIDxzaW1vbi5icmEuYWdAZ21haWwuY29tPlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBjcmVhdGVSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBNYXRyaXhFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnRcIjtcbmltcG9ydCB7IENhbGxFcnJvckNvZGUsIENhbGxTdGF0ZSB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL3dlYnJ0Yy9jYWxsJztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgTWVtYmVyQXZhdGFyIGZyb20gJy4uL2F2YXRhcnMvTWVtYmVyQXZhdGFyJztcbmltcG9ydCBMZWdhY3lDYWxsRXZlbnRHcm91cGVyLCB7XG4gICAgTGVnYWN5Q2FsbEV2ZW50R3JvdXBlckV2ZW50LFxuICAgIEN1c3RvbUNhbGxTdGF0ZSxcbn0gZnJvbSAnLi4vLi4vc3RydWN0dXJlcy9MZWdhY3lDYWxsRXZlbnRHcm91cGVyJztcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gJy4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b24nO1xuaW1wb3J0IEluZm9Ub29sdGlwLCB7IEluZm9Ub29sdGlwS2luZCB9IGZyb20gJy4uL2VsZW1lbnRzL0luZm9Ub29sdGlwJztcbmltcG9ydCBBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbiBmcm9tICcuLi9lbGVtZW50cy9BY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbic7XG5pbXBvcnQgeyBmb3JtYXRDYWxsVGltZSB9IGZyb20gXCIuLi8uLi8uLi9EYXRlVXRpbHNcIjtcbmltcG9ydCBDbG9jayBmcm9tIFwiLi4vYXVkaW9fbWVzc2FnZXMvQ2xvY2tcIjtcblxuY29uc3QgTUFYX05PTl9OQVJST1dfV0lEVEggPSA0NTAgLyA3MCAqIDEwMDtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgbXhFdmVudDogTWF0cml4RXZlbnQ7XG4gICAgY2FsbEV2ZW50R3JvdXBlcjogTGVnYWN5Q2FsbEV2ZW50R3JvdXBlcjtcbiAgICB0aW1lc3RhbXA/OiBKU1guRWxlbWVudDtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgY2FsbFN0YXRlOiBDYWxsU3RhdGUgfCBDdXN0b21DYWxsU3RhdGU7XG4gICAgc2lsZW5jZWQ6IGJvb2xlYW47XG4gICAgbmFycm93OiBib29sZWFuO1xuICAgIGxlbmd0aDogbnVtYmVyO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMZWdhY3lDYWxsRXZlbnQgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSB3cmFwcGVyRWxlbWVudCA9IGNyZWF0ZVJlZjxIVE1MRGl2RWxlbWVudD4oKTtcbiAgICBwcml2YXRlIHJlc2l6ZU9ic2VydmVyOiBSZXNpemVPYnNlcnZlcjtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBJUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBjYWxsU3RhdGU6IHRoaXMucHJvcHMuY2FsbEV2ZW50R3JvdXBlci5zdGF0ZSxcbiAgICAgICAgICAgIHNpbGVuY2VkOiBmYWxzZSxcbiAgICAgICAgICAgIG5hcnJvdzogZmFsc2UsXG4gICAgICAgICAgICBsZW5ndGg6IDAsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMucHJvcHMuY2FsbEV2ZW50R3JvdXBlci5hZGRMaXN0ZW5lcihMZWdhY3lDYWxsRXZlbnRHcm91cGVyRXZlbnQuU3RhdGVDaGFuZ2VkLCB0aGlzLm9uU3RhdGVDaGFuZ2VkKTtcbiAgICAgICAgdGhpcy5wcm9wcy5jYWxsRXZlbnRHcm91cGVyLmFkZExpc3RlbmVyKExlZ2FjeUNhbGxFdmVudEdyb3VwZXJFdmVudC5TaWxlbmNlZENoYW5nZWQsIHRoaXMub25TaWxlbmNlZENoYW5nZWQpO1xuICAgICAgICB0aGlzLnByb3BzLmNhbGxFdmVudEdyb3VwZXIuYWRkTGlzdGVuZXIoTGVnYWN5Q2FsbEV2ZW50R3JvdXBlckV2ZW50Lkxlbmd0aENoYW5nZWQsIHRoaXMub25MZW5ndGhDaGFuZ2VkKTtcblxuICAgICAgICB0aGlzLnJlc2l6ZU9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKHRoaXMucmVzaXplT2JzZXJ2ZXJDYWxsYmFjayk7XG4gICAgICAgIHRoaXMud3JhcHBlckVsZW1lbnQuY3VycmVudCAmJiB0aGlzLnJlc2l6ZU9ic2VydmVyLm9ic2VydmUodGhpcy53cmFwcGVyRWxlbWVudC5jdXJyZW50KTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5jYWxsRXZlbnRHcm91cGVyLnJlbW92ZUxpc3RlbmVyKExlZ2FjeUNhbGxFdmVudEdyb3VwZXJFdmVudC5TdGF0ZUNoYW5nZWQsIHRoaXMub25TdGF0ZUNoYW5nZWQpO1xuICAgICAgICB0aGlzLnByb3BzLmNhbGxFdmVudEdyb3VwZXIucmVtb3ZlTGlzdGVuZXIoTGVnYWN5Q2FsbEV2ZW50R3JvdXBlckV2ZW50LlNpbGVuY2VkQ2hhbmdlZCwgdGhpcy5vblNpbGVuY2VkQ2hhbmdlZCk7XG4gICAgICAgIHRoaXMucHJvcHMuY2FsbEV2ZW50R3JvdXBlci5yZW1vdmVMaXN0ZW5lcihMZWdhY3lDYWxsRXZlbnRHcm91cGVyRXZlbnQuTGVuZ3RoQ2hhbmdlZCwgdGhpcy5vbkxlbmd0aENoYW5nZWQpO1xuXG4gICAgICAgIHRoaXMucmVzaXplT2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25MZW5ndGhDaGFuZ2VkID0gKGxlbmd0aDogbnVtYmVyKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBsZW5ndGggfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgcmVzaXplT2JzZXJ2ZXJDYWxsYmFjayA9IChlbnRyaWVzOiBSZXNpemVPYnNlcnZlckVudHJ5W10pOiB2b2lkID0+IHtcbiAgICAgICAgY29uc3Qgd3JhcHBlckVsZW1lbnRFbnRyeSA9IGVudHJpZXMuZmluZCgoZW50cnkpID0+IGVudHJ5LnRhcmdldCA9PT0gdGhpcy53cmFwcGVyRWxlbWVudC5jdXJyZW50KTtcbiAgICAgICAgaWYgKCF3cmFwcGVyRWxlbWVudEVudHJ5KSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IG5hcnJvdzogd3JhcHBlckVsZW1lbnRFbnRyeS5jb250ZW50UmVjdC53aWR0aCA8IE1BWF9OT05fTkFSUk9XX1dJRFRIIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uU2lsZW5jZWRDaGFuZ2VkID0gKG5ld1N0YXRlKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzaWxlbmNlZDogbmV3U3RhdGUgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25TdGF0ZUNoYW5nZWQgPSAobmV3U3RhdGU6IENhbGxTdGF0ZSkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgY2FsbFN0YXRlOiBuZXdTdGF0ZSB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSByZW5kZXJDYWxsQmFja0J1dHRvbih0ZXh0OiBzdHJpbmcpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0xlZ2FjeUNhbGxFdmVudF9jb250ZW50X2J1dHRvbiBteF9MZWdhY3lDYWxsRXZlbnRfY29udGVudF9idXR0b25fY2FsbEJhY2tcIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMuY2FsbEV2ZW50R3JvdXBlci5jYWxsQmFja31cbiAgICAgICAgICAgICAgICBraW5kPVwicHJpbWFyeVwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPHNwYW4+IHsgdGV4dCB9IDwvc3Bhbj5cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlclNpbGVuY2VJY29uKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgY29uc3Qgc2lsZW5jZUNsYXNzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICBcIm14X0xlZ2FjeUNhbGxFdmVudF9pY29uQnV0dG9uXCI6IHRydWUsXG4gICAgICAgICAgICBcIm14X0xlZ2FjeUNhbGxFdmVudF91blNpbGVuY2VcIjogdGhpcy5zdGF0ZS5zaWxlbmNlZCxcbiAgICAgICAgICAgIFwibXhfTGVnYWN5Q2FsbEV2ZW50X3NpbGVuY2VcIjogIXRoaXMuc3RhdGUuc2lsZW5jZWQsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3NpbGVuY2VDbGFzc31cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLnByb3BzLmNhbGxFdmVudEdyb3VwZXIudG9nZ2xlU2lsZW5jZWR9XG4gICAgICAgICAgICAgICAgdGl0bGU9e3RoaXMuc3RhdGUuc2lsZW5jZWQgPyBfdChcIlNvdW5kIG9uXCIpIDogX3QoXCJTaWxlbmNlIGNhbGxcIil9XG4gICAgICAgICAgICAvPlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyQ29udGVudChzdGF0ZTogQ2FsbFN0YXRlIHwgQ3VzdG9tQ2FsbFN0YXRlKTogSlNYLkVsZW1lbnQge1xuICAgICAgICBpZiAoc3RhdGUgPT09IENhbGxTdGF0ZS5SaW5naW5nKSB7XG4gICAgICAgICAgICBsZXQgc2lsZW5jZUljb247XG4gICAgICAgICAgICBpZiAoIXRoaXMuc3RhdGUubmFycm93KSB7XG4gICAgICAgICAgICAgICAgc2lsZW5jZUljb24gPSB0aGlzLnJlbmRlclNpbGVuY2VJY29uKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9MZWdhY3lDYWxsRXZlbnRfY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgICB7IHNpbGVuY2VJY29uIH1cbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0xlZ2FjeUNhbGxFdmVudF9jb250ZW50X2J1dHRvbiBteF9MZWdhY3lDYWxsRXZlbnRfY29udGVudF9idXR0b25fcmVqZWN0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMuY2FsbEV2ZW50R3JvdXBlci5yZWplY3RDYWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAga2luZD1cImRhbmdlclwiXG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPiB7IF90KFwiRGVjbGluZVwiKSB9IDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTGVnYWN5Q2FsbEV2ZW50X2NvbnRlbnRfYnV0dG9uIG14X0xlZ2FjeUNhbGxFdmVudF9jb250ZW50X2J1dHRvbl9hbnN3ZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5jYWxsRXZlbnRHcm91cGVyLmFuc3dlckNhbGx9XG4gICAgICAgICAgICAgICAgICAgICAgICBraW5kPVwicHJpbWFyeVwiXG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPiB7IF90KFwiQWNjZXB0XCIpIH0gPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy50aW1lc3RhbXAgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RhdGUgPT09IENhbGxTdGF0ZS5FbmRlZCkge1xuICAgICAgICAgICAgY29uc3QgaGFuZ3VwUmVhc29uID0gdGhpcy5wcm9wcy5jYWxsRXZlbnRHcm91cGVyLmhhbmd1cFJlYXNvbjtcbiAgICAgICAgICAgIGNvbnN0IGdvdFJlamVjdGVkID0gdGhpcy5wcm9wcy5jYWxsRXZlbnRHcm91cGVyLmdvdFJlamVjdGVkO1xuXG4gICAgICAgICAgICBpZiAoZ290UmVqZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0xlZ2FjeUNhbGxFdmVudF9jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiQ2FsbCBkZWNsaW5lZFwiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHRoaXMucmVuZGVyQ2FsbEJhY2tCdXR0b24oX3QoXCJDYWxsIGJhY2tcIikpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy50aW1lc3RhbXAgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgoW0NhbGxFcnJvckNvZGUuVXNlckhhbmd1cCwgXCJ1c2VyIGhhbmd1cFwiXS5pbmNsdWRlcyhoYW5ndXBSZWFzb24pIHx8ICFoYW5ndXBSZWFzb24pKSB7XG4gICAgICAgICAgICAgICAgLy8gd29ya2Fyb3VuZCBmb3IgaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9lbGVtZW50LXdlYi9pc3N1ZXMvNTE3OFxuICAgICAgICAgICAgICAgIC8vIGl0IHNlZW1zIEFuZHJvaWQgcmFuZG9tbHkgc2V0cyBhIHJlYXNvbiBvZiBcInVzZXIgaGFuZ3VwXCIgd2hpY2ggaXNcbiAgICAgICAgICAgICAgICAvLyBpbnRlcnByZXRlZCBhcyBhbiBlcnJvciBjb2RlIDooXG4gICAgICAgICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3ZlY3Rvci1pbS9yaW90LWFuZHJvaWQvaXNzdWVzLzI2MjNcbiAgICAgICAgICAgICAgICAvLyBBbHNvIHRoZSBjb3JyZWN0IGhhbmd1cCBjb2RlIGFzIG9mIFZvSVAgdjEgKHdpdGggdW5kZXJzY29yZSlcbiAgICAgICAgICAgICAgICAvLyBBbHNvLCBpZiB3ZSBkb24ndCBoYXZlIGEgcmVhc29uXG4gICAgICAgICAgICAgICAgY29uc3QgZHVyYXRpb24gPSB0aGlzLnByb3BzLmNhbGxFdmVudEdyb3VwZXIuZHVyYXRpb247XG4gICAgICAgICAgICAgICAgbGV0IHRleHQgPSBfdChcIkNhbGwgZW5kZWRcIik7XG4gICAgICAgICAgICAgICAgaWYgKGR1cmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQgKz0gXCIg4oCiIFwiICsgZm9ybWF0Q2FsbFRpbWUoZHVyYXRpb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0xlZ2FjeUNhbGxFdmVudF9jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHRleHQgfVxuICAgICAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLnRpbWVzdGFtcCB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGhhbmd1cFJlYXNvbiA9PT0gQ2FsbEVycm9yQ29kZS5JbnZpdGVUaW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9MZWdhY3lDYWxsRXZlbnRfY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIk5vIGFuc3dlclwiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHRoaXMucmVuZGVyQ2FsbEJhY2tCdXR0b24oX3QoXCJDYWxsIGJhY2tcIikpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy50aW1lc3RhbXAgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgcmVhc29uO1xuICAgICAgICAgICAgaWYgKGhhbmd1cFJlYXNvbiA9PT0gQ2FsbEVycm9yQ29kZS5JY2VGYWlsZWQpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSBjb3VsZG4ndCBlc3RhYmxpc2ggYSBjb25uZWN0aW9uIGF0IGFsbFxuICAgICAgICAgICAgICAgIHJlYXNvbiA9IF90KFwiQ291bGQgbm90IGNvbm5lY3QgbWVkaWFcIik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGhhbmd1cFJlYXNvbiA9PT0gXCJpY2VfdGltZW91dFwiKSB7XG4gICAgICAgICAgICAgICAgLy8gV2UgZXN0YWJsaXNoZWQgYSBjb25uZWN0aW9uIGJ1dCBpdCBkaWVkXG4gICAgICAgICAgICAgICAgcmVhc29uID0gX3QoXCJDb25uZWN0aW9uIGZhaWxlZFwiKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGFuZ3VwUmVhc29uID09PSBDYWxsRXJyb3JDb2RlLk5vVXNlck1lZGlhKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhlIG90aGVyIHNpZGUgY291bGRuJ3Qgb3BlbiBjYXB0dXJlIGRldmljZXNcbiAgICAgICAgICAgICAgICByZWFzb24gPSBfdChcIlRoZWlyIGRldmljZSBjb3VsZG4ndCBzdGFydCB0aGUgY2FtZXJhIG9yIG1pY3JvcGhvbmVcIik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGhhbmd1cFJlYXNvbiA9PT0gXCJ1bmtub3duX2Vycm9yXCIpIHtcbiAgICAgICAgICAgICAgICAvLyBBbiBlcnJvciBjb2RlIHRoZSBvdGhlciBzaWRlIGRvZXNuJ3QgaGF2ZSBhIHdheSB0byBleHByZXNzXG4gICAgICAgICAgICAgICAgLy8gKGFzIG9wcG9zZWQgdG8gYW4gZXJyb3IgY29kZSB0aGV5IGdhdmUgYnV0IHdlIGRvbid0IGtub3cgYWJvdXQsXG4gICAgICAgICAgICAgICAgLy8gaW4gd2hpY2ggY2FzZSB3ZSBzaG93IHRoZSBlcnJvciBjb2RlKVxuICAgICAgICAgICAgICAgIHJlYXNvbiA9IF90KFwiQW4gdW5rbm93biBlcnJvciBvY2N1cnJlZFwiKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGFuZ3VwUmVhc29uID09PSBDYWxsRXJyb3JDb2RlLlVzZXJCdXN5KSB7XG4gICAgICAgICAgICAgICAgcmVhc29uID0gX3QoXCJUaGUgdXNlciB5b3UgY2FsbGVkIGlzIGJ1c3kuXCIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZWFzb24gPSBfdCgnVW5rbm93biBmYWlsdXJlOiAlKHJlYXNvbilzJywgeyByZWFzb246IGhhbmd1cFJlYXNvbiB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0xlZ2FjeUNhbGxFdmVudF9jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgICAgIDxJbmZvVG9vbHRpcFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcD17cmVhc29ufVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTGVnYWN5Q2FsbEV2ZW50X2NvbnRlbnRfdG9vbHRpcFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBraW5kPXtJbmZvVG9vbHRpcEtpbmQuV2FybmluZ31cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIkNvbm5lY3Rpb24gZmFpbGVkXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnJlbmRlckNhbGxCYWNrQnV0dG9uKF90KFwiUmV0cnlcIikpIH1cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLnRpbWVzdGFtcCB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdGF0ZSA9PT0gQ2FsbFN0YXRlLkNvbm5lY3RlZCkge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0xlZ2FjeUNhbGxFdmVudF9jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgICAgIDxDbG9jayBzZWNvbmRzPXt0aGlzLnN0YXRlLmxlbmd0aH0gYXJpYS1saXZlPVwib2ZmXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLnRpbWVzdGFtcCB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdGF0ZSA9PT0gQ2FsbFN0YXRlLkNvbm5lY3RpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9MZWdhY3lDYWxsRXZlbnRfY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiQ29ubmVjdGluZ1wiKSB9XG4gICAgICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy50aW1lc3RhbXAgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RhdGUgPT09IEN1c3RvbUNhbGxTdGF0ZS5NaXNzZWQpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9MZWdhY3lDYWxsRXZlbnRfY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiTWlzc2VkIGNhbGxcIikgfVxuICAgICAgICAgICAgICAgICAgICB7IHRoaXMucmVuZGVyQ2FsbEJhY2tCdXR0b24oX3QoXCJDYWxsIGJhY2tcIikpIH1cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLnRpbWVzdGFtcCB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTGVnYWN5Q2FsbEV2ZW50X2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICB7IF90KFwiVGhlIGNhbGwgaXMgaW4gYW4gdW5rbm93biBzdGF0ZSFcIikgfVxuICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy50aW1lc3RhbXAgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlcigpOiBKU1guRWxlbWVudCB7XG4gICAgICAgIGNvbnN0IGV2ZW50ID0gdGhpcy5wcm9wcy5teEV2ZW50O1xuICAgICAgICBjb25zdCBzZW5kZXIgPSBldmVudC5zZW5kZXIgPyBldmVudC5zZW5kZXIubmFtZSA6IGV2ZW50LmdldFNlbmRlcigpO1xuICAgICAgICBjb25zdCBpc1ZvaWNlID0gdGhpcy5wcm9wcy5jYWxsRXZlbnRHcm91cGVyLmlzVm9pY2U7XG4gICAgICAgIGNvbnN0IGNhbGxUeXBlID0gaXNWb2ljZSA/IF90KFwiVm9pY2UgY2FsbFwiKSA6IF90KFwiVmlkZW8gY2FsbFwiKTtcbiAgICAgICAgY29uc3QgY2FsbFN0YXRlID0gdGhpcy5zdGF0ZS5jYWxsU3RhdGU7XG4gICAgICAgIGNvbnN0IGhhbmd1cFJlYXNvbiA9IHRoaXMucHJvcHMuY2FsbEV2ZW50R3JvdXBlci5oYW5ndXBSZWFzb247XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLnJlbmRlckNvbnRlbnQoY2FsbFN0YXRlKTtcbiAgICAgICAgY29uc3QgY2xhc3NOYW1lID0gY2xhc3NOYW1lcyhcIm14X0xlZ2FjeUNhbGxFdmVudFwiLCB7XG4gICAgICAgICAgICBteF9MZWdhY3lDYWxsRXZlbnRfdm9pY2U6IGlzVm9pY2UsXG4gICAgICAgICAgICBteF9MZWdhY3lDYWxsRXZlbnRfdmlkZW86ICFpc1ZvaWNlLFxuICAgICAgICAgICAgbXhfTGVnYWN5Q2FsbEV2ZW50X25hcnJvdzogdGhpcy5zdGF0ZS5uYXJyb3csXG4gICAgICAgICAgICBteF9MZWdhY3lDYWxsRXZlbnRfbWlzc2VkOiBjYWxsU3RhdGUgPT09IEN1c3RvbUNhbGxTdGF0ZS5NaXNzZWQsXG4gICAgICAgICAgICBteF9MZWdhY3lDYWxsRXZlbnRfbm9BbnN3ZXI6IGNhbGxTdGF0ZSA9PT0gQ2FsbFN0YXRlLkVuZGVkICYmIGhhbmd1cFJlYXNvbiA9PT0gQ2FsbEVycm9yQ29kZS5JbnZpdGVUaW1lb3V0LFxuICAgICAgICAgICAgbXhfTGVnYWN5Q2FsbEV2ZW50X3JlamVjdGVkOiBjYWxsU3RhdGUgPT09IENhbGxTdGF0ZS5FbmRlZCAmJiB0aGlzLnByb3BzLmNhbGxFdmVudEdyb3VwZXIuZ290UmVqZWN0ZWQsXG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgc2lsZW5jZUljb247XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLm5hcnJvdyAmJiB0aGlzLnN0YXRlLmNhbGxTdGF0ZSA9PT0gQ2FsbFN0YXRlLlJpbmdpbmcpIHtcbiAgICAgICAgICAgIHNpbGVuY2VJY29uID0gdGhpcy5yZW5kZXJTaWxlbmNlSWNvbigpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTGVnYWN5Q2FsbEV2ZW50X3dyYXBwZXJcIiByZWY9e3RoaXMud3JhcHBlckVsZW1lbnR9PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtjbGFzc05hbWV9PlxuICAgICAgICAgICAgICAgICAgICB7IHNpbGVuY2VJY29uIH1cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9MZWdhY3lDYWxsRXZlbnRfaW5mb1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPE1lbWJlckF2YXRhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcj17ZXZlbnQuc2VuZGVyfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoPXszMn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ9ezMyfVxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTGVnYWN5Q2FsbEV2ZW50X2luZm9fYmFzaWNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0xlZ2FjeUNhbGxFdmVudF9zZW5kZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBzZW5kZXIgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTGVnYWN5Q2FsbEV2ZW50X3R5cGVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9MZWdhY3lDYWxsRXZlbnRfdHlwZV9pY29uXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBjYWxsVHlwZSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIHsgY29udGVudCB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUlBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUEvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBbUJBLE1BQU1BLG9CQUFvQixHQUFHLE1BQU0sRUFBTixHQUFXLEdBQXhDOztBQWVlLE1BQU1DLGVBQU4sU0FBOEJDLGNBQUEsQ0FBTUMsYUFBcEMsQ0FBa0U7RUFJN0VDLFdBQVcsQ0FBQ0MsS0FBRCxFQUFnQjtJQUN2QixNQUFNQSxLQUFOO0lBRHVCLG1FQUhGLElBQUFDLGdCQUFBLEdBR0U7SUFBQTtJQUFBLHVEQTRCQUMsTUFBRCxJQUEwQjtNQUNoRCxLQUFLQyxRQUFMLENBQWM7UUFBRUQ7TUFBRixDQUFkO0lBQ0gsQ0E5QjBCO0lBQUEsOERBZ0NPRSxPQUFELElBQTBDO01BQ3ZFLE1BQU1DLG1CQUFtQixHQUFHRCxPQUFPLENBQUNFLElBQVIsQ0FBY0MsS0FBRCxJQUFXQSxLQUFLLENBQUNDLE1BQU4sS0FBaUIsS0FBS0MsY0FBTCxDQUFvQkMsT0FBN0QsQ0FBNUI7TUFDQSxJQUFJLENBQUNMLG1CQUFMLEVBQTBCO01BRTFCLEtBQUtGLFFBQUwsQ0FBYztRQUFFUSxNQUFNLEVBQUVOLG1CQUFtQixDQUFDTyxXQUFwQixDQUFnQ0MsS0FBaEMsR0FBd0NsQjtNQUFsRCxDQUFk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