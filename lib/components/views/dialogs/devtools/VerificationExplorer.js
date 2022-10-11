"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _VerificationRequest = require("matrix-js-sdk/src/crypto/verification/request/VerificationRequest");

var _crypto = require("matrix-js-sdk/src/crypto");

var _useEventEmitter = require("../../../../hooks/useEventEmitter");

var _languageHandler = require("../../../../languageHandler");

var _MatrixClientContext = _interopRequireDefault(require("../../../../contexts/MatrixClientContext"));

var _BaseTool = _interopRequireWildcard(require("./BaseTool"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2022 Michael Telatynski <7t3chguy@gmail.com>

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
const PHASE_MAP = {
  [_VerificationRequest.Phase.Unsent]: (0, _languageHandler._td)("Unsent"),
  [_VerificationRequest.Phase.Requested]: (0, _languageHandler._td)("Requested"),
  [_VerificationRequest.Phase.Ready]: (0, _languageHandler._td)("Ready"),
  [_VerificationRequest.Phase.Done]: (0, _languageHandler._td)("Done"),
  [_VerificationRequest.Phase.Started]: (0, _languageHandler._td)("Started"),
  [_VerificationRequest.Phase.Cancelled]: (0, _languageHandler._td)("Cancelled")
};

const VerificationRequestExplorer = _ref => {
  let {
    txnId,
    request
  } = _ref;
  const [, updateState] = (0, _react.useState)();
  const [timeout, setRequestTimeout] = (0, _react.useState)(request.timeout);
  /* Re-render if something changes state */

  (0, _useEventEmitter.useTypedEventEmitter)(request, _VerificationRequest.VerificationRequestEvent.Change, updateState);
  /* Keep re-rendering if there's a timeout */

  (0, _react.useEffect)(() => {
    if (request.timeout == 0) return;
    /* Note that request.timeout is a getter, so its value changes */

    const id = setInterval(() => {
      setRequestTimeout(request.timeout);
    }, 500);
    return () => {
      clearInterval(id);
    };
  }, [request]);
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_DevTools_VerificationRequest"
  }, /*#__PURE__*/_react.default.createElement("dl", null, /*#__PURE__*/_react.default.createElement("dt", null, (0, _languageHandler._t)("Transaction")), /*#__PURE__*/_react.default.createElement("dd", null, txnId), /*#__PURE__*/_react.default.createElement("dt", null, (0, _languageHandler._t)("Phase")), /*#__PURE__*/_react.default.createElement("dd", null, PHASE_MAP[request.phase] ? (0, _languageHandler._t)(PHASE_MAP[request.phase]) : request.phase), /*#__PURE__*/_react.default.createElement("dt", null, (0, _languageHandler._t)("Timeout")), /*#__PURE__*/_react.default.createElement("dd", null, Math.floor(timeout / 1000)), /*#__PURE__*/_react.default.createElement("dt", null, (0, _languageHandler._t)("Methods")), /*#__PURE__*/_react.default.createElement("dd", null, request.methods && request.methods.join(", ")), /*#__PURE__*/_react.default.createElement("dt", null, (0, _languageHandler._t)("Requester")), /*#__PURE__*/_react.default.createElement("dd", null, request.requestingUserId), /*#__PURE__*/_react.default.createElement("dt", null, (0, _languageHandler._t)("Observe only")), /*#__PURE__*/_react.default.createElement("dd", null, JSON.stringify(request.observeOnly))));
};

const VerificationExplorer = _ref2 => {
  let {
    onBack
  } = _ref2;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const context = (0, _react.useContext)(_BaseTool.DevtoolsContext);
  const requests = (0, _useEventEmitter.useTypedEventEmitterState)(cli, _crypto.CryptoEvent.VerificationRequest, () => {
    return cli.crypto.inRoomVerificationRequests["requestsByRoomId"]?.get(context.room.roomId) ?? new Map();
  });
  return /*#__PURE__*/_react.default.createElement(_BaseTool.default, {
    onBack: onBack
  }, Array.from(requests.entries()).reverse().map(_ref3 => {
    let [txnId, request] = _ref3;
    return /*#__PURE__*/_react.default.createElement(VerificationRequestExplorer, {
      txnId: txnId,
      request: request,
      key: txnId
    });
  }), requests.size < 1 && (0, _languageHandler._t)("No verification requests found"));
};

var _default = VerificationExplorer;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQSEFTRV9NQVAiLCJQaGFzZSIsIlVuc2VudCIsIl90ZCIsIlJlcXVlc3RlZCIsIlJlYWR5IiwiRG9uZSIsIlN0YXJ0ZWQiLCJDYW5jZWxsZWQiLCJWZXJpZmljYXRpb25SZXF1ZXN0RXhwbG9yZXIiLCJ0eG5JZCIsInJlcXVlc3QiLCJ1cGRhdGVTdGF0ZSIsInVzZVN0YXRlIiwidGltZW91dCIsInNldFJlcXVlc3RUaW1lb3V0IiwidXNlVHlwZWRFdmVudEVtaXR0ZXIiLCJWZXJpZmljYXRpb25SZXF1ZXN0RXZlbnQiLCJDaGFuZ2UiLCJ1c2VFZmZlY3QiLCJpZCIsInNldEludGVydmFsIiwiY2xlYXJJbnRlcnZhbCIsIl90IiwicGhhc2UiLCJNYXRoIiwiZmxvb3IiLCJtZXRob2RzIiwiam9pbiIsInJlcXVlc3RpbmdVc2VySWQiLCJKU09OIiwic3RyaW5naWZ5Iiwib2JzZXJ2ZU9ubHkiLCJWZXJpZmljYXRpb25FeHBsb3JlciIsIm9uQmFjayIsImNsaSIsInVzZUNvbnRleHQiLCJNYXRyaXhDbGllbnRDb250ZXh0IiwiY29udGV4dCIsIkRldnRvb2xzQ29udGV4dCIsInJlcXVlc3RzIiwidXNlVHlwZWRFdmVudEVtaXR0ZXJTdGF0ZSIsIkNyeXB0b0V2ZW50IiwiVmVyaWZpY2F0aW9uUmVxdWVzdCIsImNyeXB0byIsImluUm9vbVZlcmlmaWNhdGlvblJlcXVlc3RzIiwiZ2V0Iiwicm9vbSIsInJvb21JZCIsIk1hcCIsIkFycmF5IiwiZnJvbSIsImVudHJpZXMiLCJyZXZlcnNlIiwibWFwIiwic2l6ZSJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvZGV2dG9vbHMvVmVyaWZpY2F0aW9uRXhwbG9yZXIudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMiBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgdXNlQ29udGV4dCwgdXNlRWZmZWN0LCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHtcbiAgICBQaGFzZSxcbiAgICBWZXJpZmljYXRpb25SZXF1ZXN0LFxuICAgIFZlcmlmaWNhdGlvblJlcXVlc3RFdmVudCxcbn0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NyeXB0by92ZXJpZmljYXRpb24vcmVxdWVzdC9WZXJpZmljYXRpb25SZXF1ZXN0XCI7XG5pbXBvcnQgeyBDcnlwdG9FdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9jcnlwdG9cIjtcblxuaW1wb3J0IHsgdXNlVHlwZWRFdmVudEVtaXR0ZXIsIHVzZVR5cGVkRXZlbnRFbWl0dGVyU3RhdGUgfSBmcm9tIFwiLi4vLi4vLi4vLi4vaG9va3MvdXNlRXZlbnRFbWl0dGVyXCI7XG5pbXBvcnQgeyBfdCwgX3RkIH0gZnJvbSBcIi4uLy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IE1hdHJpeENsaWVudENvbnRleHQgZnJvbSBcIi4uLy4uLy4uLy4uL2NvbnRleHRzL01hdHJpeENsaWVudENvbnRleHRcIjtcbmltcG9ydCBCYXNlVG9vbCwgeyBEZXZ0b29sc0NvbnRleHQsIElEZXZ0b29sc1Byb3BzIH0gZnJvbSBcIi4vQmFzZVRvb2xcIjtcblxuY29uc3QgUEhBU0VfTUFQOiBSZWNvcmQ8UGhhc2UsIHN0cmluZz4gPSB7XG4gICAgW1BoYXNlLlVuc2VudF06IF90ZChcIlVuc2VudFwiKSxcbiAgICBbUGhhc2UuUmVxdWVzdGVkXTogX3RkKFwiUmVxdWVzdGVkXCIpLFxuICAgIFtQaGFzZS5SZWFkeV06IF90ZChcIlJlYWR5XCIpLFxuICAgIFtQaGFzZS5Eb25lXTogX3RkKFwiRG9uZVwiKSxcbiAgICBbUGhhc2UuU3RhcnRlZF06IF90ZChcIlN0YXJ0ZWRcIiksXG4gICAgW1BoYXNlLkNhbmNlbGxlZF06IF90ZChcIkNhbmNlbGxlZFwiKSxcbn07XG5cbmNvbnN0IFZlcmlmaWNhdGlvblJlcXVlc3RFeHBsb3JlcjogUmVhY3QuRkM8e1xuICAgIHR4bklkOiBzdHJpbmc7XG4gICAgcmVxdWVzdDogVmVyaWZpY2F0aW9uUmVxdWVzdDtcbn0+ID0gKHsgdHhuSWQsIHJlcXVlc3QgfSkgPT4ge1xuICAgIGNvbnN0IFssIHVwZGF0ZVN0YXRlXSA9IHVzZVN0YXRlKCk7XG4gICAgY29uc3QgW3RpbWVvdXQsIHNldFJlcXVlc3RUaW1lb3V0XSA9IHVzZVN0YXRlKHJlcXVlc3QudGltZW91dCk7XG5cbiAgICAvKiBSZS1yZW5kZXIgaWYgc29tZXRoaW5nIGNoYW5nZXMgc3RhdGUgKi9cbiAgICB1c2VUeXBlZEV2ZW50RW1pdHRlcihyZXF1ZXN0LCBWZXJpZmljYXRpb25SZXF1ZXN0RXZlbnQuQ2hhbmdlLCB1cGRhdGVTdGF0ZSk7XG5cbiAgICAvKiBLZWVwIHJlLXJlbmRlcmluZyBpZiB0aGVyZSdzIGEgdGltZW91dCAqL1xuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmIChyZXF1ZXN0LnRpbWVvdXQgPT0gMCkgcmV0dXJuO1xuXG4gICAgICAgIC8qIE5vdGUgdGhhdCByZXF1ZXN0LnRpbWVvdXQgaXMgYSBnZXR0ZXIsIHNvIGl0cyB2YWx1ZSBjaGFuZ2VzICovXG4gICAgICAgIGNvbnN0IGlkID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgc2V0UmVxdWVzdFRpbWVvdXQocmVxdWVzdC50aW1lb3V0KTtcbiAgICAgICAgfSwgNTAwKTtcblxuICAgICAgICByZXR1cm4gKCkgPT4geyBjbGVhckludGVydmFsKGlkKTsgfTtcbiAgICB9LCBbcmVxdWVzdF0pO1xuXG4gICAgcmV0dXJuICg8ZGl2IGNsYXNzTmFtZT1cIm14X0RldlRvb2xzX1ZlcmlmaWNhdGlvblJlcXVlc3RcIj5cbiAgICAgICAgPGRsPlxuICAgICAgICAgICAgPGR0PnsgX3QoXCJUcmFuc2FjdGlvblwiKSB9PC9kdD5cbiAgICAgICAgICAgIDxkZD57IHR4bklkIH08L2RkPlxuICAgICAgICAgICAgPGR0PnsgX3QoXCJQaGFzZVwiKSB9PC9kdD5cbiAgICAgICAgICAgIDxkZD57IFBIQVNFX01BUFtyZXF1ZXN0LnBoYXNlXSA/IF90KFBIQVNFX01BUFtyZXF1ZXN0LnBoYXNlXSkgOiByZXF1ZXN0LnBoYXNlIH08L2RkPlxuICAgICAgICAgICAgPGR0PnsgX3QoXCJUaW1lb3V0XCIpIH08L2R0PlxuICAgICAgICAgICAgPGRkPnsgTWF0aC5mbG9vcih0aW1lb3V0IC8gMTAwMCkgfTwvZGQ+XG4gICAgICAgICAgICA8ZHQ+eyBfdChcIk1ldGhvZHNcIikgfTwvZHQ+XG4gICAgICAgICAgICA8ZGQ+eyByZXF1ZXN0Lm1ldGhvZHMgJiYgcmVxdWVzdC5tZXRob2RzLmpvaW4oXCIsIFwiKSB9PC9kZD5cbiAgICAgICAgICAgIDxkdD57IF90KFwiUmVxdWVzdGVyXCIpIH08L2R0PlxuICAgICAgICAgICAgPGRkPnsgcmVxdWVzdC5yZXF1ZXN0aW5nVXNlcklkIH08L2RkPlxuICAgICAgICAgICAgPGR0PnsgX3QoXCJPYnNlcnZlIG9ubHlcIikgfTwvZHQ+XG4gICAgICAgICAgICA8ZGQ+eyBKU09OLnN0cmluZ2lmeShyZXF1ZXN0Lm9ic2VydmVPbmx5KSB9PC9kZD5cbiAgICAgICAgPC9kbD5cbiAgICA8L2Rpdj4pO1xufTtcblxuY29uc3QgVmVyaWZpY2F0aW9uRXhwbG9yZXIgPSAoeyBvbkJhY2sgfTogSURldnRvb2xzUHJvcHMpID0+IHtcbiAgICBjb25zdCBjbGkgPSB1c2VDb250ZXh0KE1hdHJpeENsaWVudENvbnRleHQpO1xuICAgIGNvbnN0IGNvbnRleHQgPSB1c2VDb250ZXh0KERldnRvb2xzQ29udGV4dCk7XG5cbiAgICBjb25zdCByZXF1ZXN0cyA9IHVzZVR5cGVkRXZlbnRFbWl0dGVyU3RhdGUoY2xpLCBDcnlwdG9FdmVudC5WZXJpZmljYXRpb25SZXF1ZXN0LCAoKSA9PiB7XG4gICAgICAgIHJldHVybiBjbGkuY3J5cHRvLmluUm9vbVZlcmlmaWNhdGlvblJlcXVlc3RzW1wicmVxdWVzdHNCeVJvb21JZFwiXT8uZ2V0KGNvbnRleHQucm9vbS5yb29tSWQpXG4gICAgICAgICAgICA/PyBuZXcgTWFwPHN0cmluZywgVmVyaWZpY2F0aW9uUmVxdWVzdD4oKTtcbiAgICB9KTtcblxuICAgIHJldHVybiA8QmFzZVRvb2wgb25CYWNrPXtvbkJhY2t9PlxuICAgICAgICB7IEFycmF5LmZyb20ocmVxdWVzdHMuZW50cmllcygpKS5yZXZlcnNlKCkubWFwKChbdHhuSWQsIHJlcXVlc3RdKSA9PlxuICAgICAgICAgICAgPFZlcmlmaWNhdGlvblJlcXVlc3RFeHBsb3JlciB0eG5JZD17dHhuSWR9IHJlcXVlc3Q9e3JlcXVlc3R9IGtleT17dHhuSWR9IC8+LFxuICAgICAgICApIH1cbiAgICAgICAgeyByZXF1ZXN0cy5zaXplIDwgMSAmJiBfdChcIk5vIHZlcmlmaWNhdGlvbiByZXF1ZXN0cyBmb3VuZFwiKSB9XG4gICAgPC9CYXNlVG9vbD47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBWZXJpZmljYXRpb25FeHBsb3JlcjtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUtBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUEzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBZUEsTUFBTUEsU0FBZ0MsR0FBRztFQUNyQyxDQUFDQywwQkFBQSxDQUFNQyxNQUFQLEdBQWdCLElBQUFDLG9CQUFBLEVBQUksUUFBSixDQURxQjtFQUVyQyxDQUFDRiwwQkFBQSxDQUFNRyxTQUFQLEdBQW1CLElBQUFELG9CQUFBLEVBQUksV0FBSixDQUZrQjtFQUdyQyxDQUFDRiwwQkFBQSxDQUFNSSxLQUFQLEdBQWUsSUFBQUYsb0JBQUEsRUFBSSxPQUFKLENBSHNCO0VBSXJDLENBQUNGLDBCQUFBLENBQU1LLElBQVAsR0FBYyxJQUFBSCxvQkFBQSxFQUFJLE1BQUosQ0FKdUI7RUFLckMsQ0FBQ0YsMEJBQUEsQ0FBTU0sT0FBUCxHQUFpQixJQUFBSixvQkFBQSxFQUFJLFNBQUosQ0FMb0I7RUFNckMsQ0FBQ0YsMEJBQUEsQ0FBTU8sU0FBUCxHQUFtQixJQUFBTCxvQkFBQSxFQUFJLFdBQUo7QUFOa0IsQ0FBekM7O0FBU0EsTUFBTU0sMkJBR0osR0FBRyxRQUF3QjtFQUFBLElBQXZCO0lBQUVDLEtBQUY7SUFBU0M7RUFBVCxDQUF1QjtFQUN6QixNQUFNLEdBQUdDLFdBQUgsSUFBa0IsSUFBQUMsZUFBQSxHQUF4QjtFQUNBLE1BQU0sQ0FBQ0MsT0FBRCxFQUFVQyxpQkFBVixJQUErQixJQUFBRixlQUFBLEVBQVNGLE9BQU8sQ0FBQ0csT0FBakIsQ0FBckM7RUFFQTs7RUFDQSxJQUFBRSxxQ0FBQSxFQUFxQkwsT0FBckIsRUFBOEJNLDZDQUFBLENBQXlCQyxNQUF2RCxFQUErRE4sV0FBL0Q7RUFFQTs7RUFDQSxJQUFBTyxnQkFBQSxFQUFVLE1BQU07SUFDWixJQUFJUixPQUFPLENBQUNHLE9BQVIsSUFBbUIsQ0FBdkIsRUFBMEI7SUFFMUI7O0lBQ0EsTUFBTU0sRUFBRSxHQUFHQyxXQUFXLENBQUMsTUFBTTtNQUN6Qk4saUJBQWlCLENBQUNKLE9BQU8sQ0FBQ0csT0FBVCxDQUFqQjtJQUNILENBRnFCLEVBRW5CLEdBRm1CLENBQXRCO0lBSUEsT0FBTyxNQUFNO01BQUVRLGFBQWEsQ0FBQ0YsRUFBRCxDQUFiO0lBQW9CLENBQW5DO0VBQ0gsQ0FURCxFQVNHLENBQUNULE9BQUQsQ0FUSDtFQVdBLG9CQUFRO0lBQUssU0FBUyxFQUFDO0VBQWYsZ0JBQ0osc0RBQ0kseUNBQU0sSUFBQVksbUJBQUEsRUFBRyxhQUFILENBQU4sQ0FESixlQUVJLHlDQUFNYixLQUFOLENBRkosZUFHSSx5Q0FBTSxJQUFBYSxtQkFBQSxFQUFHLE9BQUgsQ0FBTixDQUhKLGVBSUkseUNBQU12QixTQUFTLENBQUNXLE9BQU8sQ0FBQ2EsS0FBVCxDQUFULEdBQTJCLElBQUFELG1CQUFBLEVBQUd2QixTQUFTLENBQUNXLE9BQU8sQ0FBQ2EsS0FBVCxDQUFaLENBQTNCLEdBQTBEYixPQUFPLENBQUNhLEtBQXhFLENBSkosZUFLSSx5Q0FBTSxJQUFBRCxtQkFBQSxFQUFHLFNBQUgsQ0FBTixDQUxKLGVBTUkseUNBQU1FLElBQUksQ0FBQ0MsS0FBTCxDQUFXWixPQUFPLEdBQUcsSUFBckIsQ0FBTixDQU5KLGVBT0kseUNBQU0sSUFBQVMsbUJBQUEsRUFBRyxTQUFILENBQU4sQ0FQSixlQVFJLHlDQUFNWixPQUFPLENBQUNnQixPQUFSLElBQW1CaEIsT0FBTyxDQUFDZ0IsT0FBUixDQUFnQkMsSUFBaEIsQ0FBcUIsSUFBckIsQ0FBekIsQ0FSSixlQVNJLHlDQUFNLElBQUFMLG1CQUFBLEVBQUcsV0FBSCxDQUFOLENBVEosZUFVSSx5Q0FBTVosT0FBTyxDQUFDa0IsZ0JBQWQsQ0FWSixlQVdJLHlDQUFNLElBQUFOLG1CQUFBLEVBQUcsY0FBSCxDQUFOLENBWEosZUFZSSx5Q0FBTU8sSUFBSSxDQUFDQyxTQUFMLENBQWVwQixPQUFPLENBQUNxQixXQUF2QixDQUFOLENBWkosQ0FESSxDQUFSO0FBZ0JILENBdENEOztBQXdDQSxNQUFNQyxvQkFBb0IsR0FBRyxTQUFnQztFQUFBLElBQS9CO0lBQUVDO0VBQUYsQ0FBK0I7RUFDekQsTUFBTUMsR0FBRyxHQUFHLElBQUFDLGlCQUFBLEVBQVdDLDRCQUFYLENBQVo7RUFDQSxNQUFNQyxPQUFPLEdBQUcsSUFBQUYsaUJBQUEsRUFBV0cseUJBQVgsQ0FBaEI7RUFFQSxNQUFNQyxRQUFRLEdBQUcsSUFBQUMsMENBQUEsRUFBMEJOLEdBQTFCLEVBQStCTyxtQkFBQSxDQUFZQyxtQkFBM0MsRUFBZ0UsTUFBTTtJQUNuRixPQUFPUixHQUFHLENBQUNTLE1BQUosQ0FBV0MsMEJBQVgsQ0FBc0Msa0JBQXRDLEdBQTJEQyxHQUEzRCxDQUErRFIsT0FBTyxDQUFDUyxJQUFSLENBQWFDLE1BQTVFLEtBQ0EsSUFBSUMsR0FBSixFQURQO0VBRUgsQ0FIZ0IsQ0FBakI7RUFLQSxvQkFBTyw2QkFBQyxpQkFBRDtJQUFVLE1BQU0sRUFBRWY7RUFBbEIsR0FDRGdCLEtBQUssQ0FBQ0MsSUFBTixDQUFXWCxRQUFRLENBQUNZLE9BQVQsRUFBWCxFQUErQkMsT0FBL0IsR0FBeUNDLEdBQXpDLENBQTZDO0lBQUEsSUFBQyxDQUFDNUMsS0FBRCxFQUFRQyxPQUFSLENBQUQ7SUFBQSxvQkFDM0MsNkJBQUMsMkJBQUQ7TUFBNkIsS0FBSyxFQUFFRCxLQUFwQztNQUEyQyxPQUFPLEVBQUVDLE9BQXBEO01BQTZELEdBQUcsRUFBRUQ7SUFBbEUsRUFEMkM7RUFBQSxDQUE3QyxDQURDLEVBSUQ4QixRQUFRLENBQUNlLElBQVQsR0FBZ0IsQ0FBaEIsSUFBcUIsSUFBQWhDLG1CQUFBLEVBQUcsZ0NBQUgsQ0FKcEIsQ0FBUDtBQU1ILENBZkQ7O2VBaUJlVSxvQiJ9