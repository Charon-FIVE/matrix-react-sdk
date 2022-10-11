"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.AVATAR_SIZE = void 0;

var _classnames = _interopRequireDefault(require("classnames"));

var _event = require("matrix-js-sdk/src/@types/event");

var _react = _interopRequireWildcard(require("react"));

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _RoomContext = _interopRequireDefault(require("../../../contexts/RoomContext"));

var _useTimeout = require("../../../hooks/useTimeout");

var _BrowserWorkarounds = require("../../../utils/BrowserWorkarounds");

var _AccessibleButton = _interopRequireDefault(require("./AccessibleButton"));

var _Spinner = _interopRequireDefault(require("./Spinner"));

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
const AVATAR_SIZE = 52;
exports.AVATAR_SIZE = AVATAR_SIZE;

const MiniAvatarUploader = _ref => {
  let {
    hasAvatar,
    hasAvatarLabel,
    noAvatarLabel,
    setAvatarUrl,
    isUserAvatar,
    children,
    onClick
  } = _ref;
  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const [busy, setBusy] = (0, _react.useState)(false);
  const [hover, setHover] = (0, _react.useState)(false);
  const [show, setShow] = (0, _react.useState)(false);
  (0, _useTimeout.useTimeout)(() => {
    setShow(true);
  }, 3000); // show after 3 seconds

  (0, _useTimeout.useTimeout)(() => {
    setShow(false);
  }, 13000); // hide after being shown for 10 seconds

  const uploadRef = (0, _react.useRef)();
  const label = hasAvatar || busy ? hasAvatarLabel : noAvatarLabel;
  const {
    room
  } = (0, _react.useContext)(_RoomContext.default);
  const canSetAvatar = isUserAvatar || room?.currentState?.maySendStateEvent(_event.EventType.RoomAvatar, cli.getUserId());
  if (!canSetAvatar) return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, children);
  const visible = !!label && (hover || show);
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("input", {
    type: "file",
    ref: uploadRef,
    className: "mx_MiniAvatarUploader_input",
    onClick: ev => {
      (0, _BrowserWorkarounds.chromeFileInputFix)(ev);
      onClick?.(ev);
    },
    onChange: async ev => {
      if (!ev.target.files?.length) return;
      setBusy(true);
      const file = ev.target.files[0];
      const uri = await cli.uploadContent(file);
      await setAvatarUrl(uri);
      setBusy(false);
    },
    accept: "image/*"
  }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
    className: (0, _classnames.default)("mx_MiniAvatarUploader", {
      mx_MiniAvatarUploader_busy: busy,
      mx_MiniAvatarUploader_hasAvatar: hasAvatar
    }),
    disabled: busy,
    onClick: () => {
      uploadRef.current.click();
    },
    onMouseOver: () => setHover(true),
    onMouseLeave: () => setHover(false)
  }, children, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_MiniAvatarUploader_indicator"
  }, busy ? /*#__PURE__*/_react.default.createElement(_Spinner.default, {
    w: 20,
    h: 20
  }) : /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_MiniAvatarUploader_cameraIcon"
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _classnames.default)("mx_Tooltip", {
      "mx_Tooltip_visible": visible,
      "mx_Tooltip_invisible": !visible
    })
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_Tooltip_chevron"
  }), label)));
};

var _default = MiniAvatarUploader;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBVkFUQVJfU0laRSIsIk1pbmlBdmF0YXJVcGxvYWRlciIsImhhc0F2YXRhciIsImhhc0F2YXRhckxhYmVsIiwibm9BdmF0YXJMYWJlbCIsInNldEF2YXRhclVybCIsImlzVXNlckF2YXRhciIsImNoaWxkcmVuIiwib25DbGljayIsImNsaSIsInVzZUNvbnRleHQiLCJNYXRyaXhDbGllbnRDb250ZXh0IiwiYnVzeSIsInNldEJ1c3kiLCJ1c2VTdGF0ZSIsImhvdmVyIiwic2V0SG92ZXIiLCJzaG93Iiwic2V0U2hvdyIsInVzZVRpbWVvdXQiLCJ1cGxvYWRSZWYiLCJ1c2VSZWYiLCJsYWJlbCIsInJvb20iLCJSb29tQ29udGV4dCIsImNhblNldEF2YXRhciIsImN1cnJlbnRTdGF0ZSIsIm1heVNlbmRTdGF0ZUV2ZW50IiwiRXZlbnRUeXBlIiwiUm9vbUF2YXRhciIsImdldFVzZXJJZCIsInZpc2libGUiLCJldiIsImNocm9tZUZpbGVJbnB1dEZpeCIsInRhcmdldCIsImZpbGVzIiwibGVuZ3RoIiwiZmlsZSIsInVyaSIsInVwbG9hZENvbnRlbnQiLCJjbGFzc05hbWVzIiwibXhfTWluaUF2YXRhclVwbG9hZGVyX2J1c3kiLCJteF9NaW5pQXZhdGFyVXBsb2FkZXJfaGFzQXZhdGFyIiwiY3VycmVudCIsImNsaWNrIl0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvTWluaUF2YXRhclVwbG9hZGVyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCB7IEV2ZW50VHlwZSB9IGZyb20gJ21hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9ldmVudCc7XG5pbXBvcnQgUmVhY3QsIHsgdXNlQ29udGV4dCwgdXNlUmVmLCB1c2VTdGF0ZSwgTW91c2VFdmVudCB9IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0IE1hdHJpeENsaWVudENvbnRleHQgZnJvbSBcIi4uLy4uLy4uL2NvbnRleHRzL01hdHJpeENsaWVudENvbnRleHRcIjtcbmltcG9ydCBSb29tQ29udGV4dCBmcm9tIFwiLi4vLi4vLi4vY29udGV4dHMvUm9vbUNvbnRleHRcIjtcbmltcG9ydCB7IHVzZVRpbWVvdXQgfSBmcm9tIFwiLi4vLi4vLi4vaG9va3MvdXNlVGltZW91dFwiO1xuaW1wb3J0IHsgVHJhbnNsYXRlZFN0cmluZyB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgeyBjaHJvbWVGaWxlSW5wdXRGaXggfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvQnJvd3Nlcldvcmthcm91bmRzXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgU3Bpbm5lciBmcm9tIFwiLi9TcGlubmVyXCI7XG5cbmV4cG9ydCBjb25zdCBBVkFUQVJfU0laRSA9IDUyO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBoYXNBdmF0YXI6IGJvb2xlYW47XG4gICAgbm9BdmF0YXJMYWJlbD86IFRyYW5zbGF0ZWRTdHJpbmc7XG4gICAgaGFzQXZhdGFyTGFiZWw/OiBUcmFuc2xhdGVkU3RyaW5nO1xuICAgIHNldEF2YXRhclVybCh1cmw6IHN0cmluZyk6IFByb21pc2U8dW5rbm93bj47XG4gICAgaXNVc2VyQXZhdGFyPzogYm9vbGVhbjtcbiAgICBvbkNsaWNrPyhldjogTW91c2VFdmVudDxIVE1MSW5wdXRFbGVtZW50Pik6IHZvaWQ7XG59XG5cbmNvbnN0IE1pbmlBdmF0YXJVcGxvYWRlcjogUmVhY3QuRkM8SVByb3BzPiA9ICh7XG4gICAgaGFzQXZhdGFyLCBoYXNBdmF0YXJMYWJlbCwgbm9BdmF0YXJMYWJlbCwgc2V0QXZhdGFyVXJsLCBpc1VzZXJBdmF0YXIsIGNoaWxkcmVuLCBvbkNsaWNrLFxufSkgPT4ge1xuICAgIGNvbnN0IGNsaSA9IHVzZUNvbnRleHQoTWF0cml4Q2xpZW50Q29udGV4dCk7XG4gICAgY29uc3QgW2J1c3ksIHNldEJ1c3ldID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFtob3Zlciwgc2V0SG92ZXJdID0gdXNlU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IFtzaG93LCBzZXRTaG93XSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICAgIHVzZVRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBzZXRTaG93KHRydWUpO1xuICAgIH0sIDMwMDApOyAvLyBzaG93IGFmdGVyIDMgc2Vjb25kc1xuICAgIHVzZVRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBzZXRTaG93KGZhbHNlKTtcbiAgICB9LCAxMzAwMCk7IC8vIGhpZGUgYWZ0ZXIgYmVpbmcgc2hvd24gZm9yIDEwIHNlY29uZHNcblxuICAgIGNvbnN0IHVwbG9hZFJlZiA9IHVzZVJlZjxIVE1MSW5wdXRFbGVtZW50PigpO1xuXG4gICAgY29uc3QgbGFiZWwgPSAoaGFzQXZhdGFyIHx8IGJ1c3kpID8gaGFzQXZhdGFyTGFiZWwgOiBub0F2YXRhckxhYmVsO1xuXG4gICAgY29uc3QgeyByb29tIH0gPSB1c2VDb250ZXh0KFJvb21Db250ZXh0KTtcbiAgICBjb25zdCBjYW5TZXRBdmF0YXIgPSBpc1VzZXJBdmF0YXIgfHwgcm9vbT8uY3VycmVudFN0YXRlPy5tYXlTZW5kU3RhdGVFdmVudChFdmVudFR5cGUuUm9vbUF2YXRhciwgY2xpLmdldFVzZXJJZCgpKTtcbiAgICBpZiAoIWNhblNldEF2YXRhcikgcmV0dXJuIDxSZWFjdC5GcmFnbWVudD57IGNoaWxkcmVuIH08L1JlYWN0LkZyYWdtZW50PjtcblxuICAgIGNvbnN0IHZpc2libGUgPSAhIWxhYmVsICYmIChob3ZlciB8fCBzaG93KTtcbiAgICByZXR1cm4gPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIHR5cGU9XCJmaWxlXCJcbiAgICAgICAgICAgIHJlZj17dXBsb2FkUmVmfVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTWluaUF2YXRhclVwbG9hZGVyX2lucHV0XCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eyhldikgPT4ge1xuICAgICAgICAgICAgICAgIGNocm9tZUZpbGVJbnB1dEZpeChldik7XG4gICAgICAgICAgICAgICAgb25DbGljaz8uKGV2KTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBvbkNoYW5nZT17YXN5bmMgKGV2KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFldi50YXJnZXQuZmlsZXM/Lmxlbmd0aCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIHNldEJ1c3kodHJ1ZSk7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlsZSA9IGV2LnRhcmdldC5maWxlc1swXTtcbiAgICAgICAgICAgICAgICBjb25zdCB1cmkgPSBhd2FpdCBjbGkudXBsb2FkQ29udGVudChmaWxlKTtcbiAgICAgICAgICAgICAgICBhd2FpdCBzZXRBdmF0YXJVcmwodXJpKTtcbiAgICAgICAgICAgICAgICBzZXRCdXN5KGZhbHNlKTtcbiAgICAgICAgICAgIH19XG4gICAgICAgICAgICBhY2NlcHQ9XCJpbWFnZS8qXCJcbiAgICAgICAgLz5cblxuICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWVzKFwibXhfTWluaUF2YXRhclVwbG9hZGVyXCIsIHtcbiAgICAgICAgICAgICAgICBteF9NaW5pQXZhdGFyVXBsb2FkZXJfYnVzeTogYnVzeSxcbiAgICAgICAgICAgICAgICBteF9NaW5pQXZhdGFyVXBsb2FkZXJfaGFzQXZhdGFyOiBoYXNBdmF0YXIsXG4gICAgICAgICAgICB9KX1cbiAgICAgICAgICAgIGRpc2FibGVkPXtidXN5fVxuICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgIHVwbG9hZFJlZi5jdXJyZW50LmNsaWNrKCk7XG4gICAgICAgICAgICB9fVxuICAgICAgICAgICAgb25Nb3VzZU92ZXI9eygpID0+IHNldEhvdmVyKHRydWUpfVxuICAgICAgICAgICAgb25Nb3VzZUxlYXZlPXsoKSA9PiBzZXRIb3ZlcihmYWxzZSl9XG4gICAgICAgID5cbiAgICAgICAgICAgIHsgY2hpbGRyZW4gfVxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X01pbmlBdmF0YXJVcGxvYWRlcl9pbmRpY2F0b3JcIj5cbiAgICAgICAgICAgICAgICB7IGJ1c3kgP1xuICAgICAgICAgICAgICAgICAgICA8U3Bpbm5lciB3PXsyMH0gaD17MjB9IC8+IDpcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NaW5pQXZhdGFyVXBsb2FkZXJfY2FtZXJhSWNvblwiIC8+IH1cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X1Rvb2x0aXBcIiwge1xuICAgICAgICAgICAgICAgIFwibXhfVG9vbHRpcF92aXNpYmxlXCI6IHZpc2libGUsXG4gICAgICAgICAgICAgICAgXCJteF9Ub29sdGlwX2ludmlzaWJsZVwiOiAhdmlzaWJsZSxcbiAgICAgICAgICAgIH0pfT5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Rvb2x0aXBfY2hldnJvblwiIC8+XG4gICAgICAgICAgICAgICAgeyBsYWJlbCB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgIDwvUmVhY3QuRnJhZ21lbnQ+O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgTWluaUF2YXRhclVwbG9hZGVyO1xuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7Ozs7OztBQTFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFjTyxNQUFNQSxXQUFXLEdBQUcsRUFBcEI7OztBQVdQLE1BQU1DLGtCQUFvQyxHQUFHLFFBRXZDO0VBQUEsSUFGd0M7SUFDMUNDLFNBRDBDO0lBQy9CQyxjQUQrQjtJQUNmQyxhQURlO0lBQ0FDLFlBREE7SUFDY0MsWUFEZDtJQUM0QkMsUUFENUI7SUFDc0NDO0VBRHRDLENBRXhDO0VBQ0YsTUFBTUMsR0FBRyxHQUFHLElBQUFDLGlCQUFBLEVBQVdDLDRCQUFYLENBQVo7RUFDQSxNQUFNLENBQUNDLElBQUQsRUFBT0MsT0FBUCxJQUFrQixJQUFBQyxlQUFBLEVBQVMsS0FBVCxDQUF4QjtFQUNBLE1BQU0sQ0FBQ0MsS0FBRCxFQUFRQyxRQUFSLElBQW9CLElBQUFGLGVBQUEsRUFBUyxLQUFULENBQTFCO0VBQ0Es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