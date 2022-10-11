"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _languageHandler = require("../../../languageHandler");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _EventTileBubble = _interopRequireDefault(require("./EventTileBubble"));

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _DMRoomMap = _interopRequireDefault(require("../../../utils/DMRoomMap"));

var _objects = require("../../../utils/objects");

var _isLocalRoom = require("../../../utils/localRoom/isLocalRoom");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2020 The Matrix.org Foundation C.I.C.

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
const ALGORITHM = "m.megolm.v1.aes-sha2";
const EncryptionEvent = /*#__PURE__*/(0, _react.forwardRef)((_ref, ref) => {
  let {
    mxEvent,
    timestamp
  } = _ref;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const roomId = mxEvent.getRoomId();

  const isRoomEncrypted = _MatrixClientPeg.MatrixClientPeg.get().isRoomEncrypted(roomId);

  const prevContent = mxEvent.getPrevContent();
  const content = mxEvent.getContent(); // if no change happened then skip rendering this, a shallow check is enough as all known fields are top-level.

  if (!(0, _objects.objectHasDiff)(prevContent, content)) return null; // nop

  if (content.algorithm === ALGORITHM && isRoomEncrypted) {
    let subtitle;

    const dmPartner = _DMRoomMap.default.shared().getUserIdForRoomId(roomId);

    const room = cli?.getRoom(roomId);

    if (prevContent.algorithm === ALGORITHM) {
      subtitle = (0, _languageHandler._t)("Some encryption parameters have been changed.");
    } else if (dmPartner) {
      const displayName = room.getMember(dmPartner)?.rawDisplayName || dmPartner;
      subtitle = (0, _languageHandler._t)("Messages here are end-to-end encrypted. " + "Verify %(displayName)s in their profile - tap on their avatar.", {
        displayName
      });
    } else if ((0, _isLocalRoom.isLocalRoom)(room)) {
      subtitle = (0, _languageHandler._t)("Messages in this chat will be end-to-end encrypted.");
    } else {
      subtitle = (0, _languageHandler._t)("Messages in this room are end-to-end encrypted. " + "When people join, you can verify them in their profile, just tap on their avatar.");
    }

    return /*#__PURE__*/_react.default.createElement(_EventTileBubble.default, {
      className: "mx_cryptoEvent mx_cryptoEvent_icon",
      title: (0, _languageHandler._t)("Encryption enabled"),
      subtitle: subtitle,
      timestamp: timestamp
    });
  }

  if (isRoomEncrypted) {
    return /*#__PURE__*/_react.default.createElement(_EventTileBubble.default, {
      className: "mx_cryptoEvent mx_cryptoEvent_icon",
      title: (0, _languageHandler._t)("Encryption enabled"),
      subtitle: (0, _languageHandler._t)("Ignored attempt to disable encryption"),
      timestamp: timestamp
    });
  }

  return /*#__PURE__*/_react.default.createElement(_EventTileBubble.default, {
    className: "mx_cryptoEvent mx_cryptoEvent_icon mx_cryptoEvent_icon_warning",
    title: (0, _languageHandler._t)("Encryption not enabled"),
    subtitle: (0, _languageHandler._t)("The encryption used by this room isn't supported."),
    ref: ref,
    timestamp: timestamp
  });
});
var _default = EncryptionEvent;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBTEdPUklUSE0iLCJFbmNyeXB0aW9uRXZlbnQiLCJmb3J3YXJkUmVmIiwicmVmIiwibXhFdmVudCIsInRpbWVzdGFtcCIsImNsaSIsInVzZUNvbnRleHQiLCJNYXRyaXhDbGllbnRDb250ZXh0Iiwicm9vbUlkIiwiZ2V0Um9vbUlkIiwiaXNSb29tRW5jcnlwdGVkIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwicHJldkNvbnRlbnQiLCJnZXRQcmV2Q29udGVudCIsImNvbnRlbnQiLCJnZXRDb250ZW50Iiwib2JqZWN0SGFzRGlmZiIsImFsZ29yaXRobSIsInN1YnRpdGxlIiwiZG1QYXJ0bmVyIiwiRE1Sb29tTWFwIiwic2hhcmVkIiwiZ2V0VXNlcklkRm9yUm9vbUlkIiwicm9vbSIsImdldFJvb20iLCJfdCIsImRpc3BsYXlOYW1lIiwiZ2V0TWVtYmVyIiwicmF3RGlzcGxheU5hbWUiLCJpc0xvY2FsUm9vbSJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL0VuY3J5cHRpb25FdmVudC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IGZvcndhcmRSZWYsIHVzZUNvbnRleHQgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBNYXRyaXhFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnRcIjtcbmltcG9ydCB7IElSb29tRW5jcnlwdGlvbiB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jcnlwdG8vUm9vbUxpc3RcIjtcblxuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSAnLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCBFdmVudFRpbGVCdWJibGUgZnJvbSBcIi4vRXZlbnRUaWxlQnViYmxlXCI7XG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tIFwiLi4vLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuaW1wb3J0IERNUm9vbU1hcCBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvRE1Sb29tTWFwXCI7XG5pbXBvcnQgeyBvYmplY3RIYXNEaWZmIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL29iamVjdHNcIjtcbmltcG9ydCB7IGlzTG9jYWxSb29tIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvbG9jYWxSb29tL2lzTG9jYWxSb29tJztcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgbXhFdmVudDogTWF0cml4RXZlbnQ7XG4gICAgdGltZXN0YW1wPzogSlNYLkVsZW1lbnQ7XG59XG5cbmNvbnN0IEFMR09SSVRITSA9IFwibS5tZWdvbG0udjEuYWVzLXNoYTJcIjtcblxuY29uc3QgRW5jcnlwdGlvbkV2ZW50ID0gZm9yd2FyZFJlZjxIVE1MRGl2RWxlbWVudCwgSVByb3BzPigoeyBteEV2ZW50LCB0aW1lc3RhbXAgfSwgcmVmKSA9PiB7XG4gICAgY29uc3QgY2xpID0gdXNlQ29udGV4dChNYXRyaXhDbGllbnRDb250ZXh0KTtcbiAgICBjb25zdCByb29tSWQgPSBteEV2ZW50LmdldFJvb21JZCgpO1xuICAgIGNvbnN0IGlzUm9vbUVuY3J5cHRlZCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5pc1Jvb21FbmNyeXB0ZWQocm9vbUlkKTtcblxuICAgIGNvbnN0IHByZXZDb250ZW50ID0gbXhFdmVudC5nZXRQcmV2Q29udGVudCgpIGFzIElSb29tRW5jcnlwdGlvbjtcbiAgICBjb25zdCBjb250ZW50ID0gbXhFdmVudC5nZXRDb250ZW50PElSb29tRW5jcnlwdGlvbj4oKTtcblxuICAgIC8vIGlmIG5vIGNoYW5nZSBoYXBwZW5lZCB0aGVuIHNraXAgcmVuZGVyaW5nIHRoaXMsIGEgc2hhbGxvdyBjaGVjayBpcyBlbm91Z2ggYXMgYWxsIGtub3duIGZpZWxkcyBhcmUgdG9wLWxldmVsLlxuICAgIGlmICghb2JqZWN0SGFzRGlmZihwcmV2Q29udGVudCwgY29udGVudCkpIHJldHVybiBudWxsOyAvLyBub3BcblxuICAgIGlmIChjb250ZW50LmFsZ29yaXRobSA9PT0gQUxHT1JJVEhNICYmIGlzUm9vbUVuY3J5cHRlZCkge1xuICAgICAgICBsZXQgc3VidGl0bGU6IHN0cmluZztcbiAgICAgICAgY29uc3QgZG1QYXJ0bmVyID0gRE1Sb29tTWFwLnNoYXJlZCgpLmdldFVzZXJJZEZvclJvb21JZChyb29tSWQpO1xuICAgICAgICBjb25zdCByb29tID0gY2xpPy5nZXRSb29tKHJvb21JZCk7XG4gICAgICAgIGlmIChwcmV2Q29udGVudC5hbGdvcml0aG0gPT09IEFMR09SSVRITSkge1xuICAgICAgICAgICAgc3VidGl0bGUgPSBfdChcIlNvbWUgZW5jcnlwdGlvbiBwYXJhbWV0ZXJzIGhhdmUgYmVlbiBjaGFuZ2VkLlwiKTtcbiAgICAgICAgfSBlbHNlIGlmIChkbVBhcnRuZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IGRpc3BsYXlOYW1lID0gcm9vbS5nZXRNZW1iZXIoZG1QYXJ0bmVyKT8ucmF3RGlzcGxheU5hbWUgfHwgZG1QYXJ0bmVyO1xuICAgICAgICAgICAgc3VidGl0bGUgPSBfdChcIk1lc3NhZ2VzIGhlcmUgYXJlIGVuZC10by1lbmQgZW5jcnlwdGVkLiBcIiArXG4gICAgICAgICAgICAgICAgXCJWZXJpZnkgJShkaXNwbGF5TmFtZSlzIGluIHRoZWlyIHByb2ZpbGUgLSB0YXAgb24gdGhlaXIgYXZhdGFyLlwiLCB7IGRpc3BsYXlOYW1lIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGlzTG9jYWxSb29tKHJvb20pKSB7XG4gICAgICAgICAgICBzdWJ0aXRsZSA9IF90KFwiTWVzc2FnZXMgaW4gdGhpcyBjaGF0IHdpbGwgYmUgZW5kLXRvLWVuZCBlbmNyeXB0ZWQuXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VidGl0bGUgPSBfdChcIk1lc3NhZ2VzIGluIHRoaXMgcm9vbSBhcmUgZW5kLXRvLWVuZCBlbmNyeXB0ZWQuIFwiICtcbiAgICAgICAgICAgICAgICBcIldoZW4gcGVvcGxlIGpvaW4sIHlvdSBjYW4gdmVyaWZ5IHRoZW0gaW4gdGhlaXIgcHJvZmlsZSwganVzdCB0YXAgb24gdGhlaXIgYXZhdGFyLlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiA8RXZlbnRUaWxlQnViYmxlXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF9jcnlwdG9FdmVudCBteF9jcnlwdG9FdmVudF9pY29uXCJcbiAgICAgICAgICAgIHRpdGxlPXtfdChcIkVuY3J5cHRpb24gZW5hYmxlZFwiKX1cbiAgICAgICAgICAgIHN1YnRpdGxlPXtzdWJ0aXRsZX1cbiAgICAgICAgICAgIHRpbWVzdGFtcD17dGltZXN0YW1wfVxuICAgICAgICAvPjtcbiAgICB9XG5cbiAgICBpZiAoaXNSb29tRW5jcnlwdGVkKSB7XG4gICAgICAgIHJldHVybiA8RXZlbnRUaWxlQnViYmxlXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJteF9jcnlwdG9FdmVudCBteF9jcnlwdG9FdmVudF9pY29uXCJcbiAgICAgICAgICAgIHRpdGxlPXtfdChcIkVuY3J5cHRpb24gZW5hYmxlZFwiKX1cbiAgICAgICAgICAgIHN1YnRpdGxlPXtfdChcIklnbm9yZWQgYXR0ZW1wdCB0byBkaXNhYmxlIGVuY3J5cHRpb25cIil9XG4gICAgICAgICAgICB0aW1lc3RhbXA9e3RpbWVzdGFtcH1cbiAgICAgICAgLz47XG4gICAgfVxuXG4gICAgcmV0dXJuIDxFdmVudFRpbGVCdWJibGVcbiAgICAgICAgY2xhc3NOYW1lPVwibXhfY3J5cHRvRXZlbnQgbXhfY3J5cHRvRXZlbnRfaWNvbiBteF9jcnlwdG9FdmVudF9pY29uX3dhcm5pbmdcIlxuICAgICAgICB0aXRsZT17X3QoXCJFbmNyeXB0aW9uIG5vdCBlbmFibGVkXCIpfVxuICAgICAgICBzdWJ0aXRsZT17X3QoXCJUaGUgZW5jcnlwdGlvbiB1c2VkIGJ5IHRoaXMgcm9vbSBpc24ndCBzdXBwb3J0ZWQuXCIpfVxuICAgICAgICByZWY9e3JlZn1cbiAgICAgICAgdGltZXN0YW1wPXt0aW1lc3RhbXB9XG4gICAgLz47XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgRW5jcnlwdGlvbkV2ZW50O1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFnQkE7O0FBSUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQTFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFtQkEsTUFBTUEsU0FBUyxHQUFHLHNCQUFsQjtBQUVBLE1BQU1DLGVBQWUsZ0JBQUcsSUFBQUMsaUJBQUEsRUFBbUMsT0FBeUJDLEdBQXpCLEtBQWlDO0VBQUEsSUFBaEM7SUFBRUMsT0FBRjtJQUFXQztFQUFYLENBQWdDO0VBQ3hGLE1BQU1DLEdBQUcsR0FBRyxJQUFBQyxpQkFBQSxFQUFXQyw0QkFBWCxDQUFaO0VBQ0EsTUFBTUMsTUFBTSxHQUFHTCxPQUFPLENBQUNNLFNBQVIsRUFBZjs7RUFDQSxNQUFNQyxlQUFlLEdBQUdDLGdDQUFBLENBQWdCQyxHQUFoQixHQUFzQkYsZUFBdEIsQ0FBc0NGLE1BQXRDLENBQXhCOztFQUVBLE1BQU1LLFdBQVcsR0FBR1YsT0FBTyxDQUFDVyxjQUFSLEVBQXBCO0VBQ0EsTUFBTUMsT0FBTyxHQUFHWixPQUFPLENBQUNhLFVBQVIsRUFBaEIsQ0FOd0YsQ0FReEY7O0VBQ0EsSUFBSSxDQUFDLElBQUFDLHNCQUFBLEVBQWNKLFdBQWQsRUFBMkJFLE9BQTNCLENBQUwsRUFBMEMsT0FBTyxJQUFQLENBVDhDLENBU2pDOztFQUV2RCxJQUFJQSxPQUFPLENBQUNHLFNBQVIsS0FBc0JuQixTQUF0QixJQUFtQ1csZUFBdkMsRUFBd0Q7SUFDcEQsSUFBSVMsUUFBSjs7SUFDQSxNQUFNQyxTQUFTLEdBQUdDLGtCQUFBLENBQVVDLE1BQVYsR0FBbUJDLGtCQUFuQixDQUFzQ2YsTUFBdEMsQ0FBbEI7O0lBQ0EsTUFBTWdCLElBQUksR0FBR25CLEdBQUcsRUFBRW9CLE9BQUwsQ0FBYWpCLE1BQWIsQ0FBYjs7SUFDQSxJQUFJSyxXQUFXLENBQUNLLFNBQVosS0FBMEJuQixTQUE5QixFQUF5QztNQUNyQ29CLFFBQVEsR0FBRyxJQUFBTyxtQkFBQSxFQUFHLCtDQUFILENBQVg7SUFDSCxDQUZELE1BRU8sSUFBSU4sU0FBSixFQUFlO01BQ2xCLE1BQU1PLFdBQVcsR0FBR0gsSUFBSSxDQUFDSSxTQUFMLENBQWVSLFNBQWYsR0FBMkJTLGNBQTNCLElBQTZDVCxTQUFqRTtNQUNBRCxRQUFRLEdBQUcsSUFBQU8sbUJBQUEsRUFBRyw2Q0FDVixnRUFETyxFQUMyRDtRQUFFQztNQUFGLENBRDNELENBQVg7SUFFSCxDQUpNLE1BSUEsSUFBSSxJQUFBRyx3QkFBQSxFQUFZTixJQUFaLENBQUosRUFBdUI7TUFDMUJMLFFBQVEsR0FBRyxJQUFBTyxtQkFBQSxFQUFHLHFEQUFILENBQVg7SUFDSCxDQUZNLE1BRUE7TUFDSFAsUUFBUSxHQUFHLElBQUFPLG1CQUFBLEVBQUcscURBQ1YsbUZBRE8sQ0FBWDtJQUVIOztJQUVELG9CQUFPLDZCQUFDLHdCQUFEO01BQ0gsU0FBUyxFQUFDLG9DQURQO01BRUgsS0FBSyxFQUFFLElBQUFBLG1CQUFBLEVBQUcsb0JBQUgsQ0FGSjtNQUdILFFBQVEsRUFBRVAsUUFIUDtNQUlILFNBQVMsRUFBRWY7SUFKUixFQUFQO0VBTUg7O0VBRUQsSUFBSU0sZUFBSixFQUFxQjtJQUNqQixvQkFBTyw2QkFBQyx3QkFBRDtNQUNILFNBQVMsRUFBQyxvQ0FEUDtNQUVILEtBQUssRUFBRSxJQUFBZ0IsbUJBQUEsRUFBRyxvQkFBSCxDQUZKO01BR0gsUUFBUSxFQUFFLElBQUFBLG1CQUFBLEVBQUcsdUNBQUgsQ0FIUDtNQUlILFNBQVMsRUFBRXRCO0lBSlIsRUFBUDtFQU1IOztFQUVELG9CQUFPLDZCQUFDLHdCQUFEO0lBQ0gsU0FBUyxFQUFDLGdFQURQO0lBRUgsS0FBSyxFQUFFLElBQUFzQixtQkFBQSxFQUFHLHdCQUFILENBRko7SUFHSCxRQUFRLEVBQUUsSUFBQUEsbUJBQUEsRUFBRyxtREFBSCxDQUhQO0lBSUgsR0FBRyxFQUFFeEIsR0FKRjtJQUtILFNBQVMsRUFBRUU7RUFMUixFQUFQO0FBT0gsQ0FwRHVCLENBQXhCO2VBc0RlSixlIn0=