"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _partials = require("matrix-js-sdk/src/@types/partials");

var _languageHandler = require("../../../languageHandler");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _actions = require("../../../dispatcher/actions");

var _UserTab = require("../dialogs/UserTab");

var _membership = require("../../../utils/membership");

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _useDispatcher = require("../../../hooks/useDispatcher");

var _useSettings = require("../../../hooks/useSettings");

var _useRoomState = require("../../../hooks/useRoomState");

var _useRoomMembers = require("../../../hooks/useRoomMembers");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _InlineSpinner = _interopRequireDefault(require("../elements/InlineSpinner"));

var _RoomName = _interopRequireDefault(require("../elements/RoomName"));

var _RoomTopic = _interopRequireDefault(require("../elements/RoomTopic"));

var _RoomFacePile = _interopRequireDefault(require("../elements/RoomFacePile"));

var _RoomAvatar = _interopRequireDefault(require("../avatars/RoomAvatar"));

var _MemberAvatar = _interopRequireDefault(require("../avatars/MemberAvatar"));

var _BetaCard = require("../beta/BetaCard");

var _RoomInfoLine = _interopRequireDefault(require("./RoomInfoLine"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2022 The Matrix.org Foundation C.I.C.

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
// XXX This component is currently only used for spaces and video rooms, though
// surely we should expand its use to all rooms for consistency? This already
// handles the text room case, though we would need to add support for ignoring
// and viewing invite reasons to achieve parity with the default invite screen.
const RoomPreviewCard = _ref => {
  let {
    room,
    onJoinButtonClicked,
    onRejectButtonClicked
  } = _ref;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const videoRoomsEnabled = (0, _useSettings.useFeatureEnabled)("feature_video_rooms");
  const myMembership = (0, _useRoomMembers.useMyRoomMembership)(room);
  (0, _useDispatcher.useDispatcher)(_dispatcher.default, payload => {
    if (payload.action === _actions.Action.JoinRoomError && payload.roomId === room.roomId) {
      setBusy(false); // stop the spinner, join failed
    }
  });
  const [busy, setBusy] = (0, _react.useState)(false);
  const joinRule = (0, _useRoomState.useRoomState)(room, state => state.getJoinRule());

  const cannotJoin = (0, _membership.getEffectiveMembership)(myMembership) === _membership.EffectiveMembership.Leave && joinRule !== _partials.JoinRule.Public;

  const viewLabs = () => _dispatcher.default.dispatch({
    action: _actions.Action.ViewUserSettings,
    initialTabId: _UserTab.UserTab.Labs
  });

  let inviterSection;
  let joinButtons;

  if (myMembership === "join") {
    joinButtons = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "danger_outline",
      onClick: () => {
        _dispatcher.default.dispatch({
          action: "leave_room",
          room_id: room.roomId
        });
      }
    }, (0, _languageHandler._t)("Leave"));
  } else if (myMembership === "invite") {
    const inviteSender = room.getMember(cli.getUserId())?.events.member?.getSender();
    const inviter = inviteSender && room.getMember(inviteSender);

    if (inviteSender) {
      inviterSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_RoomPreviewCard_inviter"
      }, /*#__PURE__*/_react.default.createElement(_MemberAvatar.default, {
        member: inviter,
        fallbackUserId: inviteSender,
        width: 32,
        height: 32
      }), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_RoomPreviewCard_inviter_name"
      }, (0, _languageHandler._t)("<inviter/> invites you", {}, {
        inviter: () => /*#__PURE__*/_react.default.createElement("b", null, inviter?.name || inviteSender)
      })), inviter ? /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_RoomPreviewCard_inviter_mxid"
      }, inviteSender) : null), room.isElementVideoRoom() ? /*#__PURE__*/_react.default.createElement(_BetaCard.BetaPill, {
        onClick: viewLabs,
        tooltipTitle: (0, _languageHandler._t)("Video rooms are a beta feature")
      }) : null);
    }

    joinButtons = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "secondary",
      onClick: () => {
        setBusy(true);
        onRejectButtonClicked();
      }
    }, (0, _languageHandler._t)("Reject")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "primary",
      onClick: () => {
        setBusy(true);
        onJoinButtonClicked();
      }
    }, (0, _languageHandler._t)("Accept")));
  } else {
    joinButtons = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "primary",
      onClick: () => {
        onJoinButtonClicked();

        if (!cli.isGuest()) {
          // user will be shown a modal that won't fire a room join error
          setBusy(true);
        }
      },
      disabled: cannotJoin
    }, (0, _languageHandler._t)("Join"));
  }

  if (busy) {
    joinButtons = /*#__PURE__*/_react.default.createElement(_InlineSpinner.default, null);
  }

  let avatarRow;

  if (room.isElementVideoRoom()) {
    avatarRow = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
      room: room,
      height: 50,
      width: 50,
      viewAvatarOnClick: true
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomPreviewCard_video"
    }));
  } else if (room.isSpaceRoom()) {
    avatarRow = /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
      room: room,
      height: 80,
      width: 80,
      viewAvatarOnClick: true
    });
  } else {
    avatarRow = /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
      room: room,
      height: 50,
      width: 50,
      viewAvatarOnClick: true
    });
  }

  let notice;

  if (cannotJoin) {
    notice = (0, _languageHandler._t)("To view %(roomName)s, you need an invite", {
      roomName: room.name
    });
  } else if (room.isElementVideoRoom() && !videoRoomsEnabled) {
    notice = myMembership === "join" ? (0, _languageHandler._t)("To view, please enable video rooms in Labs first") : (0, _languageHandler._t)("To join, please enable video rooms in Labs first");
    joinButtons = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "primary",
      onClick: viewLabs
    }, (0, _languageHandler._t)("Show Labs settings"));
  }

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_RoomPreviewCard"
  }, inviterSection, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_RoomPreviewCard_avatar"
  }, avatarRow), /*#__PURE__*/_react.default.createElement("h1", {
    className: "mx_RoomPreviewCard_name"
  }, /*#__PURE__*/_react.default.createElement(_RoomName.default, {
    room: room
  })), /*#__PURE__*/_react.default.createElement(_RoomInfoLine.default, {
    room: room
  }), /*#__PURE__*/_react.default.createElement(_RoomTopic.default, {
    room: room,
    className: "mx_RoomPreviewCard_topic"
  }), room.getJoinRule() === "public" && /*#__PURE__*/_react.default.createElement(_RoomFacePile.default, {
    room: room
  }), notice ? /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_RoomPreviewCard_notice"
  }, notice) : null, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_RoomPreviewCard_joinButtons"
  }, joinButtons));
};

var _default = RoomPreviewCard;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSb29tUHJldmlld0NhcmQiLCJyb29tIiwib25Kb2luQnV0dG9uQ2xpY2tlZCIsIm9uUmVqZWN0QnV0dG9uQ2xpY2tlZCIsImNsaSIsInVzZUNvbnRleHQiLCJNYXRyaXhDbGllbnRDb250ZXh0IiwidmlkZW9Sb29tc0VuYWJsZWQiLCJ1c2VGZWF0dXJlRW5hYmxlZCIsIm15TWVtYmVyc2hpcCIsInVzZU15Um9vbU1lbWJlcnNoaXAiLCJ1c2VEaXNwYXRjaGVyIiwiZGVmYXVsdERpc3BhdGNoZXIiLCJwYXlsb2FkIiwiYWN0aW9uIiwiQWN0aW9uIiwiSm9pblJvb21FcnJvciIsInJvb21JZCIsInNldEJ1c3kiLCJidXN5IiwidXNlU3RhdGUiLCJqb2luUnVsZSIsInVzZVJvb21TdGF0ZSIsInN0YXRlIiwiZ2V0Sm9pblJ1bGUiLCJjYW5ub3RKb2luIiwiZ2V0RWZmZWN0aXZlTWVtYmVyc2hpcCIsIkVmZmVjdGl2ZU1lbWJlcnNoaXAiLCJMZWF2ZSIsIkpvaW5SdWxlIiwiUHVibGljIiwidmlld0xhYnMiLCJkaXNwYXRjaCIsIlZpZXdVc2VyU2V0dGluZ3MiLCJpbml0aWFsVGFiSWQiLCJVc2VyVGFiIiwiTGFicyIsImludml0ZXJTZWN0aW9uIiwiam9pbkJ1dHRvbnMiLCJyb29tX2lkIiwiX3QiLCJpbnZpdGVTZW5kZXIiLCJnZXRNZW1iZXIiLCJnZXRVc2VySWQiLCJldmVudHMiLCJtZW1iZXIiLCJnZXRTZW5kZXIiLCJpbnZpdGVyIiwibmFtZSIsImlzRWxlbWVudFZpZGVvUm9vbSIsImlzR3Vlc3QiLCJhdmF0YXJSb3ciLCJpc1NwYWNlUm9vbSIsIm5vdGljZSIsInJvb21OYW1lIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3Mvcm9vbXMvUm9vbVByZXZpZXdDYXJkLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgRkMsIHVzZUNvbnRleHQsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQgeyBKb2luUnVsZSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9AdHlwZXMvcGFydGlhbHNcIjtcblxuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgZGVmYXVsdERpc3BhdGNoZXIgZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IHsgVXNlclRhYiB9IGZyb20gXCIuLi9kaWFsb2dzL1VzZXJUYWJcIjtcbmltcG9ydCB7IEVmZmVjdGl2ZU1lbWJlcnNoaXAsIGdldEVmZmVjdGl2ZU1lbWJlcnNoaXAgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvbWVtYmVyc2hpcFwiO1xuaW1wb3J0IE1hdHJpeENsaWVudENvbnRleHQgZnJvbSBcIi4uLy4uLy4uL2NvbnRleHRzL01hdHJpeENsaWVudENvbnRleHRcIjtcbmltcG9ydCB7IHVzZURpc3BhdGNoZXIgfSBmcm9tIFwiLi4vLi4vLi4vaG9va3MvdXNlRGlzcGF0Y2hlclwiO1xuaW1wb3J0IHsgdXNlRmVhdHVyZUVuYWJsZWQgfSBmcm9tIFwiLi4vLi4vLi4vaG9va3MvdXNlU2V0dGluZ3NcIjtcbmltcG9ydCB7IHVzZVJvb21TdGF0ZSB9IGZyb20gXCIuLi8uLi8uLi9ob29rcy91c2VSb29tU3RhdGVcIjtcbmltcG9ydCB7IHVzZU15Um9vbU1lbWJlcnNoaXAgfSBmcm9tIFwiLi4vLi4vLi4vaG9va3MvdXNlUm9vbU1lbWJlcnNcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgSW5saW5lU3Bpbm5lciBmcm9tIFwiLi4vZWxlbWVudHMvSW5saW5lU3Bpbm5lclwiO1xuaW1wb3J0IFJvb21OYW1lIGZyb20gXCIuLi9lbGVtZW50cy9Sb29tTmFtZVwiO1xuaW1wb3J0IFJvb21Ub3BpYyBmcm9tIFwiLi4vZWxlbWVudHMvUm9vbVRvcGljXCI7XG5pbXBvcnQgUm9vbUZhY2VQaWxlIGZyb20gXCIuLi9lbGVtZW50cy9Sb29tRmFjZVBpbGVcIjtcbmltcG9ydCBSb29tQXZhdGFyIGZyb20gXCIuLi9hdmF0YXJzL1Jvb21BdmF0YXJcIjtcbmltcG9ydCBNZW1iZXJBdmF0YXIgZnJvbSBcIi4uL2F2YXRhcnMvTWVtYmVyQXZhdGFyXCI7XG5pbXBvcnQgeyBCZXRhUGlsbCB9IGZyb20gXCIuLi9iZXRhL0JldGFDYXJkXCI7XG5pbXBvcnQgUm9vbUluZm9MaW5lIGZyb20gXCIuL1Jvb21JbmZvTGluZVwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICByb29tOiBSb29tO1xuICAgIG9uSm9pbkJ1dHRvbkNsaWNrZWQ6ICgpID0+IHZvaWQ7XG4gICAgb25SZWplY3RCdXR0b25DbGlja2VkOiAoKSA9PiB2b2lkO1xufVxuXG4vLyBYWFggVGhpcyBjb21wb25lbnQgaXMgY3VycmVudGx5IG9ubHkgdXNlZCBmb3Igc3BhY2VzIGFuZCB2aWRlbyByb29tcywgdGhvdWdoXG4vLyBzdXJlbHkgd2Ugc2hvdWxkIGV4cGFuZCBpdHMgdXNlIHRvIGFsbCByb29tcyBmb3IgY29uc2lzdGVuY3k/IFRoaXMgYWxyZWFkeVxuLy8gaGFuZGxlcyB0aGUgdGV4dCByb29tIGNhc2UsIHRob3VnaCB3ZSB3b3VsZCBuZWVkIHRvIGFkZCBzdXBwb3J0IGZvciBpZ25vcmluZ1xuLy8gYW5kIHZpZXdpbmcgaW52aXRlIHJlYXNvbnMgdG8gYWNoaWV2ZSBwYXJpdHkgd2l0aCB0aGUgZGVmYXVsdCBpbnZpdGUgc2NyZWVuLlxuY29uc3QgUm9vbVByZXZpZXdDYXJkOiBGQzxJUHJvcHM+ID0gKHsgcm9vbSwgb25Kb2luQnV0dG9uQ2xpY2tlZCwgb25SZWplY3RCdXR0b25DbGlja2VkIH0pID0+IHtcbiAgICBjb25zdCBjbGkgPSB1c2VDb250ZXh0KE1hdHJpeENsaWVudENvbnRleHQpO1xuICAgIGNvbnN0IHZpZGVvUm9vbXNFbmFibGVkID0gdXNlRmVhdHVyZUVuYWJsZWQoXCJmZWF0dXJlX3ZpZGVvX3Jvb21zXCIpO1xuICAgIGNvbnN0IG15TWVtYmVyc2hpcCA9IHVzZU15Um9vbU1lbWJlcnNoaXAocm9vbSk7XG4gICAgdXNlRGlzcGF0Y2hlcihkZWZhdWx0RGlzcGF0Y2hlciwgcGF5bG9hZCA9PiB7XG4gICAgICAgIGlmIChwYXlsb2FkLmFjdGlvbiA9PT0gQWN0aW9uLkpvaW5Sb29tRXJyb3IgJiYgcGF5bG9hZC5yb29tSWQgPT09IHJvb20ucm9vbUlkKSB7XG4gICAgICAgICAgICBzZXRCdXN5KGZhbHNlKTsgLy8gc3RvcCB0aGUgc3Bpbm5lciwgam9pbiBmYWlsZWRcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc3QgW2J1c3ksIHNldEJ1c3ldID0gdXNlU3RhdGUoZmFsc2UpO1xuXG4gICAgY29uc3Qgam9pblJ1bGUgPSB1c2VSb29tU3RhdGUocm9vbSwgc3RhdGUgPT4gc3RhdGUuZ2V0Sm9pblJ1bGUoKSk7XG4gICAgY29uc3QgY2Fubm90Sm9pbiA9IGdldEVmZmVjdGl2ZU1lbWJlcnNoaXAobXlNZW1iZXJzaGlwKSA9PT0gRWZmZWN0aXZlTWVtYmVyc2hpcC5MZWF2ZVxuICAgICAgICAmJiBqb2luUnVsZSAhPT0gSm9pblJ1bGUuUHVibGljO1xuXG4gICAgY29uc3Qgdmlld0xhYnMgPSAoKSA9PiBkZWZhdWx0RGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgIGFjdGlvbjogQWN0aW9uLlZpZXdVc2VyU2V0dGluZ3MsXG4gICAgICAgIGluaXRpYWxUYWJJZDogVXNlclRhYi5MYWJzLFxuICAgIH0pO1xuXG4gICAgbGV0IGludml0ZXJTZWN0aW9uOiBKU1guRWxlbWVudDtcbiAgICBsZXQgam9pbkJ1dHRvbnM6IEpTWC5FbGVtZW50O1xuICAgIGlmIChteU1lbWJlcnNoaXAgPT09IFwiam9pblwiKSB7XG4gICAgICAgIGpvaW5CdXR0b25zID0gKFxuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICBraW5kPVwiZGFuZ2VyX291dGxpbmVcIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiBcImxlYXZlX3Jvb21cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvb21faWQ6IHJvb20ucm9vbUlkLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgX3QoXCJMZWF2ZVwiKSB9XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICk7XG4gICAgfSBlbHNlIGlmIChteU1lbWJlcnNoaXAgPT09IFwiaW52aXRlXCIpIHtcbiAgICAgICAgY29uc3QgaW52aXRlU2VuZGVyID0gcm9vbS5nZXRNZW1iZXIoY2xpLmdldFVzZXJJZCgpKT8uZXZlbnRzLm1lbWJlcj8uZ2V0U2VuZGVyKCk7XG4gICAgICAgIGNvbnN0IGludml0ZXIgPSBpbnZpdGVTZW5kZXIgJiYgcm9vbS5nZXRNZW1iZXIoaW52aXRlU2VuZGVyKTtcblxuICAgICAgICBpZiAoaW52aXRlU2VuZGVyKSB7XG4gICAgICAgICAgICBpbnZpdGVyU2VjdGlvbiA9IDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbVByZXZpZXdDYXJkX2ludml0ZXJcIj5cbiAgICAgICAgICAgICAgICA8TWVtYmVyQXZhdGFyIG1lbWJlcj17aW52aXRlcn0gZmFsbGJhY2tVc2VySWQ9e2ludml0ZVNlbmRlcn0gd2lkdGg9ezMyfSBoZWlnaHQ9ezMyfSAvPlxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbVByZXZpZXdDYXJkX2ludml0ZXJfbmFtZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIjxpbnZpdGVyLz4gaW52aXRlcyB5b3VcIiwge30sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnZpdGVyOiAoKSA9PiA8Yj57IGludml0ZXI/Lm5hbWUgfHwgaW52aXRlU2VuZGVyIH08L2I+LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSkgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgeyBpbnZpdGVyID8gPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tUHJldmlld0NhcmRfaW52aXRlcl9teGlkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGludml0ZVNlbmRlciB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PiA6IG51bGwgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIHsgcm9vbS5pc0VsZW1lbnRWaWRlb1Jvb20oKVxuICAgICAgICAgICAgICAgICAgICA/IDxCZXRhUGlsbCBvbkNsaWNrPXt2aWV3TGFic30gdG9vbHRpcFRpdGxlPXtfdChcIlZpZGVvIHJvb21zIGFyZSBhIGJldGEgZmVhdHVyZVwiKX0gLz5cbiAgICAgICAgICAgICAgICAgICAgOiBudWxsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgam9pbkJ1dHRvbnMgPSA8PlxuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICBraW5kPVwic2Vjb25kYXJ5XCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNldEJ1c3kodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIG9uUmVqZWN0QnV0dG9uQ2xpY2tlZCgpO1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyBfdChcIlJlamVjdFwiKSB9XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIGtpbmQ9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNldEJ1c3kodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIG9uSm9pbkJ1dHRvbkNsaWNrZWQoKTtcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgX3QoXCJBY2NlcHRcIikgfVxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICA8Lz47XG4gICAgfSBlbHNlIHtcbiAgICAgICAgam9pbkJ1dHRvbnMgPSAoXG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIGtpbmQ9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIG9uSm9pbkJ1dHRvbkNsaWNrZWQoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjbGkuaXNHdWVzdCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB1c2VyIHdpbGwgYmUgc2hvd24gYSBtb2RhbCB0aGF0IHdvbid0IGZpcmUgYSByb29tIGpvaW4gZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldEJ1c3kodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXtjYW5ub3RKb2lufVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgX3QoXCJKb2luXCIpIH1cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoYnVzeSkge1xuICAgICAgICBqb2luQnV0dG9ucyA9IDxJbmxpbmVTcGlubmVyIC8+O1xuICAgIH1cblxuICAgIGxldCBhdmF0YXJSb3c6IEpTWC5FbGVtZW50O1xuICAgIGlmIChyb29tLmlzRWxlbWVudFZpZGVvUm9vbSgpKSB7XG4gICAgICAgIGF2YXRhclJvdyA9IDw+XG4gICAgICAgICAgICA8Um9vbUF2YXRhciByb29tPXtyb29tfSBoZWlnaHQ9ezUwfSB3aWR0aD17NTB9IHZpZXdBdmF0YXJPbkNsaWNrIC8+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21QcmV2aWV3Q2FyZF92aWRlb1wiIC8+XG4gICAgICAgIDwvPjtcbiAgICB9IGVsc2UgaWYgKHJvb20uaXNTcGFjZVJvb20oKSkge1xuICAgICAgICBhdmF0YXJSb3cgPSA8Um9vbUF2YXRhciByb29tPXtyb29tfSBoZWlnaHQ9ezgwfSB3aWR0aD17ODB9IHZpZXdBdmF0YXJPbkNsaWNrIC8+O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGF2YXRhclJvdyA9IDxSb29tQXZhdGFyIHJvb209e3Jvb219IGhlaWdodD17NTB9IHdpZHRoPXs1MH0gdmlld0F2YXRhck9uQ2xpY2sgLz47XG4gICAgfVxuXG4gICAgbGV0IG5vdGljZTogc3RyaW5nO1xuICAgIGlmIChjYW5ub3RKb2luKSB7XG4gICAgICAgIG5vdGljZSA9IF90KFwiVG8gdmlldyAlKHJvb21OYW1lKXMsIHlvdSBuZWVkIGFuIGludml0ZVwiLCB7XG4gICAgICAgICAgICByb29tTmFtZTogcm9vbS5uYW1lLFxuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKHJvb20uaXNFbGVtZW50VmlkZW9Sb29tKCkgJiYgIXZpZGVvUm9vbXNFbmFibGVkKSB7XG4gICAgICAgIG5vdGljZSA9IG15TWVtYmVyc2hpcCA9PT0gXCJqb2luXCJcbiAgICAgICAgICAgID8gX3QoXCJUbyB2aWV3LCBwbGVhc2UgZW5hYmxlIHZpZGVvIHJvb21zIGluIExhYnMgZmlyc3RcIilcbiAgICAgICAgICAgIDogX3QoXCJUbyBqb2luLCBwbGVhc2UgZW5hYmxlIHZpZGVvIHJvb21zIGluIExhYnMgZmlyc3RcIik7XG5cbiAgICAgICAgam9pbkJ1dHRvbnMgPSA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwicHJpbWFyeVwiIG9uQ2xpY2s9e3ZpZXdMYWJzfT5cbiAgICAgICAgICAgIHsgX3QoXCJTaG93IExhYnMgc2V0dGluZ3NcIikgfVxuICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+O1xuICAgIH1cblxuICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21QcmV2aWV3Q2FyZFwiPlxuICAgICAgICB7IGludml0ZXJTZWN0aW9uIH1cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tUHJldmlld0NhcmRfYXZhdGFyXCI+XG4gICAgICAgICAgICB7IGF2YXRhclJvdyB9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8aDEgY2xhc3NOYW1lPVwibXhfUm9vbVByZXZpZXdDYXJkX25hbWVcIj5cbiAgICAgICAgICAgIDxSb29tTmFtZSByb29tPXtyb29tfSAvPlxuICAgICAgICA8L2gxPlxuICAgICAgICA8Um9vbUluZm9MaW5lIHJvb209e3Jvb219IC8+XG4gICAgICAgIDxSb29tVG9waWMgcm9vbT17cm9vbX0gY2xhc3NOYW1lPVwibXhfUm9vbVByZXZpZXdDYXJkX3RvcGljXCIgLz5cbiAgICAgICAgeyByb29tLmdldEpvaW5SdWxlKCkgPT09IFwicHVibGljXCIgJiYgPFJvb21GYWNlUGlsZSByb29tPXtyb29tfSAvPiB9XG4gICAgICAgIHsgbm90aWNlID8gPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tUHJldmlld0NhcmRfbm90aWNlXCI+XG4gICAgICAgICAgICB7IG5vdGljZSB9XG4gICAgICAgIDwvZGl2PiA6IG51bGwgfVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21QcmV2aWV3Q2FyZF9qb2luQnV0dG9uc1wiPlxuICAgICAgICAgICAgeyBqb2luQnV0dG9ucyB9XG4gICAgICAgIDwvZGl2PlxuICAgIDwvZGl2Pjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFJvb21QcmV2aWV3Q2FyZDtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUF0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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