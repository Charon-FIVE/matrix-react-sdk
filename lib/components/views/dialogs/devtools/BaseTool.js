"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.DevtoolsContext = void 0;

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _languageHandler = require("../../../../languageHandler");

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
const BaseTool = _ref => {
  let {
    className,
    actionLabel,
    onBack,
    onAction,
    children
  } = _ref;
  const [message, setMessage] = (0, _react.useState)(null);

  const onBackClick = () => {
    if (message) {
      setMessage(null);
    } else {
      onBack();
    }
  };

  let actionButton;

  if (message) {
    children = message;
  } else if (onAction) {
    const onActionClick = () => {
      onAction().then(msg => {
        if (typeof msg === "string") {
          setMessage(msg);
        }
      });
    };

    actionButton = /*#__PURE__*/_react.default.createElement("button", {
      onClick: onActionClick
    }, actionLabel);
  }

  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _classnames.default)("mx_DevTools_content", className)
  }, children), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_Dialog_buttons"
  }, /*#__PURE__*/_react.default.createElement("button", {
    onClick: onBackClick
  }, (0, _languageHandler._t)("Back")), actionButton));
};

var _default = BaseTool;
exports.default = _default;
const DevtoolsContext = /*#__PURE__*/(0, _react.createContext)({});
exports.DevtoolsContext = DevtoolsContext;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCYXNlVG9vbCIsImNsYXNzTmFtZSIsImFjdGlvbkxhYmVsIiwib25CYWNrIiwib25BY3Rpb24iLCJjaGlsZHJlbiIsIm1lc3NhZ2UiLCJzZXRNZXNzYWdlIiwidXNlU3RhdGUiLCJvbkJhY2tDbGljayIsImFjdGlvbkJ1dHRvbiIsIm9uQWN0aW9uQ2xpY2siLCJ0aGVuIiwibXNnIiwiY2xhc3NOYW1lcyIsIl90IiwiRGV2dG9vbHNDb250ZXh0IiwiY3JlYXRlQ29udGV4dCJdLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvZGV2dG9vbHMvQmFzZVRvb2wudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMiBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgY3JlYXRlQ29udGV4dCwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IFJvb20gfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5cbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IHsgWE9SIH0gZnJvbSBcIi4uLy4uLy4uLy4uL0B0eXBlcy9jb21tb25cIjtcbmltcG9ydCB7IFRvb2wgfSBmcm9tIFwiLi4vRGV2dG9vbHNEaWFsb2dcIjtcblxuZXhwb3J0IGludGVyZmFjZSBJRGV2dG9vbHNQcm9wcyB7XG4gICAgb25CYWNrKCk6IHZvaWQ7XG4gICAgc2V0VG9vbChsYWJlbDogc3RyaW5nLCB0b29sOiBUb29sKTogdm9pZDtcbn1cblxuaW50ZXJmYWNlIElNaW5Qcm9wcyBleHRlbmRzIFBpY2s8SURldnRvb2xzUHJvcHMsIFwib25CYWNrXCI+IHtcbiAgICBjbGFzc05hbWU/OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBJUHJvcHMgZXh0ZW5kcyBJTWluUHJvcHMge1xuICAgIGFjdGlvbkxhYmVsOiBzdHJpbmc7XG4gICAgb25BY3Rpb24oKTogUHJvbWlzZTxzdHJpbmcgfCB2b2lkPjtcbn1cblxuY29uc3QgQmFzZVRvb2w6IFJlYWN0LkZDPFhPUjxJTWluUHJvcHMsIElQcm9wcz4+ID0gKHsgY2xhc3NOYW1lLCBhY3Rpb25MYWJlbCwgb25CYWNrLCBvbkFjdGlvbiwgY2hpbGRyZW4gfSkgPT4ge1xuICAgIGNvbnN0IFttZXNzYWdlLCBzZXRNZXNzYWdlXSA9IHVzZVN0YXRlPHN0cmluZz4obnVsbCk7XG5cbiAgICBjb25zdCBvbkJhY2tDbGljayA9ICgpID0+IHtcbiAgICAgICAgaWYgKG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIHNldE1lc3NhZ2UobnVsbCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvbkJhY2soKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBsZXQgYWN0aW9uQnV0dG9uOiBKU1guRWxlbWVudDtcbiAgICBpZiAobWVzc2FnZSkge1xuICAgICAgICBjaGlsZHJlbiA9IG1lc3NhZ2U7XG4gICAgfSBlbHNlIGlmIChvbkFjdGlvbikge1xuICAgICAgICBjb25zdCBvbkFjdGlvbkNsaWNrID0gKCkgPT4ge1xuICAgICAgICAgICAgb25BY3Rpb24oKS50aGVuKChtc2cpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG1zZyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgICAgICBzZXRNZXNzYWdlKG1zZyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgYWN0aW9uQnV0dG9uID0gKFxuICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXtvbkFjdGlvbkNsaWNrfT5cbiAgICAgICAgICAgICAgICB7IGFjdGlvbkxhYmVsIH1cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiA8PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X0RldlRvb2xzX2NvbnRlbnRcIiwgY2xhc3NOYW1lKX0+XG4gICAgICAgICAgICB7IGNoaWxkcmVuIH1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2J1dHRvbnNcIj5cbiAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17b25CYWNrQ2xpY2t9PlxuICAgICAgICAgICAgICAgIHsgX3QoXCJCYWNrXCIpIH1cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgeyBhY3Rpb25CdXR0b24gfVxuICAgICAgICA8L2Rpdj5cbiAgICA8Lz47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBCYXNlVG9vbDtcblxuaW50ZXJmYWNlIElDb250ZXh0IHtcbiAgICByb29tOiBSb29tO1xufVxuXG5leHBvcnQgY29uc3QgRGV2dG9vbHNDb250ZXh0ID0gY3JlYXRlQ29udGV4dDxJQ29udGV4dD4oe30gYXMgSUNvbnRleHQpO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBRUE7Ozs7OztBQXBCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUF3QkEsTUFBTUEsUUFBMEMsR0FBRyxRQUE0RDtFQUFBLElBQTNEO0lBQUVDLFNBQUY7SUFBYUMsV0FBYjtJQUEwQkMsTUFBMUI7SUFBa0NDLFFBQWxDO0lBQTRDQztFQUE1QyxDQUEyRDtFQUMzRyxNQUFNLENBQUNDLE9BQUQsRUFBVUMsVUFBVixJQUF3QixJQUFBQyxlQUFBLEVBQWlCLElBQWpCLENBQTlCOztFQUVBLE1BQU1DLFdBQVcsR0FBRyxNQUFNO0lBQ3RCLElBQUlILE9BQUosRUFBYTtNQUNUQyxVQUFVLENBQUMsSUFBRCxDQUFWO0lBQ0gsQ0FGRCxNQUVPO01BQ0hKLE1BQU07SUFDVDtFQUNKLENBTkQ7O0VBUUEsSUFBSU8sWUFBSjs7RUFDQSxJQUFJSixPQUFKLEVBQWE7SUFDVEQsUUFBUSxHQUFHQyxPQUFYO0VBQ0gsQ0FGRCxNQUVPLElBQUlGLFFBQUosRUFBYztJQUNqQixNQUFNTyxhQUFhLEdBQUcsTUFBTTtNQUN4QlAsUUFBUSxHQUFHUSxJQUFYLENBQWlCQyxHQUFELElBQVM7UUFDckIsSUFBSSxPQUFPQSxHQUFQLEtBQWUsUUFBbkIsRUFBNkI7VUFDekJOLFVBQVUsQ0FBQ00sR0FBRCxDQUFWO1FBQ0g7TUFDSixDQUpEO0lBS0gsQ0FORDs7SUFRQUgsWUFBWSxnQkFDUjtNQUFRLE9BQU8sRUFBRUM7SUFBakIsR0FDTVQsV0FETixDQURKO0VBS0g7O0VBRUQsb0JBQU8seUVBQ0g7SUFBSyxTQUFTLEVBQUUsSUFBQVksbUJBQUEsRUFBVyxxQkFBWCxFQUFrQ2IsU0FBbEM7RUFBaEIsR0FDTUksUUFETixDQURHLGVBSUg7SUFBSyxTQUFTLEVBQUM7RUFBZixnQkFDSTtJQUFRLE9BQU8sRUFBRUk7RUFBakIsR0FDTSxJQUFBTSxtQkFBQSxFQUFHLE1BQUgsQ0FETixDQURKLEVBSU1MLFlBSk4sQ0FKRyxDQUFQO0FBV0gsQ0F6Q0Q7O2VBMkNlVixROztBQU1SLE1BQU1nQixlQUFlLGdCQUFHLElBQUFDLG9CQUFBLEVBQXdCLEVBQXhCLENBQXhCIn0=