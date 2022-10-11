"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _room = require("matrix-js-sdk/src/models/room");

var _useEventEmitter = require("../../../hooks/useEventEmitter");

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
const RoomName = _ref => {
  let {
    room,
    children
  } = _ref;
  const [name, setName] = (0, _react.useState)(room?.name);
  (0, _useEventEmitter.useTypedEventEmitter)(room, _room.RoomEvent.Name, () => {
    setName(room?.name);
  });
  (0, _react.useEffect)(() => {
    setName(room?.name);
  }, [room]);
  if (children) return children(name);
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, name || "");
};

var _default = RoomName;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSb29tTmFtZSIsInJvb20iLCJjaGlsZHJlbiIsIm5hbWUiLCJzZXROYW1lIiwidXNlU3RhdGUiLCJ1c2VUeXBlZEV2ZW50RW1pdHRlciIsIlJvb21FdmVudCIsIk5hbWUiLCJ1c2VFZmZlY3QiXSwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29tcG9uZW50cy92aWV3cy9lbGVtZW50cy9Sb29tTmFtZS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IFJvb20sIFJvb21FdmVudCB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuXG5pbXBvcnQgeyB1c2VUeXBlZEV2ZW50RW1pdHRlciB9IGZyb20gXCIuLi8uLi8uLi9ob29rcy91c2VFdmVudEVtaXR0ZXJcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgcm9vbTogUm9vbTtcbiAgICBjaGlsZHJlbj8obmFtZTogc3RyaW5nKTogSlNYLkVsZW1lbnQ7XG59XG5cbmNvbnN0IFJvb21OYW1lID0gKHsgcm9vbSwgY2hpbGRyZW4gfTogSVByb3BzKTogSlNYLkVsZW1lbnQgPT4ge1xuICAgIGNvbnN0IFtuYW1lLCBzZXROYW1lXSA9IHVzZVN0YXRlKHJvb20/Lm5hbWUpO1xuICAgIHVzZVR5cGVkRXZlbnRFbWl0dGVyKHJvb20sIFJvb21FdmVudC5OYW1lLCAoKSA9PiB7XG4gICAgICAgIHNldE5hbWUocm9vbT8ubmFtZSk7XG4gICAgfSk7XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgc2V0TmFtZShyb29tPy5uYW1lKTtcbiAgICB9LCBbcm9vbV0pO1xuXG4gICAgaWYgKGNoaWxkcmVuKSByZXR1cm4gY2hpbGRyZW4obmFtZSk7XG4gICAgcmV0dXJuIDw+eyBuYW1lIHx8IFwiXCIgfTwvPjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFJvb21OYW1lO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBZ0JBOztBQUNBOztBQUVBOzs7Ozs7QUFuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBWUEsTUFBTUEsUUFBUSxHQUFHLFFBQTZDO0VBQUEsSUFBNUM7SUFBRUMsSUFBRjtJQUFRQztFQUFSLENBQTRDO0VBQzFELE1BQU0sQ0FBQ0MsSUFBRCxFQUFPQyxPQUFQLElBQWtCLElBQUFDLGVBQUEsRUFBU0osSUFBSSxFQUFFRSxJQUFmLENBQXhCO0VBQ0EsSUFBQUcscUNBQUEsRUFBcUJMLElBQXJCLEVBQTJCTSxlQUFBLENBQVVDLElBQXJDLEVBQTJDLE1BQU07SUFDN0NKLE9BQU8sQ0FBQ0gsSUFBSSxFQUFFRSxJQUFQLENBQVA7RUFDSCxDQUZEO0VBR0EsSUFBQU0sZ0JBQUEsRUFBVSxNQUFNO0lBQ1pMLE9BQU8sQ0FBQ0gsSUFBSSxFQUFFRSxJQUFQLENBQVA7RUFDSCxDQUZELEVBRUcsQ0FBQ0YsSUFBRCxDQUZIO0VBSUEsSUFBSUMsUUFBSixFQUFjLE9BQU9BLFFBQVEsQ0FBQ0MsSUFBRCxDQUFmO0VBQ2Qsb0JBQU8sNERBQUlBLElBQUksSUFBSSxFQUFaLENBQVA7QUFDSCxDQVhEOztlQWFlSCxRIn0=