"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VideoRoomView = void 0;

var _react = _interopRequireWildcard(require("react"));

var _useCall = require("../../hooks/useCall");

var _Call = require("../../models/Call");

var _MatrixClientContext = _interopRequireDefault(require("../../contexts/MatrixClientContext"));

var _AppTile = _interopRequireDefault(require("../views/elements/AppTile"));

var _CallLobby = require("../views/voip/CallLobby");

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
const LoadedVideoRoomView = _ref => {
  let {
    room,
    resizing,
    call
  } = _ref;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const connected = (0, _Call.isConnected)((0, _useCall.useConnectionState)(call)); // We'll take this opportunity to tidy up our room state

  (0, _react.useEffect)(() => {
    call?.clean();
  }, [call]);
  if (!call) return null;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_VideoRoomView"
  }, connected ? null : /*#__PURE__*/_react.default.createElement(_CallLobby.CallLobby, {
    room: room,
    call: call
  }), /*#__PURE__*/_react.default.createElement(_AppTile.default, {
    app: call.widget,
    room: room,
    userId: cli.credentials.userId,
    creatorUserId: call.widget.creatorUserId,
    waitForIframeLoad: call.widget.waitForIframeLoad,
    showMenubar: false,
    pointerEvents: resizing ? "none" : undefined
  }));
};

const VideoRoomView = _ref2 => {
  let {
    room,
    resizing
  } = _ref2;
  const call = (0, _useCall.useCall)(room.roomId);
  return call ? /*#__PURE__*/_react.default.createElement(LoadedVideoRoomView, {
    room: room,
    resizing: resizing,
    call: call
  }) : null;
};

exports.VideoRoomView = VideoRoomView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMb2FkZWRWaWRlb1Jvb21WaWV3Iiwicm9vbSIsInJlc2l6aW5nIiwiY2FsbCIsImNsaSIsInVzZUNvbnRleHQiLCJNYXRyaXhDbGllbnRDb250ZXh0IiwiY29ubmVjdGVkIiwiaXNDb25uZWN0ZWQiLCJ1c2VDb25uZWN0aW9uU3RhdGUiLCJ1c2VFZmZlY3QiLCJjbGVhbiIsIndpZGdldCIsImNyZWRlbnRpYWxzIiwidXNlcklkIiwiY3JlYXRvclVzZXJJZCIsIndhaXRGb3JJZnJhbWVMb2FkIiwidW5kZWZpbmVkIiwiVmlkZW9Sb29tVmlldyIsInVzZUNhbGwiLCJyb29tSWQiXSwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9zdHJ1Y3R1cmVzL1ZpZGVvUm9vbVZpZXcudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMiBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBGQywgdXNlQ29udGV4dCwgdXNlRWZmZWN0IH0gZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCB0eXBlIHsgUm9vbSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuaW1wb3J0IHR5cGUgeyBDYWxsIH0gZnJvbSBcIi4uLy4uL21vZGVscy9DYWxsXCI7XG5pbXBvcnQgeyB1c2VDYWxsLCB1c2VDb25uZWN0aW9uU3RhdGUgfSBmcm9tIFwiLi4vLi4vaG9va3MvdXNlQ2FsbFwiO1xuaW1wb3J0IHsgaXNDb25uZWN0ZWQgfSBmcm9tIFwiLi4vLi4vbW9kZWxzL0NhbGxcIjtcbmltcG9ydCBNYXRyaXhDbGllbnRDb250ZXh0IGZyb20gXCIuLi8uLi9jb250ZXh0cy9NYXRyaXhDbGllbnRDb250ZXh0XCI7XG5pbXBvcnQgQXBwVGlsZSBmcm9tIFwiLi4vdmlld3MvZWxlbWVudHMvQXBwVGlsZVwiO1xuaW1wb3J0IHsgQ2FsbExvYmJ5IH0gZnJvbSBcIi4uL3ZpZXdzL3ZvaXAvQ2FsbExvYmJ5XCI7XG5cbmludGVyZmFjZSBQcm9wcyB7XG4gICAgcm9vbTogUm9vbTtcbiAgICByZXNpemluZzogYm9vbGVhbjtcbn1cblxuY29uc3QgTG9hZGVkVmlkZW9Sb29tVmlldzogRkM8UHJvcHMgJiB7IGNhbGw6IENhbGwgfT4gPSAoeyByb29tLCByZXNpemluZywgY2FsbCB9KSA9PiB7XG4gICAgY29uc3QgY2xpID0gdXNlQ29udGV4dChNYXRyaXhDbGllbnRDb250ZXh0KTtcbiAgICBjb25zdCBjb25uZWN0ZWQgPSBpc0Nvbm5lY3RlZCh1c2VDb25uZWN0aW9uU3RhdGUoY2FsbCkpO1xuXG4gICAgLy8gV2UnbGwgdGFrZSB0aGlzIG9wcG9ydHVuaXR5IHRvIHRpZHkgdXAgb3VyIHJvb20gc3RhdGVcbiAgICB1c2VFZmZlY3QoKCkgPT4geyBjYWxsPy5jbGVhbigpOyB9LCBbY2FsbF0pO1xuXG4gICAgaWYgKCFjYWxsKSByZXR1cm4gbnVsbDtcblxuICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X1ZpZGVvUm9vbVZpZXdcIj5cbiAgICAgICAgeyBjb25uZWN0ZWQgPyBudWxsIDogPENhbGxMb2JieSByb29tPXtyb29tfSBjYWxsPXtjYWxsfSAvPiB9XG4gICAgICAgIHsgLyogV2UgcmVuZGVyIHRoZSB3aWRnZXQgZXZlbiBpZiB3ZSdyZSBkaXNjb25uZWN0ZWQsIHNvIGl0IHN0YXlzIGxvYWRlZCAqLyB9XG4gICAgICAgIDxBcHBUaWxlXG4gICAgICAgICAgICBhcHA9e2NhbGwud2lkZ2V0fVxuICAgICAgICAgICAgcm9vbT17cm9vbX1cbiAgICAgICAgICAgIHVzZXJJZD17Y2xpLmNyZWRlbnRpYWxzLnVzZXJJZH1cbiAgICAgICAgICAgIGNyZWF0b3JVc2VySWQ9e2NhbGwud2lkZ2V0LmNyZWF0b3JVc2VySWR9XG4gICAgICAgICAgICB3YWl0Rm9ySWZyYW1lTG9hZD17Y2FsbC53aWRnZXQud2FpdEZvcklmcmFtZUxvYWR9XG4gICAgICAgICAgICBzaG93TWVudWJhcj17ZmFsc2V9XG4gICAgICAgICAgICBwb2ludGVyRXZlbnRzPXtyZXNpemluZyA/IFwibm9uZVwiIDogdW5kZWZpbmVkfVxuICAgICAgICAvPlxuICAgIDwvZGl2Pjtcbn07XG5cbmV4cG9ydCBjb25zdCBWaWRlb1Jvb21WaWV3OiBGQzxQcm9wcz4gPSAoeyByb29tLCByZXNpemluZyB9KSA9PiB7XG4gICAgY29uc3QgY2FsbCA9IHVzZUNhbGwocm9vbS5yb29tSWQpO1xuICAgIHJldHVybiBjYWxsID8gPExvYWRlZFZpZGVvUm9vbVZpZXcgcm9vbT17cm9vbX0gcmVzaXppbmc9e3Jlc2l6aW5nfSBjYWxsPXtjYWxsfSAvPiA6IG51bGw7XG59O1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFnQkE7O0FBSUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7OztBQXhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFpQkEsTUFBTUEsbUJBQStDLEdBQUcsUUFBOEI7RUFBQSxJQUE3QjtJQUFFQyxJQUFGO0lBQVFDLFFBQVI7SUFBa0JDO0VBQWxCLENBQTZCO0VBQ2xGLE1BQU1DLEdBQUcsR0FBRyxJQUFBQyxpQkFBQSxFQUFXQyw0QkFBWCxDQUFaO0VBQ0EsTUFBTUMsU0FBUyxHQUFHLElBQUFDLGlCQUFBLEVBQVksSUFBQUMsMkJBQUEsRUFBbUJOLElBQW5CLENBQVosQ0FBbEIsQ0FGa0YsQ0FJbEY7O0VBQ0EsSUFBQU8sZ0JBQUEsRUFBVSxNQUFNO0lBQUVQLElBQUksRUFBRVEsS0FBTjtFQUFnQixDQUFsQyxFQUFvQyxDQUFDUixJQUFELENBQXBDO0VBRUEsSUFBSSxDQUFDQSxJQUFMLEVBQVcsT0FBTyxJQUFQO0VBRVgsb0JBQU87SUFBSyxTQUFTLEVBQUM7RUFBZixHQUNESSxTQUFTLEdBQUcsSUFBSCxnQkFBVSw2QkFBQyxvQkFBRDtJQUFXLElBQUksRUFBRU4sSUFBakI7SUFBdUIsSUFBSSxFQUFFRTtFQUE3QixFQURsQixlQUdILDZCQUFDLGdCQUFEO0lBQ0ksR0FBRyxFQUFFQSxJQUFJLENBQUNTLE1BRGQ7SUFFSSxJQUFJLEVBQUVYLElBRlY7SUFHSSxNQUFNLEVBQUVHLEdBQUcsQ0FBQ1MsV0FBSixDQUFnQkMsTUFINUI7SUFJSSxhQUFhLEVBQUVYLElBQUksQ0FBQ1MsTUFBTCxDQUFZRyxhQUovQjtJQUtJLGlCQUFpQixFQUFFWixJQUFJLENBQUNTLE1BQUwsQ0FBWUksaUJBTG5DO0lBTUksV0FBVyxFQUFFLEtBTmpCO0lBT0ksYUFBYSxFQUFFZCxRQUFRLEdBQUcsTUFBSCxHQUFZZTtFQVB2QyxFQUhHLENBQVA7QUFhSCxDQXRCRDs7QUF3Qk8sTUFBTUMsYUFBd0IsR0FBRyxTQUF3QjtFQUFBLElBQXZCO0lBQUVqQixJQUFGO0lBQVFDO0VBQVIsQ0FBdUI7RUFDNUQsTUFBTUMsSUFBSSxHQUFHLElBQUFnQixnQkFBQSxFQUFRbEIsSUFBSSxDQUFDbUIsTUFBYixDQUFiO0VBQ0EsT0FBT2pCLElBQUksZ0JBQUcsNkJBQUMsbUJBQUQ7SUFBcUIsSUFBSSxFQUFFRixJQUEzQjtJQUFpQyxRQUFRLEVBQUVDLFFBQTNDO0lBQXFELElBQUksRUFBRUM7RUFBM0QsRUFBSCxHQUF5RSxJQUFwRjtBQUNILENBSE0ifQ==