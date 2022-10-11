"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.E2EState = void 0;

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _languageHandler = require("../../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _Tooltip = _interopRequireDefault(require("../elements/Tooltip"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
Copyright 2019 New Vector Ltd
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
let E2EState;
exports.E2EState = E2EState;

(function (E2EState) {
  E2EState["Verified"] = "verified";
  E2EState["Warning"] = "warning";
  E2EState["Unknown"] = "unknown";
  E2EState["Normal"] = "normal";
  E2EState["Unauthenticated"] = "unauthenticated";
})(E2EState || (exports.E2EState = E2EState = {}));

const crossSigningUserTitles = {
  [E2EState.Warning]: (0, _languageHandler._td)("This user has not verified all of their sessions."),
  [E2EState.Normal]: (0, _languageHandler._td)("You have not verified this user."),
  [E2EState.Verified]: (0, _languageHandler._td)("You have verified this user. This user has verified all of their sessions.")
};
const crossSigningRoomTitles = {
  [E2EState.Warning]: (0, _languageHandler._td)("Someone is using an unknown session"),
  [E2EState.Normal]: (0, _languageHandler._td)("This room is end-to-end encrypted"),
  [E2EState.Verified]: (0, _languageHandler._td)("Everyone in this room is verified")
};

const E2EIcon = _ref => {
  let {
    isUser,
    status,
    className,
    size,
    onClick,
    hideTooltip,
    bordered
  } = _ref;
  const [hover, setHover] = (0, _react.useState)(false);
  const classes = (0, _classnames.default)({
    mx_E2EIcon: true,
    mx_E2EIcon_bordered: bordered,
    mx_E2EIcon_warning: status === E2EState.Warning,
    mx_E2EIcon_normal: status === E2EState.Normal,
    mx_E2EIcon_verified: status === E2EState.Verified
  }, className);
  let e2eTitle;

  if (isUser) {
    e2eTitle = crossSigningUserTitles[status];
  } else {
    e2eTitle = crossSigningRoomTitles[status];
  }

  let style;

  if (size) {
    style = {
      width: `${size}px`,
      height: `${size}px`
    };
  }

  const onMouseOver = () => setHover(true);

  const onMouseLeave = () => setHover(false);

  let tip;

  if (hover && !hideTooltip) {
    tip = /*#__PURE__*/_react.default.createElement(_Tooltip.default, {
      label: e2eTitle ? (0, _languageHandler._t)(e2eTitle) : ""
    });
  }

  if (onClick) {
    return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: onClick,
      onMouseOver: onMouseOver,
      onMouseLeave: onMouseLeave,
      className: classes,
      style: style
    }, tip);
  }

  return /*#__PURE__*/_react.default.createElement("div", {
    onMouseOver: onMouseOver,
    onMouseLeave: onMouseLeave,
    className: classes,
    style: style
  }, tip);
};

var _default = E2EIcon;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFMkVTdGF0ZSIsImNyb3NzU2lnbmluZ1VzZXJUaXRsZXMiLCJXYXJuaW5nIiwiX3RkIiwiTm9ybWFsIiwiVmVyaWZpZWQiLCJjcm9zc1NpZ25pbmdSb29tVGl0bGVzIiwiRTJFSWNvbiIsImlzVXNlciIsInN0YXR1cyIsImNsYXNzTmFtZSIsInNpemUiLCJvbkNsaWNrIiwiaGlkZVRvb2x0aXAiLCJib3JkZXJlZCIsImhvdmVyIiwic2V0SG92ZXIiLCJ1c2VTdGF0ZSIsImNsYXNzZXMiLCJjbGFzc05hbWVzIiwibXhfRTJFSWNvbiIsIm14X0UyRUljb25fYm9yZGVyZWQiLCJteF9FMkVJY29uX3dhcm5pbmciLCJteF9FMkVJY29uX25vcm1hbCIsIm14X0UyRUljb25fdmVyaWZpZWQiLCJlMmVUaXRsZSIsInN0eWxlIiwid2lkdGgiLCJoZWlnaHQiLCJvbk1vdXNlT3ZlciIsIm9uTW91c2VMZWF2ZSIsInRpcCIsIl90Il0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3Mvcm9vbXMvRTJFSWNvbi50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbmltcG9ydCB7IF90LCBfdGQgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCBUb29sdGlwIGZyb20gXCIuLi9lbGVtZW50cy9Ub29sdGlwXCI7XG5pbXBvcnQgeyBFMkVTdGF0dXMgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvU2hpZWxkVXRpbHNcIjtcblxuZXhwb3J0IGVudW0gRTJFU3RhdGUge1xuICAgIFZlcmlmaWVkID0gXCJ2ZXJpZmllZFwiLFxuICAgIFdhcm5pbmcgPSBcIndhcm5pbmdcIixcbiAgICBVbmtub3duID0gXCJ1bmtub3duXCIsXG4gICAgTm9ybWFsID0gXCJub3JtYWxcIixcbiAgICBVbmF1dGhlbnRpY2F0ZWQgPSBcInVuYXV0aGVudGljYXRlZFwiLFxufVxuXG5jb25zdCBjcm9zc1NpZ25pbmdVc2VyVGl0bGVzOiB7IFtrZXkgaW4gRTJFU3RhdGVdPzogc3RyaW5nIH0gPSB7XG4gICAgW0UyRVN0YXRlLldhcm5pbmddOiBfdGQoXCJUaGlzIHVzZXIgaGFzIG5vdCB2ZXJpZmllZCBhbGwgb2YgdGhlaXIgc2Vzc2lvbnMuXCIpLFxuICAgIFtFMkVTdGF0ZS5Ob3JtYWxdOiBfdGQoXCJZb3UgaGF2ZSBub3QgdmVyaWZpZWQgdGhpcyB1c2VyLlwiKSxcbiAgICBbRTJFU3RhdGUuVmVyaWZpZWRdOiBfdGQoXCJZb3UgaGF2ZSB2ZXJpZmllZCB0aGlzIHVzZXIuIFRoaXMgdXNlciBoYXMgdmVyaWZpZWQgYWxsIG9mIHRoZWlyIHNlc3Npb25zLlwiKSxcbn07XG5jb25zdCBjcm9zc1NpZ25pbmdSb29tVGl0bGVzOiB7IFtrZXkgaW4gRTJFU3RhdGVdPzogc3RyaW5nIH0gPSB7XG4gICAgW0UyRVN0YXRlLldhcm5pbmddOiBfdGQoXCJTb21lb25lIGlzIHVzaW5nIGFuIHVua25vd24gc2Vzc2lvblwiKSxcbiAgICBbRTJFU3RhdGUuTm9ybWFsXTogX3RkKFwiVGhpcyByb29tIGlzIGVuZC10by1lbmQgZW5jcnlwdGVkXCIpLFxuICAgIFtFMkVTdGF0ZS5WZXJpZmllZF06IF90ZChcIkV2ZXJ5b25lIGluIHRoaXMgcm9vbSBpcyB2ZXJpZmllZFwiKSxcbn07XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIGlzVXNlcj86IGJvb2xlYW47XG4gICAgc3RhdHVzPzogRTJFU3RhdGUgfCBFMkVTdGF0dXM7XG4gICAgY2xhc3NOYW1lPzogc3RyaW5nO1xuICAgIHNpemU/OiBudW1iZXI7XG4gICAgb25DbGljaz86ICgpID0+IHZvaWQ7XG4gICAgaGlkZVRvb2x0aXA/OiBib29sZWFuO1xuICAgIGJvcmRlcmVkPzogYm9vbGVhbjtcbn1cblxuY29uc3QgRTJFSWNvbjogUmVhY3QuRkM8SVByb3BzPiA9ICh7IGlzVXNlciwgc3RhdHVzLCBjbGFzc05hbWUsIHNpemUsIG9uQ2xpY2ssIGhpZGVUb29sdGlwLCBib3JkZXJlZCB9KSA9PiB7XG4gICAgY29uc3QgW2hvdmVyLCBzZXRIb3Zlcl0gPSB1c2VTdGF0ZShmYWxzZSk7XG5cbiAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgIG14X0UyRUljb246IHRydWUsXG4gICAgICAgIG14X0UyRUljb25fYm9yZGVyZWQ6IGJvcmRlcmVkLFxuICAgICAgICBteF9FMkVJY29uX3dhcm5pbmc6IHN0YXR1cyA9PT0gRTJFU3RhdGUuV2FybmluZyxcbiAgICAgICAgbXhfRTJFSWNvbl9ub3JtYWw6IHN0YXR1cyA9PT0gRTJFU3RhdGUuTm9ybWFsLFxuICAgICAgICBteF9FMkVJY29uX3ZlcmlmaWVkOiBzdGF0dXMgPT09IEUyRVN0YXRlLlZlcmlmaWVkLFxuICAgIH0sIGNsYXNzTmFtZSk7XG5cbiAgICBsZXQgZTJlVGl0bGU7XG4gICAgaWYgKGlzVXNlcikge1xuICAgICAgICBlMmVUaXRsZSA9IGNyb3NzU2lnbmluZ1VzZXJUaXRsZXNbc3RhdHVzXTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBlMmVUaXRsZSA9IGNyb3NzU2lnbmluZ1Jvb21UaXRsZXNbc3RhdHVzXTtcbiAgICB9XG5cbiAgICBsZXQgc3R5bGU7XG4gICAgaWYgKHNpemUpIHtcbiAgICAgICAgc3R5bGUgPSB7IHdpZHRoOiBgJHtzaXplfXB4YCwgaGVpZ2h0OiBgJHtzaXplfXB4YCB9O1xuICAgIH1cblxuICAgIGNvbnN0IG9uTW91c2VPdmVyID0gKCkgPT4gc2V0SG92ZXIodHJ1ZSk7XG4gICAgY29uc3Qgb25Nb3VzZUxlYXZlID0gKCkgPT4gc2V0SG92ZXIoZmFsc2UpO1xuXG4gICAgbGV0IHRpcDtcbiAgICBpZiAoaG92ZXIgJiYgIWhpZGVUb29sdGlwKSB7XG4gICAgICAgIHRpcCA9IDxUb29sdGlwIGxhYmVsPXtlMmVUaXRsZSA/IF90KGUyZVRpdGxlKSA6IFwiXCJ9IC8+O1xuICAgIH1cblxuICAgIGlmIChvbkNsaWNrKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICAgICAgICAgICAgb25Nb3VzZU92ZXI9e29uTW91c2VPdmVyfVxuICAgICAgICAgICAgICAgIG9uTW91c2VMZWF2ZT17b25Nb3VzZUxlYXZlfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3Nlc31cbiAgICAgICAgICAgICAgICBzdHlsZT17c3R5bGV9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyB0aXAgfVxuICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiA8ZGl2IG9uTW91c2VPdmVyPXtvbk1vdXNlT3Zlcn0gb25Nb3VzZUxlYXZlPXtvbk1vdXNlTGVhdmV9IGNsYXNzTmFtZT17Y2xhc3Nlc30gc3R5bGU9e3N0eWxlfT5cbiAgICAgICAgeyB0aXAgfVxuICAgIDwvZGl2Pjtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEUyRUljb247XG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7Ozs7O0FBdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBVVlBLFE7OztXQUFBQSxRO0VBQUFBLFE7RUFBQUEsUTtFQUFBQSxRO0VBQUFBLFE7RUFBQUEsUTtHQUFBQSxRLHdCQUFBQSxROztBQVFaLE1BQU1DLHNCQUFzRCxHQUFHO0VBQzNELENBQUNELFFBQVEsQ0FBQ0UsT0FBVixHQUFvQixJQUFBQyxvQkFBQSxFQUFJLG1EQUFKLENBRHVDO0VBRTNELENBQUNILFFBQVEsQ0FBQ0ksTUFBVixHQUFtQixJQUFBRCxvQkFBQSxFQUFJLGtDQUFKLENBRndDO0VBRzNELENBQUNILFFBQVEsQ0FBQ0ssUUFBVixHQUFxQixJQUFBRixvQkFBQSxFQUFJLDRFQUFKO0FBSHNDLENBQS9EO0FBS0EsTUFBTUcsc0JBQXNELEdBQUc7RUFDM0QsQ0FBQ04sUUFBUSxDQUFDRSxPQUFWLEdBQW9CLElBQUFDLG9CQUFBLEVBQUkscUNBQUosQ0FEdUM7RUFFM0QsQ0FBQ0gsUUFBUSxDQUFDSSxNQUFWLEdBQW1CLElBQUFELG9CQUFBLEVBQUksbUNBQUosQ0FGd0M7RUFHM0QsQ0FBQ0gsUUFBUSxDQUFDSyxRQUFWLEdBQXFCLElBQUFGLG9CQUFBLEVBQUksbUNBQUo7QUFIc0MsQ0FBL0Q7O0FBZ0JBLE1BQU1JLE9BQXlCLEdBQUcsUUFBeUU7RUFBQSxJQUF4RTtJQUFFQyxNQUFGO0lBQVVDLE1BQVY7SUFBa0JDLFNBQWxCO0lBQTZCQyxJQUE3QjtJQUFtQ0MsT0FBbkM7SUFBNENDLFdBQTVDO0lBQXlEQztFQUF6RCxDQUF3RTtFQUN2RyxNQUFNLENBQUNDLEtBQUQsRUFBUUMsUUFBUixJQUFvQixJQUFBQyxlQUFBLEVBQVMsS0FBVCxDQUExQjtFQUVBLE1BQU1DLE9BQU8sR0FBRyxJQUFBQyxtQkFBQSxFQUFXO0lBQ3ZCQyxVQUFVLEVBQUUsSUFEVztJQUV2QkMsbUJBQW1CLEVBQUVQLFFBRkU7SUFHdkJRLGtCQUFrQixFQUFFYixNQUFNLEtBQUtULFFBQVEsQ0FBQ0UsT0FIakI7SUFJdkJxQixpQkFBaUIsRUFBRWQsTUFBTSxLQUFLVCxRQUFRLENBQUNJLE1BSmhCO0lBS3ZCb0IsbUJBQW1CLEVBQUVmLE1BQU0sS0FBS1QsUUFBUSxDQUFDSztFQUxsQixDQUFYLEVBTWJLLFNBTmEsQ0FBaEI7RUFRQSxJQUFJZSxRQUFKOztFQUNBLElBQUlqQixNQUFKLEVBQVk7SUFDUmlCLFFBQVEsR0FBR3hCLHNCQUFzQixDQUFDUSxNQUFELENBQWpDO0VBQ0gsQ0FGRCxNQUVPO0lBQ0hnQixRQUFRLEdBQUduQixzQkFBc0IsQ0FBQ0csTUFBRCxDQUFqQztFQUNIOztFQUVELElBQUlpQixLQUFKOztFQUNBLElBQUlmLElBQUosRUFBVTtJQUNOZSxLQUFLLEdBQUc7TUFBRUMsS0FBSyxFQUFHLEdBQUVoQixJQUFLLElBQWpCO01BQXNCaUIsTUFBTSxFQUFHLEdBQUVqQixJQUFLO0lBQXRDLENBQVI7RUFDSDs7RUFFRCxNQUFNa0IsV0FBVyxHQUFHLE1BQU1iLFFBQVEsQ0FBQyxJQUFELENBQWxDOztFQUNBLE1BQU1jLFlBQVksR0FBRyxNQUFNZCxRQUFRLENBQUMsS0FBRCxDQUFuQzs7RUFFQSxJQUFJZSxHQUFKOztFQUNBLElBQUloQixLQUFLLElBQUksQ0FBQ0YsV0FBZCxFQUEyQjtJQUN2QmtCLEdBQUcsZ0JBQUcsNkJBQUMsZ0JBQUQ7TUFBUyxLQUFLLEVBQUVOLFFBQVEsR0FBRyxJQUFBTyxtQkFBQSxFQUFHUCxRQUFILENBQUgsR0FBa0I7SUFBMUMsRUFBTjtFQUNIOztFQUVELElBQUliLE9BQUosRUFBYTtJQUNULG9CQUNJLDZCQUFDLHlCQUFEO01BQ0ksT0FBTyxFQUFFQSxPQURiO01BRUksV0FBVyxFQUFFaUIsV0FGakI7TUFHSSxZQUFZLEVBQUVDLFlBSGxCO01BSUksU0FBUyxFQUFFWixPQUpmO01BS0ksS0FBSyxFQUFFUTtJQUxYLEdBT01LLEdBUE4sQ0FESjtFQVdIOztFQUVELG9CQUFPO0lBQUssV0FBVyxFQUFFRixXQUFsQjtJQUErQixZQUFZLEVBQUVDLFlBQTdDO0lBQTJELFNBQVMsRUFBRVosT0FBdEU7SUFBK0UsS0FBSyxFQUFFUTtFQUF0RixHQUNESyxHQURDLENBQVA7QUFHSCxDQWhERDs7ZUFrRGV4QixPIn0=