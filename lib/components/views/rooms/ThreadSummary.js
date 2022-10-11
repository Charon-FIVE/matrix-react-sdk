"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.ThreadMessagePreview = void 0;

var _react = _interopRequireWildcard(require("react"));

var _thread = require("matrix-js-sdk/src/models/thread");

var _event = require("matrix-js-sdk/src/models/event");

var _languageHandler = require("../../../languageHandler");

var _context = require("../right_panel/context");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _PosthogTrackers = _interopRequireDefault(require("../../../PosthogTrackers"));

var _useEventEmitter = require("../../../hooks/useEventEmitter");

var _RoomContext = _interopRequireDefault(require("../../../contexts/RoomContext"));

var _MessagePreviewStore = require("../../../stores/room-list/MessagePreviewStore");

var _MemberAvatar = _interopRequireDefault(require("../avatars/MemberAvatar"));

var _useAsyncMemo = require("../../../hooks/useAsyncMemo");

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _actions = require("../../../dispatcher/actions");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

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
const ThreadSummary = _ref => {
  let {
    mxEvent,
    thread
  } = _ref;
  const roomContext = (0, _react.useContext)(_RoomContext.default);
  const cardContext = (0, _react.useContext)(_context.CardContext);
  const count = (0, _useEventEmitter.useTypedEventEmitterState)(thread, _thread.ThreadEvent.Update, () => thread.length);
  if (!count) return null; // We don't want to show a thread summary if the thread doesn't have replies yet

  let countSection = count;

  if (!roomContext.narrow) {
    countSection = (0, _languageHandler._t)("%(count)s reply", {
      count
    });
  }

  return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    className: "mx_ThreadSummary",
    onClick: ev => {
      _dispatcher.default.dispatch({
        action: _actions.Action.ShowThread,
        rootEvent: mxEvent,
        push: cardContext.isCard
      });

      _PosthogTrackers.default.trackInteraction("WebRoomTimelineThreadSummaryButton", ev);
    },
    "aria-label": (0, _languageHandler._t)("Open thread")
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_ThreadSummary_replies_amount"
  }, countSection), /*#__PURE__*/_react.default.createElement(ThreadMessagePreview, {
    thread: thread,
    showDisplayname: !roomContext.narrow
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_ThreadSummary_chevron"
  }));
};

const ThreadMessagePreview = _ref2 => {
  let {
    thread,
    showDisplayname = false
  } = _ref2;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const lastReply = (0, _useEventEmitter.useTypedEventEmitterState)(thread, _thread.ThreadEvent.Update, () => thread.replyToEvent); // track the content as a means to regenerate the thread message preview upon edits & decryption

  const [content, setContent] = (0, _react.useState)(lastReply?.getContent());
  (0, _useEventEmitter.useTypedEventEmitter)(lastReply, _event.MatrixEventEvent.Replaced, () => {
    setContent(lastReply.getContent());
  });
  const awaitDecryption = lastReply?.shouldAttemptDecryption() || lastReply?.isBeingDecrypted();
  (0, _useEventEmitter.useTypedEventEmitter)(awaitDecryption ? lastReply : null, _event.MatrixEventEvent.Decrypted, () => {
    setContent(lastReply.getContent());
  });
  const preview = (0, _useAsyncMemo.useAsyncMemo)(async () => {
    if (!lastReply) return;
    await cli.decryptEventIfNeeded(lastReply);
    return _MessagePreviewStore.MessagePreviewStore.instance.generatePreviewForEvent(lastReply);
  }, [lastReply, content]);
  if (!preview) return null;
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_MemberAvatar.default, {
    member: lastReply.sender,
    fallbackUserId: lastReply.getSender(),
    width: 24,
    height: 24,
    className: "mx_ThreadSummary_avatar"
  }), showDisplayname && /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_ThreadSummary_sender"
  }, lastReply.sender?.name ?? lastReply.getSender()), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_ThreadSummary_content",
    title: preview
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_ThreadSummary_message-preview"
  }, preview)));
};

exports.ThreadMessagePreview = ThreadMessagePreview;
var _default = ThreadSummary;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUaHJlYWRTdW1tYXJ5IiwibXhFdmVudCIsInRocmVhZCIsInJvb21Db250ZXh0IiwidXNlQ29udGV4dCIsIlJvb21Db250ZXh0IiwiY2FyZENvbnRleHQiLCJDYXJkQ29udGV4dCIsImNvdW50IiwidXNlVHlwZWRFdmVudEVtaXR0ZXJTdGF0ZSIsIlRocmVhZEV2ZW50IiwiVXBkYXRlIiwibGVuZ3RoIiwiY291bnRTZWN0aW9uIiwibmFycm93IiwiX3QiLCJldiIsImRlZmF1bHREaXNwYXRjaGVyIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJBY3Rpb24iLCJTaG93VGhyZWFkIiwicm9vdEV2ZW50IiwicHVzaCIsImlzQ2FyZCIsIlBvc3Rob2dUcmFja2VycyIsInRyYWNrSW50ZXJhY3Rpb24iLCJUaHJlYWRNZXNzYWdlUHJldmlldyIsInNob3dEaXNwbGF5bmFtZSIsImNsaSIsIk1hdHJpeENsaWVudENvbnRleHQiLCJsYXN0UmVwbHkiLCJyZXBseVRvRXZlbnQiLCJjb250ZW50Iiwic2V0Q29udGVudCIsInVzZVN0YXRlIiwiZ2V0Q29udGVudCIsInVzZVR5cGVkRXZlbnRFbWl0dGVyIiwiTWF0cml4RXZlbnRFdmVudCIsIlJlcGxhY2VkIiwiYXdhaXREZWNyeXB0aW9uIiwic2hvdWxkQXR0ZW1wdERlY3J5cHRpb24iLCJpc0JlaW5nRGVjcnlwdGVkIiwiRGVjcnlwdGVkIiwicHJldmlldyIsInVzZUFzeW5jTWVtbyIsImRlY3J5cHRFdmVudElmTmVlZGVkIiwiTWVzc2FnZVByZXZpZXdTdG9yZSIsImluc3RhbmNlIiwiZ2VuZXJhdGVQcmV2aWV3Rm9yRXZlbnQiLCJzZW5kZXIiLCJnZXRTZW5kZXIiLCJuYW1lIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3Mvcm9vbXMvVGhyZWFkU3VtbWFyeS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIyIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IHVzZUNvbnRleHQsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBUaHJlYWQsIFRocmVhZEV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy90aHJlYWRcIjtcbmltcG9ydCB7IElDb250ZW50LCBNYXRyaXhFdmVudCwgTWF0cml4RXZlbnRFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnRcIjtcblxuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgeyBDYXJkQ29udGV4dCB9IGZyb20gXCIuLi9yaWdodF9wYW5lbC9jb250ZXh0XCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiwgeyBCdXR0b25FdmVudCB9IGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgUG9zdGhvZ1RyYWNrZXJzIGZyb20gXCIuLi8uLi8uLi9Qb3N0aG9nVHJhY2tlcnNcIjtcbmltcG9ydCB7IHVzZVR5cGVkRXZlbnRFbWl0dGVyLCB1c2VUeXBlZEV2ZW50RW1pdHRlclN0YXRlIH0gZnJvbSBcIi4uLy4uLy4uL2hvb2tzL3VzZUV2ZW50RW1pdHRlclwiO1xuaW1wb3J0IFJvb21Db250ZXh0IGZyb20gXCIuLi8uLi8uLi9jb250ZXh0cy9Sb29tQ29udGV4dFwiO1xuaW1wb3J0IHsgTWVzc2FnZVByZXZpZXdTdG9yZSB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvcm9vbS1saXN0L01lc3NhZ2VQcmV2aWV3U3RvcmVcIjtcbmltcG9ydCBNZW1iZXJBdmF0YXIgZnJvbSBcIi4uL2F2YXRhcnMvTWVtYmVyQXZhdGFyXCI7XG5pbXBvcnQgeyB1c2VBc3luY01lbW8gfSBmcm9tIFwiLi4vLi4vLi4vaG9va3MvdXNlQXN5bmNNZW1vXCI7XG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tIFwiLi4vLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuaW1wb3J0IHsgQWN0aW9uIH0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IHsgU2hvd1RocmVhZFBheWxvYWQgfSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9wYXlsb2Fkcy9TaG93VGhyZWFkUGF5bG9hZFwiO1xuaW1wb3J0IGRlZmF1bHREaXNwYXRjaGVyIGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgbXhFdmVudDogTWF0cml4RXZlbnQ7XG4gICAgdGhyZWFkOiBUaHJlYWQ7XG59XG5cbmNvbnN0IFRocmVhZFN1bW1hcnkgPSAoeyBteEV2ZW50LCB0aHJlYWQgfTogSVByb3BzKSA9PiB7XG4gICAgY29uc3Qgcm9vbUNvbnRleHQgPSB1c2VDb250ZXh0KFJvb21Db250ZXh0KTtcbiAgICBjb25zdCBjYXJkQ29udGV4dCA9IHVzZUNvbnRleHQoQ2FyZENvbnRleHQpO1xuICAgIGNvbnN0IGNvdW50ID0gdXNlVHlwZWRFdmVudEVtaXR0ZXJTdGF0ZSh0aHJlYWQsIFRocmVhZEV2ZW50LlVwZGF0ZSwgKCkgPT4gdGhyZWFkLmxlbmd0aCk7XG4gICAgaWYgKCFjb3VudCkgcmV0dXJuIG51bGw7IC8vIFdlIGRvbid0IHdhbnQgdG8gc2hvdyBhIHRocmVhZCBzdW1tYXJ5IGlmIHRoZSB0aHJlYWQgZG9lc24ndCBoYXZlIHJlcGxpZXMgeWV0XG5cbiAgICBsZXQgY291bnRTZWN0aW9uOiBzdHJpbmcgfCBudW1iZXIgPSBjb3VudDtcbiAgICBpZiAoIXJvb21Db250ZXh0Lm5hcnJvdykge1xuICAgICAgICBjb3VudFNlY3Rpb24gPSBfdChcIiUoY291bnQpcyByZXBseVwiLCB7IGNvdW50IH0pO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF9UaHJlYWRTdW1tYXJ5XCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eyhldjogQnV0dG9uRXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0RGlzcGF0Y2hlci5kaXNwYXRjaDxTaG93VGhyZWFkUGF5bG9hZD4oe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5TaG93VGhyZWFkLFxuICAgICAgICAgICAgICAgICAgICByb290RXZlbnQ6IG14RXZlbnQsXG4gICAgICAgICAgICAgICAgICAgIHB1c2g6IGNhcmRDb250ZXh0LmlzQ2FyZCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBQb3N0aG9nVHJhY2tlcnMudHJhY2tJbnRlcmFjdGlvbihcIldlYlJvb21UaW1lbGluZVRocmVhZFN1bW1hcnlCdXR0b25cIiwgZXYpO1xuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIGFyaWEtbGFiZWw9e190KFwiT3BlbiB0aHJlYWRcIil9XG4gICAgICAgID5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1RocmVhZFN1bW1hcnlfcmVwbGllc19hbW91bnRcIj5cbiAgICAgICAgICAgICAgICB7IGNvdW50U2VjdGlvbiB9XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICA8VGhyZWFkTWVzc2FnZVByZXZpZXcgdGhyZWFkPXt0aHJlYWR9IHNob3dEaXNwbGF5bmFtZT17IXJvb21Db250ZXh0Lm5hcnJvd30gLz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVGhyZWFkU3VtbWFyeV9jaGV2cm9uXCIgLz5cbiAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICk7XG59O1xuXG5pbnRlcmZhY2UgSVByZXZpZXdQcm9wcyB7XG4gICAgdGhyZWFkOiBUaHJlYWQ7XG4gICAgc2hvd0Rpc3BsYXluYW1lPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNvbnN0IFRocmVhZE1lc3NhZ2VQcmV2aWV3ID0gKHsgdGhyZWFkLCBzaG93RGlzcGxheW5hbWUgPSBmYWxzZSB9OiBJUHJldmlld1Byb3BzKSA9PiB7XG4gICAgY29uc3QgY2xpID0gdXNlQ29udGV4dChNYXRyaXhDbGllbnRDb250ZXh0KTtcblxuICAgIGNvbnN0IGxhc3RSZXBseSA9IHVzZVR5cGVkRXZlbnRFbWl0dGVyU3RhdGUodGhyZWFkLCBUaHJlYWRFdmVudC5VcGRhdGUsICgpID0+IHRocmVhZC5yZXBseVRvRXZlbnQpO1xuICAgIC8vIHRyYWNrIHRoZSBjb250ZW50IGFzIGEgbWVhbnMgdG8gcmVnZW5lcmF0ZSB0aGUgdGhyZWFkIG1lc3NhZ2UgcHJldmlldyB1cG9uIGVkaXRzICYgZGVjcnlwdGlvblxuICAgIGNvbnN0IFtjb250ZW50LCBzZXRDb250ZW50XSA9IHVzZVN0YXRlPElDb250ZW50PihsYXN0UmVwbHk/LmdldENvbnRlbnQoKSk7XG4gICAgdXNlVHlwZWRFdmVudEVtaXR0ZXIobGFzdFJlcGx5LCBNYXRyaXhFdmVudEV2ZW50LlJlcGxhY2VkLCAoKSA9PiB7XG4gICAgICAgIHNldENvbnRlbnQobGFzdFJlcGx5LmdldENvbnRlbnQoKSk7XG4gICAgfSk7XG4gICAgY29uc3QgYXdhaXREZWNyeXB0aW9uID0gbGFzdFJlcGx5Py5zaG91bGRBdHRlbXB0RGVjcnlwdGlvbigpIHx8IGxhc3RSZXBseT8uaXNCZWluZ0RlY3J5cHRlZCgpO1xuICAgIHVzZVR5cGVkRXZlbnRFbWl0dGVyKGF3YWl0RGVjcnlwdGlvbiA/IGxhc3RSZXBseSA6IG51bGwsIE1hdHJpeEV2ZW50RXZlbnQuRGVjcnlwdGVkLCAoKSA9PiB7XG4gICAgICAgIHNldENvbnRlbnQobGFzdFJlcGx5LmdldENvbnRlbnQoKSk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBwcmV2aWV3ID0gdXNlQXN5bmNNZW1vKGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCFsYXN0UmVwbHkpIHJldHVybjtcbiAgICAgICAgYXdhaXQgY2xpLmRlY3J5cHRFdmVudElmTmVlZGVkKGxhc3RSZXBseSk7XG4gICAgICAgIHJldHVybiBNZXNzYWdlUHJldmlld1N0b3JlLmluc3RhbmNlLmdlbmVyYXRlUHJldmlld0ZvckV2ZW50KGxhc3RSZXBseSk7XG4gICAgfSwgW2xhc3RSZXBseSwgY29udGVudF0pO1xuICAgIGlmICghcHJldmlldykgcmV0dXJuIG51bGw7XG5cbiAgICByZXR1cm4gPD5cbiAgICAgICAgPE1lbWJlckF2YXRhclxuICAgICAgICAgICAgbWVtYmVyPXtsYXN0UmVwbHkuc2VuZGVyfVxuICAgICAgICAgICAgZmFsbGJhY2tVc2VySWQ9e2xhc3RSZXBseS5nZXRTZW5kZXIoKX1cbiAgICAgICAgICAgIHdpZHRoPXsyNH1cbiAgICAgICAgICAgIGhlaWdodD17MjR9XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF9UaHJlYWRTdW1tYXJ5X2F2YXRhclwiXG4gICAgICAgIC8+XG4gICAgICAgIHsgc2hvd0Rpc3BsYXluYW1lICYmIDxkaXYgY2xhc3NOYW1lPVwibXhfVGhyZWFkU3VtbWFyeV9zZW5kZXJcIj5cbiAgICAgICAgICAgIHsgbGFzdFJlcGx5LnNlbmRlcj8ubmFtZSA/PyBsYXN0UmVwbHkuZ2V0U2VuZGVyKCkgfVxuICAgICAgICA8L2Rpdj4gfVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1RocmVhZFN1bW1hcnlfY29udGVudFwiIHRpdGxlPXtwcmV2aWV3fT5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1RocmVhZFN1bW1hcnlfbWVzc2FnZS1wcmV2aWV3XCI+XG4gICAgICAgICAgICAgICAgeyBwcmV2aWV3IH1cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPC9kaXY+XG4gICAgPC8+O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgVGhyZWFkU3VtbWFyeTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOzs7Ozs7QUFoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBeUJBLE1BQU1BLGFBQWEsR0FBRyxRQUFpQztFQUFBLElBQWhDO0lBQUVDLE9BQUY7SUFBV0M7RUFBWCxDQUFnQztFQUNuRCxNQUFNQyxXQUFXLEdBQUcsSUFBQUMsaUJBQUEsRUFBV0Msb0JBQVgsQ0FBcEI7RUFDQSxNQUFNQyxXQUFXLEdBQUcsSUFBQUYsaUJBQUEsRUFBV0csb0JBQVgsQ0FBcEI7RUFDQSxNQUFNQyxLQUFLLEdBQUcsSUFBQUMsMENBQUEsRUFBMEJQLE1BQTFCLEVBQWtDUSxtQkFBQSxDQUFZQyxNQUE5QyxFQUFzRCxNQUFNVCxNQUFNLENBQUNVLE1BQW5FLENBQWQ7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