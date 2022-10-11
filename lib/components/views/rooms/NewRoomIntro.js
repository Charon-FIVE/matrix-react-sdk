"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _event = require("matrix-js-sdk/src/@types/event");

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _RoomContext = _interopRequireDefault(require("../../../contexts/RoomContext"));

var _DMRoomMap = _interopRequireDefault(require("../../../utils/DMRoomMap"));

var _languageHandler = require("../../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _MiniAvatarUploader = _interopRequireWildcard(require("../elements/MiniAvatarUploader"));

var _RoomAvatar = _interopRequireDefault(require("../avatars/RoomAvatar"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _actions = require("../../../dispatcher/actions");

var _SpaceStore = _interopRequireDefault(require("../../../stores/spaces/SpaceStore"));

var _space = require("../../../utils/space");

var _EventTileBubble = _interopRequireDefault(require("../messages/EventTileBubble"));

var _RoomSettingsDialog = require("../dialogs/RoomSettingsDialog");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _UIComponents = require("../../../customisations/helpers/UIComponents");

var _UIFeature = require("../../../settings/UIFeature");

var _rooms = require("../../../utils/rooms");

var _LocalRoom = require("../../../models/LocalRoom");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2020, 2021 The Matrix.org Foundation C.I.C.

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
function hasExpectedEncryptionSettings(matrixClient, room) {
  const isEncrypted = matrixClient.isRoomEncrypted(room.roomId);
  const isPublic = room.getJoinRule() === "public";
  return isPublic || !(0, _rooms.privateShouldBeEncrypted)() || isEncrypted;
}

const NewRoomIntro = () => {
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const {
    room,
    roomId
  } = (0, _react.useContext)(_RoomContext.default);
  const isLocalRoom = room instanceof _LocalRoom.LocalRoom;
  const dmPartner = isLocalRoom ? room.targets[0]?.userId : _DMRoomMap.default.shared().getUserIdForRoomId(roomId);
  let body;

  if (dmPartner) {
    let introMessage = (0, _languageHandler._t)("This is the beginning of your direct message history with <displayName/>.");
    let caption;

    if (isLocalRoom) {
      introMessage = (0, _languageHandler._t)("Send your first message to invite <displayName/> to chat");
    } else if (room.getJoinedMemberCount() + room.getInvitedMemberCount() === 2) {
      caption = (0, _languageHandler._t)("Only the two of you are in this conversation, unless either of you invites anyone to join.");
    }

    const member = room?.getMember(dmPartner);
    const displayName = room?.name || member?.rawDisplayName || dmPartner;
    body = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
      room: room,
      width: _MiniAvatarUploader.AVATAR_SIZE,
      height: _MiniAvatarUploader.AVATAR_SIZE,
      onClick: () => {
        _dispatcher.default.dispatch({
          action: _actions.Action.ViewUser,
          // XXX: We should be using a real member object and not assuming what the receiver wants.
          member: member || {
            userId: dmPartner
          }
        });
      }
    }), /*#__PURE__*/_react.default.createElement("h2", null, room.name), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)(introMessage, {}, {
      displayName: () => /*#__PURE__*/_react.default.createElement("b", null, displayName)
    })), caption && /*#__PURE__*/_react.default.createElement("p", null, caption));
  } else {
    const inRoom = room && room.getMyMembership() === "join";
    const topic = room.currentState.getStateEvents(_event.EventType.RoomTopic, "")?.getContent()?.topic;
    const canAddTopic = inRoom && room.currentState.maySendStateEvent(_event.EventType.RoomTopic, cli.getUserId());

    const onTopicClick = () => {
      _dispatcher.default.dispatch({
        action: "open_room_settings",
        room_id: roomId
      }, true); // focus the topic field to help the user find it as it'll gain an outline


      setImmediate(() => {
        window.document.getElementById("profileTopic").focus();
      });
    };

    let topicText;

    if (canAddTopic && topic) {
      topicText = (0, _languageHandler._t)("Topic: %(topic)s (<a>edit</a>)", {
        topic
      }, {
        a: sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          kind: "link_inline",
          onClick: onTopicClick
        }, sub)
      });
    } else if (topic) {
      topicText = (0, _languageHandler._t)("Topic: %(topic)s ", {
        topic
      });
    } else if (canAddTopic) {
      topicText = (0, _languageHandler._t)("<a>Add a topic</a> to help people know what it is about.", {}, {
        a: sub => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          kind: "link_inline",
          onClick: onTopicClick
        }, sub)
      });
    }

    const creator = room.currentState.getStateEvents(_event.EventType.RoomCreate, "")?.getSender();
    const creatorName = room?.getMember(creator)?.rawDisplayName || creator;
    let createdText;

    if (creator === cli.getUserId()) {
      createdText = (0, _languageHandler._t)("You created this room.");
    } else {
      createdText = (0, _languageHandler._t)("%(displayName)s created this room.", {
        displayName: creatorName
      });
    }

    let parentSpace;

    if (_SpaceStore.default.instance.activeSpaceRoom?.canInvite(cli.getUserId()) && _SpaceStore.default.instance.isRoomInSpace(_SpaceStore.default.instance.activeSpace, room.roomId)) {
      parentSpace = _SpaceStore.default.instance.activeSpaceRoom;
    }

    let buttons;

    if (parentSpace && (0, _UIComponents.shouldShowComponent)(_UIFeature.UIComponent.InviteUsers)) {
      buttons = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_NewRoomIntro_buttons"
      }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_NewRoomIntro_inviteButton",
        kind: "primary",
        onClick: () => {
          (0, _space.showSpaceInvite)(parentSpace);
        }
      }, (0, _languageHandler._t)("Invite to %(spaceName)s", {
        spaceName: parentSpace.name
      })), room.canInvite(cli.getUserId()) && /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_NewRoomIntro_inviteButton",
        kind: "primary_outline",
        onClick: () => {
          _dispatcher.default.dispatch({
            action: "view_invite",
            roomId
          });
        }
      }, (0, _languageHandler._t)("Invite to just this room")));
    } else if (room.canInvite(cli.getUserId()) && (0, _UIComponents.shouldShowComponent)(_UIFeature.UIComponent.InviteUsers)) {
      buttons = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_NewRoomIntro_buttons"
      }, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_NewRoomIntro_inviteButton",
        kind: "primary",
        onClick: () => {
          _dispatcher.default.dispatch({
            action: "view_invite",
            roomId
          });
        }
      }, (0, _languageHandler._t)("Invite to this room")));
    }

    const avatarUrl = room.currentState.getStateEvents(_event.EventType.RoomAvatar, "")?.getContent()?.url;
    body = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_MiniAvatarUploader.default, {
      hasAvatar: !!avatarUrl,
      noAvatarLabel: (0, _languageHandler._t)("Add a photo, so people can easily spot your room."),
      setAvatarUrl: url => cli.sendStateEvent(roomId, _event.EventType.RoomAvatar, {
        url
      }, '')
    }, /*#__PURE__*/_react.default.createElement(_RoomAvatar.default, {
      room: room,
      width: _MiniAvatarUploader.AVATAR_SIZE,
      height: _MiniAvatarUploader.AVATAR_SIZE,
      viewAvatarOnClick: true
    })), /*#__PURE__*/_react.default.createElement("h2", null, room.name), /*#__PURE__*/_react.default.createElement("p", null, createdText, " ", (0, _languageHandler._t)("This is the start of <roomName/>.", {}, {
      roomName: () => /*#__PURE__*/_react.default.createElement("b", null, room.name)
    })), /*#__PURE__*/_react.default.createElement("p", null, topicText), buttons);
  }

  function openRoomSettings(event) {
    event.preventDefault();

    _dispatcher.default.dispatch({
      action: "open_room_settings",
      initial_tab_id: _RoomSettingsDialog.ROOM_SECURITY_TAB
    });
  }

  const subText = (0, _languageHandler._t)("Your private messages are normally encrypted, but this room isn't. " + "Usually this is due to an unsupported device or method being used, " + "like email invites.");
  let subButton;

  if (room.currentState.mayClientSendStateEvent(_event.EventType.RoomEncryption, _MatrixClientPeg.MatrixClientPeg.get()) && !isLocalRoom) {
    subButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "link_inline",
      onClick: openRoomSettings
    }, (0, _languageHandler._t)("Enable encryption in settings."));
  }

  const subtitle = /*#__PURE__*/_react.default.createElement("span", null, " ", subText, " ", subButton, " ");

  return /*#__PURE__*/_react.default.createElement("li", {
    className: "mx_NewRoomIntro"
  }, !hasExpectedEncryptionSettings(cli, room) && /*#__PURE__*/_react.default.createElement(_EventTileBubble.default, {
    className: "mx_cryptoEvent mx_cryptoEvent_icon_warning",
    title: (0, _languageHandler._t)("End-to-end encryption isn't enabled"),
    subtitle: subtitle
  }), body);
};

var _default = NewRoomIntro;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJoYXNFeHBlY3RlZEVuY3J5cHRpb25TZXR0aW5ncyIsIm1hdHJpeENsaWVudCIsInJvb20iLCJpc0VuY3J5cHRlZCIsImlzUm9vbUVuY3J5cHRlZCIsInJvb21JZCIsImlzUHVibGljIiwiZ2V0Sm9pblJ1bGUiLCJwcml2YXRlU2hvdWxkQmVFbmNyeXB0ZWQiLCJOZXdSb29tSW50cm8iLCJjbGkiLCJ1c2VDb250ZXh0IiwiTWF0cml4Q2xpZW50Q29udGV4dCIsIlJvb21Db250ZXh0IiwiaXNMb2NhbFJvb20iLCJMb2NhbFJvb20iLCJkbVBhcnRuZXIiLCJ0YXJnZXRzIiwidXNlcklkIiwiRE1Sb29tTWFwIiwic2hhcmVkIiwiZ2V0VXNlcklkRm9yUm9vbUlkIiwiYm9keSIsImludHJvTWVzc2FnZSIsIl90IiwiY2FwdGlvbiIsImdldEpvaW5lZE1lbWJlckNvdW50IiwiZ2V0SW52aXRlZE1lbWJlckNvdW50IiwibWVtYmVyIiwiZ2V0TWVtYmVyIiwiZGlzcGxheU5hbWUiLCJuYW1lIiwicmF3RGlzcGxheU5hbWUiLCJBVkFUQVJfU0laRSIsImRlZmF1bHREaXNwYXRjaGVyIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJBY3Rpb24iLCJWaWV3VXNlciIsImluUm9vbSIsImdldE15TWVtYmVyc2hpcCIsInRvcGljIiwiY3VycmVudFN0YXRlIiwiZ2V0U3RhdGVFdmVudHMiLCJFdmVudFR5cGUiLCJSb29tVG9waWMiLCJnZXRDb250ZW50IiwiY2FuQWRkVG9waWMiLCJtYXlTZW5kU3RhdGVFdmVudCIsImdldFVzZXJJZCIsIm9uVG9waWNDbGljayIsInJvb21faWQiLCJzZXRJbW1lZGlhdGUiLCJ3aW5kb3ciLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwiZm9jdXMiLCJ0b3BpY1RleHQiLCJhIiwic3ViIiwiY3JlYXRvciIsIlJvb21DcmVhdGUiLCJnZXRTZW5kZXIiLCJjcmVhdG9yTmFtZSIsImNyZWF0ZWRUZXh0IiwicGFyZW50U3BhY2UiLCJTcGFjZVN0b3JlIiwiaW5zdGFuY2UiLCJhY3RpdmVTcGFjZVJvb20iLCJjYW5JbnZpdGUiLCJpc1Jvb21JblNwYWNlIiwiYWN0aXZlU3BhY2UiLCJidXR0b25zIiwic2hvdWxkU2hvd0NvbXBvbmVudCIsIlVJQ29tcG9uZW50IiwiSW52aXRlVXNlcnMiLCJzaG93U3BhY2VJbnZpdGUiLCJzcGFjZU5hbWUiLCJhdmF0YXJVcmwiLCJSb29tQXZhdGFyIiwidXJsIiwic2VuZFN0YXRlRXZlbnQiLCJyb29tTmFtZSIsIm9wZW5Sb29tU2V0dGluZ3MiLCJldmVudCIsInByZXZlbnREZWZhdWx0IiwiaW5pdGlhbF90YWJfaWQiLCJST09NX1NFQ1VSSVRZX1RBQiIsInN1YlRleHQiLCJzdWJCdXR0b24iLCJtYXlDbGllbnRTZW5kU3RhdGVFdmVudCIsIlJvb21FbmNyeXB0aW9uIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0Iiwic3VidGl0bGUiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9yb29tcy9OZXdSb29tSW50cm8udHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCwgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyB1c2VDb250ZXh0IH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBFdmVudFR5cGUgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL2V2ZW50XCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY2xpZW50XCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQgeyBVc2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy91c2VyXCI7XG5cbmltcG9ydCBNYXRyaXhDbGllbnRDb250ZXh0IGZyb20gXCIuLi8uLi8uLi9jb250ZXh0cy9NYXRyaXhDbGllbnRDb250ZXh0XCI7XG5pbXBvcnQgUm9vbUNvbnRleHQgZnJvbSBcIi4uLy4uLy4uL2NvbnRleHRzL1Jvb21Db250ZXh0XCI7XG5pbXBvcnQgRE1Sb29tTWFwIGZyb20gXCIuLi8uLi8uLi91dGlscy9ETVJvb21NYXBcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBNaW5pQXZhdGFyVXBsb2FkZXIsIHsgQVZBVEFSX1NJWkUgfSBmcm9tIFwiLi4vZWxlbWVudHMvTWluaUF2YXRhclVwbG9hZGVyXCI7XG5pbXBvcnQgUm9vbUF2YXRhciBmcm9tIFwiLi4vYXZhdGFycy9Sb29tQXZhdGFyXCI7XG5pbXBvcnQgZGVmYXVsdERpc3BhdGNoZXIgZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHsgVmlld1VzZXJQYXlsb2FkIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvcGF5bG9hZHMvVmlld1VzZXJQYXlsb2FkXCI7XG5pbXBvcnQgeyBBY3Rpb24gfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQgU3BhY2VTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL3NwYWNlcy9TcGFjZVN0b3JlXCI7XG5pbXBvcnQgeyBzaG93U3BhY2VJbnZpdGUgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvc3BhY2VcIjtcbmltcG9ydCBFdmVudFRpbGVCdWJibGUgZnJvbSBcIi4uL21lc3NhZ2VzL0V2ZW50VGlsZUJ1YmJsZVwiO1xuaW1wb3J0IHsgUk9PTV9TRUNVUklUWV9UQUIgfSBmcm9tIFwiLi4vZGlhbG9ncy9Sb29tU2V0dGluZ3NEaWFsb2dcIjtcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gXCIuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCB7IHNob3VsZFNob3dDb21wb25lbnQgfSBmcm9tIFwiLi4vLi4vLi4vY3VzdG9taXNhdGlvbnMvaGVscGVycy9VSUNvbXBvbmVudHNcIjtcbmltcG9ydCB7IFVJQ29tcG9uZW50IH0gZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1VJRmVhdHVyZVwiO1xuaW1wb3J0IHsgcHJpdmF0ZVNob3VsZEJlRW5jcnlwdGVkIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3Jvb21zXCI7XG5pbXBvcnQgeyBMb2NhbFJvb20gfSBmcm9tIFwiLi4vLi4vLi4vbW9kZWxzL0xvY2FsUm9vbVwiO1xuXG5mdW5jdGlvbiBoYXNFeHBlY3RlZEVuY3J5cHRpb25TZXR0aW5ncyhtYXRyaXhDbGllbnQ6IE1hdHJpeENsaWVudCwgcm9vbTogUm9vbSk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGlzRW5jcnlwdGVkOiBib29sZWFuID0gbWF0cml4Q2xpZW50LmlzUm9vbUVuY3J5cHRlZChyb29tLnJvb21JZCk7XG4gICAgY29uc3QgaXNQdWJsaWM6IGJvb2xlYW4gPSByb29tLmdldEpvaW5SdWxlKCkgPT09IFwicHVibGljXCI7XG4gICAgcmV0dXJuIGlzUHVibGljIHx8ICFwcml2YXRlU2hvdWxkQmVFbmNyeXB0ZWQoKSB8fCBpc0VuY3J5cHRlZDtcbn1cblxuY29uc3QgTmV3Um9vbUludHJvID0gKCkgPT4ge1xuICAgIGNvbnN0IGNsaSA9IHVzZUNvbnRleHQoTWF0cml4Q2xpZW50Q29udGV4dCk7XG4gICAgY29uc3QgeyByb29tLCByb29tSWQgfSA9IHVzZUNvbnRleHQoUm9vbUNvbnRleHQpO1xuXG4gICAgY29uc3QgaXNMb2NhbFJvb20gPSByb29tIGluc3RhbmNlb2YgTG9jYWxSb29tO1xuICAgIGNvbnN0IGRtUGFydG5lciA9IGlzTG9jYWxSb29tXG4gICAgICAgID8gcm9vbS50YXJnZXRzWzBdPy51c2VySWRcbiAgICAgICAgOiBETVJvb21NYXAuc2hhcmVkKCkuZ2V0VXNlcklkRm9yUm9vbUlkKHJvb21JZCk7XG5cbiAgICBsZXQgYm9keTogSlNYLkVsZW1lbnQ7XG4gICAgaWYgKGRtUGFydG5lcikge1xuICAgICAgICBsZXQgaW50cm9NZXNzYWdlID0gX3QoXCJUaGlzIGlzIHRoZSBiZWdpbm5pbmcgb2YgeW91ciBkaXJlY3QgbWVzc2FnZSBoaXN0b3J5IHdpdGggPGRpc3BsYXlOYW1lLz4uXCIpO1xuICAgICAgICBsZXQgY2FwdGlvbjogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG4gICAgICAgIGlmIChpc0xvY2FsUm9vbSkge1xuICAgICAgICAgICAgaW50cm9NZXNzYWdlID0gX3QoXCJTZW5kIHlvdXIgZmlyc3QgbWVzc2FnZSB0byBpbnZpdGUgPGRpc3BsYXlOYW1lLz4gdG8gY2hhdFwiKTtcbiAgICAgICAgfSBlbHNlIGlmICgocm9vbS5nZXRKb2luZWRNZW1iZXJDb3VudCgpICsgcm9vbS5nZXRJbnZpdGVkTWVtYmVyQ291bnQoKSkgPT09IDIpIHtcbiAgICAgICAgICAgIGNhcHRpb24gPSBfdChcIk9ubHkgdGhlIHR3byBvZiB5b3UgYXJlIGluIHRoaXMgY29udmVyc2F0aW9uLCB1bmxlc3MgZWl0aGVyIG9mIHlvdSBpbnZpdGVzIGFueW9uZSB0byBqb2luLlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG1lbWJlciA9IHJvb20/LmdldE1lbWJlcihkbVBhcnRuZXIpO1xuICAgICAgICBjb25zdCBkaXNwbGF5TmFtZSA9IHJvb20/Lm5hbWUgfHwgbWVtYmVyPy5yYXdEaXNwbGF5TmFtZSB8fCBkbVBhcnRuZXI7XG4gICAgICAgIGJvZHkgPSA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICA8Um9vbUF2YXRhclxuICAgICAgICAgICAgICAgIHJvb209e3Jvb219XG4gICAgICAgICAgICAgICAgd2lkdGg9e0FWQVRBUl9TSVpFfVxuICAgICAgICAgICAgICAgIGhlaWdodD17QVZBVEFSX1NJWkV9XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci5kaXNwYXRjaDxWaWV3VXNlclBheWxvYWQ+KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogQWN0aW9uLlZpZXdVc2VyLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gWFhYOiBXZSBzaG91bGQgYmUgdXNpbmcgYSByZWFsIG1lbWJlciBvYmplY3QgYW5kIG5vdCBhc3N1bWluZyB3aGF0IHRoZSByZWNlaXZlciB3YW50cy5cbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbWJlcjogbWVtYmVyIHx8IHsgdXNlcklkOiBkbVBhcnRuZXIgfSBhcyBVc2VyLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgLz5cblxuICAgICAgICAgICAgPGgyPnsgcm9vbS5uYW1lIH08L2gyPlxuXG4gICAgICAgICAgICA8cD57IF90KGludHJvTWVzc2FnZSwge30sIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogKCkgPT4gPGI+eyBkaXNwbGF5TmFtZSB9PC9iPixcbiAgICAgICAgICAgIH0pIH08L3A+XG4gICAgICAgICAgICB7IGNhcHRpb24gJiYgPHA+eyBjYXB0aW9uIH08L3A+IH1cbiAgICAgICAgPC9SZWFjdC5GcmFnbWVudD47XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgaW5Sb29tID0gcm9vbSAmJiByb29tLmdldE15TWVtYmVyc2hpcCgpID09PSBcImpvaW5cIjtcbiAgICAgICAgY29uc3QgdG9waWMgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhFdmVudFR5cGUuUm9vbVRvcGljLCBcIlwiKT8uZ2V0Q29udGVudCgpPy50b3BpYztcbiAgICAgICAgY29uc3QgY2FuQWRkVG9waWMgPSBpblJvb20gJiYgcm9vbS5jdXJyZW50U3RhdGUubWF5U2VuZFN0YXRlRXZlbnQoRXZlbnRUeXBlLlJvb21Ub3BpYywgY2xpLmdldFVzZXJJZCgpKTtcblxuICAgICAgICBjb25zdCBvblRvcGljQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiBcIm9wZW5fcm9vbV9zZXR0aW5nc1wiLFxuICAgICAgICAgICAgICAgIHJvb21faWQ6IHJvb21JZCxcbiAgICAgICAgICAgIH0sIHRydWUpO1xuICAgICAgICAgICAgLy8gZm9jdXMgdGhlIHRvcGljIGZpZWxkIHRvIGhlbHAgdGhlIHVzZXIgZmluZCBpdCBhcyBpdCdsbCBnYWluIGFuIG91dGxpbmVcbiAgICAgICAgICAgIHNldEltbWVkaWF0ZSgoKSA9PiB7XG4gICAgICAgICAgICAgICAgd2luZG93LmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJvZmlsZVRvcGljXCIpLmZvY3VzKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBsZXQgdG9waWNUZXh0O1xuICAgICAgICBpZiAoY2FuQWRkVG9waWMgJiYgdG9waWMpIHtcbiAgICAgICAgICAgIHRvcGljVGV4dCA9IF90KFwiVG9waWM6ICUodG9waWMpcyAoPGE+ZWRpdDwvYT4pXCIsIHsgdG9waWMgfSwge1xuICAgICAgICAgICAgICAgIGE6IHN1YiA9PiA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwibGlua19pbmxpbmVcIiBvbkNsaWNrPXtvblRvcGljQ2xpY2t9Pnsgc3ViIH08L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodG9waWMpIHtcbiAgICAgICAgICAgIHRvcGljVGV4dCA9IF90KFwiVG9waWM6ICUodG9waWMpcyBcIiwgeyB0b3BpYyB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChjYW5BZGRUb3BpYykge1xuICAgICAgICAgICAgdG9waWNUZXh0ID0gX3QoXCI8YT5BZGQgYSB0b3BpYzwvYT4gdG8gaGVscCBwZW9wbGUga25vdyB3aGF0IGl0IGlzIGFib3V0LlwiLCB7fSwge1xuICAgICAgICAgICAgICAgIGE6IHN1YiA9PiA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwibGlua19pbmxpbmVcIiBvbkNsaWNrPXtvblRvcGljQ2xpY2t9Pnsgc3ViIH08L0FjY2Vzc2libGVCdXR0b24+LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjcmVhdG9yID0gcm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoRXZlbnRUeXBlLlJvb21DcmVhdGUsIFwiXCIpPy5nZXRTZW5kZXIoKTtcbiAgICAgICAgY29uc3QgY3JlYXRvck5hbWUgPSByb29tPy5nZXRNZW1iZXIoY3JlYXRvcik/LnJhd0Rpc3BsYXlOYW1lIHx8IGNyZWF0b3I7XG5cbiAgICAgICAgbGV0IGNyZWF0ZWRUZXh0O1xuICAgICAgICBpZiAoY3JlYXRvciA9PT0gY2xpLmdldFVzZXJJZCgpKSB7XG4gICAgICAgICAgICBjcmVhdGVkVGV4dCA9IF90KFwiWW91IGNyZWF0ZWQgdGhpcyByb29tLlwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNyZWF0ZWRUZXh0ID0gX3QoXCIlKGRpc3BsYXlOYW1lKXMgY3JlYXRlZCB0aGlzIHJvb20uXCIsIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5TmFtZTogY3JlYXRvck5hbWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwYXJlbnRTcGFjZTogUm9vbTtcbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgU3BhY2VTdG9yZS5pbnN0YW5jZS5hY3RpdmVTcGFjZVJvb20/LmNhbkludml0ZShjbGkuZ2V0VXNlcklkKCkpICYmXG4gICAgICAgICAgICBTcGFjZVN0b3JlLmluc3RhbmNlLmlzUm9vbUluU3BhY2UoU3BhY2VTdG9yZS5pbnN0YW5jZS5hY3RpdmVTcGFjZSwgcm9vbS5yb29tSWQpXG4gICAgICAgICkge1xuICAgICAgICAgICAgcGFyZW50U3BhY2UgPSBTcGFjZVN0b3JlLmluc3RhbmNlLmFjdGl2ZVNwYWNlUm9vbTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBidXR0b25zO1xuICAgICAgICBpZiAocGFyZW50U3BhY2UgJiYgc2hvdWxkU2hvd0NvbXBvbmVudChVSUNvbXBvbmVudC5JbnZpdGVVc2VycykpIHtcbiAgICAgICAgICAgIGJ1dHRvbnMgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X05ld1Jvb21JbnRyb19idXR0b25zXCI+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTmV3Um9vbUludHJvX2ludml0ZUJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2hvd1NwYWNlSW52aXRlKHBhcmVudFNwYWNlKTtcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJJbnZpdGUgdG8gJShzcGFjZU5hbWUpc1wiLCB7IHNwYWNlTmFtZTogcGFyZW50U3BhY2UubmFtZSB9KSB9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgIHsgcm9vbS5jYW5JbnZpdGUoY2xpLmdldFVzZXJJZCgpKSAmJiA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9OZXdSb29tSW50cm9faW52aXRlQnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAga2luZD1cInByaW1hcnlfb3V0bGluZVwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHREaXNwYXRjaGVyLmRpc3BhdGNoKHsgYWN0aW9uOiBcInZpZXdfaW52aXRlXCIsIHJvb21JZCB9KTtcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoXCJJbnZpdGUgdG8ganVzdCB0aGlzIHJvb21cIikgfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4gfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9IGVsc2UgaWYgKHJvb20uY2FuSW52aXRlKGNsaS5nZXRVc2VySWQoKSkgJiYgc2hvdWxkU2hvd0NvbXBvbmVudChVSUNvbXBvbmVudC5JbnZpdGVVc2VycykpIHtcbiAgICAgICAgICAgIGJ1dHRvbnMgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X05ld1Jvb21JbnRyb19idXR0b25zXCI+XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTmV3Um9vbUludHJvX2ludml0ZUJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgIGtpbmQ9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZGlzcGF0Y2goeyBhY3Rpb246IFwidmlld19pbnZpdGVcIiwgcm9vbUlkIH0pO1xuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIkludml0ZSB0byB0aGlzIHJvb21cIikgfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGF2YXRhclVybCA9IHJvb20uY3VycmVudFN0YXRlLmdldFN0YXRlRXZlbnRzKEV2ZW50VHlwZS5Sb29tQXZhdGFyLCBcIlwiKT8uZ2V0Q29udGVudCgpPy51cmw7XG4gICAgICAgIGJvZHkgPSA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgICAgICA8TWluaUF2YXRhclVwbG9hZGVyXG4gICAgICAgICAgICAgICAgaGFzQXZhdGFyPXshIWF2YXRhclVybH1cbiAgICAgICAgICAgICAgICBub0F2YXRhckxhYmVsPXtfdChcIkFkZCBhIHBob3RvLCBzbyBwZW9wbGUgY2FuIGVhc2lseSBzcG90IHlvdXIgcm9vbS5cIil9XG4gICAgICAgICAgICAgICAgc2V0QXZhdGFyVXJsPXt1cmwgPT4gY2xpLnNlbmRTdGF0ZUV2ZW50KHJvb21JZCwgRXZlbnRUeXBlLlJvb21BdmF0YXIsIHsgdXJsIH0sICcnKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8Um9vbUF2YXRhciByb29tPXtyb29tfSB3aWR0aD17QVZBVEFSX1NJWkV9IGhlaWdodD17QVZBVEFSX1NJWkV9IHZpZXdBdmF0YXJPbkNsaWNrPXt0cnVlfSAvPlxuICAgICAgICAgICAgPC9NaW5pQXZhdGFyVXBsb2FkZXI+XG5cbiAgICAgICAgICAgIDxoMj57IHJvb20ubmFtZSB9PC9oMj5cblxuICAgICAgICAgICAgPHA+eyBjcmVhdGVkVGV4dCB9IHsgX3QoXCJUaGlzIGlzIHRoZSBzdGFydCBvZiA8cm9vbU5hbWUvPi5cIiwge30sIHtcbiAgICAgICAgICAgICAgICByb29tTmFtZTogKCkgPT4gPGI+eyByb29tLm5hbWUgfTwvYj4sXG4gICAgICAgICAgICB9KSB9PC9wPlxuICAgICAgICAgICAgPHA+eyB0b3BpY1RleHQgfTwvcD5cbiAgICAgICAgICAgIHsgYnV0dG9ucyB9XG4gICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9wZW5Sb29tU2V0dGluZ3MoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZGVmYXVsdERpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiBcIm9wZW5fcm9vbV9zZXR0aW5nc1wiLFxuICAgICAgICAgICAgaW5pdGlhbF90YWJfaWQ6IFJPT01fU0VDVVJJVFlfVEFCLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBzdWJUZXh0ID0gX3QoXG4gICAgICAgIFwiWW91ciBwcml2YXRlIG1lc3NhZ2VzIGFyZSBub3JtYWxseSBlbmNyeXB0ZWQsIGJ1dCB0aGlzIHJvb20gaXNuJ3QuIFwiK1xuICAgICAgICBcIlVzdWFsbHkgdGhpcyBpcyBkdWUgdG8gYW4gdW5zdXBwb3J0ZWQgZGV2aWNlIG9yIG1ldGhvZCBiZWluZyB1c2VkLCBcIiArXG4gICAgICAgIFwibGlrZSBlbWFpbCBpbnZpdGVzLlwiLFxuICAgICk7XG5cbiAgICBsZXQgc3ViQnV0dG9uO1xuICAgIGlmIChyb29tLmN1cnJlbnRTdGF0ZS5tYXlDbGllbnRTZW5kU3RhdGVFdmVudChFdmVudFR5cGUuUm9vbUVuY3J5cHRpb24sIE1hdHJpeENsaWVudFBlZy5nZXQoKSkgJiYgIWlzTG9jYWxSb29tKSB7XG4gICAgICAgIHN1YkJ1dHRvbiA9IChcbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9J2xpbmtfaW5saW5lJyBvbkNsaWNrPXtvcGVuUm9vbVNldHRpbmdzfT57IF90KFwiRW5hYmxlIGVuY3J5cHRpb24gaW4gc2V0dGluZ3MuXCIpIH08L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3Qgc3VidGl0bGUgPSAoXG4gICAgICAgIDxzcGFuPiB7IHN1YlRleHQgfSB7IHN1YkJ1dHRvbiB9IDwvc3Bhbj5cbiAgICApO1xuXG4gICAgcmV0dXJuIDxsaSBjbGFzc05hbWU9XCJteF9OZXdSb29tSW50cm9cIj5cbiAgICAgICAgeyAhaGFzRXhwZWN0ZWRFbmNyeXB0aW9uU2V0dGluZ3MoY2xpLCByb29tKSAmJiAoXG4gICAgICAgICAgICA8RXZlbnRUaWxlQnViYmxlXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfY3J5cHRvRXZlbnQgbXhfY3J5cHRvRXZlbnRfaWNvbl93YXJuaW5nXCJcbiAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJFbmQtdG8tZW5kIGVuY3J5cHRpb24gaXNuJ3QgZW5hYmxlZFwiKX1cbiAgICAgICAgICAgICAgICBzdWJ0aXRsZT17c3VidGl0bGV9XG4gICAgICAgICAgICAvPlxuICAgICAgICApIH1cblxuICAgICAgICB7IGJvZHkgfVxuICAgIDwvbGk+O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgTmV3Um9vbUludHJvO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBS0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FB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