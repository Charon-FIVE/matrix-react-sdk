"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _languageHandler = require("../../../languageHandler");

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _DateUtils = require("../../../DateUtils");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2020 - 2021 The Matrix.org Foundation C.I.C.

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
const RedactedBody = /*#__PURE__*/_react.default.forwardRef((_ref, ref) => {
  let {
    mxEvent
  } = _ref;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  let text = (0, _languageHandler._t)("Message deleted");
  const unsigned = mxEvent.getUnsigned();
  const redactedBecauseUserId = unsigned && unsigned.redacted_because && unsigned.redacted_because.sender;

  if (redactedBecauseUserId && redactedBecauseUserId !== mxEvent.getSender()) {
    const room = cli.getRoom(mxEvent.getRoomId());
    const sender = room && room.getMember(redactedBecauseUserId);
    text = (0, _languageHandler._t)("Message deleted by %(name)s", {
      name: sender ? sender.name : redactedBecauseUserId
    });
  }

  const showTwelveHour = _SettingsStore.default.getValue("showTwelveHourTimestamps");

  const fullDate = (0, _DateUtils.formatFullDate)(new Date(unsigned.redacted_because.origin_server_ts), showTwelveHour);
  const titleText = (0, _languageHandler._t)("Message deleted on %(date)s", {
    date: fullDate
  });
  return /*#__PURE__*/_react.default.createElement("span", {
    className: "mx_RedactedBody",
    ref: ref,
    title: titleText
  }, text);
});

var _default = RedactedBody;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZWRhY3RlZEJvZHkiLCJSZWFjdCIsImZvcndhcmRSZWYiLCJyZWYiLCJteEV2ZW50IiwiY2xpIiwidXNlQ29udGV4dCIsIk1hdHJpeENsaWVudENvbnRleHQiLCJ0ZXh0IiwiX3QiLCJ1bnNpZ25lZCIsImdldFVuc2lnbmVkIiwicmVkYWN0ZWRCZWNhdXNlVXNlcklkIiwicmVkYWN0ZWRfYmVjYXVzZSIsInNlbmRlciIsImdldFNlbmRlciIsInJvb20iLCJnZXRSb29tIiwiZ2V0Um9vbUlkIiwiZ2V0TWVtYmVyIiwibmFtZSIsInNob3dUd2VsdmVIb3VyIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwiZnVsbERhdGUiLCJmb3JtYXRGdWxsRGF0ZSIsIkRhdGUiLCJvcmlnaW5fc2VydmVyX3RzIiwidGl0bGVUZXh0IiwiZGF0ZSJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL1JlZGFjdGVkQm9keS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIC0gMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyB1c2VDb250ZXh0IH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY2xpZW50XCI7XG5pbXBvcnQgeyBNYXRyaXhFdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvZXZlbnRcIjtcblxuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tIFwiLi4vLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuaW1wb3J0IHsgZm9ybWF0RnVsbERhdGUgfSBmcm9tIFwiLi4vLi4vLi4vRGF0ZVV0aWxzXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHsgSUJvZHlQcm9wcyB9IGZyb20gXCIuL0lCb2R5UHJvcHNcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgbXhFdmVudDogTWF0cml4RXZlbnQ7XG59XG5cbmNvbnN0IFJlZGFjdGVkQm9keSA9IFJlYWN0LmZvcndhcmRSZWY8YW55LCBJUHJvcHMgfCBJQm9keVByb3BzPigoeyBteEV2ZW50IH0sIHJlZikgPT4ge1xuICAgIGNvbnN0IGNsaTogTWF0cml4Q2xpZW50ID0gdXNlQ29udGV4dChNYXRyaXhDbGllbnRDb250ZXh0KTtcbiAgICBsZXQgdGV4dCA9IF90KFwiTWVzc2FnZSBkZWxldGVkXCIpO1xuICAgIGNvbnN0IHVuc2lnbmVkID0gbXhFdmVudC5nZXRVbnNpZ25lZCgpO1xuICAgIGNvbnN0IHJlZGFjdGVkQmVjYXVzZVVzZXJJZCA9IHVuc2lnbmVkICYmIHVuc2lnbmVkLnJlZGFjdGVkX2JlY2F1c2UgJiYgdW5zaWduZWQucmVkYWN0ZWRfYmVjYXVzZS5zZW5kZXI7XG4gICAgaWYgKHJlZGFjdGVkQmVjYXVzZVVzZXJJZCAmJiByZWRhY3RlZEJlY2F1c2VVc2VySWQgIT09IG14RXZlbnQuZ2V0U2VuZGVyKCkpIHtcbiAgICAgICAgY29uc3Qgcm9vbSA9IGNsaS5nZXRSb29tKG14RXZlbnQuZ2V0Um9vbUlkKCkpO1xuICAgICAgICBjb25zdCBzZW5kZXIgPSByb29tICYmIHJvb20uZ2V0TWVtYmVyKHJlZGFjdGVkQmVjYXVzZVVzZXJJZCk7XG4gICAgICAgIHRleHQgPSBfdChcIk1lc3NhZ2UgZGVsZXRlZCBieSAlKG5hbWUpc1wiLCB7IG5hbWU6IHNlbmRlciA/IHNlbmRlci5uYW1lIDogcmVkYWN0ZWRCZWNhdXNlVXNlcklkIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IHNob3dUd2VsdmVIb3VyID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInNob3dUd2VsdmVIb3VyVGltZXN0YW1wc1wiKTtcbiAgICBjb25zdCBmdWxsRGF0ZSA9IGZvcm1hdEZ1bGxEYXRlKG5ldyBEYXRlKHVuc2lnbmVkLnJlZGFjdGVkX2JlY2F1c2Uub3JpZ2luX3NlcnZlcl90cyksIHNob3dUd2VsdmVIb3VyKTtcbiAgICBjb25zdCB0aXRsZVRleHQgPSBfdChcIk1lc3NhZ2UgZGVsZXRlZCBvbiAlKGRhdGUpc1wiLCB7IGRhdGU6IGZ1bGxEYXRlIH0pO1xuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfUmVkYWN0ZWRCb2R5XCIgcmVmPXtyZWZ9IHRpdGxlPXt0aXRsZVRleHR9PlxuICAgICAgICAgICAgeyB0ZXh0IH1cbiAgICAgICAgPC9zcGFuPlxuICAgICk7XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgUmVkYWN0ZWRCb2R5O1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFnQkE7O0FBSUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQXZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFnQkEsTUFBTUEsWUFBWSxnQkFBR0MsY0FBQSxDQUFNQyxVQUFOLENBQTJDLE9BQWNDLEdBQWQsS0FBc0I7RUFBQSxJQUFyQjtJQUFFQztFQUFGLENBQXFCO0VBQ2xGLE1BQU1DLEdBQWlCLEdBQUcsSUFBQUMsaUJBQUEsRUFBV0MsNEJBQVgsQ0FBMUI7RUFDQSxJQUFJQyxJQUFJLEdBQUcsSUFBQUMsbUJBQUEsRUFBRyxpQkFBSCxDQUFYO0VBQ0EsTUFBTUMsUUFBUSxHQUFHTixPQUFPLENBQUNPLFdBQVIsRUFBakI7RUFDQSxNQUFNQyxxQkFBcUIsR0FBR0YsUUFBUSxJQUFJQSxRQUFRLENBQUNHLGdCQUFyQixJQUF5Q0gsUUFBUSxDQUFDRyxnQkFBVCxDQUEwQkMsTUFBakc7O0VBQ0EsSUFBSUYscUJBQXFCLElBQUlBLHFCQUFxQixLQUFLUixPQUFPLENBQUNXLFNBQVIsRUFBdkQsRUFBNEU7SUFDeEUsTUFBTUMsSUFBSSxHQUFHWCxHQUFHLENBQUNZLE9BQUosQ0FBWWIsT0FBTyxDQUFDYyxTQUFSLEVBQVosQ0FBYjtJQUNBLE1BQU1KLE1BQU0sR0FBR0UsSUFBSSxJQUFJQSxJQUFJLENBQUNHLFNBQUwsQ0FBZVAscUJBQWYsQ0FBdkI7SUFDQUosSUFBSSxHQUFHLElBQUFDLG1CQUFBLEVBQUcsNkJBQUgsRUFBa0M7TUFBRVcsSUFBSSxFQUFFTixNQUFNLEdBQUdBLE1BQU0sQ0FBQ00sSUFBVixHQUFpQlI7SUFBL0IsQ0FBbEMsQ0FBUDtFQUNIOztFQUVELE1BQU1TLGNBQWMsR0FBR0Msc0JBQUEsQ0FBY0MsUUFBZCxDQUF1QiwwQkFBdkIsQ0FBdkI7O0VBQ0EsTUFBTUMsUUFBUSxHQUFHLElBQUFDLHlCQUFBLEVBQWUsSUFBSUMsSUFBSixDQUFTaEIsUUFBUSxDQUFDRyxnQkFBVCxDQUEwQmMsZ0JBQW5DLENBQWYsRUFBcUVOLGNBQXJFLENBQWpCO0VBQ0EsTUFBTU8sU0FBUyxHQUFHLElBQUFuQixtQkFBQSxFQUFHLDZCQUFILEVBQWtDO0lBQUVvQixJQUFJLEVBQUVMO0VBQVIsQ0FBbEMsQ0FBbEI7RUFFQSxvQkFDSTtJQUFNLFNBQVMsRUFBQyxpQkFBaEI7SUFBa0MsR0FBRyxFQUFFckIsR0FBdkM7SUFBNEMsS0FBSyxFQUFFeUI7RUFBbkQsR0FDTXBCLElBRE4sQ0FESjtBQUtILENBcEJvQixDQUFyQjs7ZUFzQmVSLFkifQ==