"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _lodash = require("lodash");

var _matrix = require("matrix-js-sdk/src/matrix");

var _call = require("matrix-js-sdk/src/webrtc/call");

var _languageHandler = require("../../../languageHandler");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _actions = require("../../../dispatcher/actions");

var _UserTab = require("../dialogs/UserTab");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _RoomHeaderButtons = _interopRequireDefault(require("../right_panel/RoomHeaderButtons"));

var _E2EIcon = _interopRequireDefault(require("./E2EIcon"));

var _DecoratedRoomAvatar = _interopRequireDefault(require("../avatars/DecoratedRoomAvatar"));

var _AccessibleTooltipButton = _interopRequireDefault(require("../elements/AccessibleTooltipButton"));

var _RoomTopic = _interopRequireDefault(require("../elements/RoomTopic"));

var _RoomName = _interopRequireDefault(require("../elements/RoomName"));

var _ContextMenu = require("../../structures/ContextMenu");

var _RoomContextMenu = _interopRequireDefault(require("../context_menus/RoomContextMenu"));

var _RoomTile = require("./RoomTile");

var _RoomNotificationStateStore = require("../../../stores/notifications/RoomNotificationStateStore");

var _NotificationState = require("../../../stores/notifications/NotificationState");

var _RoomContext = _interopRequireDefault(require("../../../contexts/RoomContext"));

var _RoomLiveShareWarning = _interopRequireDefault(require("../beacon/RoomLiveShareWarning"));

var _BetaCard = require("../beta/BetaCard");

var _RightPanelStore = _interopRequireDefault(require("../../../stores/right-panel/RightPanelStore"));

var _AsyncStore = require("../../../stores/AsyncStore");

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2019, 2021 The Matrix.org Foundation C.I.C.

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
class RoomHeader extends _react.default.Component {
  constructor(props, context) {
    super(props, context);
    (0, _defineProperty2.default)(this, "context", void 0);
    (0, _defineProperty2.default)(this, "onRightPanelStoreUpdate", () => {
      this.setState({
        rightPanelOpen: _RightPanelStore.default.instance.isOpen
      });
    });
    (0, _defineProperty2.default)(this, "onRoomStateEvents", event => {
      if (!this.props.room || event.getRoomId() !== this.props.room.roomId) {
        return;
      } // redisplay the room name, topic, etc.


      this.rateLimitedUpdate();
    });
    (0, _defineProperty2.default)(this, "onNotificationUpdate", () => {
      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "rateLimitedUpdate", (0, _lodash.throttle)(() => {
      this.forceUpdate();
    }, 500, {
      leading: true,
      trailing: true
    }));
    (0, _defineProperty2.default)(this, "onContextMenuOpenClick", ev => {
      ev.preventDefault();
      ev.stopPropagation();
      const target = ev.target;
      this.setState({
        contextMenuPosition: target.getBoundingClientRect()
      });
    });
    (0, _defineProperty2.default)(this, "onContextMenuCloseClick", () => {
      this.setState({
        contextMenuPosition: null
      });
    });

    const notiStore = _RoomNotificationStateStore.RoomNotificationStateStore.instance.getRoomState(props.room);

    notiStore.on(_NotificationState.NotificationStateEvents.Update, this.onNotificationUpdate);
    this.state = {
      rightPanelOpen: _RightPanelStore.default.instance.isOpen
    };
  }

  componentDidMount() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    cli.on(_matrix.RoomStateEvent.Events, this.onRoomStateEvents);

    _RightPanelStore.default.instance.on(_AsyncStore.UPDATE_EVENT, this.onRightPanelStoreUpdate);
  }

  componentWillUnmount() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    cli?.removeListener(_matrix.RoomStateEvent.Events, this.onRoomStateEvents);

    const notiStore = _RoomNotificationStateStore.RoomNotificationStateStore.instance.getRoomState(this.props.room);

    notiStore.removeListener(_NotificationState.NotificationStateEvents.Update, this.onNotificationUpdate);

    _RightPanelStore.default.instance.off(_AsyncStore.UPDATE_EVENT, this.onRightPanelStoreUpdate);
  }

  renderButtons() {
    const buttons = [];

    if (this.props.inRoom && this.props.onCallPlaced && !this.context.tombstone && _SettingsStore.default.getValue("showCallButtonsInComposer")) {
      const voiceCallButton = /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
        className: "mx_RoomHeader_button mx_RoomHeader_voiceCallButton",
        onClick: () => this.props.onCallPlaced(_call.CallType.Voice),
        title: (0, _languageHandler._t)("Voice call"),
        key: "voice"
      });

      const videoCallButton = /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
        className: "mx_RoomHeader_button mx_RoomHeader_videoCallButton",
        onClick: () => this.props.onCallPlaced(_call.CallType.Video),
        title: (0, _languageHandler._t)("Video call"),
        key: "video"
      });

      buttons.push(voiceCallButton, videoCallButton);
    }

    if (this.props.onForgetClick) {
      const forgetButton = /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
        className: "mx_RoomHeader_button mx_RoomHeader_forgetButton",
        onClick: this.props.onForgetClick,
        title: (0, _languageHandler._t)("Forget room"),
        key: "forget"
      });

      buttons.push(forgetButton);
    }

    if (this.props.onAppsClick) {
      const appsButton = /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
        className: (0, _classnames.default)("mx_RoomHeader_button mx_RoomHeader_appsButton", {
          mx_RoomHeader_appsButton_highlight: this.props.appsShown
        }),
        onClick: this.props.onAppsClick,
        title: this.props.appsShown ? (0, _languageHandler._t)("Hide Widgets") : (0, _languageHandler._t)("Show Widgets"),
        key: "apps"
      });

      buttons.push(appsButton);
    }

    if (this.props.onSearchClick && this.props.inRoom) {
      const searchButton = /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
        className: "mx_RoomHeader_button mx_RoomHeader_searchButton",
        onClick: this.props.onSearchClick,
        title: (0, _languageHandler._t)("Search"),
        key: "search"
      });

      buttons.push(searchButton);
    }

    if (this.props.onInviteClick && this.props.inRoom) {
      const inviteButton = /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
        className: "mx_RoomHeader_button mx_RoomHeader_inviteButton",
        onClick: this.props.onInviteClick,
        title: (0, _languageHandler._t)("Invite"),
        key: "invite"
      });

      buttons.push(inviteButton);
    }

    return buttons;
  }

  renderName(oobName) {
    let contextMenu;

    if (this.state.contextMenuPosition && this.props.room) {
      contextMenu = /*#__PURE__*/_react.default.createElement(_RoomContextMenu.default, (0, _extends2.default)({}, (0, _RoomTile.contextMenuBelow)(this.state.contextMenuPosition), {
        room: this.props.room,
        onFinished: this.onContextMenuCloseClick
      }));
    } // XXX: this is a bit inefficient - we could just compare room.name for 'Empty room'...


    let settingsHint = false;
    const members = this.props.room ? this.props.room.getJoinedMembers() : undefined;

    if (members) {
      if (members.length === 1 && members[0].userId === _MatrixClientPeg.MatrixClientPeg.get().credentials.userId) {
        const nameEvent = this.props.room.currentState.getStateEvents('m.room.name', '');

        if (!nameEvent || !nameEvent.getContent().name) {
          settingsHint = true;
        }
      }
    }

    const textClasses = (0, _classnames.default)('mx_RoomHeader_nametext', {
      mx_RoomHeader_settingsHint: settingsHint
    });

    const roomName = /*#__PURE__*/_react.default.createElement(_RoomName.default, {
      room: this.props.room
    }, name => {
      const roomName = name || oobName;
      return /*#__PURE__*/_react.default.createElement("div", {
        dir: "auto",
        className: textClasses,
        title: roomName,
        role: "heading",
        "aria-level": 1
      }, roomName);
    });

    if (this.props.enableRoomOptionsMenu) {
      return /*#__PURE__*/_react.default.createElement(_ContextMenu.ContextMenuTooltipButton, {
        className: "mx_RoomHeader_name",
        onClick: this.onContextMenuOpenClick,
        isExpanded: !!this.state.contextMenuPosition,
        title: (0, _languageHandler._t)("Room options")
      }, roomName, this.props.room && /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_RoomHeader_chevron"
      }), contextMenu);
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomHeader_name mx_RoomHeader_name--textonly"
    }, roomName);
  }

  render() {
    let searchStatus = null; // don't display the search count until the search completes and
    // gives us a valid (possibly zero) searchCount.

    if (this.props.searchInfo && this.props.searchInfo.searchCount !== undefined && this.props.searchInfo.searchCount !== null) {
      searchStatus = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_RoomHeader_searchStatus"
      }, "\xA0", (0, _languageHandler._t)("(~%(count)s results)", {
        count: this.props.searchInfo.searchCount
      }));
    }

    let oobName = (0, _languageHandler._t)("Join Room");

    if (this.props.oobData && this.props.oobData.name) {
      oobName = this.props.oobData.name;
    }

    const name = this.renderName(oobName);

    const topicElement = /*#__PURE__*/_react.default.createElement(_RoomTopic.default, {
      room: this.props.room,
      className: "mx_RoomHeader_topic"
    });

    let roomAvatar;

    if (this.props.room) {
      roomAvatar = /*#__PURE__*/_react.default.createElement(_DecoratedRoomAvatar.default, {
        room: this.props.room,
        avatarSize: 24,
        oobData: this.props.oobData,
        viewAvatarOnClick: true
      });
    }

    let buttons;

    if (this.props.showButtons) {
      buttons = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_RoomHeader_buttons"
      }, this.renderButtons()), /*#__PURE__*/_react.default.createElement(_RoomHeaderButtons.default, {
        room: this.props.room,
        excludedRightPanelPhaseButtons: this.props.excludedRightPanelPhaseButtons
      }));
    }

    const e2eIcon = this.props.e2eStatus ? /*#__PURE__*/_react.default.createElement(_E2EIcon.default, {
      status: this.props.e2eStatus
    }) : undefined;
    const isVideoRoom = _SettingsStore.default.getValue("feature_video_rooms") && this.props.room.isElementVideoRoom();

    const viewLabs = () => _dispatcher.default.dispatch({
      action: _actions.Action.ViewUserSettings,
      initialTabId: _UserTab.UserTab.Labs
    });

    const betaPill = isVideoRoom ? /*#__PURE__*/_react.default.createElement(_BetaCard.BetaPill, {
      onClick: viewLabs,
      tooltipTitle: (0, _languageHandler._t)("Video rooms are a beta feature")
    }) : null;
    return /*#__PURE__*/_react.default.createElement("header", {
      className: "mx_RoomHeader light-panel"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomHeader_wrapper",
      "aria-owns": this.state.rightPanelOpen ? "mx_RightPanel" : undefined
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomHeader_avatar"
    }, roomAvatar), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomHeader_e2eIcon"
    }, e2eIcon), name, searchStatus, topicElement, betaPill, buttons), /*#__PURE__*/_react.default.createElement(_RoomLiveShareWarning.default, {
      roomId: this.props.room.roomId
    }));
  }

}

exports.default = RoomHeader;
(0, _defineProperty2.default)(RoomHeader, "defaultProps", {
  editing: false,
  inRoom: false,
  excludedRightPanelPhaseButtons: [],
  showButtons: true,
  enableRoomOptionsMenu: true
});
(0, _defineProperty2.default)(RoomHeader, "contextType", _RoomContext.default);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSb29tSGVhZGVyIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY29udGV4dCIsInNldFN0YXRlIiwicmlnaHRQYW5lbE9wZW4iLCJSaWdodFBhbmVsU3RvcmUiLCJpbnN0YW5jZSIsImlzT3BlbiIsImV2ZW50Iiwicm9vbSIsImdldFJvb21JZCIsInJvb21JZCIsInJhdGVMaW1pdGVkVXBkYXRlIiwiZm9yY2VVcGRhdGUiLCJ0aHJvdHRsZSIsImxlYWRpbmciLCJ0cmFpbGluZyIsImV2IiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJ0YXJnZXQiLCJjb250ZXh0TWVudVBvc2l0aW9uIiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0Iiwibm90aVN0b3JlIiwiUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUiLCJnZXRSb29tU3RhdGUiLCJvbiIsIk5vdGlmaWNhdGlvblN0YXRlRXZlbnRzIiwiVXBkYXRlIiwib25Ob3RpZmljYXRpb25VcGRhdGUiLCJzdGF0ZSIsImNvbXBvbmVudERpZE1vdW50IiwiY2xpIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiUm9vbVN0YXRlRXZlbnQiLCJFdmVudHMiLCJvblJvb21TdGF0ZUV2ZW50cyIsIlVQREFURV9FVkVOVCIsIm9uUmlnaHRQYW5lbFN0b3JlVXBkYXRlIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJyZW1vdmVMaXN0ZW5lciIsIm9mZiIsInJlbmRlckJ1dHRvbnMiLCJidXR0b25zIiwiaW5Sb29tIiwib25DYWxsUGxhY2VkIiwidG9tYnN0b25lIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwidm9pY2VDYWxsQnV0dG9uIiwiQ2FsbFR5cGUiLCJWb2ljZSIsIl90IiwidmlkZW9DYWxsQnV0dG9uIiwiVmlkZW8iLCJwdXNoIiwib25Gb3JnZXRDbGljayIsImZvcmdldEJ1dHRvbiIsIm9uQXBwc0NsaWNrIiwiYXBwc0J1dHRvbiIsImNsYXNzTmFtZXMiLCJteF9Sb29tSGVhZGVyX2FwcHNCdXR0b25faGlnaGxpZ2h0IiwiYXBwc1Nob3duIiwib25TZWFyY2hDbGljayIsInNlYXJjaEJ1dHRvbiIsIm9uSW52aXRlQ2xpY2siLCJpbnZpdGVCdXR0b24iLCJyZW5kZXJOYW1lIiwib29iTmFtZSIsImNvbnRleHRNZW51IiwiY29udGV4dE1lbnVCZWxvdyIsIm9uQ29udGV4dE1lbnVDbG9zZUNsaWNrIiwic2V0dGluZ3NIaW50IiwibWVtYmVycyIsImdldEpvaW5lZE1lbWJlcnMiLCJ1bmRlZmluZWQiLCJsZW5ndGgiLCJ1c2VySWQiLCJjcmVkZW50aWFscyIsIm5hbWVFdmVudCIsImN1cnJlbnRTdGF0ZSIsImdldFN0YXRlRXZlbnRzIiwiZ2V0Q29udGVudCIsIm5hbWUiLCJ0ZXh0Q2xhc3NlcyIsIm14X1Jvb21IZWFkZXJfc2V0dGluZ3NIaW50Iiwicm9vbU5hbWUiLCJlbmFibGVSb29tT3B0aW9uc01lbnUiLCJvbkNvbnRleHRNZW51T3BlbkNsaWNrIiwicmVuZGVyIiwic2VhcmNoU3RhdHVzIiwic2VhcmNoSW5mbyIsInNlYXJjaENvdW50IiwiY291bnQiLCJvb2JEYXRhIiwidG9waWNFbGVtZW50Iiwicm9vbUF2YXRhciIsInNob3dCdXR0b25zIiwiZXhjbHVkZWRSaWdodFBhbmVsUGhhc2VCdXR0b25zIiwiZTJlSWNvbiIsImUyZVN0YXR1cyIsImlzVmlkZW9Sb29tIiwiaXNFbGVtZW50VmlkZW9Sb29tIiwidmlld0xhYnMiLCJkZWZhdWx0RGlzcGF0Y2hlciIsImRpc3BhdGNoIiwiYWN0aW9uIiwiQWN0aW9uIiwiVmlld1VzZXJTZXR0aW5ncyIsImluaXRpYWxUYWJJZCIsIlVzZXJUYWIiLCJMYWJzIiwiYmV0YVBpbGwiLCJlZGl0aW5nIiwiUm9vbUNvbnRleHQiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9yb29tcy9Sb29tSGVhZGVyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE5LCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHsgdGhyb3R0bGUgfSBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgTWF0cml4RXZlbnQsIFJvb20sIFJvb21TdGF0ZUV2ZW50IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbWF0cml4JztcbmltcG9ydCB7IENhbGxUeXBlIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL3dlYnJ0Yy9jYWxsXCI7XG5cbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gJy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgZGVmYXVsdERpc3BhdGNoZXIgZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IHsgVXNlclRhYiB9IGZyb20gXCIuLi9kaWFsb2dzL1VzZXJUYWJcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgUm9vbUhlYWRlckJ1dHRvbnMgZnJvbSAnLi4vcmlnaHRfcGFuZWwvUm9vbUhlYWRlckJ1dHRvbnMnO1xuaW1wb3J0IEUyRUljb24gZnJvbSAnLi9FMkVJY29uJztcbmltcG9ydCBEZWNvcmF0ZWRSb29tQXZhdGFyIGZyb20gXCIuLi9hdmF0YXJzL0RlY29yYXRlZFJvb21BdmF0YXJcIjtcbmltcG9ydCBBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cIjtcbmltcG9ydCBSb29tVG9waWMgZnJvbSBcIi4uL2VsZW1lbnRzL1Jvb21Ub3BpY1wiO1xuaW1wb3J0IFJvb21OYW1lIGZyb20gXCIuLi9lbGVtZW50cy9Sb29tTmFtZVwiO1xuaW1wb3J0IHsgRTJFU3RhdHVzIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvU2hpZWxkVXRpbHMnO1xuaW1wb3J0IHsgSU9PQkRhdGEgfSBmcm9tICcuLi8uLi8uLi9zdG9yZXMvVGhyZWVwaWRJbnZpdGVTdG9yZSc7XG5pbXBvcnQgeyBTZWFyY2hTY29wZSB9IGZyb20gJy4vU2VhcmNoQmFyJztcbmltcG9ydCB7IENvbnRleHRNZW51VG9vbHRpcEJ1dHRvbiB9IGZyb20gJy4uLy4uL3N0cnVjdHVyZXMvQ29udGV4dE1lbnUnO1xuaW1wb3J0IFJvb21Db250ZXh0TWVudSBmcm9tIFwiLi4vY29udGV4dF9tZW51cy9Sb29tQ29udGV4dE1lbnVcIjtcbmltcG9ydCB7IGNvbnRleHRNZW51QmVsb3cgfSBmcm9tICcuL1Jvb21UaWxlJztcbmltcG9ydCB7IFJvb21Ob3RpZmljYXRpb25TdGF0ZVN0b3JlIH0gZnJvbSAnLi4vLi4vLi4vc3RvcmVzL25vdGlmaWNhdGlvbnMvUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUnO1xuaW1wb3J0IHsgUmlnaHRQYW5lbFBoYXNlcyB9IGZyb20gJy4uLy4uLy4uL3N0b3Jlcy9yaWdodC1wYW5lbC9SaWdodFBhbmVsU3RvcmVQaGFzZXMnO1xuaW1wb3J0IHsgTm90aWZpY2F0aW9uU3RhdGVFdmVudHMgfSBmcm9tICcuLi8uLi8uLi9zdG9yZXMvbm90aWZpY2F0aW9ucy9Ob3RpZmljYXRpb25TdGF0ZSc7XG5pbXBvcnQgUm9vbUNvbnRleHQgZnJvbSBcIi4uLy4uLy4uL2NvbnRleHRzL1Jvb21Db250ZXh0XCI7XG5pbXBvcnQgUm9vbUxpdmVTaGFyZVdhcm5pbmcgZnJvbSAnLi4vYmVhY29uL1Jvb21MaXZlU2hhcmVXYXJuaW5nJztcbmltcG9ydCB7IEJldGFQaWxsIH0gZnJvbSBcIi4uL2JldGEvQmV0YUNhcmRcIjtcbmltcG9ydCBSaWdodFBhbmVsU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9yaWdodC1wYW5lbC9SaWdodFBhbmVsU3RvcmVcIjtcbmltcG9ydCB7IFVQREFURV9FVkVOVCB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvQXN5bmNTdG9yZVwiO1xuXG5leHBvcnQgaW50ZXJmYWNlIElTZWFyY2hJbmZvIHtcbiAgICBzZWFyY2hUZXJtOiBzdHJpbmc7XG4gICAgc2VhcmNoU2NvcGU6IFNlYXJjaFNjb3BlO1xuICAgIHNlYXJjaENvdW50OiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHJvb206IFJvb207XG4gICAgb29iRGF0YT86IElPT0JEYXRhO1xuICAgIGluUm9vbTogYm9vbGVhbjtcbiAgICBvblNlYXJjaENsaWNrOiAoKSA9PiB2b2lkO1xuICAgIG9uSW52aXRlQ2xpY2s6ICgpID0+IHZvaWQ7XG4gICAgb25Gb3JnZXRDbGljazogKCkgPT4gdm9pZDtcbiAgICBvbkNhbGxQbGFjZWQ6ICh0eXBlOiBDYWxsVHlwZSkgPT4gdm9pZDtcbiAgICBvbkFwcHNDbGljazogKCkgPT4gdm9pZDtcbiAgICBlMmVTdGF0dXM6IEUyRVN0YXR1cztcbiAgICBhcHBzU2hvd246IGJvb2xlYW47XG4gICAgc2VhcmNoSW5mbzogSVNlYXJjaEluZm87XG4gICAgZXhjbHVkZWRSaWdodFBhbmVsUGhhc2VCdXR0b25zPzogQXJyYXk8UmlnaHRQYW5lbFBoYXNlcz47XG4gICAgc2hvd0J1dHRvbnM/OiBib29sZWFuO1xuICAgIGVuYWJsZVJvb21PcHRpb25zTWVudT86IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGNvbnRleHRNZW51UG9zaXRpb24/OiBET01SZWN0O1xuICAgIHJpZ2h0UGFuZWxPcGVuOiBib29sZWFuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSb29tSGVhZGVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgZWRpdGluZzogZmFsc2UsXG4gICAgICAgIGluUm9vbTogZmFsc2UsXG4gICAgICAgIGV4Y2x1ZGVkUmlnaHRQYW5lbFBoYXNlQnV0dG9uczogW10sXG4gICAgICAgIHNob3dCdXR0b25zOiB0cnVlLFxuICAgICAgICBlbmFibGVSb29tT3B0aW9uc01lbnU6IHRydWUsXG4gICAgfTtcblxuICAgIHN0YXRpYyBjb250ZXh0VHlwZSA9IFJvb21Db250ZXh0O1xuICAgIHB1YmxpYyBjb250ZXh0ITogUmVhY3QuQ29udGV4dFR5cGU8dHlwZW9mIFJvb21Db250ZXh0PjtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgIHN1cGVyKHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgY29uc3Qgbm90aVN0b3JlID0gUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUuaW5zdGFuY2UuZ2V0Um9vbVN0YXRlKHByb3BzLnJvb20pO1xuICAgICAgICBub3RpU3RvcmUub24oTm90aWZpY2F0aW9uU3RhdGVFdmVudHMuVXBkYXRlLCB0aGlzLm9uTm90aWZpY2F0aW9uVXBkYXRlKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHJpZ2h0UGFuZWxPcGVuOiBSaWdodFBhbmVsU3RvcmUuaW5zdGFuY2UuaXNPcGVuLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjbGkub24oUm9vbVN0YXRlRXZlbnQuRXZlbnRzLCB0aGlzLm9uUm9vbVN0YXRlRXZlbnRzKTtcbiAgICAgICAgUmlnaHRQYW5lbFN0b3JlLmluc3RhbmNlLm9uKFVQREFURV9FVkVOVCwgdGhpcy5vblJpZ2h0UGFuZWxTdG9yZVVwZGF0ZSk7XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNsaT8ucmVtb3ZlTGlzdGVuZXIoUm9vbVN0YXRlRXZlbnQuRXZlbnRzLCB0aGlzLm9uUm9vbVN0YXRlRXZlbnRzKTtcbiAgICAgICAgY29uc3Qgbm90aVN0b3JlID0gUm9vbU5vdGlmaWNhdGlvblN0YXRlU3RvcmUuaW5zdGFuY2UuZ2V0Um9vbVN0YXRlKHRoaXMucHJvcHMucm9vbSk7XG4gICAgICAgIG5vdGlTdG9yZS5yZW1vdmVMaXN0ZW5lcihOb3RpZmljYXRpb25TdGF0ZUV2ZW50cy5VcGRhdGUsIHRoaXMub25Ob3RpZmljYXRpb25VcGRhdGUpO1xuICAgICAgICBSaWdodFBhbmVsU3RvcmUuaW5zdGFuY2Uub2ZmKFVQREFURV9FVkVOVCwgdGhpcy5vblJpZ2h0UGFuZWxTdG9yZVVwZGF0ZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblJpZ2h0UGFuZWxTdG9yZVVwZGF0ZSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHJpZ2h0UGFuZWxPcGVuOiBSaWdodFBhbmVsU3RvcmUuaW5zdGFuY2UuaXNPcGVuIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uUm9vbVN0YXRlRXZlbnRzID0gKGV2ZW50OiBNYXRyaXhFdmVudCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMucm9vbSB8fCBldmVudC5nZXRSb29tSWQoKSAhPT0gdGhpcy5wcm9wcy5yb29tLnJvb21JZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmVkaXNwbGF5IHRoZSByb29tIG5hbWUsIHRvcGljLCBldGMuXG4gICAgICAgIHRoaXMucmF0ZUxpbWl0ZWRVcGRhdGUoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbk5vdGlmaWNhdGlvblVwZGF0ZSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHJhdGVMaW1pdGVkVXBkYXRlID0gdGhyb3R0bGUoKCkgPT4ge1xuICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgfSwgNTAwLCB7IGxlYWRpbmc6IHRydWUsIHRyYWlsaW5nOiB0cnVlIH0pO1xuXG4gICAgcHJpdmF0ZSBvbkNvbnRleHRNZW51T3BlbkNsaWNrID0gKGV2OiBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBldi50YXJnZXQgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjb250ZXh0TWVudVBvc2l0aW9uOiB0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Db250ZXh0TWVudUNsb3NlQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjb250ZXh0TWVudVBvc2l0aW9uOiBudWxsIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIHJlbmRlckJ1dHRvbnMoKTogSlNYLkVsZW1lbnRbXSB7XG4gICAgICAgIGNvbnN0IGJ1dHRvbnM6IEpTWC5FbGVtZW50W10gPSBbXTtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5pblJvb20gJiZcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25DYWxsUGxhY2VkICYmXG4gICAgICAgICAgICAhdGhpcy5jb250ZXh0LnRvbWJzdG9uZSAmJlxuICAgICAgICAgICAgU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInNob3dDYWxsQnV0dG9uc0luQ29tcG9zZXJcIilcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBjb25zdCB2b2ljZUNhbGxCdXR0b24gPSA8QWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tSGVhZGVyX2J1dHRvbiBteF9Sb29tSGVhZGVyX3ZvaWNlQ2FsbEJ1dHRvblwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gdGhpcy5wcm9wcy5vbkNhbGxQbGFjZWQoQ2FsbFR5cGUuVm9pY2UpfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIlZvaWNlIGNhbGxcIil9XG4gICAgICAgICAgICAgICAga2V5PVwidm9pY2VcIlxuICAgICAgICAgICAgLz47XG4gICAgICAgICAgICBjb25zdCB2aWRlb0NhbGxCdXR0b24gPSA8QWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tSGVhZGVyX2J1dHRvbiBteF9Sb29tSGVhZGVyX3ZpZGVvQ2FsbEJ1dHRvblwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gdGhpcy5wcm9wcy5vbkNhbGxQbGFjZWQoQ2FsbFR5cGUuVmlkZW8pfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIlZpZGVvIGNhbGxcIil9XG4gICAgICAgICAgICAgICAga2V5PVwidmlkZW9cIlxuICAgICAgICAgICAgLz47XG4gICAgICAgICAgICBidXR0b25zLnB1c2godm9pY2VDYWxsQnV0dG9uLCB2aWRlb0NhbGxCdXR0b24pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25Gb3JnZXRDbGljaykge1xuICAgICAgICAgICAgY29uc3QgZm9yZ2V0QnV0dG9uID0gPEFjY2Vzc2libGVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUm9vbUhlYWRlcl9idXR0b24gbXhfUm9vbUhlYWRlcl9mb3JnZXRCdXR0b25cIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMub25Gb3JnZXRDbGlja31cbiAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJGb3JnZXQgcm9vbVwiKX1cbiAgICAgICAgICAgICAgICBrZXk9XCJmb3JnZXRcIlxuICAgICAgICAgICAgLz47XG4gICAgICAgICAgICBidXR0b25zLnB1c2goZm9yZ2V0QnV0dG9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uQXBwc0NsaWNrKSB7XG4gICAgICAgICAgICBjb25zdCBhcHBzQnV0dG9uID0gPEFjY2Vzc2libGVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWVzKFwibXhfUm9vbUhlYWRlcl9idXR0b24gbXhfUm9vbUhlYWRlcl9hcHBzQnV0dG9uXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgbXhfUm9vbUhlYWRlcl9hcHBzQnV0dG9uX2hpZ2hsaWdodDogdGhpcy5wcm9wcy5hcHBzU2hvd24sXG4gICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5vbkFwcHNDbGlja31cbiAgICAgICAgICAgICAgICB0aXRsZT17dGhpcy5wcm9wcy5hcHBzU2hvd24gPyBfdChcIkhpZGUgV2lkZ2V0c1wiKSA6IF90KFwiU2hvdyBXaWRnZXRzXCIpfVxuICAgICAgICAgICAgICAgIGtleT1cImFwcHNcIlxuICAgICAgICAgICAgLz47XG4gICAgICAgICAgICBidXR0b25zLnB1c2goYXBwc0J1dHRvbik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5vblNlYXJjaENsaWNrICYmIHRoaXMucHJvcHMuaW5Sb29tKSB7XG4gICAgICAgICAgICBjb25zdCBzZWFyY2hCdXR0b24gPSA8QWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tSGVhZGVyX2J1dHRvbiBteF9Sb29tSGVhZGVyX3NlYXJjaEJ1dHRvblwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5vblNlYXJjaENsaWNrfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIlNlYXJjaFwiKX1cbiAgICAgICAgICAgICAgICBrZXk9XCJzZWFyY2hcIlxuICAgICAgICAgICAgLz47XG4gICAgICAgICAgICBidXR0b25zLnB1c2goc2VhcmNoQnV0dG9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uSW52aXRlQ2xpY2sgJiYgdGhpcy5wcm9wcy5pblJvb20pIHtcbiAgICAgICAgICAgIGNvbnN0IGludml0ZUJ1dHRvbiA9IDxBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21IZWFkZXJfYnV0dG9uIG14X1Jvb21IZWFkZXJfaW52aXRlQnV0dG9uXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLnByb3BzLm9uSW52aXRlQ2xpY2t9XG4gICAgICAgICAgICAgICAgdGl0bGU9e190KFwiSW52aXRlXCIpfVxuICAgICAgICAgICAgICAgIGtleT1cImludml0ZVwiXG4gICAgICAgICAgICAvPjtcbiAgICAgICAgICAgIGJ1dHRvbnMucHVzaChpbnZpdGVCdXR0b24pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGJ1dHRvbnM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJOYW1lKG9vYk5hbWUpIHtcbiAgICAgICAgbGV0IGNvbnRleHRNZW51OiBKU1guRWxlbWVudDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuY29udGV4dE1lbnVQb3NpdGlvbiAmJiB0aGlzLnByb3BzLnJvb20pIHtcbiAgICAgICAgICAgIGNvbnRleHRNZW51ID0gKFxuICAgICAgICAgICAgICAgIDxSb29tQ29udGV4dE1lbnVcbiAgICAgICAgICAgICAgICAgICAgey4uLmNvbnRleHRNZW51QmVsb3codGhpcy5zdGF0ZS5jb250ZXh0TWVudVBvc2l0aW9uKX1cbiAgICAgICAgICAgICAgICAgICAgcm9vbT17dGhpcy5wcm9wcy5yb29tfVxuICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLm9uQ29udGV4dE1lbnVDbG9zZUNsaWNrfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gWFhYOiB0aGlzIGlzIGEgYml0IGluZWZmaWNpZW50IC0gd2UgY291bGQganVzdCBjb21wYXJlIHJvb20ubmFtZSBmb3IgJ0VtcHR5IHJvb20nLi4uXG4gICAgICAgIGxldCBzZXR0aW5nc0hpbnQgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgbWVtYmVycyA9IHRoaXMucHJvcHMucm9vbSA/IHRoaXMucHJvcHMucm9vbS5nZXRKb2luZWRNZW1iZXJzKCkgOiB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChtZW1iZXJzKSB7XG4gICAgICAgICAgICBpZiAobWVtYmVycy5sZW5ndGggPT09IDEgJiYgbWVtYmVyc1swXS51c2VySWQgPT09IE1hdHJpeENsaWVudFBlZy5nZXQoKS5jcmVkZW50aWFscy51c2VySWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuYW1lRXZlbnQgPSB0aGlzLnByb3BzLnJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKCdtLnJvb20ubmFtZScsICcnKTtcbiAgICAgICAgICAgICAgICBpZiAoIW5hbWVFdmVudCB8fCAhbmFtZUV2ZW50LmdldENvbnRlbnQoKS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzSGludCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdGV4dENsYXNzZXMgPSBjbGFzc05hbWVzKCdteF9Sb29tSGVhZGVyX25hbWV0ZXh0JywgeyBteF9Sb29tSGVhZGVyX3NldHRpbmdzSGludDogc2V0dGluZ3NIaW50IH0pO1xuICAgICAgICBjb25zdCByb29tTmFtZSA9IDxSb29tTmFtZSByb29tPXt0aGlzLnByb3BzLnJvb219PlxuICAgICAgICAgICAgeyAobmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb21OYW1lID0gbmFtZSB8fCBvb2JOYW1lO1xuICAgICAgICAgICAgICAgIHJldHVybiA8ZGl2IGRpcj1cImF1dG9cIiBjbGFzc05hbWU9e3RleHRDbGFzc2VzfSB0aXRsZT17cm9vbU5hbWV9IHJvbGU9XCJoZWFkaW5nXCIgYXJpYS1sZXZlbD17MX0+XG4gICAgICAgICAgICAgICAgICAgIHsgcm9vbU5hbWUgfVxuICAgICAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgIH0gfVxuICAgICAgICA8L1Jvb21OYW1lPjtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5lbmFibGVSb29tT3B0aW9uc01lbnUpIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPENvbnRleHRNZW51VG9vbHRpcEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tSGVhZGVyX25hbWVcIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQ29udGV4dE1lbnVPcGVuQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIGlzRXhwYW5kZWQ9eyEhdGhpcy5zdGF0ZS5jb250ZXh0TWVudVBvc2l0aW9ufVxuICAgICAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJSb29tIG9wdGlvbnNcIil9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7IHJvb21OYW1lIH1cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLnJvb20gJiYgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tSGVhZGVyX2NoZXZyb25cIiAvPiB9XG4gICAgICAgICAgICAgICAgICAgIHsgY29udGV4dE1lbnUgfVxuICAgICAgICAgICAgICAgIDwvQ29udGV4dE1lbnVUb29sdGlwQnV0dG9uPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21IZWFkZXJfbmFtZSBteF9Sb29tSGVhZGVyX25hbWUtLXRleHRvbmx5XCI+XG4gICAgICAgICAgICB7IHJvb21OYW1lIH1cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIoKSB7XG4gICAgICAgIGxldCBzZWFyY2hTdGF0dXMgPSBudWxsO1xuXG4gICAgICAgIC8vIGRvbid0IGRpc3BsYXkgdGhlIHNlYXJjaCBjb3VudCB1bnRpbCB0aGUgc2VhcmNoIGNvbXBsZXRlcyBhbmRcbiAgICAgICAgLy8gZ2l2ZXMgdXMgYSB2YWxpZCAocG9zc2libHkgemVybykgc2VhcmNoQ291bnQuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLnNlYXJjaEluZm8gJiZcbiAgICAgICAgICAgIHRoaXMucHJvcHMuc2VhcmNoSW5mby5zZWFyY2hDb3VudCAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICB0aGlzLnByb3BzLnNlYXJjaEluZm8uc2VhcmNoQ291bnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHNlYXJjaFN0YXR1cyA9IDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbUhlYWRlcl9zZWFyY2hTdGF0dXNcIj4mbmJzcDtcbiAgICAgICAgICAgICAgICB7IF90KFwiKH4lKGNvdW50KXMgcmVzdWx0cylcIiwgeyBjb3VudDogdGhpcy5wcm9wcy5zZWFyY2hJbmZvLnNlYXJjaENvdW50IH0pIH1cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBvb2JOYW1lID0gX3QoXCJKb2luIFJvb21cIik7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9vYkRhdGEgJiYgdGhpcy5wcm9wcy5vb2JEYXRhLm5hbWUpIHtcbiAgICAgICAgICAgIG9vYk5hbWUgPSB0aGlzLnByb3BzLm9vYkRhdGEubmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG5hbWUgPSB0aGlzLnJlbmRlck5hbWUob29iTmFtZSk7XG5cbiAgICAgICAgY29uc3QgdG9waWNFbGVtZW50ID0gPFJvb21Ub3BpY1xuICAgICAgICAgICAgcm9vbT17dGhpcy5wcm9wcy5yb29tfVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUm9vbUhlYWRlcl90b3BpY1wiXG4gICAgICAgIC8+O1xuXG4gICAgICAgIGxldCByb29tQXZhdGFyO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5yb29tKSB7XG4gICAgICAgICAgICByb29tQXZhdGFyID0gPERlY29yYXRlZFJvb21BdmF0YXJcbiAgICAgICAgICAgICAgICByb29tPXt0aGlzLnByb3BzLnJvb219XG4gICAgICAgICAgICAgICAgYXZhdGFyU2l6ZT17MjR9XG4gICAgICAgICAgICAgICAgb29iRGF0YT17dGhpcy5wcm9wcy5vb2JEYXRhfVxuICAgICAgICAgICAgICAgIHZpZXdBdmF0YXJPbkNsaWNrPXt0cnVlfVxuICAgICAgICAgICAgLz47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgYnV0dG9ucztcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuc2hvd0J1dHRvbnMpIHtcbiAgICAgICAgICAgIGJ1dHRvbnMgPSA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tSGVhZGVyX2J1dHRvbnNcIj5cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnJlbmRlckJ1dHRvbnMoKSB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPFJvb21IZWFkZXJCdXR0b25zIHJvb209e3RoaXMucHJvcHMucm9vbX0gZXhjbHVkZWRSaWdodFBhbmVsUGhhc2VCdXR0b25zPXt0aGlzLnByb3BzLmV4Y2x1ZGVkUmlnaHRQYW5lbFBoYXNlQnV0dG9uc30gLz5cbiAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZTJlSWNvbiA9IHRoaXMucHJvcHMuZTJlU3RhdHVzID8gPEUyRUljb24gc3RhdHVzPXt0aGlzLnByb3BzLmUyZVN0YXR1c30gLz4gOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgY29uc3QgaXNWaWRlb1Jvb20gPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZmVhdHVyZV92aWRlb19yb29tc1wiKSAmJiB0aGlzLnByb3BzLnJvb20uaXNFbGVtZW50VmlkZW9Sb29tKCk7XG4gICAgICAgIGNvbnN0IHZpZXdMYWJzID0gKCkgPT4gZGVmYXVsdERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uVmlld1VzZXJTZXR0aW5ncyxcbiAgICAgICAgICAgIGluaXRpYWxUYWJJZDogVXNlclRhYi5MYWJzLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgYmV0YVBpbGwgPSBpc1ZpZGVvUm9vbSA/IChcbiAgICAgICAgICAgIDxCZXRhUGlsbCBvbkNsaWNrPXt2aWV3TGFic30gdG9vbHRpcFRpdGxlPXtfdChcIlZpZGVvIHJvb21zIGFyZSBhIGJldGEgZmVhdHVyZVwiKX0gLz5cbiAgICAgICAgKSA6IG51bGw7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwibXhfUm9vbUhlYWRlciBsaWdodC1wYW5lbFwiPlxuICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUm9vbUhlYWRlcl93cmFwcGVyXCJcbiAgICAgICAgICAgICAgICAgICAgYXJpYS1vd25zPXt0aGlzLnN0YXRlLnJpZ2h0UGFuZWxPcGVuID8gXCJteF9SaWdodFBhbmVsXCIgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21IZWFkZXJfYXZhdGFyXCI+eyByb29tQXZhdGFyIH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tSGVhZGVyX2UyZUljb25cIj57IGUyZUljb24gfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICB7IG5hbWUgfVxuICAgICAgICAgICAgICAgICAgICB7IHNlYXJjaFN0YXR1cyB9XG4gICAgICAgICAgICAgICAgICAgIHsgdG9waWNFbGVtZW50IH1cbiAgICAgICAgICAgICAgICAgICAgeyBiZXRhUGlsbCB9XG4gICAgICAgICAgICAgICAgICAgIHsgYnV0dG9ucyB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPFJvb21MaXZlU2hhcmVXYXJuaW5nIHJvb21JZD17dGhpcy5wcm9wcy5yb29tLnJvb21JZH0gLz5cbiAgICAgICAgICAgIDwvaGVhZGVyPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFD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