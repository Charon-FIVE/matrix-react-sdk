"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _logger = require("matrix-js-sdk/src/logger");

var _eventTimeline = require("matrix-js-sdk/src/models/event-timeline");

var _event = require("matrix-js-sdk/src/@types/event");

var _languageHandler = require("../../../languageHandler");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _actions = require("../../../dispatcher/actions");

var _BaseDialog = _interopRequireDefault(require("../dialogs/BaseDialog"));

var _InfoDialog = _interopRequireDefault(require("../dialogs/InfoDialog"));

var _DialogButtons = _interopRequireDefault(require("../elements/DialogButtons"));

var _StyledCheckbox = _interopRequireDefault(require("../elements/StyledCheckbox"));

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
const BulkRedactDialog = props => {
  const {
    matrixClient: cli,
    room,
    member,
    onFinished
  } = props;
  const [keepStateEvents, setKeepStateEvents] = (0, _react.useState)(true);
  let timeline = room.getLiveTimeline();
  let eventsToRedact = [];

  while (timeline) {
    eventsToRedact = [...eventsToRedact, ...timeline.getEvents().filter(event => event.getSender() === member.userId && !event.isRedacted() && !event.isRedaction() && event.getType() !== _event.EventType.RoomCreate && // Don't redact ACLs because that'll obliterate the room
    // See https://github.com/matrix-org/synapse/issues/4042 for details.
    event.getType() !== _event.EventType.RoomServerAcl && // Redacting encryption events is equally bad
    event.getType() !== _event.EventType.RoomEncryption)];
    timeline = timeline.getNeighbouringTimeline(_eventTimeline.EventTimeline.BACKWARDS);
  }

  if (eventsToRedact.length === 0) {
    return /*#__PURE__*/_react.default.createElement(_InfoDialog.default, {
      onFinished: onFinished,
      title: (0, _languageHandler._t)("No recent messages by %(user)s found", {
        user: member.name
      }),
      description: /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Try scrolling up in the timeline to see if there are any earlier ones.")))
    });
  } else {
    eventsToRedact = eventsToRedact.filter(event => !(keepStateEvents && event.isState()));
    const count = eventsToRedact.length;
    const user = member.name;

    const redact = async () => {
      _logger.logger.info(`Started redacting recent ${count} messages for ${member.userId} in ${room.roomId}`);

      _dispatcher.default.dispatch({
        action: _actions.Action.BulkRedactStart,
        room_id: room.roomId
      }); // Submitting a large number of redactions freezes the UI,
      // so first yield to allow to rerender after closing the dialog.


      await Promise.resolve();
      await Promise.all(eventsToRedact.reverse().map(async event => {
        try {
          await cli.redactEvent(room.roomId, event.getId());
        } catch (err) {
          // log and swallow errors
          _logger.logger.error("Could not redact", event.getId());

          _logger.logger.error(err);
        }
      }));

      _logger.logger.info(`Finished redacting recent ${count} messages for ${member.userId} in ${room.roomId}`);

      _dispatcher.default.dispatch({
        action: _actions.Action.BulkRedactEnd,
        room_id: room.roomId
      });
    };

    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_BulkRedactDialog",
      onFinished: onFinished,
      title: (0, _languageHandler._t)("Remove recent messages by %(user)s", {
        user
      }),
      contentId: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_content",
      id: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("You are about to remove %(count)s messages by %(user)s. " + "This will remove them permanently for everyone in the conversation. " + "Do you wish to continue?", {
      count,
      user
    })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("For a large amount of messages, this might take some time. " + "Please don't refresh your client in the meantime.")), /*#__PURE__*/_react.default.createElement(_StyledCheckbox.default, {
      checked: keepStateEvents,
      onChange: e => setKeepStateEvents(e.target.checked)
    }, (0, _languageHandler._t)("Preserve system messages")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_BulkRedactDialog_checkboxMicrocopy"
    }, (0, _languageHandler._t)("Uncheck if you also want to remove system messages on this user " + "(e.g. membership change, profile change…)"))), /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
      primaryButton: (0, _languageHandler._t)("Remove %(count)s messages", {
        count
      }),
      primaryButtonClass: "danger",
      primaryDisabled: count === 0,
      onPrimaryButtonClick: () => {
        setImmediate(redact);
        onFinished(true);
      },
      onCancel: () => onFinished(false)
    }));
  }
};

var _default = BulkRedactDialog;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCdWxrUmVkYWN0RGlhbG9nIiwicHJvcHMiLCJtYXRyaXhDbGllbnQiLCJjbGkiLCJyb29tIiwibWVtYmVyIiwib25GaW5pc2hlZCIsImtlZXBTdGF0ZUV2ZW50cyIsInNldEtlZXBTdGF0ZUV2ZW50cyIsInVzZVN0YXRlIiwidGltZWxpbmUiLCJnZXRMaXZlVGltZWxpbmUiLCJldmVudHNUb1JlZGFjdCIsImdldEV2ZW50cyIsImZpbHRlciIsImV2ZW50IiwiZ2V0U2VuZGVyIiwidXNlcklkIiwiaXNSZWRhY3RlZCIsImlzUmVkYWN0aW9uIiwiZ2V0VHlwZSIsIkV2ZW50VHlwZSIsIlJvb21DcmVhdGUiLCJSb29tU2VydmVyQWNsIiwiUm9vbUVuY3J5cHRpb24iLCJnZXROZWlnaGJvdXJpbmdUaW1lbGluZSIsIkV2ZW50VGltZWxpbmUiLCJCQUNLV0FSRFMiLCJsZW5ndGgiLCJfdCIsInVzZXIiLCJuYW1lIiwiaXNTdGF0ZSIsImNvdW50IiwicmVkYWN0IiwibG9nZ2VyIiwiaW5mbyIsInJvb21JZCIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwiQWN0aW9uIiwiQnVsa1JlZGFjdFN0YXJ0Iiwicm9vbV9pZCIsIlByb21pc2UiLCJyZXNvbHZlIiwiYWxsIiwicmV2ZXJzZSIsIm1hcCIsInJlZGFjdEV2ZW50IiwiZ2V0SWQiLCJlcnIiLCJlcnJvciIsIkJ1bGtSZWRhY3RFbmQiLCJlIiwidGFyZ2V0IiwiY2hlY2tlZCIsInNldEltbWVkaWF0ZSJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvQnVsa1JlZGFjdERpYWxvZy50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2xvZ2dlclwiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50IH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvY2xpZW50JztcbmltcG9ydCB7IFJvb21NZW1iZXIgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbS1tZW1iZXInO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tJztcbmltcG9ydCB7IEV2ZW50VGltZWxpbmUgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnQtdGltZWxpbmUnO1xuaW1wb3J0IHsgRXZlbnRUeXBlIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9ldmVudFwiO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgZGlzIGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCB7IEFjdGlvbiB9IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcbmltcG9ydCB7IElEaWFsb2dQcm9wcyB9IGZyb20gXCIuL0lEaWFsb2dQcm9wc1wiO1xuaW1wb3J0IEJhc2VEaWFsb2cgZnJvbSBcIi4uL2RpYWxvZ3MvQmFzZURpYWxvZ1wiO1xuaW1wb3J0IEluZm9EaWFsb2cgZnJvbSBcIi4uL2RpYWxvZ3MvSW5mb0RpYWxvZ1wiO1xuaW1wb3J0IERpYWxvZ0J1dHRvbnMgZnJvbSBcIi4uL2VsZW1lbnRzL0RpYWxvZ0J1dHRvbnNcIjtcbmltcG9ydCBTdHlsZWRDaGVja2JveCBmcm9tIFwiLi4vZWxlbWVudHMvU3R5bGVkQ2hlY2tib3hcIjtcblxuaW50ZXJmYWNlIElCdWxrUmVkYWN0RGlhbG9nUHJvcHMgZXh0ZW5kcyBJRGlhbG9nUHJvcHMge1xuICAgIG1hdHJpeENsaWVudDogTWF0cml4Q2xpZW50O1xuICAgIHJvb206IFJvb207XG4gICAgbWVtYmVyOiBSb29tTWVtYmVyO1xufVxuXG5jb25zdCBCdWxrUmVkYWN0RGlhbG9nOiBSZWFjdC5GQzxJQnVsa1JlZGFjdERpYWxvZ1Byb3BzPiA9IHByb3BzID0+IHtcbiAgICBjb25zdCB7IG1hdHJpeENsaWVudDogY2xpLCByb29tLCBtZW1iZXIsIG9uRmluaXNoZWQgfSA9IHByb3BzO1xuICAgIGNvbnN0IFtrZWVwU3RhdGVFdmVudHMsIHNldEtlZXBTdGF0ZUV2ZW50c10gPSB1c2VTdGF0ZSh0cnVlKTtcblxuICAgIGxldCB0aW1lbGluZSA9IHJvb20uZ2V0TGl2ZVRpbWVsaW5lKCk7XG4gICAgbGV0IGV2ZW50c1RvUmVkYWN0ID0gW107XG4gICAgd2hpbGUgKHRpbWVsaW5lKSB7XG4gICAgICAgIGV2ZW50c1RvUmVkYWN0ID0gWy4uLmV2ZW50c1RvUmVkYWN0LCAuLi50aW1lbGluZS5nZXRFdmVudHMoKS5maWx0ZXIoZXZlbnQgPT5cbiAgICAgICAgICAgIGV2ZW50LmdldFNlbmRlcigpID09PSBtZW1iZXIudXNlcklkICYmXG4gICAgICAgICAgICAgICAgIWV2ZW50LmlzUmVkYWN0ZWQoKSAmJiAhZXZlbnQuaXNSZWRhY3Rpb24oKSAmJlxuICAgICAgICAgICAgICAgIGV2ZW50LmdldFR5cGUoKSAhPT0gRXZlbnRUeXBlLlJvb21DcmVhdGUgJiZcbiAgICAgICAgICAgICAgICAvLyBEb24ndCByZWRhY3QgQUNMcyBiZWNhdXNlIHRoYXQnbGwgb2JsaXRlcmF0ZSB0aGUgcm9vbVxuICAgICAgICAgICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWF0cml4LW9yZy9zeW5hcHNlL2lzc3Vlcy80MDQyIGZvciBkZXRhaWxzLlxuICAgICAgICAgICAgICAgIGV2ZW50LmdldFR5cGUoKSAhPT0gRXZlbnRUeXBlLlJvb21TZXJ2ZXJBY2wgJiZcbiAgICAgICAgICAgICAgICAvLyBSZWRhY3RpbmcgZW5jcnlwdGlvbiBldmVudHMgaXMgZXF1YWxseSBiYWRcbiAgICAgICAgICAgICAgICBldmVudC5nZXRUeXBlKCkgIT09IEV2ZW50VHlwZS5Sb29tRW5jcnlwdGlvbixcbiAgICAgICAgKV07XG4gICAgICAgIHRpbWVsaW5lID0gdGltZWxpbmUuZ2V0TmVpZ2hib3VyaW5nVGltZWxpbmUoRXZlbnRUaW1lbGluZS5CQUNLV0FSRFMpO1xuICAgIH1cblxuICAgIGlmIChldmVudHNUb1JlZGFjdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIDxJbmZvRGlhbG9nXG4gICAgICAgICAgICBvbkZpbmlzaGVkPXtvbkZpbmlzaGVkfVxuICAgICAgICAgICAgdGl0bGU9e190KFwiTm8gcmVjZW50IG1lc3NhZ2VzIGJ5ICUodXNlcilzIGZvdW5kXCIsIHsgdXNlcjogbWVtYmVyLm5hbWUgfSl9XG4gICAgICAgICAgICBkZXNjcmlwdGlvbj17XG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPHA+eyBfdChcIlRyeSBzY3JvbGxpbmcgdXAgaW4gdGhlIHRpbWVsaW5lIHRvIHNlZSBpZiB0aGVyZSBhcmUgYW55IGVhcmxpZXIgb25lcy5cIikgfTwvcD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIH1cbiAgICAgICAgLz47XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZXZlbnRzVG9SZWRhY3QgPSBldmVudHNUb1JlZGFjdC5maWx0ZXIoZXZlbnQgPT4gIShrZWVwU3RhdGVFdmVudHMgJiYgZXZlbnQuaXNTdGF0ZSgpKSk7XG4gICAgICAgIGNvbnN0IGNvdW50ID0gZXZlbnRzVG9SZWRhY3QubGVuZ3RoO1xuICAgICAgICBjb25zdCB1c2VyID0gbWVtYmVyLm5hbWU7XG5cbiAgICAgICAgY29uc3QgcmVkYWN0ID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgbG9nZ2VyLmluZm8oYFN0YXJ0ZWQgcmVkYWN0aW5nIHJlY2VudCAke2NvdW50fSBtZXNzYWdlcyBmb3IgJHttZW1iZXIudXNlcklkfSBpbiAke3Jvb20ucm9vbUlkfWApO1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5CdWxrUmVkYWN0U3RhcnQsXG4gICAgICAgICAgICAgICAgcm9vbV9pZDogcm9vbS5yb29tSWQsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gU3VibWl0dGluZyBhIGxhcmdlIG51bWJlciBvZiByZWRhY3Rpb25zIGZyZWV6ZXMgdGhlIFVJLFxuICAgICAgICAgICAgLy8gc28gZmlyc3QgeWllbGQgdG8gYWxsb3cgdG8gcmVyZW5kZXIgYWZ0ZXIgY2xvc2luZyB0aGUgZGlhbG9nLlxuICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChldmVudHNUb1JlZGFjdC5yZXZlcnNlKCkubWFwKGFzeW5jIGV2ZW50ID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBjbGkucmVkYWN0RXZlbnQocm9vbS5yb29tSWQsIGV2ZW50LmdldElkKCkpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICAvLyBsb2cgYW5kIHN3YWxsb3cgZXJyb3JzXG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcIkNvdWxkIG5vdCByZWRhY3RcIiwgZXZlbnQuZ2V0SWQoKSk7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKTtcblxuICAgICAgICAgICAgbG9nZ2VyLmluZm8oYEZpbmlzaGVkIHJlZGFjdGluZyByZWNlbnQgJHtjb3VudH0gbWVzc2FnZXMgZm9yICR7bWVtYmVyLnVzZXJJZH0gaW4gJHtyb29tLnJvb21JZH1gKTtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uQnVsa1JlZGFjdEVuZCxcbiAgICAgICAgICAgICAgICByb29tX2lkOiByb29tLnJvb21JZCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiA8QmFzZURpYWxvZ1xuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQnVsa1JlZGFjdERpYWxvZ1wiXG4gICAgICAgICAgICBvbkZpbmlzaGVkPXtvbkZpbmlzaGVkfVxuICAgICAgICAgICAgdGl0bGU9e190KFwiUmVtb3ZlIHJlY2VudCBtZXNzYWdlcyBieSAlKHVzZXIpc1wiLCB7IHVzZXIgfSl9XG4gICAgICAgICAgICBjb250ZW50SWQ9XCJteF9EaWFsb2dfY29udGVudFwiXG4gICAgICAgID5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2NvbnRlbnRcIiBpZD1cIm14X0RpYWxvZ19jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgPHA+eyBfdChcIllvdSBhcmUgYWJvdXQgdG8gcmVtb3ZlICUoY291bnQpcyBtZXNzYWdlcyBieSAlKHVzZXIpcy4gXCIgK1xuICAgICAgICAgICAgICAgICAgICBcIlRoaXMgd2lsbCByZW1vdmUgdGhlbSBwZXJtYW5lbnRseSBmb3IgZXZlcnlvbmUgaW4gdGhlIGNvbnZlcnNhdGlvbi4gXCIgK1xuICAgICAgICAgICAgICAgICAgICBcIkRvIHlvdSB3aXNoIHRvIGNvbnRpbnVlP1wiLCB7IGNvdW50LCB1c2VyIH0pIH08L3A+XG4gICAgICAgICAgICAgICAgPHA+eyBfdChcIkZvciBhIGxhcmdlIGFtb3VudCBvZiBtZXNzYWdlcywgdGhpcyBtaWdodCB0YWtlIHNvbWUgdGltZS4gXCIgK1xuICAgICAgICAgICAgICAgICAgICBcIlBsZWFzZSBkb24ndCByZWZyZXNoIHlvdXIgY2xpZW50IGluIHRoZSBtZWFudGltZS5cIikgfTwvcD5cbiAgICAgICAgICAgICAgICA8U3R5bGVkQ2hlY2tib3hcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tlZD17a2VlcFN0YXRlRXZlbnRzfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17ZSA9PiBzZXRLZWVwU3RhdGVFdmVudHMoZS50YXJnZXQuY2hlY2tlZCl9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiUHJlc2VydmUgc3lzdGVtIG1lc3NhZ2VzXCIpIH1cbiAgICAgICAgICAgICAgICA8L1N0eWxlZENoZWNrYm94PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQnVsa1JlZGFjdERpYWxvZ19jaGVja2JveE1pY3JvY29weVwiPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiVW5jaGVjayBpZiB5b3UgYWxzbyB3YW50IHRvIHJlbW92ZSBzeXN0ZW0gbWVzc2FnZXMgb24gdGhpcyB1c2VyIFwiICtcbiAgICAgICAgICAgICAgICAgICAgIFwiKGUuZy4gbWVtYmVyc2hpcCBjaGFuZ2UsIHByb2ZpbGUgY2hhbmdl4oCmKVwiKSB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxEaWFsb2dCdXR0b25zXG4gICAgICAgICAgICAgICAgcHJpbWFyeUJ1dHRvbj17X3QoXCJSZW1vdmUgJShjb3VudClzIG1lc3NhZ2VzXCIsIHsgY291bnQgfSl9XG4gICAgICAgICAgICAgICAgcHJpbWFyeUJ1dHRvbkNsYXNzPVwiZGFuZ2VyXCJcbiAgICAgICAgICAgICAgICBwcmltYXJ5RGlzYWJsZWQ9e2NvdW50ID09PSAwfVxuICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXsoKSA9PiB7IHNldEltbWVkaWF0ZShyZWRhY3QpOyBvbkZpbmlzaGVkKHRydWUpOyB9fVxuICAgICAgICAgICAgICAgIG9uQ2FuY2VsPXsoKSA9PiBvbkZpbmlzaGVkKGZhbHNlKX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgIDwvQmFzZURpYWxvZz47XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgQnVsa1JlZGFjdERpYWxvZztcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUlBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUEvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBeUJBLE1BQU1BLGdCQUFrRCxHQUFHQyxLQUFLLElBQUk7RUFDaEUsTUFBTTtJQUFFQyxZQUFZLEVBQUVDLEdBQWhCO0lBQXFCQyxJQUFyQjtJQUEyQkMsTUFBM0I7SUFBbUNDO0VBQW5DLElBQWtETCxLQUF4RDtFQUNBLE1BQU0sQ0FBQ00sZUFBRCxFQUFrQkMsa0JBQWxCLElBQXdDLElBQUFDLGVBQUEsRUFBUyxJQUFULENBQTlDO0VBRUEs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