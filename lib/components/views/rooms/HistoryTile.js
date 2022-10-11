"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _eventTimeline = require("matrix-js-sdk/src/models/event-timeline");

var _EventTileBubble = _interopRequireDefault(require("../messages/EventTileBubble"));

var _RoomContext = _interopRequireDefault(require("../../../contexts/RoomContext"));

var _languageHandler = require("../../../languageHandler");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2021 Robin Townsend <robin@robin.town>

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
const HistoryTile = () => {
  const {
    room
  } = (0, _react.useContext)(_RoomContext.default);
  const oldState = room.getLiveTimeline().getState(_eventTimeline.EventTimeline.BACKWARDS);
  const encryptionState = oldState.getStateEvents("m.room.encryption")[0];
  const historyState = oldState.getStateEvents("m.room.history_visibility")[0]?.getContent().history_visibility;
  let subtitle;

  if (historyState == "invited") {
    subtitle = (0, _languageHandler._t)("You don't have permission to view messages from before you were invited.");
  } else if (historyState == "joined") {
    subtitle = (0, _languageHandler._t)("You don't have permission to view messages from before you joined.");
  } else if (encryptionState) {
    subtitle = (0, _languageHandler._t)("Encrypted messages before this point are unavailable.");
  }

  return /*#__PURE__*/_react.default.createElement(_EventTileBubble.default, {
    className: "mx_HistoryTile",
    title: (0, _languageHandler._t)("You can't see earlier messages"),
    subtitle: subtitle
  });
};

var _default = HistoryTile;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJIaXN0b3J5VGlsZSIsInJvb20iLCJ1c2VDb250ZXh0IiwiUm9vbUNvbnRleHQiLCJvbGRTdGF0ZSIsImdldExpdmVUaW1lbGluZSIsImdldFN0YXRlIiwiRXZlbnRUaW1lbGluZSIsIkJBQ0tXQVJEUyIsImVuY3J5cHRpb25TdGF0ZSIsImdldFN0YXRlRXZlbnRzIiwiaGlzdG9yeVN0YXRlIiwiZ2V0Q29udGVudCIsImhpc3RvcnlfdmlzaWJpbGl0eSIsInN1YnRpdGxlIiwiX3QiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9yb29tcy9IaXN0b3J5VGlsZS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIxIFJvYmluIFRvd25zZW5kIDxyb2JpbkByb2Jpbi50b3duPlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyB1c2VDb250ZXh0IH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBFdmVudFRpbWVsaW5lIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudC10aW1lbGluZVwiO1xuXG5pbXBvcnQgRXZlbnRUaWxlQnViYmxlIGZyb20gXCIuLi9tZXNzYWdlcy9FdmVudFRpbGVCdWJibGVcIjtcbmltcG9ydCBSb29tQ29udGV4dCBmcm9tIFwiLi4vLi4vLi4vY29udGV4dHMvUm9vbUNvbnRleHRcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuXG5jb25zdCBIaXN0b3J5VGlsZSA9ICgpID0+IHtcbiAgICBjb25zdCB7IHJvb20gfSA9IHVzZUNvbnRleHQoUm9vbUNvbnRleHQpO1xuXG4gICAgY29uc3Qgb2xkU3RhdGUgPSByb29tLmdldExpdmVUaW1lbGluZSgpLmdldFN0YXRlKEV2ZW50VGltZWxpbmUuQkFDS1dBUkRTKTtcbiAgICBjb25zdCBlbmNyeXB0aW9uU3RhdGUgPSBvbGRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhcIm0ucm9vbS5lbmNyeXB0aW9uXCIpWzBdO1xuICAgIGNvbnN0IGhpc3RvcnlTdGF0ZSA9IG9sZFN0YXRlLmdldFN0YXRlRXZlbnRzKFwibS5yb29tLmhpc3RvcnlfdmlzaWJpbGl0eVwiKVswXT8uZ2V0Q29udGVudCgpLmhpc3RvcnlfdmlzaWJpbGl0eTtcblxuICAgIGxldCBzdWJ0aXRsZTtcbiAgICBpZiAoaGlzdG9yeVN0YXRlID09IFwiaW52aXRlZFwiKSB7XG4gICAgICAgIHN1YnRpdGxlID0gX3QoXCJZb3UgZG9uJ3QgaGF2ZSBwZXJtaXNzaW9uIHRvIHZpZXcgbWVzc2FnZXMgZnJvbSBiZWZvcmUgeW91IHdlcmUgaW52aXRlZC5cIik7XG4gICAgfSBlbHNlIGlmIChoaXN0b3J5U3RhdGUgPT0gXCJqb2luZWRcIikge1xuICAgICAgICBzdWJ0aXRsZSA9IF90KFwiWW91IGRvbid0IGhhdmUgcGVybWlzc2lvbiB0byB2aWV3IG1lc3NhZ2VzIGZyb20gYmVmb3JlIHlvdSBqb2luZWQuXCIpO1xuICAgIH0gZWxzZSBpZiAoZW5jcnlwdGlvblN0YXRlKSB7XG4gICAgICAgIHN1YnRpdGxlID0gX3QoXCJFbmNyeXB0ZWQgbWVzc2FnZXMgYmVmb3JlIHRoaXMgcG9pbnQgYXJlIHVuYXZhaWxhYmxlLlwiKTtcbiAgICB9XG5cbiAgICByZXR1cm4gPEV2ZW50VGlsZUJ1YmJsZVxuICAgICAgICBjbGFzc05hbWU9XCJteF9IaXN0b3J5VGlsZVwiXG4gICAgICAgIHRpdGxlPXtfdChcIllvdSBjYW4ndCBzZWUgZWFybGllciBtZXNzYWdlc1wiKX1cbiAgICAgICAgc3VidGl0bGU9e3N1YnRpdGxlfVxuICAgIC8+O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgSGlzdG9yeVRpbGU7XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7Ozs7O0FBckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVNBLE1BQU1BLFdBQVcsR0FBRyxNQUFNO0VBQ3RCLE1BQU07SUFBRUM7RUFBRixJQUFXLElBQUFDLGlCQUFBLEVBQVdDLG9CQUFYLENBQWpCO0VBRUEsTUFBTUMsUUFBUSxHQUFHSCxJQUFJLENBQUNJLGVBQUwsR0FBdUJDLFFBQXZCLENBQWdDQyw0QkFBQSxDQUFjQyxTQUE5QyxDQUFqQjtFQUNBLE1BQU1DLGVBQWUsR0FBR0wsUUFBUSxDQUFDTSxjQUFULENBQXdCLG1CQUF4QixFQUE2QyxDQUE3QyxDQUF4QjtFQUNBLE1BQU1DLFlBQVksR0FBR1AsUUFBUSxDQUFDTSxjQUFULENBQXdCLDJCQUF4QixFQUFxRCxDQUFyRCxHQUF5REUsVUFBekQsR0FBc0VDLGtCQUEzRjtFQUVBLElBQUlDLFFBQUo7O0VBQ0EsSUFBSUgsWUFBWSxJQUFJLFNBQXBCLEVBQStCO0lBQzNCRyxRQUFRLEdBQUcsSUFBQUMsbUJBQUEsRUFBRywwRUFBSCxDQUFYO0VBQ0gsQ0FGRCxNQUVPLElBQUlKLFlBQVksSUFBSSxRQUFwQixFQUE4QjtJQUNqQ0csUUFBUSxHQUFHLElBQUFDLG1CQUFBLEVBQUcsb0VBQUgsQ0FBWDtFQUNILENBRk0sTUFFQSxJQUFJTixlQUFKLEVBQXFCO0lBQ3hCSyxRQUFRLEdBQUcsSUFBQUMsbUJBQUEsRUFBRyx1REFBSCxDQUFYO0VBQ0g7O0VBRUQsb0JBQU8sNkJBQUMsd0JBQUQ7SUFDSCxTQUFTLEVBQUMsZ0JBRFA7SUFFSCxLQUFLLEVBQUUsSUFBQUEsbUJBQUEsRUFBRyxnQ0FBSCxDQUZKO0lBR0gsUUFBUSxFQUFFRDtFQUhQLEVBQVA7QUFLSCxDQXJCRDs7ZUF1QmVkLFcifQ==