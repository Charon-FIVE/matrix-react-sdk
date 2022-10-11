"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DeviceType = void 0;

var _react = _interopRequireDefault(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _unknownDevice = require("../../../../../res/img/element-icons/settings/unknown-device.svg");

var _verified = require("../../../../../res/img/e2e/verified.svg");

var _warning = require("../../../../../res/img/e2e/warning.svg");

var _languageHandler = require("../../../../languageHandler");

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
const DeviceType = _ref => {
  let {
    isVerified,
    isSelected
  } = _ref;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: (0, _classnames.default)('mx_DeviceType', {
      mx_DeviceType_selected: isSelected
    })
  }, /*#__PURE__*/_react.default.createElement(_unknownDevice.Icon, {
    className: "mx_DeviceType_deviceIcon",
    role: "img",
    "aria-label": (0, _languageHandler._t)('Unknown device type')
  }), isVerified ? /*#__PURE__*/_react.default.createElement(_verified.Icon, {
    className: (0, _classnames.default)('mx_DeviceType_verificationIcon', 'verified'),
    role: "img",
    "aria-label": (0, _languageHandler._t)('Verified')
  }) : /*#__PURE__*/_react.default.createElement(_warning.Icon, {
    className: (0, _classnames.default)('mx_DeviceType_verificationIcon', 'unverified'),
    role: "img",
    "aria-label": (0, _languageHandler._t)('Unverified')
  }));
};

exports.DeviceType = DeviceType;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZXZpY2VUeXBlIiwiaXNWZXJpZmllZCIsImlzU2VsZWN0ZWQiLCJjbGFzc05hbWVzIiwibXhfRGV2aWNlVHlwZV9zZWxlY3RlZCIsIl90Il0sInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvdmlld3Mvc2V0dGluZ3MvZGV2aWNlcy9EZXZpY2VUeXBlLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjIgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbmltcG9ydCB7IEljb24gYXMgVW5rbm93bkRldmljZUljb24gfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXMvaW1nL2VsZW1lbnQtaWNvbnMvc2V0dGluZ3MvdW5rbm93bi1kZXZpY2Uuc3ZnJztcbmltcG9ydCB7IEljb24gYXMgVmVyaWZpZWRJY29uIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vcmVzL2ltZy9lMmUvdmVyaWZpZWQuc3ZnJztcbmltcG9ydCB7IEljb24gYXMgVW52ZXJpZmllZEljb24gfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9yZXMvaW1nL2UyZS93YXJuaW5nLnN2Zyc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgeyBEZXZpY2VXaXRoVmVyaWZpY2F0aW9uIH0gZnJvbSAnLi90eXBlcyc7XG5cbmludGVyZmFjZSBQcm9wcyB7XG4gICAgaXNWZXJpZmllZD86IERldmljZVdpdGhWZXJpZmljYXRpb25bJ2lzVmVyaWZpZWQnXTtcbiAgICBpc1NlbGVjdGVkPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNvbnN0IERldmljZVR5cGU6IFJlYWN0LkZDPFByb3BzPiA9ICh7IGlzVmVyaWZpZWQsIGlzU2VsZWN0ZWQgfSkgPT4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPXtjbGFzc05hbWVzKCdteF9EZXZpY2VUeXBlJywge1xuICAgICAgICBteF9EZXZpY2VUeXBlX3NlbGVjdGVkOiBpc1NlbGVjdGVkLFxuICAgIH0pfVxuICAgID5cbiAgICAgICAgeyAvKiBUT0RPKGtlcnJ5YSkgYWxsIGRldmljZXMgaGF2ZSBhbiB1bmtub3duIHR5cGUgdW50aWwgUFNHLTY1MCAqLyB9XG4gICAgICAgIDxVbmtub3duRGV2aWNlSWNvblxuICAgICAgICAgICAgY2xhc3NOYW1lPSdteF9EZXZpY2VUeXBlX2RldmljZUljb24nXG4gICAgICAgICAgICByb2xlPSdpbWcnXG4gICAgICAgICAgICBhcmlhLWxhYmVsPXtfdCgnVW5rbm93biBkZXZpY2UgdHlwZScpfVxuICAgICAgICAvPlxuICAgICAgICB7XG4gICAgICAgICAgICBpc1ZlcmlmaWVkXG4gICAgICAgICAgICAgICAgPyA8VmVyaWZpZWRJY29uXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcygnbXhfRGV2aWNlVHlwZV92ZXJpZmljYXRpb25JY29uJywgJ3ZlcmlmaWVkJyl9XG4gICAgICAgICAgICAgICAgICAgIHJvbGU9J2ltZydcbiAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17X3QoJ1ZlcmlmaWVkJyl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA6IDxVbnZlcmlmaWVkSWNvblxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZXMoJ214X0RldmljZVR5cGVfdmVyaWZpY2F0aW9uSWNvbicsICd1bnZlcmlmaWVkJyl9XG4gICAgICAgICAgICAgICAgICAgIHJvbGU9J2ltZydcbiAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17X3QoJ1VudmVyaWZpZWQnKX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICB9XG4gICAgPC9kaXY+KTtcblxuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWdCTyxNQUFNQSxVQUEyQixHQUFHO0VBQUEsSUFBQztJQUFFQyxVQUFGO0lBQWNDO0VBQWQsQ0FBRDtFQUFBLG9CQUN2QztJQUFLLFNBQVMsRUFBRSxJQUFBQyxtQkFBQSxFQUFXLGVBQVgsRUFBNEI7TUFDeENDLHNCQUFzQixFQUFFRjtJQURnQixDQUE1QjtFQUFoQixnQkFLSSw2QkFBQyxtQkFBRDtJQUNJLFNBQVMsRUFBQywwQkFEZDtJQUVJLElBQUksRUFBQyxLQUZUO0lBR0ksY0FBWSxJQUFBRyxtQkFBQSxFQUFHLHFCQUFIO0VBSGhCLEVBTEosRUFXUUosVUFBVSxnQkFDSiw2QkFBQyxjQUFEO0lBQ0UsU0FBUyxFQUFFLElBQUFFLG1CQUFBLEVBQVcsZ0NBQVgsRUFBNkMsVUFBN0MsQ0FEYjtJQUVFLElBQUksRUFBQyxLQUZQO0lBR0UsY0FBWSxJQUFBRSxtQkFBQSxFQUFHLFVBQUg7RUFIZCxFQURJLGdCQU1KLDZCQUFDLGFBQUQ7SUFDRSxTQUFTLEVBQUUsSUFBQUYsbUJBQUEsRUFBVyxnQ0FBWCxFQUE2QyxZQUE3QyxDQURiO0lBRUUsSUFBSSxFQUFDLEtBRlA7SUFHRSxjQUFZLElBQUFFLG1CQUFBLEVBQUcsWUFBSDtFQUhkLEVBakJkLENBRHVDO0FBQUEsQ0FBcEMifQ==