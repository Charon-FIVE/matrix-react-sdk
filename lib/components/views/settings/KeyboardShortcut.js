"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.KeyboardShortcut = exports.KeyboardKey = void 0;

var _react = _interopRequireDefault(require("react"));

var _KeyboardShortcuts = require("../../../accessibility/KeyboardShortcuts");

var _Keyboard = require("../../../Keyboard");

var _languageHandler = require("../../../languageHandler");

/*
Copyright 2022 Šimon Brandner <simon.bra.ag@gmail.com>

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
const KeyboardKey = _ref => {
  let {
    name,
    last
  } = _ref;
  const icon = _KeyboardShortcuts.KEY_ICON[name];
  const alternateName = _KeyboardShortcuts.ALTERNATE_KEY_NAME[name];
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("kbd", null, " ", icon || alternateName && (0, _languageHandler._t)(alternateName) || name, " "), !last && "+");
};

exports.KeyboardKey = KeyboardKey;

const KeyboardShortcut = _ref2 => {
  let {
    value
  } = _ref2;
  if (!value) return null;
  const modifiersElement = [];

  if (value.ctrlOrCmdKey) {
    modifiersElement.push( /*#__PURE__*/_react.default.createElement(KeyboardKey, {
      key: "ctrlOrCmdKey",
      name: _Keyboard.IS_MAC ? _Keyboard.Key.META : _Keyboard.Key.CONTROL
    }));
  } else if (value.ctrlKey) {
    modifiersElement.push( /*#__PURE__*/_react.default.createElement(KeyboardKey, {
      key: "ctrlKey",
      name: _Keyboard.Key.CONTROL
    }));
  } else if (value.metaKey) {
    modifiersElement.push( /*#__PURE__*/_react.default.createElement(KeyboardKey, {
      key: "metaKey",
      name: _Keyboard.Key.META
    }));
  }

  if (value.altKey) {
    modifiersElement.push( /*#__PURE__*/_react.default.createElement(KeyboardKey, {
      key: "altKey",
      name: _Keyboard.Key.ALT
    }));
  }

  if (value.shiftKey) {
    modifiersElement.push( /*#__PURE__*/_react.default.createElement(KeyboardKey, {
      key: "shiftKey",
      name: _Keyboard.Key.SHIFT
    }));
  }

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_KeyboardShortcut"
  }, modifiersElement, /*#__PURE__*/_react.default.createElement(KeyboardKey, {
    name: value.key,
    last: true
  }));
};

exports.KeyboardShortcut = KeyboardShortcut;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJLZXlib2FyZEtleSIsIm5hbWUiLCJsYXN0IiwiaWNvbiIsIktFWV9JQ09OIiwiYWx0ZXJuYXRlTmFtZSIsIkFMVEVSTkFURV9LRVlfTkFNRSIsIl90IiwiS2V5Ym9hcmRTaG9ydGN1dCIsInZhbHVlIiwibW9kaWZpZXJzRWxlbWVudCIsImN0cmxPckNtZEtleSIsInB1c2giLCJJU19NQUMiLCJLZXkiLCJNRVRBIiwiQ09OVFJPTCIsImN0cmxLZXkiLCJtZXRhS2V5IiwiYWx0S2V5IiwiQUxUIiwic2hpZnRLZXkiLCJTSElGVCIsImtleSJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL0tleWJvYXJkU2hvcnRjdXQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMiDFoGltb24gQnJhbmRuZXIgPHNpbW9uLmJyYS5hZ0BnbWFpbC5jb20+XG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuXG5pbXBvcnQgeyBBTFRFUk5BVEVfS0VZX05BTUUsIEtFWV9JQ09OIH0gZnJvbSBcIi4uLy4uLy4uL2FjY2Vzc2liaWxpdHkvS2V5Ym9hcmRTaG9ydGN1dHNcIjtcbmltcG9ydCB7IEtleUNvbWJvIH0gZnJvbSBcIi4uLy4uLy4uL0tleUJpbmRpbmdzTWFuYWdlclwiO1xuaW1wb3J0IHsgSVNfTUFDLCBLZXkgfSBmcm9tIFwiLi4vLi4vLi4vS2V5Ym9hcmRcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuXG5pbnRlcmZhY2UgSUtleWJvYXJkS2V5UHJvcHMge1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBsYXN0PzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNvbnN0IEtleWJvYXJkS2V5OiBSZWFjdC5GQzxJS2V5Ym9hcmRLZXlQcm9wcz4gPSAoeyBuYW1lLCBsYXN0IH0pID0+IHtcbiAgICBjb25zdCBpY29uID0gS0VZX0lDT05bbmFtZV07XG4gICAgY29uc3QgYWx0ZXJuYXRlTmFtZSA9IEFMVEVSTkFURV9LRVlfTkFNRVtuYW1lXTtcblxuICAgIHJldHVybiA8UmVhY3QuRnJhZ21lbnQ+XG4gICAgICAgIDxrYmQ+IHsgaWNvbiB8fCAoYWx0ZXJuYXRlTmFtZSAmJiBfdChhbHRlcm5hdGVOYW1lKSkgfHwgbmFtZSB9IDwva2JkPlxuICAgICAgICB7ICFsYXN0ICYmIFwiK1wiIH1cbiAgICA8L1JlYWN0LkZyYWdtZW50Pjtcbn07XG5cbmludGVyZmFjZSBJS2V5Ym9hcmRTaG9ydGN1dFByb3BzIHtcbiAgICB2YWx1ZTogS2V5Q29tYm87XG59XG5cbmV4cG9ydCBjb25zdCBLZXlib2FyZFNob3J0Y3V0OiBSZWFjdC5GQzxJS2V5Ym9hcmRTaG9ydGN1dFByb3BzPiA9ICh7IHZhbHVlIH0pID0+IHtcbiAgICBpZiAoIXZhbHVlKSByZXR1cm4gbnVsbDtcblxuICAgIGNvbnN0IG1vZGlmaWVyc0VsZW1lbnQgPSBbXTtcbiAgICBpZiAodmFsdWUuY3RybE9yQ21kS2V5KSB7XG4gICAgICAgIG1vZGlmaWVyc0VsZW1lbnQucHVzaCg8S2V5Ym9hcmRLZXkga2V5PVwiY3RybE9yQ21kS2V5XCIgbmFtZT17SVNfTUFDID8gS2V5Lk1FVEEgOiBLZXkuQ09OVFJPTH0gLz4pO1xuICAgIH0gZWxzZSBpZiAodmFsdWUuY3RybEtleSkge1xuICAgICAgICBtb2RpZmllcnNFbGVtZW50LnB1c2goPEtleWJvYXJkS2V5IGtleT1cImN0cmxLZXlcIiBuYW1lPXtLZXkuQ09OVFJPTH0gLz4pO1xuICAgIH0gZWxzZSBpZiAodmFsdWUubWV0YUtleSkge1xuICAgICAgICBtb2RpZmllcnNFbGVtZW50LnB1c2goPEtleWJvYXJkS2V5IGtleT1cIm1ldGFLZXlcIiBuYW1lPXtLZXkuTUVUQX0gLz4pO1xuICAgIH1cbiAgICBpZiAodmFsdWUuYWx0S2V5KSB7XG4gICAgICAgIG1vZGlmaWVyc0VsZW1lbnQucHVzaCg8S2V5Ym9hcmRLZXkga2V5PVwiYWx0S2V5XCIgbmFtZT17S2V5LkFMVH0gLz4pO1xuICAgIH1cbiAgICBpZiAodmFsdWUuc2hpZnRLZXkpIHtcbiAgICAgICAgbW9kaWZpZXJzRWxlbWVudC5wdXNoKDxLZXlib2FyZEtleSBrZXk9XCJzaGlmdEtleVwiIG5hbWU9e0tleS5TSElGVH0gLz4pO1xuICAgIH1cblxuICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X0tleWJvYXJkU2hvcnRjdXRcIj5cbiAgICAgICAgeyBtb2RpZmllcnNFbGVtZW50IH1cbiAgICAgICAgPEtleWJvYXJkS2V5IG5hbWU9e3ZhbHVlLmtleX0gbGFzdCAvPlxuICAgIDwvZGl2Pjtcbn07XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWdCQTs7QUFFQTs7QUFFQTs7QUFDQTs7QUFyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBY08sTUFBTUEsV0FBd0MsR0FBRyxRQUFvQjtFQUFBLElBQW5CO0lBQUVDLElBQUY7SUFBUUM7RUFBUixDQUFtQjtFQUN4RSxNQUFNQyxJQUFJLEdBQUdDLDJCQUFBLENBQVNILElBQVQsQ0FBYjtFQUNBLE1BQU1JLGFBQWEsR0FBR0MscUNBQUEsQ0FBbUJMLElBQW5CLENBQXRCO0VBRUEsb0JBQU8sNkJBQUMsY0FBRCxDQUFPLFFBQVAscUJBQ0gsK0NBQVFFLElBQUksSUFBS0UsYUFBYSxJQUFJLElBQUFFLG1CQUFBLEVBQUdGLGFBQUgsQ0FBMUIsSUFBZ0RKLElBQXhELE1BREcsRUFFRCxDQUFDQyxJQUFELElBQVMsR0FGUixDQUFQO0FBSUgsQ0FSTTs7OztBQWNBLE1BQU1NLGdCQUFrRCxHQUFHLFNBQWU7RUFBQSxJQUFkO0lBQUVDO0VBQUYsQ0FBYztFQUM3RSxJQUFJLENBQUNBLEtBQUwsRUFBWSxPQUFPLElBQVA7RUFFWixNQUFNQyxnQkFBZ0IsR0FBRyxFQUF6Qjs7RUFDQSxJQUFJRCxLQUFLLENBQUNFLFlBQVYsRUFBd0I7SUFDcEJELGdCQUFnQixDQUFDRSxJQUFqQixlQUFzQiw2QkFBQyxXQUFEO01BQWEsR0FBRyxFQUFDLGNBQWpCO01BQWdDLElBQUksRUFBRUMsZ0JBQUEsR0FBU0MsYUFBQSxDQUFJQyxJQUFiLEdBQW9CRCxhQUFBLENBQUlFO0lBQTlELEVBQXRCO0VBQ0gsQ0FGRCxNQUVPLElBQUlQLEtBQUssQ0FBQ1EsT0FBVixFQUFtQjtJQUN0QlAsZ0JBQWdCLENBQUNFLElBQWpCLGVBQXNCLDZCQUFDLFdBQUQ7TUFBYSxHQUFHLEVBQUMsU0FBakI7TUFBMkIsSUFBSSxFQUFFRSxhQUFBLENBQUlFO0lBQXJDLEVBQXRCO0VBQ0gsQ0FGTSxNQUVBLElBQUlQLEtBQUssQ0FBQ1MsT0FBVixFQUFtQjtJQUN0QlIsZ0JBQWdCLENBQUNFLElBQWpCLGVBQXNCLDZCQUFDLFdBQUQ7TUFBYSxHQUFHLEVBQUMsU0FBakI7TUFBMkIsSUFBSSxFQUFFRSxhQUFBLENBQUlDO0lBQXJDLEVBQXRCO0VBQ0g7O0VBQ0QsSUFBSU4sS0FBSyxDQUFDVSxNQUFWLEVBQWtCO0lBQ2RULGdCQUFnQixDQUFDRSxJQUFqQixlQUFzQiw2QkFBQyxXQUFEO01BQWEsR0FBRyxFQUFDLFFBQWpCO01BQTBCLElBQUksRUFBRUUsYUFBQSxDQUFJTTtJQUFwQyxFQUF0QjtFQUNIOztFQUNELElBQUlYLEtBQUssQ0FBQ1ksUUFBVixFQUFvQjtJQUNoQlgsZ0JBQWdCLENBQUNFLElBQWpCLGVBQXNCLDZCQUFDLFdBQUQ7TUFBYSxHQUFHLEVBQUMsVUFBakI7TUFBNEIsSUFBSSxFQUFFRSxhQUFBLENBQUlRO0lBQXRDLEVBQXRCO0VBQ0g7O0VBRUQsb0JBQU87SUFBSyxTQUFTLEVBQUM7RUFBZixHQUNEWixnQkFEQyxlQUVILDZCQUFDLFdBQUQ7SUFBYSxJQUFJLEVBQUVELEtBQUssQ0FBQ2MsR0FBekI7SUFBOEIsSUFBSTtFQUFsQyxFQUZHLENBQVA7QUFJSCxDQXRCTSJ9