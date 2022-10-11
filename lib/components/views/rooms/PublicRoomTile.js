"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PublicRoomTile = void 0;

var _react = _interopRequireWildcard(require("react"));

var _BaseAvatar = _interopRequireDefault(require("../avatars/BaseAvatar"));

var _Media = require("../../../customisations/Media");

var _HtmlUtils = require("../../../HtmlUtils");

var _RoomDirectory = require("../../structures/RoomDirectory");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _languageHandler = require("../../../languageHandler");

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
const MAX_NAME_LENGTH = 80;
const MAX_TOPIC_LENGTH = 800;

const PublicRoomTile = _ref => {
  let {
    room,
    showRoom,
    removeFromDirectory
  } = _ref;
  const client = (0, _react.useContext)(_MatrixClientContext.default);
  const [avatarUrl, setAvatarUrl] = (0, _react.useState)(null);
  const [name, setName] = (0, _react.useState)("");
  const [topic, setTopic] = (0, _react.useState)("");
  const [hasJoinedRoom, setHasJoinedRoom] = (0, _react.useState)(false);
  const isGuest = client.isGuest();
  (0, _react.useEffect)(() => {
    const clientRoom = client.getRoom(room.room_id);
    setHasJoinedRoom(clientRoom?.getMyMembership() === "join");
    let name = room.name || (0, _RoomDirectory.getDisplayAliasForRoom)(room) || (0, _languageHandler._t)('Unnamed room');

    if (name.length > MAX_NAME_LENGTH) {
      name = `${name.substring(0, MAX_NAME_LENGTH)}...`;
    }

    setName(name);
    let topic = room.topic || ''; // Additional truncation based on line numbers is done via CSS,
    // but to ensure that the DOM is not polluted with a huge string
    // we give it a hard limit before rendering.

    if (topic.length > MAX_TOPIC_LENGTH) {
      topic = `${topic.substring(0, MAX_TOPIC_LENGTH)}...`;
    }

    topic = (0, _HtmlUtils.linkifyAndSanitizeHtml)(topic);
    setTopic(topic);

    if (room.avatar_url) {
      setAvatarUrl((0, _Media.mediaFromMxc)(room.avatar_url).getSquareThumbnailHttp(32));
    }
  }, [room, client]);
  const onRoomClicked = (0, _react.useCallback)(ev => {
    // If room was shift-clicked, remove it from the room directory
    if (ev.shiftKey) {
      ev.preventDefault();
      removeFromDirectory?.(room);
    }
  }, [room, removeFromDirectory]);
  const onPreviewClick = (0, _react.useCallback)(ev => {
    showRoom(room, null, false, true);
    ev.stopPropagation();
  }, [room, showRoom]);
  const onViewClick = (0, _react.useCallback)(ev => {
    showRoom(room);
    ev.stopPropagation();
  }, [room, showRoom]);
  const onJoinClick = (0, _react.useCallback)(ev => {
    showRoom(room, null, true);
    ev.stopPropagation();
  }, [room, showRoom]);
  let previewButton;
  let joinOrViewButton; // Element Web currently does not allow guests to join rooms, so we
  // instead show them preview buttons for all rooms. If the room is not
  // world readable, a modal will appear asking you to register first. If
  // it is readable, the preview appears as normal.

  if (!hasJoinedRoom && (room.world_readable || isGuest)) {
    previewButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "secondary",
      onClick: onPreviewClick
    }, (0, _languageHandler._t)("Preview"));
  }

  if (hasJoinedRoom) {
    joinOrViewButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "secondary",
      onClick: onViewClick
    }, (0, _languageHandler._t)("View"));
  } else if (!isGuest) {
    joinOrViewButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "primary",
      onClick: onJoinClick
    }, (0, _languageHandler._t)("Join"));
  }

  return /*#__PURE__*/_react.default.createElement("div", {
    role: "listitem",
    className: "mx_RoomDirectory_listItem"
  }, /*#__PURE__*/_react.default.createElement("div", {
    onMouseDown: onRoomClicked,
    className: "mx_RoomDirectory_roomAvatar"
  }, /*#__PURE__*/_react.default.createElement(_BaseAvatar.default, {
    width: 32,
    height: 32,
    resizeMethod: "crop",
    name: name,
    idName: name,
    url: avatarUrl
  })), /*#__PURE__*/_react.default.createElement("div", {
    onMouseDown: onRoomClicked,
    className: "mx_RoomDirectory_roomDescription"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_RoomDirectory_name"
  }, name), "\xA0", /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_RoomDirectory_topic",
    dangerouslySetInnerHTML: {
      __html: topic
    }
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_RoomDirectory_alias"
  }, (0, _RoomDirectory.getDisplayAliasForRoom)(room))), /*#__PURE__*/_react.default.createElement("div", {
    onMouseDown: onRoomClicked,
    className: "mx_RoomDirectory_roomMemberCount"
  }, room.num_joined_members), /*#__PURE__*/_react.default.createElement("div", {
    onMouseDown: onRoomClicked,
    className: "mx_RoomDirectory_preview"
  }, previewButton), /*#__PURE__*/_react.default.createElement("div", {
    onMouseDown: onRoomClicked,
    className: "mx_RoomDirectory_join"
  }, joinOrViewButton));
};

exports.PublicRoomTile = PublicRoomTile;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNQVhfTkFNRV9MRU5HVEgiLCJNQVhfVE9QSUNfTEVOR1RIIiwiUHVibGljUm9vbVRpbGUiLCJyb29tIiwic2hvd1Jvb20iLCJyZW1vdmVGcm9tRGlyZWN0b3J5IiwiY2xpZW50IiwidXNlQ29udGV4dCIsIk1hdHJpeENsaWVudENvbnRleHQiLCJhdmF0YXJVcmwiLCJzZXRBdmF0YXJVcmwiLCJ1c2VTdGF0ZSIsIm5hbWUiLCJzZXROYW1lIiwidG9waWMiLCJzZXRUb3BpYyIsImhhc0pvaW5lZFJvb20iLCJzZXRIYXNKb2luZWRSb29tIiwiaXNHdWVzdCIsInVzZUVmZmVjdCIsImNsaWVudFJvb20iLCJnZXRSb29tIiwicm9vbV9pZCIsImdldE15TWVtYmVyc2hpcCIsImdldERpc3BsYXlBbGlhc0ZvclJvb20iLCJfdCIsImxlbmd0aCIsInN1YnN0cmluZyIsImxpbmtpZnlBbmRTYW5pdGl6ZUh0bWwiLCJhdmF0YXJfdXJsIiwibWVkaWFGcm9tTXhjIiwiZ2V0U3F1YXJlVGh1bWJuYWlsSHR0cCIsIm9uUm9vbUNsaWNrZWQiLCJ1c2VDYWxsYmFjayIsImV2Iiwic2hpZnRLZXkiLCJwcmV2ZW50RGVmYXVsdCIsIm9uUHJldmlld0NsaWNrIiwic3RvcFByb3BhZ2F0aW9uIiwib25WaWV3Q2xpY2siLCJvbkpvaW5DbGljayIsInByZXZpZXdCdXR0b24iLCJqb2luT3JWaWV3QnV0dG9uIiwid29ybGRfcmVhZGFibGUiLCJfX2h0bWwiLCJudW1fam9pbmVkX21lbWJlcnMiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9yb29tcy9QdWJsaWNSb29tVGlsZS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIyIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IHVzZUNhbGxiYWNrLCB1c2VDb250ZXh0LCB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBJUHVibGljUm9vbXNDaHVua1Jvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY2xpZW50XCI7XG5cbmltcG9ydCBCYXNlQXZhdGFyIGZyb20gXCIuLi9hdmF0YXJzL0Jhc2VBdmF0YXJcIjtcbmltcG9ydCB7IG1lZGlhRnJvbU14YyB9IGZyb20gXCIuLi8uLi8uLi9jdXN0b21pc2F0aW9ucy9NZWRpYVwiO1xuaW1wb3J0IHsgbGlua2lmeUFuZFNhbml0aXplSHRtbCB9IGZyb20gXCIuLi8uLi8uLi9IdG1sVXRpbHNcIjtcbmltcG9ydCB7IGdldERpc3BsYXlBbGlhc0ZvclJvb20gfSBmcm9tIFwiLi4vLi4vc3RydWN0dXJlcy9Sb29tRGlyZWN0b3J5XCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IE1hdHJpeENsaWVudENvbnRleHQgZnJvbSBcIi4uLy4uLy4uL2NvbnRleHRzL01hdHJpeENsaWVudENvbnRleHRcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuXG5jb25zdCBNQVhfTkFNRV9MRU5HVEggPSA4MDtcbmNvbnN0IE1BWF9UT1BJQ19MRU5HVEggPSA4MDA7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHJvb206IElQdWJsaWNSb29tc0NodW5rUm9vbTtcbiAgICByZW1vdmVGcm9tRGlyZWN0b3J5PzogKHJvb206IElQdWJsaWNSb29tc0NodW5rUm9vbSkgPT4gdm9pZDtcbiAgICBzaG93Um9vbTogKHJvb206IElQdWJsaWNSb29tc0NodW5rUm9vbSwgcm9vbUFsaWFzPzogc3RyaW5nLCBhdXRvSm9pbj86IGJvb2xlYW4sIHNob3VsZFBlZWs/OiBib29sZWFuKSA9PiB2b2lkO1xufVxuXG5leHBvcnQgY29uc3QgUHVibGljUm9vbVRpbGUgPSAoe1xuICAgIHJvb20sXG4gICAgc2hvd1Jvb20sXG4gICAgcmVtb3ZlRnJvbURpcmVjdG9yeSxcbn06IElQcm9wcykgPT4ge1xuICAgIGNvbnN0IGNsaWVudCA9IHVzZUNvbnRleHQoTWF0cml4Q2xpZW50Q29udGV4dCk7XG5cbiAgICBjb25zdCBbYXZhdGFyVXJsLCBzZXRBdmF0YXJVcmxdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbCk7XG4gICAgY29uc3QgW25hbWUsIHNldE5hbWVdID0gdXNlU3RhdGUoXCJcIik7XG4gICAgY29uc3QgW3RvcGljLCBzZXRUb3BpY10gPSB1c2VTdGF0ZShcIlwiKTtcblxuICAgIGNvbnN0IFtoYXNKb2luZWRSb29tLCBzZXRIYXNKb2luZWRSb29tXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICAgIGNvbnN0IGlzR3Vlc3QgPSBjbGllbnQuaXNHdWVzdCgpO1xuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgY29uc3QgY2xpZW50Um9vbSA9IGNsaWVudC5nZXRSb29tKHJvb20ucm9vbV9pZCk7XG5cbiAgICAgICAgc2V0SGFzSm9pbmVkUm9vbShjbGllbnRSb29tPy5nZXRNeU1lbWJlcnNoaXAoKSA9PT0gXCJqb2luXCIpO1xuXG4gICAgICAgIGxldCBuYW1lID0gcm9vbS5uYW1lIHx8IGdldERpc3BsYXlBbGlhc0ZvclJvb20ocm9vbSkgfHwgX3QoJ1VubmFtZWQgcm9vbScpO1xuICAgICAgICBpZiAobmFtZS5sZW5ndGggPiBNQVhfTkFNRV9MRU5HVEgpIHtcbiAgICAgICAgICAgIG5hbWUgPSBgJHtuYW1lLnN1YnN0cmluZygwLCBNQVhfTkFNRV9MRU5HVEgpfS4uLmA7XG4gICAgICAgIH1cbiAgICAgICAgc2V0TmFtZShuYW1lKTtcblxuICAgICAgICBsZXQgdG9waWMgPSByb29tLnRvcGljIHx8ICcnO1xuICAgICAgICAvLyBBZGRpdGlvbmFsIHRydW5jYXRpb24gYmFzZWQgb24gbGluZSBudW1iZXJzIGlzIGRvbmUgdmlhIENTUyxcbiAgICAgICAgLy8gYnV0IHRvIGVuc3VyZSB0aGF0IHRoZSBET00gaXMgbm90IHBvbGx1dGVkIHdpdGggYSBodWdlIHN0cmluZ1xuICAgICAgICAvLyB3ZSBnaXZlIGl0IGEgaGFyZCBsaW1pdCBiZWZvcmUgcmVuZGVyaW5nLlxuICAgICAgICBpZiAodG9waWMubGVuZ3RoID4gTUFYX1RPUElDX0xFTkdUSCkge1xuICAgICAgICAgICAgdG9waWMgPSBgJHt0b3BpYy5zdWJzdHJpbmcoMCwgTUFYX1RPUElDX0xFTkdUSCl9Li4uYDtcbiAgICAgICAgfVxuICAgICAgICB0b3BpYyA9IGxpbmtpZnlBbmRTYW5pdGl6ZUh0bWwodG9waWMpO1xuICAgICAgICBzZXRUb3BpYyh0b3BpYyk7XG4gICAgICAgIGlmIChyb29tLmF2YXRhcl91cmwpIHtcbiAgICAgICAgICAgIHNldEF2YXRhclVybChtZWRpYUZyb21NeGMocm9vbS5hdmF0YXJfdXJsKS5nZXRTcXVhcmVUaHVtYm5haWxIdHRwKDMyKSk7XG4gICAgICAgIH1cbiAgICB9LCBbcm9vbSwgY2xpZW50XSk7XG5cbiAgICBjb25zdCBvblJvb21DbGlja2VkID0gdXNlQ2FsbGJhY2soKGV2OiBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgIC8vIElmIHJvb20gd2FzIHNoaWZ0LWNsaWNrZWQsIHJlbW92ZSBpdCBmcm9tIHRoZSByb29tIGRpcmVjdG9yeVxuICAgICAgICBpZiAoZXYuc2hpZnRLZXkpIHtcbiAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICByZW1vdmVGcm9tRGlyZWN0b3J5Py4ocm9vbSk7XG4gICAgICAgIH1cbiAgICB9LCBbcm9vbSwgcmVtb3ZlRnJvbURpcmVjdG9yeV0pO1xuXG4gICAgY29uc3Qgb25QcmV2aWV3Q2xpY2sgPSB1c2VDYWxsYmFjaygoZXY6IFJlYWN0Lk1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgc2hvd1Jvb20ocm9vbSwgbnVsbCwgZmFsc2UsIHRydWUpO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9LCBbcm9vbSwgc2hvd1Jvb21dKTtcblxuICAgIGNvbnN0IG9uVmlld0NsaWNrID0gdXNlQ2FsbGJhY2soKGV2OiBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgIHNob3dSb29tKHJvb20pO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9LCBbcm9vbSwgc2hvd1Jvb21dKTtcblxuICAgIGNvbnN0IG9uSm9pbkNsaWNrID0gdXNlQ2FsbGJhY2soKGV2OiBSZWFjdC5Nb3VzZUV2ZW50KSA9PiB7XG4gICAgICAgIHNob3dSb29tKHJvb20sIG51bGwsIHRydWUpO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9LCBbcm9vbSwgc2hvd1Jvb21dKTtcblxuICAgIGxldCBwcmV2aWV3QnV0dG9uO1xuICAgIGxldCBqb2luT3JWaWV3QnV0dG9uO1xuXG4gICAgLy8gRWxlbWVudCBXZWIgY3VycmVudGx5IGRvZXMgbm90IGFsbG93IGd1ZXN0cyB0byBqb2luIHJvb21zLCBzbyB3ZVxuICAgIC8vIGluc3RlYWQgc2hvdyB0aGVtIHByZXZpZXcgYnV0dG9ucyBmb3IgYWxsIHJvb21zLiBJZiB0aGUgcm9vbSBpcyBub3RcbiAgICAvLyB3b3JsZCByZWFkYWJsZSwgYSBtb2RhbCB3aWxsIGFwcGVhciBhc2tpbmcgeW91IHRvIHJlZ2lzdGVyIGZpcnN0LiBJZlxuICAgIC8vIGl0IGlzIHJlYWRhYmxlLCB0aGUgcHJldmlldyBhcHBlYXJzIGFzIG5vcm1hbC5cbiAgICBpZiAoIWhhc0pvaW5lZFJvb20gJiYgKHJvb20ud29ybGRfcmVhZGFibGUgfHwgaXNHdWVzdCkpIHtcbiAgICAgICAgcHJldmlld0J1dHRvbiA9IChcbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9XCJzZWNvbmRhcnlcIiBvbkNsaWNrPXtvblByZXZpZXdDbGlja30+XG4gICAgICAgICAgICAgICAgeyBfdChcIlByZXZpZXdcIikgfVxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICApO1xuICAgIH1cbiAgICBpZiAoaGFzSm9pbmVkUm9vbSkge1xuICAgICAgICBqb2luT3JWaWV3QnV0dG9uID0gKFxuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD1cInNlY29uZGFyeVwiIG9uQ2xpY2s9e29uVmlld0NsaWNrfT5cbiAgICAgICAgICAgICAgICB7IF90KFwiVmlld1wiKSB9XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICk7XG4gICAgfSBlbHNlIGlmICghaXNHdWVzdCkge1xuICAgICAgICBqb2luT3JWaWV3QnV0dG9uID0gKFxuICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD1cInByaW1hcnlcIiBvbkNsaWNrPXtvbkpvaW5DbGlja30+XG4gICAgICAgICAgICAgICAgeyBfdChcIkpvaW5cIikgfVxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiA8ZGl2XG4gICAgICAgIHJvbGU9XCJsaXN0aXRlbVwiXG4gICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21EaXJlY3RvcnlfbGlzdEl0ZW1cIlxuICAgID5cbiAgICAgICAgPGRpdlxuICAgICAgICAgICAgb25Nb3VzZURvd249e29uUm9vbUNsaWNrZWR9XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF9Sb29tRGlyZWN0b3J5X3Jvb21BdmF0YXJcIlxuICAgICAgICA+XG4gICAgICAgICAgICA8QmFzZUF2YXRhclxuICAgICAgICAgICAgICAgIHdpZHRoPXszMn1cbiAgICAgICAgICAgICAgICBoZWlnaHQ9ezMyfVxuICAgICAgICAgICAgICAgIHJlc2l6ZU1ldGhvZD0nY3JvcCdcbiAgICAgICAgICAgICAgICBuYW1lPXtuYW1lfVxuICAgICAgICAgICAgICAgIGlkTmFtZT17bmFtZX1cbiAgICAgICAgICAgICAgICB1cmw9e2F2YXRhclVybH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2XG4gICAgICAgICAgICBvbk1vdXNlRG93bj17b25Sb29tQ2xpY2tlZH1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21EaXJlY3Rvcnlfcm9vbURlc2NyaXB0aW9uXCJcbiAgICAgICAgPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tRGlyZWN0b3J5X25hbWVcIj5cbiAgICAgICAgICAgICAgICB7IG5hbWUgfVxuICAgICAgICAgICAgPC9kaXY+Jm5ic3A7XG4gICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUm9vbURpcmVjdG9yeV90b3BpY1wiXG4gICAgICAgICAgICAgICAgZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUw9e3sgX19odG1sOiB0b3BpYyB9fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbURpcmVjdG9yeV9hbGlhc1wiPlxuICAgICAgICAgICAgICAgIHsgZ2V0RGlzcGxheUFsaWFzRm9yUm9vbShyb29tKSB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXZcbiAgICAgICAgICAgIG9uTW91c2VEb3duPXtvblJvb21DbGlja2VkfVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUm9vbURpcmVjdG9yeV9yb29tTWVtYmVyQ291bnRcIlxuICAgICAgICA+XG4gICAgICAgICAgICB7IHJvb20ubnVtX2pvaW5lZF9tZW1iZXJzIH1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXZcbiAgICAgICAgICAgIG9uTW91c2VEb3duPXtvblJvb21DbGlja2VkfVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUm9vbURpcmVjdG9yeV9wcmV2aWV3XCJcbiAgICAgICAgPlxuICAgICAgICAgICAgeyBwcmV2aWV3QnV0dG9uIH1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXZcbiAgICAgICAgICAgIG9uTW91c2VEb3duPXtvblJvb21DbGlja2VkfVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUm9vbURpcmVjdG9yeV9qb2luXCJcbiAgICAgICAgPlxuICAgICAgICAgICAgeyBqb2luT3JWaWV3QnV0dG9uIH1cbiAgICAgICAgPC9kaXY+XG4gICAgPC9kaXY+O1xufTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUdBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUF6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBYUEsTUFBTUEsZUFBZSxHQUFHLEVBQXhCO0FBQ0EsTUFBTUMsZ0JBQWdCLEdBQUcs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