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

var _callEventTypes = require("matrix-js-sdk/src/webrtc/callEventTypes");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _LegacyCallHandler = _interopRequireDefault(require("../../../LegacyCallHandler"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _languageHandler = require("../../../languageHandler");

var _VideoFeed = _interopRequireDefault(require("./VideoFeed"));

var _RoomAvatar = _interopRequireDefault(require("../avatars/RoomAvatar"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _Avatar = require("../../../Avatar");

var _DesktopCapturerSourcePicker = _interopRequireDefault(require("../elements/DesktopCapturerSourcePicker"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _LegacyCallViewSidebar = _interopRequireDefault(require("./LegacyCallViewSidebar"));

var _LegacyCallViewHeader = _interopRequireDefault(require("./LegacyCallView/LegacyCallViewHeader"));

var _LegacyCallViewButtons = _interopRequireDefault(require("./LegacyCallView/LegacyCallViewButtons"));

var _PlatformPeg = _interopRequireDefault(require("../../../PlatformPeg"));

var _KeyBindingsManager = require("../../../KeyBindingsManager");

var _KeyboardShortcuts = require("../../../accessibility/KeyboardShortcuts");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2019 - 2021 The Matrix.org Foundation C.I.C.
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
function getFullScreenElement() {
  return document.fullscreenElement || // moz omitted because firefox supports this unprefixed now (webkit here for safari)
  document.webkitFullscreenElement || document.msFullscreenElement;
}

function requestFullscreen(element) {
  const method = element.requestFullscreen || // moz omitted since firefox supports unprefixed now
  element.webkitRequestFullScreen || element.msRequestFullscreen;
  if (method) method.call(element);
}

function exitFullscreen() {
  const exitMethod = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
  if (exitMethod) exitMethod.call(document);
}

class LegacyCallView extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "contentWrapperRef", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "buttonsRef", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "onAction", payload => {
      switch (payload.action) {
        case 'video_fullscreen':
          {
            if (!this.contentWrapperRef.current) {
              return;
            }

            if (payload.fullscreen) {
              requestFullscreen(this.contentWrapperRef.current);
            } else if (getFullScreenElement()) {
              exitFullscreen();
            }

            break;
          }
      }
    });
    (0, _defineProperty2.default)(this, "onCallState", state => {
      this.setState({
        callState: state
      });
    });
    (0, _defineProperty2.default)(this, "onFeedsChanged", newFeeds => {
      const {
        primary,
        secondary,
        sidebar
      } = LegacyCallView.getOrderedFeeds(newFeeds);
      this.setState({
        primaryFeed: primary,
        secondaryFeed: secondary,
        sidebarFeeds: sidebar,
        micMuted: this.props.call.isMicrophoneMuted(),
        vidMuted: this.props.call.isLocalVideoMuted()
      });
    });
    (0, _defineProperty2.default)(this, "onCallLocalHoldUnhold", () => {
      this.setState({
        isLocalOnHold: this.props.call.isLocalOnHold()
      });
    });
    (0, _defineProperty2.default)(this, "onCallRemoteHoldUnhold", () => {
      this.setState({
        isRemoteOnHold: this.props.call.isRemoteOnHold(),
        // update both here because isLocalOnHold changes when we hold the call too
        isLocalOnHold: this.props.call.isLocalOnHold()
      });
    });
    (0, _defineProperty2.default)(this, "onMouseMove", () => {
      this.buttonsRef.current?.showControls();
    });
    (0, _defineProperty2.default)(this, "onMaximizeClick", () => {
      _dispatcher.default.dispatch({
        action: 'video_fullscreen',
        fullscreen: true
      });
    });
    (0, _defineProperty2.default)(this, "onMicMuteClick", async () => {
      const newVal = !this.state.micMuted;
      this.setState({
        micMuted: await this.props.call.setMicrophoneMuted(newVal)
      });
    });
    (0, _defineProperty2.default)(this, "onVidMuteClick", async () => {
      const newVal = !this.state.vidMuted;
      this.setState({
        vidMuted: await this.props.call.setLocalVideoMuted(newVal)
      });
    });
    (0, _defineProperty2.default)(this, "onScreenshareClick", async () => {
      let isScreensharing;

      if (this.state.screensharing) {
        isScreensharing = await this.props.call.setScreensharingEnabled(false);
      } else {
        if (_PlatformPeg.default.get().supportsDesktopCapturer()) {
          const {
            finished
          } = _Modal.default.createDialog(_DesktopCapturerSourcePicker.default);

          const [source] = await finished;
          if (!source) return;
          isScreensharing = await this.props.call.setScreensharingEnabled(true, source);
        } else {
          isScreensharing = await this.props.call.setScreensharingEnabled(true);
        }
      }

      this.setState({
        sidebarShown: true,
        screensharing: isScreensharing
      });
    });
    (0, _defineProperty2.default)(this, "onNativeKeyDown", ev => {
      let handled = false;
      const callAction = (0, _KeyBindingsManager.getKeyBindingsManager)().getCallAction(ev);

      switch (callAction) {
        case _KeyboardShortcuts.KeyBindingAction.ToggleMicInCall:
          this.onMicMuteClick(); // show the controls to give feedback

          this.buttonsRef.current?.showControls();
          handled = true;
          break;

        case _KeyboardShortcuts.KeyBindingAction.ToggleWebcamInCall:
          this.onVidMuteClick(); // show the controls to give feedback

          this.buttonsRef.current?.showControls();
          handled = true;
          break;
      }

      if (handled) {
        ev.stopPropagation();
        ev.preventDefault();
      }
    });
    (0, _defineProperty2.default)(this, "onCallResumeClick", () => {
      const userFacingRoomId = _LegacyCallHandler.default.instance.roomIdForCall(this.props.call);

      _LegacyCallHandler.default.instance.setActiveCallRoomId(userFacingRoomId);
    });
    (0, _defineProperty2.default)(this, "onTransferClick", () => {
      const transfereeCall = _LegacyCallHandler.default.instance.getTransfereeForCallId(this.props.call.callId);

      this.props.call.transferToCall(transfereeCall);
    });
    (0, _defineProperty2.default)(this, "onHangupClick", () => {
      _LegacyCallHandler.default.instance.hangupOrReject(_LegacyCallHandler.default.instance.roomIdForCall(this.props.call));
    });
    (0, _defineProperty2.default)(this, "onToggleSidebar", () => {
      this.setState({
        sidebarShown: !this.state.sidebarShown
      });
    });
    const {
      primary: _primary,
      secondary: _secondary,
      sidebar: _sidebar
    } = LegacyCallView.getOrderedFeeds(this.props.call.getFeeds());
    this.state = {
      isLocalOnHold: this.props.call.isLocalOnHold(),
      isRemoteOnHold: this.props.call.isRemoteOnHold(),
      micMuted: this.props.call.isMicrophoneMuted(),
      vidMuted: this.props.call.isLocalVideoMuted(),
      screensharing: this.props.call.isScreensharing(),
      callState: this.props.call.state,
      primaryFeed: _primary,
      secondaryFeed: _secondary,
      sidebarFeeds: _sidebar,
      sidebarShown: true
    };
    this.updateCallListeners(null, this.props.call);
  }

  componentDidMount() {
    this.dispatcherRef = _dispatcher.default.register(this.onAction);
    document.addEventListener('keydown', this.onNativeKeyDown);
  }

  componentWillUnmount() {
    if (getFullScreenElement()) {
      exitFullscreen();
    }

    document.removeEventListener("keydown", this.onNativeKeyDown);
    this.updateCallListeners(this.props.call, null);

    _dispatcher.default.unregister(this.dispatcherRef);
  }

  static getDerivedStateFromProps(props) {
    const {
      primary,
      secondary,
      sidebar
    } = LegacyCallView.getOrderedFeeds(props.call.getFeeds());
    return {
      primaryFeed: primary,
      secondaryFeed: secondary,
      sidebarFeeds: sidebar
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.call === prevProps.call) return;
    this.setState({
      isLocalOnHold: this.props.call.isLocalOnHold(),
      isRemoteOnHold: this.props.call.isRemoteOnHold(),
      micMuted: this.props.call.isMicrophoneMuted(),
      vidMuted: this.props.call.isLocalVideoMuted(),
      callState: this.props.call.state
    });
    this.updateCallListeners(null, this.props.call);
  }

  updateCallListeners(oldCall, newCall) {
    if (oldCall === newCall) return;

    if (oldCall) {
      oldCall.removeListener(_call.CallEvent.State, this.onCallState);
      oldCall.removeListener(_call.CallEvent.LocalHoldUnhold, this.onCallLocalHoldUnhold);
      oldCall.removeListener(_call.CallEvent.RemoteHoldUnhold, this.onCallRemoteHoldUnhold);
      oldCall.removeListener(_call.CallEvent.FeedsChanged, this.onFeedsChanged);
    }

    if (newCall) {
      newCall.on(_call.CallEvent.State, this.onCallState);
      newCall.on(_call.CallEvent.LocalHoldUnhold, this.onCallLocalHoldUnhold);
      newCall.on(_call.CallEvent.RemoteHoldUnhold, this.onCallRemoteHoldUnhold);
      newCall.on(_call.CallEvent.FeedsChanged, this.onFeedsChanged);
    }
  }

  static getOrderedFeeds(feeds) {
    if (feeds.length <= 2) {
      return {
        primary: feeds.find(feed => !feed.isLocal()),
        secondary: feeds.find(feed => feed.isLocal()),
        sidebar: []
      };
    }

    let primary; // Try to use a screensharing as primary, a remote one if possible

    const screensharingFeeds = feeds.filter(feed => feed.purpose === _callEventTypes.SDPStreamMetadataPurpose.Screenshare);
    primary = screensharingFeeds.find(feed => !feed.isLocal()) || screensharingFeeds[0]; // If we didn't find remote screen-sharing stream, try to find any remote stream

    if (!primary) {
      primary = feeds.find(feed => !feed.isLocal());
    }

    const sidebar = [...feeds]; // Remove the primary feed from the array

    if (primary) sidebar.splice(sidebar.indexOf(primary), 1);
    sidebar.sort((a, b) => {
      if (a.isLocal() && !b.isLocal()) return -1;
      if (!a.isLocal() && b.isLocal()) return 1;
      return 0;
    });
    return {
      primary,
      sidebar
    };
  }

  renderCallControls() {
    const {
      call,
      pipMode
    } = this.props;
    const {
      callState,
      micMuted,
      vidMuted,
      screensharing,
      sidebarShown,
      secondaryFeed,
      sidebarFeeds
    } = this.state; // If SDPStreamMetadata isn't supported don't show video mute button in voice calls

    const vidMuteButtonShown = call.opponentSupportsSDPStreamMetadata() || call.hasLocalUserMediaVideoTrack; // Screensharing is possible, if we can send a second stream and
    // identify it using SDPStreamMetadata or if we can replace the already
    // existing usermedia track by a screensharing track. We also need to be
    // connected to know the state of the other side

    const screensharingButtonShown = (call.opponentSupportsSDPStreamMetadata() || call.hasLocalUserMediaVideoTrack) && call.state === _call.CallState.Connected; // Show the sidebar button only if there is something to hide/show


    const sidebarButtonShown = secondaryFeed && !secondaryFeed.isVideoMuted() || sidebarFeeds.length > 0; // The dial pad & 'more' button actions are only relevant in a connected call

    const contextMenuButtonShown = callState === _call.CallState.Connected;
    const dialpadButtonShown = callState === _call.CallState.Connected && call.opponentSupportsDTMF();
    return /*#__PURE__*/_react.default.createElement(_LegacyCallViewButtons.default, {
      ref: this.buttonsRef,
      call: call,
      pipMode: pipMode,
      handlers: {
        onToggleSidebarClick: this.onToggleSidebar,
        onScreenshareClick: this.onScreenshareClick,
        onHangupClick: this.onHangupClick,
        onMicMuteClick: this.onMicMuteClick,
        onVidMuteClick: this.onVidMuteClick
      },
      buttonsState: {
        micMuted: micMuted,
        vidMuted: vidMuted,
        sidebarShown: sidebarShown,
        screensharing: screensharing
      },
      buttonsVisibility: {
        vidMute: vidMuteButtonShown,
        screensharing: screensharingButtonShown,
        sidebar: sidebarButtonShown,
        contextMenu: contextMenuButtonShown,
        dialpad: dialpadButtonShown
      }
    });
  }

  renderToast() {
    const {
      call
    } = this.props;
    const someoneIsScreensharing = call.getFeeds().some(feed => {
      return feed.purpose === _callEventTypes.SDPStreamMetadataPurpose.Screenshare;
    });
    if (!someoneIsScreensharing) return null;
    const isScreensharing = call.isScreensharing();
    const {
      primaryFeed,
      sidebarShown
    } = this.state;
    const sharerName = primaryFeed?.getMember().name;
    if (!sharerName) return;
    let text = isScreensharing ? (0, _languageHandler._t)("You are presenting") : (0, _languageHandler._t)('%(sharerName)s is presenting', {
      sharerName
    });

    if (!sidebarShown) {
      text += " • " + (call.isLocalVideoMuted() ? (0, _languageHandler._t)("Your camera is turned off") : (0, _languageHandler._t)("Your camera is still enabled"));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_LegacyCallView_toast"
    }, text);
  }

  renderContent() {
    const {
      pipMode,
      call,
      onResize
    } = this.props;
    const {
      isLocalOnHold,
      isRemoteOnHold,
      sidebarShown,
      primaryFeed,
      secondaryFeed,
      sidebarFeeds
    } = this.state;

    const callRoom = _MatrixClientPeg.MatrixClientPeg.get().getRoom(call.roomId);

    const avatarSize = pipMode ? 76 : 160;

    const transfereeCall = _LegacyCallHandler.default.instance.getTransfereeForCallId(call.callId);

    const isOnHold = isLocalOnHold || isRemoteOnHold;
    let secondaryFeedElement;

    if (sidebarShown && secondaryFeed && !secondaryFeed.isVideoMuted()) {
      secondaryFeedElement = /*#__PURE__*/_react.default.createElement(_VideoFeed.default, {
        feed: secondaryFeed,
        call: call,
        pipMode: pipMode,
        onResize: onResize,
        secondary: true
      });
    }

    if (transfereeCall || isOnHold) {
      const containerClasses = (0, _classnames.default)("mx_LegacyCallView_content", {
        mx_LegacyCallView_content_hold: isOnHold
      });
      const backgroundAvatarUrl = (0, _Avatar.avatarUrlForMember)(call.getOpponentMember(), 1024, 1024, 'crop');
      let holdTransferContent;

      if (transfereeCall) {
        const transferTargetRoom = _MatrixClientPeg.MatrixClientPeg.get().getRoom(_LegacyCallHandler.default.instance.roomIdForCall(call));

        const transferTargetName = transferTargetRoom ? transferTargetRoom.name : (0, _languageHandler._t)("unknown person");

        const transfereeRoom = _MatrixClientPeg.MatrixClientPeg.get().getRoom(_LegacyCallHandler.default.instance.roomIdForCall(transfereeCall));

        const transfereeName = transfereeRoom ? transfereeRoom.name : (0, _languageHandler._t)("unknown person");
        holdTransferContent = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_LegacyCallView_status"
        }, (0, _languageHandler._t)("Consulting with %(transferTarget)s. <a>Transfer to %(transferee)s</a>", {
          transferTarget: transferTargetName,
          transferee: transfereeName
        }, {
          a: sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
            kind: "link_inline",
            onClick: this.onTransferClick
          }, sub)
        }));
      } else {
        let onHoldText;

        if (isRemoteOnHold) {
          onHoldText = (0, _languageHandler._t)(_LegacyCallHandler.default.instance.hasAnyUnheldCall() ? (0, _languageHandler._td)("You held the call <a>Switch</a>") : (0, _languageHandler._td)("You held the call <a>Resume</a>"), {}, {
            a: sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
              kind: "link_inline",
              onClick: this.onCallResumeClick
            }, sub)
          });
        } else if (isLocalOnHold) {
          onHoldText = (0, _languageHandler._t)("%(peerName)s held the call", {
            peerName: call.getOpponentMember().name
          });
        }

        holdTransferContent = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_LegacyCallView_status"
        }, onHoldText);
      }

      return /*#__PURE__*/_react.default.createElement("div", {
        className: containerClasses,
        onMouseMove: this.onMouseMove
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_LegacyCallView_holdBackground",
        style: {
          backgroundImage: 'url(' + backgroundAvatarUrl + ')'
        }
      }), holdTransferContent);
    } else if (call.noIncomingFeeds()) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_LegacyCallView_content",
        onMouseMove: this.onMouseMove
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_LegacyCallView_avatarsContainer"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_LegacyCallView_avatarContainer",
        style: {
          width: avatarSize,
          height: avatarSize
        }
      }, /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
        room: callRoom,
        height: avatarSize,
        width: avatarSize
      }))), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_LegacyCallView_status"
      }, (0, _languageHandler._t)("Connecting")), secondaryFeedElement);
    } else if (pipMode) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_LegacyCallView_content",
        onMouseMove: this.onMouseMove
      }, /*#__PURE__*/_react.default.createElement(_VideoFeed.default, {
        feed: primaryFeed,
        call: call,
        pipMode: pipMode,
        onResize: onResize,
        primary: true
      }));
    } else if (secondaryFeed) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_LegacyCallView_content",
        onMouseMove: this.onMouseMove
      }, /*#__PURE__*/_react.default.createElement(_VideoFeed.default, {
        feed: primaryFeed,
        call: call,
        pipMode: pipMode,
        onResize: onResize,
        primary: true
      }), secondaryFeedElement);
    } else {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_LegacyCallView_content",
        onMouseMove: this.onMouseMove
      }, /*#__PURE__*/_react.default.createElement(_VideoFeed.default, {
        feed: primaryFeed,
        call: call,
        pipMode: pipMode,
        onResize: onResize,
        primary: true
      }), sidebarShown && /*#__PURE__*/_react.default.createElement(_LegacyCallViewSidebar.default, {
        feeds: sidebarFeeds,
        call: call,
        pipMode: pipMode
      }));
    }
  }

  render() {
    const {
      call,
      secondaryCall,
      pipMode,
      showApps,
      onMouseDownOnHeader
    } = this.props;
    const {
      sidebarShown,
      sidebarFeeds
    } = this.state;

    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const callRoomId = _LegacyCallHandler.default.instance.roomIdForCall(call);

    const secondaryCallRoomId = _LegacyCallHandler.default.instance.roomIdForCall(secondaryCall);

    const callRoom = client.getRoom(callRoomId);
    const secCallRoom = secondaryCall ? client.getRoom(secondaryCallRoomId) : null;
    const callViewClasses = (0, _classnames.default)({
      mx_LegacyCallView: true,
      mx_LegacyCallView_pip: pipMode,
      mx_LegacyCallView_large: !pipMode,
      mx_LegacyCallView_sidebar: sidebarShown && sidebarFeeds.length !== 0 && !pipMode,
      mx_LegacyCallView_belowWidget: showApps // css to correct the margins if the call is below the AppsDrawer.

    });
    return /*#__PURE__*/_react.default.createElement("div", {
      className: callViewClasses
    }, /*#__PURE__*/_react.default.createElement(_LegacyCallViewHeader.default, {
      onPipMouseDown: onMouseDownOnHeader,
      pipMode: pipMode,
      callRooms: [callRoom, secCallRoom],
      onMaximize: this.onMaximizeClick
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_LegacyCallView_content_wrapper",
      ref: this.contentWrapperRef
    }, this.renderToast(), this.renderContent(), this.renderCallControls()));
  }

}

exports.default = LegacyCallView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRGdWxsU2NyZWVuRWxlbWVudCIsImRvY3VtZW50IiwiZnVsbHNjcmVlbkVsZW1lbnQiLCJ3ZWJraXRGdWxsc2NyZWVuRWxlbWVudCIsIm1zRnVsbHNjcmVlbkVsZW1lbnQiLCJyZXF1ZXN0RnVsbHNjcmVlbiIsImVsZW1lbnQiLCJtZXRob2QiLCJ3ZWJraXRSZXF1ZXN0RnVsbFNjcmVlbiIsIm1zUmVxdWVzdEZ1bGxzY3JlZW4iLCJjYWxsIiwiZXhpdEZ1bGxzY3JlZW4iLCJleGl0TWV0aG9kIiwid2Via2l0RXhpdEZ1bGxzY3JlZW4iLCJtc0V4aXRGdWxsc2NyZWVuIiwiTGVnYWN5Q2FsbFZpZXciLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjcmVhdGVSZWYiLCJwYXlsb2FkIiwiYWN0aW9uIiwiY29udGVudFdyYXBwZXJSZWYiLCJjdXJyZW50IiwiZnVsbHNjcmVlbiIsInN0YXRlIiwic2V0U3RhdGUiLCJjYWxsU3RhdGUiLCJuZXdGZWVkcyIsInByaW1hcnkiLCJzZWNvbmRhcnkiLCJzaWRlYmFyIiwiZ2V0T3JkZXJlZEZlZWRzIiwicHJpbWFyeUZlZWQiLCJzZWNvbmRhcnlGZWVkIiwic2lkZWJhckZlZWRzIiwibWljTXV0ZWQiLCJpc01pY3JvcGhvbmVNdXRlZCIsInZpZE11dGVkIiwiaXNMb2NhbFZpZGVvTXV0ZWQiLCJpc0xvY2FsT25Ib2xkIiwiaXNSZW1vdGVPbkhvbGQiLCJidXR0b25zUmVmIiwic2hvd0NvbnRyb2xzIiwiZGlzIiwiZGlzcGF0Y2giLCJuZXdWYWwiLCJzZXRNaWNyb3Bob25lTXV0ZWQiLCJzZXRMb2NhbFZpZGVvTXV0ZWQiLCJpc1NjcmVlbnNoYXJpbmciLCJzY3JlZW5zaGFyaW5nIiwic2V0U2NyZWVuc2hhcmluZ0VuYWJsZWQiLCJQbGF0Zm9ybVBlZyIsImdldCIsInN1cHBvcnRzRGVza3RvcENhcHR1cmVyIiwiZmluaXNoZWQiLCJNb2RhbCIsImNyZWF0ZURpYWxvZyIsIkRlc2t0b3BDYXB0dXJlclNvdXJjZVBpY2tlciIsInNvdXJjZSIsInNpZGViYXJTaG93biIsImV2IiwiaGFuZGxlZCIsImNhbGxBY3Rpb24iLCJnZXRLZXlCaW5kaW5nc01hbmFnZXIiLCJnZXRDYWxsQWN0aW9uIiwiS2V5QmluZGluZ0FjdGlvbiIsIlRvZ2dsZU1pY0luQ2FsbCIsIm9uTWljTXV0ZUNsaWNrIiwiVG9nZ2xlV2ViY2FtSW5DYWxsIiwib25WaWRNdXRlQ2xpY2siLCJzdG9wUHJvcGFnYXRpb24iLCJwcmV2ZW50RGVmYXVsdCIsInVzZXJGYWNpbmdSb29tSWQiLCJMZWdhY3lDYWxsSGFuZGxlciIsImluc3RhbmNlIiwicm9vbUlkRm9yQ2FsbCIsInNldEFjdGl2ZUNhbGxSb29tSWQiLCJ0cmFuc2ZlcmVlQ2FsbCIsImdldFRyYW5zZmVyZWVGb3JDYWxsSWQiLCJjYWxsSWQiLCJ0cmFuc2ZlclRvQ2FsbCIsImhhbmd1cE9yUmVqZWN0IiwiZ2V0RmVlZHMiLCJ1cGRhdGVDYWxsTGlzdGVuZXJzIiwiY29tcG9uZW50RGlkTW91bnQiLCJkaXNwYXRjaGVyUmVmIiwicmVnaXN0ZXIiLCJvbkFjdGlvbiIsImFkZEV2ZW50TGlzdGVuZXIiLCJvbk5hdGl2ZUtleURvd24iLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJ1bnJlZ2lzdGVyIiwiZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzIiwiY29tcG9uZW50RGlkVXBkYXRlIiwicHJldlByb3BzIiwib2xkQ2FsbCIsIm5ld0NhbGwiLCJyZW1vdmVMaXN0ZW5lciIsIkNhbGxFdmVudCIsIlN0YXRlIiwib25DYWxsU3RhdGUiLCJMb2NhbEhvbGRVbmhvbGQiLCJvbkNhbGxMb2NhbEhvbGRVbmhvbGQiLCJSZW1vdGVIb2xkVW5ob2xkIiwib25DYWxsUmVtb3RlSG9sZFVuaG9sZCIsIkZlZWRzQ2hhbmdlZCIsIm9uRmVlZHNDaGFuZ2VkIiwib24iLCJmZWVkcyIsImxlbmd0aCIsImZpbmQiLCJmZWVkIiwiaXNMb2NhbCIsInNjcmVlbnNoYXJpbmdGZWVkcyIsImZpbHRlciIsInB1cnBvc2UiLCJTRFBTdHJlYW1NZXRhZGF0YVB1cnBvc2UiLCJTY3JlZW5zaGFyZSIsInNwbGljZSIsImluZGV4T2YiLCJzb3J0IiwiYSIsImIiLCJyZW5kZXJDYWxsQ29udHJvbHMiLCJwaXBNb2RlIiwidmlkTXV0ZUJ1dHRvblNob3duIiwib3Bwb25lbnRTdXBwb3J0c1NEUFN0cmVhbU1ldGFkYXRhIiwiaGFzTG9jYWxVc2VyTWVkaWFWaWRlb1RyYWNrIiwic2NyZWVuc2hhcmluZ0J1dHRvblNob3duIiwiQ2FsbFN0YXRlIiwiQ29ubmVjdGVkIiwic2lkZWJhckJ1dHRvblNob3duIiwiaXNWaWRlb011dGVkIiwiY29udGV4dE1lbnVCdXR0b25TaG93biIsImRpYWxwYWRCdXR0b25TaG93biIsIm9wcG9uZW50U3VwcG9ydHNEVE1GIiwib25Ub2dnbGVTaWRlYmFyQ2xpY2siLCJvblRvZ2dsZVNpZGViYXIiLCJvblNjcmVlbnNoYXJlQ2xpY2siLCJvbkhhbmd1cENsaWNrIiwidmlkTXV0ZSIsImNvbnRleHRNZW51IiwiZGlhbHBhZCIsInJlbmRlclRvYXN0Iiwic29tZW9uZUlzU2NyZWVuc2hhcmluZyIsInNvbWUiLCJzaGFyZXJOYW1lIiwiZ2V0TWVtYmVyIiwibmFtZSIsInRleHQiLCJfdCIsInJlbmRlckNvbnRlbnQiLCJvblJlc2l6ZSIsImNhbGxSb29tIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0Um9vbSIsInJvb21JZCIsImF2YXRhclNpemUiLCJpc09uSG9sZCIsInNlY29uZGFyeUZlZWRFbGVtZW50IiwiY29udGFpbmVyQ2xhc3NlcyIsImNsYXNzTmFtZXMiLCJteF9MZWdhY3lDYWxsVmlld19jb250ZW50X2hvbGQiLCJiYWNrZ3JvdW5kQXZhdGFyVXJsIiwiYXZhdGFyVXJsRm9yTWVtYmVyIiwiZ2V0T3Bwb25lbnRNZW1iZXIiLCJob2xkVHJhbnNmZXJDb250ZW50IiwidHJhbnNmZXJUYXJnZXRSb29tIiwidHJhbnNmZXJUYXJnZXROYW1lIiwidHJhbnNmZXJlZVJvb20iLCJ0cmFuc2ZlcmVlTmFtZSIsInRyYW5zZmVyVGFyZ2V0IiwidHJhbnNmZXJlZSIsInN1YiIsIm9uVHJhbnNmZXJDbGljayIsIm9uSG9sZFRleHQiLCJoYXNBbnlVbmhlbGRDYWxsIiwiX3RkIiwib25DYWxsUmVzdW1lQ2xpY2siLCJwZWVyTmFtZSIsIm9uTW91c2VNb3ZlIiwiYmFja2dyb3VuZEltYWdlIiwibm9JbmNvbWluZ0ZlZWRzIiwid2lkdGgiLCJoZWlnaHQiLCJyZW5kZXIiLCJzZWNvbmRhcnlDYWxsIiwic2hvd0FwcHMiLCJvbk1vdXNlRG93bk9uSGVhZGVyIiwiY2xpZW50IiwiY2FsbFJvb21JZCIsInNlY29uZGFyeUNhbGxSb29tSWQiLCJzZWNDYWxsUm9vbSIsImNhbGxWaWV3Q2xhc3NlcyIsIm14X0xlZ2FjeUNhbGxWaWV3IiwibXhfTGVnYWN5Q2FsbFZpZXdfcGlwIiwibXhfTGVnYWN5Q2FsbFZpZXdfbGFyZ2UiLCJteF9MZWdhY3lDYWxsVmlld19zaWRlYmFyIiwibXhfTGVnYWN5Q2FsbFZpZXdfYmVsb3dXaWRnZXQiLCJvbk1heGltaXplQ2xpY2siXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy92b2lwL0xlZ2FjeUNhbGxWaWV3LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE5IC0gMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuQ29weXJpZ2h0IDIwMjEgLSAyMDIyIMWgaW1vbiBCcmFuZG5lciA8c2ltb24uYnJhLmFnQGdtYWlsLmNvbT5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgY3JlYXRlUmVmIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQ2FsbEV2ZW50LCBDYWxsU3RhdGUsIE1hdHJpeENhbGwgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy93ZWJydGMvY2FsbCc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCB7IENhbGxGZWVkIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvd2VicnRjL2NhbGxGZWVkJztcbmltcG9ydCB7IFNEUFN0cmVhbU1ldGFkYXRhUHVycG9zZSB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL3dlYnJ0Yy9jYWxsRXZlbnRUeXBlcyc7XG5cbmltcG9ydCBkaXMgZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCBMZWdhY3lDYWxsSGFuZGxlciBmcm9tICcuLi8uLi8uLi9MZWdhY3lDYWxsSGFuZGxlcic7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tICcuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IHsgX3QsIF90ZCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgVmlkZW9GZWVkIGZyb20gJy4vVmlkZW9GZWVkJztcbmltcG9ydCBSb29tQXZhdGFyIGZyb20gXCIuLi9hdmF0YXJzL1Jvb21BdmF0YXJcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gJy4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b24nO1xuaW1wb3J0IHsgYXZhdGFyVXJsRm9yTWVtYmVyIH0gZnJvbSAnLi4vLi4vLi4vQXZhdGFyJztcbmltcG9ydCBEZXNrdG9wQ2FwdHVyZXJTb3VyY2VQaWNrZXIgZnJvbSBcIi4uL2VsZW1lbnRzL0Rlc2t0b3BDYXB0dXJlclNvdXJjZVBpY2tlclwiO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uLy4uL01vZGFsJztcbmltcG9ydCBMZWdhY3lDYWxsVmlld1NpZGViYXIgZnJvbSAnLi9MZWdhY3lDYWxsVmlld1NpZGViYXInO1xuaW1wb3J0IExlZ2FjeUNhbGxWaWV3SGVhZGVyIGZyb20gJy4vTGVnYWN5Q2FsbFZpZXcvTGVnYWN5Q2FsbFZpZXdIZWFkZXInO1xuaW1wb3J0IExlZ2FjeUNhbGxWaWV3QnV0dG9ucyBmcm9tIFwiLi9MZWdhY3lDYWxsVmlldy9MZWdhY3lDYWxsVmlld0J1dHRvbnNcIjtcbmltcG9ydCBQbGF0Zm9ybVBlZyBmcm9tIFwiLi4vLi4vLi4vUGxhdGZvcm1QZWdcIjtcbmltcG9ydCB7IEFjdGlvblBheWxvYWQgfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkc1wiO1xuaW1wb3J0IHsgZ2V0S2V5QmluZGluZ3NNYW5hZ2VyIH0gZnJvbSBcIi4uLy4uLy4uL0tleUJpbmRpbmdzTWFuYWdlclwiO1xuaW1wb3J0IHsgS2V5QmluZGluZ0FjdGlvbiB9IGZyb20gXCIuLi8uLi8uLi9hY2Nlc3NpYmlsaXR5L0tleWJvYXJkU2hvcnRjdXRzXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIC8vIFRoZSBjYWxsIGZvciB1cyB0byBkaXNwbGF5XG4gICAgY2FsbDogTWF0cml4Q2FsbDtcblxuICAgIC8vIEFub3RoZXIgb25nb2luZyBjYWxsIHRvIGRpc3BsYXkgaW5mb3JtYXRpb24gYWJvdXRcbiAgICBzZWNvbmRhcnlDYWxsPzogTWF0cml4Q2FsbDtcblxuICAgIC8vIGEgY2FsbGJhY2sgd2hpY2ggaXMgY2FsbGVkIHdoZW4gdGhlIGNvbnRlbnQgaW4gdGhlIExlZ2FjeUNhbGxWaWV3IGNoYW5nZXNcbiAgICAvLyBpbiBhIHdheSB0aGF0IGlzIGxpa2VseSB0byBjYXVzZSBhIHJlc2l6ZS5cbiAgICBvblJlc2l6ZT86IChldmVudDogRXZlbnQpID0+IHZvaWQ7XG5cbiAgICAvLyBXaGV0aGVyIHRoaXMgY2FsbCB2aWV3IGlzIGZvciBwaWN0dXJlLWluLXBpY3R1cmUgbW9kZVxuICAgIC8vIG90aGVyd2lzZSwgaXQncyB0aGUgbGFyZ2VyIGNhbGwgdmlldyB3aGVuIHZpZXdpbmcgdGhlIHJvb20gdGhlIGNhbGwgaXMgaW4uXG4gICAgLy8gVGhpcyBpcyBzb3J0IG9mIGEgcHJveHkgZm9yIGEgbnVtYmVyIG9mIHRoaW5ncyBidXQgd2UgY3VycmVudGx5IGhhdmUgbm9cbiAgICAvLyBuZWVkIHRvIGNvbnRyb2wgdGhvc2UgdGhpbmdzIHNlcGFyYXRlbHksIHNvIHRoaXMgaXMgc2ltcGxlci5cbiAgICBwaXBNb2RlPzogYm9vbGVhbjtcblxuICAgIC8vIFVzZWQgZm9yIGRyYWdnaW5nIHRoZSBQaVAgTGVnYWN5Q2FsbFZpZXdcbiAgICBvbk1vdXNlRG93bk9uSGVhZGVyPzogKGV2ZW50OiBSZWFjdC5Nb3VzZUV2ZW50PEVsZW1lbnQsIE1vdXNlRXZlbnQ+KSA9PiB2b2lkO1xuXG4gICAgc2hvd0FwcHM/OiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBpc0xvY2FsT25Ib2xkOiBib29sZWFuO1xuICAgIGlzUmVtb3RlT25Ib2xkOiBib29sZWFuO1xuICAgIG1pY011dGVkOiBib29sZWFuO1xuICAgIHZpZE11dGVkOiBib29sZWFuO1xuICAgIHNjcmVlbnNoYXJpbmc6IGJvb2xlYW47XG4gICAgY2FsbFN0YXRlOiBDYWxsU3RhdGU7XG4gICAgcHJpbWFyeUZlZWQ/OiBDYWxsRmVlZDtcbiAgICBzZWNvbmRhcnlGZWVkPzogQ2FsbEZlZWQ7XG4gICAgc2lkZWJhckZlZWRzOiBBcnJheTxDYWxsRmVlZD47XG4gICAgc2lkZWJhclNob3duOiBib29sZWFuO1xufVxuXG5mdW5jdGlvbiBnZXRGdWxsU2NyZWVuRWxlbWVudCgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgICBkb2N1bWVudC5mdWxsc2NyZWVuRWxlbWVudCB8fFxuICAgICAgICAvLyBtb3ogb21pdHRlZCBiZWNhdXNlIGZpcmVmb3ggc3VwcG9ydHMgdGhpcyB1bnByZWZpeGVkIG5vdyAod2Via2l0IGhlcmUgZm9yIHNhZmFyaSlcbiAgICAgICAgZG9jdW1lbnQud2Via2l0RnVsbHNjcmVlbkVsZW1lbnQgfHxcbiAgICAgICAgZG9jdW1lbnQubXNGdWxsc2NyZWVuRWxlbWVudFxuICAgICk7XG59XG5cbmZ1bmN0aW9uIHJlcXVlc3RGdWxsc2NyZWVuKGVsZW1lbnQ6IEVsZW1lbnQpIHtcbiAgICBjb25zdCBtZXRob2QgPSAoXG4gICAgICAgIGVsZW1lbnQucmVxdWVzdEZ1bGxzY3JlZW4gfHxcbiAgICAgICAgLy8gbW96IG9taXR0ZWQgc2luY2UgZmlyZWZveCBzdXBwb3J0cyB1bnByZWZpeGVkIG5vd1xuICAgICAgICBlbGVtZW50LndlYmtpdFJlcXVlc3RGdWxsU2NyZWVuIHx8XG4gICAgICAgIGVsZW1lbnQubXNSZXF1ZXN0RnVsbHNjcmVlblxuICAgICk7XG4gICAgaWYgKG1ldGhvZCkgbWV0aG9kLmNhbGwoZWxlbWVudCk7XG59XG5cbmZ1bmN0aW9uIGV4aXRGdWxsc2NyZWVuKCkge1xuICAgIGNvbnN0IGV4aXRNZXRob2QgPSAoXG4gICAgICAgIGRvY3VtZW50LmV4aXRGdWxsc2NyZWVuIHx8XG4gICAgICAgIGRvY3VtZW50LndlYmtpdEV4aXRGdWxsc2NyZWVuIHx8XG4gICAgICAgIGRvY3VtZW50Lm1zRXhpdEZ1bGxzY3JlZW5cbiAgICApO1xuICAgIGlmIChleGl0TWV0aG9kKSBleGl0TWV0aG9kLmNhbGwoZG9jdW1lbnQpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMZWdhY3lDYWxsVmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHByaXZhdGUgZGlzcGF0Y2hlclJlZjogc3RyaW5nO1xuICAgIHByaXZhdGUgY29udGVudFdyYXBwZXJSZWYgPSBjcmVhdGVSZWY8SFRNTERpdkVsZW1lbnQ+KCk7XG4gICAgcHJpdmF0ZSBidXR0b25zUmVmID0gY3JlYXRlUmVmPExlZ2FjeUNhbGxWaWV3QnV0dG9ucz4oKTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBJUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIGNvbnN0IHsgcHJpbWFyeSwgc2Vjb25kYXJ5LCBzaWRlYmFyIH0gPSBMZWdhY3lDYWxsVmlldy5nZXRPcmRlcmVkRmVlZHModGhpcy5wcm9wcy5jYWxsLmdldEZlZWRzKCkpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBpc0xvY2FsT25Ib2xkOiB0aGlzLnByb3BzLmNhbGwuaXNMb2NhbE9uSG9sZCgpLFxuICAgICAgICAgICAgaXNSZW1vdGVPbkhvbGQ6IHRoaXMucHJvcHMuY2FsbC5pc1JlbW90ZU9uSG9sZCgpLFxuICAgICAgICAgICAgbWljTXV0ZWQ6IHRoaXMucHJvcHMuY2FsbC5pc01pY3JvcGhvbmVNdXRlZCgpLFxuICAgICAgICAgICAgdmlkTXV0ZWQ6IHRoaXMucHJvcHMuY2FsbC5pc0xvY2FsVmlkZW9NdXRlZCgpLFxuICAgICAgICAgICAgc2NyZWVuc2hhcmluZzogdGhpcy5wcm9wcy5jYWxsLmlzU2NyZWVuc2hhcmluZygpLFxuICAgICAgICAgICAgY2FsbFN0YXRlOiB0aGlzLnByb3BzLmNhbGwuc3RhdGUsXG4gICAgICAgICAgICBwcmltYXJ5RmVlZDogcHJpbWFyeSxcbiAgICAgICAgICAgIHNlY29uZGFyeUZlZWQ6IHNlY29uZGFyeSxcbiAgICAgICAgICAgIHNpZGViYXJGZWVkczogc2lkZWJhcixcbiAgICAgICAgICAgIHNpZGViYXJTaG93bjogdHJ1ZSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnVwZGF0ZUNhbGxMaXN0ZW5lcnMobnVsbCwgdGhpcy5wcm9wcy5jYWxsKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlclJlZiA9IGRpcy5yZWdpc3Rlcih0aGlzLm9uQWN0aW9uKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMub25OYXRpdmVLZXlEb3duKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgICAgIGlmIChnZXRGdWxsU2NyZWVuRWxlbWVudCgpKSB7XG4gICAgICAgICAgICBleGl0RnVsbHNjcmVlbigpO1xuICAgICAgICB9XG5cbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5vbk5hdGl2ZUtleURvd24pO1xuICAgICAgICB0aGlzLnVwZGF0ZUNhbGxMaXN0ZW5lcnModGhpcy5wcm9wcy5jYWxsLCBudWxsKTtcbiAgICAgICAgZGlzLnVucmVnaXN0ZXIodGhpcy5kaXNwYXRjaGVyUmVmKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0RGVyaXZlZFN0YXRlRnJvbVByb3BzKHByb3BzOiBJUHJvcHMpOiBQYXJ0aWFsPElTdGF0ZT4ge1xuICAgICAgICBjb25zdCB7IHByaW1hcnksIHNlY29uZGFyeSwgc2lkZWJhciB9ID0gTGVnYWN5Q2FsbFZpZXcuZ2V0T3JkZXJlZEZlZWRzKHByb3BzLmNhbGwuZ2V0RmVlZHMoKSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHByaW1hcnlGZWVkOiBwcmltYXJ5LFxuICAgICAgICAgICAgc2Vjb25kYXJ5RmVlZDogc2Vjb25kYXJ5LFxuICAgICAgICAgICAgc2lkZWJhckZlZWRzOiBzaWRlYmFyLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzOiBJUHJvcHMpOiB2b2lkIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuY2FsbCA9PT0gcHJldlByb3BzLmNhbGwpIHJldHVybjtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGlzTG9jYWxPbkhvbGQ6IHRoaXMucHJvcHMuY2FsbC5pc0xvY2FsT25Ib2xkKCksXG4gICAgICAgICAgICBpc1JlbW90ZU9uSG9sZDogdGhpcy5wcm9wcy5jYWxsLmlzUmVtb3RlT25Ib2xkKCksXG4gICAgICAgICAgICBtaWNNdXRlZDogdGhpcy5wcm9wcy5jYWxsLmlzTWljcm9waG9uZU11dGVkKCksXG4gICAgICAgICAgICB2aWRNdXRlZDogdGhpcy5wcm9wcy5jYWxsLmlzTG9jYWxWaWRlb011dGVkKCksXG4gICAgICAgICAgICBjYWxsU3RhdGU6IHRoaXMucHJvcHMuY2FsbC5zdGF0ZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy51cGRhdGVDYWxsTGlzdGVuZXJzKG51bGwsIHRoaXMucHJvcHMuY2FsbCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkFjdGlvbiA9IChwYXlsb2FkOiBBY3Rpb25QYXlsb2FkKTogdm9pZCA9PiB7XG4gICAgICAgIHN3aXRjaCAocGF5bG9hZC5hY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgJ3ZpZGVvX2Z1bGxzY3JlZW4nOiB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmNvbnRlbnRXcmFwcGVyUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocGF5bG9hZC5mdWxsc2NyZWVuKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3RGdWxsc2NyZWVuKHRoaXMuY29udGVudFdyYXBwZXJSZWYuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChnZXRGdWxsU2NyZWVuRWxlbWVudCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4aXRGdWxsc2NyZWVuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgdXBkYXRlQ2FsbExpc3RlbmVycyhvbGRDYWxsOiBNYXRyaXhDYWxsLCBuZXdDYWxsOiBNYXRyaXhDYWxsKTogdm9pZCB7XG4gICAgICAgIGlmIChvbGRDYWxsID09PSBuZXdDYWxsKSByZXR1cm47XG5cbiAgICAgICAgaWYgKG9sZENhbGwpIHtcbiAgICAgICAgICAgIG9sZENhbGwucmVtb3ZlTGlzdGVuZXIoQ2FsbEV2ZW50LlN0YXRlLCB0aGlzLm9uQ2FsbFN0YXRlKTtcbiAgICAgICAgICAgIG9sZENhbGwucmVtb3ZlTGlzdGVuZXIoQ2FsbEV2ZW50LkxvY2FsSG9sZFVuaG9sZCwgdGhpcy5vbkNhbGxMb2NhbEhvbGRVbmhvbGQpO1xuICAgICAgICAgICAgb2xkQ2FsbC5yZW1vdmVMaXN0ZW5lcihDYWxsRXZlbnQuUmVtb3RlSG9sZFVuaG9sZCwgdGhpcy5vbkNhbGxSZW1vdGVIb2xkVW5ob2xkKTtcbiAgICAgICAgICAgIG9sZENhbGwucmVtb3ZlTGlzdGVuZXIoQ2FsbEV2ZW50LkZlZWRzQ2hhbmdlZCwgdGhpcy5vbkZlZWRzQ2hhbmdlZCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5ld0NhbGwpIHtcbiAgICAgICAgICAgIG5ld0NhbGwub24oQ2FsbEV2ZW50LlN0YXRlLCB0aGlzLm9uQ2FsbFN0YXRlKTtcbiAgICAgICAgICAgIG5ld0NhbGwub24oQ2FsbEV2ZW50LkxvY2FsSG9sZFVuaG9sZCwgdGhpcy5vbkNhbGxMb2NhbEhvbGRVbmhvbGQpO1xuICAgICAgICAgICAgbmV3Q2FsbC5vbihDYWxsRXZlbnQuUmVtb3RlSG9sZFVuaG9sZCwgdGhpcy5vbkNhbGxSZW1vdGVIb2xkVW5ob2xkKTtcbiAgICAgICAgICAgIG5ld0NhbGwub24oQ2FsbEV2ZW50LkZlZWRzQ2hhbmdlZCwgdGhpcy5vbkZlZWRzQ2hhbmdlZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQ2FsbFN0YXRlID0gKHN0YXRlOiBDYWxsU3RhdGUpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBjYWxsU3RhdGU6IHN0YXRlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkZlZWRzQ2hhbmdlZCA9IChuZXdGZWVkczogQXJyYXk8Q2FsbEZlZWQ+KTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IHsgcHJpbWFyeSwgc2Vjb25kYXJ5LCBzaWRlYmFyIH0gPSBMZWdhY3lDYWxsVmlldy5nZXRPcmRlcmVkRmVlZHMobmV3RmVlZHMpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHByaW1hcnlGZWVkOiBwcmltYXJ5LFxuICAgICAgICAgICAgc2Vjb25kYXJ5RmVlZDogc2Vjb25kYXJ5LFxuICAgICAgICAgICAgc2lkZWJhckZlZWRzOiBzaWRlYmFyLFxuICAgICAgICAgICAgbWljTXV0ZWQ6IHRoaXMucHJvcHMuY2FsbC5pc01pY3JvcGhvbmVNdXRlZCgpLFxuICAgICAgICAgICAgdmlkTXV0ZWQ6IHRoaXMucHJvcHMuY2FsbC5pc0xvY2FsVmlkZW9NdXRlZCgpLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNhbGxMb2NhbEhvbGRVbmhvbGQgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgaXNMb2NhbE9uSG9sZDogdGhpcy5wcm9wcy5jYWxsLmlzTG9jYWxPbkhvbGQoKSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25DYWxsUmVtb3RlSG9sZFVuaG9sZCA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBpc1JlbW90ZU9uSG9sZDogdGhpcy5wcm9wcy5jYWxsLmlzUmVtb3RlT25Ib2xkKCksXG4gICAgICAgICAgICAvLyB1cGRhdGUgYm90aCBoZXJlIGJlY2F1c2UgaXNMb2NhbE9uSG9sZCBjaGFuZ2VzIHdoZW4gd2UgaG9sZCB0aGUgY2FsbCB0b29cbiAgICAgICAgICAgIGlzTG9jYWxPbkhvbGQ6IHRoaXMucHJvcHMuY2FsbC5pc0xvY2FsT25Ib2xkKCksXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uTW91c2VNb3ZlID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLmJ1dHRvbnNSZWYuY3VycmVudD8uc2hvd0NvbnRyb2xzKCk7XG4gICAgfTtcblxuICAgIHN0YXRpYyBnZXRPcmRlcmVkRmVlZHMoXG4gICAgICAgIGZlZWRzOiBBcnJheTxDYWxsRmVlZD4sXG4gICAgKTogeyBwcmltYXJ5PzogQ2FsbEZlZWQsIHNlY29uZGFyeT86IENhbGxGZWVkLCBzaWRlYmFyOiBBcnJheTxDYWxsRmVlZD4gfSB7XG4gICAgICAgIGlmIChmZWVkcy5sZW5ndGggPD0gMikge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBwcmltYXJ5OiBmZWVkcy5maW5kKChmZWVkKSA9PiAhZmVlZC5pc0xvY2FsKCkpLFxuICAgICAgICAgICAgICAgIHNlY29uZGFyeTogZmVlZHMuZmluZCgoZmVlZCkgPT4gZmVlZC5pc0xvY2FsKCkpLFxuICAgICAgICAgICAgICAgIHNpZGViYXI6IFtdLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwcmltYXJ5OiBDYWxsRmVlZDtcblxuICAgICAgICAvLyBUcnkgdG8gdXNlIGEgc2NyZWVuc2hhcmluZyBhcyBwcmltYXJ5LCBhIHJlbW90ZSBvbmUgaWYgcG9zc2libGVcbiAgICAgICAgY29uc3Qgc2NyZWVuc2hhcmluZ0ZlZWRzID0gZmVlZHMuZmlsdGVyKChmZWVkKSA9PiBmZWVkLnB1cnBvc2UgPT09IFNEUFN0cmVhbU1ldGFkYXRhUHVycG9zZS5TY3JlZW5zaGFyZSk7XG4gICAgICAgIHByaW1hcnkgPSBzY3JlZW5zaGFyaW5nRmVlZHMuZmluZCgoZmVlZCkgPT4gIWZlZWQuaXNMb2NhbCgpKSB8fCBzY3JlZW5zaGFyaW5nRmVlZHNbMF07XG4gICAgICAgIC8vIElmIHdlIGRpZG4ndCBmaW5kIHJlbW90ZSBzY3JlZW4tc2hhcmluZyBzdHJlYW0sIHRyeSB0byBmaW5kIGFueSByZW1vdGUgc3RyZWFtXG4gICAgICAgIGlmICghcHJpbWFyeSkge1xuICAgICAgICAgICAgcHJpbWFyeSA9IGZlZWRzLmZpbmQoKGZlZWQpID0+ICFmZWVkLmlzTG9jYWwoKSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzaWRlYmFyID0gWy4uLmZlZWRzXTtcbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBwcmltYXJ5IGZlZWQgZnJvbSB0aGUgYXJyYXlcbiAgICAgICAgaWYgKHByaW1hcnkpIHNpZGViYXIuc3BsaWNlKHNpZGViYXIuaW5kZXhPZihwcmltYXJ5KSwgMSk7XG4gICAgICAgIHNpZGViYXIuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgaWYgKGEuaXNMb2NhbCgpICYmICFiLmlzTG9jYWwoKSkgcmV0dXJuIC0xO1xuICAgICAgICAgICAgaWYgKCFhLmlzTG9jYWwoKSAmJiBiLmlzTG9jYWwoKSkgcmV0dXJuIDE7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHsgcHJpbWFyeSwgc2lkZWJhciB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgb25NYXhpbWl6ZUNsaWNrID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAndmlkZW9fZnVsbHNjcmVlbicsXG4gICAgICAgICAgICBmdWxsc2NyZWVuOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbk1pY011dGVDbGljayA9IGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgICAgY29uc3QgbmV3VmFsID0gIXRoaXMuc3RhdGUubWljTXV0ZWQ7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBtaWNNdXRlZDogYXdhaXQgdGhpcy5wcm9wcy5jYWxsLnNldE1pY3JvcGhvbmVNdXRlZChuZXdWYWwpIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVmlkTXV0ZUNsaWNrID0gYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICBjb25zdCBuZXdWYWwgPSAhdGhpcy5zdGF0ZS52aWRNdXRlZDtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHZpZE11dGVkOiBhd2FpdCB0aGlzLnByb3BzLmNhbGwuc2V0TG9jYWxWaWRlb011dGVkKG5ld1ZhbCkgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25TY3JlZW5zaGFyZUNsaWNrID0gYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgICBsZXQgaXNTY3JlZW5zaGFyaW5nO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5zY3JlZW5zaGFyaW5nKSB7XG4gICAgICAgICAgICBpc1NjcmVlbnNoYXJpbmcgPSBhd2FpdCB0aGlzLnByb3BzLmNhbGwuc2V0U2NyZWVuc2hhcmluZ0VuYWJsZWQoZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKFBsYXRmb3JtUGVnLmdldCgpLnN1cHBvcnRzRGVza3RvcENhcHR1cmVyKCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IGZpbmlzaGVkIH0gPSBNb2RhbC5jcmVhdGVEaWFsb2coRGVza3RvcENhcHR1cmVyU291cmNlUGlja2VyKTtcbiAgICAgICAgICAgICAgICBjb25zdCBbc291cmNlXSA9IGF3YWl0IGZpbmlzaGVkO1xuICAgICAgICAgICAgICAgIGlmICghc291cmNlKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICBpc1NjcmVlbnNoYXJpbmcgPSBhd2FpdCB0aGlzLnByb3BzLmNhbGwuc2V0U2NyZWVuc2hhcmluZ0VuYWJsZWQodHJ1ZSwgc291cmNlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaXNTY3JlZW5zaGFyaW5nID0gYXdhaXQgdGhpcy5wcm9wcy5jYWxsLnNldFNjcmVlbnNoYXJpbmdFbmFibGVkKHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzaWRlYmFyU2hvd246IHRydWUsXG4gICAgICAgICAgICBzY3JlZW5zaGFyaW5nOiBpc1NjcmVlbnNoYXJpbmcsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyB3ZSByZWdpc3RlciBnbG9iYWwgc2hvcnRjdXRzIGhlcmUsIHRoZXkgKm11c3Qgbm90IGNvbmZsaWN0KiB3aXRoIGxvY2FsIHNob3J0Y3V0cyBlbHNld2hlcmUgb3IgYm90aCB3aWxsIGZpcmVcbiAgICAvLyBOb3RlIHRoYXQgdGhpcyBhc3N1bWVzIHdlIGFsd2F5cyBoYXZlIGEgTGVnYWN5Q2FsbFZpZXcgb24gc2NyZWVuIGF0IGFueSBnaXZlbiB0aW1lXG4gICAgLy8gTGVnYWN5Q2FsbEhhbmRsZXIgd291bGQgcHJvYmFibHkgYmUgYSBiZXR0ZXIgcGxhY2UgZm9yIHRoaXNcbiAgICBwcml2YXRlIG9uTmF0aXZlS2V5RG93biA9IChldik6IHZvaWQgPT4ge1xuICAgICAgICBsZXQgaGFuZGxlZCA9IGZhbHNlO1xuXG4gICAgICAgIGNvbnN0IGNhbGxBY3Rpb24gPSBnZXRLZXlCaW5kaW5nc01hbmFnZXIoKS5nZXRDYWxsQWN0aW9uKGV2KTtcbiAgICAgICAgc3dpdGNoIChjYWxsQWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uVG9nZ2xlTWljSW5DYWxsOlxuICAgICAgICAgICAgICAgIHRoaXMub25NaWNNdXRlQ2xpY2soKTtcbiAgICAgICAgICAgICAgICAvLyBzaG93IHRoZSBjb250cm9scyB0byBnaXZlIGZlZWRiYWNrXG4gICAgICAgICAgICAgICAgdGhpcy5idXR0b25zUmVmLmN1cnJlbnQ/LnNob3dDb250cm9scygpO1xuICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIEtleUJpbmRpbmdBY3Rpb24uVG9nZ2xlV2ViY2FtSW5DYWxsOlxuICAgICAgICAgICAgICAgIHRoaXMub25WaWRNdXRlQ2xpY2soKTtcbiAgICAgICAgICAgICAgICAvLyBzaG93IHRoZSBjb250cm9scyB0byBnaXZlIGZlZWRiYWNrXG4gICAgICAgICAgICAgICAgdGhpcy5idXR0b25zUmVmLmN1cnJlbnQ/LnNob3dDb250cm9scygpO1xuICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGhhbmRsZWQpIHtcbiAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ2FsbFJlc3VtZUNsaWNrID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBjb25zdCB1c2VyRmFjaW5nUm9vbUlkID0gTGVnYWN5Q2FsbEhhbmRsZXIuaW5zdGFuY2Uucm9vbUlkRm9yQ2FsbCh0aGlzLnByb3BzLmNhbGwpO1xuICAgICAgICBMZWdhY3lDYWxsSGFuZGxlci5pbnN0YW5jZS5zZXRBY3RpdmVDYWxsUm9vbUlkKHVzZXJGYWNpbmdSb29tSWQpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVHJhbnNmZXJDbGljayA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgY29uc3QgdHJhbnNmZXJlZUNhbGwgPSBMZWdhY3lDYWxsSGFuZGxlci5pbnN0YW5jZS5nZXRUcmFuc2ZlcmVlRm9yQ2FsbElkKHRoaXMucHJvcHMuY2FsbC5jYWxsSWQpO1xuICAgICAgICB0aGlzLnByb3BzLmNhbGwudHJhbnNmZXJUb0NhbGwodHJhbnNmZXJlZUNhbGwpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uSGFuZ3VwQ2xpY2sgPSAoKTogdm9pZCA9PiB7XG4gICAgICAgIExlZ2FjeUNhbGxIYW5kbGVyLmluc3RhbmNlLmhhbmd1cE9yUmVqZWN0KExlZ2FjeUNhbGxIYW5kbGVyLmluc3RhbmNlLnJvb21JZEZvckNhbGwodGhpcy5wcm9wcy5jYWxsKSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Ub2dnbGVTaWRlYmFyID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2lkZWJhclNob3duOiAhdGhpcy5zdGF0ZS5zaWRlYmFyU2hvd24gfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgcmVuZGVyQ2FsbENvbnRyb2xzKCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgY29uc3QgeyBjYWxsLCBwaXBNb2RlIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICBjb25zdCB7IGNhbGxTdGF0ZSwgbWljTXV0ZWQsIHZpZE11dGVkLCBzY3JlZW5zaGFyaW5nLCBzaWRlYmFyU2hvd24sIHNlY29uZGFyeUZlZWQsIHNpZGViYXJGZWVkcyB9ID0gdGhpcy5zdGF0ZTtcblxuICAgICAgICAvLyBJZiBTRFBTdHJlYW1NZXRhZGF0YSBpc24ndCBzdXBwb3J0ZWQgZG9uJ3Qgc2hvdyB2aWRlbyBtdXRlIGJ1dHRvbiBpbiB2b2ljZSBjYWxsc1xuICAgICAgICBjb25zdCB2aWRNdXRlQnV0dG9uU2hvd24gPSBjYWxsLm9wcG9uZW50U3VwcG9ydHNTRFBTdHJlYW1NZXRhZGF0YSgpIHx8IGNhbGwuaGFzTG9jYWxVc2VyTWVkaWFWaWRlb1RyYWNrO1xuICAgICAgICAvLyBTY3JlZW5zaGFyaW5nIGlzIHBvc3NpYmxlLCBpZiB3ZSBjYW4gc2VuZCBhIHNlY29uZCBzdHJlYW0gYW5kXG4gICAgICAgIC8vIGlkZW50aWZ5IGl0IHVzaW5nIFNEUFN0cmVhbU1ldGFkYXRhIG9yIGlmIHdlIGNhbiByZXBsYWNlIHRoZSBhbHJlYWR5XG4gICAgICAgIC8vIGV4aXN0aW5nIHVzZXJtZWRpYSB0cmFjayBieSBhIHNjcmVlbnNoYXJpbmcgdHJhY2suIFdlIGFsc28gbmVlZCB0byBiZVxuICAgICAgICAvLyBjb25uZWN0ZWQgdG8ga25vdyB0aGUgc3RhdGUgb2YgdGhlIG90aGVyIHNpZGVcbiAgICAgICAgY29uc3Qgc2NyZWVuc2hhcmluZ0J1dHRvblNob3duID0gKFxuICAgICAgICAgICAgKGNhbGwub3Bwb25lbnRTdXBwb3J0c1NEUFN0cmVhbU1ldGFkYXRhKCkgfHwgY2FsbC5oYXNMb2NhbFVzZXJNZWRpYVZpZGVvVHJhY2spICYmXG4gICAgICAgICAgICBjYWxsLnN0YXRlID09PSBDYWxsU3RhdGUuQ29ubmVjdGVkXG4gICAgICAgICk7XG4gICAgICAgIC8vIFNob3cgdGhlIHNpZGViYXIgYnV0dG9uIG9ubHkgaWYgdGhlcmUgaXMgc29tZXRoaW5nIHRvIGhpZGUvc2hvd1xuICAgICAgICBjb25zdCBzaWRlYmFyQnV0dG9uU2hvd24gPSAoc2Vjb25kYXJ5RmVlZCAmJiAhc2Vjb25kYXJ5RmVlZC5pc1ZpZGVvTXV0ZWQoKSkgfHwgc2lkZWJhckZlZWRzLmxlbmd0aCA+IDA7XG4gICAgICAgIC8vIFRoZSBkaWFsIHBhZCAmICdtb3JlJyBidXR0b24gYWN0aW9ucyBhcmUgb25seSByZWxldmFudCBpbiBhIGNvbm5lY3RlZCBjYWxsXG4gICAgICAgIGNvbnN0IGNvbnRleHRNZW51QnV0dG9uU2hvd24gPSBjYWxsU3RhdGUgPT09IENhbGxTdGF0ZS5Db25uZWN0ZWQ7XG4gICAgICAgIGNvbnN0IGRpYWxwYWRCdXR0b25TaG93biA9IChcbiAgICAgICAgICAgIGNhbGxTdGF0ZSA9PT0gQ2FsbFN0YXRlLkNvbm5lY3RlZCAmJlxuICAgICAgICAgICAgY2FsbC5vcHBvbmVudFN1cHBvcnRzRFRNRigpXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxMZWdhY3lDYWxsVmlld0J1dHRvbnNcbiAgICAgICAgICAgICAgICByZWY9e3RoaXMuYnV0dG9uc1JlZn1cbiAgICAgICAgICAgICAgICBjYWxsPXtjYWxsfVxuICAgICAgICAgICAgICAgIHBpcE1vZGU9e3BpcE1vZGV9XG4gICAgICAgICAgICAgICAgaGFuZGxlcnM9e3tcbiAgICAgICAgICAgICAgICAgICAgb25Ub2dnbGVTaWRlYmFyQ2xpY2s6IHRoaXMub25Ub2dnbGVTaWRlYmFyLFxuICAgICAgICAgICAgICAgICAgICBvblNjcmVlbnNoYXJlQ2xpY2s6IHRoaXMub25TY3JlZW5zaGFyZUNsaWNrLFxuICAgICAgICAgICAgICAgICAgICBvbkhhbmd1cENsaWNrOiB0aGlzLm9uSGFuZ3VwQ2xpY2ssXG4gICAgICAgICAgICAgICAgICAgIG9uTWljTXV0ZUNsaWNrOiB0aGlzLm9uTWljTXV0ZUNsaWNrLFxuICAgICAgICAgICAgICAgICAgICBvblZpZE11dGVDbGljazogdGhpcy5vblZpZE11dGVDbGljayxcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIGJ1dHRvbnNTdGF0ZT17e1xuICAgICAgICAgICAgICAgICAgICBtaWNNdXRlZDogbWljTXV0ZWQsXG4gICAgICAgICAgICAgICAgICAgIHZpZE11dGVkOiB2aWRNdXRlZCxcbiAgICAgICAgICAgICAgICAgICAgc2lkZWJhclNob3duOiBzaWRlYmFyU2hvd24sXG4gICAgICAgICAgICAgICAgICAgIHNjcmVlbnNoYXJpbmc6IHNjcmVlbnNoYXJpbmcsXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBidXR0b25zVmlzaWJpbGl0eT17e1xuICAgICAgICAgICAgICAgICAgICB2aWRNdXRlOiB2aWRNdXRlQnV0dG9uU2hvd24sXG4gICAgICAgICAgICAgICAgICAgIHNjcmVlbnNoYXJpbmc6IHNjcmVlbnNoYXJpbmdCdXR0b25TaG93bixcbiAgICAgICAgICAgICAgICAgICAgc2lkZWJhcjogc2lkZWJhckJ1dHRvblNob3duLFxuICAgICAgICAgICAgICAgICAgICBjb250ZXh0TWVudTogY29udGV4dE1lbnVCdXR0b25TaG93bixcbiAgICAgICAgICAgICAgICAgICAgZGlhbHBhZDogZGlhbHBhZEJ1dHRvblNob3duLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAvPlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyVG9hc3QoKTogSlNYLkVsZW1lbnQge1xuICAgICAgICBjb25zdCB7IGNhbGwgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGNvbnN0IHNvbWVvbmVJc1NjcmVlbnNoYXJpbmcgPSBjYWxsLmdldEZlZWRzKCkuc29tZSgoZmVlZCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGZlZWQucHVycG9zZSA9PT0gU0RQU3RyZWFtTWV0YWRhdGFQdXJwb3NlLlNjcmVlbnNoYXJlO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIXNvbWVvbmVJc1NjcmVlbnNoYXJpbmcpIHJldHVybiBudWxsO1xuXG4gICAgICAgIGNvbnN0IGlzU2NyZWVuc2hhcmluZyA9IGNhbGwuaXNTY3JlZW5zaGFyaW5nKCk7XG4gICAgICAgIGNvbnN0IHsgcHJpbWFyeUZlZWQsIHNpZGViYXJTaG93biB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgY29uc3Qgc2hhcmVyTmFtZSA9IHByaW1hcnlGZWVkPy5nZXRNZW1iZXIoKS5uYW1lO1xuICAgICAgICBpZiAoIXNoYXJlck5hbWUpIHJldHVybjtcblxuICAgICAgICBsZXQgdGV4dCA9IGlzU2NyZWVuc2hhcmluZ1xuICAgICAgICAgICAgPyBfdChcIllvdSBhcmUgcHJlc2VudGluZ1wiKVxuICAgICAgICAgICAgOiBfdCgnJShzaGFyZXJOYW1lKXMgaXMgcHJlc2VudGluZycsIHsgc2hhcmVyTmFtZSB9KTtcbiAgICAgICAgaWYgKCFzaWRlYmFyU2hvd24pIHtcbiAgICAgICAgICAgIHRleHQgKz0gXCIg4oCiIFwiICsgKGNhbGwuaXNMb2NhbFZpZGVvTXV0ZWQoKVxuICAgICAgICAgICAgICAgID8gX3QoXCJZb3VyIGNhbWVyYSBpcyB0dXJuZWQgb2ZmXCIpXG4gICAgICAgICAgICAgICAgOiBfdChcIllvdXIgY2FtZXJhIGlzIHN0aWxsIGVuYWJsZWRcIikpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTGVnYWN5Q2FsbFZpZXdfdG9hc3RcIj5cbiAgICAgICAgICAgICAgICB7IHRleHQgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJDb250ZW50KCk6IEpTWC5FbGVtZW50IHtcbiAgICAgICAgY29uc3QgeyBwaXBNb2RlLCBjYWxsLCBvblJlc2l6ZSB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgY29uc3QgeyBpc0xvY2FsT25Ib2xkLCBpc1JlbW90ZU9uSG9sZCwgc2lkZWJhclNob3duLCBwcmltYXJ5RmVlZCwgc2Vjb25kYXJ5RmVlZCwgc2lkZWJhckZlZWRzIH0gPSB0aGlzLnN0YXRlO1xuXG4gICAgICAgIGNvbnN0IGNhbGxSb29tID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20oY2FsbC5yb29tSWQpO1xuICAgICAgICBjb25zdCBhdmF0YXJTaXplID0gcGlwTW9kZSA/IDc2IDogMTYwO1xuICAgICAgICBjb25zdCB0cmFuc2ZlcmVlQ2FsbCA9IExlZ2FjeUNhbGxIYW5kbGVyLmluc3RhbmNlLmdldFRyYW5zZmVyZWVGb3JDYWxsSWQoY2FsbC5jYWxsSWQpO1xuICAgICAgICBjb25zdCBpc09uSG9sZCA9IGlzTG9jYWxPbkhvbGQgfHwgaXNSZW1vdGVPbkhvbGQ7XG5cbiAgICAgICAgbGV0IHNlY29uZGFyeUZlZWRFbGVtZW50OiBSZWFjdC5SZWFjdE5vZGU7XG4gICAgICAgIGlmIChzaWRlYmFyU2hvd24gJiYgc2Vjb25kYXJ5RmVlZCAmJiAhc2Vjb25kYXJ5RmVlZC5pc1ZpZGVvTXV0ZWQoKSkge1xuICAgICAgICAgICAgc2Vjb25kYXJ5RmVlZEVsZW1lbnQgPSAoXG4gICAgICAgICAgICAgICAgPFZpZGVvRmVlZFxuICAgICAgICAgICAgICAgICAgICBmZWVkPXtzZWNvbmRhcnlGZWVkfVxuICAgICAgICAgICAgICAgICAgICBjYWxsPXtjYWxsfVxuICAgICAgICAgICAgICAgICAgICBwaXBNb2RlPXtwaXBNb2RlfVxuICAgICAgICAgICAgICAgICAgICBvblJlc2l6ZT17b25SZXNpemV9XG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeT17dHJ1ZX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0cmFuc2ZlcmVlQ2FsbCB8fCBpc09uSG9sZCkge1xuICAgICAgICAgICAgY29uc3QgY29udGFpbmVyQ2xhc3NlcyA9IGNsYXNzTmFtZXMoXCJteF9MZWdhY3lDYWxsVmlld19jb250ZW50XCIsIHtcbiAgICAgICAgICAgICAgICBteF9MZWdhY3lDYWxsVmlld19jb250ZW50X2hvbGQ6IGlzT25Ib2xkLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCBiYWNrZ3JvdW5kQXZhdGFyVXJsID0gYXZhdGFyVXJsRm9yTWVtYmVyKGNhbGwuZ2V0T3Bwb25lbnRNZW1iZXIoKSwgMTAyNCwgMTAyNCwgJ2Nyb3AnKTtcblxuICAgICAgICAgICAgbGV0IGhvbGRUcmFuc2ZlckNvbnRlbnQ6IFJlYWN0LlJlYWN0Tm9kZTtcbiAgICAgICAgICAgIGlmICh0cmFuc2ZlcmVlQ2FsbCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zZmVyVGFyZ2V0Um9vbSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKFxuICAgICAgICAgICAgICAgICAgICBMZWdhY3lDYWxsSGFuZGxlci5pbnN0YW5jZS5yb29tSWRGb3JDYWxsKGNhbGwpLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgY29uc3QgdHJhbnNmZXJUYXJnZXROYW1lID0gdHJhbnNmZXJUYXJnZXRSb29tID8gdHJhbnNmZXJUYXJnZXRSb29tLm5hbWUgOiBfdChcInVua25vd24gcGVyc29uXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zZmVyZWVSb29tID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20oXG4gICAgICAgICAgICAgICAgICAgIExlZ2FjeUNhbGxIYW5kbGVyLmluc3RhbmNlLnJvb21JZEZvckNhbGwodHJhbnNmZXJlZUNhbGwpLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgY29uc3QgdHJhbnNmZXJlZU5hbWUgPSB0cmFuc2ZlcmVlUm9vbSA/IHRyYW5zZmVyZWVSb29tLm5hbWUgOiBfdChcInVua25vd24gcGVyc29uXCIpO1xuXG4gICAgICAgICAgICAgICAgaG9sZFRyYW5zZmVyQ29udGVudCA9IDxkaXYgY2xhc3NOYW1lPVwibXhfTGVnYWN5Q2FsbFZpZXdfc3RhdHVzXCI+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBcIkNvbnN1bHRpbmcgd2l0aCAlKHRyYW5zZmVyVGFyZ2V0KXMuIDxhPlRyYW5zZmVyIHRvICUodHJhbnNmZXJlZSlzPC9hPlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZmVyVGFyZ2V0OiB0cmFuc2ZlclRhcmdldE5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmZXJlZTogdHJhbnNmZXJlZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGE6IHN1YiA9PiA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwibGlua19pbmxpbmVcIiBvbkNsaWNrPXt0aGlzLm9uVHJhbnNmZXJDbGlja30+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3ViIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsZXQgb25Ib2xkVGV4dDogUmVhY3QuUmVhY3ROb2RlO1xuICAgICAgICAgICAgICAgIGlmIChpc1JlbW90ZU9uSG9sZCkge1xuICAgICAgICAgICAgICAgICAgICBvbkhvbGRUZXh0ID0gX3QoXG4gICAgICAgICAgICAgICAgICAgICAgICBMZWdhY3lDYWxsSGFuZGxlci5pbnN0YW5jZS5oYXNBbnlVbmhlbGRDYWxsKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IF90ZChcIllvdSBoZWxkIHRoZSBjYWxsIDxhPlN3aXRjaDwvYT5cIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IF90ZChcIllvdSBoZWxkIHRoZSBjYWxsIDxhPlJlc3VtZTwvYT5cIiksXG4gICAgICAgICAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhOiBzdWIgPT4gPEFjY2Vzc2libGVCdXR0b24ga2luZD1cImxpbmtfaW5saW5lXCIgb25DbGljaz17dGhpcy5vbkNhbGxSZXN1bWVDbGlja30+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgc3ViIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlzTG9jYWxPbkhvbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgb25Ib2xkVGV4dCA9IF90KFwiJShwZWVyTmFtZSlzIGhlbGQgdGhlIGNhbGxcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGVlck5hbWU6IGNhbGwuZ2V0T3Bwb25lbnRNZW1iZXIoKS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBob2xkVHJhbnNmZXJDb250ZW50ID0gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0xlZ2FjeUNhbGxWaWV3X3N0YXR1c1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBvbkhvbGRUZXh0IH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y29udGFpbmVyQ2xhc3Nlc30gb25Nb3VzZU1vdmU9e3RoaXMub25Nb3VzZU1vdmV9PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0xlZ2FjeUNhbGxWaWV3X2hvbGRCYWNrZ3JvdW5kXCIgc3R5bGU9e3sgYmFja2dyb3VuZEltYWdlOiAndXJsKCcgKyBiYWNrZ3JvdW5kQXZhdGFyVXJsICsgJyknIH19IC8+XG4gICAgICAgICAgICAgICAgICAgIHsgaG9sZFRyYW5zZmVyQ29udGVudCB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKGNhbGwubm9JbmNvbWluZ0ZlZWRzKCkpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9MZWdhY3lDYWxsVmlld19jb250ZW50XCIgb25Nb3VzZU1vdmU9e3RoaXMub25Nb3VzZU1vdmV9PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0xlZ2FjeUNhbGxWaWV3X2F2YXRhcnNDb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9MZWdhY3lDYWxsVmlld19hdmF0YXJDb250YWluZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IHdpZHRoOiBhdmF0YXJTaXplLCBoZWlnaHQ6IGF2YXRhclNpemUgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Um9vbUF2YXRhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb29tPXtjYWxsUm9vbX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0PXthdmF0YXJTaXplfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aD17YXZhdGFyU2l6ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0xlZ2FjeUNhbGxWaWV3X3N0YXR1c1wiPnsgX3QoXCJDb25uZWN0aW5nXCIpIH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgeyBzZWNvbmRhcnlGZWVkRWxlbWVudCB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHBpcE1vZGUpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9MZWdhY3lDYWxsVmlld19jb250ZW50XCJcbiAgICAgICAgICAgICAgICAgICAgb25Nb3VzZU1vdmU9e3RoaXMub25Nb3VzZU1vdmV9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8VmlkZW9GZWVkXG4gICAgICAgICAgICAgICAgICAgICAgICBmZWVkPXtwcmltYXJ5RmVlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGw9e2NhbGx9XG4gICAgICAgICAgICAgICAgICAgICAgICBwaXBNb2RlPXtwaXBNb2RlfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25SZXNpemU9e29uUmVzaXplfVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeT17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAoc2Vjb25kYXJ5RmVlZCkge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0xlZ2FjeUNhbGxWaWV3X2NvbnRlbnRcIiBvbk1vdXNlTW92ZT17dGhpcy5vbk1vdXNlTW92ZX0+XG4gICAgICAgICAgICAgICAgICAgIDxWaWRlb0ZlZWRcbiAgICAgICAgICAgICAgICAgICAgICAgIGZlZWQ9e3ByaW1hcnlGZWVkfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbD17Y2FsbH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHBpcE1vZGU9e3BpcE1vZGV9XG4gICAgICAgICAgICAgICAgICAgICAgICBvblJlc2l6ZT17b25SZXNpemV9XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5PXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICB7IHNlY29uZGFyeUZlZWRFbGVtZW50IH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTGVnYWN5Q2FsbFZpZXdfY29udGVudFwiIG9uTW91c2VNb3ZlPXt0aGlzLm9uTW91c2VNb3ZlfT5cbiAgICAgICAgICAgICAgICAgICAgPFZpZGVvRmVlZFxuICAgICAgICAgICAgICAgICAgICAgICAgZmVlZD17cHJpbWFyeUZlZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsPXtjYWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgcGlwTW9kZT17cGlwTW9kZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uUmVzaXplPXtvblJlc2l6ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnk9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIHsgc2lkZWJhclNob3duICYmIDxMZWdhY3lDYWxsVmlld1NpZGViYXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZlZWRzPXtzaWRlYmFyRmVlZHN9XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsPXtjYWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgcGlwTW9kZT17cGlwTW9kZX1cbiAgICAgICAgICAgICAgICAgICAgLz4gfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIoKTogSlNYLkVsZW1lbnQge1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICBjYWxsLFxuICAgICAgICAgICAgc2Vjb25kYXJ5Q2FsbCxcbiAgICAgICAgICAgIHBpcE1vZGUsXG4gICAgICAgICAgICBzaG93QXBwcyxcbiAgICAgICAgICAgIG9uTW91c2VEb3duT25IZWFkZXIsXG4gICAgICAgIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICBzaWRlYmFyU2hvd24sXG4gICAgICAgICAgICBzaWRlYmFyRmVlZHMsXG4gICAgICAgIH0gPSB0aGlzLnN0YXRlO1xuXG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3QgY2FsbFJvb21JZCA9IExlZ2FjeUNhbGxIYW5kbGVyLmluc3RhbmNlLnJvb21JZEZvckNhbGwoY2FsbCk7XG4gICAgICAgIGNvbnN0IHNlY29uZGFyeUNhbGxSb29tSWQgPSBMZWdhY3lDYWxsSGFuZGxlci5pbnN0YW5jZS5yb29tSWRGb3JDYWxsKHNlY29uZGFyeUNhbGwpO1xuICAgICAgICBjb25zdCBjYWxsUm9vbSA9IGNsaWVudC5nZXRSb29tKGNhbGxSb29tSWQpO1xuICAgICAgICBjb25zdCBzZWNDYWxsUm9vbSA9IHNlY29uZGFyeUNhbGwgPyBjbGllbnQuZ2V0Um9vbShzZWNvbmRhcnlDYWxsUm9vbUlkKSA6IG51bGw7XG5cbiAgICAgICAgY29uc3QgY2FsbFZpZXdDbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICBteF9MZWdhY3lDYWxsVmlldzogdHJ1ZSxcbiAgICAgICAgICAgIG14X0xlZ2FjeUNhbGxWaWV3X3BpcDogcGlwTW9kZSxcbiAgICAgICAgICAgIG14X0xlZ2FjeUNhbGxWaWV3X2xhcmdlOiAhcGlwTW9kZSxcbiAgICAgICAgICAgIG14X0xlZ2FjeUNhbGxWaWV3X3NpZGViYXI6IHNpZGViYXJTaG93biAmJiBzaWRlYmFyRmVlZHMubGVuZ3RoICE9PSAwICYmICFwaXBNb2RlLFxuICAgICAgICAgICAgbXhfTGVnYWN5Q2FsbFZpZXdfYmVsb3dXaWRnZXQ6IHNob3dBcHBzLCAvLyBjc3MgdG8gY29ycmVjdCB0aGUgbWFyZ2lucyBpZiB0aGUgY2FsbCBpcyBiZWxvdyB0aGUgQXBwc0RyYXdlci5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPXtjYWxsVmlld0NsYXNzZXN9PlxuICAgICAgICAgICAgPExlZ2FjeUNhbGxWaWV3SGVhZGVyXG4gICAgICAgICAgICAgICAgb25QaXBNb3VzZURvd249e29uTW91c2VEb3duT25IZWFkZXJ9XG4gICAgICAgICAgICAgICAgcGlwTW9kZT17cGlwTW9kZX1cbiAgICAgICAgICAgICAgICBjYWxsUm9vbXM9e1tjYWxsUm9vbSwgc2VjQ2FsbFJvb21dfVxuICAgICAgICAgICAgICAgIG9uTWF4aW1pemU9e3RoaXMub25NYXhpbWl6ZUNsaWNrfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTGVnYWN5Q2FsbFZpZXdfY29udGVudF93cmFwcGVyXCIgcmVmPXt0aGlzLmNvbnRlbnRXcmFwcGVyUmVmfT5cbiAgICAgICAgICAgICAgICB7IHRoaXMucmVuZGVyVG9hc3QoKSB9XG4gICAgICAgICAgICAgICAgeyB0aGlzLnJlbmRlckNvbnRlbnQoKSB9XG4gICAgICAgICAgICAgICAgeyB0aGlzLnJlbmRlckNhbGxDb250cm9scygpIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxufVxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWtCQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7Ozs7O0FBeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUE4REEsU0FBU0Esb0JBQVQsR0FBZ0M7RUFDNUIsT0FDSUMsUUFBUSxDQUFDQyxpQkFB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